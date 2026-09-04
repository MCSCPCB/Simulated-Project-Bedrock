# Findings

## 初步目录对应

- TreePhysics 的已验证能力分布在 `render/contraption`、`render/outline`、`physics/obb`、`physics/contraption` 与生命周期/交互事件模块。
- sable 已将主体迁移到 `sublevel`、`content/raycast`、`content/sublevel_*` 及资源包中的 `sable/sublevel` 命名空间。
- sable 含独立的 foliage colormap、方块声音、序列化与持久化模块，问题更可能来自调用链或迁移参数差异，而不是资源完全缺失。
- 初始检查时 sable Git 工作树干净；本任务尚未触碰产品代码。

## 精确模块映射

- 染色：TreePhysics `content/tree/foliage/TintSampling.ts`、`render/foliage/TintCodec.ts`；sable `render/dynamic_biome/DynamicBiomeTintSampler.ts`、`sublevel/render/fancy/model/FancySubLevelTintCodec.ts`。
- 互动目标与选择框：TreePhysics `content/contraption/interaction/{TargetBlock,OutlineController}.ts`；sable `content/block_placement/SubLevelInteractionTargetBlock.ts`、`content/block_outline_render/SubLevelOutlineController.ts`。
- 挖掘：sable 已拆到 `content/punching/SubLevelPlayerInteraction.ts` 等模块。
- 箱子：TreePhysics `ContainerInteraction.ts`；sable `assembly/SubLevelContainerInteraction.ts` 与 `blocks/vanilla/chest/ChestSubLevelBehavior.ts`。
- 持久化/结算：sable 有完整的 tickets、holding storage、tracking/finalize packet 结构，需要核查调用语义。
- sable 根目录不是 npm/tsc 项目，没有 `package.json` 或 `tsconfig.json`；后续验证应使用仓库自身工具链。

## 初步可疑差异

- sable 的 `captureSubLevelFoliageTint` 当前把所有带任意 `model.tint` 的方块计入群系采样；TreePhysics 只采样真正使用群系 foliage colormap 的方块。sable 的泛化模型明确区分 `fixed` 与 `foliage`，固定染色方块会错误扩大采样范围并改变中心/高度，符合“有时取色错误”的现象。
- 互动目标控制器代码本身已迁移头部锚点与桌面射线代理算法，需继续确认启动、资源 JSON、调用刷新条件以及编译后的 BP 脚本是否同步。
- 选择框控制器目前仍同时负责 block outline 与放置预览；需确认 `#canPreview`、raycast 和资源实体定义，没有发现设计上要求潜行的条件。
- sable 仓库实际 Git 根为 `Simulated-Project-Bedrock`，产品目录是其 `sable/` 子目录；后续 Git 路径需按此结构解释。

## 已确认根因/历史

- 染色根因已由提交历史直接确认：提交 `8f13666` 把原本正确的 `model.tint?.method === "foliage"` 改成了 `model.tint !== undefined`。项目自己的迁移文档也明确规定只采样 `foliage`，因此应精确恢复前者。
- 同一提交将 outline 从“潜行后结构描边再进入方块阶段”改为“所有玩家直接使用 block 阶段”，这与用户给出的正确效果基线一致，不能回退整个提交，只能修复其中的独立迁移错误。
- sable 同时维护 `src/*.ts` 与已部署的 `packs/SableBP/scripts/*.js`；任何运行时修复必须通过现有构建工具同步产物，单改 TS 不会改变游戏内行为。

## 问题 3 根因

- `SubLevelPlayerInteraction.#handleSwing` 保留了 TreePhysics 的 `if (!player.isSneaking && !itemStack) return`。在 TreePhysics 中这条分支把站立空手攻击交给物理推力；sable 已删除物理推力，却保留了提前返回，导致空手挖掘信号永远到不了 `handleBreak`。这是确定的迁移残留，应删除该拦截。

## 箱子链路现状

- 注册表已把 `minecraft:chest` 标为 `placeable: true`，并具备四向模型。
- 放置提交后会触发 chest `onBlockAdded`，创建 27 格原生存储实体；世界区域捕获会在移除世界方块前读取箱内物品。
- 当前箱子 teardown 中存在吞异常并转为 discard 的旧式兜底，与本项目规范及用户要求的持久化恢复策略冲突；将在结算链路阶段统一修正，不能用它掩盖创建/绑定错误。

## 问题 6 当前缺口

- `SubLevelStorage` 只有可用的原子存取封装，没有任何调用方；`ServerSubLevelContainer` 仍明确按 session-scoped 设计，创建时不写持久化、启动时不恢复、移除时直接销毁/结算。
- `SubLevelRemovalReason.ts`、`SubLevelTicketsSavedData.ts`、`SubLevelOccupancySavedData.ts` 仍是占位文件；现有 tickets/holding Java 命名目录没有接入当前 Bedrock TS 运行链。
- `SableCommonEvents` 启动后把遗留渲染/存储实体一律视为 stale 删除，与“退出重进/崩溃重进恢复”目标直接相反。
- 当前容器只监听 `entityDie`/`entityRemove`：原生死亡会先不可逆掉落库存，再补删绑定；没有在 `EntityHurtBeforeEvent` 取消外部 kill，也没有“拦截失败→持久化恢复优先→安全策略均失败后才结算”的状态机。
- 因此问题 6 不是局部修补，需要把已有 `SubLevelStorage` 正式接入 `ServerSubLevelContainer` 生命周期，并把移除原因区分为自然破坏、计划卸载/超时与非预期实体丢失。

## 开工前集中读取结论

- `sable/docs/sublevel-migration-fix.md` 已记录完整链路、字段契约和改动计划。
- interaction target 的控制器逻辑与资源字段在源码和已部署 JS 中一致，未发现单一资源缺失；后续只修复运行链路中的实际断点。
- outline 控制器的 `mode` 只有 `block`，源码没有潜行显示门槛；任何修复必须保持“命中即显示 block 阶段描边”。
- sable 的 container controller 已有 `registerSavedBindings`、`bindSubLevel`、`rollbackSubLevelBinding` 与 `settleStorages`，最小持久化接入点是让 `ServerSubLevelContainer` 使用现有接口，而不是另建箱子状态表。
- 当前序列化记录缺少局部原点；恢复静态子世界必须把 `origin` 纳入 schema，否则无法重建 `localPointToWorld`。

## 运行断点复核

- 互动目标启动顺序是 `SubLevelPlayerInteractionController.start()` → `SubLevelOutlineController.start()` → `SubLevelInteractionTargetBlockController.start()`；自定义方块组件在 `system.beforeEvents.startup` 注册，注册入口在模块装载时已接通。
- 每 tick 由 `SubLevelPlayerInteractionController.#syncStandingInteractionTargets()` 处理容器预览，再由 outline 的 `#tickPlayer()` 根据射线刷新调用 `syncPlayer()`；桌面和触控仍分别保留射线跨格代理与玩家头部代理。当前未发现“控制器未启动”或资源字段缺失这一类确定性根因。
- 选择框的 `PlayerOutlineState.mode` 只使用 `block`，命中子世界方块后直接创建 `sable:block_outline` 并写入 block preview 属性，没有潜行显示门槛。后续若修复，只能针对实体加载、属性写入或刷新时机的实证断点，不能改变显示语义。
- `SubLevelInteractionTargetBlockController.#findAvailableCandidate()` 只接受空气/水源格，不会自动寻找邻格；这与当前代理格“必须由上游选定可替换格”的约定一致，不能为了掩盖生成失败加入邻格 fallback。

## 箱子运行链路复核

- 世界区域装配会在移除源方块前通过 `captureWorldData()` 读取箱子 inventory，随后 `onBlockAdded()` 调用现有 `createStorage()`；放置箱子也经过同一 `onBlockAdded()`，因此两个现象共享“创建存储实体并挂接 persistent rider”的后半段。
- `createStorage()` 在实体、动态属性和 27 格 inventory 创建后立即执行 `#attach()`；当前 `#attach()` 只调用 `handle.attachPersistentEntity()`，失败即抛出。因此“放置箱子报错”和“含箱子无法装配”的首要共同断点是渲染后端新增 persistent rider 的承载能力，不能在箱子行为层加特殊分支绕过。
- TreePhysics 的容器控制器与 sable 的通用容器控制器在 storage identity、saved binding、bind、attach、settle 主流程上同源；应复用 sable 已泛化后的 profile/controller，不新增 chest 专用并行状态。
- 当前 `onSubLevelRemoved()` 吞掉 settlement/discard 异常，与用户要求和仓库 debug 规范冲突；计划移除的安全语义应由子世界生命周期统一决定，箱子行为不能自行猜测并兜底。

## 生命周期接线断点

- `SubLevelContainerInteractionController` 已具备 `entityHurt` 外部伤害取消、系统结算标记、保存 binding 注册、恢复绑定和丢失 storage 重建能力；这些职责不需要另建管理器。
- `registerChestSubLevelBehavior` 已允许传入 `onNativeDeath` / `onUnexpectedRemoval`，当前 `SableCommonEvents` 注册时没有提供回调，因此 storage 异常链无法通知子世界持久化所有者。
- `SableCommonEvents` 仍保留旧的 session-only 注释和只调用 `completeSavedBindingRegistration()` 的双层延迟；它没有调用 `sableSubLevels.initialize()`、`sableSubLevels.tick()`，会把未登记的旧 storage 清走，也不会恢复已保存结构。
- `ServerSubLevelContainer` 需要持有创建时的 `origin`，否则编辑后的快照无法用同一世界变换保存；当前 `ManagedSubLevelRecord` 尚未包含该字段。

## TreePhysics 持久化基线

- TreePhysics 初始化先加载 manifest 与结构记录、登记所有容器 binding，再进入按可加载条件恢复实体的阶段；sable 的静态子世界不需要物理状态和分片 journal，只需保留相同的登记、恢复、清理顺序。
- TreePhysics 对原生 storage 死亡采用“先从结构删除 binding 并持久化，再接受不可逆掉落”；sable 的 `handleContainerNativeDeath` 应同样把被杀 storage 从保存记录移除，保存失败必须抛错。
- `DynamicPropertyJsonStore` 与 `SubLevelStorage` 的写入 API 用布尔结果表达提交失败；生命周期调用方必须把 `false` 转成明确错误，不能继续销毁运行时或静默降级。
- 恢复时无需触发 `onBlockAdded`：该回调表示新内容进入子世界并会创建新的 storage；保存的 storage 必须走 controller 的 `registerSavedBindings` / `bindSubLevel` 路径。

## 当前实现复核

- 计划移除保留存档并释放投影，恢复时由同一 binding 重新创建缺失 storage；异常 storage 丢失同样保存结构后释放投影，满足退出重进恢复语义。
- 自然方块编辑仍走原有 `onBlockRemoved` 结算，最后一个方块删除存档；保存失败在运行时销毁前直接抛错。
- `ServerSubLevelContainer` 的容器依赖必须由启动装配显式传入；当前仓库只有一个构造调用点，没有可复用的第二套容器状态实现。
- 当前尚未发现 sable 自身存在超时/加载范围自动结算调度器；因此持久化接入覆盖现有 `remove()` 和渲染完整性异常入口，不新增没有上游事件来源的计时器或兜底状态机。
- planned / unexpected teardown 当前会保存结构并移除 render/handle，container controller 仍需确认是否由 `onSubLevelRemoved` 明确解除 storage record 的旧 handle、实体 rider 和玩家交互引用；单靠 render carrier 销毁不足以证明控制器索引正确释放。
- `rollbackSubLevelBinding` 只覆盖恢复失败事务，不是正常 planned / unexpected 卸载接口；若现有箱子 behavior 未完成同等清理，应在通用 container controller 中补一个保留 binding 身份的运行时释放操作，不能调用会删除持久化身份的 `discardStorage()`。
- `FancySubLevelModelRenderer.remove()` 只主动删除 auxiliary rider；persistent storage rider 会随 carrier 删除而脱离并继续存在。这保证库存实体不会因投影卸载被误结算，也意味着 controller 必须主动清掉旧 handle/block 索引与预览状态。
- `ChestSubLevelBehavior.onSubLevelRemoved()` 当前仅对 `natural` 调用 `settleStorages()`，planned / unexpected 什么都不做。此处没有完成 controller 的运行时解绑，已确认是实际缺口，不是 renderer 自动覆盖的职责。
- `ServerSubLevelContainer` 虽是公开导出类，仓库内只有默认 bootstrap 一个构造调用点。持久化生命周期必须依赖通用 container controller，按项目明确禁止旧 API 兼容层的规范，第三个构造参数保持必填。
- planned / unexpected 卸载已收敛为统一 `unbindSubLevel()`：清空玩家预览/查看状态、旧 block 索引、handle 与维度计数，解绑并停用 storage entity，同时保留 owner/storage identity 供同存档恢复；恢复失败也走同一 teardown，不再维护重复的 rollback 实现。
- 复合渲染器在放置或状态更新时会整体重建 projection；旧 `renderData.remove()` 会 eject persistent storage rider，而控制器记录仍保持 `attached`。TreePhysics 的同类重建通过 renderer 自身收集并重新挂接 persistent riders；Sable 需要在通用 `SubLevelRenderData` 中补同源迁移能力，避免箱子编辑后脱离载体。
- 复核触控输入：`SubLevelOutlineController` 已按 `InputMode.Touch` 将 interaction target 固定到玩家头部格；`SubLevelPlayerInteraction.#tryPlayerStandingInteraction` 仍是容器原生交互的视线承接，与 TreePhysics 同源，不应为迁移修复改成另一套触控路由。
- 复核渲染重建异常：持久化骑手迁移失败时，新投影已创建但尚未提交；`ServerSubLevelContainer.#recreateRender` 现在先销毁该未提交投影再重新抛错，成功路径和骑手归属不变。
- sable 当前不存在独立的超出加载范围/超时调度器；现有可触发的计划移除入口只有 `ManagedSubLevel.remove()`，因此未凭空新增调度能力，所有已有计划或视觉异常移除均走持久化保留路径。
