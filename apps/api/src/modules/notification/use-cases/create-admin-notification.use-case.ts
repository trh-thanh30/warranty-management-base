import { CreateAdminNotificationDto } from '@/modules/notification/dto/create-admin-notification.dto';
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
export class CreateAdminNotificationUseCase {
  constructor(
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async execute(dto: CreateAdminNotificationDto, adminId: string) {
    const target = normalizeNotificationTarget(dto);
    const scheduledAt = dto.scheduled_at ? new Date(dto.scheduled_at) : null;
    const isScheduled = scheduledAt
      ? scheduledAt.getTime() > Date.now()
      : false;
    const metadata = this.buildMetadata(dto.metadata, target);

    if (isScheduled) {
      return this.notificationRepository.createNotification({
        title: dto.title,
        content: dto.content,
        type: dto.type,
        source: notification_source.ADMIN,
        scope: target.scope,
        delivery_status: notification_delivery_status.SCHEDULED,
        scheduled_at: scheduledAt,
        created_by_id: adminId,
        metadata,
      });
    }

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
          source: notification_source.ADMIN,
          scope: target.scope,
          delivery_status: notification_delivery_status.SENT,
          scheduled_at: scheduledAt,
          sent_at: new Date(),
          created_by_id: adminId,
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

  private buildMetadata(
    metadata: Record<string, unknown> | undefined,
    target: ReturnType<typeof normalizeNotificationTarget>,
  ): Prisma.InputJsonObject {
    return {
      ...(metadata ?? {}),
      target: buildTargetMetadata(target),
    };
  }
}
