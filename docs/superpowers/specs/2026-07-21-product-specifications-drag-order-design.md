# Product Specifications Drag Ordering Design

## Context and Scope

This design extends the Product key/value specifications feature with persistent drag-and-drop ordering. It supersedes the deferred drag/drop decision and object-based specification shape in `2026-07-21-product-key-value-specifications-design.md`.

Only rows inside the Product `Technical specifications` section are sortable. Core Product fields such as name, serial number, category, cover image, warranty settings, and status remain fixed.

## Data Contract

`Product.metadata.specifications` uses an ordered array as the canonical shape:

```json
{
  "source": "admin",
  "specifications": [
    { "key": "Technology", "value": "Nano Ceramic" },
    { "key": "Visible light transmission", "value": "54.4%" },
    { "key": "UV rejection", "value": "99.9%" }
  ]
}
```

Array position is the persisted display order. Create and update always write this canonical array while preserving unrelated metadata keys.

The reader remains backward compatible with the existing object shape:

```json
{
  "specifications": {
    "Technology": "Nano Ceramic",
    "UV rejection": "99.9%"
  }
}
```

Opening and saving an old Product converts valid object entries to the ordered array shape. Malformed entries are ignored rather than causing Product edit to fail. No Prisma schema change or data migration is required because Product metadata remains JSON.

## Form State and Save Flow

React Hook Form `useFieldArray` remains the source of truth for specification rows. Each rendered sortable item uses the field array's stable `field.id` as its drag identifier.

On a valid drop:

1. Resolve the active and target indices from the field IDs.
2. Do nothing if there is no target or both indices are equal.
3. Call `useFieldArray().move(activeIndex, targetIndex)`.
4. Keep the reordered rows in local form state.
5. Persist the order only when the administrator submits the Product form.

Drag operations do not call the API. Existing validation remains attached to its row after movement. Product Detail and future Web consumers render specifications in array order.

## Drag-and-Drop Implementation

Use:

- `@dnd-kit/core` for `DndContext`, `PointerSensor`, `KeyboardSensor`, `closestCenter`, and sensor configuration.
- `@dnd-kit/sortable` for `SortableContext`, `useSortable`, `sortableKeyboardCoordinates`, and `verticalListSortingStrategy`.
- `@dnd-kit/utilities` for transforming sortable coordinates into CSS.

`verticalListSortingStrategy` matches the current full-width row layout. `rectSortingStrategy` is not used because the specifications are not a two-dimensional card grid. `arrayMove` is unnecessary because `useFieldArray().move` preserves React Hook Form registration, dirty state, and validation associations.

## Interaction and Accessibility

Each row receives a dedicated `GripVertical` drag handle on the left. Drag listeners and attributes are attached only to this handle so users can select text, edit inputs, and use the remove action without starting a drag.

- Pointer dragging uses a small activation distance to reduce accidental drags.
- Touch dragging uses an activation delay and tolerance so vertical page scrolling remains usable.
- Keyboard users can focus the handle, start sorting with Space or Enter, move with arrow keys, cancel with Escape, and finish with Space or Enter.
- The handle has a translated accessible label that identifies the specification row.
- The handle and remove action maintain a minimum 44px touch target.
- The active row receives a clear border, elevated shadow, and subtle background while the source row becomes slightly transparent.
- Movement uses transform-based animation of approximately 150–200ms and respects reduced-motion preferences.
- Sorting is disabled while the form is submitting and when fewer than two rows exist.

Mobile retains the existing stacked key/value layout without horizontal overflow.

## Validation and Edge Cases

- Complete rows and fully empty rows retain the current behavior.
- Partially completed rows remain invalid.
- Duplicate trimmed keys remain invalid regardless of their order.
- Empty rows may be reordered but are omitted from the saved metadata payload.
- Dropping outside the list or onto the same row makes no state change.
- Removing a row after reordering preserves the relative order of remaining rows.
- Invalid historical metadata entries are omitted while valid entries keep their encountered order.

## Component Boundaries

- `ProductSpecificationsFields` owns `DndContext`, sensors, sortable item IDs, and the drop handler.
- A focused `SortableProductSpecificationRow` owns `useSortable`, the drag handle, row transform styles, inputs, errors, and remove action.
- `useProductForm` exposes the field-array `move` operation in addition to append and remove.
- `products.utils` owns backward-compatible parsing and canonical ordered-array serialization.
- Product Detail remains presentation-only and consumes the ordered parser result.

## Verification

- Unit tests cover reading legacy objects and ordered arrays.
- Unit tests verify canonical serialization preserves row order and unrelated metadata.
- Component or focused interaction tests verify moving the final row to the first position updates form order.
- Tests cover no-op drops, duplicate validation after reordering, and malformed historical entries.
- Run Admin tests, lint, typecheck, and `git diff --check`.
- Manually verify pointer, touch, and keyboard sorting at mobile and desktop widths.

## Non-Goals

- Sorting core Product form fields.
- Saving after every drag operation.
- Adding reusable specification templates or category-based field definitions.
- Migrating all historical metadata records in the database.
- Dragging specifications in Product Detail or the public Web application.
