# 0007 - Generic activation code pool and warranty issuance

## Status

Accepted

## Context

Activation-code batches were initially tied to one Product and copied that
product's warranty snapshot when generated. Warranty also enforced a unique
`product_id`, so a Product could only have one issued warranty. The confirmed
business flow instead prints generic labels that may be attached to any
eligible product. After attaching a label, staff records which Product the code
was attached to. Customer and dealer activation flows resolve that pre-assigned
Product from the submitted code and cannot select a different Product. Every
one-time code issues its own warranty after admin approval.

Customer email is optional and may be shared. Delivery uses the customer's
email first and falls back to the dealer's email. Window Film keeps its existing
activation flow and is not eligible for the generic code pool.

## Decision

- ActivationCodeBatch and new ActivationCode records are product-independent at
  generation time. Existing batch product snapshots remain nullable legacy data
  during the cut-over.
- Product remains the authoritative product catalogue aggregate. No
  ProductDefinition or ProductTemplate model is introduced.
- Product owns reusable warranty-policy fields. Warranty represents issuance
  history, so Product has many warranties.
- Product creation, update and import manage the reusable policy only. They do
  not create a draft Warranty or a customer-facing warranty lookup code.
- An available code is assigned to a Product by staff after the physical label
  is attached. Assignment does not consume the code and does not issue a
  Warranty.
- Warranty has an optional, unique `activation_code_id`. This is the database
  invariant for one code issuing at most one warranty.
- WarrantyActivationRequestItem carries the Product resolved from the assigned
  ActivationCode. Public and dealer request payloads cannot override that
  Product. A unique customer-facing warranty code is reserved on each request
  item when the request is created; the Warranty link remains nullable until
  approval issues the Warranty.
- Multiple request items may select the same Product when their activation codes
  differ.
- Category has a first-class `activation_code_enabled` flag. Eligibility is
  configuration data, not migration logic. The Film seed sets the flag to false;
  runtime code and migrations must not match category codes or display names.
- Customer and Dealer email addresses are not unique identifiers. Customer
  identity continues to use customer code and phone; delivery recipient
  resolution is `customer.email ?? dealer.email ?? null`.

## Activation-code lifecycle

Assignment and lifecycle state are separate concepts. Assigning a code records
which Product carries the physical label, but the code remains `AVAILABLE`.
Submitting an activation request is the operation that consumes its
availability and reserves it for review.

`PENDING_APPROVAL` is an ActivationCode state. `PENDING` is the corresponding
WarrantyActivationRequest state. They must be transitioned atomically so the
system never exposes a pending request whose code is still available for a
second submission.

| Event                                   | Required current code state | Next code state    | Request outcome                                                          |
| --------------------------------------- | --------------------------- | ------------------ | ------------------------------------------------------------------------ |
| Assign code to Product                  | `AVAILABLE`                 | `AVAILABLE`        | No request or Warranty is created                                        |
| Submit activation request               | `AVAILABLE`                 | `PENDING_APPROVAL` | Create one `PENDING` request and reserve a new Warranty code             |
| Approve request                         | `PENDING_APPROVAL`          | `ACTIVATED`        | Issue and activate one Warranty, then mark the request `ACTIVATED`       |
| Reject request while code remains valid | `PENDING_APPROVAL`          | `AVAILABLE`        | Mark the request `REJECTED`; keep the Product assignment                 |
| Cancel request while code remains valid | `PENDING_APPROVAL`          | `AVAILABLE`        | Mark the request `CANCELLED`; keep the Product assignment                |
| Reject or cancel after expiry           | `PENDING_APPROVAL`          | `EXPIRED`          | Preserve the terminal request history and do not release an expired code |
| Code expires while awaiting review      | `PENDING_APPROVAL`          | `EXPIRED`          | Cancel the pending request with a system expiry reason                   |
| Revoke an available code                | `AVAILABLE`                 | `REVOKED`          | No open activation request may reference the code                        |

Ordinary batch revocation excludes `PENDING_APPROVAL` codes. Staff must first
reject or cancel the pending request before revoking a released code. A race
between expiry, review, cancellation, and revocation is resolved by a
conditional transactional state transition; exactly one transition may win.

The following invariants apply:

- One code may have at most one open activation request.
- A code in `PENDING_APPROVAL` is neither assignable nor submittable again.
- A duplicate public submission receives a stable
  `ACTIVATION_REQUEST_ALREADY_OPEN` conflict and never a database constraint
  error.
- Rejecting or cancelling a valid request releases the code but does not remove
  its Product assignment, allowing corrected customer information to be
  submitted for the same physical item.
- A rejected or cancelled request keeps its reserved Warranty code as
  historical data. A later request receives a new reserved Warranty code.
- `ACTIVATED`, `REVOKED`, and `REPLACED` are terminal for that code. An
  `EXPIRED` code may only move to `REPLACED` through the explicit replacement
  workflow.
- Approval is permitted only while the code is `PENDING_APPROVAL`, unexpired,
  assigned to the request Product, and not already linked to a Warranty.

## Compatibility and rollout

- `Product.current_warranty_id` temporarily preserves the legacy singular
  `product.warranty` relation while existing product, claim and manual warranty
  flows migrate to `product.warranties`.
- Existing issued request-to-warranty activation-code links are backfilled.
- Existing product-bound batches remain readable and printable. New batch
  creation will stop writing product snapshots in the API cut-over.
- During the lifecycle cut-over, existing pending requests whose codes are
  still `AVAILABLE` must be reconciled to `PENDING_APPROVAL` before public Web
  starts submitting activation codes. The reconciliation must skip expired,
  revoked, activated, and conflicting records and report them for manual
  review.
- Runtime implementation must reserve/release the code and create/update its
  activation request in one transaction. Relationship constraints remain
  defense in depth; they are not a substitute for the lifecycle state.

## Rollback

Application rollback is supported while the legacy batch snapshots and
`current_warranty_id` compatibility pointer remain. Reintroducing the old unique
constraint on `warranty.product_id` is not automatic after multiple warranties
have been issued for one Product. A database rollback must first disable new
issuance, export new activation-code links, reconcile products with more than one
warranty, and only then recreate the old unique indexes. A production backup is
mandatory before migration.

## Consequences

- Unassigned generic codes are not reported by Product. Assigned available
  codes may be counted for their Product before activation.
- Product-level reports distinguish assigned available codes, pending request
  items and issued warranties.
- Product and batch UIs distinguish `AVAILABLE` from `PENDING_APPROVAL`; an
  assigned pending code must not be labelled as available for activation.
- Approval must create warranties transactionally and idempotently by
  activation code.
- Rejected requests retain their reserved warranty codes as immutable history;
  those codes never identify an issued Warranty.
- Certificate and email failures occur after warranty issuance and cannot roll
  the warranty back.
- The compatibility pointer is transitional debt and must be removed after all
  legacy singular-warranty consumers are migrated.
