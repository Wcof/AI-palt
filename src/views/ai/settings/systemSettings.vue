<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { BarChart3, BookMarked, Boxes, Crown, Database, History, Layers3, Plus, RefreshCw, Search, ServerCrash, Settings, ShieldCheck, Trash2, Wifi, X } from 'lucide-vue-next'
import PageFrame from '@/components/newAI/PageFrame.vue'
import { moduleLabelMap, useNewAIStore, type CoCreationStatus, type FeatureCode, type ModuleCode, type ModuleSelections } from '@/stores/newAI'
import { useWorkbenchAppsStore } from '@/stores/workbenchApps'
import { coCreationStatusOptions, coCreationTypeOptions, filterCoCreationRows, type CoCreationStatusFilter, type CoCreationTypeFilter } from './coCreationFilters'

defineOptions({ name: 'SystemSettings' })

type TabKey = 'versions' | 'license' | 'quota' | 'sessions' | 'models' | 'samples' | 'audit' | 'metrics' | 'ledger' | 'backup'

const route = useRoute()
const router = useRouter()
const store = useNewAIStore()
const appsStore = useWorkbenchAppsStore()
const tabs = [
  { key: 'versions', label: '版本管理', icon: Layers3 },
  { key: 'license', label: 'License 管理', icon: Crown },
  { key: 'quota', label: '成员与额度', icon: Boxes },
  { key: 'sessions', label: '会话管理', icon: ShieldCheck },
  { key: 'models', label: '模型配置', icon: Database },
  { key: 'samples', label: '反馈列表', icon: BookMarked },
  { key: 'audit', label: '审计日志', icon: History },
  { key: 'metrics', label: '用量分析', icon: BarChart3 },
  { key: 'ledger', label: '资产流水', icon: Database },
  { key: 'backup', label: '备份与容灾', icon: ServerCrash },
] as const
const validTabs = tabs.map(item => item.key) as TabKey[]
const activeTab = computed<TabKey>(() => {
  const value = Array.isArray(route.query.tab) ? route.query.tab[0] : route.query.tab
  return validTabs.includes(value as TabKey) ? (value as TabKey) : 'versions'
})

const coCreationStatuses: CoCreationStatus[] = ['待处置', '已采纳', '误判', '已搁置']
const allFeatureOptions: Array<{ code: FeatureCode; label: string }> = [
  { code: 'assistant', label: 'AI 助手' },
  { code: 'knowledge', label: 'AI 知识库' },
  { code: 'agent', label: 'AI 智能体' },
  { code: 'mcp', label: 'AI 技能' },
  { code: 'apiKey', label: 'API 密钥' },
  { code: 'system', label: '系统设置' },
  { code: 'ocr', label: 'OCR 能力' },
  { code: 'modelSwitch', label: '模型切换' },
]
const moduleSelectionOptions: Record<ModuleCode, string[]> = {
  agent: ['智能问答', '隐患视图', '智能问数'],
  mcp: ['智能体问答', 'OCR识别', '人脸算法'],
}
const versionDialogOpen = ref(false)
const licenseDialogOpen = ref(false)
const templateForm = ref({
  name: '新版本',
  desc: '',
  modules: [] as ModuleCode[],
  moduleSelections: {
    agent: [],
    mcp: [],
  } as ModuleSelections,
})
const licenseForm = ref({
  templateId: store.licenseTemplates[0]?.id || '',
  validFrom: '2026-06-01',
  validTo: '2026-12-31',
  effectiveFeatures: [...(store.licenseTemplates[0]?.features || ['assistant', 'agent'])] as FeatureCode[],
})
const modelDialogOpen = ref(false)
const modelDialogError = ref('')
const modelSourceTab = ref<'vendor' | 'local'>('vendor')
const modelForm = ref({
  name: '',
  protocol: 'OpenAI' as 'OpenAI',
  provider: '',
  token: '',
  endpoint: '',
  model: '',
  modelPath: '',
  mmprojModelPath: '',
  imagePrecisionText: '',
  ctxSize: 262144,
})
const modelQueryLoading = ref(false)
const modelQueryError = ref('')
const queriedModelOptions = ref<string[]>([])
const modelQuery = ref('')
const coCreationQuery = ref('')
const coCreationTypeFilter = ref<CoCreationTypeFilter>('all')
const coCreationStatusFilter = ref<CoCreationStatusFilter>('all')
const auditQuery = ref('')
const auditTimeFilter = ref<'all' | 'today' | '7d' | '30d'>('all')
const auditStatusFilter = ref<'all' | 'success' | 'fail'>('all')
const usageKeyQuery = ref('')
const usageRange = ref<'today' | '7d' | '30d'>('7d')
const expandedUsageKeys = ref<string[]>([])
const disposalDialogOpen = ref(false)
const selectedCoCreationId = ref('')
const selectedCoCreationStatus = ref<CoCreationStatus>('待处置')
const quotaTenantQuery = ref('')
const quotaUserQuery = ref('')
const quotaManageError = ref('')
const sessionQuery = ref('')
const sessionStatusFilter = ref<'all' | '正常' | '待复核' | '已冻结' | '已清理'>('all')
const storagePolicyDialogOpen = ref(false)
const ledgerQuery = ref('')
const enterpriseQuotaForm = ref({
  requestLimit: store.enterpriseQuotaPlan.requestLimit,
  tokenLimit: store.enterpriseQuotaPlan.tokenLimit,
  storageLimitGb: store.enterpriseQuotaPlan.storageLimitGb,
  validFrom: store.enterpriseQuotaPlan.validFrom,
  validTo: store.enterpriseQuotaPlan.validTo,
  warningThreshold: store.enterpriseQuotaPlan.warningThreshold,
  overageMode: store.enterpriseQuotaPlan.overageMode,
})
type TenantDraft = { tenantName: string; tenantCode: string; ownerName: string; status: 'active' | 'disabled' }
type UserQuotaDraft = { userName: string; department: string; tenantId: string; role: string; accountStatus: 'active' | 'disabled'; requestLimit: number; tokenLimit: number; storageLimitGb: number }
const tenantDrafts = ref<Record<string, TenantDraft>>(Object.fromEntries(
  store.tenantRecords.map(item => [item.id, { tenantName: item.tenantName, tenantCode: item.tenantCode, ownerName: item.ownerName, status: item.status }]),
))
const newTenantDraft = ref<TenantDraft>({ tenantName: '', tenantCode: '', ownerName: '', status: 'active' })
const userQuotaDrafts = ref<Record<string, UserQuotaDraft>>(Object.fromEntries(
  store.userQuotaAllocations.map(item => [item.id, { userName: item.userName, department: item.department, tenantId: item.tenantId, role: item.role, accountStatus: item.accountStatus, requestLimit: item.requestLimit, tokenLimit: item.tokenLimit, storageLimitGb: item.storageLimitGb }]),
))
const newUserQuotaDraft = ref<UserQuotaDraft>({ userName: '', department: '', tenantId: store.tenantRecords[0]?.id || '', role: '业务使用者', accountStatus: 'active', requestLimit: 0, tokenLimit: 0, storageLimitGb: 0 })
const storagePolicyDrafts = ref<Record<string, { retentionDays: number; cleanupMode: 'auto' | 'manual'; archiveBeforeDelete: boolean }>>({})

const usageRangeFactorMap = {
  today: 0.14,
  '7d': 0.62,
  '30d': 1,
} as const

const filteredModels = computed(() => {
  const query = modelQuery.value.trim().toLowerCase()
  const rows = [...store.models].sort((a, b) => Number(b.locked) - Number(a.locked))
  if (!query) return rows
  return rows.filter(item => [item.name, item.vendor, item.provider, item.protocol, item.model, item.endpoint].filter(Boolean).join(' ').toLowerCase().includes(query))
})
const filteredCoCreationRows = computed(() => {
  return filterCoCreationRows(store.coCreationEntries, coCreationTypeFilter.value, coCreationStatusFilter.value, coCreationQuery.value)
})
const filteredAuditRows = computed(() => {
  let rows = store.auditLogs
  // 时间筛选
  if (auditTimeFilter.value !== 'all') {
    const now = Date.now()
    const ranges = { today: 86_400_000, '7d': 7 * 86_400_000, '30d': 30 * 86_400_000 }
    const cutoff = now - ranges[auditTimeFilter.value]
    rows = rows.filter(item => item.time >= cutoff)
  }
  // 状态筛选
  if (auditStatusFilter.value === 'success') rows = rows.filter(item => item.success)
  if (auditStatusFilter.value === 'fail') rows = rows.filter(item => !item.success)
  // 关键词搜索
  const query = auditQuery.value.trim().toLowerCase()
  if (query) rows = rows.filter(item => [item.user, item.agent, item.ip, item.requestParams, item.responseData].join(' ').toLowerCase().includes(query))
  return rows
})
const usageOverviewDisplay = computed(() => {
  const factor = usageRangeFactorMap[usageRange.value]
  return {
    totalRequests: Math.round(store.usageOverview.totalRequests * factor),
    totalTokens: Math.round(store.usageOverview.totalTokens * factor),
    totalUsers: Math.max(1, Math.round(store.usageOverview.totalUsers * Math.min(1, factor + 0.18))),
  }
})
const filteredUsageKeyRows = computed(() => {
  const factor = usageRangeFactorMap[usageRange.value]
  const query = usageKeyQuery.value.trim().toLowerCase()
  const rows = store.usageByKey.map(item => ({
    ...item,
    requests: Math.round(item.requests * factor),
    tokens: Math.round(item.tokens * factor),
    skills: item.skills.map(skill => ({ ...skill, requests: Math.round(skill.requests * factor) })).sort((a, b) => b.requests - a.requests),
  }))
  if (!query) return rows
  return rows.filter(item => [item.keyName, item.owner, ...item.skills.map(skill => skill.skill)].join(' ').toLowerCase().includes(query))
})
const usageTableRows = computed(() => {
  const totalRow = {
    id: 'all',
    keyName: '全部',
    owner: '全部',
    skill: '全部',
    requests: usageOverviewDisplay.value.totalRequests,
    tokens: usageOverviewDisplay.value.totalTokens,
    expandable: false,
    level: 0,
  }
  const keyRows = filteredUsageKeyRows.value.flatMap((item) => {
    const parent = {
      id: item.id,
      keyName: item.keyName,
      owner: item.owner,
      skill: '全部',
      requests: item.requests,
      tokens: item.tokens,
      expandable: true,
      level: 0,
    }
    const children = expandedUsageKeys.value.includes(item.id)
      ? item.skills.map((skill, index) => ({
          id: `${item.id}-${index}`,
          keyName: item.keyName,
          owner: item.owner,
          skill: skill.skill,
          requests: skill.requests,
          tokens: Math.round((item.tokens * skill.requests) / Math.max(item.requests, 1)),
          expandable: false,
          level: 1,
        }))
      : []
    return [parent, ...children]
  })
  return [totalRow, ...keyRows]
})
const selectedCoCreationEntry = computed(() => store.coCreationEntries.find(item => item.id === selectedCoCreationId.value) || null)
const nowMs = ref(Date.now())
let backupTimer: ReturnType<typeof setInterval> | null = null

const backupRemainingSeconds = computed(() => {
  if (!store.backupJobEndsAt) return 0
  return Math.max(0, Math.ceil((store.backupJobEndsAt - nowMs.value) / 1000))
})
const backupInProgress = computed(() => backupRemainingSeconds.value > 0)
const backupCountdownLabel = computed(() => {
  const total = backupRemainingSeconds.value
  const mins = Math.floor(total / 60).toString().padStart(2, '0')
  const secs = (total % 60).toString().padStart(2, '0')
  return `${mins}:${secs}`
})
const filteredQuotaUsers = computed(() => {
  const query = quotaUserQuery.value.trim().toLowerCase()
  if (!query) return store.userQuotaAllocations
  return store.userQuotaAllocations.filter(item => [item.userName, item.department, item.tenantName, item.role, item.accountStatus, item.status].join(' ').toLowerCase().includes(query))
})
const filteredQuotaTenants = computed(() => {
  const query = quotaTenantQuery.value.trim().toLowerCase()
  if (!query) return store.tenantRecords
  return store.tenantRecords.filter(item => [item.tenantName, item.tenantCode, item.ownerName, item.status].join(' ').toLowerCase().includes(query))
})
const filteredSessions = computed(() => {
  const query = sessionQuery.value.trim().toLowerCase()
  return store.sessionGovernanceRecords.filter(item => {
    const statusMatched = sessionStatusFilter.value === 'all' || item.status === sessionStatusFilter.value
    if (!statusMatched) return false
    if (!query) return true
    return [item.sessionId, item.userName, item.department, item.agentName, item.topic, item.status].join(' ').toLowerCase().includes(query)
  })
})
const filteredLedgerRecords = computed(() => {
  const query = ledgerQuery.value.trim().toLowerCase()
  if (!query) return store.assetLedgerRecords
  return store.assetLedgerRecords.filter(item => [item.businessNo, item.accountName, item.assetType, item.source, item.remark].join(' ').toLowerCase().includes(query))
})

function switchTab(tab: TabKey) {
  router.replace({ path: '/newAI/system', query: { ...route.query, tab } })
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleString('zh-CN', { hour12: false })
}

function startBackup() {
  store.startBackupNow()
}

function syncGovernanceForms() {
  enterpriseQuotaForm.value = {
    requestLimit: store.enterpriseQuotaPlan.requestLimit,
    tokenLimit: store.enterpriseQuotaPlan.tokenLimit,
    storageLimitGb: store.enterpriseQuotaPlan.storageLimitGb,
    validFrom: store.enterpriseQuotaPlan.validFrom,
    validTo: store.enterpriseQuotaPlan.validTo,
    warningThreshold: store.enterpriseQuotaPlan.warningThreshold,
    overageMode: store.enterpriseQuotaPlan.overageMode,
  }
  tenantDrafts.value = Object.fromEntries(
    store.tenantRecords.map(item => [item.id, {
      tenantName: item.tenantName,
      tenantCode: item.tenantCode,
      ownerName: item.ownerName,
      status: item.status,
    }]),
  )
  userQuotaDrafts.value = Object.fromEntries(
    store.userQuotaAllocations.map(item => [item.id, {
      userName: item.userName,
      department: item.department,
      tenantId: item.tenantId,
      role: item.role,
      accountStatus: item.accountStatus,
      requestLimit: item.requestLimit,
      tokenLimit: item.tokenLimit,
      storageLimitGb: item.storageLimitGb,
    }]),
  )
  storagePolicyDrafts.value = Object.fromEntries(
    store.storagePolicies.map(item => [item.id, {
      retentionDays: item.retentionDays,
      cleanupMode: item.cleanupMode,
      archiveBeforeDelete: item.archiveBeforeDelete,
    }]),
  )
}

function saveEnterpriseQuota() {
  store.updateEnterpriseQuota({ ...enterpriseQuotaForm.value })
  syncGovernanceForms()
}

function saveUserQuota(id: string) {
  const draft = userQuotaDrafts.value[id]
  if (!draft) return
  quotaManageError.value = ''
  const saved = store.updateUserQuotaAllocation({ id, ...draft })
  if (!saved) quotaManageError.value = '用户额度不能超过企业总额度，请调整后再保存。'
  syncGovernanceForms()
}

function createTenant() {
  quotaManageError.value = ''
  const created = store.upsertTenantRecord({ ...newTenantDraft.value })
  if (!created) {
    quotaManageError.value = '请先填写租户名称。'
    return
  }
  newTenantDraft.value = { tenantName: '', tenantCode: '', ownerName: '', status: 'active' }
  syncGovernanceForms()
}

function saveTenant(id: string) {
  const draft = tenantDrafts.value[id]
  if (!draft) return
  store.upsertTenantRecord({ id, ...draft })
  syncGovernanceForms()
}

function removeTenant(id: string) {
  store.removeTenantRecord(id)
  syncGovernanceForms()
}

function createUserQuota() {
  quotaManageError.value = ''
  const tenantId = newUserQuotaDraft.value.tenantId || store.tenantRecords[0]?.id || ''
  const created = store.createUserQuotaAllocation({ ...newUserQuotaDraft.value, tenantId })
  if (!created) {
    quotaManageError.value = '请填写成员姓名，并确保分配额度不超过企业总额度。'
    return
  }
  newUserQuotaDraft.value = { userName: '', department: '', tenantId: '', role: '业务使用者', accountStatus: 'active', requestLimit: 0, tokenLimit: 0, storageLimitGb: 0 }
  syncGovernanceForms()
}

function removeUserQuota(id: string) {
  store.removeUserQuotaAllocation(id)
  syncGovernanceForms()
}

function saveStoragePolicy(id: string) {
  const draft = storagePolicyDrafts.value[id]
  if (!draft) return
  store.updateStoragePolicy(id, { ...draft })
  syncGovernanceForms()
}

function openStoragePolicyDialog() {
  storagePolicyDialogOpen.value = true
}

function closeStoragePolicyDialog() {
  storagePolicyDialogOpen.value = false
}

function sessionRiskClass(level: '低' | '中' | '高') {
  if (level === '高') return 'bg-rose-50 text-rose-700 ring-rose-200'
  if (level === '中') return 'bg-amber-50 text-amber-700 ring-amber-200'
  return 'bg-emerald-50 text-emerald-700 ring-emerald-200'
}

function sessionStatusClass(status: '正常' | '待复核' | '已冻结' | '已清理') {
  if (status === '待复核') return 'bg-amber-50 text-amber-700 ring-amber-200'
  if (status === '已冻结') return 'bg-rose-50 text-rose-700 ring-rose-200'
  if (status === '已清理') return 'bg-slate-100 text-slate-600 ring-slate-200'
  return 'bg-emerald-50 text-emerald-700 ring-emerald-200'
}

function quotaStatusClass(status: 'normal' | 'warning' | 'exceeded') {
  if (status === 'warning') return 'bg-amber-50 text-amber-700 ring-amber-200'
  if (status === 'exceeded') return 'bg-rose-50 text-rose-700 ring-rose-200'
  return 'bg-emerald-50 text-emerald-700 ring-emerald-200'
}

function quotaStatusText(status: 'normal' | 'warning' | 'exceeded') {
  if (status === 'warning') return '超额预警'
  if (status === 'exceeded') return '已超额'
  return '正常'
}

function percentText(value: number) {
  return `${Math.round(value * 100)}%`
}

function toggleFeature(list: FeatureCode[], code: FeatureCode) {
  const idx = list.indexOf(code)
  if (idx >= 0) list.splice(idx, 1)
  else list.push(code)
}

function toggleModuleSelection(module: ModuleCode, value: string) {
  const list = templateForm.value.moduleSelections[module]
  const index = list.indexOf(value)
  if (index >= 0) {
    list.splice(index, 1)
    return
  }
  list.push(value)
}

function applyTemplateToLicenseForm(templateId: string) {
  const template = store.licenseTemplates.find(item => item.id === templateId)
  if (!template) return
  licenseForm.value.templateId = templateId
  licenseForm.value.effectiveFeatures = [...template.features]
}

function createTemplate() {
  const normalizedSelections: ModuleSelections = {
    agent: [...templateForm.value.moduleSelections.agent],
    mcp: [...templateForm.value.moduleSelections.mcp],
  }
  const modules: ModuleCode[] = [
    ...(normalizedSelections.agent.length ? ['agent' as ModuleCode] : []),
    ...(normalizedSelections.mcp.length ? ['mcp' as ModuleCode] : []),
  ]
  const template = store.upsertLicenseTemplateByModules({
    name: templateForm.value.name.trim() || '未命名版本',
    desc: templateForm.value.desc.trim() || '未补充版本说明',
    modules,
    moduleSelections: normalizedSelections,
  })
  if (!template) return
  closeVersionDialog()
}

function createLicense() {
  store.createLicenseInstance({
    templateId: licenseForm.value.templateId,
    validFrom: licenseForm.value.validFrom,
    validTo: licenseForm.value.validTo,
    effectiveFeatures: licenseForm.value.effectiveFeatures,
  })
  closeLicenseDialog()
}

function resetTemplateForm() {
  templateForm.value = {
    name: '新版本',
    desc: '',
    modules: [],
    moduleSelections: {
      agent: [],
      mcp: [],
    },
  }
}

function openVersionDialog() {
  resetTemplateForm()
  versionDialogOpen.value = true
}

function closeVersionDialog() {
  versionDialogOpen.value = false
}

function resetLicenseForm() {
  licenseForm.value = {
    templateId: store.licenseTemplates[0]?.id || '',
    validFrom: '2026-06-01',
    validTo: '2026-12-31',
    effectiveFeatures: [...(store.licenseTemplates[0]?.features || ['assistant', 'agent'])],
  }
}

function openLicenseDialog() {
  resetLicenseForm()
  licenseDialogOpen.value = true
}

function closeLicenseDialog() {
  licenseDialogOpen.value = false
}

function resetModelForm() {
  modelSourceTab.value = 'vendor'
  modelForm.value = {
    name: '',
    protocol: 'OpenAI',
    provider: '',
    token: '',
    endpoint: '',
    model: '',
    modelPath: '',
    mmprojModelPath: '',
    imagePrecisionText: '',
    ctxSize: 262144,
  }
  modelDialogError.value = ''
  modelQueryError.value = ''
  queriedModelOptions.value = []
}

function openModelDialog() {
  resetModelForm()
  modelDialogOpen.value = true
}

function closeModelDialog() {
  modelDialogOpen.value = false
  modelDialogError.value = ''
}

function saveModelConfig() {
  if (!modelForm.value.name.trim() || !modelForm.value.endpoint.trim() || !modelForm.value.model.trim()) {
    modelDialogError.value = '请完整填写供应商名称、请求地址和模型名称。'
    return
  }
  const imagePrecision = modelForm.value.imagePrecisionText
    .split(/[,，\s]+/)
    .map(s => Number(s.trim()))
    .filter(n => !isNaN(n) && n > 0)
  store.addModelConfig({
    source: modelSourceTab.value,
    name: modelForm.value.name,
    protocol: modelForm.value.protocol,
    provider: modelForm.value.provider,
    token: modelForm.value.token,
    endpoint: modelForm.value.endpoint,
    model: modelForm.value.model,
    modelPath: modelForm.value.modelPath,
    mmprojModelPath: modelForm.value.mmprojModelPath,
    imagePrecision,
    ctxSize: modelForm.value.ctxSize,
  })
  closeModelDialog()
}

const MOCK_MODELS = ['gemma-4-26b-a4b-it', 'GPT-5.5', 'Opus 4.8', 'Fable 5', 'GLM-5.2']

function queryModels() {
  modelQueryLoading.value = true
  modelQueryError.value = ''
  queriedModelOptions.value = []
  setTimeout(() => {
    queriedModelOptions.value = [...MOCK_MODELS]
    modelQueryLoading.value = false
  }, 600)
}

function testModel(modelId: string) {
  store.testModelConnection(modelId)
}

function removeModel(modelId: string) {
  store.removeModel(modelId)
}

function modelStatusText(status?: 'success' | 'failed' | 'untested') {
  if (status === 'success') return '测试成功'
  if (status === 'failed') return '测试失败'
  return '未测试'
}

function modelStatusClass(status?: 'success' | 'failed' | 'untested') {
  if (status === 'success') return 'bg-emerald-50 text-emerald-700 ring-emerald-200'
  if (status === 'failed') return 'bg-rose-50 text-rose-700 ring-rose-200'
  return 'bg-slate-100 text-slate-600 ring-slate-200'
}

function coCreationStatusClass(status: CoCreationStatus) {
  if (status === '已采纳') return 'bg-emerald-50 text-emerald-700 ring-emerald-200'
  if (status === '误判') return 'bg-rose-50 text-rose-700 ring-rose-200'
  if (status === '已搁置') return 'bg-slate-100 text-slate-600 ring-slate-200'
  return 'bg-amber-50 text-amber-700 ring-amber-200'
}

function openDisposalDialog(id: string, status: CoCreationStatus) {
  selectedCoCreationId.value = id
  selectedCoCreationStatus.value = status
  disposalDialogOpen.value = true
}

function closeDisposalDialog() {
  disposalDialogOpen.value = false
  selectedCoCreationId.value = ''
}

function submitCoCreationDisposal() {
  if (!selectedCoCreationId.value) return
  store.updateCoCreationStatus(selectedCoCreationId.value, selectedCoCreationStatus.value)
  closeDisposalDialog()
}

function formatContextPreview(messages: Array<{ role: 'user' | 'assistant'; content: string }>) {
  return messages
    .map(item => `${item.role === 'user' ? '问' : '答'}：${item.content}`)
    .join('\n')
}

function toggleUsageKey(id: string) {
  const index = expandedUsageKeys.value.indexOf(id)
  if (index >= 0) expandedUsageKeys.value.splice(index, 1)
  else expandedUsageKeys.value.push(id)
}

function coCreationTypeText(action: 'like' | 'dislike') {
  return action === 'like' ? '点赞' : '点踩'
}

function licenseStatusText(status: 'active' | 'disabled' | 'expired' | 'draft') {
  if (status === 'active') return '启用'
  if (status === 'disabled') return '禁用'
  if (status === 'expired') return '已过期'
  return '草稿'
}

function licenseStatusClass(status: 'active' | 'disabled' | 'expired' | 'draft') {
  if (status === 'active') return 'bg-emerald-50 text-emerald-700 ring-emerald-200'
  if (status === 'disabled') return 'bg-slate-100 text-slate-600 ring-slate-200'
  if (status === 'expired') return 'bg-amber-50 text-amber-700 ring-amber-200'
  return 'bg-blue-50 text-blue-700 ring-blue-200'
}

onMounted(() => {
  syncGovernanceForms()
  store.refreshBackupJob()
  backupTimer = setInterval(() => {
    nowMs.value = Date.now()
    store.refreshBackupJob(nowMs.value)
  }, 1000)
})

onUnmounted(() => {
  if (backupTimer) clearInterval(backupTimer)
})
</script>

<template>
  <PageFrame title="系统设置" desc="集中承接 6 月迭代中的商业化授权、模型切换、共创回流、审计、用量分析和备份容灾。">
    <template #meta>
      <div class="flex flex-wrap gap-2 text-xs">
        <span class="rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-700 ring-1 ring-emerald-200">当前账号：{{ store.currentAccount?.name }}</span>
        <span class="rounded-full bg-white px-3 py-1.5 text-slate-600 ring-1 ring-slate-200">当前 License：{{ store.currentLicenseInstance?.licenseNo || '未分配' }}</span>
        <span class="rounded-full bg-white px-3 py-1.5 text-slate-600 ring-1 ring-slate-200">当前版本包：{{ store.currentPackage.name }}</span>
        <span class="rounded-full bg-white px-3 py-1.5 text-slate-600 ring-1 ring-slate-200">企业主体：{{ store.enterpriseQuotaPlan.enterpriseName }}</span>
        <span class="rounded-full bg-white px-3 py-1.5 text-slate-600 ring-1 ring-slate-200">应用数：{{ appsStore.apps.length }}</span>
        <span class="rounded-full bg-white px-3 py-1.5 text-slate-600 ring-1 ring-slate-200">审计日志：{{ store.auditLogs.length }}</span>
      </div>
    </template>

    <div class="space-y-4">
      <aside class="rounded-[1.5rem] border border-sky-200/70 bg-white/80 p-2 shadow-[0_18px_56px_rgba(14,116,144,0.08)] lg:hidden">
        <div class="flex gap-2 overflow-x-auto">
          <button v-for="item in tabs" :key="item.key" type="button" class="flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm transition" :class="activeTab === item.key ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-sky-50'" @click="switchTab(item.key)">
            <component :is="item.icon" class="h-4 w-4" />
            <span>{{ item.label }}</span>
          </button>
        </div>
      </aside>

      <main class="min-w-0">
        <section v-if="activeTab === 'versions'" class="space-y-4">
          <div class="rounded-[1.5rem] border border-sky-200/70 bg-white/80 shadow-[0_18px_56px_rgba(14,116,144,0.08)]">
            <div class="flex items-center justify-between gap-3 border-b border-slate-200/80 px-5 py-4">
              <div class="flex items-center gap-2 text-sm font-semibold text-slate-900"><Layers3 class="h-4 w-4 text-sky-600" /> 版本管理</div>
              <button type="button" class="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white" @click="openVersionDialog">
                <Plus class="h-4 w-4" /> 创建版本
              </button>
            </div>
            <div class="overflow-hidden rounded-b-[1.5rem]">
              <div class="hidden grid-cols-[1.2fr_1.8fr_1fr] gap-4 border-b border-slate-200/80 bg-slate-50/80 px-5 py-3 text-xs font-semibold text-slate-500 md:grid">
                <div>版本名称</div>
                <div>关联模块</div>
                <div>说明</div>
              </div>
              <div
                v-for="template in store.licenseTemplates"
                :key="template.id"
                class="grid gap-3 border-b border-slate-100 px-5 py-4 last:border-b-0 md:grid-cols-[1.2fr_1.6fr_1fr]"
              >
                <div class="text-sm font-semibold text-slate-900">{{ template.name }}</div>
                <div class="space-y-2">
                  <div v-for="module in template.modules" :key="module" class="rounded-2xl border border-slate-200/80 bg-slate-50/70 px-3 py-2">
                    <div class="flex flex-wrap items-center gap-2">
                      <span class="rounded-full bg-sky-50 px-2.5 py-1 text-[11px] text-sky-700 ring-1 ring-sky-100">
                        {{ moduleLabelMap[module] }}
                      </span>
                      <span
                        v-for="item in template.moduleSelections[module]"
                        :key="`${template.id}-${module}-${item}`"
                        class="rounded-full bg-white px-2.5 py-1 text-[11px] text-slate-600 ring-1 ring-slate-200"
                      >
                        {{ item }}
                      </span>
                    </div>
                  </div>
                </div>
                <div class="text-sm text-slate-500">{{ template.desc }}</div>
              </div>
            </div>
          </div>
        </section>

        <section v-else-if="activeTab === 'license'" class="space-y-4">
          <div class="rounded-[1.5rem] border border-sky-200/70 bg-white/80 p-5 shadow-[0_18px_56px_rgba(14,116,144,0.08)]">
            <div class="mb-4 flex items-center justify-between gap-3">
              <div class="flex items-center gap-2 text-sm font-semibold text-slate-900"><ShieldCheck class="h-4 w-4 text-sky-600" /> License 管理</div>
              <button type="button" class="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white" @click="openLicenseDialog">
                <Plus class="h-4 w-4" /> 创建 License
              </button>
            </div>

            <div class="mt-5 overflow-hidden rounded-2xl border border-slate-200/80">
              <div class="hidden grid-cols-[1.5fr_1fr_1.1fr_1fr_0.8fr_1fr] gap-4 bg-slate-50/80 px-4 py-3 text-xs font-semibold text-slate-500 md:grid">
                <div>License 编号</div>
                <div>版本</div>
                <div>有效期</div>
                <div>状态</div>
                <div>账号数量</div>
                <div>操作</div>
              </div>
              <div v-for="license in store.licenseInstances" :key="license.id" class="grid gap-3 border-t border-slate-100 px-4 py-4 first:border-t-0 md:grid-cols-[1.5fr_1fr_1.1fr_1fr_0.8fr_1fr] md:items-center">
                <div class="text-sm font-semibold text-slate-900">{{ license.licenseNo }}</div>
                <div class="text-sm text-slate-600">{{ license.templateName }}</div>
                <div class="text-sm text-slate-600">{{ license.validFrom }} ~ {{ license.validTo }}</div>
                <div><span class="rounded-full px-2.5 py-1 text-[11px] ring-1" :class="licenseStatusClass(license.status)">{{ licenseStatusText(license.status) }}</span></div>
                <div class="text-sm text-slate-600">{{ store.getBindingCount(license.id) }} 个</div>
                <div>
                  <button type="button" class="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-slate-700 ring-1 ring-slate-200" @click="store.toggleLicenseInstanceStatus(license.id)">
                    {{ license.status === 'active' ? '禁用' : '启用' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section v-else-if="activeTab === 'quota'" class="space-y-4">
          <div v-if="quotaManageError" class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {{ quotaManageError }}
          </div>
          <div class="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
            <div class="rounded-[1.75rem] border border-sky-200/70 bg-white/80 p-5 shadow-[0_18px_56px_rgba(14,116,144,0.08)]">
              <div class="mb-4 flex items-center justify-between gap-3">
                <div>
                  <div class="flex items-center gap-2 text-sm font-semibold text-slate-900"><Boxes class="h-4 w-4 text-sky-600" /> 企业总量控制</div>
                  <div class="mt-1 text-xs text-slate-500">统一配置企业级请求量、Token 与知识存储上限，并定义超额后的处理策略。</div>
                </div>
                <span class="rounded-full bg-slate-950 px-3 py-1.5 text-xs font-semibold text-white">{{ store.enterpriseQuotaPlan.enterpriseName }}</span>
              </div>

              <div class="grid gap-4 md:grid-cols-3">
                <div class="rounded-2xl bg-slate-950 p-4 text-white">
                  <div class="text-xs text-slate-400">请求量使用率</div>
                  <div class="mt-3 text-3xl font-semibold">{{ percentText(store.enterpriseQuotaUsage.requestRatio) }}</div>
                  <div class="mt-2 text-xs text-slate-300">{{ store.enterpriseQuotaPlan.requestUsed.toLocaleString() }} / {{ store.enterpriseQuotaPlan.requestLimit.toLocaleString() }}</div>
                </div>
                <div class="rounded-2xl bg-slate-950 p-4 text-white">
                  <div class="text-xs text-slate-400">Token 使用率</div>
                  <div class="mt-3 text-3xl font-semibold">{{ percentText(store.enterpriseQuotaUsage.tokenRatio) }}</div>
                  <div class="mt-2 text-xs text-slate-300">{{ store.enterpriseQuotaPlan.tokenUsed.toLocaleString() }} / {{ store.enterpriseQuotaPlan.tokenLimit.toLocaleString() }}</div>
                </div>
                <div class="rounded-2xl bg-slate-950 p-4 text-white">
                  <div class="text-xs text-slate-400">存储使用率</div>
                  <div class="mt-3 text-3xl font-semibold">{{ percentText(store.enterpriseQuotaUsage.storageRatio) }}</div>
                  <div class="mt-2 text-xs text-slate-300">{{ store.enterpriseQuotaPlan.storageUsedGb }}GB / {{ store.enterpriseQuotaPlan.storageLimitGb }}GB</div>
                </div>
              </div>

              <div class="mt-5 grid gap-4 md:grid-cols-2">
                <label class="grid gap-1 text-sm text-slate-600">
                  <span>企业请求上限</span>
                  <input v-model.number="enterpriseQuotaForm.requestLimit" type="number" class="rounded-2xl border border-sky-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none" />
                </label>
                <label class="grid gap-1 text-sm text-slate-600">
                  <span>企业 Token 上限</span>
                  <input v-model.number="enterpriseQuotaForm.tokenLimit" type="number" class="rounded-2xl border border-sky-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none" />
                </label>
                <label class="grid gap-1 text-sm text-slate-600">
                  <span>知识/会话存储上限（GB）</span>
                  <input v-model.number="enterpriseQuotaForm.storageLimitGb" type="number" class="rounded-2xl border border-sky-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none" />
                </label>
                <label class="grid gap-1 text-sm text-slate-600">
                  <span>额度生效日期</span>
                  <input v-model="enterpriseQuotaForm.validFrom" type="date" class="rounded-2xl border border-sky-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none" />
                </label>
                <label class="grid gap-1 text-sm text-slate-600">
                  <span>额度失效日期</span>
                  <input v-model="enterpriseQuotaForm.validTo" type="date" class="rounded-2xl border border-sky-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none" />
                </label>
                <label class="grid gap-1 text-sm text-slate-600">
                  <span>超额预警阈值</span>
                  <input v-model.number="enterpriseQuotaForm.warningThreshold" type="number" step="0.05" min="0.1" max="1" class="rounded-2xl border border-sky-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none" />
                </label>
              </div>
              <div class="mt-4 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-xs text-slate-600 md:grid-cols-3">
                <div>已分配请求：{{ store.enterpriseQuotaPlan.assignedRequestLimit.toLocaleString() }} / {{ store.enterpriseQuotaPlan.requestLimit.toLocaleString() }}</div>
                <div>已分配 Token：{{ store.enterpriseQuotaPlan.assignedTokenLimit.toLocaleString() }} / {{ store.enterpriseQuotaPlan.tokenLimit.toLocaleString() }}</div>
                <div>已分配存储：{{ store.enterpriseQuotaPlan.assignedStorageLimitGb }}GB / {{ store.enterpriseQuotaPlan.storageLimitGb }}GB</div>
              </div>

              <div class="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3">
                <div>
                  <div class="text-sm font-semibold text-slate-900">超额处理策略</div>
                  <div class="mt-1 text-xs text-slate-500">可选择仅预警提醒，或在超出额度后暂停继续调用。</div>
                </div>
                <div class="flex items-center gap-2">
                  <button type="button" class="rounded-full px-3 py-1.5 text-xs font-semibold ring-1" :class="enterpriseQuotaForm.overageMode === 'warn' ? 'bg-blue-600 text-white ring-blue-600' : 'bg-white text-slate-700 ring-slate-200'" @click="enterpriseQuotaForm.overageMode = 'warn'">仅提示</button>
                  <button type="button" class="rounded-full px-3 py-1.5 text-xs font-semibold ring-1" :class="enterpriseQuotaForm.overageMode === 'block' ? 'bg-blue-600 text-white ring-blue-600' : 'bg-white text-slate-700 ring-slate-200'" @click="enterpriseQuotaForm.overageMode = 'block'">阻断调用</button>
                  <button type="button" class="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white" @click="saveEnterpriseQuota">保存配置</button>
                </div>
              </div>
            </div>

            <div class="rounded-[1.75rem] border border-sky-200/70 bg-white/80 p-5 shadow-[0_18px_56px_rgba(14,116,144,0.08)]">
              <div class="flex items-center justify-between gap-3">
                <div>
                  <div class="text-sm font-semibold text-slate-900">超额提示与待处理对象</div>
                  <div class="mt-1 text-xs text-slate-500">当企业或用户额度逼近阈值时，统一在这里汇总预警。</div>
                </div>
                <span class="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">{{ store.overQuotaUsers.length }} 个风险账号</span>
              </div>
              <div class="mt-4 space-y-3">
                <div v-for="item in store.overQuotaUsers" :key="item.id" class="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <div class="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div class="text-sm font-semibold text-slate-900">{{ item.userName }}</div>
                      <div class="mt-1 text-xs text-slate-500">{{ item.department }} · 最近活跃 {{ formatTime(item.lastActiveAt) }}</div>
                    </div>
                    <span class="rounded-full px-2.5 py-1 text-[11px] ring-1" :class="quotaStatusClass(item.status)">{{ quotaStatusText(item.status) }}</span>
                  </div>
                  <div class="mt-3 grid gap-2 text-xs text-slate-600">
                    <div>请求量：{{ item.requestUsed.toLocaleString() }} / {{ item.requestLimit.toLocaleString() }}</div>
                    <div>Token：{{ item.tokenUsed.toLocaleString() }} / {{ item.tokenLimit.toLocaleString() }}</div>
                    <div>存储：{{ item.storageUsedGb }}GB / {{ item.storageLimitGb }}GB</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="rounded-[1.75rem] border border-sky-200/70 bg-white/80 p-5 shadow-[0_18px_56px_rgba(14,116,144,0.08)]">
            <div class="mb-4 flex items-center justify-between gap-3">
              <div class="flex items-center gap-2 text-sm font-semibold text-slate-900"><Crown class="h-4 w-4 text-sky-600" /> 租户管理</div>
              <label class="relative w-full max-w-sm">
                <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input v-model="quotaTenantQuery" class="w-full rounded-2xl border border-sky-200 bg-white py-2 pl-10 pr-3 text-sm text-slate-900 outline-none" placeholder="搜索租户 / 编码 / 负责人" />
              </label>
            </div>
            <div class="grid gap-3">
              <div class="grid gap-3 rounded-2xl border border-dashed border-sky-200 bg-sky-50/40 p-4 md:grid-cols-[1fr_0.8fr_0.8fr_0.7fr_auto]">
                <input v-model="newTenantDraft.tenantName" class="rounded-xl border border-sky-200 bg-white px-3 py-2 text-sm outline-none" placeholder="租户名称" />
                <input v-model="newTenantDraft.tenantCode" class="rounded-xl border border-sky-200 bg-white px-3 py-2 text-sm outline-none" placeholder="租户编码" />
                <input v-model="newTenantDraft.ownerName" class="rounded-xl border border-sky-200 bg-white px-3 py-2 text-sm outline-none" placeholder="负责人" />
                <select v-model="newTenantDraft.status" class="rounded-xl border border-sky-200 bg-white px-3 py-2 text-sm outline-none">
                  <option value="active">启用</option>
                  <option value="disabled">停用</option>
                </select>
                <button type="button" class="rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white" @click="createTenant">新增租户</button>
              </div>
              <div v-for="tenant in filteredQuotaTenants" :key="tenant.id" class="grid gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 md:grid-cols-[1fr_0.8fr_0.8fr_0.5fr_0.7fr_auto] md:items-center">
                <input v-model="tenantDrafts[tenant.id].tenantName" class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none" />
                <input v-model="tenantDrafts[tenant.id].tenantCode" class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none" />
                <input v-model="tenantDrafts[tenant.id].ownerName" class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none" />
                <div class="text-xs text-slate-500">{{ tenant.memberCount }} 人</div>
                <select v-model="tenantDrafts[tenant.id].status" class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none">
                  <option value="active">启用</option>
                  <option value="disabled">停用</option>
                </select>
                <div class="flex gap-2">
                  <button type="button" class="rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white" @click="saveTenant(tenant.id)">保存</button>
                  <button type="button" class="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-rose-600 ring-1 ring-rose-200" @click="removeTenant(tenant.id)">删除</button>
                </div>
              </div>
            </div>
          </div>

          <div class="rounded-[1.75rem] border border-sky-200/70 bg-white/80 p-5 shadow-[0_18px_56px_rgba(14,116,144,0.08)]">
            <div class="mb-4 flex items-center justify-between gap-3">
              <div class="flex items-center gap-2 text-sm font-semibold text-slate-900"><Crown class="h-4 w-4 text-sky-600" /> 企业成员与用户额度分配</div>
              <label class="relative w-full max-w-sm">
                <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input v-model="quotaUserQuery" class="w-full rounded-2xl border border-sky-200 bg-white py-2 pl-10 pr-3 text-sm text-slate-900 outline-none" placeholder="搜索用户 / 租户 / 角色 / 状态" />
              </label>
            </div>
            <div class="grid gap-3">
              <div class="grid gap-3 rounded-2xl border border-dashed border-sky-200 bg-sky-50/40 p-4 md:grid-cols-4 xl:grid-cols-[0.9fr_0.8fr_0.9fr_0.7fr_0.7fr_0.7fr_0.7fr_auto]">
                <input v-model="newUserQuotaDraft.userName" class="rounded-xl border border-sky-200 bg-white px-3 py-2 text-sm outline-none" placeholder="成员姓名" />
                <input v-model="newUserQuotaDraft.department" class="rounded-xl border border-sky-200 bg-white px-3 py-2 text-sm outline-none" placeholder="部门" />
                <select v-model="newUserQuotaDraft.tenantId" class="rounded-xl border border-sky-200 bg-white px-3 py-2 text-sm outline-none">
                  <option value="">选择租户</option>
                  <option v-for="tenant in store.tenantRecords" :key="tenant.id" :value="tenant.id">{{ tenant.tenantName }}</option>
                </select>
                <input v-model="newUserQuotaDraft.role" class="rounded-xl border border-sky-200 bg-white px-3 py-2 text-sm outline-none" placeholder="角色" />
                <input v-model.number="newUserQuotaDraft.requestLimit" type="number" class="rounded-xl border border-sky-200 bg-white px-3 py-2 text-sm outline-none" placeholder="次数" />
                <input v-model.number="newUserQuotaDraft.tokenLimit" type="number" class="rounded-xl border border-sky-200 bg-white px-3 py-2 text-sm outline-none" placeholder="Token" />
                <input v-model.number="newUserQuotaDraft.storageLimitGb" type="number" class="rounded-xl border border-sky-200 bg-white px-3 py-2 text-sm outline-none" placeholder="GB" />
                <button type="button" class="rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white" @click="createUserQuota">新增成员</button>
              </div>
              <div v-for="item in filteredQuotaUsers" :key="item.id" class="rounded-2xl border border-slate-200/80 bg-white p-4">
                <div class="grid gap-3 md:grid-cols-4 xl:grid-cols-[0.9fr_0.8fr_0.9fr_0.7fr_0.7fr_0.7fr_0.7fr_0.7fr]">
                  <input v-model="userQuotaDrafts[item.id].userName" class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none" />
                  <input v-model="userQuotaDrafts[item.id].department" class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none" />
                  <select v-model="userQuotaDrafts[item.id].tenantId" class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none">
                    <option value="">未分配租户</option>
                    <option v-for="tenant in store.tenantRecords" :key="tenant.id" :value="tenant.id">{{ tenant.tenantName }}</option>
                  </select>
                  <input v-model="userQuotaDrafts[item.id].role" class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none" />
                  <input v-model.number="userQuotaDrafts[item.id].requestLimit" type="number" class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none" />
                  <input v-model.number="userQuotaDrafts[item.id].tokenLimit" type="number" class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none" />
                  <input v-model.number="userQuotaDrafts[item.id].storageLimitGb" type="number" class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none" />
                  <select v-model="userQuotaDrafts[item.id].accountStatus" class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none">
                    <option value="active">启用</option>
                    <option value="disabled">停用</option>
                  </select>
                </div>
                <div class="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <div class="text-xs text-slate-500">
                    {{ item.tenantName }} · 已用 {{ item.requestUsed.toLocaleString() }} 次请求 / {{ item.tokenUsed.toLocaleString() }} Token / {{ item.storageUsedGb }}GB
                    <span class="ml-2 rounded-full px-2 py-0.5 ring-1" :class="quotaStatusClass(item.status)">{{ quotaStatusText(item.status) }}</span>
                    <span v-if="!item.requestLimit" class="ml-2 rounded-full bg-rose-50 px-2 py-0.5 text-rose-700 ring-1 ring-rose-200">未分配额度</span>
                  </div>
                  <div class="flex gap-2">
                    <button type="button" class="rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white" @click="saveUserQuota(item.id)">保存成员</button>
                    <button type="button" class="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-rose-600 ring-1 ring-rose-200" @click="removeUserQuota(item.id)">删除</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="grid gap-4 xl:grid-cols-[1fr_0.8fr]">
            <div class="rounded-[1.75rem] border border-sky-200/70 bg-white/80 p-5 shadow-[0_18px_56px_rgba(14,116,144,0.08)]">
              <div class="mb-4 text-sm font-semibold text-slate-900">额度变更记录</div>
              <div class="space-y-3">
                <div v-for="record in store.quotaAdjustmentRecords.slice(0, 5)" :key="record.id" class="grid gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm md:grid-cols-[0.8fr_0.9fr_0.8fr_1fr]">
                  <div class="font-semibold text-slate-900">{{ record.targetName }}</div>
                  <div class="text-slate-600">{{ record.before.toLocaleString() }} -> {{ record.after.toLocaleString() }}</div>
                  <div class="text-slate-500">{{ record.operator }}</div>
                  <div class="text-xs leading-5 text-slate-500">{{ record.reason }} · {{ formatTime(record.createdAt) }}</div>
                </div>
              </div>
            </div>
            <div class="rounded-[1.75rem] border border-amber-200/80 bg-amber-50/80 p-5 shadow-[0_18px_56px_rgba(14,116,144,0.06)]">
              <div class="text-sm font-semibold text-amber-950">6 月资产控制口径</div>
              <div class="mt-3 space-y-2 text-sm leading-6 text-amber-800">
                <div>流式预扣费、滚动核销、失败退回和最终消耗暂缓。</div>
                <div>Token 余额归零动态熔断暂缓，本期只记录 input/output Token。</div>
                <div>当前硬限制以企业请求次数和用户请求次数为准，未分配请求额度的用户不能调用 AI。</div>
              </div>
            </div>
          </div>
        </section>

        <section v-else-if="activeTab === 'sessions'">
          <div class="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900"><ShieldCheck class="h-4 w-4 text-sky-600" /> 会话管理</div>
          <div class="session-toolbar">
            <div class="session-search">
              <input v-model="sessionQuery" placeholder="搜索用户 / 主题 / Agent / Session" />
            </div>
            <select v-model="sessionStatusFilter" class="session-filter-select">
              <option value="all">全部状态</option>
              <option v-for="status in ['正常', '待复核', '已冻结', '已清理']" :key="status" :value="status">{{ status }}</option>
            </select>
            <span class="session-count">共 {{ filteredSessions.length }} 条会话</span>
            <button type="button" class="session-config-btn" @click="openStoragePolicyDialog">
              <Settings class="h-4 w-4" /> 会话配置
            </button>
          </div>
          <div class="session-table-wrap">
            <div class="hidden grid-cols-[0.6fr_1.4fr_0.8fr_0.7fr_0.7fr_0.5fr_0.5fr_0.5fr_1.4fr] gap-3 bg-slate-50/80 px-4 py-3 text-xs font-semibold text-slate-500 md:grid">
              <div>用户</div>
              <div>会话主题</div>
              <div>Session ID</div>
              <div>Agent</div>
              <div>部门</div>
              <div>风险</div>
              <div>状态</div>
              <div>消息量</div>
              <div>操作</div>
            </div>
            <div v-if="!filteredSessions.length" class="px-4 py-10 text-center text-sm text-slate-500">暂无会话记录。</div>
            <div v-for="item in filteredSessions" :key="item.id" class="grid gap-3 border-t border-slate-100 px-4 py-4 first:border-t-0 md:grid-cols-[0.6fr_1.4fr_0.8fr_0.7fr_0.7fr_0.5fr_0.5fr_0.5fr_1.4fr] md:items-center">
              <div class="text-sm font-semibold text-slate-900">{{ item.userName }}</div>
              <div class="text-sm text-slate-700">{{ item.topic }}</div>
              <div class="truncate text-xs text-slate-500">{{ item.sessionId }}</div>
              <div class="text-sm text-slate-600">{{ item.agentName }}</div>
              <div class="text-sm text-slate-600">{{ item.department }}</div>
              <div>
                <span class="rounded-full px-2.5 py-1 text-[11px] ring-1" :class="sessionRiskClass(item.riskLevel)">{{ item.riskLevel }}</span>
              </div>
              <div>
                <span class="rounded-full px-2.5 py-1 text-[11px] ring-1" :class="sessionStatusClass(item.status)">{{ item.status }}</span>
              </div>
              <div class="text-sm text-slate-600">{{ item.messageCount }}</div>
              <div class="flex flex-wrap gap-2">
                <button type="button" class="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-slate-700 ring-1 ring-slate-200" @click="store.updateSessionGovernanceStatus(item.id, '待复核')">复核</button>
                <button type="button" class="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-slate-700 ring-1 ring-slate-200" @click="store.updateSessionGovernanceStatus(item.id, '已冻结')">冻结</button>
                <button type="button" class="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-rose-600 ring-1 ring-rose-200" @click="store.updateSessionGovernanceStatus(item.id, '已清理')">清理</button>
              </div>
            </div>
          </div>
        </section>

        <section v-else-if="activeTab === 'models'" class="rounded-[1.75rem] border border-sky-200/70 bg-white/80 p-5 shadow-[0_18px_56px_rgba(14,116,144,0.08)]">
          <div>
            <div class="mb-4 flex items-center justify-between gap-3">
              <div class="flex items-center gap-2 text-sm font-semibold text-slate-900"><Database class="h-4 w-4 text-sky-600" /> 模型列表</div>
              <div class="flex items-center gap-3">
                <label class="relative w-full max-w-sm">
                  <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input v-model="modelQuery" class="w-full rounded-2xl border border-sky-200 bg-white py-2 pl-10 pr-3 text-sm text-slate-900 outline-none" placeholder="搜索供应商 / Provider / 模型 / 地址" />
                </label>
                <button type="button" class="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white" @click="openModelDialog">
                  <Plus class="h-4 w-4" /> 新增模型
                </button>
              </div>
            </div>
            <div class="overflow-hidden rounded-2xl border border-slate-200/80">
              <div class="hidden grid-cols-[1fr_0.7fr_0.7fr_1fr_1.4fr_0.6fr_0.6fr_0.8fr_1.4fr] gap-3 bg-slate-50/80 px-4 py-3 text-xs font-semibold text-slate-500 md:grid">
                <div>供应商名称</div>
                <div>Provider</div>
                <div>协议</div>
                <div>模型名称</div>
                <div>请求地址</div>
                <div>上下文</div>
                <div>状态</div>
                <div>最近测试</div>
                <div>操作</div>
              </div>
              <div v-if="!filteredModels.length" class="px-4 py-10 text-center text-sm text-slate-500">未检索到模型配置。</div>
              <div v-for="model in filteredModels" :key="model.id" class="grid gap-3 border-t border-slate-100 px-4 py-4 first:border-t-0 md:grid-cols-[1fr_0.7fr_0.7fr_1fr_1.4fr_0.6fr_0.6fr_0.8fr_1.4fr] md:items-center">
                <div class="text-sm font-semibold text-slate-900">{{ model.name }}</div>
                <div class="text-sm text-slate-600">{{ model.provider || '-' }}</div>
                <div class="text-sm text-slate-600">{{ model.protocol || '-' }}</div>
                <div class="text-sm text-slate-600">{{ model.model || model.version }}</div>
                <div class="truncate text-sm text-slate-500">{{ model.endpoint || '-' }}</div>
                <div class="text-sm text-slate-600">{{ model.ctxSize ? (model.ctxSize >= 1024 ? `${(model.ctxSize / 1024).toFixed(0)}K` : model.ctxSize) : '-' }}</div>
                <div>
                  <span class="rounded-full px-2.5 py-1 text-[11px] ring-1" :class="modelStatusClass(model.lastTestStatus)">{{ modelStatusText(model.lastTestStatus) }}</span>
                </div>
                <div class="text-sm text-slate-500">{{ model.lastTestAt ? formatTime(model.lastTestAt) : '未测试' }}</div>
                <div class="flex flex-wrap gap-2">
                  <button type="button" class="inline-flex items-center gap-1 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-slate-700 ring-1 ring-slate-200" @click="testModel(model.id)">
                    <Wifi class="h-3.5 w-3.5" /> 测试
                  </button>
                  <button type="button" class="rounded-xl px-3 py-2 text-xs font-semibold ring-1" :class="store.activeModelId === model.id ? 'bg-blue-600 text-white ring-blue-600' : 'bg-white text-slate-700 ring-slate-200'" @click="store.requireFeature('modelSwitch', '模型切换') && store.setActiveModel(model.id)">
                    {{ store.activeModelId === model.id ? '默认中' : '设为默认' }}
                  </button>
                  <button v-if="!model.locked" type="button" class="inline-flex items-center gap-1 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-rose-600 ring-1 ring-rose-200" @click="removeModel(model.id)">
                    <Trash2 class="h-3.5 w-3.5" /> 删除
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section v-else-if="activeTab === 'samples'">
          <div class="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900"><BookMarked class="h-4 w-4 text-sky-600" /> 反馈列表</div>
          <div class="feedback-toolbar">
            <select v-model="coCreationTypeFilter" class="feedback-filter-select">
              <option value="all">全部类型</option>
              <option value="like">点赞</option>
              <option value="dislike">点踩</option>
            </select>
            <select v-model="coCreationStatusFilter" class="feedback-filter-select">
              <option value="all">全部状态</option>
              <option value="待处置">待处置</option>
              <option value="已采纳">已采纳</option>
              <option value="误判">误判</option>
              <option value="已搁置">已搁置</option>
            </select>
            <div class="feedback-search">
              <input v-model="coCreationQuery" placeholder="搜索 Session ID / 反馈人 / 问题内容" />
            </div>
            <span class="feedback-count">共 {{ filteredCoCreationRows.length }} 条反馈</span>
          </div>
          <div class="feedback-table-wrap">
            <div class="hidden grid-cols-[0.9fr_0.7fr_0.7fr_1.4fr_0.9fr_0.7fr_0.7fr] gap-4 bg-slate-50/80 px-4 py-3 text-xs font-semibold text-slate-500 md:grid">
              <div>Session ID</div>
              <div>反馈人</div>
              <div>反馈类型</div>
              <div>问题</div>
              <div>反馈时间</div>
              <div>状态</div>
              <div>操作</div>
            </div>
            <div v-if="!filteredCoCreationRows.length" class="px-4 py-10 text-center text-sm text-slate-500">未检索到共创回流数据。</div>
            <div v-for="item in filteredCoCreationRows" :key="item.id" class="grid gap-3 border-t border-slate-100 px-4 py-4 first:border-t-0 md:grid-cols-[0.9fr_0.7fr_0.7fr_1.4fr_0.9fr_0.7fr_0.7fr]">
              <div class="min-w-0">
                <div class="text-sm font-semibold text-slate-900">{{ item.sessionId }}</div>
                <div class="mt-1 text-xs text-slate-500">{{ item.action === 'dislike' ? item.category : '正向反馈' }}</div>
              </div>
              <div class="text-sm text-slate-600">{{ item.feedbackUser }}</div>
              <div>
                <span class="rounded-full px-2.5 py-1 text-[11px] ring-1" :class="item.action === 'like' ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : 'bg-rose-50 text-rose-700 ring-rose-200'">{{ coCreationTypeText(item.action) }}</span>
              </div>
              <div class="group relative">
                <div class="truncate text-sm leading-6 text-slate-700">{{ item.question }}</div>
                <div class="pointer-events-none absolute left-0 top-full z-20 mt-2 hidden w-[420px] rounded-2xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-700 shadow-[0_18px_56px_rgba(15,23,42,0.18)] group-hover:block">
                  {{ item.question }}
                </div>
              </div>
              <div class="text-sm text-slate-500">{{ formatTime(item.createdAt) }}</div>
              <div>
                <span class="rounded-full px-2.5 py-1 text-[11px] ring-1" :class="coCreationStatusClass(item.status)">{{ item.status }}</span>
              </div>
              <div>
                <button type="button" class="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-slate-700 ring-1 ring-slate-200" @click="openDisposalDialog(item.id, item.status)">处置</button>
              </div>
            </div>
          </div>
        </section>

        <section v-else-if="activeTab === 'audit'" class="audit-section">
          <div class="audit-toolbar">
            <div class="audit-search-box">
              <Search class="audit-search-icon" />
              <input v-model="auditQuery" placeholder="搜索用户名 / 智能体 / IP / 请求参数 / 响应数据" />
              <button v-if="auditQuery" type="button" class="audit-clear-btn" @click="auditQuery = ''">
                <X class="h-3.5 w-3.5" />
              </button>
            </div>
            <div class="audit-actions">
              <select v-model="auditTimeFilter" class="audit-select">
                <option value="all">全部时间</option>
                <option value="today">今日</option>
                <option value="7d">近 7 天</option>
                <option value="30d">近 30 天</option>
              </select>
              <select v-model="auditStatusFilter" class="audit-select">
                <option value="all">全部状态</option>
                <option value="success">成功</option>
                <option value="fail">失败</option>
              </select>
            </div>
          </div>
          <div class="overflow-hidden rounded-2xl border border-slate-200/80">
            <div class="hidden grid-cols-[0.9fr_0.8fr_0.8fr_1.2fr_1.2fr_0.6fr_0.9fr] gap-4 bg-slate-50/80 px-4 py-3 text-xs font-semibold text-slate-500 md:grid">
              <div>用户名</div>
              <div>智能体</div>
              <div>客户端 IP</div>
              <div>请求参数</div>
              <div>响应数据</div>
              <div>状态</div>
              <div>时间</div>
            </div>
            <div v-if="!filteredAuditRows.length" class="px-4 py-10 text-center text-sm text-slate-500">未检索到审计日志。</div>
            <div v-for="item in filteredAuditRows" :key="item.id" class="grid gap-3 border-t border-slate-100 px-4 py-4 first:border-t-0 md:grid-cols-[0.9fr_0.8fr_0.8fr_1.2fr_1.2fr_0.6fr_0.9fr]">
              <div class="text-sm text-slate-700">{{ item.user }}</div>
              <div class="text-sm text-slate-600">{{ item.agent }}</div>
              <div class="text-sm text-slate-600">{{ item.ip }}</div>
              <div class="truncate text-xs text-slate-500" :title="item.requestParams">{{ item.requestParams }}</div>
              <div class="truncate text-xs text-slate-500" :title="item.responseData">{{ item.responseData }}</div>
              <div>
                <span class="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold" :class="item.success ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' : 'bg-rose-50 text-rose-700 ring-1 ring-rose-200'">{{ item.success ? '成功' : '失败' }}</span>
              </div>
              <div class="text-sm text-slate-500">{{ formatTime(item.time) }}</div>
            </div>
          </div>
        </section>

        <section v-else-if="activeTab === 'metrics'" class="space-y-4">
          <div class="rounded-[1.75rem] border border-sky-200/70 bg-white/80 p-5 shadow-[0_18px_56px_rgba(14,116,144,0.08)]">
            <div class="mb-4 flex items-center justify-between gap-3">
              <div class="flex items-center gap-2 text-sm font-semibold text-slate-900"><BarChart3 class="h-4 w-4 text-sky-600" /> 用量分析</div>
              <div class="flex items-center gap-2">
                <button type="button" class="rounded-full px-3 py-1.5 text-xs font-semibold ring-1" :class="usageRange === 'today' ? 'bg-blue-600 text-white ring-blue-600' : 'bg-white text-slate-700 ring-slate-200'" @click="usageRange = 'today'">今日</button>
                <button type="button" class="rounded-full px-3 py-1.5 text-xs font-semibold ring-1" :class="usageRange === '7d' ? 'bg-blue-600 text-white ring-blue-600' : 'bg-white text-slate-700 ring-slate-200'" @click="usageRange = '7d'">近 7 天</button>
                <button type="button" class="rounded-full px-3 py-1.5 text-xs font-semibold ring-1" :class="usageRange === '30d' ? 'bg-blue-600 text-white ring-blue-600' : 'bg-white text-slate-700 ring-slate-200'" @click="usageRange = '30d'">近 30 天</button>
              </div>
            </div>
            <div class="grid gap-4 md:grid-cols-3">
              <div class="rounded-2xl bg-slate-950 p-4 text-slate-100">
                <div class="text-xs text-slate-400">企业累计请求次数</div>
                <div class="mt-3 text-3xl font-semibold">{{ usageOverviewDisplay.totalRequests.toLocaleString() }}</div>
              </div>
              <div class="rounded-2xl bg-slate-950 p-4 text-slate-100">
                <div class="text-xs text-slate-400">企业累计 Token 用量</div>
                <div class="mt-3 text-3xl font-semibold">{{ usageOverviewDisplay.totalTokens.toLocaleString() }}</div>
              </div>
              <div class="rounded-2xl bg-slate-950 p-4 text-slate-100">
                <div class="text-xs text-slate-400">使用用户数</div>
                <div class="mt-3 text-3xl font-semibold">{{ usageOverviewDisplay.totalUsers.toLocaleString() }}</div>
              </div>
            </div>
          </div>
          <div class="rounded-[1.75rem] border border-sky-200/70 bg-white/80 p-5 shadow-[0_18px_56px_rgba(14,116,144,0.08)]">
            <div class="mb-4 flex items-center justify-between gap-3">
              <div class="flex items-center gap-2 text-sm font-semibold text-slate-900"><Boxes class="h-4 w-4 text-sky-600" /> Key / AI 技能用量明细</div>
              <label class="relative w-full max-w-sm">
                <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input v-model="usageKeyQuery" class="w-full rounded-2xl border border-sky-200 bg-white py-2 pl-10 pr-3 text-sm text-slate-900 outline-none" placeholder="搜索 Key / 名称 / AI 技能" />
              </label>
            </div>
            <div class="overflow-hidden rounded-2xl border border-slate-200/80">
              <div class="hidden grid-cols-[1fr_1fr_1.2fr_1fr_1fr] gap-4 bg-slate-50/80 px-4 py-3 text-xs font-semibold text-slate-500 md:grid">
                <div>Key</div>
                <div>名称</div>
                <div>AI 技能</div>
                <div>请求总次数</div>
                <div>Token 总用量</div>
              </div>
              <div v-for="row in usageTableRows" :key="row.id" class="grid gap-3 border-t border-slate-100 px-4 py-4 first:border-t-0 md:grid-cols-[1fr_1fr_1.2fr_1fr_1fr] md:items-center" :class="row.level === 1 ? 'bg-slate-50/60' : ''">
                <div class="text-sm font-semibold text-slate-900">
                  <button v-if="row.expandable" type="button" class="inline-flex items-center gap-2" @click="toggleUsageKey(row.id)">
                    <span class="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-xs text-slate-600">{{ expandedUsageKeys.includes(row.id) ? '－' : '＋' }}</span>
                    <span>{{ row.keyName }}</span>
                  </button>
                  <span v-else :class="row.level === 1 ? 'pl-7 text-slate-700' : ''">{{ row.keyName }}</span>
                </div>
                <div class="text-sm text-slate-600">{{ row.owner }}</div>
                <div class="text-sm text-slate-700">{{ row.skill }}</div>
                <div class="text-sm text-slate-700">{{ row.requests.toLocaleString() }}</div>
                <div class="text-sm text-slate-700">{{ row.tokens.toLocaleString() }}</div>
              </div>
            </div>
          </div>
        </section>

        <section v-else-if="activeTab === 'ledger'" class="space-y-4">
          <div class="rounded-[1.75rem] border border-sky-200/70 bg-white/80 p-5 shadow-[0_18px_56px_rgba(14,116,144,0.08)]">
            <div class="mb-4 flex items-center justify-between gap-3">
              <div>
                <div class="flex items-center gap-2 text-sm font-semibold text-slate-900"><Database class="h-4 w-4 text-sky-600" /> 资产流水对账</div>
                <div class="mt-1 text-xs text-slate-500">按企业资产口径统一核对 Token、算力和知识存储的增减流水。</div>
              </div>
              <label class="relative w-full max-w-sm">
                <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input v-model="ledgerQuery" class="w-full rounded-2xl border border-sky-200 bg-white py-2 pl-10 pr-3 text-sm text-slate-900 outline-none" placeholder="搜索流水号 / 资产类型 / 来源" />
              </label>
            </div>
            <div class="overflow-hidden rounded-2xl border border-slate-200/80">
              <div class="hidden grid-cols-[1fr_0.9fr_0.8fr_0.8fr_0.8fr_1fr_1.1fr_0.9fr] gap-4 bg-slate-50/80 px-4 py-3 text-xs font-semibold text-slate-500 md:grid">
                <div>流水号</div>
                <div>企业</div>
                <div>方向</div>
                <div>资产类型</div>
                <div>本次变动</div>
                <div>变动后余额</div>
                <div>来源/备注</div>
                <div>时间</div>
              </div>
              <div v-for="item in filteredLedgerRecords" :key="item.id" class="grid gap-3 border-t border-slate-100 px-4 py-4 first:border-t-0 md:grid-cols-[1fr_0.9fr_0.8fr_0.8fr_0.8fr_1fr_1.1fr_0.9fr] md:items-center">
                <div class="text-sm font-semibold text-slate-900">{{ item.businessNo }}</div>
                <div class="text-sm text-slate-600">{{ item.accountName }}</div>
                <div>
                  <span class="rounded-full px-2.5 py-1 text-[11px] ring-1" :class="item.direction === '收入' ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : 'bg-rose-50 text-rose-700 ring-rose-200'">{{ item.direction }}</span>
                </div>
                <div class="text-sm text-slate-700">{{ item.assetType }}</div>
                <div class="text-sm text-slate-700">{{ item.amount.toLocaleString() }}</div>
                <div class="text-sm text-slate-700">{{ item.balanceAfter.toLocaleString() }}</div>
                <div class="text-xs leading-6 text-slate-500">{{ item.source }} / {{ item.remark }}</div>
                <div class="text-sm text-slate-500">{{ formatTime(item.createdAt) }}</div>
              </div>
            </div>
          </div>
        </section>

        <section v-else-if="activeTab === 'backup'" class="space-y-4">
          <div class="rounded-[1.75rem] border border-sky-200/70 bg-white/80 p-5 shadow-[0_18px_56px_rgba(14,116,144,0.08)]">
            <div class="mb-4 flex items-center justify-between gap-3">
              <div class="flex items-center gap-2 text-sm font-semibold text-slate-900"><ServerCrash class="h-4 w-4 text-sky-600" /> 备份列表</div>
              <button
                type="button"
                class="rounded-2xl px-4 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-slate-300"
                :class="backupInProgress ? 'bg-slate-300' : 'bg-slate-900'"
                :disabled="backupInProgress"
                @click="startBackup"
              >
                {{ backupInProgress ? `正在继续备份操作 ${backupCountdownLabel}` : '备份当前数据' }}
              </button>
            </div>
            <div v-if="backupInProgress" class="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              当前快照备份任务正在执行中，按钮已置灰，预计 30 分钟完成。
            </div>
            <div class="space-y-3">
              <div v-for="item in store.backupSnapshots" :key="item.id" class="rounded-2xl border border-sky-100 bg-sky-50/50 p-4">
                <div class="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div class="text-sm font-semibold text-slate-900">{{ item.snapshotNo }}</div>
                    <div class="mt-1 text-xs text-slate-500">快照时间：{{ formatTime(item.createdAt) }}</div>
                  </div>
                  <span class="rounded-full px-3 py-1 text-[11px] font-medium ring-1" :class="item.status === '已完成' ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : 'bg-amber-50 text-amber-700 ring-amber-200'">
                    {{ item.status }}
                  </span>
                </div>
                <div class="mt-3 rounded-2xl bg-white p-3 ring-1 ring-slate-200">
                  <div class="text-xs font-semibold text-slate-500">包含服务</div>
                  <div class="mt-2 flex flex-wrap gap-2">
                    <span v-for="service in item.services" :key="service" class="rounded-full bg-sky-50 px-3 py-1 text-xs text-sky-700 ring-1 ring-sky-100">{{ service }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>

    <Teleport to="body">
    <div v-if="versionDialogOpen" class="fixed inset-0 z-[420] h-[100dvh] min-h-[100dvh] overflow-y-auto bg-slate-950/35 px-4 py-6 backdrop-blur-sm" @click.self="closeVersionDialog">
      <div class="mx-auto flex max-h-[calc(100dvh-3rem)] w-full max-w-3xl flex-col overflow-hidden rounded-[1.75rem] border border-sky-200 bg-white shadow-[0_1.75rem_5rem_rgba(15,23,42,0.24)]">
        <div class="flex shrink-0 items-center justify-between gap-3 border-b border-slate-100 px-6 py-5">
          <div>
            <div class="text-base font-semibold text-slate-950">创建版本</div>
            <div class="mt-1 text-sm text-slate-500">沉淀可复用的功能版本，用于后续创建 License。</div>
          </div>
          <button type="button" class="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800" @click="closeVersionDialog">
            <X class="h-4 w-4" />
          </button>
        </div>
        <div class="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <div class="grid gap-4">
          <label class="grid gap-1 text-sm text-slate-600">
            <span>版本名称</span>
            <input v-model="templateForm.name" class="rounded-2xl border border-sky-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none" />
          </label>
          <label class="grid gap-1 text-sm text-slate-600">
            <span>版本说明</span>
            <textarea v-model="templateForm.desc" rows="3" class="rounded-2xl border border-sky-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none" />
          </label>
          <div class="grid gap-2 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
            <div class="flex items-center justify-between gap-3">
              <span class="text-sm font-semibold text-slate-900">Agent 功能</span>
              <span class="rounded-full px-2.5 py-1 text-[11px] ring-1" :class="templateForm.moduleSelections.agent.length ? 'bg-blue-600 text-white ring-blue-600' : 'bg-white text-slate-500 ring-slate-200'">
                {{ templateForm.moduleSelections.agent.length ? '模块已开通' : '模块未开通' }}
              </span>
            </div>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="item in moduleSelectionOptions.agent"
                :key="item"
                type="button"
                class="rounded-2xl px-3 py-2 text-sm ring-1 transition"
                :class="templateForm.moduleSelections.agent.includes(item) ? 'bg-blue-600 text-white ring-blue-600' : 'bg-white text-slate-700 ring-slate-200'"
                @click="toggleModuleSelection('agent', item)"
              >
                {{ item }}
              </button>
            </div>
            <div class="text-xs text-slate-500">选中任意功能即开通 Agent 模块；全部取消则不开放 Agent 模块。</div>
          </div>
          <div class="grid gap-2 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
            <div class="flex items-center justify-between gap-3">
              <span class="text-sm font-semibold text-slate-900">AI 技能功能</span>
              <span class="rounded-full px-2.5 py-1 text-[11px] ring-1" :class="templateForm.moduleSelections.mcp.length ? 'bg-blue-600 text-white ring-blue-600' : 'bg-white text-slate-500 ring-slate-200'">
                {{ templateForm.moduleSelections.mcp.length ? '模块已开通' : '模块未开通' }}
              </span>
            </div>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="item in moduleSelectionOptions.mcp"
                :key="item"
                type="button"
                class="rounded-2xl px-3 py-2 text-sm ring-1 transition"
                :class="templateForm.moduleSelections.mcp.includes(item) ? 'bg-blue-600 text-white ring-blue-600' : 'bg-white text-slate-700 ring-slate-200'"
                @click="toggleModuleSelection('mcp', item)"
              >
                {{ item }}
              </button>
            </div>
            <div class="text-xs text-slate-500">选中任意功能即开通 AI 技能模块；全部取消则不开放 AI 技能模块。</div>
          </div>
          </div>
        </div>
        <div class="flex shrink-0 justify-end gap-3 border-t border-slate-100 bg-white px-6 py-4">
          <button type="button" class="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200" @click="closeVersionDialog">取消</button>
          <button type="button" class="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white" @click="createTemplate">创建版本</button>
        </div>
      </div>
    </div>
    </Teleport>

    <Teleport to="body">
    <div v-if="licenseDialogOpen" class="fixed inset-0 z-[420] h-[100dvh] min-h-[100dvh] overflow-y-auto bg-slate-950/35 px-4 py-6 backdrop-blur-sm" @click.self="closeLicenseDialog">
      <div class="mx-auto w-full max-w-2xl rounded-[1.75rem] border border-sky-200 bg-white p-6 shadow-[0_1.75rem_5rem_rgba(15,23,42,0.24)]">
        <div class="flex items-center justify-between gap-3">
          <div>
            <div class="text-base font-semibold text-slate-950">创建 License</div>
            <div class="mt-1 text-sm text-slate-500">为当前企业账号创建一个新的 License 实例。</div>
          </div>
          <button type="button" class="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800" @click="closeLicenseDialog">
            <X class="h-4 w-4" />
          </button>
        </div>
        <div class="mt-6 grid gap-4 md:grid-cols-2">
          <label class="grid gap-1 text-sm text-slate-600 md:col-span-2">
            <span>选择版本</span>
            <select v-model="licenseForm.templateId" class="rounded-2xl border border-sky-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none" @change="applyTemplateToLicenseForm(licenseForm.templateId)">
              <option v-for="template in store.licenseTemplates" :key="template.id" :value="template.id">{{ template.name }}</option>
            </select>
          </label>
          <label class="grid gap-1 text-sm text-slate-600">
            <span>有效开始时间</span>
            <input v-model="licenseForm.validFrom" type="date" class="rounded-2xl border border-sky-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none" />
          </label>
          <label class="grid gap-1 text-sm text-slate-600">
            <span>有效结束时间</span>
            <input v-model="licenseForm.validTo" type="date" class="rounded-2xl border border-sky-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none" />
          </label>
        </div>
        <div class="mt-6 flex justify-end gap-3">
          <button type="button" class="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200" @click="closeLicenseDialog">取消</button>
          <button type="button" class="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white" @click="createLicense">创建 License</button>
        </div>
      </div>
    </div>
    </Teleport>

    <Teleport to="body">
    <div v-if="disposalDialogOpen" class="fixed inset-0 z-[420] h-[100dvh] min-h-[100dvh] overflow-y-auto bg-slate-950/35 px-4 py-6 backdrop-blur-sm" @click.self="closeDisposalDialog">
      <div class="mx-auto w-full max-w-3xl rounded-[1.75rem] border border-sky-200 bg-white p-6 shadow-[0_1.75rem_5rem_rgba(15,23,42,0.24)]">
        <div class="flex items-center justify-between gap-3">
          <div>
            <div class="text-base font-semibold text-slate-950">处置反馈</div>
            <div class="mt-1 text-sm text-slate-500">选择处置结果，并核对反馈上下文。</div>
          </div>
          <button type="button" class="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800" @click="closeDisposalDialog">
            <X class="h-4 w-4" />
          </button>
        </div>
        <div v-if="selectedCoCreationEntry" class="mt-5 space-y-4">
          <div class="flex flex-wrap gap-2">
            <button
              v-for="status in coCreationStatuses"
              :key="status"
              type="button"
              class="rounded-full px-3 py-1.5 text-sm font-medium ring-1 transition"
              :class="selectedCoCreationStatus === status ? 'bg-blue-600 text-white ring-blue-600' : 'bg-white text-slate-700 ring-slate-200'"
              @click="selectedCoCreationStatus = status"
            >
              {{ status }}
            </button>
          </div>
          <div class="rounded-2xl bg-slate-50 p-4">
            <div class="mb-3 flex items-center justify-between gap-3">
              <div class="font-semibold text-slate-900">{{ selectedCoCreationEntry.sessionId }}</div>
              <span class="rounded-full px-2.5 py-1 text-[11px] ring-1" :class="selectedCoCreationEntry.action === 'like' ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : 'bg-rose-50 text-rose-700 ring-rose-200'">
                {{ coCreationTypeText(selectedCoCreationEntry.action) }}
              </span>
            </div>
            <div class="max-h-[420px] space-y-4 overflow-y-auto pr-2">
              <div class="flex justify-start">
                <div class="max-w-[78%] rounded-[1.25rem] rounded-bl-md bg-white px-4 py-3 text-sm leading-6 text-slate-700 shadow-sm ring-1 ring-slate-200">
                  <div class="mb-1 text-xs font-semibold text-slate-400">回答</div>
                  <div class="whitespace-pre-wrap">{{ selectedCoCreationEntry.answer }}</div>
                </div>
              </div>
              <div class="flex justify-end">
                <div class="max-w-[78%] rounded-[1.25rem] rounded-br-md bg-blue-600 px-4 py-3 text-sm leading-6 text-white shadow-sm">
                  <div class="mb-1 text-xs font-semibold text-blue-100">问题</div>
                  <div class="whitespace-pre-wrap">{{ selectedCoCreationEntry.question }}</div>
                </div>
              </div>
              <div class="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs leading-6 text-slate-500">
                <div class="mb-1 font-semibold text-slate-400">上下文补全</div>
                <div class="whitespace-pre-wrap">{{ formatContextPreview(selectedCoCreationEntry.contextMessages) }}</div>
              </div>
              <div v-if="selectedCoCreationEntry.reason" class="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-6 text-amber-800">
                <div class="mb-1 font-semibold">反馈原因</div>
                <div class="whitespace-pre-wrap">{{ selectedCoCreationEntry.reason }}</div>
              </div>
            </div>
          </div>
        </div>
        <div class="mt-6 flex justify-end gap-3">
          <button type="button" class="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200" @click="closeDisposalDialog">取消</button>
          <button type="button" class="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white" @click="submitCoCreationDisposal">确认处置</button>
        </div>
      </div>
    </div>
    </Teleport>

    <Teleport to="body">
    <div v-if="modelDialogOpen" class="fixed inset-0 z-[420] h-[100dvh] min-h-[100dvh] overflow-y-auto bg-slate-950/35 px-4 py-6 backdrop-blur-sm" @click.self="closeModelDialog">
      <div class="mx-auto w-full max-w-2xl rounded-[1.75rem] border border-sky-200 bg-white p-6 shadow-[0_1.75rem_5rem_rgba(15,23,42,0.24)]">
        <div class="flex items-center justify-between gap-3">
          <div>
            <div class="text-base font-semibold text-slate-950">新增模型</div>
            <div class="mt-1 text-sm text-slate-500">支持配置第三方模型或本地模型。</div>
          </div>
          <button type="button" class="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800" @click="closeModelDialog">
            <X class="h-4 w-4" />
          </button>
        </div>
        <div class="mt-5 inline-flex rounded-2xl bg-slate-100 p-1">
          <button
            type="button"
            class="rounded-xl px-4 py-2 text-sm font-semibold transition"
            :class="modelSourceTab === 'vendor' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500'"
            @click="modelSourceTab = 'vendor'"
          >
            第三方模型
          </button>
          <button
            type="button"
            class="rounded-xl px-4 py-2 text-sm font-semibold transition"
            :class="modelSourceTab === 'local' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500'"
            @click="modelSourceTab = 'local'"
          >
            本地模型
          </button>
        </div>
        <div class="mt-6 grid gap-4 md:grid-cols-2">
          <label class="grid gap-1 text-sm text-slate-600">
            <span>{{ modelSourceTab === 'local' ? '本地模型名称' : '供应商名称' }}</span>
            <input v-model="modelForm.name" class="rounded-2xl border border-sky-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none" :placeholder="modelSourceTab === 'local' ? '例如：本地 Qwen3' : '例如：千问、智谱'" />
          </label>
          <label class="grid gap-1 text-sm text-slate-600">
            <span>模型协议</span>
            <select v-model="modelForm.protocol" class="rounded-2xl border border-sky-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none">
              <option value="OpenAI">OpenAI</option>
            </select>
          </label>
          <label class="grid gap-1 text-sm text-slate-600">
            <span>Provider(供应商类型)</span>
            <input v-model="modelForm.provider" class="rounded-2xl border border-sky-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none" placeholder="例如：llama_cluster" />
          </label>
          <label class="grid gap-1 text-sm text-slate-600">
            <span>API Key <span class="text-slate-400">(可选)</span></span>
            <input v-model="modelForm.token" class="rounded-2xl border border-sky-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none" placeholder="无鉴权可留空" />
          </label>
          <label class="grid gap-1 text-sm text-slate-600 md:col-span-2">
            <span>Base URL(请求地址)</span>
            <input v-model="modelForm.endpoint" class="rounded-2xl border border-sky-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none" placeholder="http://127.0.0.1:19898/infra" />
          </label>
          <label class="grid gap-1 text-sm text-slate-600 md:col-span-2">
            <span>模型名称</span>
            <div class="flex items-center gap-2">
              <select v-model="modelForm.model" class="flex-1 rounded-2xl border border-sky-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none">
                <option value="" disabled>请先点击右侧「查询模型」</option>
                <option v-for="opt in queriedModelOptions" :key="opt" :value="opt">{{ opt }}</option>
              </select>
              <button
                type="button"
                class="inline-flex shrink-0 items-center gap-1.5 rounded-2xl px-4 py-2 text-sm font-semibold transition"
                :class="modelQueryLoading ? 'cursor-not-allowed bg-slate-100 text-slate-400' : 'bg-sky-600 text-white hover:bg-sky-700'"
                :disabled="modelQueryLoading"
                @click="queryModels"
              >
                <RefreshCw v-if="modelQueryLoading" class="h-3.5 w-3.5 animate-spin" />
                <Search v-else class="h-3.5 w-3.5" />
                查询模型
              </button>
            </div>
          </label>
          <div v-if="queriedModelOptions.length" class="md:col-span-2 rounded-2xl border border-sky-200 bg-sky-50/50 px-3 py-2 text-xs text-sky-700">
            已查询到 {{ queriedModelOptions.length }} 个可用模型，请从上方下拉框中选择。
          </div>
          <label v-if="modelSourceTab === 'local'" class="grid gap-1 text-sm text-slate-600 md:col-span-2">
            <span>Model Path(模型文件路径)</span>
            <input v-model="modelForm.modelPath" class="rounded-2xl border border-sky-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none" placeholder="models/gemma-4-26b-a4b-it/gemma-4-26B-A4B-it-UD-IQ4_XS.gguf" />
          </label>
          <label v-if="modelSourceTab === 'local'" class="grid gap-1 text-sm text-slate-600 md:col-span-2">
            <span>Mmproj Model Path(多模态模型路径) <span class="text-slate-400">(可选)</span></span>
            <input v-model="modelForm.mmprojModelPath" class="rounded-2xl border border-sky-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none" placeholder="models/gemma-4-26b-a4b-it/mmproj-F16.gguf" />
          </label>
          <label v-if="modelSourceTab === 'local'" class="grid gap-1 text-sm text-slate-600">
            <span>Image Precision <span class="text-slate-400">(可选，逗号分隔)</span></span>
            <input v-model="modelForm.imagePrecisionText" class="rounded-2xl border border-sky-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none" placeholder="280, 560, 1120" />
          </label>
          <label v-if="modelSourceTab === 'local'" class="grid gap-1 text-sm text-slate-600">
            <span>Context Size(上下文长度)</span>
            <input v-model.number="modelForm.ctxSize" type="number" class="rounded-2xl border border-sky-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none" placeholder="262144" />
          </label>
        </div>
        <div v-if="modelDialogError" class="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
          {{ modelDialogError }}
        </div>
        <div class="mt-6 flex justify-end gap-3">
          <button type="button" class="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200" @click="closeModelDialog">取消</button>
          <button type="button" class="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white" @click="saveModelConfig">保存模型</button>
        </div>
      </div>
    </div>
    </Teleport>

    <Teleport to="body">
    <div v-if="storagePolicyDialogOpen" class="fixed inset-0 z-[420] h-[100dvh] min-h-[100dvh] overflow-y-auto bg-slate-950/35 px-4 py-6 backdrop-blur-sm" @click.self="closeStoragePolicyDialog">
      <div class="mx-auto w-full max-w-2xl rounded-[1.75rem] border border-sky-200 bg-white p-6 shadow-[0_1.75rem_5rem_rgba(15,23,42,0.24)]">
        <div class="flex items-center justify-between gap-3">
          <div>
            <div class="text-base font-semibold text-slate-950">会话存储周期配置</div>
            <div class="mt-1 text-sm text-slate-500">支持平台默认策略与企业级例外配置，决定会话与上传文件的留存方式。</div>
          </div>
          <button type="button" class="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800" @click="closeStoragePolicyDialog">
            <X class="h-4 w-4" />
          </button>
        </div>
        <div class="mt-6 space-y-4">
          <div v-for="policy in store.storagePolicies" :key="policy.id" class="rounded-2xl border border-slate-200 bg-white p-4">
            <div class="flex items-center justify-between gap-3">
              <div>
                <div class="text-sm font-semibold text-slate-900">{{ policy.targetName }}</div>
                <div class="mt-1 text-xs text-slate-500">{{ policy.scope === 'global' ? '平台默认策略' : '企业定制策略' }}</div>
              </div>
              <span class="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200">{{ policy.cleanupMode === 'auto' ? '自动清理' : '人工确认' }}</span>
            </div>
            <div class="mt-4 grid gap-3">
              <label class="grid gap-1 text-sm text-slate-600">
                <span>存储周期（天）</span>
                <input v-model.number="storagePolicyDrafts[policy.id].retentionDays" type="number" class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none" />
              </label>
              <div class="flex flex-wrap items-center gap-2">
                <button type="button" class="rounded-full px-3 py-1.5 text-xs font-semibold ring-1" :class="storagePolicyDrafts[policy.id].cleanupMode === 'auto' ? 'bg-blue-600 text-white ring-blue-600' : 'bg-white text-slate-700 ring-slate-200'" @click="storagePolicyDrafts[policy.id].cleanupMode = 'auto'">自动清理</button>
                <button type="button" class="rounded-full px-3 py-1.5 text-xs font-semibold ring-1" :class="storagePolicyDrafts[policy.id].cleanupMode === 'manual' ? 'bg-blue-600 text-white ring-blue-600' : 'bg-white text-slate-700 ring-slate-200'" @click="storagePolicyDrafts[policy.id].cleanupMode = 'manual'">人工确认</button>
              </div>
              <label class="inline-flex items-center gap-2 text-sm text-slate-600">
                <input v-model="storagePolicyDrafts[policy.id].archiveBeforeDelete" type="checkbox" class="h-4 w-4 rounded border-slate-300" />
                删除前先归档
              </label>
            </div>
            <div class="mt-4 flex justify-end">
              <button type="button" class="rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white" @click="saveStoragePolicy(policy.id)">保存策略</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </Teleport>
  </PageFrame>
</template>

<style scoped>
/* 审计日志工具栏 */
.audit-section { border-radius: 1.75rem; border: 1px solid rgba(186, 230, 253, 0.7); background: rgba(255,255,255,.8); padding: 20px; box-shadow: 0 18px 56px rgba(14,116,144,.08); }
.audit-toolbar { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 14px; border-radius: 22px; background: #f8fafc; padding: 10px 12px; box-shadow: inset 0 0 0 1px #e2e8f0; }
.audit-search-box { position: relative; min-width: min(380px, 100%); flex: 1; }
.audit-search-box input { width: 100%; height: 36px; border: 1px solid #d1e8ff; border-radius: 10px; background: #fff; padding: 0 36px 0 36px; font-size: 13px; color: #1f2d3d; outline: none; transition: border-color .2s, box-shadow .2s; }
.audit-search-box input:focus { border-color: #38bdf8; box-shadow: 0 0 0 3px rgba(56,189,248,.14); }
.audit-search-box input::placeholder { color: #94a3b8; }
.audit-search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); width: 16px; height: 16px; color: #94a3b8; pointer-events: none; }
.audit-clear-btn { position: absolute; right: 7px; top: 50%; transform: translateY(-50%); display: flex; align-items: center; justify-content: center; width: 22px; height: 22px; border-radius: 6px; background: transparent; color: #94a3b8; transition: color .2s, background .2s; }
.audit-clear-btn:hover { color: #0098ff; background: rgba(0,152,255,.1); }
.audit-actions { display: flex; align-items: center; gap: 8px; }
.audit-select { height: 36px; border: 1px solid #d1e8ff; border-radius: 10px; background: #fff; padding: 0 28px 0 10px; font-size: 13px; color: #1f2d3d; outline: none; cursor: pointer; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 10px center; transition: border-color .2s, box-shadow .2s; }
.audit-select:focus { border-color: #38bdf8; box-shadow: 0 0 0 3px rgba(56,189,248,.14); }

/* 会话管理工具栏 */
.session-toolbar { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 14px; border-radius: 22px; background: #f8fafc; padding: 10px 12px; box-shadow: inset 0 0 0 1px #e2e8f0; }
.session-search { position: relative; min-width: min(380px, 100%); flex: 1; }
.session-search input { width: 100%; height: 36px; border: 1px solid #dbeafe; border-radius: 14px; background: #fff; padding: 0 12px; font-size: 13px; color: #1f2d3d; outline: none; transition: border-color .2s, box-shadow .2s; }
.session-search input:focus { border-color: #38bdf8; box-shadow: 0 0 0 3px rgba(56,189,248,.14); }
.session-search input::placeholder { color: #94a3b8; }
.session-filter-select { height: 36px; border: 1px solid #dbeafe; border-radius: 10px; background: #fff; padding: 0 28px 0 10px; font-size: 13px; color: #1f2d3d; outline: none; cursor: pointer; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 10px center; transition: border-color .2s, box-shadow .2s; }
.session-filter-select:focus { border-color: #38bdf8; box-shadow: 0 0 0 3px rgba(56,189,248,.14); }
.session-count { flex-shrink: 0; border-radius: 999px; background: #eff6ff; color: #1d4ed8; padding: 7px 12px; font-size: 12px; font-weight: 800; }
.session-config-btn { display: inline-flex; align-items: center; gap: 7px; border-radius: 14px; padding: 8px 14px; font-size: 13px; font-weight: 700; background: #fff; color: #334155; box-shadow: inset 0 0 0 1px #e2e8f0; transition: background .2s, color .2s; }
.session-config-btn:hover { background: #f1f5f9; color: #0f172a; }
.session-table-wrap { overflow-x: auto; border-radius: 24px; border: 1px solid #e2e8f0; background: #fff; box-shadow: 0 14px 36px rgba(15,23,42,.05); }

/* 反馈列表工具栏 */
.feedback-toolbar { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 14px; border-radius: 22px; background: #f8fafc; padding: 10px 12px; box-shadow: inset 0 0 0 1px #e2e8f0; }
.feedback-filter-select { height: 36px; border: 1px solid #dbeafe; border-radius: 10px; background: #fff; padding: 0 28px 0 10px; font-size: 13px; color: #1f2d3d; outline: none; cursor: pointer; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 10px center; transition: border-color .2s, box-shadow .2s; }
.feedback-filter-select:focus { border-color: #38bdf8; box-shadow: 0 0 0 3px rgba(56,189,248,.14); }
.feedback-search { position: relative; min-width: min(380px, 100%); flex: 1; }
.feedback-search input { width: 100%; height: 36px; border: 1px solid #dbeafe; border-radius: 14px; background: #fff; padding: 0 12px; font-size: 13px; color: #1f2d3d; outline: none; transition: border-color .2s, box-shadow .2s; }
.feedback-search input:focus { border-color: #38bdf8; box-shadow: 0 0 0 3px rgba(56,189,248,.14); }
.feedback-search input::placeholder { color: #94a3b8; }
.feedback-count { flex-shrink: 0; border-radius: 999px; background: #eff6ff; color: #1d4ed8; padding: 7px 12px; font-size: 12px; font-weight: 800; }
.feedback-table-wrap { overflow-x: auto; border-radius: 24px; border: 1px solid #e2e8f0; background: #fff; box-shadow: 0 14px 36px rgba(15,23,42,.05); }
</style>
