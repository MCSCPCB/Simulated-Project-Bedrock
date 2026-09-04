import {
  system,
  world
} from "@minecraft/server";
import {
  EPSILON_1E6,
  VANILLA_DIMENSION_IDS,
  squaredDistance
} from "../../util/SableVector3Utils.js";
import { resolveFancySubLevelBlock } from "../../sublevel/render/fancy/model/FancySubLevelModelRegistry.js";
const STORAGE_ID_PROPERTY = "sable:storage_id";
const STORAGE_OWNER_PROPERTY = "sable:storage_owner";
const STORAGE_LOCATION_PROPERTY = "sable:storage_location";
const POSITION_EPSILON_SQUARED = EPSILON_1E6;
const STORAGE_DETACH_TIMEOUT_TICKS = 20;
class SubLevelContainerInteractionController {
  #profilesByBlockTypeId = /* @__PURE__ */ new Map();
  #profilesByEntityTypeId = /* @__PURE__ */ new Map();
  #activeRecords = /* @__PURE__ */ new Set();
  #recordByStorageId = /* @__PURE__ */ new Map();
  #recordCountByDimension = /* @__PURE__ */ new Map();
  #storageIdBySubLevelBlock = /* @__PURE__ */ new Map();
  #storageIdByEntityId = /* @__PURE__ */ new Map();
  #previewStorageByPlayer = /* @__PURE__ */ new Map();
  #viewerStorageByPlayer = /* @__PURE__ */ new Map();
  #nativeDeathEntityIds = /* @__PURE__ */ new Set();
  #settlingEntityIds = /* @__PURE__ */ new Set();
  #bindingRegistrationComplete = false;
  #started = false;
  /** Register one container kind. Must precede start(). */
  registerContainerProfile(profile) {
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
  start() {
    if (this.#started) return;
    this.#started = true;
    world.beforeEvents.playerInteractWithEntity.subscribe((event) => {
      if (!this.#profilesByEntityTypeId.has(event.target.typeId)) return;
      const record = this.#recordForEntity(event.target);
      if (record?.handle?.isValid && record.active) return;
      event.cancel = true;
      if (!record) {
        system.run(() => {
          throw new Error(`Unbound container storage entity ${event.target.id} was interacted with.`);
        });
      }
    });
    world.afterEvents.entityContainerOpened.subscribe((event) => {
      if (!this.#profilesByEntityTypeId.has(event.entity.typeId)) return;
      const player = event.openSource.entity;
      if (player?.typeId !== "minecraft:player") return;
      this.#openContainer(player, event.entity);
    });
    world.afterEvents.entityContainerClosed.subscribe((event) => {
      if (!this.#profilesByEntityTypeId.has(event.entity.typeId)) return;
      const player = event.closeSource.entity;
      if (player?.typeId !== "minecraft:player") return;
      this.#closeContainer(player.id, event.entity);
    });
    world.afterEvents.entityDie.subscribe((event) => {
      if (!this.#profilesByEntityTypeId.has(event.deadEntity.typeId)) return;
      if (!this.#settlingEntityIds.has(event.deadEntity.id) && this.#storageIdByEntityId.has(event.deadEntity.id)) this.#nativeDeathEntityIds.add(event.deadEntity.id);
      if (event.deadEntity.isValid) event.deadEntity.remove();
    });
    world.afterEvents.entityRemove.subscribe((event) => {
      if (!this.#profilesByEntityTypeId.has(event.typeId)) return;
      this.handleEntityRemove(event.removedEntityId);
    });
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
  canInteract(_handle, block) {
    const profile = this.#profilesByBlockTypeId.get(block.typeId);
    if (!profile) return false;
    if (profile.modelType === void 0) return true;
    return resolveFancySubLevelBlock(block)?.model.description.type === profile.modelType;
  }
  /** Native entity interaction opens the container; this only consumes sub-level gestures. */
  interact(_player, handle, block) {
    if (!this.canInteract(handle, block)) return false;
    const record = this.#recordAt(handle, block.localLocation);
    if (!record?.entity?.isValid) {
      throw new Error(`Projected container ${subLevelBlockKey(handle.id, block.localLocation)} has no storage entity.`);
    }
    return true;
  }
  /** Whether any storage record in a dimension could react to syncTarget. */
  hasSyncTargets(dimensionId) {
    if (dimensionId === void 0) {
      return this.#recordCountByDimension.size > 0 || this.#previewStorageByPlayer.size > 0;
    }
    return (this.#recordCountByDimension.get(dimensionId) ?? 0) > 0;
  }
  syncTarget(player, handle, block) {
    const next = handle && block && this.canInteract(handle, block) ? this.#recordAt(handle, block.localLocation) : void 0;
    const previousId = this.#previewStorageByPlayer.get(player.id);
    if (previousId === next?.storageId) return;
    if (previousId) this.#releasePreview(player.id, previousId);
    if (!next?.entity?.isValid) return;
    this.#previewStorageByPlayer.set(player.id, next.storageId);
    next.previewers.add(player.id);
    this.#activate(next);
  }
  tick() {
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
  releasePlayer(playerId) {
    const previewStorageId = this.#previewStorageByPlayer.get(playerId);
    if (previewStorageId) this.#releasePreview(playerId, previewStorageId);
    const viewerStorageId = this.#viewerStorageByPlayer.get(playerId);
    if (viewerStorageId) this.#releaseViewer(playerId, viewerStorageId);
  }
  handleEntityLoad(entity) {
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
        pendingAttachTick: void 0,
        previewers: /* @__PURE__ */ new Set(),
        profile,
        storageId: identity.storageId,
        viewers: /* @__PURE__ */ new Set()
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
  handleEntityRemove(entityId) {
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
    record.entity = void 0;
    record.active = false;
    record.attached = false;
    record.lastLocation = void 0;
    this.#invalidateRuntimeReferences(record);
  }
  registerSavedBindings(ownerId, bindings) {
    if (this.#bindingRegistrationComplete) {
      throw new Error("Saved container storage bindings were registered after reconciliation completed.");
    }
    for (const binding of bindings) this.#claimBinding(ownerId, binding);
  }
  /** Remove every loaded storage entity not claimed by persisted sub-level data. */
  completeSavedBindingRegistration() {
    if (this.#bindingRegistrationComplete) return;
    this.#bindingRegistrationComplete = true;
    for (const record of [...this.#recordByStorageId.values()]) {
      if (record.claimed) continue;
      this.#removeRecordIndexes(record);
      if (record.entity?.isValid) record.entity.remove();
    }
  }
  bindSubLevel(ownerId, handle, bindings) {
    for (const binding of bindings) {
      const block = handle.getBlockAtLocalLocation(binding.localLocation);
      const profile = block ? this.#profilesByBlockTypeId.get(block.typeId) : void 0;
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
      this.#storageIdBySubLevelBlock.set(
        subLevelBlockKey(handle.id, binding.localLocation),
        binding.storageId
      );
      if (record.entity?.isValid && !record.active) this.#queueAttach(record);
    }
  }
  /** Roll back runtime ownership when a restored sub-level fails before commit. */
  rollbackSubLevelBinding(ownerId, handle) {
    for (const record of this.#recordByStorageId.values()) {
      if (record.ownerId !== ownerId || record.handle !== handle) continue;
      if (record.attached && record.entity?.isValid && handle.isValid) {
        handle.detachPersistentEntity(record.entity);
      }
      this.#storageIdBySubLevelBlock.delete(
        subLevelBlockKey(handle.id, record.localLocation)
      );
      this.#setRecordHandle(record, void 0);
      record.attached = false;
      record.lastLocation = void 0;
    }
  }
  createStorage(ownerId, handle, localLocation) {
    const block = handle.getBlockAtLocalLocation(localLocation);
    const profile = block ? this.#profilesByBlockTypeId.get(block.typeId) : void 0;
    if (!profile) {
      throw new Error(`No container profile covers the block at ${subLevelBlockKey(handle.id, localLocation)}.`);
    }
    const entity = handle.dimension.spawnEntity(
      profile.storageEntityTypeId,
      storageLocationFromCellCenter(handle.localPointToWorld(localLocation), profile)
    );
    try {
      const storageId = entity.id;
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
      const record = {
        active: false,
        handle: void 0,
        attached: false,
        claimed: true,
        entity,
        localLocation: { ...localLocation },
        ownerId,
        pendingAttachTick: void 0,
        previewers: /* @__PURE__ */ new Set(),
        profile,
        storageId,
        viewers: /* @__PURE__ */ new Set()
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
  discardStorage(storageId) {
    const record = this.#requiredRecord(storageId);
    const handle = record.handle;
    if (record.handle?.isValid && record.entity?.isValid) {
      record.handle.detachPersistentEntity(record.entity);
    }
    this.#removeRecordIndexes(record);
    if (record.entity?.isValid) record.entity.remove();
    this.#removeUnusedStorageCarrier(handle);
  }
  settleStorages(ownerId, bindings, dimension, resolveLocation) {
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
      system.run(() => {
        if (entity.isValid) entity.remove();
      });
      this.#removeRecordIndexes(record);
      this.#removeUnusedStorageCarrier(record.handle);
    }
  }
  #claimBinding(ownerId, binding) {
    let record = this.#recordByStorageId.get(binding.storageId);
    if (!record) {
      record = {
        active: false,
        attached: false,
        claimed: true,
        localLocation: { ...binding.localLocation },
        ownerId,
        pendingAttachTick: void 0,
        previewers: /* @__PURE__ */ new Set(),
        storageId: binding.storageId,
        viewers: /* @__PURE__ */ new Set()
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
  #assignProfile(record, profile) {
    if (record.profile && record.profile !== profile) {
      throw new Error(`Storage ${record.storageId} is claimed by two container profiles.`);
    }
    record.profile = profile;
  }
  #requireProfile(record) {
    if (!record.profile) {
      throw new Error(`Storage ${record.storageId} has no resolved container profile.`);
    }
    return record.profile;
  }
  #recordAt(handle, localLocation) {
    const storageId = this.#storageIdBySubLevelBlock.get(
      subLevelBlockKey(handle.id, localLocation)
    );
    return storageId ? this.#recordByStorageId.get(storageId) : void 0;
  }
  #recordForEntity(entity) {
    const storageId = this.#storageIdByEntityId.get(entity.id) ?? entity.getDynamicProperty(STORAGE_ID_PROPERTY);
    return typeof storageId === "string" ? this.#recordByStorageId.get(storageId) : void 0;
  }
  #requiredRecord(storageId) {
    const record = this.#recordByStorageId.get(storageId);
    if (!record) throw new Error(`Storage ${storageId} is not registered.`);
    return record;
  }
  #activeStorageLocation(record, handle, localLocation) {
    return storageLocationFromCellCenter(
      handle.localPointToWorld(localLocation),
      this.#requireProfile(record)
    );
  }
  #activate(record) {
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
  #deactivate(record) {
    if (!record.active || record.previewers.size > 0 || record.viewers.size > 0) return;
    const entity = record.entity;
    if (!entity?.isValid) return;
    entity.triggerEvent(this.#requireProfile(record).deactivateEvent);
    record.active = false;
    this.#activeRecords.delete(record);
    record.lastLocation = void 0;
    this.#attach(record);
  }
  #queueAttach(record) {
    if (record.pendingAttachTick !== void 0) return;
    record.pendingAttachTick = system.currentTick;
    system.run(() => this.#completeQueuedAttach(record));
  }
  #completeQueuedAttach(record) {
    const queuedTick = record.pendingAttachTick;
    if (queuedTick === void 0) return;
    if (this.#recordByStorageId.get(record.storageId) !== record || record.active || record.attached || !record.entity?.isValid || !record.handle?.isValid) {
      record.pendingAttachTick = void 0;
      return;
    }
    const vehicle = record.entity.getComponent("minecraft:riding")?.entityRidingOn;
    if (vehicle) {
      if (system.currentTick - queuedTick >= STORAGE_DETACH_TIMEOUT_TICKS) {
        record.pendingAttachTick = void 0;
        throw new Error(
          `Storage ${record.storageId} did not detach from carrier ${vehicle.id} before attaching to sub-level ${record.handle.id}.`
        );
      }
      system.run(() => this.#completeQueuedAttach(record));
      return;
    }
    record.pendingAttachTick = void 0;
    this.#attach(record);
  }
  #attach(record) {
    const entity = record.entity;
    const handle = record.handle;
    if (!entity?.isValid || !handle?.isValid) return;
    if (!handle.attachPersistentEntity(entity)) {
      throw new Error(`Storage ${record.storageId} could not attach to its sub-level carrier.`);
    }
    record.attached = true;
  }
  #releasePreview(playerId, storageId) {
    if (this.#previewStorageByPlayer.get(playerId) === storageId) {
      this.#previewStorageByPlayer.delete(playerId);
    }
    const record = this.#recordByStorageId.get(storageId);
    if (!record) return;
    record.previewers.delete(playerId);
    this.#deactivate(record);
  }
  #releaseViewer(playerId, storageId) {
    if (this.#viewerStorageByPlayer.get(playerId) === storageId) {
      this.#viewerStorageByPlayer.delete(playerId);
    }
    const record = this.#recordByStorageId.get(storageId);
    if (!record || !record.viewers.delete(playerId)) return;
    if (record.viewers.size === 0) this.#setOpen(record, false);
    this.#deactivate(record);
  }
  #openContainer(player, entity) {
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
  #closeContainer(playerId, entity) {
    const record = this.#recordForEntity(entity);
    if (!record) return;
    this.#releaseViewer(playerId, record.storageId);
  }
  #setOpen(record, open) {
    const handle = record.handle;
    if (!handle?.isValid) return;
    const profile = this.#requireProfile(record);
    if (profile.openStateDimension !== void 0) {
      if (!handle.setBlockModelState(record.localLocation, profile.openStateDimension, open ? 1 : 0)) {
        throw new Error(`Could not set container ${record.storageId} open state to ${open}.`);
      }
    }
    const dimension = handle.dimension;
    const location = handle.localPointToWorld(record.localLocation);
    if (open) {
      const sound2 = profile.openSound;
      if (sound2) dimension.playSound(sound2.id, location, { pitch: sound2.pitch, volume: sound2.volume });
      return;
    }
    const sound = profile.closeSound;
    if (!sound) return;
    system.runTimeout(() => {
      dimension.playSound(sound.id, location, { pitch: sound.pitch, volume: sound.volume });
    }, sound.delayTicks);
  }
  #invalidateRuntimeReferences(record) {
    this.#activeRecords.delete(record);
    record.active = false;
    record.attached = false;
    record.lastLocation = void 0;
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
    if (wasOpen && record.handle?.isValid && record.handle.getBlockAtLocalLocation(record.localLocation)?.typeId === record.profile?.blockTypeId) this.#setOpen(record, false);
  }
  #removeRecordIndexes(record) {
    record.pendingAttachTick = void 0;
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
  #setRecordHandle(record, handle) {
    const previousDimensionId = record.handle?.dimension.id;
    const nextDimensionId = handle?.dimension.id;
    record.handle = handle;
    if (previousDimensionId === nextDimensionId) return;
    this.#adjustRecordCount(previousDimensionId, -1);
    this.#adjustRecordCount(nextDimensionId, 1);
  }
  #adjustRecordCount(dimensionId, delta) {
    if (dimensionId === void 0) return;
    const next = (this.#recordCountByDimension.get(dimensionId) ?? 0) + delta;
    if (next < 0) {
      throw new Error(`Container storage count for dimension ${dimensionId} became negative.`);
    }
    if (next === 0) this.#recordCountByDimension.delete(dimensionId);
    else this.#recordCountByDimension.set(dimensionId, next);
  }
  #removeUnusedStorageCarrier(handle) {
    if (!handle?.isValid) return;
    for (const record of this.#recordByStorageId.values()) {
      if (record.handle === handle) return;
    }
    handle.removeEmptyPersistentEntityCarriers();
  }
}
function readStorageIdentity(entity) {
  const storageId = entity.getDynamicProperty(STORAGE_ID_PROPERTY);
  const ownerId = entity.getDynamicProperty(STORAGE_OWNER_PROPERTY);
  const localLocation = entity.getDynamicProperty(STORAGE_LOCATION_PROPERTY);
  if (typeof storageId !== "string" || storageId.length === 0 || typeof ownerId !== "string" || ownerId.length === 0 || !isIntegerVector(localLocation)) {
    throw new Error(`Container storage entity ${entity.id} has invalid persistent identity.`);
  }
  return { localLocation, ownerId, storageId };
}
function assertStorageIdentity(record, identity) {
  if (record.storageId !== identity.storageId || record.ownerId !== identity.ownerId || !sameLocation(record.localLocation, identity.localLocation)) {
    throw new Error(`Storage ${identity.storageId} has conflicting persistent ownership.`);
  }
}
function storageLocationFromCellCenter(center, profile) {
  return {
    x: center.x,
    y: center.y - profile.collisionHeight * 0.5,
    z: center.z
  };
}
function subLevelBlockKey(subLevelId, localLocation) {
  return `${subLevelId}|${localLocation.x},${localLocation.y},${localLocation.z}`;
}
function sameLocation(left, right) {
  return left.x === right.x && left.y === right.y && left.z === right.z;
}
function isIntegerVector(value) {
  if (!value || typeof value !== "object") return false;
  const vector = value;
  return Number.isInteger(vector.x) && Number.isInteger(vector.y) && Number.isInteger(vector.z);
}
export {
  SubLevelContainerInteractionController
};
