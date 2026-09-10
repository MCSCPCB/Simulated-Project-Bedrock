import { add, blockLocationKey, parseBlockLocationKey } from "../../util/SableVector3Utils.js";
import { getSubLevelBlockRegistration, resolveFancySubLevelBlock } from "../../sublevel/render/fancy/model/FancySubLevelModelRegistry.js";
const LOG_HOST_CATEGORY = "building/logs_and_wood";
const LEAF_HOST_CATEGORY = "nature/leaves";
const ABOVE_OFFSET = { x: 0, y: 1, z: 0 };
const BELOW_OFFSET = { x: 0, y: -1, z: 0 };
const HORIZONTAL_SUPPORTS = [
  { offset: { x: 0, y: 0, z: 1 }, bit: 1 },
  { offset: { x: -1, y: 0, z: 0 }, bit: 2 },
  { offset: { x: 0, y: 0, z: -1 }, bit: 4 },
  { offset: { x: 1, y: 0, z: 0 }, bit: 8 }
];
const WALL_DIRECTIONS = [
  { name: "north", offset: { x: 0, y: 0, z: -1 } },
  { name: "east", offset: { x: 1, y: 0, z: 0 } },
  { name: "south", offset: { x: 0, y: 0, z: 1 } },
  { name: "west", offset: { x: -1, y: 0, z: 0 } }
];
const MULTI_FACE_SUPPORTS = [
  { name: "down", offset: BELOW_OFFSET, bit: 1, hostFace: "up" },
  { name: "up", offset: ABOVE_OFFSET, bit: 2, hostFace: "down" },
  { name: "south", offset: { x: 0, y: 0, z: 1 }, bit: 4, hostFace: "north" },
  { name: "west", offset: { x: -1, y: 0, z: 0 }, bit: 8, hostFace: "east" },
  { name: "north", offset: { x: 0, y: 0, z: -1 }, bit: 16, hostFace: "south" },
  { name: "east", offset: { x: 1, y: 0, z: 0 }, bit: 32, hostFace: "west" }
];
function resolveSubLevelBlockNeighborStateUpdates(entries, changedKeys) {
  const entriesByKey = new Map(entries.map((entry) => [entry.key, entry]));
  const queued = /* @__PURE__ */ new Set();
  const affected = [];
  const enqueue = (key) => {
    if (queued.has(key)) return;
    queued.add(key);
    affected.push(key);
  };
  const enqueueNeighbors = (key) => {
    const location = parseBlockLocationKey(key);
    for (const direction of MULTI_FACE_SUPPORTS) {
      enqueue(blockLocationKey(add(location, direction.offset)));
    }
  };
  for (const key of changedKeys) {
    enqueue(key);
    enqueueNeighbors(key);
  }
  const updates = /* @__PURE__ */ new Map();
  for (let index = 0; index < affected.length; index++) {
    const key = affected[index];
    queued.delete(key);
    const entry = entriesByKey.get(key);
    if (!entry) continue;
    const registration = getSubLevelBlockRegistration(entry.snapshot.typeId);
    const states = registration?.support === "wall_connections" ? wallStates(entry.localLocation, entry.snapshot, entriesByKey) : registration?.support === "moss_carpet" ? paleMossCarpetStates(entry.localLocation, entry.snapshot, entriesByKey) : registration?.support === "pointed_dripstone" ? pointedDripstoneStates(entry.localLocation, entry.snapshot, entriesByKey) : void 0;
    if (!states) continue;
    if (statesEqual(entry.snapshot.states ?? {}, states)) continue;
    const snapshot = { ...entry.snapshot, states };
    updates.set(key, { key, snapshot });
    entriesByKey.set(key, { ...entry, snapshot });
    enqueueNeighbors(key);
  }
  return updates;
}
function paleMossCarpetStates(location, snapshot, entries) {
  let states = snapshot.states;
  const upper = stateValue(snapshot, "upper_block_bit") === true;
  const above = entries.get(blockLocationKey(add(location, ABOVE_OFFSET)))?.snapshot;
  const below = entries.get(blockLocationKey(add(location, BELOW_OFFSET)))?.snapshot;
  for (const direction of MULTI_FACE_SUPPORTS.filter((direction2) => direction2.offset.y === 0)) {
    const neighbor = entries.get(blockLocationKey(add(location, direction.offset)))?.snapshot;
    const name = `pale_moss_carpet_side_${direction.name}`;
    let side = isSolidAttachmentHost(neighbor, direction.hostFace) ? upper ? stateValue(snapshot, name) : "short" : "none";
    if (side === "short") {
      if (above?.typeId === snapshot.typeId && stateValue(above, "upper_block_bit") === true && stateValue(above, name) !== "none") side = "tall";
      if (upper && below?.typeId === snapshot.typeId && stateValue(below, name) === "none") side = "none";
    }
    states = replaceState({ ...snapshot, states }, name, side);
  }
  return states;
}
function pointedDripstoneStates(location, snapshot, entries) {
  const hanging = stateValue(snapshot, "hanging") === true;
  const forward = entries.get(blockLocationKey(add(location, hanging ? BELOW_OFFSET : ABOVE_OFFSET)))?.snapshot;
  const rear = entries.get(blockLocationKey(add(location, hanging ? ABOVE_OFFSET : BELOW_OFFSET)))?.snapshot;
  let thickness;
  if (forward?.typeId !== snapshot.typeId) thickness = "tip";
  else if (stateValue(forward, "hanging") !== hanging) {
    thickness = stateValue(snapshot, "dripstone_thickness") === "merge" || stateValue(forward, "dripstone_thickness") === "merge" ? "merge" : "tip";
  } else if (["tip", "merge"].includes(String(stateValue(forward, "dripstone_thickness")))) thickness = "frustum";
  else thickness = rear?.typeId === snapshot.typeId && stateValue(rear, "hanging") === hanging ? "middle" : "base";
  return replaceState(snapshot, "dripstone_thickness", thickness);
}
function resolveSubLevelBlockSupport(entries, removedKeys, changedKeys = removedKeys) {
  const entriesByKey = /* @__PURE__ */ new Map();
  for (const entry of entries) {
    if (entriesByKey.has(entry.key)) {
      throw new RangeError(`Duplicate sub-level attachment support entry ${entry.key}.`);
    }
    entriesByKey.set(entry.key, entry);
  }
  const unsupportedKeys = /* @__PURE__ */ new Set();
  const stateUpdates = new Map(resolveSubLevelBlockNeighborStateUpdates(
    entries.filter((entry) => !removedKeys.has(entry.key)),
    changedKeys
  ));
  const supportKeysByAttachment = /* @__PURE__ */ new Map();
  const attachments = entries.filter((entry) => hasSubLevelSupportRule(entry.snapshot) && !removedKeys.has(entry.key)).sort((left, right) => right.localLocation.y - left.localLocation.y);
  let removed;
  do {
    removed = [];
    for (const entry of attachments) {
      if (unsupportedKeys.has(entry.key)) continue;
      const snapshot = stateUpdates.get(entry.key)?.snapshot ?? entry.snapshot;
      const result = resolveAttachment(
        entry.localLocation,
        snapshot,
        entriesByKey,
        removedKeys,
        unsupportedKeys,
        stateUpdates
      );
      if (!result.supported) {
        unsupportedKeys.add(entry.key);
        stateUpdates.delete(entry.key);
        supportKeysByAttachment.delete(entry.key);
        removed.push(entry.key);
        continue;
      }
      if (result.states && !statesEqual(snapshot.states ?? {}, result.states)) {
        stateUpdates.set(entry.key, {
          key: entry.key,
          snapshot: { ...snapshot, states: result.states }
        });
      }
      supportKeysByAttachment.set(entry.key, result.supportKeys);
    }
    if (removed.length > 0) {
      const remainingEntries = entries.filter((entry) => !removedKeys.has(entry.key) && !unsupportedKeys.has(entry.key)).map((entry) => ({ ...entry, snapshot: stateUpdates.get(entry.key)?.snapshot ?? entry.snapshot }));
      const neighborUpdates = resolveSubLevelBlockNeighborStateUpdates(remainingEntries, new Set(removed));
      for (const [key, update] of neighborUpdates) stateUpdates.set(key, update);
    }
  } while (removed.length > 0);
  return { stateUpdates, supportKeysByAttachment, unsupportedKeys };
}
function resolveSubLevelBlockPlacement(blocks, placed, random = Math.random) {
  const key = blockLocationKey(placed.localLocation);
  const entries = new Map(blocks.map((snapshot) => [blockLocationKey(snapshot.localLocation), {
    key: blockLocationKey(snapshot.localLocation),
    localLocation: snapshot.localLocation,
    snapshot
  }]));
  const existing = entries.get(key)?.snapshot;
  const rule = supportRuleOf(placed);
  const requestedFaces = rule === "multi_face" ? integerState(placed, "multi_face_direction_bits", 0, 63) : 0;
  if (existing) {
    if (existing.typeId !== placed.typeId || rule !== "multi_face") return void 0;
    const previousFaces = integerState(existing, "multi_face_direction_bits", 0, 63);
    if ((previousFaces & requestedFaces) === requestedFaces) return void 0;
    placed = { ...existing, states: replaceState(existing, "multi_face_direction_bits", previousFaces | requestedFaces) };
  }
  if (rule === "pointed_dripstone" && !resolveAttachment(placed.localLocation, placed, entries, /* @__PURE__ */ new Set(), /* @__PURE__ */ new Set(), /* @__PURE__ */ new Map()).supported) {
    placed = { ...placed, states: replaceState(placed, "hanging", stateValue(placed, "hanging") !== true) };
  }
  entries.set(key, { key, localLocation: placed.localLocation, snapshot: placed });
  const addedKeys = new Set(existing ? [] : [key]);
  if (rule === "moss_carpet") {
    const location = add(placed.localLocation, ABOVE_OFFSET);
    const aboveKey = blockLocationKey(location);
    if (!entries.has(aboveKey)) {
      let topper = { ...placed, localLocation: location, states: replaceState(placed, "upper_block_bit", true) };
      let hasFace = false;
      for (const direction of MULTI_FACE_SUPPORTS.filter((direction2) => direction2.offset.y === 0)) {
        const lowerHost = entries.get(blockLocationKey(add(placed.localLocation, direction.offset)))?.snapshot;
        const upperHost = entries.get(blockLocationKey(add(location, direction.offset)))?.snapshot;
        const side = isSolidAttachmentHost(lowerHost, direction.hostFace) && isSolidAttachmentHost(upperHost, direction.hostFace) && random() < 0.5 ? "short" : "none";
        hasFace ||= side !== "none";
        topper = { ...topper, states: replaceState(topper, `pale_moss_carpet_side_${direction.name}`, side) };
      }
      if (hasFace) {
        entries.set(aboveKey, { key: aboveKey, localLocation: location, snapshot: topper });
        addedKeys.add(aboveKey);
      }
    }
  }
  const support = resolveSubLevelBlockSupport([...entries.values()], /* @__PURE__ */ new Set(), /* @__PURE__ */ new Set([key, ...addedKeys]));
  if (support.unsupportedKeys.has(key)) return void 0;
  const resolved = support.stateUpdates.get(key)?.snapshot ?? placed;
  if (rule === "multi_face" && (integerState(resolved, "multi_face_direction_bits", 0, 63) & requestedFaces) !== requestedFaces) return void 0;
  const stateUpdates = new Map([...support.stateUpdates].filter(([key2]) => !addedKeys.has(key2)));
  if (existing) stateUpdates.set(key, { key, snapshot: resolved });
  return {
    additions: [...addedKeys].filter((key2) => !support.unsupportedKeys.has(key2)).map((key2) => support.stateUpdates.get(key2)?.snapshot ?? entries.get(key2).snapshot),
    stateUpdates
  };
}
function resolveAttachment(location, snapshot, entriesByKey, removedKeys, unsupportedKeys, stateUpdates) {
  const read = (key) => {
    if (removedKeys.has(key) || unsupportedKeys.has(key)) return void 0;
    return stateUpdates.get(key)?.snapshot ?? entriesByKey.get(key)?.snapshot;
  };
  const keyAt = (offset) => blockLocationKey(add(location, offset));
  const rule = supportRuleOf(snapshot);
  switch (rule) {
    case "none":
      return { supported: true, supportKeys: [] };
    case "facing_log": {
      const direction = integerState(snapshot, "direction", 0, 3);
      const supportKey = keyAt(HORIZONTAL_SUPPORTS[direction].offset);
      const support = read(supportKey);
      return {
        supported: support !== void 0 && getSubLevelBlockRegistration(support.typeId)?.category === LOG_HOST_CATEGORY,
        supportKeys: [supportKey]
      };
    }
    case "above_solid": {
      const supportKey = keyAt(ABOVE_OFFSET);
      return {
        supported: isSolidAttachmentHost(read(supportKey)),
        supportKeys: [supportKey]
      };
    }
    case "below_block": {
      const supportKey = keyAt(BELOW_OFFSET);
      return { supported: read(supportKey) !== void 0, supportKeys: [supportKey] };
    }
    case "moss_carpet": {
      const supportKey = keyAt(BELOW_OFFSET);
      const below = read(supportKey);
      const upper = stateValue(snapshot, "upper_block_bit") === true;
      return {
        supported: upper ? below?.typeId === snapshot.typeId && stateValue(below, "upper_block_bit") === false && WALL_DIRECTIONS.some((direction) => stateValue(snapshot, `pale_moss_carpet_side_${direction.name}`) !== "none") : below !== void 0,
        supportKeys: [supportKey]
      };
    }
    case "pointed_dripstone": {
      const hanging = stateValue(snapshot, "hanging") === true;
      const supportKey = keyAt(hanging ? ABOVE_OFFSET : BELOW_OFFSET);
      const support = read(supportKey);
      return {
        supported: isSolidAttachmentHost(support, hanging ? "down" : "up") || support?.typeId === snapshot.typeId && stateValue(support, "hanging") === hanging,
        supportKeys: [supportKey]
      };
    }
    case "multi_face": {
      const bits = integerState(snapshot, "multi_face_direction_bits", 0, 63);
      let retained = 0;
      const supportKeys = [];
      for (const direction of MULTI_FACE_SUPPORTS) {
        const key = keyAt(direction.offset);
        if (bits & direction.bit && isSolidAttachmentHost(read(key), direction.hostFace)) {
          retained |= direction.bit;
          supportKeys.push(key);
        }
      }
      return { supported: retained !== 0, supportKeys, states: replaceState(snapshot, "multi_face_direction_bits", retained) };
    }
    case "above_leaf": {
      const hanging = stateValue(snapshot, "hanging");
      if (hanging !== true && hanging !== 1) {
        return { supported: true, supportKeys: [] };
      }
      const supportKey = keyAt(ABOVE_OFFSET);
      const support = read(supportKey);
      return {
        supported: support !== void 0 && getSubLevelBlockRegistration(support.typeId)?.category === LEAF_HOST_CATEGORY,
        supportKeys: [supportKey]
      };
    }
    case "moss_column": {
      const supportKey = keyAt(ABOVE_OFFSET);
      const support = read(supportKey);
      const supported = support?.typeId === snapshot.typeId || isSolidAttachmentHost(support);
      const below = read(keyAt(BELOW_OFFSET));
      const tip = below?.typeId !== snapshot.typeId;
      return {
        states: replaceState(snapshot, "tip", tip),
        supported,
        supportKeys: [supportKey]
      };
    }
    case "vine_faces": {
      const currentBits = integerState(snapshot, "vine_direction_bits", 0, 15);
      const aboveKey = keyAt(ABOVE_OFFSET);
      const above = read(aboveKey);
      const aboveBits = above?.typeId === snapshot.typeId ? integerState(above, "vine_direction_bits", 0, 15) : 0;
      let retainedBits = 0;
      const supportKeys = [];
      for (const direction of HORIZONTAL_SUPPORTS) {
        if ((currentBits & direction.bit) === 0) continue;
        const sideKey = keyAt(direction.offset);
        if (isSolidAttachmentHost(read(sideKey))) {
          retainedBits |= direction.bit;
          supportKeys.push(sideKey);
        } else if ((aboveBits & direction.bit) !== 0) {
          retainedBits |= direction.bit;
          supportKeys.push(aboveKey);
        }
      }
      return {
        states: replaceState(snapshot, "vine_direction_bits", retainedBits),
        supported: retainedBits !== 0,
        supportKeys
      };
    }
    case "wall_connections":
      return { supported: true, supportKeys: [] };
    default:
      throw new Error(`Unsupported sub-level attachment rule ${String(rule)} for ${snapshot.typeId}.`);
  }
}
function wallStates(location, snapshot, entries) {
  const values = {};
  for (const direction of WALL_DIRECTIONS) {
    const neighbor = entries.get(blockLocationKey(add(location, direction.offset)))?.snapshot;
    const connection = wallConnectionType(neighbor);
    values[`minecraft:wall_connection_type_${direction.name}`] = connection;
  }
  const straight = values["minecraft:wall_connection_type_north"] !== "none" && values["minecraft:wall_connection_type_south"] !== "none" && values["minecraft:wall_connection_type_east"] === "none" && values["minecraft:wall_connection_type_west"] === "none" || values["minecraft:wall_connection_type_east"] !== "none" && values["minecraft:wall_connection_type_west"] !== "none" && values["minecraft:wall_connection_type_north"] === "none" && values["minecraft:wall_connection_type_south"] === "none";
  values["minecraft:wall_post_bit"] = !straight;
  const current = snapshot.states ?? {};
  return Object.fromEntries(Object.keys(current).map((key) => {
    const short = key.startsWith("minecraft:") ? key.slice(9) : key;
    return [key, values[`minecraft:${short}`] ?? current[key]];
  }));
}
function wallConnectionType(snapshot) {
  if (!snapshot || snapshot.collisionResponse === false) return "none";
  if (snapshot.typeId === "minecraft:moss_carpet" || snapshot.typeId === "minecraft:pale_moss_carpet") return "short";
  const registration = getSubLevelBlockRegistration(snapshot.typeId);
  if (registration?.support === "wall_connections") return "short";
  if (registration?.passable === true) return "short";
  return "tall";
}
function hasSubLevelSupportRule(snapshot) {
  return supportRuleOf(snapshot) !== void 0;
}
function supportRuleOf(snapshot) {
  return getSubLevelBlockRegistration(snapshot.typeId)?.support;
}
function isSolidAttachmentHost(snapshot, face = "down") {
  if (!snapshot || snapshot.collidable === false || snapshot.collisionShape === "none") return false;
  if (snapshot.collisionShape === "full") return true;
  const model = resolveFancySubLevelBlock(snapshot)?.model.description;
  if (!model) return !hasSubLevelSupportRule(snapshot);
  switch (model.type) {
    case "full_block":
    case "pillar":
    case "creaking_heart":
    case "bee_nest":
    case "mangrove_roots":
      return true;
    case "grass_path":
    case "sculk_shrieker":
      return face === "down";
    case "moss_carpet":
      return face === "down" && (!model.pale || stateValue(snapshot, "upper_block_bit") === false);
    default:
      return false;
  }
}
function integerState(snapshot, name, minimum, maximum) {
  const value = stateValue(snapshot, name);
  if (!Number.isInteger(value) || value < minimum || value > maximum) {
    throw new RangeError(
      `Sub-level attachment ${snapshot.typeId} has invalid ${name} state ${String(value)}.`
    );
  }
  return value;
}
function stateValue(snapshot, name) {
  return snapshot.states?.[name] ?? snapshot.states?.[`minecraft:${name}`];
}
function replaceState(snapshot, name, value) {
  const states = snapshot.states ?? {};
  const key = states[name] !== void 0 ? name : `minecraft:${name}`;
  if (states[key] === void 0) {
    throw new Error(`Sub-level attachment ${snapshot.typeId} has no ${name} state.`);
  }
  return { ...states, [key]: value };
}
function statesEqual(left, right) {
  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);
  if (leftKeys.length !== rightKeys.length) return false;
  return leftKeys.every((key) => left[key] === right[key]);
}
export {
  hasSubLevelSupportRule,
  resolveSubLevelBlockNeighborStateUpdates,
  resolveSubLevelBlockPlacement,
  resolveSubLevelBlockSupport
};
