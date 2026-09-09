import { ActivationCodeBatchesRepository } from '@/modules/activation-codes/repository/activation-code-batches.repository';
import { activation_code_status } from '@prisma/client';

describe('ActivationCodeBatchesRepository.extendCodeExpiry', () => {
  const now = new Date('2026-09-10T00:00:00.000Z');

  it('extends from the current expiry and clamps the target month end', async () => {
    const findUnique = jest.fn().mockResolvedValue({
      id: 'code-id',
      status: activation_code_status.AVAILABLE,
      expires_at: new Date('2027-01-31T10:30:00.000Z'),
    });
    const updateMany = jest.fn().mockResolvedValue({ count: 1 });
    const repository = new ActivationCodeBatchesRepository(
      {
        $transaction: (operation: (tx: unknown) => Promise<unknown>) =>
          operation({ activationCode: { findUnique, updateMany } }),
      } as never,
      {} as never,
    );

    await expect(
      repository.extendCodeExpiry({ id: 'code-id', months: 1, now }),
    ).resolves.toEqual({
      kind: 'EXTENDED',
      previousExpiresAt: new Date('2027-01-31T10:30:00.000Z'),
      expiresAt: new Date('2027-02-28T10:30:00.000Z'),
    });
    expect(updateMany).toHaveBeenCalledWith({
      where: {
        id: 'code-id',
        status: activation_code_status.AVAILABLE,
        expires_at: {
          equals: new Date('2027-01-31T10:30:00.000Z'),
          gt: now,
        },
      },
      data: { expires_at: new Date('2027-02-28T10:30:00.000Z') },
    });
  });

  it.each([
    [activation_code_status.ACTIVATED, 'ACTIVATED'],
    [activation_code_status.REVOKED, 'REVOKED'],
  ])('rejects %s codes', async (status, kind) => {
    const repository = new ActivationCodeBatchesRepository(
      {
        $transaction: (operation: (tx: unknown) => Promise<unknown>) =>
          operation({
            activationCode: {
              findUnique: jest.fn().mockResolvedValue({
                id: 'code-id',
                status,
                expires_at: new Date('2027-01-01T00:00:00.000Z'),
              }),
              updateMany: jest.fn(),
            },
          }),
      } as never,
      {} as never,
    );

    await expect(
      repository.extendCodeExpiry({ id: 'code-id', months: 1, now }),
    ).resolves.toEqual({ kind });
  });

  it('rejects codes whose expiry has passed', async () => {
    const repository = new ActivationCodeBatchesRepository(
      {
        $transaction: (operation: (tx: unknown) => Promise<unknown>) =>
          operation({
            activationCode: {
              findUnique: jest.fn().mockResolvedValue({
                id: 'code-id',
                status: activation_code_status.EXPIRED,
                expires_at: now,
              }),
              updateMany: jest.fn(),
            },
          }),
      } as never,
      {} as never,
    );

    await expect(
      repository.extendCodeExpiry({ id: 'code-id', months: 1, now }),
    ).resolves.toEqual({ kind: 'EXPIRED' });
  });
});
