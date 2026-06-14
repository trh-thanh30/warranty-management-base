import { ListNotificationsDto } from '@/modules/notification/dto/list-notifications.dto';
import { NotificationRepository } from '@/modules/notification/repository/notification.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ListUserNotificationsUseCase {
  constructor(
    private readonly notificationRepository: NotificationRepository,
  ) {}

  execute(userId: string, query: ListNotificationsDto) {
    return this.notificationRepository.listForUser(userId, query);
  }
}
