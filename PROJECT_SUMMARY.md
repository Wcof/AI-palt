# AI 平台前端项目总结

## 项目概述

这是一个基于 Vue 3 + TypeScript + Vite 的企业级 AI 平台前端应用，专注于安全生产领域的 AI 能力展示和交互。平台提供 AI 知识库、AI 智能体、AI 技能等能力，支持在线体验、开发工作台等功能。

## 技术栈

### 核心框架
- **Vue 3.5.13** - 渐进式 JavaScript 框架，使用 Composition API
- **TypeScript 5.6.2** - 类型安全的 JavaScript 超集
- **Vite 6.3.5** - 新一代前端构建工具

### 路由和状态管理
- **Vue Router 4.5.0** - 官方路由管理器，使用 Hash 模式
- **Pinia 2.3.0** - Vue 3 官方状态管理库
- **pinia-plugin-persistedstate 3.2.3** - Pinia 状态持久化插件

### UI 和样式
- **Tailwind CSS 3.4.17** - 实用优先的 CSS 框架
- **PostCSS 8.4.49** - CSS 转换工具
- **Autoprefixer 10.4.20** - CSS 自动添加浏览器前缀

### 国际化
- **Vue I18n 10.0.5** - Vue 国际化插件，支持中文和英文

### 图标和组件库
- **Lucide Vue Next 0.469.0** - 现代化图标库

### 功能库
- **markdown-it 14.1.0** - Markdown 解析器
- **highlight.js 11.11.1** - 代码语法高亮
- **clsx 2.1.1** - 条件类名工具
- **tailwind-merge 2.6.0** - Tailwind 类名合并工具

### 开发工具
- **@vitejs/plugin-vue 5.2.1** - Vite Vue 3 插件
- **vue-tsc 2.2.0** - Vue TypeScript 类型检查器

## 项目结构

```
ai-platform-frontend-vue2/
├── src/                          # 源代码目录
│   ├── api/                      # API 接口层
│   │   └── chatStream.ts         # 流式聊天 API
│   ├── components/               # 可复用组件
│   │   ├── abilities/            # 能力相关组件
│   │   │   ├── browser/          # 能力浏览器子组件
│   │   │   ├── home/             # 首页能力展示组件
│   │   │   ├── AbilityBrowser.vue
│   │   │   ├── AbilityCard.vue
│   │   │   ├── AbilityFloors.vue
│   │   │   └── SubscribeModal.vue
│   │   ├── aiApp/                # AI 应用组件
│   │   │   ├── ChatInterface.vue
│   │   │   ├── ConversationSidebar.vue
│   │   │   └── WelcomeScreen.vue
│   │   ├── auth/                 # 认证组件
│   │   │   ├── LoginModal.vue
│   │   │   └── UserDropdown.vue
│   │   ├── carousel/             # 轮播组件
│   │   │   └── HeroCarousel.vue
│   │   ├── dashboard/            # 仪表板组件
│   │   │   └── StatsPanel.vue
│   │   ├── experience/           # 在线体验组件
│   │   │   ├── AddKnowledgeModal.vue
│   │   │   ├── ChatPanel.vue
│   │   │   ├── DocsPanel.vue
│   │   │   └── ExperiencePreviewPanel.vue
│   │   ├── layout/               # 布局组件
│   │   │   └── AppShell.vue
│   │   ├── nav/                  # 导航组件
│   │   │   └── TopNav.vue
│   │   ├── prd/                  # PRD 相关组件
│   │   │   └── PrdOverlay.vue
│   │   ├── search/               # 搜索组件
│   │   │   └── GlobalSearch.vue
│   │   ├── visual/               # 视觉效果组件
│   │   │   └── ParticleBackground.vue
│   │   ├── workbench/            # 工作台组件
│   │   │   └── AppEditorModal.vue
│   │   └── Empty.vue
│   ├── composables/              # 组合式函数
│   │   ├── useCountUp.ts
│   │   ├── useDebouncedValue.ts
│   │   ├── usePrefersReducedMotion.ts
│   │   └── useTheme.ts
│   ├── data/                     # 静态数据
│   │   ├── abilities.ts          # 能力定义数据
│   │   └── knowledgeDocs.ts      # 知识库文档数据
│   ├── lib/                      # 工具库
│   │   └── utils.ts
│   ├── locales/                  # 国际化语言文件
│   │   ├── en-US.json
│   │   └── zh-CN.json
│   ├── pages/                    # 页面组件
│   │   ├── workbench/            # 工作台页面
│   │   │   ├── WorkbenchLayout.vue
│   │   │   ├── WorkbenchApps.vue
│   │   │   └�── WorkbenchKeys.vue
│   │   │   ├── WorkbenchStats.vue
│   │   │   └── WorkbenchSubscriptions.vue
│   │   ├── AIApp.vue             # AI 应用页面
│   │   ├── Abilities.vue         # 能力列表页面
│   │   ├── AbilityDetail.vue     # 能力详情页面
│   │   ├── BannerManager.vue     # Banner 管理页面
│   │   ├── ComingSoon.vue        # 即将推出页面
│   │   ├── DomainExperience.vue  # 领域体验页面
│   │   ├── Home.vue              # 首页
│   │   ├── NotFound.vue          # 404 页面
│   │   ├── OnlineExperience.vue  # 在线体验页面
│   │   ├── Search.vue            # 搜索结果页面
│   │   └── SystemSettings.vue    # 系统设置页面
│   ├── prd_docs/                 # PRD 文档
│   │   ├── AllPages_PRD.md
│   │   └── 页面*.md
│   ├── router/                   # 路由配置
│   │   └── index.ts
│   ├── stores/                   # Pinia 状态管理
│   │   ├── aiApp.ts              # AI 应用状态
│   │   ├── chat.ts               # 聊天状态
│   │   ├── knowledge.ts          # 知识库状态
│   │   ├── subscriptions.ts      # 订阅状态
│   │   ├── system.ts             # 系统设置状态
│   │   ├── user.ts               # 用户状态
│   │   ├── workbenchApps.ts      # 工作台应用状态
│   │   ├── workbenchKeys.ts      # 工作台密钥状态
│   │   └── workbenchStats.ts     # 工作台统计状态
│   ├── utils/                    # 工具函数
│   │   ├── abilityQuery.ts       # 能力查询工具
│   │   ├── search.ts             # 搜索工具
│   │   └── track.ts              # 追踪工具
│   ├── App.vue                   # 根组件
│   ├── i18n.ts                   # 国际化配置
│   ├── index.css                 # 全局样式
│   └── main.ts                   # 应用入口
├── dist/                         # 构建输出目录
├── public/                       # 静态资源目录
├── index.html                    # HTML 模板
├── package.json                  # 项目配置
├── vite.config.ts               # Vite 配置
├── tailwind.config.js            # Tailwind 配置
├── tsconfig.json                 # TypeScript 配置
└── postcss.config.js             # PostCSS 配置
```

## 路由结构

### 路由模式
- 使用 **Hash 模式** (`createWebHashHistory`)
- 基础路径：`/ai-platform-frontend/`

### 主要路由

| 路径 | 组件 | 说明 |
|------|------|------|
| `/` | 重定向到 `/ai-app` | 根路径重定向 |
| `/ai-app` | AIApp.vue | AI 智能助手页面 |
| `/abilities` | Abilities.vue | 能力平台页面 |
| `/ability/:id` | AbilityDetail.vue | 能力详情页面 |
| `/search` | Search.vue | 搜索结果页面 |
| `/experience` | OnlineExperience.vue | 在线体验页面 |
| `/experience/agent` | DomainExperience.vue | 智能体在线体验 |
| `/experience/mcp` | DomainExperience.vue | AI 技能在线体验 |
| `/workbench` | WorkbenchLayout.vue | 开发工作台（布局） |
| `/workbench/subscriptions` | WorkbenchSubscriptions.vue | 订阅列表 |
| `/workbench/apps` | WorkbenchApps.vue | 应用管理 |
| `/workbench/keys` | WorkbenchKeys.vue | API 密钥管理 |
| `/workbench/stats` | WorkbenchStats.vue | 统计明细 |
| `/banner` | BannerManager.vue | Banner 管理 |
| `/system` | SystemSettings.vue | 系统设置 |
| `/mcp` | ComingSoon.vue | AI 技能中心（即将推出） |
| `/docs` | ComingSoon.vue | 文档支持（即将推出） |
| `/console` | ComingSoon.vue | 控制台入口（即将推出） |
| `/:pathMatch(.*)*` | NotFound.vue | 404 页面 |

### 路由特性
- **嵌套路由**：工作台使用嵌套路由结构
- **懒加载**：AIApp、OnlineExperience、WorkbenchLayout 及其子页面使用懒加载
- **路由守卫**：暂未实现，可根据需要添加

## 页面结构

### 1. 首页 (Home.vue)
- **功能**：展示平台概览、全局搜索、统计数据、能力楼层
- **主要组件**：
  - HeroCarousel - 轮播图
  - GlobalSearch - 全局搜索
  - StatsPanel - 统计面板
  - AbilityFloors - 能力楼层展示
- **特点**：响应式设计，支持移动端和桌面端

### 2. AI 智能助手 (AIApp.vue)
- **功能**：AI 对话界面，支持多会话管理
- **主要组件**：
  - ConversationSidebar - 会话侧边栏
  - ChatInterface - 聊天界面
- **特性**：
  - 支持流式响应
  - 深度思考模式
  - 会话管理（创建、删除、切换）
  - 移动端侧边栏抽屉

### 3. 能力平台 (Abilities.vue)
- **功能**：展示所有 AI 能力，支持筛选和搜索
- **主要组件**：AbilityBrowser
- **特性**：
  - 按领域筛选（AI 知识库、AI 智能体、AI 技能）
  - 关键词搜索
  - 分页显示
  - 热门标签展示

### 4. 能力详情 (AbilityDetail.vue)
- **功能**：展示单个能力的详细信息
- **特性**：包含能力描述、版本、调用次数、评分等

### 5. 在线体验 (OnlineExperience.vue)
- **功能**：提供不同 AI 领域的在线体验
- **主要组件**：
  - ChatPanel - 聊天面板
  - DocsPanel - 文档面板
  - ExperiencePreviewPanel - 预览面板

### 6. 开发工作台 (WorkbenchLayout.vue)
- **功能**：开发者工具集，包含订阅、应用、密钥、统计
- **子页面**：
  - 订阅列表
  - 应用管理
  - API 密钥管理
  - 统计明细

## 组件结构

### 核心组件

#### AppShell.vue
- **作用**：应用主布局容器
- **包含**：
  - TopNav - 顶部导航栏
  - RouterView - 页面内容区域
  - Footer - 页脚
  - PrdOverlay - PRD 文档覆盖层

#### TopNav.vue
- **作用**：顶部导航栏
- **导航项**：
  - AI 智能助手
  - 能力平台
  - AI 知识库
  - AI 智能体
  - AI 技能
  - 开发工作台
- **特性**：
  - 响应式设计（桌面端横向导航，移动端横向滚动）
  - 用户登录/登出
  - 活动状态高亮

#### AbilityBrowser.vue
- **作用**：能力浏览器，支持筛选和搜索
- **子组件**：
  - BrowserHeader - 浏览器头部
  - FilterCard - 筛选卡片
  - FilterChips - 筛选标签
  - KeywordBar - 关键词搜索栏
  - ModeSwitch - 模式切换
  - Pager - 分页器
  - EmptyState - 空状态

#### ChatInterface.vue
- **作用**：聊天交互界面
- **功能**：
  - 消息展示
  - 输入框
  - 发送消息
  - 流式响应显示
  - 深度思考模式切换

#### ConversationSidebar.vue
- **作用**：会话列表侧边栏
- **功能**：
  - 会话列表展示
  - 创建新会话
  - 切换会话
  - 删除会话
  - 折叠/展开

### 组件分类

#### 按功能分类
- **布局组件**：AppShell
- **导航组件**：TopNav
- **能力相关**：AbilityBrowser, AbilityCard, AbilityFloors
- **AI 应用**：ChatInterface, ConversationSidebar, WelcomeScreen
- **认证相关**：LoginModal, UserDropdown
- **搜索相关**：GlobalSearch
- **体验相关**：ChatPanel, DocsPanel, ExperiencePreviewPanel
- **工作台相关**：AppEditorModal, WorkbenchLayout 及子组件

#### 按复用性分类
- **页面级组件**：位于 `src/pages/`，对应路由
- **功能组件**：位于 `src/components/`，可复用
- **组合式函数**：位于 `src/composables/`，逻辑复用

## 状态管理

### Pinia Stores

#### 1. aiApp.ts
- **作用**：AI 应用状态管理
- **状态**：
  - `conversations` - 会话列表
  - `activeConversationId` - 当前活动会话 ID
  - `streamingConversationId` - 流式响应会话 ID
  - `error` - 错误信息
  - `thinkingMode` - 深度思考模式
- **方法**：
  - `createConversation()` - 创建会话
  - `deleteConversation()` - 删除会话
  - `switchConversation()` - 切换会话
  - `sendMessage()` - 发送消息
  - `retryLast()` - 重试最后一条消息
- **持久化**：使用 `pinia-plugin-persistedstate`

#### 2. user.ts
- **作用**：用户认证状态
- **状态**：
  - `user` - 用户信息
  - `isAuthenticated` - 是否已登录
- **方法**：
  - `login()` - 登录
  - `logout()` - 登出
- **持久化**：key 为 `user-storage`

#### 3. system.ts
- **作用**：系统设置状态
- **状态**：
  - `systemName` - 系统名称
  - `tabTitle` - 标签页标题
  - `tabIcon` - 标签页图标
  - `logoUrl` - Logo URL
  - `prompts` - 提示词列表
- **计算属性**：
  - `displayName` - 显示名称
  - `displayTabTitle` - 显示标题
  - `displayTabIcon` - 显示图标
- **持久化**：key 为 `system-settings`

#### 4. 其他 Stores
- `chat.ts` - 聊天状态
- `knowledge.ts` - 知识库状态
- `subscriptions.ts` - 订阅状态
- `workbenchApps.ts` - 工作台应用状态
- `workbenchKeys.ts` - 工作台密钥状态
- `workbenchStats.ts` - 工作台统计状态

### 状态持久化
- 使用 `pinia-plugin-persistedstate` 插件
- 默认持久化到 `localStorage`
- 支持自定义持久化键名

## API 集成

### 流式聊天 API (chatStream.ts)

#### 接口定义
```typescript
type StreamChatParams = {
  question: string;           // 问题内容
  kbIds: string[];            // 知识库 ID 列表
  signal?: AbortSignal;       // 中断信号
  onToken: (token: string) => void;  // Token 回调
  transport?: "auto" | "fetch" | "mock";  // 传输方式
  mode?: "standard" | "deep";  // 模式
};
```

#### 传输方式
- **auto**：自动选择（开发环境使用 mock，生产环境使用 fetch）
- **fetch**：使用真实 API（`/api/chat/stream`）
- **mock**：使用模拟数据

#### 特性
- 支持 SSE (Server-Sent Events) 流式响应
- 支持请求中断（AbortController）
- 自动重试机制（最多 5 次）
- 指数退避重试策略

### API 端点
- `POST /api/chat/stream` - 流式聊天接口

## 数据模型

### 能能力模型 (abilities.ts)

#### Ability 类型
```typescript
type Ability = {
  id: string;                  // 能力 ID
  name: string;                // 能力名称
  apiName: string;             // API 名称
  domain: AbilityDomain;      // 领域（NLP/LLM/MCP）
  summary: string;             // 摘要
  tags: string[];              // 标签
  hotTag: AbilityHotTag;       // 热门标签
  version: string;             // 版本
  calls: number;               // 调用次数
  rating: number;              // 评分
  price: AbilityPrice;         // 价格（免费/付费）
  icon: Component;             // 图标组件
};
```

#### 领域分类
- **NLP**：AI 知识库
- **LLM**：AI 智能体
- **MCP**：AI 技能

#### 热门标签
- 本周新增
- 热门
- 企业推荐
- 稳定

### 会话模型 (aiApp.ts)

#### Conversation 类型
```typescript
type Conversation = {
  id: string;                  // 会话 ID
  title: string;               // 会话标题
  createdAt: number;           // 创建时间
  updatedAt: number;           // 更新时间
  messages: ChatMessage[];     // 消息列表
};
```

#### ChatMessage 类型
```typescript
type ChatMessage = {
  id: string;                  // 消息 ID
  role: ChatRole;              // 消息角色（user/assistant）
  content: string;             // 消息内容
  createdAt: number;           // 创建时间
};
```

## 样式和主题

### Tailwind CSS 配置
- **暗色模式**：基于 class 的暗色模式
- **内容路径**：`./index.html`, `./src/**/*.{vue,js,ts,jsx,tsx}`
- **容器**：居中容器

### 全局样式 (index.css)

#### 自定义样式
- **字体**：系统字体栈
- **背景**：径向渐变背景
- **技术网格**：`.tech-grid` 类，用于背景装饰
- **动画**：
  - `ctaPulse` - CTA 按钮脉冲动画
  - `pageEnter` - 页面进入动画

#### 颜色主题
- 主色调：蓝色 `#00B4FF`
- 辅助色：紫色 `#8D4CFF`
- 背景色：渐变白色系

### 响应式设计
- **断点**：使用 Tailwind 默认断点
  - `sm`：640px
  - `md`：768px
  - `lg`：1024px
  - `xl`：1280px
- **移动优先**：优先设计移动端，然后适配桌面端

## 国际化

### 配置 (i18n.ts)
- **默认语言**：中文 (`zh-CN`)
- **备用语言**：中文 (`zh-CN`)
- **支持语言**：
  - 中文简体 (`zh-CN`)
  - 英文 (`en-US`)

### 语言文件位置
- `src/locales/zh-CN.json` - 中文语言包
- `src/locales/en-US.json` - 英文语言包

## 组合式函数

### useTheme.ts
- **作用**：主题管理
- **功能**：切换明暗主题

### useDebouncedValue.ts
- **作用**：防抖值
- **功能**：创建防抖的响应式值

### useCountUp.ts
- **作用**：数字动画
- **功能**：数字递增动画效果

### usePrefersReducedMotion.ts
- **作用**：减少动画偏好
- **功能**：检测用户是否偏好减少动画

## 工具函数

### abilityQuery.ts
- **作用**：能力查询和筛选
- **功能**：
  - 按领域筛选
  - 按关键词搜索
  - 按标签筛选

### search.ts
- **作用**：全局搜索功能
- **功能**：跨能力搜索

### track.ts
- **作用**：数据追踪
- **功能**：用户行为追踪

### utils.ts
- **作用**：通用工具函数
- **功能**：类名合并等

## 构建和部署

### 开发命令
```bash
npm run dev              # 启动开发服务器 (http://localhost:5173)
```

### 生产命令
```bash
npm run build            # TypeScript 类型检查 + Vite 构建
npm run preview          # 预览生产构建
```

### 构建配置

#### Vite 配置 (vite.config.ts)
- **基础路径**：`/ai-platform-frontend/`
- **插件**：Vue 3 插件
- **路径别名**：`@/*` → `./src/*`

#### TypeScript 配置
- **目标**：ES2020
- **模块解析**：bundler
- **严格模式**：禁用
- **路径别名**：`@/*` → `./src/*`

### 构建输出
- **输出目录**：`dist/`
- **资源处理**：自动处理静态资源
- **代码分割**：路由懒加载自动代码分割

### 部署建议

#### Nginx 配置示例
```nginx
location /ai-platform-frontend/ {
    alias /path/to/dist/;
    try_files $uri $uri/ /ai-platform-frontend/index.html;
}
```

#### Docker 部署
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
FROM nginx:alpine
COPY --from=0 /app/dist /usr/share/nginx/html/ai-platform-frontend
```

## 开发规范

### 代码风格
- 使用 TypeScript 类型注解
- 使用 Composition API (`<script setup>`)
- 组件命名使用 PascalCase
- 文件命名使用 PascalCase（组件）或 camelCase（工具）

### 组件开发
- 单一职责原则
- Props 使用 TypeScript 类型定义
- Emits 使用 TypeScript 类型定义
- 优先使用组合式函数复用逻辑

### 状态管理
- 使用 Pinia 管理全局状态
- 使用 `pinia-plugin-persistedstate` 持久化状态
- Store 命名使用 camelCase

### 样式开发
- 优先使用 Tailwind CSS 类
- 复杂样式使用 scoped CSS
- 响应式设计优先移动端

## 性能优化

### 代码分割
- 路由懒加载
- 组件懒加载（按需）

### 资源优化
- 图片懒加载
- 图标使用 SVG 组件
- 字体使用系统字体

### 渲染优化
- 使用 `v-show` 替代频繁切换的 `v-if`
- 合理使用 `computed` 缓存计算结果
- 使用 `v-memo` 优化列表渲染

## 浏览器支持

### 目标浏览器
- Chrome/Edge（最新版本）
- Firefox（最新版本）
- Safari（最新版本）
- 移动端浏览器（iOS Safari, Chrome Mobile）

### 特性支持
- ES2020+ 语法
- CSS Grid 和 Flexbox
- CSS 自定义属性
- Fetch API
- AbortController

## 安全考虑

### XSS 防护
- Vue 默认转义 HTML
- 使用 `markdown-it` 时注意配置

### CSRF 防护
- API 请求应包含 CSRF token（待实现）

### 敏感信息
- 不在前端存储敏感信息
- API 密钥等敏感信息应从后端获取

## 已知问题和待办

### 待实现功能
- [ ] 路由守卫（权限控制）
- [ ] 错误边界处理
- [ ] 性能监控
- [ ] 单元测试
- [ ] E2E 测试
- [ ] PWA 支持

### 已知问题
- [ ] 部分页面使用 ComingSoon 占位
- [ ] API 接口需要对接真实后端

## 相关文档

- [CLAUDE.md](./CLAUDE.md) - Claude Code 工作指南
- [plan.md](./plan.md) - 项目计划文档
- [prd_docs/](./prd_docs/) - PRD 文档目录

## 联系方式

如有问题或建议，请联系项目维护者。
