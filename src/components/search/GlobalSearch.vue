<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Search } from 'lucide-vue-next'
import type { Ability } from '@/data/abilities'
import { fuzzyScore } from '@/utils/search'

const props = defineProps<{ abilities: Ability[]; class?: string }>()
const router = useRouter()
const keyword = ref('')
const focused = ref(false)
const activeIdx = ref(-1)

const suggestions = computed(() => {
  const k = keyword.value.trim()
  if (!k) return []
  return props.abilities
    .map(a => ({ a, score: fuzzyScore(k, `${a.name} ${a.apiName} ${a.summary}`) }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map(x => x.a)
})

function go(q: string) {
  keyword.value = ''
  focused.value = false
  router.push(`/search?keyword=${encodeURIComponent(q)}`)
}

function onBlur() { setTimeout(() => { focused.value = false }, 200) }

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'ArrowDown') { e.preventDefault(); activeIdx.value = Math.min(activeIdx.value + 1, suggestions.value.length - 1) }
  else if (e.key === 'ArrowUp') { e.preventDefault(); activeIdx.value = Math.max(activeIdx.value - 1, -1) }
  else if (e.key === 'Enter') {
    e.preventDefault()
    if (activeIdx.value >= 0 && suggestions.value[activeIdx.value]) go(suggestions.value[activeIdx.value].name)
    else if (keyword.value.trim()) go(keyword.value.trim())
  }
}
</script>

<template>
  <div :class="['relative', props.class]">
    <div class="flex items-center gap-2 rounded-2xl border border-sky-200/70 bg-white/80 px-4 py-3 ring-1 ring-sky-200/40 transition focus-within:border-[#00B4FF]/55 focus-within:ring-[#00B4FF]/30">
      <Search class="h-5 w-5 text-slate-400" />
      <input
        v-model="keyword"
        @focus="focused = true"
        @blur="onBlur"
        @keydown="onKeydown"
        type="text"
        placeholder="搜索能力名称、API、标签..."
        class="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
      />
    </div>
    <div v-if="focused && suggestions.length" class="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-sky-200/70 bg-white/95 shadow-xl backdrop-blur">
      <div
        v-for="(a, i) in suggestions" :key="a.id"
        @mousedown.prevent="go(a.name)"
        @mouseenter="activeIdx = i"
        :class="['cursor-pointer px-4 py-2.5 text-sm transition', i === activeIdx ? 'bg-[#00B4FF]/10 text-slate-900' : 'text-slate-700 hover:bg-slate-50']"
      >
        <div class="font-semibold">{{ a.name }}</div>
        <div class="mt-0.5 truncate text-xs text-slate-500">{{ a.apiName }} · {{ a.summary }}</div>
      </div>
    </div>
  </div>
</template>
