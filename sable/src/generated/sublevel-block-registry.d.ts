declare module "sable:sublevel-block-registry" {
  export const blockRegistry: import(
    "../sublevel/render/fancy/model/FancySubLevelModel.js"
  ).CompiledBlockRegistry;
  export const missingModel: import(
    "../sublevel/render/fancy/model/FancySubLevelModel.js"
  ).CompiledFancySubLevelModel;
}
