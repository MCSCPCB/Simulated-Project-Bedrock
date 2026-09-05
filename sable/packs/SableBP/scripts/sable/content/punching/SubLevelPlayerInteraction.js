import {
  BlockTypes,
  EntitySwingSource,
  GameMode,
  InputButton,
  InputMode,
  system,
  world
} from "@minecraft/server";
import { ActivePlayerRegistry } from "../../api/player/ActivePlayerRegistry.js";
import {
  dot,
  normalizeFinite as normalize,
  subtract,
  vectorsEqual
} from "../../util/SableVector3Utils.js";
import {
  BLOCK_CRACK_ENTITY_TYPE_ID,
  BLOCK_OUTLINE_ENTITY_TYPE_ID,
  INTERACTION_REACH,
  SubLevelOutlineController,
  WORLD_BLOCK_OCCLUSION_EPSILON
} from "../block_outline_render/SubLevelOutlineController.js";
const PLACE_ACTION_DEDUP_WINDOW_TICKS = 1;
const WORLD_OCCLUSION_PROBE_REACH = 7;
class SubLevelPlayerInteractionController {
  #lastPlaceActionByPlayer = /* @__PURE__ */ new Map();
  #lastTouchBlockInteractionTickByPlayer = /* @__PURE__ */ new Map();
  #pendingPlaceByPlayer = /* @__PURE__ */ new Map();
  #pendingTouchBreakByPlayer = /* @__PURE__ */ new Map();
  #raycastByPlayer = /* @__PURE__ */ new Map();
  #standingChestGestureTickByPlayer = /* @__PURE__ */ new Map();
  #players = new ActivePlayerRegistry();
  #runtime;
  #outlines;
  #interactionHandler;
  #started = false;
  constructor(runtime) {
    this.#runtime = runtime;
    this.#outlines = new SubLevelOutlineController(runtime, this.#players);
  }
  tick(currentTick) {
    this.#syncStandingInteractionTargets();
    this.#interactionHandler?.tick?.(currentTick);
    this.#outlines.tick(currentTick);
  }
  handleVisualEntityLoad(entity) {
    this.#outlines.handleEntityLoad(entity);
  }
  setBlockBreakHandler(handler) {
    this.#outlines.setBreakHandler(handler);
  }
  setBlockMiningEffectHandler(handler) {
    this.#outlines.setMiningEffectHandler(handler);
  }
  setBlockPlaceHandler(handler) {
    this.#outlines.setPlaceHandler(handler);
  }
  setBlockPlacementEffectHandler(handler) {
    this.#outlines.setPlacementEffectHandler(handler);
  }
  setBlockInteractHandler(handler) {
    this.#interactionHandler = handler;
    this.#outlines.setInteractionTargetSuppressor(
      (handle, block) => handler.canInteract(handle, block)
    );
  }
  start() {
    if (this.#started) return;
    this.#started = true;
    this.#players.start();
    this.#outlines.start();
    world.beforeEvents.itemUse.subscribe((event) => this.#handleItemUse(event));
    world.afterEvents.itemStartUse.subscribe((event) => {
      const { itemStack, source } = event;
      if (source.inputInfo.lastInputModeUsed !== InputMode.Touch) return;
      const pending = this.#pendingTouchBreakByPlayer.get(source.id);
      if (pending && pending.slot === source.selectedSlotIndex && pending.itemTypeId === itemStack.typeId) this.#pendingTouchBreakByPlayer.delete(source.id);
    });
    world.beforeEvents.playerBreakBlock.subscribe((event) => {
      if (this.#outlines.isManagedInteractionTarget(event.dimension, event.block)) {
        event.cancel = true;
        return;
      }
      if (this.#outlines.captureActionTarget(event.player)) {
        event.cancel = true;
      }
    });
    world.afterEvents.playerStartBreakingBlock.subscribe((event) => {
      if (!this.#outlines.isManagedInteractionTarget(event.dimension, event.block)) return;
      const { player } = event;
      this.#pendingPlaceByPlayer.delete(player.id);
      if (player.inputInfo.lastInputModeUsed !== InputMode.Touch) return;
      if (this.#touchGestureYieldsToContainer(player)) return;
      if (this.#pendingTouchBreakByPlayer.has(player.id)) return;
      const target = this.#outlines.captureActionTarget(player);
      if (!target) return;
      this.#queueTouchBreakAction(player, this.#getSelectedItem(player), target);
    });
    world.beforeEvents.playerInteractWithBlock.subscribe((event) => {
      const { itemStack, player } = event;
      const heldItemIsBlock = itemStack !== void 0 && BlockTypes.get(itemStack.typeId) !== void 0;
      if (heldItemIsBlock && player.inputInfo.lastInputModeUsed === InputMode.KeyboardAndMouse && !player.isSneaking && this.#canInteract(player) && (this.#ownsStandingChestGesture(player) || this.#findStandingInteractionTarget(player) !== void 0)) {
        event.cancel = true;
        this.#claimStandingChestGesture(player);
        return;
      }
      const target = this.#outlines.captureActionTarget(player);
      if (!target) return;
      if (heldItemIsBlock) event.cancel = true;
      if (player.inputInfo.lastInputModeUsed === InputMode.Touch) {
        this.#lastTouchBlockInteractionTickByPlayer.set(player.id, system.currentTick);
        this.#pendingTouchBreakByPlayer.delete(player.id);
      }
      if (!heldItemIsBlock || !itemStack) return;
      this.#queuePlaceAction(player, itemStack, target);
    });
    world.beforeEvents.entityHurt.subscribe((event) => {
      if (this.#isSubLevelVisualEntity(event.hurtEntity)) event.cancel = true;
    });
    world.afterEvents.playerSwingStart.subscribe((event) => this.#handleSwing(event));
    world.afterEvents.playerHotbarSelectedSlotChange.subscribe((event) => {
      this.#clearEditActionState(event.player.id);
    });
    world.afterEvents.playerDimensionChange.subscribe((event) => {
      this.#raycastByPlayer.delete(event.player.id);
      this.#releasePlayerInteractionSession(event.player.id);
      this.#clearEditActionState(event.player.id);
      this.#outlines.clearPlayer(event.player.id, true);
    });
    world.afterEvents.playerButtonInput.subscribe((event) => {
      if (event.button !== InputButton.Sneak || !event.player.isSneaking) return;
      this.#interactionHandler?.syncTarget?.(event.player, void 0, void 0);
      this.#outlines.markInteractionTargetDirty(event.player.id);
    }, { buttons: [InputButton.Sneak] });
    world.afterEvents.playerSpawn.subscribe((event) => {
      this.#raycastByPlayer.delete(event.player.id);
      this.#releasePlayerInteractionSession(event.player.id);
      this.#clearEditActionState(event.player.id);
      this.#outlines.clearPlayer(event.player.id, true);
    });
    world.afterEvents.entityDie.subscribe((event) => {
      if (event.deadEntity.typeId !== "minecraft:player") return;
      this.#raycastByPlayer.delete(event.deadEntity.id);
      this.#releasePlayerInteractionSession(event.deadEntity.id);
      this.#clearEditActionState(event.deadEntity.id);
      this.#outlines.clearPlayer(event.deadEntity.id, true);
    });
    world.beforeEvents.playerLeave.subscribe((event) => {
      const playerId = event.player.id;
      this.#raycastByPlayer.delete(playerId);
      this.#clearEditActionState(playerId);
      system.run(() => {
        this.#releasePlayerInteractionSession(playerId);
        this.#outlines.clearPlayer(playerId, true);
      });
    });
  }
  #handleItemUse(event) {
    const player = event.source;
    if (!player.isSneaking && this.#canInteract(player) && this.#tryPlayerStandingInteraction(player)) {
      this.#claimStandingChestGesture(player);
      return;
    }
    if (!this.#canInteract(player)) return;
    const inputMode = player.inputInfo.lastInputModeUsed;
    if (shouldPrioritizeFoodUse(player, event.itemStack, inputMode === InputMode.Touch)) return;
    const target = this.#outlines.captureActionTarget(player);
    if (!target) return;
    if (inputMode === InputMode.Touch) {
      if (this.#pendingPlaceByPlayer.has(player.id) || this.#shouldSuppressTouchBreak(
        player.id,
        system.currentTick,
        system.currentTick
      )) {
        event.cancel = true;
        return;
      }
      this.#queueTouchBreakAction(player, event.itemStack, target);
      return;
    }
  }
  #handleSwing(event) {
    const { player, swingSource } = event;
    if (!this.#canInteract(player)) return;
    const itemStack = event.heldItemStack ?? this.#getSelectedItem(player);
    const pending = this.#pendingPlaceByPlayer.get(player.id);
    const pendingTouchBreak = this.#pendingTouchBreakByPlayer.get(player.id);
    const editAction = resolveSubLevelEditAction(
      swingSource,
      pending !== void 0,
      player.inputInfo.lastInputModeUsed,
      pendingTouchBreak !== void 0,
      itemStack !== void 0 && BlockTypes.get(itemStack.typeId) !== void 0
    );
    if (editAction === "break") {
      if (this.#touchGestureYieldsToContainer(player)) {
        this.#pendingTouchBreakByPlayer.delete(player.id);
        return;
      }
      if (player.inputInfo.lastInputModeUsed === InputMode.Touch && swingSource === EntitySwingSource.Mine && pendingTouchBreak === void 0) {
        const target3 = this.#outlines.captureActionTarget(player);
        if (!target3) {
          this.#outlines.handleBreak(player, itemStack, target3);
          return;
        }
        this.#queueTouchBreakAction(player, itemStack, target3);
        return;
      }
      if (pending) this.#pendingPlaceByPlayer.delete(player.id);
      if (pendingTouchBreak) this.#pendingTouchBreakByPlayer.delete(player.id);
      if (pendingTouchBreak && (pendingTouchBreak.slot !== player.selectedSlotIndex || pendingTouchBreak.itemTypeId !== itemStack?.typeId)) return;
      const target2 = pendingTouchBreak?.target ?? this.#outlines.captureActionTarget(player);
      if (!target2) {
        this.#outlines.handleBreak(player, itemStack, target2);
        return;
      }
      this.#performBreakAction(player, itemStack, target2);
      return;
    }
    if (editAction !== "place") return;
    if (pending) this.#pendingPlaceByPlayer.delete(player.id);
    if (pendingTouchBreak) this.#pendingTouchBreakByPlayer.delete(player.id);
    if (!itemStack || !BlockTypes.get(itemStack.typeId)) return;
    if (pending && (pending.slot !== player.selectedSlotIndex || pending.itemTypeId !== itemStack.typeId)) return;
    const target = pending?.target ?? this.#outlines.captureActionTarget(player);
    if (!target) {
      this.#outlines.handlePlace(player, itemStack);
      return;
    }
    this.#performPlaceAction(
      player,
      itemStack,
      target,
      pending?.originTick ?? system.currentTick
    );
  }
  /** Touch itemUse marks a hold gesture; its deferred action can be superseded by the swing. */
  #queueTouchBreakAction(player, itemStack, target) {
    const originTick = system.currentTick;
    if (this.#shouldSuppressTouchBreak(
      player.id,
      originTick,
      originTick
    )) return;
    const pending = {
      itemTypeId: itemStack?.typeId,
      slot: player.selectedSlotIndex,
      target
    };
    this.#pendingTouchBreakByPlayer.set(player.id, pending);
    system.run(() => {
      if (this.#pendingTouchBreakByPlayer.get(player.id) !== pending) return;
      this.#pendingTouchBreakByPlayer.delete(player.id);
      if (this.#shouldSuppressTouchBreak(
        player.id,
        originTick,
        system.currentTick
      )) return;
      if (this.#touchGestureYieldsToContainer(player)) return;
      const selected = this.#getSelectedItem(player);
      if (player.selectedSlotIndex !== pending.slot || selected?.typeId !== pending.itemTypeId) return;
      this.#performBreakAction(player, selected, pending.target);
    });
  }
  /** A touch hold aimed at an interactable container never mines it. */
  #touchGestureYieldsToContainer(player) {
    return player.inputInfo.lastInputModeUsed === InputMode.Touch && !player.isSneaking && this.#findStandingInteractionTarget(player) !== void 0;
  }
  #performBreakAction(player, itemStack, target) {
    this.#outlines.handleBreak(player, itemStack, target);
  }
  #shouldSuppressTouchBreak(playerId, breakOriginTick, observationTick) {
    return shouldSuppressTouchBreak(
      this.#lastTouchBlockInteractionTickByPlayer.get(playerId),
      breakOriginTick,
      observationTick
    );
  }
  /** Touch placement resolves on the next tick; other input modes wait for Build. */
  #queuePlaceAction(player, itemStack, target) {
    const pending = {
      itemTypeId: itemStack.typeId,
      originTick: system.currentTick,
      player,
      slot: player.selectedSlotIndex,
      target
    };
    this.#pendingPlaceByPlayer.set(player.id, pending);
    if (player.inputInfo.lastInputModeUsed !== InputMode.Touch) return;
    system.run(() => {
      if (this.#pendingPlaceByPlayer.get(player.id) !== pending) return;
      this.#pendingPlaceByPlayer.delete(player.id);
      const selected = this.#getSelectedItem(player);
      if (player.selectedSlotIndex !== pending.slot || selected?.typeId !== pending.itemTypeId) return;
      this.#performPlaceAction(player, selected, pending.target, pending.originTick);
    });
  }
  #performPlaceAction(player, itemStack, target, originTick) {
    if (!this.#claimPlaceAction(player.id, target, originTick)) return;
    this.#outlines.handlePlace(player, itemStack, target);
  }
  #claimPlaceAction(playerId, target, tick) {
    const signature = `${target.subLevelId}:${target.blockKey}:${target.face}`;
    const previous = this.#lastPlaceActionByPlayer.get(playerId);
    if (previous?.signature === signature && Math.abs(tick - previous.tick) <= PLACE_ACTION_DEDUP_WINDOW_TICKS) return false;
    this.#lastPlaceActionByPlayer.set(playerId, { signature, tick });
    return true;
  }
  #clearEditActionState(playerId) {
    this.#pendingPlaceByPlayer.delete(playerId);
    this.#pendingTouchBreakByPlayer.delete(playerId);
    this.#lastPlaceActionByPlayer.delete(playerId);
    this.#lastTouchBlockInteractionTickByPlayer.delete(playerId);
    this.#standingChestGestureTickByPlayer.delete(playerId);
  }
  #isSubLevelVisualEntity(entity) {
    if (entity.typeId === BLOCK_OUTLINE_ENTITY_TYPE_ID || entity.typeId === BLOCK_CRACK_ENTITY_TYPE_ID) return true;
    return this.#runtime.isVisualEntity(entity.dimension.id, entity.id);
  }
  /** Interactable blocks consume the gesture before other uses. */
  #tryPlayerStandingInteraction(player) {
    const handler = this.#interactionHandler;
    const target = this.#findStandingInteractionTarget(player);
    if (!target || !handler) return false;
    if (!handler.interact(player, target.handle, target.hit.block)) return false;
    return true;
  }
  #findStandingInteractionTarget(player) {
    const handler = this.#interactionHandler;
    if (handler?.hasSyncTargets && !handler.hasSyncTargets(player.dimension.id)) return void 0;
    const target = this.#raycastPlayerSubLevels(player, INTERACTION_REACH, true);
    if (!target || !handler?.canInteract(target.handle, target.hit.block)) return void 0;
    return target;
  }
  #claimStandingChestGesture(player) {
    if (player.inputInfo.lastInputModeUsed !== InputMode.KeyboardAndMouse || player.isSneaking) return;
    this.#standingChestGestureTickByPlayer.set(player.id, system.currentTick);
    this.#pendingPlaceByPlayer.delete(player.id);
  }
  #ownsStandingChestGesture(player) {
    const tick = this.#standingChestGestureTickByPlayer.get(player.id);
    if (tick === system.currentTick) return true;
    if (tick !== void 0) this.#standingChestGestureTickByPlayer.delete(player.id);
    return false;
  }
  /** Keep native container entities ready before a standing player interacts. */
  #syncStandingInteractionTargets() {
    const handler = this.#interactionHandler;
    if (!handler?.syncTarget) return;
    if (handler.hasSyncTargets && !handler.hasSyncTargets()) return;
    for (const player of this.#players.players()) {
      if (handler.hasSyncTargets && !handler.hasSyncTargets(player.dimension.id)) {
        handler.syncTarget(player, void 0, void 0);
        continue;
      }
      if (!this.#canInteract(player) || player.isSneaking) {
        handler.syncTarget(player, void 0, void 0);
        continue;
      }
      const target = this.#raycastPlayerSubLevels(player, INTERACTION_REACH, true);
      if (!target || !handler.canInteract(target.handle, target.hit.block)) {
        handler.syncTarget(player, void 0, void 0);
        continue;
      }
      handler.syncTarget(player, target.handle, target.hit.block);
    }
  }
  #releasePlayerInteractionSession(playerId) {
    this.#interactionHandler?.releasePlayer?.(playerId);
  }
  #raycastPlayerSubLevels(player, maximumDistance, ignorePassableBlocks = false) {
    if (!this.#runtime.hasSubLevels(player.dimension.id)) return void 0;
    let origin;
    let direction;
    try {
      origin = player.getHeadLocation();
      direction = normalize(player.getViewDirection());
    } catch {
      return void 0;
    }
    const raycastRevision = this.#runtime.getRaycastRevision(player.dimension.id);
    const cached = this.#raycastByPlayer.get(player.id);
    if (cached?.dimensionId === player.dimension.id && cached.raycastRevision === raycastRevision && cached.maximumDistance === maximumDistance && cached.ignorePassableBlocks === ignorePassableBlocks && vectorsEqual(cached.origin, origin) && vectorsEqual(cached.direction, direction)) return cached.result;
    let closest;
    for (const handle of this.#runtime.getRaycastCandidates(player.dimension.id)) {
      const hit = handle.raycast(origin, direction, maximumDistance, { ignorePassableBlocks });
      if (!hit || closest && hit.distance >= closest.hit.distance) continue;
      closest = { handle, direction, hit, origin };
    }
    if (!closest || this.#isWorldBlockBefore(player, origin, direction, closest.hit.distance)) closest = void 0;
    this.#raycastByPlayer.set(player.id, {
      raycastRevision,
      dimensionId: player.dimension.id,
      direction,
      ignorePassableBlocks,
      maximumDistance,
      origin,
      result: closest
    });
    return closest;
  }
  #isWorldBlockBefore(player, origin, direction, distanceToSubLevel) {
    try {
      const hit = player.getBlockFromViewDirection({
        includeLiquidBlocks: false,
        includePassableBlocks: false,
        maxDistance: WORLD_OCCLUSION_PROBE_REACH
      });
      if (!hit) return false;
      const point = {
        x: hit.block.location.x + hit.faceLocation.x,
        y: hit.block.location.y + hit.faceLocation.y,
        z: hit.block.location.z + hit.faceLocation.z
      };
      const blockDistance = dot(subtract(point, origin), direction);
      return blockDistance >= 0 && blockDistance + WORLD_BLOCK_OCCLUSION_EPSILON < distanceToSubLevel;
    } catch {
      return false;
    }
  }
  #canInteract(player) {
    try {
      return player.isValid && player.getGameMode() !== GameMode.Spectator;
    } catch {
      return false;
    }
  }
  #getSelectedItem(player) {
    try {
      return getInventory(player)?.container.getItem(player.selectedSlotIndex);
    } catch {
      return void 0;
    }
  }
}
function resolveSubLevelEditAction(swingSource, hasPendingPlace, inputMode, hasTouchItemUse = false, heldItemIsBlock = false) {
  if (inputMode === InputMode.Touch) {
    if (hasPendingPlace) return "place";
    if (hasTouchItemUse) return void 0;
    if (swingSource === EntitySwingSource.Mine) return "break";
    return void 0;
  }
  if (hasPendingPlace && swingSource === EntitySwingSource.Build) return "place";
  return swingSource === EntitySwingSource.Attack || swingSource === EntitySwingSource.Mine ? "break" : void 0;
}
function shouldSuppressTouchBreak(touchTapTick, breakOriginTick, observationTick) {
  if (touchTapTick === void 0) return false;
  return touchTapTick >= breakOriginTick - 1 && touchTapTick <= observationTick;
}
function canEatFoodNow(canAlwaysEat, currentHunger, maximumHunger) {
  return canAlwaysEat || currentHunger < maximumHunger;
}
function getInventory(player) {
  return player.getComponent("minecraft:inventory");
}
function shouldPrioritizeFoodUse(player, itemStack, includeVanillaFoodTag = false) {
  const food = itemStack.getComponent("minecraft:food");
  if (!food && !(includeVanillaFoodTag && itemStack.hasTag("minecraft:is_food"))) return false;
  const hunger = player.getComponent("minecraft:player.hunger");
  if (!hunger) throw new Error(`Player ${player.id} has no hunger component.`);
  return canEatFoodNow(food?.canAlwaysEat ?? false, hunger.currentValue, hunger.effectiveMax);
}
export {
  SubLevelPlayerInteractionController,
  canEatFoodNow,
  resolveSubLevelEditAction,
  shouldSuppressTouchBreak
};
