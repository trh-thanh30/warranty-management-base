import { CreateSystemNotificationUseCase } from '@/modules/notification/use-cases/create-system-notification.use-case';
import {
  notification_delivery_status,
  notification_scope,
  notification_source,
  user_role,
} from '@prisma/client';

function makeRepository(overrides: Record<string, unknown> = {}) {
  return {
    transaction: jest.fn((fn) => fn({ tx: true })),
    findTargetUserIds: jest.fn().mockResolvedValue(['user-1', 'user-2']),
    createNotification: jest.fn().mockResolvedValue({ id: 'notification-1' }),
    createRecipients: jest.fn().mockResolvedValue({ count: 2 }),
    ...overrides,
  } as any;
}

describe('CreateSystemNotificationUseCase', () => {
  it('creates system notification and recipients for matched target users', async () => {
    const repository = makeRepository();
    const useCase = new CreateSystemNotificationUseCase(repository);

    await expect(
      useCase.execute({
        title: 'Title',
        content: 'Content',
        type: 'TEST',
        scope: notification_scope.ROLE,
        target_roles: [user_role.ADMIN],
        metadata: { source_id: 'x' },
      } as any),
    ).resolves.toEqual({ id: 'notification-1' });

    expect(repository.findTargetUserIds).toHaveBeenCalledWith(
      { scope: notification_scope.ROLE, target_roles: [user_role.ADMIN] },
      { tx: true },
    );
    expect(repository.createNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Title',
        content: 'Content',
        type: 'TEST',
        source: notification_source.SYSTEM,
        scope: notification_scope.ROLE,
        delivery_status: notification_delivery_status.SENT,
        metadata: {
          source_id: 'x',
          target: {
            scope: notification_scope.ROLE,
            target_roles: [user_role.ADMIN],
            target_user_ids: [],
          },
        },
      }),
      { tx: true },
    );
    expect(repository.createRecipients).toHaveBeenCalledWith(
      'notification-1',
      ['user-1', 'user-2'],
      { tx: true },
    );
  });

  it('rejects notifications with no matched active users', async () => {
    const useCase = new CreateSystemNotificationUseCase(
      makeRepository({ findTargetUserIds: jest.fn().mockResolvedValue([]) }),
    );

    await expect(
      useCase.execute({
        title: 'Title',
        content: 'Content',
        type: 'TEST',
        scope: notification_scope.ALL,
      } as any),
    ).rejects.toThrow('No active users matched notification target');
  });
});
