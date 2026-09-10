import { system } from "@minecraft/server";
import { CARRIER_SEAT_COUNT } from "../../SubLevelRenderData.js";
import {
  RENDER_POSITION_WRITE_THRESHOLD,
  RENDER_ROTATION_WRITE_THRESHOLD_DEGREES,
  ejectCurrentVehicle,
  exceedsWriteThreshold,
  getContinuousRenderRotation,
  hasExactRiders,
  hasRidersConsistentWithPendingMounts,
  nativeRiders,
  scheduleRiderMountConfirmation,
  validEntityLocations
} from "../../SubLevelRenderEntityUtils.js";
import { findSubLevelRenderAnchor } from "../../../../util/SublevelRenderOffsetHelper.js";
import {
  encodeFancySubLevelOriginY,
  packFancySubLevelOrigin
} from "./FancySubLevelModelCodec.js";
import {
  packFancySubLevelModels
} from "./FancySubLevelModelLayout.js";
import { resolveFancySubLevelBlock } from "./FancySubLevelModelRegistry.js";
import { packFancySubLevelTint } from "./FancySubLevelTintCodec.js";
const FANCY_MODEL_CARRIER_ENTITY_TYPE_ID = "sable:fancy_model_carrier";
const FANCY_MODEL_CARRIER_CAPACITY = CARRIER_SEAT_COUNT - 1;
const FANCY_MODEL_INPUT_ANIMATION = "animation.sable.fancy.input";
const INPUT_REFRESH_TICKS = 40;
class FancySubLevelModelRenderer {
  #assignments = /* @__PURE__ */ new Map();
  #body;
  #carrierByModelId = /* @__PURE__ */ new Map();
  #carriers = [];
  #foliageTint;
  #models = [];
  #modelByEntityId = /* @__PURE__ */ new Map();
  #onEntityAdded;
  #onEntityRemoved;
  #spawnEntity;
  #initialPoseDeferred = true;
  #lastInputRefreshTick = system.currentTick;
  #knownIntegrityFailure = false;
  #lastAnchorX = Number.NaN;
  #lastAnchorY = Number.NaN;
  #lastAnchorZ = Number.NaN;
  #poseReady = false;
  #renderAnchor;
  #renderAnchorRevision = 0;
  #renderRotation;
  #sleepingAtLastSync = false;
  #publishedRenderRotation = {
    x: Number.NaN,
    y: Number.NaN,
    z: Number.NaN
  };
  supportsBlockAddition = true;
  emitsEntityAddedCallbacks = true;
  constructor(body, models, spawnEntity, foliageTint, onEntityRemoved, renderAnchor, onEntityAdded) {
    this.#body = body;
    this.#foliageTint = foliageTint;
    this.#onEntityAdded = onEntityAdded;
    this.#onEntityRemoved = onEntityRemoved;
    this.#spawnEntity = spawnEntity;
    this.#renderAnchor = { ...renderAnchor };
    try {
      this.#appendModels(models);
    } catch (error) {
      this.remove();
      throw error;
    }
  }
  get initialPoseDeferred() {
    return this.#initialPoseDeferred;
  }
  get renderRotation() {
    return this.#publishedRenderRotation;
  }
  get renderAnchorLocal() {
    return { ...this.#renderAnchor };
  }
  get entityCount() {
    return this.#models.filter((model) => model.entity.isValid).length + this.#carriers.filter((carrier) => carrier.entity.isValid).length;
  }
  get entityIds() {
    return [
      ...this.#models.filter((model) => model.entity.isValid).map((model) => model.entity.id),
      ...this.#carriers.filter((carrier) => carrier.entity.isValid).map((carrier) => carrier.entity.id)
    ];
  }
  get entityLocations() {
    return validEntityLocations([
      ...this.#models.map((model) => model.entity),
      ...this.#carriers.map((carrier) => carrier.entity)
    ]);
  }
  get firstEntityLocation() {
    return this.entityLocations[0];
  }
  hasEntity(entityId) {
    return this.#modelByEntityId.get(entityId)?.entity.isValid === true || this.#carriers.some((carrier) => carrier.entity.id === entityId && carrier.entity.isValid);
  }
  hasKnownIntegrityFailure() {
    return this.#knownIntegrityFailure;
  }
  hasIntactEntities() {
    if (this.#knownIntegrityFailure || this.#models.length > 0 && this.#carriers.length === 0) {
      return false;
    }
    if (this.#models.some((model) => !model.entity.isValid)) return false;
    for (const carrier of this.#carriers) {
      const intact = carrier.pendingRiderIds.size > 0 ? hasRidersConsistentWithPendingMounts(
        carrier.entity,
        carrier.modelIds,
        carrier.auxiliaryRiderIds,
        carrier.persistentRiderIds,
        carrier.pendingRiderIds
      ) : hasExactRiders(
        carrier.entity,
        carrier.modelIds,
        carrier.auxiliaryRiderIds,
        carrier.persistentRiderIds
      );
      if (!intact) return false;
    }
    return true;
  }
  releaseInitialPose() {
    if (!this.#initialPoseDeferred) return;
    this.#setPoseReady(true);
    this.#initialPoseDeferred = false;
  }
  setBlockModelState(blockKey, dimension, value) {
    const live = this.#assignments.get(blockKey);
    if (!live || !live.assignment.state || !live.model.entity.isValid) return false;
    const current = readStoredState(live.model, live.assignment) - 1;
    const next = live.assignment.state.update(current, dimension, value);
    if (next === void 0) return false;
    if (next === current) return true;
    writeStoredState(live.model, live.assignment, next + 1);
    const storedValue = live.model.words[live.assignment.word] ?? 0;
    live.model.inputValues[`s${live.assignment.word}`] = storedValue;
    playFancyModelInput(live.model.entity, live.model.inputValues);
    return true;
  }
  attachAuxiliaryRider(entity) {
    if (!entity.isValid || this.#carriers.length === 0) return false;
    const carrier = this.#carriers.find((value) => !value.dedicatedToPersistentRiders && value.entity.isValid && value.auxiliaryRiderIds.size === 0);
    if (!carrier || !carrier.entity.isValid || carrier.auxiliaryRiderIds.size > 0 || carrier.modelIds.size > FANCY_MODEL_CARRIER_CAPACITY) return false;
    if (!carrier.entity.getComponent("minecraft:rideable")?.addRider(entity)) return false;
    carrier.auxiliaryRiderIds.add(entity.id);
    this.#syncAuxiliaryRotation(entity);
    return true;
  }
  attachPersistentRider(entity) {
    if (!entity.isValid) return false;
    let carrier = this.#carriers.find((value) => value.dedicatedToPersistentRiders && value.entity.isValid && value.persistentRiderIds.size < FANCY_MODEL_CARRIER_CAPACITY);
    carrier ??= this.#createCarrier(true);
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
  detachAuxiliaryRider(entity) {
    const carrier = this.#carriers.find((value) => value.auxiliaryRiderIds.has(entity.id));
    if (!carrier) return;
    carrier.auxiliaryRiderIds.delete(entity.id);
    if (carrier.entity.isValid && entity.isValid) {
      carrier.entity.getComponent("minecraft:rideable")?.ejectRider(entity);
    }
    this.#removeEmptyCarrier(carrier);
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
    for (const carrier of [...this.#carriers]) {
      if (carrier.dedicatedToPersistentRiders && carrier.persistentRiderIds.size === 0) {
        this.#removeEmptyCarrier(carrier, true);
      }
    }
  }
  transferPersistentRidersTo(target) {
    const persistentRiders = this.#carriers.flatMap((carrier) => [...carrier.persistentRiders.values()].filter((rider) => rider.isValid));
    if (persistentRiders.length === 0) return;
    const detached = [];
    try {
      for (const rider of persistentRiders) {
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
  removeBlocks(blockKeys) {
    const changed = /* @__PURE__ */ new Map();
    const empty = /* @__PURE__ */ new Set();
    for (const key of blockKeys) {
      const live = this.#assignments.get(key);
      if (!live) continue;
      this.#assignments.delete(key);
      writeStoredState(live.model, live.assignment, 0);
      live.model.blockCount--;
      let words = changed.get(live.model);
      if (!words) {
        words = /* @__PURE__ */ new Set();
        changed.set(live.model, words);
      }
      words.add(live.assignment.word);
      if (live.model.blockCount === 0) empty.add(live.model);
    }
    for (const [model, words] of changed) {
      if (empty.has(model) || !model.entity.isValid) continue;
      for (const word of words) {
        const value = model.words[word] ?? 0;
        model.inputValues[`s${word}`] = value;
      }
      playFancyModelInput(model.entity, model.inputValues);
    }
    for (const model of empty) this.#removeModel(model);
  }
  addBlocks(blocks) {
    const resolved = blocks.map(resolveFancySubLevelBlock);
    if (resolved.some((entry) => entry === void 0)) {
      throw new Error("Fancy model renderer received an unregistered block.");
    }
    const packed = packFancySubLevelModels(resolved);
    if (packed.unsupported.length > 0) {
      throw new Error("Fancy model renderer received an unencodable block.");
    }
    const added = this.#appendModels(packed.models);
    this.sync(true);
    if (!this.#poseReady) return;
    system.run(() => {
      if (!this.#body.isValid) return;
      for (const model of added) {
        if (this.#modelByEntityId.get(model.entity.id) === model) {
          this.#setModelPoseReady(model, true);
        }
      }
    });
  }
  rebaseRenderAnchor(blocks) {
    const nextAnchor = findSubLevelRenderAnchor(blocks);
    if (!nextAnchor || vectorsEqual(nextAnchor, this.#renderAnchor)) return;
    const resolved = blocks.map(resolveFancySubLevelBlock);
    if (resolved.some((entry) => entry === void 0)) {
      throw new Error("Fancy sub-level cannot change route during an in-place edit.");
    }
    const packed = packFancySubLevelModels(resolved);
    if (packed.unsupported.length > 0) {
      throw new Error("Fancy sub-level cannot encode the rebased model set.");
    }
    const revision = ++this.#renderAnchorRevision;
    const persistentRiders = this.#carriers.flatMap((carrier) => [...carrier.persistentRiders.values()].filter((rider) => rider.isValid));
    for (const rider of persistentRiders) ejectCurrentVehicle(rider);
    this.remove();
    this.#resetPoseState(nextAnchor);
    this.#appendModels(packed.models);
    for (const rider of persistentRiders) {
      if (!this.attachPersistentRider(rider)) {
        throw new Error(`Could not reattach persistent sub-level entity ${rider.id}.`);
      }
    }
    this.sync(true);
    system.run(() => {
      if (revision !== this.#renderAnchorRevision || !this.#body.isValid) return;
      this.sync(true);
      this.releaseInitialPose();
    });
  }
  remove() {
    for (const model of [...this.#models]) this.#removeModel(model);
    for (const carrier of [...this.#carriers]) {
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
    this.#carriers.length = 0;
    this.#carrierByModelId.clear();
    this.#assignments.clear();
  }
  sync(force = false) {
    if (!this.#body.isValid) return 0;
    const refreshInput = system.currentTick - this.#lastInputRefreshTick >= INPUT_REFRESH_TICKS;
    const sleeping = this.#body.isSleeping === true;
    if (!force && !refreshInput && sleeping && this.#sleepingAtLastSync) return 0;
    this.#sleepingAtLastSync = sleeping;
    const rotation = getContinuousRenderRotation(this.#body, this.#renderRotation);
    this.#renderRotation = rotation;
    const anchor = this.#body.localPointToWorld(this.#renderAnchor);
    const positionChanged = force || exceedsWriteThreshold(anchor.x, this.#lastAnchorX, RENDER_POSITION_WRITE_THRESHOLD) || exceedsWriteThreshold(anchor.y, this.#lastAnchorY, RENDER_POSITION_WRITE_THRESHOLD) || exceedsWriteThreshold(anchor.z, this.#lastAnchorZ, RENDER_POSITION_WRITE_THRESHOLD);
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
    if (!positionChanged && !pitchChanged && !yawChanged && !rollChanged && !refreshInput) return 0;
    if (refreshInput) this.#lastInputRefreshTick = system.currentTick;
    if (positionChanged) {
      this.#lastAnchorX = anchor.x;
      this.#lastAnchorY = anchor.y;
      this.#lastAnchorZ = anchor.z;
    }
    if (pitchChanged) this.#publishedRenderRotation.x = rotation.x;
    if (yawChanged) this.#publishedRenderRotation.y = rotation.y;
    if (rollChanged) this.#publishedRenderRotation.z = rotation.z;
    let writes = 0;
    if (positionChanged) {
      for (const carrier of this.#carriers) {
        if (!carrier.entity.isValid) {
          this.#knownIntegrityFailure = true;
          continue;
        }
        carrier.entity.teleport(anchor);
        writes++;
      }
    }
    for (const model of this.#models) {
      if (!model.entity.isValid) {
        this.#knownIntegrityFailure = true;
        continue;
      }
      if (pitchChanged || yawChanged || rollChanged || refreshInput) {
        const values = {
          pitch_target: rotation.x,
          yaw_target: rotation.y,
          roll_target: rotation.z
        };
        Object.assign(model.inputValues, values);
        playFancyModelInput(model.entity, model.inputValues);
        writes++;
      }
    }
    if (pitchChanged || yawChanged || rollChanged) {
      for (const carrier of this.#carriers) {
        for (const rider of nativeRiders(carrier.entity)) {
          if (!carrier.auxiliaryRiderIds.has(rider.id)) continue;
          this.#syncAuxiliaryRotation(rider, rotation);
          writes++;
        }
      }
    }
    return writes;
  }
  #appendModels(models) {
    const added = [];
    try {
      for (const packed of models) {
        const carrier = this.#availableCarrier() ?? this.#createCarrier(false);
        const rideable = carrier.entity.getComponent("minecraft:rideable");
        if (!rideable) throw new Error("Fancy model carrier lost minecraft:rideable.");
        const origin = packFancySubLevelOrigin(
          packed.anchorLocalLocation,
          this.#renderAnchor,
          packed.width <= 32 ? packed.width : 1,
          packed.depth <= 32 ? packed.depth : 1
        );
        const entity = this.#spawnEntity(
          packed.entityTypeId,
          this.#body.localPointToWorld(this.#renderAnchor)
        );
        let inputValues;
        try {
          inputValues = initializeModelInput(entity, packed, this.#foliageTint, origin);
          if (!rideable.addRider(entity)) {
            throw new Error(`Could not mount fancy model ${entity.id} on carrier ${carrier.entity.id}.`);
          }
        } catch (error) {
          if (entity.isValid) entity.remove();
          throw error;
        }
        const live = {
          anchorLocalLocation: { ...packed.anchorLocalLocation },
          blockCount: packed.blockCount,
          entity,
          format: packed.format,
          inputValues,
          originY: origin.y,
          words: [...packed.words]
        };
        this.#models.push(live);
        this.#modelByEntityId.set(entity.id, live);
        carrier.modelIds.add(entity.id);
        this.#carrierByModelId.set(entity.id, carrier);
        scheduleRiderMountConfirmation(
          carrier.entity,
          entity,
          carrier.pendingRiderIds,
          () => this.#body.isValid && carrier.modelIds.has(entity.id),
          () => {
            this.#knownIntegrityFailure = true;
          },
          "render"
        );
        this.#onEntityAdded?.(entity.id);
        system.run(() => {
          if (this.#body.isValid && entity.isValid) playFancyModelInput(entity, inputValues);
        });
        for (const assignment of packed.assignments) {
          this.#assignments.set(assignment.blockKey, { assignment, model: live });
        }
        added.push(live);
      }
      return added;
    } catch (error) {
      for (const model of [...added].reverse()) this.#removeModel(model);
      throw error;
    }
  }
  #availableCarrier() {
    return this.#carriers.find((carrier) => !carrier.dedicatedToPersistentRiders && carrier.entity.isValid && carrier.modelIds.size + carrier.auxiliaryRiderIds.size < FANCY_MODEL_CARRIER_CAPACITY);
  }
  #createCarrier(dedicatedToPersistentRiders) {
    const entity = this.#spawnEntity(
      FANCY_MODEL_CARRIER_ENTITY_TYPE_ID,
      this.#body.localPointToWorld(this.#renderAnchor)
    );
    if (!entity.getComponent("minecraft:rideable")) {
      if (entity.isValid) entity.remove();
      throw new Error("Fancy model carrier does not expose minecraft:rideable.");
    }
    const carrier = {
      auxiliaryRiderIds: /* @__PURE__ */ new Set(),
      dedicatedToPersistentRiders,
      entity,
      modelIds: /* @__PURE__ */ new Set(),
      pendingRiderIds: /* @__PURE__ */ new Set(),
      persistentRiders: /* @__PURE__ */ new Map(),
      persistentRiderIds: /* @__PURE__ */ new Set()
    };
    this.#carriers.push(carrier);
    this.#onEntityAdded?.(entity.id);
    return carrier;
  }
  #setPoseReady(ready) {
    if (ready === this.#poseReady) return;
    for (const model of this.#models) this.#setModelPoseReady(model, ready);
    this.#poseReady = ready;
  }
  #setModelPoseReady(model, ready) {
    if (!model.entity.isValid) {
      this.#knownIntegrityFailure = true;
      return;
    }
    const originY = encodeFancySubLevelOriginY(model.originY, ready);
    model.inputValues.origin_y = originY;
    playFancyModelInput(model.entity, model.inputValues);
  }
  #syncAuxiliaryRotation(entity, rotation = this.#renderRotation) {
    if (!entity.isValid || !rotation) return;
    entity.setProperty("sable:pitch", rotation.x);
    entity.setProperty("sable:yaw", rotation.y);
    entity.setProperty("sable:roll", rotation.z);
  }
  #removeModel(model) {
    const index = this.#models.indexOf(model);
    if (index >= 0) this.#models.splice(index, 1);
    this.#modelByEntityId.delete(model.entity.id);
    for (const [key, assignment] of this.#assignments) {
      if (assignment.model === model) this.#assignments.delete(key);
    }
    const carrier = this.#carrierByModelId.get(model.entity.id);
    this.#carrierByModelId.delete(model.entity.id);
    if (carrier) {
      carrier.pendingRiderIds.delete(model.entity.id);
      carrier.modelIds.delete(model.entity.id);
      this.#removeEmptyCarrier(carrier);
    }
    this.#onEntityRemoved?.(model.entity.id);
    if (model.entity.isValid) model.entity.remove();
  }
  #removeEmptyCarrier(carrier, removeDedicated = false) {
    if (carrier.modelIds.size > 0 || carrier.auxiliaryRiderIds.size > 0 || carrier.persistentRiderIds.size > 0 || carrier.dedicatedToPersistentRiders && !removeDedicated) return;
    const index = this.#carriers.indexOf(carrier);
    if (index >= 0) this.#carriers.splice(index, 1);
    this.#onEntityRemoved?.(carrier.entity.id);
    if (carrier.entity.isValid) carrier.entity.remove();
  }
  #resetPoseState(renderAnchor) {
    this.#renderAnchor = { ...renderAnchor };
    this.#initialPoseDeferred = true;
    this.#knownIntegrityFailure = false;
    this.#poseReady = false;
    this.#sleepingAtLastSync = false;
    this.#renderRotation = void 0;
    this.#lastAnchorX = Number.NaN;
    this.#lastAnchorY = Number.NaN;
    this.#lastAnchorZ = Number.NaN;
    this.#publishedRenderRotation.x = Number.NaN;
    this.#publishedRenderRotation.y = Number.NaN;
    this.#publishedRenderRotation.z = Number.NaN;
  }
}
function initializeModelInput(entity, packed, foliageTint, origin) {
  const values = {
    model_variant: packed.modelVariant,
    origin_xz: origin.xz,
    origin_y: encodeFancySubLevelOriginY(origin.y, false),
    tint_input: packed.tint ? packFancySubLevelTint(packed, foliageTint) : 0,
    pitch_target: 0,
    yaw_target: 0,
    roll_target: 0,
    model_rx: packed.modelRotation?.[0] ?? 0,
    model_ry: packed.modelRotation?.[1] ?? 0,
    model_rz: packed.modelRotation?.[2] ?? 0
  };
  for (let index = 0; index < Math.max(26, packed.words.length); index++) values[`s${index}`] = packed.words[index] ?? 0;
  playFancyModelInput(entity, values);
  return values;
}
function playFancyModelInput(entity, values) {
  const assignments = Object.entries(values).map(([name, value]) => `v.${name}=${value};`);
  entity.playAnimation(FANCY_MODEL_INPUT_ANIMATION, {
    controller: "sable_fancy_input",
    stopExpression: `${assignments.join("")}return 0;`
  });
}
function readStoredState(model, assignment) {
  const word = model.words[assignment.word] ?? 0;
  if (model.format === "pool") {
    if (word === 0) return 0;
    return Math.floor(word / 2 ** assignment.shift) % 2 ** assignment.bitCount + 1;
  }
  return Math.floor(word / 2 ** assignment.shift) % 2 ** assignment.bitCount;
}
function writeStoredState(model, assignment, storedState) {
  if (model.format === "pool") {
    if (storedState === 0) {
      model.words[assignment.word] = 0;
      return;
    }
    const currentField = Math.floor((model.words[assignment.word] ?? 0) / 2 ** assignment.shift) % 2 ** assignment.bitCount;
    model.words[assignment.word] = (model.words[assignment.word] ?? 0) + (storedState - 1 - currentField) * 2 ** assignment.shift;
    return;
  }
  const current = readStoredState(model, assignment);
  if (model.format === "sparse") {
    model.words[assignment.word] = (model.words[assignment.word] ?? 0) + storedState - current;
    return;
  }
  model.words[assignment.word] = (model.words[assignment.word] ?? 0) + (storedState - current) * 2 ** assignment.shift;
}
function vectorsEqual(left, right) {
  return left.x === right.x && left.y === right.y && left.z === right.z;
}
export {
  FANCY_MODEL_CARRIER_CAPACITY,
  FANCY_MODEL_CARRIER_ENTITY_TYPE_ID,
  FANCY_MODEL_INPUT_ANIMATION,
  FancySubLevelModelRenderer,
  playFancyModelInput
};
