declare function defineOptions(arg:any):any;
declare function defineProps<T>():T;
declare function defineEmits<T>():any;

import { ref, watch, nextTick, computed, onBeforeUnmount } from 'vue'
import { Send, Sparkles, Menu, ImagePlus, X, ChevronDown, FileText, Database, MessageSquare, BookOpen, ShieldAlert, CheckCircle2, Loader2, Command, MoreHorizontal, Play, Pause, Square, Mic } from 'lucide-vue-next'
import type { AgentOption, AgentType, Conversation } from '@/stores/aiApp'
import WelcomeScreen from '@/components/aiApp/WelcomeScreen.vue'
import Nl2sqlChartPanel from '@/components/aiApp/Nl2sqlChartPanel.vue'

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
const listRef = ref<HTMLDivElement | null>(null)
const showAgentMore = ref(false)
const agentAppQuery = ref('')
const activeAppCategory = ref('common')
const selectedApplication = ref<{ name: string; desc: string; agentType: AgentType } | null>(null)

const activeAgentType = computed(() => props.conversation?.agentType || props.selectedAgent)
const isMeetingAgent = computed(() => activeAgentType.value === 'meeting')
const deepThinking = computed({
  get: () => props.thinkingMode && !isMeetingAgent.value,
  set: (v: boolean) => {
    if (!isMeetingAgent.value) emit('toggle-thinking', v)
  },
})

const currentAgent = computed<AgentOption>(() => props.agents.find(a => a.id === activeAgentType.value) || { id: 'general', name: '通用助手', desc: '安全生产问答、方案梳理、材料润色', badge: 'Chat' })
const displayApplicationName = computed(() => selectedApplication.value?.name || currentAgent.value.name)
const displayApplicationDesc = computed(() => selectedApplication.value?.desc || currentAgent.value.desc)
const isReportAgent = computed(() => activeAgentType.value === 'report')
const isDocumentAgent = computed(() => activeAgentType.value === 'document')
const isNl2sqlAgent = computed(() => activeAgentType.value === 'nl2sql')
const quickAgents = computed(() => props.agents.slice(0, 4))
const hasMoreAgents = computed(() => props.agents.length > 4)

const maxRecordingSeconds = 30 * 60
const recordingState = ref<'idle' | 'recording' | 'paused'>('idle')
const recordingSeconds = ref(0)
const stopConfirming = ref(false)
let recordingTimer: ReturnType<typeof setInterval> | null = null
let stopConfirmTimer: ReturnType<typeof setTimeout> | null = null

const hasMeetingOutput = computed(() => Boolean(props.conversation?.reportDocuments?.length || props.conversation?.reportStatus === 'generating' || props.conversation?.reportStatus === 'done'))
const hasDocumentCards = computed(() => (isReportAgent.value || isDocumentAgent.value) && Boolean(props.conversation?.reportDocuments?.length))
const activeDocumentId = computed(() => props.conversation?.activeReportDocumentId || props.conversation?.reportDocuments?.[0]?.id || '')
const meetingControlLabel = computed(() => recordingState.value === 'recording' ? '暂停' : '启动')
const meetingDurationLabel = computed(() => `${formatDuration(recordingSeconds.value)} / ${formatDuration(maxRecordingSeconds)}`)
const meetingStatusLabel = computed(() => {
  if (recordingState.value === 'recording') return '录音中'
  if (recordingState.value === 'paused') return '已暂停'
  return '未录音'
})

const showThinkingUi = computed(() => !isMeetingAgent.value)

const appCategoryOptions = [
  { id: 'common', name: '安全生产知识', desc: '聚焦安全生产知识、制度规程、事故案例与化工生产场景咨询类应用' },
  { id: 'analysis', name: '智能文书', desc: '聚焦安全生产文书、生产制造文书与信息咨询文书类应用' },
  { id: 'modeling', name: 'AI 智能体', desc: '聚焦智能问数、隐患识别、会议纪要等智能体应用' },
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
  { id: 'knowledge-qa', name: '安全生产助手', desc: '基于安全生产知识、制度规程与案例进行问答', category: 'common', agentType: 'rag', tag: '知识' },
  { id: 'safety-agent', name: '安全生产智能体', desc: '面向安全生产场景提供知识咨询与流程建议', category: 'common', agentType: 'general', tag: '助手' },
  { id: 'chemical-production-assistant', name: '化工生产助手', desc: '围绕化工生产流程、装置与工艺场景提供知识咨询', category: 'common', agentType: 'rag', tag: '化工' },
  { id: 'regulation-assistant', name: '法规制度助手', desc: '聚焦法规条款、制度规范与操作要求检索', category: 'common', agentType: 'rag', tag: '法规' },

  { id: 'data-report', name: '安全生产文书', desc: '生成安全生产场景下的标准文书与报告', category: 'analysis', agentType: 'report', tag: '文书' },
  { id: 'production-doc', name: '生产制造文书', desc: '围绕生产制造过程生成记录、说明与汇报文书', category: 'analysis', agentType: 'document', tag: '制造' },
  { id: 'info-consult-doc', name: '信息咨询文书', desc: '面向咨询、汇报和答复场景生成信息类文书', category: 'analysis', agentType: 'document', tag: '咨询' },

  { id: 'smart-query', name: '智能问数智能体', desc: '面向业务数据进行自然语言问数与指标查询', category: 'modeling', agentType: 'nl2sql', tag: '问数' },
  { id: 'hazard-vision', name: '隐患识别智能体', desc: '上传现场图片识别隐患并给出整改建议', category: 'modeling', agentType: 'hazard', tag: '识别' },
  { id: 'meeting-minutes', name: '会议纪要智能体', desc: '录音转写并生成摘要、纪要与待办', category: 'modeling', agentType: 'meeting', tag: '会议' },
  { id: 'document-writing', name: '文档编写智能体', desc: '根据问题生成结构化文档和正文预览', category: 'modeling', agentType: 'document', tag: '文档' },
]

const activeAppCategoryDesc = computed(() => appCategoryOptions.find(item => item.id === activeAppCategory.value)?.desc || '')

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

function resetMeetingRecorder() {
  stopRecordingTimer()
  stopStopConfirmTimer()
  recordingState.value = 'idle'
  recordingSeconds.value = 0
  stopConfirming.value = false
}

function stopMeetingRecording(resetDuration = false) {
  stopRecordingTimer()
  stopStopConfirmTimer()
  recordingState.value = 'idle'
  stopConfirming.value = false
  if (resetDuration) recordingSeconds.value = 0
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
    startRecordingTimer()
    return
  }

  recordingSeconds.value = 0
  recordingState.value = 'recording'
  startRecordingTimer()

  if (!hasMeetingOutput.value) {
    const topic = draft.value.trim() || '开始录音并生成本次项目同步会会议纪要'
    emit('send', topic)
    if (draft.value.trim()) draft.value = ''
  }
}

function handleStopMeetingRecording() {
  if (!isMeetingAgent.value || recordingState.value === 'idle') return
  if (!stopConfirming.value) {
    requestStopConfirmation()
    return
  }
  stopMeetingRecording()
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
  if (slashCommand) {
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
