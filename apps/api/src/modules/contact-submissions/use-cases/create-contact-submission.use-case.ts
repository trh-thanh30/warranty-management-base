import { BadRequestError, ConflictError } from '@/common/response';
import { GetVietnamProvinceUseCase } from '@/modules/locations/use-cases/get-vietnam-province.use-case';
import { ContactSubmissionNotificationService } from '@/modules/contact-submissions/service/contact-submission-notification.service';
import type { CreateContactSubmissionBody } from '@repo/shared';
import {
  CONTACT_CONSULTATION_TOPICS,
  CONTACT_SUBMISSION_ERROR_CODES,
  CONTACT_SUBMISSION_LIMITS,
  PHONE_NUMBER_PATTERN,
} from '@repo/shared/constants';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ContactSubmissionsRepository } from '../repository/contact-submissions.repository';
import { toContactSubmissionResponse } from '../contact-submissions.types';

@Injectable()
export class CreateContactSubmissionUseCase {
  constructor(
    private readonly repository: ContactSubmissionsRepository,
    private readonly getVietnamProvinceUseCase: GetVietnamProvinceUseCase,
    private readonly contactSubmissionNotificationService: ContactSubmissionNotificationService,
  ) {}

  async execute(input: CreateContactSubmissionBody) {
    const fullName = input.fullName.trim();
    const rawPhone = input.phone.trim();
    const phone = normalizeContactPhone(rawPhone);
    const content = input.content.trim();
    const consultationTopic = input.consultationTopic;
    const provinceCode = input.provinceCode.trim();
    const sourcePath = input.sourcePath?.trim() || null;

    if (!CONTACT_CONSULTATION_TOPICS.includes(consultationTopic)) {
      throw new BadRequestError('Consultation topic is invalid');
    }

    if (
      fullName.length < CONTACT_SUBMISSION_LIMITS.fullName.min ||
      fullName.length > CONTACT_SUBMISSION_LIMITS.fullName.max
    ) {
      throw new BadRequestError('Full name length is invalid');
    }

    if (
      phone.length < CONTACT_SUBMISSION_LIMITS.phone.min ||
      phone.length > CONTACT_SUBMISSION_LIMITS.phone.max ||
      !PHONE_NUMBER_PATTERN.test(rawPhone)
    ) {
      throw new BadRequestError('Phone number is invalid');
    }

    if (
      content.length < CONTACT_SUBMISSION_LIMITS.content.min ||
      content.length > CONTACT_SUBMISSION_LIMITS.content.max
    ) {
      throw new BadRequestError('Contact message content length is invalid');
    }

    if (
      provinceCode.length < CONTACT_SUBMISSION_LIMITS.provinceCode.min ||
      provinceCode.length > CONTACT_SUBMISSION_LIMITS.provinceCode.max ||
      !/^\d+$/.test(provinceCode)
    ) {
      throw new BadRequestError('Contact submission province is invalid');
    }

    if (
      sourcePath &&
      sourcePath.length > CONTACT_SUBMISSION_LIMITS.sourcePath.max
    ) {
      throw new BadRequestError('Contact message source path is too long');
    }

    const pendingSubmission = await this.repository.findPendingByPhone(phone);

    if (pendingSubmission) {
      throw createPhonePendingError(phone);
    }

    const province = await this.getVietnamProvinceUseCase.execute(
      Number(provinceCode),
      1,
    );
    const canonicalProvinceCode = String(province.code);
    const canonicalProvinceName = province.name.trim();

    if (
      canonicalProvinceName.length <
        CONTACT_SUBMISSION_LIMITS.provinceName.min ||
      canonicalProvinceName.length > CONTACT_SUBMISSION_LIMITS.provinceName.max
    ) {
      throw new BadRequestError('Contact submission province is invalid');
    }

    let submission;

    try {
      submission = await this.repository.create({
        consultation_topic: consultationTopic,
        content,
        full_name: fullName,
        phone,
        province_code: canonicalProvinceCode,
        province_name: canonicalProvinceName,
        source_path: sourcePath,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw createPhonePendingError(phone);
      }

      throw error;
    }

    await this.contactSubmissionNotificationService.submissionCreated(
      submission,
    );

    return toContactSubmissionResponse(submission);
  }
}

function normalizeContactPhone(phone: string) {
  return phone.replace(/\D/g, '');
}

function createPhonePendingError(phone: string) {
  return new ConflictError(
    'Phone already has a pending contact submission',
    CONTACT_SUBMISSION_ERROR_CODES.PHONE_PENDING,
    { phone },
  );
}
