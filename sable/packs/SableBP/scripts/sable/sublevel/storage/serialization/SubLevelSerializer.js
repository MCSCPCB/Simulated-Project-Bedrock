import {
  cloneContainerStorageBinding,
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
    containerStorages: (source.containerStorages ?? []).map(cloneContainerStorageBinding),
    dimensionId: source.dimensionId,
    id,
    origin: { ...source.origin }
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
    containerStorages: value.containerStorages.map(cloneContainerStorageBinding),
    dimensionId: value.dimensionId,
    id: value.id,
    origin: { ...value.origin }
  };
  if (value.foliageTint) structure.foliageTint = { ...value.foliageTint };
  return structure;
}
export {
  deserializeSubLevelStructure,
  serializeSubLevelStructure
};
