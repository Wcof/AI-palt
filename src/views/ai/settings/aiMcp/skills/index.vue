<script setup lang="ts">
import { computed, ref } from 'vue'
import { message } from 'ant-design-vue'
import { Eye, FileText, Pencil, Plus, Search, Trash2, UploadCloud } from 'lucide-vue-next'

defineOptions({ name: 'SkillList' })

type SkillStatus = 'enabled' | 'disabled'
type SkillItem = {
  id: string
  name: string
  code: string
  version: string
  scene: string
  description: string
  status: SkillStatus
  docRaw: string
  skillPoints: string
  updatedAt: string
}

const keyword = ref('')
const editingId = ref('')
const viewingSkill = ref<SkillItem | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)

const emptyForm = (): SkillItem => ({
  id: '',
  name: '',
  code: '',
  version: 'v0.1.0',
  scene: '',
  description: '',
  status: 'enabled',
  docRaw: '',
  skillPoints: '报告模板选择、Markdown 报告生成、NL2SQL 数据引用、右侧文档预览、失败兜底提示',
  updatedAt: '',
})

const form = ref<SkillItem>(emptyForm())
const skills = ref<SkillItem[]>([
  {
    id: 'skill-report-writer',
    name: '报告生成 Skill',
    code: 'report_writer',
    version: 'v0.1.0',
    scene: '安全生产月报、整改报告、巡检分析报告',
    description: '根据报告模板、用户输入和可选 NL2SQL 数据结果生成结构化 Markdown 报告。',
    status: 'enabled',
    docRaw: '# 报告生成 Skill\n\n## 能力说明\n用于将模板、用户描述和数据引用组合为结构化报告。\n\n## 本期边界\n不做复杂 Word 在线排版，不做多阶段协同写作。',
    skillPoints: '报告模板选择、Markdown 报告生成、NL2SQL 数据引用、右侧文档预览、失败兜底提示',
    updatedAt: '2026-04-20 11:00',
  },
  {
    id: 'skill-nl2sql-governance',
    name: 'NL2SQL 增强 Skill',
    code: 'nl2sql_governance',
    version: 'v0.1.0',
    scene: '自然语言问数、指标口径解释、SQL 生成兜底',
    description: '将 Good/Bad Case、业务术语和单 JDBC 数据源配置引入问数链路。',
    status: 'enabled',
    docRaw: '# NL2SQL 增强 Skill\n\n## 能力说明\n读取 Case、术语与数据源配置，辅助问数 SQL 生成。\n\n## 本期边界\n只做单数据源，不做多数据源和跨库查询。',
    skillPoints: 'Good/Bad Case 参考、专有名词别名映射、单 JDBC 数据源、查询口径解释、失败提示兜底',
    updatedAt: '2026-04-20 11:20',
  },
])

const filteredSkills = computed(() => {
  const k = keyword.value.trim().toLowerCase()
  if (!k) return skills.value
  return skills.value.filter((item) => `${item.name} ${item.code} ${item.scene} ${item.description}`.toLowerCase().includes(k))
})

function nowText() {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}

function resetForm() {
  editingId.value = ''
  form.value = emptyForm()
}

function viewSkill(item: SkillItem) {
  viewingSkill.value = { ...item }
}

function editSkill(item: SkillItem) {
  editingId.value = item.id
  form.value = { ...item }
}

function deleteSkill(id: string) {
  skills.value = skills.value.filter((item) => item.id !== id)
  if (editingId.value === id) resetForm()
  message.success('Skill 已删除')
}

function toggleSkill(item: SkillItem) {
  item.status = item.status === 'enabled' ? 'disabled' : 'enabled'
  item.updatedAt = nowText()
  message.success(`${item.name} 已${item.status === 'enabled' ? '启用' : '停用'}`)
}

function saveSkill() {
  if (!form.value.name.trim()) {
    message.warning('请输入 Skill 名称')
    return
  }
  if (!form.value.code.trim()) {
    message.warning('请输入 Skill 标识')
    return
  }
  const item: SkillItem = {
    ...form.value,
    id: editingId.value || `skill-${Date.now()}`,
    updatedAt: nowText(),
  }
  const idx = skills.value.findIndex((skill) => skill.id === item.id)
  if (idx === -1) skills.value.unshift(item)
  else skills.value.splice(idx, 1, item)
  message.success(editingId.value ? 'Skill 已更新' : 'Skill 已新建')
  resetForm()
}

function onSkillMdUpload(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    form.value.docRaw = String(reader.result || '')
    if (!form.value.name) form.value.name = file.name.replace(/\.md$/i, '')
  }
  reader.readAsText(file)
  ;(e.target as HTMLInputElement).value = ''
}
</script>

<template>
  <div class="skill-crud-page">
    <header class="page-header">
      <div>
        <div class="title">Skills 管理</div>
        <div class="desc">这里维护平台自定义 Skill。Skill 与 MCP 分开管理：MCP 走服务源示意，Skill 走核心技能点与 Skill.md 文档的 CRUD。</div>
      </div>
      <button type="button" class="primary-btn" @click="resetForm">
        <Plus class="h-4 w-4" /> 新建 Skill
      </button>
    </header>

    <section class="crud-layout">
      <aside class="form-panel">
        <div class="panel-title">{{ editingId ? '编辑 Skill' : '新建 Skill' }}</div>
        <div class="form-grid">
          <label>Skill 名称<input v-model="form.name" placeholder="例如：报告生成 Skill" /></label>
          <label>Skill 标识<input v-model="form.code" placeholder="report_writer" /></label>
          <label>版本号<input v-model="form.version" placeholder="v0.1.0" /></label>
          <label>状态<select v-model="form.status"><option value="enabled">启用</option><option value="disabled">停用</option></select></label>
          <label class="span-2">适用场景<input v-model="form.scene" placeholder="说明该 Skill 用在哪些业务场景" /></label>
          <label class="span-2">描述<textarea v-model="form.description" rows="2" placeholder="一句话说明 Skill 能力" /></label>
        </div>

        <div class="upload-row">
          <input ref="fileInputRef" type="file" accept=".md,text/markdown,text/plain" class="hidden" @change="onSkillMdUpload" />
          <button type="button" class="ghost-btn" @click="fileInputRef?.click()"><UploadCloud class="h-4 w-4" /> 上传 Skill.md</button>
          <span class="hint">支持上传后继续编辑 Markdown 原文</span>
        </div>

        <label class="span-2">核心技能点<textarea v-model="form.skillPoints" rows="3" placeholder="例如：报告模板选择、Markdown 文档生成、失败兜底提示" /></label>
        <label class="block-label">Skill.md 文档<textarea v-model="form.docRaw" rows="7" class="mono" placeholder="# Skill 名称\n\n## 能力说明\n..." /></label>
        
        <div class="form-actions">
          <button type="button" class="primary-btn" @click="saveSkill">{{ editingId ? '保存修改' : '保存 Skill' }}</button>
          <button type="button" class="ghost-btn" @click="resetForm">清空</button>
        </div>
      </aside>

      <main class="list-panel">
        <div class="list-toolbar">
          <div class="search-box">
            <Search class="search-icon" />
            <input v-model="keyword" placeholder="搜索 Skill 名称 / 标识 / 场景" />
          </div>
          <span class="count">共 {{ filteredSkills.length }} 个 Skills</span>
        </div>

        <div class="skill-list">
          <article v-for="item in filteredSkills" :key="item.id" class="skill-card">
            <div class="skill-head">
              <span class="skill-icon"><FileText class="h-4 w-4" /></span>
              <div class="min-w-0 flex-1">
                <div class="skill-title-row">
                  <h3>{{ item.name }}</h3>
                  <span :class="['status-pill', item.status]">{{ item.status === 'enabled' ? '启用' : '停用' }}</span>
                </div>
                <div class="skill-meta">{{ item.code }} · {{ item.version }} · {{ item.updatedAt }}</div>
              </div>
            </div>
            <p class="skill-desc">{{ item.description }}</p>
            <div class="skill-scene">{{ item.scene || '未填写适用场景' }}</div><div class="skill-scene skill-points">{{ item.skillPoints || '未填写核心技能点' }}</div>
            <div class="card-actions">
              <button type="button" class="text-btn" @click="viewSkill(item)"><Eye class="h-3.5 w-3.5" /> 查看</button>
              <button type="button" class="text-btn" @click="editSkill(item)"><Pencil class="h-3.5 w-3.5" /> 编辑</button>
              <button type="button" class="text-btn" @click="toggleSkill(item)">{{ item.status === 'enabled' ? '停用' : '启用' }}</button>
              <button type="button" class="danger-btn" @click="deleteSkill(item.id)"><Trash2 class="h-3.5 w-3.5" /> 删除</button>
            </div>
          </article>
        </div>
      </main>
    </section>
  </div>

    <div v-if="viewingSkill" class="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-sm">
      <div class="w-full max-w-3xl rounded-[28px] bg-white p-5 shadow-[0_28px_90px_rgba(15,23,42,0.24)]">
        <div class="mb-4 flex items-start justify-between gap-3">
          <div>
            <div class="text-lg font-semibold text-slate-950">{{ viewingSkill.name }}</div>
            <div class="mt-1 text-xs text-slate-500">{{ viewingSkill.code }} · {{ viewingSkill.version }} · {{ viewingSkill.updatedAt }}</div>
          </div>
          <button type="button" class="ghost-btn" @click="viewingSkill = null">关闭</button>
        </div>
        <div class="grid gap-3 md:grid-cols-2">
          <div class="rounded-2xl bg-sky-50/70 p-4 ring-1 ring-sky-100">
            <div class="text-xs font-semibold text-sky-700">适用场景</div>
            <div class="mt-2 text-sm leading-6 text-slate-700">{{ viewingSkill.scene || '未填写' }}</div>
          </div>
          <div class="rounded-2xl bg-sky-50/70 p-4 ring-1 ring-sky-100">
            <div class="text-xs font-semibold text-sky-700">核心技能点</div>
            <div class="mt-2 text-sm leading-6 text-slate-700">{{ viewingSkill.skillPoints || '未填写' }}</div>
          </div>
        </div>
        <div class="mt-3 rounded-2xl bg-white p-4 ring-1 ring-sky-100">
          <div class="mb-2 text-xs font-semibold text-sky-700">Skill.md</div>
          <pre class="max-h-80 overflow-auto rounded-xl bg-blue-50 p-3 text-xs leading-5 text-blue-950">{{ viewingSkill.docRaw }}</pre>
        </div>
      </div>
    </div>

</template>

<style scoped lang="css">
.skill-crud-page { width: 100%; }
.page-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 16px; }
.title { font-size: 20px; font-weight: 850; color: #0f172a; }
.desc { margin-top: 6px; max-width: 820px; font-size: 13px; line-height: 1.7; color: #64748b; }
.primary-btn, .ghost-btn { display: inline-flex; align-items: center; justify-content: center; gap: 7px; border-radius: 14px; padding: 10px 14px; font-size: 13px; font-weight: 800; }
.primary-btn { background: linear-gradient(135deg, #0098ff, #006cff); color: #fff; box-shadow: 0 12px 26px rgba(0,108,255,.18); }
.ghost-btn { background: #fff; color: #334155; box-shadow: inset 0 0 0 1px #dbeafe; }
.crud-layout { display: grid; grid-template-columns: minmax(420px, 520px) minmax(0, 1fr); gap: 16px; }
.form-panel, .list-panel { border-radius: 26px; border: 1px solid #dbeafe; background: rgba(255,255,255,.92); padding: 16px; box-shadow: 0 18px 46px rgba(15,23,42,.06); }
.panel-title { margin-bottom: 12px; font-size: 15px; font-weight: 850; color: #0f172a; }
.form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
label, .block-label { display: block; font-size: 12px; font-weight: 800; color: #475569; }
input, select, textarea { margin-top: 6px; width: 100%; border: 1px solid #dbeafe; border-radius: 14px; background: #fff; padding: 10px 11px; font-size: 13px; font-weight: 500; color: #0f172a; outline: none; }
textarea { resize: vertical; line-height: 1.6; }
input:focus, select:focus, textarea:focus { border-color: #38bdf8; box-shadow: 0 0 0 3px rgba(56,189,248,.14); }
.span-2 { grid-column: span 2 / span 2; }
.upload-row { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; margin: 14px 0; }
.hint { font-size: 12px; color: #64748b; }
.block-label { margin-top: 12px; }
.mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 12px; }
.form-actions { margin-top: 14px; display: flex; flex-wrap: wrap; gap: 10px; }
.list-toolbar { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 12px; }
.search-box { position: relative; min-width: min(430px, 100%); flex: 1; }
.search-icon { position: absolute; left: 12px; top: 50%; width: 15px; height: 15px; transform: translateY(-50%); color: #94a3b8; }
.search-box input { padding-left: 37px; margin-top: 0; }
.count { flex-shrink: 0; border-radius: 999px; background: #eff6ff; color: #1d4ed8; padding: 7px 10px; font-size: 12px; font-weight: 800; }
.skill-list { display: grid; gap: 12px; max-height: 760px; overflow-y: auto; padding-right: 2px; }
.skill-card { border-radius: 22px; border: 1px solid #e0f2fe; background: #fff; padding: 15px; transition: box-shadow .18s, transform .18s; }
.skill-card:hover { transform: translateY(-2px); box-shadow: 0 16px 38px rgba(14,116,144,.1); }
.skill-head { display: flex; align-items: flex-start; gap: 12px; }
.skill-icon { display: flex; width: 40px; height: 40px; align-items: center; justify-content: center; border-radius: 15px; background: #e0f2fe; color: #0369a1; box-shadow: inset 0 0 0 1px #bae6fd; }
.skill-title-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
h3 { margin: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 15px; font-weight: 850; color: #0f172a; }
.skill-meta { margin-top: 4px; font-size: 11px; color: #64748b; }
.status-pill { flex-shrink: 0; border-radius: 999px; padding: 4px 8px; font-size: 11px; font-weight: 850; }
.status-pill.enabled { background: #ecfdf5; color: #047857; }
.status-pill.disabled { background: #f8fafc; color: #64748b; }
.skill-desc { margin-top: 12px; font-size: 13px; line-height: 1.7; color: #475569; }
.skill-scene { margin-top: 10px; border-radius: 14px; background: #f8fafc; padding: 9px 10px; font-size: 12px; color: #64748b; }
.card-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 13px; }
.text-btn, .danger-btn { display: inline-flex; align-items: center; gap: 5px; border-radius: 12px; padding: 7px 10px; font-size: 12px; font-weight: 800; }
.text-btn { background: #f8fafc; color: #334155; }
.danger-btn { background: #fff1f2; color: #be123c; }
@media (max-width: 1180px) { .crud-layout { grid-template-columns: 1fr; } }
@media (max-width: 640px) { .form-grid { grid-template-columns: 1fr; } .span-2 { grid-column: auto; } }
</style>
