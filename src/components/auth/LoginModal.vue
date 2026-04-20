<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'
import { X, Loader2 } from 'lucide-vue-next'
import { cn } from '@/lib/utils'

const props = defineProps<{ isOpen: boolean }>()
const emit = defineEmits<{ close: [] }>()

const userStore = useUserStore()
const username = ref('')
const loading = ref(false)

async function handleSubmit() {
  if (!username.value.trim()) return
  loading.value = true
  await new Promise(r => setTimeout(r, 800))
  userStore.login(username.value)
  loading.value = false
  emit('close')
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
    <div class="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-black/5">
      <button @click="emit('close')" class="absolute right-4 top-4 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
        <X class="h-5 w-5" />
      </button>
      <div class="mb-6 text-center">
        <h2 class="text-2xl font-semibold text-slate-900">欢迎登录</h2>
        <p class="mt-2 text-sm text-slate-500">登录以访问您的个性化能力与技能</p>
      </div>
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label for="username" class="block text-sm font-medium text-slate-700">用户名</label>
          <input id="username" v-model="username" type="text" class="mt-1 block w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500" placeholder="请输入您的用户名" autofocus />
        </div>
        <button type="submit" :disabled="loading || !username.trim()" :class="cn('flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#0098FF] to-[#006CFF] py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition-all hover:brightness-105 active:scale-[0.98]', (loading || !username.trim()) && 'opacity-70 cursor-not-allowed hover:brightness-100')">
          <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
          {{ loading ? '登录中...' : '立即登录' }}
        </button>
      </form>
    </div>
  </div>
</template>
