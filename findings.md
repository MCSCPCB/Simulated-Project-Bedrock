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
