import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { readAndCompileRegistry, toRuntimeRegistry, type CompiledModel } from "./sublevel-block-render/registry.ts";
import { writeSablePacks } from "./sublevel-block-render/resources.ts";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const registryPath = join(root, "src", "data", "sublevel-block.json");
const srcPath = join(root, "src");
const packsPath = join(root, "packs");

function missingModel(): CompiledModel {
  return {
    denseEntityTypeId: "sable:fancy_model_missing_dense",
    directory: "missing",
    key: "missing",
    material: "opaque",
    model: {
      type: "full_block",
      textures: {
        down: "textures/blocks/missing_tile",
        east: "textures/blocks/missing_tile",
        north: "textures/blocks/missing_tile",
        south: "textures/blocks/missing_tile",
        up: "textures/blocks/missing_tile",
        west: "textures/blocks/missing_tile"
      }
    },
    name: "missing",
    poolKey: "missing",
    sparseEntityTypeId: "sable:fancy_model_missing_sparse"
  };
}

const compiled = await readAndCompileRegistry(registryPath);
const models = [missingModel(), ...compiled.models];
await writeSablePacks(packsPath, srcPath, models, compiled.pools, compiled.fixedTintPalette, toRuntimeRegistry(compiled.compiled));
const declarationPath = join(root, "src", "generated", "sublevel-block-render-registry.d.ts");
await mkdir(dirname(declarationPath), { recursive: true });
if (!(await readFile(declarationPath, "utf8").catch(() => ""))) {
  await writeFile(declarationPath, `declare module "sable:sublevel-block-render-registry" {\n  export const blockRenderRegistry: import("../sublevel/render/fancy/model/FancySubLevelModel.js").CompiledBlockRenderRegistry;\n}\n`, "utf8");
}
console.log(`Sable sub-level render build complete: ${compiled.raw.blocks ? Object.keys(compiled.raw.blocks).length : 0} registrations, ${models.length} model resources.`);
