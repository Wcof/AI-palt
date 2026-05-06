<script setup lang="ts">
  import type { ListMode } from './ModeSwitch.vue';

  defineProps<{
    mode: ListMode;
    page: number;
    totalPages: number;
    total: number;
    loading?: boolean;
    hasMore?: boolean;
  }>();
  const emit = defineEmits<{ prev: []; next: []; loadMore: [] }>();
</script>

<template>
  <div class="mt-6 flex flex-col gap-3 rounded-2xl border border-sky-200/70 bg-white/70 p-4 sm:flex-row sm:items-center sm:justify-between">
    <div class="text-xs text-slate-600"> 共 {{ total }} 条 · {{ mode === 'infinite' ? '已加载' : '当前页' }} {{ page }} / {{ totalPages }} </div>
    <div v-if="mode === 'paged'" class="flex gap-2">
      <button
        type="button"
        @click="emit('prev')"
        :disabled="page <= 1"
        class="rounded-xl bg-white/80 px-4 py-2 text-xs font-semibold text-slate-900 ring-1 ring-sky-200/70 disabled:opacity-40"
        >上一页</button
      >
      <button
        type="button"
        @click="emit('next')"
        :disabled="page >= totalPages"
        class="rounded-xl bg-white/80 px-4 py-2 text-xs font-semibold text-slate-900 ring-1 ring-sky-200/70 disabled:opacity-40"
        >下一页</button
      >
    </div>
    <button
      v-else
      type="button"
      @click="emit('loadMore')"
      :disabled="loading || (hasMore !== undefined ? !hasMore : page >= totalPages)"
      class="rounded-xl bg-white/80 px-4 py-2 text-xs font-semibold text-slate-900 ring-1 ring-sky-200/70 transition hover:bg-white disabled:opacity-40"
    >
      <span v-if="loading">加载中...</span>
      <span v-else-if="hasMore !== undefined ? !hasMore : page >= totalPages">没有更多了</span>
      <span v-else>加载更多</span>
    </button>
  </div>
</template>