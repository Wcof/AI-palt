---
page_id: page-newAI-apiKey
route: newAI/apiKey
code_paths: ["../views/ai/mcp/skillDetail.vue"]
feature_ids: ["feat-newAI-apiKey-core"]
change_ids: ["chg-newAI-apiKey-init"]
last_synced_at: 2026-06-03
---
# API 密钥

## 页面基础信息
- 路由：`/newAI/apiKey`
- 兼容路由：`/workbench/keys`

## 页面目标
- 演示 API Key 创建、启停、删除和授权范围。

## 页面结构
- 顶部说明区
- 列表管理区
- 创建弹窗

## 字段说明
- 密钥名称、密钥值、所属项目、知识库授权、技能授权、智能体授权、状态、过期时间

## 操作说明
- 创建
- 启用 / 禁用
- 删除

## 交互规则
- delete / update 自动写入审计日志。

## 状态流转
- 启用 / 禁用 / 删除

## 异常场景
- 未配置授权范围时不可创建。

## 权限规则
- 页面入口默认开通，权限范围由本地 mock 控制。

## 数据规则
- 数据保存在 Pinia persisted state。

## 验收标准
- 可创建、启停、删除密钥。
- 审计日志可看到 update / delete 记录。
