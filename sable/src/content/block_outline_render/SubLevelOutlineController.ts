import {
  BlockTypes,
  GameMode,
  InputMode,
  system,
  world,
  type Block,
  type Container,
  type Dimension,
  type Entity,
  type ItemStack,
  type Player,
  type Vector3
} from "@minecraft/server";
import type { ActivePlayerRegistry } from "../../api/player/ActivePlayerRegistry.js";
import { createAabbOutline } from "./SubLevelOutlineGeometry.js";
import {
  BREAK_OVERLAY_TRANSFORM_EPSILON_SQUARED,
  RAY_REFRESH_TICKS,
  breakOverlayLocation,
  createBlockPreviewTransform,
  hasViewDirectionChanged,
  isPlayerHeadInsideSubLevelPlacement,
  resolvePlacementCardinalDirection,
  shouldRefreshOutlineRay,
  vectorComponentsEqual
} from "./SubLevelOutlineMolang.js";
import { getSubLevelBlockRegistration } from "../../sublevel/render/fancy/model/FancySubLevelModelRegistry.js";
import {
  VANILLA_DIMENSION_IDS,
  blockLocationKey as blockKey,
  dot,
  normalizeFinite as normalize,
  squaredDistance,
  subtract
} from "../../util/SableVector3Utils.js";
import {
  canPlayerBreakSubLevelBlock,
  canPlayerPlaceSubLevelBlock,
  damageSelectedToolForSubLevelBreak
} from "../punching/SubLevelBlockPermissions.js";
import {
  PLAYER_EDIT_MINING_RESET_TICKS,
  SubLevelMiningProgress
} from "../punching/SubLevelMiningProgress.js";
import { getSubLevelMiningTargetTicks } from "../punching/SubLevelMiningTime.js";
import type {
  SubLevelInteractionHandle,
  SubLevelInteractionRaycastHit,
  SubLevelInteractionSystem
} from "../../sublevel/system/SubLevelInteractionSystem.js";
import { SubLevelInteractionTargetBlockController } from "../block_placement/SubLevelInteractionTargetBlock.js";

export const BLOCK_OUTLINE_ENTITY_TYPE_ID = "sable:block_outline";
export const BLOCK_CRACK_ENTITY_TYPE_ID = "sable:block_crack";

// Per-player property overrides and per-entity properties consumed by the
// outline/break client entities.
const OUTLINE_VISIBLE_PROPERTY = "sable:visible";
const OUTLINE_BLOCK_PREVIEW_PROPERTY = "sable:block_preview";
const OUTLINE_PREVIEW_X_PROPERTY = "sable:preview_x";
const OUTLINE_PREVIEW_Y_PROPERTY = "sable:preview_y";
const OUTLINE_PREVIEW_Z_PROPERTY = "sable:preview_z";
const OUTLINE_PREVIEW_SIDE_PROPERTY = "sable:preview_side";
const BREAK_OVERLAY_PITCH_PROPERTY = "sable:pitch";
const BREAK_OVERLAY_YAW_PROPERTY = "sable:yaw";
const BREAK_OVERLAY_ROLL_PROPERTY = "sable:roll";
const BREAK_OVERLAY_STAGE_PROPERTY = "sable:break_stage";

/** Shared with every interaction raycast so all resolve the same crosshair. */
export const INTERACTION_REACH = 5;
/** Minimum margin by which a world block must precede a sub-level hit to occlude it. */
export const WORLD_BLOCK_OCCLUSION_EPSILON = 0.05;
const OUTLINE_FADE_TICKS = 5;
const INITIAL_OUTLINE_REVEAL_DELAY_TICKS = 4;
/** The client entity needs this long after spawning before it accepts property writes. */
const OUTLINE_ENTITY_READY_DELAY_TICKS = 2;
const BREAK_OVERLAY_INITIAL_POSE_DELAY_TICKS = 1;
const DEFAULT_BLOCK_HARDNESS = 1;

export interface SubLevelRaycastResult {
  readonly handle: SubLevelInteractionHandle;
  readonly direction: Vector3;
  readonly hit: SubLevelInteractionRaycastHit;
  readonly origin: Vector3;
}

interface RayCache {
  readonly raycastRevision: number;
  readonly result?: SubLevelRaycastResult;
  readonly tick: number;
}
interface PlayerOutlineState {
  activeSubLevelId?: number;
  interactionTargetDirty?: boolean;
  lastDirection?: Vector3;
  lastOrigin?: Vector3;
  lastRayTick: number;
  mode?: "block";
  rayCache?: RayCache;
  shapeSignature?: string;
  targetBlockKey?: string;
}

interface OutlineViewer {
  fadeEndTick?: number;
  revealTick: number;
  revealed: boolean;
}

interface SharedOutlineRecord {
  readonly handle: SubLevelInteractionHandle;
  readonly entity: Entity;
  readonly viewers: Map<string, OutlineViewer>;
  contentRevision: number;
  readyTick: number;
}

interface SharedBreakOverlayRecord {
  readonly handle: SubLevelInteractionHandle;
  readonly entity: Entity;
  readonly key: string;
  readonly localLocation: Vector3;
  lastLocation: Vector3;
  lastProgressTick: number;
  lastRotation?: Vector3;
  publishedStage?: number;
  readonly readyTick: number;
  targetStage: number;
}

export interface SubLevelOutlineActionTarget {
  readonly subLevelId: number;
  readonly blockKey: string;
  readonly face: SubLevelInteractionRaycastHit["face"];
}

export type SubLevelBlockBreakHandler = (
  player: Player,
  itemStack: ItemStack | undefined,
  handle: SubLevelInteractionHandle,
  block: import("../../sublevel/SubLevel.js").SubLevelBlock
) => boolean;

export type SubLevelBlockMiningEffectHandler = (
  handle: SubLevelInteractionHandle,
  block: import("../../sublevel/SubLevel.js").SubLevelBlock
) => void;

export type SubLevelBlockPlaceHandler = (
  player: Player,
  itemStack: ItemStack,
  handle: SubLevelInteractionHandle,
  block: import("../../sublevel/SubLevel.js").SubLevelBlock,
  placement: Vector3,
  cardinalDirection: "north" | "east" | "south" | "west"
) => boolean;

export type SubLevelBlockPlacementEffectHandler = (
  handle: SubLevelInteractionHandle,
  block: import("../../sublevel/SubLevel.js").SubLevelBlock
) => void;

type InteractionTargetSuppressor = (
  handle: SubLevelInteractionHandle,
  block: import("../../sublevel/SubLevel.js").SubLevelBlock
) => boolean;

/** Maintains private outlines and world-visible mining overlays for projected sub-levels. */
export class SubLevelOutlineController {
  readonly #players: ActivePlayerRegistry;
  readonly #runtime: SubLevelInteractionSystem;
  readonly #records = new Map<number, SharedOutlineRecord>();
  readonly #breakOverlays = new Map<string, SharedBreakOverlayRecord>();
  readonly #states = new Map<string, PlayerOutlineState>();
  readonly #interactionTargets = new SubLevelInteractionTargetBlockController();
  readonly #trackedEntityIds = new Set<string>();
  readonly #miningProgress = new SubLevelMiningProgress();
  #startupCleanupComplete = false;
  #startupCleanupScheduled = false;
  #breakHandler?: SubLevelBlockBreakHandler;
  #miningEffectHandler?: SubLevelBlockMiningEffectHandler;
  #placeHandler?: SubLevelBlockPlaceHandler;
  #placementEffectHandler?: SubLevelBlockPlacementEffectHandler;
  #interactionTargetSuppressor?: InteractionTargetSuppressor;

  constructor(runtime: SubLevelInteractionSystem, players: ActivePlayerRegistry) {
    this.#runtime = runtime;
    this.#players = players;
  }

  setBreakHandler(handler: SubLevelBlockBreakHandler | undefined): void {
    this.#breakHandler = handler;
  }

  setMiningEffectHandler(handler: SubLevelBlockMiningEffectHandler | undefined): void {
    this.#miningEffectHandler = handler;
  }

  setPlaceHandler(handler: SubLevelBlockPlaceHandler | undefined): void {
    this.#placeHandler = handler;
  }

  setPlacementEffectHandler(
    handler: SubLevelBlockPlacementEffectHandler | undefined
  ): void {
    this.#placementEffectHandler = handler;
  }

  setInteractionTargetSuppressor(suppressor: InteractionTargetSuppressor | undefined): void {
    this.#interactionTargetSuppressor = suppressor;
  }

  markInteractionTargetDirty(playerId: string): void {
    const state = this.#states.get(playerId);
    if (state) state.interactionTargetDirty = true;
  }

  start(): void {
    if (this.#startupCleanupScheduled) return;
    this.#startupCleanupScheduled = true;
    this.#interactionTargets.start();
    // Dimension queries are unavailable during early execution. No managed
    // outline or break entity may spawn until reload cleanup completes.
    system.run(() => {
      for (const dimensionId of VANILLA_DIMENSION_IDS) {
        const dimension = world.getDimension(dimensionId);
        for (const typeId of [
          BLOCK_OUTLINE_ENTITY_TYPE_ID,
          BLOCK_CRACK_ENTITY_TYPE_ID
        ]) {
          for (const entity of dimension.getEntities({ type: typeId })) {
            if (entity.isValid) entity.remove();
          }
        }
      }
      this.#startupCleanupComplete = true;
    });
  }

  tick(currentTick: number): void {
    if (!this.#startupCleanupComplete) return;
    this.#miningProgress.prune(currentTick);
    this.#tickBreakOverlays(currentTick);
    const tickedPlayerIds = new Set<string>();
    for (const player of this.#players.players()) {
      tickedPlayerIds.add(player.id);
      this.#tickPlayer(player, currentTick);
    }
    for (const playerId of this.#states.keys()) {
      if (!tickedPlayerIds.has(playerId)) this.clearPlayer(playerId, false);
    }
    this.#finishFades(currentTick);
  }

  captureActionTarget(player: Player): SubLevelOutlineActionTarget | undefined {
    if (!this.#startupCleanupComplete) return undefined;
    const result = this.#raycastForEvent(player);
    return result ? actionTargetFromResult(result) : undefined;
  }

  isManagedInteractionTarget(dimension: Dimension, block: Block): boolean {
    return this.#interactionTargets.isManagedBlock(dimension, block);
  }

  handleBreak(
    player: Player,
    itemStack: ItemStack | undefined,
    expected?: SubLevelOutlineActionTarget
  ): void {
    if (!this.#startupCleanupComplete) return;
    const result = this.#validatedActionResult(player, expected);
    if (!result) return;
    if (!canPlayerBreakSubLevelBlock(player, itemStack, result.hit.block.typeId)) return;
    const registration = getSubLevelBlockRegistration(result.hit.block.typeId);
    if (registration === undefined) return;
    const targetKey = blockKey(result.hit.block.localLocation);
    const progress = this.#miningProgress.advance(
      `${result.handle.id}|${targetKey}`,
      system.currentTick,
      getSubLevelMiningTargetTicks(
        registration.hardness ?? DEFAULT_BLOCK_HARDNESS,
        itemStack
      ),
      player.inputInfo.lastInputModeUsed === InputMode.Touch
        ? { playerId: player.id, type: "touch" }
        : { type: "attack" }
    );
    if (!progress) return;
    if (!progress.completed) {
      this.#setSharedMiningStage(result.handle, result.hit.block, progress.stage);
    }
    if (!progress.completed && progress.stageChanged) {
      if (!this.#miningEffectHandler) {
        throw new Error("Sub-level block mining effect handler is not configured.");
      }
      this.#miningEffectHandler(result.handle, result.hit.block);
    }
    if (!progress.completed) return;
    this.#clearSharedMiningStage(result.handle.id, targetKey);
    if (!this.#breakHandler) {
      throw new Error("Sub-level block break handler is not configured.");
    }
    if (this.#breakHandler(player, itemStack, result.handle, result.hit.block)) {
      damageSelectedToolForSubLevelBreak(player, itemStack);
      this.#miningProgress.clearSubLevel(String(result.handle.id));
      this.#clearSubLevelBreakOverlays(result.handle.id);
    }
  }

  handlePlace(
    player: Player,
    itemStack: ItemStack,
    expected?: SubLevelOutlineActionTarget
  ): void {
    if (!this.#startupCleanupComplete || !BlockTypes.get(itemStack.typeId)) return;
    const result = this.#validatedActionResult(player, expected);
    if (!result) return;
    if (!canPlayerPlaceSubLevelBlock(player, itemStack, result.hit.block.typeId)) return;
    if (!result.handle.supportsBlockPlacement) return;
    const placement = this.#getPlacementTarget(result, itemStack);
    if (!placement) return;
    if (isPlayerHeadInsideSubLevelPlacement(
      player.getHeadLocation(),
      placement,
      point => result.handle.worldPointToLocal(point)
    )) return;
    if (!this.#placeHandler) {
      throw new Error("Sub-level block place handler is not configured.");
    }
    const cardinalDirection = resolvePlacementCardinalDirection(
      point => result.handle.worldPointToLocal(point),
      result.origin,
      result.direction
    );
    const consumed = consumeSelectedBlock(player, itemStack);
    let placed: boolean;
    try {
      placed = this.#placeHandler(
        player,
        itemStack,
        result.handle,
        result.hit.block,
        placement,
        cardinalDirection
      );
    } catch (error) {
      restoreSelectedBlock(player, consumed);
      throw error;
    }
    if (!placed) {
      restoreSelectedBlock(player, consumed);
      return;
    }
    const placedBlock = result.handle.getBlockAtLocalLocation(placement);
    if (!placedBlock || placedBlock.typeId !== itemStack.typeId) {
      throw new Error(`Placed sub-level block ${itemStack.typeId} is unavailable for effects.`);
    }
    if (!this.#placementEffectHandler) {
      throw new Error("Sub-level block placement effect handler is not configured.");
    }
    this.#placementEffectHandler(result.handle, placedBlock);
  }

  clearPlayer(playerId: string, immediate: boolean): void {
    this.#miningProgress.clearPlayer(playerId);
    const state = this.#states.get(playerId);
    if (state) this.#clearInteractionTargets(playerId);
    if (state?.activeSubLevelId !== undefined) {
      this.#releaseViewer(playerId, state.activeSubLevelId, immediate);
    }
    this.#states.delete(playerId);
  }

  /** Remove outline entities left by a script reload, while retaining entities created this tick. */
  handleEntityLoad(entity: Entity): void {
    if (entity.typeId !== BLOCK_OUTLINE_ENTITY_TYPE_ID
      && entity.typeId !== BLOCK_CRACK_ENTITY_TYPE_ID) return;
    system.run(() => {
      if (entity.isValid && !this.#trackedEntityIds.has(entity.id)) entity.remove();
    });
  }

  #tickPlayer(player: Player, currentTick: number): void {
    if (!this.#canPreview(player)) {
      this.clearPlayer(player.id, false);
      return;
    }
    const state = this.#states.get(player.id) ?? {
      lastRayTick: currentTick - RAY_REFRESH_TICKS
    };
    this.#states.set(player.id, state);

    let direction: Vector3;
    let origin: Vector3;
    try {
      direction = normalize(player.getViewDirection());
      origin = player.getHeadLocation();
    } catch {
      this.clearPlayer(player.id, true);
      return;
    }
    const viewChanged = (
      state.lastDirection !== undefined
      && hasViewDirectionChanged(state.lastDirection, direction)
    ) || (state.lastOrigin !== undefined && !vectorComponentsEqual(state.lastOrigin, origin));
    state.lastDirection = direction;
    state.lastOrigin = origin;
    const subLevelMoving = state.rayCache?.result?.handle.isMoving === true
      || state.rayCache?.raycastRevision
        !== this.#runtime.getRaycastRevision(player.dimension.id);
    const refresh = shouldRefreshOutlineRay(
      state.mode,
      currentTick - state.lastRayTick,
      viewChanged,
      subLevelMoving
    );
    if (refresh) {
      state.rayCache = {
        raycastRevision: this.#runtime.getRaycastRevision(player.dimension.id),
        result: this.#raycastPlayerSubLevels(player, origin, direction),
        tick: currentTick
      };
      state.lastRayTick = currentTick;
    }
    const result = state.rayCache?.result;
    if (!result) {
      this.#clearInteractionTargets(player.id);
      if (state.activeSubLevelId !== undefined) {
        this.#releaseViewer(player.id, state.activeSubLevelId, false);
      }
      state.activeSubLevelId = undefined;
      state.mode = undefined;
      state.shapeSignature = undefined;
      return;
    }

    this.#syncInteractionTargets(player, result, refresh || state.interactionTargetDirty === true);
    state.interactionTargetDirty = false;

    const targetKey = blockKey(result.hit.block.localLocation);
    if (state.activeSubLevelId !== result.handle.id) {
      if (state.activeSubLevelId !== undefined) {
        this.#releaseViewer(player.id, state.activeSubLevelId, false);
      }
      if (!this.#acquireViewer(player, result.handle)) {
        this.#clearInteractionTargets(player.id);
        return;
      }
      state.activeSubLevelId = result.handle.id;
      state.targetBlockKey = targetKey;
      state.mode = "block";
      state.shapeSignature = undefined;
    } else if (state.targetBlockKey !== targetKey) {
      state.targetBlockKey = targetKey;
      state.shapeSignature = undefined;
    }

    this.#updateViewerShape(player, state, result);
    this.#revealViewer(player, state, result.handle.id);
  }

  #acquireViewer(player: Player, handle: SubLevelInteractionHandle): boolean {
    let record = this.#records.get(handle.id);
    const created = record === undefined;
    if (!record) {
      let entity: Entity;
      try {
        entity = handle.dimension.spawnEntity(
          BLOCK_OUTLINE_ENTITY_TYPE_ID,
          handle.outlineAnchorLocation
        );
      } catch {
        return false;
      }
      if (!handle.attachOutlineEntity(entity)) {
        if (entity.isValid) entity.remove();
        return false;
      }
      record = {
        handle,
        contentRevision: handle.contentRevision,
        entity,
        readyTick: system.currentTick + OUTLINE_ENTITY_READY_DELAY_TICKS,
        viewers: new Map()
      };
      this.#records.set(handle.id, record);
      this.#trackedEntityIds.add(entity.id);
    }
    record.viewers.set(player.id, {
      revealTick: created
        ? record.readyTick + INITIAL_OUTLINE_REVEAL_DELAY_TICKS
        : system.currentTick + 1,
      revealed: false
    });
    try {
      player.setPropertyOverrideForEntity(record.entity, OUTLINE_VISIBLE_PROPERTY, false);
    } catch {
      record.viewers.delete(player.id);
      this.#destroyRecordIfUnused(record);
      return false;
    }
    return true;
  }

  #releaseViewer(playerId: string, subLevelId: number, immediate: boolean): void {
    const record = this.#records.get(subLevelId);
    if (!record) return;
    const viewer = record.viewers.get(playerId);
    if (!viewer) return;
    const player = this.#players.get(playerId);
    if (player && record.entity.isValid) {
      try {
        player.setPropertyOverrideForEntity(record.entity, OUTLINE_VISIBLE_PROPERTY, false);
      } catch {
        immediate = true;
      }
    }
    if (!immediate) {
      viewer.fadeEndTick = system.currentTick + OUTLINE_FADE_TICKS;
      return;
    }
    if (player && record.entity.isValid) {
      clearOverridesQuietly(player, record.entity);
    }
    record.viewers.delete(playerId);
    this.#destroyRecordIfUnused(record);
  }

  #revealViewer(player: Player, state: PlayerOutlineState, subLevelId: number): void {
    const record = this.#records.get(subLevelId);
    const viewer = record?.viewers.get(player.id);
    if (
      !record?.entity.isValid
      || !viewer
      || viewer.revealed
      || state.shapeSignature === undefined
      || system.currentTick < viewer.revealTick
    ) return;
    player.setPropertyOverrideForEntity(record.entity, OUTLINE_VISIBLE_PROPERTY, true);
    viewer.revealed = true;
  }

  #finishFades(currentTick: number): void {
    if (this.#records.size === 0) return;
    // Map iterators tolerate deletion of the current entry, so no copy is needed.
    for (const record of this.#records.values()) {
      if (!record.handle.isValid || !record.entity.isValid) {
        this.#destroyRecord(record);
        continue;
      }
      for (const [playerId, viewer] of record.viewers) {
        if (viewer.fadeEndTick === undefined || currentTick < viewer.fadeEndTick) continue;
        const player = this.#players.get(playerId);
        if (player) {
          clearOverridesQuietly(player, record.entity);
        }
        record.viewers.delete(playerId);
      }
      this.#destroyRecordIfUnused(record);
    }
  }

  #destroyRecordIfUnused(record: SharedOutlineRecord): void {
    if (record.viewers.size === 0) this.#destroyRecord(record);
  }

  #destroyRecord(record: SharedOutlineRecord): void {
    this.#records.delete(record.handle.id);
    this.#trackedEntityIds.delete(record.entity.id);
    for (const [playerId] of record.viewers) {
      const player = this.#players.get(playerId);
      if (player && record.entity.isValid) {
        clearOverridesQuietly(player, record.entity);
      }
      const state = this.#states.get(playerId);
      if (state?.activeSubLevelId === record.handle.id) {
        this.#clearInteractionTargets(playerId);
        state.activeSubLevelId = undefined;
        state.mode = undefined;
        state.shapeSignature = undefined;
      }
    }
    record.viewers.clear();
    if (record.entity.isValid) {
      if (record.handle.isValid) record.handle.detachOutlineEntity(record.entity);
      if (record.entity.isValid) record.entity.remove();
    }
  }

  /** Keep the native block target aligned with the selected sub-level cell. */
  #syncInteractionTargets(
    player: Player,
    result: SubLevelRaycastResult,
    refreshInteractionTarget: boolean
  ): void {
    if (
      player.inputInfo.lastInputModeUsed === InputMode.KeyboardAndMouse
      && !player.isSneaking
      && this.#interactionTargetSuppressor?.(result.handle, result.hit.block)
    ) {
      // Native storage interaction needs the entity to remain the first target
      // on the right-click ray, so standing desktop players get no proxy here.
      this.#clearInteractionTargets(player.id);
      return;
    }
    if (refreshInteractionTarget) {
      this.#interactionTargets.syncPlayer(
        player.id,
        player.dimension,
        result.origin,
        result.hit.location,
        result.direction,
        player.inputInfo.lastInputModeUsed === InputMode.Touch
      );
    }
  }

  #setSharedMiningStage(
    handle: SubLevelInteractionHandle,
    block: import("../../sublevel/SubLevel.js").SubLevelBlock,
    stage: number
  ): void {
    const targetKey = blockKey(block.localLocation);
    const key = miningTargetKey(handle.id, targetKey);
    let record = this.#breakOverlays.get(key);
    if (record && (!record.handle.isValid || !record.entity.isValid)) {
      this.#destroyBreakOverlay(record);
      record = undefined;
    }
    if (!record) {
      const location = breakOverlayLocation(
        handle.localPointToWorld(block.localLocation)
      );
      const entity = handle.dimension.spawnEntity(
        BLOCK_CRACK_ENTITY_TYPE_ID,
        location
      );
      record = {
        handle,
        entity,
        key,
        lastLocation: { ...location },
        lastProgressTick: system.currentTick,
        localLocation: { ...block.localLocation },
        readyTick: system.currentTick + BREAK_OVERLAY_INITIAL_POSE_DELAY_TICKS,
        targetStage: stage
      };
      this.#breakOverlays.set(key, record);
      this.#trackedEntityIds.add(entity.id);
    }
    record.lastProgressTick = system.currentTick;
    record.targetStage = stage;
    this.#syncBreakOverlay(record, system.currentTick);
  }

  #tickBreakOverlays(currentTick: number): void {
    if (this.#breakOverlays.size === 0) return;
    for (const record of this.#breakOverlays.values()) {
      if (
        currentTick - record.lastProgressTick > PLAYER_EDIT_MINING_RESET_TICKS
        || !record.handle.isValid
        || !record.entity.isValid
        || !record.handle.getBlockAtLocalLocation(record.localLocation)
      ) {
        this.#destroyBreakOverlay(record);
        continue;
      }
      this.#syncBreakOverlay(record, currentTick);
    }
  }

  #syncBreakOverlay(record: SharedBreakOverlayRecord, currentTick: number): void {
    const { handle, entity } = record;
    const location = breakOverlayLocation(
      handle.localPointToWorld(record.localLocation)
    );
    const rotation = handle.visualRotation;
    if (squaredDistance(record.lastLocation, location) > BREAK_OVERLAY_TRANSFORM_EPSILON_SQUARED) {
      entity.teleport(location);
      record.lastLocation = { ...location };
    }
    const publishingInitialPose = record.publishedStage === undefined
      && currentTick >= record.readyTick;
    if (
      publishingInitialPose
      || !record.lastRotation
      || squaredDistance(record.lastRotation, rotation)
        > BREAK_OVERLAY_TRANSFORM_EPSILON_SQUARED
    ) {
      entity.setProperty(BREAK_OVERLAY_PITCH_PROPERTY, rotation.x);
      entity.setProperty(BREAK_OVERLAY_YAW_PROPERTY, rotation.y);
      entity.setProperty(BREAK_OVERLAY_ROLL_PROPERTY, rotation.z);
      record.lastRotation = { ...rotation };
    }
    if (currentTick < record.readyTick || record.publishedStage === record.targetStage) return;
    entity.setProperty(BREAK_OVERLAY_STAGE_PROPERTY, record.targetStage);
    record.publishedStage = record.targetStage;
  }

  #destroyBreakOverlay(record: SharedBreakOverlayRecord): void {
    this.#breakOverlays.delete(record.key);
    this.#trackedEntityIds.delete(record.entity.id);
    if (record.entity.isValid) record.entity.remove();
  }

  #clearSubLevelBreakOverlays(subLevelId: number): void {
    for (const record of this.#breakOverlays.values()) {
      if (record.handle.id === subLevelId) this.#destroyBreakOverlay(record);
    }
  }

  #clearInteractionTargets(playerId: string): void {
    this.#interactionTargets.releasePlayer(playerId);
  }

  #clearSharedMiningStage(subLevelId: number, targetKey: string): void {
    const record = this.#breakOverlays.get(miningTargetKey(subLevelId, targetKey));
    if (record) this.#destroyBreakOverlay(record);
  }

  #updateViewerShape(
    player: Player,
    state: PlayerOutlineState,
    result: SubLevelRaycastResult
  ): void {
    const record = this.#records.get(result.handle.id);
    if (!record?.entity.isValid) return;
    // The client entity must finish initialization before playAnimation can write its variables.
    if (system.currentTick < record.readyTick) return;
    if (record.contentRevision !== result.handle.contentRevision) {
      record.contentRevision = result.handle.contentRevision;
      state.shapeSignature = undefined;
    }
    // The preview outline is a pure function of these inputs, so an input
    // signature can gate all placement resolution and edge building.
    const item = selectedItem(player);
    const target = result.hit.block.localLocation;
    const normal = result.hit.localNormal;
    const signature = `b|${record.contentRevision}:${blockKey(target)}:`
      + `${normal.x},${normal.y},${normal.z}:${item?.typeId ?? ""}`;
    if (signature === state.shapeSignature) return;
    const blockPlacement = item ? this.#getPlacementTarget(result, item) : undefined;
    const locations = blockPlacement ? [target, blockPlacement] : [target];
    const edges = createAabbOutline(locations);
    if (edges.length === 0) return;
    const preview = createBlockPreviewTransform(
      target,
      blockPlacement,
      result.handle.outlineAnchorLocal
    );
    player.setPropertyOverrideForEntity(record.entity, OUTLINE_BLOCK_PREVIEW_PROPERTY, true);
    player.setPropertyOverrideForEntity(record.entity, OUTLINE_PREVIEW_X_PROPERTY, preview.x);
    player.setPropertyOverrideForEntity(record.entity, OUTLINE_PREVIEW_Y_PROPERTY, preview.y);
    player.setPropertyOverrideForEntity(record.entity, OUTLINE_PREVIEW_Z_PROPERTY, preview.z);
    player.setPropertyOverrideForEntity(record.entity, OUTLINE_PREVIEW_SIDE_PROPERTY, preview.side);
    state.shapeSignature = signature;
  }

  #getPlacementTarget(result: SubLevelRaycastResult, itemStack: ItemStack): Vector3 | undefined {
    if (!BlockTypes.get(itemStack.typeId)) return undefined;
    const target = {
      x: result.hit.block.localLocation.x + result.hit.localNormal.x,
      y: result.hit.block.localLocation.y + result.hit.localNormal.y,
      z: result.hit.block.localLocation.z + result.hit.localNormal.z
    };
    if (!Number.isInteger(target.x) || !Number.isInteger(target.y) || !Number.isInteger(target.z)) {
      throw new Error(`Sub-level placement target is not on the local block grid: ${blockKey(target)}.`);
    }
    return result.handle.getBlockAtLocalLocation(target) ? undefined : target;
  }

  #validatedActionResult(
    player: Player,
    expected: SubLevelOutlineActionTarget | undefined
  ): SubLevelRaycastResult | undefined {
    const result = this.#raycastForEvent(player);
    if (!result || (expected && !actionTargetMatchesResult(expected, result))) return undefined;
    return result;
  }

  #raycastForEvent(player: Player): SubLevelRaycastResult | undefined {
    if (!this.#canPreview(player)) return undefined;
    const state = this.#states.get(player.id) ?? {
      lastRayTick: system.currentTick - RAY_REFRESH_TICKS
    };
    this.#states.set(player.id, state);
    let direction: Vector3;
    let origin: Vector3;
    try {
      direction = normalize(player.getViewDirection());
      origin = player.getHeadLocation();
    } catch {
      return undefined;
    }
    if (
      state.rayCache?.tick === system.currentTick
      && state.rayCache.raycastRevision === this.#runtime.getRaycastRevision(player.dimension.id)
      && state.lastDirection !== undefined
      && !hasViewDirectionChanged(state.lastDirection, direction)
      && state.lastOrigin !== undefined
      && vectorComponentsEqual(state.lastOrigin, origin)
    ) return state.rayCache.result;
    const result = this.#raycastPlayerSubLevels(player, origin, direction);
    state.rayCache = {
      raycastRevision: this.#runtime.getRaycastRevision(player.dimension.id),
      result,
      tick: system.currentTick
    };
    state.interactionTargetDirty = true;
    state.lastRayTick = system.currentTick;
    state.lastDirection = direction;
    state.lastOrigin = origin;
    return result;
  }

  #raycastPlayerSubLevels(
    player: Player,
    origin: Vector3,
    direction: Vector3
  ): SubLevelRaycastResult | undefined {
    if (!this.#runtime.hasSubLevels(player.dimension.id)) return undefined;
    let closest: SubLevelRaycastResult | undefined;
    for (const handle of this.#runtime.getRaycastCandidates(player.dimension.id)) {
      const hit = handle.raycast(origin, direction, INTERACTION_REACH, {
        skipContainingBlock: true
      });
      if (!hit || (closest && hit.distance >= closest.hit.distance)) continue;
      closest = { handle, direction, hit, origin };
    }
    if (!closest || worldBlockPrecedes(player, origin, direction, closest.hit.distance)) {
      return undefined;
    }
    return closest;
  }

  #canPreview(player: Player): boolean {
    try {
      return player.isValid && player.getGameMode() !== GameMode.Spectator;
    } catch {
      return false;
    }
  }

}

/**
 * The player or entity can be invalidated between the registry read and this
 * native call (leave/despawn races), so the override wipe stays best-effort.
 */
function clearOverridesQuietly(player: Player, entity: Entity): void {
  try { player.clearPropertyOverridesForEntity(entity); } catch {}
}

function actionTargetFromResult(result: SubLevelRaycastResult): SubLevelOutlineActionTarget {
  return {
    subLevelId: result.handle.id,
    blockKey: blockKey(result.hit.block.localLocation),
    face: result.hit.face
  };
}

function actionTargetMatchesResult(
  expected: SubLevelOutlineActionTarget,
  result: SubLevelRaycastResult
): boolean {
  return expected.subLevelId === result.handle.id
    && expected.blockKey === blockKey(result.hit.block.localLocation)
    && expected.face === result.hit.face;
}

function miningTargetKey(subLevelId: number, targetKey: string): string {
  return `${subLevelId}|${targetKey}`;
}

function requirePlayerContainer(player: Player, purpose = ""): Container {
  const container = player.getComponent("minecraft:inventory")?.container;
  if (!container) {
    throw new Error(`Player ${player.id} has no inventory container${purpose}.`);
  }
  return container;
}

function consumeSelectedBlock(player: Player, usedItem: ItemStack): ItemStack | undefined {
  if (player.getGameMode() === GameMode.Creative) return undefined;
  const container = requirePlayerContainer(player);
  const selected = container.getItem(player.selectedSlotIndex);
  if (!selected || selected.typeId !== usedItem.typeId || selected.amount <= 0) {
    throw new Error(`Player ${player.id}'s selected block changed before placement commit.`);
  }
  const previous = selected.clone();
  selected.amount -= 1;
  container.setItem(player.selectedSlotIndex, selected.amount > 0 ? selected : undefined);
  return previous;
}

function restoreSelectedBlock(player: Player, previous: ItemStack | undefined): void {
  if (!previous || player.getGameMode() === GameMode.Creative) return;
  requirePlayerContainer(player).setItem(player.selectedSlotIndex, previous);
}

function selectedItem(player: Player): ItemStack | undefined {
  try {
    return player.getComponent("minecraft:inventory")?.container?.getItem(player.selectedSlotIndex);
  } catch {
    return undefined;
  }
}

function worldBlockPrecedes(
  player: Player,
  origin: Vector3,
  direction: Vector3,
  subLevelDistance: number
): boolean {
  try {
    const hit = player.getBlockFromViewDirection({
      includeLiquidBlocks: false,
      includePassableBlocks: false,
      maxDistance: INTERACTION_REACH
    });
    if (!hit) return false;
    const point = {
      x: hit.block.location.x + hit.faceLocation.x,
      y: hit.block.location.y + hit.faceLocation.y,
      z: hit.block.location.z + hit.faceLocation.z
    };
    const blockDistance = dot(subtract(point, origin), direction);
    return blockDistance >= 0
      && blockDistance + WORLD_BLOCK_OCCLUSION_EPSILON < subLevelDistance;
  } catch {
    return false;
  }
}
