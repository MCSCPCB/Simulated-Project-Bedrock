import {
  VANILLA_BLOCK_BREAK_SOUND_EVENT_INDICES,
  VANILLA_BLOCK_BREAK_SOUND_EVENTS,
  VANILLA_BLOCK_HIT_SOUND_EVENT_INDICES,
  VANILLA_BLOCK_HIT_SOUND_EVENTS,
  VANILLA_BLOCK_PLACE_SOUND_EVENT_INDICES,
  VANILLA_BLOCK_PLACE_SOUND_EVENTS
} from "../../data/BlockSoundEvents.js";
const DEFAULT_BLOCK_BREAK_EVENT = ["dig.wood", 0.8, 1, 1, 1];
const DEFAULT_BLOCK_HIT_EVENT = ["hit.wood", 0.5, 0.5, 0.23, 0.23];
const DEFAULT_BLOCK_PLACE_EVENT = ["place.wood", 0.8, 0.8, 1, 1];
const DEFAULT_LEAF_BREAK_EVENT = ["dig.grass", 0.8, 1, 0.7, 0.7];
const DEFAULT_LEAF_HIT_EVENT = ["hit.grass", 0.5, 0.5, 0.3, 0.3];
function resolveVanillaBlockBreakSound(typeId, random = Math.random) {
  return sampleSoundEvent(resolveBreakTemplate(typeId), random);
}
function resolveVanillaBlockPlaceSound(typeId, random = Math.random) {
  const normalized = normalizeTypeId(typeId);
  return sampleSoundEvent(
    lookupGeneratedEvent(
      VANILLA_BLOCK_PLACE_SOUND_EVENTS,
      VANILLA_BLOCK_PLACE_SOUND_EVENT_INDICES,
      normalized
    ) ?? DEFAULT_BLOCK_PLACE_EVENT,
    random
  );
}
function selectDominantVanillaBlockBreakSound(typeIds, random = Math.random) {
  if (typeIds.length === 0) return sampleSoundEvent(DEFAULT_BLOCK_BREAK_EVENT, random);
  const counts = /* @__PURE__ */ new Map();
  let selected = DEFAULT_BLOCK_BREAK_EVENT;
  let selectedCount = 0;
  for (const typeId of typeIds) {
    const event = resolveBreakTemplate(typeId);
    const key = event.join("|");
    const count = (counts.get(key) ?? 0) + 1;
    counts.set(key, count);
    if (count > selectedCount) {
      selected = event;
      selectedCount = count;
    }
  }
  return sampleSoundEvent(selected, random);
}
function resolveVanillaBlockHitSound(typeId, random = Math.random) {
  const normalized = normalizeTypeId(typeId);
  const event = lookupGeneratedEvent(
    VANILLA_BLOCK_HIT_SOUND_EVENTS,
    VANILLA_BLOCK_HIT_SOUND_EVENT_INDICES,
    normalized
  );
  return sampleSoundEvent(
    event ?? leafAwareDefault(normalized, DEFAULT_LEAF_HIT_EVENT, DEFAULT_BLOCK_HIT_EVENT),
    random
  );
}
function resolveBreakTemplate(typeId) {
  const normalized = normalizeTypeId(typeId);
  return lookupGeneratedEvent(
    VANILLA_BLOCK_BREAK_SOUND_EVENTS,
    VANILLA_BLOCK_BREAK_SOUND_EVENT_INDICES,
    normalized
  ) ?? leafAwareDefault(normalized, DEFAULT_LEAF_BREAK_EVENT, DEFAULT_BLOCK_BREAK_EVENT);
}
function lookupGeneratedEvent(events, indices, normalized) {
  if (normalized === void 0) return void 0;
  const index = indices[normalized];
  return index === void 0 ? void 0 : events[index];
}
function leafAwareDefault(normalized, leafEvent, blockEvent) {
  return normalized !== void 0 && isLeafTypeId(normalized) ? leafEvent : blockEvent;
}
function isLeafTypeId(typeId) {
  const separator = typeId.indexOf(":");
  const name = separator >= 0 ? typeId.slice(separator + 1) : typeId;
  return name === "leaves" || name === "leaves2" || name.endsWith("_leaves") || name === "azalea_leaves_flowered";
}
function sampleSoundEvent(event, random) {
  return {
    sound: event[0],
    pitch: sampleRange(event[1], event[2], random),
    volume: sampleRange(event[3], event[4], random)
  };
}
function sampleRange(minimum, maximum, random) {
  return minimum === maximum ? minimum : minimum + (maximum - minimum) * random();
}
function normalizeTypeId(typeId) {
  if (!typeId) return void 0;
  return typeId.includes(":") ? typeId : `minecraft:${typeId}`;
}
export {
  resolveVanillaBlockBreakSound,
  resolveVanillaBlockHitSound,
  resolveVanillaBlockPlaceSound,
  selectDominantVanillaBlockBreakSound
};
