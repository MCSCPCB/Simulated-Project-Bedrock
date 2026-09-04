import type { Block, Vector3 } from "@minecraft/server";
import type { SubLevelBlock, SubLevelBlockMapColor } from "../sublevel/SubLevel.js";
import { getSubLevelBlockRegistration } from "../sublevel/render/fancy/model/FancySubLevelModelRegistry.js";

// The legacy multi-variant blocks have no obtainable item form; the hand-held
// route displays their modern counterpart instead.
const LEGACY_LOG_ITEMS: Readonly<Record<string, string>> = {
  acacia: "minecraft:acacia_log",
  birch: "minecraft:birch_log",
  dark_oak: "minecraft:dark_oak_log",
  jungle: "minecraft:jungle_log",
  oak: "minecraft:oak_log",
  spruce: "minecraft:spruce_log"
};

const LEGACY_LEAF_ITEMS: Readonly<Record<string, string>> = {
  acacia: "minecraft:acacia_leaves",
  birch: "minecraft:birch_leaves",
  dark_oak: "minecraft:dark_oak_leaves",
  jungle: "minecraft:jungle_leaves",
  oak: "minecraft:oak_leaves",
  spruce: "minecraft:spruce_leaves"
};

/**
 * Captures one world block into the sub-level block form the render routes
 * consume: full permutation states, the hand-held item mapping, the
 * state-driven hand-held rotation, the custom-block map color and the
 * registry-declared interaction passability. `origin` is the world position of
 * the sub-level's local origin. Physics fields are the caller's concern and
 * stay unset.
 */
export function captureSubLevelBlock(block: Block, origin: Vector3): SubLevelBlock {
  const permutation = block.permutation;
  const typeId = permutation.type.id;
  const states = permutation.getAllStates();
  const captured: {
    -readonly [Key in keyof SubLevelBlock]: SubLevelBlock[Key];
  } = {
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
  const rotation = heldBlockRotation(states);
  if (rotation) captured.rotation = rotation;
  if (!typeId.startsWith("minecraft:")) {
    const mapColor = captureMapColor(block, typeId);
    if (mapColor) captured.mapColor = mapColor;
  }
  return captured;
}

/** Captures a block collection, skipping air and liquid placeholders. */
export function captureSubLevelBlocks(blocks: readonly Block[], origin: Vector3): SubLevelBlock[] {
  const result: SubLevelBlock[] = [];
  for (const block of blocks) {
    if (block.isAir || block.isLiquid) continue;
    result.push(captureSubLevelBlock(block, origin));
  }
  return result;
}

function heldItemTypeId(
  typeId: string,
  states: Readonly<Record<string, boolean | number | string>>
): string {
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

function heldBlockRotation(
  states: Readonly<Record<string, boolean | number | string>>
): Vector3 | undefined {
  const axis = states.pillar_axis ?? states["minecraft:pillar_axis"];
  if (axis === "x") return { x: 0, y: 0, z: 90 };
  if (axis === "z") return { x: 90, y: 0, z: 0 };
  const blockFace = states["minecraft:block_face"] ?? states.block_face;
  if (blockFace === "east" || blockFace === "west") return { x: 0, y: 0, z: 90 };
  if (blockFace === "north" || blockFace === "south") return { x: 90, y: 0, z: 0 };
  return undefined;
}

function captureMapColor(block: Block, typeId: string): SubLevelBlockMapColor | undefined {
  const component = block.getComponent("minecraft:map_color");
  if (!component) return undefined;
  const { blue, green, red } = component.tintedColor;
  for (const [channel, value] of [["red", red], ["green", green], ["blue", blue]] as const) {
    if (!Number.isFinite(value) || value < 0 || value > 1) {
      throw new RangeError(`Invalid ${channel} map-color channel for ${typeId}: ${value}.`);
    }
  }
  return { blue, green, red };
}
