// Persistence contract for sub-level structures: the serialized schema and its
// shape validators. A structure is the block snapshot plus chest storage
// bindings and the foliage tint field; render layout and interaction state are
// derived at load time and never persisted.
import type { Vector3 } from "@minecraft/server";
import type {
  SubLevelBlock,
  SubLevelBlockCollisionBox,
  SubLevelBlockMapColor,
  SubLevelFoliageTint
} from "../../SubLevel.js";
import type { SubLevelChestStorageBinding } from "../../../content/assembly/SubLevelContainerInteraction.js";

export interface SerializedSubLevelStructure {
  blocks: SubLevelBlock[];
  chestStorages: SubLevelChestStorageBinding[];
  dimensionId: string;
  foliageTint?: SubLevelFoliageTint;
  id: string;
}

export interface SubLevelStorageManifest {
  subLevelIds: string[];
}

export function isSubLevelStorageManifest(value: unknown): value is SubLevelStorageManifest {
  if (!value || typeof value !== "object") return false;
  const manifest = value as Partial<SubLevelStorageManifest>;
  return hasOnlyKeys(manifest, ["subLevelIds"])
    && Array.isArray(manifest.subLevelIds)
    && manifest.subLevelIds.every(id => typeof id === "string" && id.length > 0)
    && new Set(manifest.subLevelIds).size === manifest.subLevelIds.length;
}

export function isSerializedSubLevelStructure(
  value: unknown
): value is SerializedSubLevelStructure {
  if (!value || typeof value !== "object") return false;
  const structure = value as Partial<SerializedSubLevelStructure>;
  return hasOnlyKeys(structure, [
    "blocks",
    "chestStorages",
    "dimensionId",
    "foliageTint",
    "id"
  ])
    && typeof structure.id === "string"
    && structure.id.length > 0
    && typeof structure.dimensionId === "string"
    && structure.dimensionId.length > 0
    && Array.isArray(structure.blocks)
    && structure.blocks.length > 0
    && structure.blocks.every(isSerializedSubLevelBlock)
    && Array.isArray(structure.chestStorages)
    && structure.chestStorages.every(isChestStorageBinding)
    && (structure.foliageTint === undefined || isSubLevelFoliageTint(structure.foliageTint));
}

export function isChestStorageBinding(value: unknown): value is SubLevelChestStorageBinding {
  if (!value || typeof value !== "object") return false;
  const binding = value as Partial<SubLevelChestStorageBinding>;
  return hasOnlyKeys(binding, ["localLocation", "storageId"])
    && isIntegerLocation(binding.localLocation)
    && typeof binding.storageId === "string"
    && binding.storageId.length > 0;
}

export function isSubLevelFoliageTint(value: unknown): value is SubLevelFoliageTint {
  if (!value || typeof value !== "object") return false;
  const tint = value as Partial<SubLevelFoliageTint>;
  return hasOnlyKeys(tint, [
    "gradientAxis",
    "mapKind",
    "uAtLocalOrigin",
    "uPerLocalX",
    "vAtLocalOrigin",
    "vPerLocalZ"
  ])
    && (tint.gradientAxis === "x" || tint.gradientAxis === "z")
    && Number.isInteger(tint.mapKind)
    && isFiniteNumber(tint.uAtLocalOrigin)
    && isFiniteNumber(tint.uPerLocalX)
    && isFiniteNumber(tint.vAtLocalOrigin)
    && isFiniteNumber(tint.vPerLocalZ);
}

export function cloneChestStorageBinding(
  binding: SubLevelChestStorageBinding
): SubLevelChestStorageBinding {
  return {
    localLocation: { ...binding.localLocation },
    storageId: binding.storageId
  };
}

export function cloneSubLevelBlock(block: SubLevelBlock): SubLevelBlock {
  const cloned: {
    -readonly [Key in keyof SubLevelBlock]: SubLevelBlock[Key];
  } = {
    ...block,
    collisionShape: Array.isArray(block.collisionShape)
      ? block.collisionShape.map(box => ({ min: { ...box.min }, max: { ...box.max } }))
      : block.collisionShape,
    localLocation: { ...block.localLocation }
  };
  if (block.mapColor) cloned.mapColor = { ...block.mapColor };
  if (block.rotation) cloned.rotation = { ...block.rotation };
  if (block.states) cloned.states = { ...block.states };
  return cloned;
}

function isSerializedSubLevelBlock(value: unknown): value is SubLevelBlock {
  if (!value || typeof value !== "object") return false;
  const block = value as Partial<SubLevelBlock>;
  return hasOnlyKeys(block, [
    "collidable",
    "collisionResponse",
    "collisionShape",
    "itemTypeId",
    "localLocation",
    "mapColor",
    "rotation",
    "runtimeCollidable",
    "states",
    "typeId"
  ])
    && typeof block.typeId === "string"
    && block.typeId.length > 0
    && isIntegerLocation(block.localLocation)
    && (block.itemTypeId === undefined || typeof block.itemTypeId === "string")
    && (block.collidable === undefined || typeof block.collidable === "boolean")
    && (block.collisionResponse === undefined || typeof block.collisionResponse === "boolean")
    && (block.runtimeCollidable === undefined || typeof block.runtimeCollidable === "boolean")
    && isCollisionShape(block.collisionShape)
    && (block.rotation === undefined || isVector(block.rotation))
    && (block.states === undefined || isBlockStates(block.states))
    && (block.mapColor === undefined || isBlockMapColor(block.mapColor));
}

function isCollisionShape(value: unknown): value is SubLevelBlock["collisionShape"] {
  if (value === undefined || value === "full" || value === "none") return true;
  return Array.isArray(value) && value.every(isCollisionBox);
}

function isCollisionBox(value: unknown): value is SubLevelBlockCollisionBox {
  if (!value || typeof value !== "object") return false;
  const box = value as Partial<SubLevelBlockCollisionBox>;
  return hasOnlyKeys(box, ["min", "max"]) && isVector(box.min) && isVector(box.max);
}

function isBlockStates(value: unknown): boolean {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  return Object.values(value).every(entry => (
    typeof entry === "boolean" || typeof entry === "number" || typeof entry === "string"
  ));
}

function isBlockMapColor(value: unknown): value is SubLevelBlockMapColor {
  if (!value || typeof value !== "object") return false;
  const color = value as Partial<SubLevelBlockMapColor>;
  return hasOnlyKeys(color, ["blue", "green", "red"])
    && isNormalizedColorChannel(color.red)
    && isNormalizedColorChannel(color.green)
    && isNormalizedColorChannel(color.blue);
}

function isNormalizedColorChannel(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 1;
}

export function isVector(value: unknown): value is Vector3 {
  if (!value || typeof value !== "object") return false;
  const vector = value as Partial<Vector3>;
  return isFiniteNumber(vector.x) && isFiniteNumber(vector.y) && isFiniteNumber(vector.z);
}

function isIntegerLocation(value: unknown): value is Vector3 {
  return isVector(value)
    && Number.isInteger(value.x)
    && Number.isInteger(value.y)
    && Number.isInteger(value.z);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function hasOnlyKeys(value: object, allowedKeys: readonly string[]): boolean {
  const allowed = new Set(allowedKeys);
  return Object.keys(value).every(key => allowed.has(key));
}
