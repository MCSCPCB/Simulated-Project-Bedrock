const BLOCK_DESTRUCT_PARTICLE_PREFIX = "sable:block_destruct";
const ADDON_BARK_PARTICLE_TEXTURE = "textures/blocks/pale_oak_log_side";
const ADDON_STRIPPED_PARTICLE_TEXTURE = "textures/blocks/stripped_pale_oak_log_side";
const ADDON_LEAF_PARTICLE_TEXTURE = "textures/blocks/leaves_oak";
const ADDON_SUBSTITUTE_PARTICLE_TEXTURES = [
  ADDON_BARK_PARTICLE_TEXTURE,
  ADDON_STRIPPED_PARTICLE_TEXTURE,
  ADDON_LEAF_PARTICLE_TEXTURE
];
function destructParticleTexture(description) {
  switch (description.type) {
    case "full_block":
      return description.textures.north;
    case "pillar":
    case "creaking_heart":
      return description.textures.side;
    case "chest":
      return description.texture;
    case "bee_nest":
      return description.textures.side;
    case "mangrove_roots":
      return description.textures.side;
    default:
      return description.texture;
  }
}
function destructParticleSuffix(texture) {
  const separator = texture.lastIndexOf("/");
  return separator >= 0 ? texture.slice(separator + 1) : texture;
}
function blockDestructParticleEffectId(texture) {
  return `${BLOCK_DESTRUCT_PARTICLE_PREFIX}_${destructParticleSuffix(texture)}`;
}
export {
  ADDON_BARK_PARTICLE_TEXTURE,
  ADDON_LEAF_PARTICLE_TEXTURE,
  ADDON_STRIPPED_PARTICLE_TEXTURE,
  ADDON_SUBSTITUTE_PARTICLE_TEXTURES,
  BLOCK_DESTRUCT_PARTICLE_PREFIX,
  blockDestructParticleEffectId,
  destructParticleSuffix,
  destructParticleTexture
};
