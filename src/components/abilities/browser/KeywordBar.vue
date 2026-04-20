<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{ keyword: string }>()
const emit = defineEmits<{ submit: [v: string] }>()
const draft = ref(props.keyword)
</script>

<template>
  <div class="mb-4 rounded-2xl border border-sky-200/70 bg-white/70 p-4">
    <div class="text-xs text-slate-600">当前关键词</div>
    <div class="mt-2 flex flex-wrap items-center justify-between gap-3">
      <div class="text-sm font-semibold text-slate-900">{{ keyword || '-' }}</div>
      <input
        v-model="draft"
        placeholder="更新 keyword 并回车"
        @keydown.enter="emit('submit', draft)"
        class="w-full rounded-xl bg-white/80 px-3 py-2 text-sm text-slate-900 ring-1 ring-sky-200/70 placeholder:text-slate-500 sm:max-w-[360px]"
      />
    </div>
  </div>
</template>
