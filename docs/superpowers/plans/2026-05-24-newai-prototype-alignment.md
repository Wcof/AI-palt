# NewAI Prototype Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将现有 AI 原型一次性升级为 newAI 风格工作台，并补齐 6 月 mock 能力与 `docs/product` PRD 体系。

**Architecture:** 以 `/newAI/*` 作为主路由入口，保留旧路由兼容跳转。新增集中式 `newAI` Pinia store 管理授权、反馈、样本池、OCR、工具测试、审计、模型与版本台账；主页面复用现有视图并用 newAI 包装页统一信息架构和状态提示；PRD 通过 `docs/product` 维护，通过 `src/prd_docs/route-map.ts` 提供页面内路由映射。

**Tech Stack:** Vue 3、TypeScript、Pinia persisted state、Vue Router、markdown-it、Vite

---

### Task 1: 初始化 PRD 目录与基础计划

**Files:**
- Create: `docs/product/*`
- Create: `docs/superpowers/plans/2026-05-24-newai-prototype-alignment.md`

- [ ] 初始化 `docs/product` 基础目录与模板
- [ ] 建立 newAI 页面与功能清单的初版文档骨架
- [ ] 为后续代码改动准备页面级 PRD 与变更记录文件

### Task 2: 建立 newAI 路由与导航骨架

**Files:**
- Modify: `src/router/index.ts`
- Modify: `src/components/layout/AppShell.vue`
- Modify: `src/components/layout/PlatformSideNav.vue`

- [ ] 新增 `/newAI/assistant|knowledge|agent|mcp|apiKey|system` 路由
- [ ] 将 `/` 默认入口和 `/ai-app` 兼容到 `assistant`
- [ ] 将旧路径兼容跳转到新路径
- [ ] 将左侧导航切换为 newAI 顺序与文案

### Task 3: 建立集中式 newAI mock store

**Files:**
- Create: `src/stores/newAI.ts`
- Modify: `src/stores/workbenchApps.ts`
- Modify: `src/stores/workbenchKeys.ts`

- [ ] 定义授权包、功能开关、样本池、OCR、工具测试、审计日志、版本台账、模型配置、Prometheus 指标与备份数据结构
- [ ] 提供未授权校验、反馈入样本池、上下文打包、OCR 创建、工具测试执行、审计落库方法
- [ ] 将关键 update/delete/create 操作接入审计记录

### Task 4: 对齐 AI 助手工作台

**Files:**
- Modify: `src/stores/aiApp.ts`
- Modify: `src/views/dashboard/ai/index.vue`
- Modify: `src/components/aiApp/ChatInterface.vue`

- [ ] 调整 Agent 命名与顺序
- [ ] 增加上传直传 mock、OCR 结果、反馈闭环、上下文打包、模型展示、未授权提示
- [ ] 统一换行与复制展示

### Task 5: 对齐知识库、智能体、技能、API Key、系统设置页面

**Files:**
- Create: `src/views/newAI/*.vue`
- Modify: `src/views/ai/mcp/index.vue`
- Modify: `src/views/ai/settings/systemSettings.vue`
- Modify: `src/views/dashboard/workbench/keys.vue`

- [ ] 用 newAI 工作台包装页统一头部、能力状态和空态
- [ ] MCP 页补在线测试面板
- [ ] API Key 页补授权状态感知
- [ ] 系统设置页补 License、样本池、模型、审计、Prometheus、备份、小程序适配

### Task 6: 页面内 PRD 映射与 Markdown 渲染

**Files:**
- Create: `src/prd_docs/route-map.ts`
- Modify: `src/components/prd/PrdOverlay.vue`

- [ ] 建立路由到 Markdown 文档的显式映射
- [ ] 在浮层中渲染 Markdown 内容
- [ ] 未命中时显示固定提示

### Task 7: PRD 同步与校验

**Files:**
- Modify: `docs/product/01-页面路由清单.md`
- Modify: `docs/product/02-功能清单.md`
- Modify: `docs/product/pages/*.md`
- Modify: `docs/product/changelog/*.md`
- Create: `docs/product/audit/*.md`

- [ ] 同步页面 PRD、功能清单、路由清单、变更记录
- [ ] 执行 `prdctl.py diff-sync`、`sync`、`audit`
- [ ] 执行 `npm run build`
