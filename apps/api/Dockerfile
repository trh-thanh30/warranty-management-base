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
RUN turbo prune @repo/api @repo/api-pdf-renderer --docker

FROM base AS builder
WORKDIR /app

COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=pruner /app/out/full/apps/api/prisma ./apps/api/prisma

RUN pnpm install --frozen-lockfile

COPY --from=pruner /app/out/full/ .

RUN pnpm --filter @repo/api... build
RUN pnpm --config.auto-install-peers=false --filter @repo/api deploy --prod --no-optional --ignore-scripts /prod/api
RUN pnpm --config.auto-install-peers=false --filter @repo/api-pdf-renderer deploy --prod --no-optional --ignore-scripts /prod/pdf-renderer

RUN cd /prod/api && /app/apps/api/node_modules/.bin/prisma generate

FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4100

RUN apk upgrade --no-cache \
  && apk add --no-cache ca-certificates libc6-compat openssl poppler-utils \
  && addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nestjs \
  && rm -rf /usr/local/lib/node_modules/npm /usr/local/lib/node_modules/corepack \
  && rm -f /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack /usr/local/bin/pnpm /usr/local/bin/pnpx

COPY --from=builder --chown=nestjs:nodejs /prod/api ./

RUN mkdir -p logs storage \
  && chown -R nestjs:nodejs logs storage

USER nestjs

EXPOSE 4100

CMD ["node", "dist/main.js"]

FROM base AS pdf-runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

RUN apk add --no-cache chromium freetype harfbuzz nss ttf-freefont \
  && addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 pdf \
  && rm -rf /usr/local/lib/node_modules/npm /usr/local/lib/node_modules/corepack \
  && rm -f /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack /usr/local/bin/pnpm /usr/local/bin/pnpx

COPY --from=builder --chown=pdf:nodejs /prod/pdf-renderer ./

USER pdf

EXPOSE 3001

CMD ["node", "server.mjs"]

FROM base AS development
WORKDIR /app

ENV PORT=4100

EXPOSE 4100

CMD ["pnpm", "--filter", "@repo/api", "start:dev"]
