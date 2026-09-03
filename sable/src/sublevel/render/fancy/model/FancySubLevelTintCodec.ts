import type { SubLevelFoliageTint } from "../../../SubLevel.js";
import type { PackedFancySubLevelModel } from "./FancySubLevelModelLayout.js";

export const FOLIAGE_COLORMAP_DEFAULT = 1;
const FOLIAGE_COLORMAP_FIXED = 6;
const TINT_COORDINATE_BASE = 32;
const TINT_KIND_PLACE = TINT_COORDINATE_BASE ** 4;
const TINT_AXIS_Z_PLACE = 8 * TINT_KIND_PLACE;
const TINT_UNIFORM_STATE = 7;
const TINT_TEXTURE_SIZE = 256;

export const DEFAULT_SUBLEVEL_FOLIAGE_TINT: SubLevelFoliageTint = Object.freeze({
  gradientAxis: "x",
  mapKind: FOLIAGE_COLORMAP_DEFAULT,
  uAtLocalOrigin: 0.2,
  uPerLocalX: 0,
  vAtLocalOrigin: 0.68,
  vPerLocalZ: 0
});

export function packFancySubLevelTint(
  packed: PackedFancySubLevelModel,
  foliage: SubLevelFoliageTint = DEFAULT_SUBLEVEL_FOLIAGE_TINT
): number {
  const tint = packed.tint;
  if (!tint) return 0;
  // Fixed colors sample one palette cell of the fixed colormap: both gradient
  // endpoints address the same cell, so the multiply layer reads a constant.
  if (tint.method === "fixed") {
    const cell = Math.max(0, Math.min(TINT_COORDINATE_BASE - 1, Math.floor(tint.palette)));
    return cell
      + cell * TINT_COORDINATE_BASE ** 2
      + FOLIAGE_COLORMAP_FIXED * TINT_KIND_PLACE;
  }
  if (isUniformField(foliage)) {
    return textureCoordinate(foliage.uAtLocalOrigin)
      + textureCoordinate(foliage.vAtLocalOrigin) * TINT_TEXTURE_SIZE
      + TINT_UNIFORM_STATE * TINT_KIND_PLACE;
  }
  const width = packed.width;
  const depth = packed.depth;
  const minimumX = packed.anchorLocalLocation.x - 0.5;
  const minimumZ = packed.anchorLocalLocation.z - 0.5;
  const maximumX = minimumX + width;
  const maximumZ = minimumZ + depth;
  const u0 = quantize(sampleU(foliage, minimumX));
  const u1 = quantize(sampleU(foliage, maximumX));
  const v0 = quantize(sampleV(foliage, minimumZ));
  const v1 = quantize(sampleV(foliage, maximumZ));
  return u0
    + v0 * TINT_COORDINATE_BASE
    + u1 * TINT_COORDINATE_BASE ** 2
    + v1 * TINT_COORDINATE_BASE ** 3
    + clampMapKind(foliage.mapKind) * TINT_KIND_PLACE
    + (foliage.gradientAxis === "z" ? TINT_AXIS_Z_PLACE : 0);
}

function sampleU(field: SubLevelFoliageTint, x: number): number {
  return clamp(field.uAtLocalOrigin + field.uPerLocalX * x);
}

function sampleV(field: SubLevelFoliageTint, z: number): number {
  return clamp(field.vAtLocalOrigin + field.vPerLocalZ * z);
}

function quantize(value: number): number {
  return Math.round(clamp(value) * 31);
}

function textureCoordinate(value: number): number {
  return Math.round(clamp(value) * (TINT_TEXTURE_SIZE - 1));
}

function clamp(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function clampMapKind(value: number): number {
  return Math.max(1, Math.min(6, Math.floor(value)));
}

function isUniformField(field: SubLevelFoliageTint): boolean {
  return field.mapKind === FOLIAGE_COLORMAP_DEFAULT
    && field.uPerLocalX === 0
    && field.vPerLocalZ === 0;
}
