# Physics Assembler File Mapping

本记录只覆盖物理装配器及其直接支撑文件。原 Java 项目 `Sample/Simulated-Project` 未被修改。

## Common 源码

原目录 `common/src/main/java/dev/simulated_team/simulated/` 已去掉 Java 模块和包前缀，普通源码文件进入 `src/scripts/physics_assembler/`：

| 原路径/文件 | 当前落点 | Bedrock 职责 |
| --- | --- | --- |
| `content/blocks/physics_assembler/*` | `src/scripts/physics_assembler/content/blocks/physics_assembler/` | 装配器方块、方块实体、交互入口和渲染职责的脚本落点 |
| `content/blocks/behaviour/HoldTipBehaviour.java` | `src/scripts/physics_assembler/content/blocks/behaviour/HoldTipBehaviour.ts` | 方块交互提示的脚本落点 |
| `client/BlockPropertiesTooltip.java` | `src/scripts/physics_assembler/client/BlockPropertiesTooltip.ts` | 客户端提示职责落点 |
| `config/server/blocks/SimAssembly.java` | `src/scripts/physics_assembler/config/server/blocks/SimAssembly.ts` | 装配器配置数据落点 |
| `events/SimulatedCommonEvents.java` | `src/scripts/physics_assembler/events/SimulatedCommonEvents.ts` | 服务端/公共事件接线落点 |
| `events/SimulatedCommonClientEvents.java` | `src/scripts/physics_assembler/events/SimulatedCommonClientEvents.ts` | 客户端事件接线落点 |
| `index/SimBlocks.java`、`SimBlockEntityTypes.java`、`SimItems.java` | `src/scripts/physics_assembler/index/` | 行为包方块/方块实体/物品标识注册的脚本侧落点 |
| `index/SimBlockShapes.java`、`SimBlockMovementChecks.java` | `src/scripts/physics_assembler/index/` | 几何、移动扫描和静态规则的脚本侧落点 |
| `index/SimClickInteractions.java`、`SimGUITextures.java`、`SimPartialModels.java` | `src/scripts/physics_assembler/index/` | 交互和资源引用索引落点 |
| `index/SimSoundEvents.java`、`SimPonderScenes.java`、`SimPonderTags.java`、`SimTags.java`、`SimStats.java` | `src/scripts/physics_assembler/index/` | 装配器声音、教程、标签和统计引用落点 |
| `util/SimAssemblyHelper.java`、`util/SimMathUtils.java` | `src/scripts/physics_assembler/util/` | 运行时辅助逻辑落点 |
| `util/assembly/*` | `src/scripts/physics_assembler/util/assembly/` | 结构扫描、组装/拆解语义分组 |
| `util/hold_interaction/*` | `src/scripts/physics_assembler/util/hold_interaction/` | 长按交互语义分组 |
| `network/SimPacketManager.java`、`network/packets/AssemblePacket.java`、`network/packets/physics_assembler/*` | `src/scripts/physics_assembler/network/` | 原封包职责的脚本侧落点，暂不替换传输机制 |
| `service/SimAssemblyService.java`、`SimBlockStateService.java`、`SimConfigService.java` | `src/scripts/physics_assembler/service/` | 统一服务接口落点 |
| `Simulated.java`、`SimulatedClient.java` | `src/scripts/physics_assembler/` | 共用初始化逻辑的脚本源码落点 |
| `data/SimLang.java`、`data/SimBlockStateGen.java`、`data/advancements/*` | `src/scripts/physics_assembler/data/` | 数据/语言生成源码落点，未作为运行时实现 |

## Common Mixin 与接口

| 原文件 | 合并目标 | 原职责 | 合并理由 |
| --- | --- | --- | --- |
| `mixin/assembly_preventer/ServerSubLevelMixin.java` | `src/reference/physics_assembler/legacy-mixins/common/mixin/assembly_preventer/` | 向 SubLevel 注入主装配器位置 | Bedrock 没有 Mixin 或 SubLevel；只保留原职责，避免伪造替代实现 |
| `mixin_interface/assembly_preventer/PrimaryAssemblerExtension.java` | `src/reference/physics_assembler/legacy-mixins/common/mixin_interface/assembly_preventer/` | 暴露主装配器读写接口 | 同上，归档而非编译模块 |
| `mixin/create_assembly/*`、`mixin_interface/create_assembly/*` | `src/reference/physics_assembler/legacy-mixins/common/` | 修改 Create 机械装配兼容行为 | Bedrock 没有 Java 方法拦截点；统一归档 |
| `mixin/hold_interaction/*` | `src/reference/physics_assembler/legacy-mixins/common/` | 截获键盘、鼠标和本地玩家长按输入 | 输入 API 尚未实现，保留原文件职责供后续重做 |

## NeoForge 源码

| 原文件 | 合并目标 | 原职责 | 合并理由 |
| --- | --- | --- | --- |
| `neoforge/.../SimulatedNeoForge.java` | `src/scripts/physics_assembler/entry/SimulatedNeoForge.ts` | 模组入口并调用 common 初始化 | Bedrock 用 pack manifest + 脚本入口承载启动声明 |
| `neoforge/.../SimulatedNeoForgeClient.java` | `src/scripts/physics_assembler/entry/SimulatedNeoForgeClient.ts` | 客户端入口并调用客户端初始化 | 合并到脚本入口职责，不再保留 NeoForge 模块 |
| `neoforge/.../events/SimNeoForgeCommonEvents.java` | `src/scripts/physics_assembler/events/SimNeoForgeCommonEvents.ts` | 服务端/公共事件转发 | Bedrock 统一由脚本事件订阅入口承载 |
| `neoforge/.../events/SimNeoForgeClientEvents.java` | `src/scripts/physics_assembler/events/SimNeoForgeClientEvents.ts` | 客户端 tick、输入、GUI 和交互转发 | 同上，保留文件名追踪原始转发关系 |
| `neoforge/.../service/NeoForgeSimAssemblyService.java` | `src/scripts/physics_assembler/service/NeoForgeSimAssemblyService.ts` | 代理 `BlockState.canStickTo` | 合并到服务接口目录；具体 Bedrock 规则暂不实现 |
| `neoforge/.../service/NeoForgeSimBlockStateService.java` | `src/scripts/physics_assembler/service/NeoForgeSimBlockStateService.ts` | Java 方块状态/模型数据生成服务 | Bedrock 由 pack JSON 承载，原服务只保留追踪落点 |
| `neoforge/.../service/NeoForgeSimConfigService.java` | `src/scripts/physics_assembler/service/NeoForgeSimConfigService.ts` | NeoForge 配置注册与加载 | Bedrock 没有 NeoForge TOML 服务发现，保留接口落点 |

## NeoForge 元数据与生成物

| 原目录/文件 | 当前落点 | 说明 |
| --- | --- | --- |
| `neoforge/src/main/resources/META-INF/neoforge.mods.toml` | `src/reference/physics_assembler/legacy-metadata/neoforge/META-INF/neoforge.mods.toml` | 原始模组元数据归档 |
| `neoforge/src/main/resources/META-INF/services/*SimAssemblyService`、`*SimBlockStateService` | `src/reference/physics_assembler/legacy-metadata/neoforge/META-INF/services/` | 原服务发现声明归档 |
| `common/src/main/resources/simulated.mixins.json` | `src/reference/physics_assembler/legacy-metadata/common/` | common Mixin 配置归档 |
| `neoforge/src/main/resources/simulated-neoforge.mixins.json` | `src/reference/physics_assembler/legacy-metadata/neoforge/` | NeoForge Mixin 配置归档 |
| `common/src/generated/resources/...` | `src/reference/physics_assembler/generated/common/...` | common 生成物，非手写 Bedrock 源 |
| `neoforge/src/generated/data/...` | `src/reference/physics_assembler/generated/neoforge/data/...` | NeoForge 生成物，非手写 Bedrock 源 |
| `neoforge/src/generated/resources/...` | `src/reference/physics_assembler/generated/neoforge/resources/...` | NeoForge 生成物，非手写 Bedrock 源 |

## 资源包资产

| 原 Java 资源 | 当前 Bedrock 目录 |
| --- | --- |
| `assets/simulated/textures/block/physics_assembler.png` | `packs/SimulatedRP/textures/blocks/physics_assembler.png` |
| `assets/simulated/textures/gui/assembler.png` | `packs/SimulatedRP/textures/ui/assembler.png` |
| `assets/simulated/models/block/physics_assembler/block.json` | `packs/SimulatedRP/models/blocks/physics_assembler/block.geo.json`，转换为 `geometry.physics_assembler`；Java 原文归档于 `src/reference/physics_assembler/legacy-assets/models/blocks/physics_assembler/block.json` |
| `assets/simulated/models/block/physics_assembler/item.json` | `packs/SimulatedRP/models/blocks/physics_assembler/item.geo.json`，转换为 `geometry.physics_assembler_item`；Java 原文归档于 `src/reference/physics_assembler/legacy-assets/models/blocks/physics_assembler/item.json` |
| `assets/simulated/models/block/physics_assembler/lever.json` | `packs/SimulatedRP/models/blocks/physics_assembler/lever.geo.json`，转换为可复用的静态 `geometry.physics_assembler_lever`；动态旋转尚未接线，Java 原文归档于 `src/reference/physics_assembler/legacy-assets/models/blocks/physics_assembler/lever.json` |
| `assets/simulated/models/item/physics_assembler.json` | Java 物品模型原文归档；基岩版物品显示由方块的 `minecraft:item_visual` 指向 `geometry.physics_assembler_item` |
| `assets/simulated/sounds/block/physics_assembler/*` | `packs/SimulatedRP/sounds/physics_assembler/` |
| 原 `assets/simulated/sounds.json` | `src/reference/physics_assembler/legacy-assets/sounds.json` |
| 装配器声音事件和字幕 | `packs/SimulatedRP/sounds/sound_definitions.json`；`assemble`、`disassemble`、`fail`、`tick` 定义 `subtitle`，`shift` 保持无字幕（原 Java 没有字幕） |
| 原 `assets/simulated/lang/*.json` | `src/reference/physics_assembler/legacy-assets/lang/` |
| 装配器语言条目 | `packs/SimulatedRP/texts/*.lang`；已移除空语言文件，并补充 Bedrock `tile.simulated:physics_assembler.name` 显示名键 |
| 支持的语言列表 | `packs/SimulatedRP/texts/languages.json` |
| `simulated.subtitle.block.physics_assembler.*` | `subtitles.block.physics_assembler.*`，写入 `packs/SimulatedRP/texts/*.lang` |
| Create `bearing_top.png`、`mechanical_bearing_side.png`、`andesite_casing.png` | `packs/SimulatedRP/textures/create/block/`，并在 `textures/terrain_texture.json` 注册；不依赖 Create RP |
| `assets/simulated/ponder/physics_assembler/*` | `src/reference/physics_assembler/legacy-ponder/assets/physics_assembler/` |
| `assets/simulated/blockstates/physics_assembler.json` | `src/reference/physics_assembler/legacy-blockstates/physics_assembler.json` |

## 行为包资产

| 原 Java 数据 | 当前 Bedrock 目录 |
| --- | --- |
| `data/simulated/recipe/physics_assembler.json` | `packs/SimulatedBP/recipes/physics_assembler.json` |
| `data/simulated/loot_table/blocks/physics_assembler.json` | `packs/SimulatedBP/loot_tables/blocks/physics_assembler.json` |
| `data/minecraft/tags/block/mineable/{axe,pickaxe}.json` | `packs/SimulatedBP/tags/blocks/mineable/` |
| `data/create/tags/block/safe_nbt.json` | `packs/SimulatedBP/tags/blocks/safe_nbt.json`（保留归档标签；装配器方块自身使用 `minecraft:tags` 的斧/镐破坏标签） |
| Java `data/simulated/advancement/*` | `src/reference/physics_assembler/legacy-advancements/` |

`packs/SimulatedBP/blocks/physics_assembler.json` 已写入可由 Bedrock 直接加载的组件：放置面/水平朝向 traits、
几何和材质、物品显示、安山岩套管破坏粒子、木质光照阻隔、两段碰撞体、朝向变换、包围选择框、木质破坏参数、战利品引用和斧/镐标签。
`packs/SimulatedRP/blocks.json` 将通用方块音效设为 `wood`，而自定义装配器事件位于 `sounds/sound_definitions.json`。
