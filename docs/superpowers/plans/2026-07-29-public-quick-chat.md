# Public Quick Chat Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a reusable one-step contact form in a floating quick-chat panel on every public website page.

**Architecture:** Extend `ContactMessageForm` with page and quick-chat variants while preserving one schema, service, province loader, and error mapping. Mount a client-side `PublicQuickChat` component once in the locale layout and keep its open state outside the form so closing the panel preserves entered values.

**Tech Stack:** Next.js 16 App Router, React 19, React Hook Form, Zod, Radix-based UI primitives, Tailwind CSS, next-intl.

## Global Constraints

- Reuse `POST /public/contact-submissions`.
- Do not send `sourcePath` from quick chat.
- Keep the existing Contact page behavior unchanged.
- Render one quick-chat trigger across all public routes.
- Use existing FUJITEK red tokens and `rounded-md`.
- Do not add dependencies.

---

### Task 1: Make The Contact Form Variant-Aware

**Files:**

- Modify: `apps/web/src/views/contact/components/contact-message-form.tsx`
- Test: `apps/web/tests/contact-form.test.mjs`

**Interfaces:**

- Produces: `ContactMessageForm({ variant?: "page" | "quickChat" })`
- Produces: quick-chat submissions without `sourcePath`

- [ ] Add failing source assertions for the variant type, compact classes, and conditional `sourcePath`.
- [ ] Run `node --test apps/web/tests/contact-form.test.mjs` and verify failure.
- [ ] Add `variant`, preserve the default page layout, and apply compact spacing/field sizes for quick chat.
- [ ] Keep the form mounted while its containing panel is hidden so field state survives close/reopen.
- [ ] Run the contact form test and verify it passes.

### Task 2: Add The Global Quick-Chat Panel

**Files:**

- Create: `apps/web/src/components/common/public-quick-chat.tsx`
- Modify: `apps/web/app/[locale]/layout.tsx`
- Modify: `apps/web/src/messages/vi.json`
- Modify: `apps/web/src/messages/en.json`
- Test: `apps/web/tests/contact-form.test.mjs`

**Interfaces:**

- Consumes: `ContactMessageForm({ variant: "quickChat" })`
- Produces: `PublicQuickChat`

- [ ] Add failing assertions that the locale layout mounts `PublicQuickChat` once.
- [ ] Add translations for title, description, open label, and close label.
- [ ] Implement a fixed `MessageCircle` trigger and responsive panel with `max-h-[80dvh]`, internal scrolling, close button, `aria-expanded`, and Escape handling.
- [ ] Keep the panel DOM mounted and switch visibility through classes/ARIA state.
- [ ] Mount `PublicQuickChat` after the footer inside the locale provider.
- [ ] Run the contact form test and verify it passes.

### Task 3: Resolve Floating-Control Overlap And Verify

**Files:**

- Modify: `apps/web/src/components/layout/site-footer.tsx`
- Test: `apps/web/tests/contact-form.test.mjs`

**Interfaces:**

- Consumes: fixed quick-chat trigger position
- Produces: non-overlapping back-to-top and quick-chat controls

- [ ] Add an assertion that the back-to-top control uses the stacked offset.
- [ ] Move the back-to-top button above the quick-chat trigger.
- [ ] Run focused Web tests and ESLint.
- [ ] Run `git diff --check`.
