<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Ability } from '@/data/abilities'
import { X } from 'lucide-vue-next'

const props = defineProps<{
  open: boolean
  knowledgeBases: Ability[]
  initialSelectedIds: string[]
  title?: string
  hint?: string
  searchPlaceholder?: string
  emptyText?: string
  confirmText?: string
  itemLabel?: string
}>()
const emit = defineEmits<{ close: []; confirm: [ids: string[]]; preview: [id: string] }>()

const keyword = ref('')
const selectedId = ref<string | null>(null)

watch(() => props.open, (v) => {
  if (!v) return
  keyword.value = ''
  selectedId.value = props.initialSelectedIds[0] ?? null
})

const filtered = computed(() => {
  const k = keyword.value.trim().toLowerCase()
  if (!k) return props.knowledgeBases
  return props.knowledgeBases.filter(kb => `${kb.name} ${kb.summary} ${kb.tags.join(' ')}`.toLowerCase().includes(k))
})
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-[320] flex items-center justify-center bg-blue-950/25 backdrop-blur-sm p-4" role="dialog" aria-modal="true" @mousedown.self="emit('close')">
    <div class="w-full max-w-[880px] rounded-2xl border border-sky-200/60 bg-white/90 p-5 shadow-2xl">
      <div class="flex items-start justify-between gap-3">
        <div>
          <div class="text-base font-semibold text-slate-900">{{ title ?? '新建知识库' }}</div>
          <div class="mt-1 text-xs text-slate-600">{{ hint ?? '支持检索、单选与双击预览' }}</div>
        </div>
        <button type="button" @click="emit('close')" class="rounded-xl bg-white/70 p-2 text-slate-700 ring-1 ring-sky-200/70 transition hover:bg-white"><X class="h-4 w-4" /></button>
      </div>

      <div class="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <input v-model="keyword" :placeholder="searchPlaceholder ?? '搜索知识库名称 / 描述 / 标签'" class="w-full rounded-xl border border-sky-200/70 bg-white/80 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#00B4FF]/55 md:max-w-[420px]" />
        <div class="flex items-center gap-2">
          <button type="button" @click="selectedId = null" class="rounded-xl bg-white/70 px-3 py-2 text-xs font-semibold text-slate-900 ring-1 ring-sky-200/70 transition hover:bg-white">清空选择</button>
          <button type="button" @click="selectedId && emit('confirm', [selectedId])" :disabled="!selectedId" class="rounded-xl bg-gradient-to-r from-[#0098FF] to-[#006CFF] px-4 py-2 text-xs font-semibold text-white ring-1 ring-[#00B4FF]/55 transition hover:brightness-105 disabled:opacity-50">{{ confirmText ?? '添加' }}</button>
        </div>
      </div>

      <div class="mt-4 max-h-[52vh] overflow-auto rounded-2xl border border-sky-200/70 bg-white/70">
        <div v-if="!filtered.length" class="px-4 py-10 text-center text-sm text-slate-600">{{ emptyText ?? '暂无匹配知识库' }}</div>
        <div v-else class="divide-y divide-sky-200/50">
          <div v-for="kb in filtered" :key="kb.id" class="flex cursor-pointer items-start gap-3 px-4 py-3 transition hover:bg-white" @click="selectedId = kb.id" @dblclick="emit('preview', kb.id)">
            <input type="radio" name="knowledge-select" :checked="selectedId === kb.id" @change="selectedId = kb.id" class="mt-1 h-4 w-4 accent-[#0098FF]" />
            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <div class="truncate text-sm font-semibold text-slate-900">{{ kb.name }}</div>
                <div class="shrink-0 rounded-full bg-white/70 px-2 py-0.5 text-[11px] text-slate-700 ring-1 ring-sky-200/70">{{ kb.version }}</div>
              </div>
              <div class="mt-1 text-xs text-slate-600 text-clamp-2">{{ kb.summary }}</div>
              <div class="mt-2 flex flex-wrap gap-1.5">
                <span v-for="t in kb.tags.slice(0, 6)" :key="t" class="rounded-full bg-[#00B4FF]/12 px-2 py-0.5 text-[11px] text-slate-700 ring-1 ring-[#00B4FF]/25">{{ t }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
