import {
  ActivationCodeBatchesRepository,
  ProductActivationCodeAssignmentConflictError,
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
      _count: { codes: 1 },
      codes: [
        { status: 'AVAILABLE', product_id: 'product-id' },
        { status: 'AVAILABLE', product_id: null },
        { status: 'ACTIVATED', product_id: 'activated-product-id' },
      ],
    };
    const findMany = jest.fn().mockResolvedValue([batch]);
    const transaction = jest.fn(
      (operation: (tx: unknown) => Promise<unknown>) =>
        operation({
          activationCodeBatch: {
            findMany,
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
      expect.objectContaining({
        assignableCount: 1,
        assignedCount: 2,
        quantity: 3,
      }),
    );
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({
          _count: {
            select: {
              codes: { where: expect.objectContaining({ product_id: null }) },
            },
          },
        }),
      }),
    );
  });

  it('assigns all selected codes in one transaction', async () => {
    const updateMany = jest.fn().mockResolvedValue({ count: 2 });
    const transaction = jest.fn(
      (operation: (tx: unknown) => Promise<unknown>) =>
        operation({ activationCode: { updateMany } }),
    );
    const repository = new ActivationCodeBatchesRepository(
      { $transaction: transaction } as never,
      {} as never,
    );
    const now = new Date('2026-09-09T00:00:00.000Z');

    await repository.assignProduct(
      ['first-code-id', 'second-code-id'],
      'product-id',
      now,
    );

    expect(transaction).toHaveBeenCalledTimes(1);
    expect(updateMany).toHaveBeenCalledWith({
      where: expect.objectContaining({
        id: { in: ['first-code-id', 'second-code-id'] },
        product_id: null,
      }),
      data: { product_id: 'product-id' },
    });
  });

  it('aborts bulk assignment when any selected code is no longer assignable', async () => {
    const updateMany = jest.fn().mockResolvedValue({ count: 1 });
    const transaction = jest.fn(
      (operation: (tx: unknown) => Promise<unknown>) =>
        operation({ activationCode: { updateMany } }),
    );
    const repository = new ActivationCodeBatchesRepository(
      { $transaction: transaction } as never,
      {} as never,
    );

    await expect(
      repository.assignProduct(
        ['first-code-id', 'second-code-id'],
        'product-id',
        new Date('2026-09-09T00:00:00.000Z'),
      ),
    ).rejects.toBeInstanceOf(ProductActivationCodeAssignmentConflictError);
  });

  it('assigns an inclusive range from the assignable codes in one batch transaction', async () => {
    const findUnique = jest.fn().mockResolvedValue({ id: 'batch-id' });
    const findMany = jest
      .fn()
      .mockResolvedValue([{ id: 'third-code-id' }, { id: 'fourth-code-id' }]);
    const updateMany = jest.fn().mockResolvedValue({ count: 2 });
    const transaction = jest.fn(
      (operation: (tx: unknown) => Promise<unknown>) =>
        operation({
          activationCodeBatch: { findUnique },
          activationCode: { findMany, updateMany },
        }),
    );
    const repository = new ActivationCodeBatchesRepository(
      { $transaction: transaction } as never,
      {} as never,
    );
    const now = new Date('2026-09-09T00:00:00.000Z');

    const result = await repository.assignProductByBatch({
      batchId: 'batch-id',
      from: 3,
      now,
      productId: 'product-id',
      to: 4,
    });

    expect(result).toEqual({
      activationCodeIds: ['third-code-id', 'fourth-code-id'],
      count: 2,
    });
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: [{ created_at: 'asc' }, { id: 'asc' }],
        skip: 2,
        take: 2,
        where: expect.objectContaining({
          batch_id: 'batch-id',
          product_id: null,
          status: 'AVAILABLE',
        }),
      }),
    );
    expect(updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { product_id: 'product-id' },
        where: expect.objectContaining({
          id: { in: ['third-code-id', 'fourth-code-id'] },
        }),
      }),
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
