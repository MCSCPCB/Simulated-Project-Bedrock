import { system } from "@minecraft/server";
import { showPhysicsAssemblerForm } from "./PhysicsAssemblerGUIHandler.js";
const PHYSICS_ASSEMBLER_COMPONENT = "simulated:physics_assembler";
let componentRegistrationQueued = false;
const physicsAssemblerComponent = {
  onPlayerInteract(event) {
    system.run(() => showPhysicsAssemblerForm(event.player, event.block));
  }
};
function initPhysicsAssemblerBlock() {
  if (componentRegistrationQueued) return;
  componentRegistrationQueued = true;
  system.beforeEvents.startup.subscribe(({ blockComponentRegistry }) => {
    blockComponentRegistry.registerCustomComponent(
      PHYSICS_ASSEMBLER_COMPONENT,
      physicsAssemblerComponent
    );
  });
}
export {
  initPhysicsAssemblerBlock
};
