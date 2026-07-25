import { NotificationRepository } from '@/modules/notification/repository/notification.repository';
import { Injectable } from '@nestjs/common';
import type { UnreadNotificationCount } from '@repo/shared';

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

        if (type === 'WARRANTY_ACTIVATION_REQUEST_CREATED') {
          counts.warranties += 1;
        }

        if (type === 'WARRANTY_CLAIM_CREATED') {
          counts.warrantyClaims += 1;
        }

        return counts;
      },
      {
        unread: 0,
        warranties: 0,
        warrantyClaims: 0,
      },
    );
  }
}
