import { system, type Entity, type Vector3 } from "@minecraft/server";
import type {
  SubLevelBlock,
  SubLevelFoliageTint,
  SubLevelRenderBody
} from "../../../SubLevel.js";
import { CARRIER_SEAT_COUNT, type SubLevelRenderData } from "../../SubLevelRenderData.js";
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
  fancySubLevelBlockKey,
  packFancySubLevelModels,
  type FancySubLevelModelAssignment,
  type PackedFancySubLevelModel
} from "./FancySubLevelModelLayout.js";
import type { FancySubLevelBlock } from "./FancySubLevelModel.js";
import { resolveFancySubLevelBlock } from "./FancySubLevelModelRegistry.js";
import { packFancySubLevelTint } from "./FancySubLevelTintCodec.js";

export const FANCY_MODEL_CARRIER_ENTITY_TYPE_ID = "sable:fancy_model_carrier";
export const FANCY_MODEL_CARRIER_CAPACITY = CARRIER_SEAT_COUNT - 1;

interface LiveModel {
  readonly anchorLocalLocation: Vector3;
  blockCount: number;
  readonly entity: Entity;
  readonly format: "dense" | "sparse" | "pool";
  readonly originY: number;
  readonly words: number[];
}

interface LiveCarrier {
  readonly auxiliaryRiderIds: Set<string>;
  readonly dedicatedToPersistentRiders: boolean;
  readonly entity: Entity;
  readonly modelIds: Set<string>;
  readonly pendingRiderIds: Set<string>;
  readonly persistentRiders: Map<string, Entity>;
  readonly persistentRiderIds: Set<string>;
}

interface LiveAssignment {
  readonly assignment: FancySubLevelModelAssignment;
  readonly model: LiveModel;
}

export class FancySubLevelModelRenderer implements SubLevelRenderData {
  readonly #assignments = new Map<string, LiveAssignment>();
  readonly #body: SubLevelRenderBody;
  readonly #carrierByModelId = new Map<string, LiveCarrier>();
  readonly #carriers: LiveCarrier[] = [];
  readonly #foliageTint: SubLevelFoliageTint;
  readonly #models: LiveModel[] = [];
  readonly #modelByEntityId = new Map<string, LiveModel>();
  readonly #onEntityAdded?: (entityId: string) => void;
  readonly #onEntityRemoved?: (entityId: string) => void;
  readonly #spawnEntity: (typeId: string, location: Vector3) => Entity;
  #initialPoseDeferred = true;
  #knownIntegrityFailure = false;
  #lastAnchorX = Number.NaN;
  #lastAnchorY = Number.NaN;
  #lastAnchorZ = Number.NaN;
  #poseReady = false;
  #renderAnchor: Vector3;
  #renderAnchorRevision = 0;
  #renderRotation: Vector3 | undefined;
  #sleepingAtLastSync = false;
  readonly #publishedRenderRotation: Vector3 = {
    x: Number.NaN,
    y: Number.NaN,
    z: Number.NaN
  };

  readonly supportsBlockAddition = true;
  readonly emitsEntityAddedCallbacks = true;

  constructor(
    body: SubLevelRenderBody,
    models: readonly PackedFancySubLevelModel[],
    spawnEntity: (typeId: string, location: Vector3) => Entity,
    foliageTint: SubLevelFoliageTint,
    onEntityRemoved: ((entityId: string) => void) | undefined,
    renderAnchor: Vector3,
    onEntityAdded: ((entityId: string) => void) | undefined
  ) {
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

  get initialPoseDeferred(): boolean { return this.#initialPoseDeferred; }
  get renderRotation(): Readonly<Vector3> { return this.#publishedRenderRotation; }
  get renderAnchorLocal(): Vector3 { return { ...this.#renderAnchor }; }
  get entityCount(): number {
    return this.#models.filter(model => model.entity.isValid).length
      + this.#carriers.filter(carrier => carrier.entity.isValid).length;
  }
  get entityIds(): readonly string[] {
    return [
      ...this.#models.filter(model => model.entity.isValid).map(model => model.entity.id),
      ...this.#carriers.filter(carrier => carrier.entity.isValid).map(carrier => carrier.entity.id)
    ];
  }
  get entityLocations(): readonly Vector3[] {
    return validEntityLocations([
      ...this.#models.map(model => model.entity),
      ...this.#carriers.map(carrier => carrier.entity)
    ]);
  }
  get firstEntityLocation(): Vector3 | undefined { return this.entityLocations[0]; }

  hasEntity(entityId: string): boolean {
    return this.#modelByEntityId.get(entityId)?.entity.isValid === true
      || this.#carriers.some(carrier => carrier.entity.id === entityId && carrier.entity.isValid);
  }

  hasKnownIntegrityFailure(): boolean { return this.#knownIntegrityFailure; }

  hasIntactEntities(): boolean {
    if (this.#knownIntegrityFailure || this.#models.length === 0 || this.#carriers.length === 0) {
      return false;
    }
    if (this.#models.some(model => !model.entity.isValid)) return false;
    for (const carrier of this.#carriers) {
      const intact = carrier.pendingRiderIds.size > 0
        ? hasRidersConsistentWithPendingMounts(
          carrier.entity,
          carrier.modelIds,
          carrier.auxiliaryRiderIds,
          carrier.persistentRiderIds,
          carrier.pendingRiderIds
        )
        : hasExactRiders(
          carrier.entity,
          carrier.modelIds,
          carrier.auxiliaryRiderIds,
          carrier.persistentRiderIds
        );
      if (!intact) return false;
    }
    return true;
  }

  releaseInitialPose(): void {
    if (!this.#initialPoseDeferred) return;
    this.#setPoseReady(true);
    this.#initialPoseDeferred = false;
  }

  setBlockModelState(blockKey: string, dimension: string, value: number): boolean {
    const live = this.#assignments.get(blockKey);
    if (!live || !live.assignment.state || !live.model.entity.isValid) return false;
    const current = readStoredState(live.model, live.assignment) - 1;
    const next = live.assignment.state.update(current, dimension, value);
    if (next === undefined) return false;
    if (next === current) return true;
    writeStoredState(live.model, live.assignment, next + 1);
    live.model.entity.setProperty(
      `sable:s${live.assignment.word}`,
      live.model.words[live.assignment.word] ?? 0
    );
    return true;
  }

  attachAuxiliaryRider(entity: Entity): boolean {
    if (!entity.isValid || this.#carriers.length === 0) return false;
    const carrier = this.#carriers.find(value => !value.dedicatedToPersistentRiders);
    if (
      !carrier
      || !carrier.entity.isValid
      || carrier.auxiliaryRiderIds.size > 0
      || carrier.modelIds.size >= FANCY_MODEL_CARRIER_CAPACITY
    ) return false;
    if (!carrier.entity.getComponent("minecraft:rideable")?.addRider(entity)) return false;
    carrier.auxiliaryRiderIds.add(entity.id);
    this.#syncAuxiliaryRotation(entity);
    return true;
  }

  attachPersistentRider(entity: Entity): boolean {
    if (!entity.isValid) return false;
    let carrier = this.#carriers.find(value => (
      value.dedicatedToPersistentRiders
      && value.entity.isValid
      && value.persistentRiderIds.size < FANCY_MODEL_CARRIER_CAPACITY
    ));
    carrier ??= this.#createCarrier(true);
    ejectCurrentVehicle(entity);
    if (!carrier.entity.getComponent("minecraft:rideable")?.addRider(entity)) return false;
    carrier.persistentRiders.set(entity.id, entity);
    carrier.persistentRiderIds.add(entity.id);
    scheduleRiderMountConfirmation(
      carrier.entity,
      entity,
      carrier.pendingRiderIds,
      () => this.#body.isValid && carrier!.persistentRiderIds.has(entity.id),
      () => { this.#knownIntegrityFailure = true; },
      "persistent"
    );
    return true;
  }

  detachAuxiliaryRider(entity: Entity): void {
    const carrier = this.#carriers.find(value => value.auxiliaryRiderIds.has(entity.id));
    if (!carrier) return;
    carrier.auxiliaryRiderIds.delete(entity.id);
    if (carrier.entity.isValid && entity.isValid) {
      carrier.entity.getComponent("minecraft:rideable")?.ejectRider(entity);
    }
    this.#removeEmptyCarrier(carrier);
  }

  detachPersistentRider(entity: Entity, preserveEmptyCarrier = false): void {
    const carrier = this.#carriers.find(value => value.persistentRiderIds.has(entity.id));
    if (!carrier) return;
    if (carrier.entity.isValid && entity.isValid) {
      carrier.entity.getComponent("minecraft:rideable")?.ejectRider(entity);
    }
    carrier.pendingRiderIds.delete(entity.id);
    carrier.persistentRiders.delete(entity.id);
    carrier.persistentRiderIds.delete(entity.id);
    if (!preserveEmptyCarrier) this.#removeEmptyCarrier(carrier, true);
  }

  removeEmptyPersistentRiderCarriers(): void {
    for (const carrier of [...this.#carriers]) {
      if (carrier.dedicatedToPersistentRiders && carrier.persistentRiderIds.size === 0) {
        this.#removeEmptyCarrier(carrier, true);
      }
    }
  }

  transferPersistentRidersTo(target: SubLevelRenderData): void {
    // Recreated projections need the same storage entities, including riders
    // whose native mount confirmation is still pending.
    const persistentRiders = this.#carriers.flatMap(carrier => (
      [...carrier.persistentRiders.values()].filter(rider => rider.isValid)
    ));
    if (persistentRiders.length === 0) return;
    for (const rider of persistentRiders) ejectCurrentVehicle(rider);
    this.remove();
    for (const rider of persistentRiders) {
      if (!target.attachPersistentRider?.(rider)) {
        throw new Error(`Could not reattach persistent sub-level entity ${rider.id}.`);
      }
    }
  }

  removeBlocks(blockKeys: ReadonlySet<string>): void {
    const changed = new Map<LiveModel, Set<number>>();
    const empty = new Set<LiveModel>();
    for (const key of blockKeys) {
      const live = this.#assignments.get(key);
      if (!live) continue;
      this.#assignments.delete(key);
      writeStoredState(live.model, live.assignment, 0);
      live.model.blockCount--;
      let words = changed.get(live.model);
      if (!words) {
        words = new Set();
        changed.set(live.model, words);
      }
      words.add(live.assignment.word);
      if (live.model.blockCount === 0) empty.add(live.model);
    }
    for (const [model, words] of changed) {
      if (empty.has(model) || !model.entity.isValid) continue;
      for (const word of words) {
        model.entity.setProperty(`sable:s${word}`, model.words[word] ?? 0);
      }
    }
    for (const model of empty) this.#removeModel(model);
  }

  addBlocks(blocks: readonly SubLevelBlock[]): void {
    const resolved = blocks.map(resolveFancySubLevelBlock);
    if (resolved.some(entry => entry === undefined)) {
      throw new Error("Fancy model renderer received an unregistered block.");
    }
    const packed = packFancySubLevelModels(resolved as FancySubLevelBlock[]);
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

  rebaseRenderAnchor(blocks: readonly SubLevelBlock[]): void {
    const nextAnchor = findSubLevelRenderAnchor(blocks);
    if (!nextAnchor || vectorsEqual(nextAnchor, this.#renderAnchor)) return;
    const resolved = blocks.map(resolveFancySubLevelBlock);
    if (resolved.some(entry => entry === undefined)) {
      throw new Error("Fancy sub-level cannot change route during an in-place edit.");
    }
    const packed = packFancySubLevelModels(resolved as FancySubLevelBlock[]);
    if (packed.unsupported.length > 0) {
      throw new Error("Fancy sub-level cannot encode the rebased model set.");
    }
    const revision = ++this.#renderAnchorRevision;
    const persistentRiders = this.#carriers.flatMap(carrier => (
      [...carrier.persistentRiders.values()].filter(rider => rider.isValid)
    ));
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

  remove(): void {
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

  sync(force = false): number {
    if (!this.#body.isValid) return 0;
    const sleeping = this.#body.isSleeping === true;
    if (!force && sleeping && this.#sleepingAtLastSync) return 0;
    this.#sleepingAtLastSync = sleeping;
    const rotation = getContinuousRenderRotation(this.#body, this.#renderRotation);
    this.#renderRotation = rotation;
    const anchor = this.#body.localPointToWorld(this.#renderAnchor);
    const positionChanged = force
      || exceedsWriteThreshold(anchor.x, this.#lastAnchorX, RENDER_POSITION_WRITE_THRESHOLD)
      || exceedsWriteThreshold(anchor.y, this.#lastAnchorY, RENDER_POSITION_WRITE_THRESHOLD)
      || exceedsWriteThreshold(anchor.z, this.#lastAnchorZ, RENDER_POSITION_WRITE_THRESHOLD);
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
    if (!positionChanged && !pitchChanged && !yawChanged && !rollChanged) return 0;
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
      if (pitchChanged) model.entity.setProperty("sable:pitch", rotation.x);
      if (yawChanged) model.entity.setProperty("sable:yaw", rotation.y);
      if (rollChanged) model.entity.setProperty("sable:roll", rotation.z);
      if (pitchChanged || yawChanged || rollChanged) writes++;
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

  #appendModels(models: readonly PackedFancySubLevelModel[]): LiveModel[] {
    const added: LiveModel[] = [];
    try {
      for (const packed of models) {
        const carrier = this.#availableCarrier() ?? this.#createCarrier(false);
        const rideable = carrier.entity.getComponent("minecraft:rideable");
        if (!rideable) throw new Error("Fancy model carrier lost minecraft:rideable.");
        const origin = packFancySubLevelOrigin(
          packed.anchorLocalLocation,
          this.#renderAnchor,
          packed.format === "dense" ? packed.width : 1,
          packed.format === "dense" ? packed.depth : 1
        );
        const entity = this.#spawnEntity(
          packed.entityTypeId,
          this.#body.localPointToWorld(this.#renderAnchor)
        );
        try {
          initializeModelProperties(entity, packed, this.#foliageTint, origin);
          if (!rideable.addRider(entity)) {
            throw new Error(`Could not mount fancy model ${entity.id} on carrier ${carrier.entity.id}.`);
          }
        } catch (error) {
          if (entity.isValid) entity.remove();
          throw error;
        }
        const live: LiveModel = {
          anchorLocalLocation: { ...packed.anchorLocalLocation },
          blockCount: packed.blockCount,
          entity,
          format: packed.format,
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
          () => { this.#knownIntegrityFailure = true; },
          "render"
        );
        this.#onEntityAdded?.(entity.id);
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

  #availableCarrier(): LiveCarrier | undefined {
    return this.#carriers.find(carrier => (
      !carrier.dedicatedToPersistentRiders
      && carrier.entity.isValid
      && carrier.modelIds.size + carrier.auxiliaryRiderIds.size < FANCY_MODEL_CARRIER_CAPACITY
    ));
  }

  #createCarrier(dedicatedToPersistentRiders: boolean): LiveCarrier {
    const entity = this.#spawnEntity(
      FANCY_MODEL_CARRIER_ENTITY_TYPE_ID,
      this.#body.localPointToWorld(this.#renderAnchor)
    );
    if (!entity.getComponent("minecraft:rideable")) {
      if (entity.isValid) entity.remove();
      throw new Error("Fancy model carrier does not expose minecraft:rideable.");
    }
    const carrier: LiveCarrier = {
      auxiliaryRiderIds: new Set(),
      dedicatedToPersistentRiders,
      entity,
      modelIds: new Set(),
      pendingRiderIds: new Set(),
      persistentRiders: new Map(),
      persistentRiderIds: new Set()
    };
    this.#carriers.push(carrier);
    this.#onEntityAdded?.(entity.id);
    return carrier;
  }

  #setPoseReady(ready: boolean): void {
    if (ready === this.#poseReady) return;
    for (const model of this.#models) this.#setModelPoseReady(model, ready);
    this.#poseReady = ready;
  }

  #setModelPoseReady(model: LiveModel, ready: boolean): void {
    if (!model.entity.isValid) {
      this.#knownIntegrityFailure = true;
      return;
    }
    model.entity.setProperty(
      "sable:origin_y",
      encodeFancySubLevelOriginY(model.originY, ready)
    );
  }

  #syncAuxiliaryRotation(entity: Entity, rotation = this.#renderRotation): void {
    if (!entity.isValid || !rotation) return;
    entity.setProperty("sable:pitch", rotation.x);
    entity.setProperty("sable:yaw", rotation.y);
    entity.setProperty("sable:roll", rotation.z);
  }

  #removeModel(model: LiveModel): void {
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

  #removeEmptyCarrier(carrier: LiveCarrier, removeDedicated = false): void {
    if (
      carrier.modelIds.size > 0
      || carrier.auxiliaryRiderIds.size > 0
      || carrier.persistentRiderIds.size > 0
      || (carrier.dedicatedToPersistentRiders && !removeDedicated)
    ) return;
    const index = this.#carriers.indexOf(carrier);
    if (index >= 0) this.#carriers.splice(index, 1);
    this.#onEntityRemoved?.(carrier.entity.id);
    if (carrier.entity.isValid) carrier.entity.remove();
  }

  #resetPoseState(renderAnchor: Vector3): void {
    this.#renderAnchor = { ...renderAnchor };
    this.#initialPoseDeferred = true;
    this.#knownIntegrityFailure = false;
    this.#poseReady = false;
    this.#sleepingAtLastSync = false;
    this.#renderRotation = undefined;
    this.#lastAnchorX = Number.NaN;
    this.#lastAnchorY = Number.NaN;
    this.#lastAnchorZ = Number.NaN;
    this.#publishedRenderRotation.x = Number.NaN;
    this.#publishedRenderRotation.y = Number.NaN;
    this.#publishedRenderRotation.z = Number.NaN;
  }
}

function initializeModelProperties(
  entity: Entity,
  packed: PackedFancySubLevelModel,
  foliageTint: SubLevelFoliageTint,
  origin: { readonly xz: number; readonly y: number }
): void {
  entity.setProperty("sable:origin_xz", origin.xz);
  entity.setProperty("sable:origin_y", encodeFancySubLevelOriginY(origin.y, false));
  if (packed.tint) {
    entity.setProperty("sable:tint", packFancySubLevelTint(packed, foliageTint));
  }
  for (let index = 0; index < packed.words.length; index++) {
    const word = packed.words[index] ?? 0;
    if (word !== 0) entity.setProperty(`sable:s${index}`, word);
  }
}

function readStoredState(model: LiveModel, assignment: FancySubLevelModelAssignment): number {
  const word = model.words[assignment.word] ?? 0;
  if (model.format === "sparse") return word % 64;
  if (model.format === "pool") {
    if (word === 0) return 0;
    return Math.floor(word / (2 ** assignment.shift)) % (2 ** assignment.bitCount) + 1;
  }
  return Math.floor(word / (2 ** assignment.shift)) % (2 ** assignment.bitCount);
}

function writeStoredState(
  model: LiveModel,
  assignment: FancySubLevelModelAssignment,
  storedState: number
): void {
  if (model.format === "pool") {
    // A cleared pool slot drops its whole descriptor; otherwise only the
    // state field of the occupied descriptor changes.
    if (storedState === 0) {
      model.words[assignment.word] = 0;
      return;
    }
    const currentField = Math.floor((model.words[assignment.word] ?? 0) / (2 ** assignment.shift))
      % (2 ** assignment.bitCount);
    model.words[assignment.word] = (model.words[assignment.word] ?? 0)
      + (storedState - 1 - currentField) * (2 ** assignment.shift);
    return;
  }
  const current = readStoredState(model, assignment);
  if (model.format === "sparse") {
    model.words[assignment.word] = (model.words[assignment.word] ?? 0) + storedState - current;
    return;
  }
  model.words[assignment.word] = (model.words[assignment.word] ?? 0)
    + (storedState - current) * (2 ** assignment.shift);
}

function vectorsEqual(left: Vector3, right: Vector3): boolean {
  return left.x === right.x && left.y === right.y && left.z === right.z;
}
