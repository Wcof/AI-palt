import type { CoCreationStatus, ExpertCoCreationEntry } from '@/stores/newAI'

export type CoCreationTypeFilter = 'all' | 'like' | 'dislike'
export type CoCreationStatusFilter = 'all' | CoCreationStatus

export const coCreationTypeOptions: Array<{ value: CoCreationTypeFilter; label: string }> = [
  { value: 'all', label: '全部' },
  { value: 'like', label: '点赞' },
  { value: 'dislike', label: '点踩' },
]

export const coCreationStatusOptions: Array<{ value: CoCreationStatusFilter; label: string }> = [
  { value: 'all', label: '全部' },
  { value: '待处置', label: '待处置' },
  { value: '已采纳', label: '采纳' },
  { value: '误判', label: '误判' },
  { value: '已搁置', label: '已搁置' },
]

export function filterCoCreationRows(
  rows: ExpertCoCreationEntry[],
  typeFilter: CoCreationTypeFilter,
  statusFilter: CoCreationStatusFilter,
  rawQuery: string,
) {
  const query = rawQuery.trim().toLowerCase()
  return rows.filter(item => {
    const matchesType = typeFilter === 'all' || item.action === typeFilter
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter
    const matchesQuery = !query || [item.sessionId, item.feedbackUser, item.question, item.answer, item.reason, item.category]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(query)
    return matchesType && matchesStatus && matchesQuery
  })
}
