<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { LogOut, Cog, Database, Bot, Code } from 'lucide-vue-next'

const userStore = useUserStore()
const isOpen = ref(false)
const dropdownRef = ref<HTMLDivElement>()

function handleClickOutside(e: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) isOpen.value = false
}
onMounted(() => document.addEventListener('mousedown', handleClickOutside))
onUnmounted(() => document.removeEventListener('mousedown', handleClickOutside))
</script>

<template>
  <div v-if="userStore.user" class="relative" ref="dropdownRef">
    <button @click="isOpen = !isOpen" class="flex items-center gap-2 rounded-xl bg-white/10 pl-2 pr-3 py-1.5 ring-1 ring-white/25 transition hover:bg-white/15">
      <img :src="userStore.user.avatar" :alt="userStore.user.username" class="h-7 w-7 rounded-full bg-white/20" />
      <span class="max-w-[80px] truncate text-sm font-medium text-white sm:max-w-[120px]">{{ userStore.user.username }}</span>
    </button>
    <div v-if="isOpen" class="absolute right-0 top-full mt-2 w-48 origin-top-right rounded-xl bg-white py-1 shadow-lg ring-1 ring-black/5">
      <div class="px-4 py-2 border-b border-slate-100">
        <p class="text-sm font-medium text-slate-900 truncate">{{ userStore.user.username }}</p>
        <p class="text-xs text-slate-500 truncate">{{ userStore.user.email }}</p>
      </div>
      <div class="py-1">
        <router-link to="/knowledge" class="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50" @click="isOpen = false">
          <Database class="h-4 w-4" /> 知识库管理
        </router-link>
        <router-link to="/agents" class="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50" @click="isOpen = false">
          <Bot class="h-4 w-4" /> 智能体管理
        </router-link>
        <router-link to="/mcp" class="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50" @click="isOpen = false">
          <Code class="h-4 w-4" /> AI 技能管理
        </router-link>
        <router-link to="/system" class="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50" @click="isOpen = false">
          <Cog class="h-4 w-4" /> 系统设置
        </router-link>
      </div>
      <div class="border-t border-slate-100 py-1">
        <button @click="userStore.logout(); isOpen = false" class="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
          <LogOut class="h-4 w-4" /> 退出登录
        </button>
      </div>
    </div>
  </div>
</template>
