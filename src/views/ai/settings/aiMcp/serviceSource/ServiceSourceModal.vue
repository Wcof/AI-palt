<template>
  <a-modal
    :title="service.id ? '编辑服务源' : '添加服务源'"
    :open="visible"
    @ok="handleOk"
    @cancel="handleCancel"
    width="500"
  >
    <a-form :model="serviceForm" layout="vertical">
      <a-form-item label="服务名称" required>
        <a-input v-model:value="serviceForm.name" placeholder="请输入服务名称" />
      </a-form-item>
      
      <a-form-item label="服务类型" required>
        <a-radio-group v-model:value="serviceForm.type">
          <a-radio-button value="internal">内部服务</a-radio-button>
          <a-radio-button value="external">外部服务</a-radio-button>
        </a-radio-group>
      </a-form-item>
      
      <a-form-item label="服务地址" required>
        <a-input v-model:value="serviceForm.url" placeholder="请输入服务地址" />
      </a-form-item>
      
      <a-form-item label="请求头 (JSON)">
        <a-textarea 
          v-model:value="headersJson" 
          placeholder="请输入 JSON 格式的请求头"
          :rows="4"
        />
        <div class="mt-1 text-xs text-slate-500">例如: {"Authorization": "Bearer token"}</div>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
  import { ref, watch, computed } from 'vue';
  
  const props = defineProps({
    visible: {
      type: Boolean,
      default: false,
    },
    service: {
      type: Object,
      default: () => ({
        id: null,
        name: '',
        type: 'external',
        url: '',
        headers: {},
      }),
    },
  });
  
  const emit = defineEmits(['ok', 'cancel']);
  
  const serviceForm = ref({ ...props.service });
  
  const headersJson = computed({
    get: () => {
      return JSON.stringify(serviceForm.value.headers || {}, null, 2);
    },
    set: (value) => {
      try {
        serviceForm.value.headers = JSON.parse(value);
      } catch {
        // 解析失败，保持原值
      }
    },
  });
  
  watch(() => props.service, (newService) => {
    serviceForm.value = { ...newService };
  }, { deep: true });
  
  function handleOk() {
    if (!serviceForm.value.name || !serviceForm.value.url) {
      return;
    }
    emit('ok', { ...serviceForm.value });
  }
  
  function handleCancel() {
    emit('cancel');
  }
</script>

<style scoped lang="css">
</style>
