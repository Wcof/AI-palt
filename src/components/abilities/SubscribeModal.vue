<script setup lang="ts">
import { X } from 'lucide-vue-next'

defineProps<{
  isOpen: boolean
  abilityName: string
  abilityDomain: string
}>()
const emit = defineEmits<{ close: []; confirm: [] }>()

const handleConfirm = () => { emit('confirm'); emit('close') }
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
    <div class="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-black/5 animate-in zoom-in-95 duration-200">
      <button @click="emit('close')" class="absolute right-4 top-4 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
        <X class="h-5 w-5" />
      </button>
      <div class="mb-6 text-center">
        <h2 class="text-2xl font-semibold text-slate-900">确认订阅</h2>
        <p class="mt-2 text-sm text-slate-500">您确定要订阅以下能力吗？</p>
      </div>
      <div class="mb-6 rounded-xl bg-gradient-to-br from-sky-50 to-blue-50 p-4 ring-1 ring-sky-200/50">
        <div class="text-base font-semibold text-slate-900">{{ abilityName }}</div>
        <div class="mt-1 text-sm text-slate-600">领域：{{ abilityDomain }}</div>
      </div>
      <div class="flex gap-3">
        <button @click="emit('close')" class="flex-1 rounded-xl border border-slate-300 bg-white py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 active:scale-[0.98]">取消</button>
        <button @click="handleConfirm" class="flex-1 rounded-xl bg-gradient-to-r from-[#0098FF] to-[#006CFF] py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition-all hover:brightness-105 active:scale-[0.98]">确认订阅</button>
      </div>
    </div>
  </div>
</template>
