import {
  buildTargetMetadata,
  normalizeNotificationTarget,
} from '@/modules/notification/use-cases/notification-target.util';
import { notification_scope, user_role } from '@prisma/client';

describe('notification target util', () => {
  it('normalizes ALL target', () => {
    expect(
      normalizeNotificationTarget({ scope: notification_scope.ALL }),
    ).toEqual({ scope: notification_scope.ALL });
  });

  it('deduplicates role and user targets and requires matching inputs', () => {
    expect(
      normalizeNotificationTarget({
        scope: notification_scope.ROLE,
        target_roles: [user_role.ADMIN, user_role.ADMIN, user_role.STAFF],
      }),
    ).toEqual({
      scope: notification_scope.ROLE,
      target_roles: [user_role.ADMIN, user_role.STAFF],
    });

    expect(() =>
      normalizeNotificationTarget({ scope: notification_scope.ROLE }),
    ).toThrow('target_roles is required for ROLE scope');

    expect(
      normalizeNotificationTarget({
        scope: notification_scope.USER,
        target_user_ids: ['user-1', 'user-1', 'user-2'],
      }),
    ).toEqual({
      scope: notification_scope.USER,
      target_user_ids: ['user-1', 'user-2'],
    });

    expect(() =>
      normalizeNotificationTarget({ scope: notification_scope.USER }),
    ).toThrow('target_user_ids is required for USER scope');
  });

  it('builds stable target metadata defaults', () => {
    expect(buildTargetMetadata({ scope: notification_scope.ALL })).toEqual({
      scope: notification_scope.ALL,
      target_roles: [],
      target_user_ids: [],
    });
  });
});
