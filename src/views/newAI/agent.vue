<script setup lang="ts">
import PageFrame from '@/components/newAI/PageFrame.vue'
import AIAgent from '@/views/ai/agent/index.vue'
import { useNewAIStore } from '@/stores/newAI'

const store = useNewAIStore()
</script>

<template>
  <PageFrame title="AI 智能体" desc="统一为工作台式列表管理入口，保留现有 mock 弹窗和使用链路，聚焦安全生产智能体展示。">
    <template #meta>
      <div class="flex flex-wrap gap-2 text-xs">
        <span class="rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-700 ring-1 ring-emerald-200">状态：{{ store.getFeature('agent')?.status === 'enabled' ? '已开通' : '未开通' }}</span>
        <span class="rounded-full bg-white px-3 py-1.5 text-slate-600 ring-1 ring-slate-200">默认模型：{{ store.activeModel.name }}</span>
      </div>
    </template>
    <AIAgent />
  </PageFrame>
</template>
