import { blockRegistry, missingModel } from "sable:sublevel-block-registry";
import type { SubLevelBlock, SubLevelBlockStates } from "../../../SubLevel.js";
import {
  type CompiledCondition,
  type CompiledFancySubLevelModel,
  type FancySubLevelBlock,
  type FancySubLevelModel
} from "./FancySubLevelModel.js";
import { createFancySubLevelModelState, encodeFancySubLevelModelState } from "./FancySubLevelModelTypes.js";

const modelCache = new Map<string, FancySubLevelModel>();

export function resolveFancySubLevelBlock(
  block: SubLevelBlock
): FancySubLevelBlock | undefined {
  const registration = blockRegistry[block.typeId];
  if (!registration) return undefined;
  const variant = registration.variants.find(entry => (
    evaluateCondition(entry.condition, block.states)
  ));
  const selected = variant ? variant.model : registration.default;
  // A null model routes this state combination to the hand-held route.
  if (!selected) return undefined;
  const model = materializeModel(selected);
  return { block, category: registration.category, model, state: encodeFancySubLevelModelState(model.description, block.states) };
}

export function hasFancySubLevelRegistration(typeId: string): boolean {
  return blockRegistry[typeId] !== undefined;
}

/** Block-level registry facts the interaction layer consumes. */
export function getSubLevelBlockRegistration(typeId: string): {
  readonly category: string;
  readonly hardness?: number;
  readonly mining?: import("./FancySubLevelModel.js").SubLevelMiningProperties;
  readonly placeable?: boolean;
  readonly passable?: boolean;
  readonly support?: import("./FancySubLevelModel.js").SubLevelSupportRule;
} | undefined {
  const registration = blockRegistry[typeId];
  if (!registration) return undefined;
  return {
    category: registration.category,
    hardness: registration.hardness,
    mining: registration.mining,
    placeable: registration.placeable,
    passable: registration.passable,
    support: registration.support
  };
}

/** Represents a block that neither normal route can express. */
export function resolveMissingFancySubLevelBlock(block: SubLevelBlock): FancySubLevelBlock {
  const model = materializeModel(missingModel);
  return { block, model, state: 0 };
}

function materializeModel(compiled: CompiledFancySubLevelModel): FancySubLevelModel {
  const cached = modelCache.get(compiled.key);
  if (cached) return cached;
  const model: FancySubLevelModel = {
    key: compiled.key,
    dense: compiled.dense,
    sparse: compiled.sparse,
    material: compiled.material,
    description: compiled.model,
    tint: compiled.tint,
    flipbook: compiled.flipbook,
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
