// 生产环境配置
export default defineNuxtConfig({
  // 继承基础配置
  extends: './nuxt.config.ts',

  // 生产环境特定配置
  nitro: {
    preset: 'node-server',
    compressPublicAssets: {
      gzip: true,
      brotli: true,
    },
    minify: true,
    // 缓存配置
    routeRules: {
      '/': { prerender: true, headers: { 'cache-control': 's-maxage=3600' } },
      '/api/**': { cors: true, headers: { 'cache-control': 'max-age=300' } },
      '/admin/**': { ssr: true, index: false },
    },
    // 预渲染路由
    prerender: {
      concurrency: 16,
      routes: ['/'],
    },
    experimental: {
      wasm: true,
    },
  },

  // 构建优化
  build: {
  },

  // 运行时配置
  runtimeConfig: {
    // 私有配置（仅在服务端可用）
    jwtSecret: process.env.JWT_SECRET || 'your-production-jwt-secret-key',
  },

  // 安全配置
  security: {
    headers: {
      crossOriginEmbedderPolicy: 'require-corp',
      crossOriginOpenerPolicy: 'same-origin',
      crossOriginResourcePolicy: 'same-origin',
      originAgentCluster: '?1',
      referrerPolicy: 'no-referrer',
      strictTransportSecurity: 'max-age=15552000; includeSubDomains',
      xContentTypeOptions: 'nosniff',
      xDNSPrefetchControl: 'off',
      xDownloadOptions: 'noopen',
      xFrameOptions: 'SAMEORIGIN',
      xPermittedCrossDomainPolicies: 'none',
      xXSSProtection: '1; mode=block',
    },
  },

  // 性能优化
  experimental: {
    payloadExtraction: false,
    renderJsonPayloads: true,
    typedPages: true,
  },

  // 开发工具（生产环境禁用）
  devtools: { enabled: false },

  // 调试（生产环境禁用）
  debug: false,
})
