import { ForgotPasswordUseCase } from '@/modules/auth/use-cases/forgot-password.usecase';

describe('ForgotPasswordUseCase', () => {
  it('rejects unknown emails', async () => {
    await expect(
      new ForgotPasswordUseCase(
        { findByEmail: jest.fn().mockResolvedValue(null) } as any,
        { generate: jest.fn() } as any,
        { createSession: jest.fn() } as any,
        { execute: jest.fn() } as any,
      ).execute({ email: 'missing@example.com' }),
    ).rejects.toThrow('User with this email not found');
  });

  it('creates a reset session and sends a reset email', async () => {
    const emailUseCase = { execute: jest.fn().mockResolvedValue(undefined) };

    await expect(
      new ForgotPasswordUseCase(
        { findByEmail: jest.fn().mockResolvedValue({ id: 'user-1' }) } as any,
        {
          generate: jest.fn().mockResolvedValue({
            code: '654321',
            expiresAt: Date.now() + 1000,
          }),
        } as any,
        { createSession: jest.fn().mockResolvedValue('session-1') } as any,
        emailUseCase as any,
      ).execute({ email: 'user@example.com' }),
    ).resolves.toBe('session-1');

    expect(emailUseCase.execute).toHaveBeenCalledWith({
      to: 'user@example.com',
      code: '654321',
      ttl: expect.any(Date),
    });
  });
});
