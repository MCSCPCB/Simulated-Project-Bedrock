import { getSubLevelBlockRegistration } from "../sublevel/render/fancy/model/FancySubLevelModelRegistry.js";
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
const HORIZONTAL_FACING_ROTATIONS = {
  // Vanilla hand-item geometry has a quarter-turn baseline relative to the
  // cardinal model basis used by the fancy route. These are local item yaw
  // values; the vanilla animation applies the corresponding opposite bone
  // rotation when publishing them.
  south: { x: 0, y: 270, z: 0 },
  west: { x: 0, y: 0, z: 0 },
  north: { x: 0, y: 90, z: 0 },
  east: { x: 0, y: 180, z: 0 }
};
const ORIENTATION_ROTATIONS = {
  down_east: { x: 90, y: 90, z: 90 },
  down_north: { x: 0, y: 270, z: 90 },
  down_south: { x: 0, y: 90, z: 90 },
  down_west: { x: 0, y: 0, z: 90 },
  up_east: { x: 180, y: 0, z: 270 },
  up_north: { x: 0, y: 270, z: 270 },
  up_south: { x: 0, y: 90, z: 270 },
  up_west: { x: 180, y: 180, z: 270 },
  west_up: { x: 0, y: 0, z: 0 },
  east_up: { x: 0, y: 180, z: 0 },
  north_up: { x: 180, y: 90, z: 180 },
  south_up: { x: 180, y: 270, z: 180 }
};
const FRONT_FACING_DIRECTION_TURNS = [1, 0, 3, 2];
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
  if (getSubLevelBlockRegistration(typeId)?.passable === true) {
    captured.collisionResponse = false;
  }
  const itemTypeId = heldItemTypeId(typeId, states);
  if (itemTypeId !== typeId) captured.itemTypeId = itemTypeId;
  const rotation = resolveSubLevelBlockRotation(typeId, states);
  if (rotation) captured.rotation = rotation;
  const visualYOffset = resolveSubLevelBlockVisualYOffset(typeId, states);
  if (visualYOffset !== 0) captured.visualYOffset = visualYOffset;
  const visualOffset = resolveSubLevelBlockVisualOffset(typeId, states);
  if (visualOffset) captured.visualOffset = visualOffset;
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
function resolveSubLevelBlockRotation(typeIdOrStates, suppliedStates) {
  const typeId = typeof typeIdOrStates === "string" ? typeIdOrStates : "";
  const states = suppliedStates ?? (typeof typeIdOrStates === "string" ? {} : typeIdOrStates);
  const orientation = firstState(states, ["minecraft:orientation", "orientation"]);
  if (orientation && typeof orientation.value === "string") {
    const rotation = ORIENTATION_ROTATIONS[orientation.value];
    if (rotation) return { ...rotation };
  }
  const axis = firstState(states, ["minecraft:pillar_axis", "pillar_axis", "minecraft:axis", "axis"]);
  if (axis) return axisRotation(axis.value);
  const stairDirection = firstState(states, ["weirdo_direction", "minecraft:weirdo_direction"]);
  if (stairDirection) {
    const direction2 = requireIntegerState(stairDirection.value, 0, 3);
    const yaw = [270, 270, 180, 180][direction2];
    const upsideDown = firstState(states, ["upside_down_bit", "minecraft:upside_down_bit"]);
    return upsideDown?.value === true ? composeRotations({ x: 0, y: yaw, z: 0 }, { x: 0, y: 0, z: 180 }) : { x: 0, y: yaw, z: 0 };
  }
  const horizontalFacing = firstState(states, [
    "minecraft:cardinal_direction",
    "cardinal_direction",
    "minecraft:horizontal_facing_direction",
    "horizontal_facing_direction"
  ]);
  if (horizontalFacing && typeof horizontalFacing.value === "string") {
    const rotation = HORIZONTAL_FACING_ROTATIONS[horizontalFacing.value];
    if (rotation) return { ...rotation };
  }
  const signDirection = firstState(states, ["ground_sign_direction", "minecraft:ground_sign_direction"]);
  if (signDirection) {
    return { x: 0, y: requireIntegerState(signDirection.value, 0, 15) * 22.5, z: 0 };
  }
  const blockFace = firstState(states, ["minecraft:block_face", "block_face"]);
  if (blockFace && typeof blockFace.value === "string") {
    const rotations = {
      up: { x: 0, y: 0, z: 0 },
      down: { x: 180, y: 0, z: 0 },
      south: { x: 90, y: 0, z: 0 },
      north: { x: 270, y: 0, z: 0 },
      west: { x: 0, y: 0, z: 90 },
      east: { x: 0, y: 0, z: 270 }
    };
    const rotation = rotations[blockFace.value];
    if (rotation) return { ...rotation };
  }
  const facing = firstState(states, ["facing_direction", "minecraft:facing_direction"]);
  if (facing) {
    if (typeof facing.value === "string") {
      const rotation = HORIZONTAL_FACING_ROTATIONS[facing.value];
      if (rotation) return { ...rotation };
      return void 0;
    }
    const direction2 = requireIntegerState(facing.value, 0, 5);
    if (isHeadOrSkull(typeName(typeId))) {
      return HEAD_FACING_DIRECTION_ROTATIONS[direction2];
    }
    return FACING_DIRECTION_ROTATIONS[direction2];
  }
  const direction = firstState(states, ["direction", "minecraft:direction"]);
  if (direction && isNumericDirectionState(direction.value)) {
    const value = requireIntegerState(direction.value, 0, 3);
    const name = typeName(typeId);
    const turns = isTrapdoor(name) ? [1, 3, 2, 0][value] : usesFrontFacingDirectionStateMapping(name, states) ? FRONT_FACING_DIRECTION_TURNS[value] : value;
    return { x: 0, y: turns * 90, z: 0 };
  }
  return void 0;
}
function resolveSubLevelBlockVisualYOffset(typeId, states) {
  const name = typeName(typeId);
  if (isSlab(name) && !isDoubleSlab(name)) {
    const half = firstState(states, ["minecraft:vertical_half", "vertical_half"]);
    return -4 / 16 + (half?.value === "top" ? 8 / 16 : 0);
  }
  if (isTrapdoor(name)) {
    const upsideDown = firstState(states, ["upside_down_bit", "minecraft:upside_down_bit"]);
    return -8 / 16 + (upsideDown?.value === true ? 14.5 / 16 : 1.5 / 16);
  }
  return 0;
}
function resolveSubLevelBlockVisualOffset(typeId, states) {
  if (!isHeadOrSkull(typeName(typeId))) return void 0;
  const facing = firstState(states, ["facing_direction", "minecraft:facing_direction"]);
  if (!facing || typeof facing.value !== "number" || !Number.isInteger(facing.value) || facing.value < 0 || facing.value > 5) return void 0;
  return HEAD_FACING_DIRECTION_VISUAL_OFFSETS[facing.value];
}
function firstState(states, keys) {
  for (const key of keys) {
    const value = states[key];
    if (value !== void 0) return { key, value };
  }
  return void 0;
}
function requireIntegerState(value, minimum, maximum) {
  if (typeof value !== "number" || !Number.isInteger(value) || value < minimum || value > maximum) return minimum;
  return value;
}
function axisRotation(value) {
  if (value === "x") return { x: 0, y: 0, z: 90 };
  if (value === "z") return { x: 90, y: 0, z: 0 };
  if (value === "y") return { x: 0, y: 0, z: 0 };
  return void 0;
}
const FACING_DIRECTION_ROTATIONS = [
  { x: 0, y: 90, z: 90 },
  { x: 0, y: 90, z: 270 },
  { x: 0, y: 270, z: 0 },
  { x: 0, y: 90, z: 0 },
  { x: 0, y: 0, z: 0 },
  { x: 0, y: 180, z: 0 }
];
const HEAD_FACING_DIRECTION_ROTATIONS = [
  { x: 0, y: 180, z: 0 },
  { x: 0, y: 270, z: 0 },
  { x: 0, y: 270, z: 0 },
  { x: 0, y: 90, z: 0 },
  { x: 0, y: 0, z: 0 },
  { x: 0, y: 180, z: 0 }
];
const HEAD_FACING_DIRECTION_VISUAL_OFFSETS = [
  { x: -0.25, y: 0, z: 0.25 },
  { x: 0.25, y: -0.25, z: 0 },
  { x: 0.25, y: 0, z: 0.25 },
  { x: -0.25, y: 0, z: -0.25 },
  { x: 0.25, y: 0, z: -0.25 },
  { x: -0.25, y: 0, z: 0.25 }
];
function composeRotations(first, second) {
  const a = quaternionFromEuler(first);
  const b = quaternionFromEuler(second);
  const x = a.x * b.w + a.w * b.x + a.y * b.z - a.z * b.y;
  const y = a.y * b.w + a.w * b.y + a.z * b.x - a.x * b.z;
  const z = a.z * b.w + a.w * b.z + a.x * b.y - a.y * b.x;
  const w = a.w * b.w - a.x * b.x - a.y * b.y - a.z * b.z;
  const test = x * y + z * w;
  let heading;
  let attitude;
  let bank;
  if (test > 0.499) {
    heading = 2 * Math.atan2(x, w);
    attitude = Math.PI / 2;
    bank = 0;
  } else if (test < -0.499) {
    heading = -2 * Math.atan2(x, w);
    attitude = -Math.PI / 2;
    bank = 0;
  } else {
    heading = Math.atan2(2 * y * w - 2 * x * z, 1 - 2 * y * y - 2 * z * z);
    attitude = Math.asin(2 * test);
    bank = Math.atan2(2 * x * w - 2 * y * z, 1 - 2 * x * x - 2 * z * z);
  }
  const radiansToDegrees = 180 / Math.PI;
  return {
    x: normalizeDegrees(bank * radiansToDegrees),
    y: normalizeDegrees(heading * radiansToDegrees),
    z: normalizeDegrees(attitude * radiansToDegrees)
  };
}
function quaternionFromEuler(value) {
  const c1 = Math.cos(value.x * Math.PI / 360), c2 = Math.cos(value.y * Math.PI / 360), c3 = Math.cos(value.z * Math.PI / 360);
  const s1 = Math.sin(value.x * Math.PI / 360), s2 = Math.sin(value.y * Math.PI / 360), s3 = Math.sin(value.z * Math.PI / 360);
  return {
    x: s1 * c2 * c3 + c1 * s2 * s3,
    y: c1 * s2 * c3 + s1 * c2 * s3,
    z: c1 * c2 * s3 - s1 * s2 * c3,
    w: c1 * c2 * c3 - s1 * s2 * s3
  };
}
function normalizeDegrees(value) {
  const rounded = Math.round(value * 1e8) / 1e8;
  return rounded === 360 || Math.abs(rounded) < 1e-8 ? 0 : rounded;
}
function typeName(typeId) {
  return typeId.slice(typeId.indexOf(":") + 1);
}
function isSlab(name) {
  return name === "slab" || name.endsWith("_slab") || name.includes("_slab_");
}
function isDoubleSlab(name) {
  return name.startsWith("double_") || name.includes("double_slab") || name.includes("_double_") || name.endsWith("_double_slab");
}
function isTrapdoor(name) {
  return name === "trapdoor" || name.endsWith("_trapdoor");
}
function isHeadOrSkull(name) {
  return name === "skull" || name.endsWith("_skull") || name.endsWith("_head");
}
function isNumericDirectionState(value) {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= 3;
}
function usesFrontFacingDirectionStateMapping(name, states) {
  if (firstState(states, ["honey_level", "minecraft:honey_level", "books_stored", "minecraft:books_stored", "chemistry_table_type", "minecraft:chemistry_table_type"])) {
    return true;
  }
  return /(?:hive|nest|bookshelf|chemistry|creator|constructor|lab_table|reducer)$/.test(name);
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
  captureSubLevelBlocks,
  resolveSubLevelBlockRotation,
  resolveSubLevelBlockVisualOffset,
  resolveSubLevelBlockVisualYOffset,
  usesFrontFacingDirectionStateMapping
};
