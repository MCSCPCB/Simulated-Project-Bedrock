import {
  BlockTypes,
  GameMode,
  InputMode,
  system,
  world
} from "@minecraft/server";
import {
  SUBLEVEL_OUTLINE_EDGE_CAPACITY,
  createAabbOutline,
  createSubLevelOutlineShapeFromTopology,
  createSubLevelOutlineTopology
} from "./SubLevelOutlineGeometry.js";
import {
  BREAK_OVERLAY_TRANSFORM_EPSILON_SQUARED,
  RAY_REFRESH_TICKS,
  breakOverlayLocation,
  createBlockPreviewTransform,
  createEdgeWriteExpression,
  edgeSignature,
  hasViewDirectionChanged,
  isPlayerHeadInsideSubLevelPlacement,
  resolvePlacementCardinalDirection,
  shouldEnterBlockPreview,
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
import { SubLevelInteractionTargetBlockController } from "../block_placement/SubLevelInteractionTargetBlock.js";
const BLOCK_OUTLINE_ENTITY_TYPE_ID = "sable:block_outline";
const BLOCK_CRACK_ENTITY_TYPE_ID = "sable:block_crack";
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
const INTERACTION_REACH = 5;
const WORLD_BLOCK_OCCLUSION_EPSILON = 0.05;
const OUTLINE_FADE_TICKS = 5;
const INITIAL_OUTLINE_REVEAL_DELAY_TICKS = 4;
const OUTLINE_ENTITY_READY_DELAY_TICKS = 2;
const BREAK_OVERLAY_INITIAL_POSE_DELAY_TICKS = 1;
const OUTLINE_TRANSFORM_ANIMATION = "animation.sable.block_outline.write_edges";
const DEFAULT_BLOCK_HARDNESS = 1;
class SubLevelOutlineController {
  #players;
  #runtime;
  #records = /* @__PURE__ */ new Map();
  #breakOverlays = /* @__PURE__ */ new Map();
  #states = /* @__PURE__ */ new Map();
  #interactionTargets = new SubLevelInteractionTargetBlockController();
  #trackedEntityIds = /* @__PURE__ */ new Set();
  #miningProgress = new SubLevelMiningProgress();
  #startupCleanupComplete = false;
  #startupCleanupScheduled = false;
  #breakHandler;
  #miningEffectHandler;
  #placeHandler;
  #placementEffectHandler;
  #interactionTargetSuppressor;
  constructor(runtime, players) {
    this.#runtime = runtime;
    this.#players = players;
  }
  setBreakHandler(handler) {
    this.#breakHandler = handler;
  }
  setMiningEffectHandler(handler) {
    this.#miningEffectHandler = handler;
  }
  setPlaceHandler(handler) {
    this.#placeHandler = handler;
  }
  setPlacementEffectHandler(handler) {
    this.#placementEffectHandler = handler;
  }
  setInteractionTargetSuppressor(suppressor) {
    this.#interactionTargetSuppressor = suppressor;
  }
  markInteractionTargetDirty(playerId) {
    const state = this.#states.get(playerId);
    if (state) state.interactionTargetDirty = true;
  }
  start() {
    if (this.#startupCleanupScheduled) return;
    this.#startupCleanupScheduled = true;
    this.#interactionTargets.start();
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
  tick(currentTick) {
    if (!this.#startupCleanupComplete) return;
    this.#miningProgress.prune(currentTick);
    this.#tickBreakOverlays(currentTick);
    for (const player of this.#players.sneakingPlayers()) this.#tickPlayer(player, currentTick);
    for (const playerId of this.#states.keys()) {
      if (this.#players.hasSneakingPlayer(playerId)) continue;
      const player = this.#players.get(playerId);
      if (player) this.#tickPlayer(player, currentTick);
      else this.clearPlayer(playerId, false);
    }
    this.#finishFades(currentTick);
  }
  captureActionTarget(player) {
    if (!this.#startupCleanupComplete) return void 0;
    const result = this.#raycastForEvent(player);
    return result ? actionTargetFromResult(result) : void 0;
  }
  isManagedInteractionTarget(dimension, block) {
    return this.#interactionTargets.isManagedBlock(dimension, block);
  }
  handleBreak(player, itemStack, expected) {
    if (!this.#startupCleanupComplete) return;
    const result = this.#validatedActionResult(player, expected);
    if (!result) return;
    if (!canPlayerBreakSubLevelBlock(player, itemStack, result.hit.block.typeId)) return;
    const registration = getSubLevelBlockRegistration(result.hit.block.typeId);
    if (registration === void 0) return;
    const targetKey = blockKey(result.hit.block.localLocation);
    const progress = this.#miningProgress.advance(
      `${result.handle.id}|${targetKey}`,
      system.currentTick,
      getSubLevelMiningTargetTicks(
        registration.hardness ?? DEFAULT_BLOCK_HARDNESS,
        itemStack
      ),
      player.inputInfo.lastInputModeUsed === InputMode.Touch ? { playerId: player.id, type: "touch" } : { type: "attack" }
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
  handlePlace(player, itemStack, expected) {
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
      (point) => result.handle.worldPointToLocal(point)
    )) return;
    if (!this.#placeHandler) {
      throw new Error("Sub-level block place handler is not configured.");
    }
    const cardinalDirection = resolvePlacementCardinalDirection(
      (point) => result.handle.worldPointToLocal(point),
      result.origin,
      result.direction
    );
    const consumed = consumeSelectedBlock(player, itemStack);
    let placed;
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
  clearPlayer(playerId, immediate) {
    this.#miningProgress.clearPlayer(playerId);
    const state = this.#states.get(playerId);
    if (state) this.#clearInteractionTargets(playerId);
    if (state?.activeSubLevelId !== void 0) {
      this.#releaseViewer(playerId, state.activeSubLevelId, immediate);
    }
    this.#states.delete(playerId);
  }
  /** Remove outline entities left by a script reload, while retaining entities created this tick. */
  handleEntityLoad(entity) {
    if (entity.typeId !== BLOCK_OUTLINE_ENTITY_TYPE_ID && entity.typeId !== BLOCK_CRACK_ENTITY_TYPE_ID) return;
    system.run(() => {
      if (entity.isValid && !this.#trackedEntityIds.has(entity.id)) entity.remove();
    });
  }
  #tickPlayer(player, currentTick) {
    if (!this.#canPreview(player)) {
      this.clearPlayer(player.id, false);
      return;
    }
    const sneaking = player.isSneaking;
    const state = this.#states.get(player.id) ?? {
      lastRayTick: currentTick - RAY_REFRESH_TICKS
    };
    this.#states.set(player.id, state);
    let direction;
    let origin;
    try {
      direction = normalize(player.getViewDirection());
      origin = player.getHeadLocation();
    } catch {
      this.clearPlayer(player.id, true);
      return;
    }
    const viewChanged = state.lastDirection !== void 0 && hasViewDirectionChanged(state.lastDirection, direction) || state.lastOrigin !== void 0 && !vectorComponentsEqual(state.lastOrigin, origin);
    state.lastDirection = direction;
    state.lastOrigin = origin;
    const subLevelMoving = state.rayCache?.result?.handle.isMoving === true || state.rayCache?.raycastRevision !== this.#runtime.getRaycastRevision(player.dimension.id);
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
      if (!sneaking) {
        this.clearPlayer(player.id, false);
        return;
      }
      this.#clearInteractionTargets(player.id);
      if (state.activeSubLevelId !== void 0) {
        this.#releaseViewer(player.id, state.activeSubLevelId, false);
      }
      state.activeSubLevelId = void 0;
      state.mode = void 0;
      state.shapeSignature = void 0;
      return;
    }
    this.#syncInteractionTargets(player, result, refresh || state.interactionTargetDirty === true);
    state.interactionTargetDirty = false;
    if (!sneaking) {
      if (state.activeSubLevelId !== void 0) {
        this.#releaseViewer(player.id, state.activeSubLevelId, false);
      }
      state.activeSubLevelId = void 0;
      state.mode = void 0;
      state.shapeSignature = void 0;
      return;
    }
    const targetKey = blockKey(result.hit.block.localLocation);
    if (state.activeSubLevelId !== result.handle.id) {
      if (state.activeSubLevelId !== void 0) {
        this.#releaseViewer(player.id, state.activeSubLevelId, false);
      }
      if (!this.#acquireViewer(player, result.handle)) {
        this.#clearInteractionTargets(player.id);
        return;
      }
      state.activeSubLevelId = result.handle.id;
      state.candidateBlockKey = targetKey;
      state.candidateSinceTick = currentTick;
      state.mode = "structure";
      state.shapeSignature = void 0;
    } else if (state.candidateBlockKey !== targetKey) {
      state.candidateBlockKey = targetKey;
      state.candidateSinceTick = currentTick;
      if (state.mode === "block") state.shapeSignature = void 0;
    }
    if (shouldEnterBlockPreview(
      state.mode,
      currentTick - (state.candidateSinceTick ?? currentTick),
      viewChanged
    )) {
      state.mode = "block";
      state.shapeSignature = void 0;
    }
    this.#updateViewerShape(player, state, result);
    this.#revealViewer(player, state, result.handle.id);
  }
  #acquireViewer(player, handle) {
    let record = this.#records.get(handle.id);
    const created = record === void 0;
    if (!record) {
      let entity;
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
        outlineTopology: void 0,
        readyTick: system.currentTick + OUTLINE_ENTITY_READY_DELAY_TICKS,
        shapeCache: /* @__PURE__ */ new Map(),
        viewers: /* @__PURE__ */ new Map()
      };
      this.#records.set(handle.id, record);
      this.#trackedEntityIds.add(entity.id);
    }
    record.viewers.set(player.id, {
      revealTick: created ? record.readyTick + INITIAL_OUTLINE_REVEAL_DELAY_TICKS : system.currentTick + 1,
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
  #releaseViewer(playerId, subLevelId, immediate) {
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
  #revealViewer(player, state, subLevelId) {
    const record = this.#records.get(subLevelId);
    const viewer = record?.viewers.get(player.id);
    if (!record?.entity.isValid || !viewer || viewer.revealed || state.shapeSignature === void 0 || system.currentTick < viewer.revealTick) return;
    player.setPropertyOverrideForEntity(record.entity, OUTLINE_VISIBLE_PROPERTY, true);
    viewer.revealed = true;
  }
  #finishFades(currentTick) {
    if (this.#records.size === 0) return;
    for (const record of this.#records.values()) {
      if (!record.handle.isValid || !record.entity.isValid) {
        this.#destroyRecord(record);
        continue;
      }
      for (const [playerId, viewer] of record.viewers) {
        if (viewer.fadeEndTick === void 0 || currentTick < viewer.fadeEndTick) continue;
        const player = this.#players.get(playerId);
        if (player) {
          clearOverridesQuietly(player, record.entity);
        }
        record.viewers.delete(playerId);
      }
      this.#destroyRecordIfUnused(record);
    }
  }
  #destroyRecordIfUnused(record) {
    if (record.viewers.size === 0) this.#destroyRecord(record);
  }
  #destroyRecord(record) {
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
        state.activeSubLevelId = void 0;
        state.mode = void 0;
        state.shapeSignature = void 0;
      }
    }
    record.viewers.clear();
    if (record.entity.isValid) {
      if (record.handle.isValid) record.handle.detachOutlineEntity(record.entity);
      if (record.entity.isValid) record.entity.remove();
    }
  }
  /** Keep the native block target aligned with the selected sub-level cell. */
  #syncInteractionTargets(player, result, refreshInteractionTarget) {
    if (player.inputInfo.lastInputModeUsed === InputMode.KeyboardAndMouse && !player.isSneaking && this.#interactionTargetSuppressor?.(result.handle, result.hit.block)) {
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
  #setSharedMiningStage(handle, block, stage) {
    const targetKey = blockKey(block.localLocation);
    const key = miningTargetKey(handle.id, targetKey);
    let record = this.#breakOverlays.get(key);
    if (record && (!record.handle.isValid || !record.entity.isValid)) {
      this.#destroyBreakOverlay(record);
      record = void 0;
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
  #tickBreakOverlays(currentTick) {
    if (this.#breakOverlays.size === 0) return;
    for (const record of this.#breakOverlays.values()) {
      if (currentTick - record.lastProgressTick > PLAYER_EDIT_MINING_RESET_TICKS || !record.handle.isValid || !record.entity.isValid || !record.handle.getBlockAtLocalLocation(record.localLocation)) {
        this.#destroyBreakOverlay(record);
        continue;
      }
      this.#syncBreakOverlay(record, currentTick);
    }
  }
  #syncBreakOverlay(record, currentTick) {
    const { handle, entity } = record;
    const location = breakOverlayLocation(
      handle.localPointToWorld(record.localLocation)
    );
    const rotation = handle.visualRotation;
    if (squaredDistance(record.lastLocation, location) > BREAK_OVERLAY_TRANSFORM_EPSILON_SQUARED) {
      entity.teleport(location);
      record.lastLocation = { ...location };
    }
    const publishingInitialPose = record.publishedStage === void 0 && currentTick >= record.readyTick;
    if (publishingInitialPose || !record.lastRotation || squaredDistance(record.lastRotation, rotation) > BREAK_OVERLAY_TRANSFORM_EPSILON_SQUARED) {
      entity.setProperty(BREAK_OVERLAY_PITCH_PROPERTY, rotation.x);
      entity.setProperty(BREAK_OVERLAY_YAW_PROPERTY, rotation.y);
      entity.setProperty(BREAK_OVERLAY_ROLL_PROPERTY, rotation.z);
      record.lastRotation = { ...rotation };
    }
    if (currentTick < record.readyTick || record.publishedStage === record.targetStage) return;
    entity.setProperty(BREAK_OVERLAY_STAGE_PROPERTY, record.targetStage);
    record.publishedStage = record.targetStage;
  }
  #destroyBreakOverlay(record) {
    this.#breakOverlays.delete(record.key);
    this.#trackedEntityIds.delete(record.entity.id);
    if (record.entity.isValid) record.entity.remove();
  }
  #clearSubLevelBreakOverlays(subLevelId) {
    for (const record of this.#breakOverlays.values()) {
      if (record.handle.id === subLevelId) this.#destroyBreakOverlay(record);
    }
  }
  #clearInteractionTargets(playerId) {
    this.#interactionTargets.releasePlayer(playerId);
  }
  #clearSharedMiningStage(subLevelId, targetKey) {
    const record = this.#breakOverlays.get(miningTargetKey(subLevelId, targetKey));
    if (record) this.#destroyBreakOverlay(record);
  }
  #updateViewerShape(player, state, result) {
    const record = this.#records.get(result.handle.id);
    if (!record?.entity.isValid) return;
    if (system.currentTick < record.readyTick) return;
    if (record.contentRevision !== result.handle.contentRevision) {
      record.contentRevision = result.handle.contentRevision;
      record.outlineTopology = void 0;
      record.shapeCache.clear();
      state.shapeSignature = void 0;
    }
    if (state.mode === "block") {
      const item = selectedItem(player);
      const target = result.hit.block.localLocation;
      const normal = result.hit.localNormal;
      const signature = `b|${record.contentRevision}:${blockKey(target)}:${normal.x},${normal.y},${normal.z}:${item?.typeId ?? ""}`;
      if (signature === state.shapeSignature) return;
      const blockPlacement = item ? this.#getPlacementTarget(result, item) : void 0;
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
      return;
    }
    const targetKey = blockKey(result.hit.block.localLocation);
    const cacheKey = `${record.contentRevision}:${targetKey}`;
    let cached = record.shapeCache.get(cacheKey);
    if (!cached) {
      record.outlineTopology ??= createSubLevelOutlineTopology(
        result.handle.blocks,
        SUBLEVEL_OUTLINE_EDGE_CAPACITY
      );
      const edges = createSubLevelOutlineShapeFromTopology(
        record.outlineTopology,
        result.hit.block.localLocation,
        SUBLEVEL_OUTLINE_EDGE_CAPACITY
      )?.edges ?? [];
      const anchorSignature = blockKey(result.handle.outlineAnchorLocal);
      cached = {
        edges,
        signature: `${record.contentRevision}:${anchorSignature}:${edgeSignature(edges)}`
      };
      record.shapeCache.set(cacheKey, cached);
    }
    if (cached.edges.length === 0) return;
    if (cached.signature === state.shapeSignature) return;
    player.setPropertyOverrideForEntity(record.entity, OUTLINE_BLOCK_PREVIEW_PROPERTY, false);
    record.entity.playAnimation(OUTLINE_TRANSFORM_ANIMATION, {
      nextState: "none",
      players: [player],
      stopExpression: createEdgeWriteExpression(cached.edges, result.handle.outlineAnchorLocal)
    });
    state.shapeSignature = cached.signature;
  }
  #getPlacementTarget(result, itemStack) {
    if (!BlockTypes.get(itemStack.typeId)) return void 0;
    const target = {
      x: result.hit.block.localLocation.x + result.hit.localNormal.x,
      y: result.hit.block.localLocation.y + result.hit.localNormal.y,
      z: result.hit.block.localLocation.z + result.hit.localNormal.z
    };
    if (!Number.isInteger(target.x) || !Number.isInteger(target.y) || !Number.isInteger(target.z)) {
      throw new Error(`Sub-level placement target is not on the local block grid: ${blockKey(target)}.`);
    }
    return result.handle.getBlockAtLocalLocation(target) ? void 0 : target;
  }
  #validatedActionResult(player, expected) {
    const result = this.#raycastForEvent(player);
    if (!result || expected && !actionTargetMatchesResult(expected, result)) return void 0;
    return result;
  }
  #raycastForEvent(player) {
    if (!this.#canPreview(player)) return void 0;
    const state = this.#states.get(player.id) ?? {
      lastRayTick: system.currentTick - RAY_REFRESH_TICKS
    };
    this.#states.set(player.id, state);
    let direction;
    let origin;
    try {
      direction = normalize(player.getViewDirection());
      origin = player.getHeadLocation();
    } catch {
      return void 0;
    }
    if (state.rayCache?.tick === system.currentTick && state.rayCache.raycastRevision === this.#runtime.getRaycastRevision(player.dimension.id) && state.lastDirection !== void 0 && !hasViewDirectionChanged(state.lastDirection, direction) && state.lastOrigin !== void 0 && vectorComponentsEqual(state.lastOrigin, origin)) return state.rayCache.result;
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
  #raycastPlayerSubLevels(player, origin, direction) {
    if (!this.#runtime.hasSubLevels(player.dimension.id)) return void 0;
    let closest;
    for (const handle of this.#runtime.getRaycastCandidates(player.dimension.id)) {
      const hit = handle.raycast(origin, direction, INTERACTION_REACH, {
        skipContainingBlock: true
      });
      if (!hit || closest && hit.distance >= closest.hit.distance) continue;
      closest = { handle, direction, hit, origin };
    }
    if (!closest || worldBlockPrecedes(player, origin, direction, closest.hit.distance)) {
      return void 0;
    }
    return closest;
  }
  #canPreview(player) {
    try {
      return player.isValid && player.getGameMode() !== GameMode.Spectator;
    } catch {
      return false;
    }
  }
}
function clearOverridesQuietly(player, entity) {
  try {
    player.clearPropertyOverridesForEntity(entity);
  } catch {
  }
}
function actionTargetFromResult(result) {
  return {
    subLevelId: result.handle.id,
    blockKey: blockKey(result.hit.block.localLocation),
    face: result.hit.face
  };
}
function actionTargetMatchesResult(expected, result) {
  return expected.subLevelId === result.handle.id && expected.blockKey === blockKey(result.hit.block.localLocation) && expected.face === result.hit.face;
}
function miningTargetKey(subLevelId, targetKey) {
  return `${subLevelId}|${targetKey}`;
}
function requirePlayerContainer(player, purpose = "") {
  const container = player.getComponent("minecraft:inventory")?.container;
  if (!container) {
    throw new Error(`Player ${player.id} has no inventory container${purpose}.`);
  }
  return container;
}
function consumeSelectedBlock(player, usedItem) {
  if (player.getGameMode() === GameMode.Creative) return void 0;
  const container = requirePlayerContainer(player);
  const selected = container.getItem(player.selectedSlotIndex);
  if (!selected || selected.typeId !== usedItem.typeId || selected.amount <= 0) {
    throw new Error(`Player ${player.id}'s selected block changed before placement commit.`);
  }
  const previous = selected.clone();
  selected.amount -= 1;
  container.setItem(player.selectedSlotIndex, selected.amount > 0 ? selected : void 0);
  return previous;
}
function restoreSelectedBlock(player, previous) {
  if (!previous || player.getGameMode() === GameMode.Creative) return;
  requirePlayerContainer(player).setItem(player.selectedSlotIndex, previous);
}
function selectedItem(player) {
  try {
    return player.getComponent("minecraft:inventory")?.container?.getItem(player.selectedSlotIndex);
  } catch {
    return void 0;
  }
}
function worldBlockPrecedes(player, origin, direction, subLevelDistance) {
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
    return blockDistance >= 0 && blockDistance + WORLD_BLOCK_OCCLUSION_EPSILON < subLevelDistance;
  } catch {
    return false;
  }
}
export {
  BLOCK_CRACK_ENTITY_TYPE_ID,
  BLOCK_OUTLINE_ENTITY_TYPE_ID,
  INTERACTION_REACH,
  SubLevelOutlineController,
  WORLD_BLOCK_OCCLUSION_EPSILON
};
