import { FancySubLevelModelRenderer } from "../fancy/model/FancySubLevelModelRenderer.js";
import { packFancySubLevelModels } from "../fancy/model/FancySubLevelModelLayout.js";
import {
  resolveFancySubLevelBlock,
  resolveMissingFancySubLevelBlock
} from "../fancy/model/FancySubLevelModelRegistry.js";
import { DEFAULT_SUBLEVEL_FOLIAGE_TINT } from "../fancy/model/FancySubLevelTintCodec.js";
import { selectSubLevelRenderAnchor } from "../../../util/SublevelRenderOffsetHelper.js";
import {
  canRenderSubLevelBlockVanilla,
  normalizeRenderEntityTags,
  VanillaSubLevelRenderDispatcher
} from "./VanillaSubLevelRenderDispatcher.js";
class FancySubLevelRenderDispatcher {
  #vanilla = new VanillaSubLevelRenderDispatcher();
  createRenderData(subLevel) {
    const renderAnchor = selectSubLevelRenderAnchor(subLevel.blocks);
    const resolved = subLevel.blocks.map((block) => ({
      block,
      model: resolveFancySubLevelBlock(block)
    }));
    const registered = resolved.flatMap((entry) => entry.model ? [entry.model] : []);
    const primaryPacking = packFancySubLevelModels(registered);
    const primaryKeys = new Set(
      primaryPacking.models.flatMap((model) => model.assignments.map((assignment) => assignment.blockKey))
    );
    const ordinaryFallbacks = resolved.filter((entry) => !primaryKeys.has(blockKey(entry.block.localLocation))).map((entry) => entry.block);
    const vanillaBlocks = ordinaryFallbacks.filter(canRenderSubLevelBlockVanilla);
    const missingBlocks = ordinaryFallbacks.filter((block) => !canRenderSubLevelBlockVanilla(block)).map(resolveMissingFancySubLevelBlock);
    const missingPacking = packFancySubLevelModels(missingBlocks);
    if (missingPacking.unsupported.length > 0) {
      throw new Error("A projected block cannot be represented by either Sable render route.");
    }
    const packing = { models: [...primaryPacking.models, ...missingPacking.models] };
    const tags = normalizeRenderEntityTags(subLevel.renderEntityTags);
    let fancy;
    let vanilla;
    try {
      if (packing.models.length > 0) {
        fancy = new FancySubLevelModelRenderer(
          subLevel.body,
          packing.models,
          (typeId, location) => spawnTaggedEntity(subLevel, typeId, location, tags),
          subLevel.foliageTint ?? DEFAULT_SUBLEVEL_FOLIAGE_TINT,
          subLevel.onRenderEntityRemoved,
          renderAnchor,
          subLevel.onRenderEntityAdded
        );
      }
      if (vanillaBlocks.length > 0) {
        vanilla = this.#vanilla.createRenderDataAtAnchor(
          { ...subLevel, blocks: vanillaBlocks },
          renderAnchor
        );
      }
      if (!fancy && vanilla) return vanilla;
      if (fancy && !vanilla) return fancy;
      if (!fancy || !vanilla) {
        throw new Error("Cannot create render data for an empty sub-level.");
      }
      for (const entityId of vanilla.entityIds) subLevel.onRenderEntityAdded?.(entityId);
      return new CompositeSubLevelRenderData(fancy, vanilla, renderAnchor);
    } catch (error) {
      fancy?.remove();
      vanilla?.remove();
      throw error;
    }
  }
}
class CompositeSubLevelRenderData {
  constructor(fancy, vanilla, anchor) {
    this.fancy = fancy;
    this.vanilla = vanilla;
    this.anchor = anchor;
  }
  fancy;
  vanilla;
  anchor;
  emitsEntityAddedCallbacks = true;
  supportsBlockAddition = false;
  get initialPoseDeferred() {
    return this.fancy.initialPoseDeferred || this.vanilla.initialPoseDeferred;
  }
  get renderRotation() {
    return this.fancy.renderRotation;
  }
  get renderAnchorLocal() {
    return { ...this.anchor };
  }
  get entityCount() {
    return this.fancy.entityCount + this.vanilla.entityCount;
  }
  get entityIds() {
    return [...this.fancy.entityIds, ...this.vanilla.entityIds];
  }
  get entityLocations() {
    return [...this.fancy.entityLocations, ...this.vanilla.entityLocations];
  }
  get firstEntityLocation() {
    return this.fancy.firstEntityLocation ?? this.vanilla.firstEntityLocation;
  }
  hasEntity(entityId) {
    return this.fancy.hasEntity(entityId) || this.vanilla.hasEntity(entityId);
  }
  hasKnownIntegrityFailure() {
    return this.fancy.hasKnownIntegrityFailure() || this.vanilla.hasKnownIntegrityFailure();
  }
  hasIntactEntities() {
    return this.fancy.hasIntactEntities() && this.vanilla.hasIntactEntities();
  }
  releaseInitialPose() {
    this.fancy.releaseInitialPose();
    this.vanilla.releaseInitialPose();
  }
  remove() {
    this.fancy.remove();
    this.vanilla.remove();
  }
  removeBlocks(blockKeys) {
    this.fancy.removeBlocks(blockKeys);
    this.vanilla.removeBlocks(blockKeys);
  }
  sync(force = false) {
    return this.fancy.sync(force) + this.vanilla.sync(force);
  }
  setBlockModelState(blockKeyValue, dimension, value) {
    return this.fancy.setBlockModelState?.(blockKeyValue, dimension, value) ?? false;
  }
  attachAuxiliaryRider(entity) {
    return this.fancy.attachAuxiliaryRider?.(entity) ?? this.vanilla.attachAuxiliaryRider?.(entity) ?? false;
  }
  attachPersistentRider(entity) {
    return this.fancy.attachPersistentRider?.(entity) ?? this.vanilla.attachPersistentRider?.(entity) ?? false;
  }
  detachAuxiliaryRider(entity) {
    this.fancy.detachAuxiliaryRider?.(entity);
    this.vanilla.detachAuxiliaryRider?.(entity);
  }
  detachPersistentRider(entity, preserveEmptyCarrier = false) {
    this.fancy.detachPersistentRider?.(entity, preserveEmptyCarrier);
    this.vanilla.detachPersistentRider?.(entity, preserveEmptyCarrier);
  }
  removeEmptyPersistentRiderCarriers() {
    this.fancy.removeEmptyPersistentRiderCarriers?.();
    this.vanilla.removeEmptyPersistentRiderCarriers?.();
  }
}
function spawnTaggedEntity(subLevel, typeId, location, tags) {
  const entity = subLevel.dimension.spawnEntity(typeId, location);
  try {
    for (const tag of tags) {
      if (!entity.addTag(tag)) throw new Error(`Could not assign render entity tag ${tag}.`);
    }
    return entity;
  } catch (error) {
    if (entity.isValid) entity.remove();
    throw error;
  }
}
function blockKey(location) {
  return `${location.x},${location.y},${location.z}`;
}
export {
  FancySubLevelRenderDispatcher
};
