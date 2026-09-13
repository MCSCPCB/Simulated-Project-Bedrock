import { mkdir, readdir, readFile, rmdir, unlink, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { dirname, join, posix, relative, sep } from "node:path";
import { transform } from "esbuild";
import {
  CATEGORY_TREE, sortValue, toRuntimeModel, toRuntimeRegistry,
  type CompiledModel, type CompiledModelResource, type CompiledPool, type CompiledRegistry
} from "./registry.ts";
import {
  collectCollideParticleTargets,
  collectDestructParticleTargets,
  collectFunctionalResourceTargets
} from "./functional-resources.ts";
import {
  createCarrierEntity,
  createFancyClientEntity,
  createFancyEntity,
  createFancyGeometry,
  createFancyAnimation,
  createFancyRenderController,
  createPoolAnimation,
  createPoolClientEntity,
  createPoolGeometry,
  createPoolRenderController,
  createVanillaAnimation,
  createVanillaClientEntity,
  createVanillaEntity,
  createVanillaGeometry,
  createVanillaRenderController,
  modelOrientation,
  rawJsonNumber
} from "./model-templates.ts";

type JsonObject = Record<string, unknown>;

// A 32x32 grid of 8-pixel cells: the quantized tint coordinates land inside
// their cell with bilinear filtering, like TreePhysics' fixed map. Row 0 holds
// the registry's fixed tint palette; the fixed-foliage biomes keep the exact
// cells and colors the TreePhysics sampler addresses.
const FIXED_COLORMAP_SIZE = 256;
const FIXED_COLORMAP_CELL = 8;
const FIXED_FOLIAGE_BIOME_CELLS: readonly { readonly u: number; readonly v: number; readonly color: string }[] = [
  { u: 8, v: 16, color: "#B6DB61" },
  { u: 23, v: 16, color: "#878D76" }
];

function fixedColormapTga(palette: readonly string[]): Buffer {
  const header = Buffer.alloc(18);
  header[2] = 2;
  header.writeUInt16LE(FIXED_COLORMAP_SIZE, 12);
  header.writeUInt16LE(FIXED_COLORMAP_SIZE, 14);
  header[16] = 32;
  header[17] = 0x28;
  const pixels = Buffer.alloc(FIXED_COLORMAP_SIZE * FIXED_COLORMAP_SIZE * 4, 0xff);
  const paint = (cellU: number, cellV: number, color: string): void => {
    const value = Number.parseInt(color.slice(1), 16);
    for (let y = cellV * FIXED_COLORMAP_CELL; y < (cellV + 1) * FIXED_COLORMAP_CELL; y++) {
      for (let x = cellU * FIXED_COLORMAP_CELL; x < (cellU + 1) * FIXED_COLORMAP_CELL; x++) {
        const offset = (y * FIXED_COLORMAP_SIZE + x) * 4;
        pixels[offset] = value % 256;
        pixels[offset + 1] = Math.floor(value / 256) % 256;
        pixels[offset + 2] = Math.floor(value / 65536);
        pixels[offset + 3] = 0xff;
      }
    }
  };
  for (let cell = 0; cell < palette.length; cell++) {
    if (palette[cell]) paint(cell, 0, palette[cell]!);
  }
  for (const cell of FIXED_FOLIAGE_BIOME_CELLS) paint(cell.u, cell.v, cell.color);
  return Buffer.concat([header, pixels]);
}

const REGISTRY_VIRTUAL_SPECIFIER = "sable:sublevel-block-registry";
const REGISTRY_MODULE_PATH = "SableBP/scripts/sable/generated/sublevel-block-registry.js";

// Every file the tool writes lives inside one of these subtrees (plus the
// individually named pack-level files below); nothing else is ever touched.
const MANAGED_SUBTREES = [
  "SableBP/blocks/sable",
  "SableBP/entities/sable/sublevel",
  "SableBP/scripts/sable",
  "SableRP/entity/sable/sublevel",
  "SableRP/models/blocks/sable",
  "SableRP/models/entity/sable/sublevel",
  "SableRP/animations/sable/sublevel",
  "SableRP/particles/sable",
  "SableRP/render_controllers/sable/sublevel"
] as const;

const CATEGORY_SKELETON_ROOTS = [
  "SableBP/entities/sable/sublevel",
  "SableRP/entity/sable/sublevel",
  "SableRP/models/entity/sable/sublevel",
  "SableRP/animations/sable/sublevel",
  "SableRP/render_controllers/sable/sublevel"
] as const;

// Localized display names: packs, the interaction proxy block, and every
// projection entity (the chest storage entity keeps its container identity).
const TEXT_LANGUAGES = ["en_US", "zh_CN"] as const;
const STATIC_ENTITY_TYPE_IDS = [
  "sable:block",
  "sable:block_carrier",
  "sable:fancy_model_carrier",
  "sable:block_outline",
  "sable:block_crack",
  "sable:block_collider",
  "sable:sublevel_mount"
] as const;

function collectTextTargets(
  resources: ReadonlyMap<string, CompiledModelResource>,
  targets: Map<string, string | Buffer>
): void {
  const entityTypeIds = [
    ...STATIC_ENTITY_TYPE_IDS,
    ...new Set([...resources.values()].map(resource => resource.entityTypeId))
  ];
  const languagesJson = `${JSON.stringify([...TEXT_LANGUAGES], null, 2)}\n`;
  const packLines: Record<(typeof TEXT_LANGUAGES)[number], { bp: string[]; rp: string[] }> = {
    en_US: {
      bp: ["pack.name=Sable Behavior Pack 1.0.0", "pack.description=Made by: MINECRAFT-SCPCB"],
      rp: ["pack.name=Sable Resource Pack 1.0.0", "pack.description=Made by: MINECRAFT-SCPCB"]
    },
    zh_CN: {
      bp: ["pack.name=Sable 行为包 1.0.0", "pack.description=作者：MINECRAFT-SCPCB"],
      rp: ["pack.name=Sable 资源包 1.0.0", "pack.description=作者：MINECRAFT-SCPCB"]
    }
  };
  const structureName = { en_US: "Contraption", zh_CN: "结构" } as const;
  const chestName = { en_US: "Chest", zh_CN: "箱子" } as const;
  for (const language of TEXT_LANGUAGES) {
    const rpLines = [
      ...packLines[language].rp,
      "",
      `tile.sable:interaction_target.name=${structureName[language]}`,
      "",
      `entity.sable:chest.name=${chestName[language]}`,
      ...entityTypeIds.map(typeId => `entity.${typeId}.name=${structureName[language]}`)
    ];
    targets.set(`SableBP/texts/${language}.lang`, `${packLines[language].bp.join("\n")}\n`);
    targets.set(`SableRP/texts/${language}.lang`, `${rpLines.join("\n")}\n`);
  }
  targets.set("SableBP/texts/languages.json", languagesJson);
  targets.set("SableRP/texts/languages.json", languagesJson);
}

function jsonText(value: JsonObject): string {
  const rawNumberPattern = new RegExp(`"${rawJsonNumber(0).slice(0, -3)}(-?(?:\\d+(?:\\.\\d+)?))"`, "g");
  return JSON.stringify(value).replace(rawNumberPattern, "$1");
}

function shareResource(
  kind: "geometry" | "animation" | "render_controller",
  version: unknown,
  definition: JsonObject,
  targets: Map<string, string | Buffer>
): string {
  const digest = createHash("sha1").update(JSON.stringify(sortValue([version, definition]))).digest("hex").slice(0, 16);
  const prefix = kind === "render_controller" ? "controller.render" : kind;
  const identifier = `${prefix}.sable_shared_${digest}`;
  const directory = kind === "geometry" ? "models/entity" : `${kind}s`;
  const extension = kind === "geometry" ? "geo" : kind === "animation" ? "animation" : "render_controllers";
  const path = `SableRP/${directory}/sable/sublevel/fancy/_shared/${digest}.${extension}.json`;
  if (!targets.has(path)) {
    const content = kind === "geometry"
      ? { "minecraft:geometry": [{ ...definition, description: { identifier, ...definition.description as JsonObject } }] }
      : { [`${kind}s`]: { [identifier]: definition } };
    targets.set(path, jsonText({ format_version: version, ...content }));
  }
  return identifier;
}

/** Intern individual definitions across models, formats and pools. Client
 * aliases keep texture/material bindings and conditional controller order. */
function collectSharedModelResources(
  clientEntity: JsonObject,
  geometry: JsonObject,
  animation: JsonObject,
  controller: JsonObject,
  targets: Map<string, string | Buffer>,
  controllers: Map<string, JsonObject>,
  geometries: Map<string, JsonObject>
): void {
  const identifiers = new Map<string, string>();
  for (const definition of geometry["minecraft:geometry"] as JsonObject[]) {
    const { identifier, ...description } = definition.description as JsonObject;
    const shared = shareResource("geometry", geometry.format_version, { ...definition, description }, targets);
    identifiers.set(identifier as string, shared);
    geometries.set(shared, definition);
  }
  for (const [resource, kind] of [[animation, "animation"], [controller, "render_controller"]] as const) {
    for (const [identifier, definition] of Object.entries(resource[`${kind}s`] as Record<string, JsonObject>)) {
      if (kind === "render_controller") {
        identifiers.set(identifier, identifier);
        controllers.set(identifier, definition);
      } else {
        identifiers.set(identifier, shareResource(kind, resource.format_version, definition, targets));
      }
    }
  }
  const description = (clientEntity["minecraft:client_entity"] as JsonObject).description as JsonObject;
  for (const field of ["geometry", "animations"]) {
    description[field] = Object.fromEntries(Object.entries(description[field] as Record<string, string>).map(
      ([alias, identifier]) => [alias, identifiers.get(identifier) ?? identifier]
    ));
  }
  description.render_controllers = (description.render_controllers as (string | Record<string, string>)[]).map(
    entry => typeof entry === "string" ? identifiers.get(entry)! : Object.fromEntries(
      Object.entries(entry).map(([identifier, condition]) => [identifiers.get(identifier)!, condition])
    )
  );
}

function mapStrings(value: unknown, map: (source: string) => string): unknown {
  if (typeof value === "string") return map(value);
  if (Array.isArray(value)) return value.map(entry => mapStrings(entry, map));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, mapStrings(entry, map)]));
  }
  return value;
}

const RESOURCE_REFERENCE = /\b(Geometry|Texture|Material)\.([a-zA-Z0-9_]+)/g;
const RESOURCE_FIELDS = { Geometry: "geometry", Texture: "textures", Material: "materials" } as const;
const ARRAY_FIELDS = { Geometry: "geometries", Texture: "textures", Material: "materials" } as const;

/** Merge clients sharing the same input decoder and animations. Each ordered
 * render pass keeps its condition and selects its original resource bindings
 * from arrays. Texture paths and geometry UVs remain independent. */
function collectGenericClients(
  clients: readonly JsonObject[],
  controllers: ReadonlyMap<string, JsonObject>,
  geometries: ReadonlyMap<string, JsonObject>,
  rotations: ReadonlyMap<string, readonly [number, number, number]>,
  targets: Map<string, string | Buffer>
): Map<string, CompiledModelResource> {
  const groups: { key: string; members: JsonObject[]; rest: Map<string, string> }[] = [];
  const byAnimation = new Map<string, typeof groups>();
  for (const client of clients) {
    const description = (client["minecraft:client_entity"] as JsonObject).description as JsonObject;
    const key = JSON.stringify(sortValue([client.format_version, description.scripts, description.animations]));
    const rest = new Map<string, string>();
    for (const identifier of Object.values(description.geometry as Record<string, string>)) {
      for (const bone of geometries.get(identifier)!.bones as JsonObject[]) {
        rest.set(bone.name as string, JSON.stringify([bone.parent, bone.pivot, bone.rotation]));
      }
    }
    // Bedrock shares named bones between a client's geometries. Never merge
    // models whose identically named bones have different rest transforms.
    const candidates = byAnimation.get(key) ?? [];
    let group = candidates.find(candidate => [...rest].every(([name, pose]) => (
      !candidate.rest.has(name) || candidate.rest.get(name) === pose
    )));
    if (!group) {
      group = { key: `${key}:${candidates.length}`, members: [], rest: new Map() };
      candidates.push(group);
      groups.push(group);
      byAnimation.set(key, candidates);
    }
    group.members.push(description);
    for (const [name, pose] of rest) group.rest.set(name, pose);
  }
  const resources = new Map<string, CompiledModelResource>();
  for (const { key, members } of groups) {
    const digest = createHash("sha1").update(key).digest("hex").slice(0, 16);
    const entityTypeId = `sable:fancy_${digest}`;
    const bindings: Record<string, Record<string, string>> = { geometry: {}, textures: {}, materials: {} };
    const aliases = new Map<string, string>();
    const bind = (kind: keyof typeof RESOURCE_FIELDS, value: string): string => {
      const key = `${kind}:${value}`;
      let alias = aliases.get(key);
      if (!alias) {
        const field = bindings[RESOURCE_FIELDS[kind]]!;
        alias = `r${Object.keys(field).length}`;
        field[alias] = value;
        aliases.set(key, alias);
      }
      return `${kind}.${alias}`;
    };
    const passes = new Map<string, {
      layer: number;
      condition: string;
      definition: JsonObject;
      variants: Map<number, ReadonlyMap<string, string>>;
    }>();
    members.forEach((member, variant) => {
      const sourceId = member.identifier as string;
      resources.set(sourceId, { entityTypeId, variant, rotation: rotations.get(sourceId) });
      (member.render_controllers as (string | Record<string, string>)[]).forEach((entry, layer) => {
        const [id, condition] = typeof entry === "string" ? [entry, "1"] : Object.entries(entry)[0]!;
        const names = new Map<string, string>();
        const values = new Map<string, string>();
        const definition = mapStrings(controllers.get(id)!, source => source.replace(
          RESOURCE_REFERENCE, (reference, kind: keyof typeof RESOURCE_FIELDS, alias: string) => {
            let name = names.get(reference);
            if (!name) {
              name = `${kind}.binding_${names.size}`;
              names.set(reference, name);
              values.set(name, bind(kind, (member[RESOURCE_FIELDS[kind]] as Record<string, string>)[alias]!));
            }
            return name;
          }
        )) as JsonObject;
        const passKey = JSON.stringify(sortValue([layer, condition, definition]));
        const pass = passes.get(passKey) ?? { layer, condition, definition, variants: new Map() };
        pass.variants.set(variant, values);
        passes.set(passKey, pass);
      });
    });
    const renderControllers: Record<string, string>[] = [];
    for (const pass of [...passes.values()].sort((a, b) => a.layer - b.layer)) {
      const { arrays: sourceArrays = {}, ...body } = pass.definition;
      const first = pass.variants.values().next().value!;
      const variants = members.map((_, index) => pass.variants.get(index) ?? first);
      const arrays: Record<string, Record<string, string[]>> = {};
      const strides = new Map<string, number>();
      for (const [field, lists] of Object.entries(sourceArrays as Record<string, Record<string, string[]>>)) {
        arrays[field] = {};
        for (const [name, entries] of Object.entries(lists)) {
          const choices = variants.map(values => entries.map(entry => values.get(entry)!));
          const varies = choices.some(choice => JSON.stringify(choice) !== JSON.stringify(choices[0]));
          arrays[field]![name] = varies ? choices.flat() : choices[0]!;
          if (varies) strides.set(name, entries.length);
        }
      }
      const selected = new Map<string, string>();
      const definition = mapStrings(body, source => source.replace(
        RESOURCE_REFERENCE, (reference, kind: keyof typeof ARRAY_FIELDS) => {
          let expression = selected.get(reference);
          if (!expression) {
            const choices = variants.map(values => values.get(reference)!);
            expression = choices[0]!;
            if (choices.some(choice => choice !== expression)) {
              const field = ARRAY_FIELDS[kind];
              const name = `Array.resource_${selected.size}`;
              (arrays[field] ??= {})[name] = choices;
              expression = `${name}[v.model_variant]`;
            }
            selected.set(reference, expression);
          }
          return expression;
        }
      ).replace(/(Array\.[a-zA-Z0-9_]+)\[([^\]]+)\]/g, (reference, name: string, index: string) => {
        const stride = strides.get(name);
        return stride ? `${name}[v.model_variant * ${stride} + (${index})]` : reference;
      })) as JsonObject;
      if (Object.keys(arrays).length) definition.arrays = arrays;
      const identifier = shareResource("render_controller", "1.10.0", definition, targets);
      const selection = pass.variants.size === members.length ? "1"
        : [...pass.variants.keys()].map(variant => `v.model_variant == ${variant}`).join(" || ");
      renderControllers.push({ [identifier]: `(${selection}) && (${pass.condition})` });
    }
    const client = {
      format_version: "1.20.30",
      "minecraft:client_entity": { description: {
        identifier: entityTypeId,
        ...bindings,
        animations: members[0]!.animations,
        scripts: members[0]!.scripts,
        render_controllers: renderControllers
      } }
    };
    targets.set(`SableBP/entities/sable/sublevel/fancy/_shared/${digest}.json`, jsonText(createFancyEntity(entityTypeId)));
    targets.set(`SableRP/entity/sable/sublevel/fancy/_shared/${digest}.json`, jsonText(client));
  }
  return resources;
}

async function collectScriptTargets(
  srcRoot: string,
  runtimeRegistry: Record<string, unknown>,
  missingModel: Record<string, unknown>,
  targets: Map<string, string | Buffer>
): Promise<void> {
  targets.set(
    REGISTRY_MODULE_PATH,
    `export const blockRegistry = ${JSON.stringify(runtimeRegistry)};\nexport const missingModel = ${JSON.stringify(missingModel)};\n`
  );
  for (const sourcePath of await listFiles(srcRoot)) {
    const relativeSource = relative(srcRoot, sourcePath).split(sep).join("/");
    if (relativeSource.endsWith(".d.ts")) continue;
    if (relativeSource.endsWith(".js")) {
      const source = await readFile(sourcePath, "utf8");
      targets.set(`SableBP/scripts/sable/${relativeSource}`, source);
      continue;
    }
    if (!relativeSource.endsWith(".ts")) continue;
    const outputPath = `SableBP/scripts/sable/${relativeSource.slice(0, -3)}.js`;
    const source = await readFile(sourcePath, "utf8");
    const { code } = await transform(source, { format: "esm", loader: "ts" });
    if (!code.trim()) continue;
    targets.set(outputPath, rewriteRegistrySpecifier(code, outputPath));
  }
}

function rewriteRegistrySpecifier(code: string, outputPath: string): string {
  if (!code.includes(REGISTRY_VIRTUAL_SPECIFIER)) return code;
  let specifier = posix.relative(posix.dirname(outputPath), REGISTRY_MODULE_PATH);
  if (!specifier.startsWith(".")) specifier = `./${specifier}`;
  return code
    .replaceAll(`"${REGISTRY_VIRTUAL_SPECIFIER}"`, `"${specifier}"`)
    .replaceAll(`'${REGISTRY_VIRTUAL_SPECIFIER}'`, `"${specifier}"`);
}

async function listFiles(root: string): Promise<string[]> {
  const result: string[] = [];
  let entries;
  try {
    entries = await readdir(root, { withFileTypes: true });
  } catch {
    return result;
  }
  for (const entry of entries) {
    const path = join(root, entry.name);
    if (entry.isDirectory()) result.push(...await listFiles(path));
    else if (entry.isFile()) result.push(path);
  }
  return result;
}

export async function writeSablePacks(
  packsRoot: string,
  srcRoot: string,
  models: readonly CompiledModel[],
  pools: readonly CompiledPool[],
  fixedTintPalette: readonly string[],
  compiledRegistry: CompiledRegistry
): Promise<void> {
  const targets = new Map<string, string | Buffer>();
  const clients: JsonObject[] = [];
  const controllers = new Map<string, JsonObject>();
  const geometries = new Map<string, JsonObject>();
  const rotations = new Map<string, readonly [number, number, number]>();
  const tintedModels = models.filter(model => model.material === "alpha_test_tint" || model.material === "opaque_tint");

  targets.set(
    "SableBP/entities/sable/sublevel/vanilla/block_carrier.json",
    jsonText(createCarrierEntity("sable:block_carrier", "block"))
  );
  targets.set(
    "SableBP/entities/sable/sublevel/vanilla/block.json",
    jsonText(createVanillaEntity())
  );
  targets.set(
    "SableBP/entities/sable/sublevel/fancy/fancy_model_carrier.json",
    jsonText(createCarrierEntity("sable:fancy_model_carrier", "fancy_model"))
  );
  targets.set("SableRP/entity/sable/sublevel/vanilla/block.json", jsonText(createVanillaClientEntity()));
  targets.set("SableRP/models/entity/sable/sublevel/vanilla/block.geo.json", jsonText(createVanillaGeometry()));
  targets.set("SableRP/animations/sable/sublevel/vanilla/block.animation.json", jsonText(createVanillaAnimation()));
  targets.set(
    "SableRP/render_controllers/sable/sublevel/vanilla/block.render_controllers.json",
    jsonText(createVanillaRenderController())
  );
  targets.set(
    "SableRP/animations/sable/sublevel/fancy/_shared/input.animation.json",
    jsonText({
      format_version: "1.8.0",
      animations: {
        "animation.sable.fancy.input": {
          loop: true,
          bones: { root: { scale: 1 } }
        }
      }
    })
  );

  for (const model of models) {
    for (const format of ["dense", "sparse"] as const) {
      // Surface foliage always uses sparse climate buckets in the layout.
      if (format === "dense" && model.model.type !== "full_block"
        && (model.tint?.method === "foliage" || model.tint?.method === "grass")) continue;
      const client = createFancyClientEntity(model, format);
      collectSharedModelResources(
        client,
        createFancyGeometry(model, format),
        createFancyAnimation(model, format),
        createFancyRenderController(model, format, tintedModels),
        targets,
        controllers,
        geometries
      );
      clients.push(client);
      const rotation = modelOrientation(model);
      if (rotation) rotations.set(format === "dense" ? model.denseEntityTypeId : model.sparseEntityTypeId, rotation);
    }
  }

  for (const pool of pools) {
    const client = createPoolClientEntity(pool);
    collectSharedModelResources(
      client,
      createPoolGeometry(pool),
      createPoolAnimation(pool),
      createPoolRenderController(pool),
      targets,
      controllers,
      geometries
    );
    clients.push(client);
  }

  const resources = collectGenericClients(clients, controllers, geometries, rotations, targets);

  targets.set("SableRP/textures/colormap/foliage_fixed.tga", fixedColormapTga(fixedTintPalette));
  collectTextTargets(resources, targets);

  await collectFunctionalResourceTargets(targets);
  collectDestructParticleTargets(models, targets);
  collectCollideParticleTargets(models, targets);

  await collectScriptTargets(srcRoot, toRuntimeRegistry(compiledRegistry, resources), toRuntimeModel(models[0]!, resources), targets);

  for (const [relativePath, content] of targets) {
    const path = join(packsRoot, relativePath);
    await mkdir(dirname(path), { recursive: true });
    for (let attempt = 0; ; attempt++) {
      try {
        await writeFile(path, content);
        break;
      } catch (error) {
        if (attempt >= 5) throw error;
        await new Promise(resolve => setTimeout(resolve, 100 * (attempt + 1)));
      }
    }
  }

  for (const root of CATEGORY_SKELETON_ROOTS) {
    for (const route of ["fancy", "vanilla"] as const) {
      for (const [group, children] of Object.entries(CATEGORY_TREE)) {
        for (const child of children) {
          await mkdir(join(packsRoot, root, route, group, child), { recursive: true });
        }
      }
    }
  }

  // Only stale files inside the tool's own subtrees are removed; everything
  // else in the packs belongs to other owners and stays untouched. Emptied
  // per-block folders go with their files; the category skeleton stays.
  const skeleton = new Set<string>();
  for (const root of CATEGORY_SKELETON_ROOTS) {
    for (const route of ["fancy", "vanilla"] as const) {
      skeleton.add(join(packsRoot, root));
      skeleton.add(join(packsRoot, root, route));
      for (const [group, children] of Object.entries(CATEGORY_TREE)) {
        skeleton.add(join(packsRoot, root, route, group));
        for (const child of children) skeleton.add(join(packsRoot, root, route, group, child));
      }
    }
  }
  for (const subtree of MANAGED_SUBTREES) {
    for (const path of await listFiles(join(packsRoot, subtree))) {
      const relativePath = relative(packsRoot, path).split(sep).join("/");
      if (!targets.has(relativePath)) await unlink(path);
    }
    await removeEmptyDirectories(join(packsRoot, subtree), skeleton);
  }
}

async function removeEmptyDirectories(root: string, keep: ReadonlySet<string>): Promise<boolean> {
  let entries;
  try {
    entries = await readdir(root, { withFileTypes: true });
  } catch {
    return false;
  }
  let empty = true;
  for (const entry of entries) {
    const path = join(root, entry.name);
    if (entry.isDirectory()) {
      if (!await removeEmptyDirectories(path, keep)) empty = false;
    } else {
      empty = false;
    }
  }
  if (!empty || keep.has(root)) return false;
  try {
    await rmdir(root);
    return true;
  } catch {
    return false;
  }
}
