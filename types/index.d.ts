declare module 'nuxt/schema' {
  interface AppConfig {
    /**
     * 站点标题
     */
    siteTitle?: string
    /**
     * 站点描述
     */
    siteDescription?: string
    /**
     * 站点关键字
     */
    siteKeywords?: string
    /**
     * 站点作者
     */
    siteAuthor?: string
    /**
     * 站点作者 url,可以是 github 地址，也可以是个人网站
     */
    siteAuthorLink?: string
    /**
     * 站点 url
     */
    siteUrl: string
    /**
     * 站点图标
     */
    siteIcon?: string
    /**
     * 站点logo
     */
    siteLogo?: string
    /**
     * 备案号
     */
    siteICP?: string
  }
}
// It is always important to ensure you import/export something when augmenting a type
export {}
