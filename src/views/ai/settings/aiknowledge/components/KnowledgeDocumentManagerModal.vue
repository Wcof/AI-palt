<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Search, UploadCloud, FileText, MoreHorizontal, CheckCircle2, Circle, X, Database, TestTube2, Eye, Pencil, Trash2 } from 'lucide-vue-next'
import { useNewAIStore } from '@/stores/newAI'

export type KnowledgeBaseLite = {
  id: string
  name: string
  status: 'draft' | 'published'
}

type KnowledgeDoc = {
  id: string
  title: string
  source: 'manual' | 'upload'
  status: 'done' | 'processing'
  updatedAt: string
}

const props = defineProps<{
  visible: boolean
  knowledgeBase: KnowledgeBaseLite | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const activeTab = ref<'docs' | 'test'>('docs')
const keyword = ref('')
const hitQuestion = ref('请检索特种设备安全相关文档命中情况')
const documents = ref<Record<string, KnowledgeDoc[]>>({})
const openMenuId = ref<string | null>(null)
const store = useNewAIStore()
const metadataDraft = ref<Record<string, string>>({})

function buildDefaultMetadata() {
  const values: Record<string, string> = {}
  store.metadataTags.forEach((tag) => {
    values[tag.code] = tag.valueType === 'enum' ? (tag.options[0] || '') : ''
  })
  return values
}

watch(() => props.visible, (visible) => {
  if (visible) {
    activeTab.value = 'docs'
    keyword.value = ''
    openMenuId.value = null
    metadataDraft.value = buildDefaultMetadata()
  }
})

watch(() => props.knowledgeBase?.id, (id) => {
  if (!id || documents.value[id]) return
  const baseName = props.knowledgeBase?.name || '知识库'
  documents.value[id] = [
    { id: `${id}-doc-1`, title: `《${baseName}》基础制度汇编`, source: 'upload', status: 'done', updatedAt: '2026-04-22 16:20' },
    { id: `${id}-doc-2`, title: `《特种设备安全管理制度》`, source: 'manual', status: 'done', updatedAt: '2026-04-22 16:35' },
  ]
}, { immediate: true })

const currentDocuments = computed(() => {
  const id = props.knowledgeBase?.id
  if (!id) return []
  const list = documents.value[id] || []
  const q = keyword.value.trim().toLowerCase()
  if (!q) return list
  return list.filter(item => `${item.title} ${item.updatedAt}`.toLowerCase().includes(q))
})

const hitResults = computed(() => {
  const name = props.knowledgeBase?.name || '知识库'
  return [
    { id: 'chunk-1', title: `《${name}》基础制度汇编`, score: '92%', content: '命中“特种设备安全”“操作规程”“巡检记录”等段落，可支持法规制度类问答。' },
    { id: 'chunk-2', title: '《特种设备安全管理制度》', score: '88%', content: '命中“设备台账”“维保要求”“责任分工”等内容，可支撑安全生产场景检索。' },
  ]
})

function nowText() {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}

function addManualDoc() {
  const id = props.knowledgeBase?.id
  if (!id) return
  const title = '新建文档（手动录入）'
  documents.value[id] = [
    { id: `${id}-manual-${Date.now()}`, title, source: 'manual', status: 'processing', updatedAt: nowText() },
    ...(documents.value[id] || []),
  ]
  store.upsertKnowledgeDocumentMetadata({
    knowledgeBaseId: id,
    documentName: title,
    sourceType: 'manual',
    values: { ...metadataDraft.value },
  })
}

function addUploadDoc() {
  const id = props.knowledgeBase?.id
  if (!id) return
  const title = '新上传文档.pdf'
  documents.value[id] = [
    { id: `${id}-upload-${Date.now()}`, title, source: 'upload', status: 'processing', updatedAt: nowText() },
    ...(documents.value[id] || []),
  ]
  store.upsertKnowledgeDocumentMetadata({
    knowledgeBaseId: id,
    documentName: title,
    sourceType: 'upload',
    values: { ...metadataDraft.value },
  })
}

function toggleDocMenu(id: string) {
  openMenuId.value = openMenuId.value === id ? null : id
}

function closeDocMenu() {
  openMenuId.value = null
}

function removeDoc(id: string) {
  const kbId = props.knowledgeBase?.id
  if (!kbId) return
  documents.value[kbId] = (documents.value[kbId] || []).filter(item => item.id !== id)
  closeDocMenu()
}

function metadataText(item: KnowledgeDoc) {
  const kbId = props.knowledgeBase?.id
  if (!kbId) return '暂无元数据'
  const metadata = store.getKnowledgeDocumentMetadata(kbId, item.title)
  if (!metadata) return '暂无元数据'
  const entries = Object.entries(metadata.values).filter(([, value]) => value)
  if (!entries.length) return '暂无元数据'
  return entries.map(([key, value]) => `${key}: ${value}`).join(' · ')
}
</script>

<template>
  <Teleport to="body">
    <div v-if="visible && knowledgeBase" class="kb-doc-modal">
      <div class="kb-doc-mask" @click="emit('close')" />
      <div class="kb-doc-panel">
        <div class="kb-doc-header">
          <div>
            <div class="kb-doc-title">知识库详情</div>
            <div class="kb-doc-sub">{{ knowledgeBase.name }} · 管理文档与命中测试</div>
          </div>
          <button type="button" class="kb-close-btn" @click="emit('close')">
            <X class="h-4 w-4" />
          </button>
        </div>

        <div class="kb-doc-body">
          <aside class="kb-doc-sidebar">
            <button type="button" :class="['kb-side-item', activeTab === 'docs' && 'active']" @click="activeTab = 'docs'">
              <FileText class="h-4 w-4" />
              <span>文档</span>
            </button>
            <button type="button" :class="['kb-side-item', activeTab === 'test' && 'active']" @click="activeTab = 'test'">
              <TestTube2 class="h-4 w-4" />
              <span>命中测试</span>
            </button>
          </aside>

          <section class="kb-doc-content" @click="closeDocMenu">
            <template v-if="activeTab === 'docs'">
              <div class="kb-toolbar">
                <div class="kb-search-box">
                  <Search class="kb-search-icon" />
                  <input v-model="keyword" type="search" placeholder="搜索文档名称，回车搜索" />
                </div>
              </div>

              <div class="kb-doc-grid">
                <article class="kb-create-card">
                  <div class="kb-card-title">创建文档</div>
                  <div class="kb-create-copy">先选择文档创建方式，再按右侧元数据规范完成标签标注，保证后续检索与治理口径一致。</div>
                  <div class="kb-create-actions">
                    <button type="button" class="kb-action-card" @click="addManualDoc">
                      <FileText class="h-4 w-4" />
                      <span>手动录入</span>
                    </button>
                    <button type="button" class="kb-action-card" @click="addUploadDoc">
                      <UploadCloud class="h-4 w-4" />
                      <span>文件上传</span>
                    </button>
                  </div>
                </article>

                <article class="kb-meta-card">
                  <div class="kb-card-title">上传元数据标注</div>
                  <div class="kb-meta-tip">当前标签会在新建文档时一并写入，支持知识筛选、命中解释和后台治理。</div>
                  <div class="kb-meta-form compact">
                    <label v-for="tag in store.metadataTags" :key="tag.id" class="kb-meta-field">
                      <span>{{ tag.name }}<em v-if="tag.required">*</em></span>
                      <select v-if="tag.valueType === 'enum'" v-model="metadataDraft[tag.code]">
                        <option v-for="option in tag.options" :key="option" :value="option">{{ option }}</option>
                      </select>
                      <input v-else v-model="metadataDraft[tag.code]" type="text" :placeholder="`请输入${tag.name}`" />
                    </label>
                  </div>
                </article>

                <article v-for="item in currentDocuments" :key="item.id" class="kb-doc-card">
                  <div class="kb-doc-card-head">
                    <div class="kb-doc-card-main">
                      <div class="kb-doc-card-title" :title="item.title">{{ item.title }}</div>
                      <div class="kb-doc-card-subline">
                        <span class="kb-doc-status" :class="item.status">
                          <CheckCircle2 v-if="item.status === 'done'" class="h-3.5 w-3.5" />
                          <Circle v-else class="h-3.5 w-3.5" />
                          {{ item.status === 'done' ? '已完成' : '处理中' }}
                        </span>
                        <span class="kb-dot">·</span>
                        <span class="kb-doc-inline-ellipsis">{{ item.source === 'manual' ? '手动录入' : '文件上传' }}</span>
                        <span class="kb-dot">·</span>
                        <span class="kb-doc-inline-ellipsis">{{ item.updatedAt }}</span>
                      </div>
                      <div class="kb-doc-meta-preview" :title="metadataText(item)">{{ metadataText(item) }}</div>
                    </div>
                    <div class="kb-doc-card-actions">
                      <button type="button" class="kb-doc-primary-btn">查看</button>
                      <div class="kb-doc-menu-wrap">
                        <button type="button" class="kb-doc-more-btn" @click.stop="toggleDocMenu(item.id)">
                          <MoreHorizontal class="h-4 w-4" />
                        </button>
                        <div v-if="openMenuId === item.id" class="kb-doc-menu">
                          <button type="button" @click="closeDocMenu"><Eye class="h-3.5 w-3.5" /> 查看详情</button>
                          <button type="button" @click="closeDocMenu"><Pencil class="h-3.5 w-3.5" /> 编辑信息</button>
                          <button type="button" class="danger" @click="removeDoc(item.id)"><Trash2 class="h-3.5 w-3.5" /> 删除文档</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              </div>

              <div class="kb-doc-count">共 {{ currentDocuments.length }} 条文档</div>
            </template>

            <template v-else>
              <div class="kb-hit-head">
                <div>
                  <div class="kb-card-title">命中测试</div>
                  <div class="kb-hit-sub">用模拟问题验证知识库是否能命中文档片段。</div>
                </div>
                <span class="kb-hit-badge"><Database class="h-3.5 w-3.5" /> 当前知识库：{{ knowledgeBase.name }}</span>
              </div>
              <div class="kb-hit-form">
                <label class="kb-field">
                  <span class="kb-field-label">测试问题</span>
                  <textarea v-model="hitQuestion" rows="3" placeholder="输入测试问题，验证文档命中效果" />
                </label>
              </div>
              <div class="kb-hit-list">
                <article v-for="item in hitResults" :key="item.id" class="kb-hit-item">
                  <div class="kb-hit-item-head">
                    <div class="kb-hit-item-title" :title="item.title">{{ item.title }}</div>
                    <span class="kb-hit-score">命中率 {{ item.score }}</span>
                  </div>
                  <div class="kb-hit-item-content">{{ item.content }}</div>
                </article>
              </div>
            </template>
          </section>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.kb-doc-modal { position: fixed; inset: 0; z-index: 210; }
.kb-doc-mask { position: absolute; inset: 0; background: rgba(15, 23, 42, 0.28); backdrop-filter: blur(6px); }
.kb-doc-panel { position: absolute; inset: 4vh 4vw; display: flex; flex-direction: column; overflow: hidden; border-radius: 28px; background: #fff; box-shadow: 0 32px 100px rgba(15, 23, 42, 0.22); }
.kb-doc-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; padding: 22px 24px 18px; border-bottom: 1px solid #e2e8f0; }
.kb-doc-title { font-size: 22px; font-weight: 800; color: #0f172a; }
.kb-doc-sub { margin-top: 6px; font-size: 13px; color: #64748b; }
.kb-close-btn { display: inline-flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 12px; background: #f8fafc; color: #475569; box-shadow: inset 0 0 0 1px #e2e8f0; }
.kb-doc-body { min-height: 0; display: grid; flex: 1; grid-template-columns: 184px minmax(0, 1fr); }
.kb-doc-sidebar { border-right: 1px solid #e2e8f0; background: #f8fafc; padding: 16px 12px; }
.kb-side-item { display: flex; width: 100%; align-items: center; gap: 10px; border-radius: 14px; padding: 12px 14px; color: #475569; font-size: 13px; font-weight: 700; }
.kb-side-item + .kb-side-item { margin-top: 8px; }
.kb-side-item.active { background: #eaf3ff; color: #2563eb; box-shadow: inset 0 0 0 1px #bfdbfe; }
.kb-doc-content { min-width: 0; overflow: auto; padding: 24px; background: #fff; }
.kb-toolbar { margin-bottom: 20px; }
.kb-search-box { position: relative; max-width: 360px; }
.kb-search-icon { position: absolute; left: 14px; top: 50%; width: 16px; height: 16px; transform: translateY(-50%); color: #94a3b8; }
.kb-search-box input { width: 100%; border-radius: 14px; border: 1px solid #bfdbfe; background: #fff; padding: 11px 14px 11px 40px; font-size: 13px; outline: none; }
.kb-doc-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 16px; align-items: start; }
.kb-create-card, .kb-meta-card, .kb-doc-card { border-radius: 22px; border: 1px solid #dbeafe; background: #fff; padding: 18px 20px; box-shadow: 0 12px 32px rgba(15, 23, 42, 0.04); min-width: 0; }
.kb-create-card { border-style: dashed; background: #fcfdff; }
.kb-card-title { font-size: 16px; font-weight: 800; color: #0f172a; }
.kb-create-copy { margin-top: 10px; font-size: 12px; line-height: 1.7; color: #64748b; }
.kb-meta-card { background: linear-gradient(180deg, #fcfdff, #f8fbff); }
.kb-meta-tip { margin-top: 10px; font-size: 12px; line-height: 1.7; color: #64748b; }
.kb-meta-form { margin-top: 16px; display: grid; gap: 10px; }
.kb-meta-form.compact { grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); align-items: start; }
.kb-meta-field { display: grid; gap: 6px; }
.kb-meta-field span { font-size: 12px; font-weight: 700; color: #475569; }
.kb-meta-field em { margin-left: 2px; font-style: normal; color: #dc2626; }
.kb-meta-field input, .kb-meta-field select { width: 100%; border-radius: 12px; border: 1px solid #dbeafe; background: #fff; padding: 9px 12px; font-size: 12px; outline: none; }
.kb-create-actions { margin-top: 18px; display: grid; gap: 12px; }
.kb-action-card { display: inline-flex; align-items: center; justify-content: center; gap: 8px; border-radius: 12px; border: 1px solid #dbeafe; background: #f8fafc; padding: 10px 14px; color: #475569; font-size: 13px; font-weight: 700; }
.kb-doc-card-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
.kb-doc-card-main { min-width: 0; flex: 1; }
.kb-doc-card-title { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 15px; font-weight: 800; color: #0f172a; }
.kb-doc-card-subline { margin-top: 10px; display: flex; align-items: center; gap: 8px; min-width: 0; white-space: nowrap; overflow: hidden; font-size: 12px; color: #64748b; }
.kb-doc-meta-preview { margin-top: 10px; font-size: 12px; line-height: 1.6; color: #475569; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.kb-dot { flex-shrink: 0; color: #cbd5e1; }
.kb-doc-card-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.kb-doc-primary-btn { display: inline-flex; align-items: center; justify-content: center; height: 32px; padding: 0 12px; border-radius: 999px; border: 1px solid #bfdbfe; background: #eff6ff; color: #2563eb; font-size: 12px; font-weight: 700; }
.kb-doc-menu-wrap { position: relative; }
.kb-doc-more-btn { flex-shrink: 0; display: inline-flex; width: 32px; height: 32px; align-items: center; justify-content: center; border-radius: 10px; color: #94a3b8; box-shadow: inset 0 0 0 1px #e2e8f0; background: #fff; }
.kb-doc-menu { position: absolute; right: 0; top: calc(100% + 8px); min-width: 148px; border-radius: 14px; border: 1px solid #dbeafe; background: #fff; padding: 6px; box-shadow: 0 18px 40px rgba(15,23,42,0.14); z-index: 5; }
.kb-doc-menu button { display: flex; width: 100%; align-items: center; gap: 8px; border-radius: 10px; padding: 8px 10px; font-size: 12px; color: #334155; }
.kb-doc-menu button:hover { background: #f8fafc; }
.kb-doc-menu button.danger { color: #dc2626; }
.kb-doc-card-meta { display: none; }
.kb-doc-status { display: inline-flex; align-items: center; gap: 4px; color: #10b981; font-weight: 700; }
.kb-doc-status.processing { color: #f59e0b; }
.kb-doc-inline-ellipsis { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.kb-doc-count { margin-top: 18px; font-size: 13px; color: #94a3b8; }
.kb-hit-head { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; }
.kb-hit-sub { margin-top: 6px; font-size: 13px; color: #64748b; }
.kb-hit-badge { display: inline-flex; align-items: center; gap: 6px; border-radius: 999px; background: #eff6ff; color: #2563eb; padding: 8px 12px; font-size: 12px; font-weight: 700; }
.kb-hit-form { margin-top: 18px; }
.kb-field { display: block; }
.kb-field-label { display: block; margin-bottom: 8px; font-size: 12px; font-weight: 700; color: #475569; }
.kb-field textarea { width: 100%; border-radius: 14px; border: 1px solid #dbeafe; background: #fff; padding: 12px 14px; font-size: 13px; outline: none; resize: vertical; }
.kb-hit-list { margin-top: 18px; display: grid; gap: 14px; }
.kb-hit-item { border-radius: 18px; border: 1px solid #e2e8f0; background: #fff; padding: 16px; }
.kb-hit-item-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.kb-hit-item-title { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 14px; font-weight: 800; color: #0f172a; }
.kb-hit-score { flex-shrink: 0; border-radius: 999px; background: #ecfeff; color: #0f766e; padding: 5px 9px; font-size: 11px; font-weight: 800; }
.kb-hit-item-content { margin-top: 10px; font-size: 12px; line-height: 1.7; color: #64748b; }
@media (max-width: 980px) {
  .kb-doc-panel { inset: 16px; }
  .kb-doc-body { grid-template-columns: 1fr; }
  .kb-doc-sidebar { display: flex; gap: 8px; overflow-x: auto; border-right: 0; border-bottom: 1px solid #e2e8f0; }
  .kb-side-item { min-width: 120px; }
}
</style>
