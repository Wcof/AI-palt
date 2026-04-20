<script setup lang="ts">
import { ABILITIES } from '@/data/abilities'
import GlobalSearch from '@/components/search/GlobalSearch.vue'
import HeroCarousel from '@/components/carousel/HeroCarousel.vue'
import StatsPanel from '@/components/dashboard/StatsPanel.vue'
import AbilityFloors from '@/components/abilities/AbilityFloors.vue'
import { ArrowRight } from 'lucide-vue-next'

defineOptions({ name: 'HomeIndex' })

const hotLinks = [
  { label: 'EHS', to: '/search?keyword=ehs' },
  { label: '隐患识别', to: '/search?keyword=隐患识别' },
  { label: '智能巡检', to: '/search?keyword=巡检' },
  { label: '事故预警', to: '/search?keyword=预警' },
]
</script>

<template>
  <div class="space-y-10">
    <HeroCarousel class="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen -mt-24" />

    <section class="relative overflow-hidden rounded-2xl border border-sky-200/70 bg-white/70 p-8 shadow-[inset_0_0_0_1px_rgba(0,180,255,0.10)] backdrop-blur">
      <div class="absolute inset-0 bg-[radial-gradient(closest-side_at_20%_20%,rgba(0,180,255,0.18),transparent_65%),radial-gradient(closest-side_at_75%_35%,rgba(141,76,255,0.12),transparent_60%)]" />
      <div class="relative">
        <div class="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
          <div class="max-w-[680px]">
            <div class="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs text-slate-700 ring-1 ring-sky-200/70">
              高端安全生产 AI · 能力平台
              <span class="h-1.5 w-1.5 rounded-full bg-[#00B4FF]" />
            </div>
            <h1 class="mt-5 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">专注安全生产的高可信 AI 平台</h1>
            <p class="mt-4 text-sm leading-6 text-slate-700 sm:text-base">围绕隐患排查、三违识别、作业票审核、事故复盘与应急联动场景，提供 AI 安全算法、AI知识库、AI 智能体与 AI 技能一体化能力，助力企业实现安全生产智能化升级。</p>
          </div>
          <div class="w-full max-w-[760px] lg:shrink-0">
            <GlobalSearch :abilities="ABILITIES" class="w-full sm:min-w-[600px]" />
            <div class="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-600">
              <span>热门：</span>
              <router-link v-for="x in hotLinks" :key="x.label" :to="x.to" class="rounded-full bg-white/70 px-3 py-1.5 text-slate-700 ring-1 ring-sky-200/70 transition hover:bg-white">{{ x.label }}</router-link>
            </div>
          </div>
        </div>

        <div class="mt-8"><StatsPanel /></div>

        <div class="mt-6 flex items-center justify-between">
          <div class="text-xs text-slate-600">面向高风险行业的能力聚合入口，覆盖"风险识别-合规治理-应急处置"全链路 AI 服务。</div>
          <router-link to="/abilities" class="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#0098FF] to-[#006CFF] px-4 py-2 text-xs font-semibold text-white shadow-[0_10px_24px_rgba(0,35,90,0.14)] ring-1 ring-[#00B4FF]/55 transition hover:brightness-105">
            进入能力平台
            <ArrowRight class="h-4 w-4" />
          </router-link>
        </div>
      </div>
    </section>

    <AbilityFloors />
  </div>
</template>
