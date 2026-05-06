<script setup lang="ts">
  export type ListMode = 'infinite' | 'paged';

  defineProps<{ modelValue: ListMode }>();
  const emit = defineEmits<{ 'update:modelValue': [v: ListMode] }>();

  const modes = [
    { v: 'infinite' as const, label: '无限滚动' },
    { v: 'paged' as const, label: '分页' },
  ];
</script>

<template>
  <div class="inline-flex rounded-lg bg-white/80 p-1 ring-1 ring-sky-200/70 flex-shrink-0">
    <div
      v-for="x in modes"
      :key="x.v"
      class="cursor-pointer whitespace-nowrap"
      @click="emit('update:modelValue', x.v)"
      :class="[
        'rounded-lg px-3 py-1.5 text-xs font-semibold transition',
        modelValue === x.v ? 'bg-gradient-to-r from-[#0098FF] to-[#006CFF] text-white' : 'text-slate-600 hover:text-slate-900',
      ]"
      >{{ x.label }}</div
    >
  </div>
</template>