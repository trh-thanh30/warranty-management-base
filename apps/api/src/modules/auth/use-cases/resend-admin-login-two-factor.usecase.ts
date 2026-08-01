import { BadRequestError, RateLimitError } from '@/common/response';
import { ResendAdminLoginTwoFactorDto } from '@/modules/auth/dto/admin-login-two-factor.dto';
import { AdminLoginChallengeService } from '@/modules/auth/service/admin-login-challenge.service';
import { SendAdminLoginCodeEmailUseCase } from '@/modules/email/use-cases/send-admin-login-code-email.usecase';
import { VerificationService } from '@/modules/verification/verification.service';
import { BaseUseCase } from '@/shared/interfaces/base-usecase.interface';
import { Injectable } from '@nestjs/common';
import { ADMIN_LOGIN_CHALLENGE_METHOD } from '@repo/shared';

@Injectable()
export class ResendAdminLoginTwoFactorUseCase implements BaseUseCase<
  ResendAdminLoginTwoFactorDto,
  { expires_at: string }
> {
  constructor(
    private readonly challengeService: AdminLoginChallengeService,
    private readonly verificationService: VerificationService,
    private readonly sendLoginCodeEmail: SendAdminLoginCodeEmailUseCase,
  ) {}

  async execute(
    dto: ResendAdminLoginTwoFactorDto,
  ): Promise<{ expires_at: string }> {
    const challenge = await this.challengeService.get(dto.challengeId);
    if (challenge.method !== ADMIN_LOGIN_CHALLENGE_METHOD.EMAIL_OTP) {
      throw new BadRequestError('Email verification is not available');
    }
    await this.challengeService.acquireSendSlot(challenge.userId);

    try {
      const generated = await this.verificationService.generate({
        namespace: 'admin_login_2fa',
        subject: dto.challengeId,
        rateLimitSubject: challenge.userId,
        ttlSec: 5 * 60,
        length: 6,
        maxAttempts: 5,
        rateLimitWindowSec: 24 * 60 * 60,
        rateLimitMax: 10,
      });
      await this.sendLoginCodeEmail.execute({
        to: challenge.email,
        code: generated.code,
        ttl: generated.expiresAt - Date.now(),
      });
      return { expires_at: new Date(generated.expiresAt).toISOString() };
    } catch (error) {
      await this.challengeService.releaseSendSlot(challenge.userId);
      if (
        error instanceof Error &&
        (error.message.includes('Too many requests') ||
          error.message.toLowerCase().includes('rate limit'))
      ) {
        throw new RateLimitError(
          'Too many verification requests. Please try again later.',
        );
      }
      throw error;
    }
  }
}
