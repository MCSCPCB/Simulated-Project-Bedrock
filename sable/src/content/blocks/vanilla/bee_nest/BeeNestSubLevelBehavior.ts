// Bee-nest-specific sub-level behavior: breaking a projected nest releases its
// bees, count derived from the honey level exactly as in the source project.
import type { SubLevelBlockBehaviorRegistry } from "../../../../api/block/SubLevelBlockBehaviors.js";

const BEE_NEST_TYPE_ID = "minecraft:bee_nest";
const BEE_ENTITY_TYPE_ID = "minecraft:bee";

export interface BeeNestSubLevelBehaviorContext {
  readonly behaviors: SubLevelBlockBehaviorRegistry;
}

export function registerBeeNestSubLevelBehavior(
  context: BeeNestSubLevelBehaviorContext
): void {
  context.behaviors.register(BEE_NEST_TYPE_ID, {
    onBlockRemoved: event => {
      const count = getBeeNestSpawnCount(event.block.states?.honey_level);
      const location = event.handle.localPointToWorld(event.block.localLocation);
      for (let index = 0; index < count; index++) {
        try {
          event.dimension.spawnEntity(BEE_ENTITY_TYPE_ID, location);
        } catch {
          // Bee spawning must not undo the nest break or its drops.
        }
      }
    }
  });
}

function getBeeNestSpawnCount(honeyLevel: unknown): number {
  const numeric = Number(honeyLevel);
  if (!Number.isFinite(numeric)) return 0;
  const level = Math.max(0, Math.min(5, Math.floor(numeric)));
  return Math.min(3, Math.ceil(level / 2));
}
