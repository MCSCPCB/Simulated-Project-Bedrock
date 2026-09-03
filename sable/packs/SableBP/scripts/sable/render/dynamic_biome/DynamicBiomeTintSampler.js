import { BIOME_FOLIAGE_CLIMATES } from "../../data/BiomeFoliageClimates.js";
import { resolveFancySubLevelBlock } from "../../sublevel/render/fancy/model/FancySubLevelModelRegistry.js";
import {
  DEFAULT_SUBLEVEL_FOLIAGE_TINT,
  FOLIAGE_COLORMAP_DEFAULT,
  FOLIAGE_COLORMAP_FIXED,
  FOLIAGE_COLORMAP_MANGROVE_SWAMP,
  FOLIAGE_COLORMAP_SWAMP,
  FOLIAGE_TINT_COORDINATE_STEPS,
  climateToColormapUv
} from "../../sublevel/render/fancy/model/FancySubLevelTintCodec.js";
const FIXED_CHERRY_GROVE_PALETTE_U = 8 / FOLIAGE_TINT_COORDINATE_STEPS;
const FIXED_PALE_GARDEN_PALETTE_U = 23 / FOLIAGE_TINT_COORDINATE_STEPS;
const FIXED_PALETTE_V = 16 / FOLIAGE_TINT_COORDINATE_STEPS;
function captureSubLevelFoliageTint(dimension, blocks, origin) {
  const foliage = blocks.filter((block) => resolveFancySubLevelBlock(block)?.model.tint?.method === "foliage");
  if (foliage.length === 0) return { ...DEFAULT_SUBLEVEL_FOLIAGE_TINT };
  const worldX = foliage.map((block) => origin.x + block.localLocation.x);
  const worldZ = foliage.map((block) => origin.z + block.localLocation.z);
  const minimumX = Math.min(...worldX);
  const maximumX = Math.max(...worldX);
  const minimumZ = Math.min(...worldZ);
  const maximumZ = Math.max(...worldZ);
  const sampleY = Math.floor(
    foliage.reduce((sum, block) => sum + origin.y + block.localLocation.y, 0) / foliage.length
  );
  const centerX = Math.floor((minimumX + maximumX) / 2);
  const centerZ = Math.floor((minimumZ + maximumZ) / 2);
  const locations = deduplicateLocations([
    { x: centerX, y: sampleY, z: centerZ },
    { x: minimumX, y: sampleY, z: minimumZ },
    { x: maximumX, y: sampleY, z: minimumZ },
    { x: minimumX, y: sampleY, z: maximumZ },
    { x: maximumX, y: sampleY, z: maximumZ }
  ]);
  const samples = locations.map((location) => sampleFoliage(dimension, location, origin));
  const source = chooseFoliageColorSource(samples);
  if (source.kind === FOLIAGE_COLORMAP_FIXED) {
    const palette = source.palette ?? "cherry_grove";
    const uv = fixedPaletteUv(palette);
    return {
      gradientAxis: "x",
      mapKind: source.kind,
      uAtLocalOrigin: uv.u,
      uPerLocalX: 0,
      vAtLocalOrigin: uv.v,
      vPerLocalZ: 0
    };
  }
  const selectedSamples = samples.filter((sample) => sample.kind === source.kind);
  const xFit = fitFoliageAxis(selectedSamples, "x");
  const zFit = fitFoliageAxis(selectedSamples, "z");
  const fit = zFit.error < xFit.error ? zFit : xFit;
  return {
    gradientAxis: fit.axis,
    mapKind: source.kind,
    uAtLocalOrigin: fit.u.intercept,
    uPerLocalX: fit.u.slope,
    vAtLocalOrigin: fit.v.intercept,
    vPerLocalZ: fit.v.slope
  };
}
function sampleFoliage(dimension, location, origin) {
  let biomeId = "minecraft:plains";
  try {
    biomeId = dimension.getBiome(location).id;
  } catch {
  }
  const climate = BIOME_FOLIAGE_CLIMATES[biomeId] ?? BIOME_FOLIAGE_CLIMATES["minecraft:plains"];
  const uv = climateToColormapUv(climate.temperature, climate.downfall);
  return {
    kind: biomeColormapKind(biomeId),
    localX: location.x - origin.x,
    localZ: location.z - origin.z,
    palette: biomeFixedPalette(biomeId),
    u: uv.u,
    v: uv.v
  };
}
function biomeColormapKind(typeId) {
  if (biomeFixedPalette(typeId)) return FOLIAGE_COLORMAP_FIXED;
  if (typeId === "minecraft:mangrove_swamp") return FOLIAGE_COLORMAP_MANGROVE_SWAMP;
  if (typeId === "minecraft:swamp" || typeId === "minecraft:swampland" || typeId === "minecraft:swampland_mutated") return FOLIAGE_COLORMAP_SWAMP;
  return FOLIAGE_COLORMAP_DEFAULT;
}
function biomeFixedPalette(typeId) {
  if (typeId === "minecraft:cherry_grove") return "cherry_grove";
  if (typeId === "minecraft:pale_garden") return "pale_garden";
  return void 0;
}
function chooseFoliageColorSource(samples) {
  const fallback = {
    kind: FOLIAGE_COLORMAP_DEFAULT,
    palette: void 0
  };
  if (samples.length === 0) return fallback;
  const counts = /* @__PURE__ */ new Map();
  for (const sample of samples) {
    const key = foliageColorSourceKey(sample);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const maximum = Math.max(...counts.values());
  for (const sample of samples) {
    if ((counts.get(foliageColorSourceKey(sample)) ?? 0) === maximum) {
      return { kind: sample.kind, palette: sample.palette };
    }
  }
  return fallback;
}
function foliageColorSourceKey(source) {
  return `${source.kind}:${source.palette ?? ""}`;
}
function fixedPaletteUv(palette) {
  return {
    u: palette === "pale_garden" ? FIXED_PALE_GARDEN_PALETTE_U : FIXED_CHERRY_GROVE_PALETTE_U,
    v: FIXED_PALETTE_V
  };
}
function fitAxis(samples, coordinate, value) {
  const meanCoordinate = samples.reduce((sum, sample) => sum + coordinate(sample), 0) / samples.length;
  const meanValue = samples.reduce((sum, sample) => sum + value(sample), 0) / samples.length;
  let covariance = 0;
  let variance = 0;
  for (const sample of samples) {
    const delta = coordinate(sample) - meanCoordinate;
    covariance += delta * (value(sample) - meanValue);
    variance += delta * delta;
  }
  const slope = variance > 0 ? covariance / variance : 0;
  return { intercept: meanValue - slope * meanCoordinate, slope };
}
function fitFoliageAxis(samples, axis) {
  const coordinate = axis === "x" ? (sample) => sample.localX : (sample) => sample.localZ;
  const u = fitAxis(samples, coordinate, (sample) => sample.u);
  const v = fitAxis(samples, coordinate, (sample) => sample.v);
  const error = samples.reduce((sum, sample) => {
    const at = coordinate(sample);
    const uError = sample.u - (u.intercept + u.slope * at);
    const vError = sample.v - (v.intercept + v.slope * at);
    return sum + uError * uError + vError * vError;
  }, 0);
  return { axis, error, u, v };
}
function deduplicateLocations(locations) {
  const result = /* @__PURE__ */ new Map();
  for (const location of locations) {
    result.set(`${location.x},${location.y},${location.z}`, location);
  }
  return [...result.values()];
}
export {
  captureSubLevelFoliageTint
};
