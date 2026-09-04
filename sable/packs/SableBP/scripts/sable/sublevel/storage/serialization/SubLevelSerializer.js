import {
  cloneChestStorageBinding,
  cloneSubLevelBlock,
  isSerializedSubLevelStructure
} from "./SubLevelData.js";
function serializeSubLevelStructure(id, source) {
  if (id.length === 0) throw new Error("A sub-level id must not be empty.");
  if (source.blocks.length === 0) {
    throw new Error(`Sub-level ${id} has no blocks to serialize.`);
  }
  const structure = {
    blocks: source.blocks.map(cloneSubLevelBlock),
    chestStorages: (source.chestStorages ?? []).map(cloneChestStorageBinding),
    dimensionId: source.dimensionId,
    id
  };
  if (source.foliageTint) structure.foliageTint = { ...source.foliageTint };
  if (!isSerializedSubLevelStructure(structure)) {
    throw new Error(`Sub-level ${id} produced an invalid serialized structure.`);
  }
  return structure;
}
function deserializeSubLevelStructure(value) {
  if (!isSerializedSubLevelStructure(value)) {
    throw new Error("The stored sub-level structure record is invalid.");
  }
  const structure = {
    blocks: value.blocks.map(cloneSubLevelBlock),
    chestStorages: value.chestStorages.map(cloneChestStorageBinding),
    dimensionId: value.dimensionId,
    id: value.id
  };
  if (value.foliageTint) structure.foliageTint = { ...value.foliageTint };
  return structure;
}
export {
  deserializeSubLevelStructure,
  serializeSubLevelStructure
};
