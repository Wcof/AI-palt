<script setup lang="ts">
import { computed, ref } from 'vue'
import { ClipboardCopy, Download, FileDown, FileText, ListTodo, Loader2, MessageSquareText, ScrollText, X } from 'lucide-vue-next'
import type { Conversation } from '@/stores/aiApp'

const props = defineProps<{ conversation: Conversation | null; streaming?: boolean }>()
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'select-document', id: string): void
}>()

type MeetingTab = 'summary' | 'minutes' | 'todo' | 'raw'

const activeTab = ref<MeetingTab>('raw')

function escapeHtml(text: string) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function renderMarkdown(md: string) {
  const escaped = escapeHtml(md)
  return escaped
    .replace(/^# (.*)$/gm, '<h1 class="mb-4 text-2xl font-bold tracking-tight text-slate-950">$1</h1>')
    .replace(/^## (.*)$/gm, '<h2 class="mb-2 mt-6 text-lg font-semibold text-blue-950">$1</h2>')
    .replace(/^### (.*)$/gm, '<h3 class="mb-2 mt-4 text-base font-semibold text-slate-900">$1</h3>')
    .replace(/^> (.*)$/gm, '<blockquote class="my-3 rounded-2xl border-l-4 border-blue-300 bg-blue-50 px-4 py-3 text-sm text-slate-600">$1</blockquote>')
    .replace(/^- (.*)$/gm, '<li class="ml-5 list-disc text-sm leading-7 text-slate-700">$1</li>')
    .replace(/^\| (.*) \|$/gm, '<div class="font-mono text-xs leading-6 text-slate-700">| $1 |</div>')
    .replace(/\n/g, '<br />')
}

const documents = computed(() => props.conversation?.reportDocuments || [])
const activeDocument = computed(() => documents.value.find(item => item.id === props.conversation?.activeReportDocumentId) || documents.value[0])
const markdown = computed(() => activeDocument.value?.content || props.conversation?.reportMarkdown || '')
const docTitle = computed(() => activeDocument.value?.title || '会议纪要')
const statusText = computed(() => {
  const s = props.conversation?.reportStatus
  if (s === 'generating') return '生成中'
  if (s === 'done') return '已完成'
  if (s === 'failed') return '生成失败'
  return '待录音'
})

const tabOptions = [
  { id: 'raw', label: '原文', icon: MessageSquareText },
  { id: 'summary', label: '摘要', icon: FileText },
  { id: 'minutes', label: '会议纪要', icon: ScrollText },
  { id: 'todo', label: '待办', icon: ListTodo },
] as const

function extractSection(source: string, heading: string) {
  if (!source) return ''
  const escapedHeading = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(^##\\s+${escapedHeading}\\s*$)([\\s\\S]*?)(?=^##\\s+|$)`, 'm')
  const match = source.match(regex)
  return match ? `${match[1]}\n${match[2].trim()}`.trim() : ''
}

const sectionMap = computed<Record<MeetingTab, string>>(() => {
  const source = markdown.value || '# 会议纪要\n\n左侧点击开始录音或输入会议主题后，右侧将生成摘要、纪要、待办和原文摘录。'
  return {
    summary: extractSection(source, '一、会议摘要') || '# 摘要\n\n等待录音或原文输入后生成会议摘要。',
    raw: extractSection(source, '二、原文转写摘录') || '# 原文\n\n等待录音转写内容。',
    minutes: extractSection(source, '三、关键结论') || '# 会议纪要\n\n等待系统提炼关键结论。',
    todo: extractSection(source, '四、待办事项') || '# 待办\n\n等待会议待办项。',
  }
})

const html = computed(() => renderMarkdown(sectionMap.value[activeTab.value]))

async function copyMarkdown() {
  const content = sectionMap.value[activeTab.value]
  if (!content) return
  await navigator.clipboard?.writeText(content)
}

function downloadAs(ext: 'md' | 'doc') {
  const content = sectionMap.value[activeTab.value] || '# 会议纪要\n\n暂无内容。'
  const type = ext === 'md' ? 'text/markdown;charset=utf-8' : 'application/msword;charset=utf-8'
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${docTitle.value}-${tabOptions.find(tab => tab.id === activeTab.value)?.label || '纪要'}.${ext}`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <aside class="fixed inset-3 z-50 flex flex-col overflow-hidden rounded-[28px] border border-white/70 bg-gradient-to-br from-white/92 via-sky-50/80 to-blue-50/75 shadow-[0_30px_100px_rgba(25,91,210,0.22)] backdrop-blur-2xl md:relative md:inset-auto md:z-auto md:h-full md:min-w-[420px] md:flex-[0_0_48%] md:rounded-none md:border-l md:shadow-[-22px_0_70px_rgba(25,91,210,0.10)] lg:min-w-[500px] lg:flex-[0_0_50%]">
    <div class="flex items-center justify-between gap-3 border-b border-white/70 px-5 py-4">
      <div class="flex min-w-0 items-center gap-3">
        <span class="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-400 text-white shadow-[0_12px_30px_rgba(37,99,235,0.24)]">
          <FileText class="h-4 w-4" />
        </span>
        <div class="min-w-0">
          <div class="truncate text-base font-semibold text-slate-950">会议纪要</div>
          <div class="truncate text-[11px] text-slate-500">原文、摘要、会议纪要、待办四类结果切换显示。</div>
        </div>
      </div>
      <div class="flex shrink-0 items-center gap-2">
        <span class="inline-flex items-center gap-1 rounded-full bg-white/80 px-2.5 py-1 text-[11px] text-blue-700 ring-1 ring-blue-100">
          <Loader2 v-if="conversation?.reportStatus === 'generating'" class="h-3 w-3 animate-spin" />
          {{ statusText }}
        </span>
        <button type="button" class="hidden h-8 items-center gap-1.5 rounded-full bg-white/80 px-3 text-xs font-semibold text-blue-700 ring-1 ring-blue-100 transition hover:bg-blue-50 sm:inline-flex" @click="copyMarkdown">
          <ClipboardCopy class="h-3.5 w-3.5" /> 复制
        </button>
        <button type="button" class="hidden h-8 items-center gap-1.5 rounded-full bg-white/80 px-3 text-xs font-semibold text-blue-700 ring-1 ring-blue-100 transition hover:bg-blue-50 xl:inline-flex" @click="downloadAs('md')">
          <Download class="h-3.5 w-3.5" /> MD
        </button>
        <button type="button" class="hidden h-8 items-center gap-1.5 rounded-full bg-white/80 px-3 text-xs font-semibold text-blue-700 ring-1 ring-blue-100 transition hover:bg-blue-50 xl:inline-flex" @click="downloadAs('doc')">
          <FileDown class="h-3.5 w-3.5" /> Doc
        </button>
        <button type="button" class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-slate-600 ring-1 ring-slate-200 transition hover:bg-white hover:text-slate-950" title="关闭分屏，恢复单屏" @click="emit('close')">
          <X class="h-4 w-4" />
        </button>
      </div>
    </div>

    <div class="border-b border-white/70 px-5 py-3">
      <div class="flex flex-wrap items-center gap-2">
        <button
          v-for="tab in tabOptions"
          :key="tab.id"
          type="button"
          :class="[
            'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition',
            activeTab === tab.id
              ? 'bg-blue-600 text-white ring-blue-600 shadow-[0_10px_24px_rgba(37,99,235,0.18)]'
              : 'bg-white/80 text-slate-600 ring-blue-100 hover:bg-blue-50 hover:text-blue-900'
          ]"
          @click="activeTab = tab.id"
        >
          <component :is="tab.icon" class="h-3.5 w-3.5" />
          <span>{{ tab.label }}</span>
        </button>
      </div>
    </div>

    <div class="min-h-0 flex-1 overflow-auto px-6 py-5">
      <section v-if="documents.length" class="mb-4 grid gap-2 sm:grid-cols-2">
        <button
          v-for="doc in documents"
          :key="doc.id"
          type="button"
          :class="[
            'rounded-2xl px-3 py-2.5 text-left ring-1 transition',
            doc.id === activeDocument?.id ? 'bg-blue-600 text-white ring-blue-600 shadow-[0_14px_34px_rgba(37,99,235,0.20)]' : 'bg-white/80 text-slate-700 ring-blue-100 hover:bg-blue-50 hover:text-blue-900'
          ]"
          @click="emit('select-document', doc.id)"
        >
          <div class="flex items-center justify-between gap-2">
            <span class="truncate text-sm font-semibold">{{ doc.title }}</span>
            <span :class="['rounded-full px-2 py-0.5 text-[10px]', doc.id === activeDocument?.id ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-700 ring-1 ring-blue-100']">纪要</span>
          </div>
          <div :class="['mt-1 line-clamp-1 text-[11px]', doc.id === activeDocument?.id ? 'text-blue-50' : 'text-slate-500']">
            {{ doc.status === 'generating' ? '正在生成会议摘要...' : '点击查看本次会议纪要' }}
          </div>
        </button>
      </section>
      <article class="min-h-full rounded-[28px] border border-white/80 bg-white/90 p-7 text-sm leading-7 text-slate-700 shadow-[0_24px_70px_rgba(37,99,235,0.12)] ring-1 ring-blue-50/80" v-html="html" />
    </div>
  </aside>
</template>
