import { NotificationRepository } from '@/modules/notification/repository/notification.repository';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class GetUserNotificationUseCase {
  constructor(
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async execute(notificationId: string, userId: string) {
    const recipient = await this.notificationRepository.findUserRecipient(
      notificationId,
      userId,
    );

    if (!recipient) {
      throw new NotFoundException('Notification not found');
    }

    return recipient;
  }
}
