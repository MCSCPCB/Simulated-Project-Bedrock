import type { Block, Player } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import {
    animateLever,
    getLeverFrame,
    getPhysicsAssemblerHoldTip,
} from "./PhysicsAssemblerBlockEntity.js";

const PHYSICS_ASSEMBLER = "simulated:physics_assembler";
const PHYSICS_ASSEMBLER_TITLE_PREFIX = "simulated:physics_assembler.";
const FRAME_MIN = 0;
const FRAME_MAX = 255;

const openForms = new Set<string>();

/** Opens the physics assembler control form for one player. */
export function showPhysicsAssemblerForm(player: Player, block: Block): void {
    if (!player?.isValid || !block || block.typeId !== PHYSICS_ASSEMBLER || openForms.has(player.id)) return;

    openForms.add(player.id);
    const holdTipMode = getPhysicsAssemblerHoldTip(block).key;
    const form = new ModalFormData()
        .title(`${PHYSICS_ASSEMBLER_TITLE_PREFIX}physics_assembler.title.${holdTipMode}`)
        .slider({ translate: "%physics_assembler.lever.text" }, FRAME_MIN, FRAME_MAX, {
            valueStep: 1,
            // The native vertical slider renders its minimum at the top; the
            // original assembler renders frame 0 at the bottom.
            defaultValue: FRAME_MAX - getLeverFrame(block),
        })
        .submitButton({ translate: "%physics_assembler.confirm.text" });

    form.show(player)
        .then((response) => {
            if (response.canceled || !response.formValues) return;

            const displayedValue = Number(response.formValues[0]);
            if (!Number.isFinite(displayedValue)) return;
            const submitted = FRAME_MAX - displayedValue;

            const currentBlock = block.dimension.getBlock(block.location);
            if (!currentBlock || currentBlock.typeId !== PHYSICS_ASSEMBLER) return;

            animateLever(player, currentBlock, submitted);
        })
        .catch((error) => {
            console.error("[simulated] physics assembler form failed", error);
        })
        .finally(() => openForms.delete(player.id));
}
