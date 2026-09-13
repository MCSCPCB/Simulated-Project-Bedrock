// Fragile-block breakage driven by physics contacts: world blocks broken by an
// impact at or above their configured speed, sub-level blocks queued from
// collision events and from per-tick contact probes, and the flush that hands
// the queued sub-level locations to the container break transaction. Migrated
// from TreePhysics src/content/tree/contraption/Lifecycle.ts (the fragile-block
// segment).
import { system, type Block, type Dimension, type Vector3 } from "@minecraft/server";
import {
  getIndexedWorldSensorHits,
  type IndexedWorldSensorHit
} from "../../api/physics/PhysicsEvents.js";
import { resolveBlockCollisionShape } from "../../api/physics/collider/block_shape/BlockCollisionShapeResolver.js";
import type {
  PhysicsCollisionAfterEvent,
  PhysicsCollisionTag
} from "../../api/physics/PhysicsTypes.js";
import { BLOCK_PHYSICS_PROPERTIES } from "../../data/vanilla/physics/BlockPhysicsProperties.js";
import {
  WorldBlockCache,
  readWorldBlockProbeBatch,
  safeGetBlock
} from "../../util/LevelAccelerator.js";
import {
  blockLocationKey as locationKey,
  parseBlockLocationKey as parseLocationKey
} from "../../util/SableVector3Utils.js";
import type { SubLevelBlock } from "../../sublevel/SubLevel.js";
import type { ServerSubLevel } from "../../sublevel/ServerSubLevel.js";
import type { SubLevelPhysicsDimension } from "../../sublevel/system/SubLevelPhysicsDimension.js";
import type { SubLevelPhysicsSystem } from "../../sublevel/system/SubLevelPhysicsSystem.js";
import type { ServerSubLevelContainer } from "../../api/sublevel/ServerSubLevelContainer.js";

const PHYSICS_TICKS_PER_SECOND = 20;
// World-space tolerance when mapping a contact point back to a sub-level block.
const SUB_LEVEL_BLOCK_LOOKUP_TOLERANCE = 1.25;
// Offsets along the contact normal: 0 samples the block containing the contact
// point itself, the near pair straddles a shared face so a surface contact
// resolves on either side of the boundary, and the far pair reaches contacts
// reported slightly inside one of the bodies.
const WORLD_CONTACT_PROBE_SCALES: readonly number[] = [0, 0.08, -0.08, 0.25, -0.25];

interface SubLevelFragileProbeSample {
  readonly blockKey: string;
  readonly fragile: FragileBlock;
  readonly physicsDimension: SubLevelPhysicsDimension;
  readonly predictedKey?: string;
  readonly predictedLocation?: Vector3;
  readonly speed: number;
  readonly subLevel: ServerSubLevel;
  readonly worldLocation: Vector3;
}

interface SubLevelFragileProbeLocation extends Vector3 {
  additionalSampleIndices?: number[];
  firstSampleIndex: number;
}

export interface WorldCollisionHit {
  readonly locationKey: string;
  readonly typeId: string;
}

/** Collision-driven particle effects, kept behind an interface so physics does not depend on content. */
export interface SubLevelCollisionEffects {
  handleCollision(
    subLevel: ServerSubLevel,
    event: PhysicsCollisionAfterEvent,
    worldHit: WorldCollisionHit | undefined,
    resolvedBlock: SubLevelBlock | undefined,
    worldBlocks: WorldBlockCache
  ): void;
  clearEffectKeys(): void;
}

interface FragileBlock {
  /** Speed threshold at or above which a contact breaks this block. */
  fragileImpactSpeed: number;
  localLocation: Vector3;
  block: SubLevelBlock;
}

interface SubLevelFragileState {
  revision: number;
  fragileKeys: string[];
  fragileBlocks: Map<string, FragileBlock>;
  cursor: number;
}

export class FragileBlockCallback {
  #fragileProbeCandidateMarks = new Uint8Array(0);
  readonly #fragileProbeLocationsByDimension = new Map<
    Dimension,
    Map<string, SubLevelFragileProbeLocation>
  >();
  readonly #fragileProbeSampleBuffer: SubLevelFragileProbeSample[] = [];
  readonly #pendingSubLevelBlockBreaks = new Map<number, Set<string>>();
  readonly #pendingWorldBreaks = new Set<string>();
  readonly #stateBySubLevel = new Map<number, SubLevelFragileState>();
  readonly #worldBlocks = new WorldBlockCache();
  readonly #physics: SubLevelPhysicsSystem;
  readonly #container: ServerSubLevelContainer;
  readonly #collisionParticles?: SubLevelCollisionEffects;
  #worldBlockBreakPredicate?: (block: Block) => boolean;
  #fragileGroupResolver?: (
    subLevel: ServerSubLevel,
    collisionTag: PhysicsCollisionTag
  ) => readonly string[] | undefined;

  constructor(
    physics: SubLevelPhysicsSystem,
    container: ServerSubLevelContainer,
    collisionParticles?: SubLevelCollisionEffects
  ) {
    this.#physics = physics;
    this.#container = container;
    this.#collisionParticles = collisionParticles;
  }

  /** Gates world-block breakage; every candidate breaks when no predicate is installed. */
  setWorldBlockBreakPredicate(predicate?: (block: Block) => boolean): void {
    this.#worldBlockBreakPredicate = predicate;
  }

  /** Maps a collision tag onto a group of sub-level block keys that break together. */
  setSubLevelFragileGroupResolver(
    resolver?: (
      subLevel: ServerSubLevel,
      collisionTag: PhysicsCollisionTag
    ) => readonly string[] | undefined
  ): void {
    this.#fragileGroupResolver = resolver;
  }

  removeSubLevel(subLevelId: number): void {
    this.#clearPendingCollisionState(subLevelId);
    this.#stateBySubLevel.delete(subLevelId);
  }

  #clearPendingCollisionState(subLevelId: number): void {
    this.#pendingSubLevelBlockBreaks.delete(subLevelId);
  }

  handleCollision(event: PhysicsCollisionAfterEvent): string | undefined {
    const indexedWorldSensorHits = getIndexedWorldSensorHits(event);
    if (indexedWorldSensorHits) {
      return this.#handleIndexedWorldSensorCollision(event, indexedWorldSensorHits);
    }
    this.#prepareCollisionCache(event.currentTick);
    const worldHit = this.#queueFragileWorldBlock(event);
    const subLevel = event.body.dimension.getSubLevelById(event.body.id);
    let subLevelHitBlock: SubLevelBlock | undefined;
    if (subLevel) {
      subLevelHitBlock = this.#queueCollidingSubLevelBlock(
        subLevel,
        event.point,
        event.impactSpeed,
        event.collisionTag
      );
      this.#collisionParticles?.handleCollision(
        subLevel,
        event,
        worldHit,
        subLevelHitBlock,
        this.#worldBlocks
      );
    }
    const otherSubLevel = event.otherBody
      ? event.otherBody.dimension.getSubLevelById(event.otherBody.id)
      : undefined;
    if (otherSubLevel) {
      this.#queueCollidingSubLevelBlock(
        otherSubLevel,
        event.point,
        event.impactSpeed,
        event.otherCollisionTag
      );
    }
    const collisionTypeId = worldHit?.typeId ?? subLevelHitBlock?.typeId;
    return collisionTypeId;
  }

  #handleIndexedWorldSensorCollision(
    event: PhysicsCollisionAfterEvent,
    hits: readonly IndexedWorldSensorHit[]
  ): string | undefined {
    this.#prepareCollisionCache(event.currentTick);
    if (hits.length === 0) return undefined;
    let representative = hits[0]!;
    const strongestByCollisionTag = new Map<
      IndexedWorldSensorHit["collisionTag"],
      IndexedWorldSensorHit
    >();
    for (const hit of hits) {
      if (hit.impactSpeed > representative.impactSpeed) representative = hit;
      const previous = strongestByCollisionTag.get(hit.collisionTag);
      if (!previous || hit.impactSpeed > previous.impactSpeed) {
        strongestByCollisionTag.set(hit.collisionTag, hit);
      }
    }

    const physicsDimension = event.body.dimension;
    let worldHit: WorldCollisionHit | undefined;
    for (const hit of hits) {
      const block = this.#getCollisionWorldBlock(
        physicsDimension.dimension,
        hit.worldBlockLocation
      );
      if (!block || block.isAir || block.isLiquid) continue;
      worldHit ??= { locationKey: locationKey(block.location), typeId: block.typeId };
      const threshold = getWorldFragileImpactSpeed(physicsDimension, block);
      if (!Number.isFinite(threshold) || hit.impactSpeed < threshold!) continue;
      this.#queueWorldBlockBreak(physicsDimension, block);
    }

    const subLevel = physicsDimension.getSubLevelById(event.body.id);
    if (!subLevel) return worldHit?.typeId;
    let representativeSubLevelHit: SubLevelBlock | undefined;
    for (const hit of strongestByCollisionTag.values()) {
      const subLevelHit = this.#queueCollidingSubLevelBlock(
        subLevel,
        hit.point,
        hit.impactSpeed,
        hit.collisionTag
      );
      if (hit === representative) representativeSubLevelHit = subLevelHit;
    }

    const collisionTypeId = worldHit?.typeId ?? representativeSubLevelHit?.typeId;
    return collisionTypeId;
  }

  tick(currentTick: number): void {
    this.#prepareCollisionCache(currentTick);
    const activeSubLevels: ServerSubLevel[] = [];
    for (const physicsDimension of this.#physics.getDimensions()) {
      for (const subLevel of physicsDimension.getSubLevels()) {
        if (!subLevel.isValid || !subLevel.body.isActive) continue;
        activeSubLevels.push(subLevel);
      }
    }

    // Resolve all active sub-level probes in one sparse native query per
    // dimension. Post-probe work remains ordered exactly as it was before
    // batching.
    this.#probeSubLevelFragileContacts(activeSubLevels);
    for (const subLevel of activeSubLevels) {
      const removed = this.#flushCollidingSubLevelBlocks(subLevel);
      if (removed) this.removeSubLevel(subLevel.id);
    }
  }

  #queueCollidingSubLevelBlock(
    subLevel: ServerSubLevel,
    point: Vector3,
    impactSpeed: number,
    collisionTag?: PhysicsCollisionTag
  ): SubLevelBlock | undefined {
    if (collisionTag !== undefined) {
      const groupKeys = this.#fragileGroupResolver?.(subLevel, collisionTag);
      if (groupKeys) {
        for (const key of groupKeys) this.#queueSubLevelBlock(subLevel, key);
        return undefined;
      }
    }
    const block = subLevel.getBlockAtWorldPoint(point, SUB_LEVEL_BLOCK_LOOKUP_TOLERANCE);
    if (!block) return undefined;
    const key = locationKey(block.localLocation);
    const fragile = this.#getFragileBlock(subLevel, key);
    if (!fragile || impactSpeed < fragile.fragileImpactSpeed) return block;
    this.#queueSubLevelBlock(subLevel, key);
    return block;
  }

  #queueSubLevelBlock(subLevel: ServerSubLevel, key: string): void {
    let pending = this.#pendingSubLevelBlockBreaks.get(subLevel.id);
    if (!pending) {
      pending = new Set();
      this.#pendingSubLevelBlockBreaks.set(subLevel.id, pending);
    }
    pending.add(key);
  }

  #prepareCollisionCache(currentTick: number): void {
    this.#worldBlocks.prepare(currentTick);
    this.#collisionParticles?.clearEffectKeys();
  }

  #getCollisionWorldBlock(
    dimension: Dimension,
    location: Vector3
  ): Block | undefined {
    return this.#worldBlocks.get(dimension, location);
  }

  #flushCollidingSubLevelBlocks(subLevel: ServerSubLevel): boolean {
    const pending = this.#pendingSubLevelBlockBreaks.get(subLevel.id);
    if (!pending) return false;
    this.#clearPendingCollisionState(subLevel.id);
    const locations = [...pending]
      .map(parseLocationKey)
      .filter(location => subLevel.getBlockAtLocalLocation(location));
    if (locations.length === 0) return false;
    return this.#container.breakBlocksForPhysics(subLevel, locations);
  }

  #probeSubLevelFragileContacts(subLevels: readonly ServerSubLevel[]): void {
    const samples = this.#fragileProbeSampleBuffer;
    samples.length = 0;
    this.#fragileProbeLocationsByDimension.clear();
    for (const subLevel of subLevels) {
      if (!subLevel.body.isActive) continue;
      const state = this.#getState(subLevel);
      if (state.fragileKeys.length === 0) continue;
      this.#collectSubLevelFragileProbes(subLevel, state, samples);
    }

    const blocksByDimension = new Map<Dimension, Map<string, Block>>();
    // The native non-air result is a conservative first level: samples absent
    // from it cannot satisfy either the solid-contact or world-sensor checks.
    // Candidate marks retain original sample order before the unchanged exact
    // shape, speed, current-position and predicted-position decisions run.
    if (this.#fragileProbeCandidateMarks.length < samples.length) {
      this.#fragileProbeCandidateMarks = new Uint8Array(samples.length);
    } else {
      this.#fragileProbeCandidateMarks.fill(0, 0, samples.length);
    }
    const candidateMarks = this.#fragileProbeCandidateMarks;
    let firstCandidateIndex = samples.length;
    let lastCandidateIndex = -1;
    for (const [dimension, locations] of this.#fragileProbeLocationsByDimension) {
      const blocks = readWorldBlockProbeBatch(dimension, [...locations.values()]);
      blocksByDimension.set(dimension, blocks);
      for (const key of blocks.keys()) {
        const location = locations.get(key);
        if (!location) continue;
        candidateMarks[location.firstSampleIndex] = 1;
        firstCandidateIndex = Math.min(firstCandidateIndex, location.firstSampleIndex);
        lastCandidateIndex = Math.max(lastCandidateIndex, location.firstSampleIndex);
        for (const index of location.additionalSampleIndices ?? []) {
          candidateMarks[index] = 1;
          firstCandidateIndex = Math.min(firstCandidateIndex, index);
          lastCandidateIndex = Math.max(lastCandidateIndex, index);
        }
      }
    }
    for (let index = firstCandidateIndex; index <= lastCandidateIndex; index++) {
      if (!candidateMarks[index]) continue;
      const sample = samples[index]!;
      const blocks = blocksByDimension.get(sample.physicsDimension.dimension);
      const block = blocks?.get(sample.blockKey);
      if (block && isSolidWorldBlockPoint(sample.physicsDimension, sample.worldLocation, block)) {
        this.#queueSubLevelBlock(sample.subLevel, locationKey(sample.fragile.localLocation));
      }
      this.#queueFragileWorldBlockAtPoint(sample.physicsDimension, block, sample.speed);
      if (sample.predictedLocation && sample.predictedKey) {
        this.#queueFragileWorldBlockAtPoint(
          sample.physicsDimension,
          blocks?.get(sample.predictedKey),
          sample.speed
        );
      }
    }
    samples.length = 0;
    this.#fragileProbeLocationsByDimension.clear();
  }

  #collectSubLevelFragileProbes(
    subLevel: ServerSubLevel,
    state: SubLevelFragileState,
    samples: SubLevelFragileProbeSample[]
  ): void {
    const keys = state.fragileKeys;
    const cursor = state.cursor;
    const count = Math.min(subLevel.fragileProbeBudget, keys.length);
    for (let offset = 0; offset < count; offset++) {
      const index = (cursor + offset) % keys.length;
      const fragile = this.#getFragileBlock(subLevel, keys[index]!);
      if (!fragile) continue;
      const worldLocation = subLevel.body.localPointToWorld(fragile.localLocation);
      const physicsDimension = subLevel.body.dimension;
      const blockLocation = {
        x: Math.floor(worldLocation.x),
        y: Math.floor(worldLocation.y),
        z: Math.floor(worldLocation.z)
      };
      const velocity = subLevel.body.getVelocityAt(worldLocation);
      const speed = Math.hypot(velocity.x, velocity.y, velocity.z);
      if (fragile.fragileImpactSpeed > 0) {
        if (speed < fragile.fragileImpactSpeed) continue;
      }
      const predictedLocation = {
        x: Math.floor(worldLocation.x + velocity.x / PHYSICS_TICKS_PER_SECOND),
        y: Math.floor(worldLocation.y + velocity.y / PHYSICS_TICKS_PER_SECOND),
        z: Math.floor(worldLocation.z + velocity.z / PHYSICS_TICKS_PER_SECOND)
      };
      const movedToPredictedBlock = (
        predictedLocation.x !== blockLocation.x
        || predictedLocation.y !== blockLocation.y
        || predictedLocation.z !== blockLocation.z
      );
      let locations = this.#fragileProbeLocationsByDimension.get(physicsDimension.dimension);
      if (!locations) {
        locations = new Map();
        this.#fragileProbeLocationsByDimension.set(physicsDimension.dimension, locations);
      }
      const blockKey = locationKey(blockLocation);
      const predictedKey = movedToPredictedBlock ? locationKey(predictedLocation) : undefined;
      const sampleIndex = samples.length;
      addSubLevelFragileProbeLocation(locations, blockKey, blockLocation, sampleIndex);
      if (predictedKey) {
        addSubLevelFragileProbeLocation(
          locations,
          predictedKey,
          predictedLocation,
          sampleIndex
        );
      }
      samples.push({
        blockKey,
        fragile,
        physicsDimension,
        predictedKey,
        predictedLocation: movedToPredictedBlock ? predictedLocation : undefined,
        speed,
        subLevel,
        worldLocation
      });
    }
    state.cursor = keys.length === 0 ? 0 : (cursor + count) % keys.length;
  }

  #queueFragileWorldBlock(event: PhysicsCollisionAfterEvent): WorldCollisionHit | undefined {
    if (event.otherBody) return undefined;
    const physicsDimension = event.body.dimension;
    const dimension = physicsDimension.dimension;
    let worldHit: WorldCollisionHit | undefined;
    const candidates = worldContactCandidates(event.point, event.normal);
    for (const location of candidates) {
      const block = this.#getCollisionWorldBlock(dimension, location);
      if (!block) continue;
      if (!worldHit && !block.isAir && !block.isLiquid) {
        worldHit = { locationKey: locationKey(block.location), typeId: block.typeId };
      }
      const threshold = getWorldFragileImpactSpeed(physicsDimension, block);
      if (!Number.isFinite(threshold) || event.impactSpeed < threshold!) continue;
      this.#queueWorldBlockBreak(physicsDimension, block);
      return worldHit;
    }
    return worldHit;
  }

  #queueWorldBlockBreak(physicsDimension: SubLevelPhysicsDimension, block: Block): void {
    if (!this.#canBreakWorldBlock(block)) return;
    const dimension = physicsDimension.dimension;
    const location = { ...block.location };
    const key = `${dimension.id}|${locationKey(location)}`;
    if (this.#pendingWorldBreaks.has(key)) return;
    this.#pendingWorldBreaks.add(key);
    const expectedTypeId = block.typeId;
    system.run(() => {
      this.#pendingWorldBreaks.delete(key);
      const current = safeGetBlock(dimension, location);
      if (
        !current
        || current.typeId !== expectedTypeId
        || !this.#canBreakWorldBlock(current)
      ) return;
      if (breakWorldBlock(current)) {
        this.#notifyWorldBlocksChanged(dimension, [location]);
      }
    });
  }

  #notifyWorldBlocksChanged(dimension: Dimension, locations: readonly Vector3[]): void {
    if (locations.length === 0) return;
    try {
      this.#physics.handleWorldBlockChange(dimension, locations);
    } catch {
      // Cache invalidation must not change break transactions.
    }
  }

  #queueFragileWorldBlockAtPoint(
    physicsDimension: SubLevelPhysicsDimension,
    block: Block | undefined,
    impactSpeed: number
  ): void {
    if (
      !block
      || block.isAir
      || block.isLiquid
      || !physicsDimension.isWorldBlockSensor(block)
    ) return;
    const threshold = getWorldFragileImpactSpeed(physicsDimension, block);
    if (!Number.isFinite(threshold) || impactSpeed < threshold!) return;
    this.#queueWorldBlockBreak(physicsDimension, block);
  }

  #canBreakWorldBlock(block: Block): boolean {
    const predicate = this.#worldBlockBreakPredicate;
    if (!predicate) return true;
    try {
      return predicate(block);
    } catch {
      return false;
    }
  }

  #getState(subLevel: ServerSubLevel): SubLevelFragileState {
    let state = this.#stateBySubLevel.get(subLevel.id);
    if (!state) {
      state = { revision: -1, fragileKeys: [], fragileBlocks: new Map(), cursor: 0 };
      this.#stateBySubLevel.set(subLevel.id, state);
    }
    if (subLevel.contentRevision !== state.revision) {
      const fragileBlocks = new Map<string, FragileBlock>();
      for (const block of subLevel.blocks) {
        const fragileImpactSpeed = getSubLevelFragileImpactSpeed(block);
        if (fragileImpactSpeed === undefined) continue;
        fragileBlocks.set(locationKey(block.localLocation), {
          fragileImpactSpeed,
          localLocation: block.localLocation,
          block
        });
      }
      const keys = [...fragileBlocks.keys()];
      state.revision = subLevel.contentRevision;
      state.fragileBlocks = fragileBlocks;
      state.fragileKeys = keys;
      state.cursor = keys.length === 0 ? 0 : state.cursor % keys.length;
    }
    return state;
  }

  #getFragileBlock(subLevel: ServerSubLevel, key: string): FragileBlock | undefined {
    return this.#getState(subLevel).fragileBlocks.get(key);
  }
}

function isSolidWorldBlockPoint(
  physicsDimension: SubLevelPhysicsDimension,
  point: Vector3,
  block: Block
): boolean {
  if (block.isAir || block.isLiquid) return false;
  const location = block.location;
  const configured = physicsDimension.getBlockProperties(block).collisionShape;
  if (configured === "none") return false;
  if (configured === "full") return true;
  const local = { x: point.x - location.x, y: point.y - location.y, z: point.z - location.z };
  if (configured) {
    return configured.some(box => pointInBox(local, box.min, box.max));
  }
  const shape = resolveBlockCollisionShape(block);
  const shapeKind = shape.kind;
  if (shapeKind === "none") return false;
  if (shapeKind === "full") return true;
  return shape.shapes.some(box => pointInBox(
    local,
    { x: box.minX, y: box.minY, z: box.minZ },
    { x: box.maxX, y: box.maxY, z: box.maxZ }
  ));
}

function breakWorldBlock(block: Block): boolean {
  const { x, y, z } = block.location;
  try {
    block.dimension.runCommand(`setblock ${x} ${y} ${z} minecraft:air destroy`);
    return true;
  } catch {
    // A failed native destroy keeps the world unchanged.
    return false;
  }
}

function worldContactCandidates(point: Vector3, normal: Vector3): Vector3[] {
  const candidates = new Map<string, Vector3>();
  for (const scale of WORLD_CONTACT_PROBE_SCALES) {
    const location = {
      x: Math.floor(point.x + normal.x * scale),
      y: Math.floor(point.y + normal.y * scale),
      z: Math.floor(point.z + normal.z * scale)
    };
    candidates.set(locationKey(location), location);
  }
  return [...candidates.values()];
}

function getSubLevelFragileImpactSpeed(block: SubLevelBlock): number | undefined {
  const threshold = BLOCK_PHYSICS_PROPERTIES[block.typeId]?.fragileImpactSpeed;
  return Number.isFinite(threshold) ? Math.max(0, threshold!) : undefined;
}

function getWorldFragileImpactSpeed(
  physicsDimension: SubLevelPhysicsDimension,
  block: Block
): number | undefined {
  const configured = physicsDimension.getBlockProperties(block).fragileImpactSpeed;
  if (Number.isFinite(configured)) return configured;
  return physicsDimension.isWorldBlockSensor(block) ? 0 : undefined;
}

function pointInBox(point: Vector3, min: Vector3, max: Vector3): boolean {
  return point.x >= min.x && point.x <= max.x
    && point.y >= min.y && point.y <= max.y
    && point.z >= min.z && point.z <= max.z;
}

function addSubLevelFragileProbeLocation(
  locations: Map<string, SubLevelFragileProbeLocation>,
  key: string,
  location: Vector3,
  sampleIndex: number
): void {
  const existing = locations.get(key);
  if (existing) {
    (existing.additionalSampleIndices ??= []).push(sampleIndex);
    return;
  }
  locations.set(key, { ...location, firstSampleIndex: sampleIndex });
}
