<script setup lang="ts">
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { Image, Settings2, UploadCloud, MessageSquare, Plus, Trash2, Edit2, ShieldCheck, Radar, ClipboardCheck, Brain, Lightbulb, AlertTriangle } from 'lucide-vue-next'
import { useSystemStore } from '@/stores/system'

defineOptions({ name: 'SystemSettings' })

const systemStore = useSystemStore()
const { systemName, tabTitle, tabIcon, logoUrl, prompts } = storeToRefs(systemStore)

const activeTab = ref<'brand' | 'prompts'>('brand')
const logoInputRef = ref<HTMLInputElement | null>(null)
const iconInputRef = ref<HTMLInputElement | null>(null)
const editingPrompt = ref<{ id: string | null; title: string; description: string; text: string; icon: string } | null>(null)
const showPromptModal = ref(false)

const MAX_PROMPTS = 4
const isMaxPromptsReached = computed(() => prompts.value.length >= MAX_PROMPTS)

const iconOptions = [
  { id: 'ShieldCheck', name: '盾牌', component: ShieldCheck },
  { id: 'Radar', name: '雷达', component: Radar },
  { id: 'ClipboardCheck', name: '清单', component: ClipboardCheck },
  { id: 'Brain', name: '大脑', component: Brain },
  { id: 'Lightbulb', name: '灯泡', component: Lightbulb },
  { id: 'AlertTriangle', name: '警告', component: AlertTriangle },
]

function readAsDataUrl(file: File, onDone: (url: string) => void) {
  const reader = new FileReader()
  reader.onload = () => onDone(String(reader.result || ''))
  reader.readAsDataURL(file)
}

function onLogoChange(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0]
  if (f) readAsDataUrl(f, (url) => { logoUrl.value = url })
}

function onIconChange(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0]
  if (f) readAsDataUrl(f, (url) => { tabIcon.value = url })
}

function openPromptModal(prompt?: { id: string; title: string; description: string; text: string; icon: string }) {
  if (prompt) {
    editingPrompt.value = { id: prompt.id, title: prompt.title, description: prompt.description, text: prompt.text, icon: prompt.icon }
  } else {
    editingPrompt.value = { id: null, title: '', description: '', text: '', icon: 'MessageSquare' }
  }
  showPromptModal.value = true
}

function closePromptModal() {
  showPromptModal.value = false
  editingPrompt.value = null
}

function savePrompt() {
  if (!editingPrompt.value) return
  const { id, title, description, text, icon } = editingPrompt.value
  if (!title.trim() || !text.trim()) return

  if (id) {
    const index = prompts.value.findIndex(p => p.id === id)
    if (index !== -1) {
      prompts.value[index] = { id, title: title.trim(), description: description.trim(), text: text.trim(), icon }
    }
  } else {
    if (prompts.value.length >= MAX_PROMPTS) return
    prompts.value.push({
      id: `prompt-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      text: text.trim(),
      icon
    })
  }
  closePromptModal()
}

function deletePrompt(id: string) {
  prompts.value = prompts.value.filter(p => p.id !== id)
}

function getIconComponent(iconName: string) {
  const icon = iconOptions.find(opt => opt.id === iconName)
  return icon ? icon.component : MessageSquare
}
</script>

<template>
  <div class="space-y-6">
    <div class="rounded-2xl border border-sky-200/70 bg-white/70 p-6 shadow-[inset_0_0_0_1px_rgba(0,180,255,0.08)]">
      <div class="flex flex-col gap-4">
        <div class="flex items-start justify-between gap-4">
          <div>
            <div class="text-sm font-semibold text-slate-900">系统设置</div>
            <div class="mt-1 text-xs text-slate-600">配置系统品牌信息和推荐问题。</div>
          </div>
        </div>

        <div class="flex gap-2">
          <button
            type="button"
            @click="activeTab = 'brand'"
            :class="[
              'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition',
              activeTab === 'brand'
                ? 'bg-gradient-to-r from-[#0098FF] to-[#006CFF] text-white shadow-sm'
                : 'bg-white/80 text-slate-700 ring-1 ring-sky-200/70 hover:bg-white'
            ]"
          >
            <Settings2 class="h-4 w-4" /> 品牌配置
          </button>
          <button
            type="button"
            @click="activeTab = 'prompts'"
            :class="[
              'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition',
              activeTab === 'prompts'
                ? 'bg-gradient-to-r from-[#0098FF] to-[#006CFF] text-white shadow-sm'
                : 'bg-white/80 text-slate-700 ring-1 ring-sky-200/70 hover:bg-white'
            ]"
          >
            <MessageSquare class="h-4 w-4" /> 问题配置
          </button>
        </div>

        <div v-if="activeTab === 'brand'" class="mt-5">
          <div class="rounded-2xl border border-dashed border-sky-200/70 bg-white/60 p-4">
            <div class="flex items-center gap-3">
              <span class="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[linear-gradient(180deg,rgba(0,180,255,0.16),rgba(141,76,255,0.08))] ring-1 ring-sky-200/70">
                <Image class="h-5 w-5 text-slate-900" />
              </span>
              <div>
                <div class="text-sm font-semibold text-slate-900">基础信息</div>
                <div class="mt-1 text-xs text-slate-600">建议 Logo 透明 PNG，页签 Icon 32×32。</div>
              </div>
            </div>

            <div class="mt-4 grid gap-3">
              <label class="text-xs text-slate-600">系统名称
                <input v-model="systemName" placeholder="例如：极客光年安全智脑" class="mt-2 w-full rounded-xl border border-sky-200/70 bg-white/80 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[#00B4FF]/55" />
              </label>
              <label class="text-xs text-slate-600">页签抬头
                <input v-model="tabTitle" placeholder="浏览器标签页标题" class="mt-2 w-full rounded-xl border border-sky-200/70 bg-white/80 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[#00B4FF]/55" />
              </label>
              <label class="text-xs text-slate-600">页签 Icon URL
                <input v-model="tabIcon" placeholder="https:// 或 data:image/..." class="mt-2 w-full rounded-xl border border-sky-200/70 bg-white/80 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[#00B4FF]/55" />
              </label>
              <div class="flex flex-wrap items-center gap-3">
                <input ref="iconInputRef" type="file" accept="image/*" class="hidden" @change="onIconChange" />
                <button type="button" @click="iconInputRef?.click()" class="inline-flex items-center gap-2 rounded-xl bg-white/80 px-4 py-2 text-sm font-semibold text-slate-900 ring-1 ring-sky-200/70 transition hover:bg-white">
                  <UploadCloud class="h-4 w-4" /> 上传页签 Icon
                </button>
                <span class="text-xs" :class="tabIcon ? 'text-slate-600' : 'text-slate-500'">{{ tabIcon ? '已设置页签 Icon' : '未设置页签 Icon' }}</span>
              </div>

              <label class="mt-2 text-xs text-slate-600">项目 Logo URL
                <input v-model="logoUrl" placeholder="https:// 或 data:image/..." class="mt-2 w-full rounded-xl border border-sky-200/70 bg-white/80 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[#00B4FF]/55" />
              </label>
              <div class="flex flex-wrap items-center gap-3">
                <input ref="logoInputRef" type="file" accept="image/*" class="hidden" @change="onLogoChange" />
                <button type="button" @click="logoInputRef?.click()" class="inline-flex items-center gap-2 rounded-xl bg-white/80 px-4 py-2 text-sm font-semibold text-slate-900 ring-1 ring-sky-200/70 transition hover:bg-white">
                  <UploadCloud class="h-4 w-4" /> 上传项目 Logo
                </button>
                <span class="text-xs" :class="logoUrl ? 'text-slate-600' : 'text-slate-500'">{{ logoUrl ? '已设置项目 Logo' : '未设置项目 Logo' }}</span>
              </div>
              <div class="rounded-xl border border-sky-200/70 bg-white/80 px-4 py-3 text-xs text-slate-600">
                修改会即时生效（本地持久化存储），刷新后仍会保留。
              </div>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'prompts'" class="mt-5">
          <div class="flex items-center justify-between gap-4 mb-4">
            <div class="flex items-center gap-3">
              <span class="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[linear-gradient(180deg,rgba(0,180,255,0.16),rgba(141,76,255,0.08))] ring-1 ring-sky-200/70">
                <MessageSquare class="h-5 w-5 text-slate-900" />
              </span>
              <div>
                <div class="text-sm font-semibold text-slate-900">推荐问题配置</div>
                <div class="mt-1 text-xs text-slate-600">管理首页欢迎页面的推荐问题，用户可快速点击开始对话。</div>
              </div>
            </div>
            <div class="flex flex-col items-end gap-2">
              <button
                type="button"
                @click="openPromptModal()"
                :disabled="isMaxPromptsReached"
                :class="[
                  'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold ring-1 transition',
                  isMaxPromptsReached
                    ? 'bg-slate-200 text-slate-400 ring-slate-300 cursor-not-allowed'
                    : 'bg-gradient-to-r from-[#0098FF] to-[#006CFF] text-white ring-[#00B4FF]/55 hover:brightness-105'
                ]"
              >
                <Plus class="h-4 w-4" /> 添加问题
              </button>
              <div v-if="isMaxPromptsReached" class="text-xs text-amber-600">
                最多只能添加 4 个问题
              </div>
            </div>
          </div>

          <div v-if="prompts.length === 0" class="rounded-2xl border border-dashed border-sky-200/70 bg-white/60 p-8 text-center">
            <div class="text-sm text-slate-600">暂无推荐问题</div>
            <div class="mt-2 text-xs text-slate-500">点击"添加问题"按钮创建第一个推荐问题</div>
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="prompt in prompts"
              :key="prompt.id"
              class="rounded-2xl border border-sky-200/70 bg-white/60 p-4 transition hover:bg-white/80"
            >
              <div class="flex items-start justify-between gap-4">
                <div class="flex items-start gap-3 min-w-0 flex-1">
                  <span class="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(180deg,rgba(0,180,255,0.16),rgba(141,76,255,0.08))] ring-1 ring-sky-200/70">
                    <component :is="getIconComponent(prompt.icon)" class="h-5 w-5 text-slate-900" />
                  </span>
                  <div class="min-w-0 flex-1">
                    <div class="text-sm font-semibold text-slate-900">{{ prompt.title }}</div>
                    <div class="mt-1 text-xs text-slate-600">{{ prompt.description }}</div>
                    <div class="mt-2 rounded-xl border border-sky-200/50 bg-white/70 px-3 py-2 text-xs text-slate-700">
                      {{ prompt.text }}
                    </div>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <button
                    type="button"
                    @click="openPromptModal(prompt)"
                    class="rounded-lg bg-white/80 p-2 text-slate-600 ring-1 ring-sky-200/70 transition hover:bg-white hover:text-slate-900"
                  >
                    <Edit2 class="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    @click="deletePrompt(prompt.id)"
                    class="rounded-lg bg-white/80 p-2 text-rose-600 ring-1 ring-rose-200/70 transition hover:bg-white hover:text-rose-700"
                  >
                    <Trash2 class="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showPromptModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div class="mx-4 w-full max-w-lg rounded-2xl border border-sky-200/70 bg-white/95 px-6 py-5 shadow-xl">
        <div class="text-base font-semibold text-slate-900">{{ editingPrompt?.id ? '编辑推荐问题' : '添加推荐问题' }}</div>
        <div class="mt-4 space-y-4">
          <label class="text-xs text-slate-600">问题标题
            <input
              v-model="editingPrompt!.title"
              placeholder="例如：安全风险评估"
              class="mt-2 w-full rounded-xl border border-sky-200/70 bg-white/80 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[#00B4FF]/55"
            />
          </label>
          <label class="text-xs text-slate-600">问题描述
            <input
              v-model="editingPrompt!.description"
              placeholder="例如：快速梳理重点风险和控制措施"
              class="mt-2 w-full rounded-xl border border-sky-200/70 bg-white/80 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[#00B4FF]/55"
            />
          </label>
          <label class="text-xs text-slate-600">问题内容
            <textarea
              v-model="editingPrompt!.text"
              placeholder="例如：如何进行安全生产风险评估？"
              rows="3"
              class="mt-2 w-full resize-none rounded-xl border border-sky-200/70 bg-white/80 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[#00B4FF]/55"
            />
          </label>
          <div class="text-xs text-slate-600">选择图标
            <div class="mt-2 grid grid-cols-6 gap-2">
              <button
                v-for="icon in iconOptions"
                :key="icon.id"
                type="button"
                @click="editingPrompt!.icon = icon.id"
                :class="[
                  'flex h-10 w-10 items-center justify-center rounded-xl transition',
                  editingPrompt!.icon === icon.id
                    ? 'bg-gradient-to-r from-[#0098FF] to-[#006CFF] text-white ring-2 ring-[#00B4FF]/50'
                    : 'bg-white/80 text-slate-600 ring-1 ring-sky-200/70 hover:bg-white'
                ]"
              >
                <component :is="icon.component" class="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
        <div class="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            @click="closePromptModal"
            class="rounded-xl bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 ring-1 ring-sky-200/70 transition hover:bg-white"
          >
            取消
          </button>
          <button
            type="button"
            @click="savePrompt"
            class="rounded-xl bg-gradient-to-r from-[#0098FF] to-[#006CFF] px-4 py-2 text-sm font-semibold text-white ring-1 ring-[#00B4FF]/55 transition hover:brightness-105"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
