# 子世界物理链路迁移计划

把 TreePhysics 的 cannon 物理实现迁入 sable，做成 sable 的通用物理库；算法与逻辑逐条照搬，只重新组织文件、改名去掉 `treephysics`/`contraption`/`tree` 等与现有风格和规范不符的命名。目标是 TreePhysics 之后反过来依赖 sable，只保留树木玩法。

来源：`.sample/TreePhysics/TreePhysics/src`（118 个文件，49052 行），cannon-es 0.20.0，`@minecraft/server` 2.8.0；sable 当前用 2.9.0。

## 1. 目录与文件

### 1.1 设计依据

现有基岩版 sable 的组织规则（从 `sable/src` 归纳，物理部分照此办）：

1. 目录名沿用 Java sable 的包名（`api/`、`sublevel/system/`、`content/<mixin 包名>/`、`data/vanilla/`、`util/`），Java 用 mixin 实现的玩法接线在 Bedrock 放 `content/<同名目录>/`（已有先例：`mixin/punching`→`content/punching`，`mixin/block_placement`→`content/block_placement`）。Bedrock 独有的能力用新目录名（先例：`content/raycast`）。
2. 文件名：Java 已有的概念用 Java 类名（`ServerSubLevel`、`SubLevelPhysicsSystem`、`RigidBodyHandle`、`FragileBlockCallback`）；TreePhysics 独有的概念用 `SubLevel<职责>.ts`（先例：`SubLevelInteractionSystem`、`SubLevelGridRaycast`）；工具用 `Sable<职责>Utils.ts`。
3. 导出名带 `SubLevel` 前缀（`resolveSubLevelBlockSupport`、`spawnSubLevelBlockDestructParticle`）；实体/粒子/动态属性 id 用 `sable:`，实体家族用 `sable_*` 或裸名。
4. 代码风格：文件头一段英文说明职责与来源；相对路径 import 并带 `.js`；`#private` 字段；`readonly`；无 `@src` 别名。
5. 编译方式：`tools/sublevel-block/resources.ts` 的 `collectScriptTargets` 用 esbuild `transform` 逐文件把 `src/**/*.ts` 转成 `packs/SableBP/scripts/sable/**/*.js`，不打包；`.d.ts` 跳过，其他后缀不复制。

Java sable 对照（只用于定位，不照搬内容）：

| Java sable | Bedrock sable 落点 | 说明 |
| --- | --- | --- |
| `api/physics/{PhysicsPipeline, PhysicsPipelineBody, handle/RigidBodyHandle, mass/MassTracker, collider/*, force/*, callback/*}` | `api/physics/**` | 引擎无关 API |
| `physics/impl/none`、`sable_rapier` 模块 `physics/impl/rapier/**` | `physics/impl/cannon/**` | 引擎实现；Bedrock 只有一个实现，不做 provider/接口抽象 |
| `physics/chunk/VoxelNeighborhoodState` | `physics/chunk/WorldBlockClassification.ts` | 世界方块对物理的分类 |
| `physics/callback/FragileBlockCallback` | `physics/callback/FragileBlockCallback.ts` | 易碎方块 |
| `sublevel/system/SubLevelPhysicsSystem`、`system/ticket/PhysicsChunkTicketManager` | 同名 | 物理系统、区块可读性管理 |
| `sublevel/entity_collision/SubLevelEntityCollision` | `sublevel/entity_collision/**` | 实体与子世界碰撞 |
| `mixin/entity/entities_stick_sublevels/**`（含 `effects/`） | `content/entities_stick_sublevels/**` | 玩家随子世界移动、脚步效果 |
| `mixin/punching`、`mixin/explosion`、`mixin/impact` | `content/punching`、`content/explosion`、`content/impact` | |
| `SableConfig`（punch 2.1 / 0.175 / 3 tick 与 TreePhysics 常量一致） | `SableConfig.ts` | 持久化物理设置 |
| 无对应：拖拽、活塞、入水/入岩浆效果、碰撞粒子、撞击音效 | `content/dragging`、`content/piston`、`content/particle/*`、`content/sublevel_sounds/*` | Bedrock 独有 |

Java 有而 TreePhysics 没有的（约束、绳索、盒体、浮块、反作用轮、升力、维度物理配置、客户端）不在范围内。

### 1.2 目标目录树（`←` 后为 TreePhysics 来源）

```text
sable/src/
├─ SableConfig.ts                                  ← config/Settings.ts 的物理项（性能档、碰撞档、搬运、平滑搬运）
├─ Sable.ts                                        追加物理导出（见 3.6）
├─ SableCommonEvents.ts                            追加物理接线（见 3.5）
├─ api/
│  ├─ SubLevelHelper.ts                            填空壳 ← Physics.ts getContraptionCandidatesNear / getContraptionRaycastCandidates / getContraptionById
│  ├─ math/RotationContinuity.ts                   ← physics/motion/RotationContinuity.ts（纯数学，无 cannon 依赖）
│  └─ physics/
│     ├─ PhysicsTypes.ts                           ← physics/core/Types.ts
│     ├─ PhysicsEvents.ts                          ← Physics.ts EventSignal + PhysicsWorldAfterEvents；physics/world/sensor/Batch.ts
│     ├─ handle/RigidBodyHandle.ts                 ← Physics.ts PhysicsBody
│     ├─ mass/MassTracker.ts                       ← physics/contraption/Mass.ts
│     ├─ collider/SubLevelColliderIndex.ts         ← physics/contraption/ColliderIndex.ts
│     ├─ collider/SubLevelVoxelMesher.ts           ← physics/contraption/Mesher.ts
│     ├─ collider/GreedyBoxMesher.ts               ← physics/core/GreedyBoxMesher.ts
│     ├─ collider/SubLevelBlockNormalization.ts    ← physics/contraption/Normalization.ts
│     ├─ collider/OrientedBoxAabbSat.ts            ← physics/collision/OrientedBoxAabbSat.ts
│     ├─ collider/SubLevelContactGeometry.ts       ← content/contraption/interaction/ContactGeometry.ts
│     ├─ collider/SubLevelContactQuery.ts          ← content/contraption/interaction/ContactQuery.ts
│     ├─ collider/block_shape/BlockCollisionShapeResolver.ts  ← physics/collision/BlockShapeResolver.ts
│     ├─ collider/block_shape/BlockCollisionShapeFamilies.ts  ← physics/collision/ShapeFamilies.ts
│     ├─ collider/block_shape/BlockCollisionShapeTables.ts    ← physics/collision/ShapeTables.ts
│     ├─ collider/block_shape/BlockCollisionShapeGeometry.ts  ← physics/collision/ShapeGeometry.ts
│     ├─ collider/block_shape/BlockCollisionShapeState.ts     ← physics/collision/BlockState.ts
│     ├─ force/SubLevelForceQueue.ts               ← content/contraption/effects/Controller.ts
│     └─ force/SubLevelForceMath.ts                ← content/contraption/effects/Math.ts
├─ physics/
│  ├─ callback/FragileBlockCallback.ts             ← Lifecycle.ts 易碎方块部分（世界侧 + 子世界侧，见 3.4）
│  ├─ chunk/WorldBlockClassification.ts            ← physics/world/BlockClassification.ts
│  └─ impl/cannon/
│     ├─ cannon-es.js, cannon-es.d.ts              供应 cannon-es 0.20.0 的 dist 文件（原样，不改）
│     ├─ CannonPhysicsPipeline.ts                  ← physics/simulation/CannonKernel.ts
│     ├─ CannonPhysicsPipelineEvents.ts            ← physics/simulation/CannonKernelEvents.ts
│     ├─ AabbSAPBroadphase.ts                      ← physics/simulation/AabbSAPBroadphase.ts
│     ├─ BoxNarrowphase.ts                         ← physics/simulation/BoxNarrowphase.ts
│     ├─ CannonColliderNormalization.ts            ← physics/core/ColliderNormalization.ts
│     ├─ CannonMath.ts                             ← physics/motion/KernelMath.ts
│     └─ world/WorldMeshCache.ts                   ← physics/world/MeshCache.ts
│        world/WorldBlockScan.ts                   ← physics/world/BlockScan.ts
│        world/sensor/WorldSensorScan.ts           ← physics/world/sensor/Scan.ts
│        world/sensor/WorldSensorChunkIndex.ts     ← physics/world/sensor/ChunkIndex.ts
├─ data/vanilla/physics/BlockPhysicsProperties.ts  ← data/BlockPhysicsProperties.ts，加 mass / buoyancyVolume 两列
├─ data/vanilla/collision/BlockCollisionRecords.ts ← data/BlockCollision.ts + data/BlockCollisionReference.ts
├─ data/vanilla/sounds/BlockSoundEvents.ts         补 STEP / JUMP / LAND / FALL 四组表 ← data/BlockSoundEvent.ts 的 VANILLA_TREE_* 表（改名 VANILLA_BLOCK_*）
├─ content/
│  ├─ entities_stick_sublevels/SubLevelMount.ts                    ← physics/obb/Mount.ts
│  ├─ entities_stick_sublevels/SubLevelMountCollision.ts           ← physics/obb/internal/MountCollision.ts
│  ├─ entities_stick_sublevels/effects/SubLevelSurfaceContactEffects.ts ← Physics.ts PhysicsDimension 的脚步/落地/疾跑段 + Lifecycle.handleSurfaceParticle
│  ├─ punching/SubLevelPunch.ts                    ← content/player/Punch.ts
│  ├─ punching/SubLevelPlayerInteraction.ts        回填推击与拖拽分支 ← content/player/Interaction.ts
│  ├─ dragging/SubLevelDrag.ts                     ← content/player/Drag.ts
│  ├─ explosion/SubLevelExplosionPhysics.ts        ← events/contraption/Explosion.ts
│  ├─ piston/SubLevelPistonPhysics.ts              ← events/contraption/Piston.ts
│  ├─ impact/SubLevelImpactDamage.ts               ← content/tree/contraption/Damage.ts + Lifecycle #damageEntities / #damageTreeCandidates / #pruneDamageState
│  ├─ particle/SubLevelCollisionParticles.ts       ← render/particle/BlockParticles.ts 的 collision 分支 + producesDustOnImpact + Lifecycle #spawnCollisionParticles / #isLiquidParticleLocation
│  ├─ particle/SubLevelFluidEntryEffects.ts        ← Lifecycle handleWaterEntry / handleLavaEntry / computeFluidEntryContact / computeFluidEntrySoundVolume
│  ├─ sublevel_sounds/SubLevelBlockSounds.ts       追加 resolveVanillaBlock{Step,Jump,Land,Fall}Sound ← data/BlockSound.ts
│  └─ sublevel_sounds/SubLevelImpactSounds.ts      ← Main.ts 碰撞音效冷却段
├─ sublevel/
│  ├─ ServerSubLevel.ts                            填空壳 ← Physics.ts PhysicsContraption 的物理半边
│  ├─ system/SubLevelPhysicsSystem.ts              ← Physics.ts PhysicsWorld
│  ├─ system/SubLevelPhysicsDimension.ts           ← Physics.ts PhysicsDimension
│  ├─ system/SubLevelSpatialIndex.ts               ← physics/contraption/SpatialIndex.ts
│  ├─ system/ticket/PhysicsChunkTicketManager.ts   ← Lifecycle #tickCrossDomain / #deferSettlement 卸载部分 / #restoreAvailableTrees 可读性部分 + content/tree/contraption/Bounds.ts
│  ├─ entity_collision/SubLevelEntityCollision.ts  ← physics/collision/ContraptionCollider.ts
│  ├─ entity_collision/SubLevelEntityCollisionIndex.ts ← physics/collision/ContraptionColliderIndex.ts
│  ├─ entity_collision/SubLevelEntityCollisionMath.ts  ← physics/collision/ContraptionColliderMath.ts
│  ├─ entity_collision/obb/SolidObb.ts             ← physics/obb/Solid.ts
│  ├─ entity_collision/obb/ObbTypes.ts             ← physics/obb/Types.ts
│  ├─ entity_collision/obb/ObbPresets.ts           ← physics/obb/data/Presets.ts
│  ├─ entity_collision/obb/internal/{Activation,Collision,Geometry,GeometryKeys,Interval,Motion,PlacementGrid,PoseFrame,Presets,Settings}.ts ← physics/obb/internal/ 同名
│  └─ storage/serialization/SubLevelData.ts        追加 pose / velocity / angularVelocity / sleeping / lastSafePose / boundaryThreatTicks
├─ util/
│  ├─ SableMathUtils.ts                            填空壳 ← utils/BlockKey.ts 的 packLocalBlockKey / packIntegerCoordinates / blockCenter / LOCAL_* 常量 + Bounds.ts 的 AABB 函数
│  └─ LevelAccelerator.ts                          ← utils/WorldBlock.ts + utils/WorldBlockProbeBatch.ts + Bounds.ts areBoundsChunksReadable + Lifecycle 每 tick 世界方块缓存
└─ data/reference/functional-resources/
   ├─ bp_block_collider.json                       ← TreePhysicsBP/entities/functional_entities/block_collider.json（treephysics→sable）
   └─ bp_sublevel_mount.json                       ← TreePhysicsBP/entities/functional_entities/contraption_mount.json

sable/tools/
├─ sublevel-block/resources.ts                     collectScriptTargets 增加 `.js` 原样复制（供应 cannon-es）
├─ sublevel-block/functional-resources.ts          追加两个实体目标 + block_collide 粒子族生成（模板 ← tree_collide.particle.json）
├─ verify-physics-parity.mjs                       新：与 TreePhysics 逐位对照（4.1）
└─ verify-physics-generalization.mjs               新：泛化检查（4.2）

sable/packs/SableRP/particles/sable/sublevel/
├─ block_collide/*.particle.json + block_collide.particle.json  生成 ← tree_collide/*、tree_collide.particle.json
└─ sublevel_{dust,dust_entry,splash,splash_entry,splash_impulse,bubbles,bubbles_impulse,lava_splash}.particle.json  手写改名 ← tree_* 同名 8 个
```

不新建 `PhysicsPipeline` 接口和 `impl/none`：TreePhysics 本身的边界（`PhysicsBody` 包 `CannonKernelBody`、`PhysicsDimension` 持有 `CannonKernelRuntime`）原样保留，只是引擎文件搬进 `physics/impl/cannon/`。静态子世界是 cannon 里 `motionType: "static"` 的 body，不需要第二套 pipeline。

### 1.3 现有文件的修改点

| 文件 | 改动 |
| --- | --- |
| `sublevel/SubLevel.ts` | `SubLevelBlock` 加 `mass?`、`buoyancyVolume?`；`SubLevelRenderBody` 不改（`RigidBodyHandle` 是它的超集） |
| `api/SubLevelAssemblyHelper.ts` | `captureSubLevelBlock` 用 `resolveBlockCollisionShape(block)` 填 `collisionShape`，并按结果填 `collidable` |
| `api/sublevel/ServerSubLevelContainer.ts` | 构造参数加 `SubLevelPhysicsSystem`；`#createRuntimeRecord` 改为向物理维度申请 `ServerSubLevel`；`tick` 先 `physics.step()` 再 render sync；每 20 tick 保存活动子世界姿态；编辑管线增删方块后调 `ServerSubLevel.add/removeBlocksAtLocalLocations`；新增 `breakBlocksForPhysics`；恢复循环按保存姿态的包围盒与附近玩家判断 |
| `sublevel/system/SubLevelInteractionSystem.ts` | 注册项加 `rigidBody?: RigidBodyHandle`，句柄透出 `rigidBody` 供推击/拖拽/伤害使用 |
| `content/punching/SubLevelPlayerInteraction.ts` | 回填 `#handleItemUse` 史莱姆球拖拽分支、`#handleSwing` 空手攻击推击分支、`#tickDrag`、`#ensureDimensionSubstep`、`isDraggingSubLevel`、`handleSubLevelReplacement` |
| `sublevel/storage/serialization/{SubLevelData,SubLevelSerializer}.ts` | 加姿态字段与校验；`pose` 可选，旧存档缺省为原点静态 |
| `SableCommonEvents.ts` | 见 3.5 |
| `Sable.ts` | 见 3.6 |
| `data/vanilla/sounds/BlockSoundEvents.ts`、`content/sublevel_sounds/SubLevelBlockSounds.ts` | 补 step/jump/land/fall |
| `tools/sublevel-block/{resources,functional-resources}.ts`、`tools/verify-sublevel-parity.mjs` | `.js` 透传；实体与粒子目标；parity 校验加两个实体与粒子族 |

## 2. 功能分类

### 2.1 sable 已实现，不再迁

| TreePhysics | sable 现有 | 备注 |
| --- | --- | --- |
| data/BlockSoundEvent.ts 的 BREAK/PLACE/HIT；data/BlockSound.ts 的 break/place/hit/dominant | `data/vanilla/sounds/BlockSoundEvents.ts`、`content/sublevel_sounds/SubLevelBlockSounds.ts` | STEP/JUMP/LAND/FALL 未迁 → 2.3 |
| data/FoliageColorMap.ts、data/BiomeFoliage.ts、tree/foliage/TintSampling.ts | `data/vanilla/colormap/*`、`render/dynamic_biome/DynamicBiomeTintSampler.ts` | |
| contraption/editing/Permissions.ts | `content/punching/SubLevelBlockPermissions.ts` | |
| tree/felling/MiningTime.ts、Speed.ts、MiningProgress.ts | `content/punching/SubLevelMiningTime.ts`、`SubLevelMiningProgress.ts` | |
| tree/contraption/ItemDropBatching.ts | `content/punching/SubLevelItemDrops.ts` | |
| physics/contraption/GridRaycast.ts | `content/raycast/SubLevelGridRaycast.ts` | |
| tree/block/AttachmentSupport.ts | `content/block_properties/SubLevelBlockSupport.ts` | 支撑级联，物理破坏也复用 |
| render/outline/*、contraption/interaction/OutlineController.ts、TargetBlock.ts、ContainerInteraction.ts | `content/block_outline_render/*`、`content/block_placement/*`、`content/assembly/*` | |
| render/particle/BlockParticles.ts 的 destruct 分支、render/foliage/ParticleColor.ts | `content/particle/SubLevelBlockParticles.ts` | collision 分支未迁 → 2.3 |
| content/player/Interaction.ts 的手势/挖掘/放置/容器路由 | `content/punching/SubLevelPlayerInteraction.ts` | 推击/拖拽分支未迁 → 2.3 |
| Physics.ts PhysicsContraption 的方块索引、射线、内容修订、锚点、骑手挂接、setCubeBlockOpenState/setAttachmentBlockVisualState | `sublevel/system/SubLevelInteractionSystem.ts` | |
| Physics.ts 的 createBlockVisualPair/setBlockVisualTransform/spawnTaggedVisualEntity、render/contraption/*、PhysicsDimension.#contraptionByVisualEntityId | `sublevel/render/**` | sable 自有渲染链路 |
| tree/block/ContraptionBlock.ts 的 visualItemTypeId/visualBlockRotation | `api/SubLevelAssemblyHelper.ts` | 碰撞形状解析未迁 → 2.3 |
| storage/ContraptionSerialization.ts 的结构部分（blocks、chestStorages、foliageTint、isVector）；DynamicPropertyJsonStore.ts | `sublevel/storage/serialization/*`、`util/DynamicPropertyJsonStore.ts` | 姿态字段未迁 → 2.3 |
| Lifecycle.ts 的 register/commit/cancel、placeBlockForPlayerEdit、breakBlockForPlayerEdit、#applyPlayerEditInPlace、emitBlock*Effects、handleChestStorageNativeDeath、handleVisualEntityLoad、#reconcile*Visuals、#settleChestStorages | `api/sublevel/ServerSubLevelContainer.ts` | |
| utils/Vector3Math.ts、utils/BlockKey.ts 的 blockKey/parseBlockKey、utils/Neighborhood.ts、service/ActivePlayerRegistry.ts | `util/SableVector3Utils.ts`、`api/player/ActivePlayerRegistry.ts` | packLocalBlockKey 未迁 → 2.3 |
| 资源：block_outline、block_crack、chest、interaction_target（含 water_depth/water_kind 状态）、tree_block_destruct 粒子族 | `functional_entities/*`、`block_destruct/*` | |

### 2.2 不迁（树木玩法，留在 TreePhysics）

| 内容 | 文件 / 方法 |
| --- | --- |
| 树方块分类与识别 | tree/block/Blocks.ts（treeBlockKind、isTreeLog、isTreeLeaf、logFamily…）、service/ArtificialTreeRegistry.ts |
| 砍伐选择与世界移除、断裂时机 | tree/felling/Selection.ts、SelectionPlanner.ts、WorldRemoval.ts、BreakTiming.ts |
| 原木折断 | tree/breakage/*；Lifecycle #queueTreeLogImpact、#pendingLogImpacts、#prepareLogBreakTransaction、#retryLogBreak、#finishSavedPendingLogBreak、resolveTreeLogBreakage、serialize/restoreSavedLogBreakagePlan |
| 树叶物理 LOD 与分组破碎 | tree/foliage/PhysicsQuality.ts、PhysicsRuntime.ts；Lifecycle prepareLeafPhysicsPlan、#getActiveLeafPhysicsBudget、#queueLeafGroup、#pendingLeafGroupBreaks、createExactLeafPhysicsPlan、createEditedLeafPhysicsPlan、serializeLeafPhysics |
| 分支修剪与附着物性能计划 | tree/performance/*；Lifecycle #startReadyDetachedAttachmentJobs 等 5 个方法 |
| 拓扑分裂与编辑结算 | tree/contraption/EditTopology.ts、EditSettlement.ts；Lifecycle #replaceTreeWithTopologyComponents、#applyTreeAttachmentStateUpdates、stage/mergeAutomaticTreeTopologyComponents、#ensureTopologyIndex |
| 落地结算、腐朽、岩浆焚毁 | tree/contraption/SettlementEffects.ts；Lifecycle #tickSettlement、#settleTree、#queueSavedSettlement、#startReadySettlementJobs、#finishPendingSettlement、#tickDecay、#tickLavaExposure、#beginLavaDestruction、selectLavaDestructionAnchors；粒子 tree_lava_smoke |
| 树木持久化与编辑日志 | Lifecycle #serializeTree/#restoreState 的树木字段、#writeSave、#appendTreeEditJournal、#refreshPersistenceSlice、#materializeJournaledTree 等；ContraptionSerialization.ts 的树木字段 |
| 世界树叶破坏规则（persistent_bit、人工树） | Lifecycle #canBreakWorldBlock、isPersistentWorldLeaf、Main.ts isBreakableWorldLeaf → 通过 sable 谓词钩子安装 |
| 设置 UI、树木设置项 | ui/*、config/Settings.ts 的 breakSpeed/countMotionTime/logBreakage |
| Main.ts 的树木接线 | 砍伐事件、根土壤恢复、人工树标记、砍伐冲量 createChopMotion |
| 内核独立 body 的视觉实体（`treephysics:block` + pitch/roll/yaw/scale 属性） | CannonKernel createBody 的 `visual` 分支 —— TreePhysics 自己所有 body 都传 `visual: false`，无调用点，建议删（2.4 第 6 条） |
| 资源 | fragments 实体、natural_tree_root、feature/feature_rules、loot_tables、UI、subpacks |

### 2.3 迁移（通用物理）

| 能力 | 来源 | 目标（1.2） |
| --- | --- | --- |
| 刚体内核：cannon 世界、body 创建/参数/力/冲量/传送/睡眠、性能档子步、接触材质、浮力与流体阻力、入水/入岩浆事件、世界体素碰撞体扫描/缓存/审计、世界传感器扫掠、碰撞事件 | CannonKernel.ts、CannonKernelEvents.ts、AabbSAPBroadphase、BoxNarrowphase、ColliderNormalization、KernelMath、MeshCache、BlockScan、sensor/* | `physics/impl/cannon/**` |
| 世界方块分类（流体面、材质、碰撞、传感器谓词） | BlockClassification.ts | `physics/chunk/WorldBlockClassification.ts` |
| 子世界碰撞体：体素贪心合并、增量复合碰撞体、方块归一化、质量/质心/惯量/浮力点 | ColliderIndex、Mesher、GreedyBoxMesher、Normalization、Mass | `api/physics/collider/*`、`api/physics/mass/MassTracker.ts` |
| 原版方块碰撞形状解析（按状态） | BlockShapeResolver + 4 个文件、data/BlockCollision*.ts | `api/physics/collider/block_shape/*`、`data/vanilla/collision/*` |
| 接触几何与查询（OBB-AABB SAT、球/活塞接触） | OrientedBoxAabbSat、ContactGeometry、ContactQuery | `api/physics/collider/*` |
| 外力队列（爆炸/活塞冲量合并、遮挡、限幅） | effects/Controller.ts、Math.ts | `api/physics/force/*` |
| 刚体句柄、事件、类型 | Physics.ts PhysicsBody / EventSignal / AfterEvents、core/Types.ts、sensor/Batch.ts | `api/physics/{handle,PhysicsEvents,PhysicsTypes}.ts` |
| 子世界物理记录：body、质量矩、逻辑碰撞体、运行时表示、碰撞代理同步、流体恢复计时、增删方块重建 | Physics.ts PhysicsContraption 物理半边 | `sublevel/ServerSubLevel.ts` |
| 物理系统与维度：维度注册、step、性能档、世界网格审计协调、空间索引、玩家快照、碰撞 shell 选择、Mount tick | Physics.ts PhysicsWorld / PhysicsDimension、SpatialIndex | `sublevel/system/*` |
| 实体与子世界碰撞：原生碰撞代理实体、OBB 支撑格、摩擦冲量、表面运动 | ContraptionCollider*、obb/Solid + internal + Types + Presets | `sublevel/entity_collision/**` |
| 平滑搬运乘骑 | obb/Mount.ts、MountCollision.ts | `content/entities_stick_sublevels/*` |
| 脚步/跳跃/落地/疾跑效果 | Physics.ts PhysicsDimension 接触记录段、Lifecycle handleSurfaceParticle、BlockSound step/jump/land/fall | `content/entities_stick_sublevels/effects/*`、声音表 |
| 推击、拖拽 | Punch.ts、Drag.ts、Interaction.ts 分支 | `content/punching/*`、`content/dragging/*` |
| 爆炸、活塞 | Explosion.ts、Piston.ts | `content/explosion/*`、`content/piston/*` |
| 撞击伤害与击退 | Damage.ts、Lifecycle #damageEntities | `content/impact/*` |
| 易碎方块：世界侧（接触候选、阈值、延后 setblock destroy）、子世界侧（碰撞点定位、每 tick 批量探测、下一批次破坏） | Lifecycle 易碎部分（3.4 列出） | `physics/callback/FragileBlockCallback.ts` + 容器 `breakBlocksForPhysics` |
| 碰撞粒子、撞击音效、入水/入岩浆效果 | Lifecycle #spawnCollisionParticles、handleWaterEntry、handleLavaEntry、Main.ts 音效段、BlockParticles collision 分支 | `content/particle/*`、`content/sublevel_sounds/SubLevelImpactSounds.ts` |
| 区块可读性：移动体触及不可读区块时退回安全姿态或卸载保存，可读后恢复 | Lifecycle #tickCrossDomain、#deferSettlement、#restoreAvailableTrees、Bounds.ts | `sublevel/system/ticket/*`、容器恢复循环 |
| 姿态持久化（location/rotation/velocity/angularVelocity/sleeping/lastSafePose） | ContraptionSerialization.ts SavedPose 等字段、#serializeTree | `sublevel/storage/serialization/*` |
| 物理设置持久化 | config/Settings.ts 物理项 | `SableConfig.ts` |
| 世界方块变更 → 网格失效 + 唤醒 | Main.ts 事件接线 | `SableCommonEvents.ts` |
| 重载清理与实体重绑 | removeStaleContraptionColliders/Mounts、handleBlockColliderLoad、handleContraptionMountLoad、handleMountPlayerSpawn | `SableCommonEvents.ts` |
| 资源 | block_collider、contraption_mount 实体；tree_collide 粒子族；8 个 tree_* 粒子 | 1.2 |

### 2.4 细节处理，以下项目全部按原样拷贝过来，之后再统一改为按原Java sable的同算法实现，下面不再赘述每一项怎么做

1. **推击直立度倍率**。`computeTreePunchStrength = 1.5(cannon 补偿) × (1 + 1.5 × 直立度) × 2.1 × 曲线(有效质量)`。直立度是 body 局部 +Y 与世界 +Y 的夹角，不含树判断。改为按原Java sable的同算法实现。
2. **撞击伤害的接触集合**。TreePhysics 只用原木做 DDA 接触（`tree.logs`）。改为照搬原Java sable改为按原Java sable的同算法实现。
3. **碰撞粒子的触发方块**。TreePhysics 只在命中原木或箱子时生成。改为按原Java sable的同算法实现。
4. **子世界侧易碎方块的边界**。sable 实现逐方块路径（= TreePhysics `exact` 树叶档 + 附着物路径）；树叶分组/LOD、原木折断、腐朽留 TreePhysics，通过 `runtimeRepresentation` 与 `collisionTag → 方块键` 钩子接入。改为按原Java sable的同算法实现。
5. **世界传感器默认谓词**。TreePhysics 用 `isBreakableWorldLeaf`。改为按原Java sable的同算法实现。
6. **删除内核独立 body 视觉实体分支**（2.2 末行）。保留则要为 `sable:block` 增加 pitch/roll/yaw/scale 属性给一条无人调用的路径。
7. **`PhysicsBodyOptions` 中 TreePhysics 从不使用的选项**（`motionType`、`material`、`gravityScale`、`size`、`itemTypeId`、`visualEntityTypeId`）：`motionType` 静态体要用；其余建议随第 6 条一并删除，还是全部照搬？
8. **质量/浮力默认值改为数据表**。`Normalization.normalizeBlockMass` 与 `Mass.normalizeBlockBuoyancyVolume` 按名称后缀 `_leaves/_log/_wood/_stem/_hyphae` 判定，改为查 `BlockPhysicsProperties[typeId].mass/buoyancyVolume`；表按 TreePhysics 的分类值填：树叶 0.0625/0.125，原木类 1/1，箱子 0.5/1，附着物（藤蔓、可可、垂根、苔须、胎生苗、蜂巢、红树根）0.1/0.1，未列出 0.25/0.25。方块显式 `mass/buoyancyVolume` 优先。
9. **设置读取方式**。TreePhysics 用 provider 回调注入设置；建议 sable 直接读 `SableConfig`，TreePhysics 的设置界面改写 `sable:*` 属性。
10. **cannon-es 供应方式**。建议：把 `node_modules/cannon-es/dist/cannon-es.js` 与 `.d.ts` 原样放进 `src/physics/impl/cannon/`，`collectScriptTargets` 增加 `.js` 原样复制；不引入打包。
11. **两份资源用途待核实**：`sounds/entity/empty.ogg` + `treephysics.empty` 音效定义、`player.animation_controllers.json`。若为乘骑姿态/静音所需则一并迁移，否则不迁。
12. **等价而非相同的差异清单**（4.3 末）是否接受。

## 3. 编码方法

### 3.1 分支与前置

1. `git checkout -b physics`（从 `main`）。
2. 根 `package.json` 加 devDependency `cannon-es@0.20.0`（校验工具的 TreePhysics 侧需要，也是供应文件的来源）。
3. 供应 cannon-es（2.4 第 10 条）；`resources.ts` 加 `.js` 透传。
4. 参考副本：两个 BP 实体 JSON 复制到 `src/data/reference/functional-resources/`，`treephysics`→`sable`，`contraption_mount`→`sublevel_mount`。

### 3.2 搬运规则

一个来源文件对一个目标文件（1.2 的映射），文件内函数、类、常量的顺序不变，函数体逐行照搬。每个文件只做以下六类改动：

1. **import 路径**：`@src/...` 改相对路径并加 `.js`。固定替换：`@src/utils/Vector3Math` → `util/SableVector3Utils.js`；`blockKey/parseBlockKey` → `blockLocationKey/parseBlockLocationKey`；`packLocalBlockKey/packIntegerCoordinates/blockCenter/LOCAL_*` → `util/SableMathUtils.js`；`@src/utils/WorldBlock`、`WorldBlockProbeBatch` → `util/LevelAccelerator.js`；`@src/render/foliage/TintCodec` 的 `isContraptionFoliageTint` → `sublevel/storage/serialization/SubLevelData.js` 的 `isSubLevelFoliageTint`；`cannon-es` → `./cannon-es.js`（仅 `physics/impl/cannon/` 内允许）。
2. **标识符改名**：按 3.3 表；不在表内的名字不改。
3. **字符串常量**：`treephysics:` → `sable:`，`treephysics_` → `sable_`，实体/粒子/属性 id 按 3.3 表。
4. **注释**：含 tree/contraption 措辞的改写或删除，其余保留；文件头补一段英文职责说明（含"migrated from TreePhysics <路径>"）。
5. **树木分支删除**：只删 3.4 列出的位置，不删其他逻辑；原有的 try/catch（包裹原生 API 调用）保留。
6. **类型替换**：`PhysicsContraptionBlock` → `SubLevelBlock`（去掉 `visual` 联合类型）；`CapturedTreeBlock` 出现处改为 `SubLevelBlock`；`ContraptionState` 出现处改为 `ServerSubLevel` 或该模块自己的状态类型。

新写的代码只有：接缝（3.5）、数据表扩列、`SableConfig.ts`（从 Settings.ts 裁掉树木项）、两个校验工具、生成器改动。

### 3.3 改名表

| TreePhysics | sable |
| --- | --- |
| `PhysicsWorld` / `PhysicsDimension` / `PhysicsContraption` / `PhysicsBody` | `SubLevelPhysicsSystem` / `SubLevelPhysicsDimension` / `ServerSubLevel` / `RigidBodyHandle` |
| `CannonKernelRuntime` / `CannonKernelBody` / `CannonKernelAfterEvents` / `CannonKernel*AfterEvent` / `CannonKernelOptions` | `CannonPhysicsPipeline` / `CannonPhysicsBody` / `CannonPhysicsPipelineAfterEvents` / `CannonPipeline*AfterEvent` / `CannonPhysicsPipelineOptions` |
| `PhysicsContraptionBlock` / `PhysicsContraptionOptions` / `PhysicsContraptionFoliageTint` | `SubLevelBlock` / `ServerSubLevelOptions` / `SubLevelFoliageTint` |
| `PhysicsContraptionRuntimeRepresentation*` / `PhysicsContraptionSurfaceParticle*` / `PhysicsContraptionRaycast*` | `SubLevelRuntimeRepresentation*` / `SubLevelSurfaceParticle*` / 删除（交互句柄已有） |
| `PhysicsWorldAfterEvents` / `PhysicsWorldOptions` / `PhysicsWorldStats` / `PhysicsWorldStepAfterEvent` | `SubLevelPhysicsAfterEvents` / `SubLevelPhysicsOptions` / `SubLevelPhysicsStats` / `SubLevelPhysicsStepAfterEvent` |
| `MAX_PHYSICS_CONTRAPTION_BLOCKS` | `MAX_SUB_LEVEL_BLOCKS` |
| `ContraptionCollider` / `ContraptionCollisionSnapshotIndex` / `LocalCollisionBoxIndex` / `ContraptionSurfaceContactCallback` | `SubLevelEntityCollision` / `SubLevelCollisionSnapshotIndex` / `LocalCollisionBoxIndex` / `SubLevelSurfaceContactCallback` |
| `ContraptionColliderIndex`（physics/contraption） / `ContraptionSpatialIndex` | `SubLevelColliderIndex` / `SubLevelSpatialIndex` |
| `ContraptionExternalEffectsController` / `PistonContraptionEffect` / `ExplosionContraptionEffect` | `SubLevelForceQueue` / `SubLevelPistonForce` / `SubLevelExplosionForce` |
| `MountObb` / `handleContraptionMountLoad` / `removeStaleContraptionMounts` | `SubLevelMount` / `handleSubLevelMountLoad` / `removeStaleSubLevelMounts` |
| `createContraptionCollisionEntitySnapshots` / `removeStaleContraptionColliders` | `createSubLevelCollisionEntitySnapshots` / `removeStaleSubLevelColliders` |
| `normalizeContraptionBlocks` / `normalizeContraptionFoliageTint` / `normalizeVisualEntityTags` | `normalizeSubLevelBlocks` / `normalizeSubLevelFoliageTint` / `normalizeRenderEntityTags` |
| `isContraptionBlockCollidable` / `isContraptionBlockRaySolid` | 现有 `isSubLevelBlockCollidable` / `isSubLevelBlockRaySolid` |
| `computeContraptionMassProperties` / `computeContraptionInertia` / `createDefaultContraptionBuoyancyPoints` | `computeSubLevelMassProperties` / `computeSubLevelInertia` / `createDefaultSubLevelBuoyancyPoints` |
| `getContraptionBasis` / `findContraptionSphereContact` / `findContraptionPistonContact` / `ContraptionContact` / `PistonContraptionContact` | `getSubLevelBasis` / `findSubLevelSphereContact` / `findSubLevelPistonContact` / `SubLevelContact` / `SubLevelPistonContact` |
| `computeTreePunchStrength` / `TREE_EXTRA_PUSH_MULTIPLIER` / `getContraptionUprightness` | `computeSubLevelPunchStrength` / `UPRIGHT_PUNCH_MULTIPLIER` / `getSubLevelUprightness` |
| `getTreeImpactDamage` / `canTreeReachDamageSpeed` / `findDamageLogContact` / `getTreePoseVelocityAt` / `DamageTreeProbe` / `isDamageableTreeTarget` / `TREE_IMPACT_*` / `MAX_TREE_IMPACT_DAMAGE` | `getSubLevelImpactDamage` / `canSubLevelReachDamageSpeed` / `findDamageBlockContact` / `getSubLevelPoseVelocityAt` / `DamageSubLevelProbe` / `isDamageableTarget` / `IMPACT_*` / `MAX_IMPACT_DAMAGE` |
| `installExplosionContraptionPhysics` / `installPistonContraptionPhysics` | `installSubLevelExplosionPhysics` / `installSubLevelPistonPhysics` |
| `ContraptionRaycastResult`（Interaction.ts） | 现有 `SubLevelRaycastResult` |
| `VANILLA_TREE_{HIT,STEP,JUMP,LAND,FALL}_SOUND_EVENTS(_INDICES)` | `VANILLA_BLOCK_*`（HIT 已有） |
| `TreePhysicsPerformanceLevel` / `TREE_PHYSICS_PERFORMANCE_{LOW,HIGH}` / `getTreePhysicsPerformanceLevel` | `SablePhysicsPerformanceLevel` / `SABLE_PHYSICS_PERFORMANCE_*` / `getSablePhysicsPerformanceLevel` |
| `TreeObbCollisionLevel` / `TREE_OBB_COLLISION_{LOW,HIGH,DISABLED}` / `getTreeObbCollisionLevel` | `SubLevelCollisionLevel` / `SUB_LEVEL_COLLISION_*` / `getSubLevelCollisionLevel` |
| `contraptionId`（事件/回调字段） / `visualEntityTags` / `visualEntityIds` / `getVisualRotation` | `subLevelId` / `renderEntityTags` / `renderEntityIds` / `getRenderRotation` |
| `"treephysics:block_collider"`（家族 `block_collider`） | `"sable:block_collider"`（家族不变） |
| `"treephysics:contraption_mount"` / 家族 `contraption_mount` / 标签 `treephysics_mount_rider` | `"sable:sublevel_mount"` / `sublevel_mount` / `sable_mount_rider` |
| `"treephysics:interaction_target"` / `":water_depth"` / `":water_kind"` | `"sable:interaction_target"` / `"sable:water_depth"` / `"sable:water_kind"`（资源已存在） |
| `"treephysics:tree_collide"` 前缀 / `"treephysics:tree_dust"` | `"sable:block_collide"` / `"sable:sublevel_dust"` |
| `"treephysics:tree_splash_entry"` / `"treephysics:tree_lava_splash"` | `"sable:sublevel_splash_entry"` / `"sable:sublevel_lava_splash"` |
| `"treephysics:physics_performance"` / `":obb_collision"` / `":player_carrying"` / `":smooth_player_carrying"` | `"sable:physics_performance"` / `"sable:obb_collision"` / `"sable:player_carrying"` / `"sable:smooth_player_carrying"` |
| `obb:support_*` / `obb:clear_*` / `obb:volume_*` 实体事件 | 不变（Presets 声明与实体 id 无关） |
| `PhysicsContraption.body.dimension.dimension` 链 | `ServerSubLevel.body.dimension`（`SubLevelPhysicsDimension`）`.dimension` 不变 |

### 3.4 每个来源文件的删改点

只列有删改的文件；未列出的文件除 3.2 的六类改动外没有其他改动。

| 来源 | 删改点 |
| --- | --- |
| physics/core/Types.ts | 删 `PhysicsContraptionBlockVisual` 联合类型与 `PhysicsContraptionBlock.visual`；删 `PhysicsContraptionRaycast*`（句柄已有）；`PhysicsBodyOptions` 按 2.4 第 6/7 条 |
| physics/contraption/Normalization.ts | `normalizeBlockMass` 的名称后缀分支改为查表；`visual` 拷贝行删除 |
| physics/contraption/Mass.ts | `classifyBlockPhysicsDefaults` 删除，`normalizeBlockBuoyancyVolume` 改为查表 |
| physics/simulation/CannonKernel.ts | `createBody` 的视觉实体分支、`DEFAULT_VISUAL_*`、`DEFAULT_VISUAL_PROPERTY_MAP`、`visualLocalOffset`、`lastWritten*` 与 `writeBodyTransform` 的实体写入（按 2.4 第 6 条）；其余照搬 |
| physics/world/BlockClassification.ts | 三个 `treephysics:` 字符串改 `sable:` |
| physics/obb/Mount.ts、internal/MountCollision.ts | 实体 id/标签改名；`ContactGeometry` import 改 `api/physics/collider/SubLevelContactGeometry.js` |
| physics/collision/ContraptionCollider.ts | 实体 id 改名 |
| content/player/Punch.ts | 改名（2.4 第 1 条） |
| content/player/Interaction.ts | 只取 `#handleItemUse` 的 `DRAG_ITEM_TYPE_ID` 分支与 `resolveDragItemUseAction` 释放分支、`#handleSwing` 的空手 Attack/Mine → `#applyAttackImpulse` 分支、`#applyAttackImpulse`、`#tickDrag`、`#sampleDragTarget`、`#stopDrag`、`#ensureDimensionSubstep`、`#drags`/`#lastDragToggleTickByPlayer`/`#lastPunchTickByPlayer` 及其在 start() 中的清理订阅、`isDraggingContraption`、`handleContraptionReplacement`，回填到 `SubLevelPlayerInteraction.ts` 相同位置；其余已存在 |
| content/tree/contraption/Damage.ts | `findDamageLogContact` 的 `logs` 参数语义改为"有碰撞响应的方块"集合（2.4 第 2 条）；`CONTRAPTION_RENDER_ENTITY_TYPE_IDS` 改为 sable 实体家族集合常量（fancy_model、block、block_collider、sublevel_mount、block_outline、block_crack） |
| content/tree/contraption/Bounds.ts | 拆到 `SableMathUtils`（AABB 函数）与 `LevelAccelerator`（可读性）；`groupPlayersByDimension` 随票据管理器 |
| content/tree/contraption/Lifecycle.ts | 只取以下方法，其余不迁（2.2）：`handleSurfaceParticle` → SurfaceContactEffects；`handleCollision`（删 `#queueTreeLogImpact`、`isTreeLog`/`decayProgress` 分支）、`#handleIndexedWorldSensorCollision`（同上）、`#queueFragileWorldBlock`、`#queueWorldBlockBreak`、`#queueFragileWorldBlockAtPoint`、`#notifyWorldBlocksChanged`、`#prepareCollisionCache`、`#getCollisionWorldBlock`、`#queueCollidingContraptionBlock`（`collisionTag` → 树叶组分支改为钩子）、`#queueContraptionBlock`（同上）、`#clearPendingCollisionState`、`#flushCollidingContraptionBlocks`（删 `pendingLogImpact`/`pendingLogBreak` 分支）、`#probeContraptionFragileContacts`（两个键列表合并为一个，预算为子世界选项）、`#collectContraptionFragileProbes`、`#canBreakWorldBlock`（改为谓词钩子，默认 true）、`worldContactCandidates`、`getWorldFragileImpactSpeed`（`isTreeLeaf &&` 删掉，保留传感器判断）、`getContraptionFragileImpactSpeed`（改查表）、`isSolidWorldBlockPoint`、`breakWorldBlock`、`pointInBox`、`addContraptionFragileProbeLocation` → FragileBlockCallback；`#breakContraptionBlocks` 的通用段（支撑级联、移除、粒子、掉落合并、蜂巢、音效）→ 容器 `breakBlocksForPhysics`，删树叶组闭包、原木折断事务、拓扑分裂、日志；`#spawnCollisionParticles`（原木/箱子判断改为 2.4 第 3 条）、`#isLiquidParticleLocation`、`quantizeCollisionCoordinate` → CollisionParticles；`handleWaterEntry`、`handleLavaEntry`、`computeFluidEntryContact`、`computeFluidEntrySoundVolume` → FluidEntryEffects；`#damageEntities`、`#damageTreeCandidates`、`#pruneDamageState` → ImpactDamage（`isDamageImmune` 改为查拖拽会话）；`#tickCrossDomain`、`#deferSettlement` 的保存/移除段（不含结算）、`#restoreAvailableTrees` 的可读性/附近玩家/重试段、`createSavedTreeBounds`、`hasNearbyPlayer`、`nearestPlayerTo`、`getBodyPose`、`clonePose`、`cloneBounds` → ChunkTicketManager + 容器；`tick` 骨架 → 物理系统 step + 容器 tick；常量 `LOG_IMPACT_TRIGGER_SPEED`（改名 `IMPACT_PARTICLE_TRIGGER_SPEED`）、`CONTRAPTION_BLOCK_LOOKUP_TOLERANCE`、`CONTRAPTION_FRAGILE_PROBES_PER_TICK`、`DAMAGE_*`、`LAVA_ENTRY_*`、`FLUID_ENTRY_SOUND_*`、`RESTORE_*`、`CROSS_DOMAIN_CONFIRM_TICKS`、`PAUSED_CROSS_DOMAIN_CHECK_INTERVAL_TICKS`、`PLAYER_MOVING_AWAY_EPSILON`、`PERSISTENCE_INTERVAL_TICKS`、`RESTORE_RETRY_TICKS` 随所属模块 |
| Main.ts | 只取：`configurePhysicsDimension`（`setBlockPropertiesBatch` + 传感器谓词）、`wakeTreeAssembliesNear`、`invalidateWorldMesh(Batch)`、`isDoorBlock`/`isManuallyShapeChangingBlock`/`isFluidBucket`/`offsetByDirection`、`playerPlaceBlock`/`playerBreakBlock`/`blockExplode`/`playerInteractWithBlock`/`pressurePlatePush`/`pressurePlatePop` 的网格失效与唤醒行、`entityLoad` 的两个 load 处理、`playerSpawn`、碰撞音效订阅（`IMPACT_SOUND_*`、`lastImpactTickByBody`、`pruneImpactCooldowns`）、`installExplosion/Piston*`、`physicsWorld.start()` → SableCommonEvents / SubLevelImpactSounds；其余不迁 |
| storage/ContraptionSerialization.ts | 只取 `SavedPose`，`SerializedContraption` 的 `location/rotation/velocity/angularVelocity/sleeping/lastSafePose/boundaryThreatTicks` 字段与对应校验 |
| render/particle/BlockParticles.ts | 只取 collision 分支（`underwater`、dust 生成、`block_collide_<后缀>` id 组装）、`producesDustOnImpact`、`reportParticleSpawnFailure`；后缀推导改用 sable 的 `SubLevelBlockParticleEffects` 同一推导 |
| data/BlockSound.ts、BlockSoundEvent.ts | 只取 step/jump/land/fall |
| config/Settings.ts | 只取 `physicsPerformanceLevel`、`obbCollisionLevel`、`playerCarryingEnabled`、`smoothPlayerCarryingEnabled` 及其 normalize/load/save；属性键改 `sable:*` |
| events/contraption/Piston.ts | `markMovedBlock`/`onWorldBlockMoved` 回调保留为可选参数（TreePhysics 的人工树标记用），sable 侧不传 |
| utils/BlockKey.ts | `LOCAL_BLOCK_COORDINATE_LIMIT = 511` 等常量随 `packLocalBlockKey` 进 `SableMathUtils` |

### 3.5 接缝代码（新写）

`sublevel/ServerSubLevel.ts`（类 `ServerSubLevel implements SubLevel`）：字段 `body: RigidBodyHandle`、`dimension`、`foliageTint`、`renderEntityTags`、`blocks`（活数组）、`#blocksByKey`/`#blocksByPackedKey`/`#blockOrderByPackedKey`、`#logicalColliderIndex`、`#entityCollision`、`#runtimeRepresentation(State)`、`#flowingFluidDryTicks`、`#massMoment`/`#totalMass`；方法 `getBlockAtWorldPoint`、`getBlocksInLocalBounds`、`addBlocksAtLocalLocations`、`removeBlocksAtLocalLocations`（返回被移除方块；无可碰撞方块剩余时移除 body 并返回标记）、`syncCollision`、`hasKnownCollisionIntegrityFailure`、`remove`。构造由 `SubLevelPhysicsDimension.createSubLevel(options: ServerSubLevelOptions)` 完成（← `createContraption` 去掉视觉部分）。

`SubLevelPhysicsSystem`：`getDimension/getExistingDimension/getDimensions`、`step()`（由容器 tick 调用，不再自建 `runInterval`）、`afterEvents`（collision、waterEntry、lavaEntry、step）、`handleWorldBlockChange(dimension, locations)` = `invalidateWorldMeshBatch` + `wakeBodiesNear`、`handleMountPlayerSpawn`、`stop`；设置直接读 `SableConfig`（2.4 第 9 条）。

`ServerSubLevelContainer`：

- 构造函数第一个参数 `physics: SubLevelPhysicsSystem`。
- `#createRuntimeRecord(id, dimension, origin, blocks, foliageTint, pose?)`：`const subLevel = this.#physics.getDimension(dimension).createSubLevel({ blocks, foliageTint, location: pose?.location ?? origin + 0.5, rotation: pose?.rotation, velocity: pose?.velocity, angularVelocity: pose?.angularVelocity, name: id })`；注册交互时传 `worldPointToLocal: p => subLevel.body.worldPointToLocal(p)`、`isMoving: () => subLevel.body.isActive`、`rigidBody: subLevel.body`；`invalidateBody` 改为 `subLevel.remove()`。
- `tick(currentTick)`：`this.#physics.step()` → 每条记录 `renderData.sync()` → 每 20 tick：保存活动（非睡眠或姿态签名变化）记录的姿态；恢复循环条件改为"保存姿态的包围盒区块可读 && 96 格内有玩家 && 过了重试时间"。
- `breakBlockForPlayerEdit`：`handle.removeBlocksAtLocalLocations` 之后调用 `record.subLevel.removeBlocksAtLocalLocations(removedLocations)`；其余不变。新增 `breakBlocksForPhysics(handle, localLocations)`：与前者共用私有实现 `#breakBlocks(record, itemStack, locations, mergeDrops)`，无玩家、无工具、掉落用 `mergeStackableItemDrops` 合并、音效用 `selectDominantVanillaBlockBreakSound`。
- `placeBlockForPlayerEdit`：additions 成功后 `record.subLevel.addBlocksAtLocalLocations(additions)`；`record.subLevel = { ...record.subLevel, blocks }` 三处改为直接使用类实例（blocks 为活数组）。
- `#saveRecord`：追加 `pose: { location: body.location, rotation: body.getRotation() }`、`velocity`、`angularVelocity`、`sleeping: body.isSleeping`、`lastSafePose`、`boundaryThreatTicks`（后两者来自票据管理器）。
- `#destroyRecord`：`record.subLevel.remove()`。
- `createSubLevelFromRegion` 选项加 `velocity?`、`angularVelocity?`。

`SableCommonEvents.ts`：`sablePhysics = new SubLevelPhysicsSystem()` → 传入容器；`sableForces = new SubLevelForceQueue(sablePhysics)`；`sableFragileBlocks = new FragileBlockCallback(sablePhysics, sableSubLevels)`；`sableImpactSounds`、`sableFluidEntryEffects`、`sableImpactDamage`；`installSubLevelExplosionPhysics(sableForces, handleWorldBlockChange)`、`installSubLevelPistonPhysics(sableForces, undefined, handleWorldBlockChange)`；`afterEvents.collision` → `const typeId = sableFragileBlocks.handleCollision(event); sableImpactSounds.handleCollision(event, typeId)`；`waterEntry/lavaEntry` → 流体效果；`entityLoad` 加 `handleBlockColliderLoad`、`handleSubLevelMountLoad`；`playerSpawn` → `sablePhysics.handleMountPlayerSpawn`；首 tick 清理家族加 `block_collider`、`sublevel_mount`；`playerPlaceBlock`/`playerBreakBlock`/`blockExplode`/`playerInteractWithBlock`/`pressurePlatePush`/`pressurePlatePop` → `sablePhysics.handleWorldBlockChange`；每个维度首次使用时 `setBlockPropertiesBatch(Object.entries(BLOCK_PHYSICS_PROPERTIES))` 与默认传感器谓词（在 `SubLevelPhysicsDimension` 构造里做，不需要 Main.ts 的 `configuredDimensions`）。

`SableConfig.ts`：`getSablePhysicsSettings/updateSablePhysicsSettings/saveSablePhysicsSettings` 与四个 getter；`SubLevelPhysicsSystem` 的 `GET_SIMULATION_OPTIONS` 用它决定子步（高档：`fixedTimeStep/3`、`tickSteps 3`、`worldMeshWaitForMissingChunks false`）。

`FragileBlockCallback`：持有物理系统与容器；`handleCollision(event): string | undefined`；`tick(subLevels)`（探测 + 冲刷）；每个子世界一条 `{ fragileKeys, cursor, budget }` 状态（方块的 `fragileImpactSpeed` 由属性表得出，随 add/remove 更新）；钩子 `setWorldBlockBreakPredicate`、`setSubLevelFragileGroupResolver(subLevel, collisionTag) => keys | undefined`、子世界选项 `fragileProbeBudget`（默认 64）。

`PhysicsChunkTicketManager`：`tick(records, players)`；每条活动记录维护 `lastSafePose/lastSafeBounds/boundaryThreatTicks/lastNearestPlayerDistance`；确认威胁后：安全包围盒可读 → `body.teleport(lastSafePose, 零速度)`；不可读 → `container.unloadForPhysics(record)`（保存 lastSafePose + 零速度 + 移除记录 + 进入待恢复）。

### 3.6 TreePhysics 反向依赖接口（`Sable.ts` 导出）

`SubLevelPhysicsSystem`、`SubLevelPhysicsDimension`、`ServerSubLevel`、`RigidBodyHandle`、`PhysicsTypes` 全部类型、`SubLevelPhysicsAfterEvents` 事件、`ServerSubLevelContainer.breakBlocksForPhysics`、`FragileBlockCallback` 的两个钩子、`SubLevelPlayerInteractionController.isDraggingSubLevel/handleSubLevelReplacement`、`resolveBlockCollisionShape`、`BLOCK_PHYSICS_PROPERTIES`、`SableConfig` 读写、`spawnSubLevelBlockCollideParticle`、`computeSubLevelPunchStrength`、`selectDominantVanillaBlockBreakSound` 等已有导出。TreePhysics 需要的 `runtimeRepresentation` 工厂类型、`body.lavaSubmersionRatio`、`body.isInNativeFlowingFluid` 均在 `RigidBodyHandle` 上。

### 3.7 施工顺序与门禁

| 阶段 | 内容 | 门禁 |
| --- | --- | --- |
| 0 | 3.1；`SubLevelBlock` 字段；存储字段；`SableConfig.ts`；`SableMathUtils`/`LevelAccelerator`；声音四表 | `tsc --noEmit`；旧存档可加载；泛化检查通过 |
| 1 | `api/physics/**`、`api/math/RotationContinuity.ts`、`data/vanilla/{physics,collision}` | parity A 的 1–7 项通过 |
| 2 | `physics/impl/cannon/**`、`physics/chunk/*` | parity A 的 8–9 项通过 |
| 3 | `ServerSubLevel`、`SubLevelPhysicsSystem/Dimension`、空间索引、容器接缝、存储、票据管理器、`SableCommonEvents` 基础接线 | parity A 的 11–12 项；游戏内 D-1 组 |
| 4 | `sublevel/entity_collision/**`、`content/entities_stick_sublevels/**`、两个实体资源 | parity A 的 10 项；效果 C；游戏内 D-2 组 |
| 5 | 推击、拖拽、爆炸、活塞、伤害、易碎、粒子、音效、流体效果、粒子资源与生成器 | parity A 的 7 项；效果 C；游戏内 D-3～D-6 组 |
| 6 | 文档、`git diff --check`、合回 `main` | 全部校验通过 + 你在游戏内勾完 D 表 |

每阶段一个提交；阶段 3 之前 `main` 的投影行为不变（容器仍用静态 body 存根，物理代码只是存在但未接入）。

## 4. 验收

判定依据分四层：A 计算结果逐位相同；B 代码中没有树或树类方块的特判；C 代码表征的效果相同或等价；D 你在游戏内肉眼确认。A、B、C 由工具自动化，D 由你完成。全部通过才算覆盖 TreePhysics 的物理能力。

### 4.1 A：计算结果逐位相同（`tools/verify-physics-parity.mjs`）

做法沿用 TreePhysics 自己的测试方式（`tests/physics/load*.mjs`：esbuild `build` 打包被测模块，`@src/` 别名解析，`@minecraft/server` 用 mock 模块）和 sable 现有 `verify-sublevel-parity.mjs` 的原则（"baseline 独立加载，不复用 sable 逻辑"）：

- 两侧各打一份包：A 侧入口指向 `.sample/TreePhysics/TreePhysics/src/**`，B 侧指向 `sable/src/**`；`@minecraft/server` 指向同一个 stub（`system.currentTick`、`world.getDimension`、`InputButton`、`InputMode`、`EntitySwingSource`、`MolangVariableMap`、`ListBlockVolume`、`BlockVolume`）；`cannon-es` A 侧用 `node_modules`，B 侧用供应文件，版本同为 0.20.0。
- 输入用固定种子的 PRNG 生成，两侧喂完全相同的输入，输出用 `assert.deepStrictEqual` 逐位比较（同一算法同一顺序，浮点必须相同；不做容差）。
- 用 `node --test`，每项一个 `test()`。

| # | 模块 | 输入 | 比较 |
| --- | --- | --- | --- |
| 1 | GreedyBoxMesher、SubLevelVoxelMesher | 1–500 个随机体素（32³ 内）×200 组 | 盒列表 |
| 2 | SubLevelColliderIndex | 初始集合 + 随机增删序列 | 每步 `collider` |
| 3 | MassTracker、SubLevelBlockNormalization | 随机方块集（typeId 从属性表与随机命名抽取，部分带显式 mass/buoyancy） | 质量、质心矩、惯量、浮力点、归一化结果——同时证明"查表"与旧的"名称后缀"结果一致 |
| 4 | BlockCollisionShape 解析五文件 | `.sample/VanillaBlock` 全部 (typeId, permutation) 组合 | 形状 |
| 5 | OrientedBoxAabbSat、ContactGeometry、ContactQuery | 随机 OBB/AABB、球、活塞前沿与随机姿态的方块集 | SAT 结果、接触点/法线/深度 |
| 6 | RotationContinuity、CannonMath | 随机四元数/欧拉角/包围盒 | 全部导出函数 |
| 7 | ForceMath、Drag、Punch、ImpactDamage 曲线与 `canReachDamageSpeed`/`findDamageBlockContact`、FluidEntry 接触与音量、`estimatePlayerFallDistance` | 随机数值与姿态 | 输出值 |
| 8 | CannonPhysicsPipeline 端到端 | 程序化地形 stub 维度（含水、岩浆、冰、史莱姆块）；低/高性能档；从随机方块集建 body（复合碰撞体、浮力点、传感器形状） | 逐 step 600 步：位置、旋转、速度、角速度、睡眠、AABB、碰撞/入水/入岩浆事件序列、网格缓存统计 |
| 9 | WorldMeshCache、WorldBlockScan、WorldSensorScan | 同一 stub 地形 | 扫描结果与扫掠接触 |
| 10 | SolidObb 的 `internal/*` 与 MountCollision | 合成实体快照与 OBB 姿态 | 放置格、激活区、摩擦冲量、乘骑解算 |
| 11 | SubLevelSpatialIndex | 随机包围盒与射线 | 查询结果 |
| 12 | 存储姿态字段 | 随机姿态 | sable 序列化再反序列化后与 A 侧 `SavedPose` 相同 |

A 侧函数需要 `ContraptionState`/`CapturedTreeBlock` 的地方，由测试用同一份通用输入构造树侧输入（适配只在测试里）。

### 4.2 B：泛化检查（`tools/verify-physics-generalization.mjs`）

扫描范围：`src/api/physics/**`、`src/api/math/RotationContinuity.ts`、`src/physics/**`、`src/sublevel/ServerSubLevel.ts`、`src/sublevel/system/{SubLevelPhysicsSystem,SubLevelPhysicsDimension,SubLevelSpatialIndex}.ts`、`src/sublevel/system/ticket/**`、`src/sublevel/entity_collision/**`、`src/content/{entities_stick_sublevels,dragging,explosion,piston,impact}/**`、`src/content/punching/SubLevelPunch.ts`、`src/content/particle/{SubLevelCollisionParticles,SubLevelFluidEntryEffects}.ts`、`src/content/sublevel_sounds/SubLevelImpactSounds.ts`、`src/util/LevelAccelerator.ts`、`src/data/vanilla/physics/**`、`src/SableConfig.ts`。

检查项（任一命中即失败）：

1. 标识符/注释/字符串含 `tree`、`trees`、`leaf`、`leaves`、`log`、`logs`、`contraption`、`treephysics`、`felling`、`sapling`（词边界匹配）。
2. 出现 `treeBlockKind`、`TreeBlockKind`、`kind ===`、`.endsWith("_leaves")`、`.endsWith("_log")` 一类按名称分类方块的写法。
3. `"minecraft:` 字面量不在允许表内：`air`、`water`、`flowing_water`、`lava`、`flowing_lava`、`player`、`item`；模块级例外：`block_shape/*`（本质是逐方块形状数据）、`SubLevelPistonPhysics.ts` 的活塞机械 id 与 `slime`、`SubLevelCollisionParticles.ts` 的扬尘方块表。
4. 物理路径 import 了 `content/blocks/**` 或 `FancySubLevelModelRegistry`（物理只能通过属性表认识方块）。
5. `tsc --noEmit`。

### 4.3 C：效果等价（原生调用序列对照）

对触碰原生 API 的模块，用同一份脚本化 fixture（假 dimension/entity/player：脚本化位置与速度、`system.run` 队列、`getBlock`/`getBlocks`/`spawnEntity`/`spawnParticle`/`playSound`/`runCommand`/`applyDamage`/`applyKnockback`/`teleport`/`setProperty` 全部记录），两侧跑同一场景，比较记录下来的调用序列（id 按 3.3 改名后应完全一致）。场景：子世界侧易碎方块探测与破坏、世界易碎方块破坏调度、脚步/跳跃/落地/疾跑效果、入水/入岩浆效果、撞击伤害与击退、碰撞粒子与撞击音效、区块不可读时的退回/卸载/恢复、爆炸/活塞冲量施加、拖拽力施加。fixture 的写法沿用 `verify-sublevel-parity.mjs` 的 `fixture()`。

允许的"等价而非相同"差异（需要你在 2.4 第 12 条确认；每条在工具里显式登记，其他差异一律失败）：

| 差异 | TreePhysics | sable |
| --- | --- | --- |
| 撞击伤害接触集合 | 原木 | 有碰撞响应的方块 |
| 碰撞粒子触发方块 | 原木、箱子 | 有碰撞响应的方块 |
| 世界传感器默认谓词 | 可破坏树叶 | 属性表 `fragileImpactSpeed === 0` |
| 退回安全姿态后 | 立即落地结算 | 停在原地（结算是树木玩法） |
| 子世界侧易碎破坏 | 树叶按组 | 逐方块（= exact 档） |
| 物理姿态保存 | 树木记录内 | 子世界结构记录内，同字段 |

施工中新增（同样在工具里显式登记）：

| 差异 | TreePhysics | sable | 理由 |
| --- | --- | --- | --- |
| 不可受伤实体判定 | `CONTRAPTION_RENDER_ENTITY_TYPE_IDS` 枚举 | `entity.typeId.startsWith("sable:")` | sable 的精细模型实体 id 带内容摘要，无法枚举；sable 自有实体全部不可受伤，与 `SableCommonEvents` 既有清理判定一致 |
| 方块碰撞形状来源 | 按 kind 硬编码（原木/树叶 `full`、箱子内缩盒） | 捕获时 `resolveBlockCollisionShape(block)` 取真实几何 | 子世界可能装任何方块；台阶/楼梯/栅栏按自己的形状碰撞。箱子内缩盒仍由 `SubLevelColliderIndex` 的合并规则保留 |
| `SubLevelColliderIndex` 的箱子合并 | `"minecraft:chest"` 字面量 | 同样保留该字面量（登记豁免） | 该规则是"视觉相连的箱体不暴露内部缝"的逐方块优化，移入属性表会改变合并语义 |
| 表面粒子 | `PhysicsWorld.afterEvents.surfaceParticle` → Lifecycle 处理 | 事件保留，`SableCommonEvents` 订阅到 `handleSubLevelSurfaceParticle` | 保留事件让 TreePhysics 反向依赖（3.6）仍可订阅 |
| 子世界射线 | `PhysicsContraption.raycast` 与交互句柄各一份 DDA 包装 | 共用 `raycastSubLevelBody`（`content/raycast/SubLevelGridRaycast.ts`） | 两份实现逐行相同；AGENTS.md 禁止同一算法出现两份 |
| 破坏事务 | `#breakContraptionBlocks`（物理侧）与玩家编辑各一条 | 共用 `#breakBlocks`，`breakBlocksForPhysics` 一次支撑级联覆盖整批 | 同上；玩家编辑与物理破坏的支撑级联、掉落、音效逐行相同 |

### 4.4 D：游戏内肉眼验收

每项写清操作与预期；括号内为 TreePhysics 对照方法。对照统一用"同一棵手搭的树"：在同一世界用 sable 的选区捕获（`main.js` 的木棍选区），给同样的初速度/角速度（`createSubLevelFromRegion` 的 `velocity/angularVelocity` 选项，与 TreePhysics `createChopMotion` 的 1.5 / 0.3 同量级），与 TreePhysics 砍倒同样的树对照。

D-1 刚体基础（阶段 3）

1. 捕获悬空 3×3×3 石块 → 下落、着地弹跳后静止、约 1.1 s 后进入睡眠（渲染不再更新）；退出重进 → 姿态一致（对照：倒木静止后重进）。
2. 捕获一根 1×8 立柱并给水平初速度 → 倾倒、翻滚、滑动停止；旋转连续无跳变。
3. 在冰面上重复 2 → 滑得更远；在史莱姆块上 → 明显反弹；在灵魂沙上 → 更快停下（属性表 friction/restitution）。
4. 捕获后 `/setblock` 改动子世界下方方块 → 子世界被唤醒并下落（世界网格失效 + 唤醒）。
5. 低/高性能档切换（写 `sable:physics_performance`）→ 高档运动更平滑，低档在区块未加载时暂停等待。

D-2 实体碰撞与搬运（阶段 4）

6. 站到静止子世界顶面 → 站得住、能沿侧面行走、跳跃；碰撞档 `disabled` → 穿过。
7. 推动/拖拽移动中的子世界并站在上面 → 被带着走；`smooth_player_carrying` 开 → 乘骑平滑跟随，关 → 摩擦冲量方式跟随；`player_carrying` 关 → 不跟随。
8. 在子世界上行走/跳跃/疾跑/从 4 格以上落到子世界 → 对应方块的脚步声、跳跃声、落地声与落地粒子、疾跑扬尘（对照：倒木上行走）。

D-3 交互（阶段 5）

9. 空手攻击子世界 → 被推开，越轻推得越远，向下打不会把自己弹起（0.175）；3 tick 冷却。
10. 手持史莱姆球对准子世界使用 → 牵引，再次使用 → 释放；换槽/潜行/超 7 格 → 自动释放；牵引时不受该子世界伤害。

D-4 外力与易碎（阶段 5）

11. TNT 在子世界旁爆炸 → 被冲开，被方块遮挡时冲量明显减小。
12. 活塞推子世界 → 被推开；活塞前端是史莱姆块 → 冲量更大。
13. 子世界高速撞向世界树叶/冰/南瓜 → 树叶被穿过并破坏（传感器），冰/南瓜达到 4 m/s 才碎；碎块正常掉落。
14. 捕获含树叶的结构后摔落 → 树叶方块脱落、有粒子与掉落、播放主导破坏音；非树叶方块不脱落。

D-5 流体与伤害（阶段 5）

15. 子世界落入水 → 水花粒子与 splash 声，原木类漂浮、石块下沉；落入岩浆 → lavapop 声与火星粒子，岩浆中缓慢下沉。
16. 子世界高速撞到生物/玩家 → 按速度扣血并击退；5 tick 内不重复；牵引者免疫。

D-6 持久化与卸载（阶段 3/5）

17. 子世界移动到你身后未加载方向 → 退回最后安全姿态并停止；把它推向远处后走远再回来 → 从保存姿态恢复、速度为零。
18. `/reload` 或重进 → 残留的 `sable:block_collider`、`sable:sublevel_mount` 被清理，子世界重新投影且碰撞正常。

D-7 特效与音效（阶段 5）

19. 子世界撞地 → 撞击音（按被撞方块）8 tick 冷却；泥土/石材类地面有扬尘；水下无扬尘；有碰撞响应的方块贴图粒子出现在接触点。

### 4.5 通过标准

- A：12 项全部 `deepStrictEqual` 通过。
- B：0 命中。
- C：所有场景调用序列一致，差异只出现在 4.3 登记表内。
- D：19 项由你逐条勾选通过；任何一项与 TreePhysics 对照不一致而又不在 4.3 登记表内，回到对应阶段修正后重跑 A/B/C。
