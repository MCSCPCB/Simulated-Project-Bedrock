import { system } from "@minecraft/server";
import type { Block, Player } from "@minecraft/server";
import type { HoldTipResult } from "../../../util/hold_interaction/HoldTipManager.js";

const PHYSICS_ASSEMBLER = "simulated:physics_assembler";
const LEVER_FRAME_MAJOR = "simulated:lever_frame_major";
const LEVER_FRAME_MINOR = "simulated:lever_frame_minor";
const TICK_SOUND = "block.physics_assembler.tick";
const SHIFT_SOUND = "block.physics_assembler.shift";
const FRAME_MIN = 0;
const FRAME_MAX = 255;
const ASSEMBLE_TEXT = "simulated.gui.hold_tip.hold_to_assemble";
const DISASSEMBLE_TEXT = "simulated.gui.hold_tip.hold_to_disassemble";
// 60 frames per game tick completes a full 0..255.
const FRAMES_PER_TICK = 60;

const activeAnimations = new Map<string, number>();
type HoldTipMode = "assemble" | "disassemble";
const stableHoldTipModes = new Map<string, HoldTipMode>();

function clampFrame(value: number): number {
    return Math.max(FRAME_MIN, Math.min(FRAME_MAX, Math.round(value)));
}

export function getLeverFrame(block: Block): number {
    const major = Number(block.permutation.getState(LEVER_FRAME_MAJOR) ?? 0);
    const minor = Number(block.permutation.getState(LEVER_FRAME_MINOR) ?? 0);
    return clampFrame(major * 16 + minor);
}

function holdTipBlockKey(block: Block): string {
    const { x, y, z } = block.location;
    return `${block.dimension.id}:${x},${y},${z}`;
}

function holdTipModeForBlock(block: Block): HoldTipMode {
    const frame = getLeverFrame(block);
    const key = holdTipBlockKey(block);

    if (frame <= FRAME_MIN) {
        stableHoldTipModes.set(key, "assemble");
        return "assemble";
    }
    if (frame >= FRAME_MAX) {
        stableHoldTipModes.set(key, "disassemble");
        return "disassemble";
    }

    // Intermediate values are animation frames. Keep the last stable endpoint
    // so the prompt does not change while the lever is moving.
    const stableMode = stableHoldTipModes.get(key);
    if (stableMode) return stableMode;
    return frame < FRAME_MAX / 2 ? "assemble" : "disassemble";
}

/** Resolves the hold-tip behavior owned by a physics assembler block entity. */
export function getPhysicsAssemblerHoldTip(block: Block): HoldTipResult {
    const mode = holdTipModeForBlock(block);
    return {
        key: mode,
        text: {
            translate: mode === "assemble" ? ASSEMBLE_TEXT : DISASSEMBLE_TEXT,
        },
    };
}

function setBlockFrame(block: Block, frame: number): void {
    const clamped = clampFrame(frame);
    block.setPermutation(
        block.permutation
            .withState(LEVER_FRAME_MAJOR, Math.floor(clamped / 16))
            .withState(LEVER_FRAME_MINOR, clamped % 16),
    );
}

function animationKey(block: Block): string {
    const { x, y, z } = block.location;
    return `${block.dimension.id}:${x},${y},${z}`;
}

function playPlayerSound(player: Player, sound: string, volume: number, pitch: number): void {
    try {
        player.playSound(sound, { volume, pitch });
    } catch (error) {
        console.error(`[simulated] physics assembler sound failed: ${sound}`, error);
    }
}

/** Drives the block-state lever animation after a GUI value is submitted. */
export function animateLever(player: Player, block: Block, targetFrame: number): void {
    const key = animationKey(block);
    const previousAnimation = activeAnimations.get(key);
    if (previousAnimation !== undefined) {
        system.clearRun(previousAnimation);
        activeAnimations.delete(key);
    }

    const startFrame = getLeverFrame(block);
    const destinationFrame = clampFrame(targetFrame);
    const shouldReturn = destinationFrame !== FRAME_MIN
        && destinationFrame !== FRAME_MAX
        && destinationFrame !== startFrame;

    let currentFrame = startFrame;
    let destination = destinationFrame;
    let returning = false;
    let intervalId = 0;

    const finish = (completed: boolean): void => {
        system.clearRun(intervalId);
        if (activeAnimations.get(key) === intervalId) activeAnimations.delete(key);
        if (completed && player.isValid) playPlayerSound(player, SHIFT_SOUND, 0.7, 1.0);
    };

    intervalId = system.runInterval(() => {
        if (!player.isValid) {
            finish(false);
            return;
        }

        if (currentFrame === destination) {
            if (!returning && shouldReturn) {
                returning = true;
                destination = startFrame;
                return;
            }

            finish(true);
            return;
        }

        const nextFrame = currentFrame < destination
            ? Math.min(currentFrame + FRAMES_PER_TICK, destination)
            : Math.max(currentFrame - FRAMES_PER_TICK, destination);

        try {
            const currentBlock = block.dimension.getBlock(block.location);
            if (!currentBlock || currentBlock.typeId !== PHYSICS_ASSEMBLER) {
                finish(false);
                return;
            }

            setBlockFrame(currentBlock, nextFrame);
            currentFrame = nextFrame;
            playPlayerSound(player, TICK_SOUND, 0.5, 0.8 + (currentFrame / FRAME_MAX) * 0.3);
        } catch (error) {
            console.error("[simulated] physics assembler animation failed", error);
            finish(false);
        }
    }, 1);

    activeAnimations.set(key, intervalId);
}
