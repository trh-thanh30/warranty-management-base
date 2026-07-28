# Shared Map Core Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract the About page's reusable Leaflet infrastructure into `@repo/ui/map` without moving feature data out of Web.

**Architecture:** A client-side `SharedMap` owns the Leaflet container, OSM tiles, interaction activation, deactivation, and reset controls. `AboutNetworkMap` composes its GeoJSON and dealer layers as children and supplies translated labels.

**Tech Stack:** React 19, Next.js 16, TypeScript, Tailwind CSS, Leaflet 1.9, React Leaflet 5.

## Global Constraints

- Keep About-specific GeoJSON, dealer data, markers, and popups in `apps/web`.
- Do not migrate Contact, Dealers, or Admin maps.
- Preserve all Task 1 interaction and visual behavior.

---

### Task 1: Define The Shared Component Boundary

**Files:**

- Modify: `apps/web/tests/about-map-interaction.test.mjs`
- Create: `packages/ui/src/map/shared-map.tsx`
- Create: `packages/ui/src/map/index.ts`
- Modify: `packages/ui/package.json`

**Interfaces:**

- Produces: `SharedMap` and `SharedMapProps` from `@repo/ui/map`.
- Consumes: Leaflet center/zoom values, translated labels, and React children.

- [ ] Add a failing source-level regression test requiring `@repo/ui/map`.
- [ ] Run the test and confirm it fails because the shared component is absent.
- [ ] Implement `SharedMap` with the existing activation/reset behavior.
- [ ] Export the map subpath and declare Leaflet dependencies.
- [ ] Run the regression test and package typecheck.

### Task 2: Migrate The About Map

**Files:**

- Modify: `apps/web/src/views/about/components/about-network-map.tsx`

**Interfaces:**

- Consumes: `SharedMap` from `@repo/ui/map`.
- Retains: About-specific GeoJSON, marker, popup, and translation composition.

- [ ] Replace local map infrastructure with `SharedMap`.
- [ ] Remove local interaction controllers and duplicated tile/container code.
- [ ] Run the interaction regression tests.
- [ ] Run UI/Web typecheck and lint.
- [ ] Run `git diff --check` and review the final diff.
