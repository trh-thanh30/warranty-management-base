import { CreateSystemNotificationUseCase } from '@/modules/notification/use-cases/create-system-notification.use-case';
import { Injectable, Logger } from '@nestjs/common';
import { NOTIFICATION_TYPES } from '@repo/shared/constants';
import {
  notification_scope,
  user_role,
  type ContactSubmission,
} from '@prisma/client';

type ContactSubmissionNotificationInput = Pick<
  ContactSubmission,
  | 'id'
  | 'full_name'
  | 'phone'
  | 'consultation_topic'
  | 'province_code'
  | 'province_name'
  | 'status'
>;

@Injectable()
export class ContactSubmissionNotificationService {
  private readonly logger = new Logger(
    ContactSubmissionNotificationService.name,
  );

  constructor(
    private readonly createSystemNotificationUseCase: CreateSystemNotificationUseCase,
  ) {}

  async submissionCreated(submission: ContactSubmissionNotificationInput) {
    try {
      await this.createSystemNotificationUseCase.execute({
        title: `New contact submission from ${submission.full_name}`,
        content: `A new consultation request has been submitted by ${submission.full_name}.`,
        type: NOTIFICATION_TYPES.CONTACT_SUBMISSION_CREATED,
        scope: notification_scope.ROLE,
        target_roles: [user_role.ADMIN, user_role.MODERATOR],
        metadata: {
          submissionId: submission.id,
          fullName: submission.full_name,
          phone: submission.phone,
          consultationTopic: submission.consultation_topic,
          provinceCode: submission.province_code,
          provinceName: submission.province_name,
          status: submission.status,
        },
      });
    } catch (error) {
      this.logger.warn(
        `Could not publish contact submission notification: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }
}
