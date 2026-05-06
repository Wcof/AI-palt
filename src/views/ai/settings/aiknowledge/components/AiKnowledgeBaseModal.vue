<template>
  <a-modal
    :title="knowledgeForm.id ? '编辑知识库' : '新建知识库'"
    :open="visible"
    @ok="handleOk"
    @cancel="handleCancel"
    width="520px"
  >
    <a-form :model="knowledgeForm" layout="vertical">
      <a-form-item label="知识库名称" required>
        <a-input v-model:value="knowledgeForm.name" placeholder="请输入知识库名称" />
      </a-form-item>
      <a-form-item label="描述">
        <a-textarea v-model:value="knowledgeForm.description" placeholder="请输入知识库描述" :rows="3" />
      </a-form-item>
      <a-form-item label="图标 URL">
        <a-input v-model:value="knowledgeForm.iconPath" placeholder="请输入图标 URL" />
        <div class="mt-2">
          <img v-if="knowledgeForm.iconPath" :src="knowledgeForm.iconPath" class="preview-icon" />
        </div>
      </a-form-item>
      <a-form-item label="状态">
        <a-radio-group v-model:value="knowledgeForm.status">
          <a-radio-button value="draft">草稿</a-radio-button>
          <a-radio-button value="published">已发布</a-radio-button>
        </a-radio-group>
      </a-form-item>
      <a-form-item label="标签">
        <a-input v-model:value="tagsInput" placeholder="请输入标签，多个标签用逗号分隔" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  knowledge: {
    type: Object,
    default: () => ({ id: null, name: '', description: '', iconPath: '', status: 'draft', labels: [] }),
  },
})
const emit = defineEmits(['ok', 'cancel'])
const knowledgeForm = ref({ ...props.knowledge })
const tagsInput = ref('')

watch(() => props.knowledge, (newKnowledge: any) => {
  const safe = newKnowledge || { id: null, name: '', description: '', iconPath: '', status: 'draft', labels: [] }
  knowledgeForm.value = { ...safe }
  tagsInput.value = Array.isArray(safe.labels) ? safe.labels.join(', ') : ''
}, { deep: true, immediate: true })

function handleOk() {
  if (!knowledgeForm.value.name) return
  const labels = tagsInput.value.split(',').map(tag => tag.trim()).filter(Boolean)
  emit('ok', { ...knowledgeForm.value, labels })
}
function handleCancel() { emit('cancel') }
</script>

<style scoped lang="css">
.preview-icon { width: 64px; height: 64px; border-radius: 8px; object-fit: cover; }
</style>
