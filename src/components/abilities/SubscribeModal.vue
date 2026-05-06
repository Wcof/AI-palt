<script setup lang="ts">
import { X } from 'lucide-vue-next'

defineProps<{
  isOpen: boolean
  abilityName?: string
  abilityDomain?: string
}>()

const emit = defineEmits<{
  close: []
  confirm: []
}>()
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-[340] flex items-center justify-center bg-blue-950/30 p-4 backdrop-blur-sm" @mousedown.self="emit('close')">
    <div class="w-full max-w-md rounded-2xl border border-sky-200/60 bg-white p-6 shadow-2xl ring-1 ring-black/5">
      <div class="flex items-start justify-between gap-3">
        <div>
          <h3 class="text-lg font-semibold text-slate-900">确认订阅</h3>
          <p class="mt-1 text-sm text-slate-600">将订阅当前{{ abilityDomain || '能力' }}。</p>
        </div>
        <button type="button" class="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700" @click="emit('close')">
          <X class="h-4 w-4" />
        </button>
      </div>
      <div class="mt-4 rounded-xl bg-sky-50/70 p-3 ring-1 ring-sky-100">
        <div class="text-xs text-slate-500">目标能力</div>
        <div class="mt-1 text-sm font-medium text-slate-900">{{ abilityName || '未命名能力' }}</div>
      </div>
      <div class="mt-6 flex items-center justify-end gap-2">
        <button type="button" class="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-800 ring-1 ring-slate-200 transition hover:bg-slate-50" @click="emit('close')">取消</button>
        <button type="button" class="rounded-xl bg-gradient-to-r from-[#0098FF] to-[#006CFF] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-105" @click="emit('confirm')">确认订阅</button>
      </div>
    </div>
  </div>
</template>
