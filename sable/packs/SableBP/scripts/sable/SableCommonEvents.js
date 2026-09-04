import { system, world } from "@minecraft/server";
import { SubLevelBlockBehaviorRegistry } from "./api/block/SubLevelBlockBehaviors.js";
import { ServerSubLevelContainer } from "./api/sublevel/ServerSubLevelContainer.js";
import { SubLevelContainerInteractionController } from "./content/assembly/SubLevelContainerInteraction.js";
import { registerVanillaSubLevelBlockBehaviors } from "./content/blocks/vanilla/VanillaSubLevelBlockBehaviors.js";
import { SubLevelPlayerInteractionController } from "./content/punching/SubLevelPlayerInteraction.js";
import { SubLevelInteractionSystem } from "./sublevel/system/SubLevelInteractionSystem.js";
import { VANILLA_DIMENSION_IDS } from "./util/SableVector3Utils.js";
const STALE_RENDER_ENTITY_FAMILIES = ["fancy_model", "block"];
const sableInteractionSystem = new SubLevelInteractionSystem();
const sableBlockBehaviors = new SubLevelBlockBehaviorRegistry();
const sableContainerInteraction = new SubLevelContainerInteractionController();
const sablePlayerInteraction = new SubLevelPlayerInteractionController(sableInteractionSystem);
const sableSubLevels = new ServerSubLevelContainer(
  sableInteractionSystem,
  sableBlockBehaviors,
  sableContainerInteraction
);
sablePlayerInteraction.setBlockBreakHandler((player, itemStack, handle, block) => sableSubLevels.breakBlockForPlayerEdit(player, itemStack, handle, block));
sablePlayerInteraction.setBlockMiningEffectHandler((handle, block) => {
  sableSubLevels.emitBlockMiningEffects(handle, block);
});
sablePlayerInteraction.setBlockPlaceHandler((player, itemStack, handle, block, placement, direction) => sableSubLevels.placeBlockForPlayerEdit(player, itemStack, handle, block, placement, direction));
sablePlayerInteraction.setBlockPlacementEffectHandler((handle, block) => {
  sableSubLevels.emitBlockPlacementEffects(handle, block);
});
sablePlayerInteraction.setBlockInteractHandler(sableContainerInteraction);
registerVanillaSubLevelBlockBehaviors({
  behaviors: sableBlockBehaviors,
  containers: sableContainerInteraction,
  onNativeDeath: (ownerId, binding) => {
    sableSubLevels.handleContainerNativeDeath(ownerId, binding);
  },
  onUnexpectedRemoval: (ownerId, binding) => {
    sableSubLevels.handleContainerUnexpectedRemoval(ownerId, binding);
  }
});
sableContainerInteraction.start();
sablePlayerInteraction.start();
world.afterEvents.entityLoad.subscribe((event) => {
  sablePlayerInteraction.handleVisualEntityLoad(event.entity);
  sableContainerInteraction.handleEntityLoad(event.entity);
});
system.runInterval(() => {
  sablePlayerInteraction.tick(system.currentTick);
  sableSubLevels.tick(system.currentTick);
}, 1);
system.run(() => {
  for (const dimensionId of VANILLA_DIMENSION_IDS) {
    const dimension = world.getDimension(dimensionId);
    for (const family of STALE_RENDER_ENTITY_FAMILIES) {
      for (const entity of dimension.getEntities({ families: [family] })) {
        if (entity.isValid && entity.typeId.startsWith("sable:")) entity.remove();
      }
    }
  }
  sableSubLevels.initialize();
  sableContainerInteraction.completeSavedBindingRegistration();
});
export {
  sableBlockBehaviors,
  sableContainerInteraction,
  sableInteractionSystem,
  sablePlayerInteraction,
  sableSubLevels
};
