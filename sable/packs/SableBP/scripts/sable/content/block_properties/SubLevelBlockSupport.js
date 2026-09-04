import { add, blockLocationKey } from "../../util/SableVector3Utils.js";
import { getSubLevelBlockRegistration } from "../../sublevel/render/fancy/model/FancySubLevelModelRegistry.js";
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
function resolveSubLevelBlockSupport(entries, removedKeys) {
  const entriesByKey = /* @__PURE__ */ new Map();
  for (const entry of entries) {
    if (entriesByKey.has(entry.key)) {
      throw new RangeError(`Duplicate sub-level attachment support entry ${entry.key}.`);
    }
    entriesByKey.set(entry.key, entry);
  }
  const unsupportedKeys = /* @__PURE__ */ new Set();
  const stateUpdates = /* @__PURE__ */ new Map();
  const supportKeysByAttachment = /* @__PURE__ */ new Map();
  const attachments = entries.filter((entry) => hasSubLevelSupportRule(entry.snapshot) && !removedKeys.has(entry.key)).sort((left, right) => right.localLocation.y - left.localLocation.y);
  for (const entry of attachments) {
    if (removedKeys.has(entry.key) || unsupportedKeys.has(entry.key)) continue;
    const snapshot = entry.snapshot;
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
  return { stateUpdates, supportKeysByAttachment, unsupportedKeys };
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
    default:
      throw new Error(`Unsupported sub-level attachment rule ${String(rule)} for ${snapshot.typeId}.`);
  }
}
function hasSubLevelSupportRule(snapshot) {
  return supportRuleOf(snapshot) !== void 0;
}
function supportRuleOf(snapshot) {
  return getSubLevelBlockRegistration(snapshot.typeId)?.support;
}
function isSolidAttachmentHost(snapshot) {
  return snapshot !== void 0 && !hasSubLevelSupportRule(snapshot);
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
  resolveSubLevelBlockSupport
};
