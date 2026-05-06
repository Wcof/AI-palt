<template>
  <contentWrapper :menuType="menuType"></contentWrapper>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import contentWrapper from '../components/contentWrapper.vue';

type ExperienceKind = 'agent' | 'mcp'

const props = defineProps<{ kind: ExperienceKind }>()

defineOptions({ name: 'DomainExperience' })

const menuType = computed(() => {
  return props.kind === 'agent' ? 'agent' : 'mcp';
});
</script>
