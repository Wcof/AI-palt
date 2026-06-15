<script setup lang="ts">
import { computed, ref } from 'vue'
import { Eye, EyeOff, Plus, Search, Trash2, X, KeyRound } from 'lucide-vue-next'
import { useWorkbenchKeysStore, type ApiKeyStatus } from '@/stores/workbenchKeys'
import { useWorkbenchAppsStore } from '@/stores/workbenchApps'
import { ABILITIES } from '@/data/abilities'

defineOptions({ name: 'WorkbenchKeys' })

const keysStore = useWorkbenchKeysStore()
const appsStore = useWorkbenchAppsStore()

const keyword = ref('')
const statusFilter = ref<ApiKeyStatus | 'all'>('all')
const selectedIds = ref<string[]>([])
const createOpen = ref(false)
const revealedIds = ref<Set<string>>(new Set())

function pad2(n: number) { return String(n).padStart(2, '0') }
function formatDate(ts: number) { const d = new Date(ts); return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}` }
function maskKey(v: string) { return `${v.slice(0, 6)}************************${v.slice(-4)}` }
function toggleReveal(id: string) { revealedIds.value.has(id) ? revealedIds.value.delete(id) : revealedIds.value.add(id); revealedIds.value = new Set(revealedIds.value) }
function abilityName(id: string) { return ABILITIES.find(a => a.id === id)?.name || id }

const filtered = computed(() => {
  const k = keyword.value.trim().toLowerCase()
  return keysStore.keys.filter(key => {
    if (statusFilter.value !== 'all' && key.status !== statusFilter.value) return false
    if (!k) return true
    return `${key.id} ${key.name} ${key.appId} ${(key.knowledgeBase || key.agentKnowledgeBase || []).join(' ')} ${(key.aiSkill || []).join(' ')} ${(key.aiAgent || []).join(' ')}`.toLowerCase().includes(k)
  })
})

const newName = ref('')
const newAppId = ref('')
const newExpires = ref('')
const newKnowledgeBase = ref<string[]>([])
const newAiSkill = ref<string[]>([])
const newAiAgent = ref<string[]>([])

const knowledgeOptions = computed(() => ABILITIES.filter(a => a.domain === 'NLP'))
const skillOptions = computed(() => ABILITIES.filter(a => a.domain === 'MCP' || a.domain === 'LLM'))
const agentOptions = computed(() => ABILITIES.filter(a => a.domain === 'AGENT' || a.id.includes('agent') || a.id.includes('llm-ehs')))

function handleCreate() {
  if (!newName.value.trim()) return
  keysStore.createKey({
    name: newName.value.trim(),
    appId: newAppId.value || undefined,
    expiresAt: newExpires.value ? new Date(newExpires.value).getTime() : null,
    knowledgeBase: newKnowledgeBase.value,
    aiSkill: newAiSkill.value,
    aiAgent: newAiAgent.value,
  })
  newName.value = ''
  newAppId.value = ''
  newExpires.value = ''
  newKnowledgeBase.value = []
  newAiSkill.value = []
  newAiAgent.value = []
  createOpen.value = false
}
</script>

<template>
  <div class="space-y-4">
    <div class="rounded-2xl border border-sky-200/70 bg-white/70 p-6 shadow-[inset_0_0_0_1px_rgba(0,180,255,0.08)]">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 text-sm font-semibold text-slate-900"><KeyRound class="h-4 w-4" /> API 密钥管理</div>
          <div class="mt-1 text-xs text-slate-600">统一从开发者工作台创建密钥；创建时必须选择授权范围：技能 / 知识库 / 智能体。</div>
        </div>
        <button type="button" @click="createOpen = true" class="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#0098FF] to-[#006CFF] px-4 py-2 text-sm font-semibold text-white ring-1 ring-[#00B4FF]/55 transition hover:brightness-105"><Plus class="h-4 w-4" /> 创建密钥</button>
      </div>

      <div class="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div class="relative w-full lg:max-w-[420px]">
          <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input v-model="keyword" placeholder="搜索密钥 / 项目 / 授权能力" class="w-full rounded-xl border border-sky-200/70 bg-white/80 py-2 pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-[#00B4FF]/55" />
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <select v-model="statusFilter" class="rounded-xl border border-sky-200/70 bg-white/80 px-3 py-2 text-sm text-slate-900 outline-none"><option value="all">全部状态</option><option value="enabled">启用</option><option value="disabled">禁用</option></select>
          <button type="button" @click="selectedIds.length && keysStore.deleteKeys(selectedIds)" :disabled="!selectedIds.length" class="inline-flex items-center gap-2 rounded-xl bg-white/70 px-3 py-2 text-xs font-semibold text-slate-900 ring-1 ring-sky-200/70 disabled:opacity-50"><Trash2 class="h-4 w-4" /> 批量删除</button>
        </div>
      </div>
    </div>

    <div class="overflow-hidden rounded-2xl border border-sky-200/70 bg-white/60">
      <div class="overflow-auto">
        <table class="w-full min-w-[1180px] text-left text-sm">
          <thead class="bg-white/70 text-xs text-slate-600">
            <tr>
              <th class="w-10 px-4 py-3"><input type="checkbox" :checked="selectedIds.length > 0 && selectedIds.length === filtered.length" @change="selectedIds = ($event.target as HTMLInputElement).checked ? filtered.map(k => k.id) : []" class="h-4 w-4 accent-[#0098FF]" /></th>
              <th class="px-4 py-3">密钥</th><th class="px-4 py-3">所属项目</th><th class="px-4 py-3">知识库授权</th><th class="px-4 py-3">技能授权</th><th class="px-4 py-3">智能体授权</th><th class="px-4 py-3">状态</th><th class="px-4 py-3">过期时间</th><th class="px-4 py-3">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-sky-200/50">
            <tr v-if="!filtered.length"><td colspan="9" class="px-6 py-10 text-center text-sm text-slate-600">暂无密钥</td></tr>
            <tr v-for="key in filtered" :key="key.id" class="bg-white/40">
              <td class="px-4 py-3"><input type="checkbox" :checked="selectedIds.includes(key.id)" @change="selectedIds = selectedIds.includes(key.id) ? selectedIds.filter(x => x !== key.id) : [...selectedIds, key.id]" class="h-4 w-4 accent-[#0098FF]" /></td>
              <td class="px-4 py-3">
                <div class="min-w-0">
                  <div class="truncate font-semibold text-slate-900">{{ key.name }}</div>
                  <div class="mt-1 flex items-center gap-2 text-[11px] text-slate-600"><code>{{ revealedIds.has(key.id) ? key.keyValue : maskKey(key.keyValue) }}</code><button @click="toggleReveal(key.id)" class="text-slate-500 hover:text-slate-700"><component :is="revealedIds.has(key.id) ? EyeOff : Eye" class="h-3.5 w-3.5" /></button></div>
                </div>
              </td>
              <td class="px-4 py-3 text-xs text-slate-600">{{ appsStore.apps.find(a => a.id === key.appId)?.name || key.appId || '-' }}</td>
              <td class="px-4 py-3"><div class="flex flex-wrap gap-1"><span v-for="id in (key.knowledgeBase || key.agentKnowledgeBase || [])" :key="id" class="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] text-emerald-700 ring-1 ring-emerald-200">{{ abilityName(id) }}</span><span v-if="!(key.knowledgeBase || key.agentKnowledgeBase || []).length" class="text-xs text-slate-600">-</span></div></td>
              <td class="px-4 py-3"><div class="flex flex-wrap gap-1"><span v-for="id in (key.aiSkill || [])" :key="id" class="rounded-full bg-sky-50 px-2 py-0.5 text-[11px] text-sky-700 ring-1 ring-sky-200">{{ abilityName(id) }}</span><span v-if="(key.aiSkill || []).length === 0" class="text-xs text-slate-600">-</span></div></td>
              <td class="px-4 py-3"><div class="flex flex-wrap gap-1"><span v-for="id in (key.aiAgent || [])" :key="id" class="rounded-full bg-violet-50 px-2 py-0.5 text-[11px] text-violet-700 ring-1 ring-violet-200">{{ abilityName(id) }}</span><span v-if="(key.aiAgent || []).length === 0" class="text-xs text-slate-600">-</span></div></td>
              <td class="px-4 py-3"><span class="rounded-full bg-[#00B4FF]/12 px-2 py-0.5 text-[11px] text-slate-700 ring-1 ring-[#00B4FF]/25">{{ key.status === 'enabled' ? '启用' : '禁用' }}</span></td>
              <td class="px-4 py-3 text-xs text-slate-600">{{ key.expiresAt ? formatDate(key.expiresAt) : '永不过期' }}</td>
              <td class="px-4 py-3"><div class="flex items-center gap-2"><button @click="keysStore.updateKey({ id: key.id, status: key.status === 'enabled' ? 'disabled' : 'enabled' })" class="rounded-xl bg-white/70 px-3 py-1.5 text-xs font-semibold text-slate-900 ring-1 ring-sky-200/70">{{ key.status === 'enabled' ? '禁用' : '启用' }}</button><button @click="keysStore.deleteKeys([key.id])" class="rounded-xl bg-white/70 px-3 py-1.5 text-xs font-semibold text-slate-900 ring-1 ring-sky-200/70">删除</button></div></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <Teleport to="body">
    <div v-if="createOpen" class="fixed inset-0 z-[320] h-[100dvh] min-h-[100dvh] overflow-y-auto bg-blue-950/25 p-4 backdrop-blur-sm" @mousedown.self="createOpen = false">
      <div class="mx-auto w-full max-w-[720px] rounded-2xl border border-sky-200/60 bg-white/95 p-5 shadow-2xl">
        <div class="flex items-start justify-between gap-3"><div><div class="text-base font-semibold text-slate-900">创建 API 密钥</div><div class="mt-1 text-xs text-slate-600">密钥不再从单个技能详情页获取，统一在这里创建并选择授权范围。</div></div><button @click="createOpen = false" class="rounded-xl bg-white/70 p-2 text-slate-700 ring-1 ring-sky-200/70"><X class="h-4 w-4" /></button></div>
        <div class="mt-4 space-y-4">
          <div class="grid gap-3 md:grid-cols-2"><label class="text-xs font-semibold text-slate-700">密钥名称<input v-model="newName" placeholder="例如：生产环境密钥" class="mt-1 w-full rounded-xl border border-sky-200/70 bg-white/80 px-3 py-2 text-sm font-normal text-slate-900 outline-none" /></label><label class="text-xs font-semibold text-slate-700">所属项目<select v-model="newAppId" class="mt-1 w-full rounded-xl border border-sky-200/70 bg-white/80 px-3 py-2 text-sm font-normal text-slate-900 outline-none"><option value="">不关联</option><option v-for="app in appsStore.apps" :key="app.id" :value="app.id">{{ app.name }}</option></select></label></div>
          <div><div class="text-xs font-semibold text-slate-700">选择知识库</div><div class="mt-2 grid gap-2 sm:grid-cols-2"><label v-for="ability in knowledgeOptions" :key="ability.id" class="flex items-center gap-2 rounded-xl border border-sky-200/70 bg-white/80 px-3 py-2 text-sm text-slate-900"><input type="checkbox" :value="ability.id" v-model="newKnowledgeBase" class="h-4 w-4 accent-[#0098FF]" />{{ ability.name }}</label></div></div>
          <div><div class="text-xs font-semibold text-slate-700">选择 AI 技能</div><div class="mt-2 grid gap-2 sm:grid-cols-2"><label v-for="ability in skillOptions" :key="ability.id" class="flex items-center gap-2 rounded-xl border border-sky-200/70 bg-white/80 px-3 py-2 text-sm text-slate-900"><input type="checkbox" :value="ability.id" v-model="newAiSkill" class="h-4 w-4 accent-[#0098FF]" />{{ ability.name }}</label></div></div>
          <div><div class="text-xs font-semibold text-slate-700">选择 AI 智能体</div><div class="mt-2 grid gap-2 sm:grid-cols-2"><label v-for="ability in agentOptions" :key="ability.id" class="flex items-center gap-2 rounded-xl border border-sky-200/70 bg-white/80 px-3 py-2 text-sm text-slate-900"><input type="checkbox" :value="ability.id" v-model="newAiAgent" class="h-4 w-4 accent-[#0098FF]" />{{ ability.name }}</label></div></div>
          <label class="block text-xs font-semibold text-slate-700">过期时间（可选）<input v-model="newExpires" type="date" class="mt-1 w-full rounded-xl border border-sky-200/70 bg-white/80 px-3 py-2 text-sm font-normal text-slate-900 outline-none" /></label>
        </div>
        <div class="mt-5 flex justify-end gap-2"><button @click="createOpen = false" class="rounded-xl bg-white/70 px-4 py-2 text-sm font-semibold text-slate-900 ring-1 ring-sky-200/70">取消</button><button @click="handleCreate" :disabled="!newName.trim() || (!newKnowledgeBase.length && !newAiSkill.length && !newAiAgent.length)" class="rounded-xl bg-gradient-to-r from-[#0098FF] to-[#006CFF] px-4 py-2 text-sm font-semibold text-white ring-1 ring-[#00B4FF]/55 disabled:opacity-50">创建</button></div>
      </div>
    </div>
    </Teleport>
  </div>
</template>
