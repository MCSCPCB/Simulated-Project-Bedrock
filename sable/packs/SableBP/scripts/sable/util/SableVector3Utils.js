const EPSILON_1E8 = 1e-8;
const EPSILON_1E6 = 1e-6;
function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}
function add(left, right) {
  return { x: left.x + right.x, y: left.y + right.y, z: left.z + right.z };
}
function subtract(left, right) {
  return { x: left.x - right.x, y: left.y - right.y, z: left.z - right.z };
}
function dot(left, right) {
  return left.x * right.x + left.y * right.y + left.z * right.z;
}
function scale(value, amount) {
  return { x: value.x * amount, y: value.y * amount, z: value.z * amount };
}
function squaredDistance(left, right) {
  const dx = left.x - right.x;
  const dy = left.y - right.y;
  const dz = left.z - right.z;
  return dx * dx + dy * dy + dz * dz;
}
function distance(left, right) {
  return Math.sqrt(squaredDistance(left, right));
}
function normalizeFinite(value) {
  const magnitude = Math.hypot(value.x, value.y, value.z);
  return !Number.isFinite(magnitude) || magnitude < EPSILON_1E8 ? { x: 0, y: 0, z: 0 } : { x: value.x / magnitude, y: value.y / magnitude, z: value.z / magnitude };
}
function isFiniteVector(value) {
  return Number.isFinite(value.x) && Number.isFinite(value.y) && Number.isFinite(value.z);
}
function isIntegerVector(value) {
  return Number.isInteger(value.x) && Number.isInteger(value.y) && Number.isInteger(value.z);
}
function vectorsEqual(left, right) {
  return left.x === right.x && left.y === right.y && left.z === right.z;
}
function blockLocationKey(location) {
  return `${location.x},${location.y},${location.z}`;
}
function parseBlockLocationKey(key) {
  const [x, y, z] = key.split(",").map(Number);
  return { x, y, z };
}
const VANILLA_DIMENSION_IDS = [
  "minecraft:overworld",
  "minecraft:nether",
  "minecraft:the_end"
];
export {
  EPSILON_1E6,
  EPSILON_1E8,
  VANILLA_DIMENSION_IDS,
  add,
  blockLocationKey,
  clamp,
  distance,
  dot,
  isFiniteVector,
  isIntegerVector,
  normalizeFinite,
  parseBlockLocationKey,
  scale,
  squaredDistance,
  subtract,
  vectorsEqual
};
