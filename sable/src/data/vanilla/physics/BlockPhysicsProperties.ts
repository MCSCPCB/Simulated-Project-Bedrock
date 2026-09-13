// Per-block physics properties: contact friction and restitution, the fragile
// impact speed at which a world or sub-level block breaks, and the mass and
// displaced-fluid volume a sub-level block contributes. Migrated from
// TreePhysics src/data/BlockPhysicsProperties.ts; the mass and buoyancyVolume
// columns carry the per-kind values the source assigned in code (canopy
// 0.0625 / 0.125, timber 1 / 1, chest 0.5 / 1, attachment 0.1 / 0.1). Blocks
// absent from this table use DEFAULT_BLOCK_MASS and DEFAULT_BLOCK_BUOYANCY_VOLUME.
import type { PhysicsBlockProperties } from "../../../api/physics/PhysicsTypes.js";

export const DEFAULT_BLOCK_MASS = 0.25;
export const DEFAULT_BLOCK_BUOYANCY_VOLUME = 0.25;

const CANOPY = { buoyancyVolume: 0.125, fragileImpactSpeed: 0, mass: 0.0625 } as const;
const TIMBER = { buoyancyVolume: 1, mass: 1 } as const;
const FRAGILE_PLANT = { buoyancyVolume: 0.1, fragileImpactSpeed: 0, mass: 0.1 } as const;
const ATTACHMENT = { buoyancyVolume: 0.1, mass: 0.1 } as const;

export const BLOCK_PHYSICS_PROPERTIES: Readonly<Record<string, PhysicsBlockProperties>> = {
  "minecraft:acacia_leaves": CANOPY,
  "minecraft:acacia_log": TIMBER,
  "minecraft:acacia_wood": TIMBER,
  "minecraft:azalea_leaves": CANOPY,
  "minecraft:azalea_leaves_flowered": CANOPY,
  "minecraft:bamboo": { fragileImpactSpeed: 4 },
  "minecraft:bee_nest": { ...ATTACHMENT, fragileImpactSpeed: 4 },
  "minecraft:birch_leaves": CANOPY,
  "minecraft:birch_log": TIMBER,
  "minecraft:birch_wood": TIMBER,
  "minecraft:blue_ice": { friction: 0 },
  "minecraft:cactus": { friction: 1.65, fragileImpactSpeed: 4 },
  "minecraft:cherry_leaves": CANOPY,
  "minecraft:cherry_log": TIMBER,
  "minecraft:cherry_wood": TIMBER,
  "minecraft:chest": { buoyancyVolume: 1, mass: 0.5 },
  "minecraft:cocoa": { ...ATTACHMENT, fragileImpactSpeed: 4 },
  "minecraft:dark_oak_leaves": CANOPY,
  "minecraft:dark_oak_log": TIMBER,
  "minecraft:dark_oak_wood": TIMBER,
  "minecraft:flowering_azalea_leaves": CANOPY,
  "minecraft:frosted_ice": { friction: 0, fragileImpactSpeed: 4 },
  "minecraft:grindstone": { friction: 0.05 },
  "minecraft:hanging_roots": FRAGILE_PLANT,
  "minecraft:honey_block": { friction: 1.65 },
  "minecraft:ice": { friction: 0, fragileImpactSpeed: 4 },
  "minecraft:jungle_leaves": CANOPY,
  "minecraft:jungle_log": TIMBER,
  "minecraft:jungle_wood": TIMBER,
  "minecraft:leaves": CANOPY,
  "minecraft:leaves2": CANOPY,
  "minecraft:lily_pad": { fragileImpactSpeed: 4 },
  "minecraft:mangrove_leaves": CANOPY,
  "minecraft:mangrove_log": TIMBER,
  "minecraft:mangrove_propagule": FRAGILE_PLANT,
  "minecraft:mangrove_roots": ATTACHMENT,
  "minecraft:mangrove_wood": TIMBER,
  "minecraft:melon_block": { fragileImpactSpeed: 4 },
  "minecraft:mud": { friction: 0.25 },
  "minecraft:muddy_mangrove_roots": ATTACHMENT,
  "minecraft:oak_leaves": CANOPY,
  "minecraft:oak_log": TIMBER,
  "minecraft:oak_wood": TIMBER,
  "minecraft:packed_ice": { friction: 0 },
  "minecraft:pale_hanging_moss": FRAGILE_PLANT,
  "minecraft:pale_oak_leaves": CANOPY,
  "minecraft:pale_oak_log": TIMBER,
  "minecraft:pale_oak_wood": TIMBER,
  "minecraft:pumpkin": { fragileImpactSpeed: 4 },
  "minecraft:slime": { restitution: 1 },
  "minecraft:soul_sand": { friction: 1.65 },
  "minecraft:soul_soil": { friction: 1.65 },
  "minecraft:spruce_leaves": CANOPY,
  "minecraft:spruce_log": TIMBER,
  "minecraft:spruce_wood": TIMBER,
  "minecraft:stripped_acacia_log": TIMBER,
  "minecraft:stripped_acacia_wood": TIMBER,
  "minecraft:stripped_birch_log": TIMBER,
  "minecraft:stripped_birch_wood": TIMBER,
  "minecraft:stripped_cherry_log": TIMBER,
  "minecraft:stripped_cherry_wood": TIMBER,
  "minecraft:stripped_dark_oak_log": TIMBER,
  "minecraft:stripped_dark_oak_wood": TIMBER,
  "minecraft:stripped_jungle_log": TIMBER,
  "minecraft:stripped_jungle_wood": TIMBER,
  "minecraft:stripped_mangrove_log": TIMBER,
  "minecraft:stripped_mangrove_wood": TIMBER,
  "minecraft:stripped_oak_log": TIMBER,
  "minecraft:stripped_oak_wood": TIMBER,
  "minecraft:stripped_pale_oak_log": TIMBER,
  "minecraft:stripped_pale_oak_wood": TIMBER,
  "minecraft:stripped_spruce_log": TIMBER,
  "minecraft:stripped_spruce_wood": TIMBER,
  "minecraft:vine": FRAGILE_PLANT
};
