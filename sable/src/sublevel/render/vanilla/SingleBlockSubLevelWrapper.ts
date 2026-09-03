import type { Dimension, Entity, Vector3 } from "@minecraft/server";
import type {
  SubLevelBlock,
  SubLevelRenderBody
} from "../../SubLevel.js";

export const DEFAULT_RENDER_ENTITY_TYPE_ID = "sable:block";
export const BLOCK_OFFHAND_ITEM_OFFSET_PROPERTY = "sable:left_item_offset";
export const ADDON_BLOCK_OFFHAND_ITEM_OFFSET = 0.00;
export const MINECRAFT_BLOCK_OFFHAND_ITEM_OFFSET = 2.00;

/** Create one render entity carrying up to two independently transformed block items. */
export function createBlockRenderPair(
  dimension: Dimension,
  body: SubLevelRenderBody,
  renderAnchor: Vector3,
  mainhandBlock: SubLevelBlock,
  offhandBlock: SubLevelBlock | undefined,
  renderEntityTags: readonly string[]
): Entity {
  const entity = spawnTaggedRenderEntity(
    dimension,
    DEFAULT_RENDER_ENTITY_TYPE_ID,
    body.localPointToWorld(renderAnchor),
    renderEntityTags
  );
  try {
    entity.runCommand(
      `replaceitem entity @s slot.weapon.mainhand 0 ${mainhandBlock.itemTypeId ?? mainhandBlock.typeId}`
    );
    if (offhandBlock) {
      entity.runCommand(
        `replaceitem entity @s slot.weapon.offhand 0 ${offhandBlock.itemTypeId ?? offhandBlock.typeId}`
      );
    }
    setBlockRenderTransform(entity, mainhandBlock, renderAnchor, "");
    if (offhandBlock) setBlockRenderTransform(entity, offhandBlock, renderAnchor, "left_");
    return entity;
  } catch (error) {
    if (entity.isValid) entity.remove();
    throw error;
  }
}

export function spawnTaggedRenderEntity(
  dimension: Dimension,
  typeId: string,
  location: Vector3,
  tags: readonly string[]
): Entity {
  const entity = dimension.spawnEntity(typeId, location);
  try {
    for (const tag of tags) {
      if (!entity.addTag(tag)) {
        throw new Error(`Could not assign render entity tag ${tag}.`);
      }
    }
    return entity;
  } catch (error) {
    if (entity.isValid) entity.remove();
    throw error;
  }
}

function setBlockRenderTransform(
  entity: Entity,
  block: SubLevelBlock,
  renderAnchor: Vector3,
  prefix: "" | "left_"
): void {
  entity.setProperty(
    `sable:${prefix}local_x`,
    block.localLocation.x - renderAnchor.x
  );
  entity.setProperty(
    `sable:${prefix}local_y`,
    block.localLocation.y - renderAnchor.y
  );
  entity.setProperty(
    `sable:${prefix}local_z`,
    block.localLocation.z - renderAnchor.z
  );
  entity.setProperty(`sable:${prefix}local_pitch`, block.rotation?.x ?? 0);
  entity.setProperty(`sable:${prefix}local_yaw`, block.rotation?.y ?? 0);
  entity.setProperty(`sable:${prefix}local_roll`, block.rotation?.z ?? 0);
  if (prefix === "left_") {
    entity.setProperty(
      BLOCK_OFFHAND_ITEM_OFFSET_PROPERTY,
      block.typeId.startsWith("minecraft:")
        ? MINECRAFT_BLOCK_OFFHAND_ITEM_OFFSET
        : ADDON_BLOCK_OFFHAND_ITEM_OFFSET
    );
  }
}
