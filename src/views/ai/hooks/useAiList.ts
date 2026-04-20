import { ref } from 'vue';
import { ABILITIES } from '@/data/abilities';

interface ListItem {
  id: string;
  createBy: string;
  createBy_dictText: string;
  createTime: string;
  descr: string;
  name: string;
  status: string;
  updateTime: string;
}

interface PageInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPage: number;
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

  const getList = async (type: 'more' | 'paged' = checkType.value) => {
    checkType.value = type;

    const filtered = ABILITIES.filter(a => {
      if (menuType === 'knowladge') return a.domain === 'NLP';
      if (menuType === 'agent') return a.domain === 'LLM';
      if (menuType === 'mcp') return a.domain === 'MCP';
      return true;
    });

    const keyword = queryParams.value.keyword?.toLowerCase() || '';
    const filteredByKeyword = keyword
      ? filtered.filter(a => a.name.toLowerCase().includes(keyword) || a.summary.toLowerCase().includes(keyword))
      : filtered;

    const start = (pageInfo.value.page - 1) * pageInfo.value.pageSize;
    const end = start + pageInfo.value.pageSize;
    const records = filteredByKeyword.slice(start, end);

    pageInfo.value.total = filteredByKeyword.length;
    pageInfo.value.totalPage = Math.ceil(filteredByKeyword.length / pageInfo.value.pageSize);

    if (type === 'more') {
      if (pageInfo.value.page === 1) {
        lists.value = records.map(a => ({
          id: a.id,
          createBy: 'system',
          createBy_dictText: '系统',
          createTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
          descr: a.summary,
          name: a.name,
          status: '1',
          updateTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
        }));
      } else {
        const newRecords = records.map(a => ({
          id: a.id,
          createBy: 'system',
          createBy_dictText: '系统',
          createTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
          descr: a.summary,
          name: a.name,
          status: '1',
          updateTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
        }));
        lists.value = [...lists.value, ...newRecords];
      }
    } else {
      lists.value = records.map(a => ({
        id: a.id,
        createBy: 'system',
        createBy_dictText: '系统',
        createTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
        descr: a.summary,
        name: a.name,
        status: '1',
        updateTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
      }));
    }
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
    getList,
    handleReset,
    handleSearch,
  };
};