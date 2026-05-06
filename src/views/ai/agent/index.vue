<template>
  <contentWrapper menuType="agent" @use="handleUse"></contentWrapper>
  <agentModal v-model:open="open" :itemInfo="itemInfo" :agent-id="currentAgentId"></agentModal>
</template>
<script setup lang="ts">
  import { ref } from 'vue';
  import contentWrapper from '../components/contentWrapper.vue';
  import agentModal from './agentModal.vue';

  defineOptions({
    name: 'AiAgentIndexPage',
  });

  const open = ref(false);
  const currentAgentId = ref('');
  const itemInfo = ref<any>({});

  function handleUse(item: any) {
    console.log(item);

    currentAgentId.value = item.agentId;
    itemInfo.value = item;
    open.value = true;
  }
</script>