import { ResetPasswordUseCase } from '@/modules/auth/use-cases/reset-password.usecase';

describe('ResetPasswordUseCase', () => {
  const dto = {
    sessionId: 'session-1',
    code: '123456',
    password: 'new-password',
    confirmPassword: 'new-password',
  };

  it('rejects invalid sessions, missing users, and invalid codes', async () => {
    await expect(
      new ResetPasswordUseCase(
        { verifyAndConsume: jest.fn() } as any,
        { getEmail: jest.fn().mockResolvedValue(null) } as any,
        { user: { findUnique: jest.fn() } } as any,
        { hashPassword: jest.fn() } as any,
      ).execute(dto),
    ).rejects.toThrow('Invalid or expired password reset session');

    await expect(
      new ResetPasswordUseCase(
        { verifyAndConsume: jest.fn() } as any,
        { getEmail: jest.fn().mockResolvedValue('user@example.com') } as any,
        { user: { findUnique: jest.fn().mockResolvedValue(null) } } as any,
        { hashPassword: jest.fn() } as any,
      ).execute(dto),
    ).rejects.toThrow('User not found');

    await expect(
      new ResetPasswordUseCase(
        { verifyAndConsume: jest.fn().mockResolvedValue(false) } as any,
        { getEmail: jest.fn().mockResolvedValue('user@example.com') } as any,
        {
          user: { findUnique: jest.fn().mockResolvedValue({ id: 'user-1' }) },
        } as any,
        { hashPassword: jest.fn() } as any,
      ).execute(dto),
    ).rejects.toThrow('Invalid or expired verification code');
  });

  it('hashes and stores the new password then deletes the session', async () => {
    const prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue({ id: 'user-1' }),
        update: jest.fn().mockResolvedValue(undefined),
      },
    };
    const sessions = {
      getEmail: jest.fn().mockResolvedValue('user@example.com'),
      deleteSession: jest.fn().mockResolvedValue(undefined),
    };

    await expect(
      new ResetPasswordUseCase(
        { verifyAndConsume: jest.fn().mockResolvedValue(true) } as any,
        sessions as any,
        prisma as any,
        { hashPassword: jest.fn().mockResolvedValue('hashed-new') } as any,
      ).execute(dto),
    ).resolves.toBeUndefined();

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { email: 'user@example.com' },
      data: { password: 'hashed-new' },
    });
    expect(sessions.deleteSession).toHaveBeenCalledWith('session-1');
  });
});
