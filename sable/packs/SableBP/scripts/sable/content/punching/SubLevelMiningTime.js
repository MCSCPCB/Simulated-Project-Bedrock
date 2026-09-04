const HARVEST_DIVISOR = 30;
const AXE_SPEEDS = {
  "minecraft:copper_axe": 5,
  "minecraft:diamond_axe": 8,
  "minecraft:golden_axe": 12,
  "minecraft:iron_axe": 6,
  "minecraft:netherite_axe": 9,
  "minecraft:stone_axe": 4,
  "minecraft:wooden_axe": 2
};
const IRON_GOLEM_MINING_HEALTH = 100;
const IRON_BLOCK_HARDNESS = 5;
const PUMPKIN_HARDNESS = 1;
const REFERENCE_TOOL_PROFILE = { efficiencyLevel: 0 };
const IRON_GOLEM_REFERENCE_BREAK_TICKS = 4 * getVanillaBlockBreakTicks(IRON_BLOCK_HARDNESS, REFERENCE_TOOL_PROFILE) + getVanillaBlockBreakTicks(PUMPKIN_HARDNESS, REFERENCE_TOOL_PROFILE);
const PC_ATTACK_EQUIVALENT_TICKS = IRON_GOLEM_REFERENCE_BREAK_TICKS / IRON_GOLEM_MINING_HEALTH;
function getSubLevelToolProfile(itemStack) {
  let efficiencyLevel = 0;
  try {
    efficiencyLevel = itemStack?.getComponent("minecraft:enchantable")?.getEnchantment("minecraft:efficiency")?.level ?? 0;
  } catch {
  }
  return {
    efficiencyLevel: normalizeEfficiencyLevel(efficiencyLevel),
    typeId: itemStack?.typeId
  };
}
function getSubLevelMiningRequiredHits(hardness, itemStack) {
  const targetTicks = getSubLevelMiningTargetTicks(hardness, itemStack);
  return Math.max(
    1,
    Math.ceil(targetTicks / PC_ATTACK_EQUIVALENT_TICKS)
  );
}
function getSubLevelMiningTargetTicks(hardness, itemStack) {
  return getVanillaBlockBreakTicks(hardness, getSubLevelToolProfile(itemStack));
}
function getVanillaBlockBreakTicks(hardness, profile) {
  const axeSpeed = profile.typeId ? AXE_SPEEDS[profile.typeId] : void 0;
  let speed = axeSpeed ?? 1;
  if (axeSpeed !== void 0 && profile.efficiencyLevel > 0) {
    speed += profile.efficiencyLevel * profile.efficiencyLevel + 1;
  }
  return Math.ceil(Math.max(0, hardness) * HARVEST_DIVISOR / speed);
}
function normalizeEfficiencyLevel(value) {
  return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}
export {
  IRON_GOLEM_REFERENCE_BREAK_TICKS,
  PC_ATTACK_EQUIVALENT_TICKS,
  getSubLevelMiningRequiredHits,
  getSubLevelMiningTargetTicks,
  getSubLevelToolProfile,
  getVanillaBlockBreakTicks
};
