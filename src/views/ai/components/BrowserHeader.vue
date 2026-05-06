<script setup lang="ts">
  import { ReloadOutlined } from '@ant-design/icons-vue';
  import ModeSwitch, { type ListMode } from './ModeSwitch.vue';
  import type { SortKey } from '@/utils/abilityQuery';
  import type { AbilityDomain } from '@/data/abilities';

  const props = defineProps<{
    title: string;
    desc: string;
    mode: ListMode;
    sort: SortKey;
    keyword: string;
    domain?: AbilityDomain | null;
    activeTab?: 'mcp' | 'tools';
  }>();

  const emit = defineEmits<{
    modeChange: [m: ListMode];
    sortChange: [s: SortKey];
    reset: [];
    tabChange: [t: 'mcp' | 'tools'];
  }>();
</script>

<template>
  <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
    <div class="flex-1 min-w-0">
      <h2 class="text-2xl font-semibold tracking-tight text-slate-900">{{ title }}</h2>
      <p class="mt-2 text-sm text-slate-600">{{ desc }}</p>
      <div v-if="keyword" class="mt-2 text-xs text-slate-500">关键词：{{ keyword }}</div>
    </div>
    <div class="flex flex-wrap items-center gap-3 lg:flex-nowrap lg:gap-2 xl:gap-3">
      <!-- Tab切换器 (仅MCP域显示) -->
      <div v-if="domain === 'MCP'" class="flex items-center gap-1 rounded-lg bg-white/80 p-1 ring-1 ring-sky-200/70 flex-shrink-0">
        <div
          @click="emit('tabChange', 'mcp')"
          :class="[
            'rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer whitespace-nowrap',
            activeTab === 'mcp' ? 'bg-gradient-to-r from-[#0098FF] to-[#006CFF] text-white' : 'text-slate-600 hover:text-slate-900',
          ]"
        >
          MCP
        </div>
        <div
          @click="emit('tabChange', 'tools')"
          :class="[
            'rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer whitespace-nowrap',
            activeTab === 'tools' ? 'bg-gradient-to-r from-[#0098FF] to-[#006CFF] text-white' : 'text-slate-600 hover:text-slate-900',
          ]"
        >
          工具
        </div>
      </div>

      <ModeSwitch :model-value="mode" @update:model-value="emit('modeChange', $event)" class="flex-shrink-0" />
      <!-- <select :value="sort" @change="emit('sortChange', ($event.target as HTMLSelectElement).value as SortKey)" class="rounded-lg bg-white/80 px-3 py-2 text-sm text-slate-900 ring-1 ring-sky-200/70 flex-shrink-0 min-w-[80px]">
        <option value="recommend">推荐</option>
        <option value="latest">最新</option>
        <option value="calls">调用次数</option>
        <option value="rating">评分</option>
      </select> -->
      <button
        type="button"
        @click="emit('reset')"
        class="inline-flex items-center gap-2 rounded-lg bg-white/80 px-3 py-2 text-sm text-slate-900 ring-1 ring-sky-200/70 transition hover:bg-white flex-shrink-0 whitespace-nowrap"
      >
        <ReloadOutlined class="h-4 w-4" />
        重置
      </button>
    </div>
  </div>
</template>