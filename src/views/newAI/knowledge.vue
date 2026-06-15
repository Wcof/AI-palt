<script setup lang="ts">
import PageFrame from '@/components/newAI/PageFrame.vue'
import AIKnowledge from '@/views/ai/knowladge/index.vue'
import { useNewAIStore } from '@/stores/newAI'

const store = useNewAIStore()
</script>

<template>
  <PageFrame title="AI 知识库" desc="对齐线上 newAI 的列表管理结构，保留本地 mock CRUD 和详情弹窗，不接真实检索服务。">
    <template #meta>
      <div class="flex flex-wrap gap-2 text-xs">
        <span class="rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-700 ring-1 ring-emerald-200">状态：{{ store.getFeature('knowledge')?.status === 'enabled' ? '已开通' : '未开通' }}</span>
        <span class="rounded-full bg-white px-3 py-1.5 text-slate-600 ring-1 ring-slate-200">来源：本地 mock / Pinia</span>
      </div>
    </template>
    <AIKnowledge />
  </PageFrame>
</template>
