// Sub-level collision particles: the impact emitter and its dust companion,
// plus the per-tick contact dedup and liquid probe that decide when a contact
// spawns anything at all.
// Migrated from the collision branch of spawnBlockParticle plus
// producesDustOnImpact in TreePhysics src/render/particle/BlockParticles.ts,
// and #spawnCollisionParticles, #isLiquidParticleLocation and
// quantizeCollisionCoordinate in TreePhysics src/content/tree/contraption/Lifecycle.ts.
import {
  MolangVariableMap,
  type Dimension,
  type Vector3
} from "@minecraft/server";
import type { PhysicsCollisionAfterEvent } from "../../api/physics/PhysicsTypes.js";
import type { SubLevelBlock, SubLevelFoliageTint } from "../../sublevel/SubLevel.js";
import type { ServerSubLevel } from "../../sublevel/ServerSubLevel.js";
import { isSubLevelBlockCollidable } from "../../sublevel/system/SubLevelInteractionSystem.js";
import { blockLocationKey } from "../../util/SableVector3Utils.js";
import type { WorldBlockCache } from "../../util/LevelAccelerator.js";
import { destructParticleSuffix } from "./SubLevelBlockParticleEffects.js";
import {
  reportParticleSpawnFailure,
  resolveSubLevelBlockParticleVisual
} from "./SubLevelBlockParticles.js";

const DUST_PARTICLE_ID = "sable:sublevel_dust";
export const BLOCK_COLLIDE_PARTICLE_PREFIX = "sable:block_collide";
const IMPACT_PARTICLE_TRIGGER_SPEED = 2;
// World-space tolerance when mapping a contact point back to a sub-level block.
const SUB_LEVEL_BLOCK_LOOKUP_TOLERANCE = 1.25;
// A splash renders when the contact block or the one above it is liquid.
const LIQUID_SURFACE_PROBE_Y_OFFSETS: readonly number[] = [0, 1];

export interface SubLevelBlockCollideParticleOptions {
  readonly includeDust: boolean;
  readonly inLiquid: boolean;
}

export function spawnSubLevelBlockCollideParticle(
  dimension: Dimension,
  location: Vector3,
  block: SubLevelBlock,
  foliageTint: SubLevelFoliageTint | undefined,
  options: SubLevelBlockCollideParticleOptions
): void {
  const visual = resolveSubLevelBlockParticleVisual(block, foliageTint);
  if (!visual) return;
  const molang = new MolangVariableMap();
  const color = visual.color;
  molang.setFloat("variable.activation_flag", 1);
  molang.setFloat("variable.block_color_r", color.red);
  molang.setFloat("variable.block_color_g", color.green);
  molang.setFloat("variable.block_color_b", color.blue);
  molang.setFloat("variable.block_color_a", color.alpha);
  molang.setFloat("variable.underwater", options.inLiquid ? 1 : 0);
  if (options.includeDust && !options.inLiquid) {
    try {
      dimension.spawnParticle(DUST_PARTICLE_ID, location, molang);
    } catch (error) {
      reportParticleSpawnFailure(DUST_PARTICLE_ID, error);
      // The typed collision particles remain independent from the dust resource.
    }
  }
  const effectId = `${BLOCK_COLLIDE_PARTICLE_PREFIX}_${destructParticleSuffix(visual.texture)}`;
  try {
    dimension.spawnParticle(effectId, location, molang);
  } catch (error) {
    reportParticleSpawnFailure(effectId, error);
    // Particle availability must not affect block removal or physics.
  }
}

export function producesDustOnImpact(typeId: string): boolean {
  const name = typeId.startsWith("minecraft:") ? typeId.slice("minecraft:".length) : typeId;
  return name === "dirt"
    || name === "coarse_dirt"
    || name === "grass_block"
    || name === "podzol"
    || name === "mycelium"
    || name === "rooted_dirt"
    || name === "dirt_with_roots"
    || name === "mud"
    || name === "sand"
    || name === "red_sand"
    || name === "gravel"
    || name === "suspicious_gravel"
    || name === "stone"
    || name === "smooth_stone"
    || name === "granite"
    || name === "polished_granite"
    || name === "diorite"
    || name === "polished_diorite"
    || name === "andesite"
    || name === "polished_andesite"
    || name === "deepslate"
    || name === "cobblestone"
    || name === "mossy_cobblestone"
    || name === "calcite"
    || name === "tuff"
    || name === "blackstone"
    || name === "basalt"
    || name === "netherrack"
    || name === "crimson_nylium"
    || name === "warped_nylium"
    || name === "snow"
    || name === "snow_layer"
    || name === "snow_block"
    || name === "end_stone"
    || name.endsWith("_sandstone")
    || name.endsWith("_stone_bricks")
    || name.endsWith("_deepslate")
    || name.endsWith("_deepslate_bricks")
    || name.endsWith("_deepslate_tiles")
    || name.endsWith("_concrete_powder")
    || name === "terracotta"
    || name.endsWith("_terracotta");
}

export interface WorldCollisionHit {
  readonly locationKey: string;
  readonly typeId: string;
}

export class SubLevelCollisionParticles {
  readonly #collisionEffectKeys = new Set<string>();

  handleCollision(
    subLevel: ServerSubLevel,
    event: PhysicsCollisionAfterEvent,
    worldHit: WorldCollisionHit | undefined,
    resolvedBlock: SubLevelBlock | undefined,
    worldBlocks: WorldBlockCache
  ): void {
    if (
      event.otherBody
      || event.impactSpeed < IMPACT_PARTICLE_TRIGGER_SPEED
      || !worldHit
      || !producesDustOnImpact(worldHit.typeId)
    ) return;
    const block = resolvedBlock ?? subLevel.getBlockAtWorldPoint(event.point, SUB_LEVEL_BLOCK_LOOKUP_TOLERANCE);
    if (!block || !(block.collisionResponse !== false && isSubLevelBlockCollidable(block))) return;
    const contactKey = `${event.body.id}|${blockLocationKey(block.localLocation)}|`
      + `${worldHit.locationKey}|`
      + `${quantizeCollisionCoordinate(event.point.x)},`
      + `${quantizeCollisionCoordinate(event.point.y)},`
      + `${quantizeCollisionCoordinate(event.point.z)}`;
    if (this.#collisionEffectKeys.has(contactKey)) return;
    this.#collisionEffectKeys.add(contactKey);
    const inLiquid = this.#isLiquidParticleLocation(
      subLevel.body.dimension.dimension,
      event.point,
      worldBlocks
    );
    spawnSubLevelBlockCollideParticle(
      subLevel.body.dimension.dimension,
      event.point,
      block,
      subLevel.foliageTint,
      { includeDust: true, inLiquid }
    );
  }

  clearEffectKeys(): void {
    this.#collisionEffectKeys.clear();
  }

  #isLiquidParticleLocation(
    dimension: Dimension,
    location: Vector3,
    worldBlocks: WorldBlockCache
  ): boolean {
    const base = {
      x: Math.floor(location.x),
      y: Math.floor(location.y),
      z: Math.floor(location.z)
    };
    for (const yOffset of LIQUID_SURFACE_PROBE_Y_OFFSETS) {
      if (worldBlocks.get(dimension, {
        ...base,
        y: base.y + yOffset
      })?.isLiquid) return true;
    }
    return false;
  }
}

function quantizeCollisionCoordinate(value: number): number {
  return Math.round(value * 16);
}

