// Surface contact effects for actors supported by a moving sub-level: the
// footstep contact pass that feeds step, jump, land and fall sounds, the
// sprinting kickback burst and the hard-landing burst, plus the airborne speed
// samples both the landing effects and the Mount handoff read.
// Migrated from TreePhysics src/Physics.ts (the PhysicsDimension footstep,
// landing and sprint sections) and
// TreePhysics src/content/tree/contraption/Lifecycle.ts (handleSurfaceParticle).
import {
  InputButton,
  system,
  type Dimension,
  type Entity,
  type Player,
  type Vector3
} from "@minecraft/server";
import type { SubLevelSurfaceParticleAfterEvent } from "../../../api/physics/PhysicsEvents.js";
import type { ServerSubLevel } from "../../../sublevel/ServerSubLevel.js";
import type { SubLevelBlock } from "../../../sublevel/SubLevel.js";
import type { ObbEntitySnapshot } from "../../../sublevel/entity_collision/obb/ObbTypes.js";
import { spawnSubLevelBlockDestructParticle } from "../../particle/SubLevelBlockParticles.js";
import {
  resolveVanillaBlockFallSound,
  resolveVanillaBlockJumpSound,
  resolveVanillaBlockLandSound,
  resolveVanillaBlockStepSound,
  type VanillaBlockSoundEvent
} from "../../sublevel_sounds/SubLevelBlockSounds.js";

const FOOTSTEP_DISTANCE = 1.6;
const FOOTSTEP_MAX_DELTA = 1.5;
const FOOTSTEP_CONTACT_RETENTION_TICKS = 4;
const SPRINT_PARTICLE_INTERVAL_TICKS = 3;
const SPRINT_PARTICLE_COUNT = 3;
const SPRINT_PARTICLE_HORIZONTAL_RADIUS = 0.3;
const SPRINT_PARTICLE_VERTICAL_RADIUS = 0.02;
const SPRINT_PARTICLE_SPEED_MIN = 1.2;
const SPRINT_PARTICLE_SPEED_MAX = 3.6;
const SPRINT_PARTICLE_MIN_RELATIVE_SPEED = 0.01;
// Kickback bursts fly against the sprint direction, scaled up from the
// per-tick relative velocity so they remain visible at walking speeds.
const SPRINT_PARTICLE_VELOCITY_SCALE = -4;
const SPRINT_PARTICLE_UPWARD_DIRECTION = 1.5;
const SPRINT_PARTICLE_DIRECTION_RANDOMNESS = 0.4;
const SPRINT_PARTICLE_SURFACE_OFFSET_Y = 0.1;
const PLAYER_GRAVITY_PER_TICK = 0.08;
const PLAYER_VERTICAL_DRAG_PER_TICK = 0.98;
const PLAYER_TERMINAL_DOWNWARD_SPEED =
  PLAYER_GRAVITY_PER_TICK * PLAYER_VERTICAL_DRAG_PER_TICK
  / (1 - PLAYER_VERTICAL_DRAG_PER_TICK);
const SAFE_FALL_DISTANCE = 3;
const LANDING_APPROACH_RETENTION_TICKS = 2;
const MAX_LANDING_PARTICLES = 96;
const LANDING_PARTICLE_SURFACE_OFFSET_Y = 0.02;
const LANDING_PARTICLE_UPWARD_DIRECTION = 0.8;
// Burst strength ramps with blocks fallen beyond the safe distance and is
// capped so terminal-velocity landings do not flood the client.
const LANDING_STRENGTH_BASE = 0.2;
const LANDING_STRENGTH_EXCESS_DIVISOR = 15;
const LANDING_STRENGTH_MAX = 2.5;
const LANDING_PARTICLES_PER_STRENGTH = 150;
const JUMP_INPUT = InputButton.Jump;

interface FootstepContact {
  readonly block: SubLevelBlock | undefined;
  readonly blockTypeId: string | undefined;
  readonly distanceSquared: number;
  readonly entity: Entity;
  readonly grounded: boolean;
  readonly jumped: boolean;
  readonly landingDownwardSpeed?: number;
  readonly location: Vector3;
  readonly mountContact: boolean;
  readonly playerVelocity: Vector3;
  readonly relativePosition: Vector3;
  readonly sprinting?: boolean;
  readonly supportLocal: Vector3;
  readonly surfaceVelocity: Vector3;
  readonly subLevelId: number;
}

interface FootstepState {
  distance: number;
  lastContactTick: number;
  lastJumpPressed: boolean;
  lastPosition: Vector3;
  lastSprintParticleTick: number;
  subLevelId: number;
}

interface LandingApproachState {
  readonly downwardSpeed: number;
  readonly feetY: number;
  readonly lastSampleTick: number;
}

export interface SubLevelSurfaceContactState {
  readonly grounded?: boolean;
  readonly jumped?: boolean;
  readonly landingDownwardSpeed?: number;
  readonly sprinting?: boolean;
}

export type SubLevelSurfaceContactRecorder = (
  entity: Entity,
  location: Vector3,
  relativePosition: Vector3,
  playerPosition: Vector3,
  subLevelId: number,
  block: SubLevelBlock | undefined,
  playerVelocity: Vector3,
  surfaceVelocity: Vector3,
  state?: SubLevelSurfaceContactState
) => void;

export interface GroundedMountHandoff {
  readonly subLevelId: number;
  readonly supportLocal: Vector3;
}

/** Owns the surface contact pass shared by the Solid and Mount carrying paths. */
export class SubLevelSurfaceContactEffects {
  readonly #dimension: Dimension;
  readonly #emitSurfaceParticle: (event: SubLevelSurfaceParticleAfterEvent) => void;
  readonly #getSubLevelById: (id: number) => ServerSubLevel | undefined;
  readonly #footstepContacts = new Map<string, FootstepContact>();
  readonly #footstepStates = new Map<string, FootstepState>();
  readonly #landingApproaches = new Map<string, LandingApproachState>();
  readonly recordSurfaceContact: SubLevelSurfaceContactRecorder = (
    entity,
    location,
    relativePosition,
    playerPosition,
    subLevelId,
    block,
    playerVelocity,
    surfaceVelocity,
    surfaceState
  ) => {
    if (!entity.isValid) return;
    const subLevel = this.#getSubLevelById(subLevelId);
    if (!subLevel) {
      throw new Error(`Surface contact references unknown sub-level ${subLevelId}.`);
    }
    const grounded = surfaceState?.grounded ?? entity.isOnGround;
    const dx = location.x - playerPosition.x;
    const dy = location.y - playerPosition.y;
    const dz = location.z - playerPosition.z;
    const distanceSquared = dx * dx + dy * dy + dz * dz;
    const existing = this.#footstepContacts.get(entity.id);
    if (!existing || distanceSquared < existing.distanceSquared) {
      this.#footstepContacts.set(entity.id, {
        block,
        blockTypeId: block?.typeId,
        distanceSquared,
        entity,
        grounded,
        jumped: surfaceState?.jumped ?? false,
        landingDownwardSpeed: surfaceState?.landingDownwardSpeed,
        location: { ...location },
        mountContact: surfaceState !== undefined,
        playerVelocity: { ...playerVelocity },
        relativePosition: { ...relativePosition },
        sprinting: surfaceState?.sprinting,
        supportLocal: subLevel.body.worldPointToLocal(location),
        surfaceVelocity: { ...surfaceVelocity },
        subLevelId
      });
    }
  };

  constructor(
    dimension: Dimension,
    getSubLevelById: (id: number) => ServerSubLevel | undefined,
    emitSurfaceParticle: (event: SubLevelSurfaceParticleAfterEvent) => void
  ) {
    this.#dimension = dimension;
    this.#getSubLevelById = getSubLevelById;
    this.#emitSurfaceParticle = emitSurfaceParticle;
  }

  getLandingApproachFeetY(playerId: string): number | undefined {
    return this.#landingApproaches.get(playerId)?.feetY;
  }

  /** Hands riders that were carried by Solid collision over to Mount on wake-up. */
  createGroundedHandOffs(
    isSleeping: (subLevelId: number) => boolean | undefined
  ): Map<string, GroundedMountHandoff> {
    return new Map(
      Array.from(this.#footstepContacts)
        .flatMap(([entityId, contact]) => contact.grounded
          && !contact.mountContact
          && isSleeping(contact.subLevelId) === false
          ? [[entityId, {
            subLevelId: contact.subLevelId,
            supportLocal: contact.supportLocal
          }] as const]
          : [])
    );
  }

  clearContacts(): void {
    this.#footstepContacts.clear();
  }

  /** Plays sparse surface events from the existing player-support contact pass. */
  emitSurfaceContactEffects(): void {
    const currentTick = system.currentTick;
    for (const contact of this.#footstepContacts.values()) {
      if (!contact.entity.isValid) continue;
      const previous = this.#footstepStates.get(contact.entity.id);
      const state = previous
        && previous.subLevelId === contact.subLevelId
        && currentTick - previous.lastContactTick <= FOOTSTEP_CONTACT_RETENTION_TICKS
        ? previous
        : {
          distance: 0,
          lastContactTick: currentTick,
          lastJumpPressed: false,
          lastPosition: { ...contact.relativePosition },
          lastSprintParticleTick: currentTick - SPRINT_PARTICLE_INTERVAL_TICKS,
          subLevelId: contact.subLevelId
        };
      const beganContact = state !== previous;
      if (beganContact) {
        this.#footstepStates.set(contact.entity.id, state);
      } else {
        const delta = Math.hypot(
          contact.relativePosition.x - state.lastPosition.x,
          contact.relativePosition.y - state.lastPosition.y,
          contact.relativePosition.z - state.lastPosition.z
        );
        if (Number.isFinite(delta) && delta <= FOOTSTEP_MAX_DELTA) {
          state.distance += delta;
        } else {
          state.distance = 0;
        }
      }
      state.lastPosition = { ...contact.relativePosition };
      state.lastContactTick = currentTick;
      const jumpPressed = isJumpPressed(contact.entity);
      if (contact.jumped
        || (!beganContact && contact.grounded && jumpPressed && !state.lastJumpPressed)) {
        this.#emitSurfaceSound(contact, resolveVanillaBlockJumpSound(contact.blockTypeId));
      }
      state.lastJumpPressed = jumpPressed;
      const landingApproach = this.#landingApproaches.get(contact.entity.id);
      const landingDownwardSpeed = landingApproach?.downwardSpeed
        ?? contact.landingDownwardSpeed;
      if (landingDownwardSpeed !== undefined && contact.grounded) {
        this.#landingApproaches.delete(contact.entity.id);
        this.#emitLandingEffects(contact, landingDownwardSpeed);
      }
      this.#emitSprintingParticle(contact, state, currentTick);
      if (beganContact) continue;
      if (state.distance < FOOTSTEP_DISTANCE) continue;
      state.distance -= FOOTSTEP_DISTANCE;
      this.#emitSurfaceSound(contact, resolveVanillaBlockStepSound(contact.blockTypeId));
    }
    for (const [entityId, state] of this.#footstepStates) {
      if (currentTick - state.lastContactTick > FOOTSTEP_CONTACT_RETENTION_TICKS) {
        this.#footstepStates.delete(entityId);
      }
    }
    for (const [entityId, state] of this.#landingApproaches) {
      if (currentTick - state.lastSampleTick > LANDING_APPROACH_RETENTION_TICKS) {
        this.#landingApproaches.delete(entityId);
      }
    }
  }

  /** Retains the last airborne speed until the following grounded contact pass. */
  recordLandingApproaches(snapshots: readonly ObbEntitySnapshot[]): void {
    const currentTick = system.currentTick;
    for (const snapshot of snapshots) {
      if (this.#footstepContacts.get(snapshot.entity.id)?.grounded) {
        this.#landingApproaches.delete(snapshot.entity.id);
        continue;
      }
      if (!snapshot.entity.isOnGround && snapshot.velocity.y < 0) {
        this.#landingApproaches.set(snapshot.entity.id, {
          downwardSpeed: -snapshot.velocity.y,
          feetY: snapshot.aabb.center.y - snapshot.aabb.extent.y,
          lastSampleTick: currentTick
        });
      } else {
        this.#landingApproaches.delete(snapshot.entity.id);
      }
    }
  }

  #emitSurfaceSound(contact: FootstepContact, sound: VanillaBlockSoundEvent): void {
    if (contact.entity.typeId !== "minecraft:player") return;
    this.#dimension.playSound(sound.sound, contact.location, {
      pitch: sound.pitch,
      volume: sound.volume
    });
  }

  /** Plays the vanilla land event, or fall plus particles for hard landings. */
  #emitLandingEffects(contact: FootstepContact, downwardSpeed: number): void {
    const fallDistance = estimatePlayerFallDistance(downwardSpeed);
    if (fallDistance > SAFE_FALL_DISTANCE) {
      this.#emitSurfaceSound(contact, resolveVanillaBlockFallSound(contact.blockTypeId));
      this.#emitLandingParticles(contact, fallDistance);
      return;
    }
    this.#emitSurfaceSound(contact, resolveVanillaBlockLandSound(contact.blockTypeId));
  }

  /** Emits a compensated burst every three supported sprinting ticks. */
  #emitSprintingParticle(
    contact: FootstepContact,
    state: FootstepState,
    currentTick: number
  ): void {
    if (!contact.block || contact.entity.typeId !== "minecraft:player") return;
    const player = contact.entity as Player;
    const sprinting = contact.sprinting ?? player.isSprinting;
    if (!contact.grounded || !sprinting || player.isSneaking || player.isInWater) return;
    const relativeVelocity = {
      x: contact.playerVelocity.x - contact.surfaceVelocity.x,
      y: contact.playerVelocity.y - contact.surfaceVelocity.y,
      z: contact.playerVelocity.z - contact.surfaceVelocity.z
    };
    if (
      Math.hypot(relativeVelocity.x, relativeVelocity.z) <= SPRINT_PARTICLE_MIN_RELATIVE_SPEED
    ) return;
    if (currentTick - state.lastSprintParticleTick < SPRINT_PARTICLE_INTERVAL_TICKS) return;
    state.lastSprintParticleTick = currentTick;
    this.#emitSurfaceParticle({
      subLevelId: contact.subLevelId,
      block: contact.block,
      dimension: this.#dimension,
      location: {
        x: contact.location.x,
        y: contact.location.y + SPRINT_PARTICLE_SURFACE_OFFSET_Y,
        z: contact.location.z
      },
      profile: {
        direction: {
          x: relativeVelocity.x * SPRINT_PARTICLE_VELOCITY_SCALE,
          y: SPRINT_PARTICLE_UPWARD_DIRECTION,
          z: relativeVelocity.z * SPRINT_PARTICLE_VELOCITY_SCALE
        },
        directionRandomness: {
          x: SPRINT_PARTICLE_DIRECTION_RANDOMNESS,
          y: SPRINT_PARTICLE_DIRECTION_RANDOMNESS,
          z: SPRINT_PARTICLE_DIRECTION_RANDOMNESS
        },
        offsetRadius: {
          x: SPRINT_PARTICLE_HORIZONTAL_RADIUS,
          y: SPRINT_PARTICLE_VERTICAL_RADIUS,
          z: SPRINT_PARTICLE_HORIZONTAL_RADIUS
        },
        particleCount: SPRINT_PARTICLE_COUNT,
        speedMax: SPRINT_PARTICLE_SPEED_MAX,
        speedMin: SPRINT_PARTICLE_SPEED_MIN
      }
    });
  }

  /** Emits one bounded burst when a player first lands hard on a sub-level. */
  #emitLandingParticles(contact: FootstepContact, fallDistance: number): void {
    if (!contact.block || contact.entity.typeId !== "minecraft:player") return;
    const excess = Math.ceil(fallDistance - SAFE_FALL_DISTANCE);
    const strength = Math.min(
      LANDING_STRENGTH_BASE + excess / LANDING_STRENGTH_EXCESS_DIVISOR,
      LANDING_STRENGTH_MAX
    );
    const particleCount = Math.min(
      MAX_LANDING_PARTICLES,
      Math.floor(LANDING_PARTICLES_PER_STRENGTH * strength)
    );
    this.#emitSurfaceParticle({
      subLevelId: contact.subLevelId,
      block: contact.block,
      dimension: this.#dimension,
      location: {
        x: contact.location.x,
        y: contact.location.y + LANDING_PARTICLE_SURFACE_OFFSET_Y,
        z: contact.location.z
      },
      profile: {
        direction: { x: 0, y: LANDING_PARTICLE_UPWARD_DIRECTION, z: 0 },
        directionRandomness: { x: 1, y: 1, z: 1 },
        offsetRadius: { x: 0, y: 0, z: 0 },
        particleCount,
        speedMax: SPRINT_PARTICLE_SPEED_MAX,
        speedMin: SPRINT_PARTICLE_SPEED_MIN
      }
    });
  }
}

/** Renders player movement flecks from the sub-level's authoritative block snapshot. */
export function handleSubLevelSurfaceParticle(
  event: SubLevelSurfaceParticleAfterEvent,
  getSubLevelById: (id: number) => ServerSubLevel | undefined
): void {
  const subLevel = getSubLevelById(event.subLevelId);
  if (!subLevel) return;
  spawnSubLevelBlockDestructParticle(
    event.dimension,
    event.location,
    event.block,
    subLevel.foliageTint,
    {
      direction: event.profile.direction,
      directionRandomness: event.profile.directionRandomness,
      offsetRadius: event.profile.offsetRadius,
      particleCount: event.profile.particleCount,
      radius: 0,
      speedMax: event.profile.speedMax,
      speedMin: event.profile.speedMin,
      velocityScalar: 1
    }
  );
}

/** Converts Bedrock's discrete, drag-damped falling speed back to distance. */
export function estimatePlayerFallDistance(downwardSpeed: number): number {
  if (!Number.isFinite(downwardSpeed) || downwardSpeed <= 0) return 0;
  if (downwardSpeed >= PLAYER_TERMINAL_DOWNWARD_SPEED) {
    return Number.POSITIVE_INFINITY;
  }
  const fallTicks = Math.log1p(
    -downwardSpeed / PLAYER_TERMINAL_DOWNWARD_SPEED
  ) / Math.log(PLAYER_VERTICAL_DRAG_PER_TICK);
  return PLAYER_TERMINAL_DOWNWARD_SPEED * fallTicks
    - downwardSpeed * PLAYER_VERTICAL_DRAG_PER_TICK
    / (1 - PLAYER_VERTICAL_DRAG_PER_TICK);
}

function isJumpPressed(entity: Entity): boolean {
  return entity.typeId === "minecraft:player"
    && (entity as Player).inputInfo.getButtonState(JUMP_INPUT) === "Pressed";
}
