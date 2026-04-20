import { ref, onMounted, onUnmounted } from 'vue'

export function usePrefersReducedMotion() {
  const reduced = ref(false)
  let mq: MediaQueryList

  onMounted(() => {
    mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    reduced.value = mq.matches
    const onChange = () => { reduced.value = mq.matches }
    mq.addEventListener('change', onChange)
    onUnmounted(() => mq.removeEventListener('change', onChange))
  })

  return reduced
}
