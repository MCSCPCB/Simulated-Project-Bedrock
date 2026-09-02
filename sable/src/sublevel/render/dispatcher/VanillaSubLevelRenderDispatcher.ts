import type { Entity } from "@minecraft/server";
import type { SubLevel } from "../../SubLevel.js";
import {
  BLOCK_CARRIER_CAPACITY,
  BLOCK_CARRIER_ENTITY_TYPE_ID,
  BLOCK_SLOTS_PER_ENTITY,
  type BlockAssignment,
  type BlockCarrier,
  type SubLevelRenderData
} from "../SubLevelRenderData.js";
import { assertBlockVisualItems } from "../SubLevelRenderer.js";
import { VanillaChunkedSubLevelRenderData } from "../vanilla/VanillaChunkedSubLevelRenderData.js";
import {
  createBlockVisualPair,
  spawnTaggedVisualEntity
} from "../vanilla/SingleBlockSubLevelWrapper.js";
import { selectSubLevelVisualAnchor } from "../../../util/SublevelRenderOffsetHelper.js";
import type { SubLevelRenderDispatcher } from "./SubLevelRenderDispatcher.js";

export class VanillaSubLevelRenderDispatcher implements SubLevelRenderDispatcher {
  createRenderData(subLevel: SubLevel): SubLevelRenderData {
    const blocks = subLevel.blocks;
    const visualEntityTags = normalizeVisualEntityTags(subLevel.visualEntityTags);
    const visualAnchor = selectSubLevelVisualAnchor(blocks);
    assertBlockVisualItems(blocks);
    const entities: Entity[] = [];
    const assignments: BlockAssignment[] = [];
    const carriers: BlockCarrier[] = [];
    try {
      const visualEntityCount = Math.ceil(blocks.length / BLOCK_SLOTS_PER_ENTITY);
      for (
        let start = 0;
        start < visualEntityCount;
        start += BLOCK_CARRIER_CAPACITY
      ) {
        const carrierEntity = spawnTaggedVisualEntity(
          subLevel.dimension,
          BLOCK_CARRIER_ENTITY_TYPE_ID,
          subLevel.body.localPointToWorld(visualAnchor),
          visualEntityTags
        );
        const rideable = carrierEntity.getComponent("minecraft:rideable");
        if (!rideable) {
          throw new Error("Per-block visual carrier does not expose minecraft:rideable.");
        }
        const carrier = { entity: carrierEntity, riderIds: [] as string[] };
        carriers.push(carrier);
        const end = Math.min(
          visualEntityCount,
          start + BLOCK_CARRIER_CAPACITY
        );
        for (let visualIndex = start; visualIndex < end; visualIndex++) {
          const blockIndex = visualIndex * BLOCK_SLOTS_PER_ENTITY;
          const mainhandBlock = blocks[blockIndex]!;
          const offhandBlock = blocks[blockIndex + 1];
          const entity = createBlockVisualPair(
            subLevel.dimension,
            subLevel.body,
            visualAnchor,
            mainhandBlock,
            offhandBlock,
            visualEntityTags
          );
          entities.push(entity);
          assignments.push({ block: mainhandBlock, entity, slot: "mainhand" });
          if (offhandBlock) {
            assignments.push({ block: offhandBlock, entity, slot: "offhand" });
          }
          if (!rideable.addRider(entity)) {
            throw new Error(
              `Could not mount block visual ${entity.id} on carrier ${carrierEntity.id}.`
            );
          }
          carrier.riderIds.push(entity.id);
        }
      }
      return new VanillaChunkedSubLevelRenderData(
        subLevel.body,
        assignments,
        carriers,
        subLevel.onVisualEntityRemoved,
        visualAnchor
      );
    } catch (error) {
      for (const entity of entities) {
        if (entity.isValid) entity.remove();
      }
      for (const carrier of carriers) {
        if (carrier.entity.isValid) carrier.entity.remove();
      }
      throw error;
    }
  }
}

function normalizeVisualEntityTags(value: readonly string[] | undefined): string[] {
  if (value === undefined) return [];
  if (
    !Array.isArray(value)
    || value.some(tag => (
      typeof tag !== "string"
      || tag.length === 0
      || tag.length > 255
      || /[\r\n]/.test(tag)
    ))
  ) {
    throw new TypeError("SubLevel.visualEntityTags is invalid.");
  }
  return [...new Set(value)];
}
