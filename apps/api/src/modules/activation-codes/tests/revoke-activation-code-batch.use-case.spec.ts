import { RevokeActivationCodeBatchUseCase } from '@/modules/activation-codes/use-cases/revoke-activation-code-batch.use-case';

describe('RevokeActivationCodeBatchUseCase', () => {
  it('defaults to revoking only unassigned codes for backward-compatible clients', async () => {
    const repository = {
      revokeBatch: jest.fn().mockResolvedValue({
        batchId: 'batch-id',
        revokedCount: 2,
      }),
    };

    const result = await new RevokeActivationCodeBatchUseCase(
      repository as never,
    ).execute('batch-id');

    expect(repository.revokeBatch).toHaveBeenCalledWith(
      'batch-id',
      'UNASSIGNED_ONLY',
    );
    expect(result).toEqual({ batchId: 'batch-id', revokedCount: 2 });
  });

  it('supports revoking every revocable code in the batch', async () => {
    const repository = {
      revokeBatch: jest.fn().mockResolvedValue({
        batchId: 'batch-id',
        revokedCount: 4,
      }),
    };

    await new RevokeActivationCodeBatchUseCase(repository as never).execute(
      'batch-id',
      'ALL_REVOCABLE',
    );

    expect(repository.revokeBatch).toHaveBeenCalledWith(
      'batch-id',
      'ALL_REVOCABLE',
    );
  });

  it('reports a missing batch', async () => {
    const repository = { revokeBatch: jest.fn().mockResolvedValue(null) };

    await expect(
      new RevokeActivationCodeBatchUseCase(repository as never).execute(
        'missing-batch-id',
      ),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });
});
