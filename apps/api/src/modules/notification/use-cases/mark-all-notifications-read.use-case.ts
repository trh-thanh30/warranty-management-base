import { NotificationRepository } from '@/modules/notification/repository/notification.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MarkAllNotificationsReadUseCase {
  constructor(
    private readonly notificationRepository: NotificationRepository,
  ) {}

  execute(userId: string) {
    return this.notificationRepository.markAllAsRead(userId);
  }
}
