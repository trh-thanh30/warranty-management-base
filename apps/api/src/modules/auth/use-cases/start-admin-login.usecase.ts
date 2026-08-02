import { LoginDto } from '@/modules/auth/dto/login.dto';
import { AdminLoginChallengeService } from '@/modules/auth/service/admin-login-challenge.service';
import { AuthenticateLoginCredentialsUseCase } from '@/modules/auth/use-cases/authenticate-login-credentials.usecase';
import { BaseUseCase } from '@/shared/interfaces/base-usecase.interface';
import { Injectable } from '@nestjs/common';
import { admin_two_factor_method, user_role } from '@prisma/client';
import type { AdminLoginStartResponse } from '@repo/shared';
import {
  ADMIN_LOGIN_CHALLENGE_METHOD,
  ADMIN_TWO_FACTOR_METHOD,
} from '@repo/shared/constants';

@Injectable()
export class StartAdminLoginUseCase implements BaseUseCase<
  LoginDto,
  AdminLoginStartResponse
> {
  constructor(
    private readonly authenticateCredentials: AuthenticateLoginCredentialsUseCase,
    private readonly challengeService: AdminLoginChallengeService,
  ) {}

  async execute(dto: LoginDto): Promise<AdminLoginStartResponse> {
    const user = await this.authenticateCredentials.execute(dto, [
      user_role.ADMIN,
      user_role.MODERATOR,
    ]);
    const challenge = await this.challengeService.create({
      userId: user.id,
      email: user.email,
      method: ADMIN_LOGIN_CHALLENGE_METHOD.METHOD_SELECTION,
    });

    return {
      requires_two_factor: true,
      challenge_id: challenge.challengeId,
      expires_at: challenge.expiresAt.toISOString(),
      available_methods: [
        ADMIN_TWO_FACTOR_METHOD.EMAIL_OTP,
        ADMIN_TWO_FACTOR_METHOD.PIN,
      ],
      recommended_method:
        user.two_factor_method === admin_two_factor_method.PIN
          ? ADMIN_TWO_FACTOR_METHOD.PIN
          : ADMIN_TWO_FACTOR_METHOD.EMAIL_OTP,
      pin_configured: Boolean(user.pin_hash),
      masked_destination: this.maskEmail(user.email),
    };
  }

  private maskEmail(email: string): string {
    const [local = '', domain = ''] = email.split('@');
    const visible = local.slice(0, Math.min(2, local.length));
    return `${visible}***@${domain}`;
  }
}
