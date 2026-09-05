import {
  ActivationCodeBatchesRepository,
  ProductActivationCodeReplacementConflictError,
} from '@/modules/activation-codes/repository/activation-code-batches.repository';

describe('ActivationCodeBatchesRepository product assignment', () => {
  it('reports how many codes in a batch are assigned to products', async () => {
    const batch = {
      id: 'batch-id',
      batch_code: 'ACB-001',
      product_sku: 'GENERIC',
      product_name: 'Kho mã dùng chung',
      quantity: 3,
      expires_at: new Date('2027-03-01T00:00:00.000Z'),
      created_at: new Date('2026-09-01T00:00:00.000Z'),
      codes: [
        { status: 'AVAILABLE', product_id: 'product-id' },
        { status: 'AVAILABLE', product_id: null },
        { status: 'ACTIVATED', product_id: 'activated-product-id' },
      ],
    };
    const transaction = jest.fn(
      (operation: (tx: unknown) => Promise<unknown>) =>
        operation({
          activationCodeBatch: {
            findMany: jest.fn().mockResolvedValue([batch]),
            count: jest.fn().mockResolvedValue(1),
          },
        }),
    );
    const repository = new ActivationCodeBatchesRepository(
      { $transaction: transaction } as never,
      {} as never,
    );

    const result = await repository.list({});

    expect(result.items[0]).toEqual(
      expect.objectContaining({ assignedCount: 2, quantity: 3 }),
    );
  });

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
