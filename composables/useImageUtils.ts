/**
 * 图片工具函数
 */

/**
 * 检查给定值是否为图片URL或路径
 */
export function isImageUrl(value: string): boolean {
  if (!value)
    return false

  return (
    value.startsWith('http')
    || value.startsWith('https')
    || value.startsWith('/')
    || value.startsWith('data:image')
    || value.includes('.png')
    || value.includes('.jpg')
    || value.includes('.jpeg')
    || value.includes('.gif')
    || value.includes('.svg')
    || value.includes('.webp')
    || value.includes('.ico')
  )
}

/**
 * 检查给定值是否为图标类名
 */
export function isIconClass(value: string): boolean {
  if (!value)
    return false

  return (
    value.startsWith('i-')
    || value.includes('icon')
    || value.includes('fa-')
    || !isImageUrl(value)
  )
}

/**
 * 获取图片的完整URL
 * 对于相对路径，确保它们以正确的格式返回
 * 自动处理 /assets/imgs/ 到 /imgs/ 的路径转换
 */
export function getImageUrl(path: string): string {
  if (!path)
    return ''

  // 如果已经是完整的URL，直接返回
  if (path.startsWith('http') || path.startsWith('data:')) {
    return path
  }

  // 处理旧的 assets 路径，转换为新的 public 路径
  if (path.startsWith('/assets/imgs/')) {
    return path.replace('/assets/imgs/', '/imgs/')
  }

  // 如果路径包含 assets/imgs/ 但不是以 / 开头
  if (path.includes('assets/imgs/')) {
    return path.replace('assets/imgs/', '/imgs/')
  }

  // 如果是相对路径但不以/开头，添加/
  if (!path.startsWith('/')) {
    return `/${path}`
  }

  return path
}

/**
 * 主要的图片工具composable
 */
export function useImageUtils() {
  return {
    isImageUrl,
    isIconClass,
    getImageUrl,
    useImageLoader,
  }
}

/**
 * 创建一个响应式的图片加载状态
 */
export function useImageLoader(src: Ref<string> | string) {
  const loading = ref(false)
  const error = ref(false)
  const loaded = ref(false)

  const imageUrl = computed(() => {
    const url = unref(src)
    return isImageUrl(url) ? getImageUrl(url) : null
  })

  const handleLoad = () => {
    loading.value = false
    error.value = false
    loaded.value = true
  }

  const handleError = () => {
    loading.value = false
    error.value = true
    loaded.value = false
  }

  const startLoading = () => {
    loading.value = true
    error.value = false
    loaded.value = false
  }

  watch(imageUrl, () => {
    if (imageUrl.value) {
      startLoading()
    }
  }, { immediate: true })

  return {
    imageUrl,
    loading: readonly(loading),
    error: readonly(error),
    loaded: readonly(loaded),
    handleLoad,
    handleError,
  }
}
