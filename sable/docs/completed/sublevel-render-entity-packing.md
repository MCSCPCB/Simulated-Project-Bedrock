# Sable 子世界渲染实体打包方案

本方案覆盖三项能力：自适应 dense 盒形、dense/sparse 混合打包、描述字池。目标是在保持既有渲染功能不变的前提下，将表达任意结构所需的实体实例数压到当前架构的下限。

## 一、origin_y 属性编码

`sable:origin_y` 属性范围扩展为 `[0, 4194303]`（22 位）：

```text
origin_y = y + poseReady*2048 + (width-1)*4096 + (depth-1)*131072
  y        : 0..2047（含 1024 偏置的锚点 Y）
  poseReady: 1 位
  width-1  : 5 位（dense 布局宽 1..32）
  depth-1  : 5 位（dense 布局深 1..32）
```

Molang 端：

- `v.pose_ready = math.mod(q.property('sable:origin_y'), 4096) >= 2048;`
- `v.layout_width = 1 + math.mod(math.floor(q.property('sable:origin_y') / 4096), 32);`
- `v.layout_depth = 1 + math.floor(q.property('sable:origin_y') / 131072);`
- 动画位移 Y 使用 `math.mod(q.property('sable:origin_y'), 2048)`（同时修复原实现 poseReady 置位后模型整体偏移 2048 格的问题）。

sparse 与池实体不使用布局位，写入时 width=depth=1。

## 二、自适应 dense 盒形

- 槽位预算不变：245 槽、26 个 24 位字、`slotsPerWord = floor(24 / storedBits)`。几何仍为每通道 245 个槽位骨骼，槽位索引解码经 `v.layout_width/depth` 完成，实体种类不增加。
- 构建期静态枚举候选盒形 `(w, d)`：`1 <= w,d <= 32` 且 `w*d <= 245`，`h = floor(245/(w*d))`；剔除被支配项（存在 `w'>=w, d'>=d, h'>=h` 且至少一处严格更大）。
- **例外**：foliage tint 模型的 dense 候选固定为 `7x5x7`——其乘色层几何的逐槽 UV（16×轴坐标、贴图宽 112）在构建期静态生成，无法随运行时盒形变化。fixed tint 与无 tint 模型不受限制。

## 三、组内 dense/sparse 混合打包

每个模型组：

1. 取全组的 sparse 原点（`chooseCenteredAxisOrigin`，64）并预计算每块的 64 盒键。
2. 对每个 dense 候选盒形：分桶后按块数升序排列，依次尝试驱逐前 k 个最小桶（k = 0..B）；被驱逐块的 sparse 成本按 64 盒计数增量维护（`Σ ceil(count/26)`）。`cost(k) = 保留桶数 + sparse 实体数`。
3. 全候选、全 k 取最小；并列时先比总槽位容量，再偏向更多 dense，最后按候选枚举顺序保证确定性。
4. 按最优解实际打包：保留桶用该盒形编码，驱逐块与纯零散块用全组 sparse 原点、64 盒分桶、26 槽切块。
5. 任一实体锚点超出可编码范围则该候选无效；全部无效时整组进 unsupported。

## 四、描述字池

### 分池（构建期，registry.ts）

- 池键 = 方块注册的可选 `domain` 字段，缺省回落 `category`。模型归属其规范方块（首个注册该模型的方块）的池键。
- 池键组内按模型运行时状态位宽（chest=1，其余=0）分层，再按注册顺序以 `POOL_MEMBER_CAP = 32` 切块，每块一个池。
- 池命名：`<池键末段>_<序号>`，实体 `sable:fancy_pool_<名>`；产物文件 `fancy/<category 路径>/pool_<名>.json` 等（显式 domain 不匹配类目树时落 `fancy/pools/<slug>/`）。
- 缺失模型（missing）不入池。

### 描述字布局（每池 24 位）

```text
value = x + y*2^bx + z*2^(bx+by) + family*2^(bx+by+bz) + state*2^(bx+by+bz+fb) + occupied*2^(bx+by+bz+fb+sb)
  fb = max(1, ceil(log2(成员数)))；sb = 成员最大状态位宽
  坐标位 = 23 - fb - sb；by = floor(坐标位/3)，bx = ceil((坐标位-by)/2)，bz = 其余
```

零仍为“空槽”。每池实体 26 个描述字 + 6 个共用属性，恰满 32 属性预算。

### 运行时打包

在逐模型打包完成后按池执行前缀试并：成员组按（逐模型成本、块数、模型 key）升序，对前缀 k=0..m 计算 `total(k) = pooledCost(前缀块并集) + Σ其余组逐模型成本`，取最小（并列取最小 k，偏向不入池）。池打包用池盒尺寸分桶、26 槽切块。

### 池资源（每池一套）

- BP 实体与 fancy 模型实体同构（32 属性，family `fancy_model`，挂同一 `sable:fancy_model_carrier`）。
- 每成员每贴图通道一份几何 + 一个控制器：几何含根链 + 26 个 `slot_{n}` 骨骼（chest 成员烘焙朝向旋转、附 `lid_{n}` 子骨骼），控制器 `part_visibility` 为 `(v.o{n} > 0) && (v.f{n} == f)`；成员材质按各自 materials 映射；fixed tint 成员把常量色烘进控制器 `color`。
- 动画：`slot_{n}` 位置由描述字坐标位解码，`scale = v.o{n}`；含 chest 成员时 `lid_{n}` 旋转读 `v.st{n}`。
- foliage 成员存在时：额外一份 tint 几何（`slot_{n}` 下挂 `tint_m{f}_{n}` 骨骼，UV 0..16、贴图 16）+ 26 个逐槽 `tint_multiply` 控制器，uv_anim 由该槽坐标按轴归一（除以 2^bx 或 2^bz），可见性仅列 foliage 成员骨骼。每池仅在实体上按 `v.tint_kind >= 1 && v.o{n} > 0` 条件挂载。

## 五、运行时结构调整

- `PackedFancySubLevelModel`：`format` 增 `"pool"`；移除 `model` 字段，新增顶层 `tint?: FancySubLevelTint`（逐模型打包取模型 tint；池打包在含 foliage 成员块时为 `{ method: "foliage" }`，fixed 已烘焙不参与）；`width/height/depth` 表达实际盒形（tint 渐变跨度与坐标编码共用）。
- 每条 assignment 新增 `state?: FancySubLevelModelState`（该块自身模型的状态处理器）；`setBlockModelState` 改用它。
- `readStoredState/writeStoredState` 增加池分支：状态位于描述字 `shift/bitCount` 字段，`storedState = 字段值 + 1`；写 0 清整字（清槽）。
- `FancySubLevelModel`/`CompiledFancySubLevelModel` 增 `pool?: { entityTypeId, family, xBits, yBits, zBits, familyBits, stateBits }`，由构建工具注入运行时注册数据。
- tint 编码器改读 `packed.tint` 与 `packed.width/depth`。

## 六、涉及文件

| 文件 | 改动 |
| --- | --- |
| `src/.../FancySubLevelModelCodec.ts` | origin_y 折入盒形位 |
| `src/.../FancySubLevelModelLayout.ts` | 候选盒形、混合打包、池打包 |
| `src/.../FancySubLevelModel.ts` | pool 类型、assignment state |
| `src/.../FancySubLevelModelRegistry.ts` | pool 透传 |
| `src/.../FancySubLevelTintCodec.ts` | packed.tint 化 |
| `src/.../FancySubLevelModelRenderer.ts` | LiveModel/池状态读写 |
| `tools/sublevel-block/registry.ts` | domain 字段、分池、运行时 pool 数据 |
| `tools/sublevel-block/model-templates.ts` | origin_y molang、池资源生成 |
| `tools/sublevel-block/resources.ts` | 池产物路径 |

## 七、验证

构建 + `tsc --noEmit` + 生成物校验（标识符唯一、属性数、引用完整、池描述字位宽 ≤ 24）+ 打包算法脚本级自测（混合与池的实体数不高于旧算法）。
