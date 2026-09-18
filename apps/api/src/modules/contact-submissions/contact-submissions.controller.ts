import { Permissions } from '@/common/decorators/permissions.decorator';
import { createDatedExcelFilename, sendExcelFile } from '@/common/excel';
import { Public } from '@/common/decorators/public.decorator';
import { ContactSubmissionTurnstileGuard } from '@/modules/contact-submissions/guards/contact-submission-turnstile.guard';
import {
  CreateContactSubmissionDto,
  ExportContactSubmissionsDto,
  ListContactSubmissionsDto,
  UpdateContactSubmissionStatusDto,
} from '@/modules/contact-submissions/dto/contact-submission.dto';
import { CreateContactSubmissionUseCase } from '@/modules/contact-submissions/use-cases/create-contact-submission.use-case';
import { ExportContactSubmissionsUseCase } from '@/modules/contact-submissions/use-cases/export-contact-submissions.use-case';
import { GetContactSubmissionUseCase } from '@/modules/contact-submissions/use-cases/get-contact-submission.use-case';
import { ListContactSubmissionsUseCase } from '@/modules/contact-submissions/use-cases/list-contact-submissions.use-case';
import { UpdateContactSubmissionStatusUseCase } from '@/modules/contact-submissions/use-cases/update-contact-submission-status.use-case';
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { permission_key } from '@prisma/client';
import express from 'express';

@Controller()
export class ContactSubmissionsController {
  constructor(
    private readonly createContactSubmissionUseCase: CreateContactSubmissionUseCase,
    private readonly listContactSubmissionsUseCase: ListContactSubmissionsUseCase,
    private readonly exportContactSubmissionsUseCase: ExportContactSubmissionsUseCase,
    private readonly getContactSubmissionUseCase: GetContactSubmissionUseCase,
    private readonly updateContactSubmissionStatusUseCase: UpdateContactSubmissionStatusUseCase,
  ) {}

  @Public()
  @UseGuards(ContactSubmissionTurnstileGuard)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('public/contact-submissions')
  create(@Body() dto: CreateContactSubmissionDto) {
    return this.createContactSubmissionUseCase.execute(dto);
  }

  @Get('contact-submissions')
  @Permissions([permission_key.CONTACT_SUBMISSION_VIEW])
  list(@Query() query: ListContactSubmissionsDto) {
    return this.listContactSubmissionsUseCase.execute(query);
  }

  @Get('contact-submissions/export')
  @Permissions([permission_key.CONTACT_SUBMISSION_VIEW])
  async export(
    @Query() query: ExportContactSubmissionsDto,
    @Res() res: express.Response,
  ) {
    const buffer = await this.exportContactSubmissionsUseCase.execute(query);
    sendExcelFile(res, buffer, createDatedExcelFilename('contact-submissions'));
  }

  @Get('contact-submissions/:id')
  @Permissions([permission_key.CONTACT_SUBMISSION_VIEW])
  detail(@Param('id') id: string) {
    return this.getContactSubmissionUseCase.execute(id);
  }

  @Patch('contact-submissions/:id/status')
  @Permissions([permission_key.CONTACT_SUBMISSION_UPDATE])
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateContactSubmissionStatusDto,
  ) {
    return this.updateContactSubmissionStatusUseCase.execute(id, dto);
  }
}
