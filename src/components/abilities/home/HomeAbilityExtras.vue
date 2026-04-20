<script setup lang="ts">
import { computed } from 'vue'
import { ABILITIES, DOMAIN_LABEL, type AbilityDomain, type Ability } from '@/data/abilities'
import { cn } from '@/lib/utils'

defineProps<{ class?: string }>()
</script>

<script lang="ts">
// Skeleton component
export const HomeAbilityCardSkeleton = { props: ['class'], template: '<div :class="cn(\'animate-pulse rounded-2xl border border-sky-200/70 bg-white/50 p-4\', $props.class)"><div class=\'h-9 w-9 rounded-xl bg-slate-200\' /><div class=\'mt-3 h-4 w-2/3 rounded bg-slate-200\' /><div class=\'mt-2 h-3 w-full rounded bg-slate-100\' /></div>' }
</script>

<template>
  <div :class="cn('rounded-2xl border border-sky-200/70 bg-white/70 p-4 ring-1 ring-sky-200/40', $props.class)">
    <slot />
  </div>
</template>
