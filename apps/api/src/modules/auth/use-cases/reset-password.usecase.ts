import { BcryptService } from '@/common/helpers/bcrypt.util';
import { BadRequestError } from '@/common/response/client-errors/bad-request';
import { NotFoundError } from '@/common/response/client-errors/not-found';
import { UnauthorizedError } from '@/common/response/client-errors/unauthorized';
import { PrismaService } from '@/database/prisma/prisma.service';
import { ResetPasswordDto } from '@/modules/auth/dto/reset-password.dto';
import { VerificationSessionService } from '@/modules/auth/service/verification-session.service';
import { VerificationService } from '@/modules/verification/verification.service';
import { BaseUseCase } from '@/shared/interfaces/base-usecase.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ResetPasswordUseCase implements BaseUseCase<
  ResetPasswordDto,
  void
> {
  constructor(
    private readonly verificationService: VerificationService,
    private readonly verificationSessionService: VerificationSessionService,
    private readonly prismaService: PrismaService,
    private readonly bcryptService: BcryptService,
  ) {}

  async execute(dto: ResetPasswordDto): Promise<void> {
    const { sessionId, code, password } = dto;

    // Get email from session
    const email = await this.verificationSessionService.getEmail(sessionId);
    if (!email) {
      throw new UnauthorizedError('Invalid or expired password reset session');
    }

    // Check if user exists
    const user = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Verify and consume the code using verification service
    const isValid = await this.verificationService.verifyAndConsume({
      namespace: 'password_reset',
      subject: email,
      code,
    });

    if (!isValid) {
      throw new BadRequestError('Invalid or expired verification code');
    }

    // Hash new password
    const hashedPassword = await this.bcryptService.hashPassword(password);

    // Update user password
    await this.prismaService.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    // Delete verification session after successful reset
    await this.verificationSessionService.deleteSession(sessionId);
  }
}
