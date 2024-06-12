import JavaScript from './modules/JavaScript'
import ai from './modules/ai'
import freeApi from './modules/freeApi'

interface MenuItem {
  title: string
  index?: string
  icon?: Component
  url?: string
  logo?: string
  description?: string
  children?: MenuItem[]
}

const menuDataList: MenuItem[] = [
  ai,
  JavaScript,
  freeApi,
]

export type { MenuItem }

export default menuDataList
