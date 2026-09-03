import { access, mkdir, readdir, readFile, unlink, writeFile } from "node:fs/promises";
import { dirname, join, posix, relative, sep } from "node:path";
import { transform } from "esbuild";
import { CATEGORY_TREE, type CompiledModel } from "./registry.ts";
import {
  createCarrierEntity,
  createFancyClientEntity,
  createFancyEntity,
  createFancyGeometry,
  createFancyAnimation,
  createFancyRenderController,
  createVanillaAnimation,
  createVanillaClientEntity,
  createVanillaEntity,
  createVanillaGeometry,
  createVanillaRenderController
} from "./model-templates.ts";

type JsonObject = Record<string, unknown>;

// Deterministic 8x2 fixed foliage colormap (uniform samples address exact texels).
const FOLIAGE_FIXED_COLORMAP_TGA_BASE64 =
  "AAACAAAAAAAAAAAACAACACAoYdu2/2Hbtv9h27b/Ydu2/3aNh/92jYf/do2H/3aNh/9h27b/Ydu2/2Hbtv9h27b/do2H/3aNh/92jYf/do2H/w==";

const BP_UUID = "5bd1a5b8-6d6b-4c9f-9f31-33f2f5963501";
const RP_UUID = "d2e6a4d9-5f35-4d5f-8f9e-f8d3a6fb4d42";
const SCRIPT_UUID = "4b8a31c2-2f5d-49cf-a9ae-8c0ee4c4e31f";
const BP_MODULE_UUID = "d98f571c-aab0-4d20-9b91-b8e8ac52f0bc";
const RP_MODULE_UUID = "d6d7b1f9-c2b3-4d9a-8e14-3f4d8d4b5c21";

const REGISTRY_VIRTUAL_SPECIFIER = "sable:sublevel-block-render-registry";
const REGISTRY_MODULE_PATH = "SableBP/scripts/sable/generated/sublevel-block-render-registry.js";

// Every file the tool writes lives inside one of these subtrees (plus the
// individually named pack-level files below); nothing else is ever touched.
const MANAGED_SUBTREES = [
  "SableBP/entities/sable/sublevel",
  "SableBP/scripts/sable",
  "SableRP/entity/sable/sublevel",
  "SableRP/models/entity/sable/sublevel",
  "SableRP/animations/sable/sublevel",
  "SableRP/render_controllers/sable/sublevel"
] as const;

const CATEGORY_SKELETON_ROOTS = [
  "SableBP/entities/sable/sublevel",
  "SableRP/entity/sable/sublevel",
  "SableRP/models/entity/sable/sublevel",
  "SableRP/animations/sable/sublevel",
  "SableRP/render_controllers/sable/sublevel"
] as const;

function bpManifest(): JsonObject {
  return {
    format_version: 3,
    header: {
      name: "Sable Behavior",
      description: "Sable sub-level rendering",
      uuid: BP_UUID,
      version: [1, 0, 0],
      min_engine_version: [1, 20, 30]
    },
    modules: [
      { description: "Sable data", type: "data", uuid: BP_MODULE_UUID, version: [1, 0, 0] },
      { description: "Sable script", language: "javascript", type: "script", entry: "scripts/sable/Sable.js", uuid: SCRIPT_UUID, version: [1, 0, 0] }
    ],
    dependencies: [{ uuid: RP_UUID, version: [1, 0, 0] }, { module_name: "@minecraft/server", version: "2.8.0" }]
  };
}

function rpManifest(): JsonObject {
  return {
    format_version: 3,
    header: {
      name: "Sable Resources",
      description: "Sable sub-level rendering",
      uuid: RP_UUID,
      version: [1, 0, 0],
      min_engine_version: [1, 20, 30]
    },
    modules: [{ description: "Sable resources", type: "resources", uuid: RP_MODULE_UUID, version: [1, 0, 0] }],
    dependencies: [{ uuid: BP_UUID, version: [1, 0, 0] }]
  };
}

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
      }
    }
  };
}

function jsonText(value: JsonObject): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

async function collectScriptTargets(
  srcRoot: string,
  runtimeRegistry: Record<string, unknown>,
  targets: Map<string, string | Buffer>
): Promise<void> {
  targets.set(
    REGISTRY_MODULE_PATH,
    `export const blockRenderRegistry = ${JSON.stringify(runtimeRegistry)};\n`
  );
  for (const sourcePath of await listFiles(srcRoot)) {
    const relativeSource = relative(srcRoot, sourcePath).split(sep).join("/");
    if (!relativeSource.endsWith(".ts") || relativeSource.endsWith(".d.ts")) continue;
    const outputPath = `SableBP/scripts/sable/${relativeSource.slice(0, -3)}.js`;
    const source = await readFile(sourcePath, "utf8");
    const { code } = await transform(source, { format: "esm", loader: "ts" });
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

async function writeIfMissing(path: string, content: string): Promise<void> {
  try {
    await access(path);
  } catch {
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, content, "utf8");
  }
}

export async function writeSablePacks(
  packsRoot: string,
  srcRoot: string,
  models: readonly CompiledModel[],
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

  targets.set("SableRP/materials/entity.material", jsonText(entityMaterials()));
  targets.set(
    "SableRP/textures/colormap/foliage_fixed.tga",
    Buffer.from(FOLIAGE_FIXED_COLORMAP_TGA_BASE64, "base64")
  );

  await collectScriptTargets(srcRoot, runtimeRegistry, targets);

  for (const [relativePath, content] of targets) {
    const path = join(packsRoot, relativePath);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, content);
  }

  await writeIfMissing(join(packsRoot, "SableBP/manifest.json"), jsonText(bpManifest()));
  await writeIfMissing(join(packsRoot, "SableRP/manifest.json"), jsonText(rpManifest()));

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
  // else in the packs belongs to other owners and stays untouched.
  for (const subtree of MANAGED_SUBTREES) {
    for (const path of await listFiles(join(packsRoot, subtree))) {
      const relativePath = relative(packsRoot, path).split(sep).join("/");
      if (!targets.has(relativePath)) await unlink(path);
    }
  }
}
