import { registerBeeNestSubLevelBehavior } from "./bee_nest/BeeNestSubLevelBehavior.js";
import { registerChestSubLevelBehavior } from "./chest/ChestSubLevelBehavior.js";
function registerVanillaSubLevelBlockBehaviors(context) {
  registerChestSubLevelBehavior(context);
  registerBeeNestSubLevelBehavior(context);
}
export {
  registerVanillaSubLevelBlockBehaviors
};
