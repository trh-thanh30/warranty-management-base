import { NotificationTarget } from '@/modules/notification/repository/notification.repository';
import { BadRequestException } from '@nestjs/common';
import { notification_scope, user_role } from '@prisma/client';

export function normalizeNotificationTarget(input: {
  scope: notification_scope;
  target_roles?: user_role[];
  target_user_ids?: string[];
}): NotificationTarget {
  if (input.scope === notification_scope.ALL) {
    return { scope: notification_scope.ALL };
  }

  if (input.scope === notification_scope.ROLE) {
    const roles = Array.from(new Set(input.target_roles ?? []));
    if (roles.length === 0) {
      throw new BadRequestException('target_roles is required for ROLE scope');
    }

    return {
      scope: notification_scope.ROLE,
      target_roles: roles,
    };
  }

  const userIds = Array.from(new Set(input.target_user_ids ?? []));
  if (userIds.length === 0) {
    throw new BadRequestException('target_user_ids is required for USER scope');
  }

  return {
    scope: notification_scope.USER,
    target_user_ids: userIds,
  };
}

export function buildTargetMetadata(target: NotificationTarget) {
  return {
    scope: target.scope,
    target_roles: target.target_roles ?? [],
    target_user_ids: target.target_user_ids ?? [],
  };
}
