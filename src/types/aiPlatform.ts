export type SkillType = 'mcp' | 'skill'

export type SkillDoc = {
  raw: string
  title?: string
  description?: string
  version?: string
  parameters?: string[]
  examples?: string[]
  updatedAt?: string
}

export type NL2SQLCaseType = 'Good Case' | 'Bad Case'

export type NL2SQLCase = {
  id: string
  question: string
  type: NL2SQLCaseType
  answer: string
  remark: string
  updatedAt: string
}

export type DomainTerm = {
  id: string
  term: string
  aliases: string
  explanation: string
  domain: string
  updatedAt: string
}

export type JdbcDataSourceStatus = '未测试' | '连通' | '失败'

export type JdbcDataSource = {
  id?: string
  name: string
  dbType: 'MySQL' | 'PostgreSQL' | 'SQL Server' | 'Oracle' | '达梦' | '人大金仓' | '其他'
  driverClass: string
  host: string
  port: string
  dbName: string
  schema?: string
  username: string
  password: string
  charset?: string
  timezone?: string
  sslMode?: '关闭' | '开启'
  connectionTimeout?: string
  maxPoolSize?: string
  remark?: string
  status: JdbcDataSourceStatus
  updatedAt: string
}

export type ReportTemplate = {
  id: string
  name: string
  scene: string
  content: string
  enabled: boolean
  updatedAt: string
}

export type ReportConfig = {
  id: string
  section: string
  prompt: string
  enabled: boolean
  version: string
  updatedAt: string
}

export type ReportRunState = 'idle' | 'generating' | 'done' | 'failed'

export type ReportDocument = {
  id: string
  title: string
  format: 'markdown' | 'doc'
  content: string
  status: ReportRunState
  templateId?: string
  createdAt: number
  updatedAt: number
}

export type ApiProject = {
  id: string
  name: string
  owner: string
  status: 'active' | 'disabled'
  description: string
  createdAt: string
}

export type ApiToken = {
  id: string
  name: string
  token: string
  appId: string
  status: 'active' | 'disabled'
  abilities: string[]
  knowledgeBases: string[]
  agents: string[]
  createdAt: string
  lastUsedAt?: string
}

export type UsageRecord = {
  id: string
  appId: string
  keyId: string
  endpoint: string
  requestTokens: number
  responseTokens: number
  totalTokens: number
  cost: number
  status: 'success' | 'failed'
  createdAt: string
}

export type UsageSummary = {
  totalCalls: number
  successCalls: number
  failedCalls: number
  requestTokens: number
  responseTokens: number
  totalTokens: number
  totalCost: number
}
