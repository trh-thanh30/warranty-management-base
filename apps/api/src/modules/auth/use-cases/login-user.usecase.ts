import { BcryptService } from '@/common/helpers/bcrypt.util';
import {
  UnauthorizedError,
  ValidationError,
} from '@/common/response/client-errors';
import { PrismaService } from '@/database/prisma/prisma.service';
import { LoginDto } from '@/modules/auth/dto/login.dto';
import { AuthTokenService } from '@/modules/auth/service/auth-token.service';
import { VerificationSessionService } from '@/modules/auth/service/verification-session.service';
import { BaseUseCase } from '@/shared/interfaces/base-usecase.interface';
import { Injectable } from '@nestjs/common';
import { User, user_role, user_status } from '@prisma/client';

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
  requiresVerification?: boolean;
}

@Injectable()
export class LoginUserUseCase implements BaseUseCase<LoginDto, AuthResponse> {
  private readonly errorMessages = {
    INVALID_CREDENTIALS: 'Invalid email/username or password',
    EMAIL_NOT_VERIFIED: 'Please verify your email before logging in',
    ACCOUNT_INACTIVE: 'Account is inactive. Please contact support',
  } as const;

  constructor(
    private readonly prismaService: PrismaService,
    private readonly bcryptService: BcryptService,
    private readonly tokenService: AuthTokenService,
    private readonly verificationSessionService: VerificationSessionService,
  ) {}

  async execute(
    dto: LoginDto,
    requiredRole?: user_role,
  ): Promise<AuthResponse> {
    // Find user by email or username
    const user = await this.prismaService.user.findFirst({
      where: {
        OR: [{ email: dto.usernameOrEmail }, { username: dto.usernameOrEmail }],
      },
    });
    if (!user) {
      throw new UnauthorizedError(this.errorMessages.INVALID_CREDENTIALS);
    }

    // Check role if required
    if (requiredRole && user.role !== requiredRole) {
      throw new UnauthorizedError(this.errorMessages.INVALID_CREDENTIALS);
    }

    // Validate password
    const isPasswordValid = await this.bcryptService.comparePassword(
      dto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new ValidationError(this.errorMessages.INVALID_CREDENTIALS);
    }
    if (user.status !== user_status.ACTIVE) {
      throw new ValidationError(this.errorMessages.ACCOUNT_INACTIVE);
    }
    // Check if user requires verification
    if (!user.is_verified) {
      const sessionId = await this.verificationSessionService.createSession(
        user.email,
      );
      throw new ValidationError(
        this.errorMessages.EMAIL_NOT_VERIFIED,
        'EMAIL_NOT_VERIFIED',
        {
          requiresVerification: true,
          sessionId,
        },
      );
    }

    // Validate user can login
    this.validateUserCanLogin(user);

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

  private validateUserCanLogin(user: User): void {
    if (user.status !== user_status.ACTIVE) {
      throw new ValidationError(this.errorMessages.ACCOUNT_INACTIVE);
    }
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
