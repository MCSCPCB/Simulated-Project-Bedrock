# Sable 子世界迁移修复设计

## 功能目标

以 TreePhysics 的方块模拟和实体生命周期为行为基线，在 sable 已有 `sublevel`、`content`、`api` 分层内修复迁移遗漏。方块渲染与交互仍由 sable 当前架构负责；不恢复 TreePhysics 的物理、树木拓扑或乘骑能力。

## 已读链路与现状

### 染色

`ServerSubLevelContainer.createSubLevelFromRegion` 捕获方块后调用 `captureSubLevelFoliageTint`。注册表模型的 tint 有 `foliage` 与 `fixed` 两种方法。采样器必须只把 `model.tint?.method === "foliage"` 的模型纳入群系范围。当前条件仅测试 `tint !== undefined`，会把 spruce/birch 等 fixed 色方块纳入范围，改变包围盒、中心和平均高度，造成取色回归。源码与 BP 编译产物都必须同步。

子世界级的 colormap 渐变只存在于 dense 实体的专用 colormap 几何（112×112、逐槽 uv=16k，同 TreePhysics 树叶碎片）。因此 foliage 染色模型打包时永不逐出 sparse、也不并入描述字池——每个 7×5×7 桶保持 dense，与 TreePhysics「树叶只有 dense 盒」一致；fixed 染色（云杉/白桦叶）取恒定调色板格，任何路线均安全。

### 空手挖掘

`SubLevelPlayerInteraction.#handleSwing` 在求取当前物品后保留 `if (!player.isSneaking && !itemStack) return`。TreePhysics 中该分支把站立空手攻击交给物理推力；sable 已排除物理推力，因而这条迁移残留会阻断 `resolveSubLevelEditAction` 和 `handleBreak`。删除该提前返回即可保留潜行、触控、放置和食物优先链路。

### 互动目标方块

`SubLevelOutlineController.#tickPlayer` 在射线命中后按刷新条件调用 `SubLevelInteractionTargetBlockController.syncPlayer`。桌面使用跨过源格的代理位置，触控使用玩家头部格；控制器只替换空气或水，并记录原始 permutation。启动阶段注册 `sable:interaction_target_cleanup`，每 20 tick 恢复无主代理。资源拥有 selection box、无 collision box、liquid detection 和 geometry。问题定位重点是启动注册顺序、每 tick 同步和释放，不改变头部锚点与现有桌面算法。

### 选择框

当前 outline 控制器已经没有潜行门槛，`PlayerOutlineState.mode` 只有 `block`。命中后创建/挂接 `sable:block_outline`，写入 block preview 属性和 preview 坐标，随后按 reveal 延迟显示。选择框故障不能通过回退到潜行阶段解决；应只修复实体资源、属性写入或刷新链路中实际缺失的部分。

### 骑手家族契约

载体的 `minecraft:rideable.family_types` 按家族过滤骑手，是描边挂接、代理方块存续与容器存储挂接共同的承载前提。契约为：fancy/vanilla 载体分别声明 `["fancy_model", "sable_persistent_rider"]` 与 `["block", "sable_persistent_rider"]`；渲染模型与池实体声明所在路线的家族；`sable:block_outline` 声明 `["fancy_model", "block", ...]` 以骑乘任一路线；容器存储实体（如 `sable:chest`）声明 `sable_persistent_rider`，从而既可骑乘任一载体、又不落入启动阶段按渲染家族回收的清扫范围。`#acquireViewer` 挂接失败会同步撤销 interaction target，因此家族错配会同时表现为描边缺失与代理方块闪断。

### 模型朝向与合并骨架定律

客户端实体会把其全部几何的骨骼按名字合并成单一骨架：同名骨骼的 rest 变换（pivot/rotation）在所有几何中必须一致，否则互相覆盖（池成员各带朝向时表现为"全部朝一个方向/旋转互相污染"）。因此：

- 模型固定朝向（pillar 轴向、箱子/蜂巢/可可朝向）一律由 transform **动画**施加在 `slot_{s}` 骨骼上——专属实体写常量 rotation，池实体写按 `v.f{s}` 家族条件求和的 molang 表达式。这正是 TreePhysics 对原木轴向（状态解码 pitch/roll）与 cube 方块朝向（`180 + (state - 1) * 90`）的技术，数值口径照搬（箱子 south=0/west=1/north=2/east=3，yaw=180+turn·90）。
- 几何库中 `slot_{s}` 统一枢轴 `[0,-16,0]`（方块中心），跨类型共池不再产生枢轴合并冲突；静态装饰旋转只允许出现在名字全库一致的子骨骼上（藤蔓面片、垂根/苔须 element、绞刑木之心 variant 子骨骼）。

### 容器优先级与 2.9.0 破坏事件

箱子互动优先于编辑手势：桌面上由既有的 standing-chest 手势认领（右键取消放置）保障；触屏上"长按挖掘"与"长按互动"共用同一手势，破坏路径（swing 分支与延迟提交）在非潜行且准星命中可交互容器时一律让位，长按只走原生实体交互开箱。潜行保持原语义（绕过容器预览，可挖掘箱子）。

脚本 API 2.9.0 的 `playerStartBreakingBlock` 作为手势稳定信号接入：引擎在交互代理方块上进入破坏模式即为权威的"非放置"证据（清掉误判的待放置），并在触屏上作为 Mine 挥击丢失时的破坏后备入口——复用既有 `queueTouchBreakAction` 的点按/长按仲裁窗口与容器让位守卫，不改变任何手势判别语义（手机端点击放置/长按挖掘/长按互动，电脑端左键挖掘/右键放置/右键交互）。`playerCancelBreakingBlock` 不接入：其自然用途（提前清挂起破坏、提前重置进度）都会改变既有的提交时机与 10 tick 进度衰减语义。BP manifest 的脚本依赖随之升至 2.9.0。

### 挖掘硬度

所有被投影的方块都可被挖掘：注册表带 `hardness` 的按注册值，未注册或未声明硬度的方块按默认硬度 1（走 vanilla 渲染路线的方块也不例外）。`handleBreak` 不得以"无注册项"为由提前返回。

### 箱子

`ChestSubLevelBehavior` 注册 `minecraft:chest` profile，捕获世界 inventory，新增子世界方块时创建 `sable:chest` 存储实体并填充物品，删除方块时调用 `settleStorages`。`SubLevelContainerInteractionController` 负责实体身份、骑乘挂接、预览激活、开合状态、实体死亡和保存绑定。放置流程在 `ServerSubLevelContainer.placeBlockForPlayerEdit` 中构造完整 permutation，再调用行为。行为链路中的实体 inventory 必须始终以 profile 的 27 格为契约，不能吞掉创建或结算错误。

### 持久化与结算

`SubLevelStorage`、`SubLevelSerializer` 和 schema 现在由 `ServerSubLevelContainer` 正式调用：记录子世界 id、世界维度、局部原点、方块快照、foliage tint 和 container storage bindings；创建后、编辑提交后持久化；启动时先加载存储实体身份，再恢复子世界并声明 bindings，完成未声明实体回收。

复合渲染器在方块放置或状态更新时必须迁移 persistent storage riders。TreePhysics 的 renderer 在重建锚点时收集并重新挂接这些实体；Sable 的整体重建路径复用同一语义，避免箱子实体在渲染替换后脱离 carrier。

恢复链的移植语义：计划卸载先保存再销毁运行时投影，退出重进时由存档重新创建；只有玩家自然破坏方块时，方块编辑链显式结算该方块的容器。存储实体的外部伤害必须在 `world.beforeEvents.entityHurt` 中取消；系统自身执行 inventory 掉落的 kill 需要使用 settling 标记绕过该拦截。kill 返回失败时立即暴露错误，不能静默 discard 或把安全失败当作正常结算。

投影实体被外部移除（如 /kill）属于当前渲染的终止性损坏，但方块记录仍是权威数据：完整性检查发现损坏时先保存、再原地重建投影并迁移幸存的 persistent storage riders，子世界本体不消失。区块未加载只会使实体句柄失效而不丢失实体，完整性判定必须以投影区域已加载为前提。

## 计划改动

1. 恢复 foliage 过滤条件，构建同步 JS。
2. 删除空手 swing 提前返回，构建同步 JS。
3. 修正 interaction target / outline 的启动和每 tick 刷新中确认的具体断点，保持桌面跨格代理与触控头部代理语义。
4. 以现有 profile 和 storage controller 为唯一箱子链路，修复放置/恢复时的绑定登记及模型状态更新，不新增方块专用主控制器分支。
5. 扩展序列化结构以保存原点；在 `ServerSubLevelContainer` 中加入统一 save/restore 入口；让 container controller 暴露现有绑定集合并接入 `registerSavedBindings` / `bindSubLevel`，移除 session-only 清理。
6. 为 sub-level teardown 传递自然破坏与系统移除语义；自然方块移除继续结算容器，计划移除保存后释放运行时，kill 拦截失败只抛错。
7. 按骑手家族契约对齐载体 `family_types` 与箱子/描边实体家族；模型朝向全部迁入 transform 动画（专属实体常量、池按家族条件表达式），几何库统一 `slot_{s}` 枢轴。
8. `handleBreak` 对未注册方块回落默认硬度 1；完整性检查加区域加载前提，损坏投影保存后原地重建。
9. foliage 染色模型仅打包 dense colormap 实体（不逐出 sparse、不入池）。
10. 触屏破坏路径让位可交互容器；接入 `playerStartBreakingBlock` 作为非放置证据与触屏破坏后备；manifest 脚本依赖升至 2.9.0。

## 验证

统一执行 sable 注册表构建工具、TypeScript 静态检查和产物差异审查；源码修改必须同步 `packs/SableBP/scripts/sable`。最终核对 interaction target、outline、chest 资源引用和序列化 schema 的所有字段。
