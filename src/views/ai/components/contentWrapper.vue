<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { RotateCcw } from 'lucide-vue-next';
import FilterCard from '@/components/abilities/browser/FilterCard.vue';
import FilterChips from '@/components/abilities/browser/FilterChips.vue';
import EmptyState from '@/components/abilities/browser/EmptyState.vue';
import { useAiList } from '../hooks/useAiList';
import { useAiLoginGuard } from '../hooks/useAiLoginGuard';

const props = defineProps({
  menuType: {
    type: String,
    default: 'knowladge',
  },
});

const { lists, getList, pageInfo, handleReset: resetList, handleSearch: searchList, checkType } = useAiList(props.menuType);
const { ensureLogin } = useAiLoginGuard();

const titleMap = {
  knowladge: { title: 'AI知识库', desc: '汇聚安全生产法规、操作规程、事故案例与隐患排查标准，支持全领域智能问答与合规检索。' },
  agent: { title: 'AI智能体', desc: '面向安全生产的智能问答与合规助手，提供事件分析、整改跟踪与应急处置智能支持。' },
  mcp: { title: 'AI技能', desc: '聚焦安全生产场景，提供 NL2SQL 数据智能查询与 AI 视觉隐患识别两大核心 AI 技能。' },
} as const;

const emit = defineEmits(['use']);

const title = computed(() => titleMap[props.menuType as keyof typeof titleMap]?.title || titleMap.mcp.title);
const desc = computed(() => titleMap[props.menuType as keyof typeof titleMap]?.desc || titleMap.mcp.desc);

const keyword = ref('');
const selectedTag = ref('');
const page = computed(() => pageInfo.value.page || 1);

const tagOptions = computed(() => [
  { value: '', label: '全部' },
  { value: '安全生产', label: '安全生产' },
  { value: '应急管理', label: '应急管理' },
]);

const filteredList = computed(() => {
  return lists.value
    .map((item) => ({
      id: item.id,
      title: item.name,
      updatedAt: item.updateTime || item.createTime,
      library: item.name,
      version: 'v1.0',
      calls: '--',
      description: item.descr || '暂无描述',
      score: '4.8',
      tags: ['安全生产'],
    }))
});

const totalPages = computed(() => pageInfo.value.totalPage || 1);
const hasMore = computed(() => pageInfo.value.page < pageInfo.value.totalPage);

function handleTagChange(value: string) {
  selectedTag.value = value;
}

async function handleSearch() {
  await searchList({
    keyword: keyword.value,
  });
}

async function handleReset() {
  keyword.value = '';
  selectedTag.value = '';
  await resetList({
    keyword: '',
  });
}

async function handlePagerAction() {
  if (checkType.value === 'more') {
    if (!hasMore.value) return;
    pageInfo.value.page += 1;
    await getList('more');
    return;
  }
  if (pageInfo.value.page >= totalPages.value) {
    pageInfo.value.page = 1;
  } else {
    pageInfo.value.page += 1;
  }
  await getList('paged');
}

watch(() => checkType.value, async (value) => {
  checkType.value = value === 'more' ? 'more' : 'paged';
  pageInfo.value.page = 1;
  await getList(checkType.value);
});

const handleUse = (id: string) => {
  if (!ensureLogin()) {
    return;
  }
  emit('use', id);
}

onMounted(async () => {
  checkType.value = 'more';
  pageInfo.value.page = 1;
  await getList('more');
});
</script>

<template>
  <div class="knowledge-page">
    <div class="flex items-end">
      <div class="flex-1">
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
            <RotateCcw class="sort-icon" />
            <span>重置</span>
          </button>
        </div>
      </div>
    </div>
    <section class="main-panel mt-4">
      <aside class="left-panel">
        <FilterCard title="搜索">
          <div class="search-group">
            <input v-model="keyword" class="search-input" placeholder="搜索能力名称 / 描述 / 标签" @keydown.enter="handleSearch" />
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

      <div class="flex-1 ml-2">
        <div v-if="filteredList.length" class="card-grid">
          <article v-for="item in filteredList" :key="item.id" class="knowledge-card">
            <div class="card-top">
              <div class="card-icon">Q</div>
              <div class="card-head">
                <div class="card-title-row">
                  <h3>{{ item.title }}</h3>
                  <span class="badge">企业专家</span>
                </div>
                <p>更新时间：{{ item.updatedAt }}</p>
              </div>
            </div>
            <div class="tip">备注: {{ item.description }}</div>
            <div class="card-info">
              <div class="info-item">
                <div class="label">版本</div>
                <div class="value">{{ item.version }}</div>
              </div>
              <div class="info-item">
                <div class="label">调用次数</div>
                <div class="value">{{ item.calls }}</div>
              </div>
            </div>
            <div class="card-bottom">
              <div class="rating">
                <span class="star">★</span><span class="star">★</span><span class="star">★</span><span class="star">★</span
                ><span class="star">★</span>
                <span class="score">{{ item.score }}</span>
              </div>
              <button class="use-btn" @click="handleUse(item.id)">立即使用</button>
            </div>
          </article>
        </div>
        <EmptyState v-else @reset="handleReset" />

        <div class="pager-bar">
          <div class="pager-left">共 {{ filteredList.length }} 条 · 已加载 {{ filteredList.length }} / {{ filteredList.length || 1 }}</div>
          <button class="pager-right" @click="handlePagerAction">{{ checkType === 'more' ? (hasMore ? '加载更多' : '没有更多了') : `第 ${page} / ${totalPages} 页` }}</button>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped lang="less">
.knowledge-page {
  width: 100%;
  min-height: 100%;
}

.left-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 280px;
}

.search-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.search-input {
  height: 38px;
  border-radius: 10px;
  border: 1px solid #d1e8ff;
  background: #fff;
  padding: 0 10px;
  font-size: 13px;
  color: #1f2937;
}

.search-input:focus {
  outline: none;
  border-color: #5ab5ff;
  box-shadow: 0 0 0 2px rgba(0, 152, 255, 0.12);
}

.search-actions {
  display: flex;
  gap: 8px;
}

.btn {
  border: none;
  height: 30px;
  min-width: 44px;
  padding: 0 10px;
  border-radius: 8px;
  font-size: 12px;
  cursor: pointer;
}

.btn-primary {
  color: #fff;
  background: linear-gradient(90deg, #0897ff 0%, #0f7cff 100%);
}

.btn-default {
  color: #334155;
  background: #fff;
  border: 1px solid #dbeafe;
}

.main-panel {
  display: flex;
  min-width: 0;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 12px;
  margin-bottom: 10px;
}

.title {
  font-size: 32px;
  line-height: 1.1;
  font-weight: 800;
  color: #0f172a;
}

.desc {
  margin-top: 8px;
  font-size: 15px;
  color: #64748b;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  .page-type{
      background-color: #fff;
      padding: 3px;
      border: 1px solid #d9ecff;
      border-radius: 8px;
  }
}

.switch-btn {
  height: 28px;
  padding: 0 14px;
  border-radius: 8px;
  background: #fff;
  color: #406487;
  font-size: 13px;
  cursor: pointer;
}

.switch-btn.active {
  background: linear-gradient(90deg, #0897ff 0%, #0f7cff 100%);
  color: #fff;
  border-color: transparent;
}

.sort-btn {
  height: 34px;
  min-width: 64px;
  border-radius: 8px;
  border: 1px solid #d9ecff;
  background: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: #1f2937;
  font-size: 13px;
  cursor: pointer;
}

.sort-icon {
  font-size: 12px;
  width: 14px;
  height: 14px;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.knowledge-card {
  border-radius: 14px;
  border: 1px solid #d9edff;
  background: #fff;
  padding: 14px;
  box-shadow: 0 8px 18px rgba(54, 126, 206, 0.06);
  transition: all 0.3s ease;
  .tip{
      font-size: 12px;
      color: #556479;
      margin: 8px 0;
  }
  &:hover{
      transform: translateY(-8px);
      box-shadow: 0 8px 18px rgba(96, 159, 231, 0.32);
  }
}

.card-top {
  display: flex;
  align-items: center;
  gap: 10px;
}

.card-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg,#00b4ff29,#8d4cff14);
  border: 1px solid rgb(186 230 253 / .7);
  color: #0a79db;
  font-size: 16px;
  font-weight: 700;
}

.card-head {
  min-width: 0;
  flex: 1;
}

.card-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.card-title-row h3 {
  margin: 0;
  font-size: 15px;
  color: #0f172a;
}

.badge {
  flex-shrink: 0;
  border-radius: 12px;
  border: 1px solid #d6ecff;
  background: #f2f9ff;
  color: #1e88e5;
  font-size: 11px;
  padding: 3px 8px;
}

.card-head p {
  font-size: 12px;
  color: #64748b;
  margin: 0;
}

.card-info {
  margin-top: 12px;
  display: flex;
  gap: 8px;
}

.info-item {
  flex: 1;
  border: 1px solid #e6f2ff;
  border-radius: 10px;
  background: #fff;
  padding: 8px 10px;
}

.label {
  font-size: 11px;
  color: #94a3b8;
}

.value {
  margin-top: 4px;
  font-size: 15px;
  color: #0f172a;
  font-weight: 600;
}

.card-bottom {
  margin-top: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.rating {
  display: flex;
  align-items: center;
  gap: 2px;
}

.star {
  color: #00a4ff;
  font-size: 12px;
}

.score {
  margin-left: 5px;
  font-size: 13px;
  color: #475569;
}

.use-btn {
  border: none;
  border-radius: 9px;
  padding: 6px 14px;
  font-size: 12px;
  color: #fff;
  cursor: pointer;
  background: linear-gradient(90deg, #0897ff 0%, #0f7cff 100%);
  transition: all 0.3s ease;
  &:hover{
      transform: scale(1.05);
  }
}

.pager-bar {
  margin-top: 12px;
  border: 1px solid #d9edff;
  border-radius: 12px;
  background: #fff;
  min-height: 46px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 14px;
}

.pager-left {
  font-size: 12px;
  color: #64748b;
}

.pager-right {
  border: 1px solid #e6efff;
  border-radius: 12px;
  background: #f8fbff;
  color: #94a3b8;
  font-size: 12px;
  padding: 6px 14px;
}

.flex { display: flex; }
.items-end { align-items: flex-end; }
.flex-1 { flex: 1; }
.ml-2 { margin-left: 0.5rem; }
.mt-4 { margin-top: 1rem; }
</style>