<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Plus, Search, Trash2, X } from 'lucide-vue-next'
import { useWorkbenchAppsStore, type DevApp, type DevAppStatus } from '@/stores/workbenchApps'
import { useUserStore } from '@/stores/user'
import AppEditorModal from '@/components/workbench/AppEditorModal.vue'

defineOptions({ name: 'WorkbenchApps' })

const appsStore = useWorkbenchAppsStore()
const userStore = useUserStore()
const keyword = ref('')
const status = ref<DevAppStatus | 'all'>('all')
const selectedIds = ref<string[]>([])
const createOpen = ref(false)
const editTarget = ref<DevApp | null>(null)

function formatDateTime(ts: number) {
  const d = new Date(ts), p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}

const filtered = computed(() => {
  const k = keyword.value.trim().toLowerCase()
  return appsStore.apps.filter(a => {
    if (status.value !== 'all' && a.status !== status.value) return false
    if (!k) return true
    return `${a.id} ${a.name} ${a.description}`.toLowerCase().includes(k)
  })
})

const selectableIds = computed(() => filtered.value.map(a => a.id))
</script>

<template>
  <div class="rounded-2xl border border-sky-200/70 bg-white/70 p-6 shadow-[inset_0_0_0_1px_rgba(0,180,255,0.08)]">
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div><div class="text-sm font-semibold text-slate-900">应用管理</div><div class="mt-1 text-xs text-slate-600">支持应用创建、编辑、删除、批量操作与启用/禁用管理。</div></div>
      <button type="button" @click="createOpen = true" :disabled="!userStore.isAuthenticated" class="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#0098FF] to-[#006CFF] px-4 py-2 text-sm font-semibold text-white ring-1 ring-[#00B4FF]/55 transition hover:brightness-105 disabled:opacity-50"><Plus class="h-4 w-4" /> 创建应用</button>
    </div>

    <div v-if="!userStore.isAuthenticated" class="mt-4 rounded-2xl border border-dashed border-sky-200/70 bg-white/50 px-4 py-8 text-center text-sm text-slate-600">登录后可创建与管理应用。</div>

    <div class="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div class="relative w-full lg:max-w-[420px]">
        <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input v-model="keyword" placeholder="搜索应用 ID / 名称 / 描述" class="w-full rounded-xl border border-sky-200/70 bg-white/80 py-2 pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-[#00B4FF]/55" />
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <select v-model="status" @change="selectedIds = []" class="rounded-xl border border-sky-200/70 bg-white/80 px-3 py-2 text-sm text-slate-900 outline-none"><option value="all">全部状态</option><option value="enabled">启用</option><option value="disabled">禁用</option></select>
        <button type="button" @click="selectedIds.length && appsStore.setAppsStatus(selectedIds, 'enabled')" :disabled="!userStore.isAuthenticated || !selectedIds.length" class="rounded-xl bg-white/70 px-3 py-2 text-xs font-semibold text-slate-900 ring-1 ring-sky-200/70 transition hover:bg-white disabled:opacity-50">批量启用</button>
        <button type="button" @click="selectedIds.length && appsStore.setAppsStatus(selectedIds, 'disabled')" :disabled="!userStore.isAuthenticated || !selectedIds.length" class="rounded-xl bg-white/70 px-3 py-2 text-xs font-semibold text-slate-900 ring-1 ring-sky-200/70 transition hover:bg-white disabled:opacity-50">批量禁用</button>
        <button type="button" @click="selectedIds.length && (appsStore.deleteApps(selectedIds), selectedIds = selectedIds.filter(id => !selectedIds.includes(id)))" :disabled="!userStore.isAuthenticated || !selectedIds.length" class="inline-flex items-center gap-2 rounded-xl bg-white/70 px-3 py-2 text-xs font-semibold text-slate-900 ring-1 ring-sky-200/70 transition hover:bg-white disabled:opacity-50"><Trash2 class="h-4 w-4" /> 批量删除</button>
      </div>
    </div>

    <div class="mt-4 overflow-hidden rounded-2xl border border-sky-200/70 bg-white/60">
      <div class="overflow-auto">
        <table class="w-full min-w-[980px] text-left text-sm">
          <thead class="bg-white/70 text-xs text-slate-600">
            <tr>
              <th class="w-10 px-4 py-3"><input type="checkbox" :checked="selectedIds.length > 0 && selectedIds.length === selectableIds.length" @change="selectedIds = ($event.target as HTMLInputElement).checked ? [...selectableIds] : []" class="h-4 w-4 accent-[#0098FF]" /></th>
              <th class="px-4 py-3">应用</th><th class="px-4 py-3">状态</th><th class="px-4 py-3">创建时间</th><th class="px-4 py-3">更新时间</th><th class="px-4 py-3">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-sky-200/50">
            <tr v-if="!filtered.length"><td colspan="6" class="px-6 py-10 text-center text-sm text-slate-600">暂无应用</td></tr>
            <tr v-for="app in filtered" :key="app.id" class="bg-white/40">
              <td class="px-4 py-3"><input type="checkbox" :checked="selectedIds.includes(app.id)" @change="selectedIds = selectedIds.includes(app.id) ? selectedIds.filter(x => x !== app.id) : [...selectedIds, app.id]" class="h-4 w-4 accent-[#0098FF]" /></td>
              <td class="px-4 py-3"><div class="min-w-0"><div class="flex items-center gap-2"><div class="truncate font-semibold text-slate-900">{{ app.name }}</div><div class="rounded-full bg-white/70 px-2 py-0.5 text-[11px] text-slate-700 ring-1 ring-sky-200/70">{{ app.id }}</div></div><div class="mt-1 text-xs text-slate-600 text-clamp-2">{{ app.description || '-' }}</div></div></td>
              <td class="px-4 py-3"><span class="rounded-full bg-[#00B4FF]/12 px-2 py-0.5 text-[11px] text-slate-700 ring-1 ring-[#00B4FF]/25">{{ app.status === 'enabled' ? '启用' : '禁用' }}</span></td>
              <td class="px-4 py-3 text-xs text-slate-600">{{ formatDateTime(app.createdAt) }}</td>
              <td class="px-4 py-3 text-xs text-slate-600">{{ formatDateTime(app.updatedAt) }}</td>
              <td class="px-4 py-3">
                <div class="flex flex-wrap items-center gap-2">
                  <button type="button" @click="editTarget = app" :disabled="!userStore.isAuthenticated" class="rounded-xl bg-white/70 px-3 py-1.5 text-xs font-semibold text-slate-900 ring-1 ring-sky-200/70 transition hover:bg-white disabled:opacity-50">编辑</button>
                  <button type="button" @click="appsStore.updateApp({ id: app.id, status: app.status === 'enabled' ? 'disabled' : 'enabled' })" :disabled="!userStore.isAuthenticated" class="rounded-xl bg-white/70 px-3 py-1.5 text-xs font-semibold text-slate-900 ring-1 ring-sky-200/70 transition hover:bg-white disabled:opacity-50">{{ app.status === 'enabled' ? '禁用' : '启用' }}</button>
                  <button type="button" @click="appsStore.deleteApps([app.id])" :disabled="!userStore.isAuthenticated" class="rounded-xl bg-white/70 px-3 py-1.5 text-xs font-semibold text-slate-900 ring-1 ring-sky-200/70 transition hover:bg-white disabled:opacity-50">删除</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <AppEditorModal v-if="createOpen" title="创建应用" :initial="{ name: '', description: '', status: 'enabled' as DevAppStatus }" @close="createOpen = false" @submit="(v: any) => { appsStore.createApp(v); createOpen = false }" />
    <AppEditorModal v-if="editTarget" title="编辑应用" :initial="{ name: editTarget.name, description: editTarget.description, status: editTarget.status }" @close="editTarget = null" @submit="(v: any) => { appsStore.updateApp({ id: editTarget!.id, ...v }); editTarget = null }" />
  </div>
</template>
