import { system, type Entity, type Vector3 } from "@minecraft/server";
import type {
  SubLevelRenderBody
} from "../../SubLevel.js";
import {
  type BlockAssignment,
  type BlockCarrier,
  type BlockSlot,
  type SubLevelRenderData
} from "../SubLevelRenderData.js";
import { selectSubLevelVisualAnchor } from "../../../util/SublevelRenderOffsetHelper.js";

export const VISUAL_POSITION_WRITE_THRESHOLD = 1 / 1024;
export const VISUAL_ROTATION_WRITE_THRESHOLD_DEGREES = 0.05;
const RIDER_ATTACHMENT_TIMEOUT_TICKS = 20;
const EMPTY_RIDER_IDS = new Set<string>();

/** Entity-backed renderer for a sub-level's paired hand-item block visuals. */
export class VanillaChunkedSubLevelRenderData implements SubLevelRenderData {
  readonly #assignments = new Map<string, LiveBlockAssignment>();
  readonly #carriers: LiveBlockCarrier[] = [];
  readonly #carrierByBlockEntityId = new Map<string, LiveBlockCarrier>();
  readonly #body: SubLevelRenderBody;
  readonly #visualsByEntityId = new Map<string, LiveBlock>();
  readonly #onEntityRemoved?: (entityId: string) => void;
  readonly #visualAnchor: Vector3;
  #lastVisualX = Number.NaN;
  #lastVisualY = Number.NaN;
  #lastVisualZ = Number.NaN;
  #initialPoseDeferred = true;
  #knownIntegrityFailure = false;
  #sleepingAtLastSync = false;
  #visualRotation: Vector3 | undefined;
  readonly #publishedVisualRotation: Vector3 = {
    x: Number.NaN,
    y: Number.NaN,
    z: Number.NaN
  };

  get initialPoseDeferred(): boolean { return this.#initialPoseDeferred; }
  get visualRotation(): Readonly<Vector3> { return this.#publishedVisualRotation; }
  get visualAnchorLocal(): Vector3 { return { ...this.#visualAnchor }; }

  constructor(
    body: SubLevelRenderBody,
    assignments: readonly BlockAssignment[],
    carriers: readonly BlockCarrier[],
    onEntityRemoved?: (entityId: string) => void,
    visualAnchor: Vector3 = selectSubLevelVisualAnchor(
      assignments.map(assignment => assignment.block)
    )
  ) {
    this.#body = body;
    this.#onEntityRemoved = onEntityRemoved;
    this.#visualAnchor = { ...visualAnchor };
    for (const carrier of carriers) {
      const liveCarrier: LiveBlockCarrier = {
        entity: carrier.entity,
        pendingRiderIds: new Set(),
        riderIds: new Set(carrier.riderIds)
      };
      this.#carriers.push(liveCarrier);
      for (const riderId of liveCarrier.riderIds) {
        this.#carrierByBlockEntityId.set(riderId, liveCarrier);
      }
    }
    for (const assignment of assignments) {
      const key = blockKey(assignment.block.localLocation);
      let visual = this.#visualsByEntityId.get(assignment.entity.id);
      if (!visual) {
        visual = { blockKeys: new Set(), entity: assignment.entity };
        this.#visualsByEntityId.set(assignment.entity.id, visual);
      }
      visual.blockKeys.add(key);
      this.#assignments.set(key, {
        entity: assignment.entity,
        slot: assignment.slot,
        visual
      });
    }
    for (const carrier of this.#carriers) {
      for (const riderId of carrier.riderIds) {
        const rider = this.#visualsByEntityId.get(riderId)?.entity;
        if (!rider) {
          throw new Error(
            `Block carrier ${carrier.entity.id} references unknown visual ${riderId}.`
          );
        }
        scheduleRiderAttachmentConfirmation(
          carrier.entity,
          rider,
          carrier.pendingRiderIds,
          () => this.#body.isValid && carrier.riderIds.has(riderId),
          () => { this.#knownIntegrityFailure = true; },
          "visual"
        );
      }
    }
  }

  get entityCount(): number {
    return [...this.#visualsByEntityId.values()].filter(visual => visual.entity.isValid).length
      + this.#carriers.filter(carrier => carrier.entity.isValid).length;
  }

  get entityIds(): readonly string[] {
    return [
      ...[...this.#visualsByEntityId.keys()].filter(entityId => this.hasEntity(entityId)),
      ...this.#carriers
        .filter(carrier => carrier.entity.isValid)
        .map(carrier => carrier.entity.id)
    ];
  }

  get entityLocations(): readonly Vector3[] {
    return validEntityLocations([
      ...[...this.#visualsByEntityId.values()].map(visual => visual.entity),
      ...this.#carriers.map(carrier => carrier.entity)
    ]);
  }

  get firstEntityLocation(): Vector3 | undefined {
    return this.entityLocations[0];
  }

  hasEntity(entityId: string): boolean {
    if (this.#visualsByEntityId.get(entityId)?.entity.isValid === true) return true;
    return this.#carriers.some(
      carrier => carrier.entity.id === entityId && carrier.entity.isValid
    );
  }

  hasIntactEntities(): boolean {
    if (this.#knownIntegrityFailure) return false;
    const hasBlockVisuals = this.#assignments.size > 0;
    if (hasBlockVisuals !== (this.#visualsByEntityId.size > 0)) return false;
    if (!hasBlockVisuals) return false;
    if (this.#carriers.length === 0) return false;
    let assignedBlockCount = 0;
    for (const visual of this.#visualsByEntityId.values()) {
      if (!visual.entity.isValid || visual.blockKeys.size === 0) return false;
      assignedBlockCount += visual.blockKeys.size;
    }
    if (assignedBlockCount !== this.#assignments.size) return false;
    for (const carrier of this.#carriers) {
      const intact = carrier.pendingRiderIds.size > 0
        ? hasRidersConsistentWithPendingAttachments(
          carrier.entity,
          carrier.riderIds,
          EMPTY_RIDER_IDS,
          EMPTY_RIDER_IDS,
          carrier.pendingRiderIds
        )
        : hasExactRiders(
          carrier.entity,
          carrier.riderIds,
          EMPTY_RIDER_IDS,
          EMPTY_RIDER_IDS
        );
      if (!intact) return false;
    }
    return true;
  }

  hasKnownIntegrityFailure(): boolean {
    return this.#knownIntegrityFailure;
  }

  releaseInitialPose(): void {
    if (!this.#initialPoseDeferred) return;
    for (const visual of this.#visualsByEntityId.values()) {
      if (!visual.entity.isValid) {
        this.#knownIntegrityFailure = true;
        continue;
      }
      visual.entity.setProperty("sable:scale", 1);
    }
    this.#initialPoseDeferred = false;
  }

  removeBlocks(blockKeys: ReadonlySet<string>): void {
    for (const key of blockKeys) {
      const assignment = this.#assignments.get(key);
      if (!assignment) continue;
      const { entity, slot, visual } = assignment;
      if (visual.blockKeys.size > 1 && entity.isValid) {
        entity.runCommand(`replaceitem entity @s slot.weapon.${slot} 0 minecraft:air`);
      }
      this.#assignments.delete(key);
      visual.blockKeys.delete(key);
      if (visual.blockKeys.size > 0) continue;
      this.#visualsByEntityId.delete(entity.id);
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

  remove(): void {
    for (const visual of this.#visualsByEntityId.values()) {
      this.#onEntityRemoved?.(visual.entity.id);
      if (visual.entity.isValid) visual.entity.remove();
    }
    for (const carrier of this.#carriers) {
      carrier.pendingRiderIds.clear();
      this.#onEntityRemoved?.(carrier.entity.id);
      if (carrier.entity.isValid) carrier.entity.remove();
    }
    this.#assignments.clear();
    this.#visualsByEntityId.clear();
    this.#carriers.length = 0;
    this.#carrierByBlockEntityId.clear();
  }

  sync(force = false): number {
    let writes = 0;
    if (!this.#body.isValid) return writes;
    const sleeping = this.#body.isSleeping === true;
    if (!force && sleeping && this.#sleepingAtLastSync) return writes;
    this.#sleepingAtLastSync = sleeping;
    const rotation = getContinuousVisualRotation(this.#body, this.#visualRotation);
    this.#visualRotation = rotation;
    const visualAnchor = this.#body.localPointToWorld(this.#visualAnchor);
    const positionChanged = force
      || exceedsWriteThreshold(
        visualAnchor.x,
        this.#lastVisualX,
        VISUAL_POSITION_WRITE_THRESHOLD
      )
      || exceedsWriteThreshold(
        visualAnchor.y,
        this.#lastVisualY,
        VISUAL_POSITION_WRITE_THRESHOLD
      )
      || exceedsWriteThreshold(
        visualAnchor.z,
        this.#lastVisualZ,
        VISUAL_POSITION_WRITE_THRESHOLD
      );
    const pitchChanged = force || exceedsWriteThreshold(
      rotation.x,
      this.#publishedVisualRotation.x,
      VISUAL_ROTATION_WRITE_THRESHOLD_DEGREES
    );
    const yawChanged = force || exceedsWriteThreshold(
      rotation.y,
      this.#publishedVisualRotation.y,
      VISUAL_ROTATION_WRITE_THRESHOLD_DEGREES
    );
    const rollChanged = force || exceedsWriteThreshold(
      rotation.z,
      this.#publishedVisualRotation.z,
      VISUAL_ROTATION_WRITE_THRESHOLD_DEGREES
    );
    if (!positionChanged && !pitchChanged && !yawChanged && !rollChanged) return writes;
    if (positionChanged) {
      this.#lastVisualX = visualAnchor.x;
      this.#lastVisualY = visualAnchor.y;
      this.#lastVisualZ = visualAnchor.z;
    }
    if (pitchChanged) this.#publishedVisualRotation.x = rotation.x;
    if (yawChanged) this.#publishedVisualRotation.y = rotation.y;
    if (rollChanged) this.#publishedVisualRotation.z = rotation.z;
    if (positionChanged) {
      for (const carrier of this.#carriers) {
        if (!carrier.entity.isValid) {
          this.#knownIntegrityFailure = true;
          continue;
        }
        carrier.entity.teleport(visualAnchor);
        writes++;
      }
    }
    for (const visual of this.#visualsByEntityId.values()) {
      const entity = visual.entity;
      if (!entity.isValid) {
        this.#knownIntegrityFailure = true;
        continue;
      }
      if (pitchChanged) entity.setProperty("sable:pitch", rotation.x);
      if (yawChanged) entity.setProperty("sable:yaw", rotation.y);
      if (rollChanged) entity.setProperty("sable:roll", rotation.z);
      if (pitchChanged || yawChanged || rollChanged) writes++;
    }
    return writes;
  }

  #removeEmptyCarrier(carrier: LiveBlockCarrier): void {
    if (carrier.riderIds.size > 0) return;
    const carrierIndex = this.#carriers.indexOf(carrier);
    if (carrierIndex >= 0) this.#carriers.splice(carrierIndex, 1);
    this.#onEntityRemoved?.(carrier.entity.id);
    if (carrier.entity.isValid) carrier.entity.remove();
  }
}

function blockKey(location: Vector3): string {
  return `${location.x},${location.y},${location.z}`;
}

function getContinuousVisualRotation(
  body: SubLevelRenderBody,
  reference: Vector3 | undefined
): Vector3 {
  return body.getVisualRotation?.(reference) ?? body.getRotation();
}

function validEntityLocations(entities: Iterable<Entity>): Vector3[] {
  const result: Vector3[] = [];
  for (const entity of entities) {
    if (!entity.isValid) continue;
    try {
      result.push({ ...entity.location });
    } catch {
      // The entity can invalidate between the validity check and location read.
    }
  }
  return result;
}

function hasExactRiders(
  carrier: Entity,
  expectedRiderIds: ReadonlySet<string>,
  additionalExpectedRiderIds?: ReadonlySet<string>,
  persistentExpectedRiderIds?: ReadonlySet<string>
): boolean {
  const expectedSize = expectedRiderIds.size
    + (additionalExpectedRiderIds?.size ?? 0)
    + (persistentExpectedRiderIds?.size ?? 0);
  if (!carrier.isValid) return false;
  try {
    const rideable = carrier.getComponent("minecraft:rideable");
    if (!rideable) return false;
    const riders = rideable.getRiders();
    if (riders.length !== expectedSize) return false;
    for (const rider of riders) {
      if (
        !rider.isValid
        || (
          !expectedRiderIds.has(rider.id)
          && !additionalExpectedRiderIds?.has(rider.id)
          && !persistentExpectedRiderIds?.has(rider.id)
        )
      ) return false;
    }
    return true;
  } catch {
    return false;
  }
}

function hasRidersConsistentWithPendingAttachments(
  carrier: Entity,
  expectedRiderIds: ReadonlySet<string>,
  additionalExpectedRiderIds: ReadonlySet<string>,
  persistentExpectedRiderIds: ReadonlySet<string>,
  pendingRiderIds: ReadonlySet<string>
): boolean {
  for (const riderId of pendingRiderIds) {
    if (
      !expectedRiderIds.has(riderId)
      && !additionalExpectedRiderIds.has(riderId)
      && !persistentExpectedRiderIds.has(riderId)
    ) return false;
  }
  const expectedSize = expectedRiderIds.size
    + additionalExpectedRiderIds.size
    + persistentExpectedRiderIds.size;
  if (!carrier.isValid) return false;
  try {
    const rideable = carrier.getComponent("minecraft:rideable");
    if (!rideable) return false;
    const riders = rideable.getRiders();
    const minimumExpectedSize = expectedSize - pendingRiderIds.size;
    if (riders.length < minimumExpectedSize || riders.length > expectedSize) return false;
    const nativeRiderIds = new Set<string>();
    for (const rider of riders) {
      if (
        !rider.isValid
        || (
          !expectedRiderIds.has(rider.id)
          && !additionalExpectedRiderIds.has(rider.id)
          && !persistentExpectedRiderIds.has(rider.id)
        )
      ) return false;
      if (!nativeRiderIds.add(rider.id)) return false;
    }
    for (const riderId of expectedRiderIds) {
      if (!pendingRiderIds.has(riderId) && !nativeRiderIds.has(riderId)) return false;
    }
    for (const riderId of additionalExpectedRiderIds) {
      if (!pendingRiderIds.has(riderId) && !nativeRiderIds.has(riderId)) return false;
    }
    for (const riderId of persistentExpectedRiderIds) {
      if (!pendingRiderIds.has(riderId) && !nativeRiderIds.has(riderId)) return false;
    }
    return true;
  } catch {
    return false;
  }
}

function hasNativeRider(carrier: Entity, riderId: string): boolean {
  if (!carrier.isValid) return false;
  try {
    return carrier.getComponent("minecraft:rideable")?.getRiders().some(rider => (
      rider.isValid && rider.id === riderId
    )) === true;
  } catch {
    return false;
  }
}

function scheduleRiderAttachmentConfirmation(
  carrier: Entity,
  rider: Entity,
  pendingRiderIds: Set<string>,
  isAttachmentCurrent: () => boolean,
  markIntegrityFailure: () => void,
  kind: "persistent" | "visual"
): void {
  const riderId = rider.id;
  const queuedTick = system.currentTick;
  const riderDescription = kind === "persistent"
    ? "Persistent sub-level entity"
    : "Sub-level visual entity";
  const carrierDescription = kind === "persistent"
    ? "Persistent sub-level carrier"
    : "Sub-level visual carrier";
  pendingRiderIds.add(riderId);
  const confirm = (): void => {
    if (!pendingRiderIds.has(riderId)) return;
    if (!isAttachmentCurrent()) {
      pendingRiderIds.delete(riderId);
      return;
    }
    if (hasNativeRider(carrier, riderId)) {
      pendingRiderIds.delete(riderId);
      return;
    }
    if (!carrier.isValid || !rider.isValid) {
      pendingRiderIds.delete(riderId);
      markIntegrityFailure();
      throw new Error(
        `${riderDescription} ${riderId} lost its attachment entities: rider valid=${rider.isValid}, carrier ${carrier.id} valid=${carrier.isValid}.`
      );
    }
    const vehicle = rider.getComponent("minecraft:riding")?.entityRidingOn;
    if (system.currentTick - queuedTick >= RIDER_ATTACHMENT_TIMEOUT_TICKS) {
      pendingRiderIds.delete(riderId);
      markIntegrityFailure();
      throw new Error(
        `${riderDescription} ${riderId} did not attach to carrier ${carrier.id} within ${RIDER_ATTACHMENT_TIMEOUT_TICKS} ticks; current vehicle=${vehicle?.id ?? "none"}.`
      );
    }
    if (!vehicle) {
      const rideable = carrier.getComponent("minecraft:rideable");
      if (!rideable) {
        pendingRiderIds.delete(riderId);
        markIntegrityFailure();
        throw new Error(`${carrierDescription} ${carrier.id} lost minecraft:rideable.`);
      }
      rideable.addRider(rider);
    }
    system.run(confirm);
  };
  system.run(confirm);
}

function exceedsWriteThreshold(
  value: number,
  previous: number,
  threshold: number
): boolean {
  return !Number.isFinite(previous) || Math.abs(value - previous) >= threshold;
}

interface LiveBlockCarrier {
  entity: Entity;
  pendingRiderIds: Set<string>;
  riderIds: Set<string>;
}

interface LiveBlock {
  blockKeys: Set<string>;
  entity: Entity;
}

interface LiveBlockAssignment {
  entity: Entity;
  slot: BlockSlot;
  visual: LiveBlock;
}
