import {
  BlockPermutation,
  system,
  world
} from "@minecraft/server";
import {
  captureSubLevelBlocks,
  resolveSubLevelBlockRotation,
  resolveSubLevelBlockVisualOffset,
  resolveSubLevelBlockVisualYOffset,
  usesFrontFacingDirectionStateMapping
} from "../SubLevelAssemblyHelper.js";
import { captureSubLevelFoliageTint } from "../../render/dynamic_biome/DynamicBiomeTintSampler.js";
import { SubLevelRenderer } from "../../sublevel/render/SubLevelRenderer.js";
import {
  resolveSubLevelBlockSupport,
  resolveSubLevelBlockPlacement
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
import { SubLevelStorage } from "../../sublevel/storage/serialization/SubLevelStorage.js";
const MAX_REGION_VOLUME = 4096;
class ServerSubLevelContainer {
  #interactionSystem;
  #blockBehaviors;
  #containers;
  #storage;
  #recordsByHandleId = /* @__PURE__ */ new Map();
  #nextSubLevelId = 1;
  #initialized = false;
  #pendingRestores = /* @__PURE__ */ new Map();
  constructor(interactionSystem, blockBehaviors, containers, storage = new SubLevelStorage()) {
    this.#interactionSystem = interactionSystem;
    this.#blockBehaviors = blockBehaviors;
    this.#containers = containers;
    this.#storage = storage;
  }
  initialize() {
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
  handleVisualEntityLoad(entity) {
    if (entity.typeId !== "sable:block" && entity.typeId !== "sable:block_carrier" && !entity.typeId.startsWith("sable:fancy_")) return;
    system.run(() => {
      if (!entity.isValid || this.#interactionSystem.isVisualEntity(entity.dimension.id, entity.id)) return;
      entity.remove();
    });
  }
  tick(currentTick) {
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
      if (!isRecordRegionLoaded(record)) continue;
      record.renderData.sync();
      if (!record.renderData.hasKnownIntegrityFailure() && record.renderData.hasIntactEntities()) continue;
      this.#saveRecord(record);
      this.#recreateRender(record, record.handle.blocks);
    }
  }
  handleContainerNativeDeath(ownerId, binding) {
    const record = this.#findRecord(ownerId);
    if (record) {
      const bindings2 = this.#containerBindings(record).filter((entry) => entry.storageId !== binding.storageId);
      this.#saveRecord(record, bindings2);
      return;
    }
    const saved = this.#storage.loadSubLevel(ownerId);
    if (!saved) throw new Error(`Native death storage ${binding.storageId} has no sub-level owner ${ownerId}.`);
    const bindings = saved.containerStorages.filter((entry) => entry.storageId !== binding.storageId);
    if (!this.#storage.saveSubLevel(ownerId, { ...saved, containerStorages: bindings })) {
      throw new Error(`Could not persist native death of storage ${binding.storageId}.`);
    }
  }
  handleContainerUnexpectedRemoval(ownerId, _binding) {
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
  createSubLevelFromRegion(dimension, from, to, options) {
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
    const volume = (maximum.x - minimum.x + 1) * (maximum.y - minimum.y + 1) * (maximum.z - minimum.z + 1);
    if (!Number.isSafeInteger(volume) || volume <= 0 || volume > MAX_REGION_VOLUME) {
      throw new RangeError(`Sub-level region spans ${volume} cells; the limit is ${MAX_REGION_VOLUME}.`);
    }
    const worldBlocks = [];
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
    const removals = [...captured].sort((left, right) => sourceRemovalOrder(left) - sourceRemovalOrder(right) || left.localLocation.y - right.localLocation.y);
    const removed = [];
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
      const record = this.#recordsByHandleId.get(managed.handle.id);
      this.#storage.deleteSubLevel(record.id);
      this.#discardUncommittedRecord(record);
      throw error;
    }
  }
  /** Assembles, renders, and registers one sub-level from captured blocks. */
  createSubLevel(dimension, origin, blocks, foliageTint, worldData) {
    this.initialize();
    const id = `region_${this.#nextSubLevelId++}`;
    const anchoredFoliageTint = foliageTint ?? captureSubLevelFoliageTint(dimension, blocks, origin);
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
      get blockCount() {
        return handle.blocks.length;
      },
      get entityCount() {
        return record.renderData.entityCount;
      },
      remove() {
        container.#removeManagedSubLevel(record);
      }
    };
  }
  /** The default break pipeline: support cascade, effects, loot, block behaviors. */
  breakBlockForPlayerEdit(_player, itemStack, handle, block) {
    this.initialize();
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
    const previousBlocks = [...handle.blocks];
    const previousBindings = this.#containerBindings(record);
    const removedKeys = new Set(removedLocations.map(blockLocationKey));
    const removedBlocks = [current, ...previousBlocks.filter((entry) => blockLocationKey(entry.localLocation) !== targetKey && removedKeys.has(blockLocationKey(entry.localLocation)))];
    if (removedBlocks.length === 0) return false;
    const remaining = previousBlocks.filter((entry) => !removedKeys.has(blockLocationKey(entry.localLocation))).map((entry) => support.stateUpdates.get(blockLocationKey(entry.localLocation))?.snapshot ?? entry);
    const bindings = previousBindings.filter((entry) => !removedKeys.has(blockLocationKey(entry.localLocation)));
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
    if (handle.blocks.length === 0) this.#destroyRecord(record, "natural");
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
  placeBlockForPlayerEdit(player, itemStack, handle, _supportBlock, placement, cardinalDirection, placementFace) {
    this.initialize();
    const record = this.#recordsByHandleId.get(handle.id);
    if (!record || record.removed || !handle.isValid) return false;
    if (getSubLevelBlockRegistration(itemStack.typeId)?.placeable === false) return false;
    const placed = buildPlacedBlock(
      player,
      itemStack.typeId,
      placement,
      cardinalDirection,
      placementFace
    );
    if (!placed) return false;
    const placementResult = resolveSubLevelBlockPlacement(handle.blocks, placed);
    if (!placementResult) return false;
    const previousBlocks = [...handle.blocks];
    const previousBindings = new Set(
      this.#containerBindings(record).map((binding) => binding.storageId)
    );
    try {
      for (const addition of placementResult.additions) {
        if (!resolveFancySubLevelBlock(addition) || !handle.addBlock(addition)) {
          const blocks = [...handle.blocks, addition];
          record.subLevel = { ...record.subLevel, blocks };
          this.#recreateRender(record, blocks);
          handle.resetBlocks(blocks);
        }
      }
      if (placementResult.stateUpdates.size > 0) this.#applyStateUpdates(record, placementResult.stateUpdates);
      record.subLevel = { ...record.subLevel, blocks: [...handle.blocks] };
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
    const next = SubLevelRenderer.createRenderData({
      ...record.subLevel,
      blocks
    });
    try {
      previous.transferPersistentRidersTo?.(next);
    } catch (error) {
      next.remove();
      throw error;
    }
    record.renderData = next;
    previous.remove();
    record.handle.markContentChanged();
    this.#containers.refreshModelStates(record.handle);
    system.run(() => {
      if (!record.removed && record.renderData === next) this.#containers.refreshModelStates(record.handle);
    });
  }
  #removeManagedSubLevel(record) {
    if (record.removed) return;
    this.#saveRecord(record);
    this.#destroyRecord(record, "planned");
  }
  #destroyRecord(record, reason) {
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
  #createRuntimeRecord(id, dimension, origin, blocks, foliageTint) {
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
    const record = {
      id,
      subLevel,
      handle: void 0,
      origin: { ...origin },
      renderData,
      removed: false,
      invalidateBody: () => {
        removed = true;
      }
    };
    try {
      const handle = this.#interactionSystem.register(subLevel, {
        worldPointToLocal,
        get renderData() {
          return record.renderData;
        }
      });
      record.handle = handle;
      return record;
    } catch (error) {
      renderData.remove();
      removed = true;
      throw error;
    }
  }
  #restoreSubLevel(saved) {
    const record = this.#createRuntimeRecord(
      saved.id,
      world.getDimension(saved.dimensionId),
      saved.origin,
      saved.blocks,
      saved.foliageTint ?? captureSubLevelFoliageTint(world.getDimension(saved.dimensionId), saved.blocks, saved.origin)
    );
    this.#recordsByHandleId.set(record.handle.id, record);
    try {
      this.#containers.bindSubLevel(saved.id, record.handle, saved.containerStorages);
    } catch (error) {
      this.#destroyRecord(record, "unexpected");
      throw error;
    }
  }
  #saveRecord(record, containerStorages = this.#containerBindings(record), blocks = record.handle.blocks) {
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
  #findRecord(ownerId) {
    return [...this.#recordsByHandleId.values()].find((record) => record.id === ownerId);
  }
  #containerBindings(record) {
    return this.#containers.getBindings(record.id);
  }
  #advanceNextSubLevelId(id) {
    const match = /^region_(\d+)$/.exec(id);
    if (!match) return;
    this.#nextSubLevelId = Math.max(this.#nextSubLevelId, Number(match[1]) + 1);
  }
  #discardUncommittedRecord(record) {
    for (const binding of this.#containerBindings(record)) {
      this.#containers.discardStorage(binding.storageId);
    }
    this.#destroyRecord(record, "unexpected");
  }
}
function isRecordRegionLoaded(record) {
  return isSubLevelRegionLoaded(record.handle.dimension, record.origin, record.handle.blocks);
}
function isSubLevelRegionLoaded(dimension, origin, blocks) {
  try {
    const chunks = /* @__PURE__ */ new Set();
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
function sourceLocation(origin, local) {
  return { x: origin.x + local.x, y: origin.y + local.y, z: origin.z + local.z };
}
function sourceRemovalOrder(block) {
  const registration = getSubLevelBlockRegistration(block.typeId);
  return registration?.support ? 0 : registration?.category === "nature/leaves" ? 1 : 2;
}
function buildPlacedBlock(player, typeId, placement, cardinalDirection, placementFace) {
  let states;
  try {
    states = { ...BlockPermutation.resolve(typeId).getAllStates() };
  } catch {
    return void 0;
  }
  const orientationState = states["minecraft:orientation"] !== void 0 ? "minecraft:orientation" : states.orientation !== void 0 ? "orientation" : void 0;
  if (orientationState) {
    states[orientationState] = resolvePlacedOrientation(cardinalDirection, placementFace);
  }
  if (states["minecraft:cardinal_direction"] !== void 0) {
    states["minecraft:cardinal_direction"] = resolvePlacedCardinalDirection(typeId, cardinalDirection);
  } else if (states.cardinal_direction !== void 0) {
    states.cardinal_direction = resolvePlacedCardinalDirection(typeId, cardinalDirection);
  }
  const directionState = states["minecraft:direction"] !== void 0 ? "minecraft:direction" : states.direction !== void 0 ? "direction" : void 0;
  if (directionState) {
    const direction = resolvePlacedDirection(typeId, states, cardinalDirection, placementFace);
    if (direction !== void 0) states[directionState] = direction;
  }
  const facingState = states["minecraft:facing_direction"] !== void 0 ? "minecraft:facing_direction" : states.facing_direction !== void 0 ? "facing_direction" : void 0;
  if (facingState) {
    const facing = placementFace ? facingDirectionForFace(placementFace) : facingDirectionForCardinal(cardinalDirection);
    if (facing !== void 0) states[facingState] = facing;
  }
  const stairDirectionState = states["minecraft:weirdo_direction"] !== void 0 ? "minecraft:weirdo_direction" : states.weirdo_direction !== void 0 ? "weirdo_direction" : void 0;
  if (stairDirectionState) states[stairDirectionState] = directionForCardinal(cardinalDirection);
  const upsideDownState = states["minecraft:upside_down_bit"] !== void 0 ? "minecraft:upside_down_bit" : states.upside_down_bit !== void 0 ? "upside_down_bit" : void 0;
  if (upsideDownState && placementFace) states[upsideDownState] = placementFace === "down";
  const verticalHalfState = states["minecraft:vertical_half"] !== void 0 ? "minecraft:vertical_half" : states.vertical_half !== void 0 ? "vertical_half" : void 0;
  if (verticalHalfState && placementFace) states[verticalHalfState] = placementFace === "down" ? "top" : "bottom";
  const axisState = states["minecraft:pillar_axis"] !== void 0 ? "minecraft:pillar_axis" : states.pillar_axis !== void 0 ? "pillar_axis" : void 0;
  if (axisState && placementFace) {
    states[axisState] = placementFace === "east" || placementFace === "west" ? "x" : placementFace === "north" || placementFace === "south" ? "z" : "y";
  }
  if (getSubLevelBlockRegistration(typeId)?.support === "pointed_dripstone") {
    const hangingState = states.hanging !== void 0 ? "hanging" : "minecraft:hanging";
    const thicknessState = states.dripstone_thickness !== void 0 ? "dripstone_thickness" : "minecraft:dripstone_thickness";
    states[hangingState] = placementFace === "down" || placementFace !== "up" && player.getViewDirection().y > 0;
    states[thicknessState] = player.isSneaking ? "tip" : "merge";
  }
  if (getSubLevelBlockRegistration(typeId)?.support === "multi_face" && placementFace) {
    const faceState = states.multi_face_direction_bits !== void 0 ? "multi_face_direction_bits" : "minecraft:multi_face_direction_bits";
    const bits = { up: 1, down: 2, north: 4, east: 8, south: 16, west: 32 };
    states[faceState] = bits[placementFace];
  }
  const rotation = resolveSubLevelBlockRotation(typeId, states);
  const visualYOffset = resolveSubLevelBlockVisualYOffset(typeId, states);
  const visualOffset = resolveSubLevelBlockVisualOffset(typeId, states);
  return {
    localLocation: { ...placement },
    states,
    typeId,
    ...rotation ? { rotation } : {},
    ...visualYOffset !== 0 ? { visualYOffset } : {},
    ...visualOffset ? { visualOffset } : {},
    ...getSubLevelBlockRegistration(typeId)?.passable === true ? { collisionResponse: false } : {}
  };
}
function oppositeCardinalDirection(direction) {
  if (direction === "north") return "south";
  if (direction === "south") return "north";
  if (direction === "east") return "west";
  return "east";
}
function resolvePlacedOrientation(cardinalDirection, placementFace) {
  if (placementFace === "up" || placementFace === "down") {
    return `${placementFace}_${oppositeCardinalDirection(cardinalDirection)}`;
  }
  if (placementFace === "north" || placementFace === "east" || placementFace === "south" || placementFace === "west") {
    return `${placementFace}_up`;
  }
  return `${oppositeCardinalDirection(cardinalDirection)}_up`;
}
const CARDINAL_DIRECTION_PLACEMENT_OFFSETS = {
  "minecraft:anvil": -1,
  "minecraft:chipped_anvil": -1,
  "minecraft:damaged_anvil": -1
};
function resolvePlacedCardinalDirection(typeId, direction) {
  let resolved = direction;
  const quarterTurns = CARDINAL_DIRECTION_PLACEMENT_OFFSETS[typeId] ?? 2;
  if (quarterTurns > 0) {
    for (let index = 0; index < quarterTurns; index++) resolved = rotateCardinalDirection(resolved, 1);
  } else {
    for (let index = 0; index > quarterTurns; index--) resolved = rotateCardinalDirection(resolved, -1);
  }
  return resolved;
}
function rotateCardinalDirection(direction, quarterTurns) {
  const directions = ["north", "east", "south", "west"];
  const index = directions.indexOf(direction);
  return directions[(index + quarterTurns + directions.length * 4) % directions.length];
}
function resolvePlacedDirection(typeId, states, cardinalDirection, placementFace) {
  const currentState = states["minecraft:direction"] ?? states.direction;
  if (typeof currentState !== "number" || !Number.isInteger(currentState) || currentState < 0 || currentState > 3) return void 0;
  if (typeId === "minecraft:cocoa" && placementFace) {
    if (placementFace === "north") return 0;
    if (placementFace === "east") return 1;
    if (placementFace === "south") return 2;
    if (placementFace === "west") return 3;
  }
  const name = typeId.slice(typeId.indexOf(":") + 1);
  if (name === "bee_nest" || name.endsWith("_bee_nest")) {
    const facing = oppositeCardinalDirection(cardinalDirection);
    return facing === "south" ? 0 : facing === "west" ? 1 : facing === "north" ? 2 : 3;
  }
  const resolved = directionForCardinal(cardinalDirection);
  if (usesFrontFacingDirectionStateMapping(name, states)) return (resolved + 2) % 4;
  return resolved;
}
function directionForCardinal(direction) {
  return direction === "south" ? 0 : direction === "west" ? 1 : direction === "north" ? 2 : 3;
}
function facingDirectionForFace(face) {
  return face === "down" ? 0 : face === "up" ? 1 : face === "north" ? 2 : face === "south" ? 3 : face === "west" ? 4 : 5;
}
function facingDirectionForCardinal(direction) {
  return direction === "north" ? 2 : direction === "south" ? 3 : direction === "west" ? 4 : 5;
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
