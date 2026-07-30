# syntax=docker/dockerfile:1

FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN apk add --no-cache ca-certificates libc6-compat openssl poppler-utils

FROM base AS pruner
WORKDIR /app
RUN npm install -g turbo@^2
COPY . .
RUN turbo prune @repo/api --docker

FROM base AS builder
WORKDIR /app

COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=pruner /app/out/full/apps/api/prisma ./apps/api/prisma

RUN pnpm install --frozen-lockfile

COPY --from=pruner /app/out/full/ .

RUN pnpm --filter @repo/api... build
RUN pnpm --filter @repo/api deploy --prod --no-optional --ignore-scripts /prod/api

RUN cd /prod/api && /app/apps/api/node_modules/.bin/prisma generate

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4100

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nestjs

COPY --from=builder --chown=nestjs:nodejs /prod/api ./

RUN mkdir -p logs storage \
  && chown -R nestjs:nodejs logs storage

USER nestjs

EXPOSE 4100

CMD ["node", "dist/main.js"]

FROM base AS development
WORKDIR /app

ENV PORT=4100

EXPOSE 4100

CMD ["pnpm", "--filter", "@repo/api", "start:dev"]
