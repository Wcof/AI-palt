<script setup lang="ts">
import { ref, computed } from 'vue'
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Image, Pencil, Save, Trash2, X } from 'lucide-vue-next'
import { cn } from '@/lib/utils'

defineOptions({ name: 'BannerManager' })

type BannerItem = { id: string; title: string; description: string; link: string; imageUrl: string; enabled: boolean; createdAt: number }

function makeId() { return `banner-${Math.random().toString(36).slice(2, 9)}` }

const seededBanners: BannerItem[] = [
  { id: 'banner-ehs', title: '隐患排查与三违识别', description: '覆盖现场巡检、PPE 合规与高危作业风险告警。', link: 'https://example.com/ehs', imageUrl: 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?q=80&w=1200&auto=format&fit=crop', enabled: true, createdAt: Date.now() - 172800000 },
  { id: 'banner-ticket', title: '作业票合规与风险预警', description: '聚焦作业票审核、制度对标与合规处置。', link: 'https://example.com/ticket', imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1200&auto=format&fit=crop', enabled: true, createdAt: Date.now() - 86400000 },
]

const items = ref<BannerItem[]>(seededBanners)
const title = ref('')
const description = ref('')
const link = ref('')
const imageUrl = ref('')
const editingId = ref<string | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)

const editingItem = computed(() => items.value.find(x => x.id === editingId.value) ?? null)

function resetForm() {
  title.value = ''; description.value = ''; link.value = ''; imageUrl.value = ''; editingId.value = null
  if (fileInputRef.value) fileInputRef.value.value = ''
}

function handleSubmit() {
  const t = title.value.trim(), d = description.value.trim(), l = link.value.trim()
  if (!t || !d || !imageUrl.value) return
  if (editingItem.value) {
    items.value = items.value.map(x => x.id === editingItem.value!.id ? { ...x, title: t, description: d, link: l, imageUrl: imageUrl.value } : x)
    resetForm(); return
  }
  items.value.unshift({ id: makeId(), title: t, description: d, link: l, imageUrl: imageUrl.value, enabled: true, createdAt: Date.now() })
  resetForm()
}

function moveItem(id: string, dir: 'up' | 'down') {
  const idx = items.value.findIndex(x => x.id === id)
  if (idx === -1) return
  const ni = dir === 'up' ? idx - 1 : idx + 1
  if (ni < 0 || ni >= items.value.length) return
  const arr = [...items.value]; const [item] = arr.splice(idx, 1); arr.splice(ni, 0, item); items.value = arr
}

function startEdit(item: BannerItem) {
  editingId.value = item.id; title.value = item.title; description.value = item.description; link.value = item.link; imageUrl.value = item.imageUrl
}

function deleteItem(id: string) { items.value = items.value.filter(x => x.id !== id); if (editingId.value === id) resetForm() }
function toggleEnabled(id: string) { items.value = items.value.map(x => x.id === id ? { ...x, enabled: !x.enabled } : x) }

function onFileChange(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0]
  if (f) imageUrl.value = URL.createObjectURL(f)
}
</script>

<template>
  <div class="space-y-6">
    <div class="rounded-2xl border border-sky-200/70 bg-white/70 p-6 shadow-[inset_0_0_0_1px_rgba(0,180,255,0.08)]">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div class="text-sm font-semibold text-slate-900">Banner 管理</div>
          <div class="mt-1 text-xs text-slate-600">管理首页 Banner 的上传、上下线与播放顺序。</div>
        </div>
        <div class="rounded-xl bg-white/75 px-3 py-2 text-xs text-slate-600 ring-1 ring-sky-200/70">当前启用 {{ items.filter(x => x.enabled).length }} / {{ items.length }}</div>
      </div>

      <div class="mt-5 grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <!-- Form -->
        <div class="rounded-2xl border border-dashed border-sky-200/70 bg-white/60 p-4">
          <div class="flex items-center gap-3">
            <span class="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[linear-gradient(180deg,rgba(0,180,255,0.16),rgba(141,76,255,0.08))] ring-1 ring-sky-200/70"><Image class="h-5 w-5 text-slate-900" /></span>
            <div>
              <div class="text-sm font-semibold text-slate-900">{{ editingItem ? '编辑 Banner' : '新增 Banner' }}</div>
              <div class="mt-1 text-xs text-slate-600">推荐尺寸 1920×720，支持 JPG/PNG。</div>
            </div>
          </div>
          <div class="mt-4 grid gap-3 sm:grid-cols-2">
            <label class="text-xs text-slate-600">Banner 标题<input v-model="title" placeholder="例如：隐患排查与三违识别" class="mt-2 w-full rounded-xl border border-sky-200/70 bg-white/80 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[#00B4FF]/55" /></label>
            <label class="text-xs text-slate-600">Banner 描述<input v-model="description" placeholder="例如：覆盖隐患排查、三违识别与风险预警" class="mt-2 w-full rounded-xl border border-sky-200/70 bg-white/80 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[#00B4FF]/55" /></label>
            <label class="text-xs text-slate-600">跳转链接（可选）<input v-model="link" placeholder="https://" class="mt-2 w-full rounded-xl border border-sky-200/70 bg-white/80 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[#00B4FF]/55" /></label>
          </div>
          <div class="mt-3 flex flex-wrap items-center gap-3">
            <input ref="fileInputRef" type="file" accept="image/*" class="hidden" @change="onFileChange" />
            <button type="button" @click="fileInputRef?.click()" class="inline-flex items-center gap-2 rounded-xl bg-white/80 px-4 py-2 text-sm font-semibold text-slate-900 ring-1 ring-sky-200/70 transition hover:bg-white">选择图片</button>
            <span class="text-xs" :class="imageUrl ? 'text-slate-600' : 'text-slate-500'">{{ imageUrl ? '已选择图片' : '未选择图片' }}</span>
          </div>
          <div class="mt-4 flex items-center justify-end gap-2">
            <button v-if="editingItem" type="button" @click="resetForm" class="inline-flex items-center gap-2 rounded-xl bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-sky-200/70 transition hover:bg-white"><X class="h-4 w-4" /> 取消</button>
            <button type="button" @click="handleSubmit" :disabled="!title.trim() || !description.trim() || !imageUrl" class="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#0098FF] to-[#006CFF] px-4 py-2 text-sm font-semibold text-white ring-1 ring-[#00B4FF]/55 transition hover:brightness-105 disabled:opacity-50">
              <Save v-if="editingItem" class="h-4 w-4" />
              {{ editingItem ? '保存修改' : '新增 Banner' }}
            </button>
          </div>
        </div>

        <!-- Preview -->
        <div class="rounded-2xl border border-sky-200/70 bg-white/60 p-4">
          <div class="text-sm font-semibold text-slate-900">预览（与首页 Banner 一致）</div>
          <div class="mt-3 overflow-hidden rounded-xl border border-sky-200/70 bg-white/80">
            <div v-if="imageUrl" class="relative w-full" style="aspect-ratio: 16/9">
              <img :src="imageUrl" alt="banner-preview" class="absolute inset-0 h-full w-full object-cover opacity-85" />
              <div class="absolute inset-0 bg-gradient-to-r from-white/90 via-white/70 to-white/20" />
              <div class="absolute inset-0 px-6 py-5">
                <div class="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-[11px] text-slate-700 ring-1 ring-sky-200/70">安全生产场景<span class="h-1.5 w-1.5 rounded-full bg-[#00B4FF]" /></div>
                <div class="mt-3 text-xl font-semibold tracking-tight text-slate-900">{{ title.trim() || 'Banner 标题' }}</div>
                <div class="mt-2 text-xs leading-5 text-slate-700">{{ description.trim() || 'Banner 描述' }}</div>
              </div>
            </div>
            <div v-else class="flex h-40 items-center justify-center text-xs text-slate-500">暂无预览</div>
          </div>
          <div class="mt-3 text-xs text-slate-600">预览区按 16:9 等比缩放，展示与首页一致的按钮与布局。</div>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="overflow-hidden rounded-2xl border border-sky-200/70 bg-white/60">
      <div class="overflow-auto">
        <table class="w-full min-w-[960px] text-left text-sm">
          <thead class="bg-white/70 text-xs text-slate-600"><tr><th class="px-4 py-3">顺序</th><th class="px-4 py-3">Banner</th><th class="px-4 py-3">描述</th><th class="px-4 py-3">链接</th><th class="px-4 py-3">状态</th><th class="px-4 py-3">操作</th></tr></thead>
          <tbody class="divide-y divide-sky-200/50">
            <tr v-if="!items.length"><td colspan="6" class="px-6 py-10 text-center text-sm text-slate-600">暂无 Banner，可在上方新增。</td></tr>
            <tr v-for="(item, idx) in items" :key="item.id" class="bg-white/40">
              <td class="px-4 py-3">
                <div class="flex items-center gap-2 text-xs text-slate-600">
                  <span>{{ idx + 1 }}</span>
                  <button type="button" @click="moveItem(item.id, 'up')" class="rounded-md bg-white/80 p-1 ring-1 ring-sky-200/70 transition hover:bg-white"><ArrowUp class="h-3.5 w-3.5" /></button>
                  <button type="button" @click="moveItem(item.id, 'down')" class="rounded-md bg-white/80 p-1 ring-1 ring-sky-200/70 transition hover:bg-white"><ArrowDown class="h-3.5 w-3.5" /></button>
                </div>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <img :src="item.imageUrl" :alt="item.title" class="h-12 w-20 rounded-lg object-cover ring-1 ring-sky-200/60" />
                  <div class="min-w-0"><div class="truncate font-semibold text-slate-900">{{ item.title }}</div><div class="mt-1 text-[11px] text-slate-500">{{ new Date(item.createdAt).toLocaleDateString('zh-CN') }}</div></div>
                </div>
              </td>
              <td class="px-4 py-3 text-xs text-slate-600"><div class="max-w-[240px] text-clamp-2">{{ item.description }}</div></td>
              <td class="px-4 py-3 text-xs text-slate-600">{{ item.link || '-' }}</td>
              <td class="px-4 py-3">
                <button type="button" @click="toggleEnabled(item.id)" :class="cn('rounded-full px-3 py-1 text-[11px] font-semibold ring-1 transition', item.enabled ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : 'bg-slate-100 text-slate-600 ring-slate-200')">{{ item.enabled ? '已启用' : '已停用' }}</button>
              </td>
              <td class="px-4 py-3">
                <div class="flex flex-wrap items-center gap-2">
                  <button type="button" @click="startEdit(item)" class="inline-flex items-center gap-2 rounded-xl bg-white/80 px-3 py-2 text-xs font-semibold text-slate-900 ring-1 ring-sky-200/70 transition hover:bg-white"><Pencil class="h-4 w-4" /> 编辑</button>
                  <button type="button" @click="deleteItem(item.id)" class="inline-flex items-center gap-2 rounded-xl bg-white/80 px-3 py-2 text-xs font-semibold text-rose-600 ring-1 ring-rose-200/70 transition hover:bg-rose-50"><Trash2 class="h-4 w-4" /> 删除</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
