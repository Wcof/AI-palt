# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Vue 3 + TypeScript + Vite frontend application for an AI platform focused on enterprise safety and production management. The platform provides AI capabilities, ability browsing, search, and a developer workbench.

## Common Commands

```bash
# Development
npm run dev              # Start Vite dev server (http://localhost:5173)

# Production
npm run build            # Build with TypeScript checking + Vite bundling
npm run preview          # Preview production build locally

# Type checking (included in build)
vue-tsc -b              # Check TypeScript types
```

## Architecture

### Core Structure

- **Pages** (`src/pages/`): Route-level components for main features
  - `AIApp.vue` - Main AI chat interface
  - `Abilities.vue` - Ability browsing and filtering
  - `Search.vue` - Global search results
  - `Workbench/` - Developer workbench with subscriptions, apps, API keys, stats
  - `OnlineExperience.vue` - Interactive demos for different AI domains

- **Components** (`src/components/`): Reusable UI components organized by feature
  - `aiApp/` - Chat interface components (ChatInterface, ConversationSidebar, WelcomeScreen)
  - `abilities/` - Ability cards and browser (AbilityCard, AbilityBrowser, AbilityFloors)
  - `workbench/` - Workbench-specific components
  - `layout/` - AppShell without topbar + left side navigation
  - `auth/` - LoginModal, UserDropdown
  - `search/` - GlobalSearch component
  - `experience/` - Demo panels (ChatPanel, DocsPanel, ExperiencePreviewPanel)

- **State Management** (`src/stores/`): Pinia stores with persistence
  - `user.ts` - User authentication state
  - `aiApp.ts` - AI chat conversations and messages (streaming support)
  - `system.ts` - Global system settings (theme, display name, tab title)
  - `workbenchApps.ts`, `workbenchKeys.ts`, `workbenchStats.ts`, `workbenchSubscriptions.ts` - Workbench features
  - `chat.ts`, `knowledge.ts`, `subscriptions.ts` - Domain-specific state

- **Routing** (`src/router/index.ts`): Hash-based routing with nested layouts
  - Root layout: `AppShell` (no topbar + main content + left navigation)
  - Main routes: abilities, search, ability/:id, ai-app, experience, workbench/*
  - Workbench nested routes: subscriptions, apps, keys, stats

- **Styling**: Tailwind CSS v3 with custom utilities in `src/index.css`
  - Tech grid background pattern
  - Page transition animations
  - Responsive design patterns

- **Internationalization** (`src/i18n.ts`): Vue i18n with Chinese (zh-CN) and English (en-US) locales

### Key Patterns

**Composables** (`src/composables/`): Reusable Vue 3 composition functions
- `useTheme.ts` - Theme management
- `useDebouncedValue.ts` - Debounced reactive values
- `useCountUp.ts` - Number animation
- `usePrefersReducedMotion.ts` - Accessibility

**API Integration** (`src/api/`):
- `chatStream.ts` - Streaming chat API with AbortController support
- Streaming responses append tokens to messages in real-time

**Data** (`src/data/`):
- `abilities.ts` - Static ability definitions
- `knowledgeDocs.ts` - Knowledge base documentation

**Utilities** (`src/utils/`):
- `abilityQuery.ts` - Ability filtering and search logic
- `search.ts` - Search functionality
- `track.ts` - Analytics/tracking

## Development Notes

### TypeScript Configuration
- Target: ES2020
- Module resolution: bundler
- Strict mode: disabled (allows more flexibility)
- Path alias: `@/*` → `./src/*`

### Vite Configuration
- Base path: `/ai-platform-frontend/`
- Vue 3 plugin enabled
- @ alias for src directory

### State Persistence
Pinia stores use `pinia-plugin-persistedstate` to persist state to localStorage:
- User store persists to `user-storage`
- AI app store persists to `ai-app-store`
- Other stores have custom persistence keys

### Streaming Chat
The `aiApp` store handles streaming responses:
- `sendMessage()` creates user and assistant messages
- `streamChatAnswer()` API call streams tokens via callback
- `AbortController` allows canceling in-flight requests
- Supports "deep" thinking mode vs "standard" mode

### Component Organization
Components are organized by feature/domain rather than type. Each folder contains related components for that feature area. This makes it easier to find and modify related UI elements.

### Routing Structure
- Hash-based routing (URLs like `/#/abilities`)
- Nested routes under AppShell layout
- Lazy-loaded pages for code splitting (AIApp, OnlineExperience, Workbench)
- Redirect from `/` to `/ai-app`

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

## Build Output

- Output directory: `dist/`
- TypeScript compilation happens before Vite bundling
- Production build includes all optimizations
