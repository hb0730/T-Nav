# T-Nav 导航网站

专门为开发者和技术爱好者设计的导航网站，基于 Nuxt 3 构建，提供分类管理、链接收藏、友情链接等功能。
|||
|----|----|
|![s1](./screenshots//s1.png)|![s2](./screenshots/s2.png)|

## ✨ 特性

### 核心功能

- 🗂️ **分类管理** - 灵活的分类系统，支持图标和排序
- 🔗 **链接管理** - 链接收藏和管理，支持标签、描述等元信息
- 👥 **友情链接** - 友情链接展示和管理
- 📝 **申请系统** - 支持链接和友情链接的在线申请和审核
- ⚙️ **站点配置** - 灵活的站点信息配置

### 数据管理

- 📦 **备份与恢复** - 完整的数据备份和恢复功能
- 📤 **数据导出** - 支持分类和链接数据的JSON格式导出
- 📥 **数据导入** - 支持批量导入分类和链接数据
- 🔄 **智能更新** - 导入时自动识别和更新现有数据

### 用户体验

- 🎨 **现代化界面** - 基于 Naive UI 的现代化管理界面
- 🌙 **主题切换** - 支持明暗主题切换
- 📱 **响应式设计** - 完美适配各种设备
- 🔍 **搜索功能** - 快速搜索和定位内容
- ⌨️ **快捷键支持** - 支持键盘快捷键操作

## 🚀 快速开始

### 环境要求

- Node.js 18+
- pnpm (推荐) 或 npm/yarn

### 安装依赖

```bash
pnpm install
```

### 初始化数据库

```bash
# 生成 Prisma 客户端
pnpm run db:generate

# 推送数据库结构
pnpm run db:push

# 初始化种子数据
pnpm run db:seed
```

### 开发模式

```bash
pnpm run dev
```

访问 http://localhost:3000

### 生产部署

```bash
# 构建项目
pnpm run build

# 预览构建结果
pnpm run preview
```

## 📁 项目结构

```
├── assets/           # 静态资源
├── components/       # Vue 组件
├── composables/      # 组合式函数
├── layouts/          # 布局文件
├── pages/            # 页面文件
│   ├── admin/        # 管理后台页面
│   ├── index.vue     # 首页
│   └── ...
├── server/           # 服务端 API
│   ├── api/          # API 路由
│   └── ...
├── types/            # TypeScript 类型定义
├── prisma/           # 数据库相关
│   ├── schema.prisma # 数据库模型
│   └── ...
└── ...
```

## 🎛️ 管理功能

### 访问管理后台

1. 访问 `/admin` 或 `/login` 页面
2. 使用管理员账号登录
3. 默认账号：`admin` / `123456`

### 主要管理功能

#### 分类管理 (`/admin/categories`)

- ➕ 创建、编辑、删除分类
- 🎨 设置分类图标和排序
- 📤 导出分类数据为 JSON 格式
- 📥 从 JSON 文件批量导入分类

#### 链接管理 (`/admin/links`)

- ➕ 添加、编辑、删除链接
- 🏷️ 设置标签、描述等元信息
- 📂 按分类筛选和管理
- 📤 导出链接数据（支持全部或按分类导出）
- 📥 从 JSON 文件批量导入链接
- 🌐 自动获取网站图标和信息

#### 友情链接管理 (`/admin/friends`)

- 👥 管理友情链接展示
- ⚙️ 设置链接排序和状态

#### 申请审核 (`/admin/submissions`)

- 📝 审核链接申请
- 👥 审核友情链接申请
- ✅ 批准或拒绝申请

#### 数据备份 (`/admin/backup`)

- 📦 导出完整的站点数据（JSON 格式）
- 🔄 从备份文件恢复数据
- ⚠️ 支持安全的数据恢复（保留用户数据）

#### 站点配置 (`/admin/site-config`)

- 🏠 设置站点基本信息
- 🎨 配置站点外观
- 📧 设置联系信息

## 📊 数据导入导出

### 导出数据

#### 分类数据导出

```bash
# 通过管理界面
访问 /admin/categories，点击"导出分类"按钮

# 通过 API
GET /api/admin/categories/export
```

#### 链接数据导出

```bash
# 导出全部链接
GET /api/admin/links/export

# 按分类导出
GET /api/admin/links/export?categoryId=分类ID
```

#### 完整数据备份

```bash
# 通过管理界面
访问 /admin/backup，点击"导出数据"按钮

# 通过 API
GET /api/admin/backup/export-data
```

### 导入数据

#### 分类数据导入

- 访问 `/admin/categories`
- 点击"导入分类"按钮
- 选择之前导出的 JSON 文件
- 系统会自动识别和更新现有分类

#### 链接数据导入

- 访问 `/admin/links`
- 点击"导入链接"按钮
- 选择之前导出的 JSON 文件
- 系统会验证分类存在性并智能更新

#### 完整数据恢复

- 访问 `/admin/backup`
- 在"数据恢复"区域选择备份文件
- 确认恢复操作（会清空现有业务数据）

### 数据格式说明

导出的 JSON 文件包含完整的数据结构和元信息：

```json
{
  "categories": [...],        // 分类数据
  "links": [...],            // 链接数据（包含分类关联信息）
  "exportedAt": "2025-01-01T00:00:00.000Z",
  "total": 10
}
```

## 🛠️ 开发相关

### 数据库操作

```bash
# 查看数据库
pnpm run db:studio

# 数据库迁移
pnpm run db:migrate

# 重置数据库
pnpm run db:push
```

### 代码规范

```bash
# 代码检查
pnpm run lint

# 自动修复
pnpm run lint:fix
```

## 🐳 Docker 部署

```bash
# 构建镜像
docker build -t t-nav .

# 运行容器
docker run -p 3000:3000 t-nav
```

或使用 Docker Compose：

```bash
docker-compose up -d
```

## 📄 API 文档

### 核心 API

- `GET /api/categories` - 获取分类列表
- `GET /api/links` - 获取链接列表
- `GET /api/friends` - 获取友情链接
- `GET /api/menu` - 获取菜单数据

### 管理 API

- `POST /api/admin/categories` - 创建分类
- `PUT /api/admin/categories/:id` - 更新分类
- `DELETE /api/admin/categories/:id` - 删除分类
- `GET /api/admin/categories/export` - 导出分类数据
- `POST /api/admin/categories/import` - 导入分类数据

### 备份 API

- `GET /api/admin/backup/export-data` - 导出完整数据
- `POST /api/admin/backup/restore` - 恢复数据

## 📋 技术栈

- **框架**: Nuxt 3
- **UI 库**: Naive UI
- **样式**: UnoCSS + SCSS
- **数据库**: SQLite + Prisma ORM
- **认证**: JWT
- **图标**: Iconify (Tabler Icons)
- **部署**: Docker

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📜 许可证

MIT License
