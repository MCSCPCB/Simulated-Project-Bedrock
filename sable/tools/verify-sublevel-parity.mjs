import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import ts from "typescript";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const sable = join(root, "sable");
const baseline = join(root, ".sample/TreePhysics");
const json = path => {
  const result = ts.parseConfigFileTextToJson(path, readFileSync(path, "utf8"));
  if (result.error) throw new Error(`Invalid JSON: ${path}`);
  return result.config;
};

// Execute the actual source modules against a small native API fixture. The
// baseline is loaded independently, so parity assertions do not reuse Sable logic.
function moduleLoader(sourceRoot, server, overrides = {}) {
  const cache = new Map();
  function load(path) {
    path = resolve(path);
    const replacement = Object.entries(overrides).find(([key]) => resolve(sourceRoot, key) === path);
    if (replacement) return replacement[1];
    if (cache.has(path)) return cache.get(path).exports;
    const module = { exports: {} };
    cache.set(path, module);
    const source = readFileSync(path, "utf8");
    const code = ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
    }).outputText;
    const require = specifier => {
      if (specifier === "@minecraft/server") return server;
      if (specifier === "sable:sublevel-block-registry") {
        return load(join(sable, "packs/SableBP/scripts/sable/generated/sublevel-block-registry.js"));
      }
      const target = specifier.startsWith("@src/")
        ? join(sourceRoot, specifier.slice(5))
        : resolve(dirname(path), specifier);
      return load(existsSync(target) ? target : target.replace(/\.js$/, "") + ".ts");
    };
    new Function("require", "module", "exports", code)(require, module, module.exports);
    return module.exports;
  }
  return path => load(join(sourceRoot, path));
}

function fixture() {
  const entities = new Map();
  const queued = [];
  const signals = new Map();
  const events = new Proxy({}, { get: (_, key) => ({
    subscribe(callback) {
      const listeners = signals.get(key) ?? [];
      listeners.push(callback);
      signals.set(key, listeners);
    }
  }) });
  const system = {
    currentTick: 0, beforeEvents: events,
    run: callback => queued.push(callback), runTimeout: callback => queued.push(callback),
    runInterval() {}
  };
  const cells = new Map();
  const changes = [];
  const loot = [];
  const sounds = [];
  const particles = [];
  let nextId = 0;
  const permutation = (typeId, states = {}) => ({
    type: { id: typeId }, getAllStates: () => ({ ...states })
  });
  const dimension = {
    id: "minecraft:overworld",
    getBiome: () => ({ id: "minecraft:plains" }),
    getBlock(location) {
      const key = [location.x, location.y, location.z].map(Math.floor).join(",");
      if (!cells.has(key)) {
        const block = {
          location: { x: Math.floor(location.x), y: Math.floor(location.y), z: Math.floor(location.z) },
          dimension, isValid: true, permutation: permutation("minecraft:air"),
          get typeId() { return this.permutation.type.id; },
          get isAir() { return this.typeId === "minecraft:air"; },
          get isLiquid() { return false; },
          setType(typeId) { changes.push([key, typeId]); this.permutation = permutation(typeId); },
          setPermutation(value) { this.permutation = value; }, getComponent() {}
        };
        cells.set(key, block);
      }
      return cells.get(key);
    },
    getEntities: () => [...entities.values()].filter(entity => entity.isValid),
    spawnEntity(typeId, location) {
      const slots = new Map();
      const inventory = {
        size: 27, getItem: slot => slots.get(slot), setItem: (slot, item) => slots.set(slot, item)
      };
      const entity = {
        id: String(++nextId), typeId, dimension, location: { ...location }, isValid: true,
        properties: {}, molang: {}, dynamic: {}, riders: [], vehicle: undefined, commands: [], events: [],
        setProperty(key, value) { this.properties[key] = value; },
        getProperty(key) { return this.properties[key] ?? 0; },
        playAnimation(animation, options = {}) {
          this.lastAnimation = animation;
          this.animationOptions = options;
          this.animationWrites = (this.animationWrites ?? 0) + 1;
          const expression = options.stopExpression ?? "";
          for (const match of expression.matchAll(/v\.([A-Za-z0-9_]+)\s*=\s*(-?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?);/g)) {
            this.molang[match[1]] = Number(match[2]);
          }
        },
        setDynamicProperty(key, value) { this.dynamic[key] = value; },
        getDynamicProperty(key) { return this.dynamic[key]; },
        teleport(value) { this.location = { ...value }; }, triggerEvent(name) { this.events.push(name); },
        runCommand(command) { this.commands.push(command); }, addTag() { return true; },
        remove() {
          this.vehicle?.getComponent("minecraft:rideable").ejectRider(this);
          for (const rider of [...this.riders]) this.getComponent("minecraft:rideable").ejectRider(rider);
          this.isValid = false;
        },
        kill() { this.remove(); return true; },
        getComponent(name) {
          if (name === "minecraft:inventory") return { container: inventory };
          if (name === "minecraft:riding") return this.vehicle ? { entityRidingOn: this.vehicle } : undefined;
          if (name !== "minecraft:rideable") return undefined;
          return {
            getRiders: () => this.riders,
            addRider: rider => {
              if (this.riders.length >= 512) return false;
              rider.vehicle?.getComponent(name).ejectRider(rider);
              this.riders.push(rider); rider.vehicle = this; return true;
            },
            ejectRider: rider => {
              this.riders = this.riders.filter(value => value !== rider);
              rider.vehicle = undefined;
            }
          };
        }
      };
      entities.set(entity.id, entity);
      return entity;
    },
    playSound(...args) { sounds.push(args); }, spawnItem() {},
    spawnParticle(...args) { particles.push(args); }
  };
  const server = {
    system,
    world: {
      beforeEvents: events, afterEvents: events,
      getDimension: () => dimension, getEntity: id => entities.get(id), getAllPlayers: () => [],
      getLootTableManager: () => ({ generateLootFromBlockPermutation: (value, tool) => {
        loot.push([value.type.id, tool]); return [];
      } })
    },
    BlockPermutation: { resolve: permutation },
    BlockTypes: { get: typeId => ({ id: typeId }) },
    ItemTypes: { get: typeId => ({ id: typeId }) },
    GameMode: { Creative: "creative", Survival: "survival", Spectator: "spectator", Adventure: "adventure" },
    InputMode: { Touch: "touch", KeyboardAndMouse: "keyboard", Gamepad: "gamepad" },
    EntitySwingSource: { Mine: "mine", Attack: "attack", Build: "build", Interact: "interact", None: "none" },
    InputButton: { Sneak: "sneak" },
    MolangVariableMap: class { values = {}; setFloat(key, value) { this.values[key] = value; } }
  };
  const load = moduleLoader(join(sable, "src"), server);
  const reference = moduleLoader(join(baseline, "src"), server);
  const flush = () => { system.currentTick++; const current = queued.splice(0); current.forEach(callback => callback()); };
  return { load, reference, dimension, entities, cells, system, server, changes, loot, sounds, particles, flush, permutation, signals };
}

const block = (typeId, x = 0, y = 0, z = 0, states = {}) => ({ typeId, localLocation: { x, y, z }, states });

// TreePhysics stores bee-nest X-facing states in the opposite order because
// its attachment projection uses the inverse horizontal model basis. Sable's
// model projection keeps the world Z inversion but uses its own X basis, so
// only the two X-facing state values are swapped when constructing a
// TreePhysics comparison fixture.
const treePhysicsComparableEntry = entry => {
  if (entry.typeId !== "minecraft:bee_nest") return entry;
  const direction = entry.states?.direction;
  if (direction !== 1 && direction !== 3) return entry;
  return { ...entry, states: { ...entry.states, direction: 4 - direction } };
};

const body = {
  isValid: true, getRotation: () => ({ x: 0, y: 0, z: 0 }),
  localPointToWorld: value => ({ ...value })
};

function managedFixture() {
  const f = fixture();
  const { SubLevelInteractionSystem } = f.load("sublevel/system/SubLevelInteractionSystem.ts");
  const { SubLevelBlockBehaviorRegistry } = f.load("api/block/SubLevelBlockBehaviors.ts");
  const { SubLevelContainerInteractionController } = f.load("content/assembly/SubLevelContainerInteraction.ts");
  const { ServerSubLevelContainer } = f.load("api/sublevel/ServerSubLevelContainer.ts");
  const containers = new SubLevelContainerInteractionController();
  const behaviors = new SubLevelBlockBehaviorRegistry();
  const saved = new Map();
  const storage = {
    fail: false, listSubLevelIds: () => [...saved.keys()], loadSubLevel: id => saved.get(id),
    saveSubLevel(id, value) { if (this.fail) return false; saved.set(id, { id, ...value }); return true; },
    deleteSubLevel(id) { if (this.fail) return false; saved.delete(id); return true; }
  };
  const runtime = new SubLevelInteractionSystem();
  const manager = new ServerSubLevelContainer(runtime, behaviors, containers, storage);
  f.load("content/blocks/vanilla/chest/ChestSubLevelBehavior.ts").registerChestSubLevelBehavior({
    behaviors, containers,
    onNativeDeath: (owner, binding) => manager.handleContainerNativeDeath(owner, binding)
  });
  return { ...f, manager, containers, behaviors, storage, saved, runtime };
}

test("functional resource definitions retain baseline properties, geometry and animations", () => {
  const pairs = [];
  for (const name of ["block_outline", "block_crack"]) {
    pairs.push([`TreePhysicsBP/entities/functional_entities/${name}.json`, `SableBP/entities/sable/sublevel/functional_entities/${name}.json`]);
    for (const [dir, extension] of [["entity", ".json"], ["models/entity", ".geo.json"], ["animations", ".animation.json"], ["render_controllers", ".render_controllers.json"]]) {
      pairs.push([`TreePhysicsRP/${dir}/functional_entities/${name}${extension}`, `SableRP/${dir}/sable/sublevel/functional_entities/${name}${extension}`]);
    }
  }
  pairs.push(["TreePhysicsBP/entities/block_entities/chest.json", "SableBP/entities/sable/sublevel/block_entities/chest.json"]);
  pairs.push(["TreePhysicsBP/blocks/functional_blocks/interaction_target.json", "SableBP/blocks/sable/sublevel/functional_blocks/interaction_target.json"]);
  for (const [source, target] of pairs) {
    const expected = JSON.parse(JSON.stringify(json(join(baseline, "packs/TreePhysics", source))).replaceAll("treephysics", "sable"));
    const family = expected["minecraft:entity"]?.components["minecraft:type_family"].family;
    if (family?.[0] === "fragment") family[0] = source.endsWith("/chest.json") ? "sable_persistent_rider" : "fancy_model";
    assert.deepEqual(json(join(sable, "packs", target)), expected, target);
  }
});

test("all generated geometries have unique bones and consistent shared rest transforms", () => {
  const pack = join(sable, "packs/SableRP");
  const folder = join(pack, "entity/sable/sublevel/fancy");
  const reader = modelResourceReader(pack, "sable/sublevel/fancy");
  for (const file of readdirSync(folder, { recursive: true }).filter(file => file.endsWith(".json"))) {
    const client = json(join(folder, file))["minecraft:client_entity"].description;
    const resources = reader({ typeId: client.identifier });
    const rest = new Map();
    for (const identifier of new Set(Object.values(client.geometry))) {
      const geometry = resources.geometries.get(identifier);
      assert(geometry, `${file}: missing ${identifier}`);
      const names = new Set();
      for (const bone of geometry.bones) {
        assert(!names.has(bone.name), `${file}: duplicate ${bone.name}`);
        names.add(bone.name);
        const transform = { parent: bone.parent, pivot: bone.pivot, rotation: bone.rotation };
        if (rest.has(bone.name)) assert.deepEqual(transform, rest.get(bone.name), `${file}: conflicting ${bone.name}`);
        else rest.set(bone.name, transform);
      }
    }
  }
});

test("shared resources resolve every client alias without duplicate or unused definitions", () => {
  const pack = join(sable, "packs/SableRP");
  const folder = join(pack, "entity/sable/sublevel/fancy");
  const resources = modelResourceIndex(pack);
  const referenced = new Set();
  for (const file of readdirSync(folder, { recursive: true }).filter(file => file.endsWith(".json"))) {
    const client = json(join(folder, file))["minecraft:client_entity"].description;
    for (const identifier of Object.values(client.geometry)) {
      assert(resources.geometries.has(identifier), `${file}: missing ${identifier}`);
      referenced.add(identifier);
    }
    for (const identifier of Object.values(client.animations)) {
      assert(resources.animations[identifier], `${file}: missing ${identifier}`);
      referenced.add(identifier);
    }
    for (const entry of client.render_controllers) {
      const identifier = typeof entry === "string" ? entry : Object.keys(entry)[0];
      const controller = resources.controllers[identifier];
      assert(controller, `${file}: missing ${identifier}`);
      referenced.add(identifier);
      for (const [, kind, alias] of JSON.stringify(controller).matchAll(/\b(Geometry|Texture|Material)\.(\w+)/g)) {
        const field = { Geometry: "geometry", Texture: "textures", Material: "materials" }[kind];
        assert(client[field][alias], `${file}: unbound ${kind}.${alias}`);
      }
    }
  }
  const canonical = value => Array.isArray(value) ? value.map(canonical)
    : value && typeof value === "object" ? Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])])) : value;
  for (const definitions of [resources.geometries, new Map(Object.entries(resources.animations)), new Map(Object.entries(resources.controllers))]) {
    const unique = new Map();
    for (const [identifier, definition] of definitions) {
      if (!identifier.includes(".sable_shared_")) continue;
      assert(referenced.has(identifier), `unused ${identifier}`);
      const content = structuredClone(definition);
      if (content.description) delete content.description.identifier;
      const signature = JSON.stringify(canonical(content));
      assert(!unique.has(signature), `duplicate content: ${unique.get(signature)} and ${identifier}`);
      unique.set(signature, identifier);
    }
  }
});

test("grass uses ordinary cube faces and an exact, unshifted grass-only multiply shell", () => {
  const pack = join(sable, "packs/SableRP");
  const reader = modelResourceReader(pack, "sable/sublevel/fancy");
  const f = fixture();
  const registry = f.load("sublevel/render/fancy/model/FancySubLevelModelRegistry.ts");
  const resolved = registry.resolveFancySubLevelBlock(block("minecraft:grass_block"));
  const texture = readFileSync(join(root, ".sample/VanillaBlock/VanillaBlockResource/bedrock-sample-1.26.40.5/resource_pack/textures/blocks/grass_side.tga"));
  assert.equal(texture[2], 2);
  assert.equal(texture.readUInt16LE(12), 16);
  assert.equal(texture.readUInt16LE(14), 16);
  assert.equal(texture[16], 32);
  const alpha = Array.from({ length: 256 }, (_, i) => {
    const row = texture[17] & 32 ? Math.floor(i / 16) : 15 - Math.floor(i / 16);
    return Number(texture[18 + texture[0] + (row * 16 + i % 16) * 4 + 3] > 0);
  });
  const material = json(join(pack, "materials/entity.material")).materials["tint_multiply:alpha_block_color"];
  assert.equal(material.depthFunc, "Equal");
  assert.deepEqual([material.blendSrc, material.blendDst], ["DestColor", "Zero"]);
  for (const format of ["dense", "sparse"]) {
    const resource = resolved.model[format];
    const entity = {
      typeId: resource.entityTypeId,
      molang: { model_variant: resource.variant, s0: 1, tint_input: 7 * 1048576, origin_y: 2048 },
      getProperty: () => 0
    };
    const resources = reader(entity);
    const { client, geometries } = resources;
    const passes = activeRenderPasses(entity, resources);
    const bases = passes.filter(({ controller, evaluate, arrays }) => evaluate(controller.materials[0]["*"], arrays) !== "tint_multiply");
    const baseFaces = [];
    for (const { controller, evaluate, arrays } of bases) {
      const bone = geometries.get(evaluate(controller.geometry, arrays)).bones.find(bone => bone.name === "slot_0");
      assert.equal(bone.cubes.length, 1);
      assert.deepEqual(bone.cubes[0].origin, [-8, -24, -8]);
      assert.deepEqual(bone.cubes[0].size, [16, 16, 16]);
      baseFaces.push(...Object.keys(bone.cubes[0].uv));
    }
    assert.deepEqual(baseFaces.sort(), ["down", "east", "north", "south", "up", "west"]);
    const aliases = format === "dense" ? ["colormap_x", "colormap_z", "colormap_compact_x", "colormap_compact_z"] : ["tint"];
    for (const alias of aliases) {
      const width = alias.includes("compact") ? 6 : 7;
      entity.molang.origin_y = 2048 + (width - 1) * 4096 + (width - 1) * 131072;
      entity.molang.tint_input = (alias.endsWith("_z") ? 9 : 1) * 1048576;
      const pass = activeRenderPasses(entity, resources).find(({ controller, evaluate, arrays }) => (
        evaluate(controller.materials[0]["*"], arrays) === "tint_multiply"
      ));
      assert.equal(pass.evaluate(pass.controller.textures[0], pass.arrays), "textures/colormap/grass");
      const shell = geometries.get(pass.evaluate(pass.controller.geometry, pass.arrays));
      const slotBones = shell.bones.filter(bone => bone.cubes);
      assert.equal(slotBones.length, format === "sparse" ? 26 : alias.includes("compact") ? 180 : 245);
      for (const bone of [slotBones[0], slotBones.at(-1)]) {
        assert.match(bone.name, /^slot_\d+$/);
        assert.equal(bone.parent, "model_offset");
        assert.deepEqual(bone.pivot, [0, -16, 0]);
        const coverage = Object.fromEntries(baseFaces.map(face => [face, Array(256).fill(0)]));
        for (const cube of bone.cubes) {
          assert.equal(cube.inflate, undefined);
          const [face, uv] = Object.entries(cube.uv)[0];
          assert.equal(Object.keys(cube.uv).length, 1);
          const [x, y, z] = cube.origin;
          const [dx, dy, dz] = cube.size;
          let u, v, width, height;
          if (face === "up") {
            assert.equal(y + dy, -8);
            [u, v, width, height] = [x + 8, z + 8, dx, dz];
          } else {
            assert.notEqual(face, "down");
            const plane = { north: z, south: z + dz, west: x, east: x + dx }[face];
            assert.equal(plane, face === "north" || face === "west" ? -8 : 8);
            u = { north: x + 8, south: 8 - x - dx, west: 8 - z - dz, east: z + 8 }[face];
            [v, width, height] = [-8 - y - dy, face === "north" || face === "south" ? dx : dz, dy];
          }
          if (format === "sparse") assert.deepEqual(uv, { uv: [u, v], uv_size: [width, height] });
          for (let row = v; row < v + height; row++) for (let column = u; column < u + width; column++) {
            assert(row >= 0 && row < 16 && column >= 0 && column < 16);
            coverage[face][row * 16 + column]++;
          }
        }
        for (const face of baseFaces) {
          const expected = face === "up" ? Array(256).fill(1) : face === "down" ? Array(256).fill(0) : alpha;
          assert.deepEqual(coverage[face], expected, `${format}/${alias}/${bone.name}/${face}`);
        }
      }
    }
    for (let slot = 0; slot < 26; slot++) entity.molang[`s${slot}`] = 1;
    const tintControllers = activeRenderPasses(entity, resources)
      .filter(({ controller, evaluate, arrays }) => evaluate(controller.materials[0]["*"], arrays) === "tint_multiply");
    assert.equal(tintControllers.length, format === "dense" ? 1 : 26);
    for (const { controller, evaluate, arrays } of tintControllers) assert.equal(evaluate(controller.textures[0], arrays), "textures/colormap/grass");
    for (const occupied of [0, 1]) {
      const evaluate = resourceEvaluator({
        molang: { model_variant: resource.variant, s0: occupied, tint_input: 7 * 1048576, origin_y: 2048 },
        getProperty: () => 0
      }, client);
      const visibility = Object.assign({}, ...tintControllers[0].controller.part_visibility);
      assert.equal(Boolean(evaluate(visibility.slot_0)), occupied === 1);
    }
  }
  assert.equal(resolved.model.description.type, "full_block");
  const particles = f.load("content/particle/SubLevelBlockParticleEffects.ts");
  assert.equal(particles.destructParticleTexture(resolved.model.description), "textures/blocks/dirt");
  const layout = f.load("sublevel/render/fancy/model/FancySubLevelModelLayout.ts");
  assert(layout.packFancySubLevelModels([resolved]).models.every(model => model.format === "dense"));
  const leafModel = registry.resolveFancySubLevelBlock(block("minecraft:oak_leaves")).model.dense;
  const leaves = reader({ typeId: leafModel.entityTypeId }).client;
  assert(Object.values(leaves.materials).includes("tint_multiply"));
});

test("grid hit distance, face and starting-cell semantics match the baseline", () => {
  const f = fixture();
  const actual = f.load("content/raycast/SubLevelGridRaycast.ts").raycastSubLevelGrid;
  const expected = f.reference("physics/contraption/GridRaycast.ts").raycastContraptionGrid;
  const at = (x, y, z) => (x * 13 + y * 7 + z * 3) % 5 === 0 ? block("minecraft:stone", x, y, z) : undefined;
  for (let i = 0; i < 400; i++) {
    const origin = { x: i % 9 - 4.5, y: i % 7 - 3, z: i % 5 - 2 };
    const direction = { x: i % 3 - 1, y: i % 5 - 2, z: i % 7 - 3 };
    for (const skipContainingCell of [true, false]) {
      assert.deepEqual(actual(at, origin, direction, 5, { skipContainingCell }), expected(at, origin, direction, 5, { skipContainingCell }));
    }
  }
});

test("mining speed, shared progress and touch deduplication match the baseline", () => {
  const f = fixture();
  const speed = f.load("content/punching/SubLevelMiningTime.ts");
  const expectedSpeed = f.reference("content/tree/felling/Speed.ts");
  for (const hardness of [0.2, 0.3, 1, 2, 2.5, 5]) {
    for (const typeId of [undefined, "minecraft:wooden_axe", "minecraft:copper_axe", "minecraft:diamond_axe", "minecraft:golden_axe"]) {
      for (const efficiencyLevel of [0, 1, 3, 5]) {
        assert.equal(speed.getVanillaBlockBreakTicks(hardness, { typeId, efficiencyLevel }), expectedSpeed.getVanillaBlockBreakTicks(hardness, { typeId, efficiencyLevel }));
      }
    }
  }
  const actual = new (f.load("content/punching/SubLevelMiningProgress.ts").SubLevelMiningProgress)();
  const expected = new (f.reference("content/tree/felling/MiningProgress.ts").MiningProgress)();
  for (let tick = 0; tick < 100; tick++) {
    for (const input of [{ type: "attack" }, { type: "touch", playerId: "a" }, { type: "touch", playerId: "b" }]) {
      assert.deepEqual(actual.advance("1|0,0,0", tick * 3, 75, input), expected.advance("1|0,0,0", tick * 3, 75, input));
    }
  }
});

test("biome sampling includes the same fixed and climate tinted foliage", () => {
  const f = fixture();
  const capture = f.load("render/dynamic_biome/DynamicBiomeTintSampler.ts").captureSubLevelFoliageTint;
  const expected = f.reference("content/tree/foliage/TintSampling.ts").captureTreeFoliageTint;
  const blocks = [block("minecraft:oak_leaves"), block("minecraft:birch_leaves", 8, 3, 8), block("minecraft:spruce_leaves", 2, 7, 1), block("minecraft:cherry_leaves", -9, 1, -9)];
  const origin = { x: 14, y: 62, z: 0 };
  for (const biome of ["minecraft:swamp", "minecraft:plains", "minecraft:cherry_grove", "minecraft:pale_garden"]) {
    f.dimension.getBiome = location => ({ id: location.x > 18 ? biome : "minecraft:forest" });
    const snapshots = blocks.map(entry => ({ ...entry, kind: "leaf", location: { x: origin.x + entry.localLocation.x, y: origin.y + entry.localLocation.y, z: origin.z + entry.localLocation.z } }));
    assert.deepEqual(capture(f.dimension, blocks, origin), expected(f.dimension, snapshots, origin));
  }
});

test("registered block hardness matches every editable baseline block", () => {
  const f = fixture();
  const registry = f.load("sublevel/render/fancy/model/FancySubLevelModelRegistry.ts");
  const definitions = json(join(sable, "src/data/sublevel-block.json")).blocks;
  const kinds = f.reference("content/tree/block/Blocks.ts");
  const expected = f.reference("content/tree/felling/MiningTime.ts");
  const actual = f.load("content/punching/SubLevelMiningTime.ts");
  for (const typeId of Object.keys(definitions)) {
    const kind = kinds.playerEditableContraptionBlockKind(typeId);
    if (kind === undefined) continue;
    assert.equal(actual.getSubLevelMiningTargetTicks(registry.getSubLevelBlockRegistration(typeId)?.hardness ?? 1), expected.getTreeMiningTargetTicks(kind, typeId), typeId);
  }
});

test("leaf packing and climate quantization retain standard and compact footprints", () => {
  const f = fixture();
  const registry = f.load("sublevel/render/fancy/model/FancySubLevelModelRegistry.ts");
  const actual = f.load("sublevel/render/fancy/model/FancySubLevelModelLayout.ts");
  const expected = f.reference("render/contraption/fragment/FragmentLayout.ts");
  const tint = f.load("sublevel/render/fancy/model/FancySubLevelTintCodec.ts");
  const referenceTint = f.reference("render/foliage/TintCodec.ts");
  for (const width of [1, 5, 6, 7, 11, 13]) {
    const blocks = [];
    for (let x = -2; x < width - 2; x++) for (let z = 0; z < width; z++) {
      blocks.push(block("minecraft:oak_leaves", x, (x + z + 2) % 3, z));
    }
    const sourceBlocks = blocks.map(entry => ({ ...entry, visual: { renderer: "leaf_fragment", family: 0, state: 1 } }));
    const packed = actual.packFancySubLevelModels(blocks.map(registry.resolveFancySubLevelBlock)).models;
    const referencePacked = expected.packFragments(sourceBlocks);
    assert.equal(packed.length, referencePacked.length, `width ${width}`);
    for (const fragment of referencePacked) {
      const keys = fragment.assignments.map(entry => entry.blockKey).sort();
      const model = packed.find(entry => entry.assignments.some(assignment => assignment.blockKey === keys[0]));
      assert.deepEqual(model.assignments.map(entry => entry.blockKey).sort(), keys);
      assert.deepEqual(model.anchorLocalLocation, fragment.anchorLocalLocation);
      for (const axis of ["x", "z"]) {
        const field = { gradientAxis: axis, mapKind: 1, uAtLocalOrigin: 0.25, uPerLocalX: 0.018, vAtLocalOrigin: 0.43, vPerLocalZ: -0.009 };
        assert.equal(tint.packFancySubLevelTint(model, field), referenceTint.packFragmentFoliageTint(fragment, field));
      }
    }
  }
});

test("restored model geometry retains baseline cube UVs and child transforms", () => {
  const library = json(join(sable, "src/data/reference/model-geometry.json"));
  const geos = ["fragments/tree/log_fragment", "fragments/tree/attachment_fragment", "fragments/cube_fragment_0"]
    .flatMap(file => json(join(baseline, `packs/TreePhysics/TreePhysicsRP/models/entity/${file}.geo.json`))["minecraft:geometry"]);
  const subtree = geometry => {
    const names = new Set(["slot_0"]);
    return geometry.bones.filter(bone => {
      if (!names.has(bone.name) && !names.has(bone.parent)) return false;
      names.add(bone.name); return true;
    }).map((bone, index) => ({
      ...bone, name: index,
      parent: index === 0 ? undefined : geometry.bones.filter(bone => names.has(bone.name)).findIndex(parent => parent.name === bone.parent),
      pivot: index === 0 ? [0, -16, 0] : bone.pivot
    }));
  };
  const candidates = geos.map(subtree);
  for (const [type, variants] of Object.entries(library)) for (const [variant, definition] of Object.entries(variants)) {
    for (const [channel, value] of Object.entries(definition.channels)) {
      const geometry = { bones: value.bones.map(bone => ({
        ...bone, name: bone.name.replaceAll("{s}", "0"), parent: bone.parent?.replaceAll("{s}", "0")
      })) };
      const actual = subtree(geometry);
      assert(candidates.some(expected => {
        try { assert.deepEqual(actual, expected); return true; } catch { return false; }
      }), `${type}/${variant}/${channel} differs from baseline geometry`);
    }
  }
});

test("ordinary renderers carry and rotate outlines, and empty mixed routes remain intact", () => {
  const f = fixture();
  const renderer = f.load("sublevel/render/SubLevelRenderer.ts").SubLevelRenderer;
  for (const blocks of [[block("minecraft:stone")], [block("minecraft:stone"), block("minecraft:oak_log", 1)]]) {
    const data = renderer.createRenderData({ body, dimension: f.dimension, blocks });
    f.flush();
    const outline = f.dimension.spawnEntity("sable:block_outline", { x: 0, y: 0, z: 0 });
    assert.equal(data.attachAuxiliaryRider(outline), true);
    assert(outline.vehicle);
    assert.deepEqual(outline.properties, { "sable:pitch": 0, "sable:yaw": 0, "sable:roll": 0 });
    data.removeBlocks(new Set(["1,0,0"]));
    assert.equal(data.hasIntactEntities(), true);
    data.remove();
    assert.equal(outline.isValid, false);
  }
});

test("capture does not remove source blocks when rendering fails", () => {
  const f = managedFixture();
  const source = f.dimension.getBlock({ x: 0, y: 0, z: 0 });
  source.setType("minecraft:oak_log");
  f.dimension.spawnEntity = () => { throw new Error("spawn failure"); };
  assert.throws(() => f.manager.createSubLevelFromRegion(f.dimension, source.location, source.location), /spawn failure/);
  assert.equal(source.typeId, "minecraft:oak_log");
});

test("capture removes attachments before foliage and structural supports", () => {
  const f = managedFixture();
  for (const entry of [block("minecraft:oak_log"), block("minecraft:oak_leaves", 0, 1), block("minecraft:vine", 1, 1, 0, { vine_direction_bits: 2 })]) {
    f.dimension.getBlock(entry.localLocation).setPermutation(f.permutation(entry.typeId, entry.states));
  }
  f.manager.createSubLevelFromRegion(f.dimension, { x: 0, y: 0, z: 0 }, { x: 1, y: 1, z: 0 });
  assert.deepEqual(f.changes.map(entry => entry[0]), ["1,1,0", "0,1,0", "0,0,0"]);
});

test("mined target keeps its tool when it was not the first captured block", () => {
  const f = managedFixture();
  const blocks = [block("minecraft:vine", 0, 0, 0, { vine_direction_bits: 1 }), block("minecraft:oak_log", 0, 0, 1)];
  const managed = f.manager.createSubLevel(f.dimension, { x: 0, y: 0, z: 0 }, blocks);
  const tool = { typeId: "minecraft:diamond_axe" };
  assert(f.manager.breakBlockForPlayerEdit({}, tool, managed.handle, blocks[1]));
  assert.deepEqual(f.loot, [["minecraft:oak_log", tool], ["minecraft:vine", undefined]]);
});

test("failed persistence leaves the live block and effects untouched", () => {
  const f = managedFixture();
  const target = block("minecraft:oak_log");
  const managed = f.manager.createSubLevel(f.dimension, { x: 0, y: 0, z: 0 }, [target]);
  f.storage.fail = true;
  assert.throws(() => f.manager.breakBlockForPlayerEdit({}, undefined, managed.handle, target), /delete/);
  assert.equal(managed.blockCount, 1);
  assert.equal(f.loot.length, 0);
});

test("placement can cross between registered models and the ordinary render route", () => {
  const f = managedFixture();
  const target = block("minecraft:oak_log");
  const managed = f.manager.createSubLevel(f.dimension, { x: 0, y: 0, z: 0 }, [target]);
  assert(f.manager.placeBlockForPlayerEdit({}, { typeId: "minecraft:stone" }, managed.handle, target, { x: 1, y: 0, z: 0 }, "north"));
  assert.equal(managed.blockCount, 2);
  f.flush();
  assert(managed.handle.renderData.hasIntactEntities());
});

test("vanilla item rendering applies the default quarter-turn only without explicit rotation", () => {
  const f = fixture();
  const wrapper = f.load("sublevel/render/vanilla/SingleBlockSubLevelWrapper.ts");
  const body = { localPointToWorld: value => ({ ...value }) };
  const unrotated = block("minecraft:stone");
  const defaultEntity = wrapper.createBlockRenderPair(f.dimension, body, { x: 0, y: 0, z: 0 }, unrotated, undefined, []);
  assert.equal(defaultEntity.getProperty("sable:local_yaw"), 90);

  const explicitlyRotated = { ...block("minecraft:chest"), rotation: { x: 0, y: 180, z: 0 } };
  const explicitEntity = wrapper.createBlockRenderPair(f.dimension, body, { x: 0, y: 0, z: 0 }, explicitlyRotated, undefined, []);
  assert.equal(explicitEntity.getProperty("sable:local_yaw"), 180);
});

test("placement preserves vanilla facing, pillar axis and the creation foliage anchor", () => {
  const f = managedFixture();
  const target = block("minecraft:oak_log");
  const managed = f.manager.createSubLevel(f.dimension, { x: 0, y: 0, z: 0 }, [target]);
  const previousResolve = f.server.BlockPermutation.resolve;
  f.server.BlockPermutation.resolve = (typeId) => previousResolve(
    typeId,
    typeId === "minecraft:chest"
      ? { "minecraft:cardinal_direction": "south" }
      : typeId === "minecraft:anvil"
        ? { "minecraft:cardinal_direction": "south" }
      : typeId === "minecraft:chiseled_bookshelf"
        ? { "minecraft:direction": 0, books_stored: 0 }
        : typeId === "minecraft:oak_log"
          ? { "minecraft:pillar_axis": "y" }
          : { "minecraft:distance": 7 }
  );
  assert(f.manager.placeBlockForPlayerEdit(
    {}, { typeId: "minecraft:chest" }, managed.handle, target,
    { x: 1, y: 0, z: 0 }, "south", "east"
  ));
  assert.equal(
    managed.handle.getBlockAtLocalLocation({ x: 1, y: 0, z: 0 }).states["minecraft:cardinal_direction"],
    "north"
  );
  assert(f.manager.placeBlockForPlayerEdit(
    {}, { typeId: "minecraft:anvil" }, managed.handle, target,
    { x: 2, y: 0, z: 0 }, "south", "up"
  ));
  assert.equal(
    managed.handle.getBlockAtLocalLocation({ x: 2, y: 0, z: 0 }).states["minecraft:cardinal_direction"],
    "east"
  );
  assert(f.manager.placeBlockForPlayerEdit(
    {}, { typeId: "minecraft:chiseled_bookshelf" }, managed.handle, target,
    { x: 3, y: 0, z: 0 }, "north", "up"
  ));
  assert.equal(
    managed.handle.getBlockAtLocalLocation({ x: 3, y: 0, z: 0 }).states["minecraft:direction"],
    0
  );
  assert(f.manager.placeBlockForPlayerEdit(
    {}, { typeId: "minecraft:oak_log" }, managed.handle, target,
    { x: 0, y: 1, z: 0 }, "south", "east"
  ));
  assert.equal(
    managed.handle.getBlockAtLocalLocation({ x: 0, y: 1, z: 0 }).states["minecraft:pillar_axis"],
    "x"
  );
  f.server.BlockPermutation.resolve = typeId => previousResolve(
    typeId,
    typeId === "custom:unregistered_log"
      ? { "minecraft:pillar_axis": "y" }
      : { "minecraft:distance": 7 }
  );
  assert(f.manager.placeBlockForPlayerEdit(
    {}, { typeId: "custom:unregistered_log" }, managed.handle, target,
    { x: 0, y: 1, z: 1 }, "south", "north"
  ));
  assert.deepEqual(
    managed.handle.getBlockAtLocalLocation({ x: 0, y: 1, z: 1 }).rotation,
    { x: 90, y: 0, z: 0 }
  );
  f.dimension.getBiome = () => ({ id: "minecraft:swamp" });
  assert(f.manager.placeBlockForPlayerEdit(
    {}, { typeId: "minecraft:oak_leaves" }, managed.handle, target,
    { x: 0, y: 0, z: 1 }, "south", "up"
  ));
  assert.equal(f.saved.get(managed.id).foliageTint.mapKind, 1);
});

test("placement resolves complete orientation states from the hit face and player heading", () => {
  const f = managedFixture();
  const target = block("minecraft:oak_log");
  const managed = f.manager.createSubLevel(f.dimension, { x: 0, y: 0, z: 0 }, [target]);
  const previousResolve = f.server.BlockPermutation.resolve;
  f.server.BlockPermutation.resolve = typeId => previousResolve(
    typeId,
    typeId === "minecraft:compound_creator" ? { orientation: "south_up" } : { distance: 7 }
  );
  const place = (location, heading, face) => {
    assert(f.manager.placeBlockForPlayerEdit(
      {}, { typeId: "minecraft:compound_creator" }, managed.handle, target,
      location, heading, face
    ));
    return managed.handle.getBlockAtLocalLocation(location).states.orientation;
  };
  assert.equal(place({ x: 1, y: 0, z: 0 }, "north", "up"), "up_south");
  assert.equal(place({ x: 2, y: 0, z: 0 }, "east", "down"), "down_west");
  assert.equal(place({ x: 3, y: 0, z: 0 }, "south", "east"), "east_up");
});

test("placement keeps shared direction rules independent of block names and state-key aliases", () => {
  const f = managedFixture();
  const target = block("minecraft:oak_log");
  const managed = f.manager.createSubLevel(f.dimension, { x: 0, y: 0, z: 0 }, [target]);
  const previousResolve = f.server.BlockPermutation.resolve;
  const groups = [
    { ids: ["minecraft:chest", "minecraft:trapped_chest", "custom:opaque_fixture", "custom:fixture_anvil"], keys: ["minecraft:cardinal_direction", "cardinal_direction"], initial: "south" },
    { ids: ["minecraft:chiseled_bookshelf", "custom:fixture_bookshelf", "custom:apiary_hive"], keys: ["direction", "minecraft:direction"], initial: 0 }
  ];
  let index = 0;
  // This asserts name independence of the shared convention, not a claim
  // about every block's native placement rule. Native parity needs native
  // placement states; a default permutation does not contain that rule.
  for (const group of groups) for (const key of group.keys) {
    f.server.BlockPermutation.resolve = typeId => previousResolve(typeId, { [key]: group.initial });
    for (const direction of ["north", "east", "south", "west"]) {
      let reference;
      for (const typeId of group.ids) {
        const placement = { x: ++index % 16, y: Math.floor(index / 16), z: 0 };
        assert(f.manager.placeBlockForPlayerEdit(
          {}, { typeId }, managed.handle, target, placement, direction, "up"
        ));
        const placed = managed.handle.getBlockAtLocalLocation(placement);
        const actual = placed.states;
        if (!reference) reference = actual;
        assert.deepEqual(actual, reference, `${key} ${direction} ${typeId}`);
      }
    }
  }
});

test("placement writes vanilla numeric direction states from their own placement rules", () => {
  const f = managedFixture();
  const target = block("minecraft:oak_log");
  const managed = f.manager.createSubLevel(f.dimension, { x: 0, y: 0, z: 0 }, [target]);
  const previousResolve = f.server.BlockPermutation.resolve;
  f.server.BlockPermutation.resolve = (typeId) => previousResolve(
    typeId,
    typeId === "minecraft:bee_nest"
      ? { "minecraft:direction": 0, "minecraft:honey_level": 0 }
      : typeId === "minecraft:cocoa"
        ? { "minecraft:direction": 0, "minecraft:age": 0 }
        : { "minecraft:distance": 7 }
  );
  assert(f.manager.placeBlockForPlayerEdit(
    {}, { typeId: "minecraft:bee_nest" }, managed.handle, target,
    { x: 1, y: 0, z: 0 }, "south", "up"
  ));
  assert.equal(
    managed.handle.getBlockAtLocalLocation({ x: 1, y: 0, z: 0 }).states["minecraft:direction"],
    2
  );
  assert(f.manager.placeBlockForPlayerEdit(
    {}, { typeId: "minecraft:cocoa" }, managed.handle, target,
    { x: 0, y: 1, z: 0 }, "south", "east"
  ));
  assert.equal(
    managed.handle.getBlockAtLocalLocation({ x: 0, y: 1, z: 0 }).states["minecraft:direction"],
    1
  );
});

test("placed foliage reuses the immutable creation gradient after the world biome changes", () => {
  const f = managedFixture();
  const managed = f.manager.createSubLevel(
    f.dimension,
    { x: 0, y: 0, z: 0 },
    [block("minecraft:oak_leaves")]
  );
  const creationTint = structuredClone(f.saved.get(managed.id).foliageTint);
  f.dimension.getBiome = () => ({ id: "minecraft:swamp" });
  assert(f.manager.placeBlockForPlayerEdit(
    {}, { typeId: "minecraft:oak_leaves" }, managed.handle,
    managed.handle.getBlockAtLocalLocation({ x: 0, y: 0, z: 0 }),
    { x: 1, y: 0, z: 0 }, "south", "up"
  ));
  assert.deepEqual(f.saved.get(managed.id).foliageTint, creationTint);
});

test("unloaded saved structures retry without blocking loaded structures", () => {
  const f = managedFixture();
  for (const [id, x] of [["region_1", 64], ["region_2", 0]]) f.saved.set(id, {
    id, origin: { x, y: 0, z: 0 }, dimensionId: f.dimension.id,
    blocks: [block("minecraft:oak_log")], containerStorages: []
  });
  const getBlock = f.dimension.getBlock;
  f.dimension.getBlock = location => location.x >= 64 ? undefined : getBlock(location);
  f.manager.initialize();
  f.manager.tick(20);
  assert.equal([...f.entities.values()].filter(entity => entity.isValid).length, 2);
  f.dimension.getBlock = getBlock;
  f.manager.tick(40);
  assert.equal([...f.entities.values()].filter(entity => entity.isValid).length, 4);
});

test("chest capture, multiple viewers, reconstruction and settlement preserve native inventory", () => {
  const f = managedFixture();
  const location = { x: 0, y: 0, z: 0 };
  const source = f.dimension.getBlock(location);
  source.setPermutation(f.permutation("minecraft:chest", { "minecraft:cardinal_direction": "south" }));
  const items = new Map([[0, { typeId: "minecraft:diamond", amount: 13 }], [26, { typeId: "minecraft:apple", amount: 2 }]]);
  source.getComponent = name => name === "minecraft:inventory"
    ? { container: { size: 27, getItem: slot => items.get(slot) } } : undefined;
  const managed = f.manager.createSubLevelFromRegion(f.dimension, location, location);
  f.containers.start();
  f.flush();
  const chest = [...f.entities.values()].find(entity => entity.typeId === "sable:chest");
  const inventory = chest.getComponent("minecraft:inventory").container;
  assert.equal(source.typeId, "minecraft:air");
  assert.deepEqual(inventory.getItem(0), items.get(0));
  assert.deepEqual(inventory.getItem(26), items.get(26));
  assert(chest.vehicle);
  const target = managed.handle.blocks[0];
  const first = { id: "first", typeId: "minecraft:player" };
  const second = { id: "second", typeId: "minecraft:player" };
  const emit = (name, event) => f.signals.get(name)?.forEach(callback => callback(event));
  f.containers.syncTarget(first, managed.handle, target);
  assert.equal(chest.vehicle, undefined);
  assert.deepEqual(chest.location, { x: 0.5, y: 0.0625, z: 0.5 });
  emit("entityContainerOpened", { entity: chest, openSource: { entity: first } });
  f.containers.syncTarget(second, managed.handle, target);
  emit("entityContainerOpened", { entity: chest, openSource: { entity: second } });
  assert.deepEqual(f.sounds.map(entry => entry[0]), ["random.chestopen"]);
  const oldRender = managed.handle.renderData;
  assert(f.manager.placeBlockForPlayerEdit({}, { typeId: "minecraft:beacon" }, managed.handle, target, { x: 1, y: 0, z: 0 }, "south"));
  assert.notEqual(managed.handle.renderData, oldRender);
  f.flush();
  const openProperties = [...f.entities.values()]
    .filter(entity => entity.isValid && entity.typeId.includes("fancy"))
    .map(entity => ({ entity, molang: { ...entity.molang } }));
  emit("entityContainerClosed", { entity: chest, closeSource: { entity: first } });
  f.flush();
  assert.equal(f.sounds.length, 1);
  emit("entityContainerClosed", { entity: chest, closeSource: { entity: second } });
  f.flush();
  assert.deepEqual(f.sounds.map(entry => entry[0]), ["random.chestopen", "random.chestclosed"]);
  assert(openProperties.some(({ entity, molang }) => JSON.stringify(entity.molang) !== JSON.stringify(molang)), "reconstructed chest must have an open lid before the last viewer closes it");
  f.containers.releasePlayer(first.id);
  f.containers.releasePlayer(second.id);
  assert(chest.vehicle);
  assert(managed.handle.renderData.hasIntactEntities());
  assert.deepEqual(inventory.getItem(0), items.get(0));
  assert(f.manager.breakBlockForPlayerEdit({}, undefined, managed.handle, target));
  assert.equal(chest.isValid, false);
  assert.equal(f.containers.getBindings(managed.id).length, 0);
});

test("container unload and saved binding reconciliation never spawn replacement inventories", () => {
  const f = managedFixture();
  const target = block("minecraft:chest", 0, 0, 0, { "minecraft:cardinal_direction": "north" });
  const managed = f.manager.createSubLevel(f.dimension, { x: 0, y: 0, z: 0 }, [target]);
  f.flush();
  const chest = [...f.entities.values()].find(entity => entity.typeId === "sable:chest");
  const inventory = chest.getComponent("minecraft:inventory").container;
  inventory.setItem(3, { typeId: "minecraft:emerald", amount: 42 });
  chest.remove();
  f.containers.handleEntityRemove(chest.id);
  assert.equal(f.containers.getBindings(managed.id).length, 1);
  assert.equal(managed.blockCount, 1);
  f.containers.bindSubLevel(managed.id, managed.handle, f.containers.getBindings(managed.id));
  f.containers.completeSavedBindingRegistration();
  f.flush();
  assert.equal([...f.entities.values()].filter(entity => entity.typeId === "sable:chest").length, 1);
  chest.isValid = true;
  f.containers.handleEntityLoad(chest);
  f.flush();
  assert(chest.vehicle);
  assert.deepEqual(inventory.getItem(3), { typeId: "minecraft:emerald", amount: 42 });
  assert(managed.handle.renderData.hasIntactEntities());
});

test("persistent inventories survive a renderer change while mounted", () => {
  const f = managedFixture();
  const target = block("minecraft:chest", 0, 0, 0, { "minecraft:cardinal_direction": "west" });
  const managed = f.manager.createSubLevel(f.dimension, { x: 0, y: 0, z: 0 }, [target]);
  f.flush();
  const chest = [...f.entities.values()].find(entity => entity.typeId === "sable:chest");
  const oldCarrier = chest.vehicle;
  assert(f.manager.placeBlockForPlayerEdit({}, { typeId: "minecraft:beacon" }, managed.handle, target, { x: 1, y: 0, z: 0 }, "south"));
  f.flush();
  assert(chest.isValid && chest.vehicle && chest.vehicle !== oldCarrier);
  assert(managed.handle.renderData.hasIntactEntities());
});

test("ordinary carrier leaves its 512th native seat available for the outline", () => {
  const f = fixture();
  const renderer = f.load("sublevel/render/SubLevelRenderer.ts").SubLevelRenderer;
  const blocks = Array.from({ length: 1022 }, (_, index) => block("minecraft:beacon", index % 32, Math.floor(index / 32)));
  const data = renderer.createRenderData({ body, dimension: f.dimension, blocks });
  f.flush();
  assert.equal(data.entityCount, 512);
  const outline = f.dimension.spawnEntity("sable:block_outline", { x: 0, y: 0, z: 0 });
  assert(data.attachAuxiliaryRider(outline));
  assert.equal(outline.vehicle.riders.length, 512);
  assert(data.hasIntactEntities());
});

test("block sounds and particle emissions match the baseline for registered tree blocks", () => {
  const f = fixture();
  const actualSounds = f.load("content/sublevel_sounds/SubLevelBlockSounds.ts");
  const expectedSounds = f.reference("data/BlockSound.ts");
  const particles = f.load("content/particle/SubLevelBlockParticles.ts");
  const referenceParticles = f.reference("render/particle/BlockParticles.ts");
  const kinds = f.reference("content/tree/block/Blocks.ts");
  const definitions = json(join(sable, "src/data/sublevel-block.json")).blocks;
  const field = { gradientAxis: "z", mapKind: 1, uAtLocalOrigin: 0.35, uPerLocalX: 0.018, vAtLocalOrigin: 0.43, vPerLocalZ: -0.009 };
  for (const typeId of Object.keys(definitions)) {
    for (const name of ["resolveVanillaBlockBreakSound", "resolveVanillaBlockHitSound", "resolveVanillaBlockPlaceSound"]) {
      for (const random of [0, 0.3, 1]) assert.deepEqual(actualSounds[name](typeId, () => random), expectedSounds[name](typeId, () => random), typeId);
    }
    const kind = kinds.playerEditableContraptionBlockKind(typeId);
    if (kind === undefined) continue;
    const entry = block(typeId, 2, 1, 5, {
      pillar_axis: "y", "minecraft:cardinal_direction": "north", hanging: true,
      propagule_stage: 2, direction: 1, age: 1, honey_level: 5, tip: true,
      vine_direction_bits: 11, creaking_heart_state: "awake"
    });
    f.particles.length = 0;
    referenceParticles.spawnBlockParticle(f.dimension, entry.localLocation, { ...entry, kind }, entry.localLocation, field, { kind: "destruct", profile: referenceParticles.BLOCK_BREAK_PARTICLE_PROFILE });
    particles.spawnSubLevelBlockDestructParticle(f.dimension, entry.localLocation, entry, field, particles.BLOCK_BREAK_PARTICLE_PROFILE);
    assert.equal(f.particles.length, 2, typeId);
    assert.deepEqual(f.particles[1].slice(1), f.particles[0].slice(1), typeId);
  }
});

test("vanilla mining hit sounds cover non-tree blocks such as beacons", () => {
  const f = fixture();
  const sounds = f.load("content/sublevel_sounds/SubLevelBlockSounds.ts");
  assert.equal(
    sounds.resolveVanillaBlockHitSound("minecraft:beacon", () => 0).sound,
    "hit.stone"
  );
  assert.equal(
    sounds.resolveVanillaBlockBreakSound("minecraft:beacon", () => 0).sound,
    "random.glass"
  );
});

// These resources use the arithmetic/query subset shared by JavaScript and
// Molang. Evaluate their emitted expressions, not a second model selector.
function resourceEvaluator(entity, client) {
  const v = new Proxy({ ...(entity.molang ?? {}) }, { get: (target, key) => {
    if (!(key in target) && client.animations.input === "animation.sable.fancy.input") {
      throw new Error(`Uninitialized Molang variable v.${String(key)}`);
    }
    return target[key] ?? 0;
  } });
  const q = {
    property: name => entity.getProperty(name),
    life_time: entity.lifeTime ?? 0,
    delta_time: 0.05, body_x_rotation: 0, body_y_rotation: 0
  };
  const math = {
    ...Object.fromEntries(Object.getOwnPropertyNames(Math).map(name => [name, Math[name]])),
    mod: (a, b) => a % b, clamp: (x, a, b) => Math.max(a, Math.min(b, x)),
    lerprotate: (a, b, t) => a + (((b - a + 540) % 360) - 180) * t
  };
  const cache = new Map();
  const run = (source, arrays = {}, statement = false) => {
    if (typeof source !== "string") return source;
    source = source.replace(/\bquery\./g, "q.").replace(/\bMath\./g, "math.");
    // Molang's null coalescing operator can read an undeclared variable without
    // logging an error; an ordinary variable read must still fail this check.
    source = source.replace(/\bv\.(\w+)\s*\?\?\s*0\b/g, "('$1' in v ? v.$1 : 0)");
    const key = `${statement}|${source}`;
    let fn = cache.get(key);
    if (!fn) {
      fn = new Function("v", "q", "math", "Array", "Texture", "Geometry", "Material", statement ? source : `return (${source});`);
      cache.set(key, fn);
    }
    return fn(v, q, math, arrays, client.textures, client.geometry, client.materials);
  };
  for (const code of [...client.scripts.initialize, ...client.scripts.pre_animation]) run(code, {}, true);
  return run;
}

function modelResourceReader(pack, folder) {
  const clients = new Map();
  const base = join(pack, "entity", folder);
  for (const path of readdirSync(base, { recursive: true }).filter(file => file.endsWith(".json"))) {
    const client = json(join(base, path))["minecraft:client_entity"].description;
    clients.set(client.identifier, client);
  }
  const resources = modelResourceIndex(pack);
  return entity => {
    const client = clients.get(entity.typeId);
    assert(client, `missing client entity ${entity.typeId}`);
    return { client, ...resources };
  };
}

function activeRenderPasses(entity, resources) {
  const evaluate = resourceEvaluator(entity, resources.client);
  return resources.client.render_controllers.flatMap(entry => {
    const [id, condition] = typeof entry === "string" ? [entry, true] : Object.entries(entry)[0];
    if (!evaluate(condition)) return [];
    const controller = resources.controllers[id];
    const arrays = {};
    for (const lists of Object.values(controller.arrays ?? {})) {
      for (const [name, values] of Object.entries(lists)) arrays[name.slice(6)] = values.map(value => evaluate(value));
    }
    return [{ controller, arrays, evaluate }];
  });
}

// Bedrock resolves resource identifiers globally, independent of filenames.
const modelResourceIndexes = new Map();
function modelResourceIndex(pack) {
  if (modelResourceIndexes.has(pack)) return modelResourceIndexes.get(pack);
  const resources = { geometries: new Map(), animations: {}, controllers: {} };
  for (const directory of ["models/entity", "animations", "render_controllers"]) {
    const base = join(pack, directory);
    for (const file of readdirSync(base, { recursive: true }).filter(file => file.endsWith(".json"))) {
      const document = json(join(base, file));
      for (const geometry of document["minecraft:geometry"] ?? []) {
        const id = geometry.description.identifier;
        assert(!resources.geometries.has(id), `duplicate geometry ${id}`);
        resources.geometries.set(id, geometry);
      }
      for (const [key, target] of [["animations", resources.animations], ["render_controllers", resources.controllers]]) {
        for (const [id, definition] of Object.entries(document[key] ?? {})) {
          assert(!target[id], `duplicate ${id}`);
          target[id] = definition;
        }
      }
    }
  }
  modelResourceIndexes.set(pack, resources);
  return resources;
}

function activeModelSurfaces(entity, resources, transformed = false) {
  const { client, geometries, animations, controllers } = resources;
  const evaluate = resourceEvaluator(entity, client);
  const poses = new Map();
  for (const entry of client.scripts.animate) {
    const [alias, condition] = typeof entry === "string" ? [entry, true] : Object.entries(entry)[0];
    if (!evaluate(condition)) continue;
    for (const [name, pose] of Object.entries(animations[client.animations[alias]].bones)) {
      const combined = poses.get(name) ?? {};
      for (const channel of ["position", "rotation", "scale"]) {
        if (pose[channel] === undefined) continue;
        const identity = channel === "scale" ? 1 : 0;
        const values = Array.isArray(pose[channel]) ? pose[channel] : Array(3).fill(pose[channel]);
        combined[channel] = values.map((value, axis) => {
          const previous = combined[channel]?.[axis] ?? identity;
          return channel === "scale" ? previous * Number(evaluate(value)) : previous + Number(evaluate(value));
        });
      }
      poses.set(name, combined);
    }
  }
  const surfaces = [];
  for (const entry of client.render_controllers) {
    const [id, condition] = typeof entry === "string" ? [entry, true] : Object.entries(entry)[0];
    if (!evaluate(condition)) continue;
    const controller = controllers[id];
    const arrays = {};
    for (const values of Object.values(controller.arrays ?? {})) {
      for (const [name, members] of Object.entries(values)) arrays[name.slice(6)] = members.map(value => evaluate(value));
    }
    const material = evaluate(controller.materials[0]["*"], arrays);
    if (material.includes("multiply")) continue;
    const geometry = geometries.get(evaluate(controller.geometry, arrays));
    assert(geometry, `${id}: missing geometry`);
    const skeleton = new Map(geometry.bones.map(bone => [bone.name, bone]));
    const visibility = Object.assign({}, ...(controller.part_visibility ?? []));
    for (const bone of geometry.bones) {
      if (!bone.cubes || !evaluate(visibility[bone.name] ?? visibility["*"] ?? true, arrays)) continue;
      const position = [0, 0, 0];
      const rotations = [];
      const transforms = [];
      let hidden = false;
      for (let name = bone.name; name; name = skeleton.get(name).parent) {
        const ancestor = skeleton.get(name);
        const pose = poses.get(name) ?? {};
        if (pose.scale?.some(value => value === 0)) hidden = true;
        (pose.position ?? [0, 0, 0]).forEach((value, axis) => position[axis] += value);
        const rotation = [0, 1, 2].map(axis => (pose.rotation?.[axis] ?? 0) + (ancestor.rotation?.[axis] ?? 0));
        transforms.push({ pivot: ancestor.pivot ?? [0, 0, 0], rotation, position: pose.position ?? [0, 0, 0], scale: pose.scale ?? [1, 1, 1] });
        if (rotation.some(value => value !== 0)) {
          const pivot = [...(ancestor.pivot ?? [0, 0, 0])];
          // Translating a pivot along its sole rotation axis changes no vertex.
          if (rotation.filter(value => value !== 0).length === 1) pivot[rotation.findIndex(value => value !== 0)] = 0;
          rotations.unshift({ pivot, rotation });
        }
      }
      if (hidden) continue;
      for (const cube of bone.cubes) {
        if (transformed) {
          const corners = [
            [0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0],
            [0, 0, 1], [1, 0, 1], [0, 1, 1], [1, 1, 1]
          ].map(corner => {
            let point = corner.map((value, axis) => cube.origin[axis] + value * cube.size[axis]);
            if (cube.rotation) point = transformPoint(point, { pivot: cube.pivot ?? [0, 0, 0], rotation: cube.rotation });
            for (const transform of transforms) point = transformPoint(point, transform);
            const location = entity.vehicle?.location ?? entity.location;
            return point.map((value, axis) => Math.round((value + [location.x, location.y, -location.z][axis] * 16) * 1e6) / 1e6 || 0);
          });
          const faces = { north: [0, 1, 2, 3], south: [5, 4, 7, 6], west: [4, 0, 6, 2], east: [1, 5, 3, 7], up: [2, 3, 6, 7], down: [4, 5, 0, 1] };
          for (const [face, uv] of Object.entries(cube.uv)) {
            surfaces.push({
              texture: evaluate(controller.textures[0], arrays), material,
              light: controller.light_color_multiplier ?? 1,
              textureSize: [geometry.description.texture_width, geometry.description.texture_height],
              uv, vertices: faces[face].map(index => corners[index])
            });
          }
          continue;
        }
        surfaces.push({
          texture: evaluate(controller.textures[0], arrays), material,
          light: controller.light_color_multiplier ?? 1,
          textureSize: [geometry.description.texture_width, geometry.description.texture_height],
          cube, position: position.map(value => value || 0), rotations
        });
      }
    }
  }
  return surfaces.sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
}

// Compare composed resource transforms; this does not emulate the Bedrock client.
function transformPoint(point, { pivot, rotation, position = [0, 0, 0], scale = [1, 1, 1] }) {
  let value = point.map((coordinate, axis) => (coordinate - pivot[axis]) * scale[axis]);
  for (const axis of [0, 1, 2]) {
    const angle = rotation[axis] * Math.PI / 180;
    const a = (axis + 1) % 3;
    const b = (axis + 2) % 3;
    const next = [...value];
    next[a] = value[a] * Math.cos(angle) - value[b] * Math.sin(angle);
    next[b] = value[a] * Math.sin(angle) + value[b] * Math.cos(angle);
    value = next;
  }
  return value.map((coordinate, axis) => coordinate + pivot[axis] + position[axis]);
}

test("reported log and chest captures preserve the saved states and client rotation inputs", () => {
  const f = managedFixture();
  const reader = modelResourceReader(join(sable, "packs/SableRP"), "sable/sublevel/fancy");
  // These states and descriptor words were read from the reported test world's
  // saved records and actors, independently of the resource comparison harness.
  const cases = [
    {
      origin: { x: 4, y: 70, z: 34 },
      blocks: [
        block("minecraft:oak_log", 0, 0, 0, { old_log_type: "oak", pillar_axis: "z" }),
        block("minecraft:oak_log", 0, 0, 1, { old_log_type: "oak", pillar_axis: "y" })
      ],
      format: "pool",
      words: [9041887, 8521695],
      rotations: [[90, 0, 0], [0, 0, 0]]
    },
    {
      origin: { x: 6, y: 70, z: 34 },
      blocks: [block("minecraft:chest", 0, 0, 0, { facing_direction: 2, "minecraft:cardinal_direction": "north" })],
      format: "sparse",
      words: [8255425],
      rotations: [[0, 180, 0]]
    }
  ];
  for (const sample of cases) {
    const at = entry => Object.fromEntries(["x", "y", "z"].map(axis => [axis, sample.origin[axis] + entry.localLocation[axis]]));
    for (const entry of sample.blocks) f.dimension.getBlock(at(entry)).setPermutation(f.permutation(entry.typeId, entry.states));
    const managed = f.manager.createSubLevelFromRegion(f.dimension, sample.origin, at(sample.blocks.at(-1)));
    f.flush();
    assert.deepEqual(managed.handle.blocks.map(entry => entry.states), sample.blocks.map(entry => entry.states));
    assert.deepEqual(f.saved.get(managed.id).blocks.map(entry => entry.states), sample.blocks.map(entry => entry.states));
    const renders = managed.handle.renderData.entityIds.map(id => f.entities.get(id)).filter(entity => !entity.typeId.includes("carrier"));
    assert.equal(renders.length, 1);
    const entity = renders[0];
    const model = f.load("sublevel/render/fancy/model/FancySubLevelModelRegistry.ts").resolveFancySubLevelBlock(sample.blocks[0]).model;
    assert.equal(entity.typeId, model[sample.format].entityTypeId);
    assert.equal(entity.molang.model_variant, model[sample.format].variant);
    assert.deepEqual(sample.words.map((_, index) => entity.molang[`s${index}`]), sample.words);
    const resources = reader(entity);
    const evaluate = resourceEvaluator(entity, resources.client);
    const animation = resources.animations[resources.client.animations.transform];
    for (let slot = 0; slot < sample.blocks.length; slot++) {
      const pose = animation.bones[`slot_${slot}`];
      assert.deepEqual(pose.rotation.map(value => evaluate(value)), sample.rotations[slot]);
      assert.equal(Number(evaluate(pose.scale)), 1);
    }
  }
});

test("vanilla capture resolves canonical named horizontal facing states", () => {
  const f = fixture();
  const capture = f.load("api/SubLevelAssemblyHelper.ts").captureSubLevelBlock;
  const cases = [
    ["minecraft:cardinal_direction", "south", [0, 270, 0]],
    ["minecraft:cardinal_direction", "west", [0, 0, 0]],
    ["minecraft:cardinal_direction", "north", [0, 90, 0]],
    ["minecraft:cardinal_direction", "east", [0, 180, 0]],
    ["cardinal_direction", "north", [0, 90, 0]],
    ["minecraft:horizontal_facing_direction", "west", [0, 0, 0]],
    ["minecraft:facing_direction", "east", [0, 180, 0]]
  ];
  for (const [stateName, stateValue, expected] of cases) {
    const typeId = "custom:unregistered_directional_block";
    const worldBlock = {
      location: { x: 4, y: 8, z: 12 },
      permutation: f.permutation(typeId, { [stateName]: stateValue }),
      getComponent: () => undefined
    };
    const captured = capture(worldBlock, { x: 4, y: 8, z: 12 });
    assert.deepEqual(captured.rotation, { x: expected[0], y: expected[1], z: expected[2] });
  }
  const numericDirection = {
    location: { x: 0, y: 0, z: 0 },
    permutation: f.permutation("custom:ambiguous_directional_block", { direction: 2 }),
    getComponent: () => undefined
  };
  assert.deepEqual(capture(numericDirection, { x: 0, y: 0, z: 0 }).rotation, { x: 0, y: 180, z: 0 });

  const customHead = capture({
    location: { x: 0, y: 0, z: 0 },
    permutation: f.permutation("custom:ornament_head", { facing_direction: 0 }),
    getComponent: () => undefined
  }, { x: 0, y: 0, z: 0 });
  assert.deepEqual(customHead.rotation, { x: 0, y: 180, z: 0 });
  assert.deepEqual(customHead.visualOffset, { x: -0.25, y: 0, z: 0.25 });

  const customFrontFacingDirectionBlock = capture({
    location: { x: 0, y: 0, z: 0 },
    permutation: f.permutation("custom:apiary_hive", { direction: 0, honey_level: 0 }),
    getComponent: () => undefined
  }, { x: 0, y: 0, z: 0 });
  assert.deepEqual(customFrontFacingDirectionBlock.rotation, { x: 0, y: 90, z: 0 });

  const customChemistry = capture({
    location: { x: 0, y: 0, z: 0 },
    permutation: f.permutation("custom:compound_creator", { direction: 0 }),
    getComponent: () => undefined
  }, { x: 0, y: 0, z: 0 });
  assert.deepEqual(customChemistry.rotation, { x: 0, y: 90, z: 0 });

  const customOrdinaryDirection = capture({
    location: { x: 0, y: 0, z: 0 },
    permutation: f.permutation("custom:bell", { direction: 0 }),
    getComponent: () => undefined
  }, { x: 0, y: 0, z: 0 });
  assert.deepEqual(customOrdinaryDirection.rotation, { x: 0, y: 0, z: 0 });
});

test("vanilla capture resolves partial-block offsets and directional state families", () => {
  const f = fixture();
  const helper = f.load("api/SubLevelAssemblyHelper.ts");
  const capture = (typeId, states) => helper.captureSubLevelBlock({
    location: { x: 0, y: 0, z: 0 },
    permutation: f.permutation(typeId, states),
    getComponent: () => undefined
  }, { x: 0, y: 0, z: 0 });

  assert.deepEqual(capture("minecraft:oak_stairs", {
    weirdo_direction: 0, upside_down_bit: false
  }).rotation, { x: 0, y: 270, z: 0 });
  assert.deepEqual(capture("minecraft:oak_stairs", {
    weirdo_direction: 0, upside_down_bit: true
  }).rotation, { x: 180, y: 90, z: 0 });
  assert.deepEqual(capture("minecraft:oak_trapdoor", {
    direction: 0, upside_down_bit: false
  }).rotation, { x: 0, y: 90, z: 0 });
  assert.equal(capture("minecraft:oak_trapdoor", {
    direction: 0, upside_down_bit: false
  }).visualYOffset, -6.5 / 16);
  assert.equal(capture("minecraft:oak_trapdoor", {
    direction: 0, upside_down_bit: true
  }).visualYOffset, 6.5 / 16);
  assert.equal(capture("minecraft:oak_slab", {
    "minecraft:vertical_half": "bottom"
  }).visualYOffset, -4 / 16);
  assert.equal(capture("minecraft:oak_slab", {
    "minecraft:vertical_half": "top"
  }).visualYOffset, 4 / 16);
  assert.deepEqual(capture("minecraft:player_head", {
    facing_direction: 0
  }).rotation, { x: 0, y: 180, z: 0 });
  assert.deepEqual(capture("minecraft:player_head", {
    facing_direction: 5
  }).rotation, { x: 0, y: 180, z: 0 });
  assert.deepEqual(capture("minecraft:player_head", {
    facing_direction: 0
  }).visualOffset, { x: -0.25, y: 0, z: 0.25 });
  assert.deepEqual(capture("minecraft:barrel", {
    facing_direction: 0
  }).rotation, { x: 0, y: 90, z: 90 });
  assert.deepEqual(capture("minecraft:dispenser", {
    facing_direction: 1
  }).rotation, { x: 0, y: 90, z: 270 });
  assert.deepEqual(capture("minecraft:beehive", {
    direction: 0
  }).rotation, { x: 0, y: 90, z: 0 });
});

test("native rotation probe selects both paths and cleans up without changing world blocks", () => {
  const f = fixture();
  f.system.afterEvents = f.server.world.afterEvents;
  const { SubLevelInteractionSystem } = f.load("sublevel/system/SubLevelInteractionSystem.ts");
  const runtime = new SubLevelInteractionSystem();
  const loadProbe = moduleLoader(join(sable, "packs/SableBP/scripts"), f.server, {
    "sable/Sable.js": { sableInteractionSystem: runtime }
  });
  const probe = loadProbe("rotation-probe.js");
  const player = { id: "probe-player", location: { x: 0, y: 70, z: 0 }, dimension: f.dimension };
  const rows = probe.createRotationProbe(player);
  f.flush();
  assert.equal(rows.length, 2);
  assert(rows[0].packing.models.every(model => model.format === "pool"));
  assert(rows[1].packing.models.every(model => model.format === "sparse"));
  assert.equal(rows[0].packing.models.length, 2);
  assert.equal(rows[1].packing.models.length, 7);
  assert.deepEqual(rows[0].handle.blocks, rows[1].handle.blocks);
  for (const row of rows) for (const id of row.renderer.entityIds) {
    assert(runtime.isVisualEntity(f.dimension.id, id), `unregistered probe entity ${id}`);
  }
  probe.clearRotationProbe(player.id);
  assert(rows.every(row => !row.handle.isValid));
  assert.equal(f.dimension.getEntities().length, 0);
  assert.equal(f.changes.length, 0);
  const spawn = f.dimension.spawnEntity;
  f.dimension.spawnEntity = (...args) => {
    if (f.dimension.getEntities().length >= 4) throw new Error("probe spawn failure");
    return spawn(...args);
  };
  assert.throws(() => probe.createRotationProbe(player), /probe spawn failure/);
  f.flush();
  assert.equal(f.dimension.getEntities().length, 0);
  assert.equal(f.changes.length, 0);
});

test("rotation census probe pairs Fancy and ordinary Vanilla cardinal models", () => {
  const f = fixture();
  f.system.afterEvents = f.server.world.afterEvents;
  const { SubLevelInteractionSystem } = f.load("sublevel/system/SubLevelInteractionSystem.ts");
  const runtime = new SubLevelInteractionSystem();
  const loadProbe = moduleLoader(join(sable, "packs/SableBP/scripts"), f.server, {
    "sable/Sable.js": { sableInteractionSystem: runtime }
  });
  const probe = loadProbe("rotation-probe.js");
  const player = { id: "census-player", location: { x: 0, y: 70, z: 0 }, dimension: f.dimension };
  const rows = probe.createRotationCensusProbe(player);
  f.flush();
  assert.deepEqual(rows.map(row => row.label), ["FANCY CHEST", "VANILLA TRAPPED CHEST"]);
  assert(rows.every(row => row.blocks.length === 4));
  assert.deepEqual(rows[0].blocks.map(block => block.states["minecraft:cardinal_direction"]), ["north", "east", "south", "west"]);
  assert.deepEqual(rows[1].blocks.map(block => block.states["minecraft:cardinal_direction"]), ["north", "east", "south", "west"]);
  assert(rows[1].blocks.every(block => block.rotation));
  assert(rows.every(row => row.renderData.entityIds.length > 0));
  assert.deepEqual(
    [0, 1, 2, 3].map(index => f.dimension.getBlock({ x: -6 + index * 2, y: 72, z: 3 }).typeId),
    ["minecraft:diamond_block", "minecraft:gold_block", "minecraft:emerald_block", "minecraft:redstone_block"]
  );
  probe.clearRotationProbe(player.id);
  assert(rows.every(row => !row.handle.isValid));
  assert.deepEqual(
    [0, 1, 2, 3].map(index => f.dimension.getBlock({ x: -6 + index * 2, y: 72, z: 3 }).typeId),
    ["minecraft:air", "minecraft:air", "minecraft:air", "minecraft:air"]
  );
  assert.equal(f.dimension.getEntities().length, 0);

  const pillarRows = probe.createPillarAxisCensusProbe(player);
  f.flush();
  assert.deepEqual(pillarRows.map(row => row.label), ["FANCY OAK LOG", "VANILLA BASALT"]);
  assert.deepEqual(pillarRows[1].blocks.map(block => block.states["minecraft:pillar_axis"]), ["y", "x", "z"]);
  assert(pillarRows[1].blocks.slice(1).every(block => block.rotation));
  probe.clearRotationProbe(player.id);
  assert.equal(f.dimension.getEntities().length, 0);

  const directionRows = probe.createDirectionCensusProbe(player);
  f.flush();
  assert.deepEqual(directionRows.map(row => row.label), ["FANCY BEE NEST", "VANILLA BEEHIVE"]);
  assert.deepEqual(directionRows[1].blocks.map(block => block.states["minecraft:direction"]), [0, 1, 2, 3]);
  probe.clearRotationProbe(player.id);
  assert.equal(f.dimension.getEntities().length, 0);

  const facingRows = probe.createFacingDirectionCensusProbe(player);
  f.flush();
  assert.deepEqual(facingRows.map(row => row.label), ["VANILLA BARREL", "VANILLA DISPENSER"]);
  assert.deepEqual(facingRows[0].blocks.map(block => block.states["minecraft:facing_direction"]), [0, 1, 2, 3, 4, 5]);
  probe.clearRotationProbe(player.id);
  assert.equal(f.dimension.getEntities().length, 0);

  const torchRows = probe.createTorchFacingCensusProbe(player);
  f.flush();
  assert.deepEqual(torchRows.map(row => row.label), ["VANILLA TORCH", "VANILLA REDSTONE TORCH"]);
  assert.deepEqual(torchRows[0].blocks.map(block => block.states.torch_facing_direction), ["west", "east", "north", "south", "top"]);
  probe.clearRotationProbe(player.id);
  assert.equal(f.dimension.getEntities().length, 0);

  const stairsRows = probe.createStairsCensusProbe(player);
  f.flush();
  assert.deepEqual(stairsRows.map(row => row.label), ["VANILLA STONE STAIRS", "VANILLA ANDESITE STAIRS"]);
  assert.deepEqual(stairsRows[0].blocks.map(block => block.states.weirdo_direction), [0, 1, 2, 3]);
  probe.clearRotationProbe(player.id);
  assert.equal(f.dimension.getEntities().length, 0);

  const nativeRows = probe.createNativeStateCensusProbe(player);
  f.flush();
  assert.deepEqual(nativeRows.map(row => row.label), [
    "PLAYER HEAD"
  ]);
  assert(nativeRows.every(row => row.blocks.length > 0 && row.nativeBlocks.length > row.blocks.length));
  probe.clearRotationProbe(player.id);
  assert.equal(f.dimension.getEntities().length, 0);

});

test("chest fronts follow world cardinal directions in pool, sparse and dense projections", () => {
  const f = fixture();
  const registry = f.load("sublevel/render/fancy/model/FancySubLevelModelRegistry.ts");
  const layout = f.load("sublevel/render/fancy/model/FancySubLevelModelLayout.ts");
  const Renderer = f.load("sublevel/render/fancy/model/FancySubLevelModelRenderer.ts").FancySubLevelModelRenderer;
  const reader = modelResourceReader(join(sable, "packs/SableRP"), "sable/sublevel/fancy");
  // Native testing establishes Sable's chest facing. Compare the actual front
  // face against world directions instead of copying the reference's raw yaw.
  const directions = { north: [0, -1], east: [1, 0], south: [0, 1], west: [-1, 0] };
  for (const format of ["pool", "sparse", "dense"]) {
    const entries = Object.keys(directions).flatMap((direction, group) => (
      Array.from({ length: format === "dense" ? 27 : 1 }, (_, index) => (
        block("minecraft:chest", group * 5 + index % 3, 0, Math.floor(index / 3), {
          "minecraft:cardinal_direction": direction
        })
      ))
    ));
    const resolved = entries.map(registry.resolveFancySubLevelBlock).map(entry => (
      format === "pool" ? entry : { ...entry, model: { ...entry.model, pool: undefined } }
    ));
    const packs = layout.packFancySubLevelModels(resolved).models;
    assert(packs.length > 0 && packs.every(pack => pack.format === format), format);
    const renderer = new Renderer(body, packs, f.dimension.spawnEntity, undefined, undefined, { x: 0, y: 0, z: 0 });
    renderer.sync(true);
    renderer.releaseInitialPose();
    try {
      for (const open of [0, 1]) {
        for (const entry of entries) {
          const { x, y, z } = entry.localLocation;
          assert(renderer.setBlockModelState(`${x},${y},${z}`, "open", open));
        }
        const fronts = renderer.entityIds.map(id => f.entities.get(id))
          .filter(entity => !entity.typeId.includes("carrier"))
          .flatMap(entity => activeModelSurfaces(entity, reader(entity), true))
          .filter(face => face.uv.uv.join(",") === "14,33" && face.uv.uv_size.join(",") === "14,10");
        assert.equal(fronts.length, entries.length);
        const seen = new Set();
        for (const face of fronts) {
          const x = face.vertices.reduce((sum, point) => sum + point[0], 0) / 64;
          const z = -face.vertices.reduce((sum, point) => sum + point[2], 0) / 64;
          const entry = entries.find(entry => entry.localLocation.x === Math.round(x)
            && entry.localLocation.z === Math.round(z));
          assert(entry, `unexpected chest front at ${x}, ${z}`);
          assert(!seen.has(entry), "duplicate chest front");
          seen.add(entry);
          const direction = entry.states["minecraft:cardinal_direction"];
          const [dx, dz] = directions[direction];
          assert(Math.abs(x - entry.localLocation.x - dx * 7 / 16) < 1e-6
            && Math.abs(z - entry.localLocation.z - dz * 7 / 16) < 1e-6,
          `${format} ${direction} open=${open}: front offset ${x - entry.localLocation.x}, ${z - entry.localLocation.z}`);
        }
      }
    } finally { renderer.remove(); }
  }
});

test("mixed non-chest orientations retain baseline face transforms across pool, dense and sparse resources", () => {
  const f = fixture();
  const registry = f.load("sublevel/render/fancy/model/FancySubLevelModelRegistry.ts");
  const layout = f.load("sublevel/render/fancy/model/FancySubLevelModelLayout.ts");
  const expectedLayout = f.reference("render/contraption/fragment/FragmentLayout.ts");
  const visual = f.reference("render/contraption/fragment/FragmentVisual.ts").createFragmentVisual;
  const kinds = f.reference("content/tree/block/Blocks.ts");
  const ActualRenderer = f.load("sublevel/render/fancy/model/FancySubLevelModelRenderer.ts").FancySubLevelModelRenderer;
  const ExpectedRenderer = f.reference("render/contraption/fragment/FragmentRenderer.ts").FragmentRenderer;
  const actualReader = modelResourceReader(join(sable, "packs/SableRP"), "sable/sublevel/fancy");
  const expectedReader = modelResourceReader(join(baseline, "packs/TreePhysics/TreePhysicsRP"), "fragments");
  const entries = [];
  const add = (typeId, states) => {
    const index = entries.length;
    entries.push(block(typeId, index % 11 - 5, Math.floor(index / 11) - 3, index % 7 - 2, states));
  };
  for (const typeId of ["oak_log", "birch_log", "stripped_spruce_log", "oak_wood"]) {
    for (const pillar_axis of ["x", "y", "z"]) add(`minecraft:${typeId}`, { pillar_axis });
  }
  for (const direction of [0, 1, 2, 3]) {
    for (const honey_level of [0, 5]) add("minecraft:bee_nest", { direction, honey_level });
    for (const age of [0, 1, 2]) add("minecraft:cocoa", { direction, age });
  }
  for (const pillar_axis of ["x", "y", "z"]) {
    for (const creaking_heart_state of ["uprooted", "dormant", "awake"]) add("minecraft:creaking_heart", { pillar_axis, creaking_heart_state });
  }
  const sourceBlock = entry => {
    const snapshot = { ...entry, kind: kinds.playerEditableContraptionBlockKind(entry.typeId) };
    const result = { ...entry, visual: visual(snapshot) };
    assert(result.visual, entry.typeId);
    return result;
  };
  const formats = new Set();
  const layouts = [entries, entries.flatMap(entry => [0, 1, 2].map(index => ({
    ...entry, localLocation: { ...entry.localLocation, x: entry.localLocation.x + index * 24 }
  }))), [...entries, ...["x", "y", "z"].flatMap((pillar_axis, axis) => Array.from({ length: 27 }, (_, index) => (
    block("minecraft:birch_wood", 20 + axis * 4 + index % 3, Math.floor(index / 9), 20 + Math.floor(index / 3) % 3, { pillar_axis })
  )))]];
  for (const targets of layouts) for (const rotation of [{ x: 0, y: 0, z: 0 }, { x: 23, y: -41, z: 17 }]) {
    const renderBody = { ...body, getRotation: () => rotation };
    for (const pooled of [true, false]) {
      const resolved = targets.map(registry.resolveFancySubLevelBlock).map(entry => pooled ? entry : { ...entry, model: { ...entry.model, pool: undefined } });
      const packs = layout.packFancySubLevelModels(resolved).models;
      packs.forEach(pack => formats.add(pack.format));
      assert.equal(packs.some(pack => pack.format === "pool"), pooled);
      const actual = new ActualRenderer(renderBody, packs, f.dimension.spawnEntity, undefined, undefined, { x: 0, y: 0, z: 0 });
      const expected = new ExpectedRenderer(renderBody, expectedLayout.packFragments(targets.map(entry => sourceBlock(treePhysicsComparableEntry(entry)))), f.dimension.spawnEntity, undefined, undefined, { x: 0, y: 0, z: 0 });
      actual.sync(true); expected.sync(true);
      actual.releaseInitialPose(); expected.releaseInitialPose();
      const surfaces = (renderer, reader) => renderer.entityIds
        .map(id => f.entities.get(id)).filter(entity => !entity.typeId.includes("carrier"))
        .flatMap(entity => activeModelSurfaces(entity, reader(entity), true))
        .sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
      assert.deepEqual(surfaces(actual, actualReader), surfaces(expected, expectedReader), `pool=${pooled} rotation=${JSON.stringify(rotation)}`);
      actual.remove(); expected.remove();
    }
  }
  assert.deepEqual([...formats].sort(), ["dense", "pool", "sparse"]);
});

test("registered non-chest state variants select baseline textures, materials, visible cubes and rotations", () => {
  const f = fixture();
  const actualReader = modelResourceReader(join(sable, "packs/SableRP"), "sable/sublevel/fancy");
  const expectedReader = modelResourceReader(join(baseline, "packs/TreePhysics/TreePhysicsRP"), "fragments");
  const definitions = json(join(sable, "src/data/sublevel-block.json")).blocks;
  const registry = f.load("sublevel/render/fancy/model/FancySubLevelModelRegistry.ts");
  const layout = f.load("sublevel/render/fancy/model/FancySubLevelModelLayout.ts");
  const ExpectedRenderer = f.reference("render/contraption/fragment/FragmentRenderer.ts").FragmentRenderer;
  const ActualRenderer = f.load("sublevel/render/fancy/model/FancySubLevelModelRenderer.ts").FancySubLevelModelRenderer;
  const expectedLayout = f.reference("render/contraption/fragment/FragmentLayout.ts");
  const visual = f.reference("render/contraption/fragment/FragmentVisual.ts").createFragmentVisual;
  const kinds = f.reference("content/tree/block/Blocks.ts");
  const stateValues = {
    pillar_axis: ["y", "x", "z"], cardinal_direction: ["south", "west", "north", "east"],
    old_log_type: ["oak", "spruce", "birch", "jungle"], new_log_type: ["acacia", "dark_oak"],
    old_leaf_type: ["oak", "spruce", "birch", "jungle"], new_leaf_type: ["acacia", "dark_oak"],
    direction: [0, 1, 2, 3], age: [0, 1, 2], honey_level: [0, 1, 4, 5],
    hanging: [true], propagule_stage: [0, 1, 2, 3, 4], tip: [false, true],
    vine_direction_bits: Array.from({ length: 16 }, (_, i) => i),
    creaking_heart_state: ["uprooted", "dormant", "awake"]
  };
  const field = { gradientAxis: "x", mapKind: 1, uAtLocalOrigin: 0.4, uPerLocalX: 0, vAtLocalOrigin: 0.7, vPerLocalZ: 0 };
  let checked = 0;
  for (const [typeId, definition] of Object.entries(definitions)) {
    // Chest geometry is compared separately; its world facing has a native-
    // verified expectation in the cardinal-direction test above.
    if (typeId === "minecraft:chest") continue;
    let permutations = [{}];
    for (const name of definition.states) {
      const values = stateValues[name.replace("minecraft:", "")];
      assert(values, `uncovered state ${name}`);
      const nativeName = name.endsWith(":cardinal_direction") ? name : name.replace("minecraft:", "");
      permutations = permutations.flatMap(states => values.map(value => ({ ...states, [nativeName]: value })));
    }
    for (const states of permutations) {
      const target = block(typeId, 0, 0, 0, states);
      const source = { ...treePhysicsComparableEntry(target), kind: kinds.playerEditableContraptionBlockKind(typeId) };
      source.visual = visual(source);
      if (!source.visual) continue;
      const expected = new ExpectedRenderer(body, expectedLayout.packFragments([source]), f.dimension.spawnEntity, field, undefined, target.localLocation);
      const actual = new ActualRenderer(body, layout.packFancySubLevelModels([registry.resolveFancySubLevelBlock(target)]).models, f.dimension.spawnEntity, field, undefined, target.localLocation);
      expected.sync(true); expected.releaseInitialPose();
      actual.sync(true); actual.releaseInitialPose();
      const surfaces = (renderer, reader) => renderer.entityIds
        .map(id => f.entities.get(id)).filter(entity => !entity.typeId.includes("carrier"))
        .flatMap(entity => activeModelSurfaces(entity, reader(entity)));
      assert.deepEqual(surfaces(actual, actualReader), surfaces(expected, expectedReader), `${typeId} ${JSON.stringify(states)}`);
      actual.remove(); expected.remove();
      checked++;
    }
  }
  assert(checked >= 200, `only ${checked} states were compared`);
});

test("vine sampling buckets and UV gradients match mixed baseline attachments", () => {
  const f = fixture();
  const registry = f.load("sublevel/render/fancy/model/FancySubLevelModelRegistry.ts");
  const layout = f.load("sublevel/render/fancy/model/FancySubLevelModelLayout.ts");
  const sourceLayout = f.reference("render/contraption/fragment/FragmentLayout.ts");
  const visual = f.reference("render/contraption/fragment/FragmentVisual.ts").createFragmentVisual;
  const kinds = f.reference("content/tree/block/Blocks.ts");
  const actualTint = f.load("sublevel/render/fancy/model/FancySubLevelTintCodec.ts");
  const sourceTint = f.reference("render/foliage/TintCodec.ts");
  const ActualRenderer = f.load("sublevel/render/fancy/model/FancySubLevelModelRenderer.ts").FancySubLevelModelRenderer;
  const ExpectedRenderer = f.reference("render/contraption/fragment/FragmentRenderer.ts").FragmentRenderer;
  const actualReader = modelResourceReader(join(sable, "packs/SableRP"), "sable/sublevel/fancy");
  const expectedReader = modelResourceReader(join(baseline, "packs/TreePhysics/TreePhysicsRP"), "fragments");
  for (const axis of ["x", "z"]) {
    const entries = Array.from({ length: 40 }, (_, index) => block("minecraft:vine", index % 13 - 3, index % 7, Math.floor(index / 4), { vine_direction_bits: index % 15 + 1 }));
    entries.push(block("minecraft:muddy_mangrove_roots", -9, 1, -8), block("minecraft:hanging_roots", 3, 10, 4));
    const source = entries.map(entry => {
      const snapshot = { ...entry, kind: kinds.playerEditableContraptionBlockKind(entry.typeId) };
      return { ...entry, visual: visual(snapshot) };
    });
    const actual = layout.packFancySubLevelModels(entries.map(registry.resolveFancySubLevelBlock)).models;
    const expected = sourceLayout.packFragments(source);
    assert(actual.some(pack => pack.format === "pool"), "vine state variants must share model pool entities");
    assert(actual.filter(pack => pack.tint?.method === "foliage").length <= expected.length);
    const field = { gradientAxis: axis, mapKind: 1, uAtLocalOrigin: 0.35, uPerLocalX: 0.018, vAtLocalOrigin: 0.43, vPerLocalZ: -0.009 };
    for (const entry of entries.filter(entry => entry.typeId === "minecraft:vine")) {
      const key = [entry.localLocation.x, entry.localLocation.y, entry.localLocation.z].join(",");
      const actualPack = actual.find(pack => pack.assignments.some(a => a.blockKey === key));
      const expectedPack = expected.find(pack => pack.assignments.some(a => a.blockKey === key));
      assert.deepEqual(actualPack.anchorLocalLocation, expectedPack.anchorLocalLocation, key);
      assert.equal(actualTint.packFancySubLevelTint(actualPack, field), sourceTint.packFragmentFoliageTint(expectedPack, field), key);
    }
    const actualRender = new ActualRenderer(body, actual, f.dimension.spawnEntity, field, undefined, { x: 0, y: 0, z: 0 });
    const expectedRender = new ExpectedRenderer(body, expected, f.dimension.spawnEntity, field, undefined, { x: 0, y: 0, z: 0 });
    actualRender.sync(true); expectedRender.sync(true);
    actualRender.releaseInitialPose(); expectedRender.releaseInitialPose();
    const surfaces = (renderer, reader) => renderer.entityIds
      .map(id => f.entities.get(id)).filter(entity => !entity.typeId.includes("carrier"))
      .flatMap(entity => activeModelSurfaces(entity, reader(entity)))
      .sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
    assert.deepEqual(surfaces(actualRender, actualReader), surfaces(expectedRender, expectedReader));
    const samples = (renderer, reader) => renderer.entityIds.flatMap(id => {
      const entity = f.entities.get(id);
      if (entity.typeId.includes("carrier")) return [];
      const { client, controllers } = reader(entity);
      const evaluate = resourceEvaluator(entity, client);
      return client.render_controllers.flatMap(entry => {
        const [name, condition] = typeof entry === "string" ? [entry, true] : Object.entries(entry)[0];
        const controller = controllers[name];
        if (!evaluate(condition) || !controller.uv_anim) return [];
        const visible = (controller.part_visibility ?? []).some(part => Object.entries(part).some(([bone, value]) => bone !== "*" && evaluate(value)));
        if (!visible) return [];
        return [{ offset: controller.uv_anim.offset.map(value => evaluate(value)), scale: controller.uv_anim.scale.map(value => evaluate(value)) }];
      });
    }).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
    assert.deepEqual(samples(actualRender, actualReader), samples(expectedRender, expectedReader));
    actualRender.remove(); expectedRender.remove();
  }
});

function interactionFixture(typeId, inputMode, sneaking = false, origin = { x: 0.5, y: 0.5, z: -2.5 }, direction = { x: 0, y: 0, z: 1 }) {
  const f = managedFixture();
  const player = {
    id: "player", isValid: true, isSneaking: sneaking, dimension: f.dimension, selectedSlotIndex: 0,
    inputInfo: { lastInputModeUsed: inputMode }, getGameMode: () => f.server.GameMode.Survival,
    getHeadLocation: () => origin, getViewDirection: () => direction,
    getBlockFromViewDirection: () => undefined, getComponent: () => undefined,
    setPropertyOverrideForEntity() {}, clearPropertyOverridesForEntity() {}
  };
  f.server.world.getPlayers = () => [player];
  const Controller = f.load("content/punching/SubLevelPlayerInteraction.ts").SubLevelPlayerInteractionController;
  const controller = new Controller(f.runtime);
  controller.setBlockInteractHandler(f.containers);
  controller.start();
  f.flush();
  const managed = f.manager.createSubLevel(f.dimension, { x: 0, y: 0, z: 0 }, [block(typeId)]);
  f.flush();
  const tick = () => controller.tick(f.system.currentTick);
  tick();
  const proxies = () => [...f.cells.values()].filter(cell => cell.typeId === "sable:interaction_target").map(cell => cell.location);
  return { ...f, controller, managed, player, tick, proxies };
}

test("standing desktop containers claim a mining proxy only after a left attack", () => {
  for (const axis of ["x", "y", "z"]) for (const sign of [-1, 1]) {
    const origin = { x: 0.5, y: 0.5, z: 0.5 };
    origin[axis] -= sign * 3;
    const direction = { x: 0, y: 0, z: 0, [axis]: sign };
    const f = interactionFixture("minecraft:chest", "keyboard", false, origin, direction);
    assert.deepEqual(f.proxies(), [], "right-click target stays unobstructed by default");
    f.signals.get("playerSwingStart").forEach(callback => callback({
      player: f.player,
      swingSource: f.server.EntitySwingSource.Attack,
      heldItemStack: undefined
    }));
    assert.equal(f.proxies().length, 1, `proxy is created for ${axis}${sign}`);
    const storage = [...f.entities.values()].find(entity => entity.typeId === "sable:chest");
    assert(storage.events.includes("sable:chest_activate"), "native opening remains active");
  }
});

test("stationary container posture and input changes release the mining lease", () => {
  const f = interactionFixture("minecraft:chest", "touch", true);
  const headCell = { x: 0, y: 0, z: -3 };
  assert.deepEqual(f.proxies(), [headCell]);
  f.player.isSneaking = false;
  f.tick();
  assert.deepEqual(f.proxies(), [], "standing touch must release the previous mining proxy");
  f.player.inputInfo.lastInputModeUsed = "keyboard";
  f.tick();
  assert.deepEqual(f.proxies(), [], "standing keyboard keeps the entity target unobstructed");
  f.signals.get("playerSwingStart").forEach(callback => callback({
    player: f.player,
    swingSource: f.server.EntitySwingSource.Attack,
    heldItemStack: undefined
  }));
  assert.equal(f.proxies().length, 1);
  f.player.inputInfo.lastInputModeUsed = "touch";
  f.tick();
  assert.deepEqual(f.proxies(), []);
  f.player.isSneaking = true;
  f.tick();
  assert.deepEqual(f.proxies(), [headCell], "sneaking must restore touch mining without moving the ray");
});

test("standing desktop mining leases end on right interaction or attack timeout", () => {
  const f = interactionFixture("minecraft:chest", "keyboard", false);
  f.signals.get("playerSwingStart").forEach(callback => callback({
    player: f.player,
    swingSource: f.server.EntitySwingSource.Attack,
    heldItemStack: undefined
  }));
  assert.equal(f.proxies().length, 1);
  f.signals.get("playerInteractWithEntity").forEach(callback => callback({ player: f.player }));
  assert.deepEqual(f.proxies(), [], "right interaction releases the mining lease immediately");

  f.signals.get("playerSwingStart").forEach(callback => callback({
    player: f.player,
    swingSource: f.server.EntitySwingSource.Attack,
    heldItemStack: undefined
  }));
  assert.equal(f.proxies().length, 1);
  for (let tick = 0; tick < 8; tick++) {
    f.flush();
    f.tick();
  }
  assert.deepEqual(f.proxies(), [], "no further left attack expires the lease");
});

test("non-container and sneaking desktop selection retain the original proxy cell", () => {
  for (const typeId of ["minecraft:oak_log", "minecraft:chest"]) {
    for (const inputMode of ["keyboard", "touch"]) for (const sneaking of [false, true]) {
      if (typeId === "minecraft:chest" && !sneaking) {
        const f = interactionFixture(typeId, inputMode, sneaking);
        assert.deepEqual(f.proxies(), []);
        continue;
      }
      const f = interactionFixture(typeId, inputMode, sneaking);
      assert.deepEqual(f.proxies(), [{ x: 0, y: 0, z: inputMode === "touch" ? -3 : -1 }]);
    }
  }
});

test("touch standing containers consume stale mining signals while other mining retains baseline gestures", () => {
  function run(reference, tap, sneaking, typeId) {
    const f = fixture();
    const calls = [];
    const target = { subLevelId: 1, contraptionId: 1, blockKey: "0,0,0", face: "up" };
    class Outline {
      start() {}
      setInteractionTargetSuppressor() {}
      captureActionTarget() { return target; }
      handleBreak() { calls.push("break"); }
      handlePlace() { calls.push("place"); }
      isManagedInteractionTarget() { return true; }
    }
    const outlineExports = {
      SubLevelOutlineController: Outline, ContraptionOutlineController: Outline,
      INTERACTION_REACH: 5, WORLD_BLOCK_OCCLUSION_EPSILON: 0.001
    };
    const load = moduleLoader(join(reference ? baseline : sable, "src"), f.server, {
      "content/block_outline_render/SubLevelOutlineController.ts": outlineExports,
      "content/contraption/interaction/OutlineController.ts": outlineExports,
      "api/player/ActivePlayerRegistry.ts": { ActivePlayerRegistry: class { start() {} } },
      "service/ActivePlayerRegistry.ts": { ActivePlayerRegistry: class { start() {} } }
    });
    const handle = { id: 1, raycast: () => ({ block: block(typeId), distance: 2 }) };
    const runtime = {
      hasSubLevels: () => true, getRaycastRevision: () => 0, getRaycastCandidates: () => [handle],
      getDimension: () => ({ hasContraptions: () => true, contraptionRevision: 0, getRaycastCandidates: () => [handle] })
    };
    const Controller = reference
      ? load("content/player/Interaction.ts").PlayerInteractionController
      : load("content/punching/SubLevelPlayerInteraction.ts").SubLevelPlayerInteractionController;
    const controller = new Controller(runtime);
    const handler = { hasSyncTargets: () => true, canInteract: () => typeId === "minecraft:chest", interact: () => true };
    if (reference) controller.setContraptionInteractHandler(handler);
    else controller.setBlockInteractHandler(handler);
    controller.start();
    const item = { typeId: "minecraft:diamond_axe" };
    f.server.BlockTypes.get = id => id === item.typeId ? undefined : { id };
    const player = {
      id: "player", isValid: true, isSneaking: sneaking, dimension: f.dimension, selectedSlotIndex: 0,
      inputInfo: { lastInputModeUsed: f.server.InputMode.Touch }, getGameMode: () => f.server.GameMode.Survival,
      getHeadLocation: () => ({ x: 0, y: 0, z: 0 }), getViewDirection: () => ({ x: 0, y: 0, z: 1 }),
      getBlockFromViewDirection: () => undefined,
      getComponent: () => ({ container: { getItem: () => item } })
    };
    f.signals.get("playerSwingStart").forEach(callback => callback({ player, swingSource: f.server.EntitySwingSource.Mine, heldItemStack: item }));
    if (tap) f.signals.get("playerInteractWithBlock").forEach(callback => callback({ player, itemStack: item, isFirstEvent: true }));
    f.flush();
    return calls;
  }
  for (const tap of [false, true]) {
    assert.deepEqual(run(false, tap, false, "minecraft:chest"), [], `standing chest tap=${tap}`);
    for (const [sneaking, typeId] of [[true, "minecraft:chest"], [false, "minecraft:oak_log"], [true, "minecraft:oak_log"]]) {
      assert.deepEqual(run(false, tap, sneaking, typeId), run(true, tap, sneaking, typeId), `${typeId} sneaking=${sneaking} tap=${tap}`);
    }
  }
});

test("reloaded stale render entities are reclaimed without touching live renderers or inventories", () => {
  const f = managedFixture();
  const target = block("minecraft:chest", 0, 0, 0, { "minecraft:cardinal_direction": "south" });
  const managed = f.manager.createSubLevel(f.dimension, target.localLocation, [target]);
  f.flush();
  const owned = [...f.entities.values()];
  const model = f.load("sublevel/render/fancy/model/FancySubLevelModelRegistry.ts").resolveFancySubLevelBlock(target).model;
  const stale = f.dimension.spawnEntity(model.dense.entityTypeId, target.localLocation);
  for (const entity of [...owned, stale]) f.manager.handleVisualEntityLoad(entity);
  f.flush();
  assert.equal(stale.isValid, false);
  assert(owned.every(entity => entity.isValid));
  assert(managed.handle.renderData.hasIntactEntities());
});

test("Fancy inputs initialize before the first animation packet without overwriting delivered values", () => {
  const pack = join(sable, "packs/SableRP");
  const folder = join(pack, "entity/sable/sublevel/fancy");
  const reader = modelResourceReader(pack, "sable/sublevel/fancy");
  for (const file of readdirSync(folder, { recursive: true }).filter(file => file.endsWith(".json"))) {
    const client = json(join(folder, file))["minecraft:client_entity"].description;
    const entity = { typeId: client.identifier, molang: {}, getProperty: () => 0 };
    const resources = reader(entity);
    assert.deepEqual(activeModelSurfaces(entity, resources), [], `${file}: awaiting input must render no faces`);
    const inputs = {
      origin_xz: 2098176, origin_y: 2048 + 6 * 4096 + 6 * 131072,
      pitch_target: 17, yaw_target: 85, roll_target: -9,
      model_variant: 0, model_rx: 90, model_ry: 180, model_rz: 270,
      tint_input: 7 * 1048576 + 48, s0: 1
    };
    const evaluate = resourceEvaluator({ ...entity, molang: inputs }, client);
    for (const [name, value] of Object.entries(inputs)) {
      assert.equal(evaluate(`v.${name}`), value, `${file}: initialize must retain delivered ${name}`);
    }
  }
});

test("generic model selection shares entities while preserving independent texture bindings", () => {
  const f = fixture();
  const registry = f.load("sublevel/render/fancy/model/FancySubLevelModelRegistry.ts");
  const stone = registry.resolveFancySubLevelBlock(block("minecraft:stone")).model;
  const dirt = registry.resolveFancySubLevelBlock(block("minecraft:dirt")).model;
  const reader = modelResourceReader(join(sable, "packs/SableRP"), "sable/sublevel/fancy");
  for (const format of ["dense", "sparse"]) {
    assert.equal(stone[format].entityTypeId, dirt[format].entityTypeId);
    assert.notEqual(stone[format].variant, dirt[format].variant);
    for (const [model, texture] of [[stone, "textures/blocks/stone"], [dirt, "textures/blocks/dirt"]]) {
      const resource = model[format];
      const entity = { typeId: resource.entityTypeId, molang: { model_variant: resource.variant, s0: 1, origin_y: 2048 }, getProperty: () => 0 };
      const passes = activeRenderPasses(entity, reader(entity));
      assert.equal(passes.length, 1);
      const { controller, arrays, evaluate } = passes[0];
      assert.equal(evaluate(controller.textures[0], arrays), texture);
      assert.equal(evaluate(controller.materials[0]["*"], arrays), "opaque_block");
    }
  }
});

test("animation snapshots retain selection, state and tint through pose changes and client re-tracking", () => {
  const f = fixture();
  const registry = f.load("sublevel/render/fancy/model/FancySubLevelModelRegistry.ts");
  const layout = f.load("sublevel/render/fancy/model/FancySubLevelModelLayout.ts");
  const { FancySubLevelModelRenderer } = f.load("sublevel/render/fancy/model/FancySubLevelModelRenderer.ts");
  const rotation = { x: 0, y: 0, z: 0 };
  const movingBody = { ...body, isSleeping: false, getRotation: () => ({ ...rotation }) };
  const packed = layout.packFancySubLevelModels([registry.resolveFancySubLevelBlock(block("minecraft:grass_block"))]).models;
  const tint = f.load("sublevel/render/fancy/model/FancySubLevelTintCodec.ts").DEFAULT_SUBLEVEL_FOLIAGE_TINT;
  const anchor = f.load("util/SublevelRenderOffsetHelper.ts").DEFAULT_SUBLEVEL_RENDER_ANCHOR_LOCAL;
  const renderer = new FancySubLevelModelRenderer(movingBody, packed, f.dimension.spawnEntity, tint, undefined, anchor, undefined);
  renderer.sync(true);
  renderer.releaseInitialPose();
  f.flush();
  const entity = renderer.entityIds.map(id => f.entities.get(id)).find(entity => !entity.typeId.includes("carrier"));
  const initial = { ...entity.molang };
  Object.assign(rotation, { x: 17, y: 85, z: -9 });
  renderer.sync();
  assert.deepEqual([entity.molang.pitch_target, entity.molang.yaw_target, entity.molang.roll_target], [17, 85, -9]);
  for (const name of ["model_variant", "s0", "origin_y", "tint_input"]) assert.equal(entity.molang[name], initial[name]);
  assert.deepEqual(entity.properties, {});
  assert.equal(entity.animationOptions.controller, "sable_fancy_input");
  assert.match(entity.animationOptions.stopExpression, /return 0;$/);
  const latest = { ...entity.molang };
  const writes = entity.animationWrites;
  movingBody.isSleeping = true;
  renderer.sync();
  for (let tick = 2; tick < 40; tick++) { f.system.currentTick = tick; renderer.sync(); }
  assert.equal(entity.animationWrites, writes, "stationary frames must not send animation commands");
  entity.molang = {};
  f.system.currentTick = 40;
  renderer.sync();
  assert.deepEqual(entity.molang, latest);
  assert.equal(entity.animationWrites, writes + 1);
  renderer.remove();
});

test("one unreadable saved record cannot prevent other structures from restoring or reuse its id", () => {
  const f = managedFixture();
  f.saved.set("region_9", undefined);
  f.saved.set("region_2", {
    id: "region_2", dimensionId: f.dimension.id, origin: { x: 0, y: 0, z: 0 },
    blocks: [block("minecraft:oak_log")], containerStorages: []
  });
  f.manager.initialize();
  f.manager.tick(20);
  assert.equal([...f.entities.values()].filter(entity => entity.isValid).length, 2);
  assert.equal(f.manager.createSubLevel(f.dimension, { x: 3, y: 0, z: 0 }, [block("minecraft:oak_log")]).id, "region_10");
});

test("failed storage mounting during reconstruction rolls back with the original inventory attached", () => {
  const f = managedFixture();
  const target = block("minecraft:chest", 0, 0, 0, { "minecraft:cardinal_direction": "south" });
  const managed = f.manager.createSubLevel(f.dimension, target.localLocation, [target]);
  f.flush();
  const chest = [...f.entities.values()].find(entity => entity.typeId === "sable:chest");
  chest.getComponent("minecraft:inventory").container.setItem(4, { typeId: "minecraft:diamond", amount: 8 });
  let failed = false;
  const spawn = f.dimension.spawnEntity;
  f.dimension.spawnEntity = (...args) => {
    const entity = spawn(...args);
    const getComponent = entity.getComponent;
    entity.getComponent = name => {
      const component = getComponent.call(entity, name);
      if (name !== "minecraft:rideable") return component;
      const addRider = component.addRider;
      return { ...component, addRider(rider) {
        if (!failed && rider === chest) { failed = true; throw new Error("mount failure"); }
        return addRider(rider);
      } };
    };
    return entity;
  };
  assert.throws(() => f.manager.placeBlockForPlayerEdit({}, { typeId: "minecraft:beacon" }, managed.handle, target, { x: 1, y: 0, z: 0 }, "south"), /mount failure/);
  f.flush();
  assert.equal(managed.blockCount, 1);
  assert(chest.isValid && chest.vehicle, "the original inventory must remain attached after rollback");
  assert.deepEqual(chest.getComponent("minecraft:inventory").container.getItem(4), { typeId: "minecraft:diamond", amount: 8 });
  assert(managed.handle.renderData.hasIntactEntities());
});
