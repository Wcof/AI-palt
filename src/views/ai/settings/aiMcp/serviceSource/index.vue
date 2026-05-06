<template>
  <div class="service-source-list">
    <div class="actions">
      <a-button type="primary" @click="openServiceSourceModal()" icon="plus">
        添加服务源
      </a-button>
    </div>
    
    <a-table :columns="columns" :data-source="services" row-key="id">
      <template #name="{ record }">
        <div class="service-name">{{ record.name }}</div>
      </template>
      <template #type="{ record }">
        <a-tag :color="record.type === 'internal' ? 'green' : 'blue'">
          {{ record.type === 'internal' ? '内部服务' : '外部服务' }}
        </a-tag>
      </template>
      <template #url="{ record }">
        <div class="service-url">{{ record.url }}</div>
      </template>
      <template #actions="{ record }">
        <a-space>
          <a-button size="small" @click="openServiceSourceModal(record)">
            编辑
          </a-button>
          <a-button size="small" danger @click="deleteService(record.id)">
            删除
          </a-button>
        </a-space>
      </template>
    </a-table>
    
    <service-source-modal
      :visible="showModal"
      :service="editingService"
      @ok="saveService"
      @cancel="closeModal"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { message } from 'ant-design-vue';
  import ServiceSourceModal from './ServiceSourceModal.vue';
  
  defineOptions({ name: 'ServiceSourceList' });
  
  const showModal = ref(false);
  const editingService = ref<any>(null);
  const services = ref([
    {
      id: '1',
      name: '本地文件系统',
      type: 'internal',
      url: 'local://filesystem',
      headers: {},
      createdAt: '2024-01-01 10:00:00',
      updatedAt: '2024-01-01 10:00:00',
    },
    {
      id: '2',
      name: '天气 API',
      type: 'external',
      url: 'https://api.weather.com',
      headers: { 'Authorization': 'Bearer xxx' },
      createdAt: '2024-01-05 09:00:00',
      updatedAt: '2024-01-10 11:20:00',
    },
  ]);
  
  const columns = [
    {
      title: '服务名称',
      dataIndex: 'name',
      key: 'name',
      slots: { customRender: 'name' },
    },
    {
      title: '服务类型',
      dataIndex: 'type',
      key: 'type',
      slots: { customRender: 'type' },
    },
    {
      title: '服务地址',
      dataIndex: 'url',
      key: 'url',
      slots: { customRender: 'url' },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: '操作',
      key: 'actions',
      slots: { customRender: 'actions' },
    },
  ];
  
  function openServiceSourceModal(service?: any) {
    if (service) {
      editingService.value = { ...service };
    } else {
      editingService.value = {
        id: null,
        name: '',
        type: 'external',
        url: '',
        headers: {},
      };
    }
    showModal.value = true;
  }
  
  function closeModal() {
    showModal.value = false;
    editingService.value = null;
  }
  
  function saveService(service: any) {
    if (service.id) {
      const index = services.value.findIndex(s => s.id === service.id);
      if (index !== -1) {
        services.value[index] = { ...service, updatedAt: new Date().toLocaleString() };
      }
    } else {
      services.value.push({
        ...service,
        id: String(services.value.length + 1),
        createdAt: new Date().toLocaleString(),
        updatedAt: new Date().toLocaleString(),
      });
    }
    message.success('保存成功');
    closeModal();
  }
  
  function deleteService(id: string) {
    services.value = services.value.filter(s => s.id !== id);
    message.success('删除成功');
  }
</script>

<style scoped lang="css">
  .service-source-list {
    padding: 20px 0;
  }
  
  .actions {
    margin-bottom: 20px;
  }
  
  .service-name {
    font-weight: 500;
  }
  
  .service-url {
    font-size: 14px;
    color: #6b7f99;
    word-break: break-all;
  }
</style>
