// Keeps simulated sub-levels inside readable chunks. A sub-level whose current,
// predicted or outward-guard bounds leave loaded chunks is settled back to
// storage; one whose last safe bounds are themselves unreadable defers instead,
// so it comes back where it was. Restore only runs for records a player is near
// and whose chunks read back. Migrated from TreePhysics
// src/content/tree/contraption/Lifecycle.ts (#tickCrossDomain, #deferSettlement,
// the readability gate of #restoreAvailableTrees) and TreePhysics
// src/content/tree/contraption/Bounds.ts (groupPlayersByDimension).
import { world, type Dimension, type Player, type Vector3 } from "@minecraft/server";
import type { PhysicsBodyAabb } from "../../../api/physics/PhysicsTypes.js";
import type { ServerSubLevel } from "../../ServerSubLevel.js";
import type { SavedPose, SerializedSubLevelStructure } from "../../storage/serialization/SubLevelData.js";
import { areBoundsChunksReadable } from "../../../util/LevelAccelerator.js";
import {
  cloneBounds,
  createOutwardGuardBounds,
  createPredictedBounds,
  vectorDistance,
  vectorSignature
} from "../../../util/SableMathUtils.js";

const RESTORE_HORIZONTAL_RADIUS = 96;
const RESTORE_VERTICAL_RADIUS = 96;
const CROSS_DOMAIN_CONFIRM_TICKS = 2;
const PAUSED_CROSS_DOMAIN_CHECK_INTERVAL_TICKS = 16;
const PLAYER_MOVING_AWAY_EPSILON = 0.05;
export const RESTORE_RETRY_TICKS = 20;

/** What the owner should do with a sub-level after its readability check. */
export type ChunkTicketOutcome = "keep" | "settle" | "defer";

interface TicketState {
  boundaryThreatTicks: number;
  lastNearestPlayerDistance: number | undefined;
  lastSafeBounds: PhysicsBodyAabb;
  lastSafePose: SavedPose;
}

export class PhysicsChunkTicketManager {
  readonly #chunkReadabilityCache = new Map<string, boolean>();
  readonly #states = new Map<number, TicketState>();

  /** Drops the per-tick readability cache. Call once per tick before the checks. */
  beginTick(): void {
    this.#chunkReadabilityCache.clear();
  }

  /** The last pose whose chunks were readable, for persistence. */
  getLastSafePose(subLevel: ServerSubLevel): SavedPose {
    return clonePose(this.#getState(subLevel).lastSafePose);
  }

  getBoundaryThreatTicks(subLevelId: number): number {
    return this.#states.get(subLevelId)?.boundaryThreatTicks ?? 0;
  }

  /** Seeds a restored sub-level with the pose and threat count it was saved with. */
  adoptRestoredState(
    subLevel: ServerSubLevel,
    lastSafePose: SavedPose | undefined,
    boundaryThreatTicks = 0
  ): void {
    const state = this.#getState(subLevel);
    if (lastSafePose) {
      state.lastSafePose = clonePose(lastSafePose);
      state.lastSafeBounds = cloneBounds(subLevel.body.getAabb());
    }
    state.boundaryThreatTicks = boundaryThreatTicks;
  }

  removeSubLevel(subLevelId: number): void {
    this.#states.delete(subLevelId);
  }

  /**
   * Whether a sleeping, lifecycle-paused sub-level should be probed this tick.
   * Edited sleeping sub-levels cannot move toward an unloaded boundary, so their
   * readability probes are staggered without changing settlement semantics.
   */
  shouldCheck(subLevel: ServerSubLevel, currentTick: number, lifecyclePaused: boolean): boolean {
    return !lifecyclePaused
      || !subLevel.body.isSleeping
      || (currentTick + subLevel.id) % PAUSED_CROSS_DOMAIN_CHECK_INTERVAL_TICKS === 0;
  }

  /**
   * Runs one readability check. "settle" means store and remove the sub-level
   * at its current pose; "defer" means store it at its last safe pose so a
   * later restore puts it back where its chunks were still loaded.
   */
  tick(
    subLevel: ServerSubLevel,
    players: readonly Player[],
    currentTick: number
  ): ChunkTicketOutcome {
    const state = this.#getState(subLevel);
    const body = subLevel.body;
    const dimension = body.dimension.dimension;
    const aabb = body.getAabb();
    const currentReadable = areBoundsChunksReadable(dimension, aabb, this.#chunkReadabilityCache);
    if (currentReadable) {
      state.lastSafeBounds = cloneBounds(aabb);
      state.lastSafePose = getBodyPose(subLevel);
    }

    const nearestPlayer = nearestPlayerTo(body.location, players);
    const nearestDistance = nearestPlayer
      ? vectorDistance(body.location, nearestPlayer.location)
      : undefined;
    const playerMovingAway = nearestDistance !== undefined
      && state.lastNearestPlayerDistance !== undefined
      && nearestDistance > state.lastNearestPlayerDistance + PLAYER_MOVING_AWAY_EPSILON;
    state.lastNearestPlayerDistance = nearestDistance;

    const predicted = createPredictedBounds(aabb, body.velocity);
    const predictedReadable = areBoundsChunksReadable(
      dimension,
      predicted,
      this.#chunkReadabilityCache
    );
    const guardReadable = !playerMovingAway || !nearestPlayer || areBoundsChunksReadable(
      dimension,
      createOutwardGuardBounds(aabb, body.location, nearestPlayer.location),
      this.#chunkReadabilityCache
    );
    const threatened = players.length === 0
      || !currentReadable
      || !predictedReadable
      || !guardReadable;
    state.boundaryThreatTicks = threatened ? state.boundaryThreatTicks + 1 : 0;

    const confirmations = players.length === 0 ? 1 : CROSS_DOMAIN_CONFIRM_TICKS;
    if (state.boundaryThreatTicks < confirmations) return "keep";
    if (!currentReadable) {
      if (!areBoundsChunksReadable(dimension, state.lastSafeBounds, this.#chunkReadabilityCache)) {
        return "defer";
      }
      body.teleport(state.lastSafePose.location, {
        angularVelocity: { x: 0, y: 0, z: 0 },
        rotation: state.lastSafePose.rotation,
        velocity: { x: 0, y: 0, z: 0 }
      });
    }
    return "settle";
  }

  /** Whether a stored record can be rebuilt now: a player is near and its chunks read back. */
  canRestore(structure: SerializedSubLevelStructure, players: readonly Player[]): boolean {
    if (!hasNearbyPlayer(structure, players)) return false;
    let dimension: Dimension;
    try {
      dimension = world.getDimension(structure.dimensionId);
    } catch {
      return false;
    }
    return areBoundsChunksReadable(
      dimension,
      createSavedSubLevelBounds(structure),
      this.#chunkReadabilityCache
    );
  }

  #getState(subLevel: ServerSubLevel): TicketState {
    let state = this.#states.get(subLevel.id);
    if (!state) {
      const pose = getBodyPose(subLevel);
      state = {
        boundaryThreatTicks: 0,
        lastNearestPlayerDistance: undefined,
        lastSafeBounds: cloneBounds(subLevel.body.getAabb()),
        lastSafePose: pose
      };
      this.#states.set(subLevel.id, state);
    }
    return state;
  }
}

export function getBodyPose(subLevel: ServerSubLevel): SavedPose {
  return {
    location: { ...subLevel.body.location },
    rotation: { ...subLevel.body.getRotation() }
  };
}

export function clonePose(pose: SavedPose): SavedPose {
  return { location: { ...pose.location }, rotation: { ...pose.rotation } };
}

/** Signature of the pose fields, so unchanged sub-levels are not re-serialized. */
export function poseSignature(
  subLevel: ServerSubLevel,
  boundaryThreatTicks: number,
  lastSafePose: SavedPose
): string {
  const body = subLevel.body;
  return [
    vectorSignature(body.location),
    vectorSignature(body.getRotation()),
    vectorSignature(body.velocity),
    vectorSignature(body.angularVelocity),
    body.isSleeping ? "1" : "0",
    boundaryThreatTicks,
    vectorSignature(lastSafePose.location),
    vectorSignature(lastSafePose.rotation)
  ].join("|");
}

/** Bounds a stored record occupies, from its farthest block plus one. */
export function createSavedSubLevelBounds(
  structure: SerializedSubLevelStructure
): PhysicsBodyAabb {
  const location = structure.pose?.location ?? structure.origin;
  let radius = 1;
  for (const block of structure.blocks) {
    radius = Math.max(radius, Math.hypot(
      block.localLocation.x,
      block.localLocation.y,
      block.localLocation.z
    ) + 1);
  }
  return {
    min: { x: location.x - radius, y: location.y - radius, z: location.z - radius },
    max: { x: location.x + radius, y: location.y + radius, z: location.z + radius }
  };
}

export function hasNearbyPlayer(
  structure: SerializedSubLevelStructure,
  players: readonly Player[]
): boolean {
  const location = structure.pose?.location ?? structure.origin;
  return players.some(player => {
    if (player.dimension.id !== structure.dimensionId) return false;
    const dx = player.location.x - location.x;
    const dy = Math.abs(player.location.y - location.y);
    const dz = player.location.z - location.z;
    return Math.hypot(dx, dz) <= RESTORE_HORIZONTAL_RADIUS
      && dy <= RESTORE_VERTICAL_RADIUS;
  });
}

function nearestPlayerTo(location: Vector3, players: readonly Player[]): Player | undefined {
  let nearest: Player | undefined;
  let distance = Number.POSITIVE_INFINITY;
  for (const player of players) {
    const candidate = vectorDistance(location, player.location);
    if (candidate >= distance) continue;
    nearest = player;
    distance = candidate;
  }
  return nearest;
}

/** Players grouped by dimension id, so each sub-level sees only its own. */
export function groupPlayersByDimension(
  players: readonly Player[]
): ReadonlyMap<string, readonly Player[]> {
  const grouped = new Map<string, Player[]>();
  for (const player of players) {
    const id = player.dimension.id;
    const existing = grouped.get(id);
    if (existing) existing.push(player);
    else grouped.set(id, [player]);
  }
  return grouped;
}
