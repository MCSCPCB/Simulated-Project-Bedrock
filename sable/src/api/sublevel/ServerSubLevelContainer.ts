// The server-side sub-level container: creates sub-levels from world regions,
// tracks them, and implements the default vanilla-block edit pipeline (break,
// place, effects) over the migrated interaction modules. This is the assembly
// the source project performed in its lifecycle controller, with the physics
// and tree-gameplay stages removed. The pipeline is block-agnostic: everything
// block-specific reaches it through the behavior registry.
import {
  BlockPermutation,
  system,
  world,
  type Block,
  type Dimension,
  type Entity,
  type ItemStack,
  type Player,
  type Vector3
} from "@minecraft/server";
import {
  captureSubLevelBlocks,
  resolveSubLevelBlockRotation,
  resolveSubLevelBlockVisualOffset,
  resolveSubLevelBlockVisualYOffset,
  usesFrontFacingDirectionStateMapping
} from "../SubLevelAssemblyHelper.js";
import { captureSubLevelFoliageTint } from "../../render/dynamic_biome/DynamicBiomeTintSampler.js";
import type { SubLevel, SubLevelBlock } from "../../sublevel/SubLevel.js";
import type { SubLevelBlockFace } from "../../content/raycast/SubLevelGridRaycast.js";
import type { SubLevelRenderData } from "../../sublevel/render/SubLevelRenderData.js";
import { SubLevelRenderer } from "../../sublevel/render/SubLevelRenderer.js";
import {
  SubLevelInteractionSystem,
  type SubLevelInteractionHandle
} from "../../sublevel/system/SubLevelInteractionSystem.js";
import {
  resolveSubLevelBlockSupport,
  type SubLevelBlockSupportEntry
} from "../../content/block_properties/SubLevelBlockSupport.js";
import {
  resolveVanillaBlockBreakSound,
  resolveVanillaBlockHitSound,
  resolveVanillaBlockPlaceSound
} from "../../content/sublevel_sounds/SubLevelBlockSounds.js";
import {
  BLOCK_BREAK_PARTICLE_PROFILE,
  BLOCK_HIT_PARTICLE_PROFILE,
  spawnSubLevelBlockDestructParticle
} from "../../content/particle/SubLevelBlockParticles.js";
import {
  getSubLevelBlockRegistration,
  resolveFancySubLevelBlock
} from "../../sublevel/render/fancy/model/FancySubLevelModelRegistry.js";
import {
  blockLocationKey,
  parseBlockLocationKey
} from "../../util/SableVector3Utils.js";
import type { SubLevelBlockBehaviorRegistry } from "../block/SubLevelBlockBehaviors.js";
import type { SubLevelContainerInteractionController } from "../../content/assembly/SubLevelContainerInteraction.js";
import { SubLevelStorage } from "../../sublevel/storage/serialization/SubLevelStorage.js";
import type { SerializedSubLevelStructure } from "../../sublevel/storage/serialization/SubLevelData.js";
import type { SubLevelRemovalReason } from "../../sublevel/storage/SubLevelRemovalReason.js";

/** Region guard for entity budgets; larger captures need explicit staging. */
const MAX_REGION_VOLUME = 4096;

export interface CreateSubLevelFromRegionOptions {
  /** Remove the source world blocks after capture. Defaults to true. */
  readonly removeWorldBlocks?: boolean;
}

export interface ManagedSubLevel {
  readonly id: string;
  readonly handle: SubLevelInteractionHandle;
  readonly blockCount: number;
  readonly entityCount: number;
  remove(): void;
}

interface ManagedSubLevelRecord {
  readonly id: string;
  subLevel: SubLevel;
  readonly handle: SubLevelInteractionHandle;
  readonly origin: Vector3;
  renderData: SubLevelRenderData;
  removed: boolean;
  invalidateBody(): void;
}

/** Tracks every live sub-level and runs the default edit pipeline over them. */
export class ServerSubLevelContainer {
  readonly #interactionSystem: SubLevelInteractionSystem;
  readonly #blockBehaviors: SubLevelBlockBehaviorRegistry;
  readonly #containers: SubLevelContainerInteractionController;
  readonly #storage: SubLevelStorage;
  readonly #recordsByHandleId = new Map<number, ManagedSubLevelRecord>();
  #nextSubLevelId = 1;
  #initialized = false;
  readonly #pendingRestores = new Map<string, SerializedSubLevelStructure>();

  constructor(
    interactionSystem: SubLevelInteractionSystem,
    blockBehaviors: SubLevelBlockBehaviorRegistry,
    containers: SubLevelContainerInteractionController,
    storage = new SubLevelStorage()
  ) {
    this.#interactionSystem = interactionSystem;
    this.#blockBehaviors = blockBehaviors;
    this.#containers = containers;
    this.#storage = storage;
  }

  initialize(): void {
    if (this.#initialized) return;
    this.#initialized = true;
    for (const id of this.#storage.listSubLevelIds()) {
      this.#advanceNextSubLevelId(id);
      try {
        const saved = this.#storage.loadSubLevel(id);
        if (!saved) throw new Error(`Stored sub-level manifest entry ${id} has no structure record.`);
        this.#containers.registerSavedBindings(saved.id, saved.containerStorages);
        this.#pendingRestores.set(saved.id, saved);
      } catch (error) {
        console.warn(`Could not load sub-level ${id}: ${error}`);
      }
    }
  }

  handleVisualEntityLoad(entity: Entity): void {
    if (entity.typeId !== "sable:block" && entity.typeId !== "sable:block_carrier"
      && !entity.typeId.startsWith("sable:fancy_model_")
      && !entity.typeId.startsWith("sable:fancy_pool_")) return;
    system.run(() => {
      if (!entity.isValid || this.#interactionSystem.isVisualEntity(entity.dimension.id, entity.id)) return;
      entity.remove();
    });
  }

  tick(currentTick: number): void {
    if (currentTick % 20 !== 0) return;
    for (const [id, saved] of this.#pendingRestores) {
      try {
        const dimension = world.getDimension(saved.dimensionId);
        if (!isSubLevelRegionLoaded(dimension, saved.origin, saved.blocks)) continue;
        this.#restoreSubLevel(saved);
        this.#pendingRestores.delete(id);
      } catch (error) {
        console.warn(`Could not restore sub-level ${id}: ${error}`);
      }
    }
    for (const record of [...this.#recordsByHandleId.values()]) {
      if (record.removed || !record.handle.isValid) continue;
      // Unloaded chunks invalidate entity handles without losing the entities;
      // integrity only means anything while the projection region is loaded.
      if (!isRecordRegionLoaded(record)) continue;
      if (!record.renderData.hasKnownIntegrityFailure() && record.renderData.hasIntactEntities()) continue;
      // Externally removed projection entities are terminal for the current
      // render; the block record stays authoritative, so rebuild the
      // projection in place and carry the surviving storage riders over.
      this.#saveRecord(record);
      this.#recreateRender(record, record.handle.blocks);
    }
  }

  handleContainerNativeDeath(
    ownerId: string,
    binding: import("../../content/assembly/SubLevelContainerInteraction.js").SubLevelContainerStorageBinding
  ): void {
    const record = this.#findRecord(ownerId);
    if (record) {
      const bindings = this.#containerBindings(record)
        .filter(entry => entry.storageId !== binding.storageId);
      this.#saveRecord(record, bindings);
      return;
    }
    const saved = this.#storage.loadSubLevel(ownerId);
    if (!saved) throw new Error(`Native death storage ${binding.storageId} has no sub-level owner ${ownerId}.`);
    const bindings = saved.containerStorages.filter(entry => entry.storageId !== binding.storageId);
    if (!this.#storage.saveSubLevel(ownerId, { ...saved, containerStorages: bindings })) {
      throw new Error(`Could not persist native death of storage ${binding.storageId}.`);
    }
  }

  handleContainerUnexpectedRemoval(
    ownerId: string,
    _binding: import("../../content/assembly/SubLevelContainerInteraction.js").SubLevelContainerStorageBinding
  ): void {
    const record = this.#findRecord(ownerId);
    if (record) {
      this.#saveRecord(record);
      this.#destroyRecord(record, "unexpected");
      return;
    }
    const saved = this.#storage.loadSubLevel(ownerId);
    if (!saved) throw new Error(`Unexpected storage removal has no sub-level owner ${ownerId}.`);
    if (!this.#storage.saveSubLevel(ownerId, saved)) {
      throw new Error(`Could not persist unexpected removal of sub-level ${ownerId}.`);
    }
  }

  /**
   * Captures a loaded world region into an entity-projected sub-level: full
   * permutation states, the biome foliage climate field, and per-block world
   * state (via the behavior registry) all transfer without any per-call
   * registration work.
   */
  createSubLevelFromRegion(
    dimension: Dimension,
    from: Vector3,
    to: Vector3,
    options?: CreateSubLevelFromRegionOptions
  ): ManagedSubLevel {
    this.initialize();
    const minimum = {
      x: Math.min(Math.floor(from.x), Math.floor(to.x)),
      y: Math.min(Math.floor(from.y), Math.floor(to.y)),
      z: Math.min(Math.floor(from.z), Math.floor(to.z))
    };
    const maximum = {
      x: Math.max(Math.floor(from.x), Math.floor(to.x)),
      y: Math.max(Math.floor(from.y), Math.floor(to.y)),
      z: Math.max(Math.floor(from.z), Math.floor(to.z))
    };
    const volume = (maximum.x - minimum.x + 1)
      * (maximum.y - minimum.y + 1)
      * (maximum.z - minimum.z + 1);
    if (!Number.isSafeInteger(volume) || volume <= 0 || volume > MAX_REGION_VOLUME) {
      throw new RangeError(`Sub-level region spans ${volume} cells; the limit is ${MAX_REGION_VOLUME}.`);
    }

    const worldBlocks: Block[] = [];
    for (let y = minimum.y; y <= maximum.y; y++) {
      for (let z = minimum.z; z <= maximum.z; z++) {
        for (let x = minimum.x; x <= maximum.x; x++) {
          const block = dimension.getBlock({ x, y, z });
          if (!block) throw new Error(`Selected block is unavailable at ${x},${y},${z}.`);
          worldBlocks.push(block);
        }
      }
    }
    const origin = { ...minimum };
    const captured = captureSubLevelBlocks(worldBlocks, origin);
    if (captured.length === 0) {
      throw new Error("The selected region contains no capturable blocks.");
    }
    const foliageTint = captureSubLevelFoliageTint(dimension, captured, origin);
    const worldData = this.#captureWorldData(dimension, captured, origin);
    const managed = this.createSubLevel(dimension, origin, captured, foliageTint, worldData);
    if (options?.removeWorldBlocks === false) return managed;
    // Supported blocks leave first, then foliage, then structural blocks.
    const removals = [...captured].sort((left, right) => (
      sourceRemovalOrder(left) - sourceRemovalOrder(right)
      || left.localLocation.y - right.localLocation.y
    ));
    const removed: SubLevelBlock[] = [];
    try {
      for (const snapshot of removals) {
        const block = dimension.getBlock(sourceLocation(origin, snapshot.localLocation));
        if (!block?.isValid) throw new Error("A selected block became unavailable during capture.");
        removed.push(snapshot);
        block.setType("minecraft:air");
      }
      return managed;
    } catch (error) {
      for (const snapshot of [...removed].reverse()) {
        const block = dimension.getBlock(sourceLocation(origin, snapshot.localLocation));
        if (!block) continue;
        block.setPermutation(BlockPermutation.resolve(snapshot.typeId, { ...snapshot.states }));
        const items = worldData.get(blockLocationKey(snapshot.localLocation));
        const inventory = block.getComponent("minecraft:inventory")?.container;
        if (inventory && Array.isArray(items)) {
          for (let slot = 0; slot < Math.min(inventory.size, items.length); slot++) {
            inventory.setItem(slot, items[slot]);
          }
        }
      }
      const record = this.#recordsByHandleId.get(managed.handle.id)!;
      this.#storage.deleteSubLevel(record.id);
      this.#discardUncommittedRecord(record);
      throw error;
    }
  }

  /** Assembles, renders, and registers one sub-level from captured blocks. */
  createSubLevel(
    dimension: Dimension,
    origin: Vector3,
    blocks: readonly SubLevelBlock[],
    foliageTint?: SubLevel["foliageTint"],
    worldData?: ReadonlyMap<string, unknown>
  ): ManagedSubLevel {
    this.initialize();
    const id = `region_${this.#nextSubLevelId++}`;
    const anchoredFoliageTint = foliageTint
      ?? captureSubLevelFoliageTint(dimension, blocks, origin);
    const record = this.#createRuntimeRecord(id, dimension, origin, blocks, anchoredFoliageTint);
    const handle = record.handle;
    this.#recordsByHandleId.set(handle.id, record);
    try {
      for (const block of blocks) {
        this.#blockBehaviors.get(block.typeId)?.onBlockAdded?.({
          block,
          dimension,
          handle,
          ownerId: id,
          worldData: worldData?.get(blockLocationKey(block.localLocation))
        });
      }
      this.#saveRecord(record);
    } catch (error) {
      this.#discardUncommittedRecord(record);
      throw error;
    }
    const container = this;
    return {
      id,
      handle,
      get blockCount() { return handle.blocks.length; },
      get entityCount() { return record.renderData.entityCount; },
      remove() { container.#removeManagedSubLevel(record); }
    };
  }

  /** The default break pipeline: support cascade, effects, loot, block behaviors. */
  breakBlockForPlayerEdit(
    _player: Player,
    itemStack: ItemStack | undefined,
    handle: SubLevelInteractionHandle,
    block: SubLevelBlock
  ): boolean {
    this.initialize();
    const record = this.#recordsByHandleId.get(handle.id);
    if (!record || record.removed || !handle.isValid) return false;
    const current = handle.getBlockAtLocalLocation(block.localLocation);
    if (!current || current.typeId !== block.typeId) return false;

    const targetKey = blockLocationKey(block.localLocation);
    const entries: SubLevelBlockSupportEntry[] = handle.blocks.map(entry => ({
      key: blockLocationKey(entry.localLocation),
      localLocation: entry.localLocation,
      snapshot: entry
    }));
    const support = resolveSubLevelBlockSupport(entries, new Set([targetKey]));
    const removedLocations = [
      { ...block.localLocation },
      ...[...support.unsupportedKeys].map(parseBlockLocationKey)
    ];
    const previousBlocks = [...handle.blocks];
    const previousBindings = this.#containerBindings(record);
    const removedKeys = new Set(removedLocations.map(blockLocationKey));
    const removedBlocks = [current, ...previousBlocks.filter(entry => (
      blockLocationKey(entry.localLocation) !== targetKey
      && removedKeys.has(blockLocationKey(entry.localLocation))
    ))];
    if (removedBlocks.length === 0) return false;
    const remaining = previousBlocks.filter(entry => !removedKeys.has(blockLocationKey(entry.localLocation)))
      .map(entry => support.stateUpdates.get(blockLocationKey(entry.localLocation))?.snapshot ?? entry);
    const bindings = previousBindings.filter(entry => !removedKeys.has(blockLocationKey(entry.localLocation)));
    if (remaining.length > 0) this.#saveRecord(record, bindings, remaining);
    else if (!this.#storage.deleteSubLevel(record.id)) {
      throw new Error(`Could not delete naturally emptied sub-level ${record.id}.`);
    }
    try {
      handle.removeBlocksAtLocalLocations(removedLocations);
      if (support.stateUpdates.size > 0) this.#applyStateUpdates(record, support.stateUpdates);
    } catch (error) {
      handle.resetBlocks(previousBlocks);
      this.#saveRecord(record, previousBindings, previousBlocks);
      this.#recreateRender(record, previousBlocks);
      throw error;
    }

    const dimension = handle.dimension;
    for (const [index, removedBlock] of removedBlocks.entries()) {
      const position = handle.localPointToWorld(removedBlock.localLocation);
      spawnSubLevelBlockDestructParticle(
        dimension,
        position,
        removedBlock,
        record.subLevel.foliageTint,
        BLOCK_BREAK_PARTICLE_PROFILE
      );
      spawnBlockDrops(dimension, removedBlock, position, index === 0 ? itemStack : undefined);
      this.#blockBehaviors.get(removedBlock.typeId)?.onBlockRemoved?.({
        block: removedBlock,
        dimension,
        handle,
        ownerId: record.id
      });
    }
    const targetPosition = handle.localPointToWorld(block.localLocation);
    const sound = resolveVanillaBlockBreakSound(block.typeId);
    dimension.playSound(sound.sound, targetPosition, { pitch: sound.pitch, volume: sound.volume });

    if (handle.blocks.length === 0) this.#destroyRecord(record, "natural");
    return true;
  }

  /** Emits one vanilla-style mining beat for a projected block. */
  emitBlockMiningEffects(handle: SubLevelInteractionHandle, block: SubLevelBlock): void {
    const record = this.#recordsByHandleId.get(handle.id);
    if (!record || record.removed) return;
    const dimension = handle.dimension;
    const position = handle.localPointToWorld(block.localLocation);
    spawnSubLevelBlockDestructParticle(
      dimension,
      position,
      block,
      record.subLevel.foliageTint,
      BLOCK_HIT_PARTICLE_PROFILE
    );
    const sound = resolveVanillaBlockHitSound(block.typeId);
    dimension.playSound(sound.sound, position, { pitch: sound.pitch, volume: sound.volume });
  }

  /** The default place pipeline: placeable registrations only, behaviors included. */
  placeBlockForPlayerEdit(
    player: Player,
    itemStack: ItemStack,
    handle: SubLevelInteractionHandle,
    _supportBlock: SubLevelBlock,
    placement: Vector3,
    cardinalDirection: "north" | "east" | "south" | "west",
    placementFace?: SubLevelBlockFace
  ): boolean {
    this.initialize();
    const record = this.#recordsByHandleId.get(handle.id);
    if (!record || record.removed || !handle.isValid) return false;
    if (getSubLevelBlockRegistration(itemStack.typeId)?.placeable === false) return false;
    if (handle.getBlockAtLocalLocation(placement)) return false;
    const placed = buildPlacedBlock(
      player,
      itemStack.typeId,
      placement,
      cardinalDirection,
      placementFace
    );
    if (!placed) return false;

    const previousBlocks = [...handle.blocks];
    const previousBindings = new Set(
      this.#containerBindings(record).map(binding => binding.storageId)
    );
    try {
      if (!resolveFancySubLevelBlock(placed) || !handle.addBlock(placed)) {
        const blocks = [...handle.blocks, placed];
        record.subLevel = {
          ...record.subLevel,
          blocks
        };
        this.#recreateRender(record, blocks);
        handle.resetBlocks(blocks);
      }
      this.#blockBehaviors.get(placed.typeId)?.onBlockAdded?.({
        block: placed,
        dimension: handle.dimension,
        handle,
        ownerId: record.id
      });
      this.#saveRecord(record);
      return true;
    } catch (error) {
      for (const binding of this.#containerBindings(record)) {
        if (!previousBindings.has(binding.storageId)) {
          this.#containers.discardStorage(binding.storageId);
        }
      }
      handle.resetBlocks(previousBlocks);
      this.#recreateRender(record, previousBlocks);
      this.#saveRecord(record);
      throw error;
    }
  }

  /** Emits the vanilla block-place sound after a projected edit commits. */
  emitBlockPlacementEffects(handle: SubLevelInteractionHandle, block: SubLevelBlock): void {
    const dimension = handle.dimension;
    const position = handle.localPointToWorld(block.localLocation);
    const sound = resolveVanillaBlockPlaceSound(block.typeId);
    dimension.playSound(sound.sound, position, { pitch: sound.pitch, volume: sound.volume });
  }

  /** Behavior-declared world reads that must precede source block removal. */
  #captureWorldData(
    dimension: Dimension,
    blocks: readonly SubLevelBlock[],
    origin: Vector3
  ): Map<string, unknown> {
    const worldData = new Map<string, unknown>();
    for (const block of blocks) {
      const behavior = this.#blockBehaviors.get(block.typeId);
      if (!behavior?.captureWorldData) continue;
      const data = behavior.captureWorldData({
        block,
        dimension,
        worldLocation: {
          x: origin.x + block.localLocation.x,
          y: origin.y + block.localLocation.y,
          z: origin.z + block.localLocation.z
        }
      });
      if (data !== undefined) worldData.set(blockLocationKey(block.localLocation), data);
    }
    return worldData;
  }

  /** State rewrites (vine bits, moss tips) re-project the affected blocks. */
  #applyStateUpdates(
    record: ManagedSubLevelRecord,
    stateUpdates: ReadonlyMap<string, { readonly snapshot: SubLevelBlock }>
  ): void {
    const handle = record.handle;
    const blocks = handle.blocks.map(block => (
      stateUpdates.get(blockLocationKey(block.localLocation))?.snapshot ?? block
    ));
    const renderData = record.renderData;
    if (renderData.supportsBlockAddition === true && renderData.addBlocks) {
      const updatedKeys = new Set(stateUpdates.keys());
      renderData.removeBlocks(updatedKeys);
      renderData.addBlocks([...stateUpdates.values()].map(update => update.snapshot));
    } else {
      this.#recreateRender(record, blocks);
    }
    handle.resetBlocks(blocks);
  }

  #recreateRender(record: ManagedSubLevelRecord, blocks: readonly SubLevelBlock[]): void {
    const previous = record.renderData;
    const next = SubLevelRenderer.createRenderData({
      ...record.subLevel,
      blocks
    });
    try {
      previous.transferPersistentRidersTo?.(next);
    } catch (error) {
      // A failed transfer leaves the uncommitted projection unusable.
      next.remove();
      throw error;
    }
    record.renderData = next;
    previous.remove();
    record.handle.markContentChanged();
    this.#containers.refreshModelStates(record.handle);
    // Client pose release and renderer replacement must agree on the lid state.
    system.run(() => {
      if (!record.removed && record.renderData === next) this.#containers.refreshModelStates(record.handle);
    });
  }

  #removeManagedSubLevel(record: ManagedSubLevelRecord): void {
    if (record.removed) return;
    this.#saveRecord(record);
    this.#destroyRecord(record, "planned");
  }

  #destroyRecord(record: ManagedSubLevelRecord, reason: SubLevelRemovalReason): void {
    if (record.removed) return;
    for (const behavior of this.#blockBehaviors.behaviors()) {
      behavior.onSubLevelRemoved?.(record.id, record.handle, reason);
    }
    if (reason !== "natural") {
      this.#containers.unbindSubLevel(record.id, record.handle);
    }
    record.removed = true;
    this.#recordsByHandleId.delete(record.handle?.id ?? -1);
    record.renderData.remove();
    record.handle?.unregister();
    record.invalidateBody();
  }

  #createRuntimeRecord(
    id: string,
    dimension: Dimension,
    origin: Vector3,
    blocks: readonly SubLevelBlock[],
    foliageTint?: SubLevel["foliageTint"]
  ): ManagedSubLevelRecord {
    let removed = false;
    // Static pose: integer locals address world cell centers at origin + 0.5.
    const body = {
      get isValid() { return !removed; },
      getRotation: () => ({ x: 0, y: 0, z: 0 }),
      localPointToWorld: (local: Vector3): Vector3 => ({
        x: origin.x + local.x + 0.5,
        y: origin.y + local.y + 0.5,
        z: origin.z + local.z + 0.5
      })
    };
    const worldPointToLocal = (point: Vector3): Vector3 => ({
      x: point.x - origin.x - 0.5,
      y: point.y - origin.y - 0.5,
      z: point.z - origin.z - 0.5
    });
    const subLevel: SubLevel = { body, blocks, dimension, foliageTint };
    const renderData = SubLevelRenderer.createRenderData(subLevel);
    const record = {
      id,
      subLevel,
      handle: undefined as unknown as SubLevelInteractionHandle,
      origin: { ...origin },
      renderData,
      removed: false,
      invalidateBody: () => { removed = true; }
    };
    try {
      const handle = this.#interactionSystem.register(subLevel, {
        worldPointToLocal,
        get renderData() { return record.renderData; }
      });
      record.handle = handle;
      return record;
    } catch (error) {
      renderData.remove();
      removed = true;
      throw error;
    }
  }

  #restoreSubLevel(saved: SerializedSubLevelStructure): void {
    const record = this.#createRuntimeRecord(
      saved.id,
      world.getDimension(saved.dimensionId),
      saved.origin,
      saved.blocks,
      saved.foliageTint
        ?? captureSubLevelFoliageTint(world.getDimension(saved.dimensionId), saved.blocks, saved.origin)
    );
    this.#recordsByHandleId.set(record.handle.id, record);
    try {
      this.#containers.bindSubLevel(saved.id, record.handle, saved.containerStorages);
    } catch (error) {
      this.#destroyRecord(record, "unexpected");
      throw error;
    }
  }

  #saveRecord(
    record: ManagedSubLevelRecord,
    containerStorages = this.#containerBindings(record),
    blocks = record.handle.blocks
  ): void {
    if (!this.#storage.saveSubLevel(record.id, {
      blocks: [...blocks],
      containerStorages,
      dimensionId: record.handle.dimension.id,
      foliageTint: record.subLevel.foliageTint,
      origin: record.origin
    })) {
      throw new Error(`Could not persist sub-level ${record.id}.`);
    }
  }

  #findRecord(ownerId: string): ManagedSubLevelRecord | undefined {
    return [...this.#recordsByHandleId.values()].find(record => record.id === ownerId);
  }

  #containerBindings(record: ManagedSubLevelRecord) {
    return this.#containers.getBindings(record.id);
  }

  #advanceNextSubLevelId(id: string): void {
    const match = /^region_(\d+)$/.exec(id);
    if (!match) return;
    this.#nextSubLevelId = Math.max(this.#nextSubLevelId, Number(match[1]) + 1);
  }

  #discardUncommittedRecord(record: ManagedSubLevelRecord): void {
    for (const binding of this.#containerBindings(record)) {
      this.#containers.discardStorage(binding.storageId);
    }
    this.#destroyRecord(record, "unexpected");
  }
}

function isRecordRegionLoaded(record: ManagedSubLevelRecord): boolean {
  return isSubLevelRegionLoaded(record.handle.dimension, record.origin, record.handle.blocks);
}

function isSubLevelRegionLoaded(dimension: Dimension, origin: Vector3, blocks: readonly SubLevelBlock[]): boolean {
  try {
    const chunks = new Set<string>();
    for (const block of blocks) {
      const location = sourceLocation(origin, block.localLocation);
      const chunk = `${Math.floor(location.x / 16)},${Math.floor(location.z / 16)}`;
      if (chunks.has(chunk)) continue;
      if (!dimension.getBlock(location)) return false;
      chunks.add(chunk);
    }
    return true;
  } catch {
    return false;
  }
}

function sourceLocation(origin: Vector3, local: Vector3): Vector3 {
  return { x: origin.x + local.x, y: origin.y + local.y, z: origin.z + local.z };
}

function sourceRemovalOrder(block: SubLevelBlock): number {
  const registration = getSubLevelBlockRegistration(block.typeId);
  return registration?.support ? 0 : registration?.category === "nature/leaves" ? 1 : 2;
}

function buildPlacedBlock(
  _player: Player,
  typeId: string,
  placement: Vector3,
  cardinalDirection: "north" | "east" | "south" | "west",
  placementFace?: SubLevelBlockFace
): SubLevelBlock | undefined {
  let states: Record<string, boolean | number | string>;
  try {
    states = { ...BlockPermutation.resolve(typeId).getAllStates() };
  } catch {
    return undefined;
  }
  // This is a shared placement convention, not an item-model correction.
  // Keep identical state contracts independent of block ids and name suffixes.
  const orientationState = states["minecraft:orientation"] !== undefined
    ? "minecraft:orientation"
    : states.orientation !== undefined ? "orientation" : undefined;
  if (orientationState) {
    states[orientationState] = resolvePlacedOrientation(cardinalDirection, placementFace);
  }
  if (states["minecraft:cardinal_direction"] !== undefined) {
    states["minecraft:cardinal_direction"] = resolvePlacedCardinalDirection(typeId, cardinalDirection);
  } else if (states.cardinal_direction !== undefined) {
    states.cardinal_direction = resolvePlacedCardinalDirection(typeId, cardinalDirection);
  }
  const directionState = states["minecraft:direction"] !== undefined
    ? "minecraft:direction"
    : states.direction !== undefined ? "direction" : undefined;
  if (directionState) {
    const direction = resolvePlacedDirection(typeId, states, cardinalDirection, placementFace);
    if (direction !== undefined) states[directionState] = direction;
  }
  const facingState = states["minecraft:facing_direction"] !== undefined
    ? "minecraft:facing_direction"
    : states.facing_direction !== undefined ? "facing_direction" : undefined;
  if (facingState) {
    const facing = placementFace ? facingDirectionForFace(placementFace) : facingDirectionForCardinal(cardinalDirection);
    if (facing !== undefined) states[facingState] = facing;
  }
  const stairDirectionState = states["minecraft:weirdo_direction"] !== undefined
    ? "minecraft:weirdo_direction"
    : states.weirdo_direction !== undefined ? "weirdo_direction" : undefined;
  if (stairDirectionState) states[stairDirectionState] = directionForCardinal(cardinalDirection);
  const upsideDownState = states["minecraft:upside_down_bit"] !== undefined
    ? "minecraft:upside_down_bit"
    : states.upside_down_bit !== undefined ? "upside_down_bit" : undefined;
  if (upsideDownState && placementFace) states[upsideDownState] = placementFace === "down";
  const verticalHalfState = states["minecraft:vertical_half"] !== undefined
    ? "minecraft:vertical_half"
    : states.vertical_half !== undefined ? "vertical_half" : undefined;
  if (verticalHalfState && placementFace) states[verticalHalfState] = placementFace === "down" ? "top" : "bottom";
  const axisState = states["minecraft:pillar_axis"] !== undefined
    ? "minecraft:pillar_axis"
    : states.pillar_axis !== undefined ? "pillar_axis" : undefined;
  if (axisState && placementFace) {
    states[axisState] = placementFace === "east" || placementFace === "west"
      ? "x"
      : placementFace === "north" || placementFace === "south" ? "z" : "y";
  }
  const rotation = resolveSubLevelBlockRotation(typeId, states);
  const visualYOffset = resolveSubLevelBlockVisualYOffset(typeId, states);
  const visualOffset = resolveSubLevelBlockVisualOffset(typeId, states);
  return {
    localLocation: { ...placement },
    states,
    typeId,
    ...(rotation ? { rotation } : {}),
    ...(visualYOffset !== 0 ? { visualYOffset } : {}),
    ...(visualOffset ? { visualOffset } : {}),
    ...(getSubLevelBlockRegistration(typeId)?.passable === true
      ? { collisionResponse: false }
      : {})
  };
}

function oppositeCardinalDirection(
  direction: "north" | "east" | "south" | "west"
): "north" | "east" | "south" | "west" {
  if (direction === "north") return "south";
  if (direction === "south") return "north";
  if (direction === "east") return "west";
  return "east";
}

function resolvePlacedOrientation(
  cardinalDirection: "north" | "east" | "south" | "west",
  placementFace?: SubLevelBlockFace
): string {
  if (placementFace === "up" || placementFace === "down") {
    // Orientation serializes the surface normal first for top/bottom placement:
    // `up_north` / `down_east`, followed by the horizontal front direction.
    return `${placementFace}_${oppositeCardinalDirection(cardinalDirection)}`;
  }
  if (placementFace === "north" || placementFace === "east"
    || placementFace === "south" || placementFace === "west") {
    return `${placementFace}_up`;
  }
  return `${oppositeCardinalDirection(cardinalDirection)}_up`;
}

// Some vanilla cardinal states use a model-placement basis that is quarter
// turned from the ordinary front-facing contract. Keep this as data so the
// resolver remains a shared state-key implementation rather than a block-name
// decision tree.
const CARDINAL_DIRECTION_PLACEMENT_OFFSETS: Readonly<Record<string, number>> = {
  "minecraft:anvil": -1,
  "minecraft:chipped_anvil": -1,
  "minecraft:damaged_anvil": -1
};

function resolvePlacedCardinalDirection(
  typeId: string,
  direction: "north" | "east" | "south" | "west"
): "north" | "east" | "south" | "west" {
  let resolved = direction;
  const quarterTurns = CARDINAL_DIRECTION_PLACEMENT_OFFSETS[typeId] ?? 2;
  if (quarterTurns > 0) {
    for (let index = 0; index < quarterTurns; index++) resolved = rotateCardinalDirection(resolved, 1);
  } else {
    for (let index = 0; index > quarterTurns; index--) resolved = rotateCardinalDirection(resolved, -1);
  }
  return resolved;
}

function rotateCardinalDirection(
  direction: "north" | "east" | "south" | "west",
  quarterTurns: number
): "north" | "east" | "south" | "west" {
  const directions = ["north", "east", "south", "west"] as const;
  const index = directions.indexOf(direction);
  return directions[(index + quarterTurns + directions.length * 4) % directions.length];
}

/** Resolve numeric direction placement before the shared state-to-render mapping. */
function resolvePlacedDirection(
  typeId: string,
  states: Readonly<Record<string, boolean | number | string>>,
  cardinalDirection: "north" | "east" | "south" | "west",
  placementFace?: SubLevelBlockFace
): number | undefined {
  const currentState = states["minecraft:direction"] ?? states.direction;
  if (typeof currentState !== "number" || !Number.isInteger(currentState)
    || currentState < 0 || currentState > 3) return undefined;
  if (typeId === "minecraft:cocoa" && placementFace) {
    // Cocoa's direction points from the cocoa block toward its supporting log.
    if (placementFace === "north") return 0;
    if (placementFace === "east") return 1;
    if (placementFace === "south") return 2;
    if (placementFace === "west") return 3;
  }
  const name = typeId.slice(typeId.indexOf(":") + 1);
  if (name === "bee_nest" || name.endsWith("_bee_nest")) {
    // Bee-nest direction follows the same south, west, north, east state order
    // as Bedrock's other four-way attachment states. Its front faces the player.
    const facing = oppositeCardinalDirection(cardinalDirection);
    return facing === "south" ? 0
      : facing === "west" ? 1
        : facing === "north" ? 2 : 3;
  }
  // Default four-way placement rule, including unregistered direction blocks.
  // A state value's render mapping does not describe a block's placement rule;
  // don't add name-based compensations here to correct a visual discrepancy.
  const resolved = directionForCardinal(cardinalDirection);
  if (usesFrontFacingDirectionStateMapping(name, states)) return (resolved + 2) % 4;
  return resolved;
}

function directionForCardinal(direction: "north" | "east" | "south" | "west"): number {
  return direction === "south" ? 0 : direction === "west" ? 1 : direction === "north" ? 2 : 3;
}

function facingDirectionForFace(face: SubLevelBlockFace): number {
  return face === "down" ? 0 : face === "up" ? 1 : face === "north" ? 2
    : face === "south" ? 3 : face === "west" ? 4 : 5;
}

function facingDirectionForCardinal(direction: "north" | "east" | "south" | "west"): number {
  return direction === "north" ? 2 : direction === "south" ? 3 : direction === "west" ? 4 : 5;
}

/** Vanilla loot for a projected block, via the loot table manager. */
function spawnBlockDrops(
  dimension: Dimension,
  block: SubLevelBlock,
  location: Vector3,
  tool?: ItemStack
): void {
  let drops: ItemStack[] = [];
  try {
    const permutation = BlockPermutation.resolve(block.typeId, { ...block.states });
    drops = world.getLootTableManager().generateLootFromBlockPermutation(permutation, tool) ?? [];
  } catch {
    drops = [];
  }
  for (const item of drops) {
    try {
      dimension.spawnItem(item, location);
    } catch {
      // One invalid drop must not prevent the remaining batch from spawning.
    }
  }
}
