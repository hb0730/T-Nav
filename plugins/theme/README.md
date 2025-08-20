# 主题切换插件

一个高性能的 Nuxt 3 主题切换插件，解决主题闪烁和页面刷新问题。

## 功能特性

- ✅ **无闪烁切换**: 预渲染主题状态，避免服务端与客户端主题不一致
- ✅ **统一管理**: 通过插件统一管理所有主题相关逻辑
- ✅ **性能优化**: 批量 DOM 更新，减少重排重绘
- ✅ **跨标签页同步**: 自动同步多个标签页的主题状态
- ✅ **系统主题跟随**: 支持自动跟随系统深色/浅色模式
- ✅ **简化 API**: 统一的主题切换接口，减少代码复杂度

## 架构设计

```
plugins/theme/
├── core/
│   ├── ThemeCore.ts      # 核心主题管理类
│   ├── ThemeStorage.ts   # 存储管理类（Cookie/LocalStorage）
│   └── ThemeDOM.ts       # DOM 操作类
├── composables/
│   └── useThemePlugin.ts # 简化的 Composable
├── index.ts              # 主插件入口
├── client.ts             # 客户端初始化
└── README.md             # 使用文档
```

## 快速使用

### 1. 在组件中使用

```vue
<script setup lang="ts">
import { useThemePlugin } from '~/plugins/theme/composables/useThemePlugin'

const { 
  isDark,           // 当前是否为深色主题
  theme,            // Naive UI 主题对象
  themeOverrides,   // Naive UI 主题覆盖配置
  themeInfo,        // 主题信息（图标、标签等）
  setTheme,         // 设置主题方法
  toggleTheme,      // 切换主题方法
  loaded            // 主题是否已加载
} = useThemePlugin()
</script>

<template>
  <n-config-provider 
    :theme="theme" 
    :theme-overrides="themeOverrides"
  >
    <!-- 你的应用内容 -->
  </n-config-provider>
</template>
```

### 2. 主题切换按钮

```vue
<script setup lang="ts">
import { useThemePlugin } from '~/plugins/theme/composables/useThemePlugin'

const { themeInfo, setTheme, toggleTheme } = useThemePlugin()

// 手动设置主题
function setLightTheme() {
  setTheme('light')
}

function setDarkTheme() {
  setTheme('dark')
}

function setSystemTheme() {
  setTheme('system')
}
</script>

<template>
  <n-button @click="toggleTheme">
    <i :class="themeInfo.icon" />
    {{ themeInfo.label }}
  </n-button>
</template>
```

## API 文档

### useThemePlugin()

返回主题相关的响应式状态和方法：

#### 响应式状态
- `loaded: Ref<boolean>` - 主题是否已加载完成
- `isDark: Ref<boolean>` - 当前是否为深色主题
- `themePreference: Ref<'light' | 'dark' | 'system'>` - 用户主题偏好设置
- `actualTheme: Ref<'light' | 'dark'>` - 实际生效的主题

#### 计算属性
- `theme: ComputedRef<Theme | undefined>` - Naive UI 主题对象
- `themeOverrides: ComputedRef<GlobalThemeOverrides>` - Naive UI 主题覆盖配置
- `themeInfo: ComputedRef<ThemeInfo>` - 主题显示信息

#### 方法
- `setTheme(mode: 'light' | 'dark' | 'system'): void` - 设置主题模式
- `toggleTheme(): void` - 循环切换主题（light → dark → system）

#### ThemeInfo 接口
```typescript
interface ThemeInfo {
  preference: 'light' | 'dark' | 'system'  // 用户偏好设置
  actual: 'light' | 'dark'                 // 实际主题
  icon: string                             // 显示图标类名
  label: string                            // 显示标签
}
```

## 核心类说明

### ThemeCore
主题核心管理类，采用单例模式，负责：
- 统一管理主题状态
- 协调存储和 DOM 操作
- 处理系统主题变化
- 跨标签页同步

### ThemeStorage
存储管理类，负责：
- Cookie 和 LocalStorage 操作
- 服务端主题状态检测
- 系统主题偏好获取
- 跨标签页事件触发

### ThemeDOM
DOM 操作类，负责：
- 批量 DOM 更新优化
- 主题切换动画处理
- 防闪烁脚本生成
- 样式预加载

## 插件配置

在 `nuxt.config.ts` 中已自动配置：

```typescript
export default defineNuxtConfig({
  plugins: [
    '~/plugins/theme/index.ts',      // 主插件
    '~/plugins/theme/client.ts',     // 客户端初始化
  ],
})
```

## 性能优化

1. **批量 DOM 更新**: 使用 `requestAnimationFrame` 批量执行 DOM 操作
2. **预渲染脚本**: 内联脚本在页面加载前设置主题状态
3. **单例模式**: 避免重复创建主题管理实例
4. **事件节流**: 合理控制事件监听器数量

## 迁移指南

### 从原 useTheme 迁移

**之前:**
```typescript
import { useTheme } from '~/composables/useTheme'
const { theme, themeOverrides, isDark, setTheme } = useTheme()
```

**现在:**
```typescript
import { useThemePlugin } from '~/plugins/theme/composables/useThemePlugin'
const { theme, themeOverrides, isDark, setTheme } = useThemePlugin()
```

### 移除重复配置

插件会自动处理以下配置，无需在组件中重复设置：
- ✅ 主题初始化脚本已内置
- ✅ DOM 更新已优化
- ✅ 跨标签页同步已集成
- ✅ 路由切换同步已处理

## 故障排除

### 1. 主题闪烁问题
确保插件已正确注册到 `nuxt.config.ts` 中。

### 2. 服务端渲染不一致
检查 Cookie 设置是否正确，确保 `sameSite` 设置为 `lax`。

### 3. 跨标签页不同步
确保浏览器支持 `storage` 事件，某些隐私模式下可能被禁用。

## 浏览器兼容性

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+

## 更新记录

### v1.0.0
- 初始版本
- 支持无闪烁主题切换
- 统一的 API 接口
- 性能优化