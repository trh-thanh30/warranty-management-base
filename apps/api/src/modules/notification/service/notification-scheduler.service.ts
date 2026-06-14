import { PublishScheduledNotificationsUseCase } from '@/modules/notification/use-cases/publish-scheduled-notifications.use-case';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class NotificationSchedulerService {
  private readonly logger = new Logger(NotificationSchedulerService.name);

  constructor(
    private readonly publishScheduledNotificationsUseCase: PublishScheduledNotificationsUseCase,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async publishDueNotifications() {
    try {
      const result = await this.publishScheduledNotificationsUseCase.execute();

      if (result.published > 0) {
        this.logger.log(
          `Published ${result.published} scheduled notifications`,
        );
      }
    } catch (error) {
      this.logger.warn(
        `Cannot publish scheduled notifications: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }
}
