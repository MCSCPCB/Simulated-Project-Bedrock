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
export type FancySubLevelFace = FancySubLevelFacing | "up";

export interface FullBlockModelDescription {
  readonly type: "full_block";
  readonly textures: Readonly<Record<"up" | "down" | FancySubLevelFacing, string>>;
}

export interface ChestModelDescription {
  readonly type: "chest";
  readonly texture: string;
  readonly facing: FancySubLevelFacing;
}

export interface CocoaModelDescription {
  readonly type: "cocoa";
  readonly texture: string;
  readonly facing: FancySubLevelFacing;
  readonly age: 0 | 1 | 2;
}

export interface VineModelDescription {
  readonly type: "vine";
  readonly texture: string;
  readonly faces: readonly FancySubLevelFace[];
}

export interface SingleTextureModelDescription {
  readonly type: "hanging_roots";
  readonly texture: string;
}

export interface MangrovePropaguleModelDescription {
  readonly type: "mangrove_propagule";
  readonly texture: string;
  readonly hanging: boolean;
  readonly stage: number;
}

export interface PaleHangingMossModelDescription {
  readonly type: "pale_hanging_moss";
  readonly texture: string;
  readonly tip: boolean;
}

export interface RootModelDescription {
  readonly type: "mangrove_roots" | "muddy_mangrove_roots";
  readonly textures: Readonly<{ top: string; side: string }>;
}

export type FancySubLevelModelDescription =
  | FullBlockModelDescription
  | ChestModelDescription
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

export interface CompiledBlockRenderRegistration {
  readonly states: readonly string[];
  readonly variants: readonly {
    readonly condition: CompiledCondition;
    readonly model: CompiledFancySubLevelModel;
  }[];
  readonly default: CompiledFancySubLevelModel;
}

export type CompiledBlockRenderRegistry = Readonly<
  Record<string, CompiledBlockRenderRegistration>
>;

export interface FancySubLevelTintContext {
  readonly mapColor?: SubLevelBlockMapColor;
}
