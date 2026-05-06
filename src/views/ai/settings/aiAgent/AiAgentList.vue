<script setup lang="ts">
import { computed, ref } from 'vue'
import { message } from 'ant-design-vue'
import { Bot, RefreshCw, Search } from 'lucide-vue-next'

defineOptions({ name: 'AiAgentList' })

type AgentStatus = 'published' | 'offline'
type AgentItem = {
  id: string
  name: string
  description: string
  status: AgentStatus
  owner: string
  updatedAt: string
  callCount: number
}

const keyword = ref('')
const agents = ref<AgentItem[]>([
  {
    id: 'agent-report',
    name: '报告生成 Agent',
    description: '用于报告模板选择、Markdown 文档生成、NL2SQL 数据引用和失败兜底。',
    status: 'published',
    owner: 'AI 平台组',
    updatedAt: '2026-04-20 11:30',
    callCount: 1260,
  },
  {
    id: 'agent-nl2sql',
    name: '智能问数 Agent',
    description: '读取 Good/Bad Case、业务术语和单数据源配置，辅助生成 SQL 与查询解释。',
    status: 'published',
    owner: '数据中台组',
    updatedAt: '2026-04-20 10:20',
    callCount: 986,
  },
  {
    id: 'agent-hazard',
    name: '隐患识图 Agent',
    description: '面向图片隐患识别、风险解释和整改建议的前台可用智能体。',
    status: 'offline',
    owner: '安全生产组',
    updatedAt: '2026-04-18 15:40',
    callCount: 342,
  },
])

const filteredAgents = computed(() => {
  const k = keyword.value.trim().toLowerCase()
  if (!k) return agents.value
  return agents.value.filter((agent) => `${agent.name} ${agent.description} ${agent.owner}`.toLowerCase().includes(k))
})

function nowText() {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}

function toggleStatus(agent: AgentItem) {
  agent.status = agent.status === 'published' ? 'offline' : 'published'
  agent.updatedAt = nowText()
  message.success(`${agent.name} 已${agent.status === 'published' ? '上架' : '下架'}`)
}

function resetSearch() {
  keyword.value = ''
}
</script>

<template>
  <div class="agent-manage-page">
    <header class="manage-header">
      <div>
        <div class="title">智能体管理</div>
        <div class="desc">本页只维护智能体的上架 / 下架状态。智能体创建、编排、能力配置不在本期管理范围内。</div>
      </div>
      <div class="scope-badge">仅上下架</div>
    </header>

    <section class="toolbar">
      <div class="search-box">
        <Search class="search-icon" />
        <input v-model="keyword" placeholder="搜索智能体名称 / 负责人 / 说明" />
      </div>
      <button type="button" class="reset-btn" @click="resetSearch">
        <RefreshCw class="h-4 w-4" /> 重置
      </button>
    </section>

    <section class="agent-table-wrap">
      <table class="agent-table">
        <thead>
          <tr>
            <th>智能体</th>
            <th>负责人</th>
            <th>调用量</th>
            <th>状态</th>
            <th>更新时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filteredAgents" :key="item.id">
            <td>
              <div class="agent-cell">
                <span class="agent-icon"><Bot class="h-4 w-4" /></span>
                <div class="agent-copy">
                  <div class="agent-name">{{ item.name }}</div>
                  <div class="agent-desc">{{ item.description }}</div>
                </div>
              </div>
            </td>
            <td>{{ item.owner }}</td>
            <td>{{ item.callCount.toLocaleString() }}</td>
            <td>
              <span :class="['status-pill', item.status]">{{ item.status === 'published' ? '已上架' : '已下架' }}</span>
            </td>
            <td>{{ item.updatedAt }}</td>
            <td>
              <button type="button" :class="['toggle-btn', item.status]" @click="toggleStatus(item)">
                {{ item.status === 'published' ? '下架' : '上架' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <div class="note-box">说明：AI 智能体由既有业务能力或后续编排体系产生，本期设置页不提供“新建智能体”入口，避免和前台体验入口混淆。</div>
  </div>
</template>

<style scoped lang="css">
.agent-manage-page { width: 100%; }
.manage-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 16px; }
.title { font-size: 20px; font-weight: 800; color: #0f172a; }
.desc { margin-top: 6px; max-width: 760px; font-size: 13px; line-height: 1.7; color: #64748b; }
.scope-badge { flex-shrink: 0; border-radius: 999px; background: #eff6ff; color: #1d4ed8; padding: 7px 12px; font-size: 12px; font-weight: 800; box-shadow: inset 0 0 0 1px #bfdbfe; }
.toolbar { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 14px; border-radius: 22px; background: #f8fafc; padding: 12px; box-shadow: inset 0 0 0 1px #e2e8f0; }
.search-box { position: relative; min-width: min(520px, 100%); flex: 1; }
.search-icon { position: absolute; left: 12px; top: 50%; width: 16px; height: 16px; transform: translateY(-50%); color: #94a3b8; }
.search-box input { width: 100%; border: 1px solid #dbeafe; border-radius: 14px; background: #fff; padding: 10px 12px 10px 38px; font-size: 13px; outline: none; }
.search-box input:focus { border-color: #38bdf8; box-shadow: 0 0 0 3px rgba(56,189,248,.14); }
.reset-btn { display: inline-flex; align-items: center; gap: 7px; border-radius: 14px; background: #fff; padding: 10px 14px; color: #334155; font-size: 13px; font-weight: 700; box-shadow: inset 0 0 0 1px #e2e8f0; }
.agent-table-wrap { overflow-x: auto; border-radius: 24px; border: 1px solid #e2e8f0; background: #fff; box-shadow: 0 14px 36px rgba(15,23,42,.05); }
.agent-table { width: 100%; min-width: 880px; border-collapse: collapse; text-align: left; font-size: 13px; }
th { background: #f8fafc; color: #64748b; font-size: 12px; font-weight: 800; padding: 13px 16px; }
td { border-top: 1px solid #f1f5f9; color: #475569; padding: 14px 16px; vertical-align: middle; }
.agent-cell { display: flex; align-items: center; gap: 12px; min-width: 0; }
.agent-icon { display: flex; width: 38px; height: 38px; align-items: center; justify-content: center; border-radius: 15px; background: linear-gradient(135deg, #e0f2fe, #eff6ff); color: #0369a1; box-shadow: inset 0 0 0 1px #bae6fd; }
.agent-copy { min-width: 0; }
.agent-name { font-weight: 850; color: #0f172a; }
.agent-desc { margin-top: 4px; max-width: 430px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 12px; color: #64748b; }
.status-pill { border-radius: 999px; padding: 5px 9px; font-size: 12px; font-weight: 800; box-shadow: inset 0 0 0 1px currentColor; }
.status-pill.published { background: #ecfdf5; color: #047857; }
.status-pill.offline { background: #f8fafc; color: #64748b; }
.toggle-btn { border-radius: 12px; padding: 8px 12px; font-size: 12px; font-weight: 800; }
.toggle-btn.published { background: #fff; color: #475569; box-shadow: inset 0 0 0 1px #cbd5e1; }
.toggle-btn.offline { background: linear-gradient(135deg, #0098ff, #006cff); color: #fff; }
.note-box { margin-top: 14px; border-radius: 18px; background: #fefce8; color: #854d0e; padding: 12px 14px; font-size: 12px; line-height: 1.7; box-shadow: inset 0 0 0 1px #fde68a; }
</style>
