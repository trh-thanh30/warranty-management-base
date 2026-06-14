# Implementation Issues: Admin Dashboard Boilerplate

## Issue 1: Define Configuration Types & Initial Configuration

- **Objective**: Create a robust, extensible typesafe schema for the Admin Boilerplate UI, and define the default configuration.
- **Scope**:
  - Create `apps/admin/src/config/dashboard.types.ts` defining types for branding (title, description, logo), navigation item/group, header links, and user menu dropdowns.
  - Create `apps/admin/src/config/dashboard.config.ts` housing the static configuration matching the Booking system domain as the default boilerplate state.
- **Files involved**:
  - `apps/admin/src/config/dashboard.types.ts`
  - `apps/admin/src/config/dashboard.config.ts`
- **Acceptance Criteria**:
  - Icon options can be configured as a reference to a Lucide icon or dynamically resolved.
  - TypeScript types compile cleanly without errors.
- **Verification Command**: `pnpm --filter @repo/admin check-types`
- **Dependencies**: None.

## Issue 2: Refactor Layout Shell and App Sidebar

- **Objective**: Make the layout shell and sidebar completely configuration-driven.
- **Scope**:
  - Modify `apps/admin/src/components/layout/app-sidebar.tsx` to read its sections, badges, logo icon/text, branding name, and footer profile from the config.
  - Modify `apps/admin/src/components/layout/dashboard-shell.tsx` if necessary to feed settings/themes.
- **Files involved**:
  - `apps/admin/src/components/layout/app-sidebar.tsx`
  - `apps/admin/src/components/layout/dashboard-shell.tsx`
- **Acceptance Criteria**:
  - The sidebar displays the exact same sections and items as before but dynamically loaded from `dashboard.config.ts`.
  - Responsive collapse states work properly without shifting layouts.
- **Verification Command**: Run `pnpm dev` and check sidebar items.
- **Dependencies**: Issue 1.

## Issue 3: Refactor Header and Dropdown Menus

- **Objective**: Clean up the header and user profile drop-downs, routing them dynamically.
- **Scope**:
  - Modify `apps/admin/src/components/layout/header.tsx` to map top navbar links dynamically from `dashboard.config.ts`.
  - Modify `apps/admin/src/components/user-menu.tsx` to load user metadata and menu actions dynamically.
  - Refactor `apps/admin/src/components/command-menu.tsx` to use the dynamic sidebar and top-nav paths for search targets instead of a separate hardcoded list.
- **Files involved**:
  - `apps/admin/src/components/layout/header.tsx`
  - `apps/admin/src/components/user-menu.tsx`
  - `apps/admin/src/components/command-menu.tsx`
- **Acceptance Criteria**:
  - Top navigation links render dynamically.
  - Command menu returns items based on configured routes.
  - No broken links.
- **Verification Command**: Build the project using `pnpm --filter @repo/admin build`.
- **Dependencies**: Issue 2.

## Issue 4: Implement Global Keyboard Shortcuts Listener

- **Objective**: Wire up keyboard shortcuts to open/close the CommandMenu.
- **Scope**:
  - Create or update a listener in `CommandMenu` or `DashboardShell` to intercept `Ctrl+K` and `Cmd+K` keystrokes.
- **Files involved**:
  - `apps/admin/src/components/command-menu.tsx`
- **Acceptance Criteria**:
  - Pressing `Ctrl+K` or `Cmd+K` toggles the Command Menu open.
  - Pressing `Esc` closes it.
- **Verification Command**: Interactive browser verification.
- **Dependencies**: Issue 3.

## Issue 5: Refactor & Modernize Dashboard View

- **Objective**: Refactor the dashboard view into a highly polished, modular page with Bento grid layout and sleek charts.
- **Scope**:
  - Refactor `apps/admin/src/views/dashboard/dashboard.view.tsx` to load tabs, grid sizes, and statistics dynamically.
  - Refactor or polish `dashboard-overview-chart.tsx` and `recent-sales.tsx` with clean tailwind classes.
- **Files involved**:
  - `apps/admin/src/views/dashboard/dashboard.view.tsx`
  - `apps/admin/src/views/dashboard/components/dashboard-overview-chart.tsx`
  - `apps/admin/src/views/dashboard/components/recent-sales.tsx`
- **Acceptance Criteria**:
  - Clean styling in both light and dark modes.
  - Responsive layouts (375px, 768px, 1024px, 1440px) without content overlap or clipping.
  - Smooth Framer Motion entries and transitions.
- **Verification Command**: Build and run.
- **Dependencies**: None.

## Issue 6: Documentation and Final Polish

- **Objective**: Document the config options for subsequent projects to easily configure the boilerplate.
- **Scope**:
  - Add documentation to `apps/admin/README.md` or a new `docs/admin-boilerplate.md` describing how to change settings, add sidebar sections, switch logos, and customize stats.
- **Files involved**:
  - `apps/admin/README.md`
- **Acceptance Criteria**:
  - Clear, readable Markdown documentation.
- **Verification Command**: Check markdown rendering.
- **Dependencies**: All previous issues.
