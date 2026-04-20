import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useKnowledgeStore = defineStore('knowledge', () => {
  const loadedKbIds = ref<string[]>([])
  const selectedKbIds = ref<string[]>([])
  const activePreviewKbId = ref<string | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  function setLoading(v: boolean) { loading.value = v }
  function setError(v: string | null) { error.value = v }
  function addLoadedKb(id: string) {
    loadedKbIds.value = [id]
    selectedKbIds.value = [id]
    activePreviewKbId.value = id
  }
  function addLoadedKbs(ids: string[]) {
    const id = ids[0]
    if (!id) return
    loadedKbIds.value = [id]
    selectedKbIds.value = [id]
    activePreviewKbId.value = id
  }
  function removeLoadedKb(id: string) {
    loadedKbIds.value = loadedKbIds.value.filter(x => x !== id)
    selectedKbIds.value = selectedKbIds.value.filter(x => x !== id)
    if (activePreviewKbId.value === id) activePreviewKbId.value = null
  }
  function toggleSelectedKb(id: string) {
    selectedKbIds.value = [id]
    activePreviewKbId.value = id
  }
  function setActivePreviewKb(id: string | null) { activePreviewKbId.value = id }
  function resetKnowledge() {
    loadedKbIds.value = []
    selectedKbIds.value = []
    activePreviewKbId.value = null
    loading.value = false
    error.value = null
  }

  return { loadedKbIds, selectedKbIds, activePreviewKbId, loading, error, setLoading, setError, addLoadedKb, addLoadedKbs, removeLoadedKb, toggleSelectedKb, setActivePreviewKb, resetKnowledge }
}, {
  persist: true,
})
