<script setup lang="ts">
import { ref, computed } from 'vue'
import { Search } from 'lucide-vue-next'
import { useSubscriptionsStore, type SubscriptionStatus, type SubscriptionType } from '@/stores/subscriptions'

defineOptions({ name: 'WorkbenchSubscriptions' })

const subsStore = useSubscriptionsStore()
const keyword = ref('')
const type = ref<SubscriptionType | 'all'>('all')
const status = ref<SubscriptionStatus | 'all'>('all')

function pad2(n: number) { return String(n).padStart(2, '0') }
function formatDate(ts: number) { const d = new Date(ts); return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}` }
function statusLabel(s: SubscriptionStatus) { return s === 'active' ? '已生效' : '已删除' }
function statusClassName(s: SubscriptionStatus) { return s === 'active' ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : 'bg-slate-100 text-slate-500 ring-slate-200' }

const filtered = computed(() => {
  const k = keyword.value.trim().toLowerCase()
  return subsStore.services.filter(svc => {
    if (type.value !== 'all' && svc.type !== type.value) return false
    if (status.value !== 'all' && svc.status !== status.value) return false
    if (!k) return true
    return `${svc.id} ${svc.name} ${svc.provider} ${svc.type}`.toLowerCase().includes(k)
  })
})
</script>

<template>
  <div class="space-y-4">
    <div class="rounded-2xl border border-sky-200/70 bg-white/70 p-6 shadow-[inset_0_0_0_1px_rgba(0,180,255,0.08)]">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div><div class="text-sm font-semibold text-slate-900">订阅列表</div><div class="mt-1 text-xs text-slate-600">统一查看已订阅能力服务，覆盖 AI 技能、AI 智能体、RAG、AI 安全算法等类型。</div></div>
        <div class="rounded-xl bg-white/75 px-3 py-2 text-xs text-slate-600 ring-1 ring-sky-200/70">可基于服务状态进行续订与容量规划</div>
      </div>
      <div class="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div class="relative w-full lg:max-w-[420px]">
          <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input v-model="keyword" placeholder="搜索服务 ID / 名称 / 提供方 / 类型" class="w-full rounded-xl border border-sky-200/70 bg-white/80 py-2 pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-[#00B4FF]/55" />
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <select v-model="type" class="rounded-xl border border-sky-200/70 bg-white/80 px-3 py-2 text-sm text-slate-900 outline-none"><option value="all">全部类型</option><option value="MCP">AI 技能</option><option value="Agent">AI 智能体</option><option value="RAG">RAG</option><option value="算法">AI 安全算法</option></select>
          <select v-model="status" class="rounded-xl border border-sky-200/70 bg-white/80 px-3 py-2 text-sm text-slate-900 outline-none"><option value="all">全部状态</option><option value="active">已生效</option><option value="deleted">已删除</option></select>
        </div>
      </div>
    </div>
    <div class="overflow-hidden rounded-2xl border border-sky-200/70 bg-white/60">
      <div class="overflow-auto">
        <table class="w-full min-w-[1040px] text-left text-sm">
          <thead class="bg-white/70 text-xs text-slate-600"><tr><th class="px-4 py-3">服务</th><th class="px-4 py-3">类型</th><th class="px-4 py-3">状态</th><th class="px-4 py-3">订阅时间</th></tr></thead>
          <tbody class="divide-y divide-sky-200/50">
            <tr v-if="!filtered.length"><td colspan="4" class="px-6 py-10 text-center text-sm text-slate-600">暂无匹配的订阅服务</td></tr>
            <tr v-for="svc in filtered" :key="svc.id" class="bg-white/40">
              <td class="px-4 py-3"><div class="min-w-0"><div class="truncate font-semibold text-slate-900">{{ svc.name }}</div><div class="mt-1 text-[11px] text-slate-600">{{ svc.provider }} · {{ svc.version }}</div><div class="mt-1 text-[11px] text-slate-500">{{ svc.id }}</div></div></td>
              <td class="px-4 py-3"><span class="rounded-full bg-white/70 px-2 py-0.5 text-[11px] text-slate-700 ring-1 ring-sky-200/70">{{ svc.type }}</span></td>
              <td class="px-4 py-3"><span :class="`rounded-full px-2 py-0.5 text-[11px] ring-1 ${statusClassName(svc.status)}`">{{ statusLabel(svc.status) }}</span></td>
              <td class="px-4 py-3 text-xs text-slate-700">{{ formatDate(svc.subscribedAt) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
