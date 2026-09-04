import { EPSILON_1E8, isFiniteVector } from "../../util/SableVector3Utils.js";
const DIRECTION_EPSILON = EPSILON_1E8;
const DISTANCE_EPSILON = 1e-9;
const AXES = ["x", "y", "z"];
function raycastSubLevelGrid(blockAt, origin, direction, maximumDistance, options) {
  if (!isFiniteVector(origin) || !isFiniteVector(direction)) return void 0;
  if (!Number.isFinite(maximumDistance) || maximumDistance < 0) return void 0;
  const directionLength = Math.hypot(direction.x, direction.y, direction.z);
  if (!Number.isFinite(directionLength) || directionLength < DIRECTION_EPSILON) return void 0;
  const ray = {
    x: direction.x / directionLength,
    y: direction.y / directionLength,
    z: direction.z / directionLength
  };
  let x = Math.floor(origin.x + 0.5);
  let y = Math.floor(origin.y + 0.5);
  let z = Math.floor(origin.z + 0.5);
  const skipStartingCell = options?.skipContainingCell === true && isStrictlyInsideUnitCell(origin, x, y, z);
  const stepX = Math.sign(ray.x);
  const stepY = Math.sign(ray.y);
  const stepZ = Math.sign(ray.z);
  let tMaxX = firstBoundaryDistance(origin.x, ray.x, x, stepX);
  let tMaxY = firstBoundaryDistance(origin.y, ray.y, y, stepY);
  let tMaxZ = firstBoundaryDistance(origin.z, ray.z, z, stepZ);
  const tDeltaX = stepX === 0 ? Number.POSITIVE_INFINITY : 1 / Math.abs(ray.x);
  const tDeltaY = stepY === 0 ? Number.POSITIVE_INFINITY : 1 / Math.abs(ray.y);
  const tDeltaZ = stepZ === 0 ? Number.POSITIVE_INFINITY : 1 / Math.abs(ray.z);
  const maximumSteps = Math.ceil(maximumDistance * 3) + 8;
  for (let step = 0; step < maximumSteps; step++) {
    const block = step === 0 && skipStartingCell ? void 0 : blockAt(x, y, z);
    if (block) {
      const hit = rayUnitAabbHit(origin, ray, x, y, z, maximumDistance);
      if (hit) {
        return {
          block,
          distance: hit.distance,
          face: faceFromNormal(hit.normal),
          localLocation: {
            x: origin.x + ray.x * hit.distance,
            y: origin.y + ray.y * hit.distance,
            z: origin.z + ray.z * hit.distance
          },
          localNormal: hit.normal
        };
      }
    }
    const nextDistance = Math.min(tMaxX, tMaxY, tMaxZ);
    if (nextDistance > maximumDistance) break;
    if (tMaxX <= nextDistance + DISTANCE_EPSILON) {
      x += stepX;
      tMaxX += tDeltaX;
    }
    if (tMaxY <= nextDistance + DISTANCE_EPSILON) {
      y += stepY;
      tMaxY += tDeltaY;
    }
    if (tMaxZ <= nextDistance + DISTANCE_EPSILON) {
      z += stepZ;
      tMaxZ += tDeltaZ;
    }
  }
  return void 0;
}
function isStrictlyInsideUnitCell(origin, x, y, z) {
  return origin.x > x - 0.5 && origin.x < x + 0.5 && origin.y > y - 0.5 && origin.y < y + 0.5 && origin.z > z - 0.5 && origin.z < z + 0.5;
}
function firstBoundaryDistance(origin, direction, cell, step) {
  if (step === 0) return Number.POSITIVE_INFINITY;
  const boundary = cell + (step > 0 ? 0.5 : -0.5);
  return Math.max(0, (boundary - origin) / direction);
}
function rayUnitAabbHit(origin, direction, x, y, z, maximumDistance) {
  let near = 0;
  let far = maximumDistance;
  let normal = dominantOppositeNormal(direction);
  const min = { x: x - 0.5, y: y - 0.5, z: z - 0.5 };
  const max = { x: x + 0.5, y: y + 0.5, z: z + 0.5 };
  for (const axis of AXES) {
    const component = direction[axis];
    if (Math.abs(component) < DIRECTION_EPSILON) {
      if (origin[axis] < min[axis] || origin[axis] > max[axis]) return void 0;
      continue;
    }
    let axisNear = (min[axis] - origin[axis]) / component;
    let axisFar = (max[axis] - origin[axis]) / component;
    const axisNormal = component > 0 ? -1 : 1;
    if (axisNear > axisFar) [axisNear, axisFar] = [axisFar, axisNear];
    if (axisNear > near) {
      near = axisNear;
      normal = {
        x: axis === "x" ? axisNormal : 0,
        y: axis === "y" ? axisNormal : 0,
        z: axis === "z" ? axisNormal : 0
      };
    }
    far = Math.min(far, axisFar);
    if (near > far) return void 0;
  }
  return far < 0 || near > maximumDistance ? void 0 : { distance: Math.max(0, near), normal };
}
function dominantOppositeNormal(direction) {
  const x = Math.abs(direction.x);
  const y = Math.abs(direction.y);
  const z = Math.abs(direction.z);
  if (x >= y && x >= z) return { x: direction.x > 0 ? -1 : 1, y: 0, z: 0 };
  if (y >= z) return { x: 0, y: direction.y > 0 ? -1 : 1, z: 0 };
  return { x: 0, y: 0, z: direction.z > 0 ? -1 : 1 };
}
function faceFromNormal(normal) {
  if (normal.x < 0) return "west";
  if (normal.x > 0) return "east";
  if (normal.y < 0) return "down";
  if (normal.y > 0) return "up";
  if (normal.z < 0) return "north";
  return "south";
}
export {
  raycastSubLevelGrid
};
