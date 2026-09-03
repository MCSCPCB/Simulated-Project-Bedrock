// Shared entity, rider, and pose write-threshold helpers used by all
// sub-level render routes.
import { system, type Entity, type Vector3 } from "@minecraft/server";
import type { SubLevelRenderBody } from "../SubLevel.js";

export const RENDER_POSITION_WRITE_THRESHOLD = 1 / 1024;
export const RENDER_ROTATION_WRITE_THRESHOLD_DEGREES = 0.05;
const RIDER_MOUNT_CONFIRMATION_TIMEOUT_TICKS = 20;

type SubLevelRiderKind = "persistent" | "render";

export function nativeRiders(entity: Entity): readonly Entity[] {
  if (!entity.isValid) return [];
  return entity.getComponent("minecraft:rideable")?.getRiders() ?? [];
}

export function ejectCurrentVehicle(entity: Entity): void {
  if (!entity.isValid) return;
  const vehicle = entity.getComponent("minecraft:riding")?.entityRidingOn;
  if (vehicle?.isValid) vehicle.getComponent("minecraft:rideable")?.ejectRider(entity);
}

export function getContinuousRenderRotation(
  body: SubLevelRenderBody,
  reference: Vector3 | undefined
): Vector3 {
  return body.getRenderRotation?.(reference) ?? body.getRotation();
}

export function validEntityLocations(entities: Iterable<Entity>): Vector3[] {
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

/** Verify the native riding relationship instead of trusting the script-side registry. */
export function hasExactRiders(
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
    // An unreadable native riding relationship is itself an integrity failure.
    return false;
  }
}

/**
 * Keep strict rider validation while Bedrock publishes a newly added native
 * rider relationship. Only explicitly pending riders may be absent; every
 * visible rider must already belong to the script-side ledger.
 */
export function hasRidersConsistentWithPendingMounts(
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
    // An unreadable native riding relationship is itself an integrity failure.
    return false;
  }
}

export function hasNativeRider(carrier: Entity, riderId: string): boolean {
  if (!carrier.isValid) return false;
  try {
    return carrier.getComponent("minecraft:rideable")?.getRiders().some(rider => (
      rider.isValid && rider.id === riderId
    )) === true;
  } catch {
    return false;
  }
}

/** Keep a new rider transitional until bounded native confirmation. */
export function scheduleRiderMountConfirmation(
  carrier: Entity,
  rider: Entity,
  pendingRiderIds: Set<string>,
  isMountCurrent: () => boolean,
  markIntegrityFailure: () => void,
  kind: SubLevelRiderKind
): void {
  const riderId = rider.id;
  const queuedTick = system.currentTick;
  const riderDescription = kind === "persistent"
    ? "Persistent sub-level entity"
    : "Sub-level render entity";
  const carrierDescription = kind === "persistent"
    ? "Persistent sub-level carrier"
    : "Sub-level render carrier";
  pendingRiderIds.add(riderId);
  const confirm = (): void => {
    if (!pendingRiderIds.has(riderId)) return;
    if (!isMountCurrent()) {
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
        `${riderDescription} ${riderId} lost its mount relationship: rider valid=${rider.isValid}, carrier ${carrier.id} valid=${carrier.isValid}.`
      );
    }
    const vehicle = rider.getComponent("minecraft:riding")?.entityRidingOn;
    if (system.currentTick - queuedTick >= RIDER_MOUNT_CONFIRMATION_TIMEOUT_TICKS) {
      pendingRiderIds.delete(riderId);
      markIntegrityFailure();
      throw new Error(
        `${riderDescription} ${riderId} did not mount carrier ${carrier.id} within ${RIDER_MOUNT_CONFIRMATION_TIMEOUT_TICKS} ticks; current vehicle=${vehicle?.id ?? "none"}.`
      );
    }
    if (!vehicle) {
      const rideable = carrier.getComponent("minecraft:rideable");
      if (!rideable) {
        pendingRiderIds.delete(riderId);
        markIntegrityFailure();
        throw new Error(`${carrierDescription} ${carrier.id} lost minecraft:rideable.`);
      }
      // Bedrock can accept addRider while silently dropping the relationship
      // during a carrier transfer. Re-submit only while the rider has no vehicle.
      rideable.addRider(rider);
    }
    system.run(confirm);
  };
  system.run(confirm);
}

export function exceedsWriteThreshold(value: number, previous: number, threshold: number): boolean {
  return !Number.isFinite(previous) || Math.abs(value - previous) >= threshold;
}
