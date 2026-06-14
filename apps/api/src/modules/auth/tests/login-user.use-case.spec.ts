import { LoginUserUseCase } from '@/modules/auth/use-cases/login-user.usecase';
import { user_role, user_status } from '@prisma/client';

function user(overrides: Record<string, unknown> = {}) {
  return {
    id: 'user-1',
    email: 'user@example.com',
    username: 'user',
    password: 'hashed-password',
    role: user_role.USER,
    status: user_status.ACTIVE,
    is_verified: true,
    ...overrides,
  };
}

describe('LoginUserUseCase', () => {
  const dto = {
    usernameOrEmail: 'user@example.com',
    password: 'password',
  };

  it('rejects missing users, wrong roles, invalid passwords, inactive users, and unverified users', async () => {
    const baseTokenService = { generateTokenPair: jest.fn() };
    const sessionService = {
      createSession: jest.fn().mockResolvedValue('session-1'),
    };

    await expect(
      new LoginUserUseCase(
        { user: { findFirst: jest.fn().mockResolvedValue(null) } } as any,
        { comparePassword: jest.fn() } as any,
        baseTokenService as any,
        sessionService as any,
      ).execute(dto),
    ).rejects.toThrow('Invalid email/username or password');

    await expect(
      new LoginUserUseCase(
        { user: { findFirst: jest.fn().mockResolvedValue(user()) } } as any,
        { comparePassword: jest.fn() } as any,
        baseTokenService as any,
        sessionService as any,
      ).execute(dto, user_role.ADMIN),
    ).rejects.toThrow('Invalid email/username or password');

    await expect(
      new LoginUserUseCase(
        { user: { findFirst: jest.fn().mockResolvedValue(user()) } } as any,
        { comparePassword: jest.fn().mockResolvedValue(false) } as any,
        baseTokenService as any,
        sessionService as any,
      ).execute(dto),
    ).rejects.toThrow('Invalid email/username or password');

    await expect(
      new LoginUserUseCase(
        {
          user: {
            findFirst: jest
              .fn()
              .mockResolvedValue(user({ status: user_status.INACTIVE })),
          },
        } as any,
        { comparePassword: jest.fn().mockResolvedValue(true) } as any,
        baseTokenService as any,
        sessionService as any,
      ).execute(dto),
    ).rejects.toThrow('Account is inactive');

    await expect(
      new LoginUserUseCase(
        {
          user: {
            findFirst: jest
              .fn()
              .mockResolvedValue(user({ is_verified: false })),
          },
        } as any,
        { comparePassword: jest.fn().mockResolvedValue(true) } as any,
        baseTokenService as any,
        sessionService as any,
      ).execute(dto),
    ).rejects.toThrow('Please verify your email before logging in');
  });

  it('returns tokens and updates the stored refresh token for a valid login', async () => {
    const prisma = {
      user: {
        findFirst: jest.fn().mockResolvedValue(user()),
        update: jest.fn().mockResolvedValue(undefined),
      },
    };
    const tokenService = {
      generateTokenPair: jest.fn().mockReturnValue({
        access_token: 'access-token',
        refresh_token: 'refresh-token',
      }),
    };

    await expect(
      new LoginUserUseCase(
        prisma as any,
        { comparePassword: jest.fn().mockResolvedValue(true) } as any,
        tokenService as any,
        { createSession: jest.fn() } as any,
      ).execute(dto),
    ).resolves.toEqual({
      access_token: 'access-token',
      refresh_token: 'refresh-token',
      user: user(),
    });

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { refresh_token: 'refresh-token' },
    });
  });
});
