import { createApp, watch } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import App from './App.vue'
import router from './router'
import i18n from './i18n'
import { useSystemStore } from './stores/system'
import './index.css'

// Ant Design Vue
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'
import * as Icons from '@ant-design/icons-vue'

function updateAppViewportHeight() {
  const height = window.innerHeight
  document.documentElement.style.setProperty('--app-height', `${height}px`)
  document.documentElement.style.setProperty('--app-safe-height', `${height}px`)
}


const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.use(router)
app.use(i18n)
app.use(Antd)

// 注册所有图标
Object.keys(Icons).forEach(key => {
  app.component(key, Icons[key as keyof typeof Icons])
})

const systemStore = useSystemStore(pinia)

function applyFavicon(href: string) {
  const iconHref = href?.trim() || systemStore.defaultTabIcon
  let link = document.querySelector<HTMLLinkElement>('link[rel~="icon"]')
  if (!link) {
    link = document.createElement('link')
    link.rel = 'icon'
    document.head.appendChild(link)
  }
  link.href = iconHref
}

watch(() => systemStore.displayTabTitle, (title) => {
  document.title = title
}, { immediate: true })

watch(() => systemStore.displayTabIcon, (icon) => {
  applyFavicon(icon)
}, { immediate: true })

updateAppViewportHeight()
window.addEventListener('resize', updateAppViewportHeight, { passive: true })
window.addEventListener('orientationchange', updateAppViewportHeight, { passive: true })

app.mount('#app')
