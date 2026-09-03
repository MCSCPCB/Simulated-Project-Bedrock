import type {
  FancySubLevelModelDescription,
  FancySubLevelModelState
} from "./FancySubLevelModel.js";

export function createFancySubLevelModelState(
  model: FancySubLevelModelDescription
): FancySubLevelModelState | undefined {
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
  return model.type === "chest" ? 2 : 1;
}
