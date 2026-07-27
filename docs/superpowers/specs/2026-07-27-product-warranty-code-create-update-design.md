# Product Warranty Code on Create and Update

## Goal

Make manual Product creation and update consistent with Product import: every
physical Product must have a draft Warranty with a generated warranty code.

## Behavior

- Creating a Product generates a unique warranty code and creates its Warranty
  with status `DRAFT`.
- Updating a Product whose Warranty has no code generates and stores a code.
- Updating a Product that already has a warranty code preserves that code.
- Updating legacy Product data with no Warranty creates a `DRAFT` Warranty using
  the Product Template's default warranty duration and terms.
- The API does not accept `warrantyCode` in create/update DTOs. Warranty codes
  remain system-generated.

## Implementation

- Reuse `GenerateWarrantyCodeUseCase`.
- Keep orchestration in `CreateProductUseCase` and `UpdateProductUseCase`.
- Perform code generation and the related Product/Warranty write in one Prisma
  transaction.
- Do not change schema or add a migration.
- Do not change activation status, ownership, start date, or end date.

## Tests

Add regression coverage proving:

1. Create Product stores the generated warranty code.
2. Update fills a missing warranty code.
3. Update preserves an existing warranty code without invoking the generator.
4. Update creates a coded draft Warranty when no Warranty exists.
