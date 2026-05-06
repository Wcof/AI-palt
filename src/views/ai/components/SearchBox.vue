<script setup lang="ts">
  import { ref, watch } from 'vue';
  import type { AbilityDomain } from '@/data/abilities';

  const props = defineProps<{
    modelValue: string;
    domain: AbilityDomain | null;
  }>();

  const emit = defineEmits<{
    'update:modelValue': [value: string];
    search: [value: string];
    clear: [];
  }>();

  const localValue = ref(props.modelValue);

  watch(
    () => props.modelValue,
    (newValue) => {
      localValue.value = newValue;
    }
  );

  const handleSearch = () => {
    emit('search', localValue.value);
  };

  const handleClear = () => {
    localValue.value = '';
    emit('clear');
  };

  const handleInput = (e: Event) => {
    const value = (e.target as HTMLInputElement).value;
    localValue.value = value;
    emit('update:modelValue', value);
  };

  const placeholder = props.domain === 'MCP' ? '搜索AI技能名称' : '搜索能力名称 / 描述 / 标签';
</script>

<template>
  <div class="space-y-2">
    <input
      :value="localValue"
      @input="handleInput"
      @keydown.enter="handleSearch"
      :placeholder="placeholder"
      class="w-full rounded-xl border border-sky-200/70 bg-white/80 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[#00B4FF]/55"
    />
    <div class="flex items-center gap-2">
      <button
        type="button"
        @click="handleSearch"
        class="rounded-lg bg-gradient-to-r from-[#0098FF] to-[#006CFF] px-3 py-2 text-xs font-semibold text-white ring-1 ring-[#00B4FF]/55 transition hover:brightness-105"
      >
        搜索
      </button>
      <button
        type="button"
        @click="handleClear"
        class="rounded-lg bg-white/80 px-3 py-2 text-xs font-semibold text-slate-900 ring-1 ring-sky-200/70 transition hover:bg-white"
      >
        清空
      </button>
    </div>
  </div>
</template>