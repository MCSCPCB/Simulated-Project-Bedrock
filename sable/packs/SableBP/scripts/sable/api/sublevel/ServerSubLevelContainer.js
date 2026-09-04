import {
  BlockPermutation,
  world
} from "@minecraft/server";
import { captureSubLevelBlocks } from "../SubLevelAssemblyHelper.js";
import { captureSubLevelFoliageTint } from "../../render/dynamic_biome/DynamicBiomeTintSampler.js";
import { SubLevelRenderer } from "../../sublevel/render/SubLevelRenderer.js";
import {
  resolveSubLevelBlockSupport
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
const MAX_REGION_VOLUME = 4096;
class ServerSubLevelContainer {
  #interactionSystem;
  #blockBehaviors;
  #recordsByHandleId = /* @__PURE__ */ new Map();
  #nextSubLevelId = 1;
  constructor(interactionSystem, blockBehaviors) {
    this.#interactionSystem = interactionSystem;
    this.#blockBehaviors = blockBehaviors;
  }
  /**
   * Captures a loaded world region into an entity-projected sub-level: full
   * permutation states, the biome foliage climate field, and per-block world
   * state (via the behavior registry) all transfer without any per-call
   * registration work.
   */
  createSubLevelFromRegion(dimension, from, to, options) {
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
    const volume = (maximum.x - minimum.x + 1) * (maximum.y - minimum.y + 1) * (maximum.z - minimum.z + 1);
    if (volume > MAX_REGION_VOLUME) {
      throw new RangeError(`Sub-level region spans ${volume} cells; the limit is ${MAX_REGION_VOLUME}.`);
    }
    const worldBlocks = [];
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
  createSubLevel(dimension, origin, blocks, foliageTint, worldData) {
    const id = `region_${this.#nextSubLevelId++}`;
    let removed = false;
    const body = {
      get isValid() {
        return !removed;
      },
      getRotation: () => ({ x: 0, y: 0, z: 0 }),
      localPointToWorld: (local) => ({
        x: origin.x + local.x + 0.5,
        y: origin.y + local.y + 0.5,
        z: origin.z + local.z + 0.5
      })
    };
    const worldPointToLocal = (point) => ({
      x: point.x - origin.x - 0.5,
      y: point.y - origin.y - 0.5,
      z: point.z - origin.z - 0.5
    });
    const subLevel = { body, blocks, dimension, foliageTint };
    const renderData = SubLevelRenderer.createRenderData(subLevel);
    let handle;
    const record = {
      id,
      subLevel,
      handle: void 0,
      renderData,
      removed: false
    };
    try {
      handle = this.#interactionSystem.register(subLevel, {
        worldPointToLocal,
        get renderData() {
          return record.renderData;
        }
      });
    } catch (error) {
      renderData.remove();
      removed = true;
      throw error;
    }
    record.handle = handle;
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
      this.#destroyRecord(record, () => {
        removed = true;
      });
      throw error;
    }
    const container = this;
    return {
      id,
      handle,
      get blockCount() {
        return handle.blocks.length;
      },
      get entityCount() {
        return record.renderData.entityCount;
      },
      remove() {
        container.#removeManagedSubLevel(record, () => {
          removed = true;
        });
      }
    };
  }
  /** The default break pipeline: support cascade, effects, loot, block behaviors. */
  breakBlockForPlayerEdit(_player, itemStack, handle, block) {
    const record = this.#recordsByHandleId.get(handle.id);
    if (!record || record.removed || !handle.isValid) return false;
    const current = handle.getBlockAtLocalLocation(block.localLocation);
    if (!current || current.typeId !== block.typeId) return false;
    const targetKey = blockLocationKey(block.localLocation);
    const entries = handle.blocks.map((entry) => ({
      key: blockLocationKey(entry.localLocation),
      localLocation: entry.localLocation,
      snapshot: entry
    }));
    const support = resolveSubLevelBlockSupport(entries, /* @__PURE__ */ new Set([targetKey]));
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
      spawnBlockDrops(dimension, removedBlock, position, index === 0 ? itemStack : void 0);
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
      this.#removeManagedSubLevel(record, () => {
      });
    }
    return true;
  }
  /** Emits one vanilla-style mining beat for a projected block. */
  emitBlockMiningEffects(handle, block) {
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
  placeBlockForPlayerEdit(player, itemStack, handle, _supportBlock, placement, cardinalDirection) {
    const record = this.#recordsByHandleId.get(handle.id);
    if (!record || record.removed || !handle.isValid) return false;
    if (getSubLevelBlockRegistration(itemStack.typeId)?.placeable !== true) return false;
    if (handle.getBlockAtLocalLocation(placement)) return false;
    const placed = buildPlacedBlock(player, itemStack.typeId, placement, cardinalDirection);
    if (!placed) return false;
    if (!handle.addBlock(placed)) {
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
  emitBlockPlacementEffects(handle, block) {
    const dimension = handle.dimension;
    const position = handle.localPointToWorld(block.localLocation);
    const sound = resolveVanillaBlockPlaceSound(block.typeId);
    dimension.playSound(sound.sound, position, { pitch: sound.pitch, volume: sound.volume });
  }
  /** Behavior-declared world reads that must precede source block removal. */
  #captureWorldData(dimension, blocks, origin) {
    const worldData = /* @__PURE__ */ new Map();
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
      if (data !== void 0) worldData.set(blockLocationKey(block.localLocation), data);
    }
    return worldData;
  }
  /** State rewrites (vine bits, moss tips) re-project the affected blocks. */
  #applyStateUpdates(record, stateUpdates) {
    const handle = record.handle;
    const blocks = handle.blocks.map((block) => stateUpdates.get(blockLocationKey(block.localLocation))?.snapshot ?? block);
    const renderData = record.renderData;
    if (renderData.supportsBlockAddition === true && renderData.addBlocks) {
      const updatedKeys = new Set(stateUpdates.keys());
      renderData.removeBlocks(updatedKeys);
      renderData.addBlocks([...stateUpdates.values()].map((update) => update.snapshot));
    } else {
      this.#recreateRender(record, blocks);
    }
    handle.resetBlocks(blocks);
  }
  #recreateRender(record, blocks) {
    const previous = record.renderData;
    record.renderData = SubLevelRenderer.createRenderData({
      ...record.subLevel,
      blocks
    });
    previous.remove();
  }
  #removeManagedSubLevel(record, invalidateBody) {
    if (record.removed) return;
    this.#destroyRecord(record, invalidateBody);
  }
  #destroyRecord(record, invalidateBody) {
    record.removed = true;
    for (const behavior of this.#blockBehaviors.behaviors()) {
      try {
        behavior.onSubLevelRemoved?.(record.id, record.handle);
      } catch {
      }
    }
    this.#recordsByHandleId.delete(record.handle?.id ?? -1);
    record.renderData.remove();
    record.handle?.unregister();
    invalidateBody();
  }
}
function buildPlacedBlock(_player, typeId, placement, cardinalDirection) {
  let states;
  try {
    states = { ...BlockPermutation.resolve(typeId).getAllStates() };
  } catch {
    return void 0;
  }
  if (states["minecraft:cardinal_direction"] !== void 0) {
    states["minecraft:cardinal_direction"] = cardinalDirection;
  }
  return {
    localLocation: { ...placement },
    states,
    typeId,
    ...getSubLevelBlockRegistration(typeId)?.passable === true ? { collisionResponse: false } : {}
  };
}
function spawnBlockDrops(dimension, block, location, tool) {
  let drops = [];
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
    }
  }
}
export {
  ServerSubLevelContainer
};
