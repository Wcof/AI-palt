<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { ABILITIES, DOMAIN_LABEL, PRICE_LABEL, type AbilityDomain } from '@/data/abilities'
import { ArrowLeft, Check } from 'lucide-vue-next'
import { trackEvent } from '@/utils/track'
import { useSubscriptionsStore } from '@/stores/subscriptions'
import SubscribeModal from '@/components/abilities/SubscribeModal.vue'

defineOptions({ name: 'AIDetail' })

const route = useRoute()
const subsStore = useSubscriptionsStore()

const ability = computed(() => ABILITIES.find(a => a.id === route.params.id))
const isSubscribed = computed(() => ability.value ? subsStore.isSubscribed(ability.value.id) : false)
const showSubscribeModal = ref(false)

const domainToType: Record<AbilityDomain, string> = { NLP: 'RAG', LLM: 'Agent', MCP: 'MCP' }

function handleSubscribe() {
  if (!ability.value) return
  subsStore.subscribe({
    id: ability.value.id, name: ability.value.name,
    type: domainToType[ability.value.domain] as any,
    provider: '极客光年 AI 平台', version: ability.value.version,
  })
  trackEvent('subscription', 'subscribe_ability', ability.value.name)
}

function experienceLink(a: typeof ability.value) {
  if (!a) return '/experience'
  if (a.domain === 'NLP') return `/experience?kb=${encodeURIComponent(a.id)}`
  if (a.domain === 'LLM') return `/experience/agent?id=${encodeURIComponent(a.id)}`
  if (a.domain === 'MCP') return `/experience/mcp?id=${encodeURIComponent(a.id)}`
  return `/experience/algorithm?id=${encodeURIComponent(a.id)}`
}
</script>

<template>
  <!-- Not found -->
  <div v-if="!ability" class="rounded-2xl border border-sky-200/70 bg-white/70 p-8">
    <div class="text-sm font-semibold text-slate-900">能力不存在</div>
    <div class="mt-2 text-xs text-slate-600">请返回能力平台重新选择。</div>
    <router-link to="/abilities" class="mt-6 inline-flex items-center gap-2 rounded-xl bg-white/70 px-4 py-2 text-sm font-semibold text-slate-900 ring-1 ring-sky-200/70 transition hover:bg-white">
      <ArrowLeft class="h-4 w-4" /> 返回能力平台
    </router-link>
  </div>

  <div v-else class="space-y-6">
    <!-- Header card -->
    <div class="rounded-2xl border border-sky-200/70 bg-white/70 p-8 shadow-[inset_0_0_0_1px_rgba(0,180,255,0.08)]">
      <div class="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div class="min-w-0">
          <div class="flex items-center gap-3">
            <span class="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(180deg,rgba(0,180,255,0.16),rgba(141,76,255,0.08))] ring-1 ring-sky-200/70">
              <component :is="ability.icon" class="h-6 w-6 text-slate-900" />
            </span>
            <div class="min-w-0">
              <h2 class="truncate text-2xl font-semibold tracking-tight text-slate-900">{{ ability.name }}</h2>
              <div class="mt-1 truncate text-sm text-slate-600">{{ ability.apiName }}</div>
            </div>
          </div>
          <p class="mt-5 max-w-[740px] text-sm leading-6 text-slate-700">{{ ability.summary }}</p>
          <div class="mt-6 flex flex-wrap gap-2">
            <span class="rounded-full bg-[#00B4FF]/18 px-3 py-1.5 text-xs text-slate-800 ring-1 ring-[#00B4FF]/35">{{ DOMAIN_LABEL[ability.domain] }}</span>
            <span class="rounded-full bg-white/70 px-3 py-1.5 text-xs text-slate-800 ring-1 ring-sky-200/70">{{ PRICE_LABEL[ability.price] }}</span>
            <span class="rounded-full bg-white/70 px-3 py-1.5 text-xs text-slate-800 ring-1 ring-sky-200/70">{{ ability.hotTag }}</span>
            <span class="rounded-full bg-white/70 px-3 py-1.5 text-xs text-slate-800 ring-1 ring-sky-200/70">{{ ability.version }}</span>
          </div>
        </div>
        <div class="flex flex-wrap items-center gap-3 md:justify-end">
          <router-link to="/abilities" class="inline-flex items-center gap-2 rounded-xl bg-white/70 px-4 py-2 text-sm font-semibold text-slate-900 ring-1 ring-sky-200/70 transition hover:bg-white"><ArrowLeft class="h-4 w-4" /> 返回列表</router-link>
          <router-link :to="`/abilities?domain=${encodeURIComponent(ability.domain)}&tags=${encodeURIComponent(ability.tags[0] ?? '')}`" class="inline-flex items-center gap-2 rounded-xl bg-white/70 px-4 py-2 text-sm font-semibold text-slate-900 ring-1 ring-sky-200/70 transition hover:bg-white">查看相似能力</router-link>
          <button v-if="isSubscribed" disabled class="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-200 cursor-not-allowed"><Check class="h-4 w-4" /> 已订阅</button>
          <button v-else @click="showSubscribeModal = true" class="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#0098FF] to-[#006CFF] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition-all hover:brightness-105 active:scale-[0.98]">订阅</button>
        </div>
      </div>
      <div class="mt-8 grid gap-4 sm:grid-cols-3">
        <div v-for="s in [{label:'调用次数',value:ability.calls.toLocaleString()},{label:'评分',value:ability.rating.toFixed(1)},{label:'标签',value:ability.tags.slice(0,3).join(' / ')||'-'}]" :key="s.label" class="rounded-2xl bg-white/70 px-4 py-4 ring-1 ring-sky-200/60">
          <div class="text-xs text-slate-600">{{ s.label }}</div>
          <div class="mt-2 text-lg font-semibold text-slate-900">{{ s.value }}</div>
        </div>
      </div>
    </div>

    <!-- API example -->
    <div class="rounded-2xl border border-sky-200/70 bg-white/70 p-6">
      <div class="flex items-center justify-between gap-3">
        <div class="text-sm font-semibold text-slate-900">接口调用示例</div>
        <router-link :to="experienceLink(ability)" @click="trackEvent('experience','click_online_experience',ability.name)" class="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#0098FF] to-[#006CFF] px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(0,35,90,0.14)] ring-1 ring-[#00B4FF]/55 transition hover:brightness-105">在线体验</router-link>
      </div>
      <div class="mt-2 text-xs text-slate-600">此演示版仅提供前端交互与样式，后续可接入真实 API。</div>
      <pre class="mt-4 overflow-auto rounded-2xl bg-slate-900 p-4 text-xs text-slate-50 ring-1 ring-sky-200/60">POST https://api.example.com/{{ ability.apiName }}
Content-Type: application/json

{
  "input": "..."
}</pre>
    </div>

    <SubscribeModal :is-open="showSubscribeModal" :ability-name="ability.name" :ability-domain="DOMAIN_LABEL[ability.domain]" @close="showSubscribeModal = false" @confirm="handleSubscribe" />
  </div>
</template>
