---
page_id: page-newAI-mcp
route: newAI/mcp
code_paths: ["../views/ai/mcp/skillDetail.vue"]
feature_ids: ["feat-newAI-mcp-core"]
change_ids: ["chg-newAI-mcp-init"]
last_synced_at: 2026-06-03
---
# AI 技能

## 页面基础信息
- 路由：`/newAI/mcp`
- 兼容路由：`/mcp`

## 页面目标
- 展示 MCP / Skill 列表，并补在线测试面板。

## 页面结构
- 顶部说明区
- 技能列表区
- 在线测试侧栏

## 字段说明
- 工具名称、标签、参数、状态码、耗时、日志 ID、返回 JSON

## 操作说明
- 配置参数
- 模拟上传图片
- 执行测试

## 交互规则
- 失败测试案例进入样本池。

## 状态流转
- 未执行 / 成功 / 失败

## 异常场景
- 未授权时弹能力包提示。

## 权限规则
- MCP 在线测试受能力包控制。

## 数据规则
- 测试记录和样本池数据写入 Pinia。

## 验收标准
- 可执行在线测试。
- 可看到状态码、耗时、日志 ID 和 JSON 返回。
