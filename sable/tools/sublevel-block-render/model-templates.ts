import { readFileSync } from "node:fs";
import type { CompiledModel, CompiledPool } from "./registry.ts";
import { CARRIER_SEAT_COUNT } from "../../src/sublevel/render/SubLevelRenderData.ts";

export const MODEL_PROPERTY_NAMES = [
  "pitch", "yaw", "roll", "origin_xz", "origin_y", "tint",
  ...Array.from({ length: 26 }, (_, index) => `s${index}`)
] as const;

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
  readFileSync(new URL("./model-geometry.json", import.meta.url), "utf8")
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
      family_types: [family],
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
      : name === "left_item_offset" ? [-3, 3] : name.startsWith("local_") || name.startsWith("left_local_")
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
  const properties: JsonObject = {};
  for (const name of MODEL_PROPERTY_NAMES) {
    const isInteger = name === "origin_xz" || name === "origin_y" || name === "tint" || name.startsWith("s");
    const range: readonly [number, number] = name === "origin_xz"
      ? [0, 4194303] : name === "origin_y" ? [0, 4194303] : name === "tint"
        ? [0, 16777215] : name.startsWith("s") ? [0, 16777215] : [-400, 400];
    properties[`sable:${name}`] = property(isInteger ? "int" : "float", range);
  }
  return {
    format_version: "1.20.30",
    "minecraft:entity": {
      description: {
        identifier,
        is_spawnable: false,
        is_summonable: true,
        runtime_identifier: "minecraft:arrow",
        properties
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

function modelChannels(model: CompiledModel): ModelChannel[] {
  const description = model.model as JsonObject;
  const type = String(description.type);
  if (type === "full_block") {
    const textures = description.textures as Record<FullFace, string>;
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
        cubes: [{ origin: [-8, -24, -8], size: [16, 16, 16], uv: faceUvMap(faces) }]
      }]
    }));
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
    return [{
      name: "default",
      texture,
      textureSize: channel.textureSize,
      bones: channel.bones,
      wrapperRotation: [0, 180 + turn * 90, 0]
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
  const modelDirection = direction === 0 ? 0 : 4 - direction;
  const yaw = (modelDirection - 2) * 90;
  return yaw === 0 ? undefined : [0, yaw, 0];
}

function instantiateBones(
  channel: Pick<ModelChannel, "bones" | "wrapperRotation">,
  slot: number,
  parent: string,
  namePrefix = ""
): JsonObject[] {
  return channel.bones.map((bone, index) => {
    const record: JsonObject = { name: namePrefix + bone.name.replaceAll("{s}", String(slot)) };
    record.parent = bone.parent
      ? namePrefix + bone.parent.replaceAll("{s}", String(slot))
      : parent;
    if (bone.pivot) record.pivot = bone.pivot;
    const rotation = index === 0 ? channel.wrapperRotation ?? bone.rotation : bone.rotation;
    if (rotation) record.rotation = rotation;
    if (bone.cubes) record.cubes = bone.cubes;
    return record;
  });
}

function channelBoneNames(channel: Pick<ModelChannel, "bones">, slot: number, namePrefix = ""): string[] {
  return channel.bones.map(bone => namePrefix + bone.name.replaceAll("{s}", String(slot)));
}

function isTintMaterial(model: CompiledModel): boolean {
  return model.material === "alpha_test_tint" || model.material === "opaque_tint";
}

function hasFoliageTint(model: CompiledModel): boolean {
  return isTintMaterial(model) && model.tint?.method === "foliage";
}

function hasFixedTint(model: CompiledModel): boolean {
  return isTintMaterial(model) && model.tint?.method === "fixed";
}

function baseMaterial(model: CompiledModel): string {
  if (model.material === "opaque") return "opaque_block";
  return model.model.type === "chest" ? "alpha_block" : "alpha_block_color";
}

// Mirrors TreePhysics: leaf-style cutout blocks render without the shared
// 0.88 light multiplier, every other fragment controller keeps it.
function lightColorMultiplier(model: CompiledModel): JsonObject {
  return model.model.type === "full_block" && model.material !== "opaque"
    ? {}
    : { light_color_multiplier: 0.88 };
}

function isChestModel(model: CompiledModel): boolean {
  return model.model.type === "chest";
}

function stateBits(model: CompiledModel): number {
  return isChestModel(model) ? 1 : 0;
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

function poseMolang(): string[] {
  return [
    "v.pose_ready = math.mod(q.property('sable:origin_y'), 4096) >= 2048;",
    "v.pitch = v.pose_ready ? (v.pose_initialized ? math.lerprotate(v.pitch, q.property('sable:pitch'), q.delta_time/0.05) : q.property('sable:pitch')) : 0;",
    "v.yaw = v.pose_ready ? (v.pose_initialized ? math.lerprotate(v.yaw, q.property('sable:yaw'), q.delta_time/0.05) : q.property('sable:yaw')) : 0;",
    "v.roll = v.pose_ready ? (v.pose_initialized ? math.lerprotate(v.roll, q.property('sable:roll'), q.delta_time/0.05) : q.property('sable:roll')) : 0;",
    "v.pose_initialized = v.pose_ready;",
    "v.tint = q.property('sable:tint');"
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

function wordReadMolang(): string[] {
  return Array.from({ length: 26 }, (_, index) => `v.s${index} = q.property('sable:s${index}');`);
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
    "v.layout_width = 1 + math.mod(math.floor(q.property('sable:origin_y') / 4096), 32);",
    "v.layout_depth = 1 + math.floor(q.property('sable:origin_y') / 131072);",
    "v.layout_plane = v.layout_width * v.layout_depth;"
  ];
  if (isTintMaterial(model)) result.push(...tintDecodeMolang());
  result.push(...wordReadMolang());
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
  const animations: JsonObject = { transform: `animation.${key}.transform` };
  const animate: unknown[] = ["transform"];
  const initialize = ["v.pose_initialized = 0;", "v.pose_ready = 0;"];
  if (isChestModel(model)) {
    animations.lid_pose = `animation.${key}.lid_pose`;
    animate.push("lid_pose");
    initialize.push("v.lids_initialized = 0;");
  }
  const materials: JsonObject = { default: baseMaterial(model) };
  if (isTintMaterial(model)) materials.tint_multiply = "tint_multiply";
  const textures: JsonObject = {};
  for (const channel of channels) textures[channel.name] = channel.texture;
  const geometry: JsonObject = {};
  for (const channel of channels) geometry[channel.name] = `geometry.${key}.${channel.name}`;
  const renderControllers: unknown[] = channels.map(channel => `controller.render.${key}.${channel.name}`);
  if (isTintMaterial(model)) {
    Object.assign(textures, COLORMAP_TEXTURES);
    if (format === "dense") {
      geometry.colormap_x = `geometry.${key}.colormap_x`;
      geometry.colormap_z = `geometry.${key}.colormap_z`;
      renderControllers.push({ [`controller.render.${key}.tint_multiply`]: "v.tint_kind >= 1" });
    } else {
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
  axis: "x" | "z"
): JsonObject {
  const channels = modelChannels(model);
  const bones: JsonObject[] = [...rootBoneChain()];
  for (let slot = 0; slot < DENSE_SLOT_COUNT; slot++) {
    const coordinate = axis === "x"
      ? slot % DENSE_WIDTH
      : Math.floor(slot / DENSE_WIDTH) % DENSE_DEPTH;
    bones.push(...colormapClimateBones(channels, slot, coordinate * 16));
  }
  return {
    description: geometryDescription(`geometry.${key}.colormap_${axis}`, [DENSE_WIDTH * 16, DENSE_DEPTH * 16]),
    bones
  };
}

export function createFancyGeometry(model: CompiledModel, format: "dense" | "sparse"): JsonObject {
  const key = modelKeyName(model, format);
  const geometries: JsonObject[] = modelChannels(model).map(channel => (
    channelGeometry(format, key, channel)
  ));
  if (isTintMaterial(model) && format === "dense") {
    geometries.push(colormapGeometry(model, key, "x"), colormapGeometry(model, key, "z"));
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
        "(math.mod(q.property('sable:origin_xz'), 2048) - 1024) * 16",
        "(math.mod(q.property('sable:origin_y'), 2048) - 1024) * 16",
        "-(math.floor(q.property('sable:origin_xz') / 2048) - 1024) * 16"
      ]
    }
  };
  for (let slot = 0; slot < slotCountOf(format); slot++) {
    bones[`slot_${slot}`] = {
      position: slotPosition(format, slot),
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
  channel: ModelChannel
): JsonObject[] {
  const visibility: JsonObject[] = [{ "*": false }];
  for (let slot = 0; slot < slotCountOf(format); slot++) {
    for (const name of channelBoneNames(channel, slot)) {
      visibility.push({ [name]: `(v.c${slot} > 0)` });
    }
  }
  return visibility;
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
        "Array.colormap": ["Geometry.colormap_x", "Geometry.colormap_z"]
      },
      textures: { "Array.colormaps": COLORMAP_TEXTURE_ARRAY }
    },
    geometry: "Array.colormap[v.tint_axis_z]",
    materials: [{ "*": "Material.tint_multiply" }],
    textures: ["Array.colormaps[math.max(0, (v.tint_kind) - 1)]"],
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

function sparseColormapController(channel: ModelChannel, slot: number): JsonObject {
  const coordinate = `(v.tint_axis_z ? math.mod(math.floor(v.s${slot} / 262144), 64) : math.mod(math.floor(v.s${slot} / 64), 64))`;
  return {
    arrays: {
      textures: { "Array.colormaps": COLORMAP_TEXTURE_ARRAY }
    },
    geometry: `Geometry.${channel.name}`,
    materials: [{ "*": "Material.tint_multiply" }],
    textures: ["Array.colormaps[math.max(0, (v.tint_kind) - 1)]"],
    uv_anim: {
      offset: [
        `v.tint_uniform ? ((v.tint_pixel_u + 0.5) / 256) : ((0.5 + (v.tint_0) * 255 / 31) / 256 + (((v.tint_2) - (v.tint_0)) * 255 / 7936) * ${coordinate} / ${SPARSE_SIZE})`,
        `v.tint_uniform ? ((v.tint_pixel_v + 0.5) / 256) : ((0.5 + (v.tint_1) * 255 / 31) / 256 + (((v.tint_3) - (v.tint_1)) * 255 / 7936) * ${coordinate} / ${SPARSE_SIZE})`
      ],
      scale: [
        `v.tint_uniform ? 0 : ((((v.tint_2) - (v.tint_0)) * 255 / 7936) / ${SPARSE_SIZE})`,
        `v.tint_uniform ? 0 : ((((v.tint_3) - (v.tint_1)) * 255 / 7936) / ${SPARSE_SIZE})`
      ]
    },
    part_visibility: [
      { "*": false },
      ...channelBoneNames(channel, slot).map(name => ({ [name]: `(v.c${slot} > 0)` }))
    ]
  };
}

export function createFancyRenderController(model: CompiledModel, format: "dense" | "sparse"): JsonObject {
  const key = modelKeyName(model, format);
  const channels = modelChannels(model);
  const controllers: JsonObject = {};
  for (const channel of channels) {
    controllers[`controller.render.${key}.${channel.name}`] = {
      geometry: `Geometry.${channel.name}`,
      ...lightColorMultiplier(model),
      materials: [{ "*": "Material.default" }],
      textures: [`Texture.${channel.name}`],
      part_visibility: slotVisibility(format, channel)
    };
  }
  if (isTintMaterial(model)) {
    if (channels.length !== 1) {
      throw new Error(`Model ${model.key} uses a tint material with multiple texture channels.`);
    }
    if (format === "dense") {
      controllers[`controller.render.${key}.tint_multiply`] = denseColormapController(model, channels);
    } else {
      for (let slot = 0; slot < SPARSE_SLOT_COUNT; slot++) {
        controllers[`controller.render.${key}.tint_multiply_${slot}`] = sparseColormapController(
          channels[0]!,
          slot
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

function poolMaterialKind(member: CompiledModel): "opaque" | "cutout" | "color" {
  if (member.material === "opaque") return "opaque";
  return member.model.type === "chest" ? "cutout" : "color";
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
  const initialize = ["v.pose_initialized = 0;", "v.pose_ready = 0;"];
  const animations: JsonObject = { transform: `animation.${key}.transform` };
  const animate: unknown[] = ["transform"];
  if (chestMembers.length > 0) {
    animations.lid_pose = `animation.${key}.lid_pose`;
    animate.push("lid_pose");
    initialize.push("v.lids_initialized = 0;");
  }
  const preAnimationLines = [...poseMolang()];
  if (foliage.length > 0) preAnimationLines.push(...tintDecodeMolang());
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
        "(math.mod(q.property('sable:origin_xz'), 2048) - 1024) * 16",
        "(math.mod(q.property('sable:origin_y'), 2048) - 1024) * 16",
        "-(math.floor(q.property('sable:origin_xz') / 2048) - 1024) * 16"
      ]
    }
  };
  const hasLids = pool.members.some(isChestModel);
  for (let slot = 0; slot < SPARSE_SLOT_COUNT; slot++) {
    bones[`slot_${slot}`] = {
      position: [
        `math.mod(v.s${slot}, ${places.xSpan}) * 16`,
        `math.mod(math.floor(v.s${slot} / ${places.xSpan}), ${places.ySpan}) * 16`,
        `-math.mod(math.floor(v.s${slot} / ${places.xSpan * places.ySpan}), ${places.zSpan}) * 16`
      ],
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
        materials: [{ "*": `Material.${poolMaterialKind(member)}` }],
        textures: [`Texture.m${family}_${channel.name}`],
        part_visibility: visibility
      };
    }
  });
  const foliage = poolFoliageMembers(pool);
  for (let slot = 0; slot < SPARSE_SLOT_COUNT && foliage.length > 0; slot++) {
    const gradientX = `(math.mod(v.s${slot}, ${places.xSpan}) / ${places.xSpan})`;
    const gradientZ = `(math.mod(math.floor(v.s${slot} / ${places.xSpan * places.ySpan}), ${places.zSpan}) / ${places.zSpan})`;
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
          `v.tint_uniform ? 0 : ((((v.tint_2) - (v.tint_0)) * 255 / 7936) / (v.tint_axis_z ? ${places.zSpan} : ${places.xSpan}))`,
          `v.tint_uniform ? 0 : ((((v.tint_3) - (v.tint_1)) * 255 / 7936) / (v.tint_axis_z ? ${places.zSpan} : ${places.xSpan}))`
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
