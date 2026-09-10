# `Sable` 方块注册

为 Sable 子世界的 Fancy 渲染路线配置方块模型、材质和交互属性。未注册的方块使用 Vanilla 手持路线显示。

## 使用示例

注册表位于 `sable/src/data/sublevel-block.json`，`blocks` 的键是完整方块 ID。以下示例注册一个石头方块：

```json
{
  "format_version": "1.0.0",
  "blocks": {
    "minecraft:stone": {
      "materials": "opaque",
      "category": "nature/terrain_and_stone",
      "hardness": 1.5,
      "mining": { "tool": "pickaxe", "harvest_level": 0 },
      "states": [],
      "variants": [],
      "default": {
        "model": {
          "type": "full_block",
          "textures": {
            "up": "textures/blocks/stone",
            "down": "textures/blocks/stone",
            "north": "textures/blocks/stone",
            "south": "textures/blocks/stone",
            "east": "textures/blocks/stone",
            "west": "textures/blocks/stone"
          }
        }
      }
    }
  }
}
```

在仓库根目录运行以下命令，生成结果写入 `sable/packs/SableBP` 和 `sable/packs/SableRP`：

```powershell
node --experimental-strip-types sable/tools/build-sublevel-block.ts
```

## `BlockRegistration`

每个方块 ID 对应一条注册记录。带 `?` 的字段可省略。

```ts
type BlockRegistration = {
  materials:
    | "opaque" | "alpha_test" | "alpha_test_tint" | "opaque_tint"
    | "blend" | "translucent" | "opaque_emissive" | "alpha_test_emissive"
    | "redstone_torch_emissive";
  category: string;
  domain?: string;
  hardness?: number;
  mining?: MiningDescription;
  placeable?: boolean;
  passable?: boolean;
  support?:
    | "none" | "facing_log" | "above_solid" | "above_leaf"
    | "moss_column" | "vine_faces" | "below_block" | "moss_carpet"
    | "pointed_dripstone" | "multi_face" | "wall_connections";
  states: string[];
  variants: (RenderDefinition & { condition: string })[];
  default: RenderDefinition;
};

type RenderDefinition = {
  model: ModelDescription;
  tint?: TintDescription;
  flipbook?: FlipbookDescription;
};
```

| 字段 | 说明 |
| --- | --- |
| `materials` | 方块的渲染材质。 |
| `category` | 方块分类，例如 `nature/terrain_and_stone`。 |
| `domain` | 共享分组名称，默认与 `category` 相同。 |
| `hardness` | 方块硬度，默认 `1`；`-1` 表示生存和冒险模式不可破坏。 |
| `mining` | 挖掘工具与采收等级；省略时使用斧类工具加速。 |
| `placeable` | 是否允许玩家放置到子世界，默认 `true`。 |
| `passable` | 交互射线是否穿透方块，默认 `false`。 |
| `support` | 附着方式，默认 `none`。 |
| `states` | 条件和模型读取的状态名，例如 `minecraft:pillar_axis`。 |
| `variants` | 按状态选择的显示变体，使用第一个条件成立的条目。 |
| `default` | 没有变体条件成立时使用的显示配置。 |

## `materials` — 材质

| 值 | 说明 |
| --- | --- |
| `opaque` | 不透明。 |
| `alpha_test` | 透明裁切，如镂空的树叶和藤蔓。 |
| `alpha_test_tint` | 透明裁切并染色，搭配 `tint`。 |
| `opaque_tint` | 不透明并染色，搭配 `tint`。 |
| `blend` | 透明混合，如玻璃。 |
| `translucent` | 半透明，如冰。 |
| `opaque_emissive` | 不透明并自发光。 |
| `alpha_test_emissive` | 透明裁切并自发光。 |
| `redstone_torch_emissive` | 红石火把自发光材质。 |

## `category` — 分类

分类路径由大类和小类组成，例如 `building/logs_and_wood`。

| 大类 | 小类 |
| --- | --- |
| `building/` | `bricks_and_building_materials`、`colored_blocks`、`logs_and_wood`、`other_building_and_functional`、`planks` |
| `nature/` | `crops`、`leaves`、`other_natural_blocks`、`ores_and_metals`、`plants_and_flowers`、`saplings`、`terrain_and_stone`、`water_and_ice` |
| `functional/` | `beds`、`buttons`、`chests_and_containers`、`decorations_and_display`、`doors`、`fences`、`fences_and_climbing`、`light_sources`、`mechanisms_and_technical_blocks`、`rails_and_transport`、`redstone`、`signs`、`slabs`、`stairs`、`workstations` |

## `MiningDescription` — 挖掘工具

```ts
type MiningDescription = {
  tool: "none" | "axe" | "pickaxe" | "shovel" | "hoe";
  harvest_level?: number;
};
```

| 字段 | 说明 |
| --- | --- |
| `tool` | 加速挖掘的工具：`axe` 斧、`pickaxe` 镐、`shovel` 锹、`hoe` 锄；`none` 表示无工具加速。 |
| `harvest_level` | 最低采收等级：木/金 `0`、石/铜 `1`、铁 `2`、钻石 `3`、下界合金 `4`；省略表示不要求工具等级。 |

例如黑曜石使用镐挖掘，采收等级为 `3`：

```json
{
  "tool": "pickaxe",
  "harvest_level": 3
}
```

## `support` — 附着方式

| 值 | 说明 |
| --- | --- |
| `none` | 不依赖附着支撑。 |
| `facing_log` | 附着在朝向面上的原木。 |
| `above_solid` | 由上方实体方块支撑。 |
| `above_leaf` | 悬挂时由上方树叶支撑。 |
| `moss_column` | 同类垂须连续悬挂，并更新末端 `tip`。 |
| `vine_faces` | 按各个附着面的支撑更新藤蔓。 |
| `below_block` | 由下方方块支撑。 |
| `moss_carpet` | 苍白苔藓地毯的上下层与侧面附着。 |
| `pointed_dripstone` | 滴水石锥的支撑与连接。 |
| `multi_face` | 六方向逐面附着，可向同一格追加附着面。 |
| `wall_connections` | 墙体连接。 |

例如普通苔藓地毯使用 `"support": "below_block"`。

## `ModelDescription` — 模型

`model.type` 选择模型，其余字段填写对应模型的参数。纹理使用不带扩展名的资源包路径，例如 `textures/blocks/stone`。

| `type` | 字段 | 说明 |
| --- | --- | --- |
| `full_block` | `textures.up/down/north/south/east/west` | 完整立方体，六面分别指定纹理。 |
| `grass_path` | `textures.up/down/north/south/east/west` | 高 15 像素的方块，用于泥土路径和耕地。 |
| `pillar` | `textures.side/top`、`axis` | 柱状方块，`axis` 为 `y/x/z`。 |
| `chest` | `texture`、`facing` | 箱子，纹理为 64×64；`facing` 为 `north/east/south/west`。 |
| `bee_nest` | `textures.down/up/front/side`、`direction` | 蜂巢，`direction` 为 `0..3`。 |
| `cocoa` | `texture`、`direction`、`age` | 可可果，`direction` 为 `0..3`，`age` 为 `0..2`。 |
| `vine` | `texture`、`faces` | 藤蔓，`faces` 为 `south/west/north/east/up` 中的附着方向数组。 |
| `hanging_roots` | `texture` | 垂根。 |
| `pale_hanging_moss` | `texture`、`tip` | 苍白垂须，`tip` 表示是否为末端。 |
| `mangrove_propagule` | `texture`、`stage` | 悬挂的红树胎生苗，`stage` 为 `0..4`。 |
| `mangrove_roots` | `textures.side/top` | 红树根。 |
| `creaking_heart` | `textures.side/top`、`axis` | 嘎枝之心，`axis` 为 `y/x/z`。 |
| `moss_carpet` | `texture`、`pale`；`pale: true` 时另有 `side_short/side_tall` | 苔藓地毯，`pale` 选择苍白变体。 |
| `pointed_dripstone` | `texture`、`thickness`、`hanging` | 滴水石锥，`thickness` 为 `tip/frustum/middle/base/merge`，`hanging` 表示悬挂。 |
| `multi_face` | `texture` | 六方向附着面，读取 `multi_face_direction_bits`。 |
| `sculk_shrieker` | `textures.bottom/side/top/inner_top` | 潜声尖啸体。 |
| `wall` | `texture` | 墙体模型。 |
| `vanilla` | 无 | 使用 Vanilla 手持路线显示。 |

例如竖直干草块的 `model`：

```json
{
  "type": "pillar",
  "textures": {
    "side": "textures/blocks/hay_block_side",
    "top": "textures/blocks/hay_block_top"
  },
  "axis": "y"
}
```

## `condition` — 状态条件

`q.block_state('minecraft:状态名')` 读取 `states` 中列出的方块状态。

| 写法 | 含义 |
| --- | --- |
| `'x'`、`1`、`true`、`false` | 字符串、数字和布尔值。 |
| `==`、`!=`、`<`、`<=`、`>`、`>=` | 比较。 |
| `&&`、`\|\|`、`!` | 且、或、非。 |
| `(...)` | 条件分组。 |

例如在 `states` 中填写 `"minecraft:pillar_axis"`，然后在 `variants` 中添加以下条目，使横向干草块沿 X 轴显示：

```json
{
  "condition": "q.block_state('minecraft:pillar_axis') == 'x'",
  "model": {
    "type": "pillar",
    "textures": {
      "side": "textures/blocks/hay_block_side",
      "top": "textures/blocks/hay_block_top"
    },
    "axis": "x"
  }
}
```

## `TintDescription` — 染色

在 `default` 或变体中填写 `tint`，搭配 `alpha_test_tint` 或 `opaque_tint` 材质使用。

```ts
type TintDescription =
  | { method: "fixed"; color: string }
  | { method: "foliage" }
  | { method: "grass" };
```

| 写法 | 说明 |
| --- | --- |
| `{ "method": "fixed", "color": "#RRGGBB" }` | 指定固定颜色。 |
| `{ "method": "foliage" }` | 使用树叶色图取色。 |
| `{ "method": "grass" }` | 使用草色图取色。 |

例如白桦叶的 `tint`：

```json
{
  "method": "fixed",
  "color": "#80A755"
}
```

## `FlipbookDescription` — 翻页贴图

在 `default` 或变体中填写 `flipbook`，播放纹理中的连续帧。

```ts
type FlipbookDescription = {
  ticks_per_frame: number;
  frame_count: number;
  axis?: "u" | "v";
  loop?: boolean;
  textures?: string[];
};
```

| 字段 | 说明 |
| --- | --- |
| `ticks_per_frame` | 每帧持续的游戏刻数。 |
| `frame_count` | 帧数。 |
| `axis` | 帧排列方向：`u` 横向、`v` 纵向，默认 `v`。 |
| `loop` | 是否循环，默认 `true`。 |
| `textures` | 播放动画的纹理路径；省略时应用于模型的全部纹理。 |

例如催发体绽放时的 `flipbook`，仅播放侧面与顶面的动画：

```json
{
  "ticks_per_frame": 1,
  "frame_count": 8,
  "textures": [
    "textures/blocks/sculk_catalyst_side_bloom",
    "textures/blocks/sculk_catalyst_top_bloom"
  ]
}
```
