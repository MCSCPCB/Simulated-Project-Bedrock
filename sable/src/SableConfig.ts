// Persisted physics settings: the simulation performance level, the entity
// collision level, and the two player-carrying switches, stored as world
// dynamic properties. Migrated from TreePhysics src/config/Settings.ts, keeping
// only the four physics items.
import { world } from "@minecraft/server";

const PLAYER_CARRYING_DEFAULT = true;
const SMOOTH_PLAYER_CARRYING_DEFAULT = true;
export const SABLE_PHYSICS_PERFORMANCE_LOW = 0;
export const SABLE_PHYSICS_PERFORMANCE_HIGH = 1;
const PHYSICS_PERFORMANCE_DEFAULT = SABLE_PHYSICS_PERFORMANCE_LOW;
export const SUB_LEVEL_COLLISION_LOW = 0;
export const SUB_LEVEL_COLLISION_HIGH = 1;
export const SUB_LEVEL_COLLISION_DISABLED = 2;
const SUB_LEVEL_COLLISION_DEFAULT = SUB_LEVEL_COLLISION_LOW;

// Persisted world dynamic-property keys.
const PLAYER_CARRYING_PROPERTY = "sable:player_carrying";
const SMOOTH_PLAYER_CARRYING_PROPERTY = "sable:smooth_player_carrying";
const PHYSICS_PERFORMANCE_PROPERTY = "sable:physics_performance";
const SUB_LEVEL_COLLISION_PROPERTY = "sable:obb_collision";

export type SablePhysicsPerformanceLevel =
  | typeof SABLE_PHYSICS_PERFORMANCE_LOW
  | typeof SABLE_PHYSICS_PERFORMANCE_HIGH;

export type SubLevelCollisionLevel =
  | typeof SUB_LEVEL_COLLISION_LOW
  | typeof SUB_LEVEL_COLLISION_HIGH
  | typeof SUB_LEVEL_COLLISION_DISABLED;

export interface SablePhysicsSettings {
  readonly obbCollisionLevel: SubLevelCollisionLevel;
  readonly playerCarryingEnabled: boolean;
  readonly physicsPerformanceLevel: SablePhysicsPerformanceLevel;
  readonly smoothPlayerCarryingEnabled: boolean;
}

let loaded = false;
let settings: SablePhysicsSettings = {
  obbCollisionLevel: SUB_LEVEL_COLLISION_DEFAULT,
  playerCarryingEnabled: PLAYER_CARRYING_DEFAULT,
  physicsPerformanceLevel: PHYSICS_PERFORMANCE_DEFAULT,
  smoothPlayerCarryingEnabled: SMOOTH_PLAYER_CARRYING_DEFAULT
};

export function getSablePhysicsSettings(): SablePhysicsSettings {
  loadSablePhysicsSettings();
  return settings;
}

export function getSablePhysicsPerformanceLevel(): SablePhysicsPerformanceLevel {
  return getSablePhysicsSettings().physicsPerformanceLevel;
}

export function getSubLevelCollisionLevel(): SubLevelCollisionLevel {
  return getSablePhysicsSettings().obbCollisionLevel;
}

export function shouldCarryPlayers(): boolean {
  return getSablePhysicsSettings().playerCarryingEnabled;
}

export function shouldUseSmoothPlayerCarrying(): boolean {
  return getSablePhysicsSettings().smoothPlayerCarryingEnabled;
}

export function updateSablePhysicsSettings(next: SablePhysicsSettings): void {
  settings = normalizeSablePhysicsSettings(next);
  loaded = true;
}

export function saveSablePhysicsSettings(next: SablePhysicsSettings): void {
  const normalized = normalizeSablePhysicsSettings(next);
  try {
    world.setDynamicProperty(SUB_LEVEL_COLLISION_PROPERTY, normalized.obbCollisionLevel);
    world.setDynamicProperty(PLAYER_CARRYING_PROPERTY, normalized.playerCarryingEnabled);
    world.setDynamicProperty(
      PHYSICS_PERFORMANCE_PROPERTY,
      normalized.physicsPerformanceLevel
    );
    world.setDynamicProperty(
      SMOOTH_PLAYER_CARRYING_PROPERTY,
      normalized.smoothPlayerCarryingEnabled
    );
    settings = normalized;
    loaded = true;
  } catch {
    // Keep the previous runtime settings if dynamic properties are unavailable.
  }
}

function loadSablePhysicsSettings(): void {
  if (loaded) return;
  try {
    const next: SablePhysicsSettings = {
      obbCollisionLevel: normalizeSubLevelCollisionLevel(
        world.getDynamicProperty(SUB_LEVEL_COLLISION_PROPERTY)
      ),
      playerCarryingEnabled: normalizeBoolean(
        world.getDynamicProperty(PLAYER_CARRYING_PROPERTY),
        PLAYER_CARRYING_DEFAULT
      ),
      physicsPerformanceLevel: normalizePhysicsPerformanceLevel(
        world.getDynamicProperty(PHYSICS_PERFORMANCE_PROPERTY)
      ),
      smoothPlayerCarryingEnabled: normalizeBoolean(
        world.getDynamicProperty(SMOOTH_PLAYER_CARRYING_PROPERTY),
        SMOOTH_PLAYER_CARRYING_DEFAULT
      )
    };
    settings = next;
    loaded = true;
  } catch {
    // Dynamic properties are unavailable during early execution. The next tick retries.
  }
}

function normalizeBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

export function normalizePhysicsPerformanceLevel(value: unknown): SablePhysicsPerformanceLevel {
  return value === SABLE_PHYSICS_PERFORMANCE_HIGH
    ? SABLE_PHYSICS_PERFORMANCE_HIGH
    : PHYSICS_PERFORMANCE_DEFAULT;
}

export function normalizeSubLevelCollisionLevel(value: unknown): SubLevelCollisionLevel {
  if (value === SUB_LEVEL_COLLISION_DISABLED) return SUB_LEVEL_COLLISION_DISABLED;
  return value === SUB_LEVEL_COLLISION_HIGH
    ? SUB_LEVEL_COLLISION_HIGH
    : SUB_LEVEL_COLLISION_DEFAULT;
}

function normalizeSablePhysicsSettings(next: SablePhysicsSettings): SablePhysicsSettings {
  return {
    obbCollisionLevel: normalizeSubLevelCollisionLevel(next.obbCollisionLevel),
    playerCarryingEnabled: next.playerCarryingEnabled === true,
    physicsPerformanceLevel: normalizePhysicsPerformanceLevel(next.physicsPerformanceLevel),
    smoothPlayerCarryingEnabled: next.smoothPlayerCarryingEnabled === true
  };
}
