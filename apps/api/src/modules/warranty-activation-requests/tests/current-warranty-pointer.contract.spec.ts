import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { WarrantyActivationRequestQueries } from '@/modules/warranty-activation-requests/repository/warranty-activation-requests.repository.queries';
import { WarrantyActivationReviewTransactionRepository } from '@/modules/warranty-activation-requests/repository/warranty-activation-review-transaction.repository';
import { activation_code_status } from '@prisma/client';

describe('current warranty pointer contract', () => {
  it('updates the product pointer inside the activation transaction', async () => {
    const update = jest.fn().mockResolvedValue({ id: 'product-id' });
    const repository = new WarrantyActivationReviewTransactionRepository(
      { product: { update } } as never,
      new WarrantyActivationRequestQueries(),
    );

    await repository.setCurrentWarranty('product-id', 'warranty-id');

    expect(update).toHaveBeenCalledWith({
      where: { id: 'product-id' },
      data: { current_warranty_id: 'warranty-id' },
    });
  });

  it('activates only codes reserved by a pending request', async () => {
    const updateMany = jest.fn().mockResolvedValue({ count: 1 });
    const repository = new WarrantyActivationReviewTransactionRepository(
      { activationCode: { updateMany } } as never,
      new WarrantyActivationRequestQueries(),
    );
    const activatedAt = new Date('2026-09-06T00:00:00.000Z');

    await repository.markActivationCodesActivated(
      ['activation-code-id'],
      activatedAt,
    );

    expect(updateMany).toHaveBeenCalledWith({
      where: {
        expires_at: { gt: activatedAt },
        id: { in: ['activation-code-id'] },
        status: activation_code_status.PENDING_APPROVAL,
        warranty: { is: null },
      },
      data: {
        activated_at: activatedAt,
        status: activation_code_status.ACTIVATED,
      },
    });
  });

  it('backfills products affected before the activation fix', () => {
    const migration = readFileSync(
      join(
        process.cwd(),
        'prisma/migrations/20260908140000_repair_product_current_warranty/migration.sql',
      ),
      'utf8',
    );

    expect(migration).toContain('WHERE "status" = \'ACTIVE\'');
    expect(migration).toContain(
      'SET "current_warranty_id" = "latest_active_warranty"."id"',
    );
    expect(migration).toContain('ORDER BY');
  });

  it('reconciles valid legacy pending request codes without hiding conflicts', () => {
    const migration = readFileSync(
      join(
        process.cwd(),
        'prisma/migrations/20260908160000_reconcile_pending_activation_codes/migration.sql',
      ),
      'utf8',
    );

    expect(migration).toContain('SET "status" = \'PENDING_APPROVAL\'');
    expect(migration).toContain('COUNT(DISTINCT request_id) = 1');
    expect(migration).toContain('RAISE NOTICE');
    expect(migration).toContain('code."expires_at" > NOW()');
  });
});
