import { ref, watch } from 'vue'

export function useTheme() {
  const theme = ref<'light' | 'dark'>(
    (localStorage.getItem('theme') as 'light' | 'dark') ||
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  )
  const isDark = ref(theme.value === 'dark')

  watch(theme, (v) => {
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(v)
    localStorage.setItem('theme', v)
    isDark.value = v === 'dark'
  }, { immediate: true })

  function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }

  return { theme, isDark, toggleTheme }
}
