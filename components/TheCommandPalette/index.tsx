import { useCommandPalette } from '~/composables/useCommandPalette'
import { useMenuData } from '~/composables/useMenuData'

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
  name: 'TheCommandPalette',
  setup() {
    const { commandActive, textCommand } = useCommandPalette()
    const { menuData, fetchMenuData } = useMenuData()
    const isModalOpen = ref(false)

    // 初始化时获取菜单数据
    onMounted(() => {
      fetchMenuData()
    })

    // 将menu压缩为一级
    const flattenedDocOptionsRef = computed(() => {
      const flattenedItems: MenuItem[] = []
      const traverse = (items: MenuItem[]) => {
        if (!items)
          return
        items.forEach((item) => {
          if (item.children)
            traverse(item.children)
          else flattenedItems.push(item)
        })
      }
      traverse(menuData.value)
      return flattenedItems
    })
    // match substr
    function match(pattern: string, str: string) {
      if (!pattern.length)
        return true
      if (!str.length)
        return false
      if (pattern[0] === str[0])
        return match(pattern.slice(1), str.slice(1))
      return match(pattern, str.slice(1))
    }

    // search
    const searchPattern = ref('')
    const searchOptions = computed(() => {
      function getSearchableContent(item: MenuItem, isAppendTags = true) {
        let tags = ''
        item.tags?.forEach((tag) => {
          tags += ` ${tag}`
        })
        if (isAppendTags)
          return item.title + (tags ? ` ${tags}` : '')
        else
          return item.title
      }

      if (!searchPattern.value)
        return []

      const replaceRegex = / |-/g

      return flattenedDocOptionsRef.value.filter((item) => {
        const pattern = searchPattern.value
          .toLowerCase()
          .replace(replaceRegex, '')
          .slice(0, 20)
        const label = getSearchableContent(item)
          .toLowerCase()
          .replace(replaceRegex, '')
        return match(pattern, label)
      }).map(item => ({
        label: getSearchableContent(item, false),
        value: item.title,
      }))
    })

    function handleSelect(value: string) {
      isModalOpen.value = false
      document.getElementById(value)?.scrollIntoView()
    }
    watch(commandActive, () => {
      isModalOpen.value = true
    })

    watch(isModalOpen, () => {
      if (!isModalOpen.value)
        searchPattern.value = ''
    })
    return () => (
      <>
        <div class="flex items-center gap-1 flex-1">
          <n-button class="flex-1 flex justify-start items-center text-4" overflow="hidden" bg="#2e33380d" onClick={() => isModalOpen.value = true}>
            <div class="flex items-center  gap-1 text-gray-500 text-sm opacity-50">
              <i class="i-tabler-search text-4"></i>
              <span class="ml-2 ">搜索</span>
              <span class="ml-2 border border-current rounded px-[5px] border-solid  sm:inline">{textCommand.value}</span>
            </div>
          </n-button>
          {isModalOpen.value && (
            <n-modal
              display-directive="if"
              show={isModalOpen.value}
              class="w-screen-md m-t-20"
              onAfterLeave={() => isModalOpen.value = false}
              onUpdateShow={(value: boolean) => isModalOpen.value = value}
            >
              <n-card content-style="padding:12px">
                <n-auto-complete
                  v-model:value={searchPattern.value}
                  options={searchOptions.value}
                  size="large"
                  onSelect={handleSelect}
                >
                </n-auto-complete>
              </n-card>
            </n-modal>
          )}
        </div>
      </>
    )
  },
})
