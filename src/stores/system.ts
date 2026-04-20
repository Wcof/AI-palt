import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

const DEFAULT_SYSTEM_NAME = '极客光年安全智脑'
const DEFAULT_TAB_TITLE = '极客光年安全智脑'
const DEFAULT_TAB_ICON = '/favicon.svg'

export type Prompt = {
  id: string
  title: string
  description: string
  text: string
  icon: string
}

const DEFAULT_PROMPTS: Prompt[] = [
  { id: 'risk', title: '安全风险评估', description: '快速梳理重点风险和控制措施', text: '如何进行安全生产风险评估？', icon: 'ShieldCheck' },
  { id: 'hazard', title: '隐患排查清单', description: '生成班组巡检与整改建议', text: '帮我列出常见安全隐患和整改建议。', icon: 'Radar' },
  { id: 'plan', title: '应急预案', description: '输出结构化应急预案框架', text: '制定应急预案的关键步骤有哪些？', icon: 'ClipboardCheck' },
  { id: 'train', title: '安全培训', description: '设计培训大纲与考核要点', text: '给我一份安全培训的最佳实践清单。', icon: 'Brain' },
]

export const useSystemStore = defineStore('system', () => {
  const systemName = ref(DEFAULT_SYSTEM_NAME)
  const tabTitle = ref(DEFAULT_TAB_TITLE)
  const tabIcon = ref(DEFAULT_TAB_ICON)
  const logoUrl = ref('')
  const prompts = ref<Prompt[]>(DEFAULT_PROMPTS)

  const displayName = computed(() => systemName.value.trim() || DEFAULT_SYSTEM_NAME)
  const displayTabTitle = computed(() => tabTitle.value.trim() || displayName.value)
  const displayTabIcon = computed(() => tabIcon.value.trim() || DEFAULT_TAB_ICON)

  return {
    systemName,
    tabTitle,
    tabIcon,
    logoUrl,
    prompts,
    displayName,
    displayTabTitle,
    displayTabIcon,
    defaultTabIcon: DEFAULT_TAB_ICON,
  }
}, {
  persist: { key: 'system-settings' },
})
