# 0005 - Independent Warranty PDF Renderer

## Status

Accepted

## Context

Warranty certificate generation needs Chromium, fonts, and a different runtime
profile from the NestJS API. Building the renderer as a target in the API
Dockerfile coupled its image build to API pruning, dependencies, and artifacts.
This made local infrastructure startup and renderer image publishing slower and
blurred the deployment boundary between the two processes.

## Decision

- Treat `@repo/api-pdf-renderer` as a deployable app under
  `apps/api-pdf-renderer`.
- Build it with its own Dockerfile and install only its filtered production
  dependencies.
- Keep the renderer internal in production and let the API communicate through
  `PDF_RENDERER_URL` using the existing `/health` and `/render` HTTP contract.
- Publish the renderer port only on `127.0.0.1` in development so an API running
  on the host can use the Compose renderer without exposing it to the network.
- Run renderer lint, type checking, contract tests, and syntax validation before
  publishing its image.

## Consequences

- API image builds no longer install Chromium or renderer dependencies.
- Renderer changes have an independent CI and image cache boundary.
- Production still requires the API and renderer to share a private Compose
  network.
- Changes to the renderer HTTP contract must remain backward compatible with
  the API client or be coordinated across both apps.
