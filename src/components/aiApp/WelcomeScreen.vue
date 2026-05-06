<script setup lang="ts">
import { computed, ref } from 'vue'
import { Lightbulb, ShieldCheck, ClipboardCheck, Brain, Radar, MessageSquare, AlertTriangle, Activity, Database, FileText, BookOpen, ShieldAlert, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import type { AgentOption, AgentType } from '@/stores/aiApp'
import { storeToRefs } from 'pinia'
import { useSystemStore } from '@/stores/system'

const props = defineProps<{
  agents: AgentOption[]
  selectedAgent: AgentType
  agentFocused: boolean
}>()

const emit = defineEmits<{
  (e: 'select-prompt', text: string): void
  (e: 'change-agent', agentType: AgentType): void
}>()

const systemStore = useSystemStore()
const { prompts } = storeToRefs(systemStore)
const carouselIndex = ref(0)

const iconMap: Record<string, any> = {
  ShieldCheck,
  ClipboardCheck,
  Brain,
  Radar,
  MessageSquare,
  Lightbulb,
  AlertTriangle,
}

const agentIconMap: Record<AgentType, any> = {
  general: MessageSquare,
  nl2sql: Database,
  report: FileText,
  meeting: MessageSquare,
  document: FileText,
  hazard: ShieldAlert,
  rag: BookOpen,
}

const selectedAgentName = computed(() => props.agents.find(agent => agent.id === props.selectedAgent)?.name || '通用助手')

const visibleAgentCards = computed(() => {
  const list = props.agents
  if (list.length <= 3) return list
  return Array.from({ length: Math.min(3, list.length) }, (_, idx) => list[(carouselIndex.value + idx) % list.length])
})

function nextAgents() {
  if (!props.agents.length) return
  carouselIndex.value = (carouselIndex.value + 1) % props.agents.length
}

function prevAgents() {
  if (!props.agents.length) return
  carouselIndex.value = (carouselIndex.value - 1 + props.agents.length) % props.agents.length
}
</script>

<template>
  <div class="relative flex h-full w-full flex-col items-center justify-center overflow-hidden px-4 py-6 sm:px-6 lg:px-8 xl:px-10">
    <div class="pointer-events-none absolute left-[7%] top-[8%] hidden h-28 w-28 rotate-6 rounded-[30px] border border-white/60 bg-white/40 shadow-[0_24px_70px_rgba(37,99,235,0.14)] md:block" />
    <div class="pointer-events-none absolute right-[5%] top-[15%] hidden h-40 w-40 -rotate-12 rounded-[42px] border border-cyan-100 bg-cyan-100/30 shadow-[0_30px_90px_rgba(14,165,233,0.18)] lg:block" />

    <div class="relative w-full max-w-[980px] text-center">
      <div class="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/75 px-3 py-1 text-[11px] font-semibold text-blue-700 shadow-sm backdrop-blur-xl">
        <Activity class="h-3.5 w-3.5" />
        {{ systemStore.displayName || '极客光年安全大模型' }}
        <span class="h-1.5 w-1.5 rounded-full bg-emerald-500" />
      </div>
      <h2 class="mt-5 text-[clamp(32px,5vw,58px)] font-semibold tracking-tight text-slate-950">
        极客光年安全大模型
      </h2>
      <p class="mx-auto mt-3 max-w-[760px] text-sm leading-7 text-slate-600 sm:text-base">
        面向安全生产场景，将报告编写、智能问数、知识库检索与业务 Agent 统一收敛到一个对话工作台。
      </p>
    </div>

    <div class="relative mt-8 grid w-full max-w-[min(980px,calc(100vw-32px))] gap-3 sm:grid-cols-2">
      <button
        v-for="p in prompts"
        :key="p.id"
        type="button"
        @click="emit('select-prompt', p.text)"
        class="group flex min-h-[92px] items-start gap-3 rounded-[24px] border border-white/70 bg-white/75 px-4 py-4 text-left shadow-[0_20px_50px_rgba(37,99,235,0.08)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white"
      >
        <span class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-400 text-white shadow-[0_12px_30px_rgba(37,99,235,0.25)]">
          <component :is="iconMap[p.icon] || MessageSquare" class="h-5 w-5" />
        </span>
        <div class="min-w-0">
          <div class="text-sm font-semibold text-slate-950">{{ p.title }}</div>
          <div class="mt-1 text-xs leading-5 text-slate-600">{{ p.description }}</div>
        </div>
      </button>
    </div>

    <div class="relative mt-8 w-[min(1240px,calc(100vw-32px))] max-w-none">
      <div class="mb-3 flex items-end justify-between gap-3 px-1">
        <div class="text-left">
          <div class="text-sm font-semibold text-slate-950">选择 Agent 开始</div>
          <div class="mt-0.5 text-xs text-slate-500">
            {{ props.agentFocused ? '当前聚焦：' + selectedAgentName : '未聚焦 Agent' }}。点击卡片即可聚焦；输入框上方标签右侧 × 可取消。
          </div>
        </div>
        <div class="hidden text-[11px] text-slate-400 sm:block">左右轮播查看更多应用</div>
      </div>

      <div class="relative flex min-h-[190px] items-stretch gap-3">
        <button
          type="button"
          class="carousel-btn left-0"
          title="上一组 Agent"
          @click="prevAgents"
        >
          <ChevronLeft class="h-5 w-5" />
        </button>

        <div class="grid min-w-0 flex-1 auto-rows-[178px] gap-4 md:grid-cols-3">
          <button
            v-for="agent in visibleAgentCards"
            :key="agent.id"
            type="button"
            :class="[
              'group relative h-[178px] overflow-hidden rounded-[30px] border px-5 py-5 text-left backdrop-blur-xl transition hover:-translate-y-0.5',
              props.agentFocused && props.selectedAgent === agent.id
                ? 'border-blue-300 bg-white shadow-[0_28px_76px_rgba(37,99,235,0.20)] ring-2 ring-blue-200/70'
                : 'border-white/75 bg-white/75 shadow-[0_18px_50px_rgba(37,99,235,0.10)] hover:bg-white'
            ]"
            @click="emit('change-agent', agent.id)"
          >
            <span class="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-[36px] bg-blue-100/60 blur-xl transition group-hover:bg-cyan-100" />
            <div class="relative flex items-start justify-between gap-4">
              <span
                :class="[
                  'inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-[0_14px_32px_rgba(15,23,42,0.16)]',
                  props.agentFocused && props.selectedAgent === agent.id ? 'bg-gradient-to-br from-blue-600 to-cyan-400' : 'bg-blue-600'
                ]"
              >
                <component :is="agentIconMap[agent.id]" class="h-5 w-5" />
              </span>
              <span class="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700 ring-1 ring-blue-100">
                <CheckCircle2 v-if="props.agentFocused && props.selectedAgent === agent.id" class="h-3 w-3 text-blue-600" />
                /{{ agent.id }}
              </span>
            </div>
            <div class="relative mt-5">
              <div class="text-base font-semibold text-slate-950">{{ agent.name }}</div>
              <div class="mt-1 inline-flex rounded-full bg-white/80 px-2 py-0.5 text-[11px] font-semibold text-blue-700 ring-1 ring-blue-100">{{ agent.badge }}</div>
              <div class="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{{ agent.desc }}</div>
            </div>
          </button>
        </div>

        <button
          type="button"
          class="carousel-btn right-0"
          title="下一组 Agent"
          @click="nextAgents"
        >
          <ChevronRight class="h-5 w-5" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.carousel-btn {
  display: inline-flex;
  width: 44px;
  flex: 0 0 44px;
  align-items: center;
  justify-content: center;
  border-radius: 18px;
  border: 1px solid rgba(191, 219, 254, 0.9);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.95), rgba(239, 246, 255, 0.85));
  color: rgb(29, 78, 216);
  box-shadow: 0 16px 42px rgba(37, 99, 235, 0.12);
  transition: transform 0.18s ease, background 0.18s ease, box-shadow 0.18s ease;
}
.carousel-btn:hover {
  transform: translateY(-1px);
  background: white;
  box-shadow: 0 22px 52px rgba(37, 99, 235, 0.18);
}
@media (max-width: 767px) {
  .carousel-btn {
    width: 38px;
    flex-basis: 38px;
    border-radius: 16px;
  }
}
</style>
