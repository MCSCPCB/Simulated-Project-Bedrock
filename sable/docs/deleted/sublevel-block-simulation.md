# 子世界方块模拟能力迁移

把 TreePhysics 中所有"模拟原版方块"的功能迁入 sable：方块挖掘、放置、音效、粒子、箱子互动与存储。排除物理引擎（力、拖拽、推击、活塞/爆炸接触、乘骑）与树木玩法（识别、拓扑、砍伐选择、结构分裂结算）。验收标准：新增当前能力范围内的方块只增加一条注册数据，不修改 `src`。

## 已确认口径

- 附着物连带掉落（AttachmentSupport）：迁移，支撑规则数据化。
- 挖掘模拟（攻击/挥手折算 + 裂纹覆盖）：照搬折算机制，剥离物理推力。
- 结构分裂/悬空结算（EditTopology/EditSettlement）：排除。
- 乘骑挂载（contraption_mount）：排除。
- ContactGeometry/ContactQuery 服务于活塞与球体物理接触，归物理排除；交互射线用网格 DDA。

## 模块映射

### 第一层：独立模块（逐条移植，类型改造为 SubLevel 语境）

| sable 目标 | TreePhysics 来源 | 说明 |
| --- | --- | --- |
| `src/data/vanilla/sounds/BlockSoundEvents.ts` | data/BlockSoundEvent.ts | 原版方块音效生成表；剔除 TREE_FALL/JUMP/LAND/STEP 等物理姿态类，保留 BREAK/PLACE/HIT |
| `src/data/vanilla/colormap/FoliageColorMap.ts` | data/FoliageColorMap.ts | 原版 foliage 色图采样表（粒子取色用） |
| `src/content/sublevel_sounds/SubLevelBlockSounds.ts` | data/BlockSound.ts | 挖掘/放置/命中音效解析；叶类兜底改查注册表模型材质（alpha_test 全立方≈叶） |
| `src/content/punching/SubLevelBlockPermissions.ts` | editing/Permissions.ts | 原版挖掘/放置权限、工具耐久 |
| `src/content/punching/SubLevelMiningTime.ts` | felling/MiningTime.ts + Speed.ts | 铁傀儡锚定的攻击折算、硬度→挖掘时间、斧速与效率附魔；硬度改由注册表 `hardness` 提供 |
| `src/content/punching/SubLevelMiningProgress.ts` | felling/MiningProgress.ts | 十阶段裂纹共享进度状态机 |
| `src/content/punching/SubLevelItemDrops.ts` | contraption/ItemDropBatching.ts | 掉落物合并批量生成 |
| `src/content/raycast/SubLevelGridRaycast.ts` | physics/contraption/GridRaycast.ts | 子世界局部网格 DDA 射线（功能属交互目标选取） |
| `src/content/block_properties/SubLevelBlockSupport.ts` | tree/block/AttachmentSupport.ts | 支撑解算状态机；方块→规则映射改由注册表 `support` 字段驱动 |
| `src/content/block_outline_render/SubLevelOutlineGeometry.ts` | render/outline/Geometry.ts | 体素描边边集（28 边容量、合并、局部拓扑） |
| `src/content/block_outline_render/SubLevelOutlineMolang.ts` | render/outline/Molang.ts | 描边写边表达式、预览编码、裂纹定位 |
| `src/content/particle/SubLevelBlockParticles.ts` | render/particle/BlockParticles.ts + foliage/ParticleColor.ts | 破坏/命中粒子与取色；粒子选择改由注册表模型驱动 |
| `src/util/SableVector3Utils.ts` | utils/Vector3Math.ts | 被上列模块共用的向量工具 |
| `src/util/DynamicPropertyJsonStore.ts` | storage/DynamicPropertyJsonStore.ts | 分块原子 JSON 动态属性存储 |
| `src/api/player/ActivePlayerRegistry.ts` | service/ActivePlayerRegistry.ts | 事件驱动玩家注册表 |

### 第二层：交互运行时与控制器

`PhysicsContraption` 在交互面上的能力由 `src/sublevel/system/SubLevelInteractionSystem.ts` 提供：`SubLevelInteractionSystem` 按维度追踪已注册的子世界句柄并维护射线修订号（注册/注销/内容变更时递增，句柄移动期间每次查询递增）；`SubLevelInteractionHandle` 承载局部方块索引（`getBlockAtLocalLocation`）、世界↔局部网格射线（`ignorePassableBlocks` 按 `collisionResponse`/`collidable`/`collisionShape` 过滤、`skipContainingBlock` 与 TP 语义一致，命中返回世界/局部两组坐标与法线）、内容修订号、渲染旋转与描边锚点（优先取 render data 的 `renderAnchorLocal`，否则按方块集合重算）、`setBlockModelState` 与骑乘挂接（`attachOutlineEntity`/`attachPersistentEntity` 走 render data 的 auxiliary/persistent rider）、方块增删助手（`removeBlocksAtLocalLocations` 同步 render data 并递增修订）。注册方额外提供 `worldPointToLocal` 与可选 `isMoving`。其上移植控制器：

| sable 目标 | TreePhysics 来源 | 说明 |
| --- | --- | --- |
| `src/content/punching/SubLevelPlayerInteraction.ts` | player/Interaction.ts | 输入手势状态机（桌面/触屏差异、放置与挖掘判定、食物优先、站立交互路由）；剥离拖拽/推击/维度子步 |
| `src/content/block_outline_render/SubLevelOutlineController.ts` | interaction/OutlineController.ts | 私有描边、方块预览、裂纹覆盖实体、挖掘编排、放置校验与物品消耗 |
| `src/content/block_placement/SubLevelInteractionTargetBlock.ts` | interaction/TargetBlock.ts | 原生交互代理方块（air/水占位、孤儿恢复组件） |
| `src/content/assembly/SubLevelContainerInteraction.ts` | interaction/ContainerInteraction.ts | 箱子存储实体（27 格原生容器）、开合联动 `setBlockModelState("open")`、开关音效、原生死亡掉落、绑定与结算 |

### 第三层：资源与存储

- BP/RP 静态资源自 TreePhysics 资源逐字节移植改名（`treephysics` → `sable`，外部引用全为原版纹理），以 13 份资产存于 `src/data/reference/functional-resources/`，构建工具写入 `SableBP/entities/sable/sublevel/functional_entities/`（block_outline、block_crack）、`SableBP/entities/sable/sublevel/block_entities/`（chest）、`SableBP/blocks/sable/sublevel/functional_blocks/`（interaction_target）及对应 RP 子树；`entity.material` 增补 `block_crack_multiply`/`block_outline` 两个 TP 材质定义。
- 破坏粒子按注册模型生成（`SableRP/particles/sable/sublevel/block_destruct/`）：每个模型经 `SubLevelBlockParticleEffects.destructParticleTexture` 解析代表纹理（full_block 取 north、pillar/creaking_heart/bee_nest/mangrove_roots 取 side、chest 取实体图集并套 64×64 UV 窗口、其余取 texture），按纹理去重生成一份 TP 模板粒子；`alpha_test*` 材质→`particles_alpha`，模型带 tint 或属插件替身纹理（pale_oak 原木两态与橡叶）→附染色组件。运行时 `spawnSubLevelBlockDestructParticle` 用同一推导取效果 ID，颜色按注册表 tint 解析（fixed→十六进制常量、foliage→场 kind 常量或色图采样、无 tint→alpha 0），非原版命名空间方块按注册形态（pillar 系→原木替身+mapColor 拟合、foliage tint→橡叶替身+Oklab 均衡）走 TP 插件替身路线；tree_collide/tree_dust 系粒子属物理落地特效，不迁移。
- 子世界结构序列化（方块快照 + 箱子存储绑定 + 染色场，不含物理姿态）落入 `sublevel/storage/serialization/`：`SubLevelData.ts`（schema 与校验）、`SubLevelSerializer.ts`（深拷贝构建/校验）、`SubLevelStorage.ts`（manifest + 每 id 一个 DynamicPropertyJsonStore）。

## 注册表 schema 扩展

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `hardness` | number，可选，默认 1 | 原版硬度，驱动挖掘时间。现有方块按原版值补齐（原木/绞刑木之心 2、树叶 0.2、箱子 2.5、蜂巢 0.3、其余附着 0.2） |
| `placeable` | boolean，可选，默认 false | 玩家可手持该方块放置到子世界上（当前仅箱子） |
| `passable` | boolean，可选，默认 false | 交互射线穿透该方块；捕获与放置时落为 `collisionResponse: false`（藤蔓、垂根、苔须、胎生苗；树叶不属于此类） |
| `support` | 枚举，可选，默认 `none` | 附着支撑规则：`none`／`facing_log`（可可）／`above_solid`（垂根）／`above_leaf`（胎生苗：仅 `hanging` 态需上方叶，非悬挂恒支撑）／`moss_column`（苔须列＋tip 重算）／`vine_faces`（逐面支撑＋位重算）。宿主类别数据驱动：`facing_log` 认 `building/logs_and_wood`，`above_leaf` 认 `nature/leaves` |

规则语义在源码中固定，方块→规则映射全在数据；新增使用现有规则集的方块仅需一条注册数据。

## 验收

1. 构建 + `tsc` + 产物校验（既有全套）。
2. 数据模块零差异：音效/挖掘时间/权限/掉落合并/描边边集/支撑解算，对移植前 TreePhysics 逻辑用同输入比对输出。
3. 泛化验收：新增一个注册数据条目（含 hardness/support），确认无 `src` 改动即可获得渲染、音效、挖掘时间与支撑行为。
