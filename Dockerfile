FROM node:20-alpine3.21 AS builder

WORKDIR /app

COPY package*.json ./

# 安装依赖并生成 Prisma Client
RUN npm install

COPY . .

RUN npx prisma generate 
RUN npm run build
# RUN npm run prisma:build

FROM node:20-alpine3.21 AS runner

WORKDIR /app

# 复制生产环境需要的文件
COPY --from=builder /app/.output/ ./ 
COPY --from=builder /app/.output/server/node_modules/ ./node_modules/
COPY --from=builder /app/.output/server/node_modules/.prisma/ ./.prisma/
COPY ./prisma/ ./prisma/
COPY ./docker/entrypoint.sh ./entrypoint.sh
RUN chmod +x entrypoint.sh

# 预装prisma，可以提升容器启动速度，但镜像体积会大很多
RUN npm install -g prisma@6.10.1

ENV DATABASE_URL="file:/app/prisma/db/t-nav.db"
ENV JWT_SECRET="your-secret-key"
ENV NODE_ENV="production"
ENV HOST="0.0.0.0"
ENV PORT="3030"


VOLUME /app/prisma/db

EXPOSE 3000

ENTRYPOINT ["/app/entrypoint.sh"]
