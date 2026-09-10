import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { parseCondition, type ConditionNode } from "./condition.ts";

const MODEL_TYPES = new Set([
  "full_block", "pillar", "chest", "bee_nest", "cocoa", "vine", "hanging_roots",
  "mangrove_propagule", "pale_hanging_moss", "mangrove_roots", "creaking_heart",
  "wall", "moss_carpet", "pointed_dripstone"
]);
const MATERIALS = new Set([
  "opaque", "alpha_test", "alpha_test_tint", "opaque_tint",
  "blend", "translucent", "opaque_emissive", "redstone_torch_emissive",
]);
const TINT_MATERIALS = new Set(["alpha_test_tint", "opaque_tint"]);
const DIRECTIONS = new Set(["north", "east", "south", "west"]);
const FULL_FACES = ["up", "down", "north", "south", "east", "west"] as const;

export const CATEGORY_TREE: Readonly<Record<string, readonly string[]>> = {
  building: [
    "bricks_and_building_materials",
    "colored_blocks",
    "logs_and_wood",
    "other_building_and_functional",
    "planks"
  ],
  nature: [
    "crops",
    "leaves",
    "other_natural_blocks",
    "ores_and_metals",
    "plants_and_flowers",
    "saplings",
    "terrain_and_stone",
    "water_and_ice"
  ],
  functional: [
    "beds",
    "buttons",
    "chests_and_containers",
    "decorations_and_display",
    "doors",
    "fences",
    "fences_and_climbing",
    "light_sources",
    "mechanisms_and_technical_blocks",
    "rails_and_transport",
    "redstone",
    "signs",
    "slabs",
    "stairs",
    "workstations"
  ]
};

const CATEGORY_PATHS = new Set(
  Object.entries(CATEGORY_TREE).flatMap(([group, children]) => (
    children.map(child => `${group}/${child}`)
  ))
);

export interface RawRegistry {
  readonly format_version: string;
  readonly blocks: Readonly<Record<string, RawBlockRegistration>>;
}
export interface RawBlockRegistration {
  readonly materials: string;
  readonly category: string;
  readonly domain?: string;
  readonly hardness?: number;
  readonly placeable?: boolean;
  readonly passable?: boolean;
  readonly support?: string;
  readonly states: readonly string[];
  readonly variants: readonly RawVariant[];
  readonly default: RawRenderDefinition;
}

// Attachment support rules the runtime resolver implements; the registry only
// maps blocks onto them.
const SUPPORT_RULES = new Set([
  "none", "facing_log", "above_solid", "above_leaf", "moss_column", "vine_faces", "wall_connections"
]);
export interface RawVariant extends RawRenderDefinition { readonly condition: string; }
export interface RawFlipbook {
  readonly ticks_per_frame: number;
  readonly frame_count: number;
  readonly axis?: "u" | "v";
  readonly loop?: boolean;
}
export interface RawRenderDefinition {
  readonly model: Record<string, unknown>;
  readonly tint?: { readonly method: string; readonly color?: string };
  readonly flipbook?: RawFlipbook;
}

export interface CompiledModelPool {
  readonly entityTypeId: string;
  readonly family: number;
  readonly xBits: number;
  readonly yBits: number;
  readonly zBits: number;
  readonly familyBits: number;
  readonly stateBits: number;
}

export interface CompiledModel {
  readonly key: string;
  readonly name: string;
  readonly directory: string;
  readonly poolKey: string;
  readonly denseEntityTypeId: string;
  readonly sparseEntityTypeId: string;
  readonly material:
    | "opaque" | "alpha_test" | "alpha_test_tint" | "opaque_tint"
    | "blend" | "translucent" | "opaque_emissive" | "redstone_torch_emissive";
  readonly model: Record<string, unknown>;
  readonly tint?: { readonly method: "foliage" | "grass" | "fixed"; readonly color?: string; readonly palette?: number };
  readonly flipbook?: {
    readonly ticksPerFrame: number;
    readonly frameCount: number;
    readonly axis: "u" | "v";
    readonly loop: boolean;
  };
  pool?: CompiledModelPool;
}

// The fixed tint colormap holds one row of 32 palette cells; every distinct
// fixed color occupies one cell addressed by the quantized tint coordinates.
export const FIXED_TINT_PALETTE_CAPACITY = 32;

export interface CompiledPool {
  readonly name: string;
  readonly directory: string;
  readonly entityTypeId: string;
  readonly members: readonly CompiledModel[];
  readonly xBits: number;
  readonly yBits: number;
  readonly zBits: number;
  readonly familyBits: number;
  readonly stateBits: number;
}

/** Runtime state bits a model type stores per slot, mirrored by the runtime registry. */
export function modelRuntimeStateBits(model: Record<string, unknown>): number {
  return model.type === "chest"
    ? 1
    : model.type === "wall" || (model.type === "moss_carpet" && model.pale === true) ? 9 : 0;
}

const POOL_MEMBER_CAP = 32;
export interface CompiledRegistryEntry {
  readonly category: string;
  readonly hardness?: number;
  readonly placeable?: boolean;
  readonly passable?: boolean;
  readonly support?: string;
  readonly states: readonly string[];
  readonly variants: readonly { readonly condition: ConditionNode; readonly model: CompiledModel | null }[];
  readonly default: CompiledModel | null;
}
export type CompiledRegistry = Readonly<Record<string, CompiledRegistryEntry>>;

export async function readAndCompileRegistry(file: string): Promise<{
  readonly raw: RawRegistry;
  readonly compiled: CompiledRegistry;
  readonly models: readonly CompiledModel[];
  readonly pools: readonly CompiledPool[];
  readonly fixedTintPalette: readonly string[];
}> {
  const parsed = JSON.parse(await readFile(file, "utf8")) as RawRegistry;
  const raw = await addTerrainAndStoneDefaults(parsed, file);
  const compiled = compileRegistry(raw);
  const models = [...new Map(
    Object.values(compiled).flatMap(entry => [
      entry.default,
      ...entry.variants.map(variant => variant.model)
    ]).flatMap(model => model ? [[model.key, model] as const] : [])
  ).values()];
  const pools = partitionPools(models);
  const fixedTintPalette: string[] = [];
  for (const model of models) {
    if (model.tint?.method === "fixed") fixedTintPalette[model.tint.palette!] = model.tint.color!;
  }
  return { compiled, fixedTintPalette, models, pools, raw };
}

async function addTerrainAndStoneDefaults(source: RawRegistry, file: string): Promise<RawRegistry> {
  if (!file.replaceAll("\\", "/").endsWith("sable/src/data/sublevel-block.json")) return source;
  const listPath = new URL("../../../.sample/VanillaBlock/VanillaBlockData/main/自然/地形与石材/blocks.json", import.meta.url);
  const listed = JSON.parse((await readFile(listPath, "utf8")).replace(/^\uFEFF/, "")) as readonly { name: string }[];
  const metadataPath = new URL("../../../.sample/VanillaBlock/VanillaBlockResource/bedrock-sample-1.26.40.5/metadata/vanilladata_modules/mojang-blocks.json", import.meta.url);
  const metadata = JSON.parse(await readFile(metadataPath, "utf8")) as {
    readonly data_items?: readonly { readonly name: string; readonly properties?: readonly { readonly name: string }[] }[]
  };
  const properties = new Map((metadata.data_items ?? []).map(item => [
    item.name,
    item.properties?.map(property => property.name.includes(":") ? property.name : `minecraft:${property.name}`) ?? []
  ] as const));
  const flipbookPath = new URL("../../../.sample/VanillaBlock/VanillaBlockResource/bedrock-sample-1.26.40.5/resource_pack/textures/flipbook_textures.json", import.meta.url);
  const flipbooks = await readFlipbooks(flipbookPath);
  const blocks: Record<string, RawBlockRegistration> = { ...source.blocks };
  for (const item of listed) {
    const blockId = `minecraft:${item.name}`;
    if (blocks[blockId]) continue;
    blocks[blockId] = terrainBlockRegistration(item.name, properties.get(blockId), flipbooks);
  }
  return { ...source, blocks };
}

function terrainBlockRegistration(
  name: string,
  metadataStates: readonly string[] = [],
  flipbooks: ReadonlyMap<string, RawFlipbook> = new Map()
): RawBlockRegistration {
  const category = "nature/terrain_and_stone";
  const texture = terrainTexture(name);
  if (name === "grass_block") {
    return {
      materials: "opaque_tint",
      category,
      states: metadataStates,
      variants: [],
      default: { model: { type: "full_block", textures: {
        up: "textures/blocks/grass_top",
        down: "textures/blocks/dirt",
        north: "textures/blocks/grass_side",
        south: "textures/blocks/grass_side",
        east: "textures/blocks/grass_side",
        west: "textures/blocks/grass_side"
      } }, tint: { method: "grass" } }
    };
  }
  if (name.endsWith("_wall")) return wallRegistration(name);
  if (name === "basalt" || name === "polished_basalt") {
    const side = name === "basalt" ? "textures/blocks/basalt_side" : "textures/blocks/basalt_side";
    const top = name === "basalt" ? "textures/blocks/basalt_top" : "textures/blocks/basalt_top";
    return axisRegistration(category, side, top);
  }
  if (name === "grass_path") {
    return {
      materials: "opaque",
      category,
      states: metadataStates,
      variants: [],
      default: { model: { type: "full_block", textures: {
        up: "textures/blocks/grass_path_top", down: "textures/blocks/dirt",
        north: "textures/blocks/grass_path_side", south: "textures/blocks/grass_path_side",
        east: "textures/blocks/grass_path_side", west: "textures/blocks/grass_path_side"
      } } }
    };
  }
  if (name === "snow_layer") {
    const textures = { up: texture, down: texture, north: texture, south: texture, east: texture, west: texture };
    return {
      materials: "alpha_test", category, states: metadataStates, variants: Array.from({ length: 8 }, (_, index) => ({
        condition: `q.block_state('minecraft:height') == ${index}`,
        model: { type: "full_block", textures, size: [16, index + 1, 16] }
      })),
      default: { model: { type: "full_block", textures, size: [16, 1, 16] } }
    };
  }
  if (name === "stone_pressure_plate" || name === "polished_blackstone_pressure_plate") {
    const textures = { up: texture, down: texture, north: texture, south: texture, east: texture, west: texture };
    return {
      materials: "opaque", category, states: metadataStates,
      variants: [{ condition: "q.block_state('minecraft:redstone_signal') > 0", model: { type: "full_block", textures, size: [16, 1, 16] } }],
      default: { model: { type: "full_block", textures, size: [16, 2, 16] } }
    };
  }
  if (name === "farmland") {
    return {
      materials: "opaque", category, states: metadataStates, variants: [],
      default: { model: { type: "full_block", textures: {
        up: texture, down: "textures/blocks/dirt", north: texture, south: texture, east: texture, west: texture
      }, size: [16, 15, 16] } }
    };
  }
  if (name === "moss_carpet" || name === "pale_moss_carpet") {
    return {
      materials: "alpha_test", category, states: metadataStates, variants: [],
      default: { model: { type: "moss_carpet", texture, pale: name === "pale_moss_carpet" } }
    };
  }
  if (name === "pointed_dripstone") {
    const variants: RawVariant[] = [];
    for (const hanging of [false, true]) {
      for (const thickness of ["tip", "frustum", "middle", "base", "merge"] as const) {
        variants.push({
          condition: `q.block_state('minecraft:hanging') == ${hanging} && q.block_state('minecraft:dripstone_thickness') == '${thickness}'`,
          model: { type: "pointed_dripstone", texture, thickness, hanging }
        });
      }
    }
    return {
      materials: "opaque", category, states: metadataStates, variants,
      default: { model: { type: "pointed_dripstone", texture, thickness: "tip", hanging: false } }
    };
  }
  const material = terrainMaterial(name);
  const definition: RawRenderDefinition = { model: { type: "full_block", textures: {
    up: texture, down: texture, north: texture, south: texture, east: texture, west: texture
  } } };
  const flipbook = flipbooks.get(texture);
  if (flipbook) definition.flipbook = flipbook;
  return {
    materials: material,
    category,
    states: metadataStates.length > 0 ? [...metadataStates] : terrainStates(name),
    variants: [],
    default: definition
  };
}

function terrainMaterial(name: string): RawBlockRegistration["materials"] {
  if (["ice", "blue_ice", "packed_ice", "frosted_ice"].includes(name)) return "translucent";
  if (name === "powder_snow" || /grass|seagrass|sculk_vein|snow_layer/.test(name)) return "alpha_test";
  if (["glowstone", "glowingobsidian", "sculk", "sculk_catalyst", "sculk_sensor", "sculk_shrieker"].includes(name)) return "opaque_emissive";
  return "opaque";
}

async function readFlipbooks(file: URL): Promise<ReadonlyMap<string, RawFlipbook>> {
  const entries = JSON.parse((await readFile(file, "utf8")).replace(/^\s*\/\/[^\n]*\n/, "")) as readonly {
    readonly flipbook_texture?: string;
    readonly frames?: readonly number[];
    readonly ticks_per_frame?: number;
  }[];
  const result = new Map<string, RawFlipbook>();
  for (const entry of entries) {
    if (!entry.flipbook_texture) continue;
    const frameCount = entry.frames?.length ?? await flipbookImageFrameCount(file, entry.flipbook_texture);
    const ticks = entry.ticks_per_frame ?? 1;
    if (frameCount <= 1 && entry.ticks_per_frame === undefined) continue;
    result.set(entry.flipbook_texture, {
      ticks_per_frame: ticks,
      frame_count: frameCount,
      axis: "v",
      loop: true
    });
  }
  return result;
}

async function flipbookImageFrameCount(file: URL, texture: string): Promise<number> {
  const relative = texture.replace(/^textures\//, "");
  for (const extension of [".png", ".tga"] as const) {
    try {
      const bytes = await readFile(new URL(`./${relative}${extension}`, file));
      if (extension === ".png" && bytes.length >= 24) {
        const width = bytes.readUInt32BE(16);
        const height = bytes.readUInt32BE(20);
        if (width > 0 && height % width === 0) return Math.max(1, height / width);
      }
      return 1;
    } catch {
      continue;
    }
  }
  return 1;
}

function terrainStates(name: string): string[] {
  const states: Readonly<Record<string, readonly string[]>> = {
    snow_layer: ["minecraft:covered_bit", "minecraft:height"],
    pointed_dripstone: ["minecraft:dripstone_thickness", "minecraft:hanging"],
    redstone_wire: ["minecraft:redstone_signal"],
    stone_pressure_plate: ["minecraft:redstone_signal"],
    polished_blackstone_pressure_plate: ["minecraft:redstone_signal"],
    sculk_sensor: ["minecraft:sculk_sensor_phase"],
    calibrated_sculk_sensor: ["minecraft:cardinal_direction", "minecraft:sculk_sensor_phase"],
    sculk_shrieker: ["minecraft:active", "minecraft:can_summon"],
    frosted_ice: ["minecraft:age"],
    farmland: ["minecraft:moisturized_amount"],
    grindstone: ["minecraft:attachment", "minecraft:direction"],
    redstone_torch: ["minecraft:torch_facing_direction"],
    basalt: ["minecraft:pillar_axis"],
    polished_basalt: ["minecraft:pillar_axis"]
  };
  return [...(states[name] ?? [])];
}

function terrainTexture(name: string): string {
  const aliases: Readonly<Record<string, string>> = {
    basalt: "textures/blocks/basalt_side",
    polished_basalt: "textures/blocks/polished_basalt_side",
    calibrated_sculk_sensor: "textures/blocks/calibrated_sculk_sensor_top",
    chiseled_red_sandstone: "textures/blocks/red_sandstone_carved",
    chiseled_sandstone: "textures/blocks/sandstone_carved",
    chiseled_stone_bricks: "textures/blocks/stonebrick_carved",
    chiseled_deepslate: "textures/blocks/deepslate/chiseled_deepslate",
    cobbled_deepslate: "textures/blocks/deepslate/cobbled_deepslate",
    deepslate: "textures/blocks/deepslate/deepslate",
    deepslate_bricks: "textures/blocks/deepslate/deepslate_bricks",
    deepslate_tiles: "textures/blocks/deepslate/deepslate_tiles",
    farmland: "textures/blocks/farmland_wet",
    cracked_stone_bricks: "textures/blocks/stonebrick_cracked",
    cracked_deepslate_bricks: "textures/blocks/deepslate/cracked_deepslate_bricks",
    cracked_deepslate_tiles: "textures/blocks/deepslate/cracked_deepslate_tiles",
    cut_red_sandstone: "textures/blocks/red_sandstone_smooth",
    cut_sandstone: "textures/blocks/sandstone_smooth",
    end_stone_bricks: "textures/blocks/end_bricks",
    frosted_ice: "textures/blocks/frosted_ice_0",
    grindstone: "textures/blocks/grindstone_side",
    glowingobsidian: "textures/blocks/glowing_obsidian",
    infested_chiseled_stone_bricks: "textures/blocks/stonebrick_carved",
    infested_cobblestone: "textures/blocks/cobblestone",
    infested_cracked_stone_bricks: "textures/blocks/stonebrick_cracked",
    infested_deepslate: "textures/blocks/deepslate/deepslate",
    infested_mossy_stone_bricks: "textures/blocks/stonebrick_mossy",
    infested_stone: "textures/blocks/stone",
    infested_stone_bricks: "textures/blocks/stonebrick",
    lodestone: "textures/blocks/lodestone_side",
    moss_carpet: "textures/blocks/moss_block",
    mossy_cobblestone: "textures/blocks/cobblestone_mossy",
    mossy_stone_brick: "textures/blocks/stonebrick_mossy",
    mossy_stone_bricks: "textures/blocks/stonebrick_mossy",
    mycelium: "textures/blocks/mycelium_side",
    pale_moss_carpet: "textures/blocks/pale_moss",
    packed_ice: "textures/blocks/ice",
    podzol: "textures/blocks/dirt_podzol_side",
    pointed_dripstone: "textures/blocks/pointed_dripstone_up_middle",
    red_sandstone: "textures/blocks/red_sandstone_normal",
    redstone_lamp: "textures/blocks/redstone_lamp_off",
    lit_redstone_lamp: "textures/blocks/redstone_lamp_on",
    redstone_torch: "textures/blocks/redstone_torch_on",
    redstone_wire: "textures/blocks/redstone_dust_cross",
    reinforced_deepslate: "textures/blocks/reinforced_deepslate_side",
    sandstone: "textures/blocks/sandstone_normal",
    sculk_catalyst: "textures/blocks/sculk_catalyst_side",
    sculk_sensor: "textures/blocks/sculk_sensor_top",
    sculk_shrieker: "textures/blocks/sculk_shrieker_top",
    snow_layer: "textures/blocks/snow",
    short_grass: "textures/blocks/tallgrass",
    tall_grass: "textures/blocks/tallgrass",
    smooth_red_sandstone: "textures/blocks/red_sandstone_top",
    smooth_sandstone: "textures/blocks/sandstone_top",
    smooth_stone: "textures/blocks/stone_slab_top",
    suspicious_gravel: "textures/blocks/suspicious_gravel_0",
    suspicious_sand: "textures/blocks/suspicious_sand_0",
    stone_pressure_plate: "textures/blocks/stone",
    polished_blackstone_pressure_plate: "textures/blocks/polished_blackstone",
    stonecutter: "textures/blocks/stonecutter_top",
    stonecutter_block: "textures/blocks/stonecutter_top",
    unlit_redstone_torch: "textures/blocks/redstone_torch_off"
  };
  return aliases[name] ?? `textures/blocks/${name}`;
}

function axisRegistration(category: string, side: string, top: string): RawBlockRegistration {
  return {
    materials: "opaque", category, states: ["minecraft:pillar_axis"],
    variants: [
      ...(["y", "x", "z"] as const).map(axis => ({
        condition: `q.block_state('minecraft:pillar_axis') == '${axis}'`,
        model: { type: "pillar", textures: { side, top }, axis }
      }))
    ],
    default: { model: { type: "pillar", textures: { side, top }, axis: "y" } }
  };
}

function wallRegistration(name: string): RawBlockRegistration {
  const category = "nature/terrain_and_stone";
  const base = name.replace(/_wall$/, "");
  const texture = `textures/blocks/${wallTexture(base)}`;
  const states = [
    "minecraft:wall_connection_type_north", "minecraft:wall_connection_type_east",
    "minecraft:wall_connection_type_south", "minecraft:wall_connection_type_west",
    "minecraft:wall_post_bit"
  ];
  return {
    materials: "opaque", category, support: "wall_connections", states, variants: [],
    default: { model: { type: "wall", texture } }
  };
}

function wallTexture(base: string): string {
  const aliases: Readonly<Record<string, string>> = {
    cobbled_deepslate: "deepslate/cobbled_deepslate", deepslate_brick: "deepslate/deepslate_bricks",
    deepslate_tile: "deepslate/deepslate_tiles", end_stone_brick: "end_bricks",
    mud_brick: "mud_bricks", polished_blackstone_brick: "polished_blackstone_bricks",
    polished_deepslate: "deepslate/polished_deepslate", polished_tuff: "polished_tuff",
    mossy_cobblestone: "cobblestone_mossy", mossy_stone_brick: "stonebrick_mossy",
    red_sandstone: "red_sandstone", sandstone: "sandstone_normal", stone_brick: "stonebrick",
    tuff_brick: "tuff_bricks"
  };
  return aliases[base] ?? base;
}

/**
 * Splits every pool key (domain, defaulting to category) into descriptor pools:
 * members are layered by their per-slot state width, then chunked to the
 * member cap, so one pool always shares a single 24-bit descriptor layout.
 */
function partitionPools(models: readonly CompiledModel[]): CompiledPool[] {
  const byPoolKey = new Map<string, CompiledModel[]>();
  for (const model of models) {
    const members = byPoolKey.get(model.poolKey);
    if (members) members.push(model);
    else byPoolKey.set(model.poolKey, [model]);
  }
  const pools: CompiledPool[] = [];
  const usedNames = new Set<string>();
  for (const [poolKey, members] of byPoolKey) {
    const poolableMembers = members.filter(member => member.model.type !== "wall" && member.model.type !== "moss_carpet" && member.tint?.method !== "grass");
    if (poolableMembers.length === 0) continue;
    const byStateBits = new Map<number, CompiledModel[]>();
    for (const member of poolableMembers) {
      const stateBits = modelRuntimeStateBits(member.model);
      const layer = byStateBits.get(stateBits);
      if (layer) layer.push(member);
      else byStateBits.set(stateBits, [member]);
    }
    const directory = CATEGORY_PATHS.has(poolKey) ? poolKey : `pools/${sanitizeNameToken(poolKey)}`;
    const nameBase = sanitizeNameToken(poolKey.slice(poolKey.lastIndexOf("/") + 1));
    let ordinal = 0;
    for (const [stateBits, layer] of byStateBits) {
      for (let start = 0; start < layer.length; start += POOL_MEMBER_CAP) {
        const chunk = layer.slice(start, start + POOL_MEMBER_CAP);
        const familyBits = Math.max(1, Math.ceil(Math.log2(chunk.length)));
        const coordinateBits = 23 - familyBits - stateBits;
        const yBits = Math.floor(coordinateBits / 3);
        const xBits = Math.ceil((coordinateBits - yBits) / 2);
        const zBits = coordinateBits - yBits - xBits;
        if (zBits < 3) throw new Error(`Pool ${poolKey} leaves too few descriptor coordinate bits.`);
        const name = uniqueModelName(usedNames, `${nameBase}_${ordinal}`);
        ordinal++;
        const pool: CompiledPool = {
          directory,
          entityTypeId: `sable:fancy_pool_${name}`,
          familyBits,
          members: chunk,
          name,
          stateBits,
          xBits,
          yBits,
          zBits
        };
        chunk.forEach((member, family) => {
          member.pool = {
            entityTypeId: pool.entityTypeId,
            family,
            familyBits,
            stateBits,
            xBits,
            yBits,
            zBits
          };
        });
        pools.push(pool);
      }
    }
  }
  return pools;
}

/** The runtime registry omits the packaging fields the script bundle never reads. */
export function toRuntimeRegistry(compiled: CompiledRegistry): Record<string, unknown> {
  const strippedByKey = new Map<string, unknown>();
  const strip = (model: CompiledModel | null): unknown => {
    if (!model) return null;
    const cached = strippedByKey.get(model.key);
    if (cached) return cached;
    const stripped = {
      key: model.key,
      denseEntityTypeId: model.denseEntityTypeId,
      sparseEntityTypeId: model.sparseEntityTypeId,
      material: model.material,
      model: model.model,
      ...(model.tint ? { tint: model.tint } : {}),
      ...(model.flipbook ? { flipbook: model.flipbook } : {}),
      ...(model.pool ? { pool: model.pool } : {})
    };
    strippedByKey.set(model.key, stripped);
    return stripped;
  };
  return Object.fromEntries(Object.entries(compiled).map(([blockId, entry]) => [blockId, {
    category: entry.category,
    ...(entry.hardness !== undefined ? { hardness: entry.hardness } : {}),
    ...(entry.placeable !== undefined ? { placeable: entry.placeable } : {}),
    ...(entry.passable !== undefined ? { passable: entry.passable } : {}),
    ...(entry.support !== undefined ? { support: entry.support } : {}),
    states: entry.states,
    variants: entry.variants.map(variant => ({
      condition: variant.condition,
      model: strip(variant.model)
    })),
    default: strip(entry.default)
  }]));
}

export function compileRegistry(raw: RawRegistry): CompiledRegistry {
  if (!raw || raw.format_version !== "1.0.0" || !raw.blocks || typeof raw.blocks !== "object") {
    throw new Error("Registry must contain format_version 1.0.0 and a blocks object.");
  }
  const modelsByKey = new Map<string, CompiledModel>();
  const usedNames = new Set<string>();
  const paletteByColor = new Map<string, number>();
  const result: Record<string, CompiledRegistryEntry> = {};
  for (const [blockId, entry] of Object.entries(raw.blocks)) {
    validateBlockId(blockId);
    if (!MATERIALS.has(entry.materials)) throw new Error(`${blockId}: invalid materials.`);
    if (typeof entry.category !== "string" || !CATEGORY_PATHS.has(entry.category)) {
      throw new Error(`${blockId}: category must be one of the registered category paths.`);
    }
    if (entry.domain !== undefined && (typeof entry.domain !== "string" || entry.domain.trim().length === 0)) {
      throw new Error(`${blockId}: domain must be a non-empty string when present.`);
    }
    if (entry.hardness !== undefined && (!Number.isFinite(entry.hardness) || entry.hardness < 0)) {
      throw new Error(`${blockId}: hardness must be a non-negative finite number.`);
    }
    if (entry.placeable !== undefined && typeof entry.placeable !== "boolean") {
      throw new Error(`${blockId}: placeable must be a boolean when present.`);
    }
    if (entry.passable !== undefined && typeof entry.passable !== "boolean") {
      throw new Error(`${blockId}: passable must be a boolean when present.`);
    }
    if (entry.support !== undefined && !SUPPORT_RULES.has(entry.support)) {
      throw new Error(`${blockId}: unsupported support rule.`);
    }
    if (!Array.isArray(entry.states) || new Set(entry.states).size !== entry.states.length) {
      throw new Error(`${blockId}: states must be a unique array.`);
    }
    for (const state of entry.states) validateStateName(state, `${blockId}.states`);
    if (!Array.isArray(entry.variants)) throw new Error(`${blockId}: variants must be an array.`);
    const blockName = blockShortName(blockId);
    const directory = `${entry.category}/${blockName}`;
    const poolKey = entry.domain ?? entry.category;
    const obtain = (definition: RawRenderDefinition, path: string, suffix: string): CompiledModel | null => (
      obtainModel(modelsByKey, usedNames, paletteByColor, entry.materials, definition, path, blockName, directory, poolKey, suffix)
    );
    // The default resolves first so the plain block name lands on the default model.
    const defaultModel = obtain(entry.default, `${blockId}.default`, "");
    const variants = entry.variants.map((variant, index) => {
      if (typeof variant.condition !== "string") throw new Error(`${blockId}.variants[${index}]: condition is required.`);
      const condition = parseCondition(variant.condition, entry.states);
      return {
        condition,
        model: obtain(variant, `${blockId}.variants[${index}]`, conditionSuffix(condition))
      };
    });
    result[blockId] = {
      category: entry.category,
      ...(entry.hardness !== undefined ? { hardness: entry.hardness } : {}),
      ...(entry.placeable !== undefined ? { placeable: entry.placeable } : {}),
      ...(entry.passable !== undefined ? { passable: entry.passable } : {}),
      ...(entry.support !== undefined ? { support: entry.support } : {}),
      states: [...entry.states],
      variants,
      default: defaultModel
    };
  }
  return result;
}

function obtainModel(
  modelsByKey: Map<string, CompiledModel>,
  usedNames: Set<string>,
  paletteByColor: Map<string, number>,
  material: string,
  definition: RawRenderDefinition,
  path: string,
  blockName: string,
  directory: string,
  poolKey: string,
  suffix: string
): CompiledModel | null {
  if (!definition || !definition.model || typeof definition.model !== "object") {
    throw new Error(`${path}: model is required.`);
  }
  const model = structuredClone(definition.model) as Record<string, unknown>;
  const type = model.type;
  // A vanilla model routes the matching block states to the hand-held route.
  if (type === "vanilla") {
    if (definition.tint || definition.flipbook) throw new Error(`${path}: vanilla models take no tint or flipbook animation.`);
    return null;
  }
  if (typeof type !== "string" || !MODEL_TYPES.has(type)) throw new Error(`${path}: unsupported model.type.`);
  validateModel(model, path);
  const tint = validateTint(material, definition.tint, path, paletteByColor);
  const flipbook = validateFlipbook(definition.flipbook, path);
  const key = hashModel(material, model, tint, flipbook);
  const existing = modelsByKey.get(key);
  if (existing) return existing;
  const name = uniqueModelName(usedNames, suffix ? `${blockName}_${suffix}` : blockName);
  const compiled: CompiledModel = {
    denseEntityTypeId: `sable:fancy_model_${name}_dense`,
    directory,
    key,
    material: material as CompiledModel["material"],
    model,
    name,
    poolKey,
    sparseEntityTypeId: `sable:fancy_model_${name}_sparse`,
    ...(tint ? { tint } : {}),
    ...(flipbook ? { flipbook } : {})
  };
  modelsByKey.set(key, compiled);
  return compiled;
}

function uniqueModelName(usedNames: Set<string>, base: string): string {
  let name = base;
  for (let ordinal = 2; usedNames.has(name); ordinal++) name = `${base}_${ordinal}`;
  usedNames.add(name);
  return name;
}

/** Derives a readable state token list from a variant condition, e.g. "oak_y". */
function conditionSuffix(condition: ConditionNode): string {
  return collectSuffixTokens(condition).join("_");
}

function collectSuffixTokens(node: ConditionNode): string[] {
  if (node.type === "not") {
    return collectSuffixTokens(node.operand).map(token => `not_${token}`);
  }
  if (node.type !== "binary") return [];
  if (node.operator === "&&" || node.operator === "||") {
    return [...collectSuffixTokens(node.left), ...collectSuffixTokens(node.right)];
  }
  const state = node.left.type === "state" ? node.left : node.right.type === "state" ? node.right : undefined;
  const literal = node.left.type === "literal" ? node.left : node.right.type === "literal" ? node.right : undefined;
  if (!state || !literal) return [];
  if (typeof literal.value === "boolean") {
    const name = sanitizeNameToken(stateShortName(state.name));
    return [node.operator === "!=" ? (literal.value ? `not_${name}` : name) : (literal.value ? name : `not_${name}`)];
  }
  const value = sanitizeNameToken(String(literal.value));
  const prefix = { "==": "", "!=": "not_", "<": "lt", "<=": "le", ">": "gt", ">=": "ge" }[node.operator];
  return [`${prefix}${value}`];
}

function stateShortName(state: string): string {
  const separator = state.indexOf(":");
  return separator >= 0 ? state.slice(separator + 1) : state;
}

function sanitizeNameToken(value: string): string {
  const token = value.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  if (!token) throw new Error(`Condition literal "${value}" cannot name a model resource.`);
  return token;
}

function blockShortName(blockId: string): string {
  return sanitizeNameToken(stateShortName(blockId));
}

const AXES = new Set(["y", "x", "z"]);
const VINE_FACES = new Set(["south", "west", "north", "east"]);

function validateSideTop(model: Record<string, unknown>, path: string): void {
  const textures = model.textures;
  if (!textures || typeof textures !== "object") throw new Error(`${path}: side/top textures required.`);
  validateResource((textures as Record<string, unknown>).side, `${path}.model.textures.side`);
  validateResource((textures as Record<string, unknown>).top, `${path}.model.textures.top`);
}

function validateDirection(value: unknown, path: string): void {
  if (![0, 1, 2, 3].includes(value as number)) throw new Error(`${path}: direction must be 0..3.`);
}

function validateModel(model: Record<string, unknown>, path: string): void {
  const type = model.type;
  if (type === "full_block") {
    const textures = model.textures;
    if (!textures || typeof textures !== "object") throw new Error(`${path}: full_block textures required.`);
    for (const face of FULL_FACES) validateResource((textures as Record<string, unknown>)[face], `${path}.model.textures.${face}`);
    if (model.size !== undefined && (!Array.isArray(model.size) || model.size.length !== 3
      || model.size.some(value => !Number.isInteger(value) || (value as number) <= 0 || (value as number) > 16))) {
      throw new Error(`${path}: full_block size must contain three positive dimensions up to 16.`);
    }
    return;
  }
  if (type === "wall") {
    validateResource(model.texture, `${path}.model.texture`);
    return;
  }
  if (type === "moss_carpet") {
    validateResource(model.texture, `${path}.model.texture`);
    if (typeof model.pale !== "boolean") throw new Error(`${path}: moss_carpet pale is required.`);
    return;
  }
  if (type === "pointed_dripstone") {
    validateResource(model.texture, `${path}.model.texture`);
    if (!["tip", "frustum", "middle", "base", "merge"].includes(String(model.thickness))) {
      throw new Error(`${path}: invalid pointed_dripstone thickness.`);
    }
    if (typeof model.hanging !== "boolean") throw new Error(`${path}: pointed_dripstone hanging is required.`);
    return;
  }
  if (type === "pillar" || type === "creaking_heart") {
    validateSideTop(model, path);
    if (!AXES.has(String(model.axis))) throw new Error(`${path}: axis must be y, x or z.`);
    return;
  }
  if (type === "chest") {
    validateResource(model.texture, `${path}.model.texture`);
    if (!DIRECTIONS.has(String(model.facing))) throw new Error(`${path}: invalid chest facing.`);
    return;
  }
  if (type === "bee_nest") {
    const textures = model.textures;
    if (!textures || typeof textures !== "object") throw new Error(`${path}: bee_nest textures required.`);
    for (const face of ["down", "up", "front", "side"]) {
      validateResource((textures as Record<string, unknown>)[face], `${path}.model.textures.${face}`);
    }
    validateDirection(model.direction, path);
    return;
  }
  if (type === "cocoa") {
    validateResource(model.texture, `${path}.model.texture`);
    validateDirection(model.direction, path);
    if (![0, 1, 2].includes(model.age as number)) throw new Error(`${path}: invalid cocoa age.`);
    return;
  }
  if (type === "vine") {
    validateResource(model.texture, `${path}.model.texture`);
    if (!Array.isArray(model.faces) || new Set(model.faces).size !== model.faces.length) {
      throw new Error(`${path}: vine faces must be a unique array.`);
    }
    for (const face of model.faces) if (!VINE_FACES.has(String(face))) throw new Error(`${path}: invalid vine face.`);
    return;
  }
  if (type === "hanging_roots" || type === "pale_hanging_moss") {
    validateResource(model.texture, `${path}.model.texture`);
    if (type === "pale_hanging_moss" && typeof model.tip !== "boolean") throw new Error(`${path}: tip is required.`);
    return;
  }
  if (type === "mangrove_propagule") {
    validateResource(model.texture, `${path}.model.texture`);
    if (!Number.isInteger(model.stage) || (model.stage as number) < 0 || (model.stage as number) > 4) {
      throw new Error(`${path}: invalid propagule stage.`);
    }
    return;
  }
  if (type === "mangrove_roots") validateSideTop(model, path);
}

function validateTint(
  material: string,
  tint: RawRenderDefinition["tint"],
  path: string,
  paletteByColor: Map<string, number>
): CompiledModel["tint"] {
  if (TINT_MATERIALS.has(material) && !tint) throw new Error(`${path}: tint materials require tint.`);
  if (!tint) return undefined;
  if (!TINT_MATERIALS.has(material)) throw new Error(`${path}: tint is only valid for tint materials.`);
  if (tint.method === "foliage" || tint.method === "grass") return { method: tint.method };
  if (tint.method === "fixed" && typeof tint.color === "string" && /^#[0-9a-fA-F]{6}$/.test(tint.color)) {
    const color = tint.color.toUpperCase();
    let palette = paletteByColor.get(color);
    if (palette === undefined) {
      palette = paletteByColor.size;
      if (palette >= FIXED_TINT_PALETTE_CAPACITY) {
        throw new Error(`${path}: the fixed tint palette holds at most ${FIXED_TINT_PALETTE_CAPACITY} distinct colors.`);
      }
      paletteByColor.set(color, palette);
    }
    return { color, method: "fixed", palette };
  }
  throw new Error(`${path}: tint must use foliage or a six-digit fixed color.`);
}

function validateFlipbook(
  flipbook: RawRenderDefinition["flipbook"],
  path: string
): CompiledModel["flipbook"] {
  if (flipbook === undefined) return undefined;
  if (!flipbook || !Number.isInteger(flipbook.ticks_per_frame) || flipbook.ticks_per_frame <= 0) {
    throw new Error(`${path}: flipbook.ticks_per_frame must be a positive integer.`);
  }
  if (!Number.isInteger(flipbook.frame_count) || flipbook.frame_count <= 0) {
    throw new Error(`${path}: flipbook.frame_count must be a positive integer.`);
  }
  if (flipbook.axis !== undefined && flipbook.axis !== "u" && flipbook.axis !== "v") {
    throw new Error(`${path}: flipbook.axis must be "u" or "v".`);
  }
  if (flipbook.loop !== undefined && typeof flipbook.loop !== "boolean") {
    throw new Error(`${path}: flipbook.loop must be a boolean.`);
  }
  return {
    ticksPerFrame: flipbook.ticks_per_frame,
    frameCount: flipbook.frame_count,
    axis: flipbook.axis ?? "v",
    loop: flipbook.loop ?? true
  };
}

function validateResource(value: unknown, path: string): void {
  if (typeof value !== "string" || value.length === 0 || /[\r\n]/.test(value)) throw new Error(`${path}: resource path required.`);
}
function validateBlockId(value: string): void {
  if (!/^[a-z0-9_.-]+:[a-z0-9_./-]+$/.test(value)) throw new Error(`Invalid block ID ${value}.`);
}
function validateStateName(value: string, path: string): void {
  if (!/^[a-z0-9_.-]+:[a-z0-9_./-]+$/.test(value)) throw new Error(`${path}: invalid state ${value}.`);
}
function hashModel(
  material: string,
  model: Record<string, unknown>,
  tint: CompiledModel["tint"],
  flipbook: CompiledModel["flipbook"]
): string {
  return createHash("sha256")
    .update(JSON.stringify(sortValue({ material, model, tint, flipbook })))
    .digest("hex");
}
export function sortValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => [key, sortValue(item)]));
  }
  return value;
}
