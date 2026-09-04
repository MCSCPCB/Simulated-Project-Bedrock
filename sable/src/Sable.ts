// Evaluating the bootstrap module assembles and starts the default pipeline
// (interaction system, controllers, edit handlers) as a load-time side effect.
export {
  sableBlockBehaviors,
  sableContainerInteraction,
  sableInteractionSystem,
  sablePlayerInteraction,
  sableSubLevels
} from "./SableCommonEvents.js";
export { ServerSubLevelContainer } from "./api/sublevel/ServerSubLevelContainer.js";
export type {
  CreateSubLevelFromRegionOptions,
  ManagedSubLevel
} from "./api/sublevel/ServerSubLevelContainer.js";
export { SubLevelBlockBehaviorRegistry } from "./api/block/SubLevelBlockBehaviors.js";
export type {
  SubLevelBlockBehavior,
  SubLevelBlockLifecycleEvent,
  SubLevelBlockWorldCapture
} from "./api/block/SubLevelBlockBehaviors.js";
export { SubLevelRenderer } from "./sublevel/render/SubLevelRenderer.js";
export { captureSubLevelBlock, captureSubLevelBlocks } from "./api/SubLevelAssemblyHelper.js";
export { captureSubLevelFoliageTint } from "./render/dynamic_biome/DynamicBiomeTintSampler.js";
export {
  BLOCK_CARRIER_CAPACITY,
  BLOCK_CARRIER_ENTITY_TYPE_ID,
  BLOCK_SLOTS_PER_ENTITY
} from "./sublevel/render/SubLevelRenderData.js";
export type {
  SubLevel,
  SubLevelBlock,
  SubLevelBlockCollisionBox,
  SubLevelBlockMapColor,
  SubLevelBlockStates,
  SubLevelFoliageTint,
  SubLevelRenderBody
} from "./sublevel/SubLevel.js";
export type { SubLevelRenderData } from "./sublevel/render/SubLevelRenderData.js";
export {
  SubLevelInteractionSystem,
  SubLevelInteractionHandle,
  isSubLevelBlockCollidable,
  isSubLevelBlockRaySolid
} from "./sublevel/system/SubLevelInteractionSystem.js";
export type {
  SubLevelInteractionRaycastHit,
  SubLevelInteractionRaycastOptions,
  SubLevelInteractionRegistrationOptions
} from "./sublevel/system/SubLevelInteractionSystem.js";
export {
  SubLevelPlayerInteractionController
} from "./content/punching/SubLevelPlayerInteraction.js";
export type {
  SubLevelBlockInteractionHandler,
  SubLevelEditAction
} from "./content/punching/SubLevelPlayerInteraction.js";
export {
  BLOCK_CRACK_ENTITY_TYPE_ID,
  BLOCK_OUTLINE_ENTITY_TYPE_ID,
  INTERACTION_REACH
} from "./content/block_outline_render/SubLevelOutlineController.js";
export type {
  SubLevelBlockBreakHandler,
  SubLevelBlockMiningEffectHandler,
  SubLevelBlockPlaceHandler,
  SubLevelBlockPlacementEffectHandler,
  SubLevelOutlineActionTarget,
  SubLevelRaycastResult
} from "./content/block_outline_render/SubLevelOutlineController.js";
export {
  SubLevelContainerInteractionController
} from "./content/assembly/SubLevelContainerInteraction.js";
export type {
  SubLevelContainerProfile,
  SubLevelContainerStorageBinding
} from "./content/assembly/SubLevelContainerInteraction.js";
export { CHEST_ENTITY_TYPE_ID } from "./content/blocks/vanilla/chest/ChestSubLevelBehavior.js";
export {
  INTERACTION_TARGET_BLOCK_TYPE_ID
} from "./content/block_placement/SubLevelInteractionTargetBlock.js";
export {
  resolveSubLevelBlockSupport
} from "./content/block_properties/SubLevelBlockSupport.js";
export {
  resolveVanillaBlockBreakSound,
  resolveVanillaBlockHitSound,
  resolveVanillaBlockPlaceSound,
  selectDominantVanillaBlockBreakSound
} from "./content/sublevel_sounds/SubLevelBlockSounds.js";
export {
  getSubLevelMiningRequiredHits,
  getSubLevelMiningTargetTicks
} from "./content/punching/SubLevelMiningTime.js";
export { mergeStackableItemDrops } from "./content/punching/SubLevelItemDrops.js";
export type { PendingItemDrop } from "./content/punching/SubLevelItemDrops.js";
export {
  BLOCK_BREAK_PARTICLE_PROFILE,
  BLOCK_HIT_PARTICLE_PROFILE,
  spawnSubLevelBlockDestructParticle
} from "./content/particle/SubLevelBlockParticles.js";
export type { BlockParticleProfile } from "./content/particle/SubLevelBlockParticles.js";
export { SubLevelStorage } from "./sublevel/storage/serialization/SubLevelStorage.js";
export type {
  SerializedSubLevelStructure
} from "./sublevel/storage/serialization/SubLevelData.js";
export { ActivePlayerRegistry } from "./api/player/ActivePlayerRegistry.js";
