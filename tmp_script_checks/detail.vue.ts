declare function defineOptions(arg:any):any;
declare function defineProps<T>():T;
declare function defineEmits<T>():any;

import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, FileText, Server, Wrench } from 'lucide-vue-next'
import { useSkillCenterStore } from '@/stores/skillCenter'

defineOptions({ name: 'McpSkillDetail' })
const route = useRoute()
const router = useRouter()
const store = useSkillCenterStore()
const detail = computed(() => store.mcpItems.find(item => item.id === String(route.params.id)) || store.mcpItems[0])
