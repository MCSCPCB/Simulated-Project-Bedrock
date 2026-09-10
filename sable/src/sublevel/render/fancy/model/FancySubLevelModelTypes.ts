import type {
  FancySubLevelModelDescription,
  FancySubLevelModelState
} from "./FancySubLevelModel.js";

/** Reserve enough low bits for state + occupancy; the remaining 24 bits hold coordinates. */
export function fancySubLevelSparseLayout(stateBits: number): {
  readonly stateBits: number;
  readonly stateSpan: number;
  readonly width: number;
  readonly height: number;
  readonly depth: number;
} {
  const storedBits = Math.max(6, stateBits + 1);
  const coordinateBits = 24 - storedBits;
  const yBits = Math.floor(coordinateBits / 3);
  const xBits = Math.ceil((coordinateBits - yBits) / 2);
  return {
    stateBits: storedBits,
    stateSpan: 2 ** storedBits,
    width: 2 ** xBits,
    height: 2 ** yBits,
    depth: 2 ** (coordinateBits - xBits - yBits)
  };
}

export function createFancySubLevelModelState(
  model: FancySubLevelModelDescription
): FancySubLevelModelState | undefined {
  if (model.type === "multi_face") return { bits: 6, dimensions: [], update: () => undefined };
  if (model.type === "wall" || (model.type === "moss_carpet" && model.pale)) {
    return {
      bits: 9,
      dimensions: [],
      update: () => undefined
    };
  }
  if (model.type !== "chest") return undefined;
  return {
    bits: 1,
    dimensions: [{ maximum: 1, minimum: 0, name: "open", value: 0 }],
    update: (state, dimension, value) => (
      dimension === "open" && Number.isInteger(value) && value >= 0 && value <= 1
        ? value
        : undefined
    )
  };
}

export function fancySubLevelStoredStateBits(
  model: FancySubLevelModelDescription
): number {
  return model.type === "chest" ? 2 : model.type === "multi_face" ? 7 : model.type === "wall" || (model.type === "moss_carpet" && model.pale) ? 10 : 1;
}

export function encodeFancySubLevelModelState(
  model: FancySubLevelModelDescription,
  states: Readonly<Record<string, boolean | number | string>> | undefined
): number {
  if (model.type === "multi_face") return Number(states?.multi_face_direction_bits ?? states?.["minecraft:multi_face_direction_bits"] ?? 0);
  if (model.type === "chest") {
    const open = states?.open ?? states?.["minecraft:open"];
    return open === true || open === 1 ? 1 : 0;
  }
  if (model.type === "moss_carpet") {
    if (!model.pale) return 0;
    const value = (name: string): string | boolean | number | undefined => (
      states?.[name] ?? states?.[`minecraft:${name}`]
    );
    const connection = (name: string): number => {
      const state = value(`pale_moss_carpet_side_${name}`);
      return state === "short" ? 1 : state === "tall" ? 2 : 0;
    };
    return connection("north")
      + connection("east") * 4
      + connection("south") * 16
      + connection("west") * 64
      + (value("upper_block_bit") === true || value("upper_block_bit") === 1 ? 256 : 0);
  }
  if (model.type !== "wall") return 0;
  const value = (name: string): string | boolean | number | undefined => (
    states?.[name] ?? states?.[`minecraft:${name}`]
  );
  const connection = (name: string): number => {
    const state = value(`wall_connection_type_${name}`);
    return state === "short" ? 1 : state === "tall" ? 2 : 0;
  };
  return connection("north")
    + connection("east") * 4
    + connection("south") * 16
    + connection("west") * 64
    + (value("wall_post_bit") === true || value("wall_post_bit") === 1 ? 256 : 0);
}
