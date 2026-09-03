const DEFAULT_SUBLEVEL_RENDER_ANCHOR_LOCAL = Object.freeze({
  x: 0,
  y: 1,
  z: 0
});
function selectSubLevelRenderAnchor(blocks) {
  return findSubLevelRenderAnchor(blocks) ?? { ...DEFAULT_SUBLEVEL_RENDER_ANCHOR_LOCAL };
}
function findSubLevelRenderAnchor(blocks) {
  let selected;
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
  return selected ? { ...selected.localLocation } : void 0;
}
function isStableRenderAnchorBlock(block) {
  return block.collidable !== false && block.collisionResponse !== false && block.runtimeCollidable !== false && block.collisionShape !== "none";
}
export {
  DEFAULT_SUBLEVEL_RENDER_ANCHOR_LOCAL,
  findSubLevelRenderAnchor,
  selectSubLevelRenderAnchor
};
