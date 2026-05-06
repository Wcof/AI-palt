<script setup lang="ts">
import { computed, ref } from 'vue'
import { message } from 'ant-design-vue'
import { Activity, Eye, FileText, ImageUp, Pencil, PlayCircle, Plus, Search, ServerCog, Trash2, UploadCloud, Wrench } from 'lucide-vue-next'
import SkillList from './skills/index.vue'

defineOptions({ name: 'AiMcpIndex' })

type McpStatus = 'enabled' | 'disabled' | 'draft'
type AuthType = 'none' | 'apiKey' | 'bearer' | 'basic'
type ProtocolType = 'HTTPS' | 'HTTP' | 'MCP' | 'SSE' | 'WebSocket'
type McpParam = { name: string; type: string; required: boolean; defaultValue: string; desc: string }
type McpTool = { name: string; desc: string; inputSchema: string; outputSchema: string }
type McpItem = {
  id: string
  name: string
  code: string
  category: string
  description: string
  tags: string
  endpoint: string
  protocol: ProtocolType
  method: string
  timeout: number
  retry: number
  authType: AuthType
  authKey: string
  authValue: string
  status: McpStatus
  updatedAt: string
  params: McpParam[]
  returns: McpParam[]
  tools: McpTool[]
}

const activeTab = ref<'mcp' | 'skills'>('mcp')
const keyword = ref('')
const activeStatus = ref<'all' | McpStatus>('all')
const modalOpen = ref(false)
const modalMode = ref<'create' | 'edit' | 'view'>('create')
const editingId = ref('')
const testingId = ref('')
const testInput = ref('{"imageUrl":"https://example.com/site.jpg"}')
const uploadPreview = ref('')
const uploadInputRef = ref<HTMLInputElement | null>(null)

function nowText() {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}

const emptyMcp = (): McpItem => ({
  id: '',
  name: '',
  code: '',
  category: '通用服务',
  description: '',
  tags: 'MCP,Mock',
  endpoint: 'https://api.example.com/mcp/mock',
  protocol: 'HTTPS',
  method: 'POST',
  timeout: 30,
  retry: 1,
  authType: 'bearer',
  authKey: 'Authorization',
  authValue: 'Bearer mock-token',
  status: 'enabled',
  updatedAt: '',
  params: [
    { name: 'imageUrl', type: 'string', required: true, defaultValue: '', desc: '图片地址或 base64' },
    { name: 'scene', type: 'string', required: false, defaultValue: 'safety', desc: '业务场景' },
  ],
  returns: [
    { name: 'code', type: 'number', required: true, defaultValue: '0', desc: '状态码' },
    { name: 'data', type: 'object', required: true, defaultValue: '{}', desc: '识别结果' },
  ],
  tools: [
    { name: 'mockInvoke', desc: '执行 MCP Mock 调用', inputSchema: '{"imageUrl":"string"}', outputSchema: '{"code":0,"data":{}}' },
  ],
})

const form = ref<McpItem>(emptyMcp())

const mcpItems = ref<McpItem[]>([
  {
    id: 'mcp-ocr',
    name: 'OCR 文字识别 MCP',
    code: 'ocr_recognition',
    category: '图像识别',
    description: '支持图片文字识别、票据识别、表格识别和安全生产现场标识牌识别，主要用于在线试用体验。',
    tags: 'OCR,文字识别,图像识别,现场识别',
    endpoint: 'https://mock-api.geeklightyear.com/mcp/ocr',
    protocol: 'HTTPS',
    method: 'POST',
    timeout: 30,
    retry: 2,
    authType: 'bearer',
    authKey: 'Authorization',
    authValue: 'Bearer mock-ocr-token',
    status: 'enabled',
    updatedAt: '2026-04-24 09:20',
    params: [
      { name: 'image', type: 'file/base64', required: true, defaultValue: '', desc: '待识别图片' },
      { name: 'detectTable', type: 'boolean', required: false, defaultValue: 'true', desc: '是否识别表格结构' },
    ],
    returns: [
      { name: 'text', type: 'string', required: true, defaultValue: '', desc: '识别文本' },
      { name: 'fields', type: 'array', required: false, defaultValue: '[]', desc: '结构化字段' },
      { name: 'confidence', type: 'number', required: true, defaultValue: '0.96', desc: '置信度' },
    ],
    tools: [
      { name: 'ocrRecognize', desc: '识别图片文字并返回结构化字段', inputSchema: '{"image":"base64","detectTable":true}', outputSchema: '{"text":"安全出口","fields":[],"confidence":0.96}' },
    ],
  },
  {
    id: 'mcp-face',
    name: '人脸识别 MCP',
    code: 'face_recognition',
    category: '视觉算法',
    description: '支持人脸检测、人脸比对、人员身份识别和现场人员合规识别，返回人脸框、属性和识别置信度。',
    tags: '人脸识别,人脸检测,人员识别,视觉算法',
    endpoint: 'https://mock-api.geeklightyear.com/mcp/face',
    protocol: 'HTTPS',
    method: 'POST',
    timeout: 20,
    retry: 1,
    authType: 'apiKey',
    authKey: 'X-API-Key',
    authValue: 'mock-face-key',
    status: 'enabled',
    updatedAt: '2026-04-24 09:30',
    params: [
      { name: 'image', type: 'file/base64', required: true, defaultValue: '', desc: '人员图片' },
      { name: 'threshold', type: 'number', required: false, defaultValue: '0.82', desc: '识别阈值' },
    ],
    returns: [
      { name: 'faceBox', type: 'object', required: true, defaultValue: '{}', desc: '人脸框坐标' },
      { name: 'attributes', type: 'object', required: false, defaultValue: '{}', desc: '年龄段、性别、口罩等属性' },
      { name: 'confidence', type: 'number', required: true, defaultValue: '0.93', desc: '识别置信度' },
    ],
    tools: [
      { name: 'faceDetect', desc: '检测图片中的人脸与基础属性', inputSchema: '{"image":"base64","threshold":0.82}', outputSchema: '{"faceBox":{"x":120,"y":80,"w":160,"h":180},"confidence":0.93}' },
      { name: 'faceCompare', desc: '根据人员库返回相似人员信息', inputSchema: '{"image":"base64","personGroup":"factory"}', outputSchema: '{"matched":true,"personName":"张三","score":0.91}' },
    ],
  },
  {
    id: 'mcp-hazard',
    name: '隐患识图 MCP',
    code: 'hazard_vision',
    category: '安全算法',
    description: '用于前台 AI 技能页的 MCP 服务能力展示，可识别安全帽、吸烟、通道占用、临时用电等现场风险。',
    tags: '隐患,视觉,安全生产',
    endpoint: 'mcp://hazard-vision',
    protocol: 'MCP',
    method: 'invoke',
    timeout: 45,
    retry: 2,
    authType: 'none',
    authKey: '',
    authValue: '',
    status: 'enabled',
    updatedAt: '2026-04-20 10:30',
    params: [
      { name: 'imageUrl', type: 'string', required: true, defaultValue: '', desc: '现场图片地址' },
      { name: 'scene', type: 'string', required: false, defaultValue: 'chemical_factory', desc: '业务场景' },
    ],
    returns: [
      { name: 'hazards', type: 'array', required: true, defaultValue: '[]', desc: '隐患识别结果' },
      { name: 'suggestion', type: 'string', required: false, defaultValue: '', desc: '整改建议' },
    ],
    tools: [
      { name: 'detectHazard', desc: '识别图片中的隐患类型和风险等级', inputSchema: '{"imageUrl":"string","scene":"chemical_factory"}', outputSchema: '{"hazards":[{"type":"未戴安全帽","level":"高"}]}' },
    ],
  },
])

const filteredMcp = computed(() => {
  const k = keyword.value.trim().toLowerCase()
  return mcpItems.value.filter(item => {
    if (activeStatus.value !== 'all' && item.status !== activeStatus.value) return false
    if (!k) return true
    return `${item.name} ${item.code} ${item.category} ${item.description} ${item.tags}`.toLowerCase().includes(k)
  })
})

const currentTestingMcp = computed(() => mcpItems.value.find(item => item.id === testingId.value) || null)

function resetForm() {
  editingId.value = ''
  form.value = emptyMcp()
}

function openCreate() {
  resetForm()
  modalMode.value = 'create'
  modalOpen.value = true
}

function openEdit(item: McpItem) {
  editingId.value = item.id
  form.value = JSON.parse(JSON.stringify(item))
  modalMode.value = 'edit'
  modalOpen.value = true
}

function openView(item: McpItem) {
  openEdit(item)
  modalMode.value = 'view'
}

function closeModal() {
  modalOpen.value = false
}

function saveMcp() {
  if (modalMode.value === 'view') return
  if (!form.value.name.trim()) {
    message.warning('请输入 MCP 名称')
    return
  }
  if (!form.value.code.trim()) {
    message.warning('请输入 MCP 标识')
    return
  }
  const item: McpItem = { ...form.value, id: editingId.value || `mcp-${Date.now()}`, updatedAt: nowText() }
  const idx = mcpItems.value.findIndex(mcp => mcp.id === item.id)
  if (idx === -1) mcpItems.value.unshift(item)
  else mcpItems.value.splice(idx, 1, item)
  message.success(editingId.value ? 'MCP 已更新' : 'MCP 已新建')
  closeModal()
  resetForm()
}

function deleteMcp(id: string) {
  mcpItems.value = mcpItems.value.filter(item => item.id !== id)
  if (testingId.value === id) testingId.value = ''
  message.success('MCP 已删除')
}

function toggleMcp(item: McpItem) {
  item.status = item.status === 'enabled' ? 'disabled' : 'enabled'
  item.updatedAt = nowText()
  message.success(`${item.name} 已${item.status === 'enabled' ? '启用' : '停用'}`)
}

function openTest(item: McpItem) {
  testingId.value = item.id
  uploadPreview.value = ''
  if (item.id === 'mcp-face') testInput.value = '{"image":"base64://mock-face-image","threshold":0.82}'
  else if (item.id === 'mcp-ocr') testInput.value = '{"image":"base64://mock-ocr-image","detectTable":true}'
  else testInput.value = '{"imageUrl":"https://example.com/site.jpg","scene":"chemical_factory"}'
}

function addParam() {
  form.value.params.push({ name: '', type: 'string', required: false, defaultValue: '', desc: '' })
}

function addReturn() {
  form.value.returns.push({ name: '', type: 'string', required: false, defaultValue: '', desc: '' })
}

function addTool() {
  form.value.tools.push({ name: '', desc: '', inputSchema: '{}', outputSchema: '{}' })
}

function onUploadPreview(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    uploadPreview.value = String(reader.result || '')
    if (currentTestingMcp.value?.id === 'mcp-face') testInput.value = '{"image":"base64://uploaded-face-image","threshold":0.82}'
    else if (currentTestingMcp.value?.id === 'mcp-ocr') testInput.value = '{"image":"base64://uploaded-ocr-image","detectTable":true}'
  }
  reader.readAsDataURL(file)
  ;(e.target as HTMLInputElement).value = ''
}

function testResult(item: McpItem | null) {
  if (!item) return ''
  if (item.id === 'mcp-face') {
    return JSON.stringify({
      code: 0,
      message: 'success',
      data: {
        faceBox: { x: 128, y: 64, width: 186, height: 210 },
        person: { matched: true, name: '张三', department: '生产一部' },
        attributes: { ageRange: '35-45', gender: 'male', mask: false, helmet: true },
        confidence: 0.93,
      },
      cost: '186ms',
    }, null, 2)
  }
  if (item.id === 'mcp-ocr') {
    return JSON.stringify({
      code: 0,
      message: 'success',
      data: {
        text: '安全出口\\n严禁烟火\\n设备编号：R-102',
        fields: [
          { key: '标识类型', value: '安全标识牌', confidence: 0.97 },
          { key: '设备编号', value: 'R-102', confidence: 0.95 },
        ],
        confidence: 0.96,
      },
      cost: '142ms',
    }, null, 2)
  }
  return JSON.stringify({
    code: 0,
    message: 'success',
    data: {
      hazards: [
        { type: '未佩戴安全帽', level: '高', confidence: 0.91 },
        { type: '通道临时占用', level: '中', confidence: 0.86 },
      ],
      suggestion: '建议立即提醒人员补齐 PPE，并清理消防通道占用物。',
    },
    cost: '238ms',
  }, null, 2)
}
</script>

<template>
  <div class="ai-skill-manage-page">
    <header class="header">
      <div>
        <div class="title">AI 技能管理</div>
        <div class="desc">MCP 与 Skill 统一 CRUD 体验：列表、查看、编辑、新增、删除、启停与在线试用。MCP 新增 / 编辑按 HTTPS 接口配置思路补齐服务、鉴权、参数、返回和工具能力配置。</div>
      </div>
    </header>

    <div class="tabs">
      <button type="button" :class="['tab-btn', { active: activeTab === 'mcp' }]" @click="activeTab = 'mcp'">MCP 管理（Mock）</button>
      <button type="button" :class="['tab-btn', { active: activeTab === 'skills' }]" @click="activeTab = 'skills'">Skill 管理</button>
    </div>

    <section v-if="activeTab === 'mcp'" class="mcp-panel">
      <div class="toolbar">
        <div class="search-box">
          <Search class="search-icon" />
          <input v-model="keyword" placeholder="搜索 MCP 名称、标识、分类、标签" />
        </div>
        <select v-model="activeStatus" class="status-select">
          <option value="all">全部状态</option>
          <option value="enabled">启用</option>
          <option value="disabled">停用</option>
          <option value="draft">草稿</option>
        </select>
        <button type="button" class="primary-btn" @click="openCreate"><Plus class="h-4 w-4" /> 新增 MCP</button>
      </div>

      <div class="mcp-grid">
        <article v-for="item in filteredMcp" :key="item.id" class="mcp-card">
          <div class="mcp-head">
            <span class="mcp-icon"><ServerCog class="h-5 w-5" /></span>
            <div class="min-w-0 flex-1">
              <div class="mcp-title-row">
                <h3>{{ item.name }}</h3>
                <span :class="['status-pill', item.status]">{{ item.status === 'enabled' ? '启用' : item.status === 'disabled' ? '停用' : '草稿' }}</span>
              </div>
              <div class="endpoint">{{ item.protocol }} · {{ item.method }} · {{ item.endpoint }}</div>
            </div>
          </div>
          <p>{{ item.description }}</p>
          <div class="tags"><span v-for="tag in item.tags.split(',')" :key="tag">{{ tag }}</span></div>
          <div class="config-summary">
            <span>分类：{{ item.category }}</span>
            <span>超时：{{ item.timeout }}s</span>
            <span>重试：{{ item.retry }} 次</span>
            <span>鉴权：{{ item.authType }}</span>
          </div>
          <div class="card-actions">
            <button type="button" class="text-btn" @click="openView(item)"><Eye class="h-3.5 w-3.5" /> 查看</button>
            <button type="button" class="text-btn" @click="openEdit(item)"><Pencil class="h-3.5 w-3.5" /> 编辑</button>
            <button type="button" class="text-btn" @click="openTest(item)"><PlayCircle class="h-3.5 w-3.5" /> 试用</button>
            <button type="button" class="text-btn" @click="toggleMcp(item)">{{ item.status === 'enabled' ? '停用' : '启用' }}</button>
            <button type="button" class="danger-btn" @click="deleteMcp(item.id)"><Trash2 class="h-3.5 w-3.5" /> 删除</button>
          </div>
          <div class="updated">更新时间：{{ item.updatedAt }}</div>
        </article>
      </div>

      <section v-if="currentTestingMcp" class="test-panel">
        <div class="test-head">
          <div>
            <div class="panel-title">在线试用：{{ currentTestingMcp.name }}</div>
            <div class="panel-desc">OCR / 人脸识别支持图片上传 Mock；通用 MCP 展示参数输入、结果预览、耗时与状态码。</div>
          </div>
          <button type="button" class="ghost-btn" @click="testingId = ''">关闭试用</button>
        </div>

        <div class="test-layout">
          <div class="test-card">
            <div class="sub-title"><ImageUp class="h-4 w-4" /> 请求参数</div>
            <div v-if="currentTestingMcp.id === 'mcp-ocr' || currentTestingMcp.id === 'mcp-face'" class="upload-area">
              <input ref="uploadInputRef" type="file" accept="image/*" class="hidden" @change="onUploadPreview" />
              <button type="button" class="ghost-btn" @click="uploadInputRef?.click()"><UploadCloud class="h-4 w-4" /> 上传图片</button>
              <img v-if="uploadPreview" :src="uploadPreview" alt="上传预览" class="preview-img" />
              <div v-else class="upload-placeholder">{{ currentTestingMcp.id === 'mcp-ocr' ? '上传标识牌 / 票据 / 表格图片' : '上传人员人脸图片' }}</div>
            </div>
            <textarea v-model="testInput" rows="9" class="mono-input" />
          </div>
          <div class="test-card">
            <div class="sub-title"><Activity class="h-4 w-4" /> Mock 返回结果</div>
            <pre class="result-pre">{{ testResult(currentTestingMcp) }}</pre>
          </div>
        </div>
      </section>
    </section>

    <section v-else class="skill-panel">
      <SkillList />
    </section>

    <div v-if="modalOpen" class="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-sm">
      <div class="modal-card">
        <div class="modal-head">
          <div>
            <div class="modal-title">{{ modalMode === 'create' ? '新增 MCP' : modalMode === 'edit' ? '编辑 MCP' : '查看 MCP' }}</div>
            <div class="modal-desc">配置方式参考 HTTPS 接口：基础信息、服务配置、鉴权、请求参数、返回结构和 Tool 能力。</div>
          </div>
          <button type="button" class="ghost-btn" @click="closeModal">关闭</button>
        </div>

        <div class="modal-body">
          <section class="form-section">
            <div class="section-title">基础信息</div>
            <div class="form-grid">
              <label>MCP 名称<input v-model="form.name" :disabled="modalMode === 'view'" /></label>
              <label>MCP 标识<input v-model="form.code" :disabled="modalMode === 'view'" /></label>
              <label>分类<input v-model="form.category" :disabled="modalMode === 'view'" /></label>
              <label>状态<select v-model="form.status" :disabled="modalMode === 'view'"><option value="enabled">启用</option><option value="disabled">停用</option><option value="draft">草稿</option></select></label>
              <label class="span-2">标签<input v-model="form.tags" :disabled="modalMode === 'view'" /></label>
              <label class="span-2">描述<textarea v-model="form.description" rows="2" :disabled="modalMode === 'view'" /></label>
            </div>
          </section>

          <section class="form-section">
            <div class="section-title">服务配置</div>
            <div class="form-grid">
              <label>协议类型<select v-model="form.protocol" :disabled="modalMode === 'view'"><option>HTTPS</option><option>HTTP</option><option>MCP</option><option>SSE</option><option>WebSocket</option></select></label>
              <label>请求方法<input v-model="form.method" :disabled="modalMode === 'view'" /></label>
              <label class="span-2">服务地址 / Endpoint<input v-model="form.endpoint" :disabled="modalMode === 'view'" /></label>
              <label>超时时间（秒）<input v-model.number="form.timeout" type="number" :disabled="modalMode === 'view'" /></label>
              <label>重试次数<input v-model.number="form.retry" type="number" :disabled="modalMode === 'view'" /></label>
            </div>
          </section>

          <section class="form-section">
            <div class="section-title">鉴权配置</div>
            <div class="form-grid">
              <label>鉴权方式<select v-model="form.authType" :disabled="modalMode === 'view'"><option value="none">无</option><option value="apiKey">API Key</option><option value="bearer">Bearer Token</option><option value="basic">Basic Auth</option></select></label>
              <label>Header Key<input v-model="form.authKey" :disabled="modalMode === 'view'" /></label>
              <label class="span-2">Token / 密钥<input v-model="form.authValue" :disabled="modalMode === 'view'" /></label>
            </div>
          </section>

          <section class="form-section">
            <div class="section-line">
              <div class="section-title">请求参数配置</div>
              <button v-if="modalMode !== 'view'" type="button" class="mini-btn" @click="addParam">新增参数</button>
            </div>
            <div class="table-like">
              <div v-for="(param, idx) in form.params" :key="`param-${idx}`" class="param-row">
                <input v-model="param.name" placeholder="参数名称" :disabled="modalMode === 'view'" />
                <input v-model="param.type" placeholder="类型" :disabled="modalMode === 'view'" />
                <select v-model="param.required" :disabled="modalMode === 'view'"><option :value="true">必填</option><option :value="false">非必填</option></select>
                <input v-model="param.defaultValue" placeholder="默认值" :disabled="modalMode === 'view'" />
                <input v-model="param.desc" placeholder="说明" :disabled="modalMode === 'view'" />
              </div>
            </div>
          </section>

          <section class="form-section">
            <div class="section-line">
              <div class="section-title">返回结构配置</div>
              <button v-if="modalMode !== 'view'" type="button" class="mini-btn" @click="addReturn">新增返回字段</button>
            </div>
            <div class="table-like">
              <div v-for="(ret, idx) in form.returns" :key="`ret-${idx}`" class="param-row">
                <input v-model="ret.name" placeholder="字段名称" :disabled="modalMode === 'view'" />
                <input v-model="ret.type" placeholder="类型" :disabled="modalMode === 'view'" />
                <select v-model="ret.required" :disabled="modalMode === 'view'"><option :value="true">必填</option><option :value="false">非必填</option></select>
                <input v-model="ret.defaultValue" placeholder="示例值" :disabled="modalMode === 'view'" />
                <input v-model="ret.desc" placeholder="说明" :disabled="modalMode === 'view'" />
              </div>
            </div>
          </section>

          <section class="form-section">
            <div class="section-line">
              <div class="section-title">工具能力配置</div>
              <button v-if="modalMode !== 'view'" type="button" class="mini-btn" @click="addTool">新增 Tool</button>
            </div>
            <div class="tool-list">
              <div v-for="(tool, idx) in form.tools" :key="`tool-${idx}`" class="tool-item">
                <div class="form-grid">
                  <label>Tool 名称<input v-model="tool.name" :disabled="modalMode === 'view'" /></label>
                  <label>Tool 描述<input v-model="tool.desc" :disabled="modalMode === 'view'" /></label>
                  <label>输入 Schema<textarea v-model="tool.inputSchema" rows="3" class="mono-input" :disabled="modalMode === 'view'" /></label>
                  <label>输出 Schema<textarea v-model="tool.outputSchema" rows="3" class="mono-input" :disabled="modalMode === 'view'" /></label>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div v-if="modalMode !== 'view'" class="modal-actions">
          <button type="button" class="ghost-btn" @click="closeModal">取消</button>
          <button type="button" class="primary-btn" @click="saveMcp">保存 MCP</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="css">
.ai-skill-manage-page { width: 100%; }
.header { margin-bottom: 14px; }
.title { font-size: 20px; font-weight: 850; color: #0f172a; }
.desc { margin-top: 6px; max-width: 980px; font-size: 13px; line-height: 1.7; color: #64748b; }
.tabs { display: flex; gap: 8px; margin-bottom: 16px; border-radius: 18px; background: #f8fafc; padding: 5px; box-shadow: inset 0 0 0 1px #e2e8f0; }
.tab-btn { flex: 1; border-radius: 14px; padding: 10px 12px; color: #475569; font-size: 13px; font-weight: 850; transition: .18s; }
.tab-btn.active { background: linear-gradient(135deg, #0098ff, #006cff); color: #fff; box-shadow: 0 10px 24px rgba(0,108,255,.18); }
.mcp-panel, .skill-panel { border-radius: 26px; border: 1px solid #dbeafe; background: rgba(255,255,255,.88); padding: 16px; box-shadow: 0 18px 46px rgba(15,23,42,.06); }
.toolbar { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 14px; }
.search-box { position: relative; min-width: min(520px, 100%); flex: 1; }
.search-icon { position: absolute; left: 12px; top: 50%; width: 15px; height: 15px; transform: translateY(-50%); color: #94a3b8; }
.search-box input, .status-select, input, select, textarea { border: 1px solid #dbeafe; border-radius: 14px; background: #fff; padding: 10px 11px; font-size: 13px; color: #0f172a; outline: none; }
.search-box input { width: 100%; padding-left: 37px; }
.status-select { min-width: 130px; }
.primary-btn, .ghost-btn, .text-btn, .danger-btn, .mini-btn { display: inline-flex; align-items: center; justify-content: center; gap: 7px; border-radius: 14px; padding: 10px 14px; font-size: 13px; font-weight: 800; }
.primary-btn { background: linear-gradient(135deg, #0098ff, #006cff); color: #fff; box-shadow: 0 12px 26px rgba(0,108,255,.18); }
.ghost-btn { background: #fff; color: #334155; box-shadow: inset 0 0 0 1px #dbeafe; }
.text-btn { background: #f8fafc; color: #334155; }
.danger-btn { background: #fff1f2; color: #be123c; }
.mini-btn { padding: 7px 10px; font-size: 12px; background: #eff6ff; color: #1d4ed8; }
.mcp-grid { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 12px; }
.mcp-card { border-radius: 22px; border: 1px solid #e0e7ff; background: #fff; padding: 16px; }
.mcp-head { display: flex; align-items: flex-start; gap: 12px; }
.mcp-icon { display: flex; width: 44px; height: 44px; flex-shrink: 0; align-items: center; justify-content: center; border-radius: 16px; background: #f5f3ff; color: #6d28d9; box-shadow: inset 0 0 0 1px #ddd6fe; }
.mcp-title-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
h3 { margin: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 15px; font-weight: 850; color: #0f172a; }
.endpoint { margin-top: 7px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 12px; color: #475569; }
p { margin: 10px 0 0; font-size: 12px; line-height: 1.7; color: #64748b; }
.tags { margin-top: 12px; display: flex; flex-wrap: wrap; gap: 6px; }
.tags span { border-radius: 999px; background: #eff6ff; color: #1d4ed8; padding: 4px 8px; font-size: 11px; font-weight: 700; }
.config-summary { margin-top: 12px; display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 6px; }
.config-summary span { border-radius: 12px; background: #f8fafc; padding: 7px 9px; font-size: 11px; color: #64748b; }
.card-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 13px; }
.updated { margin-top: 10px; font-size: 11px; color: #94a3b8; }
.status-pill { flex-shrink: 0; border-radius: 999px; padding: 4px 8px; font-size: 11px; font-weight: 850; }
.status-pill.enabled { background: #ecfdf5; color: #047857; }
.status-pill.disabled { background: #f8fafc; color: #64748b; }
.status-pill.draft { background: #fff7ed; color: #c2410c; }
.test-panel { margin-top: 18px; border-radius: 24px; border: 1px solid #bfdbfe; background: linear-gradient(135deg, #eff6ff, #fff); padding: 16px; }
.test-head { display: flex; justify-content: space-between; gap: 12px; margin-bottom: 14px; }
.panel-title { font-size: 15px; font-weight: 850; color: #0f172a; }
.panel-desc { margin-top: 4px; font-size: 12px; color: #64748b; }
.test-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.test-card { border-radius: 20px; background: white; padding: 14px; box-shadow: inset 0 0 0 1px #dbeafe; }
.sub-title { display: flex; align-items: center; gap: 7px; margin-bottom: 10px; font-size: 13px; font-weight: 850; color: #0f172a; }
.upload-area { display: grid; gap: 10px; margin-bottom: 10px; }
.preview-img { max-height: 150px; width: 100%; object-fit: contain; border-radius: 16px; border: 1px solid #dbeafe; background: #f8fafc; }
.upload-placeholder { border: 1px dashed #93c5fd; border-radius: 16px; background: #f8fbff; padding: 18px; text-align: center; font-size: 12px; color: #64748b; }
.mono-input, .result-pre { width: 100%; border-radius: 16px; background: #f8fbff; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 12px; line-height: 1.6; }
.result-pre { min-height: 250px; overflow: auto; padding: 12px; color: #0f172a; box-shadow: inset 0 0 0 1px #dbeafe; }
.modal-card { width: min(1080px, 96vw); max-height: 92vh; display: flex; flex-direction: column; border-radius: 28px; background: #fff; box-shadow: 0 28px 90px rgba(15,23,42,.24); }
.modal-head, .modal-actions { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; padding: 18px; border-bottom: 1px solid #e2e8f0; }
.modal-actions { justify-content: flex-end; border-top: 1px solid #e2e8f0; border-bottom: none; }
.modal-title { font-size: 18px; font-weight: 850; color: #0f172a; }
.modal-desc { margin-top: 4px; font-size: 12px; color: #64748b; }
.modal-body { overflow: auto; padding: 18px; }
.form-section { margin-bottom: 16px; border-radius: 22px; background: #f8fbff; padding: 14px; box-shadow: inset 0 0 0 1px #dbeafe; }
.section-title { margin-bottom: 10px; font-size: 14px; font-weight: 850; color: #0f172a; }
.section-line { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.form-grid { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 12px; }
label { display: block; font-size: 12px; font-weight: 800; color: #475569; }
label input, label select, label textarea { margin-top: 6px; width: 100%; }
.span-2 { grid-column: span 2 / span 2; }
.table-like { display: grid; gap: 8px; }
.param-row { display: grid; grid-template-columns: 1.1fr .8fr .7fr .9fr 1.5fr; gap: 8px; }
.tool-list { display: grid; gap: 10px; }
.tool-item { border-radius: 18px; background: white; padding: 12px; box-shadow: inset 0 0 0 1px #e0f2fe; }
@media (max-width: 980px) { .mcp-grid, .test-layout { grid-template-columns: 1fr; } .modal-card { width: 96vw; } }
@media (max-width: 720px) { .form-grid, .param-row, .config-summary { grid-template-columns: 1fr; } .span-2 { grid-column: auto; } .test-head { flex-direction: column; } }
</style>
