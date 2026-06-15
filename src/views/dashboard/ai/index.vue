<script setup lang="ts">
import { computed, ref } from 'vue'
import { X } from 'lucide-vue-next'
import ChatInterface from '@/components/aiApp/ChatInterface.vue'
import ReportPreviewPanel from '@/components/aiApp/ReportPreviewPanel.vue'
import DocumentWritingPanel from '@/components/aiApp/DocumentWritingPanel.vue'
import MeetingMinutesPanel from '@/components/aiApp/MeetingMinutesPanel.vue'
import PlatformSideNav from '@/components/layout/PlatformSideNav.vue'
import { AI_AGENT_OPTIONS, type AgentType, useAIAppStore } from '@/stores/aiApp'
import { useNewAIStore } from '@/stores/newAI'

defineOptions({ name: 'DashboardAI' })

const aiStore = useAIAppStore()
const newAIStore = useNewAIStore()
const sidebarOpen = ref(false)

const activeConversation = computed(() => aiStore.conversations.find(c => c.id === aiStore.activeConversationId) ?? null)
const splitAgentTypes = ['report', 'document', 'meeting'] as const
const reportPanelRequested = computed(() => activeConversation.value?.reportPanelOpen === true && splitAgentTypes.includes(activeConversation.value?.agentType as any))

const hasPanelContent = computed(() => {
  const conv = activeConversation.value
  if (!conv) return false
  return Boolean((conv.reportDocuments && conv.reportDocuments.length > 0) || conv.reportStatus === 'generating' || conv.reportStatus === 'done')
})

const showReportPreview = computed(() => reportPanelRequested.value && hasPanelContent.value)

function handleSend(content: string) {
  const quotaResult = newAIStore.consumeQuota({
    userName: newAIStore.currentAccount?.name || '用户名称',
    requests: 1,
    tokens: Math.max(content.length * 12, 320),
  })
  if (!quotaResult.allowed) {
    aiStore.error = quotaResult.reason
    return
  }
  aiStore.error = quotaResult.reason || null
  let convId = activeConversation.value?.id
  if (!convId) convId = aiStore.createConversation(aiStore.selectedAgentType)
  aiStore.sendMessage(convId, content)
}

function handleSendImage(image: string) {
  if (!newAIStore.requireFeature('ocr', 'OCR / 隐患识图')) return
  const quotaResult = newAIStore.consumeQuota({
    userName: newAIStore.currentAccount?.name || '用户名称',
    requests: 1,
    tokens: 880,
    storageGb: 1,
  })
  if (!quotaResult.allowed) {
    aiStore.error = quotaResult.reason
    return
  }
  aiStore.error = quotaResult.reason || null
  let convId = activeConversation.value?.id
  if (!convId) convId = aiStore.createConversation('hazard')
  const upload = newAIStore.createUpload('现场图片.png', 'image/png')
  newAIStore.finalizeUpload(upload.id, true)
  const ocrTask = newAIStore.createOcrTask(upload.name)
  aiStore.sendImageAnalysis(convId, image)
  newAIStore.logAudit('OCR 任务', 'create', '-', `${upload.name}/${ocrTask.id}`)
}

function handlePrompt(content: string) {
  handleSend(content)
}

function handleChangeAgent(agentType: AgentType) {
  if (agentType === 'hazard' && !newAIStore.requireFeature('ocr', 'OCR / 隐患识图')) return
  aiStore.setActiveAgent(agentType)
}
</script>

<template>
  <div class="relative app-shell-height w-full overflow-hidden bg-[radial-gradient(circle_at_18%_-8%,rgba(0,92,255,0.30),transparent_30%),radial-gradient(circle_at_92%_6%,rgba(35,190,255,0.22),transparent_28%),linear-gradient(180deg,#e9f4ff_0%,#f6fbff_42%,#ffffff_100%)] text-slate-950">
    <div class="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[linear-gradient(110deg,rgba(0,86,210,0.16),rgba(0,185,255,0.08),transparent)]" />
    <div class="pointer-events-none absolute right-10 top-8 h-40 w-40 rounded-[2.25rem] border border-white/50 bg-white/40 blur-[0.0625rem] rotate-12" />
    <div class="pointer-events-none absolute left-[34%] top-10 h-24 w-80 rounded-full bg-white/30 blur-3xl" />
    <div class="relative flex h-full overflow-hidden">
      <PlatformSideNav />

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
              <div class="flex items-center justify-between border-b border-slate-200 px-4 py-3 lg:hidden">
                <div>
                  <div class="text-sm font-semibold text-slate-950">极客光年安全大模型</div>
                  <div class="text-[0.6875rem] text-slate-500">安全生产智能应用工作台</div>
                </div>
                <button type="button" class="rounded-lg bg-white p-2 text-slate-700 ring-1 ring-slate-200" @click="sidebarOpen = false">
                  <X class="h-4 w-4" />
                </button>
              </div>
              <div class="min-h-0 flex-1 overflow-auto">
                <PlatformSideNav :always-visible="true" />
              </div>
            </div>
          </transition>
        </div>
      </transition>
    </div>
  </div>
</template>
