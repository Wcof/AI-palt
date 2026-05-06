<template>
  <a-drawer :open="open" placement="right" :width="980" :destroyOnClose="true" @update:open="(val) => emit('update:open', val)">
    <template #title>
      <div class="drawer-title">AI智能体</div>
    </template>
    <div class="wrap">
      <div class="content">
        <div class="agent-content">
          <h3>{{ itemInfo?.name || 'AI智能体' }}</h3>
          <p>{{ itemInfo?.description || '这是一个AI智能体' }}</p>
          <div class="agent-params" v-if="params">
            <h4>参数配置：</h4>
            <pre>{{ JSON.stringify(params, null, 2) }}</pre>
          </div>
        </div>
      </div>
    </div>
  </a-drawer>
</template>

<script setup lang="ts">
  import { computed, provide } from 'vue';

  const props = withDefaults(
    defineProps<{
      open: boolean;
      itemInfo?: any;
      agentId?: string;
    }>(),
    {
      agentId: 'chat',
    }
  );

  const emit = defineEmits<{
    (e: 'update:open', value: boolean): void;
  }>();

  const params = computed(() => props.itemInfo?.params);

  const itemInfo = computed(() => props.itemInfo);
  provide('agentInfo', itemInfo);
</script>

<style scoped>
  .drawer-title {
    font-size: 18px;
    font-weight: 700;
  }

  .wrap {
    height: calc(100vh - 110px);
    width: 100%;
    border-radius: 16px;
    overflow: hidden;
    .content {
      background: #fff;
      width: 100%;
      height: 100%;
      padding: 20px;
    }
  }

  .agent-content {
    height: 100%;
    overflow-y: auto;
  }

  .agent-content h3 {
    margin-bottom: 12px;
    font-size: 20px;
    font-weight: 700;
    color: #1f2d3d;
  }

  .agent-content p {
    margin-bottom: 20px;
    font-size: 14px;
    line-height: 1.5;
    color: #4b5e78;
  }

  .agent-params {
    margin-top: 20px;
  }

  .agent-params h4 {
    margin-bottom: 8px;
    font-size: 14px;
    font-weight: 600;
    color: #1f2d3d;
  }

  .agent-params pre {
    background: #f5f7fa;
    border: 1px solid #e6e8eb;
    border-radius: 8px;
    padding: 12px;
    font-size: 13px;
    line-height: 1.5;
    overflow-x: auto;
  }
</style>