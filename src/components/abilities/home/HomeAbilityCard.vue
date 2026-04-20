<script setup lang="ts">
import type { Ability } from '@/data/abilities'
import { cn } from '@/lib/utils'

defineProps<{ ability: Ability; size?: 'compact' | 'normal'; class?: string }>()
</script>

<template>
  <router-link
    :to="`/ability/${ability.id}`"
    :class="cn('group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-sky-200/70 bg-white/70 p-4 shadow-[inset_0_0_0_1px_rgba(0,180,255,0.08)] transition hover:-translate-y-1 hover:shadow-[0_0_0_1px_rgba(0,180,255,0.45),0_12px_32px_rgba(0,35,90,0.12)]', $props.class)"
  >
    <div class="flex items-start justify-between gap-2">
      <span class="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[linear-gradient(180deg,rgba(0,180,255,0.16),rgba(141,76,255,0.08))] ring-1 ring-sky-200/70">
        <component :is="ability.icon" class="h-4 w-4 text-slate-900" />
      </span>
      <span class="rounded-full bg-[#00B4FF]/18 px-2 py-0.5 text-[10px] text-slate-800 ring-1 ring-[#00B4FF]/35">{{ ability.hotTag }}</span>
    </div>
    <div class="mt-3">
      <div class="truncate text-sm font-semibold text-slate-900">{{ ability.name }}</div>
      <div class="mt-1 text-xs leading-5 text-slate-600 text-clamp-2">{{ ability.summary }}</div>
    </div>
    <div class="mt-3 flex items-center justify-between text-[11px] text-slate-500">
      <span>{{ ability.version }}</span>
      <span>{{ ability.calls.toLocaleString() }} 次</span>
    </div>
  </router-link>
</template>
