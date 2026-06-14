import { RefreshTokenUseCase } from '@/modules/auth/use-cases/refresh-token.usecase';
import { user_role, user_status } from '@prisma/client';

function user(overrides: Record<string, unknown> = {}) {
  return {
    id: 'user-1',
    email: 'user@example.com',
    username: 'user',
    role: user_role.USER,
    status: user_status.ACTIVE,
    refresh_token: 'refresh-token',
    ...overrides,
  };
}

describe('RefreshTokenUseCase', () => {
  it('rejects missing token, unknown user, token mismatch, and role mismatch', async () => {
    const tokenService = {
      verifyRefreshToken: jest
        .fn()
        .mockReturnValue({ payload: { id: 'user-1' } }),
      generateTokenPair: jest.fn(),
    } as any;

    await expect(
      new RefreshTokenUseCase(
        { user: { findUnique: jest.fn() } } as any,
        tokenService,
      ).execute(''),
    ).rejects.toThrow('Refresh token is missing');

    await expect(
      new RefreshTokenUseCase(
        { user: { findUnique: jest.fn().mockResolvedValue(null) } } as any,
        tokenService,
      ).execute('refresh-token'),
    ).rejects.toThrow('Invalid or expired refresh token');

    await expect(
      new RefreshTokenUseCase(
        {
          user: {
            findUnique: jest
              .fn()
              .mockResolvedValue(user({ refresh_token: 'different-token' })),
          },
        } as any,
        tokenService,
      ).execute('refresh-token'),
    ).rejects.toThrow('Invalid or expired refresh token');

    await expect(
      new RefreshTokenUseCase(
        { user: { findUnique: jest.fn().mockResolvedValue(user()) } } as any,
        tokenService,
      ).execute('refresh-token', user_role.ADMIN),
    ).rejects.toThrow('Invalid refresh token for this app');
  });

  it('returns a new access token while preserving refresh token', async () => {
    const tokenService = {
      verifyRefreshToken: jest
        .fn()
        .mockReturnValue({ payload: { id: 'user-1' } }),
      generateTokenPair: jest.fn().mockReturnValue({
        access_token: 'new-access-token',
        refresh_token: 'rotated-refresh-token',
      }),
    } as any;
    const prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue(user()),
      },
    } as any;
    const useCase = new RefreshTokenUseCase(prisma, tokenService);

    await expect(useCase.execute('refresh-token')).resolves.toEqual({
      access_token: 'new-access-token',
      refresh_token: 'refresh-token',
    });

    expect(tokenService.generateTokenPair).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'user-1',
        email: 'user@example.com',
        role: user_role.USER,
      }),
    );
  });

  it('wraps invalid token verifier errors as unauthorized', async () => {
    const useCase = new RefreshTokenUseCase(
      { user: { findUnique: jest.fn() } } as any,
      {
        verifyRefreshToken: jest.fn(() => {
          throw new Error('bad jwt');
        }),
      } as any,
    );

    await expect(useCase.execute('refresh-token')).rejects.toThrow(
      'Invalid or expired refresh token',
    );
  });
});
