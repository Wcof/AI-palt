<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { LogIn, LogOut, Settings2, ShieldCheck, UserRound } from 'lucide-vue-next'
import { useUserStore } from '@/stores/user'
import { useSystemStore } from '@/stores/system'
import LoginModal from '@/components/auth/LoginModal.vue'

const props = defineProps<{ compact?: boolean }>()

const userStore = useUserStore()
const systemStore = useSystemStore()
const open = ref(false)
const loginOpen = ref(false)
const menuRef = ref<HTMLDivElement | null>(null)
const triggerRef = ref<HTMLButtonElement | null>(null)
const dropdownRef = ref<HTMLDivElement | null>(null)
const dropdownStyle = ref<Record<string, string>>({})

function displayInitial(name?: string) {
  return (name || '访').slice(0, 1).toUpperCase()
}

function syncDropdownPosition() {
  if (!open.value || !triggerRef.value || typeof window === 'undefined') return
  const rect = triggerRef.value.getBoundingClientRect()
  const width = 260
  const left = props.compact ? rect.right + 12 : rect.left
  const rawTop = props.compact ? rect.bottom - 232 : rect.bottom + 8
  const maxLeft = window.innerWidth - width - 12
  const maxTop = window.innerHeight - 260
  dropdownStyle.value = {
    left: `${Math.min(Math.max(12, left), Math.max(12, maxLeft))}px`,
    top: `${Math.min(Math.max(12, rawTop), Math.max(12, maxTop))}px`,
    width: `${width}px`,
  }
}

function toggleMenu() {
  open.value = !open.value
  if (open.value) nextTick(syncDropdownPosition)
}

function openSettings() {
  systemStore.openSettings()
  open.value = false
}

function openLogin() {
  loginOpen.value = true
  open.value = false
}

function logout() {
  userStore.logout()
  open.value = false
}

function handleClickOutside(e: MouseEvent) {
  const target = e.target as Node
  if (menuRef.value?.contains(target) || dropdownRef.value?.contains(target)) return
  open.value = false
}

function handleResize() {
  if (open.value) syncDropdownPosition()
}

watch(open, (value) => {
  if (value) nextTick(syncDropdownPosition)
})

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
  window.addEventListener('resize', handleResize)
  window.addEventListener('scroll', handleResize, true)
})
onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('scroll', handleResize, true)
})
</script>

<template>
  <div ref="menuRef" class="relative z-[60]">
    <button
      v-if="compact"
      ref="triggerRef"
      type="button"
      class="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-200/70 bg-white/80 shadow-[0_12px_32px_rgba(37,99,235,0.12)] ring-1 ring-white/80 transition hover:bg-white hover:shadow-[0_16px_42px_rgba(37,99,235,0.18)]"
      :title="userStore.user?.username || '登录账号'"
      @click.stop="toggleMenu"
    >
      <span class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#0098FF] to-[#006CFF] text-sm font-semibold text-white shadow-[0_10px_28px_rgba(0,108,255,0.30)]">
        <span v-if="userStore.user">{{ displayInitial(userStore.user.username) }}</span>
        <UserRound v-else class="h-4 w-4" />
      </span>
    </button>

    <button
      v-else
      ref="triggerRef"
      type="button"
      class="group flex w-full items-center gap-3 rounded-2xl border border-sky-200/70 bg-white/75 px-3 py-2.5 text-left shadow-[0_14px_38px_rgba(37,99,235,0.10)] ring-1 ring-white/80 transition hover:bg-white hover:shadow-[0_18px_48px_rgba(37,99,235,0.16)]"
      @click.stop="toggleMenu"
    >
      <span class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#0098FF] to-[#006CFF] text-sm font-semibold text-white shadow-[0_10px_28px_rgba(0,108,255,0.30)]">
        <span v-if="userStore.user">{{ displayInitial(userStore.user.username) }}</span>
        <UserRound v-else class="h-4 w-4" />
      </span>
      <span class="min-w-0 flex-1">
        <span class="block truncate text-sm font-semibold text-slate-950">{{ userStore.user?.username || '未登录' }}</span>
        <span class="mt-0.5 block truncate text-[11px] text-slate-500">{{ userStore.user?.role || '登录后同步个人配置' }}</span>
      </span>
      <span class="rounded-full bg-sky-50 px-2 py-1 text-[11px] font-medium text-sky-700 ring-1 ring-sky-100">
        {{ userStore.user ? '在线' : '登录' }}
      </span>
    </button>

    <Teleport to="body">
      <transition
        enter-active-class="transition duration-150"
        enter-from-class="translate-y-1 opacity-0"
        enter-to-class="translate-y-0 opacity-100"
        leave-active-class="transition duration-100"
        leave-from-class="translate-y-0 opacity-100"
        leave-to-class="translate-y-1 opacity-0"
      >
        <div
          v-if="open"
          ref="dropdownRef"
          class="fixed z-[360] overflow-hidden rounded-2xl border border-sky-100 bg-white/95 p-1.5 shadow-[0_24px_70px_rgba(37,99,235,0.20)] ring-1 ring-white/80 backdrop-blur-xl"
          :style="dropdownStyle"
        >
          <div class="rounded-xl bg-gradient-to-br from-sky-50 to-white px-3 py-3 ring-1 ring-sky-100/80">
            <div class="flex items-center gap-3">
              <span class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#0098FF] to-[#006CFF] text-sm font-semibold text-white">
                <span v-if="userStore.user">{{ displayInitial(userStore.user.username) }}</span>
                <UserRound v-else class="h-4 w-4" />
              </span>
              <div class="min-w-0">
                <div class="truncate text-sm font-semibold text-slate-950">{{ userStore.user?.username || '访客用户' }}</div>
                <div class="mt-0.5 truncate text-xs text-slate-500">{{ userStore.user?.email || '请先登录账号' }}</div>
              </div>
            </div>
          </div>

          <div class="mt-1 space-y-1">
            <button type="button" class="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-sky-50 hover:text-sky-800" @click="openSettings">
              <Settings2 class="h-4 w-4 text-sky-600" /> 系统设置
            </button>
            <button v-if="!userStore.user" type="button" class="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-sky-50 hover:text-sky-800" @click="openLogin">
              <LogIn class="h-4 w-4 text-sky-600" /> 登录账号
            </button>
            <div class="rounded-xl bg-slate-50 px-3 py-2 text-[11px] leading-5 text-slate-500 ring-1 ring-slate-100">
              <div class="mb-1 flex items-center gap-1.5 text-[11px] font-semibold text-slate-700">
                <ShieldCheck class="h-3.5 w-3.5 text-emerald-500" /> 账号说明
              </div>
              <div>当前账号信息与系统设置、对话记录及个性化配置联动。</div>
            </div>
            <button v-if="userStore.user" type="button" class="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-rose-600 transition hover:bg-rose-50" @click="logout">
              <LogOut class="h-4 w-4" /> 退出登录
            </button>
          </div>
        </div>
      </transition>
    </Teleport>

    <LoginModal :is-open="loginOpen" @close="loginOpen = false" />
  </div>
</template>
