<script setup lang="ts">
import PageFrame from '@/components/newAI/PageFrame.vue'
import WorkbenchKeys from '@/views/dashboard/workbench/keys.vue'
import { useNewAIStore } from '@/stores/newAI'

const store = useNewAIStore()
</script>

<template>
  <PageFrame title="API 密钥" desc="保留当前 mock CRUD，同时将 API Key 视作商业化授权和能力边界的一部分，用于演示项目、知识库、技能和智能体授权。">
    <template #meta>
      <div class="flex flex-wrap gap-2 text-xs">
        <span class="rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-700 ring-1 ring-emerald-200">状态：{{ store.getFeature('apiKey')?.status === 'enabled' ? '已开通' : '未开通' }}</span>
        <span class="rounded-full bg-white px-3 py-1.5 text-slate-600 ring-1 ring-slate-200">审计：delete / update 自动入日志</span>
      </div>
    </template>
    <WorkbenchKeys />
  </PageFrame>
</template>
