import { AuthenticateLoginCredentialsUseCase } from '@/modules/auth/use-cases/authenticate-login-credentials.usecase';
import { LoginUserUseCase } from '@/modules/auth/use-cases/login-user.usecase';
import { user_role, user_status } from '@prisma/client';

function user(overrides: Record<string, unknown> = {}) {
  return {
    id: 'user-1',
    email: 'user@example.com',
    username: 'user',
    password: 'hashed-password',
    role: user_role.CUSTOMER,
    status: user_status.ACTIVE,
    is_verified: true,
    ...overrides,
  };
}

describe('AuthenticateLoginCredentialsUseCase', () => {
  const dto = {
    usernameOrEmail: 'user@example.com',
    password: 'password',
  };

  function createUseCase(
    foundUser: ReturnType<typeof user> | null,
    passwordIsValid = true,
  ) {
    return new AuthenticateLoginCredentialsUseCase(
      { user: { findFirst: jest.fn().mockResolvedValue(foundUser) } } as any,
      {
        comparePassword: jest.fn().mockResolvedValue(passwordIsValid),
      } as any,
      { createSession: jest.fn().mockResolvedValue('session-1') } as any,
    );
  }

  it('rejects missing users, wrong roles, and invalid passwords', async () => {
    await expect(createUseCase(null).execute(dto)).rejects.toThrow(
      'Invalid email/username or password',
    );
    await expect(
      createUseCase(user()).execute(dto, user_role.ADMIN),
    ).rejects.toThrow('Invalid email/username or password');
    await expect(createUseCase(user(), false).execute(dto)).rejects.toThrow(
      'Invalid email/username or password',
    );
  });

  it('rejects inactive and unverified users', async () => {
    await expect(
      createUseCase(user({ status: user_status.INACTIVE })).execute(dto),
    ).rejects.toThrow('Account is inactive');
    await expect(
      createUseCase(user({ is_verified: false })).execute(dto),
    ).rejects.toThrow('Please verify your email before logging in');
  });
});

describe('LoginUserUseCase', () => {
  it('returns tokens and updates the stored refresh token for a valid login', async () => {
    const authenticatedUser = user();
    const prisma = {
      user: { update: jest.fn().mockResolvedValue(undefined) },
    };
    const tokenService = {
      generateTokenPair: jest.fn().mockReturnValue({
        access_token: 'access-token',
        refresh_token: 'refresh-token',
      }),
    };

    await expect(
      new LoginUserUseCase(
        { execute: jest.fn().mockResolvedValue(authenticatedUser) } as any,
        prisma as any,
        tokenService as any,
      ).execute({
        usernameOrEmail: 'user@example.com',
        password: 'password',
      }),
    ).resolves.toEqual({
      access_token: 'access-token',
      refresh_token: 'refresh-token',
      user: authenticatedUser,
    });

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { refresh_token: 'refresh-token' },
    });
  });
});
