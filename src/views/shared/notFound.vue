<script setup lang="ts">
import { TriangleAlert } from 'lucide-vue-next'

defineOptions({ name: 'NotFound' })
</script>

<template>
  <div class="mx-auto max-w-2xl">
    <div class="rounded-2xl border border-sky-200/70 bg-white/70 p-8 shadow-[inset_0_0_0_1px_rgba(0,180,255,0.08)]">
      <div class="flex items-center gap-3">
        <span class="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(180deg,rgba(0,180,255,0.16),rgba(141,76,255,0.08))] ring-1 ring-sky-200/70">
          <TriangleAlert class="h-5 w-5 text-slate-900" />
        </span>
        <div>
          <div class="text-lg font-semibold text-slate-900">页面不存在</div>
          <div class="mt-1 text-sm text-slate-600">你访问的地址不存在或已被移动。</div>
        </div>
      </div>
      <div class="mt-6 flex flex-wrap gap-3">
        <router-link to="/" class="rounded-xl bg-gradient-to-r from-[#0098FF] to-[#006CFF] px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(0,35,90,0.14)] ring-1 ring-[#00B4FF]/55 transition hover:brightness-105">返回首页</router-link>
        <router-link to="/abilities" class="rounded-xl bg-white/80 px-4 py-2 text-sm font-semibold text-slate-900 ring-1 ring-sky-200/70 transition hover:bg-white">前往能力平台</router-link>
      </div>
    </div>
  </div>
</template>
