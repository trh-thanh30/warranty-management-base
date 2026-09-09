import { ExtendActivationCodeBatchExpiryUseCase } from '@/modules/activation-codes/use-cases/extend-activation-code-batch-expiry.use-case';

describe('ExtendActivationCodeBatchExpiryUseCase', () => {
  it('returns the updated batch expiry and mutually exclusive skip counts', async () => {
    const repository = {
      extendBatchExpiry: jest.fn().mockResolvedValue({
        kind: 'EXTENDED',
        previousExpiresAt: new Date('2027-01-31T10:30:00.000Z'),
        expiresAt: new Date('2027-02-28T10:30:00.000Z'),
        extendedCount: 75,
        skipped: { activated: 10, revoked: 10, expired: 5 },
      }),
    };

    const result = await new ExtendActivationCodeBatchExpiryUseCase(
      repository as never,
    ).execute('batch-id', 1);

    expect(repository.extendBatchExpiry).toHaveBeenCalledWith({
      batchId: 'batch-id',
      months: 1,
      now: expect.any(Date),
    });
    expect(result).toEqual({
      batchId: 'batch-id',
      previousExpiresAt: '2027-01-31T10:30:00.000Z',
      expiresAt: '2027-02-28T10:30:00.000Z',
      extendedCount: 75,
      skipped: { activated: 10, revoked: 10, expired: 5 },
    });
  });

  it('returns zero without changing expiry when no code is eligible', async () => {
    const expiresAt = new Date('2027-01-31T10:30:00.000Z');
    const repository = {
      extendBatchExpiry: jest.fn().mockResolvedValue({
        kind: 'NO_ELIGIBLE_CODES',
        previousExpiresAt: expiresAt,
        expiresAt,
        extendedCount: 0,
        skipped: { activated: 2, revoked: 1, expired: 0 },
      }),
    };

    await expect(
      new ExtendActivationCodeBatchExpiryUseCase(repository as never).execute(
        'batch-id',
        1,
      ),
    ).resolves.toMatchObject({
      previousExpiresAt: expiresAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
      extendedCount: 0,
    });
  });

  it.each([
    ['NOT_FOUND', 'NOT_FOUND'],
    ['EXPIRED_BATCH', 'ACTIVATION_CODE_BATCH_EXTENSION_EXPIRED'],
    ['CONFLICT', 'ACTIVATION_CODE_BATCH_EXTENSION_CONFLICT'],
  ])('maps %s repository result to %s', async (kind, code) => {
    const repository = {
      extendBatchExpiry: jest.fn().mockResolvedValue({ kind }),
    };

    await expect(
      new ExtendActivationCodeBatchExpiryUseCase(repository as never).execute(
        'batch-id',
        1,
      ),
    ).rejects.toMatchObject({ code });
  });
});
