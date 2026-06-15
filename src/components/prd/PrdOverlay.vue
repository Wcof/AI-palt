<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { FileText, ListChecks, X } from 'lucide-vue-next'
import MarkdownIt from 'markdown-it'
import { prdRouteMap } from '@/prd_docs/route-map'
import featureListMarkdown from '../../../docs/product/05-实施功能清单.md?raw'
import { fullFeatureMarkdown } from './fullFeatureMarkdown'

const route = useRoute()
const activePanel = ref<'prd' | 'features' | 'fullFeatures' | null>(null)
const routeHint = computed(() => route.path.replace(/^\//, '').replace(/\//g, '-'))
const html = ref('未找到该页面对应的 PRD 文件')
const md = new MarkdownIt({ html: false, linkify: true, breaks: true })
const featureHtml = computed(() => md.render(featureListMarkdown))
const fullFeatureHtml = computed(() => md.render(fullFeatureMarkdown))
const isWidePanel = computed(() => activePanel.value === 'features' || activePanel.value === 'fullFeatures')

async function loadDoc() {
  const loader = prdRouteMap[route.path]
  if (!loader) {
    html.value = '未找到该页面对应的 PRD 文件'
    return
  }
  const content = await loader()
  html.value = md.render(content)
}

watch(activePanel, (value) => {
  if (value === 'prd') loadDoc()
})

watch(() => route.path, () => {
  if (activePanel.value === 'prd') loadDoc()
})
</script>

<template>
  <div class="pointer-events-none fixed top-5 right-5 z-[360] flex items-center gap-2">
    <button type="button" class="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#0098FF] to-[#006CFF] px-4 py-2 text-xs font-semibold text-white shadow-[0_12px_30px_rgba(0,108,255,0.35)] ring-1 ring-[#00B4FF]/60 transition hover:brightness-105" @click="activePanel = activePanel === 'prd' ? null : 'prd'">
      <FileText class="h-4 w-4" />
      PRD
    </button>
    <button type="button" class="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-blue-700 shadow-[0_12px_30px_rgba(15,23,42,0.16)] ring-1 ring-blue-100 transition hover:bg-blue-50" @click="activePanel = activePanel === 'features' ? null : 'features'">
      <ListChecks class="h-4 w-4" />
      功能清单
    </button>
    <button type="button" class="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-[0_12px_30px_rgba(15,23,42,0.22)] ring-1 ring-slate-900/10 transition hover:bg-slate-800" @click="activePanel = activePanel === 'fullFeatures' ? null : 'fullFeatures'">
      <ListChecks class="h-4 w-4" />
      全量功能清单
    </button>
  </div>
  <Teleport to="body">
    <div v-if="activePanel" class="fixed inset-0 z-[361] flex justify-end bg-slate-950/30 backdrop-blur-[1px]" @mousedown.self="activePanel = null">
      <aside class="h-full w-full overflow-hidden border-l border-sky-200/70 bg-white shadow-2xl" :class="activePanel === 'fullFeatures' ? 'max-w-[min(96vw,1280px)]' : activePanel === 'features' ? 'max-w-[min(92vw,1040px)]' : 'max-w-[520px]'">
        <header class="flex items-center justify-between border-b border-sky-100 px-5 py-4">
          <div>
            <div class="text-sm font-semibold text-slate-900">{{ activePanel === 'features' ? '功能清单' : activePanel === 'fullFeatures' ? '全量功能清单' : '页面 PRD' }}</div>
            <div class="mt-0.5 text-xs text-slate-500">{{ activePanel === 'features' ? '排序原则与功能项总表' : activePanel === 'fullFeatures' ? '商业化、账号、多租户、助手质量、工具、模型、审计、容灾全量范围' : `路由标识：${routeHint || 'home'}` }}</div>
          </div>
          <button type="button" class="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700" @click="activePanel = null">
            <X class="h-4 w-4" />
          </button>
        </header>
        <div class="h-[calc(100%-65px)] overflow-y-auto" :class="activePanel === 'fullFeatures' ? 'bg-slate-50 p-6' : 'p-5'">
          <article
            class="prose prose-sm max-w-none rounded-2xl border border-sky-100 bg-white p-4 prose-headings:text-slate-900 prose-p:text-slate-700 prose-li:text-slate-700 prose-strong:text-slate-900 prose-table:text-xs prose-th:whitespace-nowrap prose-td:align-top"
            :class="[isWidePanel ? 'overflow-x-auto' : '', activePanel === 'fullFeatures' ? 'full-feature-article shadow-sm ring-1 ring-slate-100' : '']"
            v-html="activePanel === 'features' ? featureHtml : activePanel === 'fullFeatures' ? fullFeatureHtml : html"
          />
        </div>
      </aside>
    </div>
  </Teleport>
</template>

<style scoped>
.full-feature-article {
  padding: 0;
  border-color: #dbeafe;
}

.full-feature-article :deep(h1) {
  margin: 0;
  padding: 20px 24px 6px;
  font-size: 18px;
  line-height: 28px;
}

.full-feature-article :deep(p) {
  margin: 12px 24px 18px;
  border: 1px solid #bfdbfe;
  border-radius: 14px;
  background: #eff6ff;
  padding: 12px 14px;
  color: #1e3a8a;
  font-size: 13px;
  line-height: 22px;
}

.full-feature-article :deep(table) {
  margin: 0;
  min-width: 1420px;
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 12px;
  line-height: 18px;
}

.full-feature-article :deep(thead th) {
  position: sticky;
  top: 0;
  z-index: 2;
  border-top: 1px solid #e2e8f0;
  border-bottom: 1px solid #cbd5e1;
  background: #f8fafc;
  color: #334155;
  font-weight: 700;
}

.full-feature-article :deep(th),
.full-feature-article :deep(td) {
  border-right: 1px solid #e2e8f0;
  border-bottom: 1px solid #e2e8f0;
  padding: 11px 12px;
  vertical-align: top;
  white-space: normal;
}

.full-feature-article :deep(th:first-child),
.full-feature-article :deep(td:first-child) {
  position: sticky;
  left: 0;
  z-index: 1;
  width: 76px;
  min-width: 76px;
  border-left: 1px solid #e2e8f0;
  background: #fff;
  color: #2563eb;
  font-weight: 700;
}

.full-feature-article :deep(thead th:first-child) {
  z-index: 3;
  background: #f8fafc;
}

.full-feature-article :deep(th:nth-child(2)),
.full-feature-article :deep(td:nth-child(2)) {
  width: 110px;
  min-width: 110px;
}

.full-feature-article :deep(th:nth-child(3)),
.full-feature-article :deep(td:nth-child(3)) {
  width: 150px;
  min-width: 150px;
}

.full-feature-article :deep(th:nth-child(4)),
.full-feature-article :deep(td:nth-child(4)),
.full-feature-article :deep(th:nth-child(9)),
.full-feature-article :deep(td:nth-child(9)) {
  width: 82px;
  min-width: 82px;
  text-align: center;
}

.full-feature-article :deep(th:nth-child(5)),
.full-feature-article :deep(td:nth-child(5)) {
  width: 280px;
  min-width: 280px;
}

.full-feature-article :deep(th:nth-child(6)),
.full-feature-article :deep(td:nth-child(6)) {
  width: 240px;
  min-width: 240px;
}

.full-feature-article :deep(th:nth-child(7)),
.full-feature-article :deep(td:nth-child(7)),
.full-feature-article :deep(th:nth-child(8)),
.full-feature-article :deep(td:nth-child(8)) {
  width: 210px;
  min-width: 210px;
}

.full-feature-article :deep(tbody tr:nth-child(even) td) {
  background: #f8fafc;
}

.full-feature-article :deep(tbody tr:hover td) {
  background: #eff6ff;
}

.full-feature-article :deep(code) {
  border-radius: 6px;
  background: #f1f5f9;
  padding: 2px 5px;
  color: #0f172a;
  font-size: 11px;
}
</style>
