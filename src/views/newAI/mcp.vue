<script setup lang="ts">
import { computed, ref } from 'vue'
import { Play, UploadCloud } from 'lucide-vue-next'
import PageFrame from '@/components/newAI/PageFrame.vue'
import AIMcp from '@/views/ai/mcp/index.vue'
import { useNewAIStore } from '@/stores/newAI'

const store = useNewAIStore()
const toolName = ref('OCR 文字识别 MCP')
const params = ref('{"scene":"hazard","image":"site-photo.png"}')
const imageName = ref('site-photo.png')
const shouldFail = ref(false)
const latest = computed(() => store.toolTests[0])

function runTest() {
  if (!store.requireFeature('mcp', 'MCP 在线测试')) return
  store.runToolTest({ toolName: toolName.value, params: params.value, imageName: imageName.value, shouldFail: shouldFail.value })
}
</script>

<template>
  <PageFrame title="AI 技能" desc="保持 MCP / Skill 列表管理，同时新增在线测试面板，支持 mock 输入参数、上传图片和返回 JSON 查看。">
    <template #meta>
      <div class="flex flex-wrap gap-2 text-xs">
        <span class="rounded-full bg-amber-50 px-3 py-1.5 text-amber-700 ring-1 ring-amber-200">状态：{{ store.getFeature('mcp')?.status === 'enabled' ? '已开通' : '需付费' }}</span>
        <span class="rounded-full bg-white px-3 py-1.5 text-slate-600 ring-1 ring-slate-200">最近测试：{{ store.toolTests.length }} 次</span>
      </div>
    </template>

    <div class="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
      <AIMcp />
      <aside class="rounded-[1.75rem] border border-sky-200/70 bg-white/80 p-5 shadow-[0_18px_56px_rgba(14,116,144,0.08)]">
        <div class="text-sm font-semibold text-slate-950">在线测试</div>
        <div class="mt-1 text-xs leading-5 text-slate-500">支持 mock 输入参数、上传图片、执行测试、查看返回 JSON、耗时、状态码和日志 ID。</div>
        <div class="mt-4 space-y-3">
          <label class="block text-xs font-semibold text-slate-700">工具名称
            <input v-model="toolName" class="mt-1 w-full rounded-xl border border-sky-200 bg-white px-3 py-2 text-sm font-normal outline-none" />
          </label>
          <label class="block text-xs font-semibold text-slate-700">上传图片
            <div class="mt-1 flex items-center gap-2 rounded-xl border border-dashed border-sky-200 bg-sky-50/70 px-3 py-2 text-sm text-slate-600">
              <UploadCloud class="h-4 w-4 text-sky-600" /> {{ imageName }}
            </div>
          </label>
          <label class="block text-xs font-semibold text-slate-700">输入参数
            <textarea v-model="params" rows="6" class="mt-1 w-full rounded-xl border border-sky-200 bg-white px-3 py-2 text-sm font-normal outline-none" />
          </label>
          <label class="flex items-center gap-2 text-xs text-slate-700">
            <input v-model="shouldFail" type="checkbox" class="h-4 w-4" />
            模拟失败案例并写入样本池
          </label>
          <button type="button" class="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-2 text-sm font-semibold text-white" @click="runTest">
            <Play class="h-4 w-4" /> 执行测试
          </button>
        </div>
        <div v-if="latest" class="mt-5 rounded-2xl bg-slate-950 p-4 text-xs text-slate-100">
          <div>状态码：{{ latest.statusCode }}</div>
          <div>耗时：{{ latest.latencyMs }}ms</div>
          <div>日志：{{ latest.logId }}</div>
          <pre class="mt-3 overflow-auto whitespace-pre-wrap">{{ latest.response }}</pre>
        </div>
      </aside>
    </div>
  </PageFrame>
</template>
