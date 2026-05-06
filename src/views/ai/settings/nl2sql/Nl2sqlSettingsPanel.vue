<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { Database, FileText, Pencil, Plus, Search, Trash2, BookOpenText, CircleHelp, CheckCircle2, Settings2 } from 'lucide-vue-next'
import { message } from 'ant-design-vue'
import { useNL2SQLStore } from '@/stores/nl2sql'
import type { DomainTerm, JdbcDataSource, NL2SQLCase } from '@/types/aiPlatform'

defineOptions({ name: 'Nl2sqlSettingsPanel' })

type SubTab = 'cases' | 'terms' | 'source'

const nl2sqlStore = useNL2SQLStore()
const { nl2sqlCases, terms, jdbc, enabledGoodCases } = storeToRefs(nl2sqlStore)
const subTab = ref<SubTab>('cases')
const keyword = ref('')
const termsKeyword = ref('')
const caseModalOpen = ref(false)
const termModalOpen = ref(false)
const sourceModalOpen = ref(false)
const caseMode = ref<'create' | 'edit'>('create')
const termMode = ref<'create' | 'edit'>('create')
const caseForm = reactive<NL2SQLCase>({ id: '', question: '', type: 'Good Case', answer: '', remark: '', updatedAt: '' })
const termForm = reactive<DomainTerm>({ id: '', term: '', aliases: '', explanation: '', domain: '安全生产', updatedAt: '' })
const sourceForm = reactive<JdbcDataSource>({
  id: '',
  name: '',
  dbType: 'MySQL',
  driverClass: '',
  host: '',
  port: '',
  dbName: '',
  schema: '',
  username: '',
  password: '',
  charset: 'utf8mb4',
  timezone: 'Asia/Shanghai',
  sslMode: '关闭',
  connectionTimeout: '30',
  maxPoolSize: '10',
  remark: '',
  status: '未测试',
  updatedAt: '',
})

const jdbcDbTypes = ['MySQL', 'PostgreSQL', 'SQL Server', 'Oracle', '达梦', '人大金仓', '其他'] as const

const filteredCases = computed(() => {
  const k = keyword.value.trim().toLowerCase()
  const list = enabledGoodCases.value
  if (!k) return list
  return list.filter(item => `${item.question} ${item.answer} ${item.remark}`.toLowerCase().includes(k))
})

const filteredTerms = computed(() => {
  const k = termsKeyword.value.trim().toLowerCase()
  if (!k) return terms.value
  return terms.value.filter(item => `${item.term} ${item.aliases} ${item.explanation} ${item.domain}`.toLowerCase().includes(k))
})

const jdbcUrlPreview = computed(() => nl2sqlStore.jdbcUrl())
const sourceJdbcPreview = computed(() => {
  const host = sourceForm.host || '{host}'
  const port = sourceForm.port || '{port}'
  const dbName = sourceForm.dbName || '{database}'
  if (sourceForm.dbType === 'PostgreSQL') return `jdbc:postgresql://${host}:${port}/${dbName}`
  if (sourceForm.dbType === 'SQL Server') return `jdbc:sqlserver://${host}:${port};databaseName=${dbName}`
  if (sourceForm.dbType === 'Oracle') return `jdbc:oracle:thin:@${host}:${port}:${dbName}`
  if (sourceForm.dbType === '达梦') return `jdbc:dm://${host}:${port}/${dbName}`
  if (sourceForm.dbType === '人大金仓') return `jdbc:kingbase8://${host}:${port}/${dbName}`
  if (sourceForm.dbType === '其他') return `jdbc:{type}://${host}:${port}/${dbName}`
  return `jdbc:mysql://${host}:${port}/${dbName}?useUnicode=true&characterEncoding=${sourceForm.charset || 'utf8mb4'}&serverTimezone=${sourceForm.timezone || 'Asia/Shanghai'}&useSSL=${sourceForm.sslMode === '开启'}`
})

function nowText() {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}

function resetCaseForm() {
  Object.assign(caseForm, { id: '', question: '', type: 'Good Case', answer: '', remark: '', updatedAt: '' })
}

function openCreateCase() {
  caseMode.value = 'create'
  resetCaseForm()
  caseModalOpen.value = true
}

function openEditCase(item: NL2SQLCase) {
  caseMode.value = 'edit'
  Object.assign(caseForm, { ...item, type: 'Good Case' })
  caseModalOpen.value = true
}

function saveCase() {
  if (!caseForm.question.trim()) return message.warning('请填写问题')
  if (!caseForm.answer.trim()) return message.warning('请填写答案口径')
  const payload: NL2SQLCase = { ...caseForm, type: 'Good Case', id: caseForm.id || `case-${Date.now()}`, updatedAt: nowText() }
  const index = nl2sqlCases.value.findIndex(item => item.id === payload.id)
  if (index === -1) nl2sqlCases.value.unshift(payload)
  else nl2sqlCases.value.splice(index, 1, payload)
  caseModalOpen.value = false
  message.success(caseMode.value === 'create' ? '案例已新增' : '案例已更新')
}

function deleteCase(id: string) {
  const item = nl2sqlCases.value.find(x => x.id === id)
  if (!window.confirm(`确认删除案例「${item?.question || ''}」吗？`)) return
  nl2sqlCases.value = nl2sqlCases.value.filter(x => x.id !== id)
  message.success('案例已删除')
}

function resetTermForm() {
  Object.assign(termForm, { id: '', term: '', aliases: '', explanation: '', domain: '安全生产', updatedAt: '' })
}

function openCreateTerm() {
  termMode.value = 'create'
  resetTermForm()
  termModalOpen.value = true
}

function openEditTerm(item: DomainTerm) {
  termMode.value = 'edit'
  Object.assign(termForm, { ...item })
  termModalOpen.value = true
}

function saveTerm() {
  if (!termForm.term.trim()) return message.warning('请填写专有名词')
  if (!termForm.explanation.trim()) return message.warning('请填写口径说明')
  const payload: DomainTerm = { ...termForm, id: termForm.id || `term-${Date.now()}`, updatedAt: nowText() }
  const index = terms.value.findIndex(item => item.id === payload.id)
  if (index === -1) terms.value.unshift(payload)
  else terms.value.splice(index, 1, payload)
  termModalOpen.value = false
  message.success(termMode.value === 'create' ? '专有名词已新增' : '专有名词已更新')
}

function deleteTerm(id: string) {
  const item = terms.value.find(x => x.id === id)
  if (!window.confirm(`确认删除专有名词「${item?.term || ''}」吗？`)) return
  terms.value = terms.value.filter(x => x.id !== id)
  message.success('专有名词已删除')
}

function copyJdbcToForm() {
  Object.assign(sourceForm, JSON.parse(JSON.stringify(jdbc.value)))
}

function openEditSource() {
  copyJdbcToForm()
  sourceModalOpen.value = true
}

function onDbTypeChange() {
  sourceForm.driverClass = nl2sqlStore.driverFor(sourceForm.dbType)
  const defaultPorts: Record<string, string> = {
    MySQL: '3306', PostgreSQL: '5432', 'SQL Server': '1433', Oracle: '1521', 达梦: '5236', 人大金仓: '54321', 其他: sourceForm.port || ''
  }
  sourceForm.port = defaultPorts[sourceForm.dbType] || sourceForm.port
  sourceForm.status = '未测试'
}

function saveSource() {
  if (!sourceForm.name.trim()) return message.warning('请填写数据源名称')
  if (!sourceForm.host.trim() || !sourceForm.port.trim() || !sourceForm.dbName.trim()) return message.warning('请补全连接地址信息')
  Object.assign(jdbc.value, { ...sourceForm, updatedAt: nowText() })
  sourceModalOpen.value = false
  message.success('数据源配置已更新')
}

function testSource() {
  const ok = Boolean(sourceForm.name && sourceForm.dbType && sourceForm.host && sourceForm.port && sourceForm.dbName && sourceForm.username)
  sourceForm.status = ok ? '连通' : '失败'
  message[ok ? 'success' : 'warning'](ok ? '连接测试通过（Mock）' : '请补全连接参数后再测试')
}
</script>

<template>
  <section class="nl2sql-page space-y-5">
    <div class="rounded-[28px] border border-sky-200/70 bg-white/90 p-5 shadow-[0_18px_44px_rgba(14,116,144,0.08)]">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div class="text-lg font-semibold text-slate-950">NL2SQL 配置</div>
          <div class="mt-1 text-sm text-slate-500">围绕案例管理、专有名词和单数据源配置维护问数增强能力。当前默认只展示好的案例，不展示不好的案例。</div>
        </div>
        <div class="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
          <Settings2 class="h-3.5 w-3.5" /> 单 JDBC 数据源 / Mock 配置
        </div>
      </div>

      <div class="nl2sql-tabs mt-5">
        <button type="button" :class="['nl2sql-tab-btn', subTab === 'cases' && 'active']" @click="subTab = 'cases'">案例管理</button>
        <button type="button" :class="['nl2sql-tab-btn', subTab === 'terms' && 'active']" @click="subTab = 'terms'">专有名词</button>
        <button type="button" :class="['nl2sql-tab-btn', subTab === 'source' && 'active']" @click="subTab = 'source'">数据源配置</button>
      </div>
    </div>

    <div v-if="subTab === 'cases'" class="rounded-[28px] border border-sky-100 bg-white/95 p-5 shadow-sm">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div class="text-base font-semibold text-slate-950">好的案例</div>
          <div class="mt-1 text-xs text-slate-500">当前阶段只维护好的案例，用于给智能问数提供问题口径参考。</div>
        </div>
        <button type="button" class="primary-btn" @click="openCreateCase"><Plus class="h-4 w-4" /> 新增案例</button>
      </div>
      <div class="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div class="search-box"><Search class="search-icon" /><input v-model="keyword" placeholder="搜索问题 / 答案口径 / 备注" /></div>
        <span class="count-pill">共 {{ filteredCases.length }} 条</span>
      </div>
      <div class="mt-4 grid gap-3">
        <article v-for="item in filteredCases" :key="item.id" class="item-card">
          <div class="item-head">
            <div class="item-title-row">
              <span class="item-title" :title="item.question">{{ item.question }}</span>
              <span class="status-chip good">好的案例</span>
            </div>
            <div class="item-actions">
              <button type="button" class="text-btn" @click="openEditCase(item)"><Pencil class="h-3.5 w-3.5" /> 编辑</button>
              <button type="button" class="danger-btn" @click="deleteCase(item.id)"><Trash2 class="h-3.5 w-3.5" /> 删除</button>
            </div>
          </div>
          <div class="meta-line">更新时间：{{ item.updatedAt || '--' }}</div>
          <div class="info-row">
            <div class="info-block">
              <div class="info-label">答案口径</div>
              <div class="info-value">{{ item.answer }}</div>
            </div>
            <div class="info-block">
              <div class="info-label">补充说明</div>
              <div class="info-value">{{ item.remark || '暂无补充说明' }}</div>
            </div>
          </div>
        </article>
      </div>
    </div>

    <div v-if="subTab === 'terms'" class="rounded-[28px] border border-sky-100 bg-white/95 p-5 shadow-sm">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div class="text-base font-semibold text-slate-950">专有名词</div>
          <div class="mt-1 text-xs text-slate-500">维护业务术语、别名与解释口径。默认查看为只读模式，点击新增或编辑后再进入表单。</div>
        </div>
        <button type="button" class="primary-btn" @click="openCreateTerm"><Plus class="h-4 w-4" /> 新增名词</button>
      </div>
      <div class="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div class="search-box"><Search class="search-icon" /><input v-model="termsKeyword" placeholder="搜索名词 / 关键词 / 说明" /></div>
        <span class="count-pill">共 {{ filteredTerms.length }} 条</span>
      </div>
      <div class="mt-4 grid gap-3 md:grid-cols-2">
        <article v-for="item in filteredTerms" :key="item.id" class="item-card term-card">
          <div class="item-head">
            <div class="item-title-row">
              <span class="item-title" :title="item.term">{{ item.term }}</span>
              <span class="status-chip neutral">{{ item.domain }}</span>
            </div>
            <div class="item-actions">
              <button type="button" class="text-btn" @click="openEditTerm(item)"><Pencil class="h-3.5 w-3.5" /> 编辑</button>
              <button type="button" class="danger-btn" @click="deleteTerm(item.id)"><Trash2 class="h-3.5 w-3.5" /> 删除</button>
            </div>
          </div>
          <div class="meta-line">更新时间：{{ item.updatedAt || '--' }}</div>
          <div class="info-row single">
            <div class="info-block">
              <div class="info-label">关键词 / 别名</div>
              <div class="info-value">{{ item.aliases || '未填写' }}</div>
            </div>
            <div class="info-block">
              <div class="info-label">口径说明</div>
              <div class="info-value">{{ item.explanation }}</div>
            </div>
          </div>
        </article>
      </div>
    </div>

    <div v-if="subTab === 'source'" class="rounded-[28px] border border-sky-100 bg-white/95 p-5 shadow-sm">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div class="text-base font-semibold text-slate-950">数据源配置</div>
          <div class="mt-1 text-xs text-slate-500">默认只读展示当前单数据源。点击编辑后再修改，避免误触即生效。</div>
        </div>
        <div class="flex flex-wrap gap-2">
          <button type="button" class="ghost-btn" @click="nl2sqlStore.testJdbc()">连接测试</button>
          <button type="button" class="primary-btn" @click="openEditSource"><Pencil class="h-4 w-4" /> 编辑数据源</button>
        </div>
      </div>

      <div class="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div class="summary-card"><div class="summary-label">数据源名称</div><div class="summary-value" :title="jdbc.name">{{ jdbc.name || '--' }}</div></div>
        <div class="summary-card"><div class="summary-label">数据库类型</div><div class="summary-value">{{ jdbc.dbType }}</div></div>
        <div class="summary-card"><div class="summary-label">连接地址</div><div class="summary-value" :title="`${jdbc.host}:${jdbc.port}`">{{ jdbc.host }}:{{ jdbc.port }}</div></div>
        <div class="summary-card"><div class="summary-label">状态</div><div class="summary-value"><span :class="['status-chip', jdbc.status === '连通' ? 'good' : jdbc.status === '失败' ? 'bad' : 'neutral']">{{ jdbc.status }}</span></div></div>
      </div>

      <div class="mt-4 grid gap-4 md:grid-cols-2">
        <div class="detail-card">
          <div class="detail-title">连接信息</div>
          <div class="detail-list">
            <div><span>驱动类名</span><strong>{{ jdbc.driverClass || '--' }}</strong></div>
            <div><span>数据库名 / 服务名</span><strong>{{ jdbc.dbName || '--' }}</strong></div>
            <div><span>Schema</span><strong>{{ jdbc.schema || '--' }}</strong></div>
            <div><span>用户名</span><strong>{{ jdbc.username || '--' }}</strong></div>
          </div>
        </div>
        <div class="detail-card">
          <div class="detail-title">连接参数</div>
          <div class="detail-list">
            <div><span>字符集</span><strong>{{ jdbc.charset || '--' }}</strong></div>
            <div><span>时区</span><strong>{{ jdbc.timezone || '--' }}</strong></div>
            <div><span>SSL</span><strong>{{ jdbc.sslMode || '--' }}</strong></div>
            <div><span>连接超时</span><strong>{{ jdbc.connectionTimeout || '--' }} 秒</strong></div>
          </div>
        </div>
      </div>

      <div class="mt-4 rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
        <div class="mb-2 text-xs font-semibold text-blue-900">JDBC URL 预览</div>
        <code class="jdbc-code">{{ jdbcUrlPreview }}</code>
        <div class="mt-3 text-xs leading-5 text-blue-900/80">备注：{{ jdbc.remark || '暂无备注' }}</div>
      </div>
      <div class="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-800 ring-1 ring-amber-200">当前阶段只做一个默认数据源配置：支持 NL2SQL 查询链路读取当前连接信息，不做多数据源、跨库查询和复杂数据治理。</div>
    </div>

    <Teleport to="body">
      <div v-if="caseModalOpen" class="crud-modal">
        <div class="crud-mask" @click="caseModalOpen = false" />
        <div class="crud-panel">
          <div class="crud-head">
            <div>
              <div class="crud-title">{{ caseMode === 'create' ? '新增案例' : '编辑案例' }}</div>
              <div class="crud-sub">当前默认维护好的案例。问题与答案口径可用于智能问数链路。</div>
            </div>
            <button type="button" class="close-btn" @click="caseModalOpen = false">×</button>
          </div>
          <div class="crud-body">
            <label class="field">
              <span class="field-label">问题</span>
              <input v-model="caseForm.question" placeholder="请输入案例问题，例如：本月高风险隐患有多少？" />
            </label>
            <label class="field">
              <span class="field-label">答案口径</span>
              <textarea v-model="caseForm.answer" rows="4" placeholder="请输入答案口径，可填写解释文本或 SQL。" />
              <span class="field-tip"><CircleHelp class="h-3.5 w-3.5" /> 可填写 SQL 或规则说明，供 NL2SQL 链路参考。</span>
            </label>
            <label class="field">
              <span class="field-label">补充说明</span>
              <textarea v-model="caseForm.remark" rows="3" placeholder="可填写边界说明、口径限制或备注。" />
            </label>
          </div>
          <div class="crud-actions">
            <button type="button" class="ghost-btn" @click="caseModalOpen = false">取消</button>
            <button type="button" class="primary-btn" @click="saveCase">{{ caseMode === 'create' ? '确认新增' : '保存修改' }}</button>
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="termModalOpen" class="crud-modal">
        <div class="crud-mask" @click="termModalOpen = false" />
        <div class="crud-panel">
          <div class="crud-head">
            <div>
              <div class="crud-title">{{ termMode === 'create' ? '新增专有名词' : '编辑专有名词' }}</div>
              <div class="crud-sub">通过清晰的表单抬头，避免不清楚哪里填写名词、哪里填写关键词。</div>
            </div>
            <button type="button" class="close-btn" @click="termModalOpen = false">×</button>
          </div>
          <div class="crud-body two-col">
            <label class="field">
              <span class="field-label">专有名词</span>
              <input v-model="termForm.term" placeholder="例如：高风险隐患" />
            </label>
            <label class="field">
              <span class="field-label">所属领域</span>
              <input v-model="termForm.domain" placeholder="例如：安全生产" />
            </label>
            <label class="field field-span">
              <span class="field-label">关键词 / 别名</span>
              <input v-model="termForm.aliases" placeholder="多个关键词请用逗号分隔，例如：重大隐患, 红色风险" />
            </label>
            <label class="field field-span">
              <span class="field-label">口径说明</span>
              <textarea v-model="termForm.explanation" rows="4" placeholder="说明该术语在业务场景中的解释口径。" />
            </label>
          </div>
          <div class="crud-actions">
            <button type="button" class="ghost-btn" @click="termModalOpen = false">取消</button>
            <button type="button" class="primary-btn" @click="saveTerm">{{ termMode === 'create' ? '确认新增' : '保存修改' }}</button>
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="sourceModalOpen" class="crud-modal">
        <div class="crud-mask" @click="sourceModalOpen = false" />
        <div class="crud-panel large">
          <div class="crud-head">
            <div>
              <div class="crud-title">编辑数据源配置</div>
              <div class="crud-sub">非编辑状态不直接展示输入框，避免误填导致不清楚是否已保存。</div>
            </div>
            <button type="button" class="close-btn" @click="sourceModalOpen = false">×</button>
          </div>
          <div class="crud-body two-col">
            <label class="field field-span">
              <span class="field-label">数据源名称</span>
              <input v-model="sourceForm.name" placeholder="例如：安全生产业务库" />
            </label>
            <label class="field">
              <span class="field-label">数据库类型</span>
              <select v-model="sourceForm.dbType" @change="onDbTypeChange"><option v-for="type in jdbcDbTypes" :key="type" :value="type">{{ type }}</option></select>
            </label>
            <label class="field">
              <span class="field-label">驱动类名</span>
              <input v-model="sourceForm.driverClass" placeholder="选择类型后可自动带出" />
            </label>
            <label class="field"><span class="field-label">主机地址</span><input v-model="sourceForm.host" placeholder="127.0.0.1" /></label>
            <label class="field"><span class="field-label">端口</span><input v-model="sourceForm.port" placeholder="3306" /></label>
            <label class="field"><span class="field-label">数据库名 / 服务名</span><input v-model="sourceForm.dbName" placeholder="safety_prod" /></label>
            <label class="field"><span class="field-label">Schema（可选）</span><input v-model="sourceForm.schema" placeholder="public / dbo" /></label>
            <label class="field"><span class="field-label">用户名</span><input v-model="sourceForm.username" placeholder="demo_user" /></label>
            <label class="field"><span class="field-label">密码</span><input v-model="sourceForm.password" type="password" placeholder="本地 Mock 保存" /></label>
            <label class="field"><span class="field-label">字符集</span><input v-model="sourceForm.charset" placeholder="utf8mb4" /></label>
            <label class="field"><span class="field-label">时区</span><input v-model="sourceForm.timezone" placeholder="Asia/Shanghai" /></label>
            <label class="field"><span class="field-label">SSL</span><select v-model="sourceForm.sslMode"><option value="关闭">关闭</option><option value="开启">开启</option></select></label>
            <label class="field"><span class="field-label">连接超时（秒）</span><input v-model="sourceForm.connectionTimeout" placeholder="30" /></label>
            <label class="field field-span"><span class="field-label">备注</span><textarea v-model="sourceForm.remark" rows="3" placeholder="说明该数据源用途、负责人或适用范围" /></label>
          </div>
          <div class="jdbc-preview">
            <div class="jdbc-preview-title">JDBC URL 预览</div>
            <code>{{ sourceJdbcPreview }}</code>
          </div>
          <div class="crud-actions">
            <button type="button" class="ghost-btn" @click="testSource">连接测试</button>
            <div class="crud-actions-right">
              <button type="button" class="ghost-btn" @click="sourceModalOpen = false">取消</button>
              <button type="button" class="primary-btn" @click="saveSource">保存修改</button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </section>
</template>

<style scoped>
.primary-btn,.ghost-btn{display:inline-flex;align-items:center;justify-content:center;gap:7px;border-radius:14px;padding:10px 14px;font-size:13px;font-weight:800}
.primary-btn{background:linear-gradient(135deg,#0098ff,#006cff);color:#fff;box-shadow:0 12px 26px rgba(0,108,255,.18)}
.ghost-btn{background:#fff;color:#334155;box-shadow:inset 0 0 0 1px #dbeafe}
.nl2sql-tabs{display:flex;gap:8px;border-radius:18px;background:#f8fafc;padding:5px;box-shadow:inset 0 0 0 1px #e2e8f0}
.nl2sql-tab-btn{flex:1;border-radius:14px;padding:10px 12px;color:#475569;font-size:13px;font-weight:850;transition:.18s}
.nl2sql-tab-btn.active{background:linear-gradient(135deg,#0098ff,#006cff);color:#fff;box-shadow:0 10px 24px rgba(0,108,255,.18)}
.search-box{position:relative;min-width:min(420px,100%);flex:1}
.search-icon{position:absolute;left:12px;top:50%;width:15px;height:15px;transform:translateY(-50%);color:#94a3b8}
.search-box input{margin-top:0;padding-left:37px}
.search-box input,.search-box select,.search-box textarea,.field input,.field select,.field textarea{width:100%;border:1px solid #dbeafe;border-radius:14px;background:#fff;padding:10px 11px;font-size:13px;color:#0f172a;outline:none}
.count-pill{flex-shrink:0;border-radius:999px;background:#eff6ff;color:#1d4ed8;padding:7px 10px;font-size:12px;font-weight:800}
.item-card{border-radius:22px;border:1px solid #e0f2fe;background:#fff;padding:15px;box-shadow:0 10px 32px rgba(15,23,42,.04)}
.item-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px}
.item-title-row{display:flex;align-items:center;gap:8px;min-width:0}
.item-title{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:15px;font-weight:850;color:#0f172a}
.item-actions{display:flex;flex-wrap:wrap;gap:8px;justify-content:flex-end}
.text-btn,.danger-btn{display:inline-flex;align-items:center;gap:5px;border-radius:12px;padding:7px 10px;font-size:12px;font-weight:800}
.text-btn{background:#f8fafc;color:#334155}
.danger-btn{background:#fff1f2;color:#be123c}
.status-chip{display:inline-flex;align-items:center;border-radius:999px;padding:4px 8px;font-size:11px;font-weight:850}
.status-chip.good{background:#ecfdf5;color:#047857}
.status-chip.bad{background:#fff1f2;color:#be123c}
.status-chip.neutral{background:#f8fafc;color:#64748b}
.meta-line{margin-top:8px;font-size:11px;color:#94a3b8}
.info-row{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:14px}
.info-row.single{grid-template-columns:1fr}
.info-block{border-radius:16px;background:#f8fafc;padding:10px 12px}
.info-label{font-size:11px;font-weight:800;color:#64748b}
.info-value{margin-top:5px;font-size:12px;line-height:1.7;color:#334155}
.summary-card{border-radius:18px;background:#f8fafc;padding:14px;box-shadow:inset 0 0 0 1px #e2e8f0}
.summary-label{font-size:11px;font-weight:800;color:#64748b}
.summary-value{margin-top:7px;font-size:13px;font-weight:700;color:#0f172a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.detail-card{border-radius:18px;background:#fff;padding:15px;box-shadow:inset 0 0 0 1px #e2e8f0}
.detail-title{font-size:13px;font-weight:800;color:#0f172a}
.detail-list{margin-top:12px;display:grid;gap:9px}
.detail-list div{display:flex;align-items:center;justify-content:space-between;gap:14px;font-size:12px;color:#64748b}
.detail-list strong{font-weight:700;color:#0f172a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.jdbc-code{display:block;word-break:break-all;border-radius:12px;background:#fff;padding:10px 12px;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:12px;line-height:1.7;color:#1e3a8a;box-shadow:inset 0 0 0 1px #dbeafe}
.crud-modal{position:fixed;inset:0;z-index:220}
.crud-mask{position:absolute;inset:0;background:rgba(15,23,42,.26);backdrop-filter:blur(6px)}
.crud-panel{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:min(720px,calc(100vw - 32px));border-radius:28px;background:#fff;padding:22px;box-shadow:0 30px 90px rgba(15,23,42,.2)}
.crud-panel.large{width:min(980px,calc(100vw - 32px))}
.crud-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;padding-bottom:16px;border-bottom:1px solid #e2e8f0}
.crud-title{font-size:20px;font-weight:800;color:#0f172a}
.crud-sub{margin-top:6px;font-size:13px;color:#64748b;line-height:1.7}
.close-btn{display:inline-flex;width:34px;height:34px;align-items:center;justify-content:center;border-radius:12px;background:#f8fafc;color:#475569;box-shadow:inset 0 0 0 1px #e2e8f0}
.crud-body{display:grid;gap:14px;margin-top:18px}
.crud-body.two-col{grid-template-columns:repeat(2,minmax(0,1fr))}
.field{display:block}
.field-span{grid-column:1/-1}
.field-label{display:block;margin-bottom:8px;font-size:12px;font-weight:800;color:#475569}
.field-tip{display:inline-flex;align-items:center;gap:6px;margin-top:8px;font-size:11px;color:#64748b}
.crud-actions{display:flex;justify-content:space-between;gap:12px;margin-top:18px}
.crud-actions-right{display:flex;gap:10px}
.jdbc-preview{margin-top:18px;border-radius:18px;border:1px solid #dbeafe;background:#eff6ff;padding:14px}
.jdbc-preview-title{margin-bottom:8px;font-size:12px;font-weight:800;color:#1d4ed8}
.jdbc-preview code{display:block;word-break:break-all;border-radius:12px;background:#fff;padding:10px 12px;font-size:12px;line-height:1.7;color:#1e3a8a}
@media (max-width: 900px){.info-row,.crud-body.two-col{grid-template-columns:1fr}.crud-actions{flex-direction:column}.crud-actions-right{justify-content:flex-end}.nl2sql-tabs{flex-direction:column}.search-box{min-width:100%}}
</style>
