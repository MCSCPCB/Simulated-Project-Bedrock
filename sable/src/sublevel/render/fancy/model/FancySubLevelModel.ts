import type { SubLevelBlock, SubLevelBlockMapColor } from "../../../SubLevel.js";

export type FancySubLevelMaterial = "opaque" | "alpha_test" | "alpha_test_tint" | "opaque_tint";

/** Descriptor pool an individual model can share with its neighbours. */
export interface FancySubLevelModelPool {
  readonly entityTypeId: string;
  readonly family: number;
  readonly xBits: number;
  readonly yBits: number;
  readonly zBits: number;
  readonly familyBits: number;
  readonly stateBits: number;
}
export type FancySubLevelFacing = "north" | "east" | "south" | "west";

export type FancySubLevelAxis = "y" | "x" | "z";

export interface FullBlockModelDescription {
  readonly type: "full_block";
  readonly textures: Readonly<Record<"up" | "down" | FancySubLevelFacing, string>>;
}

export interface PillarModelDescription {
  readonly type: "pillar" | "creaking_heart";
  readonly textures: Readonly<{ side: string; top: string }>;
  readonly axis: FancySubLevelAxis;
}

export interface ChestModelDescription {
  readonly type: "chest";
  readonly texture: string;
  readonly facing: FancySubLevelFacing;
}

export interface BeeNestModelDescription {
  readonly type: "bee_nest";
  readonly textures: Readonly<{ down: string; up: string; front: string; side: string }>;
  readonly direction: number;
}

export interface CocoaModelDescription {
  readonly type: "cocoa";
  readonly texture: string;
  readonly direction: number;
  readonly age: 0 | 1 | 2;
}

export interface VineModelDescription {
  readonly type: "vine";
  readonly texture: string;
  readonly faces: readonly FancySubLevelFacing[];
}

export interface SingleTextureModelDescription {
  readonly type: "hanging_roots";
  readonly texture: string;
}

export interface MangrovePropaguleModelDescription {
  readonly type: "mangrove_propagule";
  readonly texture: string;
  readonly stage: number;
}

export interface PaleHangingMossModelDescription {
  readonly type: "pale_hanging_moss";
  readonly texture: string;
  readonly tip: boolean;
}

export interface RootModelDescription {
  readonly type: "mangrove_roots";
  readonly textures: Readonly<{ top: string; side: string }>;
}

export type FancySubLevelModelDescription =
  | FullBlockModelDescription
  | PillarModelDescription
  | ChestModelDescription
  | BeeNestModelDescription
  | CocoaModelDescription
  | VineModelDescription
  | SingleTextureModelDescription
  | MangrovePropaguleModelDescription
  | PaleHangingMossModelDescription
  | RootModelDescription;

export type FancySubLevelTint =
  | { readonly method: "foliage" }
  | { readonly method: "fixed"; readonly color: string; readonly palette: number };

export interface FancySubLevelModelStateDimension {
  readonly name: string;
  readonly minimum: number;
  readonly maximum: number;
  readonly value: number;
}

export interface FancySubLevelModelState {
  readonly bits: number;
  readonly dimensions: readonly FancySubLevelModelStateDimension[];
  update(state: number, dimension: string, value: number): number | undefined;
}

export interface FancySubLevelModel {
  readonly key: string;
  readonly denseEntityTypeId: string;
  readonly sparseEntityTypeId: string;
  readonly material: FancySubLevelMaterial;
  readonly description: FancySubLevelModelDescription;
  readonly tint?: FancySubLevelTint;
  readonly state?: FancySubLevelModelState;
  readonly pool?: FancySubLevelModelPool;
}

export interface FancySubLevelBlock {
  readonly block: SubLevelBlock;
  readonly model: FancySubLevelModel;
  readonly state: number;
}

export type CompiledCondition =
  | { readonly type: "literal"; readonly value: boolean | number | string }
  | { readonly type: "state"; readonly name: string }
  | { readonly type: "not"; readonly operand: CompiledCondition }
  | {
    readonly type: "binary";
    readonly operator: "&&" | "||" | "==" | "!=" | "<" | "<=" | ">" | ">=";
    readonly left: CompiledCondition;
    readonly right: CompiledCondition;
  };

export interface CompiledFancySubLevelModel {
  readonly key: string;
  readonly denseEntityTypeId: string;
  readonly sparseEntityTypeId: string;
  readonly material: FancySubLevelMaterial;
  readonly model: FancySubLevelModelDescription;
  readonly tint?: FancySubLevelTint;
  readonly pool?: FancySubLevelModelPool;
}

export type SubLevelSupportRule =
  | "none"
  | "facing_log"
  | "above_solid"
  | "above_leaf"
  | "moss_column"
  | "vine_faces";

export interface CompiledBlockRegistration {
  readonly category: string;
  readonly hardness?: number;
  readonly placeable?: boolean;
  readonly passable?: boolean;
  readonly support?: SubLevelSupportRule;
  readonly states: readonly string[];
  readonly variants: readonly {
    readonly condition: CompiledCondition;
    readonly model: CompiledFancySubLevelModel | null;
  }[];
  readonly default: CompiledFancySubLevelModel | null;
}

export type CompiledBlockRegistry = Readonly<
  Record<string, CompiledBlockRegistration>
>;

export interface FancySubLevelTintContext {
  readonly mapColor?: SubLevelBlockMapColor;
}
