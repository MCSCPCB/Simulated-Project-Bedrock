import { type Entity, type Vector3 } from "@minecraft/server";
import type {
  SubLevelRenderBody
} from "../../SubLevel.js";
import {
  type BlockAssignment,
  type BlockCarrier,
  type BlockSlot,
  type SubLevelRenderData
} from "../SubLevelRenderData.js";
import { selectSubLevelRenderAnchor } from "../../../util/SublevelRenderOffsetHelper.js";
import {
  RENDER_POSITION_WRITE_THRESHOLD,
  RENDER_ROTATION_WRITE_THRESHOLD_DEGREES,
  getContinuousRenderRotation,
  hasExactRiders,
  hasRidersConsistentWithPendingMounts,
  scheduleRiderMountConfirmation,
  exceedsWriteThreshold,
  validEntityLocations
} from "../SubLevelRenderEntityUtils.js";

const EMPTY_RIDER_IDS = new Set<string>();

/** Entity-backed renderer for a sub-level's paired hand-item block renders. */
export class VanillaChunkedSubLevelRenderData implements SubLevelRenderData {
  readonly #assignments = new Map<string, LiveBlockAssignment>();
  readonly #carriers: LiveBlockCarrier[] = [];
  readonly #carrierByBlockEntityId = new Map<string, LiveBlockCarrier>();
  readonly #body: SubLevelRenderBody;
  readonly #rendersByEntityId = new Map<string, LiveBlock>();
  readonly #onEntityRemoved?: (entityId: string) => void;
  readonly #renderAnchor: Vector3;
  #lastRenderX = Number.NaN;
  #lastRenderY = Number.NaN;
  #lastRenderZ = Number.NaN;
  #initialPoseDeferred = true;
  #knownIntegrityFailure = false;
  #sleepingAtLastSync = false;
  #renderRotation: Vector3 | undefined;
  readonly #publishedRenderRotation: Vector3 = {
    x: Number.NaN,
    y: Number.NaN,
    z: Number.NaN
  };

  get initialPoseDeferred(): boolean { return this.#initialPoseDeferred; }
  get renderRotation(): Readonly<Vector3> { return this.#publishedRenderRotation; }
  get renderAnchorLocal(): Vector3 { return { ...this.#renderAnchor }; }

  constructor(
    body: SubLevelRenderBody,
    assignments: readonly BlockAssignment[],
    carriers: readonly BlockCarrier[],
    onEntityRemoved?: (entityId: string) => void,
    renderAnchor: Vector3 = selectSubLevelRenderAnchor(
      assignments.map(assignment => assignment.block)
    )
  ) {
    this.#body = body;
    this.#onEntityRemoved = onEntityRemoved;
    this.#renderAnchor = { ...renderAnchor };
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
      let render = this.#rendersByEntityId.get(assignment.entity.id);
      if (!render) {
        render = { blockKeys: new Set(), entity: assignment.entity };
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
          () => { this.#knownIntegrityFailure = true; },
          "render"
        );
      }
    }
  }

  get entityCount(): number {
    return [...this.#rendersByEntityId.values()].filter(render => render.entity.isValid).length
      + this.#carriers.filter(carrier => carrier.entity.isValid).length;
  }

  get entityIds(): readonly string[] {
    return [
      ...[...this.#rendersByEntityId.keys()].filter(entityId => this.hasEntity(entityId)),
      ...this.#carriers
        .filter(carrier => carrier.entity.isValid)
        .map(carrier => carrier.entity.id)
    ];
  }

  get entityLocations(): readonly Vector3[] {
    return validEntityLocations([
      ...[...this.#rendersByEntityId.values()].map(render => render.entity),
      ...this.#carriers.map(carrier => carrier.entity)
    ]);
  }

  get firstEntityLocation(): Vector3 | undefined {
    return this.entityLocations[0];
  }

  hasEntity(entityId: string): boolean {
    if (this.#rendersByEntityId.get(entityId)?.entity.isValid === true) return true;
    return this.#carriers.some(
      carrier => carrier.entity.id === entityId && carrier.entity.isValid
    );
  }

  hasIntactEntities(): boolean {
    if (this.#knownIntegrityFailure) return false;
    const hasBlockRenders = this.#assignments.size > 0;
    if (hasBlockRenders !== (this.#rendersByEntityId.size > 0)) return false;
    if (!hasBlockRenders) return false;
    if (this.#carriers.length === 0) return false;
    let assignedBlockCount = 0;
    for (const render of this.#rendersByEntityId.values()) {
      if (!render.entity.isValid || render.blockKeys.size === 0) return false;
      assignedBlockCount += render.blockKeys.size;
    }
    if (assignedBlockCount !== this.#assignments.size) return false;
    for (const carrier of this.#carriers) {
      const intact = carrier.pendingRiderIds.size > 0
        ? hasRidersConsistentWithPendingMounts(
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
    for (const render of this.#rendersByEntityId.values()) {
      if (!render.entity.isValid) {
        this.#knownIntegrityFailure = true;
        continue;
      }
      render.entity.setProperty("sable:scale", 1);
    }
    this.#initialPoseDeferred = false;
  }

  removeBlocks(blockKeys: ReadonlySet<string>): void {
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

  remove(): void {
    for (const render of this.#rendersByEntityId.values()) {
      this.#onEntityRemoved?.(render.entity.id);
      if (render.entity.isValid) render.entity.remove();
    }
    for (const carrier of this.#carriers) {
      carrier.pendingRiderIds.clear();
      this.#onEntityRemoved?.(carrier.entity.id);
      if (carrier.entity.isValid) carrier.entity.remove();
    }
    this.#assignments.clear();
    this.#rendersByEntityId.clear();
    this.#carriers.length = 0;
    this.#carrierByBlockEntityId.clear();
  }

  sync(force = false): number {
    let writes = 0;
    if (!this.#body.isValid) return writes;
    const sleeping = this.#body.isSleeping === true;
    if (!force && sleeping && this.#sleepingAtLastSync) return writes;
    this.#sleepingAtLastSync = sleeping;
    const rotation = getContinuousRenderRotation(this.#body, this.#renderRotation);
    this.#renderRotation = rotation;
    const renderAnchor = this.#body.localPointToWorld(this.#renderAnchor);
    const positionChanged = force
      || exceedsWriteThreshold(
        renderAnchor.x,
        this.#lastRenderX,
        RENDER_POSITION_WRITE_THRESHOLD
      )
      || exceedsWriteThreshold(
        renderAnchor.y,
        this.#lastRenderY,
        RENDER_POSITION_WRITE_THRESHOLD
      )
      || exceedsWriteThreshold(
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
  render: LiveBlock;
}
