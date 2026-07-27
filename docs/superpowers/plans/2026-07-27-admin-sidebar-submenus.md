# Admin Sidebar Submenus Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add permission-aware dropdown submenus for Product and Warranty navigation in the Admin sidebar.

**Architecture:** Extend the navigation configuration with optional child items, then centralize recursive access filtering, route resolution, flattening, and active-state detection in pure helpers. `AppSidebar` renders accessible groups inline when expanded and through the existing Radix dropdown primitive when collapsed; `CommandMenu` consumes the flattened accessible leaf routes.

**Tech Stack:** Next.js 16, React, TypeScript, next-intl, Tailwind CSS, Radix Dropdown Menu through `@repo/ui`, Node test runner.

## Global Constraints

- Product child order is Product templates, then Product list.
- Warranty child order remains Warranty list, then Activation requests.
- Warranty claims remain an independent item.
- Parent items toggle their submenu and do not navigate.
- Active child routes automatically reveal their group.
- Collapsed desktop navigation uses a floating menu.
- Inline submenu frames animate height and opacity over 240ms.
- Child content fades with a 4px shift and a 50ms entrance delay; closing
  content fades before the frame contracts.
- Child indentation remains compact at approximately 28px total.
- Closed submenus cannot receive keyboard focus and reduced-motion
  preferences are respected.
- Permissions and notification badges are evaluated at child level.
- Parent and child badges cross-fade without changing the parent row layout.
- Existing in-page Product and Warranty tabs remain unchanged.
- Do not add dependencies or change routes, APIs, database schema, or business behavior.
- Do not stage or commit changes without explicit user approval.

---

### Task 1: Define Nested Navigation Configuration

**Files:**

- Modify: `apps/admin/src/config/dashboard.types.ts`
- Modify: `apps/admin/src/config/dashboard.config.ts`
- Test: `apps/admin/src/config/dashboard.config.test.ts`

**Interfaces:**

- Produces: `NavigationItem.children?: NavigationItem[]`
- Produces: Products and Warranties parent items with permission-aware leaf children.

- [ ] **Step 1: Replace the existing grouping assertion with failing nested-order tests**

```ts
test("orders product templates before physical products", () => {
  const config = getDashboardConfig((key) => key);
  const products = config.sidebarSections
    .flatMap((section) => section.items)
    .find((item) => item.title === "items.products");

  assert.equal(products?.href, undefined);
  assert.deepEqual(
    products?.children?.map((item) => [item.title, item.href]),
    [
      ["items.productTemplates", "/product-templates"],
      ["items.products", "/products"],
    ],
  );
});

test("groups warranties while keeping claims independent", () => {
  const config = getDashboardConfig((key) => key);
  const items = config.sidebarSections.flatMap((section) => section.items);
  const warranties = items.find((item) => item.title === "items.warranties");

  assert.deepEqual(
    warranties?.children?.map((item) => [item.title, item.href]),
    [
      ["items.warranties", "/warranties"],
      ["items.warrantyActivationRequests", "/warranty-activation-requests"],
    ],
  );
  assert.equal(
    items.find((item) => item.title === "items.warrantyClaims")?.href,
    "/warranty-claims",
  );
});
```

- [ ] **Step 2: Run the config test and verify it fails**

Run:

```powershell
pnpm.cmd --filter @repo/admin test -- src/config/dashboard.config.test.ts
```

Expected: FAIL because `NavigationItem` and the config do not have `children`.

- [ ] **Step 3: Add the recursive type and nested configuration**

Add to `NavigationItem`:

```ts
children?: NavigationItem[];
```

Configure Products:

```ts
{
  title: t("items.products"),
  icon: Package,
  children: [
    {
      title: t("items.productTemplates"),
      href: "/product-templates",
      icon: Layers3,
      requiredPermission: PERMISSIONS.PRODUCT_TEMPLATE_VIEW,
    },
    {
      title: t("items.products"),
      href: "/products",
      icon: Boxes,
      requiredPermission: PERMISSIONS.PRODUCT_VIEW,
    },
  ],
},
```

Configure Warranties:

```ts
{
  title: t("items.warranties"),
  icon: ShieldCheck,
  children: [
    {
      title: t("items.warranties"),
      href: "/warranties",
      icon: ShieldCheck,
      requiredPermission: PERMISSIONS.WARRANTY_VIEW,
    },
    {
      title: t("items.warrantyActivationRequests"),
      href: "/warranty-activation-requests",
      icon: FileCheck2,
      notificationBadgeKey: "warranties",
      requiredPermission: PERMISSIONS.WARRANTY_VIEW,
    },
  ],
},
```

Remove the obsolete parent `href`, `activeHrefs`, permission fallback, and direct Warranty badge fields. Import `Boxes`, `Layers3`, and `FileCheck2`.

- [ ] **Step 4: Run the config test and verify it passes**

Run:

```powershell
pnpm.cmd --filter @repo/admin test -- src/config/dashboard.config.test.ts
```

Expected: all dashboard configuration tests PASS.

---

### Task 2: Add Pure Navigation Tree Helpers

**Files:**

- Modify: `apps/admin/src/config/navigation-permissions.ts`
- Test: `apps/admin/src/config/navigation-permissions.test.ts`
- Modify: `apps/admin/src/components/layout/nav-items.ts`
- Create: `apps/admin/src/components/layout/nav-items.test.ts`
- Modify: `apps/admin/src/components/layout/app-sidebar.utils.ts`
- Modify: `apps/admin/src/components/layout/app-sidebar.utils.test.ts`

**Interfaces:**

- Produces: `getAccessibleNavigationItems(items, hasPermission, hasRole): NavigationItem[]`
- Produces: `flattenNavigationItems(items): NavigationItem[]`
- Produces: `isNavigationItemActive(item, pathname): boolean`
- Produces: `getNavigationItemBadge(item, counts, hasError): string | null`

- [ ] **Step 1: Add failing tests for recursive access filtering**

Cover these cases in `navigation-permissions.test.ts`:

```ts
test("keeps only accessible children and hides an empty parent", () => {
  const items = [
    {
      title: "Products",
      icon: Package,
      children: [
        {
          title: "Templates",
          href: "/product-templates",
          icon: Layers3,
          requiredPermission: PERMISSIONS.PRODUCT_TEMPLATE_VIEW,
        },
        {
          title: "Products",
          href: "/products",
          icon: Boxes,
          requiredPermission: PERMISSIONS.PRODUCT_VIEW,
        },
      ],
    },
  ];

  const templateOnly = getAccessibleNavigationItems(
    items,
    (permission) => permission === PERMISSIONS.PRODUCT_TEMPLATE_VIEW,
    () => true,
  );

  assert.deepEqual(
    templateOnly[0]?.children?.map((child) => child.href),
    ["/product-templates"],
  );
  assert.deepEqual(
    getAccessibleNavigationItems(
      items,
      () => false,
      () => true,
    ),
    [],
  );
});
```

- [ ] **Step 2: Add failing tests for flattening, active routes, and recursive badges**

Test:

```ts
assert.deepEqual(
  flattenNavigationItems(nestedItems).map((item) => item.href),
  ["/product-templates", "/products"],
);

assert.equal(
  isNavigationItemActive(productGroup, "/product-templates/example/edit"),
  true,
);

assert.equal(
  getNavigationItemBadge(
    warrantyGroup,
    { warranties: 4, warrantyClaims: 0 },
    false,
  ),
  "4",
);
```

Also verify badge errors and zero values return `null`.

- [ ] **Step 3: Run focused tests and verify they fail**

Run:

```powershell
pnpm.cmd --filter @repo/admin test -- src/config/navigation-permissions.test.ts src/components/layout/nav-items.test.ts src/components/layout/app-sidebar.utils.test.ts
```

Expected: FAIL because the new helpers do not exist.

- [ ] **Step 4: Implement recursive filtering and route resolution**

Implement:

```ts
export function getAccessibleNavigationItems(
  items: NavigationItem[],
  hasPermission: (permission: PermissionKey) => boolean,
  hasRole: (role: Exclude<AuthUserRole, null>) => boolean,
): NavigationItem[] {
  return items.flatMap((item) => {
    if (
      (item.requiredRole && !hasRole(item.requiredRole)) ||
      !canAccessNavigationItem(item, hasPermission)
    ) {
      return [];
    }

    const children = item.children
      ? getAccessibleNavigationItems(item.children, hasPermission, hasRole)
      : undefined;

    if (item.children && !children?.length) return [];

    return [
      {
        ...item,
        children,
        href: resolveNavigationHref(item, hasPermission),
      },
    ];
  });
}
```

- [ ] **Step 5: Implement flattening, active-state, and badge helpers**

`flattenNavigationItems` returns navigable leaf items recursively:

```ts
export function flattenNavigationItems(items: NavigationItem[]) {
  return items.flatMap((item): NavigationItem[] =>
    item.children?.length ? flattenNavigationItems(item.children) : [item],
  );
}
```

`isNavigationItemActive` checks the direct `href`/`activeHrefs` and recursively
checks children. `getNavigationItemBadge` resolves the direct item badge first,
then the first visible child badge, and uses `getNavigationBadge` for
notification counts.

- [ ] **Step 6: Run focused tests and verify they pass**

Run:

```powershell
pnpm.cmd --filter @repo/admin test -- src/config/navigation-permissions.test.ts src/components/layout/nav-items.test.ts src/components/layout/app-sidebar.utils.test.ts
```

Expected: all focused navigation helper tests PASS.

---

### Task 3: Render Expanded and Collapsed Submenus

**Files:**

- Modify: `apps/admin/src/components/layout/app-sidebar.tsx`

**Interfaces:**

- Consumes: `getAccessibleNavigationItems`
- Consumes: `isNavigationItemActive`
- Consumes: `getNavigationItemBadge`
- Uses: `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`,
  `DropdownMenuLabel`, and `DropdownMenuItem` from `@repo/ui`

- [ ] **Step 1: Replace local access and active logic with shared helpers**

In `AppSidebar`, resolve each section using:

```ts
const items = getAccessibleNavigationItems(
  section.items,
  hasPermission,
  hasRole,
);
```

Remove the component-local `isNavItemActive` function.

- [ ] **Step 2: Extract a leaf link renderer**

Create a private `NavItemLink` in `app-sidebar.tsx` that:

- renders `aria-current="page"` for active routes;
- renders direct notification badges;
- supports an `isChild` style with indentation and a smaller child icon;
- retains the current tooltip behavior when collapsed.

- [ ] **Step 3: Render inline groups in expanded mode**

Create a private `NavItemGroup` that:

```tsx
const active = isNavigationItemActive(item, pathname);
const [expanded, setExpanded] = useState(active);

useEffect(() => {
  if (active) setExpanded(true);
}, [active, pathname]);
```

The parent button uses:

```tsx
aria-expanded={expanded}
aria-controls={submenuId}
```

Keep the submenu mounted in a CSS grid that transitions between
`grid-rows-[0fr] opacity-0` and `grid-rows-[1fr] opacity-100` over 240ms.
Apply `aria-hidden` and `inert` while closed so hidden links cannot receive
focus. Use `ml-3 pl-1` on the hierarchy container and `pl-3 pr-2` on child
links, resulting in approximately 28px total indentation. Chevron rotation
uses `transform` with the same 240ms transition.

Animate the child list separately between `-translate-y-1 opacity-0` and
`translate-y-0 opacity-100`. Opening uses a 50ms delay and 200ms duration;
closing fades immediately over 150ms while the frame contraction starts after
60ms. All transitions include a
reduced-motion override.

Keep the parent badge slot mounted when a badge exists. Toggle only its opacity
and scale based on `expanded`, and set `aria-hidden` while the child badge is
visible. This keeps the chevron stationary while the child badge fades with the
submenu.

- [ ] **Step 4: Render a floating menu in collapsed mode**

Wrap the parent icon button in the existing Radix dropdown:

```tsx
<DropdownMenu>
  <DropdownMenuTrigger asChild>{parentButton}</DropdownMenuTrigger>
  <DropdownMenuContent align="start" side="right">
    <DropdownMenuLabel>{item.title}</DropdownMenuLabel>
    {item.children?.map((child) => (
      <DropdownMenuItem asChild key={child.title}>
        <Link href={child.href!}>...</Link>
      </DropdownMenuItem>
    ))}
  </DropdownMenuContent>
</DropdownMenu>
```

Ensure the trigger announces the parent label and current aggregated badge.
Apply local Radix state classes for a short fade and scale animation without
changing the shared dropdown primitive.

- [ ] **Step 5: Verify component types**

Run:

```powershell
pnpm.cmd --filter @repo/admin check-types
```

Expected: route type generation and TypeScript PASS.

---

### Task 4: Keep Command Menu Leaf Routes Searchable

**Files:**

- Modify: `apps/admin/src/components/command-menu.tsx`

**Interfaces:**

- Consumes: `getAccessibleNavigationItems`
- Consumes: `flattenNavigationItems`

- [ ] **Step 1: Resolve and flatten accessible sidebar items**

Replace the direct one-level loop with:

```ts
dashboardConfig.sidebarSections.forEach((section) => {
  const accessibleItems = getAccessibleNavigationItems(
    section.items,
    hasPermission,
    hasRole,
  );

  flattenNavigationItems(accessibleItems).forEach((item) => {
    if (!item.href) return;
    itemsMap.set(item.href, {
      title: item.title,
      href: item.href,
      icon: item.icon,
    });
  });
});
```

Keep top-navigation fallback behavior unchanged.

- [ ] **Step 2: Run Admin tests**

Run:

```powershell
pnpm.cmd --filter @repo/admin test
```

Expected: all Admin tests PASS.

---

### Task 5: Final Verification and Generated-File Cleanup

**Files:**

- Verify all modified Admin files.
- Revert generated-only changes in `apps/admin/next-env.d.ts` if type generation changes its route-type import.

- [ ] **Step 1: Run formatting**

Run:

```powershell
pnpm.cmd exec prettier --write apps/admin/src/config/dashboard.types.ts apps/admin/src/config/dashboard.config.ts apps/admin/src/config/dashboard.config.test.ts apps/admin/src/config/navigation-permissions.ts apps/admin/src/config/navigation-permissions.test.ts apps/admin/src/components/layout/nav-items.ts apps/admin/src/components/layout/nav-items.test.ts apps/admin/src/components/layout/app-sidebar.utils.ts apps/admin/src/components/layout/app-sidebar.utils.test.ts apps/admin/src/components/layout/app-sidebar.tsx apps/admin/src/components/command-menu.tsx
```

Expected: files formatted successfully.

- [ ] **Step 2: Run the complete verification suite**

Run:

```powershell
pnpm.cmd --filter @repo/admin test
pnpm.cmd --filter @repo/admin check-types
pnpm.cmd --filter @repo/admin lint
pnpm.cmd exec prettier --check apps/admin/src/config apps/admin/src/components/layout apps/admin/src/components/command-menu.tsx
```

Expected: tests, type-check, lint, and Prettier all PASS.

- [ ] **Step 3: Inspect the final diff**

Run:

```powershell
git status --short
git diff --check
git diff --stat
```

Expected: only the approved navigation implementation, tests, design spec, and
implementation plan remain. No generated `next-env.d.ts` change remains.

- [ ] **Step 4: Manually verify navigation**

Verify:

- Expanded Product group shows Product templates before Product list.
- Expanded Warranty group shows Warranty list before Activation requests.
- Active child automatically expands and highlights its group.
- User can manually close and reopen a group.
- Collapsed sidebar opens the correct floating submenu.
- Mobile drawer renders inline groups.
- Permission-restricted children and empty parents are hidden.
- Warranty claims remains independent.
- `Ctrl+K` finds all four child routes.
