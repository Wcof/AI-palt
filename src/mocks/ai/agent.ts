type Params = { page?: number; pageSize?: number; keyword?: string; labels?: string[] }

export type AgentDetail = {
  id: string
  agentName: string
  description: string
  labels: string[]
  iconPath?: string
  createTime: string
  updatedAt: string
  source: string
  capabilities: string[]
  content: string
}

const records: AgentDetail[] = [
  {
    id: 'ehs-llm-api',
    agentName: 'EHS 智能体',
    description: '面向安全生产场景提供合规问答、风险提示与流程建议。',
    labels: ['智能体', '安全'],
    createTime: '2026-03-08 09:00:00',
    updatedAt: '2026-04-01 09:29:00',
    source: '极客光年',
    capabilities: ['隐患排查建议', '制度问答', '应急处置辅助'],
    content: '<p>聚焦 EHS 问答与流程建议。</p>',
  },
]

function filterList(params: Params) {
  const keyword = (params.keyword || '').trim().toLowerCase()
  const labels = params.labels || []
  return records.filter((r) => {
    const hitKeyword = !keyword || `${r.agentName} ${r.description} ${r.labels.join(' ')}`.toLowerCase().includes(keyword)
    const hitLabels = !labels.length || labels.every((x) => r.labels.includes(x))
    return hitKeyword && hitLabels
  })
}

function page(list: AgentDetail[], page = 1, pageSize = 12) {
  const total = list.length
  const totalPage = Math.max(1, Math.ceil(total / pageSize))
  const current = Math.min(Math.max(1, page), totalPage)
  const start = (current - 1) * pageSize
  return { records: list.slice(start, start + pageSize), total, totalPage }
}

export const agentApi = {
  async getList(params: Params = {}) {
    return { code: 200, data: page(filterList(params), params.page || 1, params.pageSize || 12) }
  },
  async getDetail(id: string) {
    const hit = records.find((r) => r.id === id)
    return hit ? { code: 200, data: hit } : { code: 404, data: null }
  },
}

