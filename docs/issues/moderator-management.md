# Moderator Management Vertical Slices

## Slice 1 — Create Login-Ready Staff Accounts

### Objective

Allow Admin to create a verified Moderator with complete staff identity fields.

### Scope

- Shared create/update contracts and validation.
- Backend create flow with fixed Moderator role and verified status.
- Unit tests for password hashing, role, status, and verification behavior.

### Acceptance Criteria

- Created staff has role `MODERATOR`, status `ACTIVE`, and `is_verified=true`.
- Full name and optional phone are persisted.
- Password is hashed and never returned as plain text.

### Verification

```bash
pnpm --filter @repo/api test
pnpm --filter @repo/api check-types
```

## Slice 2 — Staff Directory

### Objective

Replace mock Users UI with an API-backed Moderator directory.

### Scope

- Admin users service.
- Search debounce, status filter, pagination, loading, empty, and error states.
- Permission-aware navigation and actions.

### Acceptance Criteria

- Requests always filter `role=MODERATOR`.
- Admin can search and filter active/inactive staff.
- Mock user constants are no longer rendered.

### Verification

```bash
pnpm --filter @repo/admin test
pnpm --filter @repo/admin lint
```

## Slice 3 — Create and Edit Staff

### Objective

Provide Admin forms for creating and updating Moderator accounts.

### Scope

- Create/edit dialog.
- Activate/deactivate action.
- Validation and success/error toast feedback.

### Acceptance Criteria

- Role cannot be changed from Moderator.
- Blank edit password is omitted.
- Deactivation uses update and no hard-delete action is shown.

### Verification

```bash
pnpm --filter @repo/admin test
pnpm --filter @repo/admin lint
```

## Slice 4 — Per-Staff Permission Overrides

### Objective

Allow Admin to customize operational permissions per Moderator.

### Scope

- Permission detail query and update mutation.
- Grouped permission dialog excluding `USER_*`.
- Diff calculation against Moderator role defaults.
- Restore-default action.

### Acceptance Criteria

- Effective permissions are visible.
- Only differences from defaults are persisted.
- Restore default sends an empty override list.
- Moderator cannot manage permissions through API or UI.

### Verification

```bash
pnpm --filter @repo/api test
pnpm --filter @repo/admin test
pnpm lint
```
