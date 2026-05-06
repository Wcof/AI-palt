<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { FileText, Filter, Search, Wrench } from 'lucide-vue-next'

defineOptions({ name: 'McpSkillPublicList' })

type SkillType = 'mcp' | 'skill'
type SkillItem = {
  id: string
  name: string
  type: SkillType
  status: 'enabled' | 'disabled'
  description: string
  version: string
  updatedAt: string
  labels: string[]
}

const router = useRouter()
const keyword = ref('')
const typeFilter = ref<'all' | SkillType>('all')

const items = ref<SkillItem[]>([
  { id: 'mcp-ocr', name: 'OCR 文字识别 MCP', type: 'mcp', status: 'enabled', description: '支持图片文字识别、票据识别、表格识别和安全生产现场标识牌识别，提供上传试用与结构化返回示意。', version: 'v1.0.0', updatedAt: '2026-04-24 09:20', labels: ['MCP', 'OCR', '图像识别', '试用'] },
  { id: 'mcp-face', name: '人脸识别 MCP', type: 'mcp', status: 'enabled', description: '支持人脸检测、人脸比对、人员身份识别和现场人员合规识别，返回人脸框、属性和置信度。', version: 'v1.0.0', updatedAt: '2026-04-24 09:30', labels: ['MCP', '人脸识别', '视觉算法'] },
  { id: 'mcp-hazard', name: '隐患识图 MCP', type: 'mcp', status: 'enabled', description: '基于图片与知识库检索执行隐患识别，支持安全帽、吸烟、通道占用等安全场景 Mock。', version: 'v1.1.0', updatedAt: '2026-04-20 10:30', labels: ['MCP', '隐患', '视觉'] },
  { id: 'skill-report-writer', name: '报告生成 Skill', type: 'skill', status: 'enabled', description: '基于 Skill.md 装载报告生成能力说明，支持模板、数据引用与兜底提示。', version: 'v0.1.0', updatedAt: '2026-04-20 11:00', labels: ['Skill', '报告', '模板'] },
  { id: 'skill-nl2sql-governance', name: 'NL2SQL 增强 Skill', type: 'skill', status: 'enabled', description: '将 Good/Bad Case、专有名词和单数据源配置用于问数链路，提升 SQL 生成可控性。', version: 'v0.1.0', updatedAt: '2026-04-20 11:20', labels: ['Skill', 'NL2SQL', '数据'] },
])

const filtered = computed(() => {
  const k = keyword.value.trim().toLowerCase()
  return items.value.filter(item => {
    if (typeFilter.value !== 'all' && item.type !== typeFilter.value) return false
    if (!k) return true
    return `${item.name} ${item.description} ${item.labels.join(' ')}`.toLowerCase().includes(k)
  })
})

function setTypeFilter(v: string) {
  if (v === 'all' || v === 'mcp' || v === 'skill') typeFilter.value = v
}

function goDetail(item: SkillItem) {
  router.push(item.type === 'mcp' ? `/mcp/${item.id}` : `/skill/${item.id}`)
}
</script>

<template>
  <div class="skill-public-page">
    <header class="page-head">
      <div>
        <div class="title">AI技能</div>
        <p class="desc">AI 技能分为 MCP 与 Skills 两类。这里是用户可查看、可使用的前台列表；新增、编辑、查看、删除、启停和在线试用统一进入系统设置管理。</p>
      </div>
    </header>

    <section class="filter-panel">
      <div class="search-box">
        <Search class="search-icon" />
        <input v-model="keyword" placeholder="搜索 MCP / Skill 名称、说明或标签" />
      </div>
      <div class="type-tabs">
        <button v-for="opt in [{v:'all',l:'全部'}, {v:'mcp',l:'MCP'}, {v:'skill',l:'Skills'}]" :key="opt.v" :class="['type-tab', { active: typeFilter === opt.v }]" @click="setTypeFilter(opt.v)">
          <Filter class="h-3.5 w-3.5" /> {{ opt.l }}
        </button>
      </div>
    </section>

    <section class="skill-grid">
      <article v-for="item in filtered" :key="item.id" class="skill-card" @click="goDetail(item)">
        <div class="card-top">
          <div :class="['skill-icon', item.type]">
            <Wrench v-if="item.type === 'mcp'" class="h-5 w-5" />
            <FileText v-else class="h-5 w-5" />
          </div>
          <div class="min-w-0 flex-1">
            <div class="card-title-row">
              <h3>{{ item.name }}</h3>
              <span :class="['type-badge', item.type]">{{ item.type === 'mcp' ? 'MCP' : 'Skill' }}</span>
            </div>
            <p>{{ item.version }} · {{ item.updatedAt }}</p>
          </div>
        </div>
        <div class="card-desc">{{ item.description }}</div>
        <div class="tags"><span v-for="tag in item.labels" :key="tag">{{ tag }}</span></div>
        <div class="card-bottom">
          <span>详情页类型：{{ item.type === 'mcp' ? 'MCP 服务详情' : 'Skill.md 详情' }}</span>
          <button>查看详情</button>
        </div>
      </article>
    </section>
  </div>
</template>

<style scoped lang="css">
.skill-public-page { width: 100%; min-height: 100%; }
.page-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; margin-bottom: 18px; }
.title { font-size: 24px; font-weight: 800; color: #0f172a; }
.desc { margin-top: 8px; max-width: 860px; font-size: 13px; line-height: 1.75; color: #64748b; }
.filter-panel { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 16px; border: 1px solid rgba(125,211,252,.45); border-radius: 24px; background: rgba(255,255,255,.76); padding: 14px; box-shadow: 0 16px 36px rgba(15,23,42,.04); }
.search-box { position: relative; min-width: min(520px, 100%); flex: 1; }
.search-icon { position: absolute; left: 14px; top: 50%; width: 16px; height: 16px; transform: translateY(-50%); color: #64748b; }
.search-box input { width: 100%; border: 1px solid rgba(14,165,233,.25); border-radius: 16px; background: rgba(255,255,255,.92); padding: 11px 12px 11px 42px; font-size: 13px; outline: none; }
.search-box input:focus { border-color: rgba(14,165,233,.58); }
.type-tabs { display: flex; flex-wrap: wrap; gap: 8px; }
.type-tab { display: inline-flex; align-items: center; gap: 6px; border-radius: 999px; background: white; padding: 9px 12px; font-size: 12px; font-weight: 800; color: #475569; box-shadow: inset 0 0 0 1px rgba(125,211,252,.48); }
.type-tab.active { background: linear-gradient(135deg, #0098ff, #006cff); color: white; box-shadow: none; }
.skill-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
.skill-card { cursor: pointer; display: flex; min-height: 250px; flex-direction: column; border-radius: 26px; border: 1px solid rgba(125,211,252,.45); background: rgba(255,255,255,.82); padding: 20px; box-shadow: 0 20px 52px rgba(15,23,42,.07); transition: transform .18s, box-shadow .18s, border-color .18s; }
.skill-card:hover { transform: translateY(-3px); border-color: rgba(14,165,233,.45); box-shadow: 0 28px 70px rgba(14,116,144,.14); }
.card-top { display: flex; gap: 12px; align-items: flex-start; }
.skill-icon { display: flex; width: 48px; height: 48px; flex-shrink: 0; align-items: center; justify-content: center; border-radius: 18px; }
.skill-icon.mcp { background: #f5f3ff; color: #6d28d9; box-shadow: inset 0 0 0 1px #ddd6fe; }
.skill-icon.skill { background: #e0f2fe; color: #0369a1; box-shadow: inset 0 0 0 1px #bae6fd; }
.card-title-row { display: flex; align-items: center; gap: 8px; }
.card-title-row h3 { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 15px; font-weight: 850; color: #0f172a; }
.card-top p { margin-top: 5px; font-size: 11px; color: #64748b; }
.type-badge { flex-shrink: 0; border-radius: 999px; padding: 3px 8px; font-size: 10px; font-weight: 850; }
.type-badge.mcp { background: #f5f3ff; color: #6d28d9; }
.type-badge.skill { background: #e0f2fe; color: #0369a1; }
.card-desc { margin-top: 16px; min-height: 68px; font-size: 13px; line-height: 1.72; color: #475569; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
.tags { margin-top: 14px; display: flex; flex-wrap: wrap; gap: 8px; }
.tags span { border-radius: 999px; background: rgba(14,165,233,.1); padding: 5px 9px; font-size: 11px; color: #0369a1; }
.card-bottom { margin-top: auto; padding-top: 18px; display: flex; align-items: center; justify-content: space-between; gap: 12px; font-size: 11px; color: #64748b; }
.card-bottom button { flex-shrink: 0; border-radius: 13px; background: linear-gradient(135deg, #0098ff, #006cff); color: white; padding: 8px 12px; font-size: 12px; font-weight: 800; }
@media (max-width: 1180px) { .skill-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 760px) { .skill-grid { grid-template-columns: 1fr; } }
</style>
