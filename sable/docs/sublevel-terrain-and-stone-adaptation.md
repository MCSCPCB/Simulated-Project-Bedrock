# 地形与石材 Fancy 适配研发记录

2026-09-10：本轮注册、源码和生成资源已完成离线验证，游戏内最终渲染效果仍待实测。本文记录实现、验证和边界；面向工具使用者的注册接口位于 `docs/sable/Bedrock-Sable.zh-CN.md`。

## 适配范围

本批范围是纠正分类后的「自然 / 地形与石材」81 种方块。加上原有 62 条记录，`sable/src/data/sublevel-block.json` 共 143 条注册。分类脚本为 `.sample/VanillaBlock/VanillaBlockData/generate-minecraft-block-list.ps1`，输出位于同目录的 `main/`。

分类先匹配功能与形状，再匹配材质名称，避免红石火把、墙体、木门等因名称片段进入错误分组。三个大类下的 1,356 个条目已经重新分类，核对结果没有重复或遗漏。墙体、冰雪、红石、光源和苍白垂须归回各自分组，不属于本次新增 Fancy 注册。

`.sample` 沿用仓库忽略设置，分类脚本与输出的本机修改不会自动进入普通 Git 提交。

## 注册与共享资源

注册表是本批适配的唯一数据入口。生成器中的隐式地形补注册已删除；模型、纹理、材质、硬度、工具与附着属性均从显式注册编译。

生成器构建 dense、sparse 和共享池描述，再分别共享相同的几何、动画、渲染控制器和兼容的客户端实体。共享资源位于各自资源主目录下的 `sable/sublevel/fancy/_shared/`，按内容摘要命名。编译注册表记录通用实体 ID、模型选择索引和共享池描述，运行时不依赖手写资源文件名。

纹理继续使用独立路径，未引入图集。移除注册记录并重新构建会清理对应产物。材质实现手写维护于 `sable/packs/SableRP/materials/entity.material`。

最初完成适配时的测量结果：资源包约 14.06 MiB，几何约 11.68 MiB，Fancy 使用 27 种通用客户端实体。修改前的 Git 版本约为 20.39 MiB 和 17.94 MiB；下降包含清理误纳入方块资源的影响，不等同于单独的共享优化收益。后续草方块深度修复增加了约 1.78 MiB 的共享几何，资源包变为约 15.84 MiB，通用实体数量不变。

## 模型与染色实现

草方块基本模型仍为 `full_block`。只有完整 ID 为 `minecraft:grass_block` 的乘色模型启用草像素壳；复制到其他命名空间的同名方块不会自动获得该壳。

侧面壳按原版 `grass_side.tga` 的 alpha 掩码贪心合并矩形，顶部完整覆盖、底部不覆盖。矩形互不重叠，不包含泥土像素。壳复用既有 `tint_multiply` 的 Equal 深度比较、骨骼轴心和面位置，没有额外偏移或膨胀。dense 模式保留每个矩形在气候 UV 中的连续位置，取色使用 `textures/colormap/grass`。其他完整方块的乘色壳保持原有形式。

### 草方块侧面修复（2026-09-10）

游戏实测发现顶面正常、X 轴两侧未染色、Z 轴两侧染色与灰色交错。检查确认了两处几何问题：

- Bedrock JSON 的 X 坐标与 Blockbench 内部坐标反向，面名保持不变，因此 `east` 使用 `origin.x`，`west` 使用 `origin.x + size.x`。旧草壳误用了相反的面名：应位于外表面的小矩形实际落在方块内部。修复同时对齐两个面的 UV 方向。
- 完整基础侧面与裁切草壳使用不同的顶点和三角形划分。数学上共面不能保证投影、插值及深度量化后的值逐像素相等；旧实现仅验证共面，不足以支撑 `Equal` 深度重绘。基础侧面的草区现在与染色层复用 `grassSideCubes`，两次绘制具有相同的顶点、面方向和骨骼变换。基础侧面的泥土区由同一个贪心算法覆盖掩码补集，草区与泥土区不重叠。

注册模型仍为 `full_block`，六面轮廓和各像素纹理位置不变。每个基础侧面分为 11 个草区矩形和 10 个泥土区矩形；乘色层仅包含 11 个草区矩形。顶面和底面的基础几何继续使用完整方块，只有顶面参与乘色。没有修改 `tint_multiply` 材质、染色偏移、气候输入或纹理路径。

回归检查改为使用独立的 Bedrock 面顶点定义，并直接对照原版纹理 alpha。旧资源在 `west` 面的外表面检查中失败；新检查覆盖基础六面恰好覆盖一次、草壳只覆盖草像素、两次绘制的顶点顺序一致，以及 dense 的四种气候几何和 sparse 模式。修复后重新构建资源，60 项完整回归测试、TypeScript 严格检查和差异格式检查通过。该检查验证生成资源的几何约束，不能代替游戏内转动视角和旋转结构时的实际深度表现验证。

面坐标参考：[Blockbench Bedrock 编解码器](https://github.com/JannisX11/blockbench/blob/master/js/formats/bedrock/bedrock.js) 的立方体导入及 `compileCube`，以及 [Cube 面顶点定义](https://github.com/JannisX11/blockbench/blob/master/js/outliner/types/cube.js) 的 `getVertexIndices` 与立方体顶点坐标。

### 其他模型

| 模型 | 实现说明 |
| --- | --- |
| `grass_path` | 与原版 15 像素高几何对齐，侧面 UV 为 `[0, 1]`、大小 `[16, 15]`。泥土路径与耕地共用，耕地湿度为 `7` 时选择湿润贴图。 |
| `moss_carpet` | 地毯底部对齐，高 1 像素；苍白变体分离底层、短侧面与高侧面，并由四方向状态和上下层标志选择显示。 |
| `pointed_dripstone` | 复用原版缩放后的 45° 交叉双面薄片，贴图定义尖锥轮廓，滴水石锥和硫磺尖刺各变体共享几何。 |
| `multi_face` | 六方向薄片，按基岩版面掩码选择显示；与苔藓侧面复用原版向内 0.1 像素的附着平面。 |
| `sculk_shrieker` | 按 Java 模板构建下部基座、上部镂空结构与内表面，保持原版尺寸和 UV。 |

尖锥专属的 45° 初始旋转放在子骨骼上，共用的槽位骨骼保持一致，避免通用客户端实体切换几何时出现骨骼初始变换冲突。

新增 `alpha_test_emissive`，同时保留透明裁切和既定发光效果。潜声尖啸体使用该材质；原有红石火把裁切发光材质复用同一实现。

## 翻页贴图和通用效果

翻页配置以本机原版 `flipbook_textures.json` 与图像尺寸为依据。`flipbook.textures` 指定动画通道；省略时应用于全部纹理。催发体底面保持静止，尖啸体只有内顶面播放动画。

| 纹理 | 帧数 | 每帧游戏刻 |
| --- | --- | --- |
| 岩浆块 | 3 | 10 |
| 潜声块、潜声脉络 | 4 | 20 |
| 催发体绽放侧面和顶面 | 8 | 1 |
| 尖啸体内顶面 | 10 | 6 |
| 可召唤尖啸体内顶面 | 10 | 3 |

破坏与挖掘粒子使用代表纹理；翻页纹理粒子从首个 16×16 帧内随机取 4×4 区域。草方块使用不染色的泥土粒子。81 种方块的破坏、放置和敲击音效按原版音效组核对，并补充草方块别名及新矿物的音效映射。

工具种类匹配时应用材质速度与效率附魔。达到采收要求时基础挖掘刻数为 `ceil(hardness * 30 / speed)`，未达到时使用系数 `100`。攻击挖掘沿用既有铁傀儡折算基准，掉落调用原版战利品 API 并传入实际工具。`hardness: -1` 的方块在生存和冒险模式下不可破坏。

## 邻接与持久化

放置和拆除复用同一支撑解析链路，六邻域状态传播至稳定后更新渲染与存档。

- 苍白苔藓地毯重算四向侧面和上下层关系；放置时每个可支撑的顶层侧面按 50% 概率生成。
- 滴水石锥与硫磺尖刺重算 `tip/frustum/middle/base/merge`，支撑移除向上或向下级联。
- 潜声脉络仅移除失去支撑的面，最后一面消失时拆除方块；同一格可以追加附着面。
- 玩家放置射线复用既有穿透可穿过方块的查询，穿过已有脉络后找到支撑面，再提交同格加面。
- 邻接结果写入方块状态并持久化；保存失败时恢复先前方块、状态与渲染。

本批邻接指子世界内部网格关系，不会将投影附近的主世界方块加入子世界邻接判断。

## 状态传输

`playAnimation` 继续传递完整快照，包含模型选择、位置、状态、染色和姿态目标；后续姿态输入仍可使用同一接口。静止结构每 40 tick 补发快照，供新跟踪客户端恢复显示。

首次显示延迟修复后，每批新模型在创建后的第 2、4、8、12、20 tick 额外补发最新快照。管理器逐 tick 推进渲染同步，区域与实体完整性巡检仍每 20 tick 执行。实现及验证见 [子世界首次显示延迟修复](sublevel-initial-render-sync.md)。

sparse 编码将状态和占用标记放在低位，其余位分配给坐标，合计使用 24 位。

| 状态类型 | 状态与占用位宽 | sparse 局部坐标范围 |
| --- | --- | --- |
| 普通模型 | 6 位 | 64×64×64 |
| 多面附着 | 7 位 | 64×32×64 |
| 苍白苔藓地毯 | 10 位 | 32×16×32 |

生成器和运行时复用同一位宽描述，修复旧的固定 6 位读取导致高位状态截断的问题。dense 的状态字数随位宽增长，苍白苔藓模型可使用 123 个状态字，快照包含全部状态字。

## 当前边界

墙体已经归回「围栏与攀爬」分组，本轮没有完成其原版几何和连接行为验收。源码保留了 `wall` 与 `wall_connections` 接口，不能把接口存在等同于墙体适配完成。

未适配的楼梯、台阶、按钮等方块在没有显式碰撞形状时，仍沿用旧判定：没有附着支撑规则的未知方块视为整块支撑。因此它们与本批附着方块之间的默认判定尚不能保证与原版一致。后续藤蔓底面修复已将显式 `collisionShape` 数组接入完整支撑面检查，调用方提供的多个碰撞盒按面覆盖判定，见 `sublevel-attachment-rendering-fixes.md`。

本批覆盖外观和状态投影、邻接支撑、放置与破坏效果、工具挖掘。原版随机刻、耕地水分演化、潜声事件传播与守卫召唤、沙砾重力和钟乳石下落实体等专有模拟不由渲染注册表执行。

## 验证记录

实现完成时执行的验证：

- `node sable/tools/verify-sublevel-parity.mjs`：60 项测试通过。
- TypeScript 严格检查：0 个错误。
- `git diff --check`：通过。
- 目标分类与显式注册：81 种逐项一致；126 个纹理路径均存在；目标硬度与来源数据一致。
- 潜声脉络 64 种面组合、苍白苔藓地毯 162 种状态组合通过 dense、sparse 及可用共享池的显示检查。
- 原版几何和 UV、草壳像素覆盖和连续 UV、翻页通道、音效、粒子与工具速度通过对照检查。
- 邻接级联、同格加面、存档重建与保存失败回滚通过运行时夹具检查。

这些验证基于本机参考数据和离线运行时夹具。Minecraft 中的最终光照、透明裁切、草色与原版并排效果、加载速度、区块卸载恢复和新玩家加入后的显示，仍需要游戏内实测。

## 参考资料

- 基岩版资源：`.sample/VanillaBlock/VanillaBlockResource/bedrock-sample-1.26.40.5`。
- Java 模型与标签：`.sample/VanillaBlock/VanillaBlockResource/minecraft-assets-26.2`。
- 基岩版模型参考：`.sample/VanillaBlock/VanillaBlockResource/BedrockBlockRender-main`。
- 分类和硬度源：[minecraft-data Bedrock 1.26.30](https://github.com/PrismarineJS/minecraft-data/tree/master/data/bedrock/1.26.30)。分类索引中的最新版本标记为 1.26.45。
- 本机未提供的 Java 邻接实现：[MossyCarpetBlock](https://github.com/boggymc/MinecraftDeobfuscated-Mojang/blob/snapshot/minecraft/src/net/minecraft/world/level/block/MossyCarpetBlock.java)、[PointedDripstoneBlock](https://github.com/boggymc/MinecraftDeobfuscated-Mojang/blob/snapshot/minecraft/src/net/minecraft/world/level/block/PointedDripstoneBlock.java)、[MultifaceBlock](https://github.com/boggymc/MinecraftDeobfuscated-Mojang/blob/snapshot/minecraft/src/net/minecraft/world/level/block/MultifaceBlock.java)。使用时将 Java 状态语义映射到基岩版名称与方向位。

minecraft-data 的 `harvestTools` 数字 ID 与配套基岩版物品 ID 未能可靠对应，本批工具种类和等级同时参考本机 Java 标签，未直接用该数字表反查工具。
