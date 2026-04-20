<script setup lang="ts">
import { computed } from 'vue'
import { Star } from 'lucide-vue-next'
import { cn } from '@/lib/utils'
import type { Ability } from '@/data/abilities'
import { highlightParts } from '@/utils/search'

const props = defineProps<{ ability: Ability; variant: 'floor' | 'list'; highlightQuery?: string }>()
const q = computed(() => (props.highlightQuery ?? '').trim())
</script>

<template>
  <!-- list variant -->
  <div v-if="variant === 'list'" class="group relative overflow-hidden rounded-2xl border border-sky-200/70 bg-white/70 p-4 shadow-[inset_0_0_0_1px_rgba(0,180,255,0.08)] transition hover:-translate-y-2 hover:shadow-[0_0_0_1px_rgba(0,180,255,0.45),0_16px_40px_rgba(0,35,90,0.14),0_0_28px_rgba(0,180,255,0.28)]">
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0">
        <div class="flex items-center gap-2">
          <span class="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[linear-gradient(180deg,rgba(0,180,255,0.16),rgba(141,76,255,0.08))] ring-1 ring-sky-200/70">
            <component :is="ability.icon" class="h-5 w-5 text-slate-900" />
          </span>
          <div class="min-w-0">
            <div class="truncate text-sm font-semibold text-slate-900">
              <template v-if="q">
                <template v-for="(p, i) in highlightParts(ability.name, q)" :key="i">
                  <mark v-if="p.highlight" class="rounded bg-[#00B4FF]/22 px-0.5 text-slate-900">{{ p.text }}</mark>
                  <span v-else>{{ p.text }}</span>
                </template>
              </template>
              <template v-else>{{ ability.name }}</template>
            </div>
            <div class="truncate text-xs text-slate-600">{{ ability.apiName }}</div>
          </div>
        </div>
        <div class="mt-3 max-h-10 overflow-hidden text-xs leading-5 text-slate-700">{{ ability.summary }}</div>
      </div>
      <span class="shrink-0 rounded-full bg-[#00B4FF]/18 px-2.5 py-1 text-[11px] text-slate-800 ring-1 ring-[#00B4FF]/35">{{ ability.hotTag }}</span>
    </div>
    <div class="mt-4 grid grid-cols-2 gap-3">
      <div class="rounded-xl bg-white/70 px-3 py-2 ring-1 ring-sky-200/60">
        <div class="text-[11px] text-slate-600">版本</div>
        <div class="mt-1 text-xs font-semibold text-slate-900">{{ ability.version }}</div>
      </div>
      <div class="rounded-xl bg-white/70 px-3 py-2 ring-1 ring-sky-200/60">
        <div class="text-[11px] text-slate-600">调用次数</div>
        <div class="mt-1 text-xs font-semibold text-slate-900">{{ ability.calls.toLocaleString() }}</div>
      </div>
    </div>
    <div class="mt-4 flex items-center justify-between">
      <div class="flex items-center gap-2 text-xs text-slate-700">
        <span class="inline-flex items-center gap-1">
          <Star v-for="i in 5" :key="i" :class="cn('h-3.5 w-3.5', i <= Math.round(ability.rating) ? 'fill-[#00B4FF] text-[#00B4FF]' : 'text-slate-300')" />
        </span>
        <span class="text-slate-500">{{ ability.rating.toFixed(1) }}</span>
      </div>
      <router-link :to="`/ability/${ability.id}`" class="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#0098FF] to-[#006CFF] px-4 py-2 text-xs font-semibold text-white shadow-[0_10px_24px_rgba(0,35,90,0.12)] ring-1 ring-[#00B4FF]/55 transition hover:brightness-105">
        立即试用
      </router-link>
    </div>
  </div>

  <!-- floor variant -->
  <router-link v-else :to="`/ability/${ability.id}`" class="group relative flex aspect-[3/4] flex-col justify-between overflow-hidden rounded-2xl border border-sky-200/70 bg-white/70 p-4 shadow-[inset_0_0_0_1px_rgba(0,180,255,0.08)] transition hover:-translate-y-2 hover:shadow-[0_0_0_1px_rgba(0,180,255,0.45),0_16px_40px_rgba(0,35,90,0.14),0_0_28px_rgba(0,180,255,0.28)]">
    <div class="flex items-start justify-between gap-3">
      <span class="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[linear-gradient(180deg,rgba(0,180,255,0.16),rgba(141,76,255,0.08))] ring-1 ring-sky-200/70">
        <component :is="ability.icon" class="h-5 w-5 text-slate-900" />
      </span>
      <span class="rounded-full bg-[#00B4FF]/18 px-2.5 py-1 text-[11px] text-slate-800 ring-1 ring-[#00B4FF]/35">{{ ability.hotTag }}</span>
    </div>
    <div>
      <div class="mt-2 text-base font-semibold text-slate-900">{{ ability.name }}</div>
      <div class="mt-1 truncate text-xs text-slate-600">{{ ability.apiName }}</div>
      <div class="mt-3 max-h-[60px] overflow-hidden text-xs leading-5 text-slate-700">{{ ability.summary }}</div>
    </div>
    <div class="mt-4 flex items-center justify-between text-xs text-slate-700">
      <span class="rounded-md bg-white/70 px-2 py-1 ring-1 ring-sky-200/60">{{ ability.domain }}</span>
      <span class="rounded-md bg-white/70 px-2 py-1 ring-1 ring-sky-200/60">{{ ability.calls.toLocaleString() }}</span>
    </div>
  </router-link>
</template>
