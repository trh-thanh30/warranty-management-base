import { BadRequestError } from '@/common/response/client-errors/bad-request';
import { NotFoundError } from '@/common/response/client-errors/not-found';
import { RequestVerificationDto } from '@/modules/auth/dto/request-verification.dto';
import { VerificationSessionService } from '@/modules/auth/service/verification-session.service';
import { SendVerificationEmailUseCase } from '@/modules/email/use-cases/send-verification-email.usecase';
import { UsersService } from '@/modules/user/user.service';
import { VerificationService } from '@/modules/verification/verification.service';
import { BaseUseCase } from '@/shared/interfaces/base-usecase.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RequestVerificationUseCase implements BaseUseCase<
  RequestVerificationDto,
  { sessionId: string }
> {
  constructor(
    private readonly usersService: UsersService,
    private readonly verificationService: VerificationService,
    private readonly verificationSessionService: VerificationSessionService,
    private readonly sendVerificationEmailUseCase: SendVerificationEmailUseCase,
  ) {}

  async execute(dto: RequestVerificationDto): Promise<{ sessionId: string }> {
    const { email } = dto;

    // Find user by email
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Check if user is already verified
    if (user.is_verified) {
      throw new BadRequestError('Account is already verified');
    }

    // Create verification session
    const sessionId =
      await this.verificationSessionService.createSession(email);

    // Generate and send verification code
    await this.sendVerificationCode(email);

    return { sessionId };
  }

  private async sendVerificationCode(email: string): Promise<void> {
    const { expiresAt, code } = await this.verificationService.generate({
      namespace: 'email_verification',
      subject: email,
      ttlSec: 15 * 60, // 15 minutes
      length: 6,
      maxAttempts: 5,
      rateLimitMax: 6,
      rateLimitWindowSec: 24 * 60 * 60, // 24 hours
    });

    const ttl = expiresAt - Date.now();

    await this.sendVerificationEmailUseCase.execute({
      to: email,
      code,
      ttl,
    });
  }
}
