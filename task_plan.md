# Task Plan

- [in_progress] 对照 TreePhysics 与 sable 的模块和当前差异
- [pending] 修复染色、互动目标、挖掘、选择框、箱子装配链路
- [pending] 修复计划/非预期结算的持久化恢复与 kill 拦截
- [pending] 检查其他无法解释的迁移缺失并运行可用验证

## Errors Encountered

| Error | Attempt | Resolution |
|---|---:|---|
| sable 根目录不存在 `package.json`/`tsconfig.json` | 1 | 改为读取仓库文档和既有构建配置确定验证命令。 |
| 读取 `src/sublevel/HoldingSubLevel.ts` 路径不存在 | 1 | 实际文件位于 `src/sublevel/storage/HoldingSubLevel.ts`；同时确认该区域多为未接线占位。 |
