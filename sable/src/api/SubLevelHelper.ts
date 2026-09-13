// Sub-level lookups over a simulated dimension: the candidate queries gameplay
// code uses before running a precise per-sub-level test. Migrated from
// TreePhysics src/Physics.ts (PhysicsDimension.getContraptionCandidatesNear,
// getContraptionRaycastCandidates and getContraptionById) as free functions, so
// callers that only need a lookup do not depend on the dimension class shape.
import type { Vector3 } from "@minecraft/server";
import type { ServerSubLevel } from "../sublevel/ServerSubLevel.js";
import type { SubLevelPhysicsDimension } from "../sublevel/system/SubLevelPhysicsDimension.js";

/** Sub-levels whose coarse bounds fall within radius of a point. */
export function getSubLevelCandidatesNear(
  dimension: SubLevelPhysicsDimension,
  location: Vector3,
  radius: number
): readonly ServerSubLevel[] {
  return dimension.getSubLevelCandidatesNear(location, radius);
}

/** Sub-levels a ray could reach, in ascending id order. */
export function getSubLevelRaycastCandidates(
  dimension: SubLevelPhysicsDimension,
  origin: Vector3,
  direction: Vector3,
  maximumDistance: number
): readonly ServerSubLevel[] {
  return dimension.getSubLevelRaycastCandidates(origin, direction, maximumDistance);
}

/** The live sub-level with this body id, if it is still valid. */
export function getSubLevelById(
  dimension: SubLevelPhysicsDimension,
  id: number
): ServerSubLevel | undefined {
  return dimension.getSubLevelById(id);
}
