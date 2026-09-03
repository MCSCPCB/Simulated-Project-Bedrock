import type { Entity, Vector3 } from "@minecraft/server";
import type { SubLevelBlock } from "../SubLevel.js";

export const BLOCK_CARRIER_ENTITY_TYPE_ID = "sable:block_carrier";
// Native seat count generated into every carrier entity; the script-side
// capacity keeps one seat free so a rider transfer never hits the native cap.
export const CARRIER_SEAT_COUNT = 512;
export const BLOCK_CARRIER_CAPACITY = CARRIER_SEAT_COUNT - 1;
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

export interface SubLevelRenderData {
  readonly supportsBlockAddition?: boolean;
  readonly emitsEntityAddedCallbacks?: boolean;
  readonly initialPoseDeferred: boolean;
  readonly renderRotation: Readonly<Vector3>;
  readonly renderAnchorLocal: Vector3;
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
  setBlockModelState?(blockKey: string, dimension: string, value: number): boolean;
  attachAuxiliaryRider?(entity: Entity): boolean;
  attachPersistentRider?(entity: Entity): boolean;
  detachAuxiliaryRider?(entity: Entity): void;
  detachPersistentRider?(entity: Entity, preserveEmptyCarrier?: boolean): void;
  removeEmptyPersistentRiderCarriers?(): void;
  addBlocks?(blocks: readonly SubLevelBlock[]): void;
  rebaseRenderAnchor?(blocks: readonly SubLevelBlock[]): void;
}
