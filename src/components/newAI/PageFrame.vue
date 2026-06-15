<script setup lang="ts">
defineProps<{
  title: string
  desc: string
}>()
</script>

<template>
  <div class="space-y-4">
    <header class="rounded-[1.75rem] border border-sky-200/70 bg-white/80 p-6 shadow-[0_18px_56px_rgba(14,116,144,0.08)]">
      <h1 class="text-2xl font-semibold text-slate-950">{{ title }}</h1>
      <p class="mt-2 max-w-4xl text-sm leading-6 text-slate-600">{{ desc }}</p>
      <div v-if="$slots.meta" class="mt-4">
        <slot name="meta" />
      </div>
    </header>
    <slot />
  </div>
</template>
