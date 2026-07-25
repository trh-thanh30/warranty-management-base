import { GetUnreadNotificationCountUseCase } from '@/modules/notification/use-cases/get-unread-notification-count.use-case';
import { NotificationRepository } from '@/modules/notification/repository/notification.repository';
import { Test } from '@nestjs/testing';

function makeRepository(types: string[]) {
  return {
    listUnreadTypes: jest.fn().mockResolvedValue(types),
  };
}

async function makeUseCase(types: string[]) {
  const testingModule = await Test.createTestingModule({
    providers: [
      GetUnreadNotificationCountUseCase,
      {
        provide: NotificationRepository,
        useValue: makeRepository(types),
      },
    ],
  }).compile();

  return testingModule.get(GetUnreadNotificationCountUseCase);
}

describe('GetUnreadNotificationCountUseCase', () => {
  it('resolves NotificationRepository through Nest dependency injection', async () => {
    const useCase = await makeUseCase([]);

    expect(useCase).toBeInstanceOf(GetUnreadNotificationCountUseCase);
  });

  it('counts only newly created requests in sidebar counters', async () => {
    const useCase = await makeUseCase([
      'WARRANTY_CLAIM_CREATED',
      'WARRANTY_CLAIM_STATUS_CHANGED',
      'WARRANTY_CLAIM_ASSIGNED_SERVICE_CENTER',
      'WARRANTY_CLAIM_SLA_BREACHED',
      'WARRANTY_ACTIVATION_REQUEST_CREATED',
      'GENERAL',
    ]);

    await expect(useCase.execute('user-1')).resolves.toEqual({
      unread: 6,
      warranties: 1,
      warrantyClaims: 1,
    });
  });

  it('returns zero counters when there are no unread notifications', async () => {
    const useCase = await makeUseCase([]);

    await expect(useCase.execute('user-1')).resolves.toEqual({
      unread: 0,
      warranties: 0,
      warrantyClaims: 0,
    });
  });
});
