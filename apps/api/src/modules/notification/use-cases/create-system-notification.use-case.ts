import { CreateSystemNotificationDto } from '@/modules/notification/dto/create-admin-notification.dto';
import { NotificationRepository } from '@/modules/notification/repository/notification.repository';
import {
  buildTargetMetadata,
  normalizeNotificationTarget,
} from '@/modules/notification/use-cases/notification-target.util';
import { BadRequestException, Injectable } from '@nestjs/common';
import {
  notification_delivery_status,
  notification_source,
  Prisma,
} from '@prisma/client';

@Injectable()
export class CreateSystemNotificationUseCase {
  constructor(
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async execute(dto: CreateSystemNotificationDto) {
    const target = normalizeNotificationTarget(dto);
    const metadata: Prisma.InputJsonObject = {
      ...(dto.metadata ?? {}),
      target: buildTargetMetadata(target),
    };

    return this.notificationRepository.transaction(async (tx) => {
      const userIds = await this.notificationRepository.findTargetUserIds(
        target,
        tx,
      );

      if (userIds.length === 0) {
        throw new BadRequestException(
          'No active users matched notification target',
        );
      }

      const notification = await this.notificationRepository.createNotification(
        {
          title: dto.title,
          content: dto.content,
          type: dto.type,
          source: notification_source.SYSTEM,
          scope: target.scope,
          delivery_status: notification_delivery_status.SENT,
          sent_at: new Date(),
          metadata,
        },
        tx,
      );

      await this.notificationRepository.createRecipients(
        notification.id,
        userIds,
        tx,
      );

      return notification;
    });
  }
}
