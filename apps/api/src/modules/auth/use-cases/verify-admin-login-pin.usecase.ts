import {
  BadRequestError,
  RateLimitError,
  UnauthorizedError,
} from '@/common/response';
import { PrismaService } from '@/database/prisma/prisma.service';
import { VerifyAdminLoginPinDto } from '@/modules/auth/dto/admin-login-two-factor.dto';
import { AdminLoginChallengeService } from '@/modules/auth/service/admin-login-challenge.service';
import { AuthTokenService } from '@/modules/auth/service/auth-token.service';
import { Injectable } from '@nestjs/common';
import { user_role, user_status } from '@prisma/client';
import * as argon2 from 'argon2';
import { ADMIN_LOGIN_CHALLENGE_METHOD } from '@repo/shared/constants';

@Injectable()
export class VerifyAdminLoginPinUseCase {
  constructor(
    private readonly challengeService: AdminLoginChallengeService,
    private readonly prisma: PrismaService,
    private readonly tokenService: AuthTokenService,
  ) {}

  async execute(dto: VerifyAdminLoginPinDto) {
    return this.challengeService.withLock(dto.challengeId, async () => {
      const challenge = await this.challengeService.get(dto.challengeId);
      const user = await this.prisma.user.findUnique({
        where: { id: challenge.userId },
      });
      if (
        challenge.method !== ADMIN_LOGIN_CHALLENGE_METHOD.PIN_VERIFY ||
        !user?.pin_hash ||
        user.status !== user_status.ACTIVE ||
        !(<user_role[]>[user_role.ADMIN, user_role.MODERATOR]).includes(
          user.role,
        )
      ) {
        throw new UnauthorizedError('Invalid or expired PIN challenge');
      }

      const lockSeconds = await this.challengeService.getPinLockSeconds(
        user.id,
      );
      if (lockSeconds > 0) {
        throw new RateLimitError(
          `PIN verification is locked. Try again in ${lockSeconds} seconds.`,
          'PIN_VERIFICATION_LOCKED',
          { retryAfterSeconds: lockSeconds },
        );
      }

      if (!(await argon2.verify(user.pin_hash, dto.pin))) {
        const remaining = await this.challengeService.recordPinFailure(user.id);
        if (remaining === 0) {
          throw new RateLimitError(
            'PIN verification is locked for 15 minutes.',
            'PIN_VERIFICATION_LOCKED',
            {
              retryAfterSeconds: AdminLoginChallengeService.PIN_LOCK_SECONDS,
            },
          );
        }
        throw new BadRequestError(
          `Invalid PIN. ${remaining} attempts remaining.`,
          'INVALID_PIN',
          { remainingAttempts: remaining },
        );
      }

      await this.challengeService.resetPinFailures(user.id);
      const tokens = this.tokenService.generateTokenPair(user);
      await this.prisma.user.update({
        where: { id: user.id },
        data: { refresh_token: tokens.refresh_token },
      });
      await this.challengeService.delete(dto.challengeId);
      return { ...tokens, user };
    });
  }
}
