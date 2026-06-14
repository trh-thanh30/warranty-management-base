#!/usr/bin/env sh
set -eu

pnpm lint
pnpm check-types
pnpm build
