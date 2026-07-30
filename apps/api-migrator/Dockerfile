# syntax=docker/dockerfile:1

FROM node:22-alpine AS runner

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable \
  && apk add --no-cache ca-certificates libc6-compat openssl

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api-migrator/package.json ./apps/api-migrator/package.json

RUN pnpm install --frozen-lockfile --prod --filter @repo/api-migrator

COPY apps/api/prisma ./apps/api/prisma
COPY apps/api/prisma.config.ts ./apps/api/prisma.config.ts

WORKDIR /app/apps/api

CMD ["/app/apps/api-migrator/node_modules/.bin/prisma", "migrate", "deploy", "--config", "/app/apps/api/prisma.config.ts"]
