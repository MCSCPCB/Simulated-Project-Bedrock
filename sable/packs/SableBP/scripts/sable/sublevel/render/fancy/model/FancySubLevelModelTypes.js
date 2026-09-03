function createFancySubLevelModelState(model) {
  if (model.type !== "chest") return void 0;
  return {
    bits: 1,
    dimensions: [{ maximum: 1, minimum: 0, name: "open", value: 0 }],
    update: (state, dimension, value) => dimension === "open" && Number.isInteger(value) && value >= 0 && value <= 1 ? value : void 0
  };
}
function fancySubLevelStoredStateBits(model) {
  return model.type === "chest" ? 2 : 1;
}
export {
  createFancySubLevelModelState,
  fancySubLevelStoredStateBits
};
