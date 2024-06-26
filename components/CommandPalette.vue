<script setup lang="ts">
import { Search } from '@vicons/tabler'
import type { MenuItem } from '~/data/menu'
import menuDataList from '~/data/menu'
import { useCommand } from '~/composables/useCommand'

const { commandActive, textCommand } = useCommand()
const isModalOpen = ref(false)

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
  traverse(menuDataList)
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
</script>

<template>
  <div class="flex items-center gap-1 flex-1 ">
    <n-button class="c-button" @click="isModalOpen = true">
      <div class="flex items-center  gap-1 text-gray-500 text-sm opacity-50">
        <n-icon>
          <Search />
        </n-icon>
        <span class="ml-2 ">搜索</span>
        <span class="ml-2 border border-current rounded px-[5px] border-solid  sm:inline">{{ textCommand }}</span>
      </div>
    </n-button>

    <n-modal display-directive="if" :show="isModalOpen" class="c-modal" @after-leave="isModalOpen = false" @update-show="isModalOpen = $event">
      <n-card class="modal-content" content-style="padding:12px">
        <n-auto-complete
          v-model:value="searchPattern"
          clear-after-select
          blur-after-select
          :options="searchOptions"
          size="large"
          @select="handleSelect"
        />
      </n-card>
    </n-modal>
  </div>
</template>

<style lang="scss" scoped>
.c-button {
  flex: 1;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  font-size: 14px;
  color: var(--color-text-1);
  background-color: rgba(46, 51, 56, 0.05);
}

.c-modal {
  width: 560px;
  margin-top: 80px;
}
</style>
