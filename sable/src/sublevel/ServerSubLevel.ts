// A server-authoritative sub-level: the rigid body, its block grid with the
// integer-keyed lookup indexes, the logical collider that follows block edits,
// and the entity collision proxy. Migrated from TreePhysics src/Physics.ts
// (PhysicsContraption); the visual half stays with sable's SubLevelRenderer, so
// the renderer fields, the cube-open and attachment-visual state, and the
// visual-entity accessors are dropped and syncVisuals is not part of this class.
import type { Dimension, Vector3 } from "@minecraft/server";
import type { RigidBodyHandle } from "../api/physics/handle/RigidBodyHandle.js";
import { SubLevelColliderIndex } from "../api/physics/collider/SubLevelColliderIndex.js";
import {
  computeSubLevelInertia,
  createDefaultSubLevelBuoyancyPoints
} from "../api/physics/mass/MassTracker.js";
import {
  normalizeBlockMass,
  normalizeSubLevelBlocks
} from "../api/physics/collider/SubLevelBlockNormalization.js";
import type {
  PhysicsBodyCollider,
  SubLevelRuntimeRepresentation,
  SubLevelRuntimeRepresentationFactory,
  SubLevelRuntimeRepresentationState
} from "../api/physics/PhysicsTypes.js";
import type { SubLevelCollisionSnapshotIndex } from "./entity_collision/SubLevelEntityCollisionIndex.js";
import type { SubLevelEntityCollision } from "./entity_collision/SubLevelEntityCollision.js";
import type { ObbCollisionShell, ObbEntitySnapshot } from "./entity_collision/obb/ObbTypes.js";
import {
  isSubLevelBlockCollidable,
  isSubLevelBlockRaySolid,
  type SubLevelInteractionRaycastHit,
  type SubLevelInteractionRaycastOptions
} from "./system/SubLevelInteractionSystem.js";
import { raycastSubLevelBody } from "../content/raycast/SubLevelGridRaycast.js";
import { packLocalBlockKey } from "../util/SableMathUtils.js";
import { blockLocationKey, isFiniteVector } from "../util/SableVector3Utils.js";
import type { SubLevel, SubLevelBlock, SubLevelFoliageTint } from "./SubLevel.js";
import type { SubLevelSurfaceContactRecorder } from "../content/entities_stick_sublevels/effects/SubLevelSurfaceContactEffects.js";

const FLOWING_FLUID_COLLISION_RECOVERY_TICKS = 8;
// A cell scan visits O(distance^3) packed keys, so far lookups fall back to
// one linear pass over the block list instead.
const BLOCK_LOOKUP_CELL_SCAN_MAX_DISTANCE = 4;
const DEFAULT_BLOCK_LOOKUP_DISTANCE = 0.9;
const DEFAULT_FRAGILE_PROBE_BUDGET = 64;

export class ServerSubLevel implements SubLevel {
  readonly body: RigidBodyHandle;
  readonly dimension: Dimension;
  readonly foliageTint?: SubLevelFoliageTint;
  readonly renderEntityTags?: readonly string[];
  readonly fragileProbeBudget: number;
  readonly #blocks: SubLevelBlock[];
  readonly #blocksByKey = new Map<string, SubLevelBlock>();
  // Parallel integer-keyed index for the collision, raycast, and footstep hot
  // paths, which otherwise build one template string per probed cell.
  readonly #blocksByPackedKey = new Map<number, SubLevelBlock>();
  readonly #blockOrderByPackedKey = new Map<number, number>();
  readonly #logicalColliderIndex: SubLevelColliderIndex;
  readonly #collisionProxy: SubLevelEntityCollision;
  readonly #runtimeRepresentation?: SubLevelRuntimeRepresentationFactory;
  readonly #runtimeRepresentationState?: SubLevelRuntimeRepresentationState;
  #flowingFluidDryTicks = FLOWING_FLUID_COLLISION_RECOVERY_TICKS;
  #contentRevision = 0;
  #massMoment: Vector3;
  #totalMass: number;

  constructor(
    body: RigidBodyHandle,
    dimension: Dimension,
    blocks: readonly SubLevelBlock[],
    logicalColliderIndex: SubLevelColliderIndex,
    collisionProxy: SubLevelEntityCollision,
    massMoment: Vector3,
    totalMass: number,
    runtimeRepresentation?: SubLevelRuntimeRepresentationFactory,
    runtimeRepresentationState?: SubLevelRuntimeRepresentationState,
    foliageTint?: SubLevelFoliageTint,
    renderEntityTags?: readonly string[],
    fragileProbeBudget = DEFAULT_FRAGILE_PROBE_BUDGET
  ) {
    this.body = body;
    this.dimension = dimension;
    this.foliageTint = foliageTint ? { ...foliageTint } : undefined;
    this.renderEntityTags = renderEntityTags ? [...renderEntityTags] : undefined;
    this.fragileProbeBudget = fragileProbeBudget;
    this.#blocks = [...blocks];
    this.#logicalColliderIndex = logicalColliderIndex;
    this.#collisionProxy = collisionProxy;
    this.#runtimeRepresentation = runtimeRepresentation;
    this.#runtimeRepresentationState = runtimeRepresentationState;
    this.#totalMass = totalMass;
    this.#massMoment = { ...massMoment };
    for (let index = 0; index < blocks.length; index++) {
      const block = blocks[index]!;
      const key = blockLocationKey(block.localLocation);
      const packed = packLocalBlockKey(
        block.localLocation.x,
        block.localLocation.y,
        block.localLocation.z
      );
      this.#blocksByKey.set(key, block);
      this.#blocksByPackedKey.set(packed, block);
      this.#blockOrderByPackedKey.set(packed, index);
    }
  }

  get blocks(): readonly SubLevelBlock[] { return this.#blocks; }
  get contentRevision(): number { return this.#contentRevision; }
  get id(): number { return this.body.id; }
  get isValid(): boolean { return this.body.isValid; }

  hasKnownCollisionIntegrityFailure(): boolean {
    return this.#collisionProxy.hasKnownIntegrityFailure;
  }

  getBlockAtLocalLocation(location: Vector3): SubLevelBlock | undefined {
    if (!Number.isInteger(location.x) || !Number.isInteger(location.y) || !Number.isInteger(location.z)) {
      return undefined;
    }
    return this.#blocksByPackedKey.get(
      packLocalBlockKey(location.x, location.y, location.z)
    );
  }

  getBlockAtWorldPoint(
    point: Vector3,
    maximumDistance = DEFAULT_BLOCK_LOOKUP_DISTANCE
  ): SubLevelBlock | undefined {
    const local = this.body.worldPointToLocal(point);
    if (
      !Number.isFinite(maximumDistance)
      || maximumDistance < 0
      || maximumDistance > BLOCK_LOOKUP_CELL_SCAN_MAX_DISTANCE
    ) {
      return findClosestSubLevelBlock(this.#blocks, local, maximumDistance);
    }
    let closest: SubLevelBlock | undefined;
    let closestDistanceSquared = maximumDistance * maximumDistance;
    let closestOrder = -1;
    for (let y = Math.ceil(local.y - maximumDistance); y <= Math.floor(local.y + maximumDistance); y++) {
      for (let z = Math.ceil(local.z - maximumDistance); z <= Math.floor(local.z + maximumDistance); z++) {
        for (let x = Math.ceil(local.x - maximumDistance); x <= Math.floor(local.x + maximumDistance); x++) {
          const key = packLocalBlockKey(x, y, z);
          const block = this.#blocksByPackedKey.get(key);
          if (!block) continue;
          const dx = x - local.x;
          const dy = y - local.y;
          const dz = z - local.z;
          const distanceSquared = dx * dx + dy * dy + dz * dz;
          // Both packed maps are populated and pruned together, so a block hit
          // guarantees an order entry.
          const order = this.#blockOrderByPackedKey.get(key)!;
          if (
            distanceSquared < closestDistanceSquared
            || (distanceSquared === closestDistanceSquared && order >= closestOrder)
          ) {
            closest = block;
            closestDistanceSquared = distanceSquared;
            closestOrder = order;
          }
        }
      }
    }
    return closest;
  }

  getBlocksInLocalBounds(min: Vector3, max: Vector3): readonly SubLevelBlock[] {
    if (!isFiniteVector(min) || !isFiniteVector(max)) return [];
    const startX = Math.ceil(Math.min(min.x, max.x) - 0.5);
    const startY = Math.ceil(Math.min(min.y, max.y) - 0.5);
    const startZ = Math.ceil(Math.min(min.z, max.z) - 0.5);
    const endX = Math.floor(Math.max(min.x, max.x) + 0.5);
    const endY = Math.floor(Math.max(min.y, max.y) + 0.5);
    const endZ = Math.floor(Math.max(min.z, max.z) + 0.5);
    if (startX > endX || startY > endY || startZ > endZ) return [];

    const spanX = endX - startX + 1;
    const spanY = endY - startY + 1;
    const spanZ = endZ - startZ + 1;
    const cellCount = spanX * spanY * spanZ;
    if (!Number.isSafeInteger(cellCount) || cellCount > 65_536) {
      return this.#blocks.filter(block => (
        block.localLocation.x >= startX
        && block.localLocation.x <= endX
        && block.localLocation.y >= startY
        && block.localLocation.y <= endY
        && block.localLocation.z >= startZ
        && block.localLocation.z <= endZ
      ));
    }

    const blocks: SubLevelBlock[] = [];
    for (let y = startY; y <= endY; y++) {
      for (let z = startZ; z <= endZ; z++) {
        for (let x = startX; x <= endX; x++) {
          const block = this.#blocksByPackedKey.get(packLocalBlockKey(x, y, z));
          if (block) blocks.push(block);
        }
      }
    }
    return blocks;
  }

  raycast(
    origin: Vector3,
    direction: Vector3,
    maximumDistance = Number.POSITIVE_INFINITY,
    options?: SubLevelInteractionRaycastOptions
  ): SubLevelInteractionRaycastHit | undefined {
    if (!this.body.isValid) return undefined;
    return raycastSubLevelBody(
      this.body,
      options?.ignorePassableBlocks
        ? (x, y, z) => {
            const block = this.#blocksByPackedKey.get(packLocalBlockKey(x, y, z));
            return block && isSubLevelBlockRaySolid(block) ? block : undefined;
          }
        : (x, y, z) => this.#blocksByPackedKey.get(packLocalBlockKey(x, y, z)),
      origin,
      direction,
      maximumDistance,
      options
    );
  }

  removeBlockAtLocalLocation(location: Vector3): SubLevelBlock | undefined {
    return this.removeBlocksAtLocalLocations([location])[0];
  }

  removeBlocksAtLocalLocations(locations: readonly Vector3[]): SubLevelBlock[] {
    const keys = new Set(locations.map(blockLocationKey));
    const removed = this.#blocks.filter(block => keys.has(blockLocationKey(block.localLocation)));
    if (removed.length === 0) return [];
    const removedKeys = new Set(removed.map(block => blockLocationKey(block.localLocation)));
    for (let index = this.#blocks.length - 1; index >= 0; index--) {
      if (removedKeys.has(blockLocationKey(this.#blocks[index]!.localLocation))) {
        this.#blocks.splice(index, 1);
      }
    }
    for (const key of removedKeys) {
      this.#blocksByKey.delete(key);
    }
    for (const block of removed) {
      const packed = packLocalBlockKey(
        block.localLocation.x,
        block.localLocation.y,
        block.localLocation.z
      );
      this.#blocksByPackedKey.delete(packed);
      this.#blockOrderByPackedKey.delete(packed);
    }
    this.#contentRevision++;
    if (this.#blocks.length === 0) {
      this.remove();
      return removed;
    }
    if (!this.#blocks.some(isSubLevelBlockCollidable)) {
      this.remove();
      return removed;
    }
    this.#rebuildPhysicsRepresentation(
      removed,
      removed.some(block => block.runtimeCollidable !== false)
    );
    return removed;
  }

  /** Add ordinary blocks without changing the body's world transform. */
  addBlocksAtLocalLocations(blocks: readonly SubLevelBlock[]): void {
    if (!this.isValid || blocks.length === 0) return;
    const normalized = normalizeSubLevelBlocks(blocks);
    for (const block of normalized) {
      if (this.#blocksByKey.has(blockLocationKey(block.localLocation))) {
        throw new RangeError(
          `Sub-level block location ${blockLocationKey(block.localLocation)} is already occupied.`
        );
      }
    }
    const previousCenterOfMass = this.body.getCenterOfMass();
    for (const block of normalized) {
      const packed = packLocalBlockKey(
        block.localLocation.x,
        block.localLocation.y,
        block.localLocation.z
      );
      this.#blocksByKey.set(blockLocationKey(block.localLocation), block);
      this.#blockOrderByPackedKey.set(packed, this.#blocks.length);
      this.#blocksByPackedKey.set(packed, block);
      this.#blocks.push(block);
      const mass = normalizeBlockMass(block);
      this.#totalMass += mass;
      this.#massMoment.x += block.localLocation.x * mass;
      this.#massMoment.y += block.localLocation.y * mass;
      this.#massMoment.z += block.localLocation.z * mass;
    }
    const centerUpdate = this.#computeCenterOfMassUpdate(previousCenterOfMass);
    this.#contentRevision++;
    this.#logicalColliderIndex.addBlocks(normalized);
    const logicalCollider = this.#logicalColliderIndex.collider;
    const representation = this.#runtimeRepresentationState?.addBlocks?.(normalized)
      ?? this.#runtimeRepresentation?.(this.#blocks);
    this.#applyMassAndColliderUpdate(logicalCollider, representation, centerUpdate, true);
    this.body.wakeUp();
  }

  /**
   * A rigid body's linear velocity belongs to its center of mass. Preserve
   * the old motion at the new center when an in-place edit moves that center.
   */
  #computeCenterOfMassUpdate(previousCenterOfMass: Vector3): {
    readonly nextCenterOfMass: Vector3;
    readonly nextCenterVelocity: Vector3 | undefined;
  } {
    const nextCenterOfMass = {
      x: this.#massMoment.x / this.#totalMass,
      y: this.#massMoment.y / this.#totalMass,
      z: this.#massMoment.z / this.#totalMass
    };
    const centerOfMassChanged = (
      nextCenterOfMass.x !== previousCenterOfMass.x
      || nextCenterOfMass.y !== previousCenterOfMass.y
      || nextCenterOfMass.z !== previousCenterOfMass.z
    );
    const nextCenterVelocity = centerOfMassChanged
      ? this.body.getVelocityAt(this.body.localPointToWorld(nextCenterOfMass))
      : undefined;
    return { nextCenterOfMass, nextCenterVelocity };
  }

  /** Shared block add/remove tail; the call order is load-bearing. */
  #applyMassAndColliderUpdate(
    logicalCollider: Extract<PhysicsBodyCollider, { type: "compound" }>,
    representation: SubLevelRuntimeRepresentation | undefined,
    centerUpdate: Readonly<{
      nextCenterOfMass: Vector3;
      nextCenterVelocity: Vector3 | undefined;
    }>,
    updateRuntimeCollider: boolean
  ): void {
    this.body.setEnvironmentCollider(logicalCollider);
    this.#collisionProxy.setCollider(logicalCollider);
    if (updateRuntimeCollider) {
      this.body.setColliderIncrementally(representation?.collider ?? logicalCollider);
    }
    this.body.setMass(this.#totalMass);
    this.body.setCenterOfMass(centerUpdate.nextCenterOfMass);
    if (centerUpdate.nextCenterVelocity) this.body.setVelocity(centerUpdate.nextCenterVelocity);
    this.body.setInertia(computeSubLevelInertia(logicalCollider, this.#totalMass));
    this.body.setBuoyancyPoints(
      representation?.buoyancyPoints ?? createDefaultSubLevelBuoyancyPoints(this.#blocks)
    );
  }

  #rebuildPhysicsRepresentation(
    removed: readonly SubLevelBlock[],
    runtimeColliderChanged: boolean
  ): void {
    this.#logicalColliderIndex.removeBlocks(removed);
    const logicalCollider = this.#logicalColliderIndex.collider;
    for (const block of removed) {
      const mass = normalizeBlockMass(block);
      this.#totalMass -= mass;
      this.#massMoment.x -= block.localLocation.x * mass;
      this.#massMoment.y -= block.localLocation.y * mass;
      this.#massMoment.z -= block.localLocation.z * mass;
    }
    const previousCenterOfMass = this.body.getCenterOfMass();
    const centerUpdate = this.#computeCenterOfMassUpdate(previousCenterOfMass);
    const representation = this.#runtimeRepresentationState?.removeBlocks(removed)
      ?? this.#runtimeRepresentation?.(this.#blocks);
    this.#applyMassAndColliderUpdate(
      logicalCollider,
      representation,
      centerUpdate,
      !this.#runtimeRepresentation || runtimeColliderChanged
    );
  }

  remove(): void {
    this.#collisionProxy.dispose();
    this.#blocksByKey.clear();
    this.#blocksByPackedKey.clear();
    this.#blockOrderByPackedKey.clear();
    this.#blocks.length = 0;
    if (this.body.isValid) this.body.remove();
  }

  syncCollision(
    snapshotIndex: SubLevelCollisionSnapshotIndex,
    collisionShell: ObbCollisionShell,
    enabled: boolean,
    surfaceMotionEnabled: boolean,
    surfaceContactCallback?: SubLevelSurfaceContactRecorder
  ): void {
    if (this.body.isInNativeFlowingFluid) {
      this.#flowingFluidDryTicks = 0;
    } else if (this.#flowingFluidDryTicks < FLOWING_FLUID_COLLISION_RECOVERY_TICKS) {
      this.#flowingFluidDryTicks++;
    }
    // Flowing native fluids can move collidable entities independently of the rigid body.
    // Disable the whole sub-level immediately, then require a stable dry interval before rebuilding it.
    const flowingFluidCollisionAllowed = this.#flowingFluidDryTicks
      >= FLOWING_FLUID_COLLISION_RECOVERY_TICKS;
    this.#collisionProxy.sync(
      snapshotIndex,
      collisionShell,
      enabled && flowingFluidCollisionAllowed,
      surfaceMotionEnabled,
      surfaceContactCallback
        ? (
          entity,
          location,
          relativePosition,
          playerPosition,
          playerVelocity,
          surfaceVelocity
        ) => {
          const block = this.getBlockAtWorldPoint(location);
          surfaceContactCallback(
            entity,
            location,
            relativePosition,
            playerPosition,
            this.id,
            block,
            playerVelocity,
            surfaceVelocity
          );
        }
        : undefined
    );
  }
}

function findClosestSubLevelBlock(
  blocks: readonly SubLevelBlock[],
  local: Vector3,
  maximumDistance: number
): SubLevelBlock | undefined {
  let closest: SubLevelBlock | undefined;
  let closestDistanceSquared = maximumDistance * maximumDistance;
  for (const block of blocks) {
    const dx = block.localLocation.x - local.x;
    const dy = block.localLocation.y - local.y;
    const dz = block.localLocation.z - local.z;
    const distanceSquared = dx * dx + dy * dy + dz * dz;
    if (distanceSquared <= closestDistanceSquared) {
      closest = block;
      closestDistanceSquared = distanceSquared;
    }
  }
  return closest;
}

export type { ObbEntitySnapshot };
