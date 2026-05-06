<script setup lang="ts">
import { computed, ref } from 'vue'
import { message } from 'ant-design-vue'
import { DatabaseOutlined, DeploymentUnitOutlined, EllipsisOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons-vue'
import AiKnowledgeBaseModal from './components/AiKnowledgeBaseModal.vue'
import KnowledgeDocumentManagerModal, { type KnowledgeBaseLite } from './components/KnowledgeDocumentManagerModal.vue'

defineOptions({ name: 'AiKnowledgeBaseList' })

type KnowledgeStatus = 'draft' | 'published'
type KnowledgeItem = {
  id: string
  name: string
  description: string
  iconPath?: string
  status: KnowledgeStatus
  labels: string[]
  documentCount: number
  createdAt: string
  updatedAt: string
}

const keyword = ref('')
const open = ref(false)
const editingKnowledge = ref<KnowledgeItem | null>(null)
const openMenuId = ref<string>('')
const docManagerVisible = ref(false)
const activeKnowledgeForDocs = ref<KnowledgeBaseLite | null>(null)

const knowledgeBases = ref<KnowledgeItem[]>([
  {
    id: 'kb-1',
    name: '安全生产知识库',
    description: '沉淀安全生产制度、化工场景规范和事故案例的统一知识库。',
    iconPath: '',
    status: 'published',
    labels: ['安全生产', '制度规范', '化工'],
    documentCount: 18,
    createdAt: '2026-04-18 09:20',
    updatedAt: '2026-04-22 15:10',
  },
  {
    id: 'kb-2',
    name: '特种设备法规库',
    description: '用于法规检索、制度问答和特种设备安全知识查询。',
    iconPath: '',
    status: 'draft',
    labels: ['法规', '特种设备'],
    documentCount: 6,
    createdAt: '2026-04-19 10:00',
    updatedAt: '2026-04-22 14:20',
  },
])

const filteredList = computed(() => {
  const k = keyword.value.trim().toLowerCase()
  if (!k) return knowledgeBases.value
  return knowledgeBases.value.filter((item) => `${item.name} ${item.description} ${item.labels.join(' ')}`.toLowerCase().includes(k))
})

function nowText() {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}

function collapsedTags(labels: string[]) {
  if (labels.length <= 2) return { visible: labels, more: 0 }
  return { visible: labels.slice(0, 2), more: labels.length - 2 }
}

function handleAddKnowledge() {
  editingKnowledge.value = null
  open.value = true
}

function handleEditClick(item: KnowledgeItem) {
  editingKnowledge.value = { ...item, labels: [...(item.labels || [])] }
  open.value = true
  openMenuId.value = ''
}

function closeModal() {
  open.value = false
  editingKnowledge.value = null
}

function saveKnowledge(knowledge: KnowledgeItem) {
  if (knowledge.id) {
    const index = knowledgeBases.value.findIndex(k => k.id === knowledge.id)
    if (index !== -1) knowledgeBases.value[index] = { ...knowledge, updatedAt: nowText() }
  } else {
    knowledgeBases.value.unshift({ ...knowledge, id: `kb-${Date.now()}`, documentCount: 0, createdAt: nowText(), updatedAt: nowText() })
  }
  message.success('保存成功')
  closeModal()
}

function deleteKnowledge(item: KnowledgeItem) {
  openMenuId.value = ''
  if (!window.confirm(`确认删除「${item.name}」吗？删除后不可恢复。`)) return
  knowledgeBases.value = knowledgeBases.value.filter(k => k.id !== item.id)
  message.success('删除成功')
}

function toggleStatus(item: KnowledgeItem) {
  item.status = item.status === 'published' ? 'draft' : 'published'
  item.updatedAt = nowText()
  message.success(`${item.status === 'published' ? '发布' : '下线'}成功`)
  openMenuId.value = ''
}

function toggleMenu(item: KnowledgeItem) {
  openMenuId.value = openMenuId.value === item.id ? '' : item.id
}

function vectorizeKnowledge(item: KnowledgeItem) {
  openMenuId.value = ''
  item.updatedAt = nowText()
  message.success(`已触发「${item.name}」向量化任务`)
}

function clearDocuments(item: KnowledgeItem) {
  openMenuId.value = ''
  if (!window.confirm(`确认清空「${item.name}」的全部文档吗？`)) return
  item.documentCount = 0
  item.updatedAt = nowText()
  message.success(`已清空「${item.name}」文档`)
}

function manageDocuments(item: KnowledgeItem) {
  activeKnowledgeForDocs.value = { id: item.id, name: item.name, status: item.status }
  docManagerVisible.value = true
}

function searchReset() {
  keyword.value = ''
}
</script>

<template>
  <div class="knowledge-manage-page">
    <header class="manage-header">
      <div>
        <div class="title">知识库管理</div>
        <div class="desc">统一维护知识库基础信息、状态和文档管理入口。列表页只保留高频操作，低频与风险操作收拢到“更多”。</div>
      </div>
      <div class="header-actions">
        <button type="button" class="reset-btn" @click="searchReset">
          <ReloadOutlined class="h-4 w-4" /> 重置
        </button>
        <button type="button" class="create-btn" @click="handleAddKnowledge">
          <PlusOutlined class="h-4 w-4" /> 创建知识库
        </button>
      </div>
    </header>

    <section class="toolbar">
      <div class="search-box">
        <input v-model="keyword" placeholder="搜索知识库名称 / 描述 / 标签" />
      </div>
      <span class="toolbar-count">共 {{ filteredList.length }} 个知识库</span>
    </section>

    <section class="table-wrap">
      <table class="knowledge-table">
        <thead>
          <tr>
            <th class="th-entity">知识库</th>
            <th class="th-tags">标签</th>
            <th class="th-doc">文档数</th>
            <th class="th-status">状态</th>
            <th class="th-updated">更新时间</th>
            <th class="th-action">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filteredList" :key="item.id">
            <td>
              <div class="entity-cell">
                <span class="entity-icon">
                  <img v-if="item.iconPath" :src="item.iconPath" />
                  <DatabaseOutlined v-else class="h-4 w-4" />
                </span>
                <div class="entity-copy">
                  <div class="entity-name" :title="item.name">{{ item.name || '知识库' }}</div>
                  <div class="entity-desc" :title="item.description">{{ item.description || '暂无描述' }}</div>
                </div>
              </div>
            </td>
            <td>
              <div class="tag-list" :title="item.labels.join('、')">
                <span v-for="label in collapsedTags(item.labels).visible" :key="label" class="tag-chip">{{ label }}</span>
                <span v-if="collapsedTags(item.labels).more > 0" class="tag-chip more">+{{ collapsedTags(item.labels).more }}</span>
                <span v-if="!item.labels.length" class="empty-text">--</span>
              </div>
            </td>
            <td>
              <span class="doc-count-pill">{{ item.documentCount }}</span>
            </td>
            <td>
              <span :class="['status-pill', item.status]">
                <DeploymentUnitOutlined class="mr-1" />
                {{ item.status === 'published' ? '已发布' : '草稿' }}
              </span>
            </td>
            <td><span class="ellipsis-text" :title="item.updatedAt">{{ item.updatedAt || '--' }}</span></td>
            <td>
              <div class="action-group">
                <button type="button" class="text-btn primary" @click="manageDocuments(item)">管理文档</button>
                <button type="button" class="text-btn" @click="handleEditClick(item)">编辑</button>
                <div class="more-menu-wrap">
                  <button type="button" class="more-btn" @click.stop="toggleMenu(item)">
                    更多 <EllipsisOutlined />
                  </button>
                  <div v-if="openMenuId === item.id" class="menu-popover">
                    <button type="button" @click="toggleStatus(item)">{{ item.status === 'published' ? '下线' : '发布' }}</button>
                    <button type="button" @click="vectorizeKnowledge(item)">向量化</button>
                    <button type="button" @click="clearDocuments(item)">清空文档</button>
                    <button type="button" class="danger" @click="deleteKnowledge(item)">删除</button>
                  </div>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="filteredList.length === 0" class="empty-box">暂无知识库数据</div>
    </section>

    <div class="note-box">说明：知识库列表页只保留“管理文档、编辑”两个高频操作，状态切换、向量化、清空文档、删除等收拢至“更多”，避免列表信息换行变形。</div>

    <AiKnowledgeBaseModal :visible="open" :knowledge="editingKnowledge || undefined" @ok="saveKnowledge" @cancel="closeModal" />
    <KnowledgeDocumentManagerModal :visible="docManagerVisible" :knowledge-base="activeKnowledgeForDocs" @close="docManagerVisible = false" />
  </div>
</template>

<style scoped>
.knowledge-manage-page { width: 100%; }
.manage-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 16px; }
.title { font-size: 20px; font-weight: 800; color: #0f172a; }
.desc { margin-top: 6px; max-width: 760px; font-size: 13px; line-height: 1.7; color: #64748b; }
.header-actions { display: flex; flex-wrap: wrap; gap: 10px; }
.toolbar { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 14px; border-radius: 22px; background: #f8fafc; padding: 12px; box-shadow: inset 0 0 0 1px #e2e8f0; }
.search-box { min-width: min(420px, 100%); flex: 1; }
.search-box input { width: 100%; border: 1px solid #dbeafe; border-radius: 14px; background: #fff; padding: 10px 12px; font-size: 13px; outline: none; }
.search-box input:focus { border-color: #38bdf8; box-shadow: 0 0 0 3px rgba(56,189,248,.14); }
.toolbar-count { flex-shrink: 0; border-radius: 999px; background: #eff6ff; color: #1d4ed8; padding: 7px 12px; font-size: 12px; font-weight: 800; }
.reset-btn, .create-btn { display: inline-flex; align-items: center; gap: 7px; border-radius: 14px; padding: 10px 14px; font-size: 13px; font-weight: 700; }
.reset-btn { background: #fff; color: #334155; box-shadow: inset 0 0 0 1px #e2e8f0; }
.create-btn { background: linear-gradient(135deg, #0098ff, #006cff); color: #fff; box-shadow: 0 10px 22px rgba(0,108,255,.18); }
.table-wrap { overflow-x: auto; border-radius: 24px; border: 1px solid #e2e8f0; background: #fff; box-shadow: 0 14px 36px rgba(15,23,42,.05); }
.knowledge-table { width: 100%; min-width: 1140px; border-collapse: collapse; table-layout: fixed; text-align: left; font-size: 13px; }
.th-entity { width: 31%; }
.th-tags { width: 17%; }
.th-doc { width: 9%; }
.th-status { width: 12%; }
.th-updated { width: 13%; }
.th-action { width: 18%; }
th { background: #f8fafc; color: #64748b; font-size: 12px; font-weight: 800; padding: 13px 16px; }
td { border-top: 1px solid #f1f5f9; color: #475569; padding: 14px 16px; vertical-align: middle; }
.entity-cell { display: flex; align-items: center; gap: 12px; min-width: 0; }
.entity-icon { display: flex; width: 38px; height: 38px; align-items: center; justify-content: center; overflow: hidden; border-radius: 15px; background: linear-gradient(135deg, #e0f2fe, #eff6ff); color: #0369a1; box-shadow: inset 0 0 0 1px #bae6fd; }
.entity-icon img { width: 100%; height: 100%; object-fit: cover; }
.entity-copy { min-width: 0; }
.entity-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 850; color: #0f172a; }
.entity-desc { margin-top: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 12px; color: #64748b; }
.tag-list { display: flex; align-items: center; gap: 6px; overflow: hidden; white-space: nowrap; }
.tag-chip { border-radius: 999px; background: #eff6ff; color: #1d4ed8; padding: 4px 8px; font-size: 12px; font-weight: 700; }
.tag-chip.more { background: #f8fafc; color: #64748b; }
.empty-text { font-size: 12px; color: #94a3b8; }
.doc-count-pill { display: inline-flex; min-width: 34px; justify-content: center; border-radius: 999px; background: #eff6ff; padding: 5px 10px; font-size: 12px; font-weight: 800; color: #1d4ed8; }
.status-pill { display: inline-flex; align-items: center; max-width: 100%; white-space: nowrap; border-radius: 999px; padding: 5px 9px; font-size: 12px; font-weight: 800; box-shadow: inset 0 0 0 1px currentColor; }
.status-pill.published { background: #ecfdf5; color: #047857; }
.status-pill.draft { background: #f8fafc; color: #64748b; }
.ellipsis-text { display: inline-block; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.action-group { display: flex; align-items: center; gap: 8px; justify-content: flex-start; }
.text-btn { border-radius: 12px; padding: 8px 10px; color: #334155; font-size: 12px; font-weight: 800; background: #f8fafc; white-space: nowrap; }
.text-btn.primary { background: #eff6ff; color: #2563eb; }
.text-btn:hover { background: #e2e8f0; }
.more-menu-wrap { position: relative; }
.more-btn { display: inline-flex; align-items: center; gap: 4px; border-radius: 12px; padding: 8px 10px; background: #fff; color: #475569; box-shadow: inset 0 0 0 1px #cbd5e1; font-size: 12px; font-weight: 800; white-space: nowrap; }
.menu-popover { position: absolute; top: 38px; right: 0; z-index: 18; width: 140px; border-radius: 16px; border: 1px solid #dbeafe; background: rgba(255,255,255,.98); padding: 6px; box-shadow: 0 18px 44px rgba(15,23,42,.16); }
.menu-popover button { display: block; width: 100%; border-radius: 11px; padding: 8px 10px; text-align: left; color: #334155; font-size: 12px; font-weight: 800; }
.menu-popover button:hover { background: #eff6ff; color: #1d4ed8; }
.menu-popover button.danger { color: #be123c; }
.menu-popover button.danger:hover { background: #fff1f2; color: #be123c; }
.empty-box { padding: 24px; text-align: center; color: #94a3b8; font-size: 13px; }
.note-box { margin-top: 14px; border-radius: 18px; background: #fefce8; color: #854d0e; padding: 12px 14px; font-size: 12px; line-height: 1.7; box-shadow: inset 0 0 0 1px #fde68a; }
@media (max-width: 900px) {
  .manage-header { flex-direction: column; }
}
</style>
