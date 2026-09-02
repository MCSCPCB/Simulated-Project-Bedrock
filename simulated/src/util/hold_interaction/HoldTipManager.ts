import { GameMode, system, world } from "@minecraft/server";
import type { Block, Player, RawMessage } from "@minecraft/server";

export type HoldTipText = RawMessage | string;

export interface HoldTipContext {
    player: Player;
    block: Block;
}

export interface HoldTipResult {
    /** Stable value used to avoid restarting the HUD animation every tick. */
    key: string;
    text: HoldTipText;
}

export interface HoldTipDefinition {
    id: string;
    maxDistance?: number;
    matches?: (block: Block) => boolean;
    getTip: (context: HoldTipContext) => HoldTipResult | undefined;
}

const HOLD_TIP_PREFIX = "simulated.hold_tip:";
const HOLD_TIP_STEADY_PREFIX = "simulated.hold_tip.steady:";
const HOLD_TIP_FADE_PREFIX = "simulated.hold_tip.fade:";
const DEFAULT_MAX_DISTANCE = 6;
const REFRESH_INTERVAL_TICKS = 40;
const FADE_OUT_TICKS = 5;
const definitions: HoldTipDefinition[] = [];
const activeTips = new Map<string, {
    key: string;
    text: HoldTipText;
    lastSetTick: number;
    fadeUntilTick?: number;
}>();
const hoverWarmups = new Map<string, number>();
let managerStarted = false;
let currentTick = 0;

function maxRaycastDistance(): number {
    return definitions.reduce(
        (distance, definition) => Math.max(distance, definition.maxDistance ?? DEFAULT_MAX_DISTANCE),
        DEFAULT_MAX_DISTANCE,
    );
}

function toActionbarPayload(text: HoldTipText, prefix: string): RawMessage {
    return {
        rawtext: [
            { text: prefix },
            typeof text === "string" ? { text } : text,
        ],
    };
}

function setTipActionbar(player: Player, text: HoldTipText, prefix: string): boolean {
    try {
        const payload = toActionbarPayload(text, prefix);
        player.onScreenDisplay.setActionBar(payload);
        return true;
    } catch (error) {
        console.error("[simulated] hold tip actionbar display failed", error);
        return false;
    }
}

function canDisplayHoldTip(player: Player): boolean {
    try {
        const gameMode = player.getGameMode();
        return gameMode !== GameMode.Spectator
            && gameMode !== GameMode.Adventure
            && !player.isSneaking;
    } catch (error) {
        console.error("[simulated] hold tip interaction check failed", error);
        return false;
    }
}

function clearTip(player: Player): void {
    if (!activeTips.has(player.id)) return;
    try {
        if (player.isValid) player.onScreenDisplay.setActionBar("");
    } catch (error) {
        console.error("[simulated] hold tip actionbar clear failed", error);
    }
    activeTips.delete(player.id);
}

function updatePlayer(player: Player): void {
    if (!player.isValid) {
        activeTips.delete(player.id);
        hoverWarmups.delete(player.id);
        return;
    }

    let hoverWarmup = hoverWarmups.get(player.id) ?? 0;
    if (hoverWarmup > 0) hoverWarmup--;

    let resolved: { definition: HoldTipDefinition; result: HoldTipResult } | undefined;
    if (canDisplayHoldTip(player)) {
        try {
            const hit = player.getBlockFromViewDirection({ maxDistance: maxRaycastDistance() });
            if (hit) {
                for (const definition of definitions) {
                    if (definition.matches && !definition.matches(hit.block)) continue;

                    try {
                        const result = definition.getTip({ player, block: hit.block });
                        if (result) {
                            resolved = { definition, result };
                            break;
                        }
                    } catch (error) {
                        console.error(`[simulated] hold tip resolver failed: ${definition.id}`, error);
                    }
                }
            }
        } catch (error) {
            console.error("[simulated] hold tip raycast failed", error);
        }
    }

    if (resolved) {
        if (hoverWarmup < 6) {
            hoverWarmup += 2;
            resolved = undefined;
        } else {
            hoverWarmup++;
        }
    }
    hoverWarmups.set(player.id, hoverWarmup);

    const active = activeTips.get(player.id);
    if (!resolved) {
        if (!active) return;

        if (active.fadeUntilTick === undefined) {
            if (setTipActionbar(player, active.text, HOLD_TIP_FADE_PREFIX)) {
                active.fadeUntilTick = currentTick + FADE_OUT_TICKS;
            }
        } else if (currentTick >= active.fadeUntilTick) {
            clearTip(player);
        }
        return;
    }

    const key = `${resolved.definition.id}:${resolved.result.key}`;
    if (!active) {
        if (setTipActionbar(player, resolved.result.text, HOLD_TIP_PREFIX)) {
            activeTips.set(player.id, {
                key,
                text: resolved.result.text,
                lastSetTick: currentTick,
            });
        }
        return;
    }

    if (active.key !== key) {
        // A changed tip is already visible in the original HUD; do not restart
        // its fade-in merely because the text switched between assemble modes.
        if (setTipActionbar(player, resolved.result.text, HOLD_TIP_STEADY_PREFIX)) {
            active.key = key;
            active.text = resolved.result.text;
            active.lastSetTick = currentTick;
            active.fadeUntilTick = undefined;
        }
        return;
    }

    if (active.fadeUntilTick !== undefined) {
        if (setTipActionbar(player, resolved.result.text, HOLD_TIP_PREFIX)) {
            active.text = resolved.result.text;
            active.lastSetTick = currentTick;
            active.fadeUntilTick = undefined;
        }
        return;
    }

    if (currentTick - active.lastSetTick >= REFRESH_INTERVAL_TICKS) {
        if (setTipActionbar(player, active.text, HOLD_TIP_STEADY_PREFIX)) {
            active.lastSetTick = currentTick;
        }
    }
}

function updatePlayers(): void {
    currentTick++;
    for (const player of world.getAllPlayers()) updatePlayer(player);
}

/** Registers one reusable block-to-hold-tip resolver. */
export function registerHoldTip(definition: HoldTipDefinition): void {
    const existing = definitions.findIndex((entry) => entry.id === definition.id);
    if (existing >= 0) definitions[existing] = definition;
    else definitions.push(definition);
}

/** Starts the shared hold-tip raycast loop once. */
export function initHoldTipManager(): void {
    if (managerStarted) return;
    managerStarted = true;
    system.runInterval(updatePlayers, 1);
}
