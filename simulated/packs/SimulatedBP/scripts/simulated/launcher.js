import { world, system } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";

const PHYSICS_ASSEMBLER = "simulated:physics_assembler";
const PHYSICS_ASSEMBLER_TITLE = "simulated:physics_assembler.title";
const openForms = new Set();

function showPhysicsAssemblerForm(player) {
    if (!player?.isValid || openForms.has(player.id)) return;

    openForms.add(player.id);
    const form = new ModalFormData()
        .title(PHYSICS_ASSEMBLER_TITLE)
        .slider({ translate: "%physics_assembler.lever.text" }, 0, 255, {
            valueStep: 1,
            defaultValue: 0
        })
        .submitButton({ translate: "%physics_assembler.confirm.text" });

    form.show(player)
        .then(response => {
            if (response.canceled) return;
            const value = response.formValues?.[0];
            console.error(`[simulated] physics assembler lever submitted: ${value}`);
        })
        .catch(error => {
            console.error("[simulated] physics assembler form failed", error);
        })
        .finally(() => openForms.delete(player.id));
}

world.afterEvents.playerInteractWithBlock.subscribe(event => {
    if (event.block?.typeId !== PHYSICS_ASSEMBLER) return;
    system.run(() => showPhysicsAssemblerForm(event.player));
});
