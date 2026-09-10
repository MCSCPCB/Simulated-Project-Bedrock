function createFancySubLevelModelState(model) {
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
  return model.type === "chest" ? 2 : model.type === "wall" || model.type === "moss_carpet" && model.pale ? 9 : 1;
}
function encodeFancySubLevelModelState(model, states) {
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
  fancySubLevelStoredStateBits
};
