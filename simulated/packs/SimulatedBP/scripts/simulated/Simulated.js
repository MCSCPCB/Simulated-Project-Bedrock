import { initPhysicsAssemblerBlock } from "./content/blocks/physics_assembler/PhysicsAssemblerBlock.js";
import { initPhysicsAssemblerHoldTip } from "./content/blocks/behaviour/HoldTipBehaviour.js";
import { initHoldTipManager } from "./util/hold_interaction/HoldTipManager.js";
import "./data/advancements/SimAdvancements.js";
function init() {
  initPhysicsAssemblerBlock();
  initPhysicsAssemblerHoldTip();
  initHoldTipManager();
}
init();
export {
  init
};
