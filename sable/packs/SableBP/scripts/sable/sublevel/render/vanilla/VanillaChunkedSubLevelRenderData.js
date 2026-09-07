import {
  BLOCK_CARRIER_CAPACITY,
  BLOCK_CARRIER_ENTITY_TYPE_ID
} from "../SubLevelRenderData.js";
import { selectSubLevelRenderAnchor } from "../../../util/SublevelRenderOffsetHelper.js";
import {
  RENDER_POSITION_WRITE_THRESHOLD,
  RENDER_ROTATION_WRITE_THRESHOLD_DEGREES,
  getContinuousRenderRotation,
  hasExactRiders,
  ejectCurrentVehicle,
  nativeRiders,
  hasRidersConsistentWithPendingMounts,
  scheduleRiderMountConfirmation,
  exceedsWriteThreshold,
  validEntityLocations
} from "../SubLevelRenderEntityUtils.js";
class VanillaChunkedSubLevelRenderData {
  #assignments = /* @__PURE__ */ new Map();
  #carriers = [];
  #carrierByBlockEntityId = /* @__PURE__ */ new Map();
  #body;
  #rendersByEntityId = /* @__PURE__ */ new Map();
  #onEntityRemoved;
  #onEntityAdded;
  #spawnEntity;
  #renderAnchor;
  #lastRenderX = Number.NaN;
  #lastRenderY = Number.NaN;
  #lastRenderZ = Number.NaN;
  #initialPoseDeferred = true;
  #knownIntegrityFailure = false;
  #sleepingAtLastSync = false;
  #renderRotation;
  #publishedRenderRotation = {
    x: Number.NaN,
    y: Number.NaN,
    z: Number.NaN
  };
  get initialPoseDeferred() {
    return this.#initialPoseDeferred;
  }
  get renderRotation() {
    return this.#publishedRenderRotation;
  }
  get renderAnchorLocal() {
    return { ...this.#renderAnchor };
  }
  constructor(body, assignments, carriers, onEntityRemoved, renderAnchor = selectSubLevelRenderAnchor(
    assignments.map((assignment) => assignment.block)
  ), spawnEntity, onEntityAdded) {
    this.#body = body;
    this.#onEntityRemoved = onEntityRemoved;
    this.#onEntityAdded = onEntityAdded;
    this.#spawnEntity = spawnEntity;
    this.#renderAnchor = { ...renderAnchor };
    for (const carrier of carriers) {
      const liveCarrier = {
        auxiliaryRiderIds: /* @__PURE__ */ new Set(),
        dedicatedToPersistentRiders: false,
        entity: carrier.entity,
        pendingRiderIds: /* @__PURE__ */ new Set(),
        persistentRiders: /* @__PURE__ */ new Map(),
        persistentRiderIds: /* @__PURE__ */ new Set(),
        riderIds: new Set(carrier.riderIds)
      };
      this.#carriers.push(liveCarrier);
      for (const riderId of liveCarrier.riderIds) {
        this.#carrierByBlockEntityId.set(riderId, liveCarrier);
      }
    }
    for (const assignment of assignments) {
      const key = blockKey(assignment.block.localLocation);
      let render = this.#rendersByEntityId.get(assignment.entity.id);
      if (!render) {
        render = { blockKeys: /* @__PURE__ */ new Set(), entity: assignment.entity };
        this.#rendersByEntityId.set(assignment.entity.id, render);
      }
      render.blockKeys.add(key);
      this.#assignments.set(key, {
        entity: assignment.entity,
        slot: assignment.slot,
        render
      });
    }
    for (const carrier of this.#carriers) {
      for (const riderId of carrier.riderIds) {
        const rider = this.#rendersByEntityId.get(riderId)?.entity;
        if (!rider) {
          throw new Error(
            `Block carrier ${carrier.entity.id} references unknown render ${riderId}.`
          );
        }
        scheduleRiderMountConfirmation(
          carrier.entity,
          rider,
          carrier.pendingRiderIds,
          () => this.#body.isValid && carrier.riderIds.has(riderId),
          () => {
            this.#knownIntegrityFailure = true;
          },
          "render"
        );
      }
    }
  }
  get entityCount() {
    return [...this.#rendersByEntityId.values()].filter((render) => render.entity.isValid).length + this.#carriers.filter((carrier) => carrier.entity.isValid).length;
  }
  get entityIds() {
    return [
      ...[...this.#rendersByEntityId.keys()].filter((entityId) => this.hasEntity(entityId)),
      ...this.#carriers.filter((carrier) => carrier.entity.isValid).map((carrier) => carrier.entity.id)
    ];
  }
  get entityLocations() {
    return validEntityLocations([
      ...[...this.#rendersByEntityId.values()].map((render) => render.entity),
      ...this.#carriers.map((carrier) => carrier.entity)
    ]);
  }
  get firstEntityLocation() {
    return this.entityLocations[0];
  }
  hasEntity(entityId) {
    if (this.#rendersByEntityId.get(entityId)?.entity.isValid === true) return true;
    return this.#carriers.some(
      (carrier) => carrier.entity.id === entityId && carrier.entity.isValid
    );
  }
  hasIntactEntities() {
    if (this.#knownIntegrityFailure) return false;
    const hasBlockRenders = this.#assignments.size > 0;
    if (hasBlockRenders !== this.#rendersByEntityId.size > 0) return false;
    if (hasBlockRenders && this.#carriers.length === 0) return false;
    let assignedBlockCount = 0;
    for (const render of this.#rendersByEntityId.values()) {
      if (!render.entity.isValid || render.blockKeys.size === 0) return false;
      assignedBlockCount += render.blockKeys.size;
    }
    if (assignedBlockCount !== this.#assignments.size) return false;
    for (const carrier of this.#carriers) {
      const intact = carrier.pendingRiderIds.size > 0 ? hasRidersConsistentWithPendingMounts(
        carrier.entity,
        carrier.riderIds,
        carrier.auxiliaryRiderIds,
        carrier.persistentRiderIds,
        carrier.pendingRiderIds
      ) : hasExactRiders(
        carrier.entity,
        carrier.riderIds,
        carrier.auxiliaryRiderIds,
        carrier.persistentRiderIds
      );
      if (!intact) return false;
    }
    return true;
  }
  hasKnownIntegrityFailure() {
    return this.#knownIntegrityFailure;
  }
  attachAuxiliaryRider(entity) {
    if (!entity.isValid) return false;
    const carrier = this.#carriers.find((value) => !value.dedicatedToPersistentRiders && value.entity.isValid && value.auxiliaryRiderIds.size === 0);
    if (!carrier || carrier.riderIds.size > BLOCK_CARRIER_CAPACITY) return false;
    if (!carrier.entity.getComponent("minecraft:rideable")?.addRider(entity)) return false;
    carrier.auxiliaryRiderIds.add(entity.id);
    this.#syncAuxiliaryRotation(entity);
    return true;
  }
  detachAuxiliaryRider(entity) {
    const carrier = this.#carriers.find((value) => value.auxiliaryRiderIds.has(entity.id));
    if (!carrier) return;
    carrier.auxiliaryRiderIds.delete(entity.id);
    if (carrier.entity.isValid && entity.isValid) {
      carrier.entity.getComponent("minecraft:rideable")?.ejectRider(entity);
    }
    this.#removeEmptyCarrier(carrier);
  }
  attachPersistentRider(entity) {
    if (!entity.isValid || !this.#spawnEntity) return false;
    let carrier = this.#carriers.find((value) => value.dedicatedToPersistentRiders && value.entity.isValid && value.persistentRiderIds.size < BLOCK_CARRIER_CAPACITY);
    if (!carrier) {
      const carrierEntity = this.#spawnEntity(
        BLOCK_CARRIER_ENTITY_TYPE_ID,
        this.#body.localPointToWorld(this.#renderAnchor)
      );
      if (!carrierEntity.getComponent("minecraft:rideable")) {
        carrierEntity.remove();
        throw new Error("Vanilla block carrier does not expose minecraft:rideable.");
      }
      carrier = {
        auxiliaryRiderIds: /* @__PURE__ */ new Set(),
        dedicatedToPersistentRiders: true,
        entity: carrierEntity,
        pendingRiderIds: /* @__PURE__ */ new Set(),
        persistentRiders: /* @__PURE__ */ new Map(),
        persistentRiderIds: /* @__PURE__ */ new Set(),
        riderIds: /* @__PURE__ */ new Set()
      };
      this.#carriers.push(carrier);
      this.#onEntityAdded?.(carrierEntity.id);
    }
    ejectCurrentVehicle(entity);
    if (!carrier.entity.getComponent("minecraft:rideable")?.addRider(entity)) return false;
    carrier.persistentRiders.set(entity.id, entity);
    carrier.persistentRiderIds.add(entity.id);
    scheduleRiderMountConfirmation(
      carrier.entity,
      entity,
      carrier.pendingRiderIds,
      () => this.#body.isValid && carrier.persistentRiderIds.has(entity.id),
      () => {
        this.#knownIntegrityFailure = true;
      },
      "persistent"
    );
    return true;
  }
  detachPersistentRider(entity, preserveEmptyCarrier = false) {
    const carrier = this.#carriers.find((value) => value.persistentRiderIds.has(entity.id));
    if (!carrier) return;
    if (carrier.entity.isValid && entity.isValid) {
      carrier.entity.getComponent("minecraft:rideable")?.ejectRider(entity);
    }
    carrier.pendingRiderIds.delete(entity.id);
    carrier.persistentRiders.delete(entity.id);
    carrier.persistentRiderIds.delete(entity.id);
    if (!preserveEmptyCarrier) this.#removeEmptyCarrier(carrier, true);
  }
  removeEmptyPersistentRiderCarriers() {
    for (const carrier of [...this.#carriers]) this.#removeEmptyCarrier(carrier, true);
  }
  transferPersistentRidersTo(target) {
    const riders = this.#carriers.flatMap((carrier) => [...carrier.persistentRiders.values()].filter((entity) => entity.isValid));
    if (riders.length === 0) return;
    const detached = [];
    try {
      for (const rider of riders) {
        detached.push(rider);
        this.detachPersistentRider(rider, true);
        if (!target.attachPersistentRider?.(rider)) {
          throw new Error(`Could not reattach persistent sub-level entity ${rider.id}.`);
        }
      }
    } catch (error) {
      for (const rider of detached) {
        target.detachPersistentRider?.(rider);
        if (!this.attachPersistentRider(rider)) {
          throw new Error(`Could not restore persistent sub-level entity ${rider.id}.`);
        }
      }
      throw error;
    }
  }
  releaseInitialPose() {
    if (!this.#initialPoseDeferred) return;
    for (const render of this.#rendersByEntityId.values()) {
      if (!render.entity.isValid) {
        this.#knownIntegrityFailure = true;
        continue;
      }
      render.entity.setProperty("sable:scale", 1);
    }
    this.#initialPoseDeferred = false;
  }
  removeBlocks(blockKeys) {
    for (const key of blockKeys) {
      const assignment = this.#assignments.get(key);
      if (!assignment) continue;
      const { entity, slot, render } = assignment;
      if (render.blockKeys.size > 1 && entity.isValid) {
        entity.runCommand(`replaceitem entity @s slot.weapon.${slot} 0 minecraft:air`);
      }
      this.#assignments.delete(key);
      render.blockKeys.delete(key);
      if (render.blockKeys.size > 0) continue;
      this.#rendersByEntityId.delete(entity.id);
      this.#onEntityRemoved?.(entity.id);
      if (entity.isValid) entity.remove();
      const carrier = this.#carrierByBlockEntityId.get(entity.id);
      this.#carrierByBlockEntityId.delete(entity.id);
      if (!carrier) continue;
      carrier.pendingRiderIds.delete(entity.id);
      carrier.riderIds.delete(entity.id);
      this.#removeEmptyCarrier(carrier);
    }
  }
  remove() {
    for (const render of this.#rendersByEntityId.values()) {
      this.#onEntityRemoved?.(render.entity.id);
      if (render.entity.isValid) render.entity.remove();
    }
    for (const carrier of this.#carriers) {
      carrier.pendingRiderIds.clear();
      for (const rider of nativeRiders(carrier.entity)) {
        if (carrier.auxiliaryRiderIds.has(rider.id) && rider.isValid) rider.remove();
        else if (carrier.persistentRiderIds.has(rider.id) && rider.isValid) {
          carrier.entity.getComponent("minecraft:rideable")?.ejectRider(rider);
        }
      }
      this.#onEntityRemoved?.(carrier.entity.id);
      if (carrier.entity.isValid) carrier.entity.remove();
    }
    this.#assignments.clear();
    this.#rendersByEntityId.clear();
    this.#carriers.length = 0;
    this.#carrierByBlockEntityId.clear();
  }
  sync(force = false) {
    let writes = 0;
    if (!this.#body.isValid) return writes;
    const sleeping = this.#body.isSleeping === true;
    if (!force && sleeping && this.#sleepingAtLastSync) return writes;
    this.#sleepingAtLastSync = sleeping;
    const rotation = getContinuousRenderRotation(this.#body, this.#renderRotation);
    this.#renderRotation = rotation;
    const renderAnchor = this.#body.localPointToWorld(this.#renderAnchor);
    const positionChanged = force || exceedsWriteThreshold(
      renderAnchor.x,
      this.#lastRenderX,
      RENDER_POSITION_WRITE_THRESHOLD
    ) || exceedsWriteThreshold(
      renderAnchor.y,
      this.#lastRenderY,
      RENDER_POSITION_WRITE_THRESHOLD
    ) || exceedsWriteThreshold(
      renderAnchor.z,
      this.#lastRenderZ,
      RENDER_POSITION_WRITE_THRESHOLD
    );
    const pitchChanged = force || exceedsWriteThreshold(
      rotation.x,
      this.#publishedRenderRotation.x,
      RENDER_ROTATION_WRITE_THRESHOLD_DEGREES
    );
    const yawChanged = force || exceedsWriteThreshold(
      rotation.y,
      this.#publishedRenderRotation.y,
      RENDER_ROTATION_WRITE_THRESHOLD_DEGREES
    );
    const rollChanged = force || exceedsWriteThreshold(
      rotation.z,
      this.#publishedRenderRotation.z,
      RENDER_ROTATION_WRITE_THRESHOLD_DEGREES
    );
    if (!positionChanged && !pitchChanged && !yawChanged && !rollChanged) return writes;
    if (positionChanged) {
      this.#lastRenderX = renderAnchor.x;
      this.#lastRenderY = renderAnchor.y;
      this.#lastRenderZ = renderAnchor.z;
    }
    if (pitchChanged) this.#publishedRenderRotation.x = rotation.x;
    if (yawChanged) this.#publishedRenderRotation.y = rotation.y;
    if (rollChanged) this.#publishedRenderRotation.z = rotation.z;
    if (positionChanged) {
      for (const carrier of this.#carriers) {
        if (!carrier.entity.isValid) {
          this.#knownIntegrityFailure = true;
          continue;
        }
        carrier.entity.teleport(renderAnchor);
        writes++;
      }
    }
    for (const render of this.#rendersByEntityId.values()) {
      const entity = render.entity;
      if (!entity.isValid) {
        this.#knownIntegrityFailure = true;
        continue;
      }
      if (pitchChanged) entity.setProperty("sable:pitch", rotation.x);
      if (yawChanged) entity.setProperty("sable:yaw", rotation.y);
      if (rollChanged) entity.setProperty("sable:roll", rotation.z);
      if (pitchChanged || yawChanged || rollChanged) writes++;
    }
    if (pitchChanged || yawChanged || rollChanged) {
      for (const carrier of this.#carriers) {
        for (const rider of nativeRiders(carrier.entity)) {
          if (!carrier.auxiliaryRiderIds.has(rider.id)) continue;
          this.#syncAuxiliaryRotation(rider);
          writes++;
        }
      }
    }
    return writes;
  }
  #syncAuxiliaryRotation(entity) {
    const rotation = this.#renderRotation;
    if (!entity.isValid || !rotation) return;
    entity.setProperty("sable:pitch", rotation.x);
    entity.setProperty("sable:yaw", rotation.y);
    entity.setProperty("sable:roll", rotation.z);
  }
  #removeEmptyCarrier(carrier, removeDedicated = false) {
    if (carrier.riderIds.size > 0 || carrier.auxiliaryRiderIds.size > 0 || carrier.persistentRiderIds.size > 0 || carrier.dedicatedToPersistentRiders && !removeDedicated) return;
    const carrierIndex = this.#carriers.indexOf(carrier);
    if (carrierIndex >= 0) this.#carriers.splice(carrierIndex, 1);
    this.#onEntityRemoved?.(carrier.entity.id);
    if (carrier.entity.isValid) carrier.entity.remove();
  }
}
function blockKey(location) {
  return `${location.x},${location.y},${location.z}`;
}
export {
  VanillaChunkedSubLevelRenderData
};
