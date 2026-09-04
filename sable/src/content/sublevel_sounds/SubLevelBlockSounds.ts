import {
  VANILLA_BLOCK_BREAK_SOUND_EVENT_INDICES,
  VANILLA_BLOCK_BREAK_SOUND_EVENTS,
  VANILLA_BLOCK_HIT_SOUND_EVENT_INDICES,
  VANILLA_BLOCK_HIT_SOUND_EVENTS,
  VANILLA_BLOCK_PLACE_SOUND_EVENT_INDICES,
  VANILLA_BLOCK_PLACE_SOUND_EVENTS,
  type GeneratedBlockSoundEvent
} from "../../data/BlockSoundEvents.js";

const DEFAULT_BLOCK_BREAK_EVENT = ["dig.wood", 0.8, 1, 1, 1] as const;
const DEFAULT_BLOCK_HIT_EVENT = ["hit.wood", 0.5, 0.5, 0.23, 0.23] as const;
const DEFAULT_BLOCK_PLACE_EVENT = ["place.wood", 0.8, 0.8, 1, 1] as const;
const DEFAULT_LEAF_BREAK_EVENT = ["dig.grass", 0.8, 1, 0.7, 0.7] as const;
const DEFAULT_LEAF_HIT_EVENT = ["hit.grass", 0.5, 0.5, 0.3, 0.3] as const;

export interface VanillaBlockSoundEvent {
  readonly pitch: number;
  readonly sound: string;
  readonly volume: number;
}

/** Resolves the complete vanilla block-break event, including sounds.json gain and pitch. */
export function resolveVanillaBlockBreakSound(
  typeId: string | undefined,
  random: () => number = Math.random
): VanillaBlockSoundEvent {
  return sampleSoundEvent(resolveBreakTemplate(typeId), random);
}

/** Resolves the complete vanilla block-place event, including sounds.json gain and pitch. */
export function resolveVanillaBlockPlaceSound(
  typeId: string | undefined,
  random: () => number = Math.random
): VanillaBlockSoundEvent {
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

/** Picks the most common break event across a removed block set, then samples it. */
export function selectDominantVanillaBlockBreakSound(
  typeIds: readonly string[],
  random: () => number = Math.random
): VanillaBlockSoundEvent {
  if (typeIds.length === 0) return sampleSoundEvent(DEFAULT_BLOCK_BREAK_EVENT, random);
  const counts = new Map<string, number>();
  // The non-empty guard above ensures the first iteration's count (1) beats
  // selectedCount (0) and overwrites this initializer, which exists only to
  // satisfy definite assignment.
  let selected: GeneratedBlockSoundEvent = DEFAULT_BLOCK_BREAK_EVENT;
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

/** Resolves the vanilla mining-hit event; unknown leaves use grass, other unknown blocks use wood. */
export function resolveVanillaBlockHitSound(
  typeId: string | undefined,
  random: () => number = Math.random
): VanillaBlockSoundEvent {
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

function resolveBreakTemplate(typeId: string | undefined): GeneratedBlockSoundEvent {
  const normalized = normalizeTypeId(typeId);
  return lookupGeneratedEvent(
    VANILLA_BLOCK_BREAK_SOUND_EVENTS,
    VANILLA_BLOCK_BREAK_SOUND_EVENT_INDICES,
    normalized
  ) ?? leafAwareDefault(normalized, DEFAULT_LEAF_BREAK_EVENT, DEFAULT_BLOCK_BREAK_EVENT);
}

/** Looks up the sounds.json-derived event for a normalized type id, if the generated tables cover it. */
function lookupGeneratedEvent(
  events: readonly GeneratedBlockSoundEvent[],
  indices: Readonly<Record<string, number>>,
  normalized: string | undefined
): GeneratedBlockSoundEvent | undefined {
  if (normalized === undefined) return undefined;
  const index = indices[normalized];
  return index === undefined ? undefined : events[index];
}

/** Unknown leaves use the leaf default; every other unknown block uses the wood default. */
function leafAwareDefault(
  normalized: string | undefined,
  leafEvent: GeneratedBlockSoundEvent,
  blockEvent: GeneratedBlockSoundEvent
): GeneratedBlockSoundEvent {
  return normalized !== undefined && isLeafTypeId(normalized) ? leafEvent : blockEvent;
}

function isLeafTypeId(typeId: string): boolean {
  const separator = typeId.indexOf(":");
  const name = separator >= 0 ? typeId.slice(separator + 1) : typeId;
  return name === "leaves"
    || name === "leaves2"
    || name.endsWith("_leaves")
    || name === "azalea_leaves_flowered";
}

function sampleSoundEvent(
  event: GeneratedBlockSoundEvent,
  random: () => number
): VanillaBlockSoundEvent {
  return {
    sound: event[0],
    pitch: sampleRange(event[1], event[2], random),
    volume: sampleRange(event[3], event[4], random)
  };
}

function sampleRange(minimum: number, maximum: number, random: () => number): number {
  return minimum === maximum ? minimum : minimum + (maximum - minimum) * random();
}

function normalizeTypeId(typeId: string | undefined): string | undefined {
  if (!typeId) return undefined;
  return typeId.includes(":") ? typeId : `minecraft:${typeId}`;
}
