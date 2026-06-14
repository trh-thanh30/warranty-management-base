import { NotFoundError } from '@/common/response/client-errors/not-found';
import { ForgotPasswordDto } from '@/modules/auth/dto/forgot-password.dto';
import { VerificationSessionService } from '@/modules/auth/service/verification-session.service';
import { SendForgotPasswordEmailUseCase } from '@/modules/email/use-cases/send-forgot-password-email.usecase';
import { UsersService } from '@/modules/user/user.service';
import { VerificationService } from '@/modules/verification/verification.service';
import { BaseUseCase } from '@/shared/interfaces/base-usecase.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ForgotPasswordUseCase implements BaseUseCase<
  ForgotPasswordDto,
  string
> {
  constructor(
    private readonly usersService: UsersService,
    private readonly verificationService: VerificationService,
    private readonly verificationSessionService: VerificationSessionService,
    private readonly sendForgotPasswordEmailUseCase: SendForgotPasswordEmailUseCase,
  ) {}

  async execute(dto: ForgotPasswordDto): Promise<string> {
    const { email } = dto;

    // Find user by email
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundError('User with this email not found');
    }

    // Create verification session (random ID, not email-based)
    const sessionId =
      await this.verificationSessionService.createSession(email);

    try {
      // Generate a reset code and its expiration time
      const { expiresAt, code } = await this.verificationService.generate({
        namespace: 'password_reset',
        subject: email,
        ttlSec: 15 * 60, // 15 minutes
        length: 6,
        maxAttempts: 5,
        rateLimitMax: 3,
        rateLimitWindowSec: 60 * 15, // 15 minutes
      });
      const ttl = new Date(expiresAt);

      // Send forgot password email asynchronously
      await this.sendForgotPasswordEmailUseCase.execute({
        to: email,
        code,
        ttl,
      });

      return sessionId;
    } catch (error) {
      console.error('Failed to generate or send password reset code:', error);
      throw error;
    }
  }
}
