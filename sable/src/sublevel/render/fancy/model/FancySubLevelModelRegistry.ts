import { blockRenderRegistry } from "sable:sublevel-block-render-registry";
import type { SubLevelBlock, SubLevelBlockStates } from "../../../SubLevel.js";
import {
  type CompiledCondition,
  type CompiledFancySubLevelModel,
  type FancySubLevelBlock,
  type FancySubLevelModel
} from "./FancySubLevelModel.js";
import { createFancySubLevelModelState } from "./FancySubLevelModelTypes.js";

const modelCache = new Map<string, FancySubLevelModel>();

const MISSING_MODEL: CompiledFancySubLevelModel = {
  denseEntityTypeId: "sable:fancy_model_missing_dense",
  key: "missing",
  material: "opaque",
  model: {
    textures: {
      down: "textures/blocks/missing_tile",
      east: "textures/blocks/missing_tile",
      north: "textures/blocks/missing_tile",
      south: "textures/blocks/missing_tile",
      up: "textures/blocks/missing_tile",
      west: "textures/blocks/missing_tile"
    },
    type: "full_block"
  },
  sparseEntityTypeId: "sable:fancy_model_missing_sparse"
};

export function resolveFancySubLevelBlock(
  block: SubLevelBlock
): FancySubLevelBlock | undefined {
  const registration = blockRenderRegistry[block.typeId];
  if (!registration) return undefined;
  const variant = registration.variants.find(entry => (
    evaluateCondition(entry.condition, block.states)
  ));
  const selected = variant ? variant.model : registration.default;
  // A null model routes this state combination to the hand-held route.
  if (!selected) return undefined;
  const model = materializeModel(selected);
  return { block, model, state: model.state?.dimensions[0]?.value ?? 0 };
}

export function hasFancySubLevelRegistration(typeId: string): boolean {
  return blockRenderRegistry[typeId] !== undefined;
}

/** Block-level registry facts the interaction layer consumes. */
export function getSubLevelBlockRegistration(typeId: string): {
  readonly category: string;
  readonly hardness?: number;
  readonly support?: import("./FancySubLevelModel.js").SubLevelSupportRule;
} | undefined {
  const registration = blockRenderRegistry[typeId];
  if (!registration) return undefined;
  return {
    category: registration.category,
    hardness: registration.hardness,
    support: registration.support
  };
}

/** Represents a block that neither normal route can express. */
export function resolveMissingFancySubLevelBlock(block: SubLevelBlock): FancySubLevelBlock {
  const model = materializeModel(MISSING_MODEL);
  return { block, model, state: 0 };
}

function materializeModel(compiled: CompiledFancySubLevelModel): FancySubLevelModel {
  const cached = modelCache.get(compiled.key);
  if (cached) return cached;
  const model: FancySubLevelModel = {
    key: compiled.key,
    denseEntityTypeId: compiled.denseEntityTypeId,
    sparseEntityTypeId: compiled.sparseEntityTypeId,
    material: compiled.material,
    description: compiled.model,
    tint: compiled.tint,
    state: createFancySubLevelModelState(compiled.model),
    pool: compiled.pool
  };
  modelCache.set(compiled.key, model);
  return model;
}

function evaluateCondition(
  condition: CompiledCondition,
  states: SubLevelBlockStates | undefined
): boolean {
  return Boolean(evaluate(condition, states));
}

function evaluate(
  condition: CompiledCondition,
  states: SubLevelBlockStates | undefined
): boolean | number | string | undefined {
  if (condition.type === "literal") return condition.value;
  if (condition.type === "state") return stateValue(states, condition.name);
  if (condition.type === "not") return !evaluate(condition.operand, states);
  if (condition.operator === "&&") {
    return Boolean(evaluate(condition.left, states))
      && Boolean(evaluate(condition.right, states));
  }
  if (condition.operator === "||") {
    return Boolean(evaluate(condition.left, states))
      || Boolean(evaluate(condition.right, states));
  }
  const left = evaluate(condition.left, states);
  const right = evaluate(condition.right, states);
  if (condition.operator === "==") return left === right;
  if (condition.operator === "!=") return left !== right;
  if (typeof left === "number" && typeof right === "number") {
    if (condition.operator === "<") return left < right;
    if (condition.operator === "<=") return left <= right;
    if (condition.operator === ">") return left > right;
    return left >= right;
  }
  if (typeof left === "string" && typeof right === "string") {
    if (condition.operator === "<") return left < right;
    if (condition.operator === "<=") return left <= right;
    if (condition.operator === ">") return left > right;
    return left >= right;
  }
  return false;
}

function stateValue(
  states: SubLevelBlockStates | undefined,
  name: string
): boolean | number | string | undefined {
  if (!states) return undefined;
  if (states[name] !== undefined) return states[name];
  const separator = name.indexOf(":");
  return separator >= 0 ? states[name.slice(separator + 1)] : states[`minecraft:${name}`];
}
