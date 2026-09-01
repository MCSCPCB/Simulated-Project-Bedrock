import { system } from "@minecraft/server";
const PHYSICS_ASSEMBLER = "simulated:physics_assembler";
const LEVER_FRAME_MAJOR = "simulated:lever_frame_major";
const LEVER_FRAME_MINOR = "simulated:lever_frame_minor";
const TICK_SOUND = "block.physics_assembler.tick";
const SHIFT_SOUND = "block.physics_assembler.shift";
const FRAME_MIN = 0;
const FRAME_MAX = 255;
const FRAMES_PER_TICK = 60;
const activeAnimations = /* @__PURE__ */ new Map();
function clampFrame(value) {
  return Math.max(FRAME_MIN, Math.min(FRAME_MAX, Math.round(value)));
}
function getLeverFrame(block) {
  const major = Number(block.permutation.getState(LEVER_FRAME_MAJOR) ?? 0);
  const minor = Number(block.permutation.getState(LEVER_FRAME_MINOR) ?? 0);
  return clampFrame(major * 16 + minor);
}
function setBlockFrame(block, frame) {
  const clamped = clampFrame(frame);
  block.setPermutation(
    block.permutation.withState(LEVER_FRAME_MAJOR, Math.floor(clamped / 16)).withState(LEVER_FRAME_MINOR, clamped % 16)
  );
}
function animationKey(block) {
  const { x, y, z } = block.location;
  return `${block.dimension.id}:${x},${y},${z}`;
}
function playPlayerSound(player, sound, volume, pitch) {
  try {
    player.playSound(sound, { volume, pitch });
  } catch (error) {
    console.error(`[simulated] physics assembler sound failed: ${sound}`, error);
  }
}
function animateLever(player, block, targetFrame) {
  const key = animationKey(block);
  const previousAnimation = activeAnimations.get(key);
  if (previousAnimation !== void 0) {
    system.clearRun(previousAnimation);
    activeAnimations.delete(key);
  }
  const startFrame = getLeverFrame(block);
  const destinationFrame = clampFrame(targetFrame);
  const shouldReturn = destinationFrame !== FRAME_MIN && destinationFrame !== FRAME_MAX && destinationFrame !== startFrame;
  let currentFrame = startFrame;
  let destination = destinationFrame;
  let returning = false;
  let intervalId = 0;
  const finish = (completed) => {
    system.clearRun(intervalId);
    if (activeAnimations.get(key) === intervalId) activeAnimations.delete(key);
    if (completed && player.isValid) playPlayerSound(player, SHIFT_SOUND, 0.7, 1);
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
    const nextFrame = currentFrame < destination ? Math.min(currentFrame + FRAMES_PER_TICK, destination) : Math.max(currentFrame - FRAMES_PER_TICK, destination);
    try {
      const currentBlock = block.dimension.getBlock(block.location);
      if (!currentBlock || currentBlock.typeId !== PHYSICS_ASSEMBLER) {
        finish(false);
        return;
      }
      setBlockFrame(currentBlock, nextFrame);
      currentFrame = nextFrame;
      playPlayerSound(player, TICK_SOUND, 0.5, 0.8 + currentFrame / FRAME_MAX * 0.3);
    } catch (error) {
      console.error("[simulated] physics assembler animation failed", error);
      finish(false);
    }
  }, 1);
  activeAnimations.set(key, intervalId);
}
export {
  animateLever,
  getLeverFrame
};
