import type { IconCollection } from './types'

export interface IconData {
  name: string
  key: string
  collection: string
  prefix: string
  keywords: string[]
}

// 懒加载图标集合
const iconCollectionLoaders = {
  'Tabler Icons': () => import('./icons.tabler'),
  'Logos': () => import('./icons.logos'),
}

// 已加载的图标集合缓存
const loadedCollections = new Map<string, IconCollection>()
const processedIcons = new Map<string, IconData[]>()

// 异步加载图标集合
export async function loadIconCollection(collectionName: string): Promise<IconCollection> {
  if (loadedCollections.has(collectionName)) {
    return loadedCollections.get(collectionName)!
  }

  const loader = iconCollectionLoaders[collectionName as keyof typeof iconCollectionLoaders]
  if (!loader) {
    throw new Error(`Unknown icon collection: ${collectionName}`)
  }

  const module = await loader()
  const collection = module.default
  loadedCollections.set(collectionName, collection)
  return collection
}

// 处理图标数据
function processIconData(collection: IconCollection): IconData[] {
  return collection.data.map((iconKey) => {
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
}

// 获取处理后的图标数据
export async function getProcessedIcons(collectionName: string): Promise<IconData[]> {
  if (processedIcons.has(collectionName)) {
    return processedIcons.get(collectionName)!
  }

  const collection = await loadIconCollection(collectionName)
  const processed = processIconData(collection)
  processedIcons.set(collectionName, processed)
  return processed
}

// 同步获取图标集合信息（不包含数据）
export const iconCollections: Pick<IconCollection, 'name' | 'prefix'>[] = [
  { name: 'Tabler Icons', prefix: 'iconify-tabler' },
  { name: 'Logos', prefix: 'iconify-logos' },
]

// 延迟初始化的全部图标
let _allIcons: IconData[] | null = null

export async function getAllIcons(): Promise<IconData[]> {
  if (_allIcons)
    return _allIcons

  const collections = await Promise.all([
    getProcessedIcons('Tabler Icons'),
    getProcessedIcons('Logos'),
  ])

  _allIcons = collections.flat()
  return _allIcons
}

// 搜索图标的辅助函数
export async function searchIcons(query: string): Promise<IconData[]> {
  if (!query.trim()) {
    return await getAllIcons()
  }

  const allIcons = await getAllIcons()
  const searchTerm = query.toLowerCase()
  return allIcons.filter((icon) => {
    return (
      icon.name.toLowerCase().includes(searchTerm)
      || icon.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm))
    )
  })
}

// 根据分类获取图标
export async function getIconsByCollection(collectionName: string): Promise<IconData[]> {
  if (collectionName === 'all') {
    return await getAllIcons()
  }
  return await getProcessedIcons(collectionName)
}

// 常用图标（项目中实际使用的）
const commonIconNames = [
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
]

export async function getCommonIcons(): Promise<IconData[]> {
  const allIcons = await getAllIcons()
  return commonIconNames
    .map(iconName => allIcons.find(icon => icon.name === iconName))
    .filter((icon): icon is IconData => Boolean(icon))
}

// 向后兼容的同步API（已弃用）
export const allIcons: IconData[] = []
export const commonIcons: IconData[] = []

export default {
  collections: iconCollections,
  getAllIcons,
  searchIcons,
  getIconsByCollection,
  getCommonIcons,
}
