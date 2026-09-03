import { system } from "@minecraft/server";
const RENDER_POSITION_WRITE_THRESHOLD = 1 / 1024;
const RENDER_ROTATION_WRITE_THRESHOLD_DEGREES = 0.05;
const RIDER_MOUNT_CONFIRMATION_TIMEOUT_TICKS = 20;
function nativeRiders(entity) {
  if (!entity.isValid) return [];
  return entity.getComponent("minecraft:rideable")?.getRiders() ?? [];
}
function ejectCurrentVehicle(entity) {
  if (!entity.isValid) return;
  const vehicle = entity.getComponent("minecraft:riding")?.entityRidingOn;
  if (vehicle?.isValid) vehicle.getComponent("minecraft:rideable")?.ejectRider(entity);
}
function getContinuousRenderRotation(body, reference) {
  return body.getRenderRotation?.(reference) ?? body.getRotation();
}
function validEntityLocations(entities) {
  const result = [];
  for (const entity of entities) {
    if (!entity.isValid) continue;
    try {
      result.push({ ...entity.location });
    } catch {
    }
  }
  return result;
}
function hasExactRiders(carrier, expectedRiderIds, additionalExpectedRiderIds, persistentExpectedRiderIds) {
  const expectedSize = expectedRiderIds.size + (additionalExpectedRiderIds?.size ?? 0) + (persistentExpectedRiderIds?.size ?? 0);
  if (!carrier.isValid) return false;
  try {
    const rideable = carrier.getComponent("minecraft:rideable");
    if (!rideable) return false;
    const riders = rideable.getRiders();
    if (riders.length !== expectedSize) return false;
    for (const rider of riders) {
      if (!rider.isValid || !expectedRiderIds.has(rider.id) && !additionalExpectedRiderIds?.has(rider.id) && !persistentExpectedRiderIds?.has(rider.id)) return false;
    }
    return true;
  } catch {
    return false;
  }
}
function hasRidersConsistentWithPendingMounts(carrier, expectedRiderIds, additionalExpectedRiderIds, persistentExpectedRiderIds, pendingRiderIds) {
  for (const riderId of pendingRiderIds) {
    if (!expectedRiderIds.has(riderId) && !additionalExpectedRiderIds.has(riderId) && !persistentExpectedRiderIds.has(riderId)) return false;
  }
  const expectedSize = expectedRiderIds.size + additionalExpectedRiderIds.size + persistentExpectedRiderIds.size;
  if (!carrier.isValid) return false;
  try {
    const rideable = carrier.getComponent("minecraft:rideable");
    if (!rideable) return false;
    const riders = rideable.getRiders();
    const minimumExpectedSize = expectedSize - pendingRiderIds.size;
    if (riders.length < minimumExpectedSize || riders.length > expectedSize) return false;
    const nativeRiderIds = /* @__PURE__ */ new Set();
    for (const rider of riders) {
      if (!rider.isValid || !expectedRiderIds.has(rider.id) && !additionalExpectedRiderIds.has(rider.id) && !persistentExpectedRiderIds.has(rider.id)) return false;
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
function hasNativeRider(carrier, riderId) {
  if (!carrier.isValid) return false;
  try {
    return carrier.getComponent("minecraft:rideable")?.getRiders().some((rider) => rider.isValid && rider.id === riderId) === true;
  } catch {
    return false;
  }
}
function scheduleRiderMountConfirmation(carrier, rider, pendingRiderIds, isMountCurrent, markIntegrityFailure, kind) {
  const riderId = rider.id;
  const queuedTick = system.currentTick;
  const riderDescription = kind === "persistent" ? "Persistent sub-level entity" : "Sub-level render entity";
  const carrierDescription = kind === "persistent" ? "Persistent sub-level carrier" : "Sub-level render carrier";
  pendingRiderIds.add(riderId);
  const confirm = () => {
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
      rideable.addRider(rider);
    }
    system.run(confirm);
  };
  system.run(confirm);
}
function exceedsWriteThreshold(value, previous, threshold) {
  return !Number.isFinite(previous) || Math.abs(value - previous) >= threshold;
}
export {
  RENDER_POSITION_WRITE_THRESHOLD,
  RENDER_ROTATION_WRITE_THRESHOLD_DEGREES,
  ejectCurrentVehicle,
  exceedsWriteThreshold,
  getContinuousRenderRotation,
  hasExactRiders,
  hasNativeRider,
  hasRidersConsistentWithPendingMounts,
  nativeRiders,
  scheduleRiderMountConfirmation,
  validEntityLocations
};
