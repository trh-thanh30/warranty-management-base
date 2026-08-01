import { VerifyAdminLoginPinUseCase } from '@/modules/auth/use-cases/verify-admin-login-pin.usecase';
import { user_role, user_status } from '@prisma/client';
import * as argon2 from 'argon2';

describe('VerifyAdminLoginPinUseCase', () => {
  it('resets failures and issues tokens for a valid PIN', async () => {
    const user = {
      id: 'admin-1',
      email: 'admin@example.com',
      username: 'admin',
      role: user_role.ADMIN,
      status: user_status.ACTIVE,
      pin_hash: await argon2.hash('123456'),
    };
    const challenge = {
      get: jest.fn().mockResolvedValue({
        userId: user.id,
        email: user.email,
        method: 'PIN_VERIFY',
      }),
      withLock: jest.fn(async (_id, callback) => callback()),
      delete: jest.fn(),
      getPinLockSeconds: jest.fn().mockResolvedValue(0),
      resetPinFailures: jest.fn(),
      recordPinFailure: jest.fn(),
    };
    const prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue(user),
        update: jest.fn(),
      },
    };
    const tokens = {
      generateTokenPair: jest
        .fn()
        .mockReturnValue({ access_token: 'access', refresh_token: 'refresh' }),
    };

    await new VerifyAdminLoginPinUseCase(
      challenge as any,
      prisma as any,
      tokens as any,
    ).execute({ challengeId: 'challenge-1', pin: '123456' });

    expect(challenge.resetPinFailures).toHaveBeenCalledWith(user.id);
    expect(tokens.generateTokenPair).toHaveBeenCalled();
  });

  it('locks PIN verification when the fifth attempt fails', async () => {
    const user = {
      id: 'admin-1',
      email: 'admin@example.com',
      username: 'admin',
      role: user_role.ADMIN,
      status: user_status.ACTIVE,
      pin_hash: await argon2.hash('123456'),
    };
    const challenge = {
      get: jest.fn().mockResolvedValue({
        userId: user.id,
        email: user.email,
        method: 'PIN_VERIFY',
      }),
      withLock: jest.fn(async (_id, callback) => callback()),
      getPinLockSeconds: jest.fn().mockResolvedValue(0),
      recordPinFailure: jest.fn().mockResolvedValue(0),
    };
    const useCase = new VerifyAdminLoginPinUseCase(
      challenge as any,
      { user: { findUnique: jest.fn().mockResolvedValue(user) } } as any,
      {} as any,
    );

    await expect(
      useCase.execute({ challengeId: 'challenge-1', pin: '000000' }),
    ).rejects.toThrow('locked for 15 minutes');
  });
});
