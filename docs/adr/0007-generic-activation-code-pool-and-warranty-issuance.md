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
  Product. Its Warranty link and warranty code are nullable until issuance.
- Multiple request items may select the same Product when their activation codes
  differ.
- Category has a first-class `activation_code_enabled` flag. Eligibility is
  configuration data, not migration logic. The Film seed sets the flag to false;
  runtime code and migrations must not match category codes or display names.
- Customer and Dealer email addresses are not unique identifiers. Customer
  identity continues to use customer code and phone; delivery recipient
  resolution is `customer.email ?? dealer.email ?? null`.

## Compatibility and rollout

- `Product.current_warranty_id` temporarily preserves the legacy singular
  `product.warranty` relation while existing product, claim and manual warranty
  flows migrate to `product.warranties`.
- Existing issued request-to-warranty activation-code links are backfilled.
- Existing product-bound batches remain readable and printable. New batch
  creation will stop writing product snapshots in the API cut-over.

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
- Approval must create warranties transactionally and idempotently by
  activation code.
- Certificate and email failures occur after warranty issuance and cannot roll
  the warranty back.
- The compatibility pointer is transitional debt and must be removed after all
  legacy singular-warranty consumers are migrated.
