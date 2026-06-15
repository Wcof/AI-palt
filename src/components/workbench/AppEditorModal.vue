<script setup lang="ts">
import { reactive } from 'vue'
import type { DevAppStatus } from '@/stores/workbenchApps'

const props = defineProps<{
  title: string
  initial: {
    name: string
    description?: string
    status: DevAppStatus
  }
}>()

const emit = defineEmits<{
  close: []
  submit: [{ name: string; description: string; status: DevAppStatus }]
}>()

const form = reactive({
  name: props.initial.name || '',
  description: props.initial.description || '',
  status: props.initial.status || 'enabled',
})

function onSubmit() {
  if (!form.name.trim()) return
  emit('submit', { name: form.name.trim(), description: form.description.trim(), status: form.status })
}
</script>

<template>
  <Teleport to="body">
  <div class="fixed inset-0 z-[350] h-[100dvh] min-h-[100dvh] overflow-y-auto bg-blue-950/30 p-4 backdrop-blur-sm" @mousedown.self="emit('close')">
    <div class="mx-auto w-full max-w-xl rounded-2xl border border-sky-200/70 bg-white p-6 shadow-2xl">
      <div class="text-base font-semibold text-slate-900">{{ title }}</div>
      <div class="mt-4 space-y-4">
        <label class="block">
          <div class="mb-1 text-xs font-semibold text-slate-700">应用名称</div>
          <input v-model="form.name" maxlength="40" placeholder="请输入应用名称" class="w-full rounded-xl border border-sky-200/70 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[#00B4FF]/60" />
        </label>
        <label class="block">
          <div class="mb-1 text-xs font-semibold text-slate-700">应用描述</div>
          <textarea v-model="form.description" rows="4" maxlength="200" placeholder="请输入应用描述" class="w-full resize-none rounded-xl border border-sky-200/70 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[#00B4FF]/60" />
        </label>
        <label class="block">
          <div class="mb-1 text-xs font-semibold text-slate-700">状态</div>
          <select v-model="form.status" class="w-full rounded-xl border border-sky-200/70 bg-white px-3 py-2 text-sm text-slate-900 outline-none">
            <option value="enabled">启用</option>
            <option value="disabled">禁用</option>
          </select>
        </label>
      </div>
      <div class="mt-6 flex items-center justify-end gap-2">
        <button type="button" class="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-800 ring-1 ring-slate-200 transition hover:bg-slate-50" @click="emit('close')">取消</button>
        <button type="button" class="rounded-xl bg-gradient-to-r from-[#0098FF] to-[#006CFF] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-105 disabled:opacity-60" :disabled="!form.name.trim()" @click="onSubmit">保存</button>
      </div>
    </div>
  </div>
  </Teleport>
</template>
