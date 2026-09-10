import { ExtendActivationCodeExpiryUseCase } from '@/modules/activation-codes/use-cases/extend-activation-code-expiry.use-case';

describe('ExtendActivationCodeExpiryUseCase', () => {
  it('returns the previous and extended expiry timestamps', async () => {
    const repository = {
      extendCodeExpiry: jest.fn().mockResolvedValue({
        kind: 'EXTENDED',
        previousExpiresAt: new Date('2027-01-31T10:30:00.000Z'),
        expiresAt: new Date('2027-02-28T10:30:00.000Z'),
      }),
    };

    const result = await new ExtendActivationCodeExpiryUseCase(
      repository as never,
    ).execute('code-id', 1);

    expect(repository.extendCodeExpiry).toHaveBeenCalledWith({
      id: 'code-id',
      months: 1,
      now: expect.any(Date),
    });
    expect(result).toEqual({
      activationCodeId: 'code-id',
      previousExpiresAt: '2027-01-31T10:30:00.000Z',
      expiresAt: '2027-02-28T10:30:00.000Z',
    });
  });

  it.each([
    ['NOT_FOUND', 'NOT_FOUND'],
    ['EXPIRED', 'ACTIVATION_CODE_EXTENSION_EXPIRED'],
    ['ACTIVATED', 'ACTIVATION_CODE_EXTENSION_STATUS_NOT_ALLOWED'],
    ['REVOKED', 'ACTIVATION_CODE_EXTENSION_STATUS_NOT_ALLOWED'],
    ['CONFLICT', 'ACTIVATION_CODE_EXTENSION_CONFLICT'],
  ])('maps %s repository result to %s', async (kind, code) => {
    const repository = {
      extendCodeExpiry: jest.fn().mockResolvedValue({ kind }),
    };

    await expect(
      new ExtendActivationCodeExpiryUseCase(repository as never).execute(
        'code-id',
        1,
      ),
    ).rejects.toMatchObject({ code });
  });
});
