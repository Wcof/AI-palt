declare function defineOptions(arg:any):any;
declare function defineProps<T>():T;
declare function defineEmits<T>():any;

import { computed } from 'vue'
import { BarChart3, LineChart, PieChart, Table2 } from 'lucide-vue-next'

export type LocalNl2sqlChart = {
  id: string
  type: 'pie' | 'line' | 'bar'
  title: string
  description: string
  labels: string[]
  values: number[]
}

export type LocalNl2sqlTable = {
  columns: string[]
  rows: Array<Record<string, string | number>>
}

const props = defineProps<{ summary?: string; charts?: LocalNl2sqlChart[]; table?: LocalNl2sqlTable | null }>()
const charts = computed(() => props.charts || [])
const table = computed(() => props.table || null)

function pieSegments(values: number[]) {
  const total = values.reduce((s, v) => s + v, 0) || 1
  let current = 0
  return values.map((value) => {
    const startAngle = current / total * Math.PI * 2 - Math.PI / 2
    current += value
    const endAngle = current / total * Math.PI * 2 - Math.PI / 2
    const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0
    const x1 = 50 + 40 * Math.cos(startAngle)
    const y1 = 50 + 40 * Math.sin(startAngle)
    const x2 = 50 + 40 * Math.cos(endAngle)
    const y2 = 50 + 40 * Math.sin(endAngle)
    return `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`
  })
}

function linePoints(values: number[]) {
  const max = Math.max(...values, 1)
  return values.map((value, index) => `${16 + (index * 248) / Math.max(values.length - 1, 1)},${104 - value / max * 76}`).join(' ')
}

function maxValue(values: number[]) {
  return Math.max(...values, 1)
}
