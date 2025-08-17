# IconPicker 组件使用说明

IconPicker 是一个高性能的图标选择器组件，支持大量Iconify在线图标的高效浏览和搜索。

## 特性

- 🚀 **高性能**：虚拟滚动技术，支持数万图标流畅浏览
- 🔍 **智能搜索**：防抖搜索，支持关键词匹配
- 💾 **智能缓存**：LRU缓存机制，优化重复访问
- 🌐 **在线图标**：使用Iconify丰富的图标库
- ⌨️ **键盘导航**：完整的键盘操作支持
- ♿ **无障碍**：完善的ARIA标签和屏幕阅读器支持
- 🎨 **主题适配**：支持暗色/亮色主题

## 基本使用

```vue
<template>
  <div>
    <IconPicker v-model="selectedIcon" />
    <div>选中的图标：{{ selectedIcon }}</div>
    <TheIcon :icon="selectedIcon" class="text-2xl" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import IconPicker from '~/components/IconPicker/index.vue'
import TheIcon from '~/components/TheIcon/index.vue'

const selectedIcon = ref('iconify-tabler:robot')
</script>
```

## 图标格式说明

IconPicker 使用 Iconify 在线图标格式：

- **格式**：`iconify-{prefix}:{name}`
- **示例**：
  - `iconify-tabler:robot`
  - `iconify-logos:vue`
  - `iconify-mdi:heart`
- **优点**：
  - 图标库完整，包含数十万个图标
  - 无需本地配置图标文件
  - 自动优化和缓存
- **要求**：需要网络连接加载图标

## 配合 TheIcon 组件使用

IconPicker 与 TheIcon 组件完美配合，TheIcon 会自动识别 `iconify-` 前缀并使用在线图标：

```vue
<template>
  <!-- TheIcon 自动识别 iconify- 前缀使用在线图标 -->
  <TheIcon :icon="selectedIcon" class="text-xl" />
</template>

<script setup>
const selectedIcon = ref('iconify-tabler:robot')
</script>
```

## 键盘操作

- `方向键`：导航选择图标
- `Home/End`：跳转到开始/结束
- `Enter/Space`：选择当前图标
- `Escape`：取消选择

## 性能优化

### 虚拟滚动
- 只渲染可见区域的图标，显著减少DOM节点
- 支持数万图标的流畅滚动

### 智能缓存
- LRU缓存策略，避免重复加载图标数据
- 自动清理过期缓存，控制内存占用

### 懒加载
- 按需加载图标集合数据
- 减少初始加载时间

### 防抖搜索
- 300ms防抖，减少不必要的计算
- 缓存搜索结果，提升响应速度

### Iconify优化
- TheIcon组件自动处理图标缓存
- 按需加载，只请求实际使用的图标

## 扩展图标库

如需添加新的图标集合：

1. 在 `data/` 目录下添加新的图标数据文件
2. 更新 `data/index.ts` 中的加载器配置
3. 更新类型定义

```typescript
// data/icons.custom.ts
export default {
  name: "Custom Icons",
  prefix: "custom",
  data: ["custom:icon1", "custom:icon2"]
}

// data/index.ts
const iconCollectionLoaders = {
  'Custom Icons': () => import('./icons.custom'),
  // ...
}
```

## 最佳实践

1. **合理配置图标库**：只加载项目需要的图标集合
2. **使用预设图标**：为常用图标创建快捷选择
3. **配合 TheIcon**：统一的图标显示组件
4. **网络优化**：Iconify会自动缓存图标，提升二次加载速度

## 故障排除

### 图标不显示

- 检查图标名称格式是否正确（`iconify-prefix:name`）
- 确认网络连接正常
- 检查控制台是否有网络错误

### 性能问题

- 检查是否启用了虚拟滚动
- 清理浏览器缓存重试
- 考虑减少同时加载的图标集合

### 网络问题

- IconPicker依赖 Iconify CDN
- 确保网络可以访问 `api.iconify.design`
- 考虑使用CDN加速或代理