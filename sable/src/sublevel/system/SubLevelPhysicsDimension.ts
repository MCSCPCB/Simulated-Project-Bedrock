// One simulated dimension: it owns the cannon pipeline, the bodies and
// sub-levels living in that dimension, their coarse spatial index, the player
// mount, and the per-step collision sync. Migrated from TreePhysics
// src/Physics.ts (PhysicsDimension); the renderer wiring of createContraption
// is dropped (sable renders through SubLevelRenderer) and the footstep state
// moves to SubLevelSurfaceContactEffects.
import {
  world,
  type Block,
  type Dimension,
  type Vector3
} from "@minecraft/server";
import { SubLevelColliderIndex } from "../../api/physics/collider/SubLevelColliderIndex.js";
import {
  normalizeRenderEntityTags,
  normalizeSubLevelBlocks,
  normalizeSubLevelFoliageTint
} from "../../api/physics/collider/SubLevelBlockNormalization.js";
import {
  computeSubLevelInertia,
  computeSubLevelMassProperties,
  createDefaultSubLevelBuoyancyPoints
} from "../../api/physics/mass/MassTracker.js";
import { attachIndexedWorldSensorHits } from "../../api/physics/PhysicsEvents.js";
import { RigidBodyHandle } from "../../api/physics/handle/RigidBodyHandle.js";
import { SubLevelCollisionSnapshotIndex } from "../entity_collision/SubLevelEntityCollisionIndex.js";
import {
  createSubLevelCollisionEntitySnapshots,
  SubLevelEntityCollision
} from "../entity_collision/SubLevelEntityCollision.js";
import { SubLevelMount } from "../../content/entities_stick_sublevels/SubLevelMount.js";
import { SubLevelSurfaceContactEffects } from "../../content/entities_stick_sublevels/effects/SubLevelSurfaceContactEffects.js";
import { CannonPhysicsPipeline } from "../../physics/impl/cannon/CannonPhysicsPipeline.js";
import type {
  CannonPipelineCollisionAfterEvent,
  CannonPipelineLavaEntryAfterEvent,
  CannonPipelineWaterEntryAfterEvent,
  CannonWorldMeshAuditCandidate
} from "../../physics/impl/cannon/CannonPhysicsPipelineEvents.js";
import type {
  PhysicsBlockProperties,
  PhysicsBodyOptions,
  PhysicsCollisionAfterEvent,
  PhysicsContactMaterialProperties,
  PhysicsWaterEntryAfterEvent,
  ServerSubLevelOptions
} from "../../api/physics/PhysicsTypes.js";
import { ServerSubLevel } from "../ServerSubLevel.js";
import { SubLevelSpatialIndex } from "./SubLevelSpatialIndex.js";
import {
  CONFIGURE_SIMULATION,
  GET_COLLISION_SHELL,
  GET_PLAYER_CARRYING_ENABLED,
  GET_PLAYER_COLLISION_ENABLED,
  GET_PLAYER_MOUNT_ENABLED,
  GET_SIMULATION_OPTIONS,
  GET_WORLD_MESH_AUDIT_CANDIDATE,
  HAS_PENDING_WORLD_MESH_BUILDS,
  REMOVE_SUB_LEVEL_FROM_SPATIAL_INDEX,
  UPDATE_SUB_LEVEL_SPATIAL_INDEX,
  type SubLevelPhysicsSystem
} from "./SubLevelPhysicsSystem.js";

export class SubLevelPhysicsDimension {
  readonly dimension: Dimension;
  readonly id: string;
  readonly #subLevels = new Map<number, ServerSubLevel>();
  readonly #spatialIndex = new SubLevelSpatialIndex<ServerSubLevel>();
  readonly #bodies = new Map<number, RigidBodyHandle>();
  readonly #mount: SubLevelMount;
  readonly #surfaceContacts: SubLevelSurfaceContactEffects;
  readonly #spatiallyActiveSubLevelIds = new Set<number>();
  #subLevelRaycastRevision = 0;
  readonly #pipeline: CannonPhysicsPipeline;
  readonly #physics: SubLevelPhysicsSystem;

  constructor(physics: SubLevelPhysicsSystem, dimension: Dimension | string) {
    this.#physics = physics;
    this.dimension = typeof dimension === "string" ? world.getDimension(dimension) : dimension;
    this.#surfaceContacts = new SubLevelSurfaceContactEffects(
      this.dimension,
      id => this.#subLevels.get(id),
      event => this.#physics.emitSurfaceParticle(event)
    );
    this.#mount = new SubLevelMount(
      this.dimension,
      (location, radius) => this.getSubLevelCandidatesNear(location, radius),
      block => this.getBlockProperties(block),
      playerId => this.#surfaceContacts.getLandingApproachFeetY(playerId),
      this.#surfaceContacts.recordSurfaceContact
    );
    this.id = this.dimension.id;
    this.#pipeline = new CannonPhysicsPipeline(physics[GET_SIMULATION_OPTIONS]());
    this.#pipeline.afterEvents.collision.subscribe(event => this.#emitCollision(event));
    this.#pipeline.afterEvents.lavaEntry.subscribe(event =>
      this.#emitFluidEntry(event, payload => this.#physics.emitLavaEntry(payload))
    );
    this.#pipeline.afterEvents.waterEntry.subscribe(event =>
      this.#emitFluidEntry(event, payload => this.#physics.emitWaterEntry(payload))
    );
  }

  get fixedTimeStep(): number {
    return this.#pipeline.fixedTimeStep;
  }

  get subLevelRaycastRevision(): number {
    return this.#subLevelRaycastRevision;
  }

  [CONFIGURE_SIMULATION](): void {
    this.#pipeline.configure(this.#physics[GET_SIMULATION_OPTIONS]());
  }

  createBody(options: PhysicsBodyOptions): RigidBodyHandle {
    const pipelineBody = this.#pipeline.createBody(
      this.dimension,
      options,
      this.#physics.nextBodyId()
    );
    const body = new RigidBodyHandle(
      this,
      pipelineBody,
      options.name,
      () => this[UPDATE_SUB_LEVEL_SPATIAL_INDEX](pipelineBody.id),
      () => this[REMOVE_SUB_LEVEL_FROM_SPATIAL_INDEX](pipelineBody.id)
    );
    this.#bodies.set(body.id, body);
    return body;
  }

  createSubLevel(options: ServerSubLevelOptions): ServerSubLevel {
    const blocks = normalizeSubLevelBlocks(options.blocks);
    const foliageTint = normalizeSubLevelFoliageTint(options.foliageTint);
    const renderEntityTags = normalizeRenderEntityTags(options.renderEntityTags);
    const logicalColliderIndex = new SubLevelColliderIndex(blocks);
    const logicalCollider = logicalColliderIndex.collider;
    const runtimeRepresentationState = options.runtimeRepresentation
      ?.createIncrementalState?.(blocks);
    const runtimeRepresentation = runtimeRepresentationState?.representation
      ?? options.runtimeRepresentation?.(blocks);
    const massProperties = computeSubLevelMassProperties(blocks);
    const mass = massProperties.mass;

    const body = this.createBody({
      allowSleep: options.allowSleep,
      angularDamping: options.angularDamping,
      angularVelocity: options.angularVelocity,
      buoyancyPoints: runtimeRepresentation?.buoyancyPoints
        ?? createDefaultSubLevelBuoyancyPoints(blocks),
      collider: runtimeRepresentation?.collider ?? logicalCollider,
      environmentCollider: logicalCollider,
      linearDamping: options.linearDamping,
      location: options.location,
      mass,
      name: options.name,
      rotation: options.rotation,
      velocity: options.velocity
    });
    body.setCenterOfMass({
      x: massProperties.moment.x / mass,
      y: massProperties.moment.y / mass,
      z: massProperties.moment.z / mass
    });
    body.setInertia(computeSubLevelInertia(logicalCollider, mass));

    let collisionProxy: SubLevelEntityCollision | undefined;
    try {
      collisionProxy = new SubLevelEntityCollision(
        body,
        logicalCollider,
        this.#physics[GET_PLAYER_COLLISION_ENABLED]()
          && (!this.#physics[GET_PLAYER_MOUNT_ENABLED]() || body.isSleeping)
      );
      const subLevel = new ServerSubLevel(
        body,
        this.dimension,
        blocks,
        logicalColliderIndex,
        collisionProxy,
        massProperties.moment,
        mass,
        options.runtimeRepresentation,
        runtimeRepresentationState,
        foliageTint,
        renderEntityTags,
        options.fragileProbeBudget
      );
      this.#subLevels.set(subLevel.id, subLevel);
      this.#spatialIndex.update(subLevel);
      this.#subLevelRaycastRevision++;
      if (subLevel.body.isActive) this.#spatiallyActiveSubLevelIds.add(subLevel.id);
      return subLevel;
    } catch (error) {
      collisionProxy?.dispose();
      body.remove();
      throw error;
    }
  }

  getSubLevels(): readonly ServerSubLevel[] {
    this.#pruneInvalid();
    return [...this.#subLevels.values()];
  }

  getSubLevelRaycastCandidates(
    origin: Vector3,
    direction: Vector3,
    maximumDistance: number
  ): readonly ServerSubLevel[] {
    this.#pruneInvalid();
    return this.#spatialIndex.queryRay(origin, direction, maximumDistance);
  }

  getSubLevelCandidatesNear(
    location: Vector3,
    radius: number
  ): readonly ServerSubLevel[] {
    return this.#spatialIndex.queryAabb({
      min: {
        x: location.x - radius,
        y: location.y - radius,
        z: location.z - radius
      },
      max: {
        x: location.x + radius,
        y: location.y + radius,
        z: location.z + radius
      }
    });
  }

  hasSubLevels(): boolean {
    this.#pruneInvalid();
    return this.#subLevels.size > 0;
  }

  getSubLevelById(id: number): ServerSubLevel | undefined {
    this.#pruneInvalid();
    return this.#subLevels.get(id);
  }

  getBodies(): readonly RigidBodyHandle[] {
    this.#pruneInvalid();
    return [...this.#bodies.values()];
  }

  getBodyById(id: number): RigidBodyHandle | undefined {
    const body = this.#bodies.get(id);
    if (body && !body.isValid) {
      this.#bodies.delete(id);
      return undefined;
    }
    return body;
  }

  getBlockProperties(block: { typeId?: string } | string): PhysicsBlockProperties {
    return this.#pipeline.getBlockProperties(block);
  }

  setBlockProperties(block: { typeId?: string } | string, properties: PhysicsBlockProperties): void {
    this.#pipeline.setBlockProperties(block, properties);
  }

  setBlockPropertiesBatch(
    entries: readonly (readonly [block: { typeId?: string } | string, properties: PhysicsBlockProperties])[]
  ): void {
    this.#pipeline.setBlockPropertiesBatch(entries);
  }

  isWorldBlockSensor(block: Block): boolean {
    return this.#pipeline.isWorldBlockSensor(block);
  }

  setWorldBlockSensorPredicate(predicate?: (block: Block) => boolean): void {
    this.#pipeline.setWorldBlockSensorPredicate(predicate);
  }

  addBeforeSubstepCallback(callback: () => void): () => void {
    return this.#pipeline.addBeforeSubstepCallback(callback);
  }

  getMaterialProperties(material: string): PhysicsContactMaterialProperties {
    return this.#pipeline.getMaterialProperties(material);
  }

  setMaterialProperties(material: string, properties: PhysicsContactMaterialProperties): void {
    this.#pipeline.setMaterialProperties(material, properties);
  }

  wakeBodiesNear(location: Vector3, radius = 1): number {
    return this.#pipeline.wakeBodiesNear(this.dimension, location, radius);
  }

  invalidateWorldMesh(location: Vector3, radius = 0): void {
    this.#pipeline.invalidateWorldMesh(this.dimension, location, radius);
  }

  invalidateWorldMeshBatch(locations: readonly Vector3[]): void {
    this.#pipeline.invalidateWorldMeshBatch(this.dimension, locations);
  }

  [GET_WORLD_MESH_AUDIT_CANDIDATE](): CannonWorldMeshAuditCandidate | undefined {
    return this.#pipeline.getWorldMeshAuditCandidate();
  }

  [HAS_PENDING_WORLD_MESH_BUILDS](): boolean {
    return this.#pipeline.hasPendingWorldMeshBuilds();
  }

  step(): void {
    this.#pipeline.step();
    this.#pruneInvalid();
    const playerCollisionEnabled = this.#physics[GET_PLAYER_COLLISION_ENABLED]();
    const playerMountEnabled = this.#physics[GET_PLAYER_MOUNT_ENABLED]();
    const playerSnapshots = (playerCollisionEnabled || playerMountEnabled)
      && this.#subLevels.size > 0
      ? createSubLevelCollisionEntitySnapshots(this.dimension.getPlayers())
      : [];
    const groundedHandOffs = playerMountEnabled
      ? this.#surfaceContacts.createGroundedHandOffs(
        subLevelId => this.#subLevels.get(subLevelId)?.body.isSleeping
      )
      : undefined;
    const collisionSnapshotIndex = new SubLevelCollisionSnapshotIndex(
      playerCollisionEnabled ? playerSnapshots : []
    );
    const collisionShell = this.#physics[GET_COLLISION_SHELL]();
    // Both OBB implementations share the gameplay carrying setting: Solid uses
    // surface motion while Mount adds the transported support-point displacement.
    const playerCarryingEnabled = this.#physics[GET_PLAYER_CARRYING_ENABLED]();
    let subLevelTransformChanged = false;
    this.#surfaceContacts.clearContacts();
    for (const subLevel of this.#subLevels.values()) {
      const wasSpatiallyActive = this.#spatiallyActiveSubLevelIds.has(subLevel.id);
      const isSpatiallyActive = subLevel.body.isActive;
      if (isSpatiallyActive) this.#spatiallyActiveSubLevelIds.add(subLevel.id);
      else this.#spatiallyActiveSubLevelIds.delete(subLevel.id);
      if (isSpatiallyActive || wasSpatiallyActive) {
        this.#spatialIndex.update(subLevel);
        subLevelTransformChanged = true;
      }
      // Smooth moving collision replaces only non-sleeping structures; sleeping
      // structures retain the selected low- or high-quality Solid shell.
      const solidCollisionEnabled = playerCollisionEnabled
        && (!playerMountEnabled || subLevel.body.isSleeping);
      subLevel.syncCollision(
        collisionSnapshotIndex,
        collisionShell,
        solidCollisionEnabled,
        playerCarryingEnabled,
        solidCollisionEnabled && playerSnapshots.length > 0
          ? this.#surfaceContacts.recordSurfaceContact
          : undefined
      );
    }
    this.#mount.tick(
      playerMountEnabled && this.#subLevels.size > 0,
      playerCarryingEnabled,
      groundedHandOffs
    );
    // Ray results depend on precise transforms, not only coarse spatial-cell
    // membership. Collapse all motion during this physics step into one revision.
    if (subLevelTransformChanged) this.#subLevelRaycastRevision++;
    this.#surfaceContacts.emitSurfaceContactEffects();
    this.#surfaceContacts.recordLandingApproaches(playerSnapshots);
  }

  releasePlayerMount(playerId: string): void {
    this.#mount.releasePlayer(playerId);
  }

  disposePlayerMounts(): void {
    this.#mount.dispose();
  }

  #emitCollision(event: CannonPipelineCollisionAfterEvent): void {
    const body = this.getBodyById(event.body.id);
    if (!body) return;
    const physicsEvent: PhysicsCollisionAfterEvent = {
      body,
      collisionTag: event.collisionTag,
      currentTick: event.currentTick,
      impactSpeed: event.impactSpeed,
      normal: event.normal,
      otherBody: event.otherBody ? this.getBodyById(event.otherBody.id) : undefined,
      otherCollisionTag: event.otherCollisionTag,
      point: event.point
    };
    if (event.indexedWorldSensorHits) {
      attachIndexedWorldSensorHits(physicsEvent, event.indexedWorldSensorHits);
    }
    this.#physics.emitCollision(physicsEvent);
  }

  // Water and lava entries share one payload shape; only the emit target differs.
  #emitFluidEntry(
    event: CannonPipelineWaterEntryAfterEvent | CannonPipelineLavaEntryAfterEvent,
    emit: (event: PhysicsWaterEntryAfterEvent) => void
  ): void {
    const body = this.getBodyById(event.body.id);
    if (!body) return;
    emit({
      body,
      bodyAabbSizeX: event.bodyAabbSizeX,
      bodyAabbSizeZ: event.bodyAabbSizeZ,
      fastestContactVelocityY: event.fastestContactVelocityY,
      maxContactX: event.maxContactX,
      maxContactZ: event.maxContactZ,
      minContactX: event.minContactX,
      minContactZ: event.minContactZ,
      point: event.point,
      timeStep: event.timeStep
    });
  }

  #pruneInvalid(): void {
    for (const [id, subLevel] of this.#subLevels) {
      if (!subLevel.isValid) {
        subLevel.remove();
        this.#subLevels.delete(id);
        this.#spatialIndex.remove(id);
        this.#spatiallyActiveSubLevelIds.delete(id);
      }
    }
    for (const [id, body] of this.#bodies) {
      if (!body.isValid) this.#bodies.delete(id);
    }
  }

  [UPDATE_SUB_LEVEL_SPATIAL_INDEX](bodyId: number): void {
    const subLevel = this.#subLevels.get(bodyId);
    if (!subLevel?.isValid) return;
    this.#spatialIndex.update(subLevel);
    this.#subLevelRaycastRevision++;
  }

  [REMOVE_SUB_LEVEL_FROM_SPATIAL_INDEX](bodyId: number): void {
    if (this.#subLevels.has(bodyId)) this.#subLevelRaycastRevision++;
    this.#spatialIndex.remove(bodyId);
    this.#spatiallyActiveSubLevelIds.delete(bodyId);
  }
}
