import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export type PackageCode = 'lite' | 'standard' | 'pro' | 'enterprise'
export type FeatureStatus = 'enabled' | 'disabled' | 'paid'
export type FeatureCode = 'assistant' | 'knowledge' | 'agent' | 'mcp' | 'apiKey' | 'system' | 'ocr' | 'modelSwitch'
export type CoCreationStatus = '待处置' | '已采纳' | '误判' | '已搁置'
export type ModuleCode = 'agent' | 'mcp'
export type ModuleSelections = {
  agent: string[]
  mcp: string[]
}

export type LicenseTemplateCode = PackageCode | 'highschool'

export type LicenseTemplate = {
  id: string
  code: LicenseTemplateCode
  name: string
  desc: string
  modules: ModuleCode[]
  moduleSelections: ModuleSelections
  features: FeatureCode[]
  highlights: string[]
  status: 'active' | 'draft'
}

export type FeatureGate = {
  code: FeatureCode
  label: string
  packageCode: LicenseTemplateCode
  status: FeatureStatus
}

export type LicenseInstance = {
  id: string
  licenseNo: string
  templateId: string
  templateName: string
  status: 'active' | 'disabled' | 'expired' | 'draft'
  effectiveFeatures: FeatureCode[]
  validFrom: string
  validTo: string
  createdAt: number
}

export type DemoAccount = {
  id: string
  name: string
  role: string
  scene: string
}

export type AccountLicenseBinding = {
  id: string
  accountId: string
  accountName: string
  licenseId: string
  licenseNo: string
  assignedAt: number
}

export type ModelConfig = {
  id: string
  name: string
  source: 'local' | 'vendor'
  vendor: string
  protocol?: 'OpenAI'
  provider?: string
  endpoint?: string
  token?: string
  model?: string
  modelPath?: string
  mmprojModelPath?: string
  imagePrecision?: number[]
  ctxSize?: number
  version: string
  enabled: boolean
  latencyMs: number
  locked?: boolean
  lastTestStatus?: 'success' | 'failed' | 'untested'
  lastTestMessage?: string
  lastTestAt?: number
}

export type MessageFeedback = {
  id: string
  messageId: string
  conversationId: string
  action: 'like' | 'dislike' | 'correct'
  note: string
  createdAt: number
}

export type ExpertCoCreationEntry = {
  id: string
  messageId: string
  conversationId: string
  sessionId: string
  feedbackUser: string
  action: 'like' | 'dislike'
  category?: '令人反感' | '不安全' | '与事实不符' | '与指令不符' | '个性化设置问题' | '更多'
  reason?: string
  question: string
  answer: string
  contextMessages: Array<{ role: 'user' | 'assistant'; content: string }>
  status: CoCreationStatus
  createdAt: number
}

export type ContextPack = {
  id: string
  conversationId: string
  userQuestion: string
  aiAnswer: string
  agent: string
  modelSource: string
  modelName: string
  modelVersion: string
  ragReferences: string[]
  toolCalls: string[]
  uploadedFiles: string[]
  ocrText: string
  logId: string
  createdAt: number
}

export type UploadFileItem = {
  id: string
  name: string
  type: string
  status: 'uploading' | 'uploaded' | 'expired' | 'failed' | 'retryable'
  ocrTaskId?: string
  createdAt: number
}

export type OcrTask = {
  id: string
  fileName: string
  status: 'pending' | 'success' | 'failed'
  text: string
  createdAt: number
}

export type ToolTestCase = {
  id: string
  toolName: string
  params: string
  imageName?: string
  statusCode: number
  latencyMs: number
  status: 'success' | 'failed'
  response: string
  logId: string
  createdAt: number
}

export type AuditLog = {
  id: string
  user: string
  agent: string
  ip: string
  requestParams: string
  responseData: string
  success: boolean
  time: number
}

export type UsageSkillMetric = {
  id: string
  skill: string
  requests: number
  tokens: number
  users: number
}

export type UsageOverview = {
  totalRequests: number
  totalTokens: number
  totalUsers: number
}

export type UsageKeyMetric = {
  id: string
  keyName: string
  owner: string
  requests: number
  tokens: number
  skills: Array<{
    skill: string
    requests: number
  }>
}

export type BackupSnapshotItem = {
  id: string
  snapshotNo: string
  createdAt: number
  status: '进行中' | '已完成'
  services: string[]
}

export type QuotaDimension = 'requests' | 'tokens' | 'storage'
export type QuotaCycle = 'daily' | 'monthly'

export type EnterpriseQuotaPlan = {
  id: string
  enterpriseName: string
  cycle: QuotaCycle
  requestLimit: number
  tokenLimit: number
  storageLimitGb: number
  validFrom: string
  validTo: string
  assignedRequestLimit: number
  assignedTokenLimit: number
  assignedStorageLimitGb: number
  requestUsed: number
  tokenUsed: number
  storageUsedGb: number
  overageMode: 'block' | 'warn'
  warningThreshold: number
}

export type TenantRecord = {
  id: string
  tenantName: string
  tenantCode: string
  ownerName: string
  memberCount: number
  status: 'active' | 'disabled'
  createdAt: number
}

export type UserQuotaAllocation = {
  id: string
  userId: string
  userName: string
  department: string
  tenantId: string
  tenantName: string
  role: string
  accountStatus: 'active' | 'disabled'
  requestLimit: number
  tokenLimit: number
  storageLimitGb: number
  requestUsed: number
  tokenUsed: number
  storageUsedGb: number
  status: 'normal' | 'warning' | 'exceeded'
  lastActiveAt: number
}

export type QuotaAdjustmentRecord = {
  id: string
  targetType: 'enterprise' | 'user'
  targetName: string
  dimension: QuotaDimension
  before: number
  after: number
  operator: string
  reason: string
  createdAt: number
}

export type SessionGovernanceRecord = {
  id: string
  sessionId: string
  userName: string
  department: string
  agentName: string
  topic: string
  riskLevel: '低' | '中' | '高'
  retentionDays: number
  status: '正常' | '待复核' | '已冻结' | '已清理'
  messageCount: number
  updatedAt: number
}

export type StoragePolicyConfig = {
  id: string
  scope: 'global' | 'enterprise'
  targetName: string
  retentionDays: number
  cleanupMode: 'auto' | 'manual'
  archiveBeforeDelete: boolean
  updatedAt: number
}

export type AgentTraceStep = {
  id: string
  type: 'intent' | 'rewrite' | 'rag' | 'tool' | 'model' | 'guard'
  title: string
  detail: string
  durationMs: number
  status: 'success' | 'warning'
}

export type AgentInvocationTrace = {
  id: string
  conversationId: string
  messageId: string
  agentName: string
  summary: string
  totalLatencyMs: number
  totalTokens: number
  finishedAt: number
  steps: AgentTraceStep[]
}

export type AssetLedgerRecord = {
  id: string
  businessNo: string
  accountName: string
  direction: '收入' | '支出'
  assetType: 'Token' | '算力' | '知识存储'
  amount: number
  balanceAfter: number
  source: string
  remark: string
  createdAt: number
}

export type MetadataTag = {
  id: string
  name: string
  code: string
  valueType: 'enum' | 'text'
  required: boolean
  options: string[]
  description: string
  updatedAt: number
}

export type KnowledgeDocumentMetadata = {
  id: string
  knowledgeBaseId: string
  documentName: string
  sourceType: 'manual' | 'upload'
  values: Record<string, string>
  updatedAt: number
}

function uid(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

const featureLabelMap: Record<FeatureCode, string> = {
  assistant: 'AI 助手',
  knowledge: 'AI 知识库',
  agent: 'AI 智能体',
  mcp: 'AI 技能',
  apiKey: 'API 密钥',
  system: '系统设置',
  ocr: 'OCR 能力',
  modelSwitch: '模型切换',
}

export const moduleLabelMap: Record<ModuleCode, string> = {
  agent: 'Agent',
  mcp: 'AI 技能',
}

const moduleFeatureMap: Record<ModuleCode, FeatureCode[]> = {
  agent: ['assistant', 'agent'],
  mcp: ['mcp', 'apiKey'],
}

const emptyModuleSelections = (): ModuleSelections => ({
  agent: [],
  mcp: [],
})

const licenseTemplatesSeed: LicenseTemplate[] = [
  { id: 'tpl-highschool', code: 'highschool', name: '高中版', desc: '面向校园与轻量演示场景，默认只开放 Agent 对话。', modules: ['agent'], moduleSelections: { agent: ['智能问答'], mcp: [] }, features: ['assistant', 'agent'], highlights: ['Agent 对话'], status: 'active' },
  { id: 'tpl-standard', code: 'standard', name: '标准版', desc: '覆盖常规业务演示，开放 Agent 与 AI 技能调用。', modules: ['agent', 'mcp'], moduleSelections: { agent: ['智能问答', '智能问数'], mcp: ['智能体问答', 'OCR识别'] }, features: ['assistant', 'agent', 'mcp', 'apiKey'], highlights: ['Agent 对话', 'AI 技能调用'], status: 'active' },
  { id: 'tpl-pro', code: 'pro', name: '专业版', desc: '面向联调与业务测试，开放 Agent 与 AI 技能能力。', modules: ['agent', 'mcp'], moduleSelections: { agent: ['智能问答', '隐患视图', '智能问数'], mcp: ['智能体问答', 'OCR识别', '人脸算法'] }, features: ['assistant', 'agent', 'mcp', 'apiKey', 'ocr', 'modelSwitch'], highlights: ['Agent 对话', 'AI 技能调用'], status: 'active' },
  { id: 'tpl-enterprise', code: 'enterprise', name: '企业版', desc: '增加系统治理、审计、备份等平台治理能力。', modules: ['agent', 'mcp'], moduleSelections: { agent: ['智能问答', '隐患视图', '智能问数'], mcp: ['智能体问答', 'OCR识别', '人脸算法'] }, features: ['assistant', 'agent', 'mcp', 'apiKey', 'system', 'ocr', 'modelSwitch'], highlights: ['Agent 对话', 'AI 技能调用'], status: 'active' },
]

export const useNewAIStore = defineStore('newAI', () => {
  const licenseTemplates = ref<LicenseTemplate[]>(licenseTemplatesSeed)
  const licenseInstances = ref<LicenseInstance[]>([
    {
      id: 'lic-standard-001',
      licenseNo: 'LIC-STD-202605-001',
      templateId: 'tpl-standard',
      templateName: '标准版',
      status: 'active',
      effectiveFeatures: ['assistant', 'knowledge', 'agent', 'apiKey', 'mcp'],
      validFrom: '2026-05-01',
      validTo: '2026-12-31',
      createdAt: Date.now() - 86_400_00 * 5,
    },
    {
      id: 'lic-highschool-001',
      licenseNo: 'LIC-HS-202605-001',
      templateId: 'tpl-highschool',
      templateName: '高中版',
      status: 'active',
      effectiveFeatures: ['assistant', 'knowledge'],
      validFrom: '2026-05-10',
      validTo: '2026-09-30',
      createdAt: Date.now() - 86_400_00 * 3,
    },
    {
      id: 'lic-enterprise-001',
      licenseNo: 'LIC-ENT-202605-001',
      templateId: 'tpl-enterprise',
      templateName: '企业版',
      status: 'active',
      effectiveFeatures: ['assistant', 'knowledge', 'agent', 'mcp', 'apiKey', 'system', 'ocr', 'modelSwitch'],
      validFrom: '2026-05-01',
      validTo: '2027-04-30',
      createdAt: Date.now() - 86_400_00 * 15,
    },
  ])
  const demoAccounts = ref<DemoAccount[]>([
    { id: 'acct-demo-1', name: '新账号-A', role: '业务测试账号', scene: '新账号授权验证' },
    { id: 'acct-demo-2', name: '用户名称', role: '运营管理员', scene: '商业化演示' },
    { id: 'acct-demo-3', name: '平台管理员-C', role: '平台管理员', scene: '全功能验证' },
  ])
  const accountLicenseBindings = ref<AccountLicenseBinding[]>([
    { id: 'bind-1', accountId: 'acct-demo-1', accountName: '新账号-A', licenseId: 'lic-highschool-001', licenseNo: 'LIC-HS-202605-001', assignedAt: Date.now() - 86_400_00 },
    { id: 'bind-2', accountId: 'acct-demo-2', accountName: '用户名称', licenseId: 'lic-standard-001', licenseNo: 'LIC-STD-202605-001', assignedAt: Date.now() - 43_200_00 },
    { id: 'bind-3', accountId: 'acct-demo-3', accountName: '平台管理员-C', licenseId: 'lic-enterprise-001', licenseNo: 'LIC-ENT-202605-001', assignedAt: Date.now() - 12_000_00 },
  ])
  const currentAccountId = ref('acct-demo-2')
  const paywall = ref<{ open: boolean; featureLabel: string; packageName: string }>({ open: false, featureLabel: '', packageName: '' })
  const models = ref<ModelConfig[]>([
    {
      id: 'local-qwen3',
      name: 'Qwen3-32B',
      source: 'local',
      vendor: '官方本地模型',
      protocol: 'OpenAI',
      endpoint: 'http://127.0.0.1:8000/v1',
      token: 'local-demo-token',
      model: 'qwen3-32b',
      version: '2026.05',
      enabled: true,
      latencyMs: 1260,
      locked: true,
      lastTestStatus: 'success',
      lastTestMessage: '本地模型可用',
      lastTestAt: Date.now() - 86_400_00,
    },
    {
      id: 'local-deepseek',
      name: 'DeepSeek-R1',
      source: 'local',
      vendor: '官方本地模型',
      protocol: 'OpenAI',
      endpoint: 'http://127.0.0.1:8001/v1',
      token: 'local-demo-token',
      model: 'deepseek-r1',
      version: '2026.05',
      enabled: true,
      latencyMs: 1890,
      locked: true,
      lastTestStatus: 'success',
      lastTestMessage: '本地模型可用',
      lastTestAt: Date.now() - 43_200_00,
    },
  ])
  const activeModelId = ref('local-qwen3')
  const messageFeedbacks = ref<MessageFeedback[]>([])
  const contextPacks = ref<ContextPack[]>([])
  const uploads = ref<UploadFileItem[]>([])
  const ocrTasks = ref<OcrTask[]>([])
  const toolTests = ref<ToolTestCase[]>([])
  const coCreationEntries = ref<ExpertCoCreationEntry[]>([
    {
      id: 'cocreate-1',
      messageId: 'assistant-demo-1',
      conversationId: 'conv-demo-1',
      sessionId: 'session-risk-20260524-001',
      feedbackUser: '王晓明',
      action: 'dislike',
      category: '与事实不符',
      reason: '回答中把高风险隐患数量写成 18 条，但本次巡检报表实际是 16 条，需要按最新巡检结果修正。',
      question: '请总结本月隐患巡检的高风险项和闭环情况。',
      answer: '本月共发现高风险隐患 18 条，当前闭环率为 76%。建议重点关注装置区和仓储区。',
      contextMessages: [
        { role: 'user', content: '请总结本月隐患巡检的高风险项和闭环情况。' },
        { role: 'assistant', content: '本月共发现高风险隐患 18 条，当前闭环率为 76%。建议重点关注装置区和仓储区。' },
        { role: 'user', content: '补充下高风险项分别来自哪些区域。' },
        { role: 'assistant', content: '主要来自装置区、仓储区和动力站，其中装置区占比最高。' },
      ],
      status: '待处置',
      createdAt: Date.now() - 3_600_000,
    },
    {
      id: 'cocreate-2',
      messageId: 'assistant-demo-2',
      conversationId: 'conv-demo-2',
      sessionId: 'session-mcp-20260524-007',
      feedbackUser: '李婷',
      action: 'like',
      question: '帮我解释一下 OCR 工具测试失败的可能原因。',
      answer: '通常需要先检查图片格式、超时配置、以及 OCR 服务的鉴权参数是否匹配当前环境。',
      contextMessages: [
        { role: 'user', content: '帮我解释一下 OCR 工具测试失败的可能原因。' },
        { role: 'assistant', content: '通常需要先检查图片格式、超时配置、以及 OCR 服务的鉴权参数是否匹配当前环境。' },
      ],
      status: '已采纳',
      createdAt: Date.now() - 86_400_000,
    },
    {
      id: 'cocreate-3',
      messageId: 'assistant-demo-3',
      conversationId: 'conv-demo-3',
      sessionId: 'session-doc-20260525-011',
      feedbackUser: '赵雨晴',
      action: 'dislike',
      category: '与指令不符',
      reason: '用户要求输出会议纪要三段式摘要，但回复直接给了长文说明，没有按既定格式返回。',
      question: '请按三段式输出晨会纪要：风险、进展、待办。',
      answer: '今天晨会主要讨论了巡检、隐患整改和 OCR 识别接入，以下是详细说明......',
      contextMessages: [
        { role: 'user', content: '请按三段式输出晨会纪要：风险、进展、待办。' },
        { role: 'assistant', content: '今天晨会主要讨论了巡检、隐患整改和 OCR 识别接入，以下是详细说明......' },
        { role: 'user', content: '我需要的是固定格式，不是长文。' },
        { role: 'assistant', content: '收到，下次将按固定格式输出。' },
      ],
      status: '误判',
      createdAt: Date.now() - 22_000_000,
    },
  ])
  const auditLogs = ref<AuditLog[]>([
    {
      id: 'audit-seed-1',
      user: 'zhouli@geeklab.com',
      agent: '智能助手',
      ip: '10.32.18.24',
      requestParams: '{"model":"DeepSeek-R1","prompt":"分析Q1安全报告"}',
      responseData: '{"status":"ok","tokens":1842}',
      success: true,
      time: Date.now() - 1_200_000,
    },
    {
      id: 'audit-seed-2',
      user: 'wangmin@geeklab.com',
      agent: '知识库问答',
      ip: '10.32.18.31',
      requestParams: '{"query":"企业安全规范第3章","topK":5}',
      responseData: '{"error":"索引未就绪"}',
      success: false,
      time: Date.now() - 6_600_000,
    },
    {
      id: 'audit-seed-3',
      user: 'liuting@geeklab.com',
      agent: '巡检助手',
      ip: '10.32.17.88',
      requestParams: '{"deviceId":"WP-007","zone":"B3"}',
      responseData: '{"status":"ok","issues":0}',
      success: true,
      time: Date.now() - 14_400_000,
    },
    {
      id: 'audit-seed-4',
      user: 'chenxi@geeklab.com',
      agent: '报告生成',
      ip: '10.32.19.15',
      requestParams: '{"template":"monthly","range":"2026-05"}',
      responseData: '{"status":"ok","pages":12}',
      success: true,
      time: Date.now() - 28_800_000,
    },
  ])
  const usageOverview = ref<UsageOverview>({
    totalRequests: 12846,
    totalTokens: 4862300,
    totalUsers: 214,
  })
  const usageBySkill = ref<UsageSkillMetric[]>([
    { id: 'usage-1', skill: 'AI 助手', requests: 4820, tokens: 1824300, users: 198 },
    { id: 'usage-2', skill: '知识库问答', requests: 2678, tokens: 934200, users: 142 },
    { id: 'usage-3', skill: 'AI 技能', requests: 1934, tokens: 621500, users: 96 },
    { id: 'usage-4', skill: '隐患识图 / OCR', requests: 1742, tokens: 803600, users: 88 },
    { id: 'usage-5', skill: '智能问数', requests: 1672, tokens: 678700, users: 74 },
  ])
  const usageByKey = ref<UsageKeyMetric[]>([
    {
      id: 'key-usage-1',
      keyName: 'ak-enterprise-prod',
      owner: '企业运营中心',
      requests: 3842,
      tokens: 1423600,
      skills: [
        { skill: 'AI 助手', requests: 1280 },
        { skill: 'AI 技能', requests: 964 },
        { skill: '知识库问答', requests: 812 },
        { skill: '隐患识图 / OCR', requests: 786 },
      ],
    },
    {
      id: 'key-usage-2',
      keyName: 'ak-agent-training',
      owner: '智能体运营组',
      requests: 2965,
      tokens: 1184200,
      skills: [
        { skill: 'AI 助手', requests: 925 },
        { skill: '知识库问答', requests: 886 },
        { skill: '智能问数', requests: 674 },
        { skill: 'AI 技能', requests: 480 },
      ],
    },
    {
      id: 'key-usage-3',
      keyName: 'ak-ocr-demo',
      owner: '安环业务线',
      requests: 2118,
      tokens: 906400,
      skills: [
        { skill: '隐患识图 / OCR', requests: 1192 },
        { skill: 'AI 助手', requests: 402 },
        { skill: 'AI 技能', requests: 314 },
        { skill: '知识库问答', requests: 210 },
      ],
    },
  ])
  const backupSnapshots = ref<BackupSnapshotItem[]>([
    {
      id: 'snapshot-1',
      snapshotNo: 'SNAP-20260524-090000',
      createdAt: new Date('2026-05-24T09:00:00+08:00').getTime(),
      status: '已完成',
      services: ['知识库', '业务数据', '算法配置'],
    },
    {
      id: 'snapshot-2',
      snapshotNo: 'SNAP-20260523-210000',
      createdAt: new Date('2026-05-23T21:00:00+08:00').getTime(),
      status: '已完成',
      services: ['知识库', '业务数据', '算法配置'],
    },
  ])
  const backupJobEndsAt = ref<number | null>(null)
  const enterpriseQuotaPlan = ref<EnterpriseQuotaPlan>({
    id: 'quota-ent-1',
    enterpriseName: '极客光年演示企业',
    cycle: 'monthly',
    requestLimit: 120000,
    tokenLimit: 12000000,
    storageLimitGb: 240,
    validFrom: '2026-06-01',
    validTo: '2026-06-30',
    assignedRequestLimit: 66000,
    assignedTokenLimit: 6800000,
    assignedStorageLimitGb: 92,
    requestUsed: 76840,
    tokenUsed: 7426000,
    storageUsedGb: 112,
    overageMode: 'warn',
    warningThreshold: 0.8,
  })
  const tenantRecords = ref<TenantRecord[]>([
    {
      id: 'tenant-demo-1',
      tenantName: '极客光年演示企业',
      tenantCode: 'GEEK-DEMO',
      ownerName: '平台管理员-C',
      memberCount: 2,
      status: 'active',
      createdAt: Date.now() - 20 * 24 * 3600 * 1000,
    },
    {
      id: 'tenant-demo-2',
      tenantName: '业务测试租户',
      tenantCode: 'BIZ-TEST',
      ownerName: '新账号-A',
      memberCount: 1,
      status: 'active',
      createdAt: Date.now() - 8 * 24 * 3600 * 1000,
    },
  ])
  const userQuotaAllocations = ref<UserQuotaAllocation[]>([
    {
      id: 'quota-user-1',
      userId: 'acct-demo-2',
      userName: '用户名称',
      department: '运营中心',
      tenantId: 'tenant-demo-1',
      tenantName: '极客光年演示企业',
      role: '业务使用者',
      accountStatus: 'active',
      requestLimit: 26000,
      tokenLimit: 2800000,
      storageLimitGb: 36,
      requestUsed: 24120,
      tokenUsed: 2268000,
      storageUsedGb: 18,
      status: 'warning',
      lastActiveAt: Date.now() - 20 * 60 * 1000,
    },
    {
      id: 'quota-user-2',
      userId: 'acct-demo-1',
      userName: '新账号-A',
      department: '业务测试组',
      tenantId: 'tenant-demo-2',
      tenantName: '业务测试租户',
      role: '租户管理员',
      accountStatus: 'active',
      requestLimit: 18000,
      tokenLimit: 1600000,
      storageLimitGb: 24,
      requestUsed: 6210,
      tokenUsed: 542000,
      storageUsedGb: 7,
      status: 'normal',
      lastActiveAt: Date.now() - 3 * 3600 * 1000,
    },
    {
      id: 'quota-user-3',
      userId: 'acct-demo-3',
      userName: '平台管理员-C',
      department: '平台治理组',
      tenantId: 'tenant-demo-1',
      tenantName: '极客光年演示企业',
      role: '平台管理员',
      accountStatus: 'active',
      requestLimit: 22000,
      tokenLimit: 2400000,
      storageLimitGb: 32,
      requestUsed: 22380,
      tokenUsed: 2496000,
      storageUsedGb: 28,
      status: 'exceeded',
      lastActiveAt: Date.now() - 55 * 60 * 1000,
    },
  ])
  const quotaAdjustmentRecords = ref<QuotaAdjustmentRecord[]>([
    {
      id: 'quota-adjust-1',
      targetType: 'user',
      targetName: '平台管理员-C',
      dimension: 'tokens',
      before: 2000000,
      after: 2400000,
      operator: '产品演示账号',
      reason: '补齐 6 月算法联调与平台治理验收额度',
      createdAt: Date.now() - 5 * 3600 * 1000,
    },
    {
      id: 'quota-adjust-2',
      targetType: 'enterprise',
      targetName: '极客光年演示企业',
      dimension: 'storage',
      before: 180,
      after: 240,
      operator: '产品演示账号',
      reason: '知识库文档与会话留痕量提升，扩容存储池',
      createdAt: Date.now() - 28 * 3600 * 1000,
    },
  ])
  const sessionGovernanceRecords = ref<SessionGovernanceRecord[]>([
    {
      id: 'session-govern-1',
      sessionId: 'session-rag-20260601-001',
      userName: '用户名称',
      department: '运营中心',
      agentName: '知识库问答',
      topic: '危险作业票审批合规核对',
      riskLevel: '中',
      retentionDays: 180,
      status: '正常',
      messageCount: 14,
      updatedAt: Date.now() - 35 * 60 * 1000,
    },
    {
      id: 'session-govern-2',
      sessionId: 'session-agent-20260601-005',
      userName: '平台管理员-C',
      department: '平台治理组',
      agentName: '通用助手',
      topic: '企业额度异常与超额告警排查',
      riskLevel: '高',
      retentionDays: 365,
      status: '待复核',
      messageCount: 26,
      updatedAt: Date.now() - 90 * 60 * 1000,
    },
    {
      id: 'session-govern-3',
      sessionId: 'session-doc-20260531-011',
      userName: '新账号-A',
      department: '业务测试组',
      agentName: '文档编写',
      topic: '制度文档首稿生成',
      riskLevel: '低',
      retentionDays: 90,
      status: '已冻结',
      messageCount: 8,
      updatedAt: Date.now() - 9 * 3600 * 1000,
    },
  ])
  const storagePolicies = ref<StoragePolicyConfig[]>([
    {
      id: 'storage-policy-global',
      scope: 'global',
      targetName: '全平台默认',
      retentionDays: 180,
      cleanupMode: 'auto',
      archiveBeforeDelete: true,
      updatedAt: Date.now() - 3 * 3600 * 1000,
    },
    {
      id: 'storage-policy-enterprise-1',
      scope: 'enterprise',
      targetName: '极客光年演示企业',
      retentionDays: 365,
      cleanupMode: 'manual',
      archiveBeforeDelete: true,
      updatedAt: Date.now() - 26 * 3600 * 1000,
    },
  ])
  const assetLedgerRecords = ref<AssetLedgerRecord[]>([
    {
      id: 'ledger-1',
      businessNo: 'LEDGER-20260601-001',
      accountName: '极客光年演示企业',
      direction: '支出',
      assetType: 'Token',
      amount: 380000,
      balanceAfter: 7420000,
      source: 'AI 助手 + 知识库问答',
      remark: '月初运营问答与知识检索消耗',
      createdAt: Date.now() - 2 * 3600 * 1000,
    },
    {
      id: 'ledger-2',
      businessNo: 'LEDGER-20260531-013',
      accountName: '极客光年演示企业',
      direction: '支出',
      assetType: '知识存储',
      amount: 12,
      balanceAfter: 112,
      source: '知识库文档上传',
      remark: '新增制度汇编、培训材料、FAQ 索引',
      createdAt: Date.now() - 12 * 3600 * 1000,
    },
    {
      id: 'ledger-3',
      businessNo: 'LEDGER-20260530-008',
      accountName: '极客光年演示企业',
      direction: '收入',
      assetType: '算力',
      amount: 2400,
      balanceAfter: 18600,
      source: '管理员手工补配',
      remark: '补足通用 Agent 联调算力池',
      createdAt: Date.now() - 32 * 3600 * 1000,
    },
  ])
  const metadataTags = ref<MetadataTag[]>([
    {
      id: 'meta-tag-1',
      name: '所属场景',
      code: 'scene',
      valueType: 'enum',
      required: true,
      options: ['安全生产', '教育培训', '双重预防', '特殊作业', '承包商'],
      description: '标识文档被检索时的主要业务场景。',
      updatedAt: Date.now() - 5 * 3600 * 1000,
    },
    {
      id: 'meta-tag-2',
      name: '资料级别',
      code: 'level',
      valueType: 'enum',
      required: true,
      options: ['制度', '标准', '案例', '问答', '台账'],
      description: '用于区分法规制度、案例经验和业务台账等资料类型。',
      updatedAt: Date.now() - 8 * 3600 * 1000,
    },
    {
      id: 'meta-tag-3',
      name: '来源部门',
      code: 'source_dept',
      valueType: 'text',
      required: false,
      options: [],
      description: '记录知识来源部门，便于后续追溯与责任校验。',
      updatedAt: Date.now() - 30 * 3600 * 1000,
    },
  ])
  const knowledgeDocumentMetadatas = ref<KnowledgeDocumentMetadata[]>([
    {
      id: 'kb-meta-1',
      knowledgeBaseId: 'kb-1',
      documentName: '《安全生产知识库》基础制度汇编',
      sourceType: 'upload',
      values: { scene: '安全生产', level: '制度', source_dept: '安环部' },
      updatedAt: Date.now() - 2 * 3600 * 1000,
    },
    {
      id: 'kb-meta-2',
      knowledgeBaseId: 'kb-2',
      documentName: '《特种设备安全管理制度》',
      sourceType: 'manual',
      values: { scene: '特殊作业', level: '标准', source_dept: '设备部' },
      updatedAt: Date.now() - 7 * 3600 * 1000,
    },
  ])
  const agentInvocationTraces = ref<AgentInvocationTrace[]>([
    {
      id: 'trace-demo-1',
      conversationId: 'conv-demo-1',
      messageId: 'assistant-demo-1',
      agentName: '知识库问答',
      summary: '完成意图识别、知识召回、依据拼接与答案生成。',
      totalLatencyMs: 3240,
      totalTokens: 4821,
      finishedAt: Date.now() - 40 * 60 * 1000,
      steps: [
        { id: 'trace-demo-1-step-1', type: 'intent', title: '意图识别', detail: '识别为制度问答与整改建议组合请求。', durationMs: 160, status: 'success' },
        { id: 'trace-demo-1-step-2', type: 'rag', title: '知识召回', detail: '命中 4 段制度条文与 2 条案例问答。', durationMs: 820, status: 'success' },
        { id: 'trace-demo-1-step-3', type: 'guard', title: '合规校验', detail: '检查输出是否包含依据说明与整改动作。', durationMs: 210, status: 'success' },
        { id: 'trace-demo-1-step-4', type: 'model', title: '答案生成', detail: '使用 Qwen3-32B 生成结构化回答。', durationMs: 2050, status: 'success' },
      ],
    },
  ])
  const miniProgramChecklist = ref([
    'AI 对话',
    '拍照 OCR',
    '上传文件',
    '专家反馈',
    '历史记录',
    '付费提示',
  ])

  const currentAccount = computed(() => demoAccounts.value.find(item => item.id === currentAccountId.value) || demoAccounts.value[0])
  const currentBinding = computed(() => accountLicenseBindings.value.find(item => item.accountId === currentAccountId.value) || null)
  const currentLicenseInstance = computed(() => licenseInstances.value.find(item => item.id === currentBinding.value?.licenseId) || null)
  const currentLicenseTemplate = computed(() => licenseTemplates.value.find(item => item.id === currentLicenseInstance.value?.templateId) || null)
  const isCurrentLicenseUsable = computed(() => {
    const license = currentLicenseInstance.value
    if (!license || license.status !== 'active') return false
    const now = new Date()
    const from = new Date(`${license.validFrom}T00:00:00`)
    const to = new Date(`${license.validTo}T23:59:59`)
    return now >= from && now <= to
  })
  const currentPackage = computed(() => currentLicenseTemplate.value || licenseTemplates.value[0])
  const activePackage = computed(() => currentLicenseTemplate.value?.code || licenseTemplates.value[0]?.code || 'standard')
  const featureGates = computed<FeatureGate[]>(() => {
    const enabled = new Set((isCurrentLicenseUsable.value ? currentLicenseInstance.value?.effectiveFeatures : []) || [])
    return (Object.keys(featureLabelMap) as FeatureCode[]).map((code) => {
      const ownerTemplate = licenseTemplates.value.find(item => item.features.includes(code)) || licenseTemplates.value[0]
      return {
        code,
        label: featureLabelMap[code],
        packageCode: ownerTemplate.code,
        status: enabled.has(code) ? 'enabled' : isCurrentLicenseUsable.value ? 'paid' : 'disabled',
      }
    })
  })
  const activeModel = computed(() => models.value.find(item => item.id === activeModelId.value) || models.value[0])
  const localModels = computed(() => models.value.filter(item => item.source === 'local'))
  const vendorModels = computed(() => models.value.filter(item => item.source === 'vendor'))
  const enterpriseQuotaUsage = computed(() => ({
    requestRatio: enterpriseQuotaPlan.value.requestLimit ? enterpriseQuotaPlan.value.requestUsed / enterpriseQuotaPlan.value.requestLimit : 0,
    tokenRatio: enterpriseQuotaPlan.value.tokenLimit ? enterpriseQuotaPlan.value.tokenUsed / enterpriseQuotaPlan.value.tokenLimit : 0,
    storageRatio: enterpriseQuotaPlan.value.storageLimitGb ? enterpriseQuotaPlan.value.storageUsedGb / enterpriseQuotaPlan.value.storageLimitGb : 0,
  }))
  const overQuotaUsers = computed(() => userQuotaAllocations.value.filter(item => item.status === 'warning' || item.status === 'exceeded'))

  const isEnterpriseQuotaValid = computed(() => {
    const now = Date.now()
    const from = new Date(`${enterpriseQuotaPlan.value.validFrom}T00:00:00`).getTime()
    const to = new Date(`${enterpriseQuotaPlan.value.validTo}T23:59:59`).getTime()
    return now >= from && now <= to
  })

  function refreshAssignedQuotaTotals() {
    enterpriseQuotaPlan.value.assignedRequestLimit = userQuotaAllocations.value.reduce((sum, item) => sum + Math.max(0, item.requestLimit || 0), 0)
    enterpriseQuotaPlan.value.assignedTokenLimit = userQuotaAllocations.value.reduce((sum, item) => sum + Math.max(0, item.tokenLimit || 0), 0)
    enterpriseQuotaPlan.value.assignedStorageLimitGb = userQuotaAllocations.value.reduce((sum, item) => sum + Math.max(0, item.storageLimitGb || 0), 0)
  }

  function refreshTenantMemberCounts() {
    for (const tenant of tenantRecords.value) {
      tenant.memberCount = userQuotaAllocations.value.filter(item => item.tenantId === tenant.id).length
    }
    refreshAssignedQuotaTotals()
  }

  function applyTenantSnapshotToUser(item: UserQuotaAllocation, tenantId: string) {
    const tenant = tenantRecords.value.find(entry => entry.id === tenantId)
    item.tenantId = tenant?.id || ''
    item.tenantName = tenant?.tenantName || '未分配租户'
  }

  function canAssignUserQuota(id: string | undefined, requestLimit: number, tokenLimit: number, storageLimitGb: number) {
    const otherUsers = userQuotaAllocations.value.filter(item => item.id !== id)
    const assignedRequests = otherUsers.reduce((sum, item) => sum + Math.max(0, item.requestLimit || 0), 0) + Math.max(0, requestLimit || 0)
    const assignedTokens = otherUsers.reduce((sum, item) => sum + Math.max(0, item.tokenLimit || 0), 0) + Math.max(0, tokenLimit || 0)
    const assignedStorage = otherUsers.reduce((sum, item) => sum + Math.max(0, item.storageLimitGb || 0), 0) + Math.max(0, storageLimitGb || 0)
    return assignedRequests <= enterpriseQuotaPlan.value.requestLimit
      && assignedTokens <= enterpriseQuotaPlan.value.tokenLimit
      && assignedStorage <= enterpriseQuotaPlan.value.storageLimitGb
  }

  function getFeature(code: FeatureCode) {
    return featureGates.value.find(item => item.code === code) || null
  }

  function refreshQuotaStatus(item: UserQuotaAllocation) {
    const ratios = [
      item.requestLimit ? item.requestUsed / item.requestLimit : 0,
      item.tokenLimit ? item.tokenUsed / item.tokenLimit : 0,
      item.storageLimitGb ? item.storageUsedGb / item.storageLimitGb : 0,
    ]
    const maxRatio = Math.max(...ratios)
    if (maxRatio >= 1) item.status = 'exceeded'
    else if (maxRatio >= enterpriseQuotaPlan.value.warningThreshold) item.status = 'warning'
    else item.status = 'normal'
  }

  function setActivePackage(code: PackageCode) {
    const matched = licenseInstances.value.find(item => licenseTemplates.value.find(tpl => tpl.id === item.templateId)?.code === code)
    if (!matched) return
    const binding = accountLicenseBindings.value.find(item => item.accountId === currentAccountId.value)
    const before = binding?.licenseNo || '-'
    assignLicenseToAccount(currentAccountId.value, matched.id)
    logAudit('License 授权', `授权前: ${before}`, `授权后: ${matched.licenseNo}`)
  }

  function setFeatureStatus(code: FeatureCode, status: FeatureStatus) {
    const license = currentLicenseInstance.value
    const feature = getFeature(code)
    if (!license || !feature) return
    const before = [...license.effectiveFeatures]
    const exists = license.effectiveFeatures.includes(code)
    if (status === 'enabled' && !exists) license.effectiveFeatures.push(code)
    if (status !== 'enabled' && exists) license.effectiveFeatures = license.effectiveFeatures.filter(item => item !== code)
    logAudit('License 功能微调', `${license.licenseNo}: ${before.join(',')}`, `功能列表: ${license.effectiveFeatures.join(',')}`)
  }

  function requireFeature(code: FeatureCode, featureLabel?: string) {
    const feature = getFeature(code)
    if (!feature) return true
    if (feature.status === 'enabled') return true
    paywall.value = {
      open: true,
      featureLabel: featureLabel || feature.label,
      packageName: licenseTemplates.value.find(item => item.code === feature.packageCode)?.name || feature.packageCode,
    }
    return false
  }

  function closePaywall() {
    paywall.value.open = false
  }

  function setActiveModel(modelId: string) {
    const model = models.value.find(item => item.id === modelId)
    if (!model) return
    const before = activeModel.value ? `${activeModel.value.name}@${activeModel.value.version}` : '-'
    activeModelId.value = modelId
    logAudit('模型配置', `切换前: ${before}`, `切换后: ${model.name}@${model.version}`)
  }

  function addModelConfig(payload: {
    source: 'local' | 'vendor'
    name: string
    protocol: 'OpenAI'
    provider: string
    token: string
    endpoint: string
    model: string
    modelPath: string
    mmprojModelPath: string
    imagePrecision: number[]
    ctxSize: number
  }) {
    const sourceLabel = payload.source === 'local' ? '本地模型' : '供应商'
    const model: ModelConfig = {
      id: uid('model'),
      name: payload.name.trim() || payload.model.trim(),
      source: payload.source,
      vendor: payload.source === 'local' ? '本地模型' : payload.name.trim(),
      protocol: payload.protocol,
      provider: payload.provider.trim(),
      endpoint: payload.endpoint.trim(),
      token: payload.token.trim(),
      model: payload.model.trim(),
      modelPath: payload.modelPath.trim(),
      mmprojModelPath: payload.mmprojModelPath.trim(),
      imagePrecision: payload.imagePrecision,
      ctxSize: payload.ctxSize,
      version: 'custom',
      enabled: true,
      latencyMs: 1180,
      locked: false,
      lastTestStatus: 'untested',
      lastTestMessage: '尚未测试连通性',
    }
    models.value.unshift(model)
    logAudit('模型配置', `来源: ${sourceLabel}`, `新增: ${model.name}/${model.model}`)
    return model
  }

  function addVendorModel(payload: {
    name: string
    protocol: 'OpenAI'
    provider: string
    token: string
    endpoint: string
    model: string
    modelPath: string
    mmprojModelPath: string
    imagePrecision: number[]
    ctxSize: number
  }) {
    return addModelConfig({ ...payload, source: 'vendor' })
  }

  function removeModel(modelId: string) {
    const model = models.value.find(item => item.id === modelId)
    if (!model || model.locked) return false
    models.value = models.value.filter(item => item.id !== modelId)
    if (activeModelId.value === modelId) {
      activeModelId.value = localModels.value[0]?.id || models.value[0]?.id || ''
    }
    logAudit('模型配置', `删除: ${model.vendor}/${model.name}/${model.model || model.version}`, '已移除')
    return true
  }

  function testModelConnection(modelId: string) {
    const model = models.value.find(item => item.id === modelId)
    if (!model) return null
    const hasRequiredFields = Boolean(model.endpoint?.trim() && model.token?.trim() && model.model?.trim())
    const endpointLooksValid = /^https?:\/\//.test(model.endpoint || '')
    const tokenLooksValid = (model.token || '').length >= 8
    const protocolPass = model.protocol === 'OpenAI'
    const success = hasRequiredFields && endpointLooksValid && tokenLooksValid && protocolPass
    model.lastTestStatus = success ? 'success' : 'failed'
    model.lastTestAt = Date.now()
    model.lastTestMessage = success
      ? `${model.protocol} 协议连通性测试成功`
      : '测试失败：请检查协议、URL、Token 或模型名称'
    model.latencyMs = success ? 1020 : 0
    logAudit('模型配置', `测试: ${model.name}`, '', model.lastTestMessage ?? '', success)
    return {
      success,
      message: model.lastTestMessage,
      testedAt: model.lastTestAt,
    }
  }

  function setCurrentAccount(accountId: string) {
    const account = demoAccounts.value.find(item => item.id === accountId)
    if (!account) return
    currentAccountId.value = accountId
  }

  function updateEnterpriseQuota(payload: Partial<Pick<EnterpriseQuotaPlan, 'requestLimit' | 'tokenLimit' | 'storageLimitGb' | 'validFrom' | 'validTo' | 'warningThreshold' | 'overageMode'>>) {
    const before = JSON.stringify({
      requestLimit: enterpriseQuotaPlan.value.requestLimit,
      tokenLimit: enterpriseQuotaPlan.value.tokenLimit,
      storageLimitGb: enterpriseQuotaPlan.value.storageLimitGb,
      validFrom: enterpriseQuotaPlan.value.validFrom,
      validTo: enterpriseQuotaPlan.value.validTo,
      warningThreshold: enterpriseQuotaPlan.value.warningThreshold,
      overageMode: enterpriseQuotaPlan.value.overageMode,
    })
    Object.assign(enterpriseQuotaPlan.value, payload)
    refreshAssignedQuotaTotals()
    logAudit('企业额度治理', `变更前: ${before}`, `变更后: ${JSON.stringify(payload)}`)
  }

  function updateUserQuotaAllocation(payload: {
    id: string
    userName?: string
    department?: string
    tenantId?: string
    role?: string
    accountStatus?: 'active' | 'disabled'
    requestLimit?: number
    tokenLimit?: number
    storageLimitGb?: number
  }) {
    const item = userQuotaAllocations.value.find(entry => entry.id === payload.id)
    if (!item) return
    const before = JSON.stringify({
      requestLimit: item.requestLimit,
      tokenLimit: item.tokenLimit,
      storageLimitGb: item.storageLimitGb,
      userName: item.userName,
      department: item.department,
      tenantId: item.tenantId,
      role: item.role,
      accountStatus: item.accountStatus,
    })
    const nextRequestLimit = typeof payload.requestLimit === 'number' ? payload.requestLimit : item.requestLimit
    const nextTokenLimit = typeof payload.tokenLimit === 'number' ? payload.tokenLimit : item.tokenLimit
    const nextStorageLimitGb = typeof payload.storageLimitGb === 'number' ? payload.storageLimitGb : item.storageLimitGb
    if (!canAssignUserQuota(item.id, nextRequestLimit, nextTokenLimit, nextStorageLimitGb)) return false
    if (typeof payload.userName === 'string') item.userName = payload.userName.trim() || item.userName
    if (typeof payload.department === 'string') item.department = payload.department.trim() || item.department
    if (typeof payload.tenantId === 'string') applyTenantSnapshotToUser(item, payload.tenantId)
    if (typeof payload.role === 'string') item.role = payload.role.trim() || item.role
    if (payload.accountStatus) item.accountStatus = payload.accountStatus
    if (typeof payload.requestLimit === 'number') item.requestLimit = payload.requestLimit
    if (typeof payload.tokenLimit === 'number') item.tokenLimit = payload.tokenLimit
    if (typeof payload.storageLimitGb === 'number') item.storageLimitGb = payload.storageLimitGb
    refreshQuotaStatus(item)
    refreshTenantMemberCounts()
    quotaAdjustmentRecords.value.unshift({
      id: uid('quota-adjust'),
      targetType: 'user',
      targetName: item.userName,
      dimension: 'requests',
      before: JSON.parse(before).requestLimit,
      after: item.requestLimit,
      operator: '产品演示账号',
      reason: '页面手工调整用户配额',
      createdAt: Date.now(),
    })
    logAudit('用户额度分配', `变更前: ${before}`, `分配: ${JSON.stringify({
      userName: item.userName,
      department: item.department,
      tenantName: item.tenantName,
      role: item.role,
      accountStatus: item.accountStatus,
      requestLimit: item.requestLimit,
      tokenLimit: item.tokenLimit,
      storageLimitGb: item.storageLimitGb,
    })}`)
    return item
  }

  function upsertTenantRecord(payload: {
    id?: string
    tenantName: string
    tenantCode: string
    ownerName: string
    status: 'active' | 'disabled'
  }) {
    const tenantName = payload.tenantName.trim()
    if (!tenantName) return null
    const current = payload.id ? tenantRecords.value.find(item => item.id === payload.id) : null
    if (current) {
      const before = JSON.stringify(current)
      current.tenantName = tenantName
      current.tenantCode = payload.tenantCode.trim() || current.tenantCode
      current.ownerName = payload.ownerName.trim() || current.ownerName
      current.status = payload.status
      for (const user of userQuotaAllocations.value.filter(item => item.tenantId === current.id)) {
        user.tenantName = current.tenantName
      }
      refreshTenantMemberCounts()
      logAudit('租户管理', `变更前: ${before}`, `变更后: ${JSON.stringify(current)}`)
      return current
    }
    const created: TenantRecord = {
      id: uid('tenant'),
      tenantName,
      tenantCode: payload.tenantCode.trim() || `TENANT-${Date.now().toString().slice(-6)}`,
      ownerName: payload.ownerName.trim() || '未指定',
      memberCount: 0,
      status: payload.status,
      createdAt: Date.now(),
    }
    tenantRecords.value.unshift(created)
    logAudit('租户管理', '新增租户', JSON.stringify(created))
    return created
  }

  function removeTenantRecord(id: string) {
    const tenant = tenantRecords.value.find(item => item.id === id)
    if (!tenant) return false
    tenantRecords.value = tenantRecords.value.filter(item => item.id !== id)
    for (const user of userQuotaAllocations.value.filter(item => item.tenantId === id)) {
      user.tenantId = ''
      user.tenantName = '未分配租户'
    }
    logAudit('租户管理', `删除: ${JSON.stringify(tenant)}`, '已移除')
    return true
  }

  function createUserQuotaAllocation(payload: {
    userName: string
    department: string
    tenantId: string
    role: string
    accountStatus: 'active' | 'disabled'
    requestLimit: number
    tokenLimit: number
    storageLimitGb: number
  }) {
    const userName = payload.userName.trim()
    if (!userName) return null
    if (!canAssignUserQuota(undefined, payload.requestLimit, payload.tokenLimit, payload.storageLimitGb)) return null
    const tenant = tenantRecords.value.find(item => item.id === payload.tenantId)
    const created: UserQuotaAllocation = {
      id: uid('quota-user'),
      userId: uid('acct'),
      userName,
      department: payload.department.trim() || '未分配部门',
      tenantId: tenant?.id || '',
      tenantName: tenant?.tenantName || '未分配租户',
      role: payload.role.trim() || '业务使用者',
      accountStatus: payload.accountStatus,
      requestLimit: payload.requestLimit,
      tokenLimit: payload.tokenLimit,
      storageLimitGb: payload.storageLimitGb,
      requestUsed: 0,
      tokenUsed: 0,
      storageUsedGb: 0,
      status: 'normal',
      lastActiveAt: Date.now(),
    }
    refreshQuotaStatus(created)
    userQuotaAllocations.value.unshift(created)
    refreshTenantMemberCounts()
    logAudit('企业成员管理', '新增成员', JSON.stringify(created))
    return created
  }

  function removeUserQuotaAllocation(id: string) {
    const user = userQuotaAllocations.value.find(item => item.id === id)
    if (!user) return false
    userQuotaAllocations.value = userQuotaAllocations.value.filter(item => item.id !== id)
    refreshTenantMemberCounts()
    logAudit('企业成员管理', `删除: ${JSON.stringify(user)}`, '已移除')
    return true
  }

  function consumeQuota(payload: { userName: string; requests?: number; tokens?: number; storageGb?: number }) {
    const user = userQuotaAllocations.value.find(item => item.userName === payload.userName)
    if (!user) return { allowed: true, reason: '' }
    if (!isEnterpriseQuotaValid.value) return { allowed: false, reason: '企业额度不在有效期内，已暂停 AI 调用。' }
    if (user.accountStatus !== 'active') return { allowed: false, reason: '当前用户已停用，不能调用 AI。' }
    if (!user.requestLimit || user.requestLimit <= 0) return { allowed: false, reason: '当前用户未分配请求次数额度，不能调用 AI。' }
    const nextRequests = user.requestUsed + (payload.requests || 0)
    const nextTokens = user.tokenUsed + (payload.tokens || 0)
    const nextStorage = user.storageUsedGb + (payload.storageGb || 0)
    const enterprise = enterpriseQuotaPlan.value
    const willExceedUserRequests = nextRequests > user.requestLimit
    const willExceedEnterpriseRequests = nextRequests - user.requestUsed + enterprise.requestUsed > enterprise.requestLimit
    const willWarnTokenOrStorage = nextTokens > user.tokenLimit || nextStorage > user.storageLimitGb
      || nextTokens - user.tokenUsed + enterprise.tokenUsed > enterprise.tokenLimit
      || nextStorage - user.storageUsedGb + enterprise.storageUsedGb > enterprise.storageLimitGb
    if (willExceedUserRequests || willExceedEnterpriseRequests) return { allowed: false, reason: '当前企业或用户请求次数额度已用尽，平台已暂停继续调用。' }
    user.requestUsed = nextRequests
    user.tokenUsed = nextTokens
    user.storageUsedGb = nextStorage
    user.lastActiveAt = Date.now()
    refreshQuotaStatus(user)
    enterprise.requestUsed += payload.requests || 0
    enterprise.tokenUsed += payload.tokens || 0
    enterprise.storageUsedGb += payload.storageGb || 0
    return {
      allowed: true,
      reason: willWarnTokenOrStorage ? '当前调用已触发 Token 或存储预警，请尽快补配企业或用户额度。' : '',
    }
  }

  function updateSessionGovernanceStatus(id: string, status: SessionGovernanceRecord['status']) {
    const item = sessionGovernanceRecords.value.find(entry => entry.id === id)
    if (!item) return
    const before = `${item.sessionId}:${item.status}`
    item.status = status
    item.updatedAt = Date.now()
    logAudit('会话管理', `会话: ${item.sessionId}`, `状态: ${status}`)
  }

  function updateStoragePolicy(id: string, payload: Partial<Pick<StoragePolicyConfig, 'retentionDays' | 'cleanupMode' | 'archiveBeforeDelete'>>) {
    const item = storagePolicies.value.find(entry => entry.id === id)
    if (!item) return
    const before = JSON.stringify(item)
    Object.assign(item, payload, { updatedAt: Date.now() })
    logAudit('会话存储周期', `变更前: ${before}`, `变更后: ${JSON.stringify(item)}`)
  }

  function upsertMetadataTag(payload: {
    id?: string
    name: string
    code: string
    valueType: 'enum' | 'text'
    required: boolean
    options: string[]
    description: string
  }) {
    const existing = payload.id ? metadataTags.value.find(item => item.id === payload.id) : null
    if (existing) {
      const before = JSON.stringify(existing)
      existing.name = payload.name
      existing.code = payload.code
      existing.valueType = payload.valueType
      existing.required = payload.required
      existing.options = [...payload.options]
      existing.description = payload.description
      existing.updatedAt = Date.now()
      logAudit('知识库元数据标签', `变更前: ${before}`, `变更后: ${JSON.stringify(existing)}`)
      return existing
    }
    const item: MetadataTag = {
      id: uid('meta-tag'),
      name: payload.name,
      code: payload.code,
      valueType: payload.valueType,
      required: payload.required,
      options: [...payload.options],
      description: payload.description,
      updatedAt: Date.now(),
    }
    metadataTags.value.unshift(item)
    logAudit('知识库元数据标签', '新增标签', JSON.stringify(item))
    return item
  }

  function removeMetadataTag(id: string) {
    const existing = metadataTags.value.find(item => item.id === id)
    if (!existing) return false
    metadataTags.value = metadataTags.value.filter(item => item.id !== id)
    knowledgeDocumentMetadatas.value = knowledgeDocumentMetadatas.value.map(item => {
      const nextValues = { ...item.values }
      delete nextValues[existing.code]
      return { ...item, values: nextValues, updatedAt: Date.now() }
    })
    logAudit('知识库元数据标签', `删除: ${JSON.stringify(existing)}`, '已移除')
    return true
  }

  function upsertKnowledgeDocumentMetadata(payload: {
    knowledgeBaseId: string
    documentName: string
    sourceType: 'manual' | 'upload'
    values: Record<string, string>
  }) {
    const existing = knowledgeDocumentMetadatas.value.find(item => item.knowledgeBaseId === payload.knowledgeBaseId && item.documentName === payload.documentName)
    if (existing) {
      const before = JSON.stringify(existing.values)
      existing.values = { ...payload.values }
      existing.updatedAt = Date.now()
      existing.sourceType = payload.sourceType
      logAudit('知识库文档元数据', `变更前: ${before}`, `变更后: ${JSON.stringify(existing.values)}`)
      return existing
    }
    const item: KnowledgeDocumentMetadata = {
      id: uid('kb-meta'),
      knowledgeBaseId: payload.knowledgeBaseId,
      documentName: payload.documentName,
      sourceType: payload.sourceType,
      values: { ...payload.values },
      updatedAt: Date.now(),
    }
    knowledgeDocumentMetadatas.value.unshift(item)
    logAudit('知识库文档元数据', '新增文档元数据', JSON.stringify(item.values))
    return item
  }

  function getKnowledgeDocumentMetadata(knowledgeBaseId: string, documentName: string) {
    return knowledgeDocumentMetadatas.value.find(item => item.knowledgeBaseId === knowledgeBaseId && item.documentName === documentName) || null
  }

  function recordAgentInvocationTrace(payload: Omit<AgentInvocationTrace, 'id' | 'finishedAt'>) {
    const item: AgentInvocationTrace = {
      ...payload,
      id: uid('trace'),
      finishedAt: Date.now(),
    }
    agentInvocationTraces.value.unshift(item)
    return item
  }

  function getAgentInvocationTrace(messageId: string, conversationId?: string) {
    return agentInvocationTraces.value.find(item => item.messageId === messageId && (!conversationId || item.conversationId === conversationId)) || null
  }

  function upsertLicenseTemplate(payload: { id?: string; code: LicenseTemplateCode; name: string; desc: string; features: FeatureCode[]; highlights: string[]; moduleSelections?: ModuleSelections }) {
    const modules = payload.features.includes('assistant') || payload.features.includes('agent') || payload.features.includes('mcp') || payload.features.includes('apiKey')
      ? ([
          ...(payload.features.some(item => moduleFeatureMap.agent.includes(item)) ? ['agent' as ModuleCode] : []),
          ...(payload.features.some(item => moduleFeatureMap.mcp.includes(item)) ? ['mcp' as ModuleCode] : []),
        ])
      : []
    const moduleSelections = payload.moduleSelections || emptyModuleSelections()
    const existing = payload.id ? licenseTemplates.value.find(item => item.id === payload.id) : null
    if (existing) {
      const before = `${existing.name}:${existing.modules.join(',')}`
      existing.code = payload.code
      existing.name = payload.name
      existing.desc = payload.desc
      existing.modules = [...modules]
      existing.moduleSelections = { agent: [...moduleSelections.agent], mcp: [...moduleSelections.mcp] }
      existing.features = [...payload.features]
      existing.highlights = [...payload.highlights]
      logAudit('License 模板', `变更前: ${before}`, `模板: ${existing.name}:${existing.modules.join(',')}`)
      return existing
    }
    const template: LicenseTemplate = {
      id: uid('tpl'),
      code: payload.code,
      name: payload.name,
      desc: payload.desc,
      modules: [...modules],
      moduleSelections: { agent: [...moduleSelections.agent], mcp: [...moduleSelections.mcp] },
      features: [...payload.features],
      highlights: [...payload.highlights],
      status: 'active',
    }
    licenseTemplates.value.unshift(template)
    logAudit('License 模板', '新增模板', `${template.name}:${template.modules.join(',')}`)
    return template
  }

  function buildFeaturesFromModules(modules: ModuleCode[], selections?: ModuleSelections) {
    const features = modules.flatMap(module => moduleFeatureMap[module])
    if (selections?.mcp.includes('OCR识别')) features.push('ocr')
    return [...new Set(features)]
  }

  function upsertLicenseTemplateByModules(payload: { id?: string; name: string; desc: string; modules: ModuleCode[]; moduleSelections: ModuleSelections }) {
    const features = buildFeaturesFromModules(payload.modules, payload.moduleSelections)
    return upsertLicenseTemplate({
      id: payload.id,
      code: 'standard',
      name: payload.name,
      desc: payload.desc,
      features,
      moduleSelections: payload.moduleSelections,
      highlights: payload.modules.map(module => moduleLabelMap[module]),
    })
  }

  function createLicenseInstance(payload: { templateId: string; validFrom: string; validTo: string; effectiveFeatures: FeatureCode[] }) {
    const template = licenseTemplates.value.find(item => item.id === payload.templateId)
    if (!template) return null
    const instance: LicenseInstance = {
      id: uid('lic'),
      licenseNo: `LIC-${template.code.toUpperCase()}-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`,
      templateId: template.id,
      templateName: template.name,
      status: 'active',
      effectiveFeatures: [...new Set(payload.effectiveFeatures)],
      validFrom: payload.validFrom,
      validTo: payload.validTo,
      createdAt: Date.now(),
    }
    licenseInstances.value.unshift(instance)
    logAudit('License 实例', '新增实例', `${instance.licenseNo}/${template.name}/${instance.validFrom}~${instance.validTo}`)
    return instance
  }

  function toggleLicenseInstanceStatus(licenseId: string) {
    const instance = licenseInstances.value.find(item => item.id === licenseId)
    if (!instance) return
    const before = `${instance.licenseNo}:${instance.status}`
    instance.status = instance.status === 'active' ? 'disabled' : 'active'
    logAudit('License 实例', `变更前: ${before}`, `状态: ${instance.licenseNo}:${instance.status}`)
  }

  function assignLicenseToAccount(accountId: string, licenseId: string) {
    const account = demoAccounts.value.find(item => item.id === accountId)
    const license = licenseInstances.value.find(item => item.id === licenseId)
    if (!account || !license) return
    const existing = accountLicenseBindings.value.find(item => item.accountId === accountId)
    if (existing) {
      const before = `${existing.accountName}:${existing.licenseNo}`
      existing.licenseId = licenseId
      existing.licenseNo = license.licenseNo
      existing.assignedAt = Date.now()
      logAudit('账号授权', `变更前: ${before}`, `授权: ${account.name}:${license.licenseNo}`)
      return
    }
    accountLicenseBindings.value.unshift({
      id: uid('bind'),
      accountId,
      accountName: account.name,
      licenseId,
      licenseNo: license.licenseNo,
      assignedAt: Date.now(),
    })
    logAudit('账号授权', '新增授权', `${account.name}:${license.licenseNo}`)
  }

  function getAssignedLicenseByAccount(accountId: string) {
    const binding = accountLicenseBindings.value.find(item => item.accountId === accountId)
    if (!binding) return null
    return licenseInstances.value.find(item => item.id === binding.licenseId) || null
  }

  function getBindingCount(licenseId: string) {
    return accountLicenseBindings.value.filter(item => item.licenseId === licenseId).length
  }

  function addFeedback(payload: Omit<MessageFeedback, 'id' | 'createdAt'>) {
    const feedback = { ...payload, id: uid('feedback'), createdAt: Date.now() }
    messageFeedbacks.value.unshift(feedback)
  }

  function addExpertCoCreation(payload: Omit<ExpertCoCreationEntry, 'id' | 'createdAt'>) {
    let entry = coCreationEntries.value.find(item => item.messageId === payload.messageId && item.conversationId === payload.conversationId && item.action === payload.action)
    if (entry) {
      entry.sessionId = payload.sessionId
      entry.feedbackUser = payload.feedbackUser
      entry.category = payload.category
      entry.reason = payload.reason
      entry.question = payload.question
      entry.answer = payload.answer
      entry.contextMessages = payload.contextMessages
      entry.status = payload.status
      entry.createdAt = Date.now()
    } else {
      entry = { ...payload, id: uid('expert'), createdAt: Date.now() }
      coCreationEntries.value.unshift(entry)
    }
    return entry
  }

  function getExpertCoCreationEntry(messageId: string, conversationId: string, action: ExpertCoCreationEntry['action']) {
    return coCreationEntries.value.find(item => item.messageId === messageId && item.conversationId === conversationId && item.action === action) || null
  }

  function createUpload(name: string, type: string) {
    const upload: UploadFileItem = { id: uid('upload'), name, type, status: 'uploading', createdAt: Date.now() }
    uploads.value.unshift(upload)
    return upload
  }

  function finalizeUpload(uploadId: string, success = true) {
    const upload = uploads.value.find(item => item.id === uploadId)
    if (!upload) return
    upload.status = success ? 'uploaded' : 'retryable'
  }

  function createOcrTask(fileName: string) {
    const task: OcrTask = {
      id: uid('ocr'),
      fileName,
      status: 'success',
      text: `OCR 识别结果：${fileName} 中识别到“作业票编号、作业地点、风险措施、审批人、巡检时间”等字段。`,
      createdAt: Date.now(),
    }
    ocrTasks.value.unshift(task)
    return task
  }

  function createContextPack(payload: Omit<ContextPack, 'id' | 'createdAt'>) {
    const pack = { ...payload, id: uid('ctx'), createdAt: Date.now() }
    contextPacks.value.unshift(pack)
    return pack
  }

  function runToolTest(payload: { toolName: string; params: string; imageName?: string; shouldFail?: boolean }) {
    const item: ToolTestCase = {
      id: uid('tooltest'),
      toolName: payload.toolName,
      params: payload.params,
      imageName: payload.imageName,
      statusCode: payload.shouldFail ? 500 : 200,
      latencyMs: payload.shouldFail ? 2140 : 986,
      status: payload.shouldFail ? 'failed' : 'success',
      response: payload.shouldFail
        ? JSON.stringify({ message: 'Mock tool timeout', retryable: true }, null, 2)
        : JSON.stringify({ ok: true, tool: payload.toolName, result: { summary: 'Mock 测试完成', labels: ['ocr', 'safety'] } }, null, 2),
      logId: uid('log'),
      createdAt: Date.now(),
    }
    toolTests.value.unshift(item)
    return item
  }

  function updateCoCreationStatus(id: string, status: CoCreationStatus) {
    const item = coCreationEntries.value.find(entry => entry.id === id)
    if (!item) return
    const before = `${item.sessionId}:${item.status}`
    item.status = status
    logAudit('共创回流', `会话: ${item.sessionId}`, `状态: ${status}`)
  }

  function refreshBackupJob(now = Date.now()) {
    if (!backupJobEndsAt.value) return
    if (now < backupJobEndsAt.value) return
    const running = backupSnapshots.value.find(item => item.status === '进行中')
    if (running) running.status = '已完成'
    backupJobEndsAt.value = null
  }

  function startBackupNow() {
    refreshBackupJob()
    if (backupJobEndsAt.value && backupJobEndsAt.value > Date.now()) return false
    backupJobEndsAt.value = Date.now() + 30 * 60 * 1000
    backupSnapshots.value.unshift({
      id: uid('snapshot'),
      snapshotNo: `SNAP-${new Date().toISOString().slice(0, 19).replace(/[-:T]/g, '')}`,
      createdAt: Date.now(),
      status: '进行中',
      services: ['知识库', '业务数据', '算法配置'],
    })
    logAudit('快照备份', '手动触发', '启动手动备份任务')
    return true
  }

  function logAudit(module: string, action: string, before: string = '', after: string = '', success: boolean = true) {
    auditLogs.value.unshift({
      id: uid('audit'),
      user: '产品演示账号',
      agent: module,
      ip: '10.20.3.45',
      requestParams: action,
      responseData: after,
      success,
      time: Date.now(),
    })
  }

  return {
    licenseTemplates,
    licensePackages: licenseTemplates,
    licenseInstances,
    demoAccounts,
    accountLicenseBindings,
    currentAccountId,
    currentAccount,
    currentBinding,
    currentLicenseInstance,
    currentLicenseTemplate,
    activePackage,
    currentPackage,
    featureGates,
    paywall,
    models,
    activeModel,
    activeModelId,
    localModels,
    vendorModels,
    messageFeedbacks,
    contextPacks,
    uploads,
    ocrTasks,
    toolTests,
    coCreationEntries,
    auditLogs,
    usageOverview,
    usageBySkill,
    usageByKey,
    backupSnapshots,
    backupJobEndsAt,
    enterpriseQuotaPlan,
    tenantRecords,
    userQuotaAllocations,
    quotaAdjustmentRecords,
    sessionGovernanceRecords,
    storagePolicies,
    assetLedgerRecords,
    metadataTags,
    knowledgeDocumentMetadatas,
    agentInvocationTraces,
    enterpriseQuotaUsage,
    overQuotaUsers,
    miniProgramChecklist,
    getFeature,
    setCurrentAccount,
    setActivePackage,
    setFeatureStatus,
    requireFeature,
    closePaywall,
    setActiveModel,
    addModelConfig,
    addVendorModel,
    removeModel,
    testModelConnection,
    updateEnterpriseQuota,
    upsertTenantRecord,
    removeTenantRecord,
    createUserQuotaAllocation,
    removeUserQuotaAllocation,
    updateUserQuotaAllocation,
    consumeQuota,
    updateSessionGovernanceStatus,
    updateStoragePolicy,
    upsertMetadataTag,
    removeMetadataTag,
    upsertKnowledgeDocumentMetadata,
    getKnowledgeDocumentMetadata,
    recordAgentInvocationTrace,
    getAgentInvocationTrace,
    upsertLicenseTemplate,
    upsertLicenseTemplateByModules,
    createLicenseInstance,
    toggleLicenseInstanceStatus,
    assignLicenseToAccount,
    getAssignedLicenseByAccount,
    getBindingCount,
    addFeedback,
    addExpertCoCreation,
    getExpertCoCreationEntry,
    createUpload,
    finalizeUpload,
    createOcrTask,
    createContextPack,
    runToolTest,
    updateCoCreationStatus,
    refreshBackupJob,
    startBackupNow,
    logAudit,
    buildFeaturesFromModules,
  }
}, {
  persist: { key: 'new-ai-store' },
})
