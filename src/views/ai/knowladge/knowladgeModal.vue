<template>
  <a-drawer :open="open" placement="right" :width="1080" :destroyOnClose="true" @update:open="(val) => emit('update:open', val)">
    <template #title>
      <div class="drawer-title">知识库检索</div>
    </template>

    <div class="knowledge-layout">
      <aside class="doc-panel">
        <div class="panel-head">
          <div>
            <div class="panel-title">文档列表</div>
            <div class="panel-sub">选择本次检索的文档范围</div>
          </div>
          <button v-if="docList.length" type="button" class="select-all" @click="toggleSelectAll">
            {{ isAllSelected ? '取消全选' : '全选' }}
          </button>
        </div>

        <a-spin :spinning="docLoading">
          <div v-if="docList.length" class="doc-list">
            <button v-for="doc in docList" :key="doc.id" type="button" class="doc-item" :class="{ active: selectedDocIds.includes(doc.id) }" @click="toggleDoc(doc.id)">
              <span class="doc-check">{{ selectedDocIds.includes(doc.id) ? '✓' : '' }}</span>
              <span class="doc-info">
                <span class="doc-name">{{ doc.title || doc.docName || '未命名文档' }}</span>
                <span class="doc-meta">{{ doc.embedId || doc.id }}</span>
              </span>
            </button>
          </div>
          <a-empty v-else description="暂无文档" />
        </a-spin>
      </aside>

      <section class="chat-panel">
        <div class="chat-header">
          <div>
            <div class="chat-title">检索对话</div>
            <div class="chat-sub">输入问题后返回知识片段，展示风格与首页对话保持一致。</div>
          </div>
          <div class="doc-count">已选 {{ selectedDocIds.length }} 个文档</div>
        </div>

        <div ref="resultBoxRef" class="message-area">
          <div v-if="!resultList.length" class="empty-chat">
            <div class="empty-main">开始一次知识库问答</div>
            <div class="empty-sub">文档列表会保留在左侧，高级检索参数默认折叠，避免干扰主对话。</div>
          </div>

          <template v-else>
            <div class="message-row user-row">
              <div class="message-bubble user-bubble">{{ lastSearchPayload?.query_text }}</div>
            </div>
            <div class="message-row assistant-row">
              <div class="message-bubble assistant-bubble">
                <div class="answer-title">已检索到 {{ resultList.length }} 条相关片段</div>
                <div class="result-list">
                  <div v-for="(item, index) in resultList" :key="item.id || index" class="result-card">
                    <div class="result-card-head">
                      <div class="result-main-title">
                        <span class="result-index">{{ index + 1 }}</span>
                        <span class="title">{{ item.title || item.filename || `检索结果 ${index + 1}` }}</span>
                      </div>
                      <span class="score-badge">相关度 {{ item.score.toFixed(2) }}</span>
                    </div>
                    <div class="content-box">{{ item.content || '' }}</div>
                    <div class="result-meta">Chunk：{{ item.chunkId || item.chunk || '--' }}</div>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>

        <div class="composer-card">
          <textarea v-model="form.query_text" class="query-input" rows="3" placeholder="输入检索问题，例如：有限空间作业需要哪些审批和防护要求？" @keydown.enter.exact.prevent="handleSearch" />

          <details class="advanced-options">
            <summary>
              <span>高级选项</span>
              <span class="advanced-summary">{{ modeLabel }} · TopK {{ form.rerank_topk }} · 阈值 {{ form.score_threshold }}</span>
            </summary>
            <div class="advanced-grid">
              <label class="field">
                <span>检索模式</span>
                <a-select v-model:value="form.mode" :options="modeOptions" />
              </label>
              <label class="field">
                <span>重排序 TopK</span>
                <a-input-number v-model:value="form.rerank_topk" :min="1" :max="20" style="width: 100%" />
              </label>
              <label class="field">
                <span>相似度阈值</span>
                <a-input-number v-model:value="form.score_threshold" :min="0" :max="1" :step="0.1" style="width: 100%" />
              </label>
            </div>
          </details>

          <div class="composer-actions">
            <span class="hint">Enter 发送，Shift + Enter 换行</span>
            <button type="button" class="search-btn" @click="handleSearch">开始检索</button>
          </div>
        </div>
      </section>
    </div>
  </a-drawer>
</template>

<script setup lang="ts">
  import { computed, nextTick, reactive, ref, watch } from 'vue';
  import { message } from 'ant-design-vue';

  const props = withDefaults(
    defineProps<{
      open: boolean;
      itemInfo?: any;
    }>(),
    {
      itemInfo: () => ({}),
    }
  );

  const emit = defineEmits<{
    (e: 'update:open', value: boolean): void;
  }>();

  const currentId = ref('');
  const resultList = ref<Array<Record<string, any>>>([]);
  const resultBoxRef = ref<HTMLElement | null>(null);
  const docList = ref<Array<Record<string, any>>>([]);
  const docLoading = ref(false);
  const selectedDocIds = ref<string[]>([]);
  const lastSearchPayload = ref<Record<string, any> | null>(null);

  const modeOptions = [
    { label: '普通检索', value: 'flat' },
    { label: '图谱检索', value: 'graph' },
    { label: '混合检索', value: 'flat_graph' },
  ];

  const form = reactive({
    query_text: '',
    mode: 'flat',
    score_threshold: 0.2,
    rerank_topk: 10,
    doc_id_set: [] as string[],
  });

  const modeLabel = computed(() => modeOptions.find(item => item.value === form.mode)?.label || '普通检索');

  const resetPageState = () => {
    resultList.value = [];
    docList.value = [];
    selectedDocIds.value = [];
    lastSearchPayload.value = null;
    form.query_text = '';
    form.mode = 'flat';
    form.score_threshold = 0.2;
    form.rerank_topk = 10;
    form.doc_id_set = [];
    nextTick(() => {
      if (resultBoxRef.value) resultBoxRef.value.scrollTop = 0;
    });
  };

  const setKnowledgeId = (id: string) => {
    resetPageState();
    currentId.value = id;
    loadDocList();
  };

  const loadDocList = async () => {
    docLoading.value = true;
    try {
      setTimeout(() => {
        docList.value = [
          { id: '1', title: '产品文档', embedId: 'doc1' },
          { id: '2', title: '技术文档', embedId: 'doc2' },
          { id: '3', title: '用户指南', embedId: 'doc3' },
        ];
        selectedDocIds.value = docList.value.map((item) => item.id).filter(Boolean);
        docLoading.value = false;
      }, 500);
    } finally {
      setTimeout(() => { docLoading.value = false; }, 520);
    }
  };

  watch(
    () => props.itemInfo?.id,
    (id) => {
      if (!id) return;
      setKnowledgeId(id);
    },
    { immediate: true }
  );

  const isAllSelected = computed(() => {
    if (!docList.value.length) return false;
    return selectedDocIds.value.length === docList.value.length;
  });

  const toggleDoc = (id: string) => {
    if (selectedDocIds.value.includes(id)) {
      selectedDocIds.value = selectedDocIds.value.filter((item) => item !== id);
      return;
    }
    selectedDocIds.value = [...selectedDocIds.value, id];
  };

  const toggleSelectAll = () => {
    if (isAllSelected.value) {
      selectedDocIds.value = [];
      return;
    }
    selectedDocIds.value = docList.value.map((item) => item.id).filter(Boolean);
  };

  const handleSearch = () => {
    const queryText = form.query_text.trim();
    if (!queryText) {
      message.warning('检索语句不能为空');
      return;
    }
    if (!selectedDocIds.value.length) {
      message.warning('请至少选择一个文档');
      return;
    }
    const selectDoc = docList.value.filter((i) => selectedDocIds.value.includes(i.id));
    const docIdSet = selectDoc.map((item) => item.embedId || '').filter(Boolean);
    const payload = {
      rerank_topk: form.rerank_topk,
      score_threshold: form.score_threshold,
      mode: form.mode,
      doc_id_set: docIdSet,
      query_text: queryText,
    };
    form.doc_id_set = docIdSet;
    lastSearchPayload.value = payload;

    setTimeout(() => {
      resultList.value = [
        { id: '1', title: '产品文档', content: '这是产品文档的内容片段，包含了产品的基本信息和功能介绍。', score: 0.95, chunkId: 'chunk1' },
        { id: '2', title: '技术文档', content: '这是技术文档的内容片段，包含了技术实现的详细说明。', score: 0.85, chunkId: 'chunk2' },
        { id: '3', title: '用户指南', content: '这是用户指南的内容片段，包含了用户操作的步骤说明。', score: 0.75, chunkId: 'chunk3' },
      ];
      nextTick(() => {
        if (resultBoxRef.value) resultBoxRef.value.scrollTop = 0;
      });
    }, 500);
  };
</script>

<style scoped>
  .drawer-title { font-size: 18px; font-weight: 700; color: #0f172a; }
  .knowledge-layout { display: flex; gap: 16px; height: calc(100vh - 150px); min-height: 620px; background: linear-gradient(135deg, #eef7ff 0%, #ffffff 52%, #f5fbff 100%); border-radius: 22px; padding: 14px; }
  .doc-panel { width: 270px; min-width: 270px; border: 1px solid rgba(147,197,253,.45); border-radius: 22px; background: rgba(255,255,255,.78); padding: 14px; display: flex; flex-direction: column; box-shadow: 0 20px 50px rgba(37,99,235,.08); }
  .panel-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; margin-bottom: 12px; }
  .panel-title { font-size: 15px; font-weight: 800; color: #0f172a; }
  .panel-sub { margin-top: 2px; font-size: 12px; color: #64748b; }
  .select-all { border: 1px solid #bfdbfe; background: #eff6ff; color: #2563eb; border-radius: 999px; padding: 5px 10px; font-size: 12px; font-weight: 700; }
  .doc-list { flex: 1; min-height: 0; overflow-y: auto; display: grid; gap: 9px; }
  .doc-item { width: 100%; border: 1px solid #dbeafe; border-radius: 16px; background: rgba(255,255,255,.86); padding: 11px; display: flex; align-items: center; gap: 10px; cursor: pointer; text-align: left; transition: all .18s ease; }
  .doc-item:hover { border-color: #60a5fa; transform: translateY(-1px); }
  .doc-item.active { border-color: #2563eb; background: linear-gradient(135deg, #eff6ff, #ffffff); box-shadow: 0 12px 28px rgba(37,99,235,.12); }
  .doc-check { display: inline-flex; align-items: center; justify-content: center; width: 22px; height: 22px; border-radius: 8px; border: 1px solid #bfdbfe; color: #2563eb; font-size: 13px; font-weight: 800; background: white; }
  .doc-info { min-width: 0; display: grid; gap: 2px; }
  .doc-name { font-size: 13px; font-weight: 700; color: #1e293b; }
  .doc-meta { font-size: 11px; color: #94a3b8; }
  .chat-panel { min-width: 0; flex: 1; display: flex; flex-direction: column; overflow: hidden; border: 1px solid rgba(255,255,255,.72); border-radius: 24px; background: rgba(255,255,255,.68); box-shadow: 0 24px 70px rgba(37,99,235,.10); }
  .chat-header { display: flex; justify-content: space-between; gap: 16px; align-items: flex-start; padding: 16px 18px; border-bottom: 1px solid #dbeafe; background: linear-gradient(90deg, rgba(255,255,255,.88), rgba(239,246,255,.7)); }
  .chat-title { font-size: 18px; font-weight: 800; color: #0f172a; }
  .chat-sub { margin-top: 4px; font-size: 12px; color: #64748b; }
  .doc-count { border: 1px solid #bfdbfe; background: #eff6ff; color: #2563eb; border-radius: 999px; padding: 6px 10px; font-size: 12px; font-weight: 700; }
  .message-area { min-height: 0; flex: 1; overflow: auto; padding: 18px; }
  .empty-chat { height: 100%; min-height: 280px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #64748b; text-align: center; }
  .empty-main { color: #0f172a; font-size: 22px; font-weight: 800; }
  .empty-sub { margin-top: 8px; font-size: 13px; }
  .message-row { display: flex; margin-bottom: 14px; }
  .user-row { justify-content: flex-end; }
  .assistant-row { justify-content: flex-start; }
  .message-bubble { max-width: min(760px, 86%); border-radius: 24px; padding: 14px 16px; font-size: 14px; line-height: 1.7; box-shadow: 0 14px 38px rgba(37,99,235,.08); }
  .user-bubble { background: linear-gradient(135deg, #2563eb, #06b6d4); color: white; }
  .assistant-bubble { background: linear-gradient(135deg, #ffffff, #eff6ff); color: #334155; border: 1px solid #bfdbfe; }
  .answer-title { font-size: 15px; font-weight: 800; color: #0f172a; margin-bottom: 12px; }
  .result-list { display: grid; gap: 10px; }
  .result-card { border: 1px solid #dbeafe; border-radius: 18px; background: rgba(255,255,255,.88); padding: 13px; }
  .result-card-head { display: flex; justify-content: space-between; gap: 12px; align-items: center; }
  .result-main-title { min-width: 0; display: flex; align-items: center; gap: 8px; color: #0f172a; font-weight: 800; }
  .result-main-title .title { min-width: 0; font-size: 14px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .result-index { display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 999px; background: #dbeafe; color: #2563eb; font-size: 12px; font-weight: 800; }
  .score-badge { flex-shrink: 0; border: 1px solid #bfdbfe; background: #eff6ff; color: #2563eb; border-radius: 999px; padding: 4px 9px; font-size: 12px; font-weight: 700; }
  .content-box { margin-top: 10px; border-radius: 14px; background: #f8fbff; border: 1px solid #e0efff; padding: 11px 12px; color: #475569; }
  .result-meta { margin-top: 8px; color: #94a3b8; font-size: 12px; }
  .composer-card { border-top: 1px solid #dbeafe; background: linear-gradient(90deg, rgba(239,246,255,.82), rgba(255,255,255,.9)); padding: 14px; }
  .query-input { width: 100%; min-height: 86px; resize: none; border: 1px solid #bfdbfe; border-radius: 20px; background: rgba(255,255,255,.86); padding: 13px 15px; color: #0f172a; outline: none; box-shadow: inset 0 1px 0 rgba(255,255,255,.75); }
  .query-input:focus { border-color: #60a5fa; box-shadow: 0 0 0 3px rgba(37,99,235,.10); }
  .advanced-options { margin-top: 10px; border-radius: 16px; border: 1px solid #dbeafe; background: rgba(255,255,255,.68); overflow: hidden; }
  .advanced-options summary { cursor: pointer; display: flex; justify-content: space-between; gap: 12px; padding: 9px 12px; color: #2563eb; font-size: 12px; font-weight: 800; }
  .advanced-summary { color: #64748b; font-weight: 600; }
  .advanced-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; padding: 0 12px 12px; }
  .field { display: grid; gap: 6px; font-size: 12px; color: #475569; font-weight: 700; }
  .composer-actions { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 10px; }
  .hint { color: #64748b; font-size: 12px; }
  .search-btn { border: none; border-radius: 999px; background: linear-gradient(135deg, #2563eb, #06b6d4); color: white; padding: 9px 18px; font-size: 13px; font-weight: 800; box-shadow: 0 14px 30px rgba(37,99,235,.22); }
</style>
