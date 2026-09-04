# Sable 子世界方块渲染注册实施清单

## 实施边界

本次只完成 `sublevel-block-registry-design.md` 定义的注册、路由、实体布局、运行时渲染和构建产物生成。物理、碰撞、方块交互、存储和 Simulated 业务代码不在改动范围内。

## 当前代码状态

| 文件或目录 | 当前职责与问题 | 目标 |
| --- | --- | --- |
| `sable/src/sublevel/SubLevel.ts` | 已有方块快照、渲染体接口，以及从 TreePhysics 搬入的 `visual` 描述和编码字段。 | 只保留子世界公开数据；方块快照提供 `typeId`、`states`、`mapColor`，不暴露 fancy 内部编码。渲染命名统一使用 `render`。 |
| `sable/src/sublevel/render/SubLevelRenderer.ts` | 默认使用名为 vanilla、实际同时尝试两条路线的 dispatcher。 | 默认入口改用 `FancySubLevelRenderDispatcher`；公共入口不判断方块类型。 |
| `sable/src/sublevel/render/dispatcher/VanillaSubLevelRenderDispatcher.ts` | 先尝试整结构 fragment，失败后整结构手持。 | 只负责收到的方块走 vanilla，一方块一实体手持路线。 |
| `sable/src/sublevel/render/dispatcher/FancySubLevelRenderDispatcher.ts` | 空壳。 | 逐方块查询注册表，分别构建 fancy 与 vanilla 数据，并组合生命周期。 |
| `sable/src/sublevel/render/fancy/fragment` | 具备空间分桶、位编码、载体、状态和 tint 基础，但名称与源码注册仍是 TreePhysics 迁移态。 | 删除该路径；能力迁入 `fancy/model`，只消费解析后的模型，不包含具体方块 ID。 |
| `sable/src/sublevel/render/SubLevelVisualEntityUtils.ts` | 两条路线共用的实体、骑乘和写入阈值工具。 | 改为 `SubLevelRenderEntityUtils.ts`，函数语义保持不变。 |
| `sable/src/sublevel/render/vanilla` | 双手手持方块与载体生命周期已完整。 | 保留计算与行为，统一 render 命名并作为逐方块回退。 |
| `sable/src/data` | 不存在。 | 增加唯一人工维护注册表 `sublevel-block.json`。 |
| `sable/tools` | 空目录。 | 增加注册校验、条件编译、模型资源和包生成工具。 |
| `sable/packs` | 只有空入口和 foliage 固定色图。 | 由工具完整生成 SableBP、SableRP 和编译后的 `Sable.js`。 |

## 最终源码结构

```text
sable/src/
├── data/sublevel-block.json
├── generated/sublevel-block-registry.d.ts
├── sublevel/SubLevel.ts
└── sublevel/render/
    ├── SubLevelRenderData.ts
    ├── SubLevelRenderEntityUtils.ts
    ├── SubLevelRenderer.ts
    ├── dispatcher/
    │   ├── FancySubLevelRenderDispatcher.ts
    │   ├── SubLevelRenderDispatcher.ts
    │   └── VanillaSubLevelRenderDispatcher.ts
    ├── fancy/model/
    │   ├── FancySubLevelModel.ts
    │   ├── FancySubLevelModelCodec.ts
    │   ├── FancySubLevelModelLayout.ts
    │   ├── FancySubLevelModelRegistry.ts
    │   ├── FancySubLevelModelRenderer.ts
    │   ├── FancySubLevelModelTypes.ts
    │   └── FancySubLevelTintCodec.ts
    └── vanilla/
        ├── SingleBlockSubLevelWrapper.ts
        └── VanillaChunkedSubLevelRenderData.ts

sable/tools/
├── build-sublevel-block.ts
└── sublevel-block/
    ├── condition.ts
    ├── model-templates.ts
    ├── registry.ts
    └── resources.ts
```

`sable:sublevel-block-registry` 是构建时虚拟模块。声明文件只描述生成数据的类型；具体方块数据由构建工具从 JSON 编译后注入 bundle，不生成含方块 ID 的 TypeScript 源文件。

## 公开数据调整

`SubLevelBlock` 保留：

- `typeId`：完整方块 ID。
- `states`：捕获时的方块状态快照，键兼容带 namespace 和不带 namespace 的形式。
- `mapColor`：已有调用方提供的固定颜色信息。
- 碰撞、位置、旋转和 vanilla 手持物品字段。

删除 `SubLevelBlockVisual*` 公共类型和 `SubLevelBlock.visual`。fancy 所需的模型、材质、状态编码与实体类型全部由注册表解析生成。

公共生命周期方法改为 `setBlockModelState(blockKey, dimension, value)`。当前 `chest` 模型提供 `open` 维度；接口本身不识别箱子 ID。

## 编译后的注册数据

构建工具把每个注册记录编译为：

```ts
interface CompiledBlockRegistration {
  readonly states: readonly string[];
  readonly variants: readonly {
    readonly condition: CompiledCondition;
    readonly model: CompiledFancySubLevelModel;
  }[];
  readonly default: CompiledFancySubLevelModel;
}

interface CompiledFancySubLevelModel {
  readonly key: string;
  readonly denseEntityTypeId: string;
  readonly sparseEntityTypeId: string;
  readonly material: "opaque" | "alpha_test" | "tint";
  readonly model: ModelDescription;
  readonly tint?: TintDescription;
  readonly stateDimensions: readonly ModelStateDimension[];
}
```

`key` 由规范化后的 material、model、tint 计算稳定哈希。相同最终模型定义复用同一模型资源与实体类型；方块 ID 不参与哈希，因此不同方块只要最终表现相同就能进入同一布局组。

## 条件编译与求值

构建器实现词法分析和递归下降解析，只接受设计文档规定的语法。输出只包含字面量、状态读取、一元非、逻辑操作和比较操作组成的 AST。

构建期校验：

- 所有 `q.block_state` 引用都已在当前记录的 `states` 声明。
- 拒绝未知 token、函数、属性读取和多余输入。
- `variants` 保持声明顺序。

运行时只解释 AST，不调用 `eval` 或 `Function`。状态读取先查完整键，再查去掉 `minecraft:` 后的键。首个真值变体生效，否则使用 `default`。

## 模型类型处理

`FancySubLevelModelTypes.ts` 只含模型类型处理器及运行时状态维度，不含方块注册：

- `full_block`：静态六面立方体。
- `chest`：箱体、箱盖和锁，提供 `open: 0..1`。
- `cocoa`：由 `age` 和 `facing` 已解析出的静态几何。
- `vine`：由 `faces` 已解析出的静态平面组合。
- `hanging_roots`：静态交叉平面。
- `mangrove_propagule`：由 `hanging` 和 `stage` 已解析出的静态几何。
- `pale_hanging_moss`：由 `tip` 已解析出的静态几何。
- `mangrove_roots`：根系侧面和端面几何。
- `muddy_mangrove_roots`：沾泥根系侧面和端面几何。

模型类型处理器返回状态位数和可用实体布局，不返回或判断方块 ID。

## 实体布局

每个解析后的模型定义具有两个内部候选布局：

- dense：固定三维区域，槽位直接由相对坐标确定；适合相邻方块。
- sparse：较大区域内每个槽位携带相对坐标；适合离散方块。

布局名称只存在于 fancy 内部和生成产物，不进入注册 JSON。每个模型组分别计算两种候选结果，按以下顺序选择：

1. 实体数量更少。
2. 实体数量相同时，使用的总槽位容量更小。
3. 仍相同时选择 dense，保证结果稳定。

不同模型定义分别打包；无法编码的单个已注册方块交给 vanilla。未注册方块直接交给 vanilla。两种路线的结果由组合 render data 同时管理。

坐标范围、24 位整数属性和 32 个实体属性上限沿用当前实现：

- packed origin 每轴范围 `[-1024, 1023]`。
- dense 静态模型使用 `7 x 5 x 7`、245 个一位槽位和 11 个字。
- sparse 使用 26 个描述字，坐标各占 6 位。
- 有运行时状态的模型为每槽分配 `1 + stateBits`，零仍为空槽。
- 资源生成器按照实际位宽生成属性、Molang 解码和骨骼显隐表达式。

## Tint

运行时 tint 编码沿用现有 24 位字段及默认 plains 颜色：

- `fixed` 把 `#RRGGBB` 编入统一颜色值。
- `foliage` 使用 `SubLevel.foliageTint`；未提供时使用默认 plains climate。
- tint 对所有模型类型使用同一管线。
- `materials: tint` 的模型同时生成 alpha test 基础层和颜色乘法层。

## 组合生命周期

`FancySubLevelRenderDispatcher`：

1. 为每个方块解析模型。
2. 把可编码方块交给 fancy model renderer。
3. 把未注册或无法编码的方块交给 vanilla dispatcher。
4. 一个路线为空时直接返回另一路线；两者都存在时返回组合 render data。

组合 render data 聚合实体 ID、位置、完整性、同步、移除、骑乘和回调。`removeBlocks` 同时通知两条路线，由各自忽略不属于自己的键。只有底层路线都支持某项可选操作时才公开该能力。

如果一个方块既无法使用 fancy，也没有可用 vanilla item，则使用由构建器生成的 missing-tile fancy 模型；该行为仅在两条正常路线均无法表达时发生。

## 资源生成

工具根据编译后的唯一模型定义生成：

- `SableBP/manifest.json`、`SableRP/manifest.json`。
- vanilla 路线的 `sable:block`、`sable:block_carrier`。
- fancy 共用载体 `sable:fancy_model_carrier`。
- 每个模型定义的 dense/sparse 行为实体。
- 对应客户端实体、几何、动画和渲染控制器。
- `SableBP/scripts/sable/Sable.js`。

资源生成原则：

- `full_block` 按六个面拆分几何通道，使每面可绑定独立纹理。
- 特殊模型使用 `model-templates.ts` 中按模型类型定义的几何模板；模板不含方块 ID 或纹理路径。
- dense 资源复制固定槽位骨骼；sparse 资源复制 26 个槽位并由描述字移动槽位。
- chest 为每个槽位生成 lid 骨骼，读取通用 `open` 状态位。
- `opaque` 使用 `opaque_block`；`alpha_test` 使用 `alpha_block`；`tint` 使用 `alpha_block_color` 和 `foliage_colormap_multiply`。
- 生成文件名和 identifier 使用模型 key，保证稳定且避免方块名进入框架资源命名。

构建工具在写入前生成完整目标文件集合，并删除 `sable/packs/SableBP`、`sable/packs/SableRP` 中不再属于本次集合的旧生成文件。固定 foliage 色图由工具从内置 256 色数据生成或保留为确定字节产物。

## 注册数据迁移

按设计文档“当前注册内容”逐 ID 写入 JSON：

- 旧版和现代原木、木头、去皮变体。
- 旧版和现代树叶、固定 birch/spruce tint、foliage tint 和不染色叶片。
- chest、bee_nest、cocoa、hanging_roots、mangrove_propagule、pale_hanging_moss、vine、mangrove_roots、muddy_mangrove_roots、creaking_heart。

轴向、方向、阶段、蜂蜜、tip、vine 位掩码和 creaking heart 状态全部展开为 JSON `variants`。源码不包含这些状态到具体方块表现的映射。

## 入口与构建

`Sable.ts` 只导出稳定的子世界接口、renderer、render data 和模型状态设置能力，不导出布局位宽、槽位、family、codec 或生成资源 ID。

统一构建入口是：

```powershell
node --experimental-strip-types sable/tools/build-sublevel-block.ts
```

工具内部调用 esbuild，把 `sable/src/Sable.ts` bundle 为 ESM，并将 `@minecraft/server` 标记为 external。虚拟注册模块在同一次 bundle 中注入。

## 最终验证

全部修改完成后只执行一次统一验证：

1. 运行构建工具，完成注册校验、资源生成和 Sable bundle。
2. 使用 `tsc --noEmit` 检查 `sable/src` 和 `sable/tools`。
3. 解析所有生成 JSON，检查 identifier 唯一性、引用完整性和属性数不超过 32。
4. 搜索 `sable/src`，确认没有具体方块 ID，没有 `fragment`、`visual`、`voxel`、`attachment`、`cube_fragment` 临时渲染术语。
5. 检查每个注册最终定义均存在 dense/sparse 行为实体、客户端实体、几何、动画和渲染控制器。
6. 检查未注册方块的逐方块 vanilla 路由与混合 render data 仍然存在。
