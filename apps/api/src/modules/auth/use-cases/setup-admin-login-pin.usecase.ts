import { BadRequestError, UnauthorizedError } from '@/common/response';
import { PrismaService } from '@/database/prisma/prisma.service';
import { SetupAdminLoginPinDto } from '@/modules/auth/dto/admin-login-two-factor.dto';
import { AdminLoginChallengeService } from '@/modules/auth/service/admin-login-challenge.service';
import { AuthTokenService } from '@/modules/auth/service/auth-token.service';
import { Injectable } from '@nestjs/common';
import {
  admin_two_factor_method,
  user_role,
  user_status,
} from '@prisma/client';
import * as argon2 from 'argon2';
import { ADMIN_LOGIN_CHALLENGE_METHOD } from '@repo/shared/constants';

@Injectable()
export class SetupAdminLoginPinUseCase {
  constructor(
    private readonly challengeService: AdminLoginChallengeService,
    private readonly prisma: PrismaService,
    private readonly tokenService: AuthTokenService,
  ) {}

  async execute(dto: SetupAdminLoginPinDto) {
    if (dto.pin !== dto.confirmPin) {
      throw new BadRequestError('PIN confirmation does not match');
    }

    return this.challengeService.withLock(dto.challengeId, async () => {
      const challenge = await this.challengeService.get(dto.challengeId);
      const user = await this.prisma.user.findUnique({
        where: { id: challenge.userId },
      });
      if (
        challenge.method !== ADMIN_LOGIN_CHALLENGE_METHOD.PIN_SETUP ||
        !user ||
        user.pin_hash ||
        user.status !== user_status.ACTIVE ||
        !(<user_role[]>[user_role.ADMIN, user_role.MODERATOR]).includes(
          user.role,
        )
      ) {
        throw new UnauthorizedError('Invalid or expired PIN setup challenge');
      }

      const pinHash = await argon2.hash(dto.pin);
      const tokens = this.tokenService.generateTokenPair(user);
      const updatedUser = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          pin_hash: pinHash,
          two_factor_method: admin_two_factor_method.PIN,
          refresh_token: tokens.refresh_token,
        },
      });
      await this.challengeService.delete(dto.challengeId);
      return { ...tokens, user: updatedUser };
    });
  }
}
