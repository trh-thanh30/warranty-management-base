import { DealersRepository } from '@/modules/dealers/repository/dealers.repository';
import { DealerAccessPolicy } from '@/modules/dealers/service/dealer-access.policy';
import { GetDealerDetailUseCase } from '@/modules/dealers/use-cases/get-dealer-detail.use-case';
import { ListDealerActivatedCustomersUseCase } from '@/modules/dealers/use-cases/list-dealer-activated-customers.use-case';
import { UpdateDealerUseCase } from '@/modules/dealers/use-cases/update-dealer.use-case';
import { Test, type TestingModule } from '@nestjs/testing';

describe('Dealer-scoped use cases', () => {
  const dealer = {
    id: 'dealer-id',
    name: 'Dealer A',
    phone: null,
    address: 'Ha Noi',
    province: 'Ha Noi',
    district: null,
    latitude: 21.0285,
    longitude: 105.8542,
    sales_name: null,
    is_active: true,
    metadata: null,
    created_at: new Date('2026-09-07T01:00:00.000Z'),
    updated_at: new Date('2026-09-07T01:00:00.000Z'),
  };
  const repository = {
    findById: jest.fn(),
    findByPhone: jest.fn(),
    findMembershipByDealerAndUser: jest.fn(),
    listActivatedCustomers: jest.fn(),
    update: jest.fn(),
  };
  let module: TestingModule;
  let getDetail: GetDealerDetailUseCase;
  let listActivatedCustomers: ListDealerActivatedCustomersUseCase;
  let updateDealer: UpdateDealerUseCase;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        DealerAccessPolicy,
        GetDealerDetailUseCase,
        ListDealerActivatedCustomersUseCase,
        UpdateDealerUseCase,
        { provide: DealersRepository, useValue: repository },
      ],
    }).compile();
    getDetail = module.get(GetDealerDetailUseCase);
    listActivatedCustomers = module.get(ListDealerActivatedCustomersUseCase);
    updateDealer = module.get(UpdateDealerUseCase);
  });

  afterAll(async () => module.close());
  beforeEach(() => {
    jest.clearAllMocks();
    repository.findById.mockResolvedValue(dealer);
    repository.findMembershipByDealerAndUser.mockResolvedValue(null);
  });

  it('allows dealer detail when a moderator is not assigned', async () => {
    await expect(
      getDetail.execute('dealer-id', {
        id: 'moderator-id',
        role: 'MODERATOR',
      }),
    ).resolves.toEqual(expect.objectContaining({ id: 'dealer-id' }));
  });

  it('allows dealer updates when a moderator is not assigned', async () => {
    repository.update.mockResolvedValue({
      ...dealer,
      name: 'Updated dealer',
    });

    await expect(
      updateDealer.execute(
        'dealer-id',
        { name: 'Updated dealer' },
        { id: 'moderator-id', role: 'MODERATOR' },
      ),
    ).resolves.toEqual(expect.objectContaining({ name: 'Updated dealer' }));
  });

  it('allows activated-customer access for an unassigned moderator', async () => {
    repository.listActivatedCustomers.mockResolvedValue({
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

    await expect(
      listActivatedCustomers.execute(
        'dealer-id',
        { limit: 10, page: 1 },
        { id: 'moderator-id', role: 'MODERATOR' },
      ),
    ).resolves.toEqual(
      expect.objectContaining({ items: [], meta: expect.any(Object) }),
    );
  });
});
