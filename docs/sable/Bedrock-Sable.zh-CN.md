# `Sable` 方块注册

为 Sable 子世界（Sub-Level）的 Fancy 渲染路线注册方块，并生成对应的渲染产物

## 渲染路线

Fancy 路线按注册表逐方块渲染：已注册的方块由框架编译出专用的渲染实体与资源，未注册的方块自动回退到 Vanilla 手持路线。未注册不会报错，两条路线可以在同一个子世界内共存。

## 注册流程

注册一种新方块只需要两步：在注册表中添加一条记录，然后运行一次构建工具。

## 注册表

注册表文件为 `sable/src/data/sublevel-block.json`：

```json
{
  "format_version": "1.0.0",
  "blocks": {
    "minecraft:方块ID": { "...": "注册记录" }
  }
}
```

键使用完整的带命名空间方块 ID，同一方块只允许注册一次。

## `BlockRegistration`

表示注册表中的一条注册记录。

```ts
type BlockRegistration = {
  materials: "opaque" | "alpha_test" | "alpha_test_tint" | "opaque_tint";
  category: string;
  domain?: string;
  hardness?: number;
  placeable?: boolean;
  passable?: boolean;
  support?: "none" | "facing_log" | "above_solid" | "above_leaf" | "moss_column" | "vine_faces";
  states: string[];
  variants: { condition: string; model: ModelDescription; tint?: TintDescription }[];
  default: { model: ModelDescription; tint?: TintDescription };
};
```

### 属性

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `materials` | `string` | 该方块所有模型使用的渲染材质，取值见「材质」。 |
| `category` | `string` | 方块所属分类路径，决定产物目录位置与默认共享池，必须取自「分类树」。 |
| `domain` | `string` | 可选。覆盖共享池的划分键；省略时回落到 `category`。仅在方块不适合与同类目共池时使用。 |
| `hardness` | `number` | 可选，默认 `1`。原版硬度，驱动挖掘时间与攻击折算击数。 |
| `placeable` | `boolean` | 可选，默认 `false`。玩家可手持该方块放置到子世界上。 |
| `passable` | `boolean` | 可选，默认 `false`。交互射线穿透该方块（藤蔓、垂根等可穿透植物；树叶不属于此类）。 |
| `support` | `string` | 可选，默认 `none`。附着支撑规则，取值见「支撑规则」。 |
| `states` | `string[]` | 该记录会读取的方块状态名列表，使用带命名空间的完整写法。`condition` 中引用的状态都必须在此声明。 |
| `variants` | `object[]` | 按声明顺序求值的条件变体，第一个条件为真的变体生效。 |
| `default` | `object` | 所有变体都不匹配时使用的兜底模型。 |

### 材质

| 值 | 说明 |
| --- | --- |
| `opaque` | 不透明方块。 |
| `alpha_test` | 镂空贴图方块，如树叶、藤蔓。 |
| `alpha_test_tint` | 镂空且需要染色的方块。必须为每个模型提供 `tint`。 |
| `opaque_tint` | 不透明且需要染色的方块。必须为每个模型提供 `tint`。 |

### 支撑规则

支撑方块的类别按 `category` 判定。

| 值 | 说明 |
| --- | --- |
| `none` | 不做附着判定。 |
| `facing_log` | 朝向面必须为原木类。 |
| `above_solid` | 上方必须为实体支撑方块。 |
| `above_leaf` | `hanging` 态时上方必须为树叶，非悬挂态恒定支撑。 |
| `moss_column` | 同类列支撑，并重算 `tip` 状态。 |
| `vine_faces` | 逐面支撑，并重算方向位。 |

### 分类树

`category` 必须是以下路径之一：

- `building/`：`bricks_and_building_materials`、`colored_blocks`、`logs_and_wood`、`other_building_and_functional`、`planks`
- `nature/`：`crops`、`leaves`、`other_natural_blocks`、`ores_and_metals`、`plants_and_flowers`、`saplings`、`terrain_and_stone`、`water_and_ice`
- `functional/`：`beds`、`buttons`、`chests_and_containers`、`decorations_and_display`、`doors`、`fences`、`fences_and_climbing`、`light_sources`、`mechanisms_and_technical_blocks`、`rails_and_transport`、`redstone`、`signs`、`slabs`、`stairs`、`workstations`

### 条件语法

`condition` 是一个小型表达式，支持状态读取 `q.block_state('minecraft:状态名')`、字面量（引号包裹的字符串、数字、`true`、`false`）、比较运算 `==`、`!=`、`<`、`<=`、`>`、`>=`，以及逻辑运算 `&&`、`||`、`!` 与括号。不支持函数调用、属性访问或其它 Molang 能力，越界写法会在构建期报错。运行时读取状态值时，带命名空间与不带命名空间的键都会被尝试。

### 模型

`model.type` 决定几何形态，其余字段随类型而定。贴图路径使用资源包相对路径，不带扩展名。

| 类型 | 字段 | 说明 |
| --- | --- | --- |
| `full_block` | `textures.up/down/north/south/east/west` | 完整立方体，六面可绑定各自贴图；相同贴图的面自动合并为同一渲染通道。 |
| `pillar` | `textures.side/top`、`axis` | 柱状方块（原木、木头、泥泞红树根）。`axis` 取 `y/x/z`，水平朝向为整体旋转；全皮方块把 `top` 指向侧面贴图即可。 |
| `chest` | `texture`、`facing` | 箱体、箱盖与锁，使用 64×64 实体图集（`textures/entity/chest/normal`），按 `facing`（`north/east/south/west`）旋转。提供运行时 `open: 0..1` 状态维度，箱盖带开合缓动。 |
| `bee_nest` | `textures.down/up/front/side`、`direction` | 蜂巢式方向方块，`direction` 取 `0..3`，front 面随方向旋转。 |
| `cocoa` | `texture`、`direction`、`age` | 可可果，含果柄，`age` 取 `0..2`，`direction` 取 `0..3`。 |
| `vine` | `texture`、`faces` | 藤蔓面组合，`faces` 为 `south/west/north/east` 的子集，空数组表示不渲染。 |
| `hanging_roots` | `texture` | 45° 斜置交叉平面。 |
| `pale_hanging_moss` | `texture`、`tip` | 苍白垂须，与垂根同几何，`tip` 变体换贴图。 |
| `mangrove_propagule` | `texture`、`stage` | 红树胎生苗（悬挂形态），`stage` 取 `0..4`；非悬挂状态请用 `vanilla` 回退。 |
| `mangrove_roots` | `textures.side/top` | 红树根板壳结构，侧面与端面分别绑定贴图。 |
| `creaking_heart` | `textures.side/top`、`axis` | 绞刑木之心，三轴专用几何。 |
| `vanilla` | 无 | 该状态组合不走 fancy，回退到逐方块手持路线。 |

### 染色

`tint` 只在 `alpha_test_tint` 与 `opaque_tint` 下合法，且必须提供。

| 写法 | 说明 |
| --- | --- |
| `{ "method": "fixed", "color": "#RRGGBB" }` | 固定颜色乘算，如白桦、云杉树叶。 |
| `{ "method": "foliage" }` | 按子世界的 `foliageTint` 气候场取色，支持跨结构渐变；未提供时使用平原气候。 |

### 示例

以干草块为例，按 `pillar_axis` 展开三个朝向：

```json
"minecraft:hay_block": {
  "materials": "opaque",
  "category": "building/other_building_and_functional",
  "states": ["minecraft:pillar_axis"],
  "variants": [
    {
      "condition": "q.block_state('minecraft:pillar_axis') == 'y'",
      "model": {
        "type": "full_block",
        "textures": {
          "up": "textures/blocks/hay_block_top",
          "down": "textures/blocks/hay_block_top",
          "north": "textures/blocks/hay_block_side",
          "south": "textures/blocks/hay_block_side",
          "east": "textures/blocks/hay_block_side",
          "west": "textures/blocks/hay_block_side"
        }
      }
    },
    {
      "condition": "q.block_state('minecraft:pillar_axis') == 'x'",
      "model": {
        "type": "full_block",
        "textures": {
          "up": "textures/blocks/hay_block_side",
          "down": "textures/blocks/hay_block_side",
          "north": "textures/blocks/hay_block_side",
          "south": "textures/blocks/hay_block_side",
          "east": "textures/blocks/hay_block_top",
          "west": "textures/blocks/hay_block_top"
        }
      }
    },
    {
      "condition": "q.block_state('minecraft:pillar_axis') == 'z'",
      "model": {
        "type": "full_block",
        "textures": {
          "up": "textures/blocks/hay_block_side",
          "down": "textures/blocks/hay_block_side",
          "north": "textures/blocks/hay_block_top",
          "south": "textures/blocks/hay_block_top",
          "east": "textures/blocks/hay_block_side",
          "west": "textures/blocks/hay_block_side"
        }
      }
    }
  ],
  "default": {
    "model": {
      "type": "full_block",
      "textures": {
        "up": "textures/blocks/hay_block_top",
        "down": "textures/blocks/hay_block_top",
        "north": "textures/blocks/hay_block_side",
        "south": "textures/blocks/hay_block_side",
        "east": "textures/blocks/hay_block_side",
        "west": "textures/blocks/hay_block_side"
      }
    }
  }
}
```

## 构建

在仓库根目录执行：

```powershell
node --experimental-strip-types sable/tools/build-sublevel-block.ts
```

工具会先校验注册记录，再为每个最终模型生成 dense 与 sparse 两种行为实体、客户端实体、几何、动画和渲染控制器，写入 `SableBP` 与 `SableRP` 各主目录下的 `sable/sublevel/fancy/<分类路径>/<方块名>/`，同时把编译后的注册数据与转译脚本写入行为包。

### 产物命名

- 默认模型使用方块名，如 `hay_block_dense.json`
- 变体在方块名后追加条件中的状态记号，如 `hay_block_x_sparse.geo.json`
- 分类目录下的 `pool_*` 文件是该分类的共享池资源，由工具按成员自动生成

## 备注

- 模型按最终内容寻址去重：不同方块或同方块的不同变体解析出相同模型时，共用同一套实体与资源，文件落在首个注册方的目录下。
- 移除注册记录后重新构建即可清理对应产物。