# Product Key/Value Specifications Design

## Scope

Phase 1 adds editable technical specifications to the existing Admin Product create/edit form. Administrators add and remove key/value rows; the application persists them under `Product.metadata.specifications`.

Product image upload, specification filtering, reusable field definitions, units, typed numeric fields, and drag/drop ordering are explicitly deferred.

## Data Shape

Existing Product metadata keys must be preserved. Technical specifications use a nested object:

```json
{
  "source": "admin",
  "specifications": {
    "Công nghệ": "Nano Ceramic",
    "Độ truyền sáng": "54,4%",
    "Cản tia cực tím (UV)": "99,9%"
  }
}
```

Both keys and values are trimmed strings. Empty rows are omitted. Keys must be unique within one Product.

## Form Interaction

- Add a `Thông số kỹ thuật` section after Product description.
- Each row contains a labelled key input, a labelled value input, and an accessible remove button.
- `Thêm thông số` appends one empty row and focuses the new key input where practical.
- Create starts with one empty row so the feature is discoverable.
- Edit converts `metadata.specifications` back into rows.
- Removing all rows removes only `metadata.specifications`, preserving unrelated metadata.
- Desktop uses a two-column key/value row; mobile stacks controls without horizontal overflow.
- Validation runs through the existing React Hook Form and Zod flow.

## Validation

- A partially completed row is invalid.
- Key and value are each limited to 160 characters for phase 1.
- Duplicate trimmed keys are rejected.
- Completely empty rows are accepted by the UI but omitted from the request payload.
- Unexpected or invalid historical `metadata.specifications` data is ignored by the form rather than crashing Product edit.

## API Impact

No backend schema or endpoint change is required. Existing create/update Product DTOs already accept `metadata` objects and Product responses already return metadata.

Create sends metadata only when at least one specification exists. Update merges the edited specifications into the Product's existing metadata. If all specifications are removed and no other metadata remains, update sends `metadata: null`.

## Detail Display

Product detail displays specification key/value pairs in their stored insertion order. It shows no empty section when specifications are absent.

## Verification

- Unit tests cover metadata parsing, merging, clearing, trimming, and duplicate-key validation.
- Admin tests, lint, and typecheck run after implementation.
- Form is reviewed at 375px and desktop widths.
