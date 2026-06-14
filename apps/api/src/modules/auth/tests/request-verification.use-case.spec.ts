import { RequestVerificationUseCase } from '@/modules/auth/use-cases/request-verification.usecase';

describe('RequestVerificationUseCase', () => {
  it('rejects missing or already verified users', async () => {
    const verification = { generate: jest.fn() };
    const sessions = { createSession: jest.fn() };
    const emailUseCase = { execute: jest.fn() };

    await expect(
      new RequestVerificationUseCase(
        { findByEmail: jest.fn().mockResolvedValue(null) } as any,
        verification as any,
        sessions as any,
        emailUseCase as any,
      ).execute({ email: 'user@example.com' }),
    ).rejects.toThrow('User not found');

    await expect(
      new RequestVerificationUseCase(
        {
          findByEmail: jest.fn().mockResolvedValue({ is_verified: true }),
        } as any,
        verification as any,
        sessions as any,
        emailUseCase as any,
      ).execute({ email: 'user@example.com' }),
    ).rejects.toThrow('Account is already verified');
  });

  it('creates a session and sends a verification code', async () => {
    const emailUseCase = { execute: jest.fn().mockResolvedValue(undefined) };
    const verification = {
      generate: jest
        .fn()
        .mockResolvedValue({ code: '123456', expiresAt: Date.now() + 1000 }),
    };

    await expect(
      new RequestVerificationUseCase(
        {
          findByEmail: jest.fn().mockResolvedValue({ is_verified: false }),
        } as any,
        verification as any,
        { createSession: jest.fn().mockResolvedValue('session-1') } as any,
        emailUseCase as any,
      ).execute({ email: 'user@example.com' }),
    ).resolves.toEqual({ sessionId: 'session-1' });

    expect(emailUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'user@example.com', code: '123456' }),
    );
  });
});
