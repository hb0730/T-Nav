import type { Ref } from 'vue'
import { computed, ref } from 'vue'

interface VirtualListOptions {
  itemHeight: number
  containerHeight: number
  overscan?: number
}

export function useVirtualList<T>(
  items: Ref<T[]>,
  options: VirtualListOptions,
) {
  const { itemHeight, containerHeight, overscan = 5 } = options

  const scrollTop = ref(0)
  const containerRef = ref<HTMLElement>()

  // 可见区域计算
  const visibleCount = Math.ceil(containerHeight / itemHeight)

  const visibleRange = computed(() => {
    const start = Math.floor(scrollTop.value / itemHeight)
    const end = Math.min(start + visibleCount, items.value.length)

    return {
      start: Math.max(0, start - overscan),
      end: Math.min(items.value.length, end + overscan),
    }
  })

  // 可见项目
  const visibleItems = computed(() => {
    const { start, end } = visibleRange.value
    return items.value.slice(start, end).map((item, index) => ({
      item,
      index: start + index,
    }))
  })

  // 滚动容器总高度
  const totalHeight = computed(() => items.value.length * itemHeight)

  // 偏移量
  const offsetY = computed(() => visibleRange.value.start * itemHeight)

  // 滚动事件处理
  const handleScroll = (e: Event) => {
    const target = e.target as HTMLElement
    scrollTop.value = target.scrollTop
  }

  // 滚动到指定项目
  const scrollToItem = (index: number) => {
    if (containerRef.value) {
      const targetScrollTop = index * itemHeight
      containerRef.value.scrollTop = targetScrollTop
      scrollTop.value = targetScrollTop
    }
  }

  return {
    containerRef,
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
    scrollToItem,
    visibleRange,
  }
}
