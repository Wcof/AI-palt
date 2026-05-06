<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Bot,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Command,
  Database,
  FileText,
  KeyRound,
  Layers,
  MessageSquare,
  MessageSquarePlus,
  MoreHorizontal,
  Search,
  ShieldAlert,
  Sparkles,
  Trash2,
  X,
} from 'lucide-vue-next'
import type { AgentType, Conversation } from '@/stores/aiApp'
import { useSystemStore } from '@/stores/system'
import UserAccountMenu from '@/components/auth/UserAccountMenu.vue'

const props = defineProps<{
  conversations: Conversation[]
  activeId: string | null
  streamingId: string | null
  collapsed?: boolean
  hideHeader?: boolean
  hideNewButton?: boolean
}>()

const emit = defineEmits<{
  (e: 'create'): void
  (e: 'select', id: string): void
  (e: 'delete', id: string): void
  (e: 'toggle-collapse'): void
  (e: 'select-agent-app', payload: { agentType: AgentType; name: string }): void
}>()

const router = useRouter()
const route = useRoute()
const systemStore = useSystemStore()
const keyword = ref('')
const showSearch = ref(false)
const showMore = ref(false)
const showAppPanel = ref(false)
const activeAppPanelAnchor = ref<HTMLElement | null>(null)
const moreButtonRef = ref<HTMLElement | null>(null)
const moreMenuStyle = ref<Record<string, string>>({})
const appPanelStyle = ref<Record<string, string>>({})

type SidebarCategoryId = 'smartQa' | 'hazardView' | 'smartDoc'

const activeSidebarCategory = ref<SidebarCategoryId>('smartQa')

const sidebarCategories = [
  { id: 'smartQa', label: '智能问答', desc: '问答、知识库、智能问数统一入口', icon: MessageSquare },
  { id: 'hazardView', label: '隐患视图', desc: '隐患识别、隐患分析与现场图片理解', icon: ShieldAlert },
  { id: 'smartDoc', label: '智能文书', desc: '报告、会议纪要、文档编写', icon: FileText },
] as const

type SidebarCategory = typeof sidebarCategories[number]

type AgentApplication = {
  id: string
  name: string
  desc: string
  category: SidebarCategoryId
  agentType: AgentType
  icon: any
  order: number
}

const agentApplications: AgentApplication[] = [
  { id: 'hazard-view', name: '隐患视图', desc: '面向现场图片和风险点位展示隐患识别结果', category: 'smartQa', agentType: 'hazard', icon: ShieldAlert, order: 1 },
  { id: 'smart-answer', name: '智能问答', desc: '安全生产制度、场景、案例和方案问答', category: 'smartQa', agentType: 'general', icon: MessageSquare, order: 2 },
  { id: 'smart-query', name: '智能问数', desc: '自然语言查询指标、SQL 和基础图表', category: 'smartQa', agentType: 'nl2sql', icon: Database, order: 3 },
  { id: 'knowledge-qa', name: '知识库问答', desc: '从知识库检索依据并生成可解释回答', category: 'smartQa', agentType: 'rag', icon: BookOpen, order: 4 },

  { id: 'hazard-vision', name: '隐患识图', desc: '上传现场图片识别隐患并给出整改建议', category: 'hazardView', agentType: 'hazard', icon: ShieldAlert, order: 1 },
  { id: 'safety-agent', name: '安全生产智能体', desc: '安全生产场景下的风险识别与处置建议', category: 'hazardView', agentType: 'general', icon: Sparkles, order: 2 },
  { id: 'chemical-production-assistant', name: '化工生产助手', desc: '围绕装置、工艺、作业现场进行辅助分析', category: 'hazardView', agentType: 'rag', icon: Layers, order: 3 },

  { id: 'data-report', name: '安全生产文书', desc: '生成安全生产场景下的标准文书与报告', category: 'smartDoc', agentType: 'report', icon: FileText, order: 1 },
  { id: 'meeting-minutes', name: '会议纪要', desc: '录音转写并生成摘要、纪要、待办和原文', category: 'smartDoc', agentType: 'meeting', icon: MessageSquare, order: 2 },
  { id: 'document-writing', name: '文档编写', desc: '根据需求生成摘要、正文预览和文档块', category: 'smartDoc', agentType: 'document', icon: FileText, order: 3 },
  { id: 'production-doc', name: '生产制造文书', desc: '围绕生产制造过程生成记录、说明与汇报', category: 'smartDoc', agentType: 'document', icon: FileText, order: 4 },
]

const resourceLinks = [
  { id: 'agents', label: 'AI 智能体', desc: '进入智能体在线体验与应用中心', icon: Bot, action: () => router.push('/agents') },
  { id: 'mcp', label: 'AI 技能', desc: '查看 MCP 技能与工具能力', icon: Sparkles, action: () => router.push('/mcp') },
  { id: 'knowledge', label: 'AI 知识库', desc: '管理知识问答与知识库应用', icon: BookOpen, action: () => router.push('/knowledge') },
  { id: 'workbench', label: '开发者工作台', desc: 'API 密钥、订阅与统计管理', icon: KeyRound, action: () => router.push('/workbench/keys') },
]

const sortedConversations = computed(() => [...props.conversations].sort((a, b) => (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt)))
const filteredConversations = computed(() => {
  const k = keyword.value.trim().toLowerCase()
  if (!k) return sortedConversations.value
  return sortedConversations.value.filter(c => `${c.title} ${agentLabel(c.agentType)} ${c.agentType || ''}`.toLowerCase().includes(k))
})
const empty = computed(() => filteredConversations.value.length === 0)

const primaryNav = computed(() => [
  ...(!props.hideNewButton ? [{ id: 'new', label: '新会话', icon: MessageSquarePlus, action: () => emit('create') }] : []),
  { id: 'search', label: '搜索会话', icon: Search, action: () => { showSearch.value = !showSearch.value } },
])

const categoryNav = computed(() => sidebarCategories.map(category => ({
  id: category.id,
  label: category.label,
  desc: category.desc,
  icon: category.icon,
})))

const currentCategory = computed<SidebarCategory>(() => sidebarCategories.find(item => item.id === activeSidebarCategory.value) || sidebarCategories[0])
const currentCategoryApps = computed(() => agentApplications
  .filter(app => app.category === activeSidebarCategory.value)
  .sort((a, b) => a.order - b.order))

const collapsedNav = computed(() => [
  ...primaryNav.value,
  ...categoryNav.value,
])

function isResourceActive(id: string) {
  if (id === 'agents') return route.path.startsWith('/agents') || route.path.startsWith('/experience/agent')
  if (id === 'mcp') return route.path.startsWith('/mcp') || route.path.startsWith('/skill') || route.path.startsWith('/experience/mcp')
  if (id === 'knowledge') return route.path.startsWith('/knowledge')
  if (id === 'workbench') return route.path.startsWith('/workbench')
  return false
}

function isSidebarCategoryId(id: string): id is SidebarCategoryId {
  return id === 'smartQa' || id === 'hazardView' || id === 'smartDoc'
}

function isCategoryActive(id: string) {
  return activeSidebarCategory.value === id
}

function handleCollapsedNavClick(item: { id: string; action?: () => void }, event: MouseEvent) {
  if (isSidebarCategoryId(item.id)) {
    openCategoryPanel(item.id, event)
    return
  }
  item.action?.()
}

function formatRelative(ts: number) {
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return '刚刚'
  if (mins < 60) return `${mins} 分钟前`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} 小时前`
  const days = Math.floor(hours / 24)
  return `${days} 天前`
}

function agentLabel(agent?: string) {
  const map: Record<string, string> = {
    general: '智能问答',
    nl2sql: '智能问数',
    report: '安全生产文书',
    meeting: '会议纪要',
    document: '文档编写',
    hazard: '隐患视图',
    rag: '知识库问答',
  }
  return map[agent || 'general'] || '智能问答'
}

function getRootRem() {
  if (typeof window === 'undefined') return 16
  const parsed = Number.parseFloat(window.getComputedStyle(document.documentElement).fontSize)
  return Number.isFinite(parsed) ? parsed : 16
}

function syncMoreMenuPosition() {
  if (typeof window === 'undefined') return
  const rect = moreButtonRef.value?.getBoundingClientRect()
  if (!rect) return

  const rem = getRootRem()
  const gap = 0.75 * rem
  const sideSafe = 0.75 * rem
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  const desiredWidth = 27 * rem
  const width = Math.min(desiredWidth, viewportWidth - sideSafe * 2)
  const enoughRightSpace = viewportWidth - rect.right - gap - sideSafe >= width
  const left = enoughRightSpace ? rect.right + gap : Math.max(sideSafe, viewportWidth - width - sideSafe)
  const estimatedHeight = 22 * rem
  const top = Math.max(sideSafe, Math.min(rect.top - 4 * rem, viewportHeight - estimatedHeight - sideSafe))

  moreMenuStyle.value = {
    left: `${left}px`,
    top: `${top}px`,
    width: `${width}px`,
  }
}

function syncAppPanelPosition() {
  if (typeof window === 'undefined') return
  const rect = activeAppPanelAnchor.value?.getBoundingClientRect()
  if (!rect) return

  const rem = getRootRem()
  const gap = 0.75 * rem
  const sideSafe = 0.75 * rem
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  const desiredWidth = 24 * rem
  const width = Math.min(desiredWidth, viewportWidth - sideSafe * 2)
  const canOpenRight = viewportWidth - rect.right - gap - sideSafe >= width
  const left = canOpenRight ? rect.right + gap : Math.max(sideSafe, viewportWidth - width - sideSafe)
  const estimatedHeight = 26 * rem
  const top = Math.max(sideSafe, Math.min(rect.top - 1.5 * rem, viewportHeight - estimatedHeight - sideSafe))

  appPanelStyle.value = {
    left: `${left}px`,
    top: `${top}px`,
    width: `${width}px`,
    maxHeight: `${Math.min(estimatedHeight, viewportHeight - sideSafe * 2)}px`,
  }
}

function openCategoryPanel(categoryId: SidebarCategoryId, event: MouseEvent) {
  activeSidebarCategory.value = categoryId
  activeAppPanelAnchor.value = event.currentTarget as HTMLElement
  showAppPanel.value = true
  showMore.value = false
  nextTick(syncAppPanelPosition)
}

function closeAppPanel() {
  showAppPanel.value = false
}

function toggleMoreMenu() {
  showMore.value = !showMore.value
  if (showMore.value) {
    showAppPanel.value = false
    nextTick(syncMoreMenuPosition)
  }
}

function handleResourceAction(action: () => void) {
  action()
  showMore.value = false
  showAppPanel.value = false
}

function selectApplication(app: AgentApplication) {
  emit('select-agent-app', { agentType: app.agentType, name: app.name })
  showMore.value = false
  showAppPanel.value = false
}
</script>

<template>
  <aside class="flex h-full w-full flex-col border-r border-white/60 bg-white/60 text-slate-900 backdrop-blur-2xl">
    <div v-if="!hideHeader" class="px-3 pb-2 pt-3">
      <div :class="collapsed ? 'flex flex-col items-center gap-2' : 'flex items-center justify-between gap-2'">
        <button
          type="button"
          :class="['rounded-2xl text-left transition hover:bg-white/70', collapsed ? 'p-2' : 'min-w-0 flex-1 px-2 py-2']"
          @click="router.push('/ai-app')"
        >
          <div class="flex items-center gap-3">
            <span class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-400 text-white shadow-[0_0.75rem_2rem_rgba(37,99,235,0.30)]">
              <MessageSquare class="h-4 w-4" />
            </span>
            <span v-if="!collapsed" class="min-w-0">
              <span class="block truncate text-sm font-semibold text-slate-950">{{ systemStore.displayName || '极客光年安全大模型' }}</span>
              <span class="block truncate text-[0.6875rem] text-slate-500">安全生产智能应用工作台</span>
            </span>
          </div>
        </button>
        <button
          v-if="!hideHeader"
          type="button"
          @click="emit('toggle-collapse')"
          :class="['rounded-lg p-2 text-slate-500 transition hover:bg-white/70 hover:text-slate-900', collapsed && 'bg-white/70 ring-1 ring-white/80']"
          :title="collapsed ? '展开侧栏' : '折叠侧栏'"
        >
          <ChevronLeft v-if="!collapsed" class="h-4 w-4" />
          <ChevronRight v-else class="h-4 w-4" />
        </button>
      </div>
    </div>

    <div v-if="collapsed" class="flex flex-1 flex-col items-center gap-2 px-2 py-3 text-slate-600">
      <button
        v-for="item in collapsedNav"
        :key="item.id"
        type="button"
        :title="item.label"
        :class="[
          'rounded-xl p-2.5 transition hover:bg-white/70 hover:text-slate-950',
          isCategoryActive(item.id) && 'bg-white/90 text-slate-950 shadow-sm ring-1 ring-white/80'
        ]"
        @click="handleCollapsedNavClick(item, $event)"
      >
        <component :is="item.icon" class="h-4 w-4" />
      </button>
      <button
        ref="moreButtonRef"
        type="button"
        title="更多"
        :class="['rounded-xl p-2.5 transition hover:bg-white/70 hover:text-slate-950', showMore && 'bg-white/90 text-blue-800 shadow-sm ring-1 ring-blue-100']"
        @click="toggleMoreMenu"
      >
        <MoreHorizontal class="h-4 w-4" />
      </button>
      <div class="mt-auto w-full px-0.5">
        <UserAccountMenu compact />
      </div>
    </div>

    <template v-else>
      <nav class="relative space-y-1 px-3 pb-2">
        <button
          v-for="item in primaryNav"
          :key="item.id"
          type="button"
          :class="[
            'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition',
            item.id === 'new' ? 'bg-white/90 text-slate-950 shadow-sm ring-1 ring-white/80 hover:bg-slate-50' : 'text-slate-700 hover:bg-white/70 hover:text-slate-950'
          ]"
          @click="item.action"
        >
          <component :is="item.icon" class="h-4 w-4 shrink-0" />
          <span class="truncate font-medium">{{ item.label }}</span>
        </button>

        <div class="pt-1">
          <div class="px-1 pb-1 text-[0.6875rem] font-semibold text-slate-400">AI 应用一级菜单</div>
          <button
            v-for="item in categoryNav"
            :key="item.id"
            type="button"
            :class="[
              'flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition',
              isCategoryActive(item.id) ? 'bg-white/90 text-blue-800 shadow-sm ring-1 ring-blue-100' : 'text-slate-700 hover:bg-white/70 hover:text-slate-950'
            ]"
            @click="openCategoryPanel(item.id, $event)"
          >
            <span class="inline-flex min-w-0 items-center gap-3">
              <component :is="item.icon" class="h-4 w-4 shrink-0 text-blue-600" />
              <span class="truncate font-medium">{{ item.label }}</span>
            </span>
            <ChevronRight :class="['h-4 w-4 shrink-0 transition', isCategoryActive(item.id) && 'rotate-90 text-blue-700']" />
          </button>
        </div>


        <button
          ref="moreButtonRef"
          type="button"
          :class="[
            'flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition',
            showMore ? 'bg-white/90 text-blue-800 shadow-sm ring-1 ring-blue-100' : 'text-slate-700 hover:bg-white/70 hover:text-slate-950'
          ]"
          @click="toggleMoreMenu"
        >
          <span class="inline-flex items-center gap-3">
            <MoreHorizontal class="h-4 w-4 shrink-0" />
            <span class="font-medium">更多</span>
          </span>
          <ChevronRight :class="['h-4 w-4 transition', showMore && 'translate-x-0.5 text-blue-700']" />
        </button>
      </nav>

      <div v-if="showSearch" class="px-3 pb-3">
        <div class="flex items-center gap-2 rounded-xl bg-white px-3 py-2 ring-1 ring-slate-200 focus-within:ring-blue-300">
          <Search class="h-4 w-4 shrink-0 text-slate-400" />
          <input v-model="keyword" autofocus type="search" placeholder="搜索会话标题 / Agent" class="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400" />
        </div>
      </div>

      <div class="px-4 pb-2 pt-2 text-xs font-medium text-slate-500">近期会话</div>
      <div class="min-h-0 flex-1 overflow-auto px-2 pb-3">
        <div v-if="empty" class="mx-2 rounded-2xl bg-white px-3 py-5 text-center text-xs text-slate-500 ring-1 ring-slate-200">
          暂无匹配会话
        </div>
        <div v-else class="space-y-1">
          <div
            v-for="c in filteredConversations"
            :key="c.id"
            :class="[
              'group flex cursor-pointer items-start gap-2 rounded-xl px-2 py-2.5 transition',
              activeId === c.id ? 'bg-white shadow-sm ring-1 ring-blue-100' : 'hover:bg-white/70'
            ]"
            @click="emit('select', c.id)"
          >
            <span class="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-slate-600 ring-1 ring-slate-200">
              <MessageSquare class="h-3.5 w-3.5" />
            </span>
            <div class="min-w-0 flex-1">
              <div class="truncate text-sm font-medium text-slate-900">{{ c.title }}</div>
              <div class="mt-0.5 flex items-center gap-1.5 text-[0.6875rem] text-slate-500">
                <span class="truncate">{{ agentLabel(c.agentType) }}</span>
                <span>·</span>
                <span>{{ formatRelative(c.updatedAt || c.createdAt) }}</span>
                <span v-if="streamingId === c.id" class="ml-1 inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </div>
            </div>
            <button
              type="button"
              class="rounded-md p-1 text-slate-400 opacity-0 transition hover:bg-rose-50 hover:text-rose-600 group-hover:opacity-100"
              @click.stop="emit('delete', c.id)"
              title="删除会话"
            >
              <Trash2 class="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      <div class="border-t border-sky-100/80 p-3">
        <UserAccountMenu />
      </div>
    </template>

    <Teleport to="body">
      <transition enter-active-class="transition duration-150 ease-out" enter-from-class="translate-x-[-0.5rem] scale-[0.98] opacity-0" enter-to-class="translate-x-0 scale-100 opacity-100" leave-active-class="transition duration-100 ease-in" leave-from-class="translate-x-0 scale-100 opacity-100" leave-to-class="translate-x-[-0.5rem] scale-[0.98] opacity-0">
        <div
          v-if="showAppPanel"
          class="fixed z-[118] overflow-hidden rounded-[1.5rem] border border-blue-100 bg-white/95 shadow-[0_1.875rem_5.625rem_rgba(15,23,42,0.20)] ring-1 ring-white/80 backdrop-blur-2xl"
          :style="appPanelStyle"
        >
          <div class="border-b border-blue-50 bg-gradient-to-br from-blue-50 via-white to-cyan-50 px-4 py-3">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <div class="inline-flex items-center gap-2 rounded-full bg-white/80 px-2.5 py-1 text-[0.6875rem] font-semibold text-blue-700 ring-1 ring-blue-100">
                  <component :is="currentCategory.icon" class="h-3.5 w-3.5" />
                  {{ currentCategory.label }}
                </div>
                <div class="mt-2 truncate text-sm font-semibold text-slate-950">选择一个应用能力</div>
                <div class="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{{ currentCategory.desc }}</div>
              </div>
              <button type="button" class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-slate-500 ring-1 ring-blue-100 transition hover:bg-blue-50 hover:text-blue-700" title="关闭" @click="closeAppPanel">
                <X class="h-4 w-4" />
              </button>
            </div>
          </div>

          <div class="max-h-[21rem] space-y-2 overflow-auto p-3">
            <button
              v-for="app in currentCategoryApps"
              :key="app.id"
              type="button"
              class="group flex w-full min-w-0 items-start gap-3 rounded-2xl bg-white px-3 py-3 text-left ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:bg-blue-50 hover:ring-blue-200 hover:shadow-[0_0.875rem_2.25rem_rgba(37,99,235,0.12)]"
              @click="selectApplication(app)"
            >
              <span class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 ring-1 ring-blue-100 transition group-hover:bg-blue-600 group-hover:text-white group-hover:ring-blue-600">
                <component :is="app.icon" class="h-4 w-4" />
              </span>
              <span class="min-w-0 flex-1">
                <span class="block truncate text-sm font-semibold text-slate-950">{{ app.name }}</span>
                <span class="mt-1 block text-xs leading-5 text-slate-500">{{ app.desc }}</span>
              </span>
              <ChevronRight class="mt-2 h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-blue-600" />
            </button>
          </div>
        </div>
      </transition>
    </Teleport>

    <Teleport to="body">
      <transition enter-active-class="transition duration-150 ease-out" enter-from-class="scale-[0.98] opacity-0" enter-to-class="scale-100 opacity-100" leave-active-class="transition duration-100 ease-in" leave-from-class="scale-100 opacity-100" leave-to-class="scale-[0.98] opacity-0">
        <div
          v-if="showMore"
          class="fixed z-[120] rounded-[1.5rem] border border-blue-100 bg-white/95 p-3 shadow-[0_1.875rem_5.625rem_rgba(15,23,42,0.22)] ring-1 ring-white/80 backdrop-blur-2xl"
          :style="moreMenuStyle"
        >
          <div class="mb-3 flex items-center justify-between gap-3">
            <div class="min-w-0">
              <div class="flex items-center gap-2 text-sm font-semibold text-slate-950">
                <span class="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-400 text-white shadow-[0_0.75rem_1.75rem_rgba(37,99,235,0.26)]">
                  <Command class="h-4 w-4" />
                </span>
                更多配置
              </div>
              <div class="mt-1 text-xs text-slate-500">AI 应用一级菜单已外置，这里只保留管理与配置入口。</div>
            </div>
            <button type="button" class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-700 ring-1 ring-blue-100 transition hover:bg-blue-100" title="关闭菜单" @click="showMore = false">
              <X class="h-4 w-4" />
            </button>
          </div>

          <div class="grid gap-2 sm:grid-cols-2">
            <button
              v-for="item in resourceLinks"
              :key="item.id"
              type="button"
              :class="[
                'group flex min-w-0 items-center gap-2 rounded-xl bg-white px-2.5 py-2 text-left ring-1 transition hover:-translate-y-0.5 hover:text-blue-800 hover:shadow-[0_0.75rem_1.875rem_rgba(37,99,235,0.12)]',
                isResourceActive(item.id) ? 'bg-blue-50/80 ring-blue-200 shadow-[0_0.75rem_1.875rem_rgba(37,99,235,0.08)]' : 'ring-transparent hover:ring-blue-100'
              ]"
              @click="handleResourceAction(item.action)"
            >
              <span :class="[
                'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1 transition',
                isResourceActive(item.id)
                  ? 'bg-blue-600 text-white ring-blue-600'
                  : 'bg-blue-50 text-blue-700 ring-blue-100 group-hover:bg-blue-600 group-hover:text-white'
              ]">
                <component :is="item.icon" class="h-4 w-4" />
              </span>
              <span class="min-w-0 flex-1">
                <span class="block truncate text-xs font-semibold text-slate-950">{{ item.label }}</span>
                <span class="mt-0.5 block truncate text-[0.625rem] leading-3 text-slate-500">{{ item.desc }}</span>
              </span>
            </button>
          </div>
        </div>
      </transition>
    </Teleport>
  </aside>
</template>
