# 子世界 foliage tint 群系采样

补齐 foliage tint 的数据源：组装子世界时按群系采样出 `SubLevelFoliageTint` 气候场，交给渲染链路。逐条移植 TreePhysics 已验证的 `content/tree/foliage/TintSampling.ts` 与 `data/BiomeFoliage.ts`，仅做两处泛化：受染方块的判定由硬编码 ID 列表改为查注册表（解析后模型的 `tint.method === "foliage"`）；固定色图与注册表调色板合并为同一张纹理。

## 文件位置

原 sable 的 `render/dynamic_biome/` 即"动态群系染色"特性目录（其中 `DynamicBiomeTintRenderTypes.java` 是 GPU RenderType，职责不对应，空壳保留不动）。新文件按空壳的目录与命名语气创建：

| 文件 | 职责 | TreePhysics 对应 |
| --- | --- | --- |
| `src/data/BiomeFoliageClimates.ts` | 群系 → 温度/降水表，逐条移植 | `src/data/BiomeFoliage.ts` |
| `src/render/dynamic_biome/DynamicBiomeTintSampler.ts` | `captureSubLevelFoliageTint(dimension, blocks, origin)` | `captureTreeFoliageTint` |
| `FancySubLevelTintCodec.ts`（追加） | 导出 kind 常量、`climateToColormapUv`、坐标步数 | `render/foliage/TintCodec.ts` |

`Sable.ts` 导出 `captureSubLevelFoliageTint`；消费方组装子世界时以其返回值填 `SubLevel.foliageTint`。

## 采样算法（与 TreePhysics 一致）

1. 过滤出 foliage tint 方块；为空则返回平原缺省场。
2. 取这些方块的 X/Z 包围盒中心与四角、平均 Y，得至多 5 个世界采样点（方块世界坐标 = `origin + localLocation`）。
3. 每点 `dimension.getBiome().id` 查气候表（未知群系/异常回退平原），`climateToColormapUv(temperature, downfall)` 得 u/v；群系映射 kind：`mangrove_swamp → 3`、`swamp 系 → 2`、`cherry_grove / pale_garden → 6（固定格位）`、其余 `→ 1`。
4. kind 多数票（中心点优先破平）；固定 kind 直接返回对应格位的零梯度场；否则对入选样本按 x、z 两轴分别线性拟合 u/v，取误差小的轴构成渐变场。

## 固定色图合并

`textures/colormap/foliage_fixed.tga` 扩为 256×256（32×32 个 8×8 像素格）：

- 第 0 行：注册表 `fixed` tint 调色板（沿用现有编码，v 格位 0）。
- 格位 (8,16)：cherry_grove `#B6DB61`；格位 (23,16)：pale_garden `#878D76`（颜色与格位坐标取自 TreePhysics 原图与 `TintSampling.ts` 常量）。

两类使用互不重叠；量化坐标经双线性采样落在格内。运行时编码、molang 解码与渲染控制器均无需改动——群系固定色走既有 kind-6 渐变路径（两端同格位即恒定采样）。

## 验证

构建 + `tsc --noEmit` + 产物校验（色图尺寸与格位颜色、引用完整性），采样器用编译产物做脚本级自测（平原/沼泽/樱花园/混合群系与梯度拟合、无 foliage 方块回退）。
