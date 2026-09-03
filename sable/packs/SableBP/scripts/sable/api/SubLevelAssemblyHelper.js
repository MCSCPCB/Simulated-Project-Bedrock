const LEGACY_LOG_ITEMS = {
  acacia: "minecraft:acacia_log",
  birch: "minecraft:birch_log",
  dark_oak: "minecraft:dark_oak_log",
  jungle: "minecraft:jungle_log",
  oak: "minecraft:oak_log",
  spruce: "minecraft:spruce_log"
};
const LEGACY_LEAF_ITEMS = {
  acacia: "minecraft:acacia_leaves",
  birch: "minecraft:birch_leaves",
  dark_oak: "minecraft:dark_oak_leaves",
  jungle: "minecraft:jungle_leaves",
  oak: "minecraft:oak_leaves",
  spruce: "minecraft:spruce_leaves"
};
function captureSubLevelBlock(block, origin) {
  const permutation = block.permutation;
  const typeId = permutation.type.id;
  const states = permutation.getAllStates();
  const captured = {
    localLocation: {
      x: block.location.x - origin.x,
      y: block.location.y - origin.y,
      z: block.location.z - origin.z
    },
    states,
    typeId
  };
  const itemTypeId = heldItemTypeId(typeId, states);
  if (itemTypeId !== typeId) captured.itemTypeId = itemTypeId;
  const rotation = heldBlockRotation(states);
  if (rotation) captured.rotation = rotation;
  if (!typeId.startsWith("minecraft:")) {
    const mapColor = captureMapColor(block, typeId);
    if (mapColor) captured.mapColor = mapColor;
  }
  return captured;
}
function captureSubLevelBlocks(blocks, origin) {
  const result = [];
  for (const block of blocks) {
    if (block.isAir || block.isLiquid) continue;
    result.push(captureSubLevelBlock(block, origin));
  }
  return result;
}
function heldItemTypeId(typeId, states) {
  if (typeId === "minecraft:log") {
    return LEGACY_LOG_ITEMS[String(states.old_log_type ?? "oak")] ?? typeId;
  }
  if (typeId === "minecraft:log2") {
    return LEGACY_LOG_ITEMS[String(states.new_log_type ?? "acacia")] ?? typeId;
  }
  if (typeId === "minecraft:leaves") {
    return LEGACY_LEAF_ITEMS[String(states.old_leaf_type ?? "oak")] ?? typeId;
  }
  if (typeId === "minecraft:leaves2") {
    return LEGACY_LEAF_ITEMS[String(states.new_leaf_type ?? "acacia")] ?? typeId;
  }
  return typeId;
}
function heldBlockRotation(states) {
  const axis = states.pillar_axis ?? states["minecraft:pillar_axis"];
  if (axis === "x") return { x: 0, y: 0, z: 90 };
  if (axis === "z") return { x: 90, y: 0, z: 0 };
  const blockFace = states["minecraft:block_face"] ?? states.block_face;
  if (blockFace === "east" || blockFace === "west") return { x: 0, y: 0, z: 90 };
  if (blockFace === "north" || blockFace === "south") return { x: 90, y: 0, z: 0 };
  return void 0;
}
function captureMapColor(block, typeId) {
  const component = block.getComponent("minecraft:map_color");
  if (!component) return void 0;
  const { blue, green, red } = component.tintedColor;
  for (const [channel, value] of [["red", red], ["green", green], ["blue", blue]]) {
    if (!Number.isFinite(value) || value < 0 || value > 1) {
      throw new RangeError(`Invalid ${channel} map-color channel for ${typeId}: ${value}.`);
    }
  }
  return { blue, green, red };
}
export {
  captureSubLevelBlock,
  captureSubLevelBlocks
};
