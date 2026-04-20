<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import TopNav from '@/components/nav/TopNav.vue'
import PrdOverlay from '@/components/prd/PrdOverlay.vue'
import { useSystemStore } from '@/stores/system'

const route = useRoute()
const systemStore = useSystemStore()
const isAIAppRoute = computed(() => route.path === '/ai-app')
</script>

<template>
  <div :class="['relative min-h-screen', isAIAppRoute && 'h-screen overflow-hidden']">
    <div class="pointer-events-none absolute inset-0 opacity-40">
      <div class="tech-grid absolute inset-0" />
    </div>
    <TopNav />
    <main
      :class="[
        'relative mx-auto w-full',
        isAIAppRoute ? 'h-[calc(100dvh-64px)] max-w-[1440px] overflow-hidden px-6 py-4' : 'max-w-[1440px] px-6 pt-8 pb-16'
      ]"
    >
      <div :key="route.path" :class="['page-enter', isAIAppRoute && 'h-full']">
        <router-view />
      </div>
    </main>
    <PrdOverlay />
    <footer v-if="!isAIAppRoute" class="relative border-t border-sky-200/60 bg-white/55 backdrop-blur">
      <div class="mx-auto flex max-w-[1280px] items-center justify-between px-6 py-8 text-xs text-slate-600">
        <div>&copy; {{ new Date().getFullYear() }} {{ systemStore.displayName }}</div>
        <div class="hidden sm:block">高端安全生产 AI 平台 · 专注隐患治理、合规管控与应急处置</div>
      </div>
    </footer>
  </div>
</template>
