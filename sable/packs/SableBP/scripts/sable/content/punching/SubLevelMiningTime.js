const HARVEST_DIVISOR = 30;
const TOOL_MATERIALS = {
  copper: { speed: 5, level: 1 },
  diamond: { speed: 8, level: 3 },
  golden: { speed: 12, level: 0 },
  iron: { speed: 6, level: 2 },
  netherite: { speed: 9, level: 4 },
  stone: { speed: 4, level: 1 },
  wooden: { speed: 2, level: 0 }
};
const DEFAULT_MINING_PROPERTIES = { tool: "axe" };
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
function getSubLevelMiningRequiredHits(hardness, itemStack, mining) {
  const targetTicks = getSubLevelMiningTargetTicks(hardness, itemStack, mining);
  return Math.max(
    1,
    Math.ceil(targetTicks / PC_ATTACK_EQUIVALENT_TICKS)
  );
}
function getSubLevelMiningTargetTicks(hardness, itemStack, mining) {
  return getVanillaBlockBreakTicks(hardness, getSubLevelToolProfile(itemStack), mining);
}
function getVanillaBlockBreakTicks(hardness, profile, mining = DEFAULT_MINING_PROPERTIES) {
  if (hardness === -1) return Number.POSITIVE_INFINITY;
  const tool = /^minecraft:(wooden|stone|copper|iron|golden|diamond|netherite)_(axe|pickaxe|shovel|hoe)$/.exec(profile.typeId ?? "");
  const material = tool && tool[2] === mining.tool ? TOOL_MATERIALS[tool[1]] : void 0;
  let speed = material?.speed ?? 1;
  if (material && profile.efficiencyLevel > 0) {
    speed += profile.efficiencyLevel * profile.efficiencyLevel + 1;
  }
  const canHarvest = mining.harvestLevel === void 0 || material !== void 0 && material.level >= mining.harvestLevel;
  return Math.ceil(Math.max(0, hardness) * (canHarvest ? HARVEST_DIVISOR : 100) / speed);
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
