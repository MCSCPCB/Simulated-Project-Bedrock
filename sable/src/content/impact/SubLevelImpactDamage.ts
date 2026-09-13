// Entity damage for moving sub-levels: impact damage curve, swept-pose speed
// gating, voxel DDA block-contact search, damage query clustering, and the
// per-tick damage pass over the active sub-levels.
// Migrated from TreePhysics src/content/tree/contraption/Damage.ts and the
// TreePhysics src/content/tree/contraption/Lifecycle.ts damage methods
// (#damageEntities, #damageTreeCandidates, #pruneDamageState, getBodyPose).
import { EntityDamageCause, type Dimension, type Entity, type Vector3 } from "@minecraft/server";
import type { PhysicsBodyAabb } from "../../api/physics/PhysicsTypes.js";
import type { RigidBodyHandle } from "../../api/physics/handle/RigidBodyHandle.js";
import { rotateVectorByEulerDegreesYzx } from "../../api/math/RotationContinuity.js";
import { boundsOverlap, expandBounds, mergeBounds } from "../../util/SableMathUtils.js";
import { blockLocationKey, subtract } from "../../util/SableVector3Utils.js";
import { isVector, type SavedPose } from "../../sublevel/storage/serialization/SubLevelData.js";
import { isSubLevelBlockCollidable } from "../../sublevel/system/SubLevelInteractionSystem.js";
import type { ServerSubLevel } from "../../sublevel/ServerSubLevel.js";

const IMPACT_REFERENCE_GRAVITY = 11;
const IMPACT_SAFE_FALL_DISTANCE = 3;
const IMPACT_MIN_SPEED = Math.sqrt(
  2 * IMPACT_REFERENCE_GRAVITY * IMPACT_SAFE_FALL_DISTANCE
);
const MAX_IMPACT_DAMAGE = 50;
export const PHYSICS_TICKS_PER_SECOND = 20;
const DAMAGE_RECHECK_INTERVAL_TICKS = 5;
const DAMAGE_STATE_PRUNE_INTERVAL_TICKS = 200;
const DAMAGE_KNOCKBACK_HORIZONTAL_SCALE = 1.6;
const DAMAGE_KNOCKBACK_MAX_STRENGTH = 1.3;

export interface DamageSubLevelProbe {
  bounds: PhysicsBodyAabb;
  currentPose: SavedPose;
  order: number;
  subLevel: ServerSubLevel;
}

export interface DamageQueryCluster {
  bounds: PhysicsBodyAabb;
  dimension: Dimension;
  probes: DamageSubLevelProbe[];
}

export interface DamageCandidate {
  baseLocation: Vector3;
  entity: Entity;
  headLocation: Vector3;
}

interface DamageBlockContact {
  blockLocation: Vector3;
}

export function addDamageQueryProbe(clusters: DamageQueryCluster[], probe: DamageSubLevelProbe): void {
  let bounds = probe.bounds;
  const probes = [probe];
  for (let index = clusters.length - 1; index >= 0; index--) {
    const cluster = clusters[index]!;
    if (!boundsOverlap(bounds, cluster.bounds)) continue;
    bounds = mergeBounds(bounds, cluster.bounds);
    probes.push(...cluster.probes);
    clusters.splice(index, 1);
    index = clusters.length;
  }
  clusters.push({
    bounds,
    dimension: probe.subLevel.body.dimension.dimension,
    probes
  });
}

export function prepareDamageCandidates(entities: readonly Entity[]): DamageCandidate[] {
  const candidates: DamageCandidate[] = [];
  for (const entity of entities) {
    if (!isDamageableTarget(entity)) continue;
    try {
      candidates.push({
        baseLocation: { ...entity.location },
        entity,
        headLocation: entity.getHeadLocation()
      });
    } catch {
      // The entity can invalidate between the query and head-location read.
    }
  }
  return candidates;
}

export function getSubLevelImpactDamage(subLevelSpeedBlocksPerSecond: number): number {
  if (
    !Number.isFinite(subLevelSpeedBlocksPerSecond)
    || subLevelSpeedBlocksPerSecond <= 0
  ) return 0;
  const equivalentFallDistance = subLevelSpeedBlocksPerSecond
    * subLevelSpeedBlocksPerSecond
    / (2 * IMPACT_REFERENCE_GRAVITY);
  const damage = equivalentFallDistance - IMPACT_SAFE_FALL_DISTANCE;
  if (damage <= 0) return 0;
  return Math.min(MAX_IMPACT_DAMAGE, damage);
}

export function canSubLevelReachDamageSpeed(
  body: RigidBodyHandle,
  damagePose: SavedPose,
  currentPose: SavedPose,
  bounds: PhysicsBodyAabb
): boolean {
  const centerOfMass = body.localPointToWorld(body.getCenterOfMass());
  const instantaneousRadius = Math.hypot(
    Math.max(
      Math.abs(bounds.min.x - centerOfMass.x),
      Math.abs(bounds.max.x - centerOfMass.x)
    ),
    Math.max(
      Math.abs(bounds.min.y - centerOfMass.y),
      Math.abs(bounds.max.y - centerOfMass.y)
    ),
    Math.max(
      Math.abs(bounds.min.z - centerOfMass.z),
      Math.abs(bounds.max.z - centerOfMass.z)
    )
  );
  const linearVelocity = body.getVelocityAt(centerOfMass);
  const linearSpeed = Math.hypot(linearVelocity.x, linearVelocity.y, linearVelocity.z);
  const angularSpeed = Math.hypot(
    body.angularVelocity.x,
    body.angularVelocity.y,
    body.angularVelocity.z
  );
  if (linearSpeed + angularSpeed * instantaneousRadius > IMPACT_MIN_SPEED) return true;

  const sweptRadius = Math.hypot(
    Math.max(
      Math.abs(bounds.min.x - currentPose.location.x),
      Math.abs(bounds.max.x - currentPose.location.x)
    ),
    Math.max(
      Math.abs(bounds.min.y - currentPose.location.y),
      Math.abs(bounds.max.y - currentPose.location.y)
    ),
    Math.max(
      Math.abs(bounds.min.z - currentPose.location.z),
      Math.abs(bounds.max.z - currentPose.location.z)
    )
  );
  const translationSpeed = Math.hypot(
    currentPose.location.x - damagePose.location.x,
    currentPose.location.y - damagePose.location.y,
    currentPose.location.z - damagePose.location.z
  ) * PHYSICS_TICKS_PER_SECOND;
  const sweptAngularSpeed = (
    Math.abs(currentPose.rotation.x - damagePose.rotation.x)
    + Math.abs(currentPose.rotation.y - damagePose.rotation.y)
    + Math.abs(currentPose.rotation.z - damagePose.rotation.z)
  ) * Math.PI / 180 * PHYSICS_TICKS_PER_SECOND;
  return translationSpeed + sweptAngularSpeed * sweptRadius > IMPACT_MIN_SPEED;
}

export function vectorLengthSquared(value: Vector3): number {
  return value.x * value.x + value.y * value.y + value.z * value.z;
}

function isDamageableTarget(entity: Entity): boolean {
  if (!entity.isValid) return false;
  // Every entity sable owns - render bodies, collision proxies, mounts, outlines,
  // crack overlays, chest storage - is exempt; the fancy render ids carry a hash.
  if (entity.typeId === "minecraft:item" || entity.typeId.startsWith("sable:")) {
    return false;
  }
  try {
    return entity.getComponent("minecraft:health") !== undefined;
  } catch {
    return false;
  }
}

export function findDamageBlockContact(
  blocks: ReadonlyMap<string, Vector3>,
  localStart: Vector3,
  localEnd: Vector3
): DamageBlockContact | undefined {
  if (!isVector(localStart) || !isVector(localEnd)) return undefined;
  const start = {
    x: localStart.x + 0.5,
    y: localStart.y + 0.5,
    z: localStart.z + 0.5
  };
  const end = {
    x: localEnd.x + 0.5,
    y: localEnd.y + 0.5,
    z: localEnd.z + 0.5
  };
  const delta = subtract(end, start);
  let x = Math.floor(start.x);
  let y = Math.floor(start.y);
  let z = Math.floor(start.z);
  const endX = Math.floor(end.x);
  const endY = Math.floor(end.y);
  const endZ = Math.floor(end.z);
  const stepX = Math.sign(delta.x);
  const stepY = Math.sign(delta.y);
  const stepZ = Math.sign(delta.z);
  const deltaTX = stepX === 0 ? Number.POSITIVE_INFINITY : Math.abs(1 / delta.x);
  const deltaTY = stepY === 0 ? Number.POSITIVE_INFINITY : Math.abs(1 / delta.y);
  const deltaTZ = stepZ === 0 ? Number.POSITIVE_INFINITY : Math.abs(1 / delta.z);
  let maxTX = firstVoxelBoundaryTime(start.x, x, delta.x, stepX);
  let maxTY = firstVoxelBoundaryTime(start.y, y, delta.y, stepY);
  let maxTZ = firstVoxelBoundaryTime(start.z, z, delta.z, stepZ);
  const maximumVisits = Math.abs(endX - x) + Math.abs(endY - y) + Math.abs(endZ - z) + 1;

  for (let visit = 0; visit < maximumVisits; visit++) {
    const blockLocation = blocks.get(`${x},${y},${z}`);
    if (blockLocation) return { blockLocation };
    if (x === endX && y === endY && z === endZ) break;
    const nextTime = Math.min(maxTX, maxTY, maxTZ);
    if (maxTX <= nextTime + 1e-12) {
      x += stepX;
      maxTX += deltaTX;
    }
    if (maxTY <= nextTime + 1e-12) {
      y += stepY;
      maxTY += deltaTY;
    }
    if (maxTZ <= nextTime + 1e-12) {
      z += stepZ;
      maxTZ += deltaTZ;
    }
  }
  return undefined;
}

function firstVoxelBoundaryTime(
  coordinate: number,
  voxel: number,
  delta: number,
  step: number
): number {
  if (step === 0) return Number.POSITIVE_INFINITY;
  const boundary = step > 0 ? voxel + 1 : voxel;
  return (boundary - coordinate) / delta;
}

export function horizontalDirection(from: Vector3, to: Vector3, velocity: Vector3): Vector3 {
  let x = to.x - from.x;
  let z = to.z - from.z;
  let length = Math.hypot(x, z);
  if (length < 0.0001) {
    x = velocity.x;
    z = velocity.z;
    length = Math.hypot(x, z);
  }
  return length < 0.0001
    ? { x: 0, y: 0, z: 0 }
    : { x: x / length, y: 0, z: z / length };
}

export function getSubLevelPoseVelocityAt(
  previousPose: SavedPose,
  currentWorldLocation: Vector3,
  localLocation: Vector3
): Vector3 {
  const previousOffset = rotateVectorByEulerDegreesYzx(
    localLocation,
    previousPose.rotation
  );
  return {
    x: (currentWorldLocation.x - previousPose.location.x - previousOffset.x)
      * PHYSICS_TICKS_PER_SECOND,
    y: (currentWorldLocation.y - previousPose.location.y - previousOffset.y)
      * PHYSICS_TICKS_PER_SECOND,
    z: (currentWorldLocation.z - previousPose.location.z - previousOffset.z)
      * PHYSICS_TICKS_PER_SECOND
  };
}

export class SubLevelImpactDamage {
  readonly #isDamageImmune: (subLevel: ServerSubLevel, entity: Entity) => boolean;
  readonly #damageCooldownUntilTick = new Map<string, number>();
  readonly #damagePoseBySubLevel = new Map<number, SavedPose>();
  readonly #collisionBlocksBySubLevel = new Map<
    number,
    { revision: number; blocks: Map<string, Vector3> }
  >();
  readonly #damageSubLevelBuffer: ServerSubLevel[] = [];

  constructor(isDamageImmune: (subLevel: ServerSubLevel, entity: Entity) => boolean) {
    this.#isDamageImmune = isDamageImmune;
  }

  tick(subLevels: readonly ServerSubLevel[], currentTick: number): void {
    if (subLevels.length === 0) {
      this.#damageCooldownUntilTick.clear();
      return;
    }
    const damageSubLevels = this.#damageSubLevelBuffer;
    damageSubLevels.length = 0;
    for (const subLevel of subLevels) {
      if (subLevel.body.isActive && this.#getCollisionBlocks(subLevel).size > 0) {
        damageSubLevels.push(subLevel);
      }
    }
    if (damageSubLevels.length > 0) this.#damageEntities(damageSubLevels, currentTick);
    damageSubLevels.length = 0;
    if (currentTick % DAMAGE_STATE_PRUNE_INTERVAL_TICKS === 0) this.#pruneDamageState(currentTick);
  }

  removeSubLevel(subLevelId: number): void {
    this.#damagePoseBySubLevel.delete(subLevelId);
    this.#collisionBlocksBySubLevel.delete(subLevelId);
  }

  #damageEntities(
    subLevels: readonly ServerSubLevel[],
    currentTick: number
  ): void {
    const clustersByDimension = new Map<Dimension, DamageQueryCluster[]>();
    for (let order = 0; order < subLevels.length; order++) {
      const subLevel = subLevels[order]!;
      const currentPose = getBodyPose(subLevel.body);
      const bodyBounds = subLevel.body.getAabb();
      if (!canSubLevelReachDamageSpeed(
        subLevel.body,
        this.#getDamagePose(subLevel),
        currentPose,
        bodyBounds
      )) {
        this.#damagePoseBySubLevel.set(subLevel.id, currentPose);
        continue;
      }
      const dimension = subLevel.body.dimension.dimension;
      let clusters = clustersByDimension.get(dimension);
      if (!clusters) {
        clusters = [];
        clustersByDimension.set(dimension, clusters);
      }
      addDamageQueryProbe(clusters, {
        bounds: expandBounds(bodyBounds, 0.5),
        currentPose,
        order,
        subLevel
      });
    }

    for (const clusters of clustersByDimension.values()) {
      for (const cluster of clusters) {
        let entities: Entity[];
        try {
          const bounds = cluster.bounds;
          entities = cluster.dimension.getEntities({
            location: { ...bounds.min },
            volume: {
              x: bounds.max.x - bounds.min.x,
              y: bounds.max.y - bounds.min.y,
              z: bounds.max.z - bounds.min.z
            }
          });
        } catch {
          for (const probe of cluster.probes) {
            this.#damagePoseBySubLevel.set(probe.subLevel.id, probe.currentPose);
          }
          continue;
        }
        const candidates = prepareDamageCandidates(entities);
        cluster.probes.sort((left, right) => left.order - right.order);
        for (const probe of cluster.probes) {
          this.#damageSubLevelCandidates(probe.subLevel, candidates, currentTick);
          this.#damagePoseBySubLevel.set(probe.subLevel.id, probe.currentPose);
        }
      }
    }
  }

  #damageSubLevelCandidates(
    subLevel: ServerSubLevel,
    candidates: readonly DamageCandidate[],
    currentTick: number
  ): void {
    const body = subLevel.body;
    for (const candidate of candidates) {
      const { baseLocation, entity, headLocation } = candidate;
      const localBase = body.worldPointToLocal(baseLocation);
      const localHead = body.worldPointToLocal(headLocation);
      const contact = findDamageBlockContact(
        this.#getCollisionBlocks(subLevel),
        localBase,
        localHead
      );
      if (!contact) continue;
      const { blockLocation } = contact;
      try {
        if (this.#isDamageImmune(subLevel, entity)) continue;
      } catch {
        continue;
      }
      if ((this.#damageCooldownUntilTick.get(entity.id) ?? 0) > currentTick) continue;

      const worldBlockCenter = body.localPointToWorld(blockLocation);
      const instantaneousSubLevelVelocity = body.getVelocityAt(worldBlockCenter);
      const sweptSubLevelVelocity = getSubLevelPoseVelocityAt(
        this.#getDamagePose(subLevel),
        worldBlockCenter,
        blockLocation
      );
      const subLevelVelocity = vectorLengthSquared(sweptSubLevelVelocity)
          > vectorLengthSquared(instantaneousSubLevelVelocity)
        ? sweptSubLevelVelocity
        : instantaneousSubLevelVelocity;
      const impactSpeed = Math.sqrt(vectorLengthSquared(subLevelVelocity));
      const damage = getSubLevelImpactDamage(impactSpeed);
      if (damage <= 0) continue;
      try {
        const damaged = entity.applyDamage(damage, { cause: EntityDamageCause.fallingBlock });
        if (!damaged) continue;
        const centerOfMass = body.localPointToWorld(body.getCenterOfMass());
        const direction = horizontalDirection(centerOfMass, entity.location, subLevelVelocity);
        entity.applyKnockback(
          {
            x: direction.x * DAMAGE_KNOCKBACK_HORIZONTAL_SCALE,
            z: direction.z * DAMAGE_KNOCKBACK_HORIZONTAL_SCALE
          },
          Math.min(DAMAGE_KNOCKBACK_MAX_STRENGTH, impactSpeed / PHYSICS_TICKS_PER_SECOND)
        );
        this.#damageCooldownUntilTick.set(
          entity.id,
          currentTick + DAMAGE_RECHECK_INTERVAL_TICKS
        );
      } catch {
        // Invalid or invulnerable entities do not interrupt the sub-level lifecycle.
      }
    }
  }

  #pruneDamageState(currentTick: number): void {
    for (const [entityId, untilTick] of this.#damageCooldownUntilTick) {
      if (untilTick <= currentTick) this.#damageCooldownUntilTick.delete(entityId);
    }
  }

  /** Blocks with a collision response, rebuilt whenever the sub-level content changes. */
  #getCollisionBlocks(subLevel: ServerSubLevel): ReadonlyMap<string, Vector3> {
    const revision = subLevel.contentRevision;
    const cached = this.#collisionBlocksBySubLevel.get(subLevel.id);
    if (cached && cached.revision === revision) return cached.blocks;
    const blocks = new Map<string, Vector3>();
    for (const block of subLevel.blocks) {
      if (block.collisionResponse === false || !isSubLevelBlockCollidable(block)) continue;
      blocks.set(blockLocationKey(block.localLocation), block.localLocation);
    }
    this.#collisionBlocksBySubLevel.set(subLevel.id, { blocks, revision });
    return blocks;
  }

  #getDamagePose(subLevel: ServerSubLevel): SavedPose {
    let pose = this.#damagePoseBySubLevel.get(subLevel.id);
    if (!pose) {
      pose = getBodyPose(subLevel.body);
      this.#damagePoseBySubLevel.set(subLevel.id, pose);
    }
    return pose;
  }
}

function getBodyPose(body: RigidBodyHandle): SavedPose {
  return {
    location: { ...body.location },
    rotation: body.getRotation()
  };
}
