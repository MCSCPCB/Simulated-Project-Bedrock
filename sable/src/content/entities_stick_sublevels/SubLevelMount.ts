// Seat-entity player carrying for moving sub-levels: binds a rider to a
// simulated mount, drives its movement, support search, jumping and animation
// state, and releases the rider back to native movement.
// Migrated from TreePhysics src/physics/obb/Mount.ts.
import {
  InputButton,
  InputPermissionCategory,
  system,
  world,
  type Block,
  type Dimension,
  type Entity,
  type Player,
  type Vector2,
  type Vector3
} from "@minecraft/server";
import type { ServerSubLevel } from "../../sublevel/ServerSubLevel.js";
import {
  getSubLevelBasis,
  getLocalCollisionBoxes,
  type LocalBox
} from "../../api/physics/collider/SubLevelContactGeometry.js";
import {
  resolveBlockCollisionShape,
  type BlockCollisionShape
} from "../../api/physics/collider/block_shape/BlockCollisionShapeResolver.js";
import type { PhysicsBlockProperties } from "../../api/physics/PhysicsTypes.js";
import {
  createFluidSurface,
  isLavaFluidType
} from "../../physics/chunk/WorldBlockClassification.js";
import { safeGetBlock } from "../../util/LevelAccelerator.js";
import { add, subtract, VANILLA_DIMENSION_IDS } from "../../util/SableVector3Utils.js";
import type {
  GroundedMountHandoff,
  SubLevelSurfaceContactRecorder
} from "./effects/SubLevelSurfaceContactEffects.js";
import {
  isMountSupportNormal,
  resolveMountCollision,
  type MountSupport
} from "./SubLevelMountCollision.js";
import { rejectNormal } from "../../sublevel/entity_collision/obb/internal/Motion.js";

export const MOUNT_ENTITY_TYPE_ID = "sable:sublevel_mount";
const MOUNT_PLAYER_INPUT_TAG = "sable_mount_rider";
const MOUNT_SUPPORT_BELOW = 2.5;
const MOUNT_SUPPORT_ABOVE = 0.35;
const MOUNT_SUPPORT_RADIUS = 0.75;
const MOUNT_SUPPORT_SAMPLE_RADIUS = 0.28;
const MOUNT_SUPPORT_MISS_GRACE_TICKS = 8;
const MOUNT_TRANSFER_STABLE_TICKS = 3;
const MOUNT_MOVE_SPEED = 0.2158;
const MOUNT_MOVE_ACCELERATION = 0.15;
const MOUNT_MOVE_DECELERATION = 0.15;
const MOUNT_SPRINT_SPEED_MULTIPLIER = 1.3;
const MOUNT_SPRINT_INPUT_WINDOW_TICKS = 6;
const MOUNT_FORWARD_INPUT_THRESHOLD = 0.5;
const MOUNT_JUMP_SPEED = 0.42;
const MOUNT_AIR_GRAVITY = 0.08;
const MOUNT_AIR_DRAG = 0.98;
const MOUNT_FLUID_GRAVITY = 0.02;
const MOUNT_FLUID_VERTICAL_DRAG = 0.8;
const MOUNT_ANIMATION_MOVE_THRESHOLD = 0.02;
const MOUNT_ANIMATION_TURN_THRESHOLD = 2;
const MOUNT_WORLD_SUPPORT_SAMPLE_OFFSETS = [
  { x: 0, z: 0 },
  { x: 0.25, z: 0 },
  { x: -0.25, z: 0 },
  { x: 0, z: 0.25 },
  { x: 0, z: -0.25 },
  { x: 0.25, z: 0.25 },
  { x: 0.25, z: -0.25 },
  { x: -0.25, z: 0.25 },
  { x: -0.25, z: -0.25 }
] as const;
const SUPPORT_EPSILON = 0.05;
const MOUNT_BINDING_EPSILON = 0.01;
const MOUNT_SUPPORT_SAMPLE_OFFSETS = [
  { x: 0, z: 0 },
  { x: MOUNT_SUPPORT_SAMPLE_RADIUS, z: 0 },
  { x: -MOUNT_SUPPORT_SAMPLE_RADIUS, z: 0 },
  { x: 0, z: MOUNT_SUPPORT_SAMPLE_RADIUS },
  { x: 0, z: -MOUNT_SUPPORT_SAMPLE_RADIUS }
] as const;
const MOUNT_BINDING_SAMPLE_OFFSETS = [MOUNT_SUPPORT_SAMPLE_OFFSETS[0]] as const;
const ZERO_VECTOR: Vector3 = Object.freeze({ x: 0, y: 0, z: 0 });
const managedMountEntityIds = new Set<string>();
const managedMountPlayerIds = new Set<string>();

type MountAnimationState = "idle" | "walk" | "turn" | "walk_turn";

const MOUNT_ANIMATIONS: Readonly<Record<MountAnimationState, string>> = {
  idle: "animation.sable.player.sublevel_mount.idle",
  walk: "animation.sable.player.sublevel_mount.walk",
  turn: "animation.sable.player.sublevel_mount.turn",
  walk_turn: "animation.sable.player.sublevel_mount.walk_turn"
};

interface MountBinding {
  readonly player: Player;
  readonly seat: Entity;
  candidateSubLevel?: ServerSubLevel;
  candidateSample?: MountSupport;
  candidateTicks: number;
  subLevel: ServerSubLevel;
  animationState?: MountAnimationState;
  lastAnimationLocation: Vector3;
  lastAnimationYaw: number;
  forwardsDownTime?: number;
  grounded: boolean;
  horizontalVelocity: Vector3;
  lastForwardPressed: boolean;
  lastJumpPressed: boolean;
  lastFeetY: number;
  missedSupportTicks: number;
  pseudoSprinting: boolean;
  supportLocal?: Vector3;
  supportWorld?: Vector3;
  verticalVelocity: number;
}

interface SupportSampleOffset {
  readonly x: number;
  readonly z: number;
}

type SubLevelCandidateProvider = (
  location: Vector3,
  radius: number
) => readonly ServerSubLevel[];
type LandingApproachProvider = (playerId: string) => number | undefined;
interface MountSurfaceContactState {
  readonly jumped?: boolean;
  readonly landingDownwardSpeed?: number;
}

type WorldBlockPropertiesProvider = (
  block: { readonly typeId?: string }
) => PhysicsBlockProperties;

/** Controls players standing on moving sub-levels when native OBB support is disabled. */
export class SubLevelMount {
  readonly #bindings = new Map<string, MountBinding>();
  readonly #dimension: Dimension;
  readonly #getBlockProperties: WorldBlockPropertiesProvider;
  readonly #getCandidates: SubLevelCandidateProvider;
  readonly #getLandingApproachFeetY: LandingApproachProvider;
  readonly #surfaceContactCallback: SubLevelSurfaceContactRecorder;

  constructor(
    dimension: Dimension,
    getCandidates: SubLevelCandidateProvider,
    getBlockProperties: WorldBlockPropertiesProvider,
    getLandingApproachFeetY: LandingApproachProvider,
    surfaceContactCallback: SubLevelSurfaceContactRecorder
  ) {
    this.#dimension = dimension;
    this.#getCandidates = getCandidates;
    this.#getBlockProperties = getBlockProperties;
    this.#getLandingApproachFeetY = getLandingApproachFeetY;
    this.#surfaceContactCallback = surfaceContactCallback;
  }

  tick(
    enabled: boolean,
    carryingEnabled: boolean,
    groundedHandOffs?: ReadonlyMap<string, GroundedMountHandoff>
  ): void {
    if (!enabled) {
      this.#releaseAll();
      return;
    }

    const players = this.#dimension.getPlayers();
    const activePlayerIds = new Set(players.map(player => player.id));
    for (const [playerId, binding] of this.#bindings) {
      if (!activePlayerIds.has(playerId)
        || !binding.player.isValid
        || !binding.seat.isValid
        || (binding.subLevel.isValid && binding.subLevel.body.isSleeping)) {
        this.#release(binding);
      }
    }

    for (const player of players) {
      const binding = this.#bindings.get(player.id);
      if (binding) this.#updateBinding(binding, carryingEnabled);
      else this.#tryCreateBinding(player, groundedHandOffs?.get(player.id));
    }
  }

  releasePlayer(playerId: string): void {
    const binding = this.#bindings.get(playerId);
    if (binding) this.#release(binding);
  }

  dispose(): void {
    this.#releaseAll();
  }

  #tryCreateBinding(player: Player, handOff?: GroundedMountHandoff): void {
    if (managedMountPlayerIds.has(player.id)) return;
    if (handOff && player.getVelocity().y <= 0) {
      const feet = getPlayerFeet(player);
      for (const subLevel of this.#getCandidates(
        feet,
        MOUNT_SUPPORT_BELOW + MOUNT_SUPPORT_ABOVE + 1
      )) {
        if (subLevel.id !== handOff.subLevelId
          || !subLevel.isValid
          || subLevel.body.isSleeping) continue;
        // A Solid contact remains stable in the sub-level's local frame after wake-up.
        this.#createBinding(player, subLevel, {
          localPoint: handOff.supportLocal,
          normal: getSubLevelBasis(subLevel).y,
          worldPoint: subLevel.body.localPointToWorld(handOff.supportLocal)
        });
        return;
      }
    }
    const previousFeetY = this.#getLandingApproachFeetY(player.id);
    if (player.isOnGround || previousFeetY === undefined) return;
    const support = this.#findLandingSupport(getPlayerFeet(player), previousFeetY);
    if (!support) return;
    this.#createBinding(player, support.subLevel, support.sample);
  }

  #createBinding(
    player: Player,
    subLevel: ServerSubLevel,
    sample: MountSupport
  ): void {
    const feet = getPlayerFeet(player);
    const surfaceFeet = {
      x: feet.x,
      // Preserve the native player height through the rider handoff.
      y: feet.y,
      z: feet.z
    };
    const movementInput = player.inputInfo.getMovementVector();
    const forwardPressed = isForwardPressed(movementInput);
    const horizontalVelocity = getMovementVector(
      player,
      movementInput,
      MOUNT_MOVE_SPEED
    );
    const surfaceMovement = rejectNormal(horizontalVelocity, sample.normal);
    const collision = resolveMountCollision(
      subLevel,
      surfaceFeet,
      surfaceMovement,
      true
    );
    const support = collision.support ?? sample;
    const seat = this.#dimension.spawnEntity(MOUNT_ENTITY_TYPE_ID, surfaceFeet);
    managedMountEntityIds.add(seat.id);
    const rideable = seat.getComponent("minecraft:rideable");
    if (!rideable) {
      managedMountEntityIds.delete(seat.id);
      seat.remove();
      throw new Error(`Mount entity ${seat.id} has no rideable component.`);
    }
    if (!rideable.addRider(player)) {
      managedMountEntityIds.delete(seat.id);
      seat.remove();
      throw new Error(`Mount entity ${seat.id} could not attach player ${player.id}.`);
    }

    const binding: MountBinding = {
      animationState: undefined,
      candidateTicks: 0,
      subLevel,
      forwardsDownTime: forwardPressed ? system.currentTick : undefined,
      grounded: collision.grounded,
      horizontalVelocity,
      lastAnimationLocation: { ...surfaceFeet },
      lastAnimationYaw: player.getRotation().y,
      lastForwardPressed: forwardPressed,
      lastFeetY: surfaceFeet.y,
      lastJumpPressed: false,
      missedSupportTicks: 0,
      player,
      pseudoSprinting: false,
      seat,
      supportLocal: { ...support.localPoint },
      supportWorld: { ...support.worldPoint },
      verticalVelocity: 0
    };
    managedMountPlayerIds.add(player.id);
    // Rider attachment and its Movement lock are one transaction: a failed
    // initial impulse must leave neither an untracked seat nor a locked player.
    try {
      setMountMovementEnabled(player, false);
      this.#bindings.set(player.id, binding);
      updateMountAnimation(binding, surfaceFeet, horizontalVelocity, false);
      applyMountImpulse(seat, collision.movement);
      if (binding.grounded) {
        this.#recordSurfaceContact(binding, support, collision.movement, ZERO_VECTOR);
      }
    } catch (error) {
      this.#bindings.delete(player.id);
      managedMountPlayerIds.delete(player.id);
      managedMountEntityIds.delete(seat.id);
      try {
        if (player.isValid && player.hasTag(MOUNT_PLAYER_INPUT_TAG)) {
          setMountMovementEnabled(player, true);
        }
      } finally {
        if (seat.isValid) {
          rideable.ejectRiders();
          seat.remove();
        }
      }
      throw error;
    }
  }

  #updateBinding(binding: MountBinding, carryingEnabled: boolean): void {
    const { player, seat } = binding;
    if (player.dimension.id !== this.#dimension.id) {
      this.#release(binding);
      return;
    }
    const rideable = seat.getComponent("minecraft:rideable");
    if (!rideable) throw new Error(`Mount entity ${seat.id} has no rideable component.`);
    if (!rideable.getRiders().some(rider => rider.id === player.id)) {
      this.#release(binding);
      return;
    }

    const wasGrounded = binding.grounded;
    const previousVerticalVelocity = binding.verticalVelocity;
    const playerFeet = getPlayerFeet(player);
    const mountFeet = seat.location;
    let subLevel = binding.subLevel.isValid
      ? binding.subLevel
      : undefined;
    let transportedSupport = binding.supportWorld;
    if (subLevel && binding.supportLocal) {
      transportedSupport = subLevel.body.localPointToWorld(binding.supportLocal);
    }
    const carriedDisplacement = carryingEnabled
      && transportedSupport
      && binding.supportWorld
      ? subtract(transportedSupport, binding.supportWorld)
      : ZERO_VECTOR;
    const carriedFeet = add(mountFeet, carriedDisplacement);
    const supportAbove = binding.grounded
      ? Math.max(
        SUPPORT_EPSILON,
        (transportedSupport?.y ?? binding.lastFeetY)
          - carriedFeet.y + MOUNT_BINDING_EPSILON
      )
      : MOUNT_SUPPORT_ABOVE;
    let support = subLevel
      ? this.#findSupportAt(
        carriedFeet,
        subLevel,
        supportAbove
      )
      : undefined;
    const worldSupportY = !support
      ? findWorldSupportBelowFeet(
        this.#dimension,
        player,
        this.#getBlockProperties
      )
      : undefined;
    let landingDownwardSpeed: number | undefined;
    let transferred = false;
    if (support) {
      binding.candidateSubLevel = undefined;
      binding.candidateSample = undefined;
      binding.candidateTicks = 0;
    } else if (worldSupportY === undefined) {
      const landingSupport = this.#findLandingSupport(
        mountFeet,
        binding.lastFeetY,
        binding.subLevel,
        true
      );
      const landedOnTransfer = landingSupport !== undefined;
      let transferSupport = landingSupport;
      if (landingSupport) {
        binding.candidateSubLevel = undefined;
        binding.candidateSample = undefined;
        binding.candidateTicks = 0;
      } else {
        const candidate = this.#findNearestSupport(
          mountFeet,
          binding.subLevel,
          MOUNT_SUPPORT_ABOVE,
          MOUNT_SUPPORT_SAMPLE_OFFSETS,
          true
        );
        if (!candidate) {
          binding.candidateSubLevel = undefined;
          binding.candidateSample = undefined;
          binding.candidateTicks = 0;
        } else if (candidate.subLevel !== binding.candidateSubLevel) {
          binding.candidateSubLevel = candidate.subLevel;
          binding.candidateSample = candidate.sample;
          binding.candidateTicks = 1;
        } else {
          binding.candidateSample = candidate.sample;
          binding.candidateTicks++;
        }

        if (binding.candidateSubLevel
          && binding.candidateSample
          && binding.candidateTicks >= MOUNT_TRANSFER_STABLE_TICKS) {
          transferSupport = {
            subLevel: binding.candidateSubLevel,
            sample: binding.candidateSample
          };
        }
      }

      if (transferSupport) {
        // Sleeping targets are owned by Solid collision, so hand the player back.
        if (transferSupport.subLevel.body.isSleeping) {
          this.#release(binding);
          return;
        }
        subLevel = transferSupport.subLevel;
        support = transferSupport.sample;
        binding.subLevel = subLevel;
        binding.candidateSubLevel = undefined;
        binding.candidateSample = undefined;
        binding.candidateTicks = 0;
        binding.grounded = landedOnTransfer
          || Math.abs(mountFeet.y - support.worldPoint.y) <= SUPPORT_EPSILON;
        if (landedOnTransfer) {
          landingDownwardSpeed = getLandingDownwardSpeed(previousVerticalVelocity);
          binding.verticalVelocity = 0;
        }
        transferred = true;
      }
    } else {
      binding.candidateSubLevel = undefined;
      binding.candidateSample = undefined;
      binding.candidateTicks = 0;
    }

    let transport: Vector3 = ZERO_VECTOR;
    if (worldSupportY === undefined
      && !transferred
      && binding.supportLocal
      && binding.supportWorld
      && subLevel
      && transportedSupport) {
      transport = carriedDisplacement;
      binding.supportWorld = { ...transportedSupport };
    }
    if (support) binding.missedSupportTicks = 0;
    else {
      binding.missedSupportTicks = worldSupportY !== undefined
        ? binding.missedSupportTicks + 1
        : 0;
      if (worldSupportY !== undefined
        && binding.missedSupportTicks > MOUNT_SUPPORT_MISS_GRACE_TICKS) {
        this.#release(binding);
        return;
      }
    }

    const jumpPressed = player.inputInfo.getButtonState(InputButton.Jump) === "Pressed";
    const jumpStarted = jumpPressed && !binding.lastJumpPressed;
    const fluidJump = jumpStarted
      && !support
      && worldSupportY === undefined
      && isInMountFluid(player, playerFeet, this.#dimension);
    binding.lastJumpPressed = jumpPressed;
    if (jumpStarted && ((support && binding.grounded) || fluidJump)) {
      if (support && binding.grounded) {
        this.#recordSurfaceContact(binding, support, transport, transport, { jumped: true });
      }
      binding.grounded = false;
      binding.verticalVelocity = MOUNT_JUMP_SPEED;
    } else if (!support && worldSupportY === undefined) {
      binding.grounded = false;
    }

    const movementInput = player.inputInfo.getMovementVector();
    updatePseudoSprint(binding, movementInput, system.currentTick);
    binding.horizontalVelocity = approachHorizontalVelocity(
      binding.horizontalVelocity,
      getMovementVector(
        player,
        movementInput,
        binding.pseudoSprinting
          ? MOUNT_MOVE_SPEED * MOUNT_SPRINT_SPEED_MULTIPLIER
          : MOUNT_MOVE_SPEED
      )
    );
    const surfaceMovement = binding.grounded && support
      ? rejectNormal(binding.horizontalVelocity, support.normal)
      : binding.horizontalVelocity;
    let relativeMovement: Vector3 = {
      x: surfaceMovement.x,
      y: binding.grounded ? surfaceMovement.y : binding.verticalVelocity,
      z: surfaceMovement.z
    };
    if (worldSupportY !== undefined) {
      transport = ZERO_VECTOR;
      binding.grounded = true;
      binding.verticalVelocity = 0;
      relativeMovement.y = worldSupportY - seat.location.y;
    } else if (subLevel) {
      const collision = resolveMountCollision(
        subLevel,
        add(seat.location, transport),
        relativeMovement,
        binding.grounded
      );
      relativeMovement = collision.movement;
      binding.grounded = collision.grounded;
      if (!wasGrounded && collision.grounded) {
        landingDownwardSpeed = getLandingDownwardSpeed(previousVerticalVelocity);
      }
      if (collision.grounded || collision.hitCeiling) {
        binding.verticalVelocity = 0;
      } else {
        binding.verticalVelocity = getNextVerticalVelocity(
          binding.verticalVelocity,
          player,
          playerFeet,
          this.#dimension
        );
      }
      if (collision.support) {
        support = collision.support;
        binding.supportLocal = { ...collision.support.localPoint };
        binding.supportWorld = { ...collision.support.worldPoint };
      }
    } else if (!binding.grounded) {
      binding.verticalVelocity = getNextVerticalVelocity(
        binding.verticalVelocity,
        player,
        playerFeet,
        this.#dimension
      );
    }

    if (support && !binding.grounded) {
      binding.supportLocal = { ...support.localPoint };
      binding.supportWorld = { ...support.worldPoint };
    }
    const movement = add(transport, relativeMovement);
    if (support && binding.grounded && subLevel) {
      this.#recordSurfaceContact(
        binding,
        support,
        movement,
        transport,
        { landingDownwardSpeed }
      );
    }
    applyMountImpulse(seat, movement);
    updateMountAnimation(binding, mountFeet, binding.horizontalVelocity, true);
    binding.lastFeetY = mountFeet.y;
  }

  #recordSurfaceContact(
    binding: MountBinding,
    support: MountSupport,
    playerVelocity: Vector3,
    surfaceVelocity: Vector3,
    state?: MountSurfaceContactState
  ): void {
    this.#surfaceContactCallback(
      binding.player,
      support.worldPoint,
      support.localPoint,
      binding.seat.location,
      binding.subLevel.id,
      support.block,
      playerVelocity,
      surfaceVelocity,
      {
        grounded: binding.grounded,
        jumped: state?.jumped,
        landingDownwardSpeed: state?.landingDownwardSpeed,
        sprinting: binding.pseudoSprinting
      }
    );
  }

  #findLandingSupport(
    feet: Vector3,
    previousFeetY: number,
    excluded?: ServerSubLevel,
    includeSleeping = false
  ): { readonly subLevel: ServerSubLevel; readonly sample: MountSupport } | undefined {
    if (feet.y > previousFeetY) return undefined;
    const support = this.#findNearestSupport(
      feet,
      excluded,
      previousFeetY - feet.y + MOUNT_BINDING_EPSILON,
      MOUNT_BINDING_SAMPLE_OFFSETS,
      includeSleeping
    );
    if (!support) return undefined;
    const surfaceY = support.sample.worldPoint.y;
    return surfaceY >= feet.y - MOUNT_BINDING_EPSILON
      && surfaceY <= previousFeetY + MOUNT_BINDING_EPSILON
      ? support
      : undefined;
  }

  #findNearestSupport(
    feet: Vector3,
    excluded?: ServerSubLevel,
    supportAbove = MOUNT_SUPPORT_ABOVE,
    sampleOffsets: readonly SupportSampleOffset[] = MOUNT_SUPPORT_SAMPLE_OFFSETS,
    includeSleeping = false
  ): { readonly subLevel: ServerSubLevel; readonly sample: MountSupport } | undefined {
    let nearest: {
      subLevel: ServerSubLevel;
      distance: number;
      sample: MountSupport;
    } | undefined;
    for (const subLevel of this.#getCandidates(
      feet,
      MOUNT_SUPPORT_BELOW + supportAbove + 1
    )) {
      if (subLevel === excluded) continue;
      if (!includeSleeping && subLevel.body.isSleeping) continue;
      const sample = this.#findSupportAt(
        feet,
        subLevel,
        supportAbove,
        sampleOffsets
      );
      if (!sample) continue;
      const distance = Math.abs(feet.y - sample.worldPoint.y);
      if (!nearest || distance < nearest.distance) {
        nearest = { subLevel, distance, sample };
      }
    }
    return nearest;
  }

  #findSupportAt(
    feet: Vector3,
    subLevel: ServerSubLevel,
    supportAbove = MOUNT_SUPPORT_ABOVE,
    sampleOffsets: readonly SupportSampleOffset[] = MOUNT_SUPPORT_SAMPLE_OFFSETS
  ): MountSupport | undefined {
    if (!subLevel.isValid) return undefined;
    const bounds = subLevel.body.getAabb();
    if (
      feet.x < bounds.min.x - MOUNT_SUPPORT_RADIUS
      || feet.x > bounds.max.x + MOUNT_SUPPORT_RADIUS
      || feet.z < bounds.min.z - MOUNT_SUPPORT_RADIUS
      || feet.z > bounds.max.z + MOUNT_SUPPORT_RADIUS
      || feet.y < bounds.min.y - MOUNT_SUPPORT_BELOW
      || feet.y > bounds.max.y + supportAbove
    ) return undefined;

    let best: MountSupport | undefined;
    const localCenterFeet = subLevel.body.worldPointToLocal(feet);
    let subLevelUp: Vector3 | undefined;
    for (const offset of sampleOffsets) {
      const point = { x: feet.x + offset.x, z: feet.z + offset.z };
      const rayHit = subLevel.raycast(
        { x: point.x, y: feet.y + supportAbove, z: point.z },
        { x: 0, y: -1, z: 0 },
        MOUNT_SUPPORT_BELOW + supportAbove,
        { ignorePassableBlocks: true }
      );
      if (rayHit && isMountSupportNormal(rayHit.normal)
        && rayHit.location.y <= feet.y + supportAbove
        && rayHit.location.y >= feet.y - MOUNT_SUPPORT_BELOW) {
        const centerSupported = getLocalCollisionBoxes(rayHit.block, true).some(box => (
          localCenterFeet.x >= box.min.x - SUPPORT_EPSILON
          && localCenterFeet.x <= box.max.x + SUPPORT_EPSILON
          && localCenterFeet.z >= box.min.z - SUPPORT_EPSILON
          && localCenterFeet.z <= box.max.z + SUPPORT_EPSILON
        ));
        if (!centerSupported) continue;
        const raySample = {
          block: rayHit.block,
          localPoint: { ...rayHit.localLocation },
          normal: { ...rayHit.normal },
          worldPoint: { ...rayHit.location }
        };
        if (!best || raySample.worldPoint.y > best.worldPoint.y) best = raySample;
        continue;
      }

      const localFeet = subLevel.body.worldPointToLocal({
        x: point.x,
        y: feet.y,
        z: point.z
      });
      const blocks = subLevel.getBlocksInLocalBounds(
        {
          x: localFeet.x - MOUNT_SUPPORT_RADIUS,
          y: localFeet.y - MOUNT_SUPPORT_BELOW,
          z: localFeet.z - MOUNT_SUPPORT_RADIUS
        },
        {
          x: localFeet.x + MOUNT_SUPPORT_RADIUS,
          y: localFeet.y + supportAbove,
          z: localFeet.z + MOUNT_SUPPORT_RADIUS
        }
      );
      for (const block of blocks) {
        for (const box of getLocalCollisionBoxes(block, true)) {
          const candidate = getTopSurface(subLevel, localFeet, box, point);
          if (!candidate
            || candidate.worldPoint.y > feet.y + supportAbove
            || candidate.worldPoint.y < feet.y - MOUNT_SUPPORT_BELOW) continue;
          const normal = subLevelUp ??= getSubLevelBasis(subLevel).y;
          if (!isMountSupportNormal(normal)) continue;
          if (!best || candidate.worldPoint.y > best.worldPoint.y) {
            best = {
              block,
              localPoint: candidate.localPoint,
              normal,
              worldPoint: candidate.worldPoint
            };
          }
        }
      }
    }
    return best;
  }

  #release(binding: MountBinding): void {
    this.#bindings.delete(binding.player.id);
    managedMountPlayerIds.delete(binding.player.id);
    managedMountEntityIds.delete(binding.seat.id);
    try {
      setMountMovementEnabled(binding.player, true);
    } finally {
      if (binding.seat.isValid) {
        const rideable = binding.seat.getComponent("minecraft:rideable");
        if (!rideable) {
          throw new Error(`Mount entity ${binding.seat.id} has no rideable component.`);
        }
        rideable.ejectRiders();
        binding.seat.remove();
      }
    }
  }

  #releaseAll(): void {
    for (const binding of this.#bindings.values()) this.#release(binding);
  }
}

/** Removes a loaded Mount left behind by a previous script runtime. */
export function handleSubLevelMountLoad(entity: Entity): void {
  if (entity.typeId !== MOUNT_ENTITY_TYPE_ID) return;
  system.run(() => {
    if (!entity.isValid || managedMountEntityIds.has(entity.id)) return;
    removeStaleMountEntity(entity);
  });
}

/** Removes loaded Mounts and input locks left behind by a previous script runtime. */
export function removeStaleSubLevelMounts(): void {
  for (const dimensionId of VANILLA_DIMENSION_IDS) {
    const dimension = world.getDimension(dimensionId);
    for (const entity of dimension.getEntities({ type: MOUNT_ENTITY_TYPE_ID })) {
      if (entity.isValid && !managedMountEntityIds.has(entity.id)) {
        removeStaleMountEntity(entity);
      }
    }
  }
  for (const player of world.getAllPlayers()) restoreStaleMountPlayerInput(player);
}

/** Restores a player whose Mount-owned input lock outlived its binding. */
export function restoreStaleMountPlayerInput(player: Player): void {
  if (!player.isValid
    || managedMountPlayerIds.has(player.id)
    || !player.hasTag(MOUNT_PLAYER_INPUT_TAG)) return;
  setMountMovementEnabled(player, true);
}

function removeStaleMountEntity(entity: Entity): void {
  const rideable = entity.getComponent("minecraft:rideable");
  if (!rideable) throw new Error(`Mount entity ${entity.id} has no rideable component.`);
  for (const rider of rideable.getRiders()) {
    if (rider.typeId === "minecraft:player") {
      restoreStaleMountPlayerInput(rider as Player);
    }
  }
  rideable.ejectRiders();
  entity.remove();
}

function setMountMovementEnabled(player: Player, enabled: boolean): void {
  if (!player.isValid) return;
  if (!enabled
    && !player.hasTag(MOUNT_PLAYER_INPUT_TAG)
    && !player.addTag(MOUNT_PLAYER_INPUT_TAG)) {
    throw new Error(`Could not assign Mount input tag to player ${player.id}.`);
  }
  player.inputPermissions.setPermissionCategory(InputPermissionCategory.Movement, enabled);
  if (enabled
    && player.hasTag(MOUNT_PLAYER_INPUT_TAG)
    && !player.removeTag(MOUNT_PLAYER_INPUT_TAG)) {
    throw new Error(`Could not remove Mount input tag from player ${player.id}.`);
  }
}

// Selects a looping player animation from the mount's simulated movement.
function updateMountAnimation(
  binding: MountBinding,
  location: Vector3,
  velocity: Vector3,
  detectTurn: boolean
): void {
  const yaw = binding.player.getRotation().y;
  const displacement = subtract(location, binding.lastAnimationLocation);
  const moving = Math.hypot(velocity.x, velocity.z) > MOUNT_ANIMATION_MOVE_THRESHOLD
    && Math.hypot(displacement.x, displacement.z) > MOUNT_ANIMATION_MOVE_THRESHOLD;
  const turning = detectTurn
    && Math.abs(shortestAngleDelta(yaw, binding.lastAnimationYaw))
      > MOUNT_ANIMATION_TURN_THRESHOLD;
  const state: MountAnimationState = moving
    ? turning ? "walk_turn" : "walk"
    : turning ? "turn" : "idle";
  if (state !== binding.animationState) {
    binding.player.playAnimation(MOUNT_ANIMATIONS[state], {
      blendOutTime: 0.1,
      stopExpression: "!query.is_riding_any_entity_of_type('sable:sublevel_mount')"
    });
    binding.animationState = state;
  }
  binding.lastAnimationLocation = { ...location };
  binding.lastAnimationYaw = yaw;
}

function shortestAngleDelta(current: number, previous: number): number {
  let delta = current - previous;
  while (delta > 180) delta -= 360;
  while (delta < -180) delta += 360;
  return delta;
}

function getTopSurface(
  subLevel: ServerSubLevel,
  localFeet: Vector3,
  box: LocalBox,
  worldSample: { readonly x: number; readonly z: number }
): { readonly localPoint: Vector3; readonly worldPoint: Vector3 } | undefined {
  if (localFeet.x < box.min.x - SUPPORT_EPSILON
    || localFeet.x > box.max.x + SUPPORT_EPSILON
    || localFeet.z < box.min.z - SUPPORT_EPSILON
    || localFeet.z > box.max.z + SUPPORT_EPSILON) return undefined;
  const localPoint = { x: localFeet.x, y: box.max.y, z: localFeet.z };
  const worldPoint = subLevel.body.localPointToWorld(localPoint);
  if (Math.hypot(
    worldPoint.x - worldSample.x,
    worldPoint.z - worldSample.z
  ) > MOUNT_SUPPORT_RADIUS) return undefined;
  return { localPoint, worldPoint };
}

function getMovementVector(player: Player, input: Vector2, speed: number): Vector3 {
  const length = Math.hypot(input.x, input.y);
  if (length <= 0.01) return { ...ZERO_VECTOR };
  const localX = input.x / length;
  const localZ = input.y / length;
  const yaw = player.getRotation().y * Math.PI / 180;
  return {
    x: (localX * Math.cos(yaw) - localZ * Math.sin(yaw)) * speed,
    y: 0,
    z: (localX * Math.sin(yaw) + localZ * Math.cos(yaw)) * speed
  };
}

function updatePseudoSprint(binding: MountBinding, input: Vector2, tickCount: number): void {
  const forwardPressed = isForwardPressed(input);
  if (forwardPressed && !binding.lastForwardPressed) {
    if (binding.forwardsDownTime !== undefined
      && binding.forwardsDownTime + MOUNT_SPRINT_INPUT_WINDOW_TICKS >= tickCount) {
      binding.pseudoSprinting = true;
    }
    binding.forwardsDownTime = tickCount;
  } else if (!forwardPressed) {
    binding.pseudoSprinting = false;
  }
  binding.lastForwardPressed = forwardPressed;
}

function isForwardPressed(input: Vector2): boolean {
  return input.y > MOUNT_FORWARD_INPUT_THRESHOLD;
}

function approachHorizontalVelocity(current: Vector3, target: Vector3): Vector3 {
  const delta = subtract(target, current);
  const deltaLength = Math.hypot(delta.x, delta.z);
  if (deltaLength <= 0.0001) return { x: target.x, y: 0, z: target.z };
  const targetLength = Math.hypot(target.x, target.z);
  const step = targetLength > 0.0001
    ? MOUNT_MOVE_ACCELERATION
    : MOUNT_MOVE_DECELERATION;
  const scale = Math.min(step / deltaLength, 1);
  return {
    x: current.x + delta.x * scale,
    y: 0,
    z: current.z + delta.z * scale
  };
}

function applyMountImpulse(seat: Entity, movement: Vector3): void {
  seat.clearVelocity();
  seat.applyImpulse(movement);
}

function getLandingDownwardSpeed(verticalVelocity: number): number | undefined {
  return verticalVelocity < 0 ? -verticalVelocity : undefined;
}

/** Returns the next vanilla passive falling velocity for air, water, or lava. */
function getNextVerticalVelocity(
  verticalVelocity: number,
  player: Player,
  feet: Vector3,
  dimension: Dimension
): number {
  if (isInMountFluid(player, feet, dimension)) {
    return verticalVelocity * MOUNT_FLUID_VERTICAL_DRAG - MOUNT_FLUID_GRAVITY;
  }
  return (verticalVelocity - MOUNT_AIR_GRAVITY) * MOUNT_AIR_DRAG;
}

function isInMountFluid(player: Player, feet: Vector3, dimension: Dimension): boolean {
  const feetBlock = player.isInWater ? undefined : safeGetBlock(dimension, feet);
  return player.isInWater || feetBlock !== undefined
    && isLavaFluidType(feetBlock.typeId)
    && feet.y < createFluidSurface(feetBlock, feetBlock.location.y).surfaceY;
}

function getPlayerFeet(player: Player): Vector3 {
  const aabb = player.getAABB();
  return {
    x: aabb.center.x,
    y: aabb.center.y - aabb.extent.y,
    z: aabb.center.z
  };
}

function findWorldSupportBelowFeet(
  dimension: Dimension,
  player: Player,
  getBlockProperties: WorldBlockPropertiesProvider
): number | undefined {
  const feet = getPlayerFeet(player);
  const footY = Math.floor(feet.y - SUPPORT_EPSILON);
  for (const offset of MOUNT_WORLD_SUPPORT_SAMPLE_OFFSETS) {
    const block = safeGetBlock(dimension, {
      x: Math.floor(feet.x + offset.x),
      y: footY,
      z: Math.floor(feet.z + offset.z)
    });
    if (!block || block.isAir || block.isLiquid) continue;
    const configuredShape = getBlockProperties(block).collisionShape;
    if (configuredShape === "none") continue;
    if (configuredShape === "full") return block.location.y + 1;

    const shape = configuredShape === undefined
      ? resolveBlockCollisionShape(block)
      : configuredShapeToShape(configuredShape);
    const surfaceY = getWorldBlockSurfaceY(block, {
      x: feet.x + offset.x,
      y: feet.y,
      z: feet.z + offset.z
    }, shape);
    if (surfaceY !== undefined) return surfaceY;
  }
  return undefined;
}

function configuredShapeToShape(
  shape: NonNullable<PhysicsBlockProperties["collisionShape"]>
): BlockCollisionShape {
  if (shape === "none") return { kind: "none", shapes: [] };
  if (shape === "full") return { kind: "full", shapes: [] };
  return {
    kind: "partial",
    shapes: shape.map(box => ({
      type: "box" as const,
      minX: box.min.x,
      minY: box.min.y,
      minZ: box.min.z,
      maxX: box.max.x,
      maxY: box.max.y,
      maxZ: box.max.z
    }))
  };
}

// Resolve the actual top surface under the sampled foot point; partial blocks
// such as stairs and cauldrons must not be treated as one-block-high cubes.
function getWorldBlockSurfaceY(
  block: Block,
  samplePoint: Vector3,
  shape: BlockCollisionShape
): number | undefined {
  const shapeKind = shape.kind;
  if (shapeKind === "none") return undefined;
  if (shapeKind === "full") return block.location.y + 1;

  const localX = samplePoint.x - block.location.x;
  const localZ = samplePoint.z - block.location.z;
  let highestSurfaceY: number | undefined;
  for (const box of shape.shapes) {
    if (localX < box.minX
      || localX > box.maxX
      || localZ < box.minZ
      || localZ > box.maxZ) continue;
    const surfaceY = block.location.y + box.maxY;
    if (highestSurfaceY === undefined || surfaceY > highestSurfaceY) {
      highestSurfaceY = surfaceY;
    }
  }
  return highestSurfaceY;
}
