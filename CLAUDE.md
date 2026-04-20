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
  - `layout/` - AppShell with TopNav and footer
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
  - Root layout: `AppShell` (TopNav + main content + footer)
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

## Build Output

- Output directory: `dist/`
- TypeScript compilation happens before Vite bundling
- Production build includes all optimizations
