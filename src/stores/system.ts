import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

const DEFAULT_SYSTEM_NAME = '极客光年安全大模型'
const DEFAULT_TAB_TITLE = '极客光年安全大模型'
const DEFAULT_TAB_ICON = '/favicon.svg'

export type Prompt = {
  id: string
  title: string
  description: string
  text: string
  icon: string
  scene?: string
  status?: 'enabled' | 'disabled'
  sort?: number
  updatedAt?: string
}

const DEFAULT_PROMPTS: Prompt[] = [
  { id: 'risk', title: '安全风险评估', description: '快速梳理重点风险和控制措施', text: '如何进行安全生产风险评估？', icon: 'ShieldCheck', scene: '首页推荐', status: 'enabled', sort: 10, updatedAt: '2026-04-20 10:00' },
  { id: 'hazard', title: '隐患排查清单', description: '生成班组巡检与整改建议', text: '帮我列出常见安全隐患和整改建议。', icon: 'Radar', scene: '智能问数', status: 'enabled', sort: 20, updatedAt: '2026-04-20 10:10' },
  { id: 'plan', title: '应急预案', description: '输出结构化应急预案框架', text: '制定应急预案的关键步骤有哪些？', icon: 'ClipboardCheck', scene: '首页推荐', status: 'enabled', sort: 30, updatedAt: '2026-04-20 10:20' },
  { id: 'train', title: '安全培训', description: '设计培训大纲与考核要点', text: '给我一份安全培训的最佳实践清单。', icon: 'Brain', scene: '知识问答', status: 'disabled', sort: 40, updatedAt: '2026-04-20 10:30' },
]

export const useSystemStore = defineStore('system', () => {
  const systemName = ref(DEFAULT_SYSTEM_NAME)
  const tabTitle = ref(DEFAULT_TAB_TITLE)
  const tabIcon = ref(DEFAULT_TAB_ICON)
  const logoUrl = ref('')
  const prompts = ref<Prompt[]>(DEFAULT_PROMPTS)
  const settingsOpen = ref(false)

  function openSettings() {
    settingsOpen.value = true
  }

  function closeSettings() {
    settingsOpen.value = false
  }

  const displayName = computed(() => systemName.value.trim() || DEFAULT_SYSTEM_NAME)
  const displayTabTitle = computed(() => tabTitle.value.trim() || displayName.value)
  const displayTabIcon = computed(() => tabIcon.value.trim() || DEFAULT_TAB_ICON)

  return {
    systemName,
    tabTitle,
    tabIcon,
    logoUrl,
    prompts,
    settingsOpen,
    openSettings,
    closeSettings,
    displayName,
    displayTabTitle,
    displayTabIcon,
    defaultTabIcon: DEFAULT_TAB_ICON,
  }
}, {
  persist: { key: 'system-settings', paths: ['systemName', 'tabTitle', 'tabIcon', 'logoUrl', 'prompts'] },
})
