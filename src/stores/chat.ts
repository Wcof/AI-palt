import { defineStore } from 'pinia'
import { ref } from 'vue'

export type ChatRole = 'user' | 'assistant' | 'system'

export type ChatMessage = {
  id: string
  role: ChatRole
  content: string
  createdAt: number
  image?: string
}

export const useChatStore = defineStore('chat', () => {
  const messages = ref<ChatMessage[]>([])
  const streaming = ref(false)
  const error = ref<string | null>(null)

  function setStreaming(v: boolean) { streaming.value = v }
  function setChatError(v: string | null) { error.value = v }
  function addMessage(msg: ChatMessage) { messages.value.push(msg) }
  function appendToLastAssistant(token: string) {
    const last = messages.value[messages.value.length - 1]
    if (last?.role === 'assistant') last.content += token
  }
  function clearChat() {
    messages.value = []
    streaming.value = false
    error.value = null
  }

  return { messages, streaming, error, setStreaming, setChatError, addMessage, appendToLastAssistant, clearChat }
})
