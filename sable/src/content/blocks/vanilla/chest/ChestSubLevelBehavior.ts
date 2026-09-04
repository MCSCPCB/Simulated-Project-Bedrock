// Chest-specific sub-level wiring: one container profile (storage entity kind,
// lid state, open/close sounds) plus the storage lifecycle hooks on the generic
// block-behavior registry. The chest ids exist only here.
import { world, type ItemStack } from "@minecraft/server";
import type {
  SubLevelBlockBehaviorRegistry
} from "../../../../api/block/SubLevelBlockBehaviors.js";
import type {
  SubLevelContainerInteractionController,
  SubLevelContainerStorageBinding
} from "../../../assembly/SubLevelContainerInteraction.js";
import { blockLocationKey } from "../../../../util/SableVector3Utils.js";

export const CHEST_ENTITY_TYPE_ID = "sable:chest";

const CHEST_BLOCK_TYPE_ID = "minecraft:chest";
const CHEST_CONTAINER_SIZE = 27;
// Height of the vanilla chest body (14/16 blocks); the storage entity origin
// sits half of this below the cell center so the upward-growing interaction
// box tracks the projected chest.
const CHEST_COLLISION_HEIGHT = 0.875;

export interface ChestSubLevelBehaviorContext {
  readonly behaviors: SubLevelBlockBehaviorRegistry;
  readonly containers: SubLevelContainerInteractionController;
}

/** Registers the chest container profile and its storage lifecycle hooks. */
export function registerChestSubLevelBehavior(context: ChestSubLevelBehaviorContext): void {
  const containers = context.containers;
  /** ownerId -> local block key -> storage binding. */
  const bindingsByOwner = new Map<string, Map<string, SubLevelContainerStorageBinding>>();

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
      bindingsByOwner.get(ownerId)?.delete(blockLocationKey(binding.localLocation));
    }
  });

  context.behaviors.register(CHEST_BLOCK_TYPE_ID, {
    captureWorldData: capture => {
      const container = capture.dimension
        .getBlock(capture.worldLocation)
        ?.getComponent("minecraft:inventory")?.container;
      if (!container) return undefined;
      const items: (ItemStack | undefined)[] = [];
      for (let slot = 0; slot < Math.min(container.size, CHEST_CONTAINER_SIZE); slot++) {
        items.push(container.getItem(slot));
      }
      return items;
    },
    onBlockAdded: event => {
      const binding = containers.createStorage(event.ownerId, event.handle, event.block.localLocation);
      let bindings = bindingsByOwner.get(event.ownerId);
      if (!bindings) {
        bindings = new Map();
        bindingsByOwner.set(event.ownerId, bindings);
      }
      bindings.set(blockLocationKey(event.block.localLocation), binding);
      fillChestStorage(binding, event.worldData);
    },
    onBlockRemoved: event => {
      const bindings = bindingsByOwner.get(event.ownerId);
      const key = blockLocationKey(event.block.localLocation);
      const binding = bindings?.get(key);
      if (!bindings || !binding) return;
      bindings.delete(key);
      containers.settleStorages(
        event.ownerId,
        [binding],
        event.dimension,
        localLocation => event.handle.localPointToWorld(localLocation)
      );
    },
    onSubLevelRemoved: ownerId => {
      const bindings = bindingsByOwner.get(ownerId);
      if (!bindings) return;
      bindingsByOwner.delete(ownerId);
      for (const binding of bindings.values()) {
        try {
          containers.discardStorage(binding.storageId);
        } catch {
          // A stale binding must not block the remaining teardown.
        }
      }
    }
  });
}

function fillChestStorage(binding: SubLevelContainerStorageBinding, worldData: unknown): void {
  if (!Array.isArray(worldData) || worldData.length === 0) return;
  const items = worldData as readonly (ItemStack | undefined)[];
  const container = world.getEntity(binding.storageId)
    ?.getComponent("minecraft:inventory")?.container;
  if (!container) return;
  for (let slot = 0; slot < Math.min(items.length, container.size); slot++) {
    const item = items[slot];
    if (item) container.setItem(slot, item);
  }
}
