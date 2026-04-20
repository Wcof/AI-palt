<script setup lang="ts">
defineEmits<{ reset: [] }>()
</script>

<template>
  <div class="rounded-2xl border border-sky-200/70 bg-white/70 p-8 text-center">
    <div class="text-sm font-semibold text-slate-900">没有匹配结果</div>
    <div class="mt-2 text-xs text-slate-600">尝试清空关键词或调整筛选条件。</div>
    <button type="button" @click="$emit('reset')" class="mt-5 rounded-xl bg-white/80 px-4 py-2 text-xs font-semibold text-slate-900 ring-1 ring-sky-200/70 transition hover:bg-white">清空筛选</button>
  </div>
</template>