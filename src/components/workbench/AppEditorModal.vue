<script setup lang="ts">
import { ref, watch } from 'vue'
import { X } from 'lucide-vue-next'
import type { DevAppStatus } from '@/stores/workbenchApps'

const props = defineProps<{
  title: string
  initial: { name: string; description: string; status: DevAppStatus }
}>()
const emit = defineEmits<{ close: []; submit: [v: { name: string; description: string; status: DevAppStatus }] }>()

const name = ref(props.initial.name)
const desc = ref(props.initial.description)
const status = ref<DevAppStatus>(props.initial.status)

watch(() => props.initial, (v) => { name.value = v.name; desc.value = v.description; status.value = v.status })
</script>

<template>
  <div class="fixed inset-0 z-[320] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" role="dialog" aria-modal="true" @mousedown.self="emit('close')">
    <div class="w-full max-w-[720px] rounded-2xl border border-sky-200/60 bg-white/90 p-5 shadow-2xl">
      <div class="flex items-start justify-between gap-3">
        <div><div class="text-base font-semibold text-slate-900">{{ title }}</div><div class="mt-1 text-xs text-slate-600">应用信息包含 ID、名称、描述、时间与状态等字段。</div></div>
        <button type="button" @click="emit('close')" class="rounded-xl bg-white/70 p-2 text-slate-700 ring-1 ring-sky-200/70 transition hover:bg-white"><X class="h-4 w-4" /></button>
      </div>
      <div class="mt-4 grid gap-3 md:grid-cols-2">
        <div class="md:col-span-2">
          <div class="text-xs font-semibold text-slate-700">应用名称</div>
          <input v-model="name" placeholder="例如：企业知识库问答" class="mt-1 w-full rounded-xl border border-sky-200/70 bg-white/80 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[#00B4FF]/55" />
          <div class="mt-1 text-[11px] text-slate-500">{{ name.trim().length }}/50</div>
        </div>
        <div>
          <div class="text-xs font-semibold text-slate-700">应用状态</div>
          <select v-model="status" class="mt-1 w-full rounded-xl border border-sky-200/70 bg-white/80 px-3 py-2 text-sm text-slate-900 outline-none"><option value="enabled">启用</option><option value="disabled">禁用</option></select>
        </div>
        <div class="md:col-span-2">
          <div class="text-xs font-semibold text-slate-700">应用描述</div>
          <textarea v-model="desc" rows="4" placeholder="描述该应用的用途、使用范围与主要能力" class="mt-1 w-full resize-none rounded-xl border border-sky-200/70 bg-white/80 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[#00B4FF]/55" />
        </div>
      </div>
      <div class="mt-5 flex items-center justify-end gap-2">
        <button type="button" @click="emit('close')" class="rounded-xl bg-white/70 px-4 py-2 text-sm font-semibold text-slate-900 ring-1 ring-sky-200/70 transition hover:bg-white">取消</button>
        <button type="button" :disabled="!name.trim() || name.trim().length > 50" @click="emit('submit', { name: name.trim(), description: desc, status })" class="rounded-xl bg-gradient-to-r from-[#0098FF] to-[#006CFF] px-4 py-2 text-sm font-semibold text-white ring-1 ring-[#00B4FF]/55 transition hover:brightness-105 disabled:opacity-50">保存</button>
      </div>
    </div>
  </div>
</template>
