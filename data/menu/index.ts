import JavaScript from './modules/javaScript'
import ai from './modules/ai'
import freeApi from './modules/freeApi'
import FrontEnd from './modules/frontEnd'

interface MenuItem {
  /**
   * 标题
   */
  title: string
  /**
   * 图标
   */
  icon?: Component
  /**
   * 链接地址
   */
  url?: string
  /**
   * logo
   */
  logo?: string
  /**
   * 描述
   */
  description?: string
  /**
   *
   */
  children?: MenuItem[]
  /**
   * 标签
   */
  tags?: string[]
}

const menuDataList: MenuItem[] = [
  ai,
  FrontEnd,
  JavaScript,
  freeApi,
]

export type { MenuItem }

export default menuDataList
