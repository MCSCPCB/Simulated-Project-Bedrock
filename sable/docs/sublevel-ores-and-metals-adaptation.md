# 矿石与金属 Fancy 适配研发记录

2026-09-11：本轮完成纠正分类后的「自然 / 矿石与金属」33 种方块注册、生成和离线校验，最终光照、材质和加载表现仍需在 Minecraft 中实测。

## 适配范围

本批以 `.sample/VanillaBlock/VanillaBlockData/main/自然/矿石与金属/blocks.json` 为准，包含 13 种矿物块和 20 种矿石，其中普通与发亮红石矿石使用独立的基岩方块 ID。分类清单与显式注册逐项一致，未把其他分类中的方块带入本批。

## 注册与模型

所有条目都使用现有 `full_block` 模型，六个面保持基岩版纹理路径。远古残骸的顶面和底面使用 `ancient_debris_top`，四个侧面使用 `ancient_debris_side`；石英矿石使用基岩资源包登记的 `quartz_ore` 路径。其余方块的六面使用各自的单一纹理。

资源由 `sable/src/data/sublevel-block.json` 唯一驱动。模型、动画、渲染控制器和客户端实体继续由生成器按内容摘要共享，独立纹理路径保持可用。本批没有翻页纹理、染色或邻接状态，因此没有新增状态变体和专用模型类型。

## 材质与发光

普通矿石和金属块使用 `opaque`。`minecraft:lit_redstone_ore` 与 `minecraft:lit_deepslate_redstone_ore` 使用 `opaque_emissive`，两个 ID 分别绑定普通红石矿石和深层红石矿石纹理。该材质只负责渲染已存在的 lit 方块，不在注册表中实现红石矿石的自动点亮、熄灭或其他专有模拟。

## 通用行为

挖掘工具统一为镐，硬度来自 Bedrock 1.26.30 的 minecraft-data；采集等级由本地 Java `mineable/pickaxe`、`needs_stone_tool`、`needs_iron_tool` 和 `needs_diamond_tool` 标签交叉核对。放置、破坏、敲击声音复用现有原版声音表，破坏粒子由生成器按代表纹理建立；未增加方块专有的战利品或随机刻模拟。

## 验证

- `node --experimental-strip-types sable/tools/build-sublevel-block.ts`：176 个注册，323 个模型资源生成完成。
- `node sable/tools/verify-sublevel-parity.mjs`：分类、纹理、材质、模型共享、声音、粒子和挖掘链路校验。
- `git diff --check`：通过。

自动校验不替代游戏内验收；需要在游戏中确认普通和 lit 红石矿石的发光强度、各面纹理、破坏效果以及子世界加载与重建表现。

## 数据来源

- 基岩版资源：`.sample/VanillaBlock/VanillaBlockResource/bedrock-sample-1.26.40.5`。
- Java 模型与工具标签：`.sample/VanillaBlock/VanillaBlockResource/minecraft-assets-26.2`。
- 硬度索引：[minecraft-data Bedrock 1.26.30](https://github.com/PrismarineJS/minecraft-data/tree/master/data/bedrock/1.26.30)。
