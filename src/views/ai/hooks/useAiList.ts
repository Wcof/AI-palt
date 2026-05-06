import { ref } from 'vue';
import { knowledgeApi } from '@/mocks/ai/knowledge';
import { agentApi } from '@/mocks/ai/agent';
import { mcpApi } from '@/mocks/ai/mcp';

interface ListItem {
  id: string;
  createBy: string;
  createBy_dictText: string;
  createTime: string;
  descr: string;
  name: string;
  status: string;
  updateTime: string;
  labels?: string[];
  iconPath?: string;
  agentName?: string;
  description?: string;
}

interface PageInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPage: number;
}

interface Label {
  id: string;
  name: string;
}

export const useAiList = (menuType: string) => {
  const lists = ref<ListItem[]>([]);
  const pageInfo = ref<PageInfo>({
    page: 1,
    pageSize: 12,
    total: 0,
    totalPage: 0,
  });
  const checkType = ref<'more' | 'paged'>('more');
  const queryParams = ref<Record<string, any>>({});
  const loading = ref(false);
  const labelList = ref<Label[]>([]);

  const getList = async (type: 'more' | 'paged' = checkType.value) => {
    checkType.value = type;
    loading.value = true;

    try {
      let response;
      const params = {
        page: pageInfo.value.page,
        pageSize: pageInfo.value.pageSize,
        keyword: queryParams.value.keyword,
        labels: queryParams.value.labels,
      };

      switch (menuType) {
        case 'knowladge':
        case 'knowledge':
          response = await knowledgeApi.getList(params);
          break;
        case 'agent':
          response = await agentApi.getList(params);
          break;
        case 'mcp':
          response = await mcpApi.getList(params);
          break;
        default:
          response = await knowledgeApi.getList(params);
      }

      if (response.code === 200) {
        const { records, total, totalPage } = response.data;
        pageInfo.value.total = total;
        pageInfo.value.totalPage = totalPage;

        const formattedRecords = records.map((item: any) => ({
          id: item.id,
          createBy: item.createBy || 'system',
          createBy_dictText: item.createBy_dictText || '系统',
          createTime: item.createTime || new Date().toISOString().slice(0, 19).replace('T', ' '),
          descr: item.descr || item.description || '',
          name: item.name || item.agentName || '',
          status: item.status || '1',
          updateTime: item.updatedAt || new Date().toISOString().slice(0, 19).replace('T', ' '),
          labels: item.labels,
          iconPath: item.iconPath,
          agentName: item.agentName,
          description: item.description,
        }));

        if (type === 'more') {
          if (pageInfo.value.page === 1) {
            lists.value = formattedRecords;
          } else {
            lists.value = [...lists.value, ...formattedRecords];
          }
        } else {
          lists.value = formattedRecords;
        }
      }
    } catch (error) {
      console.error('获取列表失败:', error);
    } finally {
      loading.value = false;
    }
  };

  const getLabelList = async () => {
    // 模拟获取标签列表
    const labelsMap = {
      knowladge: [
        { id: 'security', name: '安全' },
        { id: 'enterprise', name: '企业' },
        { id: 'regulation', name: '规范' },
        { id: 'production', name: '生产' },
        { id: 'management', name: '管理' },
      ],
      knowledge: [
        { id: 'security', name: '安全' },
        { id: 'enterprise', name: '企业' },
        { id: 'regulation', name: '规范' },
        { id: 'production', name: '生产' },
        { id: 'management', name: '管理' },
      ],
      agent: [
        { id: 'security', name: '安全' },
        { id: 'assistant', name: '助手' },
        { id: 'consultation', name: '咨询' },
        { id: 'production', name: '生产' },
        { id: 'technical', name: '技术' },
      ],
      mcp: [
        { id: 'equipment', name: '设备' },
        { id: 'monitoring', name: '监控' },
        { id: 'production', name: '生产' },
        { id: 'data', name: '数据' },
        { id: 'security', name: '安全' },
      ],
    };

    labelList.value = labelsMap[menuType as keyof typeof labelsMap] || [];
  };

  const handleReset = (resetParams: Record<string, any> = {}) => {
    queryParams.value = { ...resetParams };
    pageInfo.value.page = 1;
    return getList(checkType.value);
  };

  const handleSearch = (searchParams: Record<string, any> = {}) => {
    queryParams.value = { ...queryParams.value, ...searchParams };
    pageInfo.value.page = 1;
    return getList(checkType.value);
  };

  return {
    lists,
    pageInfo,
    checkType,
    queryParams,
    loading,
    labelList,
    getList,
    getLabelList,
    handleReset,
    handleSearch,
  };
};