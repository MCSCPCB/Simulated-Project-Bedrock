import type { Vector3 } from "@minecraft/server";
import type { SubLevelBlock } from "../sublevel/SubLevel.js";

export const DEFAULT_SUBLEVEL_RENDER_ANCHOR_LOCAL: Vector3 = Object.freeze({
  x: 0,
  y: 1,
  z: 0
});

/** Select the stable collidable block nearest to the default render anchor. */
export function selectSubLevelRenderAnchor(blocks: readonly SubLevelBlock[]): Vector3 {
  return findSubLevelRenderAnchor(blocks) ?? { ...DEFAULT_SUBLEVEL_RENDER_ANCHOR_LOCAL };
}

export function findSubLevelRenderAnchor(
  blocks: readonly SubLevelBlock[]
): Vector3 | undefined {
  let selected: SubLevelBlock | undefined;
  let selectedDistance = Number.POSITIVE_INFINITY;
  for (const block of blocks) {
    if (!isStableRenderAnchorBlock(block)) continue;
    const dx = block.localLocation.x - DEFAULT_SUBLEVEL_RENDER_ANCHOR_LOCAL.x;
    const dy = block.localLocation.y - DEFAULT_SUBLEVEL_RENDER_ANCHOR_LOCAL.y;
    const dz = block.localLocation.z - DEFAULT_SUBLEVEL_RENDER_ANCHOR_LOCAL.z;
    const distance = dx * dx + dy * dy + dz * dz;
    if (distance < selectedDistance) {
      selected = block;
      selectedDistance = distance;
    }
  }
  return selected ? { ...selected.localLocation } : undefined;
}

function isStableRenderAnchorBlock(block: SubLevelBlock): boolean {
  return block.collidable !== false
    && block.collisionResponse !== false
    && block.runtimeCollidable !== false
    && block.collisionShape !== "none";
}
