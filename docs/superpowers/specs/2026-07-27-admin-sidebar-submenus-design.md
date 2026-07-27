# Admin Sidebar Submenus Design

## Goal

Represent the existing Product and Warranty management tabs as nested sidebar
navigation while preserving the tabs inside each page.

## Navigation Structure

```text
Products
├── Product templates
└── Product list

Warranties
├── Warranty list
└── Activation requests

Warranty claims
```

Product templates appear before the product list because the normal workflow is
to define a template before creating or importing physical products. Warranty
claims remain an independent navigation item.

## Navigation Model

Extend the existing `NavigationItem` type with optional `children`. Each child
owns its route, icon, permissions, active routes, and optional notification
badge. Parent items for Products and Warranties do not navigate; they only
control submenu visibility.

Permission filtering is recursive:

- Hide inaccessible children.
- Hide a parent when none of its children are accessible.
- Keep the parent and its one accessible child when only one child is
  accessible.
- A parent is active when any visible child matches the current route.

## Interaction

### Expanded desktop and mobile drawer

- Render children inline beneath the parent.
- Clicking the parent toggles the submenu.
- Animate the submenu frame over 240ms and animate its child content
  independently with opacity and a 4px vertical shift. Delay child entrance by
  50ms; on close, fade children immediately before the frame contracts.
- Rotate the chevron in sync with the submenu frame.
- Keep child indentation compact at approximately 28px total while retaining
  the vertical hierarchy line.
- Respect reduced-motion preferences and prevent closed children from
  receiving keyboard focus.
- Automatically expand a group when the current route belongs to one of its
  children.
- Preserve the user's manual open or closed state until navigation makes a
  child active.

### Collapsed desktop

- Clicking a parent icon opens a floating menu beside the sidebar.
- The floating menu contains the group title and visible children.
- The floating menu uses a short fade and scale transition.
- It supports pointer and keyboard interaction without expanding the entire
  sidebar.

### Accessibility

- Parent controls expose `aria-expanded` and identify the controlled submenu.
- Active links expose `aria-current="page"`.
- Icons are decorative and hidden from assistive technology.
- Focus remains visible for parent controls and child links.

## Badges

Move each group notification badge to the child route that owns the count. The
parent shows the same badge when the submenu is closed or the sidebar is
collapsed, so pending work remains visible. Keep the parent badge's layout slot
mounted while opening or closing: cross-fade and scale it against the child
badge so the badge and chevron do not jump between positions.

## Scope

- Update navigation types and dashboard configuration.
- Update desktop and mobile sidebar rendering through the shared
  `AppSidebar`.
- Update navigation permission, active-state, nesting, and badge helpers.
- Add or update VI/EN navigation labels only when no suitable label already
  exists.
- Keep the Product and Warranty tab components inside page content unchanged.
- Do not change routes, APIs, database schema, or business behavior.

## Verification

- Unit-test recursive permission filtering and active-state resolution.
- Unit-test nested notification badge behavior where helper extraction is
  practical.
- Run Admin tests, type-check, lint, and Prettier checks.
- Manually verify expanded, collapsed, and mobile navigation states.
