import { ConflictError, NotFoundError } from '@/common/response';
import { CreateDealerUseCase } from '@/modules/dealers/use-cases/create-dealer.use-case';
import { GetDealerDetailUseCase } from '@/modules/dealers/use-cases/get-dealer-detail.use-case';
import { ListDealersUseCase } from '@/modules/dealers/use-cases/list-dealers.use-case';
import { ListDealerActivatedCustomersUseCase } from '@/modules/dealers/use-cases/list-dealer-activated-customers.use-case';
import { UpdateDealerUseCase } from '@/modules/dealers/use-cases/update-dealer.use-case';

const baseDealer = {
  id: 'dealer-id',
  name: 'Lexzenz Ha Noi',
  phone: '0901234567',
  address: '1 Nguyen Trai',
  province: 'Ha Noi',
  district: null,
  latitude: 21.0285,
  longitude: 105.8542,
  sales_name: 'Thanh',
  is_active: true,
  metadata: null,
  created_at: new Date('2026-07-23T00:00:00.000Z'),
  updated_at: new Date('2026-07-23T00:00:00.000Z'),
};

describe('Dealers use cases', () => {
  const repository = {
    create: jest.fn(),
    findById: jest.fn(),
    findByPhone: jest.fn(),
    list: jest.fn(),
    listActivatedCustomers: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a dealer with normalized fields', async () => {
    repository.findByPhone.mockResolvedValue(null);
    repository.create.mockResolvedValue(baseDealer);
    const useCase = new CreateDealerUseCase(repository as never);

    const result = await useCase.execute({
      address: ' 1 Nguyen Trai ',
      name: ' Lexzenz Ha Noi ',
      phone: '0901234567',
      province: ' Ha Noi ',
      salesName: ' Thanh ',
      latitude: 21.0285,
      longitude: 105.8542,
    });

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        address: '1 Nguyen Trai',
        name: 'Lexzenz Ha Noi',
        phone: '0901234567',
        province: 'Ha Noi',
        latitude: 21.0285,
        longitude: 105.8542,
        sales_name: 'Thanh',
      }),
    );
    expect(result.name).toBe('Lexzenz Ha Noi');
  });

  it('rejects duplicate dealer phone', async () => {
    repository.findByPhone.mockResolvedValue(baseDealer);
    const useCase = new CreateDealerUseCase(repository as never);

    await expect(
      useCase.execute({
        address: '1 Nguyen Trai',
        name: 'Lexzenz Ha Noi',
        phone: '0901234567',
        province: 'Ha Noi',
        latitude: 21.0285,
        longitude: 105.8542,
      }),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it('lists dealer responses', async () => {
    repository.list.mockResolvedValue({
      items: [baseDealer],
      meta: {
        hasNextPage: false,
        hasPreviousPage: false,
        limit: 10,
        page: 1,
        total: 1,
        totalPages: 1,
      },
    });
    const useCase = new ListDealersUseCase(repository as never);

    const result = await useCase.execute({ limit: 10, page: 1 });

    expect(result.items).toEqual([
      expect.objectContaining({
        id: 'dealer-id',
        name: 'Lexzenz Ha Noi',
        salesName: 'Thanh',
      }),
    ]);
  });

  it('throws not found for missing dealer detail', async () => {
    repository.findById.mockResolvedValue(null);
    const useCase = new GetDealerDetailUseCase(repository as never);

    await expect(useCase.execute('missing-id')).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });

  it('lists activated customers for an existing dealer', async () => {
    repository.findById.mockResolvedValue(baseDealer);
    repository.listActivatedCustomers.mockResolvedValue({
      items: [
        {
          id: 'activation-id',
          reviewed_at: new Date('2026-07-30T00:00:00.000Z'),
          customer: {
            id: 'customer-id',
            full_name: 'Nguyen Van A',
            phone: '0901234567',
            email: 'a@example.com',
          },
          product: {
            id: 'product-id',
            display_name: 'Film Premium',
            product_code: 'PRD-001',
            serial_number: 'SN-001',
          },
          activated_warranty: {
            id: 'warranty-id',
            warranty_code: 'WM-001',
            status: 'ACTIVE',
            start_date: new Date('2026-07-30T00:00:00.000Z'),
            end_date: new Date('2028-07-30T00:00:00.000Z'),
            duration_months: 24,
          },
        },
      ],
      meta: {
        hasNextPage: false,
        hasPreviousPage: false,
        limit: 10,
        page: 1,
        total: 1,
        totalPages: 1,
      },
    });

    const useCase = new ListDealerActivatedCustomersUseCase(
      repository as never,
    );
    const result = await useCase.execute('dealer-id', { limit: 10, page: 1 });

    expect(repository.listActivatedCustomers).toHaveBeenCalledWith(
      'dealer-id',
      { limit: 10, page: 1 },
    );
    expect(result.items[0]).toEqual(
      expect.objectContaining({
        customer: expect.objectContaining({ fullName: 'Nguyen Van A' }),
        warranty: expect.objectContaining({
          status: 'ACTIVE',
          warrantyCode: 'WM-001',
        }),
      }),
    );
  });

  it('throws not found when listing customers for a missing dealer', async () => {
    repository.findById.mockResolvedValue(null);
    const useCase = new ListDealerActivatedCustomersUseCase(
      repository as never,
    );

    await expect(
      useCase.execute('missing-id', { limit: 10, page: 1 }),
    ).rejects.toBeInstanceOf(NotFoundError);
    expect(repository.listActivatedCustomers).not.toHaveBeenCalled();
  });

  it('updates a dealer and can deactivate it', async () => {
    repository.findById.mockResolvedValue(baseDealer);
    repository.update.mockResolvedValue({ ...baseDealer, is_active: false });
    const useCase = new UpdateDealerUseCase(repository as never);

    const result = await useCase.execute('dealer-id', { isActive: false });

    expect(repository.update).toHaveBeenCalledWith('dealer-id', {
      address: undefined,
      is_active: false,
      metadata: undefined,
      latitude: undefined,
      longitude: undefined,
      name: undefined,
      phone: undefined,
      province: undefined,
      sales_name: undefined,
    });
    expect(result.isActive).toBe(false);
  });
});
