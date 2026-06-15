<script setup lang="ts">
import { ref, watch, nextTick, computed, onBeforeUnmount } from 'vue'
import { Send, Sparkles, Menu, ImagePlus, X, ChevronDown, FileText, Database, MessageSquare, BookOpen, ShieldAlert, CheckCircle2, Loader2, Command, MoreHorizontal, Play, Pause, Mic, RotateCcw, RotateCw, SlidersHorizontal, ThumbsUp, ThumbsDown, Copy, Pencil } from 'lucide-vue-next'
import { useAIAppStore, type AgentOption, type AgentType, type ChatMessage, type Conversation } from '@/stores/aiApp'
import WelcomeScreen from '@/components/aiApp/WelcomeScreen.vue'
import { useNewAIStore } from '@/stores/newAI'

const props = defineProps<{
  conversation: Conversation | null
  streaming: boolean
  thinkingMode: boolean
  error: string | null
  agents: AgentOption[]
  selectedAgent: AgentType
  agentFocused: boolean
}>()

const emit = defineEmits<{
  (e: 'send', content: string): void
  (e: 'send-image', image: string): void
  (e: 'select-prompt', content: string): void
  (e: 'toggle-thinking', enabled: boolean): void
  (e: 'change-agent', agentType: AgentType): void
  (e: 'clear-agent'): void
  (e: 'open-report-panel'): void
  (e: 'select-report-document', id: string): void
  (e: 'retry'): void
  (e: 'open-sidebar'): void
}>()

const draft = ref('')
const selectedImage = ref<string | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
const draftInputRef = ref<HTMLTextAreaElement | null>(null)
const listRef = ref<HTMLDivElement | null>(null)
const showAgentMore = ref(false)
const agentAppQuery = ref('')
const activeAppCategory = ref('smartQa')
const selectedApplication = ref<{ name: string; desc: string; agentType: AgentType } | null>(null)
const editingUserMessageId = ref<string | null>(null)
const editingConversationId = ref<string | null>(null)
const editingDraft = ref('')
const dislikeDialogOpen = ref(false)
const dislikeTargetMessage = ref<ChatMessage | null>(null)
const dislikeCategory = ref<'令人反感' | '不安全' | '与事实不符' | '与指令不符' | '个性化设置问题' | '更多'>('与事实不符')
const dislikeReason = ref('')
const dislikeError = ref('')
const clarificationText = ref('')
const deepThinking = computed({
  get: () => props.thinkingMode,
  set: (v: boolean) => emit('toggle-thinking', v),
})
const aiStore = useAIAppStore()
const newAIStore = useNewAIStore()

const activeAgentType = computed(() => props.conversation?.agentType || props.selectedAgent)
const currentAgent = computed<AgentOption>(() => props.agents.find(a => a.id === activeAgentType.value) || { id: 'general', name: '通用助手', desc: '安全生产问答、方案梳理、材料润色', badge: 'Chat' })
const displayApplicationName = computed(() => selectedApplication.value?.name || currentAgent.value.name)
const displayApplicationDesc = computed(() => selectedApplication.value?.desc || currentAgent.value.desc)
const currentQuotaStatus = computed(() => newAIStore.userQuotaAllocations.find(item => item.userName === newAIStore.currentAccount?.name) || null)
const currentQuotaWarning = computed(() => {
  if (!currentQuotaStatus.value) return ''
  if (currentQuotaStatus.value.status === 'exceeded') return '当前账号已超额，继续调用将按企业策略进行阻断或提示。'
  if (currentQuotaStatus.value.status === 'warning') return '当前账号已接近额度上限，建议尽快补配企业或用户额度。'
  return ''
})
const isReportAgent = computed(() => activeAgentType.value === 'report')
const isMeetingAgent = computed(() => activeAgentType.value === 'meeting')
const isDocumentAgent = computed(() => activeAgentType.value === 'document')
const isNl2sqlAgent = computed(() => activeAgentType.value === 'nl2sql')
const quickAgents = computed(() => props.agents.slice(0, 4))
const hasMoreAgents = computed(() => props.agents.length > 4)

const maxRecordingSeconds = 30 * 60
const recordingState = ref<'idle' | 'recording' | 'paused'>('idle')
const recordingSeconds = ref(0)
const meetingAudioPlaying = ref(false)
const playbackRate = ref(1)
const stopConfirming = ref(false)
let recordingTimer: ReturnType<typeof setInterval> | null = null
let stopConfirmTimer: ReturnType<typeof setTimeout> | null = null

const hasMeetingOutput = computed(() => Boolean(props.conversation?.reportDocuments?.length || props.conversation?.reportStatus === 'generating' || props.conversation?.reportStatus === 'done'))
const hasDocumentCards = computed(() => (isReportAgent.value || isDocumentAgent.value) && Boolean(props.conversation?.reportDocuments?.length))
const activeDocumentId = computed(() => props.conversation?.activeReportDocumentId || props.conversation?.reportDocuments?.[0]?.id || '')
const meetingControlLabel = computed(() => recordingState.value === 'recording' ? '暂停' : recordingState.value === 'paused' ? '继续' : '播放')
const meetingDurationLabel = computed(() => `${formatDuration(recordingSeconds.value)} / ${formatDuration(maxRecordingSeconds)}`)
const meetingPlaybackElapsedLabel = computed(() => recordingSeconds.value ? formatDurationLong(recordingSeconds.value) : '00:00')
const meetingPlaybackTotalLabel = computed(() => {
  const current = Math.max(recordingSeconds.value, 0)
  if (current >= 3600) return formatDurationLong(current)
  return '01:12:04'
})
const meetingMainIcon = computed(() => (recordingState.value === 'recording' || meetingAudioPlaying.value) ? Pause : Play)
const playbackRateLabel = computed(() => playbackRate.value === 1 ? '倍速' : `${playbackRate.value}x`)
const meetingStatusLabel = computed(() => {
  if (recordingState.value === 'recording') return '录音中'
  if (recordingState.value === 'paused') return '已暂停'
  return '未录音'
})

const appCategoryOptions = [
  { id: 'hazardView', name: '隐患视图', desc: '聚焦隐患识别、现场图片理解与风险视图类应用' },
  { id: 'smartQa', name: '智能问答', desc: '聚焦智能问答、知识库问答与智能问数类应用' },
  { id: 'smartDoc', name: '智能文书', desc: '聚焦安全生产文书、会议纪要与文档编写类应用' },
] as const

type AgentAppCategory = typeof appCategoryOptions[number]['id']

type AgentApplication = {
  id: string
  name: string
  desc: string
  category: AgentAppCategory
  agentType: AgentType
  tag?: string
}

const agentApplications: AgentApplication[] = [
  { id: 'knowledge-qa', name: '安全生产助手', desc: '基于安全生产知识、制度规程与案例进行问答', category: 'smartQa', agentType: 'rag', tag: '知识' },
  { id: 'safety-agent', name: '安全生产智能体', desc: '面向安全生产场景提供知识咨询与流程建议', category: 'smartQa', agentType: 'general', tag: '助手' },
  { id: 'chemical-production-assistant', name: '化工生产助手', desc: '围绕化工生产流程、装置与工艺场景提供知识咨询', category: 'smartQa', agentType: 'rag', tag: '化工' },
  { id: 'regulation-assistant', name: '法规制度助手', desc: '聚焦法规条款、制度规范与操作要求检索', category: 'smartQa', agentType: 'rag', tag: '法规' },

  { id: 'data-report', name: '安全生产文书', desc: '生成安全生产场景下的标准文书与报告', category: 'smartDoc', agentType: 'report', tag: '文书' },
  { id: 'production-doc', name: '生产制造文书', desc: '围绕生产制造过程生成记录、说明与汇报文书', category: 'smartDoc', agentType: 'document', tag: '制造' },
  { id: 'info-consult-doc', name: '信息咨询文书', desc: '面向咨询、汇报和答复场景生成信息类文书', category: 'smartDoc', agentType: 'document', tag: '咨询' },

  { id: 'smart-query', name: '智能问数智能体', desc: '面向业务数据进行自然语言问数与指标查询', category: 'hazardView', agentType: 'nl2sql', tag: '问数' },
  { id: 'hazard-vision', name: '隐患识别智能体', desc: '上传现场图片识别隐患并给出整改建议', category: 'hazardView', agentType: 'hazard', tag: '识别' },
  { id: 'meeting-minutes', name: '会议纪要智能体', desc: '录音转写并生成摘要、纪要与待办', category: 'smartDoc', agentType: 'meeting', tag: '会议' },
  { id: 'document-writing', name: '文档编写智能体', desc: '根据问题生成结构化文档和正文预览', category: 'smartDoc', agentType: 'document', tag: '文档' },
]

const activeAppCategoryDesc = computed(() => appCategoryOptions.find(item => item.id === activeAppCategory.value)?.desc || '')
const dislikeCategories: Array<'令人反感' | '不安全' | '与事实不符' | '与指令不符' | '个性化设置问题' | '更多'> = ['令人反感', '不安全', '与事实不符', '与指令不符', '个性化设置问题', '更多']

const filteredAgentApplications = computed(() => {
  const keyword = agentAppQuery.value.trim().toLowerCase()
  return agentApplications.filter(app => {
    const categoryMatched = app.category === activeAppCategory.value
    if (!categoryMatched) return false
    if (!keyword) return true
    return `${app.name} ${app.desc} ${app.tag || ''}`.toLowerCase().includes(keyword)
  })
})

const slashQuery = computed(() => {
  const leftTrimmed = draft.value.replace(/^\s+/, '')
  if (!leftTrimmed.startsWith('/')) return ''
  return leftTrimmed.slice(1).trim().toLowerCase()
})
const showSlashPalette = computed(() => draft.value.replace(/^\s+/, '').startsWith('/'))
const slashMatchedAgents = computed(() => {
  const q = slashQuery.value
  if (!q) return props.agents
  return props.agents.filter(agent => `${agent.id} ${agent.name} ${agent.badge} ${agent.desc}`.toLowerCase().includes(q))
})

const agentIconMap: Record<AgentType, any> = {
  general: MessageSquare,
  nl2sql: Database,
  report: FileText,
  meeting: MessageSquare,
  document: FileText,
  hazard: ShieldAlert,
  rag: BookOpen,
}

const slashNameMap: Record<string, AgentType> = {
  general: 'general',
  chat: 'general',
  通用: 'general',
  nl2sql: 'nl2sql',
  sql: 'nl2sql',
  问数: 'nl2sql',
  report: 'report',
  报告: 'report',
  meeting: 'meeting',
  minutes: 'meeting',
  会议: 'meeting',
  会议纪要: 'meeting',
  document: 'document',
  doc: 'document',
  write: 'document',
  文档: 'document',
  文档编写: 'document',
  hazard: 'hazard',
  vision: 'hazard',
  隐患: 'hazard',
  识图: 'hazard',
  rag: 'rag',
  knowledge: 'rag',
  知识库: 'rag',
}

const scrollToBottom = () => {
  nextTick(() => {
    if (listRef.value) listRef.value.scrollTop = listRef.value.scrollHeight
  })
}

watch(() => props.conversation?.messages.length, () => scrollToBottom())
watch(() => { const msgs = props.conversation?.messages || []; return msgs.length ? msgs[msgs.length - 1].content : '' }, () => scrollToBottom())
watch(() => props.agentFocused, (focused) => {
  if (focused) showAgentMore.value = false
  if (!focused) selectedApplication.value = null
})

watch(activeAgentType, (type) => {
  if (type !== 'meeting') resetMeetingRecorder()
})

watch(() => props.conversation?.id, () => {
  stopStopConfirmTimer()
  if (activeAgentType.value !== 'meeting') resetMeetingRecorder()
  cancelEditing()
  closeDislikeDialog()
})

onBeforeUnmount(() => {
  stopRecordingTimer()
  stopStopConfirmTimer()
})

function stopRecordingTimer() {
  if (recordingTimer) {
    clearInterval(recordingTimer)
    recordingTimer = null
  }
}

function startRecordingTimer() {
  stopRecordingTimer()
  recordingTimer = setInterval(() => {
    if (recordingState.value !== 'recording') return
    if (recordingSeconds.value >= maxRecordingSeconds) {
      stopMeetingRecording(true)
      return
    }
    recordingSeconds.value += 1
  }, 1000)
}

function stopStopConfirmTimer() {
  if (stopConfirmTimer) {
    clearTimeout(stopConfirmTimer)
    stopConfirmTimer = null
  }
}

function requestStopConfirmation() {
  stopConfirming.value = true
  stopStopConfirmTimer()
  stopConfirmTimer = setTimeout(() => {
    stopConfirming.value = false
    stopConfirmTimer = null
  }, 3000)
}

function formatDuration(totalSeconds: number) {
  const mins = Math.floor(totalSeconds / 60).toString().padStart(2, '0')
  const secs = (totalSeconds % 60).toString().padStart(2, '0')
  return `${mins}:${secs}`
}

function formatDurationLong(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600)
  const mins = Math.floor((totalSeconds % 3600) / 60)
  const secs = totalSeconds % 60
  if (hours > 0) return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

function resetMeetingRecorder() {
  stopRecordingTimer()
  stopStopConfirmTimer()
  recordingState.value = 'idle'
  recordingSeconds.value = 0
  stopConfirming.value = false
  meetingAudioPlaying.value = false
}

function stopMeetingRecording(resetDuration = false) {
  stopRecordingTimer()
  stopStopConfirmTimer()
  recordingState.value = 'idle'
  stopConfirming.value = false
  meetingAudioPlaying.value = false
  if (resetDuration) recordingSeconds.value = 0
}

function startMeetingRecordingFromBar() {
  recordingSeconds.value = 0
  meetingAudioPlaying.value = false
  recordingState.value = 'recording'
  startRecordingTimer()

  if (!hasMeetingOutput.value) {
    const topic = draft.value.trim() || '开始录音并生成本次项目同步会会议纪要'
    emit('send', topic)
    if (draft.value.trim()) draft.value = ''
  }
}

function toggleMeetingRecording() {
  if (!isMeetingAgent.value || props.streaming) return
  stopConfirming.value = false
  stopStopConfirmTimer()

  if (recordingState.value === 'recording') {
    recordingState.value = 'paused'
    stopRecordingTimer()
    return
  }

  if (recordingState.value === 'paused') {
    recordingState.value = 'recording'
    meetingAudioPlaying.value = false
    startRecordingTimer()
    return
  }

  startMeetingRecordingFromBar()
}

function toggleMeetingPlayback() {
  if (!isMeetingAgent.value || props.streaming) return
  stopConfirming.value = false
  stopStopConfirmTimer()

  if (recordingState.value === 'recording') {
    recordingState.value = 'paused'
    stopRecordingTimer()
    return
  }

  if (recordingState.value === 'paused') {
    recordingState.value = 'recording'
    meetingAudioPlaying.value = false
    startRecordingTimer()
    return
  }

  if (!hasMeetingOutput.value) {
    startMeetingRecordingFromBar()
    return
  }

  meetingAudioPlaying.value = !meetingAudioPlaying.value
}

function handleStopMeetingRecording() {
  if (!isMeetingAgent.value || recordingState.value === 'idle') return
  if (!stopConfirming.value) {
    requestStopConfirmation()
    return
  }
  stopMeetingRecording()
}

function restartMeetingAudio() {
  if (recordingState.value !== 'idle') return
  meetingAudioPlaying.value = false
}

function forwardMeetingAudio() {
  if (recordingState.value !== 'idle') return
}

function cyclePlaybackRate() {
  const rates = [1, 1.25, 1.5, 2]
  const idx = rates.indexOf(playbackRate.value)
  playbackRate.value = rates[(idx + 1) % rates.length]
}

function handleSelectReportDocument(documentId: string) {
  emit('select-report-document', documentId)
}

function toggleThinkingMode() {
  deepThinking.value = !deepThinking.value
}

function parseSlashCommand(text: string) {
  const trimmed = text.trim()
  if (!trimmed.startsWith('/')) return null
  const [command = '', ...restParts] = trimmed.slice(1).split(/\s+/)
  const agentType = slashNameMap[command.toLowerCase()]
  if (!agentType) return null
  return { agentType, rest: restParts.join(' ').trim() }
}

function selectAgent(agentType: AgentType, source: 'card' | 'slash' | 'quick' = 'card') {
  selectedApplication.value = null
  emit('change-agent', agentType)
  showAgentMore.value = false
  if (source === 'slash') draft.value = ''
}

function selectApplication(app: AgentApplication) {
  selectedApplication.value = { name: app.name, desc: app.desc, agentType: app.agentType }
  emit('change-agent', app.agentType)
  showAgentMore.value = false
}

function handleSend() {
  const text = draft.value.trim()
  if (!text || props.streaming) return
  const slashCommand = parseSlashCommand(text)
  if (slashCommand && !editingUserMessageId.value) {
    emit('change-agent', slashCommand.agentType)
    draft.value = slashCommand.rest
    return
  }
  emit('send', text)
  draft.value = ''
}

function triggerImageUpload() {
  fileInputRef.value?.click()
}

function handleImageChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file || !file.type.startsWith('image/')) return
  const reader = new FileReader()
  reader.onload = () => { selectedImage.value = String(reader.result || '') }
  reader.readAsDataURL(file)
}

function clearSelectedImage() {
  selectedImage.value = null
  if (fileInputRef.value) fileInputRef.value.value = ''
}

function handleSendImage() {
  if (!selectedImage.value || props.streaming) return
  emit('send-image', selectedImage.value)
  clearSelectedImage()
}

function handlePromptSelect(text: string) {
  emit('select-prompt', text)
}

function submitClarification(answer: string) {
  if (!props.conversation?.pendingClarification || props.streaming) return
  const text = answer.trim()
  if (!text) return
  aiStore.resolveClarification(props.conversation.id, text)
  clarificationText.value = ''
}

function copyMessage(content: string) {
  navigator.clipboard.writeText(content)
}

function getTrace(message: ChatMessage) {
  if (!props.conversation || message.role !== 'assistant') return null
  return newAIStore.getAgentInvocationTrace(message.id, props.conversation.id)
}

function packConversationContext(messageId: string, content: string) {
  if (!props.conversation) return
  const userQuestion = [...props.conversation.messages].reverse().find(item => item.role === 'user')?.content || ''
  const upload = newAIStore.uploads[0]
  const ocrTask = newAIStore.ocrTasks[0]
  newAIStore.createContextPack({
    conversationId: props.conversation.id,
    userQuestion,
    aiAnswer: content,
    agent: currentAgent.value.name,
    modelSource: newAIStore.activeModel.source === 'local' ? '本地模型' : newAIStore.activeModel.vendor,
    modelName: newAIStore.activeModel.name,
    modelVersion: newAIStore.activeModel.version,
    ragReferences: ['安全生产知识库/巡检规范', '案例库/事故复盘'],
    toolCalls: activeAgentType.value === 'hazard' ? ['OCR', '隐患识图'] : ['Chat Completion'],
    uploadedFiles: upload ? [upload.name] : [],
    ocrText: ocrTask?.text || '',
    logId: messageId,
  })
}

function handlePackLatestContext() {
  if (!props.conversation) return
  const latestAssistant = [...props.conversation.messages].reverse().find(item => item.role === 'assistant' && item.content.trim())
  if (!latestAssistant) return
  packConversationContext(latestAssistant.logId || latestAssistant.id, latestAssistant.content)
}

function startEditingMessage(message: ChatMessage) {
  if (!props.conversation || props.streaming) return
  editingUserMessageId.value = message.id
  editingConversationId.value = props.conversation.id
  editingDraft.value = message.content
}

function cancelEditing() {
  editingUserMessageId.value = null
  editingConversationId.value = null
  editingDraft.value = ''
}

function submitEditingMessage() {
  if (!editingUserMessageId.value || !editingConversationId.value || props.streaming) return
  const text = editingDraft.value.trim()
  if (!text) return
  aiStore.rewriteConversationFromUserMessage(editingConversationId.value, editingUserMessageId.value, text)
  cancelEditing()
}

function regenerateAssistantMessage(message: ChatMessage) {
  if (!props.conversation || props.streaming) return
  aiStore.regenerateFromAssistantMessage(props.conversation.id, message.id)
}

function buildCoCreationPayload(message: ChatMessage, action: 'like' | 'dislike', extra?: { category?: '令人反感' | '不安全' | '与事实不符' | '与指令不符' | '个性化设置问题' | '更多'; reason?: string }) {
  if (!props.conversation) return null
  const targetIndex = props.conversation.messages.findIndex(item => item.id === message.id)
  const previousUser = [...props.conversation.messages.slice(0, targetIndex)].reverse().find(item => item.role === 'user')
  const start = Math.max(0, targetIndex - 6)
  const end = Math.min(props.conversation.messages.length, targetIndex + 2)
  const contextMessages = props.conversation.messages.slice(start, end).map(item => ({
    role: item.role,
    content: item.content,
  }))
  return {
    messageId: message.id,
    conversationId: props.conversation.id,
    sessionId: props.conversation.id,
    feedbackUser: '产品演示账号',
    action,
    question: previousUser?.content || '',
    answer: message.content,
    contextMessages,
    status: '待处置' as const,
    ...extra,
  }
}

function handleLike(message: ChatMessage) {
  const payload = buildCoCreationPayload(message, 'like')
  if (!payload) return
  newAIStore.addExpertCoCreation(payload)
}

function openDislikeDialog(message: ChatMessage) {
  if (!props.conversation) return
  const existing = newAIStore.getExpertCoCreationEntry(message.id, props.conversation.id, 'dislike')
  dislikeTargetMessage.value = message
  dislikeCategory.value = existing?.category || '与事实不符'
  dislikeReason.value = existing?.reason || ''
  dislikeError.value = ''
  dislikeDialogOpen.value = true
}

function closeDislikeDialog() {
  dislikeDialogOpen.value = false
  dislikeTargetMessage.value = null
  dislikeReason.value = ''
  dislikeError.value = ''
}

function submitDislike() {
  if (!props.conversation || !dislikeTargetMessage.value) return
  const reason = dislikeReason.value.trim()
  if (!reason) {
    dislikeError.value = '请输入点踩原因。'
    return
  }
  const payload = buildCoCreationPayload(dislikeTargetMessage.value, 'dislike', {
    category: dislikeCategory.value,
    reason,
  })
  if (!payload) return
  newAIStore.addExpertCoCreation(payload)
  closeDislikeDialog()
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function renderRichContent(text: string) {
  const escaped = escapeHtml(text)
  const codeRendered = escaped.replace(/```([\s\S]*?)```/g, '<pre class="my-2 overflow-x-auto rounded-xl bg-blue-50 p-3 text-xs leading-5 text-blue-950">$1</pre>')
  const highlighted = codeRendered.replace(
    /《[^》]+》/g,
    (m) => `<a href="javascript:void(0)" class="cursor-pointer text-slate-950 underline decoration-dotted underline-offset-2 hover:text-blue-700">${m}</a>`
  )
  return highlighted.replace(/\n/g, '<br />')
}

function hasNl2sqlCharts(content: string) {
  return content.includes('[[NL2SQL_CHARTS]]')
}

function stripNl2sqlChartMarker(content: string) {
  return content.replace(/\[\[NL2SQL_CHARTS\]\]/g, '').trim()
}

const nl2sqlPieSegments = [
  { label: '高风险', value: 18, percent: '18.8%' },
  { label: '中风险', value: 42, percent: '43.8%' },
  { label: '低风险', value: 36, percent: '37.5%' },
]

const nl2sqlBars = [
  { label: '装置区', value: 28 },
  { label: '罐区', value: 22 },
  { label: '仓储区', value: 18 },
  { label: '动力站', value: 16 },
  { label: '办公区', value: 12 },
]

const nl2sqlTrend = [
  { day: 'D-6', value: 52 },
  { day: 'D-5', value: 58 },
  { day: 'D-4', value: 61 },
  { day: 'D-3', value: 66 },
  { day: 'D-2', value: 71 },
  { day: 'D-1', value: 76 },
  { day: '今日', value: 82 },
]

function barWidth(value: number) {
  return `${Math.max(12, Math.min(100, value * 3))}%`
}

type ReasoningView = {
  hasReasoning: boolean
  steps: string[]
  finalText: string
}

function parseReasoningContent(content: string): ReasoningView {
  const lines = content.split('\n')
  const steps: string[] = []
  let firstResultLine = -1

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i].trim()
    if (/^思考过程\s*\d+\/\d+[:：]/.test(line) || line.startsWith('思考过程：')) {
      steps.push(line)
      continue
    }
    if (
      firstResultLine === -1
      && (
        line.startsWith('识图结果')
        || line.startsWith('分析结果')
        || line.startsWith('检测结果')
        || line.startsWith('已进入')
        || line.startsWith('示例 SQL')
        || line.startsWith('当前 JDBC')
        || line.startsWith('报告预览已生成')
        || line.startsWith('##')
        || line.startsWith('#')
      )
    ) {
      firstResultLine = i
      break
    }
  }

  const finalText = firstResultLine === -1
    ? (steps.length ? lines.filter(l => !/^思考过程\s*/.test(l.trim())).join('\n').trim() : content)
    : lines.slice(firstResultLine).join('\n').trim()

  return { hasReasoning: steps.length > 0, steps, finalText }
}
</script>

<template>
  <div class="flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-gradient-to-br from-sky-50/90 via-white/90 to-blue-50/90 ring-1 ring-blue-100/80 backdrop-blur-2xl">
    <div class="border-b border-blue-100/80 bg-gradient-to-r from-white/90 via-sky-50/80 to-blue-50/70 px-3 py-2 backdrop-blur-xl sm:px-5 sm:py-2.5">
      <div class="flex items-center justify-between gap-3">
        <div class="flex min-w-0 items-center gap-3">
          <button type="button" class="rounded-lg p-2 text-slate-600 transition hover:bg-white/80 hover:text-slate-950 md:hidden" @click="emit('open-sidebar')">
            <Menu class="h-4 w-4" />
          </button>
          <div class="min-w-0">
            <div class="hidden truncate text-sm font-semibold tracking-tight text-slate-950 sm:block">极客光年安全大模型</div>
            <div class="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-600">
              <span class="inline-flex items-center gap-1.5 rounded-full bg-blue-50/95 px-3 py-1 text-blue-700 ring-1 ring-blue-100">
                <component :is="agentIconMap[currentAgent.id]" class="h-3.5 w-3.5 text-blue-600" />
                当前应用：{{ displayApplicationName }}
              </span>
              <span v-if="conversation?.title" class="hidden truncate text-slate-500 sm:inline">{{ conversation.title }}</span>
            </div>
            </div>
          </div>
          <div v-if="streaming" class="shrink-0 rounded-full px-3 py-1 text-[0.6875rem] ring-1" :class="thinkingMode && !isMeetingAgent ? 'bg-blue-50 text-blue-700 ring-blue-200' : 'bg-slate-100 text-slate-700 ring-slate-200'">
            {{ thinkingMode && !isMeetingAgent ? 'AI 正在深度思考中…' : 'AI 正在输入…' }}
          </div>
      </div>
    </div>

    <div v-if="isReportAgent || isMeetingAgent || isDocumentAgent || isNl2sqlAgent" class="border-b border-blue-100/80 bg-white/50 px-4 py-2 text-xs text-slate-600 backdrop-blur sm:px-6">
      <span v-if="isReportAgent" class="inline-flex items-center gap-1.5"><FileText class="h-3.5 w-3.5 text-blue-600" /> 文档助手已就绪：生成后会在左侧生成文档卡片，点击卡片可切换右侧预览内容。</span>
      <span v-else-if="isMeetingAgent" class="inline-flex items-center gap-1.5"><MessageSquare class="h-3.5 w-3.5 text-blue-600" /> 会议纪要已就绪：左侧只保留录音控制，右侧生成原文、摘要、会议纪要和待办。</span>
      <span v-else-if="isDocumentAgent" class="inline-flex items-center gap-1.5"><FileText class="h-3.5 w-3.5 text-blue-600" /> 文档编写已就绪：左侧提需求，右侧展示摘要、文档块和正文预览。</span>
      <span v-else class="inline-flex items-center gap-1.5"><Database class="h-3.5 w-3.5 text-blue-600" /> 智能问数按单 JDBC 数据源执行，结合 Case 与专有名词增强。</span>
    </div>

    <div v-if="currentQuotaWarning" class="border-b border-amber-200/80 bg-amber-50/80 px-4 py-2 text-xs text-amber-800 backdrop-blur sm:px-6">
      {{ currentQuotaWarning }}
    </div>

    <div v-if="(isReportAgent || isMeetingAgent || isDocumentAgent) && conversation?.reportDocuments?.length" class="border-b border-blue-100 bg-blue-50/70 px-4 py-2 text-xs text-blue-800 sm:px-6">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <span class="inline-flex items-center gap-1.5"><FileText class="h-3.5 w-3.5" /> 当前会话已有 {{ conversation.reportDocuments.length }} 份结果，可点击卡片切换预览。</span>
        <button v-if="!conversation?.reportPanelOpen" type="button" class="rounded-lg bg-white px-2.5 py-1 text-[0.6875rem] font-semibold text-blue-700 ring-1 ring-blue-100 transition hover:bg-blue-50" @click="emit('open-report-panel')">打开右侧预览</button>
      </div>
    </div>

    <div v-if="hasDocumentCards" class="border-b border-blue-100/70 bg-white/70 px-4 py-3 sm:px-6">
      <div class="mb-2 flex items-center justify-between gap-2">
        <div class="text-xs font-semibold text-slate-700">已生成文档</div>
        <div class="text-[0.6875rem] text-slate-500">点击卡片切换右侧内容</div>
      </div>
      <div class="flex gap-2 overflow-x-auto pb-1">
        <button
          v-for="doc in conversation?.reportDocuments"
          :key="doc.id"
          type="button"
          :class="[
            'min-w-[13.75rem] max-w-[17.5rem] shrink-0 rounded-2xl px-3 py-2.5 text-left ring-1 transition',
            doc.id === activeDocumentId ? 'bg-blue-600 text-white ring-blue-600 shadow-[0_0.75rem_1.875rem_rgba(37,99,235,0.18)]' : 'bg-white text-slate-700 ring-blue-100 hover:bg-blue-50 hover:text-blue-900'
          ]"
          @click="handleSelectReportDocument(doc.id)"
        >
          <div class="flex items-center justify-between gap-2">
            <span class="truncate text-sm font-semibold">{{ doc.title }}</span>
            <span :class="['rounded-full px-2 py-0.5 text-[0.625rem]', doc.id === activeDocumentId ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-700 ring-1 ring-blue-100']">{{ doc.status === 'generating' ? '生成中' : '文档' }}</span>
          </div>
          <div :class="['mt-1 line-clamp-1 text-[0.6875rem]', doc.id === activeDocumentId ? 'text-blue-50' : 'text-slate-500']">{{ doc.status === 'generating' ? '正在更新内容…' : '点击后在右侧查看对应文档内容' }}</div>
        </button>
      </div>
    </div>

    <div ref="listRef" class="min-h-0 flex-1 overflow-auto px-0 sm:px-1">
      <template v-if="conversation && conversation.messages.length">
        <div v-for="m in conversation.messages" :key="m.id" :class="m.role === 'user' ? 'flex justify-end px-3 py-2 sm:px-5' : 'flex justify-start px-3 py-2 sm:px-5'">
          <div :class="['group flex flex-col', editingUserMessageId === m.id ? 'max-w-[min(62rem,92vw)]' : 'max-w-[min(56.25rem,88vw)]']">
            <div :class="['rounded-[1.375rem] px-4 py-3 text-sm leading-6 ring-1 shadow-[0_0.625rem_2.125rem_rgba(37,99,235,0.08)]', m.role === 'user' ? 'bg-gradient-to-br from-blue-600 to-cyan-500 text-white ring-white/20' : thinkingMode ? 'bg-gradient-to-br from-white to-blue-50/80 text-slate-900 ring-blue-200/80' : 'bg-gradient-to-br from-white to-sky-50/70 text-slate-900 ring-blue-100/80']">
            <img v-if="m.image" :src="m.image" alt="隐患识图上传图片" class="mb-2 max-h-60 w-auto rounded-xl border border-white/30 object-contain" />
            <div v-if="m.role === 'assistant'" class="pr-1">
              <template v-if="parseReasoningContent(m.content).hasReasoning">
                <details class="thinking-shell" open>
                  <summary class="thinking-summary">
                    <span class="inline-flex min-w-0 items-center gap-2">
                      <span class="thinking-check">
                        <CheckCircle2 class="h-3.5 w-3.5" />
                      </span>
                      <span class="truncate font-semibold text-slate-800">{{ currentAgent.name }}</span>
                      <span class="shrink-0 text-[0.75rem] text-slate-500">思考过程</span>
                    </span>
                    <span class="thinking-toggle">
                      <span>{{ parseReasoningContent(m.content).steps.length }} 步</span>
                      <ChevronDown class="h-3.5 w-3.5" />
                    </span>
                  </summary>
                  <div class="thinking-steps">
                    <div
                      v-for="(step, idx) in parseReasoningContent(m.content).steps"
                      :key="`${m.id}-step-${idx}`"
                      class="thinking-step"
                    >
                      <span class="thinking-index">{{ idx + 1 }}</span>
                      <span class="thinking-step-text">{{ step.replace(/^思考过程\s*\d+\/\d+[:：]/, '').replace(/^思考过程：/, '').trim() }}</span>
                    </div>
                  </div>
                </details>
                <div v-if="parseReasoningContent(m.content).finalText" class="break-words leading-6" v-html="renderRichContent(stripNl2sqlChartMarker(parseReasoningContent(m.content).finalText))" />
              </template>
              <div v-else-if="m.content" class="break-words leading-6" v-html="renderRichContent(stripNl2sqlChartMarker(m.content))" />
              <div v-if="hasNl2sqlCharts(m.content)" class="nl2sql-chart-panel">
                <div class="chart-panel-head">
                  <div>
                    <div class="chart-title">智能问数基础图表</div>
                    <div class="chart-subtitle">同一组查询结果同步展示圆饼图、折线图、柱状图和表格明细。</div>
                  </div>
                  <span class="chart-badge">SQL + Chart</span>
                </div>
                <div class="chart-grid">
                  <div class="chart-card pie-card">
                    <div class="chart-card-title">隐患等级占比</div>
                    <div class="pie-wrap">
                      <div class="pie-chart" />
                      <div class="pie-legend">
                        <div v-for="seg in nl2sqlPieSegments" :key="seg.label" class="legend-row">
                          <span class="legend-dot" />
                          <span>{{ seg.label }}</span>
                          <strong>{{ seg.percent }}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="chart-card">
                    <div class="chart-card-title">近 7 天闭环率趋势</div>
                    <div class="line-chart">
                      <div v-for="point in nl2sqlTrend" :key="point.day" class="line-point" :style="{ height: `${point.value}%` }">
                        <span>{{ point.value }}%</span>
                      </div>
                    </div>
                    <div class="line-days"><span v-for="point in nl2sqlTrend" :key="`${point.day}-label`">{{ point.day }}</span></div>
                  </div>
                  <div class="chart-card chart-card-wide">
                    <div class="chart-card-title">各区域隐患数量</div>
                    <div class="bar-list">
                      <div v-for="bar in nl2sqlBars" :key="bar.label" class="bar-row">
                        <span>{{ bar.label }}</span>
                        <div class="bar-track"><div class="bar-fill" :style="{ width: barWidth(bar.value) }" /></div>
                        <strong>{{ bar.value }}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else-if="streaming" class="inline-flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-700">
                <Loader2 class="h-3.5 w-3.5 animate-spin" /> 正在思考问题...
              </div>
            </div>
            <div v-else-if="editingUserMessageId === m.id" class="space-y-3">
              <textarea
                v-model="editingDraft"
                rows="4"
                class="min-h-[8.5rem] w-[min(46rem,calc(100vw-3rem))] resize-y rounded-[1.375rem] bg-gradient-to-br from-blue-600 to-cyan-500 px-4 py-3 text-sm leading-6 text-white shadow-[0_0.625rem_2.125rem_rgba(37,99,235,0.08)] outline-none ring-1 ring-white/20 placeholder:text-blue-100"
                @keydown.enter.exact.prevent="submitEditingMessage"
              />
              <div class="flex justify-end gap-2">
                <button type="button" class="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50" @click="cancelEditing">取消</button>
                <button type="button" class="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50" :disabled="!editingDraft.trim() || streaming" @click="submitEditingMessage">更新</button>
              </div>
            </div>
            <div v-else class="whitespace-pre-wrap">{{ m.content }}</div>
            </div>
            <details v-if="m.role === 'assistant' && m.content && getTrace(m)" class="trace-block">
              <summary class="trace-summary">
                <span>调用链路</span>
                <span class="trace-summary-meta">{{ getTrace(m)?.totalLatencyMs }}ms / {{ getTrace(m)?.totalTokens }} tokens</span>
              </summary>
              <div class="trace-panel">
                <div class="trace-title">{{ getTrace(m)?.summary }}</div>
                <div class="trace-steps">
                  <div v-for="step in getTrace(m)?.steps || []" :key="step.id" class="trace-step">
                    <div class="trace-step-head">
                      <span class="trace-step-type">{{ step.type }}</span>
                      <span class="trace-step-name">{{ step.title }}</span>
                      <span class="trace-step-latency">{{ step.durationMs }}ms</span>
                    </div>
                    <div class="trace-step-detail">{{ step.detail }}</div>
                  </div>
                </div>
              </div>
            </details>
            <div v-if="m.role === 'assistant' && m.content" class="mt-2 flex items-center gap-1.5 pl-2 text-slate-500">
              <button
                type="button"
                class="inline-flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-slate-100 hover:text-slate-700"
                title="复制"
                @click="copyMessage(m.content)"
              >
                <Copy class="h-4 w-4" />
              </button>
              <button
                type="button"
                class="inline-flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                :disabled="streaming"
                title="重新生成"
                @click="regenerateAssistantMessage(m)"
              >
                <RotateCcw class="h-4 w-4" />
              </button>
              <button
                type="button"
                class="inline-flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-slate-100 hover:text-slate-700"
                title="点赞"
                @click="handleLike(m)"
              >
                <ThumbsUp class="h-4 w-4" />
              </button>
              <button
                type="button"
                class="inline-flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-slate-100 hover:text-slate-700"
                title="点踩"
                @click="openDislikeDialog(m)"
              >
                <ThumbsDown class="h-4 w-4" />
              </button>
            </div>
            <div v-if="m.role === 'user' && editingUserMessageId !== m.id" class="mt-2 flex justify-end gap-2 opacity-0 transition group-hover:opacity-100">
              <button type="button" class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/85 text-slate-700 ring-1 ring-blue-100 transition hover:bg-white" title="复制问题" aria-label="复制问题" @click="copyMessage(m.content)">
                <Copy class="h-3.5 w-3.5" />
              </button>
              <button type="button" class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/85 text-slate-700 ring-1 ring-blue-100 transition hover:bg-white disabled:opacity-50" :disabled="streaming" title="修改问题" aria-label="修改问题" @click="startEditingMessage(m)">
                <Pencil class="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </template>
      <div v-else-if="isMeetingAgent" class="flex min-h-full items-center justify-center px-4 py-8 sm:px-8">
        <div class="w-full max-w-3xl rounded-[2rem] border border-blue-100 bg-white/80 p-6 shadow-[0_1.75rem_5.625rem_rgba(37,99,235,0.16)] ring-1 ring-white/80 backdrop-blur-xl">
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div class="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
                <MessageSquare class="h-3.5 w-3.5" /> 会议纪要工作台
              </div>
              <h2 class="mt-4 text-2xl font-semibold tracking-tight text-slate-950">左侧录音与原文输入，右侧四类结果切换展示</h2>
              <p class="mt-2 max-w-2xl text-sm leading-6 text-slate-600">录音开始后，底部会出现和音频播放器一致的控制条，可播放/暂停、快进、查看波形与时长；右侧按摘要、纪要、待办、原文四类结果切换显示。</p>
            </div>
            <button type="button" class="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-[0_1rem_2.375rem_rgba(37,99,235,0.24)] transition hover:bg-blue-700" @click="toggleMeetingRecording">
              <Mic class="h-4 w-4" /> {{ recordingState === 'recording' ? '暂停录音' : recordingState === 'paused' ? '继续录音' : '开始录音' }}
            </button>
          </div>
          <div class="mt-6 grid gap-3 rounded-[1.5rem] bg-slate-50/90 p-4 ring-1 ring-slate-200/80">
            <div class="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 ring-1 ring-blue-50"><span class="text-xs font-semibold text-blue-700">{{ meetingDurationLabel }}</span><span class="text-sm text-slate-700">{{ meetingStatusLabel }}，系统将识别发言人、主题和关键动作。</span></div>
            <div class="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 ring-1 ring-blue-50"><span class="text-xs font-semibold text-blue-700">输出</span><span class="text-sm text-slate-700">右侧将按「摘要 / 纪要 / 待办 / 原文」四类结果切换展示。</span></div>
          </div>
        </div>
      </div>
      <div v-else-if="isDocumentAgent" class="flex min-h-full items-center justify-center px-4 py-8 sm:px-8">
        <div class="w-full max-w-3xl rounded-[2rem] border border-blue-100 bg-white/80 p-6 shadow-[0_1.75rem_5.625rem_rgba(37,99,235,0.16)] ring-1 ring-white/80 backdrop-blur-xl">
          <div class="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
            <FileText class="h-3.5 w-3.5" /> 文档编写工作台
          </div>
          <h2 class="mt-4 text-2xl font-semibold tracking-tight text-slate-950">左侧提需求，右侧预览文档块</h2>
          <p class="mt-2 text-sm leading-6 text-slate-600">输入文档主题或写作要求后，系统会在右侧生成摘要、标题与格式标识，并以文档块形式沉淀，点击后查看正文预览。</p>
          <div class="mt-6 grid gap-3 sm:grid-cols-3">
            <button type="button" class="rounded-2xl bg-blue-50 px-4 py-4 text-left ring-1 ring-blue-100 transition hover:bg-blue-100" @click="emit('send', '帮我编写一份安全生产 AI 应用建设方案')"><div class="text-sm font-semibold text-slate-950">方案文档</div><div class="mt-1 text-xs leading-5 text-slate-500">背景、目标、方案、计划</div></button>
            <button type="button" class="rounded-2xl bg-white px-4 py-4 text-left ring-1 ring-blue-100 transition hover:bg-blue-50" @click="emit('send', '帮我编写一份巡检机器人产品需求说明')"><div class="text-sm font-semibold text-slate-950">PRD 草稿</div><div class="mt-1 text-xs leading-5 text-slate-500">需求、功能、边界、验收</div></button>
            <button type="button" class="rounded-2xl bg-white px-4 py-4 text-left ring-1 ring-blue-100 transition hover:bg-blue-50" @click="emit('send', '帮我编写一份项目会议后的执行计划')"><div class="text-sm font-semibold text-slate-950">执行计划</div><div class="mt-1 text-xs leading-5 text-slate-500">事项、负责人、节奏、风险</div></button>
          </div>
        </div>
      </div>
      <WelcomeScreen v-else :agents="agents" :selected-agent="activeAgentType" :agent-focused="props.agentFocused" @select-prompt="handlePromptSelect" @change-agent="selectAgent" />
    </div>

    <div class="relative z-50 shrink-0 border-t border-blue-100/80 bg-gradient-to-r from-sky-50/90 via-white/90 to-blue-50/90 px-3 py-3 backdrop-blur-xl sm:px-5 sm:py-4">
      <input ref="fileInputRef" type="file" accept="image/*" class="hidden" @change="handleImageChange" />
      <div v-if="error" class="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
        <span>请求失败：{{ error }}</span>
        <button type="button" @click="emit('retry')" class="rounded-lg bg-white px-2 py-1 text-[0.6875rem] font-semibold text-rose-700 ring-1 ring-rose-200 transition hover:bg-white">重试</button>
      </div>

      <div :class="['relative w-full overflow-hidden backdrop-blur-xl', isMeetingAgent ? 'rounded-[1rem] border border-indigo-100/80 bg-white/80 px-1.5 py-1.5 shadow-[0_0.875rem_2.5rem_rgba(99,102,241,0.12)] ring-1 ring-white/90' : 'rounded-[1.875rem] border border-blue-200/80 bg-gradient-to-br from-white via-sky-50/90 to-blue-50/80 px-3 py-3 shadow-[0_1.5rem_5rem_rgba(37,99,235,0.16)] ring-1 ring-white/80 sm:px-4 sm:py-4']">
        <transition
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="translate-y-6 opacity-0"
          enter-to-class="translate-y-0 opacity-100"
          leave-active-class="transition duration-200 ease-in"
          leave-from-class="translate-y-0 opacity-100"
          leave-to-class="translate-y-6 opacity-0"
        >
          <div v-if="conversation?.pendingClarification" class="rounded-[1.5rem] border border-blue-100 bg-white/95 p-4 shadow-[0_1rem_2.5rem_rgba(37,99,235,0.12)]">
            <div class="mb-2 text-sm font-semibold text-slate-900">请先补充信息</div>
            <div class="mb-4 text-xs leading-5 text-slate-500">当前问题还存在歧义，请先补充一项关键信息，再继续生成正式回答。</div>
            <div class="grid gap-2">
              <button
                v-for="option in conversation.pendingClarification.options"
                :key="option"
                type="button"
                class="flex min-h-11 w-full items-center rounded-2xl bg-blue-50 px-4 py-3 text-left text-sm text-slate-800 ring-1 ring-blue-100 transition hover:bg-blue-100"
                @click="submitClarification(option)"
              >
                {{ option }}
              </button>
            </div>
            <div class="mt-3 flex flex-col gap-2 sm:flex-row sm:gap-3">
              <input
                v-model="clarificationText"
                type="text"
                class="min-w-0 flex-1 rounded-2xl border border-sky-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                placeholder="其他补充信息"
                @keydown.enter.prevent="submitClarification(clarificationText)"
              />
              <button
                type="button"
                class="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
                :disabled="!clarificationText.trim() || streaming"
                @click="submitClarification(clarificationText)"
              >
                发送
              </button>
            </div>
          </div>
        </transition>
        <div v-if="!conversation?.pendingClarification && showSlashPalette" class="absolute bottom-[calc(100%+0.625rem)] left-3 z-[90] w-[min(32.5rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-[0_1.5rem_4.375rem_rgba(37,99,235,0.20)]">
          <div class="flex items-center gap-2 border-b border-blue-50 px-3 py-2 text-xs font-semibold text-blue-700">
            <Command class="h-3.5 w-3.5" /> 输入 / 选择应用
          </div>
          <button
            v-for="agent in slashMatchedAgents"
            :key="agent.id"
            type="button"
            class="flex w-full items-start gap-3 px-3 py-2 text-left transition hover:bg-blue-50"
            @click="selectAgent(agent.id, 'slash')"
          >
            <span class="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white">
              <component :is="agentIconMap[agent.id]" class="h-4 w-4" />
            </span>
            <span class="min-w-0 flex-1">
              <span class="block text-sm font-semibold text-slate-900">{{ agent.name }} <span class="text-xs font-normal text-slate-400">/{{ agent.id }}</span></span>
              <span class="block truncate text-xs text-slate-500">{{ agent.desc }}</span>
            </span>
          </button>
          <div v-if="slashMatchedAgents.length === 0" class="px-3 py-4 text-center text-xs text-slate-500">没有匹配到应用</div>
        </div>



        <template v-if="!conversation?.pendingClarification && !isMeetingAgent">
          <textarea
            ref="draftInputRef"
            v-model="draft"
            @keydown.enter.exact.prevent="handleSend"
            rows="2"
            :placeholder="isDocumentAgent ? '输入文档主题、写作要求或修改意见，右侧会生成文档预览...' : isReportAgent ? '输入报告主题，回车后创建 Markdown 文档并打开右侧预览...' : isNl2sqlAgent ? '输入问数问题，或输入 /report 切换文档助手...' : '输入问题，或输入 / 选择应用 Agent...'"
            class="min-h-[5.375rem] w-full resize-none rounded-[1.5rem] border border-blue-100/70 bg-white/75 px-4 py-3 text-[0.9375rem] leading-6 text-slate-900 shadow-inner outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white sm:min-h-[6rem]"
          />

          <div v-if="selectedImage" class="mt-3 flex items-start gap-2 rounded-2xl border border-blue-100 bg-blue-50/70 p-2">
            <img :src="selectedImage" alt="待发送图片" class="h-20 w-28 rounded-xl object-cover" />
            <div class="flex min-w-0 flex-1 flex-col gap-2">
              <div class="text-xs text-slate-600">已选择图片，点击“识图发送”进入隐患分析流程。</div>
              <div class="flex items-center gap-2">
                <button type="button" @click="handleSendImage" :disabled="streaming" class="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50">
                  识图发送
                </button>
                <button type="button" @click="clearSelectedImage" class="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50">
                  取消
                </button>
              </div>
            </div>
            <button type="button" @click="clearSelectedImage" class="rounded-md p-1 text-slate-500 hover:bg-slate-100">
              <X class="h-4 w-4" />
            </button>
          </div>
        </template>

        <div v-if="!conversation?.pendingClarification && isMeetingAgent" class="meeting-audio-player" :class="{ 'is-recording': recordingState === 'recording', 'is-paused': recordingState === 'paused' }">
          <button type="button" class="meeting-audio-icon" title="回到开头" @click="restartMeetingAudio">
            <RotateCcw class="h-4 w-4" />
          </button>

          <button
            type="button"
            :disabled="streaming"
            class="meeting-audio-main"
            :title="recordingState === 'recording' ? '暂停录音' : recordingState === 'paused' ? '继续录音' : hasMeetingOutput ? '播放录音' : '开始录音'"
            @click="toggleMeetingPlayback"
          >
            <component :is="meetingMainIcon" class="h-5 w-5" />
          </button>

          <button
            type="button"
            class="meeting-audio-icon"
            :title="recordingState === 'idle' ? '快进' : stopConfirming ? '确认停止录音' : '停止录音'"
            @click="recordingState === 'idle' ? forwardMeetingAudio() : handleStopMeetingRecording()"
          >
            <RotateCw v-if="recordingState === 'idle'" class="h-4 w-4" />
            <span v-else class="meeting-stop-dot" :class="{ 'is-confirm': stopConfirming }" />
          </button>

          <div class="meeting-wave-area" aria-label="会议音频进度">
            <div class="meeting-waveform">
              <span v-for="idx in 48" :key="idx" :style="{ height: (28 + ((idx * 17) % 42)) + '%' }" />
            </div>
            <div class="meeting-time-row">
              <span>{{ meetingPlaybackElapsedLabel }}</span>
              <span>{{ meetingPlaybackTotalLabel }}</span>
            </div>
          </div>

          <button type="button" class="meeting-speed" title="切换播放倍速" @click="cyclePlaybackRate">{{ playbackRateLabel }}</button>
          <button type="button" class="meeting-settings" title="音频设置">
            <SlidersHorizontal class="h-4 w-4" />
          </button>
        </div>

        <div v-if="!conversation?.pendingClarification && !isMeetingAgent" class="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-blue-100/80 pt-3">
          <div class="flex min-w-0 flex-1 flex-wrap items-center gap-2">
            <button
              v-if="!isMeetingAgent"
              type="button"
              class="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.75rem] font-semibold ring-1 transition"
              :class="deepThinking ? 'bg-blue-600 text-white ring-blue-600 shadow-[0_0.75rem_1.875rem_rgba(37,99,235,0.22)]' : 'bg-white text-slate-700 ring-blue-100 hover:bg-blue-50 hover:text-blue-700'"
              :title="deepThinking ? '点击关闭深度思考过程' : '点击开启深度思考过程'"
              @click="toggleThinkingMode"
            >
              <Sparkles class="h-3.5 w-3.5" />
              {{ deepThinking ? '深度思考：已开启' : '深度思考：已关闭' }}
            </button>

            <template v-if="props.agentFocused">
              <div
                class="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-[0.75rem] font-semibold text-blue-700 ring-1 ring-blue-100"
                :title="`当前聚焦：${displayApplicationName}`"
              >
                <component :is="agentIconMap[currentAgent.id]" class="h-3.5 w-3.5" />
                <span>{{ displayApplicationName }}</span>
                <button
                  type="button"
                  class="ml-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-blue-100 text-blue-700 transition hover:bg-blue-200"
                  title="取消 Agent 聚焦"
                  @click.stop="emit('clear-agent')"
                >
                  <X class="h-3 w-3" />
                </button>
              </div>
            </template>
            <template v-else>
              <button
                v-for="agent in quickAgents"
                :key="agent.id"
                type="button"
                class="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[0.75rem] font-medium text-slate-700 ring-1 ring-blue-100 transition hover:bg-blue-50 hover:text-blue-700"
                @click="selectAgent(agent.id, 'quick')"
              >
                <component :is="agentIconMap[agent.id]" class="h-3.5 w-3.5 text-blue-600" />
                <span>{{ agent.name }}</span>
              </button>
              <div v-if="hasMoreAgents" class="relative">
                <button
                  type="button"
                  class="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-[0.75rem] font-semibold text-blue-700 ring-1 ring-blue-100 transition hover:bg-blue-100"
                  @click="showAgentMore = !showAgentMore"
                >
                  <MoreHorizontal class="h-3.5 w-3.5" /> 更多
                </button>

                <transition enter-active-class="transition duration-200" enter-from-class="translate-y-2 scale-[0.98] opacity-0" enter-to-class="translate-y-0 scale-100 opacity-100" leave-active-class="transition duration-150" leave-from-class="translate-y-0 scale-100 opacity-100" leave-to-class="translate-y-2 scale-[0.98] opacity-0">
                  <div v-if="showAgentMore && !props.agentFocused" class="agent-app-popover absolute bottom-[calc(100%+0.625rem)] left-0 z-[95] w-[min(47.5rem,calc(100vw-2rem))] overflow-hidden rounded-[1.625rem] border border-blue-100 bg-white/95 shadow-[0_1.75rem_5.375rem_rgba(37,99,235,0.24)] ring-1 ring-white/80 backdrop-blur-2xl">
                    <div class="agent-app-head flex items-center justify-between gap-3 border-b border-blue-50 px-5 py-4">
                      <div class="min-w-0">
                        <div class="flex items-center gap-2">
                          <span class="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-400 text-white shadow-[0_0.75rem_1.75rem_rgba(37,99,235,0.26)]">
                            <Sparkles class="h-4 w-4" />
                          </span>
                          <div class="truncate text-base font-semibold text-slate-950">AI Agent 智能体</div>
                        </div>
                        <div class="mt-1 text-xs text-slate-500">按安全生产知识、智能文书、AI 智能体三类选择应用，弹窗与“更多”按钮保持关联。</div>
                      </div>
                      <button type="button" class="rounded-full bg-blue-50 p-1.5 text-blue-700 ring-1 ring-blue-100 transition hover:bg-blue-100" @click="showAgentMore = false">
                        <X class="h-4 w-4" />
                      </button>
                    </div>

                    <div class="px-5 pb-5 pt-4">
                      <div class="mb-4 flex items-center gap-2 rounded-full border border-blue-100 bg-gradient-to-r from-white to-blue-50/80 px-4 py-2.5 shadow-inner">
                        <Command class="h-4 w-4 text-blue-600" />
                        <input v-model="agentAppQuery" type="search" placeholder="关键字搜索 Agent 应用" class="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400" />
                      </div>

                      <div class="mb-4 flex flex-wrap gap-2">
                        <button
                          v-for="category in appCategoryOptions"
                          :key="category.id"
                          type="button"
                          :class="[
                            'inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium ring-1 transition',
                            activeAppCategory === category.id ? 'bg-blue-600 text-white ring-blue-600 shadow-[0_0.75rem_1.875rem_rgba(37,99,235,0.22)]' : 'bg-blue-50/70 text-slate-700 ring-blue-100 hover:bg-blue-100 hover:text-blue-800'
                          ]"
                          @click="activeAppCategory = category.id"
                        >
                          {{ category.name }}
                        </button>
                      </div>

                      <div class="mb-3 text-xs text-slate-500">
                        {{ activeAppCategoryDesc }}
                      </div>

                      <div class="agent-app-grid max-h-[min(50vh,26.25rem)] overflow-y-auto pr-1">
                        <button
                          v-for="app in filteredAgentApplications"
                          :key="app.id"
                          type="button"
                          class="agent-app-item group flex items-center gap-3 rounded-2xl px-3 py-3 text-left transition hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_1rem_2.5rem_rgba(37,99,235,0.12)]"
                          @click="selectApplication(app)"
                        >
                          <span class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-blue-700 ring-1 ring-blue-100 transition group-hover:bg-gradient-to-br group-hover:from-blue-600 group-hover:to-cyan-400 group-hover:text-white">
                            <component :is="agentIconMap[app.agentType]" class="h-4 w-4" />
                          </span>
                          <span class="min-w-0 flex-1">
                            <span class="block truncate text-sm font-semibold text-slate-950">{{ app.name }}</span>
                            <span class="mt-0.5 block line-clamp-1 text-[0.6875rem] leading-4 text-slate-500">{{ app.desc }}</span>
                          </span>
                        </button>
                        <div v-if="filteredAgentApplications.length === 0" class="col-span-full rounded-2xl bg-blue-50/70 px-4 py-8 text-center text-sm text-slate-500 ring-1 ring-blue-100">
                          没有匹配到应用
                        </div>
                      </div>
                    </div>
                  </div>
                </transition>
              </div>
            </template>
          </div>

          <div v-if="!isMeetingAgent" class="flex shrink-0 items-center gap-2">
            <span class="hidden text-[0.6875rem] text-slate-500 sm:inline">Enter 发送</span>
            <button
              type="button"
              @click="triggerImageUpload"
              :disabled="streaming"
              class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-blue-700 ring-1 ring-blue-100 transition hover:bg-blue-50 disabled:opacity-50"
              title="上传图片进行隐患识图"
            >
              <ImagePlus class="h-4 w-4" />
            </button>
            <button type="button" @click="handleSend" :disabled="!draft.trim() || streaming" class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-[0_0.875rem_2.125rem_rgba(37,99,235,0.28)] transition hover:from-blue-700 hover:to-cyan-600 disabled:opacity-50">
              <Send class="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="dislikeDialogOpen" class="fixed inset-0 z-[420] flex items-center justify-center bg-slate-950/35 px-4 py-6 backdrop-blur-sm" @click.self="closeDislikeDialog">
        <div class="w-full max-w-lg rounded-[1.75rem] border border-blue-100 bg-white p-5 shadow-[0_1.5rem_4.375rem_rgba(15,23,42,0.22)]">
          <div class="flex items-start justify-between gap-4">
            <div>
              <div class="text-base font-semibold text-slate-950">点踩反馈</div>
              <div class="mt-1 text-sm text-slate-500">提交后进入专家共创，反馈类型和原因都保留在本地 mock 数据中。</div>
            </div>
            <button type="button" class="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700" @click="closeDislikeDialog">
              <X class="h-4 w-4" />
            </button>
          </div>

          <div class="mt-5 space-y-4">
            <div>
              <div class="mb-2 text-sm font-medium text-slate-700">反馈类型</div>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="category in dislikeCategories"
                  :key="category"
                  type="button"
                  :class="[
                    'rounded-full px-3 py-1.5 text-xs font-medium ring-1 transition',
                    dislikeCategory === category ? 'bg-blue-600 text-white ring-blue-600' : 'bg-white text-slate-700 ring-slate-200 hover:bg-slate-50'
                  ]"
                  @click="dislikeCategory = category"
                >
                  {{ category }}
                </button>
              </div>
            </div>

            <label class="block">
              <div class="mb-2 text-sm font-medium text-slate-700">点踩原因</div>
              <textarea
                v-model="dislikeReason"
                rows="4"
                class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:bg-white"
                placeholder="请输入为什么点踩，这条回答哪里有问题。"
              />
            </label>

            <div v-if="dislikeError" class="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              {{ dislikeError }}
            </div>
          </div>

          <div class="mt-5 flex justify-end gap-2">
            <button type="button" class="rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200" @click="closeDislikeDialog">取消</button>
            <button type="button" class="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700" @click="submitDislike">提交反馈</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.thinking-shell {
  position: relative;
  margin-bottom: 0.75rem;
  overflow: hidden;
  border: 0.0625rem solid rgba(147, 197, 253, 0.88);
  border-radius: 1.125rem;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(239, 246, 255, 0.82));
  box-shadow: 0 1.125rem 2.875rem rgba(37, 99, 235, 0.10);
}

.thinking-shell::before {
  content: '';
  position: absolute;
  inset: 0 auto 0 0;
  width: 0.25rem;
  background: linear-gradient(180deg, #2563eb, #22d3ee);
}

.thinking-summary {
  position: relative;
  display: flex;
  cursor: pointer;
  list-style: none;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.75rem 0.875rem 0.75rem 1rem;
  user-select: none;
  background: radial-gradient(circle at 16% 0%, rgba(59, 130, 246, 0.12), transparent 34%), rgba(255, 255, 255, 0.72);
}

.thinking-summary::-webkit-details-marker {
  display: none;
}

.thinking-check {
  display: inline-flex;
  height: 1.5rem;
  width: 1.5rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 62.4375rem;
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.14), rgba(34, 211, 238, 0.18));
  color: rgb(37, 99, 235);
  box-shadow: inset 0 0 0 0.0625rem rgba(37, 99, 235, 0.16);
}

.thinking-toggle {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  gap: 0.3125rem;
  border-radius: 62.4375rem;
  background: rgba(255, 255, 255, 0.78);
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  color: rgb(71, 85, 105);
  box-shadow: inset 0 0 0 0.0625rem rgba(203, 213, 225, 0.72);
}

.thinking-shell[open] .thinking-toggle svg {
  transform: rotate(180deg);
}

.thinking-toggle svg {
  transition: transform 0.18s ease;
}

.thinking-steps {
  position: relative;
  display: grid;
  gap: 0.5rem;
  padding: 0 0.75rem 0.8125rem 1.25rem;
}

.thinking-steps::before {
  content: '';
  position: absolute;
  left: 1.8125rem;
  top: 0.375rem;
  bottom: 1.25rem;
  width: 0.0625rem;
  background: linear-gradient(180deg, rgba(37, 99, 235, 0.26), rgba(34, 211, 238, 0.08));
}

.thinking-step {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: flex-start;
  gap: 0.625rem;
  border: 0.0625rem solid rgba(191, 219, 254, 0.78);
  border-radius: 0.875rem;
  background: rgba(255, 255, 255, 0.82);
  padding: 0.5625rem 0.6875rem;
  color: rgb(51, 65, 85);
  font-size: 0.75rem;
  line-height: 1.25rem;
  box-shadow: 0 0.5rem 1.375rem rgba(37, 99, 235, 0.06);
}

.thinking-index {
  margin-top: 0.0625rem;
  display: inline-flex;
  height: 1.25rem;
  min-width: 1.25rem;
  align-items: center;
  justify-content: center;
  border-radius: 62.4375rem;
  background: linear-gradient(135deg, #2563eb, #22d3ee);
  color: white;
  font-size: 0.625rem;
  font-weight: 800;
  box-shadow: 0 0.5rem 1.125rem rgba(37, 99, 235, 0.22);
}

.thinking-step-text {
  min-width: 0;
  flex: 1;
}

.agent-app-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.375rem 0.625rem;
}

.agent-app-grid::-webkit-scrollbar {
  width: 0.375rem;
}

.agent-app-grid::-webkit-scrollbar-thumb {
  border-radius: 62.4375rem;
  background: rgba(147, 197, 253, 0.55);
}

.agent-app-grid::-webkit-scrollbar-track {
  background: transparent;
}

.agent-app-item {
  background: rgba(248, 251, 255, 0.72);
  border: 0.0625rem solid rgba(219, 234, 254, 0.78);
}

.trace-block {
  margin-top: 0.625rem;
  margin-left: 0.5rem;
}

.trace-summary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  border-radius: 0.75rem;
  background: #eff6ff;
  padding: 0.45rem 0.65rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: #2563eb;
}

.trace-summary::-webkit-details-marker {
  display: none;
}

.trace-summary-meta {
  color: #64748b;
  font-weight: 600;
}

.trace-panel {
  margin-top: 0.5rem;
  width: min(34rem, 82vw);
  border-radius: 1rem;
  border: 0.0625rem solid #dbeafe;
  background: white;
  padding: 0.85rem;
  box-shadow: 0 1rem 2.5rem rgba(37, 99, 235, 0.12);
}

.trace-title {
  font-size: 0.75rem;
  font-weight: 700;
  color: #0f172a;
}

.trace-steps {
  margin-top: 0.625rem;
  display: grid;
  gap: 0.5rem;
}

.trace-step {
  border-radius: 0.875rem;
  background: #f8fafc;
  padding: 0.625rem 0.75rem;
}

.trace-step-head {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 0.5rem;
  align-items: center;
}

.trace-step-type {
  border-radius: 999px;
  background: #dbeafe;
  padding: 0.15rem 0.45rem;
  font-size: 0.625rem;
  font-weight: 800;
  color: #1d4ed8;
  text-transform: uppercase;
}

.trace-step-name {
  font-size: 0.75rem;
  font-weight: 700;
  color: #0f172a;
}

.trace-step-latency {
  font-size: 0.6875rem;
  color: #64748b;
}

.trace-step-detail {
  margin-top: 0.35rem;
  font-size: 0.6875rem;
  line-height: 1.35;
  color: #475569;
}


.nl2sql-chart-panel {
  margin-top: 0.875rem;
  border: 0.0625rem solid rgba(191, 219, 254, 0.9);
  border-radius: 1.375rem;
  background: linear-gradient(135deg, rgba(248, 251, 255, 0.96), rgba(239, 246, 255, 0.86));
  padding: 0.875rem;
  box-shadow: 0 1.125rem 2.875rem rgba(37, 99, 235, 0.10);
}

.chart-panel-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.chart-title {
  font-size: 0.875rem;
  font-weight: 850;
  color: #0f172a;
}

.chart-subtitle {
  margin-top: 0.125rem;
  font-size: 0.6875rem;
  color: #64748b;
}

.chart-badge {
  flex-shrink: 0;
  border-radius: 62.4375rem;
  background: #dbeafe;
  color: #1d4ed8;
  padding: 0.25rem 0.5rem;
  font-size: 0.625rem;
  font-weight: 850;
}

.chart-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.625rem;
}

.chart-card {
  border-radius: 1.125rem;
  background: white;
  padding: 0.75rem;
  box-shadow: inset 0 0 0 0.0625rem rgba(219, 234, 254, 0.9);
}

.chart-card-wide {
  grid-column: span 2 / span 2;
}

.chart-card-title {
  margin-bottom: 0.625rem;
  font-size: 0.75rem;
  font-weight: 850;
  color: #334155;
}

.pie-wrap {
  display: flex;
  align-items: center;
  gap: 0.875rem;
}

.pie-chart {
  width: 6.5rem;
  height: 6.5rem;
  flex-shrink: 0;
  border-radius: 62.4375rem;
  background: conic-gradient(#2563eb 0 18.8%, #38bdf8 18.8% 62.6%, #93c5fd 62.6% 100%);
  box-shadow: inset 0 0 0 1rem white, 0 0.75rem 1.625rem rgba(37, 99, 235, 0.14);
}

.pie-legend {
  display: grid;
  gap: 0.4375rem;
  min-width: 0;
  flex: 1;
}

.legend-row {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 0.4375rem;
  font-size: 0.6875rem;
  color: #475569;
}

.legend-row strong {
  color: #0f172a;
}

.legend-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 62.4375rem;
  background: #2563eb;
}

.legend-row:nth-child(2) .legend-dot { background: #38bdf8; }
.legend-row:nth-child(3) .legend-dot { background: #93c5fd; }

.line-chart {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 0.5rem;
  height: 7.375rem;
  border-radius: 0.875rem;
  background: linear-gradient(180deg, #f8fbff, #eef6ff);
  padding: 0.75rem 0.625rem 0.5rem;
  box-shadow: inset 0 0 0 0.0625rem #dbeafe;
}

.line-point {
  position: relative;
  width: 1.5rem;
  min-height: 1.125rem;
  border-radius: 62.4375rem 62.4375rem 0.375rem 0.375rem;
  background: linear-gradient(180deg, #2563eb, #38bdf8);
}

.line-point span {
  position: absolute;
  left: 50%;
  top: -1.25rem;
  transform: translateX(-50%);
  font-size: 0.625rem;
  font-weight: 800;
  color: #2563eb;
}

.line-days {
  margin-top: 0.4375rem;
  display: flex;
  justify-content: space-between;
  gap: 0.375rem;
  font-size: 0.625rem;
  color: #64748b;
}

.bar-list {
  display: grid;
  gap: 0.5625rem;
}

.bar-row {
  display: grid;
  grid-template-columns: 3.375rem 1fr 1.875rem;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.6875rem;
  color: #475569;
}

.bar-track {
  height: 0.625rem;
  overflow: hidden;
  border-radius: 62.4375rem;
  background: #e0f2fe;
}

.bar-fill {
  height: 100%;
  border-radius: 62.4375rem;
  background: linear-gradient(90deg, #2563eb, #38bdf8);
}

.bar-row strong {
  text-align: right;
  color: #0f172a;
}


.meeting-audio-player {
  display: grid;
  grid-template-columns: auto auto auto minmax(7.5rem, 1fr) auto auto;
  align-items: center;
  gap: 0.75rem;
  min-height: 3.625rem;
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.96);
  padding: 0.5rem 0.75rem;
  box-shadow: inset 0 0 0 0.0625rem rgba(199, 210, 254, 0.86), 0 1rem 2.75rem rgba(79, 70, 229, 0.12);
}

.meeting-audio-player.is-recording {
  box-shadow: inset 0 0 0 0.0625rem rgba(129, 140, 248, 0.95), 0 1rem 2.75rem rgba(79, 70, 229, 0.16);
}

.meeting-audio-player.is-paused {
  box-shadow: inset 0 0 0 0.0625rem rgba(165, 180, 252, 0.9), 0 1rem 2.25rem rgba(79, 70, 229, 0.10);
}

.meeting-audio-icon,
.meeting-settings {
  display: inline-flex;
  height: 1.875rem;
  width: 1.875rem;
  align-items: center;
  justify-content: center;
  border-radius: 999rem;
  color: #6366f1;
  transition: background 0.15s ease, color 0.15s ease, transform 0.15s ease;
}

.meeting-audio-icon:hover,
.meeting-settings:hover {
  background: #eef2ff;
  color: #4f46e5;
  transform: translateY(-0.0625rem);
}

.meeting-audio-main {
  display: inline-flex;
  height: 2.625rem;
  width: 2.625rem;
  align-items: center;
  justify-content: center;
  border-radius: 999rem;
  background: #6366f1;
  color: #fff;
  box-shadow: 0 0.875rem 1.875rem rgba(99, 102, 241, 0.28);
  transition: background 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease;
}

.meeting-audio-main:hover {
  background: #4f46e5;
  transform: translateY(-0.0625rem);
  box-shadow: 0 1rem 2.125rem rgba(79, 70, 229, 0.32);
}

.meeting-audio-main:disabled {
  cursor: not-allowed;
  opacity: 0.55;
  transform: none;
}

.meeting-stop-dot {
  display: inline-block;
  height: 0.625rem;
  width: 0.625rem;
  border-radius: 0.1875rem;
  background: #6366f1;
}

.meeting-stop-dot.is-confirm {
  background: #e11d48;
  box-shadow: 0 0 0 0.25rem rgba(225, 29, 72, 0.12);
}

.meeting-wave-area {
  min-width: 0;
  padding: 0.125rem 0 0;
}

.meeting-waveform {
  display: flex;
  height: 1.625rem;
  align-items: center;
  gap: 0.125rem;
  border-radius: 0.75rem;
  background: linear-gradient(180deg, rgba(238, 242, 255, 0.95), rgba(224, 231, 255, 0.74));
  padding: 0.25rem 0.375rem;
  overflow: hidden;
}

.meeting-waveform span {
  display: block;
  min-width: 0.375rem;
  flex: 1 1 0;
  border-radius: 999rem;
  background: linear-gradient(180deg, rgba(129, 140, 248, 0.42), rgba(99, 102, 241, 0.20));
}

.meeting-time-row {
  margin-top: 0.125rem;
  display: flex;
  justify-content: space-between;
  padding: 0 0.125rem;
  font-size: 0.6875rem;
  font-weight: 650;
  line-height: 1;
  color: #94a3b8;
}

.meeting-speed {
  padding: 0.25rem 0.375rem;
  border-radius: 0.625rem;
  color: #4f46e5;
  font-size: 0.75rem;
  font-weight: 750;
  white-space: nowrap;
  transition: background 0.15s ease, color 0.15s ease;
}

.meeting-speed:hover {
  background: #eef2ff;
  color: #4338ca;
}

@media (max-width: 42rem) {
  .meeting-audio-player {
    grid-template-columns: auto auto auto 1fr;
    gap: 0.5rem;
  }
  .meeting-speed,
  .meeting-settings {
    display: none;
  }
  .meeting-waveform span {
    min-width: 0.25rem;
  }
}


@media (max-width: 57.5rem) {
  .agent-app-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 35rem) {
  .agent-app-popover {
    width: calc(100vw - 1rem);
  }
  .agent-app-grid {
    grid-template-columns: 1fr;
  }
  .agent-app-head {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}

</style>
