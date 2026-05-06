<script setup lang="ts">
import { computed, watch } from 'vue'
import type { Ability } from '@/data/abilities'
import { DOMAIN_LABEL, PRICE_LABEL } from '@/data/abilities'
import { X } from 'lucide-vue-next'

const props = defineProps<{ open: boolean; ability: Ability | null }>()
const emit = defineEmits<{ close: [] }>()

const DOMAIN_HINTS: Record<string, { title: string; input: string; output: string; scene: string }> = {
  NLP: { title: '知识库体验说明', input: '输入安全生产法规、操作规程、事故案例等相关问题。', output: '返回匹配条款、摘要要点与引用来源。', scene: '适用于制度对标、合规审查、隐患判定问答等场景。' },
  LLM: { title: 'EHS 智能体说明', input: '输入任务指令，例如"生成隐患治理整改清单"。', output: '返回步骤化方案、待办清单与风险提示。', scene: '适用于巡检值守、事件复盘、应急处置协同。' },
  MCP: { title: 'AI 技能调用说明', input: '输入自然语言查询或选择目标数据库 / 作业场景。', output: '返回 SQL 查询结果、隐患识别报告与整改建议。', scene: '适用于安全数据查询、现场隐患识别与自动化流程。' },
}

const hint = computed(() => props.ability ? DOMAIN_HINTS[props.ability.domain] ?? null : null)

watch(() => props.open, (v) => {
  if (!v) return
  document.documentElement.style.overflow = 'hidden'
  document.body.style.overflow = 'hidden'
  return () => { document.documentElement.style.overflow = ''; document.body.style.overflow = '' }
})
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-[320] flex items-center justify-center overscroll-contain bg-blue-950/25 backdrop-blur-sm p-4" role="dialog" aria-modal="true" @mousedown.self="emit('close')">
    <div class="w-full max-w-[860px] overflow-hidden rounded-2xl border border-sky-200/60 bg-white/90 shadow-2xl">
      <div class="flex items-start justify-between gap-3 border-b border-sky-200/60 px-5 py-4">
        <div class="min-w-0">
          <div class="truncate text-base font-semibold text-slate-900">能力预览</div>
          <div class="mt-1 truncate text-xs text-slate-600">{{ ability ? `${DOMAIN_LABEL[ability.domain]} · ${ability.name}` : '选择左侧条目查看能力详情' }}</div>
        </div>
        <button type="button" @click="emit('close')" class="rounded-xl bg-white/70 p-2 text-slate-700 ring-1 ring-sky-200/70 transition hover:bg-white"><X class="h-4 w-4" /></button>
      </div>
      <div class="max-h-[72vh] overflow-auto px-5 py-4">
        <template v-if="ability && hint">
          <div class="rounded-2xl bg-white/70 px-4 py-4 ring-1 ring-sky-200/70">
            <div class="flex flex-wrap items-center gap-2">
              <span class="rounded-full bg-[#00B4FF]/18 px-3 py-1.5 text-xs text-slate-800 ring-1 ring-[#00B4FF]/35">{{ DOMAIN_LABEL[ability.domain] }}</span>
              <span class="rounded-full bg-white/70 px-3 py-1.5 text-xs text-slate-800 ring-1 ring-sky-200/70">{{ PRICE_LABEL[ability.price] }}</span>
              <span class="rounded-full bg-white/70 px-3 py-1.5 text-xs text-slate-800 ring-1 ring-sky-200/70">{{ ability.hotTag }}</span>
              <span class="rounded-full bg-white/70 px-3 py-1.5 text-xs text-slate-800 ring-1 ring-sky-200/70">{{ ability.version }}</span>
            </div>
            <div class="mt-3 text-sm font-semibold text-slate-900">{{ ability.name }}</div>
            <div class="mt-1 text-xs text-slate-600">{{ ability.summary }}</div>
          </div>
          <div class="mt-4 grid gap-3 md:grid-cols-2">
            <div class="rounded-2xl bg-white/70 px-4 py-4 ring-1 ring-sky-200/70"><div class="text-xs font-semibold text-slate-900">{{ hint.title }}</div><div class="mt-2 text-xs text-slate-600">{{ hint.scene }}</div></div>
            <div class="rounded-2xl bg-white/70 px-4 py-4 ring-1 ring-sky-200/70"><div class="text-xs font-semibold text-slate-900">输入示例</div><div class="mt-2 text-xs text-slate-600">{{ hint.input }}</div></div>
            <div class="rounded-2xl bg-white/70 px-4 py-4 ring-1 ring-sky-200/70 md:col-span-2"><div class="text-xs font-semibold text-slate-900">输出示例</div><div class="mt-2 text-xs text-slate-600">{{ hint.output }}</div></div>
          </div>
          <div class="mt-4">
            <div class="text-xs font-semibold text-slate-900">能力标签</div>
            <div class="mt-2 flex flex-wrap gap-1.5">
              <span v-for="t in ability.tags" :key="t" class="rounded-full bg-[#00B4FF]/12 px-2 py-0.5 text-[11px] text-slate-700 ring-1 ring-[#00B4FF]/25">{{ t }}</span>
            </div>
          </div>
        </template>
        <div v-else class="rounded-2xl border border-dashed border-sky-200/70 bg-white/50 px-4 py-10 text-center text-sm text-slate-600">选择左侧条目后在此处查看能力详情</div>
      </div>
    </div>
  </div>
</template>
