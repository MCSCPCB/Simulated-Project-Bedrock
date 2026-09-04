import { blockLocationKey, squaredDistance } from "../../util/SableVector3Utils.js";
import {
  getSubLevelBlockRegistration,
  hasFancySubLevelRegistration
} from "../../sublevel/render/fancy/model/FancySubLevelModelRegistry.js";
const SUBLEVEL_OUTLINE_EDGE_CAPACITY = 28;
const MIN_OUTLINE_EDGE_CAPACITY = 12;
const STRUCTURAL_CATEGORY = "building/logs_and_wood";
const LEAF_CATEGORY = "nature/leaves";
function assertOutlineCapacity(capacity) {
  if (!Number.isInteger(capacity) || capacity < MIN_OUTLINE_EDGE_CAPACITY) {
    throw new RangeError(`Sub-level outline capacity must be an integer of at least ${MIN_OUTLINE_EDGE_CAPACITY}, got ${capacity}.`);
  }
}
const NEIGHBORS = [
  { x: -1, y: 0, z: 0 },
  { x: 1, y: 0, z: 0 },
  { x: 0, y: -1, z: 0 },
  { x: 0, y: 1, z: 0 },
  { x: 0, y: 0, z: -1 },
  { x: 0, y: 0, z: 1 }
];
function createSubLevelOutlineShape(blocks, target, capacity = SUBLEVEL_OUTLINE_EDGE_CAPACITY) {
  return createSubLevelOutlineShapeFromTopology(
    createSubLevelOutlineTopology(blocks, capacity),
    target,
    capacity
  );
}
function createSubLevelOutlineTopology(blocks, capacity = SUBLEVEL_OUTLINE_EDGE_CAPACITY) {
  assertOutlineCapacity(capacity);
  const structural = blocks.filter(isWholeOutlineBlock);
  if (structural.length === 0) return { structuralBlocks: structural };
  const complete = createMergedVoxelOutline(structural.map((block) => block.localLocation));
  return {
    completeEdges: complete.length <= capacity ? complete : void 0,
    structuralBlocks: structural
  };
}
function createSubLevelOutlineShapeFromTopology(topology, target, capacity = SUBLEVEL_OUTLINE_EDGE_CAPACITY) {
  assertOutlineCapacity(capacity);
  if (topology.structuralBlocks.length === 0) return void 0;
  if (topology.completeEdges) return { edges: topology.completeEdges, kind: "complete" };
  const localBlocks = selectLocalTopology(topology.structuralBlocks, target, capacity);
  if (localBlocks.length === 0) return void 0;
  if (isSolidCuboid(localBlocks)) {
    return { edges: createAabbOutline(localBlocks), kind: "local-aabb" };
  }
  return {
    edges: createMergedVoxelOutline(localBlocks),
    kind: "local-exact"
  };
}
function createMergedVoxelOutline(locations) {
  const occupied = new Set(locations.map(blockLocationKey));
  const unitEdges = /* @__PURE__ */ new Map();
  const has = (x, y, z) => occupied.has(`${x},${y},${z}`);
  const add = (axis, start) => {
    unitEdges.set(edgeKey(axis, start), { axis, start });
  };
  for (const location of locations) {
    const { x, y, z } = location;
    const west = has(x - 1, y, z);
    const east = has(x + 1, y, z);
    const down = has(x, y - 1, z);
    const up = has(x, y + 1, z);
    const north = has(x, y, z - 1);
    const south = has(x, y, z + 1);
    if (visibleVoxelEdge(!north, !west, has(x - 1, y, z - 1))) {
      add("y", { x: x - 0.5, y: y - 0.5, z: z - 0.5 });
    }
    if (visibleVoxelEdge(!north, !east, has(x + 1, y, z - 1))) {
      add("y", { x: x + 0.5, y: y - 0.5, z: z - 0.5 });
    }
    if (visibleVoxelEdge(!south, !west, has(x - 1, y, z + 1))) {
      add("y", { x: x - 0.5, y: y - 0.5, z: z + 0.5 });
    }
    if (visibleVoxelEdge(!south, !east, has(x + 1, y, z + 1))) {
      add("y", { x: x + 0.5, y: y - 0.5, z: z + 0.5 });
    }
    if (visibleVoxelEdge(!down, !north, has(x, y - 1, z - 1))) {
      add("x", { x: x - 0.5, y: y - 0.5, z: z - 0.5 });
    }
    if (visibleVoxelEdge(!down, !south, has(x, y - 1, z + 1))) {
      add("x", { x: x - 0.5, y: y - 0.5, z: z + 0.5 });
    }
    if (visibleVoxelEdge(!up, !north, has(x, y + 1, z - 1))) {
      add("x", { x: x - 0.5, y: y + 0.5, z: z - 0.5 });
    }
    if (visibleVoxelEdge(!up, !south, has(x, y + 1, z + 1))) {
      add("x", { x: x - 0.5, y: y + 0.5, z: z + 0.5 });
    }
    if (visibleVoxelEdge(!down, !west, has(x - 1, y - 1, z))) {
      add("z", { x: x - 0.5, y: y - 0.5, z: z - 0.5 });
    }
    if (visibleVoxelEdge(!down, !east, has(x + 1, y - 1, z))) {
      add("z", { x: x + 0.5, y: y - 0.5, z: z - 0.5 });
    }
    if (visibleVoxelEdge(!up, !west, has(x - 1, y + 1, z))) {
      add("z", { x: x - 0.5, y: y + 0.5, z: z - 0.5 });
    }
    if (visibleVoxelEdge(!up, !east, has(x + 1, y + 1, z))) {
      add("z", { x: x + 0.5, y: y + 0.5, z: z - 0.5 });
    }
  }
  return mergeUnitEdges([...unitEdges.values()]);
}
function createAabbOutline(locations) {
  if (locations.length === 0) return [];
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let minZ = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  let maxZ = Number.NEGATIVE_INFINITY;
  for (const location of locations) {
    minX = Math.min(minX, location.x - 0.5);
    minY = Math.min(minY, location.y - 0.5);
    minZ = Math.min(minZ, location.z - 0.5);
    maxX = Math.max(maxX, location.x + 0.5);
    maxY = Math.max(maxY, location.y + 0.5);
    maxZ = Math.max(maxZ, location.z + 0.5);
  }
  return [
    edge("x", minX, minY, minZ, maxX - minX),
    edge("x", minX, minY, maxZ, maxX - minX),
    edge("x", minX, maxY, minZ, maxX - minX),
    edge("x", minX, maxY, maxZ, maxX - minX),
    edge("y", minX, minY, minZ, maxY - minY),
    edge("y", minX, minY, maxZ, maxY - minY),
    edge("y", maxX, minY, minZ, maxY - minY),
    edge("y", maxX, minY, maxZ, maxY - minY),
    edge("z", minX, minY, minZ, maxZ - minZ),
    edge("z", minX, maxY, minZ, maxZ - minZ),
    edge("z", maxX, minY, minZ, maxZ - minZ),
    edge("z", maxX, maxY, minZ, maxZ - minZ)
  ];
}
function isSolidCuboid(locations) {
  if (locations.length === 0) return false;
  const unique = new Set(locations.map(blockLocationKey));
  if (unique.size !== locations.length) return false;
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let minZ = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  let maxZ = Number.NEGATIVE_INFINITY;
  for (const location of locations) {
    if (location.x < minX) minX = location.x;
    if (location.x > maxX) maxX = location.x;
    if (location.y < minY) minY = location.y;
    if (location.y > maxY) maxY = location.y;
    if (location.z < minZ) minZ = location.z;
    if (location.z > maxZ) maxZ = location.z;
  }
  const volume = (maxX - minX + 1) * (maxY - minY + 1) * (maxZ - minZ + 1);
  return volume === unique.size;
}
function selectLocalTopology(blocks, target, capacity) {
  const byKey = new Map(blocks.map((block) => [blockLocationKey(block.localLocation), block]));
  let start;
  let startDistance = Number.POSITIVE_INFINITY;
  let startKey = "";
  for (const block of blocks) {
    const distance = squaredDistance(block.localLocation, target);
    if (distance > startDistance) continue;
    const key = blockLocationKey(block.localLocation);
    if (distance < startDistance || key.localeCompare(startKey) < 0) {
      start = block;
      startDistance = distance;
      startKey = key;
    }
  }
  if (!start) return [];
  const queue = [start];
  const queued = /* @__PURE__ */ new Set([startKey]);
  const accepted = [];
  let bestLength = 1;
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let minZ = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  let maxZ = Number.NEGATIVE_INFINITY;
  for (let cursor = 0; cursor < queue.length; cursor++) {
    const block = queue[cursor];
    for (const offset of NEIGHBORS) {
      const key = `${block.localLocation.x + offset.x},${block.localLocation.y + offset.y},${block.localLocation.z + offset.z}`;
      const neighbor = byKey.get(key);
      if (!neighbor || queued.has(key)) continue;
      queued.add(key);
      queue.push(neighbor);
    }
    const location = block.localLocation;
    accepted.push(location);
    if (location.x < minX) minX = location.x;
    if (location.x > maxX) maxX = location.x;
    if (location.y < minY) minY = location.y;
    if (location.y > maxY) maxY = location.y;
    if (location.z < minZ) minZ = location.z;
    if (location.z > maxZ) maxZ = location.z;
    const solidCuboid = (maxX - minX + 1) * (maxY - minY + 1) * (maxZ - minZ + 1) === accepted.length;
    if (solidCuboid || createMergedVoxelOutline(accepted).length <= capacity) {
      bestLength = accepted.length;
      continue;
    }
    break;
  }
  return accepted.slice(0, bestLength);
}
function mergeUnitEdges(unitEdges) {
  const groups = /* @__PURE__ */ new Map();
  for (const unit of unitEdges) {
    const fixed = unit.axis === "x" ? `${unit.start.y},${unit.start.z}` : unit.axis === "y" ? `${unit.start.x},${unit.start.z}` : `${unit.start.x},${unit.start.y}`;
    const key = `${unit.axis}:${fixed}`;
    const group = groups.get(key);
    if (group) group.push(unit);
    else groups.set(key, [unit]);
  }
  const merged = [];
  for (const group of groups.values()) {
    group.sort((left, right) => axisValue(left.start, left.axis) - axisValue(right.start, right.axis));
    let start = group[0].start;
    let end = axisValue(start, group[0].axis) + 1;
    const axis = group[0].axis;
    for (let index = 1; index < group.length; index++) {
      const next = group[index];
      const nextStart = axisValue(next.start, axis);
      if (Math.abs(nextStart - end) < 1e-9) {
        end++;
        continue;
      }
      merged.push({ axis, length: end - axisValue(start, axis), start: { ...start } });
      start = next.start;
      end = nextStart + 1;
    }
    merged.push({ axis, length: end - axisValue(start, axis), start: { ...start } });
  }
  return merged.sort(compareEdges);
}
function visibleVoxelEdge(firstFaceExposed, secondFaceExposed, diagonal) {
  return firstFaceExposed && secondFaceExposed || firstFaceExposed && !secondFaceExposed && diagonal || !firstFaceExposed && secondFaceExposed && diagonal;
}
function isWholeOutlineBlock(block) {
  if (!hasFancySubLevelRegistration(block.typeId)) return false;
  const registration = getSubLevelBlockRegistration(block.typeId);
  if (registration?.category === LEAF_CATEGORY) return false;
  return registration?.category === STRUCTURAL_CATEGORY || registration?.support !== void 0;
}
function edge(axis, x, y, z, length) {
  return { axis, length, start: { x, y, z } };
}
function edgeKey(axis, start) {
  return `${axis}:${start.x},${start.y},${start.z}`;
}
function axisValue(value, axis) {
  return value[axis];
}
function compareEdges(left, right) {
  return left.axis.localeCompare(right.axis) || left.start.x - right.start.x || left.start.y - right.start.y || left.start.z - right.start.z || left.length - right.length;
}
export {
  SUBLEVEL_OUTLINE_EDGE_CAPACITY,
  createAabbOutline,
  createMergedVoxelOutline,
  createSubLevelOutlineShape,
  createSubLevelOutlineShapeFromTopology,
  createSubLevelOutlineTopology,
  isSolidCuboid
};
