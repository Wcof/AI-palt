import { defineStore } from 'pinia'
import { ref } from 'vue'
import { streamChatAnswer } from '@/api/chatStream'

export type ChatRole = 'user' | 'assistant'

export type ChatMessage = {
  id: string
  role: ChatRole
  content: string
  createdAt: number
  image?: string
}

export type Conversation = {
  id: string
  title: string
  createdAt: number
  updatedAt: number
  messages: ChatMessage[]
}

function makeId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

function generateTitle(message: string) {
  const trimmed = message.trim()
  return trimmed.length > 30 ? `${trimmed.slice(0, 30)}...` : (trimmed || '新对话')
}

export const useAIAppStore = defineStore('aiApp', () => {
  const conversations = ref<Conversation[]>([])
  const activeConversationId = ref<string | null>(null)
  const streamingConversationId = ref<string | null>(null)
  const error = ref<string | null>(null)
  const thinkingMode = ref(false)
  const lastSent = ref<{ conversationId: string; type: 'text' | 'image'; content?: string; image?: string } | null>(null)
  let streamAbort: AbortController | null = null

  function createConversation() {
    const now = Date.now()
    const conv: Conversation = {
      id: makeId('conv'),
      title: '新对话',
      createdAt: now,
      updatedAt: now,
      messages: [],
    }
    conversations.value.unshift(conv)
    activeConversationId.value = conv.id
    return conv.id
  }

  function deleteConversation(id: string) {
    const idx = conversations.value.findIndex(c => c.id === id)
    if (idx === -1) return
    conversations.value.splice(idx, 1)
    if (activeConversationId.value === id) {
      activeConversationId.value = conversations.value[0]?.id ?? null
    }
  }

  function switchConversation(id: string) {
    activeConversationId.value = id
  }

  function appendToLastAssistant(conv: Conversation, token: string) {
    const last = conv.messages[conv.messages.length - 1]
    if (last?.role === 'assistant') last.content += token
  }

  async function sleep(ms: number) {
    await new Promise((resolve) => setTimeout(resolve, ms))
  }

  async function appendStream(conv: Conversation, text: string, delay = 14) {
    for (const ch of text) {
      appendToLastAssistant(conv, ch)
      await sleep(delay)
    }
  }

  async function sendMessage(conversationId: string, content: string) {
    const conv = conversations.value.find(c => c.id === conversationId)
    if (!conv) return
    const text = content.trim()
    if (!text) return

    error.value = null
    lastSent.value = { conversationId, type: 'text', content: text }

    const userMsg: ChatMessage = { id: makeId('user'), role: 'user', content: text, createdAt: Date.now() }
    conv.messages.push(userMsg)
    if (conv.messages.length === 1) conv.title = generateTitle(text)

    const assistantMsg: ChatMessage = { id: makeId('assistant'), role: 'assistant', content: '', createdAt: Date.now() }
    conv.messages.push(assistantMsg)
    conv.updatedAt = Date.now()

    const ac = new AbortController()
    streamAbort?.abort()
    streamAbort = ac
    streamingConversationId.value = conversationId

    try {
      await streamChatAnswer({
        question: text,
        kbIds: [],
        mode: thinkingMode.value ? 'deep' : 'standard',
        signal: ac.signal,
        onToken: (token) => appendToLastAssistant(conv, token),
      })
    } catch (e: any) {
      const msg = typeof e?.message === 'string' ? e.message : '请求失败'
      error.value = msg
      appendToLastAssistant(conv, `\n\n[错误] ${msg}`)
    } finally {
      if (streamingConversationId.value === conversationId) streamingConversationId.value = null
    }
  }

  async function sendImageAnalysis(conversationId: string, image: string) {
    const conv = conversations.value.find(c => c.id === conversationId)
    if (!conv || !image) return

    error.value = null
    lastSent.value = { conversationId, type: 'image', image }

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
      '- 判定依据：GB 39800.1-2020《个体防护装备配备规范 第1部分：总则》；企业 PPE 管理制度。',
      '- 整改建议：立即停止对应作业，补齐安全帽与反光防护后复工；班前会增加 PPE 复核打卡，现场抽检留痕。',
      '- 完成时限：立即整改，班组当班闭环。',
      '',
      '【隐患 2】疏散/作业通道被临时占用',
      '- 风险等级：中-高',
      '- 判定依据：GB 50016《建筑设计防火规范》关于疏散通道保持畅通要求；企业应急疏散管理规定。',
      '- 整改建议：30 分钟内清空通道并划线定置；增设“禁占通道”标识，班组长每班至少 2 次巡检拍照。',
      '- 完成时限：30 分钟内完成清障，24 小时内复核。',
      '',
      '【隐患 3】临时用电/线缆敷设不规范（拖地、无防护）',
      '- 风险等级：高',
      '- 判定依据：JGJ 46《施工现场临时用电安全技术规范》；“一机一闸一漏一箱”管理要求。',
      '- 整改建议：由持证电工整改为架空或桥架敷设，补齐漏保与线缆防护；整改后执行绝缘与漏保动作测试并登记。',
      '- 完成时限：当班完成临时措施，24 小时内完成规范化整改。',
      '',
      '综合建议',
      '1. 先处置高风险项（PPE、临时用电），再清理通道类中风险项。',
      '2. 建议 24 小时内完成复查，复查项包括：人员防护、通道净空、电气测试记录。',
      '3. 当前为前端识图模拟结果，实际生产请结合现场复核与企业制度进行最终判定。',
    ].join('\n')

    try {
      for (const step of thinkingSteps) {
        await appendStream(conv, `${step}\n`, 12)
        await sleep(280)
      }
      await appendStream(conv, report, 10)
    } catch (e: any) {
      const msg = typeof e?.message === 'string' ? e.message : '识图分析失败'
      error.value = msg
      appendToLastAssistant(conv, `\n\n[错误] ${msg}`)
    } finally {
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
    activeConversationId,
    streamingConversationId,
    error,
    thinkingMode,
    lastSent,
    createConversation,
    deleteConversation,
    switchConversation,
    sendMessage,
    sendImageAnalysis,
    retryLast,
  }
}, {
  persist: { key: 'ai-app-store' },
})
