import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface User {
  id: string
  username: string
  avatar: string
  email: string
}

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const isAuthenticated = computed(() => !!user.value)

  function login(username: string) {
    user.value = {
      id: 'u-' + Math.random().toString(36).substr(2, 9),
      username,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      email: `${username}@example.com`,
    }
  }

  function logout() {
    user.value = null
  }

  return { user, isAuthenticated, login, logout }
}, {
  persist: { key: 'user-storage' },
})
