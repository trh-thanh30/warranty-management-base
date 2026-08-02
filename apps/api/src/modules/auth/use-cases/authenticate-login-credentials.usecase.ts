import { BcryptService } from '@/common/helpers/bcrypt.util';
import {
  UnauthorizedError,
  ValidationError,
} from '@/common/response/client-errors';
import { PrismaService } from '@/database/prisma/prisma.service';
import { LoginDto } from '@/modules/auth/dto/login.dto';
import { VerificationSessionService } from '@/modules/auth/service/verification-session.service';
import { Injectable } from '@nestjs/common';
import { User, user_role, user_status } from '@prisma/client';

@Injectable()
export class AuthenticateLoginCredentialsUseCase {
  private readonly errorMessages = {
    INVALID_CREDENTIALS: 'Invalid email/username or password',
    EMAIL_NOT_VERIFIED: 'Please verify your email before logging in',
    ACCOUNT_INACTIVE: 'Account is inactive. Please contact support',
  } as const;

  constructor(
    private readonly prismaService: PrismaService,
    private readonly bcryptService: BcryptService,
    private readonly verificationSessionService: VerificationSessionService,
  ) {}

  async execute(
    dto: LoginDto,
    requiredRole?: user_role | user_role[],
  ): Promise<User> {
    const user = await this.prismaService.user.findFirst({
      where: {
        OR: [{ email: dto.usernameOrEmail }, { username: dto.usernameOrEmail }],
      },
    });

    if (!user || !this.hasRequiredRole(user, requiredRole)) {
      throw new UnauthorizedError(this.errorMessages.INVALID_CREDENTIALS);
    }

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
    if (!user.is_verified) {
      const sessionId = await this.verificationSessionService.createSession(
        user.email,
      );
      throw new ValidationError(
        this.errorMessages.EMAIL_NOT_VERIFIED,
        'EMAIL_NOT_VERIFIED',
        { requiresVerification: true, sessionId },
      );
    }

    return user;
  }

  private hasRequiredRole(
    user: User,
    requiredRole?: user_role | user_role[],
  ): boolean {
    if (!requiredRole) return true;
    const allowedRoles = Array.isArray(requiredRole)
      ? requiredRole
      : [requiredRole];
    return allowedRoles.includes(user.role);
  }
}
