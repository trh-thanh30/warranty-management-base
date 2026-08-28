# syntax=docker/dockerfile:1

FROM node:22.23.2-alpine3.24 AS builder

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api-pdf-renderer/package.json ./apps/api-pdf-renderer/package.json

RUN pnpm install --frozen-lockfile --prod --filter @repo/api-pdf-renderer --ignore-scripts

FROM node:22.23.2-alpine3.24 AS runner

ENV NODE_ENV=production
ENV PORT=3001
ENV HOME=/tmp
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

RUN apk upgrade --no-cache \
  && apk add --no-cache chromium freetype harfbuzz nss ttf-freefont \
  && addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 pdf \
  && rm -rf /usr/local/lib/node_modules/npm /usr/local/lib/node_modules/corepack \
  && rm -f /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack /usr/local/bin/pnpm /usr/local/bin/pnpx

WORKDIR /app

COPY --from=builder --chown=pdf:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=pdf:nodejs /app/apps/api-pdf-renderer/node_modules ./apps/api-pdf-renderer/node_modules
COPY --chown=pdf:nodejs apps/api-pdf-renderer/package.json apps/api-pdf-renderer/server.mjs ./apps/api-pdf-renderer/

WORKDIR /app/apps/api-pdf-renderer

USER pdf

EXPOSE 3001

HEALTHCHECK --interval=60s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:3001/health', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

CMD ["node", "server.mjs"]
