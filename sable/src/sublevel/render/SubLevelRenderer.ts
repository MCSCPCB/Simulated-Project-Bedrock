import { ItemTypes, system } from "@minecraft/server";
import type { SubLevel, SubLevelBlock } from "../SubLevel.js";
import type { SubLevelRenderData } from "./SubLevelRenderData.js";
import type { SubLevelRenderDispatcher } from "./dispatcher/SubLevelRenderDispatcher.js";
import { VanillaSubLevelRenderDispatcher } from "./dispatcher/VanillaSubLevelRenderDispatcher.js";

/** Entry point for the currently available sub-level projection renderer. */
export class SubLevelRenderer {
  static #dispatcher: SubLevelRenderDispatcher | undefined;

  static getDispatcher(): SubLevelRenderDispatcher {
    this.#dispatcher ??= new VanillaSubLevelRenderDispatcher();
    return this.#dispatcher;
  }

  static createRenderData(subLevel: SubLevel): SubLevelRenderData {
    let renderData: SubLevelRenderData | undefined;
    try {
      renderData = this.getDispatcher().createRenderData(subLevel);
      renderData.sync(true);
      if (renderData.initialPoseDeferred) {
        const deferredRenderData = renderData;
        system.run(() => {
          if (!subLevel.body.isValid) return;
          deferredRenderData.sync(true);
          deferredRenderData.releaseInitialPose();
        });
      }
      for (const entityId of renderData.entityIds) {
        subLevel.onVisualEntityAdded?.(entityId);
      }
      return renderData;
    } catch (error) {
      renderData?.remove();
      throw error;
    }
  }
}

/** Refuse item rendering when any captured block has no registered visual item. */
export function assertBlockVisualItems(blocks: readonly SubLevelBlock[]): void {
  const missing = new Set<string>();
  for (const block of blocks) {
    const itemTypeId = block.itemTypeId ?? block.typeId;
    if (!ItemTypes.get(itemTypeId)) missing.add(itemTypeId);
  }
  if (missing.size > 0) {
    throw new Error(
      `Block visual items are not registered: ${[...missing].sort().join(", ")}.`
    );
  }
}
