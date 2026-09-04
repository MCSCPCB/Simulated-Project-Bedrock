// Builds and validates serialized sub-level structures. Serialization deep
// clones every entry so later runtime mutation cannot alias persisted data.
import type { SubLevelBlock, SubLevelFoliageTint } from "../../SubLevel.js";
import type { SubLevelChestStorageBinding } from "../../../content/assembly/SubLevelContainerInteraction.js";
import {
  cloneChestStorageBinding,
  cloneSubLevelBlock,
  isSerializedSubLevelStructure,
  type SerializedSubLevelStructure
} from "./SubLevelData.js";

export interface SubLevelStructureSource {
  readonly blocks: readonly SubLevelBlock[];
  readonly chestStorages?: readonly SubLevelChestStorageBinding[];
  readonly dimensionId: string;
  readonly foliageTint?: SubLevelFoliageTint;
}

export function serializeSubLevelStructure(
  id: string,
  source: SubLevelStructureSource
): SerializedSubLevelStructure {
  if (id.length === 0) throw new Error("A sub-level id must not be empty.");
  if (source.blocks.length === 0) {
    throw new Error(`Sub-level ${id} has no blocks to serialize.`);
  }
  const structure: SerializedSubLevelStructure = {
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

export function deserializeSubLevelStructure(value: unknown): SerializedSubLevelStructure {
  if (!isSerializedSubLevelStructure(value)) {
    throw new Error("The stored sub-level structure record is invalid.");
  }
  const structure: SerializedSubLevelStructure = {
    blocks: value.blocks.map(cloneSubLevelBlock),
    chestStorages: value.chestStorages.map(cloneChestStorageBinding),
    dimensionId: value.dimensionId,
    id: value.id
  };
  if (value.foliageTint) structure.foliageTint = { ...value.foliageTint };
  return structure;
}
