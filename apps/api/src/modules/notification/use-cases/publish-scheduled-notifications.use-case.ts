import { NotificationRepository } from '@/modules/notification/repository/notification.repository';
import { normalizeNotificationTarget } from '@/modules/notification/use-cases/notification-target.util';
import { Injectable } from '@nestjs/common';
import { notification_scope, user_role } from '@prisma/client';

type ScheduledTargetMetadata = {
  scope?: notification_scope;
  target_roles?: user_role[];
  target_user_ids?: string[];
};

@Injectable()
export class PublishScheduledNotificationsUseCase {
  constructor(
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async execute() {
    const dueNotifications =
      await this.notificationRepository.findDueScheduled();
    let published = 0;

    for (const notification of dueNotifications) {
      const target = this.getTargetFromMetadata(
        this.isRecord(notification.metadata) ? notification.metadata : null,
        notification.scope,
      );

      await this.notificationRepository.transaction(async (tx) => {
        const userIds = await this.notificationRepository.findTargetUserIds(
          target,
          tx,
        );

        await this.notificationRepository.createRecipients(
          notification.id,
          userIds,
          tx,
        );
        await this.notificationRepository.markNotificationSent(
          notification.id,
          tx,
        );
      });

      published += 1;
    }

    return { published };
  }

  private getTargetFromMetadata(
    metadata: Record<string, unknown> | null,
    fallbackScope: notification_scope,
  ) {
    const target = (metadata?.target ?? {}) as ScheduledTargetMetadata;

    return normalizeNotificationTarget({
      scope: target.scope ?? fallbackScope,
      target_roles: target.target_roles,
      target_user_ids: target.target_user_ids,
    });
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
  }
}
