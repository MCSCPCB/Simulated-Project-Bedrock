# 附着方块显示与藤蔓放置修复

## 问题与根因

苍白苔藓地毯和幽匿脉络的可绘制骨骼直接挂在 `model_offset` 下，没有经过 `slot_N`。现有变换动画只将槽位坐标、局部旋转和占用缩放写入 `slot_N`，因此这些薄片没有移动到实际方块位置。普通苔藓地毯直接使用 `slot_N`，不受此缺陷影响。

藤蔓放置时没有根据点击的支撑面写入 `vine_direction_bits`。默认值 `0` 进入既有支撑解析后，没有任何可保留的侧面，放置被拒绝。另外，同格附着面追加的射线与状态合并此前只处理 `multi_face`。

## 修改

- 苍白苔藓地毯的基础、短侧面和高侧面通道，以及幽匿脉络的六面通道，补齐统一的 `slot_N` 父骨骼。未正式适配的 `wall` 模板同步修复该结构缺陷。
- 槽位父骨骼控制位置、姿态和占用；子骨骼继续由原有方块状态控制显示。渲染控制器不会因新增父骨骼而绕过状态筛选，共享池也不会把槽位名称当成附着方向解码。
- 附着薄片的南北位置与 Sable 的世界 Z 轴反向投影一致。按 Bedrock 最小 X 面名为 `east` 的约定修正东西面的正反 UV；水平薄片背面反转 V，使正反面相同位置采样相同纹理像素。原版向内 `0.1` 像素的距离保持不变。
- 藤蔓点击支撑块的北、东、南、西面时，分别写入方向位 `1`、`2`、`4`、`8`，对应藤蔓所在格的南、西、北、东侧支撑。
- 藤蔓复用现有多面附着的射线穿透和新增面支撑验证。同一单元格不会再把第二个方向位合并到已有藤蔓；支撑判断传入实际侧面，避免把泥土路径等局部模型的完整底面当作可附着侧面。
- 邻接状态更新、破坏、音效、掉落、粒子、存档及恢复沿用现有流程。

本次没有新增放置框架或渲染输入接口，注册表数据、材质和翻页参数无需调整。行为包脚本与资源包通过既有生成器重新构建，共享资源继续位于 `fancy/_shared`。

## 验证

旧资源在新增检查中复现了两个缺陷：可绘制骨骼没有槽位祖先，以及两个不同槽位的幽匿脉络出现在相同位置。

修复后的检查覆盖：

- 所有生成并被客户端引用的几何均无重复骨骼，每个可绘制骨骼都经过槽位祖先，通用实体不同几何之间的初始变换一致。
- 幽匿脉络 64 种面掩码、苍白苔藓地毯 162 种状态组合在 dense、sparse 及可用共享池中选择正确的面。
- 首槽位与末槽位（sparse/pool 的 `25`、dense 的 `244`）、六向附着、苔藓上下层以及旋转姿态的实际变换后面位置正确；空槽位没有多余表面。
- 薄片正反面按顶点逐一检查 UV，确保相同物理位置对应相同纹理像素。
- 藤蔓四向放置、同格第二面拒绝、重复拒绝、失去支撑后逐面移除、下方藤蔓级联、存档恢复，以及两种状态键命名形式。
- 玩家射线仍能穿过已有幽匿脉络或藤蔓找到后方支撑；目标单元格已被占用时，放置保持失败且状态和音效不变。

完整回归 65 项全部通过；TypeScript 严格检查为 0 个错误，差异格式检查通过。检查使用生成资源与离线运行时夹具，最终裁切、光照和游戏内交互观感仍需原生客户端确认。

## 当前边界

藤蔓的底面附着已在后续修复中接入，见下一节。方向位 `0` 仍只表示没有侧面；是否显示顶部由邻接关系决定。

`wall` 仍未完成原版几何和连接行为验收。此次修正公共模板的骨骼和南北朝向，不代表新增墙体适配。

## 藤蔓底面附着（2026-09-11）

依据优先级为：基岩规则 → Java 规则 → 两者都没有依据时，才采用用户指定的底面可附着规则。PrismarineJS 的 Bedrock 1.26.30 映射只记录四向位，所有映射的 Java `up` 都为 `false`；PocketMine 的藤蔓实现直接拒绝竖向放置。前者说明状态编码，后者说明该社区服务端的实现，两者都不足以确定原版基岩客户端的底面限制，因此底面支撑采用 Java `VineBlock`、`MultifaceBlock` 的完整面规则。

Java 的条件是：被接触方块的支撑形状或碰撞形状，至少有一种覆盖完整接触面。藤蔓位于上方方块下方时，检查上方方块的底面。现有 `isSolidAttachmentHost` 统一供放置存活检查和顶部 `renderState` 派生使用：石头、树叶等整块模型，以及土径、耕地、苔藓地毯基础层和幽匿尖啸体的完整底面可以提供附着；箱子、上方藤蔓薄片、苍白苔藓地毯的侧面层不能提供完整底面。粉雪在空实体上下文中的支撑与碰撞形状均为空，也不提供支撑。

显式 `collisionShape` 使用现有 TreePhysics/Sable 方块局部 `0..1` 坐标约定，作为调用方对默认形状的覆盖。`full`、`none` 和 `collidable` 保留原有含义；碰撞盒数组现在参与同一个支撑面函数的判定。取接触边界上的盒面，在矩形边缘处分割并检查每个区域，允许多个盒面合成完整面，重叠面积不能抵消空洞。原有草像素矩形算法处理纹理整数掩码，无法直接处理任意碰撞盒边界，因此此检查直接扩展在既有支撑函数内。

当前注册模型的默认支撑规则和显式碰撞盒可以据此判定。没有模型支撑数据、没有显式碰撞形状的其他方块仍存在既有默认支撑行为，不能据此声称所有未适配原版方块都已还原 Java 碰撞形状；相关边界见 `sublevel-terrain-and-stone-adaptation.md`。

注册表保留 16 种侧面组合，为每种 `vine.faces` 加入 `up`。顶部几何使用与附着面相同的水平双面薄片，直接放在当前单元格顶边下方 `0.8` 像素（`y = -8.8`），不再通过北侧薄片的 `-90°` 旋转推导位置，避免 Bedrock 旋转方向把它落到下方方块顶面。顶部薄片复用附着面 UV 映射；基础绘制与乘色绘制共用状态筛选，保持完全重合的几何，也没有增加染色偏移。

顶部占用使用 `SubLevelBlock.renderState` 的 `0/1`，由现有邻接状态传播函数计算。该字段覆盖对应模型的运行时状态输入，不写入原版 `states`，也不写入结构存档；捕获和存档恢复在首次生成模型前从方块网格重新计算。原版 `vine_direction_bits` 始终保持 `0..15`，掉落与原版方块还原继续接收原有状态。

放置仅顶部附着的藤蔓后，同格第二个侧面放置会被拒绝；已有侧面时也不会再追加顶部。新增或替换上方方块时，按其底面支撑更新顶部；移除顶部支撑时保留仍有支撑的侧面；侧面全部失效但上方仍有完整支撑底面时保留顶部；全部支撑消失时拆除。上方藤蔓可以向下延续相同侧面，但不能凭此生成水平顶部。点击下方方块的顶面仍不提供藤蔓底部附着。

藤蔓继续使用既有 sparse 与共享池，因为表面植被沿用 sparse 气候采样。没有为顶部增加独立渲染实体，仍使用独立纹理路径、foliage colormap 和 `playAnimation` 状态输入。

验证覆盖底面放置射线、重复放置与音效、同格第二面拒绝、顶部和侧面独立放置、特殊模型底面、原版状态传入战利品 API、主世界捕获和真实序列化后的重建。箱子和粉雪在放置、邻接替换、捕获与存档恢复中均不产生顶部；上方藤蔓仅延续侧面，失去源支撑时级联移除。六向碰撞面覆盖检查包含半高实体、拼接、重叠、重复面、狭缝、内部空洞和偏离接触平面的盒面。全部 32 种顶部与侧面组合检查 sparse 和共享池中的基础/染色面数量、逐顶点重合、原版顶部高度、顶部双面 UV 和空槽位隐藏。

此次规则修正后重新构建 BP/RP，完整回归覆盖同格附着拒绝、顶部几何、材质和翻页数据，TypeScript 严格检查为 0 个错误，差异格式检查通过。原生客户端的最终显示和交互仍需游戏内实测。

## 幽匿翻页纹理与透明裁切（2026-09-11）

幽匿脉络的注册材质保持 `alpha_test`。其翻页控制器使用 `alpha_block_flipbook`，该派生材质现在明确加入 `ALPHA_TEST` 和 `USE_UV_ANIM`，透明像素会按裁切处理，不会被当成不透明面。幽匿方块本体仍使用 `opaque_emissive`；幽匿尖啸体继续使用 `alpha_test_emissive`。

翻页数据与 `.sample/VanillaBlock` 的基岩版 `flipbook_textures.json` 和 Java 版资源核对结果如下：`sculk`、`sculk_vein` 均为 4 帧、每帧 20 tick；Java PNG 高度均为 `16 × 4`，对应 `.mcmeta` 的 `frametime: 20`。Sable 的 UV 动画按同样的 tick 周期切换 4 帧。Java 资源还标记了 `interpolate: true`；当前独立纹理路径只实现离散帧切换，尚未加入 Java 的帧间插值，因此帧数和节拍一致，但插值观感仍以基岩客户端实测为准。

联网依据：

- [Java VineBlock](https://github.com/boggymc/MinecraftDeobfuscated-Mojang/blob/snapshot/minecraft/src/net/minecraft/world/level/block/VineBlock.java)
- [Java MultifaceBlock](https://github.com/boggymc/MinecraftDeobfuscated-Mojang/blob/snapshot/minecraft/src/net/minecraft/world/level/block/MultifaceBlock.java)
- [Java ChestBlock](https://github.com/boggymc/MinecraftDeobfuscated-Mojang/blob/snapshot/minecraft/src/net/minecraft/world/level/block/ChestBlock.java)
- [Java PowderSnowBlock](https://github.com/boggymc/MinecraftDeobfuscated-Mojang/blob/snapshot/minecraft/src/net/minecraft/world/level/block/PowderSnowBlock.java)
- [PrismarineJS Bedrock 1.26.30 状态映射](https://github.com/PrismarineJS/minecraft-data/blob/master/data/bedrock/1.26.30/blocksB2J.json)
- [PocketMine Vine](https://github.com/pmmp/PocketMine-MP/blob/stable/src/block/Vine.php)

## 本机依据

- `VanillaBlockResource/minecraft-assets-26.2/assets/minecraft/models/block/sculk_vein.json`、`mossy_carpet_side.json` 与对应 blockstates。
- `VanillaBlockResource/bedrock-sample-1.26.40.5/metadata/vanilladata_modules/mojang-blocks.json` 的藤蔓状态定义。
- 项目已验证的藤蔓骨骼、支撑方向位和 Bedrock 面顶点映射。

前两项路径均相对于 `.sample/VanillaBlock`。
