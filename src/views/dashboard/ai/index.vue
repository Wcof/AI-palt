<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Menu, X, Sparkles, Plus } from 'lucide-vue-next'
import ConversationSidebar from '@/components/aiApp/ConversationSidebar.vue'
import ChatInterface from '@/components/aiApp/ChatInterface.vue'
import { useAIAppStore } from '@/stores/aiApp'

defineOptions({ name: 'DashboardAI' })

const router = useRouter()
const aiStore = useAIAppStore()
const sidebarOpen = ref(false)
const sidebarCollapsed = ref(false)

const activeConversation = computed(() => aiStore.conversations.find(c => c.id === aiStore.activeConversationId) ?? null)

function handleCreate() {
  aiStore.createConversation()
  sidebarOpen.value = false
}

function handleSend(content: string) {
  let convId = activeConversation.value?.id
  if (!convId) convId = aiStore.createConversation()
  aiStore.sendMessage(convId, content)
}

function handleSendImage(image: string) {
  let convId = activeConversation.value?.id
  if (!convId) convId = aiStore.createConversation()
  aiStore.sendImageAnalysis(convId, image)
}

function handlePrompt(content: string) {
  handleSend(content)
}

function goToAbilities() {
  router.push('/abilities')
}
</script>

<template>
  <div class="h-full rounded-2xl border border-sky-200/70 bg-white/70 shadow-[inset_0_0_0_1px_rgba(0,180,255,0.08)]">
    <div class="relative flex h-full overflow-hidden">
      <div class="hidden md:block" :class="sidebarCollapsed ? 'w-16' : 'w-72'">
        <ConversationSidebar
          :conversations="aiStore.conversations"
          :active-id="aiStore.activeConversationId"
          :streaming-id="aiStore.streamingConversationId"
          :collapsed="sidebarCollapsed"
          @create="handleCreate"
          @select="aiStore.switchConversation"
          @delete="aiStore.deleteConversation"
          @toggle-collapse="sidebarCollapsed = !sidebarCollapsed"
        />
      </div>

      <div class="flex-1">
        <ChatInterface
          :conversation="activeConversation"
          :streaming="aiStore.streamingConversationId === aiStore.activeConversationId"
          :thinking-mode="aiStore.thinkingMode"
          :error="aiStore.error"
          @send="handleSend"
          @send-image="handleSendImage"
          @select-prompt="handlePrompt"
          @toggle-thinking="(v) => { aiStore.thinkingMode = v }"
          @retry="aiStore.retryLast"
          @open-sidebar="sidebarOpen = true"
          @go-to-abilities="goToAbilities"
        />
      </div>

      <transition
        enter-active-class="transition-opacity duration-200"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-150"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div v-if="sidebarOpen" class="fixed inset-0 z-40 md:hidden">
          <div class="absolute inset-0 bg-black/30" @click="sidebarOpen = false" />
          <transition
            enter-active-class="transition-transform duration-200"
            enter-from-class="-translate-x-full"
            enter-to-class="translate-x-0"
            leave-active-class="transition-transform duration-150"
            leave-from-class="translate-x-0"
            leave-to-class="-translate-x-full"
          >
            <div v-if="sidebarOpen" class="absolute left-0 top-0 h-full w-[82vw] max-w-[320px] bg-white/90 shadow-xl flex flex-col">
              <div class="flex items-center justify-between border-b border-sky-200/60 px-4 py-3">
                <div class="text-sm font-semibold text-slate-900">会话列表</div>
                <button type="button" class="rounded-lg bg-white/80 p-2 text-slate-700 ring-1 ring-sky-200/70" @click="sidebarOpen = false">
                  <X class="h-4 w-4" />
                </button>
              </div>
              <div class="border-b border-sky-200/60 px-4 py-3">
                <button
                  type="button"
                  @click="handleCreate"
                  class="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200/80 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 hover:border-slate-300/80"
                >
                  <Plus class="h-4 w-4" /> 新对话
                </button>
              </div>
              <div class="flex-1 overflow-auto">
                <ConversationSidebar
                  :conversations="aiStore.conversations"
                  :active-id="aiStore.activeConversationId"
                  :streaming-id="aiStore.streamingConversationId"
                  :collapsed="false"
                  :hide-header="true"
                  :hide-new-button="true"
                  @create="handleCreate"
                  @select="(id) => { aiStore.switchConversation(id); sidebarOpen = false }"
                  @delete="aiStore.deleteConversation"
                />
              </div>
              <div class="border-t border-sky-200/60 p-4">
                <button
                  type="button"
                  @click="goToAbilities"
                  class="flex w-full items-center justify-center gap-2 rounded-xl border border-sky-200/70 bg-white/80 px-3 py-2.5 text-sm font-medium text-slate-700 ring-1 ring-sky-200/70 transition hover:bg-white hover:border-sky-300/80"
                >
                  <Sparkles class="h-4 w-4" /> 更多能力
                </button>
              </div>
            </div>
          </transition>
        </div>
      </transition>
    </div>
  </div>
</template>
