import {
  CreateAdminNotificationDto,
  CreateSystemNotificationDto,
} from '@/modules/notification/dto/create-admin-notification.dto';
import { ListAdminNotificationsDto } from '@/modules/notification/dto/list-admin-notifications.dto';
import { ListNotificationsDto } from '@/modules/notification/dto/list-notifications.dto';
import { NotificationRepository } from '@/modules/notification/repository/notification.repository';
import { CreateAdminNotificationUseCase } from '@/modules/notification/use-cases/create-admin-notification.use-case';
import { CreateSystemNotificationUseCase } from '@/modules/notification/use-cases/create-system-notification.use-case';
import { GetUserNotificationUseCase } from '@/modules/notification/use-cases/get-user-notification.use-case';
import { ListUserNotificationsUseCase } from '@/modules/notification/use-cases/list-user-notifications.use-case';
import { MarkAllNotificationsReadUseCase } from '@/modules/notification/use-cases/mark-all-notifications-read.use-case';
import { MarkNotificationReadUseCase } from '@/modules/notification/use-cases/mark-notification-read.use-case';
import { PublishScheduledNotificationsUseCase } from '@/modules/notification/use-cases/publish-scheduled-notifications.use-case';
import { Injectable } from '@nestjs/common';

@Injectable()
export class NotificationService {
  constructor(
    private readonly notificationRepository: NotificationRepository,
    private readonly createAdminNotificationUseCase: CreateAdminNotificationUseCase,
    private readonly createSystemNotificationUseCase: CreateSystemNotificationUseCase,
    private readonly listUserNotificationsUseCase: ListUserNotificationsUseCase,
    private readonly getUserNotificationUseCase: GetUserNotificationUseCase,
    private readonly markNotificationReadUseCase: MarkNotificationReadUseCase,
    private readonly markAllNotificationsReadUseCase: MarkAllNotificationsReadUseCase,
    private readonly publishScheduledNotificationsUseCase: PublishScheduledNotificationsUseCase,
  ) {}

  createAdmin(dto: CreateAdminNotificationDto, adminId: string) {
    return this.createAdminNotificationUseCase.execute(dto, adminId);
  }

  createSystem(dto: CreateSystemNotificationDto) {
    return this.createSystemNotificationUseCase.execute(dto);
  }

  async listUser(userId: string, query: ListNotificationsDto) {
    return this.listUserNotificationsUseCase.execute(userId, query);
  }

  getUserNotification(notificationId: string, userId: string) {
    return this.getUserNotificationUseCase.execute(notificationId, userId);
  }

  markAsRead(notificationId: string, userId: string) {
    return this.markNotificationReadUseCase.execute(notificationId, userId);
  }

  markAllAsRead(userId: string) {
    return this.markAllNotificationsReadUseCase.execute(userId);
  }

  countUnread(userId: string) {
    return this.notificationRepository.countUnread(userId);
  }

  listAdmin(query: ListAdminNotificationsDto) {
    return this.notificationRepository.listAdmin(query);
  }

  publishScheduled() {
    return this.publishScheduledNotificationsUseCase.execute();
  }
}
