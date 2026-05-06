<script setup lang="ts">
  defineProps<{ options: Array<{ value: string; label: string }>; modelValue: string }>();
  const emit = defineEmits<{ 'update:modelValue': [v: string] }>();
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <button
      v-for="o in options"
      :key="o.value || '__all'"
      type="button"
      @click="emit('update:modelValue', o.value)"
      :class="[
        'rounded-full px-3 py-1.5 text-xs ring-1 transition',
        modelValue === o.value
          ? 'bg-gradient-to-r from-[#0098FF] to-[#006CFF] text-white ring-[#006CFF]/50'
          : 'bg-white/70 text-slate-700 ring-sky-200/70 hover:bg-white',
      ]"
      >{{ o.label }}</button
    >
  </div>
</template>