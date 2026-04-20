import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useWorkbenchAppsStore } from './workbenchApps'

export type ApiKeyStatus = 'enabled' | 'disabled'
export type ApiKey = {
  id: string; name: string; keyValue: string; appId: string
  status: ApiKeyStatus; expiresAt: number | null
  createdAt: number; createdBy: string; updatedAt: number
}

function uid(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}
function genKey() {
  return 'sk-' + Array.from({ length: 48 }, () => 'abcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 36)]).join('')
}

export const useWorkbenchKeysStore = defineStore('workbenchKeys', () => {
  const keys = ref<ApiKey[]>([])

  function createKey(p: { name: string; appId?: string; expiresAt?: number | null; createdBy?: string }) {
    const now = Date.now()
    keys.value.unshift({
      id: uid('key'), name: p.name, keyValue: genKey(), appId: p.appId ?? '',
      status: 'enabled', expiresAt: p.expiresAt ?? null,
      createdAt: now, createdBy: p.createdBy ?? '', updatedAt: now,
    })
  }
  function updateKey(p: { id: string; name?: string; status?: ApiKeyStatus; expiresAt?: number | null }) {
    const k = keys.value.find(x => x.id === p.id)
    if (!k) return
    if (p.name !== undefined) k.name = p.name
    if (p.status !== undefined) k.status = p.status
    if (p.expiresAt !== undefined) k.expiresAt = p.expiresAt
    k.updatedAt = Date.now()
  }
  function deleteKey(id: string) { keys.value = keys.value.filter(x => x.id !== id) }
  function deleteKeys(ids: string[]) {
    const set = new Set(ids)
    keys.value = keys.value.filter(x => !set.has(x.id))
  }
  function setKeysStatus(ids: string[], status: ApiKeyStatus) {
    const set = new Set(ids)
    const now = Date.now()
    keys.value.forEach(k => { if (set.has(k.id)) { k.status = status; k.updatedAt = now } })
  }
  function resetKeys() { keys.value = [] }

  // Cascade delete when apps are deleted
  function onAppDeleted(appId: string) {
    keys.value = keys.value.filter(k => k.appId !== appId)
  }
  function onAppsDeleted(appIds: string[]) {
    const set = new Set(appIds)
    keys.value = keys.value.filter(k => !set.has(k.appId))
  }

  return { keys, createKey, updateKey, deleteKey, deleteKeys, setKeysStatus, resetKeys, onAppDeleted, onAppsDeleted }
}, { persist: true })
