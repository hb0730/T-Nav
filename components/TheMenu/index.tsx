import { getImageUrl, isImageUrl } from '~/composables/useImageUtils'
import TheIcon from '../TheIcon'

interface MenuItem {
  title: string
  icon?: string
  url?: string
  logo?: string
  description?: string
  deprecated?: boolean
  children?: MenuItem[]
  tags?: string[]
}

export default defineComponent({
  name: 'TheMenu',
  props: {
    modelValue: {
      type: Array as PropType<MenuItem[]>,
      default: () => [],
    },
  },
  setup(props) {
    const { isSmallScreen, toggleNavCollapse } = useGlobal()
    const requestUrl = useRequestURL()

    // 在 setup 中获取 inject 的值
    const scrollToCategory = inject('scrollToCategory', null) as ((categoryTitle: string) => void) | null

    // 是否为首页
    const index = computed(() => requestUrl.pathname === '/')

    /**
     * @description 点击a标签, 如果为首页则不跳转
     */
    function aTagClick(e: Event) {
      if (index.value) {
        e.preventDefault()
      }
    }

    /**
     * @description 点击菜单 - 支持滚动加载模式
     */
    function handleMenuItemClick(key: string) {
      if (scrollToCategory) {
        // 使用滚动加载模式
        scrollToCategory(key)
      }
      else {
        // 使用传统的DOM滚动模式
        const el = document.getElementById(key)
        if (el) {
          const contentElement = document.getElementsByClassName('c-content')[0]?.firstElementChild
          if (contentElement) {
            contentElement.scrollTo({
              top: el.offsetTop - (document.getElementById('navbar')?.offsetHeight ?? 0),
              behavior: 'smooth',
            })
          }
        }
        else {
          console.warn(`无法找到锚点元素: ${key}`)
        }
      }

      // 判断是否移动端，如果是移动端跳转则自动收缩menu
      if (isSmallScreen.value) {
        toggleNavCollapse()
      }
    }

    const menuOptions = computed(() => {
      return props.modelValue.map((item) => {
        // 使用新的图片工具函数判断
        const isIcon = item.icon ? isImageUrl(item.icon) : false
        const defaultIcon = item.icon ? item.icon : 'i-tabler-layout-grid-filled'
        const iconSrc = isIcon && item.icon ? getImageUrl(item.icon) : ''

        return {
          key: item.title,
          // 两者滚动动画不同
          label: () => h('a', { href: `${index.value ? '' : '/'}#${item.title}`, onClick: aTagClick }, item.title),
          icon: () => h(TheIcon, { icon: isIcon ? '' : defaultIcon, src: iconSrc }),
        }
      })
    })

    onMounted(() => {
      const hash = requestUrl?.hash
      if (hash) {
        // 解码 url解码
        const decodeHash = decodeURIComponent(hash.slice(1))
        handleMenuItemClick(decodeHash)
      }
    })

    return () => (
      <>
        <div class="h-full" overflow="auto">
          <n-menu
            options={menuOptions.value}
            collapsed-width={64}
            icon-size={25}
            onUpdate:value={handleMenuItemClick}
          />
        </div>
      </>
    )
  },
})
