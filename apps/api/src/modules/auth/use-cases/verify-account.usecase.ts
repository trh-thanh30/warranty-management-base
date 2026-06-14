import { BadRequestError } from '@/common/response/client-errors/bad-request';
import { NotFoundError } from '@/common/response/client-errors/not-found';
import { UnauthorizedError } from '@/common/response/client-errors/unauthorized';
import { PrismaService } from '@/database/prisma/prisma.service';
import { VerificationSessionService } from '@/modules/auth/service/verification-session.service';
import { VerificationService } from '@/modules/verification/verification.service';
import { BaseUseCase } from '@/shared/interfaces/base-usecase.interface';
import { Injectable } from '@nestjs/common';

export interface VerifyAccountParams {
  sessionId: string;
  code: string;
}

@Injectable()
export class VerifyAccountUseCase implements BaseUseCase<
  VerifyAccountParams,
  void
> {
  constructor(
    private readonly verificationService: VerificationService,
    private readonly verificationSessionService: VerificationSessionService,
    private readonly prismaService: PrismaService,
  ) {}

  async execute(params: VerifyAccountParams): Promise<void> {
    const { sessionId, code } = params;

    // Get email from session (sessionId is random, not email-based)
    const email = await this.verificationSessionService.getEmail(sessionId);
    if (!email) {
      throw new UnauthorizedError('Invalid or expired verification session');
    }

    // Check if user exists
    const user = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Check if already verified
    if (user.is_verified) {
      // Clean up session
      await this.verificationSessionService.deleteSession(sessionId);
      throw new BadRequestError('Account is already verified');
    }

    // Verify and consume the code using verification service
    const isValid = await this.verificationService.verifyAndConsume({
      namespace: 'email_verification',
      subject: email,
      code,
    });

    if (!isValid) {
      throw new BadRequestError('Invalid or expired verification code');
    }

    // Update user status to verified
    await this.prismaService.user.update({
      where: { email },
      data: { is_verified: true },
    });

    // Delete verification session after successful verification
    await this.verificationSessionService.deleteSession(sessionId);
  }
}
