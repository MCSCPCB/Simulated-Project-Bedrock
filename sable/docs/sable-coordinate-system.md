# Sable 坐标与几何映射规范

本文只规定两件事：

1. 世界方块几何如何映射到 Fancy 模型；
2. 世界方块位置和方向如何映射到 Vanilla 手持实体。

所有方向状态都必须先还原为几何语义，再按本文计算变换。TreePhysics 的某个角度值只有在模型零姿态、坐标投影和骨骼层级完全相同的时候才可复用；角度数字本身不是通用规则。

## 1. 坐标空间

### 1.1 世界坐标

世界轴固定为：

```text
+X = east  （东）
+Y = up    （上）
+Z = south （南）
```

方块 `(x, y, z)` 占据 `[x,x+1) × [y,y+1) × [z,z+1)`，其中心是：

```text
Cworld = (x + 0.5, y + 0.5, z + 0.5)
```

方块整数格坐标、模型位置偏移和模型旋转必须分开保存。

### 1.2 Sable 模型坐标

Sable 的实体模型保留 X、Y，反转 Z。对位移向量使用固定投影矩阵：

```text
S = | 1  0  0 |
    | 0  1  0 |
    | 0  0 -1 |

pmodel = S · pworld = (px, py, -pz)
```

因此，世界位移 `(dx,dy,dz)` 写入模型时是：

```text
(16*dx, 16*dy, -16*dz)
```

负号只属于位置投影。它不能单独推出某个方块应使用的 yaw、pitch 或 roll；旋转必须按模型坐标架重新计算。

### 1.3 结构局部位置

静止子世界的结构原点为整数坐标 `O` 时，世界点 `W` 对应的结构局部点为：

```text
L = W - (O + (0.5, 0.5, 0.5))
```

所以位于 `O` 的方块中心对应局部点 `(0,0,0)`。子世界移动或旋转时，先使用子世界身体的逆变换：

```text
L = body.worldPointToLocal(W)
```

不能用固定的坐标相减代替移动或旋转实体的逆变换。

## 2. 方向状态的统一解释

状态名或数字不是旋转。每个 permutation 必须先解码为以下一种几何语义：

| 状态类型 | 几何语义 |
| --- | --- |
| `cardinal_direction` | 四个水平目标面：north/east/south/west |
| `direction` | 按该方块自己的原版状态表解码为目标面；数字含义不能跨方块复用 |
| `facing_direction` | 六个目标面：north/east/south/west/up/down |
| `pillar_axis` | 目标主轴：x/y/z；这是轴状态，不是水平 yaw |
| `orientation` | 目标法线和目标 front 的组合，例如 `up_north`、`down_east`、`north_up` |
| 面附着状态 | 一个或多个附着面；用面骨骼的选择/隐藏表达 |
| 模型变体状态 | 选择几何、贴图或骨骼变体；只有刚体方向才追加旋转 |

同一状态解码结果必须供 dense、sparse、pool 三条 Fancy 路径共同使用。池化只能改变存储和选择方式，不能改变几何结果。

## 3. 坐标架求旋转

这是所有 Fancy 刚体方向的唯一计算方法。

### 3.1 模型零姿态契约

为每个模型声明一次：

| 项目 | 含义 |
| --- | --- |
| `baseFront` | 零旋转模型的正面；同时记录它在世界中的面 |
| `baseUp` | 零旋转模型的上方；同时记录它在世界中的方向 |
| `baseRight` | 与资源骨骼一致的第三轴 |
| `pivot` | 整体刚体旋转的枢轴，通常是方块中心 |
| 动态骨骼 | 盖子、门、锁、果柄等子骨骼的枢轴和局部轴 |

资源面名 `north/south/east/west` 不是世界方向。`baseFront/baseUp` 必须以资源零姿态经过 Sable 投影后实际指向的世界面记录，不能从方块 ID 或纹理名猜测。

### 3.2 基准坐标架和目标坐标架

在 **Sable 模型坐标** 中，把三个轴作为列向量：

```text
B = [ baseRight  baseUp  baseFront ]
T = [ targetRight targetUp targetFront ]
```

世界方向向量先分别经过 `S` 投影，再放入 `T`。不要在投影后的坐标中重新用一个未经约定的叉乘推导第三轴；直接使用世界坐标中定义好的三条正交轴再一起投影，避免 Z 反射造成左右手误判。

从零姿态到目标状态的旋转矩阵为：

```text
R = T · B⁻¹
```

`B`、`T` 是正交坐标架时：

```text
B⁻¹ = Bᵀ
```

这意味着每个状态只需给出目标 front/up（或目标法线和 front），就能唯一得到局部刚体旋转；不需要逐状态试角度。

### 3.3 绕枢轴应用旋转

模型点 `p` 绕 `pivot` 旋转时：

```text
p' = pivot + R · (p - pivot)
```

几何偏移与旋转是两层数据：

```text
最终位置 = 整数格位置 + visualOffset
最终姿态 = slot 静态刚体旋转
```

半砖高度、活板门高度、头颅附着距离等属于 `visualOffset` 或模型局部平移，不得通过修改整数格坐标补偿。

### 3.4 旋转矩阵到 Bedrock 角度

Fancy 骨骼链固定为：

```text
root -> yaw -> roll -> pitch -> model_offset -> slot -> 模型子骨骼
```

渲染矩阵按父到子的顺序组合：

```text
Rrender = Ry(-yaw) · Rz(-roll) · Rx(pitch)
```

这里使用列向量，矩阵从左侧乘点的标准旋转矩阵：

```text
Rx(a) = | 1      0       0   |    Ry(a) = | cos a  0  sin a |    Rz(a) = | cos a  -sin a  0 |
        | 0   cos a  -sin a |            | 0       1    0   |            | sin a   cos a  0 |
        | 0   sin a   cos a |            |-sin a   0  cos a |            | 0        0      1 |
```

数据统一记录为 `[pitch, yaw, roll]`。资源动画中的轴向表达是：

```text
pitch -> [ pitch, 0, 0 ]
roll  -> [ 0, 0, -roll ]
yaw   -> [ 0, -yaw, 0 ]
```

先求 `R`，再按上述固定顺序分解为角度；不要把多个候选 Euler 角相加，也不要把资源动画中的负号再次写入数据角度。

## 4. Fancy 几何类型

| 类型 | 处理规则 |
| --- | --- |
| full block | 只改变贴图面的状态重排贴图；表达整体方向的状态使用 `R` 旋转 |
| pillar | 解码为 x/y/z 轴，再用同一坐标架方法旋转；不能当成四向 yaw |
| 水平朝向 | 目标 front 改变，target up 保持世界上 |
| `orientation` | 同时建立目标法线和 front 的完整坐标架，一次求 `R` |
| 面附着 | 先把模型附着面转到目标面，再处理附着面内的朝向 |
| 半砖 | bottom/top 只改变局部高度偏移；几何方向仍由 `R` 决定 |
| 活板门 | 静态方向由 `R` 决定，`open_bit` 只驱动铰链子骨骼绕自己的 pivot |
| 多变体 | 换模型、贴图或骨骼是选择；不能用旋转伪造非刚体变体 |

动态模型必须保持：

```text
slot 静态方向
└─ lid/door/lever 等动态骨骼
```

动态动画只改变子骨骼的局部旋转、位置或可见性，不重算 slot 的基础方向。箱体朝向和箱盖开合应由这两层分别表达。

## 5. Fancy 数据路径一致性

同一个 `(block type, permutation)` 必须得到同一组结果：

```text
模型选择、整数格位置、visualOffset、slot 局部旋转、动态状态
```

这组结果必须同时用于 dense、sparse 和 pool。family/state 条件只能选择一个互斥结果，不能把多个条件角度相加。

## 6. 世界坐标到 Vanilla 手持实体

### 6.1 位置

Vanilla 手持实体与 Fancy 使用同一位置投影：

```text
local_x = blockLocal.x + visualOffset.x
local_y = blockLocal.y + visualOffset.y
local_z = blockLocal.z + visualOffset.z

position_model = (16*local_x, 16*local_y, -16*local_z)
```

其中 `blockLocal` 来自第 1.3 节的世界点逆变换。手持模型自身的 `item_scale`、`model` 平移和手臂姿态属于实体承载层，不改变方块的世界位置或方块局部偏移。

### 6.2 Vanilla 骨骼链

Vanilla 方块物品的骨骼链固定为：

```text
root -> yaw -> roll -> pitch -> local_offset
     -> local_yaw -> local_roll -> local_pitch -> model
```

主手和副手使用各自的 `local_*` 属性。`local_offset` 只负责位置；`local_yaw/local_roll/local_pitch` 只负责手持方块自身姿态。

### 6.3 Vanilla 零姿态和方向

Vanilla 手持模型有自己的零姿态契约，不能直接复用 Fancy 的 `baseFront/baseUp`。对 Vanilla 模型另行声明：

```text
baseFront_vanilla
baseUp_vanilla
baseRight_vanilla
```

将世界状态解码为目标坐标架后，用同一公式求 Vanilla 局部旋转：

```text
Rvanilla = Tvanilla · Bvanilla⁻¹
```

没有显式方块旋转时，Vanilla 方块物品使用实体承载层默认姿态：

```text
local_pitch = 0
local_yaw   = 90
local_roll  = 0
```

有显式状态旋转时，写入的 rotation 必须已经包含完整手持补偿，并替换默认 yaw；不得再额外加 90 度。Fancy 的局部旋转表也不得直接复制到 Vanilla。

### 6.4 Vanilla 状态处理顺序

1. 从世界方块 permutation 读取状态。
2. 按状态语义解码目标面、轴、front 或附着面。
3. 使用 Vanilla 自己的零姿态坐标架建立 `Tvanilla`。
4. 计算 `Rvanilla = Tvanilla · Bvanilla⁻¹`。
5. 按 Vanilla 骨骼的固定顺序写入 `[local_pitch, local_yaw, local_roll]`。
6. 最后写入局部位置和实体固定缩放。

## 7. 新模型接入检查表

### Fancy

1. 声明 `baseFront/baseUp/baseRight/pivot`。
2. 为每个状态声明几何语义，而不是直接填写角度。
3. 将世界目标轴经过 `S` 投影，建立 `T`。
4. 用 `R = T · Bᵀ` 求局部刚体旋转。
5. 按枢轴公式应用旋转，另行写入局部几何偏移。
6. 把同一结果接入 dense、sparse、pool。
7. 把盖子、门等动态状态放在静态 slot 的子骨骼上。

### Vanilla 手持

1. 另行声明 Vanilla 模型的三个零姿态轴。
2. 复用世界状态语义和位置投影，不复用 Fancy 的零姿态角度。
3. 有显式旋转时替换默认 `local_yaw = 90`，不叠加。
4. 检查 `local_offset` 与局部旋转没有互相补偿。

完成标准是：给定世界位置、方块 permutation 和模型零姿态契约，文档中的公式能唯一确定模型位置、面向、枢轴旋转、半砖/附着偏移和动态子骨骼变换；不需要为每个状态重复试角度。
