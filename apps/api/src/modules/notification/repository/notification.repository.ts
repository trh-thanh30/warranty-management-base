import { Injectable } from '@nestjs/common';
import {
  notification_delivery_status,
  notification_read_status,
  notification_scope,
  notification_source,
  Prisma,
  user_role,
  user_status,
} from '@prisma/client';
import { PrismaService } from '@/database/prisma/prisma.service';

type DbClient = Prisma.TransactionClient | PrismaService;

export interface NotificationTarget {
  scope: notification_scope;
  target_roles?: user_role[];
  target_user_ids?: string[];
}

export interface ListUserNotificationsQuery {
  page: number;
  limit: number;
  q?: string;
  type?: string;
  status?: notification_read_status;
}

export interface ListAdminNotificationsQuery {
  page: number;
  limit: number;
  q?: string;
  type?: string;
  source?: notification_source;
  scope?: notification_scope;
  delivery_status?: notification_delivery_status;
}

@Injectable()
export class NotificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async transaction<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>) {
    return this.prisma.$transaction(fn);
  }

  async findTargetUserIds(
    target: NotificationTarget,
    client: DbClient = this.prisma,
  ) {
    if (target.scope === notification_scope.ALL) {
      const users = await client.user.findMany({
        where: { status: user_status.ACTIVE },
        select: { id: true },
      });

      return users.map((user) => user.id);
    }

    if (target.scope === notification_scope.ROLE) {
      const users = await client.user.findMany({
        where: {
          status: user_status.ACTIVE,
          role: { in: target.target_roles ?? [] },
        },
        select: { id: true },
      });

      return users.map((user) => user.id);
    }

    const users = await client.user.findMany({
      where: {
        id: { in: target.target_user_ids ?? [] },
        status: user_status.ACTIVE,
      },
      select: { id: true },
    });

    return users.map((user) => user.id);
  }

  async createNotification(
    data: Prisma.NotificationUncheckedCreateInput,
    client: DbClient = this.prisma,
  ) {
    return await client.notification.create({ data });
  }

  async createRecipients(
    notificationId: string,
    userIds: string[],
    client: DbClient = this.prisma,
  ) {
    if (userIds.length === 0) {
      return { count: 0 };
    }

    return client.notificationRecipient.createMany({
      data: userIds.map((userId) => ({
        notification_id: notificationId,
        user_id: userId,
      })),
      skipDuplicates: true,
    });
  }

  async markNotificationSent(
    notificationId: string,
    client: DbClient = this.prisma,
  ) {
    return client.notification.update({
      where: { id: notificationId },
      data: {
        delivery_status: notification_delivery_status.SENT,
        sent_at: new Date(),
      },
    });
  }

  async listForUser(userId: string, query: ListUserNotificationsQuery) {
    const skip = (query.page - 1) * query.limit;
    const where: Prisma.NotificationRecipientWhereInput = {
      user_id: userId,
      ...(query.status ? { status: query.status } : {}),
      notification: {
        delivery_status: notification_delivery_status.SENT,
        ...(query.type ? { type: query.type } : {}),
        ...(query.q
          ? {
              OR: [
                { title: { contains: query.q, mode: 'insensitive' } },
                { content: { contains: query.q, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
    };

    const [data, total] = await Promise.all([
      this.prisma.notificationRecipient.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: { created_at: 'desc' },
        include: { notification: true },
      }),
      this.prisma.notificationRecipient.count({ where }),
    ]);

    return { data, total };
  }

  async findUserRecipient(notificationId: string, userId: string) {
    return this.prisma.notificationRecipient.findFirst({
      where: {
        notification_id: notificationId,
        user_id: userId,
        notification: { delivery_status: notification_delivery_status.SENT },
      },
      include: { notification: true },
    });
  }

  async markAsRead(notificationId: string, userId: string) {
    return this.prisma.notificationRecipient.updateMany({
      where: {
        notification_id: notificationId,
        user_id: userId,
        status: notification_read_status.UNREAD,
      },
      data: {
        status: notification_read_status.READ,
        read_at: new Date(),
      },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notificationRecipient.updateMany({
      where: {
        user_id: userId,
        status: notification_read_status.UNREAD,
        notification: { delivery_status: notification_delivery_status.SENT },
      },
      data: {
        status: notification_read_status.READ,
        read_at: new Date(),
      },
    });
  }

  async countUnread(userId: string) {
    return this.prisma.notificationRecipient.count({
      where: {
        user_id: userId,
        status: notification_read_status.UNREAD,
        notification: { delivery_status: notification_delivery_status.SENT },
      },
    });
  }

  async listAdmin(query: ListAdminNotificationsQuery) {
    const skip = (query.page - 1) * query.limit;
    const where: Prisma.NotificationWhereInput = {
      ...(query.type ? { type: query.type } : {}),
      ...(query.source ? { source: query.source } : {}),
      ...(query.scope ? { scope: query.scope } : {}),
      ...(query.delivery_status
        ? { delivery_status: query.delivery_status }
        : {}),
      ...(query.q
        ? {
            OR: [
              { title: { contains: query.q, mode: 'insensitive' } },
              { content: { contains: query.q, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: { created_at: 'desc' },
        include: {
          created_by: {
            select: {
              id: true,
              email: true,
              username: true,
              full_name: true,
              role: true,
            },
          },
          _count: { select: { recipients: true } },
        },
      }),
      this.prisma.notification.count({ where }),
    ]);

    return { data, total };
  }

  async findDueScheduled(now = new Date()) {
    return this.prisma.notification.findMany({
      where: {
        delivery_status: notification_delivery_status.SCHEDULED,
        scheduled_at: { lte: now },
      },
      orderBy: { scheduled_at: 'asc' },
    });
  }
}
