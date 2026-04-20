<script setup lang="ts">
type ExperienceKind = 'agent' | 'mcp'

const props = defineProps<{ kind: ExperienceKind }>()

defineOptions({ name: 'DomainExperience' })

const titleMap: Record<ExperienceKind, string> = {
  agent: 'AI 智能体在线体验',
  mcp: 'AI 技能在线体验',
}
</script>

<template>
  <section class="relative overflow-hidden rounded-3xl border border-dashed border-sky-200/70 bg-white/70 px-8 py-24 text-center shadow-[inset_0_0_0_1px_rgba(0,180,255,0.08)] backdrop-blur">
    <div class="absolute inset-0 bg-[radial-gradient(closest-side_at_20%_20%,rgba(0,180,255,0.10),transparent_70%),radial-gradient(closest-side_at_80%_30%,rgba(141,76,255,0.10),transparent_70%)]" />
    <div class="relative mx-auto max-w-[720px] space-y-3">
      <div class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Online Experience</div>
      <h2 class="text-2xl font-semibold text-slate-900 sm:text-3xl">{{ titleMap[props.kind] }}</h2>
      <p class="text-sm text-slate-600 sm:text-base">在线试用已统一接入 Dify，当前页面仅保留占位，体验入口将直接复用 Dify 的在线能力。</p>
    </div>
  </section>
</template>
