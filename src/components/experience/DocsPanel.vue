<script setup lang="ts">
import { computed } from 'vue'
import { useKnowledgeStore } from '@/stores/knowledge'
import { KNOWLEDGE_DOCS } from '@/data/knowledgeDocs'
import { X } from 'lucide-vue-next'

defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()

const knowledgeStore = useKnowledgeStore()
const activeDoc = computed(() => {
  const id = knowledgeStore.activePreviewKbId
  if (!id) return null
  return KNOWLEDGE_DOCS.find(d => d.id === id) ?? null
})
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-[320] flex items-center justify-center bg-blue-950/25 backdrop-blur-sm p-4" role="dialog" aria-modal="true" @mousedown.self="emit('close')">
    <div class="w-full max-w-[860px] overflow-hidden rounded-2xl border border-sky-200/60 bg-white/90 shadow-2xl">
      <div class="flex items-start justify-between gap-3 border-b border-sky-200/60 px-5 py-4">
        <div class="min-w-0">
          <div class="truncate text-base font-semibold text-slate-900">知识库文档预览</div>
          <div class="mt-1 truncate text-xs text-slate-600">{{ activeDoc ? activeDoc.title : '未选择知识库' }}</div>
        </div>
        <button type="button" @click="emit('close')" class="rounded-xl bg-white/70 p-2 text-slate-700 ring-1 ring-sky-200/70 transition hover:bg-white"><X class="h-4 w-4" /></button>
      </div>
      <div class="max-h-[72vh] overflow-auto px-5 py-4">
        <template v-if="activeDoc">
          <div class="text-sm font-semibold text-slate-900">{{ activeDoc.title }}</div>
          <div class="mt-3 whitespace-pre-wrap text-xs leading-6 text-slate-700">{{ activeDoc.summary }}</div>
        </template>
        <div v-else class="rounded-2xl border border-dashed border-sky-200/70 bg-white/50 px-4 py-10 text-center text-sm text-slate-600">选择左侧知识库后在此处查看文档</div>
      </div>
    </div>
  </div>
</template>
