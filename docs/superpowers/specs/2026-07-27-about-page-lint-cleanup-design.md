# Design Spec: About Page ESLint Warning Cleanup

## Goal

Eliminate all unused variables and unused imports across the About page components to achieve clean, warning-free code adhering to repository architecture standards.

## Target Files and Modifications

### 1. `apps/web/src/views/about/about.view.tsx`

- Remove unused `useTranslations` import from `"next-intl"`.
- Remove unused `const t = useTranslations("AboutPage");` variable.

### 2. `apps/web/src/views/about/components/about-hero-corporate.tsx`

- Remove unused `aboutHeroBorderStats` import from `"../about.constants"`.

### 3. `apps/web/src/views/about/components/about-network-banner.tsx`

- Remove unused `aboutNetworkStats` import from `"../about.constants"`.

### 4. `apps/web/src/views/about/components/about-network-map.tsx`

- Remove unused `VIETNAM_MAINLAND_BOUNDS` constant declaration.

### 5. `apps/web/src/views/about/components/about-testimonials.tsx`

- Remove unused `motion` import from `"framer-motion"`.

### 6. `apps/web/src/views/about/components/about-timeline.tsx`

- Remove unused `motion` import from `"framer-motion"`.
- Remove unused `Flag` import from `"lucide-react"`.
- Remove unused `StaggerGroup` and `StaggerItem` imports from `"@/src/components/animation/stagger-group"`.

### 7. `apps/web/src/views/about/components/about-vision-values.tsx`

- Remove unused `motion` import from `"framer-motion"`.

## Verification Criteria

- Run `npm run check-types` in `apps/web` to confirm 0 TypeScript or lint errors/warnings.
