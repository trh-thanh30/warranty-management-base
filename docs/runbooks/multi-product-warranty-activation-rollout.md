# Multi-product warranty activation rollout

## Goal

Deploy the relational activation-item model without changing the public one-code/one-product flow or losing legacy activation requests.

## Required order

1. Restore a recent production backup into an isolated database.
2. Record the current activation-request count and open Product conflicts.
3. Deploy the database migration.
4. Run the rollout audit with `ON_ERROR_STOP` enabled.
5. Deploy API, then Admin and Web.
6. Repeat the audit and smoke-test public and Admin activation flows.

## Commands

From `apps/api`, point `DATABASE_URL` at the isolated production copy, never the live database for the first run:

```bash
pnpm exec prisma migrate deploy
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 \
  -f prisma/audits/20260815_multi_product_warranty_activation.sql
```

The audit reports:

- `legacy_request_count`: requests retaining a legacy parent `product_id`;
- `backfilled_request_count`: those requests with a matching relational item;
- `item_count`: total activation-request items;
- `request_without_item_count`: resolvable legacy requests missing their item;
- `duplicate_open_product_count`: Products reserved by more than one pending or approved item.

Both `request_without_item_count` and `duplicate_open_product_count` must be zero. The SQL exits with an error otherwise.

Before any live production migration, create and verify the VPS database backup from the deployment directory:

```bash
ENV_FILE=.env.production \
  COMPOSE_FILE=docker-compose.prod.yml \
  BACKUP_LABEL=manual \
  bash ./scripts/backup-production.sh
```

The deployment workflow synchronizes this script to the VPS but does not execute it. Run it manually for this rollout and schedule it independently from deployments for routine backups. Local VPS backups are only the first recovery layer; copy them to off-server storage before treating the backup process as disaster-recovery ready.

## Smoke tests

- Public: submit one valid E-Warranty code and verify one request with one `primaryProduct` item.
- Admin legacy category: create one request and verify the single-product display remains unchanged.
- Admin Film category: select distinct Products for configured positions, approve once, and verify all warranties activate.
- Verify each activated item has its own certificate and the customer receives one aggregate email.
- Search by an item product code, serial, and warranty code; export and compare item count and position columns.

## Rollback gate

If the migration or audit fails, do not deploy API/Admin/Web. Preserve the isolated database and audit output for reconciliation, correct the source data or migration, restore another copy, and rerun from step 1. Legacy parent columns remain in place during this rollout and must not be removed as part of rollback.
