import { LoginDto } from '@/modules/auth/dto/login.dto';
import { AdminLoginChallengeService } from '@/modules/auth/service/admin-login-challenge.service';
import { AuthenticateLoginCredentialsUseCase } from '@/modules/auth/use-cases/authenticate-login-credentials.usecase';
import { SendAdminLoginCodeEmailUseCase } from '@/modules/email/use-cases/send-admin-login-code-email.usecase';
import { VerificationService } from '@/modules/verification/verification.service';
import { BaseUseCase } from '@/shared/interfaces/base-usecase.interface';
import { Injectable } from '@nestjs/common';
import { user_role } from '@prisma/client';
import {
  ADMIN_LOGIN_CHALLENGE_METHOD,
  ADMIN_TWO_FACTOR_METHOD,
  type AdminLoginChallengeMethod,
} from '@repo/shared';

export type StartAdminLoginResponse = {
  requires_two_factor: true;
  challenge_id: string;
  expires_at: string;
  method: AdminLoginChallengeMethod;
  masked_destination?: string;
};

@Injectable()
export class StartAdminLoginUseCase implements BaseUseCase<
  LoginDto,
  StartAdminLoginResponse
> {
  constructor(
    private readonly authenticateCredentials: AuthenticateLoginCredentialsUseCase,
    private readonly challengeService: AdminLoginChallengeService,
    private readonly verificationService: VerificationService,
    private readonly sendLoginCodeEmail: SendAdminLoginCodeEmailUseCase,
  ) {}

  async execute(dto: LoginDto): Promise<StartAdminLoginResponse> {
    const user = await this.authenticateCredentials.execute(dto, [
      user_role.ADMIN,
      user_role.MODERATOR,
    ]);
    if (dto.method === ADMIN_TWO_FACTOR_METHOD.PIN) {
      const method = user.pin_hash
        ? ADMIN_LOGIN_CHALLENGE_METHOD.PIN_VERIFY
        : ADMIN_LOGIN_CHALLENGE_METHOD.PIN_SETUP;
      const challenge = await this.challengeService.create({
        userId: user.id,
        email: user.email,
        method,
      });
      return {
        requires_two_factor: true,
        challenge_id: challenge.challengeId,
        expires_at: challenge.expiresAt.toISOString(),
        method,
      };
    }

    await this.challengeService.acquireSendSlot(user.id);
    const challenge = await this.challengeService.create({
      userId: user.id,
      email: user.email,
      method: ADMIN_LOGIN_CHALLENGE_METHOD.EMAIL_OTP,
    });
    let codeExpiresAt = challenge.expiresAt;

    try {
      const generated = await this.verificationService.generate({
        namespace: 'admin_login_2fa',
        subject: challenge.challengeId,
        rateLimitSubject: user.id,
        ttlSec: 5 * 60,
        length: 6,
        maxAttempts: 5,
        rateLimitWindowSec: 24 * 60 * 60,
        rateLimitMax: 10,
      });
      codeExpiresAt = new Date(generated.expiresAt);
      await this.sendLoginCodeEmail.execute({
        to: user.email,
        code: generated.code,
        ttl: generated.expiresAt - Date.now(),
      });
    } catch (error) {
      await this.challengeService.releaseSendSlot(user.id);
      await this.verificationService.consume({
        namespace: 'admin_login_2fa',
        subject: challenge.challengeId,
      });
      await this.challengeService.delete(challenge.challengeId);
      throw error;
    }

    return {
      requires_two_factor: true,
      challenge_id: challenge.challengeId,
      expires_at: codeExpiresAt.toISOString(),
      masked_destination: this.maskEmail(user.email),
      method: ADMIN_LOGIN_CHALLENGE_METHOD.EMAIL_OTP,
    };
  }

  private maskEmail(email: string): string {
    const [local = '', domain = ''] = email.split('@');
    const visible = local.slice(0, Math.min(2, local.length));
    return `${visible}***@${domain}`;
  }
}
