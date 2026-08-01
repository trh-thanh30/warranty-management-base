import { StartAdminLoginUseCase } from '@/modules/auth/use-cases/start-admin-login.usecase';
import { user_role, user_status } from '@prisma/client';

describe('StartAdminLoginUseCase', () => {
  const admin = {
    id: 'admin-1',
    email: 'admin@example.com',
    username: 'admin',
    role: user_role.ADMIN,
    status: user_status.ACTIVE,
    is_verified: true,
    pin_hash: null,
  };

  it('creates an email challenge without issuing authentication tokens', async () => {
    const credentialAuthentication = {
      execute: jest.fn().mockResolvedValue(admin),
    };
    const challengeService = {
      create: jest.fn().mockResolvedValue({
        challengeId: 'challenge-1',
        expiresAt: new Date('2026-08-01T10:10:00.000Z'),
      }),
      delete: jest.fn(),
      acquireSendSlot: jest.fn(),
      releaseSendSlot: jest.fn(),
    };
    const verificationService = {
      generate: jest.fn().mockResolvedValue({
        code: '123456',
        expiresAt: new Date('2026-08-01T10:05:00.000Z').getTime(),
      }),
      consume: jest.fn(),
    };
    const email = { execute: jest.fn().mockResolvedValue(undefined) };
    const result = await new StartAdminLoginUseCase(
      credentialAuthentication as any,
      challengeService as any,
      verificationService as any,
      email as any,
    ).execute({
      usernameOrEmail: 'admin@example.com',
      password: 'password',
    });

    expect(result).toEqual({
      requires_two_factor: true,
      challenge_id: 'challenge-1',
      expires_at: '2026-08-01T10:05:00.000Z',
      masked_destination: 'ad***@example.com',
      method: 'EMAIL_OTP',
    });
    expect(result).not.toHaveProperty('access_token');
    expect(email.execute).toHaveBeenCalledWith({
      to: 'admin@example.com',
      code: '123456',
      ttl: expect.any(Number),
    });
  });

  it('starts PIN setup without sending email when no PIN exists', async () => {
    const challengeService = {
      create: jest.fn().mockResolvedValue({
        challengeId: 'challenge-pin',
        expiresAt: new Date('2026-08-01T10:10:00.000Z'),
      }),
    };
    const email = { execute: jest.fn() };
    const result = await new StartAdminLoginUseCase(
      { execute: jest.fn().mockResolvedValue(admin) } as any,
      challengeService as any,
      {} as any,
      email as any,
    ).execute({
      usernameOrEmail: 'admin',
      password: 'password',
      method: 'PIN',
    });

    expect(result.method).toBe('PIN_SETUP');
    expect(challengeService.create).toHaveBeenCalledWith({
      userId: admin.id,
      email: admin.email,
      method: 'PIN_SETUP',
    });
    expect(email.execute).not.toHaveBeenCalled();
  });

  it('cleans up the challenge when the email cannot be queued', async () => {
    const challengeService = {
      create: jest.fn().mockResolvedValue({
        challengeId: 'challenge-1',
        expiresAt: new Date('2026-08-01T10:10:00.000Z'),
      }),
      delete: jest.fn().mockResolvedValue(undefined),
      acquireSendSlot: jest.fn(),
      releaseSendSlot: jest.fn(),
    };
    const verificationService = {
      generate: jest.fn().mockResolvedValue({
        code: '123456',
        expiresAt: Date.now() + 300_000,
      }),
      consume: jest.fn().mockResolvedValue(undefined),
    };

    const useCase = new StartAdminLoginUseCase(
      { execute: jest.fn().mockResolvedValue(admin) } as any,
      challengeService as any,
      verificationService as any,
      {
        execute: jest.fn().mockRejectedValue(new Error('queue unavailable')),
      } as any,
    );

    await expect(
      useCase.execute({ usernameOrEmail: 'admin', password: 'password' }),
    ).rejects.toThrow('queue unavailable');
    expect(verificationService.consume).toHaveBeenCalledWith({
      namespace: 'admin_login_2fa',
      subject: 'challenge-1',
    });
    expect(challengeService.delete).toHaveBeenCalledWith('challenge-1');
  });
});
