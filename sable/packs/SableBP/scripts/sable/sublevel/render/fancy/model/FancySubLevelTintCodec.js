const FOLIAGE_COLORMAP_DEFAULT = 1;
const FOLIAGE_COLORMAP_SWAMP = 2;
const FOLIAGE_COLORMAP_MANGROVE_SWAMP = 3;
const FOLIAGE_COLORMAP_FIXED = 6;
const FOLIAGE_TINT_COORDINATE_STEPS = 31;
const TINT_COORDINATE_BASE = FOLIAGE_TINT_COORDINATE_STEPS + 1;
const TINT_KIND_PLACE = TINT_COORDINATE_BASE ** 4;
const TINT_AXIS_Z_PLACE = 8 * TINT_KIND_PLACE;
const TINT_UNIFORM_STATE = 7;
const TINT_TEXTURE_SIZE = 256;
function climateToColormapUv(baseTemperature, baseDownfall) {
  const temperature = clamp(baseTemperature);
  const rainfall = clamp(baseDownfall) * temperature;
  return { u: 1 - temperature, v: 1 - rainfall };
}
const DEFAULT_SUBLEVEL_FOLIAGE_TINT = (() => {
  const uv = climateToColormapUv(0.8, 0.4);
  return Object.freeze({
    gradientAxis: "x",
    mapKind: FOLIAGE_COLORMAP_DEFAULT,
    uAtLocalOrigin: uv.u,
    uPerLocalX: 0,
    vAtLocalOrigin: uv.v,
    vPerLocalZ: 0
  });
})();
function packFancySubLevelTint(packed, foliage = DEFAULT_SUBLEVEL_FOLIAGE_TINT) {
  const tint = packed.tint;
  if (!tint) return 0;
  if (tint.method === "fixed") {
    const cell = Math.max(0, Math.min(TINT_COORDINATE_BASE - 1, Math.floor(tint.palette)));
    return cell + cell * TINT_COORDINATE_BASE ** 2 + FOLIAGE_COLORMAP_FIXED * TINT_KIND_PLACE;
  }
  if (isUniformField(foliage)) {
    return textureCoordinate(foliage.uAtLocalOrigin) + textureCoordinate(foliage.vAtLocalOrigin) * TINT_TEXTURE_SIZE + TINT_UNIFORM_STATE * TINT_KIND_PLACE;
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
  return u0 + v0 * TINT_COORDINATE_BASE + u1 * TINT_COORDINATE_BASE ** 2 + v1 * TINT_COORDINATE_BASE ** 3 + clampMapKind(foliage.mapKind) * TINT_KIND_PLACE + (foliage.gradientAxis === "z" ? TINT_AXIS_Z_PLACE : 0);
}
function sampleU(field, x) {
  return clamp(field.uAtLocalOrigin + field.uPerLocalX * x);
}
function sampleV(field, z) {
  return clamp(field.vAtLocalOrigin + field.vPerLocalZ * z);
}
function quantize(value) {
  return Math.round(clamp(value) * FOLIAGE_TINT_COORDINATE_STEPS);
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
  FOLIAGE_COLORMAP_FIXED,
  FOLIAGE_COLORMAP_MANGROVE_SWAMP,
  FOLIAGE_COLORMAP_SWAMP,
  FOLIAGE_TINT_COORDINATE_STEPS,
  climateToColormapUv,
  packFancySubLevelTint
};
