import { EmailService } from '@/modules/email/email.service';
import { SendEmailUseCase } from '@/modules/email/use-cases/send-email.usecase';
import { SendForgotPasswordEmailUseCase } from '@/modules/email/use-cases/send-forgot-password-email.usecase';
import { SendVerificationEmailUseCase } from '@/modules/email/use-cases/send-verification-email.usecase';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'email',
    }),
  ],
  providers: [
    EmailService,
    SendEmailUseCase,
    SendVerificationEmailUseCase,
    SendForgotPasswordEmailUseCase,
  ],
  exports: [
    EmailService,
    SendEmailUseCase,
    SendVerificationEmailUseCase,
    SendForgotPasswordEmailUseCase,
  ],
})
export class EmailModule {}
