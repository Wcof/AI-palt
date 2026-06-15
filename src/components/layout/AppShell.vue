<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import PrdOverlay from '@/components/prd/PrdOverlay.vue'
import PlatformSideNav from '@/components/layout/PlatformSideNav.vue'
import FeaturePaywallModal from '@/components/newAI/FeaturePaywallModal.vue'

const route = useRoute()
const isAssistantRoute = computed(() => route.path === '/ai-app' || route.path === '/newAI/assistant')
</script>

<template>
  <div :class="['relative min-h-screen bg-[radial-gradient(circle_at_16%_0%,rgba(37,99,235,0.22),transparent_34%),linear-gradient(135deg,#eef7ff_0%,#ffffff_55%,#f7fbff_100%)] text-slate-950', isAssistantRoute && 'app-shell-height overflow-hidden']">
    <template v-if="isAssistantRoute">
      <main class="relative app-shell-height w-full overflow-hidden">
        <router-view />
      </main>
    </template>

    <template v-else>
      <div class="flex min-h-screen w-full overflow-hidden">
        <PlatformSideNav />
        <main class="relative min-w-0 flex-1 overflow-y-auto px-5 py-5 lg:px-7 lg:py-7">
          <div :key="route.path" class="page-enter mx-auto w-full max-w-[80rem]">
            <router-view />
          </div>
        </main>
      </div>
    </template>
    <FeaturePaywallModal />
    <PrdOverlay />
  </div>
</template>
