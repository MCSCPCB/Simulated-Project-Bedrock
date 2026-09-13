// The queue that merges externally applied forces before they reach the bodies:
// piston pushes and explosions are collected per dimension, flushed once per
// run cycle, and applied as batch-clamped impulses at the contact points.
// Migrated from TreePhysics src/content/contraption/effects/Controller.ts.
import { system, type Dimension, type Vector3 } from "@minecraft/server";
import {
  aabbOverlaps,
  findSubLevelPistonContact,
  findSubLevelSphereContact,
  unionAabbs
} from "../collider/SubLevelContactQuery.js";
import type { RigidBodyHandle } from "../handle/RigidBodyHandle.js";
import type { PhysicsBodyAabb } from "../PhysicsTypes.js";
import type { SubLevelPhysicsSystem } from "../../../sublevel/system/SubLevelPhysicsSystem.js";
import {
  isFiniteVector,
  scale
} from "../../../util/SableVector3Utils.js";
import {
  addImpulseAt,
  addPistonImpulseAt,
  clampMagnitude,
  computeExplosionImpulseMagnitude,
  computePistonImpulseMagnitude,
  createAccumulator,
  getExplosionDirection,
  getExplosionMergeKey,
  isAxisDirection,
  isNegligibleVector,
  isWorldOccluded,
  MAX_BATCH_ANGULAR_VELOCITY_CHANGE,
  MAX_BATCH_LINEAR_VELOCITY_CHANGE,
  MAX_OCCLUSION_RAYS_PER_SUB_LEVEL,
  MAX_PISTON_EFFECTS_PER_SUB_LEVEL,
  EXPLOSION_OCCLUDED_IMPULSE_SCALE,
  selectNearbyExplosions,
  weightedAverage,
  type BodyImpulseAccumulator,
  type PendingExplosionEffect
} from "./SubLevelForceMath.js";
import {
  computeSubLevelPunchStrength,
  getSubLevelUprightness
} from "../../../content/punching/SubLevelPunch.js";

export interface SubLevelPistonForce {
  readonly dimension: Dimension;
  readonly direction: Vector3;
  readonly fronts: readonly PhysicsBodyAabb[];
  readonly playerImpulseMultiplier: number;
  readonly key: string;
  readonly separationPadding: number;
}
export interface SubLevelExplosionForce {
  readonly center: Vector3;
  readonly dimension: Dimension;
  readonly radius: number;
}

interface PendingDimensionEffects {
  dimension: Dimension;
  explosions: Map<string, PendingExplosionEffect>;
  pistons: Map<string, SubLevelPistonForce>;
}

interface PreparedPistonEffect {
  bounds: PhysicsBodyAabb;
  effect: SubLevelPistonForce;
}

const PISTON_SEPARATION_EPSILON = 0.0025;
const PISTON_CLEARANCE_LIFT = 1;

export class SubLevelForceQueue {
  readonly #physics: SubLevelPhysicsSystem;
  #pendingByDimension = new Map<string, PendingDimensionEffects>();
  #scheduled = false;

  constructor(physics: SubLevelPhysicsSystem) {
    this.#physics = physics;
  }

  queuePiston(effect: SubLevelPistonForce): void {
    if (!isAxisDirection(effect.direction) || effect.fronts.length === 0) return;
    const state = this.#getPendingDimension(effect.dimension);
    state.pistons.set(effect.key, effect);
    this.#scheduleFlush();
  }

  queueExplosion(effect: SubLevelExplosionForce): void {
    if (
      !isFiniteVector(effect.center)
      || !Number.isFinite(effect.radius)
      || effect.radius <= 0
    ) return;
    const state = this.#getPendingDimension(effect.dimension);
    const key = getExplosionMergeKey(effect.center, effect.radius);
    const existing = state.explosions.get(key);
    if (existing) {
      const count = existing.count + 1;
      existing.center = weightedAverage(existing.center, existing.count, effect.center, 1);
      existing.count = count;
      existing.radius = Math.max(existing.radius, effect.radius);
    } else {
      state.explosions.set(key, { ...effect, center: { ...effect.center }, count: 1 });
    }
    this.#scheduleFlush();
  }

  #flushPending(): void {
    if (this.#pendingByDimension.size === 0) {
      this.#scheduled = false;
      return;
    }
    const pending = this.#pendingByDimension;
    this.#pendingByDimension = new Map();
    this.#scheduled = false;

    for (const state of pending.values()) this.#flushDimension(state);
    if (this.#pendingByDimension.size > 0) this.#scheduleFlush();
  }

  #flushDimension(state: PendingDimensionEffects): void {
    const physicsDimension = this.#physics.getExistingDimension(state.dimension);
    if (!physicsDimension?.hasSubLevels()) return;
    const assemblies = physicsDimension.getSubLevels();
    if (assemblies.length === 0) return;
    const pistons: PreparedPistonEffect[] = [];
    for (const effect of state.pistons.values()) {
      const bounds = unionAabbs(effect.fronts);
      if (bounds) pistons.push({ bounds, effect });
    }
    const explosions = [...state.explosions.values()];

    for (const subLevel of assemblies) {
      if (!subLevel.isValid) continue;
      let bounds = subLevel.body.getAabb();
      let accumulator: BodyImpulseAccumulator | undefined;
      let contacted = false;
      let subLevelUprightness: number | undefined;

      let pistonEffectCount = 0;
      for (const prepared of pistons) {
        if (pistonEffectCount >= MAX_PISTON_EFFECTS_PER_SUB_LEVEL) break;
        if (!aabbOverlaps(bounds, prepared.bounds)) continue;
        pistonEffectCount++;
        const { effect } = prepared;
        const contact = findSubLevelPistonContact(subLevel, effect.fronts, effect.direction);
        if (!contact) continue;
        contacted = true;
        subLevel.body.teleport(translateByOffset(subLevel.body.location, {
          x: 0,
          y: PISTON_CLEARANCE_LIFT,
          z: 0
        }));
        let contactLocation = translateByOffset(contact.location, {
          x: 0,
          y: PISTON_CLEARANCE_LIFT,
          z: 0
        });
        const separationDistance = Math.max(
          0,
          contact.separationDistance
            - effect.separationPadding
            - effect.direction.y * PISTON_CLEARANCE_LIFT
        );
        if (separationDistance > 0) {
          const translationDistance = separateBodyAlongAxis(
            subLevel.body,
            effect.direction,
            separationDistance
          );
          contactLocation = translateAlongAxis(
            contactLocation,
            effect.direction,
            translationDistance
          );
        }
        bounds = subLevel.body.getAabb();
        accumulator ??= createAccumulator(subLevel.body);
        accumulator.wakeOnly = true;
        const effectiveMass = subLevel.body.getEffectiveMassAt(contactLocation, effect.direction);
        subLevelUprightness ??= getSubLevelUprightness(subLevel);
        const playerImpulse = computeSubLevelPunchStrength(effectiveMass, subLevelUprightness);
        const magnitude = computePistonImpulseMagnitude({
          playerImpulse,
          playerImpulseMultiplier: effect.playerImpulseMultiplier
        });
        addPistonImpulseAt(accumulator, contactLocation, scale(effect.direction, magnitude));
      }

      const nearbyExplosions = selectNearbyExplosions(explosions, bounds);
      // Per-sub-level ray budget: only the first MAX_OCCLUSION_RAYS_PER_SUB_LEVEL
      // contacts get a world-occlusion ray test (the counter also advances on
      // clear rays); every contact past the budget applies unconditionally.
      let occlusionRayCount = 0;
      for (const effect of nearbyExplosions) {
        const contact = findSubLevelSphereContact(subLevel, effect.center, effect.radius);
        if (!contact) continue;
        let occlusionScale = 1;
        if (
          occlusionRayCount < MAX_OCCLUSION_RAYS_PER_SUB_LEVEL
          && isWorldOccluded(state.dimension, effect.center, contact.location)
        ) {
          occlusionRayCount++;
          occlusionScale = EXPLOSION_OCCLUDED_IMPULSE_SCALE;
        }
        if (occlusionRayCount < MAX_OCCLUSION_RAYS_PER_SUB_LEVEL) occlusionRayCount++;
        accumulator ??= createAccumulator(subLevel.body);
        const direction = getExplosionDirection(effect.center, contact.location, accumulator.centerOfMass);
        const effectiveMass = subLevel.body.getEffectiveMassAt(contact.location, direction);
        subLevelUprightness ??= getSubLevelUprightness(subLevel);
        const playerImpulse = computeSubLevelPunchStrength(effectiveMass, subLevelUprightness);
        const magnitude = computeExplosionImpulseMagnitude({
          count: effect.count,
          distance: contact.distance,
          occlusionScale,
          playerImpulse,
          radius: effect.radius
        });
        if (magnitude <= 0) continue;
        contacted = true;
        accumulator.wakeOnly = true;
        addImpulseAt(accumulator, contact.location, scale(direction, magnitude));
      }

      if (!contacted || !accumulator) continue;
      this.#applyAccumulator(accumulator);
    }
  }

  #applyAccumulator(accumulator: BodyImpulseAccumulator): void {
    const mass = accumulator.body.getMass();
    const linear = clampMagnitude(
      accumulator.linear,
      Math.max(0, mass * MAX_BATCH_LINEAR_VELOCITY_CHANGE)
    );
    const inertia = accumulator.body.getInertia();
    let minimumInertia = Number.POSITIVE_INFINITY;
    if (Number.isFinite(inertia.x) && inertia.x > 0) minimumInertia = inertia.x;
    if (Number.isFinite(inertia.y) && inertia.y > 0 && inertia.y < minimumInertia) {
      minimumInertia = inertia.y;
    }
    if (Number.isFinite(inertia.z) && inertia.z > 0 && inertia.z < minimumInertia) {
      minimumInertia = inertia.z;
    }
    const torqueLimit = Number.isFinite(minimumInertia)
      ? minimumInertia * MAX_BATCH_ANGULAR_VELOCITY_CHANGE
      : 0;
    const torque = clampMagnitude(accumulator.torque, torqueLimit);
    let applied = false;
    if (!isNegligibleVector(linear)) {
      accumulator.body.applyImpulse(linear);
      applied = true;
    }
    if (!isNegligibleVector(accumulator.pistonLinear)) {
      accumulator.body.applyImpulse(accumulator.pistonLinear);
      applied = true;
    }
    if (!isNegligibleVector(accumulator.pistonTorque)) {
      accumulator.body.applyTorqueImpulse(accumulator.pistonTorque);
      applied = true;
    }
    if (!isNegligibleVector(torque)) {
      accumulator.body.applyTorqueImpulse(torque);
      applied = true;
    }
    if (!applied && accumulator.wakeOnly) accumulator.body.wakeUp();
  }

  #getPendingDimension(dimension: Dimension): PendingDimensionEffects {
    let state = this.#pendingByDimension.get(dimension.id);
    if (!state) {
      state = {
        dimension,
        explosions: new Map(),
        pistons: new Map()
      };
      this.#pendingByDimension.set(dimension.id, state);
    }
    return state;
  }

  #scheduleFlush(): void {
    if (this.#scheduled) return;
    this.#scheduled = true;
    system.run(() => this.#flushPending());
  }
}

function separateBodyAlongAxis(
  body: RigidBodyHandle,
  direction: Vector3,
  separationDistance: number
): number {
  const amount = separationDistance + PISTON_SEPARATION_EPSILON;
  body.teleport(translateAlongAxis(body.location, direction, amount));
  return amount;
}

function translateAlongAxis(
  location: Vector3,
  direction: Vector3,
  distance: number
): Vector3 {
  return {
    x: location.x + direction.x * distance,
    y: location.y + direction.y * distance,
    z: location.z + direction.z * distance
  };
}

function translateByOffset(location: Vector3, offset: Vector3): Vector3 {
  return {
    x: location.x + offset.x,
    y: location.y + offset.y,
    z: location.z + offset.z
  };
}
