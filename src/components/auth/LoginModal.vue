<script setup lang="ts">
import { computed, ref } from 'vue'
import { Building2, Loader2, QrCode, ShieldCheck, UserRound, X } from 'lucide-vue-next'
import { useUserStore } from '@/stores/user'
import { cn } from '@/lib/utils'

defineProps<{ isOpen: boolean }>()
const emit = defineEmits<{ close: [] }>()

const userStore = useUserStore()

const loginMethod = ref<'password' | 'qr'>('password')
const qrStep = ref<'idle' | 'profile'>('idle')
const profileType = ref<'personal' | 'enterprise'>('personal')
const loading = ref(false)
const error = ref('')

const passwordForm = ref({
  account: '',
  password: '',
})

const personalProfile = ref({
  name: '',
  phone: '',
  password: '',
  confirmPassword: '',
})

const enterpriseProfile = ref({
  companyName: '',
  phone: '',
  industry: '',
  companySize: '',
  password: '',
  confirmPassword: '',
})

const phoneRegex = /^1[3-9]\d{9}$/
const industries = ['安全生产', '化工', '制造', '能源', '政企', '其他']
const companySizes = ['1-50人', '51-200人', '201-1000人', '1000人以上']

const qrCells = [
  1, 1, 1, 0, 1, 0, 1, 1, 1,
  1, 0, 1, 1, 0, 1, 1, 0, 1,
  1, 1, 1, 0, 1, 1, 1, 1, 1,
  0, 1, 0, 1, 1, 0, 0, 1, 0,
  1, 0, 1, 1, 0, 1, 0, 0, 1,
  0, 1, 1, 0, 1, 0, 1, 1, 0,
  1, 1, 1, 1, 0, 1, 1, 0, 1,
  1, 0, 0, 1, 1, 0, 0, 1, 1,
  1, 1, 1, 0, 1, 1, 1, 0, 1,
]

const profileValid = computed(() => {
  if (profileType.value === 'personal') {
    return Boolean(
      personalProfile.value.name.trim().length >= 2
      && phoneRegex.test(personalProfile.value.phone.trim())
      && personalProfile.value.password.length >= 6
      && personalProfile.value.confirmPassword === personalProfile.value.password,
    )
  }
  return Boolean(
    enterpriseProfile.value.companyName.trim().length >= 2
    && phoneRegex.test(enterpriseProfile.value.phone.trim())
    && enterpriseProfile.value.industry
    && enterpriseProfile.value.companySize
    && enterpriseProfile.value.password.length >= 6
    && enterpriseProfile.value.confirmPassword === enterpriseProfile.value.password,
  )
})

function resetQrFlow() {
  qrStep.value = 'idle'
  profileType.value = 'personal'
  personalProfile.value.name = ''
  personalProfile.value.phone = ''
  personalProfile.value.password = ''
  personalProfile.value.confirmPassword = ''
  enterpriseProfile.value.companyName = ''
  enterpriseProfile.value.phone = ''
  enterpriseProfile.value.industry = ''
  enterpriseProfile.value.companySize = ''
  enterpriseProfile.value.password = ''
  enterpriseProfile.value.confirmPassword = ''
  error.value = ''
}

function closeModal() {
  resetQrFlow()
  emit('close')
}

function switchLoginMethod(next: 'password' | 'qr') {
  loginMethod.value = next
  resetQrFlow()
}

async function submitPasswordLogin() {
  const account = passwordForm.value.account.trim()
  if (!account || !passwordForm.value.password.trim()) {
    error.value = '请输入账号和密码'
    return
  }
  loading.value = true
  await new Promise(resolve => setTimeout(resolve, 600))
  userStore.login(account)
  loading.value = false
  closeModal()
}

async function simulateQrScan() {
  loading.value = true
  await new Promise(resolve => setTimeout(resolve, 500))
  userStore.beginQrAuth('login')
  qrStep.value = 'profile'
  loading.value = false
}

async function submitProfile() {
  error.value = ''
  if (!profileValid.value) {
    error.value = profileType.value === 'personal' ? '请填写名称、正确手机号，并确认两次密码一致' : '请填写企业信息、正确手机号，并确认两次密码一致'
    return
  }
  loading.value = true
  await new Promise(resolve => setTimeout(resolve, 500))
  if (profileType.value === 'personal') {
    userStore.completeQrProfile({
      accountType: 'personal',
      name: personalProfile.value.name,
      phone: personalProfile.value.phone,
    })
  } else {
    userStore.completeQrProfile({
      accountType: 'enterprise',
      companyName: enterpriseProfile.value.companyName,
      phone: enterpriseProfile.value.phone,
      industry: enterpriseProfile.value.industry,
      companySize: enterpriseProfile.value.companySize,
    })
  }
  loading.value = false
  closeModal()
}
</script>

<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-[300] h-[100dvh] min-h-[100dvh] overflow-y-auto bg-blue-950/25 p-4 backdrop-blur-sm">
      <div class="relative mx-auto my-4 flex max-h-[calc(100dvh-2rem)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
        <button @click="closeModal" class="absolute right-4 top-4 z-10 rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600">
          <X class="h-5 w-5" />
        </button>

        <div class="border-b border-slate-100 px-6 pb-4 pt-6 md:px-7">
          <div class="pr-10">
            <h2 class="text-2xl font-semibold text-slate-900">欢迎登录</h2>
            <p class="mt-2 text-sm text-slate-500">选择密码登录或快捷登录进入工作台</p>
          </div>
        </div>

        <div class="min-h-0 flex-1 overflow-y-auto px-6 py-5 md:px-7">
          <div class="mb-5 grid grid-cols-2 rounded-xl bg-blue-50 p-1">
            <button :class="cn('rounded-lg px-3 py-2 text-sm font-medium transition-colors', loginMethod === 'password' ? 'bg-white text-blue-700 shadow-sm ring-1 ring-blue-100' : 'text-slate-600 hover:text-slate-900')" @click="switchLoginMethod('password')">密码登录</button>
            <button :class="cn('rounded-lg px-3 py-2 text-sm font-medium transition-colors', loginMethod === 'qr' ? 'bg-white text-blue-700 shadow-sm ring-1 ring-blue-100' : 'text-slate-600 hover:text-slate-900')" @click="switchLoginMethod('qr')">快捷登录</button>
          </div>

          <form v-if="loginMethod === 'password'" class="space-y-4" @submit.prevent="submitPasswordLogin">
            <label class="block text-sm font-medium text-slate-700">账号
              <input v-model="passwordForm.account" type="text" class="mt-1 block w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500" placeholder="请输入账号 / 用户名" autofocus />
            </label>
            <label class="block text-sm font-medium text-slate-700">密码
              <input v-model="passwordForm.password" type="password" class="mt-1 block w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500" placeholder="请输入密码" />
            </label>
            <p v-if="error" class="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">{{ error }}</p>
            <button type="submit" :disabled="loading || !passwordForm.account.trim() || !passwordForm.password.trim()" :class="cn('flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#0098FF] to-[#006CFF] py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition-all hover:brightness-105 active:scale-[0.98]', (loading || !passwordForm.account.trim() || !passwordForm.password.trim()) && 'cursor-not-allowed opacity-70 hover:brightness-100')">
              <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
              {{ loading ? '登录中...' : '立即确认' }}
            </button>
            <div class="text-center text-sm text-slate-500">
              没有账号？
              <button type="button" class="font-medium text-sky-600 hover:text-sky-700" @click="switchLoginMethod('qr')">扫码登录</button>
            </div>
          </form>

          <div v-else class="space-y-5">
            <section v-if="qrStep === 'idle'" class="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-5">
              <div class="flex flex-col items-center gap-4 text-center">
                <div class="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-[0_0.875rem_2rem_rgba(37,99,235,0.28)]">
                  <QrCode class="h-6 w-6" />
                </div>
                <div>
                  <div class="text-lg font-semibold text-slate-950">快捷登录</div>
                  <div class="mt-1 text-sm text-slate-500">扫码成功后补全基础信息并进入系统</div>
                </div>
                <div class="grid h-44 w-44 grid-cols-9 gap-1 rounded-2xl bg-white p-4 shadow-inner ring-1 ring-blue-100">
                  <span v-for="(cell, index) in qrCells" :key="index" :class="cell ? 'rounded-sm bg-slate-950' : 'rounded-sm bg-blue-50'" />
                </div>
                <button type="button" :disabled="loading" class="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#0098FF] to-[#006CFF] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70" @click="simulateQrScan">
                  <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
                  {{ loading ? '正在确认扫码...' : '模拟扫码成功' }}
                </button>
              </div>
            </section>

            <form v-else class="space-y-5" @submit.prevent="submitProfile">
              <div class="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 ring-1 ring-emerald-100">
                扫码成功，已完成身份确认。请补全基础信息后进入系统。
              </div>

              <div class="grid grid-cols-2 rounded-xl bg-slate-100 p-1">
                <button type="button" :class="cn('inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors', profileType === 'personal' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900')" @click="profileType = 'personal'">
                  <UserRound class="h-4 w-4" /> 个人用户
                </button>
                <button type="button" :class="cn('inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors', profileType === 'enterprise' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900')" @click="profileType = 'enterprise'">
                  <Building2 class="h-4 w-4" /> 企业用户
                </button>
              </div>

              <section v-if="profileType === 'personal'" class="space-y-3">
                <div class="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <ShieldCheck class="h-4 w-4 text-sky-600" />
                  <span>个人基础信息</span>
                </div>
                <label class="block text-sm font-medium text-slate-700">名称
                  <input v-model="personalProfile.name" type="text" placeholder="请输入个人名称" class="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500" />
                </label>
                <label class="block text-sm font-medium text-slate-700">手机号
                  <input v-model="personalProfile.phone" type="text" placeholder="请输入手机号" class="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500" />
                </label>
                <label class="block text-sm font-medium text-slate-700">密码
                  <input v-model="personalProfile.password" type="password" placeholder="至少 6 位" class="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500" />
                </label>
                <label class="block text-sm font-medium text-slate-700">确认密码
                  <input v-model="personalProfile.confirmPassword" type="password" placeholder="再次输入密码" class="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500" />
                </label>
              </section>

              <section v-else class="space-y-3">
                <div class="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <Building2 class="h-4 w-4 text-sky-600" />
                  <span>企业基础信息</span>
                </div>
                <label class="block text-sm font-medium text-slate-700">企业名称
                  <input v-model="enterpriseProfile.companyName" type="text" placeholder="请输入企业名称" class="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500" />
                </label>
                <label class="block text-sm font-medium text-slate-700">手机号
                  <input v-model="enterpriseProfile.phone" type="text" placeholder="请输入手机号" class="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500" />
                </label>
                <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <label class="block text-sm font-medium text-slate-700">所在行业
                    <select v-model="enterpriseProfile.industry" class="mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500">
                      <option value="">请选择</option>
                      <option v-for="industry in industries" :key="industry" :value="industry">{{ industry }}</option>
                    </select>
                  </label>
                  <label class="block text-sm font-medium text-slate-700">企业规模
                    <select v-model="enterpriseProfile.companySize" class="mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500">
                      <option value="">请选择</option>
                      <option v-for="size in companySizes" :key="size" :value="size">{{ size }}</option>
                    </select>
                  </label>
                </div>
                <label class="block text-sm font-medium text-slate-700">密码
                  <input v-model="enterpriseProfile.password" type="password" placeholder="至少 6 位" class="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500" />
                </label>
                <label class="block text-sm font-medium text-slate-700">确认密码
                  <input v-model="enterpriseProfile.confirmPassword" type="password" placeholder="再次输入密码" class="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500" />
                </label>
              </section>

              <p v-if="error" class="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">{{ error }}</p>
              <button type="submit" :disabled="loading || !profileValid" :class="cn('flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#0098FF] to-[#006CFF] py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition-all hover:brightness-105 active:scale-[0.98]', (loading || !profileValid) && 'cursor-not-allowed opacity-70 hover:brightness-100')">
                <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
                {{ loading ? '正在进入...' : '完成并进入系统' }}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
