# 子世界渲染与 TreePhysics 的数据等价

以 TreePhysics 的渲染数据为唯一真值。渲染差异 = 同一坐标同一方块在两边产生不同的最终绘制数据（几何、UV、旋转、贴图、材质、染色、亮度系数、动画）；打包策略（自适应盒形、混合、共享池）不构成差异。

## 差异清单（对照提取结果）

| 项 | TreePhysics 真值 | 当前 sable | 处置 |
| --- | --- | --- | --- |
| 原木/木头朝向 | 整体旋转：x 轴 roll 90、z 轴 pitch 90，side/top 双通道 | 换面贴图，无旋转，贴图朝向错误 | `pillar` 类型 + 旋转包装 |
| 泥泞红树根 | 全立方 top/side 双通道（同原木结构） | 四根柱体 | 改 `pillar`（axis y） |
| 红树根 | side 通道：内外六片薄板含镜像 UV；top 通道：上下双面片 | 四根柱体 | 库几何逐字节移植 |
| 箱子 | `textures/entity/chest/normal` 64×64 图集 UV，箱体+盖+锁，槽位 yaw=180+朝向×90，盖开合三次缓动，材质 `alpha_block` | 16×16 贴图错误 UV、无锁、无缓动、旋转号未验证 | 库几何 + 缓动动画移植 |
| 蜂巢 | down/up/front/side 四贴图通道 + yaw=(模型朝向−2)×90，front/front_honey 按蜜等级 | full_block 换面 | `bee_nest` 类型 |
| 可可 | 每龄专用几何（4/6/8 尺寸、含果柄与真实 UV）+ yaw=朝向×90 | 单方盒近似、尺寸错误、无果柄 | 库几何 + `direction` |
| 藤蔓 | 单模板面 z=7.2 内缩、背面镜像 UV，四面骨骼旋转复用；位映射 s=1 w=2 n=4 e=8；bits=0 不渲染 | 轴对齐薄板 7.99、无镜像、含 up 面 | 库几何；faces 重生成并去掉 up |
| 垂根/苍白苔须 | −45° 斜置交叉双板（宽 20.36） | 轴对齐交叉板 | 库几何；苔须 tip 仅换贴图 |
| 红树胎生苗 | 悬挂 5 阶专用几何（芽、四斜叶、垂茎），非悬挂不入 fancy（回退手持） | improvised 几何 + 非悬挂变体 | 库几何；非悬挂改 `vanilla` 回退 |
| 绞刑木之心 | 三轴专用嵌套旋转 + up 面 uv_rotation，逐状态贴图 | full_block 换面 | `creaking_heart` 类型 |
| 树叶 | 全立方六面 uv[0,0] | 相同 | 零差异，保持 |
| 材质映射 | 蜂巢/泥根/绞刑木之心=opaque_block；箱子=alpha_block；其余附着=alpha_block_color | 箱子=alpha_block_color | 箱子按类型强制 alpha_block |

## 方案

### 几何真值库

`sable/tools/sublevel-block/model-geometry.json`：从 TreePhysics 资源包一次性提取的槽位骨骼子树库（骨骼 pivot/rotation/cubes/uv 原样保留），按变体键组织，每变体记录贴图通道角色、材质角色与贴图尺寸。库中骨骼名使用 `{slot}` 占位，生成时替换为槽位序号。

### 注册表模型类型

| 类型 | 字段 | 变体来源 |
| --- | --- | --- |
| `full_block` | `textures.{6面}` | 树叶、missing |
| `pillar` | `textures.side/top`、`axis` | 原木、去皮、木头（top=side 即全皮）、泥泞红树根 |
| `chest` | `facing` | 库 chest；贴图固定实体图集 |
| `bee_nest` | `textures.down/up/front/side`、`direction` | 库四通道 |
| `cocoa` | `texture`、`age`、`direction` | 库 cocoa_{age} |
| `vine` | `texture`、`faces ⊆ {south,west,north,east}`（可空） | 库面骨骼 |
| `hanging_roots` / `pale_hanging_moss` | `texture`（+`tip`） | 库斜交叉板 |
| `mangrove_propagule` | `texture`、`stage` | 库 stage 0..4（仅悬挂） |
| `mangrove_roots` | `textures.side/top` | 库双通道 |
| `creaking_heart` | `textures.side/top`、`axis` | 库三轴变体 |
| `vanilla` | 无 | 该状态回退手持路线（编译为空模型，运行时按未注册处理） |

旋转包装（生成期烘焙，等价 TP 动画公式）：pillar x→[0,0,90]、z→[90,0,0]；chest yaw=180+朝向×90（south0/west1/north2/east3）；bee_nest yaw=((direction==0?0:4−direction)−2)×90；cocoa yaw=direction×90；creaking_heart 用库内嵌套旋转骨骼。

### 生成端

- 通道 = 库通道（贴图角色→注册表贴图字段），几何逐槽复制子树（骨骼名加槽位后缀），part_visibility 覆盖子树全部骨骼；贴图尺寸取库值（chest 64×64）。
- chest：`lid_pose` 动画 `-90*(1-(1-v.lid_n)^3)`，pre_animation 逐槽 `v.lid_n = v.lids_initialized ? clamp(v.lid_n + (开启?2:-2)*delta, 0, 1) : 开启`，开启条件按格式（dense/sparse `v.c_n > 1`，池 `v.st_n >= 1`），initialize 置 `v.lids_initialized = 0`，尾行置 1；材质强制 `alpha_block`。
- foliage 乘色层克隆库子树并将全部面 UV 替换为气候采样 UV；sparse/池逐槽控制器仍复用基础几何。
- 数据 JSON 由脚本按上表重写受影响方块；文档 `Bedrock-Sable.zh-CN.md` 模型类型表同步。

### 验证

构建 + `tsc` + 产物校验；等价 harness：对每个 (family, state) 用 TP 库+旋转公式合成期望槽位子树与贴图/材质/亮度系数，与生成包中对应模型逐字段比对，要求全量相等（树叶、full_block 含 missing 按现几何比对）。
