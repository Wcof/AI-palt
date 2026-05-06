import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export type ApiRequestLog = {
  id: string
  appId: string
  keyId: string
  endpoint: string
  method: string
  statusCode: number
  duration: number
  timestamp: number
  inputTokens: number
  outputTokens: number
  cost: number
}

function uid(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

const seedLogs: ApiRequestLog[] = [
  { id: 'req-demo-1', appId: 'app-demo', keyId: 'key-demo', endpoint: '/v1/agents/report/generate', method: 'POST', statusCode: 200, duration: 1260, timestamp: Date.now() - 3600_000, inputTokens: 1840, outputTokens: 3690, cost: 0.42 },
  { id: 'req-demo-2', appId: 'app-demo', keyId: 'key-demo', endpoint: '/v1/nl2sql/query', method: 'POST', statusCode: 200, duration: 680, timestamp: Date.now() - 7200_000, inputTokens: 720, outputTokens: 1180, cost: 0.13 },
  { id: 'req-demo-3', appId: 'app-demo', keyId: 'key-demo', endpoint: '/v1/skills/invoke', method: 'POST', statusCode: 500, duration: 2100, timestamp: Date.now() - 86400_000, inputTokens: 460, outputTokens: 0, cost: 0.03 },
]

export const useWorkbenchStatsStore = defineStore('workbenchStats', () => {
  const logs = ref<ApiRequestLog[]>(seedLogs)

  const summary = computed(() => {
    const inputTokens = logs.value.reduce((sum, l) => sum + (l.inputTokens || 0), 0)
    const outputTokens = logs.value.reduce((sum, l) => sum + (l.outputTokens || 0), 0)
    const cost = logs.value.reduce((sum, l) => sum + (l.cost || 0), 0)
    const success = logs.value.filter(l => l.statusCode >= 200 && l.statusCode < 300).length
    return { calls: logs.value.length, inputTokens, outputTokens, totalTokens: inputTokens + outputTokens, cost, successRate: logs.value.length ? Math.round(success / logs.value.length * 1000) / 10 : 0 }
  })

  function addLog(p: Omit<ApiRequestLog, 'id'>) { logs.value.unshift({ ...p, id: uid('req') }) }
  function deleteLogs(ids: string[]) { const set = new Set(ids); logs.value = logs.value.filter(l => !set.has(l.id)) }
  function resetStats() { logs.value = [] }
  function onAppDeleted(appId: string) { logs.value = logs.value.filter(l => l.appId !== appId) }
  function onAppsDeleted(appIds: string[]) { const set = new Set(appIds); logs.value = logs.value.filter(l => !set.has(l.appId)) }
  function onKeyDeleted(keyId: string) { logs.value = logs.value.filter(l => l.keyId !== keyId) }
  function onKeysDeleted(keyIds: string[]) { const set = new Set(keyIds); logs.value = logs.value.filter(l => !set.has(l.keyId)) }

  return { logs, summary, addLog, deleteLogs, resetStats, onAppDeleted, onAppsDeleted, onKeyDeleted, onKeysDeleted }
}, { persist: true })
