import type { Vector3 } from "@minecraft/server";
import { add, blockLocationKey, parseBlockLocationKey } from "../../util/SableVector3Utils.js";
import type { SubLevelBlock } from "../../sublevel/SubLevel.js";
import { getSubLevelBlockRegistration } from "../../sublevel/render/fancy/model/FancySubLevelModelRegistry.js";

// Registry categories that stand in for the block classes the support rules
// reference; membership is entirely data-driven.
const LOG_HOST_CATEGORY = "building/logs_and_wood";
const LEAF_HOST_CATEGORY = "nature/leaves";

const ABOVE_OFFSET: Vector3 = { x: 0, y: 1, z: 0 };
const BELOW_OFFSET: Vector3 = { x: 0, y: -1, z: 0 };
// Horizontal directions indexed like the vanilla `direction` state, paired
// with the vine face bit each one supports.
const HORIZONTAL_SUPPORTS: readonly { readonly offset: Vector3; readonly bit: number }[] = [
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
] as const;

export interface SubLevelBlockSupportEntry {
  readonly key: string;
  readonly localLocation: Vector3;
  readonly snapshot: SubLevelBlock;
}

export interface SubLevelBlockSupportStateUpdate {
  readonly key: string;
  readonly snapshot: SubLevelBlock;
}

export interface SubLevelBlockSupportResolution {
  readonly stateUpdates: ReadonlyMap<string, SubLevelBlockSupportStateUpdate>;
  readonly supportKeysByAttachment: ReadonlyMap<string, readonly string[]>;
  readonly unsupportedKeys: ReadonlySet<string>;
}

/** Recomputes vanilla wall connection states after a local neighbor change. */
export function resolveSubLevelBlockNeighborStateUpdates(
  entries: readonly SubLevelBlockSupportEntry[],
  changedKeys: ReadonlySet<string>
): ReadonlyMap<string, SubLevelBlockSupportStateUpdate> {
  const entriesByKey = new Map(entries.map(entry => [entry.key, entry] as const));
  const affected = new Set<string>();
  for (const key of changedKeys) {
    const location = parseBlockLocationKey(key);
    for (const direction of [...WALL_DIRECTIONS, { name: "self", offset: { x: 0, y: 0, z: 0 } }]) {
      affected.add(blockLocationKey(add(location, direction.offset)));
    }
  }
  const updates = new Map<string, SubLevelBlockSupportStateUpdate>();
  for (const key of affected) {
    const entry = entriesByKey.get(key);
    if (!entry) continue;
    const registration = getSubLevelBlockRegistration(entry.snapshot.typeId);
    const states = registration?.support === "wall_connections"
      ? wallStates(entry.localLocation, entry.snapshot, entriesByKey)
      : entry.snapshot.typeId === "minecraft:pale_moss_carpet"
        ? paleMossCarpetStates(entry.localLocation, entry.snapshot, entriesByKey)
        : undefined;
    if (!states) continue;
    if (statesEqual(entry.snapshot.states ?? {}, states)) continue;
    updates.set(key, { key, snapshot: { ...entry.snapshot, states } });
  }
  return updates;
}

function paleMossCarpetStates(
  location: Vector3,
  snapshot: SubLevelBlock,
  entries: ReadonlyMap<string, SubLevelBlockSupportEntry>
): NonNullable<SubLevelBlock["states"]> {
  const values: Record<string, boolean | number | string> = {};
  for (const direction of WALL_DIRECTIONS) {
    const neighbor = entries.get(blockLocationKey(add(location, direction.offset)))?.snapshot;
    values[`minecraft:pale_moss_carpet_side_${direction.name}`] = wallConnectionType(neighbor);
  }
  const current = snapshot.states ?? {};
  return Object.fromEntries(Object.keys(current).map(key => [key, values[key] ?? current[key]!])) as NonNullable<SubLevelBlock["states"]>;
}

/**
 * Resolves which attachments stay supported after the given keys are removed,
 * cascading top-down so an unsupported attachment cannot keep its dependents
 * alive, and rewriting per-face states (vine bits, moss tips) along the way.
 */
export function resolveSubLevelBlockSupport(
  entries: readonly SubLevelBlockSupportEntry[],
  removedKeys: ReadonlySet<string>
): SubLevelBlockSupportResolution {
  const entriesByKey = new Map<string, SubLevelBlockSupportEntry>();
  for (const entry of entries) {
    if (entriesByKey.has(entry.key)) {
      throw new RangeError(`Duplicate sub-level attachment support entry ${entry.key}.`);
    }
    entriesByKey.set(entry.key, entry);
  }

  const unsupportedKeys = new Set<string>();
  const stateUpdates = new Map<string, SubLevelBlockSupportStateUpdate>();
  const supportKeysByAttachment = new Map<string, readonly string[]>();
  const attachments = entries
    .filter(entry => hasSubLevelSupportRule(entry.snapshot) && !removedKeys.has(entry.key))
    .sort((left, right) => right.localLocation.y - left.localLocation.y);
  for (const entry of attachments) {
    if (
      removedKeys.has(entry.key)
      || unsupportedKeys.has(entry.key)
    ) continue;
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
  const remainingEntries = entries.filter(entry => !removedKeys.has(entry.key));
  const neighborUpdates = resolveSubLevelBlockNeighborStateUpdates(
    remainingEntries,
    removedKeys
  );
  for (const [key, update] of neighborUpdates) stateUpdates.set(key, update);
  return { stateUpdates, supportKeysByAttachment, unsupportedKeys };
}

interface AttachmentResolution {
  readonly states?: SubLevelBlock["states"];
  readonly supported: boolean;
  readonly supportKeys: readonly string[];
}

function resolveAttachment(
  location: Vector3,
  snapshot: SubLevelBlock,
  entriesByKey: ReadonlyMap<string, SubLevelBlockSupportEntry>,
  removedKeys: ReadonlySet<string>,
  unsupportedKeys: ReadonlySet<string>,
  stateUpdates: ReadonlyMap<string, SubLevelBlockSupportStateUpdate>
): AttachmentResolution {
  const read = (key: string): SubLevelBlock | undefined => {
    if (removedKeys.has(key) || unsupportedKeys.has(key)) return undefined;
    return stateUpdates.get(key)?.snapshot ?? entriesByKey.get(key)?.snapshot;
  };
  const keyAt = (offset: Vector3): string => blockLocationKey(add(location, offset));
  const rule = supportRuleOf(snapshot);
  switch (rule) {
    case "none":
      return { supported: true, supportKeys: [] };
    case "facing_log": {
      const direction = integerState(snapshot, "direction", 0, 3);
      const supportKey = keyAt(HORIZONTAL_SUPPORTS[direction]!.offset);
      const support = read(supportKey);
      return {
        supported: support !== undefined
          && getSubLevelBlockRegistration(support.typeId)?.category === LOG_HOST_CATEGORY,
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
      // Only the hanging form depends on the leaf above; the planted form
      // stands on its own.
      const hanging = stateValue(snapshot, "hanging");
      if (hanging !== true && hanging !== 1) {
        return { supported: true, supportKeys: [] };
      }
      const supportKey = keyAt(ABOVE_OFFSET);
      const support = read(supportKey);
      return {
        supported: support !== undefined
          && getSubLevelBlockRegistration(support.typeId)?.category === LEAF_HOST_CATEGORY,
        supportKeys: [supportKey]
      };
    }
    case "moss_column": {
      const supportKey = keyAt(ABOVE_OFFSET);
      const support = read(supportKey);
      const supported = support?.typeId === snapshot.typeId
        || isSolidAttachmentHost(support);
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
      const aboveBits = above?.typeId === snapshot.typeId
        ? integerState(above, "vine_direction_bits", 0, 15)
        : 0;
      let retainedBits = 0;
      const supportKeys: string[] = [];
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

function wallStates(
  location: Vector3,
  snapshot: SubLevelBlock,
  entries: ReadonlyMap<string, SubLevelBlockSupportEntry>
): NonNullable<SubLevelBlock["states"]> {
  const values: Record<string, boolean | number | string> = {};
  for (const direction of WALL_DIRECTIONS) {
    const neighbor = entries.get(blockLocationKey(add(location, direction.offset)))?.snapshot;
    const connection = wallConnectionType(neighbor);
    values[`minecraft:wall_connection_type_${direction.name}`] = connection;
  }
  const straight = (
    values["minecraft:wall_connection_type_north"] !== "none"
    && values["minecraft:wall_connection_type_south"] !== "none"
    && values["minecraft:wall_connection_type_east"] === "none"
    && values["minecraft:wall_connection_type_west"] === "none"
  ) || (
    values["minecraft:wall_connection_type_east"] !== "none"
    && values["minecraft:wall_connection_type_west"] !== "none"
    && values["minecraft:wall_connection_type_north"] === "none"
    && values["minecraft:wall_connection_type_south"] === "none"
  );
  values["minecraft:wall_post_bit"] = !straight;
  const current = snapshot.states ?? {};
  return Object.fromEntries(Object.keys(current).map(key => {
    const short = key.startsWith("minecraft:") ? key.slice(9) : key;
    return [key, values[`minecraft:${short}`] ?? current[key]!];
  }));
}

function wallConnectionType(snapshot: SubLevelBlock | undefined): "none" | "short" | "tall" {
  if (!snapshot || snapshot.collisionResponse === false) return "none";
  if (snapshot.typeId === "minecraft:moss_carpet" || snapshot.typeId === "minecraft:pale_moss_carpet") return "short";
  const registration = getSubLevelBlockRegistration(snapshot.typeId);
  if (registration?.support === "wall_connections") return "short";
  if (registration?.passable === true) return "short";
  return "tall";
}

/** A block is an attachment exactly when its registry entry declares a support rule. */
export function hasSubLevelSupportRule(snapshot: SubLevelBlock): boolean {
  return supportRuleOf(snapshot) !== undefined;
}

function supportRuleOf(snapshot: SubLevelBlock): string | undefined {
  return getSubLevelBlockRegistration(snapshot.typeId)?.support;
}

function isSolidAttachmentHost(snapshot: SubLevelBlock | undefined): boolean {
  return snapshot !== undefined && !hasSubLevelSupportRule(snapshot);
}

function integerState(
  snapshot: SubLevelBlock,
  name: string,
  minimum: number,
  maximum: number
): number {
  const value = stateValue(snapshot, name);
  if (!Number.isInteger(value) || (value as number) < minimum || (value as number) > maximum) {
    throw new RangeError(
      `Sub-level attachment ${snapshot.typeId} has invalid ${name} state ${String(value)}.`
    );
  }
  return value as number;
}

function stateValue(
  snapshot: SubLevelBlock,
  name: string
): boolean | number | string | undefined {
  return snapshot.states?.[name] ?? snapshot.states?.[`minecraft:${name}`];
}

function replaceState(
  snapshot: SubLevelBlock,
  name: string,
  value: boolean | number | string
): SubLevelBlock["states"] {
  const states = snapshot.states ?? {};
  const key = states[name] !== undefined ? name : `minecraft:${name}`;
  if (states[key] === undefined) {
    throw new Error(`Sub-level attachment ${snapshot.typeId} has no ${name} state.`);
  }
  return { ...states, [key]: value };
}

function statesEqual(
  left: NonNullable<SubLevelBlock["states"]>,
  right: NonNullable<SubLevelBlock["states"]>
): boolean {
  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);
  if (leftKeys.length !== rightKeys.length) return false;
  return leftKeys.every(key => left[key] === right[key]);
}
