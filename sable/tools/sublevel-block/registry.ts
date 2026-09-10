import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { parseCondition, type ConditionNode } from "./condition.ts";
import { fancySubLevelStoredStateBits } from "../../src/sublevel/render/fancy/model/FancySubLevelModelTypes.ts";
import type { FancySubLevelModelDescription } from "../../src/sublevel/render/fancy/model/FancySubLevelModel.ts";

const MODEL_TYPES = new Set([
  "full_block", "pillar", "chest", "bee_nest", "cocoa", "vine", "hanging_roots",
  "mangrove_propagule", "pale_hanging_moss", "mangrove_roots", "creaking_heart",
  "wall", "grass_path", "moss_carpet", "pointed_dripstone", "multi_face", "sculk_shrieker"
]);
const MATERIALS = new Set([
  "opaque", "alpha_test", "alpha_test_tint", "opaque_tint",
  "blend", "translucent", "opaque_emissive", "alpha_test_emissive", "redstone_torch_emissive",
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
  readonly mining?: { readonly tool: string; readonly harvest_level?: number };
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
  "none", "facing_log", "above_solid", "above_leaf", "moss_column", "vine_faces", "wall_connections",
  "below_block", "moss_carpet", "pointed_dripstone", "multi_face"
]);
export interface RawVariant extends RawRenderDefinition { readonly condition: string; }
export interface RawFlipbook {
  readonly ticks_per_frame: number;
  readonly frame_count: number;
  readonly axis?: "u" | "v";
  readonly loop?: boolean;
  readonly textures?: readonly string[];
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
  readonly grassTint?: true;
  readonly material:
    | "opaque" | "alpha_test" | "alpha_test_tint" | "opaque_tint"
    | "blend" | "translucent" | "opaque_emissive" | "alpha_test_emissive" | "redstone_torch_emissive";
  readonly model: Record<string, unknown>;
  readonly tint?: { readonly method: "foliage" | "grass" | "fixed"; readonly color?: string; readonly palette?: number };
  readonly flipbook?: {
    readonly ticksPerFrame: number;
    readonly frameCount: number;
    readonly axis: "u" | "v";
    readonly loop: boolean;
    readonly textures?: readonly string[];
  };
  pool?: CompiledModelPool;
}

export interface CompiledModelResource {
  readonly entityTypeId: string;
  readonly variant: number;
  readonly rotation?: readonly [number, number, number];
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

/** Build-time resources use the same state width as the runtime encoder. */
export function modelRuntimeStateBits(model: Record<string, unknown>): number {
  return fancySubLevelStoredStateBits(model as unknown as FancySubLevelModelDescription) - 1;
}

const POOL_MEMBER_CAP = 32;
export interface CompiledRegistryEntry {
  readonly category: string;
  readonly hardness?: number;
  readonly mining?: import("../../src/sublevel/render/fancy/model/FancySubLevelModel.ts").SubLevelMiningProperties;
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
  const raw = JSON.parse(await readFile(file, "utf8")) as RawRegistry;
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
export function toRuntimeModel(
  model: CompiledModel,
  resources: ReadonlyMap<string, CompiledModelResource>
): Record<string, unknown> {
  return {
    key: model.key,
    dense: resources.get(model.denseEntityTypeId),
    sparse: resources.get(model.sparseEntityTypeId),
    material: model.material,
    model: model.model,
    ...(model.tint ? { tint: model.tint } : {}),
    ...(model.flipbook ? { flipbook: model.flipbook } : {}),
    ...(model.pool ? { pool: { ...model.pool, ...resources.get(model.pool.entityTypeId) } } : {})
  };
}

export function toRuntimeRegistry(
  compiled: CompiledRegistry,
  resources: ReadonlyMap<string, CompiledModelResource>
): Record<string, unknown> {
  const strippedByKey = new Map<string, unknown>();
  const strip = (model: CompiledModel | null): unknown => {
    if (!model) return null;
    const cached = strippedByKey.get(model.key);
    if (cached) return cached;
    const stripped = toRuntimeModel(model, resources);
    strippedByKey.set(model.key, stripped);
    return stripped;
  };
  return Object.fromEntries(Object.entries(compiled).map(([blockId, entry]) => [blockId, {
    category: entry.category,
    ...(entry.hardness !== undefined ? { hardness: entry.hardness } : {}),
    ...(entry.mining ? { mining: entry.mining } : {}),
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
    if (entry.hardness !== undefined && (!Number.isFinite(entry.hardness) || (entry.hardness < 0 && entry.hardness !== -1))) {
      throw new Error(`${blockId}: hardness must be non-negative or -1 for an unbreakable block.`);
    }
    const mining = validateMining(entry.mining, blockId);
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
      obtainModel(modelsByKey, usedNames, paletteByColor, entry.materials, definition, path, blockId, directory, poolKey, suffix)
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
      ...(mining ? { mining } : {}),
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
  blockId: string,
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
  const grassTint = blockId === "minecraft:grass_block" && tint !== undefined ? true : undefined;
  const key = hashModel(material, model, tint, flipbook, grassTint);
  const existing = modelsByKey.get(key);
  if (existing) return existing;
  const blockName = blockShortName(blockId);
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
    ...(grassTint ? { grassTint } : {}),
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
  if (type === "full_block" || type === "grass_path") {
    const textures = model.textures;
    if (!textures || typeof textures !== "object") throw new Error(`${path}: full_block textures required.`);
    for (const face of FULL_FACES) validateResource((textures as Record<string, unknown>)[face], `${path}.model.textures.${face}`);
    if (model.size !== undefined && (!Array.isArray(model.size) || model.size.length !== 3
      || model.size.some(value => !Number.isInteger(value) || (value as number) <= 0 || (value as number) > 16))) {
      throw new Error(`${path}: full_block size must contain three positive dimensions up to 16.`);
    }
    return;
  }
  if (type === "wall" || type === "multi_face") {
    validateResource(model.texture, `${path}.model.texture`);
    return;
  }
  if (type === "moss_carpet") {
    validateResource(model.texture, `${path}.model.texture`);
    if (typeof model.pale !== "boolean") throw new Error(`${path}: moss_carpet pale is required.`);
    if (model.pale) {
      validateResource(model.side_short, `${path}.model.side_short`);
      validateResource(model.side_tall, `${path}.model.side_tall`);
    }
    return;
  }
  if (type === "sculk_shrieker") {
    const textures = model.textures as Record<string, unknown> | undefined;
    for (const face of ["bottom", "side", "top", "inner_top"]) {
      validateResource(textures?.[face], `${path}.model.textures.${face}`);
    }
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
  if (flipbook.textures !== undefined) {
    if (!Array.isArray(flipbook.textures) || flipbook.textures.length === 0 || new Set(flipbook.textures).size !== flipbook.textures.length) {
      throw new Error(`${path}: flipbook.textures must be a non-empty unique array.`);
    }
    for (const texture of flipbook.textures) validateResource(texture, `${path}.flipbook.textures`);
  }
  return {
    ticksPerFrame: flipbook.ticks_per_frame,
    frameCount: flipbook.frame_count,
    axis: flipbook.axis ?? "v",
    loop: flipbook.loop ?? true,
    ...(flipbook.textures ? { textures: [...flipbook.textures] } : {})
  };
}

function validateMining(mining: RawBlockRegistration["mining"], path: string): CompiledRegistryEntry["mining"] {
  if (mining === undefined) return undefined;
  if (!["none", "axe", "pickaxe", "shovel", "hoe"].includes(mining.tool)) {
    throw new Error(`${path}: invalid mining.tool.`);
  }
  if (mining.harvest_level !== undefined && (![0, 1, 2, 3].includes(mining.harvest_level) || mining.tool === "none")) {
    throw new Error(`${path}: mining.harvest_level requires a tool and must be 0..3.`);
  }
  return {
    tool: mining.tool as NonNullable<CompiledRegistryEntry["mining"]>["tool"],
    ...(mining.harvest_level !== undefined ? { harvestLevel: mining.harvest_level } : {})
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
  flipbook: CompiledModel["flipbook"],
  grassTint: CompiledModel["grassTint"]
): string {
  return createHash("sha256")
    .update(JSON.stringify(sortValue({ material, model, tint, flipbook, grassTint })))
    .digest("hex");
}
export function sortValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => [key, sortValue(item)]));
  }
  return value;
}
