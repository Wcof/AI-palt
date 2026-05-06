<script setup lang="ts">
import { computed, ref } from 'vue'
import { X, Sparkles } from 'lucide-vue-next'
import ConversationSidebar from '@/components/aiApp/ConversationSidebar.vue'
import ChatInterface from '@/components/aiApp/ChatInterface.vue'
import ReportPreviewPanel from '@/components/aiApp/ReportPreviewPanel.vue'
import DocumentWritingPanel from '@/components/aiApp/DocumentWritingPanel.vue'
import MeetingMinutesPanel from '@/components/aiApp/MeetingMinutesPanel.vue'
import { AI_AGENT_OPTIONS, type AgentType, useAIAppStore } from '@/stores/aiApp'

defineOptions({ name: 'DashboardAI' })

const aiStore = useAIAppStore()
const sidebarOpen = ref(false)
const sidebarCollapsed = ref(false)

const activeConversation = computed(() => aiStore.conversations.find(c => c.id === aiStore.activeConversationId) ?? null)
const splitAgentTypes = ['report', 'document', 'meeting'] as const
const reportPanelRequested = computed(() => activeConversation.value?.reportPanelOpen === true && splitAgentTypes.includes(activeConversation.value?.agentType as any))

const hasPanelContent = computed(() => {
  const conv = activeConversation.value
  if (!conv) return false
  return Boolean((conv.reportDocuments && conv.reportDocuments.length > 0) || conv.reportStatus === 'generating' || conv.reportStatus === 'done')
})

const showReportPreview = computed(() => reportPanelRequested.value && hasPanelContent.value)
const effectiveSidebarCollapsed = computed(() => sidebarCollapsed.value)

function handleCreate() {
  aiStore.createConversation('general', false)
  sidebarOpen.value = false
}

function handleSend(content: string) {
  let convId = activeConversation.value?.id
  if (!convId) convId = aiStore.createConversation(aiStore.selectedAgentType)
  aiStore.sendMessage(convId, content)
}

function handleSendImage(image: string) {
  let convId = activeConversation.value?.id
  if (!convId) convId = aiStore.createConversation('hazard')
  aiStore.sendImageAnalysis(convId, image)
}

function handlePrompt(content: string) {
  handleSend(content)
}

function handleChangeAgent(agentType: AgentType) {
  aiStore.setActiveAgent(agentType)
}

function handleSelectAgentApp(payload: { agentType: AgentType; name: string }) {
  aiStore.setActiveAgent(payload.agentType)
  if (!aiStore.activeConversationId) {
    aiStore.createConversation(payload.agentType, true)
  }
  sidebarOpen.value = false
}
</script>

<template>
  <div class="relative app-shell-height w-full overflow-hidden bg-[radial-gradient(circle_at_18%_-8%,rgba(0,92,255,0.30),transparent_30%),radial-gradient(circle_at_92%_6%,rgba(35,190,255,0.22),transparent_28%),linear-gradient(180deg,#e9f4ff_0%,#f6fbff_42%,#ffffff_100%)] text-slate-950">
    <div class="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[linear-gradient(110deg,rgba(0,86,210,0.16),rgba(0,185,255,0.08),transparent)]" />
    <div class="pointer-events-none absolute right-10 top-8 h-40 w-40 rounded-[2.25rem] border border-white/50 bg-white/40 blur-[0.0625rem] rotate-12" />
    <div class="pointer-events-none absolute left-[34%] top-10 h-24 w-80 rounded-full bg-white/30 blur-3xl" />
    <div class="relative flex h-full overflow-hidden">
      <div class="hidden md:block" :class="effectiveSidebarCollapsed ? 'w-[4.5rem]' : 'w-[clamp(16.25rem,22vw,20rem)]'">
        <ConversationSidebar
          :conversations="aiStore.sortedConversations"
          :active-id="aiStore.activeConversationId"
          :streaming-id="aiStore.streamingConversationId"
          :collapsed="effectiveSidebarCollapsed"
          @create="handleCreate"
          @select="aiStore.switchConversation"
          @delete="aiStore.deleteConversation"
          @toggle-collapse="sidebarCollapsed = !sidebarCollapsed"
          @select-agent-app="handleSelectAgentApp"
        />
      </div>

      <div class="min-w-0 flex flex-1 overflow-hidden">
        <div :class="showReportPreview ? 'min-w-0 flex-1 bg-blue-50/40 backdrop-blur-sm lg:flex-[0_0_50%]' : 'min-w-0 flex-1 bg-blue-50/40 backdrop-blur-sm'">
          <ChatInterface
            :conversation="activeConversation"
            :streaming="aiStore.streamingConversationId === aiStore.activeConversationId"
            :thinking-mode="aiStore.thinkingMode"
            :error="aiStore.error"
            :agents="AI_AGENT_OPTIONS"
            :selected-agent="aiStore.selectedAgentType"
            :agent-focused="aiStore.agentFocused"
            @send="handleSend"
            @send-image="handleSendImage"
            @select-prompt="handlePrompt"
            @toggle-thinking="(v) => { aiStore.thinkingMode = v }"
            @change-agent="handleChangeAgent"
            @clear-agent="aiStore.clearAgentFocus"
            @open-report-panel="activeConversation && aiStore.openReportPanel(activeConversation.id)"
            @select-report-document="(id) => activeConversation && aiStore.setActiveReportDocument(activeConversation.id, id)"
            @retry="aiStore.retryLast"
            @open-sidebar="sidebarOpen = true"
          />
        </div>

        <ReportPreviewPanel
          v-if="showReportPreview && activeConversation?.agentType === 'report'"
          :conversation="activeConversation"
          :streaming="aiStore.streamingConversationId === aiStore.activeConversationId"
          @close="activeConversation && aiStore.closeReportPanel(activeConversation.id)"
        />

        <DocumentWritingPanel
          v-else-if="showReportPreview && activeConversation?.agentType === 'document'"
          :conversation="activeConversation"
          :streaming="aiStore.streamingConversationId === aiStore.activeConversationId"
          @close="activeConversation && aiStore.closeReportPanel(activeConversation.id)"
          @select-document="(id) => activeConversation && aiStore.setActiveReportDocument(activeConversation.id, id)"
        />

        <MeetingMinutesPanel
          v-else-if="showReportPreview && activeConversation?.agentType === 'meeting'"
          :conversation="activeConversation"
          :streaming="aiStore.streamingConversationId === aiStore.activeConversationId"
          @close="activeConversation && aiStore.closeReportPanel(activeConversation.id)"
          @select-document="(id) => activeConversation && aiStore.setActiveReportDocument(activeConversation.id, id)"
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
          <div class="absolute inset-0 bg-blue-950/20" @click="sidebarOpen = false" />
          <transition
            enter-active-class="transition-transform duration-200"
            enter-from-class="-translate-x-full"
            enter-to-class="translate-x-0"
            leave-active-class="transition-transform duration-150"
            leave-from-class="translate-x-0"
            leave-to-class="-translate-x-full"
          >
            <div v-if="sidebarOpen" class="absolute left-0 top-0 flex h-full w-[86vw] max-w-[21.25rem] flex-col bg-white/90 shadow-2xl backdrop-blur-xl">
              <div class="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                <div>
                  <div class="text-sm font-semibold text-slate-950">极客光年安全大模型</div>
                  <div class="text-[0.6875rem] text-slate-500">安全生产智能应用工作台</div>
                </div>
                <button type="button" class="rounded-lg bg-white p-2 text-slate-700 ring-1 ring-slate-200" @click="sidebarOpen = false">
                  <X class="h-4 w-4" />
                </button>
              </div>
              <div class="min-h-0 flex-1 overflow-auto">
                <ConversationSidebar
                  :conversations="aiStore.sortedConversations"
                  :active-id="aiStore.activeConversationId"
                  :streaming-id="aiStore.streamingConversationId"
                  :collapsed="false"
                  :hide-header="true"
                  @create="handleCreate"
                  @select="(id) => { aiStore.switchConversation(id); sidebarOpen = false }"
                  @delete="aiStore.deleteConversation"
                  @select-agent-app="handleSelectAgentApp"
                />
              </div>
              <div class="border-t border-slate-200 p-4 text-[0.6875rem] leading-5 text-slate-500">
                <span class="inline-flex items-center gap-1.5"><Sparkles class="h-3.5 w-3.5" /> 主导航已收敛到左侧栏。</span>
              </div>
            </div>
          </transition>
        </div>
      </transition>
    </div>
  </div>
</template>
