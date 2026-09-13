// Fluid entry effects for sub-levels: the water and lava entry splashes and
// the shared contact/volume math that scales them by entry impulse and contact
// area. Migrated from handleWaterEntry, handleLavaEntry,
// computeFluidEntryContact and computeFluidEntrySoundVolume in
// TreePhysics src/content/tree/contraption/Lifecycle.ts.
import { MolangVariableMap } from "@minecraft/server";
import type {
  PhysicsLavaEntryAfterEvent,
  PhysicsWaterEntryAfterEvent
} from "../../api/physics/PhysicsTypes.js";

const LAVA_ENTRY_MIN_PARTICLE_IMPULSE = 0.25;
const LAVA_ENTRY_MAX_SPARKS = 400;
const FLUID_ENTRY_SOUND_MAX_GAIN = 0.2;
const FLUID_ENTRY_SOUND_SATURATION = 0.5;
const SPLASH_PARTICLE_ID = "sable:sublevel_splash_entry";
const LAVA_SPLASH_PARTICLE_ID = "sable:sublevel_lava_splash";

export class SubLevelFluidEntryEffects {
  handleWaterEntry(event: PhysicsWaterEntryAfterEvent): void {
    if (!event.body.dimension.getSubLevelById(event.body.id)) return;
    const { impulse, scaleX, scaleZ } = computeFluidEntryContact(event);
    const contactArea = scaleX * scaleZ;
    const soundVolume = computeFluidEntrySoundVolume(1, impulse, contactArea);
    const molang = new MolangVariableMap();
    molang.setFloat(
      "variable.water_impulse",
      impulse
    );
    molang.setFloat(
      "variable.water_scale_x",
      scaleX
    );
    molang.setFloat(
      "variable.water_scale_z",
      scaleZ
    );
    try {
      event.body.dimension.dimension.spawnParticle(SPLASH_PARTICLE_ID, event.point, molang);
    } catch {
      // Particle availability must not affect physics.
    }
    try {
      event.body.dimension.dimension.playSound("entity.generic.splash", event.point, {
        pitch: 0.6 + Math.random() * 0.8,
        volume: soundVolume
      });
    } catch {
      // Entry audio is cosmetic and must not affect physics.
    }
  }

  handleLavaEntry(event: PhysicsLavaEntryAfterEvent): void {
    if (!event.body.dimension.getSubLevelById(event.body.id)) return;
    const { impulse, scaleX, scaleZ } = computeFluidEntryContact(event);
    const area = scaleX * scaleZ;
    const contactScale = Math.sqrt(area);
    const baseVolume = 0.4 + Math.random() * 0.2;
    const soundVolume = computeFluidEntrySoundVolume(baseVolume, impulse, area);
    try {
      event.body.dimension.dimension.playSound("liquid.lavapop", event.point, {
        pitch: 0.9 + Math.random() * 0.15,
        volume: soundVolume
      });
    } catch {
      // Entry audio is cosmetic and must not affect physics.
    }
    if (!Number.isFinite(impulse) || impulse < LAVA_ENTRY_MIN_PARTICLE_IMPULSE) return;
    const count = Math.min(
      LAVA_ENTRY_MAX_SPARKS,
      Math.max(
        24,
        Math.floor(
          (8 + contactScale * 20)
          * (0.85 + Math.min(2, impulse) * 0.15)
        )
      )
    );
    const molang = new MolangVariableMap();
    molang.setFloat("variable.lava_count", count);
    molang.setFloat("variable.lava_impulse", impulse);
    molang.setFloat("variable.lava_radius_x", Math.min(32, scaleX * 0.5));
    molang.setFloat("variable.lava_radius_z", Math.min(32, scaleZ * 0.5));
    molang.setFloat("variable.lava_speed_scale", Math.min(1.6, 0.75 + impulse * 0.35));
    molang.setFloat("variable.lava_vertical_scale", Math.min(2, 0.85 + impulse * 0.6));
    try {
      event.body.dimension.dimension.spawnParticle(LAVA_SPLASH_PARTICLE_ID, event.point, molang);
    } catch {
      // Lava visuals must not affect physics or lifecycle state.
    }
  }
}

export function computeFluidEntryContact(
  event: PhysicsWaterEntryAfterEvent | PhysicsLavaEntryAfterEvent
): { readonly impulse: number; readonly scaleX: number; readonly scaleZ: number } {
  return {
    impulse: Math.max(0, -event.fastestContactVelocityY) * event.timeStep,
    scaleX: Math.max(1, event.maxContactX - event.minContactX + 1, event.bodyAabbSizeX),
    scaleZ: Math.max(1, event.maxContactZ - event.minContactZ + 1, event.bodyAabbSizeZ)
  };
}

/** Adds at most 20% gain to vanilla volume from existing entry impulse and contact area. */
export function computeFluidEntrySoundVolume(
  baseVolume: number,
  impulse: number,
  contactArea: number
): number {
  if (
    !Number.isFinite(baseVolume)
    || !Number.isFinite(impulse)
    || !Number.isFinite(contactArea)
    || baseVolume < 0
    || impulse < 0
    || contactArea < 1
  ) {
    throw new RangeError("Fluid entry sound parameters must be finite and non-negative.");
  }
  const strength = impulse * contactArea;
  const response = strength / (strength + FLUID_ENTRY_SOUND_SATURATION);
  return baseVolume * (1 + FLUID_ENTRY_SOUND_MAX_GAIN * response);
}
