import JavaScript from './modules/javaScript'
import ai from './modules/ai'
import freeApi from './modules/freeApi'
import FrontEnd from './modules/frontEnd'
import Blog from './modules/blog'
import Developed from './modules/developed'
import OnlineMovie from './modules/online-movie'
import movieCollection from './modules/movie-collection'

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
  Blog,
  Developed,
  OnlineMovie,
  movieCollection,

]

export type { MenuItem }

export default menuDataList
