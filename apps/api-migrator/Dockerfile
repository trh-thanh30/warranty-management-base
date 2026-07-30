# syntax=docker/dockerfile:1

FROM node:22-alpine AS builder

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api-migrator/package.json ./apps/api-migrator/package.json

RUN pnpm install --frozen-lockfile --prod --filter @repo/api-migrator --ignore-scripts \
  && pnpm --filter @repo/api-migrator rebuild @prisma/engines prisma

FROM node:22-alpine AS runner

RUN apk add --no-cache ca-certificates libc6-compat openssl \
  && addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 migrator \
  && rm -rf /usr/local/lib/node_modules/npm /usr/local/lib/node_modules/corepack \
  && rm -f /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack

WORKDIR /app

COPY --from=builder --chown=migrator:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=migrator:nodejs /app/apps/api-migrator/node_modules ./apps/api-migrator/node_modules
COPY apps/api/prisma ./apps/api/prisma
COPY apps/api/prisma.config.ts ./apps/api/prisma.config.ts

WORKDIR /app/apps/api

USER migrator

CMD ["/app/apps/api-migrator/node_modules/.bin/prisma", "migrate", "deploy", "--config", "/app/apps/api/prisma.config.ts"]
