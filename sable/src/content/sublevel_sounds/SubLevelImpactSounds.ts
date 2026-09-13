// Sub-level impact sound cooldown and pruning: the per-body collision sound
// throttle that prevents multiple impacts from the same body within a short
// window from producing overlapping audio. Migrated from the collision sound
// subscription and pruneImpactCooldowns in TreePhysics src/Main.ts.
import type { PhysicsCollisionAfterEvent } from "../../api/physics/PhysicsTypes.js";
import type { SubLevelPhysicsSystem } from "../../sublevel/system/SubLevelPhysicsSystem.js";
import { resolveVanillaBlockBreakSound } from "./SubLevelBlockSounds.js";

const IMPACT_COOLDOWN_PRUNE_INTERVAL_TICKS = 1200;
const IMPACT_SOUND_MIN_SPEED = 1.5;
const IMPACT_SOUND_COOLDOWN_TICKS = 8;

export class SubLevelImpactSounds {
  readonly #physics: SubLevelPhysicsSystem;
  readonly #lastImpactTickByBody = new Map<number, number>();

  constructor(physics: SubLevelPhysicsSystem) {
    this.#physics = physics;
  }

  handleCollision(event: PhysicsCollisionAfterEvent, collisionTypeId: string | undefined): void {
    if (event.impactSpeed < IMPACT_SOUND_MIN_SPEED) return;
    const previousTick = this.#lastImpactTickByBody.get(event.body.id) ?? -100;
    if (event.currentTick - previousTick < IMPACT_SOUND_COOLDOWN_TICKS) return;
    this.#lastImpactTickByBody.set(event.body.id, event.currentTick);
    const sound = resolveVanillaBlockBreakSound(collisionTypeId);
    try {
      event.body.dimension.dimension.playSound(sound.sound, event.point, {
        pitch: Math.min(1.2, 0.75 + event.impactSpeed * 0.02),
        volume: sound.volume
      });
    } catch {
      // Physics remains valid if a client cannot resolve this sound id.
    }
  }

  tick(currentTick: number): void {
    if (currentTick % IMPACT_COOLDOWN_PRUNE_INTERVAL_TICKS === 0) {
      this.#pruneImpactCooldowns();
    }
  }

  #pruneImpactCooldowns(): void {
    const liveBodyIds = new Set(
      this.#physics.getDimensions().flatMap(dimension => dimension.getBodies().map(body => body.id))
    );
    for (const bodyId of this.#lastImpactTickByBody.keys()) {
      if (!liveBodyIds.has(bodyId)) this.#lastImpactTickByBody.delete(bodyId);
    }
  }
}
