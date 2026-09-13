// Contact queries against a sub-level's blocks: the nearest point inside an
// explosion sphere and the deepest contact inside a piston's front volumes,
// plus the axis-aligned bounds helpers those queries share.
// Migrated from TreePhysics src/content/contraption/interaction/ContactQuery.ts.
import type { Vector3 } from "@minecraft/server";
import type { ServerSubLevel } from "../../../sublevel/ServerSubLevel.js";
import type { PhysicsBodyAabb } from "../PhysicsTypes.js";
import {
  dot,
  isFiniteVector,
  scale,
  squaredDistance,
  subtract,
  EPSILON_1E8
} from "../../../util/SableVector3Utils.js";
import {
  clampPointToAabb,
  getSubLevelBasis,
  getLocalCollisionBoxes,
  getObbSupportPoint,
  isAxisDirection,
  midpoint,
  obbIntersectsAabb,
  prepareSatBasis,
  worldAabbToLocalBounds
} from "./SubLevelContactGeometry.js";

const CONTACT_EPSILON = EPSILON_1E8;
// Half the body diagonal of a unit block: the farthest any point of a block
// can sit from its cell center, used to pad sphere-query bounds.
const HALF_BLOCK_DIAGONAL = Math.sqrt(3) / 2;

export interface SubLevelContact {
  readonly location: Vector3;
  readonly distance: number;
}

export interface SubLevelPistonContact extends SubLevelContact {
  /** Axis distance required to move the contacted block beyond the detection volume. */
  readonly separationDistance: number;
}
export function findSubLevelSphereContact(
  subLevel: ServerSubLevel,
  center: Vector3,
  radius: number
): SubLevelContact | undefined {
  if (!subLevel.isValid || !isFiniteVector(center) || !Number.isFinite(radius) || radius <= 0) {
    return undefined;
  }
  const localCenter = subLevel.body.worldPointToLocal(center);
  const margin = radius + HALF_BLOCK_DIAGONAL;
  const blocks = subLevel.getBlocksInLocalBounds(
    {
      x: localCenter.x - margin,
      y: localCenter.y - margin,
      z: localCenter.z - margin
    },
    {
      x: localCenter.x + margin,
      y: localCenter.y + margin,
      z: localCenter.z + margin
    }
  );
  let closestLocal: Vector3 | undefined;
  let closestDistanceSquared = radius * radius + CONTACT_EPSILON;

  for (const block of blocks) {
    for (const box of getLocalCollisionBoxes(block, false)) {
      const point = clampPointToAabb(localCenter, box);
      const distanceSquared = squaredDistance(localCenter, point);
      if (distanceSquared >= closestDistanceSquared) continue;
      closestDistanceSquared = distanceSquared;
      closestLocal = point;
    }
  }
  if (!closestLocal) return undefined;
  return {
    distance: Math.sqrt(Math.max(0, closestDistanceSquared)),
    location: subLevel.body.localPointToWorld(closestLocal)
  };
}

export function findSubLevelPistonContact(
  subLevel: ServerSubLevel,
  fronts: readonly PhysicsBodyAabb[],
  direction: Vector3
): SubLevelPistonContact | undefined {
  if (!subLevel.isValid || !isAxisDirection(direction) || fronts.length === 0) return undefined;
  const basis = getSubLevelBasis(subLevel);
  // The SAT rotation matrix depends only on the sub-level pose, so build it
  // once instead of re-deriving it for every block box in the inner loop.
  const sat = prepareSatBasis(basis);
  const inverseDirection = scale(direction, -1);
  const subLevelBounds = subLevel.body.getAabb();
  const contactsByCollisionBox = new Map<string, SubLevelPistonContact>();

  for (const front of fronts) {
    if (!aabbOverlaps(subLevelBounds, front)) continue;
    const localBounds = worldAabbToLocalBounds(subLevel, front);
    for (const block of subLevel.getBlocksInLocalBounds(localBounds.min, localBounds.max)) {
      const boxes = getLocalCollisionBoxes(block, true);
      for (let boxIndex = 0; boxIndex < boxes.length; boxIndex++) {
        const box = boxes[boxIndex]!;
        const centerLocal = midpoint(box.min, box.max);
        const halfExtents = scale(subtract(box.max, box.min), 0.5);
        const centerWorld = subLevel.body.localPointToWorld(centerLocal);
        if (!obbIntersectsAabb(centerWorld, halfExtents, sat, front)) continue;
        const location = getObbSupportPoint(centerWorld, halfExtents, basis, inverseDirection);
        const projection = dot(location, direction);
        const separationDistance = getAabbForwardProjection(front, direction) - projection;
        const key = getCollisionBoxKey(block.localLocation, boxIndex);
        const existing = contactsByCollisionBox.get(key);
        if (existing && existing.separationDistance >= separationDistance) continue;
        contactsByCollisionBox.set(key, { distance: 0, location, separationDistance });
      }
    }
  }
  if (contactsByCollisionBox.size === 0) return undefined;

  let greatestSeparation = Number.NEGATIVE_INFINITY;
  for (const contact of contactsByCollisionBox.values()) {
    greatestSeparation = Math.max(greatestSeparation, contact.separationDistance);
  }
  const location = { x: 0, y: 0, z: 0 };
  let contactCount = 0;
  for (const contact of contactsByCollisionBox.values()) {
    if (contact.separationDistance + CONTACT_EPSILON < greatestSeparation) continue;
    location.x += contact.location.x;
    location.y += contact.location.y;
    location.z += contact.location.z;
    contactCount++;
  }
  location.x /= contactCount;
  location.y /= contactCount;
  location.z /= contactCount;
  return { distance: 0, location, separationDistance: greatestSeparation };
}

function getCollisionBoxKey(localLocation: Vector3, boxIndex: number): string {
  return `${localLocation.x},${localLocation.y},${localLocation.z}|${boxIndex}`;
}

function getAabbForwardProjection(bounds: PhysicsBodyAabb, direction: Vector3): number {
  if (direction.x > 0) return bounds.max.x;
  if (direction.x < 0) return -bounds.min.x;
  if (direction.y > 0) return bounds.max.y;
  if (direction.y < 0) return -bounds.min.y;
  if (direction.z > 0) return bounds.max.z;
  return -bounds.min.z;
}

export function sphereIntersectsAabb(
  center: Vector3,
  radius: number,
  bounds: PhysicsBodyAabb
): boolean {
  if (!Number.isFinite(radius) || radius < 0) return false;
  const closest = clampPointToAabb(center, bounds);
  return squaredDistance(center, closest) <= radius * radius;
}

export function aabbOverlaps(left: PhysicsBodyAabb, right: PhysicsBodyAabb): boolean {
  return left.min.x <= right.max.x && left.max.x >= right.min.x
    && left.min.y <= right.max.y && left.max.y >= right.min.y
    && left.min.z <= right.max.z && left.max.z >= right.min.z;
}

export function unionAabbs(bounds: readonly PhysicsBodyAabb[]): PhysicsBodyAabb | undefined {
  const first = bounds[0];
  if (!first) return undefined;
  const result = {
    min: { ...first.min },
    max: { ...first.max }
  };
  for (let index = 1; index < bounds.length; index++) {
    const value = bounds[index]!;
    result.min.x = Math.min(result.min.x, value.min.x);
    result.min.y = Math.min(result.min.y, value.min.y);
    result.min.z = Math.min(result.min.z, value.min.z);
    result.max.x = Math.max(result.max.x, value.max.x);
    result.max.y = Math.max(result.max.y, value.max.y);
    result.max.z = Math.max(result.max.z, value.max.z);
  }
  return result;
}
