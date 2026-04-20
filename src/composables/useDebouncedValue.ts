import { ref, watch } from 'vue'

export function useDebouncedValue<T>(value: () => T, delayMs: number) {
  const debounced = ref(value()) as any
  let timer: number | undefined

  watch(value, (v) => {
    clearTimeout(timer)
    timer = window.setTimeout(() => { debounced.value = v }, delayMs)
  })

  return debounced
}
