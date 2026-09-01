import { system } from "@minecraft/server";
import type {
    BlockComponentPlayerInteractEvent,
    BlockCustomComponent,
} from "@minecraft/server";
import { showPhysicsAssemblerForm } from "./PhysicsAssemblerGUIHandler.js";

const PHYSICS_ASSEMBLER_COMPONENT = "simulated:physics_assembler";
let componentRegistrationQueued = false;

const physicsAssemblerComponent: BlockCustomComponent = {
    onPlayerInteract(event: BlockComponentPlayerInteractEvent): void {
        system.run(() => showPhysicsAssemblerForm(event.player, event.block));
    },
};

/** Registers the block-side interaction hook during script startup. */
export function initPhysicsAssemblerBlock(): void {
    if (componentRegistrationQueued) return;
    componentRegistrationQueued = true;

    system.beforeEvents.startup.subscribe(({ blockComponentRegistry }) => {
        blockComponentRegistry.registerCustomComponent(
            PHYSICS_ASSEMBLER_COMPONENT,
            physicsAssemblerComponent,
        );
    });
}
