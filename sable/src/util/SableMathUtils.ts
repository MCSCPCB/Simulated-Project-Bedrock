// Integer block-key packing and axis-aligned bounds arithmetic shared by the
// physics modules. Migrated from TreePhysics src/utils/BlockKey.ts (packed keys)
// and TreePhysics src/content/tree/contraption/Bounds.ts (bounds helpers).
import type { Vector3 } from "@minecraft/server";
import type { PhysicsBodyAabb } from "../api/physics/PhysicsTypes.js";

export const LOCAL_BLOCK_KEY_BIAS = 512;
export const LOCAL_BLOCK_KEY_BASE = 2048;
export const LOCAL_BLOCK_COORDINATE_LIMIT = 511;

const CROSS_DOMAIN_PREDICTION_SECONDS = 0.35;
const CROSS_DOMAIN_MAX_PREDICTIVE_TRAVEL = 12;
const CROSS_DOMAIN_SUPPORT_MARGIN = 1.5;
const CROSS_DOMAIN_GUARD_BLOCKS = 16;

export function blockCenter(location: Vector3): Vector3 {
  return { x: location.x + 0.5, y: location.y + 0.5, z: location.z + 0.5 };
}

/** Integer packing shared by topology maps and local sub-level indexes. */
export function packIntegerCoordinates(
  x: number,
  y: number,
  z: number,
  bias: number,
  base: number
): number {
  return (x + bias) + (y + bias) * base + (z + bias) * base * base;
}

export function packLocalBlockKey(x: number, y: number, z: number): number {
  if (
    x < -LOCAL_BLOCK_KEY_BIAS || x > LOCAL_BLOCK_COORDINATE_LIMIT
    || y < -LOCAL_BLOCK_KEY_BIAS || y > LOCAL_BLOCK_COORDINATE_LIMIT
    || z < -LOCAL_BLOCK_KEY_BIAS || z > LOCAL_BLOCK_COORDINATE_LIMIT
  ) return Number.NaN;
  return packIntegerCoordinates(x, y, z, LOCAL_BLOCK_KEY_BIAS, LOCAL_BLOCK_KEY_BASE);
}

export function vectorSignature(value: Vector3): string {
  return `${value.x},${value.y},${value.z}`;
}

export function createPredictedBounds(bounds: PhysicsBodyAabb, velocity: Vector3): PhysicsBodyAabb {
  const travel = {
    x: clampTravel(velocity.x * CROSS_DOMAIN_PREDICTION_SECONDS),
    y: clampTravel(velocity.y * CROSS_DOMAIN_PREDICTION_SECONDS),
    z: clampTravel(velocity.z * CROSS_DOMAIN_PREDICTION_SECONDS)
  };
  return {
    min: {
      x: bounds.min.x - CROSS_DOMAIN_SUPPORT_MARGIN + Math.min(0, travel.x),
      y: bounds.min.y - CROSS_DOMAIN_SUPPORT_MARGIN + Math.min(0, travel.y),
      z: bounds.min.z - CROSS_DOMAIN_SUPPORT_MARGIN + Math.min(0, travel.z)
    },
    max: {
      x: bounds.max.x + CROSS_DOMAIN_SUPPORT_MARGIN + Math.max(0, travel.x),
      y: bounds.max.y + CROSS_DOMAIN_SUPPORT_MARGIN + Math.max(0, travel.y),
      z: bounds.max.z + CROSS_DOMAIN_SUPPORT_MARGIN + Math.max(0, travel.z)
    }
  };
}

export function createOutwardGuardBounds(bounds: PhysicsBodyAabb, subLevelLocation: Vector3, playerLocation: Vector3): PhysicsBodyAabb {
  const result = cloneBounds(bounds);
  const dx = subLevelLocation.x - playerLocation.x;
  const dz = subLevelLocation.z - playerLocation.z;
  if (Math.abs(dx) >= Math.abs(dz)) {
    if (dx >= 0) result.max.x += CROSS_DOMAIN_GUARD_BLOCKS;
    else result.min.x -= CROSS_DOMAIN_GUARD_BLOCKS;
  } else if (dz >= 0) {
    result.max.z += CROSS_DOMAIN_GUARD_BLOCKS;
  } else {
    result.min.z -= CROSS_DOMAIN_GUARD_BLOCKS;
  }
  return result;
}

export function expandBounds(bounds: PhysicsBodyAabb, amount: number): PhysicsBodyAabb {
  return {
    min: { x: bounds.min.x - amount, y: bounds.min.y - amount, z: bounds.min.z - amount },
    max: { x: bounds.max.x + amount, y: bounds.max.y + amount, z: bounds.max.z + amount }
  };
}

export function boundsOverlap(left: PhysicsBodyAabb, right: PhysicsBodyAabb): boolean {
  return left.min.x <= right.max.x && left.max.x >= right.min.x
    && left.min.y <= right.max.y && left.max.y >= right.min.y
    && left.min.z <= right.max.z && left.max.z >= right.min.z;
}

export function mergeBounds(left: PhysicsBodyAabb, right: PhysicsBodyAabb): PhysicsBodyAabb {
  return {
    min: { x: Math.min(left.min.x, right.min.x), y: Math.min(left.min.y, right.min.y), z: Math.min(left.min.z, right.min.z) },
    max: { x: Math.max(left.max.x, right.max.x), y: Math.max(left.max.y, right.max.y), z: Math.max(left.max.z, right.max.z) }
  };
}

export function vectorDistance(left: Vector3, right: Vector3): number {
  return Math.hypot(left.x - right.x, left.y - right.y, left.z - right.z);
}

export function cloneBounds(bounds: PhysicsBodyAabb): PhysicsBodyAabb {
  return { min: { ...bounds.min }, max: { ...bounds.max } };
}

function clampTravel(value: number): number {
  return Math.max(-CROSS_DOMAIN_MAX_PREDICTIVE_TRAVEL, Math.min(CROSS_DOMAIN_MAX_PREDICTIVE_TRAVEL, value));
}
