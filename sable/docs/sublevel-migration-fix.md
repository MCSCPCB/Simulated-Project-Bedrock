# Sable 子世界迁移修复设计

## 功能目标

以 TreePhysics 的方块模拟和实体生命周期为行为基线，在 sable 已有 `sublevel`、`content`、`api` 分层内修复迁移遗漏。方块渲染与交互仍由 sable 当前架构负责；不恢复 TreePhysics 的物理、树木拓扑或乘骑能力。

## 已读链路与现状

### 染色

`ServerSubLevelContainer.createSubLevelFromRegion` 捕获方块后调用 `captureSubLevelFoliageTint`。注册表模型的 tint 有 `foliage` 与 `fixed` 两种方法。采样器必须只把 `model.tint?.method === "foliage"` 的模型纳入群系范围。当前条件仅测试 `tint !== undefined`，会把 spruce/birch 等 fixed 色方块纳入范围，改变包围盒、中心和平均高度，造成取色回归。源码与 BP 编译产物都必须同步。

### 空手挖掘

`SubLevelPlayerInteraction.#handleSwing` 在求取当前物品后保留 `if (!player.isSneaking && !itemStack) return`。TreePhysics 中该分支把站立空手攻击交给物理推力；sable 已排除物理推力，因而这条迁移残留会阻断 `resolveSubLevelEditAction` 和 `handleBreak`。删除该提前返回即可保留潜行、触控、放置和食物优先链路。

### 互动目标方块

`SubLevelOutlineController.#tickPlayer` 在射线命中后按刷新条件调用 `SubLevelInteractionTargetBlockController.syncPlayer`。桌面使用跨过源格的代理位置，触控使用玩家头部格；控制器只替换空气或水，并记录原始 permutation。启动阶段注册 `sable:interaction_target_cleanup`，每 20 tick 恢复无主代理。资源拥有 selection box、无 collision box、liquid detection 和 geometry。问题定位重点是启动注册顺序、每 tick 同步和释放，不改变头部锚点与现有桌面算法。

### 选择框

当前 outline 控制器已经没有潜行门槛，`PlayerOutlineState.mode` 只有 `block`。命中后创建/挂接 `sable:block_outline`，写入 block preview 属性和 preview 坐标，随后按 reveal 延迟显示。选择框故障不能通过回退到潜行阶段解决；应只修复实体资源、属性写入或刷新链路中实际缺失的部分。

### 箱子

`ChestSubLevelBehavior` 注册 `minecraft:chest` profile，捕获世界 inventory，新增子世界方块时创建 `sable:chest` 存储实体并填充物品，删除方块时调用 `settleStorages`。`SubLevelContainerInteractionController` 负责实体身份、骑乘挂接、预览激活、开合状态、实体死亡和保存绑定。放置流程在 `ServerSubLevelContainer.placeBlockForPlayerEdit` 中构造完整 permutation，再调用行为。行为链路中的实体 inventory 必须始终以 profile 的 27 格为契约，不能吞掉创建或结算错误。

### 持久化与结算

`SubLevelStorage`、`SubLevelSerializer` 和 schema 现在由 `ServerSubLevelContainer` 正式调用：记录子世界 id、世界维度、局部原点、方块快照、foliage tint 和 container storage bindings；创建后、编辑提交后持久化；启动时先加载存储实体身份，再恢复子世界并声明 bindings，完成未声明实体回收。

复合渲染器在方块放置或状态更新时必须迁移 persistent storage riders。TreePhysics 的 renderer 在重建锚点时收集并重新挂接这些实体；Sable 的整体重建路径复用同一语义，避免箱子实体在渲染替换后脱离 carrier。

恢复链的移植语义：系统计划的卸载、超时、越界和非预期实体丢失都先保存并销毁运行时投影，退出重进时由存档重新创建；只有玩家自然破坏方块时，方块编辑链显式结算该方块的容器。存储实体的外部伤害必须在 `world.beforeEvents.entityHurt` 中取消；系统自身执行 inventory 掉落的 kill 需要使用 settling 标记绕过该拦截。kill 返回失败时立即暴露错误，不能静默 discard 或把安全失败当作正常结算。

## 计划改动

1. 恢复 foliage 过滤条件，构建同步 JS。
2. 删除空手 swing 提前返回，构建同步 JS。
3. 修正 interaction target / outline 的启动和每 tick 刷新中确认的具体断点，保持桌面跨格代理与触控头部代理语义。
4. 以现有 profile 和 storage controller 为唯一箱子链路，修复放置/恢复时的绑定登记及模型状态更新，不新增方块专用主控制器分支。
5. 扩展序列化结构以保存原点；在 `ServerSubLevelContainer` 中加入统一 save/restore 入口；让 container controller 暴露现有绑定集合并接入 `registerSavedBindings` / `bindSubLevel`，移除 session-only 清理。
6. 为 sub-level teardown 传递自然破坏与系统移除语义；自然方块移除继续结算容器，计划/非预期移除只保存并释放运行时，kill 拦截失败只抛错。

## 验证

统一执行 sable 注册表构建工具、TypeScript 静态检查和产物差异审查；源码修改必须同步 `packs/SableBP/scripts/sable`。最终核对 interaction target、outline、chest 资源引用和序列化 schema 的所有字段。
