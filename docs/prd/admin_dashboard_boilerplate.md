# PRD: Refactor Admin Dashboard UI into a Reusable Boilerplate

## Problem

The Admin Dashboard layout, header, sidebar, search menu, and home view in the current codebase are tightly coupled with the "Booking" system domain (e.g., hardcoded "Booking Admin" title, hardcoded navigation lists, explicit routing to `/bookings`, `/users`, and specific layout groupings). When developers fork or copy this monorepo for different products, they must manually trace, refactor, and replace these domain-specific elements across multiple UI files. This process is time-consuming, error-prone, and hinders the "Base repo" goal of being a quick-start template.

## Goals

1. **Centralize UI Configuration**: Abstract all dashboard layouts, menus, paths, and brand elements into a single configuration file (`apps/admin/src/config/dashboard.config.ts`).
2. **Decouple Layout Components**: Refactor `DashboardShell`, `AppSidebar`, `Header`, `CommandMenu`, and `UserMenu` to dynamically render their titles, logos, navigation groups, and links from the configuration.
3. **Enhance UI/UX Aesthetics**: Refactor and polish the dashboard view and layout based on the `ui-ux-pro-max` guidelines (responsive grids, premium light/dark mode styling, smooth Framer Motion micro-animations, standard accessible SVG icons, and visible keyboard shortcuts).
4. **Implement Global Search Interactions**: Fully wire up the keyboard shortcut listener (`Ctrl+K` / `Cmd+K`) to trigger the search command menu.
5. **Ensure Backwards Compatibility**: Retain existing app routing and functionality while moving to a generic, modular model.
6. **Provide Boilerplate Documentation**: Document how to configure and use the new modular system.

## Non-Goals

- Modifying backend API paths or database schemas.
- Deleting existing pages (e.g., `/bookings`, `/users`, `/settings`); these should remain active but render within the generic shell.
- Introducing heavy external dependencies not currently in `package.json`.

## User Stories

- **As a Developer copying the template**, I want to customize the admin layout (branding, navbar, sidebar sections, user profile menu, search destinations) by editing a single configuration file.
- **As an Administrator**, I want a highly responsive, modern, and accessible dashboard UI that loads quickly, provides smooth navigation transitions, and lets me navigate paths using `Ctrl+K`.

## Functional Requirements

1. **Centralized Configuration File**:
   - Brand definition: title, logo component/SVG, description.
   - Sidebar structure: support multiple configurable sections (e.g., "General", "Pages", "Settings") with items containing title, path, badge, icon name, or callback.
   - Header links: array of top-bar quick links.
   - User profile info & options: user name, email, avatar, menu items (profile, settings, log out action).
2. **Dynamic Component Refactoring**:
   - `AppSidebar`: Renders logo, brand title, and section groups dynamically.
   - `Header`: Renders top navigation and action icons dynamically.
   - `CommandMenu`: Gathers and allows searching through all configuration paths dynamically.
   - `UserMenu`: Pulls profile metadata and menu options from configuration/context.
3. **Interactive Features**:
   - Keyboard event listener for opening/closing the search menu using `Ctrl+K` / `Cmd+K`.
   - Active path highlighting: highlighting in both sidebar and top navigation based on current router pathname (including nested paths).
4. **Visual & Styling Upgrades**:
   - Clean dark and light mode styling conforming to `ui-ux-pro-max` design guidelines.
   - Smooth transition states for all sidebar actions and buttons.
   - Clean, modern layout grid for cards and charts.

## Technical Constraints

- Built on Next.js 16 App Router (Next + React 19).
- Clean separation of client and server components (Thin server pages rendering views from `src/views`).
- Typesafe: all config interfaces must be defined in TypeScript (`dashboard.config.types.ts`).
- No compilation/type lint errors: `pnpm run build` and `pnpm lint` must pass.

## Rollout & Verification Plan

1. **Draft PRD & Issue Tickets**: Document the plan and issues under `docs/`.
2. **Define Configuration Types & Initial Config**: Create types and mapping schemas.
3. **Refactor Core Shell Components**: Update Layout Shell, Sidebar, Header, User Menu, and Command Menu.
4. **Enhance Dashboard View**: Refactor the main dashboard view to use parameters and clean grids.
5. **Add Search Shortcuts**: Implement keyboard listener.
6. **Verify Compilation & Run**: Verify build compatibility.
7. **Document the Boilerplate**: Add instructions to the repository docs.
