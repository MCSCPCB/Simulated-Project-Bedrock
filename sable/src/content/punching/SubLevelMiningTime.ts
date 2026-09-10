import type { ItemStack } from "@minecraft/server";
import type { SubLevelMiningProperties } from "../../sublevel/render/fancy/model/FancySubLevelModel.js";

// Vanilla break-time model for a correct tool: ticks = hardness * 30 / speed,
// with an efficiency enchantment adding level^2 + 1 speed.
const HARVEST_DIVISOR = 30;

const TOOL_MATERIALS: Readonly<Record<string, { readonly speed: number; readonly level: number }>> = {
  copper: { speed: 5, level: 1 },
  diamond: { speed: 8, level: 3 },
  golden: { speed: 12, level: 0 },
  iron: { speed: 6, level: 2 },
  netherite: { speed: 9, level: 4 },
  stone: { speed: 4, level: 1 },
  wooden: { speed: 2, level: 0 }
};

const DEFAULT_MINING_PROPERTIES: SubLevelMiningProperties = { tool: "axe" };

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
  itemStack?: ItemStack,
  mining?: SubLevelMiningProperties
): number {
  const targetTicks = getSubLevelMiningTargetTicks(hardness, itemStack, mining);
  return Math.max(
    1,
    Math.ceil(targetTicks / PC_ATTACK_EQUIVALENT_TICKS)
  );
}

export function getSubLevelMiningTargetTicks(
  hardness: number,
  itemStack?: ItemStack,
  mining?: SubLevelMiningProperties
): number {
  return getVanillaBlockBreakTicks(hardness, getSubLevelToolProfile(itemStack), mining);
}

export function getVanillaBlockBreakTicks(
  hardness: number,
  profile: SubLevelToolProfile,
  mining: SubLevelMiningProperties = DEFAULT_MINING_PROPERTIES
): number {
  if (hardness === -1) return Number.POSITIVE_INFINITY;
  const tool = /^minecraft:(wooden|stone|copper|iron|golden|diamond|netherite)_(axe|pickaxe|shovel|hoe)$/.exec(profile.typeId ?? "");
  const material = tool && tool[2] === mining.tool ? TOOL_MATERIALS[tool[1]!] : undefined;
  let speed = material?.speed ?? 1;
  if (material && profile.efficiencyLevel > 0) {
    // Vanilla efficiency bonus: level^2 + 1 added to the tool speed.
    speed += profile.efficiencyLevel * profile.efficiencyLevel + 1;
  }
  const canHarvest = mining.harvestLevel === undefined || (material !== undefined && material.level >= mining.harvestLevel);
  return Math.ceil(Math.max(0, hardness) * (canHarvest ? HARVEST_DIVISOR : 100) / speed);
}

function normalizeEfficiencyLevel(value: number): number {
  return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}
