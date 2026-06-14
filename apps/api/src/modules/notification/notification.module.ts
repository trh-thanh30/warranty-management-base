import { PrismaModule } from '@/database/prisma/prisma.module';
import { NotificationController } from '@/modules/notification/notification.controller';
import { NotificationRepository } from '@/modules/notification/repository/notification.repository';
import { NotificationSchedulerService } from '@/modules/notification/service/notification-scheduler.service';
import { NotificationService } from '@/modules/notification/service/notification.service';
import { CreateAdminNotificationUseCase } from '@/modules/notification/use-cases/create-admin-notification.use-case';
import { CreateSystemNotificationUseCase } from '@/modules/notification/use-cases/create-system-notification.use-case';
import { GetUserNotificationUseCase } from '@/modules/notification/use-cases/get-user-notification.use-case';
import { ListUserNotificationsUseCase } from '@/modules/notification/use-cases/list-user-notifications.use-case';
import { MarkAllNotificationsReadUseCase } from '@/modules/notification/use-cases/mark-all-notifications-read.use-case';
import { MarkNotificationReadUseCase } from '@/modules/notification/use-cases/mark-notification-read.use-case';
import { PublishScheduledNotificationsUseCase } from '@/modules/notification/use-cases/publish-scheduled-notifications.use-case';
import { Module } from '@nestjs/common';

@Module({
  imports: [PrismaModule],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    NotificationSchedulerService,
    NotificationRepository,
    CreateAdminNotificationUseCase,
    CreateSystemNotificationUseCase,
    ListUserNotificationsUseCase,
    GetUserNotificationUseCase,
    MarkNotificationReadUseCase,
    MarkAllNotificationsReadUseCase,
    PublishScheduledNotificationsUseCase,
  ],
  exports: [
    NotificationService,
    CreateSystemNotificationUseCase,
    PublishScheduledNotificationsUseCase,
  ],
})
export class NotificationModule {}
