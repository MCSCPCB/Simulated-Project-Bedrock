// Pure destruct-particle visual derivation shared by the runtime spawner and
// the resource generator: both sides derive the same representative texture and
// effect id from a model description, so they agree by construction. This
// module must stay free of @minecraft/server value imports so the build tool
// can execute it under Node.
import type { FancySubLevelModelDescription } from "../../sublevel/render/fancy/model/FancySubLevelModel.js";

export const BLOCK_DESTRUCT_PARTICLE_PREFIX = "sable:block_destruct";

// Custom (non-vanilla) blocks emit substitute particles: their own textures are
// unknown to the particle atlas, so a representative vanilla texture is tinted
// by the block's map_color instead.
export const ADDON_BARK_PARTICLE_TEXTURE = "textures/blocks/pale_oak_log_side";
export const ADDON_STRIPPED_PARTICLE_TEXTURE = "textures/blocks/stripped_pale_oak_log_side";
export const ADDON_LEAF_PARTICLE_TEXTURE = "textures/blocks/leaves_oak";
export const ADDON_SUBSTITUTE_PARTICLE_TEXTURES: readonly string[] = [
  ADDON_BARK_PARTICLE_TEXTURE,
  ADDON_STRIPPED_PARTICLE_TEXTURE,
  ADDON_LEAF_PARTICLE_TEXTURE
];

/**
 * The representative texture whose generated destruct particle a model emits.
 * The build tool emits one particle definition per distinct texture returned
 * here, so runtime and resources agree by construction.
 */
export function destructParticleTexture(
  description: FancySubLevelModelDescription
): string {
  switch (description.type) {
    case "full_block": return description.textures.north;
    case "pillar":
    case "creaking_heart": return description.textures.side;
    case "chest": return description.texture;
    case "bee_nest": return description.textures.side;
    case "mangrove_roots": return description.textures.side;
    default: return description.texture;
  }
}

/** Effect-id suffix for a representative texture: its path basename. */
export function destructParticleSuffix(texture: string): string {
  const separator = texture.lastIndexOf("/");
  return separator >= 0 ? texture.slice(separator + 1) : texture;
}

export function blockDestructParticleEffectId(texture: string): string {
  return `${BLOCK_DESTRUCT_PARTICLE_PREFIX}_${destructParticleSuffix(texture)}`;
}
