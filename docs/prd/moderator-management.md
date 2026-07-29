# Moderator Management

## Problem

The Admin app has a mock Users screen even though the API already supports user accounts and per-user permission overrides. Admins need a safe way to manage internal staff without exposing customer-account management or hard deletion.

## Goals

- Manage Moderator accounts from the existing locale-aware `/users` route.
- List, search, paginate, create, edit, activate, and deactivate staff accounts.
- Let Admins grant or revoke operational permissions per Moderator.
- Persist only permission differences from the Moderator role defaults.
- Make Admin-created Moderator accounts immediately eligible for admin login.

## Non-goals

- Customer account or Customer profile management.
- Hard deletion of staff accounts.
- Allowing Moderators to manage users, roles, or permission overrides.
- First-login password rotation and invitation email delivery.

## User Stories

- As an Admin, I can find active and inactive staff accounts.
- As an Admin, I can create a verified Moderator and receive a generated temporary password once.
- As an Admin, I can update staff identity fields and account status.
- As an Admin, I can preview effective permissions and save per-user overrides.
- As an Admin, I can restore a Moderator to role-default permissions.

## Functional Requirements

- The list API is called with `role=MODERATOR`.
- Create always sends role `MODERATOR`, status `ACTIVE`, and creates a verified account.
- Staff create fields are full name, username, email, and optional phone; the backend generates a secure 12-character temporary password.
- The plaintext temporary password is returned only by the create response, shown once, and never persisted.
- Deactivation uses user update; the UI does not expose hard delete.
- Permission UI excludes the `USER_*` permission group.
- Permission updates send the complete current override set.
- Permission reset sends an empty override list.
- Loading, empty, API error, and success feedback are visible.

## Technical Constraints

- Keep `app/**/page.tsx` thin and place implementation in `src/views/users`.
- API response/domain contracts belong in `packages/shared`.
- Backend controllers remain thin; business rules require use-case coverage.
- Only Admin may access Users and permission-management endpoints.
- Existing role defaults and `UserPermission` persistence remain the source of truth.

## Open Questions

- None for this slice.

## Rollout and Verification

- Unit-test Moderator creation and permission-override behavior.
- Run API tests, type-check, lint, and build.
- Run Admin tests, type-check, lint, and build.
- Manually verify list, create, edit status, save permissions, reset permissions, and Moderator login.
