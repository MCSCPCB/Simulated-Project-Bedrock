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
  renderData: SubLevelRenderData;
  removed: boolean;
}

/** Tracks every live sub-level and runs the default edit pipeline over them. */
export class ServerSubLevelContainer {
  readonly #interactionSystem: SubLevelInteractionSystem;
  readonly #blockBehaviors: SubLevelBlockBehaviorRegistry;
  readonly #recordsByHandleId = new Map<number, ManagedSubLevelRecord>();
  #nextSubLevelId = 1;

  constructor(
    interactionSystem: SubLevelInteractionSystem,
    blockBehaviors: SubLevelBlockBehaviorRegistry
  ) {
    this.#interactionSystem = interactionSystem;
    this.#blockBehaviors = blockBehaviors;
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
    const id = `region_${this.#nextSubLevelId++}`;
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
    let handle: SubLevelInteractionHandle;
    const record: ManagedSubLevelRecord = {
      id,
      subLevel,
      handle: undefined as unknown as SubLevelInteractionHandle,
      renderData,
      removed: false
    };
    try {
      handle = this.#interactionSystem.register(subLevel, {
        worldPointToLocal,
        get renderData() { return record.renderData; }
      });
    } catch (error) {
      renderData.remove();
      removed = true;
      throw error;
    }
    (record as { handle: SubLevelInteractionHandle }).handle = handle;
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
    } catch (error) {
      this.#destroyRecord(record, () => { removed = true; });
      throw error;
    }
    const container = this;
    return {
      id,
      handle,
      get blockCount() { return handle.blocks.length; },
      get entityCount() { return record.renderData.entityCount; },
      remove() { container.#removeManagedSubLevel(record, () => { removed = true; }); }
    };
  }

  /** The default break pipeline: support cascade, effects, loot, block behaviors. */
  breakBlockForPlayerEdit(
    _player: Player,
    itemStack: ItemStack | undefined,
    handle: SubLevelInteractionHandle,
    block: SubLevelBlock
  ): boolean {
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
      this.#removeManagedSubLevel(record, () => {});
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
    try {
      this.#blockBehaviors.get(placed.typeId)?.onBlockAdded?.({
        block: placed,
        dimension: handle.dimension,
        handle,
        ownerId: record.id
      });
      return true;
    } catch (error) {
      handle.removeBlocksAtLocalLocations([placement]);
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
    record.renderData = SubLevelRenderer.createRenderData({
      ...record.subLevel,
      blocks
    });
    previous.remove();
  }

  #removeManagedSubLevel(record: ManagedSubLevelRecord, invalidateBody: () => void): void {
    if (record.removed) return;
    this.#destroyRecord(record, invalidateBody);
  }

  #destroyRecord(record: ManagedSubLevelRecord, invalidateBody: () => void): void {
    record.removed = true;
    for (const behavior of this.#blockBehaviors.behaviors()) {
      try {
        behavior.onSubLevelRemoved?.(record.id, record.handle);
      } catch {
        // One behavior's teardown failure must not block the rest.
      }
    }
    this.#recordsByHandleId.delete(record.handle?.id ?? -1);
    record.renderData.remove();
    record.handle?.unregister();
    invalidateBody();
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
