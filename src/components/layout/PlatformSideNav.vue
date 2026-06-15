<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { BarChart3, BookMarked, Bot, BookOpen, Boxes, ChevronDown, Crown, Database, Download, FileText, History, KeyRound, Layers3, MessageSquare, MessageSquarePlus, MoreHorizontal, PanelLeft, Pencil, ServerCrash, Settings2, ShieldAlert, Sparkles, ShieldCheck, Trash2, X } from 'lucide-vue-next'
import { useSystemStore } from '@/stores/system'
import { useAIAppStore, type AgentType } from '@/stores/aiApp'
import { useNewAIStore } from '@/stores/newAI'
import UserAccountMenu from '@/components/auth/UserAccountMenu.vue'

const route = useRoute()
const router = useRouter()
const systemStore = useSystemStore()
const aiStore = useAIAppStore()
const newAIStore = useNewAIStore()
const moreOpen = ref(false)
const activeConversationMenuId = ref<string | null>(null)
const props = withDefaults(defineProps<{ alwaysVisible?: boolean }>(), {
  alwaysVisible: false,
})

const primaryNavItems = [
  { label: '新会话', to: 'new-conversation', icon: MessageSquarePlus },
  { label: '智能问答', to: '/newAI/assistant', icon: MessageSquare, feature: 'assistant', agentType: 'general' as AgentType },
  { label: '隐患识别', to: '/newAI/assistant', icon: ShieldAlert, feature: 'ocr', agentType: 'hazard' as AgentType },
  { label: '智能文书', to: '/newAI/assistant', icon: FileText, feature: 'agent', agentType: 'document' as AgentType },
]
const moreNavItems = [
  { label: 'AI 智能体', desc: '进入智能体在线体验与应用中心', to: '/newAI/agent', icon: Bot, feature: 'agent' },
  { label: 'AI 技能', desc: '查看 MCP 技能与工具能力', to: '/newAI/mcp', icon: Sparkles, feature: 'mcp' },
  { label: 'AI 知识库', desc: '管理知识问答与知识库应用', to: '/newAI/knowledge', icon: BookOpen, feature: 'knowledge' },
  { label: '开发工作台', desc: 'API 密钥、订阅与统计管理', to: '/newAI/apiKey', icon: KeyRound, feature: 'apiKey' },
]
const activePath = computed(() => route.path)
const isSystemSettingsRoute = computed(() => activePath.value === '/newAI/system')
const activeSystemTab = computed(() => {
  const value = Array.isArray(route.query.tab) ? route.query.tab[0] : route.query.tab
  return value || 'versions'
})
const systemNavItems = [
  { key: 'versions', label: '版本管理', icon: Layers3 },
  { key: 'license', label: 'License 管理', icon: Crown },
  { key: 'quota', label: '成员与额度', icon: Boxes },
  { key: 'sessions', label: '会话管理', icon: ShieldCheck },
  { key: 'models', label: '模型配置', icon: Database },
  { key: 'samples', label: '反馈列表', icon: BookMarked },
  { key: 'audit', label: '审计日志', icon: History },
  { key: 'metrics', label: '用量分析', icon: BarChart3 },
  { key: 'ledger', label: '资产流水', icon: Database },
  { key: 'backup', label: '备份与容灾', icon: ServerCrash },
] as const

function isActive(to: string, agentType?: AgentType) {
  if (agentType) return activePath.value === '/newAI/assistant' && aiStore.selectedAgentType === agentType
  if (to === '/newAI/assistant') return activePath.value === '/ai-app' || activePath.value === '/newAI/assistant'
  return activePath.value.startsWith(to)
}

const recentConversations = computed(() => aiStore.sortedConversations.slice(0, 12))

function createConversation() {
  aiStore.createConversation('general', false)
  router.push('/newAI/assistant')
}

function openConversation(id: string) {
  activeConversationMenuId.value = null
  aiStore.switchConversation(id)
  router.push('/newAI/assistant')
}

function toggleConversationMenu(id: string) {
  activeConversationMenuId.value = activeConversationMenuId.value === id ? null : id
}

function deleteRecentConversation(id: string) {
  aiStore.deleteConversation(id)
  activeConversationMenuId.value = null
}

function renameRecentConversation(conversation: { id: string; title: string }) {
  const title = window.prompt('请输入新的会话名称', conversation.title)
  if (title?.trim()) aiStore.renameConversation(conversation.id, title)
  activeConversationMenuId.value = null
}

function exportRecentConversation(conversation: any) {
  const payload = {
    exportedAt: new Date().toISOString(),
    conversation,
  }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${conversation.title || 'conversation'}-${conversation.id}.json`
  link.click()
  URL.revokeObjectURL(url)
  activeConversationMenuId.value = null
}

function formatRelative(ts: number) {
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return '刚刚'
  if (mins < 60) return `${mins} 分钟前`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} 小时前`
  return `${Math.floor(hours / 24)} 天前`
}

function agentLabel(agent?: string) {
  const map: Record<string, string> = {
    general: '通用助手',
    nl2sql: 'NL2SQL',
    report: '报告生成',
    hazard: '隐患识图',
    rag: '知识库',
    meeting: '会议纪要',
    document: '文档编写',
  }
  return map[agent || 'general'] || '通用助手'
}

function go(to: string) {
  if (to === 'new-conversation') {
    createConversation()
    return
  }
  moreOpen.value = false
  router.push(to)
}

function goAgent(agentType: AgentType) {
  if (agentType === 'hazard' && !newAIStore.requireFeature('ocr', 'OCR / 隐患识图')) return
  aiStore.setActiveAgent(agentType)
  router.push('/newAI/assistant')
}

function goNavItem(item: { to: string; agentType?: AgentType }) {
  if (item.to === 'new-conversation') {
    createConversation()
    return
  }
  if (item.agentType) {
    goAgent(item.agentType)
    return
  }
  router.push(item.to)
}

function openSystemTab(tab: string) {
  router.push({ path: '/newAI/system', query: { tab } })
}
</script>

<template>
  <aside :class="[props.alwaysVisible ? 'flex' : 'hidden lg:flex', 'relative z-[80] app-sidebar-height w-[292px] shrink-0 flex-col overflow-visible border-r border-white/60 bg-white/60 backdrop-blur-2xl']">
    <div class="px-4 pb-3 pt-4">
      <button type="button" class="flex w-full items-center gap-3 rounded-2xl px-2 py-2 text-left transition hover:bg-white/70" @click="go('/newAI/assistant')">
        <span class="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-400 text-white shadow-[0_12px_32px_rgba(37,99,235,0.30)]">
          <PanelLeft class="h-4 w-4" />
        </span>
        <span class="min-w-0">
          <span class="block truncate text-sm font-semibold text-slate-950">{{ systemStore.displayName || '极客光年安全大模型' }}</span>
          <span class="block truncate text-[11px] text-slate-500">安全生产智能应用工作台</span>
        </span>
      </button>
    </div>

    <nav v-if="!isSystemSettingsRoute" class="space-y-1 px-3">
      <button
        v-for="item in primaryNavItems"
        :key="item.label"
        type="button"
        :class="[
          'group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition',
          isActive(item.to, item.agentType) ? 'bg-white/90 text-slate-950 shadow-sm ring-1 ring-white/80' : 'text-slate-700 hover:bg-white/70 hover:text-slate-950'
        ]"
        @click="goNavItem(item)"
      >
        <component :is="item.icon" class="h-4 w-4 shrink-0" />
        <span class="min-w-0 flex-1 truncate font-medium">{{ item.label }}</span>
        <span v-if="'feature' in item && item.feature" class="rounded-full px-2 py-0.5 text-[10px] ring-1" :class="newAIStore.getFeature(item.feature as any)?.status === 'enabled' ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : 'bg-amber-50 text-amber-700 ring-amber-200'">
          {{ newAIStore.getFeature(item.feature as any)?.status === 'enabled' ? '已开通' : '需付费' }}
        </span>
      </button>

      <div class="relative rounded-xl">
        <button
          type="button"
          :class="[
            'group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition',
            moreOpen ? 'bg-white/90 text-blue-700 shadow-sm ring-1 ring-blue-100' : 'text-slate-700 hover:bg-white/70 hover:text-slate-950'
          ]"
          @click="moreOpen = !moreOpen"
        >
          <MoreHorizontal class="h-4 w-4 shrink-0" />
          <span class="min-w-0 flex-1 truncate font-medium">更多</span>
          <ChevronDown class="h-4 w-4 shrink-0 transition" :class="moreOpen ? 'rotate-180' : ''" />
        </button>
        <div
          v-if="moreOpen"
          class="absolute left-0 top-[calc(100%+0.75rem)] z-50 w-[calc(100vw-2rem)] max-w-[26.5rem] rounded-[1.5rem] border border-blue-100 bg-white/95 p-4 shadow-[0_1.75rem_5rem_rgba(37,99,235,0.22)] ring-1 ring-white/80 backdrop-blur-2xl lg:left-[calc(100%+1rem)] lg:top-[-1rem] lg:w-[26.5rem]"
        >
          <div class="flex items-start gap-3">
            <span class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-[0_0.875rem_2rem_rgba(37,99,235,0.28)]">
              <Sparkles class="h-5 w-5" />
            </span>
            <div class="min-w-0 flex-1">
              <div class="text-base font-semibold text-slate-950">更多功能</div>
              <div class="mt-1 text-xs leading-5 text-slate-500">AI 应用一级菜单已外置，这里只保留管理与配置入口。</div>
            </div>
            <button type="button" class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-700 ring-1 ring-blue-100 transition hover:bg-blue-100" title="关闭" @click="moreOpen = false">
              <X class="h-4 w-4" />
            </button>
          </div>
          <div class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              v-for="item in moreNavItems"
              :key="item.label"
              type="button"
              :class="[
                'group flex min-h-[4.25rem] items-start gap-3 rounded-2xl border p-3 text-left transition',
                isActive(item.to) ? 'border-blue-300 bg-blue-50 shadow-sm' : 'border-slate-100 bg-white hover:border-blue-200 hover:bg-blue-50/70'
              ]"
              @click="go(item.to)"
            >
              <span class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 ring-1 ring-blue-100 transition group-hover:bg-white">
                <component :is="item.icon" class="h-4 w-4" />
              </span>
              <span class="min-w-0">
                <span class="block truncate text-sm font-semibold text-slate-900">{{ item.label }}</span>
                <span class="mt-0.5 block line-clamp-2 text-xs leading-5 text-slate-500">{{ item.desc }}</span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </nav>

    <div class="mt-4 min-h-0 flex-1 border-t border-slate-200/80 px-3 pt-3">
      <template v-if="isSystemSettingsRoute">
        <div class="mb-3 rounded-2xl bg-white/70 p-3 ring-1 ring-white/80">
          <div class="px-1 pb-2 text-xs font-medium text-slate-500">系统设置菜单</div>
          <div class="space-y-1 pr-1">
            <button
              v-for="item in systemNavItems"
              :key="item.key"
              type="button"
              :class="[
                'flex w-full items-center gap-2 rounded-xl px-2 py-2.5 text-left text-sm transition',
                activeSystemTab === item.key ? 'bg-white shadow-sm ring-1 ring-slate-200 text-slate-950' : 'text-slate-700 hover:bg-white/70'
              ]"
              @click="openSystemTab(item.key)"
            >
              <component :is="item.icon" class="h-4 w-4 shrink-0" />
              <span class="truncate">{{ item.label }}</span>
            </button>
          </div>
          <div class="mt-4 border-t border-slate-200/80 px-1 pt-3">
            <div class="rounded-2xl bg-white/70 p-3 ring-1 ring-white/80">
              <div class="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <ShieldCheck class="h-3.5 w-3.5 text-emerald-600" /> 当前版本

              </div>
              <div class="mt-2 text-sm font-semibold text-slate-950">{{ newAIStore.currentLicenseInstance?.licenseNo || '未分配 License' }}</div>
              <div class="mt-1 text-[11px] leading-5 text-slate-500">{{ newAIStore.currentAccount?.name }} / {{ newAIStore.currentPackage.name }}</div>
            </div>
          </div>
        </div>
      </template>

      <template v-else>
        <div class="px-1 pb-2 text-xs font-medium text-slate-500">近期会话</div>
        <div class="max-h-[38vh] space-y-1 overflow-auto pr-1">
          <div
            v-for="c in recentConversations"
            :key="c.id"
            class="group relative"
          >
            <button
              type="button"
              :class="[
                'group flex w-full items-start gap-2 rounded-xl px-2 py-2.5 pr-9 text-left transition hover:bg-white/70',
                aiStore.activeConversationId === c.id ? 'bg-white shadow-sm ring-1 ring-slate-200' : ''
              ]"
              @click="openConversation(c.id)"
            >
              <span class="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-slate-600 ring-1 ring-slate-200">
                <MessageSquare class="h-3.5 w-3.5" />
              </span>
              <span class="min-w-0 flex-1">
                <span class="block truncate text-sm font-medium text-slate-900">{{ c.title }}</span>
                <span class="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-500">
                  <span class="truncate">{{ agentLabel(c.agentType) }}</span>
                  <span>·</span>
                  <span>{{ formatRelative(c.updatedAt || c.createdAt) }}</span>
                </span>
              </span>
            </button>
            <button
              type="button"
              class="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 opacity-0 transition hover:bg-white hover:text-slate-700 group-hover:opacity-100"
              :class="activeConversationMenuId === c.id ? 'bg-white text-blue-700 opacity-100 ring-1 ring-blue-100' : ''"
              title="更多操作"
              @click.stop="toggleConversationMenu(c.id)"
            >
              <MoreHorizontal class="h-4 w-4" />
            </button>
            <div v-if="activeConversationMenuId === c.id" class="absolute right-1 top-10 z-30 w-32 overflow-hidden rounded-xl bg-white py-1 text-sm shadow-[0_1rem_2.5rem_rgba(15,23,42,0.16)] ring-1 ring-slate-200">
              <button type="button" class="flex w-full items-center gap-2 px-3 py-2 text-left text-slate-700 transition hover:bg-slate-50" @click.stop="renameRecentConversation(c)">
                <Pencil class="h-3.5 w-3.5" /> 重命名
              </button>
              <button type="button" class="flex w-full items-center gap-2 px-3 py-2 text-left text-slate-700 transition hover:bg-slate-50" @click.stop="exportRecentConversation(c)">
                <Download class="h-3.5 w-3.5" /> 导出
              </button>
              <button type="button" class="flex w-full items-center gap-2 px-3 py-2 text-left text-rose-600 transition hover:bg-rose-50" @click.stop="deleteRecentConversation(c.id)">
                <Trash2 class="h-3.5 w-3.5" /> 删除
              </button>
            </div>
          </div>
          <div v-if="recentConversations.length === 0" class="rounded-2xl bg-white px-3 py-5 text-center text-xs text-slate-500 ring-1 ring-slate-200">
            暂无历史会话
          </div>
        </div>
      </template>
    </div>

    <div class="mt-auto border-t border-sky-100/80 p-3">
      <UserAccountMenu />
    </div>
  </aside>
</template>
