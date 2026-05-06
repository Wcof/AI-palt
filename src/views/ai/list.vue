<template>
  <contentWrapper :menuType="menuType"></contentWrapper>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import contentWrapper from './components/contentWrapper.vue';

const route = useRoute();

const menuType = computed(() => {
  const domain = new URLSearchParams(route.fullPath.split('?')[1] || '').get('domain');
  switch (domain) {
    case 'MCP':
      return 'mcp';
    case 'LLM':
      return 'agent';
    case 'NLP':
    default:
      return 'knowladge';
  }
});
</script>