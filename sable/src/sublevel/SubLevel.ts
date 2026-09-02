import type { Dimension, Vector3 } from "@minecraft/server";

export interface SubLevelBlockCollisionBox {
  readonly min: Vector3;
  readonly max: Vector3;
}

/** The captured block data consumed by the entity projection renderer. */
export interface SubLevelBlock {
  readonly collidable?: boolean;
  readonly collisionResponse?: boolean;
  readonly collisionShape?: "full" | "none" | readonly SubLevelBlockCollisionBox[];
  readonly itemTypeId?: string;
  readonly localLocation: Vector3;
  readonly rotation?: Vector3;
  readonly runtimeCollidable?: boolean;
  readonly typeId: string;
}

/** Pose operations required by the projection renderer. */
export interface SubLevelRenderBody {
  readonly isValid: boolean;
  readonly isSleeping?: boolean;
  getRotation(): Vector3;
  getVisualRotation?(reference?: Vector3): Vector3;
  localPointToWorld(location: Vector3): Vector3;
}

/** Minimal sub-level view used to create the Bedrock entity projection. */
export interface SubLevel {
  readonly body: SubLevelRenderBody;
  readonly blocks: readonly SubLevelBlock[];
  readonly dimension: Dimension;
  readonly visualEntityTags?: readonly string[];
  readonly onVisualEntityAdded?: (entityId: string) => void;
  readonly onVisualEntityRemoved?: (entityId: string) => void;
}
