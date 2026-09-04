# 世界方块捕获与 TreePhysics 的零差异

资源层已与 TreePhysics 数据零差异；本篇补齐"世界方块 → SubLevelBlock"捕获层。横放原木被投成竖放的根因即在此：没有框架级捕获入口，方块状态、手持物品映射与手持旋转此前由调用方自行拼装，遗漏后注册表条件全部落空、回退默认模型。验收标准：TreePhysics 支持集内（树方块 + 箱子），同一世界方块经 sable 捕获后的渲染判定与 TreePhysics 的分类结果百分百一致；物理参数与树木玩法（识别、交互、放置挖掘）不在范围内。

## 差异清单

| 项 | TreePhysics 真值 | 现状 | 处置 |
| --- | --- | --- | --- |
| 状态捕获 | `permutation.getAllStates()`（裸键） | 无捕获入口，调用方漏填 | 框架提供捕获函数 |
| 旧版物品映射 | `log/log2/leaves/leaves2` 按 `old_log_type/new_log_type/old_leaf_type/new_leaf_type` 映射到现代物品 ID | 无 | 移植 |
| 手持路线旋转 | `pillar_axis` x→roll 90、z→pitch 90；`block_face` 东西→roll 90、南北→pitch 90 | 无 | 移植 |
| 自定义方块 mapColor | 非 vanilla 命名空间方块读 `minecraft:map_color` 组件 | 无 | 移植（泛化为所有非 minecraft 命名空间） |
| `minecraft:log2` 状态名 | `new_log_type` | 注册表误用 `old_log_type` | 数据修复 |
| `minecraft:azalea_leaves_flowered` | 支持（Bedrock 实际 ID，与 flowering_azalea 同渲染） | 未注册 | 数据补注册 |

## 实现

填充空壳 `sable/src/api/SubLevelAssemblyHelper.ts`（原 sable 同名类职责即"把方块集合组装成子世界"）：

- `captureSubLevelBlock(block, origin)`：读 `permutation.type.id`、`permutation.getAllStates()`、`location - origin`，附旧版物品映射（`itemTypeId`）与状态驱动的手持旋转（`rotation`），非 `minecraft:` 命名空间方块附 `mapColor`。物理字段不填。
- `captureSubLevelBlocks(blocks, origin)`：逐块捕获并过滤空气/不可捕获项。
- `Sable.ts` 导出两者；调用方组装子世界时统一经由该入口，配合 `captureSubLevelFoliageTint` 填 `foliageTint`。

## 验证

在既有资源零差异的基础上，capture 层 harness 用裸键状态的模拟方块跑 `capture → 注册表解析`，与移植的 TreePhysics 分类逻辑逐组合比对：全部原木/木头/去皮 × 三轴、legacy `log/log2`、全部树叶（含双拼写杜鹃叶与 `leaves/leaves2`）、箱子四朝向、蜂巢、可可、藤蔓 16 位、垂根、苔须、胎生苗（悬挂与非悬挂回退）、红树根、绞刑木之心，加上 `itemTypeId` 与 `rotation` 的全量公式比对。
