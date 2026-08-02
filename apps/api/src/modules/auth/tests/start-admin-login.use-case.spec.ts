import { StartAdminLoginUseCase } from '@/modules/auth/use-cases/start-admin-login.usecase';
import {
  admin_two_factor_method,
  user_role,
  user_status,
} from '@prisma/client';
import {
  ADMIN_LOGIN_CHALLENGE_METHOD,
  ADMIN_TWO_FACTOR_METHOD,
} from '@repo/shared/constants';

describe('StartAdminLoginUseCase', () => {
  const admin = {
    id: 'admin-1',
    email: 'admin@example.com',
    username: 'admin',
    role: user_role.ADMIN,
    status: user_status.ACTIVE,
    is_verified: true,
    pin_hash: null,
    two_factor_method: admin_two_factor_method.EMAIL_OTP,
  };

  it('creates a neutral method-selection challenge after credentials pass', async () => {
    const challengeService = {
      create: jest.fn().mockResolvedValue({
        challengeId: 'challenge-1',
        expiresAt: new Date('2026-08-01T10:10:00.000Z'),
      }),
    };
    const result = await new StartAdminLoginUseCase(
      { execute: jest.fn().mockResolvedValue(admin) } as any,
      challengeService as any,
    ).execute({
      usernameOrEmail: 'admin@example.com',
      password: 'password',
    });

    expect(result).toEqual({
      requires_two_factor: true,
      challenge_id: 'challenge-1',
      expires_at: '2026-08-01T10:10:00.000Z',
      available_methods: [
        ADMIN_TWO_FACTOR_METHOD.EMAIL_OTP,
        ADMIN_TWO_FACTOR_METHOD.PIN,
      ],
      recommended_method: ADMIN_TWO_FACTOR_METHOD.EMAIL_OTP,
      pin_configured: false,
      masked_destination: 'ad***@example.com',
    });
    expect(challengeService.create).toHaveBeenCalledWith({
      userId: admin.id,
      email: admin.email,
      method: ADMIN_LOGIN_CHALLENGE_METHOD.METHOD_SELECTION,
    });
    expect(result).not.toHaveProperty('access_token');
  });

  it('recommends PIN when it is the account preference', async () => {
    const result = await new StartAdminLoginUseCase(
      {
        execute: jest.fn().mockResolvedValue({
          ...admin,
          pin_hash: 'hash',
          two_factor_method: admin_two_factor_method.PIN,
        }),
      } as any,
      {
        create: jest.fn().mockResolvedValue({
          challengeId: 'challenge-1',
          expiresAt: new Date('2026-08-01T10:10:00.000Z'),
        }),
      } as any,
    ).execute({ usernameOrEmail: 'admin', password: 'password' });

    expect(result.recommended_method).toBe(ADMIN_TWO_FACTOR_METHOD.PIN);
    expect(result.pin_configured).toBe(true);
  });
});
