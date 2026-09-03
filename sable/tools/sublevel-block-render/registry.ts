import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { parseCondition, type ConditionNode } from "./condition.ts";

const MODEL_TYPES = new Set([
  "full_block", "chest", "cocoa", "vine", "hanging_roots",
  "mangrove_propagule", "pale_hanging_moss", "mangrove_roots",
  "muddy_mangrove_roots"
]);
const MATERIALS = new Set(["opaque", "alpha_test", "alpha_test_tint", "opaque_tint"]);
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
  readonly states: readonly string[];
  readonly variants: readonly RawVariant[];
  readonly default: RawRenderDefinition;
}
export interface RawVariant extends RawRenderDefinition { readonly condition: string; }
export interface RawRenderDefinition {
  readonly model: Record<string, unknown>;
  readonly tint?: { readonly method: string; readonly color?: string };
}

export interface CompiledModel {
  readonly key: string;
  readonly name: string;
  readonly directory: string;
  readonly denseEntityTypeId: string;
  readonly sparseEntityTypeId: string;
  readonly material: "opaque" | "alpha_test" | "alpha_test_tint" | "opaque_tint";
  readonly model: Record<string, unknown>;
  readonly tint?: { readonly method: "foliage" | "fixed"; readonly color?: string };
}
export interface CompiledRegistryEntry {
  readonly states: readonly string[];
  readonly variants: readonly { readonly condition: ConditionNode; readonly model: CompiledModel }[];
  readonly default: CompiledModel;
}
export type CompiledRegistry = Readonly<Record<string, CompiledRegistryEntry>>;

export async function readAndCompileRegistry(file: string): Promise<{
  readonly raw: RawRegistry;
  readonly compiled: CompiledRegistry;
  readonly models: readonly CompiledModel[];
}> {
  const raw = JSON.parse(await readFile(file, "utf8")) as RawRegistry;
  const compiled = compileRegistry(raw);
  const models = [...new Map(
    Object.values(compiled).flatMap(entry => [
      entry.default,
      ...entry.variants.map(variant => variant.model)
    ]).map(model => [model.key, model] as const)
  ).values()];
  return { raw, compiled, models };
}

/** The runtime registry omits the packaging fields the script bundle never reads. */
export function toRuntimeRegistry(compiled: CompiledRegistry): Record<string, unknown> {
  const strippedByKey = new Map<string, unknown>();
  const strip = (model: CompiledModel): unknown => {
    const cached = strippedByKey.get(model.key);
    if (cached) return cached;
    const stripped = {
      key: model.key,
      denseEntityTypeId: model.denseEntityTypeId,
      sparseEntityTypeId: model.sparseEntityTypeId,
      material: model.material,
      model: model.model,
      ...(model.tint ? { tint: model.tint } : {})
    };
    strippedByKey.set(model.key, stripped);
    return stripped;
  };
  return Object.fromEntries(Object.entries(compiled).map(([blockId, entry]) => [blockId, {
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
  const result: Record<string, CompiledRegistryEntry> = {};
  for (const [blockId, entry] of Object.entries(raw.blocks)) {
    validateBlockId(blockId);
    if (!MATERIALS.has(entry.materials)) throw new Error(`${blockId}: invalid materials.`);
    if (typeof entry.category !== "string" || !CATEGORY_PATHS.has(entry.category)) {
      throw new Error(`${blockId}: category must be one of the registered category paths.`);
    }
    if (!Array.isArray(entry.states) || new Set(entry.states).size !== entry.states.length) {
      throw new Error(`${blockId}: states must be a unique array.`);
    }
    for (const state of entry.states) validateStateName(state, `${blockId}.states`);
    if (!Array.isArray(entry.variants)) throw new Error(`${blockId}: variants must be an array.`);
    const blockName = blockShortName(blockId);
    const directory = `${entry.category}/${blockName}`;
    const obtain = (definition: RawRenderDefinition, path: string, suffix: string): CompiledModel => (
      obtainModel(modelsByKey, usedNames, entry.materials, definition, path, blockName, directory, suffix)
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
    result[blockId] = { states: [...entry.states], variants, default: defaultModel };
  }
  return result;
}

function obtainModel(
  modelsByKey: Map<string, CompiledModel>,
  usedNames: Set<string>,
  material: string,
  definition: RawRenderDefinition,
  path: string,
  blockName: string,
  directory: string,
  suffix: string
): CompiledModel {
  if (!definition || !definition.model || typeof definition.model !== "object") {
    throw new Error(`${path}: model is required.`);
  }
  const model = structuredClone(definition.model) as Record<string, unknown>;
  const type = model.type;
  if (typeof type !== "string" || !MODEL_TYPES.has(type)) throw new Error(`${path}: unsupported model.type.`);
  validateModel(model, path);
  const tint = validateTint(material, definition.tint, path);
  const key = hashModel(material, model, tint);
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
    sparseEntityTypeId: `sable:fancy_model_${name}_sparse`,
    ...(tint ? { tint } : {})
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

function validateModel(model: Record<string, unknown>, path: string): void {
  const type = model.type;
  if (type === "full_block") {
    const textures = model.textures;
    if (!textures || typeof textures !== "object") throw new Error(`${path}: full_block textures required.`);
    for (const face of FULL_FACES) validateResource((textures as Record<string, unknown>)[face], `${path}.model.textures.${face}`);
    return;
  }
  if (type === "chest") {
    validateResource(model.texture, `${path}.model.texture`);
    if (!DIRECTIONS.has(String(model.facing))) throw new Error(`${path}: invalid chest facing.`);
    return;
  }
  if (type === "cocoa") {
    validateResource(model.texture, `${path}.model.texture`);
    if (!DIRECTIONS.has(String(model.facing))) throw new Error(`${path}: invalid cocoa facing.`);
    if (![0, 1, 2].includes(model.age as number)) throw new Error(`${path}: invalid cocoa age.`);
    return;
  }
  if (type === "vine") {
    validateResource(model.texture, `${path}.model.texture`);
    if (!Array.isArray(model.faces) || model.faces.length === 0 || new Set(model.faces).size !== model.faces.length) {
      throw new Error(`${path}: vine faces must be a non-empty unique array.`);
    }
    for (const face of model.faces) if (![...DIRECTIONS, "up"].includes(String(face))) throw new Error(`${path}: invalid vine face.`);
    return;
  }
  if (type === "hanging_roots" || type === "pale_hanging_moss") {
    validateResource(model.texture, `${path}.model.texture`);
    if (type === "pale_hanging_moss" && typeof model.tip !== "boolean") throw new Error(`${path}: tip is required.`);
    return;
  }
  if (type === "mangrove_propagule") {
    validateResource(model.texture, `${path}.model.texture`);
    if (typeof model.hanging !== "boolean" || !Number.isInteger(model.stage)) throw new Error(`${path}: propagule hanging/stage required.`);
    if ((model.stage as number) < 0 || (model.stage as number) > 4) throw new Error(`${path}: invalid propagule stage.`);
    return;
  }
  if (type === "mangrove_roots" || type === "muddy_mangrove_roots") {
    const textures = model.textures;
    if (!textures || typeof textures !== "object") throw new Error(`${path}: root textures required.`);
    validateResource((textures as Record<string, unknown>).top, `${path}.model.textures.top`);
    validateResource((textures as Record<string, unknown>).side, `${path}.model.textures.side`);
  }
}

function validateTint(
  material: string,
  tint: RawRenderDefinition["tint"],
  path: string
): CompiledModel["tint"] {
  if (TINT_MATERIALS.has(material) && !tint) throw new Error(`${path}: tint materials require tint.`);
  if (!tint) return undefined;
  if (!TINT_MATERIALS.has(material)) throw new Error(`${path}: tint is only valid for tint materials.`);
  if (tint.method === "foliage") return { method: "foliage" };
  if (tint.method === "fixed" && typeof tint.color === "string" && /^#[0-9a-fA-F]{6}$/.test(tint.color)) {
    return { color: tint.color.toUpperCase(), method: "fixed" };
  }
  throw new Error(`${path}: tint must use foliage or a six-digit fixed color.`);
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
function hashModel(material: string, model: Record<string, unknown>, tint: CompiledModel["tint"]): string {
  return createHash("sha256")
    .update(JSON.stringify(sortValue({ material, model, tint })))
    .digest("hex");
}
function sortValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => [key, sortValue(item)]));
  }
  return value;
}
