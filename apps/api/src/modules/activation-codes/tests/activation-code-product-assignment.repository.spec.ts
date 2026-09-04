import {
  ActivationCodeBatchesRepository,
  ProductActivationCodeReplacementConflictError,
} from '@/modules/activation-codes/repository/activation-code-batches.repository';

describe('ActivationCodeBatchesRepository product assignment', () => {
  it('releases the current code and assigns its replacement in one transaction', async () => {
    const updateMany = jest
      .fn()
      .mockResolvedValueOnce({ count: 1 })
      .mockResolvedValueOnce({ count: 1 });
    const transaction = jest.fn(
      (operation: (tx: unknown) => Promise<unknown>) =>
        operation({ activationCode: { updateMany } }),
    );
    const repository = new ActivationCodeBatchesRepository(
      { $transaction: transaction } as never,
      {} as never,
    );
    const now = new Date('2026-09-04T00:00:00.000Z');

    await repository.replaceProductAssignment({
      currentActivationCodeId: 'current-code-id',
      replacementActivationCodeId: 'replacement-code-id',
      productId: 'product-id',
      now,
    });

    expect(transaction).toHaveBeenCalledTimes(1);
    expect(updateMany).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        where: expect.objectContaining({
          id: 'current-code-id',
          product_id: 'product-id',
        }),
        data: { product_id: null },
      }),
    );
    expect(updateMany).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        where: expect.objectContaining({
          id: 'replacement-code-id',
          product_id: null,
        }),
        data: { product_id: 'product-id' },
      }),
    );
  });

  it('aborts the transaction when the replacement is no longer assignable', async () => {
    const updateMany = jest
      .fn()
      .mockResolvedValueOnce({ count: 1 })
      .mockResolvedValueOnce({ count: 0 });
    const transaction = jest.fn(
      (operation: (tx: unknown) => Promise<unknown>) =>
        operation({ activationCode: { updateMany } }),
    );
    const repository = new ActivationCodeBatchesRepository(
      { $transaction: transaction } as never,
      {} as never,
    );

    await expect(
      repository.replaceProductAssignment({
        currentActivationCodeId: 'current-code-id',
        replacementActivationCodeId: 'replacement-code-id',
        productId: 'product-id',
        now: new Date('2026-09-04T00:00:00.000Z'),
      }),
    ).rejects.toBeInstanceOf(ProductActivationCodeReplacementConflictError);
    expect(transaction).toHaveBeenCalledTimes(1);
  });
});
