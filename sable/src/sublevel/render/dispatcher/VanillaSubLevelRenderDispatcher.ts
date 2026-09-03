import type { Entity, Vector3 } from "@minecraft/server";
import { ItemTypes } from "@minecraft/server";
import type { SubLevel, SubLevelBlock } from "../../SubLevel.js";
import {
  BLOCK_CARRIER_CAPACITY,
  BLOCK_CARRIER_ENTITY_TYPE_ID,
  BLOCK_SLOTS_PER_ENTITY,
  type BlockAssignment,
  type BlockCarrier,
  type SubLevelRenderData
} from "../SubLevelRenderData.js";
import { assertBlockRenderItems } from "../SubLevelRenderer.js";
import { VanillaChunkedSubLevelRenderData } from "../vanilla/VanillaChunkedSubLevelRenderData.js";
import {
  createBlockRenderPair,
  spawnTaggedRenderEntity
} from "../vanilla/SingleBlockSubLevelWrapper.js";
import { selectSubLevelRenderAnchor } from "../../../util/SublevelRenderOffsetHelper.js";
import type { SubLevelRenderDispatcher } from "./SubLevelRenderDispatcher.js";

export class VanillaSubLevelRenderDispatcher implements SubLevelRenderDispatcher {
  createRenderData(subLevel: SubLevel): SubLevelRenderData {
    return this.createRenderDataAtAnchor(
      subLevel,
      selectSubLevelRenderAnchor(subLevel.blocks)
    );
  }

  createRenderDataAtAnchor(subLevel: SubLevel, renderAnchor: Vector3): SubLevelRenderData {
    const blocks = subLevel.blocks;
    const tags = normalizeRenderEntityTags(subLevel.renderEntityTags);
    assertBlockRenderItems(blocks);
    const entities: Entity[] = [];
    const assignments: BlockAssignment[] = [];
    const carriers: BlockCarrier[] = [];
    try {
      const renderEntityCount = Math.ceil(blocks.length / BLOCK_SLOTS_PER_ENTITY);
      for (let start = 0; start < renderEntityCount; start += BLOCK_CARRIER_CAPACITY) {
        const carrierEntity = spawnTaggedRenderEntity(
          subLevel.dimension,
          BLOCK_CARRIER_ENTITY_TYPE_ID,
          subLevel.body.localPointToWorld(renderAnchor),
          tags
        );
        const rideable = carrierEntity.getComponent("minecraft:rideable");
        if (!rideable) throw new Error("Vanilla block carrier does not expose minecraft:rideable.");
        const carrier = { entity: carrierEntity, riderIds: [] as string[] };
        carriers.push(carrier);
        const end = Math.min(renderEntityCount, start + BLOCK_CARRIER_CAPACITY);
        for (let renderIndex = start; renderIndex < end; renderIndex++) {
          const blockIndex = renderIndex * BLOCK_SLOTS_PER_ENTITY;
          const mainhandBlock = blocks[blockIndex]!;
          const offhandBlock = blocks[blockIndex + 1];
          const entity = createBlockRenderPair(
            subLevel.dimension,
            subLevel.body,
            renderAnchor,
            mainhandBlock,
            offhandBlock,
            tags
          );
          entities.push(entity);
          assignments.push({ block: mainhandBlock, entity, slot: "mainhand" });
          if (offhandBlock) assignments.push({ block: offhandBlock, entity, slot: "offhand" });
          if (!rideable.addRider(entity)) {
            throw new Error(`Could not mount vanilla block ${entity.id} on carrier ${carrierEntity.id}.`);
          }
          carrier.riderIds.push(entity.id);
        }
      }
      return new VanillaChunkedSubLevelRenderData(
        subLevel.body,
        assignments,
        carriers,
        subLevel.onRenderEntityRemoved,
        renderAnchor
      );
    } catch (error) {
      for (const entity of entities) if (entity.isValid) entity.remove();
      for (const carrier of carriers) if (carrier.entity.isValid) carrier.entity.remove();
      throw error;
    }
  }
}

export function normalizeRenderEntityTags(value: readonly string[] | undefined): string[] {
  if (value === undefined) return [];
  if (
    !Array.isArray(value)
    || value.some(tag => (
      typeof tag !== "string"
      || tag.length === 0
      || tag.length > 255
      || /[\r\n]/.test(tag)
    ))
  ) throw new TypeError("SubLevel.renderEntityTags is invalid.");
  return [...new Set(value)];
}

/** Whether the universal one-block route can represent this block. */
export function canRenderSubLevelBlockVanilla(block: SubLevelBlock): boolean {
  return ItemTypes.get(block.itemTypeId ?? block.typeId) !== undefined;
}
