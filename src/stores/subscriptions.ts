import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type SubscriptionType = 'MCP' | 'Agent' | 'RAG' | '算法'
export type SubscriptionStatus = 'active' | 'deleted'

export type SubscribedService = {
  id: string; name: string; type: SubscriptionType; provider: string
  version: string; status: SubscriptionStatus; subscribedAt: number
}

const seeded: SubscribedService[] = [
  { id: 'svc-mcp-math-toolkit', name: 'Math Toolkit', type: 'MCP', provider: 'Geeklab MCP Hub', version: 'v1.3.2', status: 'active', subscribedAt: new Date('2026-01-15T10:00:00+08:00').getTime() },
  { id: 'svc-agent-bi-assistant', name: 'BI 分析智能体', type: 'Agent', provider: 'DataFlow Agent Studio', version: 'v2.1.0', status: 'active', subscribedAt: new Date('2026-02-22T14:30:00+08:00').getTime() },
  { id: 'svc-rag-industry-knowledge', name: '行业知识问答 RAG', type: 'RAG', provider: 'Insight Knowledge Cloud', version: 'v4.0.1', status: 'active', subscribedAt: new Date('2025-12-20T09:00:00+08:00').getTime() },
  { id: 'svc-cv-doc-ocr', name: '多语言文档 OCR', type: '算法', provider: 'VisionX AI', version: 'v1.8.5', status: 'active', subscribedAt: new Date('2025-11-11T11:00:00+08:00').getTime() },
  { id: 'svc-mcp-web-crawler', name: '网页抓取 MCP', type: 'MCP', provider: 'Geeklab MCP Hub', version: 'v0.9.9', status: 'deleted', subscribedAt: new Date('2025-10-01T08:30:00+08:00').getTime() },
]

export const useSubscriptionsStore = defineStore('subscriptions', () => {
  const services = ref<SubscribedService[]>([...seeded])

  const activeSubscriptions = computed(() => services.value.filter(s => s.status === 'active'))

  function isSubscribed(abilityId: string) {
    return services.value.some(s => s.id === abilityId && s.status === 'active')
  }

  function subscribe(payload: { id: string; name: string; type: SubscriptionType; provider: string; version: string }) {
    if (services.value.find(s => s.id === payload.id)) return
    services.value.unshift({ ...payload, status: 'active', subscribedAt: Date.now() })
  }

  function unsubscribe(id: string) {
    const s = services.value.find(x => x.id === id)
    if (s) s.status = 'deleted'
  }

  function updateSubscriptionStatus(id: string, status: SubscriptionStatus) {
    const s = services.value.find(x => x.id === id)
    if (s) s.status = status
  }

  function resetSubscriptions() { services.value = [...seeded] }

  return { services, activeSubscriptions, isSubscribed, subscribe, unsubscribe, updateSubscriptionStatus, resetSubscriptions }
}, { persist: true })
