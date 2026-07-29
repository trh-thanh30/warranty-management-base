import { PrismaModule } from '@/database/prisma/prisma.module';
import { LocationsModule } from '@/modules/locations/locations.module';
import { ContactSubmissionsController } from '@/modules/contact-submissions/contact-submissions.controller';
import { ContactSubmissionsRepository } from '@/modules/contact-submissions/repository/contact-submissions.repository';
import { CreateContactSubmissionUseCase } from '@/modules/contact-submissions/use-cases/create-contact-submission.use-case';
import { GetContactSubmissionUseCase } from '@/modules/contact-submissions/use-cases/get-contact-submission.use-case';
import { ListContactSubmissionsUseCase } from '@/modules/contact-submissions/use-cases/list-contact-submissions.use-case';
import { UpdateContactSubmissionStatusUseCase } from '@/modules/contact-submissions/use-cases/update-contact-submission-status.use-case';
import { Module } from '@nestjs/common';

@Module({
  imports: [PrismaModule, LocationsModule],
  controllers: [ContactSubmissionsController],
  providers: [
    ContactSubmissionsRepository,
    CreateContactSubmissionUseCase,
    ListContactSubmissionsUseCase,
    GetContactSubmissionUseCase,
    UpdateContactSubmissionStatusUseCase,
  ],
})
export class ContactSubmissionsModule {}
