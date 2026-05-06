declare function defineOptions(arg:any):any;
declare function defineProps<T>():T;
declare function defineEmits<T>():any;

import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { Modal, message } from 'ant-design-vue'
import { Bot, BookOpen, CheckCircle2, Database, FileText, MessageSquare, Settings2 } from 'lucide-vue-next'
import { useSystemStore, type Prompt } from '@/stores/system'
import { useNL2SQLStore } from '@/stores/nl2sql'
import { useReportStore } from '@/stores/report'
import type { DomainTerm, NL2SQLCase, ReportConfig, ReportTemplate } from '@/types/aiPlatform'
import AiMcpManagement from '@/views/ai/settings/aiMcp/index.vue'
import AiKnowledgeBaseList from '@/views/ai/settings/aiknowledge/AiKnowledgeBaseList.vue'
import AIAgentList from '@/views/ai/settings/aiAgent/AiAgentList.vue'

defineOptions({ name: 'SystemSettings' })

type TabKey = 'system-config' | 'skill-manage' | 'knowledge-manage' | 'agent-manage' | 'nl2sql' | 'report-template' | 'report-config'
type Nl2sqlSubTab = 'cases' | 'terms' | 'source'
type PromptModalMode = 'create' | 'edit' | 'view'

const systemStore = useSystemStore()
const nl2sqlStore = useNL2SQLStore()
const reportStore = useReportStore()

const { systemName, tabTitle, tabIcon, logoUrl, prompts } = storeToRefs(systemStore)
const { nl2sqlCases, terms, jdbc } = storeToRefs(nl2sqlStore)
const { templates, configs } = storeToRefs(reportStore)

const activeTab = ref<TabKey>('system-config')
const nl2sqlSubTab = ref<Nl2sqlSubTab>('cases')

const promptModalOpen = ref(false)
const promptModalMode = ref<PromptModalMode>('create')
const promptForm = ref<Prompt>({
  id: '',
  title: '',
  description: '',
  text: '',
  icon: 'MessageSquare',
  category: '通用',
  status: 'enabled',
  sort: 10,
})
const promptKeyword = ref('')

const caseForm = ref<NL2SQLCase>({ id: '', question: '', type: 'Good Case', answer: '', remark: '', updatedAt: '' })
const caseEditingId = ref('')
const termForm = ref<DomainTerm>({ id: '', term: '', aliases: '', explanation: '', domain: '安全生产', updatedAt: '' })
const termEditingId = ref('')
const templateForm = ref<ReportTemplate>({ id: '', name: '', scene: '', content: '', enabled: true, updatedAt: '' })
const templateEditingId = ref('')
const configForm = ref<ReportConfig>({ id: '', section: '', prompt: '', enabled: true, version: 'v1', updatedAt: '' })
const configEditingId = ref('')

const tabs = [
  { key: 'system-config', label: '系统配置', desc: '品牌 / 推荐问题', icon: Settings2 },
  { key: 'skill-manage', label: 'AI 技能管理', desc: 'MCP / Skill', icon: FileText },
  { key: 'knowledge-manage', label: '知识库管理', desc: '知识维护', icon: BookOpen },
  { key: 'agent-manage', label: '智能体管理', desc: '上下架管理', icon: Bot },
  { key: 'nl2sql', label: 'NL2SQL 配置', desc: 'Case / 术语 / 数据源', icon: Database },
  { key: 'report-template', label: '报告模板', desc: '模板管理', icon: FileText },
  { key: 'report-config', label: '内容配置', desc: '段落生成规则', icon: CheckCircle2 },
] as const

function nowText() {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}

const filteredPrompts = computed(() => {
  const keyword = promptKeyword.value.trim().toLowerCase()
  const items = [...prompts.value].sort((a, b) => (a.sort || 0) - (b.sort || 0))
  if (!keyword) return items
  return items.filter(item => `${item.title} ${item.description} ${item.text} ${item.category || ''}`.toLowerCase().includes(keyword))
})

const promptModalTitle = computed(() => {
  if (promptModalMode.value === 'create') return '新增推荐问题'
  if (promptModalMode.value === 'edit') return '编辑推荐问题'
  return '查看推荐问题'
})

const promptReadonly = computed(() => promptModalMode.value === 'view')

function resetPromptForm() {
  promptForm.value = {
    id: '',
    title: '',
    description: '',
    text: '',
    icon: 'MessageSquare',
    category: '通用',
    status: 'enabled',
    sort: (Math.max(0, ...prompts.value.map(item => item.sort || 0)) || 0) + 10,
  }
}

function openCreatePrompt() {
  promptModalMode.value = 'create'
  resetPromptForm()
  promptModalOpen.value = true
}

function openEditPrompt(item: Prompt) {
  promptModalMode.value = 'edit'
  promptForm.value = { ...item, category: item.category || '通用', status: item.status || 'enabled', sort: item.sort || 10 }
  promptModalOpen.value = true
}

function openViewPrompt(item: Prompt) {
  promptModalMode.value = 'view'
  promptForm.value = { ...item, category: item.category || '通用', status: item.status || 'enabled', sort: item.sort || 10 }
  promptModalOpen.value = true
}

function savePrompt() {
  if (!promptForm.value.title.trim()) return message.warning('请输入问题标题')
  if (!promptForm.value.text.trim()) return message.warning('请输入实际问题内容')

  const item: Prompt = {
    ...promptForm.value,
    id: promptForm.value.id || `prompt-${Date.now()}`,
    category: promptForm.value.category || '通用',
    status: promptForm.value.status || 'enabled',
    sort: Number(promptForm.value.sort || 0),
    icon: promptForm.value.icon || 'MessageSquare',
  }

  const idx = prompts.value.findIndex(x => x.id === item.id)
  if (idx === -1) prompts.value.unshift(item)
  else prompts.value.splice(idx, 1, item)

  prompts.value = [...prompts.value].sort((a, b) => (a.sort || 0) - (b.sort || 0))
  promptModalOpen.value = false
  message.success(promptModalMode.value === 'edit' ? '推荐问题已更新' : '推荐问题已新增')
  resetPromptForm()
}

function removePrompt(item: Prompt) {
  Modal.confirm({
    title: '确认删除推荐问题吗？',
    content: `删除后不可恢复：${item.title}`,
    okText: '删除',
    cancelText: '取消',
    okButtonProps: { danger: true },
    onOk: () => {
      prompts.value = prompts.value.filter(x => x.id !== item.id)
      message.success('推荐问题已删除')
    },
  })
}

function saveCase() {
  if (!caseForm.value.question.trim()) return message.warning('请输入问题')
  const item: NL2SQLCase = {
    ...caseForm.value,
    id: caseEditingId.value || `case-${Date.now()}`,
    updatedAt: nowText(),
  }
  const idx = nl2sqlCases.value.findIndex(x => x.id === item.id)
  if (idx === -1) nl2sqlCases.value.unshift(item)
  else nl2sqlCases.value.splice(idx, 1, item)
  resetCase()
  message.success('Case 已保存')
}

function editCase(item: NL2SQLCase) {
  caseEditingId.value = item.id
  caseForm.value = { ...item }
}

function resetCase() {
  caseEditingId.value = ''
  caseForm.value = { id: '', question: '', type: 'Good Case', answer: '', remark: '', updatedAt: '' }
}

function deleteCase(item: NL2SQLCase) {
  Modal.confirm({
    title: '确认删除 Case 吗？',
    content: item.question,
    okText: '删除',
    cancelText: '取消',
    okButtonProps: { danger: true },
    onOk: () => {
      nl2sqlCases.value = nl2sqlCases.value.filter(x => x.id !== item.id)
      if (caseEditingId.value === item.id) resetCase()
      message.success('Case 已删除')
    },
  })
}

function saveTerm() {
  if (!termForm.value.term.trim()) return message.warning('请输入专有名词')
  const item: DomainTerm = {
    ...termForm.value,
    id: termEditingId.value || `term-${Date.now()}`,
    updatedAt: nowText(),
  }
  const idx = terms.value.findIndex(x => x.id === item.id)
  if (idx === -1) terms.value.unshift(item)
  else terms.value.splice(idx, 1, item)
  resetTerm()
  message.success('术语已保存')
}

function editTerm(item: DomainTerm) {
  termEditingId.value = item.id
  termForm.value = { ...item }
}

function resetTerm() {
  termEditingId.value = ''
  termForm.value = { id: '', term: '', aliases: '', explanation: '', domain: '安全生产', updatedAt: '' }
}

function deleteTerm(item: DomainTerm) {
  Modal.confirm({
    title: '确认删除术语吗？',
    content: item.term,
    okText: '删除',
    cancelText: '取消',
    okButtonProps: { danger: true },
    onOk: () => {
      terms.value = terms.value.filter(x => x.id !== item.id)
      if (termEditingId.value === item.id) resetTerm()
      message.success('术语已删除')
    },
  })
}

function saveTemplate() {
  if (!templateForm.value.name.trim()) return message.warning('请输入模板名称')
  const item: ReportTemplate = {
    ...templateForm.value,
    id: templateEditingId.value || `tpl-${Date.now()}`,
    updatedAt: nowText(),
  }
  const idx = templates.value.findIndex(x => x.id === item.id)
  if (idx === -1) templates.value.unshift(item)
  else templates.value.splice(idx, 1, item)
  resetTemplate()
  message.success('模板已保存')
}

function editTemplate(item: ReportTemplate) {
  templateEditingId.value = item.id
  templateForm.value = { ...item }
}

function resetTemplate() {
  templateEditingId.value = ''
  templateForm.value = { id: '', name: '', scene: '', content: '', enabled: true, updatedAt: '' }
}

function deleteTemplate(item: ReportTemplate) {
  Modal.confirm({
    title: '确认删除模板吗？',
    content: item.name,
    okText: '删除',
    cancelText: '取消',
    okButtonProps: { danger: true },
    onOk: () => {
      templates.value = templates.value.filter(x => x.id !== item.id)
      if (templateEditingId.value === item.id) resetTemplate()
      message.success('模板已删除')
    },
  })
}

function saveConfig() {
  if (!configForm.value.section.trim()) return message.warning('请输入段落名称')
  if (!configForm.value.prompt.trim()) return message.warning('请输入 Prompt 规则')
  const item: ReportConfig = {
    ...configForm.value,
    id: configEditingId.value || `cfg-${Date.now()}`,
    updatedAt: nowText(),
  }
  const idx = configs.value.findIndex(x => x.id === item.id)
  if (idx === -1) configs.value.unshift(item)
  else configs.value.splice(idx, 1, item)
  resetConfig()
  message.success('内容配置已保存')
}

function editConfig(item: ReportConfig) {
  configEditingId.value = item.id
  configForm.value = { ...item }
}

function resetConfig() {
  configEditingId.value = ''
  configForm.value = { id: '', section: '', prompt: '', enabled: true, version: 'v1', updatedAt: '' }
}

function deleteConfig(item: ReportConfig) {
  Modal.confirm({
    title: '确认删除内容配置吗？',
    content: item.section,
    okText: '删除',
    cancelText: '取消',
    okButtonProps: { danger: true },
    onOk: () => {
      configs.value = configs.value.filter(x => x.id !== item.id)
      if (configEditingId.value === item.id) resetConfig()
      message.success('内容配置已删除')
    },
  })
}
