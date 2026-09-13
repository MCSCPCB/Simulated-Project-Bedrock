// The sub-level physics system: one simulated dimension per Bedrock dimension,
// the fixed-step tick loop, the after-event signals, and the world-mesh audit
// scheduler that picks one chunk to re-scan per interval. Migrated from
// TreePhysics src/Physics.ts (PhysicsWorld); the five provider setters are gone,
// because sable reads the durable settings from SableConfig directly.
import { system, world, type Dimension, type Entity, type Player, type Vector3 } from "@minecraft/server";
import {
  SABLE_PHYSICS_PERFORMANCE_HIGH,
  SUB_LEVEL_COLLISION_DISABLED,
  SUB_LEVEL_COLLISION_HIGH,
  getSablePhysicsPerformanceLevel,
  getSubLevelCollisionLevel,
  shouldCarryPlayers,
  shouldUseSmoothPlayerCarrying,
  type SablePhysicsPerformanceLevel
} from "../../SableConfig.js";
import { SubLevelPhysicsAfterEvents } from "../../api/physics/PhysicsEvents.js";
import type { SubLevelSurfaceParticleAfterEvent } from "../../api/physics/PhysicsEvents.js";
import type {
  PhysicsCollisionAfterEvent,
  PhysicsLavaEntryAfterEvent,
  PhysicsWaterEntryAfterEvent,
  SubLevelPhysicsOptions,
  SubLevelPhysicsStats
} from "../../api/physics/PhysicsTypes.js";
import {
  isCannonWorldMeshAuditCandidatePreferred,
  type CannonWorldMeshAuditCandidate,
  type CannonWorldMeshAuditCoordinator
} from "../../physics/impl/cannon/CannonPhysicsPipeline.js";
import { removeStaleSubLevelColliders } from "../entity_collision/SubLevelEntityCollision.js";
import {
  removeStaleSubLevelMounts,
  restoreStaleMountPlayerInput
} from "../../content/entities_stick_sublevels/SubLevelMount.js";
import type { ObbCollisionShell } from "../entity_collision/obb/ObbTypes.js";
import { SubLevelPhysicsDimension } from "./SubLevelPhysicsDimension.js";

export const GET_SIMULATION_OPTIONS = Symbol("getSimulationOptions");
export const GET_COLLISION_SHELL = Symbol("getCollisionShell");
export const GET_PLAYER_COLLISION_ENABLED = Symbol("getPlayerCollisionEnabled");
export const GET_PLAYER_CARRYING_ENABLED = Symbol("getPlayerCarryingEnabled");
export const GET_PLAYER_MOUNT_ENABLED = Symbol("getPlayerMountEnabled");
export const CONFIGURE_SIMULATION = Symbol("configureSimulation");
export const GET_WORLD_MESH_AUDIT_CANDIDATE = Symbol("getWorldMeshAuditCandidate");
export const HAS_PENDING_WORLD_MESH_BUILDS = Symbol("hasPendingWorldMeshBuilds");
export const UPDATE_SUB_LEVEL_SPATIAL_INDEX = Symbol("updateSubLevelSpatialIndex");
export const REMOVE_SUB_LEVEL_FROM_SPATIAL_INDEX = Symbol("removeSubLevelFromSpatialIndex");

const WORLD_MESH_AUDIT_INTERVAL_TICKS = 20;

export class SubLevelPhysicsSystem {
  readonly afterEvents = new SubLevelPhysicsAfterEvents();
  readonly #dimensions = new Map<string, SubLevelPhysicsDimension>();
  #angularDamping = 0.09;
  #fixedTimeStep = 1 / 20;
  #gravity: Vector3 = { x: 0, y: -11, z: 0 };
  #linearDamping = 0.09;
  #nextBodyId = 1;
  #performanceLevel: SablePhysicsPerformanceLevel | undefined;
  #runId: number | undefined;
  #running = false;
  #stepCount = 0;
  #worldMeshAuditDimensionCursor = 0;
  readonly #worldMeshAuditCoordinator: CannonWorldMeshAuditCoordinator = {
    currentTick: 0,
    lastAuditTick: -WORLD_MESH_AUDIT_INTERVAL_TICKS,
    nextSelectionTick: 0
  };

  [GET_SIMULATION_OPTIONS]() {
    const highPerformance = (this.#performanceLevel ?? this.#readPerformanceLevel())
      === SABLE_PHYSICS_PERFORMANCE_HIGH;
    return {
      angularDamping: this.#angularDamping,
      fixedTimeStep: highPerformance ? this.#fixedTimeStep / 3 : this.#fixedTimeStep,
      gravity: this.#gravity,
      linearDamping: this.#linearDamping,
      tickSteps: highPerformance ? 3 : 1,
      worldMeshAuditCoordinator: this.#worldMeshAuditCoordinator,
      worldMeshCache: true,
      worldMeshWaitForMissingChunks: !highPerformance
    };
  }

  getDimension(dimension: Dimension | string): SubLevelPhysicsDimension {
    const id = typeof dimension === "string" ? dimension : dimension.id;
    let result = this.#dimensions.get(id);
    if (!result) {
      result = new SubLevelPhysicsDimension(this, dimension);
      this.#dimensions.set(id, result);
    }
    return result;
  }

  getExistingDimension(dimension: Dimension | string): SubLevelPhysicsDimension | undefined {
    const id = typeof dimension === "string" ? dimension : dimension.id;
    return this.#dimensions.get(id);
  }

  getDimensions(): readonly SubLevelPhysicsDimension[] { return [...this.#dimensions.values()]; }
  nextBodyId(): number { return this.#nextBodyId++; }

  getStats(): SubLevelPhysicsStats {
    const bodies = this.getDimensions().flatMap(dimension => dimension.getBodies());
    return {
      activeBodyCount: bodies.filter(body => body.isActive).length,
      bodyCount: bodies.length,
      fixedTimeStep: this.#fixedTimeStep,
      running: this.#running,
      sleepingBodyCount: bodies.filter(body => body.isSleeping).length,
      stepCount: this.#stepCount
    };
  }

  start(options?: SubLevelPhysicsOptions): void {
    if (this.#running) return;
    this.#fixedTimeStep = options?.fixedTimeStep ?? this.#fixedTimeStep;
    this.#gravity = options?.gravity ?? this.#gravity;
    this.#linearDamping = options?.linearDamping ?? this.#linearDamping;
    this.#angularDamping = options?.angularDamping ?? this.#angularDamping;
    this.#applyPerformanceLevel(true);
    this.#running = true;
    // Dimension access is unavailable during early-execution. Defer cleanup
    // until the first ordinary script tick without delaying physics startup.
    system.run(() => {
      if (!this.#running) return;
      removeStaleSubLevelColliders();
      removeStaleSubLevelMounts();
    });
    this.#runId = system.runInterval(() => this.step(), 1);
  }

  [GET_COLLISION_SHELL](): ObbCollisionShell {
    return getSubLevelCollisionLevel() === SUB_LEVEL_COLLISION_HIGH ? "solid" : "walking";
  }

  [GET_PLAYER_COLLISION_ENABLED](): boolean {
    return getSubLevelCollisionLevel() !== SUB_LEVEL_COLLISION_DISABLED;
  }

  [GET_PLAYER_CARRYING_ENABLED](): boolean {
    return shouldCarryPlayers();
  }

  [GET_PLAYER_MOUNT_ENABLED](): boolean {
    return getSubLevelCollisionLevel() !== SUB_LEVEL_COLLISION_DISABLED
      && shouldCarryPlayers()
      && shouldUseSmoothPlayerCarrying();
  }

  stop(): void {
    if (this.#runId !== undefined) system.clearRun(this.#runId);
    this.#runId = undefined;
    this.#running = false;
    for (const dimension of this.#dimensions.values()) dimension.disposePlayerMounts();
  }

  handleMountPlayerSpawn(player: Player): void {
    for (const dimension of this.#dimensions.values()) {
      dimension.releasePlayerMount(player.id);
    }
    restoreStaleMountPlayerInput(player);
  }

  step(): void {
    this.#applyPerformanceLevel();
    this.#worldMeshAuditCoordinator.currentTick = this.#stepCount;
    const target = this.#selectWorldMeshAuditTarget();
    this.#worldMeshAuditCoordinator.targetDimensionId = target?.dimensionId;
    this.#worldMeshAuditCoordinator.targetChunkKey = target?.chunkKey;
    for (const dimension of this.#dimensions.values()) dimension.step();
    this.#stepCount++;
    this.afterEvents.step.emit({
      currentTick: system.currentTick,
      fixedTimeStep: this.#fixedTimeStep
    });
  }

  emitCollision(event: PhysicsCollisionAfterEvent): void {
    this.afterEvents.collision.emit(event);
  }

  emitSurfaceParticle(event: SubLevelSurfaceParticleAfterEvent): void {
    this.afterEvents.surfaceParticle.emit(event);
  }

  emitWaterEntry(event: PhysicsWaterEntryAfterEvent): void {
    this.afterEvents.waterEntry.emit(event);
  }

  emitLavaEntry(event: PhysicsLavaEntryAfterEvent): void {
    this.afterEvents.lavaEntry.emit(event);
  }

  invalidateWorldMesh(dimension: Dimension | string, location: Vector3, radius = 0): void {
    this.getExistingDimension(dimension)?.invalidateWorldMesh(location, radius);
  }

  invalidateWorldMeshBatch(
    dimension: Dimension | string,
    locations: readonly Vector3[]
  ): void {
    this.getExistingDimension(dimension)?.invalidateWorldMeshBatch(locations);
  }

  /**
   * Picks one audit chunk across all dimensions per interval. Candidates are
   * ranked by isCannonWorldMeshAuditCandidatePreferred; among candidates that
   * tie on every preference field, the dimension cursor round-robins so a busy
   * dimension cannot starve the others. The field-by-field tie check mirrors
   * the preference predicate because "not preferred" alone cannot distinguish
   * "worse" from "equal".
   */
  #selectWorldMeshAuditTarget(): CannonWorldMeshAuditCandidate | undefined {
    if (
      this.#worldMeshAuditCoordinator.currentTick
        < this.#worldMeshAuditCoordinator.nextSelectionTick
      ||
      this.#worldMeshAuditCoordinator.currentTick
        - this.#worldMeshAuditCoordinator.lastAuditTick < WORLD_MESH_AUDIT_INTERVAL_TICKS
    ) return undefined;
    for (const dimension of this.#dimensions.values()) {
      if (dimension[HAS_PENDING_WORLD_MESH_BUILDS]()) return undefined;
    }
    this.#worldMeshAuditCoordinator.playerPositionsByDimension =
      this.#getPlayerPositionsByDimension();
    const dimensions = [...this.#dimensions.values()];
    let selected: CannonWorldMeshAuditCandidate | undefined;
    let selectedIndex = -1;
    let selectedRank = Number.POSITIVE_INFINITY;
    for (let index = 0; index < dimensions.length; index++) {
      const dimension = dimensions[index]!;
      const candidate = dimension[GET_WORLD_MESH_AUDIT_CANDIDATE]();
      const rank = dimensions.length > 0
        ? (index - this.#worldMeshAuditDimensionCursor + dimensions.length) % dimensions.length
        : 0;
      if (!candidate) continue;
      if (
        selected
        && !isCannonWorldMeshAuditCandidatePreferred(candidate, selected)
        && (
          candidate.auditCycle !== selected.auditCycle
          || candidate.sleepingSupport !== selected.sleepingSupport
          || candidate.playerDistanceSquared !== selected.playerDistanceSquared
          || candidate.ageTicks !== selected.ageTicks
          || candidate.scannedAgeTicks !== selected.scannedAgeTicks
          || rank >= selectedRank
        )
      ) continue;
      selected = candidate;
      selectedIndex = index;
      selectedRank = rank;
    }
    if (selectedIndex >= 0 && dimensions.length > 0) {
      this.#worldMeshAuditDimensionCursor = (selectedIndex + 1) % dimensions.length;
    }
    if (!selected) return undefined;
    this.#worldMeshAuditCoordinator.nextSelectionTick =
      this.#worldMeshAuditCoordinator.currentTick + WORLD_MESH_AUDIT_INTERVAL_TICKS;
    return selected;
  }

  #getPlayerPositionsByDimension(): ReadonlyMap<string, readonly Vector3[]> {
    const positions = new Map<string, Vector3[]>();
    let players: readonly Entity[];
    try {
      players = world.getAllPlayers();
    } catch {
      // Player enumeration is unavailable in some script lifecycle windows
      // (cf. the early-execution guard in start). The audit then proceeds
      // without player-distance weighting for this interval.
      return positions;
    }
    for (const player of players) {
      const dimensionId = player.dimension.id;
      let dimensionPositions = positions.get(dimensionId);
      if (!dimensionPositions) {
        dimensionPositions = [];
        positions.set(dimensionId, dimensionPositions);
      }
      dimensionPositions.push({ ...player.location });
    }
    return positions;
  }

  #applyPerformanceLevel(force = false): void {
    const next = this.#readPerformanceLevel();
    if (!force && next === this.#performanceLevel) return;
    this.#performanceLevel = next;
    for (const dimension of this.#dimensions.values()) dimension[CONFIGURE_SIMULATION]();
  }

  #readPerformanceLevel(): SablePhysicsPerformanceLevel {
    return getSablePhysicsPerformanceLevel();
  }
}

export const sablePhysics = new SubLevelPhysicsSystem();
