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

world.beforeEvents.playerInteractWithBlock.subscribe((event) => {
     system.run(() => {
          const first = pendingCorners.get(player.id);
          if (!first || first.dimensionId !== dimensionId) {
               pendingCorners.set(player.id, {
                    dimensionId,
                    location: clicked,
               });
               player.onScreenDisplay.setActionBar(
                    `\xA7a\u8D77\u70B9 \xA7f${clicked.x}, ${clicked.y}, ${clicked.z} \xA77\u2014 \u518D\u7528\u6728\u68CD\u70B9\u51FB\u7EC8\u70B9`,
               );
               return;
          }
          pendingCorners.delete(player.id);
          try {
               const managed = sableSubLevels.createSubLevelFromRegion(
                    player.dimension,
                    first.location,
                    clicked,
               );
               player.sendMessage(
                    `\xA7a\u5DF2\u5B9E\u4F53\u5316\u5B50\u4E16\u754C \xA7f${managed.id}\xA7a\uFF1A${managed.blockCount} \u65B9\u5757 / ${managed.entityCount} \u5B9E\u4F53\u3002\xA77 \u76F4\u63A5\u653B\u51FB\u53EF\u6316\u6398\uFF0C\u624B\u6301\u65B9\u5757\u53EF\u653E\u7F6E\uFF0C\u7784\u51C6\u53EF\u67E5\u770B\u63CF\u8FB9\u3002`,
               );
          } catch (error) {
               player.sendMessage(
                    `\xA7c\u5B50\u4E16\u754C\u521B\u5EFA\u5931\u8D25\uFF1A${error instanceof Error ? error.message : String(error)}`,
               );
          }
     });
});
world.beforeEvents.playerLeave.subscribe((event) => {
     pendingCorners.delete(event.player.id);
});
