<script setup lang="ts">
import { Boxes, ChartColumn, KeyRound } from 'lucide-vue-next'
import { cn } from '@/lib/utils'

defineOptions({ name: 'WorkbenchLayout' })

const tabs = [
  { label: '项目管理', to: '/workbench/apps', Icon: Boxes },
  { label: '密钥管理', to: '/workbench/keys', Icon: KeyRound },
  { label: '统计明细 / 用量概览', to: '/workbench/stats', Icon: ChartColumn },
]
</script>

<template>
  <div class="space-y-4">
    <div class="rounded-2xl border border-sky-200/70 bg-white/70 px-6 py-5 shadow-[inset_0_0_0_1px_rgba(0,180,255,0.08)]">
      <div class="text-base font-semibold text-slate-900">开发者工作台</div>
      <div class="mt-1 text-xs text-slate-600">统一密钥与统计入口：项目管理、密钥授权（技能/知识库/智能体）和调用用量明细集中在这里。</div>
      <div class="mt-4 flex flex-wrap gap-2">
        <router-link v-for="t in tabs" :key="t.to" :to="t.to" :class="cn('inline-flex items-center gap-2 rounded-xl bg-white/70 px-3 py-2 text-sm font-semibold text-slate-900 ring-1 ring-sky-200/70 transition hover:bg-white', $route.path === t.to && 'bg-[#00B4FF]/14 ring-[#00B4FF]/35')">
          <component :is="t.Icon" class="h-4 w-4" />
          {{ t.label }}
        </router-link>
      </div>
    </div>
    <router-view />
  </div>
</template>
