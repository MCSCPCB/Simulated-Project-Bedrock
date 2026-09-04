import { selectSubLevelRenderAnchor } from "../../util/SublevelRenderOffsetHelper.js";
import {
  EPSILON_1E8,
  blockLocationKey,
  isFiniteVector
} from "../../util/SableVector3Utils.js";
import {
  raycastSubLevelGrid
} from "../../content/raycast/SubLevelGridRaycast.js";
function isSubLevelBlockRaySolid(block) {
  return block.collisionResponse !== false && isSubLevelBlockCollidable(block);
}
function isSubLevelBlockCollidable(block) {
  if (block.collidable === false || block.collisionShape === "none") return false;
  return true;
}
class SubLevelInteractionHandle {
  id;
  subLevel;
  #options;
  #runtime;
  #blocks;
  #blocksByKey;
  #contentRevision = 0;
  #anchorLocal;
  #unregistered = false;
  constructor(id, subLevel, options, runtime) {
    this.id = id;
    this.subLevel = subLevel;
    this.#options = options;
    this.#runtime = runtime;
    this.#blocks = [...subLevel.blocks];
    this.#blocksByKey = indexBlocks(this.#blocks);
    this.#anchorLocal = options.renderData?.renderAnchorLocal ?? selectSubLevelRenderAnchor(this.#blocks);
  }
  get isValid() {
    return !this.#unregistered && this.subLevel.body.isValid;
  }
  get dimension() {
    return this.subLevel.dimension;
  }
  get blocks() {
    return this.#blocks;
  }
  get contentRevision() {
    return this.#contentRevision;
  }
  get supportsBlockPlacement() {
    return this.#options.supportsBlockPlacement ?? true;
  }
  get isMoving() {
    return this.#options.isMoving?.() ?? false;
  }
  get renderData() {
    return this.#options.renderData;
  }
  get visualRotation() {
    const body = this.subLevel.body;
    return body.getRenderRotation?.() ?? body.getRotation();
  }
  get outlineAnchorLocal() {
    return { ...this.#anchorLocal };
  }
  get outlineAnchorLocation() {
    return this.localPointToWorld(this.#anchorLocal);
  }
  localPointToWorld(location) {
    return this.subLevel.body.localPointToWorld(location);
  }
  worldPointToLocal(point) {
    return this.#options.worldPointToLocal(point);
  }
  getBlockAtLocalLocation(location) {
    return this.#blocksByKey.get(blockLocationKey(location));
  }
  raycast(origin, direction, maximumDistance, options) {
    if (!this.isValid || !isFiniteVector(origin) || !isFiniteVector(direction)) {
      return void 0;
    }
    if (Number.isNaN(maximumDistance) || maximumDistance < 0) return void 0;
    const directionLength = Math.hypot(direction.x, direction.y, direction.z);
    if (!Number.isFinite(directionLength) || directionLength < EPSILON_1E8) return void 0;
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
    const blockAt = options?.ignorePassableBlocks ? (x, y, z) => {
      const block = this.#blocksByKey.get(`${x},${y},${z}`);
      return block && isSubLevelBlockRaySolid(block) ? block : void 0;
    } : (x, y, z) => this.#blocksByKey.get(`${x},${y},${z}`);
    const closest = raycastSubLevelGrid(
      blockAt,
      localOrigin,
      localDirection,
      maximumDistance,
      { skipContainingCell: options?.skipContainingBlock }
    );
    if (!closest) return void 0;
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
  removeBlockAtLocalLocation(location) {
    return this.removeBlocksAtLocalLocations([location])[0];
  }
  removeBlocksAtLocalLocations(locations) {
    const keys = new Set(locations.map(blockLocationKey));
    const removed = this.#blocks.filter((block) => keys.has(blockLocationKey(block.localLocation)));
    if (removed.length === 0) return [];
    const removedKeys = new Set(removed.map((block) => blockLocationKey(block.localLocation)));
    this.#blocks = this.#blocks.filter(
      (block) => !removedKeys.has(blockLocationKey(block.localLocation))
    );
    for (const key of removedKeys) this.#blocksByKey.delete(key);
    this.#options.renderData?.removeBlocks(removedKeys);
    this.markContentChanged();
    return removed;
  }
  /** Adds a placed block. The render data must support addition to project it. */
  addBlock(block) {
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
  setBlockModelState(localLocation, dimension, value) {
    return this.#options.renderData?.setBlockModelState?.(
      blockLocationKey(localLocation),
      dimension,
      value
    ) ?? false;
  }
  attachOutlineEntity(entity) {
    const renderData = this.#options.renderData;
    if (!renderData?.attachAuxiliaryRider) return true;
    return renderData.attachAuxiliaryRider(entity);
  }
  detachOutlineEntity(entity) {
    this.#options.renderData?.detachAuxiliaryRider?.(entity);
  }
  attachPersistentEntity(entity) {
    const renderData = this.#options.renderData;
    if (!renderData?.attachPersistentRider) return true;
    return renderData.attachPersistentRider(entity);
  }
  detachPersistentEntity(entity, preserveEmptyCarrier = false) {
    this.#options.renderData?.detachPersistentRider?.(entity, preserveEmptyCarrier);
  }
  removeEmptyPersistentEntityCarriers() {
    this.#options.renderData?.removeEmptyPersistentRiderCarriers?.();
  }
  hasVisualEntity(entityId) {
    return this.#options.renderData?.hasEntity(entityId) ?? false;
  }
  /** Call after mutating this sub-level's blocks outside the handle helpers. */
  markContentChanged() {
    this.#contentRevision++;
    this.#anchorLocal = this.#options.renderData?.renderAnchorLocal ?? selectSubLevelRenderAnchor(this.#blocks);
    this.#runtime.bumpRaycastRevision(this.subLevel.dimension.id);
  }
  /** Rebuild the index from the live SubLevel blocks after external replacement. */
  resetBlocks(blocks) {
    this.#blocks = [...blocks];
    this.#blocksByKey = indexBlocks(this.#blocks);
    this.markContentChanged();
  }
  unregister() {
    if (this.#unregistered) return;
    this.#unregistered = true;
    this.#runtime.dropHandle(this);
  }
}
class SubLevelInteractionSystem {
  #handlesByDimension = /* @__PURE__ */ new Map();
  #raycastRevisions = /* @__PURE__ */ new Map();
  #nextHandleId = 1;
  register(subLevel, options) {
    const handle = new SubLevelInteractionHandle(this.#nextHandleId++, subLevel, options, this);
    let handles = this.#handlesByDimension.get(subLevel.dimension.id);
    if (!handles) {
      handles = /* @__PURE__ */ new Set();
      this.#handlesByDimension.set(subLevel.dimension.id, handles);
    }
    handles.add(handle);
    this.bumpRaycastRevision(subLevel.dimension.id);
    return handle;
  }
  hasSubLevels(dimensionId) {
    return (this.#handlesByDimension.get(dimensionId)?.size ?? 0) > 0;
  }
  *getRaycastCandidates(dimensionId) {
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
  getHandleById(id) {
    for (const handles of this.#handlesByDimension.values()) {
      for (const handle of handles) {
        if (handle.id === id) return handle.isValid ? handle : void 0;
      }
    }
    return void 0;
  }
  /** Any moving sub-level continuously invalidates cached selection rays. */
  getRaycastRevision(dimensionId) {
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
  isVisualEntity(dimensionId, entityId) {
    const handles = this.#handlesByDimension.get(dimensionId);
    if (!handles) return false;
    for (const handle of handles) {
      if (handle.isValid && handle.hasVisualEntity(entityId)) return true;
    }
    return false;
  }
  bumpRaycastRevision(dimensionId) {
    this.#raycastRevisions.set(dimensionId, (this.#raycastRevisions.get(dimensionId) ?? 0) + 1);
  }
  dropHandle(handle) {
    const handles = this.#handlesByDimension.get(handle.subLevel.dimension.id);
    if (!handles?.delete(handle)) return;
    this.bumpRaycastRevision(handle.subLevel.dimension.id);
  }
}
function indexBlocks(blocks) {
  const index = /* @__PURE__ */ new Map();
  for (const block of blocks) index.set(blockLocationKey(block.localLocation), block);
  return index;
}
function normalizeVector(value) {
  const length = Math.hypot(value.x, value.y, value.z);
  if (!Number.isFinite(length) || length < EPSILON_1E8) return { x: 0, y: 0, z: 0 };
  return { x: value.x / length, y: value.y / length, z: value.z / length };
}
export {
  SubLevelInteractionHandle,
  SubLevelInteractionSystem,
  isSubLevelBlockCollidable,
  isSubLevelBlockRaySolid
};
