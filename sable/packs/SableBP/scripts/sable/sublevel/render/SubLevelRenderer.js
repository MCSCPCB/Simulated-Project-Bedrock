import { ItemTypes, system } from "@minecraft/server";
import { FancySubLevelRenderDispatcher } from "./dispatcher/FancySubLevelRenderDispatcher.js";
class SubLevelRenderer {
  static #dispatcher;
  static getDispatcher() {
    this.#dispatcher ??= new FancySubLevelRenderDispatcher();
    return this.#dispatcher;
  }
  static createRenderData(subLevel) {
    let renderData;
    try {
      renderData = this.getDispatcher().createRenderData(subLevel);
      renderData.sync(true);
      if (renderData.initialPoseDeferred) {
        const deferred = renderData;
        system.run(() => {
          if (!subLevel.body.isValid) return;
          deferred.sync(true);
          deferred.releaseInitialPose();
        });
      }
      if (!renderData.emitsEntityAddedCallbacks) {
        for (const entityId of renderData.entityIds) {
          subLevel.onRenderEntityAdded?.(entityId);
        }
      }
      return renderData;
    } catch (error) {
      renderData?.remove();
      throw error;
    }
  }
}
function assertBlockRenderItems(blocks) {
  const missing = /* @__PURE__ */ new Set();
  for (const block of blocks) {
    const itemTypeId = block.itemTypeId ?? block.typeId;
    if (!ItemTypes.get(itemTypeId)) missing.add(itemTypeId);
  }
  if (missing.size > 0) {
    throw new Error(`Block render items are not registered: ${[...missing].sort().join(", ")}.`);
  }
}
export {
  SubLevelRenderer,
  assertBlockRenderItems
};
