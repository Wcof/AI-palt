<script setup lang="ts">
import { computed } from 'vue'
import { X } from 'lucide-vue-next'
import SystemSettings from '@/views/ai/settings/systemSettings.vue'
import { useSystemStore } from '@/stores/system'

const systemStore = useSystemStore()
const open = computed(() => systemStore.settingsOpen)
</script>

<template>
  <Teleport to="body">
    <transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="open" class="fixed inset-0 z-[100] flex items-center justify-center bg-blue-950/30 px-4 py-6 backdrop-blur-md" @click.self="systemStore.closeSettings()">
        <transition
          enter-active-class="transition duration-200"
          enter-from-class="scale-[0.98] translate-y-2 opacity-0"
          enter-to-class="scale-100 translate-y-0 opacity-100"
          leave-active-class="transition duration-150"
          leave-from-class="scale-100 translate-y-0 opacity-100"
          leave-to-class="scale-[0.98] translate-y-2 opacity-0"
        >
          <section class="flex h-[88vh] w-full max-w-[1360px] flex-col overflow-hidden rounded-[28px] border border-white/60 bg-white/95 shadow-[0_34px_100px_rgba(15,23,42,0.28)] backdrop-blur-2xl">
            <header class="flex items-center justify-between border-b border-slate-200/80 px-5 py-4">
              <div>
                <div class="text-base font-semibold text-slate-950">设置</div>
                <div class="mt-0.5 text-xs text-slate-500">集中管理系统配置、NL2SQL 配置、AI 技能、知识库、智能体上下架与报告配置。</div>
              </div>
              <button
                type="button"
                class="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200 hover:text-slate-950"
                @click="systemStore.closeSettings()"
                aria-label="关闭设置"
              >
                <X class="h-4 w-4" />
              </button>
            </header>
            <div class="min-h-0 flex-1 overflow-hidden">
              <SystemSettings />
            </div>
          </section>
        </transition>
      </div>
    </transition>
  </Teleport>
</template>
