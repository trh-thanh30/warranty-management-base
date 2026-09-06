import { ActivationCodeBatchesRepository } from '@/modules/activation-codes/repository/activation-code-batches.repository';

describe('ActivationCodeBatchesRepository code revocation', () => {
  it('revokes only an unused code and releases its product assignment', async () => {
    const updateMany = jest.fn().mockResolvedValue({ count: 1 });
    const repository = new ActivationCodeBatchesRepository(
      { activationCode: { updateMany } } as never,
      {} as never,
    );

    const result = await repository.revoke('code-id');

    expect(updateMany).toHaveBeenCalledWith({
      where: {
        id: 'code-id',
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
    expect(result).toEqual({ count: 1 });
  });
});
