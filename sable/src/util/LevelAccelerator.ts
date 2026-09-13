// Chunk-tolerant world reads for the physics modules: a throwing-safe block
// read, one native batch probe for sparse locations, chunk readability of a
// bounding box, and a per-tick world-block cache. Migrated from TreePhysics
// src/utils/WorldBlock.ts, TreePhysics src/utils/WorldBlockProbeBatch.ts,
// TreePhysics src/content/tree/contraption/Bounds.ts (areBoundsChunksReadable)
// and TreePhysics src/content/tree/contraption/Lifecycle.ts (world-block cache).
import {
  ListBlockVolume,
  type Block,
  type Dimension,
  type Vector3
} from "@minecraft/server";
import type { PhysicsBodyAabb } from "../api/physics/PhysicsTypes.js";
import { EPSILON_1E6, blockLocationKey } from "./SableVector3Utils.js";

const NON_AIR_BLOCK_FILTER = { excludeTypes: ["minecraft:air"] };

export interface BlockDimensionLike<TBlock> {
  getBlock(location: Vector3): TBlock | undefined;
}

/** World reads throw when the target chunk is unavailable; callers intentionally receive undefined. */
export function safeGetBlock<TBlock>(
  dimension: BlockDimensionLike<TBlock>,
  location: Vector3
): TBlock | undefined {
  try {
    return dimension.getBlock(location);
  } catch {
    return undefined;
  }
}

/**
 * Resolves a sparse set of probe locations through one native dimension query.
 * Air and unloaded locations are absent from the result; callers only cross the
 * script/native boundary again for locations that actually contain a block.
 * Map keys use the `x,y,z` integer format of the probed location, matching the
 * keys consumers build for their own probe locations.
 */
export function readWorldBlockProbeBatch(
  dimension: Dimension,
  /** Owned by this call; the array is handed to the native volume unchanged. */
  locations: Vector3[]
): Map<string, Block> {
  if (locations.length === 0) return new Map();

  const matching = dimension.getBlocks(
    new ListBlockVolume(locations),
    NON_AIR_BLOCK_FILTER,
    true
  );
  const blocks = new Map<string, Block>();
  for (const location of matching.getBlockLocationIterator()) {
    const block = dimension.getBlock(location);
    // getBlocks resolved these locations synchronously just above with unloaded
    // chunks excluded, so an undefined block here is not an expected outcome.
    if (block) blocks.set(blockLocationKey(location), block);
  }
  return blocks;
}

export function areBoundsChunksReadable(dimension: Dimension, bounds: PhysicsBodyAabb, cache?: Map<string, boolean>): boolean {
  const minChunkX = Math.floor(bounds.min.x / 16);
  const maxChunkX = Math.floor((bounds.max.x - EPSILON_1E6) / 16);
  const minChunkZ = Math.floor(bounds.min.z / 16);
  const maxChunkZ = Math.floor((bounds.max.z - EPSILON_1E6) / 16);
  const y = Math.floor((bounds.min.y + bounds.max.y) * 0.5);
  for (let chunkZ = minChunkZ; chunkZ <= maxChunkZ; chunkZ++) {
    for (let chunkX = minChunkX; chunkX <= maxChunkX; chunkX++) {
      const key = `${dimension.id}|${chunkX}|${y}|${chunkZ}`;
      let readable = cache?.get(key);
      if (readable === undefined) {
        readable = isLocationChunkReadable(dimension, { x: chunkX * 16 + 8, y, z: chunkZ * 16 + 8 });
        cache?.set(key, readable);
      }
      if (!readable) return false;
    }
  }
  return true;
}

function isLocationChunkReadable(dimension: Dimension, location: Vector3): boolean {
  try {
    return dimension.getBlock(location) !== undefined;
  } catch {
    return false;
  }
}

/** Caches world block reads for the duration of one tick. */
export class WorldBlockCache {
  readonly #blocks = new Map<string, Block | undefined>();
  #tick = -1;

  /** Drops the cache when a new tick begins. */
  prepare(currentTick: number): void {
    if (this.#tick === currentTick) return;
    this.#tick = currentTick;
    this.#blocks.clear();
  }

  get(dimension: Dimension, location: Vector3): Block | undefined {
    const key = `${dimension.id}|${blockLocationKey(location)}`;
    if (this.#blocks.has(key)) {
      return this.#blocks.get(key);
    }
    const block = safeGetBlock(dimension, location);
    this.#blocks.set(key, block);
    return block;
  }

  clear(): void {
    this.#blocks.clear();
  }
}
