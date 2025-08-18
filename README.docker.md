# Docker 部署指南

## 快速开始

### 使用 Docker Compose（推荐）

```bash
# 1. 克隆项目
git clone <your-repo-url>
cd t-nav

# 2. 设置环境变量
cp .env.example .env
# 编辑 .env 文件，设置 JWT_SECRET

# 3. 启动服务
docker-compose up -d

# 4. 查看日志
docker-compose logs -f
```

### 使用 Docker 命令

```bash
# 1. 构建镜像
docker build -t t-nav .

# 2. 运行容器
docker run -d \
  --name t-nav \
  -p 3030:3030 \
  -v t-nav-data:/app/data \
  -e JWT_SECRET=your-secret-key \
  t-nav

# 3. 查看日志
docker logs -f t-nav
```

## 数据持久化

数据库文件存储在 `/app/data/t-nav.db`，通过 Docker volume 持久化：

```bash
# 查看数据 volume
docker volume ls | grep t-nav

# 备份数据
docker run --rm -v t-nav-data:/data -v $(pwd):/backup alpine tar czf /backup/t-nav-backup.tar.gz -C /data .

# 恢复数据
docker run --rm -v t-nav-data:/data -v $(pwd):/backup alpine tar xzf /backup/t-nav-backup.tar.gz -C /data
```

## 环境变量

| 变量名         | 默认值                    | 说明                 |
| -------------- | ------------------------- | -------------------- |
| `DATABASE_URL` | `file:/app/data/t-nav.db` | 数据库连接字符串     |
| `JWT_SECRET`   | `your-secret-key`         | JWT 密钥（必须修改） |
| `NODE_ENV`     | `production`              | 运行环境             |
| `PORT`         | `3030`                    | 服务端口             |

## 健康检查

容器包含健康检查，可以通过以下方式查看：

```bash
# 查看容器健康状态
docker ps

# 查看健康检查详情
docker inspect --format='{{json .State.Health}}' t-nav
```

## 故障排除

### 常见问题

1. **容器启动失败**

   ```bash
   # 查看详细日志
   docker logs t-nav

   # 检查环境变量
   docker exec t-nav env | grep -E "(DATABASE_URL|JWT_SECRET)"
   ```

2. **数据库初始化失败**

   ```bash
   # 进入容器检查
   docker exec -it t-nav sh
   ls -la /app/data/
   cat /app/prisma/schema.prisma
   ```

3. **端口冲突**
   ```bash
   # 修改端口映射
   docker run -p 8080:3030 t-nav
   ```

### 数据库管理

```bash
# 进入容器执行数据库操作
docker exec -it t-nav sh

# 运行 Prisma 命令
npx prisma studio --schema=/app/prisma/schema.prisma
npx prisma db push --schema=/app/prisma/schema.prisma
```

## 生产环境建议

1. **使用 Docker Compose** - 便于管理和扩展
2. **设置强密码** - 修改 `JWT_SECRET` 为复杂密码
3. **定期备份** - 使用上述备份命令定期备份数据
4. **监控日志** - 监控容器运行状态和错误日志
5. **反向代理** - 使用 Nginx 或 Traefik 作为反向代理

## 开发环境

如果需要在 Docker 中进行开发：

```bash
# 开发模式 docker-compose
version: '3.8'
services:
  t-nav-dev:
    build:
      context: .
      target: builder
    ports:
      - "3000:3000"
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
    command: pnpm dev
```
