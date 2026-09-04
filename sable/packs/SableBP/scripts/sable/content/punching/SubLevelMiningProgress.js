import { PC_ATTACK_EQUIVALENT_TICKS } from "./SubLevelMiningTime.js";
const PLAYER_EDIT_MINING_RESET_TICKS = 10;
const MINING_STAGE_COUNT = 10;
const FINAL_MINING_STAGE = MINING_STAGE_COUNT - 1;
const COMPLETION_EPSILON = 1e-9;
class SubLevelMiningProgress {
  #lastTouchSignalByPlayer = /* @__PURE__ */ new Map();
  #progress = /* @__PURE__ */ new Map();
  advance(key, currentTick, targetBreakTicks, input) {
    const normalizedTargetTicks = normalizeTargetBreakTicks(targetBreakTicks);
    let contributionTicks = PC_ATTACK_EQUIVALENT_TICKS;
    if (input.type === "touch") {
      const lastSignal = this.#lastTouchSignalByPlayer.get(input.playerId);
      if (lastSignal?.tick === currentTick) return void 0;
      contributionTicks = lastSignal && lastSignal.key === key && currentTick > lastSignal.tick && currentTick - lastSignal.tick <= PLAYER_EDIT_MINING_RESET_TICKS ? currentTick - lastSignal.tick : 0;
      this.#lastTouchSignalByPlayer.set(input.playerId, { key, tick: currentTick });
    }
    const previous = this.#progress.get(key);
    const state = previous && currentTick - previous.lastProgressTick <= PLAYER_EDIT_MINING_RESET_TICKS ? previous : { lastProgressTick: currentTick, progress: 0 };
    const previousStage = previous === state ? progressStage(state.progress) : -1;
    state.progress += contributionTicks / normalizedTargetTicks;
    state.lastProgressTick = currentTick;
    if (state.progress >= 1 - COMPLETION_EPSILON) {
      this.#progress.delete(key);
      return {
        completed: true,
        progress: 1,
        stage: FINAL_MINING_STAGE,
        stageChanged: previousStage !== FINAL_MINING_STAGE
      };
    }
    this.#progress.set(key, state);
    return toProgressUpdate(state, previousStage);
  }
  clearSubLevel(subLevelId) {
    const prefix = `${subLevelId}|`;
    for (const key of this.#progress.keys()) {
      if (key.startsWith(prefix)) this.#progress.delete(key);
    }
  }
  clearPlayer(playerId) {
    this.#lastTouchSignalByPlayer.delete(playerId);
  }
  prune(currentTick) {
    if (this.#progress.size === 0) return;
    for (const [key, state] of this.#progress) {
      if (currentTick - state.lastProgressTick > PLAYER_EDIT_MINING_RESET_TICKS) {
        this.#progress.delete(key);
      }
    }
  }
}
function normalizeTargetBreakTicks(value) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError("Sub-level target break ticks must be a positive finite number.");
  }
  return value;
}
function toProgressUpdate(state, previousStage) {
  const stage = progressStage(state.progress);
  return {
    completed: false,
    progress: state.progress,
    stage,
    stageChanged: stage !== previousStage
  };
}
function progressStage(progress) {
  return Math.min(FINAL_MINING_STAGE, Math.floor(progress * MINING_STAGE_COUNT));
}
export {
  PLAYER_EDIT_MINING_RESET_TICKS,
  SubLevelMiningProgress
};
