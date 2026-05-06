<template>
  <div class="knowledge-page">
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div class="min-w-0 flex-1">
        <div class="title">{{ title }}</div>
        <div class="desc">{{ desc }}</div>
      </div>
      <div class="panel-header">
        <div class="header-actions">
          <div class="page-type">
            <button :class="['switch-btn', { active: checkType === 'more' }]" @click="checkType = 'more'">无限滚动</button>
            <button :class="['switch-btn', { active: checkType === 'paged' }]" @click="checkType = 'paged'">分页</button>
          </div>
          <button class="sort-btn" @click="handleReset">
            <ReloadOutlined class="sort-icon" />
            <span>重置</span>
          </button>
        </div>
      </div>
    </div>

    <section class="main-panel mt-4">
      <aside class="left-panel">
        <FilterCard title="搜索">
          <div class="search-group">
            <input v-model="keyword" class="search-input" :placeholder="searchPlaceholder" @keydown.enter="handleSearch" />
            <div class="search-actions">
              <button class="btn btn-primary" @click="handleSearch">搜索</button>
              <button class="btn btn-default" @click="handleReset">清空</button>
            </div>
          </div>
        </FilterCard>
        <FilterCard title="标签">
          <FilterChips :options="tagOptions" :model-value="selectedTag" @update:model-value="handleTagChange" />
        </FilterCard>
      </aside>

      <div class="min-w-0 flex-1 ml-2 content-scroll">
        <div v-if="filteredList.length" class="card-grid">
          <article v-for="item in filteredList" :key="item.id" class="knowledge-card">
            <div class="card-top">
              <div class="card-icon">
                <img v-if="item.iconPath" :src="item.iconPath" class="card-icon-img" />
                <DatabaseOutlined v-else-if="props.menuType === 'knowledge'" class="card-icon" />
                <RobotOutlined v-else class="card-icon" />
              </div>
              <div class="card-head">
                <div class="card-title-row">
                  <h3>{{ item.title }}</h3>
                </div>
                <p>更新时间：{{ item.updatedAt || '--' }}</p>
              </div>
            </div>
            <div class="tip">{{ item.description }}</div>
            <div class="flex-1"></div>
            <div class="label-container flex items-center gap-2">
              <div class="badge" v-for="(label, index) in item.labels" :key="index">{{ label }}</div>
            </div>
            <div class="card-bottom">
              <div class="rating">
                <span class="star">★</span><span class="star">★</span><span class="star">★</span><span class="star">★</span><span class="star">★</span>
                <span class="score">{{ item.score }}</span>
              </div>
              <div class="card-actions">
                <button class="use-btn" @click="handleUse(item)">{{ primaryActionText }}</button>
              </div>
            </div>
          </article>
        </div>
        <EmptyState v-else @reset="handleReset" />

        <Pager
          :mode="pagerMode"
          :page="page"
          :total-pages="totalPages"
          :total="pageInfo.total || filteredList.length"
          :has-more="hasMore"
          @load-more="handlePagerAction"
          @prev="handlePrevPage"
          @next="handleNextPage"
        />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { DatabaseOutlined, ReloadOutlined, RobotOutlined } from '@ant-design/icons-vue'
import FilterCard from './FilterCard.vue'
import FilterChips from './FilterChips.vue'
import EmptyState from './EmptyState.vue'
import Pager from './Pager.vue'
import { useAiList } from '@/views/ai/hooks/useAiList'
import { useAiLoginGuard } from '@/views/ai/hooks/useAiLoginGuard'

const props = defineProps({
  menuType: {
    type: String,
    default: 'knowledge',
  },
})

const emit = defineEmits(['use'])

const {
  lists,
  getList,
  pageInfo,
  handleReset: resetList,
  handleSearch: searchList,
  checkType,
  labelList,
  getLabelList,
} = useAiList(props.menuType)
const { ensureLogin } = useAiLoginGuard()

const titleMap = {
  knowledge: { title: 'AI知识库', desc: '选择已上架知识库进行检索体验。知识库创建、文档维护和上下架统一在系统设置中管理。' },
  agent: { title: 'AI智能体', desc: '选择已上架智能体进行在线体验。智能体创建、编辑和上下架统一在系统设置中管理。' },
  mcp: { title: 'AI技能', desc: '选择已上架 MCP 或 Skill 进行查看和调用体验。技能维护统一在系统设置中管理。' },
} as const

const title = computed(() => titleMap[props.menuType as keyof typeof titleMap]?.title || titleMap.mcp.title)
const desc = computed(() => titleMap[props.menuType as keyof typeof titleMap]?.desc || titleMap.mcp.desc)
const searchPlaceholder = computed(() => props.menuType === 'agent' ? '搜索智能体名称 / 描述 / 标签' : props.menuType === 'mcp' ? '搜索技能名称 / 描述 / 标签' : '搜索知识库名称 / 描述 / 标签')
const primaryActionText = computed(() => props.menuType === 'agent' ? '立即体验' : props.menuType === 'mcp' ? '查看详情' : '立即使用')

const keyword = ref('')
const selectedTag = ref('')
const page = computed(() => pageInfo.value.page || 1)

const tagOptions = computed(() => [
  { value: '', label: '全部' },
  ...labelList.value.map((item) => ({ value: item.id, label: item.name })),
])

const filteredList = computed(() => lists.value.map((item) => ({
  id: item.id,
  title: item.name || item.agentName,
  updatedAt: item.updateTime || item.createTime,
  description: item.descr || item.description || '暂无描述',
  iconPath: item.iconPath,
  score: '4.8',
  labels: item.labels || [],
  params: [],
  raw: item,
})))

const totalPages = computed(() => pageInfo.value.totalPage || 1)
const hasMore = computed(() => pageInfo.value.page < pageInfo.value.totalPage)
const pagerMode = computed<'infinite' | 'paged'>(() => (checkType.value === 'more' ? 'infinite' : 'paged'))

async function handleTagChange(value: string) {
  selectedTag.value = value
  await searchList({ keyword: keyword.value, labels: value ? [value] : [] })
}

async function handleSearch() {
  await searchList({ keyword: keyword.value, labels: selectedTag.value ? [selectedTag.value] : [] })
}

async function handleReset() {
  keyword.value = ''
  selectedTag.value = ''
  await resetList({ keyword: '', labels: [] })
}

async function handlePagerAction() {
  if (checkType.value === 'more') {
    if (!hasMore.value) return
    pageInfo.value.page += 1
    await getList('more')
    return
  }
  pageInfo.value.page = pageInfo.value.page >= totalPages.value ? 1 : pageInfo.value.page + 1
  await getList('paged')
}

async function handlePrevPage() {
  if (pageInfo.value.page <= 1) return
  pageInfo.value.page -= 1
  await getList('paged')
}

async function handleNextPage() {
  if (pageInfo.value.page >= totalPages.value) return
  pageInfo.value.page += 1
  await getList('paged')
}

function handleUse(item: any) {
  if (!ensureLogin()) return
  emit('use', item)
}

watch(() => checkType.value, async (value) => {
  checkType.value = value === 'more' ? 'more' : 'paged'
  pageInfo.value.page = 1
  await getList(checkType.value)
})

onMounted(async () => {
  await Promise.all([getLabelList(), getList()])
})
</script>

<style scoped lang="css">
.knowledge-page { width: 100%; min-height: 100%; }
.left-panel { display: flex; flex-direction: column; gap: 10px; width: 300px; }
.content-scroll { max-height: calc(100vh - 220px); overflow-y: auto; padding-right: 2px; }
.search-group { display: flex; flex-direction: column; gap: 10px; }
.search-actions { display: flex; gap: 8px; }
.title { font-size: 24px; font-weight: 700; color: #0f172a; }
.desc { margin-top: 6px; max-width: 760px; font-size: 13px; line-height: 1.7; color: #64748b; }
.main-panel { display: flex; gap: 12px; }
.panel-header { display: flex; align-items: center; }
.header-actions { display: flex; align-items: center; gap: 10px; }
.page-type { display: inline-flex; gap: 4px; border-radius: 999px; background: rgba(255,255,255,.74); padding: 4px; box-shadow: inset 0 0 0 1px rgba(14,165,233,.18); }
.switch-btn { border-radius: 999px; padding: 6px 12px; font-size: 12px; font-weight: 700; color: #64748b; transition: all .18s; }
.switch-btn.active { background: linear-gradient(135deg, #0098ff, #006cff); color: white; }
.sort-btn { display: inline-flex; align-items: center; gap: 6px; border-radius: 12px; background: rgba(255,255,255,.78); padding: 8px 12px; font-size: 12px; font-weight: 700; color: #334155; box-shadow: inset 0 0 0 1px rgba(14,165,233,.18); }
.sort-icon { width: 14px; height: 14px; }
.search-input { width: 100%; border: 1px solid rgba(14,165,233,.24); border-radius: 14px; background: rgba(255,255,255,.9); padding: 9px 12px; font-size: 13px; color: #0f172a; outline: none; }
.search-input:focus { border-color: rgba(14,165,233,.55); }
.btn { border-radius: 12px; padding: 8px 14px; font-size: 12px; font-weight: 700; }
.btn-primary { background: linear-gradient(135deg, #0098ff, #006cff); color: white; }
.btn-default { background: white; color: #334155; box-shadow: inset 0 0 0 1px rgba(148,163,184,.38); }
.card-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
.knowledge-card { position: relative; display: flex; min-height: 230px; flex-direction: column; border-radius: 22px; border: 1px solid rgba(125,211,252,.45); background: rgba(255,255,255,.78); padding: 18px; box-shadow: 0 18px 45px rgba(15,23,42,.06); transition: transform .18s, box-shadow .18s; }
.knowledge-card:hover { transform: translateY(-2px); box-shadow: 0 22px 50px rgba(14,116,144,.12); }
.card-top { display: flex; align-items: flex-start; gap: 12px; }
.card-icon { display: flex; width: 44px; height: 44px; flex-shrink: 0; align-items: center; justify-content: center; border-radius: 16px; background: linear-gradient(135deg, #e0f2fe, #eff6ff); color: #0369a1; }
.card-icon-img { width: 44px; height: 44px; border-radius: 16px; object-fit: cover; }
.card-head { min-width: 0; flex: 1; }
.card-title-row { display: flex; align-items: center; gap: 8px; }
.card-title-row h3 { margin: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 15px; font-weight: 800; color: #0f172a; }
.card-head p { margin-top: 4px; font-size: 11px; color: #64748b; }
.tip { margin-top: 14px; min-height: 60px; color: #475569; font-size: 12px; line-height: 1.65; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
.label-container { margin-top: 12px; flex-wrap: wrap; }
.badge { border-radius: 999px; background: rgba(14,165,233,.1); padding: 4px 8px; font-size: 11px; color: #0369a1; }
.card-bottom { margin-top: 16px; display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.rating { display: flex; align-items: center; gap: 2px; font-size: 12px; color: #f59e0b; }
.score { margin-left: 4px; color: #64748b; }
.use-btn { border-radius: 12px; background: linear-gradient(135deg, #0098ff, #006cff); padding: 8px 12px; color: white; font-size: 12px; font-weight: 700; }
@media (max-width: 1180px) { .card-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 860px) { .main-panel { flex-direction: column; } .left-panel { width: 100%; } .card-grid { grid-template-columns: 1fr; } }
</style>
