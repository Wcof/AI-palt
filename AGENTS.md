# AGENTS.md

## 项目定位

本项目是一个“AI 原型设计 + PRD 同步维护”的产品原型项目。Agent 不只是前端实现助手，还必须维护页面 PRD、功能清单、变更记录和一致性审计。

## PRD Skill

本项目使用 create-prd Skill：

```text
.agents/skills/create-prd/
```

当任务涉及 PRD 初始化、页面 PRD、Axure HTML 反向生成、页面变更同步 PRD、代码与 PRD 一致性审计时，必须优先参考该 Skill。

## PRD 输出目录

所有真实项目 PRD 产物必须输出到：

```text
docs/product/
```

目录说明：

```text
docs/product/00-项目上下文.md
docs/product/01-页面路由清单.md
docs/product/02-功能清单.md
docs/product/03-全局交互规则.md
docs/product/04-PRD编写规范.md
docs/product/system-prd/
docs/product/pages/
docs/product/changelog/
docs/product/audit/
docs/product/imports/
docs/product/templates/
docs/product/.index/traceability.json
```

## 页面 PRD 命名规则

路由 `/management/dispatch/center` 对应：

```text
docs/product/pages/management-dispatch-center.md
docs/product/changelog/management-dispatch-center-change.md
```

## 每次修改页面后的强制规则

每次修改页面代码后，必须判断是否影响 PRD。

必须同步 PRD 的情况：新增/删除功能、修改字段、按钮、筛选条件、页面结构、交互流程、状态流转、权限规则、数据展示逻辑、异常处理、入口、跳转、mock 数据结构、业务规则。

纯视觉样式优化可以不更新 PRD 主体，但必须更新页面变更记录。

每次页面变更后，至少执行一次：

```bash
python scripts/prdctl.py diff-sync . --staged --prd-root docs/product
python scripts/prdctl.py sync . --from-code --prd-root docs/product
python scripts/prdctl.py audit . --level strict --prd-root docs/product
```

## 新增页面规则

新增页面时必须同步新增或更新：

1. 页面代码
2. 页面路由
3. 页面 PRD
4. 页面变更记录
5. 页面路由清单
6. 功能清单

## 页面内 PRD 查看器（可选但推荐）

如果项目是前端原型并且需要“页面内直接查看 PRD”，默认采用以下交互：

1. 页面右下角固定 `PRD` 按钮。
2. 点击按钮打开/关闭 PRD 遮罩面板。
3. 遮罩点击可关闭，并保留明确关闭按钮。
4. 使用路由映射表读取当前页面对应 PRD；未命中时提示：`未找到该页面对应的 PRD 文件`。
5. PRD 内容按 Markdown 结构化渲染，不允许纯文本堆叠。

## 完成输出格式

每次任务完成后必须输出：

### 1. 页面修改摘要

### 2. PRD 影响判断

| 页面 | 是否影响 PRD | 原因 |
|---|---|---|

### 3. 已修改文件

| 文件类型 | 文件路径 | 修改说明 |
|---|---|---|

### 4. 一致性检查

| 检查项 | 结果 | 说明 |
|---|---|---|
| 页面代码是否已修改 |  |  |
| 页面 PRD 是否已同步 |  |  |
| 功能清单是否已同步 |  |  |
| 变更记录是否已同步 |  |  |
| 路由清单是否已同步 |  |  |

### 5. 运行检查结果

说明是否执行了构建、lint、类型检查或页面预览。如果未执行，需要说明原因。

## 优先级规则

当用户最新描述、现有 PRD、现有代码三者冲突时，优先级为：

1. 用户最新明确描述
2. 页面 PRD
3. 当前代码实现

如果根据用户最新描述修改了代码，必须同步修正 PRD。

## UI 设计规范

### 搜索与筛选工具栏

搜索条件区统一使用工具栏风格，参考 `AiKnowledgeBaseList.vue`：

1. **布局**：横向 `flex` 布局，左输入右按钮，间距 `8px`
2. **输入框容器**：`position: relative`，用于放置内部清空按钮
3. **输入框样式**：
   - 高度 `36px`，圆角 `10px`，白底
   - 边框 `1px solid #d1e8ff`
   - 字体 `13px`，文字色 `#1f2d3d`
   - 右侧预留 `padding-right: 36px` 给清空按钮
4. **清空按钮**：
   - 输入框内右侧居中，尺寸 `22×22`
   - 透明底，默认浅蓝灰 `#94a3b8`
   - hover 变主蓝 `#0098ff` + 淡蓝圆形背景 `rgba(0,152,255,.1)`
5. **筛选控件**：
   - 筛选条件使用 `<select>` 下拉框，不用图标按钮
   - 下拉框样式：高度 `36px`，圆角 `10px`，白底，边框 `#d1e8ff`
   - 字体 `13px`，文字色 `#1f2d3d`
6. **操作按钮**（非筛选类）：
   - 纯图标按钮尺寸 `36×36`，圆角 `12px`
   - 主按钮用蓝底白图标，带轻阴影和轻微上浮 hover
7. **整体视觉**：浅蓝、轻阴影、圆角、工具栏感，不要重表单风格或深色筛选条

### 工具栏容器

```css
.toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  border-radius: 22px;
  background: #f8fafc;
  padding: 10px 12px;
  box-shadow: inset 0 0 0 1px #e2e8f0;
}
```

### 参考组件

- 知识库列表页：`src/views/ai/settings/aiknowledge/AiKnowledgeBaseList.vue`
