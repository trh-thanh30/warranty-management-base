SHELL := /bin/sh

DEV_COMPOSE := docker compose -f docker-compose.dev.yml
PROD_COMPOSE := docker compose -f docker-compose.prod.yml

.PHONY: help install dev dev-full build build-packages lint lint-packages check-types typecheck typecheck-packages test \
	api web admin worker-dev worker-prod worker-email-dev worker-email-prod \
	infra-dev-up infra-dev-down infra-dev-logs infra-dev-ps infra-dev-config \
	infra-prod-up infra-prod-down infra-prod-logs infra-prod-ps infra-prod-config \
	docker-build-api docker-build-web docker-build-admin docker-build-all \
	docker-check-api docker-check-web docker-check-admin docker-check-all \
	prisma-generate prisma-migrate-dev prisma-migrate-prod prisma-studio \
	db-push-dev db-push-prod db-seed-dev db-seed-prod db-reset-dev

help:
	@printf '%s\n' \
		'Common:' \
		'  make install              Install dependencies' \
		'  make dev                  Run all dev tasks through Turborepo' \
		'  make dev-full             Run api, web, and admin dev tasks' \
		'  make build                Build the full monorepo' \
		'  make build-packages       Build shared packages only' \
		'  make lint                 Lint the full monorepo' \
		'  make lint-packages        Lint shared packages only' \
		'  make check-types          Typecheck the full monorepo' \
		'  make typecheck-packages   Typecheck shared packages only' \
		'  make test                 Run tests through Turborepo' \
		'' \
		'Infrastructure:' \
		'  make infra-dev-up         Start dev db, redis, and api' \
		'  make infra-dev-down       Stop dev stack' \
		'  make infra-prod-up        Start production compose stack' \
		'  make infra-prod-down      Stop production compose stack' \
		'' \
		'Docker images:' \
		'  make docker-build-all     Build api, web, and admin images' \
		'  make docker-check-all     Run Dockerfile build checks' \
		'' \
		'Database:' \
		'  make prisma-generate      Generate Prisma client' \
		'  make prisma-migrate-dev   Run development migrations' \
		'  make db-seed-dev          Seed development database'

install:
	pnpm install

dev:
	pnpm dev

dev-full:
	pnpm dev:full

build:
	pnpm build

build-packages:
	pnpm build:packages

lint:
	pnpm lint

lint-packages:
	pnpm lint:packages

check-types:
	pnpm check-types

typecheck:
	pnpm typecheck

typecheck-packages:
	pnpm typecheck:packages

test:
	pnpm test

api:
	pnpm dev:api

web:
	pnpm dev:web

admin:
	pnpm dev:admin

worker-dev:
	pnpm worker:email:dev

worker-prod:
	pnpm worker:email:prod

worker-email-dev:
	pnpm worker:email:dev

worker-email-prod:
	pnpm worker:email:prod

infra-dev-up:
	pnpm infra:dev:up

infra-dev-down:
	pnpm infra:dev:down

infra-dev-logs:
	pnpm infra:dev:logs

infra-dev-ps:
	pnpm infra:dev:ps

infra-dev-config:
	pnpm infra:dev:config

infra-prod-up:
	pnpm infra:prod:up

infra-prod-down:
	pnpm infra:prod:down

infra-prod-logs:
	pnpm infra:prod:logs

infra-prod-ps:
	pnpm infra:prod:ps

infra-prod-config:
	pnpm infra:prod:config

docker-build-api:
	pnpm docker:build:api

docker-build-web:
	pnpm docker:build:web

docker-build-admin:
	pnpm docker:build:admin

docker-build-all:
	pnpm docker:build:all

docker-check-api:
	pnpm docker:check:api

docker-check-web:
	pnpm docker:check:web

docker-check-admin:
	pnpm docker:check:admin

docker-check-all:
	pnpm docker:check:all

prisma-generate:
	pnpm prisma:generate

prisma-migrate-dev:
	pnpm prisma:migrate:dev

prisma-migrate-prod:
	pnpm prisma:migrate:prod

prisma-studio:
	pnpm prisma:studio:dev

db-push-dev:
	pnpm db:push:dev

db-push-prod:
	pnpm db:push:prod

db-seed-dev:
	pnpm db:seed:dev

db-seed-prod:
	pnpm db:seed:prod

db-reset-dev:
	pnpm db:reset:dev
