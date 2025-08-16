#!/bin/sh
set -e

echo "============================================="
echo "欢迎使用 T-NAV"
echo "============================================="

# 设置默认环境变量
if [ -z "$DATABASE_URL" ]; then
  export DATABASE_URL="file:/app/prisma/db/t-nav.db"
fi

if [ -z "$PRISMA_SCHEMA" ]; then
  export PRISMA_SCHEMA="/app/prisma/schema.prisma"
fi

echo "Database URL: $DATABASE_URL"
echo "Prisma Schema: $PRISMA_SCHEMA"
echo "Starting Prisma database initialization..."

# 确保数据库目录存在
mkdir -p /app/prisma/db

# 检查数据库文件是否存在
if [ ! -f "/app/prisma/db/mood.db" ]; then
  echo "Database file does not exist, creating new database..."
  touch /app/prisma/db/mood.db
fi

# 尝试运行迁移
echo "Running Prisma migrations..."
if npx prisma migrate deploy --schema="$PRISMA_SCHEMA"; then
  echo "✅ Prisma migrations applied successfully"
else
  echo "⚠️  No migrations found, using db push..."
  if npx prisma db push --schema="$PRISMA_SCHEMA"; then
    echo "✅ Database schema pushed successfully"
  else
    echo "❌ Database initialization failed"
    exit 1
    fi
fi

echo "🎉 Database initialization completed"

# 启动应用程序
echo "Starting application..."
exec node server/index.mjs
