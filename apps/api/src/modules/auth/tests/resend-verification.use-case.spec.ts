import { ResendVerificationUseCase } from '@/modules/auth/use-cases/resend-verification.usecase';

describe('ResendVerificationUseCase', () => {
  it('rejects invalid sessions, missing users, and already verified users', async () => {
    const verification = { generate: jest.fn() };
    const emailUseCase = { execute: jest.fn() };

    await expect(
      new ResendVerificationUseCase(
        { findByEmail: jest.fn() } as any,
        verification as any,
        { getEmail: jest.fn().mockResolvedValue(null) } as any,
        emailUseCase as any,
      ).execute({ sessionId: 'session-1' }),
    ).rejects.toThrow('Invalid or expired verification session');

    await expect(
      new ResendVerificationUseCase(
        { findByEmail: jest.fn().mockResolvedValue(null) } as any,
        verification as any,
        { getEmail: jest.fn().mockResolvedValue('user@example.com') } as any,
        emailUseCase as any,
      ).execute({ sessionId: 'session-1' }),
    ).rejects.toThrow('User not found');

    await expect(
      new ResendVerificationUseCase(
        {
          findByEmail: jest.fn().mockResolvedValue({ is_verified: true }),
        } as any,
        verification as any,
        {
          getEmail: jest.fn().mockResolvedValue('user@example.com'),
          deleteSession: jest.fn(),
        } as any,
        emailUseCase as any,
      ).execute({ sessionId: 'session-1' }),
    ).rejects.toThrow('Account is already verified');
  });

  it('sends a new code and extends the session', async () => {
    const sessions = {
      getEmail: jest.fn().mockResolvedValue('user@example.com'),
      extendSession: jest.fn().mockResolvedValue(undefined),
    };
    const emailUseCase = { execute: jest.fn().mockResolvedValue(undefined) };

    await expect(
      new ResendVerificationUseCase(
        {
          findByEmail: jest.fn().mockResolvedValue({ is_verified: false }),
        } as any,
        {
          generate: jest.fn().mockResolvedValue({
            code: '123456',
            expiresAt: Date.now() + 1000,
          }),
        } as any,
        sessions as any,
        emailUseCase as any,
      ).execute({ sessionId: 'session-1' }),
    ).resolves.toBeUndefined();

    expect(emailUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'user@example.com', code: '123456' }),
    );
    expect(sessions.extendSession).toHaveBeenCalledWith('session-1');
  });

  it('maps verification rate limit errors to too many requests', async () => {
    await expect(
      new ResendVerificationUseCase(
        {
          findByEmail: jest.fn().mockResolvedValue({ is_verified: false }),
        } as any,
        {
          generate: jest
            .fn()
            .mockRejectedValue(new Error('rate limit exceeded')),
        } as any,
        { getEmail: jest.fn().mockResolvedValue('user@example.com') } as any,
        { execute: jest.fn() } as any,
      ).execute({ sessionId: 'session-1' }),
    ).rejects.toThrow('Too many verification requests');
  });
});
