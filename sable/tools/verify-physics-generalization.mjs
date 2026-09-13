// Guards the sub-level physics layer against the tree-gameplay assumptions of
// the project it was migrated from. Sable's physics simulates whatever blocks a
// sub-level holds, so nothing under the physics paths may name a block, classify
// one by the shape of its type id, or reach into the render registry.
//
// Run: node sable/tools/verify-physics-generalization.mjs
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = join(root, "src");

// The directories the physics migration created outright.
const SCANNED_DIRECTORIES = [
  "api/physics",
  "physics",
  "sublevel/entity_collision",
  "sublevel/system/ticket",
  "content/entities_stick_sublevels",
  "content/impact",
  "content/dragging",
  "content/explosion",
  "content/piston",
  "data/vanilla/physics"
];
// Individual migrated modules inside directories sable already owned.
const SCANNED_FILES = [
  "SableConfig.ts",
  "api/SubLevelHelper.ts",
  "sublevel/ServerSubLevel.ts",
  "sublevel/system/SubLevelPhysicsDimension.ts",
  "sublevel/system/SubLevelPhysicsSystem.ts",
  "sublevel/system/SubLevelSpatialIndex.ts",
  "content/punching/SubLevelPunch.ts",
  "content/particle/SubLevelCollisionParticles.ts",
  "content/particle/SubLevelFluidEntryEffects.ts",
  "content/sublevel_sounds/SubLevelImpactSounds.ts",
  "util/LevelAccelerator.ts",
  "util/SableMathUtils.ts"
];

// Words that would carry the source project's gameplay domain into the engine.
const DOMAIN_WORDS = [
  "tree", "trees", "leaf", "leaves", "log", "logs",
  "contraption", "treephysics", "felling", "sapling"
];

// Fluids, air and the two entity ids physics legitimately names, plus the
// component ids the native API itself defines.
const ALLOWED_IDS = new Set([
  "minecraft:air", "minecraft:water", "minecraft:flowing_water",
  "minecraft:lava", "minecraft:flowing_lava", "minecraft:bubble_column",
  "minecraft:player", "minecraft:item",
  "minecraft:rideable", "minecraft:health", "minecraft:inventory"
]);

// Per-block data tables and the resolver over them exist to name blocks; the
// three modules below keep block ids the migration plan admits by name.
const DATA_EXEMPT = [
  "src/data/vanilla/",
  "src/api/physics/collider/block_shape/"
];
const ID_EXEMPT = [
  "src/content/piston/SubLevelPistonPhysics.ts",
  "src/content/particle/SubLevelCollisionParticles.ts",
  "src/api/physics/collider/SubLevelColliderIndex.ts"
];

const NAME_CLASSIFICATION =
  /\.endsWith\(["'](?:_leaves|_log|_logs|_wood|_stem|_hyphae|_sapling)["']\)|treeBlockKind|TreeBlockKind/;

function collect(entry) {
  const absolute = join(source, entry);
  let stats;
  try {
    stats = statSync(absolute);
  } catch {
    return [];
  }
  if (!stats.isDirectory()) return absolute.endsWith(".ts") ? [absolute] : [];
  return readdirSync(absolute, { withFileTypes: true }).flatMap(child =>
    collect(join(entry, child.name)));
}

const files = [...SCANNED_DIRECTORIES, ...SCANNED_FILES]
  .flatMap(collect)
  .filter(path => !path.endsWith(".d.ts"))
  .map(path => ({
    path,
    relativePath: relative(root, path).split("\\").join("/"),
    lines: readFileSync(path, "utf8").split(/\r?\n/)
  }));

test("the physics layer scan covers the migrated modules", () => {
  assert(files.length >= 60, `expected the physics scan to cover the migrated modules, found ${files.length}`);
});

test("no physics module carries the source project's gameplay vocabulary", () => {
  for (const file of files) {
    if (DATA_EXEMPT.some(prefix => file.relativePath.startsWith(prefix))) continue;
    for (const [index, line] of file.lines.entries()) {
      // A file header must cite the source path it was migrated from, and those
      // paths are the source project's own, so they carry its vocabulary.
      if (/^\s*(?:\/\/|\*|\/\*)/.test(line) && /\bTreePhysics\b|(?:^|\s)src\//.test(line)) continue;
      for (const word of DOMAIN_WORDS) {
        // Member access (Math.log, console.log) is not domain vocabulary.
        assert(
          !new RegExp(`(^|[^.\\w])${word}(?![\\w])`, "i").test(line),
          `${file.relativePath}:${index + 1} uses the domain word "${word}": ${line.trim()}`
        );
      }
      assert(
        !NAME_CLASSIFICATION.test(line),
        `${file.relativePath}:${index + 1} classifies a block by its type id: ${line.trim()}`
      );
    }
  }
});

test("physics modules name blocks only through the property tables", () => {
  for (const file of files) {
    if (DATA_EXEMPT.some(prefix => file.relativePath.startsWith(prefix))) continue;
    if (ID_EXEMPT.includes(file.relativePath)) continue;
    for (const [index, line] of file.lines.entries()) {
      for (const match of line.matchAll(/minecraft:[a-z0-9_.]+/g)) {
        assert(
          ALLOWED_IDS.has(match[0]),
          `${file.relativePath}:${index + 1} names the block ${match[0]} directly`
        );
      }
    }
  }
});

test("physics modules do not depend on the render registry or per-block content", () => {
  for (const file of files) {
    if (!file.relativePath.startsWith("src/api/physics/")
      && !file.relativePath.startsWith("src/physics/")
      && !file.relativePath.startsWith("src/sublevel/")) continue;
    for (const [index, line] of file.lines.entries()) {
      const target = line.match(/from\s+["']([^"']+)["']/)?.[1];
      if (!target) continue;
      assert(
        !/FancySubLevelModelRegistry|content\/blocks\//.test(target),
        `${file.relativePath}:${index + 1} imports per-block content: ${target}`
      );
    }
  }
});

test("physics modules use sable's relative .js import style", () => {
  for (const file of files) {
    for (const [index, line] of file.lines.entries()) {
      const target = line.match(/from\s+["']([^"']+)["']/)?.[1];
      if (!target) continue;
      assert(!target.startsWith("@src/"), `${file.relativePath}:${index + 1} uses a source-project alias: ${target}`);
      assert(
        !target.startsWith(".") || target.endsWith(".js"),
        `${file.relativePath}:${index + 1} omits the .js extension: ${target}`
      );
    }
  }
});

test("cannon-es stays inside the cannon implementation directory", () => {
  for (const file of files) {
    for (const [index, line] of file.lines.entries()) {
      const target = line.match(/from\s+["']([^"']+)["']/)?.[1];
      if (!target || !/cannon-es/.test(target)) continue;
      assert(
        file.relativePath.startsWith("src/physics/impl/cannon/"),
        `${file.relativePath}:${index + 1} imports cannon-es outside the cannon implementation`
      );
    }
  }
});
