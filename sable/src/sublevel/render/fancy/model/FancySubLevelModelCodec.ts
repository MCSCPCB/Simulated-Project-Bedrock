import type { Vector3 } from "@minecraft/server";
import { DEFAULT_SUBLEVEL_RENDER_ANCHOR_LOCAL } from "../../../../util/SublevelRenderOffsetHelper.js";

export const FANCY_MODEL_ORIGIN_BIAS = 1024;
export const FANCY_MODEL_ORIGIN_SIZE = 2048;
export const FANCY_MODEL_POSE_READY_PLACE = FANCY_MODEL_ORIGIN_SIZE;

export function packFancySubLevelOrigin(
  modelAnchor: Vector3,
  renderAnchor: Vector3
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
  return { xz: x + z * FANCY_MODEL_ORIGIN_SIZE, y };
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
