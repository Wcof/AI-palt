
<template>
  <a-drawer v-model:open="open" placement="right"  :width="1180" :closable="true" title="知识库检索" class="knowledge-debug-drawer">
    <knowladgeModal ref="modalRef" :open="open" @update:open="(val) => open = val" />
  </a-drawer>
</template>

<script setup lang="ts">
  import { ref, nextTick } from 'vue';
  import knowladgeModal from './knowladgeModal.vue';

  const open = ref(false);
  const modalRef = ref<{
    setKnowledgeId: (id: string) => void;
  } | null>(null);

  const openPanel = (id: string) => {
    open.value = true;
    nextTick(() => {
      modalRef.value?.setKnowledgeId(id);
    });
  };

  defineExpose({
    openPanel,
  });
</script>

<style scoped>
  :deep(.ant-drawer-header-title) {
    flex-direction: row-reverse;
  }

  :deep(.ant-drawer-title) {
    font-size: 18px;
    font-weight: 700;
  }

  :deep(.ant-drawer-body) {
    padding: 12px;
    height: calc(100vh - 55px);
    overflow: hidden;
  }
</style>
