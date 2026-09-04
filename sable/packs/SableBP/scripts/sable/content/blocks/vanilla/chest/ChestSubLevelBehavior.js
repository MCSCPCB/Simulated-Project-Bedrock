import { world } from "@minecraft/server";
const CHEST_ENTITY_TYPE_ID = "sable:chest";
const CHEST_BLOCK_TYPE_ID = "minecraft:chest";
const CHEST_CONTAINER_SIZE = 27;
const CHEST_COLLISION_HEIGHT = 0.875;
function registerChestSubLevelBehavior(context) {
  const containers = context.containers;
  containers.registerContainerProfile({
    blockTypeId: CHEST_BLOCK_TYPE_ID,
    modelType: "chest",
    storageEntityTypeId: CHEST_ENTITY_TYPE_ID,
    nameTranslationKey: "tile.chest.name",
    containerSize: CHEST_CONTAINER_SIZE,
    collisionHeight: CHEST_COLLISION_HEIGHT,
    activateEvent: "sable:chest_activate",
    deactivateEvent: "sable:chest_deactivate",
    openStateDimension: "open",
    openSound: { id: "random.chestopen", pitch: 1, volume: 0.5 },
    closeSound: { id: "random.chestclosed", pitch: 1, volume: 0.5, delayTicks: 1 },
    onNativeDeath: (ownerId, binding) => {
      context.onNativeDeath?.(ownerId, binding);
    },
    onUnexpectedRemoval: (ownerId, binding) => {
      context.onUnexpectedRemoval?.(ownerId, binding);
    }
  });
  context.behaviors.register(CHEST_BLOCK_TYPE_ID, {
    captureWorldData: (capture) => {
      const container = capture.dimension.getBlock(capture.worldLocation)?.getComponent("minecraft:inventory")?.container;
      if (!container) return void 0;
      const items = [];
      for (let slot = 0; slot < Math.min(container.size, CHEST_CONTAINER_SIZE); slot++) {
        items.push(container.getItem(slot));
      }
      return items;
    },
    onBlockAdded: (event) => {
      const binding = containers.createStorage(event.ownerId, event.handle, event.block.localLocation);
      fillChestStorage(binding, event.worldData);
    },
    onBlockRemoved: (event) => {
      const binding = containers.getBinding(event.handle, event.block.localLocation);
      if (!binding) return;
      containers.settleStorages(
        event.ownerId,
        [binding],
        event.dimension,
        (localLocation) => event.handle.localPointToWorld(localLocation)
      );
    },
    onSubLevelRemoved: (ownerId, handle, reason) => {
      if (reason !== "natural") return;
      for (const binding of containers.getBindings(ownerId)) {
        containers.settleStorages(
          ownerId,
          [binding],
          handle.dimension,
          (localLocation) => handle.localPointToWorld(localLocation)
        );
      }
    }
  });
}
function fillChestStorage(binding, worldData) {
  if (!Array.isArray(worldData) || worldData.length === 0) return;
  const items = worldData;
  const container = world.getEntity(binding.storageId)?.getComponent("minecraft:inventory")?.container;
  if (!container) return;
  for (let slot = 0; slot < Math.min(items.length, container.size); slot++) {
    const item = items[slot];
    if (item) container.setItem(slot, item);
  }
}
export {
  CHEST_ENTITY_TYPE_ID,
  registerChestSubLevelBehavior
};
