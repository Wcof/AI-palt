<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { FileText, X } from 'lucide-vue-next'

const route = useRoute()
const open = ref(false)
const routeHint = computed(() => route.path.replace(/^\//, '').replace(/\//g, '-'))
</script>

<template>
  <div class="pointer-events-none fixed bottom-5 right-5 z-[360]">
    <button type="button" class="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#0098FF] to-[#006CFF] px-4 py-2 text-xs font-semibold text-white shadow-[0_12px_30px_rgba(0,108,255,0.35)] ring-1 ring-[#00B4FF]/60 transition hover:brightness-105" @click="open = true">
      <FileText class="h-4 w-4" />
      PRD
    </button>
  </div>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-[361] flex justify-end bg-slate-950/30 backdrop-blur-[1px]" @mousedown.self="open = false">
      <aside class="h-full w-full max-w-[520px] overflow-hidden border-l border-sky-200/70 bg-white shadow-2xl">
        <header class="flex items-center justify-between border-b border-sky-100 px-5 py-4">
          <div>
            <div class="text-sm font-semibold text-slate-900">页面 PRD</div>
            <div class="mt-0.5 text-xs text-slate-500">路由标识：{{ routeHint || 'home' }}</div>
          </div>
          <button type="button" class="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700" @click="open = false">
            <X class="h-4 w-4" />
          </button>
        </header>
        <div class="h-[calc(100%-65px)] overflow-y-auto p-5">
          <div class="rounded-2xl border border-dashed border-sky-200/80 bg-sky-50/50 p-4 text-sm leading-6 text-slate-700">
            未找到该页面对应的 PRD 文件
          </div>
        </div>
      </aside>
    </div>
  </Teleport>
</template>
