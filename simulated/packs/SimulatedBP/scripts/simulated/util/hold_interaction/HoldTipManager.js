import { GameMode, system, world } from "@minecraft/server";
const HOLD_TIP_PREFIX = "simulated.hold_tip:";
const HOLD_TIP_STEADY_PREFIX = "simulated.hold_tip.steady:";
const HOLD_TIP_FADE_PREFIX = "simulated.hold_tip.fade:";
const DEFAULT_MAX_DISTANCE = 6;
const REFRESH_INTERVAL_TICKS = 40;
const FADE_OUT_TICKS = 5;
const definitions = [];
const activeTips = /* @__PURE__ */ new Map();
const hoverWarmups = /* @__PURE__ */ new Map();
let managerStarted = false;
let currentTick = 0;
function maxRaycastDistance() {
  return definitions.reduce(
    (distance, definition) => Math.max(distance, definition.maxDistance ?? DEFAULT_MAX_DISTANCE),
    DEFAULT_MAX_DISTANCE
  );
}
function toSubtitlePayload(text, prefix) {
  return {
    rawtext: [
      { text: prefix },
      typeof text === "string" ? { text } : text
    ]
  };
}
function setTipSubtitle(player, text, prefix) {
  try {
    const payload = toSubtitlePayload(text, prefix);
    player.onScreenDisplay.setTitle("", {
      fadeInDuration: 0,
      stayDuration: 1e6,
      fadeOutDuration: 0,
      subtitle: payload
    });
    player.onScreenDisplay.updateSubtitle(payload);
    return true;
  } catch (error) {
    console.error("[simulated] hold tip subtitle display failed", error);
    return false;
  }
}
function canDisplayHoldTip(player) {
  try {
    const gameMode = player.getGameMode();
    return gameMode !== GameMode.Spectator && gameMode !== GameMode.Adventure && !player.isSneaking;
  } catch (error) {
    console.error("[simulated] hold tip interaction check failed", error);
    return false;
  }
}
function clearTip(player) {
  if (!activeTips.has(player.id)) return;
  try {
    if (player.isValid) player.onScreenDisplay.updateSubtitle("");
  } catch (error) {
    console.error("[simulated] hold tip subtitle clear failed", error);
  }
  activeTips.delete(player.id);
}
function updatePlayer(player) {
  if (!player.isValid) {
    activeTips.delete(player.id);
    hoverWarmups.delete(player.id);
    return;
  }
  let hoverWarmup = hoverWarmups.get(player.id) ?? 0;
  if (hoverWarmup > 0) hoverWarmup--;
  let resolved;
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
      resolved = void 0;
    } else {
      hoverWarmup++;
    }
  }
  hoverWarmups.set(player.id, hoverWarmup);
  const active = activeTips.get(player.id);
  if (!resolved) {
    if (!active) return;
    if (active.fadeUntilTick === void 0) {
      if (setTipSubtitle(player, active.text, HOLD_TIP_FADE_PREFIX)) {
        active.fadeUntilTick = currentTick + FADE_OUT_TICKS;
      }
    } else if (currentTick >= active.fadeUntilTick) {
      clearTip(player);
    }
    return;
  }
  const key = `${resolved.definition.id}:${resolved.result.key}`;
  if (!active) {
    if (setTipSubtitle(player, resolved.result.text, HOLD_TIP_PREFIX)) {
      activeTips.set(player.id, {
        key,
        text: resolved.result.text,
        lastSetTick: currentTick
      });
    }
    return;
  }
  if (active.key !== key) {
    if (setTipSubtitle(player, resolved.result.text, HOLD_TIP_STEADY_PREFIX)) {
      active.key = key;
      active.text = resolved.result.text;
      active.lastSetTick = currentTick;
      active.fadeUntilTick = void 0;
    }
    return;
  }
  if (active.fadeUntilTick !== void 0) {
    if (setTipSubtitle(player, resolved.result.text, HOLD_TIP_PREFIX)) {
      active.text = resolved.result.text;
      active.lastSetTick = currentTick;
      active.fadeUntilTick = void 0;
    }
    return;
  }
  if (currentTick - active.lastSetTick >= REFRESH_INTERVAL_TICKS) {
    if (setTipSubtitle(player, active.text, HOLD_TIP_STEADY_PREFIX)) {
      active.lastSetTick = currentTick;
    }
  }
}
function updatePlayers() {
  currentTick++;
  for (const player of world.getAllPlayers()) updatePlayer(player);
}
function registerHoldTip(definition) {
  const existing = definitions.findIndex((entry) => entry.id === definition.id);
  if (existing >= 0) definitions[existing] = definition;
  else definitions.push(definition);
}
function initHoldTipManager() {
  if (managerStarted) return;
  managerStarted = true;
  system.runInterval(updatePlayers, 1);
}
export {
  initHoldTipManager,
  registerHoldTip
};
