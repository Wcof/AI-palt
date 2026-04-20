<script setup lang="ts">
import { ref, computed } from 'vue'
import { useChatStore } from '@/stores/chat'
import { useDebouncedValue } from '@/composables/useDebouncedValue'
import { streamChatAnswer } from '@/api/chatStream'
import { trackEvent } from '@/utils/track'
import { Upload } from 'lucide-vue-next'

const props = defineProps<{
  title: string
  contextLabel: string
  selectedIds: string[]
  emptyHint: string
  imageOnly?: boolean
}>()

const chatStore = useChatStore()
const draft = ref('')
const inputRef = ref<HTMLTextAreaElement | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
const selectedImage = ref<string | null>(null)
let streamAbort: AbortController | null = null

const headerContext = computed(() => props.contextLabel.trim() || '未选择')
const canSend = computed(() => {
  if (props.imageOnly) {
    return selectedImage.value !== null && !chatStore.streaming
  }
  return draft.value.trim().length > 0 && draft.value.trim().length <= 5000 && !chatStore.streaming
})

function handleImageSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file && file.type.startsWith('image/')) {
    const reader = new FileReader()
    reader.onload = (e) => {
      selectedImage.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

function triggerImageUpload() {
  fileInputRef.value?.click()
}

function uid(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

function send() {
  if (chatStore.streaming) return

  if (props.imageOnly) {
    if (!selectedImage.value) return

    chatStore.addMessage({ id: uid('user'), role: 'user', content: '[图片]', createdAt: Date.now(), image: selectedImage.value })
    trackEvent('experience', 'send_image', 'hazard_detection')
    selectedImage.value = null

    chatStore.addMessage({ id: uid('assistant'), role: 'assistant', content: '', createdAt: Date.now() })

    const ac = new AbortController()
    streamAbort?.abort()
    streamAbort = ac

    chatStore.error = null
    chatStore.streaming = true

    const timeout = window.setTimeout(() => ac.abort(), 15000)

    // 模拟隐患识别响应
    setTimeout(() => {
      const response = '检测到以下安全隐患：\n\n1. 未佩戴安全帽（2人）\n   - 位置：作业区东侧\n   - 风险等级：高\n   - 整改建议：立即停工，佩戴安全帽后方可继续作业\n\n2. 高处作业未系安全带（1人）\n   - 位置：脚手架3层\n   - 风险等级：极高\n   - 整改建议：立即下撤，系好安全带并检查挂点牢固性\n\n3. 电气线路裸露\n   - 位置：配电箱附近\n   - 风险等级：中\n   - 整改建议：使用绝缘胶带包裹，并通知电工进行规范整改'

      for (let i = 0; i < response.length; i++) {
        setTimeout(() => {
          chatStore.appendToLastAssistant(response[i])
        }, i * 20)
      }

      setTimeout(() => {
        clearTimeout(timeout)
        chatStore.streaming = false
        trackEvent('experience', 'answer_done', '')
      }, response.length * 20 + 100)
    }, 500)

    return
  }

  const text = draft.value.trim()
  if (!text || text.length > 5000) return

  chatStore.addMessage({ id: uid('user'), role: 'user', content: text, createdAt: Date.now() })
  trackEvent('experience', 'send_message', text.slice(0, 40))
  draft.value = ''

  chatStore.addMessage({ id: uid('assistant'), role: 'assistant', content: '', createdAt: Date.now() })

  const ac = new AbortController()
  streamAbort?.abort()
  streamAbort = ac

  chatStore.error = null
  chatStore.streaming = true

  const timeout = window.setTimeout(() => ac.abort(), 15000)

  streamChatAnswer({
    question: text,
    kbIds: props.selectedIds,
    signal: ac.signal,
    onToken: (token: string) => chatStore.appendToLastAssistant(token),
  })
    .catch((e: any) => {
      const msg = typeof e?.message === 'string' ? e.message : '请求失败'
      chatStore.error = msg
      chatStore.appendToLastAssistant(`\n\n[错误] ${msg}`)
    })
    .finally(() => {
      clearTimeout(timeout)
      chatStore.streaming = false
      trackEvent('experience', 'answer_done', '')
    })
}

function clearChat() {
  streamAbort?.abort()
  chatStore.clearChat()
  selectedImage.value = null
  inputRef.value?.focus()
}
</script>

<template>
  <div class="flex h-full min-h-0 flex-col">
    <div class="flex items-center justify-between gap-3 border-b border-sky-200/60 px-4 py-3">
      <div class="min-w-0">
        <div class="truncate text-sm font-semibold text-slate-900">{{ title }}</div>
        <div class="mt-0.5 truncate text-xs text-slate-600">上下文：{{ headerContext }}</div>
      </div>
      <button type="button" @click="clearChat" class="rounded-xl bg-white/70 px-3 py-2 text-xs font-semibold text-slate-900 ring-1 ring-sky-200/70 transition hover:bg-white">清空对话</button>
    </div>

    <div class="min-h-0 flex-1 overflow-auto">
      <template v-if="chatStore.messages.length">
        <div v-for="m in chatStore.messages" :key="m.id" :class="m.role === 'user' ? 'flex justify-end px-4 py-2' : 'flex justify-start px-4 py-2'">
          <div :class="['max-w-[820px] rounded-2xl px-4 py-3 text-sm leading-6 ring-1', m.role === 'user' ? 'bg-gradient-to-r from-[#0098FF] to-[#006CFF] text-white ring-[#00B4FF]/40' : 'bg-white/75 text-slate-900 ring-sky-200/70']">
            <img v-if="m.image" :src="m.image" alt="上传的图片" class="max-w-full rounded-lg" />
            <div v-else class="whitespace-pre-wrap">{{ m.content }}</div>
          </div>
        </div>
      </template>
      <div v-else class="flex h-full items-center justify-center px-4 py-10 text-sm text-slate-500">{{ emptyHint }}</div>
    </div>

    <div class="border-t border-sky-200/60 px-4 py-3">
      <input ref="fileInputRef" type="file" accept="image/*" @change="handleImageSelect" class="hidden" />

      <div v-if="imageOnly" class="space-y-3">
        <div v-if="selectedImage" class="relative rounded-xl border border-sky-200/70 bg-white/80 p-2">
          <img :src="selectedImage" alt="预览" class="max-h-32 rounded-lg" />
          <button @click="selectedImage = null" class="absolute right-2 top-2 rounded-lg bg-slate-900/70 px-2 py-1 text-xs text-white hover:bg-slate-900">移除</button>
        </div>
        <div class="flex items-center gap-2">
          <button type="button" @click="triggerImageUpload" class="flex-1 rounded-xl border border-sky-200/70 bg-white/80 px-4 py-2 text-sm text-slate-700 transition hover:bg-white">
            <Upload class="inline h-4 w-4 mr-2" />
            {{ selectedImage ? '重新选择图片' : '上传图片' }}
          </button>
          <button type="button" @click="send" :disabled="!canSend" class="shrink-0 rounded-xl bg-gradient-to-r from-[#0098FF] to-[#006CFF] px-4 py-2 text-sm font-semibold text-white ring-1 ring-[#00B4FF]/55 transition hover:brightness-105 disabled:opacity-50">发送</button>
        </div>
      </div>

      <div v-else class="flex items-end gap-2">
        <textarea ref="inputRef" v-model="draft" @keydown.enter.exact.prevent="canSend && send()" rows="2" placeholder="输入问题..." class="min-h-[44px] flex-1 resize-none rounded-xl border border-sky-200/70 bg-white/80 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[#00B4FF]/55" />
        <button type="button" @click="send" :disabled="!canSend" class="shrink-0 rounded-xl bg-gradient-to-r from-[#0098FF] to-[#006CFF] px-4 py-2 text-sm font-semibold text-white ring-1 ring-[#00B4FF]/55 transition hover:brightness-105 disabled:opacity-50">发送</button>
      </div>
    </div>
  </div>
</template>
