type Params = { page?: number; pageSize?: number; keyword?: string; labels?: string[] }

type McpItem = {
  id: string
  name: string
  descr: string
  labels: string[]
  createTime: string
  updatedAt: string
}

const records: McpItem[] = [
  { id: 'mcp-ocr', name: 'OCR 文字识别 MCP', descr: '票据与标识牌识别能力。', labels: ['MCP', 'OCR'], createTime: '2026-04-10 10:00:00', updatedAt: '2026-04-24 09:20:00' },
  { id: 'mcp-face', name: '人脸识别 MCP', descr: '人脸检测与比对能力。', labels: ['MCP', '人脸'], createTime: '2026-04-11 10:00:00', updatedAt: '2026-04-24 09:30:00' },
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

function page(list: McpItem[], page = 1, pageSize = 12) {
  const total = list.length
  const totalPage = Math.max(1, Math.ceil(total / pageSize))
  const current = Math.min(Math.max(1, page), totalPage)
  const start = (current - 1) * pageSize
  return { records: list.slice(start, start + pageSize), total, totalPage }
}

export const mcpApi = {
  async getList(params: Params = {}) {
    return { code: 200, data: page(filterList(params), params.page || 1, params.pageSize || 12) }
  },
}

