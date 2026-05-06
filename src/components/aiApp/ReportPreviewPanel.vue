<script setup lang="ts">
import { computed } from 'vue'
import { ClipboardCopy, Download, FileText, Loader2, X, FileDown } from 'lucide-vue-next'
import type { Conversation } from '@/stores/aiApp'

const props = defineProps<{ conversation: Conversation | null; streaming?: boolean }>()
const emit = defineEmits<{ (e: 'close'): void }>()

function escapeHtml(text: string) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function renderMarkdown(md: string) {
  const escaped = escapeHtml(md || '# 报告预览\n\n等待左侧输入生成内容。')
  return escaped
    .replace(/^# (.*)$/gm, '<h1 class="mb-4 text-2xl font-bold tracking-tight text-slate-950">$1</h1>')
    .replace(/^## (.*)$/gm, '<h2 class="mb-2 mt-6 text-lg font-semibold text-blue-950">$1</h2>')
    .replace(/^> (.*)$/gm, '<blockquote class="my-3 rounded-2xl border-l-4 border-blue-300 bg-blue-50 px-4 py-3 text-sm text-slate-600">$1</blockquote>')
    .replace(/^- (.*)$/gm, '<li class="ml-5 list-disc text-sm leading-7 text-slate-700">$1</li>')
    .replace(/^\d+\. (.*)$/gm, '<li class="ml-5 list-decimal text-sm leading-7 text-slate-700">$1</li>')
    .replace(/\n/g, '<br />')
}

const activeDocument = computed(() => props.conversation?.reportDocuments?.find(item => item.id === props.conversation?.activeReportDocumentId) || props.conversation?.reportDocuments?.[0])
const markdown = computed(() => activeDocument.value?.content || props.conversation?.reportMarkdown || '')
const html = computed(() => renderMarkdown(markdown.value))
const statusText = computed(() => {
  const s = props.conversation?.reportStatus
  if (s === 'generating') return '生成中'
  if (s === 'done') return '已完成'
  if (s === 'failed') return '生成失败'
  return '待生成'
})
const docTitle = computed(() => activeDocument.value?.title || '报告文档')

async function copyMarkdown() {
  if (!markdown.value) return
  await navigator.clipboard?.writeText(markdown.value)
}

function downloadAs(ext: 'md' | 'doc') {
  const content = markdown.value || '# 报告文档\n\n暂无内容。'
  const type = ext === 'md' ? 'text/markdown;charset=utf-8' : 'application/msword;charset=utf-8'
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${docTitle.value}.${ext}`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <aside class="fixed inset-3 z-50 flex flex-col overflow-hidden rounded-[28px] border border-white/70 bg-gradient-to-br from-white/90 via-sky-50/80 to-blue-50/70 shadow-[0_30px_100px_rgba(25,91,210,0.22)] backdrop-blur-2xl md:relative md:inset-auto md:z-auto md:h-full md:min-w-[420px] md:flex-[0_0_48%] md:rounded-none md:border-l md:shadow-[-22px_0_70px_rgba(25,91,210,0.10)] lg:min-w-[460px] lg:flex-[0_0_50%]">
    <div class="flex items-center justify-between gap-3 border-b border-white/70 px-5 py-4">
      <div class="flex min-w-0 items-center gap-3">
        <span class="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-400 text-white shadow-[0_12px_30px_rgba(37,99,235,0.24)]">
          <FileText class="h-4 w-4" />
        </span>
        <div class="min-w-0">
          <div class="truncate text-base font-semibold text-slate-950">{{ docTitle }}</div>
          <div class="truncate text-[11px] text-slate-500">只展示报告正文，支持 Markdown 复制与导出。</div>
        </div>
      </div>
      <div class="flex shrink-0 items-center gap-2">
        <span class="inline-flex items-center gap-1 rounded-full bg-white/80 px-2.5 py-1 text-[11px] text-blue-700 ring-1 ring-blue-100">
          <Loader2 v-if="conversation?.reportStatus === 'generating'" class="h-3 w-3 animate-spin" />
          {{ statusText }}
        </span>
        <button type="button" class="inline-flex h-8 items-center gap-1.5 rounded-full bg-white/80 px-3 text-xs font-semibold text-blue-700 ring-1 ring-blue-100 transition hover:bg-blue-50" @click="copyMarkdown">
          <ClipboardCopy class="h-3.5 w-3.5" /> 复制全文
        </button>
        <button type="button" class="inline-flex h-8 items-center gap-1.5 rounded-full bg-white/80 px-3 text-xs font-semibold text-blue-700 ring-1 ring-blue-100 transition hover:bg-blue-50" @click="downloadAs('md')">
          <Download class="h-3.5 w-3.5" /> Markdown
        </button>
        <button type="button" class="inline-flex h-8 items-center gap-1.5 rounded-full bg-white/80 px-3 text-xs font-semibold text-blue-700 ring-1 ring-blue-100 transition hover:bg-blue-50" @click="downloadAs('doc')">
          <FileDown class="h-3.5 w-3.5" /> Doc
        </button>
        <button type="button" class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-slate-600 ring-1 ring-slate-200 transition hover:bg-white hover:text-slate-950" title="关闭分屏，恢复单屏" @click="emit('close')">
          <X class="h-4 w-4" />
        </button>
      </div>
    </div>

    <div class="min-h-0 flex-1 overflow-auto px-6 py-5">
      <article class="min-h-full rounded-[28px] border border-white/80 bg-white/90 p-7 text-sm leading-7 text-slate-700 shadow-[0_24px_70px_rgba(37,99,235,0.12)] ring-1 ring-blue-50/80" v-html="html" />
    </div>
  </aside>
</template>
