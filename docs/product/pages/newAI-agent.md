---
page_id: page-newAI-agent
route: newAI/agent
code_paths: ["../views/ai/mcp/skillDetail.vue"]
feature_ids: ["feat-newAI-agent-core"]
change_ids: ["chg-newAI-agent-init"]
last_synced_at: 2026-06-03
---
# AI 智能体

## 页面基础信息
- 路由：`/newAI/agent`
- 兼容路由：`/agents`

## 页面目标
- 展示智能体列表、详情和默认模型口径。

## 页面结构
- 顶部说明区
- 智能体列表区
- 详情弹窗

## 字段说明
- 智能体名称、描述、标签、能力说明

## 操作说明
- 选择智能体
- 查看详情

## 交互规则
- 默认模型信息从系统设置读取。

## 状态流转
- 空态 / 列表态 / 弹窗态

## 异常场景
- 列表为空时提示暂无智能体。

## 权限规则
- 智能体页默认按能力包控制入口状态。

## 数据规则
- 数据来自前端 mock。

## 验收标准
- 路由可访问。
- 可打开详情弹窗。
