<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Bot, BookOpen, ChevronRight, KeyRound, MessageSquare, MessageSquarePlus, MoreHorizontal, PanelLeft, Search, Sparkles } from 'lucide-vue-next'
import { useSystemStore } from '@/stores/system'
import { useAIAppStore } from '@/stores/aiApp'
import UserAccountMenu from '@/components/auth/UserAccountMenu.vue'

const route = useRoute()
const router = useRouter()
const systemStore = useSystemStore()
const aiStore = useAIAppStore()
const showMore = ref(route.path.startsWith('/agents') || route.path.startsWith('/workbench'))

const primaryNavItems = [
  { label: '新会话', to: 'new-conversation', icon: MessageSquarePlus },
  { label: '搜索会话', to: '/ai-app', icon: Search },
  { label: 'AI 技能', to: '/mcp', icon: Sparkles },
  { label: 'AI 知识库', to: '/knowledge', icon: BookOpen },
]

const secondaryNavItems = [
  { label: 'AI 智能体', to: '/agents', icon: Bot },
  { label: '开发者工作台', to: '/workbench/keys', icon: KeyRound },
]

const activePath = computed(() => route.path)

function isActive(to: string) {
  if (to === '/workbench/keys') return activePath.value.startsWith('/workbench')
  if (to === '/ai-app') return activePath.value === '/ai-app'
  return activePath.value.startsWith(to)
}

const recentConversations = computed(() => aiStore.sortedConversations.slice(0, 12))

function createConversation() {
  const id = aiStore.createConversation(aiStore.selectedAgentType)
  aiStore.switchConversation(id)
  router.push('/ai-app')
}

function openConversation(id: string) {
  aiStore.switchConversation(id)
  router.push('/ai-app')
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
  }
  return map[agent || 'general'] || '通用助手'
}

function go(to: string) {
  if (to === 'new-conversation') {
    createConversation()
    return
  }
  router.push(to)
}
</script>

<template>
  <aside class="hidden app-sidebar-height w-[292px] shrink-0 flex-col border-r border-white/60 bg-white/60 backdrop-blur-2xl lg:flex">
    <div class="px-4 pb-3 pt-4">
      <button type="button" class="flex w-full items-center gap-3 rounded-2xl px-2 py-2 text-left transition hover:bg-white/70" @click="go('/ai-app')">
        <span class="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-400 text-white shadow-[0_12px_32px_rgba(37,99,235,0.30)]">
          <PanelLeft class="h-4 w-4" />
        </span>
        <span class="min-w-0">
          <span class="block truncate text-sm font-semibold text-slate-950">{{ systemStore.displayName || '极客光年安全大模型' }}</span>
          <span class="block truncate text-[11px] text-slate-500">安全生产智能应用工作台</span>
        </span>
      </button>
    </div>

    <nav class="space-y-1 px-3">
      <button
        v-for="item in primaryNavItems"
        :key="item.label"
        type="button"
        :class="[
          'group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition',
          isActive(item.to) ? 'bg-white/90 text-slate-950 shadow-sm ring-1 ring-white/80' : 'text-slate-700 hover:bg-white/70 hover:text-slate-950'
        ]"
        @click="go(item.to)"
      >
        <component :is="item.icon" class="h-4 w-4 shrink-0" />
        <span class="min-w-0 flex-1 truncate font-medium">{{ item.label }}</span>
      </button>

      <button
        type="button"
        class="group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm text-slate-700 transition hover:bg-white/70 hover:text-slate-950"
        @click="showMore = !showMore"
      >
        <span class="inline-flex items-center gap-3">
          <MoreHorizontal class="h-4 w-4 shrink-0" />
          <span class="font-medium">更多</span>
        </span>
        <ChevronRight :class="['h-4 w-4 transition', showMore && 'rotate-90']" />
      </button>

      <div v-if="showMore" class="space-y-1 rounded-2xl bg-white/45 p-1 ring-1 ring-white/70">
        <button
          v-for="item in secondaryNavItems"
          :key="item.label"
          type="button"
          :class="[
            'group flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition',
            isActive(item.to) ? 'bg-white text-slate-950 shadow-sm ring-1 ring-slate-200' : 'text-slate-700 hover:bg-white/70 hover:text-slate-950'
          ]"
          @click="go(item.to)"
        >
          <component :is="item.icon" class="h-4 w-4 shrink-0" />
          <span class="min-w-0 flex-1 truncate font-medium">{{ item.label }}</span>
        </button>
      </div>
    </nav>

    <div class="mt-4 min-h-0 flex-1 border-t border-slate-200/80 px-3 pt-3">
      <div class="px-1 pb-2 text-xs font-medium text-slate-500">近期会话</div>
      <div class="max-h-[38vh] space-y-1 overflow-auto pr-1">
        <button
          v-for="c in recentConversations"
          :key="c.id"
          type="button"
          :class="[
            'group flex w-full items-start gap-2 rounded-xl px-2 py-2.5 text-left transition',
            aiStore.activeConversationId === c.id ? 'bg-white shadow-sm ring-1 ring-slate-200' : 'hover:bg-white/70'
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
        <div v-if="recentConversations.length === 0" class="rounded-2xl bg-white px-3 py-5 text-center text-xs text-slate-500 ring-1 ring-slate-200">
          暂无历史会话
        </div>
      </div>
    </div>

    <div class="mt-auto border-t border-sky-100/80 p-3">
      <UserAccountMenu />
    </div>
  </aside>
</template>
