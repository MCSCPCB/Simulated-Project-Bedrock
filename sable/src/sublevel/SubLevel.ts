import type { Dimension, Vector3 } from "@minecraft/server";

export type SubLevelBlockStates = Readonly<Record<string, boolean | number | string>>;

export interface SubLevelBlockMapColor {
  readonly blue: number;
  readonly green: number;
  readonly red: number;
}

export interface SubLevelFoliageTint {
  readonly gradientAxis: "x" | "z";
  readonly mapKind: number;
  readonly uAtLocalOrigin: number;
  readonly uPerLocalX: number;
  readonly vAtLocalOrigin: number;
  readonly vPerLocalZ: number;
}

export interface SubLevelBlockCollisionBox {
  readonly min: Vector3;
  readonly max: Vector3;
}

export interface SubLevelBlock {
  readonly collidable?: boolean;
  readonly collisionResponse?: boolean;
  readonly collisionShape?: "full" | "none" | readonly SubLevelBlockCollisionBox[];
  readonly itemTypeId?: string;
  readonly localLocation: Vector3;
  readonly mapColor?: SubLevelBlockMapColor;
  readonly rotation?: Vector3;
  readonly runtimeCollidable?: boolean;
  readonly states?: SubLevelBlockStates;
  readonly typeId: string;
}

export interface SubLevelRenderBody {
  readonly isValid: boolean;
  readonly isSleeping?: boolean;
  getRotation(): Vector3;
  getRenderRotation?(reference?: Vector3): Vector3;
  localPointToWorld(location: Vector3): Vector3;
}

export interface SubLevel {
  readonly body: SubLevelRenderBody;
  readonly blocks: readonly SubLevelBlock[];
  readonly dimension: Dimension;
  readonly foliageTint?: SubLevelFoliageTint;
  readonly onRenderEntityAdded?: (entityId: string) => void;
  readonly onRenderEntityRemoved?: (entityId: string) => void;
  readonly renderEntityTags?: readonly string[];
}
