<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import AbilityCard from '@/components/abilities/AbilityCard.vue'
import BrowserHeader from '@/components/abilities/browser/BrowserHeader.vue'
import FilterCard from '@/components/abilities/browser/FilterCard.vue'
import FilterChips from '@/components/abilities/browser/FilterChips.vue'
import KeywordBar from '@/components/abilities/browser/KeywordBar.vue'
import EmptyState from '@/components/abilities/browser/EmptyState.vue'
import Pager from '@/components/abilities/browser/Pager.vue'
import { cn } from '@/lib/utils'
import { getKeywordFromUrl, setKeywordToUrl } from '@/utils/search'
import { filterAbilities, getAllTags, parseDomain, parseHot, parseMode, parseSort, parseTags } from '@/utils/abilityQuery'
import type { ListMode } from '@/components/abilities/browser/ModeSwitch.vue'
import type { SortKey } from '@/utils/abilityQuery'

const props = defineProps<{ variant: 'abilities' | 'search' }>()
const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const q = computed(() => route.query)
const keyword = computed(() => getKeywordFromUrl(new URLSearchParams(route.fullPath.split('?')[1] || '')))
const domainRaw = computed(() => (q.value.domain as string) ?? null)
const entry = computed(() => (q.value.entry as string) ?? null)
const domain = computed(() => parseDomain(domainRaw.value))
const hot = computed(() => parseHot((q.value.hot as string) ?? null))
const sort = computed(() => parseSort((q.value.sort as string) ?? null))
const mode = computed(() => parseMode((q.value.mode as string) ?? null) as ListMode)
const tags = computed(() => parseTags((q.value.tags as string) ?? null))
const pageFromUrl = computed(() => Math.max(1, Number(q.value.page ?? '1') || 1))

const infinitePage = ref(1)
const sentinelRef = ref<HTMLDivElement | null>(null)
const keywordDraft = ref(keyword.value)

const pageSize = 12
const filtered = computed(() => filterAbilities({ keyword: keyword.value, domain: domain.value, hot: hot.value, tags: tags.value, sort: sort.value }))
const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize)))
const page = computed(() => mode.value === 'paged' ? Math.min(pageFromUrl.value, totalPages.value) : infinitePage.value)
const visible = computed(() => filtered.value.slice(0, page.value * pageSize))

watch([domain, hot, keyword, sort, tags], () => { infinitePage.value = 1 })
watch(keyword, (v) => { keywordDraft.value = v })

let io: IntersectionObserver | null = null
watch([mode, sentinelRef, totalPages], () => {
  io?.disconnect()
  if (mode.value !== 'infinite' || !sentinelRef.value) return
  io = new IntersectionObserver((entries) => {
    if (entries.some(e => e.isIntersecting)) infinitePage.value = Math.min(totalPages.value, infinitePage.value + 1)
  }, { rootMargin: '240px' })
  io.observe(sentinelRef.value)
}, { immediate: true })
onUnmounted(() => io?.disconnect())

function setParam(key: string, value: string | null) {
  const next = { ...route.query }
  if (!value) delete next[key]; else next[key] = value
  if (key !== 'page') delete next.page
  router.replace({ query: next })
}

function resetAll() {
  if (props.variant === 'search' && keyword.value) {
    const next = setKeywordToUrl(new URLSearchParams(), keyword.value)
    const obj: Record<string, string> = {}
    next.forEach((v, k) => { obj[k] = v })
    router.replace({ query: obj })
    return
  }
  router.replace({ query: {} })
}

function setKeyword(value: string) {
  const sp = new URLSearchParams(route.fullPath.split('?')[1] || '')
  const next = setKeywordToUrl(sp, value)
  next.delete('page')
  const obj: Record<string, string> = {}
  next.forEach((v, k) => { obj[k] = v })
  router.replace({ query: obj })
}

const navDomainTitle = computed(() => {
  if (entry.value !== 'nav') return null
  const m: Record<string, string> = { NLP: 'AI知识库', LLM: 'AI 智能体', MCP: 'AI 技能' }
  return m[domainRaw.value ?? ''] ?? null
})

const navDomainDesc = computed(() => {
  if (entry.value !== 'nav') return null
  const m: Record<string, string> = {
    NLP: '汇聚安全生产法规、操作规程、事故案例与隐患排查标准，支持全领域智能问答与合规检索。',
    LLM: '面向安全生产的智能问答与合规助手，提供事件分析、整改跟踪与应急处置智能支持。',
    MCP: '聚焦安全生产场景，提供 NL2SQL 数据智能查询与 AI 视觉隐患识别两大核心 AI 技能。',
  }
  return m[domainRaw.value ?? ''] ?? null
})

const title = computed(() => props.variant === 'search' ? '搜索结果' : navDomainTitle.value ?? t('abilities.list.title'))
const desc = computed(() =>
  props.variant === 'search'
    ? '支持隐患、三违、作业票、应急等安全场景关键词检索与多维筛选，结果与 URL 参数实时同步。'
    : navDomainDesc.value ?? t('abilities.market.desc')
)

watch(title, (v) => { if (props.variant === 'abilities') document.title = v }, { immediate: true })

const allTags = getAllTags()
</script>

<template>
  <div class="space-y-6">
    <BrowserHeader
      :title="title" :desc="desc" :mode="mode" :sort="sort"
      :keyword="variant === 'search' ? keyword : ''"
      @mode-change="setParam('mode', $event)"
      @sort-change="setParam('sort', $event)"
      @reset="resetAll"
    />

    <div class="grid gap-5 md:grid-cols-[280px_1fr]">
      <aside class="space-y-4">
        <FilterCard title="搜索">
          <div class="space-y-2">
            <input v-model="keywordDraft" @keydown.enter="setKeyword(keywordDraft)" placeholder="搜索能力名称 / 描述 / 标签" class="w-full rounded-xl border border-sky-200/70 bg-white/80 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[#00B4FF]/55" />
            <div class="flex items-center gap-2">
              <button type="button" @click="setKeyword(keywordDraft)" class="rounded-lg bg-gradient-to-r from-[#0098FF] to-[#006CFF] px-3 py-2 text-xs font-semibold text-white ring-1 ring-[#00B4FF]/55 transition hover:brightness-105">搜索</button>
              <button type="button" @click="setKeyword('')" class="rounded-lg bg-white/80 px-3 py-2 text-xs font-semibold text-slate-900 ring-1 ring-sky-200/70 transition hover:bg-white">清空</button>
            </div>
          </div>
        </FilterCard>

        <FilterCard title="领域">
          <FilterChips :options="[{value:'',label:'全部'},{value:'NLP',label:'AI知识库'},{value:'LLM',label:'AI 智能体'},{value:'MCP',label:'AI 技能'}]" :model-value="domain ?? ''" @update:model-value="setParam('domain', $event || null)" />
        </FilterCard>

        <FilterCard title="热度">
          <FilterChips :options="[{value:'',label:'全部'},{value:'本周新增',label:'本周新增'},{value:'热门',label:'热门'},{value:'企业推荐',label:'企业推荐'},{value:'稳定',label:'稳定'}]" :model-value="hot ?? ''" @update:model-value="setParam('hot', $event || null)" />
        </FilterCard>

        <FilterCard title="标签">
          <div class="flex flex-wrap gap-2">
            <button v-for="tag in allTags" :key="tag" type="button" @click="setParam('tags', (tags.includes(tag) ? tags.filter(x => x !== tag) : [...tags, tag]).join(',') || null)" :class="cn('rounded-full px-3 py-1.5 text-xs ring-1 transition', tags.includes(tag) ? 'bg-[#00B4FF]/18 text-slate-900 ring-[#00B4FF]/35 hover:bg-[#00B4FF]/22' : 'bg-white/70 text-slate-700 ring-sky-200/70 hover:bg-white')">{{ tag }}</button>
          </div>
        </FilterCard>
      </aside>

      <section>
        <KeywordBar v-if="variant === 'search'" :keyword="keyword" @submit="setKeyword" />

        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AbilityCard v-for="a in visible" :key="a.id" :ability="a" variant="list" :highlight-query="variant === 'search' ? keyword : ''" />
        </div>

        <EmptyState v-if="!visible.length" @reset="resetAll" />

        <Pager :mode="mode" :page="page" :total-pages="totalPages" :total="filtered.length" @prev="setParam('page', String(Math.max(1, page - 1)))" @next="setParam('page', String(Math.min(totalPages, page + 1)))" @load-more="infinitePage = Math.min(totalPages, infinitePage + 1)" />

        <div v-if="mode === 'infinite'" ref="sentinelRef" class="h-1" />
      </section>
    </div>
  </div>
</template>
