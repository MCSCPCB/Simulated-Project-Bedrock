# Progress

## 2026-09-04

- 初始化迁移核对计划。
- 完成两项目首轮文件与关键字扫描，确认相关模块均已迁移，开始做逐链路精确对照。
- 定位到染色采样把 fixed tint 误当 foliage tint 的高度可疑迁移错误；继续核对资源和事件接线。
- 通过提交历史与迁移文档确认染色错误是 `8f13666` 引入的单行回归。
- 确认空手不能挖掘源于迁移时残留的 TreePhysics 物理推力提前返回。
- 完成开工前集中读取；已将染色、互动目标、选择框、箱子和持久化/结算链路写入 `sable/docs/sublevel-migration-fix.md`，开始产品代码修改。
- 复核互动目标与选择框运行入口：startup 自定义组件注册、每 tick 同步、触控头部代理、桌面跨格代理和 block outline 显示链路均已接通，未发现可直接归因于“未启动/潜行门槛/资源缺失”的确定性迁移错误。
- 复核箱子创建链：区域捕获与放置共用 `ChestSubLevelBehavior.onBlockAdded()`，共同失败点收敛到 `SubLevelContainerInteractionController.createStorage()` 的 persistent rider 挂接；继续核对各渲染后端的载体分配规则。
- 修复 foliage 采样条件，只让使用群系 foliage colormap 的模型影响采样范围。
- 删除站立空手 swing 的旧物理推力提前返回，空手挥击现在可进入统一的子世界挖掘动作解析。
- 会话工作目录切换到了同级 `PhysicsAPI`，从父目录重新定位并恢复 `Simulated-Project-Bedrock` 的既有规划与产品改动；未在错误仓库写入文件。
- 复核当前半成品：`ServerSubLevelContainer` 已引用持久化恢复入口，但 `#restoreSubLevel`、`#saveRecord`、`#findRecord`、`#containerBindings` 尚未实现，销毁路径也尚未传递移除原因，当前源码不能通过类型检查。
- 确认 container controller 已包含可复用的伤害拦截、系统结算标记、binding 注册/绑定和 storage 重建机制；剩余缺口集中在子世界生命周期与启动装配接线，而非新建容器状态层。
- 对照 TreePhysics 初始化和原生 storage 死亡事务：确定采用“binding 预登记 → 运行时恢复 → 未认领实体清理”顺序，以及所有持久化失败直接抛错的语义。
- 完成第一版子世界生命周期接线：统一运行时记录创建/恢复、创建与编辑保存、自然清空删除、计划/视觉异常持久化卸载、容器死亡/异常回调及启动恢复顺序。
- TypeScript 严格检查在显式包含现有 `src/generated/sublevel-block-registry.d.ts` 后通过；首次单入口检查仅因虚拟 registry 模块声明未纳入命令而失败，未发现产品代码类型错误。
- 事务复核确认自然拆除、计划 remove、storage 原生死亡和 storage 异常丢失的存档边界；未添加不存在于 sable 架构的自动计时器或加载范围判定。
- 开始收尾审查 planned / unexpected 卸载：确认现有 `ServerSubLevelContainer.#destroyRecord()` 会销毁投影与 handle，正在核对箱子 behavior 和 renderer 是否同步释放 storage entity 及 controller 索引。
- 确认 renderer 销毁 carrier 时会保留 persistent storage entity；planned / unexpected 的库存本体安全，container controller 的旧 handle、block 索引、玩家预览/打开状态仍未释放，继续对照 TreePhysics 确定最小解绑接口。
- 完成 container 运行时解绑收尾：新增单一 `unbindSubLevel()` 并用于 planned、unexpected 和恢复失败路径，保留 storage identity/实体，删除失效 handle 及交互索引；同时将已列入 manifest 但缺失 record 的情况改为显式错误。
- 核对 `ServerSubLevelContainer` 构造调用：仓库仅有默认 bootstrap 一处，维持新 container 依赖为必填，不添加旧签名兼容分支。
- 恢复会话后按实际进度更新计划：模块对照及持久化/kill 拦截阶段已完成；当前集中验证 renderer 重建时 persistent storage rider 的重新绑定事务与生成脚本同步情况。
- 明确 renderer 重建断点：`ServerSubLevelContainer.#recreateRender` 和 `#applyStateUpdates` 共用整体替换路径，复合渲染下会丢失箱子 storage 的 carrier 关系；修复将沿用 TreePhysics renderer 内部的 persistent rider 迁移方式。
- 完成收尾核对：触控承接、桌面容器交互和 interaction target 路由与 TreePhysics 同源，未发现需要改动的迁移差异；sable 没有独立的加载范围/超时结算调度器。
- 补齐渲染重建的异常事务，迁移持久化骑手失败时清理未提交的新投影后再暴露原始错误。
- 收尾复验通过：子世界方块注册表构建生成 62 个注册项和 179 个模型资源；显式纳入生成 registry 声明的 TypeScript 严格检查通过；Sable BP 的 50 个 JavaScript 产物均通过 `node --check`；`git diff --check` 无空白错误。
- 源码与部署脚本逐链路复核完成，未发现需要新增的 interaction target、outline、空手挖掘或箱子迁移修复；Sable 仍没有独立的加载范围/超时自动结算调度器。
