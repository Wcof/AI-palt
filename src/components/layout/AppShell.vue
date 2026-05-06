<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PrdOverlay from '@/components/prd/PrdOverlay.vue'
import ConversationSidebar from '@/components/aiApp/ConversationSidebar.vue'
import SystemSettingsModal from '@/components/settings/SystemSettingsModal.vue'
import { type AgentType, useAIAppStore } from '@/stores/aiApp'

const route = useRoute()
const router = useRouter()
const aiStore = useAIAppStore()
const sidebarCollapsed = ref(false)
const isAIAppRoute = computed(() => route.path === '/ai-app')

function handleCreate() {
  aiStore.createConversation('general', false)
  router.push('/ai-app')
}

function handleSelectConversation(id: string) {
  aiStore.switchConversation(id)
  router.push('/ai-app')
}

function handleSelectAgentApp(payload: { agentType: AgentType; name: string }) {
  aiStore.setActiveAgent(payload.agentType)
  router.push('/ai-app')
}
</script>

<template>
  <div :class="['relative min-h-screen bg-[radial-gradient(circle_at_16%_0%,rgba(37,99,235,0.22),transparent_34%),linear-gradient(135deg,#eef7ff_0%,#ffffff_55%,#f7fbff_100%)] text-slate-950', isAIAppRoute && 'app-shell-height overflow-hidden']">
    <template v-if="isAIAppRoute">
      <main class="relative app-shell-height w-full overflow-hidden">
        <router-view />
      </main>
    </template>

    <template v-else>
      <div class="flex min-h-screen w-full overflow-hidden">
        <div class="hidden app-sidebar-height shrink-0 md:block" :class="sidebarCollapsed ? 'w-[4.5rem]' : 'w-[clamp(16.25rem,22vw,20rem)]'">
          <ConversationSidebar
            :conversations="aiStore.sortedConversations"
            :active-id="aiStore.activeConversationId"
            :streaming-id="aiStore.streamingConversationId"
            :collapsed="sidebarCollapsed"
            @create="handleCreate"
            @select="handleSelectConversation"
            @delete="aiStore.deleteConversation"
            @toggle-collapse="sidebarCollapsed = !sidebarCollapsed"
            @select-agent-app="handleSelectAgentApp"
          />
        </div>
        <main class="relative min-w-0 flex-1 overflow-y-auto px-5 py-5 lg:px-7 lg:py-7">
          <div :key="route.path" class="page-enter mx-auto w-full max-w-[80rem]">
            <router-view />
          </div>
        </main>
      </div>
    </template>

    <SystemSettingsModal />
    <PrdOverlay />
  </div>
</template>
