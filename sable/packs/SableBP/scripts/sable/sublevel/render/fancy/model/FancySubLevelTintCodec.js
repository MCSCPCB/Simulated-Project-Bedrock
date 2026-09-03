import {
  isFancySubLevelTintMaterial
} from "./FancySubLevelModel.js";
const FOLIAGE_COLORMAP_DEFAULT = 1;
const TINT_COORDINATE_BASE = 32;
const TINT_KIND_PLACE = TINT_COORDINATE_BASE ** 4;
const TINT_AXIS_Z_PLACE = 8 * TINT_KIND_PLACE;
const TINT_UNIFORM_STATE = 7;
const TINT_TEXTURE_SIZE = 256;
const DEFAULT_SUBLEVEL_FOLIAGE_TINT = Object.freeze({
  gradientAxis: "x",
  mapKind: FOLIAGE_COLORMAP_DEFAULT,
  uAtLocalOrigin: 0.2,
  uPerLocalX: 0,
  vAtLocalOrigin: 0.68,
  vPerLocalZ: 0
});
function packFancySubLevelTint(packed, foliage = DEFAULT_SUBLEVEL_FOLIAGE_TINT) {
  const tint = packed.model.tint;
  if (!tint) return 16777215;
  if (tint.method === "fixed") return parseFixedColor(tint.color);
  if (isUniformField(foliage)) {
    return textureCoordinate(foliage.uAtLocalOrigin) + textureCoordinate(foliage.vAtLocalOrigin) * TINT_TEXTURE_SIZE + TINT_UNIFORM_STATE * TINT_KIND_PLACE;
  }
  const width = packed.format === "dense" ? packed.width : 64;
  const depth = packed.format === "dense" ? packed.depth : 64;
  const minimumX = packed.anchorLocalLocation.x - 0.5;
  const minimumZ = packed.anchorLocalLocation.z - 0.5;
  const maximumX = minimumX + width;
  const maximumZ = minimumZ + depth;
  const u0 = quantize(sampleU(foliage, minimumX));
  const u1 = quantize(sampleU(foliage, maximumX));
  const v0 = quantize(sampleV(foliage, minimumZ));
  const v1 = quantize(sampleV(foliage, maximumZ));
  return u0 + v0 * TINT_COORDINATE_BASE + u1 * TINT_COORDINATE_BASE ** 2 + v1 * TINT_COORDINATE_BASE ** 3 + clampMapKind(foliage.mapKind) * TINT_KIND_PLACE + (foliage.gradientAxis === "z" ? TINT_AXIS_Z_PLACE : 0);
}
function hasFancySubLevelTint(model) {
  return isFancySubLevelTintMaterial(model.material) && model.tint !== void 0;
}
function isFixedFancySubLevelTint(tint) {
  return tint?.method === "fixed";
}
function parseFixedColor(color) {
  const value = Number.parseInt(color.slice(1), 16);
  return Number.isInteger(value) ? value : 16777215;
}
function sampleU(field, x) {
  return clamp(field.uAtLocalOrigin + field.uPerLocalX * x);
}
function sampleV(field, z) {
  return clamp(field.vAtLocalOrigin + field.vPerLocalZ * z);
}
function quantize(value) {
  return Math.round(clamp(value) * 31);
}
function textureCoordinate(value) {
  return Math.round(clamp(value) * (TINT_TEXTURE_SIZE - 1));
}
function clamp(value) {
  return Math.max(0, Math.min(1, value));
}
function clampMapKind(value) {
  return Math.max(1, Math.min(6, Math.floor(value)));
}
function isUniformField(field) {
  return field.mapKind === FOLIAGE_COLORMAP_DEFAULT && field.uPerLocalX === 0 && field.vPerLocalZ === 0;
}
export {
  DEFAULT_SUBLEVEL_FOLIAGE_TINT,
  FOLIAGE_COLORMAP_DEFAULT,
  hasFancySubLevelTint,
  isFixedFancySubLevelTint,
  packFancySubLevelTint
};
