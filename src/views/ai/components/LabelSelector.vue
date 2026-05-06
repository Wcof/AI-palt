<script setup lang="ts">
  defineProps<{
    labels: string[];
    selectedLabels: string[];
  }>();

  const emit = defineEmits<{
    toggle: [label: string];
  }>();

  const handleToggle = (label: string) => {
    emit('toggle', label);
  };
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <button
      v-for="label in labels"
      :key="label"
      type="button"
      @click="handleToggle(label)"
      :class="[
        'rounded-full px-3 py-1.5 text-xs ring-1 transition',
        selectedLabels.includes(label)
          ? 'bg-gradient-to-r from-[#0098FF] to-[#006CFF] text-white ring-[#006CFF]/50'
          : 'bg-white/70 text-slate-700 ring-sky-200/70 hover:bg-white',
      ]"
    >
      {{ label }}
    </button>
  </div>
</template>