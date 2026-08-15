# Combobox Vietnamese Search Design

## Goal

Make client-side Admin comboboxes searchable by their visible labels, with or without Vietnamese diacritics, while preserving the existing submitted ID/code values.

## Scope

- Add one shared normalization and filtering rule to the Admin `Combobox`.
- Include a string item's visible text as a search keyword when its `value` is an ID or code.
- Preserve current selection, keyboard navigation, rendering, and submitted values.
- Cover province and ward selectors used by customer and warranty activation forms.

Server-side searches for customers, products, and dealers are out of scope because those results are paginated by the API.

## Behavior

- `Hà Nội`, `ha noi`, `HA NOI`, and partial text such as `noi` match `Thành phố Hà Nội`.
- Numeric province and ward codes remain searchable.
- `Đ` and `đ` normalize to `D` and `d`.
- Empty search continues to show every item.

## Implementation

1. Extract a pure Vietnamese search normalizer/filter beside the shared Combobox.
2. Pass the filter to `cmdk` through `CommandPrimitive`.
3. Extend `ComboboxItem` with optional keywords and automatically add string children as a keyword.
4. Add unit tests for case folding, accent removal, `Đ/đ`, partial labels, and code matching.

## Risk

This changes filtering only. It does not modify form values, API payloads, location data, or business rules. The main regression risk is changing result ranking or hiding items, so the filter will return a deterministic match/no-match score and retain code matching.
