export const DEFAULT_RENDER_ENTITY_TYPE_ID = "sable:block";
export const BLOCK_OFFHAND_ITEM_OFFSET_PROPERTY = "sable:left_item_offset";
export const ADDON_BLOCK_OFFHAND_ITEM_OFFSET = 0.00;
export const MINECRAFT_BLOCK_OFFHAND_ITEM_OFFSET = 2.00;
const DEFAULT_BLOCK_ITEM_YAW = 90;
/** Create one render entity carrying up to two independently transformed block items. */
export function createBlockRenderPair(dimension, body, renderAnchor, mainhandBlock, offhandBlock, renderEntityTags) {
    const entity = spawnTaggedRenderEntity(dimension, DEFAULT_RENDER_ENTITY_TYPE_ID, body.localPointToWorld(renderAnchor), renderEntityTags);
    try {
        entity.runCommand(`replaceitem entity @s slot.weapon.mainhand 0 ${mainhandBlock.itemTypeId ?? mainhandBlock.typeId}`);
        if (offhandBlock) {
            entity.runCommand(`replaceitem entity @s slot.weapon.offhand 0 ${offhandBlock.itemTypeId ?? offhandBlock.typeId}`);
        }
        setBlockRenderTransform(entity, mainhandBlock, renderAnchor, "");
        if (offhandBlock)
            setBlockRenderTransform(entity, offhandBlock, renderAnchor, "left_");
        return entity;
    }
    catch (error) {
        if (entity.isValid)
            entity.remove();
        throw error;
    }
}
export function spawnTaggedRenderEntity(dimension, typeId, location, tags) {
    const entity = dimension.spawnEntity(typeId, location);
    try {
        for (const tag of tags) {
            if (!entity.addTag(tag)) {
                throw new Error(`Could not assign render entity tag ${tag}.`);
            }
        }
        return entity;
    }
    catch (error) {
        if (entity.isValid)
            entity.remove();
        throw error;
    }
}
function setBlockRenderTransform(entity, block, renderAnchor, prefix) {
    entity.setProperty(`sable:${prefix}local_x`, block.localLocation.x - renderAnchor.x + (block.visualOffset?.x ?? 0));
    entity.setProperty(`sable:${prefix}local_y`, block.localLocation.y - renderAnchor.y + (block.visualYOffset ?? 0) + (block.visualOffset?.y ?? 0));
    entity.setProperty(`sable:${prefix}local_z`, block.localLocation.z - renderAnchor.z + (block.visualOffset?.z ?? 0));
    entity.setProperty(`sable:${prefix}local_pitch`, block.rotation?.x ?? 0);
    entity.setProperty(`sable:${prefix}local_yaw`, block.rotation?.y ?? DEFAULT_BLOCK_ITEM_YAW);
    entity.setProperty(`sable:${prefix}local_roll`, block.rotation?.z ?? 0);
    if (prefix === "left_") {
        entity.setProperty(BLOCK_OFFHAND_ITEM_OFFSET_PROPERTY, block.typeId.startsWith("minecraft:")
            ? MINECRAFT_BLOCK_OFFHAND_ITEM_OFFSET
            : ADDON_BLOCK_OFFHAND_ITEM_OFFSET);
    }
}
