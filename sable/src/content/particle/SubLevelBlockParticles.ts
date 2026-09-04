// Sub-level block particle rendering: destruct emitters, addon tint fitting,
// and the Oklab-based gamut mapping used to color particle quads. Particle
// selection is registry-driven: the resolved fancy model supplies the
// representative texture, and the build tool emits one destruct particle per
// distinct texture. Blocks without a fancy model spawn no particles, mirroring
// the source behaviour where only recognised visuals produced quads.
import {
  MolangVariableMap,
  type Dimension,
  type Vector3
} from "@minecraft/server";
import { sampleVanillaFoliageColor } from "../../data/vanilla/colormap/FoliageColorMap.js";
import type {
  SubLevelBlock,
  SubLevelBlockMapColor,
  SubLevelFoliageTint
} from "../../sublevel/SubLevel.js";
import type { FancySubLevelModel } from "../../sublevel/render/fancy/model/FancySubLevelModel.js";
import { resolveFancySubLevelBlock } from "../../sublevel/render/fancy/model/FancySubLevelModelRegistry.js";
import {
  DEFAULT_SUBLEVEL_FOLIAGE_TINT,
  FOLIAGE_COLORMAP_FIXED,
  FOLIAGE_COLORMAP_MANGROVE_SWAMP,
  FOLIAGE_COLORMAP_SWAMP
} from "../../sublevel/render/fancy/model/FancySubLevelTintCodec.js";
import {
  ADDON_BARK_PARTICLE_TEXTURE,
  ADDON_LEAF_PARTICLE_TEXTURE,
  ADDON_STRIPPED_PARTICLE_TEXTURE,
  blockDestructParticleEffectId,
  destructParticleTexture
} from "./SubLevelBlockParticleEffects.js";

const REPORTED_PARTICLE_SPAWN_FAILURES = new Set<string>();
export const BLOCK_HIT_PARTICLE_PROFILE: BlockParticleProfile = {
  particleCount: 27,
  radius: 0.45,
  velocityScalar: 1.1
};
export const BLOCK_BREAK_PARTICLE_PROFILE: BlockParticleProfile = {
  particleCount: 27,
  radius: 0.5,
  velocityScalar: 1
};
// Fitted in sRGB space against representative paired map colors and source
// textures. The affine fit models bark tint before the particle expression
// clamps channels to Bedrock's [0, 1] range.
const ADDON_BARK_MAP_COLOR_SCALE = { blue: 2.77653, green: 2.59065, red: 1.37374 };
const ADDON_BARK_MAP_COLOR_OFFSET = { blue: 0.09168, green: 0.1104, red: 0.45764 };
const ADDON_STRIPPED_MAP_COLOR_SCALE = { blue: 0.87778, green: 0.7098, red: 0.75551 };
const ADDON_STRIPPED_MAP_COLOR_OFFSET = { blue: 0.12766, green: 0.20247, red: 0.19373 };
// Mean representative bark color relative to the ordinary pale-oak particle
// texture, used only when a custom block exposes no map_color.
const DEFAULT_ADDON_BARK_TINT = { blue: 0.8046, green: 0.929, red: 0.968 };
const DEFAULT_ADDON_STRIPPED_TINT = { blue: 0.36337, green: 0.605, red: 0.72205 };
// Effective mean RGB of visible texels under the oak-leaf particle's random 4x4 UV sampling.
const ADDON_LEAF_PARTICLE_BASE_COLOR = {
  blue: 0.5522222646359,
  green: 0.550694099833315,
  red: 0.5522222646359
};
const PARTICLE_CHROMA_SOFT_THRESHOLD = 0.08;
const PARTICLE_CHROMA_MIDTONE_LIMIT = 0.15;
const PARTICLE_GAMUT_SEARCH_STEPS = 8;
// Frozen biome-fixed colors sampled once at spawn; the emitter has no second
// texture sampler, so field kinds that address dedicated colormaps resolve to
// these documented constants instead.
const SWAMP_FOLIAGE_COLOR = color(0x6a, 0x70, 0x39);
const MANGROVE_SWAMP_FOLIAGE_COLOR = color(0x8d, 0xb1, 0x27);
const CHERRY_GROVE_FOLIAGE_COLOR = color(0xb6, 0xdb, 0x61);
const PALE_GARDEN_FOLIAGE_COLOR = color(0x87, 0x8d, 0x76);

export interface BlockParticleProfile {
  readonly direction?: Vector3;
  readonly directionRandomness?: Vector3;
  readonly offsetRadius?: Vector3;
  readonly particleCount: number;
  readonly radius: number;
  readonly speedMax?: number;
  readonly speedMin?: number;
  readonly velocityScalar: number;
}

export interface SubLevelBlockParticleColor {
  alpha: number;
  blue: number;
  green: number;
  red: number;
}

export function spawnSubLevelBlockDestructParticle(
  dimension: Dimension,
  location: Vector3,
  block: SubLevelBlock,
  foliageTint: SubLevelFoliageTint | undefined,
  profile: BlockParticleProfile
): void {
  const resolved = resolveFancySubLevelBlock(block);
  if (!resolved) return;
  const texture = resolveDestructParticleTexture(block, resolved.model);
  if (texture === undefined) return;
  const molang = new MolangVariableMap();
  const particleColor = resolveSubLevelBlockParticleColor(block, resolved.model, foliageTint);
  molang.setFloat("variable.activation_flag", 1);
  molang.setFloat("variable.block_color_r", particleColor.red);
  molang.setFloat("variable.block_color_g", particleColor.green);
  molang.setFloat("variable.block_color_b", particleColor.blue);
  molang.setFloat("variable.block_color_a", particleColor.alpha);
  molang.setFloat("variable.emitter_particles_count", profile.particleCount);
  molang.setFloat("variable.emitter_radius", profile.radius);
  molang.setFloat("variable.velocity_scalar", profile.velocityScalar);
  if (profile.offsetRadius) {
    molang.setFloat("variable.emitter_radius_x", profile.offsetRadius.x);
    molang.setFloat("variable.emitter_radius_y", profile.offsetRadius.y);
    molang.setFloat("variable.emitter_radius_z", profile.offsetRadius.z);
  }
  if (profile.direction) {
    molang.setFloat("variable.emitter_direction_x", profile.direction.x);
    molang.setFloat("variable.emitter_direction_y", profile.direction.y);
    molang.setFloat("variable.emitter_direction_z", profile.direction.z);
  }
  if (profile.directionRandomness) {
    molang.setFloat("variable.emitter_direction_random_x", profile.directionRandomness.x);
    molang.setFloat("variable.emitter_direction_random_y", profile.directionRandomness.y);
    molang.setFloat("variable.emitter_direction_random_z", profile.directionRandomness.z);
  }
  if (profile.speedMin !== undefined) {
    molang.setFloat("variable.emitter_speed_min", profile.speedMin);
  }
  if (profile.speedMax !== undefined) {
    molang.setFloat("variable.emitter_speed_max", profile.speedMax);
  }
  const effectId = blockDestructParticleEffectId(texture);
  try {
    dimension.spawnParticle(effectId, location, molang);
  } catch (error) {
    reportParticleSpawnFailure(effectId, error);
    // Particle availability must not affect block removal.
  }
}

function resolveDestructParticleTexture(
  block: SubLevelBlock,
  model: FancySubLevelModel
): string | undefined {
  if (!isVanillaTypeId(block.typeId)) {
    const kind = addonBlockKind(model);
    if (kind === "log") {
      return isStrippedTypeId(block.typeId)
        ? ADDON_STRIPPED_PARTICLE_TEXTURE
        : ADDON_BARK_PARTICLE_TEXTURE;
    }
    if (kind === "leaf") return ADDON_LEAF_PARTICLE_TEXTURE;
  }
  return destructParticleTexture(model.description);
}

function resolveSubLevelBlockParticleColor(
  block: SubLevelBlock,
  model: FancySubLevelModel,
  foliageTint: SubLevelFoliageTint | undefined
): SubLevelBlockParticleColor {
  if (!isVanillaTypeId(block.typeId)) {
    const kind = addonBlockKind(model);
    if (kind === "log") return resolveAddonLogParticleColor(block);
    if (kind === "leaf" && block.mapColor) {
      return resolveAddonLeafParticleColor(block.mapColor);
    }
  }
  return resolveFoliageParticleColor(block, model, foliageTint) ?? {
    alpha: 0,
    blue: 1,
    green: 1,
    red: 1
  };
}

/**
 * Classifies a registered custom block onto the substitute-particle routes. In
 * the source the capture scan tagged custom tree blocks as log or leaf; here
 * the registration carries the same information: pillar-family models are the
 * log shape and foliage-tinted models are the leaf shape.
 */
function addonBlockKind(model: FancySubLevelModel): "log" | "leaf" | undefined {
  const type = model.description.type;
  if (type === "pillar" || type === "creaking_heart") return "log";
  if (model.tint?.method === "foliage") return "leaf";
  return undefined;
}

/**
 * Resolves the single frozen color used by a tinted particle. Unlike the model
 * renderer this has no second texture sampler, so it samples the documented
 * vanilla colormap only when the particle is spawned. It therefore
 * intentionally does not follow resource-pack colormap replacements.
 */
function resolveFoliageParticleColor(
  block: SubLevelBlock,
  model: FancySubLevelModel,
  foliageTint: SubLevelFoliageTint | undefined
): SubLevelBlockParticleColor | undefined {
  const tint = model.tint;
  if (!tint) return undefined;
  if (tint.method === "fixed") return parseFixedTintColor(tint.color);
  const field = foliageTint ?? DEFAULT_SUBLEVEL_FOLIAGE_TINT;
  if (field.mapKind === FOLIAGE_COLORMAP_SWAMP) return SWAMP_FOLIAGE_COLOR;
  if (field.mapKind === FOLIAGE_COLORMAP_MANGROVE_SWAMP) return MANGROVE_SWAMP_FOLIAGE_COLOR;
  if (field.mapKind === FOLIAGE_COLORMAP_FIXED) {
    return field.uAtLocalOrigin >= 0.5
      ? PALE_GARDEN_FOLIAGE_COLOR
      : CHERRY_GROVE_FOLIAGE_COLOR;
  }
  const colorAt = sampleVanillaFoliageColor(
    foliageFieldCoordinate(field, block.localLocation, "u"),
    foliageFieldCoordinate(field, block.localLocation, "v")
  );
  return { alpha: 1, ...colorAt };
}

function foliageFieldCoordinate(
  field: SubLevelFoliageTint,
  location: Vector3,
  component: "u" | "v"
): number {
  const coordinate = field.gradientAxis === "z" ? location.z : location.x;
  return component === "u"
    ? field.uAtLocalOrigin + field.uPerLocalX * coordinate
    : field.vAtLocalOrigin + field.vPerLocalZ * coordinate;
}

function parseFixedTintColor(hex: string): SubLevelBlockParticleColor {
  const value = Number.parseInt(hex.slice(1), 16);
  return {
    alpha: 1,
    blue: (value & 0xff) / 255,
    green: ((value >> 8) & 0xff) / 255,
    red: ((value >> 16) & 0xff) / 255
  };
}

function resolveAddonLeafParticleColor(
  mapColor: SubLevelBlockMapColor
): SubLevelBlockParticleColor {
  const balanced = balanceParticleColor(mapColor);
  return {
    alpha: 1,
    blue: clampParticleColor(balanced.blue / ADDON_LEAF_PARTICLE_BASE_COLOR.blue),
    green: clampParticleColor(balanced.green / ADDON_LEAF_PARTICLE_BASE_COLOR.green),
    red: clampParticleColor(balanced.red / ADDON_LEAF_PARTICLE_BASE_COLOR.red)
  };
}

function balanceParticleColor(
  mapColor: SubLevelBlockMapColor
): { blue: number; green: number; red: number } {
  const lab = srgbToOklab(mapColor);
  const chroma = Math.hypot(lab.a, lab.b);
  if (chroma <= PARTICLE_CHROMA_SOFT_THRESHOLD) return mapColor;

  // Midtones tolerate more colorfulness than shadows and highlights. The
  // rational shoulder leaves ordinary colors unchanged and compresses only
  // the excess without introducing a hard clipping boundary.
  const lightnessWeight = 2 * Math.sqrt(Math.max(0, lab.lightness * (1 - lab.lightness)));
  const chromaLimit = PARTICLE_CHROMA_SOFT_THRESHOLD
    + (PARTICLE_CHROMA_MIDTONE_LIMIT - PARTICLE_CHROMA_SOFT_THRESHOLD)
    * lightnessWeight;
  const excess = chroma - PARTICLE_CHROMA_SOFT_THRESHOLD;
  const shoulder = chromaLimit - PARTICLE_CHROMA_SOFT_THRESHOLD;
  const compressedChroma = PARTICLE_CHROMA_SOFT_THRESHOLD
    + shoulder * excess / (excess + shoulder);
  const hueA = lab.a / chroma;
  const hueB = lab.b / chroma;
  return oklabToGamutMappedSrgb(lab.lightness, hueA, hueB, compressedChroma);
}

function srgbToOklab(
  srgb: { blue: number; green: number; red: number }
): { a: number; b: number; lightness: number } {
  const red = srgbChannelToLinear(srgb.red);
  const green = srgbChannelToLinear(srgb.green);
  const blue = srgbChannelToLinear(srgb.blue);
  const l = Math.cbrt(0.4122214708 * red + 0.5363325363 * green + 0.0514459929 * blue);
  const m = Math.cbrt(0.2119034982 * red + 0.6806995451 * green + 0.1073969566 * blue);
  const s = Math.cbrt(0.0883024619 * red + 0.2817188376 * green + 0.6299787005 * blue);
  return {
    a: 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    b: 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
    lightness: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s
  };
}

function oklabToGamutMappedSrgb(
  lightness: number,
  hueA: number,
  hueB: number,
  chroma: number
): { blue: number; green: number; red: number } {
  let lowerChroma = 0;
  let upperChroma = chroma;
  let candidate = oklabToSrgb(lightness, hueA * chroma, hueB * chroma);
  if (isSrgbColor(candidate)) return candidate;

  candidate = oklabToSrgb(lightness, 0, 0);
  for (let step = 0; step < PARTICLE_GAMUT_SEARCH_STEPS; step++) {
    const probeChroma = (lowerChroma + upperChroma) / 2;
    const probe = oklabToSrgb(lightness, hueA * probeChroma, hueB * probeChroma);
    if (isSrgbColor(probe)) {
      lowerChroma = probeChroma;
      candidate = probe;
    } else {
      upperChroma = probeChroma;
    }
  }
  return {
    blue: clampParticleColor(candidate.blue),
    green: clampParticleColor(candidate.green),
    red: clampParticleColor(candidate.red)
  };
}

function oklabToSrgb(
  lightness: number,
  a: number,
  b: number
): { blue: number; green: number; red: number } {
  const l = Math.pow(lightness + 0.3963377774 * a + 0.2158037573 * b, 3);
  const m = Math.pow(lightness - 0.1055613458 * a - 0.0638541728 * b, 3);
  const s = Math.pow(lightness - 0.0894841775 * a - 1.291485548 * b, 3);
  return {
    blue: linearChannelToSrgb(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
    green: linearChannelToSrgb(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    red: linearChannelToSrgb(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s)
  };
}

function srgbChannelToLinear(value: number): number {
  return value <= 0.04045 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
}

function linearChannelToSrgb(value: number): number {
  return value <= 0.0031308 ? 12.92 * value : 1.055 * Math.pow(value, 1 / 2.4) - 0.055;
}

function isSrgbColor(srgb: { blue: number; green: number; red: number }): boolean {
  return srgb.blue >= 0 && srgb.blue <= 1
    && srgb.green >= 0 && srgb.green <= 1
    && srgb.red >= 0 && srgb.red <= 1;
}

function resolveAddonLogParticleColor(block: SubLevelBlock): SubLevelBlockParticleColor {
  const stripped = isStrippedTypeId(block.typeId);
  if (!block.mapColor) {
    return {
      alpha: 1,
      ...(stripped ? DEFAULT_ADDON_STRIPPED_TINT : DEFAULT_ADDON_BARK_TINT)
    };
  }
  const scale = stripped ? ADDON_STRIPPED_MAP_COLOR_SCALE : ADDON_BARK_MAP_COLOR_SCALE;
  const offset = stripped ? ADDON_STRIPPED_MAP_COLOR_OFFSET : ADDON_BARK_MAP_COLOR_OFFSET;
  return {
    alpha: 1,
    blue: clampParticleColor(block.mapColor.blue * scale.blue + offset.blue),
    green: clampParticleColor(block.mapColor.green * scale.green + offset.green),
    red: clampParticleColor(block.mapColor.red * scale.red + offset.red)
  };
}

function reportParticleSpawnFailure(effectId: string, error: unknown): void {
  if (REPORTED_PARTICLE_SPAWN_FAILURES.has(effectId)) return;
  REPORTED_PARTICLE_SPAWN_FAILURES.add(effectId);
  (globalThis as unknown as { console: { error(message: string): void } }).console.error(
    `[sable/particle] Failed to spawn ${effectId}: ${describeError(error)}`
  );
}

function describeError(error: unknown): string {
  return error instanceof Error ? error.stack ?? error.message : String(error);
}

function isVanillaTypeId(typeId: string): boolean {
  return typeId.startsWith("minecraft:") || typeId.startsWith("sable:");
}

function isStrippedTypeId(typeId: string): boolean {
  const separator = typeId.indexOf(":");
  const name = separator >= 0 ? typeId.slice(separator + 1) : typeId;
  return name.startsWith("stripped_");
}

function clampParticleColor(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function color(red: number, green: number, blue: number): SubLevelBlockParticleColor {
  return { alpha: 1, red: red / 255, green: green / 255, blue: blue / 255 };
}
