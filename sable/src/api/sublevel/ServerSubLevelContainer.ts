// The server-side sub-level container: creates sub-levels from world regions,
// tracks them, and implements the default vanilla-block edit pipeline (break,
// place, effects) over the migrated interaction modules. This is the assembly
// the source project performed in its lifecycle controller, with the physics
// and tree-gameplay stages removed. The pipeline is block-agnostic: everything
// block-specific reaches it through the behavior registry.
import {
  BlockPermutation,
  world,
  type Block,
  type Dimension,
  type ItemStack,
  type Player,
  type Vector3
} from "@minecraft/server";
import { captureSubLevelBlocks } from "../SubLevelAssemblyHelper.js";
import { captureSubLevelFoliageTint } from "../../render/dynamic_biome/DynamicBiomeTintSampler.js";
import type { SubLevel, SubLevelBlock } from "../../sublevel/SubLevel.js";
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
  getSubLevelBlockRegistration
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
  readonly subLevel: SubLevel;
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
    const savedSubLevels = this.#storage.listSubLevelIds().map(id => {
      const saved = this.#storage.loadSubLevel(id);
      if (!saved) throw new Error(`Stored sub-level manifest entry ${id} has no structure record.`);
      this.#advanceNextSubLevelId(saved.id);
      return saved;
    });
    for (const saved of savedSubLevels) {
      this.#containers.registerSavedBindings(saved.id, saved.containerStorages);
    }
    for (const saved of savedSubLevels) this.#restoreSubLevel(saved);
  }

  tick(currentTick: number): void {
    if (currentTick % 20 !== 0) return;
    for (const record of [...this.#recordsByHandleId.values()]) {
      if (record.removed || !record.handle.isValid) continue;
      if (!record.renderData.hasKnownIntegrityFailure() && record.renderData.hasIntactEntities()) continue;
      this.#saveRecord(record);
      this.#destroyRecord(record, "unexpected");
      throw new Error(`Sub-level ${record.id} was persisted after a visual integrity failure.`);
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
    if (volume > MAX_REGION_VOLUME) {
      throw new RangeError(`Sub-level region spans ${volume} cells; the limit is ${MAX_REGION_VOLUME}.`);
    }

    const worldBlocks: Block[] = [];
    for (let y = minimum.y; y <= maximum.y; y++) {
      for (let z = minimum.z; z <= maximum.z; z++) {
        for (let x = minimum.x; x <= maximum.x; x++) {
          const block = dimension.getBlock({ x, y, z });
          if (block) worldBlocks.push(block);
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
    if (options?.removeWorldBlocks !== false) {
      for (const block of worldBlocks) {
        if (!block.isValid || block.isAir || block.isLiquid) continue;
        block.setType("minecraft:air");
      }
    }
    return this.createSubLevel(dimension, origin, captured, foliageTint, worldData);
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
    const record = this.#createRuntimeRecord(id, dimension, origin, blocks, foliageTint);
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
    const removedBlocks = handle.removeBlocksAtLocalLocations(removedLocations);
    if (removedBlocks.length === 0) return false;

    if (support.stateUpdates.size > 0) this.#applyStateUpdates(record, support.stateUpdates);

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

    if (handle.blocks.length === 0) {
      if (!this.#storage.deleteSubLevel(record.id)) {
        throw new Error(`Could not delete naturally emptied sub-level ${record.id}.`);
      }
      this.#destroyRecord(record, "natural");
    } else {
      this.#saveRecord(record);
    }
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
    cardinalDirection: "north" | "east" | "south" | "west"
  ): boolean {
    this.initialize();
    const record = this.#recordsByHandleId.get(handle.id);
    if (!record || record.removed || !handle.isValid) return false;
    if (getSubLevelBlockRegistration(itemStack.typeId)?.placeable !== true) return false;
    if (handle.getBlockAtLocalLocation(placement)) return false;
    const placed = buildPlacedBlock(player, itemStack.typeId, placement, cardinalDirection);
    if (!placed) return false;

    if (!handle.addBlock(placed)) {
      // The render route cannot append in place; rebuild the projection.
      const blocks = [...handle.blocks, placed];
      this.#recreateRender(record, blocks);
      handle.resetBlocks(blocks);
    }
    const previousBindings = new Set(
      this.#containerBindings(record).map(binding => binding.storageId)
    );
    try {
      this.#blockBehaviors.get(placed.typeId)?.onBlockAdded?.({
        block: placed,
        dimension: handle.dimension,
        handle,
        ownerId: record.id
      });
      this.#saveRecord(record);
      return true;
    } catch (error) {
      handle.removeBlocksAtLocalLocations([placement]);
      for (const binding of this.#containerBindings(record)) {
        if (!previousBindings.has(binding.storageId)) {
          this.#containers.discardStorage(binding.storageId);
        }
      }
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
    let record: ManagedSubLevelRecord;
    try {
      const handle = this.#interactionSystem.register(subLevel, {
        worldPointToLocal,
        get renderData() { return record.renderData; }
      });
      record = {
        id,
        subLevel,
        handle,
        origin: { ...origin },
        renderData,
        removed: false,
        invalidateBody: () => { removed = true; }
      };
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
    containerStorages = this.#containerBindings(record)
  ): void {
    if (!this.#storage.saveSubLevel(record.id, {
      blocks: [...record.handle.blocks],
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

function buildPlacedBlock(
  _player: Player,
  typeId: string,
  placement: Vector3,
  cardinalDirection: "north" | "east" | "south" | "west"
): SubLevelBlock | undefined {
  let states: Record<string, boolean | number | string>;
  try {
    states = { ...BlockPermutation.resolve(typeId).getAllStates() };
  } catch {
    return undefined;
  }
  if (states["minecraft:cardinal_direction"] !== undefined) {
    states["minecraft:cardinal_direction"] = cardinalDirection;
  }
  return {
    localLocation: { ...placement },
    states,
    typeId,
    ...(getSubLevelBlockRegistration(typeId)?.passable === true
      ? { collisionResponse: false }
      : {})
  };
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
