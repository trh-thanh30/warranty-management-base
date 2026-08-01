import { VerifyAdminLoginTwoFactorUseCase } from '@/modules/auth/use-cases/verify-admin-login-two-factor.usecase';
import { user_role, user_status } from '@prisma/client';

describe('VerifyAdminLoginTwoFactorUseCase', () => {
  const admin = {
    id: 'admin-1',
    email: 'admin@example.com',
    username: 'admin',
    role: user_role.ADMIN,
    status: user_status.ACTIVE,
    is_verified: true,
  };

  it('issues tokens only after consuming a valid one-time code', async () => {
    const challengeService = {
      get: jest
        .fn()
        .mockResolvedValue({ userId: admin.id, email: admin.email }),
      withLock: jest.fn(async (_id, callback) => callback()),
      delete: jest.fn().mockResolvedValue(undefined),
    };
    const verificationService = {
      verifyAndConsume: jest.fn().mockResolvedValue(true),
    };
    const prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue(admin),
        update: jest.fn().mockResolvedValue(undefined),
      },
    };
    const tokenService = {
      generateTokenPair: jest.fn().mockReturnValue({
        access_token: 'access-token',
        refresh_token: 'refresh-token',
      }),
    };

    const result = await new VerifyAdminLoginTwoFactorUseCase(
      challengeService as any,
      verificationService as any,
      prisma as any,
      tokenService as any,
    ).execute({ challengeId: 'challenge-1', code: '123456' });

    expect(result).toEqual({
      access_token: 'access-token',
      refresh_token: 'refresh-token',
      user: admin,
    });
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: admin.id },
      data: { refresh_token: 'refresh-token' },
    });
    expect(challengeService.delete).toHaveBeenCalledWith('challenge-1');
  });

  it('rejects an invalid code without issuing tokens', async () => {
    const tokenService = { generateTokenPair: jest.fn() };
    const useCase = new VerifyAdminLoginTwoFactorUseCase(
      {
        get: jest.fn().mockResolvedValue({
          userId: admin.id,
          email: admin.email,
        }),
        withLock: jest.fn(async (_id, callback) => callback()),
        delete: jest.fn(),
      } as any,
      { verifyAndConsume: jest.fn().mockResolvedValue(false) } as any,
      { user: { findUnique: jest.fn().mockResolvedValue(admin) } } as any,
      tokenService as any,
    );

    await expect(
      useCase.execute({ challengeId: 'challenge-1', code: '000000' }),
    ).rejects.toThrow('Invalid or expired verification code');
    expect(tokenService.generateTokenPair).not.toHaveBeenCalled();
  });
});
