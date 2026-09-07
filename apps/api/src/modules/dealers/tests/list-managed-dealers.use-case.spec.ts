import { DealersRepository } from '@/modules/dealers/repository/dealers.repository';
import { ListManagedDealersUseCase } from '@/modules/dealers/use-cases/list-managed-dealers.use-case';
import { Test, type TestingModule } from '@nestjs/testing';

describe('ListManagedDealersUseCase', () => {
  const repository = { list: jest.fn() };
  let module: TestingModule;
  let useCase: ListManagedDealersUseCase;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        ListManagedDealersUseCase,
        { provide: DealersRepository, useValue: repository },
      ],
    }).compile();
    useCase = module.get(ListManagedDealersUseCase);
  });

  afterAll(async () => module.close());
  beforeEach(() => jest.clearAllMocks());

  it('scopes the managed dealer list to the current moderator', async () => {
    repository.list.mockResolvedValue({
      items: [],
      meta: {
        hasNextPage: false,
        hasPreviousPage: false,
        limit: 10,
        page: 1,
        total: 0,
        totalPages: 0,
      },
    });

    await useCase.execute(
      { limit: 10, page: 1 },
      { id: 'moderator-id', role: 'MODERATOR' },
    );

    expect(repository.list).toHaveBeenCalledWith(
      { limit: 10, page: 1 },
      'moderator-id',
    );
  });

  it('does not scope the managed dealer list for an admin', async () => {
    repository.list.mockResolvedValue({
      items: [],
      meta: {
        hasNextPage: false,
        hasPreviousPage: false,
        limit: 10,
        page: 1,
        total: 0,
        totalPages: 0,
      },
    });

    await useCase.execute(
      { limit: 10, page: 1 },
      { id: 'admin-id', role: 'ADMIN' },
    );

    expect(repository.list).toHaveBeenCalledWith(
      { limit: 10, page: 1 },
      undefined,
    );
  });
});
