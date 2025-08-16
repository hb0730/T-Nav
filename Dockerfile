FROM node:22-alpine3.21 AS builder

WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm@10.14.0

# 优化层缓存，先复制依赖文件
COPY package.json pnpm-lock.yaml ./
COPY prisma/schema.prisma ./prisma/

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 生成 Prisma Client 并构建
RUN pnpm db:generate && pnpm build

FROM node:22-alpine3.21 AS runner

WORKDIR /app

# 安装运行时依赖
RUN apk add --no-cache dumb-init

# 复制构建产物和必要文件
COPY --from=builder /app/.output/ ./
COPY --from=builder /app/prisma/ ./prisma/
COPY --from=builder /app/docker/entrypoint.sh ./entrypoint.sh

# 修复 entrypoint.sh 权限并创建数据库目录
RUN chmod +x entrypoint.sh 

# 全局安装 prisma（使用最新版本匹配 package.json）
RUN npm install -g prisma@^6.13.0

# 环境变量配置
ENV DATABASE_URL="file:/app/prisma/db/t-nav.db" \
    JWT_SECRET="your-secret-key" \
    NODE_ENV="production" \
    HOST="0.0.0.0" \
    PORT="3030" \
    NUXT_HOST="0.0.0.0" \
    NUXT_PORT="3030"

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3030/ || exit 1

EXPOSE 3030

ENTRYPOINT ["dumb-init", "--"]
CMD ["/app/entrypoint.sh"]
