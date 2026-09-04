import type { Entity, Vector3 } from "@minecraft/server";
import type { SubLevel, SubLevelBlock } from "../../SubLevel.js";
import type { SubLevelRenderData } from "../SubLevelRenderData.js";
import { FancySubLevelModelRenderer } from "../fancy/model/FancySubLevelModelRenderer.js";
import { packFancySubLevelModels } from "../fancy/model/FancySubLevelModelLayout.js";
import {
  resolveFancySubLevelBlock,
  resolveMissingFancySubLevelBlock
} from "../fancy/model/FancySubLevelModelRegistry.js";
import { DEFAULT_SUBLEVEL_FOLIAGE_TINT } from "../fancy/model/FancySubLevelTintCodec.js";
import { selectSubLevelRenderAnchor } from "../../../util/SublevelRenderOffsetHelper.js";
import type { SubLevelRenderDispatcher } from "./SubLevelRenderDispatcher.js";
import {
  canRenderSubLevelBlockVanilla,
  normalizeRenderEntityTags,
  VanillaSubLevelRenderDispatcher
} from "./VanillaSubLevelRenderDispatcher.js";

export class FancySubLevelRenderDispatcher implements SubLevelRenderDispatcher {
  readonly #vanilla = new VanillaSubLevelRenderDispatcher();

  createRenderData(subLevel: SubLevel): SubLevelRenderData {
    const renderAnchor = selectSubLevelRenderAnchor(subLevel.blocks);
    const resolved = subLevel.blocks.map(block => ({
      block,
      model: resolveFancySubLevelBlock(block)
    }));
    const registered = resolved.flatMap(entry => entry.model ? [entry.model] : []);
    const primaryPacking = packFancySubLevelModels(registered);
    const primaryKeys = new Set(
      primaryPacking.models.flatMap(model => model.assignments.map(assignment => assignment.blockKey))
    );
    const ordinaryFallbacks = resolved
      .filter(entry => !primaryKeys.has(blockKey(entry.block.localLocation)))
      .map(entry => entry.block);
    const vanillaBlocks = ordinaryFallbacks.filter(canRenderSubLevelBlockVanilla);
    const missingBlocks = ordinaryFallbacks
      .filter(block => !canRenderSubLevelBlockVanilla(block))
      .map(resolveMissingFancySubLevelBlock);
    const missingPacking = packFancySubLevelModels(missingBlocks);
    if (missingPacking.unsupported.length > 0) {
      throw new Error("A projected block cannot be represented by either Sable render route.");
    }
    const packing = { models: [...primaryPacking.models, ...missingPacking.models] };
    const tags = normalizeRenderEntityTags(subLevel.renderEntityTags);
    let fancy: SubLevelRenderData | undefined;
    let vanilla: SubLevelRenderData | undefined;
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

class CompositeSubLevelRenderData implements SubLevelRenderData {
  readonly emitsEntityAddedCallbacks = true;
  readonly supportsBlockAddition = false;

  constructor(
    readonly fancy: SubLevelRenderData,
    readonly vanilla: SubLevelRenderData,
    readonly anchor: Vector3
  ) {}

  get initialPoseDeferred(): boolean {
    return this.fancy.initialPoseDeferred || this.vanilla.initialPoseDeferred;
  }
  get renderRotation(): Readonly<Vector3> { return this.fancy.renderRotation; }
  get renderAnchorLocal(): Vector3 { return { ...this.anchor }; }
  get entityCount(): number { return this.fancy.entityCount + this.vanilla.entityCount; }
  get entityIds(): readonly string[] { return [...this.fancy.entityIds, ...this.vanilla.entityIds]; }
  get entityLocations(): readonly Vector3[] {
    return [...this.fancy.entityLocations, ...this.vanilla.entityLocations];
  }
  get firstEntityLocation(): Vector3 | undefined {
    return this.fancy.firstEntityLocation ?? this.vanilla.firstEntityLocation;
  }
  hasEntity(entityId: string): boolean {
    return this.fancy.hasEntity(entityId) || this.vanilla.hasEntity(entityId);
  }
  hasKnownIntegrityFailure(): boolean {
    return this.fancy.hasKnownIntegrityFailure() || this.vanilla.hasKnownIntegrityFailure();
  }
  hasIntactEntities(): boolean {
    return this.fancy.hasIntactEntities() && this.vanilla.hasIntactEntities();
  }
  releaseInitialPose(): void {
    this.fancy.releaseInitialPose();
    this.vanilla.releaseInitialPose();
  }
  remove(): void {
    this.fancy.remove();
    this.vanilla.remove();
  }
  removeBlocks(blockKeys: ReadonlySet<string>): void {
    this.fancy.removeBlocks(blockKeys);
    this.vanilla.removeBlocks(blockKeys);
  }
  sync(force = false): number {
    return this.fancy.sync(force) + this.vanilla.sync(force);
  }
  setBlockModelState(blockKeyValue: string, dimension: string, value: number): boolean {
    return this.fancy.setBlockModelState?.(blockKeyValue, dimension, value) ?? false;
  }
  attachAuxiliaryRider(entity: Entity): boolean {
    return this.fancy.attachAuxiliaryRider?.(entity)
      ?? this.vanilla.attachAuxiliaryRider?.(entity)
      ?? false;
  }
  attachPersistentRider(entity: Entity): boolean {
    return this.fancy.attachPersistentRider?.(entity)
      ?? this.vanilla.attachPersistentRider?.(entity)
      ?? false;
  }
  detachAuxiliaryRider(entity: Entity): void {
    this.fancy.detachAuxiliaryRider?.(entity);
    this.vanilla.detachAuxiliaryRider?.(entity);
  }
  detachPersistentRider(entity: Entity, preserveEmptyCarrier = false): void {
    this.fancy.detachPersistentRider?.(entity, preserveEmptyCarrier);
    this.vanilla.detachPersistentRider?.(entity, preserveEmptyCarrier);
  }
  removeEmptyPersistentRiderCarriers(): void {
    this.fancy.removeEmptyPersistentRiderCarriers?.();
    this.vanilla.removeEmptyPersistentRiderCarriers?.();
  }
  transferPersistentRidersTo(target: SubLevelRenderData): void {
    this.fancy.transferPersistentRidersTo?.(target);
    this.vanilla.transferPersistentRidersTo?.(target);
  }
}

function spawnTaggedEntity(
  subLevel: SubLevel,
  typeId: string,
  location: Vector3,
  tags: readonly string[]
): Entity {
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

function blockKey(location: Vector3): string {
  return `${location.x},${location.y},${location.z}`;
}
