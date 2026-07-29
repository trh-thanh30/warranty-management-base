import { NotificationRepository } from '@/modules/notification/repository/notification.repository';
import { Injectable } from '@nestjs/common';
import type { UnreadNotificationCount } from '@repo/shared';
import { NOTIFICATION_TYPES } from '@repo/shared/constants';

@Injectable()
export class GetUnreadNotificationCountUseCase {
  constructor(
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async execute(userId: string): Promise<UnreadNotificationCount> {
    const types = await this.notificationRepository.listUnreadTypes(userId);

    return types.reduce<UnreadNotificationCount>(
      (counts, type) => {
        counts.unread += 1;

        if (type === NOTIFICATION_TYPES.WARRANTY_ACTIVATION_REQUEST_CREATED) {
          counts.warranties += 1;
        }

        if (type === NOTIFICATION_TYPES.WARRANTY_CLAIM_CREATED) {
          counts.warrantyClaims += 1;
        }

        if (type === NOTIFICATION_TYPES.CONTACT_SUBMISSION_CREATED) {
          counts.contactSubmissions += 1;
        }

        return counts;
      },
      {
        contactSubmissions: 0,
        unread: 0,
        warranties: 0,
        warrantyClaims: 0,
      },
    );
  }
}
