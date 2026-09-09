import { ActivationCodeBatchesRepository } from '@/modules/activation-codes/repository/activation-code-batches.repository';
import { activation_code_status } from '@prisma/client';

describe('ActivationCodeBatchesRepository.extendBatchExpiry', () => {
  const now = new Date('2026-09-10T00:00:00.000Z');

  it('extends eligible codes and reports each skipped code once', async () => {
    const batchExpiry = new Date('2027-01-31T10:30:00.000Z');
    const codeExpiry = new Date('2027-03-31T12:00:00.000Z');
    const findUnique = jest.fn().mockResolvedValue({
      id: 'batch-id',
      expires_at: batchExpiry,
      codes: [
        {
          id: 'available-id',
          status: activation_code_status.AVAILABLE,
          expires_at: codeExpiry,
        },
        {
          id: 'pending-id',
          status: activation_code_status.PENDING_APPROVAL,
          expires_at: codeExpiry,
        },
        {
          id: 'activated-expired-id',
          status: activation_code_status.ACTIVATED,
          expires_at: new Date('2026-01-01T00:00:00.000Z'),
        },
        {
          id: 'revoked-expired-id',
          status: activation_code_status.REVOKED,
          expires_at: new Date('2026-01-01T00:00:00.000Z'),
        },
        {
          id: 'expired-id',
          status: activation_code_status.EXPIRED,
          expires_at: new Date('2026-01-01T00:00:00.000Z'),
        },
      ],
    });
    const codeUpdateMany = jest.fn().mockResolvedValue({ count: 2 });
    const batchUpdateMany = jest.fn().mockResolvedValue({ count: 1 });
    const repository = new ActivationCodeBatchesRepository(
      {
        $transaction: (operation: (tx: unknown) => Promise<unknown>) =>
          operation({
            activationCode: { updateMany: codeUpdateMany },
            activationCodeBatch: {
              findUnique,
              updateMany: batchUpdateMany,
            },
          }),
      } as never,
      {} as never,
    );

    await expect(
      repository.extendBatchExpiry({ batchId: 'batch-id', months: 1, now }),
    ).resolves.toEqual({
      kind: 'EXTENDED',
      previousExpiresAt: batchExpiry,
      expiresAt: new Date('2027-02-28T10:30:00.000Z'),
      extendedCount: 2,
      skipped: { activated: 1, revoked: 1, expired: 1 },
    });
    expect(codeUpdateMany).toHaveBeenCalledWith({
      where: {
        id: { in: ['available-id', 'pending-id'] },
        status: { in: ['AVAILABLE', 'PENDING_APPROVAL'] },
        expires_at: { equals: codeExpiry, gt: now },
      },
      data: { expires_at: new Date('2027-04-30T12:00:00.000Z') },
    });
    expect(batchUpdateMany).toHaveBeenCalledWith({
      where: {
        id: 'batch-id',
        expires_at: { equals: batchExpiry, gt: now },
      },
      data: { expires_at: new Date('2027-02-28T10:30:00.000Z') },
    });
  });

  it('does not update the batch when every code is ineligible', async () => {
    const expiresAt = new Date('2027-01-31T10:30:00.000Z');
    const updateMany = jest.fn();
    const repository = new ActivationCodeBatchesRepository(
      {
        $transaction: (operation: (tx: unknown) => Promise<unknown>) =>
          operation({
            activationCode: { updateMany },
            activationCodeBatch: {
              findUnique: jest.fn().mockResolvedValue({
                id: 'batch-id',
                expires_at: expiresAt,
                codes: [
                  {
                    id: 'activated-id',
                    status: activation_code_status.ACTIVATED,
                    expires_at: expiresAt,
                  },
                ],
              }),
              updateMany,
            },
          }),
      } as never,
      {} as never,
    );

    await expect(
      repository.extendBatchExpiry({ batchId: 'batch-id', months: 1, now }),
    ).resolves.toMatchObject({
      kind: 'NO_ELIGIBLE_CODES',
      extendedCount: 0,
      skipped: { activated: 1, revoked: 0, expired: 0 },
    });
    expect(updateMany).not.toHaveBeenCalled();
  });
});
