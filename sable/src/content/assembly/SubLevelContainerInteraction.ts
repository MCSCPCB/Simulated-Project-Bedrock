import {
  system,
  world,
  type Dimension,
  type Entity,
  type Player,
  type Vector3
} from "@minecraft/server";
import {
  EPSILON_1E6,
  VANILLA_DIMENSION_IDS,
  squaredDistance
} from "../../util/SableVector3Utils.js";
import type { SubLevelBlock } from "../../sublevel/SubLevel.js";
import { resolveFancySubLevelBlock } from "../../sublevel/render/fancy/model/FancySubLevelModelRegistry.js";
import type { SubLevelInteractionHandle } from "../../sublevel/system/SubLevelInteractionSystem.js";

const STORAGE_ID_PROPERTY = "sable:storage_id";
const STORAGE_OWNER_PROPERTY = "sable:storage_owner";
const STORAGE_LOCATION_PROPERTY = "sable:storage_location";
const POSITION_EPSILON_SQUARED = EPSILON_1E6;
const STORAGE_DETACH_TIMEOUT_TICKS = 20;

export interface SubLevelContainerStorageBinding {
  readonly localLocation: Vector3;
  readonly storageId: string;
}

export interface SubLevelContainerSound {
  readonly id: string;
  readonly pitch: number;
  readonly volume: number;
}

/**
 * Everything one container kind contributes to the shared interaction
 * machinery. The controller itself carries no per-container ids or branches;
 * each container block registers one profile.
 */
export interface SubLevelContainerProfile {
  /** The projected block this container backs. */
  readonly blockTypeId: string;
  /** Fancy model type the projected block must resolve to, when gated. */
  readonly modelType?: string;
  /** The invisible native storage entity kind. */
  readonly storageEntityTypeId: string;
  readonly nameTranslationKey: string;
  readonly containerSize: number;
  /**
   * Height of the storage entity's interaction box. The entity origin sits
   * half of this below the cell center so the box tracks the projected body.
   */
  readonly collisionHeight: number;
  readonly activateEvent: string;
  readonly deactivateEvent: string;
  /** Runtime model-state dimension driven by viewer count, for lidded containers. */
  readonly openStateDimension?: string;
  readonly openSound?: SubLevelContainerSound;
  readonly closeSound?: SubLevelContainerSound & { readonly delayTicks: number };
  /** Retire owner-side state after a storage entity dies natively. */
  onNativeDeath?(ownerId: string, binding: SubLevelContainerStorageBinding): void;
  /** Notify the owner when the storage entity disappears without native death. */
  onUnexpectedRemoval?(ownerId: string, binding: SubLevelContainerStorageBinding): void;
}

interface ContainerStorageRecord {
  active: boolean;
  handle?: SubLevelInteractionHandle;
  attached: boolean;
  claimed: boolean;
  entity?: Entity;
  lastLocation?: Vector3;
  localLocation: Vector3;
  ownerId: string;
  pendingAttachTick: number | undefined;
  readonly previewers: Set<string>;
  profile?: SubLevelContainerProfile;
  readonly storageId: string;
  readonly viewers: Set<string>;
}

/**
 * Owns persistent native container entities while sub-levels own their
 * lifetime. Which blocks count as containers is entirely profile-driven.
 */
export class SubLevelContainerInteractionController {
  readonly #profilesByBlockTypeId = new Map<string, SubLevelContainerProfile>();
  readonly #profilesByEntityTypeId = new Map<string, SubLevelContainerProfile>();
  readonly #activeRecords = new Set<ContainerStorageRecord>();
  readonly #recordByStorageId = new Map<string, ContainerStorageRecord>();
  readonly #recordCountByDimension = new Map<string, number>();
  readonly #storageIdBySubLevelBlock = new Map<string, string>();
  readonly #storageIdByEntityId = new Map<string, string>();
  readonly #previewStorageByPlayer = new Map<string, string>();
  readonly #viewerStorageByPlayer = new Map<string, string>();
  readonly #nativeDeathEntityIds = new Set<string>();
  readonly #settlingEntityIds = new Set<string>();
  #bindingRegistrationComplete = false;
  #started = false;

  /** Register one container kind. Must precede start(). */
  registerContainerProfile(profile: SubLevelContainerProfile): void {
    if (this.#started) {
      throw new Error(`Container profile ${profile.blockTypeId} was registered after start.`);
    }
    if (this.#profilesByBlockTypeId.has(profile.blockTypeId)) {
      throw new Error(`A container profile for ${profile.blockTypeId} is already registered.`);
    }
    if (this.#profilesByEntityTypeId.has(profile.storageEntityTypeId)) {
      throw new Error(`Storage entity ${profile.storageEntityTypeId} already backs another container profile.`);
    }
    this.#profilesByBlockTypeId.set(profile.blockTypeId, profile);
    this.#profilesByEntityTypeId.set(profile.storageEntityTypeId, profile);
  }

  start(): void {
    if (this.#started) return;
    this.#started = true;
    world.beforeEvents.playerInteractWithEntity.subscribe(event => {
      if (!this.#profilesByEntityTypeId.has(event.target.typeId)) return;
      const record = this.#recordForEntity(event.target);
      if (record?.handle?.isValid && record.active) return;
      event.cancel = true;
      // A registered but inactive record is a benign race between deactivation
      // and player input; only a truly unregistered entity indicates a leak.
      if (!record) {
        system.run(() => {
          throw new Error(`Unbound container storage entity ${event.target.id} was interacted with.`);
        });
      }
    });
    world.afterEvents.entityContainerOpened.subscribe(event => {
      if (!this.#profilesByEntityTypeId.has(event.entity.typeId)) return;
      const player = event.openSource.entity;
      if (player?.typeId !== "minecraft:player") return;
      this.#openContainer(player as Player, event.entity);
    });
    world.afterEvents.entityContainerClosed.subscribe(event => {
      if (!this.#profilesByEntityTypeId.has(event.entity.typeId)) return;
      const player = event.closeSource.entity;
      if (player?.typeId !== "minecraft:player") return;
      this.#closeContainer(player.id, event.entity);
    });
    world.beforeEvents.entityHurt.subscribe(event => {
      if (!this.#profilesByEntityTypeId.has(event.hurtEntity.typeId)) return;
      if (this.#settlingEntityIds.has(event.hurtEntity.id)) return;
      event.cancel = true;
    });
    world.afterEvents.entityDie.subscribe(event => {
      if (!this.#profilesByEntityTypeId.has(event.deadEntity.typeId)) return;
      if (
        !this.#settlingEntityIds.has(event.deadEntity.id)
        && this.#storageIdByEntityId.has(event.deadEntity.id)
      ) this.#nativeDeathEntityIds.add(event.deadEntity.id);
      // Native death owns the inventory drop. The script owns the invisible
      // storage entity itself, just as the renderer owns its entities.
      if (event.deadEntity.isValid) event.deadEntity.remove();
    });
    world.afterEvents.entityRemove.subscribe(event => {
      if (!this.#profilesByEntityTypeId.has(event.typeId)) return;
      this.handleEntityRemove(event.removedEntityId);
    });

    // Entity-load events do not replay for entities already loaded with the script.
    system.run(() => {
      for (const dimensionId of VANILLA_DIMENSION_IDS) {
        const dimension = world.getDimension(dimensionId);
        for (const typeId of this.#profilesByEntityTypeId.keys()) {
          for (const entity of dimension.getEntities({ type: typeId })) {
            this.handleEntityLoad(entity);
          }
        }
      }
    });
  }

  canInteract(_handle: SubLevelInteractionHandle, block: SubLevelBlock): boolean {
    const profile = this.#profilesByBlockTypeId.get(block.typeId);
    if (!profile) return false;
    if (profile.modelType === undefined) return true;
    return resolveFancySubLevelBlock(block)?.model.description.type === profile.modelType;
  }

  /** Native entity interaction opens the container; this only consumes sub-level gestures. */
  interact(
    _player: Player,
    handle: SubLevelInteractionHandle,
    block: SubLevelBlock
  ): boolean {
    if (!this.canInteract(handle, block)) return false;
    const record = this.#recordAt(handle, block.localLocation);
    if (!record?.entity?.isValid) {
      throw new Error(`Projected container ${subLevelBlockKey(handle.id, block.localLocation)} has no storage entity.`);
    }
    // The before-item-use callback may run under restricted execution, so it
    // only consumes the container gesture. The existing per-tick preview sync
    // owns native rider detachment, teleportation, and activation.
    return true;
  }

  /** Whether any storage record in a dimension could react to syncTarget. */
  hasSyncTargets(dimensionId?: string): boolean {
    if (dimensionId === undefined) {
      return this.#recordCountByDimension.size > 0 || this.#previewStorageByPlayer.size > 0;
    }
    return (this.#recordCountByDimension.get(dimensionId) ?? 0) > 0;
  }

  syncTarget(
    player: Player,
    handle: SubLevelInteractionHandle | undefined,
    block: SubLevelBlock | undefined
  ): void {
    const next = handle && block && this.canInteract(handle, block)
      ? this.#recordAt(handle, block.localLocation)
      : undefined;
    const previousId = this.#previewStorageByPlayer.get(player.id);
    if (previousId === next?.storageId) return;
    if (previousId) this.#releasePreview(player.id, previousId);
    if (!next?.entity?.isValid) return;
    this.#previewStorageByPlayer.set(player.id, next.storageId);
    next.previewers.add(player.id);
    this.#activate(next);
  }

  tick(): void {
    for (const record of this.#activeRecords) {
      if (!record.entity?.isValid || !record.handle?.isValid) {
        this.#invalidateRuntimeReferences(record);
        continue;
      }
      const location = this.#activeStorageLocation(record, record.handle, record.localLocation);
      if (record.lastLocation && squaredDistance(record.lastLocation, location) <= POSITION_EPSILON_SQUARED) {
        continue;
      }
      record.entity.teleport(location);
      record.lastLocation = location;
    }
  }

  releasePlayer(playerId: string): void {
    const previewStorageId = this.#previewStorageByPlayer.get(playerId);
    if (previewStorageId) this.#releasePreview(playerId, previewStorageId);
    const viewerStorageId = this.#viewerStorageByPlayer.get(playerId);
    if (viewerStorageId) this.#releaseViewer(playerId, viewerStorageId);
  }

  handleEntityLoad(entity: Entity): void {
    const profile = this.#profilesByEntityTypeId.get(entity.typeId);
    if (!profile) return;
    const identity = readStorageIdentity(entity);
    let record = this.#recordByStorageId.get(identity.storageId);
    if (!record) {
      if (this.#bindingRegistrationComplete) {
        entity.remove();
        return;
      }
      record = {
        active: false,
        attached: false,
        claimed: false,
        entity,
        localLocation: identity.localLocation,
        ownerId: identity.ownerId,
        pendingAttachTick: undefined,
        previewers: new Set(),
        profile,
        storageId: identity.storageId,
        viewers: new Set()
      };
      this.#recordByStorageId.set(record.storageId, record);
    } else {
      assertStorageIdentity(record, identity);
      this.#assignProfile(record, profile);
      if (record.entity?.isValid && record.entity.id !== entity.id) {
        throw new Error(`Storage ID ${record.storageId} is owned by multiple loaded entities.`);
      }
      record.entity = entity;
    }
    this.#storageIdByEntityId.set(entity.id, record.storageId);
    if (record.handle?.isValid && !record.active) this.#queueAttach(record);
  }

  handleEntityRemove(entityId: string): void {
    if (this.#settlingEntityIds.delete(entityId)) return;
    const diedNatively = this.#nativeDeathEntityIds.delete(entityId);
    const storageId = this.#storageIdByEntityId.get(entityId);
    if (diedNatively && !storageId) {
      throw new Error(`Native death for container storage entity ${entityId} lost its storage index.`);
    }
    if (!storageId) return;
    this.#storageIdByEntityId.delete(entityId);
    const record = this.#recordByStorageId.get(storageId);
    if (!record || record.entity?.id !== entityId) return;
    const handle = record.handle;
    if (handle?.isValid && record.entity) handle.detachPersistentEntity(record.entity);
    if (diedNatively) {
      this.#invalidateRuntimeReferences(record);
      const onNativeDeath = record.profile?.onNativeDeath;
      if (!onNativeDeath) {
        throw new Error(`Storage ${record.storageId} died without a native-death handler.`);
      }
      onNativeDeath(record.ownerId, {
        localLocation: { ...record.localLocation },
        storageId: record.storageId
      });
      this.#removeRecordIndexes(record);
      this.#removeUnusedStorageCarrier(handle);
      return;
    }
    record.entity = undefined;
    record.active = false;
    record.attached = false;
    record.lastLocation = undefined;
    this.#invalidateRuntimeReferences(record);
    record.profile?.onUnexpectedRemoval?.(record.ownerId, {
      localLocation: { ...record.localLocation },
      storageId: record.storageId
    });
  }

  registerSavedBindings(ownerId: string, bindings: readonly SubLevelContainerStorageBinding[]): void {
    if (this.#bindingRegistrationComplete) {
      throw new Error("Saved container storage bindings were registered after reconciliation completed.");
    }
    for (const binding of bindings) this.#claimBinding(ownerId, binding);
  }

  /** Remove every loaded storage entity not claimed by persisted sub-level data. */
  completeSavedBindingRegistration(): void {
    if (this.#bindingRegistrationComplete) return;
    this.#bindingRegistrationComplete = true;
    for (const record of [...this.#recordByStorageId.values()]) {
      if (record.claimed) {
        if (record.handle?.isValid && !record.entity?.isValid) {
          this.#ensureStorageEntity(record, record.handle);
        }
        continue;
      }
      this.#removeRecordIndexes(record);
      if (record.entity?.isValid) record.entity.remove();
    }
  }

  bindSubLevel(
    ownerId: string,
    handle: SubLevelInteractionHandle,
    bindings: readonly SubLevelContainerStorageBinding[]
  ): void {
    for (const binding of bindings) {
      const block = handle.getBlockAtLocalLocation(binding.localLocation);
      const profile = block ? this.#profilesByBlockTypeId.get(block.typeId) : undefined;
      if (!profile) {
        throw new Error(`Storage ${binding.storageId} does not point to a container block.`);
      }
      const record = this.#claimBinding(ownerId, binding);
      this.#assignProfile(record, profile);
      if (record.handle && record.handle !== handle && record.handle.isValid) {
        throw new Error(`Storage ${binding.storageId} is already bound to another sub-level.`);
      }
      if (record.handle !== handle) record.attached = false;
      this.#setRecordHandle(record, handle);
      this.#ensureStorageEntity(record, handle);
      this.#storageIdBySubLevelBlock.set(
        subLevelBlockKey(handle.id, binding.localLocation),
        binding.storageId
      );
      if (record.entity?.isValid && !record.active) this.#queueAttach(record);
    }
  }

  /** Release runtime ownership while preserving storage identity for restoration. */
  unbindSubLevel(ownerId: string, handle: SubLevelInteractionHandle): void {
    for (const record of this.#recordByStorageId.values()) {
      if (record.ownerId !== ownerId || record.handle !== handle) continue;
      const entity = record.entity;
      this.#invalidateRuntimeReferences(record);
      record.pendingAttachTick = undefined;
      if (entity?.isValid && handle.isValid) {
        handle.detachPersistentEntity(entity);
        entity.triggerEvent(this.#requireProfile(record).deactivateEvent);
      }
      this.#storageIdBySubLevelBlock.delete(
        subLevelBlockKey(handle.id, record.localLocation)
      );
      this.#setRecordHandle(record, undefined);
    }
    this.#removeUnusedStorageCarrier(handle);
  }

  createStorage(
    ownerId: string,
    handle: SubLevelInteractionHandle,
    localLocation: Vector3
  ): SubLevelContainerStorageBinding {
    const block = handle.getBlockAtLocalLocation(localLocation);
    const profile = block ? this.#profilesByBlockTypeId.get(block.typeId) : undefined;
    if (!profile) {
      throw new Error(`No container profile covers the block at ${subLevelBlockKey(handle.id, localLocation)}.`);
    }
    const entity = handle.dimension.spawnEntity(
      profile.storageEntityTypeId,
      storageLocationFromCellCenter(handle.localPointToWorld(localLocation), profile)
    );
    try {
      const storageId = entity.id;
      initializeStorageEntity(entity, ownerId, storageId, localLocation, profile);
      const record: ContainerStorageRecord = {
        active: false,
        handle: undefined,
        attached: false,
        claimed: true,
        entity,
        localLocation: { ...localLocation },
        ownerId,
        pendingAttachTick: undefined,
        previewers: new Set(),
        profile,
        storageId,
        viewers: new Set()
      };
      this.#recordByStorageId.set(storageId, record);
      this.#setRecordHandle(record, handle);
      this.#storageIdByEntityId.set(entity.id, storageId);
      this.#storageIdBySubLevelBlock.set(subLevelBlockKey(handle.id, localLocation), storageId);
      this.#attach(record);
      return { localLocation: { ...localLocation }, storageId };
    } catch (error) {
      const record = this.#recordByStorageId.get(entity.id);
      if (record) this.#removeRecordIndexes(record);
      if (entity.isValid) entity.remove();
      throw error;
    }
  }

  /** Returns the persisted binding set currently owned by one sub-level. */
  getBindings(ownerId: string): SubLevelContainerStorageBinding[] {
    return [...this.#recordByStorageId.values()]
      .filter(record => record.ownerId === ownerId)
      .map(record => ({
        localLocation: { ...record.localLocation },
        storageId: record.storageId
      }));
  }

  getBinding(
    handle: SubLevelInteractionHandle,
    localLocation: Vector3
  ): SubLevelContainerStorageBinding | undefined {
    const storageId = this.#storageIdBySubLevelBlock.get(
      subLevelBlockKey(handle.id, localLocation)
    );
    const record = storageId ? this.#recordByStorageId.get(storageId) : undefined;
    return record
      ? { localLocation: { ...record.localLocation }, storageId: record.storageId }
      : undefined;
  }

  discardStorage(storageId: string): void {
    const record = this.#requiredRecord(storageId);
    const handle = record.handle;
    if (record.handle?.isValid && record.entity?.isValid) {
      record.handle.detachPersistentEntity(record.entity);
    }
    this.#removeRecordIndexes(record);
    if (record.entity?.isValid) record.entity.remove();
    this.#removeUnusedStorageCarrier(handle);
  }

  settleStorages(
    ownerId: string,
    bindings: readonly SubLevelContainerStorageBinding[],
    dimension: Dimension,
    resolveLocation: (localLocation: Vector3) => Vector3
  ): void {
    for (const binding of bindings) {
      const record = this.#requiredRecord(binding.storageId);
      if (record.ownerId !== ownerId || !sameLocation(record.localLocation, binding.localLocation)) {
        throw new Error(`Storage ${binding.storageId} does not match settlement owner ${ownerId}.`);
      }
      const profile = this.#requireProfile(record);
      const entity = record.entity;
      if (!entity?.isValid || entity.dimension.id !== dimension.id) {
        throw new Error(`Storage ${binding.storageId} is unavailable for sub-level settlement.`);
      }
      this.#invalidateRuntimeReferences(record);
      if (record.handle?.isValid) record.handle.detachPersistentEntity(entity);
      entity.triggerEvent(profile.activateEvent);
      entity.teleport(storageLocationFromCellCenter(resolveLocation(binding.localLocation), profile));
      this.#settlingEntityIds.add(entity.id);
      if (!entity.kill()) {
        this.#settlingEntityIds.delete(entity.id);
        throw new Error(`Storage ${binding.storageId} could not complete native inventory settlement.`);
      }
      // Native death owns the inventory drop. Remove any surviving entity on
      // the next tick if the death event did not already close its lifecycle.
      system.run(() => {
        if (entity.isValid) entity.remove();
      });
      this.#removeRecordIndexes(record);
      this.#removeUnusedStorageCarrier(record.handle);
    }
  }

  #claimBinding(ownerId: string, binding: SubLevelContainerStorageBinding): ContainerStorageRecord {
    let record = this.#recordByStorageId.get(binding.storageId);
    if (!record) {
      record = {
        active: false,
        attached: false,
        claimed: true,
        localLocation: { ...binding.localLocation },
        ownerId,
        pendingAttachTick: undefined,
        previewers: new Set(),
        storageId: binding.storageId,
        viewers: new Set()
      };
      this.#recordByStorageId.set(binding.storageId, record);
      return record;
    }
    assertStorageIdentity(record, {
      localLocation: binding.localLocation,
      ownerId,
      storageId: binding.storageId
    });
    record.claimed = true;
    return record;
  }

  #assignProfile(record: ContainerStorageRecord, profile: SubLevelContainerProfile): void {
    if (record.profile && record.profile !== profile) {
      throw new Error(`Storage ${record.storageId} is claimed by two container profiles.`);
    }
    record.profile = profile;
  }

  #requireProfile(record: ContainerStorageRecord): SubLevelContainerProfile {
    if (!record.profile) {
      throw new Error(`Storage ${record.storageId} has no resolved container profile.`);
    }
    return record.profile;
  }

  #recordAt(handle: SubLevelInteractionHandle, localLocation: Vector3): ContainerStorageRecord | undefined {
    const storageId = this.#storageIdBySubLevelBlock.get(
      subLevelBlockKey(handle.id, localLocation)
    );
    return storageId ? this.#recordByStorageId.get(storageId) : undefined;
  }

  #recordForEntity(entity: Entity): ContainerStorageRecord | undefined {
    const storageId = this.#storageIdByEntityId.get(entity.id)
      ?? entity.getDynamicProperty(STORAGE_ID_PROPERTY);
    return typeof storageId === "string" ? this.#recordByStorageId.get(storageId) : undefined;
  }

  #requiredRecord(storageId: string): ContainerStorageRecord {
    const record = this.#recordByStorageId.get(storageId);
    if (!record) throw new Error(`Storage ${storageId} is not registered.`);
    return record;
  }

  #ensureStorageEntity(
    record: ContainerStorageRecord,
    handle: SubLevelInteractionHandle
  ): void {
    if (record.entity?.isValid) return;
    const profile = this.#requireProfile(record);
    const entity = handle.dimension.spawnEntity(
      profile.storageEntityTypeId,
      storageLocationFromCellCenter(handle.localPointToWorld(record.localLocation), profile)
    );
    try {
      initializeStorageEntity(
        entity,
        record.ownerId,
        record.storageId,
        record.localLocation,
        profile
      );
      record.entity = entity;
      this.#storageIdByEntityId.set(entity.id, record.storageId);
    } catch (error) {
      if (entity.isValid) entity.remove();
      throw error;
    }
  }

  #activeStorageLocation(
    record: ContainerStorageRecord,
    handle: SubLevelInteractionHandle,
    localLocation: Vector3
  ): Vector3 {
    return storageLocationFromCellCenter(
      handle.localPointToWorld(localLocation),
      this.#requireProfile(record)
    );
  }

  #activate(record: ContainerStorageRecord): void {
    if (record.active) return;
    const entity = record.entity;
    const handle = record.handle;
    if (!entity?.isValid || !handle?.isValid) return;
    const profile = this.#requireProfile(record);
    if (record.attached) handle.detachPersistentEntity(entity, true);
    record.attached = false;
    const location = this.#activeStorageLocation(record, handle, record.localLocation);
    entity.teleport(location);
    entity.triggerEvent(profile.activateEvent);
    record.active = true;
    this.#activeRecords.add(record);
    record.lastLocation = location;
  }

  #deactivate(record: ContainerStorageRecord): void {
    if (!record.active || record.previewers.size > 0 || record.viewers.size > 0) return;
    const entity = record.entity;
    if (!entity?.isValid) return;
    entity.triggerEvent(this.#requireProfile(record).deactivateEvent);
    record.active = false;
    this.#activeRecords.delete(record);
    record.lastLocation = undefined;
    this.#attach(record);
  }

  #queueAttach(record: ContainerStorageRecord): void {
    if (record.pendingAttachTick !== undefined) return;
    record.pendingAttachTick = system.currentTick;
    system.run(() => this.#completeQueuedAttach(record));
  }

  #completeQueuedAttach(record: ContainerStorageRecord): void {
    const queuedTick = record.pendingAttachTick;
    if (queuedTick === undefined) return;
    if (
      this.#recordByStorageId.get(record.storageId) !== record
      || record.active
      || record.attached
      || !record.entity?.isValid
      || !record.handle?.isValid
    ) {
      record.pendingAttachTick = undefined;
      return;
    }
    const vehicle = record.entity.getComponent("minecraft:riding")?.entityRidingOn;
    if (vehicle) {
      if (system.currentTick - queuedTick >= STORAGE_DETACH_TIMEOUT_TICKS) {
        record.pendingAttachTick = undefined;
        throw new Error(
          `Storage ${record.storageId} did not detach from carrier ${vehicle.id} before attaching to sub-level ${record.handle.id}.`
        );
      }
      // Native rider removal is asynchronous. Do not create a competing child
      // relationship until Bedrock has removed the source riding component.
      system.run(() => this.#completeQueuedAttach(record));
      return;
    }
    record.pendingAttachTick = undefined;
    this.#attach(record);
  }

  #attach(record: ContainerStorageRecord): void {
    const entity = record.entity;
    const handle = record.handle;
    if (!entity?.isValid || !handle?.isValid) return;
    if (!handle.attachPersistentEntity(entity)) {
      throw new Error(`Storage ${record.storageId} could not attach to its sub-level carrier.`);
    }
    record.attached = true;
  }

  #releasePreview(playerId: string, storageId: string): void {
    if (this.#previewStorageByPlayer.get(playerId) === storageId) {
      this.#previewStorageByPlayer.delete(playerId);
    }
    const record = this.#recordByStorageId.get(storageId);
    if (!record) return;
    record.previewers.delete(playerId);
    this.#deactivate(record);
  }

  #releaseViewer(playerId: string, storageId: string): void {
    if (this.#viewerStorageByPlayer.get(playerId) === storageId) {
      this.#viewerStorageByPlayer.delete(playerId);
    }
    const record = this.#recordByStorageId.get(storageId);
    if (!record || !record.viewers.delete(playerId)) return;
    if (record.viewers.size === 0) this.#setOpen(record, false);
    this.#deactivate(record);
  }

  #openContainer(player: Player, entity: Entity): void {
    const record = this.#recordForEntity(entity);
    if (!record?.handle?.isValid || !record.active) {
      throw new Error(`Container opened for invalid storage entity ${entity.id}.`);
    }
    const previous = this.#viewerStorageByPlayer.get(player.id);
    if (previous && previous !== record.storageId) this.#releaseViewer(player.id, previous);
    if (record.viewers.size === 0) this.#setOpen(record, true);
    record.viewers.add(player.id);
    this.#viewerStorageByPlayer.set(player.id, record.storageId);
  }

  #closeContainer(playerId: string, entity: Entity): void {
    const record = this.#recordForEntity(entity);
    if (!record) return;
    this.#releaseViewer(playerId, record.storageId);
  }

  #setOpen(record: ContainerStorageRecord, open: boolean): void {
    const handle = record.handle;
    if (!handle?.isValid) return;
    const profile = this.#requireProfile(record);
    if (profile.openStateDimension !== undefined) {
      if (!handle.setBlockModelState(record.localLocation, profile.openStateDimension, open ? 1 : 0)) {
        throw new Error(`Could not set container ${record.storageId} open state to ${open}.`);
      }
    }
    const dimension = handle.dimension;
    const location = handle.localPointToWorld(record.localLocation);
    if (open) {
      const sound = profile.openSound;
      if (sound) dimension.playSound(sound.id, location, { pitch: sound.pitch, volume: sound.volume });
      return;
    }
    const sound = profile.closeSound;
    if (!sound) return;
    system.runTimeout(() => {
      dimension.playSound(sound.id, location, { pitch: sound.pitch, volume: sound.volume });
    }, sound.delayTicks);
  }

  #invalidateRuntimeReferences(record: ContainerStorageRecord): void {
    this.#activeRecords.delete(record);
    record.active = false;
    record.attached = false;
    record.lastLocation = undefined;
    for (const playerId of record.previewers) {
      if (this.#previewStorageByPlayer.get(playerId) === record.storageId) {
        this.#previewStorageByPlayer.delete(playerId);
      }
    }
    for (const playerId of record.viewers) {
      if (this.#viewerStorageByPlayer.get(playerId) === record.storageId) {
        this.#viewerStorageByPlayer.delete(playerId);
      }
    }
    const wasOpen = record.viewers.size > 0;
    record.previewers.clear();
    record.viewers.clear();
    if (
      wasOpen
      && record.handle?.isValid
      && record.handle.getBlockAtLocalLocation(record.localLocation)?.typeId
        === record.profile?.blockTypeId
    ) this.#setOpen(record, false);
  }

  #removeRecordIndexes(record: ContainerStorageRecord): void {
    record.pendingAttachTick = undefined;
    this.#activeRecords.delete(record);
    if (this.#recordByStorageId.get(record.storageId) === record) {
      this.#recordByStorageId.delete(record.storageId);
      this.#adjustRecordCount(record.handle?.dimension.id, -1);
    }
    if (record.entity) this.#storageIdByEntityId.delete(record.entity.id);
    if (record.handle) {
      this.#storageIdBySubLevelBlock.delete(
        subLevelBlockKey(record.handle.id, record.localLocation)
      );
    }
  }

  #setRecordHandle(
    record: ContainerStorageRecord,
    handle: SubLevelInteractionHandle | undefined
  ): void {
    const previousDimensionId = record.handle?.dimension.id;
    const nextDimensionId = handle?.dimension.id;
    record.handle = handle;
    if (previousDimensionId === nextDimensionId) return;
    this.#adjustRecordCount(previousDimensionId, -1);
    this.#adjustRecordCount(nextDimensionId, 1);
  }

  #adjustRecordCount(dimensionId: string | undefined, delta: -1 | 1): void {
    if (dimensionId === undefined) return;
    const next = (this.#recordCountByDimension.get(dimensionId) ?? 0) + delta;
    if (next < 0) {
      throw new Error(`Container storage count for dimension ${dimensionId} became negative.`);
    }
    if (next === 0) this.#recordCountByDimension.delete(dimensionId);
    else this.#recordCountByDimension.set(dimensionId, next);
  }

  #removeUnusedStorageCarrier(handle: SubLevelInteractionHandle | undefined): void {
    if (!handle?.isValid) return;
    for (const record of this.#recordByStorageId.values()) {
      if (record.handle === handle) return;
    }
    handle.removeEmptyPersistentEntityCarriers();
  }
}

function readStorageIdentity(entity: Entity): {
  readonly localLocation: Vector3;
  readonly ownerId: string;
  readonly storageId: string;
} {
  const storageId = entity.getDynamicProperty(STORAGE_ID_PROPERTY);
  const ownerId = entity.getDynamicProperty(STORAGE_OWNER_PROPERTY);
  const localLocation = entity.getDynamicProperty(STORAGE_LOCATION_PROPERTY);
  if (
    typeof storageId !== "string"
    || storageId.length === 0
    || typeof ownerId !== "string"
    || ownerId.length === 0
    || !isIntegerVector(localLocation)
  ) {
    throw new Error(`Container storage entity ${entity.id} has invalid persistent identity.`);
  }
  return { localLocation, ownerId, storageId };
}

function assertStorageIdentity(
  record: ContainerStorageRecord,
  identity: {
    readonly localLocation: Vector3;
    readonly ownerId: string;
    readonly storageId: string;
  }
): void {
  if (
    record.storageId !== identity.storageId
    || record.ownerId !== identity.ownerId
    || !sameLocation(record.localLocation, identity.localLocation)
  ) {
    throw new Error(`Storage ${identity.storageId} has conflicting persistent ownership.`);
  }
}

function storageLocationFromCellCenter(
  center: Vector3,
  profile: SubLevelContainerProfile
): Vector3 {
  return {
    x: center.x,
    y: center.y - profile.collisionHeight * 0.5,
    z: center.z
  };
}

function initializeStorageEntity(
  entity: Entity,
  ownerId: string,
  storageId: string,
  localLocation: Vector3,
  profile: SubLevelContainerProfile
): void {
  entity.setDynamicProperty(STORAGE_ID_PROPERTY, storageId);
  entity.setDynamicProperty(STORAGE_OWNER_PROPERTY, ownerId);
  entity.setDynamicProperty(STORAGE_LOCATION_PROPERTY, { ...localLocation });
  entity.nameTag = profile.nameTranslationKey;
  entity.triggerEvent(profile.deactivateEvent);
  const container = entity.getComponent("minecraft:inventory")?.container;
  if (!container || container.size !== profile.containerSize) {
    throw new Error(
      `Container storage entity ${profile.storageEntityTypeId} does not expose a ${profile.containerSize}-slot inventory.`
    );
  }
}

function subLevelBlockKey(subLevelId: number, localLocation: Vector3): string {
  return `${subLevelId}|${localLocation.x},${localLocation.y},${localLocation.z}`;
}

function sameLocation(left: Vector3, right: Vector3): boolean {
  return left.x === right.x && left.y === right.y && left.z === right.z;
}

function isIntegerVector(value: unknown): value is Vector3 {
  if (!value || typeof value !== "object") return false;
  const vector = value as Partial<Vector3>;
  return Number.isInteger(vector.x) && Number.isInteger(vector.y) && Number.isInteger(vector.z);
}
