// The sub-level interaction runtime: the interaction-facing capabilities the
// source contraption object carried (local block index, grid raycast, content
// revision, render rotation and anchor, model-state passthrough, rider
// attachment) provided over a plain SubLevel plus its render data.
import type { Dimension, Entity, Vector3 } from "@minecraft/server";
import type { SubLevel, SubLevelBlock } from "../SubLevel.js";
import type { SubLevelRenderData } from "../render/SubLevelRenderData.js";
import { selectSubLevelRenderAnchor } from "../../util/SublevelRenderOffsetHelper.js";
import {
  EPSILON_1E8,
  blockLocationKey,
  isFiniteVector
} from "../../util/SableVector3Utils.js";
import {
  raycastSubLevelGrid,
  type SubLevelBlockFace
} from "../../content/raycast/SubLevelGridRaycast.js";

export interface SubLevelInteractionRaycastOptions {
  /** Interaction rays traverse passable foliage; selection rays do not opt in. */
  readonly ignorePassableBlocks?: boolean;
  /** Ignore the cell containing the ray origin (crosshair inside foliage). */
  readonly skipContainingBlock?: boolean;
}

export interface SubLevelInteractionRaycastHit {
  readonly block: SubLevelBlock;
  readonly distance: number;
  readonly face: SubLevelBlockFace;
  /** Exact hit point in sub-level local coordinates. */
  readonly localLocation: Vector3;
  readonly localNormal: Vector3;
  /** Exact hit point in world coordinates. */
  readonly location: Vector3;
  readonly normal: Vector3;
}

export interface SubLevelInteractionRegistrationOptions {
  /** Inverse of the body's localPointToWorld; interaction needs both directions. */
  worldPointToLocal(point: Vector3): Vector3;
  /** Render data whose entities project this sub-level, when one exists. */
  readonly renderData?: SubLevelRenderData;
  /** True while the sub-level may be moving; keeps selection rays refreshing. */
  isMoving?(): boolean;
  /** Whether block placement onto this sub-level is supported. Defaults to true. */
  readonly supportsBlockPlacement?: boolean;
}

/** Whether a block stops interaction rays: passable foliage lets them through. */
export function isSubLevelBlockRaySolid(block: SubLevelBlock): boolean {
  return block.collisionResponse !== false && isSubLevelBlockCollidable(block);
}

export function isSubLevelBlockCollidable(block: SubLevelBlock): boolean {
  if (block.collidable === false || block.collisionShape === "none") return false;
  return true;
}

export class SubLevelInteractionHandle {
  readonly id: number;
  readonly subLevel: SubLevel;
  readonly #options: SubLevelInteractionRegistrationOptions;
  readonly #runtime: SubLevelInteractionSystem;
  #blocks: SubLevelBlock[];
  #blocksByKey: Map<string, SubLevelBlock>;
  #contentRevision = 0;
  #anchorLocal: Vector3;
  #unregistered = false;

  constructor(
    id: number,
    subLevel: SubLevel,
    options: SubLevelInteractionRegistrationOptions,
    runtime: SubLevelInteractionSystem
  ) {
    this.id = id;
    this.subLevel = subLevel;
    this.#options = options;
    this.#runtime = runtime;
    this.#blocks = [...subLevel.blocks];
    this.#blocksByKey = indexBlocks(this.#blocks);
    this.#anchorLocal = options.renderData?.renderAnchorLocal
      ?? selectSubLevelRenderAnchor(this.#blocks);
  }

  get isValid(): boolean {
    return !this.#unregistered && this.subLevel.body.isValid;
  }

  get dimension(): Dimension {
    return this.subLevel.dimension;
  }

  get blocks(): readonly SubLevelBlock[] {
    return this.#blocks;
  }

  get contentRevision(): number {
    return this.#contentRevision;
  }

  get supportsBlockPlacement(): boolean {
    return this.#options.supportsBlockPlacement ?? true;
  }

  get isMoving(): boolean {
    return this.#options.isMoving?.() ?? false;
  }

  get renderData(): SubLevelRenderData | undefined {
    return this.#options.renderData;
  }

  get visualRotation(): Vector3 {
    const body = this.subLevel.body;
    return body.getRenderRotation?.() ?? body.getRotation();
  }

  get outlineAnchorLocal(): Vector3 {
    return { ...this.#anchorLocal };
  }

  get outlineAnchorLocation(): Vector3 {
    return this.localPointToWorld(this.#anchorLocal);
  }

  localPointToWorld(location: Vector3): Vector3 {
    return this.subLevel.body.localPointToWorld(location);
  }

  worldPointToLocal(point: Vector3): Vector3 {
    return this.#options.worldPointToLocal(point);
  }

  getBlockAtLocalLocation(location: Vector3): SubLevelBlock | undefined {
    return this.#blocksByKey.get(blockLocationKey(location));
  }

  raycast(
    origin: Vector3,
    direction: Vector3,
    maximumDistance: number,
    options?: SubLevelInteractionRaycastOptions
  ): SubLevelInteractionRaycastHit | undefined {
    if (!this.isValid || !isFiniteVector(origin) || !isFiniteVector(direction)) {
      return undefined;
    }
    if (Number.isNaN(maximumDistance) || maximumDistance < 0) return undefined;
    const directionLength = Math.hypot(direction.x, direction.y, direction.z);
    if (!Number.isFinite(directionLength) || directionLength < EPSILON_1E8) return undefined;
    const unitDirection = {
      x: direction.x / directionLength,
      y: direction.y / directionLength,
      z: direction.z / directionLength
    };
    const localOrigin = this.worldPointToLocal(origin);
    const localEnd = this.worldPointToLocal({
      x: origin.x + unitDirection.x,
      y: origin.y + unitDirection.y,
      z: origin.z + unitDirection.z
    });
    const localDirection = {
      x: localEnd.x - localOrigin.x,
      y: localEnd.y - localOrigin.y,
      z: localEnd.z - localOrigin.z
    };
    const blockAt = options?.ignorePassableBlocks
      ? (x: number, y: number, z: number) => {
        const block = this.#blocksByKey.get(`${x},${y},${z}`);
        return block && isSubLevelBlockRaySolid(block) ? block : undefined;
      }
      : (x: number, y: number, z: number) => this.#blocksByKey.get(`${x},${y},${z}`);
    const closest = raycastSubLevelGrid(
      blockAt,
      localOrigin,
      localDirection,
      maximumDistance,
      { skipContainingCell: options?.skipContainingBlock }
    );
    if (!closest) return undefined;
    const location = {
      x: origin.x + unitDirection.x * closest.distance,
      y: origin.y + unitDirection.y * closest.distance,
      z: origin.z + unitDirection.z * closest.distance
    };
    const localLocation = {
      x: localOrigin.x + localDirection.x * closest.distance,
      y: localOrigin.y + localDirection.y * closest.distance,
      z: localOrigin.z + localDirection.z * closest.distance
    };
    const localZero = this.localPointToWorld({ x: 0, y: 0, z: 0 });
    const rotatedNormal = this.localPointToWorld(closest.localNormal);
    const normal = normalizeVector({
      x: rotatedNormal.x - localZero.x,
      y: rotatedNormal.y - localZero.y,
      z: rotatedNormal.z - localZero.z
    });
    return {
      block: closest.block,
      distance: closest.distance,
      face: closest.face,
      localLocation,
      localNormal: closest.localNormal,
      location,
      normal
    };
  }

  removeBlockAtLocalLocation(location: Vector3): SubLevelBlock | undefined {
    return this.removeBlocksAtLocalLocations([location])[0];
  }

  removeBlocksAtLocalLocations(locations: readonly Vector3[]): SubLevelBlock[] {
    const keys = new Set(locations.map(blockLocationKey));
    const removed = this.#blocks.filter(block => keys.has(blockLocationKey(block.localLocation)));
    if (removed.length === 0) return [];
    const removedKeys = new Set(removed.map(block => blockLocationKey(block.localLocation)));
    this.#blocks = this.#blocks.filter(
      block => !removedKeys.has(blockLocationKey(block.localLocation))
    );
    for (const key of removedKeys) this.#blocksByKey.delete(key);
    this.#options.renderData?.removeBlocks(removedKeys);
    this.markContentChanged();
    return removed;
  }

  /** Adds a placed block. The render data must support addition to project it. */
  addBlock(block: SubLevelBlock): boolean {
    const key = blockLocationKey(block.localLocation);
    if (this.#blocksByKey.has(key)) return false;
    const renderData = this.#options.renderData;
    if (renderData) {
      if (renderData.supportsBlockAddition !== true || !renderData.addBlocks) return false;
      renderData.addBlocks([block]);
    }
    this.#blocks.push(block);
    this.#blocksByKey.set(key, block);
    this.markContentChanged();
    return true;
  }

  setBlockModelState(localLocation: Vector3, dimension: string, value: number): boolean {
    return this.#options.renderData?.setBlockModelState?.(
      blockLocationKey(localLocation),
      dimension,
      value
    ) ?? false;
  }

  attachOutlineEntity(entity: Entity): boolean {
    const renderData = this.#options.renderData;
    if (!renderData?.attachAuxiliaryRider) return true;
    return renderData.attachAuxiliaryRider(entity);
  }

  detachOutlineEntity(entity: Entity): void {
    this.#options.renderData?.detachAuxiliaryRider?.(entity);
  }

  attachPersistentEntity(entity: Entity): boolean {
    const renderData = this.#options.renderData;
    if (!renderData?.attachPersistentRider) return true;
    return renderData.attachPersistentRider(entity);
  }

  detachPersistentEntity(entity: Entity, preserveEmptyCarrier = false): void {
    this.#options.renderData?.detachPersistentRider?.(entity, preserveEmptyCarrier);
  }

  removeEmptyPersistentEntityCarriers(): void {
    this.#options.renderData?.removeEmptyPersistentRiderCarriers?.();
  }

  hasVisualEntity(entityId: string): boolean {
    return this.#options.renderData?.hasEntity(entityId) ?? false;
  }

  /** Call after mutating this sub-level's blocks outside the handle helpers. */
  markContentChanged(): void {
    this.#contentRevision++;
    this.#anchorLocal = this.#options.renderData?.renderAnchorLocal
      ?? selectSubLevelRenderAnchor(this.#blocks);
    this.#runtime.bumpRaycastRevision(this.subLevel.dimension.id);
  }

  /** Rebuild the index from the live SubLevel blocks after external replacement. */
  resetBlocks(blocks: readonly SubLevelBlock[]): void {
    this.#blocks = [...blocks];
    this.#blocksByKey = indexBlocks(this.#blocks);
    this.markContentChanged();
  }

  unregister(): void {
    if (this.#unregistered) return;
    this.#unregistered = true;
    this.#runtime.dropHandle(this);
  }
}

/** Tracks the interactive sub-levels per dimension for the interaction controllers. */
export class SubLevelInteractionSystem {
  readonly #handlesByDimension = new Map<string, Set<SubLevelInteractionHandle>>();
  readonly #raycastRevisions = new Map<string, number>();
  #nextHandleId = 1;

  register(
    subLevel: SubLevel,
    options: SubLevelInteractionRegistrationOptions
  ): SubLevelInteractionHandle {
    const handle = new SubLevelInteractionHandle(this.#nextHandleId++, subLevel, options, this);
    let handles = this.#handlesByDimension.get(subLevel.dimension.id);
    if (!handles) {
      handles = new Set();
      this.#handlesByDimension.set(subLevel.dimension.id, handles);
    }
    handles.add(handle);
    this.bumpRaycastRevision(subLevel.dimension.id);
    return handle;
  }

  hasSubLevels(dimensionId: string): boolean {
    return (this.#handlesByDimension.get(dimensionId)?.size ?? 0) > 0;
  }

  *getRaycastCandidates(dimensionId: string): IterableIterator<SubLevelInteractionHandle> {
    const handles = this.#handlesByDimension.get(dimensionId);
    if (!handles) return;
    for (const handle of handles) {
      if (!handle.isValid) {
        this.dropHandle(handle);
        continue;
      }
      yield handle;
    }
  }

  getHandleById(id: number): SubLevelInteractionHandle | undefined {
    for (const handles of this.#handlesByDimension.values()) {
      for (const handle of handles) {
        if (handle.id === id) return handle.isValid ? handle : undefined;
      }
    }
    return undefined;
  }

  /** Any moving sub-level continuously invalidates cached selection rays. */
  getRaycastRevision(dimensionId: string): number {
    const handles = this.#handlesByDimension.get(dimensionId);
    if (handles) {
      for (const handle of handles) {
        if (handle.isValid && handle.isMoving) {
          this.bumpRaycastRevision(dimensionId);
          break;
        }
      }
    }
    return this.#raycastRevisions.get(dimensionId) ?? 0;
  }

  isVisualEntity(dimensionId: string, entityId: string): boolean {
    const handles = this.#handlesByDimension.get(dimensionId);
    if (!handles) return false;
    for (const handle of handles) {
      if (handle.isValid && handle.hasVisualEntity(entityId)) return true;
    }
    return false;
  }

  bumpRaycastRevision(dimensionId: string): void {
    this.#raycastRevisions.set(dimensionId, (this.#raycastRevisions.get(dimensionId) ?? 0) + 1);
  }

  dropHandle(handle: SubLevelInteractionHandle): void {
    const handles = this.#handlesByDimension.get(handle.subLevel.dimension.id);
    if (!handles?.delete(handle)) return;
    this.bumpRaycastRevision(handle.subLevel.dimension.id);
  }
}

function indexBlocks(blocks: readonly SubLevelBlock[]): Map<string, SubLevelBlock> {
  const index = new Map<string, SubLevelBlock>();
  for (const block of blocks) index.set(blockLocationKey(block.localLocation), block);
  return index;
}

function normalizeVector(value: Vector3): Vector3 {
  const length = Math.hypot(value.x, value.y, value.z);
  if (!Number.isFinite(length) || length < EPSILON_1E8) return { x: 0, y: 0, z: 0 };
  return { x: value.x / length, y: value.y / length, z: value.z / length };
}
