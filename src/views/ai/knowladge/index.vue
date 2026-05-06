<template>
  <contentWrapper menuType="knowledge" @use="handleUse"></contentWrapper>
  <knowladgeModal v-model:open="open" :item-info="itemInfo"></knowladgeModal>
</template>
<script setup lang="ts">
  import { ref } from 'vue';
  import contentWrapper from '../components/contentWrapper.vue';
  import knowladgeModal from './knowladgeModal.vue';

  defineOptions({
    name: 'AiKnowledgeIndexPage',
  });

  const open = ref(false);
  const itemInfo = ref<any>({});

  function handleUse(item: any) {
    console.log(item);
    itemInfo.value = item;
    open.value = true;
  }
</script>