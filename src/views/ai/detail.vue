<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Check } from 'lucide-vue-next'
import { trackEvent } from '@/utils/track'
import { useSubscriptionsStore } from '@/stores/subscriptions'
import SubscribeModal from '@/components/abilities/SubscribeModal.vue'
import { knowledgeApi, KnowledgeDetail } from '@/mocks/ai/knowledge'
import { agentApi, AgentDetail } from '@/mocks/ai/agent'

defineOptions({ name: 'AIDetail' })

const route = useRoute()
const router = useRouter()
const subsStore = useSubscriptionsStore()

const loading = ref(false)
const knowledgeDetail = ref<KnowledgeDetail | null>(null)
const agentDetail = ref<AgentDetail | null>(null)
const showSubscribeModal = ref(false)
const currentType = ref<'knowledge' | 'agent'>('knowledge')

const isSubscribed = ref(false)
const detail = ref<any>(null)

function goBack() {
  router.push('/abilities')
}

function handleSubscribe() {
  if (!detail.value) return
  subsStore.subscribe({
    id: detail.value.id, 
    name: detail.value.name || detail.value.agentName,
    type: currentType.value === 'knowledge' ? 'RAG' : 'Agent',
    provider: '极客光年 AI 平台', 
    version: '1.0.0',
  })
  trackEvent('subscription', 'subscribe_ability', detail.value.name || detail.value.agentName)
}

function experienceLink() {
  if (!detail.value) return '/experience'
  if (currentType.value === 'knowledge') return `/experience?kb=${encodeURIComponent(detail.value.id)}`
  if (currentType.value === 'agent') return `/experience/agent?id=${encodeURIComponent(detail.value.id)}`
  return '/experience'
}

const fetchDetail = async () => {
  const id = route.params.id as string
  if (!id) return

  loading.value = true
  try {
    // 先尝试获取知识库详情
    const knowledgeResponse = await knowledgeApi.getDetail(id)
    if (knowledgeResponse.code === 200) {
      knowledgeDetail.value = knowledgeResponse.data
      detail.value = knowledgeResponse.data
      currentType.value = 'knowledge'
      isSubscribed.value = subsStore.isSubscribed(id)
      loading.value = false
      return
    }

    // 再尝试获取智能体详情
    const agentResponse = await agentApi.getDetail(id)
    if (agentResponse.code === 200) {
      agentDetail.value = agentResponse.data
      detail.value = agentResponse.data
      currentType.value = 'agent'
      isSubscribed.value = subsStore.isSubscribed(id)
    }
  } catch (error) {
    console.error('获取详情失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchDetail()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Loading -->
    <div v-if="loading" class="rounded-2xl border border-sky-200/70 bg-white/70 p-8">
      <div class="text-sm font-semibold text-slate-900">加载中...</div>
    </div>

    <!-- Not found -->
    <div v-else-if="!detail" class="rounded-2xl border border-sky-200/70 bg-white/70 p-8">
      <div class="text-sm font-semibold text-slate-900">能力不存在</div>
      <div class="mt-2 text-xs text-slate-600">请返回能力平台重新选择。</div>
      <button @click="goBack" class="mt-6 inline-flex items-center gap-2 rounded-xl bg-white/70 px-4 py-2 text-sm font-semibold text-slate-900 ring-1 ring-sky-200/70 transition hover:bg-white">
        <ArrowLeft class="h-4 w-4" /> 返回能力平台
      </button>
    </div>

    <!-- Knowledge Detail -->
    <div v-else-if="currentType === 'knowledge'" class="space-y-6">
      <!-- Header card -->
      <div class="rounded-2xl border border-sky-200/70 bg-white/70 p-8 shadow-[inset_0_0_0_1px_rgba(0,180,255,0.08)]">
        <div class="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div class="min-w-0">
            <div class="flex items-center gap-3">
              <span v-if="detail.iconPath" class="inline-flex h-12 w-12 items-center justify-center rounded-2xl overflow-hidden ring-1 ring-sky-200/70">
                <img :src="detail.iconPath" class="h-full w-full object-cover" />
              </span>
              <span v-else class="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(180deg,rgba(0,180,255,0.16),rgba(141,76,255,0.08))] ring-1 ring-sky-200/70">
                <BookOpen class="h-6 w-6 text-slate-900" />
              </span>
              <div class="min-w-0">
                <h2 class="truncate text-2xl font-semibold tracking-tight text-slate-900">{{ detail.name }}</h2>
              </div>
            </div>
            <p class="mt-5 max-w-[740px] text-sm leading-6 text-slate-700">{{ detail.descr }}</p>
            <div class="mt-6 flex flex-wrap gap-2">
              <span v-for="label in detail.labels" :key="label" class="rounded-full bg-[#00B4FF]/18 px-3 py-1.5 text-xs text-slate-800 ring-1 ring-[#00B4FF]/35">{{ label }}</span>
            </div>
          </div>
          <div class="flex flex-wrap items-center gap-3 md:justify-end">
            <button @click="goBack" class="inline-flex items-center gap-2 rounded-xl bg-white/70 px-4 py-2 text-sm font-semibold text-slate-900 ring-1 ring-sky-200/70 transition hover:bg-white"><ArrowLeft class="h-4 w-4" /> 返回列表</button>
            <button v-if="isSubscribed" disabled class="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-200 cursor-not-allowed"><Check class="h-4 w-4" /> 已订阅</button>
            <button v-else @click="showSubscribeModal = true" class="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#0098FF] to-[#006CFF] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition-all hover:brightness-105 active:scale-[0.98]">订阅</button>
          </div>
        </div>
        <div class="mt-8 grid gap-4 sm:grid-cols-3">
          <div class="rounded-2xl bg-white/70 px-4 py-4 ring-1 ring-sky-200/60">
            <div class="text-xs text-slate-600">更新时间</div>
            <div class="mt-2 text-lg font-semibold text-slate-900">{{ detail.updatedAt }}</div>
          </div>
          <div class="rounded-2xl bg-white/70 px-4 py-4 ring-1 ring-sky-200/60">
            <div class="text-xs text-slate-600">创建时间</div>
            <div class="mt-2 text-lg font-semibold text-slate-900">{{ detail.createdAt }}</div>
          </div>
          <div class="rounded-2xl bg-white/70 px-4 py-4 ring-1 ring-sky-200/60">
            <div class="text-xs text-slate-600">来源</div>
            <div class="mt-2 text-lg font-semibold text-slate-900">{{ detail.source }}</div>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="rounded-2xl border border-sky-200/70 bg-white/70 p-8">
        <div class="text-sm font-semibold text-slate-900 mb-4">知识库内容</div>
        <div class="prose prose-sm max-w-none" v-html="detail.content"></div>
      </div>

      <!-- API example -->
      <div class="rounded-2xl border border-sky-200/70 bg-white/70 p-6">
        <div class="flex items-center justify-between gap-3">
          <div class="text-sm font-semibold text-slate-900">在线体验</div>
          <router-link :to="experienceLink()" @click="trackEvent('experience','click_online_experience',detail.name)" class="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#0098FF] to-[#006CFF] px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(0,35,90,0.14)] ring-1 ring-[#00B4FF]/55 transition hover:brightness-105">立即体验</router-link>
        </div>
      </div>
    </div>

    <!-- Agent Detail -->
    <div v-else-if="currentType === 'agent'" class="space-y-6">
      <!-- Header card -->
      <div class="rounded-2xl border border-sky-200/70 bg-white/70 p-8 shadow-[inset_0_0_0_1px_rgba(0,180,255,0.08)]">
        <div class="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div class="min-w-0">
            <div class="flex items-center gap-3">
              <span v-if="detail.iconPath" class="inline-flex h-12 w-12 items-center justify-center rounded-2xl overflow-hidden ring-1 ring-sky-200/70">
                <img :src="detail.iconPath" class="h-full w-full object-cover" />
              </span>
              <span v-else class="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(180deg,rgba(0,180,255,0.16),rgba(141,76,255,0.08))] ring-1 ring-sky-200/70">
                <Bot class="h-6 w-6 text-slate-900" />
              </span>
              <div class="min-w-0">
                <h2 class="truncate text-2xl font-semibold tracking-tight text-slate-900">{{ detail.agentName }}</h2>
              </div>
            </div>
            <p class="mt-5 max-w-[740px] text-sm leading-6 text-slate-700">{{ detail.description }}</p>
            <div class="mt-6 flex flex-wrap gap-2">
              <span v-for="label in detail.labels" :key="label" class="rounded-full bg-[#00B4FF]/18 px-3 py-1.5 text-xs text-slate-800 ring-1 ring-[#00B4FF]/35">{{ label }}</span>
            </div>
          </div>
          <div class="flex flex-wrap items-center gap-3 md:justify-end">
            <button @click="goBack" class="inline-flex items-center gap-2 rounded-xl bg-white/70 px-4 py-2 text-sm font-semibold text-slate-900 ring-1 ring-sky-200/70 transition hover:bg-white"><ArrowLeft class="h-4 w-4" /> 返回列表</button>
            <button v-if="isSubscribed" disabled class="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-200 cursor-not-allowed"><Check class="h-4 w-4" /> 已订阅</button>
            <button v-else @click="showSubscribeModal = true" class="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#0098FF] to-[#006CFF] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition-all hover:brightness-105 active:scale-[0.98]">订阅</button>
          </div>
        </div>
        <div class="mt-8 grid gap-4 sm:grid-cols-3">
          <div class="rounded-2xl bg-white/70 px-4 py-4 ring-1 ring-sky-200/60">
            <div class="text-xs text-slate-600">更新时间</div>
            <div class="mt-2 text-lg font-semibold text-slate-900">{{ detail.updatedAt }}</div>
          </div>
          <div class="rounded-2xl bg-white/70 px-4 py-4 ring-1 ring-sky-200/60">
            <div class="text-xs text-slate-600">创建时间</div>
            <div class="mt-2 text-lg font-semibold text-slate-900">{{ detail.createdAt }}</div>
          </div>
          <div class="rounded-2xl bg-white/70 px-4 py-4 ring-1 ring-sky-200/60">
            <div class="text-xs text-slate-600">来源</div>
            <div class="mt-2 text-lg font-semibold text-slate-900">{{ detail.source }}</div>
          </div>
        </div>
      </div>

      <!-- Capabilities -->
      <div class="rounded-2xl border border-sky-200/70 bg-white/70 p-8">
        <div class="text-sm font-semibold text-slate-900 mb-4">核心能力</div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-for="(capability, index) in detail.capabilities" :key="index" class="rounded-xl bg-white/70 p-4 ring-1 ring-sky-200/60">
            <div class="text-sm font-medium text-slate-900">{{ capability }}</div>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="rounded-2xl border border-sky-200/70 bg-white/70 p-8">
        <div class="text-sm font-semibold text-slate-900 mb-4">智能体介绍</div>
        <div class="prose prose-sm max-w-none" v-html="detail.content"></div>
      </div>

      <!-- API example -->
      <div class="rounded-2xl border border-sky-200/70 bg-white/70 p-6">
        <div class="flex items-center justify-between gap-3">
          <div class="text-sm font-semibold text-slate-900">在线体验</div>
          <router-link :to="experienceLink()" @click="trackEvent('experience','click_online_experience',detail.agentName)" class="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#0098FF] to-[#006CFF] px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(0,35,90,0.14)] ring-1 ring-[#00B4FF]/55 transition hover:brightness-105">立即体验</router-link>
        </div>
      </div>
    </div>

    <SubscribeModal :is-open="showSubscribeModal" :ability-name="detail?.name || detail?.agentName" :ability-domain="currentType === 'knowledge' ? '知识库' : '智能体'" @close="showSubscribeModal = false" @confirm="handleSubscribe" />
  </div>
</template>

<script lang="ts">
// 导入图标
import { BookOpen, Bot } from 'lucide-vue-next'
</script>
