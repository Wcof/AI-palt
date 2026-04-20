<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { ShieldCheck } from 'lucide-vue-next'
import { cn } from '@/lib/utils'
import { useUserStore } from '@/stores/user'
import { useSystemStore } from '@/stores/system'
import LoginModal from '@/components/auth/LoginModal.vue'
import UserDropdown from '@/components/auth/UserDropdown.vue'

type NavItem =
  | { label: string; to: string; kind: 'abilities_all' }
  | { label: string; to: string; kind: 'abilities_domain'; domain: string }
  | { label: string; to: string; kind: 'workbench' }
  | { label: string; to: string; kind: 'ai_app' }

const navItems: NavItem[] = [
  { label: 'AI智能助手', to: '/ai-app', kind: 'ai_app' },
  { label: '能力平台', to: '/abilities', kind: 'abilities_all' },
  { label: 'AI知识库', to: '/abilities?domain=NLP&entry=nav', kind: 'abilities_domain', domain: 'NLP' },
  { label: 'AI 智能体', to: '/abilities?domain=LLM&entry=nav', kind: 'abilities_domain', domain: 'LLM' },
  { label: 'AI 技能', to: '/abilities?domain=MCP&entry=nav', kind: 'abilities_domain', domain: 'MCP' },
  { label: '开发工作台', to: '/workbench/apps', kind: 'workbench' },
]

const mobileNavItems: NavItem[] = [
  ...navItems,
]

const route = useRoute()
const userStore = useUserStore()
const systemStore = useSystemStore()
const isLoginModalOpen = ref(false)

const domainFromUrl = computed(() => new URLSearchParams(route.fullPath.split('?')[1] || '').get('domain') ?? '')

function isActive(item: NavItem) {
  if (item.kind === 'workbench') return route.path.startsWith('/workbench')
  if (item.kind === 'ai_app') return route.path === '/ai-app'
  if (item.kind === 'abilities_all') return route.path === '/abilities' && !domainFromUrl.value
  return route.path === '/abilities' && domainFromUrl.value === (item as any).domain
}
</script>

<template>
  <header class="sticky top-0 z-[200]">
    <div class="border-b border-white/15 bg-[linear-gradient(90deg,rgba(0,180,255,0.90),rgba(0,132,255,0.90),rgba(141,76,255,0.86))] shadow-[0_4px_16px_rgba(0,35,90,0.22)] backdrop-blur">
      <div class="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-6">
        <router-link to="/ai-app" class="flex items-center gap-2 text-white">
          <span class="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20">
            <img v-if="systemStore.logoUrl" :src="systemStore.logoUrl" :alt="systemStore.displayName" class="h-6 w-6 object-contain" />
            <ShieldCheck v-else class="h-5 w-5" />
          </span>
          <div class="leading-tight">
            <div class="text-sm font-semibold tracking-wide">{{ systemStore.displayName }}</div>
            <div class="text-[11px] text-white/70">Premium Safety AI Platform</div>
          </div>
        </router-link>

        <nav class="hidden items-center gap-2 lg:flex">
          <router-link
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            :class="cn(
              'rounded-xl px-3 py-2 text-sm text-white/80 transition-colors hover:bg-white/10 hover:text-white',
              isActive(item) && 'bg-white/12 text-white ring-1 ring-white/25'
            )"
          >
            {{ item.label }}
          </router-link>
        </nav>

        <div class="flex items-center gap-2">
          <UserDropdown v-if="userStore.isAuthenticated" />
          <button
            v-else
            @click="isLoginModalOpen = true"
            class="rounded-xl bg-white/10 px-4 py-2 text-sm font-medium text-white ring-1 ring-white/25 transition hover:bg-white/15"
          >
            登录
          </button>
        </div>
      </div>

      <div class="mx-auto flex max-w-[1280px] gap-2 overflow-x-auto px-6 pb-3 lg:hidden">
        <router-link
          v-for="item in mobileNavItems"
          :key="item.to"
          :to="item.to"
          :class="cn(
            'whitespace-nowrap rounded-full bg-white/10 px-3 py-1.5 text-xs text-white/80 ring-1 ring-white/15 transition hover:bg-white/15',
            isActive(item) && 'bg-white/20 text-white ring-white/30'
          )"
        >
          {{ item.label }}
        </router-link>
      </div>
    </div>

    <LoginModal :is-open="isLoginModalOpen" @close="isLoginModalOpen = false" />
  </header>
</template>
