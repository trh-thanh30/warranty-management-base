import { BadRequestError, ForbiddenError } from '@/common/response';
import { CreateAdminWarrantyActivationRequestUseCase } from '@/modules/warranty-activation-requests/use-cases/create-admin-warranty-activation-request.use-case';
import { product_status, warranty_status } from '@prisma/client';

describe('CreateAdminWarrantyActivationRequestUseCase', () => {
  const productsRepository = {
    findActivationRequestTargetById: jest.fn(),
    synchronizeWarrantyCode: jest.fn(),
  };
  const generateWarrantyCodeUseCase = { execute: jest.fn() };
  const createWarrantyActivationRequestUseCase = { execute: jest.fn() };
  const customersRepository = { findById: jest.fn() };
  const permissionService = { hasPermission: jest.fn() };
  const dto = {
    productId: '23684bbd-b6e0-401a-9ba4-97e1b98176fd',
    addressDetail: '1 Nguyen Trai',
    customerEmail: 'customer@example.com',
    customerId: '68a1578a-b13e-45de-b008-e357392be715',
    customerName: 'Nguyen Van A',
    customerPhone: '0901234567',
    installedAt: '2026-09-09T07:30:00.000Z',
    provinceCode: '79',
    provinceName: 'TP Ho Chi Minh',
    wardCode: '26734',
    wardName: 'Phuong Ben Thanh',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    customersRepository.findById.mockResolvedValue({
      id: dto.customerId,
      birthdate: new Date('2005-12-11T00:00:00.000Z'),
      email: dto.customerEmail,
      full_name: dto.customerName,
      phone: dto.customerPhone,
    });
    permissionService.hasPermission.mockResolvedValue(true);
  });

  it('rejects an unknown selected Customer', async () => {
    customersRepository.findById.mockResolvedValue(null);
    const useCase = new CreateAdminWarrantyActivationRequestUseCase(
      productsRepository as never,
      generateWarrantyCodeUseCase as never,
      createWarrantyActivationRequestUseCase as never,
      customersRepository as never,
    );

    await expect(useCase.execute(dto)).rejects.toMatchObject({
      code: 'NOT_FOUND',
      details: { code: 'CUSTOMER_NOT_FOUND' },
    });
    expect(
      createWarrantyActivationRequestUseCase.execute,
    ).not.toHaveBeenCalled();
  });

  it('uses the selected Customer birthdate when the form omits it', async () => {
    createWarrantyActivationRequestUseCase.execute.mockResolvedValue({
      id: 'request-id',
    });
    const useCase = new CreateAdminWarrantyActivationRequestUseCase(
      productsRepository as never,
      generateWarrantyCodeUseCase as never,
      createWarrantyActivationRequestUseCase as never,
      customersRepository as never,
    );

    await useCase.execute({
      ...dto,
      categoryId: 'fd47a803-b240-4935-aab4-554d44fce684',
      items: [
        {
          positionKey: 'windshield',
          productId: '23684bbd-b6e0-401a-9ba4-97e1b98176fd',
        },
      ],
    });

    expect(createWarrantyActivationRequestUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        customerBirthdate: '2005-12-11',
        customerEmail: dto.customerEmail,
        customerName: dto.customerName,
        customerPhone: dto.customerPhone,
      }),
      expect.objectContaining({
        customerProfile: {
          id: dto.customerId,
          birthdate: undefined,
        },
      }),
    );
  });

  it('keeps a submitted birthdate in the request snapshot by default', async () => {
    createWarrantyActivationRequestUseCase.execute.mockResolvedValue({
      id: 'request-id',
    });
    const useCase = new CreateAdminWarrantyActivationRequestUseCase(
      productsRepository as never,
      generateWarrantyCodeUseCase as never,
      createWarrantyActivationRequestUseCase as never,
      customersRepository as never,
    );

    await useCase.execute({
      ...dto,
      categoryId: 'fd47a803-b240-4935-aab4-554d44fce684',
      customerBirthdate: '2001-01-02',
      items: [
        {
          positionKey: 'windshield',
          productId: '23684bbd-b6e0-401a-9ba4-97e1b98176fd',
        },
      ],
    });

    expect(createWarrantyActivationRequestUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({ customerBirthdate: '2001-01-02' }),
      expect.objectContaining({
        customerProfile: {
          id: dto.customerId,
          update: undefined,
        },
      }),
    );
  });

  it('preserves submitted customer snapshot fields while editing', async () => {
    createWarrantyActivationRequestUseCase.execute.mockResolvedValue({
      id: 'request-id',
    });
    const useCase = new CreateAdminWarrantyActivationRequestUseCase(
      productsRepository as never,
      generateWarrantyCodeUseCase as never,
      createWarrantyActivationRequestUseCase as never,
      customersRepository as never,
    );

    await useCase.execute(
      {
        ...dto,
        categoryId: 'fd47a803-b240-4935-aab4-554d44fce684',
        customerBirthdate: '1990-01-01',
        items: [
          {
            positionKey: 'windshield',
            productId: '23684bbd-b6e0-401a-9ba4-97e1b98176fd',
          },
        ],
      },
      {
        updateRequest: {
          id: 'request-id',
          items: [],
          requestCode: 'WAR-20260909-0001',
          warrantyCode: 'WM-EXISTING',
        },
      },
    );

    expect(createWarrantyActivationRequestUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        customerBirthdate: '1990-01-01',
        customerEmail: dto.customerEmail,
        customerName: dto.customerName,
        customerPhone: dto.customerPhone,
      }),
      expect.objectContaining({
        customerProfile: {
          id: dto.customerId,
          update: undefined,
        },
      }),
    );
  });

  it('passes a complete Customer update to the atomic request transaction when explicitly selected', async () => {
    createWarrantyActivationRequestUseCase.execute.mockResolvedValue({
      id: 'request-id',
    });
    const useCase = new CreateAdminWarrantyActivationRequestUseCase(
      productsRepository as never,
      generateWarrantyCodeUseCase as never,
      createWarrantyActivationRequestUseCase as never,
      customersRepository as never,
      permissionService as never,
    );

    await useCase.execute(
      {
        ...dto,
        categoryId: 'fd47a803-b240-4935-aab4-554d44fce684',
        customerBirthdate: '1990-01-01',
        items: [
          {
            positionKey: 'windshield',
            productId: '23684bbd-b6e0-401a-9ba4-97e1b98176fd',
          },
        ],
        updateCustomerProfile: true,
      },
      {
        actor: { id: 'moderator-id', role: 'MODERATOR' },
        updateRequest: {
          id: 'request-id',
          items: [],
          requestCode: 'WAR-20260909-0001',
          warrantyCode: 'WM-EXISTING',
        },
      },
    );

    expect(permissionService.hasPermission).toHaveBeenCalledWith(
      'moderator-id',
      'MODERATOR',
      'CUSTOMER_UPDATE',
    );
    expect(createWarrantyActivationRequestUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({ customerBirthdate: '1990-01-01' }),
      expect.objectContaining({
        customerProfile: {
          id: dto.customerId,
          update: {
            address: '1 Nguyen Trai, Phuong Ben Thanh, TP Ho Chi Minh',
            birthdate: new Date('1990-01-01T00:00:00.000Z'),
            email: dto.customerEmail,
            fullName: dto.customerName,
            phone: dto.customerPhone,
          },
        },
      }),
    );
  });

  it('rejects a Customer profile update without CUSTOMER_UPDATE permission', async () => {
    permissionService.hasPermission.mockResolvedValue(false);
    const useCase = new CreateAdminWarrantyActivationRequestUseCase(
      productsRepository as never,
      generateWarrantyCodeUseCase as never,
      createWarrantyActivationRequestUseCase as never,
      customersRepository as never,
      permissionService as never,
    );

    await expect(
      useCase.execute(
        { ...dto, updateCustomerProfile: true },
        { actor: { id: 'moderator-id', role: 'MODERATOR' } },
      ),
    ).rejects.toBeInstanceOf(ForbiddenError);
    expect(
      createWarrantyActivationRequestUseCase.execute,
    ).not.toHaveBeenCalled();
  });

  it('generates and synchronizes a missing warranty code before creating the request', async () => {
    productsRepository.findActivationRequestTargetById.mockResolvedValue({
      id: dto.productId,
      display_name: null,
      status: product_status.ACTIVE,
      product_code: 'BO-PIN-001',
      slug: 'bo-pin-chinh-hang',
      brand: 'Toyota',
      model_year: 2026,
      model: 'Battery Plus',
      warranty: {
        id: 'warranty-id',
        serial_number: 'SN-001',
        status: warranty_status.DRAFT,
        warranty_code: null,
      },
    });
    generateWarrantyCodeUseCase.execute.mockResolvedValue('WM-2026-ABC123');
    createWarrantyActivationRequestUseCase.execute.mockResolvedValue({
      id: 'request-id',
    });
    const useCase = new CreateAdminWarrantyActivationRequestUseCase(
      productsRepository as never,
      generateWarrantyCodeUseCase as never,
      createWarrantyActivationRequestUseCase as never,
      customersRepository as never,
    );

    const result = await useCase.execute(dto);

    expect(productsRepository.synchronizeWarrantyCode).toHaveBeenCalledWith({
      warrantyCode: 'WM-2026-ABC123',
      warrantyId: 'warranty-id',
    });
    expect(createWarrantyActivationRequestUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        brand: 'Toyota',
        productName: 'BO-PIN-001',
        warrantyCode: 'WM-2026-ABC123',
      }),
      expect.objectContaining({ source: 'ADMIN_PORTAL' }),
    );
    expect(result).toEqual({ id: 'request-id' });
  });

  it('reuses an existing warranty code without synchronizing it', async () => {
    productsRepository.findActivationRequestTargetById.mockResolvedValue({
      id: dto.productId,
      display_name: null,
      status: product_status.ACTIVE,
      product_code: 'BO-PIN-001',
      slug: 'bo-pin-chinh-hang',
      brand: null,
      model_year: null,
      model: null,
      warranty: {
        id: 'warranty-id',
        status: warranty_status.DRAFT,
        warranty_code: 'WM-2026-EXISTING',
      },
    });
    createWarrantyActivationRequestUseCase.execute.mockResolvedValue({
      id: 'request-id',
    });
    const useCase = new CreateAdminWarrantyActivationRequestUseCase(
      productsRepository as never,
      generateWarrantyCodeUseCase as never,
      createWarrantyActivationRequestUseCase as never,
      customersRepository as never,
    );

    await useCase.execute(dto);

    expect(generateWarrantyCodeUseCase.execute).not.toHaveBeenCalled();
    expect(productsRepository.synchronizeWarrantyCode).not.toHaveBeenCalled();
    expect(createWarrantyActivationRequestUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({ warrantyCode: 'WM-2026-EXISTING' }),
      expect.objectContaining({ source: 'ADMIN_PORTAL' }),
    );
  });

  it('delegates a code-less catalogue product without requiring a draft warranty', async () => {
    productsRepository.findActivationRequestTargetById.mockResolvedValue({
      id: dto.productId,
      category_ref: { activation_code_enabled: false },
      display_name: 'Film cách nhiệt SP50',
      status: product_status.ACTIVE,
      product_code: 'FILM-SP50',
      slug: 'film-sp50',
      brand: 'Lexzenz',
      model_year: null,
      model: 'SP50',
      warranty: {
        id: 'previous-warranty-id',
        status: warranty_status.ACTIVE,
        warranty_code: 'WM-PREVIOUS',
      },
    });
    createWarrantyActivationRequestUseCase.execute.mockResolvedValue({
      id: 'request-id',
    });
    const useCase = new CreateAdminWarrantyActivationRequestUseCase(
      productsRepository as never,
      generateWarrantyCodeUseCase as never,
      createWarrantyActivationRequestUseCase as never,
      customersRepository as never,
    );

    await useCase.execute(dto);

    expect(generateWarrantyCodeUseCase.execute).not.toHaveBeenCalled();
    expect(productsRepository.synchronizeWarrantyCode).not.toHaveBeenCalled();
    expect(createWarrantyActivationRequestUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        productId: dto.productId,
        productName: 'Film cách nhiệt SP50',
      }),
      expect.objectContaining({ source: 'ADMIN_PORTAL' }),
    );
  });

  it('rejects products whose warranty is not draft', async () => {
    productsRepository.findActivationRequestTargetById.mockResolvedValue({
      id: dto.productId,
      display_name: null,
      status: product_status.ACTIVE,
      product_code: 'BO-PIN-001',
      slug: 'bo-pin-chinh-hang',
      brand: null,
      model_year: null,
      model: null,
      warranty: {
        id: 'warranty-id',
        status: warranty_status.ACTIVE,
        warranty_code: 'WM-2026-ACTIVE1',
      },
    });
    const useCase = new CreateAdminWarrantyActivationRequestUseCase(
      productsRepository as never,
      generateWarrantyCodeUseCase as never,
      createWarrantyActivationRequestUseCase as never,
      customersRepository as never,
    );

    await expect(useCase.execute(dto)).rejects.toBeInstanceOf(BadRequestError);
    expect(
      createWarrantyActivationRequestUseCase.execute,
    ).not.toHaveBeenCalled();
  });

  it('delegates a multi-product payload without collapsing it to one product', async () => {
    createWarrantyActivationRequestUseCase.execute.mockResolvedValue({
      id: 'request-id',
      itemCount: 2,
    });
    const useCase = new CreateAdminWarrantyActivationRequestUseCase(
      productsRepository as never,
      generateWarrantyCodeUseCase as never,
      createWarrantyActivationRequestUseCase as never,
      customersRepository as never,
    );
    const multiProductDto = {
      ...dto,
      categoryId: 'fd47a803-b240-4935-aab4-554d44fce684',
      items: [
        {
          positionKey: 'windshield',
          productId: '23684bbd-b6e0-401a-9ba4-97e1b98176fd',
        },
        {
          positionKey: 'rearGlass',
          productId: '8d51964e-a369-4815-a844-cfe03981732d',
        },
      ],
    };

    await useCase.execute(multiProductDto);

    expect(
      productsRepository.findActivationRequestTargetById,
    ).not.toHaveBeenCalled();
    expect(createWarrantyActivationRequestUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({ items: multiProductDto.items }),
      expect.objectContaining({ source: 'ADMIN_PORTAL' }),
    );
  });
});
