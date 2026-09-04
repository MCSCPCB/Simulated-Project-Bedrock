import { blockRegistry } from "../../../../generated/sublevel-block-registry.js";
import { createFancySubLevelModelState } from "./FancySubLevelModelTypes.js";
const modelCache = /* @__PURE__ */ new Map();
const MISSING_MODEL = {
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
function resolveFancySubLevelBlock(block) {
  const registration = blockRegistry[block.typeId];
  if (!registration) return void 0;
  const variant = registration.variants.find((entry) => evaluateCondition(entry.condition, block.states));
  const selected = variant ? variant.model : registration.default;
  if (!selected) return void 0;
  const model = materializeModel(selected);
  return { block, model, state: model.state?.dimensions[0]?.value ?? 0 };
}
function hasFancySubLevelRegistration(typeId) {
  return blockRegistry[typeId] !== void 0;
}
function getSubLevelBlockRegistration(typeId) {
  const registration = blockRegistry[typeId];
  if (!registration) return void 0;
  return {
    category: registration.category,
    hardness: registration.hardness,
    support: registration.support
  };
}
function resolveMissingFancySubLevelBlock(block) {
  const model = materializeModel(MISSING_MODEL);
  return { block, model, state: 0 };
}
function materializeModel(compiled) {
  const cached = modelCache.get(compiled.key);
  if (cached) return cached;
  const model = {
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
function evaluateCondition(condition, states) {
  return Boolean(evaluate(condition, states));
}
function evaluate(condition, states) {
  if (condition.type === "literal") return condition.value;
  if (condition.type === "state") return stateValue(states, condition.name);
  if (condition.type === "not") return !evaluate(condition.operand, states);
  if (condition.operator === "&&") {
    return Boolean(evaluate(condition.left, states)) && Boolean(evaluate(condition.right, states));
  }
  if (condition.operator === "||") {
    return Boolean(evaluate(condition.left, states)) || Boolean(evaluate(condition.right, states));
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
function stateValue(states, name) {
  if (!states) return void 0;
  if (states[name] !== void 0) return states[name];
  const separator = name.indexOf(":");
  return separator >= 0 ? states[name.slice(separator + 1)] : states[`minecraft:${name}`];
}
export {
  getSubLevelBlockRegistration,
  hasFancySubLevelRegistration,
  resolveFancySubLevelBlock,
  resolveMissingFancySubLevelBlock
};
