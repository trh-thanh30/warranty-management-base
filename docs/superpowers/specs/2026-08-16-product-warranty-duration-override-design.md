# Product Warranty Duration Override Design

## Goal

Allow a product template to omit its default warranty duration while ensuring every physical product receives an explicit warranty duration. A template duration is a convenience default, not a permanent rule for all products created from that template.

## Current Behavior

- `product_template.default_warranty_duration_months` is required and defaults to 36.
- Creating a physical product always copies the selected template duration into `warranty.duration_months`.
- The physical-product form does not expose warranty duration.
- Changing a template does not provide a way to override duration for an individual product.

## Decisions

### Template duration

- `defaultWarrantyDurationMonths` is optional and nullable.
- A supplied value must be an integer greater than or equal to 1.
- Creating a template with a blank duration stores `NULL`; it does not silently substitute 36.
- Existing template durations remain unchanged during migration.

### Physical-product duration

- Every physical product must have a warranty duration of at least 1 month.
- The product form exposes `warrantyDurationMonths`.
- Selecting a template with a default duration pre-fills the field.
- Selecting a template without a default leaves the field empty and requires the admin to enter a value.
- The admin can override a pre-filled value before creation.
- Creation stores the submitted duration in `warranty.duration_months`; the template is no longer the authoritative value after creation.

### Editing

- A physical product whose warranty is `DRAFT` can update its duration from the product edit form.
- An activated or otherwise non-draft warranty cannot update duration from the product form.
- Non-draft warranty adjustments continue through the warranty edit flow, which requires an adjustment reason.
- Changing a template duration never updates warranties already created for physical products.
- Changing the selected template on an existing product does not silently replace the product warranty duration.

## Data Model

```text
ProductTemplate
  default_warranty_duration_months: Int?  // optional convenience default

Product
  warranty -> Warranty

Warranty
  duration_months: Int                    // required product snapshot
```

The migration only changes the template column from required to nullable and removes its database default. It does not rewrite existing template or warranty records.

## API Changes

### Product templates

- Create and update DTOs accept `defaultWarrantyDurationMonths: number | null`.
- Omitted or explicitly cleared duration persists as `NULL`.
- Responses expose `defaultWarrantyDurationMonths: number | null`.

### Physical products

- Create DTO requires `warrantyDurationMonths` as an integer of at least 1.
- Create use case writes the submitted value to the new draft warranty.
- Update DTO accepts optional `warrantyDurationMonths`.
- Update use case changes the value only when the related warranty is `DRAFT`.
- A non-draft update attempt returns a stable client error code so Admin can show a localized message.

## Admin UX

### Template form

- Keep the existing duration input but make it optional.
- Blank means the template has no default duration.
- Help text explains that the value only pre-fills newly created products.

### Product form

- Add a required warranty-duration input near the template selection and warranty code.
- On create, selecting or changing the template updates the input to that template's default when available.
- A blank template default leaves the input blank and displays required validation on submit.
- On edit, initialize from `product.warranty.durationMonths`, not from the template.
- Disable the field for non-draft warranties and direct the admin to the warranty edit page.

## Business Rules

1. A template may have no warranty-duration default.
2. A physical product cannot be created without a valid warranty duration.
3. Product warranty duration is a snapshot and can differ from its template.
4. Template changes affect future form defaults only.
5. Direct product edits may change duration only while warranty status is `DRAFT`.
6. Activated warranty adjustments must retain the existing reason-required workflow.
7. There is no 120-month maximum; valid durations are integers from 1 month upward.

## Compatibility

- Existing templates keep their stored values, including 36, 120, and 180 months.
- Existing physical-product warranties keep their current duration.
- API consumers must handle a nullable template default.
- Physical-product creation clients must submit `warrantyDurationMonths` after the contract change.

## Test Coverage

- Migration permits a null template duration without changing existing data.
- Template Admin schema accepts blank, 1, and values above 120; rejects 0 and fractions.
- Template API accepts create/update/clear operations with null duration.
- Product Admin form pre-fills from a template default and supports override.
- Product Admin form requires duration when the template has no default.
- Product API creates the warranty using the submitted product duration.
- Product API updates a draft warranty duration.
- Product API rejects direct duration changes for non-draft warranties.
- Changing templates does not silently overwrite an existing product duration.

## Out of Scope

- Bulk-updating existing products when a template changes.
- Making `warranty.duration_months` nullable.
- Changing warranty lifecycle date calculations.
- Removing the existing reason-required warranty adjustment flow.
