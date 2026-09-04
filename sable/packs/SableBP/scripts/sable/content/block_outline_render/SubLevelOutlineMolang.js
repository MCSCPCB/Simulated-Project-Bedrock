import { EPSILON_1E8 } from "../../util/SableVector3Utils.js";
import {
  SUBLEVEL_OUTLINE_EDGE_CAPACITY
} from "./SubLevelOutlineGeometry.js";
const BREAK_OVERLAY_CENTER_HEIGHT = 0.375;
const RAY_REFRESH_TICKS = 2;
const BLOCK_CONFIRMATION_TICKS = 50;
const VIEW_DIRECTION_EPSILON_SQUARED = 1e-10;
const BREAK_OVERLAY_TRANSFORM_EPSILON_SQUARED = EPSILON_1E8;
function hasViewDirectionChanged(previous, current) {
  const dx = previous.x - current.x;
  const dy = previous.y - current.y;
  const dz = previous.z - current.z;
  return dx * dx + dy * dy + dz * dz > VIEW_DIRECTION_EPSILON_SQUARED;
}
function vectorComponentsEqual(left, right) {
  return left.x === right.x && left.y === right.y && left.z === right.z;
}
function shouldEnterBlockPreview(mode, stableTicks, viewChanged) {
  return mode === "structure" && (viewChanged || stableTicks >= BLOCK_CONFIRMATION_TICKS);
}
function shouldRefreshOutlineRay(mode, ticksSinceRefresh, viewChanged, subLevelMoving) {
  return viewChanged || (mode === "block" ? subLevelMoving : ticksSinceRefresh >= RAY_REFRESH_TICKS);
}
function createBlockPreviewTransform(target, placement, visualAnchor) {
  let side = 0;
  if (placement) {
    const dx = placement.x - target.x;
    const dy = placement.y - target.y;
    const dz = placement.z - target.z;
    if (Math.abs(dx) + Math.abs(dy) + Math.abs(dz) !== 1) throw new RangeError("Block preview placement must be adjacent to its target cell.");
    side = dx !== 0 ? dx : dy !== 0 ? dy * 2 : dz * 3;
  }
  return { side, x: target.x - visualAnchor.x, y: target.y - visualAnchor.y, z: target.z - visualAnchor.z };
}
function isPlayerHeadInsideSubLevelPlacement(headLocation, placement, worldPointToLocal) {
  if (!isFiniteVector(headLocation)) throw new TypeError("Player head location must contain finite coordinates.");
  if (!isFiniteVector(placement)) throw new TypeError("Sub-level placement must contain finite coordinates.");
  const local = worldPointToLocal(headLocation);
  if (!isFiniteVector(local)) throw new TypeError("Sub-level placement transform returned a non-finite point.");
  return Math.abs(local.x - placement.x) < 0.5 && Math.abs(local.y - placement.y) < 0.5 && Math.abs(local.z - placement.z) < 0.5;
}
function breakOverlayLocation(cellCenter) {
  return { x: cellCenter.x, y: cellCenter.y - BREAK_OVERLAY_CENTER_HEIGHT, z: cellCenter.z };
}
function createEdgeWriteExpression(edges, visualAnchor) {
  if (edges.length > SUBLEVEL_OUTLINE_EDGE_CAPACITY) throw new RangeError(`Outline has ${edges.length} edges; capacity is ${SUBLEVEL_OUTLINE_EDGE_CAPACITY}.`);
  const values = [];
  for (let index = 0; index < SUBLEVEL_OUTLINE_EDGE_CAPACITY; index++) {
    const edge = edges[index];
    const prefix = `v.e${index}`;
    if (!edge) {
      values.push(`${prefix}_l=0`);
      continue;
    }
    values.push(`${prefix}_x=${molangNumber(edge.start.x - visualAnchor.x)}`, `${prefix}_y=${molangNumber(edge.start.y - visualAnchor.y)}`, `${prefix}_z=${molangNumber(edge.start.z - visualAnchor.z)}`, `${prefix}_l=${molangNumber(edge.length)}`, `${prefix}_a=${edge.axis === "x" ? 0 : edge.axis === "y" ? 1 : 2}`);
  }
  return `${values.join(";")};return 1;`;
}
function edgeSignature(edges) {
  return edges.map((edge) => `${edge.axis}:${edge.start.x},${edge.start.y},${edge.start.z}:${edge.length}`).join("|");
}
function molangNumber(value) {
  if (!Number.isFinite(value)) throw new TypeError(`Outline transform contains ${value}.`);
  return Object.is(value, -0) ? "0" : String(value);
}
function resolvePlacementCardinalDirection(worldPointToLocal, worldOrigin, worldViewDirection) {
  const localOrigin = worldPointToLocal(worldOrigin);
  const localViewPoint = worldPointToLocal({ x: worldOrigin.x + worldViewDirection.x, y: worldOrigin.y + worldViewDirection.y, z: worldOrigin.z + worldViewDirection.z });
  const dx = localViewPoint.x - localOrigin.x;
  const dz = localViewPoint.z - localOrigin.z;
  if (Math.abs(dx) >= Math.abs(dz)) return dx >= 0 ? "east" : "west";
  return dz >= 0 ? "south" : "north";
}
function isFiniteVector(value) {
  return Number.isFinite(value.x) && Number.isFinite(value.y) && Number.isFinite(value.z);
}
export {
  BREAK_OVERLAY_TRANSFORM_EPSILON_SQUARED,
  RAY_REFRESH_TICKS,
  breakOverlayLocation,
  createBlockPreviewTransform,
  createEdgeWriteExpression,
  edgeSignature,
  hasViewDirectionChanged,
  isPlayerHeadInsideSubLevelPlacement,
  resolvePlacementCardinalDirection,
  shouldEnterBlockPreview,
  shouldRefreshOutlineRay,
  vectorComponentsEqual
};
