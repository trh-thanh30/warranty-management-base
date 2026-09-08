import { GetActivationCodeBatchRevokePreviewUseCase } from '@/modules/activation-codes/use-cases/get-activation-code-batch-revoke-preview.use-case';

describe('GetActivationCodeBatchRevokePreviewUseCase', () => {
  it('returns the batch revoke impact', async () => {
    const preview = {
      batchId: 'batch-id',
      totalCount: 10,
      unassignedRevocableCount: 4,
      assignedRevocableCount: 2,
      requestProtectedCount: 1,
      activatedProtectedCount: 3,
    };
    const repository = {
      getRevokePreview: jest.fn().mockResolvedValue(preview),
    };

    const result = await new GetActivationCodeBatchRevokePreviewUseCase(
      repository as never,
    ).execute('batch-id');

    expect(result).toEqual(preview);
  });

  it('reports a missing batch', async () => {
    const repository = {
      getRevokePreview: jest.fn().mockResolvedValue(null),
    };

    await expect(
      new GetActivationCodeBatchRevokePreviewUseCase(
        repository as never,
      ).execute('missing-batch-id'),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });
});
