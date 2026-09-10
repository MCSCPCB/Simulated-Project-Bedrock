import type {
  FancySubLevelModelDescription,
  FancySubLevelModelState
} from "./FancySubLevelModel.js";

export function createFancySubLevelModelState(
  model: FancySubLevelModelDescription
): FancySubLevelModelState | undefined {
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
  return model.type === "chest" ? 2 : model.type === "wall" || (model.type === "moss_carpet" && model.pale) ? 9 : 1;
}

export function encodeFancySubLevelModelState(
  model: FancySubLevelModelDescription,
  states: Readonly<Record<string, boolean | number | string>> | undefined
): number {
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
