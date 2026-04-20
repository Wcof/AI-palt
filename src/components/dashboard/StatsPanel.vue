<script setup lang="ts">
import { Activity, Users, Images } from 'lucide-vue-next'
import { useCountUp } from '@/composables/useCountUp'

const stats = [
  { label: '今日调用次数', value: 23864, icon: Activity },
  { label: '累计接入开发者数', value: 14802, icon: Users },
  { label: '累计处理图片张数', value: 12876034, icon: Images },
]

function formatCompact(n: number) {
  if (n >= 100000000) return `${Math.round(n / 10000000) / 10}亿`
  if (n >= 100000) return `${Math.round(n / 1000) / 10}万`
  return n.toLocaleString()
}
</script>

<template>
  <section class="rounded-2xl border border-sky-200/70 bg-white/75 p-5 shadow-[inset_0_0_0_1px_rgba(0,180,255,0.10)] backdrop-blur">
    <div class="grid gap-3 sm:grid-cols-3">
      <div v-for="s in stats" :key="s.label" class="group relative overflow-hidden rounded-xl border border-sky-200/70 bg-white/70 px-4 py-4">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-xs text-slate-600">{{ s.label }}</div>
            <div class="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{{ formatCompact(useCountUp(() => s.value, 2000).value) }}</div>
          </div>
          <span class="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[linear-gradient(180deg,rgba(0,180,255,0.16),rgba(141,76,255,0.08))] ring-1 ring-sky-200/70">
            <component :is="s.icon" class="h-5 w-5 text-slate-900" />
          </span>
        </div>
        <div class="mt-4 h-px w-full bg-gradient-to-r from-[#00B4FF]/55 via-[#8D4CFF]/22 to-transparent" />
      </div>
    </div>
  </section>
</template>
