<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  schema: any
}>()

interface RowItem {
  key: string
  name: string
  type: string
  format?: string
  description: string
  required: boolean
  level: number
}

function getSchemaType(schema: any): string {
  if (!schema || typeof schema !== 'object') return 'unknown'
  if (typeof schema.type === 'string' && schema.type) return schema.type
  if (Array.isArray(schema.types) && schema.types.length) return String(schema.types[0])
  return 'unknown'
}

function getArrayItemType(schema: any): string {
  if (!schema?.items) return 'unknown'
  return getSchemaType(schema.items)
}

function walkObjectProperties(
  schema: any,
  rows: RowItem[],
  level: number,
  requiredFields: string[] = [],
  parentKey = 'root'
) {
  const properties = schema?.properties
  if (!properties || typeof properties !== 'object') return

  Object.entries(properties).forEach(([name, child]: [string, any]) => {
    const childType = getSchemaType(child)
    const row: RowItem = {
      key: `${parentKey}.${name}.${level}`,
      name,
      type: childType === 'array' ? `array<${getArrayItemType(child)}>` : childType,
      format: child?.format,
      description: child?.description || '',
      required: requiredFields.includes(name),
      level,
    }
    rows.push(row)

    if (childType === 'object') {
      walkObjectProperties(child, rows, level + 1, child?.required || [], `${parentKey}.${name}`)
      return
    }
    if (childType === 'array' && child?.items) {
      const itemSchema = child.items
      const itemType = getSchemaType(itemSchema)
      const itemRow: RowItem = {
        key: `${parentKey}.${name}.items.${level + 1}`,
        name: 'items',
        type: itemType === 'array' ? `array<${getArrayItemType(itemSchema)}>` : itemType,
        format: itemSchema?.format,
        description: itemSchema?.description || '',
        required: false,
        level: level + 1,
      }
      rows.push(itemRow)
      if (itemType === 'object') {
        walkObjectProperties(itemSchema, rows, level + 2, itemSchema?.required || [], `${parentKey}.${name}.items`)
      } else if (itemType === 'array') {
        const deepRows: RowItem[] = []
        walkObjectProperties(
          { properties: { items: itemSchema }, required: [] },
          deepRows,
          level + 2,
          [],
          `${parentKey}.${name}.items`
        )
        rows.push(...deepRows)
      }
    }
  })
}

const schemaProperties = computed<RowItem[]>(() => {
  const schema = props.schema
  if (!schema || typeof schema !== 'object') return []
  const rows: RowItem[] = []
  const rootType = getSchemaType(schema)

  if (rootType === 'object') {
    walkObjectProperties(schema, rows, 0, schema?.required || [])
    return rows
  }

  if (rootType === 'array') {
    const itemSchema = schema.items || {}
    const itemType = getSchemaType(itemSchema)
    rows.push({
      key: 'root.items',
      name: 'items',
      type: itemType === 'array' ? `array<${getArrayItemType(itemSchema)}>` : itemType,
      format: itemSchema?.format,
      description: itemSchema?.description || '',
      required: false,
      level: 0,
    })
    if (itemType === 'object') {
      walkObjectProperties(itemSchema, rows, 1, itemSchema?.required || [], 'root.items')
    }
    return rows
  }

  return rows
})

function getTypeStyle(type: string) {
  const base = type.replace(/^array<.*>$/, 'array')
  const typeColors: Record<string, string> = {
    string: 'bg-green-100 text-green-800',
    number: 'bg-blue-100 text-blue-800',
    integer: 'bg-blue-100 text-blue-800',
    boolean: 'bg-purple-100 text-purple-800',
    object: 'bg-orange-100 text-orange-800',
    array: 'bg-yellow-100 text-yellow-800',
    unknown: 'bg-gray-100 text-gray-800',
  }
  return typeColors[base] || typeColors.unknown
}

function formatType(type: string, format?: string) {
  if (format) return `${type} (${format})`
  return type
}
</script>

<template>
  <div v-if="schemaProperties.length > 0" class="overflow-hidden rounded-lg border border-sky-200/70">
    <table class="min-w-full divide-y divide-sky-200/70">
      <thead class="bg-sky-50/50">
        <tr>
          <th class="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">参数名</th>
          <th class="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">类型</th>
          <th class="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">必填</th>
          <th class="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">描述</th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-sky-200/70">
        <tr v-for="prop in schemaProperties" :key="prop.key" class="hover:bg-sky-50/30">
          <td class="px-4 py-3 text-sm font-medium text-slate-900">
            <span :style="{ marginLeft: `${prop.level * 16}px` }">
              <span v-if="prop.level > 0" class="text-slate-400">└─ </span>{{ prop.name }}
            </span>
          </td>
          <td class="px-4 py-3 text-sm">
            <span :class="['inline-flex px-2 py-1 text-xs font-medium rounded-full', getTypeStyle(prop.type)]">
              {{ formatType(prop.type, prop.format) }}
            </span>
          </td>
          <td class="px-4 py-3 text-sm">
            <span v-if="prop.required" class="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
              必填
            </span>
            <span v-else class="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
              可选
            </span>
          </td>
          <td class="px-4 py-3 text-sm text-slate-600">
            {{ prop.description || '暂无描述' }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  
  <div v-else class="rounded-lg bg-blue-50 p-4">
    <pre class="text-xs text-slate-50 overflow-auto">{{ JSON.stringify(schema, null, 2) }}</pre>
  </div>
</template>
