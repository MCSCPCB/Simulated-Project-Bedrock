import { readFileSync } from "node:fs";
import type { CompiledModel, CompiledPool } from "./registry.ts";
import { CARRIER_SEAT_COUNT } from "../../src/sublevel/render/SubLevelRenderData.ts";

export const VANILLA_PROPERTY_NAMES = [
  "scale", "pitch", "yaw", "roll", "local_pitch", "local_yaw", "local_roll",
  "left_local_pitch", "left_local_yaw", "left_local_roll", "local_x", "local_y",
  "local_z", "left_local_x", "left_local_y", "left_local_z", "left_item_offset"
] as const;

type JsonObject = Record<string, unknown>;

const FULL_FACES = ["up", "down", "north", "south", "east", "west"] as const;
type FullFace = typeof FULL_FACES[number];

const DENSE_SLOT_COUNT = 245;
const DENSE_WIDTH = 7;
const DENSE_DEPTH = 7;
const SPARSE_SLOT_COUNT = 26;
const SPARSE_SIZE = 64;

// Mirrors the shared block rotation encoding: south=0, west=1, north=2, east=3.
const QUARTER_TURN_BY_DIRECTION: Record<string, number> = {
  south: 0,
  west: 1,
  north: 2,
  east: 3
};

const COLORMAP_TEXTURES: Readonly<Record<string, string>> = {
  colormap_foliage: "textures/colormap/foliage",
  colormap_swamp_foliage: "textures/colormap/swamp_foliage",
  colormap_mangrove_swamp_foliage: "textures/colormap/mangrove_swamp_foliage",
  colormap_birch: "textures/colormap/birch",
  colormap_evergreen: "textures/colormap/evergreen",
  colormap_foliage_fixed: "textures/colormap/foliage_fixed"
};

const COLORMAP_TEXTURE_ARRAY = Object.keys(COLORMAP_TEXTURES).map(name => `Texture.${name}`);

// Slot geometry library: bone subtrees lifted verbatim from the proven
// TreePhysics fragment resources; "{s}" expands to the slot index.
interface LibraryBone {
  readonly name: string;
  readonly parent?: string;
  readonly pivot?: readonly number[];
  readonly rotation?: readonly number[];
  readonly cubes?: readonly JsonObject[];
}
interface LibraryChannel {
  readonly textureRole: string;
  readonly textureSize: readonly [number, number];
  readonly bones: readonly LibraryBone[];
}
type ModelGeometryLibrary = Readonly<Record<string, Readonly<Record<string, {
  readonly channels: Readonly<Record<string, LibraryChannel>>;
}>>>>;

const MODEL_GEOMETRY = JSON.parse(
  readFileSync(new URL("../../src/data/reference/model-geometry.json", import.meta.url), "utf8")
) as ModelGeometryLibrary;

const RAW_JSON_NUMBER_PREFIX = "__sable_raw_json_number__:";

export function rawJsonNumber(value: number): string {
  return `${RAW_JSON_NUMBER_PREFIX}${Number.isInteger(value) ? `${value}.0` : value}`;
}

function property(type: "float" | "int", range: readonly [number, number], defaultValue = 0): JsonObject {
  if (type === "float") {
    return {
      type,
      range: range.map(rawJsonNumber),
      client_sync: true,
      default: "0"
    };
  }
  return { type, range, client_sync: true, default: defaultValue };
}

// Persistent storage entities (container inventories) declare this family so
// every carrier accepts them without matching the render-entity families the
// startup reclaim sweeps.
const PERSISTENT_RIDER_FAMILY = "sable_persistent_rider";

function commonComponents(family: string, rideable = false): JsonObject {
  const components: JsonObject = {
    "minecraft:type_family": { family: [family, "inanimate"] },
    "minecraft:damage_sensor": { triggers: [{ cause: "all", deals_damage: false }] },
    "minecraft:collision_box": { height: 0, width: 0 },
    "minecraft:pushable": { is_pushable: false, is_pushable_by_piston: false },
    "minecraft:persistent": {},
    "minecraft:physics": { has_collision: false, has_gravity: false },
    "minecraft:conditional_bandwidth_optimization": { conditional_values: [], default_values: {} }
  };
  if (rideable) {
    components["minecraft:rideable"] = {
      family_types: [family, PERSISTENT_RIDER_FAMILY],
      seat_count: CARRIER_SEAT_COUNT,
      seats: Array.from({ length: CARRIER_SEAT_COUNT }, (_, index) => ({
        max_rider_count: CARRIER_SEAT_COUNT,
        min_rider_count: index === 0 ? 0 : index,
        position: [0, 0, 0],
        lock_rider_rotation: 0
      }))
    };
  }
  return components;
}

export function createCarrierEntity(identifier: string, family: string): JsonObject {
  return {
    format_version: "1.20.30",
    "minecraft:entity": {
      description: {
        identifier,
        is_spawnable: false,
        is_summonable: true,
        runtime_identifier: "minecraft:arrow"
      },
      components: commonComponents(family, true)
    }
  };
}

export function createVanillaEntity(): JsonObject {
  const properties: JsonObject = {};
  for (const name of VANILLA_PROPERTY_NAMES) {
    const range: readonly [number, number] = name === "scale"
      ? [0, 16]
      : name === "left_item_offset" ? [-3, 3] : /^(?:left_)?local_[xyz]$/.test(name)
        ? [-512, 512] : [-400, 400];
    properties[`sable:${name}`] = property("float", range);
  }
  return {
    format_version: "1.20.30",
    "minecraft:entity": {
      description: {
        identifier: "sable:block",
        is_spawnable: false,
        is_summonable: true,
        properties
      },
      components: {
        ...commonComponents("block"),
        "minecraft:equipment": {}
      }
    }
  };
}

export function createFancyEntity(identifier: string): JsonObject {
  return {
    format_version: "1.20.30",
    "minecraft:entity": {
      description: {
        identifier,
        is_spawnable: false,
        is_summonable: true,
        runtime_identifier: "minecraft:arrow"
      },
      components: commonComponents("fancy_model")
    }
  };
}

interface ModelChannel {
  readonly name: string;
  readonly texture: string;
  readonly textureSize: readonly [number, number];
  readonly bones: readonly LibraryBone[];
  readonly wrapperRotation?: readonly [number, number, number];
}

function faceUvMap(faces: readonly FullFace[]): JsonObject {
  const uv: JsonObject = {};
  for (const face of faces) uv[face] = { uv: [0, 0], uv_size: [16, 16] };
  return uv;
}

function libraryChannels(type: string, variant: string): Readonly<Record<string, LibraryChannel>> {
  const channels = MODEL_GEOMETRY[type]?.[variant]?.channels;
  if (!channels) throw new Error(`Model geometry library is missing ${type}/${variant}.`);
  return channels;
}

interface GrassRectangle {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

// The vanilla grass-side texture has a four-pixel grass fringe. Its alpha
// mask is stable across the supplied Bedrock resource pack; the greedy
// decomposition keeps large uninterrupted areas together while preserving
// every transparent cut-out at the dirt boundary.
function grassSideRectangles(): GrassRectangle[] {
  const mask = [
    "1111111111111111",
    "1111101111111111",
    "1011101011110110",
    "0000100010100000"
  ].map(row => [...row].map(value => value === "1"));
  const rectangles: GrassRectangle[] = [];
  while (mask.some(row => row.includes(true))) {
    let best: { x: number; y: number; width: number; height: number; area: number } | undefined;
    for (let y = 0; y < mask.length; y++) {
      for (let x = 0; x < mask[y]!.length; x++) {
        if (!mask[y]![x]) continue;
        let width = mask[y]!.length - x;
        for (let height = 1; y + height <= mask.length; height++) {
          let rowWidth = 0;
          while (rowWidth < width && mask[y + height - 1]![x + rowWidth]) rowWidth++;
          width = rowWidth;
          if (width === 0) break;
          const area = width * height;
          if (!best || area > best.area) best = { x, y, width, height, area };
        }
      }
    }
    if (!best) throw new Error("Grass side mask contains an unresolvable pixel.");
    rectangles.push({ x: best.x, y: best.y, width: best.width, height: best.height });
    for (let y = best.y; y < best.y + best.height; y++) {
      for (let x = best.x; x < best.x + best.width; x++) mask[y]![x] = false;
    }
  }
  return rectangles;
}

function modelChannels(model: CompiledModel): ModelChannel[] {
  const description = model.model as JsonObject;
  const type = String(description.type);
  if (type === "full_block") {
    const textures = description.textures as Record<FullFace, string>;
    const size = (description.size as readonly [number, number, number] | undefined) ?? [16, 16, 16];
    const origin: readonly [number, number, number] = [-8, -24, -8];
    const byTexture = new Map<string, FullFace[]>();
    for (const face of FULL_FACES) {
      const faces = byTexture.get(textures[face]);
      if (faces) faces.push(face);
      else byTexture.set(textures[face], [face]);
    }
    return [...byTexture].map(([texture, faces]) => ({
      name: faces[0]!,
      texture,
      textureSize: [16, 16],
      bones: [{
        name: "slot_{s}",
        pivot: [0, -16, 0],
        cubes: [{ origin, size, uv: faceUvMap(faces) }]
      }]
    }));
  }
  if (type === "wall") {
    const texture = String(description.texture);
    const bones: LibraryBone[] = [];
    bones.push({ name: "post_{s}", pivot: [0, -16, 0], cubes: [{ origin: [-4, -24, -4], size: [8, 16, 8], uv: faceUvMap(FULL_FACES) }] });
    for (const [direction, origin, size] of [
      ["north", [-3, -24, -8], [6, 14, 11]], ["north", [-3, -24, -8], [6, 16, 11]],
      ["south", [-3, -24, -3], [6, 14, 11]], ["south", [-3, -24, -3], [6, 16, 11]],
      ["west", [-8, -24, -3], [11, 14, 6]], ["west", [-8, -24, -3], [11, 16, 6]],
      ["east", [-3, -24, -3], [11, 14, 6]], ["east", [-3, -24, -3], [11, 16, 6]]
    ] as const) {
      const height = size[1] === 16 ? "tall" : "short";
      bones.push({
        name: `${direction}_${height}_{s}`,
        pivot: [0, -16, 0],
        cubes: [{ origin, size, uv: faceUvMap(FULL_FACES) }]
      });
    }
    return [{ name: "default", texture, textureSize: [16, 16], bones }];
  }
  if (type === "moss_carpet") {
    const texture = String(description.texture);
    const pale = Boolean(description.pale);
    const bones: LibraryBone[] = [
      { name: "base_top_{s}", pivot: [0, -16, 0], cubes: [{ origin: [-8, -9, -8], size: [16, 1, 16], uv: { up: { uv: [0, 0], uv_size: [16, 16] }, down: { uv: [0, 0], uv_size: [16, 16] } } }] },
      { name: "base_bottom_{s}", pivot: [0, -16, 0], cubes: [{ origin: [-8, -24, -8], size: [16, 1, 16], uv: { up: { uv: [0, 0], uv_size: [16, 16] }, down: { uv: [0, 0], uv_size: [16, 16] } } }] }
    ];
    for (const [direction, origin, size] of [
      ["north", [-8, -10, -8], [16, 1, 1]], ["north", [-8, -11, -8], [16, 2, 1]], ["north", [-8, -13, -8], [16, 4, 1]],
      ["south", [-8, -10, 7], [16, 1, 1]], ["south", [-8, -11, 7], [16, 2, 1]], ["south", [-8, -13, 7], [16, 4, 1]],
      ["west", [-8, -10, -8], [1, 1, 16]], ["west", [-8, -11, -8], [1, 2, 16]], ["west", [-8, -13, -8], [1, 4, 16]],
      ["east", [7, -10, -8], [1, 1, 16]], ["east", [7, -11, -8], [1, 2, 16]], ["east", [7, -13, -8], [1, 4, 16]]
    ] as const) {
      const height = size[1] === 1 ? "none" : size[1] === 2 ? "short" : "tall";
      const bottomOrigin = [origin[0], -24, origin[2]] as const;
      bones.push(
        { name: `${direction}_${height}_top_{s}`, pivot: [0, -16, 0], cubes: [{ origin, size, uv: faceUvMap([direction]) }] },
        { name: `${direction}_${height}_bottom_{s}`, pivot: [0, -16, 0], cubes: [{ origin: bottomOrigin, size, uv: faceUvMap([direction]) }] }
      );
    }
    return [{ name: "default", texture, textureSize: [16, 16], bones }];
  }
  if (type === "pointed_dripstone") {
    const texture = String(description.texture);
    const thickness = String(description.thickness) as "tip" | "frustum" | "middle" | "base" | "merge";
    const hanging = Boolean(description.hanging);
    const profile: Readonly<Record<string, readonly [number, number]>> = {
      tip: [2, 10], frustum: [6, 8], middle: [8, 6], base: [12, 4], merge: [10, 6]
    };
    const [width, height] = profile[thickness];
    const y = hanging ? -8 - height : -24;
    const cubes: JsonObject[] = [];
    for (let index = 0; index < height; index++) {
      const span = Math.max(1, Math.round(hanging
        ? 2 + (width - 2) * index / Math.max(1, height - 1)
        : width - (width - 2) * index / Math.max(1, height - 1)));
      const originY = y + index;
      cubes.push({
        origin: [-span / 2, originY, -span / 2],
        size: [span, 1, span],
        uv: faceUvMap(FULL_FACES)
      });
    }
    return [{
      name: "default",
      texture,
      textureSize: [16, 16],
      bones: [{ name: "slot_{s}", pivot: [0, -16, 0], cubes }]
    }];
  }
  if (type === "pillar" || type === "creaking_heart") {
    const textures = description.textures as { side: string; top: string };
    const variant = type === "creaking_heart" ? String(description.axis) : "default";
    const wrapper = type === "pillar" ? pillarWrapperRotation(String(description.axis)) : undefined;
    return Object.entries(libraryChannels(type, variant)).map(([name, channel]) => ({
      name,
      texture: name === "top" ? textures.top : textures.side,
      textureSize: channel.textureSize,
      bones: channel.bones,
      ...(wrapper ? { wrapperRotation: wrapper } : {})
    }));
  }
  if (type === "bee_nest") {
    const textures = description.textures as Record<"down" | "up" | "front" | "side", string>;
    const wrapper = beeNestWrapperRotation(Number(description.direction));
    return Object.entries(libraryChannels(type, "default")).map(([name, channel]) => ({
      name,
      texture: textures[name as "down" | "up" | "front" | "side"],
      textureSize: channel.textureSize,
      bones: channel.bones,
      ...(wrapper ? { wrapperRotation: wrapper } : {})
    }));
  }
  if (type === "mangrove_roots") {
    const textures = description.textures as { side: string; top: string };
    return Object.entries(libraryChannels(type, "default")).map(([name, channel]) => ({
      name,
      texture: name === "top" ? textures.top : textures.side,
      textureSize: channel.textureSize,
      bones: channel.bones
    }));
  }
  const texture = typeof description.texture === "string"
    ? description.texture
    : "textures/blocks/missing_tile";
  if (type === "chest") {
    const channel = libraryChannels(type, "default").default!;
    const turn = QUARTER_TURN_BY_DIRECTION[String(description.facing)] ?? 0;
    // The unrotated chest faces south in Sable's projection, as verified in-game.
    return [{
      name: "default",
      texture,
      textureSize: channel.textureSize,
      bones: channel.bones,
      wrapperRotation: [0, turn * 90, 0]
    }];
  }
  if (type === "cocoa") {
    const channel = libraryChannels(type, String(description.age)).default!;
    const direction = Number(description.direction);
    return [{
      name: "default",
      texture,
      textureSize: channel.textureSize,
      bones: channel.bones,
      ...(direction ? { wrapperRotation: [0, direction * 90, 0] } : {})
    }];
  }
  if (type === "vine") {
    const channel = libraryChannels(type, "default").default!;
    const faces = new Set((description.faces as string[]).map(face => `vine_${face}_{s}`));
    return [{
      name: "default",
      texture,
      textureSize: channel.textureSize,
      bones: channel.bones.filter(bone => bone.name === "slot_{s}" || faces.has(bone.name))
    }];
  }
  if (type === "mangrove_propagule") {
    const channel = libraryChannels(type, String(description.stage)).default!;
    return [{ name: "default", texture, textureSize: channel.textureSize, bones: channel.bones }];
  }
  const channel = libraryChannels(type, "default").default!;
  return [{ name: "default", texture, textureSize: channel.textureSize, bones: channel.bones }];
}

function pillarWrapperRotation(axis: string): readonly [number, number, number] | undefined {
  if (axis === "x") return [0, 0, 90];
  if (axis === "z") return [90, 0, 0];
  return undefined;
}

function beeNestWrapperRotation(direction: number): readonly [number, number, number] | undefined {
  // Sable's model space already mirrors the world Z axis when it projects
  // entity vertices. The TreePhysics attachment encoding inverted all four
  // state values for its own projection, which reverses the two X-facing
  // bee-nest states in Sable. Keep the Z-facing states unchanged and express
  // the native direction directly in Sable's yaw convention.
  const yaw = (direction - 2) * 90;
  return yaw === 0 ? undefined : [0, yaw, 0];
}

// Keep the library's rest pose. Slot orientation comes from the transform
// animation, following the source's state-driven log and cube-block rotations.
function instantiateBones(
  channel: Pick<ModelChannel, "bones">,
  slot: number,
  parent: string,
  namePrefix = ""
): JsonObject[] {
  return channel.bones.map(bone => {
    const record: JsonObject = { name: namePrefix + bone.name.replaceAll("{s}", String(slot)) };
    record.parent = bone.parent
      ? namePrefix + bone.parent.replaceAll("{s}", String(slot))
      : parent;
    if (bone.pivot) record.pivot = bone.pivot;
    if (bone.rotation) record.rotation = bone.rotation;
    if (bone.cubes) record.cubes = bone.cubes;
    return record;
  });
}

function channelBoneNames(
  channel: Pick<ModelChannel, "bones">,
  slot: number,
  namePrefix = ""
): string[] {
  return channel.bones.map(bone => (
    namePrefix + bone.name.replaceAll("{s}", String(slot))
  ));
}

export function modelOrientation(model: CompiledModel): readonly [number, number, number] | undefined {
  return modelChannels(model).find(channel => channel.wrapperRotation)?.wrapperRotation;
}

function isTintMaterial(model: CompiledModel): boolean {
  return model.material === "alpha_test_tint" || model.material === "opaque_tint";
}

function tintChannels(model: CompiledModel): ModelChannel[] {
  if (model.tint?.method !== "grass") return modelChannels(model);
  // The base keeps all six ordinary block faces. Only the multiply shell
  // follows the grass mask; Equal-depth blending uses these exact planes.
  const cubes: JsonObject[] = [
    { origin: [-8, -9, -8], size: [16, 1, 16], uv: faceUvMap(["up"]) }
  ];
  for (const { x, y, width, height } of grassSideRectangles()) {
    const bottom = -8 - y - height;
    for (const [face, origin, size] of [
      ["north", [-8 + x, bottom, -8], [width, height, 1]],
      ["south", [8 - x - width, bottom, 7], [width, height, 1]],
      ["west", [-8, bottom, 8 - x - width], [1, height, width]],
      ["east", [7, bottom, -8 + x], [1, height, width]]
    ] as const) {
      cubes.push({ origin, size, uv: { [face]: { uv: [x, y], uv_size: [width, height] } } });
    }
  }
  return [{
    name: "tint",
    texture: "textures/colormap/grass",
    textureSize: [16, 16],
    bones: [{ name: "slot_{s}", pivot: [0, -16, 0], cubes }]
  }];
}

function hasFoliageTint(model: CompiledModel): boolean {
  return isTintMaterial(model) && (model.tint?.method === "foliage" || model.tint?.method === "grass");
}

function hasFixedTint(model: CompiledModel): boolean {
  return isTintMaterial(model) && model.tint?.method === "fixed";
}

function baseMaterial(model: CompiledModel): string {
  if (model.material === "blend") return "blend_block";
  if (model.material === "translucent") return "translucent_block";
  if (model.material === "opaque_emissive") return "opaque_block_emissive";
  // This is a selective material: the model keeps its normal cutout base and
  // bones named redstone_torch* are redirected to the emissive material below.
  if (model.material === "redstone_torch_emissive") return "alpha_block";
  if (model.material === "opaque") return model.flipbook ? "opaque_block_flipbook" : "opaque_block";
  if (model.material === "alpha_test") {
    if (model.model.type === "chest") return model.flipbook ? "alpha_block_flipbook" : "alpha_block";
    return model.flipbook ? "alpha_block_flipbook" : "alpha_block_color";
  }
  if (model.material === "opaque_tint") return "opaque_block";
  return model.flipbook ? "alpha_block_color_flipbook" : "alpha_block_color";
}

function redstoneTorchMaterialBindings(names: readonly string[]): JsonObject {
  const bindings: JsonObject = {};
  for (const name of names) {
    if (/(^|_)redstone_torch(?:$|_)/i.test(name)) {
      bindings[name] = "Material.redstone_torch";
    }
  }
  return bindings;
}

function controllerMaterials(
  model: CompiledModel,
  defaultMaterial: string,
  boneNames: readonly string[]
): JsonObject[] {
  return [{
    "*": `Material.${defaultMaterial}`,
    ...(model.material === "redstone_torch_emissive"
      ? redstoneTorchMaterialBindings(boneNames)
      : {})
  }];
}

function flipbookAnimation(model: CompiledModel): JsonObject | undefined {
  const flipbook = model.flipbook;
  if (!flipbook) return undefined;
  const elapsedFrames = `(Math.floor(query.life_time * 20.0 / ${flipbook.ticksPerFrame}.0))`;
  const frame = flipbook.loop
    ? `Math.mod(${elapsedFrames}, ${flipbook.frameCount}.0)`
    : `Math.min(${flipbook.frameCount - 1}.0, ${elapsedFrames})`;
  const fraction = `(${frame} / ${flipbook.frameCount}.0)`;
  return {
    offset: flipbook.axis === "u" ? [fraction, 0.0] : [0.0, fraction],
    scale: flipbook.axis === "u"
      ? [1.0 / flipbook.frameCount, 1.0]
      : [1.0, 1.0 / flipbook.frameCount]
  };
}

// Mirrors TreePhysics: leaf-style cutout blocks render without the shared
// 0.88 light multiplier, every other fragment controller keeps it.
function lightColorMultiplier(model: CompiledModel): JsonObject {
  return model.model.type === "full_block" && model.material !== "opaque" && model.material !== "opaque_emissive" && model.material !== "opaque_tint"
    ? {}
    : { light_color_multiplier: 0.88 };
}

function isChestModel(model: CompiledModel): boolean {
  return model.model.type === "chest";
}

function stateBits(model: CompiledModel): number {
  return isChestModel(model) ? 1 : model.model.type === "wall" || (model.model.type === "moss_carpet" && model.model.pale) ? 9 : 0;
}

function modelKeyName(model: CompiledModel, format: "dense" | "sparse"): string {
  return `sable_model_${model.name}_${format}`;
}

function slotCountOf(format: "dense" | "sparse"): number {
  return format === "dense" ? DENSE_SLOT_COUNT : SPARSE_SLOT_COUNT;
}

function decodeExpression(format: "dense" | "sparse", slot: number, bits: number): string {
  const word = format === "dense" ? Math.floor(slot / Math.floor(24 / (bits + 1))) : slot;
  if (format === "sparse") return `math.mod(v.s${word}, 64)`;
  const slotsPerWord = Math.floor(24 / (bits + 1));
  const shift = (slot % slotsPerWord) * (bits + 1);
  return `math.mod(math.floor(v.s${word} / ${2 ** shift}), ${2 ** (bits + 1)})`;
}

function initializeMolang(): string[] {
  // A client can render before the first playAnimation packet arrives. Keep
  // any input already delivered, and hide the model until origin_y releases it.
  return [
    ...[
      "origin_xz", "origin_y", "tint_input", "model_variant",
      "pitch_target", "yaw_target", "roll_target", "model_rx", "model_ry", "model_rz"
    ].map(name => `v.${name} = v.${name} ?? 0;`),
    "v.pose_initialized = 0;",
    "v.pose_ready = 0;"
  ];
}

function poseMolang(): string[] {
  return [
    "v.pose_ready = math.mod(v.origin_y, 4096) >= 2048;",
    "v.pitch = v.pose_ready ? (v.pose_initialized ? math.lerprotate(v.pitch, v.pitch_target, q.delta_time/0.05) : v.pitch_target) : 0;",
    "v.yaw = v.pose_ready ? (v.pose_initialized ? math.lerprotate(v.yaw, v.yaw_target, q.delta_time/0.05) : v.yaw_target) : 0;",
    "v.roll = v.pose_ready ? (v.pose_initialized ? math.lerprotate(v.roll, v.roll_target, q.delta_time/0.05) : v.roll_target) : 0;",
    "v.pose_initialized = v.pose_ready;",
    "v.tint = v.tint_input;"
  ];
}

function tintDecodeMolang(): string[] {
  return [
    "v.tint_0 = math.mod(math.floor(v.tint / 1), 32);",
    "v.tint_1 = math.mod(math.floor(v.tint / 32), 32);",
    "v.tint_2 = math.mod(math.floor(v.tint / 1024), 32);",
    "v.tint_3 = math.mod(math.floor(v.tint / 32768), 32);",
    "v.tint_state = math.floor(v.tint / 1048576);",
    "v.tint_uniform = v.tint_state == 7;",
    "v.tint_axis_z = v.tint_state >= 8;",
    "v.tint_kind = v.tint_uniform ? 1 : math.mod(v.tint_state, 8);",
    "v.tint_pixel_u = math.mod(v.tint, 256);",
    "v.tint_pixel_v = math.mod(math.floor(v.tint / 256), 256);"
  ];
}

function wordReadMolang(count = SPARSE_SLOT_COUNT): string[] {
  return Array.from({ length: count }, (_, index) => (
    `v.s${index} = v.s${index} ?? 0;`
  ));
}

/** The chest lid eases open and closed with the TreePhysics timing curve. */
function lidEasingMolang(slotCount: number, openCondition: (slot: number) => string): string[] {
  const result: string[] = [];
  for (let slot = 0; slot < slotCount; slot++) {
    result.push(
      `v.lid_${slot} = v.lids_initialized ? math.clamp(v.lid_${slot} + (${openCondition(slot)} ? 2 : -2) * q.delta_time, 0, 1) : (${openCondition(slot)});`
    );
  }
  result.push("v.lids_initialized = 1;");
  return result;
}

function preAnimation(model: CompiledModel, format: "dense" | "sparse"): string[] {
  const bits = stateBits(model);
  const result = [
    ...poseMolang(),
    "v.layout_width = 1 + math.mod(math.floor(v.origin_y / 4096), 32);",
    "v.layout_depth = 1 + math.floor(v.origin_y / 131072);",
    "v.layout_plane = v.layout_width * v.layout_depth;"
  ];
  if (isTintMaterial(model)) result.push(...tintDecodeMolang());
  result.push(...wordReadMolang(format === "dense" ? Math.ceil(DENSE_SLOT_COUNT / Math.floor(24 / (bits + 1))) : SPARSE_SLOT_COUNT));
  for (let slot = 0; slot < slotCountOf(format); slot++) {
    result.push(`v.c${slot} = ${decodeExpression(format, slot, bits)};`);
  }
  if (isChestModel(model)) {
    result.push(...lidEasingMolang(slotCountOf(format), slot => `v.c${slot} > 1`));
  }
  return result;
}

function slotPosition(format: "dense" | "sparse", slot: number): [string, string, string] {
  if (format === "sparse") {
    return [
      `math.mod(math.floor(v.s${slot} / 64), 64) * 16`,
      `math.mod(math.floor(v.s${slot} / 4096), 64) * 16`,
      `-math.mod(math.floor(v.s${slot} / 262144), 64) * 16`
    ];
  }
  return [
    `math.mod(${slot}, v.layout_width) * 16`,
    `math.floor(${slot} / v.layout_plane) * 16`,
    `-math.mod(math.floor(${slot} / v.layout_width), v.layout_depth) * 16`
  ];
}

export function createFancyClientEntity(model: CompiledModel, format: "dense" | "sparse"): JsonObject {
  const id = format === "dense" ? model.denseEntityTypeId : model.sparseEntityTypeId;
  const key = modelKeyName(model, format);
  const channels = modelChannels(model);
  const animations: JsonObject = {
    input: "animation.sable.fancy.input",
    transform: `animation.${key}.transform`
  };
  const animate: unknown[] = ["transform"];
  const initialize = initializeMolang();
  if (isChestModel(model)) {
    animations.lid_pose = `animation.${key}.lid_pose`;
    animate.push("lid_pose");
    initialize.push("v.lids_initialized = 0;");
  }
  const materials: JsonObject = { default: baseMaterial(model) };
  if (model.material === "redstone_torch_emissive") {
    materials.redstone_torch = "redstone_torch_block_emissive";
  }
  if (isTintMaterial(model)) materials.tint_multiply = "tint_multiply";
  const textures: JsonObject = {};
  for (const channel of channels) textures[channel.name] = channel.texture;
  if (model.tint?.method === "grass") textures.colormap_grass = "textures/colormap/grass";
  const geometry: JsonObject = {};
  for (const channel of channels) geometry[channel.name] = `geometry.${key}.${channel.name}`;
  const renderControllers: unknown[] = channels.map(channel => `controller.render.${key}.${channel.name}`);
  if (isTintMaterial(model)) {
    Object.assign(textures, COLORMAP_TEXTURES);
    if (format === "dense") {
      geometry.colormap_x = `geometry.${key}.colormap_x`;
      geometry.colormap_z = `geometry.${key}.colormap_z`;
      geometry.colormap_compact_x = `geometry.${key}.colormap_compact_x`;
      geometry.colormap_compact_z = `geometry.${key}.colormap_compact_z`;
      renderControllers.push({ [`controller.render.${key}.tint_multiply`]: "v.tint_kind >= 1" });
    } else {
      if (model.tint?.method === "grass") geometry.tint = `geometry.${key}.tint`;
      for (let slot = 0; slot < SPARSE_SLOT_COUNT; slot++) {
        renderControllers.push({
          [`controller.render.${key}.tint_multiply_${slot}`]: `v.tint_kind >= 1 && v.c${slot} > 0`
        });
      }
    }
  }
  return {
    format_version: "1.20.30",
    "minecraft:client_entity": {
      description: {
        identifier: id,
        materials,
        textures,
        geometry,
        render_controllers: renderControllers,
        animations,
        scripts: {
          initialize,
          animate,
          pre_animation: preAnimation(model, format)
        }
      }
    }
  };
}

function rootBoneChain(): JsonObject[] {
  return [
    { name: "root", pivot: [0, 0, 0] },
    { name: "yaw", parent: "root", pivot: [0, 0, 0] },
    { name: "roll", parent: "yaw", pivot: [0, 0, 0] },
    { name: "pitch", parent: "roll", pivot: [0, 0, 0] },
    { name: "model_offset", parent: "pitch", pivot: [0, 0, 0] }
  ];
}

function geometryDescription(identifier: string, textureSize: readonly [number, number]): JsonObject {
  return {
    identifier,
    texture_width: textureSize[0],
    texture_height: textureSize[1],
    visible_bounds_width: 128,
    visible_bounds_height: 128,
    visible_bounds_offset: [0, 0, 0]
  };
}

function channelGeometry(
  format: "dense" | "sparse",
  key: string,
  channel: ModelChannel
): JsonObject {
  const bones: JsonObject[] = [...rootBoneChain()];
  for (let slot = 0; slot < slotCountOf(format); slot++) {
    bones.push(...instantiateBones(channel, slot, "model_offset"));
  }
  return {
    description: geometryDescription(`geometry.${key}.${channel.name}`, channel.textureSize),
    bones
  };
}

/**
 * The multiply layer re-draws the model's bones with every face pointed at one
 * climate texel per slot; the render controller's uv_anim maps that ramp onto
 * the encoded climate span.
 */
function colormapClimateBones(channels: readonly ModelChannel[], slot: number, uv: number): JsonObject[] {
  const bones: JsonObject[] = [];
  channels.forEach((channel, index) => {
    const prefix = channels.length > 1 ? `c${index}_` : "";
    for (const bone of instantiateBones(channel, slot, "model_offset", prefix)) {
      const cubes = bone.cubes as JsonObject[] | undefined;
      if (cubes) {
        bone.cubes = cubes.map(cube => ({
          origin: cube.origin,
          size: cube.size,
          uv: Object.fromEntries(Object.keys(cube.uv as JsonObject).map(face => [
            face,
            { uv: [uv, uv], uv_size: [16, 16] }
          ]))
        }));
      }
      bones.push(bone);
    }
  });
  return bones;
}

function colormapGeometry(
  model: CompiledModel,
  key: string,
  axis: "x" | "z",
  width = DENSE_WIDTH
): JsonObject {
  const channels = tintChannels(model);
  const bones: JsonObject[] = [...rootBoneChain()];
  for (let slot = 0; slot < width * width * 5; slot++) {
    const coordinate = axis === "x"
      ? slot % width
      : Math.floor(slot / width) % width;
    bones.push(...colormapClimateBones(channels, slot, coordinate * 16));
  }
  return {
    description: geometryDescription(`geometry.${key}.colormap_${width === 6 ? "compact_" : ""}${axis}`, [width * 16, width * 16]),
    bones
  };
}

export function createFancyGeometry(model: CompiledModel, format: "dense" | "sparse"): JsonObject {
  const key = modelKeyName(model, format);
  const geometries: JsonObject[] = modelChannels(model).map(channel => (
    channelGeometry(format, key, channel)
  ));
  if (isTintMaterial(model) && format === "dense") {
    geometries.push(
      colormapGeometry(model, key, "x"), colormapGeometry(model, key, "z"),
      colormapGeometry(model, key, "x", 6), colormapGeometry(model, key, "z", 6)
    );
  } else if (model.tint?.method === "grass") {
    geometries.push(channelGeometry(format, key, tintChannels(model)[0]!));
  }
  return { format_version: "1.16.0", "minecraft:geometry": geometries };
}

export function createFancyAnimation(model: CompiledModel, format: "dense" | "sparse"): JsonObject {
  const key = modelKeyName(model, format);
  const bones: JsonObject = {
    root: { rotation: ["-q.body_x_rotation", "-q.body_y_rotation", 0], scale: "v.pose_ready" },
    pitch: { rotation: ["v.pitch", 0, 0] },
    roll: { rotation: [0, 0, "-v.roll"] },
    yaw: { rotation: [0, "-v.yaw", 0] },
    model_offset: {
      position: [
        "(math.mod(v.origin_xz, 2048) - 1024) * 16",
        "(math.mod(v.origin_y, 2048) - 1024) * 16",
        "-(math.floor(v.origin_xz / 2048) - 1024) * 16"
      ]
    }
  };
  for (let slot = 0; slot < slotCountOf(format); slot++) {
    bones[`slot_${slot}`] = {
      position: slotPosition(format, slot),
      rotation: ["v.model_rx", "v.model_ry", "v.model_rz"],
      scale: `v.c${slot} > 0`
    };
  }
  const animations: JsonObject = {
    [`animation.${key}.transform`]: { bones, loop: true }
  };
  if (isChestModel(model)) {
    const lidBones: JsonObject = {};
    for (let slot = 0; slot < slotCountOf(format); slot++) {
      lidBones[`lid_${slot}`] = {
        rotation: [`-90 * (1 - (1 - v.lid_${slot}) * (1 - v.lid_${slot}) * (1 - v.lid_${slot}))`, 0, 0]
      };
    }
    animations[`animation.${key}.lid_pose`] = { bones: lidBones, loop: true };
  }
  return { format_version: "1.8.0", animations };
}

function slotVisibility(
  format: "dense" | "sparse",
  channel: ModelChannel,
  model?: CompiledModel
): JsonObject[] {
  // Occupancy is already applied to the slot parent by the transform animation.
  if (model?.model.type !== "wall" && channel.bones.some(bone => bone.name === "slot_{s}")) return [{ "*": true }];
  const visibility: JsonObject[] = [{ "*": false }];
  for (let slot = 0; slot < slotCountOf(format); slot++) {
    for (const name of channelBoneNames(channel, slot)) {
      const condition = model?.model.type === "wall"
        ? wallBoneVisibility(name, slot, format)
        : `(v.c${slot} > 0)`;
      visibility.push({ [name]: condition });
    }
  }
  return visibility;
}

function wallBoneVisibility(name: string, slot: number, format: "dense" | "sparse"): string {
  const value = format === "dense" ? `v.c${slot}` : `v.c${slot}`;
  const match = /^(?:m\d+_)?(post|north_short|north_tall|east_short|east_tall|south_short|south_tall|west_short|west_tall)_/.exec(name);
  const moss = /^(?:m\d+_)?(base_top|base_bottom|north_none|north_short|north_tall|east_none|east_short|east_tall|south_none|south_short|south_tall|west_none|west_short|west_tall)_(top|bottom)?_/.exec(name);
  if (moss) {
    const upper = `math.floor(${value} / 256)`;
    if (moss[1] === "base_top" || moss[1] === "base_bottom") return moss[1] === "base_top" ? `(${upper} == 0)` : `(${upper} > 0)`;
    const [direction, height] = moss[1]!.split("_");
    const shifts: Record<string, number> = { north: 0, east: 2, south: 4, west: 6 };
    const expected = height === "none" ? 0 : height === "short" ? 1 : 2;
    const position = `math.mod(math.floor(${value} / ${2 ** shifts[direction!]!}), 4)`;
    return `(${position} == ${expected} && ${moss[2] === "bottom" ? `${upper} > 0` : `${upper} == 0`})`;
  }
  if (!match) return `(v.c${slot} > 0)`;
  if (match[1] === "post") return `math.floor(${value} / 256) > 0`;
  const [direction, height] = match[1].split("_");
  const shifts: Record<string, number> = { north: 0, east: 2, south: 4, west: 6 };
  return `math.mod(math.floor(${value} / ${2 ** shifts[direction!]!}), 4) == ${height === "short" ? 1 : 2}`;
}

function denseColormapController(
  model: CompiledModel,
  channels: readonly ModelChannel[]
): JsonObject {
  const visibility: JsonObject[] = [{ "*": false }];
  for (let slot = 0; slot < DENSE_SLOT_COUNT; slot++) {
    channels.forEach((channel, index) => {
      const prefix = channels.length > 1 ? `c${index}_` : "";
      for (const name of channelBoneNames(channel, slot, prefix)) {
        visibility.push({ [name]: `(v.c${slot} > 0)` });
      }
    });
  }
  return {
    arrays: {
      geometries: {
        "Array.colormap": ["Geometry.colormap_x", "Geometry.colormap_z", "Geometry.colormap_compact_x", "Geometry.colormap_compact_z"]
      },
      textures: { "Array.colormaps": COLORMAP_TEXTURE_ARRAY }
    },
    geometry: "Array.colormap[(v.layout_width == 6 ? 2 : 0) + v.tint_axis_z]",
    materials: [{ "*": "Material.tint_multiply" }],
    textures: [model.tint?.method === "grass" ? "Texture.colormap_grass" : "Array.colormaps[math.max(0, (v.tint_kind) - 1)]"],
    uv_anim: {
      offset: [
        "v.tint_uniform ? ((v.tint_pixel_u + 0.5) / 256) : ((0.5 + (v.tint_0) * 255 / 31) / 256)",
        "v.tint_uniform ? ((v.tint_pixel_v + 0.5) / 256) : ((0.5 + (v.tint_1) * 255 / 31) / 256)"
      ],
      scale: [
        "v.tint_uniform ? 0 : (((v.tint_2) - (v.tint_0)) * 255 / 7936)",
        "v.tint_uniform ? 0 : (((v.tint_3) - (v.tint_1)) * 255 / 7936)"
      ]
    },
    part_visibility: visibility
  };
}

function sparseColormapController(
  model: CompiledModel,
  channel: ModelChannel,
  slot: number,
  tintedModels: readonly CompiledModel[]
): JsonObject {
  const coordinate = `(v.tint_axis_z ? math.mod(math.floor(v.s${slot} / 262144), 64) : math.mod(math.floor(v.s${slot} / 64), 64))`;
  const span = `(v.layout_width > 1 ? v.layout_width : ${SPARSE_SIZE})`;
  return {
    arrays: {
      textures: { "Array.colormaps": COLORMAP_TEXTURE_ARRAY }
    },
    geometry: `Geometry.${channel.name}`,
    materials: [{ "*": "Material.tint_multiply" }],
    textures: [model.tint?.method === "grass" ? "Texture.colormap_grass" : "Array.colormaps[math.max(0, (v.tint_kind) - 1)]"],
    uv_anim: {
      offset: [
        `v.tint_uniform ? ((v.tint_pixel_u + 0.5) / 256) : ((0.5 + (v.tint_0) * 255 / 31) / 256 + (((v.tint_2) - (v.tint_0)) * 255 / 7936) * ${coordinate} / ${span})`,
        `v.tint_uniform ? ((v.tint_pixel_v + 0.5) / 256) : ((0.5 + (v.tint_1) * 255 / 31) / 256 + (((v.tint_3) - (v.tint_1)) * 255 / 7936) * ${coordinate} / ${span})`
      ],
      scale: [
        `v.tint_uniform ? 0 : ((((v.tint_2) - (v.tint_0)) * 255 / 7936) / ${span})`,
        `v.tint_uniform ? 0 : ((((v.tint_3) - (v.tint_1)) * 255 / 7936) / ${span})`
      ]
    },
    part_visibility: [
      { "*": false },
      ...[...new Set(tintedModels.flatMap(model => tintChannels(model).flatMap(channel => channelBoneNames(channel, slot))))]
        .map(name => ({ [name]: `(v.c${slot} > 0)` }))
    ]
  };
}

export function createFancyRenderController(
  model: CompiledModel,
  format: "dense" | "sparse",
  tintedModels: readonly CompiledModel[]
): JsonObject {
  const key = modelKeyName(model, format);
  const channels = modelChannels(model);
  const controllers: JsonObject = {};
  channels.forEach((channel) => {
    controllers[`controller.render.${key}.${channel.name}`] = {
      geometry: `Geometry.${channel.name}`,
      ...lightColorMultiplier(model),
      materials: controllerMaterials(
        model,
        "default",
        Array.from({ length: slotCountOf(format) }, (_, slot) => channelBoneNames(channel, slot)).flat()
      ),
      textures: [`Texture.${channel.name}`],
      ...(flipbookAnimation(model) ? { uv_anim: flipbookAnimation(model) } : {}),
      part_visibility: slotVisibility(format, channel, model)
    };
  });
  if (isTintMaterial(model)) {
    const tinted = tintChannels(model);
    if (format === "dense") {
      controllers[`controller.render.${key}.tint_multiply`] = denseColormapController(model, tinted);
    } else {
      for (let slot = 0; slot < SPARSE_SLOT_COUNT; slot++) {
        controllers[`controller.render.${key}.tint_multiply_${slot}`] = sparseColormapController(
          model,
          tinted[0]!,
          slot,
          tintedModels
        );
      }
    }
  }
  return { format_version: "1.10.0", render_controllers: controllers };
}

interface PoolPlaces {
  readonly xSpan: number;
  readonly ySpan: number;
  readonly zSpan: number;
  readonly familyPlace: number;
  readonly occupiedPlace: number;
}

function poolPlaces(pool: CompiledPool): PoolPlaces {
  const xSpan = 2 ** pool.xBits;
  const ySpan = 2 ** pool.yBits;
  const zSpan = 2 ** pool.zBits;
  const familyPlace = xSpan * ySpan * zSpan;
  const statePlace = familyPlace * 2 ** pool.familyBits;
  return {
    familyPlace,
    occupiedPlace: statePlace * 2 ** pool.stateBits,
    xSpan,
    ySpan,
    zSpan
  };
}

function poolKeyName(pool: CompiledPool): string {
  return `sable_pool_${pool.name}`;
}

function poolFoliageMembers(pool: CompiledPool): number[] {
  return pool.members.flatMap((member, family) => hasFoliageTint(member) ? [family] : []);
}

function poolFixedMembers(pool: CompiledPool): number[] {
  return pool.members.flatMap((member, family) => hasFixedTint(member) ? [family] : []);
}

function poolTintMembers(pool: CompiledPool): number[] {
  return pool.members.flatMap((member, family) => isTintMaterial(member) ? [family] : []);
}

function poolMaterialKind(member: CompiledModel): string {
  if (member.material === "blend" || member.material === "translucent"
    || member.material === "opaque_emissive" || member.material === "redstone_torch_emissive"
    || member.flipbook) {
    return baseMaterial(member);
  }
  const kind = member.material === "opaque" ? "opaque"
    : member.model.type === "chest" ? "cutout" : "color";
  return kind;
}

function poolSlotCondition(slot: number, family: number): string {
  return `(v.o${slot} > 0) && (v.f${slot} == ${family})`;
}

export function createPoolClientEntity(pool: CompiledPool): JsonObject {
  const key = poolKeyName(pool);
  const places = poolPlaces(pool);
  const foliage = poolFoliageMembers(pool);
  const fixed = poolFixedMembers(pool);
  const chestMembers = pool.members.flatMap((member, family) => isChestModel(member) ? [family] : []);
  const materials: JsonObject = {};
  const textures: JsonObject = {};
  const geometry: JsonObject = {};
  const renderControllers: unknown[] = [];
  pool.members.forEach((member, family) => {
    materials[poolMaterialKind(member)] = baseMaterial(member);
    if (member.material === "redstone_torch_emissive") {
      materials.redstone_torch = "redstone_torch_block_emissive";
    }
    for (const channel of modelChannels(member)) {
      textures[`m${family}_${channel.name}`] = channel.texture;
      geometry[`m${family}_${channel.name}`] = `geometry.${key}.m${family}_${channel.name}`;
      renderControllers.push(`controller.render.${key}.m${family}_${channel.name}`);
    }
  });
  if (poolTintMembers(pool).length > 0) {
    materials.tint_multiply = "tint_multiply";
    Object.assign(textures, COLORMAP_TEXTURES);
    geometry.tint = `geometry.${key}.tint`;
  }
  if (foliage.length > 0) {
    for (let slot = 0; slot < SPARSE_SLOT_COUNT; slot++) {
      renderControllers.push({
        [`controller.render.${key}.tint_multiply_${slot}`]: `v.tint_kind >= 1 && v.o${slot} > 0`
      });
    }
  }
  for (const family of fixed) {
    renderControllers.push(`controller.render.${key}.tint_multiply_m${family}`);
  }
  const initialize = initializeMolang();
  const animations: JsonObject = {
    input: "animation.sable.fancy.input",
    transform: `animation.${key}.transform`
  };
  const animate: unknown[] = ["transform"];
  if (chestMembers.length > 0) {
    animations.lid_pose = `animation.${key}.lid_pose`;
    animate.push("lid_pose");
    initialize.push("v.lids_initialized = 0;");
  }
  const preAnimationLines = [...poseMolang()];
  if (foliage.length > 0) preAnimationLines.push(
    ...tintDecodeMolang(),
    "v.layout_width = 1 + math.mod(math.floor(v.origin_y / 4096), 32);",
    "v.layout_depth = 1 + math.floor(v.origin_y / 131072);"
  );
  preAnimationLines.push(...wordReadMolang());
  for (let slot = 0; slot < SPARSE_SLOT_COUNT; slot++) {
    preAnimationLines.push(`v.o${slot} = math.floor(v.s${slot} / ${places.occupiedPlace});`);
    preAnimationLines.push(
      `v.f${slot} = math.mod(math.floor(v.s${slot} / ${places.familyPlace}), ${2 ** pool.familyBits});`
    );
    if (pool.stateBits > 0) {
      preAnimationLines.push(
        `v.st${slot} = math.mod(math.floor(v.s${slot} / ${places.familyPlace * 2 ** pool.familyBits}), ${2 ** pool.stateBits});`
      );
    }
  }
  if (chestMembers.length > 0) {
    preAnimationLines.push(...lidEasingMolang(SPARSE_SLOT_COUNT, slot => `v.st${slot} >= 1`));
  }
  return {
    format_version: "1.20.30",
    "minecraft:client_entity": {
      description: {
        identifier: pool.entityTypeId,
        materials,
        textures,
        geometry,
        render_controllers: renderControllers,
        animations,
        scripts: {
          initialize,
          animate,
          pre_animation: preAnimationLines
        }
      }
    }
  };
}

export function createPoolGeometry(pool: CompiledPool): JsonObject {
  const key = poolKeyName(pool);
  const geometries: JsonObject[] = [];
  pool.members.forEach((member, family) => {
    for (const channel of modelChannels(member)) {
      const bones: JsonObject[] = [...rootBoneChain()];
      for (let slot = 0; slot < SPARSE_SLOT_COUNT; slot++) {
        bones.push(...instantiateBones(channel, slot, "model_offset"));
      }
      geometries.push({
        description: geometryDescription(`geometry.${key}.m${family}_${channel.name}`, channel.textureSize),
        bones
      });
    }
  });
  const tintMembers = poolTintMembers(pool);
  if (tintMembers.length > 0) {
    const bones: JsonObject[] = [...rootBoneChain()];
    for (let slot = 0; slot < SPARSE_SLOT_COUNT; slot++) {
      bones.push({ name: `slot_${slot}`, parent: "model_offset", pivot: [0, -16, 0] });
      for (const family of tintMembers) {
        const channels = modelChannels(pool.members[family]!);
        channels.forEach((channel, index) => {
          const prefix = `t${family}_${channels.length > 1 ? `c${index}_` : ""}`;
          for (const bone of colormapTintBones(channel, slot, prefix)) bones.push(bone);
        });
      }
    }
    geometries.push({
      description: geometryDescription(`geometry.${key}.tint`, [16, 16]),
      bones
    });
  }
  return { format_version: "1.16.0", "minecraft:geometry": geometries };
}

function colormapTintBones(channel: ModelChannel, slot: number, prefix: string): JsonObject[] {
  return instantiateBones(channel, slot, `slot_${slot}`, prefix).map(bone => {
    const cubes = bone.cubes as JsonObject[] | undefined;
    if (cubes) {
      bone.cubes = cubes.map(cube => ({
        origin: cube.origin,
        size: cube.size,
        uv: Object.fromEntries(Object.keys(cube.uv as JsonObject).map(face => [
          face,
          { uv: [0, 0], uv_size: [16, 16] }
        ]))
      }));
    }
    return bone;
  });
}

export function createPoolAnimation(pool: CompiledPool): JsonObject {
  const key = poolKeyName(pool);
  const places = poolPlaces(pool);
  const bones: JsonObject = {
    root: { rotation: ["-q.body_x_rotation", "-q.body_y_rotation", 0], scale: "v.pose_ready" },
    pitch: { rotation: ["v.pitch", 0, 0] },
    roll: { rotation: [0, 0, "-v.roll"] },
    yaw: { rotation: [0, "-v.yaw", 0] },
    model_offset: {
      position: [
        "(math.mod(v.origin_xz, 2048) - 1024) * 16",
        "(math.mod(v.origin_y, 2048) - 1024) * 16",
        "-(math.floor(v.origin_xz / 2048) - 1024) * 16"
      ]
    }
  };
  const hasLids = pool.members.some(isChestModel);
  const orientations = pool.members.map(modelOrientation);
  for (let slot = 0; slot < SPARSE_SLOT_COUNT; slot++) {
    const rotation = poolSlotOrientation(orientations, slot);
    bones[`slot_${slot}`] = {
      position: [
        `math.mod(v.s${slot}, ${places.xSpan}) * 16`,
        `math.mod(math.floor(v.s${slot} / ${places.xSpan}), ${places.ySpan}) * 16`,
        `-math.mod(math.floor(v.s${slot} / ${places.xSpan * places.ySpan}), ${places.zSpan}) * 16`
      ],
      ...(rotation ? { rotation } : {}),
      scale: `v.o${slot}`
    };
  }
  const animations: JsonObject = { [`animation.${key}.transform`]: { bones, loop: true } };
  if (hasLids) {
    const lidBones: JsonObject = {};
    for (let slot = 0; slot < SPARSE_SLOT_COUNT; slot++) {
      lidBones[`lid_${slot}`] = {
        rotation: [`-90 * (1 - (1 - v.lid_${slot}) * (1 - v.lid_${slot}) * (1 - v.lid_${slot}))`, 0, 0]
      };
    }
    animations[`animation.${key}.lid_pose`] = { bones: lidBones, loop: true };
  }
  return { format_version: "1.8.0", animations };
}

function poolSlotOrientation(
  orientations: readonly (readonly [number, number, number] | undefined)[],
  slot: number
): (string | number)[] | undefined {
  const components = [0, 1, 2].map(axis => {
    const familiesByAngle = new Map<number, number[]>();
    orientations.forEach((rotation, family) => {
      const angle = rotation?.[axis] ?? 0;
      if (angle === 0) return;
      const families = familiesByAngle.get(angle) ?? [];
      families.push(family);
      familiesByAngle.set(angle, families);
    });
    if (familiesByAngle.size === 0) return 0;
    return [...familiesByAngle].reduceRight((fallback, [angle, families]) => {
      const condition = families.map(family => `v.f${slot} == ${family}`).join(" || ");
      return `(${condition}) ? ${angle} : (${fallback})`;
    }, "0");
  });
  return components.every(component => component === 0) ? undefined : components;
}

export function createPoolRenderController(pool: CompiledPool): JsonObject {
  const key = poolKeyName(pool);
  const places = poolPlaces(pool);
  const controllers: JsonObject = {};
  pool.members.forEach((member, family) => {
    for (const channel of modelChannels(member)) {
      const visibility: JsonObject[] = [{ "*": false }];
      for (let slot = 0; slot < SPARSE_SLOT_COUNT; slot++) {
        for (const name of channelBoneNames(channel, slot)) {
          visibility.push({ [name]: poolSlotCondition(slot, family) });
        }
      }
      controllers[`controller.render.${key}.m${family}_${channel.name}`] = {
        geometry: `Geometry.m${family}_${channel.name}`,
        ...lightColorMultiplier(member),
        materials: controllerMaterials(
          member,
          poolMaterialKind(member),
          Array.from(
            { length: SPARSE_SLOT_COUNT },
            (_, slot) => channelBoneNames(channel, slot, `m${family}_`)
          ).flat()
        ),
        textures: [`Texture.m${family}_${channel.name}`],
        ...(flipbookAnimation(member) ? { uv_anim: flipbookAnimation(member) } : {}),
        part_visibility: visibility
      };
    }
  });
  const foliage = poolFoliageMembers(pool);
  for (let slot = 0; slot < SPARSE_SLOT_COUNT && foliage.length > 0; slot++) {
    const width = `(v.layout_width > 1 ? v.layout_width : ${places.xSpan})`;
    const depth = `(v.layout_depth > 1 ? v.layout_depth : ${places.zSpan})`;
    const gradientX = `(math.mod(v.s${slot}, ${places.xSpan}) / ${width})`;
    const gradientZ = `(math.mod(math.floor(v.s${slot} / ${places.xSpan * places.ySpan}), ${places.zSpan}) / ${depth})`;
    const visibility: JsonObject[] = [{ "*": false }];
    for (const family of foliage) {
      const channels = modelChannels(pool.members[family]!);
      channels.forEach((channel, index) => {
        const prefix = `t${family}_${channels.length > 1 ? `c${index}_` : ""}`;
        for (const name of channelBoneNames(channel, slot, prefix)) {
          visibility.push({ [name]: poolSlotCondition(slot, family) });
        }
      });
    }
    controllers[`controller.render.${key}.tint_multiply_${slot}`] = {
      arrays: { textures: { "Array.colormaps": COLORMAP_TEXTURE_ARRAY } },
      geometry: "Geometry.tint",
      materials: [{ "*": "Material.tint_multiply" }],
      textures: ["Array.colormaps[math.max(0, (v.tint_kind) - 1)]"],
      uv_anim: {
        offset: [
          `v.tint_uniform ? ((v.tint_pixel_u + 0.5) / 256) : ((0.5 + (v.tint_0) * 255 / 31) / 256 + (((v.tint_2) - (v.tint_0)) * 255 / 7936) * (v.tint_axis_z ? ${gradientZ} : ${gradientX}))`,
          `v.tint_uniform ? ((v.tint_pixel_v + 0.5) / 256) : ((0.5 + (v.tint_1) * 255 / 31) / 256 + (((v.tint_3) - (v.tint_1)) * 255 / 7936) * (v.tint_axis_z ? ${gradientZ} : ${gradientX}))`
        ],
        scale: [
          `v.tint_uniform ? 0 : ((((v.tint_2) - (v.tint_0)) * 255 / 7936) / (v.tint_axis_z ? ${depth} : ${width}))`,
          `v.tint_uniform ? 0 : ((((v.tint_3) - (v.tint_1)) * 255 / 7936) / (v.tint_axis_z ? ${depth} : ${width}))`
        ]
      },
      part_visibility: visibility
    };
  }
  for (const family of poolFixedMembers(pool)) {
    // A fixed member always multiplies the same palette cell, so one constant
    // sample covers every slot of that member.
    const palette = (pool.members[family]!.tint as { palette: number }).palette;
    const visibility: JsonObject[] = [{ "*": false }];
    const channels = modelChannels(pool.members[family]!);
    for (let slot = 0; slot < SPARSE_SLOT_COUNT; slot++) {
      channels.forEach((channel, index) => {
        const prefix = `t${family}_${channels.length > 1 ? `c${index}_` : ""}`;
        for (const name of channelBoneNames(channel, slot, prefix)) {
          visibility.push({ [name]: poolSlotCondition(slot, family) });
        }
      });
    }
    controllers[`controller.render.${key}.tint_multiply_m${family}`] = {
      geometry: "Geometry.tint",
      materials: [{ "*": "Material.tint_multiply" }],
      textures: ["Texture.colormap_foliage_fixed"],
      uv_anim: {
        offset: [(0.5 + palette * 255 / 31) / 256, 0.5 / 256],
        scale: [0, 0]
      },
      part_visibility: visibility
    };
  }
  return { format_version: "1.10.0", render_controllers: controllers };
}

export function createVanillaClientEntity(): JsonObject {
  return {
    format_version: "1.20.30",
    "minecraft:client_entity": {
      description: {
        identifier: "sable:block",
        geometry: { default: "geometry.sable.block" },
        materials: { default: "opaque_block" },
        textures: { default: "textures/blocks/stone" },
        render_controllers: ["controller.render.sable.block"],
        animations: {
          rotation: "animation.sable.block.rotation",
          scale: "animation.sable.block.scale",
          item_scale: "animation.sable.block.item_scale"
        },
        scripts: {
          initialize: ["v.pose_initialized = 0;"],
          animate: ["rotation", "scale", "item_scale"],
          pre_animation: [
            "v.pose_ready = q.property('sable:scale') > 0;",
            "v.pitch = v.pose_ready ? (v.pose_initialized ? math.lerprotate(v.pitch, q.property('sable:pitch'), q.delta_time/0.05) : q.property('sable:pitch')) : 0;",
            "v.yaw = v.pose_ready ? (v.pose_initialized ? math.lerprotate(v.yaw, q.property('sable:yaw'), q.delta_time/0.05) : q.property('sable:yaw')) : 0;",
            "v.roll = v.pose_ready ? (v.pose_initialized ? math.lerprotate(v.roll, q.property('sable:roll'), q.delta_time/0.05) : q.property('sable:roll')) : 0;",
            "v.local_pitch = q.property('sable:local_pitch');",
            "v.local_yaw = q.property('sable:local_yaw');",
            "v.local_roll = q.property('sable:local_roll');",
            "v.left_local_pitch = q.property('sable:left_local_pitch');",
            "v.left_local_yaw = q.property('sable:left_local_yaw');",
            "v.left_local_roll = q.property('sable:left_local_roll');",
            "v.local_x = q.property('sable:local_x');",
            "v.local_y = q.property('sable:local_y');",
            "v.local_z = q.property('sable:local_z');",
            "v.left_local_x = q.property('sable:left_local_x');",
            "v.left_local_y = q.property('sable:left_local_y');",
            "v.left_local_z = q.property('sable:left_local_z');",
            "v.pose_initialized = v.pose_ready;"
          ]
        }
      }
    }
  };
}

export function createVanillaGeometry(): JsonObject {
  return {
    format_version: "1.16.0",
    "minecraft:geometry": [{
      description: {
        identifier: "geometry.sable.block",
        texture_width: 16,
        texture_height: 16,
        visible_bounds_width: 128,
        visible_bounds_height: 128,
        visible_bounds_offset: [0, 0, 0]
      },
      bones: [
        { name: "root", pivot: [0, 0, 0] },
        { name: "yaw", parent: "root", pivot: [0, 0, 0] },
        { name: "roll", parent: "yaw", pivot: [0, 0, 0] },
        { name: "pitch", parent: "roll", pivot: [0, 0, 0] },
        { name: "local_offset", parent: "pitch", pivot: [0, 0, 0] },
        { name: "local_yaw", parent: "local_offset", pivot: [0, 0, 0] },
        { name: "local_roll", parent: "local_yaw", pivot: [0, 0, 0] },
        { name: "local_pitch", parent: "local_roll", pivot: [0, 0, 0] },
        { name: "model", parent: "local_pitch", pivot: [0, -8, 0] },
        { name: "rightitem", parent: "model", pivot: [0, -8, 0] },
        { name: "left_local_offset", parent: "pitch", pivot: [0, 0, 0] },
        { name: "left_local_yaw", parent: "left_local_offset", pivot: [0, 0, 0] },
        { name: "left_local_roll", parent: "left_local_yaw", pivot: [0, 0, 0] },
        { name: "left_local_pitch", parent: "left_local_roll", pivot: [0, 0, 0] },
        { name: "leftarm", parent: "left_local_pitch", pivot: [0, -8, 0] },
        { name: "leftitem", parent: "leftarm", pivot: [0, -8, 0] }
      ]
    }]
  };
}

export function createVanillaAnimation(): JsonObject {
  return {
    format_version: "1.8.0",
    animations: {
      "animation.sable.block.rotation": {
        loop: true,
        bones: {
          root: { rotation: ["-q.body_x_rotation", "-q.body_y_rotation", 0] },
          pitch: { rotation: ["v.pitch", 0, 0] },
          roll: { rotation: [0, 0, "-v.roll"] },
          yaw: { rotation: [0, "-v.yaw", 0] },
          local_offset: { position: ["v.local_x * 16", "v.local_y * 16", "-v.local_z * 16"] },
          local_pitch: { rotation: ["v.local_pitch", 0, 0] },
          local_roll: { rotation: [0, 0, "-v.local_roll"] },
          local_yaw: { rotation: [0, "-v.local_yaw", 0] },
          left_local_offset: { position: ["v.left_local_x * 16", "v.left_local_y * 16", "-v.left_local_z * 16"] },
          left_local_pitch: { rotation: ["v.left_local_pitch", 0, 0] },
          left_local_roll: { rotation: [0, 0, "-v.left_local_roll"] },
          left_local_yaw: { rotation: [0, "-v.left_local_yaw", 0] }
        }
      },
      "animation.sable.block.scale": { loop: true, bones: { root: { scale: "q.property('sable:scale')" } } },
      "animation.sable.block.item_scale": {
        loop: true,
        bones: {
          model: { position: [-10.865, 10.82, 10.865], scale: 2.6663, rotation: [-20, -45, 0] },
          leftarm: { position: [-10.865, 10.82, 10.865], scale: 2.6663, rotation: [-20, -45, 0] },
          leftitem: { position: ["q.property('sable:left_item_offset')", 0, 0] }
        }
      }
    }
  };
}

export function createVanillaRenderController(): JsonObject {
  return {
    format_version: "1.10.0",
    render_controllers: {
      "controller.render.sable.block": {
        geometry: "Geometry.default",
        materials: [{ "*": "Material.default" }],
        textures: ["Texture.default"]
      }
    }
  };
}
