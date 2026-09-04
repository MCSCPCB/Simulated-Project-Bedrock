import {
  BlockTypes,
  EntitySwingSource,
  GameMode,
  InputButton,
  InputMode,
  system,
  world,
  type Entity,
  type EntityInventoryComponent,
  type ItemStack,
  type ItemUseBeforeEvent,
  type Player,
  type PlayerSwingStartAfterEvent,
  type Vector3
} from "@minecraft/server";
import { ActivePlayerRegistry } from "../../api/player/ActivePlayerRegistry.js";
import {
  dot,
  normalizeFinite as normalize,
  subtract,
  vectorsEqual
} from "../../util/SableVector3Utils.js";
import type { SubLevelBlock } from "../../sublevel/SubLevel.js";
import type {
  SubLevelInteractionHandle,
  SubLevelInteractionSystem
} from "../../sublevel/system/SubLevelInteractionSystem.js";
import {
  BLOCK_CRACK_ENTITY_TYPE_ID,
  BLOCK_OUTLINE_ENTITY_TYPE_ID,
  INTERACTION_REACH,
  SubLevelOutlineController,
  WORLD_BLOCK_OCCLUSION_EPSILON,
  type SubLevelBlockBreakHandler,
  type SubLevelBlockMiningEffectHandler,
  type SubLevelBlockPlaceHandler,
  type SubLevelBlockPlacementEffectHandler,
  type SubLevelOutlineActionTarget,
  type SubLevelRaycastResult
} from "../block_outline_render/SubLevelOutlineController.js";

// Break/place gestures can emit the same action from adjacent ticks (native
// event plus deferred swing); treat a same-target repeat inside this window as
// one action.
const PLACE_ACTION_DEDUP_WINDOW_TICKS = 1;
/** World blocks slightly beyond interaction reach still occlude selection rays. */
const WORLD_OCCLUSION_PROBE_REACH = 7;

interface SubLevelRaycastCache {
  readonly raycastRevision: number;
  readonly dimensionId: string;
  readonly direction: Vector3;
  /** Interaction rays traverse passable foliage; selection rays do not. */
  readonly ignorePassableBlocks: boolean;
  readonly maximumDistance: number;
  readonly origin: Vector3;
  readonly result: SubLevelRaycastResult | undefined;
}

interface PendingPlaceAction {
  readonly itemTypeId: string;
  readonly originTick: number;
  readonly player: Player;
  readonly slot: number;
  readonly target: SubLevelOutlineActionTarget;
}

interface PendingTouchBreakAction {
  readonly itemTypeId?: string;
  readonly slot: number;
  readonly target: SubLevelOutlineActionTarget;
}

interface CompletedPlaceAction {
  readonly signature: string;
  readonly tick: number;
}

export type SubLevelEditAction = "break" | "place";

export interface SubLevelBlockInteractionHandler {
  canInteract(handle: SubLevelInteractionHandle, block: SubLevelBlock): boolean;
  interact(player: Player, handle: SubLevelInteractionHandle, block: SubLevelBlock): boolean;
  /** When false, every syncTarget call would be a no-op and may be skipped. */
  hasSyncTargets?(dimensionId?: string): boolean;
  releasePlayer?(playerId: string): void;
  syncTarget?(
    player: Player,
    handle: SubLevelInteractionHandle | undefined,
    block: SubLevelBlock | undefined
  ): void;
  tick?(currentTick: number): void;
}

export class SubLevelPlayerInteractionController {
  readonly #lastPlaceActionByPlayer = new Map<string, CompletedPlaceAction>();
  readonly #lastTouchBlockInteractionTickByPlayer = new Map<string, number>();
  readonly #pendingPlaceByPlayer = new Map<string, PendingPlaceAction>();
  readonly #pendingTouchBreakByPlayer = new Map<string, PendingTouchBreakAction>();
  readonly #raycastByPlayer = new Map<string, SubLevelRaycastCache>();
  readonly #standingChestGestureTickByPlayer = new Map<string, number>();
  readonly #players = new ActivePlayerRegistry();
  readonly #runtime: SubLevelInteractionSystem;
  readonly #outlines: SubLevelOutlineController;
  #interactionHandler?: SubLevelBlockInteractionHandler;
  #started = false;

  constructor(runtime: SubLevelInteractionSystem) {
    this.#runtime = runtime;
    this.#outlines = new SubLevelOutlineController(runtime, this.#players);
  }

  tick(currentTick: number): void {
    this.#syncStandingInteractionTargets();
    this.#interactionHandler?.tick?.(currentTick);
    this.#outlines.tick(currentTick);
  }

  handleVisualEntityLoad(entity: Entity): void {
    this.#outlines.handleEntityLoad(entity);
  }

  setBlockBreakHandler(handler: SubLevelBlockBreakHandler): void {
    this.#outlines.setBreakHandler(handler);
  }

  setBlockMiningEffectHandler(handler: SubLevelBlockMiningEffectHandler): void {
    this.#outlines.setMiningEffectHandler(handler);
  }

  setBlockPlaceHandler(handler: SubLevelBlockPlaceHandler): void {
    this.#outlines.setPlaceHandler(handler);
  }

  setBlockPlacementEffectHandler(
    handler: SubLevelBlockPlacementEffectHandler
  ): void {
    this.#outlines.setPlacementEffectHandler(handler);
  }

  setBlockInteractHandler(handler: SubLevelBlockInteractionHandler): void {
    this.#interactionHandler = handler;
    this.#outlines.setInteractionTargetSuppressor(
      (handle, block) => handler.canInteract(handle, block)
    );
  }

  start(): void {
    if (this.#started) return;
    this.#started = true;
    this.#players.start();
    this.#outlines.start();
    world.beforeEvents.itemUse.subscribe(event => this.#handleItemUse(event));
    world.afterEvents.itemStartUse.subscribe(event => {
      const { itemStack, source } = event;
      if (source.inputInfo.lastInputModeUsed !== InputMode.Touch) return;
      const pending = this.#pendingTouchBreakByPlayer.get(source.id);
      if (
        pending
        && pending.slot === source.selectedSlotIndex
        && pending.itemTypeId === itemStack.typeId
      ) this.#pendingTouchBreakByPlayer.delete(source.id);
    });
    world.beforeEvents.playerBreakBlock.subscribe(event => {
      if (this.#outlines.isManagedInteractionTarget(event.dimension, event.block)) {
        event.cancel = true;
        return;
      }
      if (this.#outlines.captureActionTarget(event.player)) {
        event.cancel = true;
      }
    });
    world.beforeEvents.playerInteractWithBlock.subscribe(event => {
      const { itemStack, player } = event;
      const heldItemIsBlock = itemStack !== undefined
        && BlockTypes.get(itemStack.typeId) !== undefined;
      if (
        heldItemIsBlock
        && player.inputInfo.lastInputModeUsed === InputMode.KeyboardAndMouse
        && !player.isSneaking
        && this.#canInteract(player)
        && (
          this.#ownsStandingChestGesture(player)
          || this.#findStandingInteractionTarget(player) !== undefined
        )
      ) {
        event.cancel = true;
        this.#claimStandingChestGesture(player);
        return;
      }
      const target = this.#outlines.captureActionTarget(player);
      if (!target) return;
      if (heldItemIsBlock) event.cancel = true;
      if (player.inputInfo.lastInputModeUsed === InputMode.Touch) {
        // Every native block interaction is definitive non-mining evidence on
        // touch. Bedrock may mark rapid follow-up taps as repeated interaction
        // events, so retain the evidence even when isFirstEvent is false.
        this.#lastTouchBlockInteractionTickByPlayer.set(player.id, system.currentTick);
        this.#pendingTouchBreakByPlayer.delete(player.id);
      }
      if (!heldItemIsBlock || !itemStack) return;
      this.#queuePlaceAction(player, itemStack, target);
    });
    world.beforeEvents.entityHurt.subscribe(event => {
      if (this.#isSubLevelVisualEntity(event.hurtEntity)) event.cancel = true;
    });
    world.afterEvents.playerSwingStart.subscribe(event => this.#handleSwing(event));
    world.afterEvents.playerHotbarSelectedSlotChange.subscribe(event => {
      this.#clearEditActionState(event.player.id);
    });
    world.afterEvents.playerDimensionChange.subscribe(event => {
      this.#raycastByPlayer.delete(event.player.id);
      this.#releasePlayerInteractionSession(event.player.id);
      this.#clearEditActionState(event.player.id);
      this.#outlines.clearPlayer(event.player.id, true);
    });
    world.afterEvents.playerButtonInput.subscribe(event => {
      if (event.button !== InputButton.Sneak || !event.player.isSneaking) return;
      this.#interactionHandler?.syncTarget?.(event.player, undefined, undefined);
      this.#outlines.markInteractionTargetDirty(event.player.id);
    }, { buttons: [InputButton.Sneak] });
    world.afterEvents.playerSpawn.subscribe(event => {
      this.#raycastByPlayer.delete(event.player.id);
      this.#releasePlayerInteractionSession(event.player.id);
      this.#clearEditActionState(event.player.id);
      this.#outlines.clearPlayer(event.player.id, true);
    });
    world.afterEvents.entityDie.subscribe(event => {
      if (event.deadEntity.typeId !== "minecraft:player") return;
      this.#raycastByPlayer.delete(event.deadEntity.id);
      this.#releasePlayerInteractionSession(event.deadEntity.id);
      this.#clearEditActionState(event.deadEntity.id);
      this.#outlines.clearPlayer(event.deadEntity.id, true);
    });
    world.beforeEvents.playerLeave.subscribe(event => {
      const playerId = event.player.id;
      this.#raycastByPlayer.delete(playerId);
      this.#clearEditActionState(playerId);
      system.run(() => {
        this.#releasePlayerInteractionSession(playerId);
        this.#outlines.clearPlayer(playerId, true);
      });
    });
  }

  #handleItemUse(event: ItemUseBeforeEvent): void {
    const player = event.source;
    if (
      !player.isSneaking
      && this.#canInteract(player)
      && this.#tryPlayerStandingInteraction(player)
    ) {
      this.#claimStandingChestGesture(player);
      return;
    }
    if (!this.#canInteract(player)) return;
    const inputMode = player.inputInfo.lastInputModeUsed;
    if (shouldPrioritizeFoodUse(player, event.itemStack, inputMode === InputMode.Touch)) return;
    const target = this.#outlines.captureActionTarget(player);
    if (!target) return;
    if (inputMode === InputMode.Touch) {
      if (
        this.#pendingPlaceByPlayer.has(player.id)
        || this.#shouldSuppressTouchBreak(
          player.id,
          system.currentTick,
          system.currentTick
        )
      ) {
        event.cancel = true;
        return;
      }
      // Let the engine reveal sustained vanilla use through itemStartUse.
      // The deferred break remains pending only for a plain touch hold.
      this.#queueTouchBreakAction(player, event.itemStack, target);
      return;
    }
    // Desktop block placement is handled exclusively by playerInteractWithBlock.
  }

  #handleSwing(event: PlayerSwingStartAfterEvent): void {
    const { player, swingSource } = event;
    if (!this.#canInteract(player)) return;
    const itemStack = event.heldItemStack ?? this.#getSelectedItem(player);
    if (!player.isSneaking && !itemStack) return;
    const pending = this.#pendingPlaceByPlayer.get(player.id);
    const pendingTouchBreak = this.#pendingTouchBreakByPlayer.get(player.id);
    const editAction = resolveSubLevelEditAction(
      swingSource,
      pending !== undefined,
      player.inputInfo.lastInputModeUsed,
      pendingTouchBreak !== undefined,
      itemStack !== undefined && BlockTypes.get(itemStack.typeId) !== undefined
    );
    if (editAction === "break") {
      if (
        player.inputInfo.lastInputModeUsed === InputMode.Touch
        && swingSource === EntitySwingSource.Mine
        && pendingTouchBreak === undefined
      ) {
        const target = this.#outlines.captureActionTarget(player);
        if (!target) {
          this.#outlines.handleBreak(player, itemStack, target);
          return;
        }
        // A tap may report Mine on either side of its native block interaction.
        // Resolve it next tick so the interaction can cancel the pending action.
        this.#queueTouchBreakAction(player, itemStack, target);
        return;
      }
      if (pending) this.#pendingPlaceByPlayer.delete(player.id);
      if (pendingTouchBreak) this.#pendingTouchBreakByPlayer.delete(player.id);
      if (
        pendingTouchBreak
        && (
          pendingTouchBreak.slot !== player.selectedSlotIndex
          || pendingTouchBreak.itemTypeId !== itemStack?.typeId
        )
      ) return;
      const target = pendingTouchBreak?.target ?? this.#outlines.captureActionTarget(player);
      if (!target) {
        this.#outlines.handleBreak(player, itemStack, target);
        return;
      }
      this.#performBreakAction(player, itemStack, target);
      return;
    }
    if (editAction !== "place") return;

    if (pending) this.#pendingPlaceByPlayer.delete(player.id);
    if (pendingTouchBreak) this.#pendingTouchBreakByPlayer.delete(player.id);
    if (!itemStack || !BlockTypes.get(itemStack.typeId)) return;
    if (
      pending
      && (pending.slot !== player.selectedSlotIndex || pending.itemTypeId !== itemStack.typeId)
    ) return;
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
  #queueTouchBreakAction(
    player: Player,
    itemStack: ItemStack | undefined,
    target: SubLevelOutlineActionTarget
  ): void {
    const originTick = system.currentTick;
    if (this.#shouldSuppressTouchBreak(
      player.id,
      originTick,
      originTick
    )) return;
    const pending: PendingTouchBreakAction = {
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
      const selected = this.#getSelectedItem(player);
      if (
        player.selectedSlotIndex !== pending.slot
        || selected?.typeId !== pending.itemTypeId
      ) return;
      this.#performBreakAction(player, selected, pending.target);
    });
  }

  #performBreakAction(
    player: Player,
    itemStack: ItemStack | undefined,
    target: SubLevelOutlineActionTarget
  ): void {
    this.#outlines.handleBreak(player, itemStack, target);
  }

  #shouldSuppressTouchBreak(
    playerId: string,
    breakOriginTick: number,
    observationTick: number
  ): boolean {
    return shouldSuppressTouchBreak(
      this.#lastTouchBlockInteractionTickByPlayer.get(playerId),
      breakOriginTick,
      observationTick
    );
  }

  /** Touch placement resolves on the next tick; other input modes wait for Build. */
  #queuePlaceAction(
    player: Player,
    itemStack: ItemStack,
    target: SubLevelOutlineActionTarget
  ): void {
    const pending: PendingPlaceAction = {
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
      if (
        player.selectedSlotIndex !== pending.slot
        || selected?.typeId !== pending.itemTypeId
      ) return;
      this.#performPlaceAction(player, selected, pending.target, pending.originTick);
    });
  }

  #performPlaceAction(
    player: Player,
    itemStack: ItemStack,
    target: SubLevelOutlineActionTarget,
    originTick: number
  ): void {
    if (!this.#claimPlaceAction(player.id, target, originTick)) return;
    this.#outlines.handlePlace(player, itemStack, target);
  }

  #claimPlaceAction(
    playerId: string,
    target: SubLevelOutlineActionTarget,
    tick: number
  ): boolean {
    const signature = `${target.subLevelId}:${target.blockKey}:${target.face}`;
    const previous = this.#lastPlaceActionByPlayer.get(playerId);
    if (
      previous?.signature === signature
      && Math.abs(tick - previous.tick) <= PLACE_ACTION_DEDUP_WINDOW_TICKS
    ) return false;
    this.#lastPlaceActionByPlayer.set(playerId, { signature, tick });
    return true;
  }

  #clearEditActionState(playerId: string): void {
    this.#pendingPlaceByPlayer.delete(playerId);
    this.#pendingTouchBreakByPlayer.delete(playerId);
    this.#lastPlaceActionByPlayer.delete(playerId);
    this.#lastTouchBlockInteractionTickByPlayer.delete(playerId);
    this.#standingChestGestureTickByPlayer.delete(playerId);
  }

  #isSubLevelVisualEntity(entity: Entity): boolean {
    if (entity.typeId === BLOCK_OUTLINE_ENTITY_TYPE_ID
      || entity.typeId === BLOCK_CRACK_ENTITY_TYPE_ID) return true;
    return this.#runtime.isVisualEntity(entity.dimension.id, entity.id);
  }

  /** Interactable blocks consume the gesture before other uses. */
  #tryPlayerStandingInteraction(player: Player): boolean {
    const handler = this.#interactionHandler;
    const target = this.#findStandingInteractionTarget(player);
    if (!target || !handler) return false;
    if (!handler.interact(player, target.handle, target.hit.block)) return false;
    return true;
  }

  #findStandingInteractionTarget(player: Player): SubLevelRaycastResult | undefined {
    const handler = this.#interactionHandler;
    if (handler?.hasSyncTargets && !handler.hasSyncTargets(player.dimension.id)) return undefined;
    // Interaction aims through passable foliage: a chest behind leaves should
    // respond to the same crosshair that resolves to a leaf for selection.
    const target = this.#raycastPlayerSubLevels(player, INTERACTION_REACH, true);
    if (!target || !handler?.canInteract(target.handle, target.hit.block)) return undefined;
    return target;
  }

  #claimStandingChestGesture(player: Player): void {
    if (
      player.inputInfo.lastInputModeUsed !== InputMode.KeyboardAndMouse
      || player.isSneaking
    ) return;
    this.#standingChestGestureTickByPlayer.set(player.id, system.currentTick);
    // A block interaction can arrive before or after itemUse. In either order,
    // a chest-owned gesture must not leave a placement that a later Build swing
    // could commit.
    this.#pendingPlaceByPlayer.delete(player.id);
  }

  #ownsStandingChestGesture(player: Player): boolean {
    const tick = this.#standingChestGestureTickByPlayer.get(player.id);
    if (tick === system.currentTick) return true;
    if (tick !== undefined) this.#standingChestGestureTickByPlayer.delete(player.id);
    return false;
  }

  /** Keep native container entities ready before a standing player interacts. */
  #syncStandingInteractionTargets(): void {
    const handler = this.#interactionHandler;
    if (!handler?.syncTarget) return;
    // Without any live storage the per-player raycasts below feed only no-op
    // syncTarget calls, so the whole pass can be skipped.
    if (handler.hasSyncTargets && !handler.hasSyncTargets()) return;
    for (const player of this.#players.players()) {
      if (handler.hasSyncTargets && !handler.hasSyncTargets(player.dimension.id)) {
        // A player can carry a preview into a dimension with no storage. Keep
        // the release call while avoiding a raycast that cannot find a target.
        handler.syncTarget(player, undefined, undefined);
        continue;
      }
      if (!this.#canInteract(player) || player.isSneaking) {
        handler.syncTarget(player, undefined, undefined);
        continue;
      }
      const target = this.#raycastPlayerSubLevels(player, INTERACTION_REACH, true);
      if (!target || !handler.canInteract(target.handle, target.hit.block)) {
        handler.syncTarget(player, undefined, undefined);
        continue;
      }
      handler.syncTarget(player, target.handle, target.hit.block);
    }
  }

  #releasePlayerInteractionSession(playerId: string): void {
    this.#interactionHandler?.releasePlayer?.(playerId);
  }

  #raycastPlayerSubLevels(
    player: Player,
    maximumDistance: number,
    ignorePassableBlocks = false
  ): SubLevelRaycastResult | undefined {
    // Without sub-levels the ray can never hit; skip the native player reads.
    if (!this.#runtime.hasSubLevels(player.dimension.id)) return undefined;
    let origin: Vector3;
    let direction: Vector3;
    try {
      origin = player.getHeadLocation();
      direction = normalize(player.getViewDirection());
    } catch {
      return undefined;
    }
    const raycastRevision = this.#runtime.getRaycastRevision(player.dimension.id);
    const cached = this.#raycastByPlayer.get(player.id);
    if (
      cached?.dimensionId === player.dimension.id
      && cached.raycastRevision === raycastRevision
      && cached.maximumDistance === maximumDistance
      && cached.ignorePassableBlocks === ignorePassableBlocks
      && vectorsEqual(cached.origin, origin)
      && vectorsEqual(cached.direction, direction)
    ) return cached.result;

    let closest: SubLevelRaycastResult | undefined;
    for (const handle of this.#runtime.getRaycastCandidates(player.dimension.id)) {
      const hit = handle.raycast(origin, direction, maximumDistance, { ignorePassableBlocks });
      if (!hit || (closest && hit.distance >= closest.hit.distance)) continue;
      closest = { handle, direction, hit, origin };
    }
    if (
      !closest
      || this.#isWorldBlockBefore(player, origin, direction, closest.hit.distance)
    ) closest = undefined;
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

  #isWorldBlockBefore(
    player: Player,
    origin: Vector3,
    direction: Vector3,
    distanceToSubLevel: number
  ): boolean {
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
      return blockDistance >= 0
        && blockDistance + WORLD_BLOCK_OCCLUSION_EPSILON < distanceToSubLevel;
    } catch {
      return false;
    }
  }

  #canInteract(player: Player): boolean {
    try {
      return player.isValid && player.getGameMode() !== GameMode.Spectator;
    } catch {
      return false;
    }
  }

  #getSelectedItem(player: Player): ItemStack | undefined {
    try {
      return getInventory(player)?.container.getItem(player.selectedSlotIndex);
    } catch {
      return undefined;
    }
  }
}

export function resolveSubLevelEditAction(
  swingSource: EntitySwingSource,
  hasPendingPlace: boolean,
  inputMode: InputMode,
  hasTouchItemUse = false,
  heldItemIsBlock = false
): SubLevelEditAction | undefined {
  // On touch, itemUse marks a hold while native block interaction identifies a tap.
  if (inputMode === InputMode.Touch) {
    // A cancellable native block interaction is stronger than every swing or
    // item-use signal emitted by the same gesture.
    if (hasPendingPlace) return "place";
    // A hold is resolved on the next tick so itemStartUse can preserve food
    // and other sustained vanilla item actions before the break is committed.
    if (hasTouchItemUse) return undefined;
    if (swingSource === EntitySwingSource.Mine) return "break";
    return undefined;
  }
  // A cancellable native use event is stronger evidence of placement than the
  // accompanying generic swing. On keyboard and mouse, the native block
  // interaction is therefore required before a Build swing can place.
  if (hasPendingPlace && swingSource === EntitySwingSource.Build) return "place";
  return swingSource === EntitySwingSource.Attack
    || swingSource === EntitySwingSource.Mine
    ? "break"
    : undefined;
}

/** A touch break signal adjacent to a native block interaction belongs to that interaction. */
export function shouldSuppressTouchBreak(
  touchTapTick: number | undefined,
  breakOriginTick: number,
  observationTick: number
): boolean {
  if (touchTapTick === undefined) return false;
  return touchTapTick >= breakOriginTick - 1
    && touchTapTick <= observationTick;
}

export function canEatFoodNow(
  canAlwaysEat: boolean,
  currentHunger: number,
  maximumHunger: number
): boolean {
  return canAlwaysEat || currentHunger < maximumHunger;
}

/** May throw on an invalid player; the only caller (#getSelectedItem) catches. */
function getInventory(player: Player): EntityInventoryComponent | undefined {
  return player.getComponent("minecraft:inventory") as EntityInventoryComponent | undefined;
}

function shouldPrioritizeFoodUse(
  player: Player,
  itemStack: ItemStack,
  includeVanillaFoodTag = false
): boolean {
  const food = itemStack.getComponent("minecraft:food");
  if (!food && !(includeVanillaFoodTag && itemStack.hasTag("minecraft:is_food"))) return false;
  const hunger = player.getComponent("minecraft:player.hunger");
  if (!hunger) throw new Error(`Player ${player.id} has no hunger component.`);
  return canEatFoodNow(food?.canAlwaysEat ?? false, hunger.currentValue, hunger.effectiveMax);
}
