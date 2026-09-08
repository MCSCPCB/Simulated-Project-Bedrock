export function isSubLevelStorageManifest(value) {
    if (!value || typeof value !== "object")
        return false;
    const manifest = value;
    return hasOnlyKeys(manifest, ["subLevelIds"])
        && Array.isArray(manifest.subLevelIds)
        && manifest.subLevelIds.every(id => typeof id === "string" && id.length > 0)
        && new Set(manifest.subLevelIds).size === manifest.subLevelIds.length;
}
export function isSerializedSubLevelStructure(value) {
    if (!value || typeof value !== "object")
        return false;
    const structure = value;
    return hasOnlyKeys(structure, [
        "blocks",
        "containerStorages",
        "dimensionId",
        "foliageTint",
        "id",
        "origin"
    ])
        && typeof structure.id === "string"
        && structure.id.length > 0
        && typeof structure.dimensionId === "string"
        && structure.dimensionId.length > 0
        && isIntegerLocation(structure.origin)
        && Array.isArray(structure.blocks)
        && structure.blocks.length > 0
        && structure.blocks.every(isSerializedSubLevelBlock)
        && Array.isArray(structure.containerStorages)
        && structure.containerStorages.every(isContainerStorageBinding)
        && (structure.foliageTint === undefined || isSubLevelFoliageTint(structure.foliageTint));
}
export function isContainerStorageBinding(value) {
    if (!value || typeof value !== "object")
        return false;
    const binding = value;
    return hasOnlyKeys(binding, ["localLocation", "storageId"])
        && isIntegerLocation(binding.localLocation)
        && typeof binding.storageId === "string"
        && binding.storageId.length > 0;
}
export function isSubLevelFoliageTint(value) {
    if (!value || typeof value !== "object")
        return false;
    const tint = value;
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
export function cloneContainerStorageBinding(binding) {
    return {
        localLocation: { ...binding.localLocation },
        storageId: binding.storageId
    };
}
export function cloneSubLevelBlock(block) {
    const cloned = {
        ...block,
        collisionShape: Array.isArray(block.collisionShape)
            ? block.collisionShape.map(box => ({ min: { ...box.min }, max: { ...box.max } }))
            : block.collisionShape,
        localLocation: { ...block.localLocation }
    };
    if (block.mapColor)
        cloned.mapColor = { ...block.mapColor };
    if (block.rotation)
        cloned.rotation = { ...block.rotation };
    if (block.states)
        cloned.states = { ...block.states };
    if (block.visualOffset)
        cloned.visualOffset = { ...block.visualOffset };
    return cloned;
}
function isSerializedSubLevelBlock(value) {
    if (!value || typeof value !== "object")
        return false;
    const block = value;
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
        "typeId",
        "visualYOffset",
        "visualOffset"
    ])
        && typeof block.typeId === "string"
        && block.typeId.length > 0
        && isIntegerLocation(block.localLocation)
        && (block.itemTypeId === undefined || typeof block.itemTypeId === "string")
        && (block.collidable === undefined || typeof block.collidable === "boolean")
        && (block.collisionResponse === undefined || typeof block.collisionResponse === "boolean")
        && (block.runtimeCollidable === undefined || typeof block.runtimeCollidable === "boolean")
        && (block.visualYOffset === undefined || isFiniteNumber(block.visualYOffset))
        && (block.visualOffset === undefined || isVector(block.visualOffset))
        && isCollisionShape(block.collisionShape)
        && (block.rotation === undefined || isVector(block.rotation))
        && (block.states === undefined || isBlockStates(block.states))
        && (block.mapColor === undefined || isBlockMapColor(block.mapColor));
}
function isCollisionShape(value) {
    if (value === undefined || value === "full" || value === "none")
        return true;
    return Array.isArray(value) && value.every(isCollisionBox);
}
function isCollisionBox(value) {
    if (!value || typeof value !== "object")
        return false;
    const box = value;
    return hasOnlyKeys(box, ["min", "max"]) && isVector(box.min) && isVector(box.max);
}
function isBlockStates(value) {
    if (!value || typeof value !== "object" || Array.isArray(value))
        return false;
    return Object.values(value).every(entry => (typeof entry === "boolean" || typeof entry === "number" || typeof entry === "string"));
}
function isBlockMapColor(value) {
    if (!value || typeof value !== "object")
        return false;
    const color = value;
    return hasOnlyKeys(color, ["blue", "green", "red"])
        && isNormalizedColorChannel(color.red)
        && isNormalizedColorChannel(color.green)
        && isNormalizedColorChannel(color.blue);
}
function isNormalizedColorChannel(value) {
    return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 1;
}
export function isVector(value) {
    if (!value || typeof value !== "object")
        return false;
    const vector = value;
    return isFiniteNumber(vector.x) && isFiniteNumber(vector.y) && isFiniteNumber(vector.z);
}
function isIntegerLocation(value) {
    return isVector(value)
        && Number.isInteger(value.x)
        && Number.isInteger(value.y)
        && Number.isInteger(value.z);
}
function isFiniteNumber(value) {
    return typeof value === "number" && Number.isFinite(value);
}
function hasOnlyKeys(value, allowedKeys) {
    const allowed = new Set(allowedKeys);
    return Object.keys(value).every(key => allowed.has(key));
}
