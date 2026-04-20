<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { X } from 'lucide-vue-next'
import { cn } from '@/lib/utils'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'

type Loaders = Record<string, () => Promise<string>>

const prdLoaders = import.meta.glob('../../prd_docs/*.md', { query: '?raw', import: 'default' }) as Loaders

const ROUTE_PRD_MAP: Array<{ match: (path: string) => boolean; file: string }> = [
  { match: (p) => p === '/', file: '页面1-首页-.md' },
  { match: (p) => p === '/abilities', file: '页面2-安全生产中心（能力列表）-abilities.md' },
  { match: (p) => p === '/search', file: '页面3-搜索结果-search.md' },
  { match: (p) => p.startsWith('/ability/'), file: '页面4-能力详情-ability-:id.md' },
  { match: (p) => p === '/experience', file: '页面5-知识库在线体验-experience.md' },
  { match: (p) => p === '/experience/agent', file: '页面12-智能体在线体验-experience-agent.md' },
  { match: (p) => p === '/experience/mcp', file: '页面13-AI技能在线体验-experience-mcp.md' },
  { match: (p) => p === '/experience/algorithm', file: '页面14-安全算法在线体验-experience-algorithm.md' },
  { match: (p) => p === '/ai-app', file: '页面15-AI应用-ai-app.md' },
  { match: (p) => p === '/banner', file: '页面6-Banner管理-banner.md' },
  { match: (p) => p === '/workbench', file: '页面7-开发工作台-workbench.md' },
  { match: (p) => p.startsWith('/workbench/subscriptions'), file: '页面7.1-订阅列表-workbench-subscriptions.md' },
  { match: (p) => p.startsWith('/workbench/apps'), file: '页面7.2-应用管理-workbench-apps.md' },
  { match: (p) => p.startsWith('/workbench/keys'), file: '页面7.3-API密钥管理-workbench-keys.md' },
  { match: (p) => p.startsWith('/workbench/stats'), file: '页面7.4-统计明细-workbench-stats.md' },
  { match: (p) => p === '/mcp', file: '页面8-AI技能中心-mcp.md' },
  { match: (p) => p === '/docs', file: '页面9-文档支持-docs.md' },
  { match: (p) => p === '/console', file: '页面10-控制台入口-console.md' },
  { match: (p) => p === '/system', file: '页面16-系统设置-system.md' },
]

function resolvePrdFile(pathname: string) {
  const hit = ROUTE_PRD_MAP.find((x) => x.match(pathname))
  return hit?.file ?? ''
}

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight(str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return '<pre class="mb-4 overflow-auto rounded-xl bg-slate-900 p-4 text-xs text-slate-100"><code>' +
          hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
          '</code></pre>'
      } catch (__) { /* empty */ }
    }
    return '<pre class="mb-4 overflow-auto rounded-xl bg-slate-900 p-4 text-xs text-slate-100"><code>' +
      md.utils.escapeHtml(str) + '</code></pre>'
  },
})

const route = useRoute()
const open = ref(false)
const content = ref('')
const loading = ref(false)
const error = ref('')

const prdFile = computed(() => resolvePrdFile(route.path))
const loaderKey = computed(() => prdFile.value ? `../../prd_docs/${prdFile.value}` : '')

const renderedHtml = computed(() => content.value ? md.render(content.value) : '')

watch([() => open.value, loaderKey], ([isOpen, key]) => {
  if (!isOpen) return
  if (!key || !prdLoaders[key]) {
    content.value = ''
    error.value = '未找到该页面对应的 PRD 文件。'
    loading.value = false
    return
  }
  loading.value = true
  error.value = ''
  prdLoaders[key]()
    .then((text) => { content.value = text })
    .catch(() => { error.value = 'PRD 加载失败，请检查文件路径或权限。'; content.value = '' })
    .finally(() => { loading.value = false })
}, { immediate: true })

const toggle = () => { open.value = !open.value }
</script>

<template>
  <button type="button" @click="toggle" :class="cn('fixed bottom-6 right-6 z-[500] h-12 w-12 rounded-full', 'bg-gradient-to-r from-[#0098FF] to-[#006CFF] text-white', 'shadow-[0_14px_30px_rgba(0,35,90,0.22)] ring-1 ring-[#00B4FF]/55', 'transition hover:brightness-105')" aria-label="PRD">
    PRD
  </button>

  <div v-if="open" class="fixed inset-0 z-[600]">
    <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="toggle" />
    <div class="absolute right-6 top-6 bottom-6 w-full max-w-[980px] rounded-2xl border border-sky-200/70 bg-white/95 shadow-[0_30px_90px_rgba(0,35,90,0.25)]">
      <div class="flex items-center justify-between border-b border-sky-200/70 px-5 py-4">
        <div>
          <div class="text-sm font-semibold text-slate-900">PRD 预览</div>
          <div class="mt-1 text-xs text-slate-600">{{ route.path || '/' }}</div>
        </div>
        <button type="button" @click="toggle" class="inline-flex items-center gap-2 rounded-xl bg-white/80 px-3 py-2 text-xs font-semibold text-slate-900 ring-1 ring-sky-200/70 transition hover:bg-white">
          <X class="h-4 w-4" /> 关闭
        </button>
      </div>
      <div class="h-[calc(100%-60px)] overflow-auto px-5 py-4">
        <div v-if="loading" class="text-sm text-slate-600">PRD 加载中…</div>
        <div v-else-if="error" class="text-sm text-rose-600">{{ error }}</div>
        <article v-else class="prd-content text-sm leading-6 text-slate-800" v-html="renderedHtml" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.prd-content :deep(h1) {
  margin-bottom: 1rem;
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: -0.025em;
  color: #0f172a;
}
.prd-content :deep(h2) {
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: #0f172a;
}
.prd-content :deep(h3) {
  margin-top: 1rem;
  margin-bottom: 0.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: #0f172a;
}
.prd-content :deep(p) {
  margin-bottom: 0.75rem;
  font-size: 0.875rem;
  color: #1e293b;
}
.prd-content :deep(ul) {
  margin-bottom: 0.75rem;
  list-style-type: disc;
  padding-left: 1.25rem;
}
.prd-content :deep(ol) {
  margin-bottom: 0.75rem;
  list-style-type: decimal;
  padding-left: 1.25rem;
}
.prd-content :deep(li) {
  margin-bottom: 0.25rem;
}
.prd-content :deep(table) {
  width: 100%;
  text-align: left;
  font-size: 0.875rem;
  margin-bottom: 1rem;
  border-collapse: collapse;
}
.prd-content :deep(table) {
  border: 1px solid rgba(186, 230, 253, 0.7);
  border-radius: 0.75rem;
  overflow: hidden;
}
.prd-content :deep(thead) {
  background-color: #f8fafc;
  font-size: 0.75rem;
  color: #475569;
}
.prd-content :deep(th) {
  padding: 0.5rem 0.75rem;
  font-weight: 600;
  border-bottom: 1px solid rgba(186, 230, 253, 0.7);
}
.prd-content :deep(td) {
  padding: 0.5rem 0.75rem;
  vertical-align: top;
  border-bottom: 1px solid rgba(186, 230, 253, 0.4);
}
.prd-content :deep(code) {
  background-color: #f1f5f9;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  color: #1e293b;
}
.prd-content :deep(pre code) {
  background-color: transparent;
  padding: 0;
  border-radius: 0;
  font-size: inherit;
  color: inherit;
}
.prd-content :deep(blockquote) {
  margin-bottom: 0.75rem;
  border-left: 4px solid #bae6fd;
  padding-left: 0.75rem;
  color: #334155;
}
</style>
