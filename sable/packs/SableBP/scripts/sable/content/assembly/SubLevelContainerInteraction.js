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
const CHEST_ENTITY_TYPE_ID = "sable:chest";
const CHEST_BLOCK_TYPE_ID = "minecraft:chest";
const CHEST_NAME_TRANSLATION_KEY = "tile.chest.name";
const STORAGE_ID_PROPERTY = "sable:storage_id";
const STORAGE_OWNER_PROPERTY = "sable:storage_owner";
const STORAGE_LOCATION_PROPERTY = "sable:storage_location";
const ACTIVE_EVENT = "sable:chest_activate";
const INACTIVE_EVENT = "sable:chest_deactivate";
const STORAGE_COLLISION_HEIGHT = 0.875;
const POSITION_EPSILON_SQUARED = EPSILON_1E6;
const STORAGE_DETACH_TIMEOUT_TICKS = 20;
const CHEST_CLOSE_SOUND_DELAY_TICKS = 1;
class SubLevelContainerInteractionController {
  #activeRecords = /* @__PURE__ */ new Set();
  #recordByStorageId = /* @__PURE__ */ new Map();
  #recordCountByDimension = /* @__PURE__ */ new Map();
  #storageIdBySubLevelBlock = /* @__PURE__ */ new Map();
  #storageIdByEntityId = /* @__PURE__ */ new Map();
  #previewStorageByPlayer = /* @__PURE__ */ new Map();
  #viewerStorageByPlayer = /* @__PURE__ */ new Map();
  #nativeDeathEntityIds = /* @__PURE__ */ new Set();
  #settlingEntityIds = /* @__PURE__ */ new Set();
  #nativeDeathHandler;
  #bindingRegistrationComplete = false;
  #started = false;
  setNativeDeathHandler(handler) {
    if (this.#nativeDeathHandler) {
      throw new Error("The chest storage native-death handler is already configured.");
    }
    this.#nativeDeathHandler = handler;
  }
  start() {
    if (this.#started) return;
    this.#started = true;
    world.beforeEvents.playerInteractWithEntity.subscribe((event) => {
      if (event.target.typeId !== CHEST_ENTITY_TYPE_ID) return;
      const record = this.#recordForEntity(event.target);
      if (record?.handle?.isValid && record.active) return;
      event.cancel = true;
      if (!record) {
        system.run(() => {
          throw new Error(`Unbound chest storage entity ${event.target.id} was interacted with.`);
        });
      }
    });
    world.afterEvents.entityContainerOpened.subscribe((event) => {
      if (event.entity.typeId !== CHEST_ENTITY_TYPE_ID) return;
      const player = event.openSource.entity;
      if (player?.typeId !== "minecraft:player") return;
      this.#openContainer(player, event.entity);
    });
    world.afterEvents.entityContainerClosed.subscribe((event) => {
      if (event.entity.typeId !== CHEST_ENTITY_TYPE_ID) return;
      const player = event.closeSource.entity;
      if (player?.typeId !== "minecraft:player") return;
      this.#closeContainer(player.id, event.entity);
    });
    world.afterEvents.entityDie.subscribe((event) => {
      if (event.deadEntity.typeId !== CHEST_ENTITY_TYPE_ID) return;
      if (!this.#settlingEntityIds.has(event.deadEntity.id) && this.#storageIdByEntityId.has(event.deadEntity.id)) this.#nativeDeathEntityIds.add(event.deadEntity.id);
      if (event.deadEntity.isValid) event.deadEntity.remove();
    });
    world.afterEvents.entityRemove.subscribe((event) => {
      if (event.typeId !== CHEST_ENTITY_TYPE_ID) return;
      this.handleEntityRemove(event.removedEntityId);
    });
    system.run(() => {
      for (const dimensionId of VANILLA_DIMENSION_IDS) {
        const dimension = world.getDimension(dimensionId);
        for (const entity of dimension.getEntities({ type: CHEST_ENTITY_TYPE_ID })) {
          this.handleEntityLoad(entity);
        }
      }
    });
  }
  canInteract(_handle, block) {
    if (block.typeId !== CHEST_BLOCK_TYPE_ID) return false;
    return resolveFancySubLevelBlock(block)?.model.description.type === "chest";
  }
  /** Native entity interaction opens the container; this only consumes sub-level gestures. */
  interact(_player, handle, block) {
    if (!this.canInteract(handle, block)) return false;
    const record = this.#recordAt(handle, block.localLocation);
    if (!record?.entity?.isValid) {
      throw new Error(`Projected chest ${subLevelBlockKey(handle.id, block.localLocation)} has no storage entity.`);
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
      const location = activeStorageLocation(record.handle, record.localLocation);
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
        pendingAttachTick: void 0,
        previewers: /* @__PURE__ */ new Set(),
        storageId: identity.storageId,
        viewers: /* @__PURE__ */ new Set()
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
  handleEntityRemove(entityId) {
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
    record.entity = void 0;
    record.active = false;
    record.attached = false;
    record.lastLocation = void 0;
    this.#invalidateRuntimeReferences(record);
  }
  registerSavedBindings(ownerId, bindings) {
    if (this.#bindingRegistrationComplete) {
      throw new Error("Saved chest storage bindings were registered after reconciliation completed.");
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
  #activate(record) {
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
  #deactivate(record) {
    if (!record.active || record.previewers.size > 0 || record.viewers.size > 0) return;
    const entity = record.entity;
    if (!entity?.isValid) return;
    entity.triggerEvent(INACTIVE_EVENT);
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
    if (wasOpen && record.handle?.isValid && record.handle.getBlockAtLocalLocation(record.localLocation)?.typeId === CHEST_BLOCK_TYPE_ID) this.#setOpen(record, false);
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
      throw new Error(`Chest storage count for dimension ${dimensionId} became negative.`);
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
    throw new Error(`Chest storage entity ${entity.id} has invalid persistent identity.`);
  }
  return { localLocation, ownerId, storageId };
}
function assertStorageIdentity(record, identity) {
  if (record.storageId !== identity.storageId || record.ownerId !== identity.ownerId || !sameLocation(record.localLocation, identity.localLocation)) {
    throw new Error(`Storage ${identity.storageId} has conflicting persistent ownership.`);
  }
}
function activeStorageLocation(handle, localLocation) {
  return storageLocationFromCellCenter(handle.localPointToWorld(localLocation));
}
function storageLocationFromCellCenter(center) {
  return {
    x: center.x,
    y: center.y - STORAGE_COLLISION_HEIGHT * 0.5,
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
  CHEST_ENTITY_TYPE_ID,
  SubLevelContainerInteractionController
};
