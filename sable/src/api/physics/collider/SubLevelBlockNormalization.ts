// Validation and defaulting for the block list a sub-level is created from:
// integer local locations, safe type ids, per-block collision shapes, and the
// table-driven rigid-body mass.
// Migrated from TreePhysics src/physics/contraption/Normalization.ts; the
// name-suffix mass defaults are replaced by BLOCK_PHYSICS_PROPERTIES lookups,
// and the collidability predicates live in SubLevelInteractionSystem.
import type { SubLevelBlock, SubLevelFoliageTint } from "../../../sublevel/SubLevel.js";
import { MAX_SUB_LEVEL_BLOCKS } from "../PhysicsTypes.js";
import { isSubLevelFoliageTint } from "../../../sublevel/storage/serialization/SubLevelData.js";
import { BLOCK_PHYSICS_PROPERTIES, DEFAULT_BLOCK_MASS } from "../../../data/vanilla/physics/BlockPhysicsProperties.js";
import { LOCAL_BLOCK_COORDINATE_LIMIT } from "../../../util/SableMathUtils.js";
import { blockLocationKey, isFiniteVector, isIntegerVector } from "../../../util/SableVector3Utils.js";

const SAFE_TYPE_ID_PATTERN = /^[a-z0-9_.-]+:[a-z0-9_./-]+$/;

export function normalizeSubLevelBlocks(blocks: readonly SubLevelBlock[]): SubLevelBlock[] {
  if (!Array.isArray(blocks) || blocks.length === 0) {
    throw new RangeError("ServerSubLevelOptions.blocks must not be empty.");
  }
  if (blocks.length > MAX_SUB_LEVEL_BLOCKS) {
    throw new RangeError(`Sub-levels support at most ${MAX_SUB_LEVEL_BLOCKS} blocks.`);
  }
  const occupied = new Set<string>();
  return blocks.map((block, index) => {
    if (!block || !isFiniteVector(block.localLocation) || !isIntegerVector(block.localLocation)) {
      throw new TypeError(`Sub-level block ${index} must use a finite integer localLocation.`);
    }
    if (block.rotation && !isFiniteVector(block.rotation)) {
      throw new TypeError(`Sub-level block ${index} must use a finite rotation.`);
    }
    if (Math.max(Math.abs(block.localLocation.x), Math.abs(block.localLocation.y), Math.abs(block.localLocation.z)) > LOCAL_BLOCK_COORDINATE_LIMIT) {
      throw new RangeError(`Sub-level block ${index} exceeds the visual offset range.`);
    }
    if (!isSafeTypeId(block.typeId)) throw new TypeError(`Sub-level block ${index} has an invalid typeId.`);
    const key = blockLocationKey(block.localLocation);
    if (occupied.has(key)) throw new RangeError(`Sub-level block location ${key} is duplicated.`);
    occupied.add(key);
    return {
      ...block,
      itemTypeId: block.itemTypeId && isSafeTypeId(block.itemTypeId) ? block.itemTypeId : block.typeId,
      collisionShape: normalizeSubLevelBlockCollisionShape(block, index),
      localLocation: { ...block.localLocation },
      mass: normalizeBlockMass(block),
      rotation: block.rotation ? { ...block.rotation } : undefined
    };
  });
}

export function normalizeSubLevelFoliageTint(value: SubLevelFoliageTint | undefined): SubLevelFoliageTint | undefined {
  if (value === undefined) return undefined;
  if (!isSubLevelFoliageTint(value)) throw new TypeError("ServerSubLevelOptions.foliageTint is invalid.");
  return { ...value };
}

export function normalizeRenderEntityTags(value: readonly string[] | undefined): string[] {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.some(tag => typeof tag !== "string" || tag.length === 0 || tag.length > 255 || /[\r\n]/.test(tag))) {
    throw new TypeError("ServerSubLevelOptions.renderEntityTags is invalid.");
  }
  return [...new Set(value)];
}

function normalizeSubLevelBlockCollisionShape(block: SubLevelBlock, index: number): SubLevelBlock["collisionShape"] {
  const shape = block.collisionShape;
  if (shape === undefined || shape === "full" || shape === "none") return shape;
  if (!Array.isArray(shape) || shape.length === 0) throw new TypeError(`Sub-level block ${index} collisionShape must contain at least one box.`);
  return shape.map((box, boxIndex) => {
    if (!box || !isFiniteVector(box.min) || !isFiniteVector(box.max)
      || box.min.x < 0 || box.min.y < 0 || box.min.z < 0
      || box.max.x > 1 || box.max.y > 1 || box.max.z > 1
      || box.min.x >= box.max.x || box.min.y >= box.max.y || box.min.z >= box.max.z) {
      throw new RangeError(`Sub-level block ${index} collisionShape box ${boxIndex} must be a positive box within one block.`);
    }
    return { min: { ...box.min }, max: { ...box.max } };
  });
}

function isSafeTypeId(value: string): boolean {
  return SAFE_TYPE_ID_PATTERN.test(value);
}

export function normalizeBlockMass(block: SubLevelBlock): number {
  const mass = block.mass;
  if (Number.isFinite(mass) && mass! > 0) return mass!;
  return BLOCK_PHYSICS_PROPERTIES[block.typeId]?.mass ?? DEFAULT_BLOCK_MASS;
}
