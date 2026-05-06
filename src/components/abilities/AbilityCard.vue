<script setup lang="ts">
import { computed } from 'vue'
import type { Ability } from '@/data/abilities'
import { DOMAIN_LABEL, PRICE_LABEL } from '@/data/abilities'
import { highlightParts } from '@/utils/search'

const props = defineProps<{
  ability: Ability
  variant?: 'list'
  highlightQuery?: string
}>()

const nameParts = computed(() => highlightParts(props.ability.name, props.highlightQuery ?? ''))
const summaryParts = computed(() => highlightParts(props.ability.summary, props.highlightQuery ?? ''))
</script>

<template>
  <router-link
    :to="`/ability/${ability.id}`"
    class="group block rounded-2xl border border-sky-200/70 bg-white/80 p-4 ring-1 ring-white/70 transition hover:-translate-y-0.5 hover:border-sky-300 hover:bg-white"
  >
    <div class="flex items-start justify-between gap-3">
      <div class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#0098FF]/15 to-[#006CFF]/18 text-[#006CFF] ring-1 ring-[#00B4FF]/25">
        <component :is="ability.icon" class="h-5 w-5" />
      </div>
      <span class="shrink-0 rounded-full bg-white/80 px-2 py-1 text-[11px] font-medium text-slate-700 ring-1 ring-sky-200/70">{{ ability.hotTag }}</span>
    </div>

    <div class="mt-3">
      <h3 class="line-clamp-1 text-sm font-semibold text-slate-900">
        <template v-for="(part, idx) in nameParts" :key="`n-${idx}`">
          <mark v-if="part.highlight" class="bg-[#00B4FF]/20 px-0.5 text-inherit">{{ part.text }}</mark>
          <span v-else>{{ part.text }}</span>
        </template>
      </h3>
      <div class="mt-1 text-[11px] text-slate-500">{{ ability.apiName }}</div>
      <p class="mt-2 line-clamp-2 text-xs leading-5 text-slate-600">
        <template v-for="(part, idx) in summaryParts" :key="`s-${idx}`">
          <mark v-if="part.highlight" class="bg-[#00B4FF]/20 px-0.5 text-inherit">{{ part.text }}</mark>
          <span v-else>{{ part.text }}</span>
        </template>
      </p>
    </div>

    <div class="mt-3 flex flex-wrap gap-1.5">
      <span class="rounded-full bg-[#00B4FF]/12 px-2 py-1 text-[11px] text-slate-700 ring-1 ring-[#00B4FF]/20">{{ DOMAIN_LABEL[ability.domain] }}</span>
      <span class="rounded-full bg-white/80 px-2 py-1 text-[11px] text-slate-700 ring-1 ring-sky-200/70">{{ PRICE_LABEL[ability.price] }}</span>
      <span class="rounded-full bg-white/80 px-2 py-1 text-[11px] text-slate-700 ring-1 ring-sky-200/70">{{ ability.version }}</span>
    </div>
  </router-link>
</template>
