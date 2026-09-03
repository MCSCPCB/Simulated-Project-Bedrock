import { ItemTypes, system } from "@minecraft/server";
import type { SubLevel, SubLevelBlock } from "../SubLevel.js";
import type { SubLevelRenderData } from "./SubLevelRenderData.js";
import type { SubLevelRenderDispatcher } from "./dispatcher/SubLevelRenderDispatcher.js";
import { FancySubLevelRenderDispatcher } from "./dispatcher/FancySubLevelRenderDispatcher.js";

export class SubLevelRenderer {
  static #dispatcher: SubLevelRenderDispatcher | undefined;

  static getDispatcher(): SubLevelRenderDispatcher {
    this.#dispatcher ??= new FancySubLevelRenderDispatcher();
    return this.#dispatcher;
  }

  static createRenderData(subLevel: SubLevel): SubLevelRenderData {
    let renderData: SubLevelRenderData | undefined;
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

export function assertBlockRenderItems(blocks: readonly SubLevelBlock[]): void {
  const missing = new Set<string>();
  for (const block of blocks) {
    const itemTypeId = block.itemTypeId ?? block.typeId;
    if (!ItemTypes.get(itemTypeId)) missing.add(itemTypeId);
  }
  if (missing.size > 0) {
    throw new Error(`Block render items are not registered: ${[...missing].sort().join(", ")}.`);
  }
}
