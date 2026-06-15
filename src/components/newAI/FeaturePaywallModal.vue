<script setup lang="ts">
import { Crown, X } from 'lucide-vue-next'
import { useNewAIStore } from '@/stores/newAI'

const store = useNewAIStore()
</script>

<template>
  <Teleport to="body">
    <div v-if="store.paywall.open" class="fixed inset-0 z-[540] flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-sm" @mousedown.self="store.closePaywall()">
      <div class="w-full max-w-md rounded-3xl border border-amber-200 bg-white p-6 shadow-2xl">
        <div class="flex items-start justify-between gap-4">
          <div>
            <div class="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
              <Crown class="h-3.5 w-3.5" /> 能力开通提示
            </div>
            <h3 class="mt-4 text-lg font-semibold text-slate-950">使用 {{ store.paywall.featureLabel }} 功能需要分配 {{ store.paywall.packageName }} License 版本</h3>
            <p class="mt-2 text-sm leading-6 text-slate-600">当前为原型演示环境，未接支付与真实授权服务。请在系统设置中创建或分配对应 License，或继续演示已开通功能。</p>
          </div>
          <button type="button" class="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800" @click="store.closePaywall()">
            <X class="h-4 w-4" />
          </button>
        </div>
        <div class="mt-6 flex justify-end">
          <button type="button" class="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white" @click="store.closePaywall()">我知道了</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
