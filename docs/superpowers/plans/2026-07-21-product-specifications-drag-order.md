# Product Specifications Drag Ordering Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let administrators reorder Product technical specification rows by drag handle and persist that order across create, edit, detail, and future Web rendering.

**Architecture:** React Hook Form `useFieldArray` remains the form-state owner and performs reordering through `move`. dnd-kit provides pointer, touch, and keyboard interaction around focused sortable rows. Product metadata writes specifications as an ordered array while the parser continues reading the legacy object shape.

**Tech Stack:** Next.js 16, React 19, React Hook Form 7, Zod 3, Tailwind CSS 4, dnd-kit, next-intl, Node test runner.

## Global Constraints

- Only Product technical specification rows are sortable.
- Persist sorting only when the Product form is submitted.
- Read both legacy object and canonical ordered-array metadata shapes.
- Keep unrelated Product metadata unchanged.
- Use a dedicated drag handle with pointer, touch, and keyboard support.
- Use `verticalListSortingStrategy` and `useFieldArray().move`.
- Disable sorting during submit and when fewer than two rows exist.
- Do not change Prisma schema or Product API endpoints.

---

### Task 1: Persist Ordered Specifications

**Files:**

- Modify: `apps/admin/src/views/products/products.utils.test.ts`
- Modify: `apps/admin/src/views/products/products.utils.ts`

**Interfaces:**

- Consumes: `ProductSpecificationRow = { key: string; value: string }`.
- Produces: `getProductSpecifications(metadata): ProductSpecificationRow[]` supporting object and array input.
- Produces: `mergeProductSpecifications(metadata, rows): Record<string, unknown> | null` writing an ordered array.
- Produces: `resolveSpecificationMove(items, activeId, overId): { from: number; to: number } | null` for deterministic drop handling.

- [ ] **Step 1: Add failing compatibility and ordering tests**

```ts
test("reads ordered product specifications from metadata", () => {
  assert.deepEqual(
    getProductSpecifications({
      specifications: [
        { key: "UV rejection", value: "99.9%" },
        { key: "Technology", value: "Nano Ceramic" },
      ],
    }),
    [
      { key: "UV rejection", value: "99.9%" },
      { key: "Technology", value: "Nano Ceramic" },
    ],
  );
});

test("serializes specifications as an ordered array", () => {
  const metadata = mergeProductSpecifications(null, [
    { key: "UV rejection", value: "99.9%" },
    { key: "Technology", value: "Nano Ceramic" },
  ]);

  assert.deepEqual(metadata?.specifications, [
    { key: "UV rejection", value: "99.9%" },
    { key: "Technology", value: "Nano Ceramic" },
  ]);
});

test("resolves a sortable field move and ignores invalid drops", () => {
  const fields = [{ id: "first" }, { id: "second" }, { id: "third" }];
  assert.deepEqual(resolveSpecificationMove(fields, "third", "first"), {
    from: 2,
    to: 0,
  });
  assert.equal(resolveSpecificationMove(fields, "first", "first"), null);
  assert.equal(resolveSpecificationMove(fields, "missing", "first"), null);
});
```

- [ ] **Step 2: Run the focused test and verify red**

Run:

```bash
pnpm.cmd --filter @repo/admin test
```

Expected: the ordered-array serialization assertion fails and `resolveSpecificationMove` is missing.

- [ ] **Step 3: Implement compatible parsing, ordered serialization, and move resolution**

```ts
type SortableItem = { id: string };

export function resolveSpecificationMove(
  items: SortableItem[],
  activeId: string,
  overId: string | undefined,
) {
  if (!overId || activeId === overId) return null;

  const from = items.findIndex((item) => item.id === activeId);
  const to = items.findIndex((item) => item.id === overId);
  return from >= 0 && to >= 0 ? { from, to } : null;
}
```

Update `getProductSpecifications` to validate array rows first and fall back to valid legacy object entries. Update `mergeProductSpecifications` so `nextMetadata.specifications` receives the trimmed row array instead of `Object.fromEntries`.

- [ ] **Step 4: Run the focused tests and verify green**

Run:

```bash
pnpm.cmd --filter @repo/admin test
```

Expected: all Admin tests pass.

---

### Task 2: Add Accessible Sortable Rows

**Files:**

- Modify: `apps/admin/package.json`
- Modify: `pnpm-lock.yaml`
- Create: `apps/admin/src/views/products/components/sortable-product-specification-row.tsx`
- Modify: `apps/admin/src/views/products/components/product-specifications-fields.tsx`
- Modify: `apps/admin/src/views/products/components/product-form.tsx`
- Modify: `apps/admin/src/views/products/hooks/use-product-form.ts`
- Modify: `apps/admin/src/messages/en.json`
- Modify: `apps/admin/src/messages/vi.json`

**Interfaces:**

- Consumes: `resolveSpecificationMove` from Task 1.
- Produces: `SortableProductSpecificationRow` with row inputs, validation, remove action, and dedicated drag handle.
- Produces: `ProductSpecificationsFieldsProps.onMove(from: number, to: number): void`.

- [ ] **Step 1: Install dnd-kit dependencies**

Run:

```bash
pnpm.cmd --filter @repo/admin add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

Expected: all three packages appear in Admin dependencies and the lockfile updates.

- [ ] **Step 2: Expose React Hook Form field movement**

Destructure `move: moveSpecification` from `useFieldArray`, return it from `useProductForm`, and pass it from `ProductForm` to `ProductSpecificationsFields` as `onMove`.

```ts
const {
  append: appendSpecification,
  fields: specificationFields,
  move: moveSpecification,
  remove: removeSpecification,
} = useFieldArray({ control, name: "specifications" });
```

- [ ] **Step 3: Create the sortable row boundary**

Use `useSortable({ id, disabled })`, `CSS.Transform.toString(transform)`, and `transition`. Attach `attributes` and `listeners` only to a 44px `GripVertical` button. Keep inputs and validation registered with their existing field-array index.

```tsx
const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
  useSortable({ id: field.id, disabled: sortingDisabled });

const style = {
  transform: CSS.Transform.toString(transform),
  transition,
};
```

The row uses a mobile-safe grid, a visible focus ring, `touch-none` only on the handle, subtle dragged elevation, and reduced-motion-safe transitions.

- [ ] **Step 4: Connect DndContext and sensors**

`ProductSpecificationsFields` configures pointer and keyboard sensors, renders `SortableContext` with `fields.map(({ id }) => id)`, and resolves drops before calling `onMove`. Pointer events cover mouse, pen, and touch input; `touch-action: none` is limited to the dedicated handle.

```tsx
const sensors = useSensors(
  useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates,
  }),
);
```

Use `closestCenter` and `verticalListSortingStrategy`. Disable each sortable handle while submitting or when fewer than two rows exist.

- [ ] **Step 5: Add translated accessibility copy**

Add EN/VI keys for the drag handle label and sorting hint, including the one-based row index. Do not hardcode domain text in the component.

- [ ] **Step 6: Run static and behavioral verification**

Run:

```bash
pnpm.cmd --filter @repo/admin test
pnpm.cmd --filter @repo/admin lint
pnpm.cmd --filter @repo/admin check-types
git diff --check
```

Expected: all commands exit 0.

---

### Task 3: Manual Interaction Review

**Files:**

- Review: `apps/admin/src/views/products/components/product-specifications-fields.tsx`
- Review: `apps/admin/src/views/products/components/sortable-product-specification-row.tsx`

**Interfaces:**

- Consumes: completed Product form and ordered metadata behavior.
- Produces: reviewed drag interaction at supported viewport and input modes.

- [ ] **Step 1: Verify desktop pointer behavior**

Create at least three rows, drag the final row to the first position by its handle, edit an input without dragging, save, reopen Edit, and confirm order is retained.

- [ ] **Step 2: Verify mobile touch behavior**

At 375px, scroll through the form without accidental sorting, long-press the handle to reorder, and confirm no horizontal overflow.

- [ ] **Step 3: Verify keyboard behavior**

Tab to a handle, start sorting with Space, move with arrow keys, finish with Space, and cancel a second attempt with Escape. Confirm focus remains visible and validation messages stay with their rows.

- [ ] **Step 4: Review final diff**

Run:

```bash
git status --short
git diff --check
```

Expected: only Product specification drag-ordering files and the already approved Product enhancement changes are present.
