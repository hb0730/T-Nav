import type { Ref } from 'vue'
import { ref, watch } from 'vue'

export function useDebounce<T>(
  value: Ref<T>,
  delay: number = 300,
): Ref<T> {
  const debouncedValue = ref(value.value) as Ref<T>
  let timer: NodeJS.Timeout | null = null

  watch(value, (newValue) => {
    if (timer) {
      clearTimeout(timer)
    }

    timer = setTimeout(() => {
      debouncedValue.value = newValue
    }, delay)
  }, { immediate: true })

  return debouncedValue
}

export function useDebouncedFunction<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300,
): T {
  let timer: NodeJS.Timeout | null = null

  return ((...args: Parameters<T>) => {
    if (timer) {
      clearTimeout(timer)
    }

    timer = setTimeout(() => {
      fn(...args)
    }, delay)
  }) as T
}
