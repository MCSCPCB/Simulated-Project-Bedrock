import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import test from "node:test";
import ts from "typescript";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const sable = join(root, "sable");
const baseline = join(root, ".sample/TreePhysics");
const vanilla = join(root, ".sample/VanillaBlock/VanillaBlockResource");
const nativeRequire = createRequire(import.meta.url);
const json = path => {
  const result = ts.parseConfigFileTextToJson(path, readFileSync(path, "utf8"));
  if (result.error) throw new Error(`Invalid JSON: ${path}`);
  return result.config;
};

function pngHeight(path) {
  const bytes = readFileSync(path);
  assert.equal(bytes.readUInt32BE(0), 0x89504e47, `${path}: PNG signature`);
  assert.equal(bytes.toString("ascii", 12, 16), "IHDR", `${path}: PNG IHDR`);
  return bytes.readUInt32BE(20);
}

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
      if (specifier.startsWith("node:")) return nativeRequire(specifier);
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
  const timeouts = [];
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
    run: callback => queued.push(callback),
    runTimeout: (callback, ticks = 1) => timeouts.push({ tick: system.currentTick + ticks, callback }),
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
  const flush = () => {
    system.currentTick++;
    const current = queued.splice(0);
    for (let index = 0; index < timeouts.length;) {
      if (timeouts[index].tick <= system.currentTick) current.push(timeouts.splice(index, 1)[0].callback);
      else index++;
    }
    current.forEach(callback => callback());
  };
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
      const skeleton = new Map(geometry.bones.map(bone => [bone.name, bone]));
      for (const bone of geometry.bones) {
        assert(!names.has(bone.name), `${file}: duplicate ${bone.name}`);
        names.add(bone.name);
        const transform = { parent: bone.parent, pivot: bone.pivot, rotation: bone.rotation };
        if (rest.has(bone.name)) assert.deepEqual(transform, rest.get(bone.name), `${file}: conflicting ${bone.name}`);
        else rest.set(bone.name, transform);
        if (bone.cubes?.length) {
          let ancestor = bone;
          while (ancestor && !/^slot_\d+$/.test(ancestor.name)) ancestor = skeleton.get(ancestor.parent);
          assert(ancestor, `${file}/${identifier}/${bone.name}: geometry must inherit an animated slot`);
        }
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

test("grass covers the cube once and matches the unshifted multiply shell vertex for vertex", () => {
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
  const fullCube = { origin: [-8, -24, -8], size: [16, 16, 16] };
  const faceNames = ["down", "east", "north", "south", "up", "west"];
  const rectangle = (cube, face) => {
    const [origin, right, bottom] = bedrockCubeFaceVertices(fullCube, face);
    const uAxis = right.map((value, axis) => (value - origin[axis]) / 16);
    const vAxis = bottom.map((value, axis) => (value - origin[axis]) / 16);
    const coordinates = bedrockCubeFaceVertices(cube, face).map(point => {
      const u = point.reduce((sum, value, axis) => sum + (value - origin[axis]) * uAxis[axis], 0);
      const v = point.reduce((sum, value, axis) => sum + (value - origin[axis]) * vAxis[axis], 0);
      assert.deepEqual(point, origin.map((value, axis) => value + u * uAxis[axis] + v * vAxis[axis]),
        `${face}: shell must lie on the native full-block plane`);
      return [u, v];
    });
    const [u, v] = coordinates[0];
    const width = coordinates[1][0] - u;
    const height = coordinates[2][1] - v;
    assert.deepEqual(coordinates, [[u, v], [u + width, v], [u, v + height], [u + width, v + height]]);
    assert(width > 0 && height > 0);
    assert([u, v, width, height].every(Number.isInteger));
    assert(u >= 0 && v >= 0 && u + width <= 16 && v + height <= 16);
    return [u, v, width, height];
  };
  const cover = (coverage, face, [u, v, width, height]) => {
    for (let row = v; row < v + height; row++) for (let column = u; column < u + width; column++) {
      coverage[face][row * 16 + column]++;
    }
  };
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
    const baseCoverage = Object.fromEntries(faceNames.map(face => [face, Array(256).fill(0)]));
    const baseVertices = new Set();
    for (const { controller, evaluate, arrays } of bases) {
      const bone = geometries.get(evaluate(controller.geometry, arrays)).bones.find(bone => bone.name === "slot_0");
      assert.equal(bone.parent, "model_offset");
      assert.deepEqual(bone.pivot, [0, -16, 0]);
      for (const cube of bone.cubes) for (const [face, uv] of Object.entries(cube.uv)) {
        assert.equal(cube.inflate, undefined);
        const [u, v, width, height] = rectangle(cube, face);
        assert.deepEqual(uv, { uv: [u, v], uv_size: [width, height] });
        assert.equal(evaluate(controller.textures[0], arrays), face === "up" ? "textures/blocks/grass_top"
          : face === "down" ? "textures/blocks/dirt" : "textures/blocks/grass_side");
        cover(baseCoverage, face, [u, v, width, height]);
        baseVertices.add(JSON.stringify([face, bedrockCubeFaceVertices(cube, face)]));
      }
    }
    for (const face of faceNames) assert.deepEqual(baseCoverage[face], Array(256).fill(1), `${format}/${face}: complete base without overlaps`);
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
        const coverage = Object.fromEntries(faceNames.map(face => [face, Array(256).fill(0)]));
        const shellVertices = [];
        for (const cube of bone.cubes) {
          assert.equal(cube.inflate, undefined);
          const [face, uv] = Object.entries(cube.uv)[0];
          assert.equal(Object.keys(cube.uv).length, 1);
          assert.notEqual(face, "down");
          const [u, v, width, height] = rectangle(cube, face);
          const slot = Number(bone.name.slice(5));
          const climateWidth = alias.includes("compact") ? 6 : 7;
          const ramp = format === "sparse" ? 0 : 16 * (alias.endsWith("_x")
            ? slot % climateWidth : Math.floor(slot / climateWidth) % climateWidth);
          assert.deepEqual(uv, { uv: [ramp + u, ramp + v], uv_size: [width, height] });
          cover(coverage, face, [u, v, width, height]);
          shellVertices.push(JSON.stringify([face, bedrockCubeFaceVertices(cube, face)]));
        }
        for (const face of faceNames) {
          const expected = face === "up" ? Array(256).fill(1) : face === "down" ? Array(256).fill(0) : alpha;
          assert.deepEqual(coverage[face], expected, `${format}/${alias}/${bone.name}/${face}`);
        }
        for (const vertices of shellVertices) assert(baseVertices.has(vertices),
          `${format}/${alias}/${bone.name}: Equal-depth tint requires the same base vertices and face winding`);
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

test("corrected terrain classification is complete and the registry is the only source of registrations", async () => {
  const data = join(root, ".sample/VanillaBlock/VanillaBlockData/main");
  const readData = file => JSON.parse(readFileSync(join(data, file), "utf8"));
  const groups = readdirSync(data, { recursive: true }).filter(file => file.endsWith("blocks.json"));
  const classified = groups.flatMap(readData);
  const source = readData("blocks-1.26.45.json");
  assert.equal(classified.length, 1356);
  assert.equal(new Set(classified.map(entry => entry.name)).size, classified.length);
  assert.deepEqual(classified.map(entry => entry.name).sort(), source.map(entry => entry.name).sort());
  for (const [name, category] of Object.entries({
    redstone_torch: "红石", cobblestone_wall: "围栏与攀爬", wooden_door: "门",
    diamond_ore: "矿石与金属", bamboo_mosaic_stairs: "楼梯", ice: "水体与冰雪",
    fire_coral: "水体与冰雪", glowstone: "光源", pale_hanging_moss: "植物与花卉"
  })) assert.equal(classified.find(entry => entry.name === name).catalog, category, name);
  const expected = readData("自然/地形与石材/blocks.json").map(entry => `minecraft:${entry.name}`).sort();
  const expectedOres = readData("自然/矿石与金属/blocks.json").map(entry => `minecraft:${entry.name}`).sort();
  const expectedCrops = readData("自然/农作物/blocks.json").map(entry => `minecraft:${entry.name}`).sort();
  const file = join(sable, "src/data/sublevel-block.json");
  const raw = json(file);
  const compiler = moduleLoader(join(sable, "tools"), {})("sublevel-block/registry.ts");
  const compiled = await compiler.readAndCompileRegistry(file);
  assert.equal(Object.keys(raw.blocks).length, 190);
  assert.equal(expected.length, 81);
  assert.equal(expectedOres.length, 33);
  assert.equal(expectedCrops.length, 15);
  assert.deepEqual(Object.entries(raw.blocks).filter(([, entry]) => entry.category === "nature/terrain_and_stone").map(([id]) => id).sort(), expected);
  assert.deepEqual(Object.entries(raw.blocks).filter(([, entry]) => entry.category === "nature/ores_and_metals").map(([id]) => id).sort(), expectedOres);
  assert.deepEqual(Object.entries(raw.blocks).filter(([, entry]) => entry.category === "nature/crops").map(([id]) => id).sort(), expectedCrops);
  assert.deepEqual(Object.keys(compiled.compiled).sort(), Object.keys(raw.blocks).sort());
  const grass = raw.blocks["minecraft:grass_block"];
  const copies = compiler.compileRegistry({ format_version: "1.0.0", blocks: {
    "minecraft:grass_block": grass, "example:grass_block": grass
  } });
  assert.equal(copies["minecraft:grass_block"].default.grassTint, true);
  assert.equal(copies["example:grass_block"].default.grassTint, undefined);
  assert.notEqual(copies["minecraft:grass_block"].default.key, copies["example:grass_block"].default.key);
  const textures = new Set();
  const collect = value => {
    if (typeof value === "string" && value.startsWith("textures/")) textures.add(value);
    else if (value && typeof value === "object") Object.values(value).forEach(collect);
  };
  for (const id of expected) collect(raw.blocks[id]);
  for (const texture of textures) assert([".png", ".tga"].some(extension => (
    existsSync(join(vanilla, "bedrock-sample-1.26.40.5/resource_pack", texture + extension))
  )), texture);
});

test("terrain tools use the registered category and harvest tier, including unbreakable bedrock", () => {
  const f = fixture();
  const { getVanillaBlockBreakTicks } = f.load("content/punching/SubLevelMiningTime.ts");
  const { getSubLevelBlockRegistration } = f.load("sublevel/render/fancy/model/FancySubLevelModelRegistry.ts");
  const ticks = (id, typeId, efficiencyLevel = 0) => {
    const entry = getSubLevelBlockRegistration(`minecraft:${id}`);
    return getVanillaBlockBreakTicks(entry.hardness, { typeId, efficiencyLevel }, entry.mining);
  };
  assert.equal(ticks("stone"), 150);
  assert.equal(ticks("stone", "minecraft:wooden_pickaxe"), 23);
  assert.equal(ticks("stone", "minecraft:diamond_axe", 5), 150);
  assert.equal(ticks("grass_block", "minecraft:diamond_shovel"), 3);
  assert.equal(ticks("grass_block", "minecraft:diamond_pickaxe"), 18);
  assert.equal(ticks("sculk", "minecraft:wooden_hoe"), 3);
  assert.equal(ticks("obsidian", "minecraft:diamond_pickaxe"), 188);
  assert.equal(ticks("obsidian", "minecraft:iron_pickaxe"), 834);
  assert.equal(ticks("bedrock", "minecraft:netherite_pickaxe", 5), Infinity);
  const { canBreakSubLevelBlock } = f.load("content/punching/SubLevelBlockPermissions.ts");
  assert.equal(canBreakSubLevelBlock("survival", "minecraft:bedrock", false, []), false);
  assert.equal(canBreakSubLevelBlock("creative", "minecraft:bedrock", false, []), true);
});

test("ore and metal registrations preserve six-face textures and lit materials", () => {
  const registry = json(join(sable, "src/data/sublevel-block.json")).blocks;
  const expected = JSON.parse(readFileSync(join(root, ".sample/VanillaBlock/VanillaBlockData/main/自然/矿石与金属/blocks.json"), "utf8"));
  const expectedIds = new Set(expected.map(entry => `minecraft:${entry.name}`));
  const rawVanilla = json(join(vanilla, "bedrock-sample-1.26.40.5/resource_pack/blocks.json"));
  const rootTexture = join(vanilla, "bedrock-sample-1.26.40.5/resource_pack");
  const texturePath = value => {
    const path = join(rootTexture, `${value}.png`);
    return existsSync(path) || existsSync(join(rootTexture, `${value}.tga`));
  };
  for (const id of expectedIds) {
    const entry = registry[id];
    assert(entry, `${id}: missing registry entry`);
    assert.equal(entry.states.length, 0, `${id}: unexpected states`);
    assert.equal(entry.variants.length, 0, `${id}: unexpected variants`);
    assert.equal(entry.materials, id === "minecraft:lit_redstone_ore" || id === "minecraft:lit_deepslate_redstone_ore" ? "opaque_emissive" : "opaque", id);
    const textures = entry.default.model.textures;
    const values = Object.values(textures);
    assert.equal(new Set(values).size, id === "minecraft:ancient_debris" ? 2 : 1, `${id}: face texture mismatch`);
    for (const texture of values) assert(texturePath(texture), `${id}: missing ${texture}`);
    assert(rawVanilla[id.slice("minecraft:".length)], `${id}: missing vanilla block definition`);
  }
});

test("all multi-face and pale-moss states select the same faces in dense, sparse and available pools", () => {
  const f = fixture();
  const { resolveFancySubLevelBlock } = f.load("sublevel/render/fancy/model/FancySubLevelModelRegistry.ts");
  const reader = modelResourceReader(join(sable, "packs/SableRP"), "sable/sublevel/fancy");
  const cases = [];
  const bits = { down: 1, up: 2, south: 4, west: 8, north: 16, east: 32 };
  for (let mask = 0; mask < 64; mask++) cases.push({
    target: block("minecraft:sculk_vein", 0, 0, 0, { multi_face_direction_bits: mask }),
    state: mask, visible: Object.entries(bits).filter(([, bit]) => mask & bit).map(([face]) => `${face}_0`).sort()
  });
  for (let code = 0; code < 81; code++) for (const upper of [false, true]) {
    const states = { upper_block_bit: upper };
    let state = upper ? 256 : 0;
    const visible = !upper || code === 0 ? ["base_0"] : [];
    ["north", "east", "south", "west"].forEach((direction, index) => {
      const digit = Math.floor(code / 3 ** index) % 3;
      const side = ["none", "short", "tall"][digit];
      states[`pale_moss_carpet_side_${direction}`] = side;
      state += digit * 4 ** index;
      if (digit) visible.push(`${direction}_${side}_0`);
      else if (upper && code === 0) visible.push(`${direction}_tall_0`);
    });
    cases.push({ target: block("minecraft:pale_moss_carpet", 0, 0, 0, states), state, visible: visible.sort() });
  }
  for (const { target, state, visible } of cases) {
    const resolved = resolveFancySubLevelBlock(target);
    assert.equal(resolved.state, state);
    for (const format of ["sparse", "dense", ...(resolved.model.pool ? ["pool"] : [])]) {
      const resource = resolved.model[format];
      const coordinateBits = (resource.xBits ?? 0) + (resource.yBits ?? 0) + (resource.zBits ?? 0);
      const descriptor = format === "pool" ? 2 ** (coordinateBits + resource.familyBits + resource.stateBits)
        + resource.family * 2 ** coordinateBits + state * 2 ** (coordinateBits + resource.familyBits) : state + 1;
      const entity = { typeId: resource.entityTypeId, molang: {
        model_variant: resource.variant, origin_y: 2048, s0: descriptor
      }, getProperty: () => 0 };
      const resources = reader(entity);
      const actual = activeRenderPasses(entity, resources).flatMap(({ controller, arrays, evaluate }) => {
        const visibility = Object.assign({}, ...controller.part_visibility);
        return resources.geometries.get(evaluate(controller.geometry, arrays)).bones
          .filter(bone => bone.cubes && bone.name.endsWith("_0") && evaluate(visibility[bone.name] ?? visibility["*"] ?? true))
          .map(bone => bone.name);
      });
      assert.deepEqual(actual.sort(), visible, `${target.typeId}/${format}/${state}`);
    }
  }
});

test("attachment planes follow occupied slots, support directions and pose with matching two-sided UVs", () => {
  const f = fixture();
  const registry = f.load("sublevel/render/fancy/model/FancySubLevelModelRegistry.ts");
  const { fancySubLevelSparseLayout } = f.load("sublevel/render/fancy/model/FancySubLevelModelTypes.ts");
  const reader = modelResourceReader(join(sable, "packs/SableRP"), "sable/sublevel/fancy");
  const directions = { down: [0, -1, 0], up: [0, 1, 0], south: [0, 0, -1], west: [-1, 0, 0], north: [0, 0, 1], east: [1, 0, 0] };
  const cases = Object.keys(directions).map((direction, index) => ({
    target: block("minecraft:sculk_vein", 0, 0, 0, { multi_face_direction_bits: 2 ** index }),
    faces: [direction], base: false
  }));
  cases.push({ target: block("minecraft:sculk_vein", 0, 0, 0, { multi_face_direction_bits: 63 }), faces: Object.keys(directions), base: false });
  for (const upper of [false, true]) for (const sides of [["none", "none", "none", "none"], ["short", "tall", "short", "tall"]]) {
    const horizontal = ["north", "east", "south", "west"];
    const empty = sides.every(side => side === "none");
    cases.push({
      target: block("minecraft:pale_moss_carpet", 0, 0, 0, {
        upper_block_bit: upper,
        ...Object.fromEntries(horizontal.map((direction, index) => [`pale_moss_carpet_side_${direction}`, sides[index]]))
      }),
      faces: horizontal.filter((_, index) => sides[index] !== "none" || (upper && empty)), base: !upper || empty
    });
  }
  const center = surface => surface.vertices[0].map((_, axis) => surface.vertices.reduce((sum, point) => sum + point[axis], 0) / 4);
  for (const { target, faces, base } of cases) {
    const resolved = registry.resolveFancySubLevelBlock(target);
    for (const format of ["sparse", "dense", ...(resolved.model.pool ? ["pool"] : [])]) for (const rotated of [false, true]) {
      const resource = resolved.model[format];
      const sparse = fancySubLevelSparseLayout(resolved.model.state.bits);
      const rotation = rotated ? [23, -41, 17] : [0, 0, 0];
      const entity = {
        typeId: resource.entityTypeId, location: { x: 19, y: 33, z: -7 }, getProperty: () => 0,
        molang: { model_variant: resource.variant, origin_xz: 1024 + 1024 * 2048,
          origin_y: 1024 + 2048 + 6 * 4096 + 6 * 131072,
          pitch_target: rotation[0], yaw_target: rotation[1], roll_target: rotation[2] }
      };
      const coordinates = format === "dense" ? [[0, 0, 0], [6, 4, 6]] : [[1, 2, 3], [10, 7, 12]];
      for (const [index, coordinate] of coordinates.entries()) {
        const slot = index === 0 ? 0 : format === "dense" ? 244 : 25;
        const [x, y, z] = coordinate;
        if (format === "dense") {
          const bits = resolved.model.state.bits + 1;
          const perWord = Math.floor(24 / bits);
          entity.molang[`s${Math.floor(slot / perWord)}`] = (resolved.state + 1) * 2 ** ((slot % perWord) * bits);
        } else if (format === "pool") {
          const coordinateBits = resource.xBits + resource.yBits + resource.zBits;
          entity.molang[`s${slot}`] = x + y * 2 ** resource.xBits + z * 2 ** (resource.xBits + resource.yBits)
            + resource.family * 2 ** coordinateBits + resolved.state * 2 ** (coordinateBits + resource.familyBits)
            + 2 ** (coordinateBits + resource.familyBits + resource.stateBits);
        } else {
          entity.molang[`s${slot}`] = resolved.state + 1 + sparse.stateSpan * (x + y * sparse.width + z * sparse.width * sparse.height);
        }
      }
      const surfaces = activeModelSurfaces(entity, reader(entity), true);
      const expected = coordinates.flatMap(([x, y, z]) => {
        const points = faces.flatMap(face => Array.from({ length: 2 }, () => directions[face].map((value, axis) => value * 7.9 - (axis === 1 ? 16 : 0))));
        if (base) points.push([0, -23, 0], [0, -24, 0], [-8, -23.5, 0], [8, -23.5, 0], [0, -23.5, -8], [0, -23.5, 8]);
        return points.map(point => {
          point = point.map((value, axis) => value + [x * 16, y * 16, -z * 16][axis]);
          for (const angle of [[rotation[0], 0, 0], [0, 0, -rotation[2]], [0, -rotation[1], 0]]) {
            point = transformPoint(point, { pivot: [0, 0, 0], rotation: angle });
          }
          return point.map((value, axis) => value + [19 * 16, 33 * 16, 7 * 16][axis]);
        });
      });
      const label = `${target.typeId}/${format}/${resolved.state}/rotated=${rotated}`;
      const remaining = surfaces.map(center);
      assert.equal(remaining.length, expected.length, label);
      for (const point of expected) {
        // activeModelSurfaces rounds each transformed vertex to 1e-6 pixels.
        const index = remaining.findIndex(actual => actual.every((value, axis) => Math.abs(value - point[axis]) <= 1e-6));
        assert(index >= 0, `${label}: missing face at ${point}`);
        remaining.splice(index, 1);
      }
      const paired = new Map();
      for (const surface of surfaces) {
        const key = surface.vertices.map(point => point.join(",")).sort().join(";");
        const uvByVertex = surface.vertices.map((point, index) => [
          point.join(","),
          [surface.uv.uv[0] + (index % 2) * surface.uv.uv_size[0], surface.uv.uv[1] + Math.floor(index / 2) * surface.uv.uv_size[1]]
        ]).sort(([a], [b]) => a.localeCompare(b));
        if (paired.has(key)) assert.deepEqual(uvByVertex, paired.get(key), `${label}: opposite faces sample the same texels`);
        else paired.set(key, uvByVertex);
      }
    }
  }
});

test("large moss states survive full animation snapshots, sparse removal and dense words beyond s25", () => {
  const f = fixture();
  const registry = f.load("sublevel/render/fancy/model/FancySubLevelModelRegistry.ts");
  const layout = f.load("sublevel/render/fancy/model/FancySubLevelModelLayout.ts");
  const { FancySubLevelModelRenderer } = f.load("sublevel/render/fancy/model/FancySubLevelModelRenderer.ts");
  const tint = f.load("sublevel/render/fancy/model/FancySubLevelTintCodec.ts").DEFAULT_SUBLEVEL_FOLIAGE_TINT;
  const states = { upper_block_bit: true, pale_moss_carpet_side_north: "tall", pale_moss_carpet_side_east: "tall", pale_moss_carpet_side_south: "tall", pale_moss_carpet_side_west: "tall" };
  for (const locations of [[{ x: 0, y: 0, z: 0 }, { x: 30, y: 14, z: 30 }],
    Array.from({ length: 245 }, (_, slot) => ({ x: slot % 7, y: Math.floor(slot / 49), z: Math.floor(slot / 7) % 7 }))]) {
    const inputs = locations.map(p => registry.resolveFancySubLevelBlock(block("minecraft:pale_moss_carpet", p.x, p.y, p.z, states)));
    const result = layout.packFancySubLevelModels(inputs);
    assert.equal(result.unsupported.length, 0);
    assert.equal(result.models.length, 1);
    const packed = result.models[0];
    assert.equal(packed.format, locations.length === 2 ? "sparse" : "dense");
    if (packed.format === "dense") assert.equal(packed.words.length, 123);
    const renderer = new FancySubLevelModelRenderer(body, [packed], f.dimension.spawnEntity, tint, undefined, { x: 0, y: 0, z: 0 });
    renderer.sync(true); renderer.releaseInitialPose(); f.flush();
    const entity = renderer.entityIds.map(id => f.entities.get(id)).find(entity => !entity.typeId.includes("carrier"));
    packed.words.forEach((word, index) => assert.equal(entity.molang[`s${index}`], word));
    assert(packed.words.every(word => word < 2 ** 24));
    const assignment = packed.assignments.at(-1);
    const before = { ...entity.molang };
    renderer.removeBlocks(new Set([assignment.blockKey]));
    const span = 2 ** assignment.bitCount;
    assert.equal(Math.floor(entity.molang[`s${assignment.word}`] / 2 ** assignment.shift) % span, 0);
    for (let index = 0; index < packed.words.length; index++) if (index !== assignment.word) {
      assert.equal(entity.molang[`s${index}`], before[`s${index}`]);
    }
    f.system.currentTick += 40;
    const updated = { ...entity.molang };
    entity.molang = {};
    renderer.sync();
    assert.deepEqual(entity.molang, updated);
    renderer.remove();
  }
});

test("terrain sound events match vanilla sound groups and dirt particles remain untinted", () => {
  const f = fixture();
  const sounds = f.load("content/sublevel_sounds/SubLevelBlockSounds.ts");
  const indices = f.load("data/vanilla/sounds/BlockSoundEvents.ts");
  const rp = join(vanilla, "bedrock-sample-1.26.40.5/resource_pack");
  const blocks = json(join(rp, "blocks.json"));
  const groups = json(join(rp, "sounds.json")).block_sounds;
  const definitions = json(join(sable, "src/data/sublevel-block.json")).blocks;
  const sample = (value, random) => Array.isArray(value) ? value[0] + (value[1] - value[0]) * random : value;
  for (const [id, definition] of Object.entries(definitions)) {
    if (definition.category !== "nature/terrain_and_stone") continue;
    const group = groups[blocks[id === "minecraft:grass_block" ? "grass" : id.slice(10)].sound];
    for (const [event, method] of [["break", "resolveVanillaBlockBreakSound"], ["hit", "resolveVanillaBlockHitSound"], ["place", "resolveVanillaBlockPlaceSound"]]) {
      assert.notEqual(indices[`VANILLA_BLOCK_${event.toUpperCase()}_SOUND_EVENT_INDICES`][id], undefined, `${id}/${event}`);
      const source = group.events[event];
      for (const random of [0, 0.5, 1]) {
        const actual = sounds[method](id, () => random);
        assert.equal(actual.sound, source.sound, `${id}/${event}`);
        assert(Math.abs(actual.pitch - sample(source.pitch ?? 1, random) * sample(group.pitch ?? 1, random)) < 1e-8, `${id}/${event}/pitch`);
        assert(Math.abs(actual.volume - sample(source.volume ?? 1, random) * sample(group.volume ?? 1, random)) < 1e-8, `${id}/${event}/volume`);
      }
    }
  }
  const particles = f.load("content/particle/SubLevelBlockParticles.ts");
  const entry = block("minecraft:grass_block");
  particles.spawnSubLevelBlockDestructParticle(f.dimension, entry.localLocation, entry, undefined, particles.BLOCK_BREAK_PARTICLE_PROFILE);
  assert.equal(f.particles[0][2].values["variable.block_color_a"], 0);
  const dirt = json(join(sable, "packs/SableRP/particles/sable/sublevel/block_destruct/block_destruct_dirt.particle.json")).particle_effect;
  assert.equal(dirt.description.basic_render_parameters.texture, "textures/blocks/dirt");
  assert.equal(dirt.components["minecraft:particle_appearance_tinting"], undefined);
});

test("terrain flipbooks animate only the intended textures and retain cutout emissive material", () => {
  const f = fixture();
  const { resolveFancySubLevelBlock } = f.load("sublevel/render/fancy/model/FancySubLevelModelRegistry.ts");
  const rp = join(vanilla, "bedrock-sample-1.26.40.5/resource_pack");
  const flipbooks = JSON.parse(readFileSync(join(rp, "textures/flipbook_textures.json"), "utf8").replace(/^\s*\/\/.*$/gm, ""));
  const reader = modelResourceReader(join(sable, "packs/SableRP"), "sable/sublevel/fancy");
  const targets = [block("minecraft:sculk"), block("minecraft:sculk_vein", 0, 0, 0, { multi_face_direction_bits: 63 }), block("minecraft:magma"),
    block("minecraft:sculk_catalyst", 0, 0, 0, { bloom: true }),
    ...[false, true].map(can_summon => block("minecraft:sculk_shrieker", 0, 0, 0, { can_summon, active: false }))];
  for (const target of targets) {
    const resolved = resolveFancySubLevelBlock(target);
    if (target.typeId === "minecraft:sculk_vein") assert.equal(resolved.model.material, "alpha_test");
    for (const format of ["dense", "sparse", ...(resolved.model.pool ? ["pool"] : [])]) {
      const resource = resolved.model[format];
      const coordinateBits = (resource.xBits ?? 0) + (resource.yBits ?? 0) + (resource.zBits ?? 0);
      const descriptor = format === "pool" ? 2 ** (coordinateBits + resource.familyBits + resource.stateBits)
        + resource.family * 2 ** coordinateBits + resolved.state * 2 ** (coordinateBits + resource.familyBits) : resolved.state + 1;
      const entity = { typeId: resource.entityTypeId, molang: { model_variant: resource.variant, s0: descriptor, origin_y: 2048 }, getProperty: () => 0 };
      const resources = reader(entity);
      const passes = activeRenderPasses(entity, resources).filter(({ controller, evaluate }) => (
        Object.entries(Object.assign({}, ...controller.part_visibility)).some(([name, value]) => name.endsWith("_0") && evaluate(value)) || controller.part_visibility[0]["*"] === true
      ));
      assert(passes.length > 0);
      for (const { controller, arrays, evaluate } of passes) {
        const texture = evaluate(controller.textures[0], arrays);
        const source = flipbooks.find(entry => entry.flipbook_texture === texture);
        if (!source) assert.equal(controller.uv_anim, undefined, texture);
        else {
          assert(controller.uv_anim, texture);
          assert.equal(resolved.model.flipbook.ticksPerFrame, source.ticks_per_frame, texture);
          assert.equal(evaluate(controller.uv_anim.scale[1]), 1 / resolved.model.flipbook.frameCount, texture);
        }
        const material = evaluate(controller.materials[0]["*"], arrays);
        if (target.typeId === "minecraft:sculk_vein") assert.equal(material, "alpha_block_flipbook");
        if (target.typeId === "minecraft:sculk_shrieker") assert.equal(material, "alpha_test_block_emissive");
      }
    }
  }
  const materials = json(join(sable, "packs/SableRP/materials/entity.material")).materials;
  assert.deepEqual(materials["alpha_block_flipbook:alpha_block"]["+defines"], ["ALPHA_TEST", "USE_UV_ANIM"]);
  assert.deepEqual(materials["alpha_test_block_emissive:alpha_block"]["+defines"], ["ALPHA_TEST", "USE_EMISSIVE", "USE_UV_ANIM"]);
  for (const [name, frames] of [["sculk", 4], ["sculk_vein", 4], ["magma", 3]]) {
    const particle = json(join(sable, `packs/SableRP/particles/sable/sublevel/block_destruct/block_destruct_${name}.particle.json`)).particle_effect;
    const uv = particle.components["minecraft:particle_appearance_billboard"].uv;
    assert.deepEqual([uv.texture_width, uv.texture_height, uv.uv_size], [16, 16 * frames, [4, 4]]);
    assert.deepEqual(uv.uv, ["variable.particle_random_1*12", "variable.particle_random_2*12"]);
  }
  const javaTextures = join(vanilla, "minecraft-assets-26.2/assets/minecraft/textures/block");
  for (const [name, frameCount, ticksPerFrame] of [["sculk", 4, 20], ["sculk_vein", 4, 20]]) {
    assert.equal(pngHeight(join(javaTextures, `${name}.png`)) / 16, frameCount);
    assert.equal(json(join(javaTextures, `${name}.png.mcmeta`)).animation.frametime, ticksPerFrame);
    const source = flipbooks.find(entry => entry.flipbook_texture === `textures/blocks/${name}`);
    assert.equal(source?.ticks_per_frame, ticksPerFrame);
  }
});

test("terrain partial models match vanilla dimensions, UVs and shared child rotations", () => {
  const f = fixture();
  const { resolveFancySubLevelBlock } = f.load("sublevel/render/fancy/model/FancySubLevelModelRegistry.ts");
  const reader = modelResourceReader(join(sable, "packs/SableRP"), "sable/sublevel/fancy");
  const modelPath = join(vanilla, "minecraft-assets-26.2/assets/minecraft/models/block");
  for (const [id, reference] of [["farmland", "template_farmland"], ["grass_path", "dirt_path"], ["moss_carpet", "carpet"], ["sculk_shrieker", "template_sculk_shrieker"]]) {
    const source = json(join(modelPath, `${reference}.json`));
    const expected = source.elements.flatMap(element => Object.entries(element.faces).map(([face, uv]) => {
      const origin = element.from.map((value, axis) => value - [8, 24, 8][axis]);
      const size = element.to.map((value, axis) => value - element.from[axis]);
      const plane = ["east", "west"].includes(face) ? 0 : ["up", "down"].includes(face) ? 1 : 2;
      const region = origin.map((value, axis) => axis === plane ? value + (["east", "up", "south"].includes(face) ? size[axis] : 0) : value);
      return { face, region, extent: size.filter((_, axis) => axis !== plane), uv: { uv: uv.uv.slice(0, 2), uv_size: [uv.uv[2] - uv.uv[0], uv.uv[3] - uv.uv[1]] } };
    }));
    const resolved = resolveFancySubLevelBlock(block(`minecraft:${id}`));
    const resource = resolved.model.sparse;
    const entity = { typeId: resource.entityTypeId, molang: { model_variant: resource.variant, s0: 1, origin_y: 2048 }, getProperty: () => 0 };
    const resources = reader(entity);
    const actual = activeRenderPasses(entity, resources).flatMap(({ controller, evaluate, arrays }) => resources.geometries.get(evaluate(controller.geometry, arrays)).bones
      .filter(bone => bone.cubes && bone.name.endsWith("_0")).flatMap(bone => bone.cubes.flatMap(cube => Object.entries(cube.uv).map(([face, uv]) => {
        const plane = ["east", "west"].includes(face) ? 0 : ["up", "down"].includes(face) ? 1 : 2;
        const region = cube.origin.map((value, axis) => axis === plane ? value + (["east", "up", "south"].includes(face) ? cube.size[axis] : 0) : value);
        return { face, region, extent: cube.size.filter((_, axis) => axis !== plane), uv };
      }))));
    const key = value => JSON.stringify(value, (_, value) => typeof value === "number" ? Math.round(value * 1e6) / 1e6 : value);
    assert.deepEqual(actual.map(key).sort(), expected.map(key).sort(), id);
  }
  const reference = json(join(modelPath, "pointed_dripstone.json"));
  for (const id of ["pointed_dripstone", "sulfur_spike"]) for (const hanging of [false, true]) for (const thickness of ["tip", "frustum", "middle", "base", "merge"]) {
    const resolved = resolveFancySubLevelBlock(block(`minecraft:${id}`, 0, 0, 0, { hanging, dripstone_thickness: thickness }));
    const resource = resolved.model.sparse;
    const entity = { typeId: resource.entityTypeId, molang: { model_variant: resource.variant, s0: 1, origin_y: 2048 }, getProperty: () => 0 };
    const resources = reader(entity);
    const pass = activeRenderPasses(entity, resources)[0];
    const geometry = resources.geometries.get(pass.evaluate(pass.controller.geometry, pass.arrays));
    const bone = geometry.bones.find(bone => bone.name === "pointed_0");
    assert.equal(geometry.bones.find(bone => bone.name === "slot_0").rotation, undefined);
    assert.deepEqual(bone.rotation, [0, reference.elements[0].rotation.angle, 0]);
    assert.equal(bone.cubes.length, 2);
    for (const [index, cube] of bone.cubes.entries()) {
      const source = reference.elements[index];
      const size = source.to.map((value, axis) => (value - source.from[axis]) * (axis === 1 ? 1 : Math.SQRT2));
      cube.size.forEach((value, axis) => assert(Math.abs(value - size[axis]) < 1e-8));
      for (const uv of Object.values(cube.uv)) assert.deepEqual(uv, { uv: [0, 0], uv_size: [16, 16] });
    }
  }
  for (let moisture = 0; moisture < 8; moisture++) {
    const result = resolveFancySubLevelBlock(block("minecraft:farmland", 0, 0, 0, { moisturized_amount: moisture }));
    assert.equal(result.model.description.textures.up, `textures/blocks/farmland_${moisture === 7 ? "wet" : "dry"}`);
  }
});

test("crop state keys and Java model channels retain their Bedrock stages", async () => {
  const f = fixture();
  const registry = f.load("sublevel/render/fancy/model/FancySubLevelModelRegistry.ts");
  const resolve = (typeId, states) => registry.resolveFancySubLevelBlock(block(typeId, 0, 0, 0, states)).model;
  const stage = (typeId, values, expected) => values.forEach((value, index) => {
    assert.equal(resolve(typeId, { growth: value }).description.texture, expected[index], `${typeId} growth=${value}`);
  });
  stage("minecraft:beetroot", [0, 1, 2, 3, 4, 5, 6, 7], [
    "textures/blocks/beetroots_stage_0", "textures/blocks/beetroots_stage_0", "textures/blocks/beetroots_stage_0",
    "textures/blocks/beetroots_stage_1", "textures/blocks/beetroots_stage_2", "textures/blocks/beetroots_stage_0",
    "textures/blocks/beetroots_stage_0", "textures/blocks/beetroots_stage_3"
  ]);
  for (const typeId of ["minecraft:carrots", "minecraft:potatoes"]) stage(typeId, [0, 1, 2, 3, 4, 5, 6, 7], [
    `textures/blocks/${typeId.slice("minecraft:".length)}_stage_0`, `textures/blocks/${typeId.slice("minecraft:".length)}_stage_0`,
    `textures/blocks/${typeId.slice("minecraft:".length)}_stage_1`, `textures/blocks/${typeId.slice("minecraft:".length)}_stage_1`,
    `textures/blocks/${typeId.slice("minecraft:".length)}_stage_2`, `textures/blocks/${typeId.slice("minecraft:".length)}_stage_2`,
    `textures/blocks/${typeId.slice("minecraft:".length)}_stage_2`, `textures/blocks/${typeId.slice("minecraft:".length)}_stage_3`
  ]);
  const wartStages = [0, 1, 1, 2, 0, 0, 0, 0];
  for (let age = 0; age < wartStages.length; age++) {
    assert.equal(resolve("minecraft:nether_wart", { age }).description.texture,
      `textures/blocks/nether_wart_stage_${wartStages[age]}`, `nether wart age=${age}`);
  }
  const berries = [0, 1, 2, 3].map(growth => resolve("minecraft:sweet_berry_bush", { growth }).description.texture);
  assert.deepEqual(berries, [0, 1, 2, 3].map(value => `textures/blocks/sweet_berry_bush_stage${value}`));
  assert.equal(resolve("minecraft:torchflower_crop", { growth: 0 }).description.texture, "textures/blocks/torchflower_crop_stage_0");
  assert.equal(resolve("minecraft:torchflower_crop", { growth: 4 }).description.texture, "textures/blocks/torchflower_crop_stage_1");
  for (const typeId of ["minecraft:melon_stem", "minecraft:pumpkin_stem"]) {
    for (let growth = 0; growth < 8; growth++) {
      const description = resolve(typeId, { facing_direction: 0, growth }).description;
      assert.equal(description.type, "stem");
      assert.equal(description.growth, growth, `${typeId} growth=${growth}`);
    }
    for (const [direction, rotation] of [[2, 90], [3, 270], [4, 0], [5, 180]]) {
      const model = resolve(typeId, { facing_direction: direction, growth: 7 });
      assert.equal(model.description.direction, direction);
      assert.deepEqual(model.dense.rotation, [0, rotation, 0], `${typeId} direction=${direction}`);
    }
  }
  const pitcher = (growth, upper) => resolve("minecraft:pitcher_crop", { growth, upper_block_bit: upper });
  for (const growth of [0, 1, 2, 3, 4, 5, 6, 7]) {
    const expected = ({ 0: 0, 1: 1, 3: 2, 5: 3, 7: 4 })[growth] ?? 0;
    const model = pitcher(growth, false);
    assert.equal(model.description.growth, expected, `pitcher lower growth=${growth}`);
    assert.equal(model.description.upper, false);
  }
  for (const growth of [0, 1, 3]) {
    const model = pitcher(growth, true);
    assert.equal(model.description.growth, 0, `pitcher empty upper growth=${growth}`);
    assert.equal(model.description.upper, true);
  }
  for (const growth of [5, 7]) {
    const model = pitcher(growth, true);
    assert.equal(model.description.growth, growth === 5 ? 3 : 4, `pitcher upper growth=${growth}`);
    assert.equal(model.description.upper, true);
  }
  const resources = modelResourceIndex(join(sable, "packs/SableRP"));
  const findGeometryByBone = suffix => {
    const geometry = [...resources.geometries.values()]
      .find(candidate => candidate.bones?.some(bone => bone.name.endsWith(suffix)));
    assert(geometry, `missing generated pitcher geometry bone ${suffix}`);
    return geometry;
  };
  const lowerSide = findGeometryByBone("pitcher_base_side_0");
  const lowerTop = findGeometryByBone("pitcher_base_top_0");
  const lowerBottom = findGeometryByBone("pitcher_base_bottom_0");
  const sideCube = lowerSide.bones.find(bone => bone.name === "pitcher_base_side_0").cubes[0];
  const topCube = lowerTop.bones.find(bone => bone.name === "pitcher_base_top_0").cubes[0];
  const bottomCube = lowerBottom.bones.find(bone => bone.name === "pitcher_base_bottom_0").cubes[0];
  assert.deepEqual(Object.keys(sideCube.uv).sort(), ["east", "north", "south", "west"]);
  assert.deepEqual(Object.keys(topCube.uv), ["up"]);
  assert.deepEqual(Object.keys(bottomCube.uv), ["down"]);
  const upperStage3 = findGeometryByBone("pitcher_upper_3_x_0");
  const upperBone = upperStage3.bones.find(bone => bone.name === "pitcher_upper_3_x_0");
  assert.deepEqual(upperBone.pivot, [0, -8, 0]);
  assert.deepEqual(upperBone.cubes[0].origin, [-8, -24, 0]);
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

test("terrain attachment placement and removal settle neighbors in both vertical directions", () => {
  const f = fixture();
  const support = f.load("content/block_properties/SubLevelBlockSupport.ts");
  const entries = blocks => blocks.map(snapshot => ({ key: Object.values(snapshot.localLocation).join(","), localLocation: snapshot.localLocation, snapshot }));
  const mossStates = { upper_block_bit: false, pale_moss_carpet_side_north: "none", pale_moss_carpet_side_east: "none", pale_moss_carpet_side_south: "none", pale_moss_carpet_side_west: "none" };
  const stone = block("minecraft:stone", 0, -1, 0);
  const moss = block("minecraft:pale_moss_carpet", 0, 0, 0, mossStates);
  const wall = block("minecraft:stone", 1, 0, 0);
  const upperWall = block("minecraft:stone", 1, 1, 0);
  const placed = support.resolveSubLevelBlockPlacement([stone, wall, upperWall], moss, () => 0);
  assert.equal(placed.additions.length, 2);
  assert.equal(placed.additions[0].states.pale_moss_carpet_side_east, "tall");
  assert.equal(placed.additions[1].states.upper_block_bit, true);
  assert.equal(placed.additions[1].states.pale_moss_carpet_side_east, "short");
  const blocks = [stone, wall, upperWall, ...placed.additions];
  const lowered = support.resolveSubLevelBlockSupport(entries(blocks), new Set(["1,1,0"]));
  assert.deepEqual([...lowered.unsupportedKeys], ["0,1,0"]);
  assert.equal(lowered.stateUpdates.get("0,0,0").snapshot.states.pale_moss_carpet_side_east, "short");
  const detached = support.resolveSubLevelBlockSupport(entries(blocks), new Set(["0,-1,0"]));
  assert.deepEqual([...detached.unsupportedKeys].sort(), ["0,0,0", "0,1,0"]);
  assert.equal(support.resolveSubLevelBlockPlacement([], moss), undefined);
  assert(support.resolveSubLevelBlockPlacement([stone], block("minecraft:moss_carpet")));
  for (const hanging of [false, true]) {
    const direction = hanging ? -1 : 1;
    const host = block("minecraft:stone", 0, 0, 0);
    const chain = Array.from({ length: 5 }, (_, index) => block("minecraft:pointed_dripstone", 0, direction * (index + 1), 0, { hanging, dripstone_thickness: "tip" }));
    const rows = entries([host, ...chain]);
    const updates = support.resolveSubLevelBlockNeighborStateUpdates(rows, new Set(chain.map(b => `0,${b.localLocation.y},0`)));
    assert.deepEqual(chain.map(b => (updates.get(`0,${b.localLocation.y},0`)?.snapshot ?? b).states.dripstone_thickness), ["base", "middle", "middle", "frustum", "tip"]);
    const removed = support.resolveSubLevelBlockSupport(rows, new Set(["0,0,0"]));
    assert.equal(removed.unsupportedKeys.size, 5);
    const settled = rows.map(row => ({ ...row, snapshot: updates.get(row.key)?.snapshot ?? row.snapshot }));
    const shortened = support.resolveSubLevelBlockSupport(settled, new Set([`0,${direction * 5},0`]));
    assert.equal(shortened.unsupportedKeys.size, 0);
    assert.equal(shortened.stateUpdates.get(`0,${direction * 4},0`).snapshot.states.dripstone_thickness, "tip");
  }
  const floor = block("minecraft:stone", 0, -1, 0);
  const ceiling = block("minecraft:stone", 0, 2, 0);
  const standing = block("minecraft:pointed_dripstone", 0, 0, 0, { hanging: false, dripstone_thickness: "tip" });
  for (const thickness of ["tip", "merge"]) {
    const hanging = block("minecraft:pointed_dripstone", 0, 1, 0, { hanging: true, dripstone_thickness: thickness });
    const joined = support.resolveSubLevelBlockPlacement([floor, ceiling, standing], hanging);
    assert.equal(joined.additions[0].states.dripstone_thickness, thickness);
    assert.equal(joined.stateUpdates.get("0,0,0")?.snapshot.states.dripstone_thickness ?? "tip", thickness);
  }
  assert.equal(support.resolveSubLevelBlockPlacement([block("minecraft:grass_path", 0, -1, 0)], standing), undefined);
  assert(support.resolveSubLevelBlockPlacement([block("minecraft:grass_path", 0, 1, 0)], { ...standing, states: { hanging: true, dripstone_thickness: "tip" } }));
});

test("multi-face placement keeps one face per sub-level cell and persists through reconstruction", () => {
  const f = managedFixture();
  const { resolveSubLevelBlockPlacement } = f.load("content/block_properties/SubLevelBlockSupport.ts");
  const defaults = { multi_face_direction_bits: 0 };
  const previousResolve = f.server.BlockPermutation.resolve;
  f.server.BlockPermutation.resolve = (typeId, states) => previousResolve(typeId, states ?? (typeId === "minecraft:sculk_vein" ? defaults : {}));
  const floor = block("minecraft:stone", 0, -1, 0);
  const east = block("minecraft:stone", 1, 0, 0);
  const managed = f.manager.createSubLevel(f.dimension, { x: 0, y: 0, z: 0 }, [floor, east]);
  const item = { typeId: "minecraft:sculk_vein" };
  assert(f.manager.placeBlockForPlayerEdit({}, item, managed.handle, east, { x: 0, y: 0, z: 0 }, "north", "west"));
  assert.equal(f.manager.placeBlockForPlayerEdit({}, item, managed.handle, floor, { x: 0, y: 0, z: 0 }, "north", "up"), false);
  assert.equal(managed.blockCount, 3);
  const at = () => managed.handle.getBlockAtLocalLocation({ x: 0, y: 0, z: 0 });
  assert.equal(at().states.multi_face_direction_bits, 32);
  assert.equal(f.manager.placeBlockForPlayerEdit({}, item, managed.handle, east, { x: 0, y: 0, z: 0 }, "north", "west"), false);
  const unsupported = block("minecraft:sculk_vein", 0, 0, 0, { multi_face_direction_bits: 2 });
  assert.equal(resolveSubLevelBlockPlacement(managed.handle.blocks, unsupported), undefined);
  assert(f.manager.breakBlockForPlayerEdit({}, undefined, managed.handle, floor));
  assert.equal(at().states.multi_face_direction_bits, 32);
  const saved = structuredClone(f.saved.get(managed.id));
  assert.equal(saved.blocks.find(b => b.typeId === item.typeId).states.multi_face_direction_bits, 32);
  const restored = managedFixture();
  restored.saved.set(managed.id, saved);
  restored.manager.initialize();
  restored.manager.tick(20);
  const handle = [...restored.runtime.getRaycastCandidates(restored.dimension.id)][0];
  assert.equal(handle.getBlockAtLocalLocation({ x: 0, y: 0, z: 0 }).states.multi_face_direction_bits, 32);
  assert(restored.manager.breakBlockForPlayerEdit({}, undefined, handle, east));
  assert.equal(handle.getBlockAtLocalLocation({ x: 0, y: 0, z: 0 }), undefined);
  assert.equal(restored.saved.size, 0);
});

test("vine placement keeps one host face per sub-level cell and preserves native multi-face states", () => {
  for (const stateName of ["vine_direction_bits", "minecraft:vine_direction_bits"]) {
    const f = managedFixture();
    const support = f.load("content/block_properties/SubLevelBlockSupport.ts");
    const previousResolve = f.server.BlockPermutation.resolve;
    f.server.BlockPermutation.resolve = (id, states) => previousResolve(id, states ?? (id === "minecraft:vine" ? { [stateName]: 0 } : {}));
    const target = { x: 5, y: 7, z: 11 };
    const hosts = [block("minecraft:stone", 5, 7, 12), block("minecraft:stone", 4, 7, 11), block("minecraft:stone", 5, 7, 10), block("minecraft:stone", 6, 7, 11)];
    const faces = ["north", "east", "south", "west"];
    const managed = f.manager.createSubLevel(f.dimension, { x: 0, y: 0, z: 0 }, hosts);
    const at = () => managed.handle.getBlockAtLocalLocation(target);
    assert(f.manager.placeBlockForPlayerEdit({}, { typeId: "minecraft:vine" }, managed.handle, hosts[0], target, "north", faces[0]));
    assert.equal(at().states[stateName], 1);
    assert.equal(at().collisionResponse, false);
    assert.equal(managed.blockCount, 5);
    for (let index = 1; index < 4; index++) {
      assert.equal(f.manager.placeBlockForPlayerEdit({}, { typeId: "minecraft:vine" }, managed.handle, hosts[index], target, "north", faces[index]), false);
      assert.equal(at().states[stateName], 1);
    }
    assert.equal(f.manager.placeBlockForPlayerEdit({}, { typeId: "minecraft:vine" }, managed.handle, hosts[0], target, "north", faces[0]), false);

    const native = block("minecraft:vine", 5, 7, 11, { [stateName]: 15 });
    const lower = block("minecraft:vine", 5, 6, 11, { [stateName]: 15 });
    const entries = [...hosts, native, lower].map(snapshot => ({ key: Object.values(snapshot.localLocation).join(","), localLocation: snapshot.localLocation, snapshot }));
    const cascade = support.resolveSubLevelBlockSupport(entries, new Set(["5,7,12"]));
    assert.equal(cascade.unsupportedKeys.size, 0);
    assert.equal(cascade.stateUpdates.get("5,7,11").snapshot.states[stateName], 14);
    assert.equal(cascade.stateUpdates.get("5,6,11").snapshot.states[stateName], 14);
    const detached = support.resolveSubLevelBlockSupport(entries, new Set(hosts.map(host => Object.values(host.localLocation).join(","))));
    assert(detached.unsupportedKeys.has("5,7,11") && detached.unsupportedKeys.has("5,6,11"));
    const fullHosts = hosts.map(host => ({ ...host, localLocation: { ...host.localLocation, x: host.localLocation.x + 16 } }));
    const fullTarget = { x: 21, y: 7, z: 11 };
    const fullNative = { ...native, localLocation: fullTarget };
    const fullManaged = f.manager.createSubLevel(f.dimension, { x: 16, y: 0, z: 0 }, [...fullHosts, fullNative]);
    const fullAt = () => fullManaged.handle.getBlockAtLocalLocation(fullTarget);
    assert(fullAt());
    assert(fullAt().states[stateName] === 15);
    assert(f.manager.breakBlockForPlayerEdit({}, undefined, fullManaged.handle, fullHosts[0]));
    assert.equal(fullAt().states[stateName], 14);
    assert.equal(support.resolveSubLevelBlockPlacement(fullManaged.handle.blocks, { ...fullAt(), states: { [stateName]: 1 } }), undefined);
    const saved = structuredClone(f.saved.get(fullManaged.id));
    const restored = managedFixture();
    restored.saved.set(fullManaged.id, saved);
    restored.manager.initialize();
    restored.manager.tick(20);
    const handle = [...restored.runtime.getRaycastCandidates(restored.dimension.id)][0];
    assert.equal(handle.getBlockAtLocalLocation(fullTarget).states[stateName], 14);
    for (const host of fullHosts.slice(1)) assert(restored.manager.breakBlockForPlayerEdit({}, undefined, handle, host));
    assert.equal(handle.getBlockAtLocalLocation(fullTarget), undefined);
    for (const typeId of ["minecraft:grass_path", "minecraft:moss_carpet", "minecraft:sculk_shrieker"]) {
      assert.equal(support.resolveSubLevelBlockPlacement([block(typeId, 5, 7, 12)], block("minecraft:vine", 5, 7, 11, { [stateName]: 1 })), undefined, typeId);
    }
  }
});

test("vine undersides and side faces place independently and rebuild derived state after capture and storage", () => {
  const f = managedFixture();
  const previousResolve = f.server.BlockPermutation.resolve;
  f.server.BlockPermutation.resolve = (id, states) => {
    if (id === "minecraft:vine") {
      assert(Object.keys(states ?? {}).every(key => key === "vine_direction_bits"));
      assert((states?.vine_direction_bits ?? 0) <= 15);
    }
    return previousResolve(id, states ?? (id === "minecraft:vine" ? { vine_direction_bits: 0 } : {}));
  };
  const ceiling = block("minecraft:stone", 0, 1, 0);
  const side = block("minecraft:stone", 1, 0, 0);
  const managed = f.manager.createSubLevel(f.dimension, { x: 0, y: 0, z: 0 }, [ceiling, side]);
  const target = { x: 0, y: 0, z: 0 };
  const item = { typeId: "minecraft:vine" };
  const at = () => managed.handle.getBlockAtLocalLocation(target);
  assert(f.manager.placeBlockForPlayerEdit({}, item, managed.handle, ceiling, target, "north", "down"));
  assert.equal(at().states.vine_direction_bits, 0);
  assert.equal(at().renderState, 1);
  assert.equal(f.manager.placeBlockForPlayerEdit({}, item, managed.handle, ceiling, target, "north", "down"), false);
  assert.equal(f.manager.placeBlockForPlayerEdit({}, item, managed.handle, side, target, "north", "west"), false);
  assert.equal(at().states.vine_direction_bits, 0);
  assert.equal(at().renderState, 1);
  const serializer = f.load("sublevel/storage/serialization/SubLevelSerializer.ts");
  const saved = serializer.serializeSubLevelStructure(managed.id, f.saved.get(managed.id));
  assert(saved.blocks.every(entry => entry.renderState === undefined));
  const restored = managedFixture();
  restored.saved.set(saved.id, serializer.deserializeSubLevelStructure(saved));
  restored.manager.initialize(); restored.manager.tick(20); restored.flush();
  const handle = [...restored.runtime.getRaycastCandidates(restored.dimension.id)][0];
  assert.equal(handle.getBlockAtLocalLocation(target).renderState, 1);
  assert.equal(handle.getBlockAtLocalLocation(target).states.vine_direction_bits, 0);
  assert(restored.manager.breakBlockForPlayerEdit({}, undefined, handle, ceiling));
  assert.equal(handle.getBlockAtLocalLocation(target), undefined);
  assert.equal(restored.saved.size, 1);
  assert(restored.manager.breakBlockForPlayerEdit({}, undefined, handle, side));
  assert.equal(restored.saved.size, 0);

  const sideManaged = f.manager.createSubLevel(f.dimension, { x: 16, y: 0, z: 0 }, [
    { ...side, localLocation: { ...side.localLocation, x: 17 } }
  ]);
  const sideTarget = { x: 16, y: 0, z: 0 };
  const sideAt = () => sideManaged.handle.getBlockAtLocalLocation(sideTarget);
  const sideHost = { ...side, localLocation: { ...side.localLocation, x: 17 } };
  assert(f.manager.placeBlockForPlayerEdit({}, item, sideManaged.handle, sideHost, sideTarget, "north", "west"));
  assert.equal(sideAt().states.vine_direction_bits, 8);
  assert.equal(sideAt().renderState, 0);
  assert.equal(f.manager.placeBlockForPlayerEdit({}, item, sideManaged.handle, sideHost, sideTarget, "north", "west"), false);
  assert.equal(f.manager.placeBlockForPlayerEdit({}, item, sideManaged.handle, { ...ceiling, localLocation: { ...ceiling.localLocation, x: 16 } }, sideTarget, "north", "down"), false);
  assert(f.manager.breakBlockForPlayerEdit({}, undefined, sideManaged.handle, sideHost));
  assert.equal(sideAt(), undefined);
  assert(f.manager.breakBlockForPlayerEdit({}, undefined, managed.handle, at()));
  assert(f.loot.some(([id]) => id === "minecraft:vine"), "native loot accepts unmodified vine states");

  const support = f.load("content/block_properties/SubLevelBlockSupport.ts");
  for (const typeId of ["minecraft:stone", "minecraft:grass_path", "minecraft:farmland", "minecraft:moss_carpet", "minecraft:sculk_shrieker", "minecraft:oak_leaves"]) {
    const placed = { ...block("minecraft:vine", 0, 0, 0, { vine_direction_bits: 0 }), renderState: 1 };
    assert(support.resolveSubLevelBlockPlacement([block(typeId, 0, 1, 0)], placed), typeId);
    assert.equal(support.resolveSubLevelBlockPlacement([], placed), undefined);
    assert.equal(support.resolveSubLevelBlockPlacement([block(typeId, 0, -1, 0)], { ...placed, renderState: 0 }), undefined);
  }
  for (const bits of [0, 8]) {
    const captured = managedFixture();
    captured.dimension.getBlock({ x: 0, y: 0, z: 0 }).setPermutation(captured.permutation("minecraft:vine", { vine_direction_bits: bits }));
    captured.dimension.getBlock({ x: 0, y: 1, z: 0 }).setType("minecraft:stone");
    const result = captured.manager.createSubLevelFromRegion(captured.dimension, { x: 0, y: 0, z: 0 }, { x: 0, y: 1, z: 0 });
    assert.equal(result.handle.getBlockAtLocalLocation(target).renderState, 1);
    assert.equal(result.handle.getBlockAtLocalLocation(target).states.vine_direction_bits, bits);
  }
});

test("vine ceilings reject incomplete hosts through placement, neighbor edits, capture and storage", () => {
  const target = { x: 0, y: 0, z: 0 };
  const side = block("minecraft:stone", 1, 0, 0);
  const vine = { ...block("minecraft:vine", 0, 0, 0, { vine_direction_bits: 8 }), renderState: 1 };
  for (const typeId of ["minecraft:chest", "minecraft:powder_snow"]) {
    const ceiling = block(typeId, 0, 1, 0);
    const f = managedFixture();
    const support = f.load("content/block_properties/SubLevelBlockSupport.ts");
    assert.equal(support.resolveSubLevelBlockPlacement([ceiling], { ...vine, states: { vine_direction_bits: 0 } }), undefined);
    assert.equal(support.resolveSubLevelBlockPlacement([ceiling, side, { ...vine, renderState: 0 }], vine), undefined);
    const managed = f.manager.createSubLevel(f.dimension, target, [ceiling, side, vine]);
    const at = () => managed.handle.getBlockAtLocalLocation(target);
    assert.equal(at().renderState ?? 0, 0, typeId);
    assert.equal(at().states.vine_direction_bits, 8);

    const serializer = f.load("sublevel/storage/serialization/SubLevelSerializer.ts");
    const saved = serializer.serializeSubLevelStructure(managed.id, f.saved.get(managed.id));
    const restored = managedFixture();
    restored.saved.set(saved.id, serializer.deserializeSubLevelStructure(saved));
    restored.manager.initialize(); restored.manager.tick(20); restored.flush();
    const handle = [...restored.runtime.getRaycastCandidates(restored.dimension.id)][0];
    assert.equal(handle.getBlockAtLocalLocation(target).renderState ?? 0, 0, `${typeId} reload`);
    assert.equal(handle.getBlockAtLocalLocation(target).states.vine_direction_bits, 8);
    assert(restored.manager.breakBlockForPlayerEdit({}, undefined, handle, side));
    assert.equal(handle.getBlockAtLocalLocation(target), undefined, "incomplete ceiling cannot keep the vine alive");

    assert(f.manager.breakBlockForPlayerEdit({}, undefined, managed.handle, ceiling));
    assert(f.manager.placeBlockForPlayerEdit({}, { typeId: "minecraft:stone" }, managed.handle, at(), ceiling.localLocation, "north", "up"));
    assert.equal(at().renderState, 1);
    assert(f.manager.breakBlockForPlayerEdit({}, undefined, managed.handle, managed.handle.getBlockAtLocalLocation(ceiling.localLocation)));
    assert.equal(at().renderState, 0);
    assert(f.manager.placeBlockForPlayerEdit({}, { typeId }, managed.handle, at(), ceiling.localLocation, "north", "up"));
    assert.equal(at().renderState, 0, `${typeId} replacement`);
    assert.equal(at().states.vine_direction_bits, 8);

    const captured = managedFixture();
    for (const entry of [ceiling, side, vine]) {
      captured.dimension.getBlock(entry.localLocation).setPermutation(captured.permutation(entry.typeId, entry.states));
    }
    const result = captured.manager.createSubLevelFromRegion(captured.dimension, target, { x: 1, y: 1, z: 0 });
    assert.equal(result.handle.getBlockAtLocalLocation(target).renderState ?? 0, 0, `${typeId} capture`);
    assert.equal(result.handle.getBlockAtLocalLocation(target).states.vine_direction_bits, 8);
  }
});

test("hanging vine chains inherit side faces without creating ceiling faces", () => {
  const f = fixture();
  const support = f.load("content/block_properties/SubLevelBlockSupport.ts");
  const entries = blocks => blocks.map(snapshot => ({ key: Object.values(snapshot.localLocation).join(","), localLocation: snapshot.localLocation, snapshot }));
  const host = block("minecraft:stone", 1, 1, 0);
  const upper = block("minecraft:vine", 0, 1, 0, { vine_direction_bits: 8 });
  const lower = block("minecraft:vine", 0, 0, 0, { vine_direction_bits: 8 });
  const topOnly = { ...lower, states: { vine_direction_bits: 0 }, renderState: 1 };
  assert.equal(support.resolveSubLevelBlockPlacement([host, upper], topOnly), undefined);
  const placed = support.resolveSubLevelBlockPlacement([host, upper], lower);
  assert.equal(placed.additions[0].states.vine_direction_bits, 8);
  assert.equal(placed.additions[0].renderState ?? 0, 0);
  const rows = entries([host, upper, { ...lower, renderState: 1 }]);
  const resolved = support.resolveSubLevelBlockSupport(rows, new Set(), new Set(["0,0,0"]));
  assert.equal(resolved.unsupportedKeys.size, 0);
  assert.equal(resolved.stateUpdates.get("0,0,0").snapshot.renderState, 0);
  assert.deepEqual(resolved.supportKeysByAttachment.get("0,0,0"), ["0,1,0"]);
  const removed = support.resolveSubLevelBlockSupport(rows, new Set(["1,1,0"]));
  assert.deepEqual([...removed.unsupportedKeys].sort(), ["0,0,0", "0,1,0"]);
  const unsupported = support.resolveSubLevelBlockSupport(entries([host, upper, topOnly]), new Set(), new Set(["0,0,0"]));
  assert(unsupported.unsupportedKeys.has("0,0,0"));
  assert(!unsupported.unsupportedKeys.has("0,1,0"));
});

test("attachment faces use the union of explicit collision boxes without filling gaps", () => {
  const f = fixture();
  const support = f.load("content/block_properties/SubLevelBlockSupport.ts");
  for (const [location, axis, u, v, positive, bit] of [
    [[0, -1, 0], "y", "x", "z", true, 1], [[0, 1, 0], "y", "x", "z", false, 2],
    [[0, 0, 1], "z", "x", "y", false, 4], [[-1, 0, 0], "x", "y", "z", true, 8],
    [[0, 0, -1], "z", "x", "y", true, 16], [[1, 0, 0], "x", "y", "z", false, 32]
  ]) {
    const box = (uMin, vMin, uMax, vMax, depthMin = positive ? 0.5 : 0, depthMax = positive ? 1 : 0.5) => ({
      min: { [axis]: depthMin, [u]: uMin, [v]: vMin }, max: { [axis]: depthMax, [u]: uMax, [v]: vMax }
    });
    for (const [label, collisionShape, expected] of [
      ["whole face at half block depth", [box(0, 0, 1, 1)], true],
      ["adjacent boxes", [box(0, 0, 0.375, 1), box(0.375, 0, 1, 1)], true],
      ["overlapping boxes", [box(0, 0, 0.75, 1), box(0.25, 0, 1, 1)], true],
      ["four tiled boxes", [box(0, 0, 0.5, 0.5), box(0.5, 0, 1, 0.5), box(0, 0.5, 0.5, 1), box(0.5, 0.5, 1, 1)], true],
      ["duplicate half faces", [box(0, 0, 0.5, 1), box(0, 0, 0.5, 1)], false],
      ["narrow gap", [box(0, 0, 0.5, 1), box(0.5 + 1 / 64, 0, 1, 1)], false],
      ["interior hole", [box(0, 0, 1, 0.25), box(0, 0.75, 1, 1), box(0, 0.25, 0.25, 0.75), box(0.75, 0.25, 1, 0.75)], false],
      ["inset from contact plane", [box(0, 0, 1, 1, 0.25, 0.75)], false],
      ["empty shape", [], false], ["disabled collision", "none", false], ["explicit full cube", "full", true]
    ]) {
      const host = { ...block("minecraft:stone", ...location), collisionShape };
      const attachment = block("minecraft:sculk_vein", 0, 0, 0, { multi_face_direction_bits: bit });
      assert.equal(Boolean(support.resolveSubLevelBlockPlacement([host], attachment)), expected, `${bit}: ${label}`);
      if (bit === 2) {
        const vine = { ...block("minecraft:vine", 0, 0, 0, { vine_direction_bits: 0 }), renderState: 1 };
        const placed = support.resolveSubLevelBlockPlacement([host], vine);
        assert.equal(Boolean(placed), expected, `vine: ${label}`);
        if (placed) assert.equal(placed.additions[0].renderState, 1);
        assert.equal(support.resolveSubLevelBlockPlacement([{ ...host, collidable: false }], vine), undefined);
      }
    }
  }
});

test("vine ceiling placement uses the player ray and emits one placement sound", () => {
  const f = managedFixture();
  const Controller = f.load("content/block_outline_render/SubLevelOutlineController.ts").SubLevelOutlineController;
  const player = {
    id: "player", isValid: true, dimension: f.dimension, selectedSlotIndex: 0,
    getGameMode: () => "creative", inputInfo: { lastInputModeUsed: "keyboard" },
    getHeadLocation: () => ({ x: 0.5, y: -2, z: 0.5 }), getViewDirection: () => ({ x: 0, y: 1, z: 0 }),
    getBlockFromViewDirection: () => undefined
  };
  const controller = new Controller(f.runtime, { players: () => [player] });
  controller.start(); f.flush();
  const managed = f.manager.createSubLevel(f.dimension, { x: 0, y: 0, z: 0 }, [block("minecraft:stone", 0, 1, 0)]);
  controller.setPlaceHandler((...args) => f.manager.placeBlockForPlayerEdit(...args));
  controller.setPlacementEffectHandler((...args) => f.manager.emitBlockPlacementEffects(...args));
  const previousResolve = f.server.BlockPermutation.resolve;
  f.server.BlockPermutation.resolve = (id, states) => previousResolve(id, states ?? { vine_direction_bits: 0 });
  const item = { typeId: "minecraft:vine", getCanPlaceOn: () => [] };
  controller.handlePlace(player, item, controller.captureActionTarget(player));
  assert.equal(managed.handle.getBlockAtLocalLocation({ x: 0, y: 0, z: 0 }).renderState, 1);
  assert.equal(f.sounds.length, 1);
  controller.handlePlace(player, item, controller.captureActionTarget(player));
  assert.equal(managed.blockCount, 2);
  assert.equal(f.sounds.length, 1);
});

test("player placement rays reach support faces through existing attachments before rejecting occupied cells", () => {
  for (const [typeId, stateName, initial] of [
    ["minecraft:sculk_vein", "multi_face_direction_bits", 1],
    ["minecraft:vine", "vine_direction_bits", 1]
  ]) {
    const f = managedFixture();
    const Controller = f.load("content/block_outline_render/SubLevelOutlineController.ts").SubLevelOutlineController;
    const player = {
      id: "player", isValid: true, dimension: f.dimension, selectedSlotIndex: 0,
      getGameMode: () => "creative", inputInfo: { lastInputModeUsed: "keyboard" },
      getHeadLocation: () => ({ x: -2, y: 0.5, z: 0.5 }), getViewDirection: () => ({ x: 1, y: 0, z: 0 }),
      getBlockFromViewDirection: () => undefined
    };
    const controller = new Controller(f.runtime, { players: () => [player] });
    controller.start(); f.flush();
    const attachment = { ...block(typeId, 0, 0, 0, { [stateName]: initial }), collisionResponse: false };
    const managed = f.manager.createSubLevel(f.dimension, { x: 0, y: 0, z: 0 }, [
      block("minecraft:stone", 0, typeId === "minecraft:vine" ? 0 : -1, typeId === "minecraft:vine" ? 1 : 0),
      block("minecraft:stone", 1, 0, 0), attachment
    ]);
    controller.setPlaceHandler((...args) => f.manager.placeBlockForPlayerEdit(...args));
    controller.setPlacementEffectHandler((...args) => f.manager.emitBlockPlacementEffects(...args));
    const previousResolve = f.server.BlockPermutation.resolve;
    f.server.BlockPermutation.resolve = (id, states) => previousResolve(id, states ?? { [stateName]: 0 });
    const expected = controller.captureActionTarget(player);
    assert(expected);
    assert.equal(expected.blockKey, "0,0,0");
    controller.handlePlace(player, { typeId, getCanPlaceOn: () => [] }, expected);
    assert.equal(managed.handle.getBlockAtLocalLocation({ x: 0, y: 0, z: 0 }).states[stateName], initial);
    assert.equal(managed.blockCount, 3);
    assert.equal(f.sounds.length, 0);
  }
});

test("neighbor-dependent placement rolls back blocks, states and renderers when saving fails", () => {
  const f = managedFixture();
  const states = { upper_block_bit: false, pale_moss_carpet_side_north: "none", pale_moss_carpet_side_east: "none", pale_moss_carpet_side_south: "none", pale_moss_carpet_side_west: "none" };
  const floor = block("minecraft:stone", 0, -1, 0);
  const moss = block("minecraft:pale_moss_carpet", 0, 0, 0, states);
  const managed = f.manager.createSubLevel(f.dimension, { x: 0, y: 0, z: 0 }, [floor, moss]);
  const before = structuredClone(f.saved.get(managed.id));
  const save = f.storage.saveSubLevel;
  let failOnce = true;
  f.storage.saveSubLevel = function (...args) {
    if (failOnce) { failOnce = false; return false; }
    return save.apply(this, args);
  };
  assert.throws(() => f.manager.placeBlockForPlayerEdit({}, { typeId: "minecraft:stone" }, managed.handle, floor, { x: 1, y: 0, z: 0 }, "north", "up"), /persist/i);
  assert.deepEqual(managed.handle.blocks, before.blocks);
  assert.deepEqual(f.saved.get(managed.id).blocks, before.blocks);
  f.flush();
  assert(managed.handle.renderData.hasIntactEntities());
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
  const managed = f.manager.createSubLevel(f.dimension, { x: 0, y: 0, z: 0 }, [target, block("minecraft:jungle_log", -1, 1, 0)]);
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
    const kind = kinds.playerEditableContraptionBlockKind(typeId);
    if (kind === undefined) continue;
    for (const name of ["resolveVanillaBlockBreakSound", "resolveVanillaBlockHitSound", "resolveVanillaBlockPlaceSound"]) {
      for (const random of [0, 0.3, 1]) assert.deepEqual(actualSounds[name](typeId, () => random), expectedSounds[name](typeId, () => random), typeId);
    }
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

// UV corners in Bedrock JSON coordinates: top-left, top-right, bottom-left,
// bottom-right. Blockbench's Bedrock codec reflects X on import/export while
// keeping face names, and reverses both UV axes on up/down faces.
function bedrockCubeFaceVertices(cube, face) {
  const corners = {
    north: [[0, 1, 0], [1, 1, 0], [0, 0, 0], [1, 0, 0]],
    south: [[1, 1, 1], [0, 1, 1], [1, 0, 1], [0, 0, 1]],
    east: [[0, 1, 1], [0, 1, 0], [0, 0, 1], [0, 0, 0]],
    west: [[1, 1, 0], [1, 1, 1], [1, 0, 0], [1, 0, 1]],
    up: [[0, 1, 1], [1, 1, 1], [0, 1, 0], [1, 1, 0]],
    down: [[0, 0, 0], [1, 0, 0], [0, 0, 1], [1, 0, 1]]
  };
  return corners[face].map(corner => corner.map((value, axis) => cube.origin[axis] + value * cube.size[axis]));
}

function activeModelSurfaces(entity, resources, transformed = false, includeMultiply = false) {
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
    if (material.includes("multiply") && !includeMultiply) continue;
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
          for (const [face, uv] of Object.entries(cube.uv)) {
            const vertices = bedrockCubeFaceVertices(cube, face).map(vertex => {
              let point = vertex;
              if (cube.rotation) point = transformPoint(point, { pivot: cube.pivot ?? [0, 0, 0], rotation: cube.rotation });
              for (const transform of transforms) point = transformPoint(point, transform);
              const location = entity.vehicle?.location ?? entity.location;
              return point.map((value, axis) => Math.round((value + [location.x, location.y, -location.z][axis] * 16) * 1e6) / 1e6 || 0);
            });
            surfaces.push({
              texture: evaluate(controller.textures[0], arrays), material,
              light: controller.light_color_multiplier ?? 1,
              textureSize: [geometry.description.texture_width, geometry.description.texture_height],
              uv, vertices
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
    facing_direction: [0, 1, 2, 3, 4, 5], growth: [0, 1, 2, 3, 4, 5, 6, 7],
    upper_block_bit: [false, true],
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
    if (typeId === "minecraft:chest" || kinds.playerEditableContraptionBlockKind(typeId) === undefined) continue;
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

test("all vine ceiling combinations share geometry and tint in sparse and pool projections", () => {
  const f = fixture();
  const registry = f.load("sublevel/render/fancy/model/FancySubLevelModelRegistry.ts");
  const reader = modelResourceReader(join(sable, "packs/SableRP"), "sable/sublevel/fancy");
  for (let mask = 0; mask < 16; mask++) for (const top of [0, 1]) {
    const resolved = registry.resolveFancySubLevelBlock({ ...block("minecraft:vine", 0, 0, 0, { vine_direction_bits: mask }), renderState: top });
    assert.equal(resolved.state, top);
    for (const format of ["sparse", "pool"]) {
      const resource = resolved.model[format];
      const coordinateBits = (resource.xBits ?? 0) + (resource.yBits ?? 0) + (resource.zBits ?? 0);
      const descriptor = format === "pool" ? 2 ** (coordinateBits + resource.familyBits + resource.stateBits)
        + resource.family * 2 ** coordinateBits + top * 2 ** (coordinateBits + resource.familyBits) : top + 1;
      const entity = { typeId: resource.entityTypeId, location: { x: 0, y: 0, z: 0 }, getProperty: () => 0, molang: {
        model_variant: resource.variant, origin_xz: 1024 + 1024 * 2048,
        origin_y: 1024 + 2048 + 6 * 4096 + 6 * 131072, tint_input: 2 ** 20, s0: descriptor
      } };
      const resources = reader(entity);
      const surfaces = activeModelSurfaces(entity, resources, true, true);
      const base = surfaces.filter(surface => !surface.material.includes("multiply"));
      const tint = surfaces.filter(surface => surface.material.includes("multiply"));
      const label = `${mask}/${top}/${format}`;
      const count = (mask.toString(2).replaceAll("0", "").length + top) * 2;
      assert.equal(base.length, count, label);
      assert.equal(tint.length, count, label);
      const vertices = rows => rows.map(row => JSON.stringify(row.vertices)).sort();
      assert.deepEqual(vertices(base), vertices(tint), `${label}: tint must redraw exactly the base triangles`);
      const ceilings = base.filter(surface => surface.vertices.every(point => Math.abs(point[1] + 8.8) < 1e-6));
      assert.equal(ceilings.length, top * 2, `${label}: vanilla vine plane is 0.8px below the cell ceiling`);
      if (top) {
        assert.deepEqual(ceilings.map(surface => [surface.uv.uv, surface.uv.uv_size].flat().join(",")).sort(), [
          "0,0,16,16", "0,16,16,-16"
        ], `${label}: top UV stays on the horizontal face`);
      }
      assert(base.every(surface => surface.texture === "textures/blocks/vine" && surface.material === "alpha_block_color"));
      assert(tint.every(surface => surface.texture === "textures/colormap/foliage"));
      entity.molang.s0 = 0;
      assert.deepEqual(activeModelSurfaces(entity, resources, true, true), [], `${label}: removed slots hide both passes`);
    }
  }
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

test("new Fancy projections recover early missed input during capture, placement and reconstruction", () => {
  const reader = modelResourceReader(join(sable, "packs/SableRP"), "sable/sublevel/fancy");
  for (const scenario of ["capture", "placement", "reconstruction"]) for (const readyAfter of [2, 3, 7, 11, 19]) {
    const f = managedFixture();
    const deliveries = new Map();
    const spawn = f.dimension.spawnEntity;
    f.dimension.spawnEntity = (...args) => {
      const entity = spawn(...args);
      if (!entity.typeId.startsWith("sable:fancy_") || entity.typeId.includes("carrier")) return entity;
      const born = f.system.currentTick;
      const delivery = { born, sends: [], received: [] };
      deliveries.set(entity.id, delivery);
      const play = entity.playAnimation.bind(entity);
      entity.playAnimation = (animation, options) => {
        delivery.sends.push(f.system.currentTick);
        if (f.system.currentTick - born < readyAfter) return;
        play(animation, options);
        delivery.received.push(f.system.currentTick);
      };
      return entity;
    };
    const advance = end => {
      while (f.system.currentTick < end) { f.flush(); f.manager.tick(f.system.currentTick); }
    };
    const target = block("minecraft:grass_block");
    let managed;
    let previous;
    if (scenario === "capture") {
      f.system.currentTick = 7;
      f.dimension.getBlock(target.localLocation).setType(target.typeId);
      managed = f.manager.createSubLevelFromRegion(f.dimension, target.localLocation, target.localLocation);
      assert.equal(f.dimension.getBlock(target.localLocation).typeId, "minecraft:air");
    } else {
      managed = f.manager.createSubLevel(f.dimension, target.localLocation, [target]);
      advance(20);
      previous = [...deliveries.keys()];
      const typeId = scenario === "placement" ? "minecraft:grass_block" : "minecraft:beacon";
      assert(f.manager.placeBlockForPlayerEdit({}, { typeId }, managed.handle, target, { x: 1, y: 0, z: 0 }, "south", "up"));
      if (scenario === "reconstruction") assert(previous.every(id => !f.entities.get(id).isValid));
    }
    const entity = [...f.entities.values()].find(entity => entity.isValid && deliveries.has(entity.id)
      && !previous?.includes(entity.id));
    const delivery = deliveries.get(entity.id);
    advance(delivery.born + 1);
    assert.deepEqual(activeModelSurfaces(entity, reader(entity)), [], "uninitialized clients must remain hidden");
    advance(delivery.born + readyAfter + 3);
    assert(delivery.received.length > 0, `${scenario}: client ready at ${readyAfter} must recover within 3 ticks`);
    assert(delivery.received[0] - delivery.born - readyAfter <= 3);
    assert(activeModelSurfaces(entity, reader(entity)).length > 0);
    assert.equal(entity.molang.origin_y % 4096 >= 2048, true);
    assert(entity.molang.s0 > 0);
    assert(entity.molang.tint_input > 0, "the retry must carry grass tint as well as geometry selection");
    assert.equal(entity.animationOptions.controller, "sable_fancy_input");
    const oldSends = previous?.map(id => deliveries.get(id).sends.length);
    if (previous) {
      // A force-sync at placement is expected; startup retries for the new
      // entity must not keep sending the old entity's snapshots afterward.
      advance(39);
      assert.deepEqual(previous.map(id => deliveries.get(id).sends.length), oldSends);
    }
    managed.remove();
    const sends = [...deliveries.values()].map(value => value.sends.length);
    advance(delivery.born + 70);
    assert.deepEqual([...deliveries.values()].map(value => value.sends.length), sends, "removed projections must not receive queued retries");
  }
});

test("managed render synchronization is independent of the 20-tick integrity scan", () => {
  const f = managedFixture();
  f.system.currentTick = 7;
  const managed = f.manager.createSubLevel(f.dimension, { x: 0, y: 0, z: 0 }, [block("minecraft:stone")]);
  const render = managed.handle.renderData;
  const sync = render.sync.bind(render);
  const synced = [];
  render.sync = (...args) => { synced.push(f.system.currentTick); return sync(...args); };
  const getBlock = f.dimension.getBlock;
  const regionReads = [];
  f.dimension.getBlock = location => { regionReads.push(f.system.currentTick); return getBlock(location); };
  const entity = [...f.entities.values()].find(entity => entity.typeId.startsWith("sable:fancy_") && !entity.typeId.includes("carrier"));
  while (f.system.currentTick < 46) { f.flush(); f.manager.tick(f.system.currentTick); }
  assert(synced.includes(9) && synced.includes(21), "render sync must run between integrity scans");
  assert(regionReads.length > 0 && regionReads.every(tick => tick % 20 === 0), "native region checks must remain infrequent");
  entity.molang = {};
  f.flush(); f.manager.tick(f.system.currentTick);
  assert.equal(f.system.currentTick, 47);
  assert(entity.molang.origin_y % 4096 >= 2048, "40-tick refresh must not wait for the next integrity scan");
  managed.remove();
});

test("startup retries retain edits within a shared model and stop when it is removed", () => {
  const f = fixture();
  const registry = f.load("sublevel/render/fancy/model/FancySubLevelModelRegistry.ts");
  const layout = f.load("sublevel/render/fancy/model/FancySubLevelModelLayout.ts");
  const { FancySubLevelModelRenderer } = f.load("sublevel/render/fancy/model/FancySubLevelModelRenderer.ts");
  const entries = [0, 1].map(x => block("minecraft:chest", x, 0, 0, { "minecraft:cardinal_direction": "south" }));
  const packed = layout.packFancySubLevelModels(entries.map(registry.resolveFancySubLevelBlock)).models;
  assert.equal(packed.length, 1);
  const renderer = new FancySubLevelModelRenderer(body, packed, f.dimension.spawnEntity, undefined, undefined, { x: 0, y: 0, z: 0 });
  renderer.sync(true);
  renderer.releaseInitialPose();
  while (f.system.currentTick < 3) f.flush();
  const entity = renderer.entityIds.map(id => f.entities.get(id)).find(entity => !entity.typeId.includes("carrier"));
  assert(renderer.setBlockModelState("0,0,0", "open", 1));
  renderer.removeBlocks(new Set(["1,0,0"]));
  const latest = { ...entity.molang };
  entity.molang = {};
  f.flush();
  assert.deepEqual(entity.molang, latest, "retry must preserve the open lid and the cleared neighboring slot");
  renderer.removeBlocks(new Set(["0,0,0"]));
  assert.equal(entity.isValid, false);
  const writes = entity.animationWrites;
  while (f.system.currentTick < 25) f.flush();
  assert.equal(entity.animationWrites, writes, "queued retries must not address an emptied model while its body is still valid");
  renderer.remove();
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
  movingBody.isSleeping = true;
  renderer.sync();
  while (f.system.currentTick < 20) { f.flush(); renderer.sync(); }
  assert.deepEqual(entity.molang, latest, "startup retries must retain the newest pose instead of the spawn snapshot");
  const writes = entity.animationWrites;
  while (f.system.currentTick < 39) { f.flush(); renderer.sync(); }
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
