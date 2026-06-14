import { Roles } from '@/common/decorators/roles.decorator';
import { User } from '@/common/decorators/user.decorator';
import { PaginatedResponse } from '@/common/response';
import { CreateAdminNotificationDto } from '@/modules/notification/dto/create-admin-notification.dto';
import { ListAdminNotificationsDto } from '@/modules/notification/dto/list-admin-notifications.dto';
import { ListNotificationsDto } from '@/modules/notification/dto/list-notifications.dto';
import { NotificationService } from '@/modules/notification/service/notification.service';
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { user_role } from '@prisma/client';

type AuthUser = {
  id: string;
  role: user_role;
};

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('admin')
  @Roles([user_role.ADMIN])
  createAdminNotification(
    @Body() dto: CreateAdminNotificationDto,
    @User() user: AuthUser,
  ) {
    return this.notificationService.createAdmin(dto, user.id);
  }

  @Get('admin')
  @Roles([user_role.ADMIN, user_role.STAFF])
  async listAdmin(@Query() query: ListAdminNotificationsDto) {
    const { data, total } = await this.notificationService.listAdmin(query);

    return PaginatedResponse.from(
      data,
      query.page,
      query.limit,
      total,
      'Notifications fetched successfully',
    );
  }

  @Post('admin/scheduled/publish')
  @Roles([user_role.ADMIN])
  publishScheduledNotifications() {
    return this.notificationService.publishScheduled();
  }

  @Get('unread-count')
  async countUnread(@User() user: AuthUser) {
    const unread = await this.notificationService.countUnread(user.id);
    return { unread };
  }

  @Get()
  async listUser(@Query() query: ListNotificationsDto, @User() user: AuthUser) {
    const { data, total } = await this.notificationService.listUser(
      user.id,
      query,
    );

    return PaginatedResponse.from(
      data,
      query.page,
      query.limit,
      total,
      'Notifications fetched successfully',
    );
  }

  @Get(':id')
  getDetail(@Param('id') id: string, @User() user: AuthUser) {
    return this.notificationService.getUserNotification(id, user.id);
  }

  @Patch('read-all')
  markAllAsRead(@User() user: AuthUser) {
    return this.notificationService.markAllAsRead(user.id);
  }

  @Patch(':id/read')
  markAsRead(@Param('id') id: string, @User() user: AuthUser) {
    return this.notificationService.markAsRead(id, user.id);
  }
}
