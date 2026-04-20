# AI 应用页面整改报告

## 概述

本报告基于对当前 `/ai-app` 实现的检查，结合用户反馈，列出需要改进的问题和具体整改方案。

---

## 问题清单

### 问题 1：缺少欢迎页面（Welcome Screen）

**现状：**
- 当前实现在没有会话时，仅显示简单的空状态提示："还没有消息，开始你的第一条对话吧。"
- 缺少类似 Gemini、Claude 等 AI 应用的欢迎体验
- 没有推荐问题（Starter Prompts）引导用户快速开始

**问题影响：**
- 用户首次使用时缺乏引导，不知道可以问什么
- 缺少产品特色展示和使用场景说明
- 用户体验不够友好，降低了使用意愿

**整改方案：**

创建欢迎页面组件 `WelcomeScreen.vue`，包含以下元素：

1. **欢迎标题和副标题**
   - 主标题："欢迎使用 AI 对话应用"
   - 副标题：简短介绍应用特色（如"围绕安全生产场景的智能对话助手"）

2. **推荐问题卡片（Starter Prompts）**
   - 显示 3-6 个预设问题卡片
   - 每个卡片包含：
     - 图标（使用 Lucide 图标）
     - 问题标题
     - 简短描述
   - 点击卡片自动填充到输入框或直接发送

   示例推荐问题：
   ```
   - "如何进行安全生产风险评估？"
   - "常见的安全隐患有哪些？"
   - "制定应急预案的关键步骤"
   - "安全培训的最佳实践"
   ```

3. **功能亮点展示**
   - 列出 2-3 个核心功能特点
   - 使用图标 + 文字的形式
   - 例如："多会话管理"、"实时流式回复"、"本地数据存储"

4. **视觉设计**
   - 遵循现有设计系统（蓝色渐变、玻璃态效果）
   - 卡片使用 hover 效果和过渡动画
   - 响应式布局，移动端自适应

**实现位置：**
- 文件：`/src/components/aiApp/WelcomeScreen.vue`
- 集成：在 `ChatInterface.vue` 中，当 `conversation` 为 null 或 `conversation.messages.length === 0` 时显示欢迎页面

**代码结构示例：**
```vue
<template>
  <div class="welcome-container">
    <div class="welcome-header">
      <h1>欢迎使用 AI 对话应用</h1>
      <p>围绕安全生产场景的智能对话助手</p>
    </div>

    <div class="starter-prompts">
      <button
        v-for="prompt in starterPrompts"
        :key="prompt.id"
        @click="$emit('select-prompt', prompt.text)"
        class="prompt-card"
      >
        <component :is="prompt.icon" class="icon" />
        <div class="prompt-title">{{ prompt.title }}</div>
        <div class="prompt-desc">{{ prompt.description }}</div>
      </button>
    </div>

    <div class="features">
      <div v-for="feature in features" :key="feature.id" class="feature-item">
        <component :is="feature.icon" class="icon" />
        <span>{{ feature.text }}</span>
      </div>
    </div>
  </div>
</template>
```

---

### 问题 2：缺少"深度思考"功能选项

**现状：**
- 当前实现仅支持普通对话模式
- 没有提供"深度思考"（Deep Thinking）或类似的高级推理模式
- 用户无法选择不同的 AI 响应模式

**问题影响：**
- 对于复杂问题，用户无法获得更深入的分析
- 缺少差异化功能，降低产品竞争力
- 无法满足不同场景下的使用需求（快速回答 vs 深度分析）

**整改方案：**

在输入区域添加"深度思考"开关或模式选择器：

1. **UI 设计方案 A：切换开关（推荐）**
   - 在输入框上方或旁边添加一个切换开关
   - 标签："深度思考模式"
   - 使用 Toggle Switch 组件
   - 开启时显示不同的视觉状态（如紫色渐变）

2. **UI 设计方案 B：下拉选择器**
   - 提供多种模式选择：
     - "标准模式"（默认）
     - "深度思考模式"
     - "快速回复模式"（可选）
   - 使用下拉菜单或分段控制器

3. **功能实现**
   - 在 `aiApp.ts` store 中添加 `thinkingMode` 状态
   - 发送消息时，根据模式传递不同的参数到 API
   - API 调用示例：
     ```typescript
     await streamChatAnswer({
       question: text,
       kbIds: [],
       mode: thinkingMode ? 'deep' : 'standard', // 新增参数
       signal: ac.signal,
       onToken: (token) => appendToLastAssistant(conv, token),
     })
     ```

4. **视觉反馈**
   - 深度思考模式下，显示特殊的加载动画
   - 消息气泡使用不同的颜色标识（如紫色边框）
   - 显示"AI 正在深度思考中..."的状态提示

5. **用户提示**
   - 首次使用时，显示 Tooltip 说明深度思考模式的作用
   - 例如："深度思考模式会花费更多时间，但提供更详细的分析和推理过程"

**实现位置：**
- Store 修改：`/src/stores/aiApp.ts` - 添加 `thinkingMode` 状态
- UI 修改：`/src/components/aiApp/ChatInterface.vue` - 在输入区域添加模式切换器
- API 修改：`/src/api/chatStream.ts` - 支持 `mode` 参数（如果后端支持）

**代码结构示例：**
```vue
<!-- ChatInterface.vue -->
<div class="input-controls">
  <div class="mode-toggle">
    <label class="toggle-label">
      <input
        type="checkbox"
        v-model="deepThinkingEnabled"
        class="toggle-input"
      />
      <span class="toggle-switch"></span>
      <span class="toggle-text">深度思考模式</span>
    </label>
  </div>

  <div class="input-area">
    <textarea v-model="draft" placeholder="输入问题..." />
    <button @click="handleSend">发送</button>
  </div>
</div>
```

```typescript
// aiApp.ts store 添加
const deepThinkingEnabled = ref(false)

async function sendMessage(conversationId: string, content: string) {
  // ... existing code ...

  await streamChatAnswer({
    question: text,
    kbIds: [],
    mode: deepThinkingEnabled.value ? 'deep' : 'standard',
    signal: ac.signal,
    onToken: (token) => appendToLastAssistant(conv, token),
  })
}
```

---

## 其他发现的问题

### 问题 3：移动端体验可优化

**现状：**
- 抽屉式侧边栏已实现，但可以进一步优化
- 输入框在移动端可能被键盘遮挡

**建议改进：**
- 添加键盘弹出时的自动滚动
- 优化抽屉动画效果（添加滑入/滑出过渡）
- 考虑添加手势支持（滑动关闭抽屉）

### 问题 4：缺少错误处理提示

**现状：**
- 错误信息直接附加到消息内容中：`[错误] ${msg}`
- 缺少独立的错误提示 UI

**建议改进：**
- 使用 Toast 通知显示错误
- 添加重试按钮
- 区分不同类型的错误（网络错误、超时、服务器错误）

### 问题 5：缺少会话搜索功能

**现状：**
- 会话列表仅按时间排序
- 会话数量增多后难以查找

**建议改进：**
- 在会话列表顶部添加搜索框
- 支持按标题搜索会话
- 可选：添加会话分组或标签功能

---

## 优先级建议

| 优先级 | 问题 | 预计工作量 | 用户价值 |
|--------|------|-----------|---------|
| P0（必须） | 问题 1：欢迎页面 | 4-6 小时 | 高 |
| P0（必须） | 问题 2：深度思考功能 | 3-4 小时 | 高 |
| P1（重要） | 问题 4：错误处理优化 | 2-3 小时 | 中 |
| P2（可选） | 问题 3：移动端优化 | 2-3 小时 | 中 |
| P2（可选） | 问题 5：会话搜索 | 3-4 小时 | 中 |

---

## 实施建议

1. **第一阶段（核心功能）**
   - 实现欢迎页面和推荐问题
   - 添加深度思考模式切换

2. **第二阶段（体验优化）**
   - 优化错误处理和提示
   - 改进移动端交互

3. **第三阶段（增强功能）**
   - 添加会话搜索
   - 其他高级功能

---

## 设计参考

**欢迎页面参考：**
- Claude.ai 的欢迎界面（简洁、推荐问题卡片）
- Google Gemini 的首页（大标题 + 功能介绍）
- ChatGPT 的启动页面（示例对话）

**深度思考模式参考：**
- Claude 的 "Extended Thinking" 模式
- ChatGPT 的 "o1" 推理模型切换
- Perplexity 的 "Pro Search" 模式

---

## 附录：现有代码分析

**当前文件结构：**
```
/src/pages/AIApp.vue              - 主页面（布局容器）
/src/stores/aiApp.ts              - 状态管理
/src/components/aiApp/
  ├── ConversationSidebar.vue     - 会话列表侧边栏
  └── ChatInterface.vue           - 对话界面
```

**需要新增的文件：**
```
/src/components/aiApp/
  ├── WelcomeScreen.vue           - 欢迎页面组件
  ├── StarterPromptCard.vue       - 推荐问题卡片（可选，可内联）
  └── ThinkingModeToggle.vue      - 深度思考模式切换器（可选，可内联）
```

**需要修改的文件：**
```
/src/stores/aiApp.ts              - 添加 deepThinkingEnabled 状态
/src/components/aiApp/ChatInterface.vue - 集成欢迎页面和模式切换器
/src/api/chatStream.ts            - 支持 mode 参数（如果需要）
```

---

## 总结

当前实现的核心功能（多会话管理、流式对话、本地存储）已经完成，但缺少两个关键的用户体验要素：

1. **欢迎页面**：帮助新用户快速上手，提供使用引导
2. **深度思考模式**：提供差异化功能，满足复杂场景需求

建议优先实施这两个改进，以显著提升产品的用户体验和竞争力。

---

**报告生成时间：** 2026-03-03
**检查范围：** `/ai-app` 页面及相关组件
**参考标准：** Claude、Gemini、ChatGPT 等主流 AI 应用
