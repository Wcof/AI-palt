---
page_id: page-newAI-knowledge
route: newAI/knowledge
code_paths: ["../views/ai/mcp/skillDetail.vue"]
feature_ids: ["feat-newAI-knowledge-core"]
change_ids: ["chg-newAI-knowledge-init"]
last_synced_at: 2026-06-03
---
# AI 知识库

## 页面基础信息
- 路由：`/newAI/knowledge`
- 兼容路由：`/knowledge`

## 页面目标
- 展示知识库列表、搜索、标签和详情弹窗。

## 页面结构
- 顶部工作台说明区
- 列表与筛选区
- 详情弹窗

## 字段说明
- 名称、描述、标签、更新时间、来源

## 操作说明
- 搜索知识库
- 打开详情弹窗

## 交互规则
- 保留本地 mock CRUD 结构，不接真实检索。

## 状态流转
- 空态 / 命中列表 / 无结果

## 异常场景
- 暂无数据时显示空态。

## 权限规则
- 知识库页面默认开通。

## 数据规则
- 数据来自本地 mock 列表。

## 验收标准
- 路由可访问。
- 可查看知识库列表和详情。
