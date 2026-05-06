import { defineStore } from 'pinia'
import { ref } from 'vue'

export type ApiKeyStatus = 'enabled' | 'disabled'
export type ApiKey = {
  id: string
  name: string
  keyValue: string
  appId: string
  status: ApiKeyStatus
  expiresAt: number | null
  knowledgeBase: string[]
  aiSkill: string[]
  aiAgent: string[]
  // 兼容旧字段
  agentKnowledgeBase?: string[]
  createdAt: number
  createdBy: string
  updatedAt: number
}

function uid(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}
function genKey() {
  return 'sk-' + Array.from({ length: 48 }, () => 'abcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 36)]).join('')
}

export const useWorkbenchKeysStore = defineStore('workbenchKeys', () => {
  const keys = ref<ApiKey[]>([
    { id: 'key-demo', name: '演示密钥', keyValue: 'sk-demo0000000000000000000000000000000000000001', appId: 'app-demo', status: 'enabled', expiresAt: null, knowledgeBase: ['kb-safety-production'], agentKnowledgeBase: ['kb-safety-production'], aiSkill: ['llm-nl2sql', 'mcp-tool-registry'], aiAgent: ['agent-report-writer'], createdAt: Date.now() - 86400000 * 3, createdBy: 'system', updatedAt: Date.now() - 3600000 },
  ])

  function createKey(p: { name: string; appId?: string; expiresAt?: number | null; createdBy?: string; knowledgeBase?: string[]; agentKnowledgeBase?: string[]; aiSkill?: string[]; aiAgent?: string[] }) {
    const now = Date.now()
    const knowledgeBase = p.knowledgeBase ?? p.agentKnowledgeBase ?? []
    keys.value.unshift({
      id: uid('key'), name: p.name, keyValue: genKey(), appId: p.appId ?? '',
      status: 'enabled', expiresAt: p.expiresAt ?? null,
      knowledgeBase, agentKnowledgeBase: knowledgeBase, aiSkill: p.aiSkill ?? [], aiAgent: p.aiAgent ?? [],
      createdAt: now, createdBy: p.createdBy ?? '', updatedAt: now,
    })
  }
  function updateKey(p: { id: string; name?: string; status?: ApiKeyStatus; expiresAt?: number | null; knowledgeBase?: string[]; agentKnowledgeBase?: string[]; aiSkill?: string[]; aiAgent?: string[] }) {
    const k = keys.value.find(x => x.id === p.id)
    if (!k) return
    if (p.name !== undefined) k.name = p.name
    if (p.status !== undefined) k.status = p.status
    if (p.expiresAt !== undefined) k.expiresAt = p.expiresAt
    if (p.knowledgeBase !== undefined || p.agentKnowledgeBase !== undefined) {
      k.knowledgeBase = p.knowledgeBase ?? p.agentKnowledgeBase ?? []
      k.agentKnowledgeBase = k.knowledgeBase
    }
    if (p.aiSkill !== undefined) k.aiSkill = p.aiSkill
    if (p.aiAgent !== undefined) k.aiAgent = p.aiAgent
    k.updatedAt = Date.now()
  }
  function deleteKey(id: string) { keys.value = keys.value.filter(x => x.id !== id) }
  function deleteKeys(ids: string[]) { const set = new Set(ids); keys.value = keys.value.filter(x => !set.has(x.id)) }
  function setKeysStatus(ids: string[], status: ApiKeyStatus) { const set = new Set(ids); const now = Date.now(); keys.value.forEach(k => { if (set.has(k.id)) { k.status = status; k.updatedAt = now } }) }
  function resetKeys() { keys.value = [] }
  function onAppDeleted(appId: string) { keys.value = keys.value.filter(k => k.appId !== appId) }
  function onAppsDeleted(appIds: string[]) { const set = new Set(appIds); keys.value = keys.value.filter(k => !set.has(k.appId)) }

  return { keys, createKey, updateKey, deleteKey, deleteKeys, setKeysStatus, resetKeys, onAppDeleted, onAppsDeleted }
}, { persist: true })
