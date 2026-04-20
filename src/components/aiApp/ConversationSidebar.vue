<script setup lang="ts">
import { computed } from 'vue'
import { MessageSquare, Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import type { Conversation } from '@/stores/aiApp'

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
}>()

const empty = computed(() => props.conversations.length === 0)

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
</script>

<template>
  <aside class="flex h-full w-full flex-col border-r border-sky-200/70 bg-white/70 backdrop-blur">
    <div v-if="!hideHeader" class="flex flex-col gap-3 border-b border-sky-200/60 px-3 py-3">
      <div class="flex items-center justify-between gap-2">
        <div v-if="!collapsed" class="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <MessageSquare class="h-4 w-4" />
          <span>会话列表</span>
        </div>
        <button type="button" @click="emit('toggle-collapse')" class="rounded-lg bg-white/70 p-1.5 text-slate-700 ring-1 ring-sky-200/70 transition hover:bg-white">
          <ChevronLeft v-if="!collapsed" class="h-4 w-4" />
          <ChevronRight v-else class="h-4 w-4" />
        </button>
      </div>
      <button
        v-if="!collapsed && !hideNewButton"
        type="button"
        @click="emit('create')"
        class="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200/80 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 hover:border-slate-300/80"
      >
        <Plus class="h-4 w-4" /> 新对话
      </button>
    </div>

    <div v-if="collapsed" class="flex flex-1 items-center justify-center px-3 py-6 text-[11px] text-slate-500">
      已折叠
    </div>

    <div v-else class="min-h-0 flex-1 overflow-auto">
      <div v-if="empty" class="flex h-full flex-col items-center justify-center px-4 py-10 text-xs text-slate-500">
        还没有会话，点击“新对话”开始体验。
      </div>
      <button
        v-for="conv in conversations"
        :key="conv.id"
        type="button"
        @click="emit('select', conv.id)"
        :class="[
          'group flex w-full items-start justify-between gap-3 border-b border-sky-200/40 px-4 py-3 text-left transition',
          activeId === conv.id ? 'bg-gradient-to-r from-[#E7F4FF] to-white' : 'hover:bg-white/80'
        ]"
      >
        <div class="min-w-0 flex-1">
          <div class="truncate text-sm font-semibold" :class="activeId === conv.id ? 'text-slate-900' : 'text-slate-800'">
            {{ conv.title }}
          </div>
          <div class="mt-1 text-[11px] text-slate-500">{{ formatRelative(conv.updatedAt || conv.createdAt) }}</div>
        </div>
        <div class="flex items-center gap-2">
          <span v-if="streamingId === conv.id" class="rounded-full bg-[#00B4FF]/10 px-2 py-0.5 text-[10px] text-[#0077CC] ring-1 ring-[#00B4FF]/30">回复中</span>
          <Trash2 class="h-3.5 w-3.5 text-slate-400 opacity-0 transition group-hover:opacity-100" @click.stop="emit('delete', conv.id)" />
        </div>
      </button>
    </div>
  </aside>
</template>
