import { UnauthorizedError } from '@/common/response';
import { PrismaService } from '@/database/prisma/prisma.service';
import { SelectAdminLoginMethodDto } from '@/modules/auth/dto/admin-login-two-factor.dto';
import { AdminLoginChallengeService } from '@/modules/auth/service/admin-login-challenge.service';
import { SendAdminLoginCodeEmailUseCase } from '@/modules/email/use-cases/send-admin-login-code-email.usecase';
import { VerificationService } from '@/modules/verification/verification.service';
import { BaseUseCase } from '@/shared/interfaces/base-usecase.interface';
import { Injectable } from '@nestjs/common';
import { user_role, user_status } from '@prisma/client';
import type { AdminLoginChallengeResponse } from '@repo/shared';
import {
  ADMIN_LOGIN_CHALLENGE_METHOD,
  ADMIN_TWO_FACTOR_METHOD,
} from '@repo/shared/constants';

@Injectable()
export class SelectAdminLoginMethodUseCase implements BaseUseCase<
  SelectAdminLoginMethodDto,
  AdminLoginChallengeResponse
> {
  constructor(
    private readonly challengeService: AdminLoginChallengeService,
    private readonly prisma: PrismaService,
    private readonly verificationService: VerificationService,
    private readonly sendLoginCodeEmail: SendAdminLoginCodeEmailUseCase,
  ) {}

  async execute(
    dto: SelectAdminLoginMethodDto,
  ): Promise<AdminLoginChallengeResponse> {
    const pending = await this.challengeService.get(dto.challengeId);
    const user = await this.prisma.user.findUnique({
      where: { id: pending.userId },
    });
    if (
      !user ||
      user.email !== pending.email ||
      user.status !== user_status.ACTIVE ||
      !(<user_role[]>[user_role.ADMIN, user_role.MODERATOR]).includes(user.role)
    ) {
      await this.challengeService.delete(dto.challengeId);
      throw new UnauthorizedError('Invalid or expired login challenge');
    }

    if (dto.method === ADMIN_TWO_FACTOR_METHOD.PIN) {
      if (pending.method === ADMIN_LOGIN_CHALLENGE_METHOD.EMAIL_OTP) {
        await this.verificationService.consume({
          namespace: 'admin_login_2fa',
          subject: dto.challengeId,
        });
      }
      const method = user.pin_hash
        ? ADMIN_LOGIN_CHALLENGE_METHOD.PIN_VERIFY
        : ADMIN_LOGIN_CHALLENGE_METHOD.PIN_SETUP;
      const challenge = await this.challengeService.setMethod(
        dto.challengeId,
        method,
      );
      return {
        challenge_id: dto.challengeId,
        expires_at: challenge.expiresAt.toISOString(),
        method,
      };
    }

    await this.challengeService.acquireSendSlot(user.id);
    await this.challengeService.setMethod(
      dto.challengeId,
      ADMIN_LOGIN_CHALLENGE_METHOD.EMAIL_OTP,
    );

    try {
      const generated = await this.verificationService.generate({
        namespace: 'admin_login_2fa',
        subject: dto.challengeId,
        rateLimitSubject: user.id,
        ttlSec: 5 * 60,
        length: 6,
        maxAttempts: 5,
        rateLimitWindowSec: 24 * 60 * 60,
        rateLimitMax: 10,
      });
      await this.sendLoginCodeEmail.execute({
        to: user.email,
        code: generated.code,
        ttl: generated.expiresAt - Date.now(),
      });
      return {
        challenge_id: dto.challengeId,
        expires_at: new Date(generated.expiresAt).toISOString(),
        masked_destination: this.maskEmail(user.email),
        method: ADMIN_LOGIN_CHALLENGE_METHOD.EMAIL_OTP,
      };
    } catch (error) {
      await this.challengeService.releaseSendSlot(user.id);
      await this.verificationService.consume({
        namespace: 'admin_login_2fa',
        subject: dto.challengeId,
      });
      await this.challengeService.setMethod(
        dto.challengeId,
        ADMIN_LOGIN_CHALLENGE_METHOD.METHOD_SELECTION,
      );
      throw error;
    }
  }

  private maskEmail(email: string): string {
    const [local = '', domain = ''] = email.split('@');
    const visible = local.slice(0, Math.min(2, local.length));
    return `${visible}***@${domain}`;
  }
}
