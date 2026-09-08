import { BlockPermutation, system, world } from "@minecraft/server";
import { sableInteractionSystem } from "./sable/Sable.js";
import { FancySubLevelModelRenderer } from "./sable/sublevel/render/fancy/model/FancySubLevelModelRenderer.js";
import { packFancySubLevelModels } from "./sable/sublevel/render/fancy/model/FancySubLevelModelLayout.js";
import { resolveFancySubLevelBlock } from "./sable/sublevel/render/fancy/model/FancySubLevelModelRegistry.js";
import { VanillaSubLevelRenderDispatcher } from "./sable/sublevel/render/dispatcher/VanillaSubLevelRenderDispatcher.js";
import {
  resolveSubLevelBlockRotation,
  resolveSubLevelBlockVisualYOffset,
  resolveSubLevelBlockVisualOffset
} from "./sable/api/SubLevelAssemblyHelper.js";
import { DEFAULT_SUBLEVEL_FOLIAGE_TINT } from "./sable/sublevel/render/fancy/model/FancySubLevelTintCodec.js";
import { selectSubLevelRenderAnchor } from "./sable/util/SublevelRenderOffsetHelper.js";

const probes = new Map();

// The ninth 1-based candidate selected during the head test is the known
// correct standing-head item basis. Keep this probe baseline explicit instead
// of falling back to the generic facing-direction table.
const HEAD_CANDIDATE_9_ROTATION = { x: 0, y: 180, z: 0 };

function restoreProbeMarkers(markers) {
  for (const marker of markers ?? []) {
    const block = marker.dimension.getBlock(marker.location);
    if (block?.isValid && block.typeId === marker.typeId) {
      block.setPermutation(marker.previousPermutation);
    }
  }
}

function restoreProbeNativeBlocks(blocks) {
  for (const entry of blocks ?? []) {
    const block = entry.dimension.getBlock(entry.location);
    if (block?.isValid && block.typeId === entry.typeId) {
      block.setPermutation(entry.previousPermutation);
    }
  }
}

export function clearRotationProbe(playerId) {
  const rows = probes.get(playerId) ?? [];
  probes.delete(playerId);
  for (const row of rows) {
    row.active = false;
    row.handle?.unregister();
    row.renderer?.remove();
    restoreProbeMarkers(row.markers);
    restoreProbeNativeBlocks(row.nativeBlocks);
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

/**
 * Creates the first visual census pair: a registered Fancy chest row and an
 * unregistered trapped-chest row using the ordinary Vanilla held-block route.
 * Both rows use the same four cardinal states, so the only visual variable is
 * the render path/model basis.
 */
export function createRotationCensusProbe(player) {
  return createStateCensusProbe(player, {
    directions: ["north", "east", "south", "west"],
    stateName: "minecraft:cardinal_direction",
    groups: [
      { label: "FANCY CHEST", typeId: "minecraft:chest", fancy: true },
      { label: "VANILLA TRAPPED CHEST", typeId: "minecraft:trapped_chest", fancy: false }
    ],
    markers: [
      ["minecraft:diamond_block", "north"],
      ["minecraft:gold_block", "east"],
      ["minecraft:emerald_block", "south"],
      ["minecraft:redstone_block", "west"]
    ],
    markerMessage: "Markers: diamond=N, gold=E, emerald=S, redstone=W; columns are N/E/S/W."
  });
}

export function createPillarAxisCensusProbe(player) {
  return createStateCensusProbe(player, {
    directions: ["y", "x", "z"],
    stateName: "minecraft:pillar_axis",
    groups: [
      { label: "FANCY OAK LOG", typeId: "minecraft:oak_log", fancy: true },
      { label: "VANILLA BASALT", typeId: "minecraft:basalt", fancy: false }
    ],
    markers: [
      ["minecraft:diamond_block", "y/vertical"],
      ["minecraft:gold_block", "x"],
      ["minecraft:emerald_block", "z"]
    ],
    markerMessage: "Markers: diamond=Y/vertical, gold=X, emerald=Z; columns are Y/X/Z."
  });
}

export function createDirectionCensusProbe(player) {
  return createStateCensusProbe(player, {
    directions: [0, 1, 2, 3],
    stateName: "minecraft:direction",
    groups: [
      { label: "FANCY BEE NEST", typeId: "minecraft:bee_nest", fancy: true },
      { label: "VANILLA BEEHIVE", typeId: "minecraft:beehive", fancy: false }
    ],
    markers: [
      ["minecraft:diamond_block", "0"],
      ["minecraft:gold_block", "1"],
      ["minecraft:emerald_block", "2"],
      ["minecraft:redstone_block", "3"]
    ],
    markerMessage: "Markers: diamond=0, gold=1, emerald=2, redstone=3; columns are direction 0/1/2/3."
  });
}

export function createFacingDirectionCensusProbe(player) {
  return createStateCensusProbe(player, {
    directions: [0, 1, 2, 3, 4, 5],
    stateName: "minecraft:facing_direction",
    groups: [
      { label: "VANILLA BARREL", typeId: "minecraft:barrel", fancy: false },
      { label: "VANILLA DISPENSER", typeId: "minecraft:dispenser", fancy: false }
    ],
    markers: [
      ["minecraft:diamond_block", "0/down"],
      ["minecraft:gold_block", "1/up"],
      ["minecraft:emerald_block", "2/north"],
      ["minecraft:redstone_block", "3/south"],
      ["minecraft:lapis_block", "4/west"],
      ["minecraft:quartz_block", "5/east"]
    ],
    markerMessage: "Markers: diamond=0/down, gold=1/up, emerald=2/north, redstone=3/south, lapis=4/west, quartz=5/east."
  });
}

export function createTorchFacingCensusProbe(player) {
  return createStateCensusProbe(player, {
    directions: ["west", "east", "north", "south", "top"],
    stateName: "torch_facing_direction",
    groups: [
      { label: "VANILLA TORCH", typeId: "minecraft:torch", fancy: false },
      { label: "VANILLA REDSTONE TORCH", typeId: "minecraft:redstone_torch", fancy: false }
    ],
    markers: [
      ["minecraft:diamond_block", "west"],
      ["minecraft:gold_block", "east"],
      ["minecraft:emerald_block", "north"],
      ["minecraft:redstone_block", "south"],
      ["minecraft:quartz_block", "top"]
    ],
    markerMessage: "Markers: diamond=west, gold=east, emerald=north, redstone=south, quartz=top."
  });
}

export function createStairsCensusProbe(player) {
  return createStateCensusProbe(player, {
    directions: [0, 1, 2, 3],
    stateName: "weirdo_direction",
    extraStates: { upside_down_bit: false },
    groups: [
      { label: "VANILLA STONE STAIRS", typeId: "minecraft:stone_stairs", fancy: false },
      { label: "VANILLA ANDESITE STAIRS", typeId: "minecraft:andesite_stairs", fancy: false }
    ],
    markers: [
      ["minecraft:diamond_block", "0"],
      ["minecraft:gold_block", "1"],
      ["minecraft:emerald_block", "2"],
      ["minecraft:redstone_block", "3"]
    ],
    markerMessage: "Markers: diamond=0, gold=1, emerald=2, redstone=3; columns are weirdo_direction 0/1/2/3."
  });
}

/**
 * Builds the head-only geometry census in a pair: the six sub-level head
 * states are followed by the same six permutations as native world blocks.
 * The gold columns beneath the entries make the state order visible without
 * changing either row's block positions.
 */
export function createNativeStateCensusProbe(player) {
  clearRotationProbe(player.id);
  const headDirections = ["down", "up", "north", "south", "west", "east"];
  const sections = [
    {
      label: "PLAYER HEAD",
      typeId: "minecraft:player_head",
      entries: [0, 1, 2, 3, 4, 5].map(facing_direction => ({
        label: `facing_direction/${facing_direction}/${headDirections[facing_direction]}`,
        states: { facing_direction },
        ...(facing_direction === 0 ? { rotation: HEAD_CANDIDATE_9_ROTATION } : {})
      }))
    }
  ];
  const origin = findNativeCensusOrigin(player, sections);
  const rows = [];
  probes.set(player.id, rows);
  const vanilla = new VanillaSubLevelRenderDispatcher();
  const nativeBlocks = [];
  try {
    for (const [sectionIndex, section] of sections.entries()) {
      const z = origin.z + sectionIndex * 6;
      const resolvedEntries = section.entries.map(entry => ({
        ...entry,
        permutation: resolveProbePermutation(section.typeId, entry.states)
      }));
      const blocks = resolvedEntries.map((entry, index) => {
        const states = entry.permutation.getAllStates();
        const rotation = resolveSubLevelBlockRotation(section.typeId, states);
        const visualYOffset = resolveSubLevelBlockVisualYOffset(section.typeId, states);
        const visualOffset = resolveSubLevelBlockVisualOffset(section.typeId, states);
        return {
          typeId: section.typeId,
          ...(section.itemTypeId ? { itemTypeId: section.itemTypeId } : {}),
          localLocation: {
            x: index * 2 + (entry.offset?.x ?? 0),
            y: 0,
            z: entry.offset?.z ?? 0
          },
          states,
          ...(entry.rotation ?? rotation ? { rotation: entry.rotation ?? rotation } : {}),
          ...(visualYOffset !== 0 ? { visualYOffset } : {}),
          ...(visualOffset ? { visualOffset } : {})
        };
      });
      const rowOrigin = { ...origin, z };
      const anchor = selectSubLevelRenderAnchor(blocks);
      const body = {
        get isValid() { return row?.active ?? true; },
        getRotation: () => ({ x: 0, y: 0, z: 0 }),
        localPointToWorld: local => ({
          x: rowOrigin.x + local.x + 0.5,
          y: rowOrigin.y + local.y + 0.5,
          z: rowOrigin.z + local.z + 0.5
        })
      };
      let row;
      const renderData = vanilla.createRenderDataAtAnchor(
        { body, blocks, dimension: player.dimension, renderEntityTags: [] }, anchor
      );
      row = {
        active: true,
        origin: rowOrigin,
        label: section.label,
        entries: resolvedEntries,
        blocks,
        renderData,
        renderer: renderData
      };
      rows.push(row);
      row.handle = sableInteractionSystem.register({ body, blocks, dimension: player.dimension }, {
        renderData,
        supportsBlockPlacement: false,
        worldPointToLocal: point => ({
          x: point.x - rowOrigin.x - 0.5,
          y: point.y - rowOrigin.y - 0.5,
          z: point.z - rowOrigin.z - 0.5
        })
      });
      renderData.sync(true);
      const nativeRow = [];
      for (const [index, entry] of resolvedEntries.entries()) {
        const location = { x: rowOrigin.x + index * 2, y: rowOrigin.y, z: rowOrigin.z + 2 };
        const block = player.dimension.getBlock(location);
        if (!block?.isAir) throw new Error(`Move to an open area before creating the ${section.label} census.`);
        const previousPermutation = block.permutation;
        block.setPermutation(entry.permutation);
        nativeRow.push({ dimension: player.dimension, location, typeId: section.typeId, previousPermutation });
      }
      for (const [index] of resolvedEntries.entries()) {
        for (let level = 0; level <= index; level++) {
          const location = { x: rowOrigin.x + index * 2, y: rowOrigin.y + level, z: rowOrigin.z - 1 };
          const block = player.dimension.getBlock(location);
          if (!block?.isAir) throw new Error(`Move to an open area before creating the ${section.label} census labels.`);
          const previousPermutation = block.permutation;
          block.setPermutation(BlockPermutation.resolve("minecraft:gold_block"));
          nativeRow.push({ dimension: player.dimension, location, typeId: "minecraft:gold_block", previousPermutation });
        }
      }
      row.nativeBlocks = nativeRow;
      nativeBlocks.push(...nativeRow);
      system.run(() => {
        if (!row.active) return;
        renderData.sync(true);
        renderData.releaseInitialPose();
      });
    }
    return rows;
  } catch (error) {
    clearRotationProbe(player.id);
    // `nativeBlocks` also contains the row that may be only partially
    // written when a later section fails.  Always restore this list after
    // clearing completed rows so a failed census cannot leave test blocks in
    // the world.
    restoreProbeNativeBlocks(nativeBlocks);
    throw error;
  }
}

function findNativeCensusOrigin(player, sections) {
  const width = Math.max(...sections.map(section => section.entries.length)) * 2;
  const baseX = Math.floor(player.location.x) - Math.floor(width / 2);
  const baseZ = Math.floor(player.location.z) + 4;
  const playerY = Math.floor(player.location.y);
  const yCandidates = [];
  const seenY = new Set();
  // Prefer the player's current level, then inspect open layers above and
  // below it.  The census has tall gold label pillars, so checking several
  // layers is necessary in caves, under roofs, and near the build limit.
  for (const offset of [2, 8, 16, 24, 32, 40, 48, 56, 64, -6, -14, -22]) {
    const y = playerY + offset;
    if (!seenY.has(y)) {
      seenY.add(y);
      yCandidates.push(y);
    }
  }
  for (const y of yCandidates) {
    for (let radius = 0; radius <= 192; radius += 4) {
      for (let dx = -radius; dx <= radius; dx += 4) for (const dz of [-radius, radius]) {
        const candidate = { x: baseX + dx, y, z: baseZ + dz };
        if (nativeCensusAreaIsOpen(player, candidate, sections)) return candidate;
      }
      for (let dz = -radius + 4; dz <= radius - 4; dz += 4) for (const dx of [-radius, radius]) {
        const candidate = { x: baseX + dx, y, z: baseZ + dz };
        if (nativeCensusAreaIsOpen(player, candidate, sections)) return candidate;
      }
    }
  }
  throw new Error("Could not find an open area for the native rotation census; move to a wider open area and try again.");
}

function nativeCensusAreaIsOpen(player, origin, sections) {
  const locations = [];
  for (const [sectionIndex, section] of sections.entries()) {
    const z = origin.z + sectionIndex * 6;
    for (const [index] of section.entries.entries()) {
      locations.push(
        { x: origin.x + index * 2, y: origin.y, z },
        { x: origin.x + index * 2, y: origin.y, z: z + 2 }
      );
      for (let level = 0; level <= index; level++) {
        locations.push({ x: origin.x + index * 2, y: origin.y + level, z: z - 1 });
      }
    }
  }
  return locations.every(location => player.dimension.getBlock(location)?.isAir === true);
}

function createStateCensusProbe(player, config) {
  clearRotationProbe(player.id);
  const { directions, stateName, extraStates = {}, groups, markers: markerSpecs } = config;
  const groupBlocks = groups.map(group => ({
    ...group,
    blocks: directions.map((direction, index) => {
      const states = resolveProbeStates(group.typeId, stateName, direction, extraStates);
      const rotation = resolveSubLevelBlockRotation(group.typeId, states);
      return {
        typeId: group.typeId,
        localLocation: { x: index * 2, y: 0, z: 0 },
        states,
        ...(rotation ? { rotation } : {})
      };
    })
  }));
  const origin = {
    x: Math.floor(player.location.x) - 6,
    y: Math.floor(player.location.y) + 2,
    z: Math.floor(player.location.z) + 4
  };
  for (const offset of [0, 4]) for (const block of groupBlocks[0].blocks) {
    const target = player.dimension.getBlock({
      x: origin.x + block.localLocation.x, y: origin.y, z: origin.z + offset
    });
    if (!target?.isAir) throw new Error("Move to an open area before creating the rotation census probe.");
  }
  const markerLocations = markerSpecs.map(([typeId, direction], index) => ({
    typeId,
    direction,
    location: { x: origin.x + index * 2, y: origin.y, z: origin.z - 1 }
  }));
  for (const marker of markerLocations) {
    const target = player.dimension.getBlock(marker.location);
    if (!target?.isAir) throw new Error("Move to an open area before creating the rotation census markers.");
  }
  const markers = markerLocations.map(marker => {
    const target = player.dimension.getBlock(marker.location);
    const previousPermutation = target.permutation;
    target.setPermutation(BlockPermutation.resolve(marker.typeId));
    return { ...marker, dimension: player.dimension, previousPermutation };
  });
  const rows = [];
  probes.set(player.id, rows);
  const vanilla = new VanillaSubLevelRenderDispatcher();
  try {
    for (const [groupIndex, group] of groupBlocks.entries()) {
      const rowOrigin = { ...origin, z: origin.z + groupIndex * 4 };
      const blocks = group.blocks;
      const anchor = selectSubLevelRenderAnchor(blocks);
      let row;
      const body = {
        get isValid() { return row?.active ?? true; },
        getRotation: () => ({ x: 0, y: 0, z: 0 }),
        localPointToWorld: local => ({
          x: rowOrigin.x + local.x + 0.5,
          y: rowOrigin.y + local.y + 0.5,
          z: rowOrigin.z + local.z + 0.5
        })
      };
      let renderData;
      if (group.fancy) {
        const resolved = blocks.map(resolveFancySubLevelBlock);
        if (resolved.some(block => !block)) throw new Error("Fancy census models are unavailable.");
        const packing = packFancySubLevelModels(resolved);
        if (packing.unsupported.length) throw new Error("Fancy census packing contains unsupported blocks.");
        renderData = new FancySubLevelModelRenderer(
          body, packing.models,
          (typeId, location) => player.dimension.spawnEntity(typeId, location),
          DEFAULT_SUBLEVEL_FOLIAGE_TINT, undefined, anchor, undefined
        );
      } else {
        renderData = vanilla.createRenderDataAtAnchor(
          { body, blocks, dimension: player.dimension, renderEntityTags: [] }, anchor
        );
      }
      row = { active: true, origin: rowOrigin, label: group.label, blocks, renderData, renderer: renderData };
      if (groupIndex === 0) row.markers = markers;
      rows.push(row);
      row.handle = sableInteractionSystem.register({ body, blocks, dimension: player.dimension }, {
        renderData,
        supportsBlockPlacement: false,
        worldPointToLocal: point => ({
          x: point.x - rowOrigin.x - 0.5,
          y: point.y - rowOrigin.y - 0.5,
          z: point.z - rowOrigin.z - 0.5
        })
      });
      renderData.sync(true);
      system.run(() => {
        if (!row.active) return;
        renderData.sync(true);
        renderData.releaseInitialPose();
      });
    }
    return rows;
  } catch (error) {
    clearRotationProbe(player.id);
    if (!rows.some(row => row.markers === markers)) restoreProbeMarkers(markers);
    throw error;
  }
}

function resolveProbeStates(typeId, stateName, value, extraStates = {}) {
  const candidates = [stateName];
  const separator = stateName.indexOf(":");
  if (separator >= 0) candidates.push(stateName.slice(separator + 1));
  let lastError;
  for (const candidate of candidates) {
    try {
      return BlockPermutation.resolve(typeId, { ...extraStates, [candidate]: value }).getAllStates();
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError ?? new Error(`Failed to resolve ${typeId} with ${stateName}=${value}.`);
}

function resolveProbePermutation(typeId, states) {
  const candidates = [states, Object.fromEntries(
    Object.entries(states).map(([name, value]) => [
      name.includes(":") ? name.slice(name.indexOf(":") + 1) : name,
      value
    ])
  )];
  let lastError;
  for (const candidate of candidates) {
    try {
      return BlockPermutation.resolve(typeId, candidate);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError ?? new Error(`Failed to resolve ${typeId} with states.`);
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
    if (event.message.trim() === "census") {
      const rows = createRotationCensusProbe(player);
      player.sendMessage("Markers: diamond=N, gold=E, emerald=S, redstone=W; columns are N/E/S/W.");
      for (const row of rows) {
        const { x, y, z } = row.origin;
        player.sendMessage(`${row.label}: ${x}, ${y}, ${z}; +X: north/east/south/west.`);
      }
      return;
    }
    if (event.message.trim() === "census_pillar") {
      const rows = createPillarAxisCensusProbe(player);
      player.sendMessage("Markers: diamond=Y/vertical, gold=X, emerald=Z; columns are Y/X/Z.");
      for (const row of rows) {
        const { x, y, z } = row.origin;
        player.sendMessage(`${row.label}: ${x}, ${y}, ${z}; +X: Y/X/Z.`);
      }
      return;
    }
    if (event.message.trim() === "census_direction") {
      const rows = createDirectionCensusProbe(player);
      player.sendMessage("Markers: diamond=0, gold=1, emerald=2, redstone=3; columns are direction 0/1/2/3.");
      for (const row of rows) {
        const { x, y, z } = row.origin;
        player.sendMessage(`${row.label}: ${x}, ${y}, ${z}; +X: direction 0/1/2/3.`);
      }
      return;
    }
    if (event.message.trim() === "census_facing") {
      const rows = createFacingDirectionCensusProbe(player);
      player.sendMessage("Markers: diamond=0/down, gold=1/up, emerald=2/north, redstone=3/south, lapis=4/west, quartz=5/east.");
      for (const row of rows) {
        const { x, y, z } = row.origin;
        player.sendMessage(`${row.label}: ${x}, ${y}, ${z}; +X: 0/down,1/up,2/north,3/south,4/west,5/east.`);
      }
      return;
    }
    if (event.message.trim() === "census_torch") {
      const rows = createTorchFacingCensusProbe(player);
      player.sendMessage("Markers: diamond=west, gold=east, emerald=north, redstone=south, quartz=top.");
      for (const row of rows) {
        const { x, y, z } = row.origin;
        player.sendMessage(`${row.label}: ${x}, ${y}, ${z}; +X: west/east/north/south/top.`);
      }
      return;
    }
    if (event.message.trim() === "census_stairs") {
      const rows = createStairsCensusProbe(player);
      player.sendMessage("Markers: diamond=0, gold=1, emerald=2, redstone=3; columns are weirdo_direction 0/1/2/3.");
      for (const row of rows) {
        const { x, y, z } = row.origin;
        player.sendMessage(`${row.label}: ${x}, ${y}, ${z}; +X: direction 0/1/2/3.`);
      }
      return;
    }
    if (event.message.trim() === "census_native") {
      const rows = createNativeStateCensusProbe(player);
      player.sendMessage("Head-only census: the sub-level row is followed two blocks behind by the native world row. +X order is facing_direction 0/down, 1/up, 2/north, 3/south, 4/west, 5/east. Gold columns below each entry mark its order.");
      for (const row of rows) {
        const { x, y, z } = row.origin;
        player.sendMessage(`${row.label}: ${x}, ${y}, ${z}; +X states: ${row.entries.map(entry => entry.label).join(" | ")}`);
      }
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
