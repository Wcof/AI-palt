<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { cn } from '@/lib/utils'
import ParticleBackground from '@/components/visual/ParticleBackground.vue'
import { usePrefersReducedMotion } from '@/composables/usePrefersReducedMotion'

defineProps<{ class?: string }>()
const reducedMotion = usePrefersReducedMotion()

const slides = [
  { id: 'nlp', title: 'AI知识库', subtitle: '汇聚安全生产法规、操作规程与事故案例，支持全领域智能问答与合规检索。', ctaTo: '/abilities?domain=NLP' },
  { id: 'llm', title: 'AI 智能体', subtitle: '面向安全生产的智能问答与合规助手，问一句就给可执行建议。', ctaTo: '/abilities?domain=LLM' },
  { id: 'mcp', title: 'AI 技能', subtitle: '聚焦安全生产场景，提供 NL2SQL 数据智能查询与 AI 视觉隐患识别两大核心能力。', ctaTo: '/abilities?domain=MCP' },
]

const index = ref(0)
const paused = ref(false)
let timer: number | undefined

function go(n: number) { index.value = ((n % slides.length) + slides.length) % slides.length }

onMounted(() => {
  timer = window.setInterval(() => {
    if (!paused.value && !reducedMotion.value) index.value = (index.value + 1) % slides.length
  }, 2800)
})
onUnmounted(() => clearInterval(timer))
</script>

<template>
  <section
    :class="cn('sticky top-0 z-[120] relative h-[65vh] min-h-[360px] max-h-[760px] w-full overflow-hidden border-y border-sky-200/70 bg-white/70 backdrop-blur sm:min-h-[420px]', $attrs.class)"
    @mouseenter="paused = true" @mouseleave="paused = false"
  >
    <div class="absolute inset-0">
      <ParticleBackground class="absolute inset-0 h-full w-full opacity-60" />
      <div class="absolute inset-0 bg-[radial-gradient(closest-side_at_18%_20%,rgba(0,180,255,0.18),transparent_62%),radial-gradient(closest-side_at_80%_30%,rgba(141,76,255,0.12),transparent_60%)]" />
      <div class="absolute inset-0 bg-gradient-to-b from-white/40 via-white/20 to-white/75" />
    </div>

    <div class="relative flex h-full w-full transition-transform duration-500 ease-out" :class="reducedMotion && 'duration-0'" :style="{ transform: `translateX(-${index * 100}%)` }">
      <div v-for="s in slides" :key="s.id" class="flex h-full w-full shrink-0 basis-full items-center justify-center px-8 sm:px-16">
        <div class="flex h-[280px] w-full max-w-[760px] flex-col items-center justify-center text-center">
          <h2 class="min-h-[56px] text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">{{ s.title }}</h2>
          <p class="mt-4 min-h-[56px] max-w-[680px] text-sm leading-6 text-slate-700 sm:text-base">{{ s.subtitle }}</p>
          <router-link :to="s.ctaTo" class="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#0098FF] to-[#006CFF] px-5 py-2.5 text-sm font-semibold text-white shadow-lg ring-1 ring-[#00B4FF]/55 transition hover:brightness-105 cta-pulse">
            立即探索
          </router-link>
        </div>
      </div>
    </div>

    <button @click="go(index - 1)" class="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/70 p-2 text-slate-700 ring-1 ring-sky-200/70 transition hover:bg-white">
      <ChevronLeft class="h-5 w-5" />
    </button>
    <button @click="go(index + 1)" class="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/70 p-2 text-slate-700 ring-1 ring-sky-200/70 transition hover:bg-white">
      <ChevronRight class="h-5 w-5" />
    </button>

    <div class="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
      <button v-for="(s, i) in slides" :key="s.id" @click="index = i" :class="cn('h-2 rounded-full transition-all', i === index ? 'w-6 bg-[#00B4FF]' : 'w-2 bg-slate-400/50')" />
    </div>
  </section>
</template>
