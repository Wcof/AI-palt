<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ABILITIES, DOMAIN_LABEL, type AbilityDomain } from '@/data/abilities'
import HomeAbilityCard from '@/components/abilities/home/HomeAbilityCard.vue'

type Floor = { domain: AbilityDomain; title: string; desc: string; pickIds: string[] }

const loading = ref(true)
onMounted(() => { setTimeout(() => loading.value = false, 260) })

const floors: Floor[] = [
  { domain: 'NLP', title: 'AI知识库', desc: '汇聚安全生产法规、操作规程、事故案例与隐患排查标准，支持全领域智能问答与合规检索。', pickIds: ['kb-safety-production'] },
  { domain: 'LLM', title: DOMAIN_LABEL.LLM, desc: '面向安全生产的智能问答与合规助手，提供事件分析、整改跟踪与应急处置智能支持。', pickIds: ['llm-ehs-api'] },
  { domain: 'MCP', title: DOMAIN_LABEL.MCP, desc: '聚焦安全生产场景，提供 NL2SQL 数据智能查询与 AI 视觉隐患识别两大核心 AI 技能。', pickIds: ['mcp-nl2sql', 'mcp-hazard-detection'] },
]

const abilitiesById = computed(() => new Map(ABILITIES.map(a => [a.id, a])))

const hotByDomain = (domain: AbilityDomain) =>
  ABILITIES.filter(a => a.domain === domain).sort((a, b) => b.calls - a.calls).slice(0, 5)
</script>

<template>
  <section class="space-y-8">
    <div class="flex items-end justify-between">
      <div>
        <h2 class="text-2xl font-semibold tracking-tight text-slate-900">安全能力楼层</h2>
        <p class="mt-2 text-sm text-slate-600">围绕隐患排查、合规治理与应急联动，快速定位可落地的 AI 安全算法与智能服务能力。</p>
      </div>
      <router-link to="/abilities" class="hidden rounded-xl bg-white/70 px-4 py-2 text-sm font-semibold text-slate-900 ring-1 ring-sky-200/70 transition hover:bg-white sm:inline-flex">查看全部</router-link>
    </div>

    <div class="space-y-6">
      <section v-for="f in floors" :key="f.domain" class="rounded-2xl border border-sky-200/70 bg-white/70 p-6 shadow-[inset_0_0_0_1px_rgba(0,180,255,0.08)]">
        <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div class="text-lg font-semibold text-slate-900">{{ f.title }}</div>
            <div class="mt-2 text-sm leading-6 text-slate-600">{{ f.desc }}</div>
          </div>
          <router-link :to="`/abilities?domain=${encodeURIComponent(f.domain)}`" class="inline-flex w-fit shrink-0 rounded-xl bg-white/70 px-3 py-2 text-xs font-semibold text-slate-900 ring-1 ring-sky-200/70 transition hover:bg-white">查看全部</router-link>
        </div>

        <div class="mt-6 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <!-- Loading skeleton -->
          <template v-if="loading">
            <div class="grid auto-rows-fr grid-cols-2 gap-3 sm:gap-4">
              <div v-for="i in 4" :key="i" class="animate-pulse rounded-2xl border border-sky-200/70 bg-white/50 p-4 h-full">
                <div class="h-9 w-9 rounded-xl bg-slate-200" />
                <div class="mt-3 h-4 w-2/3 rounded bg-slate-200" />
                <div class="mt-2 h-3 w-full rounded bg-slate-100" />
              </div>
            </div>
          </template>

          <!-- Loaded content -->
          <template v-else>
            <div class="grid auto-rows-fr grid-cols-2 gap-3 sm:gap-4">
              <template v-for="id in f.pickIds.slice(0, 4)" :key="id">
                <HomeAbilityCard v-if="abilitiesById.get(id)" :ability="abilitiesById.get(id)!" class="h-full" />
              </template>
            </div>

            <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 lg:grid-rows-2">
              <!-- Hot rank card -->
              <div class="h-full min-h-[214px] rounded-2xl border border-sky-200/70 bg-white/70 p-4">
                <div class="text-xs font-semibold text-slate-900">热门能力榜</div>
                <div class="mt-3 space-y-2">
                  <router-link v-for="(a, i) in hotByDomain(f.domain)" :key="a.id" :to="`/ability/${a.id}`" class="flex items-center gap-2 text-xs text-slate-700 hover:text-slate-900 transition">
                    <span class="inline-flex h-5 w-5 items-center justify-center rounded-md bg-[#00B4FF]/12 text-[10px] font-semibold text-[#0098FF]">{{ i + 1 }}</span>
                    <span class="truncate">{{ a.name }}</span>
                    <span class="ml-auto shrink-0 text-slate-400">{{ a.calls.toLocaleString() }}</span>
                  </router-link>
                </div>
              </div>
              <!-- Recommend card -->
              <div class="h-full min-h-[214px] rounded-2xl border border-sky-200/70 bg-gradient-to-br from-[#00B4FF]/8 to-[#8D4CFF]/6 p-4">
                <div class="text-xs font-semibold text-slate-900">推荐场景</div>
                <div class="mt-3 text-xs leading-5 text-slate-600">
                  基于 {{ DOMAIN_LABEL[f.domain] }} 能力，可快速构建隐患排查、合规审查与应急联动等安全生产场景。
                </div>
                <router-link :to="`/abilities?domain=${f.domain}`" class="mt-4 inline-flex rounded-xl bg-white/80 px-3 py-1.5 text-xs font-semibold text-slate-900 ring-1 ring-sky-200/70 transition hover:bg-white">了解更多</router-link>
              </div>
            </div>
          </template>
        </div>
      </section>
    </div>
  </section>
</template>
