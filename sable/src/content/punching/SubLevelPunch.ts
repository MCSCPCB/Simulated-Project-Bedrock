// The punch curve behind player and external impulses on a sub-level: cooldown,
// downward damping, the Sable-calibrated strength curve and the uprightness
// multiplier. Migrated from TreePhysics src/content/player/Punch.ts.
import type { Vector3 } from "@minecraft/server";
import type { RigidBodyHandle } from "../../api/physics/handle/RigidBodyHandle.js";
import { clamp, normalizeFinite as normalize } from "../../util/SableVector3Utils.js";

const PUNCH_COOLDOWN_TICKS = 3;
const SABLE_PUNCH_STRENGTH_MULTIPLIER = 2.1;
const SABLE_PUNCH_DOWNWARD_MULTIPLIER = 0.175;
const UPRIGHT_PUNCH_MULTIPLIER = 1.5;
// Calibrated against Cannon's larger first grounded-contact loss versus Sable's Rapier backend.
const CANNON_PUNCH_BACKEND_COMPENSATION = 1.5;

export function isPunchCooldownReady(previousTick: number | undefined, currentTick: number): boolean {
  return previousTick === undefined || currentTick - previousTick >= PUNCH_COOLDOWN_TICKS;
}

export function applySableDownwardPunchMultiplier(direction: Vector3): Vector3 {
  const result = normalize(direction);
  if (result.y < 0) result.y *= SABLE_PUNCH_DOWNWARD_MULTIPLIER;
  return result;
}

// Sable-calibrated punch curve coefficients. The two branches of the curve are
// tuned to meet at mass = 1 with value 1 and slope SABLE_PUNCH_SLOPE_AT_ONE on
// both sides, so the piecewise seam is C1-continuous.
const SABLE_PUNCH_FALLOFF_SCALE = 2;
const SABLE_PUNCH_FALLOFF_EXPONENT = 0.5;
const SABLE_PUNCH_SLOPE_AT_ONE = 0.8;
const SABLE_PUNCH_ZERO_MASS_VELOCITY_IMPULSE = 1.75;
// The curve offset places the power-law falloff so its slope at mass 1 equals
// SABLE_PUNCH_SLOPE_AT_ONE. = 0.8 / (2 * 0.5)
const SABLE_PUNCH_CURVE_OFFSET = SABLE_PUNCH_SLOPE_AT_ONE / (SABLE_PUNCH_FALLOFF_SCALE * SABLE_PUNCH_FALLOFF_EXPONENT);
// = 1 / (0.5 - 1)
const SABLE_PUNCH_INVERSE_EXPONENT = 1 / (SABLE_PUNCH_FALLOFF_EXPONENT - 1);
// = Math.pow(0.8, -2)
const SABLE_PUNCH_FALLOFF_BASE = Math.pow(SABLE_PUNCH_CURVE_OFFSET, SABLE_PUNCH_INVERSE_EXPONENT);
// = Math.pow(0.8, 0.5 * -2)
const SABLE_PUNCH_FALLOFF_BIAS = Math.pow(SABLE_PUNCH_CURVE_OFFSET, SABLE_PUNCH_FALLOFF_EXPONENT * SABLE_PUNCH_INVERSE_EXPONENT);
// = 1.75 + 0.8 - 2
const SABLE_PUNCH_QUADRATIC_COEFFICIENT = SABLE_PUNCH_ZERO_MASS_VELOCITY_IMPULSE + SABLE_PUNCH_SLOPE_AT_ONE - 2;

function sablePunchCurve(mass: number): number {
  if (!Number.isFinite(mass) || mass <= 0) return 0;
  const offsetMass = mass - 1;
  if (mass < 1) {
    return ((SABLE_PUNCH_QUADRATIC_COEFFICIENT * offsetMass + SABLE_PUNCH_SLOPE_AT_ONE - 1) * offsetMass + 1) * mass;
  }
  return SABLE_PUNCH_FALLOFF_SCALE * (Math.pow(offsetMass + SABLE_PUNCH_FALLOFF_BASE, SABLE_PUNCH_FALLOFF_EXPONENT) - SABLE_PUNCH_FALLOFF_BIAS) + 1;
}

export function computeSubLevelPunchStrength(effectiveMass: number, uprightness: number): number {
  const uprightStrength = 1 + UPRIGHT_PUNCH_MULTIPLIER * clamp(uprightness, 0, 1);
  return CANNON_PUNCH_BACKEND_COMPENSATION * uprightStrength * SABLE_PUNCH_STRENGTH_MULTIPLIER * sablePunchCurve(effectiveMass);
}

export function getSubLevelUprightness(
  subLevel: { readonly body: Pick<RigidBodyHandle, "localPointToWorld"> }
): number {
  const origin = subLevel.body.localPointToWorld({ x: 0, y: 0, z: 0 });
  const localUp = subLevel.body.localPointToWorld({ x: 0, y: 1, z: 0 });
  return clamp(localUp.y - origin.y, 0, 1);
}
