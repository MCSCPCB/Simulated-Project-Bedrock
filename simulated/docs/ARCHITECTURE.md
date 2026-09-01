# Physics Assembler Bedrock Layout

本目录只整理航空学的物理装配器功能单元。整理阶段不实现组装、拆解、输入、网络或动态渲染。

## 目标结构

```text
simulated/
├─ src/
│  ├─ scripts/physics_assembler/
│  │  ├─ Simulated.ts
│  │  ├─ SimulatedClient.ts
│  │  ├─ entry/                 NeoForge 入口的 Bedrock 脚本入口落点
│  │  ├─ events/                公共/客户端事件接线落点
│  │  ├─ content/blocks/        保留装配器语义分组
│  │  ├─ index/                  注册表和静态引用落点
│  │  ├─ util/assembly/          组装算法语义分组
│  │  ├─ util/hold_interaction/ 长按交互语义分组
│  │  ├─ network/packets/        原封包职责的脚本侧落点（当前仍为空壳）
│  │  ├─ service/                统一服务接口和原平台实现落点
│  │  ├─ config/                  装配器配置落点
│  │  ├─ client/                  客户端提示落点
│  │  └─ data/                    装配器数据生成/语言源码落点
│  └─ reference/physics_assembler/
│     ├─ legacy-mixins/          Mixin 原始职责归档，不参与 Bedrock 构建
│     ├─ legacy-metadata/        NeoForge 元数据与服务发现归档
│     ├─ legacy-blockstates/     Java blockstates 归档
│     ├─ legacy-ponder/          Ponder NBT 与 Java Ponder 源码归档
│     ├─ legacy-advancements/    Java Advancement 归档
│     ├─ legacy-assets/          原始语言、声音和 Java 模型归档
│     └─ generated/               common/neoforge 生成物归档
└─ packs/
   ├─ SimulatedBP/
   │  ├─ manifest.json
   │  ├─ blocks/physics_assembler.json  方块组件、状态与朝向排列
   │  ├─ recipes/physics_assembler.json  Bedrock shaped recipe
   │  ├─ loot_tables/blocks/physics_assembler.json  方块掉落
   │  └─ tags/blocks/
   └─ SimulatedRP/
      ├─ manifest.json
      ├─ blocks.json                     木质通用方块音效映射
      ├─ models/blocks/physics_assembler/
      │  ├─ block.geo.json               合并主体与 256 个预旋转拉杆帧的 geometry.physics_assembler
      │  ├─ item.geo.json                静态物品 geometry.physics_assembler_item
      │  └─ lever.geo.json               原始静态拉杆 geometry（保留作来源追踪）
      ├─ textures/blocks/physics_assembler.png
      ├─ textures/create/block/            内置 Create 纹理副本（不依赖 Create RP）
      ├─ textures/terrain_texture.json
      ├─ textures/ui/assembler.png
      ├─ sounds/physics_assembler/*.ogg
      ├─ sounds/
      │  ├─ sound_definitions.json        装配器声音定义
      │  └─ physics_assembler/*.ogg
      └─ texts/                            装配器语言条目和语言清单
         ├─ languages.json
         └─ *.lang
```

`src/scripts/physics_assembler` 是未来 TypeScript 脚本的正常源码路径；其中保留的 Java 类名只用于追踪原职责，不能按 Java `Block`、`BlockEntity` 或 NeoForge API 直接实现。

`src/reference/physics_assembler` 不是第二个模块，只是为了满足“合并而不丢失”的可追溯归档区。

`SimulatedBP` 依赖同目录的 `SimulatedRP`，但不声明 BedrockCreate 为必选前置包；配方中若世界已提供
`create:andesite_alloy` 和 `create:andesite_casing`，即可直接使用这些物品。

当前已落地的方块层能力：方块标识、创造模式分类、显示名称、本地化字幕、木质音效类型、挖掘/爆炸/可燃参数、
斧/镐破坏标签、Java 两段碰撞体、包围选择框、放置面与水平朝向状态、对应的 12 组视觉变换排列，以及
通过两个 16 值状态和 `bone_visibility` 选择的 256 个离散拉杆角度帧。支撑面检查、组装运行时、UI、封包和
拉杆状态的脚本驱动仍只保留脚本空壳或归档，不在本阶段实现。
