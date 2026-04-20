import { defineStore } from 'pinia'
import { ref } from 'vue'

export type ApiRequestLog = {
  id: string; appId: string; keyId: string; endpoint: string
  method: string; statusCode: number; duration: number; timestamp: number
}

function uid(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export const useWorkbenchStatsStore = defineStore('workbenchStats', () => {
  const logs = ref<ApiRequestLog[]>([])

  function addLog(p: Omit<ApiRequestLog, 'id'>) {
    logs.value.unshift({ ...p, id: uid('req') })
  }
  function deleteLogs(ids: string[]) {
    const set = new Set(ids)
    logs.value = logs.value.filter(l => !set.has(l.id))
  }
  function resetStats() { logs.value = [] }

  function onAppDeleted(appId: string) {
    logs.value = logs.value.filter(l => l.appId !== appId)
  }
  function onAppsDeleted(appIds: string[]) {
    const set = new Set(appIds)
    logs.value = logs.value.filter(l => !set.has(l.appId))
  }
  function onKeyDeleted(keyId: string) {
    logs.value = logs.value.filter(l => l.keyId !== keyId)
  }
  function onKeysDeleted(keyIds: string[]) {
    const set = new Set(keyIds)
    logs.value = logs.value.filter(l => !set.has(l.keyId))
  }

  return { logs, addLog, deleteLogs, resetStats, onAppDeleted, onAppsDeleted, onKeyDeleted, onKeysDeleted }
}, { persist: true })
