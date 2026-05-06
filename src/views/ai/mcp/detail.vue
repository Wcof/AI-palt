<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Camera, ClipboardCheck, FileText, ImageUp, Server, Wrench } from 'lucide-vue-next'

defineOptions({ name: 'McpSkillDetail' })

type Detail = {
  id: string
  name: string
  type: 'mcp' | 'skill'
  category: string
  description: string
  status: string
  endpoint: string
  updatedAt: string
  docRaw: string
  tools: Array<{ name: string; desc: string; input: string; output: string }>
}

const route = useRoute()
const router = useRouter()
const previewImage = ref('')

const mock: Record<string, Detail> = {
  'mcp-ocr': {
    id: 'mcp-ocr',
    name: 'OCR 文字识别 MCP',
    type: 'mcp',
    category: '图像识别',
    status: '启用',
    endpoint: 'https://mock-api.geeklightyear.com/mcp/ocr',
    updatedAt: '2026-04-24 09:20',
    description: '支持图片文字识别、票据识别、表格识别和安全生产现场标识牌识别，主要提供前台在线试用体验。',
    docRaw: '# OCR 文字识别 MCP\n\n## 能力说明\n\n支持上传图片并返回识别文本、结构化字段、置信度和耗时信息。\n\n## 适用场景\n\n- 现场安全标识牌识别\n- 设备铭牌识别\n- 票据 / 表格文字提取\n\n## 调用示例\n\n```json\n{\"image\":\"base64://mock-ocr-image\",\"detectTable\":true}\n```',
    tools: [{ name: 'ocrRecognize', desc: '识别图片文字并返回结构化字段', input: 'image / detectTable', output: 'text / fields / confidence / cost' }],
  },
  'mcp-face': {
    id: 'mcp-face',
    name: '人脸识别 MCP',
    type: 'mcp',
    category: '视觉算法',
    status: '启用',
    endpoint: 'https://mock-api.geeklightyear.com/mcp/face',
    updatedAt: '2026-04-24 09:30',
    description: '支持人脸检测、人脸比对、人员身份识别和现场人员合规识别，返回人脸框、人员信息、属性和置信度。',
    docRaw: '# 人脸识别 MCP\n\n## 能力说明\n\n上传人脸图片后，Mock 返回人脸框、人员匹配、年龄段、性别、口罩、安全帽和置信度。\n\n## 调用示例\n\n```json\n{\"image\":\"base64://mock-face-image\",\"threshold\":0.82}\n```',
    tools: [
      { name: 'faceDetect', desc: '检测图片中的人脸基础信息', input: 'image / threshold', output: 'faceBox / attributes / confidence' },
      { name: 'faceCompare', desc: '和人员库进行比对并返回匹配人员', input: 'image / personGroup', output: 'matched / personName / score' },
    ],
  },
  'mcp-hazard': {
    id: 'mcp-hazard',
    name: '隐患识图 MCP',
    type: 'mcp',
    category: '安全算法',
    status: '启用',
    endpoint: 'mcp://hazard-vision',
    updatedAt: '2026-04-20 10:30',
    description: '基于图片与知识库检索执行隐患识别，可用于安全帽、吸烟、通道占用和临时用电等场景。',
    docRaw: '# 隐患识图 MCP\n\n- detectHazard(imageUrl)\n- matchKnowledge(hazardType)\n\n> 当前为 Mock 试用体验，真实生产需接入算法服务。',
    tools: [
      { name: 'detectHazard', desc: '识别图片中的隐患类型', input: 'imageUrl / scene', output: 'hazardType / score / level' },
      { name: 'matchKnowledge', desc: '匹配知识库中的整改依据', input: 'hazardType / scene', output: 'standard / suggestion' },
    ],
  },
  'skill-report-writer': {
    id: 'skill-report-writer',
    name: '报告生成 Skill',
    type: 'skill',
    category: '文档生成',
    status: '启用',
    endpoint: 'skill://report-writer',
    updatedAt: '2026-04-20 11:00',
    description: '通过 Skill.md 装载报告生成能力说明，支持模板、数据引用与兜底提示。',
    docRaw: '# 报告生成 Skill\n\n## 参数\n\n- templateId：报告模板 ID\n- userInput：用户输入描述\n- nl2sqlResult：可选数据结果\n\n## 输出\n\nMarkdown 报告正文。',
    tools: [{ name: 'generateReport', desc: '根据模板、用户输入和可选数据结果生成报告', input: 'templateId / userInput / nl2sqlResult', output: 'markdown / status / errorFallback' }],
  },
}

const detail = computed(() => mock[String(route.params.id)] || mock['mcp-ocr'])

function escapeHtml(text: string) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function renderMarkdown(text: string) {
  return escapeHtml(text)
    .replace(/^# (.*)$/gm, '<h1 class="mb-3 text-2xl font-bold text-slate-950">$1</h1>')
    .replace(/^## (.*)$/gm, '<h2 class="mb-2 mt-5 text-base font-semibold text-slate-900">$1</h2>')
    .replace(/^> (.*)$/gm, '<blockquote class="my-3 rounded-xl border-l-4 border-sky-300 bg-sky-50 px-3 py-2 text-sm text-slate-600">$1</blockquote>')
    .replace(/```([\s\S]*?)```/g, '<pre class="my-3 overflow-auto rounded-xl bg-blue-50 p-3 text-xs leading-5 text-blue-950">$1</pre>')
    .replace(/^- (.*)$/gm, '<li class="ml-5 list-disc text-sm leading-7 text-slate-700">$1</li>')
    .replace(/\n/g, '<br />')
}

function onPreviewUpload(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => { previewImage.value = String(reader.result || '') }
  reader.readAsDataURL(file)
  ;(e.target as HTMLInputElement).value = ''
}

const trialResult = computed(() => {
  if (detail.value.id === 'mcp-face') {
    return {
      code: 0,
      data: {
        faceBox: { x: 128, y: 64, width: 186, height: 210 },
        person: { matched: true, name: '张三', department: '生产一部' },
        attributes: { ageRange: '35-45', gender: 'male', mask: false, helmet: true },
        confidence: 0.93,
      },
      cost: '186ms',
    }
  }
  if (detail.value.id === 'mcp-ocr') {
    return {
      code: 0,
      data: {
        text: '安全出口\\n严禁烟火\\n设备编号：R-102',
        fields: [
          { key: '标识类型', value: '安全标识牌', confidence: 0.97 },
          { key: '设备编号', value: 'R-102', confidence: 0.95 },
        ],
        confidence: 0.96,
      },
      cost: '142ms',
    }
  }
  return {
    code: 0,
    data: {
      hazards: [
        { type: '未佩戴安全帽', level: '高', confidence: 0.91 },
        { type: '通道临时占用', level: '中', confidence: 0.86 },
      ],
      suggestion: '立即提醒人员补齐 PPE，并清理消防通道占用物。',
    },
    cost: '238ms',
  }
})
</script>

<template>
  <div class="space-y-5">
    <div class="rounded-2xl border border-sky-200/70 bg-white/70 p-6 shadow-[inset_0_0_0_1px_rgba(0,180,255,0.08)]">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <button type="button" @click="router.push('/mcp')" class="mb-4 inline-flex items-center gap-2 rounded-xl bg-white/80 px-3 py-2 text-xs font-semibold text-slate-800 ring-1 ring-sky-200/70 transition hover:bg-white"><ArrowLeft class="h-4 w-4" /> 返回 AI 技能</button>
          <div class="flex flex-wrap items-center gap-2">
            <h1 class="m-0 text-xl font-semibold text-slate-950">{{ detail.name }}</h1>
            <span class="rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1" :class="detail.type === 'mcp' ? 'bg-violet-50 text-violet-700 ring-violet-200' : 'bg-sky-50 text-sky-700 ring-sky-200'">{{ detail.type === 'mcp' ? 'MCP' : 'Skill' }}</span>
            <span class="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200">{{ detail.status }}</span>
          </div>
          <p class="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{{ detail.description }}</p>
          <div class="mt-2 text-xs text-slate-500">{{ detail.category }} · {{ detail.endpoint }} · 更新时间：{{ detail.updatedAt }}</div>
        </div>
      </div>
    </div>

    <div class="grid gap-5 xl:grid-cols-[1fr_380px]">
      <div class="space-y-5">
        <div class="rounded-2xl border border-sky-200/70 bg-white/80 p-6">
          <div class="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900"><FileText class="h-4 w-4" /> Skill.md / Markdown 文档</div>
          <article class="prose max-w-none rounded-2xl bg-white/80 p-5 text-slate-700 ring-1 ring-sky-200/70" v-html="renderMarkdown(detail.docRaw)" />
        </div>

        <div v-if="detail.type === 'mcp'" class="rounded-2xl border border-sky-200/70 bg-white/80 p-6">
          <div class="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900"><Camera class="h-4 w-4" /> 在线试用 Mock</div>
          <div class="grid gap-4 lg:grid-cols-2">
            <div class="rounded-2xl bg-sky-50/70 p-4 ring-1 ring-sky-100">
              <input id="mcp-preview-upload" type="file" accept="image/*" class="hidden" @change="onPreviewUpload" />
              <label for="mcp-preview-upload" class="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-blue-700 ring-1 ring-blue-100"><ImageUp class="h-4 w-4" /> 上传图片试用</label>
              <div class="mt-3 overflow-hidden rounded-xl bg-white p-3 text-center text-xs text-slate-500 ring-1 ring-sky-100">
                <img v-if="previewImage" :src="previewImage" class="mx-auto max-h-48 object-contain" />
                <span v-else>{{ detail.id === 'mcp-face' ? '上传人脸图片后展示检测 Mock' : detail.id === 'mcp-ocr' ? '上传文字图片后展示 OCR Mock' : '上传现场图片后展示隐患识别 Mock' }}</span>
              </div>
            </div>
            <pre class="max-h-72 overflow-auto rounded-2xl bg-blue-950 p-4 text-xs leading-5 text-blue-50">{{ JSON.stringify(trialResult, null, 2) }}</pre>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <div class="rounded-2xl border border-sky-200/70 bg-white/80 p-5">
          <div class="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900"><Server class="h-4 w-4" /> 基础信息</div>
          <div class="space-y-3 text-xs text-slate-600">
            <div class="rounded-xl bg-white px-3 py-2 ring-1 ring-sky-200/70"><span class="font-semibold text-slate-900">ID：</span>{{ detail.id }}</div>
            <div class="rounded-xl bg-white px-3 py-2 ring-1 ring-sky-200/70"><span class="font-semibold text-slate-900">类型：</span>{{ detail.type === 'mcp' ? 'MCP 服务能力' : 'Skill 文档装载' }}</div>
            <div class="rounded-xl bg-white px-3 py-2 ring-1 ring-sky-200/70"><span class="font-semibold text-slate-900">端点：</span>{{ detail.endpoint }}</div>
          </div>
        </div>
        <div class="rounded-2xl border border-sky-200/70 bg-white/80 p-5">
          <div class="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900"><Wrench class="h-4 w-4" /> 可用工具</div>
          <div class="space-y-3">
            <div v-for="tool in detail.tools" :key="tool.name" class="rounded-xl bg-white px-3 py-3 ring-1 ring-sky-200/70">
              <div class="text-sm font-semibold text-slate-900">{{ tool.name }}</div>
              <div class="mt-1 text-xs leading-5 text-slate-600">{{ tool.desc }}</div>
              <div class="mt-2 grid gap-2 text-[11px] text-slate-600">
                <div><span class="font-semibold text-slate-800">输入：</span>{{ tool.input }}</div>
                <div><span class="font-semibold text-slate-800">输出：</span>{{ tool.output }}</div>
              </div>
            </div>
          </div>
        </div>
        <div class="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 text-sm leading-6 text-emerald-900">
          <div class="mb-2 flex items-center gap-2 font-semibold"><ClipboardCheck class="h-4 w-4" /> 本期说明</div>
          当前为前端 Mock 体验，重点验证 MCP / Skill 的统一 CRUD、详情展示和试用交互。
        </div>
      </div>
    </div>
  </div>
</template>
