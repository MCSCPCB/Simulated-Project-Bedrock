import { BlockPermutation, system, world } from "@minecraft/server";
import { sableInteractionSystem } from "./sable/Sable.js";
import { FancySubLevelModelRenderer } from "./sable/sublevel/render/fancy/model/FancySubLevelModelRenderer.js";
import { packFancySubLevelModels } from "./sable/sublevel/render/fancy/model/FancySubLevelModelLayout.js";
import { resolveFancySubLevelBlock } from "./sable/sublevel/render/fancy/model/FancySubLevelModelRegistry.js";
import { DEFAULT_SUBLEVEL_FOLIAGE_TINT } from "./sable/sublevel/render/fancy/model/FancySubLevelTintCodec.js";
import { selectSubLevelRenderAnchor } from "./sable/util/SublevelRenderOffsetHelper.js";

const probes = new Map();

export function clearRotationProbe(playerId) {
  const rows = probes.get(playerId) ?? [];
  probes.delete(playerId);
  for (const row of rows) {
    row.active = false;
    row.handle?.unregister();
    row.renderer?.remove();
  }
}

export function createRotationProbe(player) {
  clearRotationProbe(player.id);
  const cases = [
    ...["y", "x", "z"].map(pillar_axis => ["minecraft:oak_log", { pillar_axis }]),
    ...["north", "east", "south", "west"].map(direction => [
      "minecraft:chest", { "minecraft:cardinal_direction": direction }
    ])
  ];
  const blocks = cases.map(([typeId, states], index) => ({
    typeId,
    localLocation: { x: index * 2, y: 0, z: 0 },
    states: BlockPermutation.resolve(typeId, states).getAllStates()
  }));
  const resolved = blocks.map(resolveFancySubLevelBlock);
  if (resolved.some(block => !block)) throw new Error("Rotation probe models are unavailable.");
  const origin = {
    x: Math.floor(player.location.x) - 6,
    y: Math.floor(player.location.y) + 2,
    z: Math.floor(player.location.z) + 4
  };
  for (const offset of [0, 4]) for (const block of blocks) {
    const target = player.dimension.getBlock({
      x: origin.x + block.localLocation.x, y: origin.y, z: origin.z + offset
    });
    if (!target?.isAir) throw new Error("Move to an open area before creating the rotation probe.");
  }
  const rows = [];
  probes.set(player.id, rows);
  try {
    for (const pooled of [true, false]) {
      const rowOrigin = { ...origin, z: origin.z + (pooled ? 0 : 4) };
      const packing = packFancySubLevelModels(resolved.map(block => pooled ? block : {
        ...block, model: { ...block.model, pool: undefined }
      }));
      if (packing.unsupported.length || packing.models.some(model => model.format === "pool") !== pooled) {
        throw new Error("Rotation probe did not select the requested render paths.");
      }
      const row = { active: true, origin: rowOrigin, packing };
      rows.push(row);
      const body = {
        get isValid() { return row.active; },
        getRotation: () => ({ x: 0, y: 0, z: 0 }),
        localPointToWorld: local => ({
          x: rowOrigin.x + local.x + 0.5,
          y: rowOrigin.y + local.y + 0.5,
          z: rowOrigin.z + local.z + 0.5
        })
      };
      row.renderer = new FancySubLevelModelRenderer(
        body, packing.models,
        (typeId, location) => player.dimension.spawnEntity(typeId, location),
        DEFAULT_SUBLEVEL_FOLIAGE_TINT, undefined, selectSubLevelRenderAnchor(blocks), undefined
      );
      row.handle = sableInteractionSystem.register({ body, blocks, dimension: player.dimension }, {
        renderData: row.renderer,
        supportsBlockPlacement: false,
        worldPointToLocal: point => ({
          x: point.x - rowOrigin.x - 0.5,
          y: point.y - rowOrigin.y - 0.5,
          z: point.z - rowOrigin.z - 0.5
        })
      });
      row.renderer.sync(true);
      system.run(() => {
        if (!row.active) return;
        row.renderer.sync(true);
        row.renderer.releaseInitialPose();
      });
    }
    return rows;
  } catch (error) {
    clearRotationProbe(player.id);
    throw error;
  }
}

system.afterEvents.scriptEventReceive.subscribe(event => {
  if (event.id !== "sable:rotation_probe") return;
  const player = event.sourceEntity;
  if (player?.typeId !== "minecraft:player") return;
  try {
    if (event.message.trim() === "clear") {
      clearRotationProbe(player.id);
      player.sendMessage("Rotation probe cleared.");
      return;
    }
    const rows = createRotationProbe(player);
    for (const [index, row] of rows.entries()) {
      const { x, y, z } = row.origin;
      const label = index === 0 ? "POOLED" : "SEPARATE";
      const paths = row.packing.models.map(model => model.entityTypeId).join(", ");
      player.sendMessage(`${label}: ${x}, ${y}, ${z}; +X: log Y/X/Z, chest N/E/S/W.`);
      console.warn(`[rotation_probe] ${label}: ${paths}`);
    }
  } catch (error) {
    player.sendMessage(`Rotation probe failed: ${error instanceof Error ? error.message : String(error)}`);
  }
});

world.beforeEvents.playerLeave.subscribe(event => {
  const playerId = event.player.id;
  system.run(() => clearRotationProbe(playerId));
});
