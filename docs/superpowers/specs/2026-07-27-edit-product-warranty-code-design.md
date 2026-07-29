# Edit Product Warranty Code

## Goal

Allow an administrator to edit a Product's warranty code before activation
while preserving the existing code when the input is cleared.

## API Contract

Product responses expose:

- `canEditWarrantyCode: boolean`
- `warrantyCodeEditLockedReason`:
  - `WARRANTY_NOT_DRAFT`
  - `OPEN_ACTIVATION_REQUEST`
  - `null`

`UpdateProductBody` and `UpdateProductDto` accept an optional
`warrantyCode`.

These fields are application-level contracts. They do not require a Prisma
schema change or database migration.

## Edit Rules

- Product create continues to generate the warranty code automatically.
- Omitting `warrantyCode` during update preserves the current code.
- Sending an empty or whitespace-only value preserves the current code.
- Sending the current code after trimming and uppercasing is a no-op.
- A different code is trimmed, uppercased, validated, and checked for
  uniqueness before it is stored.
- A code can change only when the Warranty status is `DRAFT`.
- A code cannot change while the Product has an activation request with status
  `PENDING` or `APPROVED`.
- The backend enforces every rule even when the request does not come from the
  Admin UI.
- Legacy Product data whose Warranty code is null retains the existing
  auto-generation behavior when the Product is updated without a replacement
  code.

## Admin UI

- The Product edit form renders the warranty code as a form input.
- The input is enabled only when `canEditWarrantyCode` is true.
- A disabled input shows a translated explanation based on
  `warrantyCodeEditLockedReason`.
- The Product create form does not expose a warranty-code input.

## Error Handling

- Invalid format is reported on the warranty-code field.
- A duplicate code is reported on the warranty-code field.
- A state changed between page load and submit is rejected by the backend with
  the corresponding locked-state error.

## Tests

- Product response capability for editable, non-draft, and open-request states.
- Update preserves an omitted, blank, or unchanged code.
- Update accepts a valid unique replacement and normalizes it.
- Update rejects a duplicate replacement.
- Update rejects a replacement for a non-draft Warranty.
- Update rejects a replacement while an open activation request exists.
- Admin form maps the field and disables it with the correct reason.
