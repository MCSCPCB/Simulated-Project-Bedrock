// Registration index for the vanilla per-block behavior modules. Each block's
// specifics stay in its own folder; this file only enumerates them so the
// block-agnostic bootstrap has a single entry point to call.
import type { SubLevelBlockBehaviorRegistry } from "../../../api/block/SubLevelBlockBehaviors.js";
import type {
  SubLevelContainerInteractionController,
  SubLevelContainerStorageBinding
} from "../../assembly/SubLevelContainerInteraction.js";
import { registerBeeNestSubLevelBehavior } from "./bee_nest/BeeNestSubLevelBehavior.js";
import { registerChestSubLevelBehavior } from "./chest/ChestSubLevelBehavior.js";

export interface VanillaSubLevelBlockBehaviorContext {
  readonly behaviors: SubLevelBlockBehaviorRegistry;
  readonly containers: SubLevelContainerInteractionController;
  readonly onNativeDeath?: (
    ownerId: string,
    binding: SubLevelContainerStorageBinding
  ) => void;
  readonly onUnexpectedRemoval?: (
    ownerId: string,
    binding: SubLevelContainerStorageBinding
  ) => void;
}

export function registerVanillaSubLevelBlockBehaviors(
  context: VanillaSubLevelBlockBehaviorContext
): void {
  registerChestSubLevelBehavior(context);
  registerBeeNestSubLevelBehavior(context);
}
