import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { ReportConfig, ReportTemplate } from '@/types/aiPlatform'

function nowText() {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}

export const useReportStore = defineStore('reportConfig', () => {
  const templates = ref<ReportTemplate[]>([
    { id: 'tpl-1', name: '隐患排查分析报告', scene: '月度安全生产分析', enabled: true, updatedAt: nowText(), content: '# {{title}}\n\n> 模板：隐患排查分析报告\n\n## 一、摘要\n\n## 二、数据引用\n\n## 三、问题分析\n\n## 四、整改建议\n\n## 五、后续动作' },
    { id: 'tpl-2', name: 'AI 能力评审报告', scene: 'AI 平台需求评审', enabled: true, updatedAt: nowText(), content: '# {{title}}\n\n> 模板：AI 能力评审报告\n\n## 一、目标与范围\n\n## 二、能力清单\n\n## 三、数据与接口\n\n## 四、风险与边界\n\n## 五、验收口径' },
  ])

  const configs = ref<ReportConfig[]>([
    { id: 'cfg-1', section: '数据引用', prompt: '必要时调用 NL2SQL 获取统计结果；若失败，输出兜底提示。', enabled: true, version: 'v1', updatedAt: nowText() },
    { id: 'cfg-2', section: '整改建议', prompt: '输出可执行建议、责任角色、完成时限和复核要点。', enabled: true, version: 'v1', updatedAt: nowText() },
    { id: 'cfg-3', section: '验收口径', prompt: '按页面、功能、数据、AI 能力、边界和演示链路说明验收标准。', enabled: true, version: 'v1', updatedAt: nowText() },
  ])

  const enabledTemplates = computed(() => templates.value.filter(item => item.enabled))
  const enabledConfigs = computed(() => configs.value.filter(item => item.enabled))
  const defaultTemplate = computed(() => enabledTemplates.value[0] ?? templates.value[0] ?? null)

  function findTemplate(id?: string) {
    if (!id) return defaultTemplate.value
    return templates.value.find(item => item.id === id) ?? defaultTemplate.value
  }

  return { templates, configs, enabledTemplates, enabledConfigs, defaultTemplate, findTemplate }
}, {
  persist: { key: 'report-config-store' },
})
