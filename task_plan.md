# Task Plan

- [completed] 对照 TreePhysics 与 sable 的模块和当前差异
- [completed] 收尾验证染色、互动目标、挖掘、选择框与箱子装配链路
- [completed] 修复计划/非预期结算的持久化恢复与 kill 拦截
- [completed] 检查其他无法解释的迁移缺失并运行可用验证

## Errors Encountered

| Error | Attempt | Resolution |
|---|---:|---|
| sable 根目录不存在 `package.json`/`tsconfig.json` | 1 | 改为读取仓库文档和既有构建配置确定验证命令。 |
| 读取 `src/sublevel/HoldingSubLevel.ts` 路径不存在 | 1 | 实际文件位于 `src/sublevel/storage/HoldingSubLevel.ts`；同时确认该区域多为未接线占位。 |
| 同一 `apply_patch` 中重复声明 `SubLevelSerializer.ts` 更新块 | 1 | 合并为单一文件更新块后重试。 |
| 当前会话根目录 `PhysicsAPI` 中不存在既有规划文件 | 1 | 在同级 `Simulated-Project-Bedrock` 定位到完整工作树并继续，未重新建立规划文件。 |
| 单入口 `tsc` 找不到 `sable:sublevel-block-registry` | 1 | 将仓库现有 `src/generated/sublevel-block-registry.d.ts` 显式加入检查，严格检查通过。 |
| PowerShell 将全部 sable 源文件展开传给 `tsc` 时命令行超长 | 1 | 保留已通过的单入口严格检查，改用构建工具和生成 JS 语法检查完成验证。 |
| 在迁移仓库父目录查找 `package.json` 未找到 | 1 | 构建工具已按自身路径运行通过，父目录 package 文件与本任务无关。 |
