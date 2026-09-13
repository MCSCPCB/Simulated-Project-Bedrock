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
} from "../../src/content/particle/SubLevelBlockParticleEffects.js";
import { BLOCK_COLLIDE_PARTICLE_PREFIX } from "../../src/content/particle/SubLevelCollisionParticles.js";
import type { FancySubLevelModelDescription } from "../../src/sublevel/render/fancy/model/FancySubLevelModel.js";
import type { CompiledModel } from "./registry.js";

type JsonObject = Record<string, unknown>;

// Chest particles sample the chest entity texture; flipbook particles sample
// the first 16x16 frame. Every particle uses a random 4x4 window.
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
  "SableBP/entities/sable/sublevel/functional_entities/block_collider.json": "bp_block_collider.json",
  "SableBP/entities/sable/sublevel/functional_entities/sublevel_mount.json": "bp_sublevel_mount.json",
  "SableRP/entity/sable/sublevel/functional_entities/block_outline.json": "rp_block_outline_entity.json",
  "SableRP/entity/sable/sublevel/functional_entities/block_crack.json": "rp_block_crack_entity.json",
  "SableRP/models/entity/sable/sublevel/functional_entities/block_outline.geo.json": "rp_block_outline_geo.json",
  "SableRP/models/entity/sable/sublevel/functional_entities/block_crack.geo.json": "rp_block_crack_geo.json",
  "SableRP/models/blocks/sable/sublevel/functional_blocks/interaction_target.geo.json": "rp_interaction_target_geo.json",
  "SableRP/animations/sable/sublevel/functional_entities/block_outline.animation.json": "rp_block_outline_animation.json",
  "SableRP/animations/sable/sublevel/functional_entities/block_crack.animation.json": "rp_block_crack_animation.json",
  "SableRP/animations/sable/sublevel/player/sublevel_mount.animation.json": "rp_player_sublevel_mount_animation.json",
  "SableRP/animation_controllers/player.animation_controllers.json": "rp_player_animation_controllers.json",
  "SableRP/particles/sable/sublevel/sublevel_dust.particle.json": "rp_particle_sublevel_dust.json",
  "SableRP/particles/sable/sublevel/sublevel_dust_entry.particle.json": "rp_particle_sublevel_dust_entry.json",
  "SableRP/particles/sable/sublevel/sublevel_splash.particle.json": "rp_particle_sublevel_splash.json",
  "SableRP/particles/sable/sublevel/sublevel_splash_entry.particle.json": "rp_particle_sublevel_splash_entry.json",
  "SableRP/particles/sable/sublevel/sublevel_splash_impulse.particle.json": "rp_particle_sublevel_splash_impulse.json",
  "SableRP/particles/sable/sublevel/sublevel_bubbles.particle.json": "rp_particle_sublevel_bubbles.json",
  "SableRP/particles/sable/sublevel/sublevel_bubbles_impulse.particle.json": "rp_particle_sublevel_bubbles_impulse.json",
  "SableRP/particles/sable/sublevel/sublevel_lava_splash.particle.json": "rp_particle_sublevel_lava_splash.json",
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
  atlas?: { readonly width: number; readonly height: number; readonly u: string; readonly v: string };
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
    visual.alpha ||= model.material === "alpha_test"
      || model.material === "alpha_test_emissive"
      || model.material === "alpha_test_tint"
      || model.material === "blend"
      || model.material === "translucent"
      || model.material === "redstone_torch_emissive";
    visual.tinted ||= model.tint !== undefined && !model.grassTint;
    if (model.flipbook && (!model.flipbook.textures || model.flipbook.textures.includes(texture))) {
      visual.atlas = {
        width: model.flipbook.axis === "u" ? 16 * model.flipbook.frameCount : 16,
        height: model.flipbook.axis === "v" ? 16 * model.flipbook.frameCount : 16,
        u: "variable.particle_random_1*12",
        v: "variable.particle_random_2*12"
      };
    }
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

/** One collide particle per distinct block visual texture, routing typed emitters. */
export function collectCollideParticleTargets(
  models: readonly CompiledModel[],
  targets: Map<string, string | Buffer>
): void {
  const visuals = new Map<string, { texture: string; material: string; tinted: boolean }>();
  for (const model of models) {
    const description = model.model as unknown as FancySubLevelModelDescription;
    const texture = destructParticleTexture(description);
    const existing = visuals.get(texture);
    if (!existing) {
      const material = (model.material === "alpha_test" || model.material === "alpha_test_emissive" || model.material === "alpha_test_tint" || model.material === "blend" || model.material === "translucent") ? "particles_alpha" : "particles_opaque";
      const tinted = (model.tint !== undefined && !model.grassTint) || (description.type === "full_block" && description.textures.north === "textures/blocks/leaves_oak");
      visuals.set(texture, { texture, material, tinted });
    }
  }
  const collideParticles: { identifier: string; texture: string; material: string; tinted: boolean }[] = [];
  for (const visual of visuals.values()) {
    const suffix = destructParticleSuffix(visual.texture);
    const identifier = `${BLOCK_COLLIDE_PARTICLE_PREFIX}_${suffix}`;
    collideParticles.push({ identifier, texture: visual.texture, material: visual.material, tinted: visual.tinted });
    targets.set(
      `SableRP/particles/sable/sublevel/block_collide/block_collide_${suffix}.particle.json`,
      `${JSON.stringify(collideParticle(visual))}\n`
    );
  }
  targets.set(
    "SableRP/particles/sable/sublevel/block_collide.particle.json",
    `${JSON.stringify(collideRouterParticle(collideParticles))}\n`
  );
}

function collideParticle(visual: { texture: string; material: string; tinted: boolean }): JsonObject {
  const components: JsonObject = {
    "minecraft:emitter_local_space": {
      position: true,
      rotation: false
    },
    "minecraft:emitter_rate_instant": {
      num_particles: "Math.random(6,12)"
    },
    "minecraft:emitter_lifetime_expression": {
      activation_expression: "v.activation_flag ?? 0",
      expiration_expression: 1
    },
    "minecraft:emitter_shape_point": {
      offset: ["Math.random(-0.45,0.45)", 0, "Math.random(-0.45,0.45)"],
      direction: ["Math.random(-1,1)", 1, "Math.random(-1,1)"]
    },
    "minecraft:particle_lifetime_expression": {
      max_lifetime: "0.2f/(Math.random(0.0,1.0)*0.9f+0.1f)"
    },
    "minecraft:particle_initial_speed": "Math.random(2,4)",
    "minecraft:particle_motion_dynamic": {
      linear_acceleration: [0, "v.underwater > 0 ? 1.2 : -9.8", 0],
      linear_drag_coefficient: "v.underwater > 0 ? 2.5 : 0.5"
    },
    "minecraft:particle_appearance_billboard": {
      size: ["variable.particle_random_1*0.03+0.03", "variable.particle_random_1*0.03+0.03"],
      facing_camera_mode: "lookat_xyz",
      uv: {
        texture_width: visual.texture === "textures/entity/chest/normal" ? 64 : 16,
        texture_height: visual.texture === "textures/entity/chest/normal" ? 64 : 16,
        uv: visual.texture === "textures/entity/chest/normal"
          ? ["14+variable.particle_random_1*10", "33+variable.particle_random_2*6"]
          : ["variable.particle_random_1*12", "variable.particle_random_2*12"],
        uv_size: [4, 4]
      }
    },
    "minecraft:particle_motion_collision": {
      collision_drag: 8,
      coefficient_of_restitution: 0.2,
      collision_radius: 0.01
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
        identifier: `${BLOCK_COLLIDE_PARTICLE_PREFIX}_${destructParticleSuffix(visual.texture)}`,
        basic_render_parameters: {
          material: visual.material,
          texture: visual.texture
        }
      },
      components
    }
  };
}

function collideRouterParticle(particles: readonly { identifier: string; texture: string; material: string; tinted: boolean }[]): JsonObject {
  const sequence: JsonObject[] = [
    { expression: "t.block_type_id=v.block_type_id;t.block_color_r=v.block_color_r;t.block_color_g=v.block_color_g;t.block_color_b=v.block_color_b;t.block_color_a=v.block_color_a;t.underwater=v.underwater;" }
  ];
  particles.forEach((particle, index) => {
    sequence.push({
      particle_effect: {
        effect: particle.identifier,
        type: "emitter",
        pre_effect_expression: `v.activation_flag=t.block_type_id==${index + 1};v.underwater=t.underwater;v.block_color_r=t.block_color_r;v.block_color_g=t.block_color_g;v.block_color_b=t.block_color_b;v.block_color_a=t.block_color_a;`
      }
    });
  });
  return {
    format_version: "1.10.0",
    particle_effect: {
      description: {
        identifier: BLOCK_COLLIDE_PARTICLE_PREFIX,
        basic_render_parameters: {
          material: "particles_alpha",
          texture: "textures/particle/particles"
        }
      },
      events: {
        route_block_slide: {
          sequence
        }
      },
      components: {
        "minecraft:emitter_rate_instant": {
          num_particles: 0
        },
        "minecraft:emitter_lifetime_once": {},
        "minecraft:emitter_lifetime_events": {
          creation_event: "route_block_slide"
        },
        "minecraft:emitter_shape_point": {},
        "minecraft:particle_lifetime_expression": {
          max_lifetime: 1
        },
        "minecraft:particle_appearance_billboard": {
          size: [0, 0]
        }
      }
    }
  };
}
