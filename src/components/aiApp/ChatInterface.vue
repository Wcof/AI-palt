<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue'
import { Send, Sparkles, Menu, ArrowRight, ImagePlus, X, BrainCircuit, ChevronDown } from 'lucide-vue-next'
import type { Conversation } from '@/stores/aiApp'
import WelcomeScreen from '@/components/aiApp/WelcomeScreen.vue'

const props = defineProps<{
  conversation: Conversation | null
  streaming: boolean
  thinkingMode: boolean
  error: string | null
}>()

const emit = defineEmits<{
  (e: 'send', content: string): void
  (e: 'send-image', image: string): void
  (e: 'select-prompt', content: string): void
  (e: 'toggle-thinking', enabled: boolean): void
  (e: 'retry'): void
  (e: 'open-sidebar'): void
  (e: 'go-to-abilities'): void
}>()

const draft = ref('')
const selectedImage = ref<string | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
const listRef = ref<HTMLDivElement | null>(null)
const deepThinking = computed({
  get: () => props.thinkingMode,
  set: (v: boolean) => emit('toggle-thinking', v),
})

const scrollToBottom = () => {
  nextTick(() => {
    if (listRef.value) listRef.value.scrollTop = listRef.value.scrollHeight
  })
}

watch(() => props.conversation?.messages.length, () => scrollToBottom())

function handleSend() {
  const text = draft.value.trim()
  if (!text || props.streaming) return
  emit('send', text)
  draft.value = ''
}

function triggerImageUpload() {
  fileInputRef.value?.click()
}

function handleImageChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file || !file.type.startsWith('image/')) return
  const reader = new FileReader()
  reader.onload = () => { selectedImage.value = String(reader.result || '') }
  reader.readAsDataURL(file)
}

function clearSelectedImage() {
  selectedImage.value = null
  if (fileInputRef.value) fileInputRef.value.value = ''
}

function handleSendImage() {
  if (!selectedImage.value || props.streaming) return
  emit('send-image', selectedImage.value)
  clearSelectedImage()
}

function handlePromptSelect(text: string) {
  emit('select-prompt', text)
}

function goToAbilities() {
  emit('go-to-abilities')
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function renderRichContent(text: string) {
  const escaped = escapeHtml(text)
  const highlighted = escaped.replace(
    /《[^》]+》/g,
    (m) => `<a href="javascript:void(0)" class="text-sky-600 underline decoration-dotted underline-offset-2 hover:text-sky-700 cursor-pointer">${m}</a>`
  )
  return highlighted.replace(/\n/g, '<br />')
}

type ReasoningView = {
  hasReasoning: boolean
  steps: string[]
  finalText: string
}

function parseReasoningContent(content: string): ReasoningView {
  const lines = content.split('\n')
  const steps: string[] = []
  let firstResultLine = -1

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i].trim()
    if (line.startsWith('思考过程 ')) {
      steps.push(line)
      continue
    }
    if (firstResultLine === -1 && (line.startsWith('识图结果') || line.startsWith('分析结果') || line.startsWith('检测结果'))) {
      firstResultLine = i
      break
    }
  }

  const finalText = firstResultLine === -1
    ? (steps.length ? lines.filter(l => !l.trim().startsWith('思考过程 ')).join('\n').trim() : content)
    : lines.slice(firstResultLine).join('\n').trim()

  return {
    hasReasoning: steps.length > 0,
    steps,
    finalText,
  }
}
</script>

<template>
  <div class="flex h-full min-h-0 flex-col">
    <div class="flex flex-wrap items-center justify-between gap-3 border-b border-sky-200/60 px-4 py-3">
      <div class="flex items-center gap-3 min-w-0">
        <button type="button" class="md:hidden rounded-lg bg-white/70 p-2 text-slate-700 ring-1 ring-sky-200/70" @click="emit('open-sidebar')">
          <Menu class="h-4 w-4" />
        </button>
        <div class="min-w-0">
          <div class="truncate text-sm font-semibold text-slate-900">{{ conversation?.title || '请选择会话' }}</div>
          <div class="mt-0.5 truncate text-xs text-slate-600">AI 智能助手 · 安全生产场景</div>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <button
          type="button"
          @click="goToAbilities"
          class="hidden sm:flex items-center gap-1.5 rounded-lg border border-sky-200/70 bg-white/80 px-3 py-1.5 text-xs font-medium text-slate-700 ring-1 ring-sky-200/70 transition hover:bg-white hover:border-sky-300/80"
        >
          <Sparkles class="h-3.5 w-3.5" />
          <span>更多能力</span>
        </button>
        <div v-if="streaming" class="rounded-full px-3 py-1 text-[11px] ring-1" :class="thinkingMode ? 'bg-[#7C3AED]/10 text-[#7C3AED] ring-[#7C3AED]/30' : 'bg-[#00B4FF]/10 text-[#0077CC] ring-[#00B4FF]/30'">
          {{ thinkingMode ? 'AI 正在深度思考中…' : 'AI 正在输入…' }}
        </div>
      </div>
    </div>

    <div ref="listRef" class="min-h-0 flex-1 overflow-auto">
      <template v-if="conversation && conversation.messages.length">
        <div v-for="m in conversation.messages" :key="m.id" :class="m.role === 'user' ? 'flex justify-end px-4 py-2' : 'flex justify-start px-4 py-2'">
          <div :class="['max-w-[820px] rounded-2xl px-4 py-3 text-sm leading-6 ring-1', m.role === 'user' ? 'bg-gradient-to-r from-[#0098FF] to-[#006CFF] text-white ring-[#00B4FF]/40' : thinkingMode ? 'bg-white/80 text-slate-900 ring-[#7C3AED]/25' : 'bg-white/75 text-slate-900 ring-sky-200/70']">
            <img v-if="m.image" :src="m.image" alt="隐患识图上传图片" class="mb-2 max-h-60 w-auto rounded-xl border border-white/30 object-contain" />
            <div v-if="m.role === 'assistant'" class="max-h-[360px] overflow-auto pr-1">
              <template v-if="parseReasoningContent(m.content).hasReasoning">
                <details class="mb-3 rounded-xl border border-slate-200/80 bg-slate-50/90 p-2.5 open:bg-slate-50" open>
                  <summary class="flex cursor-pointer list-none items-center justify-between gap-3 text-xs font-medium text-slate-700">
                    <span class="inline-flex items-center gap-1.5">
                      <BrainCircuit class="h-3.5 w-3.5 text-slate-600" />
                      思考过程（{{ parseReasoningContent(m.content).steps.length }}）
                    </span>
                    <ChevronDown class="h-3.5 w-3.5 text-slate-500 transition details-open:rotate-180" />
                  </summary>
                  <div class="mt-2 space-y-1.5">
                    <div
                      v-for="(step, idx) in parseReasoningContent(m.content).steps"
                      :key="`${m.id}-step-${idx}`"
                      class="flex items-start gap-2 rounded-lg border border-slate-200/70 bg-white/90 px-2.5 py-1.5 text-xs text-slate-700"
                    >
                      <span class="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[10px] font-semibold text-slate-700">
                        {{ idx + 1 }}
                      </span>
                      <span class="leading-5">{{ step.replace(/^思考过程\s*\d+\/\d+：/, '').trim() }}</span>
                    </div>
                  </div>
                </details>
                <div
                  v-if="parseReasoningContent(m.content).finalText"
                  class="break-words leading-6"
                  v-html="renderRichContent(parseReasoningContent(m.content).finalText)"
                />
              </template>
              <div v-else class="break-words leading-6" v-html="renderRichContent(m.content)" />
            </div>
            <div v-else class="whitespace-pre-wrap">{{ m.content }}</div>
          </div>
        </div>
      </template>
      <WelcomeScreen v-else @select-prompt="handlePromptSelect" />
    </div>

    <div class="border-t border-sky-200/60 px-4 py-3">
      <input ref="fileInputRef" type="file" accept="image/*" class="hidden" @change="handleImageChange" />
      <div v-if="error" class="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-200/70 bg-rose-50/70 px-3 py-2 text-xs text-rose-700">
        <span>请求失败：{{ error }}</span>
        <button type="button" @click="emit('retry')" class="rounded-lg bg-white/80 px-2 py-1 text-[11px] font-semibold text-rose-700 ring-1 ring-rose-200/70 transition hover:bg-white">重试</button>
      </div>
      <div class="rounded-2xl border border-sky-200/70 bg-white/80 px-3 py-2 shadow-[0_12px_30px_rgba(0,35,90,0.06)]">
        <div class="flex flex-wrap items-center justify-between gap-2 pb-2">
          <label class="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-[11px] text-slate-700 ring-1 ring-sky-200/70">
            <input type="checkbox" v-model="deepThinking" class="h-3 w-3 accent-[#7C3AED]" />
            <span class="flex items-center gap-1">
              <Sparkles class="h-3.5 w-3.5 text-[#7C3AED]" />
              深度思考模式
            </span>
          </label>
          <span class="text-[11px] text-slate-500">Enter 发送 · Shift+Enter 换行</span>
        </div>
        <div v-if="selectedImage" class="mb-2 flex items-start gap-2 rounded-xl border border-sky-200/70 bg-white/90 p-2">
          <img :src="selectedImage" alt="待发送图片" class="h-20 w-28 rounded-lg object-cover" />
          <div class="flex min-w-0 flex-1 flex-col gap-2">
            <div class="text-xs text-slate-600">已选择图片，点击“识图发送”进入隐患分析流程。</div>
            <div class="flex items-center gap-2">
              <button type="button" @click="handleSendImage" :disabled="streaming || !conversation" class="rounded-lg bg-gradient-to-r from-[#0098FF] to-[#006CFF] px-3 py-1.5 text-xs font-semibold text-white ring-1 ring-[#00B4FF]/55 transition hover:brightness-105 disabled:opacity-50">
                识图发送
              </button>
              <button type="button" @click="clearSelectedImage" class="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-sky-200/70 transition hover:bg-slate-50">
                取消
              </button>
            </div>
          </div>
          <button type="button" @click="clearSelectedImage" class="rounded-md p-1 text-slate-500 hover:bg-slate-100">
            <X class="h-4 w-4" />
          </button>
        </div>
        <div class="flex items-end gap-2">
          <textarea
            v-model="draft"
            @keydown.enter.exact.prevent="handleSend"
            rows="2"
            placeholder="输入问题..."
            class="min-h-[48px] flex-1 resize-none rounded-xl border border-transparent bg-transparent px-2 py-2 text-sm text-slate-900 outline-none transition focus:border-[#00B4FF]/55"
          />
          <button
            type="button"
            @click="triggerImageUpload"
            :disabled="streaming || !conversation"
            class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-700 ring-1 ring-sky-200/70 transition hover:bg-slate-50 disabled:opacity-50"
            title="上传图片进行隐患识图"
          >
            <ImagePlus class="h-4 w-4" />
          </button>
          <button type="button" @click="handleSend" :disabled="!draft.trim() || streaming || !conversation" class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-[#0098FF] to-[#006CFF] text-white ring-1 ring-[#00B4FF]/55 transition hover:brightness-105 disabled:opacity-50">
            <Send class="h-4 w-4" />
          </button>
        </div>
      </div>
      <div v-if="!conversation" class="mt-2 text-[11px] text-slate-500">先选择会话或创建新对话，再开始提问。</div>
    </div>
  </div>
</template>
