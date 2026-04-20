# AI 平台前端 UI/UX 风格指南

## 项目概述
这是一个 Vue 3 + TypeScript + Vite + Tailwind CSS 的企业级 AI 平台前端应用，专注于安全生产和隐患治理。设计风格现代、科技感强，采用渐变色和玻璃态设计。

---

## 1. 色彩系统

### 主色板
| 颜色 | 值 | 用途 |
|------|-----|------|
| 主蓝色 | `#00B4FF` / `rgba(0, 180, 255)` | 品牌色、按钮、链接、强调 |
| 辅助紫色 | `#8D4CFF` / `rgba(141, 76, 255)` | 次级强调、深度思考模式 |
| 深蓝灰 | `#0b1220` | 主文本颜色 |
| 浅蓝 | `#f6fbff` | 背景渐变起点 |
| 纯白 | `#ffffff` | 背景渐变中点 |
| 浅蓝白 | `#f1f7ff` | 背景渐变终点 |

### 透明度变量
- `white/10` - 极淡背景
- `white/12` - 淡背景
- `white/15` - 导航栏背景
- `white/20` - 活跃状态背景
- `white/70` - 卡片背景
- `white/80` - 输入框背景
- `sky-200/60` - 边框色
- `sky-200/70` - 卡片边框

### 渐变背景
```css
background:
  radial-gradient(900px 520px at 16% 10%, rgba(0, 180, 255, 0.22), transparent 62%),
  radial-gradient(820px 520px at 82% 18%, rgba(141, 76, 255, 0.16), transparent 60%),
  radial-gradient(760px 520px at 60% 90%, rgba(0, 180, 255, 0.12), transparent 62%),
  linear-gradient(180deg, #f6fbff 0%, #ffffff 45%, #f1f7ff 100%);
```

---

## 2. 字体系统

### 字体栈
```
-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans",
Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"
```

### 基础设置
- 行高：`1.5`
- 字重：`400`（正常）
- 文本渲染：`optimizeLegibility`
- 字体平滑：`-webkit-font-smoothing: antialiased`

### 常用字号和字重
| 用途 | 字号 | 字重 | 示例 |
|------|------|------|------|
| 页面标题 | 16px | 600 | 导航项、卡片标题 |
| 副标题 | 14px | 600 | 卡片副标题 |
| 正文 | 14px | 400 | 描述文本 |
| 小文本 | 12px | 400 | 标签、辅助信息 |
| 超小文本 | 11px | 400 | 版本号、时间戳 |

---

## 3. 圆角系统

| 类名 | 值 | 用途 |
|------|-----|------|
| `rounded-full` | 9999px | 完全圆形（标签、徽章） |
| `rounded-2xl` | 16px | 卡片、大组件 |
| `rounded-xl` | 12px | 按钮、输入框、小组件 |
| `rounded-lg` | 8px | 次级元素 |
| `rounded-md` | 6px | 微小元素 |

---

## 4. 间距系统

### 内边距（Padding）
- 卡片内部：`p-4`（16px）
- 按钮内部：`px-4 py-2`（水平16px，竖直8px）
- 容器内部：`px-6 py-8`（水平24px，竖直32px）

### 外边距（Gap）
- 组件间距：`gap-2`（8px）、`gap-3`（12px）、`gap-4`（16px）
- 大间距：`gap-6`（24px）

### 容器宽度
- 最大宽度：`max-w-[1280px]`（导航）、`max-w-[1440px]`（主容器）
- 水平内边距：`px-6`（24px）

---

## 5. 阴影系统

### 卡片阴影
```css
/* 内阴影 + 外阴影组合 */
shadow-[inset_0_0_0_1px_rgba(0,180,255,0.08)]
shadow-[0_0_0_1px_rgba(0,180,255,0.45),0_16px_40px_rgba(0,35,90,0.14),0_0_28px_rgba(0,180,255,0.28)]
```

### 导航栏阴影
```css
shadow-[0_4px_16px_rgba(0,35,90,0.22)]
```

### 按钮阴影
```css
shadow-[0_10px_24px_rgba(0,35,90,0.12)]
```

### 输入框阴影
```css
shadow-[0_12px_30px_rgba(0,35,90,0.06)]
```

---

## 6. 边框系统

### 边框颜色
- 主边框：`border-sky-200/70`
- 导航边框：`border-white/15`
- 聊天边框：`border-sky-200/60`

### 边框宽度
- 标准：`border`（1px）
- 环形：`ring-1`（1px）

### 环形颜色
- 标准环：`ring-sky-200/70`、`ring-white/20`、`ring-white/25`
- 强调环：`ring-[#00B4FF]/55`、`ring-[#00B4FF]/30`

---

## 7. 动画效果

### 脉冲动画（CTA 按钮）
```css
@keyframes ctaPulse {
  0% { box-shadow: 0 0 0 rgba(0, 180, 255, 0), 0 0 0 rgba(141, 76, 255, 0); transform: translateY(0); }
  50% { box-shadow: 0 0 18px rgba(0, 180, 255, 0.55), 0 0 36px rgba(141, 76, 255, 0.22); transform: translateY(-1px); }
  100% { box-shadow: 0 0 0 rgba(0, 180, 255, 0), 0 0 0 rgba(141, 76, 255, 0); transform: translateY(0); }
}
.cta-pulse { animation: ctaPulse 1.6s ease-in-out infinite; }
```

### 图标摇晃动画
```css
@keyframes iconWiggle {
  0% { transform: rotate(0deg) scale(1); }
  35% { transform: rotate(8deg) scale(1.06); }
  70% { transform: rotate(-6deg) scale(1.04); }
  100% { transform: rotate(0deg) scale(1); }
}
.icon-wiggle { animation: iconWiggle 700ms ease-in-out both; }
```

### 页面进入动画
```css
@keyframes pageEnter {
  0% { opacity: 0; transform: translateY(6px); }
  100% { opacity: 1; transform: translateY(0); }
}
.page-enter { animation: pageEnter 300ms ease-out both; }
```

### 发光效果（链接和按钮）
```css
a, button {
  --glow-shadow: 0 0 0 rgba(0, 180, 255, 0);
}
a:hover, button:hover,
a:focus-visible, button:focus-visible {
  --glow-shadow: 0 0 12px rgba(0, 180, 255, 0.6);
}
```

---

## 8. 组件设计模式

### 导航栏
- 背景：`bg-[linear-gradient(90deg,rgba(0,180,255,0.90),rgba(0,132,255,0.90),rgba(141,76,255,0.86))]`
- 高度：`h-16`（64px）
- 导航项：`rounded-xl px-3 py-2 text-sm text-white/80 hover:bg-white/10`
- 活跃状态：`bg-white/12 text-white ring-1 ring-white/25`

### 卡片
- 边框：`border border-sky-200/70`
- 背景：`bg-white/70`
- 圆角：`rounded-2xl`
- 内边距：`p-4`
- 悬停效果：`hover:-translate-y-2 hover:shadow-[...]`

### 按钮
- 主按钮：`bg-gradient-to-r from-[#0098FF] to-[#006CFF] text-white`
- 次按钮：`bg-white/10 text-white ring-1 ring-white/25`
- 圆角：`rounded-xl`
- 内边距：`px-4 py-2`

### 输入框
- 背景：`bg-white/80`
- 边框：`border border-sky-200/70`
- 圆角：`rounded-2xl`
- 内边距：`px-3 py-2`

### 聊天气泡
- 用户消息：`bg-gradient-to-r from-[#0098FF] to-[#006CFF] text-white`
- AI 消息：`bg-white/75 text-slate-900`
- 深度思考：`bg-white/80 text-slate-900`
- 圆角：`rounded-2xl`
- 内边距：`px-4 py-3`

---

## 9. 网格背景

### Tech Grid 效果
```css
.tech-grid {
  background-image:
    linear-gradient(rgba(0, 180, 255, 0.14) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 180, 255, 0.12) 1px, transparent 1px);
  background-size: 44px 44px;
  mask-image: radial-gradient(closest-side at 50% 12%, rgba(0, 0, 0, 1), transparent 78%);
}
```

---

## 10. 响应式设计

### 断点
- 移动端：`< 768px`（`md:hidden`）
- 平板：`768px - 1024px`
- 桌面：`> 1024px`（`lg:flex`）

### 常用响应式类
- 导航：`hidden lg:flex`（桌面显示）
- 移动导航：`md:hidden`（移动显示）
- 容器：`mx-auto max-w-[1280px] px-6`

---

## 11. 交互状态

### 悬停状态
- 卡片：`hover:-translate-y-2`（上升2px）+ 阴影增强
- 按钮：`hover:brightness-105`（亮度增加）
- 链接：`hover:bg-white/10`（背景变亮）

### 焦点状态
- 轮廓：`outline-2 solid rgba(0, 180, 255, 0.55)`
- 轮廓偏移：`outline-offset-2`

### 活跃状态
- 导航项：`bg-white/12 text-white ring-1 ring-white/25`
- 标签：`bg-white/20 text-white ring-white/30`

---

## 12. 特殊效果

### 玻璃态（Glassmorphism）
- 背景：`bg-white/70` 或 `bg-white/80`
- 模糊：`backdrop-blur`
- 边框：`border border-sky-200/70`

### 渐变文本
- 按钮：`bg-gradient-to-r from-[#0098FF] to-[#006CFF]`

### 文本截断
- 单行：`truncate`
- 两行：`.text-clamp-2`
- 三行：`.text-clamp-3`

---

## 13. 深色模式支持

- Tailwind 配置：`darkMode: "class"`
- 支持通过 `dark:` 前缀实现深色模式样式

---

## 14. 国际化

- 支持中文（zh-CN）和英文（en-US）
- 使用 Vue i18n 管理多语言

---

## 15. 设计建议

### 同色系 App UI/UX 方案

#### 1. 色彩应用
- **主色**：保持 `#00B4FF` 作为品牌色，用于 CTA、链接、强调
- **辅助色**：`#8D4CFF` 用于次级操作、特殊状态
- **背景**：使用浅蓝色系渐变，保持科技感
- **文本**：深蓝灰 `#0b1220` 确保可读性

#### 2. 组件一致性
- 所有卡片使用 `rounded-2xl` + `border-sky-200/70` + `bg-white/70`
- 所有按钮使用渐变背景 + 圆角 + 阴影
- 保持间距系统一致（gap、padding）

#### 3. 交互设计
- 悬停效果：上升 + 阴影增强
- 加载状态：使用脉冲动画
- 过渡动画：300ms ease-out

#### 4. 响应式策略
- 移动优先设计
- 使用 Tailwind 响应式前缀
- 导航在移动端折叠

#### 5. 可访问性
- 焦点状态清晰可见
- 颜色对比度满足 WCAG AA 标准
- 支持键盘导航

---

## 16. 技术栈

- **框架**：Vue 3 + TypeScript
- **构建**：Vite
- **样式**：Tailwind CSS v3
- **图标**：Lucide Vue Next
- **状态管理**：Pinia
- **路由**：Vue Router
- **国际化**：Vue i18n

---

## 17. 文件结构参考

```
src/
├── components/
│   ├── nav/              # 导航组件
│   ├── abilities/        # 能力相关组件
│   ├── aiApp/           # AI 聊天组件
│   ├── layout/          # 布局组件
│   ├── auth/            # 认证组件
│   └── ...
├── pages/               # 页面级组件
├── stores/              # Pinia 状态管理
├── index.css            # 全局样式
└── ...
```

---

## 18. 快速开始

```bash
# 开发
npm run dev

# 构建
npm run build

# 预览
npm run preview
```

---

## 19. 常用 Tailwind 类速查

| 功能 | 类名 |
|------|------|
| 主色按钮 | `bg-gradient-to-r from-[#0098FF] to-[#006CFF]` |
| 卡片 | `rounded-2xl border border-sky-200/70 bg-white/70 p-4` |
| 导航项 | `rounded-xl px-3 py-2 text-sm text-white/80` |
| 发光效果 | `shadow-[0_0_12px_rgba(0,180,255,0.6)]` |
| 页面进入 | `page-enter` |
| 脉冲动画 | `cta-pulse` |
| 网格背景 | `tech-grid` |

---

**最后更新**：2026-03-16
