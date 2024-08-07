import ai from './modules/ai'
import freeApi from './modules/freeApi'
import Frontend from './modules/frontend'
import Vue from './modules/vue'
import React from './modules/react'
import Backend from './modules/backend'
import Blog from './modules/blog'
import Developed from './modules/developed'
import OnlineMovie from './modules/online-movie'
import movieCollection from './modules/movie-collection'
import tools from './modules/tools'
import Images from './modules/images'

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
  Frontend,
  Vue,
  React,
  Backend,
  freeApi,
  Blog,
  Developed,
  OnlineMovie,
  movieCollection,
  tools,
  Images,
]

export type { MenuItem }

export default menuDataList
