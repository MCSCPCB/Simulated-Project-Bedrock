# Physics Assembler Pending Items

本轮只实现了微软文档和现有资源能够明确落地的方块层定义。以下内容仍保持空壳或归档，未写入猜测性的实现。

1. **支撑面检查（高优先级）**
   - 原行为：`PhysicsAssemblerBlock.canSurvive` 读取相邻方块的 support shape，只有目标面有实体支撑时才允许放置/保留。
   - Bedrock 难点：`minecraft:placement_filter` 只能表达有限的邻接方块条件，不能等价检查任意方块的 support shape；自定义组件和 `beforeOnPlayerPlace` 的执行时机、破坏回滚行为需要脚本阶段验证。
   - 当前处理：未添加 `minecraft:placement_filter`，保留放置面 trait；后续按已确认方向使用脚本自定义组件或 `beforeOnPlayerPlace`。

2. **方块实体和组装状态**
   - 原行为：`PhysicsAssemblerBlockEntity` 保存主装配器位置、拉杆状态并驱动物理组装/拆解。
   - Bedrock 难点：需要选择稳定的 `minecraft:block_entity`/动态属性或脚本外部存储，并定义区块卸载、复制和破坏时的生命周期。
   - 当前处理：`PhysicsAssemblerBlockEntity.ts` 及相关运行时文件保持空壳。

3. **物理组装运行时**
   - 原行为：`SimAssemblyHelper`、`util/assembly/*` 和 `DisassemblyPrevention` 依赖 Sable SubLevel、刚体和 Create 装配接口。
   - Bedrock 难点：没有 Java SubLevel/Mixin/刚体 API 的直接对等物，候选实现会涉及脚本实体、结构复制或外部引擎，代价和限制不同。
   - 当前处理：只保留脚本目录和原职责归档。

4. **客户端长按交互、UI 与网络同步**
   - 原行为：`PhysicsAssemblerGUIHandler`、`util/hold_interaction/*` 和 `network/packets/*` 处理鼠标按住拖动、服务端校验及失败回包。
   - Bedrock 难点：Script API 输入、JSON UI 和脚本事件的时序与 Java 自定义封包不同，尚未确定统一同步协议。
   - 当前处理：文件保留为空壳，不接入 manifest 脚本入口。

5. **动态拉杆渲染**
   - 原行为：`PhysicsAssemblerRenderer` 根据方块实体状态旋转拉杆 partial model。
   - Bedrock 难点：方块 permutation 只能表达静态状态；动态骨骼动画、方块实体渲染或辅助实体各有性能和交互代价。
   - 当前处理：`lever.json` 仅转换为可复用静态 geometry，未接入动画或运行时渲染。

6. **Java Mixin、服务发现和 NeoForge 元数据**
   - 原行为：拦截引擎方法、暴露平台服务并声明模组加载信息。
   - Bedrock 难点：没有可逆的加载器拦截层；这些内容不属于方块 JSON 或资源包资产。
   - 当前处理：统一归档在 `src/reference/physics_assembler/`，不参与 Bedrock 构建。

7. **Java Ponder 与 Advancement**
   - 原行为：Ponder 场景和 Java Advancement 教程/进度。
   - Bedrock 难点：没有一比一的 Ponder 注册和 Advancement 数据包接口，需另行设计教学内容。
   - 当前处理：归档在 `legacy-ponder` 和 `legacy-advancements`。

8. **模型朝向的最终游戏内视觉校验**
   - 原行为：Java blockstates 以 `FACE`/`FACING` 组合生成 12 个变体。
   - Bedrock 难点：`minecraft:block_face` 提供六个放置面，与 `minecraft:cardinal_direction` 组合后会产生额外的状态组合；本轮用 12 条排列覆盖三类面向，侧面支撑约束留到支撑脚本阶段。
   - 当前处理：碰撞和选择框由 `minecraft:transformation` 随排列旋转；若游戏内验证发现 Euler 旋转顺序或侧面状态需调整，再单独修正排列表。
