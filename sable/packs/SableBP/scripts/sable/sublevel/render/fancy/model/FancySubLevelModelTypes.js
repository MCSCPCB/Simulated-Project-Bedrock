function fancySubLevelSparseLayout(stateBits) {
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
function createFancySubLevelModelState(model) {
  if (model.type === "vine" && model.faces.includes("up")) return { bits: 1, dimensions: [], update: () => void 0 };
  if (model.type === "multi_face") return { bits: 6, dimensions: [], update: () => void 0 };
  if (model.type === "wall" || model.type === "moss_carpet" && model.pale) {
    return {
      bits: 9,
      dimensions: [],
      update: () => void 0
    };
  }
  if (model.type !== "chest") return void 0;
  return {
    bits: 1,
    dimensions: [{ maximum: 1, minimum: 0, name: "open", value: 0 }],
    update: (state, dimension, value) => dimension === "open" && Number.isInteger(value) && value >= 0 && value <= 1 ? value : void 0
  };
}
function fancySubLevelStoredStateBits(model) {
  if (model.type === "vine" && model.faces.includes("up")) return 2;
  return model.type === "chest" ? 2 : model.type === "multi_face" ? 7 : model.type === "wall" || model.type === "moss_carpet" && model.pale ? 10 : 1;
}
function encodeFancySubLevelModelState(model, states) {
  if (model.type === "multi_face") return Number(states?.multi_face_direction_bits ?? states?.["minecraft:multi_face_direction_bits"] ?? 0);
  if (model.type === "chest") {
    const open = states?.open ?? states?.["minecraft:open"];
    return open === true || open === 1 ? 1 : 0;
  }
  if (model.type === "moss_carpet") {
    if (!model.pale) return 0;
    const value2 = (name) => states?.[name] ?? states?.[`minecraft:${name}`];
    const connection2 = (name) => {
      const state = value2(`pale_moss_carpet_side_${name}`);
      return state === "short" ? 1 : state === "tall" ? 2 : 0;
    };
    return connection2("north") + connection2("east") * 4 + connection2("south") * 16 + connection2("west") * 64 + (value2("upper_block_bit") === true || value2("upper_block_bit") === 1 ? 256 : 0);
  }
  if (model.type !== "wall") return 0;
  const value = (name) => states?.[name] ?? states?.[`minecraft:${name}`];
  const connection = (name) => {
    const state = value(`wall_connection_type_${name}`);
    return state === "short" ? 1 : state === "tall" ? 2 : 0;
  };
  return connection("north") + connection("east") * 4 + connection("south") * 16 + connection("west") * 64 + (value("wall_post_bit") === true || value("wall_post_bit") === 1 ? 256 : 0);
}
export {
  createFancySubLevelModelState,
  encodeFancySubLevelModelState,
  fancySubLevelSparseLayout,
  fancySubLevelStoredStateBits
};
