import { getPhysicsAssemblerHoldTip } from "../physics_assembler/PhysicsAssemblerBlockEntity.js";
import { registerHoldTip } from "../../../util/hold_interaction/HoldTipManager.js";
const PHYSICS_ASSEMBLER = "simulated:physics_assembler";
function initPhysicsAssemblerHoldTip() {
  registerHoldTip({
    id: PHYSICS_ASSEMBLER,
    maxDistance: 6,
    matches: (block) => block.typeId === PHYSICS_ASSEMBLER,
    getTip: ({ block }) => getPhysicsAssemblerHoldTip(block)
  });
}
export {
  initPhysicsAssemblerHoldTip
};
