import {
  GameMode
} from "@minecraft/server";
function canBreakSubLevelBlock(gameMode, blockTypeId, itemIsSword, adventureCanDestroy) {
  if (gameMode === GameMode.Spectator) return false;
  if (gameMode === GameMode.Adventure) return blockListContains(adventureCanDestroy, blockTypeId);
  return gameMode !== GameMode.Creative || !itemIsSword;
}
function canPlaceSubLevelBlock(gameMode, supportBlockTypeId, adventureCanPlaceOn) {
  if (gameMode === GameMode.Spectator) return false;
  return gameMode !== GameMode.Adventure || blockListContains(adventureCanPlaceOn, supportBlockTypeId);
}
function damageSelectedToolForSubLevelBreak(player, usedItem, random = Math.random) {
  if (!usedItem || player.getGameMode() === GameMode.Creative) return "unchanged";
  const container = requirePlayerContainer(player, " for tool durability");
  const selectedSlot = player.selectedSlotIndex;
  const selectedItem = container.getItem(selectedSlot);
  if (!selectedItem || selectedItem.typeId !== usedItem.typeId) {
    throw new Error(`Player ${player.id}'s selected item changed before durability was applied.`);
  }
  const durability = selectedItem.getComponent("minecraft:durability");
  if (!durability || durability.unbreakable) return "unchanged";
  const unbreakingLevel = selectedItem.getComponent("minecraft:enchantable")?.getEnchantment("minecraft:unbreaking")?.level ?? 0;
  if (random() * 100 >= durability.getDamageChance(unbreakingLevel)) return "unchanged";
  if (durability.damage + 1 >= durability.maxDurability) {
    container.setItem(selectedSlot, void 0);
    player.playSound("random.break", { pitch: 0.9, volume: 1 });
    return "broken";
  }
  durability.damage += 1;
  container.setItem(selectedSlot, selectedItem);
  return "damaged";
}
function canPlayerBreakSubLevelBlock(player, itemStack, blockTypeId) {
  return canBreakSubLevelBlock(player.getGameMode(), blockTypeId, itemStack?.hasTag("minecraft:is_sword") === true, itemStack?.getCanDestroy() ?? []);
}
function canPlayerPlaceSubLevelBlock(player, itemStack, supportBlockTypeId) {
  return canPlaceSubLevelBlock(player.getGameMode(), supportBlockTypeId, itemStack.getCanPlaceOn());
}
function blockListContains(blocks, blockTypeId) {
  const normalizedTarget = withMinecraftNamespace(blockTypeId);
  return blocks.some((value) => withMinecraftNamespace(value) === normalizedTarget);
}
function withMinecraftNamespace(typeId) {
  return typeId.includes(":") ? typeId : `minecraft:${typeId}`;
}
function requirePlayerContainer(player, purpose = "") {
  const container = player.getComponent("minecraft:inventory")?.container;
  if (!container) throw new Error(`Player ${player.id} has no inventory container${purpose}.`);
  return container;
}
export {
  canBreakSubLevelBlock,
  canPlaceSubLevelBlock,
  canPlayerBreakSubLevelBlock,
  canPlayerPlaceSubLevelBlock,
  damageSelectedToolForSubLevelBreak
};
