<script setup lang="ts">
import { Lightbulb, ShieldCheck, Sparkles, ClipboardCheck, Brain, Radar, MessageSquare, AlertTriangle } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { useSystemStore } from '@/stores/system'
import type { Prompt } from '@/stores/system'

const emit = defineEmits<{
  (e: 'select-prompt', text: string): void
}>()

const systemStore = useSystemStore()
const { prompts } = storeToRefs(systemStore)

const iconMap: Record<string, any> = {
  ShieldCheck,
  Radar,
  ClipboardCheck,
  Brain,
  MessageSquare,
  Lightbulb,
  AlertTriangle,
}

const features = [
  { id: 'multi', text: '多会话管理与快速切换', icon: Sparkles },
  { id: 'stream', text: '实时流式回复与高效互动', icon: Lightbulb },
  { id: 'local', text: '本地持久化保存对话', icon: ShieldCheck },
]
</script>

<template>
  <div class="flex h-full w-full flex-col items-center justify-center px-6 py-10">
    <div class="max-w-[860px] text-center">
      <div class="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-[11px] text-slate-700 ring-1 ring-sky-200/70">
        生产制造场景 AI 应用
        <span class="h-1.5 w-1.5 rounded-full bg-[#00B4FF]" />
      </div>
      <h2 class="mt-4 text-2xl font-semibold text-slate-900 sm:text-3xl">欢迎使用 AI 智能助手</h2>
      <p class="mt-2 text-sm text-slate-600">面向生产制造场景的AI应用，提供隐患排查、风险评估、合规检查等安全生产全流程智能支持。</p>
    </div>

    <div class="mt-8 grid w-full max-w-[980px] gap-3 sm:grid-cols-2">
      <button
        v-for="p in prompts"
        :key="p.id"
        type="button"
        @click="emit('select-prompt', p.text)"
        class="group flex items-start gap-3 rounded-2xl border border-sky-200/70 bg-white/70 px-4 py-4 text-left transition hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_12px_30px_rgba(0,35,90,0.10)]"
      >
        <span class="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[linear-gradient(180deg,rgba(0,180,255,0.16),rgba(141,76,255,0.08))] ring-1 ring-sky-200/70">
          <component :is="iconMap[p.icon] || MessageSquare" class="h-5 w-5 text-slate-900" />
        </span>
        <div class="min-w-0">
          <div class="text-sm font-semibold text-slate-900">{{ p.title }}</div>
          <div class="mt-1 text-xs text-slate-600">{{ p.description }}</div>
        </div>
      </button>
    </div>

    <div class="mt-8 flex flex-wrap items-center justify-center gap-4 rounded-2xl border border-sky-200/70 bg-white/70 px-5 py-4 text-xs text-slate-600">
      <div v-for="f in features" :key="f.id" class="inline-flex items-center gap-2">
        <component :is="f.icon" class="h-4 w-4 text-slate-500" />
        <span>{{ f.text }}</span>
      </div>
    </div>
  </div>
</template>
