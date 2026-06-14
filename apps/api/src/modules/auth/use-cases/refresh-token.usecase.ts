import { UnauthorizedError } from '@/common/response/client-errors/unauthorized';
import { PrismaService } from '@/database/prisma/prisma.service';
import { AuthTokenService } from '@/modules/auth/service/auth-token.service';
import { BaseUseCase } from '@/shared/interfaces/base-usecase.interface';
import { Injectable } from '@nestjs/common';
import { user_role } from '@prisma/client';

export interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
}

@Injectable()
export class RefreshTokenUseCase extends BaseUseCase<
  string,
  RefreshTokenResponse
> {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly tokenService: AuthTokenService,
  ) {
    super();
  }

  async execute(
    refreshToken: string,
    requiredRole?: user_role,
  ): Promise<RefreshTokenResponse> {
    if (!refreshToken) {
      throw new UnauthorizedError('Refresh token is missing');
    }

    try {
      // 1. Verify the refresh token
      const decoded = this.tokenService.verifyRefreshToken(refreshToken);

      // 2. Find user and check if token matches
      const user = await this.prismaService.user.findUnique({
        where: { id: decoded.payload.id },
      });

      if (!user) {
        throw new UnauthorizedError(
          'Invalid or expired refresh token.',
        ).addDetails({
          reason: 'User not found',
        });
      }

      if (user.refresh_token !== refreshToken) {
        throw new UnauthorizedError(
          'Invalid or expired refresh token.',
        ).addDetails({
          reason: 'Token mismatch in database',
          dbTokenPreview: user.refresh_token
            ? user.refresh_token.substring(0, 10) + '...'
            : 'null',
          incomingTokenPreview: refreshToken.substring(0, 10) + '...',
        });
      }

      if (requiredRole && user.role !== requiredRole) {
        throw new UnauthorizedError('Invalid refresh token for this app');
      }

      // 3. Generate a fresh access token but keep the refresh token stable.
      // Rotating the refresh token on every refresh can invalidate another
      // in-flight refresh request from a second tab and force a logout.
      const tokens = this.tokenService.generateTokenPair({
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        status: user.status,
      });

      return {
        access_token: tokens.access_token,
        refresh_token: refreshToken,
      };
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        throw error;
      }
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
  }
}
