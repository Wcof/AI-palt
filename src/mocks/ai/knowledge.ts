type Params = { page?: number; pageSize?: number; keyword?: string; labels?: string[] }

export type KnowledgeDetail = {
  id: string
  name: string
  descr: string
  labels: string[]
  iconPath?: string
  createTime: string
  updatedAt: string
  source: string
  content: string
}

const records: KnowledgeDetail[] = [
  {
    id: 'kb-safety-production',
    name: 'AI知识库',
    descr: '汇聚安全生产法规、操作规程、事故案例与隐患排查标准。',
    labels: ['安全', '法规', '知识库'],
    createTime: '2026-03-10 10:00:00',
    updatedAt: '2026-04-01 09:29:00',
    source: '极客光年',
    content: '<p>覆盖安全生产法规与案例，支持合规问答检索。</p>',
  },
]

function filterList(params: Params) {
  const keyword = (params.keyword || '').trim().toLowerCase()
  const labels = params.labels || []
  return records.filter((r) => {
    const hitKeyword = !keyword || `${r.name} ${r.descr} ${r.labels.join(' ')}`.toLowerCase().includes(keyword)
    const hitLabels = !labels.length || labels.every((x) => r.labels.includes(x))
    return hitKeyword && hitLabels
  })
}

function page(list: KnowledgeDetail[], page = 1, pageSize = 12) {
  const total = list.length
  const totalPage = Math.max(1, Math.ceil(total / pageSize))
  const current = Math.min(Math.max(1, page), totalPage)
  const start = (current - 1) * pageSize
  return { records: list.slice(start, start + pageSize), total, totalPage }
}

export const knowledgeApi = {
  async getList(params: Params = {}) {
    return { code: 200, data: page(filterList(params), params.page || 1, params.pageSize || 12) }
  },
  async getDetail(id: string) {
    const hit = records.find((r) => r.id === id)
    return hit ? { code: 200, data: hit } : { code: 404, data: null }
  },
}

