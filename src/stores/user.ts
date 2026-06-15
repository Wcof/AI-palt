import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface User {
  id: string
  username: string
  avatar: string
  email: string
  role?: string
  accountType?: 'personal' | 'enterprise'
  phone?: string
  companyName?: string
  industry?: string
  companySize?: string
  profileCompleted?: boolean
  authSource?: 'password' | 'qr'
  authFlow?: 'login' | 'register'
}

interface RegisterPersonalPayload {
  name: string
  phone: string
  email?: string
  role?: string
}

interface RegisterEnterprisePayload {
  companyName: string
  adminName: string
  adminPhone: string
  adminEmail?: string
  industry: string
  companySize: string
}

interface QrProfilePayload {
  accountType: 'personal' | 'enterprise'
  name?: string
  phone?: string
  companyName?: string
  industry?: string
  companySize?: string
}

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>({
    id: 'demo-user',
    username: '周志远',
    avatar: '',
    email: 'zhouzhiyuan@example.com',
    role: '安全总监',
  })
  const isAuthenticated = computed(() => !!user.value)

  function login(username: string) {
    user.value = {
      id: 'u-' + Math.random().toString(36).substr(2, 9),
      username,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      email: `${username}@example.com`,
      role: '安全管理人员',
      profileCompleted: true,
      authSource: 'password',
    }
  }

  function beginQrAuth(flow: 'login' | 'register') {
    user.value = {
      id: 'u-' + Math.random().toString(36).slice(2, 11),
      username: '扫码用户',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=qr-user',
      email: 'qr-user@mock.local',
      role: '待完善资料',
      authSource: 'qr',
      authFlow: flow,
      profileCompleted: false,
    }
  }

  function logout() {
    user.value = null
  }

  function completeQrProfile(payload: QrProfilePayload) {
    const current = user.value
    const id = current?.id || 'u-' + Math.random().toString(36).slice(2, 11)
    if (payload.accountType === 'personal') {
      const name = payload.name?.trim() || '个人用户'
      user.value = {
        id,
        username: name,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
        email: current?.email || `${name}@mock.local`,
        role: '个人用户',
        accountType: 'personal',
        phone: payload.phone?.trim(),
        profileCompleted: true,
        authSource: current?.authSource || 'qr',
        authFlow: current?.authFlow || 'register',
      }
      return
    }
    const companyName = payload.companyName?.trim() || '企业用户'
    user.value = {
      id,
      username: companyName,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(companyName)}`,
      email: current?.email || `${companyName}@enterprise.mock.local`,
      role: '企业用户',
      accountType: 'enterprise',
      companyName,
      industry: payload.industry,
      companySize: payload.companySize,
      phone: payload.phone?.trim(),
      profileCompleted: true,
      authSource: current?.authSource || 'qr',
      authFlow: current?.authFlow || 'register',
    }
  }

  function registerPersonal(payload: RegisterPersonalPayload) {
    const name = payload.name.trim()
    user.value = {
      id: 'u-' + Math.random().toString(36).slice(2, 11),
      username: name,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      email: payload.email?.trim() || `${payload.phone}@mock.local`,
      role: payload.role?.trim() || '个人用户',
      accountType: 'personal',
      phone: payload.phone.trim(),
    }
  }

  function registerEnterprise(payload: RegisterEnterprisePayload) {
    const adminName = payload.adminName.trim()
    user.value = {
      id: 'u-' + Math.random().toString(36).slice(2, 11),
      username: adminName,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(payload.companyName)}`,
      email: payload.adminEmail?.trim() || `${payload.adminPhone}@enterprise.mock.local`,
      role: '企业管理员',
      accountType: 'enterprise',
      phone: payload.adminPhone.trim(),
      companyName: payload.companyName.trim(),
      industry: payload.industry,
      companySize: payload.companySize,
    }
  }

  return { user, isAuthenticated, login, beginQrAuth, completeQrProfile, logout, registerPersonal, registerEnterprise }
}, {
  persist: { key: 'user-storage' },
})
