import { defineStore } from 'pinia'
import { ref } from 'vue'

export type DevAppStatus = 'enabled' | 'disabled'
export type DevApp = {
  id: string; name: string; description: string; status: DevAppStatus
  createdAt: number; updatedAt: number
}

function uid(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

const now = Date.now()

export const useWorkbenchAppsStore = defineStore('workbenchApps', () => {
  const apps = ref<DevApp[]>([
    { id: 'app-demo', name: '安全生产 AI 平台演示项目', description: '用于 API 计费、Token 用量和报告生成链路演示。', status: 'enabled', createdAt: now - 86400000 * 5, updatedAt: now - 3600000 },
  ])

  function createApp(p: { name: string; description: string; status?: DevAppStatus }) {
    const now = Date.now()
    apps.value.unshift({ id: uid('app'), name: p.name, description: p.description, status: p.status ?? 'enabled', createdAt: now, updatedAt: now })
  }
  function updateApp(p: { id: string; name?: string; description?: string; status?: DevAppStatus }) {
    const a = apps.value.find(x => x.id === p.id)
    if (!a) return
    if (p.name !== undefined) a.name = p.name
    if (p.description !== undefined) a.description = p.description
    if (p.status !== undefined) a.status = p.status
    a.updatedAt = Date.now()
  }
  function deleteApp(id: string) { apps.value = apps.value.filter(x => x.id !== id) }
  function deleteApps(ids: string[]) { const set = new Set(ids); apps.value = apps.value.filter(x => !set.has(x.id)) }
  function setAppStatus(id: string, status: DevAppStatus) { const a = apps.value.find(x => x.id === id); if (a) { a.status = status; a.updatedAt = Date.now() } }
  function setAppsStatus(ids: string[], status: DevAppStatus) { const set = new Set(ids); const now = Date.now(); apps.value.forEach(a => { if (set.has(a.id)) { a.status = status; a.updatedAt = now } }) }
  function resetApps() { apps.value = [] }

  return { apps, createApp, updateApp, deleteApp, deleteApps, setAppStatus, setAppsStatus, resetApps }
}, { persist: true })
