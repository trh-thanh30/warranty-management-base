import { ListWarrantyActivationRequestsUseCase } from '@/modules/warranty-activation-requests/use-cases/list-warranty-activation-requests.use-case';

describe('ListWarrantyActivationRequestsUseCase dealer scope', () => {
  it('limits moderator results to assigned dealers', async () => {
    const repository = {
      list: jest.fn().mockResolvedValue({ items: [], meta: { total: 0 } }),
    };
    const dealerAccessPolicy = {
      resolveAccessibleDealerIds: jest.fn().mockResolvedValue(['dealer-a']),
    };
    const useCase = new ListWarrantyActivationRequestsUseCase(
      repository as never,
      dealerAccessPolicy as never,
    );

    await useCase.execute(
      { page: 1 },
      { id: 'moderator-id', role: 'MODERATOR' },
    );

    expect(repository.list).toHaveBeenCalledWith({ page: 1 }, ['dealer-a']);
  });

  it('passes no dealer filter for an admin', async () => {
    const repository = {
      list: jest.fn().mockResolvedValue({ items: [], meta: { total: 0 } }),
    };
    const dealerAccessPolicy = {
      resolveAccessibleDealerIds: jest.fn().mockResolvedValue(undefined),
    };
    const useCase = new ListWarrantyActivationRequestsUseCase(
      repository as never,
      dealerAccessPolicy as never,
    );

    await useCase.execute({ page: 1 }, { id: 'admin-id', role: 'ADMIN' });

    expect(repository.list).toHaveBeenCalledWith({ page: 1 });
  });
});
