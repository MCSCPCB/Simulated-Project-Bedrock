// Block-behavior extension point for sub-levels. The container dispatches the
// generic lifecycle (world capture, added, removed, sub-level teardown) through
// this registry; everything block-specific lives in the block's own content
// module and registers itself here. The main pipeline carries no block ids,
// block sets, or per-block branches.
import type { Dimension, Vector3 } from "@minecraft/server";
import type { SubLevelBlock } from "../../sublevel/SubLevel.js";
import type { SubLevelInteractionHandle } from "../../sublevel/system/SubLevelInteractionSystem.js";

/** A block still standing in the world, about to become a sub-level block. */
export interface SubLevelBlockWorldCapture {
  readonly block: SubLevelBlock;
  readonly dimension: Dimension;
  readonly worldLocation: Vector3;
}

export interface SubLevelBlockLifecycleEvent {
  readonly block: SubLevelBlock;
  readonly dimension: Dimension;
  readonly handle: SubLevelInteractionHandle;
  readonly ownerId: string;
  /** The captureWorldData result for this block, on capture-driven additions. */
  readonly worldData?: unknown;
}

export interface SubLevelBlockBehavior {
  /**
   * Reads world-side state that must survive the block's removal (run before
   * the source blocks are cleared). The returned value is handed back through
   * the matching onBlockAdded event.
   */
  captureWorldData?(capture: SubLevelBlockWorldCapture): unknown;
  /** The block entered a sub-level (initial capture or player placement). */
  onBlockAdded?(event: SubLevelBlockLifecycleEvent): void;
  /** The block left a sub-level through the edit pipeline. */
  onBlockRemoved?(event: SubLevelBlockLifecycleEvent): void;
  /** The whole sub-level is being torn down; release per-owner state. */
  onSubLevelRemoved?(ownerId: string, handle: SubLevelInteractionHandle): void;
}

export class SubLevelBlockBehaviorRegistry {
  readonly #byTypeId = new Map<string, SubLevelBlockBehavior>();

  register(typeId: string, behavior: SubLevelBlockBehavior): void {
    if (this.#byTypeId.has(typeId)) {
      throw new Error(`A sub-level block behavior for ${typeId} is already registered.`);
    }
    this.#byTypeId.set(typeId, behavior);
  }

  get(typeId: string): SubLevelBlockBehavior | undefined {
    return this.#byTypeId.get(typeId);
  }

  /** Every distinct behavior, for whole-sub-level notifications. */
  *behaviors(): IterableIterator<SubLevelBlockBehavior> {
    yield* new Set(this.#byTypeId.values());
  }
}
