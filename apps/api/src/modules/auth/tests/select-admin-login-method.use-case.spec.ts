import { SelectAdminLoginMethodUseCase } from '@/modules/auth/use-cases/select-admin-login-method.usecase';
import { user_role, user_status } from '@prisma/client';
import {
  ADMIN_LOGIN_CHALLENGE_METHOD,
  ADMIN_TWO_FACTOR_METHOD,
} from '@repo/shared/constants';

describe('SelectAdminLoginMethodUseCase', () => {
  const admin = {
    id: 'admin-1',
    email: 'admin@example.com',
    username: 'admin',
    role: user_role.ADMIN,
    status: user_status.ACTIVE,
    pin_hash: null,
  };

  function createDependencies(
    user: Omit<typeof admin, 'pin_hash'> & { pin_hash: string | null } = admin,
  ) {
    return {
      challenge: {
        get: jest.fn().mockResolvedValue({
          userId: user.id,
          email: user.email,
          method: ADMIN_LOGIN_CHALLENGE_METHOD.METHOD_SELECTION,
        }),
        setMethod: jest.fn().mockResolvedValue({
          expiresAt: new Date('2026-08-01T10:10:00.000Z'),
        }),
        acquireSendSlot: jest.fn(),
        releaseSendSlot: jest.fn(),
        delete: jest.fn(),
      },
      prisma: { user: { findUnique: jest.fn().mockResolvedValue(user) } },
      verification: {
        generate: jest.fn().mockResolvedValue({
          code: '123456',
          expiresAt: new Date('2026-08-01T10:05:00.000Z').getTime(),
        }),
        consume: jest.fn(),
      },
      email: { execute: jest.fn() },
    };
  }

  it('sends an email only after EMAIL_OTP is selected', async () => {
    const deps = createDependencies();
    const result = await new SelectAdminLoginMethodUseCase(
      deps.challenge as any,
      deps.prisma as any,
      deps.verification as any,
      deps.email as any,
    ).execute({
      challengeId: 'challenge-1',
      method: ADMIN_TWO_FACTOR_METHOD.EMAIL_OTP,
    });

    expect(result.method).toBe(ADMIN_LOGIN_CHALLENGE_METHOD.EMAIL_OTP);
    expect(deps.email.execute).toHaveBeenCalledWith({
      to: admin.email,
      code: '123456',
      ttl: expect.any(Number),
    });
  });

  it('selects PIN_SETUP when the account has no PIN', async () => {
    const deps = createDependencies();
    const result = await new SelectAdminLoginMethodUseCase(
      deps.challenge as any,
      deps.prisma as any,
      deps.verification as any,
      deps.email as any,
    ).execute({
      challengeId: 'challenge-1',
      method: ADMIN_TWO_FACTOR_METHOD.PIN,
    });

    expect(result.method).toBe(ADMIN_LOGIN_CHALLENGE_METHOD.PIN_SETUP);
    expect(deps.email.execute).not.toHaveBeenCalled();
  });

  it('selects PIN_VERIFY when a PIN is configured', async () => {
    const deps = createDependencies({ ...admin, pin_hash: 'pin-hash' });
    const result = await new SelectAdminLoginMethodUseCase(
      deps.challenge as any,
      deps.prisma as any,
      deps.verification as any,
      deps.email as any,
    ).execute({
      challengeId: 'challenge-1',
      method: ADMIN_TWO_FACTOR_METHOD.PIN,
    });

    expect(result.method).toBe(ADMIN_LOGIN_CHALLENGE_METHOD.PIN_VERIFY);
  });

  it('restores method selection when email delivery fails', async () => {
    const deps = createDependencies();
    deps.email.execute.mockRejectedValue(new Error('email unavailable'));
    const useCase = new SelectAdminLoginMethodUseCase(
      deps.challenge as any,
      deps.prisma as any,
      deps.verification as any,
      deps.email as any,
    );

    await expect(
      useCase.execute({
        challengeId: 'challenge-1',
        method: ADMIN_TWO_FACTOR_METHOD.EMAIL_OTP,
      }),
    ).rejects.toThrow('email unavailable');
    expect(deps.challenge.setMethod).toHaveBeenLastCalledWith(
      'challenge-1',
      ADMIN_LOGIN_CHALLENGE_METHOD.METHOD_SELECTION,
    );
  });
});
