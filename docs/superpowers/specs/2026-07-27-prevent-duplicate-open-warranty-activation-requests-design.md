# Prevent Duplicate Open Warranty Activation Requests

## Goal

Ensure a physical Product can have at most one open Warranty Activation Request
at a time across both Public Web and Admin Portal entry points.

## Current Behavior

`CreateWarrantyActivationRequestUseCase` resolves a Product and its draft
Warranty, then checks for a duplicate using:

- `warranty_code`
- `customer_phone`
- `status = PENDING`

This allows another request for the same Product when the submitted phone number
changes. The check and insert are also separate database operations without a
database uniqueness invariant, so concurrent requests can both pass the check.

## Business Rules

- `PENDING` and `APPROVED` are open statuses.
- A Product with an open request cannot receive another activation request,
  regardless of request source, customer phone, email, or other submitted data.
- `REJECTED` and `CANCELLED` are closed statuses and permit resubmission.
- `ACTIVATED` is closed. Its Warranty is no longer `DRAFT`, so the existing
  Warranty eligibility rule continues to reject another activation request.
- The rule applies identically to Public Web and Admin Portal requests.
- Historical requests are retained; this feature does not delete or rewrite
  request history.

## Application Design

`WarrantyActivationRequestsRepository` will expose a Product-scoped lookup:

```ts
findOpenByProductId(productId: string)
```

It returns the newest request for that Product whose status is `PENDING` or
`APPROVED`, selecting the fields needed for the domain error.

`CreateWarrantyActivationRequestUseCase` will call this lookup immediately
after resolving and validating the Product and Warranty, before resolving or
creating a Dealer. If an open request exists, the use case throws:

```json
{
  "code": "ACTIVATION_REQUEST_ALREADY_OPEN",
  "message": "Product already has an open warranty activation request",
  "details": {
    "requestCode": "WAR-20260727-0001",
    "currentStatus": "PENDING",
    "productId": "..."
  }
}
```

The Admin use case already delegates creation to the shared create use case, so
the same guard covers both entry points without duplicating business logic.

## Database Invariant and Concurrency

A PostgreSQL partial unique index will enforce one open request per non-null
`product_id`:

```sql
CREATE UNIQUE INDEX
  "warranty_activation_request_one_open_per_product"
ON "warranty_activation_request" ("product_id")
WHERE
  "product_id" IS NOT NULL
  AND "status" IN ('PENDING', 'APPROVED');
```

The application-level lookup provides a useful early error. The database index
is the final guard when requests race.

If create fails with Prisma `P2002` and it is not a `request_code` collision,
the use case will query `findOpenByProductId(product.id)`. When an open request
is found, it returns the same `ACTIVATION_REQUEST_ALREADY_OPEN` domain error.
Otherwise, it rethrows the original database error.

Before applying the migration to an environment, deployment must audit existing
`PENDING` and `APPROVED` rows grouped by `product_id`. If duplicates exist, the
migration stops; operators must resolve them explicitly instead of the migration
silently cancelling or deleting business records.

Development seed rows with request codes prefixed by `WAR-CHART-` are synthetic
dashboard aggregates rather than requests for physical Products. They retain
their Product snapshot fields but use `product_id = null`, preventing chart
fixtures from violating the physical-Product invariant.

## Error and Side-Effect Ordering

The open-request guard runs before Dealer lookup or quick Dealer creation. A
rejected duplicate therefore creates no Dealer, request, or notification.

Notification remains after successful request persistence. A uniqueness failure
does not publish a request-created notification.

## Testing

Unit tests will cover:

- A different phone number cannot bypass an existing `PENDING` request.
- An existing `APPROVED` request blocks creation.
- `REJECTED` and `CANCELLED` history permits a new request.
- The duplicate error includes the existing request code and status.
- A simulated concurrent unique conflict maps to the same domain error.
- A non-duplicate Prisma error is rethrown.
- Dealer creation and notification are not called for a duplicate.
- Existing Public Web and Admin delegation behavior remains valid.

Migration verification will audit duplicate open rows before applying the
partial unique index and verify that the index rejects a second open row for one
Product while allowing a new row after the previous request becomes
`REJECTED` or `CANCELLED`.

## Out of Scope

- UI changes.
- Public rate limiting or CAPTCHA.
- Changing Warranty lifecycle transitions.
- Automatically cleaning historical duplicate requests.
- Preventing multiple closed activation-request records for one Product.
