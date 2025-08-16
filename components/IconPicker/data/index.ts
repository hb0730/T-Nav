import logosIcons from './icons.logos'
import tablerIcons from './icons.tabler'

export interface IconCollection {
  name: string
  prefix: string
  data: string[]
}

// 图标集合
export const iconCollections: IconCollection[] = [
  tablerIcons,
  logosIcons,
]

// 扁平化的图标数据，用于搜索
export const allIcons = iconCollections.reduce((acc, collection) => {
  const icons = collection.data.map(iconKey => {
    // 将 iconify-tabler:robot 转换为 i-tabler-robot
    const iconName = iconKey.replace('iconify-', 'i-').replace(':', '-')
    return {
      name: iconName,
      key: iconKey,
      collection: collection.name,
      prefix: collection.prefix,
      // 从图标名称提取关键词用于搜索
      keywords: iconName.split('-').filter(word => word !== 'i'),
    }
  })
  return [...acc, ...icons]
}, [] as Array<{
  name: string
  key: string
  collection: string
  prefix: string
  keywords: string[]
}>)

// 搜索图标的辅助函数
export function searchIcons(query: string) {
  if (!query.trim()) return allIcons

  const searchTerm = query.toLowerCase()
  return allIcons.filter(icon => {
    return (
      icon.name.toLowerCase().includes(searchTerm) ||
      icon.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm))
    )
  })
}

// 根据分类获取图标
export function getIconsByCollection(collectionName: string) {
  return allIcons.filter(icon => icon.collection === collectionName)
}

// 常用图标（项目中实际使用的）
export const commonIcons = [
  'i-tabler-robot',
  'i-tabler-layout-grid-filled',
  'i-tabler-tool',
  'i-tabler-palette',
  'i-tabler-movie',
  'i-tabler-news',
  'i-tabler-photo',
  'i-tabler-plus',
  'i-tabler-minus',
  'i-tabler-x',
  'i-tabler-check',
  'i-tabler-search',
  'i-tabler-settings',
  'i-tabler-edit',
  'i-tabler-trash',
  'i-logos-vue',
  'i-logos-react',
  'i-logos-javascript',
  'i-logos-typescript',
  'i-logos-nodejs',
].map(iconName => allIcons.find(icon => icon.name === iconName)).filter(Boolean)

export default {
  collections: iconCollections,
  all: allIcons,
  search: searchIcons,
  getByCollection: getIconsByCollection,
  common: commonIcons,
}