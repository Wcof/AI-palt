import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { streamChatAnswer } from '@/api/chatStream'
import { useNL2SQLStore } from '@/stores/nl2sql'
import { useReportStore } from '@/stores/report'
import type { DomainTerm, JdbcDataSource, ReportConfig, ReportTemplate } from '@/types/aiPlatform'

export type ChatRole = 'user' | 'assistant'
export type AgentType = 'general' | 'nl2sql' | 'report' | 'hazard' | 'rag' | 'meeting' | 'document'
export type ReportRunStatus = 'idle' | 'generating' | 'done' | 'failed'

export type ChatMessage = {
  id: string
  role: ChatRole
  content: string
  createdAt: number
  image?: string
}

export type AgentOption = {
  id: AgentType
  name: string
  desc: string
  badge: string
}

export type ReportDocument = {
  id: string
  title: string
  format: 'markdown' | 'doc'
  content: string
  status: ReportRunStatus
  templateId?: string
  createdAt: number
  updatedAt: number
}

export type Conversation = {
  id: string
  title: string
  createdAt: number
  updatedAt: number
  agentType?: AgentType
  reportTemplateId?: string
  reportMarkdown?: string
  reportStatus?: ReportRunStatus
  reportError?: string
  reportPanelOpen?: boolean
  reportDocuments?: ReportDocument[]
  activeReportDocumentId?: string
  messages: ChatMessage[]
}

export const AI_AGENT_OPTIONS: AgentOption[] = [
  { id: 'general', name: '通用助手', desc: '安全生产问答、方案梳理、材料润色', badge: 'Chat' },
  { id: 'nl2sql', name: '智能问数', desc: '结合 Case、术语和 JDBC 单数据源进行智能问数', badge: 'SQL' },
  { id: 'report', name: '文档助手', desc: '生成报告、总结和方案文档，支持 Markdown / Doc 导出', badge: 'Doc' },
  { id: 'meeting', name: '会议纪要', desc: '实时录音转写、摘要、纪要、待办和原文归档', badge: 'Minutes' },
  { id: 'document', name: '文档编写', desc: '根据问题生成文档摘要、正文预览和文档块', badge: 'Write' },
  { id: 'hazard', name: '隐患识图', desc: '图片隐患识别与整改建议', badge: 'Vision' },
  { id: 'rag', name: '知识库问答', desc: '从知识库中检索依据并生成可解释回答', badge: 'RAG' },
]

function makeId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

function generateTitle(message: string, agentType: AgentType = 'general') {
  const trimmed = message.trim()
  const prefix = agentType === 'report'
    ? '报告：'
    : agentType === 'document'
      ? '文档：'
      : agentType === 'meeting'
        ? '会议：'
        : agentType === 'nl2sql'
          ? '问数：'
          : ''
  const title = trimmed.length > 26 ? `${trimmed.slice(0, 26)}...` : (trimmed || '新对话')
  return `${prefix}${title}`
}

function isSplitAgent(agentType: AgentType) {
  return agentType === 'report' || agentType === 'document' || agentType === 'meeting'
}

function workspaceTitle(agentType: AgentType) {
  const map: Record<AgentType, string> = {
    general: '新对话',
    nl2sql: '新问数会话',
    report: '新报告生成',
    meeting: '新会议纪要',
    document: '新文档编写',
    hazard: '新隐患识图',
    rag: '新知识问答',
  }
  return map[agentType]
}

function workspaceInitialMarkdown(agentType: AgentType) {
  const map: Partial<Record<AgentType, string>> = {
    report: '# 报告文档\n\n输入报告主题并发送后，系统会创建 Markdown 文档并打开右侧预览。',
    meeting: '# 会议纪要\n\n点击左侧“开始录音”或输入会议主题后，右侧将展示摘要、原文、纪要和待办事项。',
    document: '# 文档预览\n\n在左侧输入文档需求后，右侧将生成摘要、正文预览和文档块。',
  }
  return map[agentType]
}

function makeReportDraft(input: string, options: { template?: ReportTemplate | null; configs?: ReportConfig[]; terms?: DomainTerm[]; jdbc?: JdbcDataSource } = {}) {
  const title = input ? input.replace(/\s+/g, ' ').slice(0, 32) : '安全生产智能分析报告'
  const terms = options.terms ?? []
  const matchedTermLine = terms.length
    ? terms.slice(0, 3).map(item => item.term).join('、')
    : '现场巡检、隐患闭环、风险分级'

  return [
    `# ${title}`,
    '',
    '## 一、报告摘要',
    '',
    `本报告围绕“${title}”展开，结合安全生产管理要求，对当前风险态势、关键问题和整改动作进行结构化梳理，便于管理人员快速判断重点与后续推进方向。`,
    '',
    '## 二、关键发现',
    '',
    '- 高风险事项需要优先形成闭环，避免隐患长期挂起。',
    '- 巡检、整改、复核三个环节需要保持记录一致，便于后续追溯。',
    `- 本次分析重点关注：${matchedTermLine}。`,
    '',
    '## 三、风险分析',
    '',
    '当前风险主要集中在现场执行不规范、巡检反馈不及时、整改复核链路不完整三类问题。建议将风险等级、责任人、整改期限和复核状态作为核心管理字段，形成可追踪的闭环。',
    '',
    '## 四、整改建议',
    '',
    '1. 对高风险隐患建立优先处理队列，明确负责人和截止时间。',
    '2. 对重复出现的问题建立专项治理清单，避免同类问题反复发生。',
    '3. 对整改完成事项补齐复核记录，确保现场结果和系统数据一致。',
    '',
    '## 五、后续动作',
    '',
    '- 完成重点隐患复核，并保留整改前后对比材料。',
    '- 定期汇总巡检结果，形成趋势分析和专题报告。',
    '- 将典型问题沉淀为知识库和问数案例，提升后续生成质量。',
  ].join('\n')
}

function makeDocumentDraft(input: string) {
  const title = input ? input.replace(/\s+/g, ' ').slice(0, 32) : '安全生产方案文档'
  return [
    `# ${title}`,
    '',
    '> 文档定位：围绕输入主题生成可直接复制、二次编辑和交付的结构化文档。',
    '',
    '## 一、摘要',
    '',
    `本文档围绕“${title}”展开，先明确背景与目标，再拆解核心内容、实施路径和后续动作，帮助用户从问题描述快速沉淀为可交付材料。`,
    '',
    '## 二、背景与目标',
    '',
    '- 背景：当前业务材料需要从零散想法整理为完整、清晰、可执行的文档。',
    '- 目标：形成一份具备标题、摘要、正文结构、行动项和后续计划的文档草稿。',
    '- 边界：本稿优先解决内容结构与表达，不替代最终业务审核。',
    '',
    '## 三、正文结构',
    '',
    '### 3.1 核心问题',
    '',
    '当前问题不是缺少内容，而是缺少可复用的文档组织方式。需要将用户输入转换为“背景—目标—方案—计划—结论”的稳定结构。',
    '',
    '### 3.2 方案说明',
    '',
    '系统根据输入主题生成文档摘要、段落标题和正文内容，并在右侧形成文档预览。用户可以继续在左侧补充修改要求，右侧文档随会话持续更新。',
    '',
    '### 3.3 交付内容',
    '',
    '- 文档标题与格式标识。',
    '- 摘要与正文预览。',
    '- 可复制、可导出的 Markdown / Doc 内容。',
    '- 会话中的文档块记录，便于点击后在右侧查看。',
    '',
    '## 四、后续动作',
    '',
    '1. 根据业务场景补充数据、案例或约束条件。',
    '2. 对重点段落进行二次润色，统一口径与表述。',
    '3. 完成评审后导出文档并归档。',
  ].join('\n')
}

function makeMeetingMinutesDraft(input: string) {
  const topic = input ? input.replace(/\s+/g, ' ').slice(0, 28) : '项目同步会'
  return [
    `# ${topic}会议纪要`,
    '',
    '## 一、会议摘要',
    '',
    `本次会议围绕“${topic}”进行讨论，重点明确了当前进展、关键问题、责任分工和后续推进节奏。`,
    '',
    '## 二、原文转写摘录',
    '',
    '- 00:00 主持人：我们先对齐今天会议目标，重点看当前功能进展和后续排期。',
    '- 00:42 产品：当前主要问题是入口分散、工作台形态不统一，需要通过 Agent 菜单选择后进入对应能力。',
    '- 01:18 技术：会议纪要和文档编写建议做成左右分屏，左侧承接输入或转写，右侧展示结构化结果。',
    '- 02:06 产品：纪要需要包含摘要、原文、关键结论、待办事项，便于会后直接跟进。',
    '',
    '## 三、关键结论',
    '',
    '- Agent 选择必须由菜单触发工作台切换，不能依赖用户输入文本自动猜测。',
    '- 会议纪要采用“实时转写 + 结构化纪要”双栏布局。',
    '- 文档编写采用“左侧提问 + 右侧文档预览 / 文档块”的双栏布局。',
    '',
    '## 四、待办事项',
    '',
    '| 事项 | 负责人 | 截止时间 | 状态 |',
    '| --- | --- | --- | --- |',
    '| 补齐会议纪要 Agent 入口 | 产品 / 前端 | 本轮迭代 | 进行中 |',
    '| 设计会议纪要右侧结果面板 | 前端 | 本轮迭代 | 进行中 |',
    '| 文档编写支持文档块与预览 | 前端 | 本轮迭代 | 进行中 |',
    '',
    '## 五、风险与备注',
    '',
    '- 当前为前端模拟转写与纪要生成，真实录音采集需要后续接入浏览器麦克风权限、ASR 服务和会议音频流。',
  ].join('\n')
}

export const useAIAppStore = defineStore('aiApp', () => {
  const conversations = ref<Conversation[]>([])
  const activeConversationId = ref<string | null>(null)
  const streamingConversationId = ref<string | null>(null)
  const error = ref<string | null>(null)
  const thinkingMode = ref(true)
  const selectedAgentType = ref<AgentType>('general')
  const agentFocused = ref(false)
  const lastSent = ref<{ conversationId: string; type: 'text' | 'image'; content?: string; image?: string } | null>(null)
  let streamAbort: AbortController | null = null

  const sortedConversations = computed(() => [...conversations.value].sort((a, b) => (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt)))
  const activeConversation = computed(() => conversations.value.find(c => c.id === activeConversationId.value) ?? null)

  function isDraftConversation(conv: Conversation) {
    return conv.messages.length === 0
  }

  function resetDraftConversation(conv: Conversation, agentType: AgentType, focused: boolean) {
    const now = Date.now()
    const reportStore = useReportStore()
    const template = agentType === 'report' ? reportStore.defaultTemplate : null

    conv.title = workspaceTitle(agentType)
    conv.updatedAt = now
    conv.agentType = agentType
    conv.reportTemplateId = agentType === 'report' ? template?.id : undefined
    conv.reportStatus = isSplitAgent(agentType) ? 'idle' : undefined
    conv.reportMarkdown = workspaceInitialMarkdown(agentType)
    conv.reportError = undefined
    conv.reportPanelOpen = isSplitAgent(agentType)
    conv.reportDocuments = isSplitAgent(agentType) ? [] : undefined
    conv.activeReportDocumentId = undefined
    conv.messages = []
    selectedAgentType.value = agentType
    agentFocused.value = focused
  }

  function pruneDraftConversations(keepId: string) {
    for (let i = conversations.value.length - 1; i >= 0; i -= 1) {
      const conv = conversations.value[i]
      if (conv.id !== keepId && isDraftConversation(conv)) conversations.value.splice(i, 1)
    }
  }

  function createConversation(agentType: AgentType = selectedAgentType.value, focused = false) {
    const activeDraft = conversations.value.find(c => c.id === activeConversationId.value && isDraftConversation(c))
    const latestDraft = sortedConversations.value.find(isDraftConversation)
    const reusableDraft = activeDraft ?? latestDraft

    if (reusableDraft) {
      resetDraftConversation(reusableDraft, agentType, focused)
      conversations.value = [reusableDraft, ...conversations.value.filter(c => c.id !== reusableDraft.id)]
      activeConversationId.value = reusableDraft.id
      pruneDraftConversations(reusableDraft.id)
      return reusableDraft.id
    }

    const now = Date.now()
    const conv: Conversation = {
      id: makeId('conv'),
      title: workspaceTitle(agentType),
      createdAt: now,
      updatedAt: now,
      agentType,
      messages: [],
    }
    resetDraftConversation(conv, agentType, focused)
    conversations.value.unshift(conv)
    activeConversationId.value = conv.id
    pruneDraftConversations(conv.id)
    return conv.id
  }

  function deleteConversation(id: string) {
    const idx = conversations.value.findIndex(c => c.id === id)
    if (idx === -1) return
    conversations.value.splice(idx, 1)
    if (activeConversationId.value === id) {
      activeConversationId.value = sortedConversations.value[0]?.id ?? null
      selectedAgentType.value = activeConversation.value?.agentType ?? 'general'
    }
  }

  function switchConversation(id: string) {
    activeConversationId.value = id
    const conv = conversations.value.find(c => c.id === id)
    if (conv?.agentType) {
      selectedAgentType.value = conv.agentType
      agentFocused.value = true
    }
  }

  function setActiveAgent(agentType: AgentType) {
    selectedAgentType.value = agentType
    agentFocused.value = true
    const reportStore = useReportStore()
    if (!activeConversation.value || activeConversation.value.messages.length > 0) {
      createConversation(agentType, true)
      return
    }
    const template = agentType === 'report' ? reportStore.defaultTemplate : null
    activeConversation.value.agentType = agentType
    activeConversation.value.title = workspaceTitle(agentType)
    activeConversation.value.reportTemplateId = agentType === 'report' ? template?.id : undefined
    activeConversation.value.reportStatus = isSplitAgent(agentType) ? 'idle' : undefined
    activeConversation.value.reportMarkdown = workspaceInitialMarkdown(agentType)
    activeConversation.value.reportPanelOpen = isSplitAgent(agentType)
    activeConversation.value.reportDocuments = isSplitAgent(agentType) ? [] : undefined
    activeConversation.value.activeReportDocumentId = undefined
    activeConversation.value.updatedAt = Date.now()
  }

  function clearAgentFocus() {
    agentFocused.value = false
    selectedAgentType.value = 'general'
    if (activeConversation.value && activeConversation.value.messages.length === 0) {
      activeConversation.value.agentType = 'general'
      activeConversation.value.title = '新对话'
      activeConversation.value.reportTemplateId = undefined
      activeConversation.value.reportStatus = undefined
      activeConversation.value.reportMarkdown = undefined
      activeConversation.value.reportPanelOpen = false
      activeConversation.value.reportDocuments = undefined
      activeConversation.value.activeReportDocumentId = undefined
      activeConversation.value.updatedAt = Date.now()
    }
  }

  function setReportTemplate(conversationId: string, templateId: string) {
    const conv = conversations.value.find(c => c.id === conversationId)
    if (!conv) return
    conv.reportTemplateId = templateId
    conv.reportMarkdown = conv.reportPanelOpen
      ? '# 报告文档\n\n配置已更新，重新发送报告需求后生成新的正文。'
      : '# 报告文档\n\n输入报告需求并发送后会打开右侧文档预览。'
    conv.reportStatus = conv.reportPanelOpen ? 'idle' : conv.reportStatus
    conv.updatedAt = Date.now()
  }

  function appendToLastAssistant(conv: Conversation, token: string) {
    const last = conv.messages[conv.messages.length - 1]
    if (last?.role === 'assistant') last.content += token
  }

  function ensureReportDocument(conv: Conversation, input: string, template?: ReportTemplate | null) {
    const now = Date.now()
    if (!conv.reportDocuments) conv.reportDocuments = []
    const titleSource = input.replace(/[\r\n]+/g, ' ').trim() || (conv.agentType === 'meeting' ? '会议纪要' : conv.agentType === 'document' ? '文档草稿' : '安全生产智能报告')
    const doc: ReportDocument = {
      id: makeId('doc'),
      title: titleSource.length > 24 ? `${titleSource.slice(0, 24)}...` : titleSource,
      format: 'markdown',
      content: '',
      status: 'generating',
      templateId: template?.id || conv.reportTemplateId,
      createdAt: now,
      updatedAt: now,
    }
    conv.reportDocuments.unshift(doc)
    conv.activeReportDocumentId = doc.id
    return doc
  }

  function updateActiveReportDocument(conv: Conversation, patch: Partial<ReportDocument>) {
    const doc = conv.reportDocuments?.find(item => item.id === conv.activeReportDocumentId)
    if (!doc) return
    Object.assign(doc, patch, { updatedAt: Date.now() })
  }

  function setActiveReportDocument(conversationId: string, documentId: string) {
    const conv = conversations.value.find(c => c.id === conversationId)
    const doc = conv?.reportDocuments?.find(item => item.id === documentId)
    if (!conv || !doc) return
    conv.activeReportDocumentId = documentId
    conv.reportMarkdown = doc.content || conv.reportMarkdown
    conv.reportPanelOpen = true
    conv.updatedAt = Date.now()
  }

  function openReportPanel(conversationId: string) {
    const conv = conversations.value.find(c => c.id === conversationId)
    if (!conv || !isSplitAgent(conv.agentType || 'general')) return
    conv.reportPanelOpen = true
    conv.updatedAt = Date.now()
  }

  function closeReportPanel(conversationId: string) {
    const conv = conversations.value.find(c => c.id === conversationId)
    if (!conv) return
    conv.reportPanelOpen = false
    conv.updatedAt = Date.now()
  }

  async function sleep(ms: number) {
    await new Promise(resolve => setTimeout(resolve, ms))
  }

  async function appendStream(conv: Conversation, text: string, delay = 14) {
    for (const ch of text) {
      appendToLastAssistant(conv, ch)
      await sleep(delay)
    }
  }

  async function appendThinkingPrelude(conv: Conversation, agentType: AgentType, input: string) {
    const labelMap: Record<AgentType, string> = {
      general: '通用助手',
      nl2sql: '智能问数',
      report: '文档助手',
      meeting: '会议纪要',
      document: '文档编写',
      hazard: '隐患识图',
      rag: '知识库问答',
    }
    const topic = input ? input.replace(/[\r\n]+/g, ' ').slice(0, 42) : '当前问题'
    const steps = [
      `思考过程 1/3：识别当前请求属于「${labelMap[agentType]}」场景，并锁定用户问题：${topic}。`,
      '思考过程 2/3：结合当前系统配置、已选 Agent 能力边界和本期 P0 范围，整理可执行回答路径。',
      '思考过程 3/3：输出结果前先做范围兜底，避免把本期不做项误写成已完成能力。',
      '',
    ].join('\n')
    await appendStream(conv, steps, 8)
  }

  async function streamReport(conv: Conversation, input: string) {
    const reportStore = useReportStore()
    const nl2sqlStore = useNL2SQLStore()
    const template = reportStore.findTemplate(conv.reportTemplateId)
    if (!conv.reportTemplateId && template?.id) conv.reportTemplateId = template.id
    conv.reportPanelOpen = true
    conv.reportStatus = 'generating'
    conv.reportError = ''
    conv.reportMarkdown = ''
    ensureReportDocument(conv, input, template)
    const report = makeReportDraft(input, {
      template,
      configs: reportStore.enabledConfigs,
      terms: nl2sqlStore.matchTerms(input),
      jdbc: nl2sqlStore.jdbc,
    })
    for (const line of report.split('\n')) {
      conv.reportMarkdown = `${conv.reportMarkdown || ''}${line}\n`
      updateActiveReportDocument(conv, { content: conv.reportMarkdown || '', status: 'generating' })
      await sleep(35)
    }
    conv.reportStatus = 'done'
    updateActiveReportDocument(conv, { content: conv.reportMarkdown || '', status: 'done' })
  }

  async function streamDocument(conv: Conversation, input: string) {
    conv.reportPanelOpen = true
    conv.reportStatus = 'generating'
    conv.reportError = ''
    conv.reportMarkdown = ''
    ensureReportDocument(conv, input || '文档编写', null)
    const draft = makeDocumentDraft(input)
    for (const line of draft.split('\n')) {
      conv.reportMarkdown = `${conv.reportMarkdown || ''}${line}\n`
      updateActiveReportDocument(conv, { content: conv.reportMarkdown || '', status: 'generating', format: 'markdown' })
      await sleep(30)
    }
    conv.reportStatus = 'done'
    updateActiveReportDocument(conv, { content: conv.reportMarkdown || '', status: 'done', format: 'markdown' })
  }

  async function streamMeetingMinutes(conv: Conversation, input: string) {
    conv.reportPanelOpen = true
    conv.reportStatus = 'generating'
    conv.reportError = ''
    conv.reportMarkdown = ''
    ensureReportDocument(conv, input || '会议纪要', null)
    const draft = makeMeetingMinutesDraft(input)
    for (const line of draft.split('\n')) {
      conv.reportMarkdown = `${conv.reportMarkdown || ''}${line}\n`
      updateActiveReportDocument(conv, { content: conv.reportMarkdown || '', status: 'generating', format: 'markdown' })
      await sleep(32)
    }
    conv.reportStatus = 'done'
    updateActiveReportDocument(conv, { content: conv.reportMarkdown || '', status: 'done', format: 'markdown' })
  }

  async function sendMessage(conversationId: string, content: string) {
    const conv = conversations.value.find(c => c.id === conversationId)
    if (!conv) return
    const text = content.trim()
    if (!text) return

    const agentType = conv.agentType ?? selectedAgentType.value
    error.value = null
    lastSent.value = { conversationId, type: 'text', content: text }

    const userMsg: ChatMessage = { id: makeId('user'), role: 'user', content: text, createdAt: Date.now() }
    conv.messages.push(userMsg)
    if (conv.messages.length === 1) conv.title = generateTitle(text, agentType)

    const assistantMsg: ChatMessage = { id: makeId('assistant'), role: 'assistant', content: '', createdAt: Date.now() }
    conv.messages.push(assistantMsg)
    conv.updatedAt = Date.now()

    const ac = new AbortController()
    streamAbort?.abort()
    streamAbort = ac
    streamingConversationId.value = conversationId

    try {
      if (agentType === 'report') {
        conv.reportPanelOpen = true
        if (thinkingMode.value) await appendThinkingPrelude(conv, agentType, text)
        await appendStream(conv, '已开始生成报告。右侧会打开文档预览，你可以查看正文、复制全文或导出为 Markdown / Doc。\n', 8)
        await streamReport(conv, text)
        await appendStream(conv, '\n报告已生成。你可以继续补充修改要求，或在右侧复制 / 导出当前报告。', 8)
        return
      }

      if (agentType === 'document') {
        conv.reportPanelOpen = true
        if (thinkingMode.value) await appendThinkingPrelude(conv, agentType, text)
        await appendStream(conv, '已进入文档编写工作台。右侧将生成文档块和正文预览，左侧会保留文档卡片，便于切换不同草稿。\n', 8)
        await streamDocument(conv, text)
        await appendStream(conv, '\n文档草稿已生成。左侧文档卡片与右侧预览保持联动，支持切换查看、复制与导出。', 8)
        return
      }

      if (agentType === 'meeting') {
        conv.reportPanelOpen = true
        await appendStream(conv, '会议纪要工作台已启动。左侧承接实时转写 / 会议输入，右侧同步生成摘要、纪要、待办和原文。\n', 8)
        await appendStream(conv, '\n实时转写模拟：\n00:00 已开始录音。\n00:42 正在识别发言人和会议主题。\n01:18 正在提取关键结论与待办事项。\n', 8)
        await streamMeetingMinutes(conv, text)
        await appendStream(conv, '\n会议纪要已生成。你可以继续补充原文，右侧将持续更新纪要。', 8)
        return
      }

      if (agentType === 'nl2sql') {
        const nl2sqlStore = useNL2SQLStore()
        if (thinkingMode.value) await appendThinkingPrelude(conv, agentType, text)
        const matchedCase = nl2sqlStore.matchCase(text)
        const matchedTerms = nl2sqlStore.matchTerms(text)
        const jdbc = nl2sqlStore.jdbc
        const termText = matchedTerms.length
          ? matchedTerms.map(item => `- ${item.term}：${item.explanation}；别名：${item.aliases || '无'}`).join('\n')
          : '- 未命中特定术语，按通用字段口径处理。'
        await appendStream(conv, [
          '已进入 NL2SQL 增强链路，并读取系统设置中的案例、专有名词和 JDBC 单数据源配置。',
          '',
          `当前数据源：${jdbc.name || '默认数据源'}｜${jdbc.dbType}｜${jdbc.host}:${jdbc.port}/${jdbc.dbName}｜状态：${jdbc.status}`,
          '',
          matchedCase ? `命中案例：${matchedCase.question}` : '命中案例：暂无完全匹配，进入通用问数规则。',
          matchedCase ? `案例口径：${matchedCase.answer}` : '案例口径：根据问题意图生成单数据源 SQL。',
          '',
          '命中的专有名词：',
          termText,
          '',
          '示例 SQL：',
          '```sql',
          'SELECT risk_level, COUNT(*) AS total',
          'FROM hidden_risk_record',
          "WHERE create_month = DATE_FORMAT(CURRENT_DATE, '%Y-%m')",
          'GROUP BY risk_level;',
          '```',
          '',
          '查询结果摘要：本月共发现隐患 96 条，其中高风险 18 条、中风险 42 条、低风险 36 条；整改闭环率近 7 天持续提升。',
          '',
          '基础图表：',
          '[[NL2SQL_CHARTS]]',
          '',
          '结果明细：',
          '| 风险等级 | 数量 | 占比 |',
          '| --- | ---: | ---: |',
          '| 高风险 | 18 | 18.8% |',
          '| 中风险 | 42 | 43.8% |',
          '| 低风险 | 36 | 37.5% |',
          '',
          '范围说明：本期只做 JDBC 单数据源，不做多数据源、跨库查询和自动 SQL 优化。',
        ].join('\n'), 8)
        return
      }

      if (thinkingMode.value) await appendThinkingPrelude(conv, agentType, text)

      await streamChatAnswer({
        question: text,
        kbIds: [],
        mode: thinkingMode.value ? 'deep' : 'standard',
        signal: ac.signal,
        onToken: token => appendToLastAssistant(conv, token),
      })
    } catch (e: any) {
      const msg = typeof e?.message === 'string' ? e.message : '请求失败'
      error.value = msg
      conv.reportStatus = isSplitAgent(agentType) ? 'failed' : conv.reportStatus
      conv.reportError = isSplitAgent(agentType) ? msg : conv.reportError
      appendToLastAssistant(conv, `\n\n[错误] ${msg}`)
    } finally {
      conv.updatedAt = Date.now()
      if (streamingConversationId.value === conversationId) streamingConversationId.value = null
    }
  }

  async function sendImageAnalysis(conversationId: string, image: string) {
    const conv = conversations.value.find(c => c.id === conversationId)
    if (!conv || !image) return

    error.value = null
    lastSent.value = { conversationId, type: 'image', image }
    conv.agentType = 'hazard'

    const userMsg: ChatMessage = {
      id: makeId('user'),
      role: 'user',
      content: '请对这张现场图片做隐患识别，给出依据和整改建议。',
      createdAt: Date.now(),
      image,
    }
    conv.messages.push(userMsg)
    if (conv.messages.length === 1) conv.title = '隐患识图分析'

    const assistantMsg: ChatMessage = { id: makeId('assistant'), role: 'assistant', content: '', createdAt: Date.now() }
    conv.messages.push(assistantMsg)
    conv.updatedAt = Date.now()
    streamingConversationId.value = conversationId

    const thinkingSteps = [
      '思考过程 1/3：先做场景识别与目标检测，定位人员、通道、配电点、临时线缆和作业区边界。',
      '思考过程 2/3：再做风险规则匹配，重点核验 PPE 佩戴、临边防护、消防通道占用和电气安全距离。',
      '思考过程 3/3：最后按风险等级分级（高/中/低），输出可执行整改动作与复核要点。',
      '',
    ]
    const report = [
      '识图结果',
      '================================',
      '',
      '【隐患 1】PPE 佩戴不规范（安全帽/反光防护）',
      '- 风险等级：高',
      '- 整改建议：立即停止对应作业，补齐安全帽与反光防护后复工。',
      '',
      '【隐患 2】疏散/作业通道被临时占用',
      '- 风险等级：中-高',
      '- 整改建议：30 分钟内清空通道并划线定置。',
      '',
      '【隐患 3】临时用电/线缆敷设不规范',
      '- 风险等级：高',
      '- 整改建议：由持证电工整改为架空或桥架敷设，补齐漏保与线缆防护。',
      '',
      '综合建议',
      '1. 先处置高风险项，再清理通道类中风险项。',
      '2. 建议 24 小时内完成复查并留痕。',
      '3. 当前为前端识图模拟结果，实际生产请结合现场复核与企业制度进行最终判定。',
    ].join('\n')

    try {
      if (thinkingMode.value) {
        for (const step of thinkingSteps) {
          await appendStream(conv, `${step}\n`, 12)
          await sleep(220)
        }
      }
      await appendStream(conv, report, 10)
    } catch (e: any) {
      const msg = typeof e?.message === 'string' ? e.message : '识图分析失败'
      error.value = msg
      appendToLastAssistant(conv, `\n\n[错误] ${msg}`)
    } finally {
      conv.updatedAt = Date.now()
      if (streamingConversationId.value === conversationId) streamingConversationId.value = null
    }
  }

  async function retryLast() {
    if (!lastSent.value) return
    if (lastSent.value.type === 'text' && lastSent.value.content) {
      await sendMessage(lastSent.value.conversationId, lastSent.value.content)
      return
    }
    if (lastSent.value.type === 'image' && lastSent.value.image) {
      await sendImageAnalysis(lastSent.value.conversationId, lastSent.value.image)
    }
  }

  return {
    conversations,
    sortedConversations,
    activeConversation,
    activeConversationId,
    streamingConversationId,
    error,
    thinkingMode,
    selectedAgentType,
    agentFocused,
    lastSent,
    createConversation,
    deleteConversation,
    switchConversation,
    setActiveAgent,
    clearAgentFocus,
    setReportTemplate,
    openReportPanel,
    closeReportPanel,
    setActiveReportDocument,
    sendMessage,
    sendImageAnalysis,
    retryLast,
  }
}, {
  persist: { key: 'ai-app-store' },
})
