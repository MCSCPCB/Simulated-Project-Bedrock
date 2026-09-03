import { DEFAULT_SUBLEVEL_RENDER_ANCHOR_LOCAL } from "../../../../util/SublevelRenderOffsetHelper.js";
const FANCY_MODEL_ORIGIN_BIAS = 1024;
const FANCY_MODEL_ORIGIN_SIZE = 2048;
const FANCY_MODEL_POSE_READY_PLACE = FANCY_MODEL_ORIGIN_SIZE;
const FANCY_MODEL_LAYOUT_WIDTH_PLACE = 4096;
const FANCY_MODEL_LAYOUT_DEPTH_PLACE = 131072;
const FANCY_MODEL_LAYOUT_AXIS_SPAN = 32;
function packFancySubLevelOrigin(modelAnchor, renderAnchor, layoutWidth, layoutDepth) {
  const x = modelAnchor.x + DEFAULT_SUBLEVEL_RENDER_ANCHOR_LOCAL.x - renderAnchor.x + FANCY_MODEL_ORIGIN_BIAS;
  const y = modelAnchor.y + DEFAULT_SUBLEVEL_RENDER_ANCHOR_LOCAL.y - renderAnchor.y + FANCY_MODEL_ORIGIN_BIAS;
  const z = modelAnchor.z + DEFAULT_SUBLEVEL_RENDER_ANCHOR_LOCAL.z - renderAnchor.z + FANCY_MODEL_ORIGIN_BIAS;
  if (!Number.isInteger(x) || x < 0 || x >= FANCY_MODEL_ORIGIN_SIZE || !Number.isInteger(y) || y < 0 || y >= FANCY_MODEL_ORIGIN_SIZE || !Number.isInteger(z) || z < 0 || z >= FANCY_MODEL_ORIGIN_SIZE) throw new RangeError("Fancy sub-level model origin exceeds the packed range.");
  if (!Number.isInteger(layoutWidth) || layoutWidth < 1 || layoutWidth > FANCY_MODEL_LAYOUT_AXIS_SPAN || !Number.isInteger(layoutDepth) || layoutDepth < 1 || layoutDepth > FANCY_MODEL_LAYOUT_AXIS_SPAN) throw new RangeError("Fancy sub-level layout footprint exceeds the packed range.");
  return {
    xz: x + z * FANCY_MODEL_ORIGIN_SIZE,
    y: y + (layoutWidth - 1) * FANCY_MODEL_LAYOUT_WIDTH_PLACE + (layoutDepth - 1) * FANCY_MODEL_LAYOUT_DEPTH_PLACE
  };
}
function encodeFancySubLevelOriginY(originY, poseReady) {
  return originY + (poseReady ? FANCY_MODEL_POSE_READY_PLACE : 0);
}
function isFancySubLevelOriginEncodable(location) {
  return location.x >= -FANCY_MODEL_ORIGIN_BIAS && location.x < FANCY_MODEL_ORIGIN_SIZE - FANCY_MODEL_ORIGIN_BIAS && location.y >= -FANCY_MODEL_ORIGIN_BIAS && location.y < FANCY_MODEL_ORIGIN_SIZE - FANCY_MODEL_ORIGIN_BIAS && location.z >= -FANCY_MODEL_ORIGIN_BIAS && location.z < FANCY_MODEL_ORIGIN_SIZE - FANCY_MODEL_ORIGIN_BIAS;
}
export {
  FANCY_MODEL_LAYOUT_AXIS_SPAN,
  FANCY_MODEL_LAYOUT_DEPTH_PLACE,
  FANCY_MODEL_LAYOUT_WIDTH_PLACE,
  FANCY_MODEL_ORIGIN_BIAS,
  FANCY_MODEL_ORIGIN_SIZE,
  FANCY_MODEL_POSE_READY_PLACE,
  encodeFancySubLevelOriginY,
  isFancySubLevelOriginEncodable,
  packFancySubLevelOrigin
};
