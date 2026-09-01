import { ModalFormData } from "@minecraft/server-ui";
import { animateLever, getLeverFrame } from "./PhysicsAssemblerBlockEntity.js";
const PHYSICS_ASSEMBLER = "simulated:physics_assembler";
const PHYSICS_ASSEMBLER_TITLE = "simulated:physics_assembler.title";
const FRAME_MIN = 0;
const FRAME_MAX = 255;
const openForms = /* @__PURE__ */ new Set();
function showPhysicsAssemblerForm(player, block) {
  if (!player?.isValid || !block || block.typeId !== PHYSICS_ASSEMBLER || openForms.has(player.id)) return;
  openForms.add(player.id);
  const form = new ModalFormData().title(PHYSICS_ASSEMBLER_TITLE).slider({ translate: "%physics_assembler.lever.text" }, FRAME_MIN, FRAME_MAX, {
    valueStep: 1,
    defaultValue: getLeverFrame(block)
  }).submitButton({ translate: "%physics_assembler.confirm.text" });
  form.show(player).then((response) => {
    if (response.canceled || !response.formValues) return;
    const submitted = Number(response.formValues[0]);
    if (!Number.isFinite(submitted)) return;
    const currentBlock = block.dimension.getBlock(block.location);
    if (!currentBlock || currentBlock.typeId !== PHYSICS_ASSEMBLER) return;
    animateLever(player, currentBlock, submitted);
  }).catch((error) => {
    console.error("[simulated] physics assembler form failed", error);
  }).finally(() => openForms.delete(player.id));
}
export {
  showPhysicsAssemblerForm
};
