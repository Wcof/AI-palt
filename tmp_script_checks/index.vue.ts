declare function defineOptions(arg:any):any;
declare function defineProps<T>():T;
declare function defineEmits<T>():any;

import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Eye, FileText, Filter, Search, Wrench } from 'lucide-vue-next'
import { useSkillCenterStore } from '@/stores/skillCenter'

defineOptions({ name: 'McpSkillPublicList' })

const router = useRouter()
const store = useSkillCenterStore()
const keyword = ref('')
const typeFilter = ref<'all' | 'mcp' | 'skill'>('all')

const filtered = computed(() => {
  const k = keyword.value.trim().toLowerCase()
  return store.publicItems.filter(item => {
    if (typeFilter.value !== 'all' && item.type !== typeFilter.value) return false
    if (!k) return true
    return `${item.name} ${item.code} ${item.description} ${item.scene} ${item.labels.join(' ')}`.toLowerCase().includes(k)
  })
})

function goDetail(item: any) {
  router.push(item.type === 'mcp' ? `/mcp/${item.id}` : `/skill/${item.id}`)
}
