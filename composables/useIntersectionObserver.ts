/**
 * Intersection Observer composable for lazy loading
 */
export function useIntersectionObserver() {
  const isSupported = typeof window !== 'undefined' && 'IntersectionObserver' in window

  const observe = (
    target: Element | Ref<Element | undefined>,
    callback: IntersectionObserverCallback,
    options?: IntersectionObserverInit,
  ) => {
    if (!isSupported) {
      // 如果不支持IntersectionObserver，直接触发回调
      callback([{ isIntersecting: true } as IntersectionObserverEntry], null as any)
      return { stop: () => {} }
    }

    const defaultOptions: IntersectionObserverInit = {
      rootMargin: '100px',
      threshold: 0.1,
      ...options,
    }

    const observer = new IntersectionObserver(callback, defaultOptions)

    const targetElement = unref(target)
    if (targetElement) {
      observer.observe(targetElement)
    }

    const stop = () => {
      observer.disconnect()
    }

    return { stop }
  }

  return {
    isSupported,
    observe,
  }
}

/**
 * 懒加载元素 hook
 */
export function useLazyLoad() {
  const { observe } = useIntersectionObserver()

  const createLazyElement = () => {
    const elementRef = ref<HTMLElement>()
    const isLoaded = ref(false)
    let stopObserver: (() => void) | null = null

    // 启动观察器
    const startObserving = (callback: () => void) => {
      if (!elementRef.value || isLoaded.value)
        return

      const { stop } = observe(
        elementRef.value,
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !isLoaded.value) {
              isLoaded.value = true
              callback()
              stop()
            }
          })
        },
        { rootMargin: '200px' },
      )

      stopObserver = stop
    }

    // 清理观察器
    const cleanup = () => {
      if (stopObserver) {
        stopObserver()
        stopObserver = null
      }
    }

    return {
      elementRef,
      isLoaded,
      startObserving,
      cleanup,
    }
  }

  return {
    createLazyElement,
  }
}
