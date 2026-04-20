<script setup lang="ts">
import { RotateCcw } from 'lucide-vue-next'
import ModeSwitch, { type ListMode } from './ModeSwitch.vue'
import type { SortKey } from '@/utils/abilityQuery'

defineProps<{
  title: string
  desc: string
  mode: ListMode
  sort: SortKey
  keyword: string
}>()
const emit = defineEmits<{
  modeChange: [m: ListMode]
  sortChange: [s: SortKey]
  reset: []
}>()
</script>

<template>
  <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
    <div>
      <h2 class="text-2xl font-semibold tracking-tight text-slate-900">{{ title }}</h2>
      <p class="mt-2 text-sm text-slate-600">{{ desc }}</p>
      <div v-if="keyword" class="mt-2 text-xs text-slate-500">关键词：{{ keyword }}</div>
    </div>
    <div class="flex flex-wrap items-center gap-2">
      <ModeSwitch :model-value="mode" @update:model-value="emit('modeChange', $event)" />
      <select :value="sort" @change="emit('sortChange', ($event.target as HTMLSelectElement).value as SortKey)" class="rounded-lg bg-white/80 px-3 py-2 text-sm text-slate-900 ring-1 ring-sky-200/70">
        <option value="recommend">推荐</option>
        <option value="latest">最新</option>
        <option value="calls">调用次数</option>
        <option value="rating">评分</option>
      </select>
      <button type="button" @click="emit('reset')" class="inline-flex items-center gap-2 rounded-lg bg-white/80 px-3 py-2 text-sm text-slate-900 ring-1 ring-sky-200/70 transition hover:bg-white">
        <RotateCcw class="h-4 w-4" />
        重置
      </button>
    </div>
  </div>
</template>
