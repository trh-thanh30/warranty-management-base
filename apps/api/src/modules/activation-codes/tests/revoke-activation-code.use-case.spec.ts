import { RevokeActivationCodeUseCase } from '@/modules/activation-codes/use-cases/revoke-activation-code.use-case';

describe('RevokeActivationCodeUseCase', () => {
  it('revokes an available code', async () => {
    const repository = { revoke: jest.fn().mockResolvedValue({ count: 1 }) };
    const result = await new RevokeActivationCodeUseCase(
      repository as never,
    ).execute('code-id');

    expect(repository.revoke).toHaveBeenCalledWith('code-id');
    expect(result).toEqual({ id: 'code-id', status: 'REVOKED' });
  });

  it('rejects a code that is not available', async () => {
    const repository = { revoke: jest.fn().mockResolvedValue({ count: 0 }) };

    await expect(
      new RevokeActivationCodeUseCase(repository as never).execute('code-id'),
    ).rejects.toMatchObject({ code: 'ACTIVATION_CODE_NOT_REVOCABLE' });
  });
});
