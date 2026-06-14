#!/bin/sh
set -e

echo "🚀 Starting Railway Runtime Script..."
echo "🎭 APP_ROLE=$APP_ROLE"

# Check DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
  echo "❌ Warning: DATABASE_URL is not set!"
fi

echo "📂 Current directory: $(pwd)"
ls -R prisma/migrations || echo "No migrations folder found"

# Chỉ chạy migration nếu là API
if [ "$APP_ROLE" = "api" ]; then
  echo "🔄 Running database migrations..."
  npx prisma migrate deploy --schema prisma/schema.prisma
  echo "✅ Migrations completed successfully."
fi

# Decide what to run based on APP_ROLE
if [ "$APP_ROLE" = "worker" ]; then
  echo "📧 Starting Email Worker..."
  exec node dist/workers/email/worker.main.js
elif [ "$APP_ROLE" = "api" ]; then
  echo "🌐 Starting NestJS API..."
  exec node dist/main.js
else
  echo "❌ Unknown APP_ROLE: $APP_ROLE"
  exit 1
fi