import type { Entity, Vector3 } from "@minecraft/server";
import type { SubLevelBlock } from "../SubLevel.js";

export const BLOCK_CARRIER_ENTITY_TYPE_ID = "sable:block_carrier";
// One native seat is reserved for an auxiliary rider.
export const BLOCK_CARRIER_CAPACITY = 511;
export const BLOCK_SLOTS_PER_ENTITY = 2;

export interface BlockCarrier {
  readonly entity: Entity;
  readonly riderIds: readonly string[];
}

export type BlockSlot = "mainhand" | "offhand";

export interface BlockAssignment {
  readonly block: SubLevelBlock;
  readonly entity: Entity;
  readonly slot: BlockSlot;
}

/** Lifecycle contract for one sub-level entity projection. */
export interface SubLevelRenderData {
  readonly initialPoseDeferred: boolean;
  readonly visualRotation: Readonly<Vector3>;
  readonly visualAnchorLocal: Vector3;
  readonly entityCount: number;
  readonly entityIds: readonly string[];
  readonly entityLocations: readonly Vector3[];
  readonly firstEntityLocation: Vector3 | undefined;
  hasEntity(entityId: string): boolean;
  hasKnownIntegrityFailure(): boolean;
  hasIntactEntities(): boolean;
  releaseInitialPose(): void;
  remove(): void;
  removeBlocks(blockKeys: ReadonlySet<string>): void;
  sync(force?: boolean): number;
}
