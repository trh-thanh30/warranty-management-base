import { PrismaService } from '@/database/prisma/prisma.service';
import { LoginDto } from '@/modules/auth/dto/login.dto';
import { AuthTokenService } from '@/modules/auth/service/auth-token.service';
import { AuthenticateLoginCredentialsUseCase } from '@/modules/auth/use-cases/authenticate-login-credentials.usecase';
import { BaseUseCase } from '@/shared/interfaces/base-usecase.interface';
import { Injectable } from '@nestjs/common';
import { User, user_role } from '@prisma/client';

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
  requiresVerification?: boolean;
}

@Injectable()
export class LoginUserUseCase implements BaseUseCase<LoginDto, AuthResponse> {
  constructor(
    private readonly authenticateCredentials: AuthenticateLoginCredentialsUseCase,
    private readonly prismaService: PrismaService,
    private readonly tokenService: AuthTokenService,
  ) {}

  async execute(
    dto: LoginDto,
    requiredRole?: user_role | user_role[],
  ): Promise<AuthResponse> {
    const user = await this.authenticateCredentials.execute(dto, requiredRole);

    // Generate tokens
    const tokens = this.tokenService.generateTokenPair({
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      username: user.username,
    });

    // Update refresh token in database
    await this.updateUserRefreshToken(user.id, tokens.refresh_token);

    return {
      ...tokens,
      user,
    };
  }

  private async updateUserRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    await this.prismaService.user.update({
      where: { id: userId },
      data: { refresh_token: refreshToken },
    });
  }
}
