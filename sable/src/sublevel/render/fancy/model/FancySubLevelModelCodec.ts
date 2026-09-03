import type { Vector3 } from "@minecraft/server";
import { DEFAULT_SUBLEVEL_RENDER_ANCHOR_LOCAL } from "../../../../util/SublevelRenderOffsetHelper.js";

export const FANCY_MODEL_ORIGIN_BIAS = 1024;
export const FANCY_MODEL_ORIGIN_SIZE = 2048;
export const FANCY_MODEL_POSE_READY_PLACE = FANCY_MODEL_ORIGIN_SIZE;
export const FANCY_MODEL_LAYOUT_WIDTH_PLACE = 4096;
export const FANCY_MODEL_LAYOUT_DEPTH_PLACE = 131072;
export const FANCY_MODEL_LAYOUT_AXIS_SPAN = 32;

/**
 * The origin_y property carries the anchor Y, the pose-ready flag and the
 * dense layout footprint: y + poseReady*2048 + (width-1)*4096 + (depth-1)*131072.
 * Sparse and pool entities write a 1x1 footprint, which their molang ignores.
 */
export function packFancySubLevelOrigin(
  modelAnchor: Vector3,
  renderAnchor: Vector3,
  layoutWidth: number,
  layoutDepth: number
): { xz: number; y: number } {
  const x = modelAnchor.x
    + DEFAULT_SUBLEVEL_RENDER_ANCHOR_LOCAL.x
    - renderAnchor.x
    + FANCY_MODEL_ORIGIN_BIAS;
  const y = modelAnchor.y
    + DEFAULT_SUBLEVEL_RENDER_ANCHOR_LOCAL.y
    - renderAnchor.y
    + FANCY_MODEL_ORIGIN_BIAS;
  const z = modelAnchor.z
    + DEFAULT_SUBLEVEL_RENDER_ANCHOR_LOCAL.z
    - renderAnchor.z
    + FANCY_MODEL_ORIGIN_BIAS;
  if (
    !Number.isInteger(x) || x < 0 || x >= FANCY_MODEL_ORIGIN_SIZE
    || !Number.isInteger(y) || y < 0 || y >= FANCY_MODEL_ORIGIN_SIZE
    || !Number.isInteger(z) || z < 0 || z >= FANCY_MODEL_ORIGIN_SIZE
  ) throw new RangeError("Fancy sub-level model origin exceeds the packed range.");
  if (
    !Number.isInteger(layoutWidth) || layoutWidth < 1 || layoutWidth > FANCY_MODEL_LAYOUT_AXIS_SPAN
    || !Number.isInteger(layoutDepth) || layoutDepth < 1 || layoutDepth > FANCY_MODEL_LAYOUT_AXIS_SPAN
  ) throw new RangeError("Fancy sub-level layout footprint exceeds the packed range.");
  return {
    xz: x + z * FANCY_MODEL_ORIGIN_SIZE,
    y: y
      + (layoutWidth - 1) * FANCY_MODEL_LAYOUT_WIDTH_PLACE
      + (layoutDepth - 1) * FANCY_MODEL_LAYOUT_DEPTH_PLACE
  };
}

export function encodeFancySubLevelOriginY(originY: number, poseReady: boolean): number {
  return originY + (poseReady ? FANCY_MODEL_POSE_READY_PLACE : 0);
}

export function isFancySubLevelOriginEncodable(location: Vector3): boolean {
  return location.x >= -FANCY_MODEL_ORIGIN_BIAS
    && location.x < FANCY_MODEL_ORIGIN_SIZE - FANCY_MODEL_ORIGIN_BIAS
    && location.y >= -FANCY_MODEL_ORIGIN_BIAS
    && location.y < FANCY_MODEL_ORIGIN_SIZE - FANCY_MODEL_ORIGIN_BIAS
    && location.z >= -FANCY_MODEL_ORIGIN_BIAS
    && location.z < FANCY_MODEL_ORIGIN_SIZE - FANCY_MODEL_ORIGIN_BIAS;
}
