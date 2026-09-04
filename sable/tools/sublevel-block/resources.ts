import { mkdir, readdir, readFile, rmdir, unlink, writeFile } from "node:fs/promises";
import { dirname, join, posix, relative, sep } from "node:path";
import { transform } from "esbuild";
import { CATEGORY_TREE, type CompiledModel, type CompiledPool } from "./registry.ts";
import {
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

function entityMaterials(): JsonObject {
  return {
    materials: {
      version: "1.0.0",
      "tint_multiply:alpha_block_color": {
        "+defines": ["USE_UV_ANIM"],
        "+states": ["Blending", "DisableDepthWrite", "DisableAlphaWrite"],
        depthFunc: "Equal",
        blendSrc: "DestColor",
        blendDst: "Zero",
        "+samplerStates": [
          { samplerIndex: 0, textureWrap: "Clamp", textureFilter: "Bilinear" }
        ]
      },
      "block_crack_multiply:alpha_block_color": {
        "+states": ["Blending", "DisableDepthWrite", "DisableAlphaWrite"],
        depthFunc: "LessEqual",
        blendSrc: "DestColor",
        blendDst: "Zero"
      },
      "block_outline:entity_emissive_alpha": {
        depthFunc: "Always"
      }
    }
  };
}

function jsonText(value: JsonObject): string {
  const rawNumberPattern = new RegExp(`"${rawJsonNumber(0).slice(0, -3)}(-?(?:\\d+(?:\\.\\d+)?))"`, "g");
  return JSON.stringify(value).replace(rawNumberPattern, "$1");
}

async function collectScriptTargets(
  srcRoot: string,
  runtimeRegistry: Record<string, unknown>,
  targets: Map<string, string | Buffer>
): Promise<void> {
  targets.set(
    REGISTRY_MODULE_PATH,
    `export const blockRegistry = ${JSON.stringify(runtimeRegistry)};\n`
  );
  for (const sourcePath of await listFiles(srcRoot)) {
    const relativeSource = relative(srcRoot, sourcePath).split(sep).join("/");
    if (!relativeSource.endsWith(".ts") || relativeSource.endsWith(".d.ts")) continue;
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
  runtimeRegistry: Record<string, unknown>
): Promise<void> {
  const targets = new Map<string, string | Buffer>();

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

  for (const model of models) {
    for (const format of ["dense", "sparse"] as const) {
      const directory = `fancy/${model.directory}`;
      const base = `${model.name}_${format}`;
      targets.set(
        `SableBP/entities/sable/sublevel/${directory}/${base}.json`,
        jsonText(createFancyEntity(format === "dense" ? model.denseEntityTypeId : model.sparseEntityTypeId))
      );
      targets.set(
        `SableRP/entity/sable/sublevel/${directory}/${base}.json`,
        jsonText(createFancyClientEntity(model, format))
      );
      targets.set(
        `SableRP/models/entity/sable/sublevel/${directory}/${base}.geo.json`,
        jsonText(createFancyGeometry(model, format))
      );
      targets.set(
        `SableRP/animations/sable/sublevel/${directory}/${base}.animation.json`,
        jsonText(createFancyAnimation(model, format))
      );
      targets.set(
        `SableRP/render_controllers/sable/sublevel/${directory}/${base}.render_controllers.json`,
        jsonText(createFancyRenderController(model, format))
      );
    }
  }

  for (const pool of pools) {
    const directory = `fancy/${pool.directory}`;
    const base = `pool_${pool.name}`;
    targets.set(
      `SableBP/entities/sable/sublevel/${directory}/${base}.json`,
      jsonText(createFancyEntity(pool.entityTypeId))
    );
    targets.set(
      `SableRP/entity/sable/sublevel/${directory}/${base}.json`,
      jsonText(createPoolClientEntity(pool))
    );
    targets.set(
      `SableRP/models/entity/sable/sublevel/${directory}/${base}.geo.json`,
      jsonText(createPoolGeometry(pool))
    );
    targets.set(
      `SableRP/animations/sable/sublevel/${directory}/${base}.animation.json`,
      jsonText(createPoolAnimation(pool))
    );
    targets.set(
      `SableRP/render_controllers/sable/sublevel/${directory}/${base}.render_controllers.json`,
      jsonText(createPoolRenderController(pool))
    );
  }

  targets.set("SableRP/materials/entity.material", jsonText(entityMaterials()));
  targets.set("SableRP/textures/colormap/foliage_fixed.tga", fixedColormapTga(fixedTintPalette));

  await collectFunctionalResourceTargets(targets);
  collectDestructParticleTargets(models, targets);

  await collectScriptTargets(srcRoot, runtimeRegistry, targets);

  for (const [relativePath, content] of targets) {
    const path = join(packsRoot, relativePath);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, content);
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
