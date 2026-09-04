// Interaction-layer static resources: the outline/crack/chest/interaction
// proxy definitions migrated byte-for-byte (namespace renamed) from the source
// pack, plus the destruct particle definitions generated per registered model
// texture. Runtime effect ids come from the shared visual derivation module so
// the generated particles always match what the spawner requests.
import { readFile } from "node:fs/promises";
import {
  ADDON_SUBSTITUTE_PARTICLE_TEXTURES,
  blockDestructParticleEffectId,
  destructParticleSuffix,
  destructParticleTexture
} from "../../src/content/particle/SubLevelBlockParticleEffects.ts";
import type { FancySubLevelModelDescription } from "../../src/sublevel/render/fancy/model/FancySubLevelModel.ts";
import type { CompiledModel } from "./registry.ts";

type JsonObject = Record<string, unknown>;

// Chest particles sample the 64x64 chest entity atlas; every other texture is a
// plain 16x16 block texture sampled with a random 4x4 window.
const CHEST_PARTICLE_ATLAS = {
  height: 64,
  u: "14+variable.particle_random_1*10",
  v: "33+variable.particle_random_2*6",
  width: 64
} as const;

const FUNCTIONAL_RESOURCE_TARGETS: Readonly<Record<string, string>> = {
  "SableBP/entities/sable/sublevel/functional_entities/block_outline.json": "bp_block_outline.json",
  "SableBP/entities/sable/sublevel/functional_entities/block_crack.json": "bp_block_crack.json",
  "SableBP/entities/sable/sublevel/block_entities/chest.json": "bp_chest.json",
  "SableBP/blocks/sable/sublevel/functional_blocks/interaction_target.json": "bp_interaction_target.json",
  "SableRP/entity/sable/sublevel/functional_entities/block_outline.json": "rp_block_outline_entity.json",
  "SableRP/entity/sable/sublevel/functional_entities/block_crack.json": "rp_block_crack_entity.json",
  "SableRP/models/entity/sable/sublevel/functional_entities/block_outline.geo.json": "rp_block_outline_geo.json",
  "SableRP/models/entity/sable/sublevel/functional_entities/block_crack.geo.json": "rp_block_crack_geo.json",
  "SableRP/models/blocks/sable/sublevel/functional_blocks/interaction_target.geo.json": "rp_interaction_target_geo.json",
  "SableRP/animations/sable/sublevel/functional_entities/block_outline.animation.json": "rp_block_outline_animation.json",
  "SableRP/animations/sable/sublevel/functional_entities/block_crack.animation.json": "rp_block_crack_animation.json",
  "SableRP/render_controllers/sable/sublevel/functional_entities/block_outline.render_controllers.json": "rp_block_outline_rc.json",
  "SableRP/render_controllers/sable/sublevel/functional_entities/block_crack.render_controllers.json": "rp_block_crack_rc.json"
};

export async function collectFunctionalResourceTargets(
  targets: Map<string, string | Buffer>
): Promise<void> {
  for (const [packPath, assetName] of Object.entries(FUNCTIONAL_RESOURCE_TARGETS)) {
    targets.set(
      packPath,
      await readFile(new URL(`../../src/data/reference/functional-resources/${assetName}`, import.meta.url), "utf8")
    );
  }
}

interface DestructParticleVisual {
  alpha: boolean;
  atlas?: typeof CHEST_PARTICLE_ATLAS;
  texture: string;
  tinted: boolean;
}

/** One destruct particle per distinct representative texture across all models. */
export function collectDestructParticleTargets(
  models: readonly CompiledModel[],
  targets: Map<string, string | Buffer>
): void {
  const visuals = new Map<string, DestructParticleVisual>();
  for (const model of models) {
    const description = model.model as unknown as FancySubLevelModelDescription;
    const texture = destructParticleTexture(description);
    const existing = visuals.get(texture);
    const visual: DestructParticleVisual = existing ?? {
      alpha: false,
      texture,
      tinted: false
    };
    visual.alpha ||= model.material === "alpha_test" || model.material === "alpha_test_tint";
    visual.tinted ||= model.tint !== undefined;
    if (description.type === "chest") {
      // Chest particles sample an opaque region of the entity atlas; the cutout
      // material the chest model renders with does not apply to its quads.
      visual.atlas = CHEST_PARTICLE_ATLAS;
      visual.alpha = false;
    }
    visuals.set(texture, visual);
  }
  // Substitute particles for custom blocks are always tinted, even though the
  // vanilla registrations sharing these textures are not.
  for (const texture of ADDON_SUBSTITUTE_PARTICLE_TEXTURES) {
    const visual = visuals.get(texture) ?? { alpha: false, texture, tinted: false };
    visual.tinted = true;
    visuals.set(texture, visual);
  }
  for (const visual of visuals.values()) {
    const suffix = destructParticleSuffix(visual.texture);
    targets.set(
      `SableRP/particles/sable/sublevel/block_destruct/block_destruct_${suffix}.particle.json`,
      `${JSON.stringify(destructParticle(visual))}\n`
    );
  }
}

function destructParticle(visual: DestructParticleVisual): JsonObject {
  const components: JsonObject = {
    "minecraft:emitter_rate_instant": {
      num_particles: "variable.emitter_particles_count"
    },
    "minecraft:emitter_lifetime_expression": {
      activation_expression: "v.activation_flag ?? 0",
      expiration_expression: 1
    },
    "minecraft:emitter_shape_point": {
      offset: [
        "Math.random(-(v.emitter_radius_x??v.emitter_radius),v.emitter_radius_x??v.emitter_radius)",
        "Math.random(-(v.emitter_radius_y??v.emitter_radius),v.emitter_radius_y??v.emitter_radius)",
        "Math.random(-(v.emitter_radius_z??v.emitter_radius),v.emitter_radius_z??v.emitter_radius)"
      ],
      direction: [
        "(v.emitter_direction_x??0)+Math.random(-(v.emitter_direction_random_x??1),v.emitter_direction_random_x??1)",
        "(v.emitter_direction_y??1)+Math.random(-(v.emitter_direction_random_y??0),v.emitter_direction_random_y??0)",
        "(v.emitter_direction_z??0)+Math.random(-(v.emitter_direction_random_z??1),v.emitter_direction_random_z??1)"
      ]
    },
    "minecraft:particle_lifetime_expression": {
      max_lifetime: "0.2f/(Math.random(0.0,1.0)*0.9f+0.1f)"
    },
    "minecraft:particle_initial_speed":
      "Math.random(v.emitter_speed_min??0,v.emitter_speed_max??4)*variable.velocity_scalar",
    "minecraft:particle_motion_dynamic": {
      linear_acceleration: [0, -9.8, 0],
      linear_drag_coefficient: 0.5
    },
    "minecraft:particle_appearance_billboard": {
      size: [
        "variable.particle_random_1*0.0375+0.0375",
        "variable.particle_random_1*0.0375+0.0375"
      ],
      facing_camera_mode: "lookat_xyz",
      uv: {
        texture_width: visual.atlas?.width ?? 16,
        texture_height: visual.atlas?.height ?? 16,
        uv: [
          visual.atlas?.u ?? "variable.particle_random_1*12",
          visual.atlas?.v ?? "variable.particle_random_2*12"
        ],
        uv_size: [4, 4]
      }
    },
    "minecraft:particle_motion_collision": {
      collision_drag: 5,
      coefficient_of_restitution: 0.1,
      collision_radius: 0.1
    },
    "minecraft:particle_appearance_lighting": {}
  };
  if (visual.tinted) {
    components["minecraft:particle_appearance_tinting"] = {
      color: [
        "Math.lerp(1,Math.clamp(v.block_color_r,0,1),Math.clamp(v.block_color_a,0,1))",
        "Math.lerp(1,Math.clamp(v.block_color_g,0,1),Math.clamp(v.block_color_a,0,1))",
        "Math.lerp(1,Math.clamp(v.block_color_b,0,1),Math.clamp(v.block_color_a,0,1))",
        1
      ]
    };
  }
  return {
    format_version: "1.10.0",
    particle_effect: {
      description: {
        identifier: blockDestructParticleEffectId(visual.texture),
        basic_render_parameters: {
          material: visual.alpha ? "particles_alpha" : "particles_opaque",
          texture: visual.texture
        }
      },
      components
    }
  };
}
