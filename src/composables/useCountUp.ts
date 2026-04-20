import { ref, watch, computed, onUnmounted } from 'vue'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

export function useCountUp(value: () => number, durationMs = 2000) {
  const reducedMotion = usePrefersReducedMotion()
  const display = ref(0)
  const target = computed(() => Math.max(0, Math.floor(value())))
  let raf = 0

  watch([target, reducedMotion], ([t, rm]) => {
    cancelAnimationFrame(raf)
    if (rm) { display.value = t; return }
    const start = performance.now()
    const from = 0
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / durationMs)
      const eased = 1 - Math.pow(1 - p, 3)
      display.value = Math.round(from + (t - from) * eased)
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
  }, { immediate: true })

  onUnmounted(() => cancelAnimationFrame(raf))

  return display
}
