<script setup lang="ts">
import { ref, computed } from 'vue'
import { Activity, Coins, Database, Search } from 'lucide-vue-next'
import { useWorkbenchStatsStore } from '@/stores/workbenchStats'
import { useWorkbenchAppsStore } from '@/stores/workbenchApps'
import { useWorkbenchKeysStore } from '@/stores/workbenchKeys'

defineOptions({ name: 'WorkbenchStats' })

const statsStore = useWorkbenchStatsStore()
const appsStore = useWorkbenchAppsStore()
const keysStore = useWorkbenchKeysStore()

const keyword = ref('')
const appFilter = ref('all')
const keyFilter = ref('all')

function pad2(n: number) { return String(n).padStart(2, '0') }
function formatDateTime(ts: number) { const d = new Date(ts); return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}` }
function appName(id: string) { return appsStore.apps.find(a => a.id === id)?.name || id || '-' }
function keyName(id: string) { return keysStore.keys.find(k => k.id === id)?.name || id || '-' }

const filtered = computed(() => {
  const k = keyword.value.trim().toLowerCase()
  return statsStore.logs.filter(log => {
    if (appFilter.value !== 'all' && log.appId !== appFilter.value) return false
    if (keyFilter.value !== 'all' && log.keyId !== keyFilter.value) return false
    if (!k) return true
    return `${log.id} ${log.appId} ${log.keyId} ${log.endpoint} ${log.method}`.toLowerCase().includes(k)
  })
})

function statusColor(code: number) {
  if (code >= 200 && code < 300) return 'bg-emerald-50 text-emerald-700 ring-emerald-200'
  if (code >= 400) return 'bg-rose-50 text-rose-700 ring-rose-200'
  return 'bg-amber-50 text-amber-700 ring-amber-200'
}
</script>

<template>
  <div class="space-y-4">
    <div class="grid gap-3 md:grid-cols-4">
      <div class="rounded-2xl border border-sky-200/70 bg-white/75 p-4"><div class="flex items-center gap-2 text-xs text-slate-500"><Activity class="h-4 w-4" /> 调用次数</div><div class="mt-2 text-2xl font-semibold text-slate-950">{{ statsStore.summary.calls }}</div></div>
      <div class="rounded-2xl border border-sky-200/70 bg-white/75 p-4"><div class="flex items-center gap-2 text-xs text-slate-500"><Database class="h-4 w-4" /> 上行 Token</div><div class="mt-2 text-2xl font-semibold text-slate-950">{{ statsStore.summary.inputTokens }}</div></div>
      <div class="rounded-2xl border border-sky-200/70 bg-white/75 p-4"><div class="flex items-center gap-2 text-xs text-slate-500"><Database class="h-4 w-4" /> 下行 Token</div><div class="mt-2 text-2xl font-semibold text-slate-950">{{ statsStore.summary.outputTokens }}</div></div>
      <div class="rounded-2xl border border-sky-200/70 bg-white/75 p-4"><div class="flex items-center gap-2 text-xs text-slate-500"><Coins class="h-4 w-4" /> 消费预估</div><div class="mt-2 text-2xl font-semibold text-slate-950">¥{{ statsStore.summary.cost.toFixed(2) }}</div></div>
    </div>

    <div class="rounded-2xl border border-sky-200/70 bg-white/70 p-6 shadow-[inset_0_0_0_1px_rgba(0,180,255,0.08)]">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div><div class="text-sm font-semibold text-slate-900">统计明细 / 用量概览</div><div class="mt-1 text-xs text-slate-600">按项目、密钥、接口查看调用次数、上行 Token、下行 Token 与消费明细。本期只做统计展示闭环，不做复杂结算。</div></div>
        <div class="rounded-xl bg-white/75 px-3 py-2 text-xs text-slate-600 ring-1 ring-sky-200/70">成功率 {{ statsStore.summary.successRate }}%</div>
      </div>

      <div class="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div class="relative w-full lg:max-w-[420px]"><Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" /><input v-model="keyword" placeholder="搜索日志 ID / 项目 / 密钥 / 接口" class="w-full rounded-xl border border-sky-200/70 bg-white/80 py-2 pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-[#00B4FF]/55" /></div>
        <div class="flex flex-wrap items-center gap-2"><select v-model="appFilter" class="rounded-xl border border-sky-200/70 bg-white/80 px-3 py-2 text-sm text-slate-900 outline-none"><option value="all">全部项目</option><option v-for="app in appsStore.apps" :key="app.id" :value="app.id">{{ app.name }}</option></select><select v-model="keyFilter" class="rounded-xl border border-sky-200/70 bg-white/80 px-3 py-2 text-sm text-slate-900 outline-none"><option value="all">全部密钥</option><option v-for="key in keysStore.keys" :key="key.id" :value="key.id">{{ key.name }}</option></select></div>
      </div>
    </div>

    <div class="overflow-hidden rounded-2xl border border-sky-200/70 bg-white/60">
      <div class="overflow-auto">
        <table class="w-full min-w-[1180px] text-left text-sm">
          <thead class="bg-white/70 text-xs text-slate-600"><tr><th class="px-4 py-3">时间</th><th class="px-4 py-3">接口</th><th class="px-4 py-3">状态码</th><th class="px-4 py-3">耗时</th><th class="px-4 py-3">项目</th><th class="px-4 py-3">密钥</th><th class="px-4 py-3">上行 Token</th><th class="px-4 py-3">下行 Token</th><th class="px-4 py-3">消费</th></tr></thead>
          <tbody class="divide-y divide-sky-200/50">
            <tr v-if="!filtered.length"><td colspan="9" class="px-6 py-10 text-center text-sm text-slate-600">暂无调用记录</td></tr>
            <tr v-for="log in filtered" :key="log.id" class="bg-white/40"><td class="px-4 py-3 text-xs text-slate-600">{{ formatDateTime(log.timestamp) }}</td><td class="px-4 py-3"><div class="text-xs font-semibold text-slate-900">{{ log.endpoint }}</div><div class="mt-1 text-[11px] text-slate-500">{{ log.method }}</div></td><td class="px-4 py-3"><span :class="`rounded-full px-2 py-0.5 text-[11px] ring-1 ${statusColor(log.statusCode)}`">{{ log.statusCode }}</span></td><td class="px-4 py-3 text-xs text-slate-600">{{ log.duration }}ms</td><td class="px-4 py-3 text-xs text-slate-600">{{ appName(log.appId) }}</td><td class="px-4 py-3 text-xs text-slate-600">{{ keyName(log.keyId) }}</td><td class="px-4 py-3 text-xs text-slate-600">{{ log.inputTokens || 0 }}</td><td class="px-4 py-3 text-xs text-slate-600">{{ log.outputTokens || 0 }}</td><td class="px-4 py-3 text-xs font-semibold text-slate-900">¥{{ (log.cost || 0).toFixed(2) }}</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
