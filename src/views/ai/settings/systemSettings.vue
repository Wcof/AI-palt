<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { Bot, BookOpen, CheckCircle2, Database, Eye, FileText, Image, MessageSquare, Pencil, Plus, Settings2, Trash2, UploadCloud } from 'lucide-vue-next'
import { useSystemStore, type Prompt } from '@/stores/system'
import { useReportStore } from '@/stores/report'
import type { ReportConfig, ReportTemplate } from '@/types/aiPlatform'
import AiMcpManagement from '@/views/ai/settings/aiMcp/index.vue'
import AiKnowledgeBaseList from '@/views/ai/settings/aiknowledge/AiKnowledgeBaseList.vue'
import AIAgentList from '@/views/ai/settings/aiAgent/AiAgentList.vue'
import Nl2sqlSettingsPanel from '@/views/ai/settings/nl2sql/Nl2sqlSettingsPanel.vue'

defineOptions({ name: 'SystemSettings' })

type TabKey = 'system-config' | 'skill-manage' | 'knowledge-manage' | 'agent-manage' | 'nl2sql' | 'report-template' | 'report-config'
type PromptStatus = 'enabled' | 'disabled'
type PromptForm = Prompt & { scene: string; status: PromptStatus; sort: number; updatedAt: string }

const systemStore = useSystemStore()
const reportStore = useReportStore()
const { systemName, tabTitle, tabIcon, logoUrl, prompts } = storeToRefs(systemStore)
const { templates, configs } = storeToRefs(reportStore)

const activeTab = ref<TabKey>('system-config')
const logoInputRef = ref<HTMLInputElement | null>(null)
const iconInputRef = ref<HTMLInputElement | null>(null)

const tabs = [
  { key: 'system-config', label: '系统配置', desc: '品牌 / 推荐问题', icon: Settings2 },
  { key: 'skill-manage', label: 'AI 技能管理', desc: 'MCP / Skills CRUD', icon: FileText },
  { key: 'knowledge-manage', label: '知识库管理', desc: '新建与维护', icon: BookOpen },
  { key: 'agent-manage', label: '智能体管理', desc: '仅上下架', icon: Bot },
  { key: 'nl2sql', label: 'NL2SQL 配置', desc: '案例 / 术语 / 数据源', icon: Database },
  { key: 'report-template', label: '报告模板', desc: '模板结构', icon: FileText },
  { key: 'report-config', label: '内容配置', desc: '段落规则', icon: FileText },
] as const

function nowText() {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}

function readAsDataUrl(file: File, onDone: (url: string) => void) {
  const reader = new FileReader()
  reader.onload = () => onDone(String(reader.result || ''))
  reader.readAsDataURL(file)
}

function onLogoChange(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0]
  if (f) readAsDataUrl(f, (url) => { logoUrl.value = url })
}

function onIconChange(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0]
  if (f) readAsDataUrl(f, (url) => { tabIcon.value = url })
}

const emptyPromptForm = (): PromptForm => ({
  id: '',
  title: '',
  description: '',
  text: '',
  icon: 'MessageSquare',
  scene: '首页推荐',
  status: 'enabled',
  sort: (prompts.value.length + 1) * 10,
  updatedAt: '',
})

const promptModalOpen = ref(false)
const promptModalMode = ref<'create' | 'edit' | 'view'>('create')
const promptForm = ref<PromptForm>(emptyPromptForm())
const promptKeyword = ref('')

const sortedPrompts = computed(() => {
  const k = promptKeyword.value.trim().toLowerCase()
  return [...prompts.value]
    .filter(item => !k || `${item.title} ${item.description} ${item.text} ${item.scene || ''}`.toLowerCase().includes(k))
    .sort((a, b) => (a.sort || 999) - (b.sort || 999))
})

function openPromptCreate() {
  promptModalMode.value = 'create'
  promptForm.value = emptyPromptForm()
  promptModalOpen.value = true
}

function openPromptEdit(item: Prompt) {
  promptModalMode.value = 'edit'
  promptForm.value = {
    id: item.id,
    title: item.title,
    description: item.description,
    text: item.text,
    icon: item.icon || 'MessageSquare',
    scene: item.scene || '首页推荐',
    status: (item.status || 'enabled') as PromptStatus,
    sort: item.sort || 10,
    updatedAt: item.updatedAt || '',
  }
  promptModalOpen.value = true
}

function openPromptView(item: Prompt) {
  openPromptEdit(item)
  promptModalMode.value = 'view'
}

function closePromptModal() {
  promptModalOpen.value = false
}

function savePrompt() {
  if (promptModalMode.value === 'view') return
  if (!promptForm.value.title.trim() || !promptForm.value.text.trim()) return
  const item: Prompt = {
    ...promptForm.value,
    id: promptForm.value.id || `prompt-${Date.now()}`,
    title: promptForm.value.title.trim(),
    description: promptForm.value.description.trim() || '用于推荐问题展示',
    text: promptForm.value.text.trim(),
    updatedAt: nowText(),
  }
  const idx = prompts.value.findIndex(p => p.id === item.id)
  if (idx === -1) prompts.value.unshift(item)
  else prompts.value.splice(idx, 1, item)
  closePromptModal()
}

function deletePrompt(id: string) {
  if (!window.confirm('确认删除该推荐问题吗？')) return
  prompts.value = prompts.value.filter(p => p.id !== id)
}

function togglePrompt(item: Prompt) {
  item.status = item.status === 'disabled' ? 'enabled' : 'disabled'
  item.updatedAt = nowText()
}

const templateForm = ref<ReportTemplate>({ id: '', name: '', scene: '', enabled: true, updatedAt: '', content: '' })
const templateEditingId = ref('')
function saveTemplate() {
  if (!templateForm.value.name.trim()) return
  const item = { ...templateForm.value, id: templateEditingId.value || `tpl-${Date.now()}`, updatedAt: nowText() }
  const idx = templates.value.findIndex(x => x.id === item.id)
  idx === -1 ? templates.value.unshift(item) : templates.value.splice(idx, 1, item)
  templateForm.value = { id: '', name: '', scene: '', enabled: true, updatedAt: '', content: '' }
  templateEditingId.value = ''
}
function editTemplate(item: ReportTemplate) {
  templateEditingId.value = item.id
  templateForm.value = { ...item }
}
function deleteTemplate(id: string) {
  templates.value = templates.value.filter(x => x.id !== id)
}

const configForm = ref<ReportConfig>({ id: '', section: '', prompt: '', enabled: true, version: 'v1', updatedAt: '' })
const configEditingId = ref('')
function saveConfig() {
  if (!configForm.value.section.trim()) return
  const item = { ...configForm.value, id: configEditingId.value || `cfg-${Date.now()}`, updatedAt: nowText() }
  const idx = configs.value.findIndex(x => x.id === item.id)
  idx === -1 ? configs.value.unshift(item) : configs.value.splice(idx, 1, item)
  configForm.value = { id: '', section: '', prompt: '', enabled: true, version: 'v1', updatedAt: '' }
  configEditingId.value = ''
}
function editConfig(item: ReportConfig) {
  configEditingId.value = item.id
  configForm.value = { ...item }
}
function deleteConfig(id: string) {
  configs.value = configs.value.filter(x => x.id !== id)
}

const sectionTitle = computed(() => tabs.find(t => t.key === activeTab.value)?.label || '系统设置')
const sectionDesc = computed(() => tabs.find(t => t.key === activeTab.value)?.desc || '集中设置')
</script>

<template>
  <div class="flex h-full min-h-[620px] overflow-hidden bg-white">
    <aside class="hidden w-[252px] shrink-0 border-r border-slate-200/80 bg-sky-50/60 p-3 md:block">
      <div class="px-2 pb-3 pt-1">
        <div class="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-500">Settings</div>
        <div class="mt-1 text-sm font-semibold text-slate-950">系统设置</div>
        <div class="mt-1 text-xs leading-5 text-slate-500">Banner 管理已移除，配置项集中维护。</div>
      </div>
      <nav class="space-y-1">
        <button v-for="t in tabs" :key="t.key" type="button" :class="['flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition', activeTab === t.key ? 'bg-white text-slate-950 shadow-sm ring-1 ring-sky-200' : 'text-slate-700 hover:bg-white hover:text-slate-950']" @click="activeTab = t.key as TabKey">
          <component :is="t.icon" class="h-4 w-4 shrink-0 text-sky-600" />
          <span class="min-w-0">
            <span class="block truncate text-sm font-medium">{{ t.label }}</span>
            <span class="block truncate text-[11px] text-slate-500">{{ t.desc }}</span>
          </span>
        </button>
      </nav>
    </aside>

    <main class="min-w-0 flex-1 overflow-y-auto bg-gradient-to-br from-white via-sky-50/30 to-blue-50/40 p-4 sm:p-6">
      <div class="mx-auto max-w-[1120px]">
        <header class="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <div class="text-xl font-semibold text-slate-950">{{ sectionTitle }}</div>
            <div class="mt-1 text-sm text-slate-500">{{ sectionDesc }}</div>
          </div>
          <div class="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
            <CheckCircle2 class="h-3.5 w-3.5" /> 本地持久化 / Mock 演示
          </div>
        </header>

        <div class="mb-4 flex gap-2 overflow-x-auto pb-1 md:hidden">
          <button v-for="t in tabs" :key="t.key" type="button" :class="['shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition', activeTab === t.key ? 'bg-blue-600 text-white ring-blue-200' : 'bg-white text-slate-600 ring-slate-200']" @click="activeTab = t.key as TabKey">{{ t.label }}</button>
        </div>

        <section v-if="activeTab === 'system-config'" class="space-y-5">
          <div class="rounded-3xl border border-sky-200/80 bg-white/90 p-5 shadow-[0_16px_44px_rgba(14,116,144,0.08)]">
            <div class="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900"><Image class="h-4 w-4 text-sky-600" /> 品牌配置</div>
            <div class="grid gap-4 md:grid-cols-2">
              <label class="text-xs font-semibold text-slate-700">系统名称<input v-model="systemName" class="mt-1 w-full rounded-xl border border-sky-200 bg-white px-3 py-2 text-sm font-normal text-slate-900 outline-none focus:border-sky-400" /></label>
              <label class="text-xs font-semibold text-slate-700">页签抬头<input v-model="tabTitle" class="mt-1 w-full rounded-xl border border-sky-200 bg-white px-3 py-2 text-sm font-normal text-slate-900 outline-none focus:border-sky-400" /></label>
              <label class="text-xs font-semibold text-slate-700">页签 Icon URL<input v-model="tabIcon" class="mt-1 w-full rounded-xl border border-sky-200 bg-white px-3 py-2 text-sm font-normal text-slate-900 outline-none focus:border-sky-400" /></label>
              <label class="text-xs font-semibold text-slate-700">项目 Logo URL<input v-model="logoUrl" class="mt-1 w-full rounded-xl border border-sky-200 bg-white px-3 py-2 text-sm font-normal text-slate-900 outline-none focus:border-sky-400" /></label>
              <div class="flex flex-wrap gap-2 md:col-span-2">
                <input ref="iconInputRef" type="file" accept="image/*" class="hidden" @change="onIconChange" />
                <input ref="logoInputRef" type="file" accept="image/*" class="hidden" @change="onLogoChange" />
                <button type="button" @click="iconInputRef?.click()" class="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm"><UploadCloud class="h-4 w-4" /> 上传 Icon</button>
                <button type="button" @click="logoInputRef?.click()" class="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-slate-700 ring-1 ring-sky-200"><UploadCloud class="h-4 w-4" /> 上传 Logo</button>
              </div>
            </div>
          </div>

          <div class="rounded-3xl border border-sky-200/80 bg-white/90 p-5 shadow-[0_16px_44px_rgba(14,116,144,0.08)]">
            <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div class="flex items-center gap-2 text-sm font-semibold text-slate-900"><MessageSquare class="h-4 w-4 text-sky-600" /> 推荐问题管理</div>
                <div class="mt-1 text-xs text-slate-500">交互已调整为 NL2SQL 配置同类模式：列表管理 + 弹窗新增 / 编辑 / 查看。</div>
              </div>
              <button type="button" class="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-2 text-sm font-semibold text-white" @click="openPromptCreate"><Plus class="h-4 w-4" /> 新增推荐问题</button>
            </div>

            <div class="mb-3">
              <input v-model="promptKeyword" placeholder="搜索推荐问题标题、场景或问题内容" class="w-full rounded-xl border border-sky-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-400" />
            </div>

            <div class="overflow-hidden rounded-2xl border border-sky-100 bg-white">
              <table class="w-full text-left text-sm">
                <thead class="bg-sky-50 text-xs text-slate-500">
                  <tr>
                    <th class="px-4 py-3">标题</th>
                    <th class="px-4 py-3">场景</th>
                    <th class="px-4 py-3">排序</th>
                    <th class="px-4 py-3">状态</th>
                    <th class="px-4 py-3">更新时间</th>
                    <th class="px-4 py-3 text-right">操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="p in sortedPrompts" :key="p.id" class="border-t border-sky-50">
                    <td class="px-4 py-3">
                      <div class="font-semibold text-slate-900">{{ p.title }}</div>
                      <div class="mt-1 max-w-[420px] truncate text-xs text-slate-500">{{ p.text }}</div>
                    </td>
                    <td class="px-4 py-3 text-xs text-slate-600">{{ p.scene || '首页推荐' }}</td>
                    <td class="px-4 py-3 text-xs text-slate-600">{{ p.sort || '-' }}</td>
                    <td class="px-4 py-3">
                      <button type="button" :class="['rounded-full px-2.5 py-1 text-xs font-semibold', p.status === 'disabled' ? 'bg-slate-100 text-slate-500' : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100']" @click="togglePrompt(p)">
                        {{ p.status === 'disabled' ? '停用' : '启用' }}
                      </button>
                    </td>
                    <td class="px-4 py-3 text-xs text-slate-500">{{ p.updatedAt || '-' }}</td>
                    <td class="px-4 py-3">
                      <div class="flex justify-end gap-2">
                        <button type="button" class="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1.5 text-xs font-semibold text-blue-700 ring-1 ring-blue-100" @click="openPromptView(p)"><Eye class="h-3.5 w-3.5" /> 查看</button>
                        <button type="button" class="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200" @click="openPromptEdit(p)"><Pencil class="h-3.5 w-3.5" /> 编辑</button>
                        <button type="button" class="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-700 ring-1 ring-rose-100" @click="deletePrompt(p.id)"><Trash2 class="h-3.5 w-3.5" /> 删除</button>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="!sortedPrompts.length">
                    <td colspan="6" class="px-4 py-10 text-center text-sm text-slate-500">暂无推荐问题</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section v-if="activeTab === 'skill-manage'" class="rounded-3xl border border-sky-200 bg-white/90 p-5 shadow-sm"><AiMcpManagement /></section>
        <section v-if="activeTab === 'knowledge-manage'" class="rounded-3xl border border-sky-200 bg-white/90 p-5 shadow-sm"><AiKnowledgeBaseList /></section>
        <section v-if="activeTab === 'agent-manage'" class="rounded-3xl border border-sky-200 bg-white/90 p-5 shadow-sm"><AIAgentList /></section>
        <section v-if="activeTab === 'nl2sql'"><Nl2sqlSettingsPanel /></section>

        <section v-if="activeTab === 'report-template'" class="space-y-4">
          <div class="rounded-3xl border border-sky-200 bg-white/90 p-5 shadow-sm">
            <div class="mb-4 text-sm font-semibold text-slate-900">模板管理 CRUD</div>
            <div class="grid gap-3 md:grid-cols-2">
              <input v-model="templateForm.name" placeholder="模板名称" class="rounded-xl border border-sky-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-400" />
              <input v-model="templateForm.scene" placeholder="适用场景" class="rounded-xl border border-sky-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-400" />
              <textarea v-model="templateForm.content" rows="6" placeholder="模板 Markdown" class="rounded-xl border border-blue-100 bg-blue-50/80 px-3 py-2 font-mono text-xs text-blue-950 outline-none focus:border-blue-300 md:col-span-2" />
            </div>
            <button type="button" @click="saveTemplate" class="mt-4 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-2 text-sm font-semibold text-white">{{ templateEditingId ? '保存修改' : '新增模板' }}</button>
          </div>
          <div class="grid gap-3 md:grid-cols-2">
            <div v-for="item in templates" :key="item.id" class="rounded-3xl border border-sky-200 bg-white p-4 shadow-sm">
              <div class="text-sm font-semibold text-slate-900">{{ item.name }}</div>
              <div class="mt-1 text-xs text-slate-600">{{ item.scene }}</div>
              <pre class="mt-3 max-h-28 overflow-auto rounded-xl bg-blue-50 p-3 text-xs text-blue-950">{{ item.content }}</pre>
              <div class="mt-3 flex gap-2"><button type="button" @click="editTemplate(item)" class="text-xs font-semibold text-blue-700">编辑</button><button type="button" @click="deleteTemplate(item.id)" class="text-xs font-semibold text-rose-700">删除</button></div>
            </div>
          </div>
        </section>

        <section v-if="activeTab === 'report-config'" class="space-y-4">
          <div class="rounded-3xl border border-sky-200 bg-white/90 p-5 shadow-sm">
            <div class="mb-4 text-sm font-semibold text-slate-900">内容配置 CRUD</div>
            <div class="grid gap-3 md:grid-cols-[220px_1fr_120px]">
              <input v-model="configForm.section" placeholder="段落名称" class="rounded-xl border border-sky-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-400" />
              <input v-model="configForm.prompt" placeholder="段落生成提示词 / 内容规则" class="rounded-xl border border-sky-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-400" />
              <input v-model="configForm.version" placeholder="版本" class="rounded-xl border border-sky-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-400" />
            </div>
            <button type="button" @click="saveConfig" class="mt-4 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-2 text-sm font-semibold text-white">{{ configEditingId ? '保存修改' : '新增配置' }}</button>
          </div>
          <div class="grid gap-3 md:grid-cols-2">
            <div v-for="item in configs" :key="item.id" class="rounded-3xl border border-sky-200 bg-white p-4 shadow-sm">
              <div class="text-sm font-semibold text-slate-900">{{ item.section }} <span class="ml-2 text-xs text-slate-500">{{ item.version }}</span></div>
              <div class="mt-2 text-xs leading-5 text-slate-600">{{ item.prompt }}</div>
              <div class="mt-3 flex gap-2"><button type="button" @click="editConfig(item)" class="text-xs font-semibold text-blue-700">编辑</button><button type="button" @click="deleteConfig(item.id)" class="text-xs font-semibold text-rose-700">删除</button></div>
            </div>
          </div>
        </section>
      </div>
    </main>

    <div v-if="promptModalOpen" class="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-sm">
      <div class="w-full max-w-2xl rounded-[28px] bg-white p-5 shadow-[0_28px_90px_rgba(15,23,42,0.24)]">
        <div class="mb-4 flex items-center justify-between gap-3">
          <div>
            <div class="text-lg font-semibold text-slate-950">{{ promptModalMode === 'create' ? '新增推荐问题' : promptModalMode === 'edit' ? '编辑推荐问题' : '查看推荐问题' }}</div>
            <div class="mt-1 text-xs text-slate-500">推荐问题用于首页、AI 应用欢迎页与智能问数快捷入口。</div>
          </div>
          <button type="button" class="rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600" @click="closePromptModal">关闭</button>
        </div>

        <div class="grid gap-3 md:grid-cols-2">
          <label class="text-xs font-semibold text-slate-700">问题标题<input v-model="promptForm.title" :disabled="promptModalMode === 'view'" class="mt-1 w-full rounded-xl border border-sky-200 px-3 py-2 text-sm outline-none disabled:bg-slate-50" /></label>
          <label class="text-xs font-semibold text-slate-700">所属场景<input v-model="promptForm.scene" :disabled="promptModalMode === 'view'" class="mt-1 w-full rounded-xl border border-sky-200 px-3 py-2 text-sm outline-none disabled:bg-slate-50" /></label>
          <label class="text-xs font-semibold text-slate-700">排序<input v-model.number="promptForm.sort" type="number" :disabled="promptModalMode === 'view'" class="mt-1 w-full rounded-xl border border-sky-200 px-3 py-2 text-sm outline-none disabled:bg-slate-50" /></label>
          <label class="text-xs font-semibold text-slate-700">状态<select v-model="promptForm.status" :disabled="promptModalMode === 'view'" class="mt-1 w-full rounded-xl border border-sky-200 px-3 py-2 text-sm outline-none disabled:bg-slate-50"><option value="enabled">启用</option><option value="disabled">停用</option></select></label>
          <label class="text-xs font-semibold text-slate-700 md:col-span-2">描述<textarea v-model="promptForm.description" rows="2" :disabled="promptModalMode === 'view'" class="mt-1 w-full rounded-xl border border-sky-200 px-3 py-2 text-sm outline-none disabled:bg-slate-50" /></label>
          <label class="text-xs font-semibold text-slate-700 md:col-span-2">问题内容<textarea v-model="promptForm.text" rows="4" :disabled="promptModalMode === 'view'" class="mt-1 w-full rounded-xl border border-sky-200 px-3 py-2 text-sm outline-none disabled:bg-slate-50" /></label>
        </div>

        <div v-if="promptModalMode !== 'view'" class="mt-5 flex justify-end gap-2">
          <button type="button" class="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200" @click="closePromptModal">取消</button>
          <button type="button" class="rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-2 text-sm font-semibold text-white" @click="savePrompt">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>
