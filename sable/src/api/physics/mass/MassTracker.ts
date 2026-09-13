// Mass, center-of-mass moment, inertia and buoyancy-point derivation for a
// sub-level's block grid, plus the default compound collider built from it.
// Migrated from TreePhysics src/physics/contraption/Mass.ts and the default
// collider helper at the end of TreePhysics src/Physics.ts; the name-suffix
// buoyancy defaults are replaced by BLOCK_PHYSICS_PROPERTIES lookups.
import type { Vector3 } from "@minecraft/server";
import type { SubLevelBlock } from "../../../sublevel/SubLevel.js";
import type {
  PhysicsBodyBuoyancyPoint,
  PhysicsBodyCollider
} from "../PhysicsTypes.js";
import { normalizeBlockMass } from "../collider/SubLevelBlockNormalization.js";
import { SubLevelColliderIndex } from "../collider/SubLevelColliderIndex.js";
import {
  BLOCK_PHYSICS_PROPERTIES,
  DEFAULT_BLOCK_BUOYANCY_VOLUME
} from "../../../data/vanilla/physics/BlockPhysicsProperties.js";

export function normalizeBlockBuoyancyVolume(block: SubLevelBlock): number {
  if (Number.isFinite(block.buoyancyVolume) && block.buoyancyVolume! >= 0) {
    return block.buoyancyVolume!;
  }
  return BLOCK_PHYSICS_PROPERTIES[block.typeId]?.buoyancyVolume ?? DEFAULT_BLOCK_BUOYANCY_VOLUME;
}

export function createDefaultSubLevelBuoyancyPoints(
  blocks: readonly SubLevelBlock[]
): PhysicsBodyBuoyancyPoint[] {
  return blocks
    .map(block => ({
      localLocation: { ...block.localLocation },
      volume: normalizeBlockBuoyancyVolume(block)
    }))
    .filter(point => point.volume > 0);
}

export function computeSubLevelMassProperties(
  blocks: readonly SubLevelBlock[]
): { readonly mass: number; readonly moment: Vector3 } {
  let mass = 0;
  const moment = { x: 0, y: 0, z: 0 };
  for (const block of blocks) {
    const blockMass = normalizeBlockMass(block);
    mass += blockMass;
    moment.x += block.localLocation.x * blockMass;
    moment.y += block.localLocation.y * blockMass;
    moment.z += block.localLocation.z * blockMass;
  }
  return { mass, moment };
}

export function computeSubLevelInertia(
  collider: Extract<PhysicsBodyCollider, { type: "compound" }>,
  mass: number
): Vector3 {
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let minZ = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  let maxZ = Number.NEGATIVE_INFINITY;
  // Compound children use a bottom-center origin: location marks the box's
  // bottom face center, so Y spans [y, y + size.y] while X/Z span +-size/2.
  for (const child of collider.children) {
    if (child.collider.type !== "box") continue;
    const size = child.collider.size ?? {
      x: (child.collider.halfExtents?.x ?? 0.5) * 2,
      y: (child.collider.halfExtents?.y ?? 0.5) * 2,
      z: (child.collider.halfExtents?.z ?? 0.5) * 2
    };
    const location = child.location ?? { x: 0, y: 0, z: 0 };
    minX = Math.min(minX, location.x - size.x / 2);
    minY = Math.min(minY, location.y);
    minZ = Math.min(minZ, location.z - size.z / 2);
    maxX = Math.max(maxX, location.x + size.x / 2);
    maxY = Math.max(maxY, location.y + size.y);
    maxZ = Math.max(maxZ, location.z + size.z / 2);
  }
  const sizeX = maxX - minX;
  const sizeY = maxY - minY;
  const sizeZ = maxZ - minZ;
  return {
    x: mass * (sizeY * sizeY + sizeZ * sizeZ) / 12,
    y: mass * (sizeX * sizeX + sizeZ * sizeZ) / 12,
    z: mass * (sizeY * sizeY + sizeX * sizeX) / 12
  };
}

export function createDefaultSubLevelCollider(
  blocks: readonly SubLevelBlock[]
): Extract<PhysicsBodyCollider, { type: "compound" }> {
  return new SubLevelColliderIndex(blocks).collider;
}
