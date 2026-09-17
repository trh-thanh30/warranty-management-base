import { CreateSystemNotificationUseCase } from '@/modules/notification/use-cases/create-system-notification.use-case';
import { EmailService } from '@/modules/email/email.service';
import { ContactNotificationSettingsService } from '@/modules/system-config/services/contact-notification-settings.service';
import { ConfigService } from '@nestjs/config';
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
  | 'content'
  | 'created_at'
  | 'full_name'
  | 'phone'
  | 'consultation_topic'
  | 'province_code'
  | 'province_name'
  | 'status'
>;

const consultationTopicLabels: Record<string, string> = {
  PRODUCT_CONSULTATION: 'Tư vấn sản phẩm',
  FIND_DEALER: 'Tìm đại lý',
  WARRANTY: 'Bảo hành',
  DEALER_REGISTRATION: 'Đăng ký đại lý',
  OTHER: 'Khác',
};

@Injectable()
export class ContactSubmissionNotificationService {
  private readonly logger = new Logger(
    ContactSubmissionNotificationService.name,
  );

  constructor(
    private readonly createSystemNotificationUseCase: CreateSystemNotificationUseCase,
    private readonly emailService: EmailService,
    private readonly contactNotificationSettingsService: ContactNotificationSettingsService,
    private readonly configService: ConfigService,
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

    try {
      const { email } = await this.contactNotificationSettingsService.get();
      const adminUrl = this.configService.get<string>('client.adminUrl');
      const brandLogoUrl = this.configService.get<string>('email.brandLogoUrl');
      const detailUrl = adminUrl
        ? new URL(
            `/contact-submissions/${encodeURIComponent(submission.id)}`,
            adminUrl,
          ).toString()
        : null;
      const consultationTopic = submission.consultation_topic
        ? (consultationTopicLabels[submission.consultation_topic] ??
          submission.consultation_topic)
        : 'Không chọn';
      const text = [
        'Có lời nhắn liên hệ mới từ website.',
        `Khách hàng: ${submission.full_name}`,
        `Số điện thoại: ${submission.phone}`,
        `Hỗ trợ tư vấn: ${consultationTopic}`,
        `Tỉnh / thành phố: ${submission.province_name ?? 'Không chọn'}`,
        `Thời gian gửi: ${submission.created_at.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}`,
        `Nội dung:\n${submission.content}`,
        ...(detailUrl ? [`Xem chi tiết: ${detailUrl}`] : []),
      ].join('\n\n');
      await this.emailService.sendJob({
        to: email,
        subject: `Lời nhắn liên hệ mới từ ${submission.full_name}`,
        text,
        template: 'contact-submission',
        context: {
          brandLogoUrl,
          subject: `Lời nhắn liên hệ mới từ ${submission.full_name}`,
          fullName: submission.full_name,
          phone: submission.phone,
          consultationTopic,
          provinceName: submission.province_name ?? 'Không chọn',
          createdAt: submission.created_at.toLocaleString('vi-VN', {
            timeZone: 'Asia/Ho_Chi_Minh',
          }),
          content: submission.content,
          detailUrl,
        },
        idempotencyKey: `contact-submission:${submission.id}`,
      });
    } catch (error) {
      this.logger.error(
        `Could not queue contact submission email for ${submission.id}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }
}
