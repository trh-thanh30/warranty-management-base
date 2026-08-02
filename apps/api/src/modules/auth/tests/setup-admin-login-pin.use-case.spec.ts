import { SetupAdminLoginPinUseCase } from '@/modules/auth/use-cases/setup-admin-login-pin.usecase';
import { user_role, user_status } from '@prisma/client';

describe('SetupAdminLoginPinUseCase', () => {
  it('hashes the first PIN, stores it, and issues tokens', async () => {
    const user = {
      id: 'admin-1',
      email: 'admin@example.com',
      username: 'admin',
      role: user_role.ADMIN,
      status: user_status.ACTIVE,
      pin_hash: null,
    };
    const challenge = {
      get: jest.fn().mockResolvedValue({
        userId: user.id,
        email: user.email,
        method: 'PIN_SETUP',
      }),
      withLock: jest.fn(async (_id, callback) => callback()),
      delete: jest.fn(),
    };
    const prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue(user),
        update: jest
          .fn()
          .mockImplementation(({ data }) => ({ ...user, ...data })),
      },
    };
    const tokens = {
      generateTokenPair: jest.fn().mockReturnValue({
        access_token: 'access',
        refresh_token: 'refresh',
      }),
    };

    const result = await new SetupAdminLoginPinUseCase(
      challenge as any,
      prisma as any,
      tokens as any,
    ).execute({
      challengeId: 'challenge-1',
      pin: '123456',
      confirmPin: '123456',
    });

    expect(result.access_token).toBe('access');
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: user.id },
      data: expect.objectContaining({
        pin_hash: expect.any(String),
        two_factor_method: 'PIN',
        refresh_token: 'refresh',
      }),
    });
    expect(challenge.delete).toHaveBeenCalledWith('challenge-1');
  });
});
