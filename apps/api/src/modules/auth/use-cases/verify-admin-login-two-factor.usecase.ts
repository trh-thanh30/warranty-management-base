import { BadRequestError, UnauthorizedError } from '@/common/response';
import { PrismaService } from '@/database/prisma/prisma.service';
import { VerifyAdminLoginTwoFactorDto } from '@/modules/auth/dto/admin-login-two-factor.dto';
import { AdminLoginChallengeService } from '@/modules/auth/service/admin-login-challenge.service';
import { AuthTokenService } from '@/modules/auth/service/auth-token.service';
import { VerificationService } from '@/modules/verification/verification.service';
import { BaseUseCase } from '@/shared/interfaces/base-usecase.interface';
import { Injectable } from '@nestjs/common';
import { User, user_role, user_status } from '@prisma/client';

export type VerifiedAdminLogin = {
  access_token: string;
  refresh_token: string;
  user: User;
};

@Injectable()
export class VerifyAdminLoginTwoFactorUseCase implements BaseUseCase<
  VerifyAdminLoginTwoFactorDto,
  VerifiedAdminLogin
> {
  constructor(
    private readonly challengeService: AdminLoginChallengeService,
    private readonly verificationService: VerificationService,
    private readonly prismaService: PrismaService,
    private readonly tokenService: AuthTokenService,
  ) {}

  async execute(
    dto: VerifyAdminLoginTwoFactorDto,
  ): Promise<VerifiedAdminLogin> {
    return this.challengeService.withLock(dto.challengeId, async () => {
      const challenge = await this.challengeService.get(dto.challengeId);
      const user = await this.prismaService.user.findUnique({
        where: { id: challenge.userId },
      });

      if (
        !user ||
        user.email !== challenge.email ||
        user.status !== user_status.ACTIVE ||
        !(<user_role[]>[user_role.ADMIN, user_role.MODERATOR]).includes(
          user.role,
        )
      ) {
        await this.challengeService.delete(dto.challengeId);
        throw new UnauthorizedError('Invalid or expired login challenge');
      }

      const valid = await this.verificationService.verifyAndConsume({
        namespace: 'admin_login_2fa',
        subject: dto.challengeId,
        code: dto.code,
      });
      if (!valid) {
        throw new BadRequestError('Invalid or expired verification code');
      }

      const tokens = this.tokenService.generateTokenPair({
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        username: user.username,
      });
      await this.prismaService.user.update({
        where: { id: user.id },
        data: { refresh_token: tokens.refresh_token },
      });
      await this.challengeService.delete(dto.challengeId);

      return { ...tokens, user };
    });
  }
}
