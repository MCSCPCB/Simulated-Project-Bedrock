// Demo entry: importing Sable.js bootstraps the whole framework (rendering,
// mining, placement, outlines, chest interaction) as a load-time side effect.
// This file only decides WHICH region becomes a sub-level: stick-click a block
// for the first corner, stick-click again for the second, and the region is
// captured into an entity projection.
import { system, world } from "@minecraft/server";
import { sableSubLevels } from "./sable/Sable.js";

const SELECTION_ITEM_TYPE_ID = "minecraft:stick";

/** playerId -> { dimensionId, location } of the pending first corner. */
const pendingCorners = new Map();

world.beforeEvents.playerInteractWithBlock.subscribe(event => {
  const { block, itemStack, player } = event;
  if (itemStack?.typeId !== SELECTION_ITEM_TYPE_ID) return;
  if (!event.isFirstEvent) return;
  event.cancel = true;
  const clicked = { x: block.location.x, y: block.location.y, z: block.location.z };
  const dimensionId = player.dimension.id;
  system.run(() => {
    const first = pendingCorners.get(player.id);
    if (!first || first.dimensionId !== dimensionId) {
      pendingCorners.set(player.id, { dimensionId, location: clicked });
      player.onScreenDisplay.setActionBar(
        `§a起点 §f${clicked.x}, ${clicked.y}, ${clicked.z} §7— 再用木棍点击终点`
      );
      return;
    }
    pendingCorners.delete(player.id);
    try {
      const managed = sableSubLevels.createSubLevelFromRegion(
        player.dimension,
        first.location,
        clicked
      );
      player.sendMessage(
        `§a已实体化子世界 §f${managed.id}§a：${managed.blockCount} 方块 / ${managed.entityCount} 实体。`
        + "§7 直接攻击可挖掘，手持方块可放置，瞄准可查看描边。"
      );
    } catch (error) {
      player.sendMessage(`§c子世界创建失败：${error instanceof Error ? error.message : String(error)}`);
    }
  });
});

world.beforeEvents.playerLeave.subscribe(event => {
  pendingCorners.delete(event.player.id);
});
