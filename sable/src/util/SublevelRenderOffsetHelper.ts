import type { Vector3 } from "@minecraft/server";
import type { SubLevelBlock } from "../sublevel/SubLevel.js";

export const DEFAULT_SUBLEVEL_VISUAL_ANCHOR_LOCAL: Vector3 = Object.freeze({
  x: 0,
  y: 1,
  z: 0
});

/** Select the stable collidable block nearest to the default visual anchor. */
export function selectSubLevelVisualAnchor(blocks: readonly SubLevelBlock[]): Vector3 {
  return findSubLevelVisualAnchor(blocks) ?? { ...DEFAULT_SUBLEVEL_VISUAL_ANCHOR_LOCAL };
}

export function findSubLevelVisualAnchor(
  blocks: readonly SubLevelBlock[]
): Vector3 | undefined {
  let selected: SubLevelBlock | undefined;
  let selectedDistance = Number.POSITIVE_INFINITY;
  for (const block of blocks) {
    if (!isStableVisualAnchorBlock(block)) continue;
    const dx = block.localLocation.x - DEFAULT_SUBLEVEL_VISUAL_ANCHOR_LOCAL.x;
    const dy = block.localLocation.y - DEFAULT_SUBLEVEL_VISUAL_ANCHOR_LOCAL.y;
    const dz = block.localLocation.z - DEFAULT_SUBLEVEL_VISUAL_ANCHOR_LOCAL.z;
    const distance = dx * dx + dy * dy + dz * dz;
    if (distance < selectedDistance) {
      selected = block;
      selectedDistance = distance;
    }
  }
  return selected ? { ...selected.localLocation } : undefined;
}

function isStableVisualAnchorBlock(block: SubLevelBlock): boolean {
  return block.collidable !== false
    && block.collisionResponse !== false
    && block.runtimeCollidable !== false
    && block.collisionShape !== "none";
}
