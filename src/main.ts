import { createApp, watch } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import App from './App.vue'
import router from './router'
import i18n from './i18n'
import { useSystemStore } from './stores/system'
import './index.css'

const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.use(router)
app.use(i18n)

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

app.mount('#app')
