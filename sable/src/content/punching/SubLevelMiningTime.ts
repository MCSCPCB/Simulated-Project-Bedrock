import type { ItemStack } from "@minecraft/server";

// Vanilla break-time model for a correct tool: ticks = hardness * 30 / speed,
// with an efficiency enchantment adding level^2 + 1 speed.
const HARVEST_DIVISOR = 30;

const AXE_SPEEDS: Readonly<Record<string, number>> = {
  "minecraft:copper_axe": 5,
  "minecraft:diamond_axe": 8,
  "minecraft:golden_axe": 12,
  "minecraft:iron_axe": 6,
  "minecraft:netherite_axe": 9,
  "minecraft:stone_axe": 4,
  "minecraft:wooden_axe": 2
};

// The attack-mining scale is anchored to the iron golem: bare-handed, breaking
// its construction recipe (four iron blocks plus one carved pumpkin) takes
// IRON_GOLEM_REFERENCE_BREAK_TICKS, and the golem has 100 max health, so each
// attack contributes the recipe's break time per health point.
const IRON_GOLEM_MINING_HEALTH = 100;
const IRON_BLOCK_HARDNESS = 5;
const PUMPKIN_HARDNESS = 1;
const REFERENCE_TOOL_PROFILE: SubLevelToolProfile = { efficiencyLevel: 0 };
export const IRON_GOLEM_REFERENCE_BREAK_TICKS =
  4 * getVanillaBlockBreakTicks(IRON_BLOCK_HARDNESS, REFERENCE_TOOL_PROFILE)
  + getVanillaBlockBreakTicks(PUMPKIN_HARDNESS, REFERENCE_TOOL_PROFILE);
export const PC_ATTACK_EQUIVALENT_TICKS =
  IRON_GOLEM_REFERENCE_BREAK_TICKS / IRON_GOLEM_MINING_HEALTH;

export interface SubLevelToolProfile {
  /** Always a normalized non-negative integer (see normalizeEfficiencyLevel). */
  efficiencyLevel: number;
  typeId?: string;
}

export function getSubLevelToolProfile(
  itemStack: ItemStack | undefined
): SubLevelToolProfile {
  let efficiencyLevel = 0;
  try {
    efficiencyLevel = itemStack
      ?.getComponent("minecraft:enchantable")
      ?.getEnchantment("minecraft:efficiency")
      ?.level ?? 0;
  } catch {
    // Unknown or custom enchantment components fall back to the vanilla base speed.
  }
  return {
    efficiencyLevel: normalizeEfficiencyLevel(efficiencyLevel),
    typeId: itemStack?.typeId
  };
}

/**
 * Converts vanilla block-breaking time into the iron-golem scale. The four
 * iron blocks and pumpkin are a fixed baseline; only the target block uses the
 * player's selected tool, otherwise tool speed would cancel out of the ratio.
 * The hardness comes from the block's registry data.
 */
export function getSubLevelMiningRequiredHits(
  hardness: number,
  itemStack?: ItemStack
): number {
  const targetTicks = getSubLevelMiningTargetTicks(hardness, itemStack);
  return Math.max(
    1,
    Math.ceil(targetTicks / PC_ATTACK_EQUIVALENT_TICKS)
  );
}

export function getSubLevelMiningTargetTicks(
  hardness: number,
  itemStack?: ItemStack
): number {
  return getVanillaBlockBreakTicks(hardness, getSubLevelToolProfile(itemStack));
}

export function getVanillaBlockBreakTicks(
  hardness: number,
  profile: SubLevelToolProfile
): number {
  const axeSpeed = profile.typeId ? AXE_SPEEDS[profile.typeId] : undefined;
  let speed = axeSpeed ?? 1;
  if (axeSpeed !== undefined && profile.efficiencyLevel > 0) {
    // Vanilla efficiency bonus: level^2 + 1 added to the tool speed.
    speed += profile.efficiencyLevel * profile.efficiencyLevel + 1;
  }
  return Math.ceil(Math.max(0, hardness) * HARVEST_DIVISOR / speed);
}

function normalizeEfficiencyLevel(value: number): number {
  return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}
