# Sable 子世界渲染注册表设计

## 目标

Sable 的方块投影渲染由数据注册驱动。框架源码只认识渲染能力、几何模型、材质、状态选择和实体布局，不认识任何具体方块 ID。

新增一个当前能力范围内的方块时，只修改 `sable/src/data/sublevel-block.json`。构建过程读取注册表并自动生成运行时代码、行为包实体、资源包实体、几何、动画和渲染控制器，不需要手工维护生成物。

## 渲染路线

沿用 Sable 的既有术语：

- `fancy`：多个方块投影由较少的实体承载。注册表能够完整表达的方块优先走该路线。
- `vanilla`：一个方块投影对应一个实体，使用双手手持物品表现。没有注册或当前 `fancy` 能力无法无损表达的方块走该路线。

路由按方块执行，不按整个结构执行。一个子世界可以同时包含 `fancy` 和 `vanilla` 方块；两种路线都不能表达的方块会采取回退，其中一个方块回退不会导致其他方块一同回退，回退的方块以fancy路线显示为missing_tile纹理。

## 文件与产物

| 职责 | 路径 |
| --- | --- |
| 人工维护的方块注册数据 | `sable/src/data/sublevel-block.json` |
| 注册数据构建工具 | `sable/tools/build-sublevel-block.ts` |
| Sable TypeScript 源码 | `sable/src` |
| 编译后的行为包 | `sable/packs/SableBP` |
| 编译后的资源包 | `sable/packs/SableRP` |

`sable/packs` 只保存构建产物。方块支持范围不得反向写入 `src`。

## 注册表结构

注册表顶层结构固定为：

```json
{
  "format_version": "1.0.0",
  "blocks": {
    "namespace:block_id": {
      "materials": "opaque",
      "states": [],
      "variants": [],
      "default": {
        "model": {
          "type": "full_block",
          "textures": {
            "up": "textures/blocks/example_top",
            "down": "textures/blocks/example_top",
            "north": "textures/blocks/example_side",
            "south": "textures/blocks/example_side",
            "east": "textures/blocks/example_side",
            "west": "textures/blocks/example_side"
          }
        }
      }
    }
  }
}
```

`blocks` 的键是完整方块 ID。每个键就是一条独立注册记录，不支持在源码中补充 ID 集合或方块专属识别分支。

## 注册记录字段

| 字段 | 类型 | 必填 | 规则 |
| --- | --- | --- | --- |
| `materials` | `"opaque" \| "alpha_test" \| "tint"` | 是 | 选择宏观材质能力。 |
| `states` | `string[]` | 是 | 声明本记录的条件表达式可能读取的全部方块状态。没有状态时为空数组。 |
| `variants` | `Variant[]` | 是 | 按数组顺序匹配；第一条条件为真的记录生效。没有变体时为空数组。 |
| `default` | `RenderDefinition` | 是 | 没有变体命中时的必备回退，不允许缺省。 |

### 材质

`materials` 只有三个取值：

- `opaque`：完全不透明。
- `alpha_test`：使用透明裁剪，不参与染色。
- `tint`：可染色材质，并且已经包含透明裁剪能力。

`tint` 是对注册者暴露的完整宏观材质，不与 `alpha_test` 组合，也不额外暴露底层材质层或渲染通道。

### 状态与变体

状态选择采用以下结构：

```json
{
  "states": [
    "minecraft:cardinal_direction",
    "namespace:state_name"
  ],
  "variants": [
    {
      "condition": "q.block_state('minecraft:cardinal_direction') == 'north' && q.block_state('namespace:state_name')",
      "model": {
        "type": "full_block",
        "textures": {
          "up": "textures/blocks/example_top",
          "down": "textures/blocks/example_top",
          "north": "textures/blocks/example_front",
          "south": "textures/blocks/example_side",
          "east": "textures/blocks/example_side",
          "west": "textures/blocks/example_side"
        }
      },
      "tint": {
        "method": "foliage"
      }
    },
    {
      "condition": "!q.block_state('namespace:state_name')",
      "model": {
        "type": "full_block",
        "textures": {
          "up": "textures/blocks/example_top",
          "down": "textures/blocks/example_top",
          "north": "textures/blocks/example_side",
          "south": "textures/blocks/example_side",
          "east": "textures/blocks/example_side",
          "west": "textures/blocks/example_side"
        }
      },
      "tint": {
        "method": "fixed",
        "color": "#RRGGBB"
      }
    }
  ],
  "default": {
    "model": {
      "type": "full_block",
      "textures": {
        "up": "textures/blocks/example_top",
        "down": "textures/blocks/example_top",
        "north": "textures/blocks/example_side",
        "south": "textures/blocks/example_side",
        "east": "textures/blocks/example_side",
        "west": "textures/blocks/example_side"
      }
    }
  }
}
```

规则如下：

- `states` 中的每一项必须是 `minecraft:state_name` 或 `namespace:state_name` 形式。
- `condition` 是必填字符串，只能引用同一记录 `states` 已声明的状态。
- `variants` 严格按声明顺序求值，第一条真值条件获胜。
- 表达式语法限定为 `q.block_state('...')`、布尔值、数值、字符串、`!`、`&&`、`||`、`==`、`!=`、比较运算符和括号。
- 不执行任意 Molang 函数，不读取实体、玩家或世界上下文。
- `default` 始终必填，保证未知状态值仍有确定表现。

`Variant` 结构为：

```ts
interface Variant extends RenderDefinition {
  condition: string;
}
```

`RenderDefinition` 结构为：

```ts
interface RenderDefinition {
  model: ModelDescription;
  tint?: TintDescription;
}
```

### 染色

```ts
type TintDescription =
  | { method: "foliage"; color?: never }
  | { method: "fixed"; color: `#${string}` };
```

- `method: "foliage"` 使用投影位置对应的群系 foliage 取色；即使输入含 `color` 也忽略该值。
- `method: "fixed"` 使用 `color` 指定的六位十六进制 RGB 值；`color` 此时必填。
- `tint` 只允许出现在 `materials: "tint"` 的记录中。
- `materials: "tint"` 时，每个可能被选中的 `variant` 和 `default` 都必须提供有效 `tint`。
- 染色是所有几何模型共享的渲染能力，不属于某一种实体编码方式。

## 模型描述

`model.type` 只描述几何模型种类，不描述实体数量、槽位、位编码、材质或染色方式。目前允许：

```ts
type ModelType =
  | "full_block"
  | "chest"
  | "cocoa"
  | "vine"
  | "hanging_roots"
  | "mangrove_propagule"
  | "pale_hanging_moss"
  | "mangrove_roots"
  | "muddy_mangrove_roots";
```

其中：

- `full_block`：边长为一个方块单位、六个面可分别指定静态贴图的立方体。
- `chest`：当前箱子几何和已有开合状态。
- `cocoa`：当前可可果几何，支持方向和生长阶段。
- `vine`：当前藤蔓几何，支持所附着面的组合。
- `hanging_roots`：当前垂根几何。
- `mangrove_propagule`：当前红树胎生苗几何，支持悬挂状态和阶段。
- `pale_hanging_moss`：当前苍白垂须几何，支持末端状态。
- `mangrove_roots`：当前红树根几何。
- `muddy_mangrove_roots`：当前沾泥红树根几何。

现有特殊几何使用与其模型含义一致的 `model.type`，不合并成含义不明的通用类别。以后增加新几何时，为该几何增加同职责层级的类型及类型处理器。

### 各模型字段

所有模型都必须包含 `type`。其余字段由 `type` 确定：

| `model.type` | 必填字段 | 类型与范围 |
| --- | --- | --- |
| `full_block` | `textures` | `{ up, down, north, south, east, west }`，六项均为资源包纹理路径字符串。 |
| `chest` | `texture`, `facing` | `texture: string`；`facing: "north" \| "east" \| "south" \| "west"`。 |
| `cocoa` | `texture`, `facing`, `age` | `texture: string`；四向 `facing`；`age: 0 \| 1 \| 2`。 |
| `vine` | `texture`, `faces` | `texture: string`；`faces` 是由 `north/east/south/west/up` 组成且不重复的数组。 |
| `hanging_roots` | `texture` | 资源包纹理路径字符串。 |
| `mangrove_propagule` | `texture`, `hanging`, `stage` | `texture: string`；`hanging: boolean`；`stage` 使用原方块状态的有效整数范围。 |
| `pale_hanging_moss` | `texture`, `tip` | `texture: string`；`tip: boolean`。 |
| `mangrove_roots` | `textures` | `{ top: string, side: string }`。 |
| `muddy_mangrove_roots` | `textures` | `{ top: string, side: string }`。 |

朝向、阶段、附着面和末端形态通过 `variants` 选择相应的完整 `ModelDescription`。框架不会根据方块 ID 推断这些字段。

箱子的开合沿用当前运行时模型状态通道。状态写入接口保持通用的“设置模型状态维度”形式；`chest` 模型类型声明并消费 `open` 维度，框架不判断 `minecraft:chest`。

## 当前注册内容

以下是迁移后注册表必须覆盖的现有支持范围。每个方块 ID 都在 `blocks` 中拥有独立记录；表格中的合并展示只用于避免文档重复，不表示源码分支或运行时通配。

### 原木和木头

| 方块 ID | 材质 | 状态 | 模型与纹理 |
| --- | --- | --- | --- |
| `minecraft:log` | `opaque` | `minecraft:old_log_type`, `minecraft:pillar_axis` | `full_block`；按木种选择 oak/spruce/birch/jungle 的 side/top，按轴重排六面。 |
| `minecraft:log2` | `opaque` | `minecraft:new_log_type`, `minecraft:pillar_axis` | `full_block`；按木种选择 acacia/dark_oak 的 side/top，按轴重排六面。 |
| `minecraft:oak_log`, `minecraft:spruce_log`, `minecraft:birch_log`, `minecraft:jungle_log`, `minecraft:acacia_log`, `minecraft:dark_oak_log`, `minecraft:mangrove_log`, `minecraft:cherry_log`, `minecraft:pale_oak_log` | `opaque` | `minecraft:pillar_axis` | `full_block`；对应 `textures/blocks/log_*` 或现有同名 side/top 纹理，按轴重排六面。 |
| `minecraft:stripped_oak_log`, `minecraft:stripped_spruce_log`, `minecraft:stripped_birch_log`, `minecraft:stripped_jungle_log`, `minecraft:stripped_acacia_log`, `minecraft:stripped_dark_oak_log`, `minecraft:stripped_mangrove_log`, `minecraft:stripped_cherry_log`, `minecraft:stripped_pale_oak_log` | `opaque` | `minecraft:pillar_axis` | `full_block`；对应 `textures/blocks/stripped_*_log` 与 `*_top`，按轴重排六面。 |
| `minecraft:oak_wood`, `minecraft:spruce_wood`, `minecraft:birch_wood`, `minecraft:jungle_wood`, `minecraft:acacia_wood`, `minecraft:dark_oak_wood`, `minecraft:mangrove_wood`, `minecraft:cherry_wood`, `minecraft:pale_oak_wood` | `opaque` | 无 | `full_block`；六面均使用对应树皮 side 纹理。 |
| `minecraft:stripped_oak_wood`, `minecraft:stripped_spruce_wood`, `minecraft:stripped_birch_wood`, `minecraft:stripped_jungle_wood`, `minecraft:stripped_acacia_wood`, `minecraft:stripped_dark_oak_wood`, `minecraft:stripped_mangrove_wood`, `minecraft:stripped_cherry_wood`, `minecraft:stripped_pale_oak_wood` | `opaque` | 无 | `full_block`；六面均使用对应 stripped side 纹理。 |

每种轴向都通过数据变体明确写出六面映射：

- `y`：`up/down = top`，四个侧面为 `side`。
- `x`：`east/west = top`，其余四面为 `side`。
- `z`：`north/south = top`，其余四面为 `side`。

### 树叶

| 方块 ID | 材质 | 染色 | 纹理 |
| --- | --- | --- | --- |
| `minecraft:leaves` | `tint` | oak/jungle 使用 `foliage`；spruce 使用 `fixed #619961`；birch 使用 `fixed #80A755` | 按 `minecraft:old_leaf_type` 选择 `leaves_oak`, `leaves_spruce`, `leaves_birch`, `leaves_jungle`。 |
| `minecraft:leaves2` | `tint` | `foliage` | 按 `minecraft:new_leaf_type` 选择 `leaves_acacia`, `leaves_big_oak`。 |
| `minecraft:oak_leaves`, `minecraft:jungle_leaves`, `minecraft:acacia_leaves`, `minecraft:dark_oak_leaves`, `minecraft:mangrove_leaves` | `tint` | `foliage` | 分别使用 `leaves_oak`, `leaves_jungle`, `leaves_acacia`, `leaves_big_oak`, `mangrove_leaves`。 |
| `minecraft:spruce_leaves` | `tint` | `fixed #619961` | `textures/blocks/leaves_spruce`。 |
| `minecraft:birch_leaves` | `tint` | `fixed #80A755` | `textures/blocks/leaves_birch`。 |
| `minecraft:cherry_leaves`, `minecraft:pale_oak_leaves`, `minecraft:azalea_leaves`, `minecraft:flowering_azalea_leaves` | `alpha_test` | 无 | 分别使用 `cherry_leaves`, `pale_oak_leaves`, `azalea_leaves`, `azalea_leaves_flowers`。 |

以上记录全部使用 `full_block`，六面使用同一叶片纹理。`foliage` 是通用取色方式，不构成树叶专属代码路径。

### 其他现有方块

| 方块 ID | 材质 | 状态 | `model.type` 与数据 |
| --- | --- | --- | --- |
| `minecraft:chest` | `alpha_test` | `minecraft:cardinal_direction` | `chest`；`texture = textures/entity/chest/normal`；各方向由变体提供 `facing`。 |
| `minecraft:bee_nest` | `opaque` | `minecraft:direction`, `minecraft:honey_level` | `full_block`；按方向和蜂蜜等级选择 front/side/top/bottom 六面纹理。 |
| `minecraft:cocoa` | `alpha_test` | `minecraft:direction`, `minecraft:age` | `cocoa`；按 age 选择 `textures/blocks/cocoa_stage_0..2`，按 direction 提供 `facing`。 |
| `minecraft:hanging_roots` | `alpha_test` | 无 | `hanging_roots`；`texture = textures/blocks/hanging_roots`。 |
| `minecraft:mangrove_propagule` | `alpha_test` | `minecraft:hanging`, `minecraft:propagule_stage` | `mangrove_propagule`；`texture = textures/blocks/mangrove_propagule_hanging`；变体提供 `hanging` 和 `stage`。 |
| `minecraft:pale_hanging_moss` | `alpha_test` | `minecraft:tip` | `pale_hanging_moss`；按 tip 选择 `pale_hanging_moss_middle` 或 `pale_hanging_moss_tip` 并提供 `tip`。 |
| `minecraft:vine` | `tint` | `minecraft:vine_direction_bits` | `vine`；`texture = textures/blocks/vine`；按位值变体提供 `faces`；使用 `foliage`。 |
| `minecraft:mangrove_roots` | `alpha_test` | 无 | `mangrove_roots`；`top = textures/blocks/mangrove_roots_top`，`side = textures/blocks/mangrove_roots_side`。 |
| `minecraft:muddy_mangrove_roots` | `opaque` | 无 | `muddy_mangrove_roots`；`top = textures/blocks/muddy_mangrove_roots_top`，`side = textures/blocks/muddy_mangrove_roots_side`。 |
| `minecraft:creaking_heart` | `opaque` | `minecraft:pillar_axis`, `minecraft:creaking_heart_state` | `full_block`；按状态选择现有 creaking heart 纹理，按轴重排六面。 |

注册表实现时必须把表格描述展开为确定的 `variants`，不在 TypeScript 源码中保留“原木”“树叶”“箱子”或任何方块 ID 判断。

## 自动编码与实体布局

注册数据不允许出现槽位、位宽、容量、实体种类、密集/稀疏模式或编码方式选项。

运行时根据已经解析出的模型、材质、染色和状态要求，枚举当前实现能够无损承载的内部布局，并选择实体数量最少的有效布局。选择必须满足：

- 不改变几何、纹理、染色或状态结果。
- 不把不兼容的材质或模型塞入同一载体。
- 不因局部方块无法编码而放弃其他方块的 `fancy` 编码。
- 同样输入产生稳定、确定的布局。

`full_block`、`chest`、`cocoa`、`vine` 等是几何类型；`foliage` 和 `fixed` 是染色方法。它们都不是编码策略。内部编码类型不进入注册表公共结构。

## 运行时职责

最终源码按 Sable 现有层级组织：

```text
sable/src/sublevel/render/
├── SubLevelRenderData.ts
├── SubLevelRenderEntityUtils.ts
├── SubLevelRenderer.ts
├── dispatcher/
│   ├── FancySubLevelRenderDispatcher.ts
│   ├── SubLevelRenderDispatcher.ts
│   └── VanillaSubLevelRenderDispatcher.ts
├── fancy/
│   ├── FancySubLevelRenderData.ts
│   ├── FancySubLevelSectionCompiler.ts
│   └── model/
│       ├── FancySubLevelModel.ts
│       ├── FancySubLevelModelCodec.ts
│       ├── FancySubLevelModelLayout.ts
│       ├── FancySubLevelModelRegistry.ts
│       ├── FancySubLevelModelRenderer.ts
│       ├── FancySubLevelModelTypes.ts
│       └── FancySubLevelTintCodec.ts
└── vanilla/
    ├── SingleBlockSubLevelWrapper.ts
    ├── VanillaChunkedSubLevelRenderData.ts
    └── VanillaSingleSubLevelRenderData.ts
```

- `dispatcher` 只负责逐方块选择 `fancy` 或 `vanilla`，并合并两条路线的生命周期。
- `fancy/model` 负责模型描述、注册查找、状态解析、染色编码、自动布局和实体呈现。
- `vanilla` 保持一方块一实体的通用回退职责。
- `FancySubLevelModelRegistry` 消费构建生成的注册数据，不含内置方块列表。
- `FancySubLevelModelTypes` 只注册几何类型处理器，不注册方块。
- `SubLevelRenderEntityUtils` 只提供两条路线共享的实体操作，不使用含义重叠的 `visual` 术语。

源码和路径中不保留临时路线术语。公共职责统一使用 Sable 的 `fancy`、`vanilla`、`render`、`model` 和 `sublevel`。

## 构建流程

统一构建命令依次完成：

1. 读取并校验 `sable/src/data/sublevel-block.json`。
2. 校验方块 ID、状态声明、条件语法、模型字段、纹理路径、材质和 tint 组合。
3. 将条件表达式编译为受限的运行时判定数据，不使用动态代码执行。
4. 生成行为包运行时注册数据和脚本模块。
5. 根据实际出现的模型、材质和纹理组合生成行为包实体定义。
6. 生成资源包客户端实体、几何、动画、动画控制器、渲染控制器及所需纹理索引。
7. 编译 `sable/src`，输出到 `sable/packs/SableBP/scripts/sable`。

生成过程必须是确定性的：同一源码和注册表得到字节稳定的逻辑内容；删除注册项后，对应不再使用的生成资源也随下一次构建消失。

## 可表达能力

当前结构能够表达：

- 六面可独立贴图的完整一单元立方体。
- 当前已经支持的 chest、cocoa、vine、hanging_roots、mangrove_propagule、pale_hanging_moss、mangrove_roots 和 muddy_mangrove_roots 几何。
- 不透明、透明裁剪、透明裁剪加染色三类宏观材质。
- 群系 foliage 取色和固定 RGB 取色。
- 多个方块状态组合、按顺序匹配的条件变体和确定默认值。
- 箱子已有的开合模型状态。
- 同一子世界内 `fancy` 与 `vanilla` 混合渲染。

当前结构暂不表达：

- 任意外部自定义几何或尚未声明的新模型类型。
- 翻页书、动态画布、逐帧纹理和其他运行时生成纹理。
- 半透明混合、发光、多层材质或每面不同材质模式。
- foliage 和 fixed 之外的取色方法。
- 箱子之外的新模型动画状态定义。
- 依赖方块状态以外实体数据、容器内容或脚本回调的条件。

出现上述新能力时扩展注册结构、构建器和对应模型处理器；在此之前，不能以方块 ID 特判绕过数据结构。

## 完成判定

实现完成必须同时满足：

1. 新增当前能力范围内的方块只增加一条注册数据，不修改 `src`。
2. `src` 中具体方块 ID、方块集合和方块专属分支为零。
3. 已支持方块迁移前后的几何、纹理、染色、状态和动画表现一致。
4. 注册方块优先使用 `fancy`；未注册或无法表达的单个方块回退到 `vanilla`。
5. 一个结构中的两条路线可以同时存在，不发生整结构回退。
6. 注册数据随统一编译自动产生全部脚本、实体和资源包产物。
