import { PrismaModule } from '@/database/prisma/prisma.module';
import { LocationsModule } from '@/modules/locations/locations.module';
import { ContactSubmissionsController } from '@/modules/contact-submissions/contact-submissions.controller';
import { ContactSubmissionsRepository } from '@/modules/contact-submissions/repository/contact-submissions.repository';
import { ContactSubmissionTurnstileGuard } from '@/modules/contact-submissions/guards/contact-submission-turnstile.guard';
import { ContactSubmissionNotificationService } from '@/modules/contact-submissions/service/contact-submission-notification.service';
import { CreateContactSubmissionUseCase } from '@/modules/contact-submissions/use-cases/create-contact-submission.use-case';
import { GetContactSubmissionUseCase } from '@/modules/contact-submissions/use-cases/get-contact-submission.use-case';
import { ListContactSubmissionsUseCase } from '@/modules/contact-submissions/use-cases/list-contact-submissions.use-case';
import { UpdateContactSubmissionStatusUseCase } from '@/modules/contact-submissions/use-cases/update-contact-submission-status.use-case';
import { NotificationModule } from '@/modules/notification/notification.module';
import { EmailModule } from '@/modules/email/email.module';
import { SystemConfigModule } from '@/modules/system-config/system-config.module';
import { PublicSubmissionProtectionModule } from '@/modules/public-submission-protection/public-submission-protection.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    PrismaModule,
    LocationsModule,
    NotificationModule,
    EmailModule,
    SystemConfigModule,
    PublicSubmissionProtectionModule,
  ],
  controllers: [ContactSubmissionsController],
  providers: [
    ContactSubmissionsRepository,
    ContactSubmissionTurnstileGuard,
    ContactSubmissionNotificationService,
    CreateContactSubmissionUseCase,
    ListContactSubmissionsUseCase,
    GetContactSubmissionUseCase,
    UpdateContactSubmissionStatusUseCase,
  ],
})
export class ContactSubmissionsModule {}
