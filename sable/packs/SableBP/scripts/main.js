// sable/packs/SableBP/scripts/main.entry.tmp.js
import { system as system10, world as world9 } from "@minecraft/server";

// sable/packs/SableBP/scripts/sable/SableCommonEvents.js
import { system as system9, world as world8 } from "@minecraft/server";

// sable/packs/SableBP/scripts/sable/api/block/SubLevelBlockBehaviors.js
var SubLevelBlockBehaviorRegistry = class {
  #byTypeId = /* @__PURE__ */ new Map();
  register(typeId, behavior) {
    if (this.#byTypeId.has(typeId)) {
      throw new Error(`A sub-level block behavior for ${typeId} is already registered.`);
    }
    this.#byTypeId.set(typeId, behavior);
  }
  get(typeId) {
    return this.#byTypeId.get(typeId);
  }
  /** Every distinct behavior, for whole-sub-level notifications. */
  *behaviors() {
    yield* new Set(this.#byTypeId.values());
  }
};

// sable/packs/SableBP/scripts/sable/api/sublevel/ServerSubLevelContainer.js
import {
  BlockPermutation,
  world as world2
} from "@minecraft/server";

// sable/packs/SableBP/scripts/sable/generated/sublevel-block-registry.js
var blockRegistry = { "minecraft:oak_log": { "category": "building/logs_and_wood", "hardness": 2, "states": ["minecraft:pillar_axis"], "variants": [{ "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "y" } }, "model": { "key": "14c1d86ba2d17c7b8361d688b6b8a44582a2b9ccbaff45a50ad803d7d0d16777", "denseEntityTypeId": "sable:fancy_model_oak_log_dense", "sparseEntityTypeId": "sable:fancy_model_oak_log_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/log_oak", "top": "textures/blocks/log_oak_top" }, "axis": "y" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_0", "family": 0, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "x" } }, "model": { "key": "3549767f655bb5dfe22b5e5a4b795859bb449638b1d5df6144e9622c1c254c65", "denseEntityTypeId": "sable:fancy_model_oak_log_x_dense", "sparseEntityTypeId": "sable:fancy_model_oak_log_x_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/log_oak", "top": "textures/blocks/log_oak_top" }, "axis": "x" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_0", "family": 1, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "z" } }, "model": { "key": "d296755777e28a236b83e2c0c928de5a284f1eab7fcc628e0ed4ac221399a539", "denseEntityTypeId": "sable:fancy_model_oak_log_z_dense", "sparseEntityTypeId": "sable:fancy_model_oak_log_z_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/log_oak", "top": "textures/blocks/log_oak_top" }, "axis": "z" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_0", "family": 2, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }], "default": { "key": "14c1d86ba2d17c7b8361d688b6b8a44582a2b9ccbaff45a50ad803d7d0d16777", "denseEntityTypeId": "sable:fancy_model_oak_log_dense", "sparseEntityTypeId": "sable:fancy_model_oak_log_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/log_oak", "top": "textures/blocks/log_oak_top" }, "axis": "y" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_0", "family": 0, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, "minecraft:spruce_log": { "category": "building/logs_and_wood", "hardness": 2, "states": ["minecraft:pillar_axis"], "variants": [{ "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "y" } }, "model": { "key": "359b4a0100e2fce09603e53f1770306a495bb91552797287a243c574064c9930", "denseEntityTypeId": "sable:fancy_model_spruce_log_dense", "sparseEntityTypeId": "sable:fancy_model_spruce_log_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/log_spruce", "top": "textures/blocks/log_spruce_top" }, "axis": "y" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_0", "family": 3, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "x" } }, "model": { "key": "34cf845044b9003039574af42dc10d4d37c3a44ad7483f88d7083f4b135a7b64", "denseEntityTypeId": "sable:fancy_model_spruce_log_x_dense", "sparseEntityTypeId": "sable:fancy_model_spruce_log_x_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/log_spruce", "top": "textures/blocks/log_spruce_top" }, "axis": "x" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_0", "family": 4, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "z" } }, "model": { "key": "ee9be9b08a1a04afbe40b743bb6095514d7a05757ea904166705e955169590a3", "denseEntityTypeId": "sable:fancy_model_spruce_log_z_dense", "sparseEntityTypeId": "sable:fancy_model_spruce_log_z_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/log_spruce", "top": "textures/blocks/log_spruce_top" }, "axis": "z" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_0", "family": 5, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }], "default": { "key": "359b4a0100e2fce09603e53f1770306a495bb91552797287a243c574064c9930", "denseEntityTypeId": "sable:fancy_model_spruce_log_dense", "sparseEntityTypeId": "sable:fancy_model_spruce_log_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/log_spruce", "top": "textures/blocks/log_spruce_top" }, "axis": "y" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_0", "family": 3, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, "minecraft:birch_log": { "category": "building/logs_and_wood", "hardness": 2, "states": ["minecraft:pillar_axis"], "variants": [{ "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "y" } }, "model": { "key": "504426c5152c31d574581b05210da294384a0b8bf7ded8f165caed89b0eee638", "denseEntityTypeId": "sable:fancy_model_birch_log_dense", "sparseEntityTypeId": "sable:fancy_model_birch_log_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/log_birch", "top": "textures/blocks/log_birch_top" }, "axis": "y" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_0", "family": 6, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "x" } }, "model": { "key": "b94778c61abaf5159d633db0aa03e9355815e695b3c4950be1c1776afcf565a5", "denseEntityTypeId": "sable:fancy_model_birch_log_x_dense", "sparseEntityTypeId": "sable:fancy_model_birch_log_x_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/log_birch", "top": "textures/blocks/log_birch_top" }, "axis": "x" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_0", "family": 7, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "z" } }, "model": { "key": "56c7006c44b9107febe869edc4ef3b82a3da961492a5af8d78461d44795c2718", "denseEntityTypeId": "sable:fancy_model_birch_log_z_dense", "sparseEntityTypeId": "sable:fancy_model_birch_log_z_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/log_birch", "top": "textures/blocks/log_birch_top" }, "axis": "z" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_0", "family": 8, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }], "default": { "key": "504426c5152c31d574581b05210da294384a0b8bf7ded8f165caed89b0eee638", "denseEntityTypeId": "sable:fancy_model_birch_log_dense", "sparseEntityTypeId": "sable:fancy_model_birch_log_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/log_birch", "top": "textures/blocks/log_birch_top" }, "axis": "y" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_0", "family": 6, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, "minecraft:jungle_log": { "category": "building/logs_and_wood", "hardness": 2, "states": ["minecraft:pillar_axis"], "variants": [{ "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "y" } }, "model": { "key": "759bf4d60268d154fd92b5f5f05a05ad10bda933457e0069cfecebc6076be2d2", "denseEntityTypeId": "sable:fancy_model_jungle_log_dense", "sparseEntityTypeId": "sable:fancy_model_jungle_log_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/log_jungle", "top": "textures/blocks/log_jungle_top" }, "axis": "y" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_0", "family": 9, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "x" } }, "model": { "key": "a91eeb953dbb4a8ea53d63d7f26c4214a44e1c039a45a1e7ca316cb009dd88a8", "denseEntityTypeId": "sable:fancy_model_jungle_log_x_dense", "sparseEntityTypeId": "sable:fancy_model_jungle_log_x_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/log_jungle", "top": "textures/blocks/log_jungle_top" }, "axis": "x" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_0", "family": 10, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "z" } }, "model": { "key": "df8d7e4822a97d72067b1e537cfeb4f720157ef6c1a4f98699b05787ea13fb52", "denseEntityTypeId": "sable:fancy_model_jungle_log_z_dense", "sparseEntityTypeId": "sable:fancy_model_jungle_log_z_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/log_jungle", "top": "textures/blocks/log_jungle_top" }, "axis": "z" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_0", "family": 11, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }], "default": { "key": "759bf4d60268d154fd92b5f5f05a05ad10bda933457e0069cfecebc6076be2d2", "denseEntityTypeId": "sable:fancy_model_jungle_log_dense", "sparseEntityTypeId": "sable:fancy_model_jungle_log_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/log_jungle", "top": "textures/blocks/log_jungle_top" }, "axis": "y" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_0", "family": 9, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, "minecraft:acacia_log": { "category": "building/logs_and_wood", "hardness": 2, "states": ["minecraft:pillar_axis"], "variants": [{ "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "y" } }, "model": { "key": "b50142667e84d7b985d3e4b74dced6acacf1c8e3ee6cc293b77ab555e19de34d", "denseEntityTypeId": "sable:fancy_model_acacia_log_dense", "sparseEntityTypeId": "sable:fancy_model_acacia_log_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/log_acacia", "top": "textures/blocks/log_acacia_top" }, "axis": "y" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_0", "family": 12, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "x" } }, "model": { "key": "f91aaad63066bc26fee187601bcc358980abef07c643245ce8018f0a236d096d", "denseEntityTypeId": "sable:fancy_model_acacia_log_x_dense", "sparseEntityTypeId": "sable:fancy_model_acacia_log_x_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/log_acacia", "top": "textures/blocks/log_acacia_top" }, "axis": "x" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_0", "family": 13, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "z" } }, "model": { "key": "814410f677015df39abc9392995bb436479db939def97d05d6d1d007051163d3", "denseEntityTypeId": "sable:fancy_model_acacia_log_z_dense", "sparseEntityTypeId": "sable:fancy_model_acacia_log_z_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/log_acacia", "top": "textures/blocks/log_acacia_top" }, "axis": "z" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_0", "family": 14, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }], "default": { "key": "b50142667e84d7b985d3e4b74dced6acacf1c8e3ee6cc293b77ab555e19de34d", "denseEntityTypeId": "sable:fancy_model_acacia_log_dense", "sparseEntityTypeId": "sable:fancy_model_acacia_log_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/log_acacia", "top": "textures/blocks/log_acacia_top" }, "axis": "y" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_0", "family": 12, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, "minecraft:dark_oak_log": { "category": "building/logs_and_wood", "hardness": 2, "states": ["minecraft:pillar_axis"], "variants": [{ "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "y" } }, "model": { "key": "88d985baeca94b1729fd9bf4e3bd0d4f9fc8afd1075fe17145077786202b48ff", "denseEntityTypeId": "sable:fancy_model_dark_oak_log_dense", "sparseEntityTypeId": "sable:fancy_model_dark_oak_log_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/log_big_oak", "top": "textures/blocks/log_big_oak_top" }, "axis": "y" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_0", "family": 15, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "x" } }, "model": { "key": "ba139c53d20f38f399953fc782e53f6a2a08b7f5acbbabee16b6af70940ce7e0", "denseEntityTypeId": "sable:fancy_model_dark_oak_log_x_dense", "sparseEntityTypeId": "sable:fancy_model_dark_oak_log_x_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/log_big_oak", "top": "textures/blocks/log_big_oak_top" }, "axis": "x" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_0", "family": 16, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "z" } }, "model": { "key": "abb8d1b7ce7446ee4a04e2b6ed3525580772fc749de180e1387ce1ee23d4686a", "denseEntityTypeId": "sable:fancy_model_dark_oak_log_z_dense", "sparseEntityTypeId": "sable:fancy_model_dark_oak_log_z_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/log_big_oak", "top": "textures/blocks/log_big_oak_top" }, "axis": "z" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_0", "family": 17, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }], "default": { "key": "88d985baeca94b1729fd9bf4e3bd0d4f9fc8afd1075fe17145077786202b48ff", "denseEntityTypeId": "sable:fancy_model_dark_oak_log_dense", "sparseEntityTypeId": "sable:fancy_model_dark_oak_log_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/log_big_oak", "top": "textures/blocks/log_big_oak_top" }, "axis": "y" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_0", "family": 15, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, "minecraft:mangrove_log": { "category": "building/logs_and_wood", "hardness": 2, "states": ["minecraft:pillar_axis"], "variants": [{ "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "y" } }, "model": { "key": "86128a0c7e3fa96923bb62273e2bc08ee26bd08cf4ad31ba46e2321e80a9e657", "denseEntityTypeId": "sable:fancy_model_mangrove_log_dense", "sparseEntityTypeId": "sable:fancy_model_mangrove_log_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/mangrove_log_side", "top": "textures/blocks/mangrove_log_top" }, "axis": "y" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_0", "family": 18, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "x" } }, "model": { "key": "fe56451c32429cedc7edeeb75831b8c967449b133124f0f9196caeb9ba307fd1", "denseEntityTypeId": "sable:fancy_model_mangrove_log_x_dense", "sparseEntityTypeId": "sable:fancy_model_mangrove_log_x_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/mangrove_log_side", "top": "textures/blocks/mangrove_log_top" }, "axis": "x" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_0", "family": 19, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "z" } }, "model": { "key": "7b9dde3167da838fddd8d30488d05af2932220103a33f063861072e4e8e21ce6", "denseEntityTypeId": "sable:fancy_model_mangrove_log_z_dense", "sparseEntityTypeId": "sable:fancy_model_mangrove_log_z_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/mangrove_log_side", "top": "textures/blocks/mangrove_log_top" }, "axis": "z" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_0", "family": 20, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }], "default": { "key": "86128a0c7e3fa96923bb62273e2bc08ee26bd08cf4ad31ba46e2321e80a9e657", "denseEntityTypeId": "sable:fancy_model_mangrove_log_dense", "sparseEntityTypeId": "sable:fancy_model_mangrove_log_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/mangrove_log_side", "top": "textures/blocks/mangrove_log_top" }, "axis": "y" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_0", "family": 18, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, "minecraft:cherry_log": { "category": "building/logs_and_wood", "hardness": 2, "states": ["minecraft:pillar_axis"], "variants": [{ "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "y" } }, "model": { "key": "c7e1fd11339cca2b6e71a08e42696ca729eb396d886c5a74c64710ed5acda674", "denseEntityTypeId": "sable:fancy_model_cherry_log_dense", "sparseEntityTypeId": "sable:fancy_model_cherry_log_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/cherry_log_side", "top": "textures/blocks/cherry_log_top" }, "axis": "y" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_0", "family": 21, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "x" } }, "model": { "key": "27f95ec4243ad52183a12f63e4f97460244f079d989877495f09b67b3fcff707", "denseEntityTypeId": "sable:fancy_model_cherry_log_x_dense", "sparseEntityTypeId": "sable:fancy_model_cherry_log_x_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/cherry_log_side", "top": "textures/blocks/cherry_log_top" }, "axis": "x" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_0", "family": 22, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "z" } }, "model": { "key": "1b76e1cd4f3c71de5e7a0d5114bdcdbf81a25a76d333af460089a6316a58814c", "denseEntityTypeId": "sable:fancy_model_cherry_log_z_dense", "sparseEntityTypeId": "sable:fancy_model_cherry_log_z_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/cherry_log_side", "top": "textures/blocks/cherry_log_top" }, "axis": "z" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_0", "family": 23, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }], "default": { "key": "c7e1fd11339cca2b6e71a08e42696ca729eb396d886c5a74c64710ed5acda674", "denseEntityTypeId": "sable:fancy_model_cherry_log_dense", "sparseEntityTypeId": "sable:fancy_model_cherry_log_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/cherry_log_side", "top": "textures/blocks/cherry_log_top" }, "axis": "y" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_0", "family": 21, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, "minecraft:pale_oak_log": { "category": "building/logs_and_wood", "hardness": 2, "states": ["minecraft:pillar_axis"], "variants": [{ "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "y" } }, "model": { "key": "73da1a0325dc171c1feb0f5a663e2952c7ef2a5181d54a6e392b4b9acdc9f1b7", "denseEntityTypeId": "sable:fancy_model_pale_oak_log_dense", "sparseEntityTypeId": "sable:fancy_model_pale_oak_log_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/pale_oak_log_side", "top": "textures/blocks/pale_oak_log_top" }, "axis": "y" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_0", "family": 24, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "x" } }, "model": { "key": "4e06bf4845543c5a5d42619c43f88dd17a22db7d932f1551616ac371300c8db3", "denseEntityTypeId": "sable:fancy_model_pale_oak_log_x_dense", "sparseEntityTypeId": "sable:fancy_model_pale_oak_log_x_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/pale_oak_log_side", "top": "textures/blocks/pale_oak_log_top" }, "axis": "x" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_0", "family": 25, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "z" } }, "model": { "key": "5b01a0e8e6576efe8a8466d18d50c91eec35389f78e180506521618a2f247214", "denseEntityTypeId": "sable:fancy_model_pale_oak_log_z_dense", "sparseEntityTypeId": "sable:fancy_model_pale_oak_log_z_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/pale_oak_log_side", "top": "textures/blocks/pale_oak_log_top" }, "axis": "z" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_0", "family": 26, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }], "default": { "key": "73da1a0325dc171c1feb0f5a663e2952c7ef2a5181d54a6e392b4b9acdc9f1b7", "denseEntityTypeId": "sable:fancy_model_pale_oak_log_dense", "sparseEntityTypeId": "sable:fancy_model_pale_oak_log_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/pale_oak_log_side", "top": "textures/blocks/pale_oak_log_top" }, "axis": "y" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_0", "family": 24, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, "minecraft:stripped_oak_log": { "category": "building/logs_and_wood", "hardness": 2, "states": ["minecraft:pillar_axis"], "variants": [{ "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "y" } }, "model": { "key": "c4b3da6ef6f245985a592daa7797248a12fada7c5b01cbc5b97aba971046213d", "denseEntityTypeId": "sable:fancy_model_stripped_oak_log_dense", "sparseEntityTypeId": "sable:fancy_model_stripped_oak_log_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/stripped_oak_log", "top": "textures/blocks/stripped_oak_log_top" }, "axis": "y" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_0", "family": 27, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "x" } }, "model": { "key": "86a02808d7bc49e561f41b9a313034e6a1be221709b830a698c799309aba70c3", "denseEntityTypeId": "sable:fancy_model_stripped_oak_log_x_dense", "sparseEntityTypeId": "sable:fancy_model_stripped_oak_log_x_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/stripped_oak_log", "top": "textures/blocks/stripped_oak_log_top" }, "axis": "x" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_0", "family": 28, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "z" } }, "model": { "key": "f810147ccb66acfe009cfb827a73cfa5b50f2e5cb06ca4514a2a2673ed204bb6", "denseEntityTypeId": "sable:fancy_model_stripped_oak_log_z_dense", "sparseEntityTypeId": "sable:fancy_model_stripped_oak_log_z_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/stripped_oak_log", "top": "textures/blocks/stripped_oak_log_top" }, "axis": "z" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_0", "family": 29, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }], "default": { "key": "c4b3da6ef6f245985a592daa7797248a12fada7c5b01cbc5b97aba971046213d", "denseEntityTypeId": "sable:fancy_model_stripped_oak_log_dense", "sparseEntityTypeId": "sable:fancy_model_stripped_oak_log_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/stripped_oak_log", "top": "textures/blocks/stripped_oak_log_top" }, "axis": "y" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_0", "family": 27, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, "minecraft:stripped_spruce_log": { "category": "building/logs_and_wood", "hardness": 2, "states": ["minecraft:pillar_axis"], "variants": [{ "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "y" } }, "model": { "key": "07ef4e2b22415d966610935b56d212a5df05e42514700b3ca0763584d42ae7cd", "denseEntityTypeId": "sable:fancy_model_stripped_spruce_log_dense", "sparseEntityTypeId": "sable:fancy_model_stripped_spruce_log_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/stripped_spruce_log", "top": "textures/blocks/stripped_spruce_log_top" }, "axis": "y" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_0", "family": 30, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "x" } }, "model": { "key": "7dee7dcfebdaad9145f701a9d66137828618be100fbb9ea17eae01f705cad7e6", "denseEntityTypeId": "sable:fancy_model_stripped_spruce_log_x_dense", "sparseEntityTypeId": "sable:fancy_model_stripped_spruce_log_x_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/stripped_spruce_log", "top": "textures/blocks/stripped_spruce_log_top" }, "axis": "x" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_0", "family": 31, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "z" } }, "model": { "key": "17252efb66c038589e87227a8ae41188ed7584b97fd5b144228e39958193c3bd", "denseEntityTypeId": "sable:fancy_model_stripped_spruce_log_z_dense", "sparseEntityTypeId": "sable:fancy_model_stripped_spruce_log_z_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/stripped_spruce_log", "top": "textures/blocks/stripped_spruce_log_top" }, "axis": "z" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_1", "family": 0, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }], "default": { "key": "07ef4e2b22415d966610935b56d212a5df05e42514700b3ca0763584d42ae7cd", "denseEntityTypeId": "sable:fancy_model_stripped_spruce_log_dense", "sparseEntityTypeId": "sable:fancy_model_stripped_spruce_log_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/stripped_spruce_log", "top": "textures/blocks/stripped_spruce_log_top" }, "axis": "y" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_0", "family": 30, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, "minecraft:stripped_birch_log": { "category": "building/logs_and_wood", "hardness": 2, "states": ["minecraft:pillar_axis"], "variants": [{ "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "y" } }, "model": { "key": "a8afa297074f5b90685dfe9ccdd5f564dcdef964e09ed35a7b50cd70cc88d399", "denseEntityTypeId": "sable:fancy_model_stripped_birch_log_dense", "sparseEntityTypeId": "sable:fancy_model_stripped_birch_log_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/stripped_birch_log", "top": "textures/blocks/stripped_birch_log_top" }, "axis": "y" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_1", "family": 1, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "x" } }, "model": { "key": "d4fbe9c378807b6d3571a2662cf488e7413f1cc64fcfcb826ef74a136dc0fc31", "denseEntityTypeId": "sable:fancy_model_stripped_birch_log_x_dense", "sparseEntityTypeId": "sable:fancy_model_stripped_birch_log_x_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/stripped_birch_log", "top": "textures/blocks/stripped_birch_log_top" }, "axis": "x" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_1", "family": 2, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "z" } }, "model": { "key": "9a96ab4d2bc0a2c1f8434e6c064794be95af35efe0bf042bd4e4d00ac211efed", "denseEntityTypeId": "sable:fancy_model_stripped_birch_log_z_dense", "sparseEntityTypeId": "sable:fancy_model_stripped_birch_log_z_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/stripped_birch_log", "top": "textures/blocks/stripped_birch_log_top" }, "axis": "z" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_1", "family": 3, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }], "default": { "key": "a8afa297074f5b90685dfe9ccdd5f564dcdef964e09ed35a7b50cd70cc88d399", "denseEntityTypeId": "sable:fancy_model_stripped_birch_log_dense", "sparseEntityTypeId": "sable:fancy_model_stripped_birch_log_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/stripped_birch_log", "top": "textures/blocks/stripped_birch_log_top" }, "axis": "y" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_1", "family": 1, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, "minecraft:stripped_jungle_log": { "category": "building/logs_and_wood", "hardness": 2, "states": ["minecraft:pillar_axis"], "variants": [{ "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "y" } }, "model": { "key": "f8fca67a620d41b37c6c28751848562537d0c19d28bb48d9676f156b2eca3e7a", "denseEntityTypeId": "sable:fancy_model_stripped_jungle_log_dense", "sparseEntityTypeId": "sable:fancy_model_stripped_jungle_log_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/stripped_jungle_log", "top": "textures/blocks/stripped_jungle_log_top" }, "axis": "y" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_1", "family": 4, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "x" } }, "model": { "key": "fd6887ab00672f70d26770885bb0f9da825a84414658e0e69f74be547be3c9ce", "denseEntityTypeId": "sable:fancy_model_stripped_jungle_log_x_dense", "sparseEntityTypeId": "sable:fancy_model_stripped_jungle_log_x_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/stripped_jungle_log", "top": "textures/blocks/stripped_jungle_log_top" }, "axis": "x" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_1", "family": 5, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "z" } }, "model": { "key": "2260c9032837fe046e6b83820f41daa4ea2e65cbb9755fefd25607947323eec5", "denseEntityTypeId": "sable:fancy_model_stripped_jungle_log_z_dense", "sparseEntityTypeId": "sable:fancy_model_stripped_jungle_log_z_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/stripped_jungle_log", "top": "textures/blocks/stripped_jungle_log_top" }, "axis": "z" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_1", "family": 6, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }], "default": { "key": "f8fca67a620d41b37c6c28751848562537d0c19d28bb48d9676f156b2eca3e7a", "denseEntityTypeId": "sable:fancy_model_stripped_jungle_log_dense", "sparseEntityTypeId": "sable:fancy_model_stripped_jungle_log_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/stripped_jungle_log", "top": "textures/blocks/stripped_jungle_log_top" }, "axis": "y" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_1", "family": 4, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, "minecraft:stripped_acacia_log": { "category": "building/logs_and_wood", "hardness": 2, "states": ["minecraft:pillar_axis"], "variants": [{ "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "y" } }, "model": { "key": "a7f430094127e7af013983699b14c9aa8a0cad431905cfdc5db8709fa91b1a11", "denseEntityTypeId": "sable:fancy_model_stripped_acacia_log_dense", "sparseEntityTypeId": "sable:fancy_model_stripped_acacia_log_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/stripped_acacia_log", "top": "textures/blocks/stripped_acacia_log_top" }, "axis": "y" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_1", "family": 7, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "x" } }, "model": { "key": "ea012f6f0dda3b881aedfa9b597a54cb9090aeea6a7f6518f54572dca014056d", "denseEntityTypeId": "sable:fancy_model_stripped_acacia_log_x_dense", "sparseEntityTypeId": "sable:fancy_model_stripped_acacia_log_x_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/stripped_acacia_log", "top": "textures/blocks/stripped_acacia_log_top" }, "axis": "x" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_1", "family": 8, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "z" } }, "model": { "key": "3f8bc63f442ab2e6a9027d795a1030d26766e0c19aca78e34e6726574792b97c", "denseEntityTypeId": "sable:fancy_model_stripped_acacia_log_z_dense", "sparseEntityTypeId": "sable:fancy_model_stripped_acacia_log_z_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/stripped_acacia_log", "top": "textures/blocks/stripped_acacia_log_top" }, "axis": "z" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_1", "family": 9, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }], "default": { "key": "a7f430094127e7af013983699b14c9aa8a0cad431905cfdc5db8709fa91b1a11", "denseEntityTypeId": "sable:fancy_model_stripped_acacia_log_dense", "sparseEntityTypeId": "sable:fancy_model_stripped_acacia_log_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/stripped_acacia_log", "top": "textures/blocks/stripped_acacia_log_top" }, "axis": "y" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_1", "family": 7, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, "minecraft:stripped_dark_oak_log": { "category": "building/logs_and_wood", "hardness": 2, "states": ["minecraft:pillar_axis"], "variants": [{ "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "y" } }, "model": { "key": "9593dba14fc812cbf086ce8290317c25e6c5f9762d110d43235b048380fa541f", "denseEntityTypeId": "sable:fancy_model_stripped_dark_oak_log_dense", "sparseEntityTypeId": "sable:fancy_model_stripped_dark_oak_log_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/stripped_dark_oak_log", "top": "textures/blocks/stripped_dark_oak_log_top" }, "axis": "y" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_1", "family": 10, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "x" } }, "model": { "key": "dbfb109489e50f5fbf9a97a8a6e85e9eafbcf968f6a6b3ff20d48d9c7d59edf9", "denseEntityTypeId": "sable:fancy_model_stripped_dark_oak_log_x_dense", "sparseEntityTypeId": "sable:fancy_model_stripped_dark_oak_log_x_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/stripped_dark_oak_log", "top": "textures/blocks/stripped_dark_oak_log_top" }, "axis": "x" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_1", "family": 11, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "z" } }, "model": { "key": "7b3c4febd65385ffffc6735b43e544458901012f7994846bb99cecbb4c8ad8e5", "denseEntityTypeId": "sable:fancy_model_stripped_dark_oak_log_z_dense", "sparseEntityTypeId": "sable:fancy_model_stripped_dark_oak_log_z_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/stripped_dark_oak_log", "top": "textures/blocks/stripped_dark_oak_log_top" }, "axis": "z" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_1", "family": 12, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }], "default": { "key": "9593dba14fc812cbf086ce8290317c25e6c5f9762d110d43235b048380fa541f", "denseEntityTypeId": "sable:fancy_model_stripped_dark_oak_log_dense", "sparseEntityTypeId": "sable:fancy_model_stripped_dark_oak_log_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/stripped_dark_oak_log", "top": "textures/blocks/stripped_dark_oak_log_top" }, "axis": "y" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_1", "family": 10, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, "minecraft:stripped_mangrove_log": { "category": "building/logs_and_wood", "hardness": 2, "states": ["minecraft:pillar_axis"], "variants": [{ "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "y" } }, "model": { "key": "b1fed79389013dd18a80978bb37be8d057a623eba1673b8bd2bf096ea53e7ec6", "denseEntityTypeId": "sable:fancy_model_stripped_mangrove_log_dense", "sparseEntityTypeId": "sable:fancy_model_stripped_mangrove_log_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/stripped_mangrove_log_side", "top": "textures/blocks/stripped_mangrove_log_top" }, "axis": "y" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_1", "family": 13, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "x" } }, "model": { "key": "1463916afda88c9ad42d2bb9b86210b880356a03f4713b85aba5b50867f7501c", "denseEntityTypeId": "sable:fancy_model_stripped_mangrove_log_x_dense", "sparseEntityTypeId": "sable:fancy_model_stripped_mangrove_log_x_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/stripped_mangrove_log_side", "top": "textures/blocks/stripped_mangrove_log_top" }, "axis": "x" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_1", "family": 14, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "z" } }, "model": { "key": "d6af18f5c605d17205f5ff60bbdb8b7245f78b83e017f8964092191b3a596f7d", "denseEntityTypeId": "sable:fancy_model_stripped_mangrove_log_z_dense", "sparseEntityTypeId": "sable:fancy_model_stripped_mangrove_log_z_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/stripped_mangrove_log_side", "top": "textures/blocks/stripped_mangrove_log_top" }, "axis": "z" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_1", "family": 15, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }], "default": { "key": "b1fed79389013dd18a80978bb37be8d057a623eba1673b8bd2bf096ea53e7ec6", "denseEntityTypeId": "sable:fancy_model_stripped_mangrove_log_dense", "sparseEntityTypeId": "sable:fancy_model_stripped_mangrove_log_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/stripped_mangrove_log_side", "top": "textures/blocks/stripped_mangrove_log_top" }, "axis": "y" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_1", "family": 13, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, "minecraft:stripped_cherry_log": { "category": "building/logs_and_wood", "hardness": 2, "states": ["minecraft:pillar_axis"], "variants": [{ "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "y" } }, "model": { "key": "35aaa7b9658b7e2a80e1ee4ab68cd67f12656060fcacdeaa2c868229192317e6", "denseEntityTypeId": "sable:fancy_model_stripped_cherry_log_dense", "sparseEntityTypeId": "sable:fancy_model_stripped_cherry_log_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/stripped_cherry_log_side", "top": "textures/blocks/stripped_cherry_log_top" }, "axis": "y" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_1", "family": 16, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "x" } }, "model": { "key": "811e3c569868433639ff71898e920809fa4c909520b12f191455b2b8d6959aa2", "denseEntityTypeId": "sable:fancy_model_stripped_cherry_log_x_dense", "sparseEntityTypeId": "sable:fancy_model_stripped_cherry_log_x_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/stripped_cherry_log_side", "top": "textures/blocks/stripped_cherry_log_top" }, "axis": "x" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_1", "family": 17, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "z" } }, "model": { "key": "43d7c26924215e9090f15bb8683ebd81707bff1460e8303f738e4b9cf5019474", "denseEntityTypeId": "sable:fancy_model_stripped_cherry_log_z_dense", "sparseEntityTypeId": "sable:fancy_model_stripped_cherry_log_z_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/stripped_cherry_log_side", "top": "textures/blocks/stripped_cherry_log_top" }, "axis": "z" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_1", "family": 18, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }], "default": { "key": "35aaa7b9658b7e2a80e1ee4ab68cd67f12656060fcacdeaa2c868229192317e6", "denseEntityTypeId": "sable:fancy_model_stripped_cherry_log_dense", "sparseEntityTypeId": "sable:fancy_model_stripped_cherry_log_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/stripped_cherry_log_side", "top": "textures/blocks/stripped_cherry_log_top" }, "axis": "y" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_1", "family": 16, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, "minecraft:stripped_pale_oak_log": { "category": "building/logs_and_wood", "hardness": 2, "states": ["minecraft:pillar_axis"], "variants": [{ "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "y" } }, "model": { "key": "3e5e9f9947d914654dc5c18bb29131ced6738fd9b1871a226a3e423e3f287172", "denseEntityTypeId": "sable:fancy_model_stripped_pale_oak_log_dense", "sparseEntityTypeId": "sable:fancy_model_stripped_pale_oak_log_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/stripped_pale_oak_log_side", "top": "textures/blocks/stripped_pale_oak_log_top" }, "axis": "y" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_1", "family": 19, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "x" } }, "model": { "key": "d2e279f7d6919c84fa3af1bb111c5b8a5cfcd80f699786331fa645be16706f78", "denseEntityTypeId": "sable:fancy_model_stripped_pale_oak_log_x_dense", "sparseEntityTypeId": "sable:fancy_model_stripped_pale_oak_log_x_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/stripped_pale_oak_log_side", "top": "textures/blocks/stripped_pale_oak_log_top" }, "axis": "x" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_1", "family": 20, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "z" } }, "model": { "key": "4a3d5b99675a3d9fe3327faa8bddabb496ca85dcf4f1cd37ebe49c64c15e76db", "denseEntityTypeId": "sable:fancy_model_stripped_pale_oak_log_z_dense", "sparseEntityTypeId": "sable:fancy_model_stripped_pale_oak_log_z_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/stripped_pale_oak_log_side", "top": "textures/blocks/stripped_pale_oak_log_top" }, "axis": "z" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_1", "family": 21, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }], "default": { "key": "3e5e9f9947d914654dc5c18bb29131ced6738fd9b1871a226a3e423e3f287172", "denseEntityTypeId": "sable:fancy_model_stripped_pale_oak_log_dense", "sparseEntityTypeId": "sable:fancy_model_stripped_pale_oak_log_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/stripped_pale_oak_log_side", "top": "textures/blocks/stripped_pale_oak_log_top" }, "axis": "y" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_1", "family": 19, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, "minecraft:oak_wood": { "category": "building/logs_and_wood", "hardness": 2, "states": ["minecraft:pillar_axis"], "variants": [{ "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "y" } }, "model": { "key": "e7ad0d433d7eafb90cd0f992e85f6c86d071437658c77a3514b0cd20bd3f0e07", "denseEntityTypeId": "sable:fancy_model_oak_wood_dense", "sparseEntityTypeId": "sable:fancy_model_oak_wood_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/log_oak", "top": "textures/blocks/log_oak" }, "axis": "y" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_1", "family": 22, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "x" } }, "model": { "key": "6b39c9b2103086f446a1daf63639e73ff9efc66bba426f11a39e8546b8d00b85", "denseEntityTypeId": "sable:fancy_model_oak_wood_x_dense", "sparseEntityTypeId": "sable:fancy_model_oak_wood_x_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/log_oak", "top": "textures/blocks/log_oak" }, "axis": "x" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_1", "family": 23, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "z" } }, "model": { "key": "b1d142256c216c8d821efe4d09b295c2ca19af3ec03bf3387d960b791e140c32", "denseEntityTypeId": "sable:fancy_model_oak_wood_z_dense", "sparseEntityTypeId": "sable:fancy_model_oak_wood_z_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/log_oak", "top": "textures/blocks/log_oak" }, "axis": "z" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_1", "family": 24, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }], "default": { "key": "e7ad0d433d7eafb90cd0f992e85f6c86d071437658c77a3514b0cd20bd3f0e07", "denseEntityTypeId": "sable:fancy_model_oak_wood_dense", "sparseEntityTypeId": "sable:fancy_model_oak_wood_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/log_oak", "top": "textures/blocks/log_oak" }, "axis": "y" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_1", "family": 22, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, "minecraft:spruce_wood": { "category": "building/logs_and_wood", "hardness": 2, "states": ["minecraft:pillar_axis"], "variants": [{ "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "y" } }, "model": { "key": "43c95e82867a5b39b7b7a54bdf86b685d8488026376d1046c351b48b9897c1e8", "denseEntityTypeId": "sable:fancy_model_spruce_wood_dense", "sparseEntityTypeId": "sable:fancy_model_spruce_wood_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/log_spruce", "top": "textures/blocks/log_spruce" }, "axis": "y" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_1", "family": 25, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "x" } }, "model": { "key": "9682ca1cdc35059231784a3b0025a8a090c3e4c0441cddb951590505721b9f20", "denseEntityTypeId": "sable:fancy_model_spruce_wood_x_dense", "sparseEntityTypeId": "sable:fancy_model_spruce_wood_x_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/log_spruce", "top": "textures/blocks/log_spruce" }, "axis": "x" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_1", "family": 26, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "z" } }, "model": { "key": "09d3aacf7a41b26c2ff818b3bd88d20cfde3d7eb4c8232f33996ebbaaa36b153", "denseEntityTypeId": "sable:fancy_model_spruce_wood_z_dense", "sparseEntityTypeId": "sable:fancy_model_spruce_wood_z_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/log_spruce", "top": "textures/blocks/log_spruce" }, "axis": "z" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_1", "family": 27, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }], "default": { "key": "43c95e82867a5b39b7b7a54bdf86b685d8488026376d1046c351b48b9897c1e8", "denseEntityTypeId": "sable:fancy_model_spruce_wood_dense", "sparseEntityTypeId": "sable:fancy_model_spruce_wood_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/log_spruce", "top": "textures/blocks/log_spruce" }, "axis": "y" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_1", "family": 25, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, "minecraft:birch_wood": { "category": "building/logs_and_wood", "hardness": 2, "states": ["minecraft:pillar_axis"], "variants": [{ "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "y" } }, "model": { "key": "1086cae883f212a4e8e84be75599e932b2e2094ef04f1e304157f1ec5a1dd471", "denseEntityTypeId": "sable:fancy_model_birch_wood_dense", "sparseEntityTypeId": "sable:fancy_model_birch_wood_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/log_birch", "top": "textures/blocks/log_birch" }, "axis": "y" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_1", "family": 28, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "x" } }, "model": { "key": "909e8bbdb97f4fbc4689dbc62c5ae9c2dfda3751c3805f6985a5a93acdee7bf8", "denseEntityTypeId": "sable:fancy_model_birch_wood_x_dense", "sparseEntityTypeId": "sable:fancy_model_birch_wood_x_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/log_birch", "top": "textures/blocks/log_birch" }, "axis": "x" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_1", "family": 29, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "z" } }, "model": { "key": "001483ff3f967df0421a30fb732d4f546628cc83f53671b4ec4ce1d87578ad6f", "denseEntityTypeId": "sable:fancy_model_birch_wood_z_dense", "sparseEntityTypeId": "sable:fancy_model_birch_wood_z_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/log_birch", "top": "textures/blocks/log_birch" }, "axis": "z" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_1", "family": 30, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }], "default": { "key": "1086cae883f212a4e8e84be75599e932b2e2094ef04f1e304157f1ec5a1dd471", "denseEntityTypeId": "sable:fancy_model_birch_wood_dense", "sparseEntityTypeId": "sable:fancy_model_birch_wood_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/log_birch", "top": "textures/blocks/log_birch" }, "axis": "y" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_1", "family": 28, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, "minecraft:jungle_wood": { "category": "building/logs_and_wood", "hardness": 2, "states": ["minecraft:pillar_axis"], "variants": [{ "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "y" } }, "model": { "key": "35a1687ab2caed73ced0fc352f00eeaa3f916679d0edf7477cc94190cabfea6d", "denseEntityTypeId": "sable:fancy_model_jungle_wood_dense", "sparseEntityTypeId": "sable:fancy_model_jungle_wood_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/log_jungle", "top": "textures/blocks/log_jungle" }, "axis": "y" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_1", "family": 31, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "x" } }, "model": { "key": "457f3f62b627da3eca81958bbdba97f63183d79edab3f9ffe059c5f0ce9c2c57", "denseEntityTypeId": "sable:fancy_model_jungle_wood_x_dense", "sparseEntityTypeId": "sable:fancy_model_jungle_wood_x_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/log_jungle", "top": "textures/blocks/log_jungle" }, "axis": "x" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_2", "family": 0, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "z" } }, "model": { "key": "d3df19d3a2eed2308208aea207e65503a2a681fdc075c0e99048ea18c79eebcb", "denseEntityTypeId": "sable:fancy_model_jungle_wood_z_dense", "sparseEntityTypeId": "sable:fancy_model_jungle_wood_z_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/log_jungle", "top": "textures/blocks/log_jungle" }, "axis": "z" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_2", "family": 1, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }], "default": { "key": "35a1687ab2caed73ced0fc352f00eeaa3f916679d0edf7477cc94190cabfea6d", "denseEntityTypeId": "sable:fancy_model_jungle_wood_dense", "sparseEntityTypeId": "sable:fancy_model_jungle_wood_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/log_jungle", "top": "textures/blocks/log_jungle" }, "axis": "y" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_1", "family": 31, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, "minecraft:acacia_wood": { "category": "building/logs_and_wood", "hardness": 2, "states": ["minecraft:pillar_axis"], "variants": [{ "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "y" } }, "model": { "key": "cbbde27da4a4c0e0e3d7d8458f4cc7512023c5e9880a64f0e9b8c40c4914eb9f", "denseEntityTypeId": "sable:fancy_model_acacia_wood_dense", "sparseEntityTypeId": "sable:fancy_model_acacia_wood_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/log_acacia", "top": "textures/blocks/log_acacia" }, "axis": "y" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_2", "family": 2, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "x" } }, "model": { "key": "ee4c9f7357de3efd898c3985882aefdd5399c711865efcc250321efe5c486a40", "denseEntityTypeId": "sable:fancy_model_acacia_wood_x_dense", "sparseEntityTypeId": "sable:fancy_model_acacia_wood_x_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/log_acacia", "top": "textures/blocks/log_acacia" }, "axis": "x" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_2", "family": 3, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "z" } }, "model": { "key": "f57e55ae7b329f9896f39d5c4eb00e3cb7f0ef5e16fad79df91caccaa752ccdc", "denseEntityTypeId": "sable:fancy_model_acacia_wood_z_dense", "sparseEntityTypeId": "sable:fancy_model_acacia_wood_z_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/log_acacia", "top": "textures/blocks/log_acacia" }, "axis": "z" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_2", "family": 4, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }], "default": { "key": "cbbde27da4a4c0e0e3d7d8458f4cc7512023c5e9880a64f0e9b8c40c4914eb9f", "denseEntityTypeId": "sable:fancy_model_acacia_wood_dense", "sparseEntityTypeId": "sable:fancy_model_acacia_wood_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/log_acacia", "top": "textures/blocks/log_acacia" }, "axis": "y" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_2", "family": 2, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, "minecraft:dark_oak_wood": { "category": "building/logs_and_wood", "hardness": 2, "states": ["minecraft:pillar_axis"], "variants": [{ "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "y" } }, "model": { "key": "79ad3b2c57eed8199fdcdc137b43503fa3d60b43520acc34941a5235ee54cb17", "denseEntityTypeId": "sable:fancy_model_dark_oak_wood_dense", "sparseEntityTypeId": "sable:fancy_model_dark_oak_wood_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/log_big_oak", "top": "textures/blocks/log_big_oak" }, "axis": "y" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_2", "family": 5, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "x" } }, "model": { "key": "73da0898be76054c9836e62a862fd6e9f4f9ae49aa9cb8d485bdd879333ff6af", "denseEntityTypeId": "sable:fancy_model_dark_oak_wood_x_dense", "sparseEntityTypeId": "sable:fancy_model_dark_oak_wood_x_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/log_big_oak", "top": "textures/blocks/log_big_oak" }, "axis": "x" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_2", "family": 6, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "z" } }, "model": { "key": "1349d3ccecea99e3d61b0a13f44e411f3bed8e1d6d277e3c0e7526527f2f28f5", "denseEntityTypeId": "sable:fancy_model_dark_oak_wood_z_dense", "sparseEntityTypeId": "sable:fancy_model_dark_oak_wood_z_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/log_big_oak", "top": "textures/blocks/log_big_oak" }, "axis": "z" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_2", "family": 7, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }], "default": { "key": "79ad3b2c57eed8199fdcdc137b43503fa3d60b43520acc34941a5235ee54cb17", "denseEntityTypeId": "sable:fancy_model_dark_oak_wood_dense", "sparseEntityTypeId": "sable:fancy_model_dark_oak_wood_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/log_big_oak", "top": "textures/blocks/log_big_oak" }, "axis": "y" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_2", "family": 5, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, "minecraft:mangrove_wood": { "category": "building/logs_and_wood", "hardness": 2, "states": ["minecraft:pillar_axis"], "variants": [{ "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "y" } }, "model": { "key": "575e3f31edbd20e73d64c478085f77888508856bf000b968f56d17d39c4aaebb", "denseEntityTypeId": "sable:fancy_model_mangrove_wood_dense", "sparseEntityTypeId": "sable:fancy_model_mangrove_wood_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/mangrove_log_side", "top": "textures/blocks/mangrove_log_side" }, "axis": "y" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_2", "family": 8, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "x" } }, "model": { "key": "54711dbf3d5c25775211a620991c90867861ba9edbaa042f23dd8c68c03923ab", "denseEntityTypeId": "sable:fancy_model_mangrove_wood_x_dense", "sparseEntityTypeId": "sable:fancy_model_mangrove_wood_x_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/mangrove_log_side", "top": "textures/blocks/mangrove_log_side" }, "axis": "x" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_2", "family": 9, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "z" } }, "model": { "key": "1c0f1acdec585c346a8f99afcf0758bfa9700eec25d6b81528c9581a52094585", "denseEntityTypeId": "sable:fancy_model_mangrove_wood_z_dense", "sparseEntityTypeId": "sable:fancy_model_mangrove_wood_z_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/mangrove_log_side", "top": "textures/blocks/mangrove_log_side" }, "axis": "z" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_2", "family": 10, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }], "default": { "key": "575e3f31edbd20e73d64c478085f77888508856bf000b968f56d17d39c4aaebb", "denseEntityTypeId": "sable:fancy_model_mangrove_wood_dense", "sparseEntityTypeId": "sable:fancy_model_mangrove_wood_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/mangrove_log_side", "top": "textures/blocks/mangrove_log_side" }, "axis": "y" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_2", "family": 8, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, "minecraft:cherry_wood": { "category": "building/logs_and_wood", "hardness": 2, "states": ["minecraft:pillar_axis"], "variants": [{ "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "y" } }, "model": { "key": "80c5f2798669c41fcefcf6d54ffbb8375215a022dfb44e0eebb726463ec5f85d", "denseEntityTypeId": "sable:fancy_model_cherry_wood_dense", "sparseEntityTypeId": "sable:fancy_model_cherry_wood_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/cherry_log_side", "top": "textures/blocks/cherry_log_side" }, "axis": "y" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_2", "family": 11, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "x" } }, "model": { "key": "56d4af5ae01d7bdac138e39dde933905f2f5f9edbf3c6aef95b3d89e4ac27a67", "denseEntityTypeId": "sable:fancy_model_cherry_wood_x_dense", "sparseEntityTypeId": "sable:fancy_model_cherry_wood_x_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/cherry_log_side", "top": "textures/blocks/cherry_log_side" }, "axis": "x" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_2", "family": 12, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "z" } }, "model": { "key": "e9b17d30579d5ae9ba2a04749f577264cb1430b25f1742e7da4abd3f93ba2144", "denseEntityTypeId": "sable:fancy_model_cherry_wood_z_dense", "sparseEntityTypeId": "sable:fancy_model_cherry_wood_z_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/cherry_log_side", "top": "textures/blocks/cherry_log_side" }, "axis": "z" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_2", "family": 13, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }], "default": { "key": "80c5f2798669c41fcefcf6d54ffbb8375215a022dfb44e0eebb726463ec5f85d", "denseEntityTypeId": "sable:fancy_model_cherry_wood_dense", "sparseEntityTypeId": "sable:fancy_model_cherry_wood_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/cherry_log_side", "top": "textures/blocks/cherry_log_side" }, "axis": "y" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_2", "family": 11, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, "minecraft:pale_oak_wood": { "category": "building/logs_and_wood", "hardness": 2, "states": ["minecraft:pillar_axis"], "variants": [{ "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "y" } }, "model": { "key": "9cc33e858ba0cb1d590a5e2943ea40a84faa8c48e2c9bf8fe381dbf554e859e6", "denseEntityTypeId": "sable:fancy_model_pale_oak_wood_dense", "sparseEntityTypeId": "sable:fancy_model_pale_oak_wood_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/pale_oak_log_side", "top": "textures/blocks/pale_oak_log_side" }, "axis": "y" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_2", "family": 14, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "x" } }, "model": { "key": "9187c2c82c5683c6e05b3873701f56bab50fe9c5db45afbb8bf45098428f20cb", "denseEntityTypeId": "sable:fancy_model_pale_oak_wood_x_dense", "sparseEntityTypeId": "sable:fancy_model_pale_oak_wood_x_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/pale_oak_log_side", "top": "textures/blocks/pale_oak_log_side" }, "axis": "x" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_2", "family": 15, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "z" } }, "model": { "key": "135725f2cbc31bc90e785da652b19e54e480e93c221c0ddd70d433f95e7b4f1c", "denseEntityTypeId": "sable:fancy_model_pale_oak_wood_z_dense", "sparseEntityTypeId": "sable:fancy_model_pale_oak_wood_z_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/pale_oak_log_side", "top": "textures/blocks/pale_oak_log_side" }, "axis": "z" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_2", "family": 16, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }], "default": { "key": "9cc33e858ba0cb1d590a5e2943ea40a84faa8c48e2c9bf8fe381dbf554e859e6", "denseEntityTypeId": "sable:fancy_model_pale_oak_wood_dense", "sparseEntityTypeId": "sable:fancy_model_pale_oak_wood_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/pale_oak_log_side", "top": "textures/blocks/pale_oak_log_side" }, "axis": "y" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_2", "family": 14, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, "minecraft:stripped_oak_wood": { "category": "building/logs_and_wood", "hardness": 2, "states": ["minecraft:pillar_axis"], "variants": [{ "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "y" } }, "model": { "key": "c589de625209ffd14e4041f9db3db66540cc7148e01d907748e25ef59a75a444", "denseEntityTypeId": "sable:fancy_model_stripped_oak_wood_dense", "sparseEntityTypeId": "sable:fancy_model_stripped_oak_wood_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/stripped_oak_log", "top": "textures/blocks/stripped_oak_log" }, "axis": "y" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_2", "family": 17, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "x" } }, "model": { "key": "fc31e7c59e348b2760dbb44373f9812bf45789f5d3509758dda235fb36566680", "denseEntityTypeId": "sable:fancy_model_stripped_oak_wood_x_dense", "sparseEntityTypeId": "sable:fancy_model_stripped_oak_wood_x_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/stripped_oak_log", "top": "textures/blocks/stripped_oak_log" }, "axis": "x" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_2", "family": 18, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "z" } }, "model": { "key": "fe93ac717d4a2546204deb97cc55abb05c574a1842e1ff7998c331a0b6f917a2", "denseEntityTypeId": "sable:fancy_model_stripped_oak_wood_z_dense", "sparseEntityTypeId": "sable:fancy_model_stripped_oak_wood_z_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/stripped_oak_log", "top": "textures/blocks/stripped_oak_log" }, "axis": "z" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_2", "family": 19, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }], "default": { "key": "c589de625209ffd14e4041f9db3db66540cc7148e01d907748e25ef59a75a444", "denseEntityTypeId": "sable:fancy_model_stripped_oak_wood_dense", "sparseEntityTypeId": "sable:fancy_model_stripped_oak_wood_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/stripped_oak_log", "top": "textures/blocks/stripped_oak_log" }, "axis": "y" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_2", "family": 17, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, "minecraft:stripped_spruce_wood": { "category": "building/logs_and_wood", "hardness": 2, "states": ["minecraft:pillar_axis"], "variants": [{ "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "y" } }, "model": { "key": "176282cadeda5abdf762b4975dd994cd7a02cbb922ee96d0b2402dd2042ac0e5", "denseEntityTypeId": "sable:fancy_model_stripped_spruce_wood_dense", "sparseEntityTypeId": "sable:fancy_model_stripped_spruce_wood_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/stripped_spruce_log", "top": "textures/blocks/stripped_spruce_log" }, "axis": "y" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_2", "family": 20, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "x" } }, "model": { "key": "49a107c0976276b113c7ebf81755317761b7bd1e50aebf334276feb69e1b3cf6", "denseEntityTypeId": "sable:fancy_model_stripped_spruce_wood_x_dense", "sparseEntityTypeId": "sable:fancy_model_stripped_spruce_wood_x_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/stripped_spruce_log", "top": "textures/blocks/stripped_spruce_log" }, "axis": "x" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_2", "family": 21, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "z" } }, "model": { "key": "539dfb8a0fac208dc2061eb4ce1a2d09d18664dbf86f03db09f1dd3efabdaa45", "denseEntityTypeId": "sable:fancy_model_stripped_spruce_wood_z_dense", "sparseEntityTypeId": "sable:fancy_model_stripped_spruce_wood_z_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/stripped_spruce_log", "top": "textures/blocks/stripped_spruce_log" }, "axis": "z" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_2", "family": 22, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }], "default": { "key": "176282cadeda5abdf762b4975dd994cd7a02cbb922ee96d0b2402dd2042ac0e5", "denseEntityTypeId": "sable:fancy_model_stripped_spruce_wood_dense", "sparseEntityTypeId": "sable:fancy_model_stripped_spruce_wood_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/stripped_spruce_log", "top": "textures/blocks/stripped_spruce_log" }, "axis": "y" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_2", "family": 20, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, "minecraft:stripped_birch_wood": { "category": "building/logs_and_wood", "hardness": 2, "states": ["minecraft:pillar_axis"], "variants": [{ "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "y" } }, "model": { "key": "ad6a4e014c66011a37b2f3762229066c42a69d0345be0e19f85707746191c78d", "denseEntityTypeId": "sable:fancy_model_stripped_birch_wood_dense", "sparseEntityTypeId": "sable:fancy_model_stripped_birch_wood_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/stripped_birch_log", "top": "textures/blocks/stripped_birch_log" }, "axis": "y" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_2", "family": 23, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "x" } }, "model": { "key": "628856d0fe31f8ef9618da380e8bd9795006d9149d40bfbfbc974981f00440d8", "denseEntityTypeId": "sable:fancy_model_stripped_birch_wood_x_dense", "sparseEntityTypeId": "sable:fancy_model_stripped_birch_wood_x_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/stripped_birch_log", "top": "textures/blocks/stripped_birch_log" }, "axis": "x" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_2", "family": 24, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "z" } }, "model": { "key": "d36f5e69e87f7692617dd757d6a3446403dd9e5cd326743ed42776b40cf61030", "denseEntityTypeId": "sable:fancy_model_stripped_birch_wood_z_dense", "sparseEntityTypeId": "sable:fancy_model_stripped_birch_wood_z_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/stripped_birch_log", "top": "textures/blocks/stripped_birch_log" }, "axis": "z" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_2", "family": 25, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }], "default": { "key": "ad6a4e014c66011a37b2f3762229066c42a69d0345be0e19f85707746191c78d", "denseEntityTypeId": "sable:fancy_model_stripped_birch_wood_dense", "sparseEntityTypeId": "sable:fancy_model_stripped_birch_wood_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/stripped_birch_log", "top": "textures/blocks/stripped_birch_log" }, "axis": "y" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_2", "family": 23, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, "minecraft:stripped_jungle_wood": { "category": "building/logs_and_wood", "hardness": 2, "states": ["minecraft:pillar_axis"], "variants": [{ "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "y" } }, "model": { "key": "1d08f0eec3a1857e5f7a4ae990070f84a3aa6715c9c567545cbc1cc044b41e1b", "denseEntityTypeId": "sable:fancy_model_stripped_jungle_wood_dense", "sparseEntityTypeId": "sable:fancy_model_stripped_jungle_wood_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/stripped_jungle_log", "top": "textures/blocks/stripped_jungle_log" }, "axis": "y" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_2", "family": 26, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "x" } }, "model": { "key": "afc635eebf381022a92ec34b137a9ec6f03953682393e7197af518bfc2b795f2", "denseEntityTypeId": "sable:fancy_model_stripped_jungle_wood_x_dense", "sparseEntityTypeId": "sable:fancy_model_stripped_jungle_wood_x_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/stripped_jungle_log", "top": "textures/blocks/stripped_jungle_log" }, "axis": "x" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_2", "family": 27, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "z" } }, "model": { "key": "1aa8d772767c7418faa80101d1940b177c3dab9df4b7f61e182c0c0260a1986a", "denseEntityTypeId": "sable:fancy_model_stripped_jungle_wood_z_dense", "sparseEntityTypeId": "sable:fancy_model_stripped_jungle_wood_z_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/stripped_jungle_log", "top": "textures/blocks/stripped_jungle_log" }, "axis": "z" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_2", "family": 28, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }], "default": { "key": "1d08f0eec3a1857e5f7a4ae990070f84a3aa6715c9c567545cbc1cc044b41e1b", "denseEntityTypeId": "sable:fancy_model_stripped_jungle_wood_dense", "sparseEntityTypeId": "sable:fancy_model_stripped_jungle_wood_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/stripped_jungle_log", "top": "textures/blocks/stripped_jungle_log" }, "axis": "y" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_2", "family": 26, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, "minecraft:stripped_acacia_wood": { "category": "building/logs_and_wood", "hardness": 2, "states": ["minecraft:pillar_axis"], "variants": [{ "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "y" } }, "model": { "key": "d9637fa5e64c2570a0d39a6093929d64d6c7f427df3f403e2548ac40006c79e3", "denseEntityTypeId": "sable:fancy_model_stripped_acacia_wood_dense", "sparseEntityTypeId": "sable:fancy_model_stripped_acacia_wood_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/stripped_acacia_log", "top": "textures/blocks/stripped_acacia_log" }, "axis": "y" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_2", "family": 29, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "x" } }, "model": { "key": "76d1fddbf119f3a4269106d0b8b69d15f9f04e29b7228c8f169143d0491057af", "denseEntityTypeId": "sable:fancy_model_stripped_acacia_wood_x_dense", "sparseEntityTypeId": "sable:fancy_model_stripped_acacia_wood_x_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/stripped_acacia_log", "top": "textures/blocks/stripped_acacia_log" }, "axis": "x" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_2", "family": 30, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "z" } }, "model": { "key": "1964b67df1433e2695f86fa619cdb431c4f1362295927254741a25b0f6ba6e4b", "denseEntityTypeId": "sable:fancy_model_stripped_acacia_wood_z_dense", "sparseEntityTypeId": "sable:fancy_model_stripped_acacia_wood_z_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/stripped_acacia_log", "top": "textures/blocks/stripped_acacia_log" }, "axis": "z" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_2", "family": 31, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }], "default": { "key": "d9637fa5e64c2570a0d39a6093929d64d6c7f427df3f403e2548ac40006c79e3", "denseEntityTypeId": "sable:fancy_model_stripped_acacia_wood_dense", "sparseEntityTypeId": "sable:fancy_model_stripped_acacia_wood_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/stripped_acacia_log", "top": "textures/blocks/stripped_acacia_log" }, "axis": "y" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_2", "family": 29, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, "minecraft:stripped_dark_oak_wood": { "category": "building/logs_and_wood", "hardness": 2, "states": ["minecraft:pillar_axis"], "variants": [{ "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "y" } }, "model": { "key": "42b8e46ee167f4874c6c11a3c4799c46158838c2c121983e60920418c0900846", "denseEntityTypeId": "sable:fancy_model_stripped_dark_oak_wood_dense", "sparseEntityTypeId": "sable:fancy_model_stripped_dark_oak_wood_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/stripped_dark_oak_log", "top": "textures/blocks/stripped_dark_oak_log" }, "axis": "y" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_3", "family": 0, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "x" } }, "model": { "key": "61ccab578c25a73feeb4eb8b78d8b582e3199fa1156c830828bca55396706a35", "denseEntityTypeId": "sable:fancy_model_stripped_dark_oak_wood_x_dense", "sparseEntityTypeId": "sable:fancy_model_stripped_dark_oak_wood_x_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/stripped_dark_oak_log", "top": "textures/blocks/stripped_dark_oak_log" }, "axis": "x" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_3", "family": 1, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "z" } }, "model": { "key": "2b5b2e28918d62cf056e6588a8f230c2722be94871d8078b2777e4e445fd6ac6", "denseEntityTypeId": "sable:fancy_model_stripped_dark_oak_wood_z_dense", "sparseEntityTypeId": "sable:fancy_model_stripped_dark_oak_wood_z_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/stripped_dark_oak_log", "top": "textures/blocks/stripped_dark_oak_log" }, "axis": "z" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_3", "family": 2, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }], "default": { "key": "42b8e46ee167f4874c6c11a3c4799c46158838c2c121983e60920418c0900846", "denseEntityTypeId": "sable:fancy_model_stripped_dark_oak_wood_dense", "sparseEntityTypeId": "sable:fancy_model_stripped_dark_oak_wood_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/stripped_dark_oak_log", "top": "textures/blocks/stripped_dark_oak_log" }, "axis": "y" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_3", "family": 0, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, "minecraft:stripped_mangrove_wood": { "category": "building/logs_and_wood", "hardness": 2, "states": ["minecraft:pillar_axis"], "variants": [{ "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "y" } }, "model": { "key": "7966f2a5e6dbeb089f986c59d9b73838c3c19092da3c443f0f6f048b0e8e31a6", "denseEntityTypeId": "sable:fancy_model_stripped_mangrove_wood_dense", "sparseEntityTypeId": "sable:fancy_model_stripped_mangrove_wood_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/stripped_mangrove_log_side", "top": "textures/blocks/stripped_mangrove_log_side" }, "axis": "y" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_3", "family": 3, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "x" } }, "model": { "key": "3559569e990bb611f462d60e0a70172738e62eadd359cab445855b57e73404bb", "denseEntityTypeId": "sable:fancy_model_stripped_mangrove_wood_x_dense", "sparseEntityTypeId": "sable:fancy_model_stripped_mangrove_wood_x_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/stripped_mangrove_log_side", "top": "textures/blocks/stripped_mangrove_log_side" }, "axis": "x" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_3", "family": 4, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "z" } }, "model": { "key": "5cbcd885d38aaa0b6875877b440317c02b72ca597479a597b336545fc8903251", "denseEntityTypeId": "sable:fancy_model_stripped_mangrove_wood_z_dense", "sparseEntityTypeId": "sable:fancy_model_stripped_mangrove_wood_z_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/stripped_mangrove_log_side", "top": "textures/blocks/stripped_mangrove_log_side" }, "axis": "z" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_3", "family": 5, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }], "default": { "key": "7966f2a5e6dbeb089f986c59d9b73838c3c19092da3c443f0f6f048b0e8e31a6", "denseEntityTypeId": "sable:fancy_model_stripped_mangrove_wood_dense", "sparseEntityTypeId": "sable:fancy_model_stripped_mangrove_wood_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/stripped_mangrove_log_side", "top": "textures/blocks/stripped_mangrove_log_side" }, "axis": "y" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_3", "family": 3, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, "minecraft:stripped_cherry_wood": { "category": "building/logs_and_wood", "hardness": 2, "states": ["minecraft:pillar_axis"], "variants": [{ "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "y" } }, "model": { "key": "f8455013ce4ad71e9ffdd223f45ac25972d573f55e8615b3ae5155cb1bbfd414", "denseEntityTypeId": "sable:fancy_model_stripped_cherry_wood_dense", "sparseEntityTypeId": "sable:fancy_model_stripped_cherry_wood_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/stripped_cherry_log_side", "top": "textures/blocks/stripped_cherry_log_side" }, "axis": "y" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_3", "family": 6, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "x" } }, "model": { "key": "6541feece9e2c3b7859f656b4d8f2e0c1fb4e78d3f7d028594992a6e64f2f940", "denseEntityTypeId": "sable:fancy_model_stripped_cherry_wood_x_dense", "sparseEntityTypeId": "sable:fancy_model_stripped_cherry_wood_x_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/stripped_cherry_log_side", "top": "textures/blocks/stripped_cherry_log_side" }, "axis": "x" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_3", "family": 7, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "z" } }, "model": { "key": "4a99271cfc41dca1a68ee3feed04a8cab9dd2d9e8630c5b734e5d87723dd26d4", "denseEntityTypeId": "sable:fancy_model_stripped_cherry_wood_z_dense", "sparseEntityTypeId": "sable:fancy_model_stripped_cherry_wood_z_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/stripped_cherry_log_side", "top": "textures/blocks/stripped_cherry_log_side" }, "axis": "z" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_3", "family": 8, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }], "default": { "key": "f8455013ce4ad71e9ffdd223f45ac25972d573f55e8615b3ae5155cb1bbfd414", "denseEntityTypeId": "sable:fancy_model_stripped_cherry_wood_dense", "sparseEntityTypeId": "sable:fancy_model_stripped_cherry_wood_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/stripped_cherry_log_side", "top": "textures/blocks/stripped_cherry_log_side" }, "axis": "y" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_3", "family": 6, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, "minecraft:stripped_pale_oak_wood": { "category": "building/logs_and_wood", "hardness": 2, "states": ["minecraft:pillar_axis"], "variants": [{ "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "y" } }, "model": { "key": "121954b4eac090c209ebfb76b94c6b57727a6048f0b34c701293b7ab63046927", "denseEntityTypeId": "sable:fancy_model_stripped_pale_oak_wood_dense", "sparseEntityTypeId": "sable:fancy_model_stripped_pale_oak_wood_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/stripped_pale_oak_log_side", "top": "textures/blocks/stripped_pale_oak_log_side" }, "axis": "y" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_3", "family": 9, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "x" } }, "model": { "key": "dabd56a3bae6e7cc41a9effb734aedb7735aa793c6cde2d51458443fb8cc23a9", "denseEntityTypeId": "sable:fancy_model_stripped_pale_oak_wood_x_dense", "sparseEntityTypeId": "sable:fancy_model_stripped_pale_oak_wood_x_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/stripped_pale_oak_log_side", "top": "textures/blocks/stripped_pale_oak_log_side" }, "axis": "x" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_3", "family": 10, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "z" } }, "model": { "key": "929d7ec2f3e02d98b48df237139d50745b3becb996d575ac6f7d11866ea199bd", "denseEntityTypeId": "sable:fancy_model_stripped_pale_oak_wood_z_dense", "sparseEntityTypeId": "sable:fancy_model_stripped_pale_oak_wood_z_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/stripped_pale_oak_log_side", "top": "textures/blocks/stripped_pale_oak_log_side" }, "axis": "z" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_3", "family": 11, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }], "default": { "key": "121954b4eac090c209ebfb76b94c6b57727a6048f0b34c701293b7ab63046927", "denseEntityTypeId": "sable:fancy_model_stripped_pale_oak_wood_dense", "sparseEntityTypeId": "sable:fancy_model_stripped_pale_oak_wood_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/stripped_pale_oak_log_side", "top": "textures/blocks/stripped_pale_oak_log_side" }, "axis": "y" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_3", "family": 9, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, "minecraft:log": { "category": "building/logs_and_wood", "hardness": 2, "states": ["minecraft:old_log_type", "minecraft:pillar_axis"], "variants": [{ "condition": { "type": "binary", "operator": "&&", "left": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:old_log_type" }, "right": { "type": "literal", "value": "oak" } }, "right": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "y" } } }, "model": { "key": "14c1d86ba2d17c7b8361d688b6b8a44582a2b9ccbaff45a50ad803d7d0d16777", "denseEntityTypeId": "sable:fancy_model_oak_log_dense", "sparseEntityTypeId": "sable:fancy_model_oak_log_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/log_oak", "top": "textures/blocks/log_oak_top" }, "axis": "y" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_0", "family": 0, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "&&", "left": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:old_log_type" }, "right": { "type": "literal", "value": "oak" } }, "right": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "x" } } }, "model": { "key": "3549767f655bb5dfe22b5e5a4b795859bb449638b1d5df6144e9622c1c254c65", "denseEntityTypeId": "sable:fancy_model_oak_log_x_dense", "sparseEntityTypeId": "sable:fancy_model_oak_log_x_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/log_oak", "top": "textures/blocks/log_oak_top" }, "axis": "x" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_0", "family": 1, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "&&", "left": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:old_log_type" }, "right": { "type": "literal", "value": "oak" } }, "right": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "z" } } }, "model": { "key": "d296755777e28a236b83e2c0c928de5a284f1eab7fcc628e0ed4ac221399a539", "denseEntityTypeId": "sable:fancy_model_oak_log_z_dense", "sparseEntityTypeId": "sable:fancy_model_oak_log_z_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/log_oak", "top": "textures/blocks/log_oak_top" }, "axis": "z" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_0", "family": 2, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "&&", "left": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:old_log_type" }, "right": { "type": "literal", "value": "spruce" } }, "right": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "y" } } }, "model": { "key": "359b4a0100e2fce09603e53f1770306a495bb91552797287a243c574064c9930", "denseEntityTypeId": "sable:fancy_model_spruce_log_dense", "sparseEntityTypeId": "sable:fancy_model_spruce_log_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/log_spruce", "top": "textures/blocks/log_spruce_top" }, "axis": "y" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_0", "family": 3, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "&&", "left": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:old_log_type" }, "right": { "type": "literal", "value": "spruce" } }, "right": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "x" } } }, "model": { "key": "34cf845044b9003039574af42dc10d4d37c3a44ad7483f88d7083f4b135a7b64", "denseEntityTypeId": "sable:fancy_model_spruce_log_x_dense", "sparseEntityTypeId": "sable:fancy_model_spruce_log_x_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/log_spruce", "top": "textures/blocks/log_spruce_top" }, "axis": "x" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_0", "family": 4, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "&&", "left": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:old_log_type" }, "right": { "type": "literal", "value": "spruce" } }, "right": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "z" } } }, "model": { "key": "ee9be9b08a1a04afbe40b743bb6095514d7a05757ea904166705e955169590a3", "denseEntityTypeId": "sable:fancy_model_spruce_log_z_dense", "sparseEntityTypeId": "sable:fancy_model_spruce_log_z_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/log_spruce", "top": "textures/blocks/log_spruce_top" }, "axis": "z" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_0", "family": 5, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "&&", "left": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:old_log_type" }, "right": { "type": "literal", "value": "birch" } }, "right": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "y" } } }, "model": { "key": "504426c5152c31d574581b05210da294384a0b8bf7ded8f165caed89b0eee638", "denseEntityTypeId": "sable:fancy_model_birch_log_dense", "sparseEntityTypeId": "sable:fancy_model_birch_log_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/log_birch", "top": "textures/blocks/log_birch_top" }, "axis": "y" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_0", "family": 6, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "&&", "left": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:old_log_type" }, "right": { "type": "literal", "value": "birch" } }, "right": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "x" } } }, "model": { "key": "b94778c61abaf5159d633db0aa03e9355815e695b3c4950be1c1776afcf565a5", "denseEntityTypeId": "sable:fancy_model_birch_log_x_dense", "sparseEntityTypeId": "sable:fancy_model_birch_log_x_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/log_birch", "top": "textures/blocks/log_birch_top" }, "axis": "x" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_0", "family": 7, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "&&", "left": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:old_log_type" }, "right": { "type": "literal", "value": "birch" } }, "right": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "z" } } }, "model": { "key": "56c7006c44b9107febe869edc4ef3b82a3da961492a5af8d78461d44795c2718", "denseEntityTypeId": "sable:fancy_model_birch_log_z_dense", "sparseEntityTypeId": "sable:fancy_model_birch_log_z_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/log_birch", "top": "textures/blocks/log_birch_top" }, "axis": "z" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_0", "family": 8, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "&&", "left": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:old_log_type" }, "right": { "type": "literal", "value": "jungle" } }, "right": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "y" } } }, "model": { "key": "759bf4d60268d154fd92b5f5f05a05ad10bda933457e0069cfecebc6076be2d2", "denseEntityTypeId": "sable:fancy_model_jungle_log_dense", "sparseEntityTypeId": "sable:fancy_model_jungle_log_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/log_jungle", "top": "textures/blocks/log_jungle_top" }, "axis": "y" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_0", "family": 9, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "&&", "left": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:old_log_type" }, "right": { "type": "literal", "value": "jungle" } }, "right": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "x" } } }, "model": { "key": "a91eeb953dbb4a8ea53d63d7f26c4214a44e1c039a45a1e7ca316cb009dd88a8", "denseEntityTypeId": "sable:fancy_model_jungle_log_x_dense", "sparseEntityTypeId": "sable:fancy_model_jungle_log_x_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/log_jungle", "top": "textures/blocks/log_jungle_top" }, "axis": "x" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_0", "family": 10, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "&&", "left": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:old_log_type" }, "right": { "type": "literal", "value": "jungle" } }, "right": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "z" } } }, "model": { "key": "df8d7e4822a97d72067b1e537cfeb4f720157ef6c1a4f98699b05787ea13fb52", "denseEntityTypeId": "sable:fancy_model_jungle_log_z_dense", "sparseEntityTypeId": "sable:fancy_model_jungle_log_z_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/log_jungle", "top": "textures/blocks/log_jungle_top" }, "axis": "z" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_0", "family": 11, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }], "default": { "key": "14c1d86ba2d17c7b8361d688b6b8a44582a2b9ccbaff45a50ad803d7d0d16777", "denseEntityTypeId": "sable:fancy_model_oak_log_dense", "sparseEntityTypeId": "sable:fancy_model_oak_log_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/log_oak", "top": "textures/blocks/log_oak_top" }, "axis": "y" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_0", "family": 0, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, "minecraft:log2": { "category": "building/logs_and_wood", "hardness": 2, "states": ["minecraft:new_log_type", "minecraft:pillar_axis"], "variants": [{ "condition": { "type": "binary", "operator": "&&", "left": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:new_log_type" }, "right": { "type": "literal", "value": "acacia" } }, "right": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "y" } } }, "model": { "key": "b50142667e84d7b985d3e4b74dced6acacf1c8e3ee6cc293b77ab555e19de34d", "denseEntityTypeId": "sable:fancy_model_acacia_log_dense", "sparseEntityTypeId": "sable:fancy_model_acacia_log_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/log_acacia", "top": "textures/blocks/log_acacia_top" }, "axis": "y" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_0", "family": 12, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "&&", "left": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:new_log_type" }, "right": { "type": "literal", "value": "acacia" } }, "right": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "x" } } }, "model": { "key": "f91aaad63066bc26fee187601bcc358980abef07c643245ce8018f0a236d096d", "denseEntityTypeId": "sable:fancy_model_acacia_log_x_dense", "sparseEntityTypeId": "sable:fancy_model_acacia_log_x_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/log_acacia", "top": "textures/blocks/log_acacia_top" }, "axis": "x" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_0", "family": 13, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "&&", "left": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:new_log_type" }, "right": { "type": "literal", "value": "acacia" } }, "right": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "z" } } }, "model": { "key": "814410f677015df39abc9392995bb436479db939def97d05d6d1d007051163d3", "denseEntityTypeId": "sable:fancy_model_acacia_log_z_dense", "sparseEntityTypeId": "sable:fancy_model_acacia_log_z_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/log_acacia", "top": "textures/blocks/log_acacia_top" }, "axis": "z" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_0", "family": 14, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "&&", "left": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:new_log_type" }, "right": { "type": "literal", "value": "dark_oak" } }, "right": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "y" } } }, "model": { "key": "88d985baeca94b1729fd9bf4e3bd0d4f9fc8afd1075fe17145077786202b48ff", "denseEntityTypeId": "sable:fancy_model_dark_oak_log_dense", "sparseEntityTypeId": "sable:fancy_model_dark_oak_log_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/log_big_oak", "top": "textures/blocks/log_big_oak_top" }, "axis": "y" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_0", "family": 15, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "&&", "left": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:new_log_type" }, "right": { "type": "literal", "value": "dark_oak" } }, "right": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "x" } } }, "model": { "key": "ba139c53d20f38f399953fc782e53f6a2a08b7f5acbbabee16b6af70940ce7e0", "denseEntityTypeId": "sable:fancy_model_dark_oak_log_x_dense", "sparseEntityTypeId": "sable:fancy_model_dark_oak_log_x_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/log_big_oak", "top": "textures/blocks/log_big_oak_top" }, "axis": "x" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_0", "family": 16, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "&&", "left": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:new_log_type" }, "right": { "type": "literal", "value": "dark_oak" } }, "right": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "z" } } }, "model": { "key": "abb8d1b7ce7446ee4a04e2b6ed3525580772fc749de180e1387ce1ee23d4686a", "denseEntityTypeId": "sable:fancy_model_dark_oak_log_z_dense", "sparseEntityTypeId": "sable:fancy_model_dark_oak_log_z_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/log_big_oak", "top": "textures/blocks/log_big_oak_top" }, "axis": "z" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_0", "family": 17, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }], "default": { "key": "b50142667e84d7b985d3e4b74dced6acacf1c8e3ee6cc293b77ab555e19de34d", "denseEntityTypeId": "sable:fancy_model_acacia_log_dense", "sparseEntityTypeId": "sable:fancy_model_acacia_log_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/log_acacia", "top": "textures/blocks/log_acacia_top" }, "axis": "y" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_0", "family": 12, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, "minecraft:oak_leaves": { "category": "nature/leaves", "hardness": 0.2, "states": [], "variants": [], "default": { "key": "43c31d1a44ac2ad08c7f35b0820d120e82a871ef3be7ce04c8d9111366e80b72", "denseEntityTypeId": "sable:fancy_model_oak_leaves_dense", "sparseEntityTypeId": "sable:fancy_model_oak_leaves_sparse", "material": "alpha_test_tint", "model": { "type": "full_block", "textures": { "up": "textures/blocks/leaves_oak", "down": "textures/blocks/leaves_oak", "north": "textures/blocks/leaves_oak", "south": "textures/blocks/leaves_oak", "east": "textures/blocks/leaves_oak", "west": "textures/blocks/leaves_oak" } }, "tint": { "method": "foliage" }, "pool": { "entityTypeId": "sable:fancy_pool_leaves_0", "family": 0, "familyBits": 4, "stateBits": 0, "xBits": 7, "yBits": 6, "zBits": 6 } } }, "minecraft:jungle_leaves": { "category": "nature/leaves", "hardness": 0.2, "states": [], "variants": [], "default": { "key": "c39dc1c785f08f0346964e00804e61d92733eaa7a097cc6cc9f371a1800f9941", "denseEntityTypeId": "sable:fancy_model_jungle_leaves_dense", "sparseEntityTypeId": "sable:fancy_model_jungle_leaves_sparse", "material": "alpha_test_tint", "model": { "type": "full_block", "textures": { "up": "textures/blocks/leaves_jungle", "down": "textures/blocks/leaves_jungle", "north": "textures/blocks/leaves_jungle", "south": "textures/blocks/leaves_jungle", "east": "textures/blocks/leaves_jungle", "west": "textures/blocks/leaves_jungle" } }, "tint": { "method": "foliage" }, "pool": { "entityTypeId": "sable:fancy_pool_leaves_0", "family": 1, "familyBits": 4, "stateBits": 0, "xBits": 7, "yBits": 6, "zBits": 6 } } }, "minecraft:acacia_leaves": { "category": "nature/leaves", "hardness": 0.2, "states": [], "variants": [], "default": { "key": "807ecbc86abd2e22f0fd63eacd77606d698a02fe782e4738e00f6c9825f8b8ba", "denseEntityTypeId": "sable:fancy_model_acacia_leaves_dense", "sparseEntityTypeId": "sable:fancy_model_acacia_leaves_sparse", "material": "alpha_test_tint", "model": { "type": "full_block", "textures": { "up": "textures/blocks/leaves_acacia", "down": "textures/blocks/leaves_acacia", "north": "textures/blocks/leaves_acacia", "south": "textures/blocks/leaves_acacia", "east": "textures/blocks/leaves_acacia", "west": "textures/blocks/leaves_acacia" } }, "tint": { "method": "foliage" }, "pool": { "entityTypeId": "sable:fancy_pool_leaves_0", "family": 2, "familyBits": 4, "stateBits": 0, "xBits": 7, "yBits": 6, "zBits": 6 } } }, "minecraft:dark_oak_leaves": { "category": "nature/leaves", "hardness": 0.2, "states": [], "variants": [], "default": { "key": "8a9e2e305e4692467e2e9897506b9f16b187a1d132fcf087802d527809e12ecb", "denseEntityTypeId": "sable:fancy_model_dark_oak_leaves_dense", "sparseEntityTypeId": "sable:fancy_model_dark_oak_leaves_sparse", "material": "alpha_test_tint", "model": { "type": "full_block", "textures": { "up": "textures/blocks/leaves_big_oak", "down": "textures/blocks/leaves_big_oak", "north": "textures/blocks/leaves_big_oak", "south": "textures/blocks/leaves_big_oak", "east": "textures/blocks/leaves_big_oak", "west": "textures/blocks/leaves_big_oak" } }, "tint": { "method": "foliage" }, "pool": { "entityTypeId": "sable:fancy_pool_leaves_0", "family": 3, "familyBits": 4, "stateBits": 0, "xBits": 7, "yBits": 6, "zBits": 6 } } }, "minecraft:mangrove_leaves": { "category": "nature/leaves", "hardness": 0.2, "states": [], "variants": [], "default": { "key": "59b33079697bdeebfd9449f00b93f4d077bd8ffffb6468d30ca5185be4bd62f1", "denseEntityTypeId": "sable:fancy_model_mangrove_leaves_dense", "sparseEntityTypeId": "sable:fancy_model_mangrove_leaves_sparse", "material": "alpha_test_tint", "model": { "type": "full_block", "textures": { "up": "textures/blocks/mangrove_leaves", "down": "textures/blocks/mangrove_leaves", "north": "textures/blocks/mangrove_leaves", "south": "textures/blocks/mangrove_leaves", "east": "textures/blocks/mangrove_leaves", "west": "textures/blocks/mangrove_leaves" } }, "tint": { "method": "foliage" }, "pool": { "entityTypeId": "sable:fancy_pool_leaves_0", "family": 4, "familyBits": 4, "stateBits": 0, "xBits": 7, "yBits": 6, "zBits": 6 } } }, "minecraft:spruce_leaves": { "category": "nature/leaves", "hardness": 0.2, "states": [], "variants": [], "default": { "key": "a03e094782c37066e91e893ef6625677edc623007e99d73376332faa8b2ad092", "denseEntityTypeId": "sable:fancy_model_spruce_leaves_dense", "sparseEntityTypeId": "sable:fancy_model_spruce_leaves_sparse", "material": "alpha_test_tint", "model": { "type": "full_block", "textures": { "up": "textures/blocks/leaves_spruce", "down": "textures/blocks/leaves_spruce", "north": "textures/blocks/leaves_spruce", "south": "textures/blocks/leaves_spruce", "east": "textures/blocks/leaves_spruce", "west": "textures/blocks/leaves_spruce" } }, "tint": { "color": "#619961", "method": "fixed", "palette": 0 }, "pool": { "entityTypeId": "sable:fancy_pool_leaves_0", "family": 5, "familyBits": 4, "stateBits": 0, "xBits": 7, "yBits": 6, "zBits": 6 } } }, "minecraft:birch_leaves": { "category": "nature/leaves", "hardness": 0.2, "states": [], "variants": [], "default": { "key": "0ac6a4f3643a2d06d9b3ad9fdd0368c15b924f01f9474fb4496028f7704c323c", "denseEntityTypeId": "sable:fancy_model_birch_leaves_dense", "sparseEntityTypeId": "sable:fancy_model_birch_leaves_sparse", "material": "alpha_test_tint", "model": { "type": "full_block", "textures": { "up": "textures/blocks/leaves_birch", "down": "textures/blocks/leaves_birch", "north": "textures/blocks/leaves_birch", "south": "textures/blocks/leaves_birch", "east": "textures/blocks/leaves_birch", "west": "textures/blocks/leaves_birch" } }, "tint": { "color": "#80A755", "method": "fixed", "palette": 1 }, "pool": { "entityTypeId": "sable:fancy_pool_leaves_0", "family": 6, "familyBits": 4, "stateBits": 0, "xBits": 7, "yBits": 6, "zBits": 6 } } }, "minecraft:cherry_leaves": { "category": "nature/leaves", "hardness": 0.2, "states": [], "variants": [], "default": { "key": "041ba82045dbcb7bc8319348089e3aaa581257fff12a9132f0634ea4ea869f5f", "denseEntityTypeId": "sable:fancy_model_cherry_leaves_dense", "sparseEntityTypeId": "sable:fancy_model_cherry_leaves_sparse", "material": "alpha_test", "model": { "type": "full_block", "textures": { "up": "textures/blocks/cherry_leaves", "down": "textures/blocks/cherry_leaves", "north": "textures/blocks/cherry_leaves", "south": "textures/blocks/cherry_leaves", "east": "textures/blocks/cherry_leaves", "west": "textures/blocks/cherry_leaves" } }, "pool": { "entityTypeId": "sable:fancy_pool_leaves_0", "family": 7, "familyBits": 4, "stateBits": 0, "xBits": 7, "yBits": 6, "zBits": 6 } } }, "minecraft:pale_oak_leaves": { "category": "nature/leaves", "hardness": 0.2, "states": [], "variants": [], "default": { "key": "57d77e297fee740a7960b9650b798be204992be58118f91623a2173d7fd20b6c", "denseEntityTypeId": "sable:fancy_model_pale_oak_leaves_dense", "sparseEntityTypeId": "sable:fancy_model_pale_oak_leaves_sparse", "material": "alpha_test", "model": { "type": "full_block", "textures": { "up": "textures/blocks/pale_oak_leaves", "down": "textures/blocks/pale_oak_leaves", "north": "textures/blocks/pale_oak_leaves", "south": "textures/blocks/pale_oak_leaves", "east": "textures/blocks/pale_oak_leaves", "west": "textures/blocks/pale_oak_leaves" } }, "pool": { "entityTypeId": "sable:fancy_pool_leaves_0", "family": 8, "familyBits": 4, "stateBits": 0, "xBits": 7, "yBits": 6, "zBits": 6 } } }, "minecraft:azalea_leaves": { "category": "nature/leaves", "hardness": 0.2, "states": [], "variants": [], "default": { "key": "2e80615150a6bb3f50494d667d02f2b98fd2a373d3579bd91d8ccef30f46b143", "denseEntityTypeId": "sable:fancy_model_azalea_leaves_dense", "sparseEntityTypeId": "sable:fancy_model_azalea_leaves_sparse", "material": "alpha_test", "model": { "type": "full_block", "textures": { "up": "textures/blocks/azalea_leaves", "down": "textures/blocks/azalea_leaves", "north": "textures/blocks/azalea_leaves", "south": "textures/blocks/azalea_leaves", "east": "textures/blocks/azalea_leaves", "west": "textures/blocks/azalea_leaves" } }, "pool": { "entityTypeId": "sable:fancy_pool_leaves_0", "family": 9, "familyBits": 4, "stateBits": 0, "xBits": 7, "yBits": 6, "zBits": 6 } } }, "minecraft:flowering_azalea_leaves": { "category": "nature/leaves", "hardness": 0.2, "states": [], "variants": [], "default": { "key": "c1021cb8eec74a6c0258e90bc8c65eedbec65a9dd7e912bb7d27b1e5ad15c103", "denseEntityTypeId": "sable:fancy_model_flowering_azalea_leaves_dense", "sparseEntityTypeId": "sable:fancy_model_flowering_azalea_leaves_sparse", "material": "alpha_test", "model": { "type": "full_block", "textures": { "up": "textures/blocks/azalea_leaves_flowers", "down": "textures/blocks/azalea_leaves_flowers", "north": "textures/blocks/azalea_leaves_flowers", "south": "textures/blocks/azalea_leaves_flowers", "east": "textures/blocks/azalea_leaves_flowers", "west": "textures/blocks/azalea_leaves_flowers" } }, "pool": { "entityTypeId": "sable:fancy_pool_leaves_0", "family": 10, "familyBits": 4, "stateBits": 0, "xBits": 7, "yBits": 6, "zBits": 6 } } }, "minecraft:azalea_leaves_flowered": { "category": "nature/leaves", "hardness": 0.2, "states": [], "variants": [], "default": { "key": "c1021cb8eec74a6c0258e90bc8c65eedbec65a9dd7e912bb7d27b1e5ad15c103", "denseEntityTypeId": "sable:fancy_model_flowering_azalea_leaves_dense", "sparseEntityTypeId": "sable:fancy_model_flowering_azalea_leaves_sparse", "material": "alpha_test", "model": { "type": "full_block", "textures": { "up": "textures/blocks/azalea_leaves_flowers", "down": "textures/blocks/azalea_leaves_flowers", "north": "textures/blocks/azalea_leaves_flowers", "south": "textures/blocks/azalea_leaves_flowers", "east": "textures/blocks/azalea_leaves_flowers", "west": "textures/blocks/azalea_leaves_flowers" } }, "pool": { "entityTypeId": "sable:fancy_pool_leaves_0", "family": 10, "familyBits": 4, "stateBits": 0, "xBits": 7, "yBits": 6, "zBits": 6 } } }, "minecraft:leaves": { "category": "nature/leaves", "hardness": 0.2, "states": ["minecraft:old_leaf_type"], "variants": [{ "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:old_leaf_type" }, "right": { "type": "literal", "value": "oak" } }, "model": { "key": "43c31d1a44ac2ad08c7f35b0820d120e82a871ef3be7ce04c8d9111366e80b72", "denseEntityTypeId": "sable:fancy_model_oak_leaves_dense", "sparseEntityTypeId": "sable:fancy_model_oak_leaves_sparse", "material": "alpha_test_tint", "model": { "type": "full_block", "textures": { "up": "textures/blocks/leaves_oak", "down": "textures/blocks/leaves_oak", "north": "textures/blocks/leaves_oak", "south": "textures/blocks/leaves_oak", "east": "textures/blocks/leaves_oak", "west": "textures/blocks/leaves_oak" } }, "tint": { "method": "foliage" }, "pool": { "entityTypeId": "sable:fancy_pool_leaves_0", "family": 0, "familyBits": 4, "stateBits": 0, "xBits": 7, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:old_leaf_type" }, "right": { "type": "literal", "value": "spruce" } }, "model": { "key": "a03e094782c37066e91e893ef6625677edc623007e99d73376332faa8b2ad092", "denseEntityTypeId": "sable:fancy_model_spruce_leaves_dense", "sparseEntityTypeId": "sable:fancy_model_spruce_leaves_sparse", "material": "alpha_test_tint", "model": { "type": "full_block", "textures": { "up": "textures/blocks/leaves_spruce", "down": "textures/blocks/leaves_spruce", "north": "textures/blocks/leaves_spruce", "south": "textures/blocks/leaves_spruce", "east": "textures/blocks/leaves_spruce", "west": "textures/blocks/leaves_spruce" } }, "tint": { "color": "#619961", "method": "fixed", "palette": 0 }, "pool": { "entityTypeId": "sable:fancy_pool_leaves_0", "family": 5, "familyBits": 4, "stateBits": 0, "xBits": 7, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:old_leaf_type" }, "right": { "type": "literal", "value": "birch" } }, "model": { "key": "0ac6a4f3643a2d06d9b3ad9fdd0368c15b924f01f9474fb4496028f7704c323c", "denseEntityTypeId": "sable:fancy_model_birch_leaves_dense", "sparseEntityTypeId": "sable:fancy_model_birch_leaves_sparse", "material": "alpha_test_tint", "model": { "type": "full_block", "textures": { "up": "textures/blocks/leaves_birch", "down": "textures/blocks/leaves_birch", "north": "textures/blocks/leaves_birch", "south": "textures/blocks/leaves_birch", "east": "textures/blocks/leaves_birch", "west": "textures/blocks/leaves_birch" } }, "tint": { "color": "#80A755", "method": "fixed", "palette": 1 }, "pool": { "entityTypeId": "sable:fancy_pool_leaves_0", "family": 6, "familyBits": 4, "stateBits": 0, "xBits": 7, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:old_leaf_type" }, "right": { "type": "literal", "value": "jungle" } }, "model": { "key": "c39dc1c785f08f0346964e00804e61d92733eaa7a097cc6cc9f371a1800f9941", "denseEntityTypeId": "sable:fancy_model_jungle_leaves_dense", "sparseEntityTypeId": "sable:fancy_model_jungle_leaves_sparse", "material": "alpha_test_tint", "model": { "type": "full_block", "textures": { "up": "textures/blocks/leaves_jungle", "down": "textures/blocks/leaves_jungle", "north": "textures/blocks/leaves_jungle", "south": "textures/blocks/leaves_jungle", "east": "textures/blocks/leaves_jungle", "west": "textures/blocks/leaves_jungle" } }, "tint": { "method": "foliage" }, "pool": { "entityTypeId": "sable:fancy_pool_leaves_0", "family": 1, "familyBits": 4, "stateBits": 0, "xBits": 7, "yBits": 6, "zBits": 6 } } }], "default": { "key": "43c31d1a44ac2ad08c7f35b0820d120e82a871ef3be7ce04c8d9111366e80b72", "denseEntityTypeId": "sable:fancy_model_oak_leaves_dense", "sparseEntityTypeId": "sable:fancy_model_oak_leaves_sparse", "material": "alpha_test_tint", "model": { "type": "full_block", "textures": { "up": "textures/blocks/leaves_oak", "down": "textures/blocks/leaves_oak", "north": "textures/blocks/leaves_oak", "south": "textures/blocks/leaves_oak", "east": "textures/blocks/leaves_oak", "west": "textures/blocks/leaves_oak" } }, "tint": { "method": "foliage" }, "pool": { "entityTypeId": "sable:fancy_pool_leaves_0", "family": 0, "familyBits": 4, "stateBits": 0, "xBits": 7, "yBits": 6, "zBits": 6 } } }, "minecraft:leaves2": { "category": "nature/leaves", "hardness": 0.2, "states": ["minecraft:new_leaf_type"], "variants": [{ "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:new_leaf_type" }, "right": { "type": "literal", "value": "acacia" } }, "model": { "key": "807ecbc86abd2e22f0fd63eacd77606d698a02fe782e4738e00f6c9825f8b8ba", "denseEntityTypeId": "sable:fancy_model_acacia_leaves_dense", "sparseEntityTypeId": "sable:fancy_model_acacia_leaves_sparse", "material": "alpha_test_tint", "model": { "type": "full_block", "textures": { "up": "textures/blocks/leaves_acacia", "down": "textures/blocks/leaves_acacia", "north": "textures/blocks/leaves_acacia", "south": "textures/blocks/leaves_acacia", "east": "textures/blocks/leaves_acacia", "west": "textures/blocks/leaves_acacia" } }, "tint": { "method": "foliage" }, "pool": { "entityTypeId": "sable:fancy_pool_leaves_0", "family": 2, "familyBits": 4, "stateBits": 0, "xBits": 7, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:new_leaf_type" }, "right": { "type": "literal", "value": "dark_oak" } }, "model": { "key": "8a9e2e305e4692467e2e9897506b9f16b187a1d132fcf087802d527809e12ecb", "denseEntityTypeId": "sable:fancy_model_dark_oak_leaves_dense", "sparseEntityTypeId": "sable:fancy_model_dark_oak_leaves_sparse", "material": "alpha_test_tint", "model": { "type": "full_block", "textures": { "up": "textures/blocks/leaves_big_oak", "down": "textures/blocks/leaves_big_oak", "north": "textures/blocks/leaves_big_oak", "south": "textures/blocks/leaves_big_oak", "east": "textures/blocks/leaves_big_oak", "west": "textures/blocks/leaves_big_oak" } }, "tint": { "method": "foliage" }, "pool": { "entityTypeId": "sable:fancy_pool_leaves_0", "family": 3, "familyBits": 4, "stateBits": 0, "xBits": 7, "yBits": 6, "zBits": 6 } } }], "default": { "key": "807ecbc86abd2e22f0fd63eacd77606d698a02fe782e4738e00f6c9825f8b8ba", "denseEntityTypeId": "sable:fancy_model_acacia_leaves_dense", "sparseEntityTypeId": "sable:fancy_model_acacia_leaves_sparse", "material": "alpha_test_tint", "model": { "type": "full_block", "textures": { "up": "textures/blocks/leaves_acacia", "down": "textures/blocks/leaves_acacia", "north": "textures/blocks/leaves_acacia", "south": "textures/blocks/leaves_acacia", "east": "textures/blocks/leaves_acacia", "west": "textures/blocks/leaves_acacia" } }, "tint": { "method": "foliage" }, "pool": { "entityTypeId": "sable:fancy_pool_leaves_0", "family": 2, "familyBits": 4, "stateBits": 0, "xBits": 7, "yBits": 6, "zBits": 6 } } }, "minecraft:chest": { "category": "functional/chests_and_containers", "hardness": 2.5, "placeable": true, "states": ["minecraft:cardinal_direction"], "variants": [{ "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:cardinal_direction" }, "right": { "type": "literal", "value": "north" } }, "model": { "key": "de2800a3efdafcb5c752af1315c458985865a801cbbc4ceca06b95f247bfdbf2", "denseEntityTypeId": "sable:fancy_model_chest_dense", "sparseEntityTypeId": "sable:fancy_model_chest_sparse", "material": "alpha_test", "model": { "type": "chest", "texture": "textures/entity/chest/normal", "facing": "north" }, "pool": { "entityTypeId": "sable:fancy_pool_chests_and_containers_0", "family": 0, "familyBits": 2, "stateBits": 1, "xBits": 7, "yBits": 6, "zBits": 7 } } }, { "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:cardinal_direction" }, "right": { "type": "literal", "value": "east" } }, "model": { "key": "5675fcebb4553be7fb74c9ab7e235c89b11108a9b8656249c9ada793529c6a3a", "denseEntityTypeId": "sable:fancy_model_chest_east_dense", "sparseEntityTypeId": "sable:fancy_model_chest_east_sparse", "material": "alpha_test", "model": { "type": "chest", "texture": "textures/entity/chest/normal", "facing": "east" }, "pool": { "entityTypeId": "sable:fancy_pool_chests_and_containers_0", "family": 1, "familyBits": 2, "stateBits": 1, "xBits": 7, "yBits": 6, "zBits": 7 } } }, { "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:cardinal_direction" }, "right": { "type": "literal", "value": "south" } }, "model": { "key": "b8308c4be5bbf87912cf50f437576a45ea80566c780610d23ac67c53726981f5", "denseEntityTypeId": "sable:fancy_model_chest_south_dense", "sparseEntityTypeId": "sable:fancy_model_chest_south_sparse", "material": "alpha_test", "model": { "type": "chest", "texture": "textures/entity/chest/normal", "facing": "south" }, "pool": { "entityTypeId": "sable:fancy_pool_chests_and_containers_0", "family": 2, "familyBits": 2, "stateBits": 1, "xBits": 7, "yBits": 6, "zBits": 7 } } }, { "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:cardinal_direction" }, "right": { "type": "literal", "value": "west" } }, "model": { "key": "e8545bff13ce14e4987bd984de6be467498064263fbd5b6b97d2a78da36c73d6", "denseEntityTypeId": "sable:fancy_model_chest_west_dense", "sparseEntityTypeId": "sable:fancy_model_chest_west_sparse", "material": "alpha_test", "model": { "type": "chest", "texture": "textures/entity/chest/normal", "facing": "west" }, "pool": { "entityTypeId": "sable:fancy_pool_chests_and_containers_0", "family": 3, "familyBits": 2, "stateBits": 1, "xBits": 7, "yBits": 6, "zBits": 7 } } }], "default": { "key": "de2800a3efdafcb5c752af1315c458985865a801cbbc4ceca06b95f247bfdbf2", "denseEntityTypeId": "sable:fancy_model_chest_dense", "sparseEntityTypeId": "sable:fancy_model_chest_sparse", "material": "alpha_test", "model": { "type": "chest", "texture": "textures/entity/chest/normal", "facing": "north" }, "pool": { "entityTypeId": "sable:fancy_pool_chests_and_containers_0", "family": 0, "familyBits": 2, "stateBits": 1, "xBits": 7, "yBits": 6, "zBits": 7 } } }, "minecraft:bee_nest": { "category": "nature/other_natural_blocks", "hardness": 0.3, "support": "none", "states": ["minecraft:direction", "minecraft:honey_level"], "variants": [{ "condition": { "type": "binary", "operator": "&&", "left": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:direction" }, "right": { "type": "literal", "value": 0 } }, "right": { "type": "binary", "operator": "<", "left": { "type": "state", "name": "minecraft:honey_level" }, "right": { "type": "literal", "value": 5 } } }, "model": { "key": "a3cf6271d2e7604aa51018f7673157cb88cd23ac00aa0706747db8eb1bba463c", "denseEntityTypeId": "sable:fancy_model_bee_nest_dense", "sparseEntityTypeId": "sable:fancy_model_bee_nest_sparse", "material": "opaque", "model": { "type": "bee_nest", "textures": { "down": "textures/blocks/bee_nest_bottom", "up": "textures/blocks/bee_nest_top", "front": "textures/blocks/bee_nest_front", "side": "textures/blocks/bee_nest_side" }, "direction": 0 }, "pool": { "entityTypeId": "sable:fancy_pool_other_natural_blocks_0", "family": 0, "familyBits": 4, "stateBits": 0, "xBits": 7, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "&&", "left": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:direction" }, "right": { "type": "literal", "value": 0 } }, "right": { "type": "binary", "operator": ">=", "left": { "type": "state", "name": "minecraft:honey_level" }, "right": { "type": "literal", "value": 5 } } }, "model": { "key": "e8e9de6f4343f3bab93e654e2a913136d7474e59b8adfd1e911abb30ece53848", "denseEntityTypeId": "sable:fancy_model_bee_nest_0_ge5_dense", "sparseEntityTypeId": "sable:fancy_model_bee_nest_0_ge5_sparse", "material": "opaque", "model": { "type": "bee_nest", "textures": { "down": "textures/blocks/bee_nest_bottom", "up": "textures/blocks/bee_nest_top", "front": "textures/blocks/bee_nest_front_honey", "side": "textures/blocks/bee_nest_side" }, "direction": 0 }, "pool": { "entityTypeId": "sable:fancy_pool_other_natural_blocks_0", "family": 1, "familyBits": 4, "stateBits": 0, "xBits": 7, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "&&", "left": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:direction" }, "right": { "type": "literal", "value": 1 } }, "right": { "type": "binary", "operator": "<", "left": { "type": "state", "name": "minecraft:honey_level" }, "right": { "type": "literal", "value": 5 } } }, "model": { "key": "90b3b891aba20d600e9922c474cdf084e4514f56d667f7107f66b694c2d7898e", "denseEntityTypeId": "sable:fancy_model_bee_nest_1_lt5_dense", "sparseEntityTypeId": "sable:fancy_model_bee_nest_1_lt5_sparse", "material": "opaque", "model": { "type": "bee_nest", "textures": { "down": "textures/blocks/bee_nest_bottom", "up": "textures/blocks/bee_nest_top", "front": "textures/blocks/bee_nest_front", "side": "textures/blocks/bee_nest_side" }, "direction": 1 }, "pool": { "entityTypeId": "sable:fancy_pool_other_natural_blocks_0", "family": 2, "familyBits": 4, "stateBits": 0, "xBits": 7, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "&&", "left": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:direction" }, "right": { "type": "literal", "value": 1 } }, "right": { "type": "binary", "operator": ">=", "left": { "type": "state", "name": "minecraft:honey_level" }, "right": { "type": "literal", "value": 5 } } }, "model": { "key": "084042a98d8ebad3bdda76e25bc8542b97f3362e99369d829929edba90d63a4a", "denseEntityTypeId": "sable:fancy_model_bee_nest_1_ge5_dense", "sparseEntityTypeId": "sable:fancy_model_bee_nest_1_ge5_sparse", "material": "opaque", "model": { "type": "bee_nest", "textures": { "down": "textures/blocks/bee_nest_bottom", "up": "textures/blocks/bee_nest_top", "front": "textures/blocks/bee_nest_front_honey", "side": "textures/blocks/bee_nest_side" }, "direction": 1 }, "pool": { "entityTypeId": "sable:fancy_pool_other_natural_blocks_0", "family": 3, "familyBits": 4, "stateBits": 0, "xBits": 7, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "&&", "left": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:direction" }, "right": { "type": "literal", "value": 2 } }, "right": { "type": "binary", "operator": "<", "left": { "type": "state", "name": "minecraft:honey_level" }, "right": { "type": "literal", "value": 5 } } }, "model": { "key": "a524bcc07aecf5036bb2feaee1cda97f5caef4b29b548c532745a9bdfc5c8175", "denseEntityTypeId": "sable:fancy_model_bee_nest_2_lt5_dense", "sparseEntityTypeId": "sable:fancy_model_bee_nest_2_lt5_sparse", "material": "opaque", "model": { "type": "bee_nest", "textures": { "down": "textures/blocks/bee_nest_bottom", "up": "textures/blocks/bee_nest_top", "front": "textures/blocks/bee_nest_front", "side": "textures/blocks/bee_nest_side" }, "direction": 2 }, "pool": { "entityTypeId": "sable:fancy_pool_other_natural_blocks_0", "family": 4, "familyBits": 4, "stateBits": 0, "xBits": 7, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "&&", "left": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:direction" }, "right": { "type": "literal", "value": 2 } }, "right": { "type": "binary", "operator": ">=", "left": { "type": "state", "name": "minecraft:honey_level" }, "right": { "type": "literal", "value": 5 } } }, "model": { "key": "212feb44bba85e75291a42cb9d0b8f3a41eaca49c2a20a27cf015b8b0dd606b7", "denseEntityTypeId": "sable:fancy_model_bee_nest_2_ge5_dense", "sparseEntityTypeId": "sable:fancy_model_bee_nest_2_ge5_sparse", "material": "opaque", "model": { "type": "bee_nest", "textures": { "down": "textures/blocks/bee_nest_bottom", "up": "textures/blocks/bee_nest_top", "front": "textures/blocks/bee_nest_front_honey", "side": "textures/blocks/bee_nest_side" }, "direction": 2 }, "pool": { "entityTypeId": "sable:fancy_pool_other_natural_blocks_0", "family": 5, "familyBits": 4, "stateBits": 0, "xBits": 7, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "&&", "left": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:direction" }, "right": { "type": "literal", "value": 3 } }, "right": { "type": "binary", "operator": "<", "left": { "type": "state", "name": "minecraft:honey_level" }, "right": { "type": "literal", "value": 5 } } }, "model": { "key": "fe361c30623001335459583682e9a07409d30ddf54c608c868e7915c89438504", "denseEntityTypeId": "sable:fancy_model_bee_nest_3_lt5_dense", "sparseEntityTypeId": "sable:fancy_model_bee_nest_3_lt5_sparse", "material": "opaque", "model": { "type": "bee_nest", "textures": { "down": "textures/blocks/bee_nest_bottom", "up": "textures/blocks/bee_nest_top", "front": "textures/blocks/bee_nest_front", "side": "textures/blocks/bee_nest_side" }, "direction": 3 }, "pool": { "entityTypeId": "sable:fancy_pool_other_natural_blocks_0", "family": 6, "familyBits": 4, "stateBits": 0, "xBits": 7, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "&&", "left": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:direction" }, "right": { "type": "literal", "value": 3 } }, "right": { "type": "binary", "operator": ">=", "left": { "type": "state", "name": "minecraft:honey_level" }, "right": { "type": "literal", "value": 5 } } }, "model": { "key": "b5ce7a4b5ade7df68a3c13abf36e1a62e46b93b7cbb6b92c7a0ba6a6cdc10a32", "denseEntityTypeId": "sable:fancy_model_bee_nest_3_ge5_dense", "sparseEntityTypeId": "sable:fancy_model_bee_nest_3_ge5_sparse", "material": "opaque", "model": { "type": "bee_nest", "textures": { "down": "textures/blocks/bee_nest_bottom", "up": "textures/blocks/bee_nest_top", "front": "textures/blocks/bee_nest_front_honey", "side": "textures/blocks/bee_nest_side" }, "direction": 3 }, "pool": { "entityTypeId": "sable:fancy_pool_other_natural_blocks_0", "family": 7, "familyBits": 4, "stateBits": 0, "xBits": 7, "yBits": 6, "zBits": 6 } } }], "default": { "key": "a3cf6271d2e7604aa51018f7673157cb88cd23ac00aa0706747db8eb1bba463c", "denseEntityTypeId": "sable:fancy_model_bee_nest_dense", "sparseEntityTypeId": "sable:fancy_model_bee_nest_sparse", "material": "opaque", "model": { "type": "bee_nest", "textures": { "down": "textures/blocks/bee_nest_bottom", "up": "textures/blocks/bee_nest_top", "front": "textures/blocks/bee_nest_front", "side": "textures/blocks/bee_nest_side" }, "direction": 0 }, "pool": { "entityTypeId": "sable:fancy_pool_other_natural_blocks_0", "family": 0, "familyBits": 4, "stateBits": 0, "xBits": 7, "yBits": 6, "zBits": 6 } } }, "minecraft:cocoa": { "category": "nature/crops", "hardness": 0.2, "support": "facing_log", "states": ["minecraft:direction", "minecraft:age"], "variants": [{ "condition": { "type": "binary", "operator": "&&", "left": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:direction" }, "right": { "type": "literal", "value": 0 } }, "right": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:age" }, "right": { "type": "literal", "value": 0 } } }, "model": { "key": "b6af7352668151436c4d960f3506ecee5aecbe17803fcf59c55eee9b57926c73", "denseEntityTypeId": "sable:fancy_model_cocoa_dense", "sparseEntityTypeId": "sable:fancy_model_cocoa_sparse", "material": "alpha_test", "model": { "type": "cocoa", "texture": "textures/blocks/cocoa_stage_0", "age": 0, "direction": 0 }, "pool": { "entityTypeId": "sable:fancy_pool_crops_0", "family": 0, "familyBits": 4, "stateBits": 0, "xBits": 7, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "&&", "left": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:direction" }, "right": { "type": "literal", "value": 0 } }, "right": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:age" }, "right": { "type": "literal", "value": 1 } } }, "model": { "key": "abbd96509e94faa455452683c5beae1258f41397fb290b2177f5651142db77d0", "denseEntityTypeId": "sable:fancy_model_cocoa_0_1_dense", "sparseEntityTypeId": "sable:fancy_model_cocoa_0_1_sparse", "material": "alpha_test", "model": { "type": "cocoa", "texture": "textures/blocks/cocoa_stage_1", "age": 1, "direction": 0 }, "pool": { "entityTypeId": "sable:fancy_pool_crops_0", "family": 1, "familyBits": 4, "stateBits": 0, "xBits": 7, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "&&", "left": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:direction" }, "right": { "type": "literal", "value": 0 } }, "right": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:age" }, "right": { "type": "literal", "value": 2 } } }, "model": { "key": "b31029d0ec293d80ae2696867f0137dcb4b2cff4dab4304b78f092cb1414aa5d", "denseEntityTypeId": "sable:fancy_model_cocoa_0_2_dense", "sparseEntityTypeId": "sable:fancy_model_cocoa_0_2_sparse", "material": "alpha_test", "model": { "type": "cocoa", "texture": "textures/blocks/cocoa_stage_2", "age": 2, "direction": 0 }, "pool": { "entityTypeId": "sable:fancy_pool_crops_0", "family": 2, "familyBits": 4, "stateBits": 0, "xBits": 7, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "&&", "left": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:direction" }, "right": { "type": "literal", "value": 1 } }, "right": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:age" }, "right": { "type": "literal", "value": 0 } } }, "model": { "key": "dd3d0283efaeb1ed314e6888ff13c71bb6f102b70cd9badb09aa711fb95d9542", "denseEntityTypeId": "sable:fancy_model_cocoa_1_0_dense", "sparseEntityTypeId": "sable:fancy_model_cocoa_1_0_sparse", "material": "alpha_test", "model": { "type": "cocoa", "texture": "textures/blocks/cocoa_stage_0", "age": 0, "direction": 1 }, "pool": { "entityTypeId": "sable:fancy_pool_crops_0", "family": 3, "familyBits": 4, "stateBits": 0, "xBits": 7, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "&&", "left": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:direction" }, "right": { "type": "literal", "value": 1 } }, "right": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:age" }, "right": { "type": "literal", "value": 1 } } }, "model": { "key": "72cb1bcae8893ce189a51eb10626d724e1b9be3ec4a3adfee73e7dbf05de9355", "denseEntityTypeId": "sable:fancy_model_cocoa_1_1_dense", "sparseEntityTypeId": "sable:fancy_model_cocoa_1_1_sparse", "material": "alpha_test", "model": { "type": "cocoa", "texture": "textures/blocks/cocoa_stage_1", "age": 1, "direction": 1 }, "pool": { "entityTypeId": "sable:fancy_pool_crops_0", "family": 4, "familyBits": 4, "stateBits": 0, "xBits": 7, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "&&", "left": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:direction" }, "right": { "type": "literal", "value": 1 } }, "right": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:age" }, "right": { "type": "literal", "value": 2 } } }, "model": { "key": "ea4e408672f75e242834c0995b36d82b97217a48e01c4641d8f7fe1f2a129527", "denseEntityTypeId": "sable:fancy_model_cocoa_1_2_dense", "sparseEntityTypeId": "sable:fancy_model_cocoa_1_2_sparse", "material": "alpha_test", "model": { "type": "cocoa", "texture": "textures/blocks/cocoa_stage_2", "age": 2, "direction": 1 }, "pool": { "entityTypeId": "sable:fancy_pool_crops_0", "family": 5, "familyBits": 4, "stateBits": 0, "xBits": 7, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "&&", "left": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:direction" }, "right": { "type": "literal", "value": 2 } }, "right": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:age" }, "right": { "type": "literal", "value": 0 } } }, "model": { "key": "ec0ad48ca23916022ff728bacee9341e19085a464fa2f71ac0a5c020a581b032", "denseEntityTypeId": "sable:fancy_model_cocoa_2_0_dense", "sparseEntityTypeId": "sable:fancy_model_cocoa_2_0_sparse", "material": "alpha_test", "model": { "type": "cocoa", "texture": "textures/blocks/cocoa_stage_0", "age": 0, "direction": 2 }, "pool": { "entityTypeId": "sable:fancy_pool_crops_0", "family": 6, "familyBits": 4, "stateBits": 0, "xBits": 7, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "&&", "left": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:direction" }, "right": { "type": "literal", "value": 2 } }, "right": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:age" }, "right": { "type": "literal", "value": 1 } } }, "model": { "key": "9dd2d3e5f58e186bab28cafea8d6dfc631276b00635b976401a885c3edc312bb", "denseEntityTypeId": "sable:fancy_model_cocoa_2_1_dense", "sparseEntityTypeId": "sable:fancy_model_cocoa_2_1_sparse", "material": "alpha_test", "model": { "type": "cocoa", "texture": "textures/blocks/cocoa_stage_1", "age": 1, "direction": 2 }, "pool": { "entityTypeId": "sable:fancy_pool_crops_0", "family": 7, "familyBits": 4, "stateBits": 0, "xBits": 7, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "&&", "left": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:direction" }, "right": { "type": "literal", "value": 2 } }, "right": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:age" }, "right": { "type": "literal", "value": 2 } } }, "model": { "key": "6402cd04d975f9697e5fde394608418885774129ffc5a6fbdb5890bf931d1f80", "denseEntityTypeId": "sable:fancy_model_cocoa_2_2_dense", "sparseEntityTypeId": "sable:fancy_model_cocoa_2_2_sparse", "material": "alpha_test", "model": { "type": "cocoa", "texture": "textures/blocks/cocoa_stage_2", "age": 2, "direction": 2 }, "pool": { "entityTypeId": "sable:fancy_pool_crops_0", "family": 8, "familyBits": 4, "stateBits": 0, "xBits": 7, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "&&", "left": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:direction" }, "right": { "type": "literal", "value": 3 } }, "right": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:age" }, "right": { "type": "literal", "value": 0 } } }, "model": { "key": "89fb1c115af334dc6a7957bdcc66f90a504bd5d8e92f1714a7df9085618415b8", "denseEntityTypeId": "sable:fancy_model_cocoa_3_0_dense", "sparseEntityTypeId": "sable:fancy_model_cocoa_3_0_sparse", "material": "alpha_test", "model": { "type": "cocoa", "texture": "textures/blocks/cocoa_stage_0", "age": 0, "direction": 3 }, "pool": { "entityTypeId": "sable:fancy_pool_crops_0", "family": 9, "familyBits": 4, "stateBits": 0, "xBits": 7, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "&&", "left": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:direction" }, "right": { "type": "literal", "value": 3 } }, "right": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:age" }, "right": { "type": "literal", "value": 1 } } }, "model": { "key": "361d5b1c0250554cbf13c5565f01f8f514f77ce7b6be2183062a98de415a8a5f", "denseEntityTypeId": "sable:fancy_model_cocoa_3_1_dense", "sparseEntityTypeId": "sable:fancy_model_cocoa_3_1_sparse", "material": "alpha_test", "model": { "type": "cocoa", "texture": "textures/blocks/cocoa_stage_1", "age": 1, "direction": 3 }, "pool": { "entityTypeId": "sable:fancy_pool_crops_0", "family": 10, "familyBits": 4, "stateBits": 0, "xBits": 7, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "&&", "left": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:direction" }, "right": { "type": "literal", "value": 3 } }, "right": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:age" }, "right": { "type": "literal", "value": 2 } } }, "model": { "key": "e4c57c20c9404b59252b6c2d0b5a766c08f66ba604e9f471b131e5d85020c6fe", "denseEntityTypeId": "sable:fancy_model_cocoa_3_2_dense", "sparseEntityTypeId": "sable:fancy_model_cocoa_3_2_sparse", "material": "alpha_test", "model": { "type": "cocoa", "texture": "textures/blocks/cocoa_stage_2", "age": 2, "direction": 3 }, "pool": { "entityTypeId": "sable:fancy_pool_crops_0", "family": 11, "familyBits": 4, "stateBits": 0, "xBits": 7, "yBits": 6, "zBits": 6 } } }], "default": { "key": "b6af7352668151436c4d960f3506ecee5aecbe17803fcf59c55eee9b57926c73", "denseEntityTypeId": "sable:fancy_model_cocoa_dense", "sparseEntityTypeId": "sable:fancy_model_cocoa_sparse", "material": "alpha_test", "model": { "type": "cocoa", "texture": "textures/blocks/cocoa_stage_0", "age": 0, "direction": 0 }, "pool": { "entityTypeId": "sable:fancy_pool_crops_0", "family": 0, "familyBits": 4, "stateBits": 0, "xBits": 7, "yBits": 6, "zBits": 6 } } }, "minecraft:hanging_roots": { "category": "nature/plants_and_flowers", "hardness": 0.2, "passable": true, "support": "above_solid", "states": [], "variants": [], "default": { "key": "ba536cd03b9b1faa53a72e65d4f08a1c8908362d6b55d2edbfc925ad964a0533", "denseEntityTypeId": "sable:fancy_model_hanging_roots_dense", "sparseEntityTypeId": "sable:fancy_model_hanging_roots_sparse", "material": "alpha_test", "model": { "type": "hanging_roots", "texture": "textures/blocks/hanging_roots" }, "pool": { "entityTypeId": "sable:fancy_pool_plants_and_flowers_0", "family": 0, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, "minecraft:mangrove_roots": { "category": "nature/other_natural_blocks", "states": [], "variants": [], "default": { "key": "dc4cd583efeec92a306752ca670be066e508b411fb5bde515a1a490dbaa93a73", "denseEntityTypeId": "sable:fancy_model_mangrove_roots_dense", "sparseEntityTypeId": "sable:fancy_model_mangrove_roots_sparse", "material": "alpha_test", "model": { "type": "mangrove_roots", "textures": { "side": "textures/blocks/mangrove_roots_side", "top": "textures/blocks/mangrove_roots_top" } }, "pool": { "entityTypeId": "sable:fancy_pool_other_natural_blocks_0", "family": 8, "familyBits": 4, "stateBits": 0, "xBits": 7, "yBits": 6, "zBits": 6 } } }, "minecraft:muddy_mangrove_roots": { "category": "nature/other_natural_blocks", "states": [], "variants": [], "default": { "key": "6394206cba76d8108da3cd439e32f5918acb31b3796562487393d3692765098c", "denseEntityTypeId": "sable:fancy_model_muddy_mangrove_roots_dense", "sparseEntityTypeId": "sable:fancy_model_muddy_mangrove_roots_sparse", "material": "opaque", "model": { "type": "pillar", "textures": { "side": "textures/blocks/muddy_mangrove_roots_side", "top": "textures/blocks/muddy_mangrove_roots_top" }, "axis": "y" }, "pool": { "entityTypeId": "sable:fancy_pool_other_natural_blocks_0", "family": 9, "familyBits": 4, "stateBits": 0, "xBits": 7, "yBits": 6, "zBits": 6 } } }, "minecraft:mangrove_propagule": { "category": "nature/saplings", "hardness": 0.2, "passable": true, "support": "above_leaf", "states": ["minecraft:hanging", "minecraft:propagule_stage"], "variants": [{ "condition": { "type": "binary", "operator": "&&", "left": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:hanging" }, "right": { "type": "literal", "value": true } }, "right": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:propagule_stage" }, "right": { "type": "literal", "value": 0 } } }, "model": { "key": "571f50615c1d3481a5035a8405e69325cdcb7189201ca0ee99e98de074a92a93", "denseEntityTypeId": "sable:fancy_model_mangrove_propagule_hanging_0_dense", "sparseEntityTypeId": "sable:fancy_model_mangrove_propagule_hanging_0_sparse", "material": "alpha_test", "model": { "type": "mangrove_propagule", "texture": "textures/blocks/mangrove_propagule_hanging", "stage": 0 }, "pool": { "entityTypeId": "sable:fancy_pool_saplings_0", "family": 0, "familyBits": 3, "stateBits": 0, "xBits": 7, "yBits": 6, "zBits": 7 } } }, { "condition": { "type": "binary", "operator": "&&", "left": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:hanging" }, "right": { "type": "literal", "value": true } }, "right": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:propagule_stage" }, "right": { "type": "literal", "value": 1 } } }, "model": { "key": "12fbe0bd946a7ad8e9e8a21bd36354b34f14e204451630ec1f3649115d04c4a5", "denseEntityTypeId": "sable:fancy_model_mangrove_propagule_hanging_1_dense", "sparseEntityTypeId": "sable:fancy_model_mangrove_propagule_hanging_1_sparse", "material": "alpha_test", "model": { "type": "mangrove_propagule", "texture": "textures/blocks/mangrove_propagule_hanging", "stage": 1 }, "pool": { "entityTypeId": "sable:fancy_pool_saplings_0", "family": 1, "familyBits": 3, "stateBits": 0, "xBits": 7, "yBits": 6, "zBits": 7 } } }, { "condition": { "type": "binary", "operator": "&&", "left": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:hanging" }, "right": { "type": "literal", "value": true } }, "right": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:propagule_stage" }, "right": { "type": "literal", "value": 2 } } }, "model": { "key": "50e72f55d964b77b609b6201665771f26491e5d29d0c815325739f103d0c1d69", "denseEntityTypeId": "sable:fancy_model_mangrove_propagule_hanging_2_dense", "sparseEntityTypeId": "sable:fancy_model_mangrove_propagule_hanging_2_sparse", "material": "alpha_test", "model": { "type": "mangrove_propagule", "texture": "textures/blocks/mangrove_propagule_hanging", "stage": 2 }, "pool": { "entityTypeId": "sable:fancy_pool_saplings_0", "family": 2, "familyBits": 3, "stateBits": 0, "xBits": 7, "yBits": 6, "zBits": 7 } } }, { "condition": { "type": "binary", "operator": "&&", "left": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:hanging" }, "right": { "type": "literal", "value": true } }, "right": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:propagule_stage" }, "right": { "type": "literal", "value": 3 } } }, "model": { "key": "fbb91c43cd8195872e9e03a0be5ef30277721bee17f9a5d739078b5c9daea021", "denseEntityTypeId": "sable:fancy_model_mangrove_propagule_hanging_3_dense", "sparseEntityTypeId": "sable:fancy_model_mangrove_propagule_hanging_3_sparse", "material": "alpha_test", "model": { "type": "mangrove_propagule", "texture": "textures/blocks/mangrove_propagule_hanging", "stage": 3 }, "pool": { "entityTypeId": "sable:fancy_pool_saplings_0", "family": 3, "familyBits": 3, "stateBits": 0, "xBits": 7, "yBits": 6, "zBits": 7 } } }, { "condition": { "type": "binary", "operator": "&&", "left": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:hanging" }, "right": { "type": "literal", "value": true } }, "right": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:propagule_stage" }, "right": { "type": "literal", "value": 4 } } }, "model": { "key": "a813f6715b94a61d9ba09685c49242e349d209e4ee6a1f7f1aa6e781bed158e8", "denseEntityTypeId": "sable:fancy_model_mangrove_propagule_hanging_4_dense", "sparseEntityTypeId": "sable:fancy_model_mangrove_propagule_hanging_4_sparse", "material": "alpha_test", "model": { "type": "mangrove_propagule", "texture": "textures/blocks/mangrove_propagule_hanging", "stage": 4 }, "pool": { "entityTypeId": "sable:fancy_pool_saplings_0", "family": 4, "familyBits": 3, "stateBits": 0, "xBits": 7, "yBits": 6, "zBits": 7 } } }], "default": null }, "minecraft:pale_hanging_moss": { "category": "nature/plants_and_flowers", "hardness": 0.2, "passable": true, "support": "moss_column", "states": ["minecraft:tip"], "variants": [{ "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:tip" }, "right": { "type": "literal", "value": true } }, "model": { "key": "388db014098b76f8857ee9ee5d5edcff0454d01599241960ae0e9d0e1579cd1b", "denseEntityTypeId": "sable:fancy_model_pale_hanging_moss_tip_dense", "sparseEntityTypeId": "sable:fancy_model_pale_hanging_moss_tip_sparse", "material": "alpha_test", "model": { "type": "pale_hanging_moss", "texture": "textures/blocks/pale_hanging_moss_tip", "tip": true }, "pool": { "entityTypeId": "sable:fancy_pool_plants_and_flowers_0", "family": 2, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:tip" }, "right": { "type": "literal", "value": false } }, "model": { "key": "886937773a6bab709256b3d3b6fe83f35ea244ffcc5749905462f8be1825e354", "denseEntityTypeId": "sable:fancy_model_pale_hanging_moss_dense", "sparseEntityTypeId": "sable:fancy_model_pale_hanging_moss_sparse", "material": "alpha_test", "model": { "type": "pale_hanging_moss", "texture": "textures/blocks/pale_hanging_moss_middle", "tip": false }, "pool": { "entityTypeId": "sable:fancy_pool_plants_and_flowers_0", "family": 1, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }], "default": { "key": "886937773a6bab709256b3d3b6fe83f35ea244ffcc5749905462f8be1825e354", "denseEntityTypeId": "sable:fancy_model_pale_hanging_moss_dense", "sparseEntityTypeId": "sable:fancy_model_pale_hanging_moss_sparse", "material": "alpha_test", "model": { "type": "pale_hanging_moss", "texture": "textures/blocks/pale_hanging_moss_middle", "tip": false }, "pool": { "entityTypeId": "sable:fancy_pool_plants_and_flowers_0", "family": 1, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, "minecraft:vine": { "category": "nature/plants_and_flowers", "hardness": 0.2, "passable": true, "support": "vine_faces", "states": ["minecraft:vine_direction_bits"], "variants": [{ "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:vine_direction_bits" }, "right": { "type": "literal", "value": 0 } }, "model": { "key": "1c68b7b390dad0f8177bfb401deb03940c4cf55491a6b5a95606e2849b45f910", "denseEntityTypeId": "sable:fancy_model_vine_dense", "sparseEntityTypeId": "sable:fancy_model_vine_sparse", "material": "alpha_test_tint", "model": { "type": "vine", "texture": "textures/blocks/vine", "faces": [] }, "tint": { "method": "foliage" }, "pool": { "entityTypeId": "sable:fancy_pool_plants_and_flowers_0", "family": 3, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:vine_direction_bits" }, "right": { "type": "literal", "value": 1 } }, "model": { "key": "1da065768fe4e8ea34900bdd9718ca9f4e6222515519debbac378cb4b8a98be9", "denseEntityTypeId": "sable:fancy_model_vine_1_dense", "sparseEntityTypeId": "sable:fancy_model_vine_1_sparse", "material": "alpha_test_tint", "model": { "type": "vine", "texture": "textures/blocks/vine", "faces": ["south"] }, "tint": { "method": "foliage" }, "pool": { "entityTypeId": "sable:fancy_pool_plants_and_flowers_0", "family": 4, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:vine_direction_bits" }, "right": { "type": "literal", "value": 2 } }, "model": { "key": "04d475b0957d4e4f3f81458b3e895fa61850088f682a372402750897af6ee8e9", "denseEntityTypeId": "sable:fancy_model_vine_2_dense", "sparseEntityTypeId": "sable:fancy_model_vine_2_sparse", "material": "alpha_test_tint", "model": { "type": "vine", "texture": "textures/blocks/vine", "faces": ["west"] }, "tint": { "method": "foliage" }, "pool": { "entityTypeId": "sable:fancy_pool_plants_and_flowers_0", "family": 5, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:vine_direction_bits" }, "right": { "type": "literal", "value": 3 } }, "model": { "key": "2145cbebad391f2e005395baaccbf6bf8cece5dd176885270b859b438e746e36", "denseEntityTypeId": "sable:fancy_model_vine_3_dense", "sparseEntityTypeId": "sable:fancy_model_vine_3_sparse", "material": "alpha_test_tint", "model": { "type": "vine", "texture": "textures/blocks/vine", "faces": ["south", "west"] }, "tint": { "method": "foliage" }, "pool": { "entityTypeId": "sable:fancy_pool_plants_and_flowers_0", "family": 6, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:vine_direction_bits" }, "right": { "type": "literal", "value": 4 } }, "model": { "key": "4bb505cafb19e00327c622bec0b5692b64708f2aebee9c56f01c62bdc27a7bff", "denseEntityTypeId": "sable:fancy_model_vine_4_dense", "sparseEntityTypeId": "sable:fancy_model_vine_4_sparse", "material": "alpha_test_tint", "model": { "type": "vine", "texture": "textures/blocks/vine", "faces": ["north"] }, "tint": { "method": "foliage" }, "pool": { "entityTypeId": "sable:fancy_pool_plants_and_flowers_0", "family": 7, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:vine_direction_bits" }, "right": { "type": "literal", "value": 5 } }, "model": { "key": "dc7dce1693f57d399f3fadd399ead65a98cf53a4129eb169f2597c8525516650", "denseEntityTypeId": "sable:fancy_model_vine_5_dense", "sparseEntityTypeId": "sable:fancy_model_vine_5_sparse", "material": "alpha_test_tint", "model": { "type": "vine", "texture": "textures/blocks/vine", "faces": ["south", "north"] }, "tint": { "method": "foliage" }, "pool": { "entityTypeId": "sable:fancy_pool_plants_and_flowers_0", "family": 8, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:vine_direction_bits" }, "right": { "type": "literal", "value": 6 } }, "model": { "key": "61816a83f3d6fa83dcd7af164c5b5272870920fe5cc20f5ee64a17bd3ef2b1af", "denseEntityTypeId": "sable:fancy_model_vine_6_dense", "sparseEntityTypeId": "sable:fancy_model_vine_6_sparse", "material": "alpha_test_tint", "model": { "type": "vine", "texture": "textures/blocks/vine", "faces": ["west", "north"] }, "tint": { "method": "foliage" }, "pool": { "entityTypeId": "sable:fancy_pool_plants_and_flowers_0", "family": 9, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:vine_direction_bits" }, "right": { "type": "literal", "value": 7 } }, "model": { "key": "dada0926f0a7b3ad4fb5cb9df8c2b4d4ede117cc33a6068daae7c4bc46c0675c", "denseEntityTypeId": "sable:fancy_model_vine_7_dense", "sparseEntityTypeId": "sable:fancy_model_vine_7_sparse", "material": "alpha_test_tint", "model": { "type": "vine", "texture": "textures/blocks/vine", "faces": ["south", "west", "north"] }, "tint": { "method": "foliage" }, "pool": { "entityTypeId": "sable:fancy_pool_plants_and_flowers_0", "family": 10, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:vine_direction_bits" }, "right": { "type": "literal", "value": 8 } }, "model": { "key": "04c92b4e6f34b602b177e023fc1c0fd9ab776c559fb0ad6019598c71b8260889", "denseEntityTypeId": "sable:fancy_model_vine_8_dense", "sparseEntityTypeId": "sable:fancy_model_vine_8_sparse", "material": "alpha_test_tint", "model": { "type": "vine", "texture": "textures/blocks/vine", "faces": ["east"] }, "tint": { "method": "foliage" }, "pool": { "entityTypeId": "sable:fancy_pool_plants_and_flowers_0", "family": 11, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:vine_direction_bits" }, "right": { "type": "literal", "value": 9 } }, "model": { "key": "0aadf2da0aeca5afcf24a19bd3ba93e2536ef3e42264c1c97fc6fbe029aef096", "denseEntityTypeId": "sable:fancy_model_vine_9_dense", "sparseEntityTypeId": "sable:fancy_model_vine_9_sparse", "material": "alpha_test_tint", "model": { "type": "vine", "texture": "textures/blocks/vine", "faces": ["south", "east"] }, "tint": { "method": "foliage" }, "pool": { "entityTypeId": "sable:fancy_pool_plants_and_flowers_0", "family": 12, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:vine_direction_bits" }, "right": { "type": "literal", "value": 10 } }, "model": { "key": "217c73d1b57c49557419cbeeecd4ce08e4e3c57f3b4457616c9f5e00bd904eb9", "denseEntityTypeId": "sable:fancy_model_vine_10_dense", "sparseEntityTypeId": "sable:fancy_model_vine_10_sparse", "material": "alpha_test_tint", "model": { "type": "vine", "texture": "textures/blocks/vine", "faces": ["west", "east"] }, "tint": { "method": "foliage" }, "pool": { "entityTypeId": "sable:fancy_pool_plants_and_flowers_0", "family": 13, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:vine_direction_bits" }, "right": { "type": "literal", "value": 11 } }, "model": { "key": "d24d78ed8a73a591590f35db5e7082919838c832749c38511d26a1701bdea81f", "denseEntityTypeId": "sable:fancy_model_vine_11_dense", "sparseEntityTypeId": "sable:fancy_model_vine_11_sparse", "material": "alpha_test_tint", "model": { "type": "vine", "texture": "textures/blocks/vine", "faces": ["south", "west", "east"] }, "tint": { "method": "foliage" }, "pool": { "entityTypeId": "sable:fancy_pool_plants_and_flowers_0", "family": 14, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:vine_direction_bits" }, "right": { "type": "literal", "value": 12 } }, "model": { "key": "1f855a96a91bda2d110e79f4db8dc40ac1a80b8489de1e389f9761beab8ca6a8", "denseEntityTypeId": "sable:fancy_model_vine_12_dense", "sparseEntityTypeId": "sable:fancy_model_vine_12_sparse", "material": "alpha_test_tint", "model": { "type": "vine", "texture": "textures/blocks/vine", "faces": ["north", "east"] }, "tint": { "method": "foliage" }, "pool": { "entityTypeId": "sable:fancy_pool_plants_and_flowers_0", "family": 15, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:vine_direction_bits" }, "right": { "type": "literal", "value": 13 } }, "model": { "key": "38acc3f2b7fc5199ed79e271729b8a5c5256d261d9d4d907fb3ea6b73e0f6000", "denseEntityTypeId": "sable:fancy_model_vine_13_dense", "sparseEntityTypeId": "sable:fancy_model_vine_13_sparse", "material": "alpha_test_tint", "model": { "type": "vine", "texture": "textures/blocks/vine", "faces": ["south", "north", "east"] }, "tint": { "method": "foliage" }, "pool": { "entityTypeId": "sable:fancy_pool_plants_and_flowers_0", "family": 16, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:vine_direction_bits" }, "right": { "type": "literal", "value": 14 } }, "model": { "key": "41526e8183d4fc331e81643f2f6ce2c6d141a1f453d162e8b270c51fc4612051", "denseEntityTypeId": "sable:fancy_model_vine_14_dense", "sparseEntityTypeId": "sable:fancy_model_vine_14_sparse", "material": "alpha_test_tint", "model": { "type": "vine", "texture": "textures/blocks/vine", "faces": ["west", "north", "east"] }, "tint": { "method": "foliage" }, "pool": { "entityTypeId": "sable:fancy_pool_plants_and_flowers_0", "family": 17, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:vine_direction_bits" }, "right": { "type": "literal", "value": 15 } }, "model": { "key": "dfd8e06df653e6c61dc853bc20947c16ebc521e1420762bd1dc86a70d00c2397", "denseEntityTypeId": "sable:fancy_model_vine_15_dense", "sparseEntityTypeId": "sable:fancy_model_vine_15_sparse", "material": "alpha_test_tint", "model": { "type": "vine", "texture": "textures/blocks/vine", "faces": ["south", "west", "north", "east"] }, "tint": { "method": "foliage" }, "pool": { "entityTypeId": "sable:fancy_pool_plants_and_flowers_0", "family": 18, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }], "default": { "key": "1c68b7b390dad0f8177bfb401deb03940c4cf55491a6b5a95606e2849b45f910", "denseEntityTypeId": "sable:fancy_model_vine_dense", "sparseEntityTypeId": "sable:fancy_model_vine_sparse", "material": "alpha_test_tint", "model": { "type": "vine", "texture": "textures/blocks/vine", "faces": [] }, "tint": { "method": "foliage" }, "pool": { "entityTypeId": "sable:fancy_pool_plants_and_flowers_0", "family": 3, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, "minecraft:creaking_heart": { "category": "building/logs_and_wood", "hardness": 2, "states": ["minecraft:pillar_axis", "minecraft:creaking_heart_state"], "variants": [{ "condition": { "type": "binary", "operator": "&&", "left": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "y" } }, "right": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:creaking_heart_state" }, "right": { "type": "literal", "value": "uprooted" } } }, "model": { "key": "0a876085ad634931c4190f3023a4e1fe6e6086757f6a82eed0ea5576f1bab60d", "denseEntityTypeId": "sable:fancy_model_creaking_heart_dense", "sparseEntityTypeId": "sable:fancy_model_creaking_heart_sparse", "material": "opaque", "model": { "type": "creaking_heart", "textures": { "side": "textures/blocks/creaking_heart_side_inactive", "top": "textures/blocks/creaking_heart_top_inactive" }, "axis": "y" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_3", "family": 12, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "&&", "left": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "y" } }, "right": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:creaking_heart_state" }, "right": { "type": "literal", "value": "dormant" } } }, "model": { "key": "d9aae0ea07488eee97a89ee754fc245357920dbc8ebf594b05f243f4c96aa568", "denseEntityTypeId": "sable:fancy_model_creaking_heart_y_dormant_dense", "sparseEntityTypeId": "sable:fancy_model_creaking_heart_y_dormant_sparse", "material": "opaque", "model": { "type": "creaking_heart", "textures": { "side": "textures/blocks/creaking_heart_side_dormant", "top": "textures/blocks/creaking_heart_top_dormant" }, "axis": "y" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_3", "family": 13, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "&&", "left": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "y" } }, "right": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:creaking_heart_state" }, "right": { "type": "literal", "value": "awake" } } }, "model": { "key": "69829dd05950082541918fffa450b87a1e11fa1eafa628e7f4b809b4195bd558", "denseEntityTypeId": "sable:fancy_model_creaking_heart_y_awake_dense", "sparseEntityTypeId": "sable:fancy_model_creaking_heart_y_awake_sparse", "material": "opaque", "model": { "type": "creaking_heart", "textures": { "side": "textures/blocks/creaking_heart_side_active", "top": "textures/blocks/creaking_heart_top_active" }, "axis": "y" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_3", "family": 14, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "&&", "left": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "x" } }, "right": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:creaking_heart_state" }, "right": { "type": "literal", "value": "uprooted" } } }, "model": { "key": "c8ea3eec6d65714a7ef3d77eb28a598ed89c1b920329b5d3c95ef495437b9863", "denseEntityTypeId": "sable:fancy_model_creaking_heart_x_uprooted_dense", "sparseEntityTypeId": "sable:fancy_model_creaking_heart_x_uprooted_sparse", "material": "opaque", "model": { "type": "creaking_heart", "textures": { "side": "textures/blocks/creaking_heart_side_inactive", "top": "textures/blocks/creaking_heart_top_inactive" }, "axis": "x" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_3", "family": 15, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "&&", "left": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "x" } }, "right": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:creaking_heart_state" }, "right": { "type": "literal", "value": "dormant" } } }, "model": { "key": "73849f4928995890c0b2db7334b22b9c803da70b0a9c94acaf199410cdfddce8", "denseEntityTypeId": "sable:fancy_model_creaking_heart_x_dormant_dense", "sparseEntityTypeId": "sable:fancy_model_creaking_heart_x_dormant_sparse", "material": "opaque", "model": { "type": "creaking_heart", "textures": { "side": "textures/blocks/creaking_heart_side_dormant", "top": "textures/blocks/creaking_heart_top_dormant" }, "axis": "x" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_3", "family": 16, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "&&", "left": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "x" } }, "right": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:creaking_heart_state" }, "right": { "type": "literal", "value": "awake" } } }, "model": { "key": "6210baf12eb5fee9214818af476382f2fb13297cf9db13821f0b715a918bd336", "denseEntityTypeId": "sable:fancy_model_creaking_heart_x_awake_dense", "sparseEntityTypeId": "sable:fancy_model_creaking_heart_x_awake_sparse", "material": "opaque", "model": { "type": "creaking_heart", "textures": { "side": "textures/blocks/creaking_heart_side_active", "top": "textures/blocks/creaking_heart_top_active" }, "axis": "x" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_3", "family": 17, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "&&", "left": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "z" } }, "right": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:creaking_heart_state" }, "right": { "type": "literal", "value": "uprooted" } } }, "model": { "key": "5725174438fcac52c7387af745978d8f3f6af8232e6a3855ec861e27f3309c8f", "denseEntityTypeId": "sable:fancy_model_creaking_heart_z_uprooted_dense", "sparseEntityTypeId": "sable:fancy_model_creaking_heart_z_uprooted_sparse", "material": "opaque", "model": { "type": "creaking_heart", "textures": { "side": "textures/blocks/creaking_heart_side_inactive", "top": "textures/blocks/creaking_heart_top_inactive" }, "axis": "z" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_3", "family": 18, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "&&", "left": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "z" } }, "right": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:creaking_heart_state" }, "right": { "type": "literal", "value": "dormant" } } }, "model": { "key": "fde898e71c77f414d4433c72c3b787ec2b4ce539093f27e515de1998a77a7766", "denseEntityTypeId": "sable:fancy_model_creaking_heart_z_dormant_dense", "sparseEntityTypeId": "sable:fancy_model_creaking_heart_z_dormant_sparse", "material": "opaque", "model": { "type": "creaking_heart", "textures": { "side": "textures/blocks/creaking_heart_side_dormant", "top": "textures/blocks/creaking_heart_top_dormant" }, "axis": "z" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_3", "family": 19, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }, { "condition": { "type": "binary", "operator": "&&", "left": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:pillar_axis" }, "right": { "type": "literal", "value": "z" } }, "right": { "type": "binary", "operator": "==", "left": { "type": "state", "name": "minecraft:creaking_heart_state" }, "right": { "type": "literal", "value": "awake" } } }, "model": { "key": "e2ad981bc7f03af5d6575f1a5a136647f4d8d8683ab429515e6165e5cf8de898", "denseEntityTypeId": "sable:fancy_model_creaking_heart_z_awake_dense", "sparseEntityTypeId": "sable:fancy_model_creaking_heart_z_awake_sparse", "material": "opaque", "model": { "type": "creaking_heart", "textures": { "side": "textures/blocks/creaking_heart_side_active", "top": "textures/blocks/creaking_heart_top_active" }, "axis": "z" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_3", "family": 20, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } }], "default": { "key": "0a876085ad634931c4190f3023a4e1fe6e6086757f6a82eed0ea5576f1bab60d", "denseEntityTypeId": "sable:fancy_model_creaking_heart_dense", "sparseEntityTypeId": "sable:fancy_model_creaking_heart_sparse", "material": "opaque", "model": { "type": "creaking_heart", "textures": { "side": "textures/blocks/creaking_heart_side_inactive", "top": "textures/blocks/creaking_heart_top_inactive" }, "axis": "y" }, "pool": { "entityTypeId": "sable:fancy_pool_logs_and_wood_3", "family": 12, "familyBits": 5, "stateBits": 0, "xBits": 6, "yBits": 6, "zBits": 6 } } } };

// sable/packs/SableBP/scripts/sable/sublevel/render/fancy/model/FancySubLevelModelTypes.js
function createFancySubLevelModelState(model) {
  if (model.type !== "chest") return void 0;
  return {
    bits: 1,
    dimensions: [{ maximum: 1, minimum: 0, name: "open", value: 0 }],
    update: (state, dimension, value) => dimension === "open" && Number.isInteger(value) && value >= 0 && value <= 1 ? value : void 0
  };
}

// sable/packs/SableBP/scripts/sable/sublevel/render/fancy/model/FancySubLevelModelRegistry.js
var modelCache = /* @__PURE__ */ new Map();
var MISSING_MODEL = {
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
function getSubLevelBlockRegistration(typeId) {
  const registration = blockRegistry[typeId];
  if (!registration) return void 0;
  return {
    category: registration.category,
    hardness: registration.hardness,
    placeable: registration.placeable,
    passable: registration.passable,
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

// sable/packs/SableBP/scripts/sable/api/SubLevelAssemblyHelper.js
var LEGACY_LOG_ITEMS = {
  acacia: "minecraft:acacia_log",
  birch: "minecraft:birch_log",
  dark_oak: "minecraft:dark_oak_log",
  jungle: "minecraft:jungle_log",
  oak: "minecraft:oak_log",
  spruce: "minecraft:spruce_log"
};
var LEGACY_LEAF_ITEMS = {
  acacia: "minecraft:acacia_leaves",
  birch: "minecraft:birch_leaves",
  dark_oak: "minecraft:dark_oak_leaves",
  jungle: "minecraft:jungle_leaves",
  oak: "minecraft:oak_leaves",
  spruce: "minecraft:spruce_leaves"
};
function captureSubLevelBlock(block, origin) {
  const permutation = block.permutation;
  const typeId = permutation.type.id;
  const states = permutation.getAllStates();
  const captured = {
    localLocation: {
      x: block.location.x - origin.x,
      y: block.location.y - origin.y,
      z: block.location.z - origin.z
    },
    states,
    typeId
  };
  if (getSubLevelBlockRegistration(typeId)?.passable === true) {
    captured.collisionResponse = false;
  }
  const itemTypeId = heldItemTypeId(typeId, states);
  if (itemTypeId !== typeId) captured.itemTypeId = itemTypeId;
  const rotation = heldBlockRotation(states);
  if (rotation) captured.rotation = rotation;
  if (!typeId.startsWith("minecraft:")) {
    const mapColor = captureMapColor(block, typeId);
    if (mapColor) captured.mapColor = mapColor;
  }
  return captured;
}
function captureSubLevelBlocks(blocks, origin) {
  const result = [];
  for (const block of blocks) {
    if (block.isAir || block.isLiquid) continue;
    result.push(captureSubLevelBlock(block, origin));
  }
  return result;
}
function heldItemTypeId(typeId, states) {
  if (typeId === "minecraft:log") {
    return LEGACY_LOG_ITEMS[String(states.old_log_type ?? "oak")] ?? typeId;
  }
  if (typeId === "minecraft:log2") {
    return LEGACY_LOG_ITEMS[String(states.new_log_type ?? "acacia")] ?? typeId;
  }
  if (typeId === "minecraft:leaves") {
    return LEGACY_LEAF_ITEMS[String(states.old_leaf_type ?? "oak")] ?? typeId;
  }
  if (typeId === "minecraft:leaves2") {
    return LEGACY_LEAF_ITEMS[String(states.new_leaf_type ?? "acacia")] ?? typeId;
  }
  return typeId;
}
function heldBlockRotation(states) {
  const axis = states.pillar_axis ?? states["minecraft:pillar_axis"];
  if (axis === "x") return { x: 0, y: 0, z: 90 };
  if (axis === "z") return { x: 90, y: 0, z: 0 };
  const blockFace = states["minecraft:block_face"] ?? states.block_face;
  if (blockFace === "east" || blockFace === "west") return { x: 0, y: 0, z: 90 };
  if (blockFace === "north" || blockFace === "south") return { x: 90, y: 0, z: 0 };
  return void 0;
}
function captureMapColor(block, typeId) {
  const component = block.getComponent("minecraft:map_color");
  if (!component) return void 0;
  const { blue, green, red } = component.tintedColor;
  for (const [channel, value] of [["red", red], ["green", green], ["blue", blue]]) {
    if (!Number.isFinite(value) || value < 0 || value > 1) {
      throw new RangeError(`Invalid ${channel} map-color channel for ${typeId}: ${value}.`);
    }
  }
  return { blue, green, red };
}

// sable/packs/SableBP/scripts/sable/data/vanilla/colormap/BiomeFoliageClimates.js
var BIOME_FOLIAGE_CLIMATES = {
  "minecraft:bamboo_jungle": { downfall: 0.9, temperature: 0.95 },
  "minecraft:bamboo_jungle_hills": { downfall: 0.9, temperature: 0.95 },
  "minecraft:basalt_deltas": { downfall: 0, temperature: 2 },
  "minecraft:beach": { downfall: 0.4, temperature: 0.8 },
  "minecraft:birch_forest": { downfall: 0.6, temperature: 0.6 },
  "minecraft:birch_forest_hills": { downfall: 0.6, temperature: 0.6 },
  "minecraft:birch_forest_hills_mutated": { downfall: 0.6, temperature: 0.6 },
  "minecraft:birch_forest_mutated": { downfall: 0.6, temperature: 0.6 },
  "minecraft:cherry_grove": { downfall: 0.8, temperature: 0.3 },
  "minecraft:cold_beach": { downfall: 0.3, temperature: 0.05 },
  "minecraft:cold_ocean": { downfall: 0.5, temperature: 0.5 },
  "minecraft:cold_taiga": { downfall: 0.4, temperature: -0.5 },
  "minecraft:cold_taiga_hills": { downfall: 0.4, temperature: -0.5 },
  "minecraft:cold_taiga_mutated": { downfall: 0.4, temperature: -0.5 },
  "minecraft:crimson_forest": { downfall: 0, temperature: 2 },
  "minecraft:deep_cold_ocean": { downfall: 0.5, temperature: 0.5 },
  "minecraft:deep_dark": { downfall: 0.4, temperature: 0.8 },
  "minecraft:deep_frozen_ocean": { downfall: 0.5, temperature: 0.5 },
  "minecraft:deep_lukewarm_ocean": { downfall: 0.5, temperature: 0.5 },
  "minecraft:deep_ocean": { downfall: 0.5, temperature: 0.5 },
  "minecraft:deep_warm_ocean": { downfall: 0.5, temperature: 0.5 },
  "minecraft:desert": { downfall: 0, temperature: 2 },
  "minecraft:desert_hills": { downfall: 0, temperature: 2 },
  "minecraft:desert_mutated": { downfall: 0, temperature: 2 },
  "minecraft:dripstone_caves": { downfall: 0, temperature: 0.2 },
  "minecraft:extreme_hills": { downfall: 0.3, temperature: 0.2 },
  "minecraft:extreme_hills_edge": { downfall: 0.3, temperature: 0.2 },
  "minecraft:extreme_hills_mutated": { downfall: 0.3, temperature: 0.2 },
  "minecraft:extreme_hills_plus_trees": { downfall: 0.3, temperature: 0.2 },
  "minecraft:extreme_hills_plus_trees_mutated": { downfall: 0.3, temperature: 0.2 },
  "minecraft:flower_forest": { downfall: 0.8, temperature: 0.7 },
  "minecraft:forest": { downfall: 0.8, temperature: 0.7 },
  "minecraft:forest_hills": { downfall: 0.8, temperature: 0.7 },
  "minecraft:frozen_ocean": { downfall: 0.5, temperature: 0 },
  "minecraft:frozen_peaks": { downfall: 0.9, temperature: -0.7 },
  "minecraft:frozen_river": { downfall: 0.5, temperature: 0 },
  "minecraft:grove": { downfall: 0.8, temperature: -0.2 },
  "minecraft:hell": { downfall: 0, temperature: 2 },
  "minecraft:ice_mountains": { downfall: 0.9, temperature: -0.3 },
  "minecraft:ice_plains": { downfall: 0.5, temperature: 0 },
  "minecraft:ice_plains_spikes": { downfall: 1, temperature: 0 },
  "minecraft:jagged_peaks": { downfall: 0.9, temperature: -0.7 },
  "minecraft:jungle": { downfall: 0.9, temperature: 0.95 },
  "minecraft:jungle_edge": { downfall: 0.8, temperature: 0.95 },
  "minecraft:jungle_edge_mutated": { downfall: 0.8, temperature: 0.95 },
  "minecraft:jungle_hills": { downfall: 0.9, temperature: 0.95 },
  "minecraft:jungle_mutated": { downfall: 0.9, temperature: 0.95 },
  "minecraft:legacy_frozen_ocean": { downfall: 0.5, temperature: 0 },
  "minecraft:lukewarm_ocean": { downfall: 0.5, temperature: 0.5 },
  "minecraft:lush_caves": { downfall: 0, temperature: 0.9 },
  "minecraft:mangrove_swamp": { downfall: 0.9, temperature: 0.8 },
  "minecraft:meadow": { downfall: 0.8, temperature: 0.3 },
  "minecraft:mega_taiga": { downfall: 0.8, temperature: 0.3 },
  "minecraft:mega_taiga_hills": { downfall: 0.8, temperature: 0.3 },
  "minecraft:mesa": { downfall: 0, temperature: 2 },
  "minecraft:mesa_bryce": { downfall: 0, temperature: 2 },
  "minecraft:mesa_plateau": { downfall: 0, temperature: 2 },
  "minecraft:mesa_plateau_mutated": { downfall: 0, temperature: 2 },
  "minecraft:mesa_plateau_stone": { downfall: 0, temperature: 2 },
  "minecraft:mesa_plateau_stone_mutated": { downfall: 0, temperature: 2 },
  "minecraft:mushroom_island": { downfall: 1, temperature: 0.9 },
  "minecraft:mushroom_island_shore": { downfall: 1, temperature: 0.9 },
  "minecraft:ocean": { downfall: 0.5, temperature: 0.5 },
  "minecraft:pale_garden": { downfall: 0.8, temperature: 0.7 },
  "minecraft:plains": { downfall: 0.4, temperature: 0.8 },
  "minecraft:redwood_taiga_hills_mutated": { downfall: 0.8, temperature: 0.25 },
  "minecraft:redwood_taiga_mutated": { downfall: 0.8, temperature: 0.25 },
  "minecraft:river": { downfall: 0.5, temperature: 0.5 },
  "minecraft:roofed_forest": { downfall: 0.8, temperature: 0.7 },
  "minecraft:roofed_forest_mutated": { downfall: 0.8, temperature: 0.7 },
  "minecraft:savanna": { downfall: 0, temperature: 1.2 },
  "minecraft:savanna_mutated": { downfall: 0, temperature: 2 },
  "minecraft:savanna_plateau": { downfall: 0, temperature: 1 },
  "minecraft:savanna_plateau_mutated": { downfall: 0, temperature: 2 },
  "minecraft:snowy_slopes": { downfall: 0.9, temperature: -0.3 },
  "minecraft:soulsand_valley": { downfall: 0, temperature: 2 },
  "minecraft:stone_beach": { downfall: 0.3, temperature: 0.2 },
  "minecraft:stony_peaks": { downfall: 0.3, temperature: 1 },
  "minecraft:sulfur_caves": { downfall: 0.4, temperature: 0.8 },
  "minecraft:sunflower_plains": { downfall: 0.4, temperature: 0.8 },
  "minecraft:swamp": { downfall: 0.5, temperature: 0.8 },
  "minecraft:swampland": { downfall: 0.5, temperature: 0.8 },
  "minecraft:swampland_mutated": { downfall: 0.5, temperature: 0.8 },
  "minecraft:taiga": { downfall: 0.8, temperature: 0.25 },
  "minecraft:taiga_hills": { downfall: 0.8, temperature: 0.25 },
  "minecraft:taiga_mutated": { downfall: 0.8, temperature: 0.25 },
  "minecraft:the_end": { downfall: 0.5, temperature: 0.5 },
  "minecraft:warm_ocean": { downfall: 0.5, temperature: 0.5 },
  "minecraft:warped_forest": { downfall: 0, temperature: 2 }
};

// sable/packs/SableBP/scripts/sable/sublevel/render/fancy/model/FancySubLevelTintCodec.js
var FOLIAGE_COLORMAP_DEFAULT = 1;
var FOLIAGE_COLORMAP_SWAMP = 2;
var FOLIAGE_COLORMAP_MANGROVE_SWAMP = 3;
var FOLIAGE_COLORMAP_FIXED = 6;
var FOLIAGE_TINT_COORDINATE_STEPS = 31;
var TINT_COORDINATE_BASE = FOLIAGE_TINT_COORDINATE_STEPS + 1;
var TINT_KIND_PLACE = TINT_COORDINATE_BASE ** 4;
var TINT_AXIS_Z_PLACE = 8 * TINT_KIND_PLACE;
var TINT_UNIFORM_STATE = 7;
var TINT_TEXTURE_SIZE = 256;
function climateToColormapUv(baseTemperature, baseDownfall) {
  const temperature = clamp(baseTemperature);
  const rainfall = clamp(baseDownfall) * temperature;
  return { u: 1 - temperature, v: 1 - rainfall };
}
var DEFAULT_SUBLEVEL_FOLIAGE_TINT = (() => {
  const uv = climateToColormapUv(0.8, 0.4);
  return Object.freeze({
    gradientAxis: "x",
    mapKind: FOLIAGE_COLORMAP_DEFAULT,
    uAtLocalOrigin: uv.u,
    uPerLocalX: 0,
    vAtLocalOrigin: uv.v,
    vPerLocalZ: 0
  });
})();
function packFancySubLevelTint(packed, foliage = DEFAULT_SUBLEVEL_FOLIAGE_TINT) {
  const tint = packed.tint;
  if (!tint) return 0;
  if (tint.method === "fixed") {
    const cell = Math.max(0, Math.min(TINT_COORDINATE_BASE - 1, Math.floor(tint.palette)));
    return cell + cell * TINT_COORDINATE_BASE ** 2 + FOLIAGE_COLORMAP_FIXED * TINT_KIND_PLACE;
  }
  if (isUniformField(foliage)) {
    return textureCoordinate(foliage.uAtLocalOrigin) + textureCoordinate(foliage.vAtLocalOrigin) * TINT_TEXTURE_SIZE + TINT_UNIFORM_STATE * TINT_KIND_PLACE;
  }
  const width = packed.width;
  const depth = packed.depth;
  const minimumX = packed.anchorLocalLocation.x - 0.5;
  const minimumZ = packed.anchorLocalLocation.z - 0.5;
  const maximumX = minimumX + width;
  const maximumZ = minimumZ + depth;
  const axis = foliage.gradientAxis;
  const minimum = axis === "x" ? minimumX : minimumZ;
  const maximum = axis === "x" ? maximumX : maximumZ;
  const u0 = quantize(foliage.uAtLocalOrigin + foliage.uPerLocalX * minimum);
  const u1 = quantize(foliage.uAtLocalOrigin + foliage.uPerLocalX * maximum);
  const v0 = quantize(foliage.vAtLocalOrigin + foliage.vPerLocalZ * minimum);
  const v1 = quantize(foliage.vAtLocalOrigin + foliage.vPerLocalZ * maximum);
  return u0 + v0 * TINT_COORDINATE_BASE + u1 * TINT_COORDINATE_BASE ** 2 + v1 * TINT_COORDINATE_BASE ** 3 + clampMapKind(foliage.mapKind) * TINT_KIND_PLACE + (axis === "z" ? TINT_AXIS_Z_PLACE : 0);
}
function quantize(value) {
  return Math.round(clamp(value) * FOLIAGE_TINT_COORDINATE_STEPS);
}
function textureCoordinate(value) {
  return Math.floor(clamp(value) * (TINT_TEXTURE_SIZE - 1));
}
function clamp(value) {
  return Math.max(0, Math.min(1, value));
}
function clampMapKind(value) {
  return Math.max(1, Math.min(6, Math.floor(value)));
}
function isUniformField(field) {
  return field.mapKind === FOLIAGE_COLORMAP_DEFAULT && field.uPerLocalX === 0 && field.vPerLocalZ === 0;
}

// sable/packs/SableBP/scripts/sable/render/dynamic_biome/DynamicBiomeTintSampler.js
var FIXED_CHERRY_GROVE_PALETTE_U = 8 / FOLIAGE_TINT_COORDINATE_STEPS;
var FIXED_PALE_GARDEN_PALETTE_U = 23 / FOLIAGE_TINT_COORDINATE_STEPS;
var FIXED_PALETTE_V = 16 / FOLIAGE_TINT_COORDINATE_STEPS;
function captureSubLevelFoliageTint(dimension, blocks, origin) {
  const foliage = blocks.filter((block) => resolveFancySubLevelBlock(block)?.model.tint?.method === "foliage");
  if (foliage.length === 0) return { ...DEFAULT_SUBLEVEL_FOLIAGE_TINT };
  const worldX = foliage.map((block) => origin.x + block.localLocation.x);
  const worldZ = foliage.map((block) => origin.z + block.localLocation.z);
  const minimumX = Math.min(...worldX);
  const maximumX = Math.max(...worldX);
  const minimumZ = Math.min(...worldZ);
  const maximumZ = Math.max(...worldZ);
  const sampleY = Math.floor(
    foliage.reduce((sum, block) => sum + origin.y + block.localLocation.y, 0) / foliage.length
  );
  const centerX = Math.floor((minimumX + maximumX) / 2);
  const centerZ = Math.floor((minimumZ + maximumZ) / 2);
  const locations = deduplicateLocations([
    { x: centerX, y: sampleY, z: centerZ },
    { x: minimumX, y: sampleY, z: minimumZ },
    { x: maximumX, y: sampleY, z: minimumZ },
    { x: minimumX, y: sampleY, z: maximumZ },
    { x: maximumX, y: sampleY, z: maximumZ }
  ]);
  const samples = locations.map((location) => sampleFoliage(dimension, location, origin));
  const source = chooseFoliageColorSource(samples);
  if (source.kind === FOLIAGE_COLORMAP_FIXED) {
    const palette = source.palette ?? "cherry_grove";
    const uv = fixedPaletteUv(palette);
    return {
      gradientAxis: "x",
      mapKind: source.kind,
      uAtLocalOrigin: uv.u,
      uPerLocalX: 0,
      vAtLocalOrigin: uv.v,
      vPerLocalZ: 0
    };
  }
  const selectedSamples = samples.filter((sample) => sample.kind === source.kind);
  const xFit = fitFoliageAxis(selectedSamples, "x");
  const zFit = fitFoliageAxis(selectedSamples, "z");
  const fit = zFit.error < xFit.error ? zFit : xFit;
  return {
    gradientAxis: fit.axis,
    mapKind: source.kind,
    uAtLocalOrigin: fit.u.intercept,
    uPerLocalX: fit.u.slope,
    vAtLocalOrigin: fit.v.intercept,
    vPerLocalZ: fit.v.slope
  };
}
function sampleFoliage(dimension, location, origin) {
  let biomeId = "minecraft:plains";
  try {
    biomeId = dimension.getBiome(location).id;
  } catch {
  }
  const climate = BIOME_FOLIAGE_CLIMATES[biomeId] ?? BIOME_FOLIAGE_CLIMATES["minecraft:plains"];
  const uv = climateToColormapUv(climate.temperature, climate.downfall);
  return {
    kind: biomeColormapKind(biomeId),
    localX: location.x - origin.x,
    localZ: location.z - origin.z,
    palette: biomeFixedPalette(biomeId),
    u: uv.u,
    v: uv.v
  };
}
function biomeColormapKind(typeId) {
  if (biomeFixedPalette(typeId)) return FOLIAGE_COLORMAP_FIXED;
  if (typeId === "minecraft:mangrove_swamp") return FOLIAGE_COLORMAP_MANGROVE_SWAMP;
  if (typeId === "minecraft:swamp" || typeId === "minecraft:swampland" || typeId === "minecraft:swampland_mutated") return FOLIAGE_COLORMAP_SWAMP;
  return FOLIAGE_COLORMAP_DEFAULT;
}
function biomeFixedPalette(typeId) {
  if (typeId === "minecraft:cherry_grove") return "cherry_grove";
  if (typeId === "minecraft:pale_garden") return "pale_garden";
  return void 0;
}
function chooseFoliageColorSource(samples) {
  const fallback = {
    kind: FOLIAGE_COLORMAP_DEFAULT,
    palette: void 0
  };
  if (samples.length === 0) return fallback;
  const counts = /* @__PURE__ */ new Map();
  for (const sample of samples) {
    const key = foliageColorSourceKey(sample);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const maximum = Math.max(...counts.values());
  for (const sample of samples) {
    if ((counts.get(foliageColorSourceKey(sample)) ?? 0) === maximum) {
      return { kind: sample.kind, palette: sample.palette };
    }
  }
  return fallback;
}
function foliageColorSourceKey(source) {
  return `${source.kind}:${source.palette ?? ""}`;
}
function fixedPaletteUv(palette) {
  return {
    u: palette === "pale_garden" ? FIXED_PALE_GARDEN_PALETTE_U : FIXED_CHERRY_GROVE_PALETTE_U,
    v: FIXED_PALETTE_V
  };
}
function fitAxis(samples, coordinate, value) {
  const meanCoordinate = samples.reduce((sum, sample) => sum + coordinate(sample), 0) / samples.length;
  const meanValue = samples.reduce((sum, sample) => sum + value(sample), 0) / samples.length;
  let covariance = 0;
  let variance = 0;
  for (const sample of samples) {
    const delta = coordinate(sample) - meanCoordinate;
    covariance += delta * (value(sample) - meanValue);
    variance += delta * delta;
  }
  const slope = variance > 0 ? covariance / variance : 0;
  return { intercept: meanValue - slope * meanCoordinate, slope };
}
function fitFoliageAxis(samples, axis) {
  const coordinate = axis === "x" ? (sample) => sample.localX : (sample) => sample.localZ;
  const u = fitAxis(samples, coordinate, (sample) => sample.u);
  const v = fitAxis(samples, coordinate, (sample) => sample.v);
  const error = samples.reduce((sum, sample) => {
    const at = coordinate(sample);
    const uError = sample.u - (u.intercept + u.slope * at);
    const vError = sample.v - (v.intercept + v.slope * at);
    return sum + uError * uError + vError * vError;
  }, 0);
  return { axis, error, u, v };
}
function deduplicateLocations(locations) {
  const result = /* @__PURE__ */ new Map();
  for (const location of locations) {
    result.set(`${location.x},${location.y},${location.z}`, location);
  }
  return [...result.values()];
}

// sable/packs/SableBP/scripts/sable/sublevel/render/SubLevelRenderer.js
import { ItemTypes as ItemTypes2, system as system3 } from "@minecraft/server";

// sable/packs/SableBP/scripts/sable/sublevel/render/fancy/model/FancySubLevelModelRenderer.js
import { system as system2 } from "@minecraft/server";

// sable/packs/SableBP/scripts/sable/sublevel/render/SubLevelRenderData.js
var BLOCK_CARRIER_ENTITY_TYPE_ID = "sable:block_carrier";
var CARRIER_SEAT_COUNT = 512;
var BLOCK_CARRIER_CAPACITY = CARRIER_SEAT_COUNT - 1;
var BLOCK_SLOTS_PER_ENTITY = 2;

// sable/packs/SableBP/scripts/sable/sublevel/render/SubLevelRenderEntityUtils.js
import { system } from "@minecraft/server";
var RENDER_POSITION_WRITE_THRESHOLD = 1 / 1024;
var RENDER_ROTATION_WRITE_THRESHOLD_DEGREES = 0.05;
var RIDER_MOUNT_CONFIRMATION_TIMEOUT_TICKS = 20;
function nativeRiders(entity) {
  if (!entity.isValid) return [];
  return entity.getComponent("minecraft:rideable")?.getRiders() ?? [];
}
function ejectCurrentVehicle(entity) {
  if (!entity.isValid) return;
  const vehicle = entity.getComponent("minecraft:riding")?.entityRidingOn;
  if (vehicle?.isValid) vehicle.getComponent("minecraft:rideable")?.ejectRider(entity);
}
function getContinuousRenderRotation(body, reference) {
  return body.getRenderRotation?.(reference) ?? body.getRotation();
}
function validEntityLocations(entities) {
  const result = [];
  for (const entity of entities) {
    if (!entity.isValid) continue;
    try {
      result.push({ ...entity.location });
    } catch {
    }
  }
  return result;
}
function hasExactRiders(carrier, expectedRiderIds, additionalExpectedRiderIds, persistentExpectedRiderIds) {
  const expectedSize = expectedRiderIds.size + (additionalExpectedRiderIds?.size ?? 0) + (persistentExpectedRiderIds?.size ?? 0);
  if (!carrier.isValid) return false;
  try {
    const rideable = carrier.getComponent("minecraft:rideable");
    if (!rideable) return false;
    const riders = rideable.getRiders();
    if (riders.length !== expectedSize) return false;
    for (const rider of riders) {
      if (!rider.isValid || !expectedRiderIds.has(rider.id) && !additionalExpectedRiderIds?.has(rider.id) && !persistentExpectedRiderIds?.has(rider.id)) return false;
    }
    return true;
  } catch {
    return false;
  }
}
function hasRidersConsistentWithPendingMounts(carrier, expectedRiderIds, additionalExpectedRiderIds, persistentExpectedRiderIds, pendingRiderIds) {
  for (const riderId of pendingRiderIds) {
    if (!expectedRiderIds.has(riderId) && !additionalExpectedRiderIds.has(riderId) && !persistentExpectedRiderIds.has(riderId)) return false;
  }
  const expectedSize = expectedRiderIds.size + additionalExpectedRiderIds.size + persistentExpectedRiderIds.size;
  if (!carrier.isValid) return false;
  try {
    const rideable = carrier.getComponent("minecraft:rideable");
    if (!rideable) return false;
    const riders = rideable.getRiders();
    const minimumExpectedSize = expectedSize - pendingRiderIds.size;
    if (riders.length < minimumExpectedSize || riders.length > expectedSize) return false;
    const nativeRiderIds = /* @__PURE__ */ new Set();
    for (const rider of riders) {
      if (!rider.isValid || !expectedRiderIds.has(rider.id) && !additionalExpectedRiderIds.has(rider.id) && !persistentExpectedRiderIds.has(rider.id)) return false;
      if (!nativeRiderIds.add(rider.id)) return false;
    }
    for (const riderId of expectedRiderIds) {
      if (!pendingRiderIds.has(riderId) && !nativeRiderIds.has(riderId)) return false;
    }
    for (const riderId of additionalExpectedRiderIds) {
      if (!pendingRiderIds.has(riderId) && !nativeRiderIds.has(riderId)) return false;
    }
    for (const riderId of persistentExpectedRiderIds) {
      if (!pendingRiderIds.has(riderId) && !nativeRiderIds.has(riderId)) return false;
    }
    return true;
  } catch {
    return false;
  }
}
function hasNativeRider(carrier, riderId) {
  if (!carrier.isValid) return false;
  try {
    return carrier.getComponent("minecraft:rideable")?.getRiders().some((rider) => rider.isValid && rider.id === riderId) === true;
  } catch {
    return false;
  }
}
function scheduleRiderMountConfirmation(carrier, rider, pendingRiderIds, isMountCurrent, markIntegrityFailure, kind) {
  const riderId = rider.id;
  const queuedTick = system.currentTick;
  const riderDescription = kind === "persistent" ? "Persistent sub-level entity" : "Sub-level render entity";
  const carrierDescription = kind === "persistent" ? "Persistent sub-level carrier" : "Sub-level render carrier";
  pendingRiderIds.add(riderId);
  const confirm = () => {
    if (!pendingRiderIds.has(riderId)) return;
    if (!isMountCurrent()) {
      pendingRiderIds.delete(riderId);
      return;
    }
    if (hasNativeRider(carrier, riderId)) {
      pendingRiderIds.delete(riderId);
      return;
    }
    if (!carrier.isValid || !rider.isValid) {
      pendingRiderIds.delete(riderId);
      markIntegrityFailure();
      throw new Error(
        `${riderDescription} ${riderId} lost its mount relationship: rider valid=${rider.isValid}, carrier ${carrier.id} valid=${carrier.isValid}.`
      );
    }
    const vehicle = rider.getComponent("minecraft:riding")?.entityRidingOn;
    if (system.currentTick - queuedTick >= RIDER_MOUNT_CONFIRMATION_TIMEOUT_TICKS) {
      pendingRiderIds.delete(riderId);
      markIntegrityFailure();
      throw new Error(
        `${riderDescription} ${riderId} did not mount carrier ${carrier.id} within ${RIDER_MOUNT_CONFIRMATION_TIMEOUT_TICKS} ticks; current vehicle=${vehicle?.id ?? "none"}.`
      );
    }
    if (!vehicle) {
      const rideable = carrier.getComponent("minecraft:rideable");
      if (!rideable) {
        pendingRiderIds.delete(riderId);
        markIntegrityFailure();
        throw new Error(`${carrierDescription} ${carrier.id} lost minecraft:rideable.`);
      }
      rideable.addRider(rider);
    }
    system.run(confirm);
  };
  system.run(confirm);
}
function exceedsWriteThreshold(value, previous, threshold) {
  return !Number.isFinite(previous) || Math.abs(value - previous) >= threshold;
}

// sable/packs/SableBP/scripts/sable/util/SublevelRenderOffsetHelper.js
var DEFAULT_SUBLEVEL_RENDER_ANCHOR_LOCAL = Object.freeze({
  x: 0,
  y: 1,
  z: 0
});
function selectSubLevelRenderAnchor(blocks) {
  return findSubLevelRenderAnchor(blocks) ?? { ...DEFAULT_SUBLEVEL_RENDER_ANCHOR_LOCAL };
}
function findSubLevelRenderAnchor(blocks) {
  let selected;
  let selectedDistance = Number.POSITIVE_INFINITY;
  for (const block of blocks) {
    if (!isStableRenderAnchorBlock(block)) continue;
    const dx = block.localLocation.x - DEFAULT_SUBLEVEL_RENDER_ANCHOR_LOCAL.x;
    const dy = block.localLocation.y - DEFAULT_SUBLEVEL_RENDER_ANCHOR_LOCAL.y;
    const dz = block.localLocation.z - DEFAULT_SUBLEVEL_RENDER_ANCHOR_LOCAL.z;
    const distance = dx * dx + dy * dy + dz * dz;
    if (distance < selectedDistance) {
      selected = block;
      selectedDistance = distance;
    }
  }
  return selected ? { ...selected.localLocation } : void 0;
}
function isStableRenderAnchorBlock(block) {
  return block.collidable !== false && block.collisionResponse !== false && block.runtimeCollidable !== false && block.collisionShape !== "none";
}

// sable/packs/SableBP/scripts/sable/sublevel/render/fancy/model/FancySubLevelModelCodec.js
var FANCY_MODEL_ORIGIN_BIAS = 1024;
var FANCY_MODEL_ORIGIN_SIZE = 2048;
var FANCY_MODEL_POSE_READY_PLACE = FANCY_MODEL_ORIGIN_SIZE;
var FANCY_MODEL_LAYOUT_WIDTH_PLACE = 4096;
var FANCY_MODEL_LAYOUT_DEPTH_PLACE = 131072;
var FANCY_MODEL_LAYOUT_AXIS_SPAN = 32;
function packFancySubLevelOrigin(modelAnchor, renderAnchor, layoutWidth, layoutDepth) {
  const x = modelAnchor.x + DEFAULT_SUBLEVEL_RENDER_ANCHOR_LOCAL.x - renderAnchor.x + FANCY_MODEL_ORIGIN_BIAS;
  const y = modelAnchor.y + DEFAULT_SUBLEVEL_RENDER_ANCHOR_LOCAL.y - renderAnchor.y + FANCY_MODEL_ORIGIN_BIAS;
  const z = modelAnchor.z + DEFAULT_SUBLEVEL_RENDER_ANCHOR_LOCAL.z - renderAnchor.z + FANCY_MODEL_ORIGIN_BIAS;
  if (!Number.isInteger(x) || x < 0 || x >= FANCY_MODEL_ORIGIN_SIZE || !Number.isInteger(y) || y < 0 || y >= FANCY_MODEL_ORIGIN_SIZE || !Number.isInteger(z) || z < 0 || z >= FANCY_MODEL_ORIGIN_SIZE) throw new RangeError("Fancy sub-level model origin exceeds the packed range.");
  if (!Number.isInteger(layoutWidth) || layoutWidth < 1 || layoutWidth > FANCY_MODEL_LAYOUT_AXIS_SPAN || !Number.isInteger(layoutDepth) || layoutDepth < 1 || layoutDepth > FANCY_MODEL_LAYOUT_AXIS_SPAN) throw new RangeError("Fancy sub-level layout footprint exceeds the packed range.");
  return {
    xz: x + z * FANCY_MODEL_ORIGIN_SIZE,
    y: y + (layoutWidth - 1) * FANCY_MODEL_LAYOUT_WIDTH_PLACE + (layoutDepth - 1) * FANCY_MODEL_LAYOUT_DEPTH_PLACE
  };
}
function encodeFancySubLevelOriginY(originY, poseReady) {
  return originY + (poseReady ? FANCY_MODEL_POSE_READY_PLACE : 0);
}
function isFancySubLevelOriginEncodable(location) {
  return location.x >= -FANCY_MODEL_ORIGIN_BIAS && location.x < FANCY_MODEL_ORIGIN_SIZE - FANCY_MODEL_ORIGIN_BIAS && location.y >= -FANCY_MODEL_ORIGIN_BIAS && location.y < FANCY_MODEL_ORIGIN_SIZE - FANCY_MODEL_ORIGIN_BIAS && location.z >= -FANCY_MODEL_ORIGIN_BIAS && location.z < FANCY_MODEL_ORIGIN_SIZE - FANCY_MODEL_ORIGIN_BIAS;
}

// sable/packs/SableBP/scripts/sable/sublevel/render/fancy/model/FancySubLevelModelLayout.js
var FANCY_MODEL_DENSE_SLOT_BUDGET = 245;
var FANCY_MODEL_DENSE_MAX_AXIS = 32;
var FANCY_MODEL_SPARSE_SIZE = 64;
var FANCY_MODEL_SPARSE_SLOT_COUNT = 26;
var FANCY_MODEL_POOL_SLOT_COUNT = 26;
var FANCY_MODEL_PROPERTY_BITS = 24;
var FANCY_MODEL_SPARSE_STATE_SPAN = 64;
var FOLIAGE_DENSE_CANDIDATE = { depth: 7, height: 5, width: 7 };
var DENSE_CANDIDATES = createDenseCandidates();
function createDenseCandidates() {
  const all = [];
  for (let width = 1; width <= FANCY_MODEL_DENSE_MAX_AXIS; width++) {
    for (let depth = 1; depth <= FANCY_MODEL_DENSE_MAX_AXIS; depth++) {
      if (width * depth > FANCY_MODEL_DENSE_SLOT_BUDGET) continue;
      all.push({
        depth,
        height: Math.floor(FANCY_MODEL_DENSE_SLOT_BUDGET / (width * depth)),
        width
      });
    }
  }
  return all.filter((candidate) => !all.some((other) => other !== candidate && other.width >= candidate.width && other.height >= candidate.height && other.depth >= candidate.depth && (other.width > candidate.width || other.height > candidate.height || other.depth > candidate.depth)));
}
function packFancySubLevelModels(blocks) {
  const groups = /* @__PURE__ */ new Map();
  const unsupported = [];
  for (const block of blocks) {
    if (!isPackableBlock(block)) {
      unsupported.push(block);
      continue;
    }
    const group = groups.get(block.model.key);
    if (group) group.push(block);
    else groups.set(block.model.key, [block]);
  }
  const packedGroups = [];
  for (const group of groups.values()) {
    const packs = packModelGroup(group);
    if (!packs) {
      unsupported.push(...group);
      continue;
    }
    packedGroups.push({ blocks: group, packs });
  }
  const models = applyPoolPacking(packedGroups);
  models.sort(comparePackedModels);
  return { models, unsupported };
}
function packModelGroup(group) {
  const model = group[0].model;
  const candidates = model.tint?.method === "foliage" ? [FOLIAGE_DENSE_CANDIDATE] : DENSE_CANDIDATES;
  const sparseOrigin = {
    x: chooseCenteredAxisOrigin(group, "x", FANCY_MODEL_SPARSE_SIZE),
    y: chooseCenteredAxisOrigin(group, "y", FANCY_MODEL_SPARSE_SIZE),
    z: chooseCenteredAxisOrigin(group, "z", FANCY_MODEL_SPARSE_SIZE)
  };
  const sparseBoxes = bucketBlocks(
    group,
    sparseOrigin,
    FANCY_MODEL_SPARSE_SIZE,
    FANCY_MODEL_SPARSE_SIZE,
    FANCY_MODEL_SPARSE_SIZE
  );
  const sparseValid = sparseBoxes.every(([anchor]) => isFancySubLevelOriginEncodable(anchor));
  const sparseBoxKey = /* @__PURE__ */ new Map();
  for (const [anchor, bucket] of sparseBoxes) {
    const key = fancySubLevelBlockKey(anchor);
    for (const entry of bucket) sparseBoxKey.set(entry, key);
  }
  let best;
  for (const candidate of candidates) {
    const origin = {
      x: chooseAxisOrigin(group, "x", candidate.width),
      y: chooseAxisOrigin(group, "y", candidate.height),
      z: chooseAxisOrigin(group, "z", candidate.depth)
    };
    const buckets = [...bucketBlocks(group, origin, candidate.width, candidate.height, candidate.depth)];
    if (buckets.some(([anchor]) => !isFancySubLevelOriginEncodable(anchor))) continue;
    buckets.sort((left, right) => left[1].length - right[1].length || compareAnchors(left[0], right[0]));
    const boxCounts = /* @__PURE__ */ new Map();
    let sparseEntities = 0;
    const maximumEvictions = sparseValid ? buckets.length : 0;
    for (let evicted = 0; evicted <= maximumEvictions; evicted++) {
      const entities = buckets.length - evicted + sparseEntities;
      const capacity = (buckets.length - evicted) * candidate.width * candidate.height * candidate.depth + sparseEntities * FANCY_MODEL_SPARSE_SLOT_COUNT;
      if (!best || entities < best.entities || entities === best.entities && capacity < best.capacity || entities === best.entities && capacity === best.capacity && sparseEntities < best.sparseEntities) {
        best = {
          candidate,
          capacity,
          entities,
          evicted: buckets.slice(0, evicted).flatMap(([, bucket2]) => bucket2),
          kept: buckets.slice(evicted),
          sparseEntities
        };
      }
      const bucket = buckets[evicted];
      if (!bucket) break;
      for (const entry of bucket[1]) {
        const key = sparseBoxKey.get(entry);
        const count = boxCounts.get(key) ?? 0;
        boxCounts.set(key, count + 1);
        sparseEntities += Math.ceil((count + 1) / FANCY_MODEL_SPARSE_SLOT_COUNT) - Math.ceil(count / FANCY_MODEL_SPARSE_SLOT_COUNT);
      }
    }
  }
  if (!best) return void 0;
  const result = [];
  for (const [anchor, bucket] of best.kept) {
    result.push(packDenseBucket(model, best.candidate, anchor, bucket));
  }
  result.push(...packSparseBlocks(model, sparseOrigin, best.evicted));
  return result;
}
function packDenseBucket(model, candidate, anchorLocalLocation, bucket) {
  const storedBits = (model.state?.bits ?? 0) + 1;
  const slotsPerWord = Math.floor(FANCY_MODEL_PROPERTY_BITS / storedBits);
  const slotCount = candidate.width * candidate.height * candidate.depth;
  const words = new Array(Math.ceil(slotCount / slotsPerWord)).fill(0);
  const assignments = [];
  for (const entry of bucket) {
    const x = entry.block.localLocation.x - anchorLocalLocation.x;
    const y = entry.block.localLocation.y - anchorLocalLocation.y;
    const z = entry.block.localLocation.z - anchorLocalLocation.z;
    const slot = y * candidate.width * candidate.depth + z * candidate.width + x;
    const word = Math.floor(slot / slotsPerWord);
    const shift = slot % slotsPerWord * storedBits;
    words[word] = (words[word] ?? 0) | (entry.state + 1) * 2 ** shift;
    assignments.push({
      bitCount: storedBits,
      blockKey: fancySubLevelBlockKey(entry.block.localLocation),
      shift,
      slot,
      state: model.state,
      word
    });
  }
  assignments.sort((left, right) => left.slot - right.slot);
  return {
    anchorLocalLocation: { ...anchorLocalLocation },
    assignments,
    blockCount: bucket.length,
    depth: candidate.depth,
    entityTypeId: model.denseEntityTypeId,
    format: "dense",
    height: candidate.height,
    ...model.tint ? { tint: model.tint } : {},
    width: candidate.width,
    words
  };
}
function packSparseBlocks(model, origin, blocks) {
  const result = [];
  for (const [anchorLocalLocation, bucket] of bucketBlocks(
    blocks,
    origin,
    FANCY_MODEL_SPARSE_SIZE,
    FANCY_MODEL_SPARSE_SIZE,
    FANCY_MODEL_SPARSE_SIZE
  )) {
    bucket.sort(compareBlocks);
    for (let start = 0; start < bucket.length; start += FANCY_MODEL_SPARSE_SLOT_COUNT) {
      const chunk = bucket.slice(start, start + FANCY_MODEL_SPARSE_SLOT_COUNT);
      const words = new Array(FANCY_MODEL_SPARSE_SLOT_COUNT).fill(0);
      const assignments = [];
      for (let slot = 0; slot < chunk.length; slot++) {
        const entry = chunk[slot];
        const x = entry.block.localLocation.x - anchorLocalLocation.x;
        const y = entry.block.localLocation.y - anchorLocalLocation.y;
        const z = entry.block.localLocation.z - anchorLocalLocation.z;
        words[slot] = entry.state + 1 + x * 64 + y * 4096 + z * 262144;
        assignments.push({
          bitCount: 6,
          blockKey: fancySubLevelBlockKey(entry.block.localLocation),
          shift: 0,
          slot,
          state: model.state,
          word: slot
        });
      }
      result.push({
        anchorLocalLocation,
        assignments,
        blockCount: chunk.length,
        depth: FANCY_MODEL_SPARSE_SIZE,
        entityTypeId: model.sparseEntityTypeId,
        format: "sparse",
        height: FANCY_MODEL_SPARSE_SIZE,
        ...model.tint ? { tint: model.tint } : {},
        width: FANCY_MODEL_SPARSE_SIZE,
        words
      });
    }
  }
  return result;
}
function applyPoolPacking(packedGroups) {
  const byPool = /* @__PURE__ */ new Map();
  for (const group of packedGroups) {
    const pool = group.blocks[0].model.pool;
    if (!pool) continue;
    const members = byPool.get(pool.entityTypeId);
    if (members) members.push(group);
    else byPool.set(pool.entityTypeId, [group]);
  }
  for (const members of byPool.values()) {
    if (members.length < 2 && members[0].packs.length < 2) continue;
    members.sort((left, right) => left.packs.length - right.packs.length || left.blocks.length - right.blocks.length || left.blocks[0].model.key.localeCompare(right.blocks[0].model.key));
    const pool = members[0].blocks[0].model.pool;
    let bestPrefix = 0;
    let bestPool = [];
    let bestTotal = members.reduce((sum, member) => sum + member.packs.length, 0);
    const prefixBlocks = [];
    let remainder = bestTotal;
    for (let prefix = 1; prefix <= members.length; prefix++) {
      const member = members[prefix - 1];
      prefixBlocks.push(...member.blocks);
      remainder -= member.packs.length;
      const pooled = packPoolBlocks(pool, prefixBlocks);
      if (!pooled) break;
      const total = pooled.length + remainder;
      if (total < bestTotal) {
        bestPrefix = prefix;
        bestPool = pooled;
        bestTotal = total;
      }
    }
    for (let index = 0; index < bestPrefix; index++) members[index].packs = [];
    if (bestPrefix > 0) members[0].packs = bestPool;
  }
  return packedGroups.flatMap((group) => group.packs);
}
function packPoolBlocks(pool, blocks) {
  const width = 2 ** pool.xBits;
  const height = 2 ** pool.yBits;
  const depth = 2 ** pool.zBits;
  const familyPlace = 2 ** (pool.xBits + pool.yBits + pool.zBits);
  const statePlace = familyPlace * 2 ** pool.familyBits;
  const stateShift = pool.xBits + pool.yBits + pool.zBits + pool.familyBits;
  const occupiedPlace = statePlace * 2 ** pool.stateBits;
  const origin = {
    x: chooseCenteredAxisOrigin(blocks, "x", width),
    y: chooseCenteredAxisOrigin(blocks, "y", height),
    z: chooseCenteredAxisOrigin(blocks, "z", depth)
  };
  const result = [];
  for (const [anchorLocalLocation, bucket] of bucketBlocks(blocks, origin, width, height, depth)) {
    if (!isFancySubLevelOriginEncodable(anchorLocalLocation)) return void 0;
    bucket.sort(compareBlocks);
    for (let start = 0; start < bucket.length; start += FANCY_MODEL_POOL_SLOT_COUNT) {
      const chunk = bucket.slice(start, start + FANCY_MODEL_POOL_SLOT_COUNT);
      const words = new Array(FANCY_MODEL_POOL_SLOT_COUNT).fill(0);
      const assignments = [];
      let foliage = false;
      for (let slot = 0; slot < chunk.length; slot++) {
        const entry = chunk[slot];
        const x = entry.block.localLocation.x - anchorLocalLocation.x;
        const y = entry.block.localLocation.y - anchorLocalLocation.y;
        const z = entry.block.localLocation.z - anchorLocalLocation.z;
        words[slot] = x + y * 2 ** pool.xBits + z * 2 ** (pool.xBits + pool.yBits) + entry.model.pool.family * familyPlace + entry.state * statePlace + occupiedPlace;
        assignments.push({
          bitCount: pool.stateBits,
          blockKey: fancySubLevelBlockKey(entry.block.localLocation),
          shift: stateShift,
          slot,
          state: entry.model.state,
          word: slot
        });
        if (entry.model.tint?.method === "foliage") foliage = true;
      }
      result.push({
        anchorLocalLocation,
        assignments,
        blockCount: chunk.length,
        depth,
        entityTypeId: pool.entityTypeId,
        format: "pool",
        height,
        ...foliage ? { tint: { method: "foliage" } } : {},
        width,
        words
      });
    }
  }
  return result;
}
function isPackableBlock(entry) {
  const { x, y, z } = entry.block.localLocation;
  const maximumState = 2 ** (entry.model.state?.bits ?? 0) - 1;
  return Number.isInteger(x) && Number.isInteger(y) && Number.isInteger(z) && Number.isInteger(entry.state) && entry.state >= 0 && entry.state <= Math.max(0, maximumState) && entry.state + 1 < FANCY_MODEL_SPARSE_STATE_SPAN;
}
function chooseAxisOrigin(blocks, axis, size) {
  const minimum = Math.min(...blocks.map((entry) => entry.block.localLocation[axis]));
  let bestOrigin = minimum;
  let bestCount = Number.POSITIVE_INFINITY;
  for (let shift = 0; shift < size; shift++) {
    const origin = minimum - shift;
    const buckets = /* @__PURE__ */ new Set();
    for (const entry of blocks) {
      buckets.add(Math.floor((entry.block.localLocation[axis] - origin) / size));
    }
    if (buckets.size < bestCount) {
      bestOrigin = origin;
      bestCount = buckets.size;
    }
  }
  return bestOrigin;
}
function chooseCenteredAxisOrigin(blocks, axis, size) {
  const minimum = Math.min(...blocks.map((entry) => entry.block.localLocation[axis]));
  const center = (size - 1) / 2;
  let bestOrigin = minimum;
  let bestCount = Number.POSITIVE_INFINITY;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (let shift = 0; shift < size; shift++) {
    const origin = minimum - shift;
    const buckets = /* @__PURE__ */ new Set();
    let distance = 0;
    for (const entry of blocks) {
      const relative = entry.block.localLocation[axis] - origin;
      const bucket = Math.floor(relative / size);
      buckets.add(bucket);
      distance += (relative - bucket * size - center) ** 2;
    }
    if (buckets.size < bestCount || buckets.size === bestCount && distance < bestDistance) {
      bestOrigin = origin;
      bestCount = buckets.size;
      bestDistance = distance;
    }
  }
  return bestOrigin;
}
function bucketBlocks(blocks, origin, width, height, depth) {
  const buckets = /* @__PURE__ */ new Map();
  for (const entry of blocks) {
    const x = Math.floor((entry.block.localLocation.x - origin.x) / width);
    const y = Math.floor((entry.block.localLocation.y - origin.y) / height);
    const z = Math.floor((entry.block.localLocation.z - origin.z) / depth);
    const key = `${x},${y},${z}`;
    const bucket = buckets.get(key);
    if (bucket) bucket.push(entry);
    else buckets.set(key, [entry]);
  }
  return [...buckets].map(([key, bucket]) => {
    const [x, y, z] = key.split(",").map(Number);
    return [{
      x: origin.x + x * width,
      y: origin.y + y * height,
      z: origin.z + z * depth
    }, bucket];
  });
}
function compareBlocks(left, right) {
  return left.block.localLocation.y - right.block.localLocation.y || left.block.localLocation.z - right.block.localLocation.z || left.block.localLocation.x - right.block.localLocation.x;
}
function compareAnchors(left, right) {
  return left.y - right.y || left.z - right.z || left.x - right.x;
}
function comparePackedModels(left, right) {
  return left.entityTypeId.localeCompare(right.entityTypeId) || left.anchorLocalLocation.y - right.anchorLocalLocation.y || left.anchorLocalLocation.z - right.anchorLocalLocation.z || left.anchorLocalLocation.x - right.anchorLocalLocation.x;
}
function fancySubLevelBlockKey(location) {
  return `${location.x},${location.y},${location.z}`;
}

// sable/packs/SableBP/scripts/sable/sublevel/render/fancy/model/FancySubLevelModelRenderer.js
var FANCY_MODEL_CARRIER_ENTITY_TYPE_ID = "sable:fancy_model_carrier";
var FANCY_MODEL_CARRIER_CAPACITY = CARRIER_SEAT_COUNT - 1;
var FancySubLevelModelRenderer = class {
  #assignments = /* @__PURE__ */ new Map();
  #body;
  #carrierByModelId = /* @__PURE__ */ new Map();
  #carriers = [];
  #foliageTint;
  #models = [];
  #modelByEntityId = /* @__PURE__ */ new Map();
  #onEntityAdded;
  #onEntityRemoved;
  #spawnEntity;
  #initialPoseDeferred = true;
  #knownIntegrityFailure = false;
  #lastAnchorX = Number.NaN;
  #lastAnchorY = Number.NaN;
  #lastAnchorZ = Number.NaN;
  #poseReady = false;
  #renderAnchor;
  #renderAnchorRevision = 0;
  #renderRotation;
  #sleepingAtLastSync = false;
  #publishedRenderRotation = {
    x: Number.NaN,
    y: Number.NaN,
    z: Number.NaN
  };
  supportsBlockAddition = true;
  emitsEntityAddedCallbacks = true;
  constructor(body, models, spawnEntity, foliageTint, onEntityRemoved, renderAnchor, onEntityAdded) {
    this.#body = body;
    this.#foliageTint = foliageTint;
    this.#onEntityAdded = onEntityAdded;
    this.#onEntityRemoved = onEntityRemoved;
    this.#spawnEntity = spawnEntity;
    this.#renderAnchor = { ...renderAnchor };
    try {
      this.#appendModels(models);
    } catch (error) {
      this.remove();
      throw error;
    }
  }
  get initialPoseDeferred() {
    return this.#initialPoseDeferred;
  }
  get renderRotation() {
    return this.#publishedRenderRotation;
  }
  get renderAnchorLocal() {
    return { ...this.#renderAnchor };
  }
  get entityCount() {
    return this.#models.filter((model) => model.entity.isValid).length + this.#carriers.filter((carrier) => carrier.entity.isValid).length;
  }
  get entityIds() {
    return [
      ...this.#models.filter((model) => model.entity.isValid).map((model) => model.entity.id),
      ...this.#carriers.filter((carrier) => carrier.entity.isValid).map((carrier) => carrier.entity.id)
    ];
  }
  get entityLocations() {
    return validEntityLocations([
      ...this.#models.map((model) => model.entity),
      ...this.#carriers.map((carrier) => carrier.entity)
    ]);
  }
  get firstEntityLocation() {
    return this.entityLocations[0];
  }
  hasEntity(entityId) {
    return this.#modelByEntityId.get(entityId)?.entity.isValid === true || this.#carriers.some((carrier) => carrier.entity.id === entityId && carrier.entity.isValid);
  }
  hasKnownIntegrityFailure() {
    return this.#knownIntegrityFailure;
  }
  hasIntactEntities() {
    if (this.#knownIntegrityFailure || this.#models.length === 0 || this.#carriers.length === 0) {
      return false;
    }
    if (this.#models.some((model) => !model.entity.isValid)) return false;
    for (const carrier of this.#carriers) {
      const intact = carrier.pendingRiderIds.size > 0 ? hasRidersConsistentWithPendingMounts(
        carrier.entity,
        carrier.modelIds,
        carrier.auxiliaryRiderIds,
        carrier.persistentRiderIds,
        carrier.pendingRiderIds
      ) : hasExactRiders(
        carrier.entity,
        carrier.modelIds,
        carrier.auxiliaryRiderIds,
        carrier.persistentRiderIds
      );
      if (!intact) return false;
    }
    return true;
  }
  releaseInitialPose() {
    if (!this.#initialPoseDeferred) return;
    this.#setPoseReady(true);
    this.#initialPoseDeferred = false;
  }
  setBlockModelState(blockKey3, dimension, value) {
    const live = this.#assignments.get(blockKey3);
    if (!live || !live.assignment.state || !live.model.entity.isValid) return false;
    const current = readStoredState(live.model, live.assignment) - 1;
    const next = live.assignment.state.update(current, dimension, value);
    if (next === void 0) return false;
    if (next === current) return true;
    writeStoredState(live.model, live.assignment, next + 1);
    live.model.entity.setProperty(
      `sable:s${live.assignment.word}`,
      live.model.words[live.assignment.word] ?? 0
    );
    return true;
  }
  attachAuxiliaryRider(entity) {
    if (!entity.isValid || this.#carriers.length === 0) return false;
    const carrier = this.#carriers.find((value) => !value.dedicatedToPersistentRiders);
    if (!carrier || !carrier.entity.isValid || carrier.auxiliaryRiderIds.size > 0 || carrier.modelIds.size >= FANCY_MODEL_CARRIER_CAPACITY) return false;
    if (!carrier.entity.getComponent("minecraft:rideable")?.addRider(entity)) return false;
    carrier.auxiliaryRiderIds.add(entity.id);
    this.#syncAuxiliaryRotation(entity);
    return true;
  }
  attachPersistentRider(entity) {
    if (!entity.isValid) return false;
    let carrier = this.#carriers.find((value) => value.dedicatedToPersistentRiders && value.entity.isValid && value.persistentRiderIds.size < FANCY_MODEL_CARRIER_CAPACITY);
    carrier ??= this.#createCarrier(true);
    ejectCurrentVehicle(entity);
    if (!carrier.entity.getComponent("minecraft:rideable")?.addRider(entity)) return false;
    carrier.persistentRiders.set(entity.id, entity);
    carrier.persistentRiderIds.add(entity.id);
    scheduleRiderMountConfirmation(
      carrier.entity,
      entity,
      carrier.pendingRiderIds,
      () => this.#body.isValid && carrier.persistentRiderIds.has(entity.id),
      () => {
        this.#knownIntegrityFailure = true;
      },
      "persistent"
    );
    return true;
  }
  detachAuxiliaryRider(entity) {
    const carrier = this.#carriers.find((value) => value.auxiliaryRiderIds.has(entity.id));
    if (!carrier) return;
    carrier.auxiliaryRiderIds.delete(entity.id);
    if (carrier.entity.isValid && entity.isValid) {
      carrier.entity.getComponent("minecraft:rideable")?.ejectRider(entity);
    }
    this.#removeEmptyCarrier(carrier);
  }
  detachPersistentRider(entity, preserveEmptyCarrier = false) {
    const carrier = this.#carriers.find((value) => value.persistentRiderIds.has(entity.id));
    if (!carrier) return;
    if (carrier.entity.isValid && entity.isValid) {
      carrier.entity.getComponent("minecraft:rideable")?.ejectRider(entity);
    }
    carrier.pendingRiderIds.delete(entity.id);
    carrier.persistentRiders.delete(entity.id);
    carrier.persistentRiderIds.delete(entity.id);
    if (!preserveEmptyCarrier) this.#removeEmptyCarrier(carrier, true);
  }
  removeEmptyPersistentRiderCarriers() {
    for (const carrier of [...this.#carriers]) {
      if (carrier.dedicatedToPersistentRiders && carrier.persistentRiderIds.size === 0) {
        this.#removeEmptyCarrier(carrier, true);
      }
    }
  }
  transferPersistentRidersTo(target) {
    const persistentRiders = this.#carriers.flatMap((carrier) => [...carrier.persistentRiders.values()].filter((rider) => rider.isValid));
    if (persistentRiders.length === 0) return;
    for (const rider of persistentRiders) ejectCurrentVehicle(rider);
    this.remove();
    for (const rider of persistentRiders) {
      if (!target.attachPersistentRider?.(rider)) {
        throw new Error(`Could not reattach persistent sub-level entity ${rider.id}.`);
      }
    }
  }
  removeBlocks(blockKeys) {
    const changed = /* @__PURE__ */ new Map();
    const empty = /* @__PURE__ */ new Set();
    for (const key of blockKeys) {
      const live = this.#assignments.get(key);
      if (!live) continue;
      this.#assignments.delete(key);
      writeStoredState(live.model, live.assignment, 0);
      live.model.blockCount--;
      let words = changed.get(live.model);
      if (!words) {
        words = /* @__PURE__ */ new Set();
        changed.set(live.model, words);
      }
      words.add(live.assignment.word);
      if (live.model.blockCount === 0) empty.add(live.model);
    }
    for (const [model, words] of changed) {
      if (empty.has(model) || !model.entity.isValid) continue;
      for (const word of words) {
        model.entity.setProperty(`sable:s${word}`, model.words[word] ?? 0);
      }
    }
    for (const model of empty) this.#removeModel(model);
  }
  addBlocks(blocks) {
    const resolved = blocks.map(resolveFancySubLevelBlock);
    if (resolved.some((entry) => entry === void 0)) {
      throw new Error("Fancy model renderer received an unregistered block.");
    }
    const packed = packFancySubLevelModels(resolved);
    if (packed.unsupported.length > 0) {
      throw new Error("Fancy model renderer received an unencodable block.");
    }
    const added = this.#appendModels(packed.models);
    this.sync(true);
    if (!this.#poseReady) return;
    system2.run(() => {
      if (!this.#body.isValid) return;
      for (const model of added) {
        if (this.#modelByEntityId.get(model.entity.id) === model) {
          this.#setModelPoseReady(model, true);
        }
      }
    });
  }
  rebaseRenderAnchor(blocks) {
    const nextAnchor = findSubLevelRenderAnchor(blocks);
    if (!nextAnchor || vectorsEqual(nextAnchor, this.#renderAnchor)) return;
    const resolved = blocks.map(resolveFancySubLevelBlock);
    if (resolved.some((entry) => entry === void 0)) {
      throw new Error("Fancy sub-level cannot change route during an in-place edit.");
    }
    const packed = packFancySubLevelModels(resolved);
    if (packed.unsupported.length > 0) {
      throw new Error("Fancy sub-level cannot encode the rebased model set.");
    }
    const revision = ++this.#renderAnchorRevision;
    const persistentRiders = this.#carriers.flatMap((carrier) => [...carrier.persistentRiders.values()].filter((rider) => rider.isValid));
    for (const rider of persistentRiders) ejectCurrentVehicle(rider);
    this.remove();
    this.#resetPoseState(nextAnchor);
    this.#appendModels(packed.models);
    for (const rider of persistentRiders) {
      if (!this.attachPersistentRider(rider)) {
        throw new Error(`Could not reattach persistent sub-level entity ${rider.id}.`);
      }
    }
    this.sync(true);
    system2.run(() => {
      if (revision !== this.#renderAnchorRevision || !this.#body.isValid) return;
      this.sync(true);
      this.releaseInitialPose();
    });
  }
  remove() {
    for (const model of [...this.#models]) this.#removeModel(model);
    for (const carrier of [...this.#carriers]) {
      carrier.pendingRiderIds.clear();
      for (const rider of nativeRiders(carrier.entity)) {
        if (carrier.auxiliaryRiderIds.has(rider.id) && rider.isValid) rider.remove();
        else if (carrier.persistentRiderIds.has(rider.id) && rider.isValid) {
          carrier.entity.getComponent("minecraft:rideable")?.ejectRider(rider);
        }
      }
      this.#onEntityRemoved?.(carrier.entity.id);
      if (carrier.entity.isValid) carrier.entity.remove();
    }
    this.#carriers.length = 0;
    this.#carrierByModelId.clear();
    this.#assignments.clear();
  }
  sync(force = false) {
    if (!this.#body.isValid) return 0;
    const sleeping = this.#body.isSleeping === true;
    if (!force && sleeping && this.#sleepingAtLastSync) return 0;
    this.#sleepingAtLastSync = sleeping;
    const rotation = getContinuousRenderRotation(this.#body, this.#renderRotation);
    this.#renderRotation = rotation;
    const anchor = this.#body.localPointToWorld(this.#renderAnchor);
    const positionChanged = force || exceedsWriteThreshold(anchor.x, this.#lastAnchorX, RENDER_POSITION_WRITE_THRESHOLD) || exceedsWriteThreshold(anchor.y, this.#lastAnchorY, RENDER_POSITION_WRITE_THRESHOLD) || exceedsWriteThreshold(anchor.z, this.#lastAnchorZ, RENDER_POSITION_WRITE_THRESHOLD);
    const pitchChanged = force || exceedsWriteThreshold(
      rotation.x,
      this.#publishedRenderRotation.x,
      RENDER_ROTATION_WRITE_THRESHOLD_DEGREES
    );
    const yawChanged = force || exceedsWriteThreshold(
      rotation.y,
      this.#publishedRenderRotation.y,
      RENDER_ROTATION_WRITE_THRESHOLD_DEGREES
    );
    const rollChanged = force || exceedsWriteThreshold(
      rotation.z,
      this.#publishedRenderRotation.z,
      RENDER_ROTATION_WRITE_THRESHOLD_DEGREES
    );
    if (!positionChanged && !pitchChanged && !yawChanged && !rollChanged) return 0;
    if (positionChanged) {
      this.#lastAnchorX = anchor.x;
      this.#lastAnchorY = anchor.y;
      this.#lastAnchorZ = anchor.z;
    }
    if (pitchChanged) this.#publishedRenderRotation.x = rotation.x;
    if (yawChanged) this.#publishedRenderRotation.y = rotation.y;
    if (rollChanged) this.#publishedRenderRotation.z = rotation.z;
    let writes = 0;
    if (positionChanged) {
      for (const carrier of this.#carriers) {
        if (!carrier.entity.isValid) {
          this.#knownIntegrityFailure = true;
          continue;
        }
        carrier.entity.teleport(anchor);
        writes++;
      }
    }
    for (const model of this.#models) {
      if (!model.entity.isValid) {
        this.#knownIntegrityFailure = true;
        continue;
      }
      if (pitchChanged) model.entity.setProperty("sable:pitch", rotation.x);
      if (yawChanged) model.entity.setProperty("sable:yaw", rotation.y);
      if (rollChanged) model.entity.setProperty("sable:roll", rotation.z);
      if (pitchChanged || yawChanged || rollChanged) writes++;
    }
    if (pitchChanged || yawChanged || rollChanged) {
      for (const carrier of this.#carriers) {
        for (const rider of nativeRiders(carrier.entity)) {
          if (!carrier.auxiliaryRiderIds.has(rider.id)) continue;
          this.#syncAuxiliaryRotation(rider, rotation);
          writes++;
        }
      }
    }
    return writes;
  }
  #appendModels(models) {
    const added = [];
    try {
      for (const packed of models) {
        const carrier = this.#availableCarrier() ?? this.#createCarrier(false);
        const rideable = carrier.entity.getComponent("minecraft:rideable");
        if (!rideable) throw new Error("Fancy model carrier lost minecraft:rideable.");
        const origin = packFancySubLevelOrigin(
          packed.anchorLocalLocation,
          this.#renderAnchor,
          packed.format === "dense" ? packed.width : 1,
          packed.format === "dense" ? packed.depth : 1
        );
        const entity = this.#spawnEntity(
          packed.entityTypeId,
          this.#body.localPointToWorld(this.#renderAnchor)
        );
        try {
          initializeModelProperties(entity, packed, this.#foliageTint, origin);
          if (!rideable.addRider(entity)) {
            throw new Error(`Could not mount fancy model ${entity.id} on carrier ${carrier.entity.id}.`);
          }
        } catch (error) {
          if (entity.isValid) entity.remove();
          throw error;
        }
        const live = {
          anchorLocalLocation: { ...packed.anchorLocalLocation },
          blockCount: packed.blockCount,
          entity,
          format: packed.format,
          originY: origin.y,
          words: [...packed.words]
        };
        this.#models.push(live);
        this.#modelByEntityId.set(entity.id, live);
        carrier.modelIds.add(entity.id);
        this.#carrierByModelId.set(entity.id, carrier);
        scheduleRiderMountConfirmation(
          carrier.entity,
          entity,
          carrier.pendingRiderIds,
          () => this.#body.isValid && carrier.modelIds.has(entity.id),
          () => {
            this.#knownIntegrityFailure = true;
          },
          "render"
        );
        this.#onEntityAdded?.(entity.id);
        for (const assignment of packed.assignments) {
          this.#assignments.set(assignment.blockKey, { assignment, model: live });
        }
        added.push(live);
      }
      return added;
    } catch (error) {
      for (const model of [...added].reverse()) this.#removeModel(model);
      throw error;
    }
  }
  #availableCarrier() {
    return this.#carriers.find((carrier) => !carrier.dedicatedToPersistentRiders && carrier.entity.isValid && carrier.modelIds.size + carrier.auxiliaryRiderIds.size < FANCY_MODEL_CARRIER_CAPACITY);
  }
  #createCarrier(dedicatedToPersistentRiders) {
    const entity = this.#spawnEntity(
      FANCY_MODEL_CARRIER_ENTITY_TYPE_ID,
      this.#body.localPointToWorld(this.#renderAnchor)
    );
    if (!entity.getComponent("minecraft:rideable")) {
      if (entity.isValid) entity.remove();
      throw new Error("Fancy model carrier does not expose minecraft:rideable.");
    }
    const carrier = {
      auxiliaryRiderIds: /* @__PURE__ */ new Set(),
      dedicatedToPersistentRiders,
      entity,
      modelIds: /* @__PURE__ */ new Set(),
      pendingRiderIds: /* @__PURE__ */ new Set(),
      persistentRiders: /* @__PURE__ */ new Map(),
      persistentRiderIds: /* @__PURE__ */ new Set()
    };
    this.#carriers.push(carrier);
    this.#onEntityAdded?.(entity.id);
    return carrier;
  }
  #setPoseReady(ready) {
    if (ready === this.#poseReady) return;
    for (const model of this.#models) this.#setModelPoseReady(model, ready);
    this.#poseReady = ready;
  }
  #setModelPoseReady(model, ready) {
    if (!model.entity.isValid) {
      this.#knownIntegrityFailure = true;
      return;
    }
    model.entity.setProperty(
      "sable:origin_y",
      encodeFancySubLevelOriginY(model.originY, ready)
    );
  }
  #syncAuxiliaryRotation(entity, rotation = this.#renderRotation) {
    if (!entity.isValid || !rotation) return;
    entity.setProperty("sable:pitch", rotation.x);
    entity.setProperty("sable:yaw", rotation.y);
    entity.setProperty("sable:roll", rotation.z);
  }
  #removeModel(model) {
    const index = this.#models.indexOf(model);
    if (index >= 0) this.#models.splice(index, 1);
    this.#modelByEntityId.delete(model.entity.id);
    for (const [key, assignment] of this.#assignments) {
      if (assignment.model === model) this.#assignments.delete(key);
    }
    const carrier = this.#carrierByModelId.get(model.entity.id);
    this.#carrierByModelId.delete(model.entity.id);
    if (carrier) {
      carrier.pendingRiderIds.delete(model.entity.id);
      carrier.modelIds.delete(model.entity.id);
      this.#removeEmptyCarrier(carrier);
    }
    this.#onEntityRemoved?.(model.entity.id);
    if (model.entity.isValid) model.entity.remove();
  }
  #removeEmptyCarrier(carrier, removeDedicated = false) {
    if (carrier.modelIds.size > 0 || carrier.auxiliaryRiderIds.size > 0 || carrier.persistentRiderIds.size > 0 || carrier.dedicatedToPersistentRiders && !removeDedicated) return;
    const index = this.#carriers.indexOf(carrier);
    if (index >= 0) this.#carriers.splice(index, 1);
    this.#onEntityRemoved?.(carrier.entity.id);
    if (carrier.entity.isValid) carrier.entity.remove();
  }
  #resetPoseState(renderAnchor) {
    this.#renderAnchor = { ...renderAnchor };
    this.#initialPoseDeferred = true;
    this.#knownIntegrityFailure = false;
    this.#poseReady = false;
    this.#sleepingAtLastSync = false;
    this.#renderRotation = void 0;
    this.#lastAnchorX = Number.NaN;
    this.#lastAnchorY = Number.NaN;
    this.#lastAnchorZ = Number.NaN;
    this.#publishedRenderRotation.x = Number.NaN;
    this.#publishedRenderRotation.y = Number.NaN;
    this.#publishedRenderRotation.z = Number.NaN;
  }
};
function initializeModelProperties(entity, packed, foliageTint, origin) {
  entity.setProperty("sable:origin_xz", origin.xz);
  entity.setProperty("sable:origin_y", encodeFancySubLevelOriginY(origin.y, false));
  if (packed.tint) {
    entity.setProperty("sable:tint", packFancySubLevelTint(packed, foliageTint));
  }
  for (let index = 0; index < packed.words.length; index++) {
    const word = packed.words[index] ?? 0;
    if (word !== 0) entity.setProperty(`sable:s${index}`, word);
  }
}
function readStoredState(model, assignment) {
  const word = model.words[assignment.word] ?? 0;
  if (model.format === "sparse") return word % 64;
  if (model.format === "pool") {
    if (word === 0) return 0;
    return Math.floor(word / 2 ** assignment.shift) % 2 ** assignment.bitCount + 1;
  }
  return Math.floor(word / 2 ** assignment.shift) % 2 ** assignment.bitCount;
}
function writeStoredState(model, assignment, storedState) {
  if (model.format === "pool") {
    if (storedState === 0) {
      model.words[assignment.word] = 0;
      return;
    }
    const currentField = Math.floor((model.words[assignment.word] ?? 0) / 2 ** assignment.shift) % 2 ** assignment.bitCount;
    model.words[assignment.word] = (model.words[assignment.word] ?? 0) + (storedState - 1 - currentField) * 2 ** assignment.shift;
    return;
  }
  const current = readStoredState(model, assignment);
  if (model.format === "sparse") {
    model.words[assignment.word] = (model.words[assignment.word] ?? 0) + storedState - current;
    return;
  }
  model.words[assignment.word] = (model.words[assignment.word] ?? 0) + (storedState - current) * 2 ** assignment.shift;
}
function vectorsEqual(left, right) {
  return left.x === right.x && left.y === right.y && left.z === right.z;
}

// sable/packs/SableBP/scripts/sable/sublevel/render/dispatcher/VanillaSubLevelRenderDispatcher.js
import { ItemTypes } from "@minecraft/server";

// sable/packs/SableBP/scripts/sable/sublevel/render/vanilla/VanillaChunkedSubLevelRenderData.js
var EMPTY_RIDER_IDS = /* @__PURE__ */ new Set();
var VanillaChunkedSubLevelRenderData = class {
  #assignments = /* @__PURE__ */ new Map();
  #carriers = [];
  #carrierByBlockEntityId = /* @__PURE__ */ new Map();
  #body;
  #rendersByEntityId = /* @__PURE__ */ new Map();
  #onEntityRemoved;
  #renderAnchor;
  #lastRenderX = Number.NaN;
  #lastRenderY = Number.NaN;
  #lastRenderZ = Number.NaN;
  #initialPoseDeferred = true;
  #knownIntegrityFailure = false;
  #sleepingAtLastSync = false;
  #renderRotation;
  #publishedRenderRotation = {
    x: Number.NaN,
    y: Number.NaN,
    z: Number.NaN
  };
  get initialPoseDeferred() {
    return this.#initialPoseDeferred;
  }
  get renderRotation() {
    return this.#publishedRenderRotation;
  }
  get renderAnchorLocal() {
    return { ...this.#renderAnchor };
  }
  constructor(body, assignments, carriers, onEntityRemoved, renderAnchor = selectSubLevelRenderAnchor(
    assignments.map((assignment) => assignment.block)
  )) {
    this.#body = body;
    this.#onEntityRemoved = onEntityRemoved;
    this.#renderAnchor = { ...renderAnchor };
    for (const carrier of carriers) {
      const liveCarrier = {
        entity: carrier.entity,
        pendingRiderIds: /* @__PURE__ */ new Set(),
        riderIds: new Set(carrier.riderIds)
      };
      this.#carriers.push(liveCarrier);
      for (const riderId of liveCarrier.riderIds) {
        this.#carrierByBlockEntityId.set(riderId, liveCarrier);
      }
    }
    for (const assignment of assignments) {
      const key = blockKey(assignment.block.localLocation);
      let render = this.#rendersByEntityId.get(assignment.entity.id);
      if (!render) {
        render = { blockKeys: /* @__PURE__ */ new Set(), entity: assignment.entity };
        this.#rendersByEntityId.set(assignment.entity.id, render);
      }
      render.blockKeys.add(key);
      this.#assignments.set(key, {
        entity: assignment.entity,
        slot: assignment.slot,
        render
      });
    }
    for (const carrier of this.#carriers) {
      for (const riderId of carrier.riderIds) {
        const rider = this.#rendersByEntityId.get(riderId)?.entity;
        if (!rider) {
          throw new Error(
            `Block carrier ${carrier.entity.id} references unknown render ${riderId}.`
          );
        }
        scheduleRiderMountConfirmation(
          carrier.entity,
          rider,
          carrier.pendingRiderIds,
          () => this.#body.isValid && carrier.riderIds.has(riderId),
          () => {
            this.#knownIntegrityFailure = true;
          },
          "render"
        );
      }
    }
  }
  get entityCount() {
    return [...this.#rendersByEntityId.values()].filter((render) => render.entity.isValid).length + this.#carriers.filter((carrier) => carrier.entity.isValid).length;
  }
  get entityIds() {
    return [
      ...[...this.#rendersByEntityId.keys()].filter((entityId) => this.hasEntity(entityId)),
      ...this.#carriers.filter((carrier) => carrier.entity.isValid).map((carrier) => carrier.entity.id)
    ];
  }
  get entityLocations() {
    return validEntityLocations([
      ...[...this.#rendersByEntityId.values()].map((render) => render.entity),
      ...this.#carriers.map((carrier) => carrier.entity)
    ]);
  }
  get firstEntityLocation() {
    return this.entityLocations[0];
  }
  hasEntity(entityId) {
    if (this.#rendersByEntityId.get(entityId)?.entity.isValid === true) return true;
    return this.#carriers.some(
      (carrier) => carrier.entity.id === entityId && carrier.entity.isValid
    );
  }
  hasIntactEntities() {
    if (this.#knownIntegrityFailure) return false;
    const hasBlockRenders = this.#assignments.size > 0;
    if (hasBlockRenders !== this.#rendersByEntityId.size > 0) return false;
    if (!hasBlockRenders) return false;
    if (this.#carriers.length === 0) return false;
    let assignedBlockCount = 0;
    for (const render of this.#rendersByEntityId.values()) {
      if (!render.entity.isValid || render.blockKeys.size === 0) return false;
      assignedBlockCount += render.blockKeys.size;
    }
    if (assignedBlockCount !== this.#assignments.size) return false;
    for (const carrier of this.#carriers) {
      const intact = carrier.pendingRiderIds.size > 0 ? hasRidersConsistentWithPendingMounts(
        carrier.entity,
        carrier.riderIds,
        EMPTY_RIDER_IDS,
        EMPTY_RIDER_IDS,
        carrier.pendingRiderIds
      ) : hasExactRiders(
        carrier.entity,
        carrier.riderIds,
        EMPTY_RIDER_IDS,
        EMPTY_RIDER_IDS
      );
      if (!intact) return false;
    }
    return true;
  }
  hasKnownIntegrityFailure() {
    return this.#knownIntegrityFailure;
  }
  releaseInitialPose() {
    if (!this.#initialPoseDeferred) return;
    for (const render of this.#rendersByEntityId.values()) {
      if (!render.entity.isValid) {
        this.#knownIntegrityFailure = true;
        continue;
      }
      render.entity.setProperty("sable:scale", 1);
    }
    this.#initialPoseDeferred = false;
  }
  removeBlocks(blockKeys) {
    for (const key of blockKeys) {
      const assignment = this.#assignments.get(key);
      if (!assignment) continue;
      const { entity, slot, render } = assignment;
      if (render.blockKeys.size > 1 && entity.isValid) {
        entity.runCommand(`replaceitem entity @s slot.weapon.${slot} 0 minecraft:air`);
      }
      this.#assignments.delete(key);
      render.blockKeys.delete(key);
      if (render.blockKeys.size > 0) continue;
      this.#rendersByEntityId.delete(entity.id);
      this.#onEntityRemoved?.(entity.id);
      if (entity.isValid) entity.remove();
      const carrier = this.#carrierByBlockEntityId.get(entity.id);
      this.#carrierByBlockEntityId.delete(entity.id);
      if (!carrier) continue;
      carrier.pendingRiderIds.delete(entity.id);
      carrier.riderIds.delete(entity.id);
      this.#removeEmptyCarrier(carrier);
    }
  }
  remove() {
    for (const render of this.#rendersByEntityId.values()) {
      this.#onEntityRemoved?.(render.entity.id);
      if (render.entity.isValid) render.entity.remove();
    }
    for (const carrier of this.#carriers) {
      carrier.pendingRiderIds.clear();
      this.#onEntityRemoved?.(carrier.entity.id);
      if (carrier.entity.isValid) carrier.entity.remove();
    }
    this.#assignments.clear();
    this.#rendersByEntityId.clear();
    this.#carriers.length = 0;
    this.#carrierByBlockEntityId.clear();
  }
  sync(force = false) {
    let writes = 0;
    if (!this.#body.isValid) return writes;
    const sleeping = this.#body.isSleeping === true;
    if (!force && sleeping && this.#sleepingAtLastSync) return writes;
    this.#sleepingAtLastSync = sleeping;
    const rotation = getContinuousRenderRotation(this.#body, this.#renderRotation);
    this.#renderRotation = rotation;
    const renderAnchor = this.#body.localPointToWorld(this.#renderAnchor);
    const positionChanged = force || exceedsWriteThreshold(
      renderAnchor.x,
      this.#lastRenderX,
      RENDER_POSITION_WRITE_THRESHOLD
    ) || exceedsWriteThreshold(
      renderAnchor.y,
      this.#lastRenderY,
      RENDER_POSITION_WRITE_THRESHOLD
    ) || exceedsWriteThreshold(
      renderAnchor.z,
      this.#lastRenderZ,
      RENDER_POSITION_WRITE_THRESHOLD
    );
    const pitchChanged = force || exceedsWriteThreshold(
      rotation.x,
      this.#publishedRenderRotation.x,
      RENDER_ROTATION_WRITE_THRESHOLD_DEGREES
    );
    const yawChanged = force || exceedsWriteThreshold(
      rotation.y,
      this.#publishedRenderRotation.y,
      RENDER_ROTATION_WRITE_THRESHOLD_DEGREES
    );
    const rollChanged = force || exceedsWriteThreshold(
      rotation.z,
      this.#publishedRenderRotation.z,
      RENDER_ROTATION_WRITE_THRESHOLD_DEGREES
    );
    if (!positionChanged && !pitchChanged && !yawChanged && !rollChanged) return writes;
    if (positionChanged) {
      this.#lastRenderX = renderAnchor.x;
      this.#lastRenderY = renderAnchor.y;
      this.#lastRenderZ = renderAnchor.z;
    }
    if (pitchChanged) this.#publishedRenderRotation.x = rotation.x;
    if (yawChanged) this.#publishedRenderRotation.y = rotation.y;
    if (rollChanged) this.#publishedRenderRotation.z = rotation.z;
    if (positionChanged) {
      for (const carrier of this.#carriers) {
        if (!carrier.entity.isValid) {
          this.#knownIntegrityFailure = true;
          continue;
        }
        carrier.entity.teleport(renderAnchor);
        writes++;
      }
    }
    for (const render of this.#rendersByEntityId.values()) {
      const entity = render.entity;
      if (!entity.isValid) {
        this.#knownIntegrityFailure = true;
        continue;
      }
      if (pitchChanged) entity.setProperty("sable:pitch", rotation.x);
      if (yawChanged) entity.setProperty("sable:yaw", rotation.y);
      if (rollChanged) entity.setProperty("sable:roll", rotation.z);
      if (pitchChanged || yawChanged || rollChanged) writes++;
    }
    return writes;
  }
  #removeEmptyCarrier(carrier) {
    if (carrier.riderIds.size > 0) return;
    const carrierIndex = this.#carriers.indexOf(carrier);
    if (carrierIndex >= 0) this.#carriers.splice(carrierIndex, 1);
    this.#onEntityRemoved?.(carrier.entity.id);
    if (carrier.entity.isValid) carrier.entity.remove();
  }
};
function blockKey(location) {
  return `${location.x},${location.y},${location.z}`;
}

// sable/packs/SableBP/scripts/sable/sublevel/render/vanilla/SingleBlockSubLevelWrapper.js
var DEFAULT_RENDER_ENTITY_TYPE_ID = "sable:block";
var BLOCK_OFFHAND_ITEM_OFFSET_PROPERTY = "sable:left_item_offset";
var ADDON_BLOCK_OFFHAND_ITEM_OFFSET = 0;
var MINECRAFT_BLOCK_OFFHAND_ITEM_OFFSET = 2;
function createBlockRenderPair(dimension, body, renderAnchor, mainhandBlock, offhandBlock, renderEntityTags) {
  const entity = spawnTaggedRenderEntity(
    dimension,
    DEFAULT_RENDER_ENTITY_TYPE_ID,
    body.localPointToWorld(renderAnchor),
    renderEntityTags
  );
  try {
    entity.runCommand(
      `replaceitem entity @s slot.weapon.mainhand 0 ${mainhandBlock.itemTypeId ?? mainhandBlock.typeId}`
    );
    if (offhandBlock) {
      entity.runCommand(
        `replaceitem entity @s slot.weapon.offhand 0 ${offhandBlock.itemTypeId ?? offhandBlock.typeId}`
      );
    }
    setBlockRenderTransform(entity, mainhandBlock, renderAnchor, "");
    if (offhandBlock) setBlockRenderTransform(entity, offhandBlock, renderAnchor, "left_");
    return entity;
  } catch (error) {
    if (entity.isValid) entity.remove();
    throw error;
  }
}
function spawnTaggedRenderEntity(dimension, typeId, location, tags) {
  const entity = dimension.spawnEntity(typeId, location);
  try {
    for (const tag of tags) {
      if (!entity.addTag(tag)) {
        throw new Error(`Could not assign render entity tag ${tag}.`);
      }
    }
    return entity;
  } catch (error) {
    if (entity.isValid) entity.remove();
    throw error;
  }
}
function setBlockRenderTransform(entity, block, renderAnchor, prefix) {
  entity.setProperty(
    `sable:${prefix}local_x`,
    block.localLocation.x - renderAnchor.x
  );
  entity.setProperty(
    `sable:${prefix}local_y`,
    block.localLocation.y - renderAnchor.y
  );
  entity.setProperty(
    `sable:${prefix}local_z`,
    block.localLocation.z - renderAnchor.z
  );
  entity.setProperty(`sable:${prefix}local_pitch`, block.rotation?.x ?? 0);
  entity.setProperty(`sable:${prefix}local_yaw`, block.rotation?.y ?? 0);
  entity.setProperty(`sable:${prefix}local_roll`, block.rotation?.z ?? 0);
  if (prefix === "left_") {
    entity.setProperty(
      BLOCK_OFFHAND_ITEM_OFFSET_PROPERTY,
      block.typeId.startsWith("minecraft:") ? MINECRAFT_BLOCK_OFFHAND_ITEM_OFFSET : ADDON_BLOCK_OFFHAND_ITEM_OFFSET
    );
  }
}

// sable/packs/SableBP/scripts/sable/sublevel/render/dispatcher/VanillaSubLevelRenderDispatcher.js
var VanillaSubLevelRenderDispatcher = class {
  createRenderData(subLevel) {
    return this.createRenderDataAtAnchor(
      subLevel,
      selectSubLevelRenderAnchor(subLevel.blocks)
    );
  }
  createRenderDataAtAnchor(subLevel, renderAnchor) {
    const blocks = subLevel.blocks;
    const tags = normalizeRenderEntityTags(subLevel.renderEntityTags);
    assertBlockRenderItems(blocks);
    const entities = [];
    const assignments = [];
    const carriers = [];
    try {
      const renderEntityCount = Math.ceil(blocks.length / BLOCK_SLOTS_PER_ENTITY);
      for (let start = 0; start < renderEntityCount; start += BLOCK_CARRIER_CAPACITY) {
        const carrierEntity = spawnTaggedRenderEntity(
          subLevel.dimension,
          BLOCK_CARRIER_ENTITY_TYPE_ID,
          subLevel.body.localPointToWorld(renderAnchor),
          tags
        );
        const rideable = carrierEntity.getComponent("minecraft:rideable");
        if (!rideable) throw new Error("Vanilla block carrier does not expose minecraft:rideable.");
        const carrier = { entity: carrierEntity, riderIds: [] };
        carriers.push(carrier);
        const end = Math.min(renderEntityCount, start + BLOCK_CARRIER_CAPACITY);
        for (let renderIndex = start; renderIndex < end; renderIndex++) {
          const blockIndex = renderIndex * BLOCK_SLOTS_PER_ENTITY;
          const mainhandBlock = blocks[blockIndex];
          const offhandBlock = blocks[blockIndex + 1];
          const entity = createBlockRenderPair(
            subLevel.dimension,
            subLevel.body,
            renderAnchor,
            mainhandBlock,
            offhandBlock,
            tags
          );
          entities.push(entity);
          assignments.push({ block: mainhandBlock, entity, slot: "mainhand" });
          if (offhandBlock) assignments.push({ block: offhandBlock, entity, slot: "offhand" });
          if (!rideable.addRider(entity)) {
            throw new Error(`Could not mount vanilla block ${entity.id} on carrier ${carrierEntity.id}.`);
          }
          carrier.riderIds.push(entity.id);
        }
      }
      return new VanillaChunkedSubLevelRenderData(
        subLevel.body,
        assignments,
        carriers,
        subLevel.onRenderEntityRemoved,
        renderAnchor
      );
    } catch (error) {
      for (const entity of entities) if (entity.isValid) entity.remove();
      for (const carrier of carriers) if (carrier.entity.isValid) carrier.entity.remove();
      throw error;
    }
  }
};
function normalizeRenderEntityTags(value) {
  if (value === void 0) return [];
  if (!Array.isArray(value) || value.some((tag) => typeof tag !== "string" || tag.length === 0 || tag.length > 255 || /[\r\n]/.test(tag))) throw new TypeError("SubLevel.renderEntityTags is invalid.");
  return [...new Set(value)];
}
function canRenderSubLevelBlockVanilla(block) {
  return ItemTypes.get(block.itemTypeId ?? block.typeId) !== void 0;
}

// sable/packs/SableBP/scripts/sable/sublevel/render/dispatcher/FancySubLevelRenderDispatcher.js
var FancySubLevelRenderDispatcher = class {
  #vanilla = new VanillaSubLevelRenderDispatcher();
  createRenderData(subLevel) {
    const renderAnchor = selectSubLevelRenderAnchor(subLevel.blocks);
    const resolved = subLevel.blocks.map((block) => ({
      block,
      model: resolveFancySubLevelBlock(block)
    }));
    const registered = resolved.flatMap((entry) => entry.model ? [entry.model] : []);
    const primaryPacking = packFancySubLevelModels(registered);
    const primaryKeys = new Set(
      primaryPacking.models.flatMap((model) => model.assignments.map((assignment) => assignment.blockKey))
    );
    const ordinaryFallbacks = resolved.filter((entry) => !primaryKeys.has(blockKey2(entry.block.localLocation))).map((entry) => entry.block);
    const vanillaBlocks = ordinaryFallbacks.filter(canRenderSubLevelBlockVanilla);
    const missingBlocks = ordinaryFallbacks.filter((block) => !canRenderSubLevelBlockVanilla(block)).map(resolveMissingFancySubLevelBlock);
    const missingPacking = packFancySubLevelModels(missingBlocks);
    if (missingPacking.unsupported.length > 0) {
      throw new Error("A projected block cannot be represented by either Sable render route.");
    }
    const packing = { models: [...primaryPacking.models, ...missingPacking.models] };
    const tags = normalizeRenderEntityTags(subLevel.renderEntityTags);
    let fancy;
    let vanilla;
    try {
      if (packing.models.length > 0) {
        fancy = new FancySubLevelModelRenderer(
          subLevel.body,
          packing.models,
          (typeId, location) => spawnTaggedEntity(subLevel, typeId, location, tags),
          subLevel.foliageTint ?? DEFAULT_SUBLEVEL_FOLIAGE_TINT,
          subLevel.onRenderEntityRemoved,
          renderAnchor,
          subLevel.onRenderEntityAdded
        );
      }
      if (vanillaBlocks.length > 0) {
        vanilla = this.#vanilla.createRenderDataAtAnchor(
          { ...subLevel, blocks: vanillaBlocks },
          renderAnchor
        );
      }
      if (!fancy && vanilla) return vanilla;
      if (fancy && !vanilla) return fancy;
      if (!fancy || !vanilla) {
        throw new Error("Cannot create render data for an empty sub-level.");
      }
      for (const entityId of vanilla.entityIds) subLevel.onRenderEntityAdded?.(entityId);
      return new CompositeSubLevelRenderData(fancy, vanilla, renderAnchor);
    } catch (error) {
      fancy?.remove();
      vanilla?.remove();
      throw error;
    }
  }
};
var CompositeSubLevelRenderData = class {
  constructor(fancy, vanilla, anchor) {
    this.fancy = fancy;
    this.vanilla = vanilla;
    this.anchor = anchor;
  }
  fancy;
  vanilla;
  anchor;
  emitsEntityAddedCallbacks = true;
  supportsBlockAddition = false;
  get initialPoseDeferred() {
    return this.fancy.initialPoseDeferred || this.vanilla.initialPoseDeferred;
  }
  get renderRotation() {
    return this.fancy.renderRotation;
  }
  get renderAnchorLocal() {
    return { ...this.anchor };
  }
  get entityCount() {
    return this.fancy.entityCount + this.vanilla.entityCount;
  }
  get entityIds() {
    return [...this.fancy.entityIds, ...this.vanilla.entityIds];
  }
  get entityLocations() {
    return [...this.fancy.entityLocations, ...this.vanilla.entityLocations];
  }
  get firstEntityLocation() {
    return this.fancy.firstEntityLocation ?? this.vanilla.firstEntityLocation;
  }
  hasEntity(entityId) {
    return this.fancy.hasEntity(entityId) || this.vanilla.hasEntity(entityId);
  }
  hasKnownIntegrityFailure() {
    return this.fancy.hasKnownIntegrityFailure() || this.vanilla.hasKnownIntegrityFailure();
  }
  hasIntactEntities() {
    return this.fancy.hasIntactEntities() && this.vanilla.hasIntactEntities();
  }
  releaseInitialPose() {
    this.fancy.releaseInitialPose();
    this.vanilla.releaseInitialPose();
  }
  remove() {
    this.fancy.remove();
    this.vanilla.remove();
  }
  removeBlocks(blockKeys) {
    this.fancy.removeBlocks(blockKeys);
    this.vanilla.removeBlocks(blockKeys);
  }
  sync(force = false) {
    return this.fancy.sync(force) + this.vanilla.sync(force);
  }
  setBlockModelState(blockKeyValue, dimension, value) {
    return this.fancy.setBlockModelState?.(blockKeyValue, dimension, value) ?? false;
  }
  attachAuxiliaryRider(entity) {
    return this.fancy.attachAuxiliaryRider?.(entity) ?? this.vanilla.attachAuxiliaryRider?.(entity) ?? false;
  }
  attachPersistentRider(entity) {
    return this.fancy.attachPersistentRider?.(entity) ?? this.vanilla.attachPersistentRider?.(entity) ?? false;
  }
  detachAuxiliaryRider(entity) {
    this.fancy.detachAuxiliaryRider?.(entity);
    this.vanilla.detachAuxiliaryRider?.(entity);
  }
  detachPersistentRider(entity, preserveEmptyCarrier = false) {
    this.fancy.detachPersistentRider?.(entity, preserveEmptyCarrier);
    this.vanilla.detachPersistentRider?.(entity, preserveEmptyCarrier);
  }
  removeEmptyPersistentRiderCarriers() {
    this.fancy.removeEmptyPersistentRiderCarriers?.();
    this.vanilla.removeEmptyPersistentRiderCarriers?.();
  }
  transferPersistentRidersTo(target) {
    this.fancy.transferPersistentRidersTo?.(target);
    this.vanilla.transferPersistentRidersTo?.(target);
  }
};
function spawnTaggedEntity(subLevel, typeId, location, tags) {
  const entity = subLevel.dimension.spawnEntity(typeId, location);
  try {
    for (const tag of tags) {
      if (!entity.addTag(tag)) throw new Error(`Could not assign render entity tag ${tag}.`);
    }
    return entity;
  } catch (error) {
    if (entity.isValid) entity.remove();
    throw error;
  }
}
function blockKey2(location) {
  return `${location.x},${location.y},${location.z}`;
}

// sable/packs/SableBP/scripts/sable/sublevel/render/SubLevelRenderer.js
var SubLevelRenderer = class {
  static #dispatcher;
  static getDispatcher() {
    this.#dispatcher ??= new FancySubLevelRenderDispatcher();
    return this.#dispatcher;
  }
  static createRenderData(subLevel) {
    let renderData;
    try {
      renderData = this.getDispatcher().createRenderData(subLevel);
      renderData.sync(true);
      if (renderData.initialPoseDeferred) {
        const deferred = renderData;
        system3.run(() => {
          if (!subLevel.body.isValid) return;
          deferred.sync(true);
          deferred.releaseInitialPose();
        });
      }
      if (!renderData.emitsEntityAddedCallbacks) {
        for (const entityId of renderData.entityIds) {
          subLevel.onRenderEntityAdded?.(entityId);
        }
      }
      return renderData;
    } catch (error) {
      renderData?.remove();
      throw error;
    }
  }
};
function assertBlockRenderItems(blocks) {
  const missing = /* @__PURE__ */ new Set();
  for (const block of blocks) {
    const itemTypeId = block.itemTypeId ?? block.typeId;
    if (!ItemTypes2.get(itemTypeId)) missing.add(itemTypeId);
  }
  if (missing.size > 0) {
    throw new Error(`Block render items are not registered: ${[...missing].sort().join(", ")}.`);
  }
}

// sable/packs/SableBP/scripts/sable/util/SableVector3Utils.js
var EPSILON_1E8 = 1e-8;
var EPSILON_1E6 = 1e-6;
function add(left, right) {
  return { x: left.x + right.x, y: left.y + right.y, z: left.z + right.z };
}
function subtract(left, right) {
  return { x: left.x - right.x, y: left.y - right.y, z: left.z - right.z };
}
function dot(left, right) {
  return left.x * right.x + left.y * right.y + left.z * right.z;
}
function squaredDistance(left, right) {
  const dx = left.x - right.x;
  const dy = left.y - right.y;
  const dz = left.z - right.z;
  return dx * dx + dy * dy + dz * dz;
}
function normalizeFinite(value) {
  const magnitude = Math.hypot(value.x, value.y, value.z);
  return !Number.isFinite(magnitude) || magnitude < EPSILON_1E8 ? { x: 0, y: 0, z: 0 } : { x: value.x / magnitude, y: value.y / magnitude, z: value.z / magnitude };
}
function isFiniteVector(value) {
  return Number.isFinite(value.x) && Number.isFinite(value.y) && Number.isFinite(value.z);
}
function vectorsEqual2(left, right) {
  return left.x === right.x && left.y === right.y && left.z === right.z;
}
function blockLocationKey(location) {
  return `${location.x},${location.y},${location.z}`;
}
function parseBlockLocationKey(key) {
  const [x, y, z] = key.split(",").map(Number);
  return { x, y, z };
}
var VANILLA_DIMENSION_IDS = [
  "minecraft:overworld",
  "minecraft:nether",
  "minecraft:the_end"
];

// sable/packs/SableBP/scripts/sable/content/block_properties/SubLevelBlockSupport.js
var LOG_HOST_CATEGORY = "building/logs_and_wood";
var LEAF_HOST_CATEGORY = "nature/leaves";
var ABOVE_OFFSET = { x: 0, y: 1, z: 0 };
var BELOW_OFFSET = { x: 0, y: -1, z: 0 };
var HORIZONTAL_SUPPORTS = [
  { offset: { x: 0, y: 0, z: 1 }, bit: 1 },
  { offset: { x: -1, y: 0, z: 0 }, bit: 2 },
  { offset: { x: 0, y: 0, z: -1 }, bit: 4 },
  { offset: { x: 1, y: 0, z: 0 }, bit: 8 }
];
function resolveSubLevelBlockSupport(entries, removedKeys) {
  const entriesByKey = /* @__PURE__ */ new Map();
  for (const entry of entries) {
    if (entriesByKey.has(entry.key)) {
      throw new RangeError(`Duplicate sub-level attachment support entry ${entry.key}.`);
    }
    entriesByKey.set(entry.key, entry);
  }
  const unsupportedKeys = /* @__PURE__ */ new Set();
  const stateUpdates = /* @__PURE__ */ new Map();
  const supportKeysByAttachment = /* @__PURE__ */ new Map();
  const attachments = entries.filter((entry) => hasSubLevelSupportRule(entry.snapshot) && !removedKeys.has(entry.key)).sort((left, right) => right.localLocation.y - left.localLocation.y);
  for (const entry of attachments) {
    if (removedKeys.has(entry.key) || unsupportedKeys.has(entry.key)) continue;
    const snapshot = entry.snapshot;
    const result = resolveAttachment(
      entry.localLocation,
      snapshot,
      entriesByKey,
      removedKeys,
      unsupportedKeys,
      stateUpdates
    );
    if (!result.supported) {
      unsupportedKeys.add(entry.key);
      continue;
    }
    if (result.states && !statesEqual(snapshot.states ?? {}, result.states)) {
      stateUpdates.set(entry.key, {
        key: entry.key,
        snapshot: { ...snapshot, states: result.states }
      });
    }
    supportKeysByAttachment.set(entry.key, result.supportKeys);
  }
  return { stateUpdates, supportKeysByAttachment, unsupportedKeys };
}
function resolveAttachment(location, snapshot, entriesByKey, removedKeys, unsupportedKeys, stateUpdates) {
  const read = (key) => {
    if (removedKeys.has(key) || unsupportedKeys.has(key)) return void 0;
    return stateUpdates.get(key)?.snapshot ?? entriesByKey.get(key)?.snapshot;
  };
  const keyAt = (offset) => blockLocationKey(add(location, offset));
  const rule = supportRuleOf(snapshot);
  switch (rule) {
    case "none":
      return { supported: true, supportKeys: [] };
    case "facing_log": {
      const direction = integerState(snapshot, "direction", 0, 3);
      const supportKey = keyAt(HORIZONTAL_SUPPORTS[direction].offset);
      const support = read(supportKey);
      return {
        supported: support !== void 0 && getSubLevelBlockRegistration(support.typeId)?.category === LOG_HOST_CATEGORY,
        supportKeys: [supportKey]
      };
    }
    case "above_solid": {
      const supportKey = keyAt(ABOVE_OFFSET);
      return {
        supported: isSolidAttachmentHost(read(supportKey)),
        supportKeys: [supportKey]
      };
    }
    case "above_leaf": {
      const hanging = stateValue2(snapshot, "hanging");
      if (hanging !== true && hanging !== 1) {
        return { supported: true, supportKeys: [] };
      }
      const supportKey = keyAt(ABOVE_OFFSET);
      const support = read(supportKey);
      return {
        supported: support !== void 0 && getSubLevelBlockRegistration(support.typeId)?.category === LEAF_HOST_CATEGORY,
        supportKeys: [supportKey]
      };
    }
    case "moss_column": {
      const supportKey = keyAt(ABOVE_OFFSET);
      const support = read(supportKey);
      const supported = support?.typeId === snapshot.typeId || isSolidAttachmentHost(support);
      const below = read(keyAt(BELOW_OFFSET));
      const tip = below?.typeId !== snapshot.typeId;
      return {
        states: replaceState(snapshot, "tip", tip),
        supported,
        supportKeys: [supportKey]
      };
    }
    case "vine_faces": {
      const currentBits = integerState(snapshot, "vine_direction_bits", 0, 15);
      const aboveKey = keyAt(ABOVE_OFFSET);
      const above = read(aboveKey);
      const aboveBits = above?.typeId === snapshot.typeId ? integerState(above, "vine_direction_bits", 0, 15) : 0;
      let retainedBits = 0;
      const supportKeys = [];
      for (const direction of HORIZONTAL_SUPPORTS) {
        if ((currentBits & direction.bit) === 0) continue;
        const sideKey = keyAt(direction.offset);
        if (isSolidAttachmentHost(read(sideKey))) {
          retainedBits |= direction.bit;
          supportKeys.push(sideKey);
        } else if ((aboveBits & direction.bit) !== 0) {
          retainedBits |= direction.bit;
          supportKeys.push(aboveKey);
        }
      }
      return {
        states: replaceState(snapshot, "vine_direction_bits", retainedBits),
        supported: retainedBits !== 0,
        supportKeys
      };
    }
    default:
      throw new Error(`Unsupported sub-level attachment rule ${String(rule)} for ${snapshot.typeId}.`);
  }
}
function hasSubLevelSupportRule(snapshot) {
  return supportRuleOf(snapshot) !== void 0;
}
function supportRuleOf(snapshot) {
  return getSubLevelBlockRegistration(snapshot.typeId)?.support;
}
function isSolidAttachmentHost(snapshot) {
  return snapshot !== void 0 && !hasSubLevelSupportRule(snapshot);
}
function integerState(snapshot, name, minimum, maximum) {
  const value = stateValue2(snapshot, name);
  if (!Number.isInteger(value) || value < minimum || value > maximum) {
    throw new RangeError(
      `Sub-level attachment ${snapshot.typeId} has invalid ${name} state ${String(value)}.`
    );
  }
  return value;
}
function stateValue2(snapshot, name) {
  return snapshot.states?.[name] ?? snapshot.states?.[`minecraft:${name}`];
}
function replaceState(snapshot, name, value) {
  const states = snapshot.states ?? {};
  const key = states[name] !== void 0 ? name : `minecraft:${name}`;
  if (states[key] === void 0) {
    throw new Error(`Sub-level attachment ${snapshot.typeId} has no ${name} state.`);
  }
  return { ...states, [key]: value };
}
function statesEqual(left, right) {
  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);
  if (leftKeys.length !== rightKeys.length) return false;
  return leftKeys.every((key) => left[key] === right[key]);
}

// sable/packs/SableBP/scripts/sable/data/vanilla/sounds/BlockSoundEvents.js
var VANILLA_BLOCK_BREAK_SOUND_EVENTS = [
  [
    "dig.wood",
    0.8,
    1,
    1,
    1
  ],
  [
    "break.hanging_sign",
    0.8,
    1,
    1,
    1
  ],
  [
    "dig.grass",
    0.8,
    1,
    0.7,
    0.7
  ],
  [
    "block.shelf.break",
    1,
    1,
    1,
    1
  ],
  [
    "dig.stone",
    1.6500000000000001,
    1.7999999999999998,
    1,
    1
  ],
  [
    "dig.stone",
    0.8,
    1,
    1,
    1
  ],
  [
    "break.amethyst_block",
    0.8,
    0.8,
    1,
    1
  ],
  [
    "break.amethyst_cluster",
    1,
    1,
    1,
    1
  ],
  [
    "dig.ancient_debris",
    0.8,
    1,
    1,
    1
  ],
  [
    "break.azalea",
    0.8,
    1,
    1,
    1
  ],
  [
    "dig.azalea_leaves",
    0.8,
    1,
    1,
    1
  ],
  [
    "block.bamboo.break",
    0.8,
    1,
    1,
    1
  ],
  [
    "break.bamboo_wood",
    0.8,
    1,
    1,
    1
  ],
  [
    "break.bamboo_wood_hanging_sign",
    0.8,
    1,
    1,
    1
  ],
  [
    "block.bamboo_sapling.break",
    0.8,
    1,
    1,
    1
  ],
  [
    "dig.basalt",
    0.8,
    1,
    1,
    1
  ],
  [
    "random.glass",
    0.8,
    1,
    1,
    1
  ],
  [
    "break.big_dripleaf",
    0.8,
    1,
    1,
    1
  ],
  [
    "dig.candle",
    1,
    1,
    1,
    1
  ],
  [
    "dig.cloth",
    0.8,
    1,
    1,
    1
  ],
  [
    "dig.sand",
    0.8,
    1,
    1,
    1
  ],
  [
    "dig.bone_block",
    0.8,
    1,
    1,
    1
  ],
  [
    "block.cactus_flower.break",
    0.8,
    0.8,
    1,
    1
  ],
  [
    "break.calcite",
    1,
    1,
    1,
    1
  ],
  [
    "break.sculk_sensor",
    0.8,
    1,
    1,
    1
  ],
  [
    "dig.cave_vines",
    0.8,
    1,
    1,
    1
  ],
  [
    "dig.chain",
    0.8,
    1,
    1,
    1
  ],
  [
    "break.cherry_wood",
    0.8,
    1,
    1,
    1
  ],
  [
    "break.cherry_wood_hanging_sign",
    0.8,
    1,
    1,
    1
  ],
  [
    "break.cherry_leaves",
    1,
    1,
    1,
    1
  ],
  [
    "break.chiseled_bookshelf",
    1,
    1,
    1,
    1
  ],
  [
    "dig.copper",
    0.8,
    1,
    1,
    1
  ],
  [
    "dig.deepslate_bricks",
    0.8,
    1,
    1,
    1
  ],
  [
    "dig.nether_brick",
    0.8,
    1,
    1,
    1
  ],
  [
    "block.resin_brick.break",
    0.8,
    0.8,
    1,
    1
  ],
  [
    "place.tuff",
    0.8,
    0.8,
    1,
    1
  ],
  [
    "place.tuff_bricks",
    0.8,
    0.8,
    1,
    1
  ],
  [
    "dig.gravel",
    0.8,
    1,
    1,
    1
  ],
  [
    "dig.deepslate",
    0.8,
    1,
    1,
    1
  ],
  [
    "break.copper_bulb",
    0.8,
    0.8,
    1,
    1
  ],
  [
    "block.copper_golem_statue.break",
    1,
    1,
    1,
    1
  ],
  [
    "break.copper_grate",
    0.8,
    0.8,
    1,
    1
  ],
  [
    "block.lantern.break",
    0.8,
    1,
    1,
    1
  ],
  [
    "block.creaking_heart.break",
    0.8,
    0.8,
    0.5,
    0.5
  ],
  [
    "break.nether_wood",
    0.8,
    1,
    1,
    1
  ],
  [
    "dig.fungus",
    0.7200000000000001,
    0.9,
    0.85,
    0.85
  ],
  [
    "break.nether_wood_hanging_sign",
    0.8,
    1,
    1,
    1
  ],
  [
    "dig.stem",
    0.8,
    1,
    1,
    1
  ],
  [
    "dig.nylium",
    0.8,
    1,
    1,
    1
  ],
  [
    "dig.roots",
    0.8,
    1,
    1,
    1
  ],
  [
    "break.hanging_roots",
    0.8,
    1,
    1,
    1
  ],
  [
    "block.dried_ghast.break",
    0.96,
    0.96,
    0.8,
    0.8
  ],
  [
    "break.dripstone_block",
    1,
    1,
    1,
    1
  ],
  [
    "block.sweet_berry_bush.break",
    0.8,
    1,
    1,
    1
  ],
  [
    "block.itemframe.break",
    0.8,
    1,
    1,
    1
  ],
  [
    "break.frog_spawn",
    1.2,
    1.2,
    0.1,
    0.1
  ],
  [
    "break.heavy_core",
    0.8,
    0.8,
    1,
    1
  ],
  [
    "break.iron",
    0.8,
    0.8,
    1,
    1
  ],
  [
    "dig.honey_block",
    0.8,
    1,
    1,
    1
  ],
  [
    "dig.coral",
    0.8,
    1,
    1,
    1
  ],
  [
    "break.large_amethyst_bud",
    1,
    1,
    1,
    1
  ],
  [
    "block.leaf_litter.break",
    0.8,
    0.8,
    1,
    1
  ],
  [
    "block.mangrove_roots.break",
    0.8,
    1,
    0.4,
    0.4
  ],
  [
    "break.medium_amethyst_bud",
    1,
    1,
    1,
    1
  ],
  [
    "block.mob_spawner.break",
    0.8,
    0.8,
    1,
    1
  ],
  [
    "dig.moss",
    1,
    1,
    0.93,
    0.93
  ],
  [
    "dig.moss",
    1.1,
    1.1,
    0.8370000000000001,
    0.8370000000000001
  ],
  [
    "block.mud.break",
    0.8,
    1,
    0.4,
    0.4
  ],
  [
    "block.mud_bricks.break",
    0.8,
    1,
    0.5,
    0.5
  ],
  [
    "block.muddy_mangrove_roots.break",
    0.8,
    1,
    0.4,
    0.4
  ],
  [
    "dig.nether_gold_ore",
    0.8,
    1,
    1,
    1
  ],
  [
    "dig.nether_sprouts",
    1.6500000000000001,
    1.7999999999999998,
    1,
    1
  ],
  [
    "dig.nether_wart",
    0.8,
    1,
    1,
    1
  ],
  [
    "dig.netherite",
    0.8,
    1,
    1,
    1
  ],
  [
    "dig.netherrack",
    0.8,
    1,
    1,
    1
  ],
  [
    "break.froglight",
    1,
    1,
    1,
    1
  ],
  [
    "block.packed_mud.break",
    0.8,
    1,
    0.4,
    0.4
  ],
  [
    "break.pink_petals",
    1,
    1,
    1,
    1
  ],
  [
    "break.pointed_dripstone",
    1,
    1,
    1,
    1
  ],
  [
    "break.tuff",
    1.152,
    1.152,
    1,
    1
  ],
  [
    "dig.powder_snow",
    0.8,
    1,
    1,
    1
  ],
  [
    "block.resin.break",
    0.8,
    0.8,
    1,
    1
  ],
  [
    "block.scaffolding.break",
    0.8,
    1,
    1,
    1
  ],
  [
    "break.sculk",
    0.8,
    1,
    1,
    1
  ],
  [
    "break.sculk_catalyst",
    0.8,
    1,
    1,
    1
  ],
  [
    "break.sculk_shrieker",
    0.8,
    1,
    1,
    1
  ],
  [
    "break.sculk_vein",
    0.8,
    1,
    1,
    1
  ],
  [
    "mob.slime.big",
    0.8,
    1,
    1,
    1
  ],
  [
    "dig.shroomlight",
    0.8,
    1,
    1,
    1
  ],
  [
    "break.small_amethyst_bud",
    1,
    1,
    1,
    1
  ],
  [
    "dig.snow",
    0.8,
    1,
    1,
    1
  ],
  [
    "dig.soul_sand",
    0.8,
    1,
    1,
    1
  ],
  [
    "dig.soul_soil",
    0.8,
    1,
    1,
    1
  ],
  [
    "break.sponge",
    0.8,
    0.8,
    1,
    1
  ],
  [
    "break.spore_blossom",
    0.8,
    1,
    1,
    1
  ],
  [
    "break.suspicious_gravel",
    0.8,
    1,
    1,
    1
  ],
  [
    "break.suspicious_sand",
    0.8,
    1,
    1,
    1
  ],
  [
    "trial_spawner.break",
    0.8,
    0.8,
    1,
    1
  ],
  [
    "block.weeping_vines.break",
    0.8,
    1,
    1,
    1
  ],
  [
    "vault.break",
    0.8,
    0.8,
    1,
    1
  ],
  [
    "dig.vines",
    0.8,
    1,
    1,
    1
  ],
  [
    "break.web",
    1,
    1,
    1,
    1
  ],
  [
    "break.wet_sponge",
    0.8,
    0.8,
    1,
    1
  ]
];
var VANILLA_BLOCK_BREAK_SOUND_EVENT_INDICES = {
  "minecraft:acacia_button": 0,
  "minecraft:acacia_door": 0,
  "minecraft:acacia_double_slab": 0,
  "minecraft:acacia_fence": 0,
  "minecraft:acacia_fence_gate": 0,
  "minecraft:acacia_hanging_sign": 1,
  "minecraft:acacia_leaves": 2,
  "minecraft:acacia_log": 0,
  "minecraft:acacia_planks": 0,
  "minecraft:acacia_pressure_plate": 0,
  "minecraft:acacia_sapling": 2,
  "minecraft:acacia_shelf": 3,
  "minecraft:acacia_slab": 0,
  "minecraft:acacia_stairs": 0,
  "minecraft:acacia_standing_sign": 0,
  "minecraft:acacia_trapdoor": 0,
  "minecraft:acacia_wall_sign": 0,
  "minecraft:acacia_wood": 0,
  "minecraft:activator_rail": 4,
  "minecraft:allium": 2,
  "minecraft:allow": 5,
  "minecraft:amethyst_block": 6,
  "minecraft:amethyst_cluster": 7,
  "minecraft:ancient_debris": 8,
  "minecraft:andesite": 5,
  "minecraft:andesite_double_slab": 5,
  "minecraft:andesite_slab": 5,
  "minecraft:andesite_stairs": 5,
  "minecraft:andesite_wall": 5,
  "minecraft:anvil": 5,
  "minecraft:azalea": 9,
  "minecraft:azalea_leaves": 10,
  "minecraft:azalea_leaves_flowered": 10,
  "minecraft:azure_bluet": 2,
  "minecraft:bamboo": 11,
  "minecraft:bamboo_block": 12,
  "minecraft:bamboo_button": 12,
  "minecraft:bamboo_door": 12,
  "minecraft:bamboo_double_slab": 12,
  "minecraft:bamboo_fence": 12,
  "minecraft:bamboo_fence_gate": 12,
  "minecraft:bamboo_hanging_sign": 13,
  "minecraft:bamboo_mosaic": 12,
  "minecraft:bamboo_mosaic_double_slab": 12,
  "minecraft:bamboo_mosaic_slab": 12,
  "minecraft:bamboo_mosaic_stairs": 12,
  "minecraft:bamboo_planks": 12,
  "minecraft:bamboo_pressure_plate": 12,
  "minecraft:bamboo_sapling": 14,
  "minecraft:bamboo_shelf": 3,
  "minecraft:bamboo_slab": 12,
  "minecraft:bamboo_stairs": 12,
  "minecraft:bamboo_standing_sign": 12,
  "minecraft:bamboo_trapdoor": 12,
  "minecraft:bamboo_wall_sign": 12,
  "minecraft:barrel": 0,
  "minecraft:basalt": 15,
  "minecraft:beacon": 16,
  "minecraft:bed": 0,
  "minecraft:bedrock": 5,
  "minecraft:bee_nest": 0,
  "minecraft:beehive": 0,
  "minecraft:beetroot": 0,
  "minecraft:bell": 4,
  "minecraft:big_dripleaf": 17,
  "minecraft:birch_button": 0,
  "minecraft:birch_door": 0,
  "minecraft:birch_double_slab": 0,
  "minecraft:birch_fence": 0,
  "minecraft:birch_fence_gate": 0,
  "minecraft:birch_hanging_sign": 1,
  "minecraft:birch_leaves": 2,
  "minecraft:birch_log": 0,
  "minecraft:birch_planks": 0,
  "minecraft:birch_pressure_plate": 0,
  "minecraft:birch_sapling": 2,
  "minecraft:birch_shelf": 3,
  "minecraft:birch_slab": 0,
  "minecraft:birch_stairs": 0,
  "minecraft:birch_standing_sign": 0,
  "minecraft:birch_trapdoor": 0,
  "minecraft:birch_wall_sign": 0,
  "minecraft:birch_wood": 0,
  "minecraft:black_candle": 18,
  "minecraft:black_candle_cake": 19,
  "minecraft:black_carpet": 19,
  "minecraft:black_concrete": 5,
  "minecraft:black_concrete_powder": 20,
  "minecraft:black_glazed_terracotta": 5,
  "minecraft:black_shulker_box": 5,
  "minecraft:black_stained_glass": 16,
  "minecraft:black_stained_glass_pane": 16,
  "minecraft:black_terracotta": 5,
  "minecraft:black_wool": 19,
  "minecraft:blackstone": 5,
  "minecraft:blackstone_double_slab": 5,
  "minecraft:blackstone_slab": 5,
  "minecraft:blackstone_stairs": 5,
  "minecraft:blackstone_wall": 5,
  "minecraft:blast_furnace": 5,
  "minecraft:blue_candle": 18,
  "minecraft:blue_candle_cake": 19,
  "minecraft:blue_carpet": 19,
  "minecraft:blue_concrete": 5,
  "minecraft:blue_concrete_powder": 20,
  "minecraft:blue_glazed_terracotta": 5,
  "minecraft:blue_ice": 16,
  "minecraft:blue_orchid": 2,
  "minecraft:blue_shulker_box": 5,
  "minecraft:blue_stained_glass": 16,
  "minecraft:blue_stained_glass_pane": 16,
  "minecraft:blue_terracotta": 5,
  "minecraft:blue_wool": 19,
  "minecraft:bone_block": 21,
  "minecraft:bookshelf": 0,
  "minecraft:border_block": 5,
  "minecraft:brain_coral": 5,
  "minecraft:brain_coral_block": 5,
  "minecraft:brain_coral_fan": 5,
  "minecraft:brain_coral_wall_fan": 5,
  "minecraft:brewing_stand": 5,
  "minecraft:brick_double_slab": 5,
  "minecraft:brick_slab": 5,
  "minecraft:brick_wall": 5,
  "minecraft:brown_candle": 18,
  "minecraft:brown_candle_cake": 19,
  "minecraft:brown_carpet": 19,
  "minecraft:brown_concrete": 5,
  "minecraft:brown_concrete_powder": 20,
  "minecraft:brown_glazed_terracotta": 5,
  "minecraft:brown_mushroom": 2,
  "minecraft:brown_mushroom_block": 0,
  "minecraft:brown_shulker_box": 5,
  "minecraft:brown_stained_glass": 16,
  "minecraft:brown_stained_glass_pane": 16,
  "minecraft:brown_terracotta": 5,
  "minecraft:brown_wool": 19,
  "minecraft:bubble_coral": 5,
  "minecraft:bubble_coral_block": 5,
  "minecraft:bubble_coral_fan": 5,
  "minecraft:bubble_coral_wall_fan": 5,
  "minecraft:budding_amethyst": 6,
  "minecraft:bush": 2,
  "minecraft:cactus": 19,
  "minecraft:cactus_flower": 22,
  "minecraft:cake": 19,
  "minecraft:calcite": 23,
  "minecraft:calibrated_sculk_sensor": 24,
  "minecraft:campfire": 0,
  "minecraft:candle": 18,
  "minecraft:candle_cake": 19,
  "minecraft:carpet": 19,
  "minecraft:carrots": 2,
  "minecraft:cartography_table": 0,
  "minecraft:carved_pumpkin": 0,
  "minecraft:cave_vines": 25,
  "minecraft:cave_vines_body_with_berries": 25,
  "minecraft:cave_vines_head_with_berries": 25,
  "minecraft:chain": 26,
  "minecraft:chain_command_block": 4,
  "minecraft:cherry_button": 27,
  "minecraft:cherry_door": 27,
  "minecraft:cherry_double_slab": 27,
  "minecraft:cherry_fence": 27,
  "minecraft:cherry_fence_gate": 27,
  "minecraft:cherry_hanging_sign": 28,
  "minecraft:cherry_leaves": 29,
  "minecraft:cherry_log": 27,
  "minecraft:cherry_planks": 27,
  "minecraft:cherry_pressure_plate": 27,
  "minecraft:cherry_sapling": 14,
  "minecraft:cherry_shelf": 3,
  "minecraft:cherry_slab": 27,
  "minecraft:cherry_stairs": 27,
  "minecraft:cherry_standing_sign": 27,
  "minecraft:cherry_trapdoor": 27,
  "minecraft:cherry_wall_sign": 27,
  "minecraft:cherry_wood": 27,
  "minecraft:chest": 0,
  "minecraft:chipped_anvil": 5,
  "minecraft:chiseled_bookshelf": 30,
  "minecraft:chiseled_copper": 31,
  "minecraft:chiseled_deepslate": 32,
  "minecraft:chiseled_nether_bricks": 33,
  "minecraft:chiseled_polished_blackstone": 5,
  "minecraft:chiseled_quartz_block": 5,
  "minecraft:chiseled_red_sandstone": 5,
  "minecraft:chiseled_resin_bricks": 34,
  "minecraft:chiseled_sandstone": 5,
  "minecraft:chiseled_stone_bricks": 5,
  "minecraft:chiseled_tuff": 35,
  "minecraft:chiseled_tuff_bricks": 36,
  "minecraft:chorus_flower": 5,
  "minecraft:chorus_plant": 5,
  "minecraft:clay": 37,
  "minecraft:closed_eyeblossom": 2,
  "minecraft:coal_block": 5,
  "minecraft:coal_ore": 5,
  "minecraft:coarse_dirt": 37,
  "minecraft:cobbled_deepslate": 38,
  "minecraft:cobbled_deepslate_double_slab": 38,
  "minecraft:cobbled_deepslate_slab": 38,
  "minecraft:cobbled_deepslate_stairs": 38,
  "minecraft:cobbled_deepslate_wall": 38,
  "minecraft:cobblestone": 5,
  "minecraft:cobblestone_double_slab": 5,
  "minecraft:cobblestone_slab": 5,
  "minecraft:cobblestone_wall": 5,
  "minecraft:cocoa": 0,
  "minecraft:command_block": 4,
  "minecraft:composter": 0,
  "minecraft:concrete": 5,
  "minecraft:concretePowder": 20,
  "minecraft:conduit": 5,
  "minecraft:copper_bars": 31,
  "minecraft:copper_block": 31,
  "minecraft:copper_bulb": 39,
  "minecraft:copper_chain": 26,
  "minecraft:copper_chest": 31,
  "minecraft:copper_door": 31,
  "minecraft:copper_golem_statue": 40,
  "minecraft:copper_grate": 41,
  "minecraft:copper_lantern": 42,
  "minecraft:copper_ore": 5,
  "minecraft:copper_torch": 0,
  "minecraft:copper_trapdoor": 31,
  "minecraft:coral": 5,
  "minecraft:coral_fan": 5,
  "minecraft:coral_fan_dead": 5,
  "minecraft:coral_fan_hang": 5,
  "minecraft:coral_fan_hang2": 5,
  "minecraft:coral_fan_hang3": 5,
  "minecraft:cornflower": 2,
  "minecraft:cracked_deepslate_bricks": 32,
  "minecraft:cracked_deepslate_tiles": 32,
  "minecraft:cracked_nether_bricks": 33,
  "minecraft:cracked_polished_blackstone_bricks": 5,
  "minecraft:cracked_stone_bricks": 5,
  "minecraft:crafter": 5,
  "minecraft:crafting_table": 0,
  "minecraft:creaking_heart": 43,
  "minecraft:creeper_head": 5,
  "minecraft:crimson_button": 44,
  "minecraft:crimson_door": 44,
  "minecraft:crimson_double_slab": 44,
  "minecraft:crimson_fence": 44,
  "minecraft:crimson_fence_gate": 44,
  "minecraft:crimson_fungus": 45,
  "minecraft:crimson_hanging_sign": 46,
  "minecraft:crimson_hyphae": 47,
  "minecraft:crimson_nylium": 48,
  "minecraft:crimson_planks": 44,
  "minecraft:crimson_pressure_plate": 44,
  "minecraft:crimson_roots": 49,
  "minecraft:crimson_shelf": 3,
  "minecraft:crimson_slab": 44,
  "minecraft:crimson_stairs": 44,
  "minecraft:crimson_standing_sign": 44,
  "minecraft:crimson_stem": 47,
  "minecraft:crimson_trapdoor": 44,
  "minecraft:crimson_wall_sign": 44,
  "minecraft:crying_obsidian": 5,
  "minecraft:cut_copper": 31,
  "minecraft:cut_copper_slab": 31,
  "minecraft:cut_copper_stairs": 31,
  "minecraft:cut_red_sandstone": 5,
  "minecraft:cut_red_sandstone_double_slab": 5,
  "minecraft:cut_red_sandstone_slab": 5,
  "minecraft:cut_sandstone": 5,
  "minecraft:cut_sandstone_double_slab": 5,
  "minecraft:cut_sandstone_slab": 5,
  "minecraft:cyan_candle": 18,
  "minecraft:cyan_candle_cake": 19,
  "minecraft:cyan_carpet": 19,
  "minecraft:cyan_concrete": 5,
  "minecraft:cyan_concrete_powder": 20,
  "minecraft:cyan_glazed_terracotta": 5,
  "minecraft:cyan_shulker_box": 5,
  "minecraft:cyan_stained_glass": 16,
  "minecraft:cyan_stained_glass_pane": 16,
  "minecraft:cyan_terracotta": 5,
  "minecraft:cyan_wool": 19,
  "minecraft:damaged_anvil": 5,
  "minecraft:dandelion": 2,
  "minecraft:dark_oak_button": 0,
  "minecraft:dark_oak_door": 0,
  "minecraft:dark_oak_double_slab": 0,
  "minecraft:dark_oak_fence": 0,
  "minecraft:dark_oak_fence_gate": 0,
  "minecraft:dark_oak_hanging_sign": 1,
  "minecraft:dark_oak_leaves": 2,
  "minecraft:dark_oak_log": 0,
  "minecraft:dark_oak_planks": 0,
  "minecraft:dark_oak_pressure_plate": 0,
  "minecraft:dark_oak_sapling": 2,
  "minecraft:dark_oak_shelf": 3,
  "minecraft:dark_oak_slab": 0,
  "minecraft:dark_oak_stairs": 0,
  "minecraft:dark_oak_trapdoor": 0,
  "minecraft:dark_oak_wood": 0,
  "minecraft:dark_prismarine": 5,
  "minecraft:dark_prismarine_double_slab": 5,
  "minecraft:dark_prismarine_slab": 5,
  "minecraft:dark_prismarine_stairs": 5,
  "minecraft:darkoak_standing_sign": 0,
  "minecraft:darkoak_wall_sign": 0,
  "minecraft:daylight_detector": 0,
  "minecraft:daylight_detector_inverted": 0,
  "minecraft:dead_brain_coral": 5,
  "minecraft:dead_brain_coral_block": 5,
  "minecraft:dead_brain_coral_fan": 5,
  "minecraft:dead_brain_coral_wall_fan": 5,
  "minecraft:dead_bubble_coral": 5,
  "minecraft:dead_bubble_coral_block": 5,
  "minecraft:dead_bubble_coral_fan": 5,
  "minecraft:dead_bubble_coral_wall_fan": 5,
  "minecraft:dead_fire_coral": 5,
  "minecraft:dead_fire_coral_block": 5,
  "minecraft:dead_fire_coral_fan": 5,
  "minecraft:dead_fire_coral_wall_fan": 5,
  "minecraft:dead_horn_coral": 5,
  "minecraft:dead_horn_coral_block": 5,
  "minecraft:dead_horn_coral_fan": 5,
  "minecraft:dead_horn_coral_wall_fan": 5,
  "minecraft:dead_tube_coral": 5,
  "minecraft:dead_tube_coral_block": 5,
  "minecraft:dead_tube_coral_fan": 5,
  "minecraft:dead_tube_coral_wall_fan": 5,
  "minecraft:deadbush": 2,
  "minecraft:deepslate": 38,
  "minecraft:deepslate_brick_double_slab": 32,
  "minecraft:deepslate_brick_slab": 32,
  "minecraft:deepslate_brick_stairs": 32,
  "minecraft:deepslate_brick_wall": 32,
  "minecraft:deepslate_bricks": 32,
  "minecraft:deepslate_coal_ore": 38,
  "minecraft:deepslate_copper_ore": 38,
  "minecraft:deepslate_diamond_ore": 38,
  "minecraft:deepslate_emerald_ore": 38,
  "minecraft:deepslate_gold_ore": 38,
  "minecraft:deepslate_iron_ore": 38,
  "minecraft:deepslate_lapis_ore": 38,
  "minecraft:deepslate_redstone_ore": 38,
  "minecraft:deepslate_tile_double_slab": 32,
  "minecraft:deepslate_tile_slab": 32,
  "minecraft:deepslate_tile_stairs": 32,
  "minecraft:deepslate_tile_wall": 32,
  "minecraft:deepslate_tiles": 32,
  "minecraft:deny": 5,
  "minecraft:deprecated_anvil": 5,
  "minecraft:deprecated_purpur_block_1": 5,
  "minecraft:deprecated_purpur_block_2": 5,
  "minecraft:detector_rail": 4,
  "minecraft:diamond_block": 4,
  "minecraft:diamond_ore": 5,
  "minecraft:diorite": 5,
  "minecraft:diorite_double_slab": 5,
  "minecraft:diorite_slab": 5,
  "minecraft:diorite_stairs": 5,
  "minecraft:diorite_wall": 5,
  "minecraft:dirt": 37,
  "minecraft:dirt_with_roots": 50,
  "minecraft:dispenser": 5,
  "minecraft:double_cut_copper_slab": 31,
  "minecraft:double_plant": 2,
  "minecraft:double_stone_slab": 5,
  "minecraft:double_stone_slab2": 5,
  "minecraft:double_stone_slab3": 5,
  "minecraft:double_stone_slab4": 5,
  "minecraft:double_wooden_slab": 0,
  "minecraft:dragon_egg": 5,
  "minecraft:dragon_head": 5,
  "minecraft:dried_ghast": 51,
  "minecraft:dried_kelp_block": 2,
  "minecraft:dripstone_block": 52,
  "minecraft:dropper": 5,
  "minecraft:emerald_block": 4,
  "minecraft:emerald_ore": 5,
  "minecraft:end_brick_stairs": 5,
  "minecraft:end_bricks": 5,
  "minecraft:end_portal_frame": 16,
  "minecraft:end_rod": 0,
  "minecraft:end_stone": 5,
  "minecraft:end_stone_brick_double_slab": 5,
  "minecraft:end_stone_brick_slab": 5,
  "minecraft:end_stone_brick_wall": 5,
  "minecraft:exposed_chiseled_copper": 31,
  "minecraft:exposed_copper": 31,
  "minecraft:exposed_copper_bars": 31,
  "minecraft:exposed_copper_bulb": 39,
  "minecraft:exposed_copper_chain": 26,
  "minecraft:exposed_copper_chest": 31,
  "minecraft:exposed_copper_door": 31,
  "minecraft:exposed_copper_golem_statue": 40,
  "minecraft:exposed_copper_grate": 41,
  "minecraft:exposed_copper_lantern": 42,
  "minecraft:exposed_copper_trapdoor": 31,
  "minecraft:exposed_cut_copper": 31,
  "minecraft:exposed_cut_copper_slab": 31,
  "minecraft:exposed_cut_copper_stairs": 31,
  "minecraft:exposed_double_cut_copper_slab": 31,
  "minecraft:exposed_lightning_rod": 31,
  "minecraft:farmland": 37,
  "minecraft:fence": 0,
  "minecraft:fence_gate": 0,
  "minecraft:fern": 2,
  "minecraft:fire": 0,
  "minecraft:fire_coral": 5,
  "minecraft:fire_coral_block": 5,
  "minecraft:fire_coral_fan": 5,
  "minecraft:fire_coral_wall_fan": 5,
  "minecraft:firefly_bush": 53,
  "minecraft:fletching_table": 0,
  "minecraft:flowering_azalea": 9,
  "minecraft:frame": 54,
  "minecraft:frog_spawn": 55,
  "minecraft:frosted_ice": 16,
  "minecraft:furnace": 5,
  "minecraft:gilded_blackstone": 5,
  "minecraft:glass": 16,
  "minecraft:glass_pane": 16,
  "minecraft:glow_frame": 54,
  "minecraft:glow_lichen": 2,
  "minecraft:glowingobsidian": 5,
  "minecraft:glowstone": 16,
  "minecraft:gold_block": 4,
  "minecraft:gold_ore": 5,
  "minecraft:golden_dandelion": 2,
  "minecraft:golden_rail": 4,
  "minecraft:granite": 5,
  "minecraft:granite_double_slab": 5,
  "minecraft:granite_slab": 5,
  "minecraft:granite_stairs": 5,
  "minecraft:granite_wall": 5,
  "minecraft:grass": 2,
  "minecraft:grass_path": 2,
  "minecraft:gravel": 37,
  "minecraft:gray_candle": 18,
  "minecraft:gray_candle_cake": 19,
  "minecraft:gray_carpet": 19,
  "minecraft:gray_concrete": 5,
  "minecraft:gray_concrete_powder": 20,
  "minecraft:gray_glazed_terracotta": 5,
  "minecraft:gray_shulker_box": 5,
  "minecraft:gray_stained_glass": 16,
  "minecraft:gray_stained_glass_pane": 16,
  "minecraft:gray_terracotta": 5,
  "minecraft:gray_wool": 19,
  "minecraft:green_candle": 18,
  "minecraft:green_candle_cake": 19,
  "minecraft:green_carpet": 19,
  "minecraft:green_concrete": 5,
  "minecraft:green_concrete_powder": 20,
  "minecraft:green_glazed_terracotta": 5,
  "minecraft:green_shulker_box": 5,
  "minecraft:green_stained_glass": 16,
  "minecraft:green_stained_glass_pane": 16,
  "minecraft:green_terracotta": 5,
  "minecraft:green_wool": 19,
  "minecraft:grindstone": 5,
  "minecraft:hanging_roots": 50,
  "minecraft:hardened_clay": 5,
  "minecraft:hay_block": 2,
  "minecraft:heavy_core": 56,
  "minecraft:heavy_weighted_pressure_plate": 57,
  "minecraft:honey_block": 58,
  "minecraft:honeycomb_block": 59,
  "minecraft:hopper": 4,
  "minecraft:horn_coral": 5,
  "minecraft:horn_coral_block": 5,
  "minecraft:horn_coral_fan": 5,
  "minecraft:horn_coral_wall_fan": 5,
  "minecraft:ice": 16,
  "minecraft:infested_chiseled_stone_bricks": 5,
  "minecraft:infested_cobblestone": 5,
  "minecraft:infested_cracked_stone_bricks": 5,
  "minecraft:infested_deepslate": 38,
  "minecraft:infested_mossy_stone_bricks": 5,
  "minecraft:infested_stone": 5,
  "minecraft:infested_stone_bricks": 5,
  "minecraft:info_update": 37,
  "minecraft:info_update2": 37,
  "minecraft:iron_bars": 57,
  "minecraft:iron_block": 57,
  "minecraft:iron_door": 57,
  "minecraft:iron_ore": 5,
  "minecraft:iron_trapdoor": 57,
  "minecraft:jukebox": 0,
  "minecraft:jungle_button": 0,
  "minecraft:jungle_door": 0,
  "minecraft:jungle_double_slab": 0,
  "minecraft:jungle_fence": 0,
  "minecraft:jungle_fence_gate": 0,
  "minecraft:jungle_hanging_sign": 1,
  "minecraft:jungle_leaves": 2,
  "minecraft:jungle_log": 0,
  "minecraft:jungle_planks": 0,
  "minecraft:jungle_pressure_plate": 0,
  "minecraft:jungle_sapling": 2,
  "minecraft:jungle_shelf": 3,
  "minecraft:jungle_slab": 0,
  "minecraft:jungle_stairs": 0,
  "minecraft:jungle_standing_sign": 0,
  "minecraft:jungle_trapdoor": 0,
  "minecraft:jungle_wall_sign": 0,
  "minecraft:jungle_wood": 0,
  "minecraft:kelp": 2,
  "minecraft:ladder": 0,
  "minecraft:lantern": 42,
  "minecraft:lapis_block": 5,
  "minecraft:lapis_ore": 5,
  "minecraft:large_amethyst_bud": 60,
  "minecraft:large_fern": 2,
  "minecraft:leaf_litter": 61,
  "minecraft:leaves": 2,
  "minecraft:leaves2": 2,
  "minecraft:lectern": 0,
  "minecraft:lever": 0,
  "minecraft:light_block_0": 5,
  "minecraft:light_block_1": 5,
  "minecraft:light_block_10": 5,
  "minecraft:light_block_11": 5,
  "minecraft:light_block_12": 5,
  "minecraft:light_block_13": 5,
  "minecraft:light_block_14": 5,
  "minecraft:light_block_15": 5,
  "minecraft:light_block_2": 5,
  "minecraft:light_block_3": 5,
  "minecraft:light_block_4": 5,
  "minecraft:light_block_5": 5,
  "minecraft:light_block_6": 5,
  "minecraft:light_block_7": 5,
  "minecraft:light_block_8": 5,
  "minecraft:light_block_9": 5,
  "minecraft:light_blue_candle": 18,
  "minecraft:light_blue_candle_cake": 19,
  "minecraft:light_blue_carpet": 19,
  "minecraft:light_blue_concrete": 5,
  "minecraft:light_blue_concrete_powder": 20,
  "minecraft:light_blue_glazed_terracotta": 5,
  "minecraft:light_blue_shulker_box": 5,
  "minecraft:light_blue_stained_glass": 16,
  "minecraft:light_blue_stained_glass_pane": 16,
  "minecraft:light_blue_terracotta": 5,
  "minecraft:light_blue_wool": 19,
  "minecraft:light_gray_candle": 18,
  "minecraft:light_gray_candle_cake": 19,
  "minecraft:light_gray_carpet": 19,
  "minecraft:light_gray_concrete": 5,
  "minecraft:light_gray_concrete_powder": 20,
  "minecraft:light_gray_shulker_box": 5,
  "minecraft:light_gray_stained_glass": 16,
  "minecraft:light_gray_stained_glass_pane": 16,
  "minecraft:light_gray_terracotta": 5,
  "minecraft:light_gray_wool": 19,
  "minecraft:light_weighted_pressure_plate": 4,
  "minecraft:lightning_rod": 31,
  "minecraft:lilac": 2,
  "minecraft:lily_of_the_valley": 2,
  "minecraft:lime_candle": 18,
  "minecraft:lime_candle_cake": 19,
  "minecraft:lime_carpet": 19,
  "minecraft:lime_concrete": 5,
  "minecraft:lime_concrete_powder": 20,
  "minecraft:lime_glazed_terracotta": 5,
  "minecraft:lime_shulker_box": 5,
  "minecraft:lime_stained_glass": 16,
  "minecraft:lime_stained_glass_pane": 16,
  "minecraft:lime_terracotta": 5,
  "minecraft:lime_wool": 19,
  "minecraft:lit_blast_furnace": 5,
  "minecraft:lit_deepslate_redstone_ore": 38,
  "minecraft:lit_furnace": 5,
  "minecraft:lit_pumpkin": 0,
  "minecraft:lit_redstone_lamp": 16,
  "minecraft:lit_redstone_ore": 5,
  "minecraft:lit_smoker": 5,
  "minecraft:lodestone": 5,
  "minecraft:log": 0,
  "minecraft:log2": 0,
  "minecraft:loom": 0,
  "minecraft:magenta_candle": 18,
  "minecraft:magenta_candle_cake": 19,
  "minecraft:magenta_carpet": 19,
  "minecraft:magenta_concrete": 5,
  "minecraft:magenta_concrete_powder": 20,
  "minecraft:magenta_glazed_terracotta": 5,
  "minecraft:magenta_shulker_box": 5,
  "minecraft:magenta_stained_glass": 16,
  "minecraft:magenta_stained_glass_pane": 16,
  "minecraft:magenta_terracotta": 5,
  "minecraft:magenta_wool": 19,
  "minecraft:magma": 5,
  "minecraft:mangrove_button": 0,
  "minecraft:mangrove_door": 0,
  "minecraft:mangrove_double_slab": 0,
  "minecraft:mangrove_fence": 0,
  "minecraft:mangrove_fence_gate": 0,
  "minecraft:mangrove_hanging_sign": 1,
  "minecraft:mangrove_leaves": 2,
  "minecraft:mangrove_log": 0,
  "minecraft:mangrove_planks": 0,
  "minecraft:mangrove_pressure_plate": 0,
  "minecraft:mangrove_propagule": 2,
  "minecraft:mangrove_roots": 62,
  "minecraft:mangrove_shelf": 3,
  "minecraft:mangrove_slab": 0,
  "minecraft:mangrove_stairs": 0,
  "minecraft:mangrove_standing_sign": 0,
  "minecraft:mangrove_trapdoor": 0,
  "minecraft:mangrove_wall_sign": 0,
  "minecraft:mangrove_wood": 0,
  "minecraft:medium_amethyst_bud": 63,
  "minecraft:melon_block": 0,
  "minecraft:melon_stem": 0,
  "minecraft:mob_spawner": 64,
  "minecraft:moss_block": 65,
  "minecraft:moss_carpet": 66,
  "minecraft:mossy_cobblestone": 5,
  "minecraft:mossy_cobblestone_double_slab": 5,
  "minecraft:mossy_cobblestone_slab": 5,
  "minecraft:mossy_cobblestone_stairs": 5,
  "minecraft:mossy_cobblestone_wall": 5,
  "minecraft:mossy_stone_brick_double_slab": 5,
  "minecraft:mossy_stone_brick_slab": 5,
  "minecraft:mossy_stone_brick_stairs": 5,
  "minecraft:mossy_stone_brick_wall": 5,
  "minecraft:mossy_stone_bricks": 5,
  "minecraft:mud": 67,
  "minecraft:mud_brick_double_slab": 68,
  "minecraft:mud_brick_slab": 68,
  "minecraft:mud_brick_stairs": 68,
  "minecraft:mud_brick_wall": 68,
  "minecraft:mud_bricks": 68,
  "minecraft:muddy_mangrove_roots": 69,
  "minecraft:mushroom_stem": 0,
  "minecraft:mycelium": 2,
  "minecraft:nether_brick": 33,
  "minecraft:nether_brick_double_slab": 5,
  "minecraft:nether_brick_fence": 33,
  "minecraft:nether_brick_slab": 33,
  "minecraft:nether_brick_stairs": 33,
  "minecraft:nether_brick_wall": 33,
  "minecraft:nether_gold_ore": 70,
  "minecraft:nether_sprouts": 71,
  "minecraft:nether_wart": 72,
  "minecraft:nether_wart_block": 72,
  "minecraft:netherite_block": 73,
  "minecraft:netherrack": 74,
  "minecraft:netherreactor": 4,
  "minecraft:normal_stone_double_slab": 5,
  "minecraft:normal_stone_slab": 5,
  "minecraft:normal_stone_stairs": 5,
  "minecraft:noteblock": 0,
  "minecraft:oak_double_slab": 0,
  "minecraft:oak_fence": 0,
  "minecraft:oak_hanging_sign": 1,
  "minecraft:oak_leaves": 2,
  "minecraft:oak_log": 0,
  "minecraft:oak_planks": 0,
  "minecraft:oak_sapling": 2,
  "minecraft:oak_shelf": 3,
  "minecraft:oak_slab": 0,
  "minecraft:oak_stairs": 0,
  "minecraft:oak_wood": 0,
  "minecraft:observer": 4,
  "minecraft:obsidian": 5,
  "minecraft:ochre_froglight": 75,
  "minecraft:open_eyeblossom": 2,
  "minecraft:orange_candle": 18,
  "minecraft:orange_candle_cake": 19,
  "minecraft:orange_carpet": 19,
  "minecraft:orange_concrete": 5,
  "minecraft:orange_concrete_powder": 20,
  "minecraft:orange_glazed_terracotta": 5,
  "minecraft:orange_shulker_box": 5,
  "minecraft:orange_stained_glass": 16,
  "minecraft:orange_stained_glass_pane": 16,
  "minecraft:orange_terracotta": 5,
  "minecraft:orange_tulip": 2,
  "minecraft:orange_wool": 19,
  "minecraft:oxeye_daisy": 2,
  "minecraft:oxidized_chiseled_copper": 31,
  "minecraft:oxidized_copper": 31,
  "minecraft:oxidized_copper_bars": 31,
  "minecraft:oxidized_copper_bulb": 39,
  "minecraft:oxidized_copper_chain": 26,
  "minecraft:oxidized_copper_chest": 31,
  "minecraft:oxidized_copper_door": 31,
  "minecraft:oxidized_copper_golem_statue": 40,
  "minecraft:oxidized_copper_grate": 41,
  "minecraft:oxidized_copper_lantern": 42,
  "minecraft:oxidized_copper_trapdoor": 31,
  "minecraft:oxidized_cut_copper": 31,
  "minecraft:oxidized_cut_copper_slab": 31,
  "minecraft:oxidized_cut_copper_stairs": 31,
  "minecraft:oxidized_double_cut_copper_slab": 31,
  "minecraft:oxidized_lightning_rod": 31,
  "minecraft:packed_ice": 16,
  "minecraft:packed_mud": 76,
  "minecraft:pale_hanging_moss": 65,
  "minecraft:pale_moss_block": 65,
  "minecraft:pale_moss_carpet": 66,
  "minecraft:pale_oak_button": 0,
  "minecraft:pale_oak_door": 0,
  "minecraft:pale_oak_double_slab": 0,
  "minecraft:pale_oak_fence": 0,
  "minecraft:pale_oak_fence_gate": 0,
  "minecraft:pale_oak_hanging_sign": 1,
  "minecraft:pale_oak_leaves": 2,
  "minecraft:pale_oak_log": 0,
  "minecraft:pale_oak_planks": 0,
  "minecraft:pale_oak_pressure_plate": 0,
  "minecraft:pale_oak_sapling": 2,
  "minecraft:pale_oak_shelf": 3,
  "minecraft:pale_oak_slab": 0,
  "minecraft:pale_oak_stairs": 0,
  "minecraft:pale_oak_standing_sign": 0,
  "minecraft:pale_oak_trapdoor": 0,
  "minecraft:pale_oak_wall_sign": 0,
  "minecraft:pale_oak_wood": 0,
  "minecraft:pearlescent_froglight": 75,
  "minecraft:peony": 2,
  "minecraft:petrified_oak_double_slab": 5,
  "minecraft:petrified_oak_slab": 5,
  "minecraft:piglin_head": 5,
  "minecraft:pink_candle": 18,
  "minecraft:pink_candle_cake": 19,
  "minecraft:pink_carpet": 19,
  "minecraft:pink_concrete": 5,
  "minecraft:pink_concrete_powder": 20,
  "minecraft:pink_glazed_terracotta": 5,
  "minecraft:pink_petals": 77,
  "minecraft:pink_shulker_box": 5,
  "minecraft:pink_stained_glass": 16,
  "minecraft:pink_stained_glass_pane": 16,
  "minecraft:pink_terracotta": 5,
  "minecraft:pink_tulip": 2,
  "minecraft:pink_wool": 19,
  "minecraft:piston": 5,
  "minecraft:pitcher_crop": 2,
  "minecraft:pitcher_plant": 2,
  "minecraft:planks": 0,
  "minecraft:player_head": 5,
  "minecraft:podzol": 37,
  "minecraft:pointed_dripstone": 78,
  "minecraft:polished_andesite": 5,
  "minecraft:polished_andesite_double_slab": 5,
  "minecraft:polished_andesite_slab": 5,
  "minecraft:polished_andesite_stairs": 5,
  "minecraft:polished_basalt": 15,
  "minecraft:polished_blackstone": 5,
  "minecraft:polished_blackstone_brick_double_slab": 5,
  "minecraft:polished_blackstone_brick_slab": 5,
  "minecraft:polished_blackstone_brick_stairs": 5,
  "minecraft:polished_blackstone_brick_wall": 5,
  "minecraft:polished_blackstone_bricks": 5,
  "minecraft:polished_blackstone_button": 5,
  "minecraft:polished_blackstone_double_slab": 5,
  "minecraft:polished_blackstone_pressure_plate": 5,
  "minecraft:polished_blackstone_slab": 5,
  "minecraft:polished_blackstone_stairs": 5,
  "minecraft:polished_blackstone_wall": 5,
  "minecraft:polished_deepslate": 38,
  "minecraft:polished_deepslate_double_slab": 38,
  "minecraft:polished_deepslate_slab": 38,
  "minecraft:polished_deepslate_stairs": 38,
  "minecraft:polished_deepslate_wall": 38,
  "minecraft:polished_diorite": 5,
  "minecraft:polished_diorite_double_slab": 5,
  "minecraft:polished_diorite_slab": 5,
  "minecraft:polished_diorite_stairs": 5,
  "minecraft:polished_granite": 5,
  "minecraft:polished_granite_double_slab": 5,
  "minecraft:polished_granite_slab": 5,
  "minecraft:polished_granite_stairs": 5,
  "minecraft:polished_tuff": 79,
  "minecraft:polished_tuff_double_slab": 79,
  "minecraft:polished_tuff_slab": 79,
  "minecraft:polished_tuff_stairs": 79,
  "minecraft:polished_tuff_wall": 79,
  "minecraft:poppy": 2,
  "minecraft:portal": 16,
  "minecraft:potatoes": 2,
  "minecraft:powder_snow": 80,
  "minecraft:powered_comparator": 0,
  "minecraft:powered_repeater": 0,
  "minecraft:prismarine": 5,
  "minecraft:prismarine_brick_double_slab": 5,
  "minecraft:prismarine_brick_slab": 5,
  "minecraft:prismarine_bricks": 5,
  "minecraft:prismarine_bricks_stairs": 5,
  "minecraft:prismarine_double_slab": 5,
  "minecraft:prismarine_slab": 5,
  "minecraft:prismarine_stairs": 5,
  "minecraft:prismarine_wall": 5,
  "minecraft:pumpkin": 0,
  "minecraft:pumpkin_stem": 0,
  "minecraft:purple_candle": 18,
  "minecraft:purple_candle_cake": 19,
  "minecraft:purple_carpet": 19,
  "minecraft:purple_concrete": 5,
  "minecraft:purple_concrete_powder": 20,
  "minecraft:purple_glazed_terracotta": 5,
  "minecraft:purple_shulker_box": 5,
  "minecraft:purple_stained_glass": 16,
  "minecraft:purple_stained_glass_pane": 16,
  "minecraft:purple_terracotta": 5,
  "minecraft:purple_wool": 19,
  "minecraft:purpur_block": 5,
  "minecraft:purpur_double_slab": 5,
  "minecraft:purpur_pillar": 5,
  "minecraft:purpur_slab": 5,
  "minecraft:quartz_block": 5,
  "minecraft:quartz_bricks": 5,
  "minecraft:quartz_double_slab": 5,
  "minecraft:quartz_ore": 70,
  "minecraft:quartz_pillar": 5,
  "minecraft:quartz_slab": 5,
  "minecraft:rail": 4,
  "minecraft:raw_copper_block": 5,
  "minecraft:raw_gold_block": 5,
  "minecraft:raw_iron_block": 5,
  "minecraft:red_candle": 18,
  "minecraft:red_candle_cake": 19,
  "minecraft:red_carpet": 19,
  "minecraft:red_concrete": 5,
  "minecraft:red_concrete_powder": 20,
  "minecraft:red_flower": 2,
  "minecraft:red_glazed_terracotta": 5,
  "minecraft:red_mushroom": 2,
  "minecraft:red_mushroom_block": 0,
  "minecraft:red_nether_brick": 33,
  "minecraft:red_nether_brick_double_slab": 5,
  "minecraft:red_nether_brick_slab": 33,
  "minecraft:red_nether_brick_stairs": 33,
  "minecraft:red_nether_brick_wall": 33,
  "minecraft:red_sand": 20,
  "minecraft:red_sandstone": 5,
  "minecraft:red_sandstone_double_slab": 5,
  "minecraft:red_sandstone_slab": 5,
  "minecraft:red_sandstone_wall": 5,
  "minecraft:red_shulker_box": 5,
  "minecraft:red_stained_glass": 16,
  "minecraft:red_stained_glass_pane": 16,
  "minecraft:red_terracotta": 5,
  "minecraft:red_tulip": 2,
  "minecraft:red_wool": 19,
  "minecraft:redstone_block": 5,
  "minecraft:redstone_lamp": 16,
  "minecraft:redstone_ore": 5,
  "minecraft:redstone_torch": 0,
  "minecraft:reeds": 2,
  "minecraft:reinforced_deepslate": 38,
  "minecraft:repeating_command_block": 4,
  "minecraft:resin_block": 81,
  "minecraft:resin_brick_double_slab": 34,
  "minecraft:resin_brick_slab": 34,
  "minecraft:resin_brick_stairs": 34,
  "minecraft:resin_brick_wall": 34,
  "minecraft:resin_bricks": 34,
  "minecraft:resin_clump": 81,
  "minecraft:respawn_anchor": 4,
  "minecraft:rose_bush": 2,
  "minecraft:sand": 20,
  "minecraft:sandstone": 5,
  "minecraft:sandstone_double_slab": 5,
  "minecraft:sandstone_slab": 5,
  "minecraft:sandstone_wall": 5,
  "minecraft:sapling": 2,
  "minecraft:scaffolding": 82,
  "minecraft:sculk": 83,
  "minecraft:sculk_catalyst": 84,
  "minecraft:sculk_sensor": 24,
  "minecraft:sculk_shrieker": 85,
  "minecraft:sculk_vein": 86,
  "minecraft:seaLantern": 16,
  "minecraft:sea_pickle": 87,
  "minecraft:seagrass": 2,
  "minecraft:short_dry_grass": 2,
  "minecraft:short_grass": 2,
  "minecraft:shroomlight": 88,
  "minecraft:shulker_box": 5,
  "minecraft:silver_glazed_terracotta": 5,
  "minecraft:skeleton_skull": 5,
  "minecraft:skull": 5,
  "minecraft:slime": 87,
  "minecraft:small_amethyst_bud": 89,
  "minecraft:small_dripleaf_block": 17,
  "minecraft:smithing_table": 0,
  "minecraft:smoker": 5,
  "minecraft:smooth_basalt": 15,
  "minecraft:smooth_quartz": 5,
  "minecraft:smooth_quartz_double_slab": 5,
  "minecraft:smooth_quartz_slab": 5,
  "minecraft:smooth_quartz_stairs": 5,
  "minecraft:smooth_red_sandstone": 5,
  "minecraft:smooth_red_sandstone_double_slab": 5,
  "minecraft:smooth_red_sandstone_slab": 5,
  "minecraft:smooth_red_sandstone_stairs": 5,
  "minecraft:smooth_sandstone": 5,
  "minecraft:smooth_sandstone_double_slab": 5,
  "minecraft:smooth_sandstone_slab": 5,
  "minecraft:smooth_sandstone_stairs": 5,
  "minecraft:smooth_stone": 5,
  "minecraft:smooth_stone_double_slab": 5,
  "minecraft:smooth_stone_slab": 5,
  "minecraft:sniffer_egg": 4,
  "minecraft:snow": 90,
  "minecraft:snow_layer": 90,
  "minecraft:soul_campfire": 0,
  "minecraft:soul_fire": 5,
  "minecraft:soul_lantern": 42,
  "minecraft:soul_sand": 91,
  "minecraft:soul_soil": 92,
  "minecraft:soul_torch": 0,
  "minecraft:sponge": 93,
  "minecraft:spore_blossom": 94,
  "minecraft:spruce_button": 0,
  "minecraft:spruce_door": 0,
  "minecraft:spruce_double_slab": 0,
  "minecraft:spruce_fence": 0,
  "minecraft:spruce_fence_gate": 0,
  "minecraft:spruce_hanging_sign": 1,
  "minecraft:spruce_leaves": 2,
  "minecraft:spruce_log": 0,
  "minecraft:spruce_planks": 0,
  "minecraft:spruce_pressure_plate": 0,
  "minecraft:spruce_sapling": 2,
  "minecraft:spruce_shelf": 3,
  "minecraft:spruce_slab": 0,
  "minecraft:spruce_stairs": 0,
  "minecraft:spruce_standing_sign": 0,
  "minecraft:spruce_trapdoor": 0,
  "minecraft:spruce_wall_sign": 0,
  "minecraft:spruce_wood": 0,
  "minecraft:stained_glass": 16,
  "minecraft:stained_glass_pane": 16,
  "minecraft:stained_hardened_clay": 5,
  "minecraft:standing_banner": 0,
  "minecraft:standing_sign": 0,
  "minecraft:sticky_piston": 5,
  "minecraft:stone": 5,
  "minecraft:stone_brick_double_slab": 5,
  "minecraft:stone_brick_slab": 5,
  "minecraft:stone_brick_wall": 5,
  "minecraft:stone_bricks": 5,
  "minecraft:stone_button": 5,
  "minecraft:stone_pressure_plate": 5,
  "minecraft:stone_slab": 5,
  "minecraft:stone_slab2": 5,
  "minecraft:stone_slab3": 5,
  "minecraft:stone_slab4": 5,
  "minecraft:stonebrick": 5,
  "minecraft:stonecutter": 5,
  "minecraft:stonecutter_block": 5,
  "minecraft:stripped_acacia_log": 0,
  "minecraft:stripped_acacia_wood": 0,
  "minecraft:stripped_bamboo_block": 12,
  "minecraft:stripped_birch_log": 0,
  "minecraft:stripped_birch_wood": 0,
  "minecraft:stripped_cherry_log": 27,
  "minecraft:stripped_cherry_wood": 27,
  "minecraft:stripped_crimson_hyphae": 47,
  "minecraft:stripped_crimson_stem": 47,
  "minecraft:stripped_dark_oak_log": 0,
  "minecraft:stripped_dark_oak_wood": 0,
  "minecraft:stripped_jungle_log": 0,
  "minecraft:stripped_jungle_wood": 0,
  "minecraft:stripped_mangrove_log": 0,
  "minecraft:stripped_mangrove_wood": 0,
  "minecraft:stripped_oak_log": 0,
  "minecraft:stripped_oak_wood": 0,
  "minecraft:stripped_pale_oak_log": 0,
  "minecraft:stripped_pale_oak_wood": 0,
  "minecraft:stripped_spruce_log": 0,
  "minecraft:stripped_spruce_wood": 0,
  "minecraft:stripped_warped_hyphae": 47,
  "minecraft:stripped_warped_stem": 47,
  "minecraft:sunflower": 2,
  "minecraft:suspicious_gravel": 95,
  "minecraft:suspicious_sand": 96,
  "minecraft:sweet_berry_bush": 53,
  "minecraft:tall_dry_grass": 2,
  "minecraft:tall_grass": 2,
  "minecraft:tallgrass": 2,
  "minecraft:target": 2,
  "minecraft:tinted_glass": 16,
  "minecraft:tnt": 2,
  "minecraft:torch": 0,
  "minecraft:torchflower": 2,
  "minecraft:torchflower_crop": 2,
  "minecraft:trapdoor": 0,
  "minecraft:trapped_chest": 0,
  "minecraft:trial_spawner": 97,
  "minecraft:tube_coral": 5,
  "minecraft:tube_coral_block": 5,
  "minecraft:tube_coral_fan": 5,
  "minecraft:tube_coral_wall_fan": 5,
  "minecraft:tuff": 35,
  "minecraft:tuff_brick_double_slab": 36,
  "minecraft:tuff_brick_slab": 36,
  "minecraft:tuff_brick_stairs": 36,
  "minecraft:tuff_brick_wall": 36,
  "minecraft:tuff_bricks": 36,
  "minecraft:tuff_double_slab": 35,
  "minecraft:tuff_slab": 35,
  "minecraft:tuff_stairs": 35,
  "minecraft:tuff_wall": 35,
  "minecraft:twisting_vines": 98,
  "minecraft:undyed_shulker_box": 5,
  "minecraft:unlit_redstone_torch": 0,
  "minecraft:unpowered_comparator": 0,
  "minecraft:unpowered_repeater": 0,
  "minecraft:vault": 99,
  "minecraft:verdant_froglight": 75,
  "minecraft:vine": 100,
  "minecraft:wall_banner": 0,
  "minecraft:wall_sign": 0,
  "minecraft:warped_button": 44,
  "minecraft:warped_door": 44,
  "minecraft:warped_double_slab": 44,
  "minecraft:warped_fence": 44,
  "minecraft:warped_fence_gate": 44,
  "minecraft:warped_fungus": 45,
  "minecraft:warped_hanging_sign": 46,
  "minecraft:warped_hyphae": 47,
  "minecraft:warped_nylium": 48,
  "minecraft:warped_planks": 44,
  "minecraft:warped_pressure_plate": 44,
  "minecraft:warped_roots": 49,
  "minecraft:warped_shelf": 3,
  "minecraft:warped_slab": 44,
  "minecraft:warped_stairs": 44,
  "minecraft:warped_standing_sign": 44,
  "minecraft:warped_stem": 47,
  "minecraft:warped_trapdoor": 44,
  "minecraft:warped_wall_sign": 44,
  "minecraft:warped_wart_block": 72,
  "minecraft:waterlily": 2,
  "minecraft:waxed_chiseled_copper": 31,
  "minecraft:waxed_copper": 31,
  "minecraft:waxed_copper_bars": 31,
  "minecraft:waxed_copper_bulb": 39,
  "minecraft:waxed_copper_chain": 26,
  "minecraft:waxed_copper_chest": 31,
  "minecraft:waxed_copper_door": 31,
  "minecraft:waxed_copper_golem_statue": 40,
  "minecraft:waxed_copper_grate": 41,
  "minecraft:waxed_copper_lantern": 42,
  "minecraft:waxed_copper_trapdoor": 31,
  "minecraft:waxed_cut_copper": 31,
  "minecraft:waxed_cut_copper_slab": 31,
  "minecraft:waxed_cut_copper_stairs": 31,
  "minecraft:waxed_double_cut_copper_slab": 31,
  "minecraft:waxed_exposed_chiseled_copper": 31,
  "minecraft:waxed_exposed_copper": 31,
  "minecraft:waxed_exposed_copper_bars": 31,
  "minecraft:waxed_exposed_copper_bulb": 39,
  "minecraft:waxed_exposed_copper_chain": 26,
  "minecraft:waxed_exposed_copper_chest": 31,
  "minecraft:waxed_exposed_copper_door": 31,
  "minecraft:waxed_exposed_copper_golem_statue": 40,
  "minecraft:waxed_exposed_copper_grate": 41,
  "minecraft:waxed_exposed_copper_lantern": 42,
  "minecraft:waxed_exposed_copper_trapdoor": 31,
  "minecraft:waxed_exposed_cut_copper": 31,
  "minecraft:waxed_exposed_cut_copper_slab": 31,
  "minecraft:waxed_exposed_cut_copper_stairs": 31,
  "minecraft:waxed_exposed_double_cut_copper_slab": 31,
  "minecraft:waxed_exposed_lightning_rod": 31,
  "minecraft:waxed_lightning_rod": 31,
  "minecraft:waxed_oxidized_chiseled_copper": 31,
  "minecraft:waxed_oxidized_copper": 31,
  "minecraft:waxed_oxidized_copper_bars": 31,
  "minecraft:waxed_oxidized_copper_bulb": 39,
  "minecraft:waxed_oxidized_copper_chain": 26,
  "minecraft:waxed_oxidized_copper_chest": 31,
  "minecraft:waxed_oxidized_copper_door": 31,
  "minecraft:waxed_oxidized_copper_golem_statue": 40,
  "minecraft:waxed_oxidized_copper_grate": 41,
  "minecraft:waxed_oxidized_copper_lantern": 42,
  "minecraft:waxed_oxidized_copper_trapdoor": 31,
  "minecraft:waxed_oxidized_cut_copper": 31,
  "minecraft:waxed_oxidized_cut_copper_slab": 31,
  "minecraft:waxed_oxidized_cut_copper_stairs": 31,
  "minecraft:waxed_oxidized_double_cut_copper_slab": 31,
  "minecraft:waxed_oxidized_lightning_rod": 31,
  "minecraft:waxed_weathered_chiseled_copper": 31,
  "minecraft:waxed_weathered_copper": 31,
  "minecraft:waxed_weathered_copper_bars": 31,
  "minecraft:waxed_weathered_copper_bulb": 39,
  "minecraft:waxed_weathered_copper_chain": 26,
  "minecraft:waxed_weathered_copper_chest": 31,
  "minecraft:waxed_weathered_copper_door": 31,
  "minecraft:waxed_weathered_copper_golem_statue": 40,
  "minecraft:waxed_weathered_copper_grate": 41,
  "minecraft:waxed_weathered_copper_lantern": 42,
  "minecraft:waxed_weathered_copper_trapdoor": 31,
  "minecraft:waxed_weathered_cut_copper": 31,
  "minecraft:waxed_weathered_cut_copper_slab": 31,
  "minecraft:waxed_weathered_cut_copper_stairs": 31,
  "minecraft:waxed_weathered_double_cut_copper_slab": 31,
  "minecraft:waxed_weathered_lightning_rod": 31,
  "minecraft:weathered_chiseled_copper": 31,
  "minecraft:weathered_copper": 31,
  "minecraft:weathered_copper_bars": 31,
  "minecraft:weathered_copper_bulb": 39,
  "minecraft:weathered_copper_chain": 26,
  "minecraft:weathered_copper_chest": 31,
  "minecraft:weathered_copper_door": 31,
  "minecraft:weathered_copper_golem_statue": 40,
  "minecraft:weathered_copper_grate": 41,
  "minecraft:weathered_copper_lantern": 42,
  "minecraft:weathered_copper_trapdoor": 31,
  "minecraft:weathered_cut_copper": 31,
  "minecraft:weathered_cut_copper_slab": 31,
  "minecraft:weathered_cut_copper_stairs": 31,
  "minecraft:weathered_double_cut_copper_slab": 31,
  "minecraft:weathered_lightning_rod": 31,
  "minecraft:web": 101,
  "minecraft:weeping_vines": 98,
  "minecraft:wet_sponge": 102,
  "minecraft:wheat": 2,
  "minecraft:white_candle": 18,
  "minecraft:white_candle_cake": 19,
  "minecraft:white_carpet": 19,
  "minecraft:white_concrete": 5,
  "minecraft:white_concrete_powder": 20,
  "minecraft:white_glazed_terracotta": 5,
  "minecraft:white_shulker_box": 5,
  "minecraft:white_stained_glass": 16,
  "minecraft:white_stained_glass_pane": 16,
  "minecraft:white_terracotta": 5,
  "minecraft:white_tulip": 2,
  "minecraft:white_wool": 19,
  "minecraft:wildflowers": 77,
  "minecraft:wither_rose": 2,
  "minecraft:wither_skeleton_skull": 5,
  "minecraft:wood": 0,
  "minecraft:wooden_button": 0,
  "minecraft:wooden_door": 0,
  "minecraft:wooden_pressure_plate": 0,
  "minecraft:wooden_slab": 0,
  "minecraft:wool": 19,
  "minecraft:yellow_candle": 18,
  "minecraft:yellow_candle_cake": 19,
  "minecraft:yellow_carpet": 19,
  "minecraft:yellow_concrete": 5,
  "minecraft:yellow_concrete_powder": 20,
  "minecraft:yellow_flower": 2,
  "minecraft:yellow_glazed_terracotta": 5,
  "minecraft:yellow_shulker_box": 5,
  "minecraft:yellow_stained_glass": 16,
  "minecraft:yellow_stained_glass_pane": 16,
  "minecraft:yellow_terracotta": 5,
  "minecraft:yellow_wool": 19,
  "minecraft:zombie_head": 5
};
var VANILLA_BLOCK_PLACE_SOUND_EVENTS = [
  [
    "place.wood",
    0.8,
    0.8,
    1,
    1
  ],
  [
    "place.hanging_sign",
    0.8,
    1,
    1,
    1
  ],
  [
    "place.grass",
    0.8,
    1,
    0.8,
    0.8
  ],
  [
    "place.chiseled_bookshelf",
    1,
    1,
    1,
    1
  ],
  [
    "place.stone",
    1.7999999999999998,
    1.875,
    1,
    1
  ],
  [
    "place.stone",
    0.8,
    1,
    1,
    1
  ],
  [
    "place.amethyst_block",
    0.8,
    0.8,
    1,
    1
  ],
  [
    "place.amethyst_cluster",
    1,
    1,
    1,
    1
  ],
  [
    "place.ancient_debris",
    0.8,
    1,
    1,
    1
  ],
  [
    "random.anvil_land",
    0.8,
    1,
    0.5,
    0.5
  ],
  [
    "place.azalea",
    0.8,
    1,
    1,
    1
  ],
  [
    "place.azalea_leaves",
    0.8,
    1,
    1,
    1
  ],
  [
    "block.bamboo.place",
    0.8,
    1,
    1,
    1
  ],
  [
    "place.bamboo_wood",
    0.8,
    0.8,
    1,
    1
  ],
  [
    "place.bamboo_wood_hanging_sign",
    0.8,
    1,
    1,
    1
  ],
  [
    "block.bamboo_sapling.place",
    0.8,
    1,
    1,
    1
  ],
  [
    "place.basalt",
    0.8,
    1,
    1,
    1
  ],
  [
    "place.big_dripleaf",
    0.8,
    1,
    1,
    1
  ],
  [
    "place.candle",
    1,
    1,
    1,
    1
  ],
  [
    "place.cloth",
    0.8,
    1,
    1,
    1
  ],
  [
    "place.sand",
    0.8,
    1,
    1,
    1
  ],
  [
    "place.bone_block",
    0.8,
    1,
    1,
    1
  ],
  [
    "block.cactus_flower.place",
    0.8,
    0.8,
    1,
    1
  ],
  [
    "place.calcite",
    1,
    1,
    1,
    1
  ],
  [
    "place.sculk_sensor",
    0.8,
    1,
    0.8,
    0.8
  ],
  [
    "place.cave_vines",
    0.8,
    1,
    1,
    1
  ],
  [
    "place.chain",
    0.8,
    1,
    1,
    1
  ],
  [
    "place.cherry_wood",
    0.8,
    0.8,
    1,
    1
  ],
  [
    "place.cherry_wood_hanging_sign",
    0.8,
    1,
    1,
    1
  ],
  [
    "place.cherry_leaves",
    1,
    1,
    1,
    1
  ],
  [
    "place.copper",
    0.8,
    1,
    1,
    1
  ],
  [
    "place.deepslate_bricks",
    0.8,
    1,
    1,
    1
  ],
  [
    "place.nether_brick",
    0.8,
    1,
    1,
    1
  ],
  [
    "block.resin_brick.place",
    0.8,
    0.8,
    1,
    1
  ],
  [
    "place.tuff",
    0.8,
    0.8,
    1,
    1
  ],
  [
    "place.tuff_bricks",
    0.8,
    0.8,
    1,
    1
  ],
  [
    "place.gravel",
    0.8,
    1,
    1,
    1
  ],
  [
    "place.deepslate",
    0.8,
    1,
    1,
    1
  ],
  [
    "place.copper_bulb",
    0.8,
    0.8,
    1,
    1
  ],
  [
    "block.copper_golem_statue.place",
    1,
    1,
    1,
    1
  ],
  [
    "place.copper_grate",
    0.8,
    0.8,
    1,
    1
  ],
  [
    "block.lantern.place",
    0.8,
    1,
    1,
    1
  ],
  [
    "block.creaking_heart.place",
    0.8,
    0.8,
    0.7,
    0.7
  ],
  [
    "place.nether_wood",
    0.8,
    0.8,
    1,
    1
  ],
  [
    "place.fungus",
    0.7200000000000001,
    0.9,
    0.85,
    0.85
  ],
  [
    "place.nether_wood_hanging_sign",
    0.8,
    1,
    1,
    1
  ],
  [
    "place.stem",
    0.8,
    1,
    1,
    1
  ],
  [
    "place.nylium",
    0.8,
    0.8,
    1,
    1
  ],
  [
    "place.roots",
    0.8,
    1,
    1,
    1
  ],
  [
    "place.decorated_pot",
    1,
    1,
    1,
    1
  ],
  [
    "place.hanging_roots",
    0.8,
    1,
    1,
    1
  ],
  [
    "block.dried_ghast.place",
    0.96,
    0.96,
    0.8,
    0.8
  ],
  [
    "place.dripstone_block",
    1,
    1,
    1,
    1
  ],
  [
    "block.sweet_berry_bush.place",
    0.8,
    1,
    1,
    1
  ],
  [
    "block.itemframe.place",
    0.8,
    1,
    1,
    1
  ],
  [
    "place.frog_spawn",
    1.5,
    1.5,
    0.2,
    0.2
  ],
  [
    "place.heavy_core",
    0.8,
    0.8,
    1,
    1
  ],
  [
    "place.iron",
    0.8,
    0.8,
    1,
    1
  ],
  [
    "place.honey_block",
    0.8,
    1,
    1,
    1
  ],
  [
    "place.coral",
    0.8,
    1,
    1,
    1
  ],
  [
    "place.wood",
    0.8,
    1,
    1,
    1
  ],
  [
    "place.large_amethyst_bud",
    1,
    1,
    1,
    1
  ],
  [
    "block.leaf_litter.place",
    0.8,
    0.8,
    1,
    1
  ],
  [
    "place.lodestone",
    0.8,
    1,
    1,
    1
  ],
  [
    "block.mangrove_roots.place",
    1,
    1.2,
    0.25,
    0.25
  ],
  [
    "place.medium_amethyst_bud",
    1,
    1,
    1,
    1
  ],
  [
    "block.mob_spawner.place",
    0.8,
    0.8,
    1,
    1
  ],
  [
    "place.moss",
    1,
    1,
    0.93,
    0.93
  ],
  [
    "place.moss",
    1.1,
    1.1,
    0.8370000000000001,
    0.8370000000000001
  ],
  [
    "block.mud.place",
    0.8,
    1,
    0.25,
    0.25
  ],
  [
    "block.mud_bricks.place",
    0.6,
    0.8,
    0.3,
    0.3
  ],
  [
    "block.muddy_mangrove_roots.place",
    0.8,
    1,
    0.25,
    0.25
  ],
  [
    "place.nether_gold_ore",
    0.8,
    1,
    1,
    1
  ],
  [
    "place.nether_sprouts",
    1.7999999999999998,
    1.875,
    1,
    1
  ],
  [
    "place.nether_wart",
    0.8,
    1,
    0.7,
    0.7
  ],
  [
    "place.netherite",
    0.8,
    1,
    1,
    1
  ],
  [
    "place.netherrack",
    0.8,
    1,
    1,
    1
  ],
  [
    "place.froglight",
    1,
    1,
    1,
    1
  ],
  [
    "block.packed_mud.place",
    0.8,
    1,
    0.25,
    0.25
  ],
  [
    "place.pink_petals",
    1,
    1,
    1,
    1
  ],
  [
    "place.pointed_dripstone",
    1,
    1,
    1,
    1
  ],
  [
    "place.tuff",
    1.152,
    1.152,
    1,
    1
  ],
  [
    "place.powder_snow",
    0.8,
    1,
    1,
    1
  ],
  [
    "block.resin.place",
    0.8,
    0.8,
    1,
    1
  ],
  [
    "block.scaffolding.place",
    0.8,
    0.9,
    1,
    1
  ],
  [
    "place.sculk",
    0.8,
    1,
    1,
    1
  ],
  [
    "place.sculk_catalyst",
    0.8,
    1,
    1,
    1
  ],
  [
    "place.sculk_shrieker",
    0.8,
    1,
    1,
    1
  ],
  [
    "place.sculk_vein",
    0.8,
    1,
    1,
    1
  ],
  [
    "place.slime.big",
    0.8,
    1,
    1,
    1
  ],
  [
    "place.shroomlight",
    0.8,
    1,
    1,
    1
  ],
  [
    "place.small_amethyst_bud",
    1,
    1,
    1,
    1
  ],
  [
    "place.snow",
    0.8,
    1,
    1,
    1
  ],
  [
    "place.soul_sand",
    0.8,
    1,
    1,
    1
  ],
  [
    "place.soul_soil",
    0.8,
    1,
    1,
    1
  ],
  [
    "place.sponge",
    0.8,
    0.8,
    1,
    1
  ],
  [
    "place.spore_blossom",
    0.8,
    1,
    1,
    1
  ],
  [
    "place.suspicious_gravel",
    0.8,
    1,
    1,
    1
  ],
  [
    "place.suspicious_sand",
    0.8,
    1,
    1,
    1
  ],
  [
    "trial_spawner.place",
    0.8,
    0.8,
    1,
    1
  ],
  [
    "place.stone",
    0.7200000000000001,
    0.9,
    0.85,
    0.85
  ],
  [
    "block.weeping_vines.place",
    0.8,
    1,
    1,
    1
  ],
  [
    "vault.place",
    0.8,
    0.8,
    1,
    1
  ],
  [
    "place.vines",
    0.8,
    1,
    1,
    1
  ],
  [
    "place.web",
    1,
    1,
    1,
    1
  ],
  [
    "place.wet_sponge",
    0.8,
    0.8,
    1,
    1
  ]
];
var VANILLA_BLOCK_PLACE_SOUND_EVENT_INDICES = {
  "minecraft:acacia_button": 0,
  "minecraft:acacia_door": 0,
  "minecraft:acacia_double_slab": 0,
  "minecraft:acacia_fence": 0,
  "minecraft:acacia_fence_gate": 0,
  "minecraft:acacia_hanging_sign": 1,
  "minecraft:acacia_leaves": 2,
  "minecraft:acacia_log": 0,
  "minecraft:acacia_planks": 0,
  "minecraft:acacia_pressure_plate": 0,
  "minecraft:acacia_sapling": 2,
  "minecraft:acacia_shelf": 3,
  "minecraft:acacia_slab": 0,
  "minecraft:acacia_stairs": 0,
  "minecraft:acacia_standing_sign": 0,
  "minecraft:acacia_trapdoor": 0,
  "minecraft:acacia_wall_sign": 0,
  "minecraft:acacia_wood": 0,
  "minecraft:activator_rail": 4,
  "minecraft:allium": 2,
  "minecraft:allow": 5,
  "minecraft:amethyst_block": 6,
  "minecraft:amethyst_cluster": 7,
  "minecraft:ancient_debris": 8,
  "minecraft:andesite": 5,
  "minecraft:andesite_double_slab": 5,
  "minecraft:andesite_slab": 5,
  "minecraft:andesite_stairs": 5,
  "minecraft:andesite_wall": 5,
  "minecraft:anvil": 9,
  "minecraft:azalea": 10,
  "minecraft:azalea_leaves": 11,
  "minecraft:azalea_leaves_flowered": 11,
  "minecraft:azure_bluet": 2,
  "minecraft:bamboo": 12,
  "minecraft:bamboo_block": 13,
  "minecraft:bamboo_button": 13,
  "minecraft:bamboo_door": 13,
  "minecraft:bamboo_double_slab": 13,
  "minecraft:bamboo_fence": 13,
  "minecraft:bamboo_fence_gate": 13,
  "minecraft:bamboo_hanging_sign": 14,
  "minecraft:bamboo_mosaic": 13,
  "minecraft:bamboo_mosaic_double_slab": 13,
  "minecraft:bamboo_mosaic_slab": 13,
  "minecraft:bamboo_mosaic_stairs": 13,
  "minecraft:bamboo_planks": 13,
  "minecraft:bamboo_pressure_plate": 13,
  "minecraft:bamboo_sapling": 15,
  "minecraft:bamboo_shelf": 3,
  "minecraft:bamboo_slab": 13,
  "minecraft:bamboo_stairs": 13,
  "minecraft:bamboo_standing_sign": 13,
  "minecraft:bamboo_trapdoor": 13,
  "minecraft:bamboo_wall_sign": 13,
  "minecraft:barrel": 0,
  "minecraft:basalt": 16,
  "minecraft:beacon": 5,
  "minecraft:bed": 0,
  "minecraft:bedrock": 5,
  "minecraft:beetroot": 0,
  "minecraft:bell": 4,
  "minecraft:big_dripleaf": 17,
  "minecraft:birch_button": 0,
  "minecraft:birch_door": 0,
  "minecraft:birch_double_slab": 0,
  "minecraft:birch_fence": 0,
  "minecraft:birch_fence_gate": 0,
  "minecraft:birch_hanging_sign": 1,
  "minecraft:birch_leaves": 2,
  "minecraft:birch_log": 0,
  "minecraft:birch_planks": 0,
  "minecraft:birch_pressure_plate": 0,
  "minecraft:birch_sapling": 2,
  "minecraft:birch_shelf": 3,
  "minecraft:birch_slab": 0,
  "minecraft:birch_stairs": 0,
  "minecraft:birch_standing_sign": 0,
  "minecraft:birch_trapdoor": 0,
  "minecraft:birch_wall_sign": 0,
  "minecraft:birch_wood": 0,
  "minecraft:black_candle": 18,
  "minecraft:black_candle_cake": 19,
  "minecraft:black_carpet": 19,
  "minecraft:black_concrete": 5,
  "minecraft:black_concrete_powder": 20,
  "minecraft:black_glazed_terracotta": 5,
  "minecraft:black_shulker_box": 5,
  "minecraft:black_stained_glass": 5,
  "minecraft:black_stained_glass_pane": 5,
  "minecraft:black_terracotta": 5,
  "minecraft:black_wool": 19,
  "minecraft:blackstone": 5,
  "minecraft:blackstone_double_slab": 5,
  "minecraft:blackstone_slab": 5,
  "minecraft:blackstone_stairs": 5,
  "minecraft:blackstone_wall": 5,
  "minecraft:blast_furnace": 5,
  "minecraft:blue_candle": 18,
  "minecraft:blue_candle_cake": 19,
  "minecraft:blue_carpet": 19,
  "minecraft:blue_concrete": 5,
  "minecraft:blue_concrete_powder": 20,
  "minecraft:blue_glazed_terracotta": 5,
  "minecraft:blue_ice": 5,
  "minecraft:blue_orchid": 2,
  "minecraft:blue_shulker_box": 5,
  "minecraft:blue_stained_glass": 5,
  "minecraft:blue_stained_glass_pane": 5,
  "minecraft:blue_terracotta": 5,
  "minecraft:blue_wool": 19,
  "minecraft:bone_block": 21,
  "minecraft:bookshelf": 0,
  "minecraft:border_block": 5,
  "minecraft:brain_coral": 5,
  "minecraft:brain_coral_block": 5,
  "minecraft:brain_coral_fan": 5,
  "minecraft:brain_coral_wall_fan": 5,
  "minecraft:brewing_stand": 5,
  "minecraft:brick_double_slab": 5,
  "minecraft:brick_slab": 5,
  "minecraft:brick_wall": 5,
  "minecraft:brown_candle": 18,
  "minecraft:brown_candle_cake": 19,
  "minecraft:brown_carpet": 19,
  "minecraft:brown_concrete": 5,
  "minecraft:brown_concrete_powder": 20,
  "minecraft:brown_glazed_terracotta": 5,
  "minecraft:brown_mushroom": 2,
  "minecraft:brown_mushroom_block": 0,
  "minecraft:brown_shulker_box": 5,
  "minecraft:brown_stained_glass": 5,
  "minecraft:brown_stained_glass_pane": 5,
  "minecraft:brown_terracotta": 5,
  "minecraft:brown_wool": 19,
  "minecraft:bubble_coral": 5,
  "minecraft:bubble_coral_block": 5,
  "minecraft:bubble_coral_fan": 5,
  "minecraft:bubble_coral_wall_fan": 5,
  "minecraft:budding_amethyst": 6,
  "minecraft:bush": 2,
  "minecraft:cactus": 19,
  "minecraft:cactus_flower": 22,
  "minecraft:cake": 19,
  "minecraft:calcite": 23,
  "minecraft:calibrated_sculk_sensor": 24,
  "minecraft:campfire": 0,
  "minecraft:candle": 18,
  "minecraft:candle_cake": 19,
  "minecraft:carpet": 19,
  "minecraft:carrots": 2,
  "minecraft:cartography_table": 0,
  "minecraft:carved_pumpkin": 0,
  "minecraft:cave_vines": 25,
  "minecraft:cave_vines_body_with_berries": 25,
  "minecraft:cave_vines_head_with_berries": 25,
  "minecraft:chain": 26,
  "minecraft:chain_command_block": 4,
  "minecraft:cherry_button": 27,
  "minecraft:cherry_door": 27,
  "minecraft:cherry_double_slab": 27,
  "minecraft:cherry_fence": 27,
  "minecraft:cherry_fence_gate": 27,
  "minecraft:cherry_hanging_sign": 28,
  "minecraft:cherry_leaves": 29,
  "minecraft:cherry_log": 27,
  "minecraft:cherry_planks": 27,
  "minecraft:cherry_pressure_plate": 27,
  "minecraft:cherry_sapling": 15,
  "minecraft:cherry_shelf": 3,
  "minecraft:cherry_slab": 27,
  "minecraft:cherry_stairs": 27,
  "minecraft:cherry_standing_sign": 27,
  "minecraft:cherry_trapdoor": 27,
  "minecraft:cherry_wall_sign": 27,
  "minecraft:cherry_wood": 27,
  "minecraft:chest": 0,
  "minecraft:chipped_anvil": 9,
  "minecraft:chiseled_bookshelf": 3,
  "minecraft:chiseled_copper": 30,
  "minecraft:chiseled_deepslate": 31,
  "minecraft:chiseled_nether_bricks": 32,
  "minecraft:chiseled_polished_blackstone": 5,
  "minecraft:chiseled_quartz_block": 5,
  "minecraft:chiseled_red_sandstone": 5,
  "minecraft:chiseled_resin_bricks": 33,
  "minecraft:chiseled_sandstone": 5,
  "minecraft:chiseled_stone_bricks": 5,
  "minecraft:chiseled_tuff": 34,
  "minecraft:chiseled_tuff_bricks": 35,
  "minecraft:chorus_flower": 5,
  "minecraft:chorus_plant": 5,
  "minecraft:clay": 36,
  "minecraft:closed_eyeblossom": 2,
  "minecraft:coal_block": 5,
  "minecraft:coal_ore": 5,
  "minecraft:coarse_dirt": 36,
  "minecraft:cobbled_deepslate": 37,
  "minecraft:cobbled_deepslate_double_slab": 37,
  "minecraft:cobbled_deepslate_slab": 37,
  "minecraft:cobbled_deepslate_stairs": 37,
  "minecraft:cobbled_deepslate_wall": 37,
  "minecraft:cobblestone": 5,
  "minecraft:cobblestone_double_slab": 5,
  "minecraft:cobblestone_slab": 5,
  "minecraft:cobblestone_wall": 5,
  "minecraft:cocoa": 0,
  "minecraft:command_block": 4,
  "minecraft:composter": 0,
  "minecraft:concrete": 5,
  "minecraft:concretePowder": 20,
  "minecraft:conduit": 5,
  "minecraft:copper_bars": 30,
  "minecraft:copper_block": 30,
  "minecraft:copper_bulb": 38,
  "minecraft:copper_chain": 26,
  "minecraft:copper_chest": 30,
  "minecraft:copper_door": 30,
  "minecraft:copper_golem_statue": 39,
  "minecraft:copper_grate": 40,
  "minecraft:copper_lantern": 41,
  "minecraft:copper_ore": 5,
  "minecraft:copper_torch": 0,
  "minecraft:copper_trapdoor": 30,
  "minecraft:coral": 5,
  "minecraft:coral_fan": 5,
  "minecraft:coral_fan_dead": 5,
  "minecraft:coral_fan_hang": 5,
  "minecraft:coral_fan_hang2": 5,
  "minecraft:coral_fan_hang3": 5,
  "minecraft:cornflower": 2,
  "minecraft:cracked_deepslate_bricks": 31,
  "minecraft:cracked_deepslate_tiles": 31,
  "minecraft:cracked_nether_bricks": 32,
  "minecraft:cracked_polished_blackstone_bricks": 5,
  "minecraft:cracked_stone_bricks": 5,
  "minecraft:crafter": 5,
  "minecraft:crafting_table": 0,
  "minecraft:creaking_heart": 42,
  "minecraft:creeper_head": 5,
  "minecraft:crimson_button": 43,
  "minecraft:crimson_door": 43,
  "minecraft:crimson_double_slab": 43,
  "minecraft:crimson_fence": 43,
  "minecraft:crimson_fence_gate": 43,
  "minecraft:crimson_fungus": 44,
  "minecraft:crimson_hanging_sign": 45,
  "minecraft:crimson_hyphae": 46,
  "minecraft:crimson_nylium": 47,
  "minecraft:crimson_planks": 43,
  "minecraft:crimson_pressure_plate": 43,
  "minecraft:crimson_roots": 48,
  "minecraft:crimson_shelf": 3,
  "minecraft:crimson_slab": 43,
  "minecraft:crimson_stairs": 43,
  "minecraft:crimson_standing_sign": 43,
  "minecraft:crimson_stem": 46,
  "minecraft:crimson_trapdoor": 43,
  "minecraft:crimson_wall_sign": 43,
  "minecraft:crying_obsidian": 5,
  "minecraft:cut_copper": 30,
  "minecraft:cut_copper_slab": 30,
  "minecraft:cut_copper_stairs": 30,
  "minecraft:cut_red_sandstone": 5,
  "minecraft:cut_red_sandstone_double_slab": 5,
  "minecraft:cut_red_sandstone_slab": 5,
  "minecraft:cut_sandstone": 5,
  "minecraft:cut_sandstone_double_slab": 5,
  "minecraft:cut_sandstone_slab": 5,
  "minecraft:cyan_candle": 18,
  "minecraft:cyan_candle_cake": 19,
  "minecraft:cyan_carpet": 19,
  "minecraft:cyan_concrete": 5,
  "minecraft:cyan_concrete_powder": 20,
  "minecraft:cyan_glazed_terracotta": 5,
  "minecraft:cyan_shulker_box": 5,
  "minecraft:cyan_stained_glass": 5,
  "minecraft:cyan_stained_glass_pane": 5,
  "minecraft:cyan_terracotta": 5,
  "minecraft:cyan_wool": 19,
  "minecraft:damaged_anvil": 9,
  "minecraft:dandelion": 2,
  "minecraft:dark_oak_button": 0,
  "minecraft:dark_oak_door": 0,
  "minecraft:dark_oak_double_slab": 0,
  "minecraft:dark_oak_fence": 0,
  "minecraft:dark_oak_fence_gate": 0,
  "minecraft:dark_oak_hanging_sign": 1,
  "minecraft:dark_oak_leaves": 2,
  "minecraft:dark_oak_log": 0,
  "minecraft:dark_oak_planks": 0,
  "minecraft:dark_oak_pressure_plate": 0,
  "minecraft:dark_oak_sapling": 2,
  "minecraft:dark_oak_shelf": 3,
  "minecraft:dark_oak_slab": 0,
  "minecraft:dark_oak_stairs": 0,
  "minecraft:dark_oak_trapdoor": 0,
  "minecraft:dark_oak_wood": 0,
  "minecraft:dark_prismarine": 5,
  "minecraft:dark_prismarine_double_slab": 5,
  "minecraft:dark_prismarine_slab": 5,
  "minecraft:dark_prismarine_stairs": 5,
  "minecraft:darkoak_standing_sign": 0,
  "minecraft:darkoak_wall_sign": 0,
  "minecraft:daylight_detector": 0,
  "minecraft:daylight_detector_inverted": 0,
  "minecraft:dead_brain_coral": 5,
  "minecraft:dead_brain_coral_block": 5,
  "minecraft:dead_brain_coral_fan": 5,
  "minecraft:dead_brain_coral_wall_fan": 5,
  "minecraft:dead_bubble_coral": 5,
  "minecraft:dead_bubble_coral_block": 5,
  "minecraft:dead_bubble_coral_fan": 5,
  "minecraft:dead_bubble_coral_wall_fan": 5,
  "minecraft:dead_fire_coral": 5,
  "minecraft:dead_fire_coral_block": 5,
  "minecraft:dead_fire_coral_fan": 5,
  "minecraft:dead_fire_coral_wall_fan": 5,
  "minecraft:dead_horn_coral": 5,
  "minecraft:dead_horn_coral_block": 5,
  "minecraft:dead_horn_coral_fan": 5,
  "minecraft:dead_horn_coral_wall_fan": 5,
  "minecraft:dead_tube_coral": 5,
  "minecraft:dead_tube_coral_block": 5,
  "minecraft:dead_tube_coral_fan": 5,
  "minecraft:dead_tube_coral_wall_fan": 5,
  "minecraft:deadbush": 2,
  "minecraft:decorated_pot": 49,
  "minecraft:deepslate": 37,
  "minecraft:deepslate_brick_double_slab": 31,
  "minecraft:deepslate_brick_slab": 31,
  "minecraft:deepslate_brick_stairs": 31,
  "minecraft:deepslate_brick_wall": 31,
  "minecraft:deepslate_bricks": 31,
  "minecraft:deepslate_coal_ore": 37,
  "minecraft:deepslate_copper_ore": 37,
  "minecraft:deepslate_diamond_ore": 37,
  "minecraft:deepslate_emerald_ore": 37,
  "minecraft:deepslate_gold_ore": 37,
  "minecraft:deepslate_iron_ore": 37,
  "minecraft:deepslate_lapis_ore": 37,
  "minecraft:deepslate_redstone_ore": 37,
  "minecraft:deepslate_tile_double_slab": 31,
  "minecraft:deepslate_tile_slab": 31,
  "minecraft:deepslate_tile_stairs": 31,
  "minecraft:deepslate_tile_wall": 31,
  "minecraft:deepslate_tiles": 31,
  "minecraft:deny": 5,
  "minecraft:deprecated_anvil": 9,
  "minecraft:deprecated_purpur_block_1": 5,
  "minecraft:deprecated_purpur_block_2": 5,
  "minecraft:detector_rail": 4,
  "minecraft:diamond_block": 4,
  "minecraft:diamond_ore": 5,
  "minecraft:diorite": 5,
  "minecraft:diorite_double_slab": 5,
  "minecraft:diorite_slab": 5,
  "minecraft:diorite_stairs": 5,
  "minecraft:diorite_wall": 5,
  "minecraft:dirt": 36,
  "minecraft:dirt_with_roots": 50,
  "minecraft:dispenser": 5,
  "minecraft:double_cut_copper_slab": 30,
  "minecraft:double_plant": 2,
  "minecraft:double_stone_slab": 5,
  "minecraft:double_stone_slab2": 5,
  "minecraft:double_stone_slab3": 5,
  "minecraft:double_stone_slab4": 5,
  "minecraft:double_wooden_slab": 0,
  "minecraft:dragon_egg": 5,
  "minecraft:dragon_head": 5,
  "minecraft:dried_ghast": 51,
  "minecraft:dried_kelp_block": 2,
  "minecraft:dripstone_block": 52,
  "minecraft:dropper": 5,
  "minecraft:emerald_block": 4,
  "minecraft:emerald_ore": 5,
  "minecraft:end_brick_stairs": 5,
  "minecraft:end_bricks": 5,
  "minecraft:end_portal_frame": 5,
  "minecraft:end_rod": 0,
  "minecraft:end_stone": 5,
  "minecraft:end_stone_brick_double_slab": 5,
  "minecraft:end_stone_brick_slab": 5,
  "minecraft:end_stone_brick_wall": 5,
  "minecraft:exposed_chiseled_copper": 30,
  "minecraft:exposed_copper": 30,
  "minecraft:exposed_copper_bars": 30,
  "minecraft:exposed_copper_bulb": 38,
  "minecraft:exposed_copper_chain": 26,
  "minecraft:exposed_copper_chest": 30,
  "minecraft:exposed_copper_door": 30,
  "minecraft:exposed_copper_golem_statue": 39,
  "minecraft:exposed_copper_grate": 40,
  "minecraft:exposed_copper_lantern": 41,
  "minecraft:exposed_copper_trapdoor": 30,
  "minecraft:exposed_cut_copper": 30,
  "minecraft:exposed_cut_copper_slab": 30,
  "minecraft:exposed_cut_copper_stairs": 30,
  "minecraft:exposed_double_cut_copper_slab": 30,
  "minecraft:exposed_lightning_rod": 30,
  "minecraft:farmland": 36,
  "minecraft:fence": 0,
  "minecraft:fence_gate": 0,
  "minecraft:fern": 2,
  "minecraft:fire": 0,
  "minecraft:fire_coral": 5,
  "minecraft:fire_coral_block": 5,
  "minecraft:fire_coral_fan": 5,
  "minecraft:fire_coral_wall_fan": 5,
  "minecraft:firefly_bush": 53,
  "minecraft:fletching_table": 0,
  "minecraft:flowering_azalea": 10,
  "minecraft:frame": 54,
  "minecraft:frog_spawn": 55,
  "minecraft:frosted_ice": 5,
  "minecraft:furnace": 5,
  "minecraft:gilded_blackstone": 5,
  "minecraft:glass": 5,
  "minecraft:glass_pane": 5,
  "minecraft:glow_frame": 54,
  "minecraft:glow_lichen": 2,
  "minecraft:glowingobsidian": 5,
  "minecraft:glowstone": 5,
  "minecraft:gold_block": 4,
  "minecraft:gold_ore": 5,
  "minecraft:golden_dandelion": 2,
  "minecraft:golden_rail": 4,
  "minecraft:granite": 5,
  "minecraft:granite_double_slab": 5,
  "minecraft:granite_slab": 5,
  "minecraft:granite_stairs": 5,
  "minecraft:granite_wall": 5,
  "minecraft:grass": 2,
  "minecraft:grass_path": 2,
  "minecraft:gravel": 36,
  "minecraft:gray_candle": 18,
  "minecraft:gray_candle_cake": 19,
  "minecraft:gray_carpet": 19,
  "minecraft:gray_concrete": 5,
  "minecraft:gray_concrete_powder": 20,
  "minecraft:gray_glazed_terracotta": 5,
  "minecraft:gray_shulker_box": 5,
  "minecraft:gray_stained_glass": 5,
  "minecraft:gray_stained_glass_pane": 5,
  "minecraft:gray_terracotta": 5,
  "minecraft:gray_wool": 19,
  "minecraft:green_candle": 18,
  "minecraft:green_candle_cake": 19,
  "minecraft:green_carpet": 19,
  "minecraft:green_concrete": 5,
  "minecraft:green_concrete_powder": 20,
  "minecraft:green_glazed_terracotta": 5,
  "minecraft:green_shulker_box": 5,
  "minecraft:green_stained_glass": 5,
  "minecraft:green_stained_glass_pane": 5,
  "minecraft:green_terracotta": 5,
  "minecraft:green_wool": 19,
  "minecraft:grindstone": 5,
  "minecraft:hanging_roots": 50,
  "minecraft:hardened_clay": 5,
  "minecraft:hay_block": 2,
  "minecraft:heavy_core": 56,
  "minecraft:heavy_weighted_pressure_plate": 57,
  "minecraft:honey_block": 58,
  "minecraft:honeycomb_block": 59,
  "minecraft:hopper": 4,
  "minecraft:horn_coral": 5,
  "minecraft:horn_coral_block": 5,
  "minecraft:horn_coral_fan": 5,
  "minecraft:horn_coral_wall_fan": 5,
  "minecraft:ice": 5,
  "minecraft:infested_chiseled_stone_bricks": 5,
  "minecraft:infested_cobblestone": 5,
  "minecraft:infested_cracked_stone_bricks": 5,
  "minecraft:infested_deepslate": 37,
  "minecraft:infested_mossy_stone_bricks": 5,
  "minecraft:infested_stone": 5,
  "minecraft:infested_stone_bricks": 5,
  "minecraft:info_update": 36,
  "minecraft:info_update2": 36,
  "minecraft:iron_bars": 57,
  "minecraft:iron_block": 57,
  "minecraft:iron_door": 57,
  "minecraft:iron_ore": 5,
  "minecraft:iron_trapdoor": 57,
  "minecraft:jukebox": 0,
  "minecraft:jungle_button": 0,
  "minecraft:jungle_door": 0,
  "minecraft:jungle_double_slab": 0,
  "minecraft:jungle_fence": 0,
  "minecraft:jungle_fence_gate": 0,
  "minecraft:jungle_hanging_sign": 1,
  "minecraft:jungle_leaves": 2,
  "minecraft:jungle_log": 0,
  "minecraft:jungle_planks": 0,
  "minecraft:jungle_pressure_plate": 0,
  "minecraft:jungle_sapling": 2,
  "minecraft:jungle_shelf": 3,
  "minecraft:jungle_slab": 0,
  "minecraft:jungle_stairs": 0,
  "minecraft:jungle_standing_sign": 0,
  "minecraft:jungle_trapdoor": 0,
  "minecraft:jungle_wall_sign": 0,
  "minecraft:jungle_wood": 0,
  "minecraft:kelp": 2,
  "minecraft:ladder": 60,
  "minecraft:lantern": 41,
  "minecraft:lapis_block": 5,
  "minecraft:lapis_ore": 5,
  "minecraft:large_amethyst_bud": 61,
  "minecraft:large_fern": 2,
  "minecraft:leaf_litter": 62,
  "minecraft:leaves": 2,
  "minecraft:leaves2": 2,
  "minecraft:lectern": 0,
  "minecraft:lever": 0,
  "minecraft:light_block_0": 5,
  "minecraft:light_block_1": 5,
  "minecraft:light_block_10": 5,
  "minecraft:light_block_11": 5,
  "minecraft:light_block_12": 5,
  "minecraft:light_block_13": 5,
  "minecraft:light_block_14": 5,
  "minecraft:light_block_15": 5,
  "minecraft:light_block_2": 5,
  "minecraft:light_block_3": 5,
  "minecraft:light_block_4": 5,
  "minecraft:light_block_5": 5,
  "minecraft:light_block_6": 5,
  "minecraft:light_block_7": 5,
  "minecraft:light_block_8": 5,
  "minecraft:light_block_9": 5,
  "minecraft:light_blue_candle": 18,
  "minecraft:light_blue_candle_cake": 19,
  "minecraft:light_blue_carpet": 19,
  "minecraft:light_blue_concrete": 5,
  "minecraft:light_blue_concrete_powder": 20,
  "minecraft:light_blue_glazed_terracotta": 5,
  "minecraft:light_blue_shulker_box": 5,
  "minecraft:light_blue_stained_glass": 5,
  "minecraft:light_blue_stained_glass_pane": 5,
  "minecraft:light_blue_terracotta": 5,
  "minecraft:light_blue_wool": 19,
  "minecraft:light_gray_candle": 18,
  "minecraft:light_gray_candle_cake": 19,
  "minecraft:light_gray_carpet": 19,
  "minecraft:light_gray_concrete": 5,
  "minecraft:light_gray_concrete_powder": 20,
  "minecraft:light_gray_shulker_box": 5,
  "minecraft:light_gray_stained_glass": 5,
  "minecraft:light_gray_stained_glass_pane": 5,
  "minecraft:light_gray_terracotta": 5,
  "minecraft:light_gray_wool": 19,
  "minecraft:light_weighted_pressure_plate": 4,
  "minecraft:lightning_rod": 30,
  "minecraft:lilac": 2,
  "minecraft:lily_of_the_valley": 2,
  "minecraft:lime_candle": 18,
  "minecraft:lime_candle_cake": 19,
  "minecraft:lime_carpet": 19,
  "minecraft:lime_concrete": 5,
  "minecraft:lime_concrete_powder": 20,
  "minecraft:lime_glazed_terracotta": 5,
  "minecraft:lime_shulker_box": 5,
  "minecraft:lime_stained_glass": 5,
  "minecraft:lime_stained_glass_pane": 5,
  "minecraft:lime_terracotta": 5,
  "minecraft:lime_wool": 19,
  "minecraft:lit_blast_furnace": 5,
  "minecraft:lit_deepslate_redstone_ore": 37,
  "minecraft:lit_furnace": 5,
  "minecraft:lit_pumpkin": 0,
  "minecraft:lit_redstone_lamp": 5,
  "minecraft:lit_redstone_ore": 5,
  "minecraft:lit_smoker": 5,
  "minecraft:lodestone": 63,
  "minecraft:log": 0,
  "minecraft:log2": 0,
  "minecraft:loom": 0,
  "minecraft:magenta_candle": 18,
  "minecraft:magenta_candle_cake": 19,
  "minecraft:magenta_carpet": 19,
  "minecraft:magenta_concrete": 5,
  "minecraft:magenta_concrete_powder": 20,
  "minecraft:magenta_glazed_terracotta": 5,
  "minecraft:magenta_shulker_box": 5,
  "minecraft:magenta_stained_glass": 5,
  "minecraft:magenta_stained_glass_pane": 5,
  "minecraft:magenta_terracotta": 5,
  "minecraft:magenta_wool": 19,
  "minecraft:magma": 5,
  "minecraft:mangrove_button": 0,
  "minecraft:mangrove_door": 0,
  "minecraft:mangrove_double_slab": 0,
  "minecraft:mangrove_fence": 0,
  "minecraft:mangrove_fence_gate": 0,
  "minecraft:mangrove_hanging_sign": 1,
  "minecraft:mangrove_leaves": 2,
  "minecraft:mangrove_log": 0,
  "minecraft:mangrove_planks": 0,
  "minecraft:mangrove_pressure_plate": 0,
  "minecraft:mangrove_propagule": 2,
  "minecraft:mangrove_roots": 64,
  "minecraft:mangrove_shelf": 3,
  "minecraft:mangrove_slab": 0,
  "minecraft:mangrove_stairs": 0,
  "minecraft:mangrove_standing_sign": 0,
  "minecraft:mangrove_trapdoor": 0,
  "minecraft:mangrove_wall_sign": 0,
  "minecraft:mangrove_wood": 0,
  "minecraft:medium_amethyst_bud": 65,
  "minecraft:melon_block": 0,
  "minecraft:melon_stem": 0,
  "minecraft:mob_spawner": 66,
  "minecraft:moss_block": 67,
  "minecraft:moss_carpet": 68,
  "minecraft:mossy_cobblestone": 5,
  "minecraft:mossy_cobblestone_double_slab": 5,
  "minecraft:mossy_cobblestone_slab": 5,
  "minecraft:mossy_cobblestone_stairs": 5,
  "minecraft:mossy_cobblestone_wall": 5,
  "minecraft:mossy_stone_brick_double_slab": 5,
  "minecraft:mossy_stone_brick_slab": 5,
  "minecraft:mossy_stone_brick_stairs": 5,
  "minecraft:mossy_stone_brick_wall": 5,
  "minecraft:mossy_stone_bricks": 5,
  "minecraft:mud": 69,
  "minecraft:mud_brick_double_slab": 70,
  "minecraft:mud_brick_slab": 70,
  "minecraft:mud_brick_stairs": 70,
  "minecraft:mud_brick_wall": 70,
  "minecraft:mud_bricks": 70,
  "minecraft:muddy_mangrove_roots": 71,
  "minecraft:mushroom_stem": 0,
  "minecraft:mycelium": 2,
  "minecraft:nether_brick": 32,
  "minecraft:nether_brick_double_slab": 5,
  "minecraft:nether_brick_fence": 32,
  "minecraft:nether_brick_slab": 32,
  "minecraft:nether_brick_stairs": 32,
  "minecraft:nether_brick_wall": 32,
  "minecraft:nether_gold_ore": 72,
  "minecraft:nether_sprouts": 73,
  "minecraft:nether_wart": 74,
  "minecraft:nether_wart_block": 74,
  "minecraft:netherite_block": 75,
  "minecraft:netherrack": 76,
  "minecraft:netherreactor": 4,
  "minecraft:normal_stone_double_slab": 5,
  "minecraft:normal_stone_slab": 5,
  "minecraft:normal_stone_stairs": 5,
  "minecraft:noteblock": 0,
  "minecraft:oak_double_slab": 0,
  "minecraft:oak_fence": 0,
  "minecraft:oak_hanging_sign": 1,
  "minecraft:oak_leaves": 2,
  "minecraft:oak_log": 0,
  "minecraft:oak_planks": 0,
  "minecraft:oak_sapling": 2,
  "minecraft:oak_shelf": 3,
  "minecraft:oak_slab": 0,
  "minecraft:oak_stairs": 0,
  "minecraft:oak_wood": 0,
  "minecraft:observer": 4,
  "minecraft:obsidian": 5,
  "minecraft:ochre_froglight": 77,
  "minecraft:open_eyeblossom": 2,
  "minecraft:orange_candle": 18,
  "minecraft:orange_candle_cake": 19,
  "minecraft:orange_carpet": 19,
  "minecraft:orange_concrete": 5,
  "minecraft:orange_concrete_powder": 20,
  "minecraft:orange_glazed_terracotta": 5,
  "minecraft:orange_shulker_box": 5,
  "minecraft:orange_stained_glass": 5,
  "minecraft:orange_stained_glass_pane": 5,
  "minecraft:orange_terracotta": 5,
  "minecraft:orange_tulip": 2,
  "minecraft:orange_wool": 19,
  "minecraft:oxeye_daisy": 2,
  "minecraft:oxidized_chiseled_copper": 30,
  "minecraft:oxidized_copper": 30,
  "minecraft:oxidized_copper_bars": 30,
  "minecraft:oxidized_copper_bulb": 38,
  "minecraft:oxidized_copper_chain": 26,
  "minecraft:oxidized_copper_chest": 30,
  "minecraft:oxidized_copper_door": 30,
  "minecraft:oxidized_copper_golem_statue": 39,
  "minecraft:oxidized_copper_grate": 40,
  "minecraft:oxidized_copper_lantern": 41,
  "minecraft:oxidized_copper_trapdoor": 30,
  "minecraft:oxidized_cut_copper": 30,
  "minecraft:oxidized_cut_copper_slab": 30,
  "minecraft:oxidized_cut_copper_stairs": 30,
  "minecraft:oxidized_double_cut_copper_slab": 30,
  "minecraft:oxidized_lightning_rod": 30,
  "minecraft:packed_ice": 5,
  "minecraft:packed_mud": 78,
  "minecraft:pale_hanging_moss": 67,
  "minecraft:pale_moss_block": 67,
  "minecraft:pale_moss_carpet": 68,
  "minecraft:pale_oak_button": 0,
  "minecraft:pale_oak_door": 0,
  "minecraft:pale_oak_double_slab": 0,
  "minecraft:pale_oak_fence": 0,
  "minecraft:pale_oak_fence_gate": 0,
  "minecraft:pale_oak_hanging_sign": 1,
  "minecraft:pale_oak_leaves": 2,
  "minecraft:pale_oak_log": 0,
  "minecraft:pale_oak_planks": 0,
  "minecraft:pale_oak_pressure_plate": 0,
  "minecraft:pale_oak_sapling": 2,
  "minecraft:pale_oak_shelf": 3,
  "minecraft:pale_oak_slab": 0,
  "minecraft:pale_oak_stairs": 0,
  "minecraft:pale_oak_standing_sign": 0,
  "minecraft:pale_oak_trapdoor": 0,
  "minecraft:pale_oak_wall_sign": 0,
  "minecraft:pale_oak_wood": 0,
  "minecraft:pearlescent_froglight": 77,
  "minecraft:peony": 2,
  "minecraft:petrified_oak_double_slab": 5,
  "minecraft:petrified_oak_slab": 5,
  "minecraft:piglin_head": 5,
  "minecraft:pink_candle": 18,
  "minecraft:pink_candle_cake": 19,
  "minecraft:pink_carpet": 19,
  "minecraft:pink_concrete": 5,
  "minecraft:pink_concrete_powder": 20,
  "minecraft:pink_glazed_terracotta": 5,
  "minecraft:pink_petals": 79,
  "minecraft:pink_shulker_box": 5,
  "minecraft:pink_stained_glass": 5,
  "minecraft:pink_stained_glass_pane": 5,
  "minecraft:pink_terracotta": 5,
  "minecraft:pink_tulip": 2,
  "minecraft:pink_wool": 19,
  "minecraft:piston": 5,
  "minecraft:pitcher_crop": 2,
  "minecraft:pitcher_plant": 2,
  "minecraft:planks": 0,
  "minecraft:player_head": 5,
  "minecraft:podzol": 36,
  "minecraft:pointed_dripstone": 80,
  "minecraft:polished_andesite": 5,
  "minecraft:polished_andesite_double_slab": 5,
  "minecraft:polished_andesite_slab": 5,
  "minecraft:polished_andesite_stairs": 5,
  "minecraft:polished_basalt": 16,
  "minecraft:polished_blackstone": 5,
  "minecraft:polished_blackstone_brick_double_slab": 5,
  "minecraft:polished_blackstone_brick_slab": 5,
  "minecraft:polished_blackstone_brick_stairs": 5,
  "minecraft:polished_blackstone_brick_wall": 5,
  "minecraft:polished_blackstone_bricks": 5,
  "minecraft:polished_blackstone_button": 5,
  "minecraft:polished_blackstone_double_slab": 5,
  "minecraft:polished_blackstone_pressure_plate": 5,
  "minecraft:polished_blackstone_slab": 5,
  "minecraft:polished_blackstone_stairs": 5,
  "minecraft:polished_blackstone_wall": 5,
  "minecraft:polished_deepslate": 37,
  "minecraft:polished_deepslate_double_slab": 37,
  "minecraft:polished_deepslate_slab": 37,
  "minecraft:polished_deepslate_stairs": 37,
  "minecraft:polished_deepslate_wall": 37,
  "minecraft:polished_diorite": 5,
  "minecraft:polished_diorite_double_slab": 5,
  "minecraft:polished_diorite_slab": 5,
  "minecraft:polished_diorite_stairs": 5,
  "minecraft:polished_granite": 5,
  "minecraft:polished_granite_double_slab": 5,
  "minecraft:polished_granite_slab": 5,
  "minecraft:polished_granite_stairs": 5,
  "minecraft:polished_tuff": 81,
  "minecraft:polished_tuff_double_slab": 81,
  "minecraft:polished_tuff_slab": 81,
  "minecraft:polished_tuff_stairs": 81,
  "minecraft:polished_tuff_wall": 81,
  "minecraft:poppy": 2,
  "minecraft:portal": 5,
  "minecraft:potatoes": 2,
  "minecraft:powder_snow": 82,
  "minecraft:powered_comparator": 0,
  "minecraft:powered_repeater": 0,
  "minecraft:prismarine": 5,
  "minecraft:prismarine_brick_double_slab": 5,
  "minecraft:prismarine_brick_slab": 5,
  "minecraft:prismarine_bricks": 5,
  "minecraft:prismarine_bricks_stairs": 5,
  "minecraft:prismarine_double_slab": 5,
  "minecraft:prismarine_slab": 5,
  "minecraft:prismarine_stairs": 5,
  "minecraft:prismarine_wall": 5,
  "minecraft:pumpkin": 0,
  "minecraft:pumpkin_stem": 0,
  "minecraft:purple_candle": 18,
  "minecraft:purple_candle_cake": 19,
  "minecraft:purple_carpet": 19,
  "minecraft:purple_concrete": 5,
  "minecraft:purple_concrete_powder": 20,
  "minecraft:purple_glazed_terracotta": 5,
  "minecraft:purple_shulker_box": 5,
  "minecraft:purple_stained_glass": 5,
  "minecraft:purple_stained_glass_pane": 5,
  "minecraft:purple_terracotta": 5,
  "minecraft:purple_wool": 19,
  "minecraft:purpur_block": 5,
  "minecraft:purpur_double_slab": 5,
  "minecraft:purpur_pillar": 5,
  "minecraft:purpur_slab": 5,
  "minecraft:quartz_block": 5,
  "minecraft:quartz_bricks": 5,
  "minecraft:quartz_double_slab": 5,
  "minecraft:quartz_ore": 72,
  "minecraft:quartz_pillar": 5,
  "minecraft:quartz_slab": 5,
  "minecraft:rail": 4,
  "minecraft:raw_copper_block": 5,
  "minecraft:raw_gold_block": 5,
  "minecraft:raw_iron_block": 5,
  "minecraft:red_candle": 18,
  "minecraft:red_candle_cake": 19,
  "minecraft:red_carpet": 19,
  "minecraft:red_concrete": 5,
  "minecraft:red_concrete_powder": 20,
  "minecraft:red_flower": 2,
  "minecraft:red_glazed_terracotta": 5,
  "minecraft:red_mushroom": 2,
  "minecraft:red_mushroom_block": 0,
  "minecraft:red_nether_brick": 32,
  "minecraft:red_nether_brick_double_slab": 5,
  "minecraft:red_nether_brick_slab": 32,
  "minecraft:red_nether_brick_stairs": 32,
  "minecraft:red_nether_brick_wall": 32,
  "minecraft:red_sand": 20,
  "minecraft:red_sandstone": 5,
  "minecraft:red_sandstone_double_slab": 5,
  "minecraft:red_sandstone_slab": 5,
  "minecraft:red_sandstone_wall": 5,
  "minecraft:red_shulker_box": 5,
  "minecraft:red_stained_glass": 5,
  "minecraft:red_stained_glass_pane": 5,
  "minecraft:red_terracotta": 5,
  "minecraft:red_tulip": 2,
  "minecraft:red_wool": 19,
  "minecraft:redstone_block": 5,
  "minecraft:redstone_lamp": 5,
  "minecraft:redstone_ore": 5,
  "minecraft:redstone_torch": 0,
  "minecraft:reeds": 2,
  "minecraft:reinforced_deepslate": 37,
  "minecraft:repeating_command_block": 4,
  "minecraft:resin_block": 83,
  "minecraft:resin_brick_double_slab": 33,
  "minecraft:resin_brick_slab": 33,
  "minecraft:resin_brick_stairs": 33,
  "minecraft:resin_brick_wall": 33,
  "minecraft:resin_bricks": 33,
  "minecraft:resin_clump": 83,
  "minecraft:respawn_anchor": 4,
  "minecraft:rose_bush": 2,
  "minecraft:sand": 20,
  "minecraft:sandstone": 5,
  "minecraft:sandstone_double_slab": 5,
  "minecraft:sandstone_slab": 5,
  "minecraft:sandstone_wall": 5,
  "minecraft:sapling": 2,
  "minecraft:scaffolding": 84,
  "minecraft:sculk": 85,
  "minecraft:sculk_catalyst": 86,
  "minecraft:sculk_sensor": 24,
  "minecraft:sculk_shrieker": 87,
  "minecraft:sculk_vein": 88,
  "minecraft:seaLantern": 5,
  "minecraft:sea_pickle": 89,
  "minecraft:seagrass": 2,
  "minecraft:short_dry_grass": 2,
  "minecraft:short_grass": 2,
  "minecraft:shroomlight": 90,
  "minecraft:shulker_box": 5,
  "minecraft:silver_glazed_terracotta": 5,
  "minecraft:skeleton_skull": 5,
  "minecraft:skull": 5,
  "minecraft:slime": 89,
  "minecraft:small_amethyst_bud": 91,
  "minecraft:small_dripleaf_block": 17,
  "minecraft:smithing_table": 0,
  "minecraft:smoker": 5,
  "minecraft:smooth_basalt": 16,
  "minecraft:smooth_quartz": 5,
  "minecraft:smooth_quartz_double_slab": 5,
  "minecraft:smooth_quartz_slab": 5,
  "minecraft:smooth_quartz_stairs": 5,
  "minecraft:smooth_red_sandstone": 5,
  "minecraft:smooth_red_sandstone_double_slab": 5,
  "minecraft:smooth_red_sandstone_slab": 5,
  "minecraft:smooth_red_sandstone_stairs": 5,
  "minecraft:smooth_sandstone": 5,
  "minecraft:smooth_sandstone_double_slab": 5,
  "minecraft:smooth_sandstone_slab": 5,
  "minecraft:smooth_sandstone_stairs": 5,
  "minecraft:smooth_stone": 5,
  "minecraft:smooth_stone_double_slab": 5,
  "minecraft:smooth_stone_slab": 5,
  "minecraft:sniffer_egg": 4,
  "minecraft:snow": 92,
  "minecraft:snow_layer": 92,
  "minecraft:soul_campfire": 0,
  "minecraft:soul_fire": 5,
  "minecraft:soul_lantern": 41,
  "minecraft:soul_sand": 93,
  "minecraft:soul_soil": 94,
  "minecraft:soul_torch": 0,
  "minecraft:sponge": 95,
  "minecraft:spore_blossom": 96,
  "minecraft:spruce_button": 0,
  "minecraft:spruce_door": 0,
  "minecraft:spruce_double_slab": 0,
  "minecraft:spruce_fence": 0,
  "minecraft:spruce_fence_gate": 0,
  "minecraft:spruce_hanging_sign": 1,
  "minecraft:spruce_leaves": 2,
  "minecraft:spruce_log": 0,
  "minecraft:spruce_planks": 0,
  "minecraft:spruce_pressure_plate": 0,
  "minecraft:spruce_sapling": 2,
  "minecraft:spruce_shelf": 3,
  "minecraft:spruce_slab": 0,
  "minecraft:spruce_stairs": 0,
  "minecraft:spruce_standing_sign": 0,
  "minecraft:spruce_trapdoor": 0,
  "minecraft:spruce_wall_sign": 0,
  "minecraft:spruce_wood": 0,
  "minecraft:stained_glass": 5,
  "minecraft:stained_glass_pane": 5,
  "minecraft:stained_hardened_clay": 5,
  "minecraft:standing_banner": 0,
  "minecraft:standing_sign": 0,
  "minecraft:sticky_piston": 5,
  "minecraft:stone": 5,
  "minecraft:stone_brick_double_slab": 5,
  "minecraft:stone_brick_slab": 5,
  "minecraft:stone_brick_wall": 5,
  "minecraft:stone_bricks": 5,
  "minecraft:stone_button": 5,
  "minecraft:stone_pressure_plate": 5,
  "minecraft:stone_slab": 5,
  "minecraft:stone_slab2": 5,
  "minecraft:stone_slab3": 5,
  "minecraft:stone_slab4": 5,
  "minecraft:stonebrick": 5,
  "minecraft:stonecutter": 5,
  "minecraft:stonecutter_block": 5,
  "minecraft:stripped_acacia_log": 0,
  "minecraft:stripped_acacia_wood": 0,
  "minecraft:stripped_bamboo_block": 13,
  "minecraft:stripped_birch_log": 0,
  "minecraft:stripped_birch_wood": 0,
  "minecraft:stripped_cherry_log": 27,
  "minecraft:stripped_cherry_wood": 27,
  "minecraft:stripped_crimson_hyphae": 46,
  "minecraft:stripped_crimson_stem": 46,
  "minecraft:stripped_dark_oak_log": 0,
  "minecraft:stripped_dark_oak_wood": 0,
  "minecraft:stripped_jungle_log": 0,
  "minecraft:stripped_jungle_wood": 0,
  "minecraft:stripped_mangrove_log": 0,
  "minecraft:stripped_mangrove_wood": 0,
  "minecraft:stripped_oak_log": 0,
  "minecraft:stripped_oak_wood": 0,
  "minecraft:stripped_pale_oak_log": 0,
  "minecraft:stripped_pale_oak_wood": 0,
  "minecraft:stripped_spruce_log": 0,
  "minecraft:stripped_spruce_wood": 0,
  "minecraft:stripped_warped_hyphae": 46,
  "minecraft:stripped_warped_stem": 46,
  "minecraft:sunflower": 2,
  "minecraft:suspicious_gravel": 97,
  "minecraft:suspicious_sand": 98,
  "minecraft:sweet_berry_bush": 53,
  "minecraft:tall_dry_grass": 2,
  "minecraft:tall_grass": 2,
  "minecraft:tallgrass": 2,
  "minecraft:target": 2,
  "minecraft:tinted_glass": 5,
  "minecraft:tnt": 2,
  "minecraft:torch": 0,
  "minecraft:torchflower": 2,
  "minecraft:torchflower_crop": 2,
  "minecraft:trapdoor": 0,
  "minecraft:trapped_chest": 0,
  "minecraft:trial_spawner": 99,
  "minecraft:tube_coral": 5,
  "minecraft:tube_coral_block": 5,
  "minecraft:tube_coral_fan": 5,
  "minecraft:tube_coral_wall_fan": 5,
  "minecraft:tuff": 34,
  "minecraft:tuff_brick_double_slab": 35,
  "minecraft:tuff_brick_slab": 35,
  "minecraft:tuff_brick_stairs": 35,
  "minecraft:tuff_brick_wall": 35,
  "minecraft:tuff_bricks": 35,
  "minecraft:tuff_double_slab": 34,
  "minecraft:tuff_slab": 34,
  "minecraft:tuff_stairs": 34,
  "minecraft:tuff_wall": 34,
  "minecraft:turtle_egg": 100,
  "minecraft:twisting_vines": 101,
  "minecraft:undyed_shulker_box": 5,
  "minecraft:unlit_redstone_torch": 0,
  "minecraft:unpowered_comparator": 0,
  "minecraft:unpowered_repeater": 0,
  "minecraft:vault": 102,
  "minecraft:verdant_froglight": 77,
  "minecraft:vine": 103,
  "minecraft:wall_banner": 0,
  "minecraft:wall_sign": 0,
  "minecraft:warped_button": 43,
  "minecraft:warped_door": 43,
  "minecraft:warped_double_slab": 43,
  "minecraft:warped_fence": 43,
  "minecraft:warped_fence_gate": 43,
  "minecraft:warped_fungus": 44,
  "minecraft:warped_hanging_sign": 45,
  "minecraft:warped_hyphae": 46,
  "minecraft:warped_nylium": 47,
  "minecraft:warped_planks": 43,
  "minecraft:warped_pressure_plate": 43,
  "minecraft:warped_roots": 48,
  "minecraft:warped_shelf": 3,
  "minecraft:warped_slab": 43,
  "minecraft:warped_stairs": 43,
  "minecraft:warped_standing_sign": 43,
  "minecraft:warped_stem": 46,
  "minecraft:warped_trapdoor": 43,
  "minecraft:warped_wall_sign": 43,
  "minecraft:warped_wart_block": 74,
  "minecraft:waterlily": 2,
  "minecraft:waxed_chiseled_copper": 30,
  "minecraft:waxed_copper": 30,
  "minecraft:waxed_copper_bars": 30,
  "minecraft:waxed_copper_bulb": 38,
  "minecraft:waxed_copper_chain": 26,
  "minecraft:waxed_copper_chest": 30,
  "minecraft:waxed_copper_door": 30,
  "minecraft:waxed_copper_golem_statue": 39,
  "minecraft:waxed_copper_grate": 40,
  "minecraft:waxed_copper_lantern": 41,
  "minecraft:waxed_copper_trapdoor": 30,
  "minecraft:waxed_cut_copper": 30,
  "minecraft:waxed_cut_copper_slab": 30,
  "minecraft:waxed_cut_copper_stairs": 30,
  "minecraft:waxed_double_cut_copper_slab": 30,
  "minecraft:waxed_exposed_chiseled_copper": 30,
  "minecraft:waxed_exposed_copper": 30,
  "minecraft:waxed_exposed_copper_bars": 30,
  "minecraft:waxed_exposed_copper_bulb": 38,
  "minecraft:waxed_exposed_copper_chain": 26,
  "minecraft:waxed_exposed_copper_chest": 30,
  "minecraft:waxed_exposed_copper_door": 30,
  "minecraft:waxed_exposed_copper_golem_statue": 39,
  "minecraft:waxed_exposed_copper_grate": 40,
  "minecraft:waxed_exposed_copper_lantern": 41,
  "minecraft:waxed_exposed_copper_trapdoor": 30,
  "minecraft:waxed_exposed_cut_copper": 30,
  "minecraft:waxed_exposed_cut_copper_slab": 30,
  "minecraft:waxed_exposed_cut_copper_stairs": 30,
  "minecraft:waxed_exposed_double_cut_copper_slab": 30,
  "minecraft:waxed_exposed_lightning_rod": 30,
  "minecraft:waxed_lightning_rod": 30,
  "minecraft:waxed_oxidized_chiseled_copper": 30,
  "minecraft:waxed_oxidized_copper": 30,
  "minecraft:waxed_oxidized_copper_bars": 30,
  "minecraft:waxed_oxidized_copper_bulb": 38,
  "minecraft:waxed_oxidized_copper_chain": 26,
  "minecraft:waxed_oxidized_copper_chest": 30,
  "minecraft:waxed_oxidized_copper_door": 30,
  "minecraft:waxed_oxidized_copper_golem_statue": 39,
  "minecraft:waxed_oxidized_copper_grate": 40,
  "minecraft:waxed_oxidized_copper_lantern": 41,
  "minecraft:waxed_oxidized_copper_trapdoor": 30,
  "minecraft:waxed_oxidized_cut_copper": 30,
  "minecraft:waxed_oxidized_cut_copper_slab": 30,
  "minecraft:waxed_oxidized_cut_copper_stairs": 30,
  "minecraft:waxed_oxidized_double_cut_copper_slab": 30,
  "minecraft:waxed_oxidized_lightning_rod": 30,
  "minecraft:waxed_weathered_chiseled_copper": 30,
  "minecraft:waxed_weathered_copper": 30,
  "minecraft:waxed_weathered_copper_bars": 30,
  "minecraft:waxed_weathered_copper_bulb": 38,
  "minecraft:waxed_weathered_copper_chain": 26,
  "minecraft:waxed_weathered_copper_chest": 30,
  "minecraft:waxed_weathered_copper_door": 30,
  "minecraft:waxed_weathered_copper_golem_statue": 39,
  "minecraft:waxed_weathered_copper_grate": 40,
  "minecraft:waxed_weathered_copper_lantern": 41,
  "minecraft:waxed_weathered_copper_trapdoor": 30,
  "minecraft:waxed_weathered_cut_copper": 30,
  "minecraft:waxed_weathered_cut_copper_slab": 30,
  "minecraft:waxed_weathered_cut_copper_stairs": 30,
  "minecraft:waxed_weathered_double_cut_copper_slab": 30,
  "minecraft:waxed_weathered_lightning_rod": 30,
  "minecraft:weathered_chiseled_copper": 30,
  "minecraft:weathered_copper": 30,
  "minecraft:weathered_copper_bars": 30,
  "minecraft:weathered_copper_bulb": 38,
  "minecraft:weathered_copper_chain": 26,
  "minecraft:weathered_copper_chest": 30,
  "minecraft:weathered_copper_door": 30,
  "minecraft:weathered_copper_golem_statue": 39,
  "minecraft:weathered_copper_grate": 40,
  "minecraft:weathered_copper_lantern": 41,
  "minecraft:weathered_copper_trapdoor": 30,
  "minecraft:weathered_cut_copper": 30,
  "minecraft:weathered_cut_copper_slab": 30,
  "minecraft:weathered_cut_copper_stairs": 30,
  "minecraft:weathered_double_cut_copper_slab": 30,
  "minecraft:weathered_lightning_rod": 30,
  "minecraft:web": 104,
  "minecraft:weeping_vines": 101,
  "minecraft:wet_sponge": 105,
  "minecraft:wheat": 2,
  "minecraft:white_candle": 18,
  "minecraft:white_candle_cake": 19,
  "minecraft:white_carpet": 19,
  "minecraft:white_concrete": 5,
  "minecraft:white_concrete_powder": 20,
  "minecraft:white_glazed_terracotta": 5,
  "minecraft:white_shulker_box": 5,
  "minecraft:white_stained_glass": 5,
  "minecraft:white_stained_glass_pane": 5,
  "minecraft:white_terracotta": 5,
  "minecraft:white_tulip": 2,
  "minecraft:white_wool": 19,
  "minecraft:wildflowers": 79,
  "minecraft:wither_rose": 2,
  "minecraft:wither_skeleton_skull": 5,
  "minecraft:wood": 0,
  "minecraft:wooden_button": 0,
  "minecraft:wooden_door": 0,
  "minecraft:wooden_pressure_plate": 0,
  "minecraft:wooden_slab": 0,
  "minecraft:wool": 19,
  "minecraft:yellow_candle": 18,
  "minecraft:yellow_candle_cake": 19,
  "minecraft:yellow_carpet": 19,
  "minecraft:yellow_concrete": 5,
  "minecraft:yellow_concrete_powder": 20,
  "minecraft:yellow_flower": 2,
  "minecraft:yellow_glazed_terracotta": 5,
  "minecraft:yellow_shulker_box": 5,
  "minecraft:yellow_stained_glass": 5,
  "minecraft:yellow_stained_glass_pane": 5,
  "minecraft:yellow_terracotta": 5,
  "minecraft:yellow_wool": 19,
  "minecraft:zombie_head": 5
};
var VANILLA_BLOCK_HIT_SOUND_EVENTS = [
  [
    "hit.grass",
    0.5,
    0.5,
    0.3,
    0.3
  ],
  [
    "hit.wood",
    0.5,
    0.5,
    0.23,
    0.23
  ],
  [
    "hit.azalea_leaves",
    0.5,
    0.5,
    0.3,
    0.3
  ],
  [
    "hit.cherry_leaves",
    1,
    1,
    0.8,
    0.8
  ],
  [
    "hit.cherry_wood",
    0.5,
    0.5,
    0.23,
    0.23
  ],
  [
    "block.creaking_heart.hit",
    0.5,
    0.5,
    0.25,
    0.25
  ],
  [
    "hit.hanging_roots",
    0.5,
    0.5,
    0.35,
    0.35
  ],
  [
    "block.mangrove_roots.hit",
    0.5,
    0.5,
    0.1,
    0.1
  ],
  [
    "block.muddy_mangrove_roots.hit",
    0.5,
    0.5,
    0.05,
    0.05
  ],
  [
    "hit.moss",
    1,
    1,
    1,
    1
  ],
  [
    "hit.vines",
    0.5,
    0.5,
    0.3,
    0.3
  ]
];
var VANILLA_BLOCK_HIT_SOUND_EVENT_INDICES = {
  "minecraft:acacia_leaves": 0,
  "minecraft:acacia_log": 1,
  "minecraft:acacia_wood": 1,
  "minecraft:azalea_leaves": 2,
  "minecraft:azalea_leaves_flowered": 2,
  "minecraft:bee_nest": 1,
  "minecraft:beehive": 1,
  "minecraft:birch_leaves": 0,
  "minecraft:birch_log": 1,
  "minecraft:birch_wood": 1,
  "minecraft:cherry_leaves": 3,
  "minecraft:cherry_log": 4,
  "minecraft:cherry_wood": 4,
  "minecraft:cocoa": 1,
  "minecraft:creaking_heart": 5,
  "minecraft:dark_oak_leaves": 0,
  "minecraft:dark_oak_log": 1,
  "minecraft:dark_oak_wood": 1,
  "minecraft:hanging_roots": 6,
  "minecraft:jungle_leaves": 0,
  "minecraft:jungle_log": 1,
  "minecraft:jungle_wood": 1,
  "minecraft:leaves": 0,
  "minecraft:leaves2": 0,
  "minecraft:log": 1,
  "minecraft:log2": 1,
  "minecraft:mangrove_leaves": 0,
  "minecraft:mangrove_log": 1,
  "minecraft:mangrove_propagule": 0,
  "minecraft:mangrove_roots": 7,
  "minecraft:mangrove_wood": 1,
  "minecraft:muddy_mangrove_roots": 8,
  "minecraft:oak_leaves": 0,
  "minecraft:oak_log": 1,
  "minecraft:oak_wood": 1,
  "minecraft:pale_hanging_moss": 9,
  "minecraft:pale_oak_leaves": 0,
  "minecraft:pale_oak_log": 1,
  "minecraft:pale_oak_wood": 1,
  "minecraft:spruce_leaves": 0,
  "minecraft:spruce_log": 1,
  "minecraft:spruce_wood": 1,
  "minecraft:stripped_acacia_log": 1,
  "minecraft:stripped_acacia_wood": 1,
  "minecraft:stripped_birch_log": 1,
  "minecraft:stripped_birch_wood": 1,
  "minecraft:stripped_cherry_log": 4,
  "minecraft:stripped_cherry_wood": 4,
  "minecraft:stripped_dark_oak_log": 1,
  "minecraft:stripped_dark_oak_wood": 1,
  "minecraft:stripped_jungle_log": 1,
  "minecraft:stripped_jungle_wood": 1,
  "minecraft:stripped_mangrove_log": 1,
  "minecraft:stripped_mangrove_wood": 1,
  "minecraft:stripped_oak_log": 1,
  "minecraft:stripped_oak_wood": 1,
  "minecraft:stripped_pale_oak_log": 1,
  "minecraft:stripped_pale_oak_wood": 1,
  "minecraft:stripped_spruce_log": 1,
  "minecraft:stripped_spruce_wood": 1,
  "minecraft:vine": 10
};

// sable/packs/SableBP/scripts/sable/content/sublevel_sounds/SubLevelBlockSounds.js
var DEFAULT_BLOCK_BREAK_EVENT = ["dig.wood", 0.8, 1, 1, 1];
var DEFAULT_BLOCK_HIT_EVENT = ["hit.wood", 0.5, 0.5, 0.23, 0.23];
var DEFAULT_BLOCK_PLACE_EVENT = ["place.wood", 0.8, 0.8, 1, 1];
var DEFAULT_LEAF_BREAK_EVENT = ["dig.grass", 0.8, 1, 0.7, 0.7];
var DEFAULT_LEAF_HIT_EVENT = ["hit.grass", 0.5, 0.5, 0.3, 0.3];
function resolveVanillaBlockBreakSound(typeId, random = Math.random) {
  return sampleSoundEvent(resolveBreakTemplate(typeId), random);
}
function resolveVanillaBlockPlaceSound(typeId, random = Math.random) {
  const normalized = normalizeTypeId(typeId);
  return sampleSoundEvent(
    lookupGeneratedEvent(
      VANILLA_BLOCK_PLACE_SOUND_EVENTS,
      VANILLA_BLOCK_PLACE_SOUND_EVENT_INDICES,
      normalized
    ) ?? DEFAULT_BLOCK_PLACE_EVENT,
    random
  );
}
function resolveVanillaBlockHitSound(typeId, random = Math.random) {
  const normalized = normalizeTypeId(typeId);
  const event = lookupGeneratedEvent(
    VANILLA_BLOCK_HIT_SOUND_EVENTS,
    VANILLA_BLOCK_HIT_SOUND_EVENT_INDICES,
    normalized
  );
  return sampleSoundEvent(
    event ?? leafAwareDefault(normalized, DEFAULT_LEAF_HIT_EVENT, DEFAULT_BLOCK_HIT_EVENT),
    random
  );
}
function resolveBreakTemplate(typeId) {
  const normalized = normalizeTypeId(typeId);
  return lookupGeneratedEvent(
    VANILLA_BLOCK_BREAK_SOUND_EVENTS,
    VANILLA_BLOCK_BREAK_SOUND_EVENT_INDICES,
    normalized
  ) ?? leafAwareDefault(normalized, DEFAULT_LEAF_BREAK_EVENT, DEFAULT_BLOCK_BREAK_EVENT);
}
function lookupGeneratedEvent(events, indices, normalized) {
  if (normalized === void 0) return void 0;
  const index = indices[normalized];
  return index === void 0 ? void 0 : events[index];
}
function leafAwareDefault(normalized, leafEvent, blockEvent) {
  return normalized !== void 0 && isLeafTypeId(normalized) ? leafEvent : blockEvent;
}
function isLeafTypeId(typeId) {
  const separator = typeId.indexOf(":");
  const name = separator >= 0 ? typeId.slice(separator + 1) : typeId;
  return name === "leaves" || name === "leaves2" || name.endsWith("_leaves") || name === "azalea_leaves_flowered";
}
function sampleSoundEvent(event, random) {
  return {
    sound: event[0],
    pitch: sampleRange(event[1], event[2], random),
    volume: sampleRange(event[3], event[4], random)
  };
}
function sampleRange(minimum, maximum, random) {
  return minimum === maximum ? minimum : minimum + (maximum - minimum) * random();
}
function normalizeTypeId(typeId) {
  if (!typeId) return void 0;
  return typeId.includes(":") ? typeId : `minecraft:${typeId}`;
}

// sable/packs/SableBP/scripts/sable/content/particle/SubLevelBlockParticles.js
import {
  MolangVariableMap
} from "@minecraft/server";

// sable/packs/SableBP/scripts/sable/data/vanilla/colormap/FoliageColorMap.js
var WIDTH = 256;
var ENCODED_RGB = /* @__PURE__ */ (() => [
  "Gr8Aa5eTa5eTa5eTa5eTa5mSa5mSbJiQbJiQbJiQbJiQbZmQbZmQbpiQbpiQbpiPb5mQb5mQb5mPb5mPb5mOb5mOcJqNcJqNcJqNcJqNcJqNcZmLcZmKcZmK",
  ,
  "cZmKcpqLcpqLc5mKc5mJdJqKdJqKdJqJdJqJdJqIdJqIdJqIdpqIdpqIdpqHdpqHdpqGdpqGdpqGdpqGdJqEdJqEdJqEdJqCdJqCc5mAc5mAc5mAcpp/cpp+",
  ,
  "cZl9cZl9cZl9cZl9cJp7cJp7cJp7cJp7cJp7cJp6cJp6bpp3bpp2bpp2bpp2bpp1bZl0bZl0bZlzbZlzbZlzbZlza5lwa5lwappvappvappvappvappvaZlt",
  ,
  "aZltaZltaZlsaZlsaZlsaZlsaJhpaJhpZ5lnZ5lnZ5hmZ5hmZ5hmaJllaJllaJllaJllaJllaJllaJhkaJhkaZhkaZhkaZhkZ5hiaJhiaJhiaJhiaJhiaJdh",
  ,
  "aJdhaJdhaJdhaJdhaJdhaJdhaJhgaZhgaJdfaJdfapdfaZdfaZdfaZddaZddaZddaZddaZdda5ddaZZcaZZcaZZcaZdbaZdbaZdbaZdbaZdbaZZaaZZaa5dZ",
  ,
  "a5dZa5dZa5dZapZYapZYa5ZYa5ZYa5ZYa5VXa5VXa5ZWa5ZWa5ZWa5ZWa5ZWapVVbJVVbJVVbJVVa5ZUa5ZUapVTapVTbJVTbJZSbJZSa5RSbJRSbJRSbJVR",
  ,
  "bJVRa5RQa5RQa5RQa5RQa5RQbZRQbZVPbZVPbZVPbJRObJRObZRObJVNbJVNbZVNbZVNbZVNbJRMbJRMbJRMbJRMbJRMbpVLbpVLbpVLbZRKbZRKb5RKb5RK",
  ,
  "b5RKbpRIbpRIbpRIbpRIbpRIbpRIbpRGbpRGbpRGbpRGbpRGbpRGbpRGbZNFbZNFbZNFbZNFbZREb5REb5VDb5VDb5VDb5ZCcZZCcZZCcZZCcpdBcpdBcpdB",
  ,
  "cpdBcpdBcpdBcpdBcphAdJhAdJhAdJhAdJhAdJhAdJk/dJk/dJo+dJo+dJo+dJo+G78AG78Aa5eTa5eTa5eRa5mSa5mSa5mSbJiQbJiQbJiQbZmQbZmQbpiQ",
  ,
  "bpiQbpiPbpiPb5mPb5mPb5mPb5mOb5mOcJqNcJqNcJqNcJqNcJqNcJqNcZmKcZmKcZmKcpqLcpqLcpqKc5mJc5mJc5mJdJqJdJqJdJqIdJqIdJqIdJqIdpqI",
  ,
  "dpqHdpqHdpqHdpqHdpqGdJqEdJqEdJqDdJqDdJqDc5mAc5mAcpp/cpp/cpp/cpp/cZl9cZl9cJp8cJp8cJp8cJp7cJp7cJp6cJp6cJp6bpp5bpp3bpp3bpp2",
  ,
  "bpp2bpp2bZl0bZl0bZlzbZlzbZlza5lwa5lwappwappvappvappvappvaZltaZltaZltaZltaZlsaZlsaJhpaJhpaJhpZ5lnZ5lnZ5hmZ5hmZ5hmaJllaJll",
  ,
  "aJllaJllaJllZ5hkZ5hkZ5hkaJhkaJhkaJhkZphiZ5hiZ5hiaJhiaJhiZ5dhaJdhaJdhaJdhaJhgaJhgaJhgaJhgaJhgaJdfaJdfaJdfaJdfaZdfaJddaJdd",
  ,
  "aJddaZddaZddaJZcaJZcaZdbaZdbaZdbaZdbaZdbaZdbaZdbaZZaaZZaaZdZaZdZaJZYaJZYapZYaZZYaZZYapVXapVXapVXapVXapZWa5ZWa5ZWa5ZWa5ZW",
  ,
  "apVVapVVapZUapZUapZUapVTapVTapZSapZSapZSbJZSa5RSa5RSa5VRa5VRa5VRa5RQa5RQa5RQa5RQa5RQa5VPa5VPapRObJRObJRObJRObJRObJROa5VN",
  ,
  "a5VNa5VNapRMbJRMbJRMbJRMbJRMbJVLbJVLa5RKa5RKa5RKbZRKbZRKbZRKbJRIbJRIbpRIbpRIbpRIbZRGbZRGbZRGbZRGbZRGbpRGbpRGbpRGbZNFbZNF",
  ,
  "bZNFbZREbZREbZREbJNDbJNDbJRCbpRCbpRCbpRCbpVBbpVBcJVBcJVBcJVBcJVBcpdBcZZAcphAcphAcZc/cZc/cZc/cZc/cZc/cZc/c5g+c5g+c5g+c5g+",
  ,
  "c5k9c5k9HL8BHL8BHL8Ba5eTa5eRa5mSa5mSa5mSbJiQbJiQbJiQbZmQbZmQbpiQbpiQbpiPbpiPb5mPb5mPb5mPb5mOb5mOcJqNcJqNcJqNcJqNcJqNcJqN",
  ,
  "cZmKcZmKcZmKcpqLcpqLcpqKc5mJc5mJc5mJdJqJdJqJdJqIdJqIdJqIdJqIdpqIdpqHdpqHdpqHdpqHdpqGdJqEdJqEdJqDdJqDdJqDc5mAc5mAcpp/cpp/",
  ,
  "cpp/cpp/cZl9cZl9cJp8cJp8cJp8cJp7cJp7cJp6cJp6cJp6bpp5bpp3bpp3bpp2bpp2bpp2bZl0bZl0bZlzbZlzbZlza5lwa5lwappwappvappvappvappv",
  ,
  "aZltaZltaZltaZltaZlsaZlsaJhpaJhpaJhpZ5lnZ5lnZ5hmZ5hmZ5hmaJllaJllaJllaJllaJllZ5hkZ5hkZ5hkaJhkaJhkaJhkZphiZ5hiZ5hiaJhiaJhi",
  ,
  "Z5dhaJdhaJdhaJdhaJhgaJhgaJhgaJhgaJhgaJdfaJdfaJdfaJdfaZdfaJddaJddaJddaZddaZddaJZcaJZcaZdbaZdbaZdbaZdbaZdbaZdbaZdbaZZaaZZa",
  ,
  "aZdZaZdZaJZYaJZYapZYaZZYaZZYapVXapVXapVXapVXapZWa5ZWa5ZWa5ZWa5ZWapVVapVVapZUapZUapZUapVTapVTapZSapZSapZSbJZSa5RSa5RSa5VR",
  ,
  "a5VRa5VRa5RQa5RQa5RQa5RQa5RQa5VPa5VPapRObJRObJRObJRObJRObJROa5VNa5VNa5VNapRMbJRMbJRMbJRMbJRMbJVLbJVLa5RKa5RKa5RKbZRKbZRK",
  ,
  "bZRKbJRIbJRIbpRIbpRIbpRIbZRGbZRGbZRGbZRGbZRGbpRGbpRGbpRGbZNFbZNFbZNFbZREbZREbZREbJNDbJNDbJRCbpRCbpRCbpRCbpVBbpVBcJVBcJVB",
  ,
  "cJVBcJVBcpdBcZZAcphAcphAcZc/cZc/cZc/cZc/cZc/cZc/c5g+c5g+c5g+c5g+c5k9c5k9Hb8BHb8BHb8BHb8Ca5eRapiSa5mSa5mSbJiQbJiQbJiQbJiQ",
  ,
  "bZmQbZmQbZmQbpiPbpiPb5mPb5mPb5mPb5mOb5mOb5mNcJqNcJqNcJqNcJqNcJqNcJqMcZmKcZmKcZmKcpqLcpqKc5mJc5mJc5mJc5mJdJqJdJqJdJqIdJqI",
  ,
  "dJqIdpqIdpqHdpqHdpqHdpqHdpqHdJqEdJqEdJqDdJqDdJqDc5mBc5mAcpqAcpqAcpp/cpp/cZl9cZl9cJp8cJp8cJp8cJp8cJp7cJp7cJp7cJp6bpp5bpp5",
  ,
  "bpp3bpp3bpp3bpp2bZl0bZl0bZlzbZlzbZlza5lwa5lwappwappwappwappvappvaZluaZltaZltaZltaZlsaZlsaJhpaJhpaJhpZ5loZ5lnZphmZ5hmZ5hm",
  ,
  "ZpllZpllaJllaJllaJllZ5hkZ5hkZ5hkaJhkaJhkaJhkZphiZphiZ5hiZ5hiZ5hiZ5dhZ5dhZ5dhaJdhaJhgaJhgaJhgaJhgaJhgaJdfaJdfaJdfaJdfaJdf",
  ,
  "Z5ddaJddaJddaJddaZddaJZcaJZcaJdbaJdbaJdbaZdbaZdbaZdbaZdbaJZaaJZaaZdZaZdZaJZYaJZYaJZYaZZYaZZYaJVXaJVXapVXapVXapZWapZWa5ZW",
  ,
  "a5ZWa5ZWapVVapVVapZUapZUapZUaZVTapVTapZSapZSapZSapZSaZRSa5RSa5VRa5VRa5VRaZRQaZRQa5RQa5RQa5RQa5VPa5VPapROapROapROapRObJRO",
  ,
  "bJROa5VNa5VNa5VNapRMapRMapRMbJRMbJRMbJVLbJVLa5RKa5RKa5RKa5RKa5RKbZRKbJRIbJRIbJRIbJRIbpRIbZRGbZRGbZRGbZRGbZRGbZRGbZRGbZRG",
  ,
  "bZNFbZNFbZNFbZREbZREbZREbJNDbJNDbJRCbJRCbJRCa5NBbpRCbZRAbpVBbpVBbpVBcJVBcJVBcZZAcZZAcZZAcZZAcZc/cZc/cZc/cZc/cZc/cJY+cJY+",
  ,
  "cJc9cJc9c5g+c5g+Hr8BHr8BHr8BHr8CHr8DapiSa5mSa5mSa5mSa5mSbJiQbJiQbZmQbZmQbZmQbZmPbpiPbpiOb5mPb5mPb5mOb5mOb5mNb5mNcJqNcJqN",
  ,
  "cJqNcJqNcJqMcZmKcZmKcZmKcZmKcpqKcpqKc5mJc5mJc5mJdJqJdJqJdJqIdJqIdJqIdJqIdpqHdpqHdZuHdZuHdZuHdZuGdZuFdJqEdJqEdJqDc5uCc5uC",
  ,
  "cpqAcpqAcpqAcpp/cpp/cpp+cJp8cJp8cJp8cJp8cJp8cJp7cJp7cJp7bpp5bpp5bpp3bpp3bpp3bpp3bZl0bZl0bZlzbZlzbZlza5lxa5lwappwappwappw",
  ,
  "appwappwaZluaZluaZluaZltaZltaZlsaJhqaJhqaJhqZ5loZ5loZphmZphmZphmZpllZpllZpllaJllaJllZ5hkZ5hkZ5hkaJhkaJhkaJhkZphiZphiZ5hi",
  ,
  "Z5hiZ5hiZ5dhZ5dhZ5dhZ5dhaJhgaJhgaJhgaJhgaJhgZ5dfZ5dfZ5dfaJdfaJdfZ5ddZ5ddZ5ddaJddaJddZ5ZcaJZcaJdbaJdbaJdbaJdbaZdbaZdbaZdb",
  ,
  "aJZaaJZaaJdZaZdZaJZYaJZYaZhYaJZYaJZYaZdXaZdXaZdXaZdXaJZWaJZWapZWapZWapZWaZdVaZdVapZUapZUapZUapZUapZUaZZSaZZSapZSapZSapZS",
  ,
  "apZSaZVRaZVRa5VRapZQapZQapZQapZQapZQa5VPa5VPa5VPa5VPa5VPapVNapVNapVNa5VNa5VNa5VNapRMapRMapRMapRMapRMapVLbJVLa5RKbJZKbJZK",
  ,
  "a5VJa5VJa5VJa5VJa5VJa5VJapVHbJVHbJVHbJVHbJVHbJVHbJVHbZRGbZRGbZRGbZVFbZVFbZVFbJREbJREbJREbZVDbZVDbJRCbJRCbJRCbJRCbJRCa5RA",
  ,
  "a5RAa5RAa5RAbpVBbpVBbZRAb5ZAb5ZAbpU/cZZAcJY+cZc/cZc/cZc/cJY+cJY+cJc9cJc9cJc9cJc9Hr8BHr8BHr8BHr8CHr8DHr8DapiRa5mSa5mSa5mS",
  ,
  "bJiQbJiQbJiQbZmQbZmQbZmPbpiPbpiOb5mPb5mPb5mOb5mOb5mNb5mNcJqNcJqNcJqNcJqNcJqMcJqMcJqMcZmKcZmKcpqKcpqKcpqKcpqKc5mJc5mJdJqJ",
  ,
  "dJqIdJqIdJqIdJqIdJqHdpqHdZuHdZuHdZuHdZuGdZuGdJqEdJqEdJqEc5uCc5uCcpqAcpqAcpqAcpqAcpp/cpp/cJp8cJp8cJp8cJp8cJp8cJp8cJp8cJp7",
  ,
  "bpp5bpp5bpp3bpp3bpp3bpp3bZl1bZl0bZl0bZl0bZl0a5lxa5lxappwappwappwappwappwaZluaZluaZluaZluaZltaZltaJhqaJhqaJhqZ5loZ5loZphn",
  ,
  "ZphmZphmZZllZZllZpllZpllZpllZ5hkZ5hkZ5hkZphkZphkZphkZphiZphiZ5hiZ5hiZ5hiZ5dhZ5dhZ5dhZ5dhZ5hgZ5hgZ5hgaJhgaJhgZ5dfZ5dfZ5df",
  ,
  "Z5dfaJdfZ5ddZ5ddZ5ddaJddaJddZ5ZcZ5ZcaJdbaJdbaJdbaJdbaJdbaJdbaJdbaJZaaJZaaJdZaJdZZ5ZYZ5ZYaZhYaJZYaJZYZ5dXZ5dXaZdXaZdXaJZW",
  ,
  "aJZWaJZWaJZWapZWaZdVaZdVaJZUaJZUaJZUapZUapZUaZZSaZZSaZZSaZZSapZSapZSaZVRaZVRaZVRaZZQapZQapZQapZQapZQaZVPa5VPa5VPa5VPa5VP",
  ,
  "apVNapVNapVNapVNapVNa5VNapRMapRMapRMapRMapRMapVLapVLaZRKbJZKbJZKa5VJa5VJa5VJa5VJa5VJa5VJapVHapVHapVHbJVHbJVHbJVHbJVHa5RG",
  ,
  "a5RGa5RGbZVFbZVFbZVFbJREbJREbJREbJVDbJVDbJRCbJRCbJRCbJRCbJRCa5RAa5RAa5RAa5RAa5RAa5RAa5RAbZRAbZRAbpU/bpU/bpY+cJY+cJY+cJY+",
  ,
  "cJY+cJY+cJc9cJc9cJc9cJc9Hr8BHr8BHr8BHr8CHr8DHr8DHr8Ea5mSa5mRa5mRbJiQbJiQbJiQbZmPbZmPbZmPbpiPbpiOb5mPb5mPb5mOb5mOb5mNb5mN",
  ,
  "cJqNcJqNcJqNcJqMcJqMcJqMcJqMcZmKcZmKcpqKcpqKcpqKcpqKc5mJc5mJdJqJdJqIdJqIdJqIdJqHdJqHdpqHdZuHdZuHdZuGdZuGdJqEdJqEdJqEdJqE",
  ,
  "c5uCc5uCcpqAcpqAcpqAcpp/cpp/cJp9cJp8cJp8cJp8cJp8cJp8cJp8cJp8bpp5bpp5bpp5bpp3bpp3bpp3bZl1bZl1bZl0bZl0bZl0a5lxa5lxappwappw",
  ,
  "appwappwappwaZluaZluaZluaZluaZltaZltaJhqaJhqaJhqZ5loZ5loZphnZphnZZllZZllZZllZZllZpllZphkZphkZ5hkZ5hkZphkZphkZZhiZZhiZphi",
  ,
  "ZphiZ5hiZpdhZpdhZ5dhZ5dhZ5dhZ5hgZ5hgZ5hgZ5hgZ5dfZ5dfZ5dfZ5dfZ5dfZ5dfZ5ddZ5ddaJddaJddaJddZ5ZcZ5ZcZpdbaJdbaJdbaJdbaJdbaJZa",
  ,
  "aJZaaJZaaJZaaJdZaJdZZ5ZYZ5ZYZ5ZYaJZYaJZYZ5dXZ5dXZ5dXaJZWaJZWaJZWaJZWaJdVaJdVaZdVaZdVaJZUaJZUaJZUapZUapZUaZZSaZZSaZZSaJZS",
  ,
  "aJZSaZVRaZVRaZZQaZZQaZZQaZZQapZQapZQapZQaZVPaZVPa5VPa5VPapVNapVNapVNapVNapVNaZRMaZRMapRMapRMapRMapVLapVLapVLapVLaZRKaZRK",
  ,
  "a5VJa5VJa5VJa5VJa5VJapVHapVHapVHapVHapVHapVHbJVHbJVHa5RGa5RGa5RGa5VFa5VFbZVFbJREbJREbJVDbJVDbJVDa5RCa5RCbJRCbJRCbJRCa5RA",
  ,
  "a5RAa5RAa5RAa5RAa5RAa5RAa5RAapM/bpU/bpU/bZQ+bpY+bZU9cJY+cJY+cJY+b5U9b5U9cJc9cJc9b5Y8b5Y8Hr4BHr4BHr4BHr4CH74DH74DH74EH74E",
  ,
  "a5mRa5mRbJiQbJiQbJiQbZmPbZmPbZmPbpiPbpiOb5mPb5mPb5mOb5mOb5mNb5mNcJqNcJqNcJqNcJqMcJqMcJqMcJqMcZmKcZmKcpqKcpqKcpqKcpqKc5mJ",
  ,
  "c5mJdJqJdJqIdJqIdJqIdJqHdJqHdpqHdZuHdZuHdZuGdZuGdJqEdJqEdJqEdJqEc5uCc5uCcpqAcpqAcpqAcpp/cpp/cJp9cJp8cJp8cJp8cJp8cJp8cJp8",
  ,
  "cJp8bpp5bpp5bpp5bpp3bpp3bpp3bZl1bZl1bZl0bZl0bZl0a5lxa5lxappwappwappwappwappwaZluaZluaZluaZluaZltaZltaJhqaJhqaJhqZ5loZ5lo",
  ,
  "ZphnZphnZZllZZllZZllZZllZpllZphkZphkZ5hkZ5hkZphkZphkZZhiZZhiZphiZphiZ5hiZpdhZpdhZ5dhZ5dhZ5dhZ5hgZ5hgZ5hgZ5hgZ5dfZ5dfZ5df",
  ,
  "Z5dfZ5dfZ5dfZ5ddZ5ddaJddaJddaJddZ5ZcZ5ZcZpdbaJdbaJdbaJdbaJdbaJZaaJZaaJZaaJZaaJdZaJdZZ5ZYZ5ZYZ5ZYaJZYaJZYZ5dXZ5dXZ5dXaJZW",
  ,
  "aJZWaJZWaJZWaJdVaJdVaZdVaZdVaJZUaJZUaJZUapZUapZUaZZSaZZSaZZSaJZSaJZSaZVRaZVRaZZQaZZQaZZQaZZQapZQapZQapZQaZVPaZVPa5VPa5VP",
  ,
  "apVNapVNapVNapVNapVNaZRMaZRMapRMapRMapRMapVLapVLapVLapVLaZRKaZRKa5VJa5VJa5VJa5VJa5VJapVHapVHapVHapVHapVHapVHbJVHbJVHa5RG",
  ,
  "a5RGa5RGa5VFa5VFbZVFbJREbJREbJVDbJVDbJVDa5RCa5RCbJRCbJRCbJRCa5RAa5RAa5RAa5RAa5RAa5RAa5RAa5RAapM/bpU/bpU/bZQ+bpY+bZU9cJY+",
  ,
  "cJY+cJY+b5U9b5U9cJc9cJc9b5Y8b5Y8Hr4CHr4CHr4CHr4DH74EH74EH74FH74FH74Fa5mRa5mRbJiQbJiQbZmPbZmPbZmPbZmPbpiObpiObpiOb5mOb5mO",
  ,
  "b5mNb5mNb5mMb5mMcJqNcJqMcJqMcJqMcJqMcJqMcZmKcZmKcpqKcpqKcpqKc5mJc5mJc5mJdJqIdJqIdJqIdJqHdJqHdJqHdZuHdZuHdZuGdZuGdJqEdJqE",
  ,
  "dJqEdJqEc5uDc5uCcpqBcpqBcpqAcpp/cpp/cJp9cJp9cJp9cJp8cJp8cJp8cJp8cJp8bpp6bpp5bpp5bpp3bpp3bpp3bZl2bZl1bZl1bZl0bZl0a5lxa5lx",
  ,
  "appwappwappwappwappwaZluaZluaZluaZluaZltaZltaJhqaJhqaJhqZ5lpZ5loZphnZphnZZllZZllZZllZZllZZllZphkZphkZphkZ5hkZphkZphkZZhi",
  ,
  "ZZhiZZhiZphiZphiZpdhZpdhZpdhZpdhZ5dhZ5hgZ5hgZ5hgZ5hgZpdfZpdfZ5dfZ5dfZ5dfZ5dfZZddZ5ddZpddZpddZpddZ5ZcZ5ZcZpdbZpdbZpdbZpdb",
  ,
  "aJdbZ5ZaaJZaaJZaaJZaaJdZaJdZZ5ZYZ5ZYZ5ZYZpZYaJZYZ5dXZ5dXZ5dXZ5ZWZ5ZWaJZWaJZWaJdVaJdVaJdVaJdVaJZUaJZUaJZUapZUapZUaZZSaZZS",
  ,
  "aZZSaJZSaJZSZ5VRZ5VRaZZQaZZQaZZQaZZQaZZQapZQapZQaZVPaZVPaZVPaZVPapVNapVNapVNapVNapVNaZRMaZRMaZRMaZRMapRMapVLapVLapVLapVL",
  ,
  "aZRKaZRKaZVJaZVJaZVJa5VJa5VJapVHapVHapVHapVHapVHapVHapVHapVHaZRGa5RGa5RGa5VFa5VFa5VFapREbJREbJVDbJVDbJVDa5RCa5RCa5RCa5RC",
  ,
  "a5RCa5RAa5RAa5RAa5RAa5RAa5RAa5RAa5RAapM/apM/apM/a5Q+bZQ+bZQ+bZU9bZU9bZU9bZU9bZU9b5U9b5U9b5Y8b5Y8H74CH74CH74CH74DIL4EIL4E",
  ,
  "IL4FIL4FIL4FIL0Fa5mRbJiQbJiQbJiPbJiPbZmPbZmPbpiObpiObpiObpiOb5mOb5mNb5mNb5mMb5mMcJqNcJqMcJqMcJqMcJqMcJqMcZmKcZmKcZmKcpqK",
  ,
  "cpqKcpqKc5mJc5mJc5mIc5mIdJqIdJqIdJqHdJqHdZuHdZuHdZuGdZuGdJqEdJqEdJqEdJqEc5uDc5uDcpqBcpqBcpqBcpp/cpp/cJp+cJp9cJp9cJp9cJp8",
  ,
  "cJp8cJp8cJp8bpp6bpp6bpp5bpp5bpp3bpp3bZl2bZl2bZl1bZl1bZl1a5lxa5lxappxappwappwappwappwaZluaZluaZluaZluaZluaZltaJhraJhqaJhq",
  ,
  "Z5lpZ5lpZphnZphnZZllZZllZZllZZllZZllZphkZphkZphkZphkZphkZphkZZhiZZhiZZhiZphiZphiZZdhZZdhZZdhZpdhZpdhZ5hgZ5hgZ5hgZ5hgZpdf",
  ,
  "ZpdfZpdfZ5dfZ5dfZ5dfZZddZZddZpddZpddZpddZZZcZ5ZcZpdbZpdbZpdbZpdbZpdbZ5ZaZ5ZaZ5ZaZ5ZaaJdZaJdZZ5ZYZ5ZYZ5ZYZpZYZpZYZpdXZ5dX",
  ,
  "Z5dXZ5ZWZ5ZWZ5ZWZ5ZWaJdVaJdVaJdVaJdVaJZUaJZUaJZUaJZUaJZUaZZSaZZSaZZSaJZSaJZSZ5VRZ5VRZ5ZQZ5ZQaZZQaZZQaZZQaZZQaZZQaJVPaZVP",
  ,
  "aZVPaZVPaJVNaJVNaJVNapVNapVNaZRMaZRMaZRMaZRMaZRMaZVLapVLapVLapVLaZRKaZRKaZVJaZVJaZVJaZVJaZVJapVHapVHapVHapVHapVHapVHapVH",
  ,
  "apVHaZRGaZRGaZRGa5VFa5VFa5VFapREapREapVDbJVDbJVDa5RCa5RCa5RCa5RCa5RCapRAapRAa5RAa5RAa5RAa5RAa5RAa5RAapM/apM/apM/a5Q+a5Q+",
  ,
  "apM9bZQ+bZQ+bZQ+bJQ8bJQ8bZU9bZU9b5Y8b5Y8H74CH74CH74CH74DIL4EIL4EIL4FIL4FIL4FIL0FIL0Fa5mRbJiQbJiPbJiPbZmPbZmPbZmPbpiObpiO",
  ,
  "bpiOb5mOb5mNb5mNb5mMb5mMb5mMcJqMcJqMcJqMcJqMcJqMcJqLcZmKcZmKcZmJcZmJcpqKcpqJc5mJc5mIc5mIdJqIdJqIdJqIdJqHdZuIdZuIdZuGdZuG",
  ,
  "dJqEdJqEdJqEdJqEc5uDc5uDcpqBcpqBcpqBcpqAcpp/cJp+cJp+cJp+cJp9cJp9cJp8cJp8cJp8bpp6bpp6bpp6bpp5bpp5bpp5bZl2bZl2bZl1bZl1bZl1",
  ,
  "a5lza5lxappxappxappwappwappwaZluaZluaZluaZluaZluaZluaJhraJhraJhrZ5lrZ5lpZphoZphnZZlmZZlmZZllZZllZZllZphkZphkZphkZphkZphk",
  ,
  "ZphkZZhiZZhiZZhiZphiZphiZZdhZZdhZZdhZZdhZpdhZZhgZZhgZZhgZZhgZpdfZpdfZpdfZ5dfZ5dfZ5dfZZddZZddZpddZpddZpddZZZcZZZcZZdbZpdb",
  ,
  "ZpdbZpdbZpdbZ5ZaZ5ZaZ5ZaZ5ZaZpdZaJdZZ5ZYZ5ZYZ5ZYZpZYZpZYZpdXZpdXZpdXZZZWZ5ZWZ5ZWZ5ZWaJdVaJdVaJdVaJdVZ5ZUaJZUaJZUaJZUaJZU",
  ,
  "Z5ZSZ5ZSZ5ZSaJZSaJZSZ5VRZ5VRZ5ZQZ5ZQZ5ZQZ5ZQaZZQaZZQaZZQaJVPaJVPaJVPaZVPaJVNaJVNaJVNaJVNaJVNaZRMaZRMaZRMaZRMaZRMaZVLaZVL",
  ,
  "aZVLaZVLaZRKaZRKZ5VJZ5VJaZVJaZVJaZVJaJVHaJVHaJVHapVHapVHapVHapVHapVHaZRGaZRGaZRGaZVFaZVFaZVFapREapREapVDapVDapVDaZRCa5RC",
  ,
  "a5RCa5RCa5RCapRAapRAapRAapRAapRAapRAa5RAa5RAapM/apM/apM/a5Q+a5Q+apM9apM9apM9apM9apQ8apQ8bJQ8bJQ8bJQ8bJQ8IL4CIL4CIL4CIL4D",
  ,
  "Ib4EIb4EIb4FIb4FIb4FIb0FIb0FIr0GbJiQbJiPbJiPbZmPbZmPbZmPbpiObpiObpiOb5mOb5mNb5mNb5mMb5mMb5mMcJqMcJqMcJqMcJqMcJqMcJqLcZmK",
  ,
  "cZmKcZmJcZmJcpqKcpqJc5mJc5mIc5mIdJqIdJqIdJqIdJqHdZuIdZuIdZuGdZuGdJqEdJqEdJqEdJqEc5uDc5uDcpqBcpqBcpqBcpqAcpp/cJp+cJp+cJp+",
  ,
  "cJp9cJp9cJp8cJp8cJp8bpp6bpp6bpp6bpp5bpp5bpp5bZl2bZl2bZl1bZl1bZl1a5lza5lxappxappxappwappwappwaZluaZluaZluaZluaZluaZluaJhr",
  ,
  "aJhraJhrZ5lrZ5lpZphoZphnZZlmZZlmZZllZZllZZllZphkZphkZphkZphkZphkZphkZZhiZZhiZZhiZphiZphiZZdhZZdhZZdhZZdhZpdhZZhgZZhgZZhg",
  ,
  "ZZhgZpdfZpdfZpdfZ5dfZ5dfZ5dfZZddZZddZpddZpddZpddZZZcZZZcZZdbZpdbZpdbZpdbZpdbZ5ZaZ5ZaZ5ZaZ5ZaZpdZaJdZZ5ZYZ5ZYZ5ZYZpZYZpZY",
  ,
  "ZpdXZpdXZpdXZZZWZ5ZWZ5ZWZ5ZWaJdVaJdVaJdVaJdVZ5ZUaJZUaJZUaJZUaJZUZ5ZSZ5ZSZ5ZSaJZSaJZSZ5VRZ5VRZ5ZQZ5ZQZ5ZQZ5ZQaZZQaZZQaZZQ",
  ,
  "aJVPaJVPaJVPaZVPaJVNaJVNaJVNaJVNaJVNaZRMaZRMaZRMaZRMaZRMaZVLaZVLaZVLaZVLaZRKaZRKZ5VJZ5VJaZVJaZVJaZVJaJVHaJVHaJVHapVHapVH",
  ,
  "apVHapVHapVHaZRGaZRGaZRGaZVFaZVFaZVFapREapREapVDapVDapVDaZRCa5RCa5RCa5RCa5RCapRAapRAapRAapRAapRAapRAa5RAa5RAapM/apM/apM/",
  ,
  "a5Q+a5Q+apM9apM9apM9apM9apQ8apQ8bJQ8bJQ8bJQ8bJQ8Ib4CIb4CIb4CIb4DIr4EIr4EIr4FIr4FIr4FIr0FIr0FI70GI70HbJiPbJiPbJiPbZmPbZmP",
  ,
  "bpiObpiObpiObpiNb5mNb5mNb5mMb5mMb5mMb5mMcJqMcJqMcJqMcJqMcJqLcJqLcpqLcpqLcpqLcpqJcpqJcpqJc5uJc5uJc5uIdJqIdJqIdJqIdZuIdZuI",
  ,
  "dZuHdZuGdJqEdJqEdJqEc5uEc5uEcpqBcpqBcpqBcpqBcpqAcJp+cJp+cJp+cJp+cJp+cJp8cJp8cJp8cJp8bpp6bpp6bpp6bpp6bZl2bZl2bZl2bZl1bZl1",
  ,
  "a5l0a5l0a5lzappyappxappxappxappxaZlvaZlvaZluaZluaZluaZluaJhsaJhsZ5lrZ5lrZ5lrZphoZphoZZlmZZlmZZlmZZlmZZlmZJhkZJhkZJhkZZhk",
  ,
  "ZZhkZZhkZZhiZZhiZZhiZphiZphiZZdhZZdhZZdhZZdhZZdhZZhgZJhgZZlfZZlfZZlfZZlfZZheZZheZZheZZheZpheZpheZZhcZZhcZZhcZZhcZZhcZZdb",
  ,
  "ZZdbZZdbZZdbZpdbZpdbZpdbZZdZZZdZZZdZZphYZphYZZZYZpZYZpZYZpZYZpdXZpdXZZZWZZZWZZZWZZZWZ5ZWZpdVZpdVZpdVZ5ZUZ5ZUZpZUZpZUZpZU",
  ,
  "ZpdTZpdTZ5dRZ5dRZ5dRZ5dRZ5dRZ5dRZ5ZQZ5ZQZ5ZQZ5ZQZ5ZQZ5dPZ5dPZ5dPZ5ZOZ5ZOZ5ZOZ5ZOZpVNZpVNaJVNaJZMaJZMaJZMaJZMaJZMaJZMZ5VL",
  ,
  "aZVLaJZKaJZKaJZKZ5VJZ5VJZ5VJZ5VJZ5VJZpVHaJVHaJVHaJVHaJVHaJVHaJVHaJVHaJZGaJZGapZGaZVFaZVFaZZEaZZEaZZEaJVDaJVDaJZCapZCapZC",
  ,
  "aZVBaZVBaZVBaZVBaZVBaZVBaZVBa5VBapRAapRAapRAaZU/aZU/aJQ+aJQ+aJQ+aJQ+aJQ+Z5Q8apQ8apQ8apQ8apQ8apQ8apQ8apQ8aZM7aZM7Ir4DIr4D",
  ,
  "Ir4DIr4EI74FI74FI74FI74FI74FI70GI70GJL0HJL0IJL0IbJiPbJiPbZmPbZmPbZmObZmObpiObpiNb5mNb5mNb5mNb5mNb5mMb5mMcJqMcJqMcJqMcJqM",
  ,
  "cJqLcJqLcpqLcpqLcpqLcpqKcpqJcpqJc5uJc5uJc5uIc5uIdJqIdJqIdZuIdZuIdZuHdZuHdJqEdJqEdJqEc5uEc5uEcpqCcpqBcpqBcpqBcpqAcJp+cJp+",
  ,
  "cJp+cJp+cJp+cJp8cJp8cJp8cJp8bpp6bpp6bpp6bpp6bZl3bZl3bZl2bZl2bZl1a5l0a5l0a5l0appyappyappxappxappxaZlwaZlvaZlvaZluaZluaZlu",
  ,
  "aJhsaJhsZ5lrZ5lrZ5lrZphoZphoZZlmZZlmZZlmZZlmZZlmZJhkZJhkZJhkZJhkZZhkZZhkY5hiZZhiZZhiZZhiZphiZZdhZZdhZZdhZZdhZZdhZZhgZJhg",
  ,
  "ZZlfZZlfZZlfZZlfZJheZZheZZheZZheZZheZpheZZhcZZhcZZhcZZhcZZhcZZdbZZdbZZdbZZdbZZdbZZdbZpdbZZdZZZdZZZdZZphYZphYZZZYZZZYZZZY",
  ,
  "ZpZYZpdXZpdXZZZWZZZWZZZWZZZWZZZWZpdVZpdVZpdVZZZUZ5ZUZpZUZpZUZpZUZpdTZpdTZ5dRZ5dRZ5dRZ5dRZ5dRZ5dRZ5ZQZ5ZQZ5ZQZ5ZQZ5ZQZ5dP",
  ,
  "Z5dPZ5dPZpZOZpZOZ5ZOZ5ZOZpVNZpVNZpVNZpZMaJZMaJZMaJZMaJZMaJZMZ5VLZ5VLaJZKaJZKaJZKZ5VJZ5VJZ5VJZ5VJZ5VJZpVHZpVHaJVHaJVHaJVH",
  ,
  "aJVHaJVHaJVHaJZGaJZGaJZGZ5VFaZVFaZZEaZZEaZZEaJVDaJVDaJZCaJZCaJZCZ5VBaZVBaZVBaZVBaZVBaZVBaZVBaZVBaJRAapRAapRAaZU/aZU/aJQ+",
  ,
  "aJQ+aJQ+aJQ+aJQ+Z5Q8Z5Q8Z5Q8Z5Q8Z5Q8apQ8apQ8apQ8aZM7aZM7I70DI70DI70DI70EJL0FJL0FJL0FJL0FJL0FJLwGJLwGJLwHJLwIJLwIJLwIbJiP",
  ,
  "bJiObZmPbZmObZmObZmObpiNbpiNb5mNb5mNb5mNb5mNb5mMb5mMcJqMcJqMcJqMcJqLcJqLcJqKcpqLcpqLcpqKcpqKcpqJcpqJcpqJc5uIc5uIc5uIdJqI",
  ,
  "dJqIdJqIdZuHdZuHdJqFdJqEdJqEc5uEc5uEcpqCcpqCcpqCcpqBcpqBcJp+cJp+cJp+cJp+cJp+cJp9cJp8cJp8cJp8bpp7bpp6bpp6bpp6bZl3bZl3bZl3",
  ,
  "bZl2bZl2a5l0a5l0a5l0appyappyappyappyappyaZlwaZlwaZlvaZlvaZlvaZlvaJhsaJhsZ5lrZ5lrZ5lrZphqZphoZZloZZlmZZlmZZlmZZlmZJhkZJhk",
  ,
  "ZJhkZJhkZJhkZJhkY5hiY5hiY5hiZZhiZZhiY5dhZZdhZZdhZZdhZZdhZJhgZJhgZZlfZZlfZZlfZZlfZJheZJheZZheZZheZZheZZheY5hcZZhcZZhcZZhc",
  ,
  "ZZhcZZdbZZdbZZdbZZdbZZdbZZdbZZdbZZdZZZdZZZdZZJhYZphYZZZYZZZYZZZYZZZYZJdXZpdXZZZWZZZWZZZWZZZWZZZWZpdVZpdVZpdVZZZUZZZUZZZU",
  ,
  "ZpZUZpZUZpdTZpdTZZdRZZdRZZdRZ5dRZ5dRZ5dRZZZQZZZQZZZQZ5ZQZ5ZQZ5dPZ5dPZ5dPZpZOZpZOZpZOZpZOZpVNZpVNZpVNZpZMZpZMZpZMZpZMaJZM",
  ,
  "aJZMZ5VLZ5VLZ5ZKZ5ZKaJZKZ5VJZ5VJZ5VJZ5VJZ5VJZpVHZpVHZpVHZpVHaJVHZpVHaJVHaJVHaJZGaJZGaJZGZ5VFZ5VFZ5ZEZ5ZEZ5ZEaJVDaJVDaJZC",
  ,
  "aJZCaJZCZ5VBZ5VBZ5VBaZVBaZVBaZVBaZVBaZVBaJRAaJRAaJRAZ5U/Z5U/aJQ+aJQ+aJQ+aJQ+aJQ+Z5Q8Z5Q8Z5Q8Z5Q8Z5Q8Z5Q8Z5Q8Z5Q8aZM7aZM7",
  ,
  "I70DI70DI70DI70EJL0FJL0FJL0FJL0FJL0FJLwGJLwGJLwHJLwIJLwIJLwIJLwJbJiObJiObZmObZmObZmObpiNbpiNbpiMb5mNb5mNb5mNb5mMb5mMb5mM",
  ,
  "b5mMcJqMcJqLcJqLcJqKcJqKcJqKcpqKcpqKcpqJcpqJcpqJcpqIc5uIc5uIc5uIdJqIdJqIdJqHdZuHdJqFdJqFdJqFc5uEc5uEcpqCcpqCcpqCcpqBcpqB",
  ,
  "cJp/cJp+cJp+cJp+cJp+cJp9cJp9cJp8cJp8bpp7bpp7bpp6bpp6bZl3bZl3bZl3bZl3bZl2a5l0a5l0a5l0appyappyappyappyappyaZlwaZlwaZlwaZlv",
  ,
  "aZlvaZlvaJhsaJhsZ5lrZ5lrZ5lrZphqZphqZZloZZloZZloZZloZZlmZJhmZJhkZJhkZJhkZJhkZJhkY5hiY5hiY5hiZZhiZZhiY5dhY5dhY5dhZZdhZZdh",
  ,
  "ZJhgZJhgY5lfY5lfY5lfZZlfZJheZJheZZheZZheZZheZZheY5hcY5hcY5hcZZhcZZhcY5dbZZdbZZdbZZdbZZdbZZdbZZdbZZdZZZdZZZdZZJhYZJhYZJZY",
  ,
  "ZZZYZZZYZZZYZJdXZJdXZZZWZZZWZZZWZZZWZZZWZpdVZpdVZpdVZZZUZZZUZZZUZZZUZZZUZZdTZpdTZZdRZZdRZZdRZZdRZZdRZ5dRZZZQZZZQZZZQZZZQ",
  ,
  "ZZZQZ5dPZ5dPZ5dPZpZOZpZOZpZOZpZOZZVNZZVNZZVNZpZMZpZMZpZMZpZMZpZMZpZMZ5VLZ5VLZ5ZKZ5ZKZ5ZKZpVJZ5VJZ5VJZ5VJZ5VJZpVHZpVHZpVH",
  ,
  "ZpVHZpVHZpVHZpVHZpVHaJZGaJZGaJZGZ5VFZ5VFZ5ZEZ5ZEZ5ZEZpVDZpVDaJZCaJZCaJZCZ5VBZ5VBZ5VBZ5VBZ5VBZ5VBZ5VBaZVBaJRAaJRAaJRAZ5U/",
  ,
  "Z5U/ZpQ+ZpQ+ZpQ+aJQ+aJQ+Z5Q8Z5Q8Z5Q8Z5Q8Z5Q8Z5Q8Z5Q8Z5Q8ZpM7ZpM7JL0DJL0DJL0DJL0EJL0FJL0FJL0FJL0FJL0FJLwGJLwGJLwHJbwIJbwI",
  ,
  "JbwIJbwJJbwKbJiObZmObZmObZmObpiNbpiNbpiMb5mNb5mNb5mNb5mMb5mMb5mMb5mMcJqMcJqLcJqLcJqKcJqKcJqKcpqKcpqKcpqJcpqJcpqJcpqIc5uI",
  ,
  "c5uIc5uIdJqIdJqIdJqHdZuHdJqFdJqFdJqFc5uEc5uEcpqCcpqCcpqCcpqBcpqBcJp/cJp+cJp+cJp+cJp+cJp9cJp9cJp8cJp8bpp7bpp7bpp6bpp6bZl3",
  ,
  "bZl3bZl3bZl3bZl2a5l0a5l0a5l0appyappyappyappyappyaZlwaZlwaZlwaZlvaZlvaZlvaJhsaJhsZ5lrZ5lrZ5lrZphqZphqZZloZZloZZloZZloZZlm",
  ,
  "ZJhmZJhkZJhkZJhkZJhkZJhkY5hiY5hiY5hiZZhiZZhiY5dhY5dhY5dhZZdhZZdhZJhgZJhgY5lfY5lfY5lfZZlfZJheZJheZZheZZheZZheZZheY5hcY5hc",
  ,
  "Y5hcZZhcZZhcY5dbZZdbZZdbZZdbZZdbZZdbZZdbZZdZZZdZZZdZZJhYZJhYZJZYZZZYZZZYZZZYZJdXZJdXZZZWZZZWZZZWZZZWZZZWZpdVZpdVZpdVZZZU",
  ,
  "ZZZUZZZUZZZUZZZUZZdTZpdTZZdRZZdRZZdRZZdRZZdRZ5dRZZZQZZZQZZZQZZZQZZZQZ5dPZ5dPZ5dPZpZOZpZOZpZOZpZOZZVNZZVNZZVNZpZMZpZMZpZM",
  ,
  "ZpZMZpZMZpZMZ5VLZ5VLZ5ZKZ5ZKZ5ZKZpVJZ5VJZ5VJZ5VJZ5VJZpVHZpVHZpVHZpVHZpVHZpVHZpVHZpVHaJZGaJZGaJZGZ5VFZ5VFZ5ZEZ5ZEZ5ZEZpVD",
  ,
  "ZpVDaJZCaJZCaJZCZ5VBZ5VBZ5VBZ5VBZ5VBZ5VBZ5VBaZVBaJRAaJRAaJRAZ5U/Z5U/ZpQ+ZpQ+ZpQ+aJQ+aJQ+Z5Q8Z5Q8Z5Q8Z5Q8Z5Q8Z5Q8Z5Q8Z5Q8",
  ,
  "ZpM7ZpM7JL0DJL0DJL0DJL0EJL0FJb0FJb0FJb0FJb0FJbwGJbwGJbwHJrwIJrwIJrwIJrwJJrwKJrwKbZmObZmObZmObpiNbpiNbpiMb5mNb5mNb5mMb5mM",
  ,
  "b5mMb5mMb5mMcJqLcJqLcJqKcJqKcJqKcJqKcpqKcpqJcpqJcpqJcpqJcpqIc5uIc5uIc5uIdJqHdJqHdJqHdJqFdJqFc5uFc5uFc5uEcpqCcpqCcpqBcpqB",
  ,
  "cpqBcJp/cJp/cJp+cJp+cJp+cJp+cJp9cJp9bpp7bpp7bpp7bpp6bpp6bZl3bZl3bZl3bZl3bZl3a5l0a5l0a5l0appzappyappyappyaZlwaZlwaZlwaZlw",
  ,
  "aZlvaZlvaZlvaJhsaJhsZ5lrZ5lrZ5lrZphqZphqZZlpZZloZZloZZloZZloZJhmZJhmZJhkZJhkZJhkYphiY5hiY5hiZZhiZZhiZZhiY5dhY5dhY5dhY5dh",
  ,
  "ZZdhZJhgZJhgY5lfY5lfY5lfY5lfZJheZJheZJheZZheZZheY5hcY5hcY5hcY5hcY5hcY5dbY5dbY5dbZZdbZZdbZZdbZZdbZZdbY5dZZZdZZZdZZJhYZJhY",
  ,
  "ZJZYZJZYZJdXZJdXZJdXZZZWZZZWZZZWZZZWZZZWZZdVZpdVZpdVZZZUZZZUZZZUZZZUZZZUZJZSZJZSZZdTZZdRZZdRZZdRZZdRZZdRZJZQZZZQZZZQZZZQ",
  ,
  "ZZZQZZdPZZdPZpZOZpZOZpZOZpZOZpZOZpZOZZVNZZVNZZVNZJZMZpZMZpZMZpZMZpZMZZVLZZVLZ5ZKZ5ZKZpVJZpVJZpVJZpVJZ5VJZpVHZpVHZpVHZpVH",
  ,
  "ZpVHZpVHZpVHZpVHZpVHZpZGZpZGZ5VFZ5VFZ5VFZ5ZEZ5ZEZpVDZpVDZpVDaJZCaJZCZ5VBZ5VBZ5VBZ5VBZ5VBZ5VBZ5VBZ5VBZ5VBZpRAaJRAZ5U/Z5U/",
  ,
  "Z5U/ZpQ+ZpQ+ZpQ+ZpQ+ZpQ+Z5Q8Z5Q8Z5Q8Z5Q8Z5Q8Z5Q8Z5Q8Z5Q8ZpM7ZpM7ZpQ6ZpQ6JL0EJL0EJL0EJL0FJL0FJb0FJb0GJb0GJb0GJbwHJbwHJbwI",
  ,
  "JrwJJrwJJrwJJrwKJrwKJrwLJrwLbZmObZmObZmNbpiNbpiMb5mNb5mNb5mMb5mMb5mMb5mMb5mMb5mLcJqLcJqKcJqKcJqKcJqKcJqKcpqJcpqJcpqJcpqJ",
  ,
  "cpqIcpqIc5uIc5uIdJqHdJqHdJqHdJqGdJqFc5uFc5uFc5uFcpqCcpqCcpqBcpqBcpqBcJqAcJp/cJp/cJp+cJp+cJp+cJp+cJp9bpp7bpp7bpp7bpp6bpp6",
  ,
  "bZl3bZl3bZl3bZl3bZl3a5l1a5l0a5l0appzappzappyappyaZlwaZlwaZlwaZlwaZlvaZlvaZlvaJhtaJhsZ5lsZ5lrZ5lrZphqZphqZZlpZZlpZZloZZlo",
  ,
  "ZZloZJhnZJhmZJhlZJhlZJhkYphiYphiY5hiY5hiY5hiY5hiY5dhY5dhY5dhY5dhY5dhZJhgZJhgY5lfY5lfY5lfY5lfYpheYpheZJheZJheZJheY5hcY5hc",
  ,
  "Y5hcY5hcY5hcY5dbY5dbY5dbY5dbZZdbZZdbZZdbZZdbY5dZY5dZY5dZZJhYZJhYZJZYZJZYY5dXY5dXZJdXZJZWZJZWZZZWZZZWZZZWZZdVZZdVZZdVZZZU",
  ,
  "ZZZUZZZUZZZUZZZUZJZSZJZSZZdTY5dRY5dRZZdRZZdRZZdRZJZQZJZQZJZQZZZQZZZQZZdPZZdPZJZOZJZOZJZOZpZOZpZOZpZOZZVNZZVNZZVNZJZMZJZM",
  ,
  "ZJZMZpZMZpZMZZVLZZVLZZZKZZZKZpVJZpVJZpVJZpVJZpVJZJVHZJVHZpVHZpVHZpVHZpVHZpVHZpVHZpVHZpZGZpZGZZVFZZVFZZVFZZZEZ5ZEZpVDZpVD",
  ,
  "ZpVDZpZCZpZCZ5VBZ5VBZ5VBZ5VBZ5VBZ5VBZ5VBZ5VBZ5VBZpRAZpRAZZU/Z5U/Z5U/ZpQ+ZpQ+ZpQ+ZpQ+ZpQ+ZZQ8ZZQ8ZZQ8Z5Q8Z5Q8Z5Q8Z5Q8Z5Q8",
  ,
  "ZpM7ZpM7ZpQ6ZpQ6Jb0EJb0EJb0EJb0FJb0FJr0FJr0GJr0GJr0GJrwHJrwHJrwIJ7wJJ7wJJ7wJJ7wKJ7wKJ7wLJ7wLKLsMbZmObZmNbZmNbpiMbpiMbpiM",
  ,
  "b5mMb5mMb5mMb5mMb5mMb5mLcJqLcJqKcJqKcJqKcJqKcJqKcJqJcpqJcpqJcpqJcpqIcpqIcpqIc5uIc5uHc5uHdJqHdJqGdJqGc5uFc5uFc5uFcpqDcpqC",
  ,
  "cpqBcpqBcpqBcJqAcJqAcJp/cJp/cJp/cJp+cJp+cJp+bpp7bpp7bpp7bpp7bpp6bZl4bZl3bZl3bZl3bZl3a5l1a5l1a5l1appzappzappzappyaZlxaZlx",
  ,
  "aZlxaZlwaZlwaZlvaZlvaJhtaJhtZ5lsZ5lsZ5lsZphqZphqZZlpZZlpZZlpZZlpZZlpZJhnZJhnZJhlZJhlZJhlYphiYphiYphiY5hiY5hiY5hiYpdhY5dh",
  ,
  "Y5dhY5dhY5dhZJhgZJhgY5lfY5lfY5lfY5lfYpheYpheZJheZJheZJheYphcYphcY5hcY5hcY5hcYpdbY5dbY5dbY5dbY5dbY5dbY5dbZZdbY5dZY5dZY5dZ",
  ,
  "Y5hYY5hYZJZYZJZYY5dXY5dXY5dXZJZWZJZWZJZWZJZWZJZWZZdVZZdVZZdVZJZUZJZUZJZUZZZUZZZUZJZSZJZSZZdTY5dRY5dRY5dRY5dRY5dRZJZQZJZQ",
  ,
  "ZJZQZJZQZJZQY5dPZZdPZJZOZJZOZJZOZJZOZJZOZpZOZZVNZZVNZZVNZJZMZJZMZJZMZJZMZJZMY5VLZZVLZZZKZZZKZJVJZJVJZJVJZpVJZpVJZJVHZJVH",
  ,
  "ZJVHZJVHZpVHZpVHZpVHZpVHZpVHZpZGZpZGZZVFZZVFZZVFZZZEZZZEZJVDZJVDZpVDZpZCZpZCZZVBZZVBZZVBZ5VBZ5VBZ5VBZ5VBZ5VBZ5VBZpRAZpRA",
  ,
  "ZZU/ZZU/ZZU/ZJQ+ZpQ+ZpQ+ZpQ+ZpQ+ZZQ8ZZQ8ZZQ8ZZQ8ZZQ8ZZQ8ZZQ8Z5Q8ZpM7ZpM7ZpQ6ZpQ6Jb0EJb0EJb0EJb0FJb0FJr0FJr0GJr0GJr0GJrwH",
  ,
  "JrwHJrwIJ7wJJ7wJJ7wJJ7wKJ7wKJ7wLJ7wLKLsMKLsMbZmNbZmNbpqNbpqNbpqNbpqMbpqMbpqMcJqMcJqMcJqMcJqMcJqKcJqKcJqKcJqKcJqKcJqJcpqJ",
  ,
  "cpqJcpqJcpqJcpqIcpqIcpqIc5uHc5uHc5uHdJqGdJqGc5uFc5uFc5uFcpqDcpqDcpqBcpqBcpqBcJqAcJqAcJqAcJp/cJp/cJp/cJp+cJp+bpp8bpp8bpp7",
  ,
  "bpp7bpp7bZl4bZl4bZl4bZl3bZl3a5l1a5l1a5l1app0app0appzappzaZlxaZlxaZlxaZlxaZlwaZlwaZlwaJhtaJhtZ5lsZ5lsZ5lsZphqZphqZZlpZZlp",
  ,
  "ZZlpZZlpZZlpZZlnZZlnY5lmY5lmY5lmY5lkY5lkYphiYphiYphiYphiYplhYplhZJlhZJlhZJlhY5hgY5hgY5lfY5lfY5lfY5lfYpheYpheZJheZJheZJhe",
  ,
  "YphcYphcYphcYphcYphcYpdbYpdbY5dbY5dbY5lbY5lbY5haY5haZJhaZJhaZJhaY5hYY5hYY5hYY5hYY5dXY5dXY5dXY5hWY5hWY5hWY5hWZJhWY5dVY5dV",
  ,
  "Y5dVZJdVZJdVZJdVY5dTY5dTZZdTZZdTZZdTY5dRY5dRY5dRY5dRY5dRYpZQYpZQZJZQZJZQZJZQY5dPY5dPY5hOZZhOZZhOZJZOZJZOZJZOZJdNZZdNZZdN",
  ,
  "ZJZMZJZMZJZMZJZMZJZMZJdLZJdLY5ZKZZZKZZdJZZdJZZdJZJVJZJVJZZZIZZZIZZZIZJVHZJVHZJVHZJVHZJVHZJVHZJZGZpZGZZVFZZVFZZVFZZZEZZZE",
  ,
  "ZZZEZZZEZZZEZJZCZJZCZJZCZJZCZJZCZZVBZZVBZZVBZZVBZZVBZZVBZpZAZpZAZZU/ZZU/ZZU/ZZY+ZZY+ZJU9ZJU9ZJU9ZJU9ZJU9ZJU9ZpU9ZpU9ZpU9",
  ,
  "ZZQ8ZZQ8ZZU7ZZU7ZpQ6ZpQ6Jr0EJr0EJr0EJr0FJr0FJ70FJ70GJ70GJ70GJ7wHJ7wHJ7wIKLwJKLwJKLwJKLwKKLwKKLwLKLwLKLsMKbsMKbsMbZmNbpqN",
  ,
  "bpqNbpqNbpqMbpqMbpqMcJqMcJqMcJqMcJqMcJqKcJqKcJqKcJqKcJqKcJqJcpqJcpqJcpqJcpqJcpqIcpqIcpqIc5uHc5uHc5uHdJqGdJqGc5uFc5uFc5uF",
  ,
  "cpqDcpqDcpqBcpqBcpqBcJqAcJqAcJqAcJp/cJp/cJp/cJp+cJp+bpp8bpp8bpp7bpp7bpp7bZl4bZl4bZl4bZl3bZl3a5l1a5l1a5l1app0app0appzappz",
  ,
  "aZlxaZlxaZlxaZlxaZlwaZlwaZlwaJhtaJhtZ5lsZ5lsZ5lsZphqZphqZZlpZZlpZZlpZZlpZZlpZZlnZZlnY5lmY5lmY5lmY5lkY5lkYphiYphiYphiYphi",
  ,
  "YplhYplhZJlhZJlhZJlhY5hgY5hgY5lfY5lfY5lfY5lfYpheYpheZJheZJheZJheYphcYphcYphcYphcYphcYpdbYpdbY5dbY5dbY5lbY5lbY5haY5haZJha",
  ,
  "ZJhaZJhaY5hYY5hYY5hYY5hYY5dXY5dXY5dXY5hWY5hWY5hWY5hWZJhWY5dVY5dVY5dVZJdVZJdVZJdVY5dTY5dTZZdTZZdTZZdTY5dRY5dRY5dRY5dRY5dR",
  ,
  "YpZQYpZQZJZQZJZQZJZQY5dPY5dPY5hOZZhOZZhOZJZOZJZOZJZOZJdNZZdNZZdNZJZMZJZMZJZMZJZMZJZMZJdLZJdLY5ZKZZZKZZdJZZdJZZdJZJVJZJVJ",
  ,
  "ZZZIZZZIZZZIZJVHZJVHZJVHZJVHZJVHZJVHZJZGZpZGZZVFZZVFZZVFZZZEZZZEZZZEZZZEZZZEZJZCZJZCZJZCZJZCZJZCZZVBZZVBZZVBZZVBZZVBZZVB",
  ,
  "ZpZAZpZAZZU/ZZU/ZZU/ZZY+ZZY+ZJU9ZJU9ZJU9ZJU9ZJU9ZJU9ZpU9ZpU9ZpU9ZZQ8ZZQ8ZZU7ZZU7ZpQ6ZpQ6J70EJ70EJ70EJ70FJ70FKL0FKL0GKL0G",
  ,
  "KL0GKLwHKLwHKLwIKLwJKLwJKbwJKbwKKbwKKbwLKbwLKbsMKrsMKrsMKrsNbZmNbpqMbpqMbpqMbpqMbpqMbpqMbpqMcJqMcJqMcJqLcJqKcJqKcJqKcJqK",
  ,
  "cJqJcJqJcpqJcpqJcpqJcpqJcpqIcpqHc5uHc5uHc5uHc5uHc5uFc5uFc5uFcpqEcpqDcpqCcpqBcpqBcpqBcJqAcJqAcJqAcJqAcJqAcJp+cJp+bpp8bpp8",
  ,
  "bpp8bpp8bpp7bZl4bZl4bZl3bZl3bZl3a5l1a5l1app0app0app0app0app0aZlyaZlyaZlyaZlxaZlwaZlwaJhtaJhtaJhtZ5ltZ5lsZphrZphrZphqZZlp",
  ,
  "ZZlpZZlpZZlpZZlpZZlnZZlnY5lmY5lmY5lmY5lkY5lkYphiYphiYZlhYZlhYZlhYZlhYplhYplhYplhYphgY5hgYplfYplfYpheYpheYpheYpheZJheZJhe",
  ,
  "YphcYphcYphcYphcYphcYpdbYpdbYpdbYpdbYpdbYpdbY5haY5haY5haY5haY5haYZhYYZhYY5hYY5hYY5hYYZdXYZdXYZdXY5hWY5hWY5hWY5hWY5hWYZdV",
  ,
  "YZdVY5dVY5dVY5dTY5dTY5dTY5dTY5dTYpdRYpdRYpdRY5dRY5dRY5dRY5dRYpZQYpZQYpZQYpZQY5dPY5dPY5dPY5hOY5hOYpZOYpZOYpZOZJdNZJdNY5ZM",
  ,
  "Y5ZMY5ZMY5ZMZJZMZJdLZJdLZJdLY5ZKY5ZKY5dJY5dJY5dJY5dJZJVJZJVJY5ZIY5ZIY5ZIYpVHYpVHZJVHZJVHZJVHZJZGZJZGY5VFZZVFZZZEZZZEZZZE",
  ,
  "ZZZEZZZEZJZCZJZCZJZCZJZCZJZCY5VBY5VBY5VBZZVBZZVBZZVBZJZAZJZAZJZAY5U/Y5U/Y5Y+ZZY+ZZY+ZJU9ZJU9ZJU9ZJU9ZJU9ZJU9ZJU9Y5Q8Y5Q8",
  ,
  "Y5Q8Y5Q8Y5U7ZZU7ZJQ6ZJQ6ZJQ6ZJQ6KLwFKLwFKLwFKLwFKLwGKbwGKbwHKbwHKbwHKbsIKbsIKbsJKbsJKbsJKrsKKrsLKrsLKrsMKrsMKrsMKrsMKrsN",
  ,
  "KrsOKrsObZmMbZmMbpqMbpqMbpqMbpqMbpqMbpqLcJqMcJqLcJqLcJqKcJqKcJqKcJqJcJqJcJqIcJqIcpqJcpqJcpqJcpqHcpqHcpqHc5uHc5uHc5uGc5uF",
  ,
  "c5uFcpqEcpqEcpqCcpqCcpqCcpqBcJqAcJqAcJqAcJqAcJqAcJp/cJp+bpp9bpp8bpp8bpp8bpp8bZl4bZl4bZl4bZl4bZl3a5l2a5l2app0app0app0app0",
  ,
  "app0aZlyaZlyaZlyaZlyaZlxaZlwaJhuaJhuaJhtZ5ltZ5ltZphrZphrZphrZZlqZZlpZZlpZZlpZZlpZZlnZZlnY5lmY5lmY5lmY5llY5lkYphjYphiYZlh",
  ,
  "YZlhYZlhYZlhYZlhYZlhYZlhYphgYphgYplfYplfYZheYZheYZheYpheYpheYpheYphcYphcYphcYphcYphcYJdbYJdbYpdbYpdbYpdbYpdbYZhaYZhaYZha",
  ,
  "Y5haY5haYZhYYZhYYZhYY5hYY5hYYZdXYZdXYZdXYZhWYZhWY5hWY5hWY5hWYZdVYZdVY5dVY5dVYZdTYZdTYZdTY5dTY5dTYpdRYpdRYpdRYpdRYpdRY5dR",
  ,
  "Y5dRYpZQYpZQYpZQYpZQY5dPY5dPYpdPYZhOY5hOYpZOYpZOYpZOYpdNYpdNY5ZMY5ZMY5ZMY5ZMY5ZMYpdLZJdLZJdLY5ZKY5ZKY5dJY5dJY5dJY5dJYpVJ",
  ,
  "YpVJYpZIY5ZIY5ZIYpVHYpVHYpVHYpVHYpVHZJZGZJZGY5VFY5VFY5ZEY5ZEZZZEY5ZEY5ZEZJZCZJZCZJZCZJZCZJZCY5VBY5VBY5VBY5VBY5VBZZVBZJZA",
  ,
  "ZJZAZJZAY5U/Y5U/Y5Y+Y5Y+Y5Y+YpU9ZJU9ZJU9ZJU9ZJU9ZJU9ZJU9Y5Q8Y5Q8Y5Q8Y5Q8Y5U7Y5U7ZJQ6ZJQ6ZJQ6ZJQ6KLwFKLwFKLwFKLwFKLwGKbwG",
  ,
  "KbwHKbwHKbwHKbsIKbsIKbsJKbsJKbsJKrsKKrsLKrsLKrsMKrsMKrsMKrsMKrsNKrsOKrsOKrsObZmMbpqMbpqMbpqMbpqMbpqMbpqLbpqLcJqLcJqLcJqK",
  ,
  "cJqKcJqKcJqJcJqJcJqIcJqIcJqIcpqJcpqJcpqIcpqHcpqHcpqGc5uHc5uGc5uGc5uGcpqEcpqEcpqDcpqCcpqCcpqCcJqAcJqAcJqAcJqAcJqAcJp/cJp/",
  ,
  "bpp9bpp9bpp9bpp8bpp8bZl5bZl4bZl4bZl4bZl4a5l2a5l2app0app0app0app0app0aZlyaZlyaZlyaZlyaZlxaZlxaJhuaJhuaJhuZ5luZ5ltZphsZphs",
  ,
  "ZphrZZlqZZlqZZlpZZlpZZlpZZloZZlnY5lmY5lmY5lmY5llY5llYphjYphjYZliYZliYZlhYZlhYZlhYZlhYZlhYphgYphgYplfYplfYZheYZheYZheYZhe",
  ,
  "YpheYpheYZhcYZhcYphcYphcYphcYJdbYJdbYJdbYJdbYpdbYpdbYZhaYZhaYZhaYZhaY5haYZhYYZhYYZhYY5hYY5hYYZdXYZdXYZdXYZhWYZhWYZhWYZhW",
  ,
  "YZhWYZdVYZdVYZdVY5dVYZdTYZdTYZdTYZdTYZdTYpdRYpdRYpdRYpdRYpdRYpdRYpdRYpZQYpZQYpZQYpZQYpdPYpdPYpdPYZhOYZhOYZZOYZZOYpZOYpdN",
  ,
  "YpdNYZZMYZZMYZZMY5ZMY5ZMYpdLYpdLYpdLYZZKYZZKY5dJY5dJY5dJY5dJYpVJYpVJYpZIYpZIYpZIYpVHYpVHYpVHYpVHYpVHYpZGYpZGY5VFY5VFY5ZE",
  ,
  "Y5ZEY5ZEY5ZEY5ZEYpZCYpZCYpZCZJZCZJZCY5VBY5VBY5VBY5VBY5VBY5VBYpZAYpZAYpZAY5U/Y5U/Y5Y+Y5Y+Y5Y+YpU9YpU9YpU9YpU9YpU9ZJU9ZJU9",
  ,
  "Y5Q8Y5Q8Y5Q8Y5Q8Y5U7Y5U7YpQ6YpQ6ZJQ6ZJQ6KbwFKbwFKbwFKbwFKbwGKrwGKrwHKrwHKrwHKrsIKrsIKrsJKrsJKrsJKrsKKrsLKrsLKrsMKrsMKrsM",
  ,
  "KrsMK7sNK7sOK7sOK7sOK7sPbpqMbpqMbpqMbpqMbpqMbpqLbpqLcJqLcJqLcJqKcJqKcJqKcJqJcJqJcJqIcJqIcJqIcpqJcpqJcpqIcpqHcpqHcpqGc5uH",
  ,
  "c5uGc5uGc5uGcpqEcpqEcpqDcpqCcpqCcpqCcJqAcJqAcJqAcJqAcJqAcJp/cJp/bpp9bpp9bpp9bpp8bpp8bZl5bZl4bZl4bZl4bZl4a5l2a5l2app0app0",
  ,
  "app0app0app0aZlyaZlyaZlyaZlyaZlxaZlxaJhuaJhuaJhuZ5luZ5ltZphsZphsZphrZZlqZZlqZZlpZZlpZZlpZZloZZlnY5lmY5lmY5lmY5llY5llYphj",
  ,
  "YphjYZliYZliYZlhYZlhYZlhYZlhYZlhYphgYphgYplfYplfYZheYZheYZheYZheYpheYpheYZhcYZhcYphcYphcYphcYJdbYJdbYJdbYJdbYpdbYpdbYZha",
  ,
  "YZhaYZhaYZhaY5haYZhYYZhYYZhYY5hYY5hYYZdXYZdXYZdXYZhWYZhWYZhWYZhWYZhWYZdVYZdVYZdVY5dVYZdTYZdTYZdTYZdTYZdTYpdRYpdRYpdRYpdR",
  ,
  "YpdRYpdRYpdRYpZQYpZQYpZQYpZQYpdPYpdPYpdPYZhOYZhOYZZOYZZOYpZOYpdNYpdNYZZMYZZMYZZMY5ZMY5ZMYpdLYpdLYpdLYZZKYZZKY5dJY5dJY5dJ",
  ,
  "Y5dJYpVJYpVJYpZIYpZIYpZIYpVHYpVHYpVHYpVHYpVHYpZGYpZGY5VFY5VFY5ZEY5ZEY5ZEY5ZEY5ZEYpZCYpZCYpZCZJZCZJZCY5VBY5VBY5VBY5VBY5VB",
  ,
  "Y5VBYpZAYpZAYpZAY5U/Y5U/Y5Y+Y5Y+Y5Y+YpU9YpU9YpU9YpU9YpU9ZJU9ZJU9Y5Q8Y5Q8Y5Q8Y5Q8Y5U7Y5U7YpQ6YpQ6ZJQ6ZJQ6KrwFKrwFKrwFKrwF",
  ,
  "KrwGKrwGKrwHKrwHKrwHKrsIKrsIKrsJKrsJKrsJK7sKK7sLK7sLK7sMK7sMK7sMK7sMLLsNLLsOLLsOLLsOLLsPLLsPbpqMbpqMbpqMbpqMbpqLbpqLcJqL",
  ,
  "cJqLcJqKcJqKcJqKcJqJcJqJcJqIcJqIcJqIcpqJcpqJcpqIcpqHcpqHcpqGc5uHc5uGc5uGc5uGcpqEcpqEcpqDcpqCcpqCcpqCcJqAcJqAcJqAcJqAcJqA",
  ,
  "cJp/cJp/bpp9bpp9bpp9bpp8bpp8bZl5bZl4bZl4bZl4bZl4a5l2a5l2app0app0app0app0app0aZlyaZlyaZlyaZlyaZlxaZlxaJhuaJhuaJhuZ5luZ5lt",
  ,
  "ZphsZphsZphrZZlqZZlqZZlpZZlpZZlpZZloZZlnY5lmY5lmY5lmY5llY5llYphjYphjYZliYZliYZlhYZlhYZlhYZlhYZlhYphgYphgYplfYplfYZheYZhe",
  ,
  "YZheYZheYpheYpheYZhcYZhcYphcYphcYphcYJdbYJdbYJdbYJdbYpdbYpdbYZhaYZhaYZhaYZhaY5haYZhYYZhYYZhYY5hYY5hYYZdXYZdXYZdXYZhWYZhW",
  ,
  "YZhWYZhWYZhWYZdVYZdVYZdVY5dVYZdTYZdTYZdTYZdTYZdTYpdRYpdRYpdRYpdRYpdRYpdRYpdRYpZQYpZQYpZQYpZQYpdPYpdPYpdPYZhOYZhOYZZOYZZO",
  ,
  "YpZOYpdNYpdNYZZMYZZMYZZMY5ZMY5ZMYpdLYpdLYpdLYZZKYZZKY5dJY5dJY5dJY5dJYpVJYpVJYpZIYpZIYpZIYpVHYpVHYpVHYpVHYpVHYpZGYpZGY5VF",
  ,
  "Y5VFY5ZEY5ZEY5ZEY5ZEY5ZEYpZCYpZCYpZCZJZCZJZCY5VBY5VBY5VBY5VBY5VBY5VBYpZAYpZAYpZAY5U/Y5U/Y5Y+Y5Y+Y5Y+YpU9YpU9YpU9YpU9YpU9",
  ,
  "ZJU9ZJU9Y5Q8Y5Q8Y5Q8Y5Q8Y5U7Y5U7YpQ6YpQ6ZJQ6ZJQ6KrwFKrwFKrwFKrwFKrwGKrwGKrwHKrwHKrwHKrsIKrsIKrsJKrsJKrsJK7sKK7sLK7sLK7sM",
  ,
  "K7sMK7sMK7sMLLsNLLsOLLsOLLsOLLsPLLsPLLsQbpqMbpqMbpqMbpqLbpqLbpqLcJqKcJqKcJqKcJqJcJqJcJqIcJqIcJqIcJqIcJqIcpqIcpqIcpqHcpqH",
  ,
  "cpqGcpqGc5uGc5uGc5uGcpqEcpqEcpqDcpqDcpqDcJqAcJqAcJqAcJqAcJp/cJp/cJp/bpp+bpp+bpp8bpp8bpp8bZl6bZl5bZl5bZl4bZl4a5l2a5l2app0",
  ,
  "app0app0app0app0app0aZlyaZlyaZlyaZlyaZlxaJhwaJhwaJhwZ5luZ5luZphsZphsZphsZZlqZZlqZZlqZZlqZZloZZloZZloY5lnY5lmY5llY5llY5ll",
  ,
  "YphjYphjYZliYZliYZliYZliYZlhYJhgYJhgYJhgYphgYZlfYZlfYZheYZheYZheYZheYZheYpheYZhcYZhcYZhcYZhcYZhcYJdbYJdbYJdbYJdbYJdbYJdb",
  ,
  "YJdbYZhaYZhaYZhaYJhYYJhYYZhYYZhYYZhYYJdXYJdXYZhWYZhWYZhWYZhWYZhWYZhWYZdVYZdVYZdVYZdVYZdVYJdTYJdTYJdTYZdTYZdTYJdRYJdRYJdR",
  ,
  "YpdRYpdRYJZQYJZQYJZQYpZQYpZQYpdPYpdPYZZOYZZOYZhOYZZOYZZOYpdNYpdNYpdNYZZMYZZMYZZMYZZMYZZMYZZMYpdLYpdLYZZKYZZKYZZKY5dJY5dJ",
  ,
  "YpVJYpVJYpVJYpZIYpZIYpVHYpVHYpVHYpVHYpVHYpZGYpZGYpZGYZVFYZVFYZZEYZZEYpVDYpVDYpVDYpZCYpZCYpZCYpZCYpZCYpZCYZVBYZVBY5VBY5VB",
  ,
  "Y5VBYpZAYpZAYZU/YZU/YZU/YZY+YZY+YpU9YpU9YpU9YpU9YpU9YpU9YpU9YpU9YZQ8YZQ8Y5U7Y5U7Y5U7Y5U7YpQ6YpQ6YpQ6YpQ6YZQ4YZQ4KrwFKrwF",
  ,
  "KrwFKrwGKrwHKrwHK7wIK7wIK7wIK7sJK7sJK7sKK7sKK7sKK7sLLLsMLLsMLLsMLLsMLLsNLLsNLLsOLbsOLbsPLbsPLbsQLbsQLbsRLboSbpqMbpqMbpqM",
  ,
  "bpqLbpqLcJqKcJqKcJqKcJqKcJqJcJqIcJqIcJqIcJqIcJqIcJqIcpqIcpqIcpqIcpqGcpqGcpqGc5uGc5uGcpqEcpqEcpqDcpqDcpqDcJqBcJqAcJqAcJqA",
  ,
  "cJp/cJp/cJp/bpp+bpp+bpp9bpp9bpp8bZl6bZl6bZl5bZl5bZl5a5l3a5l2app2app0app0app0app0app0appzappzappzaJpyaJpyaJpwaJpwaJpwZ5lu",
  ,
  "Z5luZ5ltZ5ltZ5ltZZlqZZlqZZlqZZlqZZlqZZlqZZlqY5lnY5lnY5llY5llY5llYphjYphjYZliYZliYZliYZliYZliYJhgYZlhYZlhYZlhX5lfYZlfYJlf",
  ,
  "YplfYplfYplfYJheYJheYJldYJldYJldYJhcYJhcYJlbYJlbYJlbYZlbYZlbYJhaYJhaYJhaYJhaYZhaYJhYYJhYYZhYYZhYYZhYYJdXYJdXYZhWYZhWYZhW",
  ,
  "YZhWYZhWYZhWYJlVYJlVYJlVX5hUX5hUYZhUYZhUYZhUYJdTYJdTYZhSYZhSYZhSYJdRYJdRYJdRYZdRYZdRYZdRYZdRYJdPYJdPYZhOYZhOYZhOYZZOYZZO",
  ,
  "YJdNYJdNYJdNYZZMYZZMYJhMYphMYphMYphMYJdLYJdLYJhKYJhKYJhKYZdJYZdJYZdJYZdJYZdJYJdHYZdHYZdHYZdHYZdHYZdHYZdHYJZGYJZGYJZGYJdF",
  ,
  "YpdFYZZEYZZEYZZEYZZEYZZEYJZCYpZCYpZCYpZCYJZCYpZCYZdBYZdBYZdBYZdBYZdBYpZAYpZAYpZAYpZAYpZAYZY+YZY+YZY+YZY+YZY+YJU9YJU9YJU9",
  ,
  "YpU9YpU9YpY8YpY8YZU7YZU7YZU7YZU7YZY6Y5Y6YpU5YpU5YpU5YpU5KrwFKrwFKrwFKrwGKrwHKrwHK7wIK7wIK7wIK7sJK7sJK7sKK7sKK7sKK7sLLLsM",
  ,
  "LLsMLLsMLLsMLLsNLLsNLLsOLbsOLbsPLbsPLbsQLbsQLbsRLboSLboSbpqMbpqMbpqLbpqLbpqKcJqKcJqKcJqKcJqKcJqIcJqIcJqIcJqIcJqIcJqIcJqI",
  ,
  "cpqIcpqIcpqHcpqGcpqGcpqGcpqGcpqEcpqEcpqEcpqDcpqDcJqBcJqBcJqAcJqAcJqAcJqAcJp/bpp+bpp+bpp9bpp9bpp9bZl6bZl6bZl5bZl5bZl5a5l3",
  ,
  "a5l3app2app2app2app2app0app0appzappzappzaJpyaJpyaJpwaJpwaJpwZ5luZ5luZ5luZ5ltZ5ltZZlrZZlrZZlqZZlqZZlqZZlqZZlqY5lnY5lnY5ll",
  ,
  "Y5llY5llYphjYphjYZliYZliYZliYZliYZliYJhgYZliYZliYZlhX5lfX5lfYJlfYJlfYJlfYJlfX5heYJheYJldYJldYJldYJhcYJhcYJlbYJlbYJlbYJlb",
  ,
  "YZlbYJhaYJhaYJhaYJhaYJhaYJhYYJhYYJhYYJhYYJhYYJdXYJdXYJhWYZhWYZhWX5hWYZhWYZhWYJlVYJlVYJlVX5hUX5hUYZhUYZhUYZhUYJdTYJdTX5hS",
  ,
  "X5hSX5hSYJdRYJdRYJdRYJdRYJdRYJdRYZdRYJdPYJdPYZhOYZhOYZhOYZZOYZZOYJdNYJdNYJdNX5ZMX5ZMYJhMYJhMYJhMYJhMYJdLYJdLYJhKYJhKYJhK",
  ,
  "X5dJX5dJYZdJYZdJYZdJYJdHYJdHYJdHYZdHYZdHYZdHYZdHYJZGYJZGYJZGYJdFYJdFX5ZEX5ZEYZZEYZZEYZZEYJZCYJZCYJZCYJZCYJZCYJZCX5dBYZdB",
  ,
  "YZdBYZdBYZdBYJZAYJZAYJZAYJZAYpZAYZY+YZY+YZY+YZY+YZY+YJU9YJU9YJU9YJU9YJU9YJY8YJY8YZU7YZU7YZU7YZU7YZY6YZY6YJU5YJU5YpU5YpU5",
  ,
  "K7wFK7wFK7wFK7wGK7wHK7wHLLwILLwILLwILLsJLLsJLLsKLLsKLLsKLLsLLbsMLbsMLbsMLbsMLbsNLbsNLbsOLrsOLrsPLrsPLrsQLrsQLrsRLroSLroS",
  ,
  "L7oSbpqMbpqLbpqLbpqKcJqKcJqKcJqKcJqKcJqIcJqIcJqIcJqIcJqIcJqIcJqIcpqIcpqIcpqHcpqGcpqGcpqGcpqGcpqEcpqEcpqEcpqDcpqDcJqBcJqB",
  ,
  "cJqAcJqAcJqAcJqAcJp/bpp+bpp+bpp9bpp9bpp9bZl6bZl6bZl5bZl5bZl5a5l3a5l3app2app2app2app2app0app0appzappzappzaJpyaJpyaJpwaJpw",
  ,
  "aJpwZ5luZ5luZ5luZ5ltZ5ltZZlrZZlrZZlqZZlqZZlqZZlqZZlqY5lnY5lnY5llY5llY5llYphjYphjYZliYZliYZliYZliYZliYJhgYZliYZliYZlhX5lf",
  ,
  "X5lfYJlfYJlfYJlfYJlfX5heYJheYJldYJldYJldYJhcYJhcYJlbYJlbYJlbYJlbYZlbYJhaYJhaYJhaYJhaYJhaYJhYYJhYYJhYYJhYYJhYYJdXYJdXYJhW",
  ,
  "YZhWYZhWX5hWYZhWYZhWYJlVYJlVYJlVX5hUX5hUYZhUYZhUYZhUYJdTYJdTX5hSX5hSX5hSYJdRYJdRYJdRYJdRYJdRYJdRYZdRYJdPYJdPYZhOYZhOYZhO",
  ,
  "YZZOYZZOYJdNYJdNYJdNX5ZMX5ZMYJhMYJhMYJhMYJhMYJdLYJdLYJhKYJhKYJhKX5dJX5dJYZdJYZdJYZdJYJdHYJdHYJdHYZdHYZdHYZdHYZdHYJZGYJZG",
  ,
  "YJZGYJdFYJdFX5ZEX5ZEYZZEYZZEYZZEYJZCYJZCYJZCYJZCYJZCYJZCX5dBYZdBYZdBYZdBYZdBYJZAYJZAYJZAYJZAYpZAYZY+YZY+YZY+YZY+YZY+YJU9",
  ,
  "YJU9YJU9YJU9YJU9YJY8YJY8YZU7YZU7YZU7YZU7YZY6YZY6YJU5YJU5YpU5YpU5LLsFLLsFLLsFLLsGLLsHLLsHLbsILbsILbsILbsJLbsJLbsKLbsKLbsK",
  ,
  "LbsLLrsMLrsMLrsMLrsMLroNLroNLroOLroOL7oPL7oPL7oQL7oQL7oRL7kSL7kSL7kSL7kSbpqLbpqLbpqKbpqKbpqKcJqKcJqKcJqJcJqIcJqIcJqIcJqI",
  ,
  "cJqIcJqIcpqIcpqIcpqHcpqHcpqGcpqGcpqGcpqFcpqEcpqEcpqEcpqEcJqBcJqBcJqBcJqAcJqAcJqAcJqAbpp+bpp+bpp9bpp9bpp9bZl6bZl6bZl5bZl5",
  ,
  "bZl5a5l3a5l3app2app2app2app2app2app0app0app0app0aJpyaJpyaJpwaJpwaJpwZ5lvZ5luZ5luZ5luZ5luZZlrZZlrZZlrZZlqZZlqZZlqZZlqY5ln",
  ,
  "Y5lnY5lnY5lnY5llYphkYphjYZliYZliYZliYZliYZliYJhiYZliYZliYZliX5lfX5lfX5lfX5lfX5lfX5lfX5heX5heX5ldYJldYJldX5hcYJhcYJlbYJlb",
  ,
  "YJlbYJlbYJlbYJhaYJhaYJhaYJhaYJhaYJhYYJhYYJhYYJhYYJhYXpdXXpdXYJhWYJhWYJhWX5hWX5hWX5hWYJlVYJlVYJlVX5hUX5hUYZhUYZhUYZhUYJdT",
  ,
  "YJdTX5hSX5hSX5hSXpdRXpdRYJdRYJdRYJdRYJdRYJdRYJdPYJdPYJhOYJhOYJhOYZZOYZZOYJdNYJdNYJdNX5ZMX5ZMYJhMYJhMYJhMYJhMX5dLX5dLYJhK",
  ,
  "YJhKYJhKX5dJX5dJYZdJYZdJYZdJYJdHYJdHYJdHYJdHYJdHYJdHYJdHYJZGYJZGYJZGYJdFYJdFX5ZEX5ZEYZZEYZZEYZZEYJZCYJZCYJZCYJZCYJZCYJZC",
  ,
  "X5dBX5dBX5dBX5dBX5dBYJZAYJZAYJZAYJZAYJZAX5Y+YZY+YZY+YZY+YZY+YJU9YJU9YJU9YJU9YJU9YJY8YJY8YZU7YZU7YZU7YZU7YZY6YZY6YJU5YJU5",
  ,
  "YJU5YJU5LbsFLbsFLbsFLbsGLbsHLbsHLrsILrsILrsILrsJLrsJLrsKLrsKLrsKLrsLLrsML7sML7sML7sML7oNL7oNL7oOL7oOL7oPL7oPL7oQL7oQL7oR",
  ,
  "L7kSL7kSL7kSL7kSMLkTbpqLbpqKbpqKbpqKbpqJcJqKcJqJcJqJcJqJcJqIcJqIcJqIcJqIcJqHcJqHcpqHcpqGcpqGcpqFcpqFcpqFcpqEcpqEcJqCcJqC",
  ,
  "cJqCcJqBcJqBcJqBcJqAcJqAbpp+bpp+bpp9bpp9bpp9bZl6bZl6bZl6bZl6a5l4a5l4a5l4app2app2app2app2app2app2app1app0aJpyaJpyaJpyaJpw",
  ,
  "aJpwZ5lvZ5lvZ5lvZ5lvZ5lvZZlsZZlsZZlsZZlsZZlrZZlrZZlqZZlqY5loY5loY5lnY5lnY5lnYphlYphkYZlkYZlkYZliYZliYZliYJhiYJhiX5lhX5lh",
  ,
  "X5lhX5lfX5lfX5lfX5heX5heX5heX5heX5ldX5ldX5hcX5hcX5hcXplbXplbYJlbYJlbYJlbX5haYJhaYJhaYJhaYJhaYJhYYJhYYJhYYJhYYJhYXpdXXpdX",
  ,
  "YJhWYJhWYJhWYJhWX5hWX5lVX5lVX5hUX5hUX5hUX5hUX5hUXpdTYJdTYJdTX5hSX5hSXpdRXpdRXpdRXpdRYJdRYJdRYJdRYJdRYJdRXpdPXpdPYJhOYJhO",
  ,
  "YJhOX5ZOX5ZOXpdNYJdNYJdNX5ZMX5ZMX5ZMYJhMX5dLX5dLX5dLXphKXphKX5dJX5dJX5dJX5dJX5dJXpdHXpdHXpdHYJdHYJdHYJdHYJdHYJdHXpZGYJZG",
  ,
  "YJdFYJdFYJdFX5ZEX5ZEX5ZEYZZEYZZEYZZEYJZCYJZCYJZCYJZCYJZCX5dBX5dBX5dBX5dBXpZAXpZAXpZAYJZAYJZAX5Y+X5Y+X5Y+X5Y+X5Y+XpU9XpU9",
  ,
  "XpU9YJU9YJU9YJY8YJY8YJY8X5U7X5U7X5Y6X5Y6X5Y6X5Y6XpU5YJU5YJU5YJU5X5Q4X5Q4LrsGLrsGLrsGLrsHLrsILrsIL7sJL7sJL7sJL7sKL7sKL7sL",
  ,
  "L7sLL7sLL7sML7sML7sML7sNL7sNL7oOL7oOL7oPL7oPL7oQL7oQMLoRMLoRMLoSMLkSMLkSMLkSMLkTMbkTMbkUbpqKbpqKbpqKbpqJbpqJcJqJcJqJcJqJ",
  ,
  "cJqJcJqIcJqIcJqIcJqHcJqHcJqHcpqGcpqGcpqGcpqGcpqFcpqEcpqEcJqCcJqCcJqCcJqCcJqBcJqBcJqBcJqBbpp+bpp+bpp+bpp9bpp9bZl6bZl6bZl6",
  ,
  "bZl6a5l4a5l4a5l4app3app3app2app2app2app2app1app1aJpyaJpyaJpyaJpyaJpwZ5lvZ5lvZ5lvZ5lvZ5lvZZlsZZlsZZlsZZlsZZlsZZlrZZlrZZlr",
  ,
  "Y5loY5loY5lnY5lnY5lnYphlYphlYZlkYZlkYZlkYZlkYZlkYJhiYJhiX5lhX5lhX5lhX5lgX5lfX5lfXpheXpheXpheX5heX5ldX5ldX5hcX5hcX5hcXplb",
  ,
  "XplbXplbXplbXplbX5haX5haXphaYJhaYJhaXphYXphYYJhYYJhYYJhYXpdXXpdXXphWXphWYJhWYJhWXphWX5lVX5lVXphUXphUX5hUX5hUX5hUXpdTXpdT",
  ,
  "XpdTXphSX5hSXpdRXpdRXpdRXpdRXpdRXpdRYJdRYJdRYJdRXpdPXpdPXphOXphOXphOX5ZOX5ZOXpdNXpdNXpdNXZZMXZZMX5ZMYJhMX5dLX5dLX5dLXphK",
  ,
  "XphKXZdJXZdJXZdJX5dJX5dJXpdHXpdHXpdHXpdHXpdHYJdHYJdHYJdHXpZGXpZGXpdFXpdFXpdFX5ZEX5ZEX5ZEX5ZEX5ZEX5ZEXpZCYJZCYJZCYJZCYJZC",
  ,
  "XZdBXZdBX5dBX5dBXpZAXpZAXpZAXpZAXpZAX5Y+X5Y+X5Y+X5Y+X5Y+XpU9XpU9XpU9XpU9XpU9XpY8YJY8YJY8X5U7X5U7X5Y6X5Y6X5Y6X5Y6XpU5XpU5",
  ,
  "XpU5XpU5X5Q4X5Q4LrsGLrsGLrsGLrsHLrsILrsIL7sJL7sJL7sJL7sKL7sKL7sLL7sLL7sLL7sML7sML7sML7sNL7sNL7oOL7oOL7oPL7oPL7oQL7oQMLoR",
  ,
  "MLoRMLoSMLkSMLkSMLkSMLkTMbkTMbkUMbkVbpqKbpqKbpqJbpqJbpqIcJqJcJqJcJqJcJqJcJqIcJqIcJqHcJqHcJqHcJqGcpqGcpqGcpqGcpqGcpqEcpqE",
  ,
  "cJqDcJqDcJqCcJqCcJqCcJqBcJqBcJqBbpp/bpp+bpp+bpp+bpp+bZl6bZl6bZl6bZl6a5l4a5l4a5l4app3app3app3app3app2app2app1app1aJpzaJpz",
  ,
  "aJpzaJpyaJpyZ5lwZ5lwZ5lvZ5lvZ5lvZZlsZZlsZZlsZZlsZZlsZZlrZZlrZZlrY5loY5loY5lnY5lnY5lnYphlYphlYZlkYZlkYZlkYZlkYZlkYJhiYJhi",
  ,
  "X5lhX5lhX5lhX5lgX5lgX5lgXpheXpheXpheXpheXZldX5ldXZhcXZhcXZhcXplbXplbXplbXplbXplbX5haX5haXphaXphaXphaXphYXphYXphYXphYXphY",
  ,
  "XpdXXpdXXphWXphWXphWXphWXphWXZlVXZlVXphUXphUXphUXZhUX5hUXpdTXpdTXpdTXphSXphSXpdRXpdRXpdRXpdRXpdRXpdRXpdRXpdRXpdRXpdPXpdP",
  ,
  "XphOXphOXphOXZZOXZZOXpdNXpdNXpdNXZZMXZZMXZZMXphMX5dLX5dLX5dLXphKXphKXZdJXZdJXZdJXZdJXZdJXJdHXpdHXpdHXpdHXpdHXpdHXpdHXpdH",
  ,
  "XpZGXpZGXpdFXpdFXpdFXZZEXZZEX5ZEX5ZEX5ZEX5ZEXpZCXpZCXpZCYJZCYJZCXZdBXZdBXZdBXZdBXJZAXJZAXpZAXpZAXpZAXZY+XZY+XZY+XZY+X5Y+",
  ,
  "XpU9XpU9XpU9XpU9XpU9XpY8XpY8XpY8X5U7X5U7X5Y6X5Y6X5Y6X5Y6XpU5XpU5XpU5XpU5XZQ4XZQ4L7sGL7sGL7sGL7sHL7sIL7sIL7sJL7sJL7sJL7sK",
  ,
  "L7sKL7sLL7sLL7sLL7sML7sMMLsMMLsNMLsNMLoOMLoOMLoPMLoPMLoQMLoQMboRMboRMboSMbkSMbkSMbkSMbkTMbkTMrkUMrkVMrkVbpqKbpqJbpqJbpqI",
  ,
  "cJqJcJqJcJqJcJqJcJqIcJqIcJqHcJqHcJqHcJqGcpqGcpqGcpqGcpqGcpqEcpqEcJqDcJqDcJqCcJqCcJqCcJqBcJqBcJqBbpp/bpp+bpp+bpp+bpp+bZl6",
  ,
  "bZl6bZl6bZl6a5l4a5l4a5l4app3app3app3app3app2app2app1app1aJpzaJpzaJpzaJpyaJpyZ5lwZ5lwZ5lvZ5lvZ5lvZZlsZZlsZZlsZZlsZZlsZZlr",
  ,
  "ZZlrZZlrY5loY5loY5lnY5lnY5lnYphlYphlYZlkYZlkYZlkYZlkYZlkYJhiYJhiX5lhX5lhX5lhX5lgX5lgX5lgXpheXpheXpheXpheXZldX5ldXZhcXZhc",
  ,
  "XZhcXplbXplbXplbXplbXplbX5haX5haXphaXphaXphaXphYXphYXphYXphYXphYXpdXXpdXXphWXphWXphWXphWXphWXZlVXZlVXphUXphUXphUXZhUX5hU",
  ,
  "XpdTXpdTXpdTXphSXphSXpdRXpdRXpdRXpdRXpdRXpdRXpdRXpdRXpdRXpdPXpdPXphOXphOXphOXZZOXZZOXpdNXpdNXpdNXZZMXZZMXZZMXphMX5dLX5dL",
  ,
  "X5dLXphKXphKXZdJXZdJXZdJXZdJXZdJXJdHXpdHXpdHXpdHXpdHXpdHXpdHXpdHXpZGXpZGXpdFXpdFXpdFXZZEXZZEX5ZEX5ZEX5ZEX5ZEXpZCXpZCXpZC",
  ,
  "YJZCYJZCXZdBXZdBXZdBXZdBXJZAXJZAXpZAXpZAXpZAXZY+XZY+XZY+XZY+X5Y+XpU9XpU9XpU9XpU9XpU9XpY8XpY8XpY8X5U7X5U7X5Y6X5Y6X5Y6X5Y6",
  ,
  "XpU5XpU5XpU5XpU5XZQ4XZQ4L7sGL7sGL7sGL7sHL7sIL7sIL7sJL7sJL7sJMLsKMLsKMLsLMLsLMLsLMLsMMLsMMLsMMbsNMbsNMboOMboOMboPMboPMboQ",
  ,
  "MboQMboRMroRMroSMrkSMrkSMrkSMrkTMrkTMrkUM7kVM7kVM7kVbpqJbpqJbpqIcJqJcJqJcJqJcJqJcJqIcJqIcJqHcJqHcJqHcJqGcpqGcpqGcpqGcpqG",
  ,
  "cpqEcpqEcJqDcJqDcJqCcJqCcJqCcJqBcJqBcJqBbpp/bpp+bpp+bpp9bpp9bZt7bZt7bJp6bJp6bJp5bJp5bJp5app3app3app3app3app3app3app1app1",
  ,
  "aJpzaJpzaJpzaJpyaJpyZ5lwZ5lwZ5lvZ5lvZ5lvZZlsZZlsZZlsZZlsZZlsZZlrZZlrZZlrZJpqZJpqY5loY5loY5loYppmYppmYZlkYZlkYZlkYZlkYZlk",
  ,
  "YZljYZliX5lhX5lhX5lhX5lgX5lgX5lgXpheXpheXpheXpheXZldX5ldXZhcXZhcXZhcXplbXplbXplbXplbXplbXplbXplbXplZXplZXplZXplZX5lZXphY",
  ,
  "XphYXphYX5hYX5hYXphWXphWXphWXphWXphWXZlVXZlVXphUXphUXphUXZhUX5hUXpdTXpdTXpdTXphSXphSXZlRX5lRX5lRX5lRXphQXphQXphQXphQXphQ",
  ,
  "XZhQXZhQXphOXphOXphOXphOXphOXphMXphMXphMXphMXphMXphMXphMX5dLX5dLX5dLXphKXphKXphKXphKXphKXZhIXZhIXZhIX5hIX5hIXpdHXpdHXpdH",
  ,
  "XpdHXpdHX5dHX5dHXpdFXpdFXpdFXpdFXpdFXpdFXZZEXZZEXZZEX5dDX5dDXpZCXpZCXpZCXZdBXZdBXZdBXZdBXZhAXZhAX5hAXpc/Xpc/Xpc/Xpc/Xpc/",
  ,
  "XZY+XZY+XZc9XZc9XZc9X5c9X5c9XpY8XpY8XpY8XpY8XpY8X5Y6X5Y6X5Y6X5Y6X5Y6X5Y6XpU5XpU5XpY4XpY4L7sGL7sGL7sGL7sHL7sIL7sIL7sJL7sJ",
  ,
  "L7sJMLsKMLsKMLsLMLsLMLsLMLsMMLsMMLsMMbsNMbsNMboOMboOMboPMboPMboQMboQMboRMroRMroSMrkSMrkSMrkSMrkTMrkTMrkUM7kVM7kVM7kVM7kW",
  ,
  "bpqIbpqIbpqIbpqIcJqJcJqIcJqIcJqHcJqHcJqHcJqGcJqGcJqFcpqGcpqGcpqFcpqFcJqDcJqDcJqDcJqDcJqCcJqBcJqBbpp/bpp/bpp/bpp+bpp+bpp9",
  ,
  "bpp9bZt8bZt7bJp6bJp6bJp5bJp5bJp5app4app3app3app3app3app1app1aJp0aJpzaJpzaJpzaJpzZ5lwZ5lwZ5lwZ5lvZ5lvZZlsZZlsZZlsZZlsZZls",
  ,
  "ZZlsZZlrZJpqZJpqZJpqY5loY5loYppoYppoYppmYZllYZllYZlkYZlkYZlkYZljYZljX5lhX5lhX5lhX5lgX5lgXpheXpheXZldXZldXZldXZldXZhcXZhc",
  ,
  "XZlbXZlbXZlbXZlbXZlbXplbXplbXplbXplbXplZXplZXplZXplZXplZXphYXphYXphYXphYXphYXJhWXphWXphWXphWXphWXZlVXZlVXphUXphUXphUXZhU",
  ,
  "XZhUXJdTXJdTXphSXphSXphSXZlRXZlRXJhQXJhQXJhQXphQXphQXZhQXZhQXZhQXJhOXJhOXphOXphOXphOXJhMXJhMXJhMXJhMXJhMXphMXphMXZdLXZdL",
  ,
  "XZhKXZhKXZhKXZdJXZdJXphKXphKXZhIXZhIXZhIXZhIXJdHXJdHXJdHXpdHXpdHXZdHXZdHXZdHXJdFXJdFXpdFXpdFXpdFXZZEXZZEXZdDXZdDXZdDXpZC",
  ,
  "XpZCXZdBXZdBXZdBXZdBXZdBXJZAXZhAXJc/XJc/XJc/XJc/XJc/XZY+XZY+XZY+XZc9XZc9XZc9XZc9XZc9XpY8XpY8XpY8XpY8XpY8XZY6XZY6XZY6XZY6",
  ,
  "XZY6XZY6XJU5XpU5XpY4XpY4XpY4XpY4MLsHMLsHMLsHMLsIMLsJMLsJMLsKMLsKMLsKMbsKMboLMboMMboMMboMMboMMboNMboNMroOMroOMroOMrkPMrkQ",
  ,
  "MrkQMrkRMrkRMrkSM7kSM7kSM7kSM7kSM7gTM7gUM7gUM7gVM7gWM7gWNLgWNLgXNLgXbpqIbpqIbpqIcJqJcJqIcJqIcJqHcJqHcJqHcJqGcJqGcJqFcJqF",
  ,
  "cJqFcpqFcpqFcJqDcJqDcJqDcJqDcJqDcJqBcJqBbpqAbpqAbpp/bpp+bpp+bpp9bpp9bZt8bZt8bJp6bJp6bJp5bJp5bJp5app4app4app3app3app3app2",
  ,
  "app1aJp0aJp0aJp0aJpzaJpzZ5lwZ5lwZ5lwZ5lvZ5lvZZlsZZlsZZlsZZlsZZlsZZlsZZlsZJpqZJpqZJpqY5lpY5loYppoYppoYppoYZllYZllYZllYZlk",
  ,
  "YZlkYZljYZljX5lhX5lhX5lhX5lgX5lgXpheXpheXZldXZldXZldXZldXJhcXZhcXZlbXZlbXZlbXZlbXZlbXZlbXZlbXplbXplbXJlZXplZXplZXplZXplZ",
  ,
  "XphYXphYXphYXphYXphYXJhWXJhWXphWXphWXphWXZlVXZlVXJhUXJhUXJhUXZhUXZhUXJdTXJdTXphSXphSXJhSXZlRXZlRXJhQXJhQXJhQXJhQXJhQXZhQ",
  ,
  "XZhQXZhQXJhOXJhOXJhOXJhOXJhOXJhMXJhMXJhMXJhMXJhMXJhMXJhMXZdLXZdLXZhKXZhKXZhKXZdJXZdJXphKXphKXZhIXZhIXZhIXZhIXJdHXJdHXJdH",
  ,
  "XJdHXJdHXZdHXZdHXZdHXJdFXJdFXJdFXJdFXJdFXZZEXZZEXZdDXZdDXZdDXJZCXJZCXZdBXZdBXZdBXZdBXZdBXJZAXZhAXJc/XJc/XJc/XJc/XJc/W5Y+",
  ,
  "W5Y+W5Y+XZc9XZc9XZc9XZc9XZc9XJY8XJY8XpY8XpY8XpY8XZY6XZY6XZY6XZY6XZY6XZY6XJU5XJU5W5Y4XpY4XpY4XpY4MLsHMLsHMLsHMLsIMLsJMLsJ",
  ,
  "MLsKMLsKMLsKMbsKMboLMboMMboMMboMMboMMboNMboNMroOMroOMroOMrkPMrkQMrkQMrkRMrkRMrkSM7kSM7kSM7kSM7kSM7gTM7gUM7gUM7gVM7gWM7gW",
  ,
  "NLgWNLgXNLgXNLcXbpqIbpqIbpqIcJqIcJqIcJqHcJqHcJqHcJqGcJqGcJqFcJqFcJqFcJqFcJqFcJqDcJqDcJqDcJqDcJqDcJqCcJqCbpqAbpqAbpqAbpp/",
  ,
  "bpp+bpp9bpp9bZt9bZt8bJp7bJp7bJp5bJp5bJp5app4app4app4app4app4app2app2aJp0aJp0aJp0aJpzaJpzZ5lwZ5lwZ5lwZ5lwZ5lvZZluZZluZZlu",
  ,
  "ZZlsZZlsZZlsZZlsZJprZJprZJprY5lpY5lpYppoYppoYppoYZlmYZlmYZllYZllYZllYZllYZljX5liX5liX5liX5lgX5lgXphfXpheXZldXZldXZldXZld",
  ,
  "XJhcXJhcXZlbXZlbXZlbXZlbXZlbXZlbXZlbXJlbXJlbXJlZXJlZXJlZXJlZXplZXJhYXJhYXphYXphYXphYXJhWXJhWXJhWXJhWXJhWXZlVXZlVXJhUXJhU",
  ,
  "XJhUXJhUXJhUXJdTXJdTXJhSXJhSXJhSXZlRXZlRXJhQXJhQXJhQXJhQXJhQXZhQXZhQXZhQXJhOXJhOXJhOXJhOXJhOW5hMW5hMXJhMXJhMXJhMXJhMXJhM",
  ,
  "XZdLXZdLXZhKXZhKXZhKXJdJXJdJXJhKXJhKW5hIW5hIXZhIXZhIXJdHXJdHXJdHXJdHXJdHW5dHW5dHW5dHXJdFXJdFXJdFXJdFXJdFW5ZEW5ZEW5dDXZdD",
  ,
  "XZdDXJZCXJZCW5dBW5dBW5dBW5dBXZdBXJZAXZhAXJc/XJc/XJc/XJc/XJc/W5Y+W5Y+W5Y+W5c9W5c9W5c9XZc9XZc9XJY8XJY8XJY8XJY8XJY8W5Y6XZY6",
  ,
  "XZY6XZY6XZY6XZY6XJU5XJU5W5Y4W5Y4W5Y4W5Y4MbsHMbsHMbsHMbsIMbsJMbsJMbsKMbsKMbsKMrsKMroLMroMMroMMroMMroMMroNMroNM7oOM7oOM7oO",
  ,
  "M7kPM7kQM7kQM7kRM7kRM7kSM7kSNLkSNLkSNLkSNLgTNLgUNLgUNLgVNLgWNLgWNbgWNbgXNbgXNbcXNbcXbpqIbpqIcJqIcJqIcJqHcJqHcJqHcJqGcJqG",
  ,
  "cJqFcJqFcJqFcJqFcJqFcJqDcJqDcJqDcJqDcJqDcJqCcJqCbpqAbpqAbpqAbpp/bpp+bpp9bpp9bZt9bZt8bJp7bJp7bJp5bJp5bJp5app4app4app4app4",
  ,
  "app4app2app2aJp0aJp0aJp0aJpzaJpzZ5lwZ5lwZ5lwZ5lwZ5lvZZluZZluZZluZZlsZZlsZZlsZZlsZJprZJprZJprY5lpY5lpYppoYppoYppoYZlmYZlm",
  ,
  "YZllYZllYZllYZllYZljX5liX5liX5liX5lgX5lgXphfXpheXZldXZldXZldXZldXJhcXJhcXZlbXZlbXZlbXZlbXZlbXZlbXZlbXJlbXJlbXJlZXJlZXJlZ",
  ,
  "XJlZXplZXJhYXJhYXphYXphYXphYXJhWXJhWXJhWXJhWXJhWXZlVXZlVXJhUXJhUXJhUXJhUXJhUXJdTXJdTXJhSXJhSXJhSXZlRXZlRXJhQXJhQXJhQXJhQ",
  ,
  "XJhQXZhQXZhQXZhQXJhOXJhOXJhOXJhOXJhOW5hMW5hMXJhMXJhMXJhMXJhMXJhMXZdLXZdLXZhKXZhKXZhKXJdJXJdJXJhKXJhKW5hIW5hIXZhIXZhIXJdH",
  ,
  "XJdHXJdHXJdHXJdHW5dHW5dHW5dHXJdFXJdFXJdFXJdFXJdFW5ZEW5ZEW5dDXZdDXZdDXJZCXJZCW5dBW5dBW5dBW5dBXZdBXJZAXZhAXJc/XJc/XJc/XJc/",
  ,
  "XJc/W5Y+W5Y+W5Y+W5c9W5c9W5c9XZc9XZc9XJY8XJY8XJY8XJY8XJY8W5Y6XZY6XZY6XZY6XZY6XZY6XJU5XJU5W5Y4W5Y4W5Y4W5Y4MrsHMrsHMrsHMrsI",
  ,
  "MrsJMrsJMrsKMrsKMrsKM7sKM7oLM7oMM7oMM7oMM7oMM7oNM7oNM7oOM7oONLoONLkPNLkQNLkQNLkRNLkRNLkSNLkSNLkSNbkSNbkSNbgTNbgUNbgUNbgV",
  ,
  "NbgWNbgWNbgWNrgXNrgXNrcXNrcXNrcYbpqIbpqIcJqIcJqHcJqHcJqHcJqHcJqGcJqFcJqFcJqFcJqFcJqFcJqEcJqDcJqDcJqDcJqDcJqCcJqCbpqAbpqA",
  ,
  "bpqAbpp/bpp/bpp9bpp9bZt9bZt9bJp7bJp7bJp6bJp6bJp5app4app4app4app4app4app2app2aJp0aJp0aJp0aJpzaJpzZ5lyZ5lwZ5lwZ5lwZ5lwZZlu",
  ,
  "ZZluZZluZZluZZlsZZlsZZlsZJprZJprZJprY5lpY5lpYppoYppoYppoYZlmYZlmYZlmYZlmYZlmYZllYZllX5liX5liX5liX5liX5liXphfXphfXZlfXZlf",
  ,
  "XZlfXZldXJhcXJhcXZlbXZlbXZlbW5lbXZlbXZlbXZlbXJlbXJlbXJlZXJlZXJlZXJlZXJlZXJhYXJhYXJhYXJhYXJhYXJhWXJhWXJhWXJhWXJhWXZlVXZlV",
  ,
  "XJhUXJhUXJhUXJhUXJhUXJdTXJdTXJhSXJhSXJhSW5lRW5lRXJhQXJhQXJhQXJhQXJhQXJhQXJhQXJhQXJhOXJhOXJhOXJhOXJhOW5hMW5hMXJhMXJhMXJhM",
  ,
  "XJhMXJhMW5dLW5dLXZhKXZhKXZhKXJdJXJdJXJhKXJhKW5hIW5hIW5hIW5hIXJdHXJdHXJdHXJdHXJdHW5dHW5dHW5dHXJdFXJdFXJdFXJdFXJdFW5ZEW5ZE",
  ,
  "W5dDW5dDW5dDXJZCXJZCW5dBW5dBW5dBW5dBW5dBWpZAW5hAXJc/XJc/XJc/XJc/XJc/W5Y+W5Y+W5Y+W5c9W5c9W5c9W5c9W5c9XJY8XJY8XJY8XJY8XJY8",
  ,
  "W5Y6W5Y6WpY6WpY6WpY6WpY6XJU5XJU5W5Y4W5Y4W5Y4W5Y4M7sHM7sHM7sHM7sIM7sJM7sJM7sKM7sKM7sKNLsKNLoLNLoMNLoMNLoMNLoMNLoNNLoNNLoO",
  ,
  "NLoONboONbkPNbkQNbkQNbkRNbkRNbkSNbkSNbkSNrkSNrkSNrgTNrgUNrgUNrgVNrgWNrgWNrgWNrgXNrgXNrcXNrcXNrcYNrcYbpqIbpqHcJqHcJqHcJqH",
  ,
  "cJqHcJqHcJqFcJqFcJqFcJqFcJqFcJqEcJqEcJqEcJqDcJqDcJqDcJqCbpqAbpqAbpqAbpp/bpp/bZt9bZt9bZt9bJp7bJp7bJp6bJp6bJp6app5app4app4",
  ,
  "app4app4app2app2aJp1aJp1aJp0aJp0aJp0Z5lyZ5lyZ5lwZ5lwZ5lwZZluZZluZZluZZluZZluZZlsZZlsZJprZJprZJprY5lpY5lpYpppYpppYpppYZlm",
  ,
  "YZlmYZlmYZlmYZllYZllYZllX5liX5liX5liX5liX5liXphfXphfXZlfXZlfXZlfXZlfXJhcXJhcXZlbXZlbXZlbXZlbW5lbXJlbXJlbXJlbW5lZW5lZW5lZ",
  ,
  "XJlZW5hYW5hYW5hYXJhYXJhYW5hWW5hWXJhWXJhWXJhWXJlVXJlVXJlVXJlVW5hUXJhUXJhUXJhUXJhUXJdTXJdTXJhSXJhSXJhSW5lRW5lRWphQWphQWphQ",
  ,
  "WphQXJhQXJhQXJhQXJhQW5hOW5hOXJhOXJhOW5hMW5hMW5hMXJhMXJhMXJhMXJhMXJhMW5dLW5dLW5hKW5hKW5hKWpdJWpdJW5dJW5hIW5hIW5hIW5hIWpdH",
  ,
  "WpdHXJdHXJdHXJdHW5dHW5dHWpdFWpdFWpdFXJdFXJdFW5ZEW5ZEW5ZEW5dDW5dDWpZCWpZCWpZCWZdBW5dBW5dBW5dBW5dBWpZAWpZAWpZAWpc/Wpc/Wpc/",
  ,
  "Wpc/WZY+W5Y+W5c9W5c9W5c9W5c9W5c9WpY8XJY8XJY8XJY8XJY8W5Y6W5Y6W5Y6WpY6WpY6WZU5WZU5WZU5WZU5WZY4WZY4WZY4W5Y4WpU3WpU3M7sHM7sH",
  ,
  "M7sHM7sIM7sJM7sJM7sKM7sKM7sKNLsKNLoLNLoMNLoMNLoMNLoMNLoNNLoNNLoONLoONboONbkPNbkQNbkQNbkRNbkRNbkSNbkSNbkSNrkSNrkSNrgTNrgU",
  ,
  "NrgUNrgVNrgWNrgWNrgWNrgXNrgXNrcXNrcXNrcYNrcYNrcZbpqHbpqHcJqHcJqHcJqHcJqHcJqGcJqFcJqFcJqFcJqFcJqEcJqEcJqEcJqEcJqDcJqDcJqD",
  ,
  "bpqAbpqAbpqAbpqAbpp/bZt9bZt9bZt9bJp7bJp7bJp7bJp7bJp7app5app5app5app4app4app2app2aJp1aJp1aJp0aJp0aJp0Z5lyZ5lyZ5lwZ5lwZ5lw",
  ,
  "ZZlvZZluZZluZZluZZluZZlsZZlsZJprZJprZJprY5lpY5lpYpppYpppYpppYZloYZloYZlmYZlmYZlmYZlmYZllX5ljX5ljX5liX5liX5liXphgXphfXZlf",
  ,
  "XZlfXZlfXZlfXJhcXJhcW5lbW5lbW5lbXZlbW5lbXJlbXJlbXJlbW5lZW5lZW5lZW5lZW5hYW5hYW5hYW5hYW5hYW5hWW5hWW5hWW5hWXJhWXJlVXJlVXJlV",
  ,
  "XJlVW5hUW5hUXJhUXJhUXJhUW5dTW5dTXJhSXJhSXJhSW5lRW5lRWphQWphQWphQWphQWphQWphQXJhQXJhQW5hOW5hOXJhOXJhOW5hMW5hMW5hMW5hMW5hM",
  ,
  "W5hMW5hMXJhMW5dLW5dLW5hKW5hKW5hKWpdJWpdJWZdJWZhIWZhIW5hIW5hIWpdHWpdHWpdHWpdHWpdHW5dHW5dHWpdFWpdFWpdFWpdFWpdFWZZEWZZEW5ZE",
  ,
  "W5dDW5dDWpZCWpZCWpZCWZdBWZdBWZdBWZdBWZdBWpZAWpZAWpZAWpc/Wpc/Wpc/Wpc/WZY+WZY+WZc9WZc9WZc9W5c9W5c9WpY8WpY8WpY8WpY8WpY8W5Y6",
  ,
  "W5Y6W5Y6WpY6WpY6WZU5WZU5WZU5WZU5WZY4WZY4WZY4WZY4WpU3WpU3NLsINLsINLsINLsJNLsKNLsKNLsLNLsLNLsLNLsLNboMNboMNboMNboMNboNNboO",
  ,
  "NboONboPNboPNboPNrkQNrkRNrkRNrkSNrkSNrkSNrkSNrkTNrkTNrkTNrgUNrgVNrgVNrgWNrgWNrgWNrgXNrgXNrgXN7cYN7cYN7cZN7cZN7caN7cabpqH",
  ,
  "cJqHcJqHcJqHcJqHcJqGcJqFcJqFcJqFcJqFcJqEcJqEcJqEcJqEcJqDcJqDcJqDbpqAbpqAbpqAbpqAbpp/bZt9bZt9bZt9bJp7bJp7bJp7bJp7bJp7app5",
  ,
  "app5app5app4app4app2app2aJp1aJp1aJp0aJp0aJp0Z5lyZ5lyZ5lwZ5lwZ5lwZZlvZZluZZluZZluZZluZZlsZZlsZJprZJprZJprY5lpY5lpYpppYppp",
  ,
  "YpppYZloYZloYZlmYZlmYZlmYZlmYZllX5ljX5ljX5liX5liX5liXphgXphfXZlfXZlfXZlfXZlfXJhcXJhcW5lbW5lbW5lbXZlbW5lbXJlbXJlbXJlbW5lZ",
  ,
  "W5lZW5lZW5lZW5hYW5hYW5hYW5hYW5hYW5hWW5hWW5hWW5hWXJhWXJlVXJlVXJlVXJlVW5hUW5hUXJhUXJhUXJhUW5dTW5dTXJhSXJhSXJhSW5lRW5lRWphQ",
  ,
  "WphQWphQWphQWphQWphQXJhQXJhQW5hOW5hOXJhOXJhOW5hMW5hMW5hMW5hMW5hMW5hMW5hMXJhMW5dLW5dLW5hKW5hKW5hKWpdJWpdJWZdJWZhIWZhIW5hI",
  ,
  "W5hIWpdHWpdHWpdHWpdHWpdHW5dHW5dHWpdFWpdFWpdFWpdFWpdFWZZEWZZEW5ZEW5dDW5dDWpZCWpZCWpZCWZdBWZdBWZdBWZdBWZdBWpZAWpZAWpZAWpc/",
  ,
  "Wpc/Wpc/Wpc/WZY+WZY+WZc9WZc9WZc9W5c9W5c9WpY8WpY8WpY8WpY8WpY8W5Y6W5Y6W5Y6WpY6WpY6WZU5WZU5WZU5WZU5WZY4WZY4WZY4WZY4WpU3WpU3",
  ,
  "NbsINbsINbsINbsJNbsKNbsKNbsLNbsLNbsLNbsLNroMNroMNroMNroMNroNNroONroONroPNroPNroPNrkQNrkRNrkRNrkSNrkSNrkSNrkSNrkTNrkTNrkT",
  ,
  "NrgUN7gVN7gVN7gWN7gWN7gWN7gXN7gXN7gXN7cYN7cYOLcZOLcZOLcaOLcaOLcbcJqHcJqHcJqHcJqHcJqGcJqFcJqFcJqFcJqFcJqEcZuFcZuFcZuFcZuE",
  ,
  "b5uDb5uDb5uBb5uBb5uBbpqAbpp/bZt9bZt9bZt9bJp7bJp7bJp7bJp7bJp7app5app5app5app4app4app2app2aJp1aJp1aJp1aJp1aJp0aJp0aJp0Zppx",
  ,
  "ZppxZppxZppwZppwZppwZppwZppwZZltZZltZJprZJprZJprY5lpY5lpYpppYpppYpppYZloYZloYZlmYZlmYZlmYZlmYZllYJpkYJpkX5liX5liX5liXpph",
  ,
  "XpphXZlfXZlfXZlfXZlfXJpcXJpcW5lbW5lbW5lbW5lbW5lbXJlbXJlbXJlbW5lZW5lZW5lZW5lZW5hYW5hYW5hYW5hYWplXW5lXW5lXW5lXW5lXW5lXWplV",
  ,
  "WplVWplVXJlVW5lVW5lVWphUWphUXJhUW5lTW5lTWphSWphSWphSW5lRW5lRWphQWphQWphQWphQWphQWphQXJhQXJhQW5lPW5lPWphOWphOWplNWplNWplN",
  ,
  "WphMWphMWphMWphMWphMWphMWphMW5hKW5hKW5hKW5hKW5hKWZhIWZhIWZhIW5hIW5hIWpdHWpdHWplHWplHWplHWpdHWpdHW5hGW5hGW5hGWpdFWpdFWphE",
  ,
  "WphEWphEW5dDW5dDWphCWphCWphCWZdBWZdBWZdBWZdBWZdBWZhAWZhAWpc/Wpc/Wpc/Wpc/Wpc/WZY+WZY+WZc9WZc9WZc9W5c9W5c9WpY8WpY8WpY8WpY8",
  ,
  "WpY8W5Y6W5Y6W5Y6WpY6WpY6WZU5WZU5WZU5WZU5WZY4WZY4WZY4WZY4WpU3WpU3NbsINbsINbsINbsJNbsKNbsKNbsLNbsLNbsLNbsLNroMNroMNroMNroM",
  ,
  "NroNNroONroONroPNroPNroPNrkQNrkRNrkRNrkSNrkSNrkSNrkSNrkTNrkTNrkTNrgUN7gVN7gVN7gWN7gWN7gWN7gXN7gXN7gXN7cYN7cYOLcZOLcZOLca",
  ,
  "OLcaOLcbOLcbbpqHbpqGcJqHcJqGcJqGcJqGcJqFcJqFcJqEcZuFcZuFcZuFcZuFb5uDb5uDb5uCb5uCb5uBbpqAbpqAbZt9bZt9bZt9bJp8bJp8bJp7bJp7",
  ,
  "bJp7app5app5app5app5app5app2app2aJp1aJp1aJp1aJp1aJp1aJp0aJp0ZppxZppxZppxZppwZppwZppwZppwZppwZZltZZltZJprZJprZJprY5lqY5lp",
  ,
  "YpppYpppYpppYZloYZloYZloYZloYZlmYZlmYZlmYJplYJpkX5ljX5ljX5ljXpphXpphXZlgXZlfXZlfXZlfXJpeXJpeW5lbW5lbW5lbW5lbW5lbXJlbXJlb",
  ,
  "XJlbW5lZW5lZW5lZW5lZW5hYW5hYW5hYW5hYWplXWplXWplXWplXW5lXW5lXWplVWplVWplVWplVW5lVW5lVWphUWphUWphUWplTW5lTWphSWphSWphSW5lR",
  ,
  "W5lRWphQWphQWphQWphQWphQWphQWphQWphQWplPWplPWphOWphOWplNWplNWplNWphMWphMWphMWphMWphMWphMWphMW5hKW5hKW5hKW5hKW5hKWZhIWZhI",
  ,
  "WZhIWZhIWZhIWJdHWpdHWplHWplHWplHWpdHWpdHWZhGWZhGW5hGWpdFWpdFWphEWphEWphEWZdDW5dDWphCWphCWphCWZdBWZdBWZdBWZdBWZdBWZhAWZhA",
  ,
  "WJc/Wpc/Wpc/Wpc/Wpc/WZY+WZY+WZc9WZc9WZc9WZc9WZc9WpY8WpY8WpY8WpY8WpY8WJY6WJY6WJY6WJY6WpY6WZU5WZU5WZU5WZU5WZY4WZY4WZY4WZY4",
  ,
  "WJU3WJU3NroINroINroINroJNroKNroKNroLNroLNroLNroLNrkMNrkMNrkMNrkMNrkNNrkONrkONrkPNrkPNrkPNrkQN7gRN7gRN7gSN7gSN7gSN7gSN7gT",
  ,
  "N7gTN7gTN7gUN7cVOLcVOLcWOLcWOLcWOLcXOLcXOLcXOLcYOLcYOLcZOLYZObYaObYaObYbObYbObYcbpqGbpqGcJqGcJqFcJqFcJqFcJqEcJqEcZuFcZuF",
  ,
  "cZuFb5uDb5uDb5uCb5uCb5uCbpqAbpqAbZt+bZt+bZt+bJp8bJp8bJp7bJp7app5app5app5app5app5app4app4app4aJp1aJp1aJp0aJp1aJp1aJp0aJp0",
  ,
  "ZppyZppxZppxZppxZppxZppwZppwZppwZZlvZZltZJptZJptY5lqY5lqY5lqYpppYpppYZloYZloYZloYZloYZloYZlmYZlmYZlmX5ljYJplX5ljX5ljX5lj",
  ,
  "XppiXppiXZlgXZlgXJpeXJpeXJpeXJpeW5ldW5ldW5ldW5ldW5lbW5lbW5lbW5lZW5lZW5lZW5lZW5lZWZhYWZhYWZhYWZhYW5hYWplXWplXWplXWplXWplX",
  ,
  "WplVWplVWplVWplVWplVWZhUWphUWplTWplTWplTWphSWphSWplRWplRWplRWZhQWZhQWphQWphQWphQWphQWphQWZhOWplPWplPWJhOWJhOWplNWplNWZhM",
  ,
  "WZhMWZhMWZhMWphMWphMWphMWphMWZhKWZhKWZhKWZhKWZhKWZhIWZhIWZhIWZhIWZhIWJdHWJdHWJdHWJdHWJdHWJdHWpdHWZhGWZhGWJdFWJdFWJdFWJhE",
  ,
  "WJhEWZdDWZdDWZdDWJhCWJhCV5dBV5dBV5dBWZdBWZdBWZhAWZhAWZhAWJc/WJc/WJc/WJc/V5Y+V5Y+V5Y+WZc9WZc9WZc9WZc9WZc9WJY8WJY8WpY8WpY8",
  ,
  "WpY8WJY6WJY6WJY6WJY6WJY6V5U5V5U5WZY4WZY4WZY4WZY4WZY4WZY4WJU3WJU3WJY2WJY2NroINroINroINroJNroKNroKNroLNroLNroLNroLNrkMNrkM",
  ,
  "NrkMNrkMNrkNNrkONrkONrkPNrkPNrkPNrkQN7gRN7gRN7gSN7gSN7gSN7gSN7gTN7gTN7gTN7gUN7cVOLcVOLcWOLcWOLcWOLcXOLcXOLcXOLcYOLcYOLcZ",
  ,
  "OLYZObYaObYaObYbObYbObYcObYcbpqGbpqGcJqFcJqFcJqFcJqFcJqEcZuFcZuFcZuFb5uDb5uDb5uDb5uDb5uDbpqAbpqAbZt/bZt+bZt+bJp8bJp8bJp7",
  ,
  "bJp7app6app6app5app5app5app5app5app4aJp2aJp2aJp0aJp1aJp1aJp0aJp0ZppyZppyZppyZppxZppxZppxZppxZppxZZlvZZlvZJptZJptY5lqY5lq",
  ,
  "Y5lqYpppYpppYZloYZloYZloYZloYZloYZlmYZlmYZlmX5llYJplX5ljX5ljX5ljXppiXppiXZlgXZlgXJpfXJpfXJpfXJpeW5ldW5ldW5ldW5ldW5ldW5lb",
  ,
  "W5lbWZlZWZlZWZlZW5lZW5lZWZhYWZhYWZhYWZhYWZhYWJlXWplXWplXWplXWplXWplVWplVWplVWplVWplVWZhUWZhUWplTWplTWplTWZhSWZhSWplRWplR",
  ,
  "WplRWZhQWZhQWZhQWZhQWZhQWphQWphQWZhOWplPWplPWJhOWJhOWJlNWplNWZhMWZhMWZhMWZhMWZhMWJhMWJhMWJhMWZhKWZhKWZhKWZhKWZhKV5hIV5hI",
  ,
  "WZhIWZhIWZhIWJdHWJdHWJdHWJdHWJdHWJdHWJdHV5hGV5hGWJdFWJdFWJdFWJhEWJhEV5dDV5dDV5dDWJhCWJhCV5dBV5dBV5dBV5dBV5dBV5hAWZhAWZhA",
  ,
  "WJc/WJc/WJc/WJc/V5Y+V5Y+V5Y+Vpc9Vpc9Vpc9Vpc9WZc9WJY8WJY8V5Y8V5Y8V5Y8VpY6WJY6WJY6WJY6WJY6V5U5V5U5V5Y4V5Y4V5Y4V5Y4WZY4WZY4",
  ,
  "WJU3WJU3WJY2WJY2NroJNroJNroJNroKNroLNroLNroMNroMNroMNroMNrkMN7kNN7kNN7kNN7kON7kPN7kPN7kQN7kQN7kQN7kRN7gSOLgSOLgSOLgSOLgS",
  ,
  "OLgTOLgUOLgUOLgUOLgVOLcWOLcWObcXObcXObcXObcXObcYObcYObcZObcZObcZObYaObYbOrYbOrYcOrYcOrYdOrYdOrYebpqGcJqFcJqFcJqFcJqFcJqE",
  ,
  "cZuFcZuFcZuFb5uDb5uDb5uDb5uDb5uDbpqAbpqAbZt/bZt+bZt+bJp8bJp8bJp7bJp7app6app6app5app5app5app5app5app4aJp2aJp2aJp0aJp1aJp1",
  ,
  "aJp0aJp0ZppyZppyZppyZppxZppxZppxZppxZppxZZlvZZlvZJptZJptY5lqY5lqY5lqYpppYpppYZloYZloYZloYZloYZloYZlmYZlmYZlmX5llYJplX5lj",
  ,
  "X5ljX5ljXppiXppiXZlgXZlgXJpfXJpfXJpfXJpeW5ldW5ldW5ldW5ldW5ldW5lbW5lbWZlZWZlZWZlZW5lZW5lZWZhYWZhYWZhYWZhYWZhYWJlXWplXWplX",
  ,
  "WplXWplXWplVWplVWplVWplVWplVWZhUWZhUWplTWplTWplTWZhSWZhSWplRWplRWplRWZhQWZhQWZhQWZhQWZhQWphQWphQWZhOWplPWplPWJhOWJhOWJlN",
  ,
  "WplNWZhMWZhMWZhMWZhMWZhMWJhMWJhMWJhMWZhKWZhKWZhKWZhKWZhKV5hIV5hIWZhIWZhIWZhIWJdHWJdHWJdHWJdHWJdHWJdHWJdHV5hGV5hGWJdFWJdF",
  ,
  "WJdFWJhEWJhEV5dDV5dDV5dDWJhCWJhCV5dBV5dBV5dBV5dBV5dBV5hAWZhAWZhAWJc/WJc/WJc/WJc/V5Y+V5Y+V5Y+Vpc9Vpc9Vpc9Vpc9WZc9WJY8WJY8",
  ,
  "V5Y8V5Y8V5Y8VpY6WJY6WJY6WJY6WJY6V5U5V5U5V5Y4V5Y4V5Y4V5Y4WZY4WZY4WJU3WJU3WJY2WJY2N7oJN7oJN7oJN7oKN7oLN7oLN7oMN7oMN7oMN7oM",
  ,
  "N7kMOLkNOLkNOLkNOLkOOLkPOLkPOLkQOLkQOLkQOLkROLgSObgSObgSObgSObgSObgTObgUObgUObgUObgVObcWObcWObcXOrcXOrcXOrcXOrcYOrcYOrcZ",
  ,
  "OrcZOrcZOrYaOrYbOrYbO7YcO7YcO7YdO7YdO7YeO7YebpqFbpqFcJqFcJqFcJqFcZuFcZuFcZuFb5uDb5uDb5uDb5uDb5uDbpqBbpqAbZt/bZt/bZt/bJp8",
  ,
  "bJp8bJp8bJp7app6app6app6app6app5app5app5app5aJp2aJp2aJp1aJp1aJp1aJp0aJp0ZppyZppyZppyZppxZppxZppxZppxZppxZZlvZZlvZJptZJpt",
  ,
  "Y5lsY5lsY5lqYppqYppqYZloYZloYZloYZloYZloYZlmYZlmYZlmX5llYJplX5lkX5lkX5lkXppiXppiXZlhXZlgXJpfXJpfXJpfXJpfW5leW5ldW5ldW5ld",
  ,
  "W5ldW5lbW5lbWZlZWZlZWZlZW5lZW5lZWZhYWZhYWZhYWZhYWZhYWJlXWJlXWJlXWJlXWplXWZlVWZlVWplVWplVWplVWZhUWZhUWplTWplTWplTWZhSWZhS",
  ,
  "WJlRWJlRWJlRWZhQWZhQWZhQWZhQWZhQWphQWphQWZhOWplPWplPWJhOWJhOWJlNWJlNV5hMV5hMV5hMWZhMWZhMWJhMWJhMWJhMV5hKV5hKWZhKWZhKWZhK",
  ,
  "V5hIV5hIWZhIWZhIWZhIWJdHWJdHWJdHWJdHWJdHWJdHWJdHV5hGV5hGWJdFWJdFWJdFWJhEWJhEV5dDV5dDV5dDWJhCWJhCV5dBV5dBV5dBV5dBV5dBV5hA",
  ,
  "V5hAV5hAWJc/WJc/WJc/WJc/V5Y+V5Y+V5Y+Vpc9Vpc9Vpc9Vpc9Vpc9WJY8WJY8V5Y8V5Y8V5Y8VpY6VpY6VpY6VpY6VpY6VZU5V5U5V5Y4V5Y4V5Y4V5Y4",
  ,
  "V5Y4V5Y4VpU3WJU3WJY2WJY2OLoJOLoJOLoJOLoKOLoLOLoLOLoMOLoMOLoMOLoMOLkMObkNObkNObkNObkOObkPObkPObkQObkQObkQObkRObgSObgSOrgS",
  ,
  "OrgSOrgSOrgTOrgUOrgUOrgUOrgVOrcWOrcWOrcXOrcXOrcXO7cXO7cYO7cYO7cZO7cZO7cZO7YaO7YbO7YbO7YcO7YcO7YdPLYdPLYePLYePLYebpqFbpqF",
  ,
  "cJqFcJqFb5uFb5uFcZuFb5uDb5uDb5uDb5uDb5uDbpqBbpqBbZt/bZt/bZt/bJp9bJp9bJp8bJp8app6app6app6app6app6app5app5app5aJp2aJp2aJp1",
  ,
  "aJp1aJp1aJp1aJp0ZppyZppyZppyZppxZppxZppxZppxZppxZZlvZZlvZJpuZJptY5lsY5lsY5lsYppqYppqYZlpYZlpYZlpYZloYZloYZlnYZlmYZlmX5ll",
  ,
  "YJplX5lkX5lkX5lkXppkXppkXZlhXZlhXJpfXJpfXJpfXJpfW5leW5leW5ldW5ldW5ldW5lcW5lcWZlZWZlZWZlZWZlZW5lZWZhYWZhYWZhYWZhYWZhYWJlX",
  ,
  "WJlXWJlXWJlXWJlXWZlVWZlVWJlVWJlVWJlVWZhUWZhUWJlTWJlTWJlTWZhSWZhSWJlRWJlRWJlRWZhQWZhQWZhQWZhQWZhQWJhQWJhQWZhOWJlPWJlPWJhO",
  ,
  "WJhOWJlNWJlNV5hMV5hMV5hMV5hMV5hMWJhMWJhMWJhMV5hKV5hKWZhKWZhKWZhKV5hIV5hIV5hIV5hIV5hIWJdHWJdHWJdHWJdHWJdHWJdHWJdHV5hGV5hG",
  ,
  "VpdFVpdFVpdFWJhEWJhEV5dDV5dDV5dDVphCVphCVZdBV5dBV5dBV5dBV5dBV5hAV5hAV5hAVpc/Vpc/WJc/WJc/V5Y+V5Y+V5Y+Vpc9Vpc9Vpc9Vpc9Vpc9",
  ,
  "VZY8VZY8V5Y8V5Y8V5Y8VpY6VpY6VpY6VpY6VpY6VZU5VZU5V5Y4V5Y4V5Y4V5Y4V5Y4V5Y4VpU3VpU3VpY2VpY2OboJOboJOboJOboKOboLOboLOboMOboM",
  ,
  "OboMOboMObkMObkNOrkNOrkNOrkOOrkPOrkPOrkQOrkQOrkQOrkROrgSOrgSOrgSOrgSO7gSO7gTO7gUO7gUO7gUO7gVO7cWO7cWO7cXO7cXO7cXO7cXPLcY",
  ,
  "PLcYPLcZPLcZPLcZPLYaPLYbPLYbPLYcPLYcPLYdPLYdPLYePLYePLYePLUeb5uFb5uFb5uFb5uFb5uFb5uEb5uEb5uDb5uDbpqBbpqBbpqBbZt/bZt/bJp9",
  ,
  "bJp9bJp9bJp9bJp9app6a5t7a5t7a5t7a5t7aZt4aZt4aZt4aZt4aZt3aJp2aJp2aJp1aJp1aJp1ZppyZppyZppxZppxZppxZppxZppxZZlwZZlwZZlwZJpu",
  ,
  "ZJpuY5tuY5tuY5tuYpprYpprYppqYppqYppqYppqYppqYJpnYJpnYJpnYJpnYJpnX5lkX5lkXppkXppkXppkXZlhXZlhXJpgXJpfXJpfXJpfW5leXJpfXJpf",
  ,
  "XJpfXJpfWppdWppcWppbWppbWppbWZlaWZlZWJpYWJpYWZlXWZlXWZlXWJlXWJlXWJlXWJlXWJlXWZlVWZlVWJlVWJlVWJlVV5pUV5pUWJlTWJlTWJlTV5pS",
  ,
  "V5pSVplRWJlRWJlRWJlRWJlRWJlRWJlRWJhQWJhQWJhQWJlPWJlPVphOVphOWJhOWJlNWJlNV5hMV5hMV5hMV5lNV5lNVphMVphMVphMVplLVplLV5hKV5hK",
  ,
  "VplJVplJVplJV5hIV5hIV5lHV5lHV5lHV5lHV5lHWJdHWJdHWJdHV5hGV5hGVpdFVpdFVpdFVphEVphEVZdDVZdDVZdDVphCVphCVZdBVZdBVZdBVZdBVZdB",
  ,
  "VZhAV5hAVpc/Vpc/Vpc/Vpc/Vpc/VZY+VZY+VZY+Vpc9Vpc9Vpc9Vpc9Vpc9Vpg8Vpg8VZc7VZc7VZc7VZc7VZc7VpY6VpY6Vpc5Vpc5Vpc5VZY4VZY4VZY4",
  ,
  "VZY4VZY4VZY4VJc3VJc3VpY2VpY2VpY2OboJOboJOboJOboKOboLOboLOboMOboMOboMOboMObkMObkNOrkNOrkNOrkOOrkPOrkPOrkQOrkQOrkQOrkROrgS",
  ,
  "OrgSOrgSOrgSO7gSO7gTO7gUO7gUO7gUO7gVO7cWO7cWO7cXO7cXO7cXO7cXPLcYPLcYPLcZPLcZPLcZPLYaPLYbPLYbPLYcPLYcPLYdPLYdPLYePLYePLYe",
  ,
  "PLUePLUfb5uFb5uFb5uFb5uFb5uEb5uEb5uDb5uDbpqBbpqBbpqBbZt/bZt/bJp+bJp+bJp+bJp9bJp9app7a5t7a5t7a5t7a5t7aZt6aZt4aZt4aZt4aZt4",
  ,
  "aJp2aJp2aJp1aJp1aJp1ZppyZppyZppyZppyZppxZppxZppxZZlwZZlwZZlwZJpuZJpuY5tuY5tuY5tuYpprYpprYppqYppqYppqYppqYppqYJpnYJpnYJpn",
  ,
  "YJpnYJpnX5lkX5lkXppkXppkXppkXZlhXZlhXJpgXJpgXJpgXJpgW5lgXJpfXJpfXJpfXJpfWppdWppdWppbWppbWppbWZlaWZlaWJpYWJpYV5lXV5lXV5lX",
  ,
  "WJlXWJlXWJlXWJlXWJlXWZlVWZlVWJlVWJlVWJlVV5pUV5pUVplTWJlTWJlTV5pSV5pSVplRVplRWJlRWJlRWJlRWJlRWJlRVphQVphQWJhQWJlPWJlPVphO",
  ,
  "VphOVphOVplNVplNV5hMV5hMV5hMV5lNV5lNVphMVphMVphMVplLVplLV5hKV5hKVplJVplJVplJVZhIVZhIV5lHV5lHV5lHV5lHV5lHVpdHVpdHVpdHVZhG",
  ,
  "V5hGVpdFVpdFVpdFVphEVphEVZdDVZdDVZdDVphCVphCVZdBVZdBVZdBVZdBVZdBVZhAVZhAVpc/Vpc/Vpc/Vpc/Vpc/VZY+VZY+VZY+VJc9VJc9VJc9Vpc9",
  ,
  "Vpc9Vpg8Vpg8VZc7VZc7VZc7VZc7VZc7VJY6VJY6VJc5VJc5Vpc5VZY4VZY4VZY4VZY4VZY4VZY4VJc3VJc3U5Y2U5Y2U5Y2OroKOroKOroKOroLOroMOroM",
  ,
  "OroMOroMOroMOroMOrkNOrkOO7kOO7kOO7kPO7kPO7kQO7kRO7kRO7kRO7kSO7gSO7gSO7gTO7gTO7gTPLgUPLgVPLgVPLgVPLgWPLcWPLcXPLcXPLcXPLcX",
  ,
  "PLcYPLcYPLcZPLcaPLcaPLcaPLYbPLYcPLYcPLYdPLYdPLYdPLYePLYePLYePLYePbUfPbUfPbUgb5uFb5uFb5uFb5uEb5uEb5uDb5uDbpqBbpqBbpqBbZt/",
  ,
  "bZt/bJp+bJp+bJp+bJp9bJp9app7a5t7a5t7a5t7a5t7aZt6aZt4aZt4aZt4aZt4aJp2aJp2aJp1aJp1aJp1ZppyZppyZppyZppyZppxZppxZppxZZlwZZlw",
  ,
  "ZZlwZJpuZJpuY5tuY5tuY5tuYpprYpprYppqYppqYppqYppqYppqYJpnYJpnYJpnYJpnYJpnX5lkX5lkXppkXppkXppkXZlhXZlhXJpgXJpgXJpgXJpgW5lg",
  ,
  "XJpfXJpfXJpfXJpfWppdWppdWppbWppbWppbWZlaWZlaWJpYWJpYV5lXV5lXV5lXWJlXWJlXWJlXWJlXWJlXWZlVWZlVWJlVWJlVWJlVV5pUV5pUVplTWJlT",
  ,
  "WJlTV5pSV5pSVplRVplRWJlRWJlRWJlRWJlRWJlRVphQVphQWJhQWJlPWJlPVphOVphOVphOVplNVplNV5hMV5hMV5hMV5lNV5lNVphMVphMVphMVplLVplL",
  ,
  "V5hKV5hKVplJVplJVplJVZhIVZhIV5lHV5lHV5lHV5lHV5lHVpdHVpdHVpdHVZhGV5hGVpdFVpdFVpdFVphEVphEVZdDVZdDVZdDVphCVphCVZdBVZdBVZdB",
  ,
  "VZdBVZdBVZhAVZhAVpc/Vpc/Vpc/Vpc/Vpc/VZY+VZY+VZY+VJc9VJc9VJc9Vpc9Vpc9Vpg8Vpg8VZc7VZc7VZc7VZc7VZc7VJY6VJY6VJc5VJc5Vpc5VZY4",
  ,
  "VZY4VZY4VZY4VZY4VZY4VJc3VJc3U5Y2U5Y2U5Y2O7kKO7kKO7kKO7kLO7kMO7kMO7kMO7kMO7kMO7kMO7gNO7gOO7gOO7gOPLgPPLgPPLgQPLgRPLgRPLgR",
  ,
  "PLgSPLcSPLcSPLcTPLcTPLcTPLcUPLcVPLcVPLcVPLcWPLcWPLYXPLYXPLYXPLYXPLYYPLYYPLYZPLYaPLYaPbYaPbYbPbUcPbUcPbUdPbUdPbUdPbUePbUe",
  ,
  "PbUePbUePbUfPbUfPrUgPrUhb5uFb5uFb5uEb5uEb5uDb5uDbpqBbpqBbpqBbZt/bZt/bJp+bJp+bJp+bJp9bJp9app7a5t7a5t7a5t7a5t7aZt6aZt4aZt4",
  ,
  "aZt4aZt4aJp2aJp2aJp1aJp1aJp1ZppyZppyZppyZppyZppxZppxZppxZZlwZZlwZZlwZJpuZJpuY5tuY5tuY5tuYpprYpprYppqYppqYppqYppqYppqYJpn",
  ,
  "YJpnYJpnYJpnYJpnX5lkX5lkXppkXppkXppkXZlhXZlhXJpgXJpgXJpgXJpgW5lgXJpfXJpfXJpfXJpfWppdWppdWppbWppbWppbWZlaWZlaWJpYWJpYV5lX",
  ,
  "V5lXV5lXWJlXWJlXWJlXWJlXWJlXWZlVWZlVWJlVWJlVWJlVV5pUV5pUVplTWJlTWJlTV5pSV5pSVplRVplRWJlRWJlRWJlRWJlRWJlRVphQVphQWJhQWJlP",
  ,
  "WJlPVphOVphOVphOVplNVplNV5hMV5hMV5hMV5lNV5lNVphMVphMVphMVplLVplLV5hKV5hKVplJVplJVplJVZhIVZhIV5lHV5lHV5lHV5lHV5lHVpdHVpdH",
  ,
  "VpdHVZhGV5hGVpdFVpdFVpdFVphEVphEVZdDVZdDVZdDVphCVphCVZdBVZdBVZdBVZdBVZdBVZhAVZhAVpc/Vpc/Vpc/Vpc/Vpc/VZY+VZY+VZY+VJc9VJc9",
  ,
  "VJc9Vpc9Vpc9Vpg8Vpg8VZc7VZc7VZc7VZc7VZc7VJY6VJY6VJc5VJc5Vpc5VZY4VZY4VZY4VZY4VZY4VZY4VJc3VJc3U5Y2U5Y2U5Y2O7kKO7kKO7kKO7kL",
  ,
  "O7kMO7kMO7kMO7kMO7kMO7kMO7gNO7gOO7gOO7gOPLgPPLgPPLgQPLgRPLgRPLgRPLgSPLcSPLcSPLcTPLcTPLcTPLcUPLcVPLcVPLcVPLcWPLcWPLYXPLYX",
  ,
  "PLYXPLYXPLYYPLYYPLYZPLYaPLYaPbYaPbYbPbUcPbUcPbUdPbUdPbUdPbUePbUePbUePbUePbUfPbUfPrUgPrUhPrUhb5uFb5uFb5uEb5uDb5uDbpqBbpqB",
  ,
  "bpqBbZt/bZt/bJp+bJp+bJp+bJp9bJp9app7a5t8a5t8a5t8a5t7aZt6aZt6aZt6aZt4aZt4aJp2aJp2aJp1aJp1aJp1Zpp0ZppyZppyZppyZppyZppyZppx",
  ,
  "ZZlwZZlwZZlwZJpuZJpuY5tuY5tuY5tuYpprYpprYpprYppqYppqYppqYppqYJpoYJpnYJpnYJpnYJpnX5lkX5lkXppkXppkXppkXZlhXZlhXJpgXJpgXJpg",
  ,
  "XJpgW5lgXJpgXJpgXJpfXJpfWppdWppdWppbWppbWppbWZlaWZlaWJpYWJpYV5lXV5lXV5lXWJlXWJlXWJlXWJlXWJlXV5lVV5lVWJlVWJlVWJlVV5pUV5pU",
  ,
  "VplTVplTVplTVppSV5pSVplRVplRVplRVplRWJlRWJlRWJlRVphQVphQVphQVplPVplPVphOVphOVphOVplNVplNV5hMV5hMV5hMVplNV5lNVphMVphMVphM",
  ,
  "VplLVplLV5hKV5hKVplJVplJVplJVZhIVZhIVZlHVZlHVZlHVZlHV5lHVpdHVpdHVpdHVZhGVZhGVJdFVJdFVJdFVphEVphEVZdDVZdDVZdDVphCVphCVZdB",
  ,
  "VZdBVZdBVZdBVZdBVZhAVZhAVJc/VJc/VJc/Vpc/Vpc/VZY+VZY+VZY+VJc9VJc9VJc9VJc9VJc9VJg8VJg8VZc7VZc7VZc7VZc7VZc7VJY6VJY6VJc5VJc5",
  ,
  "VJc5UpY4UpY4UpY4UpY4UpY4VZY4VJc3VJc3U5Y2U5Y2U5Y2PLkKPLkKPLkKPLkLPLkMPLkMPLkMPLkMPLkMPLkMPLgNPLgOPLgOPLgOPLgPPLgPPLgQPLgR",
  ,
  "PLgRPLgRPLgSPLcSPLcSPLcTPLcTPLcTPLcUPLcVPbcVPbcVPbcWPbcWPbYXPbYXPbYXPbYXPbYYPbYYPbYZPbYaPbYaPbYaPrYbPrUcPrUcPrUdPrUdPrUd",
  ,
  "PrUePrUePrUePrUePrUfPrUfPrUgPrUhPrUhP7Uhb5uFb5uEb5uDbpqCbpqCbpqCbZuBbZt/bJp+bJp+bJp+bJp9bJp9app8app8a5t8a5t8a5t8aZt7aZt6",
  ,
  "aZt4aZt4aZt4aJp3aJp2aJp2aJp2aJp2Zpp0Zpp0ZppyZppyZppyZppyZppyZZlwZZlwZZlwZJpuZJpuY5ltY5tuYppsYppsYppsYpprYpprYpprYpprYppr",
  ,
  "YJpoYJpoYJpoYJpoYJpoX5lmX5lmXpplXppkXppkXZljXZljXJpgXJpgW5lgW5lgW5lgW5lgXJpgXJpgWppfWppfWppfWppdWppdWZlcWZlcWZlaWJpaWJpa",
  ,
  "V5lZV5lXV5lXV5lXV5lXWJlXWJlXWJlXV5lVV5lVV5lVV5lVV5hUV5hUV5pUVplTVppSVppSVppSVZlRVZlRVplRVplRVplRVplRVplRVZhQVphQVplPVplP",
  ,
  "VplPVZhOVZhOVplNVplNVplNVZhMVZhMVZhMVZhMVZhMVZhMVZhMVplLVplLVplLVZhKVZhKVJlJVplJVZhIVZhIVZhIVZlHVZlHVZlHVZlHVZlHVJdHVJdH",
  ,
  "VZhGVZhGVZhGVJdFVJdFVJhEVphEVphEVZdDVZdDVJhCVJhCVJhCU5dBU5dBVZdBVZdBVZhAVZhAVZhAVJc/VJc/VJc/VJc/VJc/UpY+UpY+Upc9VJc9VJc9",
  ,
  "VJc9VJc9VJg8VJg8VJg8U5c7U5c7U5c7U5c7VJY6VJY6VJY6VJc5VJc5UpY4UpY4UpY4UpY4UpY4Upc3Upc3Upc3Upc3UZY2UZY2U5Y2U5Y2U5Y2PLkKPLkK",
  ,
  "PLkKPLkLPLkMPLkMPLkMPLkMPLkMPLkMPLgNPLgOPLgOPLgOPLgPPLgPPLgQPLgRPLgRPLgRPLgSPLcSPLcSPLcTPLcTPLcTPLcUPLcVPbcVPbcVPbcWPbcW",
  ,
  "PbYXPbYXPbYXPbYXPbYYPbYYPbYZPbYaPbYaPbYaPrYbPrUcPrUcPrUdPrUdPrUdPrUePrUePrUePrUePrUfPrUfPrUgPrUhPrUhP7UhP7Uib5uEb5uEbpqC",
  ,
  "bpqCbpqCbZuBbZuBbJp+bJp+bJp+bJp9bJp9app8app8a5t9a5t9a5t8aZt7aZt7aZt6aZt6aZt4aJp3aJp3aJp2aJp2aJp2Zpp0Zpp0ZppyZppyZppyZppy",
  ,
  "ZppyZZlwZZlwZZlwZJpvZJpuY5ltY5tuYppsYppsYppsYpprYpprYpprYpprYpprYJpqYJpqYJpoYJpoYJpoX5lmX5lmXpplXpplXpplXZljXZljXJpgXJpg",
  ,
  "W5lgW5lgW5lgW5lgXJpgXJpgWppfWppfWppfWppdWppdWZlcWZlcWZlcWJpaWJpaV5lZV5lZV5lZV5lXV5lXV5lXV5lXV5lXVZlVV5lVV5lVV5lVV5hUV5hU",
  ,
  "VppUVplTVppSVppSVppSVZlRVZlRVplRVplRVplRVplRVplRVZhQVZhQVJlPVJlPVJlPVZhOVZhOVJlNVJlNVplNVZhMVZhMVZhMVZhMVZhMVZhMVZhMVplL",
  ,
  "VplLVplLVZhKVZhKVJlJVJlJU5hIU5hIU5hIVZlHVZlHVZlHVZlHVZlHVJdHVJdHU5hGVZhGVZhGVJdFVJdFVJhEVJhEVJhEU5dDU5dDVJhCVJhCVJhCU5dB",
  ,
  "U5dBU5dBU5dBU5hAU5hAVZhAVJc/VJc/VJc/VJc/VJc/UpY+UpY+Upc9Upc9Upc9Upc9Upc9VJg8VJg8VJg8U5c7U5c7U5c7U5c7UpY6UpY6VJY6VJc5VJc5",
  ,
  "UpY4UpY4UpY4UpY4UpY4Upc3Upc3Upc3Upc3UZY2UZY2U5Y2U5Y2U5Y2PLkLPLkLPLkLPLkMPLkMPLkMPLkNPLkNPLkNPLkNPLgOPLgPPLgPPLgPPLgQPbgQ",
  ,
  "PbgRPbgSPbgSPbgSPbgSPbcSPbcTPbcUPbcUPbcUPbcVPbcVPbcWPbcWPrcXPrcXPrYXPrYYPrYYPrYYPrYZPrYZPrYaPrYbPrYbPrYbPrYcPrUcP7UdP7Ue",
  ,
  "P7UeP7UeP7UeP7UeP7UfP7UfP7UgP7UgP7UhP7UhP7UhP7UiP7UjQLUjb5uEbpqCbpqCbpqCbZuBbZuBbJp+bJp+bJp+bJp9bJp9app8app8a5t9a5t9a5t8",
  ,
  "aZt7aZt7aZt6aZt6aZt4aJp3aJp3aJp2aJp2aJp2Zpp0Zpp0ZppyZppyZppyZppyZppyZZlwZZlwZZlwZJpvZJpuY5ltY5tuYppsYppsYppsYpprYpprYppr",
  ,
  "YpprYpprYJpqYJpqYJpoYJpoYJpoX5lmX5lmXpplXpplXpplXZljXZljXJpgXJpgW5lgW5lgW5lgW5lgXJpgXJpgWppfWppfWppfWppdWppdWZlcWZlcWZlc",
  ,
  "WJpaWJpaV5lZV5lZV5lZV5lXV5lXV5lXV5lXV5lXVZlVV5lVV5lVV5lVV5hUV5hUVppUVplTVppSVppSVppSVZlRVZlRVplRVplRVplRVplRVplRVZhQVZhQ",
  ,
  "VJlPVJlPVJlPVZhOVZhOVJlNVJlNVplNVZhMVZhMVZhMVZhMVZhMVZhMVZhMVplLVplLVplLVZhKVZhKVJlJVJlJU5hIU5hIU5hIVZlHVZlHVZlHVZlHVZlH",
  ,
  "VJdHVJdHU5hGVZhGVZhGVJdFVJdFVJhEVJhEVJhEU5dDU5dDVJhCVJhCVJhCU5dBU5dBU5dBU5dBU5hAU5hAVZhAVJc/VJc/VJc/VJc/VJc/UpY+UpY+Upc9",
  ,
  "Upc9Upc9Upc9Upc9VJg8VJg8VJg8U5c7U5c7U5c7U5c7UpY6UpY6VJY6VJc5VJc5UpY4UpY4UpY4UpY4UpY4Upc3Upc3Upc3Upc3UZY2UZY2U5Y2U5Y2U5Y2",
  ,
  "PbkLPbkLPbkLPbkMPbkMPbkMPbkNPbkNPbkNPbkNPbgOPbgPPbgPPbgPPbgQPrgQPrgRPrgSPrgSPrgSPrgSPrcSPrcTPrcUPrcUPrcUPrcVPrcVPrcWPrcW",
  ,
  "PrcXP7cXP7YXP7YYP7YYP7YYP7YZP7YZP7YaP7YbP7YbP7YbP7YcP7UcP7UdP7UeP7UeQLUeQLUeQLUeQLUfQLUfQLUgQLUgQLUhQLUhQLUhQLUiQLUjQLUj",
  ,
  "QLUkbpqCbpqCbpqCbZuAbZuAbZt/bZt/bZt/a5t9a5t9a5t9a5t9a5t9a5t9a5t9aZt7aZt7aZt6aZt6aZt6aJp3aJp3aJp2aJp2aJp2Zpp0Z5t2ZppzZppz",
  ,
  "ZppzZppyZppyZZtyZZtyZZtyZJpvZJpvY5tvY5tuYppsYppsYppsYpprYpprYpprYpprYpprYJpqYJpqYJpoYJpoYJpoX5toX5toXpplXpplXpplXZtjXZtj",
  ,
  "XJpiXJpiXJpgXJpgXJpgXJpgXJpgXJpgWppfWppfWppfWppdWppdWZlcWZlcWZlcWJpaWJpaV5tZV5tZV5tZVppYVppYVppYVppWVppWVppWVppWVJpUVppU",
  ,
  "VppUVppUVppUVJlTVppSVppSVppSVZlRVZlRVplRVJlRVJlRVJlRVJlRVZpQVZpQVJlPVJlPVJlPVJpOVJpOVJlNVJlNVJlNVJlNVJlNVplNVplNVplNVZhM",
  ,
  "VZhMVJlLVJlLVJlLU5hKVZhKVJlJVJlJU5hIU5hIU5hIVZlHVZlHVZlHVZlHVZlHVJdHVJdHU5hGU5hGU5hGUpdFUpdFVJhEVJhEVJhEU5dDU5dDUphCUphC",
  ,
  "UphCUplBVJlBVJlBVJlBU5hAU5hAU5hAU5hAU5hAVJc/VJc/VJc/U5g+U5g+Upc9Upc9Upc9Upc9Upc9Upg8Upg8Upg8Upg8Upg8U5c7U5c7Upg6Upg6Upg6",
  ,
  "UZc5UZc5UZg4UZg4UZg4UZg4UZg4Upc3Upc3Upc3Upc3Upc3Upc3UZc1UZc1UZc1PrkLPrkLPrkLPrkMPrkMPrkMPrkNPrkNPrkNPrkNPrgOPrgPPrgPPrgP",
  ,
  "PrgQPrgQP7gRP7gSP7gSP7gSP7gSP7cSP7cTP7cUP7cUP7cUP7cVP7cVP7cWP7cWP7cXP7cXQLYXQLYYQLYYQLYYQLYZQLYZQLYaQLYbQLYbQLYbQLYcQLUc",
  ,
  "QLUdQLUeQLUeQLUeQLUeQbUeQbUfQbUfQbUgQbUgQbUhQbUhQbUhQbUiQbUjQbUjQbUkQbUkbpqCbpqCbZuCbZuAbZt/bZt/bZt/a5t+a5t9a5t9a5t9a5t9",
  ,
  "a5t9a5t9aZt7aZt7aZt6aZt6aZt6aJp4aJp4aJp2aJp2aJp2Zpp1Z5t2ZppzZppzZppzZppzZppyZZtyZZtyZZtyZJpwZJpvY5tvY5tvYppsYppsYppsYppr",
  ,
  "YpprYpprYpprYpprYJpqYJpqYJpoYJpoYJpoX5toX5toXpplXpplXpplXZtlXZtlXJpiXJpiXJpiXJpiXJpiXJpgXJpgXJpgWppfWppfWppfWppdWppdWZlc",
  ,
  "WZlcWZlcWJpbWJpbV5tZV5tZV5tZVppYVppYVppYVppYVppYVppWVppWVJpUVJpUVppUVppUVppUVJlTVJpSVJpSVJpSVZlRVZlRVJlRVJlRVJlRVJlRVJlR",
  ,
  "VZpQVZpQVJlPVJlPVJlPVJpOVJpOVJlNVJlNVJlNVJlNVJlNVJlNVJlNVJlNU5hMVZhMVJlLVJlLVJlLU5hKU5hKVJlJVJlJU5hIU5hIU5hIU5lHU5lHVZlH",
  ,
  "VZlHVZlHVJdHVJdHU5hGU5hGU5hGUpdFUpdFUphEUphEUphEU5dDU5dDUphCUphCUphCUplBUplBUplBUplBU5hAU5hAU5hAU5hAU5hAUpc/Upc/Upc/UZg+",
  ,
  "UZg+Upc9Upc9Upc9Upc9Upc9Upg8Upg8Upg8Upg8Upg8UZc7UZc7UJg6UJg6Upg6UZc5UZc5UZg4UZg4UZg4UZg4UZg4Upc3Upc3Upc3Upc3Upc3Upc3UZc1",
  ,
  "UZc1UZc1PrkLPrkLPrkLPrkMPrkMPrkMPrkNPrkNPrkNPrkNPrgOPrgPPrgPPrgPPrgQPrgQP7gRP7gSP7gSP7gSP7gSP7cSP7cTP7cUP7cUP7cUP7cVP7cV",
  ,
  "P7cWP7cWP7cXP7cXQLYXQLYYQLYYQLYYQLYZQLYZQLYaQLYbQLYbQLYbQLYcQLUcQLUdQLUeQLUeQLUeQLUeQbUeQbUfQbUfQbUgQbUgQbUhQbUhQbUhQbUi",
  ,
  "QbUjQbUjQbUkQbUkQbUkbpqCbZuCbZuCbZuAbZt/bZt/a5t+a5t9a5t9a5t9a5t9a5t9aZt7aZt7aZt7aZt7aZt7aJp4aJp4aJp3aJp3Zpp2Zpp2Zpp1Zpp1",
  ,
  "Zpp1ZppzZppzZppzZZtzZZtzZJpwZJpwZJpwY5tvY5tvYppsYppsYppsYppsYppsYpprYpprYpprYJpqYJpqYJppYJppX5tpX5tpX5toXppmXppmXZtlXZtl",
  ,
  "XZtlXJpjXJpjXJpiXJpiXJpiXJpiXJpiXJpiWppfWppfWppfWppeWppeWZlcWJpbWJpbWJpbV5taV5taVppYVppYVppYVppYVppYVppYVppYVppYVJpUVJpU",
  ,
  "VJpUVJpUVJlTVJlTVJlTVJpSVJpSVZlRVZlRVZlRVJlRVJlRVJlRVJlRVJlRU5pQVZpQVJlPVJlPVJlPVJpOVJpOUplNUplNUplNUplNVJlNVJlNVJlNU5hM",
  ,
  "U5hMU5hMVJlLVJlLU5hKU5hKU5hKU5lJU5lJU5hIU5hIU5hIU5lHU5lHU5lHU5lHU5lHUpdHU5hGU5hGUpdFUpdFUpdFUphEUphEU5dDU5dDU5dDUphCUphC",
  ,
  "UplBUplBUplBUplBUplBUZhAUZhAU5hAU5hAU5hAUpc/Upc/UZg+UZg+UZg+UJc9Upc9Upc9Upc9Upc9Upg8Upg8UZc7UZc7UZc7UZc7UZc7UJg6UJg6T5c5",
  ,
  "T5c5T5c5UZg4UZg4UZg4UZg4UZg4UJc3UJc3UJc3UJc3UJc3UJc3Tpc1Tpc1UZc1UZc1UZc1P7kLP7kLP7kLP7kMP7kMP7kMP7kNP7kNP7kNP7kNP7gOP7gP",
  ,
  "P7gPP7gPP7gQP7gQP7gRQLgSQLgSQLgSQLgSQLcSQLcTQLcUQLcUQLcUQLcVQLcVQLcWQLcWQLcXQLcXQLYXQLYYQbYYQbYYQbYZQbYZQbYaQbYbQbYbQbYb",
  ,
  "QbYcQbUcQbUdQbUeQbUeQbUeQbUeQbUeQbUfQbUfQbUgQbUgQbUhQbUhQbUhQbUiQbUjQbUjQbUkQbUkQbUkQbUkbZuCbZuCbZuAbZt/bZt/a5t+a5t9a5t9",
  ,
  "a5t9a5t9a5t9aZt7aZt7aZt7aZt7aZt7aJp4aJp4aJp3aJp3Zpp2Zpp2Zpp1Zpp1Zpp1ZppzZppzZppzZZtzZZtzZJpwZJpwZJpwY5tvY5tvYppsYppsYpps",
  ,
  "YppsYppsYpprYpprYpprYJpqYJpqYJppYJppX5tpX5tpX5toXppmXppmXZtlXZtlXZtlXJpjXJpjXJpiXJpiXJpiXJpiXJpiXJpiWppfWppfWppfWppeWppe",
  ,
  "WZlcWJpbWJpbWJpbV5taV5taVppYVppYVppYVppYVppYVppYVppYVppYVJpUVJpUVJpUVJpUVJlTVJlTVJlTVJpSVJpSVZlRVZlRVZlRVJlRVJlRVJlRVJlR",
  ,
  "VJlRU5pQVZpQVJlPVJlPVJlPVJpOVJpOUplNUplNUplNUplNVJlNVJlNVJlNU5hMU5hMU5hMVJlLVJlLU5hKU5hKU5hKU5lJU5lJU5hIU5hIU5hIU5lHU5lH",
  ,
  "U5lHU5lHU5lHUpdHU5hGU5hGUpdFUpdFUpdFUphEUphEU5dDU5dDU5dDUphCUphCUplBUplBUplBUplBUplBUZhAUZhAU5hAU5hAU5hAUpc/Upc/UZg+UZg+",
  ,
  "UZg+UJc9Upc9Upc9Upc9Upc9Upg8Upg8UZc7UZc7UZc7UZc7UZc7UJg6UJg6T5c5T5c5T5c5UZg4UZg4UZg4UZg4UZg4UJc3UJc3UJc3UJc3UJc3UJc3Tpc1",
  ,
  "Tpc1UZc1UZc1UZc1QLgMQLgMQLgMQLgMQLgNQLgNQLgOQLgOQLgOQLgOQLgPQLcQQLcQQLcQQLcRQLcRQLcSQbcSQbcSQbcSQbcTQbcTQbYUQbYVQbYVQbYV",
  ,
  "QbYWQbYWQbYXQbYXQbYXQbYXQbYYQbUYQbUZQbUZQbUaQbUaQbUbQbUbQbUbQbUcQbUdQbUdQbUeQbUeQbUeQbUeQbUfQbUfQbUgQbUgQbUgQbUhQrUiQrQi",
  ,
  "QrQiQrQjQrQjQrQkQrQkQrQkQrQkQrQlQrQmbZuCbZuAbZt/bZt/a5t+a5t9a5t9a5t9a5t9a5t9aZt7aZt7aZt7aZt7aZt7aJp4aJp4aJp3aJp3Zpp2Zpp2",
  ,
  "Zpp1Zpp1Zpp1ZppzZppzZppzZZtzZZtzZJpwZJpwZJpwY5tvY5tvYppsYppsYppsYppsYppsYpprYpprYpprYJpqYJpqYJppYJppX5tpX5tpX5toXppmXppm",
  ,
  "XZtlXZtlXZtlXJpjXJpjXJpiXJpiXJpiXJpiXJpiXJpiWppfWppfWppfWppeWppeWZlcWJpbWJpbWJpbV5taV5taVppYVppYVppYVppYVppYVppYVppYVppY",
  ,
  "VJpUVJpUVJpUVJpUVJlTVJlTVJlTVJpSVJpSVZlRVZlRVZlRVJlRVJlRVJlRVJlRVJlRU5pQVZpQVJlPVJlPVJlPVJpOVJpOUplNUplNUplNUplNVJlNVJlN",
  ,
  "VJlNU5hMU5hMU5hMVJlLVJlLU5hKU5hKU5hKU5lJU5lJU5hIU5hIU5hIU5lHU5lHU5lHU5lHU5lHUpdHU5hGU5hGUpdFUpdFUpdFUphEUphEU5dDU5dDU5dD",
  ,
  "UphCUphCUplBUplBUplBUplBUplBUZhAUZhAU5hAU5hAU5hAUpc/Upc/UZg+UZg+UZg+UJc9Upc9Upc9Upc9Upc9Upg8Upg8UZc7UZc7UZc7UZc7UZc7UJg6",
  ,
  "UJg6T5c5T5c5T5c5UZg4UZg4UZg4UZg4UZg4UJc3UJc3UJc3UJc3UJc3UJc3Tpc1Tpc1UZc1UZc1UZc1QLgMQLgMQLgMQLgMQLgNQLgNQLgOQLgOQLgOQLgO",
  ,
  "QLgPQLcQQLcQQLcQQLcRQLcRQLcSQbcSQbcSQbcSQbcTQbcTQbYUQbYVQbYVQbYVQbYWQbYWQbYXQbYXQbYXQbYXQbYYQbUYQbUZQbUZQbUaQbUaQbUbQbUb",
  ,
  "QbUbQbUcQbUdQbUdQbUeQbUeQbUeQbUeQbUfQbUfQbUgQbUgQbUgQbUhQrUiQrQiQrQiQrQjQrQjQrQkQrQkQrQkQrQkQrQlQrQmQrQmbZuAbZuAbZuAa5t+",
  ,
  "a5t9a5t9a5t9a5t9a5t9aZt7aZt7aZt7aZt7aZt7aJp4aJp4aJp4aJp3Zpp2Zpp2Zpp2Zpp1Zpp1Zpp1Zpp1Zpp1ZZtzZZtzZJpwZJpwZJpwY5tvY5tvYppu",
  ,
  "YppuYppuYppsYppsYppsYppsYppsYJpqYJpqYJppYJppX5tpX5tpX5tpXppmXppmXZtlXZtlXZtlXJpjXJpjXJpiXJpiXJpiXJpiXJpiXJpiWppfWppfWppf",
  ,
  "WppeWppeWZlcWJpbWJpbWJpbV5taV5taVppYVppYVppYVppYVppYVppYVppYVppYVJpUVJpUVJpUVJpUU5lTU5lTU5lTVJpSVJpSU5lRU5lRU5lRUplRVJlR",
  ,
  "VJlRVJlRVJlRU5pQU5pQUplPUplPUplPVJpOVJpOUplNUplNUplNUplNUplNUplNUplNU5hMU5hMU5hMUplLUplLU5hKU5hKU5hKU5lJU5lJUZhIUZhIUZhI",
  ,
  "UZlHU5lHU5lHU5lHU5lHUpdHU5hGU5hGUpdFUpdFUpdFUphEUphEUZdDUZdDUZdDUphCUphCUplBUplBUplBUplBUplBUZhAUZhAUZhAUZhAUZhAUJc/Upc/",
  ,
  "UZg+UZg+UZg+UJc9UJc9UJc9UJc9UJc9UJg8Upg8UZc7UZc7UZc7UZc7UZc7UJg6UJg6T5c5T5c5T5c5T5g4T5g4UZg4UZg4UZg4UJc3UJc3UJc3UJc3UJc3",
  ,
  "UJc3Tpc1Tpc1Tpc1Tpc1Tpc1QbgMQbgMQbgMQbgMQbgNQbgNQbgOQbgOQbgOQbgOQbgPQbcQQbcQQbcQQbcRQbcRQbcSQbcSQbcSQbcSQbcTQbcTQbYUQbYV",
  ,
  "QbYVQbYVQbYWQbYWQbYXQbYXQbYXQbYXQbYYQbUYQbUZQbUZQbUaQbUaQrUbQrUbQrUbQrUcQrUdQrUdQrUeQrUeQrUeQrUeQrUfQrUfQrUgQrUgQrUgQrUh",
  ,
  "QrUiQrQiQrQiQrQjQ7QjQ7QkQ7QkQ7QkQ7QkQ7QlQ7QmQ7QmQ7MnbZuAbZuAa5t/a5t+a5t9a5t9a5t9a5t9aZt8aZt7aZt7aZt7aZt7aJp4aJp4aJp4aJp4",
  ,
  "Zpp2Zpp2Zpp2Zpp1Zpp1Zpp1Zpp1Zpp1ZZtzZZtzZJpwZJpwZJpwY5twY5twYppuYppuYppuYppsYppsYppsYppsYppsYJprYJprYJppYJppX5tpX5tpX5tp",
  ,
  "XppmXppmXZtmXZtmXZtlXJpjXJpjXJpjXJpiXJpiXJpiXJpiXJpiWppgWppfWppfWppeWppeWZldWJpbWJpbWJpbV5taV5taVppYVppYVppYVppYVppYVppY",
  ,
  "VppYVppYVJpWVJpWVJpUVJpUU5lTU5lTU5lTVJpSVJpSU5lRU5lRU5lRUplRUplRUplRVJlRVJlRU5pQU5pQUplPUplPUplPVJpOVJpOUplNUplNUplNUplN",
  ,
  "UplNUplNUplNU5hMU5hMU5hMUplLUplLUZhKUZhKUZhKUZlJU5lJUZhIUZhIUZhIUZlHUZlHUZlHUZlHUZlHUpdHUZhGUZhGUJdFUpdFUpdFUphEUphEUZdD",
  ,
  "UZdDUZdDUJhCUJhCUJlBUplBUplBUplBUplBUZhAUZhAUZhAUZhAUZhAUJc/UJc/T5g+T5g+T5g+UJc9UJc9UJc9UJc9UJc9UJg8UJg8T5c7T5c7T5c7UZc7",
  ,
  "UZc7UJg6UJg6T5c5T5c5T5c5T5g4T5g4T5g4T5g4T5g4Tpc3Tpc3UJc3UJc3UJc3UJc3Tpc1Tpc1Tpc1Tpc1Tpc1QbgMQbgMQbgMQbgMQbgNQbgNQbgOQbgO",
  ,
  "QbgOQbgOQbgPQbcQQbcQQbcQQbcRQbcRQbcSQbcSQbcSQbcSQbcTQbcTQbYUQbYVQbYVQbYVQbYWQbYWQbYXQbYXQbYXQbYXQbYYQbUYQbUZQbUZQbUaQbUa",
  ,
  "QrUbQrUbQrUbQrUcQrUdQrUdQrUeQrUeQrUeQrUeQrUfQrUfQrUgQrUgQrUgQrUhQrUiQrQiQrQiQrQjQ7QjQ7QkQ7QkQ7QkQ7QkQ7QlQ7QmQ7QmQ7MnQ7Mn",
  ,
  "a5t/a5t/a5t+a5t+a5t9a5t9a5t9aZt8aZt8aZt7aJp4aJp4aJp4aJp4aJp4Zpp2Zpp2Zpp2Zpp2Zpp1Zpp1Zpp1Zpp1ZZt0ZZtzZJpyZJpyZJpyY5twY5tw",
  ,
  "YppuYppuYppuYppuYppsYppsYppsYJprYJprYJprYJppYJppX5loX5tpX5tpXppmXppmXZtmXZtmXZtmXJplXJplXJpjXJpjXJpjXJpjXJpjWppgWppgWppg",
  ,
  "WppgWppgWZldWZldWJpdWJpdWJpdV5laV5taVppZVppZVppZVppZVppYVppYVppYVJpWVJpWVJpWVJpWVJpWU5lTU5lTU5lTUppSUppSUZlRU5lRU5lRUplR",
  ,
  "UplRUplRUplRUppQUppQUppQUplPUplPUppOUppOUZlNUZlNUplNUplNUplNUplNUplNU5hMU5hMUplLUplLUplLUZhKUZhKUZlJUZlJUZlJUZhIUZhIUZlH",
  ,
  "UZlHUZlHUZlHUZlHUJdHUpdHUpdHUZhGUZhGUJdFUJdFUJhEUJhEUJhEUZdDUZdDUJhCUJhCUJhCT5dBUJlBUJlBUJlBUJlBT5hAUZhAUZhAUJc/UJc/UJc/",
  ,
  "T5g+T5g+Tpc9Tpc9Tpc9UJc9UJc9UJg8UJg8UJg8T5c7T5c7Tpc7Tpc7Tpc7Tpg6Tpg6TZc5TZc5T5g4T5g4T5g4T5g4T5g4Tpc3Tpc3Tpc3TZc3TZc3TJc1",
  ,
  "TJc1TJc1TJc1Tpc1Tpc1TZY0TZY0TZY0QbgMQbgMQbgMQbgMQbgNQbgNQbgOQbgOQbgOQbgOQbgPQbcQQbcQQbcQQbcRQbcRQbcSQbcSQbcSQbcSQrcTQrcT",
  ,
  "QrYUQrYVQrYVQrYVQrYWQrYWQrYXQrYXQrYXQrYXQrYYQrUYQrUZQrUZQrUaQrUaQrUbQrUbQrUbQ7UcQ7UdQ7UdQ7UeQ7UeQ7UeQ7UeQ7UfQ7UfQ7UgQ7Ug",
  ,
  "Q7UgQ7UhQ7UiQ7QiQ7QiQ7QjQ7QjQ7QkQ7QkRLQkRLQkRLQlRLQmRLQmRLMnRLMnRLMna5t/a5t+a5t+a5t9a5t9a5t9aZt8aZt8aZt7aJp4aJp4aJp4aJp4",
  ,
  "aJp4Zpp2Zpp2Zpp2Zpp2Zpp1Zpp1Zpp1Zpp1ZZt0ZZtzZJpyZJpyZJpyY5twY5twYppuYppuYppuYppuYppsYppsYppsYJprYJprYJprYJppYJppX5loX5tp",
  ,
  "X5tpXppmXppmXZtmXZtmXZtmXJplXJplXJpjXJpjXJpjXJpjXJpjWppgWppgWppgWppgWppgWZldWZldWJpdWJpdWJpdV5laV5taVppZVppZVppZVppZVppY",
  ,
  "VppYVppYVJpWVJpWVJpWVJpWVJpWU5lTU5lTU5lTUppSUppSUZlRU5lRU5lRUplRUplRUplRUplRUppQUppQUppQUplPUplPUppOUppOUZlNUZlNUplNUplN",
  ,
  "UplNUplNUplNU5hMU5hMUplLUplLUplLUZhKUZhKUZlJUZlJUZlJUZhIUZhIUZlHUZlHUZlHUZlHUZlHUJdHUpdHUpdHUZhGUZhGUJdFUJdFUJhEUJhEUJhE",
  ,
  "UZdDUZdDUJhCUJhCUJhCT5dBUJlBUJlBUJlBUJlBT5hAUZhAUZhAUJc/UJc/UJc/T5g+T5g+Tpc9Tpc9Tpc9UJc9UJc9UJg8UJg8UJg8T5c7T5c7Tpc7Tpc7",
  ,
  "Tpc7Tpg6Tpg6TZc5TZc5T5g4T5g4T5g4T5g4T5g4Tpc3Tpc3Tpc3TZc3TZc3TJc1TJc1TJc1TJc1Tpc1Tpc1TZY0TZY0TZY0QrgMQrgMQrgMQrgNQrgOQrgO",
  ,
  "QrgPQrgPQrgPQrgPQrgQQrcRQrcRQrcRQrcSQrcSQrcSQrcTQrcTQrcTQrcUQrcUQ7YVQ7YWQ7YWQ7YWQ7YXQ7YXQ7YXQ7YXQ7YYQ7YYQ7YZQ7UZQ7UaQ7Ua",
  ,
  "Q7UbQ7UbQ7UcQ7UcQ7UcQ7UdQ7UeQ7UeRLUeRLUeRLUeRLUfRLUgRLUgRLUhRLUhRLUhRLUiRLUjRLQjRLQjRLQkRLQkRLQkRLQlRLQlRLQlRLQmRLQmRLQn",
  ,
  "RbMoRbMoRbMoRbMpa5t+a5t+a5t+a5t+a5t+aZt8aZt8aZt7aZt7aZt7aZt5Z5t4Z5t4Z5t3Z5t3Z5t3Zpp2Zpp2Zpp2Zpp1Zpp1ZZt0ZZt0ZJpyZJpyZJpy",
  ,
  "Y5twY5twYppvY5twYZttYZttYZttYZttYZttYZtsYZtsYZtsYJprYJppX5tpX5tpX5tpXppoXppmXZtmXZtmXZtmXJplXJplXJpjXJpjXJpjXJpjXJpjW5ti",
  ,
  "W5tiWppgWppgWppgWZtfWZtfWJpdWJpdWJpdV5tcV5tcVppZVppZVppZVppZVppZVppZVppZVZtXVZtXVZtXVJpWVJpWVJpVVJpVVJpVUppSUppSUZtRUZtR",
  ,
  "UZtRUZlRUZlRUplRUplRUppQUppQUppQUplPUplPUppOUppOUZlNUZlNUplNUplNUplNUplNUplNUZhMUZhMUJlLUJlLUplLUZhKUZhKUZlJUZlJUZlJUJhI",
  ,
  "UJhIT5lHUZlHUZlHUZlHUZlHUJlHUJlHUJlHT5lFT5lFT5lFUZlFUJhEUJhEUJhET5lDT5lDTphCTphCTphCUJlBUJlBUJlBUJlBUJlBT5lBTphATphATpk/",
  ,
  "Tpk/Tpk/T5g+T5g+T5g+T5g+T5g+T5g+T5g+TZg8TZg8TZg8T5g8T5g8Tpc7Tpc7Tpc7Tpg6Tpg6TZk5TZk5TJg4TJg4TJg4TJg4TJg4Tpk3Tpk3Tpk3TZc3",
  ,
  "TZc3TZg2TZg2TZg2TZg2TJc1TJc1TJg0TJg0TJg0Q7gMQ7gMQ7gMQ7gNQ7gOQ7gOQ7gPQ7gPQ7gPQ7gPQ7gQQ7cRQ7cRQ7cRQ7cSQ7cSQ7cSQ7cTQ7cTQ7cT",
  ,
  "Q7cUQ7cUQ7YVRLYWRLYWRLYWRLYXRLYXRLYXRLYXRLYYRLYYRLYZRLUZRLUaRLUaRLUbRLUbRLUcRLUcRLUcRLUdRLUeRLUeRLUeRLUeRLUeRLUfRbUgRbUg",
  ,
  "RbUhRbUhRbUhRbUiRbUjRbQjRbQjRbQkRbQkRbQkRbQlRbQlRbQlRbQmRbQmRbQnRbMoRbMoRbMoRbMpRbMpa5t/a5t+a5t+a5t+aZt8aZt8aZt7aZt7aZt7",
  ,
  "aZt7Z5t4Z5t4Z5t3Z5t3Z5t3Zpp2Zpp2Zpp2Zpp2Zpp2ZZt0ZZt0ZJpyZJpyZJpyY5tyY5twYppvY5twYZtvYZtvYZttYZttYZttYZttYZttYZtsYJprYJpr",
  ,
  "X5tqX5tpX5tpXppoXppoXZtmXZtmXZtmXJplXJplXJpjXJpjXJpjXJpjXJpjW5tiW5tiWppgWppgWppgWZtfWZtfWJpdWJpdWJpdV5tcV5tcVppZVppZVppZ",
  ,
  "VppZVppZVppZVppZVZtYVZtYVZtYVJpWVJpWVJpVVJpVVJpVUppSUppSUZtRUZtRUZtRUZlRUZlRUZlRUZlRUppQUppQUppQUJlPUJlPUJpOUJpOUZlNUZlN",
  ,
  "UJlNUJlNUJlNUplNUplNUZhMUZhMUJlLUJlLUJlLUZhKUZhKUZlJUZlJUZlJUJhIUJhIT5lHT5lHT5lHT5lHT5lHUJlHUJlHUJlHT5lFT5lFT5lFT5lFTphE",
  ,
  "TphETphET5lDT5lDTphCTphCTphCUJlBUJlBUJlBUJlBUJlBT5lBTphATphATpk/Tpk/Tpk/T5g+T5g+T5g+T5g+T5g+T5g+T5g+TZg8TZg8TZg8TZg8TZg8",
  ,
  "TJc7Tpc7Tpc7Tpg6Tpg6TZk5TZk5TJg4TJg4TJg4TJg4TJg4TJk3TJk3TJk3TZc3TZc3TZg2TZg2TZg2TZg2TJc1TJc1TJg0TJg0TJg0RLcMRLcMRLcMRLcN",
  ,
  "RLcORLcORLcPRLcPRLcPRLcPRLcQRLYRRLYRRLYRRLYSRLYSRLYSRLYTRLYTRLYTRLYURLYURLUVRLUWRLUWRLUWRbUXRbUXRbUXRbUXRbUYRbUYRbUZRbUZ",
  ,
  "RbUaRbUaRbUbRbUbRbUcRbUcRbUcRbUdRbUeRbUeRbUeRbQeRbQeRbQfRbQgRbQgRbQhRbQhRrQhRrQiRrQjRrQjRrQjRrQkRrMkRrMkRrMlRrMlRrMlRrMm",
  ,
  "RrMmRrMnRrMoRrMoRrMoRrIpRrIpRrIqa5t/a5t+a5t+aZt8aZt8aZt8aZt7aZt7aZt7Z5t4Z5t4Z5t4Z5t3Z5t3Zpp2Zpp2Zpp2Zpp2Zpp2ZZt0ZZt0ZJpz",
  ,
  "ZJpyZJpyY5tyY5tyYppvY5twYZtvYZtvYZtvYZtvYZttYZttYZttYZttYJprYJprX5tqX5tqX5tqXppoXppoXZtmXZtmXZtmXJplXJplXJpjXJpjXJpjXJpj",
  ,
  "XJpjW5tiW5tiWpphWpphWpphWZtfWZtfWJpeWJpeWJpeV5tcV5tcVppbVppbVppbVppbVppZVppZVppZVZtYVZtYVZtYVJpWVJpWVJpVVJpVVJpVUppSUppS",
  ,
  "UZtRUZtRUZtRUZlRUZlRUZlRUZlRUppQUppQUppQUJlPUJlPUJpOUJpOUZlNUZlNUJlNUJlNUJlNUJlNUJlNT5hMUZhMUJlLUJlLUJlLUJhKUZhKUZlJUZlJ",
  ,
  "UZlJUJhIUJhIT5lHT5lHT5lHT5lHT5lHTplHTplHTplHTZlFT5lFT5lFT5lFTphETphETphET5lDT5lDTphCTphCTphCTplBTplBTplBTplBUJlBT5lBTphA",
  ,
  "TphATpk/Tpk/Tpk/TZg+TZg+TZg+TZg+T5g+T5g+T5g+TZg8TZg8TZg8TZg8TZg8TJc7TJc7TJc7TJg6S5g6S5k5TZk5TJg4TJg4TJg4TJg4TJg4TJk3TJk3",
  ,
  "TJk3S5c3TZc3TZg2TZg2TZg2TZg2TJc1TJc1TJg0TJg0TJg0RLcMRLcMRLcMRLcNRLcORLcORLcPRLcPRLcPRLcPRLcQRLYRRLYRRLYRRLYSRLYSRLYSRLYT",
  ,
  "RLYTRLYTRLYURLYURLUVRLUWRLUWRLUWRbUXRbUXRbUXRbUXRbUYRbUYRbUZRbUZRbUaRbUaRbUbRbUbRbUcRbUcRbUcRbUdRbUeRbUeRbUeRbQeRbQeRbQf",
  ,
  "RbQgRbQgRbQhRbQhRrQhRrQiRrQjRrQjRrQjRrQkRrMkRrMkRrMlRrMlRrMlRrMmRrMmRrMnRrMoRrMoRrMoRrIpRrIpRrIqRrIqaZt9aZt9aZt9aZt8aZt8",
  ,
  "aZt7aZt7aZt7Z5t4Z5t4Z5t4Zpp2Zpp2Zpp2Zpp2Zpp2ZZt0ZZt0ZZt0ZJpzZJpzY5tyY5tyY5tyYppvYppvYZtvYZtvYZtvYZtvYZtvYZttYZttYZttYJpr",
  ,
  "YJprX5tqX5tqXppoXppoXppoXZtnXZtnXJplXJplXJpkXJpkXJpkXJpkW5tiW5tiW5tiW5tiWpphWpphWZtfWZtfWZtfWJpeWJpeV5tcV5tcV5tcVppbVppb",
  ,
  "VppbVppbVppbVppZVppZVJpYVZtYVZtYVJpXVJpXVJpVVJpVUppUUppUUppUUZtTUZlRUZlRUZlRUZlRUZlRUJpQUJpQT5lPT5lPT5lPUJpOUJpOT5lNT5lN",
  ,
  "T5lNUJlNUJlNUJlNUJlNUJlNT5hMT5hMUJlLUJlLUJlLUJhKUJhKT5lJT5lJT5lJTphIUJhIT5lHT5lHT5lHT5lHTplHTplHTZlFTZlFTZlFT5lFT5lFTphE",
  ,
  "TphETZlDTZlDTZlDTJhCTJhCTplBTplBTplBTplBTplBTZhATZhATZhATJhATJhATJk/Tpk/Tpk/TZg+TZg+TZg+TZg+TZg+TZg+S5g8S5g8TZg8TZg8TZg8",
  ,
  "TJc7TJc7TJg6TJg6TJg6TZc5S5k5Spg4Spg4Spg4Spg4Spg4TJk3TJk3S5c3S5c3S5c3S5g2S5g2Spc1Spc1Spc1Spc1TJg0TJg0S5czS5czS5czRbcMRbcM",
  ,
  "RbcMRbcNRbcORbcORbcPRbcPRbcPRbcPRbcQRbYRRbYRRbYRRbYSRbYSRbYSRbYTRbYTRbYTRbYURbYURbUVRbUWRbUWRbUWRbUXRbUXRrUXRrUXRrUYRrUY",
  ,
  "RrUZRrUZRrUaRrUaRrUbRrUbRrUcRrUcRrUcRrUdRrUeRrUeRrUeRrQeRrQeRrQfRrQgRrQgRrQhRrQhRrQhRrQiRrQjRrQjRrQjR7QkR7MkR7MkR7MlR7Ml",
  ,
  "R7MlR7MmR7MmR7MnR7MoR7MoR7MoR7IpR7IpR7IqR7IqR7IqaZt9aZt9aZt8aZt8aZt7aZt7aZt7Z5t4Z5t4Z5t4Zpp2Zpp2Zpp2Zpp2Zpp2ZZt0ZZt0ZZt0",
  ,
  "ZJpzZJpzY5tyY5tyY5tyYppvYppvYZtvYZtvYZtvYZtvYZtvYZttYZttYZttYJprYJprX5tqX5tqXppoXppoXppoXZtnXZtnXJplXJplXJpkXJpkXJpkXJpk",
  ,
  "W5tiW5tiW5tiW5tiWpphWpphWZtfWZtfWZtfWJpeWJpeV5tcV5tcV5tcVppbVppbVppbVppbVppbVppZVppZVJpYVZtYVZtYVJpXVJpXVJpVVJpVUppUUppU",
  ,
  "UppUUZtTUZlRUZlRUZlRUZlRUZlRUJpQUJpQT5lPT5lPT5lPUJpOUJpOT5lNT5lNT5lNUJlNUJlNUJlNUJlNUJlNT5hMT5hMUJlLUJlLUJlLUJhKUJhKT5lJ",
  ,
  "T5lJT5lJTphIUJhIT5lHT5lHT5lHT5lHTplHTplHTZlFTZlFTZlFT5lFT5lFTphETphETZlDTZlDTZlDTJhCTJhCTplBTplBTplBTplBTplBTZhATZhATZhA",
  ,
  "TJhATJhATJk/Tpk/Tpk/TZg+TZg+TZg+TZg+TZg+TZg+S5g8S5g8TZg8TZg8TZg8TJc7TJc7TJg6TJg6TJg6TZc5S5k5Spg4Spg4Spg4Spg4Spg4TJk3TJk3",
  ,
  "S5c3S5c3S5c3S5g2S5g2Spc1Spc1Spc1Spc1TJg0TJg0S5czS5czS5czRrcNRrcNRrcNRrcORrcORrcPRrcQRrcQRrcQRrcQRrcRRrYRRrYSRrYSRrYSRrYS",
  ,
  "RrYTRrYTRrYTRrYURrYVRrYVRrUWRrUWRrUWRrUXRrUXRrUXRrUYRrUYRrUYR7UZR7UaR7UaR7UbR7UbR7UbR7UcR7UdR7UdR7UdR7UeR7UeR7UeR7UfR7Qf",
  ,
  "R7QfR7QgR7QgR7QhR7QiR7QiR7QiR7QjR7QjR7QkR7QkR7QkR7MkR7MlR7MlSLMmSLMmSLMmSLMnSLMoSLMoSLMoSLMpSLIpSLIqSLIqSLIqSLIqSLIraZt9",
  ,
  "aZt8aZt8aZt7aZt7aZt7Z5t4Z5t4Z5t4Zpp2Zpp2Zpp2Zpp2Zpp2ZZt0ZZt0ZZt0ZJpzZJpzY5tyY5tyY5tyYppvYppvYZtvYZtvYZtvYZtvYZtvYZttYZtt",
  ,
  "YZttYJprYJprX5tqX5tqXppoXppoXppoXZtnXZtnXJplXJplXJpkXJpkXJpkXJpkW5tiW5tiW5tiW5tiWpphWpphWZtfWZtfWZtfWJpeWJpeV5tcV5tcV5tc",
  ,
  "VppbVppbVppbVppbVppbVppZVppZVJpYVZtYVZtYVJpXVJpXVJpVVJpVUppUUppUUppUUZtTUZlRUZlRUZlRUZlRUZlRUJpQUJpQT5lPT5lPT5lPUJpOUJpO",
  ,
  "T5lNT5lNT5lNUJlNUJlNUJlNUJlNUJlNT5hMT5hMUJlLUJlLUJlLUJhKUJhKT5lJT5lJT5lJTphIUJhIT5lHT5lHT5lHT5lHTplHTplHTZlFTZlFTZlFT5lF",
  ,
  "T5lFTphETphETZlDTZlDTZlDTJhCTJhCTplBTplBTplBTplBTplBTZhATZhATZhATJhATJhATJk/Tpk/Tpk/TZg+TZg+TZg+TZg+TZg+TZg+S5g8S5g8TZg8",
  ,
  "TZg8TZg8TJc7TJc7TJg6TJg6TJg6TZc5S5k5Spg4Spg4Spg4Spg4Spg4TJk3TJk3S5c3S5c3S5c3S5g2S5g2Spc1Spc1Spc1Spc1TJg0TJg0S5czS5czS5cz",
  ,
  "RrcNRrcNRrcNRrcORrcORrcPRrcQRrcQRrcQRrcQRrcRRrYRRrYSRrYSRrYSRrYSRrYTRrYTRrYTRrYURrYVRrYVRrUWRrUWRrUWRrUXRrUXRrUXRrUYRrUY",
  ,
  "RrUYR7UZR7UaR7UaR7UbR7UbR7UbR7UcR7UdR7UdR7UdR7UeR7UeR7UeR7UfR7QfR7QfR7QgR7QgR7QhR7QiR7QiR7QiR7QjR7QjR7QkR7QkR7QkR7MkR7Ml",
  ,
  "R7MlSLMmSLMmSLMmSLMnSLMoSLMoSLMoSLMpSLIpSLIqSLIqSLIqSLIqSLIrSLIraZt8aZt8aZt7aZt7aZt7Z5t5Z5t4Z5t4Zpp2Zpp2Zpp2Zpp2Zpp2ZZt0",
  ,
  "ZZt0ZZt0ZJpzZJpzY5tyY5tyY5tyYppwYppwYZtvYZtvYZtvYZtvYZtvYZttYZttYZttYJpsYJpsX5tqX5tqXpppXpppXpppXZtnXZtnXJplXJplXJpkXJpk",
  ,
  "XJpkXJpkW5tkW5tkW5tkW5tkWpphWpphWZtfWZtfWZtfWJpeWJpeV5teV5teV5teVppcVppbVppbVppbVppbVppbVppZVJpYVZtYVZtYVJpXVJpXVJpVVJpV",
  ,
  "UppUUppUUppUUZtTUZlRUZlRUZlRUZlRUZlRUJpQUJpQT5lPT5lPT5lPUJpOUJpOT5lNT5lNT5lNTplNTplNTplNTplNUJlNT5hMT5hMTplLTplLTplLUJhK",
  ,
  "UJhKT5lJT5lJT5lJTphITphIT5lHT5lHT5lHT5lHTplHTplHTZlFTZlFTZlFT5lFT5lFTphETphETZlDTZlDTZlDTJhCTJhCTplBTplBTplBTplBTplBTZhA",
  ,
  "TZhATZhATJhATJhATJk/TJk/TJk/TZg+TZg+TZg+TZg+TZg+TZg+S5g8S5g8TZg8TZg8TZg8TJc7TJc7TJg6TJg6TJg6S5c5S5k5Spg4Spg4Spg4Spg4Spg4",
  ,
  "TJk3TJk3S5c3S5c3S5c3S5g2S5g2Spc1Spc1Spc1Spc1SZg0TJg0S5czS5czS5czRrcNRrcNRrcNRrcORrcORrcPRrcQRrcQRrcQRrcQRrcRRrYRRrYSRrYS",
  ,
  "RrYSRrYSRrYTRrYTRrYTRrYURrYVRrYVRrUWRrUWRrUWRrUXRrUXRrUXRrUYRrUYRrUYR7UZR7UaR7UaR7UbR7UbR7UbR7UcR7UdR7UdR7UdR7UeR7UeR7Ue",
  ,
  "R7UfR7QfR7QfR7QgR7QgR7QhR7QiR7QiR7QiR7QjR7QjR7QkR7QkR7QkR7MkR7MlR7MlSLMmSLMmSLMmSLMnSLMoSLMoSLMoSLMpSLIpSLIqSLIqSLIqSLIq",
  ,
  "SLIrSLIrSLIsaZt8aZt8aZt8aZt8Z5t5Z5t4Z5t4Zpp3Zpp3Zpp2Zpp2Zpx3ZZt1ZZt1ZZt1ZZt0ZZt0Y5tzY5tzY5tzY5txY5txYZtwYZtwYZtwYZtvYZtv",
  ,
  "YZtvYZtvYZtvYJpsYJpsX5trX5trX5tqX5tqX5tqXZtnXZtnXZtnXZtnXJpkXJpkXJpkXJpkW5tkW5tkW5tkW5tkWpphWpphWZthWZthWZtfWZtfWZtfV5te",
  ,
  "V5teV5teV5tdV5tdV5tdV5tcV5tcVppaVppaVZtaVZtaVZtaVJpXVJpXVJpXVJpXUppUUppUUppUUZtTUZlSUZlRUZlRUZlRUZlRUJpQUJpQT5lPT5lPT5lP",
  ,
  "UJpOUJpOT5lNT5lNT5lNTplNTplNTplNTplNTppMTppMTppMTplLTplLTplLTppKTppKTJlJTplJTplJTplJTplJTZlHTZlHTZlHTZlHTplHTplHTZlFTppG",
  ,
  "TppGTZlFTZlFTJpETppETZlDTZlDTZlDTZlDTZlDTJlBTJlBTJlBTJlBTJlBS5lBS5lBS5lBTJhATJhATJk/TJk/TJk/S5o+S5o+Spk9Spk9Spk9Spk9TJk9",
  ,
  "TJk9S5k7S5k7S5k7S5k7S5k7S5g6S5g6S5g6S5k5S5k5S5k5S5k5S5k5S5k5S5k5Spk3Spk3SZk3SZk3SZk3S5g2S5g2Spk1Spk1Spk1Spk1SZg0SZg0SZkz",
  ,
  "SZkzSZkzR7cNR7cNR7cNR7cOR7cOR7cPR7cQR7cQR7cQR7cQR7cRR7YRR7YSR7YSR7YSR7YSR7YTR7YTR7YTR7YUR7YVR7YVR7UWR7UWR7UWR7UXR7UXR7UX",
  ,
  "R7UYR7UYR7UYR7UZR7UaR7UaSLUbSLUbSLUbSLUcSLUdSLUdSLUdSLUeSLUeSLUeSLUfSLQfSLQfSLQgSLQgSLQhSLQiSLQiSLQiSLQjSLQjSLQkSLQkSLQk",
  ,
  "SLMkSLMlSLMlSLMmSLMmSLMmSLMnSLMoSLMoSLMoSLMpSLIpSLIqSLIqSLIqSLIqSLIrSLIrSLIsSLItaZt8aZt8aZt8Z5t5Z5t4Z5t4Zpp3Zpp3Zpp2Zpp2",
  ,
  "Zpx3ZZt1ZZt1ZZt1ZZt0ZZt0Y5tzY5tzY5tzY5txY5txYZtwYZtwYZtwYZtvYZtvYZtvYZtvYZtvYJpsYJpsX5trX5trX5tqX5tqX5tqXZtnXZtnXZtnXZtn",
  ,
  "XJpkXJpkXJpkXJpkW5tkW5tkW5tkW5tkWpphWpphWZthWZthWZtfWZtfWZtfV5teV5teV5teV5tdV5tdV5tdV5tcV5tcVppaVppaVZtaVZtaVZtaVJpXVJpX",
  ,
  "VJpXVJpXUppUUppUUppUUZtTUZlSUZlRUZlRUZlRUZlRUJpQUJpQT5lPT5lPT5lPUJpOUJpOT5lNT5lNT5lNTplNTplNTplNTplNTppMTppMTppMTplLTplL",
  ,
  "TplLTppKTppKTJlJTplJTplJTplJTplJTZlHTZlHTZlHTZlHTplHTplHTZlFTppGTppGTZlFTZlFTJpETppETZlDTZlDTZlDTZlDTZlDTJlBTJlBTJlBTJlB",
  ,
  "TJlBS5lBS5lBS5lBTJhATJhATJk/TJk/TJk/S5o+S5o+Spk9Spk9Spk9Spk9TJk9TJk9S5k7S5k7S5k7S5k7S5k7S5g6S5g6S5g6S5k5S5k5S5k5S5k5S5k5",
  ,
  "S5k5S5k5Spk3Spk3SZk3SZk3SZk3S5g2S5g2Spk1Spk1Spk1Spk1SZg0SZg0SZkzSZkzSZkzSLcNSLcNSLcNSLcOSLcOSLcPSLcQSLcQSLcQSLcQSLcRSLYR",
  ,
  "SLYSSLYSSLYSSLYSSLYTSLYTSLYTSLYUSLYVSLYVSLUWSLUWSLUWSLUXSLUXSLUXSLUYSLUYSLUYSLUZSLUaSLUaSLUbSLUbSLUbSLUcSLUdSLUdSLUdSLUe",
  ,
  "SLUeSLUeSLUfSLQfSLQfSLQgSLQgSLQhSLQiSLQiSLQiSLQjSLQjSLQkSLQkSLQkSLMkSLMlSLMlSLMmSLMmSLMmSLMnSLMoSLMoSLMoSLMpSLIpSLIqSLIq",
  ,
  "SLIqSLIqSLIrSLIrSLIsSbItSbItaZt8Z5t5Z5t5Z5t5Z5t4Zpp3Zpp3Zpp3Zpp3ZZt1ZZt1ZZt1ZZt0ZZt0Y5tzY5tzY5tzY5txY5txYZtwYZtwYZtwYZtw",
  ,
  "YZtwYZtvYZtvYJpsYJpsYJpsX5tsX5trX5tqX5tqX5tqXZtpXZtpXZtnXJpmXJpmXJpmXJpmXJpmW5tkW5tkW5tkW5tkWppjWppjWZthWZthWZthWJpgWZtg",
  ,
  "V5teV5teV5teV5tdV5tdV5tdV5tdVppcVppcVppcVZtaVJpZVJpZVJpZVJpXVJpXUppWUppWUZtTUZtTUZtTUZlSUZlSUZlSUZlSUZlSUJpSUJpQT5lPT5lP",
  ,
  "T5lPTppOTppOT5lNT5lNT5lNTplNTplNTplNTZhMTZhMTppMTZlLTZlLTppKTppKTppKTJlJTJlJTplJTplJTplJTZlHTZlHTZlHTZlHTZlHTZlHTZlHS5lF",
  ,
  "TZlFTZlFTZlFTZlFTJpETJpES5lDTZlDTZlDTZlDTJlBTJlBTJlBTJlBTJlBS5lBS5lBSphASphASphASpk/TJk/S5o+S5o+S5o+Spk9Spk9Spk9Spk9Spk9",
  ,
  "Spk9Spk9S5k7S5k7S5k7S5k7SZg6SZg6SZk5SZk5SZk5SJg4SJg4S5k5S5k5Spk3Spk3Spk3SZk3SZk3SJg2SJg2SJg2SJk1Spk1SZg0SZg0SZg0SZg0SZkz",
  ,
  "SZkzSZkzSZkzSZkzSLYOSLYOSLYOSLYPSLYPSLYQSLYRSLYRSLYRSLYRSLYSSLUSSLUSSLUSSLUTSLUTSLUUSLUUSLUUSLUVSLUWSLUWSLUXSLUXSLUXSLUX",
  ,
  "SLUYSLUYSLUZSLUZSLUZSLUaSLUaSLUbSLUcSLUcSLQcSLQdSLQdSLQeSLQeSLQeSLQeSLQfSbQfSbQgSbQgSbQhSbMhSbMiSbMiSbMiSbMjSbMkSbMkSbMk",
  ,
  "SbMkSbMkSbMlSbMmSbImSbInSbInSbInSbIoSbIoSbIpSbIpSbIqSbIqSbIqSbEqSbErSbErSbEsSbEsSbEtSbEtSbEtSbEuZ5t5Z5t5Z5t5Z5t5Zpp3Zpp3",
  ,
  "Zpp3Zpp3ZZt1ZZt1ZZt1ZZt0ZZt0Y5tzY5tzY5tzY5tzY5txYZtwYZtwYZtwYZtwYZtwYZtvYZtvYJptYJptYJptX5tsX5trX5trX5trX5trXZtpXZtpXZtp",
  ,
  "XJpmXJpmXJpmXJpmXJpmW5tkW5tkW5tkW5tkWppjWppjWZthWZthWZthWJpgWZtgV5tfV5tfV5tfV5tdV5tdV5tdV5tdVppcVppcVppcVZtaVJpZVJpZVJpZ",
  ,
  "VJpZVJpXUppWUppWUZtVUZtVUZtTUZlSUZlSUZlSUZlSUZlSUJpSUJpST5lPT5lPT5lPTppOTppOTZlNTZlNTZlNTplNTplNTplNTZhMTZhMTppMTZlLTZlL",
  ,
  "TJpKTJpKTJpKTJlJTJlJTJlJTJlJTJlJS5lHTZlHTZlHTZlHTZlHTZlHTZlHS5lFS5lFS5lFS5lFS5lFTJpETJpES5lDS5lDS5lDS5lDTJlBTJlBTJlBTJlB",
  ,
  "TJlBS5lBS5lBSphASphASphASpk/Spk/SZo+SZo+SZo+SJk9Spk9Spk9Spk9Spk9Spk9Spk9SZk7SZk7S5k7S5k7SZg6SZg6SZk5SZk5SZk5SJg4SJg4SZk5",
  ,
  "SZk5R5k3R5k3R5k3SZk3SZk3SJg2SJg2SJg2SJk1SJk1R5g0R5g0R5g0R5g0SZkzSZkzSZkzSZkzSZkzSbYOSbYOSbYOSbYPSbYPSbYQSbYRSbYRSbYRSbYR",
  ,
  "SbYSSbUSSbUSSbUSSbUTSbUTSbUUSbUUSbUUSbUVSbUWSbUWSbUXSbUXSbUXSbUXSbUYSbUYSbUZSbUZSbUZSbUaSbUaSbUbSbUcSbUcSbQcSbQdSbQdSbQe",
  ,
  "SbQeSbQeSbQeSbQfSbQfSbQgSbQgSbQhSbMhSbMiSbMiSbMiSrMjSrMkSrMkSrMkSrMkSrMkSrMlSrMmSrImSrInSrInSrInSrIoSrIoSrIpSrIpSrIqSrIq",
  ,
  "SrIqSrEqSrErSrErSrEsSrEsSrEtSrEtSrEtSrEuSrEvZ5t7Z5t5Z5t5Zpp3Zpp3Zpp3Zpp3ZZt1ZZt1ZZt1ZZt1ZZt1Y5tzY5tzY5tzY5tzY5tzYZtwYZtw",
  ,
  "YZtwYZtwYZtwYZtvYZtvYJptYJptYJptX5ttX5ttX5trX5trX5trXZtpXZtpXZtpXJpmXJpmXJpmXJpmXJpmW5tkW5tkW5tkW5tkWppjWppjWZtiWZthWZth",
  ,
  "WJpgWZtgV5tfV5tfV5tfV5tdV5tdV5tdV5tdVppcVppcVppcVZtaVJpZVJpZVJpZVJpZVJpZUppXUppXUZtVUZtVUZtVUZlUUZlUUZlUUZlUUZlSUJpSUJpS",
  ,
  "T5lQT5lPT5lPTppOTppOTZlNTZlNTZlNTplNTplNTplNTZhMTZhMTppMTZlLTZlLTJpKTJpKTJpKTJlJTJlJTJlJTJlJTJlJS5lHS5lHS5lHS5lHTZlHTZlH",
  ,
  "TZlHS5lFS5lFS5lFS5lFS5lFTJpETJpES5lDS5lDS5lDS5lDSplBSplBSplBSplBSplBS5lBS5lBSphASphASphASpk/Spk/SZo+SZo+SZo+SJk9SJk9SJk9",
  ,
  "SJk9SJk9Spk9Spk9SZk7SZk7SJk7SJk7R5g6SZg6SZk5SZk5SZk5SJg4SJg4SZk5SZk5R5k3R5k3R5k3SZk3SZk3SJg2SJg2SJg2SJk1SJk1R5g0R5g0R5g0",
  ,
  "R5g0RpkzSZkzSZkzSZkzSZkzSbYOSbYOSbYOSbYPSbYPSbYQSbYRSbYRSbYRSbYRSbYSSbUSSbUSSbUSSbUTSbUTSbUUSbUUSbUUSbUVSbUWSbUWSbUXSbUX",
  ,
  "SbUXSbUXSbUYSbUYSbUZSbUZSbUZSbUaSbUaSbUbSbUcSbUcSbQcSbQdSbQdSbQeSbQeSbQeSbQeSbQfSbQfSbQgSbQgSbQhSbMhSbMiSbMiSbMiSrMjSrMk",
  ,
  "SrMkSrMkSrMkSrMkSrMlSrMmSrImSrInSrInSrInSrIoSrIoSrIpSrIpSrIqSrIqSrIqSrEqSrErSrErSrEsSrEsSrEtSrEtSrEtSrEuSrEvSrEvZ5t5Z5t5",
  ,
  "Zpp3Zpp3Zpp3Zpp3ZZt3ZZt3ZZt3ZZt1ZZt1Y5t0Y5t0Y5t0Y5tzY5tzYZtwYZtwYZtwYZtwYZtwYZtvYZtvYJptYJptYJptX5ttX5ttX5trX5trX5trXZtq",
  ,
  "XZtpXZtpXJpnXJpnXJpnXJpmXJpmW5tlW5tlW5tlW5tlWpplWppjWZtiWZtiWZtiWJpiWZtgV5tfV5tfV5tfV5tfV5tfV5tdV5tdVppcVppcVppcVZtcVJpZ",
  ,
  "VJpZVJpZVJpZVJpZUppXUppXUZtVUZtVUZtVUZlUUZlUUZlUUZlUUZlUUJpSUJpST5lQT5lQT5lQTppQTppQTZlNTZlNTZlNTZlNTZlNTZlNTZhMTZhMTppM",
  ,
  "TZlLTZlLTJpKTJpKTJpKTJlJTJlJTJlJTJlJTJlJS5lHS5lHS5lHS5lHTZlHTZlHTZlHS5lFS5lFS5lFS5lFS5lFSppESppESZlDS5lDS5lDS5lDSplBSplB",
  ,
  "SplBSplBSplBSZlBSZlBSphASphASphASpk/Spk/SZo+SZo+SZo+SJk9SJk9SJk9SJk9SJk9Spk9Spk9SZk7SZk7SJk7SJk7R5g6R5g6R5k5R5k5R5k5SJg4",
  ,
  "SJg4SZk5SZk5R5k3R5k3R5k3R5k3R5k3Rpg2Rpg2Rpg2SJk1SJk1R5g0R5g0R5g0R5g0RpkzRpkzRpkzRpkzRpkzSrYOSrYOSrYOSrYPSrYPSrYQSrYRSrYR",
  ,
  "SrYRSrYRSrYSSrUSSrUSSrUSSrUTSrUTSrUUSrUUSrUUSrUVSrUWSrUWSrUXSrUXSrUXSrUXSrUYSrUYSrUZSrUZSrUZSrUaSrUaSrUbSrUcSrUcSrQcSrQd",
  ,
  "SrQdSrQeSrQeSrQeSrQeSrQfSrQfSrQgSrQgSrQhSrMhSrMiSrMiSrMiSrMjSrMkSrMkSrMkSrMkSrMkSrMlSrMmSrImS7InS7InS7InS7IoS7IoS7IpS7Ip",
  ,
  "S7IqS7IqS7IqS7EqS7ErS7ErS7EsS7EsS7EtS7EtS7EtS7EuS7EvS7EvS7EvZ5t5Zpp3Zpp3Zpp3Zpp3ZZt3ZZt3ZZt3ZZt1ZZt1Y5t0Y5t0Y5t0Y5tzY5tz",
  ,
  "YZtwYZtwYZtwYZtwYZtwYZtvYZtvYJptYJptYJptX5ttX5ttX5trX5trX5trXZtqXZtpXZtpXJpnXJpnXJpnXJpmXJpmW5tlW5tlW5tlW5tlWpplWppjWZti",
  ,
  "WZtiWZtiWJpiWZtgV5tfV5tfV5tfV5tfV5tfV5tdV5tdVppcVppcVppcVZtcVJpZVJpZVJpZVJpZVJpZUppXUppXUZtVUZtVUZtVUZlUUZlUUZlUUZlUUZlU",
  ,
  "UJpSUJpST5lQT5lQT5lQTppQTppQTZlNTZlNTZlNTZlNTZlNTZlNTZhMTZhMTppMTZlLTZlLTJpKTJpKTJpKTJlJTJlJTJlJTJlJTJlJS5lHS5lHS5lHS5lH",
  ,
  "TZlHTZlHTZlHS5lFS5lFS5lFS5lFS5lFSppESppESZlDS5lDS5lDS5lDSplBSplBSplBSplBSplBSZlBSZlBSphASphASphASpk/Spk/SZo+SZo+SZo+SJk9",
  ,
  "SJk9SJk9SJk9SJk9Spk9Spk9SZk7SZk7SJk7SJk7R5g6R5g6R5k5R5k5R5k5SJg4SJg4SZk5SZk5R5k3R5k3R5k3R5k3R5k3Rpg2Rpg2Rpg2SJk1SJk1R5g0",
  ,
  "R5g0R5g0R5g0RpkzRpkzRpkzRpkzRpkzS7YOS7YOS7YOS7YPS7YPS7YQS7YRS7YRS7YRS7YRS7YSS7USS7USS7USS7UTS7UTS7UUS7UUS7UUS7UVS7UWS7UW",
  ,
  "S7UXS7UXS7UXS7UXS7UYS7UYS7UZS7UZS7UZS7UaS7UaS7UbS7UcS7UcS7QcS7QdS7QdS7QeS7QeS7QeS7QeS7QfS7QfS7QgS7QgS7QhS7MhS7MiS7MiS7Mi",
  ,
  "S7MjS7MkS7MkS7MkS7MkS7MkS7MlS7MmS7ImS7InS7InS7InS7IoS7IoS7IpS7IpS7IqS7IqS7IqS7EqS7ErS7ErS7EsS7EsS7EtTLEtTLEtTLEuTLEvTLEv",
  ,
  "TLEvTLAvZpp3Zpp3Zpp3ZZt3ZZt3ZZt3ZZt3ZZt1Y5t0Y5t0Y5tzY5tzY5tzYZtwYZtwYZtwYZtwYZtwYZtvYZtvYJptYJptYJptX5ttX5ttX5trX5trXZtq",
  ,
  "XZtqXZtqXZtpXJpnXJpnXJpnXJpnXJpmW5tlW5tlWpplWpplWpplWpplWZtiWZtiWJpiWJpiWJpiV5tfV5tfV5tfV5tfV5tfV5tfVppcVppcVZtcVZtcVZtc",
  ,
  "VJpZVJpZVJpZVJpZVJpZUppXUppXUZtVUZtVUZtVUZlUUZlUUZlUUZlUUZlUUJpSUJpST5lQTppQTppQTppQTZlNTZlNTZlNTZlNTZlNTZlNTZlNTJhMTZhM",
  ,
  "TZhMTZlLTZlLTJpKTJpKTJlJTJlJTJlJTJlJTJlJS5lHS5lHS5lHS5lHS5lHS5lHS5lFS5lFS5lFS5lFS5lFSppESppESppESZlDSZlDSZlDS5lDS5lDSplB",
  ,
  "SplBSplBSplBSplBSZlBSZlBSphASpk/Spk/Spk/SJg+SJg+SJk9SJk9SJk9SJk9SJk9Spk9Spk9Spk9SZk7SZk7SJk7SJk7R5g6R5g6R5g6R5k5R5k5SJg4",
  ,
  "SJg4SJg4SJg4R5k3R5k3R5k3R5k3R5k3Rpg2Rpg2Rpk1Rpk1Rpk1R5g0R5g0RpkzRpkzRpkzRpkzRpkzRpkzRZgyRZgyRZgyS7YPS7YPS7YPS7YQS7YQS7YR",
  ,
  "S7YSS7YSS7YSS7YSS7YSS7USS7UTS7UTS7UUS7UUS7UVS7UVS7UVS7UWS7UXS7UXS7UXS7UXS7UXS7UYS7UYS7UZS7UaS7UaS7UaS7UbS7UbS7UcS7UdS7Ud",
  ,
  "S7QdS7QeS7QeS7QeS7QeS7QfS7QfS7QgS7QgS7QhS7QhS7QhS7MiS7MjS7MjS7MjS7MkS7MkS7MkS7MlS7MlS7MlS7MmS7MmS7InS7IoS7IoS7IoS7IpS7Ip",
  ,
  "S7IqS7IqS7IqS7IqS7IrS7ErS7EsS7EsS7EsS7EtS7EuTLEuTLEuTLEvTLEvTLEvTLEwTLAwTLAwZpp4Zpp4ZZt3ZZt3ZZt3ZZt3ZZt3Y5t0Y5t0Y5tzY5tz",
  ,
  "Y5tzYZtyYZtyYZtwYZtwYZtwYZtwYZtwYJptYJptYJptX5ttX5ttX5trX5trXZtqXZtqXZtqXZtqXJpnXJpnXJpnXJpnXJpnW5tlW5tlWpplWpplWpplWppl",
  ,
  "WZtiWZtiWJpiWJpiWJpiV5tfV5tfV5tfV5tfV5tfV5tfVppcVppcVZtcVZtcVZtcVJpZVJpZVJpZVJpZVJpZUppXUppXUZtVUZtVUZtVUZlUUZlUUZlUUZlU",
  ,
  "UZlUUJpTUJpST5lQTppQTppQTppQTZlPTZlNTZlNTZlNTZlNTZlNTZlNTJhMTJhMTJhMS5lLS5lLTJpKTJpKS5lJS5lJS5lJS5lJTJlJS5lHS5lHS5lHS5lH",
  ,
  "S5lHS5lHSZlFSZlFSZlFSZlFSZlFSppESppESppESZlDSZlDSZlDSZlDSZlDSplBSplBSplBSplBSplBSZlBSZlBSJhASJk/SJk/Spk/SJg+SJg+SJk9SJk9",
  ,
  "SJk9SJk9SJk9SJk9SJk9SJk9SZk7SZk7SJk7SJk7R5g6R5g6R5g6R5k5R5k5Rpg4Rpg4Rpg4SJg4RZk3RZk3R5k3R5k3R5k3Rpg2Rpg2Rpk1Rpk1Rpk1R5g0",
  ,
  "R5g0RpkzRpkzRpkzRpkzRpkzRpkzRZgyRZgyRZgyTLYPTLYPTLYPTLYQTLYQTLYRTLYSTLYSTLYSTLYSTLYSTLUSTLUTTLUTTLUUTLUUTLUVTLUVTLUVTLUW",
  ,
  "TLUXTLUXTLUXTLUXTLUXTLUYTLUYTLUZTLUaTLUaTLUaTLUbTLUbTLUcTLUdTLUdTLQdTLQeTLQeTLQeTLQeTLQfTLQfTLQgTLQgTLQhTLQhTLQhTLMiTLMj",
  ,
  "TLMjTLMjTLMkTLMkTLMkTLMlTLMlTLMlTLMmTLMmTLInTLIoTLIoTLIoTLIpTLIpTLIqTLIqTLIqTLIqTLIrTLErTLEsTLEsTLEsTLEtTLEuTLEuTLEuTLEv",
  ,
  "TLEvTLEvTLEwTLAwTLAwTLAxZpx5ZZt4ZZt4ZZt3ZZt3ZZt3Y5t0Y5t0Y5t0Y5t0Y5t0YZtyYZtyYpxyYpxyYpxyYJxwYJxwYJxwYJxwYJxwX5ttX5ttX5tr",
  ,
  "X5trXZtqXZtqXZtqXZtqXJpnXJpnXJpnXJpnXJxoW5tnW5tnWpxlWpxlWpxlWpxlWZtkWZtiWZtiWZtiWZtiV5thV5tfV5tfV5tfV5tfV5tfVppeVppcVZtc",
  ,
  "VZtcVZtcVJpbVJpbVJpZVJpZVJpZUppXUppXUZtXUZtVUZtVUZlUUZlUUZlUUZlUUZlUUJpTUJpTT5tTTppRTppRTppRTppQTppQTJpOTJpOTJpOTJpMTJpM",
  ,
  "TJpMTJpMTJpMS5lLS5lLTJpKTJpKS5lJS5lJS5tJSppISppISppISppISppISppIS5lHS5lHSppGSppGSppGSZlFSZlFSJpESJpESJpESZlDSZlDSZpCSZpC",
  ,
  "SZpCSJpCSJpCSJpCSJpCSJpCSZlBSZlBSZpASJk/SJk/SJk/R5o+R5o+SJk9SJk9SJk9SJk9SZo+SJk9SJk9SJk9R5o8R5o8Rpk7Rpk7SJo6SJo6SJo6R5k5",
  ,
  "R5k5Rpk5Rpk5Rpk5Rpk5RZk3RZk3RZk3RZk3RZk3R5o2R5o2RZk1RZk1RZk1RZk1RZk1RJkzRJkzRJkzRJkzRJkzRJkzRpkzRpkzRpkzTLYPTLYPTLYPTLYQ",
  ,
  "TLYQTLYRTLYSTLYSTLYSTLYSTLYSTLUSTLUTTLUTTLUUTLUUTLUVTLUVTLUVTLUWTLUXTLUXTLUXTLUXTLUXTLUYTLUYTLUZTLUaTLUaTLUaTLUbTLUbTLUc",
  ,
  "TLUdTLUdTLQdTLQeTLQeTLQeTLQeTLQfTLQfTLQgTLQgTLQhTLQhTLQhTLMiTLMjTLMjTLMjTLMkTLMkTLMkTLMlTLMlTLMlTLMmTLMmTLInTLIoTLIoTLIo",
  ,
  "TLIpTLIpTLIqTLIqTLIqTLIqTLIrTLErTLEsTLEsTLEsTLEtTLEuTLEuTLEuTLEvTLEvTLEvTLEwTLAwTLAwTLAxTLAxZZt4ZZt4ZZt3ZZt3ZZt3Y5t1Y5t0",
  ,
  "Y5t0Y5t0Y5t0YZtyYZtyYpxyYpxyYpxyYJxwYJxwYJxwYJxwYJxwX5ttX5ttX5ttX5ttXZtqXZtqXZtqXZtqXJpnXJpnXJpnXJpnXJxoW5tnW5tnWpxnWpxn",
  ,
  "WpxnWpxlWZtkWZtkWZtkWZtkWZtkV5thV5thV5tgV5tgV5tgV5tfVppeVppeVZtdVZtdVZtdVJpbVJpbVJpaVJpaVJpaUppXUppXUZtXUZtXUZtXUZlUUZlU",
  ,
  "UZlUUZlUUZlUUJpTUJpTT5tTTppRTppRTppRTppQTppQTJpOTJpOTJpOTJpOTJpOTJpMTJpMTJpMS5lLS5lLSppKSppKS5lJS5lJS5tJSppISppISppISppI",
  ,
  "SppISppIS5lHS5lHSppGSppGSppGSZlFSZlFSJpESJpESJpESZlDSZlDSZpCSZpCSZpCSJpCSJpCSJpCSJpCSJpCR5lBR5lBSZpASJk/SJk/SJk/R5o+R5o+",
  ,
  "SJk9SJk9SJk9SJk9R5o+Rpk9SJk9SJk9R5o8R5o8Rpk7Rpk7RZo6RZo6RZo6R5k5R5k5Rpk5Rpk5Rpk5Rpk5RZk3RZk3RZk3RZk3RZk3RJo2RJo2Q5k1Q5k1",
  ,
  "Q5k1RZk1RZk1RJkzRJkzRJkzRJkzRJkzRJkzRJkzRJkzRJkzTbYPTbYPTbYPTbYQTbYQTbYRTbYSTbYSTbYSTbYSTbYSTbUSTbUTTbUTTbUUTbUUTbUVTbUV",
  ,
  "TbUVTbUWTbUXTbUXTbUXTbUXTbUXTbUYTbUYTbUZTbUaTbUaTbUaTbUbTbUbTbUcTbUdTbUdTbQdTbQeTbQeTbQeTbQeTbQfTbQfTbQgTbQgTbQhTbQhTbQh",
  ,
  "TbMiTbMjTbMjTbMjTbMkTbMkTbMkTbMlTbMlTbMlTbMmTbMmTbInTbIoTbIoTbIoTbIpTbIpTbIqTbIqTbIqTbIqTbIrTbErTbEsTbEsTbEsTbEtTbEuTbEu",
  ,
  "TbEuTbEvTbEvTbEvTbEwTbAwTbAwTbAxTbAxTbAyZZt4ZZt3ZZt3ZZt3Y5t1Y5t0Y5t0Y5t0Y5t0YZtyYZtyYpxyYpxyYpxyYJxwYJxwYJxwYJxwYJxwX5tt",
  ,
  "X5ttX5ttX5ttXZtqXZtqXZtqXZtqXJpnXJpnXJpnXJpnXJxoW5tnW5tnWpxnWpxnWpxnWpxlWZtkWZtkWZtkWZtkWZtkV5thV5thV5tgV5tgV5tgV5tfVppe",
  ,
  "VppeVZtdVZtdVZtdVJpbVJpbVJpaVJpaVJpaUppXUppXUZtXUZtXUZtXUZlUUZlUUZlUUZlUUZlUUJpTUJpTT5tTTppRTppRTppRTppQTppQTJpOTJpOTJpO",
  ,
  "TJpOTJpOTJpMTJpMTJpMS5lLS5lLSppKSppKS5lJS5lJS5tJSppISppISppISppISppISppIS5lHS5lHSppGSppGSppGSZlFSZlFSJpESJpESJpESZlDSZlD",
  ,
  "SZpCSZpCSZpCSJpCSJpCSJpCSJpCSJpCR5lBR5lBSZpASJk/SJk/SJk/R5o+R5o+SJk9SJk9SJk9SJk9R5o+Rpk9SJk9SJk9R5o8R5o8Rpk7Rpk7RZo6RZo6",
  ,
  "RZo6R5k5R5k5Rpk5Rpk5Rpk5Rpk5RZk3RZk3RZk3RZk3RZk3RJo2RJo2Q5k1Q5k1Q5k1RZk1RZk1RJkzRJkzRJkzRJkzRJkzRJkzRJkzRJkzRJkzTrUPTrUP",
  ,
  "TrUPTrUQTrUQTrURTrUSTrUSTrUSTrUSTrUSTrUSTrUTTrUTTrUUTrUUTrUVTrUVTrUVTrUWTrUXTrUXTrUXTrUXTrUXTrQYTrQYTrQZTrQaTrQaTrQaTrQb",
  ,
  "TrQbTrQcTrQdTrQdTrQdTrMeTrMeTrMeTrMeTrMfTrMfTrMgTrMgTrMhTrMhTrMhTrMiTrIjTrIjTrIjTrIkTrIkTrIkTrIlTrIlTrIlTrImTrImTrInTrIo",
  ,
  "TrIoTrEoTrEpTrEpTrEqTrEqTrEqTrEqTrErTrErTrEsTrEsTrEsTrAtTrAuTrAuTrAuTrAvTrAvTrAvTrAwTrAwTrAwTrAxTrAxTq8yTq8yZZt3ZZt3Y5t1",
  ,
  "Y5t1Y5t0Y5t0Y5t0YZtyYZtyYZtyYpxyYJxxYJxxYJxwYJxwYJxwX5tuX5tuX5tuX5ttX5ttXZtqXZtqXZtqXZtqXJpnXJpnXJpnXJpnXJpnW5tnW5tnWpxn",
  ,
  "WpxnWpxnWpxnWZtkWZtkWZtkWZtkWZtkV5thV5thV5tgV5tgV5tgV5tgVppeVppeVZtdVZtdVZtdVJpbVJpbVJpaVJpaVJpaUppXUppXUZtXUZtXUZlWUZlW",
  ,
  "UZlUUZlUUJpTUJpTUJpTT5lST5lSTppRTppRTppQTppQTppQTJpOTJpOTJpOTJpOTJpOTJpOTJpMS5lLS5lLS5lLSppKSZlJS5lJS5lJS5lJSppISppISppI",
  ,
  "SppISppISppISZlHSZlHSJpGSppGSppGSZlFSZlFSJpESJpESJpESZlDSZlDSZlDSJpCSJpCSJpCSJpCSJpCR5lBR5lBR5lBRppARppASJk/SJk/SJk/R5o+",
  ,
  "R5o+Rpk9Rpk9Rpk9Rpk9Rpk9Rpk9R5o8R5o8R5o8Rpk7Rpk7RZo6RZo6RJk5RJk5RJk5RJk5RJk5Rpk5Rpk5Rpk5RZk3RZk3RZk3RJo2RJo2RJo2Q5k1Q5k1",
  ,
  "Q5k1Q5k1Q5k1RJkzRJkzRJkzRJkzRJkzRJkzRJkzRJkzQ5gyQ5gyQ5gyTrUQTrUQTrUQTrURTrURTrUSTrUSTrUSTrUSTrUSTrUTTrUTTrUUTrUUTrUVTrUV",
  ,
  "TrUWTrUWTrUWTrUXTrUXTrUXTrUYTrUYTrUYTrQZTrQZTrQaTrQbTrQbTrQbTrQcTrQcTrQdTrQdTrQdTrQeTrMeTrMeTrMfTrMfTrMfTrMgTrMhTrMhTrMi",
  ,
  "TrMiTrMiTrMjTrIjTrIkTrIkTrIkTrIkTrIlTrIlTrIlTrImTrInTrInTrIoTrIoTrIoTrEpTrEpTrEqTrEqTrEqTrEqTrErTrErTrEsTrEtTrEtTrEtTrAu",
  ,
  "TrAuTrAvTrAvTrAvTrAvTrAwTrAwTrAxTrAxTrAxTrAyTq8zTq8zTq8zZZt4Y5t1Y5t1Y5t0Y5t0Y5t0YZtzYZtzYZtzYpxyYJxxYJxxYJxxYJxxYJxxX5tu",
  ,
  "X5tuX5tuX5ttX5ttXZtsXZtqXZtqXZtqXJppXJppXJppXJppXJpnW5tnW5tnWpxnWpxnWpxnWpxnWZtkWZtkWZtkWZtkWZtkV5tiV5thV5tgV5tgV5tgV5tg",
  ,
  "VppfVppfVZtdVZtdVZtdVJpcVJpcVJpaVJpaVJpaUppZUppZUZtXUZtXUZlWUZlWUZlWUZlWUJpVUJpVUJpVT5lST5lSTppRTppRTppRTppRTppQTJpOTJpO",
  ,
  "TJpOTJpOTJpOTJpOTJpOS5lNS5lNS5lNSppKSZlJSZlJSZlJSZlJSJpISJpISppISppISppISppISZlHSZlHSJpGSJpGSJpGSZlFSZlFSJpESJpESJpER5lD",
  ,
  "R5lDR5lDRppCRppCRppCSJpCSJpCR5lBR5lBR5lBRppARppARZk/RZk/RZk/RZo+RZo+Rpk9Rpk9Rpk9Rpk9Rpk9Rpk9RZo8RZo8RZo8RJk7RJk7RZo6RZo6",
  ,
  "RJk5RJk5RJk5RJk5RJk5RJk5RJk5RJk5RZk3RZk3RZk3RJo2RJo2RJo2Q5k1Q5k1Q5k1Q5k1Q5k1RJkzRJkzRJkzRJkzRJkzRJkzRJkzRJkzQ5gyQ5gyQ5gy",
  ,
  "TrUQTrUQTrUQTrURTrURTrUSTrUSTrUSTrUSTrUSTrUTTrUTTrUUTrUUTrUVTrUVTrUWTrUWTrUWTrUXTrUXTrUXTrUYTrUYTrUYTrQZTrQZTrQaTrQbTrQb",
  ,
  "TrQbTrQcTrQcTrQdTrQdTrQdTrQeTrMeTrMeTrMfTrMfTrMfTrMgTrMhTrMhTrMiTrMiTrMiTrMjTrIjTrIkTrIkTrIkTrIkTrIlTrIlTrIlTrImTrInTrIn",
  ,
  "TrIoTrIoTrIoTrEpTrEpTrEqTrEqTrEqTrEqTrErTrErTrEsTrEtTrEtTrEtTrAuTrAuTrAvTrAvTrAvTrAvTrAwTrAwTrAxTrAxTrAxTrAyTq8zTq8zTq8z",
  ,
  "Tq80Y5t1Y5t1Y5t1Y5t1Y5t1YZtzYZtzYZtzYpx0YJxxYJxxYJxxYJxxYJxxX5tuX5tuX5tuX5tuX5ttXZtsXZtqXZtqXZtqXJppXJppXJppXJppXJppW5tn",
  ,
  "W5tnWpxnWpxnWpxnWpxnWZtkWZtkWZtkWZtkWZtkV5tiV5tiV5tgV5tgV5tgV5tgVppfVppfVZtdVZtdVZtdVJpcVJpcVJpaVJpaVJpaUppZUppZUZtXUZtX",
  ,
  "UZlWUZlWUZlWUZlWUJpVUJpVUJpVT5lST5lSTppRTppRTppRTppRTppRTJpOTJpOTJpOTJpOTJpOTJpOTJpOS5lNS5lNS5lNSppKSZlJSZlJSZlJSZlJSJpI",
  ,
  "SJpISJpISJpISJpISJpISZlHSZlHSJpGSJpGSJpGR5lFR5lFSJpESJpESJpER5lDR5lDR5lDRppCRppCRppCRppCRppCR5lBR5lBR5lBRppARppARZk/RZk/",
  ,
  "RZk/RZo+RZo+Rpk9Rpk9Rpk9Rpk9Rpk9Rpk9RZo8RZo8RZo8RJk7RJk7RZo6RZo6RJk5RJk5RJk5RJk5RJk5RJk5RJk5RJk5Q5k3Q5k3Q5k3RJo2RJo2RJo2",
  ,
  "Q5k1Q5k1Q5k1Q5k1Q5k1QpkzQpkzQpkzQpkzQpkzQpkzRJkzRJkzQ5gyQ5gyQ5gyTrUQTrUQTrUQTrURTrURTrUSTrUSTrUSTrUSTrUSTrUTTrUTTrUUTrUU",
  ,
  "TrUVTrUVTrUWTrUWTrUWTrUXTrUXTrUXTrUYTrUYTrUYTrQZTrQZTrQaTrQbTrQbTrQbTrQcTrQcTrQdTrQdTrQdTrQeTrMeTrMeTrMfTrMfTrMfTrMgTrMh",
  ,
  "TrMhTrMiTrMiTrMiTrMjTrIjTrIkTrIkTrIkTrIkTrIlTrIlTrIlTrImTrInTrInTrIoTrIoTrIoTrEpTrEpTrEqTrEqTrEqTrEqTrErTrErTrEsTrEtTrEt",
  ,
  "TrEtTrAuTrAuTrAvTrAvTrAvTrAvTrAwTrAwTrAxTrAxTrAxTrAyTq8zTq8zTq8zTq80Tq80Y5t3Y5t1Y5t1Y5t1YZtzYZtzYZtzYpx0YJxxYJxxYJxxYJxx",
  ,
  "YJxxX5tuX5tuX5tuX5tuX5tuXZtsXZtsXZtsXZtqXJppXJppXJppXJppXJppW5tnW5tnWpxnWpxnWpxnWpxnWZtlWZtkWZtkWZtkWZtkV5tiV5tiV5tgV5tg",
  ,
  "V5tgV5tgVppfVppfVZtfVZtdVZtdVJpcVJpcVJpcVJpcVJpcUppZUppZUZtYUZtYUZlYUZlYUZlWUZlWUJpVUJpVUJpVT5lUT5lUTppRTppRTppRTppRTppR",
  ,
  "TJpQTJpOTJpOTJpOTJpOTJpOTJpOS5lNS5lNS5lNSppKSZlJSZlJSZlJSZlJSJpISJpISJpISJpISJpISJpISZlHSZlHSJpGSJpGSJpGR5lFR5lFRppERppE",
  ,
  "RppER5lDR5lDR5lDRppCRppCRppCRppCRppCRZlBR5lBR5lBRppARppARZk/RZk/RZk/RZo+RZo+Rpk9Rpk9Rpk9Rpk9Rpk9Rpk9RZo8RZo8RZo8RJk7RJk7",
  ,
  "Q5o6Q5o6Qpk5Qpk5Qpk5RJk5RJk5RJk5RJk5RJk5Q5k3Q5k3Q5k3Qpo2Qpo2Qpo2QZk1QZk1Q5k1Q5k1Q5k1QpkzQpkzQpkzQpkzQpkzQpkzQZkzQZkzQJgy",
  ,
  "QJgyQJgyT7UQT7UQT7UQT7URT7URT7UST7UST7UST7UST7UST7UTT7UTT7UUT7UUT7UVT7UVT7UWT7UWT7UWT7UXT7UXT7UXT7UYT7UYT7UYT7QZT7QZT7Qa",
  ,
  "T7QbT7QbT7QbT7QcT7QcT7QdT7QdT7QdT7QeT7MeT7MeT7MfT7MfT7MfT7MgT7MhT7MhT7MiT7MiT7MiT7MjT7IjT7IkT7IkT7IkT7IkT7IlT7IlT7IlT7Im",
  ,
  "T7InT7InT7IoT7IoT7IoT7EpT7EpT7EqT7EqT7EqT7EqT7ErT7ErT7EsT7EtT7EtT7EtT7AuT7AuT7AvT7AvT7AvT7AvT7AwT7AwT7AxT7AxT7AxT7AyT68z",
  ,
  "T68zT68zT680T680T681Y5t1Y5t1Y5t1YZtzYZtzYZtzYpx0YJxxYJxxYJxxYJxxYJxxX5tuX5tuX5tuX5tuX5tuXZtsXZtsXZtsXZtqXJppXJppXJppXJpp",
  ,
  "XJppW5tnW5tnWpxnWpxnWpxnWpxnWZtlWZtkWZtkWZtkWZtkV5tiV5tiV5tgV5tgV5tgV5tgVppfVppfVZtfVZtdVZtdVJpcVJpcVJpcVJpcVJpcUppZUppZ",
  ,
  "UZtYUZtYUZlYUZlYUZlWUZlWUJpVUJpVUJpVT5lUT5lUTppRTppRTppRTppRTppRTJpQTJpOTJpOTJpOTJpOTJpOTJpOS5lNS5lNS5lNSppKSZlJSZlJSZlJ",
  ,
  "SZlJSJpISJpISJpISJpISJpISJpISZlHSZlHSJpGSJpGSJpGR5lFR5lFRppERppERppER5lDR5lDR5lDRppCRppCRppCRppCRppCRZlBR5lBR5lBRppARppA",
  ,
  "RZk/RZk/RZk/RZo+RZo+Rpk9Rpk9Rpk9Rpk9Rpk9Rpk9RZo8RZo8RZo8RJk7RJk7Q5o6Q5o6Qpk5Qpk5Qpk5RJk5RJk5RJk5RJk5RJk5Q5k3Q5k3Q5k3Qpo2",
  ,
  "Qpo2Qpo2QZk1QZk1Q5k1Q5k1Q5k1QpkzQpkzQpkzQpkzQpkzQpkzQZkzQZkzQJgyQJgyQJgyULUQULUQULUQULURULURULUSULUSULUSULUSULUSULUTULUT",
  ,
  "ULUUULUUULUVULUVULUWULUWULUWULUXULUXULUXULUYULUYULUYULQZULQZULQaULQbULQbULQbULQcULQcULQdULQdULQdULQeULMeULMeULMfULMfULMf",
  ,
  "ULMgULMhULMhULMiULMiULMiULMjULIjULIkULIkULIkULIkULIlULIlULIlULImULInULInULIoULIoULIoULEpULEpULEqULEqULEqULEqULErULErULEs",
  ,
  "ULEtULEtULEtULAuULAuULAvULAvULAvULAvULAwULAwULAxULAxULAxULAyUK8zUK8zUK8zUK80UK80UK81UK81Ypx0Ypx0Ypx0Ypx0Ypx0YJxxYJxxYJxx",
  ,
  "YJxxYJxxX5twX5tuX5tuX5tuXpxuXpxsXJxrXJxrXJxrXJxpXJxpXJxpXJxpXJxpW5toW5tnWpxnWpxnWZtlWZtlWZtlWZtlWZtkWZtkV5tiV5tiV5tgV5tg",
  ,
  "V5tgV5tgV5tgVppfVppfVZtfVZtfVJpcVJpcVJpcVJpcVJpcUppbUppbU5tZUZtYUZtYUZtYUZtYUZtYUZtWUJpVUJpVT5tVT5tVT5tVTppTTppRTppRTppR",
  ,
  "TppRTJpQTZtRTZtRTJpOTJpOTJpOS5tNS5tNSppMSppMSppMSZtJSZtJSJpISJpISJpISJpISJpISJpISJpISJpIR5tHSJpGSJpGR5tFR5tFR5tFRppERppE",
  ,
  "RptDRptDRptDR5pCR5pCRppCRppCRppCRppCRppCRZtBRJpARppARppARps/Rps/RZo+RZo+RZo+RJo+RJo+RJo+RJo+Rpk9Rpk9Rpk9RZo8Q5o8RJs7RJs7",
  ,
  "Q5o6Q5o6Q5s5Q5s5Qpo4Qpo4Qpo4Qpo4RJo4Q5o4Q5o4Q5o4Qpk3Qpk3Qpo2Qpo2Qpo2QZk1Q5k1Q5k1QpkzQpkzQpkzQpkzQpkzQZkzQZkzQZkzQZkzQJgy",
  ,
  "QJgyQpkxQpkxQpkxULURULURULURULUSULUSULUSULUTULUTULUTULUTULUUULUUULUVULUVULUVULUWULUXULUXULUXULUXULUXULUYULUZULUZULUZULQa",
  ,
  "ULQaULQbULQbULQbULQcULQdULQdULQeULQeULQeULQeULMeULMfULMgULMgULMgULMhULMhULMiULMjULMjULMjULMkULIkULIkULIkULIkULIlULImULIm",
  ,
  "ULImULInULInULIoULIpULIpULIpULEqULEqULEqULEqULEqULErULEsULEsULEtULEtULEtULEuULAuULAvULAvULAvULAvULAwULAwULAxULAyULAyULAy",
  ,
  "ULAzUK8zUK80UK80UK80UK81UK82UK82UK82Ypx1Ypx0Ypx0Ypx0YJxyYJxyYJxyYJxyYJxxX5twX5twX5twX5tuXpxuXpxsXJxrXJxrXJxrXJxrXJxrXJxr",
  ,
  "XJxpXJxpW5toW5toWpxoWpxoWZtlWZtlWZtlWZtlWZtkWZtkV5tiV5tiV5tgV5tgV5tgV5tgV5tgVppfVppfVZtfVZtfVJpeVJpeVJpeVJpcVJpcUppbUppb",
  ,
  "U5tbUZtYUZtYUZtYUZtYUZtYUZtYUJpXUJpXT5tVT5tVT5tVTppTTppTTppRTppRTppRTJpQTZtRTZtRTJpPTJpPTJpPS5tPS5tNSppMSppMSppMSZtLSZtL",
  ,
  "SJpISJpISJpISJpISJpISJpISJpISJpIR5tHRppGRppGRZtFRZtFRZtFRppERppERptDRptDRptDRJpCRJpCRppCRppCRppCRppCRppCRZtBRJpARJpARJpA",
  ,
  "RJs/RJs/RZo+RZo+RZo+RJo+RJo+RJo+RJo+Q5k9Q5k9Rpk9RZo8Q5o8RJs7RJs7Q5o6Q5o6Q5s5Q5s5Qpo4Qpo4Qpo4Qpo4Qpo4QZo4QZo4QZo4Qpk3Qpk3",
  ,
  "Qpo2Qpo2Qpo2QZk1QJk1QJk1P5kzP5kzQpkzQpkzQpkzQZkzQZkzQZkzQZkzQJgyQJgyQJkxQJkxQJkxULURULURULURULUSULUSULUSULUTULUTULUTULUT",
  ,
  "ULUUULUUULUVULUVULUVULUWULUXULUXULUXULUXULUXULUYULUZULUZULUZULQaULQaULQbULQbULQbULQcULQdULQdULQeULQeULQeULQeULMeULMfULMg",
  ,
  "ULMgULMgULMhULMhULMiULMjULMjULMjULMkULIkULIkULIkULIkULIlULImULImULImULInULInULIoULIpULIpULIpULEqULEqULEqULEqULEqULErULEs",
  ,
  "ULEsULEtULEtULEtULEuULAuULAvULAvULAvULAvULAwULAwULAxULAyULAyULAyULAzUK8zUK80UK80UK80UK81UK82UK82UK82UK82Ypx1Ypx1Ypx1YJxy",
  ,
  "YJxyYJxyYJxyYJxyX5twX5twX5twX5tuXpxuXpxuXJxtXJxtXJxtXJxrXJxrXJxrXJxrXJxrW5toW5toWpxoWpxoWZtlWZtlWZtlWZtlWZtlWZtkV5tiV5ti",
  ,
  "V5tiV5tiV5tiV5tiV5tiVppfVppfVZtfVZtfVJpeVJpeVJpeVJpcVJpcUppbUppbU5tbUZtaUZtYUZtYUZtYUZtYUZtYUJpXUJpXT5tVT5tVT5tVTppTTppT",
  ,
  "TppTTppRTppRTJpQTZtRTZtRTJpPTJpPTJpPS5tPS5tPSppMSppMSppMSZtLSZtLSJpKSJpKSJpKSJpISJpISJpISJpISJpIR5tHRppGRppGRZtFRZtFRZtF",
  ,
  "RppERppERptDRptDRptDRJpCRJpCRJpCRJpCRJpCRJpCRJpCRZtBRJpARJpARJpARJs/RJs/Q5o+RZo+RZo+RJo+RJo+RJo+RJo+Q5k9Q5k9Q5k9Q5o8Q5o8",
  ,
  "Qps7Qps7QZo6Q5o6Q5s5Q5s5Qpo4Qpo4Qpo4Qpo4Qpo4QZo4QZo4QZo4QJk3QJk3Qpo2Qpo2Qpo2QZk1QJk1QJk1P5kzP5kzP5kzP5kzP5kzP5kzP5kzP5kz",
  ,
  "P5kzQJgyQJgyQJkxQJkxQJkxUbURUbURUbURUbUSUbUSUbUSUbUTUbUTUbUTUbUTUbUUUbUUUbQVUbQVUbQVUbQWUbQXUbQXUbQXUbQXUbQXUbQYUbQZUbQZ",
  ,
  "UbQZUbQaUbMaUbMbUbMbUbMbUbMcUbMdUbMdUbMeUbMeUbMeUbMeUbMeUbIfUbIgUbIgUbIgUbIhUbIhUbIiUbIjUbIjUbIjUbIkUbIkUbIkUbIkUbEkUbEl",
  ,
  "UbEmUbEmUbEmUbEnUbEnUbEoUbEpUbEpUbEpUbEqUbEqUbAqUbAqUbAqUbArUbAsUbAsUbAtUbAtUbAtUbAuUbAuUbAvUK8vUK8vUK8vUK8wUK8wUK8xUK8y",
  ,
  "UK8yUK8yUK8zUK8zUK80UK80UK80UK41UK42UK42UK42UK42UK42Ypx1Ypx1YJxyYJxyYJxyYJxyYJxyX5twX5twX5twX5tuXpxuXpxuXJxtXJxtXJxtXJxr",
  ,
  "XJxrXJxrXJxrXJxrW5toW5toWpxoWpxoWZtlWZtlWZtlWZtlWZtlWZtkV5tiV5tiV5tiV5tiV5tiV5tiV5tiVppfVppfVZtfVZtfVJpeVJpeVJpeVJpcVJpc",
  ,
  "UppbUppbU5tbUZtaUZtYUZtYUZtYUZtYUZtYUJpXUJpXT5tVT5tVT5tVTppTTppTTppTTppRTppRTJpQTZtRTZtRTJpPTJpPTJpPS5tPS5tPSppMSppMSppM",
  ,
  "SZtLSZtLSJpKSJpKSJpKSJpISJpISJpISJpISJpIR5tHRppGRppGRZtFRZtFRZtFRppERppERptDRptDRptDRJpCRJpCRJpCRJpCRJpCRJpCRJpCRZtBRJpA",
  ,
  "RJpARJpARJs/RJs/Q5o+RZo+RZo+RJo+RJo+RJo+RJo+Q5k9Q5k9Q5k9Q5o8Q5o8Qps7Qps7QZo6Q5o6Q5s5Q5s5Qpo4Qpo4Qpo4Qpo4Qpo4QZo4QZo4QZo4",
  ,
  "QJk3QJk3Qpo2Qpo2Qpo2QZk1QJk1QJk1P5kzP5kzP5kzP5kzP5kzP5kzP5kzP5kzP5kzQJgyQJgyQJkxQJkxQJkxUrURUrURUrURUrUSUrUSUrUSUrUTUrUT",
  ,
  "UrUTUrUTUrUUUrUUUrQVUrQVUrQVUrQWUrQXUrQXUrQXUrQXUrQXUrQYUrQZUrQZUrQZUrQaUrMaUrMbUrMbUrMbUrMcUrMdUrMdUrMeUrMeUrMeUrMeUrMe",
  ,
  "UrIfUrIgUrIgUrIgUrIhUrIhUrIiUrIjUrIjUrIjUrIkUrIkUrIkUrIkUrEkUrElUrEmUrEmUrEmUrEnUrEnUrEoUrEpUrEpUrEpUbEqUbEqUbAqUbAqUbAq",
  ,
  "UbArUbAsUbAsUbAtUbAtUbAtUbAuUbAuUbAvUa8vUa8vUa8vUa8wUa8wUa8xUa8yUa8yUa8yUa8zUa8zUa80Ua80Ua80Ua41Ua42Ua42Ua42Ua42Ua42Ua43",
  ,
  "Ypx1YJxyYJxyYJxyYJxyYJxyX5twX5twX5twX5twXpxwXpxuXJxtXJxtXJxtXJxrXJxrXJxrXJxrXJxrW5toW5toWpxoWpxoWZtnWZtnWZtnWZtlWZtlWZtl",
  ,
  "V5tkV5tkV5tiV5tiV5tiV5tiV5tiVpphVpphVZtfVZtfVJpeVJpeVJpeVJpcVJpcUppbUppbU5tbUZtaUZtaUZtaUZtaUZtaUZtYUJpXUJpXT5tWT5tWT5tW",
  ,
  "TppTTppTTppTTppTTppTTJpSTZtSTZtSTJpPTJpPTJpPS5tPS5tPSppOSppOSppMSZtLSZtLSJpKSJpKSJpKSJpKSJpISJpISJpKSJpKR5tHRppGRppGRZtF",
  ,
  "RZtFRZtFRppERppERptDRptDRptDRJpCRJpCRJpCRJpCRJpCRJpCRJpCQ5tBRJpARJpARJpARJs/RJs/Q5o+Q5o+Q5o+Qpo+Qpo+Qpo+RJo+Q5k9Q5k9Q5k9",
  ,
  "Q5o8Q5o8Qps7Qps7QZo6QZo6Q5s5Q5s5Qpo4Qpo4Qpo4Qpo4Qpo4QZo4QZo4QZo4QJk3QJk3QJo2QJo2QJo2QZk1QJk1QJk1P5kzP5kzP5kzP5kzP5kzP5kz",
  ,
  "P5kzP5kzP5kzQJgyQJgyQJkxQJkxQJkxU7URU7URU7URU7USU7USU7USU7UTU7UTU7UTU7UTU7UUU7UUU7QVU7QVU7QVU7QWU7QXU7QXU7QXU7QXU7QXU7QY",
  ,
  "U7QZU7QZU7QZU7QaU7MaU7MbU7MbU7MbU7McU7MdU7MdU7MeU7MeU7MeU7MeU7MeU7IfU7IgU7IgU7IgU7IhU7IhU7IiU7IjU7IjU7IjU7IkU7IkU7IkU7Ik",
  ,
  "UrEkUrElUrEmUrEmUrEmUrEnUrEnUrEoUrEpUrEpUrEpUrEqUrEqUrAqUrAqUrAqUrArUrAsUrAsUrAtUrAtUrAtUrAuUrAuUrAvUq8vUq8vUq8vUq8wUq8w",
  ,
  "Uq8xUq8yUq8yUq8yUq8zUq8zUq80Uq80Uq80Uq41Uq42Uq42Uq42Uq42Uq42Uq43Uq44YJxyYJxyYJxyYJxyX5txX5txX5twX5twX5twXpxuXJxtXJxtXJxt",
  ,
  "XJxtXJxtXJxrXJxrW5tqW5tqW5tqWpxoWpxoWZtnWZtnWZtnWZtnWZtlV5tkV5tkV5tiV5tiV5tiV5tiV5tiVpphVpphVpphVZtfVZtfVJpeVJpeVJpeVJpe",
  ,
  "UppbUppbUZtaUZtaUZtaUZtaUZtaUZtaUZtaUZtaUJpXUJpXT5tWT5tWT5tWTppTTppTTppTTJpSTJpSTJpSTJpSTZtSTJpRTJpRTJpRS5tPS5tPSppOSppO",
  ,
  "SppOSZtNSJpKSJpKSJpKSJpKSJpKSJpKSJpKR5lJR5tJR5tJRppIRppIRZtFRZtFRJpERJpERJpEQ5tDRJpCRJpCRJpCRJpCRJpCRJpCRJpCQ5lBQ5lBQ5tB",
  ,
  "QppAQppAQZs/QZs/QZs/Q5o+Qpo+Qpo+Qpo+Qpo+Qpo+QZk9Q5k9Q5o8Q5o8Q5o8Qpk7Qps7QZo6QZo6QZo6QJs5P5o4P5o4P5o4P5o4Qpo4QZo4QZo4QJk3",
  ,
  "QJk3QJk3QJo2QJo2QZk1QZk1QZk1QJk1P5kzP5kzP5kzP5kzP5kzP5kzP5kzPpgyPpgyPpgyPpgyPZkxPZkxP5gwP5gwP5gwVLUSVLUSVLUSVLUSVLUSVLUT",
  ,
  "VLUUVLUUVLUUVLUUVLUVVLUVVLQWVLQWVLQWVLQXVLQXVLQXVLQXVLQYVLQYVLQZVLQZVLQaVLQaVLQbVLMbVLMcVLMcVLMcVLMdVLMdVLMeVLMeVLMeVLMe",
  ,
  "VLMfVLMfVLIgVLIhVLIhVLIhVLIiVLIiU7IjU7IjU7IjU7IkU7IkU7IkU7IlU7IlU7ElU7EmU7EmU7EnU7EnU7EoU7EoU7EpU7EpU7EqU7EqU7EqU7EqU7Ar",
  ,
  "U7ArU7ArU7AsU7AsU7AtU7AuU7AuU7AuU7AvU7AvU7AvU68vU68vU68wU68xU68xU68yU68yU68yU68zU68zU680Uq81Uq81Uq81Uq42Uq42Uq42Uq42Uq42",
  ,
  "Uq43Uq44Uq44Uq45YJx0YJx0YJx0X5txX5txX5twX5twX5twXpxvXJxuXJxtXJxtXJxtXJxtXJxtXJxtW5tqW5tqW5tqWpxoWpxoWZtnWZtnWZtnWZtnWZtn",
  ,
  "V5tkV5tkV5tkV5tkV5tkV5tkV5tkVpphVpphVpphVZthVZthVJpeVJpeVJpeVJpeUppbUppbUZtaUZtaUZtaUZtaUZtaUZtaUZtaUZtaUJpXUJpXT5tWT5tW",
  ,
  "T5tWTppVTppVTppVTJpSTJpSTJpSTJpSTZtSTJpRTJpRTJpRS5tRS5tPSppOSppOSppOSZtNSJpMSJpMSJpKSJpKSJpKSJpKSJpKR5lJR5tJR5tJRppIRppI",
  ,
  "RZtFRZtFRJpERJpERJpEQ5tDRJpCRJpCRJpCRJpCRJpCRJpCRJpCQ5lBQ5lBQ5tBQppAQppAQZs/QZs/QZs/Q5o+Qpo+Qpo+Qpo+Qpo+Qpo+QZk9QZk9QJo8",
  ,
  "QJo8QJo8Qpk7QJs7QZo6QZo6QZo6QJs5P5o4P5o4P5o4P5o4P5o4QZo4QZo4QJk3QJk3QJk3QJo2QJo2Ppk1Ppk1Ppk1Ppk1PZkzPZkzP5kzP5kzP5kzP5kz",
  ,
  "P5kzPpgyPpgyPpgyPpgyPZkxPZkxPJgwPJgwPJgwVLUSVLUSVLUSVLUSVLUSVLUTVLUUVLUUVLUUVLUUVLUVVLUVVLQWVLQWVLQWVLQXVLQXVLQXVLQXVLQY",
  ,
  "VLQYVLQZVLQZVLQaVLQaVLQbVLMbVLMcVLMcVLMcVLMdVLMdVLMeVLMeVLMeVLMeVLMfVLMfVLIgVLIhVLIhVLIhVLIiVLIiU7IjU7IjU7IjU7IkU7IkU7Ik",
  ,
  "U7IlU7IlU7ElU7EmU7EmU7EnU7EnU7EoU7EoU7EpU7EpU7EqU7EqU7EqU7EqU7ArU7ArU7ArU7AsU7AsU7AtU7AuU7AuU7AuU7AvU7AvU7AvU68vU68vU68w",
  ,
  "U68xU68xU68yU68yU68yU68zU68zU680Uq81Uq81Uq81Uq42Uq42Uq42Uq42Uq42Uq43Uq44Uq44Uq45Uq45YJx0YJx0X51yX51yXpxxXpxxXpxwXpxvXJxu",
  ,
  "XJxuXJxtXJxtXJxtXJxtXJxtW5tqW5tqW5tqWpxqWpxqWZtnWZtnWZtnWZtnWZtnV5tkV5tkV5tkV5tkV5tkV5tkV5tkVpphVpphVpxjVZthVZthVJxgVJxg",
  ,
  "VJxgVJpeU5tdU5tdUZtaUZtaUZtaUZtaUZtaUZtaUZtaUZtaUZtZUZtZT5tWT5tWT5tWTpxWTZtVTZtVTZtUTZtUTZtUTZtUTZtUTJpRTJpRTJpRS5tRS5tR",
  ,
  "SpxQSpxQSpxQSZtNSZtNSZtNSJpMSJpMSJpMSJpMSJpMR5tJR5tJR5tJRppIRppIRZtHRZtHRZtHRZtHRZtFQ5tDQ5tDQ5tDQ5tDQppCQppCRJpCRJpCQ5tB",
  ,
  "Q5tBQ5tBQppAQppAQZs/QZs/QZs/QZs/Qps9Qps9Qps9Qps9Qps9QZs9QZs9QJo8QJo8QJo8QJs7QJs7P5o6P5o6P5o6QJs5P5o4P5o4P5o4P5o4P5o4P5o4",
  ,
  "P5o4Ppk3Ppk3Ppk3QJo2QJo2Ppk1Ppk1Ppk1Ppk1PZo0PZo0PZo0PZo0PZo0PJoyPJoyPpoyPpoyPpoyPpoyPZkxPZkxPZowPZowPZowVbUSVbUSVbUSVbUS",
  ,
  "VbUSVbUTVbUUVbUUVbUUVbUUVbUVVbUVVbQWVbQWVbQWVbQXVbQXVbQXVbQXVbQYVbQYVbQZVbQZVbQaVbQaVbQbVbMbVbMcVbMcVbMcVbMdVbMdVbMeVbMe",
  ,
  "VbMeVbMeVbMfVbMfVLIgVLIhVLIhVLIhVLIiVLIiVLIjVLIjVLIjVLIkVLIkVLIkVLIlVLIlVLElVLEmVLEmVLEnVLEnVLEoVLEoVLEpVLEpVLEqVLEqVLEq",
  ,
  "VLEqVLArVLArVLArVLAsVLAsVLAtVLAuVLAuVLAuVLAvVLAvVLAvU68vU68vU68wU68xU68xU68yU68yU68yU68zU68zU680U681U681U681U642U642U642",
  ,
  "U642U642U643U644U644U645U645U645YJx0X51yX51yXpxxXpxxXpxwXpxvXJxuXJxuXJxtXJxtXJxtXJxtXJxtW5tqW5tqW5tqWpxqWpxqWZtnWZtnWZtn",
  ,
  "WZtnWZtnV5tkV5tkV5tkV5tkV5tkV5tkV5tkVpphVpphVpxjVZthVZthVJxgVJxgVJxgVJpeU5tdU5tdUZtaUZtaUZtaUZtaUZtaUZtaUZtaUZtaUZtZUZtZ",
  ,
  "T5tWT5tWT5tWTpxWTZtVTZtVTZtUTZtUTZtUTZtUTZtUTJpRTJpRTJpRS5tRS5tRSpxQSpxQSpxQSZtNSZtNSZtNSJpMSJpMSJpMSJpMSJpMR5tJR5tJR5tJ",
  ,
  "RppIRppIRZtHRZtHRZtHRZtHRZtFQ5tDQ5tDQ5tDQ5tDQppCQppCRJpCRJpCQ5tBQ5tBQ5tBQppAQppAQZs/QZs/QZs/QZs/Qps9Qps9Qps9Qps9Qps9QZs9",
  ,
  "QZs9QJo8QJo8QJo8QJs7QJs7P5o6P5o6P5o6QJs5P5o4P5o4P5o4P5o4P5o4P5o4P5o4Ppk3Ppk3Ppk3QJo2QJo2Ppk1Ppk1Ppk1Ppk1PZo0PZo0PZo0PZo0",
  ,
  "PZo0PJoyPJoyPpoyPpoyPpoyPpoyPZkxPZkxPZowPZowPZowVbUSVbUSVbUSVbUSVbUSVbUTVbUUVbUUVbUUVbUUVbUVVbUVVbQWVbQWVbQWVbQXVbQXVbQX",
  ,
  "VbQXVbQYVbQYVbQZVbQZVbQaVbQaVbQbVbMbVbMcVbMcVbMcVbMdVbMdVbMeVbMeVbMeVbMeVbMfVbMfVbIgVbIhVbIhVbIhVbIiVbIiVbIjVbIjVbIjVbIk",
  ,
  "VbIkVbIkVbIlVbIlVbElVbEmVbEmVbEnVbEnVbEoVbEoVbEpVbEpVbEqVbEqVbEqVbEqVbArVbArVbArVbAsVLAsVLAtVLAuVLAuVLAuVLAvVLAvVLAvVK8v",
  ,
  "VK8vVK8wVK8xVK8xVK8yVK8yVK8yVK8zVK8zVK80VK81VK81VK81VK42VK42VK42VK42VK42VK43VK44VK44VK45VK45VK45VK46X51yX51yXpxxXpxxXpxw",
  ,
  "XpxvXJxuXJxuXJxtXJxtXJxtXJxtXJxtW5tqW5tqW5tqWpxqWpxqWZtnWZtnWZtnWZtnWZtnV5tkV5tkV5tkV5tkV5tkV5tkV5tkVpphVpphVpxjVZthVZth",
  ,
  "VJxgVJxgVJxgVJpeU5tdU5tdUZtaUZtaUZtaUZtaUZtaUZtaUZtaUZtaUZtZUZtZT5tWT5tWT5tWTpxWTZtVTZtVTZtUTZtUTZtUTZtUTZtUTJpRTJpRTJpR",
  ,
  "S5tRS5tRSpxQSpxQSpxQSZtNSZtNSZtNSJpMSJpMSJpMSJpMSJpMR5tJR5tJR5tJRppIRppIRZtHRZtHRZtHRZtHRZtFQ5tDQ5tDQ5tDQ5tDQppCQppCRJpC",
  ,
  "RJpCQ5tBQ5tBQ5tBQppAQppAQZs/QZs/QZs/QZs/Qps9Qps9Qps9Qps9Qps9QZs9QZs9QJo8QJo8QJo8QJs7QJs7P5o6P5o6P5o6QJs5P5o4P5o4P5o4P5o4",
  ,
  "P5o4P5o4P5o4Ppk3Ppk3Ppk3QJo2QJo2Ppk1Ppk1Ppk1Ppk1PZo0PZo0PZo0PZo0PZo0PJoyPJoyPpoyPpoyPpoyPpoyPZkxPZkxPZowPZowPZowVbQSVbQS",
  ,
  "VbQSVbQSVbQSVbQTVbQUVbQUVbQUVbQUVbQVVbQVVbQWVbQWVbMWVbMXVbMXVbMXVbMXVbMYVbMYVbMZVbMZVbMaVbMaVbMbVbMbVbIcVbIcVbIcVbIdVbId",
  ,
  "VbIeVbIeVbIeVbIeVbIfVbIfVbIgVbIhVbIhVbEhVbEiVbEiVbEjVbEjVbEjVbEkVbEkVbEkVbElVbElVbElVbEmVbAmVbAnVbAnVbAoVbAoVbApVbApVbAq",
  ,
  "VbAqVbAqVbAqVbArVbArVbArVa8sVK8sVK8tVK8uVK8uVK8uVK8vVK8vVK8vVK8vVK8vVK8wVK8xVK4xVK4yVK4yVK4yVK4zVK4zVK40VK41VK41VK41VK42",
  ,
  "VK42VK42VK42VK42VK43VK44VK44VK45VK45VK45VK46VK47XpxxXpxxXpxxXpxvXJxuXJxuXJxtXJxtXJxtXJxtXJxtW5trW5trW5trWpxqWpxqWZtpWZtn",
  ,
  "WZtnWZtnWZtnV5tmV5tmV5tkV5tkV5tkV5tkV5tkVppjVppjVppjVZthVZthVJxgVJpfVJpfVJpfU5tdU5tdUZtcUZtcUZtcUZtaUZtaUZtaUZtaUJpZUJpZ",
  ,
  "UZtZT5tYTpxWTpxWTpxWTZtVTZtVTZtUTZtUTZtUTZtUTZtUTJpRTJpRS5tRS5tRSppPSppPSZtPSZtPSZtPSZtNSZtNSJpMSJpMSJpMSJpMSJpMR5tJR5tJ",
  ,
  "RppIRppIRZtHRZtHRJpGRZtHQ5tDQ5tDQ5tDQ5tDQ5tDQppCQppCQppCQppCQZtBQZtBQppAQppAQppAQZs/QZs/QZs/QZs/QZs/QJs9QJs9QJs9QJs9Qps9",
  ,
  "QZs9QJo8QJo8QJs7QJs7QJs7P5o6P5o6Pps5Pps5Pps5PZo4PZo4PZo4P5o4P5o4P5o4Ppk3Ppk3PZo2PZo2PZo2Ppk1Ppk1Ppk1Ppk1Ppk1PZo0PZo0PZo0",
  ,
  "PJoyPJoyPJoyPJoyPJoyO5kxO5kxO5kxPZkxPZowPZowPJkvPJkvPJkvVrQSVrQSVrQSVrQTVrQTVrQUVrQVVrQVVrQVVrQVVrQWVrQWVrQXVrQXVrMXVrMX",
  ,
  "VrMYVrMYVrMYVrMZVrMZVrMaVrMaVrMbVrMbVrMcVrMcVrIdVrIdVrIdVrIeVbIeVbIeVbIfVbIfVbIfVbIgVbIgVbIhVbIhVbIhVbEiVbEjVbEjVbEkVbEk",
  ,
  "VbEkVbEkVbEkVbElVbEmVbEmVbEmVbEnVbAnVbAoVbAoVbAoVbApVbAqVbAqVbAqVbAqVbAqVbArVbArVbAsVbAsVa8tVa8tVa8uVa8uVa8vVa8vVa8vVa8v",
  ,
  "Va8wVa8wVa8wVa8xVa8xVa4yVa4yVa4zVa4zVa40Va40Va41Va41Va41Va42Va42Va42VK43VK43VK43VK44VK44VK45VK45VK45VK46VK47VK47VK48Xpxx",
  ,
  "XpxxXpxvXJxuXJxuXJxuXJxuXJxuXJxuXJxuW5trW5trW5trWpxqWpxqWZtpWZtoWZtnWZtnWZtnV5tmV5tmV5tlV5tlV5tlV5tlV5tkVppjVppjVppjVZti",
  ,
  "VZtiVJxgVJpfVJpfVJpfU5tdU5tdUZtcUZtcUZtcUZtbUZtaUZtaUZtaUJpZUJpZUZtZT5tYTpxYTpxWTpxWTZtVTZtVTZtUTZtUTZtUTZtUTZtUTJpRTJpR",
  ,
  "S5tRS5tRSppPSppPSZtPSZtPSZtPSZtPSZtPSJpMSJpMSJpMSJpMSJpMR5tLR5tLRppKRppKRZtHRZtHRJpGRZtHQ5tGQ5tGQ5tGQ5tFQ5tFQppCQppCQppC",
  ,
  "QppCQZtBQZtBQJpAQJpAQJpAQZs/QZs/QZs/QZs/QZs/QJs9QJs9QJs9QJs9QJs9P5s9QJo8QJo8QJs7QJs7QJs7P5o6P5o6Pps5Pps5Pps5PZo4PZo4PZo4",
  ,
  "P5o4P5o4P5o4Ppk3Ppk3PZo2PZo2PZo2PJk1PJk1PJk1PJk1PJk1O5o0O5o0PZo0PJoyPJoyPJoyPJoyPJoyO5kxO5kxO5kxO5kxPZowPZowPJkvPJkvPJkv",
  ,
  "VrQSVrQSVrQSVrQTVrQTVrQUVrQVVrQVVrQVVrQVVrQWVrQWVrQXVrQXVrMXVrMXVrMYVrMYVrMYVrMZVrMZVrMaVrMaVrMbVrMbVrMcVrMcVrIdVrIdVrId",
  ,
  "VrIeVbIeVbIeVbIfVbIfVbIfVbIgVbIgVbIhVbIhVbIhVbEiVbEjVbEjVbEkVbEkVbEkVbEkVbEkVbElVbEmVbEmVbEmVbEnVbAnVbAoVbAoVbAoVbApVbAq",
  ,
  "VbAqVbAqVbAqVbAqVbArVbArVbAsVbAsVa8tVa8tVa8uVa8uVa8vVa8vVa8vVa8vVa8wVa8wVa8wVa8xVa8xVa4yVa4yVa4zVa4zVa40Va40Va41Va41Va41",
  ,
  "Va42Va42Va42VK43VK43VK43VK44VK44VK45VK45VK45VK46VK47VK47VK48VK48XpxxXpxvXJxuXJxuXJxuXJxuXJxuXJxuXJxuW5trW5trW5trWpxrWpxq",
  ,
  "WZtpWZtoWZtoWZtoWZtoV5tmV5tmV5tlV5tlV5tlV5tlV5tlVppjVppjVppjVZtiVZtiVJxgVJpfVJpfVJpfU5tfU5tfUZtdUZtcUZtcUZtbUZtbUZtbUZtb",
  ,
  "UJpaUJpaUZtZT5tYTpxYTpxYTpxYTZtWTZtWTZtUTZtUTZtUTZtUTZtUTJpTTJpTS5tRS5tRSppPSppPSZtPSZtPSZtPSZtPSZtPSJpMSJpMSJpMSJpMSJpM",
  ,
  "R5tLR5tLRppKRppKRZtJRZtHRJpGRZtHQ5tGQ5tGQ5tGQ5tFQ5tFQppCQppCQppCQppCQZtBQZtBQJpAQJpAQJpAP5s/P5s/P5s/P5s/P5s/QJs9QJs9QJs9",
  ,
  "QJs9QJs9P5s9Ppo8Ppo8PZs7PZs7QJs7P5o6P5o6Pps5Pps5Pps5PZo4PZo4PZo4P5o4P5o4P5o4Ppk3Ppk3PZo2PZo2PZo2PJk1PJk1PJk1PJk1PJk1O5o0",
  ,
  "O5o0O5o0PJoyPJoyPJoyPJoyPJoyO5kxO5kxO5kxO5kxOpowOpowOZkvOZkvOZkvV7QSV7QSV7QSV7QTV7QTV7QUV7QVV7QVV7QVV7QVV7QWV7QWV7QXV7QX",
  ,
  "V7MXV7MXV7MYV7MYV7MYV7MZV7MZV7MaV7MaV7MbV7MbV7McV7McV7IdVrIdVrIdVrIeVrIeVrIeVrIfVrIfVrIfVrIgVrIgVrIhVrIhVrIhVrEiVrEjVrEj",
  ,
  "VrEkVrEkVrEkVrEkVrEkVrElVrEmVrEmVrEmVrEnVrAnVrAoVrAoVbAoVbApVbAqVbAqVbAqVbAqVbAqVbArVbArVbAsVbAsVa8tVa8tVa8uVa8uVa8vVa8v",
  ,
  "Va8vVa8vVa8wVa8wVa8wVa8xVa8xVa4yVa4yVa4zVa4zVa40Va40Va41Va41Va41Va42Va42Va42Va43Va43Va43Va44Va44Va45Va45Va45Va46Va47Va47",
  ,
  "Va48Va48Va48XpxvXJxuXJxuXJxuXJxuXJxuXJxuXJxuW5trW5trW5trWpxrWpxqWZtpWZtoWZtoWZtoWZtoV5tmV5tmV5tlV5tlV5tlV5tlV5tlVppjVppj",
  ,
  "VppjVZtiVZtiVJxgVJpfVJpfVJpfU5tfU5tfUZtdUZtcUZtcUZtbUZtbUZtbUZtbUJpaUJpaUZtZT5tYTpxYTpxYTpxYTZtWTZtWTZtUTZtUTZtUTZtUTZtU",
  ,
  "TJpTTJpTS5tRS5tRSppPSppPSZtPSZtPSZtPSZtPSZtPSJpMSJpMSJpMSJpMSJpMR5tLR5tLRppKRppKRZtJRZtHRJpGRZtHQ5tGQ5tGQ5tGQ5tFQ5tFQppC",
  ,
  "QppCQppCQppCQZtBQZtBQJpAQJpAQJpAP5s/P5s/P5s/P5s/P5s/QJs9QJs9QJs9QJs9QJs9P5s9Ppo8Ppo8PZs7PZs7QJs7P5o6P5o6Pps5Pps5Pps5PZo4",
  ,
  "PZo4PZo4P5o4P5o4P5o4Ppk3Ppk3PZo2PZo2PZo2PJk1PJk1PJk1PJk1PJk1O5o0O5o0O5o0PJoyPJoyPJoyPJoyPJoyO5kxO5kxO5kxO5kxOpowOpowOZkv",
  ,
  "OZkvOZkvWLQSWLQSWLQSWLQTWLQTWLQUWLQVWLQVWLQVWLQVWLQWWLQWWLQXWLQXWLMXWLMXWLMYWLMYWLMYWLMZWLMZWLMaWLMaWLMbWLMbWLMcV7McV7Id",
  ,
  "V7IdV7IdV7IeV7IeV7IeV7IfV7IfV7IfV7IgV7IgV7IhV7IhV7IhV7EiV7EjV7EjV7EkV7EkV7EkV7EkV7EkV7ElV7EmV7EmVrEmVrEnVrAnVrAoVrAoVrAo",
  ,
  "VrApVrAqVrAqVrAqVrAqVrAqVrArVrArVrAsVrAsVq8tVq8tVq8uVq8uVq8vVq8vVq8vVq8vVq8wVa8wVa8wVa8xVa8xVa4yVa4yVa4zVa4zVa40Va40Va41",
  ,
  "Va41Va41Va42Va42Va42Va43Va43Va43Va44Va44Va45Va45Va45Va46Va47Va47Va48Va48Va48Va48XJxuXJxuXJxuXJxuXJxuXJxuXJxuW5trW5trW5tr",
  ,
  "WpxrWpxrWZtqWZtoWZtoWZtoWZtoV5tmV5tmV5tlV5tlV5tlV5tlV5tlVppkVppjVppjVZtiVZtiVJxiVJphVJphVJphU5tfU5tfUZtdUZtdUZtdUZtbUZtb",
  ,
  "UZtbUZtbUJpaUJpaUZtbT5tYTpxYTpxYTpxYTZtWTZtWTZtUTZtUTZtUTZtUTZtUTJpTTJpTS5tRS5tRSppPSppPSZtPSZtPSZtPSZtPSZtPSJpMSJpMSJpM",
  ,
  "SJpMSJpMR5tLR5tLRppKRppKRZtJRZtJRJpIRZtJQ5tGQ5tGQ5tGQ5tFQ5tFQppEQppEQppEQppEQZtDQZtDQJpAQJpAQJpAP5s/P5s/P5s/P5s/P5s/QJs9",
  ,
  "QJs9QJs9QJs9QJs9P5s9Ppo8Ppo8PZs7PZs7PZs7P5o6P5o6Pps5Pps5Pps5PZo4PZo4PZo4PJo4PJo4PJo4O5k3O5k3PZo2PZo2PZo2PJk1PJk1PJk1PJk1",
  ,
  "PJk1O5o0O5o0O5o0OpoyOpoyOpoyOZoyOZoyO5kxO5kxO5kxO5kxOpowOpowOZkvOZkvOZkvWbQSWbQSWbQSWbQTWbQTWbQUWbQVWbQVWbQVWbQVWbQWWbQW",
  ,
  "WbQXWbQXWbMXWbMXWbMYWbMYWbMYWbMZWbMZWbMaWbMaWLMbWLMbWLMcWLMcWLIdWLIdWLIdWLIeWLIeWLIeWLIfWLIfWLIfWLIgWLIgWLIhWLIhWLIhWLEi",
  ,
  "WLEjWLEjWLEkWLEkWLEkWLEkV7EkV7ElV7EmV7EmV7EmV7EnV7AnV7AoV7AoV7AoV7ApV7AqV7AqV7AqV7AqV7AqV7ArV7ArV7AsV7AsV68tV68tV68uVq8u",
  ,
  "Vq8vVq8vVq8vVq8vVq8wVq8wVq8wVq8xVq8xVq4yVq4yVq4zVq4zVq40Vq40Vq41Vq41Vq41Vq42Vq42Vq42Vq43Vq43Vq43Va44Va44Va45Va45Va45Va46",
  ,
  "Va47Va47Va48Va48Va48Va48Va08XJxuXJxuXJxuXJxuXJxuW5trW5trWpxrWpxrWpxrWZtqWZtoWZtoV5tnV5tnV5tnV5tnV5tlV5tlV5tlV5tlV5tlVppk",
  ,
  "VppkVZtiVZtiVJxiVJxiVJphVJphU5tfU5tfU5tfUZtdUZtdUZtdUZtdUZtdUZtbUJpaUJpaT5taT5taT5taTpxZTpxZTZtWTZtWTZtWTZtWTZtWTZtWTJpT",
  ,
  "TJpTTJpTS5tTS5tTSppRSppRSppRSZtPSZtRSZtPSZtPSZtPSJpOSJpOSJpOR5tNR5tNR5tNRppKRppKRZtJRZtJRZtJRJpIRJpIQ5tGQ5tFQ5tFQ5tFQppE",
  ,
  "QppEQppEQppEQppEQZtDQZtDQJpAQJpAQJpAP5s/Ppo+Ppo+PZs9PZs9PZs9PZs9PZs9PZs9PZs9PZs9Ppo8Ppo8PZs7PJo6PJo6PJo6PJs5PJs5PZo4PZo4",
  ,
  "PZo4PZo4PZo4PJo4PJo4PJo4O5k3O5o2O5o2PJk1PJk1PJk1PJk1PJk1OpkzOpkzOpkzO5o0O5o0OpoyOZoyOZoyOZoyO5kxO5kxOpowOpowOpowOpowOZkv",
  ,
  "OZkvOZkvOZkvOZkvWbQSWbQSWbQSWbQTWbQTWbQUWbQVWbQVWbQVWbQVWbQWWbQWWbQXWbQXWbMXWbMXWbMYWbMYWbMYWbMZWbMZWbMaWbMaWLMbWLMbWLMc",
  ,
  "WLMcWLIdWLIdWLIdWLIeWLIeWLIeWLIfWLIfWLIfWLIgWLIgWLIhWLIhWLIhWLEiWLEjWLEjWLEkWLEkWLEkWLEkV7EkV7ElV7EmV7EmV7EmV7EnV7AnV7Ao",
  ,
  "V7AoV7AoV7ApV7AqV7AqV7AqV7AqV7AqV7ArV7ArV7AsV7AsV68tV68tV68uVq8uVq8vVq8vVq8vVq8vVq8wVq8wVq8wVq8xVq8xVq4yVq4yVq4zVq4zVq40",
  ,
  "Vq40Vq41Vq41Vq41Vq42Vq42Vq42Vq43Vq43Vq43Va44Va44Va45Va45Va45Va46Va47Va47Va48Va48Va48Va48Va08Va09XJxuXJxuXJxuXJxuW5ttW5tt",
  ,
  "WpxrWpxrWpxrWZtqWZtoWZtoV5tnV5tnV5tnWJxoV5tnV5tnV5tnV5tnV5tnVpxlVpxlVZtkVZtkVJxiVJxiVJphVJphU5tgU5tgU5tgUpxeUpxeUZtdUZtd",
  ,
  "UZtdUZtdUZtbUZtbT5taT5taT5taTpxZTpxZTZtWTZtWTZtWTZtWTZtWTZtWTJxVTJxVTJxVS5tTS5tTSpxSSpxSSpxSSZtRSZtRSZtPSZtPSZtPSJxOSJxO",
  ,
  "SJxOR5tNR5tNR5tNRpxKRpxKRZtJRZtJRZtJRZtJRZtJQ5tGQ5tFQ5tFQ5tFQpxEQpxEQpxEQpxEQpxEQZtDQZtDQZtDQZtDQZtDP5tBP5tBP5tBPZs9PZs9",
  ,
  "PZs9PZs9PZs9PZs9PZs9PZs9PJo8Ppo8PZs7PJo6PJo6PJo6PJs5PJs5O5o4O5o4PZo4PZo4O5s5PJo4PJo4PJo4PJs3O5o2O5o2Ops1Ops1Ops1OZk1OZk1",
  ,
  "O5o0O5o0O5o0O5o0O5o0OpszOZoyOZoyOZoyOZsxOZsxOpowOpowOpowOpowOpowOpowOZkvOZkvOZkvWrQTWrQTWrQTWrQUWrQUWrQVWrQVWrQVWrQVWrQW",
  ,
  "WrQXWrQXWrQXWrQXWrMXWrMYWrMYWrMZWrMZWrMaWrMaWrMbWbMbWbMcWbMcWbMcWbMdWbIeWbIeWbIeWbIeWbIeWbIfWbIfWbIgWbIgWbIhWbIhWbIiWbIi",
  ,
  "WbIiWbEjWbEjWbEkWLEkWLEkWLEkWLElWLElWLEmWLEmWLEmWLEnWLEoWLAoWLApWLApWLApWLAqWLAqWLAqWLArWLArWLArWLAsWLAsV7AtV7AtV68tV68u",
  ,
  "V68uV68vV68vV68vV68vV68wV68wV68xV68xV68xV68yV64zV64zV640V640V640V641V641Vq42Vq42Vq42Vq42Vq43Vq43Vq43Vq44Vq44Vq45Vq46Vq46",
  ,
  "Vq46Vq47Vq47Vq48Vq48Vq48Vq48Vq49Vq09Vq0+Vq0+XJxuXJxuXJxuW5ttW5ttWpxrWpxrWpxrWZtqWZtoWZtoV5tnV5tnV5tnWJxoV5tnV5tnV5tnV5tn",
  ,
  "V5tnVpxlVpxlVZtkVZtkVJxiVJxiVJphVJphU5tgU5tgU5tgUpxeUpxeUZtdUZtdUZtdUZtdUZtbUZtbT5taT5taT5taTpxZTpxZTZtWTZtWTZtWTZtWTZtW",
  ,
  "TZtWTJxVTJxVTJxVS5tTS5tTSpxSSpxSSpxSSZtRSZtRSZtPSZtPSZtPSJxOSJxOSJxOR5tNR5tNR5tNRpxKRpxKRZtJRZtJRZtJRZtJRZtJQ5tGQ5tFQ5tF",
  ,
  "Q5tFQpxEQpxEQpxEQpxEQpxEQZtDQZtDQZtDQZtDQZtDP5tBP5tBP5tBPZs9PZs9PZs9PZs9PZs9PZs9PZs9PZs9PJo8Ppo8PZs7PJo6PJo6PJo6PJs5PJs5",
  ,
  "O5o4O5o4PZo4PZo4O5s5PJo4PJo4PJo4PJs3O5o2O5o2Ops1Ops1Ops1OZk1OZk1O5o0O5o0O5o0O5o0O5o0OpszOZoyOZoyOZoyOZsxOZsxOpowOpowOpow",
  ,
  "OpowOpowOpowOZkvOZkvOZkvWrQTWrQTWrQTWrQUWrQUWrQVWrQVWrQVWrQVWrQWWrQXWrQXWrQXWrQXWrMXWrMYWrMYWrMZWrMZWrMaWrMaWrMbWrMbWrMc",
  ,
  "WrMcWrMcWrMdWrIeWrIeWrIeWrIeWrIeWrIfWrIfWrIgWrIgWrIhWrIhWrIiWrIiWrIiWrEjWbEjWbEkWbEkWbEkWbEkWbElWbElWbEmWbEmWbEmWbEnWbEo",
  ,
  "WbAoWbApWbApWbApWbAqWbAqWbAqWbArWbArWLArWLAsWLAsWLAtWLAtWK8tWK8uWK8uWK8vWK8vWK8vWK8vWK8wWK8wWK8xWK8xWK8xWK8yWK4zWK4zV640",
  ,
  "V640V640V641V641V642V642V642V642V643V643V643V644V644V645V646V646V646V647V647V648Vq48Vq48Vq48Vq49Vq09Vq0+Vq0+Vq0+XJxwXJxu",
  ,
  "W5ttW5ttWpxrWpxrWpxrWZtqWZtqWZtoV5tnV5tnV5tnWJxoV5tnV5tnV5tnV5tnV5tnVpxlVpxlVZtkVZtkVJxjVJxjVJphVJphU5tgU5tgU5tgUpxeUpxe",
  ,
  "UZtdUZtdUZtdUZtdUZtdUZtbT5taT5taT5taTpxZTpxZTZtYTZtYTZtYTZtWTZtWTZtWTJxVTJxVTJxVS5tVS5tVSpxSSpxSSpxSSZtRSZtRSZtRSZtRSZtR",
  ,
  "SJxQSJxQSJxOR5tNR5tNR5tNRpxMRpxMRZtLRZtLRZtLRZtJRZtJQ5tIQ5tHQ5tHQ5tHQpxGQpxGQpxEQpxEQpxEQZtDQZtDQZtDQZtDQZtDP5tBP5tBP5tB",
  ,
  "PZs9PZs9PZs9PZs9PZs9PZs9PZs9PZs9PJo8PJo8O5s7PJo6PJo6PJo6PJs5PJs5O5o4O5o4O5o4O5o4O5s5Opo4Opo4Opo4Ops3O5o2O5o2Ops1Ops1Ops1",
  ,
  "OZk1OZk1OZo0OZo0OZo0O5o0OZo0OpszOZoyOZoyOZoyOZsxOZsxOJowOJowOJowOJowN5owN5owNpkvNpkvNpkvW7MTW7MTW7MTW7MUW7MUW7MVW7MVW7MV",
  ,
  "W7MVW7MWW7MXW7MXW7MXW7MXW7IXW7IYW7IYW7IZW7IZWrIaWrIaWrIbWrIbWrIcWrIcWrIcWrIdWrIeWrEeWrEeWrEeWrEeWrEfWrEfWrEgWrEgWrEhWrEh",
  ,
  "WrEiWrEiWrEiWrEjWrAjWrAkWrAkWrAkWrAkWrAlWrAlWrAmWrAmWrAmWrAnWrAoWrAoWrApWrApWq8pWa8qWa8qWa8qWa8rWa8rWa8rWa8sWa8sWa8tWa8t",
  ,
  "Wa8tWa8uWa4uWa4vWa4vWa4vWa4vWa4wWa4wWK4xWK4xWK4xWK4yWK4zWK4zWK40WK40WK40WK41WK41WK42WK42WK42WK42WK43WK43WK43WK44WK44V645",
  ,
  "V646V606V606V607V607V608V608V608V608V609V609V60+V60+V60+V60/XJxuW5ttW5ttWpxrWpxrWpxrWZtqWZtqWZtoV5tnV5tnV5tnWJxoV5tnV5tn",
  ,
  "V5tnV5tnV5tnVpxlVpxlVZtkVZtkVJxjVJxjVJphVJphU5tgU5tgU5tgUpxeUpxeUZtdUZtdUZtdUZtdUZtdUZtbT5taT5taT5taTpxZTpxZTZtYTZtYTZtY",
  ,
  "TZtWTZtWTZtWTJxVTJxVTJxVS5tVS5tVSpxSSpxSSpxSSZtRSZtRSZtRSZtRSZtRSJxQSJxQSJxOR5tNR5tNR5tNRpxMRpxMRZtLRZtLRZtLRZtJRZtJQ5tI",
  ,
  "Q5tHQ5tHQ5tHQpxGQpxGQpxEQpxEQpxEQZtDQZtDQZtDQZtDQZtDP5tBP5tBP5tBPZs9PZs9PZs9PZs9PZs9PZs9PZs9PZs9PJo8PJo8O5s7PJo6PJo6PJo6",
  ,
  "PJs5PJs5O5o4O5o4O5o4O5o4O5s5Opo4Opo4Opo4Ops3O5o2O5o2Ops1Ops1Ops1OZk1OZk1OZo0OZo0OZo0O5o0OZo0OpszOZoyOZoyOZoyOZsxOZsxOJow",
  ,
  "OJowOJowOJowN5owN5owNpkvNpkvNpkvW7MTW7MTW7MTW7MUW7MUW7MVW7MVW7MVW7MVW7MWW7MXW7MXW7MXW7MXW7IXW7IYW7IYW7IZW7IZWrIaWrIaWrIb",
  ,
  "WrIbWrIcWrIcWrIcWrIdWrIeWrEeWrEeWrEeWrEeWrEfWrEfWrEgWrEgWrEhWrEhWrEiWrEiWrEiWrEjWrAjWrAkWrAkWrAkWrAkWrAlWrAlWrAmWrAmWrAm",
  ,
  "WrAnWrAoWrAoWrApWrApWq8pWa8qWa8qWa8qWa8rWa8rWa8rWa8sWa8sWa8tWa8tWa8tWa8uWa4uWa4vWa4vWa4vWa4vWa4wWa4wWK4xWK4xWK4xWK4yWK4z",
  ,
  "WK4zWK40WK40WK40WK41WK41WK42WK42WK42WK42WK43WK43WK43WK44WK44V645V646V606V606V607V607V608V608V608V608V609V609V60+V60+V60+",
  ,
  "V60/V6w/W5ttWpxtWpxtWpxtWZtqWZtqWZtqV5tnV5tnV5tnV5tnV5tnV5tnV5tnV5tnV5tnVpxlVpxlVZtkVJxjVJxjVJxjVJphVJphU5tgU5tgU5tgUZtf",
  ,
  "UpxgUZtfUZtfUZtfUZtdUZtdUZtdT5tbT5tbT5tbTpxZTpxZTZtYTZtYTZtYTZtWTZtYTZtYTJxVTJxVTJxVS5tVS5tVSpxSSpxSSpxSSZtRSZtRSZtRSJpQ",
  ,
  "SJpQSJpQSJxQSJxQR5tNR5tNR5tNRpxMRpxMRZtLRZtJRZtJRZtJQ5tIQ5tIQ5tHQ5tHQ5tHQppGQpxGQpxGQpxGQpxGQZtDQZtDQZtDP5tBP5tBP5tBP5tB",
  ,
  "P5tBPZs9PZs9PZs9PZs9PZs9PZs9PJo8PJo8PJo8O5s7O5s7Opo6Opo6Opo6OZs5OZs5O5o4O5o4O5o4O5o4Opo4Opo4Ops3Ops3Ops3OZo2O5o2Ops1OZk1",
  ,
  "OZk1OZk1OZo0OZo0OZo0OZo0OZo0N5oyOJszN5oyN5oyN5oyOZsxOJowOJowN5owN5owN5owN5owNpkvNpkvNpouNpouNpouW7MTW7MTW7MTW7MUW7MUW7MV",
  ,
  "W7MVW7MVW7MVW7MWW7MXW7MXW7MXW7MXW7IXW7IYW7IYW7IZW7IZWrIaWrIaWrIbWrIbWrIcWrIcWrIcWrIdWrIeWrEeWrEeWrEeWrEeWrEfWrEfWrEgWrEg",
  ,
  "WrEhWrEhWrEiWrEiWrEiWrEjWrAjWrAkWrAkWrAkWrAkWrAlWrAlWrAmWrAmWrAmWrAnWrAoWrAoWrApWrApWq8pWa8qWa8qWa8qWa8rWa8rWa8rWa8sWa8s",
  ,
  "Wa8tWa8tWa8tWa8uWa4uWa4vWa4vWa4vWa4vWa4wWa4wWK4xWK4xWK4xWK4yWK4zWK4zWK40WK40WK40WK41WK41WK42WK42WK42WK42WK43WK43WK43WK44",
  ,
  "WK44V645V646V606V606V607V607V608V608V608V608V609V609V60+V60+V60+V60/V6w/V6xAV6xBWpxtWpxtWpxtWZtqWZtqWZtqV5tpV5tnV5tnV5tn",
  ,
  "V5tnV5tnV5tnV5tnV5tnVpxmVpxmVZtkVJxjVJxjVJxjVJphVJphU5tgU5tgU5tgUZtfUpxgUZtfUZtfUZtfUZtfUZtdUZtdT5tbT5tbT5tbTpxZTpxZTZtY",
  ,
  "TZtYTZtYTZtYTZtYTZtYTJxXTJxVTJxVS5tVS5tVSpxUSpxUSpxUSZtTSZtRSZtRSJpQSJpQSJpQSJxQSJxQR5tPR5tPR5tPRpxMRpxMRZtLRZtLRZtLRZtL",
  ,
  "Q5tKQ5tKQ5tHQ5tHQ5tHQpxGQpxGQpxGQpxGQZtFQZtFQZtFP5tBP5tBP5tBP5tBP5tBPZtAPZtAPZtAPZtAPZs/PZs/PJo8PJo8PJo8O5s7O5s7Opo6Opo6",
  ,
  "Opo6OZs5OZs5O5o4O5o4O5o4O5o4Opo4Opo4Ops3Ops3Ops3OZo2OZo2OJs1OZk1OZk1OZk1OZo0OZo0OZo0OZo0OZo0N5oyOJszN5oyN5oyN5oyNpsxNZow",
  ,
  "NZowN5owN5owN5owN5owNpkvNpkvNpouNpouNpouXLMUXLMUXLMUXLMVXLMVXLMWXLMWXLMWXLMWXLMXXLMXXLMXXLMYXLMYXLIYXLIZXLIZXLIaXLIaW7Ib",
  ,
  "W7IbW7IcW7IcW7IdW7IdW7IdW7IeW7IeW7EeW7EeW7EfW7EfW7EgW7EgW7EhW7EhW7EhWrEiWrEjWrEjWrEjWrEkWrAkWrAkWrAkWrAlWrAlWrAmWrAmWrAn",
  ,
  "WrAnWrAnWrAoWrAoWrApWrApWrApWq8qWq8qWq8qWq8rWq8rWq8rWq8sWq8sWq8tWq8uWq8uWq8uWq8vWq4vWq4vWq4vWq4vWa4wWa4xWa4xWa4yWa4yWa4y",
  ,
  "Wa4zWa4zWa40Wa40Wa40Wa41Wa42Wa42Wa42Wa42Wa42Wa43WK43WK44WK44WK45WK45WK46WK46WK07WK07WK07WK08WK08WK08WK08WK09WK09WK0+WK0+",
  ,
  "V60/V60/V60/V6xAV6xBV6xBV6xBWpxtWpxtWZtqWZtqWZtqV5tpV5tnV5tnV5tnV5tnV5tnV5tnV5tnV5tnVpxmVpxmVZtkVJxjVJxjVJxjVJphVJphU5tg",
  ,
  "U5tgU5tgUZtfUpxgUZtfUZtfUZtfUZtfUZtdUZtdT5tbT5tbT5tbTpxZTpxZTZtYTZtYTZtYTZtYTZtYTZtYTJxXTJxVTJxVS5tVS5tVSpxUSpxUSpxUSZtT",
  ,
  "SZtRSZtRSJpQSJpQSJpQSJxQSJxQR5tPR5tPR5tPRpxMRpxMRZtLRZtLRZtLRZtLQ5tKQ5tKQ5tHQ5tHQ5tHQpxGQpxGQpxGQpxGQZtFQZtFQZtFP5tBP5tB",
  ,
  "P5tBP5tBP5tBPZtAPZtAPZtAPZtAPZs/PZs/PJo8PJo8PJo8O5s7O5s7Opo6Opo6Opo6OZs5OZs5O5o4O5o4O5o4O5o4Opo4Opo4Ops3Ops3Ops3OZo2OZo2",
  ,
  "OJs1OZk1OZk1OZk1OZo0OZo0OZo0OZo0OZo0N5oyOJszN5oyN5oyN5oyNpsxNZowNZowN5owN5owN5owN5owNpkvNpkvNpouNpouNpouXbMUXbMUXbMUXbMV",
  ,
  "XbMVXbMWXbMWXbMWXbMWXbMXXbMXXbMXXbMYXbMYXbIYXbIZXbIZXLIaXLIaXLIbXLIbXLIcXLIcXLIdXLIdXLIdXLIeXLIeXLEeXLEeXLEfXLEfXLEgXLEg",
  ,
  "W7EhW7EhW7EhW7EiW7EjW7EjW7EjW7EkW7AkW7AkW7AkW7AlW7AlW7AmW7AmW7AnW7AnW7AnWrAoWrAoWrApWrApWrApWq8qWq8qWq8qWq8rWq8rWq8rWq8s",
  ,
  "Wq8sWq8tWq8uWq8uWq8uWq8vWq4vWq4vWq4vWq4vWq4wWq4xWq4xWq4yWq4yWq4yWq4zWq4zWq40Wq40Wq40Wq41Wa42Wa42Wa42Wa42Wa42Wa43Wa43Wa44",
  ,
  "Wa44Wa45Wa45Wa46Wa46Wa07Wa07Wa07Wa08Wa08WK08WK08WK09WK09WK0+WK0+WK0/WK0/WK0/WKxAWKxBWKxBWKxBWKxBWpxtWZtsWZtqWZtqV5tpV5tp",
  ,
  "V5tpV5tpV5tnV5tnV5tnV5tnV5tnVpxmVpxmVZtkVJxjVJxjVJxjVJpjVJpjU5tgU5tgU5tgUZtfUpxgUZtfUZtfUZtfUZtfUZtdUZtdT5tbT5tbT5tbTpxb",
  ,
  "TpxbTZtYTZtYTZtYTZtYTZtYTZtYTJxXTJxXTJxXS5tVS5tVSpxUSpxUSpxUSZtTSZtRSZtRSJpQSJpQSJpQSJxQSJxQR5tPR5tPR5tPRpxMRpxMRZtLRZtL",
  ,
  "RZtLRZtLQ5tKQ5tKQ5tJQ5tHQ5tHQpxGQpxGQpxGQpxGQZtFQZtFQZtFP5tBP5tBP5tBP5tBP5tBPZtAPZtAPZtAPZtAPZs/PZs/PJo8PJo8PJo8O5s7O5s7",
  ,
  "Opo6Opo6Opo6OZs5OZs5O5o4O5o4O5o4O5o4Opo4Opo4Ops3Ops3Ops3OZo2OZo2OJs1N5k1N5k1N5k1Npo0Npo0Npo0OZo0OZo0N5oyOJszN5oyN5oyN5oy",
  ,
  "NpsxNZowNZowN5owN5owN5owN5owNpkvNpkvNpouNpouNpouXrMUXrMUXrMUXrMVXrMVXrMWXrMWXrMWXrMWXrMXXrMXXrMXXrMYXrMYXrIYXrIZXbIZXbIa",
  ,
  "XbIaXbIbXbIbXbIcXbIcXbIdXbIdXbIdXbIeXbIeXbEeXbEeXbEfXbEfXLEgXLEgXLEhXLEhXLEhXLEiXLEjXLEjXLEjXLEkXLAkXLAkXLAkXLAlXLAlXLAm",
  ,
  "XLAmW7AnW7AnW7AnW7AoW7AoW7ApW7ApW7ApW68qW68qW68qW68rW68rW68rW68sW68sWq8tWq8uWq8uWq8uWq8vWq4vWq4vWq4vWq4vWq4wWq4xWq4xWq4y",
  ,
  "Wq4yWq4yWq4zWq4zWq40Wq40Wq40Wq41Wq42Wq42Wq42Wq42Wq42Wq43Wq43Wq44Wq44Wq45Wq45Wq46Wa46Wa07Wa07Wa07Wa08Wa08Wa08Wa08Wa09Wa09",
  ,
  "Wa0+Wa0+Wa0/Wa0/Wa0/WaxAWKxBWKxBWKxBWKxBWKxBWpxtWZtrWZtrWJxpWJxpWJxpWJxpV5tpV5tnV5tnV5tnV5tnVpxmVpxmVZ1mVJxlVJxlVJxlVJxj",
  ,
  "VJxjU5tiU5tiU5tiUpxgUpxgUZtfUZtfUZtfUZtfUJxdUJxdUJxcUJxcUJxcTpxbTpxbTpxbTpxbTpxbTZtYTZtYTZtYTJxXTJxXTJxXTJxXTJxXSpxUSpxU",
  ,
  "SpxUSpxUSJxSSJxSSJxSSJxSSJxSSJxSSJxSR5tPR5tPR5tPRpxORpxORpxORZtNRZtNRZtNRJxKRJxKQ5tJQ5tJQ5tJQpxIQpxIQpxIQpxIQZtFQZtFQZtF",
  ,
  "P5tEP5tEP5tEP5tDP5tDPZtAPZtAPZtAPZtAPZs/PZs/PZs/PZs/PZs/O5s9O5s9O5s7O5s7O5s7OZs5OZs5OZs5OZs5OZs5OZs5OJo4OJo4N5s3Ops3Ops3",
  ,
  "OZs3OZs3OJs1N5s1N5s1N5s1Npo0Npo0Npo0Npo0Npo0NZszNZszNZwyNZwyNZwyNpsxNZwwNZwwNZowNZowNZowNZowNJsvNJsvM5ouM5ouM5ouX7MUX7MU",
  ,
  "X7MUX7MVX7MVX7MWX7MWX7MWX7MWX7MXX7MXX7MXX7MYX7MYX7IYXrIZXrIZXrIaXrIaXrIbXrIbXrIcXrIcXrIdXrIdXrIdXrIeXrIeXrEeXrEeXrEfXbEf",
  ,
  "XbEgXbEgXbEhXbEhXbEhXbEiXbEjXbEjXbEjXbEkXbAkXbAkXbAkXbAlXbAlXLAmXLAmXLAnXLAnXLAnXLAoXLAoXLApXLApXLApXK8qXK8qXK8qXK8rXK8r",
  ,
  "XK8rW68sW68sW68tW68uW68uW68uW68vW64vW64vW64vW64vW64wW64xW64xWq4yWq4yWq4yWq4zWq4zWq40Wq40Wq40Wq41Wq42Wq42Wq42Wq42Wq42Wq43",
  ,
  "Wq43Wq44Wq44Wq45Wq45Wq46Wq46Wq07Wq07Wq07Wq08Wq08Wq08Wq08Wq09Wq09Wq0+Wa0+Wa0/Wa0/Wa0/WaxAWaxBWaxBWaxBWaxBWaxBWaxCWZtrWJxp",
  ,
  "WJxpV5tpV5tpV5tpV5tpV5tpV5tpVpxoVpxoVZtmVZ1mVJxlVJxlVJxlVJxjVJxjU5tiU5tiUpxiUpxiUZtfUZtfUZtfUZtfUZtfUZtfUJxeUJxeUJxeTpxb",
  ,
  "TpxbTpxbTpxbTZtYTZtYTZtYTZtYTZtYTJxXTJxXS5tXS5tXTJxXSpxWSpxUSpxUSpxUSJxSSJxSSJxSSJxSSJxSSJxSSJxSR5tPRpxORpxORpxORpxORpxO",
  ,
  "RZtNRZtNRZtNRJxKRJxKQ5tJQpxIQpxIQpxIQpxIQZtHQZtFQZtFQZtFQZtFP5tEP5tDP5tDP5tDPZtCPZtCPZtCPZtAPZtAPZs/PZs/PJo+PZs/PZs/O5s9",
  ,
  "O5s9O5s9OZs5OZs5OZs5OZs5OZs5OZs5OZs5OZs5OJo4N5s3N5s3OZs3OZs3OZs3OJs1OJs1N5s1N5s1N5s1Npo0Npo0Npo0NZszNZszNZszN5oyN5oyNpsx",
  ,
  "NpsxNpsxNZwwNZowNZowNJsvNJsvNJsvNJsvM5ouM5ouM5ouM5ouM5ouX7MUX7MUX7MUX7MVX7MVX7MWX7MWX7MWX7MWX7MXX7MXX7MXX7MYX7MYX7IYXrIZ",
  ,
  "XrIZXrIaXrIaXrIbXrIbXrIcXrIcXrIdXrIdXrIdXrIeXrIeXrEeXrEeXrEfXbEfXbEgXbEgXbEhXbEhXbEhXbEiXbEjXbEjXbEjXbEkXbAkXbAkXbAkXbAl",
  ,
  "XbAlXLAmXLAmXLAnXLAnXLAnXLAoXLAoXLApXLApXLApXK8qXK8qXK8qXK8rXK8rXK8rW68sW68sW68tW68uW68uW68uW68vW64vW64vW64vW64vW64wW64x",
  ,
  "W64xWq4yWq4yWq4yWq4zWq4zWq40Wq40Wq40Wq41Wq42Wq42Wq42Wq42Wq42Wq43Wq43Wq44Wq44Wq45Wq45Wq46Wq46Wq07Wq07Wq07Wq08Wq08Wq08Wq08",
  ,
  "Wq09Wq09Wq0+Wa0+Wa0/Wa0/Wa0/WaxAWaxBWaxBWaxBWaxBWaxBWaxCWaxCWJxrWJxrV5tpV5tpV5tpV5tpV5tpV5tpVpxoVpxoVZtmVZ1mVJxlVJxlVJxl",
  ,
  "VJxlVJxlU5tiU5tiUpxiUpxiUZtfUZtfUZtfUZtfUZtfUZtfUJxeUJxeUJxeTpxbTpxbTpxbTpxbTZtaTZtaTZtaTZtaTZtaTJxXTJxXS5tXS5tXTJxXSpxW",
  ,
  "SpxUSpxUSpxUSJxSSJxSSJxSSJxSSJxSSJxSSJxSR5tRRpxQRpxQRpxQRpxORpxORZtNRZtNRZtNRJxMRJxMQ5tJQpxIQpxIQpxIQpxIQZtHQZtHQZtHQZtH",
  ,
  "QZtHP5tEP5tDP5tDP5tDPZtCPZtCPZtCPZtCPZtCPZs/PZs/PJo+PZs/PZs/O5s9O5s9O5s9OZs8OZs8OZs8OZs5OZs5OZs5OZs5OZs5OJo4N5s3N5s3N5s3",
  ,
  "N5s3N5s3NZs1NZs1N5s1N5s1N5s1Npo0Npo0Npo0NZszNZszNZszNJoyNJoyNJsxNJsxNJsxM5wwNZowNZowNJsvNJsvNJsvNJsvM5ouM5ouM5ouM5ouM5ou",
  ,
  "YLIVYLIVYLIVYLIWYLIWYLIXYLIXYLIXYLIXYLIXYLIYYLIYYLIZYLIZYLIZX7EaX7EaX7EbX7EbX7EbX7EcX7EdX7EdX7EeX7EeX7EeX7EeX7EeX7EfX7Ef",
  ,
  "XrAgXrAgXrAhXrAhXrAiXrAiXrAiXrAjXrAjXrAkXrAkXrAkXrAkXrAlXa8lXa8mXa8mXa8mXa8nXa8nXa8oXa8oXa8pXa8pXa8qXa8qXa8qXa8qXa8qXK4r",
  ,
  "XK4sXK4sXK4sXK4tXK4tXK4uXK4uXK4uXK4vXK4vXK4vXK4wXK4wXK4wW64xW64xW64yW64yW64yW64zW640W640W641W641W641W642W642W642Wq02Wq02",
  ,
  "Wq03Wq04Wq04Wq05Wq05Wq05Wq06Wq06Wq07Wq07Wq07Wq08Wq08Wq08Wqw9Wqw9Wqw9Wqw+Wqw+Wqw/WqxAWqxAWqxAWqxBWqxBWqxBWqxBWqxBWqxCWatC",
  ,
  "WatDWatEWJxrV5tpV5tpV5tpV5tpV5tpV5tpVpxoVpxoVZtmVZ1mVJxlVJxlVJxlVJxlVJxlU5tiU5tiUpxiUpxiUZtfUZtfUZtfUZtfUZtfUZtfUJxeUJxe",
  ,
  "UJxeTpxbTpxbTpxbTpxbTZtaTZtaTZtaTZtaTZtaTJxXTJxXS5tXS5tXTJxXSpxWSpxUSpxUSpxUSJxSSJxSSJxSSJxSSJxSSJxSSJxSR5tRRpxQRpxQRpxQ",
  ,
  "RpxORpxORZtNRZtNRZtNRJxMRJxMQ5tJQpxIQpxIQpxIQpxIQZtHQZtHQZtHQZtHQZtHP5tEP5tDP5tDP5tDPZtCPZtCPZtCPZtCPZtCPZs/PZs/PJo+PZs/",
  ,
  "PZs/O5s9O5s9O5s9OZs8OZs8OZs8OZs5OZs5OZs5OZs5OZs5OJo4N5s3N5s3N5s3N5s3N5s3NZs1NZs1N5s1N5s1N5s1Npo0Npo0Npo0NZszNZszNZszNJoy",
  ,
  "NJoyNJsxNJsxNJsxM5wwNZowNZowNJsvNJsvNJsvNJsvM5ouM5ouM5ouM5ouM5ouYLIVYLIVYLIVYLIWYLIWYLIXYLIXYLIXYLIXYLIXYLIYYLIYYLIZYLIZ",
  ,
  "YLIZYLEaYLEaYLEbYLEbYLEbYLEcYLEdYLEdYLEeYLEeYLEeYLEeYLEeX7EfX7EfX7AgX7AgX7AhX7AhX7AiX7AiX7AiX7AjX7AjX7AkX7AkX7AkXrAkXrAl",
  ,
  "Xq8lXq8mXq8mXq8mXq8nXq8nXq8oXq8oXq8pXq8pXq8qXq8qXq8qXa8qXa8qXa4rXa4sXa4sXa4sXa4tXa4tXa4uXa4uXa4uXa4vXa4vXK4vXK4wXK4wXK4w",
  ,
  "XK4xXK4xXK4yXK4yXK4yXK4zXK40XK40XK41XK41XK41W642W642W642W602W602W603W604W604W605W605W605W606W606W607Wq07Wq07Wq08Wq08Wq08",
  ,
  "Wqw9Wqw9Wqw9Wqw+Wqw+Wqw/WqxAWqxAWqxAWqxBWqxBWqxBWqxBWqxBWqxCWqtCWqtDWqtEWqtEV5tpV5tpV5tpV5tpV5tpV5tpVpxoVpxoVZtmVZ1mVJxl",
  ,
  "VJxlVJxlVJxlVJxlU5tiU5tiUpxiUpxiUZtfUZtfUZtfUZtfUZtfUZtfUJxeUJxeUJxeTpxbTpxbTpxbTpxbTZtaTZtaTZtaTZtaTZtaTJxXTJxXS5tXS5tX",
  ,
  "TJxXSpxWSpxUSpxUSpxUSJxSSJxSSJxSSJxSSJxSSJxSSJxSR5tRRpxQRpxQRpxQRpxORpxORZtNRZtNRZtNRJxMRJxMQ5tJQpxIQpxIQpxIQpxIQZtHQZtH",
  ,
  "QZtHQZtHQZtHP5tEP5tDP5tDP5tDPZtCPZtCPZtCPZtCPZtCPZs/PZs/PJo+PZs/PZs/O5s9O5s9O5s9OZs8OZs8OZs8OZs5OZs5OZs5OZs5OZs5OJo4N5s3",
  ,
  "N5s3N5s3N5s3N5s3NZs1NZs1N5s1N5s1N5s1Npo0Npo0Npo0NZszNZszNZszNJoyNJoyNJsxNJsxNJsxM5wwNZowNZowNJsvNJsvNJsvNJsvM5ouM5ouM5ou",
  ,
  "M5ouM5ouYLIVYLIVYLIVYLIWYLIWYLIXYLIXYLIXYLIXYLIXYLIYYLIYYLIZYLIZYLIZYLEaYLEaYLEbYLEbYLEbYLEcYLEdYLEdYLEeYLEeYLEeYLEeYLEe",
  ,
  "X7EfX7EfX7AgX7AgX7AhX7AhX7AiX7AiX7AiX7AjX7AjX7AkX7AkX7AkXrAkXrAlXq8lXq8mXq8mXq8mXq8nXq8nXq8oXq8oXq8pXq8pXq8qXq8qXq8qXa8q",
  ,
  "Xa8qXa4rXa4sXa4sXa4sXa4tXa4tXa4uXa4uXa4uXa4vXa4vXK4vXK4wXK4wXK4wXK4xXK4xXK4yXK4yXK4yXK4zXK40XK40XK41XK41XK41W642W642W642",
  ,
  "W602W602W603W604W604W605W605W605W606W606W607Wq07Wq07Wq08Wq08Wq08Wqw9Wqw9Wqw9Wqw+Wqw+Wqw/WqxAWqxAWqxAWqxBWqxBWqxBWqxBWqxB",
  ,
  "WqxCWqtCWqtDWqtEWqtEWqtEV5tpV5tpV5tpV5tpV5tpVpxoVpxoVZtnVZ1oVJxlVJxlVJxlVJxlVJxlU5tiU5tiUpxiUpxiUZtgUZtgUZtgUZtfUZtfUZtf",
  ,
  "UJxeUJxeUJxeTpxdTpxdTpxdTpxbTZtaTZtaTZtaTZtaTZtaTJxXTJxXS5tXS5tXTJxXSpxWSpxWSpxWSpxWSJxSSJxSSJxSSJxSSJxSSJxSSJxSR5tRRpxQ",
  ,
  "RpxQRpxQRpxORpxORZtNRZtNRZtNRJxMRJxMQ5tLQpxLQpxLQpxLQpxIQZtHQZtHQZtHQZtHQZtHP5tGP5tDP5tDP5tDPZtCPZtCPZtCPZtCPZtCPZtBPZtB",
  ,
  "PJpAPZtBPZtBO5tAO5s9O5s9OZs8OZs8OZs8OZs7OZs7OZs7OZs7OZs7OJo6N5s3N5s3N5s3N5s3N5s3NZs1NZs1NZs1NZs1NZs1NJo0Npo0Npo0NZszNZsz",
  ,
  "NZszNJoyNJoyNJsxNJsxNJsxM5wwNZowNZowNJsvNJsvNJsvNJsvM5ouM5ouM5ouM5ouM5ouYbIVYbIVYbIVYbIWYbIWYbIXYbIXYbIXYbIXYbIXYbIYYbIY",
  ,
  "YbIZYbIZYLIZYLEaYLEaYLEbYLEbYLEbYLEcYLEdYLEdYLEeYLEeYLEeYLEeYLEeYLEfYLEfYLAgYLAgYLAhYLAhYLAiYLAiYLAiYLAjYLAjYLAkYLAkX7Ak",
  ,
  "X7AkX7AlX68lX68mX68mX68mX68nX68nX68oX68oX68pX68pXq8qXq8qXq8qXq8qXq8qXq4rXq4sXq4sXq4sXq4tXq4tXq4uXq4uXq4uXa4vXa4vXa4vXa4w",
  ,
  "Xa4wXa4wXa4xXa4xXa4yXa4yXa4yXa4zXa40XK40XK41XK41XK41XK42XK42XK42XK02XK02XK03XK04XK04XK05XK05W605W606W606W607W607W607W608",
  ,
  "W608W608W6w9W6w9W6w9W6w+Wqw+Wqw/WqxAWqxAWqxAWqxBWqxBWqxBWqxBWqxBWqxCWqtCWqtDWqtEWqtEWqtEWqtFV5tqV5tqVpxoVpxoVZtnVZtnVZtn",
  ,
  "VJxlVJxlVJxlVJxlVJxlU5tkU5tkUpxiUZtgUZtgUZtgUZtgUZtgUZtfUZtfUZtfUJxeUJxeTpxdTpxdTpxdTpxbTZtaTZtaTZtaTZtaTZtaTJxZS5tYS5tY",
  ,
  "SpxWSpxWSpxWSpxWSpxWSJxUSJxUSJxUSJxSSJxSSJxSSJxSR5tRR5tRRpxQRpxQRZtNRZtNRpxORZtNRJxMRJxMRJxMQ5tLQ5tLQpxLQpxLQpxLQpxLQZtH",
  ,
  "QZtHQZtHQZtHP5tGP5tGP5tFP5tDPZtCPZtCPZtCPZtCPZtBPZtBPZtBPJpAPJpAO5tAO5tAO5tAO5s9O5s9OZs8OZs7OZs7OZs7OZs7OZs7OJo6OJo6OJo6",
  ,
  "N5s3N5s3Npo2NZs1NZs1NZs1NZs1NZs1NJo0NJo0NJo0NJo0NJo0NZszNJoyNJoyNJoyNJsxNJsxM5wwM5wwM5wwMpowMpowMpsvM5ouM5ouM5ouM5ouM5ou",
  ,
  "M5ouMpstMpstMpstYbIVYbIVYbIVYbIWYbIWYbIXYbIXYbIXYbIXYbIXYbIYYbIYYbIZYbIZYLIZYLEaYLEaYLEbYLEbYLEbYLEcYLEdYLEdYLEeYLEeYLEe",
  ,
  "YLEeYLEeYLEfYLEfYLAgYLAgYLAhYLAhYLAiYLAiYLAiYLAjYLAjYLAkYLAkX7AkX7AkX7AlX68lX68mX68mX68mX68nX68nX68oX68oX68pX68pXq8qXq8q",
  ,
  "Xq8qXq8qXq8qXq4rXq4sXq4sXq4sXq4tXq4tXq4uXq4uXq4uXa4vXa4vXa4vXa4wXa4wXa4wXa4xXa4xXa4yXa4yXa4yXa4zXa40XK40XK41XK41XK41XK42",
  ,
  "XK42XK42XK02XK02XK03XK04XK04XK05XK05W605W606W606W607W607W607W608W608W608W6w9W6w9W6w9W6w+Wqw+Wqw/WqxAWqxAWqxAWqxBWqxBWqxB",
  ,
  "WqxBWqxBWqxCWqtCWqtDWqtEWqtEWqtEWqtFWqtFV51rVpxqVpxqVZ1oVZ1oVZ1oVJxnVJxnVJxnVJxnVJxnU5tkU51kUpxjUZ1hUZ1hUZ1hUZ1hUZ1hUJxg",
  ,
  "UJxgUJxgUJxgUJxeTpxdTpxdTpxdTpxcTZ1cTZ1cTZ1cTZ1cTZ1cTJxZTJxZTJxZSpxWSpxWSpxWSpxWSpxWSJxUSJxUSZ1VSJxUSJxUSJxUSJxUR51RR51R",
  ,
  "RpxQRpxQRpxQRpxQRpxQRZtPRJxMRJxMRJxMQ5tLQ5tLQpxLQpxLQpxLQpxLQZtHQZtHQZtHQZtHP5tGP5tGP5tFP5tFPpxFPpxFPpxFPpxFPZtEPZtEPZtE",
  ,
  "PZtBPZtBO5tAO5tAO5tAO5s/O5s/Opw/OZs7OZs7OZs7OZs7OZs7OJw6OJw6OJw6N5s6N5s6N5s5NZs4Npw4Npw4NZs1NZs1NJw0NJw0NJw0NJw0NJw0M5sz",
  ,
  "MpwyMpwyMpwyMZsxMZsxMJwwMJwwMJwwM5wwM5wwMpsvMZwuMZwuMZwuMZwuMZwuMZwuMJstMJstMJstYrIWYrIWYrIWYrIXYrIXYrIXYrIXYrIXYrIXYrIY",
  ,
  "YrIZYrIZYbIaYbIaYbIaYbEbYbEbYbEcYbEcYbEcYbEdYbEeYbEeYbEeYbEeYbEeYLEfYLEfYLEgYLEgYLAgYLAhYLAiYLAiYLAjYLAjYLAjYLAkYLAkYLAk",
  ,
  "YLAkYLAkYLAlYLAmYK8mYK8nYK8nYK8nYK8oYK8oYK8pYK8pX68pX68qX68qX68qX68qX68rX68rX64sX64sX64tX64tX64tX64uXq4vXq4vXq4vXq4vXq4v",
  ,
  "Xq4wXq4wXq4xXq4xXq4xXq4yXq4zXa4zXa4zXa40Xa40Xa41Xa41Xa42Xa42Xa42Xa42Xa43Xa03Xa03Xa04XK04XK05XK05XK05XK06XK06XK07XK08XK08",
  ,
  "XK08XK08XK08XK09W6w9W6w9W6w+W6w/W6w/W6xAW6xAW6xAW6xBW6xBW6xBW6xBW6xBWqxCWqxDWqtDWqtEWqtEWqtEWqtFWqtFWqtGWqtGVpxqVpxqVZ1o",
  ,
  "VZ1oVZ1oVJxnVJxnVJxnVJxnVJxnU5tkU51kUpxjUZ1hUZ1hUZ1hUZ1hUZ1hUJxgUJxgUJxgUJxgUJxeTpxdTpxdTpxdTpxcTZ1cTZ1cTZ1cTZ1cTZ1cTJxZ",
  ,
  "TJxZTJxZSpxWSpxWSpxWSpxWSpxWSJxUSJxUSZ1VSJxUSJxUSJxUSJxUR51RR51RRpxQRpxQRpxQRpxQRpxQRZtPRJxMRJxMRJxMQ5tLQ5tLQpxLQpxLQpxL",
  ,
  "QpxLQZtHQZtHQZtHQZtHP5tGP5tGP5tFP5tFPpxFPpxFPpxFPpxFPZtEPZtEPZtEPZtBPZtBO5tAO5tAO5tAO5s/O5s/Opw/OZs7OZs7OZs7OZs7OZs7OJw6",
  ,
  "OJw6OJw6N5s6N5s6N5s5NZs4Npw4Npw4NZs1NZs1NJw0NJw0NJw0NJw0NJw0M5szMpwyMpwyMpwyMZsxMZsxMJwwMJwwMJwwM5wwM5wwMpsvMZwuMZwuMZwu",
  ,
  "MZwuMZwuMZwuMJstMJstMJstY7IWY7IWY7IWY7IXY7IXY7IXY7IXY7IXY7IXY7IYY7IZY7IZYrIaYrIaYrIaYrEbYrEbYrEcYrEcYrEcYrEdYrEeYrEeYrEe",
  ,
  "YrEeYbEeYbEfYbEfYbEgYbEgYbAgYbAhYbAiYbAiYbAjYbAjYbAjYLAkYLAkYLAkYLAkYLAkYLAlYLAmYK8mYK8nYK8nYK8nYK8oYK8oYK8pYK8pYK8pYK8q",
  ,
  "YK8qYK8qYK8qYK8rYK8rYK4sYK4sYK4tYK4tX64tX64uX64vX64vX64vX64vX64vX64wX64wX64xX64xX64xXq4yXq4zXq4zXq4zXq40Xq40Xq41Xq41Xq42",
  ,
  "Xq42Xq42Xq42Xa43Xa03Xa03Xa04Xa04Xa05Xa05Xa05Xa06Xa06Xa07Xa08XK08XK08XK08XK08XK09XKw9XKw9XKw+XKw/XKw/XKxAXKxAXKxAW6xBW6xB",
  ,
  "W6xBW6xBW6xBW6xCW6xDW6tDW6tEW6tEW6tEW6tFW6tFWqtGWqtGVpxqVpxqVZ1qVZ1qVZ1qVJxnVJxnVJxnVJxnVJxnU5tkU51kUpxjUZ1jUZ1jUZ1jUZ1j",
  ,
  "UZ1jUJxgUJxgUJxgUJxgUJxgTpxdTpxdTpxdTpxcTZ1cTZ1cTZ1cTZ1cTZ1cTJxZTJxZTJxZSpxXSpxXSpxXSpxXSpxXSJxUSJxUSZ1VSJxUSJxUSJxUSJxU",
  ,
  "R51TR51TRpxQRpxQRpxQRpxQRpxQRZtPRJxMRJxMRJxMQ5tLQ5tLQpxLQpxLQpxLQpxLQZtKQZtJQZtHQZtHP5tGP5tGP5tFP5tFPpxFPpxFPpxFPpxFPZtE",
  ,
  "PZtEPZtEPZtBPZtBO5tAO5tAO5tAO5s/O5s/Opw/OZs+OZs+OZs+OZs+OZs+OJw6OJw6OJw6N5s6N5s6N5s5NZs4Npw4Npw4NZs3NZs3NJw3NJw0NJw0NJw0",
  ,
  "NJw0M5szMpwyMpwyMpwyMZsxMZsxMJwwMJwwMJwwM5wwM5wwMpsvMZwuMZwuMZwuMZwuMZwuMZwuMJstMJstMJstZLIWZLIWZLIWZLIXZLIXZLIXZLIXZLIX",
  ,
  "ZLIXZLIYZLIZY7IZY7IaY7IaY7IaY7EbY7EbY7EcY7EcY7EcY7EdY7EeY7EeYrEeYrEeYrEeYrEfYrEfYrEgYrEgYrAgYrAhYrAiYrAiYrAjYrAjYbAjYbAk",
  ,
  "YbAkYbAkYbAkYbAkYbAlYbAmYa8mYa8nYa8nYa8nYK8oYK8oYK8pYK8pYK8pYK8qYK8qYK8qYK8qYK8rYK8rYK4sYK4sYK4tYK4tYK4tYK4uYK4vYK4vYK4v",
  ,
  "YK4vYK4vYK4wX64wX64xX64xX64xX64yX64zX64zX64zX640X640X641X641Xq42Xq42Xq42Xq42Xq43Xq03Xq03Xq04Xq04Xq05Xq05Xq05Xq06Xa06Xa07",
  ,
  "Xa08Xa08Xa08Xa08Xa08Xa09Xaw9Xaw9Xaw+Xaw/XKw/XKxAXKxAXKxAXKxBXKxBXKxBXKxBXKxBXKxCXKxDXKtDW6tEW6tEW6tEW6tFW6tFW6tGW6tGW6tG",
  ,
  "W6tHVZ1qVZ1qVZ1qVJxnVJxnVJxnVJxnVJxnU5tlU51mUpxjUZ1jUZ1jUZ1jUZ1jUZ1jUJxgUJxgUJxgUJxgUJxgTpxfTpxfTpxfTpxcTZ1cTZ1cTZ1cTZ1c",
  ,
  "TZ1cTJxbTJxZTJxZSpxXSpxXSpxXSpxXSpxXSJxUSJxUSZ1VSJxUSJxUSJxUSJxUR51TR51TRpxSRpxSRpxQRpxQRpxQRZtPRJxORJxORJxOQ5tLQ5tLQpxL",
  ,
  "QpxLQpxLQpxLQZtKQZtJQZtJQZtJP5tGP5tGP5tFP5tFPpxFPpxFPpxFPpxFPZtEPZtEPZtEPZtBPZtBO5tAO5tAO5tAO5s/O5s/Opw/OZs+OZs+OZs+OZs+",
  ,
  "OZs+OJw9OJw9OJw9N5s6N5s6N5s5NZs4Npw4Npw4NZs3NZs3NJw3NJw3NJw3NJw3NJw3M5szMpwyMpwyMpwyMZsxMZsxMJwwMJwwMJwwMJwwMJwwL5svMZwu",
  ,
  "MZwuMZwuMZwuMZwuMZwuMJstMJstMJstZLIWZLIWZLIWZLIXZLIXZLIXZLIXZLIXZLIXZLIYZLIZY7IZY7IaY7IaY7IaY7EbY7EbY7EcY7EcY7EcY7EdY7Ee",
  ,
  "Y7EeYrEeYrEeYrEeYrEfYrEfYrEgYrEgYrAgYrAhYrAiYrAiYrAjYrAjYbAjYbAkYbAkYbAkYbAkYbAkYbAlYbAmYa8mYa8nYa8nYa8nYK8oYK8oYK8pYK8p",
  ,
  "YK8pYK8qYK8qYK8qYK8qYK8rYK8rYK4sYK4sYK4tYK4tYK4tYK4uYK4vYK4vYK4vYK4vYK4vYK4wX64wX64xX64xX64xX64yX64zX64zX64zX640X640X641",
  ,
  "X641Xq42Xq42Xq42Xq42Xq43Xq03Xq03Xq04Xq04Xq05Xq05Xq05Xq06Xa06Xa07Xa08Xa08Xa08Xa08Xa08Xa09Xaw9Xaw9Xaw+Xaw/XKw/XKxAXKxAXKxA",
  ,
  "XKxBXKxBXKxBXKxBXKxBXKxCXKxDXKtDW6tEW6tEW6tEW6tFW6tFW6tGW6tGW6tGW6tHW6tIVZ1qVJxnVJxnVJxnVJxnVJxnU5tlUpxjUpxjUZ1jUZ1jUZ1j",
  ,
  "UZ1jUZ1jUJxiUJxiUJxiUJxgTpxfTpxfTpxfTpxfTpxfTZ1cTZ1cTZ1cTJxbTJxbTJxbTJxbTJxbSpxZSpxXSpxXSpxXSpxXSJxWSJxUSJxUSJxWSJxWSJxW",
  ,
  "R51TR51TR51TRpxSRpxSRpxQRZtPRZtPRZtPRJxORJxOQ5tNQ5tNQ5tNQpxNQpxNQpxNQZtKQZtKQZtJQZtJP5tIP5tIP5tIP5tFPpxFPpxFPpxFPpxFPpxF",
  ,
  "PZtEPZtEPZtDPZtDO5tCO5tCO5s/O5s/O5s/OZs+Opw/OZs+OZs+OZs+OZs+OJw9OJw9N5s6N5s6N5s6N5s5N5s5NZs4NZs4NZs3NZs3NJw3NJw3NJw3NJw3",
  ,
  "NJw3M5s1M5s1Mpw1MZsxMZsxMZsxMJwwMJwwMJwwMJwwMJwwL5svL5svLpwuLpwuLpwuLpwuLpwuLZstLZstL5stL5stL5stZbEWZbEWZbEWZbEXZbEXZbEX",
  ,
  "ZbEXZbEXZbEXZbEYZbEZZLEZZLEaZLEaZLEaZLAbZLAbZLAcZLAcZLAcZLAdZLAeY7AeY7AeY7AeY7AeY7AfY7AfY7AgY7AgY7AgY68hY68iY68iYq8jYq8j",
  ,
  "Yq8jYq8kYq8kYq8kYq8kYq8kYq8lYq8mYq8mYa8nYa8nYa4nYa4oYa4oYa4pYa4pYa4pYa4qYa4qYa4qYa4qYa4rYK4rYK4sYK4sYK4tYK4tYK4tYK4uYK4v",
  ,
  "YK4vYK4vYK4vYK4vYK4wYK4wYK4xYK4xYK4xYK4yYK4zYK0zYK0zYK00YK00X601X601X602X602X602X602X603X603X603X604X604Xq05Xqw5Xqw5Xqw6",
  ,
  "Xqw6Xqw7Xqw8Xqw8Xqw8Xqw8Xqw8Xqw9Xaw9Xaw9Xaw+Xaw/Xaw/XatAXatAXatAXatBXatBXatBXKtBXKtBXKtCXKtDXKtDXKtEXKtEXKtEXKtFXKtFXKpG",
  ,
  "W6pGW6pGW6pHW6pIW6pIVJxnVJxnVJxnVJxnVJxnU5tlUpxjUpxjUZ1jUZ1jUZ1jUZ1jUZ1jUJxiUJxiUJxiUJxgTpxfTpxfTpxfTpxfTpxfTZ1cTZ1cTZ1c",
  ,
  "TJxbTJxbTJxbTJxbTJxbSpxZSpxXSpxXSpxXSpxXSJxWSJxUSJxUSJxWSJxWSJxWR51TR51TR51TRpxSRpxSRpxQRZtPRZtPRZtPRJxORJxOQ5tNQ5tNQ5tN",
  ,
  "QpxNQpxNQpxNQZtKQZtKQZtJQZtJP5tIP5tIP5tIP5tFPpxFPpxFPpxFPpxFPpxFPZtEPZtEPZtDPZtDO5tCO5tCO5s/O5s/O5s/OZs+Opw/OZs+OZs+OZs+",
  ,
  "OZs+OJw9OJw9N5s6N5s6N5s6N5s5N5s5NZs4NZs4NZs3NZs3NJw3NJw3NJw3NJw3NJw3M5s1M5s1Mpw1MZsxMZsxMZsxMJwwMJwwMJwwMJwwMJwwL5svL5sv",
  ,
  "LpwuLpwuLpwuLpwuLpwuLZstLZstL5stL5stL5stZrEXZrEXZrEXZrEXZrEXZrEYZrEYZrEYZrEYZrEZZrEZZbEaZbEbZbEbZbEbZbAcZbAcZbAdZbAdZbAd",
  ,
  "ZbAeZbAeZLAeZLAfZLAfZLAfZLAgZLAgZLAhZLAhZLAhZK8iZK8iY68jY68kY68kY68kY68kY68kY68lY68lY68lY68mY68mYq8nYq8oYq8oYq4oYq4pYq4p",
  ,
  "Yq4qYq4qYq4qYq4qYq4qYa4rYa4rYa4rYa4sYa4tYa4tYa4uYa4uYa4uYa4vYa4vYK4vYK4vYK4vYK4wYK4xYK4xYK4yYK4yYK4yYK4zYK4zYK00YK00YK00",
  ,
  "YK01YK02YK02YK02YK02YK02YK03YK03X604X604X604X605X606X6w6X6w6X6w7X6w7X6w8X6w8Xqw8Xqw8Xqw8Xqw9Xqw+Xqw+Xqw+Xqw/Xqw/XqxAXqtA",
  ,
  "XqtBXqtBXatBXatBXatBXatCXatCXatDXatDXatEXatEXatFXatFXKtFXKtGXKpGXKpHXKpHXKpIXKpIXKpIXKpIVJxnVJxnVJxnVJxnU5tlUpxjUpxjUZ1j",
  ,
  "UZ1jUZ1jUZ1jUZ1jUJxiUJxiUJxiUJxgTpxfTpxfTpxfTpxfTpxfTZ1eTZ1eTZ1eTJxbTJxbTJxbTJxbTJxbSpxZSpxZSpxZSpxXSpxXSJxWSJxWSJxWSJxW",
  ,
  "SJxWSJxWR51TR51TR51TRpxSRpxSRpxSRZtRRZtRRZtRRJxORJxOQ5tNQ5tNQ5tNQpxNQpxNQpxNQZtKQZtKQZtJQZtJP5tIP5tIP5tIP5tIPpxHPpxHPpxF",
  ,
  "PpxFPpxFPZtEPZtEPZtDPZtDO5tCO5tCO5tCO5tCO5tCOZs+OpxBOZs+OZs+OZs+OZs+OJw9OJw9N5s8N5s8N5s8N5s7N5s7NZs4NZs4NZs3NZs3NJw3NJw3",
  ,
  "NJw3NJw3NJw3M5s1M5s1Mpw1MZsxMZsxMZsxMJwwMJwwMJwwMJwwMJwwL5svL5svLpwuLpwuLpwuLpwuLpwuLZstLZstLZstLZstLZstZ7EXZ7EXZ7EXZ7EX",
  ,
  "Z7EXZ7EYZ7EYZ7EYZ7EYZ7EZZrEZZrEaZrEbZrEbZrEbZrAcZrAcZrAdZrAdZrAdZrAeZbAeZbAeZbAfZbAfZbAfZbAgZbAgZbAhZbAhZbAhZa8iZK8iZK8j",
  ,
  "ZK8kZK8kZK8kZK8kZK8kZK8lZK8lZK8lZK8mY68mY68nY68oY68oY64oY64pY64pY64qY64qY64qYq4qYq4qYq4rYq4rYq4rYq4sYq4tYq4tYq4uYq4uYq4u",
  ,
  "Ya4vYa4vYa4vYa4vYa4vYa4wYa4xYa4xYa4yYa4yYa4yYK4zYK4zYK00YK00YK00YK01YK02YK02YK02YK02YK02YK03YK03YK04YK04YK04YK05YK06YKw6",
  ,
  "YKw6YKw7YKw7X6w8X6w8X6w8X6w8X6w8X6w9X6w+X6w+X6w+X6w/Xqw/XqxAXqtAXqtBXqtBXqtBXqtBXqtBXqtCXqtCXqtDXatDXatEXatEXatFXatFXatF",
  ,
  "XatGXapGXapHXapHXapIXKpIXKpIXKpIXKpIVJxnVJxnVJxnU5tlUpxjUpxjUZ1jUZ1jUZ1jUZ1jUZ1jUJxiUJxiUJxiUJxgTpxfTpxfTpxfTpxfTpxfTZ1e",
  ,
  "TZ1eTZ1eTJxbTJxbTJxbTJxbTJxbSpxZSpxZSpxZSpxXSpxXSJxWSJxWSJxWSJxWSJxWSJxWR51TR51TR51TRpxSRpxSRpxSRZtRRZtRRZtRRJxORJxOQ5tN",
  ,
  "Q5tNQ5tNQpxNQpxNQpxNQZtKQZtKQZtJQZtJP5tIP5tIP5tIP5tIPpxHPpxHPpxFPpxFPpxFPZtEPZtEPZtDPZtDO5tCO5tCO5tCO5tCO5tCOZs+OpxBOZs+",
  ,
  "OZs+OZs+OZs+OJw9OJw9N5s8N5s8N5s8N5s7N5s7NZs4NZs4NZs3NZs3NJw3NJw3NJw3NJw3NJw3M5s1M5s1Mpw1MZsxMZsxMZsxMJwwMJwwMJwwMJwwMJww",
  ,
  "L5svL5svLpwuLpwuLpwuLpwuLpwuLZstLZstLZstLZstLZstZ7EXZ7EXZ7EXZ7EXZ7EXZ7EYZ7EYZ7EYZ7EYZ7EZZrEZZrEaZrEbZrEbZrEbZrAcZrAcZrAd",
  ,
  "ZrAdZrAdZrAeZbAeZbAeZbAfZbAfZbAfZbAgZbAgZbAhZbAhZbAhZa8iZK8iZK8jZK8kZK8kZK8kZK8kZK8kZK8lZK8lZK8lZK8mY68mY68nY68oY68oY64o",
  ,
  "Y64pY64pY64qY64qY64qYq4qYq4qYq4rYq4rYq4rYq4sYq4tYq4tYq4uYq4uYq4uYa4vYa4vYa4vYa4vYa4vYa4wYa4xYa4xYa4yYa4yYa4yYK4zYK4zYK00",
  ,
  "YK00YK00YK01YK02YK02YK02YK02YK02YK03YK03YK04YK04YK04YK05YK06YKw6YKw6YKw7YKw7X6w8X6w8X6w8X6w8X6w8X6w9X6w+X6w+X6w+X6w/Xqw/",
  ,
  "XqxAXqtAXqtBXqtBXqtBXqtBXqtBXqtCXqtCXqtDXatDXatEXatEXatFXatFXatFXatGXapGXapHXapHXapIXKpIXKpIXKpIXKpIXKpIVJxnVJxnU5tlUpxl",
  ,
  "UpxjUZ1jUZ1jUZ1jUZ1jUZ1jUJxiUJxiUJxiUJxgTpxfTpxfTpxfTpxfTpxfTZ1eTZ1eTZ1eTJxbTJxbTJxbTJxbTJxbSpxZSpxZSpxZSpxZSpxZSJxWSJxW",
  ,
  "SJxWSJxWSJxWSJxWR51VR51VR51VRpxSRpxSRpxSRZtRRZtRRZtRRJxQRJxQQ5tNQ5tNQ5tNQpxNQpxNQpxNQZtMQZtMQZtLQZtLP5tIP5tIP5tIP5tIPpxH",
  ,
  "PpxHPpxHPpxHPpxHPZtGPZtGPZtDPZtDO5tCO5tCO5tCO5tCO5tCOZtAOpxBOZs+OZs+OZs+OZs+OJw9OJw9N5s8N5s8N5s8N5s7N5s7NZs6NZs6NZs3NZs3",
  ,
  "NJw3NJw3NJw3NJw3NJw3M5s1M5s1Mpw1MZs0MZs0MZs0MJwzMJwzMJwwMJwwMJwwL5svL5svLpwuLpwuLpwuLpwuLpwuLZstLZstLZstLZstLZstZ7EXZ7EX",
  ,
  "Z7EXZ7EXZ7EXZ7EYZ7EYZ7EYZ7EYZ7EZZrEZZrEaZrEbZrEbZrEbZrAcZrAcZrAdZrAdZrAdZrAeZbAeZbAeZbAfZbAfZbAfZbAgZbAgZbAhZbAhZbAhZa8i",
  ,
  "ZK8iZK8jZK8kZK8kZK8kZK8kZK8kZK8lZK8lZK8lZK8mY68mY68nY68oY68oY64oY64pY64pY64qY64qY64qYq4qYq4qYq4rYq4rYq4rYq4sYq4tYq4tYq4u",
  ,
  "Yq4uYq4uYa4vYa4vYa4vYa4vYa4vYa4wYa4xYa4xYa4yYa4yYa4yYK4zYK4zYK00YK00YK00YK01YK02YK02YK02YK02YK02YK03YK03YK04YK04YK04YK05",
  ,
  "YK06YKw6YKw6YKw7YKw7X6w8X6w8X6w8X6w8X6w8X6w9X6w+X6w+X6w+X6w/Xqw/XqxAXqtAXqtBXqtBXqtBXqtBXqtBXqtCXqtCXqtDXatDXatEXatEXatF",
  ,
  "XatFXatFXatGXapGXapHXapHXapIXKpIXKpIXKpIXKpIXKpIXKpJU51mUpxlUpxlUZ1jUZ1jUZ1jUZ1jUZ1jUJxiT51hT51hT51hT51hT51gTpxeTpxeTZ1e",
  ,
  "TZ1eTZ1eTZ1eTJxbTJxbTJxbS51aS51aS51aS51aSpxZSpxZSZ1ZSZ1ZSJxWSJxWSJxWSJxWSJxWR51VRpxURpxURpxURpxURpxURZtRRZtRRZtRRJxQRJxQ",
  ,
  "Q5tNQpxNQpxNQpxNQpxNQpxNQZ1MQZ1MQZ1MP51KP51KP5tIP5tIP5tIPpxHPpxHPpxHPZ1GPZ1GPZ1GPJxFPJxFPJxFPJxFPJxFO5tCO5tCOpxBOpxBOZtA",
  ,
  "OZtAOZtAOZ1AOJw/OJw/OJw/N508Npw7Npw7Npw7Npw7Npw7NZs5NZs5NJw3NJw3NJw5NJw5M502M502M502Mpw1Mpw1Mpw0Mpw0MJwzMJwzMJwzMJwzL5sv",
  ,
  "L50yL50yLpwuLpwuLpwuLpwuLpwuLpwuLpwuLZstLZstLJwsLJwsLJwsZ7EXZ7EXZ7EXZ7EXZ7EXZ7EYZ7EYZ7EYZ7EYZ7EZZ7EZZ7EaZ7EbZ7EbZ7EbZ7Ac",
  ,
  "Z7AcZ7AdZ7AdZ7AdZ7AeZrAeZrAeZrAfZrAfZrAfZrAgZrAgZrAhZrAhZrAhZa8iZa8iZa8jZa8kZa8kZa8kZa8kZa8kZa8lZa8lZa8lZK8mZK8mZK8nZK8o",
  ,
  "ZK8oZK4oZK4pZK4pZK4qZK4qY64qY64qY64qY64rY64rY64rY64sY64tY64tY64uY64uYq4uYq4vYq4vYq4vYq4vYq4vYq4wYq4xYq4xYa4yYa4yYa4yYa4z",
  ,
  "Ya4zYa00Ya00Ya00Ya01Ya02Ya02YK02YK02YK02YK03YK03YK04YK04YK04YK05YK06YKw6YKw6YKw7YKw7YKw8YKw8YKw8YKw8YKw8YKw9YKw+X6w+X6w+",
  ,
  "X6w/X6w/X6xAX6tAX6tBX6tBX6tBX6tBXqtBXqtCXqtCXqtDXqtDXqtEXqtEXqtFXqtFXqtFXqtGXapGXapHXapHXapIXapIXapIXapIXapIXapIXapJXapJ",
  ,
  "UpxlUpxlUZ1jUZ1jUZ1jUZ1jUZ1jUJxiT51hT51hT51hT51hT51gTpxeTpxeTZ1eTZ1eTZ1eTZ1eTJxbTJxbTJxbS51aS51aS51aS51aSpxZSpxZSZ1ZSZ1Z",
  ,
  "SJxWSJxWSJxWSJxWSJxWR51VRpxURpxURpxURpxURpxURZtRRZtRRZtRRJxQRJxQQ5tNQpxNQpxNQpxNQpxNQpxNQZ1MQZ1MQZ1MP51KP51KP5tIP5tIP5tI",
  ,
  "PpxHPpxHPpxHPZ1GPZ1GPZ1GPJxFPJxFPJxFPJxFPJxFO5tCO5tCOpxBOpxBOZtAOZtAOZtAOZ1AOJw/OJw/OJw/N508Npw7Npw7Npw7Npw7Npw7NZs5NZs5",
  ,
  "NJw3NJw3NJw5NJw5M502M502M502Mpw1Mpw1Mpw0Mpw0MJwzMJwzMJwzMJwzL5svL50yL50yLpwuLpwuLpwuLpwuLpwuLpwuLpwuLZstLZstLJwsLJwsLJws",
  ,
  "aLEXaLEXaLEXaLEYaLEYaLEZaLEZaLEZaLEZaLEaZ7EaZ7EbZ7EcZ7EcZ7EcZ7AdZ7AdZ7AeZ7AeZ7AeZ7AeZ7AeZ7AfZ7AfZ7AfZ7AgZ7AhZ7AhZ7AiZ7Ai",
  ,
  "ZrAiZq8jZq8jZq8kZq8kZq8kZq8kZq8lZq8lZa8mZa8mZa8mZa8nZa8nZa8oZa8oZa8oZa4pZa4pZa4qZK4qZK4qZK4qZK4rZK4rZK4sZK4sZK4sZK4tZK4t",
  ,
  "Y64uY64vY64vY64vY64vY64vY64wY64wY64wY64xYq4xYq4yYq4yYq4yYq4zYq40Yq40Yq01Yq01Yq01Ya02Ya02Ya02Ya02Ya02Ya03Ya03Ya04Ya05Ya05",
  ,
  "Ya05YK06YK06YKw7YKw7YKw7YKw8YKw8YKw8YKw9YKw9YKw9YKw+YKw+YKw/YKw/YKw/YKxAYKxAYKtBX6tBX6tBX6tBX6tCX6tCX6tDX6tDX6tDX6tEX6tE",
  ,
  "XqtFXqtFXqtFXqtGXqtHXqpHXqpIXqpIXqpIXqpIXapIXapJXapJXapJXapJXapKXapKUpxlUZ1lUZ1lUZ1lUZ1lUZ1lUJxiT51hT51hT51hT51hT51hTpxe",
  ,
  "TpxeTZ1eTZ1eTZ1eTZ1eTJxdTJxdTJxdS51cS51aS51aS51aSpxZSpxZSZ1ZSZ1ZSJxWSJxWSJxWSJxWSJxWR51VRpxURpxURpxURpxURpxURZtRRZtRRZtR",
  ,
  "RJxQRJxQQ5tPQpxPQpxPQpxPQpxPQpxPQZ1OQZ1OQZ1OP51KP51KP5tKP5tKP5tKPpxHPpxHPpxHPZ1GPZ1GPZ1GPJxFPJxFPJxFPJxFPJxFO5tCO5tCOpxB",
  ,
  "OpxBOZtAOZtAOZtAOZ1AOJw/OJw/OJw/N50+Npw+Npw+Npw+Npw7Npw7NZs5NZs5NJw5NJw5NJw5NJw5M504M504M504Mpw3Mpw3Mpw0Mpw0MJwzMJwzMJwz",
  ,
  "MJwzL5syL50yL50yLpwxLpwxLpwxLpwwLpwwLpwwLpwwLZstLZstLJwsLJwsLJwsabAXabAXabAXabAYabAYabAZabAZabAZabAZaLAaaLAaaLAbaLAcaLAc",
  ,
  "aLAcaLAdaK8daK8eaK8eZ68eZ68eZ68eZ68fZ68fZ68fZ68gZ68hZ68hZ68iZ68iZ68iZ68jZ64jZ64kZ64kZ64kZ64kZ64lZq4lZq4mZq4mZq4mZq4nZq4n",
  ,
  "Zq4oZq4oZq4oZq4pZa4pZa4qZa4qZa4qZa4qZa4rZa4rZa4sZa4sZa4sZK4tZK4tZK4uZK4vZK4vZK4vZK4vZK0vZK0wZK0wY60wY60xY60xY60yY60yY60y",
  ,
  "Y60zY600Y600Yq01Yq01Yq01Yq02Yq02Yqw2Yqw2Yqw2Yqw3Yqw3Yaw4Yaw5Yaw5Yaw5Yaw6Yaw6Yaw7Yaw7Yaw7Yaw8YKw8YKs8YKs9YKs9YKs9YKs+YKs+",
  ,
  "YKs/YKs/YKs/YKtAYKtAYKtBYKtBYKtBYKtBYKtCYKpCYKpDYKpDX6pDX6pEX6pEX6pFX6pFX6pFX6pGX6pHX6pHXqpIXqpIXqpIXqpIXqpIXqlJXqlJXqlJ",
  ,
  "XqlJXqlKXqlKXalLUZ1lUZ1lUZ1lUZ1lUZ1lUJxkT51hT51hT51hT51hT51hTpxgTpxgTZ1eTZ1eTZ1eTZ1eTJxdTJxdTJxdS51cS51cS51aS51aSpxZSpxZ",
  ,
  "SZ1ZSZ1ZSJxYSJxYSJxYSJxYSJxYR51VRpxURpxURpxURpxURpxURZtRRZtRRZtRRJxQRJxQQ5tPQpxPQpxPQpxPQpxPQpxPQZ1OQZ1OQZ1OP51KP51KP5tK",
  ,
  "P5tKP5tKPpxJPpxJPpxJPZ1IPZ1IPZ1IPJxFPJxFPJxFPJxFPJxFO5tEO5tEOpxBOpxBOZtAOZtAOZtAOZ1AOJw/OJw/OJw/N50+Npw+Npw+Npw+Npw7Npw7",
  ,
  "NZs5NZs5NJw5NJw5NJw5NJw5M504M504M504Mpw3Mpw3Mpw3Mpw3MJw1MJw1MJwzMJwzL5syL50yL50yLpwxLpwxLpwxLpwwLpwwLpwwLpwwLZsvLZsvLJws",
  ,
  "LJwsLJwsarAXarAXarAXarAYarAYarAZarAZarAZarAZabAaabAaabAbabAcabAcabAcabAdaa8daa8eaa8eaK8eaK8eaK8eaK8faK8faK8faK8gaK8haK8h",
  ,
  "Z68iZ68iZ68iZ68jZ64jZ64kZ64kZ64kZ64kZ64lZ64lZ64mZ64mZ64mZ64nZ64nZ64oZ64oZ64oZq4pZq4pZq4qZq4qZq4qZq4qZq4rZq4rZq4sZq4sZa4s",
  ,
  "Za4tZa4tZa4uZa4vZa4vZa4vZa4vZa0vZK0wZK0wZK0wZK0xZK0xZK0yZK0yZK0yZK0zY600Y600Y601Y601Y601Y602Y602Y6w2Y6w2Y6w2Yqw3Yqw3Yqw4",
  ,
  "Yqw5Yqw5Yqw5Yqw6Yqw6Yqw7Yqw7Yaw7Yaw8Yaw8Yas8Yas9Yas9Yas9Yas+Yas+YKs/YKs/YKs/YKtAYKtAYKtBYKtBYKtBYKtBYKtCYKpCYKpDYKpDYKpD",
  ,
  "YKpEYKpEYKpFYKpFYKpFX6pGX6pHX6pHX6pIX6pIX6pIX6pIX6pIX6lJX6lJX6lJXqlJXqlKXqlKXqlLXqlMUZ1lUZ1lUZ1lUZ1lUJxkT51jT51jT51jT51h",
  ,
  "T51hTpxgTpxgTZ1eTZ1eTZ1eTZ1eTJxdTJxdTJxdS51cS51cS51cS51cSpxZSpxZSZ1ZSZ1ZSJxYSJxYSJxYSJxYSJxYR51VRpxURpxURpxURpxURpxURZtT",
  ,
  "RZtTRZtTRJxQRJxQQ5tPQpxPQpxPQpxPQpxPQpxPQZ1OQZ1OQZ1OP51KP51KP5tKP5tKP5tKPpxJPpxJPpxJPZ1IPZ1IPZ1IPJxFPJxFPJxFPJxFPJxFO5tE",
  ,
  "O5tEOpxDOpxDOZtCOZtCOZtCOZ1COJxCOJxCOJxCN50+Npw+Npw+Npw+Npw9Npw9NZs8NZs8NJw5NJw5NJw5NJw5M504M504M504Mpw3Mpw3Mpw3Mpw3MJw1",
  ,
  "MJw1MJwzMJwzL5syL50yL50yLpwxLpwxLpwxLpwwLpwwLpwwLpwwLZsvLZsvLJwuLJwuLJwuarAXarAXarAXarAYarAYarAZarAZarAZarAZabAaabAaabAb",
  ,
  "abAcabAcabAcabAdaa8daa8eaa8eaK8eaK8eaK8eaK8faK8faK8faK8gaK8haK8hZ68iZ68iZ68iZ68jZ64jZ64kZ64kZ64kZ64kZ64lZ64lZ64mZ64mZ64m",
  ,
  "Z64nZ64nZ64oZ64oZ64oZq4pZq4pZq4qZq4qZq4qZq4qZq4rZq4rZq4sZq4sZa4sZa4tZa4tZa4uZa4vZa4vZa4vZa4vZa0vZK0wZK0wZK0wZK0xZK0xZK0y",
  ,
  "ZK0yZK0yZK0zY600Y600Y601Y601Y601Y602Y602Y6w2Y6w2Y6w2Yqw3Yqw3Yqw4Yqw5Yqw5Yqw5Yqw6Yqw6Yqw7Yqw7Yaw7Yaw8Yaw8Yas8Yas9Yas9Yas9",
  ,
  "Yas+Yas+YKs/YKs/YKs/YKtAYKtAYKtBYKtBYKtBYKtBYKtCYKpCYKpDYKpDYKpDYKpEYKpEYKpFYKpFYKpFX6pGX6pHX6pHX6pIX6pIX6pIX6pIX6pIX6lJ",
  ,
  "X6lJX6lJXqlJXqlKXqlKXqlLXqlMXqlMUZ1lUZ1lUJxkUJxjT51jT51hT51hT51hTpxgTpxgTZ1gTZ1gTZ1gTZ1gTJxfTJxfTJxdTJxdS51cS51cSpxZSpxZ",
  ,
  "SZ1ZSZ1ZSZ1ZSJxYSJxYSJxYSJxYR51XR51XRpxURpxURpxURpxURpxURZtTRJxTRJxTRJxTQ5tPQ5tPQpxPQpxPQpxPQpxPQZtOQZ1OQJxNQJxNQJxNP51K",
  ,
  "P5tKP5tKP5tKPpxJPpxJPpxJPZtGPZ1IPZ1IPJxFPJxFPJxFO5tEO5tEO5tEOpxDOpxDOZtCOZtCOZtCOZtCOJw/OJxCN50+N50+N50+Npw+Npw+Npw9Npw9",
  ,
  "NZs8NZs8NJw8NJw8NJw8NJw8NJw8M507Mpw3Mpw3Mpw3Mpw3Mpw3MJw1MJw1MJw1MJw1L5s0L5s0LpwxLpwxLpwxLpwxLpwxLpwwLZsvLZsvLZsvLZsvLJwu",
  ,
  "LJwuK5stK5stK5sta7AXa7AXa7AXa7AYa7AYa7AZa7AZa7AZa7AZarAaarAaarAbarAcarAcarAcarAdaq8daq8eaq8eaa8eaa8eaa8eaa8faa8faa8faa8g",
  ,
  "aa8haK8haK8iaK8iaK8iaK8jaK4jaK4kaK4kaK4kaK4kZ64lZ64lZ64mZ64mZ64mZ64nZ64nZ64oZ64oZ64oZ64pZ64pZ64qZ64qZ64qZ64qZ64rZ64rZq4s",
  ,
  "Zq4sZq4sZq4tZq4tZq4uZq4vZq4vZq4vZa4vZa0vZa0wZa0wZa0wZa0xZa0xZa0yZa0yZa0yZK0zZK00ZK00ZK01ZK01ZK01ZK02ZK02Y6w2Y6w2Y6w2Y6w3",
  ,
  "Y6w3Y6w4Y6w5Y6w5Y6w5Y6w6Yqw6Yqw7Yqw7Yqw7Yqw8Yqw8Yqs8Yqs9Yqs9Yas9Yas+Yas+Yas/Yas/Yas/YatAYatAYatBYKtBYKtBYKtBYKtCYKpCYKpD",
  ,
  "YKpDYKpDYKpEYKpEYKpFYKpFYKpFYKpGYKpHYKpHYKpIYKpIYKpIX6pIX6pIX6lJX6lJX6lJX6lJX6lKX6lKX6lLXqlMXqlMXqlMUZ1lUJxkUJxjT51jT51h",
  ,
  "T51hT51hTpxgTpxgTZ1gTZ1gTZ1gTZ1gTJxfTJxfTJxdTJxdS51cS51cSpxZSpxZSZ1ZSZ1ZSZ1ZSJxYSJxYSJxYSJxYR51XR51XRpxURpxURpxURpxURpxU",
  ,
  "RZtTRJxTRJxTRJxTQ5tPQ5tPQpxPQpxPQpxPQpxPQZtOQZ1OQJxNQJxNQJxNP51KP5tKP5tKP5tKPpxJPpxJPpxJPZtGPZ1IPZ1IPJxFPJxFPJxFO5tEO5tE",
  ,
  "O5tEOpxDOpxDOZtCOZtCOZtCOZtCOJw/OJxCN50+N50+N50+Npw+Npw+Npw9Npw9NZs8NZs8NJw8NJw8NJw8NJw8NJw8M507Mpw3Mpw3Mpw3Mpw3Mpw3MJw1",
  ,
  "MJw1MJw1MJw1L5s0L5s0LpwxLpwxLpwxLpwxLpwxLpwwLZsvLZsvLZsvLZsvLJwuLJwuK5stK5stK5stbLAYbLAYbLAYbLAZbLAZbLAabLAabLAabLAaa7Ab",
  ,
  "a7Aba7Aca7Aca7Aca7Ada7Aea68eaq8eaq8eaq8eaq8faq8faq8gaq8gaq8gaq8haa8haa8iaa8jaa8jaa8jaa8kaa4kaa4kaa4kaa4kaK4laK4laK4maK4m",
  ,
  "aK4maK4naK4oaK4oZ64pZ64pZ64pZ64qZ64qZ64qZ64qZ64qZ64rZ64rZ64sZ64tZ64tZ64tZ64uZ64uZ64vZ64vZ64vZq4vZq4vZq0wZq0wZq0wZq0xZq0y",
  ,
  "Zq0yZa0zZa0zZa0zZa00Za00Za01Za01Za01Za02ZK02ZK02ZKw3ZKw3ZKw3ZKw4ZKw4ZKw5Y6w5Y6w5Y6w6Y6w6Y6w7Y6w7Y6w7Y6w8Y6w8Y6w8Yqs9Yqs9",
  ,
  "Yqs9Yqs+Yqs+Yqs/Yqs/Yqs/YqtAYatAYatBYatBYatBYatBYatCYatCYapDYKpDYKpDYKpEYKpEYKpFYKpFYKpGYKpGYKpHYKpHYKpIYKpIYKpIYKpIYKpI",
  ,
  "YKpJYKlJYKlJYKlJYKlKX6lKX6lLX6lMX6lMX6lMX6lNX6lNUJxkUJxjT51jT51hT51hT51hTpxgTpxgTZ1gTZ1gTZ1gTZ1gTJxfTJxfTJxdTJxdS51cS51c",
  ,
  "SpxZSpxZSZ1ZSZ1ZSZ1ZSJxYSJxYSJxYSJxYR51XR51XRpxURpxURpxURpxURpxURZtTRJxTRJxTRJxTQ5tPQ5tPQpxPQpxPQpxPQpxPQZtOQZ1OQJxNQJxN",
  ,
  "QJxNP51KP5tKP5tKP5tKPpxJPpxJPpxJPZtGPZ1IPZ1IPJxFPJxFPJxFO5tEO5tEO5tEOpxDOpxDOZtCOZtCOZtCOZtCOJw/OJxCN50+N50+N50+Npw+Npw+",
  ,
  "Npw9Npw9NZs8NZs8NJw8NJw8NJw8NJw8NJw8M507Mpw3Mpw3Mpw3Mpw3Mpw3MJw1MJw1MJw1MJw1L5s0L5s0LpwxLpwxLpwxLpwxLpwxLpwwLZsvLZsvLZsv",
  ,
  "LZsvLJwuLJwuK5stK5stK5stbLAYbLAYbLAYbLAZbLAZbLAabLAabLAabLAaa7Aba7Aba7Aca7Aca7Aca7Ada7Aea68eaq8eaq8eaq8eaq8faq8faq8gaq8g",
  ,
  "aq8gaq8haa8haa8iaa8jaa8jaa8jaa8kaa4kaa4kaa4kaa4kaK4laK4laK4maK4maK4maK4naK4oaK4oZ64pZ64pZ64pZ64qZ64qZ64qZ64qZ64qZ64rZ64r",
  ,
  "Z64sZ64tZ64tZ64tZ64uZ64uZ64vZ64vZ64vZq4vZq4vZq0wZq0wZq0wZq0xZq0yZq0yZa0zZa0zZa0zZa00Za00Za01Za01Za01Za02ZK02ZK02ZKw3ZKw3",
  ,
  "ZKw3ZKw4ZKw4ZKw5Y6w5Y6w5Y6w6Y6w6Y6w7Y6w7Y6w7Y6w8Y6w8Y6w8Yqs9Yqs9Yqs9Yqs+Yqs+Yqs/Yqs/Yqs/YqtAYatAYatBYatBYatBYatBYatCYatC",
  ,
  "YapDYKpDYKpDYKpEYKpEYKpFYKpFYKpGYKpGYKpHYKpHYKpIYKpIYKpIYKpIYKpIYKpJYKlJYKlJYKlJYKlKX6lKX6lLX6lMX6lMX6lMX6lNX6lNX6lOT51j",
  ,
  "T51jT51jT51jT51jTpxiTp5jTZ1gTZ1gTZ1gTZ1gTZ1gTZ1gS51cS51cS51cS51cSpxbSpxbSZ1bSZ1bSZ1bSJxYSJxYSJxYSJxYR51XR51XRpxWRpxWRpxW",
  ,
  "RpxURpxURZ1TRJxTRJxTRJxTQ51SQ51SQpxPQpxPQpxPQpxPQZ1OQZ1OQJxNQZ1OQZ1OP51NP51MP51KP51KPpxJPpxJPpxJPZ1IPZ1IPZ1IPJxHPZ1IO51H",
  ,
  "O51EO51EO51EOpxDOpxDOZ1COZ1COZ1COZ1COJxCOJxCN50+N50+N50+N50+N50+Npw9Npw9NZ08NZ08NJw8NJw8NJw8NJw8NJw8M507M506M506M506Mpw3",
  ,
  "Mpw3MZ02MZ02MJw1MJw1L500L500LpwzLp40Lp40Lp40Lp40LpwzLZ0yLZ0yLZ0yLZ0yLJwuLJwuK50uK50uK50ubbAYbbAYbbAYbbAZbbAZbbAabbAabbAa",
  ,
  "bbAabLAbbLAbbLAcbLAcbLAcbLAdbLAebK8ea68ea68ea68ea68fa68fa68ga68ga68ga68haq8haq8iaq8jaq8jaq8jaq8kaq4kaq4kaa4kaa4kaa4laa4l",
  ,
  "aa4maa4maa4maa4naa4oaK4oaK4paK4paK4paK4qaK4qaK4qaK4qaK4qZ64rZ64rZ64sZ64tZ64tZ64tZ64uZ64uZ64vZ64vZ64vZ64vZ64vZ60wZ60wZ60w",
  ,
  "Z60xZq0yZq0yZq0zZq0zZq0zZq00Zq00Zq01Za01Za01Za02Za02Za02Zaw3Zaw3Zaw3Zaw4ZKw4ZKw5ZKw5ZKw5ZKw6ZKw6ZKw7ZKw7ZKw7Y6w8Y6w8Y6w8",
  ,
  "Y6s9Y6s9Y6s9Y6s+Y6s+Y6s/Yqs/Yqs/YqtAYqtAYqtBYqtBYqtBYqtBYqtCYatCYapDYapDYapDYapEYapEYapFYapFYKpGYKpGYKpHYKpHYKpIYKpIYKpI",
  ,
  "YKpIYKpIYKpJYKlJYKlJYKlJYKlKYKlKYKlLYKlMYKlMYKlMX6lNX6lNX6lOX6lOT51lT51jT51jT51jTpxiTp5jTZ1gTZ1gTZ1gTZ1gTZ1gTZ1gS51eS51e",
  ,
  "S51eS51cSpxbSpxbSZ1bSZ1bSZ1bSJxaSJxaSJxaSJxaR51XR51XRpxWRpxWRpxWRpxWRpxWRZ1TRJxTRJxTRJxTQ51SQ51SQpxRQpxRQpxRQpxRQZ1OQZ1O",
  ,
  "QJxNQZ1OQZ1OP51NP51MP51MP51MPpxJPpxJPpxJPZ1IPZ1IPZ1IPJxHPZ1IO51HO51GO51GO51GOpxFOpxFOZ1COZ1COZ1COZ1COJxCOJxCN51BN51BN51B",
  ,
  "N51AN51ANpw9Npw9NZ08NZ08NJw8NJw8NJw8NJw8NJw8M507M506M506M506Mpw5Mpw3MZ02MZ02MJw1MJw1L500L500LpwzLp40Lp40Lp40Lp40LpwzLZ0y",
  ,
  "LZ0yLZ0yLZ0yLJwuLJwuK50uK50uK50ubbAYbbAYbbAYbbAZbbAZbbAabbAabbAabbAabLAbbLAbbLAcbLAcbLAcbLAdbLAebK8ea68ea68ea68ea68fa68f",
  ,
  "a68ga68ga68ga68haq8haq8iaq8jaq8jaq8jaq8kaq4kaq4kaa4kaa4kaa4laa4laa4maa4maa4maa4naa4oaK4oaK4paK4paK4paK4qaK4qaK4qaK4qaK4q",
  ,
  "Z64rZ64rZ64sZ64tZ64tZ64tZ64uZ64uZ64vZ64vZ64vZ64vZ64vZ60wZ60wZ60wZ60xZq0yZq0yZq0zZq0zZq0zZq00Zq00Zq01Za01Za01Za02Za02Za02",
  ,
  "Zaw3Zaw3Zaw3Zaw4ZKw4ZKw5ZKw5ZKw5ZKw6ZKw6ZKw7ZKw7ZKw7Y6w8Y6w8Y6w8Y6s9Y6s9Y6s9Y6s+Y6s+Y6s/Yqs/Yqs/YqtAYqtAYqtBYqtBYqtBYqtB",
  ,
  "YqtCYatCYapDYapDYapDYapEYapEYapFYapFYKpGYKpGYKpHYKpHYKpIYKpIYKpIYKpIYKpIYKpJYKlJYKlJYKlJYKlKYKlKYKlLYKlMYKlMYKlMX6lNX6lN",
  ,
  "X6lOX6lOX6lOT51jT51jTpxiTZ1iTZ1iTZ1iTZ1iTZ1iTZ1gTZ1gS51eS51eS51eS51eSpxdSpxdSZ1bSZ1bSZ1bSJxaSJxaSJxaR51XR51XR51XRpxWRpxW",
  ,
  "RpxWRpxWRZtVRZtVRJxVRJxVQ51SQ51SQ51SQpxRQpxRQpxRQpxRQZ1QQZ1OQJxNQJxNP51NP51NP51MPpxLPpxLPpxLPpxLPpxLPZ1LPJxHPJxHPJxHPJxH",
  ,
  "O51HO51GO51GO51GOpxFOZ1FOZ1COZ1COZ1COZ1COJxCOJxCN51BN51AN51AN51ANpxANpxANZ0/NZ0/NZ0/NJw8NJw8NJw8M507M507M507M506M506Mpw5",
  ,
  "Mpw5MZ05MZ05MJw1MJw1L500L500L500LpwzLpwzLp40Lp40LpwzLpwzLZ0yLZ0yLZ0yLZ0yLJwxK50wK50wKpwtKpwtKpwtba8Yba8Yba8Yba8Zba8Zba8a",
  ,
  "ba8aba8aba8aba8bba8bba8cba8cba8cba8dba8ebK8ebK4ebK4ebK4ebK4fbK4fbK4gbK4gbK4ga64ha64ha64ia64ja64ja64ja64ka64kaq4kaq4kaq4k",
  ,
  "aq4laq4laq4maq4maq4maq4naa4oaa4oaa4paa4paa4paa4qaa4qaa4qaK4qaK4qaK0raK0raK0saK0taK0taK0taK0uZ60uZ60vZ60vZ60vZ60vZ60vZ60w",
  ,
  "Z60wZ60wZ60xZ6wyZ6wyZ6wzZ6wzZ6wzZ6w0Z6w0Zqw1Zqw1Zqw1Zqw2Zqw2Zqw2Zqw3Zaw3Zaw3Zaw4Zas4Zas5Zas5Zas5Zas6Zas6ZKs7ZKs7ZKs7ZKs8",
  ,
  "ZKs8ZKs8ZKs9ZKs9ZKs9Y6s+Y6s+Y6s/Y6o/Y6o/Y6pAY6pAY6pBYqpBYqpBYqpBYqpCYqpCYqpDYqpDYqpDYqpEYapEYapFYapFYalGYalGYalHYalHYalI",
  ,
  "YKlIYKlIYKlIYKlIYKlJYKlJYKlJYKlJYKlKYKlKYKlLYKlMYKlMYKlMYKlNYKlNYKlOYKlOYKlOX6lOT51jTpxiTZ1iTZ1iTZ1iTZ1iTZ1iTZ1gTZ1gS51e",
  ,
  "S51eS51eS51eSpxdSpxdSZ1bSZ1bSZ1bSJxaSJxaSJxaR51XR51XR51XRpxWRpxWRpxWRpxWRZtVRZtVRJxVRJxVQ51SQ51SQ51SQpxRQpxRQpxRQpxRQZ1Q",
  ,
  "QZ1OQJxNQJxNP51NP51NP51MPpxLPpxLPpxLPpxLPpxLPZ1LPJxHPJxHPJxHPJxHO51HO51GO51GO51GOpxFOZ1FOZ1COZ1COZ1COZ1COJxCOJxCN51BN51A",
  ,
  "N51AN51ANpxANpxANZ0/NZ0/NZ0/NJw8NJw8NJw8M507M507M507M506M506Mpw5Mpw5MZ05MZ05MJw1MJw1L500L500L500LpwzLpwzLp40Lp40LpwzLpwz",
  ,
  "LZ0yLZ0yLZ0yLZ0yLJwxK50wK50wKpwtKpwtKpwtbq8Zbq8Zbq8Zbq8abq8abq8bba8bba8bba8bba8cba8cba8dba8dba8dba8eba8eba8eba4fba4fba4f",
  ,
  "ba4gba4gba4hba4hba4hbK4ibK4ibK4jbK4jbK4jbK4kbK4ka64ka64la64la64la64ma64ma64na64na64naq4oaq4oaq4paq4qaq4qaq4qaq4qaq4qaa4r",
  ,
  "aa4raa4raa0saa0saa0taa0taa0taK0uaK0uaK0vaK0vaK0vaK0vaK0waK0wZ60xZ60xZ60xZ60yZ6wyZ6wzZ6wzZ6w0Z6w0Z6w1Z6w1Z6w2Z6w2Z6w2Z6w2",
  ,
  "Z6w2Z6w3Zqw3Zqw4Zqw4Zqw4Zqs5Zqs5Zqs6Zqs6Zas7Zas7Zas8Zas8Zas8Zas8Zas8Zas9ZKs9ZKs+ZKs+ZKs+ZKs/ZKtAZKpAZKpAZKpBY6pBY6pBY6pB",
  ,
  "Y6pCY6pCY6pCY6pDYqpDYqpEYqpEYqpEYqpFYqpGYqpGYqlHYqlHYalHYalIYalIYalIYalIYalIYalJYalJYKlKYKlKYKlKYKlKYKlLYKlMYKlMYKlNYKlN",
  ,
  "YKlNYKlOYKlOYKlOYKlOYKlOYKlPTpxiTZ1iTZ1iTZ1iTZ1iTZ1iTZ1gTZ1gS51eS51eS51eS51eSpxdSpxdSZ1bSZ1bSZ1bSJxaSJxaSJxaR51ZR51ZR51Z",
  ,
  "RpxYRpxYRpxWRpxWRZtVRZtVRJxVRJxVQ51UQ51UQ51SQpxRQpxRQpxRQpxRQZ1QQZ1QQJxPQJxPP51NP51NP51MPpxLPpxLPpxLPpxLPpxLPZ1LPJxKPJxK",
  ,
  "PJxKPJxHO51JO51GO51GO51GOpxFOZ1FOZ1FOZ1FOZ1FOZ1FOJxCOJxCN51BN51AN51AN51ANpxANpxANZ0/NZ0/NZ0/NJw+NJw+NJw+M507M507M507M506",
  ,
  "M506Mpw5Mpw5MZ05MZ05MJw3MJw3L500L500L500LpwzLpwzLp40Lp40LpwzLpwzLZ0yLZ0yLZ0yLZ0yLJwxK50wK50wKpwvKpwvKpwvb68Zb68Zb68Zb68a",
  ,
  "b68ab68bbq8bbq8bbq8bbq8cbq8cbq8dbq8dbq8dbq8ebq8eba8eba4fba4fba4fba4gba4gba4hba4hba4hba4iba4iba4jba4jba4jba4kba4kbK4kbK4l",
  ,
  "bK4lbK4lbK4mbK4mbK4na64na64na64oa64oa64pa64qa64qa64qa64qaq4qaq4raq4raq4raq0saq0saq0taa0taa0taa0uaa0uaa0vaa0vaa0vaa0vaa0w",
  ,
  "aK0waK0xaK0xaK0xaK0yaKwyaKwzZ6wzZ6w0Z6w0Z6w1Z6w1Z6w2Z6w2Z6w2Z6w2Z6w2Z6w3Z6w3Z6w4Z6w4Z6w4Z6s5Zqs5Zqs6Zqs6Zqs7Zqs7Zqs8Zqs8",
  ,
  "Zqs8Zqs8Zas8Zas9Zas9Zas+Zas+Zas+Zas/ZatAZKpAZKpAZKpBZKpBZKpBZKpBZKpCZKpCY6pCY6pDY6pDY6pEY6pEY6pEY6pFY6pGYqpGYqlHYqlHYqlH",
  ,
  "YqlIYqlIYqlIYqlIYalIYalJYalJYalKYalKYalKYalKYalLYalMYKlMYKlNYKlNYKlNYKlOYKlOYKlOYKlOYKlOYKlPYKlPTZ1iTZ1iTZ1iTZ1iTZ1iTZ1g",
  ,
  "TZ1gS51eS51eS51eS51eSpxdSpxdSZ1bSZ1bSZ1bSJxaSJxaSJxaR51ZR51ZR51ZRpxYRpxYRpxWRpxWRZtVRZtVRJxVRJxVQ51UQ51UQ51UQpxRQpxRQpxR",
  ,
  "QpxRQZ1QQZ1QQJxPQJxPP51PP51PP51OPpxLPpxLPpxLPpxLPpxLPZ1LPJxKPJxKPJxKPJxHO51JO51GO51GO51GOpxFOZ1FOZ1FOZ1FOZ1FOZ1FOJxEOJxE",
  ,
  "N51DN51AN51AN51ANpxANpxANZ0/NZ0/NZ0/NJw+NJw+NJw+M509M509M507M506M506Mpw5Mpw5MZ05MZ05MJw3MJw3L503L503L503Lpw2Lpw2Lp42Lp42",
  ,
  "Lpw1Lpw1LZ0yLZ0yLZ0yLZ0yLJwxK50wK50wKpwvKpwvKpwvb68Zb68Zb68Zb68ab68ab68bbq8bbq8bbq8bbq8cbq8cbq8dbq8dbq8dbq8ebq8eba8eba4f",
  ,
  "ba4fba4fba4gba4gba4hba4hba4hba4iba4iba4jba4jba4jba4kba4kbK4kbK4lbK4lbK4lbK4mbK4mbK4na64na64na64oa64oa64pa64qa64qa64qa64q",
  ,
  "aq4qaq4raq4raq4raq0saq0saq0taa0taa0taa0uaa0uaa0vaa0vaa0vaa0vaa0waK0waK0xaK0xaK0xaK0yaKwyaKwzZ6wzZ6w0Z6w0Z6w1Z6w1Z6w2Z6w2",
  ,
  "Z6w2Z6w2Z6w2Z6w3Z6w3Z6w4Z6w4Z6w4Z6s5Zqs5Zqs6Zqs6Zqs7Zqs7Zqs8Zqs8Zqs8Zqs8Zas8Zas9Zas9Zas+Zas+Zas+Zas/ZatAZKpAZKpAZKpBZKpB",
  ,
  "ZKpBZKpBZKpCZKpCY6pCY6pDY6pDY6pEY6pEY6pEY6pFY6pGYqpGYqlHYqlHYqlHYqlIYqlIYqlIYqlIYalIYalJYalJYalKYalKYalKYalKYalLYalMYKlM",
  ,
  "YKlNYKlNYKlNYKlOYKlOYKlOYKlOYKlOYKlPYKlPYKlQTZ1iTZ1iTZ1iTZ1iTZ1iTZ1iS51eS51eS51eS51eSpxdSpxdSZ1dSZ1dSZ1dSJxaSJxaSJxaR51Z",
  ,
  "R51ZR51ZRpxYRpxYRpxWRpxWRZtVRZtVRJxVRJxVQ51UQ51UQ51UQpxRQpxRQpxRQpxRQZ1QQZ1QQJxPQJxPP51PP51PP51OPpxLPpxLPpxLPpxLPpxLPZ1L",
  ,
  "PJxKPJxKPJxKPJxJO51JO51JO51JO51JOpxFOZ1FOZ1FOZ1FOZ1FOZ1FOJxEOJxEN51DN51DN51DN51DNpxCNpxCNZ0/NZ0/NZ0/NJw+NJw+NJw+M509M509",
  ,
  "M509M509M509Mpw8Mpw8MZ05MZ05MJw3MJw3L503L503L503Lpw2Lpw2Lp42Lp42Lpw1Lpw1LZ01LZ01LZ01LZ01LJwxK50wK50wKpwvKpwvKpwvcK8ZcK8Z",
  ,
  "cK8ZcK8acK8acK8bb68bb68bb68bb68cb68cb68db68db68db68ebq8ebq8ebq4fbq4fbq4fbq4gbq4gbq4hba4hba4hba4iba4iba4jba4jba4jba4kba4k",
  ,
  "ba4kba4lba4lba4lba4mba4mbK4nbK4nbK4nbK4obK4obK4pbK4qbK4qbK4qa64qa64qa64ra64ra64ra60sa60saq0taq0taq0taq0uaq0uaq0vaq0vaq0v",
  ,
  "aq0vaa0waa0waa0xaa0xaa0xaa0yaawyaKwzaKwzaKw0aKw0aKw1aKw1aKw2Z6w2Z6w2Z6w2Z6w2Z6w3Z6w3Z6w4Z6w4Z6w4Z6s5Z6s5Z6s6Z6s6Z6s7Z6s7",
  ,
  "Z6s8Zqs8Zqs8Zqs8Zqs8Zqs9Zqs9Zqs+Zqs+Zas+Zas/ZatAZapAZapAZapBZapBZapBZKpBZKpCZKpCZKpCZKpDZKpDZKpEZKpEY6pEY6pFY6pGY6pGY6lH",
  ,
  "Y6lHY6lHY6lIYqlIYqlIYqlIYqlIYqlJYqlJYqlKYqlKYqlKYalKYalLYalMYalMYalNYalNYalNYKlOYKlOYKlOYKlOYKlOYKlPYKlPYKlQYKlRTZ1iTZ1i",
  ,
  "TZ1iTZ1iTZ1iS51eS51eS51eS51eSpxdSpxdSZ1dSZ1dSZ1dSJxaSJxaSJxaR51ZR51ZR51ZRpxYRpxYRpxWRpxWRZtVRZtVRJxVRJxVQ51UQ51UQ51UQpxR",
  ,
  "QpxRQpxRQpxRQZ1QQZ1QQJxPQJxPP51PP51PP51OPpxLPpxLPpxLPpxLPpxLPZ1LPJxKPJxKPJxKPJxJO51JO51JO51JO51JOpxFOZ1FOZ1FOZ1FOZ1FOZ1F",
  ,
  "OJxEOJxEN51DN51DN51DN51DNpxCNpxCNZ0/NZ0/NZ0/NJw+NJw+NJw+M509M509M509M509M509Mpw8Mpw8MZ05MZ05MJw3MJw3L503L503L503Lpw2Lpw2",
  ,
  "Lp42Lp42Lpw1Lpw1LZ01LZ01LZ01LZ01LJwxK50wK50wKpwvKpwvKpwvca8Zca8Zca8Zca8aca8aca8bcK8bcK8bcK8bcK8ccK8ccK8dcK8dcK8dcK8eb68e",
  ,
  "b68eb64fb64fb64fb64gb64gbq4hbq4hbq4hbq4ibq4ibq4jbq4jbq4jba4kba4kba4kba4lba4lba4lba4mba4mba4nba4nba4nba4oba4oba4pba4qbK4q",
  ,
  "bK4qbK4qbK4qbK4rbK4rbK4rbK0sa60sa60ta60ta60ta60ua60ua60vaq0vaq0vaq0vaq0waq0waq0xaq0xaq0xaa0yaawyaawzaawzaaw0aaw0aaw1aaw1",
  ,
  "aKw2aKw2aKw2aKw2aKw2aKw3aKw3Z6w4Z6w4Z6w4Z6s5Z6s5Z6s6Z6s6Z6s7Z6s7Z6s8Z6s8Z6s8Z6s8Z6s8Z6s9Zqs9Zqs+Zqs+Zqs+Zqs/ZqtAZqpAZqpA",
  ,
  "ZqpBZapBZapBZapBZapCZapCZapCZapDZKpDZKpEZKpEZKpEZKpFZKpGZKpGY6lHY6lHY6lHY6lIY6lIY6lIY6lIY6lIYqlJYqlJYqlKYqlKYqlKYqlKYqlL",
  ,
  "YqlMYalMYalNYalNYalNYalOYalOYalOYalOYalOYKlPYKlPYKlQYKlRYKlRTZ1iTZ1iTZ1iS51eS51eS51eS51eSpxdSpxdSZ1dSJxaSJxaSJxaSJxaSJxa",
  ,
  "R51ZR51ZR51ZRpxYRpxYRpxYRZtVRZtVRZtVRJxVRJxVQ51UQpxTQpxTQpxTQpxTQpxTQZ1QQZ1QQZ1QQJxPP51PP51PP51OP51OPpxLPpxLPpxLPpxLPZ1L",
  ,
  "PZ1LPJxKPJxKPJxJPJxJO5tIO51JOpxFOpxFOpxFOZ1FOZ1FOZ1FOJxEOJxEOJxEN51DN51DNpxCN51DN51DNpxCNZ0/NZ0/NJw+NJw+NJw+NJw+M509M509",
  ,
  "Mpw8Mpw8Mpw8Mpw8Mpw8MZ07MZ07MJw3MJw3L503L503Lpw2Lpw2Lpw2Lpw2Lpw1Lpw1Lpw1LZ01LZ01LJw0LJw0LJw0LJw0K50zKpwvKpwvKpwvKpwvKpwv",
  ,
  "cq8acq8acq8acq8bcq8bcq8cca8cca8cca8cca8dca8dca8eca8eca8eca8ecK8ecK8fcK4gcK4gcK4gcK4hcK4hb64ib64ib64ib64jb64jb64kb64kb64k",
  ,
  "bq4kbq4kbq4lbq4mbq4mbq4mbq4nba4nba4oba4oba4oba4pba4pba4qba4qba4qba4qba4qba4rba4sba4sba4sbK0tbK0tbK0ubK0ubK0ubK0vbK0va60v",
  ,
  "a60va60wa60wa60wa60xa60yaq0yaq0yaq0zaqwzaqw0aqw0aqw1aqw1aaw1aaw2aaw2aaw2aaw2aaw2aaw3aKw3aKw4aKw5aKw5aKw5aKs6aKs6Z6s7Z6s7",
  ,
  "Z6s7Z6s8Z6s8Z6s8Z6s8Z6s8Z6s9Z6s9Z6s+Z6s/Z6s/Z6s/Z6tAZ6tAZqpBZqpBZqpBZqpBZqpBZqpCZqpCZqpCZapDZapDZapEZapFZapFZapFZapGZKpG",
  ,
  "ZKpHZKlHZKlHZKlIZKlIZKlIY6lIY6lIY6lJY6lJY6lKY6lLY6lLY6lLY6lLYqlMYqlMYqlNYqlNYqlNYqlOYqlOYalOYalOYalOYalPYalPYalQYalRYKlR",
  ,
  "YKlRYKlSTZ1iTZ1iS51eS51eS51eS51eSpxdSpxdSZ1dSJxaSJxaSJxaSJxaSJxaR51ZR51ZR51ZR51ZRpxYRpxYRZ1VRZ1VRZ1VRJxVRJxVQ51UQpxTQpxT",
  ,
  "Qp5UQp5UQp5UQZ1TQZ1TQZ1TQZ1QP51PP51PP51OP51OP51MP51MP51MP51MPZ1LPZ1LPZ1KPZ1KO51JO51JO51JO51JOpxFOp5IOp5IOZ1FOZ1FOZ1FOZ1E",
  ,
  "OZ1EOZ1EN51DN51DN51DN51DN51DNpxCNZ0/NZ0/NJ4+NJ4+NJ4+NJ4+M509M509M509M509M509Mpw8Mp48MZ07MZ07MJ46MJ46L503L503Lp42Lp42Lp42",
  ,
  "Lp42Lpw1Lpw1Lpw1LZ01LZ01LJ40LJ40LJ40LJ40K50zKp4yKp4yKp4yKp4yKp4ycq8acq8acq8acq8bcq8bcq8cca8cca8cca8cca8dca8dca8eca8eca8e",
  ,
  "ca8ecK8ecK8fcK4gcK4gcK4gcK4hcK4hb64ib64ib64ib64jb64jb64kb64kb64kbq4kbq4kbq4lbq4mbq4mbq4mbq4nba4nba4oba4oba4oba4pba4pba4q",
  ,
  "ba4qba4qba4qba4qba4rba4sba4sba4sbK0tbK0tbK0ubK0ubK0ubK0vbK0va60va60va60wa60wa60wa60xa60yaq0yaq0yaq0zaqwzaqw0aqw0aqw1aqw1",
  ,
  "aaw1aaw2aaw2aaw2aaw2aaw2aaw3aKw3aKw4aKw5aKw5aKw5aKs6aKs6Z6s7Z6s7Z6s7Z6s8Z6s8Z6s8Z6s8Z6s8Z6s9Z6s9Z6s+Z6s/Z6s/Z6s/Z6tAZ6tA",
  ,
  "ZqpBZqpBZqpBZqpBZqpBZqpCZqpCZqpCZapDZapDZapEZapFZapFZapFZapGZKpGZKpHZKlHZKlHZKlIZKlIZKlIY6lIY6lIY6lJY6lJY6lKY6lLY6lLY6lL",
  ,
  "Y6lLYqlMYqlMYqlNYqlNYqlNYqlOYqlOYalOYalOYalOYalPYalPYalQYalRYKlRYKlRYKlSYKlSTZ1iS51gS51gS51gS51gSpxdSpxdSZ1dSJxcSJxcSJxc",
  ,
  "SJxcSJxcR51bR51bR51bR51ZRpxYRpxYRZ1XRZ1XRZ1XRJxXRJxXQ51UQpxTQpxTQp5UQp5UQp5UQZ1TQZ1TQZ1TQZ1QP51PP51PP51OP51OP51OP51OP51O",
  ,
  "P51OPZ1NPZ1NPZ1KPZ1KO51JO51JO51JO51JOpxIOp5IOp5IOZ1HOZ1HOZ1HOZ1EOZ1EOZ1EN51DN51DN51DN51DN51DNpxCNZ0/NZ0/NJ4+NJ4+NJ4+NJ4+",
  ,
  "M509M509M509M509M509Mpw8Mp48MZ07MZ07MJ46MJ46L503L503Lp42Lp42Lp42Lp42Lpw1Lpw1Lpw1LZ01LZ01LJ40LJ40LJ40LJ40K50zKp4yKp4yKp4y",
  ,
  "Kp4yKp4ycq8acq8acq8acq8bcq8bcq8cca8cca8cca8cca8dca8dca8eca8eca8eca8ecK8ecK8fcK4gcK4gcK4gcK4hcK4hb64ib64ib64ib64jb64jb64k",
  ,
  "b64kb64kbq4kbq4kbq4lbq4mbq4mbq4mbq4nba4nba4oba4oba4oba4pba4pba4qba4qba4qba4qba4qba4rba4sba4sba4sbK0tbK0tbK0ubK0ubK0ubK0v",
  ,
  "bK0va60va60va60wa60wa60wa60xa60yaq0yaq0yaq0zaqwzaqw0aqw0aqw1aqw1aaw1aaw2aaw2aaw2aaw2aaw2aaw3aKw3aKw4aKw5aKw5aKw5aKs6aKs6",
  ,
  "Z6s7Z6s7Z6s7Z6s8Z6s8Z6s8Z6s8Z6s8Z6s9Z6s9Z6s+Z6s/Z6s/Z6s/Z6tAZ6tAZqpBZqpBZqpBZqpBZqpBZqpCZqpCZqpCZapDZapDZapEZapFZapFZapF",
  ,
  "ZapGZKpGZKpHZKlHZKlHZKlIZKlIZKlIY6lIY6lIY6lJY6lJY6lKY6lLY6lLY6lLY6lLYqlMYqlMYqlNYqlNYqlNYqlOYqlOYalOYalOYalOYalPYalPYalQ",
  ,
  "YalRYKlRYKlRYKlSYKlSYKlTS51gS51gS51gS51gSpxfSpxfSZ1dSJxcSJxcSJxcSJxcSJxcR51bR51bR51bR51ZRpxYRpxYRZ1XRZ1XRZ1XRJxXRJxXQ51U",
  ,
  "QpxTQpxTQp5UQp5UQp5UQZ1TQZ1TQZ1TQZ1SP51PP51PP51OP51OP51OP51OP51OP51OPZ1NPZ1NPZ1NPZ1NO51JO51JO51JO51JOpxIOp5IOp5IOZ1HOZ1H",
  ,
  "OZ1HOZ1HOZ1HOZ1HN51DN51DN51DN51DN51DNpxCNZ1BNZ1BNJ5BNJ5BNJ5BNJ5BM509M509M509M509M509Mpw8Mp48MZ07MZ07MJ46MJ46L506L506Lp42",
  ,
  "Lp42Lp42Lp42Lpw1Lpw1Lpw1LZ01LZ01LJ40LJ40LJ40LJ40K50zKp4yKp4yKp4yKp4yKp4ycq4acq4acq4acq4bcq4bcq4ccq4ccq4ccq4ccq4dcq4dcq4e",
  ,
  "cq4ecq4eca4eca4eca4fca4gca4gca4gca4hcK4hcK4icK4icK4icK4jcK4jcK4kb64kb64kb64kb64kb64lb64mb64mb64mbq4nbq0nbq0obq0obq0obq0p",
  ,
  "bq0pba0qba0qba0qba0qba0qba0rba0sba0sba0sba0tba0tba0ubawubawubawvbKwvbKwvbKwvbKwwbKwwbKwwbKwxa6wya6wya6wya6wza6wza6w0a6w0",
  ,
  "aqw1aqw1aqs1aqs2aqs2aqs2aqs2aqs2aas3aas3aas4aas5aas5aas5aas6aKs6aKs7aKs7aKs7aKs8aKo8aKo8aKo8Z6o8Z6o9Z6o9Z6o+Z6o/Z6o/Z6o/",
  ,
  "Z6pAZ6pAZ6pBZ6pBZ6pBZ6pBZqpBZqpCZqlCZqlCZqlDZqlDZqlEZalFZalFZalFZalGZalGZalHZalHZalHZKlIZKlIZKlIZKlIZKlIZKlJZKlJY6lKY6lL",
  ,
  "Y6lLY6lLY6lLY6lMY6lMY6lNYqlNYqlNYqlOYqlOYqlOYqlOYqlOYqlPYalPYalQYahRYahRYahRYahSYahSYKhTYKhTS51gS51gS51gSpxfSpxfSZ1dSJxc",
  ,
  "SJxcSJxcSJxcSJxcR51bR51bR51bR51ZRpxYRpxYRZ1XRZ1XRZ1XRJxXRJxXQ51UQpxTQpxTQp5UQp5UQp5UQZ1TQZ1TQZ1TQZ1SP51PP51PP51OP51OP51O",
  ,
  "P51OP51OP51OPZ1NPZ1NPZ1NPZ1NO51JO51JO51JO51JOpxIOp5IOp5IOZ1HOZ1HOZ1HOZ1HOZ1HOZ1HN51DN51DN51DN51DN51DNpxCNZ1BNZ1BNJ5BNJ5B",
  ,
  "NJ5BNJ5BM509M509M509M509M509Mpw8Mp48MZ07MZ07MJ46MJ46L506L506Lp42Lp42Lp42Lp42Lpw1Lpw1Lpw1LZ01LZ01LJ40LJ40LJ40LJ40K50zKp4y",
  ,
  "Kp4yKp4yKp4yKp4yc64ac64ac64ac64bc64bcq4ccq4ccq4ccq4ccq4dcq4dcq4ecq4ecq4ecq4ecq4ecq4fcq4gcq4gcq4gcq4hca4hca4ica4ica4ica4j",
  ,
  "ca4jca4kcK4kcK4kcK4kcK4kcK4lcK4mb64mb64mb64nb60nb60ob60ob60ob60pbq0pbq0qbq0qbq0qbq0qbq0qbq0rba0sba0sba0sba0tba0tba0ubawu",
  ,
  "bawubawvbawvbawvbawvbawwbawwbawwbKwxbKwybKwybKwybKwzbKwza6w0a6w0a6w1a6w1a6s1a6s2a6s2aqs2aqs2aqs2aqs3aqs3aqs4aqs5aqs5aas5",
  ,
  "aas6aas6aas7aas7aas7aas8aKo8aKo8aKo8aKo8aKo9aKo9aKo+Z6o/Z6o/Z6o/Z6pAZ6pAZ6pBZ6pBZ6pBZ6pBZ6pBZ6pCZ6lCZ6lCZ6lDZqlDZqlEZqlF",
  ,
  "ZqlFZqlFZqlGZqlGZalHZalHZalHZalIZalIZalIZalIZalIZKlJZKlJZKlKZKlLZKlLZKlLZKlLZKlMY6lMY6lNY6lNY6lNY6lOY6lOYqlOYqlOYqlOYqlP",
  ,
  "YqlPYqlQYqhRYahRYahRYahSYahSYahTYahTYahTSpxfSpxfSpxfSZ1dSJxcSJxcSJxcSJxcSJxcR51bR51bR51bR51bRpxYRpxYRZ1XRZ1XRZ1XRJxXQ51W",
  ,
  "Q51WQpxTQpxTQpxTQp5UQZ1TQZ1TQZ1SQZ1SQZ1SP51RP51RP51RPpxNPpxNP51OP51OPZ1NPZ1NPZ1NPZ1NO51LO51LO51LO51LO51LOpxIOZ1HOZ1HOZ1H",
  ,
  "OZ1HOZ1HOZ1HOZ1HOZ1HN51GN51DN51DNpxCNpxCNpxCNZ1BNJ5BNJ5BNJ5BNJ5BNJ5BM51AM51AM50/Mpw8Mpw8Mpw8MZ07MZ07MJ46MJ46MJ46L506Lp45",
  ,
  "Lp45Lp45Lp45Lp45Lpw4LZ01LZ01LZ01LJ40LJ40K50zK50zK50zK50zKp4yKp4yKp4yKpwyKpwyKpwydK4bdK4bdK4bdK4cdK4cc64dc64dc64dc64dc64e",
  ,
  "c64ec64ec64ec64ecq4fcq4fcq4gcq4hcq4hcq4hcq4icq4icq4jcq4jcq4jcq4kcq4kca4kca4kca4kca4lca4lca4mca4mcK4ncK4ncK4ocK0ocK0pcK0p",
  ,
  "cK0pcK0qb60qb60qb60qb60rb60rb60rbq0sbq0sbq0tbq0tbq0tbq0ubq0vbawvbawvbawvbawvbawwbawwbawxbawxbawxbawybawybawzbawzbawzbKw0",
  ,
  "bKw0bKw1bKw2bKw2bKs2bKs2a6s2a6s3a6s3a6s3a6s4a6s4a6s5aqs5aqs5aqs6aqs6aqs7aqs7aqs7aas8aas8aao8aao9aao9aao9aao+aKo+aKo/aKo/",
  ,
  "aKo/aKpAaKpAaKpBZ6pBZ6pBZ6pBZ6pBZ6pCZ6pDZ6lDZ6lDZ6lEZ6lEZ6lFZ6lFZ6lFZ6lGZqlGZqlHZqlHZqlIZqlIZqlIZqlIZalIZalJZalJZalKZalK",
  ,
  "ZalLZKlLZKlLZKlLZKlMZKlMZKlNZKlNZKlOZKlOY6lOY6lOY6lOY6lPY6lPY6lPY6lQYqlRYqhRYqhSYqhSYqhSYqhTYahTYahUYahUYahUSpxfSpxfSZ1f",
  ,
  "SJxcSJxcSJxcSJxcSJxcR51bR51bR51bR51bRpxaRpxaRZ1XRZ1XRZ1XRJxXQ51WQ51WQpxVQpxVQpxVQp5WQZ1VQZ1VQZ1SQZ1SQZ1SP51RP51RP51RPpxQ",
  ,
  "PpxQP51QP51QPZ1NPZ1NPZ1NPZ1NO51LO51LO51LO51LO51LOpxIOZ1HOZ1HOZ1HOZ1HOZ1HOZ1HOZ1HOZ1HN51GN51FN51FNpxCNpxCNpxCNZ1BNJ5BNJ5B",
  ,
  "NJ5BNJ5BNJ5BM51AM51AM50/Mpw+Mpw+Mpw+MZ07MZ0+MJ46MJ46MJ46L506Lp45Lp45Lp45Lp45Lp45Lpw4LZ03LZ03LZ03LJ43LJ43K50zK50zK50zK50z",
  ,
  "Kp4yKp4yKp4yKpwyKpwyKpwyda4bda4bda4bda4cda4cdK4ddK4ddK4ddK4ddK4edK4edK4edK4edK4ec64fc64fc64gc64hc64hc64hcq4icq4icq4jcq4j",
  ,
  "cq4jcq4kcq4kcq4kcq4kcq4kcq4lcq4lcq4mca4mca4nca4nca4oca0oca0pca0pca0pcK0qcK0qcK0qcK0qcK0rcK0rb60rb60sb60sb60tb60tb60tb60u",
  ,
  "bq0vbqwvbqwvbqwvbqwvbqwwbawwbawxbawxbawxbawybawybawzbawzbawzbaw0baw0baw1baw2baw2bKs2bKs2bKs2bKs3bKs3bKs3bKs4a6s4a6s5a6s5",
  ,
  "a6s5a6s6a6s6a6s7aqs7aqs7aqs8aqs8aqo8aqo9aqo9aao9aao+aao+aao/aao/aao/aapAaKpAaKpBaKpBaKpBaKpBaKpBZ6pCZ6pDZ6lDZ6lDZ6lEZ6lE",
  ,
  "Z6lFZ6lFZ6lFZ6lGZ6lGZ6lHZ6lHZqlIZqlIZqlIZqlIZqlIZqlJZqlJZqlKZalKZalLZalLZalLZalLZalMZalMZKlNZKlNZKlOZKlOZKlOZKlOZKlOY6lP",
  ,
  "Y6lPY6lPY6lQY6lRY6hRYqhSYqhSYqhSYqhTYqhTYqhUYqhUYqhUYahVSpxfSZ1fSJxeSJxeSJxeSJxeSJxeR51dR51bR51bR51bRpxaRpxaRZ1aRZ1aRZ1a",
  ,
  "RJxZQ51WQ51WQpxVQpxVQpxVQp5WQZ1VQZ1VQZ1SQZ1SQZ1SP51RP51RP51RPpxQPpxQP51QP51QPZ1PPZ1PPZ1PPZ1NO51LO51LO51LO51LO51LOpxKOZ1H",
  ,
  "OZ1KOZ1KOZ1KOZ1KOZ1HOZ1HOZ1HN51GN51FN51FNpxENpxENpxENZ1ENJ5BNJ5BNJ5BNJ5BNJ5BM51AM51AM50/Mpw+Mpw+Mpw+MZ0+MZ0+MJ49MJ49MJ49",
  ,
  "L506Lp45Lp45Lp45Lp45Lp45Lpw4LZ03LZ03LZ03LJ43LJ43K502K502K502K502Kp41Kp41Kp41KpwyKpwyKpwyda4bda4bda4bda4cda4cdK4ddK4ddK4d",
  ,
  "dK4ddK4edK4edK4edK4edK4ec64fc64fc64gc64hc64hc64hcq4icq4icq4jcq4jcq4jcq4kcq4kcq4kcq4kcq4kcq4lcq4lcq4mca4mca4nca4nca4oca0o",
  ,
  "ca0pca0pca0pcK0qcK0qcK0qcK0qcK0rcK0rb60rb60sb60sb60tb60tb60tb60ubq0vbqwvbqwvbqwvbqwvbqwwbawwbawxbawxbawxbawybawybawzbawz",
  ,
  "bawzbaw0baw0baw1baw2baw2bKs2bKs2bKs2bKs3bKs3bKs3bKs4a6s4a6s5a6s5a6s5a6s6a6s6a6s7aqs7aqs7aqs8aqs8aqo8aqo9aqo9aao9aao+aao+",
  ,
  "aao/aao/aao/aapAaKpAaKpBaKpBaKpBaKpBaKpBZ6pCZ6pDZ6lDZ6lDZ6lEZ6lEZ6lFZ6lFZ6lFZ6lGZ6lGZ6lHZ6lHZqlIZqlIZqlIZqlIZqlIZqlJZqlJ",
  ,
  "ZqlKZalKZalLZalLZalLZalLZalMZalMZKlNZKlNZKlOZKlOZKlOZKlOZKlOY6lPY6lPY6lPY6lQY6lRY6hRYqhSYqhSYqhSYqhTYqhTYqhUYqhUYqhUYahV",
  ,
  "YahVSZ1fSJ5eSJ5eSJ5eSJ5eSJ5eR51dR51bR51bR51bRpxaRp5bRZ1aRZ1aRZ1aRJ5ZQ51WQ51WQp5WQp5WQp5WQp5WQZ1VQp5VQJ5UQJ5UQJ5UQJ5SQJ5S",
  ,
  "P51RP51QP51QP51QP51QPp5QPp5QPp5QPZ1PPJ5MPJ5MO51LO51LO51LOp5LOZ1KOZ1KOZ1KOZ1KOZ9KOJ5JOJ5JOJ5JOJ5JNp5FNp5FNp5FNp5FNp5FNZ1D",
  ,
  "NJ5DNJ5DNJ5DNJ5DNJ5DNJ5DNJ5DM50/Mp4/Mp4/Mp4/MZ0+MZ0+MJ49MJ49MJ49MJ49Lp47Lp47Lp47Lp47Lp47Lp44LZ03LZ03LZ03LJ43LJ43K502K502",
  ,
  "K502K502Kp41Kp41Kp41Kpw0Kpw0Kpw0dq4bdq4bdq4bdq4cdq4cda4dda4dda4dda4dda4eda4eda4edK4edK4edK4fdK4fdK4gdK4hdK4hdK4hc64ic64i",
  ,
  "c64jc64jc64jc64kcq4kcq4kcq4kcq4kcq4lcq4lcq4mcq4mcq4ncq4ncq4ocq0ocq0pca0pca0pca0qca0qca0qca0qcK0rcK0rcK0rcK0scK0scK0tcK0t",
  ,
  "cK0tb60ub60vb6wvb6wvb6wvb6wvbqwwbqwwbqwxbqwxbqwxbqwybqwybawzbawzbawzbaw0baw0baw1baw2baw2bas2bas2bas2bas3bas3bas3bKs4bKs4",
  ,
  "bKs5bKs5bKs5bKs6a6s6a6s7a6s7a6s7a6s8a6s8aqo8aqo9aqo9aqo9aqo+aqo+aqo/aao/aao/aapAaapAaapBaapBaapBaKpBaKpBaKpCaKpDaKlDaKlD",
  ,
  "aKlEZ6lEZ6lFZ6lFZ6lFZ6lGZ6lGZ6lHZ6lHZ6lIZ6lIZ6lIZ6lIZ6lIZqlJZqlJZqlKZqlKZqlLZqlLZqlLZqlLZalMZalMZalNZalNZalOZalOZKlOZKlO",
  ,
  "ZKlOZKlPZKlPZKlPZKlQY6lRY6hRY6hSY6hSY6hSY6hTYqhTYqhUYqhUYqhUYqhVYqhVYqhVSJ5eSJ5eSJ5eSJ5eSJ5eR51dR51bR51bR51bRpxaRp5bRZ1a",
  ,
  "RZ1aRZ1aRJ5ZQ51WQ51WQp5WQp5WQp5WQp5WQZ1VQp5VQJ5UQJ5UQJ5UQJ5SQJ5SP51RP51QP51QP51QP51QPp5QPp5QPp5QPZ1PPJ5MPJ5MO51LO51LO51L",
  ,
  "Op5LOZ1KOZ1KOZ1KOZ1KOZ9KOJ5JOJ5JOJ5JOJ5JNp5FNp5FNp5FNp5FNp5FNZ1DNJ5DNJ5DNJ5DNJ5DNJ5DNJ5DNJ5DM50/Mp4/Mp4/Mp4/MZ0+MZ0+MJ49",
  ,
  "MJ49MJ49MJ49Lp47Lp47Lp47Lp47Lp47Lp44LZ03LZ03LZ03LJ43LJ43K502K502K502K502Kp41Kp41Kp41Kpw0Kpw0Kpw0d64bd64bd64bd64cd64cdq4d",
  ,
  "dq4ddq4ddq4ddq4edq4edq4eda4eda4eda4fda4fda4gda4hda4hdK4hdK4idK4idK4jdK4jdK4jdK4kc64kc64kc64kc64kc64lc64lcq4mcq4mcq4ncq4n",
  ,
  "cq4ocq0ocq0pcq0pcq0pcq0qcq0qcq0qcq0qca0rca0rca0rca0sca0sca0tca0tcK0tcK0ucK0vcKwvcKwvcKwvb6wvb6wwb6wwb6wxb6wxb6wxb6wybqwy",
  ,
  "bqwzbqwzbqwzbqw0bqw0baw1baw2baw2bas2bas2bas2bas3bas3bas3bas4bas4bas5bas5bas5bKs6bKs6bKs7bKs7bKs7bKs8a6s8a6o8a6o9a6o9a6o9",
  ,
  "a6o+aqo+aqo/aqo/aqo/aqpAaqpAaqpBaapBaapBaapBaapBaapCaapDaKlDaKlDaKlEaKlEaKlFaKlFaKlFZ6lGZ6lGZ6lHZ6lHZ6lIZ6lIZ6lIZ6lIZ6lI",
  ,
  "Z6lJZ6lJZ6lKZ6lKZqlLZqlLZqlLZqlLZqlMZqlMZqlNZalNZalOZalOZalOZalOZalOZKlPZKlPZKlPZKlQZKlRZKhRZKhSZKhSY6hSY6hTY6hTY6hUY6hU",
  ,
  "Y6hUYqhVYqhVYqhVYqhVSJ5eR51dR51dR51dR51bR51bRpxaRpxaRpxaRZ1aRJ5ZRJ5ZRJ5ZQ51WQ51WQp5WQp5WQp5WQp5WQZ1VQZ1VQJ5UQJ5UQJ5UQJ5S",
  ,
  "P51RP51RP51QP51QP51QPZ1PPZ1PPZ1PPZ1PPZ1PPJ5MPJ5MO51LOp5LOp5LOp5LOZ1KOZ1KOZ1KOZ1KOZ1JOJ5JOJ5JOJ5JOJ5JNp5FNp5FNp5FNZ1DNZ1D",
  ,
  "NZ1DNJ5DNJ5DNJ5DNJ5DNJ5DNJ5DM50/M50/Mp4/Mp4/Mp4/MZ0+MJ49MJ49MJ49MJ49MJ49Lp47Lp47Lp47Lp44Lp44Lp44LZ03LZ03LJ43LJ43K502K502",
  ,
  "Kp41Kp41Kp41Kp41Kp41Kpw0Kpw0KJ4zKJ4zKJ4zd64cd64cd64cd64dd64ddq4edq4edq4edq4edq4edq4edq4fda4fda4fda4gda4gda4hda4hda4hdK0i",
  ,
  "dK0jdK0jdK0kdK0kdK0kdK0kc60kc60lc60lc60lc60mc60mcq0ncq0ncq0ocq0ocq0ocq0pcqwpcqwqcqwqcqwqcqwqcqwrcqwrcawscawscawscawtcawt",
  ,
  "cawucawucKwucKwvcKwvcKwvcKwvcKwvb6swb6swb6sxb6syb6syb6syb6szbqszbqs0bqs0bqs0bqs1bqs1bas2bas2bas2bas2bas2bas3bao3bao3bao4",
  ,
  "bao4bao5bao6bao6bao6bKo7bKo7bKo8bKo8bKo8bKo8a6o8a6o9a6o9a6o9a6o+a6o+aqk/aqk/aqlAaqlAaqlAaqlBaqlBaalBaalBaalCaalCaalDaalD",
  ,
  "aKlEaKlEaKlEaKlFaKlFaKlGaKlGZ6lGZ6lHZ6lHZ6lIZ6lIZ6lIZ6lIZ6lJZ6lJZ6lKZ6lKZ6lKZ6lLZqlLZqlMZqlMZqlMZqlMZqlNZqlNZahOZahOZahO",
  ,
  "ZahOZahOZahPZKhPZKhPZKhQZKhRZKhRZKhSZKhSZKhSY6hTY6hTY6hUY6hUY6hUY6hVYqdVYqdVYqdVYqdWYqdWR51dR51dR51dR51dR51dRpxaRpxaRpxa",
  ,
  "RZ1aRJ5ZRJ5ZRJ5ZQ51YQ51YQp5WQp5WQp5WQp5WQZ1VQZ1VQJ5UQJ5UQJ5UQJ5UP51TP51TP51QP51QP51QPZ1PPZ1PPZ1PPZ1PPZ1PPJ5OPJ5OO51NOp5L",
  ,
  "Op5LOp5LOZ1KOZ1KOZ1KOZ1KOZ1JOJ5JOJ5JOJ5JOJ5JNp5HNp5HNp5FNZ1DNZ1DNZ1DNJ5DNJ5DNJ5DNJ5DNJ5DNJ5DM51CM51CMp5BMp5BMp5BMZ0+MJ49",
  ,
  "MJ49MJ49MJ49MJ49Lp47Lp47Lp47Lp47Lp47Lp47LZ06LZ06LJ43LJ43K502K502Kp41Kp41Kp41Kp41Kp41Kpw0Kpw0KJ4zKJ4zKJ4zd64cd64cd64cd64d",
  ,
  "d64ddq4edq4edq4edq4edq4edq4edq4fda4fda4fda4gda4gda4hda4hda4hdK0idK0jdK0jdK0kdK0kdK0kdK0kc60kc60lc60lc60lc60mc60mcq0ncq0n",
  ,
  "cq0ocq0ocq0ocq0pcqwpcqwqcqwqcqwqcqwqcqwrcqwrcawscawscawscawtcawtcawucawucKwucKwvcKwvcKwvcKwvcKwvb6swb6swb6sxb6syb6syb6sy",
  ,
  "b6szbqszbqs0bqs0bqs0bqs1bqs1bas2bas2bas2bas2bas2bas3bao3bao3bao4bao4bao5bao6bao6bao6bKo7bKo7bKo8bKo8bKo8bKo8a6o8a6o9a6o9",
  ,
  "a6o9a6o+a6o+aqk/aqk/aqlAaqlAaqlAaqlBaqlBaalBaalBaalCaalCaalDaalDaKlEaKlEaKlEaKlFaKlFaKlGaKlGZ6lGZ6lHZ6lHZ6lIZ6lIZ6lIZ6lI",
  ,
  "Z6lJZ6lJZ6lKZ6lKZ6lKZ6lLZqlLZqlMZqlMZqlMZqlMZqlNZqlNZahOZahOZahOZahOZahOZahPZKhPZKhPZKhQZKhRZKhRZKhSZKhSZKhSY6hTY6hTY6hU",
  ,
  "Y6hUY6hUY6hVYqdVYqdVYqdVYqdWYqdWYqdWR51dR51dR51dR51dRpxcRpxcRpxcRZ1cRJ5ZRJ5ZRJ5ZQ51YQ51YQp5YQp5YQp5YQp5YQZ1XQZ1XQJ5UQJ5U",
  ,
  "QJ5UQJ5UP51TP51TP51TP51TP51TPZ1PPZ1PPZ1PPZ1PPZ1PPJ5OPJ5OO51NOp5NOp5NOp5NOZ1KOZ1KOZ1KOZ1KOZ1JOJ5JOJ5JOJ5JOJ5JNp5HNp5HNp5H",
  ,
  "NZ1GNZ1GNZ1GNJ5DNJ5DNJ5DNJ5DNJ5DNJ5DM51CM51CMp5BMp5BMp5BMZ1AMJ49MJ49MJ49MJ49MJ49Lp47Lp47Lp47Lp47Lp47Lp47LZ06LZ06LJ45LJ45",
  ,
  "K504K504Kp41Kp41Kp41Kp41Kp41Kpw0Kpw0KJ4zKJ4zKJ4zeK4ceK4ceK4ceK4deK4dd64ed64ed64ed64ed64ed64ed64fdq4fdq4fdq4gdq4gdq4hdq4h",
  ,
  "dq4hda0ida0jda0jda0kda0kda0kdK0kdK0kdK0ldK0ldK0ldK0mdK0mc60nc60nc60oc60oc60oc60pcqwpcqwqcqwqcqwqcqwqcqwrcqwrcqwscqwscqws",
  ,
  "cqwtcqwtcawucawucawucawvcawvcawvcawvcKwvcKswcKswcKsxcKsycKsycKsyb6szb6szb6s0b6s0b6s0b6s1bqs1bqs2bqs2bqs2bqs2bqs2bas3bao3",
  ,
  "bao3bao4bao4bao5bao6bao6bao6bao7bao7bao8bKo8bKo8bKo8bKo8bKo9bKo9bKo9bKo+a6o+a6k/a6k/a6lAa6lAa6lAaqlBaqlBaqlBaqlBaqlCaqlC",
  ,
  "aalDaalDaalEaalEaalEaalFaKlFaKlGaKlGaKlGaKlHaKlHZ6lIZ6lIZ6lIZ6lIZ6lJZ6lJZ6lKZ6lKZ6lKZ6lLZ6lLZ6lMZ6lMZ6lMZ6lMZqlNZqlNZqhO",
  ,
  "ZqhOZqhOZqhOZahOZahPZahPZahPZahQZahRZKhRZKhSZKhSZKhSZKhTZKhTY6hUY6hUY6hUY6hVY6dVY6dVY6dVYqdWYqdWYqdWYqdXR51dR51dR51dRpxc",
  ,
  "RpxcRpxcRZ1cRJ5ZRJ5ZRJ5ZQ51YQ51YQp5YQp5YQp5YQp5YQZ1XQZ1XQJ5UQJ5UQJ5UQJ5UP51TP51TP51TP51TP51TPZ1PPZ1PPZ1PPZ1PPZ1PPJ5OPJ5O",
  ,
  "O51NOp5NOp5NOp5NOZ1KOZ1KOZ1KOZ1KOZ1JOJ5JOJ5JOJ5JOJ5JNp5HNp5HNp5HNZ1GNZ1GNZ1GNJ5DNJ5DNJ5DNJ5DNJ5DNJ5DM51CM51CMp5BMp5BMp5B",
  ,
  "MZ1AMJ49MJ49MJ49MJ49MJ49Lp47Lp47Lp47Lp47Lp47Lp47LZ06LZ06LJ45LJ45K504K504Kp41Kp41Kp41Kp41Kp41Kpw0Kpw0KJ4zKJ4zKJ4zeK4ceK4c",
  ,
  "eK4ceK4deK4deK4eeK4eeK4eeK4eeK4eeK4eeK4fd64fd64fd64gd64gd64hd64hd64hdq0idq0jdq0jdq0kdq0kdq0kda0kda0kda0lda0lda0lda0mdK0m",
  ,
  "dK0ndK0ndK0odK0odK0oc60pc6wpc6wqc6wqc6wqc6wqcqwrcqwrcqwscqwscqwscqwtcqwtcqwucqwucqwucqwvcqwvcawvcawvcawvcaswcaswcasxcasy",
  ,
  "casycKsycKszcKszcKs0cKs0cKs0b6s1b6s1b6s2b6s2b6s2b6s2bqs2bqs3bqo3bqo3bqo4bqo4bao5bao6bao6bao6bao7bao7bao8bao8bao8bao8bao8",
  ,
  "bao9bKo9bKo9bKo+bKo+bKk/bKk/a6lAa6lAa6lAa6lBa6lBa6lBa6lBaqlCaqlCaqlDaqlDaqlEaqlEaalEaalFaalFaalGaalGaalGaKlHaKlHaKlIaKlI",
  ,
  "aKlIaKlIaKlJZ6lJZ6lKZ6lKZ6lKZ6lLZ6lLZ6lMZ6lMZ6lMZ6lMZ6lNZ6lNZ6hOZqhOZqhOZqhOZqhOZqhPZqhPZqhPZahQZahRZahRZahSZahSZahSZKhT",
  ,
  "ZKhTZKhUZKhUZKhUZKhVY6dVY6dVY6dVY6dWY6dWY6dWYqdXYqdXR51dR51dRpxcRpxcRpxcRZ1cRJ5ZRJ5ZRJ5ZQ51YQ51YQp5YQp5YQp5YQp5YQZ1XQZ1X",
  ,
  "QJ5UQJ5UQJ5UQJ5UP51TP51TP51TP51TP51TPZ1PPZ1PPZ1PPZ1PPZ1PPJ5OPJ5OO51NOp5NOp5NOp5NOZ1KOZ1KOZ1KOZ1KOZ1JOJ5JOJ5JOJ5JOJ5JNp5H",
  ,
  "Np5HNp5HNZ1GNZ1GNZ1GNJ5DNJ5DNJ5DNJ5DNJ5DNJ5DM51CM51CMp5BMp5BMp5BMZ1AMJ49MJ49MJ49MJ49MJ49Lp47Lp47Lp47Lp47Lp47Lp47LZ06LZ06",
  ,
  "LJ45LJ45K504K504Kp41Kp41Kp41Kp41Kp41Kpw0Kpw0KJ4zKJ4zKJ4zea4cea4cea4cea4dea4deK4eeK4eeK4eeK4eeK4eeK4eeK4feK4feK4feK4geK4g",
  ,
  "eK4heK4heK4hd60id60jd60jd60kd60kd60kdq0kdq0kdq0ldq0ldq0ldq0mda0mda0nda0nda0oda0oda0odK0pdKwpdKwqdKwqdKwqdKwqc6wrc6wrc6ws",
  ,
  "c6wsc6wsc6wtcqwtcqwucqwucqwucqwvcqwvcqwvcqwvcqwvcqswcqswcqsxcasycasycasycaszcaszcas0cas0cKs0cKs1cKs1cKs2cKs2cKs2b6s2b6s2",
  ,
  "b6s3b6o3b6o3b6o4bqo4bqo5bqo6bqo6bqo6bqo7bao7bao8bao8bao8bao8bao8bao9bao9bao9bao+bao+bak/bKk/bKlAbKlAbKlAbKlBbKlBa6lBa6lB",
  ,
  "a6lCa6lCa6lDa6lDaqlEaqlEaqlEaqlFaqlFaqlGaqlGaalGaalHaalHaalIaalIaalIaKlIaKlJaKlJaKlKaKlKaKlKZ6lLZ6lLZ6lMZ6lMZ6lMZ6lMZ6lN",
  ,
  "Z6lNZ6hOZ6hOZ6hOZ6hOZ6hOZqhPZqhPZqhPZqhQZqhRZqhRZahSZahSZahSZahTZahTZahUZKhUZKhUZKhVZKdVZKdVZKdVY6dWY6dWY6dWY6dXY6dXY6dY",
  ,
  "RpxcRZ1aRZ1aRZ1aRJ5ZRJ5ZQ51YQ51YQ51YQp5YQp5YQp5YQZ1XQZ1XQZ1XQZ1UQJ5UQJ5UQJ5UP51TP51TP51TP51TP51TP51TPZ1PPZ1PPZ1PPZ1PPJ5O",
  ,
  "O51NO51NOp5NOp5NOp5NOZ1KOZ1KOZ1KOZ1JOZ1JOZ1JOJ5JNp5HNp5HNp5HNp5HNp5HNZ1GNZ1GNJ5DNJ5DNJ5DNJ5DNJ5DNJ5DNJ5DM51CMp5BMp5BMZ1A",
  ,
  "MZ1AMZ1AMJ49L508L508Lp47Lp47Lp47Lp47Lp47Lp47LZ06LZ06LZ06LJ45LJ45K504K504Kp41Kp41Kp41Kp41Kp41Kp41Kpw0KJ4zKJ4zKJwzKJwzKJwz",
  ,
  "eq4deq4deq4deq4eea4eea4eea4eea4eea4eea4fea4feK4geK4geK4geK4heK4heK4ieK4ieK4ieK0jeK0jeK0keK0kd60kd60kd60ld60ld60md60md60m",
  ,
  "dq0ndq0ndq0odq0odq0pdq0pda0pda0qdawqdawqdawqdawqdKwrdKwrdKwsdKwsdKwsdKwtc6wuc6wuc6wvc6wvc6wvc6wvcqwvcqwwcqwwcqwwcqsxcqsx",
  ,
  "cqsycqsycqsycqszcqszcas0cas0cas0cas1cas1cas2cKs2cKs2cKs2cKs3cKs3cKs4b6o4b6o4b6o5b6o5b6o6b6o6bqo7bqo7bqo7bqo8bqo8bqo8bqo8",
  ,
  "bao8bao9bao9bao+bao+bao+bao/balAbalAbalBbalBbalBbKlBbKlBbKlCbKlCbKlCbKlDa6lDa6lEa6lEa6lEa6lFa6lFaqlGaqlGaqlGaqlHaqlHaqlI",
  ,
  "aalIaalIaalIaalJaalJaKlKaKlKaKlKaKlLaKlLaKlMZ6lMZ6lMZ6lMZ6lNZ6lNZ6lOZ6hOZ6hOZ6hOZ6hOZ6hPZ6hPZ6hQZ6hQZqhRZqhRZqhSZqhSZqhT",
  ,
  "ZqhTZahTZahUZahUZahVZahVZahVZKdVZKdVZKdWZKdWZKdWZKdXY6dXY6dYY6dYY6dYRZ1cRZ1cRZ1cRJ5bRJ5bQ51YQ51YQ59ZQp5YQp5YQp5YQp5YQp5Y",
  ,
  "Qp5YQJ5WQJ5UQJ5UQJ5UP51TP59TPp5SPp5SPp5SPp5SPp5SPZ1RPZ1RPZ1RPJ5OO59OO59OOp5NOp5NOp5NOZ9MOZ9MOZ9MOJ5LOJ5LOJ5LOJ5JN59IN59I",
  ,
  "N59INp5HNp5HNZ9HNZ9HNJ5GNJ5GNJ5GNJ5GNJ5DM59FM59FM59CMp5BMp5BMZ9BMZ9BMZ9BMJ5AMJ4/MJ4/Lp47Lp47Lp47Lp47Lp47Lp47LZ06LZ06LZ06",
  ,
  "LJ45LJ45K504K504Kp44Kp44Kp44Kp44Kp44Kp44Kp44KJ4zKJ4zKJ4zKJ4zKJ4zeq4deq4deq4deq4eea4eea4eea4eea4eea4eea4fea4feK4geK4geK4g",
  ,
  "eK4heK4heK4ieK4ieK4ieK0jeK0jeK0keK0kd60kd60kd60ld60ld60md60md60mdq0ndq0ndq0odq0odq0pdq0pda0pda0qdawqdawqdawqdawqdKwrdKwr",
  ,
  "dKwsdKwsdKwsdKwtc6wuc6wuc6wvc6wvc6wvc6wvcqwvcqwwcqwwcqwwcqsxcqsxcqsycqsycqsycqszcqszcas0cas0cas0cas1cas1cas2cKs2cKs2cKs2",
  ,
  "cKs3cKs3cKs4b6o4b6o4b6o5b6o5b6o6b6o6bqo7bqo7bqo7bqo8bqo8bqo8bqo8bao8bao9bao9bao+bao+bao+bao/balAbalAbalBbalBbalBbKlBbKlB",
  ,
  "bKlCbKlCbKlCbKlDa6lDa6lEa6lEa6lEa6lFa6lFaqlGaqlGaqlGaqlHaqlHaqlIaalIaalIaalIaalJaalJaKlKaKlKaKlKaKlLaKlLaKlMZ6lMZ6lMZ6lM",
  ,
  "Z6lNZ6lNZ6lOZ6hOZ6hOZ6hOZ6hOZ6hPZ6hPZ6hQZ6hQZqhRZqhRZqhSZqhSZqhTZqhTZahTZahUZahUZahVZahVZahVZKdVZKdVZKdWZKdWZKdWZKdXY6dX",
  ,
  "Y6dYY6dYY6dYY6dZRZ1cRZ1cRJ5bRJ5bQ51aQ51aQ59bQp5aQp5aQp5aQp5YQp5YQp5YQJ5WQJ5WQJ5WQJ5WP51VP59WPp5SPp5SPp5SPp5SPp5SPZ1RPZ1R",
  ,
  "PZ1RPJ5RO59QO59QOp5NOp5NOp5NOZ9MOZ9MOZ9MOJ5LOJ5LOJ5LOJ5LN59LN59LN59LNp5HNp5HNZ9HNZ9HNJ5GNJ5GNJ5GNJ5GNJ5FM59FM59FM59FMp5B",
  ,
  "Mp5BMZ9BMZ9BMZ9BMJ5AMJ4/MJ4/Lp4+Lp4+Lp4+Lp4+Lp4+Lp4+LZ06LZ06LZ06LJ45LJ45K504K504Kp44Kp44Kp44Kp44Kp44Kp44Kp44KJ42KJ42KJ4z",
  ,
  "KJ4zKJ4ze64de64de64de64eeq4eeq4eeq4eeq4eeq4eeq4feq4fea4gea4gea4gea4hea4hea4ieK4ieK4ieK0jeK0jeK0keK0keK0keK0keK0leK0leK0m",
  ,
  "eK0meK0md60nd60nd60od60odq0pdq0pdq0pdq0qdqwqdqwqdqwqdawqdawrdawrdawsdawsdawsdKwtdKwudKwudKwvdKwvdKwvc6wvc6wvc6wwc6wwc6ww",
  ,
  "c6sxcqsxcqsycqsycqsycqszcqszcqs0cqs0cqs0cqs1cqs1cas2cas2cas2cas2cas3cas3cKs4cKo4cKo4cKo5cKo5cKo6b6o6b6o7b6o7b6o7b6o8b6o8",
  ,
  "bqo8bqo8bqo8bqo9bqo9bao+bao+bao+bao/balAbalAbalBbalBbalBbalBbalBbalCbalCbKlCbKlDbKlDbKlEbKlEbKlEa6lFa6lFa6lGa6lGa6lGa6lH",
  ,
  "aqlHaqlIaqlIaqlIaqlIaqlJaalJaalKaalKaalKaalLaKlLaKlMaKlMaKlMaKlMaKlNaKlNZ6lOZ6hOZ6hOZ6hOZ6hOZ6hPZ6hPZ6hQZ6hQZ6hRZ6hRZ6hS",
  ,
  "ZqhSZqhTZqhTZqhTZqhUZqhUZahVZahVZahVZadVZadVZKdWZKdWZKdWZKdXZKdXZKdYY6dYY6dYY6dZY6dZRZ1cRJ5bRJ5bQ51aQ51aQ59bQp5aQp5aQp5a",
  ,
  "Qp5YQp5YQp5YQJ5WQJ5WQJ5WQJ5WP51VP59WPp5SPp5SPp5SPp5SPp5SPZ1RPZ1RPZ1RPJ5RO59QO59QOp5NOp5NOp5NOZ9MOZ9MOZ9MOJ5LOJ5LOJ5LOJ5L",
  ,
  "N59LN59LN59LNp5HNp5HNZ9HNZ9HNJ5GNJ5GNJ5GNJ5GNJ5FM59FM59FM59FMp5BMp5BMZ9BMZ9BMZ9BMJ5AMJ4/MJ4/Lp4+Lp4+Lp4+Lp4+Lp4+Lp4+LZ06",
  ,
  "LZ06LZ06LJ45LJ45K504K504Kp44Kp44Kp44Kp44Kp44Kp44Kp44KJ42KJ42KJ4zKJ4zKJ4zfK0dfK0dfK0dfK0ee60ee60ee60ee60ee60ee60fe60feq0g",
  ,
  "eq0geq0geq0heq0heq0iea0iea0iea0jea0jeawkeKwkeKwkeKwkeKwleKwleKwmeKwmeKwmeKwneKwneKwoeKwod6wpd6wpd6wpd6wqd6wqd6wqd6wqdqwq",
  ,
  "dqsrdqsrdqssdassdassdastdasudasudasvdasvdKsvdKsvdKsvdKswdKswdKswc6sxc6sxc6syc6syc6sycqozcqozcqo0cqo0cqo0cqo1cqo1cqo2cqo2",
  ,
  "cqo2cqo2cqo3cao3cao4cao4cao4cao5cao5cKo6cKo6cKk7cKk7cKk7b6k8b6k8b6k8b6k8b6k8b6k9bqk9bqk+bqk+bqk+bqk/bqlAbalAbalBbalBbalB",
  ,
  "balBbalBbalCbalCbalCbalDbalDbKlEbKlEbKlEbKlFbKlFbKlGa6lGa6lGa6lHa6lHa6lIa6lIaqlIaqlIaqlJaqlJaqhKaahKaahKaahLaahLaahMaahM",
  ,
  "aahMaahMaKhNaKhNaKhOaKhOaKhOaKhOZ6hOZ6hPZ6hPZ6hQZ6hQZ6hRZ6hRZ6dSZ6dSZ6dTZ6dTZqdTZqdUZqdUZqdVZqdVZqdVZadVZadVZadWZadWZadW",
  ,
  "ZadXZKdXZKdYZKdYZKdYZKdZY6ZZY6ZaRJ5bRJ5bQ51aQ51aQ59bQp5aQp5aQp5aQp5YQp5YQp5aQJ5WQJ5WQJ5WQJ5WP51VP59WPp5VPp5VPp5VPp5VPp5S",
  ,
  "PZ1RPZ1RPZ1RPJ5RO59QO59QOp5POp5POp5POZ9MOZ9MOZ9MOJ5LOJ5LOJ5LOJ5LN59LN59LN59LNp5KNp5KNZ9HNZ9HNJ5GNJ5GNJ5GNJ5GNJ5FM59FM59F",
  ,
  "M59FMp5EMp5EMZ9DMZ9DMZ9DMJ5AMJ4/MJ4/Lp4+Lp4+Lp4+Lp4+Lp4+Lp4+LZ09LZ09LZ09LJ45LJ45K504K504Kp44Kp44Kp44Kp44Kp44Kp44Kp44KJ42",
  ,
  "KJ42KJ42KJ42KJ42fa0dfa0dfa0dfa0efK0efK0efK0efK0efK0efK0ffK0fe60ge60ge60ge60he60heq0ieq0ieq0ieq0jeq0jeqwkeawkeawkeawkeawl",
  ,
  "eawleawmeKwmeKwmeKwneKwneKwoeKwoeKwpeKwpeKwpeKwqeKwqd6wqd6wqd6wqd6srd6srd6ssdqssdqssdqstdqsudqsudasvdasvdasvdasvdasvdasw",
  ,
  "daswdKswdKsxdKsxdKsydKsydKsyc6ozc6ozc6o0c6o0c6o0cqo1cqo1cqo2cqo2cqo2cqo2cqo3cqo3cqo4cqo4cqo4cao5cao5cao6cao6cak7cak7cKk7",
  ,
  "cKk8cKk8cKk8cKk8cKk8b6k9b6k9b6k+b6k+b6k+bqk/bqlAbqlAbqlBbqlBbqlBbalBbalBbalCbalCbalCbalDbalDbalEbalEbalEbalFbKlFbKlGbKlG",
  ,
  "bKlGbKlHbKlHa6lIa6lIa6lIa6lIa6lJa6lJaqhKaqhKaqhKaqhLaqhLaahMaahMaahMaahMaahNaahNaahOaKhOaKhOaKhOaKhOaKhPZ6hPZ6hQZ6hQZ6hR",
  ,
  "Z6hRZ6dSZ6dSZ6dTZ6dTZ6dTZ6dUZ6dUZqdVZqdVZqdVZqdVZqdVZadWZadWZadWZadXZadXZadYZKdYZKdYZKdZZKZZZKZaZKZaQ51aQp5YQp5YQp5aQp5a",
  ,
  "Qp5aQp5YQJ5WQJ5WQJ5WQJ5WQJ5WP51VP51VP51VPp5VPp5VPp5VPp5SPp5SPZ1RPJ5RPJ5RPJ5RO51QO59QOp5POZ9MOZ9MOZ9MOZ9MOZ9MOJ5LOJ5LOJ5L",
  ,
  "OJ5LNp5KN59LNp5KNp5KNZ9HNZ9HNJ5GNJ5GNJ5GNJ5GNJ5FNJ5FM51EM59FM59FMp5EMZ9DMZ9DMJ5AMJ5AMJ5AMJ4/MJ4/Lp4+Lp4+Lp4+Lp4+Lp4+Lp4+",
  ,
  "LZ09LJ45LJ45LJ45K504K504Kp44Kp44Kp44Kp44Kp44Kp44Kp44Kp44KJ42KJ42KJ42J501J501J501fa0efa0efa0efa0efK0efK0ffK0ffK0ffK0ffK0g",
  ,
  "fK0ge60he60he60he60ie60ieq0jeq0jeq0jeq0keq0keqwkeawkeawleawleawleawmeawmeKwneKwneKwoeKwoeKwpeKwpeKwqeKwqeKwqeKwqeKwqd6wr",
  ,
  "d6wrd6wrd6ssd6ssd6stdqstdqstdqsudqsudqsvdasvdasvdasvdasvdaswdaswdaswdKsxdKsydKsydKszdKszdKszc6o0c6o0c6o1c6o1c6o1cqo2cqo2",
  ,
  "cqo2cqo2cqo3cqo3cqo3cqo4cqo4cqo5cqo5cao5cao6cao6cao7cak7cak7cKk8cKk8cKk8cKk9cKk9cKk9b6k+b6k+b6k/b6k/b6k/bqlAbqlAbqlBbqlB",
  ,
  "bqlBbqlBbalBbalCbalCbalCbalDbalDbalEbalEbalFbalFbalFbKlGbKlHbKlHbKlHbKlIbKlIa6lIa6lIa6lJa6lJa6lJa6lKaqhKaqhLaqhLaqhLaqhM",
  ,
  "aahMaahNaahNaahNaahNaahOaahOaKhOaKhOaKhOaKhPaKhPZ6hQZ6hRZ6hRZ6hRZ6hSZ6dSZ6dTZ6dTZ6dTZ6dUZ6dUZ6dVZqdVZqdVZqdVZqdVZqdWZadW",
  ,
  "ZadXZadXZadXZadYZadYZKdZZKdZZKdZZKZaZKZaZKZaZKZaQp5aQp5aQp5aQp5aQp5aQp5aQJ5WQJ5WQJ5WQJ5WQJ5WP51VP51VP51VPp5VPp5VPp5VPp5S",
  ,
  "Pp5SPZ1RPJ5RPJ5RPJ5RO51QO59QOp5POZ9POZ9POZ9POZ9POZ9POJ5LOJ5LOJ5LOJ5LNp5KN59LNp5KNp5KNZ9JNZ9JNJ5INJ5INJ5INJ5INJ5FNJ5FM51E",
  ,
  "M59FM59FMp5EMZ9DMZ9DMJ5CMJ5CMJ5CMJ4/MJ4/Lp4+Lp4+Lp4+Lp4+Lp4+Lp4+LZ09LJ48LJ48LJ48K507K507Kp44Kp44Kp44Kp44Kp44Kp44Kp44Kp44",
  ,
  "KJ42KJ42KJ42J501J501J501fa0efa0efa0efa0efK0efK0ffK0ffK0ffK0ffK0gfK0ge60he60he60he60ie60ieq0jeq0jeq0jeq0keq0keqwkeawkeawl",
  ,
  "eawleawleawmeawmeKwneKwneKwoeKwoeKwpeKwpeKwqeKwqeKwqeKwqeKwqd6wrd6wrd6wrd6ssd6ssd6stdqstdqstdqsudqsudqsvdasvdasvdasvdasv",
  ,
  "daswdaswdaswdKsxdKsydKsydKszdKszdKszc6o0c6o0c6o1c6o1c6o1cqo2cqo2cqo2cqo2cqo3cqo3cqo3cqo4cqo4cqo5cqo5cao5cao6cao6cao7cak7",
  ,
  "cak7cKk8cKk8cKk8cKk9cKk9cKk9b6k+b6k+b6k/b6k/b6k/bqlAbqlAbqlBbqlBbqlBbqlBbalBbalCbalCbalCbalDbalDbalEbalEbalFbalFbalFbKlG",
  ,
  "bKlHbKlHbKlHbKlIbKlIa6lIa6lIa6lJa6lJa6lJa6lKaqhKaqhLaqhLaqhLaqhMaahMaahNaahNaahNaahNaahOaahOaKhOaKhOaKhOaKhPaKhPZ6hQZ6hR",
  ,
  "Z6hRZ6hRZ6hSZ6dSZ6dTZ6dTZ6dTZ6dUZ6dUZ6dVZqdVZqdVZqdVZqdVZqdWZadWZadXZadXZadXZadYZadYZKdZZKdZZKdZZKZaZKZaZKZaZKZaY6ZbQp5a",
  ,
  "Qp5aQp5aQp5aQp5aQJ5ZQJ5ZQJ5ZQJ5WQJ5WP51VP51VP51VPp5VPp5VPp5VPp5UPp5UPZ1TPJ5RPJ5RPJ5RO51QO59QOp5POZ9POZ9POZ9POZ9POZ9POJ5L",
  ,
  "OJ5NOJ5NOJ5NNp5KN59LNp5KNp5KNZ9JNZ9JNJ5INJ5INJ5INJ5INJ5INJ5IM51EM59HM59HMp5EMZ9DMZ9DMJ5CMJ5CMJ5CMJ5CMJ5CLp5BLp5BLp5BLp5B",
  ,
  "Lp4+Lp4+LZ09LJ48LJ48LJ48K507K507Kp47Kp47Kp47Kp47Kp46Kp46Kp46Kp46KJ42KJ42KJ42J501J501J501fq0efq0efq0efq0efa0efa0ffa0ffa0f",
  ,
  "fa0ffa0gfa0gfK0hfK0hfK0hfK0ifK0ie60je60je60je60ke60ke6wkeqwkeqwleqwleqwleqwmeawmeawneawneawoeawoeawpeKwpeKwqeKwqeKwqeKwq",
  ,
  "eKwqeKwreKwreKwreKsseKssd6std6std6std6sud6sudqsvdqsvdqsvdqsvdqsvdqswdaswdaswdasxdasydasydaszdKszdKszdKo0dKo0dKo1c6o1c6o1",
  ,
  "c6o2c6o2c6o2c6o2cqo3cqo3cqo3cqo4cqo4cqo5cqo5cqo5cqo6cqo6cqo7cak7cak7cak8cak8cak8cKk9cKk9cKk9cKk+cKk+cKk/cKk/b6k/b6lAb6lA",
  ,
  "b6lBbqlBbqlBbqlBbqlBbqlCbqlCbqlCbalDbalDbalEbalEbalFbalFbalFbalGbalHbalHbalHbKlIbKlIbKlIbKlIbKlJbKlJa6lJa6lKa6hKa6hLa6hL",
  ,
  "aqhLaqhMaqhMaqhNaqhNaqhNaqhNaahOaahOaahOaahOaahOaKhPaKhPaKhQaKhRaKhRaKhRZ6hSZ6dSZ6dTZ6dTZ6dTZ6dUZ6dUZ6dVZ6dVZ6dVZ6dVZqdV",
  ,
  "ZqdWZqdWZqdXZqdXZqdXZadYZadYZadZZadZZadZZKZaZKZaZKZaZKZaZKZbZKZbQp5aQp5aQp5aQp5aQJ5ZQJ5ZQJ5ZQJ5WQJ5WP51VP51VP51VPp5VPp5V",
  ,
  "Pp5VPp5UPp5UPZ1TPJ5RPJ5RPJ5RO51QO59QOp5POZ9POZ9POZ9POZ9POZ9POJ5LOJ5NOJ5NOJ5NNp5KN59LNp5KNp5KNZ9JNZ9JNJ5INJ5INJ5INJ5INJ5I",
  ,
  "NJ5IM51EM59HM59HMp5EMZ9DMZ9DMJ5CMJ5CMJ5CMJ5CMJ5CLp5BLp5BLp5BLp5BLp4+Lp4+LZ09LJ48LJ48LJ48K507K507Kp47Kp47Kp47Kp47Kp46Kp46",
  ,
  "Kp46Kp46KJ42KJ42KJ42J501J501J501f60ef60ef60ef60efq0efq0ffq0ffq0ffq0ffq0gfa0gfa0hfa0hfa0hfa0ifa0ifK0jfK0jfK0jfK0kfK0ke6wk",
  ,
  "e6wke6wle6wle6wle6wmeqwmeqwneqwneqwoeqwoeawpeawpeawqeawqeawqeawqeKwqeKwreKwreKwreKsseKsseKsteKsteKsteKsueKsud6svd6svd6sv",
  ,
  "d6svd6svdqswdqswdqswdqsxdqsydqsydaszdaszdaszdao0dao0dKo1dKo1dKo1dKo2dKo2dKo2c6o2c6o3c6o3c6o3c6o4cqo4cqo5cqo5cqo5cqo6cqo6",
  ,
  "cqo7cqk7cqk7cqk8cqk8cak8cak9cak9cak9cak+cak+cKk/cKk/cKk/cKlAcKlAb6lBb6lBb6lBb6lBb6lBb6lCbqlCbqlCbqlDbqlDbqlEbalEbalFbalF",
  ,
  "balFbalGbalHbalHbalHbalIbalIbalIbKlIbKlJbKlJbKlJbKlKa6hKa6hLa6hLa6hLa6hMa6hMaqhNaqhNaqhNaqhNaqhOaqhOaahOaahOaahOaahPaahP",
  ,
  "aahQaKhRaKhRaKhRaKhSaKdSZ6dTZ6dTZ6dTZ6dUZ6dUZ6dVZ6dVZ6dVZ6dVZ6dVZ6dWZqdWZqdXZqdXZqdXZqdYZqdYZadZZadZZadZZaZaZaZaZKZaZKZa",
  ,
  "ZKZbZKZbZKZcQp5cQp5cQp5aQJ5ZQJ5ZQJ5ZQJ5YQJ5YP51VP51VP51VPp5VPp5VPp5VPp5UPp5UPZ1TPZ1TPJ5TPJ5TPJ5TO51QO59QOp5POZ9POZ9POZ9P",
  ,
  "OZ9POZ9POJ5OOJ5NOJ5NOJ5NNp5KN59LNp5KNp5KNZ9JNZ9JNJ5INJ5INJ5INJ5INJ5INJ5IM51HM59HM59HMp5GMZ9DMZ9DMJ5CMJ5CMJ5CMJ5CMJ5CLp5B",
  ,
  "Lp5BLp5BLp5BLp5ALp5ALZ09LJ48LJ48LJ48K507K507Kp47Kp47Kp47Kp47Kp46Kp46Kp46Kp46KJ45KJ42KJ42J501J501f60ef60ef60ef60ef60ef60f",
  ,
  "f60ff60ff60ff60gfq0gfq0hfq0hfq0hfq0ifq0ifa0jfa0jfa0jfa0kfa0kfKwkfKwkfKwlfKwlfKwle6wme6wme6wne6wne6woe6woeqwpeqwpeqwqeqwq",
  ,
  "eqwqeawqeawqeawreawreawreasseKsseKsteKsteKsteKsueKsueKsveKsveKsveKsvd6svd6swd6swd6swd6sxd6sydqsydqszdqszdqszdqo0dao0dao1",
  ,
  "dao1dao1dao2dao2dKo2dKo2dKo3dKo3dKo3c6o4c6o4c6o5c6o5c6o5cqo6cqo6cqo7cqk7cqk7cqk8cqk8cqk8cqk9cqk9cqk9cak+cak+cak/cak/cak/",
  ,
  "calAcKlAcKlBcKlBcKlBcKlBb6lBb6lCb6lCb6lCb6lDbqlDbqlEbqlEbqlFbqlFbqlFbalGbalHbalHbalHbalIbalIbalIbalIbalJbalJbalJbKlKbKhK",
  ,
  "bKhLbKhLbKhLa6hMa6hMa6hNa6hNa6hNa6hNaqhOaqhOaqhOaqhOaqhOaqhPaahPaahQaahRaahRaahRaKhSaKdSaKdTaKdTaKdTaKdUZ6dUZ6dVZ6dVZ6dV",
  ,
  "Z6dVZ6dVZ6dWZ6dWZ6dXZ6dXZqdXZqdYZqdYZqdZZqdZZqdZZaZaZaZaZaZaZaZaZaZbZKZbZKZcZKZcQp5aQZ9ZQZ9ZQZ9ZQJ5YP59YP59YPp5XPp5XPp5X",
  ,
  "Pp5XPp5UPp5UPZ9UPZ9UPJ5TPJ5TO59TO59TO59TOp5SOp5SOZ9POZ9POZ9POZ9POZ9OOZ9OOJ5NOJ5NOJ5NN59NNp5MNp5MNZ9JNZ9JNZ9JNZ9JNZ9JNZ9J",
  ,
  "M59IM59IM59IM59HMp5GMp5GMp5GMZ9DMZ9DMJ5CMJ5CMJ5CMJ5CLp5BLp5BLp5BLp5ALp5ALp5ALZ9ALZ9ALJ48K588K588K588Kp47Kp47Kp47Kp47Kp46",
  ,
  "Kp46KZ86KZ86KZ86KZ86KJ45J581J581Jp40Jp40gK0egK0egK0egK0ff60ff60gf60gf60gf60gf60hf60hf60if60if60if60jfq0jfq0kfq0kfq0kfq0k",
  ,
  "fq0kfawlfawlfawmfawmfawmfKwnfKwnfKwofKwofKwoe6wpe6wpe6wqe6wqe6wqe6wqeqwreqwreqwseqwseqwseasteasteasueasueasueKsveKsveKsv",
  ,
  "eKsveKsveKsweKsweKsxeKsxeKsxeKsyd6syd6szd6szd6s0d6s0dqo0dqo1dqo1dqo2dqo2dqo2dao2dao3dao3dao4dao4dKo4dKo5dKo5dKo6dKo6c6o6",
  ,
  "c6o7c6o7c6o8c6k8c6k8cqk8cqk8cqk9cqk9cqk9cqk+cqk+cqk/cqk/cqk/calAcalAcalBcalBcalBcalBcKlBcKlCcKlDcKlDcKlDb6lEb6lEb6lFb6lF",
  ,
  "bqlGbqlGbqlGbqlHbqlHbqlIbqlIbalIbalIbalIbalJbalJbalJbalKbalKbahLbKhLbKhLbKhMbKhMbKhNbKhNbKhNbKhNa6hOa6hOa6hOa6hOaqhPaqhP",
  ,
  "aqhQaqhQaqhRaahRaahRaahSaahSaadTaadTaKdUaKdUaKdUaKdVaKdVZ6dVZ6dVZ6dVZ6dWZ6dWZ6dXZ6dXZ6dXZ6dYZ6dYZqdZZqdZZqdZZqdaZqZaZqZa",
  ,
  "ZaZaZaZaZaZbZaZbZaZcZKZdZKZdQZ9ZQZ9ZQZ9ZQJ5YP59YP59YPp5XPp5XPp5XPp5XPp5UPp5UPZ9UPZ9UPJ5TPJ5TO59TO59TO59TOp5SOp5SOZ9POZ9P",
  ,
  "OZ9POZ9POZ9OOZ9OOJ5NOJ5NOJ5NN59NNp5MNp5MNZ9JNZ9JNZ9JNZ9JNZ9JNZ9JM59IM59IM59IM59HMp5GMp5GMp5GMZ9GMZ9GMJ5CMJ5CMJ5CMJ5CLp5B",
  ,
  "Lp5BLp5BLp5ALp5ALp5ALZ9ALZ9ALJ4/K588K588K588Kp47Kp47Kp47Kp47Kp46Kp46KZ86KZ86KZ86KZ86KJ45J584J584Jp43Jp43gK0egK0egK0egK0f",
  ,
  "f60ff60gf60gf60gf60gf60hf60hf60if60if60if60jfq0jfq0kfq0kfq0kfq0kfq0kfawlfawlfawmfawmfawmfKwnfKwnfKwofKwofKwoe6wpe6wpe6wq",
  ,
  "e6wqe6wqe6wqeqwreqwreqwseqwseqwseasteasteasueasueasueKsveKsveKsveKsveKsveKsweKsweKsxeKsxeKsxeKsyd6syd6szd6szd6s0d6s0dqo0",
  ,
  "dqo1dqo1dqo2dqo2dqo2dao2dao3dao3dao4dao4dKo4dKo5dKo5dKo6dKo6c6o6c6o7c6o7c6o8c6k8c6k8cqk8cqk8cqk9cqk9cqk9cqk+cqk+cqk/cqk/",
  ,
  "cqk/calAcalAcalBcalBcalBcalBcKlBcKlCcKlDcKlDcKlDb6lEb6lEb6lFb6lFbqlGbqlGbqlGbqlHbqlHbqlIbqlIbalIbalIbalIbalJbalJbalJbalK",
  ,
  "balKbahLbKhLbKhLbKhMbKhMbKhNbKhNbKhNbKhNa6hOa6hOa6hOa6hOaqhPaqhPaqhQaqhQaqhRaahRaahRaahSaahSaadTaadTaKdUaKdUaKdUaKdVaKdV",
  ,
  "Z6dVZ6dVZ6dVZ6dWZ6dWZ6dXZ6dXZ6dXZ6dYZ6dYZqdZZqdZZqdZZqdaZqZaZqZaZaZaZaZaZaZbZaZbZaZcZKZdZKZdZKZdQZ9ZQZ9ZQJ5YP59YP59YPp5X",
  ,
  "Pp5XPp5XPp5XPp5UPp5UPZ9UPZ9UPJ5TPJ5TO59TO59TO59TOp5SOp5SOZ9ROZ9ROZ9ROZ9ROZ9OOZ9OOJ5NOJ5NOJ5NN59NNp5MNp5MNZ9MNZ9MNZ9MNZ9J",
  ,
  "NZ9JNZ9JM59IM59IM59IM59HMp5GMp5GMp5GMZ9GMZ9GMJ5CMJ5EMJ5EMJ5ELp5BLp5BLp5BLp5ALp5ALp5ALZ9ALZ9ALJ4/K58+K58+K58+Kp49Kp49Kp49",
  ,
  "Kp49Kp46Kp46KZ86KZ86KZ86KZ86KJ45J584J584Jp43Jp43gawegawegawegawfgKwfgKwggKwggKwggKwggKwhf6whf6wif6wif6wif6wjf6wjf6wkf6wk",
  ,
  "f6wkf6wkf6wkfqwlfqslfqsmfqsmfqsmfasnfasnfasofasofasofKspfKspfKsqfKsqfKsqe6sqe6sre6sre6sse6sse6sseqsteqsteqoueqoueqoueaov",
  ,
  "eaoveaoveaoveaoveKoweKoweKoxeKoxeKoxeKoyeKoyeKozeKozeKo0eKo0d6o0d6o1d6o1d6k2d6k2dqk2dqk2dqk3dqk3dak4dak4dak4dak5dak5dKk6",
  ,
  "dKk6dKk6dKk7dKk7dKk8c6k8c6k8c6k8c6k8c6k9cqk9cqk9cqk+cqk+cqk/cqk/cqk/cqlAcqlAcqlBcalBcalBcalBcalBcalCcalDcKlDcKlDcKlEcKlE",
  ,
  "cKlFb6lFb6lGb6lGb6hGb6hHbqhHbqhIbqhIbqhIbqhIbahIbahJbahJbahJbahKbahKbahLbahLbahLbahMbahMbKhNbKhNbKhNbKhNbKhObKdOa6dOa6dO",
  ,
  "a6dPa6dPa6dQaqdQaqdRaqdRaqdRaqdSaqdSaadTaadTaadUaadUaadUaKdVaKdVaKdVaKdVaKdVZ6ZWZ6ZWZ6ZXZ6ZXZ6ZXZ6ZYZ6ZYZ6ZZZ6ZZZ6ZZZ6Za",
  ,
  "ZqZaZqZaZqZaZqZaZqZbZaZbZaZcZaZdZaZdZaZdZKZeQZ9ZQJ5YP59YP59YPp5XPp5XPp5XPp5XPp5UPp5UPZ9UPZ9UPJ5TPJ5TO59TO59TO59TOp5SOp5S",
  ,
  "OZ9ROZ9ROZ9ROZ9ROZ9OOZ9OOJ5NOJ5NOJ5NN59NNp5MNp5MNZ9MNZ9MNZ9MNZ9JNZ9JNZ9JM59IM59IM59IM59HMp5GMp5GMp5GMZ9GMZ9GMJ5CMJ5EMJ5E",
  ,
  "MJ5ELp5BLp5BLp5BLp5ALp5ALp5ALZ9ALZ9ALJ4/K58+K58+K58+Kp49Kp49Kp49Kp49Kp46Kp46KZ86KZ86KZ86KZ86KJ45J584J584Jp43Jp43gqwegqwe",
  ,
  "gqwegqwfgawfgawggawggawggawggawhgKwhgKwigKwigKwigKwjf6wjf6wkf6wkf6wkf6wkf6wkf6wlf6slf6smf6smfqsmfqsnfqsnfqsofqsofqsofasp",
  ,
  "faspfasqfasqfasqfKsqfKsrfKsrfKssfKsse6sse6ste6ste6oueqoueqoueqoveqoveqoveaoveaoveaoweaoweaoxeKoxeKoxeKoyeKoyeKozeKozeKo0",
  ,
  "eKo0eKo0eKo1eKo1d6k2d6k2d6k2d6k2d6k3dqk3dqk4dqk4dqk4dqk5dak5dak6dak6dak6dak7dKk7dKk8dKk8dKk8dKk8dKk8c6k9c6k9c6k9c6k+c6k+",
  ,
  "cqk/cqk/cqk/cqlAcqlAcqlBcqlBcqlBcqlBcqlBcalCcalDcalDcalDcalEcKlEcKlFcKlFcKlGcKlGb6hGb6hHb6hHb6hIb6hIb6hIbqhIbqhIbqhJbqhJ",
  ,
  "bqhJbahKbahKbahLbahLbahLbahMbahMbahNbahNbahNbahNbKhObKdObKdObKdOa6dPa6dPa6dQa6dQa6dRa6dRa6dRaqdSaqdSaqdTaqdTaadUaadUaadU",
  ,
  "aadVaadVaKdVaKdVaKdVaKZWaKZWZ6ZXZ6ZXZ6ZXZ6ZYZ6ZYZ6ZZZ6ZZZ6ZZZ6ZaZ6ZaZqZaZqZaZqZaZqZbZqZbZqZcZaZdZaZdZaZdZaZeZaVeQJ5YP59Y",
  ,
  "P59YPp5XPp5XPp5XPp5XPp5UPp5UPZ9UPZ9UPJ5TPJ5TO59TO59TO59TOp5SOp5SOZ9ROZ9ROZ9ROZ9ROZ9OOZ9OOJ5NOJ5NOJ5NN59NNp5MNp5MNZ9MNZ9M",
  ,
  "NZ9MNZ9JNZ9JNZ9JM59IM59IM59IM59HMp5GMp5GMp5GMZ9GMZ9GMJ5CMJ5EMJ5EMJ5ELp5BLp5BLp5BLp5ALp5ALp5ALZ9ALZ9ALJ4/K58+K58+K58+Kp49",
  ,
  "Kp49Kp49Kp49Kp46Kp46KZ86KZ86KZ86KZ86KJ45J584J584Jp43Jp43gqwegqwegqwegqwfgawfgawggawggawggawggawhgKwhgKwigKwigKwigKwjf6wj",
  ,
  "f6wkf6wkf6wkf6wkf6wkf6wlf6slf6smf6smfqsmfqsnfqsnfqsofqsofqsofaspfaspfasqfasqfasqfKsqfKsrfKsrfKssfKsse6sse6ste6ste6oueqou",
  ,
  "eqoueqoveqoveqoveaoveaoveaoweaoweaoxeKoxeKoxeKoyeKoyeKozeKozeKo0eKo0eKo0eKo1eKo1d6k2d6k2d6k2d6k2d6k3dqk3dqk4dqk4dqk4dqk5",
  ,
  "dak5dak6dak6dak6dak7dKk7dKk8dKk8dKk8dKk8dKk8c6k9c6k9c6k9c6k+c6k+cqk/cqk/cqk/cqlAcqlAcqlBcqlBcqlBcqlBcqlBcalCcalDcalDcalD",
  ,
  "calEcKlEcKlFcKlFcKlGcKlGb6hGb6hHb6hHb6hIb6hIb6hIbqhIbqhIbqhJbqhJbqhJbahKbahKbahLbahLbahLbahMbahMbahNbahNbahNbahNbKhObKdO",
  ,
  "bKdObKdOa6dPa6dPa6dQa6dQa6dRa6dRa6dRaqdSaqdSaqdTaqdTaadUaadUaadUaadVaadVaKdVaKdVaKdVaKZWaKZWZ6ZXZ6ZXZ6ZXZ6ZYZ6ZYZ6ZZZ6ZZ",
  ,
  "Z6ZZZ6ZaZ6ZaZqZaZqZaZqZaZqZbZqZbZqZcZaZdZaZdZaZdZaZeZaVeZKVfP59YPp5XPp5XPp5XPp5XPp5XPp5XPZ9WPZ9WPZ9WO59TO59TO59TOp5SOp5S",
  ,
  "Op5SOZ9ROZ9ROZ9ROZ9ROZ9ROZ9ROJ5QN59NN59NN59NNp5MNp5MNZ9MNJ5LNJ5LNZ9LNZ9LNZ9LM59KM59HM59HM59HMp5GMp5GMZ9GMZ9GMJ5FMJ5FMJ5E",
  ,
  "MJ5ELp5BLp5BLp5DLp5DLp5ALp5ALp5ALZ0/LJ4/LJ4/K58+K58+K58+Kp49Kp49Kp49Kp49Kp49Kp49KZ88KJ45KJ45KJ45KJ45J584J584Jp43JZ82JZ82",
  ,
  "gqwegqwegqwegqwfgawfgawggawggawggawggawhgKwhgKwigKwigKwigKwjf6wjf6wkf6wkf6wkf6wkf6wkf6wlf6slf6smf6smfqsmfqsnfqsnfqsofqso",
  ,
  "fqsofaspfaspfasqfasqfasqfKsqfKsrfKsrfKssfKsse6sse6ste6ste6oueqoueqoueqoveqoveqoveaoveaoveaoweaoweaoxeKoxeKoxeKoyeKoyeKoz",
  ,
  "eKozeKo0eKo0eKo0eKo1eKo1d6k2d6k2d6k2d6k2d6k3dqk3dqk4dqk4dqk4dqk5dak5dak6dak6dak6dak7dKk7dKk8dKk8dKk8dKk8dKk8c6k9c6k9c6k9",
  ,
  "c6k+c6k+cqk/cqk/cqk/cqlAcqlAcqlBcqlBcqlBcqlBcqlBcalCcalDcalDcalDcalEcKlEcKlFcKlFcKlGcKlGb6hGb6hHb6hHb6hIb6hIb6hIbqhIbqhI",
  ,
  "bqhJbqhJbqhJbahKbahKbahLbahLbahLbahMbahMbahNbahNbahNbahNbKhObKdObKdObKdOa6dPa6dPa6dQa6dQa6dRa6dRa6dRaqdSaqdSaqdTaqdTaadU",
  ,
  "aadUaadUaadVaadVaKdVaKdVaKdVaKZWaKZWZ6ZXZ6ZXZ6ZXZ6ZYZ6ZYZ6ZZZ6ZZZ6ZZZ6ZaZ6ZaZqZaZqZaZqZaZqZbZqZbZqZcZaZdZaZdZaZdZaZeZaVe",
  ,
  "ZKVfZKVfPp5XPp5XPp5XPp5XPp5XPp5XPZ9WPZ9WPZ9WO59TO59TO59TOp5SOp5SOp5SOZ9ROZ9ROZ9ROZ9ROZ9ROZ9ROJ5QN59NN59PN59PNp5MNp5MNZ9M",
  ,
  "NJ5LNJ5LNZ9LNZ9LNZ9LM59KM59KM59KM59KMp5GMp5GMZ9GMZ9GMJ5FMJ5FMJ5EMJ5ELp5DLp5DLp5DLp5DLp5DLp5DLp5DLZ1CLJ4/LJ4/K58+K58+K58+",
  ,
  "Kp49Kp49Kp49Kp49Kp49Kp49KZ88KJ47KJ47KJ47KJ47J584J584Jp43JZ82JZ82g6wfg6wfg6wfg6wggqwggqwhgqwhgqwhgqwhgqwigawigawjgawjgawj",
  ,
  "gawkgKwkgKwkgKwkgKwkgKwlf6wlf6wmf6smf6snf6snf6snf6sof6sof6spf6spfqspfqsqfqsqfqsqfasqfasqfasrfasrfassfKssfKssfKstfKstfKsu",
  ,
  "fKove6ove6ove6ove6ove6oweqoweqoweqoxeqoxeqoyeaoyeaoyeaozeaozeao0eKo0eKo1eKo1eKo1eKo2eKo2eKk2eKk2eKk2eKk3d6k3d6k4d6k4d6k4",
  ,
  "d6k5dqk5dqk6dqk6dqk6dqk7dak7dak8dak8dak8dak8dKk8dKk9dKk9dKk+dKk+dKk/c6k/c6lAc6lAc6lAc6lBcqlBcqlBcqlBcqlCcqlCcqlCcqlDcqlD",
  ,
  "cqlEcqlEcalEcalFcalFcalGcKlGcKlGcKhHcKhHcKhIb6hIb6hIb6hIb6hIb6hJbqhJbqhKbqhKbqhKbqhLbahLbahMbahMbahMbahNbahNbahObahObahO",
  ,
  "bahObadObadPbKdPbKdQbKdQbKdQbKdRa6dRa6dSa6dSa6dSa6dTaqdTaqdUaqdUaqdUaqdVaadVaadVaadVaadVaadWaKZWaKZXaKZXaKZYaKZYZ6ZYZ6ZZ",
  ,
  "Z6ZZZ6ZaZ6ZaZ6ZaZ6ZaZ6ZaZ6ZbZ6ZbZqZbZqZcZqZcZqZdZaZdZaZdZaZeZaVfZaVfZaVgZaVgPp5XPp5XPp5XPp5XPp5XPZ9WPZ9WPZ9WO59TO59TO59T",
  ,
  "Op5SOp5SOp5SOZ9ROZ9ROZ9ROZ9ROZ9ROZ9ROJ5QN59NN59PN59PNp5MNp5MNZ9MNJ5LNJ5LNZ9LNZ9LNZ9LM59KM59KM59KM59KMp5GMp5GMZ9GMZ9GMJ5F",
  ,
  "MJ5FMJ5EMJ5ELp5DLp5DLp5DLp5DLp5DLp5DLp5DLZ1CLJ4/LJ4/K58+K58+K58+Kp49Kp49Kp49Kp49Kp49Kp49KZ88KJ47KJ47KJ47KJ47J584J584Jp43",
  ,
  "JZ82JZ82hKwfhKwfhKwfhKwgg6wgg6whg6whg6whg6whg6wigqwigqwjgqwjgqwjgqwkgawkgawkgawkgawkgawlgKwlgKwmgKsmgKsngKsnf6snf6sof6so",
  ,
  "f6spf6spf6spf6sqf6sqf6sqfqsqfqsqfqsrfqsrfqssfassfassfastfastfasufKovfKovfKovfKovfKove6owe6owe6owe6oxe6oxeqoyeqoyeqoyeqoz",
  ,
  "eqozeao0eao0eao1eao1eao1eKo2eKo2eKk2eKk2eKk2eKk3eKk3eKk4eKk4eKk4d6k5d6k5d6k6d6k6d6k6dqk7dqk7dqk8dqk8dak8dak8dak8dak9dak9",
  ,
  "dKk+dKk+dKk/dKk/dKlAc6lAc6lAc6lBc6lBc6lBcqlBcqlCcqlCcqlCcqlDcqlDcqlEcqlEcqlEcqlFcqlFcalGcalGcalGcahHcahHcKhIcKhIcKhIcKhI",
  ,
  "cKhIb6hJb6hJb6hKb6hKb6hKbqhLbqhLbqhMbqhMbqhMbahNbahNbahObahObahObahObadObadPbadPbadQbadQbKdQbKdRbKdRbKdSbKdSa6dSa6dTa6dT",
  ,
  "a6dUaqdUaqdUaqdVaqdVaqdVaadVaadVaadWaaZWaaZXaKZXaKZYaKZYaKZYaKZZZ6ZZZ6ZaZ6ZaZ6ZaZ6ZaZ6ZaZ6ZbZ6ZbZ6ZbZ6ZcZqZcZqZdZqZdZqZd",
  ,
  "ZqZeZaVfZaVfZaVgZaVgZaVgP59YP59YPp5XPp5XPZ9WPZ9WPZ9WO59VO59VO59VO59SO59SO59SOZ9ROZ9ROZ9ROZ9ROZ9ROZ9ROKBRN59PN59PN59PN59N",
  ,
  "N59NNZ9ONZ9LNZ9LNZ9LNZ9LNZ9LM59KM59KM59KM59KMp5JMp5JMZ9GMZ9GMJ5FMZ9FL59EL59EL59EL59EL59EL59ELp5DLp5DLp5DLZ9DLKBCLKBCK59B",
  ,
  "K59BK59BK58+K58+K58+Kp49Kp49Kp49KZ88KKA8KKA8KKA8KKA8J587J587JqA6JZ82JZ82hKwfhKwfhKwfhKwghKwghKwhhKwhhKwhhKwhg6wig6wig6wj",
  ,
  "g6wjg6wjgqwkgqwkgqwkgqwkgqwkgawlgawlgawmgasmgKsngKsngKsngKsogKsof6spf6spf6spf6sqf6sqf6sqf6sqf6sqf6srf6srfqssfqssfqssfqst",
  ,
  "fqstfasufaovfaovfaovfaovfKovfKowfKowfKowfKoxe6oxe6oye6oye6oye6ozeqozeqo0eqo0eqo1eqo1eao1eao2eao2eak2eak2eKk2eKk3eKk3eKk4",
  ,
  "eKk4eKk4eKk5eKk5eKk6d6k6d6k6d6k7d6k7d6k8dqk8dqk8dqk8dqk8dqk9dak9dak+dak+dak/dak/dKlAdKlAdKlAdKlBdKlBc6lBc6lBc6lCc6lCc6lC",
  ,
  "cqlDcqlDcqlEcqlEcqlEcqlFcqlFcqlGcqlGcqlGcahHcahHcahIcahIcahIcKhIcKhIcKhJcKhJb6hKb6hKb6hKb6hLb6hLbqhMbqhMbqhMbqhNbqhNbahO",
  ,
  "bahObahObahObadObadPbadPbadQbadQbadQbadRbKdRbKdSbKdSbKdSbKdTa6dTa6dUa6dUa6dUa6dVaqdVaqdVaqdVaqdVaqdWaaZWaaZXaaZXaaZYaaZY",
  ,
  "aKZYaKZZaKZZaKZaaKZaZ6ZaZ6ZaZ6ZaZ6ZbZ6ZbZ6ZbZ6ZcZ6ZcZ6ZdZqZdZqZdZqZeZqVfZqVfZaVgZaVgZaVgZaVgP59aPp5XPp5XPZ9WPZ9WPZ9WO59V",
  ,
  "O59VO59VO59VO59VO59VOZ9TOZ9TOZ9TOZ9ROZ9ROZ9ROKBRN59PN59PN59PN59PN59PNZ9ONZ9LNZ9LNZ9LNZ9ONZ9OM59KM59KM59KM59KMp5JMp5JMZ9I",
  ,
  "MZ9IMJ5HMZ9IL59EL59EL59EL59EL59EL59ELp5DLp5DLp5DLZ9DLKBCLKBCK59BK59BK59BK59BK59BK59BKp49Kp49Kp49KZ88KKA8KKA8KKA8KKA8J587",
  ,
  "J587JqA6JZ85JZ85hasfhasfhasfhKsghKsghKshhKshhKshhKshhKsihKsihKsjhKsjhKsjg6skg6skg6skg6skg6skgqslgqslgqsmgqsmgaongaongaon",
  ,
  "gaoogaoogKopgKopgKopgKoqgKoqf6oqf6oqf6oqf6orf6orf6osf6osf6osf6otf6otfqoufqovfqovfqovfqovfakvfakwfakwfakwfakxfKkxfKkyfKky",
  ,
  "fKkyfKkze6kze6k0e6k0e6k1e6k1eqk1eqk2eqk2eak2eak2eak2eak3eak3eKk4eKk4eKk4eKk5eKk5eKk6eKk6eKk6eKk7eKk7d6k8d6k8d6k8d6k8d6k8",
  ,
  "dqk9dqk9dqk+dqk+dqk/dak/dalAdalAdalAdalBdKhBdKhBdKhBdKhCdKhCc6hCc6hDc6hDc6hEc6hEcqhEcqhFcqhFcqhGcqhGcqhGcqhHcqhHcqhIcahI",
  ,
  "cahIcahIcahIcahJcKdJcKdKcKdKcKdKcKdLb6dLb6dMb6dMb6dMbqdNbqdNbqdObqdObqdObqdObadObadPbadPbadQbadQbadQbadRbadRbadSbadSbKZS",
  ,
  "bKZTbKZTbKZUa6ZUa6ZUa6ZVa6ZVa6ZVaqZVaqZVaqZWaqZWaqZXaaZXaaZYaaZYaaZYaaZZaKZZaKZaaKZaaKZaaKZaZ6VaZ6VbZ6VbZ6VbZ6VcZ6VcZ6Vd",
  ,
  "Z6VdZ6VdZ6VeZqVfZqVfZqVgZqVgZqVgZaVgZaVgPp5ZPZ9WPJ5VPJ5VPJ5VO59VO59VO59VOZ9TOZ9TOZ9TOZ9TOZ9TOZ9TOJ5QOJ5QOKBRN59PN59PN59P",
  ,
  "N59PNZ9ONZ9ONZ9ONZ9ONZ9ONZ9OM59KM59KM59KMp5JMp5JMp5JMZ9IMZ9IMJ5HMJ5HMJ5HL59HL59HL59HL59HL59HLp5DLp5DLZ9DLZ9DLZ9DLJ5BK59B",
  ,
  "K59BK59BK59BK59BK59BKp5AKp5AKZ8/KZ8/KZ8/KKA8J587J587J587J587JqA6JqA6JZ85JZ85JZ85hasfhasfhasfhKsghKsghKshhKshhKshhKshhKsi",
  ,
  "hKsihKsjhKsjhKsjg6skg6skg6skg6skg6skgqslgqslgqsmgqsmgaongaongaongaoogaoogKopgKopgKopgKoqgKoqf6oqf6oqf6oqf6orf6orf6osf6os",
  ,
  "f6osf6otf6otfqoufqovfqovfqovfqovfakvfakwfakwfakwfakxfKkxfKkyfKkyfKkyfKkze6kze6k0e6k0e6k1e6k1eqk1eqk2eqk2eak2eak2eak2eak3",
  ,
  "eak3eKk4eKk4eKk4eKk5eKk5eKk6eKk6eKk6eKk7eKk7d6k8d6k8d6k8d6k8d6k8dqk9dqk9dqk+dqk+dqk/dak/dalAdalAdalAdalBdKhBdKhBdKhBdKhC",
  ,
  "dKhCc6hCc6hDc6hDc6hEc6hEcqhEcqhFcqhFcqhGcqhGcqhGcqhHcqhHcqhIcahIcahIcahIcahIcahJcKdJcKdKcKdKcKdKcKdLb6dLb6dMb6dMb6dMbqdN",
  ,
  "bqdNbqdObqdObqdObqdObadObadPbadPbadQbadQbadQbadRbadRbadSbadSbKZSbKZTbKZTbKZUa6ZUa6ZUa6ZVa6ZVa6ZVaqZVaqZVaqZWaqZWaqZXaaZX",
  ,
  "aaZYaaZYaaZYaaZZaKZZaKZaaKZaaKZaaKZaZ6VaZ6VbZ6VbZ6VbZ6VcZ6VcZ6VdZ6VdZ6VdZ6VeZqVfZqVfZqVgZqVgZqVgZaVgZaVgZaVhPZ9ZPJ5YPJ5Y",
  ,
  "PJ5YO59VO59VO59VOZ9TOZ9TOZ9TOZ9TOZ9TOZ9TOJ5SOJ5SOKBTN59SN59PN59PN59PNZ9ONZ9ONZ9ONZ9ONZ9ONZ9OM59NM59NM59KMp5JMp5JMp5JMZ9I",
  ,
  "MZ9IMJ5HMJ5HMJ5HL59HL59HL59HL59HL59HLp5FLp5FLZ9DLZ9DLZ9DLJ5BK59BK59BK59BK59BK59BK59BKp5AKp5AKZ8/KZ8/KZ8/KKA8J587J587J587",
  ,
  "J587JqA6JqA6JZ85JZ85JZ85hqsghqsghqsghashhashhasihasihasihasihKsjhKsjhKskhKskhKskhKskhKskhKslhKslhKslg6smg6smg6sng6sngqoo",
  ,
  "gqoogqoogqopgqopgaoqgaoqgaoqgaoqgaoqgKorgKorgKorgKosf6osf6otf6otf6otf6ouf6ouf6ovf6ovf6ovf6ovfqovfqkwfqkwfqkxfqkxfakxfaky",
  ,
  "fakyfakzfakzfKkzfKk0fKk0fKk1e6k2e6k2e6k2e6k2e6k2eqk3eqk3eqk3eqk4eak4eak5eak5eak5eak6eKk6eKk7eKk7eKk7eKk8eKk8eKk8eKk8eKk9",
  ,
  "eKk9d6k9d6k+d6k+d6k/d6k/dqk/dqlAdqlAdqlBdqlBdalBdahBdahBdahCdKhCdKhCdKhDdKhDdKhEc6hEc6hEc6hFc6hFcqhGcqhGcqhHcqhHcqhHcqhI",
  ,
  "cqhIcqhIcqhIcqhIcahJcahJcadKcadKcadKcKdLcKdMcKdMcKdNcKdNb6dNb6dOb6dOb6dOb6dOb6dObqdObqdPbqdPbqdQbadQbadQbadRbadRbadSbadS",
  ,
  "badSbaZTbaZTbKZUbKZUbKZVbKZVbKZVa6ZVa6ZVa6ZWa6ZWa6ZWaqZXaqZXaqZYaqZYaqZYaaZZaaZZaaZaaaZaaaZaaKZaaKZaaKVbaKVbaKVbZ6VcZ6Vc",
  ,
  "Z6VdZ6VdZ6VeZ6VeZ6VeZ6VfZqVfZqVgZqVgZqVgZqVgZaVgZaVhZaViPJ5YPJ5YPJ5YO59VO59VO59VOZ9TOZ9TOZ9TOZ9TOZ9TOZ9TOJ5SOJ5SOKBTN59S",
  ,
  "N59PN59PN59PNZ9ONZ9ONZ9ONZ9ONZ9ONZ9OM59NM59NM59KMp5JMp5JMp5JMZ9IMZ9IMJ5HMJ5HMJ5HL59HL59HL59HL59HL59HLp5FLp5FLZ9DLZ9DLZ9D",
  ,
  "LJ5BK59BK59BK59BK59BK59BK59BKp5AKp5AKZ8/KZ8/KZ8/KKA8J587J587J587J587JqA6JqA6JZ85JZ85JZ85h6sgh6sgh6sghqshhqshhqsihqsihqsi",
  ,
  "hqsihasjhasjhaskhaskhaskhKskhKskhKslhKslhKslhKsmhKsmhKsnhKsng6oog6oog6oog6opgqopgqoqgqoqgqoqgqoqgaoqgaorgaorgaorgaosgKos",
  ,
  "gKotgKotgKotgKouf6ouf6ovf6ovf6ovf6ovf6ovf6kwf6kwfqkxfqkxfqkxfqkyfqkyfakzfakzfakzfak0fak0fKk1fKk2fKk2fKk2fKk2e6k2e6k3e6k3",
  ,
  "e6k3e6k4eqk4eqk5eqk5eqk5eak6eak6eak7eak7eak7eKk8eKk8eKk8eKk8eKk9eKk9eKk9eKk+eKk+d6k/d6k/d6k/d6lAd6lAdqlBdqlBdqlBdqhBdahB",
  ,
  "dahCdahCdahCdahDdKhDdKhEdKhEdKhEdKhFc6hFc6hGc6hGc6hHc6hHcqhHcqhIcqhIcqhIcqhIcqhIcqhJcqhJcadKcadKcadKcadLcadMcKdMcKdNcKdN",
  ,
  "cKdNcKdOb6dOb6dOb6dOb6dOb6dOb6dPbqdPbqdQbqdQbqdQbqdRbadRbadSbadSbadSbaZTbaZTbaZUbaZUbKZVbKZVbKZVbKZVbKZVa6ZWa6ZWa6ZWa6ZX",
  ,
  "a6ZXaqZYaqZYaqZYaqZZaqZZaaZaaaZaaaZaaaZaaaZaaKVbaKVbaKVbaKVcZ6VcZ6VdZ6VdZ6VeZ6VeZ6VeZ6VfZ6VfZ6VgZ6VgZqVgZqVgZqVgZqVhZaVi",
  ,
  "ZaViPJ5YPJ5YO59XO59XO59VOZ9TOZ9TOZ9TOZ9TOZ9TOZ9TOJ5SOJ5SOKBTN59SN59SN59SN59SNZ9ONZ9ONZ9ONZ9ONZ9ONZ9OM59NM59NM59MMp5LMp5L",
  ,
  "Mp5LMZ9IMZ9IMJ5HMJ5HMJ5HL59HL59HL59HL59HL59HLp5FLp5FLZ9DLZ9DLZ9DLJ5BK59BK59BK59BK59BK59BK59BKp5AKp5AKZ8/KZ8/KZ8/KKA/J58+",
  ,
  "J58+J58+J58+JqA6JqA6JZ85JZ85JZ85iKsgiKsgiKsgh6shh6shh6sih6sih6sih6sihqsjhqsjhqskhqskhqskhaskhaskhaslhaslhaslhKsmhKsmhKsn",
  ,
  "hKsnhKoohKoohKoohKopg6opg6oqg6oqg6oqg6oqgqoqgqorgqorgqorgqosgaosgaotgaotgaotgKougKougKovgKovf6ovf6ovf6ovf6kwf6kwf6kxf6kx",
  ,
  "f6kxf6kyf6kyfqkzfqkzfqkzfqk0fak0fak1fak2fak2fak2fKk2fKk2fKk3fKk3fKk3e6k4e6k4e6k5e6k5e6k5eqk6eqk6eqk7eak7eak7eak8eak8eak8",
  ,
  "eKk8eKk9eKk9eKk9eKk+eKk+eKk/eKk/eKk/eKlAd6lAd6lBd6lBd6lBdqhBdqhBdqhCdqhCdqhCdahDdahDdahEdahEdahEdKhFdKhFdKhGdKhGc6hHc6hH",
  ,
  "c6hHc6hIcqhIcqhIcqhIcqhIcqhJcqhJcqdKcqdKcqdKcqdLcadMcadMcadNcadNcadNcKdOcKdOcKdOcKdOcKdOb6dOb6dPb6dPb6dQbqdQbqdQbqdRbqdR",
  ,
  "bqdSbadSbadSbaZTbaZTbaZUbaZUbaZVbaZVbaZVbKZVbKZVbKZWbKZWbKZWa6ZXa6ZXa6ZYa6ZYa6ZYaqZZaqZZaqZaaqZaaqZaaaZaaaZaaaVbaKVbaKVb",
  ,
  "aKVcaKVcaKVdZ6VdZ6VeZ6VeZ6VeZ6VfZ6VfZ6VgZ6VgZ6VgZ6VgZqVgZqVhZqViZqViZaViPJ5YO59XO59XO59VOZ9TOZ9TOZ9TOZ9TOZ9TOZ9TOJ5SOJ5S",
  ,
  "OKBTN59SN59SN59SN59SNZ9ONZ9ONZ9ONZ9ONZ9ONZ9OM59NM59NM59MMp5LMp5LMp5LMZ9IMZ9IMJ5HMJ5HMJ5HL59HL59HL59HL59HL59HLp5FLp5FLZ9D",
  ,
  "LZ9DLZ9DLJ5BK59BK59BK59BK59BK59BK59BKp5AKp5AKZ8/KZ8/KZ8/KKA/J58+J58+J58+J58+JqA6JqA6JZ85JZ85JZ85iKsgiKsgiKsgh6shh6shh6si",
  ,
  "h6sih6sih6sihqsjhqsjhqskhqskhqskhaskhaskhaslhaslhaslhKsmhKsmhKsnhKsnhKoohKoohKoohKopg6opg6oqg6oqg6oqg6oqgqoqgqorgqorgqor",
  ,
  "gqosgaosgaotgaotgaotgKougKougKovgKovf6ovf6ovf6ovf6kwf6kwf6kxf6kxf6kxf6kyf6kyfqkzfqkzfqkzfqk0fak0fak1fak2fak2fak2fKk2fKk2",
  ,
  "fKk3fKk3fKk3e6k4e6k4e6k5e6k5e6k5eqk6eqk6eqk7eak7eak7eak8eak8eak8eKk8eKk9eKk9eKk9eKk+eKk+eKk/eKk/eKk/eKlAd6lAd6lBd6lBd6lB",
  ,
  "dqhBdqhBdqhCdqhCdqhCdahDdahDdahEdahEdahEdKhFdKhFdKhGdKhGc6hHc6hHc6hHc6hIcqhIcqhIcqhIcqhIcqhJcqhJcqdKcqdKcqdKcqdLcadMcadM",
  ,
  "cadNcadNcadNcKdOcKdOcKdOcKdOcKdOb6dOb6dPb6dPb6dQbqdQbqdQbqdRbqdRbqdSbadSbadSbaZTbaZTbaZUbaZUbaZVbaZVbaZVbKZVbKZVbKZWbKZW",
  ,
  "bKZWa6ZXa6ZXa6ZYa6ZYa6ZYaqZZaqZZaqZaaqZaaqZaaaZaaaZaaaVbaKVbaKVbaKVcaKVcaKVdZ6VdZ6VeZ6VeZ6VeZ6VfZ6VfZ6VgZ6VgZ6VgZ6VgZqVg",
  ,
  "ZqVhZqViZqViZaViZaVjO59XO59XOqBXOqBXOqBXOqBXOZ9TOZ9TOKBTN59SN59SN59SN59SN59SNZ9ONZ9ONZ9ONZ9ONZ9ONZ9ONZ9OM59NM59MM59MMqBM",
  ,
  "MqBMMqBMMZ9IMZ9IMZ9IL59HL59HL59HL59HL59HL59HLqBGLqBGLZ9FLZ9FLKBFLKBFLKBFK59BK59BKqBAKqBAKqBAKqBAKqBAKZ8/KZ8/KKA/KKA/KKA/",
  ,
  "J58+JqA9JqA9JqA9JqA9JqA6JqA6JqA6JZ85JZ85iKsgiKsgiKsgh6shh6shh6sih6sih6sih6sihqsjhqsjhqskhqskhqskhaskhaskhaslhaslhaslhKsm",
  ,
  "hKsmhKsnhKsnhKoohKoohKoohKopg6opg6oqg6oqg6oqg6oqgqoqgqorgqorgqorgqosgaosgaotgaotgaotgKougKougKovgKovf6ovf6ovf6ovf6kwf6kw",
  ,
  "f6kxf6kxf6kxf6kyf6kyfqkzfqkzfqkzfqk0fak0fak1fak2fak2fak2fKk2fKk2fKk3fKk3fKk3e6k4e6k4e6k5e6k5e6k5eqk6eqk6eqk7eak7eak7eak8",
  ,
  "eak8eak8eKk8eKk9eKk9eKk9eKk+eKk+eKk/eKk/eKk/eKlAd6lAd6lBd6lBd6lBdqhBdqhBdqhCdqhCdqhCdahDdahDdahEdahEdahEdKhFdKhFdKhGdKhG",
  ,
  "c6hHc6hHc6hHc6hIcqhIcqhIcqhIcqhIcqhJcqhJcqdKcqdKcqdKcqdLcadMcadMcadNcadNcadNcKdOcKdOcKdOcKdOcKdOb6dOb6dPb6dPb6dQbqdQbqdQ",
  ,
  "bqdRbqdRbqdSbadSbadSbaZTbaZTbaZUbaZUbaZVbaZVbaZVbKZVbKZVbKZWbKZWbKZWa6ZXa6ZXa6ZYa6ZYa6ZYaqZZaqZZaqZaaqZaaqZaaaZaaaZaaaVb",
  ,
  "aKVbaKVbaKVcaKVcaKVdZ6VdZ6VeZ6VeZ6VeZ6VfZ6VfZ6VgZ6VgZ6VgZ6VgZqVgZqVhZqViZqViZaViZaVjYKF7O59XOqBXOqBXOqBXOqBXOZ9TOZ9TOKBT",
  ,
  "N59SN59SN59SN59SN59SNZ9ONZ9ONZ9ONZ9ONZ9ONZ9ONZ9OM59NM59MM59MMqBMMqBMMqBMMZ9LMZ9IMZ9IL59HL59HL59HL59HL59HL59HLqBGLqBGLZ9F",
  ,
  "LZ9FLKBFLKBFLKBFK59EK59BKqBAKqBAKqBAKqBAKqBAKZ8/KZ8/KKA/KKA/KKA/J58+JqA9JqA9JqA9JqA9JqA9JqA9JqA9JZ88JZ88iashiashiashiKsi",
  ,
  "iKsiiKsjiKsjiKsjiKsjh6skh6skh6skh6skh6skhqslhqslhqsmhasmhasmhasnhasnhasohKsohKophKophKophKoqhKoqhKoqhKoqhKoqg6org6org6os",
  ,
  "g6osg6osgqotgqotgqougqougqougaovgaovgaovgKovgKowgKowgKowgKkxf6kxf6kyf6kyf6kyf6kzf6kzf6k0f6k0f6k0f6k1fqk1fqk2fqk2fqk2fak2",
  ,
  "fak2fak3fak3fak3fKk4fKk4fKk5fKk5e6k6e6k6e6k6e6k7eqk7eqk8eqk8eqk8eqk8eak8eak9eak9eak9eak+eKk+eKk/eKk/eKk/eKlAeKlAeKlBeKlB",
  ,
  "eKlBd6lBd6hBd6hCd6hCdqhDdqhDdqhDdqhEdqhFdahFdahFdahGdahGdKhHdKhHdKhIdKhIdKhIc6hIc6hIc6hJc6hJc6hJcqhKcqhKcqdLcqdLcqdLcqdM",
  ,
  "cqdMcqdNcadNcadNcadOcadOcadOcKdOcKdOcKdOcKdPcKdPb6dQb6dQb6dRb6dRb6dRbqdSbqdSbqdTbqdTbqZTbaZUbaZUbaZVbaZVbaZVbaZVbaZVbaZW",
  ,
  "bKZWbKZWbKZXbKZXbKZYa6ZYa6ZZa6ZZa6ZZa6ZaaqZaaqZaaqZaaqZaaaZbaaVbaaVcaaVcaaVcaKVdaKVdaKVeaKVeaKVeZ6VfZ6VfZ6VgZ6VgZ6VgZ6Vg",
  ,
  "Z6VgZ6VhZqVhZqViZqViZqViZqVjZaVjZaRkOqBXOqBXOqBXOqBXOZ9TOZ9TOKBTN59SN59SN59SN59SN59SNZ9ONZ9ONZ9ONZ9ONZ9ONZ9ONZ9OM59NM59M",
  ,
  "M59MMqBMMqBMMqBMMZ9LMZ9IMZ9IL59HL59HL59HL59HL59HL59HLqBGLqBGLZ9FLZ9FLKBFLKBFLKBFK59EK59BKqBAKqBAKqBAKqBAKqBAKZ8/KZ8/KKA/",
  ,
  "KKA/KKA/J58+JqA9JqA9JqA9JqA9JqA9JqA9JqA9JZ88JZ88iqshiqshiqshiasiiasiiasjiasjiasjiasjiKskiKskiKskh6skh6skh6slh6slh6smhqsm",
  ,
  "hqsmhqsnhqsnhqsohasohaophaophaophKoqhKoqhKoqhKoqhKoqhKorhKorhKoshKoshKosg6otg6otg6ougqougqougqovgqovgqovgaovgaowgaowgaow",
  ,
  "gakxgKkxgKkygKkygKkyf6kzf6kzf6k0f6k0f6k0f6k1f6k1f6k2f6k2f6k2fqk2fqk2fqk3fak3fak3fak4fak4fak5fKk5fKk6fKk6fKk6e6k7e6k7e6k8",
  ,
  "e6k8e6k8eqk8eqk8eqk9eqk9eqk9eak+eak+eak/eKk/eKk/eKlAeKlAeKlBeKlBeKlBeKlBeKhBeKhCd6hCd6hDd6hDd6hDdqhEdqhFdqhFdqhFdqhGdahG",
  ,
  "dahHdahHdahIdahIdKhIdKhIdKhIc6hJc6hJc6hJc6hKc6hKcqdLcqdLcqdLcqdMcqdMcqdNcqdNcqdNcqdOcadOcadOcadOcadOcadOcadPcKdPcKdQcKdQ",
  ,
  "b6dRb6dRb6dRb6dSb6dSbqdTbqdTbqZTbqZUbqZUbaZVbaZVbaZVbaZVbaZVbaZWbaZWbaZWbaZXbKZXbKZYbKZYbKZZbKZZa6ZZa6Zaa6ZaaqZaaqZaaqZa",
  ,
  "aqZbaqVbaaVcaaVcaaVcaaVdaaVdaKVeaKVeaKVeaKVfZ6VfZ6VgZ6VgZ6VgZ6VgZ6VgZ6VhZ6VhZ6ViZ6ViZqViZqVjZqVjZaRkZaRkOqBXOqBXOqBXOZ9W",
  ,
  "OZ9WOKBTN59SN59SN59SN59SN59SNZ9RNZ9RNZ9ONZ9ONZ9ONZ9QNZ9QM59NM59MM59MMqBMMqBMMqBMMZ9LMZ9LMZ9LL59JL59JL59JL59HL59HL59JLqBG",
  ,
  "LqBGLZ9FLZ9FLKBFLKBFLKBFK59EK59DKqBDKqBDKqBDKqBDKqBDKZ8/KZ9CKKA/KKA/KKA/J58+JqA9JqA9JqA9JqA9JqA9JqA9JqA9JZ88JZ88iqohiqoh",
  ,
  "iqohiqoiiqoiiqojiqojiqojiqojiaokiaokiaokiKokiKokiKoliKoliKomh6omh6omh6onh6onhqoohqoohqophqophqophakqhakqhakqhakqhakqhKkr",
  ,
  "hKkrhKkshKkshKkshKkthKkthKkug6kug6kug6kvg6kvgqkvgqkvgqkwgqkwgqkwgakxgakxgakygakygakygKkzgKkzgKk0gKk0f6k0f6k1f6k1f6k2f6k2",
  ,
  "f6k2f6k2f6k2fqk3fqk3fqk3fqk4fqk4fak5fak5fak6fak6fak6fKk7fKk7fKg8fKg8e6g8e6g8e6g8e6g9eqg9eqg9eqg+eqg+eag/eag/eag/eahAeahA",
  ,
  "eKhBeKhBeKhBeKhBeKhBeKhCeKhCeKhDeKhDd6hDd6hEd6hFd6dFd6dFdqdGdqdGdqdHdadHdadIdadIdadIdadIdKdIdKdJdKdJdKdJc6dKc6dKc6dLc6dL",
  ,
  "c6dLcqdMcqdMcqdNcqdNcqdNcqdOcqdOcqZOcaZOcaZOcaZOcaZPcaZPcaZQcKZQcKZRcKZRcKZRb6ZSb6ZSb6ZTb6ZTb6ZTbqZUbqZUbqZVbqZVbqZVbaZV",
  ,
  "baZVbaZWbaZWbaZWbaZXbaVXbaVYbKVYbKVZbKVZbKVZa6Vaa6Vaa6Vaa6Vaa6VaaqVbaqVbaqVcaqVcaqVcaaVdaaVdaaVeaKVeaKVeaKVfaKVfaKVgZ6Vg",
  ,
  "Z6VgZ6RgZ6RgZ6RhZ6RhZ6RiZ6RiZ6RiZqRjZqRjZqRkZqRkZqRkOqBXOqBXOZ9WOZ9WOKBWN59SN59SN59SN59SN59SNZ9RNZ9RNZ9QNZ9QNZ9QNZ9QNZ9Q",
  ,
  "M59NM59PM59PMqBMMqBMMqBMMZ9LMZ9LMZ9LL59JL59JL59JL59JL59JL59JLqBJLqBJLZ9ILZ9ILKBFLKBFLKBFK59EK59DKqBDKqBDKqBDKqBDKqBDKZ9C",
  ,
  "KZ9CKKBBKKBBKKBBJ59BJqA9JqA9JqA9JqA9JqA9JqA9JqA9JZ88JZ88iqohiqohiqohiqoiiqoiiqojiqojiqojiqojiaokiaokiaokiKokiKokiKoliKol",
  ,
  "iKomh6omh6omh6onh6onhqoohqoohqophqophqophakqhakqhakqhakqhakqhKkrhKkrhKkshKkshKkshKkthKkthKkug6kug6kug6kvg6kvgqkvgqkvgqkw",
  ,
  "gqkwgqkwgakxgakxgakygakygakygKkzgKkzgKk0gKk0f6k0f6k1f6k1f6k2f6k2f6k2f6k2f6k2fqk3fqk3fqk3fqk4fqk4fak5fak5fak6fak6fak6fKk7",
  ,
  "fKk7fKg8fKg8e6g8e6g8e6g8e6g9eqg9eqg9eqg+eqg+eag/eag/eag/eahAeahAeKhBeKhBeKhBeKhBeKhBeKhCeKhCeKhDeKhDd6hDd6hEd6hFd6dFd6dF",
  ,
  "dqdGdqdGdqdHdadHdadIdadIdadIdadIdKdIdKdJdKdJdKdJc6dKc6dKc6dLc6dLc6dLcqdMcqdMcqdNcqdNcqdNcqdOcqdOcqZOcaZOcaZOcaZOcaZPcaZP",
  ,
  "caZQcKZQcKZRcKZRcKZRb6ZSb6ZSb6ZTb6ZTb6ZTbqZUbqZUbqZVbqZVbqZVbaZVbaZVbaZWbaZWbaZWbaZXbaVXbaVYbKVYbKVZbKVZbKVZa6Vaa6Vaa6Va",
  ,
  "a6Vaa6VaaqVbaqVbaqVcaqVcaqVcaaVdaaVdaaVeaKVeaKVeaKVfaKVfaKVgZ6VgZ6VgZ6RgZ6RgZ6RhZ6RhZ6RiZ6RiZ6RiZqRjZqRjZqRkZqRkZqRkZaRl",
  ,
  "OZ9WOKBWOKBWN59SN59UN59UN59SNZ9RNZ9RNZ9QNZ9QNZ9QNZ9QM59PM59PM59PM59PM59PMqBMMZ9LMZ9LMZ9LMZ9LL59JL59JL59JL59JL59JL59JLqBJ",
  ,
  "LqBJLZ9ILZ9ILZ9ILKBIK59EK59EK59EK59DK59DKqBDKqBDKqBDKqBDKZ9CKKBBKKBBJ59BJ59BJ59BJqA9JqA9JqA9JqA9JqA9JqA9JqA9JZ88JKA7JKA7",
  ,
  "i6ohi6ohi6ohiqoiiqoiiqojiqojiqojiqojiqokiqokiqokiaokiaokiaoliaoliaomiKomiKomiKoniKonh6ooh6ooh6oph6oph6ophqkqhqkqhqkqhqkq",
  ,
  "hakqhakrhakrhakshKkshKkshKkthKkthKkuhKkuhKkuhKkvhKkvg6kvg6kvg6kwg6kwgqkwgqkxgqkxgqkygqkygakygakzgakzgak0gak0gKk0gKk1gKk1",
  ,
  "f6k2f6k2f6k2f6k2f6k2f6k3f6k3f6k3f6k4fqk4fqk5fqk5fqk6fqk6fak6fak7fak7fKg8fKg8fKg8fKg8fKg8e6g9e6g9e6g9e6g+eqg+eqg/eqg/eqg/",
  ,
  "eqhAeahAeahBeahBeahBeKhBeKhBeKhCeKhCeKhDeKhDeKhDeKhEeKhFd6dFd6dFd6dGd6dGdqdHdqdHdqdIdqdIdqdIdadIdadIdadJdadJdKdJdKdKdKdK",
  ,
  "dKdLc6dLc6dLc6dMc6dMcqdNcqdNcqdNcqdOcqdOcqZOcqZOcqZOcqZOcqZPcaZPcaZQcaZQcaZRcaZRcKZRcKZScKZSb6ZTb6ZTb6ZTb6ZUb6ZUbqZVbqZV",
  ,
  "bqZVbqZVbaZVbaZWbaZWbaZWbaZXbaVXbaVYbaVYbaVZbaVZbKVZbKVabKVaa6Vaa6Vaa6Vaa6Vba6VbaqVcaqVcaqVcaqVdaaVdaaVeaaVeaaVeaaVfaKVf",
  ,
  "aKVgaKVgaKVgZ6RgZ6RgZ6RhZ6RhZ6RiZ6RiZ6RiZ6RjZqRjZqRkZqRkZqRkZqRlZaRlOKBWOKBWN59SN59UN59UN59SNZ9RNZ9RNZ9QNZ9QNZ9QNZ9QM59P",
  ,
  "M59PM59PM59PM59PMqBMMZ9LMZ9LMZ9LMZ9LL59JL59JL59JL59JL59JL59JLqBJLqBJLZ9ILZ9ILZ9ILKBIK59EK59EK59EK59DK59DKqBDKqBDKqBDKqBD",
  ,
  "KZ9CKKBBKKBBJ59BJ59BJ59BJqA9JqA9JqA9JqA9JqA9JqA9JqA9JZ88JKA7JKA7jKoijKoijKoii6oji6oji6okiqokiqokiqokiqokiqokiqoliqoliqol",
  ,
  "iqomiqomiaoniaoniaoniaooiaooiKopiKopiKoqiKoqh6oqh6kqh6kqh6krh6krhqkrhqkshqkshakthakthakthakuhakuhKkvhKkvhKkvhKkvhKkvhKkw",
  ,
  "hKkwhKkxhKkxg6kxg6kyg6kygqkzgqkzgqkzgqk0gqk0gak1gak1gak1gak2gKk2gKk2gKk2gKk2gKk3f6k3f6k4f6k4f6k4f6k5f6k5f6k6f6k6fqk7fqk7",
  ,
  "fqk7fqk8fak8fag8fag8fag8fag9fKg9fKg+fKg+fKg+e6g/e6g/e6hAe6hAe6hAeqhBeqhBeqhBeahBeahBeahCeahCeahDeKhDeKhEeKhEeKhEeKhFeKhF",
  ,
  "eKdGeKdGeKdGd6dHd6dHd6dIdqdIdqdIdqdIdqdIdqdJdadJdadJdadKdadKdKdLdKdLdKdMdKdMdKdMc6dNc6dNc6dOc6dOcqdOcqdOcqZOcqZPcqZPcqZP",
  ,
  "cqZPcqZQcqZQcaZRcaZRcaZRcaZScaZScKZTcKZTcKZTcKZUb6ZUb6ZVb6ZVb6ZVb6ZVbqZVbqZWbqZWbaZXbaZXbaZXbaVYbaVYbaVZbaVZbaVZbaVabKVa",
  ,
  "bKVabKVabKVabKVba6Vba6Vca6Vca6VcaqVdaqVdaqVeaqVeaaVfaaVfaaVfaaVgaKVgaKVgaKVgaKRgaKRhZ6RhZ6RiZ6RiZ6RiZ6RjZ6RjZ6RkZ6RkZ6Rk",
  ,
  "ZqRlZqRlZqRmZaRmOKBWN59UN59UN59UN59SNZ9TNZ9TNZ9QNZ9QNZ9QNZ9QM59PM59PM59PM59PM59PMqBPMZ9LMZ9OMZ9OMZ9NL59JL59JL59JL59JL59J",
  ,
  "L59JLqBJLqBJLZ9ILZ9ILZ9ILKBIK59EK59EK59EK59DK59DKqBDKqBDKqBDKqBDKZ9CKKBBKKBBJ59BJ59BJ59BJqBAJqA9JqA9JqA9JqA9JqA9JqA9JZ88",
  ,
  "JKA7JKA7jaoijaoijaoijKojjKojjKoki6oki6oki6oki6oki6oki6oliqoliqoliqomiqomiqoniqoniqoniqooiqooiaopiaopiaoqiaoqiKoqiKkqiKkq",
  ,
  "iKkriKkrh6krh6ksh6kshqkthqkthqkthqkuhqkuhakvhakvhakvhakvhKkvhKkwhKkwhKkxhKkxhKkxhKkyhKkyg6kzg6kzg6kzg6k0gqk0gqk1gqk1gqk1",
  ,
  "gqk2gak2gak2gak2gak2gKk3gKk3gKk4gKk4gKk4f6k5f6k5f6k6f6k6f6k7f6k7f6k7f6k8fqk8fqg8fqg8fqg8fag9fag9fag+fKg+fKg+fKg/fKg/fKhA",
  ,
  "e6hAe6hAe6hBe6hBeqhBeqhBeqhBeqhCeqhCeahDeahDeahEeahEeKhEeKhFeKhFeKdGeKdGeKdGeKdHeKdHd6dId6dId6dId6dId6dIdqdJdqdJdqdJdqdK",
  ,
  "dadKdadLdadLdKdMdKdMdKdMdKdNdKdNc6dOc6dOc6dOc6dOcqZOcqZPcqZPcqZPcqZPcqZQcqZQcqZRcqZRcqZRcaZScaZScaZTcaZTcaZTcKZUcKZUcKZV",
  ,
  "b6ZVb6ZVb6ZVb6ZVb6ZWbqZWbqZXbqZXbqZXbaVYbaVYbaVZbaVZbaVZbaVabaVabaVabKVabKVabKVbbKVba6Vca6Vca6Vca6Vda6VdaqVeaqVeaqVfaqVf",
  ,
  "aaVfaaVgaaVgaaVgaaVgaKRgaKRhaKRhZ6RiZ6RiZ6RiZ6RjZ6RjZ6RkZ6RkZ6RkZ6RlZqRlZqRmZqRmZaRnN59UN59UN59UN59SNZ9TNZ9TNZ9QNZ9QNZ9Q",
  ,
  "NZ9QM59PM59PM59PM59PM59PMqBPMZ9LMZ9OMZ9OMZ9NL59JL59JL59JL59JL59JL59JLqBJLqBJLZ9ILZ9ILZ9ILKBIK59EK59EK59EK59DK59DKqBDKqBD",
  ,
  "KqBDKqBDKZ9CKKBBKKBBJ59BJ59BJ59BJqBAJqA9JqA9JqA9JqA9JqA9JqA9JZ88JKA7JKA7jaoijaoijaoijKojjKojjKoki6oki6oki6oki6oki6oki6ol",
  ,
  "iqoliqoliqomiqomiqoniqoniqoniqooiqooiaopiaopiaoqiaoqiKoqiKkqiKkqiKkriKkrh6krh6ksh6kshqkthqkthqkthqkuhqkuhakvhakvhakvhakv",
  ,
  "hKkvhKkwhKkwhKkxhKkxhKkxhKkyhKkyg6kzg6kzg6kzg6k0gqk0gqk1gqk1gqk1gqk2gak2gak2gak2gak2gKk3gKk3gKk4gKk4gKk4f6k5f6k5f6k6f6k6",
  ,
  "f6k7f6k7f6k7f6k8fqk8fqg8fqg8fqg8fag9fag9fag+fKg+fKg+fKg/fKg/fKhAe6hAe6hAe6hBe6hBeqhBeqhBeqhBeqhCeqhCeahDeahDeahEeahEeKhE",
  ,
  "eKhFeKhFeKdGeKdGeKdGeKdHeKdHd6dId6dId6dId6dId6dIdqdJdqdJdqdJdqdKdadKdadLdadLdKdMdKdMdKdMdKdNdKdNc6dOc6dOc6dOc6dOcqZOcqZP",
  ,
  "cqZPcqZPcqZPcqZQcqZQcqZRcqZRcqZRcaZScaZScaZTcaZTcaZTcKZUcKZUcKZVb6ZVb6ZVb6ZVb6ZVb6ZWbqZWbqZXbqZXbqZXbaVYbaVYbaVZbaVZbaVZ",
  ,
  "baVabaVabaVabKVabKVabKVbbKVba6Vca6Vca6Vca6Vda6VdaqVeaqVeaqVfaqVfaaVfaaVgaaVgaaVgaaVgaKRgaKRhaKRhZ6RiZ6RiZ6RiZ6RjZ6RjZ6Rk",
  ,
  "Z6RkZ6RkZ6RlZqRlZqRmZqRmZaRnZaRnN59UN59UN59UNZ9TNZ9TNKBTNKBTNKBTNKBTNKBQNKBQNKBQM59PM59PMqBPMaFOMaFOMaFOMZ9NMKBKMKBKL59J",
  ,
  "L59JL59JL59JLqBJLqBJLaFILaFILaFILKBILKBHLKBHLKBHKqBGKqBGK6FHKqBDKqBDKqBDKaFDKKBBKKBBKKBBKKBBKKBBJqBAJqBAJqBAJqBAJqBAJqBA",
  ,
  "JqBAJaE/JKA7JKA7jaoijaoijaoijKojjKojjKoki6oki6oki6oki6oki6oki6oliqoliqoliqomiqomiqoniqoniqoniqooiqooiaopiaopiaoqiaoqiKoq",
  ,
  "iKkqiKkqiKkriKkrh6krh6ksh6kshqkthqkthqkthqkuhqkuhakvhakvhakvhakvhKkvhKkwhKkwhKkxhKkxhKkxhKkyhKkyg6kzg6kzg6kzg6k0gqk0gqk1",
  ,
  "gqk1gqk1gqk2gak2gak2gak2gak2gKk3gKk3gKk4gKk4gKk4f6k5f6k5f6k6f6k6f6k7f6k7f6k7f6k8fqk8fqg8fqg8fqg8fag9fag9fag+fKg+fKg+fKg/",
  ,
  "fKg/fKhAe6hAe6hAe6hBe6hBeqhBeqhBeqhBeqhCeqhCeahDeahDeahEeahEeKhEeKhFeKhFeKdGeKdGeKdGeKdHeKdHd6dId6dId6dId6dId6dIdqdJdqdJ",
  ,
  "dqdJdqdKdadKdadLdadLdKdMdKdMdKdMdKdNdKdNc6dOc6dOc6dOc6dOcqZOcqZPcqZPcqZPcqZPcqZQcqZQcqZRcqZRcqZRcaZScaZScaZTcaZTcaZTcKZU",
  ,
  "cKZUcKZVb6ZVb6ZVb6ZVb6ZVb6ZWbqZWbqZXbqZXbqZXbaVYbaVYbaVZbaVZbaVZbaVabaVabaVabKVabKVabKVbbKVba6Vca6Vca6Vca6Vda6VdaqVeaqVe",
  ,
  "aqVfaqVfaaVfaaVgaaVgaaVgaaVgaKRgaKRhaKRhZ6RiZ6RiZ6RiZ6RjZ6RjZ6RkZ6RkZ6RkZ6RlZqRlZqRmZqRmZaRnZaRnZaRnN59UNZ9TNZ9TNZ9TNKBT",
  ,
  "NKBTNKBTNKBQNKBQM59PM59PMqBPMqBPMZ9OMZ9NMZ9NMZ9NMKBKMKBKL59JL59JL59JL59JLqBJLqBJLaFILKBILKBILKBILKBHKqBGKqBGKqBGKqBGKqBG",
  ,
  "KqBGKaFDKaFDKaFDKKBBKKBBKKBBJqBAJqBAJqBAJqBAJqBAJqBAJqBAJqBAJaE/JaE/JKA+I6E7I6E7jqoijqoijqoijaojjaojjaokjKokjKokjKokjKok",
  ,
  "jKokjKoli6oli6oli6omi6omiqoniqoniqoniqooiqooiqopiqopiqoqiqoqiaoqiakqiakqiKkriKkriKkriKksiKksh6kth6kth6kth6kuhqkuhqkvhqkv",
  ,
  "hqkvhqkvhakvhakwhakwhKkxhKkxhKkxhKkyhKkyhKkzhKkzhKkzhKk0g6k0g6k1g6k1g6k1gqk2gqk2gqk2gqk2gqk2gak3gak3gak4gKk4gKk4gKk5gKk5",
  ,
  "f6k6f6k6f6k7f6k7f6k7f6k8f6k8f6g8f6g8fqg8fqg9fqg9fqg+fag+fag+fag/fag/fKhAfKhAfKhAfKhBe6hBe6hBe6hBe6hBe6hCeqhCeqhDeqhDeahE",
  ,
  "eahEeahEeahFeahFeKdGeKdGeKdGeKdHeKdHeKdIeKdIeKdId6dId6dId6dJd6dJd6dJdqdKdqdKdqdLdadLdadMdadMdadMdadNdKdNdKdOdKdOdKdOc6dO",
  ,
  "c6ZOc6ZPc6ZPc6ZPcqZPcqZQcqZQcqZRcqZRcqZRcqZScqZScaZTcaZTcaZTcaZUcaZUcKZVcKZVcKZVcKZVb6ZVb6ZWb6ZWbqZXbqZXbqZXbqVYbqVYbaVZ",
  ,
  "baVZbaVZbaVabaVabaVabaVabaVabaVbbKVbbKVcbKVcbKVca6Vda6Vda6VeaqVeaqVfaqVfaqVfaqVgaaVgaaVgaaVgaaRgaKRhaKRhaKRiaKRiaKRiZ6Rj",
  ,
  "Z6RjZ6RkZ6RkZ6RkZ6RlZ6RlZqRmZqRmZqRnZqRnZqRnZaRnNZ9TNZ9TNZ9TNKBTNKBTNKBTNKBQNKBQM59PM59PMqBPMqBPMZ9OMZ9NMZ9NMZ9NMKBKMKBK",
  ,
  "L59JL59JL59JL59JLqBJLqBJLaFILKBILKBILKBILKBHKqBGKqBGKqBGKqBGKqBGKqBGKaFDKaFDKaFDKKBBKKBBKKBBJqBAJqBAJqBAJqBAJqBAJqBAJqBA",
  ,
  "JqBAJaE/JaE/JKA+I6E7I6E7j6kij6kij6kjjqkjjqkkjqkkjakkjakkjakkjakkjakljakljKkmjKkmjKkmjKkni6kni6koi6koi6koiqkpiqkpiqkqiqkq",
  ,
  "iqkqiqkqiqkqiqkriakriakriaksiaksiKktiKktiKkuiKkuiKkuh6kvh6kvh6kvh6kvhqkvhqkwhqkwhakxhakxhakxhakyhakyhKkzhKkzhKkzhKk0hKk0",
  ,
  "hKk1hKk1hKk1g6g2g6g2g6g2g6g2gqg3gqg3gqg3gqg4gag4gag5gag5gag5gag6gKg6gKg7gKg7gKg7f6g8f6g8f6g8f6g8f6g8f6g9f6g9f6g+fqg+fqg/",
  ,
  "fqg/fqc/fadAfadAfadBfadBfKdBfKdBfKdBfKdCfKdCe6dCe6dDe6dDeqdEeqdEeqdEeqdFeadFeadGeadGeadGeadHeKdHeKdIeKdIeKdIeKdIeKdIeKZJ",
  ,
  "d6ZJd6ZKd6ZKd6ZKd6ZLdqZLdqZMdqZMdqZMdaZNdaZNdaZOdaZOdaZOdKZOdKZOdKZPc6ZPc6ZPc6ZPc6ZQc6ZQcqZRcqZRcqZScqZScqZScqZTcqVTcqVU",
  ,
  "cqVUcaVUcaVVcaVVcKVVcKVVcKVVcKVWcKVWb6VXb6VXb6VXb6VYbqVYbqVZbqVZbaVabaVabaVabaVabaVabaVbbaVbbaVbbaVcbKVcbKVdbKVdbKRda6Re",
  ,
  "a6Rea6Rfa6Rfa6RfaqRgaqRgaqRgaaRgaaRgaaRhaaRhaKRiaKRiaKRjaKRjaKRjZ6RkZ6RkZ6RlZ6RlZ6RlZ6RmZ6RmZ6RnZqRnZqRnZqNnZqNnZaNoNZ9T",
  ,
  "NZ9TNKBTNKBTNKBTNKBQNKBSM59PM59PMqBPMqBPMZ9OMZ9NMZ9NMZ9NMKBNMKBNL59JL59ML59ML59MLqBJLqBJLaFILKBILKBILKBILKBHKqBGKqBGKqBG",
  ,
  "KqBGKqBGKqBGKaFFKaFFKaFFKKBEKKBEKKBBJqBAJqBAJqBAJqBAJqBAJqBAJqBAJqBAJaE/JaE/JKA+I6E+I6E+kKkikKkikKkjj6kjj6kkj6kkjqkkjqkk",
  ,
  "jqkkjqkkjqkljakljakmjakmjakmjaknjKknjKkojKkojKkoi6kpi6kpi6kqiqkqiqkqiqkqiqkqiqkriqkriqkriqksiqksiaktiaktiakuiakuiKkuiKkv",
  ,
  "iKkviKkviKkvh6kvh6kwh6kwhqkxhqkxhqkxhqkyhakyhakzhakzhakzhak0hKk0hKk1hKk1hKk1hKg2hKg2hKg2g6g2g6g3g6g3g6g3gqg4gqg4gqg5gqg5",
  ,
  "gqg5gag6gag6gag7gKg7gKg7gKg8gKg8f6g8f6g8f6g8f6g9f6g9f6g+f6g+f6g/f6g/fqc/fqdAfqdAfadBfadBfadBfadBfadBfKdCfKdCfKdCfKdDe6dD",
  ,
  "e6dEe6dEe6dEeqdFeqdFeqdGeqdGeqdGeadHeadHeadIeKdIeKdIeKdIeKdIeKZJeKZJeKZKeKZKeKZKd6ZLd6ZLd6ZMdqZMdqZMdqZNdqZNdaZOdaZOdaZO",
  ,
  "daZOdKZOdKZPdKZPdKZPdKZPdKZQc6ZQc6ZRc6ZRcqZScqZScqZScqZTcqVTcqVUcqVUcqVUcqVVcaVVcaVVcaVVcaVVcKVWcKVWcKVXb6VXb6VXb6VYb6VY",
  ,
  "b6VZbqVZbqVabqVabqVabaVabaVabaVbbaVbbaVbbaVcbaVcbaVdbaVdbKRdbKRebKRea6Rfa6Rfa6Rfa6RgaqRgaqRgaqRgaqRgaqRhaaRhaaRiaaRiaKRj",
  ,
  "aKRjaKRjaKRkZ6RkZ6RlZ6RlZ6RlZ6RmZ6RmZ6RnZ6RnZ6RnZqNnZqNnZqNoZaNoNZ9TNKBTNKBTNKBTNKBSNKBSM59PM59PMqBRMqBRMZ9OMZ9NMZ9NMZ9N",
  ,
  "MKBNMKBNL59ML59ML59ML59MLqBMLqBMLaFLLKBILKBILKBILKBHKqBGKqBGKqBGKqBGKqBGKqBGKaFFKaFFKaFFKKBEKKBEKKBEJqBAJqBAJqBAJqBAJqBA",
  ,
  "JqBAJqBAJqBAJaE/JaE/JKA+I6E+I6E+kakikakikakjkKkjkKkkkKkkj6kkj6kkj6kkj6kkj6kljqkljqkmjqkmjqkmjqknjaknjakojakojakojKkpjKkp",
  ,
  "jKkqi6kqi6kqi6kqi6kqiqkriqkriqkriqksiqksiqktiqktiqkuiqkuiakuiakviakviKkviKkviKkviKkwh6kwh6kxh6kxh6kxh6kyhqkyhqkzhqkzhqkz",
  ,
  "hak0hak0hak1hKk1hKk1hKg2hKg2hKg2hKg2hKg3hKg3hKg3g6g4g6g4g6g5g6g5gqg5gqg6gqg6gag7gag7gag7gag8gag8gKg8gKg8gKg8gKg9f6g9f6g+",
  ,
  "f6g+f6g/f6g/f6c/f6dAfqdAfqdBfqdBfqdBfqdBfadBfadCfadCfadCfKdDfKdDfKdEe6dEe6dEe6dFe6dFe6dGeqdGeqdGeqdHeqdHeadIeadIeadIeadI",
  ,
  "eKdIeKZJeKZJeKZKeKZKeKZKeKZLeKZLd6ZMd6ZMd6ZMd6ZNdqZNdqZOdqZOdqZOdaZOdaZOdaZPdKZPdKZPdKZPdKZQdKZQdKZRc6ZRc6ZSc6ZSc6ZScqZT",
  ,
  "cqVTcqVUcqVUcqVUcqVVcqVVcaVVcaVVcaVVcaVWcaVWcKVXcKVXcKVXcKVYb6VYb6VZb6VZbqVabqVabqVabqVabqVabaVbbaVbbaVbbaVcbaVcbaVdbaVd",
  ,
  "baRdbKRebKRebKRfa6Rfa6Rfa6Rga6Rga6RgaqRgaqRgaqRhaqRhaaRiaaRiaaRjaaRjaKRjaKRkaKRkZ6RlZ6RlZ6RlZ6RmZ6RmZ6RnZ6RnZ6RnZ6NnZqNn",
  ,
  "ZqNoZqNoZqNoNKBTNKBTNKBTNKBSNKBSM59RM59RMqBRMqBRMZ9QMZ9NMZ9NMZ9NMKBNMKBNL59ML59ML59ML59MLqBMLqBMLaFLLKBKLKBKLKBKLKBHKqBG",
  ,
  "KqBGKqBGKqBGKqBJKqBGKaFFKaFFKaFFKKBEKKBEKKBEJqBDJqBDJqBDJqBDJqBDJqBDJqBDJqBDJaFCJaFCJKA+I6E+I6E+kakikakikakjkKkjkKkkkKkk",
  ,
  "j6kkj6kkj6kkj6kkj6kljqkljqkmjqkmjqkmjqknjaknjakojakojakojKkpjKkpjKkqi6kqi6kqi6kqi6kqiqkriqkriqkriqksiqksiqktiqktiqkuiqku",
  ,
  "iakuiakviakviKkviKkviKkviKkwh6kwh6kxh6kxh6kxh6kyhqkyhqkzhqkzhqkzhak0hak0hak1hKk1hKk1hKg2hKg2hKg2hKg2hKg3hKg3hKg3g6g4g6g4",
  ,
  "g6g5g6g5gqg5gqg6gqg6gag7gag7gag7gag8gag8gKg8gKg8gKg8gKg9f6g9f6g+f6g+f6g/f6g/f6c/f6dAfqdAfqdBfqdBfqdBfqdBfadBfadCfadCfadC",
  ,
  "fKdDfKdDfKdEe6dEe6dEe6dFe6dFe6dGeqdGeqdGeqdHeqdHeadIeadIeadIeadIeKdIeKZJeKZJeKZKeKZKeKZKeKZLeKZLd6ZMd6ZMd6ZMd6ZNdqZNdqZO",
  ,
  "dqZOdqZOdaZOdaZOdaZPdKZPdKZPdKZPdKZQdKZQdKZRc6ZRc6ZSc6ZSc6ZScqZTcqVTcqVUcqVUcqVUcqVVcqVVcaVVcaVVcaVVcaVWcaVWcKVXcKVXcKVX",
  ,
  "cKVYb6VYb6VZb6VZbqVabqVabqVabqVabqVabaVbbaVbbaVbbaVcbaVcbaVdbaVdbaRdbKRebKRebKRfa6Rfa6Rfa6Rga6Rga6RgaqRgaqRgaqRhaqRhaaRi",
  ,
  "aaRiaaRjaaRjaKRjaKRkaKRkZ6RlZ6RlZ6RlZ6RmZ6RmZ6RnZ6RnZ6RnZ6NnZqNnZqNoZqNoZqNoZaNpNKBTNKBSM59RM59RMqBRMqBRMZ9QMZ9QMZ9QMZ9Q",
  ,
  "MKBNMKBNL59ML59ML59MLqBMLqBMLqBMLZ9KLZ9KLKBKLKBKLKBKLKBKKqBJKqBJKqBJKqBJKqBGKqBGKaFFKKBEKKBEKKBEKKBEKKBEJqBDJqBDJqBDJqBD",
  ,
  "JqBDJaFCJaFCJaFCJaFCJKA+JKA+I6E+IqA9IqA9kakikakikakjkakjkakkkakkkKkkkKkkkKkkkKkkkKklj6klj6kmj6kmj6kmjqknjqknjqkojqkojqko",
  ,
  "jakpjakpjakqjKkqjKkqjKkqjKkqi6kri6kri6kri6ksiqksiqktiqktiqkuiqkuiqkuiqkviqkviakviakviakviakwiKkwiKkxiKkxiKkxh6kyh6kyh6kz",
  ,
  "hqkzhqkzhqk0hqk0hqk1hak1hak1hag2hag2hKg2hKg2hKg3hKg3hKg3hKg4hKg4g6g5g6g5g6g5g6g6g6g6gqg7gqg7gqg7gqg8gag8gag8gag8gag8gKg9",
  ,
  "gKg9gKg+f6g+f6g/f6g/f6c/f6dAf6dAf6dBf6dBf6dBfqdBfqdBfqdCfqdCfadCfadDfadDfKdEfKdEfKdEfKdFe6dFe6dGe6dGe6dGe6dHeqdHeqdIeqdI",
  ,
  "eadIeadIeadIeaZJeKZJeKZKeKZKeKZKeKZLeKZLeKZMeKZMeKZMd6ZNd6ZNd6ZOdqZOdqZOdqZOdqZOdaZPdaZPdaZPdaZPdaZQdKZQdKZRdKZRc6ZSc6ZS",
  ,
  "c6ZSc6ZTc6VTcqVUcqVUcqVUcqVVcqVVcqVVcqVVcqVVcaVWcaVWcaVXcKVXcKVXcKVYcKVYcKVZb6VZb6Vab6Vab6VabqVabqVabqVbbqVbbaVbbaVcbaVc",
  ,
  "baVdbaVdbaRdbaRebaRebKRfbKRfbKRfbKRga6Rga6Rga6Rga6RgaqRhaqRhaqRiaaRiaaRjaaRjaaRjaKRkaKRkaKRlaKRlaKRlZ6RmZ6RmZ6RnZ6RnZ6Rn",
  ,
  "Z6NnZ6NnZqNoZqNoZqNoZqNpZaNpNKBSM59RM59RMqBRMqBRMZ9QMZ9QMZ9QMZ9QMKBNMKBNL59ML59ML59MLqBMLqBMLqBMLZ9KLZ9KLKBKLKBKLKBKLKBK",
  ,
  "KqBJKqBJKqBJKqBJKqBGKqBGKaFFKKBEKKBEKKBEKKBEKKBEJqBDJqBDJqBDJqBDJqBDJaFCJaFCJaFCJaFCJKA+JKA+I6E+IqA9IqA9kqkjkqkjkqkkkakk",
  ,
  "kakkkakkkaklkaklkaklkaklkakmkKkmkKknkKknkKknj6koj6koj6kpj6kpjqkpjqkqjqkqjqkqjakqjakqjakrjakrjKksjKksjKksjKkti6kti6kui6ku",
  ,
  "iqkviqkviqkviqkviqkviqkwiqkwiqkwiqkxiakxiakyiakyiakyiKkziKkziKk0h6k0h6k0h6k1h6k1hqk2hqk2hqk2hqg2hag2hag3hag3hag4hag4hKg4",
  ,
  "hKg5hKg5hKg6hKg6hKg6hKg7g6g7g6g8g6g8g6g8gqg8gqg8gqg9gag9gag9gag+gag+gKg/gKg/gKhAgKhAgKdAf6dBf6dBf6dBf6dBf6dBf6dCf6dCfqdD",
  ,
  "fqdDfqdDfqdEfadEfadFfadFfadFfKdGfKdGfKdHfKdHfKdHe6dHe6dIe6dIeqdIeqdIeqdIeqdJeaZJeaZKeaZKeaZKeKZLeKZLeKZMeKZMeKZNeKZNeKZN",
  ,
  "eKZOd6ZOd6ZOd6ZOd6ZOdqZPdqZPdqZQdqZQdqZQdaZQdaZRdaZRdKZSdKZSdKZSdKZTc6ZTc6VUc6VUc6VUcqVVcqVVcqVVcqVVcqVWcqVWcqVWcqVXcaVX",
  ,
  "caVYcaVYcaVYcKVZcKVZcKVab6Vab6Vab6Vab6VabqVbbqVbbqVbbqVcbqVcbaVdbaVdbaVdbaRebaRebaRfbaRfbKRgbKRgbKRgbKRga6Rga6Rha6Rha6Rh",
  ,
  "aqRiaqRiaqRjaqRjaqRjaaRkaaRkaaRlaKRlaKRlaKRmaKRmZ6RnZ6RnZ6RnZ6RnZ6NnZ6NoZ6NoZqNpZqNpZqNpZqNqZaNqM6FSM6FSMqBRMqBRMaFRMaFR",
  ,
  "MZ9QMZ9QMKBQMKBQL6FPL6FPL6FPLqBMLqBMLqBMLaFLLaFLLKBKLKBKLKBKLKBKK6FJK6FJK6FJK6FJKqBJKqBJKaFFKKJFKKJFKKJFKKBEKKBEJ6FEJqBD",
  ,
  "JqBDJqBDJqBDJaFCJaFCJaFCJaFCJKJCJKJCI6E+I6E9I6E9k6kjk6kjk6kkkqkkkqkkkqkkkaklkaklkaklkaklkakmkakmkaknkaknkaknkKkokKkokKkp",
  ,
  "kKkpj6kpj6kqj6kqjqkqjqkqjqkqjqkrjqkrjaksjaksjaksjaktjKktjKkujKkui6kvi6kvi6kvi6kviqkviqkwiqkwiqkwiqkxiqkxiqkyiakyiakyiakz",
  ,
  "iakziKk0iKk0iKk0iKk1iKk1h6k2h6k2h6k2h6g2hqg2hqg3hqg3hag4hag4hag4hag5hKg5hKg6hKg6hKg6hKg7hKg7hKg8g6g8g6g8g6g8g6g8gqg9gqg9",
  ,
  "gqg9gqg+gqg+gag/gag/gahAgahAgKdAgKdBgKdBf6dBf6dBf6dBf6dCf6dCf6dDf6dDf6dDfqdEfqdEfqdFfadFfadFfadGfadGfadHfKdHfKdHfKdHfKdI",
  ,
  "e6dIe6dIe6dIe6dIeqdJeqZJeqZKeaZKeaZKeaZLeaZLeKZMeKZMeKZNeKZNeKZNeKZOeKZOd6ZOd6ZOd6ZOd6ZPd6ZPdqZQdqZQdqZQdqZQdqZRdaZRdaZS",
  ,
  "daZSdaZSdKZTdKZTdKVUc6VUc6VUc6VVc6VVcqVVcqVVcqVWcqVWcqVWcqVXcqVXcaVYcaVYcaVYcaVZcaVZcKVacKVacKVacKVab6Vab6Vbb6Vbb6VbbqVc",
  ,
  "bqVcbqVdbaVdbaVdbaRebaRebaRfbaRfbaRgbaRgbKRgbKRgbKRga6Rha6Rha6Rha6Ria6RiaqRjaqRjaqRjaqRkaaRkaaRlaaRlaaRlaKRmaKRmaKRnZ6Rn",
  ,
  "Z6RnZ6RnZ6NnZ6NoZ6NoZ6NpZ6NpZqNpZqNqZqNqZqNrM6FSMqBRMqBRMaFRMaFRMZ9QMZ9QMKBQMKBQL6FPL6FPL6FPLqBMLqBMLqBMLaFLLaFLLKBKLKBK",
  ,
  "LKBKLKBKK6FJK6FJK6FJK6FJKqBJKqBJKaFFKKJFKKJFKKJFKKBEKKBEJ6FEJqBDJqBDJqBDJqBDJaFCJaFCJaFCJaFCJKJCJKJCI6E+I6E9I6E9k6kjk6kj",
  ,
  "k6kkkqkkkqkkkqkkkaklkaklkaklkaklkakmkakmkaknkaknkaknkKkokKkokKkpkKkpj6kpj6kqj6kqjqkqjqkqjqkqjqkrjqkrjaksjaksjaksjaktjKgt",
  ,
  "jKgujKgui6gvi6gvi6gvi6gviqgviqgwiqgwiqgwiqgxiqgxiqgyiagyiagyiagziagziKg0iKg0iKg0iKg1iKg1h6g2h6g2h6g2h6g2hqg2hqg3hqg3hag4",
  ,
  "hag4hac4hac5hKc5hKc6hKc6hKc6hKc7hKc7hKc8g6c8g6c8g6c8g6c8gqc9gqc9gqc9gqc+gqc+gac/gac/gadAgadAgKdAgKdBgKdBf6dBf6dBf6dBf6dC",
  ,
  "f6dCf6ZDf6ZDf6ZDfqZEfqZEfqZFfaZFfaZFfaZGfaZGfaZHfKZHfKZHfKZHfKZIe6ZIe6ZIe6ZIe6ZIeqZJeqZJeqZKeaZKeaZKeaZLeaZLeKZMeKZMeKZN",
  ,
  "eKZNeKZNeKZOeKVOd6VOd6VOd6VOd6VPd6VPdqVQdqVQdqVQdqVQdqVRdaVRdaVSdaVSdaVSdKVTdKVTdKVUc6VUc6VUc6VVc6VVcqVVcqVVcqVWcqVWcqVW",
  ,
  "cqVXcqVXcaVYcaVYcaVYcaRZcaRZcKRacKRacKRacKRab6Rab6Rbb6Rbb6RbbqRcbqRcbqRdbaRdbaRdbaRebaRebaRfbaRfbaRgbaRgbKRgbKRgbKRga6Rh",
  ,
  "a6Rha6Rha6Ria6RiaqRjaqRjaqRjaqNkaaNkaaNlaaNlaaNlaKNmaKNmaKNnZ6NnZ6NnZ6NnZ6NnZ6NoZ6NoZ6NpZ6NpZqNpZqNqZqNqZqNrZqNrMqBRMqBR",
  ,
  "MaFRMaFRMZ9QMZ9QMKBQMKBQL6FPL6FPL6FPLqBOLqBOLqBOLaFLLaFLLKBKLKBKLKBKLKBKK6FJK6FJK6FJK6FJKqBJKqBJKaFFKKJIKKJIKKJIKKBEKKBE",
  ,
  "J6FEJqBDJqBDJqBDJqBDJaFCJaFCJaFCJaFCJKJCJKJCI6FBI6FAI6FAk6kjk6kjk6kkkqkkkqkkkqkkkaklkaklkaklkaklkakmkakmkaknkaknkaknkKko",
  ,
  "kKkokKkpkKkpj6kpj6kqj6kqjqkqjqkqjqkqjqkrjqkrjaksjaksjaksjaktjKgtjKgujKgui6gvi6gvi6gvi6gviqgviqgwiqgwiqgwiqgxiqgxiqgyiagy",
  ,
  "iagyiagziagziKg0iKg0iKg0iKg1iKg1h6g2h6g2h6g2h6g2hqg2hqg3hqg3hag4hag4hac4hac5hKc5hKc6hKc6hKc6hKc7hKc7hKc8g6c8g6c8g6c8g6c8",
  ,
  "gqc9gqc9gqc9gqc+gqc+gac/gac/gadAgadAgKdAgKdBgKdBf6dBf6dBf6dBf6dCf6dCf6ZDf6ZDf6ZDfqZEfqZEfqZFfaZFfaZFfaZGfaZGfaZHfKZHfKZH",
  ,
  "fKZHfKZIe6ZIe6ZIe6ZIe6ZIeqZJeqZJeqZKeaZKeaZKeaZLeaZLeKZMeKZMeKZNeKZNeKZNeKZOeKVOd6VOd6VOd6VOd6VPd6VPdqVQdqVQdqVQdqVQdqVR",
  ,
  "daVRdaVSdaVSdaVSdKVTdKVTdKVUc6VUc6VUc6VVc6VVcqVVcqVVcqVWcqVWcqVWcqVXcqVXcaVYcaVYcaVYcaRZcaRZcKRacKRacKRacKRab6Rab6Rbb6Rb",
  ,
  "b6RbbqRcbqRcbqRdbaRdbaRdbaRebaRebaRfbaRfbaRgbaRgbKRgbKRgbKRga6Rha6Rha6Rha6Ria6RiaqRjaqRjaqRjaqNkaaNkaaNlaaNlaaNlaKNmaKNm",
  ,
  "aKNnZ6NnZ6NnZ6NnZ6NnZ6NoZ6NoZ6NpZ6NpZqNpZqNqZqNqZqNrZqNrZaNrMaFRMaFRMZ9QMKBQMKBQL59PL59PL6FPL6FPLqBOLqBOLqBOLaFLLKBKLKBK",
  ,
  "LKBKK6FJK6FJK6FJK6FJK6FJKqBJKqBJKaFIKaFIKKBHKKBEKKBHKKBHJ6FEJ6FEJqBDJqBDJqBDJqBDJaFCJKJCJKJCJKJCJKJCI6FBI6FBI6FAIaE/IaE/",
  ,
  "lKkjlKkjlKkkk6kkk6kkk6kkkqklkqklkqklkqklkqkmkakmkaknkaknkaknkakokakokakpkakpkKkpkKkqkKkqj6kqj6kqj6kqj6krjqkrjqksjqksjqks",
  ,
  "jaktjagtjagujKgujKgvjKgvjKgvjKgvi6gvi6gwi6gwi6gwiqgxiqgxiqgyiqgyiqgyiqgziqgziag0iag0iag0iag1iKg1iKg2iKg2iKg2h6g2h6g2h6g3",
  ,
  "hqg3hqg4hqg4hqc4hac5hac5hac6hac6hKc6hKc7hKc7hKc8hKc8hKc8hKc8hKc8g6c9g6c9g6c9g6c+gqc+gqc/gqc/gadAgadAgadAgadBgKdBgKdBgKdB",
  ,
  "gKdBf6dCf6dCf6ZDf6ZDf6ZDf6ZEf6ZEfqZFfqZFfqZFfqZGfaZGfaZHfaZHfaZHfaZHfKZIfKZIfKZIe6ZIe6ZIe6ZJe6ZJeqZKeqZKeqZKeqZLeaZLeaZM",
  ,
  "eaZMeKZNeKZNeKZNeKZOeKVOeKVOeKVOeKVOd6VPd6VPd6VQd6VQd6VQdqVQdqVRdqVRdaVSdaVSdaVSdaVTdaVTdKVUdKVUdKVUdKVVc6VVc6VVc6VVcqVW",
  ,
  "cqVWcqVWcqVXcqVXcqVYcqVYcqVYcaRZcaRZcaRacKRacKRacKRacKRab6Rbb6Rbb6Rbb6RcbqRcbqRdbqRdbqRdbaRebaRebaRfbaRfbaRgbaRgbaRgbaRg",
  ,
  "bKRgbKRhbKRhbKRha6Ria6Ria6RjaqRjaqRjaqNkaqNkaaNlaaNlaaNlaaNmaKNmaKNnaKNnZ6NnZ6NnZ6NnZ6NoZ6NoZ6NpZ6NpZ6NpZqNqZqNqZqNrZqNr",
  ,
  "ZqNrZaNrMaFRMZ9QMKBQMKBQL59PL59PL6FPL6FPLqBOLqBOLqBOLaFLLKBKLKBKLKBKK6FJK6FJK6FJK6FJK6FJKqBJKqBJKaFIKaFIKKBHKKBEKKBHKKBH",
  ,
  "J6FEJ6FEJqBDJqBDJqBDJqBDJaFCJKJCJKJCJKJCJKJCI6FBI6FBI6FAIaE/IaE/lakklakklakklKkklKkllKklk6kmk6kmk6kmk6kmk6knkqknkqkokqko",
  ,
  "kqkokakpkakpkakqkakqkakqkakqkakqkKkrkKkrkKkrkKksj6ksj6ktj6ktj6ktjqkujqgujqgvjagvjagvjagvjagvjKgwjKgwjKgxjKgxi6gxi6gyi6gy",
  ,
  "iqgziqgziqgziqg0iqg0iqg1iqg1iqg1iqg2iag2iag2iag2iag2iKg3iKg3iKg4h6g4h6g5h6g5h6c5hqc5hqc6hqc6hqc6hac7hac7hac8hKc8hKc8hKc8",
  ,
  "hKc8hKc9hKc9hKc+hKc+g6c+g6c/g6c/gqdAgqdAgqdAgqdBgadBgadBgadBgadBgKdCgKdCgKdDf6ZDf6ZDf6ZEf6ZEf6ZFf6ZFf6ZGf6ZGfqZGfqZHfqZH",
  ,
  "fqZIfqZIfaZIfaZIfaZIfKZJfKZJfKZJfKZKe6ZKe6ZLe6ZLe6ZLeqZMeqZMeqZNeaZNeaZOeaZOeaZOeKZOeKVOeKVOeKVOeKVPeKVPeKVQd6VQd6VQd6VQ",
  ,
  "d6VRd6VRdqVSdqVSdqVTdqVTdaVTdaVUdaVUdKVVdKVVdKVVdKVVc6VVc6VWc6VWc6VWcqVXcqVXcqVYcqVYcqVYcqVZcqRZcqRacaRacaRacaRacaRacKRb",
  ,
  "cKRbcKRccKRcb6Rcb6Rdb6RdbqRebqRebqRebqRfbaRfbaRgbaRgbaRgbaRgbaRgbaRhbKRhbKRhbKRibKRia6Rja6Rja6Rka6RkaqNkaqNkaqNlaaNlaaNl",
  ,
  "aaNmaaNmaKNnaKNnaKNnaKNnZ6NnZ6NoZ6NoZ6NpZ6NpZ6NpZ6NqZqNqZqNrZqNrZqNrZqNsZaNsMZ9QMKBQMKBQL59PL59PL6FPL6FPLqBOLqBOLqBOLaFO",
  ,
  "LKBKLKBKLKBKK6FJK6FJK6FJK6FJK6FJKqBJKqBJKaFIKaFIKKBHKKBHKKBHKKBHJ6FGJ6FGJqBDJqBDJqBDJqBDJaFCJKJCJKJCJKJCJKJCI6FBI6FBI6FA",
  ,
  "IaE/IaE/lqkklqkklqkklakklakllakllKkmlKkmlKkmlKkmlKknk6knk6kok6kok6kokqkpkqkpkqkqkqkqkakqkakqkakqkakrkakrkakrkakskKkskKkt",
  ,
  "kKktkKktj6kuj6guj6gvjqgvjqgvjqgvjqgvjagwjagwjagxjagxjKgxjKgyjKgyi6gzi6gzi6gzi6g0iqg0iqg1iqg1iqg1iqg2iqg2iqg2iag2iag2iag3",
  ,
  "iag3iKg4iKg4iKg5iKg5h6c5h6c5h6c6hqc6hqc6hqc7hqc7hac8hac8hac8hac8hKc8hKc9hKc9hKc+hKc+hKc+hKc/g6c/g6dAg6dAg6dAgqdBgqdBgqdB",
  ,
  "gadBgadBgadCgadCgKdDgKZDgKZDgKZEf6ZEf6ZFf6ZFf6ZGf6ZGf6ZGf6ZHf6ZHfqZIfqZIfqZIfqZIfaZIfaZJfaZJfaZJfKZKfKZKfKZLe6ZLe6ZLe6ZM",
  ,
  "e6ZMeqZNeqZNeqZOeqZOeaZOeaZOeaVOeKVOeKVOeKVPeKVPeKVQeKVQeKVQeKVQeKVRd6VRd6VSd6VSdqVTdqVTdqVTdqVUdaVUdaVVdaVVdaVVdKVVdKVV",
  ,
  "dKVWc6VWc6VWc6VXc6VXcqVYcqVYcqVYcqVZcqRZcqRacqRacaRacaRacaRacaRbcKRbcKRccKRccKRcb6Rdb6Rdb6Reb6RebqRebqRfbqRfbaRgbaRgbaRg",
  ,
  "baRgbaRgbaRhbaRhbaRhbKRibKRibKRja6Rja6Rka6Rka6NkaqNkaqNlaqNlaqNlaaNmaaNmaaNnaKNnaKNnaKNnaKNnZ6NoZ6NoZ6NpZ6NpZ6NpZ6NqZ6Nq",
  ,
  "Z6NrZ6NrZqNrZqNsZqNsZaNtMKBQMKBQL59PL59PL6FPL6FPLqBOLqBOLqBOLaFOLKBNLKBNLKBNK6FJK6FJK6FJK6FMK6FMKqBJKqBJKaFIKaFIKKBHKKBH",
  ,
  "KKBHKKBHJ6FGJ6FGJqBFJqBFJqBFJqBFJaFFJKJCJKJFJKJFJKJFI6FBI6FBI6FAIaE/IaE/lqkklqkklqkklakklakllakllKkmlKkmlKkmlKkmlKknk6kn",
  ,
  "k6kok6kok6kokqkpkqkpkqkqkqkqkakqkakqkakqkakrkakrkakrkakskKkskKktkKktkKktj6kuj6guj6gvjqgvjqgvjqgvjqgvjagwjagwjagxjagxjKgx",
  ,
  "jKgyjKgyi6gzi6gzi6gzi6g0iqg0iqg1iqg1iqg1iqg2iqg2iqg2iag2iag2iag3iag3iKg4iKg4iKg5iKg5h6c5h6c5h6c6hqc6hqc6hqc7hqc7hac8hac8",
  ,
  "hac8hac8hKc8hKc9hKc9hKc+hKc+hKc+hKc/g6c/g6dAg6dAg6dAgqdBgqdBgqdBgadBgadBgadCgadCgKdDgKZDgKZDgKZEf6ZEf6ZFf6ZFf6ZGf6ZGf6ZG",
  ,
  "f6ZHf6ZHfqZIfqZIfqZIfqZIfaZIfaZJfaZJfaZJfKZKfKZKfKZLe6ZLe6ZLe6ZMe6ZMeqZNeqZNeqZOeqZOeaZOeaZOeaVOeKVOeKVOeKVPeKVPeKVQeKVQ",
  ,
  "eKVQeKVQeKVRd6VRd6VSd6VSdqVTdqVTdqVTdqVUdaVUdaVVdaVVdaVVdKVVdKVVdKVWc6VWc6VWc6VXc6VXcqVYcqVYcqVYcqVZcqRZcqRacqRacaRacaRa",
  ,
  "caRacaRbcKRbcKRccKRccKRcb6Rdb6Rdb6Reb6RebqRebqRfbqRfbaRgbaRgbaRgbaRgbaRgbaRhbaRhbaRhbKRibKRibKRja6Rja6Rka6Rka6NkaqNkaqNl",
  ,
  "aqNlaqNlaaNmaaNmaaNnaKNnaKNnaKNnaKNnZ6NoZ6NoZ6NpZ6NpZ6NpZ6NqZ6NqZ6NrZ6NrZqNrZqNsZqNsZaNtZaNtMKBSL59PL59PL6FPL6FPLqBOLqBO",
  ,
  "LqBOLaFOLKBNLKBNLKBNK6FMK6FMK6FMK6FMK6FMKqBLKqBLKaFIKaFIKKBHKKBHKKBHKKBHJ6FGJ6FGJqBFJqBFJqBFJqBFJaFFJKJFJKJFJKJFJKJFI6FE",
  ,
  "I6FEI6FDIaE/IaE/l6kkl6kkl6kklqkklqkllqkllakmlakmlakmlakmlaknlKknlKkolKkolKkok6kpk6kpk6kqk6kqkqkqkqkqkqkqkakrkakrkakrkaks",
  ,
  "kakskaktkaktkaktkKkukKgukKgvj6gvj6gvj6gvj6gvjqgwjqgwjqgxjqgxjagxjagyjagyjKgzjKgzjKgzjKg0i6g0i6g1i6g1i6g1iqg2iqg2iqg2iqg2",
  ,
  "iqg2iqg3iqg3iag4iag4iag5iag5iKc5iKc5iKc6h6c6h6c6h6c7h6c7hqc8hqc8hqc8hqc8hac8hac9hac9hKc+hKc+hKc+hKc/hKc/hKdAhKdAhKdAg6dB",
  ,
  "g6dBg6dBgqdBgqdBgqdCgqdCgadDgaZDgaZDgaZEgKZEgKZFgKZFf6ZGf6ZGf6ZGf6ZHf6ZHf6ZIf6ZIf6ZIfqZIfqZIfqZJfaZJfaZJfaZKfaZKfKZLfKZL",
  ,
  "fKZLfKZMe6ZMe6ZNe6ZNeqZOeqZOeqZOeqZOeaVOeaVOeaVOeaVPeKVPeKVQeKVQeKVQeKVQeKVReKVReKVSd6VSd6VTd6VTd6VTdqVUdqVUdqVVdqVVdaVV",
  ,
  "daVVdaVVdKVWdKVWdKVWdKVXc6VXc6VYc6VYc6VYcqVZcqRZcqRacqRacqRacqRacqRacaRbcaRbcaRccaRccKRccKRdcKRdb6Reb6Reb6Reb6RfbqRfbqRg",
  ,
  "bqRgbqRgbaRgbaRgbaRhbaRhbaRhbaRibaRibKRjbKRjbKRkbKRka6Nka6Nka6NlaqNlaqNlaqNmaqNmaaNnaaNnaaNnaaNnaKNnaKNoaKNoZ6NpZ6NpZ6Np",
  ,
  "Z6NqZ6NqZ6NrZ6NrZ6NrZqNsZqNsZqNtZaNtZaNtL59PL59PL6FPL6FPLqBOLqBOLqBOLaFOLKBNLKBNLKBNK6FMK6FMK6FMK6FMK6FMKqBLKqBLKaFIKaFI",
  ,
  "KKBHKKBHKKBHKKBHJ6FGJ6FGJqBFJqBFJqBFJqBFJaFFJKJFJKJFJKJFJKJFI6FEI6FEI6FDIaE/IaE/l6kkl6kkl6kkl6kkl6kllqkllqkmlqkmlqkmlqkm",
  ,
  "laknlaknlakolakolKkolKkplKkpk6kqk6kqk6kqk6kqkqkqkqkrkqkrkqkrkakskakskaktkaktkaktkakukagukKgvkKgvkKgvkKgvj6gvj6gwj6gwjqgx",
  ,
  "jqgxjqgxjqgyjagyjagzjagzjagzjKg0jKg0jKg1i6g1i6g1i6g2i6g2iqg2iqg2iqg2iqg3iqg3iqg4iqg4iag5iag5iac5iac5iKc6iKc6iKc6iKc7h6c7",
  ,
  "h6c8h6c8hqc8hqc8hqc8hqc9hac9hac+hac+hac+hKc/hKc/hKdAhKdAhKdAhKdBhKdBg6dBg6dBg6dBg6dCgqdCgqdDgqZDgqZDgaZEgaZEgaZFgKZFgKZG",
  ,
  "gKZGgKZGf6ZHf6ZHf6ZIf6ZIf6ZIf6ZIfqZIfqZJfqZJfqZJfaZKfaZKfaZLfKZLfKZLfKZMfKZMe6ZNe6ZNe6ZOe6ZOeqZOeqZOeqVOeaVOeaVOeaVPeaVP",
  ,
  "eKVQeKVQeKVQeKVQeKVReKVReKVSeKVSd6VTd6VTd6VTd6VUdqVUdqVVdqVVdqVVdaVVdaVVdaVWdKVWdKVWdKVXdKVXc6VYc6VYc6VYc6VZcqRZcqRacqRa",
  ,
  "cqRacqRacqRacqRbcaRbcaRccaRccaRccKRdcKRdcKRecKReb6Reb6Rfb6RfbqRgbqRgbqRgbqRgbaRgbaRhbaRhbaRhbaRibaRibaRjbKRjbKRkbKRkbKNk",
  ,
  "a6Nka6Nla6Nla6NlaqNmaqNmaqNnaaNnaaNnaaNnaaNnaKNoaKNoaKNpaKNpZ6NpZ6NqZ6NqZ6NrZ6NrZ6NrZqNsZqNsZqNtZaNtZaNtZaNtL6FSL6FSLqJP",
  ,
  "LaFOLaFOLaFOLaFOLKBNLKBNK6FMK6FMK6FMK6FMKqJMKqJMKaFLKaFLKKJLKKJLKKBHKKBHJ6FGJ6FGJqJGJqJGJqJGJaFFJaFFJaFFJKJFJKJFI6FEI6FE",
  ,
  "I6FEI6FDI6FDIaFCIaE/IaE/mKkkmKkkl6kll6kll6kml6kml6knl6knl6knl6knlqkolqkolqkplqkplakplakqlakqlKkqlKkqlKkqlKkrk6krk6ksk6ks",
  ,
  "k6kskqktkqktkqkukakukakukakvkagvkagvkagvkagwkagwkKgwkKgxkKgxj6gyj6gyj6gyj6gzjqgzjqgzjqg0jqg0jag0jag1jag1jKg2jKg2jKg2i6g2",
  ,
  "i6g2i6g3i6g3iqg3iqg4iqg4iqg5iqg5iqg5iqc6iac6iac7iac7iac7iKc8iKc8iKc8h6c8h6c9h6c9h6c9hqc+hqc+hqc/hqc/hac/hadAhadAhKdBhKdB",
  ,
  "hKdBhKdBhKdBhKdChKdChKdCg6dCg6dDg6dDgqZEgqZEgqZEgqZFgaZFgaZGgaZGgaZGgKZHgKZHgKZIf6ZIf6ZIf6ZIf6ZIf6ZJf6ZJfqZKfqZKfqZKfqZL",
  ,
  "faZLfaZMfaZMfaZMfKZNfKZNfKZOe6ZOe6ZOe6ZOe6ZOeqVPeqVPeqVPeqVQeaVQeaVReaVReaVReaVReKVSeKVSeKVSeKVTeKVTeKVTeKVUd6VUd6VVd6VV",
  ,
  "d6VVdqVVdqVVdqVWdaVWdaVXdaVXdaVXdKVYdKVYdKVZdKVZc6VZc6RacqRacqRacqRacqRacqRbcqRbcqRccaRccaRccaRdcaRdcKRecKRecKRecKRfb6Rf",
  ,
  "b6Rgb6RgbqRgbqRgbqRgbqRgbaRhbaRhbaRhbaRibaRibaRjbaRjbKRkbKRkbKNkbKNla6Nla6Nma6Nma6NmaqNnaqNnaqNnaaNnaaNnaaNoaaNoaKNpaKNp",
  ,
  "aKNpaKNqZ6NqZ6NrZ6NrZ6NrZ6NsZ6NsZqNtZqNtZqNtZqNtZaNtZaNuL6FSLqJPLaFOLaFOLaFOLaFOLKBNLKBNK6FMK6FMK6FMK6FMKqJMKqJMKaFLKaFL",
  ,
  "KKJLKKJLKKBHKKBHJ6FGJ6FGJqJGJqJGJqJGJaFFJaFFJaFFJKJFJKJFI6FEI6FEI6FEI6FDI6FDIaFCIaE/IaE/mKgkmKgkl6gll6gll6gml6gml6gnl6gn",
  ,
  "l6gnl6gnlqgolqgolqgplqgplagplagqlagqlKgqlKgqlKgqlKgrk6grk6gsk6gsk6gskqgtkqgtkqgukagukagukagvkagvkagvkagvkacwkacwkKcwkKcx",
  ,
  "kKcxj6cyj6cyj6cyj6czjqczjqczjqc0jqc0jac0jac1jac1jKc2jKc2jKc2i6c2i6c2i6c3i6c3iqc3iqc4iqc4iqc5iqc5iqc5iqc6iac6iac7iac7iac7",
  ,
  "iKc8iKY8iKY8h6Y8h6Y9h6Y9h6Y9hqY+hqY+hqY/hqY/haY/haZAhaZAhKZBhKZBhKZBhKZBhKZBhKZChKZChKZCg6ZCg6ZDg6ZDgqZEgqZEgqZEgqZFgaZF",
  ,
  "gaZGgaZGgaZGgKZHgKZHgKZIf6VIf6VIf6VIf6VIf6VJf6VJfqVKfqVKfqVKfqVLfaVLfaVMfaVMfaVMfKVNfKVNfKVOe6VOe6VOe6VOe6VOeqVPeqVPeqVP",
  ,
  "eqVQeaVQeaVReaVReaVReaVReKVSeKVSeKVSeKVTeKVTeKVTeKRUd6RUd6RVd6RVd6RVdqRVdqRVdqRWdaRWdaRXdaRXdaRXdKRYdKRYdKRZdKRZc6RZc6Ra",
  ,
  "cqRacqRacqRacqRacqRbcqRbcqRccaRccaRccaRdcaRdcKRecKRecKRecKRfb6Rfb6Ngb6NgbqNgbqNgbqNgbqNgbaNhbaNhbaNhbaNibaNibaNjbaNjbKNk",
  ,
  "bKNkbKNkbKNla6Nla6Nma6Nma6NmaqNnaqNnaqNnaaNnaaNnaaNoaaNoaKNpaKNpaKNpaKNqZ6NqZ6NrZ6NrZ6NrZ6NsZ6NsZqNtZqNtZqNtZqNtZaNtZaNu",
  ,
  "ZaNuLqJSLaFOLaFOLaFOLaFOLKBNLKBNK6FMK6FMK6FMK6FMKqJMKqJMKaFLKaFLKKJLKKJLKKBKKKBKJ6FGJ6FGJqJGJqJJJqJJJaFFJaFFJaFFJKJFJKJF",
  ,
  "I6FEI6FEI6FEI6FDI6FDIaFCIaE/IaE/mKgkmKgkl6gll6gll6gml6gml6gnl6gnl6gnl6gnlqgolqgolqgplqgplagplagqlagqlKgqlKgqlKgqlKgrk6gr",
  ,
  "k6gsk6gsk6gskqgtkqgtkqgukagukagukagvkagvkagvkagvkacwkacwkKcwkKcxkKcxj6cyj6cyj6cyj6czjqczjqczjqc0jqc0jac0jac1jac1jKc2jKc2",
  ,
  "jKc2i6c2i6c2i6c3i6c3iqc3iqc4iqc4iqc5iqc5iqc5iqc6iac6iac7iac7iac7iKc8iKY8iKY8h6Y8h6Y9h6Y9h6Y9hqY+hqY+hqY/hqY/haY/haZAhaZA",
  ,
  "hKZBhKZBhKZBhKZBhKZBhKZChKZChKZCg6ZCg6ZDg6ZDgqZEgqZEgqZEgqZFgaZFgaZGgaZGgaZGgKZHgKZHgKZIf6VIf6VIf6VIf6VIf6VJf6VJfqVKfqVK",
  ,
  "fqVKfqVLfaVLfaVMfaVMfaVMfKVNfKVNfKVOe6VOe6VOe6VOe6VOeqVPeqVPeqVPeqVQeaVQeaVReaVReaVReaVReKVSeKVSeKVSeKVTeKVTeKVTeKRUd6RU",
  ,
  "d6RVd6RVd6RVdqRVdqRVdqRWdaRWdaRXdaRXdaRXdKRYdKRYdKRZdKRZc6RZc6RacqRacqRacqRacqRacqRbcqRbcqRccaRccaRccaRdcaRdcKRecKRecKRe",
  ,
  "cKRfb6Rfb6Ngb6NgbqNgbqNgbqNgbqNgbaNhbaNhbaNhbaNibaNibaNjbaNjbKNkbKNkbKNkbKNla6Nla6Nma6Nma6NmaqNnaqNnaqNnaaNnaaNnaaNoaaNo",
  ,
  "aKNpaKNpaKNpaKNqZ6NqZ6NrZ6NrZ6NrZ6NsZ6NsZqNtZqNtZqNtZqNtZaNtZaNuZaNuZKNvLaFRLaFRLaFRLaFQLKBNLKBPK6FMK6FMK6FMK6FMKqJMKqJM",
  ,
  "KaFLKaFLKKJLKKJLKKBKKKBKJ6FJJ6FJJqJJJqJJJqJJJaFFJaFFJaFFJKJFJKJFI6FEI6FEI6FEI6FDI6FDIaFCIaFCIaFCmagkmagkmKglmKglmKgml6gm",
  ,
  "l6gnl6gnl6gnl6gnl6gol6gol6gpl6gplqgplqgqlqgqlagqlagqlagqlagrlKgrlKgslKgslKgsk6gtk6gtk6gukqgukqgukqgvkqgvkagvkagvkacwkacw",
  ,
  "kacwkacxkKcxkKcykKcykKcyj6czj6czj6czjqc0jqc0jqc0jqc1jac1jac2jac2jac2jKc2jKc2jKc3jKc3i6c3i6c4i6c4iqc5iqc5iqc5iqc6iqc6iqc7",
  ,
  "iqc7iqc7iac8iaY8iKY8iKY8iKY9iKY9h6Y9h6Y+h6Y+hqY/hqY/hqY/hqZAhaZAhaZBhaZBhaZBhKZBhKZBhKZChKZChKZChKZChKZDg6ZDg6ZEg6ZEg6ZE",
  ,
  "gqZFgqZFgqZGgaZGgaZGgaZHgaZHgKZIgKVIgKVIf6VIf6VIf6VJf6VJf6VKf6VKf6VKfqVLfqVLfqVMfqVMfaVMfaVNfaVNfKVOfKVOfKVOfKVOe6VOe6VP",
  ,
  "e6VPe6VPeqVQeqVQeqVReaVReaVReaVReaVSeaVSeKVSeKVTeKVTeKVTeKRUeKRUd6RVd6RVd6RVd6RVdqRVdqRWdqRWdaRXdaRXdaRXdaRYdKRYdKRZdKRZ",
  ,
  "dKRZc6Rac6Rac6RacqRacqRacqRbcqRbcqRccqRccqRccqRdcaRdcaRecaRecaRecKRfcKRfb6Ngb6Ngb6Ngb6NgbqNgbqNgbqNhbaNhbaNhbaNibaNibaNj",
  ,
  "baNjbaNkbaNkbKNkbKNlbKNla6Nma6Nma6Nma6NnaqNnaqNnaqNnaqNnaaNoaaNoaaNpaKNpaKNpaKNqaKNqZ6NrZ6NrZ6NrZ6NsZ6NsZ6NtZqNtZqNtZqNt",
  ,
  "ZqNtZaNuZaNuZaNvZaNvLaFRLaFRLaFQLKBNLKBPK6FMK6FMK6FMK6FMKqJMKqJMKaFLKaFLKKJLKKJLKKBKKKBKJ6FJJ6FJJqJJJqJJJqJJJaFFJaFFJaFF",
  ,
  "JKJFJKJFI6FEI6FEI6FEI6FDI6FDIaFCIaFCIaFCmqgkmqgkmaglmaglmagmmKgmmKgnmKgnmKgnmKgnl6gol6gol6gpl6gpl6gpl6gql6gqlqgqlqgqlqgq",
  ,
  "lqgrlagrlagslagslagslKgtlKgtk6guk6guk6guk6gvkqgvkqgvkqgvkacwkacwkacwkacxkacxkacykacykacykKczkKczkKczj6c0j6c0j6c0j6c1jqc1",
  ,
  "jqc2jqc2jac2jac2jac2jKc3jKc3jKc3jKc4i6c4i6c5i6c5i6c5iqc6iqc6iqc7iqc7iqc7iqc8iqY8iaY8iaY8iaY9iaY9iKY9iKY+iKY+h6Y/h6Y/h6Y/",
  ,
  "hqZAhqZAhqZBhaZBhaZBhaZBhaZBhKZChKZChKZChKZChKZDhKZDhKZEhKZEg6ZEg6ZFg6ZFgqZGgqZGgqZGgqZHgaZHgaZIgKVIgKVIgKVIgKVIf6VJf6VJ",
  ,
  "f6VKf6VKf6VKf6VLf6VLfqVMfqVMfqVMfqVNfaVNfaVOfaVOfaVOfKVOfKVOfKVPe6VPe6VPe6VQe6VQeqVReqVReqVReqVReaVSeaVSeaVSeKVTeKVTeKVT",
  ,
  "eKRUeKRUeKRVeKRVeKRVd6RVd6RVd6RWdqRWdqRXdqRXdqRXdaRYdaRYdaRZdaRZdKRZdKRac6Rac6Rac6Rac6RacqRbcqRbcqRccqRccqRccqRdcqRdcaRe",
  ,
  "caRecaRecaRfcKRfcKNgcKNgb6Ngb6Ngb6Ngb6NgbqNhbqNhbqNhbaNibaNibaNjbaNjbaNkbaNkbaNkbKNlbKNlbKNmbKNma6Nma6Nna6NnaqNnaqNnaqNn",
  ,
  "aqNoaaNoaaNpaaNpaaNpaKNqaKNqaKNrZ6NrZ6NrZ6NsZ6NsZ6NtZ6NtZqNtZqNtZqNtZqNuZaNuZaNvZaNvZaNvLaFQLKBPLKBPK6FPK6FPK6FPK6FPKqJM",
  ,
  "KaFLKaFLKKJLKKJLKKBKKKBKJ6FJJ6FJJqJJJqJJJqJJJqJJJaFIJKJFJKJFJKJFI6FEI6FEI6FDI6FDI6FDIaFCIaFCIaFCIKBBIKBBm6glm6glmqgmmqgm",
  ,
  "mqgnmagnmagomagomagomagomKgpmKgpmKgqmKgql6gql6gql6gql6grl6grl6grl6gslqgslqgtlagtlagtlagulagulKgvlKgvlKgvlKgvk6gvk6gwk6gw",
  ,
  "kqcwkqcwkqcxkqcxkacykacykacykaczkaczkac0kKc0kKc1kKc1kKc1j6c2j6c2j6c2j6c2jqc2jqc3jqc3jac4jac4jac4jac5jKc5jKc6jKc6jKc6i6c7",
  ,
  "i6c7iqc8iqc8iqc8iqc8iqY8iqY8iqY9iaY9iaY9iaY+iaY+iKY/iKY/iKY/iKZAh6ZAh6ZBh6ZBhqZBhqZBhqZBhaZChaZChaZDhaZDhKZDhKZEhKZEhKZF",
  ,
  "hKZFhKZFhKZGg6ZGg6ZHg6ZHg6ZHgqZIgqZIgqZIgaVIgaVIgaVIgKVJgKVJgKVKf6VKf6VKf6VLf6VLf6VMf6VMf6VMf6VNfqVNfqVOfqVOfaVOfaVOfaVO",
  ,
  "faVPfKVPfKVQfKVQe6VQe6VRe6VReqVSeqVSeqVSeqVSeqVTeaVTeaVUeaVUeaVUeKRUeKRVeKRVeKRVeKRVeKRVeKRWd6RWd6RXdqRXdqRXdqRYdqRYdaRZ",
  ,
  "daRZdaRZdaRadKRadKRadKRac6Rbc6Rbc6Rbc6RccqRccqRdcqRdcqRdcqRecqRecaRfcaRfcaRfcaRgcKNgcKNgcKNgcKNgb6Ngb6Nhb6NhbqNibqNibqNi",
  ,
  "bqNjbaNjbaNkbaNkbaNkbaNlbaNlbKNmbKNmbKNmbKNna6Nna6Nna6NnaqNoaqNoaqNoaqNpaaNpaaNqaaNqaaNqaKNraKNraKNsaKNsZ6NsZ6NsZ6NtZ6Nt",
  ,
  "Z6NtZ6NtZqNtZqNuZqNuZaNvZaNvZaNvZaNwLKBPLKBPK6FPK6FPK6FPK6FPKqJMKaFLKaFLKKJLKKJLKKBKKKBKJ6FJJ6FJJqJJJqJJJqJJJqJJJaFIJKJI",
  ,
  "JKJIJKJII6FEI6FEI6FDI6FDI6FDIaFCIaFCIaFCIKBBIKBBnKglnKglm6gmm6gmm6gnmqgnmqgomqgomqgomqgomagpmagpmagqmagqmKgqmKgqmKgql6gr",
  ,
  "l6grl6grl6gsl6gsl6gtlqgtlqgtlqgulqgulagvlagvlagvlagvlKgvlKgwlKgwk6cwk6cwk6cxkqcxkqcykqcykqcykaczkaczkac0kac0kac1kac1kac1",
  ,
  "kKc2kKc2kKc2kKc2j6c2j6c3jqc3jqc4jqc4jqc4jac5jac5jac6jKc6jKc6jKc7jKc7i6c8i6c8i6c8i6c8iqY8iqY8iqY9iqY9iqY9iqY+iaY+iaY/iaY/",
  ,
  "iaY/iKZAiKZAiKZBh6ZBh6ZBh6ZBh6ZBhqZChqZChaZDhaZDhaZDhaZEhKZEhKZFhKZFhKZFhKZGhKZGhKZHg6ZHg6ZHg6ZIg6ZIgqZIgqVIgqVIgaVIgaVJ",
  ,
  "gaVJgKVKgKVKgKVKgKVLf6VLf6VMf6VMf6VMf6VNf6VNf6VOfqVOfqVOfqVOfaVOfaVPfaVPfKVQfKVQfKVQfKVRe6VRe6VSe6VSe6VSe6VSeqVTeqVTeqVU",
  ,
  "eaVUeaVUeaRUeKRVeKRVeKRVeKRVeKRVeKRWeKRWd6RXd6RXd6RXd6RYdqRYdqRZdqRZdqRZdaRadaRadKRadKRadKRbdKRbc6Rbc6Rcc6RccqRdcqRdcqRd",
  ,
  "cqRecqRecqRfcqRfcqRfcaRgcaNgcKNgcKNgcKNgcKNgb6Nhb6Nhb6Nib6NibqNibqNjbqNjbaNkbaNkbaNkbaNlbaNlbaNmbKNmbKNmbKNnbKNna6Nna6Nn",
  ,
  "a6Noa6NoaqNoaqNpaqNpaaNqaaNqaaNqaaNraKNraKNsaKNsZ6NsZ6NsZ6NtZ6NtZ6NtZ6NtZ6NtZqNuZqNuZqNvZqNvZaNvZaNwZaNwLKJQK6FPK6FPK6FP",
  ,
  "K6FPKqJPKqJPKqJPKKJLKKJLKKJKKKJKJ6FJJ6FJJqJJJqJJJqJJJqJJJaFIJKJIJKJIJKJII6FHI6FHI6FGI6FGI6FGIqJGIqJGIaFCIKJCIKJCnKglnKgl",
  ,
  "m6gmm6gmm6gnmqgnmqgomqgomqgomqgomagpmagpmagqmagqmKgqmKgqmKgql6grl6grl6grl6gsl6gsl6gtlqgtlqgtlqgulqgulagvlagvlagvlagvlKgv",
  ,
  "lKgwlKgwk6cwk6cwk6cxkqcxkqcykqcykqcykaczkaczkac0kac0kac1kac1kac1kKc2kKc2kKc2kKc2j6c2j6c3jqc3jqc4jqc4jqc4jac5jac5jac6jKc6",
  ,
  "jKc6jKc7jKc7i6c8i6c8i6c8i6c8iqY8iqY8iqY9iqY9iqY9iqY+iaY+iaY/iaY/iaY/iKZAiKZAiKZBh6ZBh6ZBh6ZBh6ZBhqZChqZChaZDhaZDhaZDhaZE",
  ,
  "hKZEhKZFhKZFhKZFhKZGhKZGhKZHg6ZHg6ZHg6ZIg6ZIgqZIgqVIgqVIgaVIgaVJgaVJgKVKgKVKgKVKgKVLf6VLf6VMf6VMf6VMf6VNf6VNf6VOfqVOfqVO",
  ,
  "fqVOfaVOfaVPfaVPfKVQfKVQfKVQfKVRe6VRe6VSe6VSe6VSe6VSeqVTeqVTeqVUeaVUeaVUeaRUeKRVeKRVeKRVeKRVeKRVeKRWeKRWd6RXd6RXd6RXd6RY",
  ,
  "dqRYdqRZdqRZdqRZdaRadaRadKRadKRadKRbdKRbc6Rbc6Rcc6RccqRdcqRdcqRdcqRecqRecqRfcqRfcqRfcaRgcaNgcKNgcKNgcKNgcKNgb6Nhb6Nhb6Ni",
  ,
  "b6NibqNibqNjbqNjbaNkbaNkbaNkbaNlbaNlbaNmbKNmbKNmbKNnbKNna6Nna6Nna6Noa6NoaqNoaqNpaqNpaaNqaaNqaaNqaaNraKNraKNsaKNsZ6NsZ6Ns",
  ,
  "Z6NtZ6NtZ6NtZ6NtZ6NtZqNuZqNuZqNvZqNvZaNvZaNwZaNwZKNxK6FPK6FPK6FPK6FPKqJPKqJPKqJPKKJNKKJNKKJKKKJNJ6FJJ6FJJqJJJqJJJqJJJqJJ",
  ,
  "JaFIJKJIJKJIJKJII6FHI6FHI6FGI6FGI6FGIqJGIqJGIaFFIKJCIKJCnKglnKglnKgmnKgmnKgnm6gnm6gom6gom6gom6gomqgpmqgpmqgqmqgqmagqmagq",
  ,
  "mKgqmKgrmKgrmKgrl6gsl6gsl6gtl6gtl6gtl6gul6gulqgvlqgvlqgvlagvlagvlagwlKgwlKcwlKcwlKcxk6cxk6cyk6cyk6cykqczkqczkqc0kac0kac1",
  ,
  "kac1kac1kac2kac2kKc2kKc2kKc2kKc3j6c3j6c4j6c4j6c4jqc5jqc5jac6jac6jac6jac7jKc7jKc8jKc8jKc8i6c8i6Y8i6Y8iqY9iqY9iqY9iqY+iqY+",
  ,
  "iqY/iaY/iaY/iaZAiaZAiKZBiKZBiKZBiKZBh6ZBh6ZCh6ZChqZDhqZDhqZDhaZEhaZEhaZFhaZFhKZFhKZGhKZGhKZHhKZHhKZHhKZIg6ZIg6ZIgqVIgqVI",
  ,
  "gqVIgqVJgaVJgaVKgaVKgaVKgKVLgKVLgKVMf6VMf6VMf6VNf6VNf6VOf6VOfqVOfqVOfqVOfqVPfaVPfaVQfaVQfaVQfKVRfKVRfKVSfKVSfKVSe6VSe6VT",
  ,
  "eqVTeqVUeqVUeqVUeaRUeaRVeaRVeKRVeKRVeKRVeKRWeKRWeKRXd6RXd6RXd6RYd6RYdqRZdqRZdqRZdqRadaRadaRadaRadKRbdKRbdKRbdKRcc6Rcc6Rd",
  ,
  "c6RdcqRdcqRecqRecqRfcqRfcqRfcqRgcaNgcaNgcaNgcaNgcKNgcKNhb6Nhb6Nib6Nib6NibqNjbqNjbqNkbaNkbaNkbaNlbaNlbaNmbaNmbaNmbKNnbKNn",
  ,
  "bKNna6Nna6Noa6Noa6NoaqNpaqNpaqNqaqNqaaNqaaNraaNraKNsaKNsaKNsZ6NsZ6NtZ6NtZ6NtZ6NtZ6NtZ6NuZqNuZqNvZqNvZqNvZaNwZaNwZKNxZKNx",
  ,
  "K6FPK6FPK6FPKqJPKqJPKqJPKKJNKKJNKKJKKKJNJ6FJJ6FJJqJJJqJJJqJJJqJJJaFIJKJIJKJIJKJII6FHI6FHI6FGI6FGI6FGIqJGIqJGIaFFIKJCIKJC",
  ,
  "naclnaclnKcmnKcmnKcnnKcnnKconKconKconKcom6cpm6cpmqcqmqcqmqcqmqcqmacqmacrmacrmacrmKcsmKcsmKctl6ctl6ctl6cul6cul6cvl6cvl6cv",
  ,
  "lqcvlqcvlqcwlacwlacwlacwlacxlKcxlKYyk6Yyk6Yyk6Yzk6YzkqY0kqY0kqY1kqY1kaY1kaY2kaY2kaY2kaY2kaY2kKY3kKY3kKY4kKY4j6Y4j6Y5j6Y5",
  ,
  "jqY6jqY6jqY6jqY7jaY7jaY8jKY8jKY8jKY8jKY8i6Y8i6Y9i6Y9i6Y9iqY+iqY+iqY/iqU/iqU/iqVAiaVAiaVBiaVBiKVBiKVBiKVBiKVCh6VCh6VDh6VD",
  ,
  "h6VDhqVEhqVEhaVFhaVFhaVFhaVGhKVGhKVHhKVHhKVHhKVIhKVIhKVIg6VIg6VIg6VIgqVJgqVJgqVKgaVKgaVKgaVLgaVLgKVMgKVMgKVMf6RNf6RNf6RO",
  ,
  "f6ROf6ROf6ROf6ROfqRPfqRPfqRQfqRQfaRQfaRRfKRRfKRSfKRSfKRSfKRSe6RTe6RTe6RUeqRUeqRUeqRUeqRVeaRVeaRVeaRVeKRVeKRWeKRWeKRXeKRX",
  ,
  "eKRXeKRYd6RYd6RZd6RZd6RZdqRadqNadaNadaNadaNbdaNbdKNbdKNcdKNcc6Ndc6Ndc6Ndc6NecqNecqNfcqNfcqNfcqNgcqNgcaNgcaNgcaNgcaNgcKNh",
  ,
  "cKNhcKNicKNib6Nib6NjbqNjbqNkbqNkbqNkbaNlbaNlbaNmbaNmbaNmbaNnbaNnbKNnbKNna6Noa6Noa6Noa6NpaqNpaqNqaqNqaqNqaaNraaNraaNsaaNs",
  ,
  "aKNsaKNsZ6NtZ6NtZ6NtZ6NtZ6NtZ6NuZ6NuZqNvZqNvZqNvZaNwZaNwZaNxZKNxZKNxKqJPKqJPKqJPKKJNKKJNKKJNKKJNKKJNJ6FJJqJJJqJJJqJJJqJJ",
  ,
  "JaFIJaFIJKJII6FHI6FHI6FHI6FGI6FGIqJGIqJGIqJGIaFFIaFFIKJCIKJCIKJCnqcmnqcmnacnnacnnaconKconKcpnKcpnKcpnKcpnKcqnKcqm6cqm6cq",
  ,
  "m6cqm6crmqcrmqcsmqcsmqcsmactmactmKcumKcumKcumKcvl6cvl6cvl6cvl6cvl6cvl6cwl6cwlqcxlqcxlqcxlacylacylaYzlKYzlKYzlKY0lKY0k6Y1",
  ,
  "k6Y1kqY2kqY2kqY2kqY2kaY2kaY3kaY3kaY3kaY4kaY4kaY5kaY5kKY5kKY5j6Y6j6Y6j6Y7j6Y7jqY7jqY8jqY8jaY8jaY8jaY8jKY9jKY9jKY+i6Y+i6Y+",
  ,
  "i6Y/i6Y/iqZAiqVAiqVAiqVBiqVBiqVBiaVBiaVCiaVCiaVCiKVCiKVDiKVDiKVDh6VEh6VEhqVFhqVFhqVFhqVGhaVGhaVHhaVHhKVIhKVIhKVIhKVIhKVI",
  ,
  "hKVJhKVJg6VJg6VKg6VKgqVLgqVLgqVLgqVMgaVMgaVMgKVNgKVNgKRNgKROf6ROf6ROf6ROf6ROf6RPf6RPf6RQfqRQfqRQfqRRfaRRfaRSfaRSfaRSfaRS",
  ,
  "fKRTfKRTfKRUe6RUe6RVe6RVeqRVeqRVeqRVeaRVeaRVeaRWeaRWeKRXeKRXeKRYeKRYeKRYeKRZd6RZd6Rad6Rad6RadqNadqNadqNbdaNbdaNbdaNcdKNc",
  ,
  "dKNddKNddKNdc6Nec6Nec6NfcqNfcqNfcqNfcqNgcqNgcqNgcaNgcaNgcaNhcaNhcKNicKNicKNicKNjb6Njb6NkbqNkbqNlbqNlbqNlbaNmbaNmbaNnbaNn",
  ,
  "baNnbaNnbaNnbKNobKNobKNoa6Noa6Npa6NpaqNqaqNqaqNqaqNraaNraaNsaaNsaKNsaKNtaKNtZ6NtZ6NtZ6NtZ6NuZ6NuZ6NvZ6NvZ6NvZqNwZqNwZaNx",
  ,
  "ZaNxZaNyZaNyZKNyKqJPKqJPKKJNKKJNKKJNKKJNKKJNJ6FJJqJJJqJJJqJJJqJJJaFIJaFIJKJII6FHI6FHI6FHI6FGI6FGIqJGIqJGIqJGIaFFIaFFIKJC",
  ,
  "IKJCIKJCnqcmnqcmnacnnacnnaconKconKcpnKcpnKcpnKcpnKcqnKcqm6cqm6cqm6cqm6crmqcrmqcsmqcsmqcsmactmactmKcumKcumKcumKcvl6cvl6cv",
  ,
  "l6cvl6cvl6cvl6cwl6cwlqcxlqcxlqcxlacylacylaYzlKYzlKYzlKY0lKY0k6Y1k6Y1kqY2kqY2kqY2kqY2kaY2kaY3kaY3kaY3kaY4kaY4kaY5kaY5kKY5",
  ,
  "kKY5j6Y6j6Y6j6Y7j6Y7jqY7jqY8jqY8jaY8jaY8jaY8jKY9jKY9jKY+i6Y+i6Y+i6Y/i6Y/iqZAiqVAiqVAiqVBiqVBiqVBiaVBiaVCiaVCiaVCiKVCiKVD",
  ,
  "iKVDiKVDh6VEh6VEhqVFhqVFhqVFhqVGhaVGhaVHhaVHhKVIhKVIhKVIhKVIhKVIhKVJhKVJg6VJg6VKg6VKgqVLgqVLgqVLgqVMgaVMgaVMgKVNgKVNgKRN",
  ,
  "gKROf6ROf6ROf6ROf6ROf6RPf6RPf6RQfqRQfqRQfqRRfaRRfaRSfaRSfaRSfaRSfKRTfKRTfKRUe6RUe6RVe6RVeqRVeqRVeqRVeaRVeaRVeaRWeaRWeKRX",
  ,
  "eKRXeKRYeKRYeKRYeKRZd6RZd6Rad6Rad6RadqNadqNadqNbdaNbdaNbdaNcdKNcdKNddKNddKNdc6Nec6Nec6NfcqNfcqNfcqNfcqNgcqNgcqNgcaNgcaNg",
  ,
  "caNhcaNhcKNicKNicKNicKNjb6Njb6NkbqNkbqNlbqNlbqNlbaNmbaNmbaNnbaNnbaNnbaNnbaNnbKNobKNobKNoa6Noa6Npa6NpaqNqaqNqaqNqaqNraaNr",
  ,
  "aaNsaaNsaKNsaKNtaKNtZ6NtZ6NtZ6NtZ6NuZ6NuZ6NvZ6NvZ6NvZqNwZqNwZaNxZaNxZaNyZaNyZKNyZKNyKqJPKKJNKKJNKKJNKKJNKKJNJ6FMJqJMJqJM",
  ,
  "JqJMJqJMJaFLJaFLJKJII6FHI6FHI6FHI6FGI6FGIqJGIqJGIqJGIaFFIaFFIKJFIKJFIKJFnqcmnqcmnacnnacnnaconKconKcpnKcpnKcpnKcpnKcqnKcq",
  ,
  "m6cqm6cqm6cqm6crmqcrmqcsmqcsmqcsmactmactmKcumKcumKcumKcvl6cvl6cvl6cvl6cvl6cvl6cwl6cwlqcxlqcxlqcxlacylacylaYzlKYzlKYzlKY0",
  ,
  "lKY0k6Y1k6Y1kqY2kqY2kqY2kqY2kaY2kaY3kaY3kaY3kaY4kaY4kaY5kaY5kKY5kKY5j6Y6j6Y6j6Y7j6Y7jqY7jqY8jqY8jaY8jaY8jaY8jKY9jKY9jKY+",
  ,
  "i6Y+i6Y+i6Y/i6Y/iqZAiqVAiqVAiqVBiqVBiqVBiaVBiaVCiaVCiaVCiKVCiKVDiKVDiKVDh6VEh6VEhqVFhqVFhqVFhqVGhaVGhaVHhaVHhKVIhKVIhKVI",
  ,
  "hKVIhKVIhKVJhKVJg6VJg6VKg6VKgqVLgqVLgqVLgqVMgaVMgaVMgKVNgKVNgKRNgKROf6ROf6ROf6ROf6ROf6RPf6RPf6RQfqRQfqRQfqRRfaRRfaRSfaRS",
  ,
  "faRSfaRSfKRTfKRTfKRUe6RUe6RVe6RVeqRVeqRVeqRVeaRVeaRVeaRWeaRWeKRXeKRXeKRYeKRYeKRYeKRZd6RZd6Rad6Rad6RadqNadqNadqNbdaNbdaNb",
  ,
  "daNcdKNcdKNddKNddKNdc6Nec6Nec6NfcqNfcqNfcqNfcqNgcqNgcqNgcaNgcaNgcaNhcaNhcKNicKNicKNicKNjb6Njb6NkbqNkbqNlbqNlbqNlbaNmbaNm",
  ,
  "baNnbaNnbaNnbaNnbaNnbKNobKNobKNoa6Noa6Npa6NpaqNqaqNqaqNqaqNraaNraaNsaaNsaKNsaKNtaKNtZ6NtZ6NtZ6NtZ6NuZ6NuZ6NvZ6NvZ6NvZqNw",
  ,
  "ZqNwZaNxZaNxZaNyZaNyZKNyZKNyZKNyKKJNKKJNKKJNKKJNKKJNJ6FMJqJMJqJMJqJMJqJMJaFLJaFLJKJII6FHI6FHI6FHI6FGI6FGIqJGIqJGIqJGIaFF",
  ,
  "IaFFIKJFIKJFIKJFn6cmn6cmnqcnnqcnnqconaconacpnacpnacpnacpnKcqnKcqnKcqnKcqnKcqnKcrm6crm6csm6csm6csmqctmqctmacumacumacumacv",
  ,
  "mKcvmKcvmKcvmKcvl6cvl6cwl6cwl6cxl6cxl6cxlqcylqcylqYzlaYzlaYzlaY0lKY0lKY1lKY1k6Y2k6Y2k6Y2k6Y2kqY2kqY3kqY3kaY3kaY4kaY4kaY5",
  ,
  "kaY5kaY5kaY5kKY6kKY6kKY7kKY7j6Y7j6Y8jqY8jqY8jqY8jqY8jaY9jaY9jaY+jKY+jKY+jKY/i6Y/i6ZAi6VAi6VAiqVBiqVBiqVBiqVBiqVCiqVCiaVC",
  ,
  "iaVCiaVDiKVDiKVDiKVEiKVEh6VFh6VFh6VFhqVGhqVGhqVHhaVHhaVIhaVIhaVIhKVIhKVIhKVJhKVJhKVJhKVKg6VKg6VLg6VLg6VLgqVMgqVMgaVMgaVN",
  ,
  "gaVNgaRNgKROgKROgKROf6ROf6ROf6RPf6RPf6RQf6RQf6RQfqRRfqRRfqRSfaRSfaRSfaRSfaRTfaRTfKRUfKRUe6RVe6RVe6RVe6RVeqRVeqRVeqRVeqRW",
  ,
  "eaRWeaRXeKRXeKRYeKRYeKRYeKRZeKRZeKRaeKRad6Rad6NadqNadqNbdqNbdqNbdaNcdaNcdaNddKNddKNddKNec6Nec6Nfc6Nfc6NfcqNfcqNgcqNgcqNg",
  ,
  "cqNgcqNgcaNhcaNhcaNicKNicKNicKNjcKNjb6Nkb6Nkb6Nlb6NlbqNlbqNmbaNmbaNnbaNnbaNnbaNnbaNnbaNobKNobKNobKNoa6Npa6Npa6Nqa6NqaqNq",
  ,
  "aqNraqNraaNsaaNsaaNsaKNtaKNtaKNtZ6NtZ6NtZ6NuZ6NuZ6NvZ6NvZ6NvZqNwZqNwZqNxZaNxZaNyZaNyZaNyZKNyZKNyY6NyKKJNKKJNKKJNKKJNJ6FM",
  ,
  "JqJMJqJMJqJMJqJMJaFLJaFLJKJII6FHI6FHI6FHI6FGI6FGIqJGIqJGIqJGIaFFIaFFIKJFIKJFIKJFoKcmoKcmn6cnn6cnn6conqconqcpnqcpnqcpnacp",
  ,
  "nacqnacqnKcqnKcqnKcqnKcrnKcrnKcsnKcsm6csm6ctm6ctmqcumqcumqcumqcvmacvmacvmKcvmKcvmKcvmKcwl6cwl6cxl6cxl6cxl6cyl6cylqYzlqYz",
  ,
  "lqYzlqY0laY0laY1laY1lKY2lKY2lKY2k6Y2k6Y2k6Y3k6Y3kqY3kqY4kqY4kaY5kaY5kaY5kaY5kaY6kaY6kKY7kKY7kKY7kKY8j6Y8j6Y8j6Y8jqY8jqY9",
  ,
  "jqY9jaY+jaY+jaY+jaY/jKY/jKZAi6VAi6VAi6VBi6VBiqVBiqVBiqVCiqVCiqVCiqVCiaVDiaVDiaVDiaVEiKVEiKVFiKVFiKVFh6VGh6VGhqVHhqVHhqVI",
  ,
  "hqVIhaVIhaVIhaVIhKVJhKVJhKVJhKVKhKVKhKVLg6VLg6VLg6VMgqVMgqVMgqVNgqVNgaRNgaROgaROgKROgKROgKROf6RPf6RPf6RQf6RQf6RQf6RRf6RR",
  ,
  "fqRSfqRSfqRSfqRSfaRTfaRTfaRUfKRUfKRVfKRVfKRVe6RVe6RVeqRVeqRVeqRWeqRWeaRXeaRXeaRYeaRYeKRYeKRZeKRZeKRaeKRaeKRad6Nad6Nad6Nb",
  ,
  "dqNbdqNbdqNcdaNcdaNddaNddaNddKNedKNedKNfc6Nfc6Nfc6NfcqNgcqNgcqNgcqNgcqNgcqNhcqNhcaNicaNicaNicKNjcKNjcKNkb6Nkb6Nlb6Nlb6Nl",
  ,
  "bqNmbqNmbaNnbaNnbaNnbaNnbaNnbaNobaNobaNobKNobKNpa6Npa6Nqa6Nqa6NqaqNraqNraqNsaqNsaaNsaaNtaKNtaKNtaKNtaKNtZ6NuZ6NuZ6NvZ6Nv",
  ,
  "Z6NvZ6NwZqNwZqNxZqNxZaNyZaNyZaNyZKNyZKNyZKNyZKNyJ6FMJ6FMJ6FMJqJMJqJMJqJMJaNMJaNMJKJLJKJLJKJHJKJKJKJKI6FGIqJGIqJGIaNGIaNG",
  ,
  "IaNGIKJFIKJFIKJFIKJFIKJFoacnoacnoKcooKcooKcpn6cpn6cqn6cqn6cqnqcqnqcqnqcqnacrnacrnacrnacsnKcsnKctnKctnKctnKcunKcum6cvm6cv",
  ,
  "m6cvm6cvmqcvmqcvmacwmacwmacwmacxmKcxmKcyl6cyl6cyl6czl6czl6Y0l6Y0l6Y0l6Y1lqY1lqY2laY2laY2laY2laY2lKY2lKY3lKY3lKY3k6Y4k6Y4",
  ,
  "kqY5kqY5kqY5kqY6kaY6kaY7kaY7kaY8kaY8kaY8kKY8kKY8kKY9kKY9j6Y9j6Y+jqY+jqY+jqY/jqY/jaY/jaZAjaZAjKVBjKVBjKVBi6VBi6VBi6VCiqVC",
  ,
  "iqVCiqVDiqVDiqVEiqVEiqVEiaVFiaVFiaVGiKVGiKVGiKVHh6VHh6VHh6VIhqVIhqVIhqVIhqVIhaVJhaVJhaVJhKVKhKVKhKVLhKVLhKVMhKVMhKVMg6VN",
  ,
  "g6VNgqVOgqVOgqROgqROgaROgaROgKRPgKRPgKRPgKRQf6RQf6RRf6RRf6RRf6RSf6RSfqRTfqRTfqRTfqRTfqRUfaRUfaRVfaRVfaRVfKRVfKRVe6RWe6RW",
  ,
  "e6RWe6RWeqRXeqRXeaRYeaRYeaRYeaRZeKRZeKRaeKRaeKRaeKRaeKNad6Nbd6Nbd6Ncd6NcdqNcdqNddqNddaNedaNedaNedKNfdKNfdKNfdKNfc6Ngc6Ng",
  ,
  "cqNgcqNgcqNhcqNhcqNhcqNicqNicaNjcaNjcaNjcKNkcKNkcKNlb6Nlb6Nlb6Nmb6NmbqNnbqNnbqNnbaNnbaNnbaNnbaNobaNobaNobKNpbKNpbKNqa6Nq",
  ,
  "a6Nqa6Nra6NraqNsaqNsaqNsaaNtaaNtaaNtaKNtaKNuaKNuaKNuZ6NuZ6NvZ6NvZ6NvZ6NwZ6NwZqNxZqNxZqNyZqNyZaNyZaNyZKNyZKNzZKNzZKNzJ6FM",
  ,
  "J6FMJqJMJqJMJqJMJaNMJaNMJKJLJKJLJKJKJKJKJKJKI6FJIqJGIqJGIaNGIaNGIaNGIKJFIKJFIKJFIKJFIKJFoacnoacnoKcooKcooKcpn6cpn6cqn6cq",
  ,
  "n6cqnqcqnqcqnqcqnacrnacrnacrnacsnKcsnKctnKctnKctnKcunKcum6cvm6cvm6cvm6cvmqcvmqcvmacwmacwmacwmacxmKcxmKcyl6cyl6cyl6czl6cz",
  ,
  "l6Y0l6Y0l6Y0l6Y1lqY1lqY2laY2laY2laY2laY2lKY2lKY3lKY3lKY3k6Y4k6Y4kqY5kqY5kqY5kqY6kaY6kaY7kaY7kaY8kaY8kaY8kKY8kKY8kKY9kKY9",
  ,
  "j6Y9j6Y+jqY+jqY+jqY/jqY/jaY/jaZAjaZAjKVBjKVBjKVBi6VBi6VBi6VCiqVCiqVCiqVDiqVDiqVEiqVEiqVEiaVFiaVFiaVGiKVGiKVGiKVHh6VHh6VH",
  ,
  "h6VIhqVIhqVIhqVIhqVIhaVJhaVJhaVJhKVKhKVKhKVLhKVLhKVMhKVMhKVMg6VNg6VNgqVOgqVOgqROgqROgaROgaROgKRPgKRPgKRPgKRQf6RQf6RRf6RR",
  ,
  "f6RRf6RSf6RSfqRTfqRTfqRTfqRTfqRUfaRUfaRVfaRVfaRVfKRVfKRVe6RWe6RWe6RWe6RWeqRXeqRXeaRYeaRYeaRYeaRZeKRZeKRaeKRaeKRaeKRaeKNa",
  ,
  "d6Nbd6Nbd6Ncd6NcdqNcdqNddqNddaNedaNedaNedKNfdKNfdKNfdKNfc6Ngc6NgcqNgcqNgcqNhcqNhcqNhcqNicqNicaNjcaNjcaNjcKNkcKNkcKNlb6Nl",
  ,
  "b6Nlb6Nmb6NmbqNnbqNnbqNnbaNnbaNnbaNnbaNobaNobaNobKNpbKNpbKNqa6Nqa6Nqa6Nra6NraqNsaqNsaqNsaaNtaaNtaaNtaKNtaKNuaKNuaKNuZ6Nu",
  ,
  "Z6NvZ6NvZ6NvZ6NwZ6NwZqNxZqNxZqNyZqNyZaNyZaNyZKNyZKNzZKNzZKNzY6N0J6FMJqJMJqJMJqJMJaNMJaNMJKJLJKJLJKJKJKJKJKJKI6FJIqJJIqJJ",
  ,
  "IaNJIaNJIaNJIKJFIKJIIKJIIKJFIKJFoqYnoqYnoaYooaYooaYpoKYpoKYqoKYqoKYqn6Yqn6Yqn6YqnqYrnqYrnqYrnqYsnaYsnaYtnaYtnKYtnKYunKYu",
  ,
  "nKYvnKYvnKYvm6Yvm6Yvm6YvmqYwmqYwmqYwmqYxmaYxmaYymKYymKYymKYzmKYzl6Y0l6Y0l6Y0l6Y1l6Y1l6Y2lqU2lqU2lqU2lqU2laU2laU3lKU3lKU3",
  ,
  "lKU4lKU4k6U5k6U5k6U5kqU6kqU6kqU7kaU7kaU8kaU8kaU8kaU8kaU8kKU9kKU9kKU9kKU+j6U+j6U+jqU/jqU/jqU/jqVAjaVAjaVBjaVBjaVBjKVBjKVB",
  ,
  "i6VCi6VCi6VCi6VDiqVDiqVEiqREiqREiqRFiqRFiaRGiaRGiaRGiaRHiKRHiKRHh6RIh6RIh6RIh6RIhqRIhqRJhaRJhaRJhaRKhaRKhKRLhKRLhKRMhKRM",
  ,
  "hKRMhKRNg6RNg6ROg6ROg6ROgqROgqROgaROgaRPgaRPgaRPgKRQgKRQgKRRgKRRf6RRf6RSf6RSf6RTf6RTf6RTf6RTfqNUfqNUfaNVfaNVfaNVfaNVfKNV",
  ,
  "fKNWfKNWfKNWe6NWe6NXeqNXeqNYeqNYeqNYeaNZeaNZeKNaeKNaeKNaeKNaeKNaeKNbeKNbd6Ncd6Ncd6NcdqNddqNddqNedqNedaNedaNfdKNfdKNfdKNf",
  ,
  "dKNgc6Ngc6Ngc6NgcqNhcqNhcqNhcqNicqNicqNjcqNjcaNjcaNkcKNkcKNlcKNlcKNlb6Nmb6Nmb6NnbqNnbqNnbqNnbaNnbaNnbaNobaNobaNobaNpbKNp",
  ,
  "bKNqbKNqbKNqa6Nra6Nra6NsaqNsaqNsaqNtaaNtaaNtaaNtaKNuaKNuaKNuZ6NuZ6NvZ6NvZ6NvZ6NwZ6NwZ6NxZqJxZqJyZqJyZaJyZaJyZaJyZKJzZKJz",
  ,
  "ZKJzY6J0Y6J0JqJMJqJMJqJMJaNMJaNMJKJLJKJLJKJKJKJKJKJKI6FJIqJJIqJJIaNJIaNJIaNJIKJFIKJIIKJIIKJFIKJFo6Yno6YnoqYooqYooqYpoaYp",
  ,
  "oaYqoaYqoaYqoKYqoKYqoKYqn6Yrn6Yrn6YrnqYsnqYsnqYtnqYtnaYtnaYunaYunKYvnKYvnKYvnKYvnKYvnKYvm6Ywm6Ywm6YwmqYxmqYxmqYymaYymaYy",
  ,
  "maYzmKYzmKY0mKY0mKY0l6Y1l6Y1l6Y2l6U2l6U2l6U2lqU2lqU2lqU3laU3laU3laU4lKU4lKU5lKU5lKU5k6U6k6U6kqU7kqU7kqU8kqU8kaU8kaU8kaU8",
  ,
  "kaU9kaU9kaU9kKU+kKU+kKU+j6U/j6U/j6U/jqVAjqVAjqVBjqVBjaVBjaVBjKVBjKVCjKVCjKVCi6VDi6VDi6VEiqREiqREiqRFiqRFiqRGiqRGiqRGiaRH",
  ,
  "iaRHiKRHiKRIiKRIiKRIh6RIh6RIh6RJhqRJhqRJhqRKhaRKhaRLhaRLhKRMhKRMhKRMhKRNhKRNhKROhKROg6ROg6ROgqROgqROgqRPgqRPgaRPgaRQgaRQ",
  ,
  "gKRRgKRRgKRRf6RSf6RSf6RTf6RTf6RTf6RTf6NUfqNUfqNVfqNVfqNVfaNVfaNVfKNWfKNWfKNWfKNWe6NXe6NXe6NYeqNYeqNYeqNZeaNZeaNaeaNaeaNa",
  ,
  "eKNaeKNaeKNbeKNbeKNceKNcd6Ncd6NddqNddqNedqNedqNedaNfdaNfdaNfdaNfdKNgdKNgc6Ngc6Ngc6Nhc6NhcqNhcqNicqNicqNjcqNjcqNjcaNkcaNk",
  ,
  "cKNlcKNlcKNlcKNmb6Nmb6Nnb6Nnb6NnbqNnbqNnbaNnbaNobaNobaNobaNpbaNpbKNqbKNqbKNqbKNra6Nra6Nsa6Nsa6NsaqNtaqNtaaNtaaNtaaNuaaNu",
  ,
  "aKNuaKNuZ6NvZ6NvZ6NvZ6NwZ6NwZ6NxZqJxZqJyZqJyZqJyZaJyZaJyZaJzZaJzZKJzZKJ0Y6J0Y6J1JqJMJqJMJaNPJaNPJKJLJKJLJKJKJKJKJKJKI6FJ",
  ,
  "IqJJIqJJIaNJIaNJIaNJIKJIIKJIIKJIIKJIIKJIo6Yno6Yno6Yoo6Yoo6YpoqYpoqYqoqYqoqYqoaYqoaYqoaYqoKYroKYroKYrn6Ysn6Ysn6Ytn6YtnqYt",
  ,
  "nqYunaYunaYvnaYvnaYvnKYvnKYvnKYvnKYwnKYwnKYwm6Yxm6Yxm6YymqYymqYymqYzmaYzmaY0maY0maY0mKY1mKY1l6Y2l6U2l6U2l6U2l6U2l6U2lqU3",
  ,
  "lqU3lqU3lqU4laU4laU5lKU5lKU5lKU6lKU6k6U7k6U7k6U8k6U8kqU8kqU8kaU8kaU9kaU9kaU9kaU+kaU+kKU+kKU/kKU/kKU/j6VAj6VAjqVBjqVBjqVB",
  ,
  "jqVBjaVBjaVCjKVCjKVCjKVDjKVDi6VEi6REi6REiqRFiqRFiqRGiqRGiqRGiqRHiqRHiaRHiaRIiKRIiKRIiKRIiKRIh6RJh6RJh6RJhqRKhqRKhqRLhaRL",
  ,
  "haRMhaRMhKRMhKRNhKRNhKROhKROhKROg6ROg6ROg6ROgqRPgqRPgqRPgqRQgaRQgaRRgaRRgKRRgKRSgKRSf6RTf6RTf6RTf6RTf6NUf6NUf6NVfqNVfqNV",
  ,
  "fqNVfaNVfaNWfaNWfaNWfKNWfKNXe6NXe6NYe6NYe6NYeqNZeqNZeaNaeaNaeaNaeaNaeKNaeKNbeKNbeKNceKNceKNcd6Ndd6Ndd6Ned6NedqNedqNfdaNf",
  ,
  "daNfdaNfdaNgdKNgdKNgc6Ngc6Nhc6Nhc6NhcqNicqNicqNjcqNjcqNjcqNkcaNkcaNlcaNlcaNlcKNmcKNmb6Nnb6Nnb6Nnb6NnbqNnbqNnbaNobaNobaNo",
  ,
  "baNpbaNpbaNqbKNqbKNqbKNrbKNra6Nsa6Nsa6NsaqNtaqNtaqNtaaNtaaNuaaNuaKNuaKNuaKNvZ6NvZ6NvZ6NwZ6NwZ6NxZ6JxZqJyZqJyZqJyZqJyZaJy",
  ,
  "ZaJzZaJzZKJzZKJ0ZKJ0Y6J1Y6J1JaFLJKJLJKJLJKJLJKJKI6FJI6FJI6FJIqJJIaFIIaFIIKJIIKJIIKJIIKJIIKJIIKJIHqJDHqJDo6Yoo6Yoo6Ypo6Yp",
  ,
  "o6YqoqYqoqYqoqYqoqYqoaYqoaYroaYroKYsoKYsoKYsn6Ytn6Ytn6Yun6YunqYunqYvnaYvnaYvnaYvnaYvnKYvnKYwnKYwnKYxnKYxnKYxm6Yym6Yym6Yz",
  ,
  "mqYzmqYzmqY0maY0maY1maY1maY1mKY2mKY2l6Y2l6U2l6U2l6U2l6U3l6U3lqU4lqU4lqU4lqU5laU5laU6lKU6lKU6lKU7lKU7k6U8k6U8k6U8k6U8kqU8",
  ,
  "kqU8kaU9kaU9kaU9kaU+kaU+kaU/kKU/kKVAkKVAkKVAj6VBj6VBjqVBjqVBjqVBjqVCjaVCjaVDjKVDjKVDjKVDjKVEi6VEi6RFi6RFiqRFiqRGiqRGiqRH",
  ,
  "iqRHiqRHiqRIiaRIiaRIiKRIiKRIiKRJiKRJh6RKh6RKh6RKhqRKhqRLhqRLhaRMhaRMhaRMhKRNhKRNhKROhKROhKROhKROg6ROg6RPg6RPgqRQgqRQgqRQ",
  ,
  "gqRRgaRRgaRRgaRRgKRSgKRSgKRTf6RTf6RTf6RTf6RUf6NUf6NVf6NVfqNVfqNVfqNVfaNWfaNWfaNXfaNXfKNXfKNYe6NYe6NYe6NZe6NZeqNZeqNaeaNa",
  ,
  "eaNaeaNaeaNaeKNbeKNbeKNceKNceKNceKNdd6Ndd6Ned6Ned6NedqNfdqNfdaNfdaNgdaNgdaNgdKNgdKNgc6Nhc6Nhc6Nhc6NicqNicqNjcqNjcqNjcqNk",
  ,
  "cqNkcaNlcaNlcaNmcaNmcKNmcKNmb6Nnb6Nnb6Nnb6NnbqNnbqNobaNobaNpbaNpbaNpbaNqbaNqbKNrbKNrbKNrbKNsa6Nsa6Nta6NtaqNtaqNtaqNtaaNt",
  ,
  "aaNuaaNuaKNuaKNvaKNvZ6NwZ6NwZ6NwZ6NxZ6NxZ6JyZqJyZqJyZqJyZqJyZaJzZaJzZaJzZKJzZKJ0ZKJ0Y6J1Y6J1Y6J1JKJOJKJOJKJOJKJKI6FJI6FJ",
  ,
  "I6FJIqJJIaFIIaFIIKJIIKJIIKJIIKJIIKJIIKJIHqJDHqJDo6Yoo6Yoo6Ypo6Ypo6YqoqYqoqYqoqYqoqYqoaYqoaYroaYroKYsoKYsoKYsn6Ytn6Ytn6Yu",
  ,
  "n6YunqYunqYvnaYvnaYvnaYvnaYvnKYvnKYwnKYwnKYxnKYxnKYxm6Yym6Yym6YzmqYzmqYzmqY0maY0maY1maY1maY1mKY2mKY2l6Y2l6U2l6U2l6U2l6U3",
  ,
  "l6U3lqU4lqU4lqU4lqU5laU5laU6lKU6lKU6lKU7lKU7k6U8k6U8k6U8k6U8kqU8kqU8kaU9kaU9kaU9kaU+kaU+kaU/kKU/kKVAkKVAkKVAj6VBj6VBjqVB",
  ,
  "jqVBjqVBjqVCjaVCjaVDjKVDjKVDjKVDjKVEi6VEi6RFi6RFiqRFiqRGiqRGiqRHiqRHiqRHiqRIiaRIiaRIiKRIiKRIiKRJiKRJh6RKh6RKh6RKhqRKhqRL",
  ,
  "hqRLhaRMhaRMhaRMhKRNhKRNhKROhKROhKROhKROg6ROg6RPg6RPgqRQgqRQgqRQgqRRgaRRgaRRgaRRgKRSgKRSgKRTf6RTf6RTf6RTf6RUf6NUf6NVf6NV",
  ,
  "fqNVfqNVfqNVfaNWfaNWfaNXfaNXfKNXfKNYe6NYe6NYe6NZe6NZeqNZeqNaeaNaeaNaeaNaeaNaeKNbeKNbeKNceKNceKNceKNdd6Ndd6Ned6Ned6NedqNf",
  ,
  "dqNfdaNfdaNgdaNgdaNgdKNgdKNgc6Nhc6Nhc6Nhc6NicqNicqNjcqNjcqNjcqNkcqNkcaNlcaNlcaNmcaNmcKNmcKNmb6Nnb6Nnb6Nnb6NnbqNnbqNobaNo",
  ,
  "baNpbaNpbaNpbaNqbaNqbKNrbKNrbKNrbKNsa6Nsa6Nta6NtaqNtaqNtaqNtaaNtaaNuaaNuaKNuaKNvaKNvZ6NwZ6NwZ6NwZ6NxZ6NxZ6JyZqJyZqJyZqJy",
  ,
  "ZqJyZaJzZaJzZaJzZKJzZKJ0ZKJ0Y6J1Y6J1Y6J1YqJ2JKJOJKJOJKJNI6FJI6FJI6FJIqJJIaFIIaFIIKJIIKJIIKJIIKJIIKJIIKJIHqJHHqJHpKYopKYo",
  ,
  "o6Ypo6Ypo6Yqo6Yqo6Yqo6Yqo6YqoqYqoqYroqYroaYsoaYsoaYsoKYtoKYtoKYuoKYun6Yun6YvnqYvnqYvnqYvnqYvnaYvnaYwnKYwnKYxnKYxnKYxnKYy",
  ,
  "nKYym6Yzm6Yzm6Yzm6Y0mqY0mqY1maY1maY1maY2maY2mKY2mKU2l6U2l6U2l6U3l6U3l6U4l6U4l6U4lqU5lqU5lqU6laU6laU6laU7lKU7lKU8lKU8k6U8",
  ,
  "k6U8k6U8k6U8kqU9kqU9kqU9kaU+kaU+kaU/kaU/kaVAkaVAkKVAkKVBkKVBj6VBj6VBj6VBjqVCjqVCjqVDjaVDjaVDjaVDjKVEjKVEjKRFjKRFi6RFi6RG",
  ,
  "iqRGiqRHiqRHiqRHiqRIiqRIiaRIiaRIiaRIiaRJiKRJiKRKh6RKh6RKh6RKh6RLhqRLhqRMhaRMhaRMhaRNhaRNhKROhKROhKROhKROhKROhKRPg6RPg6RQ",
  ,
  "g6RQgqRQgqRRgqRRgaRRgaRRgaRSgaRSgKRTgKRTgKRTgKRTf6RUf6NUf6NVf6NVf6NVf6NVfqNVfqNWfqNWfaNXfaNXfaNXfKNYfKNYfKNYe6NZe6NZe6NZ",
  ,
  "eqNaeqNaeqNaeqNaeaNaeaNbeKNbeKNceKNceKNceKNdeKNdd6Ned6Ned6Ned6NfdqNfdqNfdaNgdaNgdaNgdaNgdKNgdKNhc6Nhc6Nhc6Nic6NicqNjcqNj",
  ,
  "cqNjcqNkcqNkcqNlcaNlcaNmcaNmcaNmcKNmcKNnb6Nnb6Nnb6Nnb6NnbqNobqNobaNpbaNpbaNpbaNqbaNqbaNrbaNrbKNrbKNsbKNsa6Nta6Nta6NtaqNt",
  ,
  "aqNtaqNtaaNuaaNuaaNuaKNvaKNvaKNwaKNwZ6NwZ6NxZ6NxZ6JyZ6JyZ6JyZqJyZqJyZaJzZaJzZaJzZaJzZKJ0ZKJ0Y6J1Y6J1Y6J1Y6J2YqJ2JKJOJKJN",
  ,
  "I6FJI6FJI6FJIqJJIaFIIaFIIKJIIKJIIKJIIKJIIKJIIKJIHqJHHqJHpaYopaYopKYppKYppKYqo6Yqo6Yqo6Yqo6Yqo6Yqo6Yro6YroqYsoqYsoqYsoaYt",
  ,
  "oaYtoaYuoaYuoKYuoKYvn6Yvn6Yvn6Yvn6YvnqYvnqYwnaYwnaYxnaYxnaYxnKYynKYynKYznKYznKYznKY0m6Y0m6Y1mqY1mqY1mqY2mqY2maY2maU2mKU2",
  ,
  "mKU2mKU3mKU3l6U4l6U4l6U4l6U5l6U5l6U6lqU6lqU6lqU7laU7laU8laU8lKU8lKU8lKU8k6U8k6U9k6U9k6U9kqU+kqU+kaU/kaU/kaVAkaVAkaVAkaVB",
  ,
  "kKVBkKVBkKVBkKVBj6VCj6VCjqVDjqVDjqVDjqVDjaVEjaVEjKRFjKRFjKRFjKRGi6RGi6RHi6RHiqRHiqRIiqRIiqRIiqRIiqRIiaRJiaRJiaRKiKRKiKRK",
  ,
  "iKRKh6RLh6RLh6RMhqRMhqRMhqRNhaRNhaROhaROhaROhKROhKROhKRPhKRPhKRQhKRQg6RQg6RRgqRRgqRRgqRRgqRSgaRSgaRTgKRTgKRTgKRTgKRUgKNU",
  ,
  "f6NVf6NVf6NVf6NVf6NVf6NWfqNWfqNXfqNXfaNXfaNYfaNYfKNYfKNZfKNZe6NZe6Nae6NaeqNaeqNaeqNaeaNbeaNbeaNceKNceKNceKNdeKNdeKNeeKNe",
  ,
  "eKNed6Nfd6NfdqNfdqNgdqNgdqNgdaNgdaNgdKNhdKNhdKNhdKNic6Nic6NjcqNjcqNjcqNkcqNkcqNlcqNlcaNmcaNmcaNmcaNmcKNncKNncKNnb6Nnb6Nn",
  ,
  "b6NobqNobqNpbqNpbaNpbaNqbaNqbaNrbaNrbaNrbKNsbKNsbKNtbKNta6Nta6NtaqNtaqNtaqNuaqNuaaNuaaNvaKNvaKNwaKNwaKNwZ6NxZ6NxZ6JyZ6Jy",
  ,
  "Z6JyZ6JyZqJyZqJzZaJzZaJzZaJzZaJ0ZKJ0ZKJ1Y6J1Y6J1Y6J2Y6J2YqJ3JKJNI6NKI6NKI6NKIqJJIaNJIaNJIaNJIaNJIaNJIaNJIaNJIKJIH6NHH6NH",
  ,
  "pqYopqYopaYppaYppKYqpKYqpKYqpKYqpKYqo6Yqo6Yro6Yro6Yso6Yso6YsoqYtoqYtoaYuoaYuoaYuoaYvoKYvoKYvn6Yvn6Yvn6Yvn6YwnqYwnqYxnqYx",
  ,
  "naYxnaYynaYynKYznKYznKYznKY0nKY0nKY1m6Y1m6Y1m6Y2mqY2mqY2mqU2maU2maU2maU3mKU3mKU4mKU4mKU4l6U5l6U5l6U6l6U6l6U6l6U7lqU7lqU8",
  ,
  "laU8laU8laU8lKU8lKU8lKU9k6U9k6U9k6U+kqU+kqU/kqU/kaVAkaVAkaVAkaVBkaVBkaVBkaVBkKVBkKVCj6VCj6VDj6VDj6VDjqVDjqVEjaVEjaRFjaRF",
  ,
  "jaRFjKRGjKRGi6RHi6RHi6RHi6RIiqRIiqRIiqRIiqRIiqRJiqRJiaRKiaRKiaRKiKRKiKRLiKRLh6RMh6RMh6RMhqRNhqRNhqROhaROhaROhaROhKROhKRP",
  ,
  "hKRPhKRQhKRQhKRQg6RRg6RRgqRRgqRRgqRSgqRSgaRTgaRTgaRTgaRTgKRUgKNUgKNVf6NVf6NVf6NVf6NVf6NWf6NWfqNXfqNXfqNXfaNYfaNYfaNYfKNZ",
  ,
  "fKNZfKNZe6Nae6Nae6Nae6NaeqNaeqNbeaNbeaNceaNceaNceKNdeKNdeKNeeKNeeKNeeKNfd6Nfd6NfdqNgdqNgdqNgdqNgdaNgdaNhdKNhdKNhdKNidKNi",
  ,
  "c6Njc6Njc6NjcqNkcqNkcqNlcqNlcqNmcqNmcaNmcaNmcKNncKNncKNncKNnb6Nnb6NobqNobqNpbqNpbqNpbaNqbaNqbaNrbaNrbaNrbaNsbKNsbKNtbKNt",
  ,
  "a6Nta6Nta6NtaqNtaqNuaqNuaaNuaaNvaaNvaKNwaKNwaKNwZ6NxZ6NxZ6JyZ6JyZ6JyZ6JyZqJyZqJzZqJzZqJzZaJzZaJ0ZKJ0ZKJ1ZKJ1ZKJ1Y6J2Y6J2",
  ,
  "YqJ3YqJ3IqJJIqJJIqJJIaNJIKJIIKJIIaNJIaNJIaNJIKJIIKJIH6NHHqJGHqJGp6Upp6UppqUqpqUqpaUqpaUqpaUrpaUrpaUrpKUrpKUso6Uso6Uto6Ut",
  ,
  "o6Uto6Uuo6UuoqUvoqUvoqUvoqUvoaUvoaUvoKUwoKUwoKUwoKUxn6Uxn6Uyn6UynqUynqUznaUznaU0naU0naU0nKU1nKU1nKU1nKU2nKU2nKU2m6U2m6U2",
  ,
  "mqU3mqU3mqU3mqU4maU4maU5mKU5mKU5mKQ6mKQ6l6Q7l6Q7l6Q7l6Q7l6Q8l6Q8lqQ8lqQ8lqQ8laQ9laQ9lKQ+lKQ+lKQ+lKQ/k6Q/k6RAkqRAkqRBkqRB",
  ,
  "kqRBkaRBkaRBkaRBkaRBkaRCkaRCkKRDkKRDj6REj6REj6REj6RFjqRFjqRGjqRGjaRGjaRHjaRHjKRHjKRHjKRIi6RIi6RIiqRIiqRJiqRJiqRJiqRKiqRK",
  ,
  "iaNLiaNLiaNLiaNMiKNMiKNNh6NNh6NNh6NNh6NOhqNOhqNOhqNOhaNOhaNPhaNPhKNQhKNQhKNQhKNRhKNRg6NSg6NSg6NSg6NTgqNTgqNTgaNUgaNUgaNU",
  ,
  "gaNUgaNVgKNVgKNVf6NVf6NVf6NWf6NWf6NXf6NXf6NXfqNYfqNYfqNZfaNZfaNZfaNZfKNafKNafKNae6Nae6Nae6NbeqNbeqNceaNceaNdeaNdeaNdeKNe",
  ,
  "eKNeeKNfeKNfeKNfeKNfd6Ngd6Ngd6NgdqNgdqNgdqNhdaNhdaNidaNidKNidKNjdKNjc6Nkc6Nkc6NkcqNlcqNlcqNlcqNmcqNmcqNmcaNncaNncKNncKNn",
  ,
  "cKNncKNob6Nob6NpbqNpbqNpbqNqbqNqbaNrbaNrbaNrbaNrbaNsbaNsbKNtbKNtbKJta6Jta6Jta6JuaqJuaqJuaqJvaaJvaaJwaKJwaKJwaKJxaKJxZ6Jx",
  ,
  "Z6JyZ6JyZ6JyZ6JyZ6JyZqJzZqJzZqJzZaJ0ZaJ0ZaJ1ZKJ1ZKJ2ZKJ2Y6J2Y6J3Y6J3YqJ3YqJ3IqJMIqJMIaNJIKJLIKJLIaNMIaNMIaNMIKJIIKJIH6NH",
  ,
  "HqJGHqJGp6Upp6UppqUqpqUqpaUqpaUqpaUrpaUrpaUrpKUrpKUso6Uso6Uto6Uto6Uto6Uuo6UuoqUvoqUvoqUvoqUvoaUvoaUvoKUwoKUwoKUwoKUxn6Ux",
  ,
  "n6Uyn6UynqUynqUznaUznaU0naU0naU0nKU1nKU1nKU1nKU2nKU2nKU2m6U2m6U2mqU3mqU3mqU3mqU4maU4maU5mKU5mKU5mKQ6mKQ6l6Q7l6Q7l6Q7l6Q7",
  ,
  "l6Q8l6Q8lqQ8lqQ8lqQ8laQ9laQ9lKQ+lKQ+lKQ+lKQ/k6Q/k6RAkqRAkqRBkqRBkqRBkaRBkaRBkaRBkaRBkaRCkaRCkKRDkKRDj6REj6REj6REj6RFjqRF",
  ,
  "jqRGjqRGjaRGjaRHjaRHjKRHjKRHjKRIi6RIi6RIiqRIiqRJiqRJiqRJiqRKiqRKiaNLiaNLiaNLiaNMiKNMiKNNh6NNh6NNh6NNh6NOhqNOhqNOhqNOhaNO",
  ,
  "haNPhaNPhKNQhKNQhKNQhKNRhKNRg6NSg6NSg6NSg6NTgqNTgqNTgaNUgaNUgaNUgaNUgaNVgKNVgKNVf6NVf6NVf6NWf6NWf6NXf6NXf6NXfqNYfqNYfqNZ",
  ,
  "faNZfaNZfaNZfKNafKNafKNae6Nae6Nae6NbeqNbeqNceaNceaNdeaNdeaNdeKNeeKNeeKNfeKNfeKNfeKNfd6Ngd6Ngd6NgdqNgdqNgdqNhdaNhdaNidaNi",
  ,
  "dKNidKNjdKNjc6Nkc6Nkc6NkcqNlcqNlcqNlcqNmcqNmcqNmcaNncaNncKNncKNncKNncKNob6Nob6NpbqNpbqNpbqNqbqNqbaNrbaNrbaNrbaNrbaNsbaNs",
  ,
  "bKNtbKNtbKJta6Jta6Jta6JuaqJuaqJuaqJvaaJvaaJwaKJwaKJwaKJxaKJxZ6JxZ6JyZ6JyZ6JyZ6JyZ6JyZqJzZqJzZqJzZaJ0ZaJ0ZaJ1ZKJ1ZKJ2ZKJ2",
  ,
  "Y6J2Y6J3Y6J3YqJ3YqJ3YqJ4IqJMIaNMIKJLIKJLIaNMIaNMIaNMIKJLIKJLH6NKHqJGHqJGqKUpqKUpp6Uqp6UqpqUqpqUqpqUrpqUrpqUrpaUrpaUspKUs",
  ,
  "pKUtpKUtpKUto6Uuo6Uuo6Uvo6Uvo6Uvo6UvoqUvoqUvoaUwoaUwoaUwoKUxoKUxoKUyoKUyn6Uyn6UznqUznqU0nqU0nqU0naU1naU1nKU1nKU2nKU2nKU2",
  ,
  "nKU2nKU2m6U3m6U3m6U3mqU4mqU4mqU5maU5maU5maQ6mKQ6mKQ7mKQ7mKQ7l6Q7l6Q8l6Q8l6Q8l6Q8l6Q8lqQ9lqQ9laQ+laQ+laQ+lKQ/lKQ/lKRAk6RA",
  ,
  "k6RBk6RBkqRBkqRBkqRBkaRBkaRBkaRCkaRCkaRDkaRDkKREkKREkKREj6RFj6RFjqRGjqRGjqRGjqRHjaRHjaRHjaRHjKRIjKRIjKRIi6RIi6RJi6RJiqRJ",
  ,
  "iqRKiqRKiqNLiqNLiqNLiaNMiaNMiKNNiKNNiKNNiKNNh6NOh6NOhqNOhqNOhqNOhqNPhaNPhaNQhKNQhKNQhKNRhKNRhKNShKNShKNSg6NTg6NTgqNTgqNU",
  ,
  "gqNUgqNUgqNUgaNVgaNVgKNVgKNVgKNVgKNWf6NWf6NXf6NXf6NXf6NYf6NYfqNZfqNZfaNZfaNZfaNafKNafKNafKNafKNae6Nbe6NbeqNceqNceqNdeqNd",
  ,
  "eaNdeaNeeKNeeKNfeKNfeKNfeKNfeKNgd6Ngd6Ngd6NgdqNgdqNhdqNhdaNidaNidaNidKNjdKNjdKNkdKNkc6Nkc6NlcqNlcqNlcqNmcqNmcqNmcqNncaNn",
  ,
  "caNncaNncKNncKNocKNob6Npb6Npb6NpbqNqbqNqbqNrbaNrbaNrbaNrbaNsbaNsbaNtbaNtbKJtbKJta6Jta6JuaqJuaqJuaqJvaqJvaaJwaaJwaaJwaKJx",
  ,
  "aKJxaKJxZ6JyZ6JyZ6JyZ6JyZ6JyZ6JzZqJzZqJzZqJ0ZaJ0ZaJ1ZKJ1ZKJ2ZKJ2ZKJ2Y6J3Y6J3YqJ3YqJ3YqJ4YqJ4IaNMIKJLIKJLIaNMIaNMIaNMIKJL",
  ,
  "IKJLH6NKHqJGHqJGqaUpqaUpqKUqqKUqp6Uqp6Uqp6Urp6Urp6UrpqUrpqUspaUspaUtpaUtpaUtpKUupKUuo6Uvo6Uvo6Uvo6Uvo6Uvo6UvoqUwoqUwoqUw",
  ,
  "oaUxoaUxoaUyoaUyoKUyoKUzn6Uzn6U0nqU0nqU0nqU1nqU1naU1naU2naU2nKU2nKU2nKU2nKU3nKU3nKU3m6U4m6U4mqU5mqU5mqU5mqQ6maQ6maQ7mKQ7",
  ,
  "mKQ7mKQ7mKQ8l6Q8l6Q8l6Q8l6Q8l6Q9lqQ9lqQ+lqQ+lqQ+laQ/laQ/lKRAlKRAlKRBlKRBk6RBk6RBkqRBkqRBkqRBkaRCkaRCkaRDkaRDkaREkaREkKRE",
  ,
  "kKRFkKRFj6RGj6RGj6RGjqRHjqRHjaRHjaRHjaRIjaRIjKRIjKRIi6RJi6RJi6RJi6RKiqRKiqNLiqNLiqNLiqNMiqNMiaNNiaNNiaNNiKNNiKNOh6NOh6NO",
  ,
  "h6NOh6NOhqNPhqNPhaNQhaNQhaNQhaNRhKNRhKNShKNShKNShKNTg6NTg6NTg6NUg6NUg6NUgqNUgqNVgaNVgaNVgaNVgaNVgKNWgKNWf6NXf6NXf6NXf6NY",
  ,
  "f6NYf6NZfqNZfqNZfqNZfaNafaNafaNafKNafKNafKNbe6Nbe6NceqNceqNdeqNdeqNdeaNeeaNeeKNfeKNfeKNfeKNfeKNgeKNgeKNgd6Ngd6NgdqNhdqNh",
  ,
  "dqNidqNidaNidaNjdKNjdKNkdKNkdKNkc6Nlc6NlcqNlcqNmcqNmcqNmcqNncqNncaNncaNncaNncKNocKNocKNpb6Npb6Npb6NqbqNqbqNrbaNrbaNrbaNr",
  ,
  "baNsbaNsbaNtbaNtbKJtbKJtbKJta6Jua6Jua6JuaqJvaqJvaqJwaaJwaaJwaaJxaKJxaKJxZ6JyZ6JyZ6JyZ6JyZ6JyZ6JzZqJzZqJzZqJ0ZqJ0ZaJ1ZaJ1",
  ,
  "ZKJ2ZKJ2ZKJ2Y6J3Y6J3Y6J3Y6J3YqJ4YqJ4YaJ4IKJLIKJLIaNMIaNMIaNMIKJLIKJLH6NKHqJJHqJJqaUpqaUpqaUqqaUqqKUqqKUqqKUrqKUrqKUrp6Ur",
  ,
  "p6UspqUspqUtpqUtpaUtpaUupaUupKUvpKUvpKUvo6Uvo6Uvo6Uvo6Uwo6Uwo6UwoqUxoqUxoaUyoaUyoaUyoaUzoKUzoKU0n6U0n6U0n6U1nqU1nqU1nqU2",
  ,
  "nqU2naU2naU2nKU2nKU3nKU3nKU3nKU4nKU4m6U5m6U5m6U5mqQ6mqQ6mqQ7maQ7maQ7maQ7mKQ8mKQ8mKQ8l6Q8l6Q8l6Q9l6Q9l6Q+lqQ+lqQ+lqQ/lqQ/",
  ,
  "laRAlaRAlKRBlKRBlKRBk6RBk6RBk6RBk6RBkqRCkqRCkaRDkaRDkaREkaREkaREkaRFkKRFkKRGkKRGj6RGj6RHj6RHjqRHjqRHjqRIjaRIjaRIjaRIjKRJ",
  ,
  "jKRJjKRJi6RKi6RKiqNLiqNLiqNLiqNMiqNMiqNNiaNNiaNNiaNNiKNOiKNOiKNOiKNOh6NOh6NPhqNPhqNQhqNQhqNQhaNRhaNRhKNShKNShKNShKNThKNT",
  ,
  "hKNTg6NUg6NUg6NUg6NUgqNVgqNVgqNVgaNVgaNVgaNWgKNWgKNXf6NXf6NXf6NYf6NYf6NZf6NZfqNZfqNZfqNafaNafaNafaNafaNafKNbfKNbe6Nce6Nc",
  ,
  "e6Nde6NdeqNdeqNeeaNeeaNfeaNfeKNfeKNfeKNgeKNgeKNgeKNgd6Ngd6NhdqNhdqNidqNidqNidaNjdaNjdKNkdKNkdKNkdKNlc6Nlc6NlcqNmcqNmcqNm",
  ,
  "cqNncqNncqNncqNncaNncaNocKNocKNpcKNpcKNpb6Nqb6NqbqNrbqNrbqNrbaNrbaNsbaNsbaNtbaNtbaJtbKJtbKJta6Jua6Jua6Jua6JvaqJvaqJwaaJw",
  ,
  "aaJwaaJxaaJxaKJxaKJyZ6JyZ6JyZ6JyZ6JyZ6JzZ6JzZ6JzZqJ0ZqJ0ZaJ1ZaJ1ZaJ2ZaJ2ZKJ2ZKJ3Y6J3Y6J3Y6J3YqJ4YqJ4YqJ4YaJ4IKJLIKJLIKJL",
  ,
  "IKJLH6NKH6NKHqJJHaNGHaNGqaUpqaUpqaUqqaUqqKUqqKUqqKUrqKUrqKUrp6Urp6UspqUspqUtpqUtpaUtpaUupaUupKUvpKUvpKUvo6Uvo6Uvo6Uvo6Uw",
  ,
  "o6Uwo6UwoqUxoqUxoaUyoaUyoaUyoaUzoKUzoKU0n6U0n6U0n6U1nqU1nqU1nqU2nqU2naU2naU2nKU2nKU3nKU3nKU3nKU4nKU4m6U5m6U5m6U5mqQ6mqQ6",
  ,
  "mqQ7maQ7maQ7maQ7mKQ8mKQ8mKQ8l6Q8l6Q8l6Q9l6Q9l6Q+lqQ+lqQ+lqQ/lqQ/laRAlaRAlKRBlKRBlKRBk6RBk6RBk6RBk6RBkqRCkqRCkaRDkaRDkaRE",
  ,
  "kaREkaREkaRFkKRFkKRGkKRGj6RGj6RHj6RHjqRHjqRHjqRIjaRIjaRIjaRIjKRJjKRJjKRJi6RKi6RKiqNLiqNLiqNLiqNMiqNMiqNNiaNNiaNNiaNNiKNO",
  ,
  "iKNOiKNOiKNOh6NOh6NPhqNPhqNQhqNQhqNQhaNRhaNRhKNShKNShKNShKNThKNThKNTg6NUg6NUg6NUg6NUgqNVgqNVgqNVgaNVgaNVgaNWgKNWgKNXf6NX",
  ,
  "f6NXf6NYf6NYf6NZf6NZfqNZfqNZfqNafaNafaNafaNafaNafKNbfKNbe6Nce6Nce6Nde6NdeqNdeqNeeaNeeaNfeaNfeKNfeKNfeKNgeKNgeKNgeKNgd6Ng",
  ,
  "d6NhdqNhdqNidqNidqNidaNjdaNjdKNkdKNkdKNkdKNlc6Nlc6NlcqNmcqNmcqNmcqNncqNncqNncqNncaNncaNocKNocKNpcKNpcKNpb6Nqb6NqbqNrbqNr",
  ,
  "bqNrbaNrbaNsbaNsbaNtbaNtbaJtbKJtbKJta6Jua6Jua6Jua6JvaqJvaqJwaaJwaaJwaaJxaaJxaKJxaKJyZ6JyZ6JyZ6JyZ6JyZ6JzZ6JzZ6JzZqJ0ZqJ0",
  ,
  "ZaJ1ZaJ1ZaJ2ZaJ2ZKJ2ZKJ3Y6J3Y6J3Y6J3YqJ4YqJ4YqJ4YaJ4YaJ4IKRLIKRLIKRLH6NKH6NKHqRKHaNJHaNJqaUqqaUqqaUqqaUqqKUrqKUrqKUsqKUs",
  ,
  "qKUsp6Usp6UtpqUtpqUupqUupaUupaUvpaUvpKUvpKUvpKUvo6Uvo6Uwo6Uwo6Uxo6Uxo6UxoqUyoqUyoaUzoaUzoaUzoaU0oKU0oKU0n6U1n6U1n6U1nqU2",
  ,
  "nqU2nqU2nqU2naU2naU3nKU3nKU4nKU4nKU4nKU5nKU5m6U5m6U6m6U6mqQ6mqQ7mqQ7maQ8maQ8maQ8mKQ8mKQ8mKQ9l6Q9l6Q9l6Q+l6Q+l6Q+lqQ/lqQ/",
  ,
  "lqQ/lqRAlaRAlaRBlKRBlKRBlKRBk6RBk6RCk6RCk6RCkqRDkqRDkaREkaREkaREkaREkaRFkaRFkKRGkKRGkKRGj6RHj6RHj6RIjqRIjqRIjqRIjaRIjaRJ",
  ,
  "jaRJjKRJjKRJjKRKi6RKi6RLiqNLiqNLiqNMiqNMiqNNiqNNiaNOiaNOiaNOiKNOiKNOiKNOiKNOh6NPh6NPhqNQhqNQhqNRhqNRhaNRhaNShKNShKNThKNT",
  ,
  "hKNThKNUhKNUg6NUg6NUg6NUg6NVgqNVgqNVgqNVgaNWgaNWgaNWgKNXgKNXf6NYf6NYf6NYf6NZf6NZf6NZfqNafqNafqNafaNafaNafaNbfaNbfKNbfKNc",
  ,
  "e6Nce6Nde6Nde6NdeqNeeqNeeaNfeaNfeaNfeKNfeKNgeKNgeKNgeKNgeKNgd6Nhd6NhdqNidqNidqNidqNjdaNjdaNkdKNkdKNkdKNkdKNlc6Nlc6NmcqNm",
  ,
  "cqNmcqNncqNncqNncqNncqNncaNocaNocKNpcKNpcKNpcKNpb6Nqb6NqbqNrbqNrbqNrbaNsbaNsbaNtbaNtbaNtbaJtbKJtbKJua6Jua6Jua6Jua6JvaqJv",
  ,
  "aqJwaaJwaaJwaaJxaaJxaKJyaKJyZ6JyZ6JyZ6JyZ6JzZ6JzZ6JzZ6JzZqJ0ZqJ0ZaJ1ZaJ1ZaJ2ZaJ2ZKJ2ZKJ3Y6J3Y6J4Y6J4YqJ4YqJ4YqJ4YaJ5YaJ5",
  ,
  "YaJ5IKRLIKRLH6NKH6NKHqRKHaNJHaNJqqUqqqUqqaUqqaUqqaUrqaUrqaUsqaUsqaUsqKUsqKUtp6Utp6Uup6UupqUupqUvpqUvpaUvpaUvpaUvpKUvpKUw",
  ,
  "o6Uwo6Uxo6Uxo6Uxo6Uyo6UyoqUzoqUzoqUzoaU0oaU0oaU0oKU1oKU1oKU1n6U2n6U2n6U2n6U2nqU2nqU3naU3naU4nKU4nKU4nKU5nKU5nKU5nKU6nKU6",
  ,
  "m6Q6m6Q7mqQ7mqQ8mqQ8mqQ8maQ8maQ8mKQ9mKQ9mKQ9l6Q+l6Q+l6Q+l6Q/l6Q/l6Q/lqRAlqRAlqRBlaRBlaRBlaRBlKRBlKRCk6RCk6RCk6RDk6RDkqRE",
  ,
  "kqREkaREkaREkaRFkaRFkaRGkaRGkaRGkKRHkKRHj6RIj6RIj6RIjqRIjqRIjqRJjaRJjaRJjaRJjKRKjKRKjKRLi6NLi6NLi6NMiqNMiqNNiqNNiqNOiqNO",
  ,
  "iqNOiaNOiaNOiKNOiKNOiKNPh6NPh6NQh6NQhqNRhqNRhqNRhaNShaNShKNThKNThKNThKNUhKNUhKNUhKNUhKNUg6NVg6NVgqNVgqNVgqNWgqNWgaNWgaNX",
  ,
  "gKNXgKNYgKNYgKNYf6NZf6NZf6NZf6Naf6NafqNafqNafqNafaNbfaNbfaNbfKNcfKNce6Nde6Nde6Nde6NeeqNeeqNfeaNfeaNfeaNfeKNgeKNgeKNgeKNg",
  ,
  "eKNgeKNhd6Nhd6Nid6Nid6NidqNjdqNjdaNkdaNkdaNkdKNkdKNldKNlc6Nmc6Nmc6NmcqNncqNncqNncqNncqNncqNocaNocaNpcKNpcKNpcKNpb6Nqb6Nq",
  ,
  "b6NrbqNrbqNrbqNsbaNsbaNtbaNtbaNtbaJtbaJtbKJubKJua6Jua6Jua6Jva6JvaqJwaqJwaqJwaaJxaaJxaKJyaKJyaKJyaKJyZ6JyZ6JzZ6JzZ6JzZ6Jz",
  ,
  "ZqJ0ZqJ0ZqJ1ZaJ1ZaJ2ZaJ2ZKJ2ZKJ3Y6J3Y6J4Y6J4Y6J4YqJ4YqJ4YaJ5YaJ5YaJ5YaJ5IKRLH6NKH6NKHqRKHaNJHaNJq6Qqq6QqqqQqqqQqqaQrqaQr",
  ,
  "qaQsqaQsqaQsqaQsqaQtqKQtqKQuqKQup6Qup6Qvp6QvpqQvpqQvpqQvpaQvpaQwpKQwpKQxpKQxpKQxo6Qyo6Qyo6Qzo6Qzo6QzoqQ0oqQ0oqQ0oaQ1oaQ1",
  ,
  "oaQ1oKQ2oKQ2n6Q2n6Q2n6Q2n6Q3nqQ3nqQ4naQ4naQ4naQ5nKQ5nKQ5nKQ6nKQ6nKQ6nKQ7m6Q7m6Q8m6Q8mqQ8mqQ8mqQ8maQ9maQ9maQ9mKM+mKM+l6M+",
  ,
  "l6M/l6M/l6M/l6NAl6NAlqNBlqNBlqNBlaNBlaNBlaNClKNClKNClKNDk6NDk6NEkqNEkqNEkqNEkqNFkaNFkaNGkaNGkaNGkaNHkKNHkKNIkKNIkKNIj6NI",
  ,
  "j6NIjqNJjqNJjaNJjaNJjaNKjaNKjKNLjKNLjKNLi6NMi6NMiqNNiqNNiqNOiqNOiqNOiqNOiaNOiaNOiaNOiKNPiKNPiKNQh6NQh6NRh6NRhqNRhqNShaNS",
  ,
  "haNThaNThaNThKNUhKNUhKNUhKNUhKNUhKNVg6NVg6NVg6NVgqNWgqNWgqNWgaNXgaNXgKNYgKNYgKNYgKNZf6NZf6NZf6Naf6Naf6NafqNafqNafqNbfqNb",
  ,
  "faNbfaNcfKNcfKNdfKNdfKNde6Nee6NeeqNfeqNfeqNfeaNfeaNgeaNgeKNgeKNgeKNgeKNheKNhd6Nid6Nid6Nid6NjdqNjdqNkdaNkdaNkdaNkdKNldKNl",
  ,
  "dKNmc6Nmc6Nmc6JncqJncqJncqJncqJncqJocqJocaJpcaJpcKJpcKJpcKJqb6Jqb6Jrb6Jrb6JrbqJsbqJsbaJtbaJtbaJtbaJtbaJtbaJubKJubKJubKJu",
  ,
  "a6Jva6JvaqJwaqJwaqJwaqJxaaJxaaJyaKJyaKJyaKJyZ6JyZ6JzZ6JzZ6JzZ6JzZ6J0ZqJ0ZqJ1ZaJ1ZaJ2ZaJ2ZaJ2ZKJ3ZKJ3Y6J4Y6J4Y6J4YqJ4YqJ4",
  ,
  "YqJ5YqJ5YaJ5YaJ5YKJ6H6NKH6NKHqRKHaNJHaNJrKQqrKQqq6Qqq6QqqqQrqqQrqaQsqaQsqaQsqaQsqaQtqaQtqaQuqaQuqKQuqKQvp6Qvp6Qvp6Qvp6Qv",
  ,
  "pqQvpqQwpaQwpaQxpaQxpKQxpKQypKQyo6Qzo6Qzo6Qzo6Q0o6Q0oqQ0oqQ1oqQ1oqQ1oaQ2oaQ2oKQ2oKQ2oKQ2n6Q3n6Q3n6Q4nqQ4nqQ4nqQ5naQ5naQ5",
  ,
  "nKQ6nKQ6nKQ6nKQ7nKQ7nKQ8nKQ8m6Q8m6Q8mqQ8mqQ9mqQ9mqQ9maM+maM+mKM+mKM/mKM/l6M/l6NAl6NAl6NBl6NBl6NBlqNBlqNBlaNClaNClaNClKND",
  ,
  "lKNDlKNEk6NEk6NEk6NEkqNFkqNFkaNGkaNGkaNGkaNHkaNHkaNIkKNIkKNIkKNIj6NIj6NJj6NJjqNJjqNJjqNKjaNKjaNLjKNLjKNLjKNMjKNMi6NNi6NN",
  ,
  "iqNOiqNOiqNOiqNOiqNOiqNOiqNOiaNPiaNPiKNQiKNQh6NRh6NRh6NRh6NShqNShqNThqNThaNThaNUhKNUhKNUhKNUhKNUhKNVhKNVhKNVg6NVg6NWg6NW",
  ,
  "gqNWgqNXgaNXgaNYgaNYgaNYgKNZgKNZf6NZf6Naf6Naf6Naf6Naf6NafqNbfqNbfqNbfaNcfaNcfKNdfKNdfKNdfKNee6Nee6NfeqNfeqNfeqNfeaNgeaNg",
  ,
  "eaNgeaNgeKNgeKNheKNheKNid6Nid6Nid6Njd6NjdqNkdqNkdqNkdaNkdaNldKNldKNmdKNmdKNmc6Jnc6JncqJncqJncqJncqJocqJocaJpcaJpcaJpcaJp",
  ,
  "cKJqcKJqb6Jrb6Jrb6JrbqJsbqJsbqJtbaJtbaJtbaJtbaJtbaJubKJubKJubKJubKJva6Jva6JwaqJwaqJwaqJxaaJxaaJyaaJyaKJyaKJyaKJyZ6JzZ6Jz",
  ,
  "Z6JzZ6JzZ6J0Z6J0ZqJ1ZqJ1ZaJ2ZaJ2ZaJ2ZKJ3ZKJ3ZKJ4ZKJ4Y6J4Y6J4YqJ4YqJ5YqJ5YaJ5YaJ5YaJ6YKF6H6NKHqRKHaNJHaNJrKQqrKQqq6Qqq6Qq",
  ,
  "qqQrqqQrqaQsqaQsqaQsqaQsqaQtqaQtqaQuqaQuqKQuqKQvp6Qvp6Qvp6Qvp6QvpqQvpqQwpaQwpaQxpaQxpKQxpKQypKQyo6Qzo6Qzo6Qzo6Q0o6Q0oqQ0",
  ,
  "oqQ1oqQ1oqQ1oaQ2oaQ2oKQ2oKQ2oKQ2n6Q3n6Q3n6Q4nqQ4nqQ4nqQ5naQ5naQ5nKQ6nKQ6nKQ6nKQ7nKQ7nKQ8nKQ8m6Q8m6Q8mqQ8mqQ9mqQ9mqQ9maM+",
  ,
  "maM+mKM+mKM/mKM/l6M/l6NAl6NAl6NBl6NBl6NBlqNBlqNBlaNClaNClaNClKNDlKNDlKNEk6NEk6NEk6NEkqNFkqNFkaNGkaNGkaNGkaNHkaNHkaNIkKNI",
  ,
  "kKNIkKNIj6NIj6NJj6NJjqNJjqNJjqNKjaNKjaNLjKNLjKNLjKNMjKNMi6NNi6NNiqNOiqNOiqNOiqNOiqNOiqNOiqNOiaNPiaNPiKNQiKNQh6NRh6NRh6NR",
  ,
  "h6NShqNShqNThqNThaNThaNUhKNUhKNUhKNUhKNUhKNVhKNVhKNVg6NVg6NWg6NWgqNWgqNXgaNXgaNYgaNYgaNYgKNZgKNZf6NZf6Naf6Naf6Naf6Naf6Na",
  ,
  "fqNbfqNbfqNbfaNcfaNcfKNdfKNdfKNdfKNee6Nee6NfeqNfeqNfeqNfeaNgeaNgeaNgeaNgeKNgeKNheKNheKNid6Nid6Nid6Njd6NjdqNkdqNkdqNkdaNk",
  ,
  "daNldKNldKNmdKNmdKNmc6Jnc6JncqJncqJncqJncqJocqJocaJpcaJpcaJpcaJpcKJqcKJqb6Jrb6Jrb6JrbqJsbqJsbqJtbaJtbaJtbaJtbaJtbaJubKJu",
  ,
  "bKJubKJubKJva6Jva6JwaqJwaqJwaqJxaaJxaaJyaaJyaKJyaKJyaKJyZ6JzZ6JzZ6JzZ6JzZ6J0Z6J0ZqJ1ZqJ1ZaJ2ZaJ2ZaJ2ZKJ3ZKJ3ZKJ4ZKJ4Y6J4",
  ,
  "Y6J4YqJ4YqJ5YqJ5YaJ5YaJ5YaJ6YKF6YKF7HaNJHKRJHKRJraQqraQqrKQrrKQrq6Qsq6QsqqQtqqQtqqQtqqQtqqQuqaQuqaQvqaQvqaQvqaQvqKQvqKQv",
  ,
  "qKQvqKQwp6Qwp6QxpqQxpqQypqQypaQypaQzpKQzpKQ0pKQ0pKQ0o6Q0o6Q1o6Q1o6Q2o6Q2oqQ2oqQ2oqQ2oaQ3oaQ3oaQ3oKQ4oKQ4n6Q4n6Q5n6Q5n6Q5",
  ,
  "nqQ6nqQ6naQ7naQ7naQ7nKQ8nKQ8nKQ8nKQ8nKQ8nKQ9m6Q9m6Q9mqQ+mqQ+mqM+maM/maM/maNAmaNAmKNAmKNBl6NBl6NBl6NBl6NBl6NBl6NClqNClqND",
  ,
  "lqNDlaNDlaNElKNElKNFk6NFk6NFk6NGk6NGkqNHkqNHkqNHkaNHkaNIkaNIkaNIkaNIkaNIkKNJkKNJj6NKj6NKj6NKjqNLjqNLjqNMjaNMjaNMjaNMjKNN",
  ,
  "jKNNi6NOi6NOi6NOiqNOiqNOiqNPiqNPiqNPiqNQiaNQiaNQiKNRiKNRiKNRiKNSh6NSh6NThqNThqNThqNUhaNUhaNVhKNVhKNVhKNVhKNVhKNVhKNVhKNW",
  ,
  "g6NWg6NWg6NXgqNXgqNYgqNYgqNYgaNZgaNZgKNagKNaf6Naf6Naf6Naf6Naf6Nbf6Nbf6NbfqNcfqNcfaNdfaNdfKNefKNefKNefKNfe6Nfe6Nfe6NfeqNg",
  ,
  "eqNgeaNgeaNgeaNgeaNheKNheKNieKNieKNjeKNjd6Njd6Njd6NkdqNkdqNkdqNldaNldaNmdKNmdKNndKNnc6Jnc6Jnc6JncqJocqJocqJocqJocqJpcaJp",
  ,
  "caJqcaJqcaJqcKJrcKJrb6Jsb6Jsb6JsbqJtbqJtbqJtbqJtbaJtbaJtbaJubaJubKJvbKJvbKJva6Jwa6Jwa6Jxa6JxaqJxaqJyaaJyaaJyaKJyaKJyaKJy",
  ,
  "aKJzZ6JzZ6J0Z6J0Z6J0Z6J1ZqJ1ZqJ2ZaJ2ZaJ2ZaJ3ZaJ3ZKJ3ZKJ4ZKJ4Y6J4Y6J4YqJ4YqJ5YqJ5YqJ5YaJ6YaJ6YKF7YKF7YKF7HKRJHKRJrqQqrqQq",
  ,
  "raQrraQrrKQsrKQsq6Qtq6Qtq6Qtq6Qtq6QuqqQuqqQvqqQvqaQvqaQvqaQvqaQvqaQvqKQwqKQwqKQxp6Qxp6Qyp6QypqQypqQzpaQzpaQ0paQ0paQ0pKQ0",
  ,
  "pKQ1o6Q1o6Q2o6Q2o6Q2o6Q2oqQ2oqQ3oqQ3oqQ3oaQ4oaQ4oKQ4oKQ5oKQ5n6Q5n6Q6nqQ6nqQ7nqQ7nqQ7naQ8naQ8nKQ8nKQ8nKQ8nKQ9nKQ9nKQ9m6Q+",
  ,
  "m6Q+m6M+mqM/mqM/maNAmaNAmaNAmKNBmKNBmKNBl6NBl6NBl6NBl6NCl6NClqNDlqNDlqNDlqNElaNElaNFlKNFlKNFlKNGk6NGk6NHkqNHkqNHkqNHkqNI",
  ,
  "kaNIkaNIkaNIkaNIkaNJkKNJkKNKj6NKj6NKj6NLj6NLjqNMjqNMjqNMjaNMjaNNjKNNjKNOjKNOjKNOi6NOi6NOiqNPiqNPiqNPiqNQiqNQiaNQiaNRiaNR",
  ,
  "iaNRiKNSiKNSh6NTh6NTh6NThqNUhqNUhqNVhaNVhaNVhaNVhaNVhKNVhKNVhKNWhKNWhKNWg6NXg6NXg6NYgqNYgqNYgqNZgaNZgaNagKNagKNagKNaf6Na",
  ,
  "f6Naf6Nbf6Nbf6Nbf6NcfqNcfqNdfaNdfaNefaNefaNefKNffKNfe6Nfe6Nfe6NgeqNgeqNgeaNgeaNgeaNheaNheKNieKNieKNjeKNjeKNjd6Njd6NkdqNk",
  ,
  "dqNkdqNldqNldaNmdaNmdKNndKNndKJnc6Jnc6Jnc6Joc6JocqJocqJocqJpcqJpcaJqcaJqcaJqcKJrcKJrcKJscKJsb6Jsb6JtbqJtbqJtbqJtbaJtbaJt",
  ,
  "baJubaJubaJvbaJvbKJvbKJwa6Jwa6Jxa6JxaqJxaqJyaqJyaaJyaaJyaaJyaKJyaKJzZ6JzZ6J0Z6J0Z6J0Z6J1Z6J1ZqJ2ZqJ2ZqJ2ZaJ3ZaJ3ZKJ3ZKJ4",
  ,
  "ZKJ4ZKJ4Y6J4Y6J4YqJ5YqJ5YqJ5YaJ6YaJ6YKF7YKF7YKF7YKF7HKRJraQqraQqrKQrrKQrq6Qsq6QsqqQtqqQtqqQtqqQtqqQuqaQuqaQvqaQvqaQvqaQv",
  ,
  "qKQvqKQvqKQvqKQwp6Qwp6QxpqQxpqQypqQypaQypaQzpKQzpKQ0pKQ0pKQ0o6Q0o6Q1o6Q1o6Q2o6Q2oqQ2oqQ2oqQ2oaQ3oaQ3oaQ3oKQ4oKQ4n6Q4n6Q5",
  ,
  "n6Q5n6Q5nqQ6nqQ6naQ7naQ7naQ7nKQ8nKQ8nKQ8nKQ8nKQ8nKQ9m6Q9m6Q9mqQ+mqQ+mqM+maM/maM/maNAmaNAmKNAmKNBl6NBl6NBl6NBl6NBl6NBl6NC",
  ,
  "lqNClqNDlqNDlaNDlaNElKNElKNFk6NFk6NFk6NGk6NGkqNHkqNHkqNHkaNHkaNIkaNIkaNIkaNIkaNIkKNJkKNJj6NKj6NKj6NKjqNLjqNLjqNMjaNMjaNM",
  ,
  "jaNMjKNNjKNNi6NOi6NOi6NOiqNOiqNOiqNPiqNPiqNPiqNQiaNQiaNQiKNRiKNRiKNRiKNSh6NSh6NThqNThqNThqNUhaNUhaNVhKNVhKNVhKNVhKNVhKNV",
  ,
  "hKNVhKNWg6NWg6NWg6NXgqNXgqNYgqNYgqNYgaNZgaNZgKNagKNaf6Naf6Naf6Naf6Naf6Nbf6Nbf6NbfqNcfqNcfaNdfaNdfKNefKNefKNefKNfe6Nfe6Nf",
  ,
  "e6NfeqNgeqNgeaNgeaNgeaNgeaNheKNheKNieKNieKNjeKNjd6Njd6Njd6NkdqNkdqNkdqNldaNldaNmdKNmdKNndKNnc6Jnc6Jnc6JncqJocqJocqJocqJo",
  ,
  "cqJpcaJpcaJqcaJqcaJqcKJrcKJrb6Jsb6Jsb6JsbqJtbqJtbqJtbqJtbaJtbaJtbaJubaJubKJvbKJvbKJva6Jwa6Jwa6Jxa6JxaqJxaqJyaaJyaaJyaKJy",
  ,
  "aKJyaKJyaKJzZ6JzZ6J0Z6J0Z6J0Z6J1ZqJ1ZqJ2ZaJ2ZaJ2ZaJ3ZaJ3ZKJ3ZKJ4ZKJ4Y6J4Y6J4YqJ4YqJ5YqJ5YqJ5YaJ6YaJ6YKF7YKF7YKF7YKF7YKF7",
  ,
  "rqQqrqQqraQrraQrrKQsrKQsq6Qtq6Qtq6Qtq6Qtq6QuqqQuqqQvqqQvqaQvqaQvqaQvqaQvqaQvqKQwqKQwqKQxp6Qxp6Qyp6QypqQypqQzpaQzpaQ0paQ0",
  ,
  "paQ0pKQ0pKQ1o6Q1o6Q2o6Q2o6Q2o6Q2oqQ2oqQ3oqQ3oqQ3oaQ4oaQ4oKQ4oKQ5oKQ5n6Q5n6Q6nqQ6nqQ7nqQ7nqQ7naQ8naQ8nKQ8nKQ8nKQ8nKQ9nKQ9",
  ,
  "nKQ9m6Q+m6Q+m6M+mqM/mqM/maNAmaNAmaNAmKNBmKNBmKNBl6NBl6NBl6NBl6NCl6NClqNDlqNDlqNDlqNElaNElaNFlKNFlKNFlKNGk6NGk6NHkqNHkqNH",
  ,
  "kqNHkqNIkaNIkaNIkaNIkaNIkaNJkKNJkKNKj6NKj6NKj6NLj6NLjqNMjqNMjqNMjaNMjaNNjKNNjKNOjKNOjKNOi6NOi6NOiqNPiqNPiqNPiqNQiqNQiaNQ",
  ,
  "iaNRiaNRiaNRiKNSiKNSh6NTh6NTh6NThqNUhqNUhqNVhaNVhaNVhaNVhaNVhKNVhKNVhKNWhKNWhKNWg6NXg6NXg6NYgqNYgqNYgqNZgaNZgaNagKNagKNa",
  ,
  "gKNaf6Naf6Naf6Nbf6Nbf6Nbf6NcfqNcfqNdfaNdfaNefaNefaNefKNffKNfe6Nfe6Nfe6NgeqNgeqNgeaNgeaNgeaNheaNheKNieKNieKNjeKNjeKNjd6Nj",
  ,
  "d6NkdqNkdqNkdqNldqNldaNmdaNmdKNndKNndKJnc6Jnc6Jnc6Joc6JocqJocqJocqJpcqJpcaJqcaJqcaJqcKJrcKJrcKJscKJsb6Jsb6JtbqJtbqJtbqJt",
  ,
  "baJtbaJtbaJubaJubaJvbaJvbKJvbKJwa6Jwa6Jxa6JxaqJxaqJyaqJyaaJyaaJyaaJyaKJyaKJzZ6JzZ6J0Z6J0Z6J0Z6J1Z6J1ZqJ2ZqJ2ZqJ2ZaJ3ZaJ3",
  ,
  "ZKJ3ZKJ4ZKJ4ZKJ4Y6J4Y6J4YqJ5YqJ5YqJ5YaJ6YaJ6YKF7YKF7YKF7YKF7YKF7"
].join(""))();
function sampleVanillaFoliageColor(u, v) {
  const x = textureCoordinate2(u);
  const y = textureCoordinate2(v);
  const offset = (y * WIDTH + x) * 4;
  const first = decodeBase64Character(ENCODED_RGB.charCodeAt(offset));
  const second = decodeBase64Character(ENCODED_RGB.charCodeAt(offset + 1));
  const third = decodeBase64Character(ENCODED_RGB.charCodeAt(offset + 2));
  const fourth = decodeBase64Character(ENCODED_RGB.charCodeAt(offset + 3));
  return {
    red: (first << 2 | second >> 4) / 255,
    green: ((second & 15) << 4 | third >> 2) / 255,
    blue: ((third & 3) << 6 | fourth) / 255
  };
}
function textureCoordinate2(value) {
  const clamped = Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
  return Math.floor(clamped * (WIDTH - 1));
}
function decodeBase64Character(code) {
  if (code >= 65 && code <= 90) return code - 65;
  if (code >= 97 && code <= 122) return code - 71;
  if (code >= 48 && code <= 57) return code + 4;
  if (code === 43) return 62;
  if (code === 47) return 63;
  return 0;
}

// sable/packs/SableBP/scripts/sable/content/particle/SubLevelBlockParticleEffects.js
var BLOCK_DESTRUCT_PARTICLE_PREFIX = "sable:block_destruct";
var ADDON_BARK_PARTICLE_TEXTURE = "textures/blocks/pale_oak_log_side";
var ADDON_STRIPPED_PARTICLE_TEXTURE = "textures/blocks/stripped_pale_oak_log_side";
var ADDON_LEAF_PARTICLE_TEXTURE = "textures/blocks/leaves_oak";
function destructParticleTexture(description) {
  switch (description.type) {
    case "full_block":
      return description.textures.north;
    case "pillar":
    case "creaking_heart":
      return description.textures.side;
    case "chest":
      return description.texture;
    case "bee_nest":
      return description.textures.side;
    case "mangrove_roots":
      return description.textures.side;
    default:
      return description.texture;
  }
}
function destructParticleSuffix(texture) {
  const separator = texture.lastIndexOf("/");
  return separator >= 0 ? texture.slice(separator + 1) : texture;
}
function blockDestructParticleEffectId(texture) {
  return `${BLOCK_DESTRUCT_PARTICLE_PREFIX}_${destructParticleSuffix(texture)}`;
}

// sable/packs/SableBP/scripts/sable/content/particle/SubLevelBlockParticles.js
var REPORTED_PARTICLE_SPAWN_FAILURES = /* @__PURE__ */ new Set();
var BLOCK_HIT_PARTICLE_PROFILE = {
  particleCount: 27,
  radius: 0.45,
  velocityScalar: 1.1
};
var BLOCK_BREAK_PARTICLE_PROFILE = {
  particleCount: 27,
  radius: 0.5,
  velocityScalar: 1
};
var ADDON_BARK_MAP_COLOR_SCALE = { blue: 2.77653, green: 2.59065, red: 1.37374 };
var ADDON_BARK_MAP_COLOR_OFFSET = { blue: 0.09168, green: 0.1104, red: 0.45764 };
var ADDON_STRIPPED_MAP_COLOR_SCALE = { blue: 0.87778, green: 0.7098, red: 0.75551 };
var ADDON_STRIPPED_MAP_COLOR_OFFSET = { blue: 0.12766, green: 0.20247, red: 0.19373 };
var DEFAULT_ADDON_BARK_TINT = { blue: 0.8046, green: 0.929, red: 0.968 };
var DEFAULT_ADDON_STRIPPED_TINT = { blue: 0.36337, green: 0.605, red: 0.72205 };
var ADDON_LEAF_PARTICLE_BASE_COLOR = {
  blue: 0.5522222646359,
  green: 0.550694099833315,
  red: 0.5522222646359
};
var PARTICLE_CHROMA_SOFT_THRESHOLD = 0.08;
var PARTICLE_CHROMA_MIDTONE_LIMIT = 0.15;
var PARTICLE_GAMUT_SEARCH_STEPS = 8;
var SWAMP_FOLIAGE_COLOR = color(106, 112, 57);
var MANGROVE_SWAMP_FOLIAGE_COLOR = color(141, 177, 39);
var CHERRY_GROVE_FOLIAGE_COLOR = color(182, 219, 97);
var PALE_GARDEN_FOLIAGE_COLOR = color(135, 141, 118);
function spawnSubLevelBlockDestructParticle(dimension, location, block, foliageTint, profile) {
  const resolved = resolveFancySubLevelBlock(block);
  if (!resolved) return;
  const texture = resolveDestructParticleTexture(block, resolved.model);
  if (texture === void 0) return;
  const molang = new MolangVariableMap();
  const particleColor = resolveSubLevelBlockParticleColor(block, resolved.model, foliageTint);
  molang.setFloat("variable.activation_flag", 1);
  molang.setFloat("variable.block_color_r", particleColor.red);
  molang.setFloat("variable.block_color_g", particleColor.green);
  molang.setFloat("variable.block_color_b", particleColor.blue);
  molang.setFloat("variable.block_color_a", particleColor.alpha);
  molang.setFloat("variable.emitter_particles_count", profile.particleCount);
  molang.setFloat("variable.emitter_radius", profile.radius);
  molang.setFloat("variable.velocity_scalar", profile.velocityScalar);
  if (profile.offsetRadius) {
    molang.setFloat("variable.emitter_radius_x", profile.offsetRadius.x);
    molang.setFloat("variable.emitter_radius_y", profile.offsetRadius.y);
    molang.setFloat("variable.emitter_radius_z", profile.offsetRadius.z);
  }
  if (profile.direction) {
    molang.setFloat("variable.emitter_direction_x", profile.direction.x);
    molang.setFloat("variable.emitter_direction_y", profile.direction.y);
    molang.setFloat("variable.emitter_direction_z", profile.direction.z);
  }
  if (profile.directionRandomness) {
    molang.setFloat("variable.emitter_direction_random_x", profile.directionRandomness.x);
    molang.setFloat("variable.emitter_direction_random_y", profile.directionRandomness.y);
    molang.setFloat("variable.emitter_direction_random_z", profile.directionRandomness.z);
  }
  if (profile.speedMin !== void 0) {
    molang.setFloat("variable.emitter_speed_min", profile.speedMin);
  }
  if (profile.speedMax !== void 0) {
    molang.setFloat("variable.emitter_speed_max", profile.speedMax);
  }
  const effectId = blockDestructParticleEffectId(texture);
  try {
    dimension.spawnParticle(effectId, location, molang);
  } catch (error) {
    reportParticleSpawnFailure(effectId, error);
  }
}
function resolveDestructParticleTexture(block, model) {
  if (!isVanillaTypeId(block.typeId)) {
    const kind = addonBlockKind(model);
    if (kind === "log") {
      return isStrippedTypeId(block.typeId) ? ADDON_STRIPPED_PARTICLE_TEXTURE : ADDON_BARK_PARTICLE_TEXTURE;
    }
    if (kind === "leaf") return ADDON_LEAF_PARTICLE_TEXTURE;
  }
  return destructParticleTexture(model.description);
}
function resolveSubLevelBlockParticleColor(block, model, foliageTint) {
  if (!isVanillaTypeId(block.typeId)) {
    const kind = addonBlockKind(model);
    if (kind === "log") return resolveAddonLogParticleColor(block);
    if (kind === "leaf" && block.mapColor) {
      return resolveAddonLeafParticleColor(block.mapColor);
    }
  }
  return resolveFoliageParticleColor(block, model, foliageTint) ?? {
    alpha: 0,
    blue: 1,
    green: 1,
    red: 1
  };
}
function addonBlockKind(model) {
  const type = model.description.type;
  if (type === "pillar" || type === "creaking_heart") return "log";
  if (model.tint?.method === "foliage") return "leaf";
  return void 0;
}
function resolveFoliageParticleColor(block, model, foliageTint) {
  const tint = model.tint;
  if (!tint) return void 0;
  if (tint.method === "fixed") return parseFixedTintColor(tint.color);
  const field = foliageTint ?? DEFAULT_SUBLEVEL_FOLIAGE_TINT;
  if (field.mapKind === FOLIAGE_COLORMAP_SWAMP) return SWAMP_FOLIAGE_COLOR;
  if (field.mapKind === FOLIAGE_COLORMAP_MANGROVE_SWAMP) return MANGROVE_SWAMP_FOLIAGE_COLOR;
  if (field.mapKind === FOLIAGE_COLORMAP_FIXED) {
    return field.uAtLocalOrigin >= 0.5 ? PALE_GARDEN_FOLIAGE_COLOR : CHERRY_GROVE_FOLIAGE_COLOR;
  }
  const colorAt = sampleVanillaFoliageColor(
    foliageFieldCoordinate(field, block.localLocation, "u"),
    foliageFieldCoordinate(field, block.localLocation, "v")
  );
  return { alpha: 1, ...colorAt };
}
function foliageFieldCoordinate(field, location, component) {
  const coordinate = field.gradientAxis === "z" ? location.z : location.x;
  return component === "u" ? field.uAtLocalOrigin + field.uPerLocalX * coordinate : field.vAtLocalOrigin + field.vPerLocalZ * coordinate;
}
function parseFixedTintColor(hex) {
  const value = Number.parseInt(hex.slice(1), 16);
  return {
    alpha: 1,
    blue: (value & 255) / 255,
    green: (value >> 8 & 255) / 255,
    red: (value >> 16 & 255) / 255
  };
}
function resolveAddonLeafParticleColor(mapColor) {
  const balanced = balanceParticleColor(mapColor);
  return {
    alpha: 1,
    blue: clampParticleColor(balanced.blue / ADDON_LEAF_PARTICLE_BASE_COLOR.blue),
    green: clampParticleColor(balanced.green / ADDON_LEAF_PARTICLE_BASE_COLOR.green),
    red: clampParticleColor(balanced.red / ADDON_LEAF_PARTICLE_BASE_COLOR.red)
  };
}
function balanceParticleColor(mapColor) {
  const lab = srgbToOklab(mapColor);
  const chroma = Math.hypot(lab.a, lab.b);
  if (chroma <= PARTICLE_CHROMA_SOFT_THRESHOLD) return mapColor;
  const lightnessWeight = 2 * Math.sqrt(Math.max(0, lab.lightness * (1 - lab.lightness)));
  const chromaLimit = PARTICLE_CHROMA_SOFT_THRESHOLD + (PARTICLE_CHROMA_MIDTONE_LIMIT - PARTICLE_CHROMA_SOFT_THRESHOLD) * lightnessWeight;
  const excess = chroma - PARTICLE_CHROMA_SOFT_THRESHOLD;
  const shoulder = chromaLimit - PARTICLE_CHROMA_SOFT_THRESHOLD;
  const compressedChroma = PARTICLE_CHROMA_SOFT_THRESHOLD + shoulder * excess / (excess + shoulder);
  const hueA = lab.a / chroma;
  const hueB = lab.b / chroma;
  return oklabToGamutMappedSrgb(lab.lightness, hueA, hueB, compressedChroma);
}
function srgbToOklab(srgb) {
  const red = srgbChannelToLinear(srgb.red);
  const green = srgbChannelToLinear(srgb.green);
  const blue = srgbChannelToLinear(srgb.blue);
  const l = Math.cbrt(0.4122214708 * red + 0.5363325363 * green + 0.0514459929 * blue);
  const m = Math.cbrt(0.2119034982 * red + 0.6806995451 * green + 0.1073969566 * blue);
  const s = Math.cbrt(0.0883024619 * red + 0.2817188376 * green + 0.6299787005 * blue);
  return {
    a: 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    b: 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
    lightness: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s
  };
}
function oklabToGamutMappedSrgb(lightness, hueA, hueB, chroma) {
  let lowerChroma = 0;
  let upperChroma = chroma;
  let candidate = oklabToSrgb(lightness, hueA * chroma, hueB * chroma);
  if (isSrgbColor(candidate)) return candidate;
  candidate = oklabToSrgb(lightness, 0, 0);
  for (let step = 0; step < PARTICLE_GAMUT_SEARCH_STEPS; step++) {
    const probeChroma = (lowerChroma + upperChroma) / 2;
    const probe = oklabToSrgb(lightness, hueA * probeChroma, hueB * probeChroma);
    if (isSrgbColor(probe)) {
      lowerChroma = probeChroma;
      candidate = probe;
    } else {
      upperChroma = probeChroma;
    }
  }
  return {
    blue: clampParticleColor(candidate.blue),
    green: clampParticleColor(candidate.green),
    red: clampParticleColor(candidate.red)
  };
}
function oklabToSrgb(lightness, a, b) {
  const l = Math.pow(lightness + 0.3963377774 * a + 0.2158037573 * b, 3);
  const m = Math.pow(lightness - 0.1055613458 * a - 0.0638541728 * b, 3);
  const s = Math.pow(lightness - 0.0894841775 * a - 1.291485548 * b, 3);
  return {
    blue: linearChannelToSrgb(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
    green: linearChannelToSrgb(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    red: linearChannelToSrgb(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s)
  };
}
function srgbChannelToLinear(value) {
  return value <= 0.04045 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
}
function linearChannelToSrgb(value) {
  return value <= 31308e-7 ? 12.92 * value : 1.055 * Math.pow(value, 1 / 2.4) - 0.055;
}
function isSrgbColor(srgb) {
  return srgb.blue >= 0 && srgb.blue <= 1 && srgb.green >= 0 && srgb.green <= 1 && srgb.red >= 0 && srgb.red <= 1;
}
function resolveAddonLogParticleColor(block) {
  const stripped = isStrippedTypeId(block.typeId);
  if (!block.mapColor) {
    return {
      alpha: 1,
      ...stripped ? DEFAULT_ADDON_STRIPPED_TINT : DEFAULT_ADDON_BARK_TINT
    };
  }
  const scale = stripped ? ADDON_STRIPPED_MAP_COLOR_SCALE : ADDON_BARK_MAP_COLOR_SCALE;
  const offset = stripped ? ADDON_STRIPPED_MAP_COLOR_OFFSET : ADDON_BARK_MAP_COLOR_OFFSET;
  return {
    alpha: 1,
    blue: clampParticleColor(block.mapColor.blue * scale.blue + offset.blue),
    green: clampParticleColor(block.mapColor.green * scale.green + offset.green),
    red: clampParticleColor(block.mapColor.red * scale.red + offset.red)
  };
}
function reportParticleSpawnFailure(effectId, error) {
  if (REPORTED_PARTICLE_SPAWN_FAILURES.has(effectId)) return;
  REPORTED_PARTICLE_SPAWN_FAILURES.add(effectId);
  globalThis.console.error(
    `[sable/particle] Failed to spawn ${effectId}: ${describeError(error)}`
  );
}
function describeError(error) {
  return error instanceof Error ? error.stack ?? error.message : String(error);
}
function isVanillaTypeId(typeId) {
  return typeId.startsWith("minecraft:") || typeId.startsWith("sable:");
}
function isStrippedTypeId(typeId) {
  const separator = typeId.indexOf(":");
  const name = separator >= 0 ? typeId.slice(separator + 1) : typeId;
  return name.startsWith("stripped_");
}
function clampParticleColor(value) {
  return Math.max(0, Math.min(1, value));
}
function color(red, green, blue) {
  return { alpha: 1, red: red / 255, green: green / 255, blue: blue / 255 };
}

// sable/packs/SableBP/scripts/sable/util/DynamicPropertyJsonStore.js
import { world } from "@minecraft/server";
var DEFAULT_CHUNK_SIZE = 3e4;
var DynamicPropertyJsonStore = class {
  constructor(prefix, chunkSize = DEFAULT_CHUNK_SIZE, target = world) {
    this.prefix = prefix;
    this.chunkSize = chunkSize;
    this.target = target;
  }
  prefix;
  chunkSize;
  target;
  #lastJson;
  #nextGeneration = 1;
  load() {
    try {
      const manifest = this.#getActiveManifest();
      if (!manifest) return void 0;
      let json = "";
      for (let index = 0; index < manifest.chunkCount; index++) {
        const chunk = this.target.getDynamicProperty(
          this.#chunkKey(manifest.generation, index)
        );
        if (typeof chunk !== "string") return void 0;
        json += chunk;
      }
      if (json.length !== manifest.byteCount) return void 0;
      const value = JSON.parse(json);
      this.#lastJson = json;
      return value;
    } catch {
      return void 0;
    }
  }
  saveWithResult(value) {
    const json = JSON.stringify(value);
    if (json === this.#lastJson) return "unchanged";
    const chunks = splitIntoChunks(json, this.chunkSize);
    let previous;
    const generation = this.#createGeneration();
    try {
      previous = this.#getActiveManifest();
      for (let index = 0; index < chunks.length; index++) {
        this.target.setDynamicProperty(this.#chunkKey(generation, index), chunks[index]);
      }
      this.target.setDynamicProperty(this.#manifestKey(), serializeManifest({
        byteCount: json.length,
        chunkCount: chunks.length,
        generation
      }));
      this.#lastJson = json;
    } catch {
      return "failed";
    }
    if (previous && previous.generation !== generation) {
      this.#tryDeleteGeneration(previous.generation, previous.chunkCount);
    }
    return "saved";
  }
  clear() {
    let manifest;
    try {
      manifest = this.#getActiveManifest();
      this.target.setDynamicProperty(this.#manifestKey());
      this.#lastJson = void 0;
    } catch {
      return false;
    }
    if (manifest) this.#tryDeleteGeneration(manifest.generation, manifest.chunkCount);
    return true;
  }
  /** Best-effort reclamation of a superseded generation's chunk properties. */
  #tryDeleteGeneration(generation, chunkCount) {
    try {
      for (let index = 0; index < chunkCount; index++) {
        this.target.setDynamicProperty(this.#chunkKey(generation, index));
      }
    } catch {
    }
  }
  #createGeneration() {
    return `${Date.now().toString(36)}_${(this.#nextGeneration++).toString(36)}`;
  }
  #getActiveManifest() {
    const raw = this.target.getDynamicProperty(this.#manifestKey());
    return typeof raw === "string" ? parseManifest(raw) : void 0;
  }
  #manifestKey() {
    return `${this.prefix}_active`;
  }
  #chunkKey(generation, index) {
    return `${this.prefix}_g_${generation}_${index}`;
  }
};
function serializeManifest(manifest) {
  return [
    manifest.generation,
    manifest.chunkCount,
    manifest.byteCount
  ].join("|");
}
function parseManifest(value) {
  const [generation, chunks, bytes, extra] = value.split("|");
  const chunkCount = Number.parseInt(chunks ?? "", 10);
  const byteCount = Number.parseInt(bytes ?? "", 10);
  if (!generation || extra !== void 0 || !Number.isFinite(chunkCount) || !Number.isFinite(byteCount) || chunkCount < 1 || byteCount < 0) return void 0;
  return { byteCount, chunkCount, generation };
}
function splitIntoChunks(value, size) {
  const chunks = [];
  for (let index = 0; index < value.length; index += size) {
    chunks.push(value.slice(index, index + size));
  }
  return chunks;
}

// sable/packs/SableBP/scripts/sable/sublevel/storage/serialization/SubLevelData.js
function isSubLevelStorageManifest(value) {
  if (!value || typeof value !== "object") return false;
  const manifest = value;
  return hasOnlyKeys(manifest, ["subLevelIds"]) && Array.isArray(manifest.subLevelIds) && manifest.subLevelIds.every((id) => typeof id === "string" && id.length > 0) && new Set(manifest.subLevelIds).size === manifest.subLevelIds.length;
}
function isSerializedSubLevelStructure(value) {
  if (!value || typeof value !== "object") return false;
  const structure = value;
  return hasOnlyKeys(structure, [
    "blocks",
    "containerStorages",
    "dimensionId",
    "foliageTint",
    "id",
    "origin"
  ]) && typeof structure.id === "string" && structure.id.length > 0 && typeof structure.dimensionId === "string" && structure.dimensionId.length > 0 && isIntegerLocation(structure.origin) && Array.isArray(structure.blocks) && structure.blocks.length > 0 && structure.blocks.every(isSerializedSubLevelBlock) && Array.isArray(structure.containerStorages) && structure.containerStorages.every(isContainerStorageBinding) && (structure.foliageTint === void 0 || isSubLevelFoliageTint(structure.foliageTint));
}
function isContainerStorageBinding(value) {
  if (!value || typeof value !== "object") return false;
  const binding = value;
  return hasOnlyKeys(binding, ["localLocation", "storageId"]) && isIntegerLocation(binding.localLocation) && typeof binding.storageId === "string" && binding.storageId.length > 0;
}
function isSubLevelFoliageTint(value) {
  if (!value || typeof value !== "object") return false;
  const tint = value;
  return hasOnlyKeys(tint, [
    "gradientAxis",
    "mapKind",
    "uAtLocalOrigin",
    "uPerLocalX",
    "vAtLocalOrigin",
    "vPerLocalZ"
  ]) && (tint.gradientAxis === "x" || tint.gradientAxis === "z") && Number.isInteger(tint.mapKind) && isFiniteNumber(tint.uAtLocalOrigin) && isFiniteNumber(tint.uPerLocalX) && isFiniteNumber(tint.vAtLocalOrigin) && isFiniteNumber(tint.vPerLocalZ);
}
function cloneContainerStorageBinding(binding) {
  return {
    localLocation: { ...binding.localLocation },
    storageId: binding.storageId
  };
}
function cloneSubLevelBlock(block) {
  const cloned = {
    ...block,
    collisionShape: Array.isArray(block.collisionShape) ? block.collisionShape.map((box) => ({ min: { ...box.min }, max: { ...box.max } })) : block.collisionShape,
    localLocation: { ...block.localLocation }
  };
  if (block.mapColor) cloned.mapColor = { ...block.mapColor };
  if (block.rotation) cloned.rotation = { ...block.rotation };
  if (block.states) cloned.states = { ...block.states };
  return cloned;
}
function isSerializedSubLevelBlock(value) {
  if (!value || typeof value !== "object") return false;
  const block = value;
  return hasOnlyKeys(block, [
    "collidable",
    "collisionResponse",
    "collisionShape",
    "itemTypeId",
    "localLocation",
    "mapColor",
    "rotation",
    "runtimeCollidable",
    "states",
    "typeId"
  ]) && typeof block.typeId === "string" && block.typeId.length > 0 && isIntegerLocation(block.localLocation) && (block.itemTypeId === void 0 || typeof block.itemTypeId === "string") && (block.collidable === void 0 || typeof block.collidable === "boolean") && (block.collisionResponse === void 0 || typeof block.collisionResponse === "boolean") && (block.runtimeCollidable === void 0 || typeof block.runtimeCollidable === "boolean") && isCollisionShape(block.collisionShape) && (block.rotation === void 0 || isVector(block.rotation)) && (block.states === void 0 || isBlockStates(block.states)) && (block.mapColor === void 0 || isBlockMapColor(block.mapColor));
}
function isCollisionShape(value) {
  if (value === void 0 || value === "full" || value === "none") return true;
  return Array.isArray(value) && value.every(isCollisionBox);
}
function isCollisionBox(value) {
  if (!value || typeof value !== "object") return false;
  const box = value;
  return hasOnlyKeys(box, ["min", "max"]) && isVector(box.min) && isVector(box.max);
}
function isBlockStates(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  return Object.values(value).every((entry) => typeof entry === "boolean" || typeof entry === "number" || typeof entry === "string");
}
function isBlockMapColor(value) {
  if (!value || typeof value !== "object") return false;
  const color2 = value;
  return hasOnlyKeys(color2, ["blue", "green", "red"]) && isNormalizedColorChannel(color2.red) && isNormalizedColorChannel(color2.green) && isNormalizedColorChannel(color2.blue);
}
function isNormalizedColorChannel(value) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 1;
}
function isVector(value) {
  if (!value || typeof value !== "object") return false;
  const vector = value;
  return isFiniteNumber(vector.x) && isFiniteNumber(vector.y) && isFiniteNumber(vector.z);
}
function isIntegerLocation(value) {
  return isVector(value) && Number.isInteger(value.x) && Number.isInteger(value.y) && Number.isInteger(value.z);
}
function isFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}
function hasOnlyKeys(value, allowedKeys) {
  const allowed = new Set(allowedKeys);
  return Object.keys(value).every((key) => allowed.has(key));
}

// sable/packs/SableBP/scripts/sable/sublevel/storage/serialization/SubLevelSerializer.js
function serializeSubLevelStructure(id, source) {
  if (id.length === 0) throw new Error("A sub-level id must not be empty.");
  if (source.blocks.length === 0) {
    throw new Error(`Sub-level ${id} has no blocks to serialize.`);
  }
  const structure = {
    blocks: source.blocks.map(cloneSubLevelBlock),
    containerStorages: (source.containerStorages ?? []).map(cloneContainerStorageBinding),
    dimensionId: source.dimensionId,
    id,
    origin: { ...source.origin }
  };
  if (source.foliageTint) structure.foliageTint = { ...source.foliageTint };
  if (!isSerializedSubLevelStructure(structure)) {
    throw new Error(`Sub-level ${id} produced an invalid serialized structure.`);
  }
  return structure;
}
function deserializeSubLevelStructure(value) {
  if (!isSerializedSubLevelStructure(value)) {
    throw new Error("The stored sub-level structure record is invalid.");
  }
  const structure = {
    blocks: value.blocks.map(cloneSubLevelBlock),
    containerStorages: value.containerStorages.map(cloneContainerStorageBinding),
    dimensionId: value.dimensionId,
    id: value.id,
    origin: { ...value.origin }
  };
  if (value.foliageTint) structure.foliageTint = { ...value.foliageTint };
  return structure;
}

// sable/packs/SableBP/scripts/sable/sublevel/storage/serialization/SubLevelStorage.js
var DEFAULT_STORE_PREFIX = "sable_sublevel";
var SubLevelStorage = class {
  #prefix;
  #target;
  #manifestStore;
  #recordStores = /* @__PURE__ */ new Map();
  constructor(prefix = DEFAULT_STORE_PREFIX, target) {
    this.#prefix = prefix;
    this.#target = target;
    this.#manifestStore = this.#createStore(`${prefix}_manifest`);
  }
  /** The ids of every persisted sub-level. */
  listSubLevelIds() {
    return [...this.#loadManifest().subLevelIds];
  }
  loadSubLevel(id) {
    const raw = this.#recordStore(id).load();
    if (raw === void 0) return void 0;
    const structure = deserializeSubLevelStructure(raw);
    if (structure.id !== id) {
      throw new Error(`Stored sub-level record ${id} carries mismatched id ${structure.id}.`);
    }
    return structure;
  }
  saveSubLevel(id, source) {
    const structure = serializeSubLevelStructure(id, source);
    if (this.#recordStore(id).saveWithResult(structure) === "failed") return false;
    const manifest = this.#loadManifest();
    if (manifest.subLevelIds.includes(id)) return true;
    manifest.subLevelIds.push(id);
    return this.#manifestStore.saveWithResult(manifest) !== "failed";
  }
  deleteSubLevel(id) {
    const manifest = this.#loadManifest();
    const index = manifest.subLevelIds.indexOf(id);
    if (index >= 0) {
      manifest.subLevelIds.splice(index, 1);
      if (this.#manifestStore.saveWithResult(manifest) === "failed") return false;
    }
    const cleared = this.#recordStore(id).clear();
    this.#recordStores.delete(id);
    return cleared;
  }
  #loadManifest() {
    const raw = this.#manifestStore.load();
    if (raw === void 0) return { subLevelIds: [] };
    if (!isSubLevelStorageManifest(raw)) {
      throw new Error("The stored sub-level manifest is invalid.");
    }
    return raw;
  }
  #recordStore(id) {
    let store = this.#recordStores.get(id);
    if (!store) {
      store = this.#createStore(`${this.#prefix}_r_${id}`);
      this.#recordStores.set(id, store);
    }
    return store;
  }
  #createStore(prefix) {
    return this.#target ? new DynamicPropertyJsonStore(prefix, void 0, this.#target) : new DynamicPropertyJsonStore(prefix);
  }
};

// sable/packs/SableBP/scripts/sable/api/sublevel/ServerSubLevelContainer.js
var MAX_REGION_VOLUME = 4096;
var ServerSubLevelContainer = class {
  #interactionSystem;
  #blockBehaviors;
  #containers;
  #storage;
  #recordsByHandleId = /* @__PURE__ */ new Map();
  #nextSubLevelId = 1;
  #initialized = false;
  constructor(interactionSystem, blockBehaviors, containers, storage = new SubLevelStorage()) {
    this.#interactionSystem = interactionSystem;
    this.#blockBehaviors = blockBehaviors;
    this.#containers = containers;
    this.#storage = storage;
  }
  initialize() {
    if (this.#initialized) return;
    this.#initialized = true;
    const savedSubLevels = this.#storage.listSubLevelIds().map((id) => {
      const saved = this.#storage.loadSubLevel(id);
      if (!saved) throw new Error(`Stored sub-level manifest entry ${id} has no structure record.`);
      this.#advanceNextSubLevelId(saved.id);
      return saved;
    });
    for (const saved of savedSubLevels) {
      this.#containers.registerSavedBindings(saved.id, saved.containerStorages);
    }
    for (const saved of savedSubLevels) this.#restoreSubLevel(saved);
  }
  tick(currentTick) {
    if (currentTick % 20 !== 0) return;
    for (const record of [...this.#recordsByHandleId.values()]) {
      if (record.removed || !record.handle.isValid) continue;
      if (!isRecordRegionLoaded(record)) continue;
      if (!record.renderData.hasKnownIntegrityFailure() && record.renderData.hasIntactEntities()) continue;
      this.#saveRecord(record);
      this.#recreateRender(record, record.handle.blocks);
    }
  }
  handleContainerNativeDeath(ownerId, binding) {
    const record = this.#findRecord(ownerId);
    if (record) {
      const bindings2 = this.#containerBindings(record).filter((entry) => entry.storageId !== binding.storageId);
      this.#saveRecord(record, bindings2);
      return;
    }
    const saved = this.#storage.loadSubLevel(ownerId);
    if (!saved) throw new Error(`Native death storage ${binding.storageId} has no sub-level owner ${ownerId}.`);
    const bindings = saved.containerStorages.filter((entry) => entry.storageId !== binding.storageId);
    if (!this.#storage.saveSubLevel(ownerId, { ...saved, containerStorages: bindings })) {
      throw new Error(`Could not persist native death of storage ${binding.storageId}.`);
    }
  }
  handleContainerUnexpectedRemoval(ownerId, _binding) {
    const record = this.#findRecord(ownerId);
    if (record) {
      this.#saveRecord(record);
      this.#destroyRecord(record, "unexpected");
      return;
    }
    const saved = this.#storage.loadSubLevel(ownerId);
    if (!saved) throw new Error(`Unexpected storage removal has no sub-level owner ${ownerId}.`);
    if (!this.#storage.saveSubLevel(ownerId, saved)) {
      throw new Error(`Could not persist unexpected removal of sub-level ${ownerId}.`);
    }
  }
  /**
   * Captures a loaded world region into an entity-projected sub-level: full
   * permutation states, the biome foliage climate field, and per-block world
   * state (via the behavior registry) all transfer without any per-call
   * registration work.
   */
  createSubLevelFromRegion(dimension, from, to, options) {
    this.initialize();
    const minimum = {
      x: Math.min(Math.floor(from.x), Math.floor(to.x)),
      y: Math.min(Math.floor(from.y), Math.floor(to.y)),
      z: Math.min(Math.floor(from.z), Math.floor(to.z))
    };
    const maximum = {
      x: Math.max(Math.floor(from.x), Math.floor(to.x)),
      y: Math.max(Math.floor(from.y), Math.floor(to.y)),
      z: Math.max(Math.floor(from.z), Math.floor(to.z))
    };
    const volume = (maximum.x - minimum.x + 1) * (maximum.y - minimum.y + 1) * (maximum.z - minimum.z + 1);
    if (volume > MAX_REGION_VOLUME) {
      throw new RangeError(`Sub-level region spans ${volume} cells; the limit is ${MAX_REGION_VOLUME}.`);
    }
    const worldBlocks = [];
    for (let y = minimum.y; y <= maximum.y; y++) {
      for (let z = minimum.z; z <= maximum.z; z++) {
        for (let x = minimum.x; x <= maximum.x; x++) {
          const block = dimension.getBlock({ x, y, z });
          if (block) worldBlocks.push(block);
        }
      }
    }
    const origin = { ...minimum };
    const captured = captureSubLevelBlocks(worldBlocks, origin);
    if (captured.length === 0) {
      throw new Error("The selected region contains no capturable blocks.");
    }
    const foliageTint = captureSubLevelFoliageTint(dimension, captured, origin);
    const worldData = this.#captureWorldData(dimension, captured, origin);
    if (options?.removeWorldBlocks !== false) {
      for (const block of worldBlocks) {
        if (!block.isValid || block.isAir || block.isLiquid) continue;
        block.setType("minecraft:air");
      }
    }
    return this.createSubLevel(dimension, origin, captured, foliageTint, worldData);
  }
  /** Assembles, renders, and registers one sub-level from captured blocks. */
  createSubLevel(dimension, origin, blocks, foliageTint, worldData) {
    this.initialize();
    const id = `region_${this.#nextSubLevelId++}`;
    const record = this.#createRuntimeRecord(id, dimension, origin, blocks, foliageTint);
    const handle = record.handle;
    this.#recordsByHandleId.set(handle.id, record);
    try {
      for (const block of blocks) {
        this.#blockBehaviors.get(block.typeId)?.onBlockAdded?.({
          block,
          dimension,
          handle,
          ownerId: id,
          worldData: worldData?.get(blockLocationKey(block.localLocation))
        });
      }
      this.#saveRecord(record);
    } catch (error) {
      this.#discardUncommittedRecord(record);
      throw error;
    }
    const container = this;
    return {
      id,
      handle,
      get blockCount() {
        return handle.blocks.length;
      },
      get entityCount() {
        return record.renderData.entityCount;
      },
      remove() {
        container.#removeManagedSubLevel(record);
      }
    };
  }
  /** The default break pipeline: support cascade, effects, loot, block behaviors. */
  breakBlockForPlayerEdit(_player, itemStack, handle, block) {
    this.initialize();
    const record = this.#recordsByHandleId.get(handle.id);
    if (!record || record.removed || !handle.isValid) return false;
    const current = handle.getBlockAtLocalLocation(block.localLocation);
    if (!current || current.typeId !== block.typeId) return false;
    const targetKey = blockLocationKey(block.localLocation);
    const entries = handle.blocks.map((entry) => ({
      key: blockLocationKey(entry.localLocation),
      localLocation: entry.localLocation,
      snapshot: entry
    }));
    const support = resolveSubLevelBlockSupport(entries, /* @__PURE__ */ new Set([targetKey]));
    const removedLocations = [
      { ...block.localLocation },
      ...[...support.unsupportedKeys].map(parseBlockLocationKey)
    ];
    const removedBlocks = handle.removeBlocksAtLocalLocations(removedLocations);
    if (removedBlocks.length === 0) return false;
    if (support.stateUpdates.size > 0) this.#applyStateUpdates(record, support.stateUpdates);
    const dimension = handle.dimension;
    for (const [index, removedBlock] of removedBlocks.entries()) {
      const position = handle.localPointToWorld(removedBlock.localLocation);
      spawnSubLevelBlockDestructParticle(
        dimension,
        position,
        removedBlock,
        record.subLevel.foliageTint,
        BLOCK_BREAK_PARTICLE_PROFILE
      );
      spawnBlockDrops(dimension, removedBlock, position, index === 0 ? itemStack : void 0);
      this.#blockBehaviors.get(removedBlock.typeId)?.onBlockRemoved?.({
        block: removedBlock,
        dimension,
        handle,
        ownerId: record.id
      });
    }
    const targetPosition = handle.localPointToWorld(block.localLocation);
    const sound = resolveVanillaBlockBreakSound(block.typeId);
    dimension.playSound(sound.sound, targetPosition, { pitch: sound.pitch, volume: sound.volume });
    if (handle.blocks.length === 0) {
      if (!this.#storage.deleteSubLevel(record.id)) {
        throw new Error(`Could not delete naturally emptied sub-level ${record.id}.`);
      }
      this.#destroyRecord(record, "natural");
    } else {
      this.#saveRecord(record);
    }
    return true;
  }
  /** Emits one vanilla-style mining beat for a projected block. */
  emitBlockMiningEffects(handle, block) {
    const record = this.#recordsByHandleId.get(handle.id);
    if (!record || record.removed) return;
    const dimension = handle.dimension;
    const position = handle.localPointToWorld(block.localLocation);
    spawnSubLevelBlockDestructParticle(
      dimension,
      position,
      block,
      record.subLevel.foliageTint,
      BLOCK_HIT_PARTICLE_PROFILE
    );
    const sound = resolveVanillaBlockHitSound(block.typeId);
    dimension.playSound(sound.sound, position, { pitch: sound.pitch, volume: sound.volume });
  }
  /** The default place pipeline: placeable registrations only, behaviors included. */
  placeBlockForPlayerEdit(player, itemStack, handle, _supportBlock, placement, cardinalDirection) {
    this.initialize();
    const record = this.#recordsByHandleId.get(handle.id);
    if (!record || record.removed || !handle.isValid) return false;
    if (getSubLevelBlockRegistration(itemStack.typeId)?.placeable !== true) return false;
    if (handle.getBlockAtLocalLocation(placement)) return false;
    const placed = buildPlacedBlock(player, itemStack.typeId, placement, cardinalDirection);
    if (!placed) return false;
    if (!handle.addBlock(placed)) {
      const blocks = [...handle.blocks, placed];
      this.#recreateRender(record, blocks);
      handle.resetBlocks(blocks);
    }
    const previousBindings = new Set(
      this.#containerBindings(record).map((binding) => binding.storageId)
    );
    try {
      this.#blockBehaviors.get(placed.typeId)?.onBlockAdded?.({
        block: placed,
        dimension: handle.dimension,
        handle,
        ownerId: record.id
      });
      this.#saveRecord(record);
      return true;
    } catch (error) {
      handle.removeBlocksAtLocalLocations([placement]);
      for (const binding of this.#containerBindings(record)) {
        if (!previousBindings.has(binding.storageId)) {
          this.#containers.discardStorage(binding.storageId);
        }
      }
      throw error;
    }
  }
  /** Emits the vanilla block-place sound after a projected edit commits. */
  emitBlockPlacementEffects(handle, block) {
    const dimension = handle.dimension;
    const position = handle.localPointToWorld(block.localLocation);
    const sound = resolveVanillaBlockPlaceSound(block.typeId);
    dimension.playSound(sound.sound, position, { pitch: sound.pitch, volume: sound.volume });
  }
  /** Behavior-declared world reads that must precede source block removal. */
  #captureWorldData(dimension, blocks, origin) {
    const worldData = /* @__PURE__ */ new Map();
    for (const block of blocks) {
      const behavior = this.#blockBehaviors.get(block.typeId);
      if (!behavior?.captureWorldData) continue;
      const data = behavior.captureWorldData({
        block,
        dimension,
        worldLocation: {
          x: origin.x + block.localLocation.x,
          y: origin.y + block.localLocation.y,
          z: origin.z + block.localLocation.z
        }
      });
      if (data !== void 0) worldData.set(blockLocationKey(block.localLocation), data);
    }
    return worldData;
  }
  /** State rewrites (vine bits, moss tips) re-project the affected blocks. */
  #applyStateUpdates(record, stateUpdates) {
    const handle = record.handle;
    const blocks = handle.blocks.map((block) => stateUpdates.get(blockLocationKey(block.localLocation))?.snapshot ?? block);
    const renderData = record.renderData;
    if (renderData.supportsBlockAddition === true && renderData.addBlocks) {
      const updatedKeys = new Set(stateUpdates.keys());
      renderData.removeBlocks(updatedKeys);
      renderData.addBlocks([...stateUpdates.values()].map((update) => update.snapshot));
    } else {
      this.#recreateRender(record, blocks);
    }
    handle.resetBlocks(blocks);
  }
  #recreateRender(record, blocks) {
    const previous = record.renderData;
    const next = SubLevelRenderer.createRenderData({
      ...record.subLevel,
      blocks
    });
    try {
      previous.transferPersistentRidersTo?.(next);
    } catch (error) {
      next.remove();
      throw error;
    }
    record.renderData = next;
    previous.remove();
  }
  #removeManagedSubLevel(record) {
    if (record.removed) return;
    this.#saveRecord(record);
    this.#destroyRecord(record, "planned");
  }
  #destroyRecord(record, reason) {
    if (record.removed) return;
    for (const behavior of this.#blockBehaviors.behaviors()) {
      behavior.onSubLevelRemoved?.(record.id, record.handle, reason);
    }
    if (reason !== "natural") {
      this.#containers.unbindSubLevel(record.id, record.handle);
    }
    record.removed = true;
    this.#recordsByHandleId.delete(record.handle?.id ?? -1);
    record.renderData.remove();
    record.handle?.unregister();
    record.invalidateBody();
  }
  #createRuntimeRecord(id, dimension, origin, blocks, foliageTint) {
    let removed = false;
    const body = {
      get isValid() {
        return !removed;
      },
      getRotation: () => ({ x: 0, y: 0, z: 0 }),
      localPointToWorld: (local) => ({
        x: origin.x + local.x + 0.5,
        y: origin.y + local.y + 0.5,
        z: origin.z + local.z + 0.5
      })
    };
    const worldPointToLocal = (point) => ({
      x: point.x - origin.x - 0.5,
      y: point.y - origin.y - 0.5,
      z: point.z - origin.z - 0.5
    });
    const subLevel = { body, blocks, dimension, foliageTint };
    const renderData = SubLevelRenderer.createRenderData(subLevel);
    const record = {
      id,
      subLevel,
      handle: void 0,
      origin: { ...origin },
      renderData,
      removed: false,
      invalidateBody: () => {
        removed = true;
      }
    };
    try {
      const handle = this.#interactionSystem.register(subLevel, {
        worldPointToLocal,
        get renderData() {
          return record.renderData;
        }
      });
      record.handle = handle;
      return record;
    } catch (error) {
      renderData.remove();
      removed = true;
      throw error;
    }
  }
  #restoreSubLevel(saved) {
    const record = this.#createRuntimeRecord(
      saved.id,
      world2.getDimension(saved.dimensionId),
      saved.origin,
      saved.blocks,
      saved.foliageTint
    );
    this.#recordsByHandleId.set(record.handle.id, record);
    try {
      this.#containers.bindSubLevel(saved.id, record.handle, saved.containerStorages);
    } catch (error) {
      this.#destroyRecord(record, "unexpected");
      throw error;
    }
  }
  #saveRecord(record, containerStorages = this.#containerBindings(record)) {
    if (!this.#storage.saveSubLevel(record.id, {
      blocks: [...record.handle.blocks],
      containerStorages,
      dimensionId: record.handle.dimension.id,
      foliageTint: record.subLevel.foliageTint,
      origin: record.origin
    })) {
      throw new Error(`Could not persist sub-level ${record.id}.`);
    }
  }
  #findRecord(ownerId) {
    return [...this.#recordsByHandleId.values()].find((record) => record.id === ownerId);
  }
  #containerBindings(record) {
    return this.#containers.getBindings(record.id);
  }
  #advanceNextSubLevelId(id) {
    const match = /^region_(\d+)$/.exec(id);
    if (!match) return;
    this.#nextSubLevelId = Math.max(this.#nextSubLevelId, Number(match[1]) + 1);
  }
  #discardUncommittedRecord(record) {
    for (const binding of this.#containerBindings(record)) {
      this.#containers.discardStorage(binding.storageId);
    }
    this.#destroyRecord(record, "unexpected");
  }
};
function isRecordRegionLoaded(record) {
  try {
    return record.handle.dimension.getBlock(
      record.handle.localPointToWorld(record.handle.outlineAnchorLocal)
    ) !== void 0;
  } catch {
    return false;
  }
}
function buildPlacedBlock(_player, typeId, placement, cardinalDirection) {
  let states;
  try {
    states = { ...BlockPermutation.resolve(typeId).getAllStates() };
  } catch {
    return void 0;
  }
  if (states["minecraft:cardinal_direction"] !== void 0) {
    states["minecraft:cardinal_direction"] = cardinalDirection;
  }
  return {
    localLocation: { ...placement },
    states,
    typeId,
    ...getSubLevelBlockRegistration(typeId)?.passable === true ? { collisionResponse: false } : {}
  };
}
function spawnBlockDrops(dimension, block, location, tool) {
  let drops = [];
  try {
    const permutation = BlockPermutation.resolve(block.typeId, { ...block.states });
    drops = world2.getLootTableManager().generateLootFromBlockPermutation(permutation, tool) ?? [];
  } catch {
    drops = [];
  }
  for (const item of drops) {
    try {
      dimension.spawnItem(item, location);
    } catch {
    }
  }
}

// sable/packs/SableBP/scripts/sable/content/assembly/SubLevelContainerInteraction.js
import {
  system as system4,
  world as world3
} from "@minecraft/server";
var STORAGE_ID_PROPERTY = "sable:storage_id";
var STORAGE_OWNER_PROPERTY = "sable:storage_owner";
var STORAGE_LOCATION_PROPERTY = "sable:storage_location";
var POSITION_EPSILON_SQUARED = EPSILON_1E6;
var STORAGE_DETACH_TIMEOUT_TICKS = 20;
var SubLevelContainerInteractionController = class {
  #profilesByBlockTypeId = /* @__PURE__ */ new Map();
  #profilesByEntityTypeId = /* @__PURE__ */ new Map();
  #activeRecords = /* @__PURE__ */ new Set();
  #recordByStorageId = /* @__PURE__ */ new Map();
  #recordCountByDimension = /* @__PURE__ */ new Map();
  #storageIdBySubLevelBlock = /* @__PURE__ */ new Map();
  #storageIdByEntityId = /* @__PURE__ */ new Map();
  #previewStorageByPlayer = /* @__PURE__ */ new Map();
  #viewerStorageByPlayer = /* @__PURE__ */ new Map();
  #nativeDeathEntityIds = /* @__PURE__ */ new Set();
  #settlingEntityIds = /* @__PURE__ */ new Set();
  #bindingRegistrationComplete = false;
  #started = false;
  /** Register one container kind. Must precede start(). */
  registerContainerProfile(profile) {
    if (this.#started) {
      throw new Error(`Container profile ${profile.blockTypeId} was registered after start.`);
    }
    if (this.#profilesByBlockTypeId.has(profile.blockTypeId)) {
      throw new Error(`A container profile for ${profile.blockTypeId} is already registered.`);
    }
    if (this.#profilesByEntityTypeId.has(profile.storageEntityTypeId)) {
      throw new Error(`Storage entity ${profile.storageEntityTypeId} already backs another container profile.`);
    }
    this.#profilesByBlockTypeId.set(profile.blockTypeId, profile);
    this.#profilesByEntityTypeId.set(profile.storageEntityTypeId, profile);
  }
  start() {
    if (this.#started) return;
    this.#started = true;
    world3.beforeEvents.playerInteractWithEntity.subscribe((event) => {
      if (!this.#profilesByEntityTypeId.has(event.target.typeId)) return;
      const record = this.#recordForEntity(event.target);
      if (record?.handle?.isValid && record.active) return;
      event.cancel = true;
      if (!record) {
        system4.run(() => {
          throw new Error(`Unbound container storage entity ${event.target.id} was interacted with.`);
        });
      }
    });
    world3.afterEvents.entityContainerOpened.subscribe((event) => {
      if (!this.#profilesByEntityTypeId.has(event.entity.typeId)) return;
      const player = event.openSource.entity;
      if (player?.typeId !== "minecraft:player") return;
      this.#openContainer(player, event.entity);
    });
    world3.afterEvents.entityContainerClosed.subscribe((event) => {
      if (!this.#profilesByEntityTypeId.has(event.entity.typeId)) return;
      const player = event.closeSource.entity;
      if (player?.typeId !== "minecraft:player") return;
      this.#closeContainer(player.id, event.entity);
    });
    world3.beforeEvents.entityHurt.subscribe((event) => {
      if (!this.#profilesByEntityTypeId.has(event.hurtEntity.typeId)) return;
      if (this.#settlingEntityIds.has(event.hurtEntity.id)) return;
      event.cancel = true;
    });
    world3.afterEvents.entityDie.subscribe((event) => {
      if (!this.#profilesByEntityTypeId.has(event.deadEntity.typeId)) return;
      if (!this.#settlingEntityIds.has(event.deadEntity.id) && this.#storageIdByEntityId.has(event.deadEntity.id)) this.#nativeDeathEntityIds.add(event.deadEntity.id);
      if (event.deadEntity.isValid) event.deadEntity.remove();
    });
    world3.afterEvents.entityRemove.subscribe((event) => {
      if (!this.#profilesByEntityTypeId.has(event.typeId)) return;
      this.handleEntityRemove(event.removedEntityId);
    });
    system4.run(() => {
      for (const dimensionId of VANILLA_DIMENSION_IDS) {
        const dimension = world3.getDimension(dimensionId);
        for (const typeId of this.#profilesByEntityTypeId.keys()) {
          for (const entity of dimension.getEntities({ type: typeId })) {
            this.handleEntityLoad(entity);
          }
        }
      }
    });
  }
  canInteract(_handle, block) {
    const profile = this.#profilesByBlockTypeId.get(block.typeId);
    if (!profile) return false;
    if (profile.modelType === void 0) return true;
    return resolveFancySubLevelBlock(block)?.model.description.type === profile.modelType;
  }
  /** Native entity interaction opens the container; this only consumes sub-level gestures. */
  interact(_player, handle, block) {
    if (!this.canInteract(handle, block)) return false;
    const record = this.#recordAt(handle, block.localLocation);
    if (!record?.entity?.isValid) {
      throw new Error(`Projected container ${subLevelBlockKey(handle.id, block.localLocation)} has no storage entity.`);
    }
    return true;
  }
  /** Whether any storage record in a dimension could react to syncTarget. */
  hasSyncTargets(dimensionId) {
    if (dimensionId === void 0) {
      return this.#recordCountByDimension.size > 0 || this.#previewStorageByPlayer.size > 0;
    }
    return (this.#recordCountByDimension.get(dimensionId) ?? 0) > 0;
  }
  syncTarget(player, handle, block) {
    const next = handle && block && this.canInteract(handle, block) ? this.#recordAt(handle, block.localLocation) : void 0;
    const previousId = this.#previewStorageByPlayer.get(player.id);
    if (previousId === next?.storageId) return;
    if (previousId) this.#releasePreview(player.id, previousId);
    if (!next?.entity?.isValid) return;
    this.#previewStorageByPlayer.set(player.id, next.storageId);
    next.previewers.add(player.id);
    this.#activate(next);
  }
  tick() {
    for (const record of this.#activeRecords) {
      if (!record.entity?.isValid || !record.handle?.isValid) {
        this.#invalidateRuntimeReferences(record);
        continue;
      }
      const location = this.#activeStorageLocation(record, record.handle, record.localLocation);
      if (record.lastLocation && squaredDistance(record.lastLocation, location) <= POSITION_EPSILON_SQUARED) {
        continue;
      }
      record.entity.teleport(location);
      record.lastLocation = location;
    }
  }
  releasePlayer(playerId) {
    const previewStorageId = this.#previewStorageByPlayer.get(playerId);
    if (previewStorageId) this.#releasePreview(playerId, previewStorageId);
    const viewerStorageId = this.#viewerStorageByPlayer.get(playerId);
    if (viewerStorageId) this.#releaseViewer(playerId, viewerStorageId);
  }
  handleEntityLoad(entity) {
    const profile = this.#profilesByEntityTypeId.get(entity.typeId);
    if (!profile) return;
    const identity = readStorageIdentity(entity);
    let record = this.#recordByStorageId.get(identity.storageId);
    if (!record) {
      if (this.#bindingRegistrationComplete) {
        entity.remove();
        return;
      }
      record = {
        active: false,
        attached: false,
        claimed: false,
        entity,
        localLocation: identity.localLocation,
        ownerId: identity.ownerId,
        pendingAttachTick: void 0,
        previewers: /* @__PURE__ */ new Set(),
        profile,
        storageId: identity.storageId,
        viewers: /* @__PURE__ */ new Set()
      };
      this.#recordByStorageId.set(record.storageId, record);
    } else {
      assertStorageIdentity(record, identity);
      this.#assignProfile(record, profile);
      if (record.entity?.isValid && record.entity.id !== entity.id) {
        throw new Error(`Storage ID ${record.storageId} is owned by multiple loaded entities.`);
      }
      record.entity = entity;
    }
    this.#storageIdByEntityId.set(entity.id, record.storageId);
    if (record.handle?.isValid && !record.active) this.#queueAttach(record);
  }
  handleEntityRemove(entityId) {
    if (this.#settlingEntityIds.delete(entityId)) return;
    const diedNatively = this.#nativeDeathEntityIds.delete(entityId);
    const storageId = this.#storageIdByEntityId.get(entityId);
    if (diedNatively && !storageId) {
      throw new Error(`Native death for container storage entity ${entityId} lost its storage index.`);
    }
    if (!storageId) return;
    this.#storageIdByEntityId.delete(entityId);
    const record = this.#recordByStorageId.get(storageId);
    if (!record || record.entity?.id !== entityId) return;
    const handle = record.handle;
    if (handle?.isValid && record.entity) handle.detachPersistentEntity(record.entity);
    if (diedNatively) {
      this.#invalidateRuntimeReferences(record);
      const onNativeDeath = record.profile?.onNativeDeath;
      if (!onNativeDeath) {
        throw new Error(`Storage ${record.storageId} died without a native-death handler.`);
      }
      onNativeDeath(record.ownerId, {
        localLocation: { ...record.localLocation },
        storageId: record.storageId
      });
      this.#removeRecordIndexes(record);
      this.#removeUnusedStorageCarrier(handle);
      return;
    }
    record.entity = void 0;
    record.active = false;
    record.attached = false;
    record.lastLocation = void 0;
    this.#invalidateRuntimeReferences(record);
    record.profile?.onUnexpectedRemoval?.(record.ownerId, {
      localLocation: { ...record.localLocation },
      storageId: record.storageId
    });
  }
  registerSavedBindings(ownerId, bindings) {
    if (this.#bindingRegistrationComplete) {
      throw new Error("Saved container storage bindings were registered after reconciliation completed.");
    }
    for (const binding of bindings) this.#claimBinding(ownerId, binding);
  }
  /** Remove every loaded storage entity not claimed by persisted sub-level data. */
  completeSavedBindingRegistration() {
    if (this.#bindingRegistrationComplete) return;
    this.#bindingRegistrationComplete = true;
    for (const record of [...this.#recordByStorageId.values()]) {
      if (record.claimed) {
        if (record.handle?.isValid && !record.entity?.isValid) {
          this.#ensureStorageEntity(record, record.handle);
        }
        continue;
      }
      this.#removeRecordIndexes(record);
      if (record.entity?.isValid) record.entity.remove();
    }
  }
  bindSubLevel(ownerId, handle, bindings) {
    for (const binding of bindings) {
      const block = handle.getBlockAtLocalLocation(binding.localLocation);
      const profile = block ? this.#profilesByBlockTypeId.get(block.typeId) : void 0;
      if (!profile) {
        throw new Error(`Storage ${binding.storageId} does not point to a container block.`);
      }
      const record = this.#claimBinding(ownerId, binding);
      this.#assignProfile(record, profile);
      if (record.handle && record.handle !== handle && record.handle.isValid) {
        throw new Error(`Storage ${binding.storageId} is already bound to another sub-level.`);
      }
      if (record.handle !== handle) record.attached = false;
      this.#setRecordHandle(record, handle);
      this.#ensureStorageEntity(record, handle);
      this.#storageIdBySubLevelBlock.set(
        subLevelBlockKey(handle.id, binding.localLocation),
        binding.storageId
      );
      if (record.entity?.isValid && !record.active) this.#queueAttach(record);
    }
  }
  /** Release runtime ownership while preserving storage identity for restoration. */
  unbindSubLevel(ownerId, handle) {
    for (const record of this.#recordByStorageId.values()) {
      if (record.ownerId !== ownerId || record.handle !== handle) continue;
      const entity = record.entity;
      this.#invalidateRuntimeReferences(record);
      record.pendingAttachTick = void 0;
      if (entity?.isValid && handle.isValid) {
        handle.detachPersistentEntity(entity);
        entity.triggerEvent(this.#requireProfile(record).deactivateEvent);
      }
      this.#storageIdBySubLevelBlock.delete(
        subLevelBlockKey(handle.id, record.localLocation)
      );
      this.#setRecordHandle(record, void 0);
    }
    this.#removeUnusedStorageCarrier(handle);
  }
  createStorage(ownerId, handle, localLocation) {
    const block = handle.getBlockAtLocalLocation(localLocation);
    const profile = block ? this.#profilesByBlockTypeId.get(block.typeId) : void 0;
    if (!profile) {
      throw new Error(`No container profile covers the block at ${subLevelBlockKey(handle.id, localLocation)}.`);
    }
    const entity = handle.dimension.spawnEntity(
      profile.storageEntityTypeId,
      storageLocationFromCellCenter(handle.localPointToWorld(localLocation), profile)
    );
    try {
      const storageId = entity.id;
      initializeStorageEntity(entity, ownerId, storageId, localLocation, profile);
      const record = {
        active: false,
        handle: void 0,
        attached: false,
        claimed: true,
        entity,
        localLocation: { ...localLocation },
        ownerId,
        pendingAttachTick: void 0,
        previewers: /* @__PURE__ */ new Set(),
        profile,
        storageId,
        viewers: /* @__PURE__ */ new Set()
      };
      this.#recordByStorageId.set(storageId, record);
      this.#setRecordHandle(record, handle);
      this.#storageIdByEntityId.set(entity.id, storageId);
      this.#storageIdBySubLevelBlock.set(subLevelBlockKey(handle.id, localLocation), storageId);
      this.#attach(record);
      return { localLocation: { ...localLocation }, storageId };
    } catch (error) {
      const record = this.#recordByStorageId.get(entity.id);
      if (record) this.#removeRecordIndexes(record);
      if (entity.isValid) entity.remove();
      throw error;
    }
  }
  /** Returns the persisted binding set currently owned by one sub-level. */
  getBindings(ownerId) {
    return [...this.#recordByStorageId.values()].filter((record) => record.ownerId === ownerId).map((record) => ({
      localLocation: { ...record.localLocation },
      storageId: record.storageId
    }));
  }
  getBinding(handle, localLocation) {
    const storageId = this.#storageIdBySubLevelBlock.get(
      subLevelBlockKey(handle.id, localLocation)
    );
    const record = storageId ? this.#recordByStorageId.get(storageId) : void 0;
    return record ? { localLocation: { ...record.localLocation }, storageId: record.storageId } : void 0;
  }
  discardStorage(storageId) {
    const record = this.#requiredRecord(storageId);
    const handle = record.handle;
    if (record.handle?.isValid && record.entity?.isValid) {
      record.handle.detachPersistentEntity(record.entity);
    }
    this.#removeRecordIndexes(record);
    if (record.entity?.isValid) record.entity.remove();
    this.#removeUnusedStorageCarrier(handle);
  }
  settleStorages(ownerId, bindings, dimension, resolveLocation) {
    for (const binding of bindings) {
      const record = this.#requiredRecord(binding.storageId);
      if (record.ownerId !== ownerId || !sameLocation(record.localLocation, binding.localLocation)) {
        throw new Error(`Storage ${binding.storageId} does not match settlement owner ${ownerId}.`);
      }
      const profile = this.#requireProfile(record);
      const entity = record.entity;
      if (!entity?.isValid || entity.dimension.id !== dimension.id) {
        throw new Error(`Storage ${binding.storageId} is unavailable for sub-level settlement.`);
      }
      this.#invalidateRuntimeReferences(record);
      if (record.handle?.isValid) record.handle.detachPersistentEntity(entity);
      entity.triggerEvent(profile.activateEvent);
      entity.teleport(storageLocationFromCellCenter(resolveLocation(binding.localLocation), profile));
      this.#settlingEntityIds.add(entity.id);
      if (!entity.kill()) {
        this.#settlingEntityIds.delete(entity.id);
        throw new Error(`Storage ${binding.storageId} could not complete native inventory settlement.`);
      }
      system4.run(() => {
        if (entity.isValid) entity.remove();
      });
      this.#removeRecordIndexes(record);
      this.#removeUnusedStorageCarrier(record.handle);
    }
  }
  #claimBinding(ownerId, binding) {
    let record = this.#recordByStorageId.get(binding.storageId);
    if (!record) {
      record = {
        active: false,
        attached: false,
        claimed: true,
        localLocation: { ...binding.localLocation },
        ownerId,
        pendingAttachTick: void 0,
        previewers: /* @__PURE__ */ new Set(),
        storageId: binding.storageId,
        viewers: /* @__PURE__ */ new Set()
      };
      this.#recordByStorageId.set(binding.storageId, record);
      return record;
    }
    assertStorageIdentity(record, {
      localLocation: binding.localLocation,
      ownerId,
      storageId: binding.storageId
    });
    record.claimed = true;
    return record;
  }
  #assignProfile(record, profile) {
    if (record.profile && record.profile !== profile) {
      throw new Error(`Storage ${record.storageId} is claimed by two container profiles.`);
    }
    record.profile = profile;
  }
  #requireProfile(record) {
    if (!record.profile) {
      throw new Error(`Storage ${record.storageId} has no resolved container profile.`);
    }
    return record.profile;
  }
  #recordAt(handle, localLocation) {
    const storageId = this.#storageIdBySubLevelBlock.get(
      subLevelBlockKey(handle.id, localLocation)
    );
    return storageId ? this.#recordByStorageId.get(storageId) : void 0;
  }
  #recordForEntity(entity) {
    const storageId = this.#storageIdByEntityId.get(entity.id) ?? entity.getDynamicProperty(STORAGE_ID_PROPERTY);
    return typeof storageId === "string" ? this.#recordByStorageId.get(storageId) : void 0;
  }
  #requiredRecord(storageId) {
    const record = this.#recordByStorageId.get(storageId);
    if (!record) throw new Error(`Storage ${storageId} is not registered.`);
    return record;
  }
  #ensureStorageEntity(record, handle) {
    if (record.entity?.isValid) return;
    const profile = this.#requireProfile(record);
    const entity = handle.dimension.spawnEntity(
      profile.storageEntityTypeId,
      storageLocationFromCellCenter(handle.localPointToWorld(record.localLocation), profile)
    );
    try {
      initializeStorageEntity(
        entity,
        record.ownerId,
        record.storageId,
        record.localLocation,
        profile
      );
      record.entity = entity;
      this.#storageIdByEntityId.set(entity.id, record.storageId);
    } catch (error) {
      if (entity.isValid) entity.remove();
      throw error;
    }
  }
  #activeStorageLocation(record, handle, localLocation) {
    return storageLocationFromCellCenter(
      handle.localPointToWorld(localLocation),
      this.#requireProfile(record)
    );
  }
  #activate(record) {
    if (record.active) return;
    const entity = record.entity;
    const handle = record.handle;
    if (!entity?.isValid || !handle?.isValid) return;
    const profile = this.#requireProfile(record);
    if (record.attached) handle.detachPersistentEntity(entity, true);
    record.attached = false;
    const location = this.#activeStorageLocation(record, handle, record.localLocation);
    entity.teleport(location);
    entity.triggerEvent(profile.activateEvent);
    record.active = true;
    this.#activeRecords.add(record);
    record.lastLocation = location;
  }
  #deactivate(record) {
    if (!record.active || record.previewers.size > 0 || record.viewers.size > 0) return;
    const entity = record.entity;
    if (!entity?.isValid) return;
    entity.triggerEvent(this.#requireProfile(record).deactivateEvent);
    record.active = false;
    this.#activeRecords.delete(record);
    record.lastLocation = void 0;
    this.#attach(record);
  }
  #queueAttach(record) {
    if (record.pendingAttachTick !== void 0) return;
    record.pendingAttachTick = system4.currentTick;
    system4.run(() => this.#completeQueuedAttach(record));
  }
  #completeQueuedAttach(record) {
    const queuedTick = record.pendingAttachTick;
    if (queuedTick === void 0) return;
    if (this.#recordByStorageId.get(record.storageId) !== record || record.active || record.attached || !record.entity?.isValid || !record.handle?.isValid) {
      record.pendingAttachTick = void 0;
      return;
    }
    const vehicle = record.entity.getComponent("minecraft:riding")?.entityRidingOn;
    if (vehicle) {
      if (system4.currentTick - queuedTick >= STORAGE_DETACH_TIMEOUT_TICKS) {
        record.pendingAttachTick = void 0;
        throw new Error(
          `Storage ${record.storageId} did not detach from carrier ${vehicle.id} before attaching to sub-level ${record.handle.id}.`
        );
      }
      system4.run(() => this.#completeQueuedAttach(record));
      return;
    }
    record.pendingAttachTick = void 0;
    this.#attach(record);
  }
  #attach(record) {
    const entity = record.entity;
    const handle = record.handle;
    if (!entity?.isValid || !handle?.isValid) return;
    if (!handle.attachPersistentEntity(entity)) {
      throw new Error(`Storage ${record.storageId} could not attach to its sub-level carrier.`);
    }
    record.attached = true;
  }
  #releasePreview(playerId, storageId) {
    if (this.#previewStorageByPlayer.get(playerId) === storageId) {
      this.#previewStorageByPlayer.delete(playerId);
    }
    const record = this.#recordByStorageId.get(storageId);
    if (!record) return;
    record.previewers.delete(playerId);
    this.#deactivate(record);
  }
  #releaseViewer(playerId, storageId) {
    if (this.#viewerStorageByPlayer.get(playerId) === storageId) {
      this.#viewerStorageByPlayer.delete(playerId);
    }
    const record = this.#recordByStorageId.get(storageId);
    if (!record || !record.viewers.delete(playerId)) return;
    if (record.viewers.size === 0) this.#setOpen(record, false);
    this.#deactivate(record);
  }
  #openContainer(player, entity) {
    const record = this.#recordForEntity(entity);
    if (!record?.handle?.isValid || !record.active) {
      throw new Error(`Container opened for invalid storage entity ${entity.id}.`);
    }
    const previous = this.#viewerStorageByPlayer.get(player.id);
    if (previous && previous !== record.storageId) this.#releaseViewer(player.id, previous);
    if (record.viewers.size === 0) this.#setOpen(record, true);
    record.viewers.add(player.id);
    this.#viewerStorageByPlayer.set(player.id, record.storageId);
  }
  #closeContainer(playerId, entity) {
    const record = this.#recordForEntity(entity);
    if (!record) return;
    this.#releaseViewer(playerId, record.storageId);
  }
  #setOpen(record, open) {
    const handle = record.handle;
    if (!handle?.isValid) return;
    const profile = this.#requireProfile(record);
    if (profile.openStateDimension !== void 0) {
      if (!handle.setBlockModelState(record.localLocation, profile.openStateDimension, open ? 1 : 0)) {
        throw new Error(`Could not set container ${record.storageId} open state to ${open}.`);
      }
    }
    const dimension = handle.dimension;
    const location = handle.localPointToWorld(record.localLocation);
    if (open) {
      const sound2 = profile.openSound;
      if (sound2) dimension.playSound(sound2.id, location, { pitch: sound2.pitch, volume: sound2.volume });
      return;
    }
    const sound = profile.closeSound;
    if (!sound) return;
    system4.runTimeout(() => {
      dimension.playSound(sound.id, location, { pitch: sound.pitch, volume: sound.volume });
    }, sound.delayTicks);
  }
  #invalidateRuntimeReferences(record) {
    this.#activeRecords.delete(record);
    record.active = false;
    record.attached = false;
    record.lastLocation = void 0;
    for (const playerId of record.previewers) {
      if (this.#previewStorageByPlayer.get(playerId) === record.storageId) {
        this.#previewStorageByPlayer.delete(playerId);
      }
    }
    for (const playerId of record.viewers) {
      if (this.#viewerStorageByPlayer.get(playerId) === record.storageId) {
        this.#viewerStorageByPlayer.delete(playerId);
      }
    }
    const wasOpen = record.viewers.size > 0;
    record.previewers.clear();
    record.viewers.clear();
    if (wasOpen && record.handle?.isValid && record.handle.getBlockAtLocalLocation(record.localLocation)?.typeId === record.profile?.blockTypeId) this.#setOpen(record, false);
  }
  #removeRecordIndexes(record) {
    record.pendingAttachTick = void 0;
    this.#activeRecords.delete(record);
    if (this.#recordByStorageId.get(record.storageId) === record) {
      this.#recordByStorageId.delete(record.storageId);
      this.#adjustRecordCount(record.handle?.dimension.id, -1);
    }
    if (record.entity) this.#storageIdByEntityId.delete(record.entity.id);
    if (record.handle) {
      this.#storageIdBySubLevelBlock.delete(
        subLevelBlockKey(record.handle.id, record.localLocation)
      );
    }
  }
  #setRecordHandle(record, handle) {
    const previousDimensionId = record.handle?.dimension.id;
    const nextDimensionId = handle?.dimension.id;
    record.handle = handle;
    if (previousDimensionId === nextDimensionId) return;
    this.#adjustRecordCount(previousDimensionId, -1);
    this.#adjustRecordCount(nextDimensionId, 1);
  }
  #adjustRecordCount(dimensionId, delta) {
    if (dimensionId === void 0) return;
    const next = (this.#recordCountByDimension.get(dimensionId) ?? 0) + delta;
    if (next < 0) {
      throw new Error(`Container storage count for dimension ${dimensionId} became negative.`);
    }
    if (next === 0) this.#recordCountByDimension.delete(dimensionId);
    else this.#recordCountByDimension.set(dimensionId, next);
  }
  #removeUnusedStorageCarrier(handle) {
    if (!handle?.isValid) return;
    for (const record of this.#recordByStorageId.values()) {
      if (record.handle === handle) return;
    }
    handle.removeEmptyPersistentEntityCarriers();
  }
};
function readStorageIdentity(entity) {
  const storageId = entity.getDynamicProperty(STORAGE_ID_PROPERTY);
  const ownerId = entity.getDynamicProperty(STORAGE_OWNER_PROPERTY);
  const localLocation = entity.getDynamicProperty(STORAGE_LOCATION_PROPERTY);
  if (typeof storageId !== "string" || storageId.length === 0 || typeof ownerId !== "string" || ownerId.length === 0 || !isIntegerVector(localLocation)) {
    throw new Error(`Container storage entity ${entity.id} has invalid persistent identity.`);
  }
  return { localLocation, ownerId, storageId };
}
function assertStorageIdentity(record, identity) {
  if (record.storageId !== identity.storageId || record.ownerId !== identity.ownerId || !sameLocation(record.localLocation, identity.localLocation)) {
    throw new Error(`Storage ${identity.storageId} has conflicting persistent ownership.`);
  }
}
function storageLocationFromCellCenter(center, profile) {
  return {
    x: center.x,
    y: center.y - profile.collisionHeight * 0.5,
    z: center.z
  };
}
function initializeStorageEntity(entity, ownerId, storageId, localLocation, profile) {
  entity.setDynamicProperty(STORAGE_ID_PROPERTY, storageId);
  entity.setDynamicProperty(STORAGE_OWNER_PROPERTY, ownerId);
  entity.setDynamicProperty(STORAGE_LOCATION_PROPERTY, { ...localLocation });
  entity.nameTag = profile.nameTranslationKey;
  entity.triggerEvent(profile.deactivateEvent);
  const container = entity.getComponent("minecraft:inventory")?.container;
  if (!container || container.size !== profile.containerSize) {
    throw new Error(
      `Container storage entity ${profile.storageEntityTypeId} does not expose a ${profile.containerSize}-slot inventory.`
    );
  }
}
function subLevelBlockKey(subLevelId, localLocation) {
  return `${subLevelId}|${localLocation.x},${localLocation.y},${localLocation.z}`;
}
function sameLocation(left, right) {
  return left.x === right.x && left.y === right.y && left.z === right.z;
}
function isIntegerVector(value) {
  if (!value || typeof value !== "object") return false;
  const vector = value;
  return Number.isInteger(vector.x) && Number.isInteger(vector.y) && Number.isInteger(vector.z);
}

// sable/packs/SableBP/scripts/sable/content/blocks/vanilla/bee_nest/BeeNestSubLevelBehavior.js
var BEE_NEST_TYPE_ID = "minecraft:bee_nest";
var BEE_ENTITY_TYPE_ID = "minecraft:bee";
function registerBeeNestSubLevelBehavior(context) {
  context.behaviors.register(BEE_NEST_TYPE_ID, {
    onBlockRemoved: (event) => {
      const count = getBeeNestSpawnCount(event.block.states?.honey_level);
      const location = event.handle.localPointToWorld(event.block.localLocation);
      for (let index = 0; index < count; index++) {
        try {
          event.dimension.spawnEntity(BEE_ENTITY_TYPE_ID, location);
        } catch {
        }
      }
    }
  });
}
function getBeeNestSpawnCount(honeyLevel) {
  const numeric = Number(honeyLevel);
  if (!Number.isFinite(numeric)) return 0;
  const level = Math.max(0, Math.min(5, Math.floor(numeric)));
  return Math.min(3, Math.ceil(level / 2));
}

// sable/packs/SableBP/scripts/sable/content/blocks/vanilla/chest/ChestSubLevelBehavior.js
import { world as world4 } from "@minecraft/server";
var CHEST_ENTITY_TYPE_ID = "sable:chest";
var CHEST_BLOCK_TYPE_ID = "minecraft:chest";
var CHEST_CONTAINER_SIZE = 27;
var CHEST_COLLISION_HEIGHT = 0.875;
function registerChestSubLevelBehavior(context) {
  const containers = context.containers;
  containers.registerContainerProfile({
    blockTypeId: CHEST_BLOCK_TYPE_ID,
    modelType: "chest",
    storageEntityTypeId: CHEST_ENTITY_TYPE_ID,
    nameTranslationKey: "tile.chest.name",
    containerSize: CHEST_CONTAINER_SIZE,
    collisionHeight: CHEST_COLLISION_HEIGHT,
    activateEvent: "sable:chest_activate",
    deactivateEvent: "sable:chest_deactivate",
    openStateDimension: "open",
    openSound: { id: "random.chestopen", pitch: 1, volume: 0.5 },
    closeSound: { id: "random.chestclosed", pitch: 1, volume: 0.5, delayTicks: 1 },
    onNativeDeath: (ownerId, binding) => {
      context.onNativeDeath?.(ownerId, binding);
    },
    onUnexpectedRemoval: (ownerId, binding) => {
      context.onUnexpectedRemoval?.(ownerId, binding);
    }
  });
  context.behaviors.register(CHEST_BLOCK_TYPE_ID, {
    captureWorldData: (capture) => {
      const container = capture.dimension.getBlock(capture.worldLocation)?.getComponent("minecraft:inventory")?.container;
      if (!container) return void 0;
      const items = [];
      for (let slot = 0; slot < Math.min(container.size, CHEST_CONTAINER_SIZE); slot++) {
        items.push(container.getItem(slot));
      }
      return items;
    },
    onBlockAdded: (event) => {
      const binding = containers.createStorage(event.ownerId, event.handle, event.block.localLocation);
      fillChestStorage(binding, event.worldData);
    },
    onBlockRemoved: (event) => {
      const binding = containers.getBinding(event.handle, event.block.localLocation);
      if (!binding) return;
      containers.settleStorages(
        event.ownerId,
        [binding],
        event.dimension,
        (localLocation) => event.handle.localPointToWorld(localLocation)
      );
    },
    onSubLevelRemoved: (ownerId, handle, reason) => {
      if (reason !== "natural") return;
      for (const binding of containers.getBindings(ownerId)) {
        containers.settleStorages(
          ownerId,
          [binding],
          handle.dimension,
          (localLocation) => handle.localPointToWorld(localLocation)
        );
      }
    }
  });
}
function fillChestStorage(binding, worldData) {
  if (!Array.isArray(worldData) || worldData.length === 0) return;
  const items = worldData;
  const container = world4.getEntity(binding.storageId)?.getComponent("minecraft:inventory")?.container;
  if (!container) return;
  for (let slot = 0; slot < Math.min(items.length, container.size); slot++) {
    const item = items[slot];
    if (item) container.setItem(slot, item);
  }
}

// sable/packs/SableBP/scripts/sable/content/blocks/vanilla/VanillaSubLevelBlockBehaviors.js
function registerVanillaSubLevelBlockBehaviors(context) {
  registerChestSubLevelBehavior(context);
  registerBeeNestSubLevelBehavior(context);
}

// sable/packs/SableBP/scripts/sable/content/punching/SubLevelPlayerInteraction.js
import {
  BlockTypes as BlockTypes2,
  EntitySwingSource,
  GameMode as GameMode3,
  InputButton as InputButton2,
  InputMode as InputMode2,
  system as system8,
  world as world7
} from "@minecraft/server";

// sable/packs/SableBP/scripts/sable/api/player/ActivePlayerRegistry.js
import {
  InputButton,
  system as system5,
  world as world5
} from "@minecraft/server";
var ActivePlayerRegistry = class {
  #players = /* @__PURE__ */ new Map();
  #sneakingPlayers = /* @__PURE__ */ new Map();
  #started = false;
  start() {
    if (this.#started) return;
    this.#started = true;
    world5.afterEvents.playerSpawn.subscribe((event) => this.#syncPlayer(event.player));
    world5.afterEvents.playerDimensionChange.subscribe((event) => this.#syncPlayer(event.player));
    world5.afterEvents.playerButtonInput.subscribe(
      (event) => this.#syncPlayer(event.player),
      { buttons: [InputButton.Sneak] }
    );
    world5.beforeEvents.playerLeave.subscribe((event) => this.remove(event.player.id));
    system5.run(() => {
      for (const player of world5.getPlayers()) this.#syncPlayer(player);
    });
  }
  get(playerId) {
    const player = this.#players.get(playerId);
    if (!player) return void 0;
    if (player.isValid) return player;
    this.remove(playerId);
    return void 0;
  }
  hasSneakingPlayer(playerId) {
    return this.#sneakingPlayers.has(playerId);
  }
  *players() {
    for (const [playerId, player] of this.#players) {
      if (!player.isValid) {
        this.remove(playerId);
        continue;
      }
      yield player;
    }
  }
  *sneakingPlayers() {
    for (const [playerId, player] of this.#sneakingPlayers) {
      if (!isActivelySneaking(player)) {
        this.#sneakingPlayers.delete(playerId);
        continue;
      }
      yield player;
    }
  }
  remove(playerId) {
    this.#players.delete(playerId);
    this.#sneakingPlayers.delete(playerId);
  }
  #syncPlayer(player) {
    if (!player.isValid) {
      this.remove(player.id);
      return;
    }
    this.#players.set(player.id, player);
    if (isActivelySneaking(player)) this.#sneakingPlayers.set(player.id, player);
    else this.#sneakingPlayers.delete(player.id);
  }
};
function isActivelySneaking(player) {
  try {
    return player.isValid && player.isSneaking;
  } catch {
    return false;
  }
}

// sable/packs/SableBP/scripts/sable/content/block_outline_render/SubLevelOutlineController.js
import {
  BlockTypes,
  GameMode as GameMode2,
  InputMode,
  system as system7,
  world as world6
} from "@minecraft/server";

// sable/packs/SableBP/scripts/sable/content/block_outline_render/SubLevelOutlineGeometry.js
function createAabbOutline(locations) {
  if (locations.length === 0) return [];
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let minZ = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  let maxZ = Number.NEGATIVE_INFINITY;
  for (const location of locations) {
    minX = Math.min(minX, location.x - 0.5);
    minY = Math.min(minY, location.y - 0.5);
    minZ = Math.min(minZ, location.z - 0.5);
    maxX = Math.max(maxX, location.x + 0.5);
    maxY = Math.max(maxY, location.y + 0.5);
    maxZ = Math.max(maxZ, location.z + 0.5);
  }
  return [
    edge("x", minX, minY, minZ, maxX - minX),
    edge("x", minX, minY, maxZ, maxX - minX),
    edge("x", minX, maxY, minZ, maxX - minX),
    edge("x", minX, maxY, maxZ, maxX - minX),
    edge("y", minX, minY, minZ, maxY - minY),
    edge("y", minX, minY, maxZ, maxY - minY),
    edge("y", maxX, minY, minZ, maxY - minY),
    edge("y", maxX, minY, maxZ, maxY - minY),
    edge("z", minX, minY, minZ, maxZ - minZ),
    edge("z", minX, maxY, minZ, maxZ - minZ),
    edge("z", maxX, minY, minZ, maxZ - minZ),
    edge("z", maxX, maxY, minZ, maxZ - minZ)
  ];
}
function edge(axis, x, y, z, length) {
  return { axis, length, start: { x, y, z } };
}

// sable/packs/SableBP/scripts/sable/content/block_outline_render/SubLevelOutlineMolang.js
var BREAK_OVERLAY_CENTER_HEIGHT = 0.375;
var RAY_REFRESH_TICKS = 2;
var VIEW_DIRECTION_EPSILON_SQUARED = 1e-10;
var BREAK_OVERLAY_TRANSFORM_EPSILON_SQUARED = EPSILON_1E8;
function hasViewDirectionChanged(previous, current) {
  const dx = previous.x - current.x;
  const dy = previous.y - current.y;
  const dz = previous.z - current.z;
  return dx * dx + dy * dy + dz * dz > VIEW_DIRECTION_EPSILON_SQUARED;
}
function vectorComponentsEqual(left, right) {
  return left.x === right.x && left.y === right.y && left.z === right.z;
}
function shouldRefreshOutlineRay(mode, ticksSinceRefresh, viewChanged, subLevelMoving) {
  return viewChanged || (mode === "block" ? subLevelMoving : ticksSinceRefresh >= RAY_REFRESH_TICKS);
}
function createBlockPreviewTransform(target, placement, visualAnchor) {
  let side = 0;
  if (placement) {
    const dx = placement.x - target.x;
    const dy = placement.y - target.y;
    const dz = placement.z - target.z;
    if (Math.abs(dx) + Math.abs(dy) + Math.abs(dz) !== 1) throw new RangeError("Block preview placement must be adjacent to its target cell.");
    side = dx !== 0 ? dx : dy !== 0 ? dy * 2 : dz * 3;
  }
  return { side, x: target.x - visualAnchor.x, y: target.y - visualAnchor.y, z: target.z - visualAnchor.z };
}
function isPlayerHeadInsideSubLevelPlacement(headLocation, placement, worldPointToLocal) {
  if (!isFiniteVector2(headLocation)) throw new TypeError("Player head location must contain finite coordinates.");
  if (!isFiniteVector2(placement)) throw new TypeError("Sub-level placement must contain finite coordinates.");
  const local = worldPointToLocal(headLocation);
  if (!isFiniteVector2(local)) throw new TypeError("Sub-level placement transform returned a non-finite point.");
  return Math.abs(local.x - placement.x) < 0.5 && Math.abs(local.y - placement.y) < 0.5 && Math.abs(local.z - placement.z) < 0.5;
}
function breakOverlayLocation(cellCenter) {
  return { x: cellCenter.x, y: cellCenter.y - BREAK_OVERLAY_CENTER_HEIGHT, z: cellCenter.z };
}
function resolvePlacementCardinalDirection(worldPointToLocal, worldOrigin, worldViewDirection) {
  const localOrigin = worldPointToLocal(worldOrigin);
  const localViewPoint = worldPointToLocal({ x: worldOrigin.x + worldViewDirection.x, y: worldOrigin.y + worldViewDirection.y, z: worldOrigin.z + worldViewDirection.z });
  const dx = localViewPoint.x - localOrigin.x;
  const dz = localViewPoint.z - localOrigin.z;
  if (Math.abs(dx) >= Math.abs(dz)) return dx >= 0 ? "east" : "west";
  return dz >= 0 ? "south" : "north";
}
function isFiniteVector2(value) {
  return Number.isFinite(value.x) && Number.isFinite(value.y) && Number.isFinite(value.z);
}

// sable/packs/SableBP/scripts/sable/content/punching/SubLevelBlockPermissions.js
import {
  GameMode
} from "@minecraft/server";
function canBreakSubLevelBlock(gameMode, blockTypeId, itemIsSword, adventureCanDestroy) {
  if (gameMode === GameMode.Spectator) return false;
  if (gameMode === GameMode.Adventure) return blockListContains(adventureCanDestroy, blockTypeId);
  return gameMode !== GameMode.Creative || !itemIsSword;
}
function canPlaceSubLevelBlock(gameMode, supportBlockTypeId, adventureCanPlaceOn) {
  if (gameMode === GameMode.Spectator) return false;
  return gameMode !== GameMode.Adventure || blockListContains(adventureCanPlaceOn, supportBlockTypeId);
}
function damageSelectedToolForSubLevelBreak(player, usedItem, random = Math.random) {
  if (!usedItem || player.getGameMode() === GameMode.Creative) return "unchanged";
  const container = requirePlayerContainer(player, " for tool durability");
  const selectedSlot = player.selectedSlotIndex;
  const selectedItem2 = container.getItem(selectedSlot);
  if (!selectedItem2 || selectedItem2.typeId !== usedItem.typeId) {
    throw new Error(`Player ${player.id}'s selected item changed before durability was applied.`);
  }
  const durability = selectedItem2.getComponent("minecraft:durability");
  if (!durability || durability.unbreakable) return "unchanged";
  const unbreakingLevel = selectedItem2.getComponent("minecraft:enchantable")?.getEnchantment("minecraft:unbreaking")?.level ?? 0;
  if (random() * 100 >= durability.getDamageChance(unbreakingLevel)) return "unchanged";
  if (durability.damage + 1 >= durability.maxDurability) {
    container.setItem(selectedSlot, void 0);
    player.playSound("random.break", { pitch: 0.9, volume: 1 });
    return "broken";
  }
  durability.damage += 1;
  container.setItem(selectedSlot, selectedItem2);
  return "damaged";
}
function canPlayerBreakSubLevelBlock(player, itemStack, blockTypeId) {
  return canBreakSubLevelBlock(player.getGameMode(), blockTypeId, itemStack?.hasTag("minecraft:is_sword") === true, itemStack?.getCanDestroy() ?? []);
}
function canPlayerPlaceSubLevelBlock(player, itemStack, supportBlockTypeId) {
  return canPlaceSubLevelBlock(player.getGameMode(), supportBlockTypeId, itemStack.getCanPlaceOn());
}
function blockListContains(blocks, blockTypeId) {
  const normalizedTarget = withMinecraftNamespace(blockTypeId);
  return blocks.some((value) => withMinecraftNamespace(value) === normalizedTarget);
}
function withMinecraftNamespace(typeId) {
  return typeId.includes(":") ? typeId : `minecraft:${typeId}`;
}
function requirePlayerContainer(player, purpose = "") {
  const container = player.getComponent("minecraft:inventory")?.container;
  if (!container) throw new Error(`Player ${player.id} has no inventory container${purpose}.`);
  return container;
}

// sable/packs/SableBP/scripts/sable/content/punching/SubLevelMiningTime.js
var HARVEST_DIVISOR = 30;
var AXE_SPEEDS = {
  "minecraft:copper_axe": 5,
  "minecraft:diamond_axe": 8,
  "minecraft:golden_axe": 12,
  "minecraft:iron_axe": 6,
  "minecraft:netherite_axe": 9,
  "minecraft:stone_axe": 4,
  "minecraft:wooden_axe": 2
};
var IRON_GOLEM_MINING_HEALTH = 100;
var IRON_BLOCK_HARDNESS = 5;
var PUMPKIN_HARDNESS = 1;
var REFERENCE_TOOL_PROFILE = { efficiencyLevel: 0 };
var IRON_GOLEM_REFERENCE_BREAK_TICKS = 4 * getVanillaBlockBreakTicks(IRON_BLOCK_HARDNESS, REFERENCE_TOOL_PROFILE) + getVanillaBlockBreakTicks(PUMPKIN_HARDNESS, REFERENCE_TOOL_PROFILE);
var PC_ATTACK_EQUIVALENT_TICKS = IRON_GOLEM_REFERENCE_BREAK_TICKS / IRON_GOLEM_MINING_HEALTH;
function getSubLevelToolProfile(itemStack) {
  let efficiencyLevel = 0;
  try {
    efficiencyLevel = itemStack?.getComponent("minecraft:enchantable")?.getEnchantment("minecraft:efficiency")?.level ?? 0;
  } catch {
  }
  return {
    efficiencyLevel: normalizeEfficiencyLevel(efficiencyLevel),
    typeId: itemStack?.typeId
  };
}
function getSubLevelMiningTargetTicks(hardness, itemStack) {
  return getVanillaBlockBreakTicks(hardness, getSubLevelToolProfile(itemStack));
}
function getVanillaBlockBreakTicks(hardness, profile) {
  const axeSpeed = profile.typeId ? AXE_SPEEDS[profile.typeId] : void 0;
  let speed = axeSpeed ?? 1;
  if (axeSpeed !== void 0 && profile.efficiencyLevel > 0) {
    speed += profile.efficiencyLevel * profile.efficiencyLevel + 1;
  }
  return Math.ceil(Math.max(0, hardness) * HARVEST_DIVISOR / speed);
}
function normalizeEfficiencyLevel(value) {
  return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}

// sable/packs/SableBP/scripts/sable/content/punching/SubLevelMiningProgress.js
var PLAYER_EDIT_MINING_RESET_TICKS = 10;
var MINING_STAGE_COUNT = 10;
var FINAL_MINING_STAGE = MINING_STAGE_COUNT - 1;
var COMPLETION_EPSILON = 1e-9;
var SubLevelMiningProgress = class {
  #lastTouchSignalByPlayer = /* @__PURE__ */ new Map();
  #progress = /* @__PURE__ */ new Map();
  advance(key, currentTick, targetBreakTicks, input) {
    const normalizedTargetTicks = normalizeTargetBreakTicks(targetBreakTicks);
    let contributionTicks = PC_ATTACK_EQUIVALENT_TICKS;
    if (input.type === "touch") {
      const lastSignal = this.#lastTouchSignalByPlayer.get(input.playerId);
      if (lastSignal?.tick === currentTick) return void 0;
      contributionTicks = lastSignal && lastSignal.key === key && currentTick > lastSignal.tick && currentTick - lastSignal.tick <= PLAYER_EDIT_MINING_RESET_TICKS ? currentTick - lastSignal.tick : 0;
      this.#lastTouchSignalByPlayer.set(input.playerId, { key, tick: currentTick });
    }
    const previous = this.#progress.get(key);
    const state = previous && currentTick - previous.lastProgressTick <= PLAYER_EDIT_MINING_RESET_TICKS ? previous : { lastProgressTick: currentTick, progress: 0 };
    const previousStage = previous === state ? progressStage(state.progress) : -1;
    state.progress += contributionTicks / normalizedTargetTicks;
    state.lastProgressTick = currentTick;
    if (state.progress >= 1 - COMPLETION_EPSILON) {
      this.#progress.delete(key);
      return {
        completed: true,
        progress: 1,
        stage: FINAL_MINING_STAGE,
        stageChanged: previousStage !== FINAL_MINING_STAGE
      };
    }
    this.#progress.set(key, state);
    return toProgressUpdate(state, previousStage);
  }
  clearSubLevel(subLevelId) {
    const prefix = `${subLevelId}|`;
    for (const key of this.#progress.keys()) {
      if (key.startsWith(prefix)) this.#progress.delete(key);
    }
  }
  clearPlayer(playerId) {
    this.#lastTouchSignalByPlayer.delete(playerId);
  }
  prune(currentTick) {
    if (this.#progress.size === 0) return;
    for (const [key, state] of this.#progress) {
      if (currentTick - state.lastProgressTick > PLAYER_EDIT_MINING_RESET_TICKS) {
        this.#progress.delete(key);
      }
    }
  }
};
function normalizeTargetBreakTicks(value) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError("Sub-level target break ticks must be a positive finite number.");
  }
  return value;
}
function toProgressUpdate(state, previousStage) {
  const stage = progressStage(state.progress);
  return {
    completed: false,
    progress: state.progress,
    stage,
    stageChanged: stage !== previousStage
  };
}
function progressStage(progress) {
  return Math.min(FINAL_MINING_STAGE, Math.floor(progress * MINING_STAGE_COUNT));
}

// sable/packs/SableBP/scripts/sable/content/block_placement/SubLevelInteractionTargetBlock.js
import {
  BlockPermutation as BlockPermutation2,
  system as system6
} from "@minecraft/server";
var INTERACTION_TARGET_BLOCK_TYPE_ID = "sable:interaction_target";
var INTERACTION_TARGET_COMPONENT_ID = "sable:interaction_target_cleanup";
var WATER_KIND_STATE = "sable:water_kind";
var WATER_DEPTH_STATE = "sable:water_depth";
var TARGET_OFFSET_AXIS_STEPS = 4;
var TARGET_LOCATION_EPSILON = 1e-7;
var TARGET_OFFSET_VALUES = [-1, -1 / 3, 1 / 3, 1];
var WATER_KIND_TYPE_IDS = [
  void 0,
  "minecraft:water",
  "minecraft:flowing_water"
];
var SubLevelInteractionTargetBlockController = class {
  #activeCells = /* @__PURE__ */ new Map();
  #cellByPlayer = /* @__PURE__ */ new Map();
  #syncStateByPlayer = /* @__PURE__ */ new Map();
  #started = false;
  start() {
    if (this.#started) return;
    this.#started = true;
    system6.beforeEvents.startup.subscribe((event) => {
      event.blockComponentRegistry.registerCustomComponent(
        INTERACTION_TARGET_COMPONENT_ID,
        {
          onTick: (tickEvent) => {
            const key = targetCellKey(
              tickEvent.dimension.id,
              tickEvent.block.location
            );
            if (!this.#activeCells.has(key)) restoreOrphanInteractionTargetBlock(tickEvent.block);
          }
        }
      );
    });
  }
  isManagedBlock(dimension, block) {
    const record = this.#activeCells.get(targetCellKey(dimension.id, block.location));
    return record?.targetBlockTypeId === block.typeId;
  }
  syncPlayer(playerId, dimension, playerHead, hitLocation, direction, useHeadAnchor) {
    const sourceLocation = blockLocation({
      x: hitLocation.x - direction.x * TARGET_LOCATION_EPSILON,
      y: hitLocation.y - direction.y * TARGET_LOCATION_EPSILON,
      z: hitLocation.z - direction.z * TARGET_LOCATION_EPSILON
    });
    const proxyLocation = useHeadAnchor ? blockLocation(playerHead) : findRayTargetOffset(playerHead, direction, sourceLocation);
    if (!proxyLocation) {
      this.releasePlayer(playerId);
      return;
    }
    const syncState = {
      dimensionId: dimension.id,
      sourceLocation,
      proxyLocation,
      direction: { ...direction }
    };
    const currentKey = this.#cellByPlayer.get(playerId);
    const current = currentKey ? this.#activeCells.get(currentKey) : void 0;
    if (current && targetSyncStatesEqual(this.#syncStateByPlayer.get(playerId), syncState) && dimension.getBlock(current.proxyLocation)?.typeId === current.targetBlockTypeId) return;
    const candidate = this.#findAvailableCandidate(dimension, proxyLocation);
    const candidateLocation = candidate?.location;
    const nextKey = candidateLocation ? targetCellKey(dimension.id, candidateLocation) : void 0;
    if (currentKey === nextKey && current && vectorsEqual2(current.sourceLocation, sourceLocation)) {
      if (!nextKey || candidate?.block.typeId === current?.targetBlockTypeId) {
        this.#syncStateByPlayer.set(playerId, syncState);
        return;
      }
    }
    this.releasePlayer(playerId);
    if (!candidate || !candidateLocation || !nextKey) return;
    let shared = this.#activeCells.get(nextKey);
    if (shared && candidate.block.typeId !== shared.targetBlockTypeId) {
      this.#discardOwnership(nextKey, shared);
      shared = void 0;
    }
    if (shared) {
      if (!vectorsEqual2(shared.sourceLocation, sourceLocation)) return;
      shared.holders.add(playerId);
      this.#cellByPlayer.set(playerId, nextKey);
      this.#syncStateByPlayer.set(playerId, syncState);
      return;
    }
    const block = candidate.block;
    if (!isReplaceableTargetSource(block)) return;
    const water = block.isAir ? { depth: 0, kind: 0 } : getSourceWaterState(block);
    const record = {
      dimension,
      holders: /* @__PURE__ */ new Set([playerId]),
      sourceLocation: { ...sourceLocation },
      proxyLocation: { ...candidateLocation },
      originalPermutation: block.permutation,
      targetBlockTypeId: INTERACTION_TARGET_BLOCK_TYPE_ID,
      waterDepth: water.depth,
      waterKind: water.kind
    };
    setInteractionTargetPermutation(block, water);
    this.#activeCells.set(nextKey, record);
    this.#cellByPlayer.set(playerId, nextKey);
    this.#syncStateByPlayer.set(playerId, syncState);
  }
  releasePlayer(playerId) {
    this.#syncStateByPlayer.delete(playerId);
    const key = this.#cellByPlayer.get(playerId);
    if (!key) return;
    this.#cellByPlayer.delete(playerId);
    const record = this.#activeCells.get(key);
    if (!record) {
      throw new Error(`Missing active interaction-target cell for player ${playerId}.`);
    }
    record.holders.delete(playerId);
    if (record.holders.size !== 0) return;
    this.#activeCells.delete(key);
    const block = record.dimension.getBlock(record.proxyLocation);
    if (block?.typeId !== record.targetBlockTypeId) return;
    block.setPermutation(record.originalPermutation);
  }
  /** Resolve exactly one requested cell; occupied cells do not search their neighbors. */
  #findAvailableCandidate(dimension, location) {
    const block = dimension.getBlock(location);
    if (!block) return void 0;
    const key = targetCellKey(dimension.id, location);
    let active = this.#activeCells.get(key);
    if (active && active.targetBlockTypeId !== block.typeId) {
      this.#discardOwnership(key, active);
      active = void 0;
    }
    if (!isReplaceableTargetSource(block) && active?.targetBlockTypeId !== block.typeId) {
      return void 0;
    }
    return { block, location };
  }
  #discardOwnership(key, record) {
    this.#activeCells.delete(key);
    for (const playerId of record.holders) {
      if (this.#cellByPlayer.get(playerId) === key) this.#cellByPlayer.delete(playerId);
      this.#syncStateByPlayer.delete(playerId);
    }
  }
};
function targetSyncStatesEqual(left, right) {
  return left !== void 0 && left.dimensionId === right.dimensionId && vectorsEqual2(left.sourceLocation, right.sourceLocation) && vectorsEqual2(left.proxyLocation, right.proxyLocation) && vectorsEqual2(left.direction, right.direction);
}
function blockLocation(point) {
  return {
    x: Math.floor(point.x),
    y: Math.floor(point.y),
    z: Math.floor(point.z)
  };
}
function restoreOrphanInteractionTargetBlock(block) {
  if (block.typeId !== INTERACTION_TARGET_BLOCK_TYPE_ID) return;
  const states = block.permutation.getAllStates();
  const kind = states[WATER_KIND_STATE];
  const depth = states[WATER_DEPTH_STATE];
  if (typeof kind !== "number" || !Number.isInteger(kind) || kind < 0 || kind > 2) {
    throw new Error(`Invalid interaction-target water kind: ${String(kind)}.`);
  }
  if (typeof depth !== "number" || !Number.isInteger(depth) || depth < 0 || depth > 15) {
    throw new Error(`Invalid interaction-target water depth: ${String(depth)}.`);
  }
  const typeId = WATER_KIND_TYPE_IDS[kind];
  if (typeId === void 0) {
    block.setType("minecraft:air");
    return;
  }
  block.setPermutation(BlockPermutation2.resolve(typeId, { liquid_depth: depth }));
}
function isReplaceableTargetSource(block) {
  return block.isAir || WATER_KIND_TYPE_IDS.includes(block.typeId);
}
function getSourceWaterState(block) {
  const depth = block.permutation.getAllStates().liquid_depth;
  if (typeof depth !== "number" || !Number.isInteger(depth) || depth < 0 || depth > 15) {
    throw new Error(`${block.typeId} has an invalid liquid_depth state: ${String(depth)}.`);
  }
  return {
    depth,
    // The single caller filters through isReplaceableTargetSource first, so the
    // type id is always present in the table (kind 1 or 2).
    kind: WATER_KIND_TYPE_IDS.indexOf(block.typeId)
  };
}
function findInteractionProxyLocation(origin, direction, sourceLocation) {
  const exitDistance = raySelectionLength(
    origin,
    direction,
    sourceLocation,
    0,
    0,
    0
  );
  return blockLocation({
    x: origin.x + direction.x * (exitDistance + TARGET_LOCATION_EPSILON),
    y: origin.y + direction.y * (exitDistance + TARGET_LOCATION_EPSILON),
    z: origin.z + direction.z * (exitDistance + TARGET_LOCATION_EPSILON)
  });
}
function findRayTargetOffset(origin, direction, location) {
  const originInsideSource = isTargetBoxContainingPoint(origin, location, 0, 0, 0);
  if (!originInsideSource && raySelectionLength(origin, direction, location, 0, 0, 0) >= 0) return { ...location };
  let bestLength = -1;
  for (let z = 0; z < TARGET_OFFSET_AXIS_STEPS; z++) {
    for (let y = 0; y < TARGET_OFFSET_AXIS_STEPS; y++) {
      for (let x = 0; x < TARGET_OFFSET_AXIS_STEPS; x++) {
        const offsetX = TARGET_OFFSET_VALUES[x];
        const offsetY = TARGET_OFFSET_VALUES[y];
        const offsetZ = TARGET_OFFSET_VALUES[z];
        if (isTargetBoxContainingPoint(origin, location, offsetX, offsetY, offsetZ)) continue;
        const length = raySelectionLength(
          origin,
          direction,
          location,
          offsetX,
          offsetY,
          offsetZ
        );
        if (length > bestLength) {
          bestLength = length;
        }
      }
    }
  }
  if (bestLength < 0) return void 0;
  return originInsideSource ? findInteractionProxyLocation(origin, direction, location) : { ...location };
}
function isTargetBoxContainingPoint(point, location, offsetX, offsetY, offsetZ) {
  return point.x > location.x + offsetX && point.x < location.x + offsetX + 1 && point.y > location.y + offsetY && point.y < location.y + offsetY + 1 && point.z > location.z + offsetZ && point.z < location.z + offsetZ + 1;
}
function raySelectionLength(origin, direction, location, offsetX, offsetY, offsetZ) {
  let entry = Number.NEGATIVE_INFINITY;
  let exit = Number.POSITIVE_INFINITY;
  const minimumX = location.x + offsetX;
  const maximumX = minimumX + 1;
  if (Math.abs(direction.x) < EPSILON_1E8) {
    if (origin.x < minimumX || origin.x > maximumX) return -1;
  } else {
    const first = (minimumX - origin.x) / direction.x;
    const second = (maximumX - origin.x) / direction.x;
    entry = Math.max(entry, Math.min(first, second));
    exit = Math.min(exit, Math.max(first, second));
    if (exit < entry) return -1;
  }
  const minimumY = location.y + offsetY;
  const maximumY = minimumY + 1;
  if (Math.abs(direction.y) < EPSILON_1E8) {
    if (origin.y < minimumY || origin.y > maximumY) return -1;
  } else {
    const first = (minimumY - origin.y) / direction.y;
    const second = (maximumY - origin.y) / direction.y;
    entry = Math.max(entry, Math.min(first, second));
    exit = Math.min(exit, Math.max(first, second));
    if (exit < entry) return -1;
  }
  const minimumZ = location.z + offsetZ;
  const maximumZ = minimumZ + 1;
  if (Math.abs(direction.z) < EPSILON_1E8) {
    if (origin.z < minimumZ || origin.z > maximumZ) return -1;
  } else {
    const first = (minimumZ - origin.z) / direction.z;
    const second = (maximumZ - origin.z) / direction.z;
    entry = Math.max(entry, Math.min(first, second));
    exit = Math.min(exit, Math.max(first, second));
    if (exit < entry) return -1;
  }
  const forwardEntry = Math.max(entry, 0);
  return exit <= forwardEntry + EPSILON_1E8 ? -1 : exit - forwardEntry;
}
function setInteractionTargetPermutation(block, water) {
  block.setPermutation(BlockPermutation2.resolve(INTERACTION_TARGET_BLOCK_TYPE_ID, {
    [WATER_DEPTH_STATE]: water.depth,
    [WATER_KIND_STATE]: water.kind
  }));
  if (water.kind !== 0) block.setWaterlogged(true);
}
function targetCellKey(dimensionId, location) {
  return `${dimensionId}|${location.x},${location.y},${location.z}`;
}

// sable/packs/SableBP/scripts/sable/content/block_outline_render/SubLevelOutlineController.js
var BLOCK_OUTLINE_ENTITY_TYPE_ID = "sable:block_outline";
var BLOCK_CRACK_ENTITY_TYPE_ID = "sable:block_crack";
var OUTLINE_VISIBLE_PROPERTY = "sable:visible";
var OUTLINE_BLOCK_PREVIEW_PROPERTY = "sable:block_preview";
var OUTLINE_PREVIEW_X_PROPERTY = "sable:preview_x";
var OUTLINE_PREVIEW_Y_PROPERTY = "sable:preview_y";
var OUTLINE_PREVIEW_Z_PROPERTY = "sable:preview_z";
var OUTLINE_PREVIEW_SIDE_PROPERTY = "sable:preview_side";
var BREAK_OVERLAY_PITCH_PROPERTY = "sable:pitch";
var BREAK_OVERLAY_YAW_PROPERTY = "sable:yaw";
var BREAK_OVERLAY_ROLL_PROPERTY = "sable:roll";
var BREAK_OVERLAY_STAGE_PROPERTY = "sable:break_stage";
var INTERACTION_REACH = 5;
var WORLD_BLOCK_OCCLUSION_EPSILON = 0.05;
var OUTLINE_FADE_TICKS = 5;
var INITIAL_OUTLINE_REVEAL_DELAY_TICKS = 4;
var OUTLINE_ENTITY_READY_DELAY_TICKS = 2;
var BREAK_OVERLAY_INITIAL_POSE_DELAY_TICKS = 1;
var DEFAULT_BLOCK_HARDNESS = 1;
var SubLevelOutlineController = class {
  #players;
  #runtime;
  #records = /* @__PURE__ */ new Map();
  #breakOverlays = /* @__PURE__ */ new Map();
  #states = /* @__PURE__ */ new Map();
  #interactionTargets = new SubLevelInteractionTargetBlockController();
  #trackedEntityIds = /* @__PURE__ */ new Set();
  #miningProgress = new SubLevelMiningProgress();
  #startupCleanupComplete = false;
  #startupCleanupScheduled = false;
  #breakHandler;
  #miningEffectHandler;
  #placeHandler;
  #placementEffectHandler;
  #interactionTargetSuppressor;
  constructor(runtime, players) {
    this.#runtime = runtime;
    this.#players = players;
  }
  setBreakHandler(handler) {
    this.#breakHandler = handler;
  }
  setMiningEffectHandler(handler) {
    this.#miningEffectHandler = handler;
  }
  setPlaceHandler(handler) {
    this.#placeHandler = handler;
  }
  setPlacementEffectHandler(handler) {
    this.#placementEffectHandler = handler;
  }
  setInteractionTargetSuppressor(suppressor) {
    this.#interactionTargetSuppressor = suppressor;
  }
  markInteractionTargetDirty(playerId) {
    const state = this.#states.get(playerId);
    if (state) state.interactionTargetDirty = true;
  }
  start() {
    if (this.#startupCleanupScheduled) return;
    this.#startupCleanupScheduled = true;
    this.#interactionTargets.start();
    system7.run(() => {
      for (const dimensionId of VANILLA_DIMENSION_IDS) {
        const dimension = world6.getDimension(dimensionId);
        for (const typeId of [
          BLOCK_OUTLINE_ENTITY_TYPE_ID,
          BLOCK_CRACK_ENTITY_TYPE_ID
        ]) {
          for (const entity of dimension.getEntities({ type: typeId })) {
            if (entity.isValid) entity.remove();
          }
        }
      }
      this.#startupCleanupComplete = true;
    });
  }
  tick(currentTick) {
    if (!this.#startupCleanupComplete) return;
    this.#miningProgress.prune(currentTick);
    this.#tickBreakOverlays(currentTick);
    const tickedPlayerIds = /* @__PURE__ */ new Set();
    for (const player of this.#players.players()) {
      tickedPlayerIds.add(player.id);
      this.#tickPlayer(player, currentTick);
    }
    for (const playerId of this.#states.keys()) {
      if (!tickedPlayerIds.has(playerId)) this.clearPlayer(playerId, false);
    }
    this.#finishFades(currentTick);
  }
  captureActionTarget(player) {
    if (!this.#startupCleanupComplete) return void 0;
    const result = this.#raycastForEvent(player);
    return result ? actionTargetFromResult(result) : void 0;
  }
  isManagedInteractionTarget(dimension, block) {
    return this.#interactionTargets.isManagedBlock(dimension, block);
  }
  handleBreak(player, itemStack, expected) {
    if (!this.#startupCleanupComplete) return;
    const result = this.#validatedActionResult(player, expected);
    if (!result) return;
    if (!canPlayerBreakSubLevelBlock(player, itemStack, result.hit.block.typeId)) return;
    const hardness = getSubLevelBlockRegistration(result.hit.block.typeId)?.hardness ?? DEFAULT_BLOCK_HARDNESS;
    const targetKey = blockLocationKey(result.hit.block.localLocation);
    const progress = this.#miningProgress.advance(
      `${result.handle.id}|${targetKey}`,
      system7.currentTick,
      getSubLevelMiningTargetTicks(hardness, itemStack),
      player.inputInfo.lastInputModeUsed === InputMode.Touch ? { playerId: player.id, type: "touch" } : { type: "attack" }
    );
    if (!progress) return;
    if (!progress.completed) {
      this.#setSharedMiningStage(result.handle, result.hit.block, progress.stage);
    }
    if (!progress.completed && progress.stageChanged) {
      if (!this.#miningEffectHandler) {
        throw new Error("Sub-level block mining effect handler is not configured.");
      }
      this.#miningEffectHandler(result.handle, result.hit.block);
    }
    if (!progress.completed) return;
    this.#clearSharedMiningStage(result.handle.id, targetKey);
    if (!this.#breakHandler) {
      throw new Error("Sub-level block break handler is not configured.");
    }
    if (this.#breakHandler(player, itemStack, result.handle, result.hit.block)) {
      damageSelectedToolForSubLevelBreak(player, itemStack);
      this.#miningProgress.clearSubLevel(String(result.handle.id));
      this.#clearSubLevelBreakOverlays(result.handle.id);
    }
  }
  handlePlace(player, itemStack, expected) {
    if (!this.#startupCleanupComplete || !BlockTypes.get(itemStack.typeId)) return;
    const result = this.#validatedActionResult(player, expected);
    if (!result) return;
    if (!canPlayerPlaceSubLevelBlock(player, itemStack, result.hit.block.typeId)) return;
    if (!result.handle.supportsBlockPlacement) return;
    const placement = this.#getPlacementTarget(result, itemStack);
    if (!placement) return;
    if (isPlayerHeadInsideSubLevelPlacement(
      player.getHeadLocation(),
      placement,
      (point) => result.handle.worldPointToLocal(point)
    )) return;
    if (!this.#placeHandler) {
      throw new Error("Sub-level block place handler is not configured.");
    }
    const cardinalDirection = resolvePlacementCardinalDirection(
      (point) => result.handle.worldPointToLocal(point),
      result.origin,
      result.direction
    );
    const consumed = consumeSelectedBlock(player, itemStack);
    let placed;
    try {
      placed = this.#placeHandler(
        player,
        itemStack,
        result.handle,
        result.hit.block,
        placement,
        cardinalDirection
      );
    } catch (error) {
      restoreSelectedBlock(player, consumed);
      throw error;
    }
    if (!placed) {
      restoreSelectedBlock(player, consumed);
      return;
    }
    const placedBlock = result.handle.getBlockAtLocalLocation(placement);
    if (!placedBlock || placedBlock.typeId !== itemStack.typeId) {
      throw new Error(`Placed sub-level block ${itemStack.typeId} is unavailable for effects.`);
    }
    if (!this.#placementEffectHandler) {
      throw new Error("Sub-level block placement effect handler is not configured.");
    }
    this.#placementEffectHandler(result.handle, placedBlock);
  }
  clearPlayer(playerId, immediate) {
    this.#miningProgress.clearPlayer(playerId);
    const state = this.#states.get(playerId);
    if (state) this.#clearInteractionTargets(playerId);
    if (state?.activeSubLevelId !== void 0) {
      this.#releaseViewer(playerId, state.activeSubLevelId, immediate);
    }
    this.#states.delete(playerId);
  }
  /** Remove outline entities left by a script reload, while retaining entities created this tick. */
  handleEntityLoad(entity) {
    if (entity.typeId !== BLOCK_OUTLINE_ENTITY_TYPE_ID && entity.typeId !== BLOCK_CRACK_ENTITY_TYPE_ID) return;
    system7.run(() => {
      if (entity.isValid && !this.#trackedEntityIds.has(entity.id)) entity.remove();
    });
  }
  #tickPlayer(player, currentTick) {
    if (!this.#canPreview(player)) {
      this.clearPlayer(player.id, false);
      return;
    }
    const state = this.#states.get(player.id) ?? {
      lastRayTick: currentTick - RAY_REFRESH_TICKS
    };
    this.#states.set(player.id, state);
    let direction;
    let origin;
    try {
      direction = normalizeFinite(player.getViewDirection());
      origin = player.getHeadLocation();
    } catch {
      this.clearPlayer(player.id, true);
      return;
    }
    const viewChanged = state.lastDirection !== void 0 && hasViewDirectionChanged(state.lastDirection, direction) || state.lastOrigin !== void 0 && !vectorComponentsEqual(state.lastOrigin, origin);
    state.lastDirection = direction;
    state.lastOrigin = origin;
    const subLevelMoving = state.rayCache?.result?.handle.isMoving === true || state.rayCache?.raycastRevision !== this.#runtime.getRaycastRevision(player.dimension.id);
    const refresh = shouldRefreshOutlineRay(
      state.mode,
      currentTick - state.lastRayTick,
      viewChanged,
      subLevelMoving
    );
    if (refresh) {
      state.rayCache = {
        raycastRevision: this.#runtime.getRaycastRevision(player.dimension.id),
        result: this.#raycastPlayerSubLevels(player, origin, direction),
        tick: currentTick
      };
      state.lastRayTick = currentTick;
    }
    const result = state.rayCache?.result;
    if (!result) {
      this.#clearInteractionTargets(player.id);
      if (state.activeSubLevelId !== void 0) {
        this.#releaseViewer(player.id, state.activeSubLevelId, false);
      }
      state.activeSubLevelId = void 0;
      state.mode = void 0;
      state.shapeSignature = void 0;
      return;
    }
    this.#syncInteractionTargets(player, result, refresh || state.interactionTargetDirty === true);
    state.interactionTargetDirty = false;
    const targetKey = blockLocationKey(result.hit.block.localLocation);
    if (state.activeSubLevelId !== result.handle.id) {
      if (state.activeSubLevelId !== void 0) {
        this.#releaseViewer(player.id, state.activeSubLevelId, false);
      }
      if (!this.#acquireViewer(player, result.handle)) {
        this.#clearInteractionTargets(player.id);
        return;
      }
      state.activeSubLevelId = result.handle.id;
      state.targetBlockKey = targetKey;
      state.mode = "block";
      state.shapeSignature = void 0;
    } else if (state.targetBlockKey !== targetKey) {
      state.targetBlockKey = targetKey;
      state.shapeSignature = void 0;
    }
    this.#updateViewerShape(player, state, result);
    this.#revealViewer(player, state, result.handle.id);
  }
  #acquireViewer(player, handle) {
    let record = this.#records.get(handle.id);
    const created = record === void 0;
    if (!record) {
      let entity;
      try {
        entity = handle.dimension.spawnEntity(
          BLOCK_OUTLINE_ENTITY_TYPE_ID,
          handle.outlineAnchorLocation
        );
      } catch {
        return false;
      }
      if (!handle.attachOutlineEntity(entity)) {
        if (entity.isValid) entity.remove();
        return false;
      }
      record = {
        handle,
        contentRevision: handle.contentRevision,
        entity,
        readyTick: system7.currentTick + OUTLINE_ENTITY_READY_DELAY_TICKS,
        viewers: /* @__PURE__ */ new Map()
      };
      this.#records.set(handle.id, record);
      this.#trackedEntityIds.add(entity.id);
    }
    record.viewers.set(player.id, {
      revealTick: created ? record.readyTick + INITIAL_OUTLINE_REVEAL_DELAY_TICKS : system7.currentTick + 1,
      revealed: false
    });
    try {
      player.setPropertyOverrideForEntity(record.entity, OUTLINE_VISIBLE_PROPERTY, false);
    } catch {
      record.viewers.delete(player.id);
      this.#destroyRecordIfUnused(record);
      return false;
    }
    return true;
  }
  #releaseViewer(playerId, subLevelId, immediate) {
    const record = this.#records.get(subLevelId);
    if (!record) return;
    const viewer = record.viewers.get(playerId);
    if (!viewer) return;
    const player = this.#players.get(playerId);
    if (player && record.entity.isValid) {
      try {
        player.setPropertyOverrideForEntity(record.entity, OUTLINE_VISIBLE_PROPERTY, false);
      } catch {
        immediate = true;
      }
    }
    if (!immediate) {
      viewer.fadeEndTick = system7.currentTick + OUTLINE_FADE_TICKS;
      return;
    }
    if (player && record.entity.isValid) {
      clearOverridesQuietly(player, record.entity);
    }
    record.viewers.delete(playerId);
    this.#destroyRecordIfUnused(record);
  }
  #revealViewer(player, state, subLevelId) {
    const record = this.#records.get(subLevelId);
    const viewer = record?.viewers.get(player.id);
    if (!record?.entity.isValid || !viewer || viewer.revealed || state.shapeSignature === void 0 || system7.currentTick < viewer.revealTick) return;
    player.setPropertyOverrideForEntity(record.entity, OUTLINE_VISIBLE_PROPERTY, true);
    viewer.revealed = true;
  }
  #finishFades(currentTick) {
    if (this.#records.size === 0) return;
    for (const record of this.#records.values()) {
      if (!record.handle.isValid || !record.entity.isValid) {
        this.#destroyRecord(record);
        continue;
      }
      for (const [playerId, viewer] of record.viewers) {
        if (viewer.fadeEndTick === void 0 || currentTick < viewer.fadeEndTick) continue;
        const player = this.#players.get(playerId);
        if (player) {
          clearOverridesQuietly(player, record.entity);
        }
        record.viewers.delete(playerId);
      }
      this.#destroyRecordIfUnused(record);
    }
  }
  #destroyRecordIfUnused(record) {
    if (record.viewers.size === 0) this.#destroyRecord(record);
  }
  #destroyRecord(record) {
    this.#records.delete(record.handle.id);
    this.#trackedEntityIds.delete(record.entity.id);
    for (const [playerId] of record.viewers) {
      const player = this.#players.get(playerId);
      if (player && record.entity.isValid) {
        clearOverridesQuietly(player, record.entity);
      }
      const state = this.#states.get(playerId);
      if (state?.activeSubLevelId === record.handle.id) {
        this.#clearInteractionTargets(playerId);
        state.activeSubLevelId = void 0;
        state.mode = void 0;
        state.shapeSignature = void 0;
      }
    }
    record.viewers.clear();
    if (record.entity.isValid) {
      if (record.handle.isValid) record.handle.detachOutlineEntity(record.entity);
      if (record.entity.isValid) record.entity.remove();
    }
  }
  /** Keep the native block target aligned with the selected sub-level cell. */
  #syncInteractionTargets(player, result, refreshInteractionTarget) {
    if (player.inputInfo.lastInputModeUsed === InputMode.KeyboardAndMouse && !player.isSneaking && this.#interactionTargetSuppressor?.(result.handle, result.hit.block)) {
      this.#clearInteractionTargets(player.id);
      return;
    }
    if (refreshInteractionTarget) {
      this.#interactionTargets.syncPlayer(
        player.id,
        player.dimension,
        result.origin,
        result.hit.location,
        result.direction,
        player.inputInfo.lastInputModeUsed === InputMode.Touch
      );
    }
  }
  #setSharedMiningStage(handle, block, stage) {
    const targetKey = blockLocationKey(block.localLocation);
    const key = miningTargetKey(handle.id, targetKey);
    let record = this.#breakOverlays.get(key);
    if (record && (!record.handle.isValid || !record.entity.isValid)) {
      this.#destroyBreakOverlay(record);
      record = void 0;
    }
    if (!record) {
      const location = breakOverlayLocation(
        handle.localPointToWorld(block.localLocation)
      );
      const entity = handle.dimension.spawnEntity(
        BLOCK_CRACK_ENTITY_TYPE_ID,
        location
      );
      record = {
        handle,
        entity,
        key,
        lastLocation: { ...location },
        lastProgressTick: system7.currentTick,
        localLocation: { ...block.localLocation },
        readyTick: system7.currentTick + BREAK_OVERLAY_INITIAL_POSE_DELAY_TICKS,
        targetStage: stage
      };
      this.#breakOverlays.set(key, record);
      this.#trackedEntityIds.add(entity.id);
    }
    record.lastProgressTick = system7.currentTick;
    record.targetStage = stage;
    this.#syncBreakOverlay(record, system7.currentTick);
  }
  #tickBreakOverlays(currentTick) {
    if (this.#breakOverlays.size === 0) return;
    for (const record of this.#breakOverlays.values()) {
      if (currentTick - record.lastProgressTick > PLAYER_EDIT_MINING_RESET_TICKS || !record.handle.isValid || !record.entity.isValid || !record.handle.getBlockAtLocalLocation(record.localLocation)) {
        this.#destroyBreakOverlay(record);
        continue;
      }
      this.#syncBreakOverlay(record, currentTick);
    }
  }
  #syncBreakOverlay(record, currentTick) {
    const { handle, entity } = record;
    const location = breakOverlayLocation(
      handle.localPointToWorld(record.localLocation)
    );
    const rotation = handle.visualRotation;
    if (squaredDistance(record.lastLocation, location) > BREAK_OVERLAY_TRANSFORM_EPSILON_SQUARED) {
      entity.teleport(location);
      record.lastLocation = { ...location };
    }
    const publishingInitialPose = record.publishedStage === void 0 && currentTick >= record.readyTick;
    if (publishingInitialPose || !record.lastRotation || squaredDistance(record.lastRotation, rotation) > BREAK_OVERLAY_TRANSFORM_EPSILON_SQUARED) {
      entity.setProperty(BREAK_OVERLAY_PITCH_PROPERTY, rotation.x);
      entity.setProperty(BREAK_OVERLAY_YAW_PROPERTY, rotation.y);
      entity.setProperty(BREAK_OVERLAY_ROLL_PROPERTY, rotation.z);
      record.lastRotation = { ...rotation };
    }
    if (currentTick < record.readyTick || record.publishedStage === record.targetStage) return;
    entity.setProperty(BREAK_OVERLAY_STAGE_PROPERTY, record.targetStage);
    record.publishedStage = record.targetStage;
  }
  #destroyBreakOverlay(record) {
    this.#breakOverlays.delete(record.key);
    this.#trackedEntityIds.delete(record.entity.id);
    if (record.entity.isValid) record.entity.remove();
  }
  #clearSubLevelBreakOverlays(subLevelId) {
    for (const record of this.#breakOverlays.values()) {
      if (record.handle.id === subLevelId) this.#destroyBreakOverlay(record);
    }
  }
  #clearInteractionTargets(playerId) {
    this.#interactionTargets.releasePlayer(playerId);
  }
  #clearSharedMiningStage(subLevelId, targetKey) {
    const record = this.#breakOverlays.get(miningTargetKey(subLevelId, targetKey));
    if (record) this.#destroyBreakOverlay(record);
  }
  #updateViewerShape(player, state, result) {
    const record = this.#records.get(result.handle.id);
    if (!record?.entity.isValid) return;
    if (system7.currentTick < record.readyTick) return;
    if (record.contentRevision !== result.handle.contentRevision) {
      record.contentRevision = result.handle.contentRevision;
      state.shapeSignature = void 0;
    }
    const item = selectedItem(player);
    const target = result.hit.block.localLocation;
    const normal = result.hit.localNormal;
    const signature = `b|${record.contentRevision}:${blockLocationKey(target)}:${normal.x},${normal.y},${normal.z}:${item?.typeId ?? ""}`;
    if (signature === state.shapeSignature) return;
    const blockPlacement = item ? this.#getPlacementTarget(result, item) : void 0;
    const locations = blockPlacement ? [target, blockPlacement] : [target];
    const edges = createAabbOutline(locations);
    if (edges.length === 0) return;
    const preview = createBlockPreviewTransform(
      target,
      blockPlacement,
      result.handle.outlineAnchorLocal
    );
    player.setPropertyOverrideForEntity(record.entity, OUTLINE_BLOCK_PREVIEW_PROPERTY, true);
    player.setPropertyOverrideForEntity(record.entity, OUTLINE_PREVIEW_X_PROPERTY, preview.x);
    player.setPropertyOverrideForEntity(record.entity, OUTLINE_PREVIEW_Y_PROPERTY, preview.y);
    player.setPropertyOverrideForEntity(record.entity, OUTLINE_PREVIEW_Z_PROPERTY, preview.z);
    player.setPropertyOverrideForEntity(record.entity, OUTLINE_PREVIEW_SIDE_PROPERTY, preview.side);
    state.shapeSignature = signature;
  }
  #getPlacementTarget(result, itemStack) {
    if (!BlockTypes.get(itemStack.typeId)) return void 0;
    const target = {
      x: result.hit.block.localLocation.x + result.hit.localNormal.x,
      y: result.hit.block.localLocation.y + result.hit.localNormal.y,
      z: result.hit.block.localLocation.z + result.hit.localNormal.z
    };
    if (!Number.isInteger(target.x) || !Number.isInteger(target.y) || !Number.isInteger(target.z)) {
      throw new Error(`Sub-level placement target is not on the local block grid: ${blockLocationKey(target)}.`);
    }
    return result.handle.getBlockAtLocalLocation(target) ? void 0 : target;
  }
  #validatedActionResult(player, expected) {
    const result = this.#raycastForEvent(player);
    if (!result || expected && !actionTargetMatchesResult(expected, result)) return void 0;
    return result;
  }
  #raycastForEvent(player) {
    if (!this.#canPreview(player)) return void 0;
    const state = this.#states.get(player.id) ?? {
      lastRayTick: system7.currentTick - RAY_REFRESH_TICKS
    };
    this.#states.set(player.id, state);
    let direction;
    let origin;
    try {
      direction = normalizeFinite(player.getViewDirection());
      origin = player.getHeadLocation();
    } catch {
      return void 0;
    }
    if (state.rayCache?.tick === system7.currentTick && state.rayCache.raycastRevision === this.#runtime.getRaycastRevision(player.dimension.id) && state.lastDirection !== void 0 && !hasViewDirectionChanged(state.lastDirection, direction) && state.lastOrigin !== void 0 && vectorComponentsEqual(state.lastOrigin, origin)) return state.rayCache.result;
    const result = this.#raycastPlayerSubLevels(player, origin, direction);
    state.rayCache = {
      raycastRevision: this.#runtime.getRaycastRevision(player.dimension.id),
      result,
      tick: system7.currentTick
    };
    state.interactionTargetDirty = true;
    state.lastRayTick = system7.currentTick;
    state.lastDirection = direction;
    state.lastOrigin = origin;
    return result;
  }
  #raycastPlayerSubLevels(player, origin, direction) {
    if (!this.#runtime.hasSubLevels(player.dimension.id)) return void 0;
    let closest;
    for (const handle of this.#runtime.getRaycastCandidates(player.dimension.id)) {
      const hit = handle.raycast(origin, direction, INTERACTION_REACH, {
        skipContainingBlock: true
      });
      if (!hit || closest && hit.distance >= closest.hit.distance) continue;
      closest = { handle, direction, hit, origin };
    }
    if (!closest || worldBlockPrecedes(player, origin, direction, closest.hit.distance)) {
      return void 0;
    }
    return closest;
  }
  #canPreview(player) {
    try {
      return player.isValid && player.getGameMode() !== GameMode2.Spectator;
    } catch {
      return false;
    }
  }
};
function clearOverridesQuietly(player, entity) {
  try {
    player.clearPropertyOverridesForEntity(entity);
  } catch {
  }
}
function actionTargetFromResult(result) {
  return {
    subLevelId: result.handle.id,
    blockKey: blockLocationKey(result.hit.block.localLocation),
    face: result.hit.face
  };
}
function actionTargetMatchesResult(expected, result) {
  return expected.subLevelId === result.handle.id && expected.blockKey === blockLocationKey(result.hit.block.localLocation) && expected.face === result.hit.face;
}
function miningTargetKey(subLevelId, targetKey) {
  return `${subLevelId}|${targetKey}`;
}
function requirePlayerContainer2(player, purpose = "") {
  const container = player.getComponent("minecraft:inventory")?.container;
  if (!container) {
    throw new Error(`Player ${player.id} has no inventory container${purpose}.`);
  }
  return container;
}
function consumeSelectedBlock(player, usedItem) {
  if (player.getGameMode() === GameMode2.Creative) return void 0;
  const container = requirePlayerContainer2(player);
  const selected = container.getItem(player.selectedSlotIndex);
  if (!selected || selected.typeId !== usedItem.typeId || selected.amount <= 0) {
    throw new Error(`Player ${player.id}'s selected block changed before placement commit.`);
  }
  const previous = selected.clone();
  selected.amount -= 1;
  container.setItem(player.selectedSlotIndex, selected.amount > 0 ? selected : void 0);
  return previous;
}
function restoreSelectedBlock(player, previous) {
  if (!previous || player.getGameMode() === GameMode2.Creative) return;
  requirePlayerContainer2(player).setItem(player.selectedSlotIndex, previous);
}
function selectedItem(player) {
  try {
    return player.getComponent("minecraft:inventory")?.container?.getItem(player.selectedSlotIndex);
  } catch {
    return void 0;
  }
}
function worldBlockPrecedes(player, origin, direction, subLevelDistance) {
  try {
    const hit = player.getBlockFromViewDirection({
      includeLiquidBlocks: false,
      includePassableBlocks: false,
      maxDistance: INTERACTION_REACH
    });
    if (!hit) return false;
    const point = {
      x: hit.block.location.x + hit.faceLocation.x,
      y: hit.block.location.y + hit.faceLocation.y,
      z: hit.block.location.z + hit.faceLocation.z
    };
    const blockDistance = dot(subtract(point, origin), direction);
    return blockDistance >= 0 && blockDistance + WORLD_BLOCK_OCCLUSION_EPSILON < subLevelDistance;
  } catch {
    return false;
  }
}

// sable/packs/SableBP/scripts/sable/content/punching/SubLevelPlayerInteraction.js
var PLACE_ACTION_DEDUP_WINDOW_TICKS = 1;
var WORLD_OCCLUSION_PROBE_REACH = 7;
var SubLevelPlayerInteractionController = class {
  #lastPlaceActionByPlayer = /* @__PURE__ */ new Map();
  #lastTouchBlockInteractionTickByPlayer = /* @__PURE__ */ new Map();
  #pendingPlaceByPlayer = /* @__PURE__ */ new Map();
  #pendingTouchBreakByPlayer = /* @__PURE__ */ new Map();
  #raycastByPlayer = /* @__PURE__ */ new Map();
  #standingChestGestureTickByPlayer = /* @__PURE__ */ new Map();
  #players = new ActivePlayerRegistry();
  #runtime;
  #outlines;
  #interactionHandler;
  #started = false;
  constructor(runtime) {
    this.#runtime = runtime;
    this.#outlines = new SubLevelOutlineController(runtime, this.#players);
  }
  tick(currentTick) {
    this.#syncStandingInteractionTargets();
    this.#interactionHandler?.tick?.(currentTick);
    this.#outlines.tick(currentTick);
  }
  handleVisualEntityLoad(entity) {
    this.#outlines.handleEntityLoad(entity);
  }
  setBlockBreakHandler(handler) {
    this.#outlines.setBreakHandler(handler);
  }
  setBlockMiningEffectHandler(handler) {
    this.#outlines.setMiningEffectHandler(handler);
  }
  setBlockPlaceHandler(handler) {
    this.#outlines.setPlaceHandler(handler);
  }
  setBlockPlacementEffectHandler(handler) {
    this.#outlines.setPlacementEffectHandler(handler);
  }
  setBlockInteractHandler(handler) {
    this.#interactionHandler = handler;
    this.#outlines.setInteractionTargetSuppressor(
      (handle, block) => handler.canInteract(handle, block)
    );
  }
  start() {
    if (this.#started) return;
    this.#started = true;
    this.#players.start();
    this.#outlines.start();
    world7.beforeEvents.itemUse.subscribe((event) => this.#handleItemUse(event));
    world7.afterEvents.itemStartUse.subscribe((event) => {
      const { itemStack, source } = event;
      if (source.inputInfo.lastInputModeUsed !== InputMode2.Touch) return;
      const pending = this.#pendingTouchBreakByPlayer.get(source.id);
      if (pending && pending.slot === source.selectedSlotIndex && pending.itemTypeId === itemStack.typeId) this.#pendingTouchBreakByPlayer.delete(source.id);
    });
    world7.beforeEvents.playerBreakBlock.subscribe((event) => {
      if (this.#outlines.isManagedInteractionTarget(event.dimension, event.block)) {
        event.cancel = true;
        return;
      }
      if (this.#outlines.captureActionTarget(event.player)) {
        event.cancel = true;
      }
    });
    world7.beforeEvents.playerInteractWithBlock.subscribe((event) => {
      const { itemStack, player } = event;
      const heldItemIsBlock = itemStack !== void 0 && BlockTypes2.get(itemStack.typeId) !== void 0;
      if (heldItemIsBlock && player.inputInfo.lastInputModeUsed === InputMode2.KeyboardAndMouse && !player.isSneaking && this.#canInteract(player) && (this.#ownsStandingChestGesture(player) || this.#findStandingInteractionTarget(player) !== void 0)) {
        event.cancel = true;
        this.#claimStandingChestGesture(player);
        return;
      }
      const target = this.#outlines.captureActionTarget(player);
      if (!target) return;
      if (heldItemIsBlock) event.cancel = true;
      if (player.inputInfo.lastInputModeUsed === InputMode2.Touch) {
        this.#lastTouchBlockInteractionTickByPlayer.set(player.id, system8.currentTick);
        this.#pendingTouchBreakByPlayer.delete(player.id);
      }
      if (!heldItemIsBlock || !itemStack) return;
      this.#queuePlaceAction(player, itemStack, target);
    });
    world7.beforeEvents.entityHurt.subscribe((event) => {
      if (this.#isSubLevelVisualEntity(event.hurtEntity)) event.cancel = true;
    });
    world7.afterEvents.playerSwingStart.subscribe((event) => this.#handleSwing(event));
    world7.afterEvents.playerHotbarSelectedSlotChange.subscribe((event) => {
      this.#clearEditActionState(event.player.id);
    });
    world7.afterEvents.playerDimensionChange.subscribe((event) => {
      this.#raycastByPlayer.delete(event.player.id);
      this.#releasePlayerInteractionSession(event.player.id);
      this.#clearEditActionState(event.player.id);
      this.#outlines.clearPlayer(event.player.id, true);
    });
    world7.afterEvents.playerButtonInput.subscribe((event) => {
      if (event.button !== InputButton2.Sneak || !event.player.isSneaking) return;
      this.#interactionHandler?.syncTarget?.(event.player, void 0, void 0);
      this.#outlines.markInteractionTargetDirty(event.player.id);
    }, { buttons: [InputButton2.Sneak] });
    world7.afterEvents.playerSpawn.subscribe((event) => {
      this.#raycastByPlayer.delete(event.player.id);
      this.#releasePlayerInteractionSession(event.player.id);
      this.#clearEditActionState(event.player.id);
      this.#outlines.clearPlayer(event.player.id, true);
    });
    world7.afterEvents.entityDie.subscribe((event) => {
      if (event.deadEntity.typeId !== "minecraft:player") return;
      this.#raycastByPlayer.delete(event.deadEntity.id);
      this.#releasePlayerInteractionSession(event.deadEntity.id);
      this.#clearEditActionState(event.deadEntity.id);
      this.#outlines.clearPlayer(event.deadEntity.id, true);
    });
    world7.beforeEvents.playerLeave.subscribe((event) => {
      const playerId = event.player.id;
      this.#raycastByPlayer.delete(playerId);
      this.#clearEditActionState(playerId);
      system8.run(() => {
        this.#releasePlayerInteractionSession(playerId);
        this.#outlines.clearPlayer(playerId, true);
      });
    });
  }
  #handleItemUse(event) {
    const player = event.source;
    if (!player.isSneaking && this.#canInteract(player) && this.#tryPlayerStandingInteraction(player)) {
      this.#claimStandingChestGesture(player);
      return;
    }
    if (!this.#canInteract(player)) return;
    const inputMode = player.inputInfo.lastInputModeUsed;
    if (shouldPrioritizeFoodUse(player, event.itemStack, inputMode === InputMode2.Touch)) return;
    const target = this.#outlines.captureActionTarget(player);
    if (!target) return;
    if (inputMode === InputMode2.Touch) {
      if (this.#pendingPlaceByPlayer.has(player.id) || this.#shouldSuppressTouchBreak(
        player.id,
        system8.currentTick,
        system8.currentTick
      )) {
        event.cancel = true;
        return;
      }
      this.#queueTouchBreakAction(player, event.itemStack, target);
      return;
    }
  }
  #handleSwing(event) {
    const { player, swingSource } = event;
    if (!this.#canInteract(player)) return;
    const itemStack = event.heldItemStack ?? this.#getSelectedItem(player);
    const pending = this.#pendingPlaceByPlayer.get(player.id);
    const pendingTouchBreak = this.#pendingTouchBreakByPlayer.get(player.id);
    const editAction = resolveSubLevelEditAction(
      swingSource,
      pending !== void 0,
      player.inputInfo.lastInputModeUsed,
      pendingTouchBreak !== void 0,
      itemStack !== void 0 && BlockTypes2.get(itemStack.typeId) !== void 0
    );
    if (editAction === "break") {
      if (player.inputInfo.lastInputModeUsed === InputMode2.Touch && swingSource === EntitySwingSource.Mine && pendingTouchBreak === void 0) {
        const target3 = this.#outlines.captureActionTarget(player);
        if (!target3) {
          this.#outlines.handleBreak(player, itemStack, target3);
          return;
        }
        this.#queueTouchBreakAction(player, itemStack, target3);
        return;
      }
      if (pending) this.#pendingPlaceByPlayer.delete(player.id);
      if (pendingTouchBreak) this.#pendingTouchBreakByPlayer.delete(player.id);
      if (pendingTouchBreak && (pendingTouchBreak.slot !== player.selectedSlotIndex || pendingTouchBreak.itemTypeId !== itemStack?.typeId)) return;
      const target2 = pendingTouchBreak?.target ?? this.#outlines.captureActionTarget(player);
      if (!target2) {
        this.#outlines.handleBreak(player, itemStack, target2);
        return;
      }
      this.#performBreakAction(player, itemStack, target2);
      return;
    }
    if (editAction !== "place") return;
    if (pending) this.#pendingPlaceByPlayer.delete(player.id);
    if (pendingTouchBreak) this.#pendingTouchBreakByPlayer.delete(player.id);
    if (!itemStack || !BlockTypes2.get(itemStack.typeId)) return;
    if (pending && (pending.slot !== player.selectedSlotIndex || pending.itemTypeId !== itemStack.typeId)) return;
    const target = pending?.target ?? this.#outlines.captureActionTarget(player);
    if (!target) {
      this.#outlines.handlePlace(player, itemStack);
      return;
    }
    this.#performPlaceAction(
      player,
      itemStack,
      target,
      pending?.originTick ?? system8.currentTick
    );
  }
  /** Touch itemUse marks a hold gesture; its deferred action can be superseded by the swing. */
  #queueTouchBreakAction(player, itemStack, target) {
    const originTick = system8.currentTick;
    if (this.#shouldSuppressTouchBreak(
      player.id,
      originTick,
      originTick
    )) return;
    const pending = {
      itemTypeId: itemStack?.typeId,
      slot: player.selectedSlotIndex,
      target
    };
    this.#pendingTouchBreakByPlayer.set(player.id, pending);
    system8.run(() => {
      if (this.#pendingTouchBreakByPlayer.get(player.id) !== pending) return;
      this.#pendingTouchBreakByPlayer.delete(player.id);
      if (this.#shouldSuppressTouchBreak(
        player.id,
        originTick,
        system8.currentTick
      )) return;
      const selected = this.#getSelectedItem(player);
      if (player.selectedSlotIndex !== pending.slot || selected?.typeId !== pending.itemTypeId) return;
      this.#performBreakAction(player, selected, pending.target);
    });
  }
  #performBreakAction(player, itemStack, target) {
    this.#outlines.handleBreak(player, itemStack, target);
  }
  #shouldSuppressTouchBreak(playerId, breakOriginTick, observationTick) {
    return shouldSuppressTouchBreak(
      this.#lastTouchBlockInteractionTickByPlayer.get(playerId),
      breakOriginTick,
      observationTick
    );
  }
  /** Touch placement resolves on the next tick; other input modes wait for Build. */
  #queuePlaceAction(player, itemStack, target) {
    const pending = {
      itemTypeId: itemStack.typeId,
      originTick: system8.currentTick,
      player,
      slot: player.selectedSlotIndex,
      target
    };
    this.#pendingPlaceByPlayer.set(player.id, pending);
    if (player.inputInfo.lastInputModeUsed !== InputMode2.Touch) return;
    system8.run(() => {
      if (this.#pendingPlaceByPlayer.get(player.id) !== pending) return;
      this.#pendingPlaceByPlayer.delete(player.id);
      const selected = this.#getSelectedItem(player);
      if (player.selectedSlotIndex !== pending.slot || selected?.typeId !== pending.itemTypeId) return;
      this.#performPlaceAction(player, selected, pending.target, pending.originTick);
    });
  }
  #performPlaceAction(player, itemStack, target, originTick) {
    if (!this.#claimPlaceAction(player.id, target, originTick)) return;
    this.#outlines.handlePlace(player, itemStack, target);
  }
  #claimPlaceAction(playerId, target, tick) {
    const signature = `${target.subLevelId}:${target.blockKey}:${target.face}`;
    const previous = this.#lastPlaceActionByPlayer.get(playerId);
    if (previous?.signature === signature && Math.abs(tick - previous.tick) <= PLACE_ACTION_DEDUP_WINDOW_TICKS) return false;
    this.#lastPlaceActionByPlayer.set(playerId, { signature, tick });
    return true;
  }
  #clearEditActionState(playerId) {
    this.#pendingPlaceByPlayer.delete(playerId);
    this.#pendingTouchBreakByPlayer.delete(playerId);
    this.#lastPlaceActionByPlayer.delete(playerId);
    this.#lastTouchBlockInteractionTickByPlayer.delete(playerId);
    this.#standingChestGestureTickByPlayer.delete(playerId);
  }
  #isSubLevelVisualEntity(entity) {
    if (entity.typeId === BLOCK_OUTLINE_ENTITY_TYPE_ID || entity.typeId === BLOCK_CRACK_ENTITY_TYPE_ID) return true;
    return this.#runtime.isVisualEntity(entity.dimension.id, entity.id);
  }
  /** Interactable blocks consume the gesture before other uses. */
  #tryPlayerStandingInteraction(player) {
    const handler = this.#interactionHandler;
    const target = this.#findStandingInteractionTarget(player);
    if (!target || !handler) return false;
    if (!handler.interact(player, target.handle, target.hit.block)) return false;
    return true;
  }
  #findStandingInteractionTarget(player) {
    const handler = this.#interactionHandler;
    if (handler?.hasSyncTargets && !handler.hasSyncTargets(player.dimension.id)) return void 0;
    const target = this.#raycastPlayerSubLevels(player, INTERACTION_REACH, true);
    if (!target || !handler?.canInteract(target.handle, target.hit.block)) return void 0;
    return target;
  }
  #claimStandingChestGesture(player) {
    if (player.inputInfo.lastInputModeUsed !== InputMode2.KeyboardAndMouse || player.isSneaking) return;
    this.#standingChestGestureTickByPlayer.set(player.id, system8.currentTick);
    this.#pendingPlaceByPlayer.delete(player.id);
  }
  #ownsStandingChestGesture(player) {
    const tick = this.#standingChestGestureTickByPlayer.get(player.id);
    if (tick === system8.currentTick) return true;
    if (tick !== void 0) this.#standingChestGestureTickByPlayer.delete(player.id);
    return false;
  }
  /** Keep native container entities ready before a standing player interacts. */
  #syncStandingInteractionTargets() {
    const handler = this.#interactionHandler;
    if (!handler?.syncTarget) return;
    if (handler.hasSyncTargets && !handler.hasSyncTargets()) return;
    for (const player of this.#players.players()) {
      if (handler.hasSyncTargets && !handler.hasSyncTargets(player.dimension.id)) {
        handler.syncTarget(player, void 0, void 0);
        continue;
      }
      if (!this.#canInteract(player) || player.isSneaking) {
        handler.syncTarget(player, void 0, void 0);
        continue;
      }
      const target = this.#raycastPlayerSubLevels(player, INTERACTION_REACH, true);
      if (!target || !handler.canInteract(target.handle, target.hit.block)) {
        handler.syncTarget(player, void 0, void 0);
        continue;
      }
      handler.syncTarget(player, target.handle, target.hit.block);
    }
  }
  #releasePlayerInteractionSession(playerId) {
    this.#interactionHandler?.releasePlayer?.(playerId);
  }
  #raycastPlayerSubLevels(player, maximumDistance, ignorePassableBlocks = false) {
    if (!this.#runtime.hasSubLevels(player.dimension.id)) return void 0;
    let origin;
    let direction;
    try {
      origin = player.getHeadLocation();
      direction = normalizeFinite(player.getViewDirection());
    } catch {
      return void 0;
    }
    const raycastRevision = this.#runtime.getRaycastRevision(player.dimension.id);
    const cached = this.#raycastByPlayer.get(player.id);
    if (cached?.dimensionId === player.dimension.id && cached.raycastRevision === raycastRevision && cached.maximumDistance === maximumDistance && cached.ignorePassableBlocks === ignorePassableBlocks && vectorsEqual2(cached.origin, origin) && vectorsEqual2(cached.direction, direction)) return cached.result;
    let closest;
    for (const handle of this.#runtime.getRaycastCandidates(player.dimension.id)) {
      const hit = handle.raycast(origin, direction, maximumDistance, { ignorePassableBlocks });
      if (!hit || closest && hit.distance >= closest.hit.distance) continue;
      closest = { handle, direction, hit, origin };
    }
    if (!closest || this.#isWorldBlockBefore(player, origin, direction, closest.hit.distance)) closest = void 0;
    this.#raycastByPlayer.set(player.id, {
      raycastRevision,
      dimensionId: player.dimension.id,
      direction,
      ignorePassableBlocks,
      maximumDistance,
      origin,
      result: closest
    });
    return closest;
  }
  #isWorldBlockBefore(player, origin, direction, distanceToSubLevel) {
    try {
      const hit = player.getBlockFromViewDirection({
        includeLiquidBlocks: false,
        includePassableBlocks: false,
        maxDistance: WORLD_OCCLUSION_PROBE_REACH
      });
      if (!hit) return false;
      const point = {
        x: hit.block.location.x + hit.faceLocation.x,
        y: hit.block.location.y + hit.faceLocation.y,
        z: hit.block.location.z + hit.faceLocation.z
      };
      const blockDistance = dot(subtract(point, origin), direction);
      return blockDistance >= 0 && blockDistance + WORLD_BLOCK_OCCLUSION_EPSILON < distanceToSubLevel;
    } catch {
      return false;
    }
  }
  #canInteract(player) {
    try {
      return player.isValid && player.getGameMode() !== GameMode3.Spectator;
    } catch {
      return false;
    }
  }
  #getSelectedItem(player) {
    try {
      return getInventory(player)?.container.getItem(player.selectedSlotIndex);
    } catch {
      return void 0;
    }
  }
};
function resolveSubLevelEditAction(swingSource, hasPendingPlace, inputMode, hasTouchItemUse = false, heldItemIsBlock = false) {
  if (inputMode === InputMode2.Touch) {
    if (hasPendingPlace) return "place";
    if (hasTouchItemUse) return void 0;
    if (swingSource === EntitySwingSource.Mine) return "break";
    return void 0;
  }
  if (hasPendingPlace && swingSource === EntitySwingSource.Build) return "place";
  return swingSource === EntitySwingSource.Attack || swingSource === EntitySwingSource.Mine ? "break" : void 0;
}
function shouldSuppressTouchBreak(touchTapTick, breakOriginTick, observationTick) {
  if (touchTapTick === void 0) return false;
  return touchTapTick >= breakOriginTick - 1 && touchTapTick <= observationTick;
}
function canEatFoodNow(canAlwaysEat, currentHunger, maximumHunger) {
  return canAlwaysEat || currentHunger < maximumHunger;
}
function getInventory(player) {
  return player.getComponent("minecraft:inventory");
}
function shouldPrioritizeFoodUse(player, itemStack, includeVanillaFoodTag = false) {
  const food = itemStack.getComponent("minecraft:food");
  if (!food && !(includeVanillaFoodTag && itemStack.hasTag("minecraft:is_food"))) return false;
  const hunger = player.getComponent("minecraft:player.hunger");
  if (!hunger) throw new Error(`Player ${player.id} has no hunger component.`);
  return canEatFoodNow(food?.canAlwaysEat ?? false, hunger.currentValue, hunger.effectiveMax);
}

// sable/packs/SableBP/scripts/sable/content/raycast/SubLevelGridRaycast.js
var DIRECTION_EPSILON = EPSILON_1E8;
var DISTANCE_EPSILON = 1e-9;
var AXES = ["x", "y", "z"];
function raycastSubLevelGrid(blockAt, origin, direction, maximumDistance, options) {
  if (!isFiniteVector(origin) || !isFiniteVector(direction)) return void 0;
  if (!Number.isFinite(maximumDistance) || maximumDistance < 0) return void 0;
  const directionLength = Math.hypot(direction.x, direction.y, direction.z);
  if (!Number.isFinite(directionLength) || directionLength < DIRECTION_EPSILON) return void 0;
  const ray = {
    x: direction.x / directionLength,
    y: direction.y / directionLength,
    z: direction.z / directionLength
  };
  let x = Math.floor(origin.x + 0.5);
  let y = Math.floor(origin.y + 0.5);
  let z = Math.floor(origin.z + 0.5);
  const skipStartingCell = options?.skipContainingCell === true && isStrictlyInsideUnitCell(origin, x, y, z);
  const stepX = Math.sign(ray.x);
  const stepY = Math.sign(ray.y);
  const stepZ = Math.sign(ray.z);
  let tMaxX = firstBoundaryDistance(origin.x, ray.x, x, stepX);
  let tMaxY = firstBoundaryDistance(origin.y, ray.y, y, stepY);
  let tMaxZ = firstBoundaryDistance(origin.z, ray.z, z, stepZ);
  const tDeltaX = stepX === 0 ? Number.POSITIVE_INFINITY : 1 / Math.abs(ray.x);
  const tDeltaY = stepY === 0 ? Number.POSITIVE_INFINITY : 1 / Math.abs(ray.y);
  const tDeltaZ = stepZ === 0 ? Number.POSITIVE_INFINITY : 1 / Math.abs(ray.z);
  const maximumSteps = Math.ceil(maximumDistance * 3) + 8;
  for (let step = 0; step < maximumSteps; step++) {
    const block = step === 0 && skipStartingCell ? void 0 : blockAt(x, y, z);
    if (block) {
      const hit = rayUnitAabbHit(origin, ray, x, y, z, maximumDistance);
      if (hit) {
        return {
          block,
          distance: hit.distance,
          face: faceFromNormal(hit.normal),
          localLocation: {
            x: origin.x + ray.x * hit.distance,
            y: origin.y + ray.y * hit.distance,
            z: origin.z + ray.z * hit.distance
          },
          localNormal: hit.normal
        };
      }
    }
    const nextDistance = Math.min(tMaxX, tMaxY, tMaxZ);
    if (nextDistance > maximumDistance) break;
    if (tMaxX <= nextDistance + DISTANCE_EPSILON) {
      x += stepX;
      tMaxX += tDeltaX;
    }
    if (tMaxY <= nextDistance + DISTANCE_EPSILON) {
      y += stepY;
      tMaxY += tDeltaY;
    }
    if (tMaxZ <= nextDistance + DISTANCE_EPSILON) {
      z += stepZ;
      tMaxZ += tDeltaZ;
    }
  }
  return void 0;
}
function isStrictlyInsideUnitCell(origin, x, y, z) {
  return origin.x > x - 0.5 && origin.x < x + 0.5 && origin.y > y - 0.5 && origin.y < y + 0.5 && origin.z > z - 0.5 && origin.z < z + 0.5;
}
function firstBoundaryDistance(origin, direction, cell, step) {
  if (step === 0) return Number.POSITIVE_INFINITY;
  const boundary = cell + (step > 0 ? 0.5 : -0.5);
  return Math.max(0, (boundary - origin) / direction);
}
function rayUnitAabbHit(origin, direction, x, y, z, maximumDistance) {
  let near = 0;
  let far = maximumDistance;
  let normal = dominantOppositeNormal(direction);
  const min = { x: x - 0.5, y: y - 0.5, z: z - 0.5 };
  const max = { x: x + 0.5, y: y + 0.5, z: z + 0.5 };
  for (const axis of AXES) {
    const component = direction[axis];
    if (Math.abs(component) < DIRECTION_EPSILON) {
      if (origin[axis] < min[axis] || origin[axis] > max[axis]) return void 0;
      continue;
    }
    let axisNear = (min[axis] - origin[axis]) / component;
    let axisFar = (max[axis] - origin[axis]) / component;
    const axisNormal = component > 0 ? -1 : 1;
    if (axisNear > axisFar) [axisNear, axisFar] = [axisFar, axisNear];
    if (axisNear > near) {
      near = axisNear;
      normal = {
        x: axis === "x" ? axisNormal : 0,
        y: axis === "y" ? axisNormal : 0,
        z: axis === "z" ? axisNormal : 0
      };
    }
    far = Math.min(far, axisFar);
    if (near > far) return void 0;
  }
  return far < 0 || near > maximumDistance ? void 0 : { distance: Math.max(0, near), normal };
}
function dominantOppositeNormal(direction) {
  const x = Math.abs(direction.x);
  const y = Math.abs(direction.y);
  const z = Math.abs(direction.z);
  if (x >= y && x >= z) return { x: direction.x > 0 ? -1 : 1, y: 0, z: 0 };
  if (y >= z) return { x: 0, y: direction.y > 0 ? -1 : 1, z: 0 };
  return { x: 0, y: 0, z: direction.z > 0 ? -1 : 1 };
}
function faceFromNormal(normal) {
  if (normal.x < 0) return "west";
  if (normal.x > 0) return "east";
  if (normal.y < 0) return "down";
  if (normal.y > 0) return "up";
  if (normal.z < 0) return "north";
  return "south";
}

// sable/packs/SableBP/scripts/sable/sublevel/system/SubLevelInteractionSystem.js
function isSubLevelBlockRaySolid(block) {
  return block.collisionResponse !== false && isSubLevelBlockCollidable(block);
}
function isSubLevelBlockCollidable(block) {
  if (block.collidable === false || block.collisionShape === "none") return false;
  return true;
}
var SubLevelInteractionHandle = class {
  id;
  subLevel;
  #options;
  #runtime;
  #blocks;
  #blocksByKey;
  #contentRevision = 0;
  #anchorLocal;
  #unregistered = false;
  constructor(id, subLevel, options, runtime) {
    this.id = id;
    this.subLevel = subLevel;
    this.#options = options;
    this.#runtime = runtime;
    this.#blocks = [...subLevel.blocks];
    this.#blocksByKey = indexBlocks(this.#blocks);
    this.#anchorLocal = options.renderData?.renderAnchorLocal ?? selectSubLevelRenderAnchor(this.#blocks);
  }
  get isValid() {
    return !this.#unregistered && this.subLevel.body.isValid;
  }
  get dimension() {
    return this.subLevel.dimension;
  }
  get blocks() {
    return this.#blocks;
  }
  get contentRevision() {
    return this.#contentRevision;
  }
  get supportsBlockPlacement() {
    return this.#options.supportsBlockPlacement ?? true;
  }
  get isMoving() {
    return this.#options.isMoving?.() ?? false;
  }
  get renderData() {
    return this.#options.renderData;
  }
  get visualRotation() {
    const body = this.subLevel.body;
    return body.getRenderRotation?.() ?? body.getRotation();
  }
  get outlineAnchorLocal() {
    return { ...this.#anchorLocal };
  }
  get outlineAnchorLocation() {
    return this.localPointToWorld(this.#anchorLocal);
  }
  localPointToWorld(location) {
    return this.subLevel.body.localPointToWorld(location);
  }
  worldPointToLocal(point) {
    return this.#options.worldPointToLocal(point);
  }
  getBlockAtLocalLocation(location) {
    return this.#blocksByKey.get(blockLocationKey(location));
  }
  raycast(origin, direction, maximumDistance, options) {
    if (!this.isValid || !isFiniteVector(origin) || !isFiniteVector(direction)) {
      return void 0;
    }
    if (Number.isNaN(maximumDistance) || maximumDistance < 0) return void 0;
    const directionLength = Math.hypot(direction.x, direction.y, direction.z);
    if (!Number.isFinite(directionLength) || directionLength < EPSILON_1E8) return void 0;
    const unitDirection = {
      x: direction.x / directionLength,
      y: direction.y / directionLength,
      z: direction.z / directionLength
    };
    const localOrigin = this.worldPointToLocal(origin);
    const localEnd = this.worldPointToLocal({
      x: origin.x + unitDirection.x,
      y: origin.y + unitDirection.y,
      z: origin.z + unitDirection.z
    });
    const localDirection = {
      x: localEnd.x - localOrigin.x,
      y: localEnd.y - localOrigin.y,
      z: localEnd.z - localOrigin.z
    };
    const blockAt = options?.ignorePassableBlocks ? (x, y, z) => {
      const block = this.#blocksByKey.get(`${x},${y},${z}`);
      return block && isSubLevelBlockRaySolid(block) ? block : void 0;
    } : (x, y, z) => this.#blocksByKey.get(`${x},${y},${z}`);
    const closest = raycastSubLevelGrid(
      blockAt,
      localOrigin,
      localDirection,
      maximumDistance,
      { skipContainingCell: options?.skipContainingBlock }
    );
    if (!closest) return void 0;
    const location = {
      x: origin.x + unitDirection.x * closest.distance,
      y: origin.y + unitDirection.y * closest.distance,
      z: origin.z + unitDirection.z * closest.distance
    };
    const localLocation = {
      x: localOrigin.x + localDirection.x * closest.distance,
      y: localOrigin.y + localDirection.y * closest.distance,
      z: localOrigin.z + localDirection.z * closest.distance
    };
    const localZero = this.localPointToWorld({ x: 0, y: 0, z: 0 });
    const rotatedNormal = this.localPointToWorld(closest.localNormal);
    const normal = normalizeVector({
      x: rotatedNormal.x - localZero.x,
      y: rotatedNormal.y - localZero.y,
      z: rotatedNormal.z - localZero.z
    });
    return {
      block: closest.block,
      distance: closest.distance,
      face: closest.face,
      localLocation,
      localNormal: closest.localNormal,
      location,
      normal
    };
  }
  removeBlockAtLocalLocation(location) {
    return this.removeBlocksAtLocalLocations([location])[0];
  }
  removeBlocksAtLocalLocations(locations) {
    const keys = new Set(locations.map(blockLocationKey));
    const removed = this.#blocks.filter((block) => keys.has(blockLocationKey(block.localLocation)));
    if (removed.length === 0) return [];
    const removedKeys = new Set(removed.map((block) => blockLocationKey(block.localLocation)));
    this.#blocks = this.#blocks.filter(
      (block) => !removedKeys.has(blockLocationKey(block.localLocation))
    );
    for (const key of removedKeys) this.#blocksByKey.delete(key);
    this.#options.renderData?.removeBlocks(removedKeys);
    this.markContentChanged();
    return removed;
  }
  /** Adds a placed block. The render data must support addition to project it. */
  addBlock(block) {
    const key = blockLocationKey(block.localLocation);
    if (this.#blocksByKey.has(key)) return false;
    const renderData = this.#options.renderData;
    if (renderData) {
      if (renderData.supportsBlockAddition !== true || !renderData.addBlocks) return false;
      renderData.addBlocks([block]);
    }
    this.#blocks.push(block);
    this.#blocksByKey.set(key, block);
    this.markContentChanged();
    return true;
  }
  setBlockModelState(localLocation, dimension, value) {
    return this.#options.renderData?.setBlockModelState?.(
      blockLocationKey(localLocation),
      dimension,
      value
    ) ?? false;
  }
  attachOutlineEntity(entity) {
    const renderData = this.#options.renderData;
    if (!renderData?.attachAuxiliaryRider) return true;
    return renderData.attachAuxiliaryRider(entity);
  }
  detachOutlineEntity(entity) {
    this.#options.renderData?.detachAuxiliaryRider?.(entity);
  }
  attachPersistentEntity(entity) {
    const renderData = this.#options.renderData;
    if (!renderData?.attachPersistentRider) return true;
    return renderData.attachPersistentRider(entity);
  }
  detachPersistentEntity(entity, preserveEmptyCarrier = false) {
    this.#options.renderData?.detachPersistentRider?.(entity, preserveEmptyCarrier);
  }
  removeEmptyPersistentEntityCarriers() {
    this.#options.renderData?.removeEmptyPersistentRiderCarriers?.();
  }
  hasVisualEntity(entityId) {
    return this.#options.renderData?.hasEntity(entityId) ?? false;
  }
  /** Call after mutating this sub-level's blocks outside the handle helpers. */
  markContentChanged() {
    this.#contentRevision++;
    this.#anchorLocal = this.#options.renderData?.renderAnchorLocal ?? selectSubLevelRenderAnchor(this.#blocks);
    this.#runtime.bumpRaycastRevision(this.subLevel.dimension.id);
  }
  /** Rebuild the index from the live SubLevel blocks after external replacement. */
  resetBlocks(blocks) {
    this.#blocks = [...blocks];
    this.#blocksByKey = indexBlocks(this.#blocks);
    this.markContentChanged();
  }
  unregister() {
    if (this.#unregistered) return;
    this.#unregistered = true;
    this.#runtime.dropHandle(this);
  }
};
var SubLevelInteractionSystem = class {
  #handlesByDimension = /* @__PURE__ */ new Map();
  #raycastRevisions = /* @__PURE__ */ new Map();
  #nextHandleId = 1;
  register(subLevel, options) {
    const handle = new SubLevelInteractionHandle(this.#nextHandleId++, subLevel, options, this);
    let handles = this.#handlesByDimension.get(subLevel.dimension.id);
    if (!handles) {
      handles = /* @__PURE__ */ new Set();
      this.#handlesByDimension.set(subLevel.dimension.id, handles);
    }
    handles.add(handle);
    this.bumpRaycastRevision(subLevel.dimension.id);
    return handle;
  }
  hasSubLevels(dimensionId) {
    return (this.#handlesByDimension.get(dimensionId)?.size ?? 0) > 0;
  }
  *getRaycastCandidates(dimensionId) {
    const handles = this.#handlesByDimension.get(dimensionId);
    if (!handles) return;
    for (const handle of handles) {
      if (!handle.isValid) {
        this.dropHandle(handle);
        continue;
      }
      yield handle;
    }
  }
  getHandleById(id) {
    for (const handles of this.#handlesByDimension.values()) {
      for (const handle of handles) {
        if (handle.id === id) return handle.isValid ? handle : void 0;
      }
    }
    return void 0;
  }
  /** Any moving sub-level continuously invalidates cached selection rays. */
  getRaycastRevision(dimensionId) {
    const handles = this.#handlesByDimension.get(dimensionId);
    if (handles) {
      for (const handle of handles) {
        if (handle.isValid && handle.isMoving) {
          this.bumpRaycastRevision(dimensionId);
          break;
        }
      }
    }
    return this.#raycastRevisions.get(dimensionId) ?? 0;
  }
  isVisualEntity(dimensionId, entityId) {
    const handles = this.#handlesByDimension.get(dimensionId);
    if (!handles) return false;
    for (const handle of handles) {
      if (handle.isValid && handle.hasVisualEntity(entityId)) return true;
    }
    return false;
  }
  bumpRaycastRevision(dimensionId) {
    this.#raycastRevisions.set(dimensionId, (this.#raycastRevisions.get(dimensionId) ?? 0) + 1);
  }
  dropHandle(handle) {
    const handles = this.#handlesByDimension.get(handle.subLevel.dimension.id);
    if (!handles?.delete(handle)) return;
    this.bumpRaycastRevision(handle.subLevel.dimension.id);
  }
};
function indexBlocks(blocks) {
  const index = /* @__PURE__ */ new Map();
  for (const block of blocks) index.set(blockLocationKey(block.localLocation), block);
  return index;
}
function normalizeVector(value) {
  const length = Math.hypot(value.x, value.y, value.z);
  if (!Number.isFinite(length) || length < EPSILON_1E8) return { x: 0, y: 0, z: 0 };
  return { x: value.x / length, y: value.y / length, z: value.z / length };
}

// sable/packs/SableBP/scripts/sable/SableCommonEvents.js
var STALE_RENDER_ENTITY_FAMILIES = ["fancy_model", "block"];
var sableInteractionSystem = new SubLevelInteractionSystem();
var sableBlockBehaviors = new SubLevelBlockBehaviorRegistry();
var sableContainerInteraction = new SubLevelContainerInteractionController();
var sablePlayerInteraction = new SubLevelPlayerInteractionController(sableInteractionSystem);
var sableSubLevels = new ServerSubLevelContainer(
  sableInteractionSystem,
  sableBlockBehaviors,
  sableContainerInteraction
);
sablePlayerInteraction.setBlockBreakHandler((player, itemStack, handle, block) => sableSubLevels.breakBlockForPlayerEdit(player, itemStack, handle, block));
sablePlayerInteraction.setBlockMiningEffectHandler((handle, block) => {
  sableSubLevels.emitBlockMiningEffects(handle, block);
});
sablePlayerInteraction.setBlockPlaceHandler((player, itemStack, handle, block, placement, direction) => sableSubLevels.placeBlockForPlayerEdit(player, itemStack, handle, block, placement, direction));
sablePlayerInteraction.setBlockPlacementEffectHandler((handle, block) => {
  sableSubLevels.emitBlockPlacementEffects(handle, block);
});
sablePlayerInteraction.setBlockInteractHandler(sableContainerInteraction);
registerVanillaSubLevelBlockBehaviors({
  behaviors: sableBlockBehaviors,
  containers: sableContainerInteraction,
  onNativeDeath: (ownerId, binding) => {
    sableSubLevels.handleContainerNativeDeath(ownerId, binding);
  },
  onUnexpectedRemoval: (ownerId, binding) => {
    sableSubLevels.handleContainerUnexpectedRemoval(ownerId, binding);
  }
});
sableContainerInteraction.start();
sablePlayerInteraction.start();
world8.afterEvents.entityLoad.subscribe((event) => {
  sablePlayerInteraction.handleVisualEntityLoad(event.entity);
  sableContainerInteraction.handleEntityLoad(event.entity);
});
system9.runInterval(() => {
  sablePlayerInteraction.tick(system9.currentTick);
  sableSubLevels.tick(system9.currentTick);
}, 1);
system9.run(() => {
  for (const dimensionId of VANILLA_DIMENSION_IDS) {
    const dimension = world8.getDimension(dimensionId);
    for (const family of STALE_RENDER_ENTITY_FAMILIES) {
      for (const entity of dimension.getEntities({ families: [family] })) {
        if (entity.isValid && entity.typeId.startsWith("sable:")) entity.remove();
      }
    }
  }
  sableSubLevels.initialize();
  sableContainerInteraction.completeSavedBindingRegistration();
});

// sable/packs/SableBP/scripts/main.entry.tmp.js
var SELECTION_ITEM_TYPE_ID = "minecraft:stick";
var pendingCorners = /* @__PURE__ */ new Map();
world9.beforeEvents.playerInteractWithBlock.subscribe((event) => {
  const { block, itemStack, player } = event;
  if (itemStack?.typeId !== SELECTION_ITEM_TYPE_ID) return;
  if (!event.isFirstEvent) return;
  event.cancel = true;
  const clicked = { x: block.location.x, y: block.location.y, z: block.location.z };
  const dimensionId = player.dimension.id;
  system10.run(() => {
    const first = pendingCorners.get(player.id);
    if (!first || first.dimensionId !== dimensionId) {
      pendingCorners.set(player.id, { dimensionId, location: clicked });
      player.onScreenDisplay.setActionBar(
        `\xA7a\u8D77\u70B9 \xA7f${clicked.x}, ${clicked.y}, ${clicked.z} \xA77\u2014 \u518D\u7528\u6728\u68CD\u70B9\u51FB\u7EC8\u70B9`
      );
      return;
    }
    pendingCorners.delete(player.id);
    try {
      const managed = sableSubLevels.createSubLevelFromRegion(
        player.dimension,
        first.location,
        clicked
      );
      player.sendMessage(
        `\xA7a\u5DF2\u5B9E\u4F53\u5316\u5B50\u4E16\u754C \xA7f${managed.id}\xA7a\uFF1A${managed.blockCount} \u65B9\u5757 / ${managed.entityCount} \u5B9E\u4F53\u3002\xA77 \u76F4\u63A5\u653B\u51FB\u53EF\u6316\u6398\uFF0C\u624B\u6301\u65B9\u5757\u53EF\u653E\u7F6E\uFF0C\u7784\u51C6\u53EF\u67E5\u770B\u63CF\u8FB9\u3002`
      );
    } catch (error) {
      player.sendMessage(`\xA7c\u5B50\u4E16\u754C\u521B\u5EFA\u5931\u8D25\uFF1A${error instanceof Error ? error.message : String(error)}`);
    }
  });
});
world9.beforeEvents.playerLeave.subscribe((event) => {
  pendingCorners.delete(event.player.id);
});
