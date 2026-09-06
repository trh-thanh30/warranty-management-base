import { ActivationCodeBatchesRepository } from '@/modules/activation-codes/repository/activation-code-batches.repository';

describe('ActivationCodeBatchesRepository batch revocation', () => {
  it('revokes only unused, unassigned codes in the safe scope', async () => {
    const findUnique = jest.fn().mockResolvedValue({ id: 'batch-id' });
    const updateMany = jest.fn().mockResolvedValue({ count: 2 });
    const transaction = jest.fn(
      (operation: (tx: unknown) => Promise<unknown>) =>
        operation({
          activationCodeBatch: { findUnique },
          activationCode: { updateMany },
        }),
    );
    const repository = new ActivationCodeBatchesRepository(
      { $transaction: transaction } as never,
      {} as never,
    );

    const result = await repository.revokeBatch('batch-id', 'UNASSIGNED_ONLY');

    expect(updateMany).toHaveBeenCalledWith({
      where: {
        batch_id: 'batch-id',
        status: 'AVAILABLE',
        product_id: null,
        request: { is: null },
        request_items: { none: {} },
        warranty: { is: null },
      },
      data: {
        status: 'REVOKED',
        revoked_at: expect.any(Date),
      },
    });
    expect(result).toEqual({
      batchId: 'batch-id',
      scope: 'UNASSIGNED_ONLY',
      revokedCount: 2,
    });
  });

  it('atomically revokes assigned unused codes and releases their products', async () => {
    const findUnique = jest.fn().mockResolvedValue({ id: 'batch-id' });
    const updateMany = jest.fn().mockResolvedValue({ count: 3 });
    const transaction = jest.fn(
      (operation: (tx: unknown) => Promise<unknown>) =>
        operation({
          activationCodeBatch: { findUnique },
          activationCode: { updateMany },
        }),
    );
    const repository = new ActivationCodeBatchesRepository(
      { $transaction: transaction } as never,
      {} as never,
    );

    const result = await repository.revokeBatch('batch-id', 'ALL_REVOCABLE');

    expect(transaction).toHaveBeenCalledTimes(1);
    expect(updateMany).toHaveBeenCalledWith({
      where: {
        batch_id: 'batch-id',
        status: 'AVAILABLE',
        request: { is: null },
        request_items: { none: {} },
        warranty: { is: null },
      },
      data: {
        status: 'REVOKED',
        revoked_at: expect.any(Date),
        product_id: null,
      },
    });
    expect(result).toEqual({
      batchId: 'batch-id',
      scope: 'ALL_REVOCABLE',
      revokedCount: 3,
    });
  });

  it('previews revocable codes separately from protected codes', async () => {
    const findUnique = jest.fn().mockResolvedValue({ id: 'batch-id' });
    const count = jest
      .fn()
      .mockResolvedValueOnce(12)
      .mockResolvedValueOnce(5)
      .mockResolvedValueOnce(3)
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(2);
    const transaction = jest.fn(
      (operation: (tx: unknown) => Promise<unknown>) =>
        operation({
          activationCodeBatch: { findUnique },
          activationCode: { count },
        }),
    );
    const repository = new ActivationCodeBatchesRepository(
      { $transaction: transaction } as never,
      {} as never,
    );

    const result = await repository.getRevokePreview('batch-id');

    expect(result).toEqual({
      batchId: 'batch-id',
      totalCount: 12,
      unassignedRevocableCount: 5,
      assignedRevocableCount: 3,
      requestProtectedCount: 2,
      activatedProtectedCount: 2,
    });
    expect(count).toHaveBeenNthCalledWith(2, {
      where: expect.objectContaining({
        batch_id: 'batch-id',
        product_id: null,
        request: { is: null },
        request_items: { none: {} },
        warranty: { is: null },
      }),
    });
    expect(count).toHaveBeenNthCalledWith(4, {
      where: expect.objectContaining({
        status: 'AVAILABLE',
        OR: [{ request: { isNot: null } }, { request_items: { some: {} } }],
      }),
    });
  });
});
