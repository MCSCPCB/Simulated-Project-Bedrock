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

export const CHEST_ENTITY_TYPE_ID = "sable:chest";

const CHEST_BLOCK_TYPE_ID = "minecraft:chest";
const CHEST_NAME_TRANSLATION_KEY = "tile.chest.name";
const STORAGE_ID_PROPERTY = "sable:storage_id";
const STORAGE_OWNER_PROPERTY = "sable:storage_owner";
const STORAGE_LOCATION_PROPERTY = "sable:storage_location";
const ACTIVE_EVENT = "sable:chest_activate";
const INACTIVE_EVENT = "sable:chest_deactivate";
// Height of the vanilla chest body (14/16 blocks, matching the chest collision
// box). The storage entity origin sits half of this below the cell center — the
// bottom of the rendered chest cube — so the entity's upward-growing
// interaction box tracks the projected chest.
const STORAGE_COLLISION_HEIGHT = 0.875;
const POSITION_EPSILON_SQUARED = EPSILON_1E6;
const STORAGE_DETACH_TIMEOUT_TICKS = 20;
const CHEST_CLOSE_SOUND_DELAY_TICKS = 1;

export interface SubLevelChestStorageBinding {
  readonly localLocation: Vector3;
  readonly storageId: string;
}

interface ChestStorageRecord {
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
  readonly storageId: string;
  readonly viewers: Set<string>;
}

/**
 * Owns persistent native chest containers while sub-levels own their lifetime.
 */
export class SubLevelContainerInteractionController {
  readonly #activeRecords = new Set<ChestStorageRecord>();
  readonly #recordByStorageId = new Map<string, ChestStorageRecord>();
  readonly #recordCountByDimension = new Map<string, number>();
  readonly #storageIdBySubLevelBlock = new Map<string, string>();
  readonly #storageIdByEntityId = new Map<string, string>();
  readonly #previewStorageByPlayer = new Map<string, string>();
  readonly #viewerStorageByPlayer = new Map<string, string>();
  readonly #nativeDeathEntityIds = new Set<string>();
  readonly #settlingEntityIds = new Set<string>();
  #nativeDeathHandler?: (
    ownerId: string,
    binding: SubLevelChestStorageBinding
  ) => void;
  #bindingRegistrationComplete = false;
  #started = false;

  setNativeDeathHandler(
    handler: (ownerId: string, binding: SubLevelChestStorageBinding) => void
  ): void {
    if (this.#nativeDeathHandler) {
      throw new Error("The chest storage native-death handler is already configured.");
    }
    this.#nativeDeathHandler = handler;
  }

  start(): void {
    if (this.#started) return;
    this.#started = true;
    world.beforeEvents.playerInteractWithEntity.subscribe(event => {
      if (event.target.typeId !== CHEST_ENTITY_TYPE_ID) return;
      const record = this.#recordForEntity(event.target);
      if (record?.handle?.isValid && record.active) return;
      event.cancel = true;
      // A registered but inactive record is a benign race between deactivation
      // and player input; only a truly unregistered entity indicates a leak.
      if (!record) {
        system.run(() => {
          throw new Error(`Unbound chest storage entity ${event.target.id} was interacted with.`);
        });
      }
    });
    world.afterEvents.entityContainerOpened.subscribe(event => {
      if (event.entity.typeId !== CHEST_ENTITY_TYPE_ID) return;
      const player = event.openSource.entity;
      if (player?.typeId !== "minecraft:player") return;
      this.#openContainer(player as Player, event.entity);
    });
    world.afterEvents.entityContainerClosed.subscribe(event => {
      if (event.entity.typeId !== CHEST_ENTITY_TYPE_ID) return;
      const player = event.closeSource.entity;
      if (player?.typeId !== "minecraft:player") return;
      this.#closeContainer(player.id, event.entity);
    });
    world.afterEvents.entityDie.subscribe(event => {
      if (event.deadEntity.typeId !== CHEST_ENTITY_TYPE_ID) return;
      if (
        !this.#settlingEntityIds.has(event.deadEntity.id)
        && this.#storageIdByEntityId.has(event.deadEntity.id)
      ) this.#nativeDeathEntityIds.add(event.deadEntity.id);
      // Native death owns the inventory drop. The script owns the invisible
      // storage entity itself, just as the renderer owns its entities.
      if (event.deadEntity.isValid) event.deadEntity.remove();
    });
    world.afterEvents.entityRemove.subscribe(event => {
      if (event.typeId !== CHEST_ENTITY_TYPE_ID) return;
      this.handleEntityRemove(event.removedEntityId);
    });

    // Entity-load events do not replay for entities already loaded with the script.
    system.run(() => {
      for (const dimensionId of VANILLA_DIMENSION_IDS) {
        const dimension = world.getDimension(dimensionId);
        for (const entity of dimension.getEntities({ type: CHEST_ENTITY_TYPE_ID })) {
          this.handleEntityLoad(entity);
        }
      }
    });
  }

  canInteract(_handle: SubLevelInteractionHandle, block: SubLevelBlock): boolean {
    if (block.typeId !== CHEST_BLOCK_TYPE_ID) return false;
    return resolveFancySubLevelBlock(block)?.model.description.type === "chest";
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
      throw new Error(`Projected chest ${subLevelBlockKey(handle.id, block.localLocation)} has no storage entity.`);
    }
    // The before-item-use callback may run under restricted execution, so it
    // only consumes the chest gesture. The existing per-tick preview sync owns
    // native rider detachment, teleportation, and activation.
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
      const location = activeStorageLocation(record.handle, record.localLocation);
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
    if (entity.typeId !== CHEST_ENTITY_TYPE_ID) return;
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
        storageId: identity.storageId,
        viewers: new Set()
      };
      this.#recordByStorageId.set(record.storageId, record);
    } else {
      assertStorageIdentity(record, identity);
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
      throw new Error(`Native death for chest storage entity ${entityId} lost its storage index.`);
    }
    if (!storageId) return;
    this.#storageIdByEntityId.delete(entityId);
    const record = this.#recordByStorageId.get(storageId);
    if (!record || record.entity?.id !== entityId) return;
    const handle = record.handle;
    if (handle?.isValid && record.entity) handle.detachPersistentEntity(record.entity);
    if (diedNatively) {
      this.#invalidateRuntimeReferences(record);
      const handler = this.#nativeDeathHandler;
      if (!handler) {
        throw new Error(`Storage ${record.storageId} died without a native-death handler.`);
      }
      handler(record.ownerId, {
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
  }

  registerSavedBindings(ownerId: string, bindings: readonly SubLevelChestStorageBinding[]): void {
    if (this.#bindingRegistrationComplete) {
      throw new Error("Saved chest storage bindings were registered after reconciliation completed.");
    }
    for (const binding of bindings) this.#claimBinding(ownerId, binding);
  }

  /** Remove every loaded storage entity not claimed by persisted sub-level data. */
  completeSavedBindingRegistration(): void {
    if (this.#bindingRegistrationComplete) return;
    this.#bindingRegistrationComplete = true;
    for (const record of [...this.#recordByStorageId.values()]) {
      if (record.claimed) continue;
      this.#removeRecordIndexes(record);
      if (record.entity?.isValid) record.entity.remove();
    }
  }

  bindSubLevel(
    ownerId: string,
    handle: SubLevelInteractionHandle,
    bindings: readonly SubLevelChestStorageBinding[]
  ): void {
    for (const binding of bindings) {
      const block = handle.getBlockAtLocalLocation(binding.localLocation);
      if (block?.typeId !== CHEST_BLOCK_TYPE_ID) {
        throw new Error(`Storage ${binding.storageId} does not point to a chest block.`);
      }
      const record = this.#claimBinding(ownerId, binding);
      if (record.handle && record.handle !== handle && record.handle.isValid) {
        throw new Error(`Storage ${binding.storageId} is already bound to another sub-level.`);
      }
      if (record.handle !== handle) record.attached = false;
      this.#setRecordHandle(record, handle);
      this.#storageIdBySubLevelBlock.set(
        subLevelBlockKey(handle.id, binding.localLocation),
        binding.storageId
      );
      if (record.entity?.isValid && !record.active) this.#queueAttach(record);
    }
  }

  /** Roll back runtime ownership when a restored sub-level fails before commit. */
  rollbackSubLevelBinding(ownerId: string, handle: SubLevelInteractionHandle): void {
    for (const record of this.#recordByStorageId.values()) {
      if (record.ownerId !== ownerId || record.handle !== handle) continue;
      if (record.attached && record.entity?.isValid && handle.isValid) {
        handle.detachPersistentEntity(record.entity);
      }
      this.#storageIdBySubLevelBlock.delete(
        subLevelBlockKey(handle.id, record.localLocation)
      );
      this.#setRecordHandle(record, undefined);
      record.attached = false;
      record.lastLocation = undefined;
    }
  }

  createStorage(
    ownerId: string,
    handle: SubLevelInteractionHandle,
    localLocation: Vector3
  ): SubLevelChestStorageBinding {
    const entity = handle.dimension.spawnEntity(
      CHEST_ENTITY_TYPE_ID,
      activeStorageLocation(handle, localLocation)
    );
    try {
      const storageId = entity.id;
      entity.setDynamicProperty(STORAGE_ID_PROPERTY, storageId);
      entity.setDynamicProperty(STORAGE_OWNER_PROPERTY, ownerId);
      entity.setDynamicProperty(STORAGE_LOCATION_PROPERTY, { ...localLocation });
      entity.nameTag = CHEST_NAME_TRANSLATION_KEY;
      entity.triggerEvent(INACTIVE_EVENT);
      const container = entity.getComponent("minecraft:inventory")?.container;
      if (!container || container.size !== 27) {
        throw new Error("Chest storage entity does not expose a 27-slot inventory.");
      }
      const record: ChestStorageRecord = {
        active: false,
        handle: undefined,
        attached: false,
        claimed: true,
        entity,
        localLocation: { ...localLocation },
        ownerId,
        pendingAttachTick: undefined,
        previewers: new Set(),
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
    bindings: readonly SubLevelChestStorageBinding[],
    dimension: Dimension,
    resolveLocation: (localLocation: Vector3) => Vector3
  ): void {
    for (const binding of bindings) {
      const record = this.#requiredRecord(binding.storageId);
      if (record.ownerId !== ownerId || !sameLocation(record.localLocation, binding.localLocation)) {
        throw new Error(`Storage ${binding.storageId} does not match settlement owner ${ownerId}.`);
      }
      const entity = record.entity;
      if (!entity?.isValid || entity.dimension.id !== dimension.id) {
        throw new Error(`Storage ${binding.storageId} is unavailable for sub-level settlement.`);
      }
      this.#invalidateRuntimeReferences(record);
      if (record.handle?.isValid) record.handle.detachPersistentEntity(entity);
      entity.triggerEvent(ACTIVE_EVENT);
      entity.teleport(storageLocationFromCellCenter(resolveLocation(binding.localLocation)));
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

  #claimBinding(ownerId: string, binding: SubLevelChestStorageBinding): ChestStorageRecord {
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

  #recordAt(handle: SubLevelInteractionHandle, localLocation: Vector3): ChestStorageRecord | undefined {
    const storageId = this.#storageIdBySubLevelBlock.get(
      subLevelBlockKey(handle.id, localLocation)
    );
    return storageId ? this.#recordByStorageId.get(storageId) : undefined;
  }

  #recordForEntity(entity: Entity): ChestStorageRecord | undefined {
    const storageId = this.#storageIdByEntityId.get(entity.id)
      ?? entity.getDynamicProperty(STORAGE_ID_PROPERTY);
    return typeof storageId === "string" ? this.#recordByStorageId.get(storageId) : undefined;
  }

  #requiredRecord(storageId: string): ChestStorageRecord {
    const record = this.#recordByStorageId.get(storageId);
    if (!record) throw new Error(`Storage ${storageId} is not registered.`);
    return record;
  }

  #activate(record: ChestStorageRecord): void {
    if (record.active) return;
    const entity = record.entity;
    const handle = record.handle;
    if (!entity?.isValid || !handle?.isValid) return;
    if (record.attached) handle.detachPersistentEntity(entity, true);
    record.attached = false;
    const location = activeStorageLocation(handle, record.localLocation);
    entity.teleport(location);
    entity.triggerEvent(ACTIVE_EVENT);
    record.active = true;
    this.#activeRecords.add(record);
    record.lastLocation = location;
  }

  #deactivate(record: ChestStorageRecord): void {
    if (!record.active || record.previewers.size > 0 || record.viewers.size > 0) return;
    const entity = record.entity;
    if (!entity?.isValid) return;
    entity.triggerEvent(INACTIVE_EVENT);
    record.active = false;
    this.#activeRecords.delete(record);
    record.lastLocation = undefined;
    this.#attach(record);
  }

  #queueAttach(record: ChestStorageRecord): void {
    if (record.pendingAttachTick !== undefined) return;
    record.pendingAttachTick = system.currentTick;
    system.run(() => this.#completeQueuedAttach(record));
  }

  #completeQueuedAttach(record: ChestStorageRecord): void {
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

  #attach(record: ChestStorageRecord): void {
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

  #setOpen(record: ChestStorageRecord, open: boolean): void {
    const handle = record.handle;
    if (!handle?.isValid) return;
    if (!handle.setBlockModelState(record.localLocation, "open", open ? 1 : 0)) {
      throw new Error(`Could not set chest ${record.storageId} open state to ${open}.`);
    }
    const dimension = handle.dimension;
    const location = handle.localPointToWorld(record.localLocation);
    if (open) {
      dimension.playSound("random.chestopen", location, { pitch: 1, volume: 0.5 });
      return;
    }
    system.runTimeout(() => {
      dimension.playSound("random.chestclosed", location, { pitch: 1, volume: 0.5 });
    }, CHEST_CLOSE_SOUND_DELAY_TICKS);
  }

  #invalidateRuntimeReferences(record: ChestStorageRecord): void {
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
      && record.handle.getBlockAtLocalLocation(record.localLocation)?.typeId === CHEST_BLOCK_TYPE_ID
    ) this.#setOpen(record, false);
  }

  #removeRecordIndexes(record: ChestStorageRecord): void {
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
    record: ChestStorageRecord,
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
      throw new Error(`Chest storage count for dimension ${dimensionId} became negative.`);
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
    throw new Error(`Chest storage entity ${entity.id} has invalid persistent identity.`);
  }
  return { localLocation, ownerId, storageId };
}

function assertStorageIdentity(
  record: ChestStorageRecord,
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

function activeStorageLocation(
  handle: SubLevelInteractionHandle,
  localLocation: Vector3
): Vector3 {
  return storageLocationFromCellCenter(handle.localPointToWorld(localLocation));
}

function storageLocationFromCellCenter(center: Vector3): Vector3 {
  return {
    x: center.x,
    y: center.y - STORAGE_COLLISION_HEIGHT * 0.5,
    z: center.z
  };
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
