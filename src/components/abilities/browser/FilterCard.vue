<script setup lang="ts">
import { ref } from 'vue'
import { ChevronDown } from 'lucide-vue-next'
import { cn } from '@/lib/utils'

defineProps<{ title: string }>()
const open = ref(true)
</script>

<template>
  <div class="rounded-2xl border border-sky-200/70 bg-white/70 p-4">
    <button type="button" @click="open = !open" class="flex w-full items-center justify-between text-left">
      <div class="text-sm font-semibold text-slate-900">{{ title }}</div>
      <ChevronDown :class="cn('h-4 w-4 text-slate-500 transition', open ? 'rotate-180' : '')" />
    </button>
    <div v-if="open" class="mt-3"><slot /></div>
  </div>
</template>