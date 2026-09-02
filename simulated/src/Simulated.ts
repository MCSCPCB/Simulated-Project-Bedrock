import { initPhysicsAssemblerBlock } from "./content/blocks/physics_assembler/PhysicsAssemblerBlock.js";
import { initPhysicsAssemblerHoldTip } from "./content/blocks/behaviour/HoldTipBehaviour.js";
import { initHoldTipManager } from "./util/hold_interaction/HoldTipManager.js";

export function init(): void {
    initPhysicsAssemblerBlock();
    initPhysicsAssemblerHoldTip();
    initHoldTipManager();
}

init();
