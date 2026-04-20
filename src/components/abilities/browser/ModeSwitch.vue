<script setup lang="ts">
import { cn } from '@/lib/utils'

export type ListMode = 'infinite' | 'paged'

defineProps<{ modelValue: ListMode }>()
const emit = defineEmits<{ 'update:modelValue': [v: ListMode] }>()

const modes = [
  { v: 'infinite' as const, label: '无限滚动' },
  { v: 'paged' as const, label: '分页' },
]
</script>

<template>
  <div class="inline-flex rounded-xl bg-white/80 p-1 ring-1 ring-sky-200/70">
    <button
      v-for="x in modes"
      :key="x.v"
      type="button"
      @click="emit('update:modelValue', x.v)"
      :class="cn('rounded-lg px-3 py-1.5 text-xs font-semibold transition', modelValue === x.v ? 'bg-[#00B4FF]/18 text-slate-900' : 'text-slate-600 hover:text-slate-900')"
    >{{ x.label }}</button>
  </div>
</template>
