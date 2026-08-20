# Customer Birthdate in Warranty Activation

## Goal

Store a customer's birthdate on the customer profile so an admin does not need
to enter it again for every warranty activation request. Each request continues
to keep its own birthdate snapshot for audit and document generation.

## Current Behavior

- `WarrantyActivationRequest.customer_birthdate` stores an optional snapshot.
- `Customer` has no birthdate column.
- Selecting an existing customer fills name, phone, email, and address, but not
  birthdate.
- Approving a request resolves the customer by phone/email and updates contact
  fields only.

## Decisions

- Add an optional `birthdate` column to `Customer`; do not create a new table.
- Update the selected customer when the admin successfully creates the
  activation request, rather than waiting for approval.
- Identify the customer by `customerId`, not by matching phone or email.
- Persist the customer update and request creation atomically.
- Preserve `WarrantyActivationRequest.customer_birthdate` as an immutable
  request-time snapshot.
- An omitted birthdate does not erase an existing customer birthdate.
- Existing customers and requests remain valid with `null` birthdates.

## Domain Model

### Customer

Add:

```text
birthdate: DateTime?
```

Expose it through Customer create, update, detail, and list contracts as an ISO
date string or `null`. Customer edit may explicitly send `null` to clear the
profile value.

### Warranty activation request input

The Admin create-request contract adds:

```text
customerId: UUID (required for Admin requests)
customerBirthdate?: ISO date string
```

The public activation contract is unchanged because public users do not select
an existing Admin customer profile.

## Data Flow

1. Admin selects an existing customer.
2. Admin receives `CustomerSummary.birthdate` and the form initializes the
   birthdate input from it.
3. Admin may retain or change the date.
4. Admin submits `customerId` and `customerBirthdate` with the activation
   request.
5. API validates that the customer exists and that the submitted identity data
   does not conflict with that customer.
6. In one database transaction, API:
   - updates `Customer.birthdate` when a date was supplied;
   - creates the activation request with the same date in
     `customer_birthdate` as its snapshot.
7. A later request for the same customer pre-fills the stored birthdate.

## Customer Management UI

- Add the existing reusable date picker to create/edit Customer forms.
- Birthdate is optional.
- Reject invalid dates, dates before the supported minimum, and future dates.
- Customer create/update APIs persist the value directly.

## Business Rules

- A birthdate must be a valid ISO date and cannot be in the future.
- Activation request creation must not update a customer selected only by
  email or phone; `customerId` is authoritative for the Admin flow.
- When `customerBirthdate` is absent, retain the profile value and store the
  request snapshot as the current profile birthdate.
- When `customerBirthdate` is supplied, store it in both places.
- Clearing a birthdate is supported through Customer edit only; leaving the
  activation field empty never clears the Customer profile.
- A failed request creation must not leave a partial Customer update.
- Editing a Customer later does not rewrite historical request snapshots.

## Error Handling

- Unknown `customerId`: reject with a customer-not-found business error.
- Submitted phone/email belonging to another Customer: reject with the existing
  identity-conflict behavior.
- Invalid/future date: reject at both Admin validation and API DTO validation.
- Transaction failure: roll back both profile and request writes.

## Required Changes

- Prisma schema and migration for `Customer.birthdate`.
- Shared Customer and Admin activation-request contracts.
- Customer DTOs, mapper, create/update use cases, and repository mapping.
- Admin Customer create/edit form and translations.
- Admin activation form selection/payload mapping.
- API Admin activation request flow and repository transaction boundary.
- Tests for contracts, Customer CRUD, form mapping, prefill, snapshot behavior,
  atomic profile update, preservation on omission, and validation failures.

## Out of Scope

- Backfilling Customer birthdates from historical activation requests.
- Changing existing request snapshots when a Customer is edited.
- Adding birthdate to the public activation form.
- Altering certificate/PDF layout.

## Acceptance Criteria

- Existing Customer with a birthdate automatically pre-fills the activation
  form.
- Creating an Admin activation request stores the birthdate on both Customer
  and request snapshot.
- Omitting the field preserves an existing Customer birthdate and snapshots it
  on the new request.
- Failed request creation leaves Customer unchanged.
- Customer create/edit supports the optional birthdate.
- Existing records with no birthdate continue to work.
