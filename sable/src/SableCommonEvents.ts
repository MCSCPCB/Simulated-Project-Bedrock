// Sable common bootstrap: assembles the interaction system, the player and
// container controllers, the block-behavior registry, and the default edit
// pipeline, exactly as the source project's main assembly did (physics stages
// removed). Evaluating this module starts everything — the startup-phase
// custom-component registration for the interaction proxy block only works
// when wiring happens at script load, so initialization is a module side
// effect rather than an API the embedder must remember to call. The bootstrap
// is block-agnostic; every per-block wiring lives under content/blocks and is
// pulled in through the vanilla registration index.
import { system, world } from "@minecraft/server";
import { SubLevelBlockBehaviorRegistry } from "./api/block/SubLevelBlockBehaviors.js";
import { ServerSubLevelContainer } from "./api/sublevel/ServerSubLevelContainer.js";
import { SubLevelContainerInteractionController } from "./content/assembly/SubLevelContainerInteraction.js";
import { registerVanillaSubLevelBlockBehaviors } from "./content/blocks/vanilla/VanillaSubLevelBlockBehaviors.js";
import { SubLevelPlayerInteractionController } from "./content/punching/SubLevelPlayerInteraction.js";
import { SubLevelInteractionSystem } from "./sublevel/system/SubLevelInteractionSystem.js";
import { VANILLA_DIMENSION_IDS } from "./util/SableVector3Utils.js";

// Render entities from an earlier session have no owner after a script reload;
// persisted sub-levels rebuild their projections below, so surviving render
// entities are always replaced by the restored runtime records.
const STALE_RENDER_ENTITY_FAMILIES = ["fancy_model", "block"] as const;

export const sableInteractionSystem = new SubLevelInteractionSystem();
export const sableBlockBehaviors = new SubLevelBlockBehaviorRegistry();
export const sableContainerInteraction = new SubLevelContainerInteractionController();
export const sablePlayerInteraction = new SubLevelPlayerInteractionController(sableInteractionSystem);
export const sableSubLevels = new ServerSubLevelContainer(
  sableInteractionSystem,
  sableBlockBehaviors,
  sableContainerInteraction
);

sablePlayerInteraction.setBlockBreakHandler((player, itemStack, handle, block) => (
  sableSubLevels.breakBlockForPlayerEdit(player, itemStack, handle, block)
));
sablePlayerInteraction.setBlockMiningEffectHandler((handle, block) => {
  sableSubLevels.emitBlockMiningEffects(handle, block);
});
sablePlayerInteraction.setBlockPlaceHandler((player, itemStack, handle, block, placement, direction) => (
  sableSubLevels.placeBlockForPlayerEdit(player, itemStack, handle, block, placement, direction)
));
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

world.afterEvents.entityLoad.subscribe(event => {
  sablePlayerInteraction.handleVisualEntityLoad(event.entity);
  sableContainerInteraction.handleEntityLoad(event.entity);
});

system.runInterval(() => {
  // The container controller ticks through the interaction handler hook.
  sablePlayerInteraction.tick(system.currentTick);
  sableSubLevels.tick(system.currentTick);
}, 1);

// Dimension queries are unavailable during early execution; reload cleanup and
// storage reconciliation run on the first normal ticks, ordered after the
// container controller's own load scan.
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
