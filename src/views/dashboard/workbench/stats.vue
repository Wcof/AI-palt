<script setup lang="ts">
import { ref, computed } from 'vue'
import { Search } from 'lucide-vue-next'
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
    <div class="rounded-2xl border border-sky-200/70 bg-white/70 p-6 shadow-[inset_0_0_0_1px_rgba(0,180,255,0.08)]">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div><div class="text-sm font-semibold text-slate-900">统计明细</div><div class="mt-1 text-xs text-slate-600">查看 API 调用日志，支持按应用、密钥与关键词筛选。</div></div>
        <div class="rounded-xl bg-white/75 px-3 py-2 text-xs text-slate-600 ring-1 ring-sky-200/70">共 {{ statsStore.logs.length }} 条记录</div>
      </div>

      <div class="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div class="relative w-full lg:max-w-[420px]">
          <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input v-model="keyword" placeholder="搜索日志 ID / 应用 / 密钥 / 接口" class="w-full rounded-xl border border-sky-200/70 bg-white/80 py-2 pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-[#00B4FF]/55" />
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <select v-model="appFilter" class="rounded-xl border border-sky-200/70 bg-white/80 px-3 py-2 text-sm text-slate-900 outline-none">
            <option value="all">全部应用</option>
            <option v-for="app in appsStore.apps" :key="app.id" :value="app.id">{{ app.name }}</option>
          </select>
          <select v-model="keyFilter" class="rounded-xl border border-sky-200/70 bg-white/80 px-3 py-2 text-sm text-slate-900 outline-none">
            <option value="all">全部密钥</option>
            <option v-for="key in keysStore.keys" :key="key.id" :value="key.id">{{ key.name }}</option>
          </select>
        </div>
      </div>
    </div>

    <div class="overflow-hidden rounded-2xl border border-sky-200/70 bg-white/60">
      <div class="overflow-auto">
        <table class="w-full min-w-[1080px] text-left text-sm">
          <thead class="bg-white/70 text-xs text-slate-600">
            <tr><th class="px-4 py-3">时间</th><th class="px-4 py-3">接口</th><th class="px-4 py-3">方法</th><th class="px-4 py-3">状态码</th><th class="px-4 py-3">耗时</th><th class="px-4 py-3">应用</th><th class="px-4 py-3">密钥</th></tr>
          </thead>
          <tbody class="divide-y divide-sky-200/50">
            <tr v-if="!filtered.length"><td colspan="7" class="px-6 py-10 text-center text-sm text-slate-600">暂无调用记录</td></tr>
            <tr v-for="log in filtered" :key="log.id" class="bg-white/40">
              <td class="px-4 py-3 text-xs text-slate-600">{{ formatDateTime(log.timestamp) }}</td>
              <td class="px-4 py-3 text-xs font-semibold text-slate-900">{{ log.endpoint }}</td>
              <td class="px-4 py-3"><span class="rounded-full bg-white/70 px-2 py-0.5 text-[11px] text-slate-700 ring-1 ring-sky-200/70">{{ log.method }}</span></td>
              <td class="px-4 py-3"><span :class="`rounded-full px-2 py-0.5 text-[11px] ring-1 ${statusColor(log.statusCode)}`">{{ log.statusCode }}</span></td>
              <td class="px-4 py-3 text-xs text-slate-600">{{ log.duration }}ms</td>
              <td class="px-4 py-3 text-xs text-slate-600">{{ log.appId }}</td>
              <td class="px-4 py-3 text-xs text-slate-600">{{ log.keyId }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
