<script setup lang="ts">
  import { ref } from 'vue';
  import { DownOutlined } from '@ant-design/icons-vue';

  defineProps<{ title: string }>();
  const open = ref(true);
</script>

<template>
  <div class="rounded-2xl border border-sky-200/70 bg-white/70 p-4">
    <div @click="open = !open" class="cursor-pointer flex w-full items-center justify-between text-left">
      <div class="text-sm font-semibold text-slate-900">{{ title }}</div>
      <DownOutlined :class="['h-3 w-4 text-slate-500 transition font-size-3', open ? 'rotate-180' : '']" />
    </div>
    <div v-if="open" class="mt-3"><slot /></div>
  </div>
</template>