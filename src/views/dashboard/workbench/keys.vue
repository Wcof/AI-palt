<script setup lang="ts">
import { ref, computed } from 'vue'
import { Copy, Eye, EyeOff, Plus, Search, Trash2, X } from 'lucide-vue-next'
import { useWorkbenchKeysStore, type ApiKey, type ApiKeyStatus } from '@/stores/workbenchKeys'
import { useWorkbenchAppsStore } from '@/stores/workbenchApps'
import { useUserStore } from '@/stores/user'

defineOptions({ name: 'WorkbenchKeys' })

const keysStore = useWorkbenchKeysStore()
const appsStore = useWorkbenchAppsStore()
const userStore = useUserStore()

const keyword = ref('')
const statusFilter = ref<ApiKeyStatus | 'all'>('all')
const selectedIds = ref<string[]>([])
const createOpen = ref(false)
const revealedIds = ref<Set<string>>(new Set())

function pad2(n: number) { return String(n).padStart(2, '0') }
function formatDateTime(ts: number) { const d = new Date(ts); return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}` }
function formatDate(ts: number) { const d = new Date(ts); return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}` }
function maskKey(v: string) { return `${v.slice(0, 3)}_************************${v.slice(-4)}` }
function toggleReveal(id: string) { revealedIds.value.has(id) ? revealedIds.value.delete(id) : revealedIds.value.add(id); revealedIds.value = new Set(revealedIds.value) }

const filtered = computed(() => {
  const k = keyword.value.trim().toLowerCase()
  return keysStore.keys.filter(key => {
    if (statusFilter.value !== 'all' && key.status !== statusFilter.value) return false
    if (!k) return true
    return `${key.id} ${key.name} ${key.appId}`.toLowerCase().includes(k)
  })
})

const newName = ref('')
const newAppId = ref('')
const newExpires = ref('')

function handleCreate() {
  if (!newName.value.trim()) return
  keysStore.createKey({ name: newName.value.trim(), appId: newAppId.value || undefined, expiresAt: newExpires.value ? new Date(newExpires.value).getTime() : null })
  newName.value = ''; newAppId.value = ''; newExpires.value = ''; createOpen.value = false
}
</script>

<template>
  <div class="rounded-2xl border border-sky-200/70 bg-white/70 p-6 shadow-[inset_0_0_0_1px_rgba(0,180,255,0.08)]">
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div><div class="text-sm font-semibold text-slate-900">API 密钥管理</div><div class="mt-1 text-xs text-slate-600">管理 API 密钥的创建、启用/禁用与过期策略。</div></div>
      <button type="button" @click="createOpen = true" :disabled="!userStore.isAuthenticated" class="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#0098FF] to-[#006CFF] px-4 py-2 text-sm font-semibold text-white ring-1 ring-[#00B4FF]/55 transition hover:brightness-105 disabled:opacity-50"><Plus class="h-4 w-4" /> 创建密钥</button>
    </div>

    <div class="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div class="relative w-full lg:max-w-[420px]">
        <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input v-model="keyword" placeholder="搜索密钥 ID / 名称 / 应用 ID" class="w-full rounded-xl border border-sky-200/70 bg-white/80 py-2 pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-[#00B4FF]/55" />
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <select v-model="statusFilter" class="rounded-xl border border-sky-200/70 bg-white/80 px-3 py-2 text-sm text-slate-900 outline-none"><option value="all">全部状态</option><option value="enabled">启用</option><option value="disabled">禁用</option></select>
        <button type="button" @click="selectedIds.length && keysStore.deleteKeys(selectedIds)" :disabled="!userStore.isAuthenticated || !selectedIds.length" class="inline-flex items-center gap-2 rounded-xl bg-white/70 px-3 py-2 text-xs font-semibold text-slate-900 ring-1 ring-sky-200/70 disabled:opacity-50"><Trash2 class="h-4 w-4" /> 批量删除</button>
      </div>
    </div>

    <div class="mt-4 overflow-hidden rounded-2xl border border-sky-200/70 bg-white/60">
      <div class="overflow-auto">
        <table class="w-full min-w-[1080px] text-left text-sm">
          <thead class="bg-white/70 text-xs text-slate-600">
            <tr><th class="w-10 px-4 py-3"><input type="checkbox" :checked="selectedIds.length > 0 && selectedIds.length === filtered.length" @change="selectedIds = ($event.target as HTMLInputElement).checked ? filtered.map(k => k.id) : []" class="h-4 w-4 accent-[#0098FF]" /></th><th class="px-4 py-3">密钥</th><th class="px-4 py-3">关联应用</th><th class="px-4 py-3">状态</th><th class="px-4 py-3">过期时间</th><th class="px-4 py-3">操作</th></tr>
          </thead>
          <tbody class="divide-y divide-sky-200/50">
            <tr v-if="!filtered.length"><td colspan="6" class="px-6 py-10 text-center text-sm text-slate-600">暂无密钥</td></tr>
            <tr v-for="key in filtered" :key="key.id" class="bg-white/40">
              <td class="px-4 py-3"><input type="checkbox" :checked="selectedIds.includes(key.id)" @change="selectedIds = selectedIds.includes(key.id) ? selectedIds.filter(x => x !== key.id) : [...selectedIds, key.id]" class="h-4 w-4 accent-[#0098FF]" /></td>
              <td class="px-4 py-3">
                <div class="min-w-0">
                  <div class="truncate font-semibold text-slate-900">{{ key.name }}</div>
                  <div class="mt-1 flex items-center gap-2 text-[11px] text-slate-600">
                    <code>{{ revealedIds.has(key.id) ? key.keyValue : maskKey(key.keyValue) }}</code>
                    <button @click="toggleReveal(key.id)" class="text-slate-500 hover:text-slate-700"><component :is="revealedIds.has(key.id) ? EyeOff : Eye" class="h-3.5 w-3.5" /></button>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3 text-xs text-slate-600">{{ key.appId || '-' }}</td>
              <td class="px-4 py-3"><span class="rounded-full bg-[#00B4FF]/12 px-2 py-0.5 text-[11px] text-slate-700 ring-1 ring-[#00B4FF]/25">{{ key.status === 'enabled' ? '启用' : '禁用' }}</span></td>
              <td class="px-4 py-3 text-xs text-slate-600">{{ key.expiresAt ? formatDate(key.expiresAt) : '永不过期' }}</td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <button @click="keysStore.updateKey({ id: key.id, status: key.status === 'enabled' ? 'disabled' : 'enabled' })" :disabled="!userStore.isAuthenticated" class="rounded-xl bg-white/70 px-3 py-1.5 text-xs font-semibold text-slate-900 ring-1 ring-sky-200/70 disabled:opacity-50">{{ key.status === 'enabled' ? '禁用' : '启用' }}</button>
                  <button @click="keysStore.deleteKeys([key.id])" :disabled="!userStore.isAuthenticated" class="rounded-xl bg-white/70 px-3 py-1.5 text-xs font-semibold text-slate-900 ring-1 ring-sky-200/70 disabled:opacity-50">删除</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="createOpen" class="fixed inset-0 z-[320] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" @mousedown.self="createOpen = false">
      <div class="w-full max-w-[560px] rounded-2xl border border-sky-200/60 bg-white/90 p-5 shadow-2xl">
        <div class="flex items-start justify-between gap-3">
          <div class="text-base font-semibold text-slate-900">创建 API 密钥</div>
          <button @click="createOpen = false" class="rounded-xl bg-white/70 p-2 text-slate-700 ring-1 ring-sky-200/70"><X class="h-4 w-4" /></button>
        </div>
        <div class="mt-4 space-y-3">
          <div><div class="text-xs font-semibold text-slate-700">密钥名称</div><input v-model="newName" placeholder="例如：生产环境密钥" class="mt-1 w-full rounded-xl border border-sky-200/70 bg-white/80 px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#00B4FF]/55" /></div>
          <div><div class="text-xs font-semibold text-slate-700">关联应用（可选）</div>
            <select v-model="newAppId" class="mt-1 w-full rounded-xl border border-sky-200/70 bg-white/80 px-3 py-2 text-sm text-slate-900 outline-none"><option value="">不关联</option><option v-for="app in appsStore.apps" :key="app.id" :value="app.id">{{ app.name }}</option></select>
          </div>
          <div><div class="text-xs font-semibold text-slate-700">过期时间（可选）</div><input v-model="newExpires" type="date" class="mt-1 w-full rounded-xl border border-sky-200/70 bg-white/80 px-3 py-2 text-sm text-slate-900 outline-none" /></div>
        </div>
        <div class="mt-5 flex justify-end gap-2">
          <button @click="createOpen = false" class="rounded-xl bg-white/70 px-4 py-2 text-sm font-semibold text-slate-900 ring-1 ring-sky-200/70">取消</button>
          <button @click="handleCreate" :disabled="!newName.trim()" class="rounded-xl bg-gradient-to-r from-[#0098FF] to-[#006CFF] px-4 py-2 text-sm font-semibold text-white ring-1 ring-[#00B4FF]/55 disabled:opacity-50">创建</button>
        </div>
      </div>
    </div>
  </div>
</template>
