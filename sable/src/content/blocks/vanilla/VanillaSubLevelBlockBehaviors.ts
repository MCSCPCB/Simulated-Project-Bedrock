// Registration index for the vanilla per-block behavior modules. Each block's
// specifics stay in its own folder; this file only enumerates them so the
// block-agnostic bootstrap has a single entry point to call.
import type { SubLevelBlockBehaviorRegistry } from "../../../api/block/SubLevelBlockBehaviors.js";
import type { SubLevelContainerInteractionController } from "../../assembly/SubLevelContainerInteraction.js";
import { registerBeeNestSubLevelBehavior } from "./bee_nest/BeeNestSubLevelBehavior.js";
import { registerChestSubLevelBehavior } from "./chest/ChestSubLevelBehavior.js";

export interface VanillaSubLevelBlockBehaviorContext {
  readonly behaviors: SubLevelBlockBehaviorRegistry;
  readonly containers: SubLevelContainerInteractionController;
}

export function registerVanillaSubLevelBlockBehaviors(
  context: VanillaSubLevelBlockBehaviorContext
): void {
  registerChestSubLevelBehavior(context);
  registerBeeNestSubLevelBehavior(context);
}
