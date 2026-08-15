import { BadRequestError, NotFoundError } from '@/common/response';
import { CreateWarrantyActivationRequestUseCase } from '@/modules/warranty-activation-requests/use-cases/create-warranty-activation-request.use-case';
import { GenerateWarrantyActivationRequestCodeUseCase } from '@/modules/warranty-activation-requests/use-cases/generate-warranty-activation-request-code.use-case';
import { ReviewWarrantyActivationRequestUseCase } from '@/modules/warranty-activation-requests/use-cases/review-warranty-activation-request.use-case';
import { ResendWarrantyActivationRequestCertificateEmailUseCase } from '@/modules/warranty-activation-requests/use-cases/resend-warranty-activation-request-certificate-email.use-case';
import {
  Prisma,
  warranty_activation_request_status,
  warranty_status,
} from '@prisma/client';

describe('WarrantyActivationRequestsUseCases', () => {
  const repository = {
    activateApprovedRequest: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    findLastRequestCode: jest.fn(),
    findOpenByProductId: jest.fn(),
    review: jest.fn(),
  };
  const productsRepository = {
    findActivationRequestTargetById: jest.fn(),
    findActivationRequestTargetByWarrantyCode: jest.fn(),
    synchronizeWarrantyCode: jest.fn(),
  };
  const dealersRepository = {
    create: jest.fn(),
    findActiveById: jest.fn(),
    findByPhone: jest.fn(),
  };
  const generateWarrantyCodeUseCase = {
    execute: jest.fn(),
  };
  const warrantyActivationRequestNotificationService = {
    requestCreated: jest.fn(),
  };
  const issueWarrantyCertificatesForRequestUseCase = {
    execute: jest.fn(),
  };

  beforeEach(() => {
    jest.resetAllMocks();
    generateWarrantyCodeUseCase.execute.mockResolvedValue('WM-2026-GENERATED');
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-07-19T03:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('generates a sequential request code for the current day', async () => {
    repository.findLastRequestCode.mockResolvedValue({
      request_code: 'WAR-20260719-0007',
    });
    const useCase = new GenerateWarrantyActivationRequestCodeUseCase(
      repository as never,
    );

    const result = await useCase.execute(new Date('2026-07-19T03:00:00.000Z'));

    expect(repository.findLastRequestCode).toHaveBeenCalledWith(
      'WAR-20260719-',
    );
    expect(result).toBe('WAR-20260719-0008');
  });

  it('creates a pending activation request from public client input', async () => {
    repository.findOpenByProductId.mockResolvedValue(null);
    repository.findLastRequestCode.mockResolvedValue(null);
    productsRepository.findActivationRequestTargetByWarrantyCode.mockResolvedValue(
      baseDraftProduct,
    );
    repository.create.mockResolvedValue({
      ...baseRequest,
      request_code: 'WAR-20260719-0001',
      warranty_code: 'WM-2026-ABC123',
      full_address: '1 Nguyen Trai, Phuong Ben Thanh, TP Ho Chi Minh',
    });
    const generateCodeUseCase =
      new GenerateWarrantyActivationRequestCodeUseCase(repository as never);
    const useCase = new CreateWarrantyActivationRequestUseCase(
      repository as never,
      generateCodeUseCase,
      productsRepository as never,
      dealersRepository as never,
      generateWarrantyCodeUseCase as never,
      warrantyActivationRequestNotificationService as never,
    );

    const result = await useCase.execute({
      addressDetail: '1 Nguyen Trai',
      customerEmail: 'CUSTOMER@EXAMPLE.COM',
      customerName: 'Nguyen Van A',
      customerPhone: '0901234567',
      provinceCode: '79',
      provinceName: 'TP Ho Chi Minh',
      wardCode: '26734',
      wardName: 'Phuong Ben Thanh',
      warrantyCode: 'wm-2026-abc123',
    });

    expect(
      productsRepository.findActivationRequestTargetByWarrantyCode,
    ).toHaveBeenCalledWith('WM-2026-ABC123');
    expect(repository.findOpenByProductId).toHaveBeenCalledWith('product-id');
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        customer_email: 'customer@example.com',
        full_address: '1 Nguyen Trai, Phuong Ben Thanh, TP Ho Chi Minh',
        request_code: 'WAR-20260719-0001',
        warranty_code: 'WM-2026-ABC123',
        items: {
          create: [
            expect.objectContaining({
              position_key: 'primaryProduct',
              product_id: 'product-id',
              warranty_id: 'warranty-id',
            }),
          ],
        },
      }),
    );
    expect(result.requestCode).toBe('WAR-20260719-0001');
  });

  it('creates one parent with multiple validated activation items', async () => {
    repository.findLastRequestCode.mockResolvedValue(null);
    repository.findOpenByProductId.mockResolvedValue(null);
    productsRepository.findActivationRequestTargetById.mockResolvedValue({
      ...baseDraftProduct,
      id: 'product-a',
      product_code: 'CODE-product-a',
      warranty: {
        ...baseDraftProduct.warranty,
        id: 'warranty-product-a',
        warranty_code: 'WM-product-a',
      },
    });
    const itemValidator = {
      validate: jest
        .fn()
        .mockResolvedValue([
          createValidatedItem('windshield', 'product-a'),
          createValidatedItem('rearGlass', 'product-b'),
        ]),
    };
    repository.create.mockImplementation((data) =>
      Promise.resolve({
        ...baseRequest,
        request_code: data.request_code,
        warranty_code: 'WM-product-a',
        product_id: 'product-a',
        category_id: 'category-id',
        product_name: 'Product product-a',
        serial_number: 'SERIAL-product-a',
        items: [
          createPersistedItem('windshield', 'product-a'),
          createPersistedItem('rearGlass', 'product-b'),
        ],
      }),
    );
    const generateCodeUseCase =
      new GenerateWarrantyActivationRequestCodeUseCase(repository as never);
    const useCase = new CreateWarrantyActivationRequestUseCase(
      repository as never,
      generateCodeUseCase,
      productsRepository as never,
      dealersRepository as never,
      generateWarrantyCodeUseCase as never,
      warrantyActivationRequestNotificationService as never,
      itemValidator as never,
    );
    const items = [
      { positionKey: 'windshield', productId: 'product-a' },
      { positionKey: 'rearGlass', productId: 'product-b' },
    ];

    const result = await useCase.execute({
      addressDetail: '1 Nguyen Trai',
      categoryId: 'category-id',
      customerName: 'Nguyen Van A',
      customerPhone: '0901234567',
      items,
      provinceCode: '79',
      provinceName: 'TP Ho Chi Minh',
      productName: 'Client supplied name',
      wardCode: '26734',
      wardName: 'Phuong Ben Thanh',
    });

    expect(itemValidator.validate).toHaveBeenCalledWith('category-id', items);
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        product: { connect: { id: 'product-a' } },
        product_name: 'Product product-a',
        warranty_code: 'WM-product-a',
        items: {
          create: [
            expect.objectContaining({
              position_key: 'windshield',
              product_id: 'product-a',
            }),
            expect.objectContaining({
              position_key: 'rearGlass',
              product_id: 'product-b',
            }),
          ],
        },
      }),
    );
    expect(result.itemCount).toBe(2);
    expect(result.items).toEqual([
      expect.objectContaining({
        positionKey: 'windshield',
        productId: 'product-a',
      }),
      expect.objectContaining({
        positionKey: 'rearGlass',
        productId: 'product-b',
      }),
    ]);
  });

  it('publishes an admin notification when a public activation request is created', async () => {
    const notificationService = {
      requestCreated: jest.fn(),
    };
    repository.findOpenByProductId.mockResolvedValue(null);
    repository.findLastRequestCode.mockResolvedValue(null);
    productsRepository.findActivationRequestTargetByWarrantyCode.mockResolvedValue(
      baseDraftProduct,
    );
    repository.create.mockResolvedValue({
      ...baseRequest,
      request_code: 'WAR-20260719-0001',
      warranty_code: 'WM-2026-ABC123',
    });
    const generateCodeUseCase =
      new GenerateWarrantyActivationRequestCodeUseCase(repository as never);
    const useCase = new CreateWarrantyActivationRequestUseCase(
      repository as never,
      generateCodeUseCase,
      productsRepository as never,
      dealersRepository as never,
      generateWarrantyCodeUseCase as never,
      notificationService as never,
    );

    await useCase.execute({
      addressDetail: '1 Nguyen Trai',
      customerEmail: 'CUSTOMER@EXAMPLE.COM',
      customerName: 'Nguyen Van A',
      customerPhone: '0901234567',
      provinceCode: '79',
      provinceName: 'TP Ho Chi Minh',
      wardCode: '26734',
      wardName: 'Phuong Ben Thanh',
      warrantyCode: 'wm-2026-abc123',
    });

    expect(notificationService.requestCreated).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'request-id',
        request_code: 'WAR-20260719-0001',
        warranty_code: 'WM-2026-ABC123',
        status: warranty_activation_request_status.PENDING,
      }),
    );
  });

  it('creates and connects a quick dealer when dealer fields are provided', async () => {
    repository.findOpenByProductId.mockResolvedValue(null);
    repository.findLastRequestCode.mockResolvedValue(null);
    productsRepository.findActivationRequestTargetByWarrantyCode.mockResolvedValue(
      baseDraftProduct,
    );
    dealersRepository.findByPhone.mockResolvedValue(null);
    dealersRepository.create.mockResolvedValue({
      address: '12 Nguyen Trai',
      district: 'Phuong Thanh Xuan',
      id: 'dealer-id',
      is_active: true,
      latitude: 21.0285,
      longitude: 105.8542,
      name: 'Lexzenz Ha Noi',
      phone: '0901234567',
      province: 'Thanh pho Ha Noi',
      sales_name: 'Nguyen Van Sale',
    });
    repository.create.mockResolvedValue({
      ...baseRequest,
      dealer_id: 'dealer-id',
      request_code: 'WAR-20260719-0001',
    });
    const generateCodeUseCase =
      new GenerateWarrantyActivationRequestCodeUseCase(repository as never);
    const useCase = new CreateWarrantyActivationRequestUseCase(
      repository as never,
      generateCodeUseCase,
      productsRepository as never,
      dealersRepository as never,
      generateWarrantyCodeUseCase as never,
      warrantyActivationRequestNotificationService as never,
    );

    await useCase.execute({
      addressDetail: '1 Nguyen Trai',
      customerName: 'Nguyen Van A',
      customerPhone: '0901234567',
      dealerAddress: '12 Nguyen Trai',
      dealerDistrict: 'Phuong Thanh Xuan',
      dealerName: 'Lexzenz Ha Noi',
      dealerPhone: '0901234567',
      dealerProvince: 'Thanh pho Ha Noi',
      dealerLatitude: 21.0285,
      dealerLongitude: 105.8542,
      provinceCode: '79',
      provinceName: 'TP Ho Chi Minh',
      salesName: 'Nguyen Van Sale',
      wardCode: '26734',
      wardName: 'Phuong Ben Thanh',
      warrantyCode: 'WM-2026-ABC123',
    });

    expect(dealersRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        address: '12 Nguyen Trai',
        district: 'Phuong Thanh Xuan',
        is_active: true,
        name: 'Lexzenz Ha Noi',
        phone: '0901234567',
        province: 'Thanh pho Ha Noi',
        latitude: 21.0285,
        longitude: 105.8542,
        sales_name: 'Nguyen Van Sale',
      }),
    );
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        dealer: { connect: { id: 'dealer-id' } },
      }),
    );
  });

  it('rejects product selection when it does not match the selected category', async () => {
    productsRepository.findActivationRequestTargetByWarrantyCode.mockResolvedValue(
      baseDraftProduct,
    );
    const generateCodeUseCase =
      new GenerateWarrantyActivationRequestCodeUseCase(repository as never);
    const useCase = new CreateWarrantyActivationRequestUseCase(
      repository as never,
      generateCodeUseCase,
      productsRepository as never,
      dealersRepository as never,
      generateWarrantyCodeUseCase as never,
      warrantyActivationRequestNotificationService as never,
    );

    await expect(
      useCase.execute({
        addressDetail: '1 Nguyen Trai',
        categoryId: 'other-category-id',
        customerName: 'Nguyen Van A',
        customerPhone: '0901234567',
        provinceCode: '79',
        provinceName: 'TP Ho Chi Minh',
        wardCode: '26734',
        wardName: 'Phuong Ben Thanh',
        warrantyCode: 'WM-2026-ABC123',
      }),
    ).rejects.toMatchObject({
      details: expect.objectContaining({
        code: 'PRODUCT_CATEGORY_MISMATCH',
      }),
    });
  });

  it('rejects a second pending request for the same product even when the phone changes', async () => {
    repository.findOpenByProductId.mockResolvedValue({
      id: 'existing-request-id',
      request_code: 'WAR-20260727-0001',
      status: warranty_activation_request_status.PENDING,
    });
    productsRepository.findActivationRequestTargetByWarrantyCode.mockResolvedValue(
      baseDraftProduct,
    );
    const generateCodeUseCase =
      new GenerateWarrantyActivationRequestCodeUseCase(repository as never);
    const useCase = new CreateWarrantyActivationRequestUseCase(
      repository as never,
      generateCodeUseCase,
      productsRepository as never,
      dealersRepository as never,
      generateWarrantyCodeUseCase as never,
      warrantyActivationRequestNotificationService as never,
    );

    await expect(
      useCase.execute({
        addressDetail: '1 Nguyen Trai',
        customerEmail: 'customer@example.com',
        customerName: 'Nguyen Van A',
        customerPhone: '0988888888',
        provinceCode: '79',
        provinceName: 'TP Ho Chi Minh',
        wardCode: '26734',
        wardName: 'Phuong Ben Thanh',
        warrantyCode: 'WM-2026-ABC123',
      }),
    ).rejects.toMatchObject({
      details: {
        code: 'ACTIVATION_REQUEST_ALREADY_OPEN',
        currentStatus: warranty_activation_request_status.PENDING,
        productId: 'product-id',
        requestCode: 'WAR-20260727-0001',
      },
    });

    expect(repository.findOpenByProductId).toHaveBeenCalledWith('product-id');
    expect(dealersRepository.create).not.toHaveBeenCalled();
    expect(repository.create).not.toHaveBeenCalled();
    expect(
      warrantyActivationRequestNotificationService.requestCreated,
    ).not.toHaveBeenCalled();
  });

  it('rejects a second request while the existing request is approved', async () => {
    repository.findOpenByProductId.mockResolvedValue({
      id: 'existing-request-id',
      request_code: 'WAR-20260727-0001',
      status: warranty_activation_request_status.APPROVED,
    });
    productsRepository.findActivationRequestTargetByWarrantyCode.mockResolvedValue(
      baseDraftProduct,
    );
    const generateCodeUseCase =
      new GenerateWarrantyActivationRequestCodeUseCase(repository as never);
    const useCase = new CreateWarrantyActivationRequestUseCase(
      repository as never,
      generateCodeUseCase,
      productsRepository as never,
      dealersRepository as never,
      generateWarrantyCodeUseCase as never,
      warrantyActivationRequestNotificationService as never,
    );

    await expect(
      useCase.execute({
        addressDetail: '1 Nguyen Trai',
        customerEmail: 'customer@example.com',
        customerName: 'Nguyen Van A',
        customerPhone: '0901234567',
        provinceCode: '79',
        provinceName: 'TP Ho Chi Minh',
        wardCode: '26734',
        wardName: 'Phuong Ben Thanh',
        warrantyCode: 'WM-2026-ABC123',
      }),
    ).rejects.toMatchObject({
      details: {
        code: 'ACTIVATION_REQUEST_ALREADY_OPEN',
        currentStatus: warranty_activation_request_status.APPROVED,
        productId: 'product-id',
        requestCode: 'WAR-20260727-0001',
      },
    });
  });

  it('retries when generated request code collides', async () => {
    repository.findOpenByProductId.mockResolvedValue(null);
    repository.findLastRequestCode.mockResolvedValue(null);
    productsRepository.findActivationRequestTargetByWarrantyCode.mockResolvedValue(
      baseDraftProduct,
    );
    repository.create
      .mockRejectedValueOnce(
        new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
          clientVersion: 'test',
          code: 'P2002',
          meta: { target: ['request_code'] },
        }),
      )
      .mockResolvedValueOnce({
        ...baseRequest,
        request_code: 'WAR-20260719-0001',
      });
    const generateCodeUseCase =
      new GenerateWarrantyActivationRequestCodeUseCase(repository as never);
    const useCase = new CreateWarrantyActivationRequestUseCase(
      repository as never,
      generateCodeUseCase,
      productsRepository as never,
      dealersRepository as never,
      generateWarrantyCodeUseCase as never,
      warrantyActivationRequestNotificationService as never,
    );

    const result = await useCase.execute({
      addressDetail: '1 Nguyen Trai',
      customerEmail: 'customer@example.com',
      customerName: 'Nguyen Van A',
      customerPhone: '0901234567',
      provinceCode: '79',
      provinceName: 'TP Ho Chi Minh',
      wardCode: '26734',
      wardName: 'Phuong Ben Thanh',
      warrantyCode: 'WM-2026-ABC123',
    });

    expect(repository.create).toHaveBeenCalledTimes(2);
    expect(result.requestCode).toBe('WAR-20260719-0001');
  });

  it('maps a concurrent open-request conflict to the product-scoped domain error', async () => {
    repository.findOpenByProductId
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        id: 'winning-request-id',
        request_code: 'WAR-20260727-0002',
        status: warranty_activation_request_status.PENDING,
      });
    repository.findLastRequestCode.mockResolvedValue(null);
    productsRepository.findActivationRequestTargetByWarrantyCode.mockResolvedValue(
      baseDraftProduct,
    );
    repository.create.mockRejectedValueOnce(
      new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        clientVersion: 'test',
        code: 'P2002',
        meta: {
          target: ['warranty_activation_request_one_open_per_product'],
        },
      }),
    );
    const generateCodeUseCase =
      new GenerateWarrantyActivationRequestCodeUseCase(repository as never);
    const useCase = new CreateWarrantyActivationRequestUseCase(
      repository as never,
      generateCodeUseCase,
      productsRepository as never,
      dealersRepository as never,
      generateWarrantyCodeUseCase as never,
      warrantyActivationRequestNotificationService as never,
    );

    await expect(
      useCase.execute({
        addressDetail: '1 Nguyen Trai',
        customerEmail: 'customer@example.com',
        customerName: 'Nguyen Van A',
        customerPhone: '0901234567',
        provinceCode: '79',
        provinceName: 'TP Ho Chi Minh',
        wardCode: '26734',
        wardName: 'Phuong Ben Thanh',
        warrantyCode: 'WM-2026-ABC123',
      }),
    ).rejects.toMatchObject({
      details: {
        code: 'ACTIVATION_REQUEST_ALREADY_OPEN',
        currentStatus: warranty_activation_request_status.PENDING,
        productId: 'product-id',
        requestCode: 'WAR-20260727-0002',
      },
    });

    expect(repository.findOpenByProductId).toHaveBeenCalledTimes(2);
    expect(
      warrantyActivationRequestNotificationService.requestCreated,
    ).not.toHaveBeenCalled();
  });

  it('rethrows a unique conflict when no open request exists for the product', async () => {
    const uniqueConflict = new Prisma.PrismaClientKnownRequestError(
      'Unique constraint failed',
      {
        clientVersion: 'test',
        code: 'P2002',
        meta: { target: ['another_unique_index'] },
      },
    );
    repository.findOpenByProductId.mockResolvedValue(null);
    repository.findLastRequestCode.mockResolvedValue(null);
    productsRepository.findActivationRequestTargetByWarrantyCode.mockResolvedValue(
      baseDraftProduct,
    );
    repository.create.mockRejectedValueOnce(uniqueConflict);
    const generateCodeUseCase =
      new GenerateWarrantyActivationRequestCodeUseCase(repository as never);
    const useCase = new CreateWarrantyActivationRequestUseCase(
      repository as never,
      generateCodeUseCase,
      productsRepository as never,
      dealersRepository as never,
      generateWarrantyCodeUseCase as never,
      warrantyActivationRequestNotificationService as never,
    );

    await expect(
      useCase.execute({
        addressDetail: '1 Nguyen Trai',
        customerEmail: 'customer@example.com',
        customerName: 'Nguyen Van A',
        customerPhone: '0901234567',
        provinceCode: '79',
        provinceName: 'TP Ho Chi Minh',
        wardCode: '26734',
        wardName: 'Phuong Ben Thanh',
        warrantyCode: 'WM-2026-ABC123',
      }),
    ).rejects.toBe(uniqueConflict);

    expect(repository.findOpenByProductId).toHaveBeenCalledTimes(2);
  });

  it('rejects activation requests when the warranty code does not exist', async () => {
    productsRepository.findActivationRequestTargetByWarrantyCode.mockResolvedValue(
      null,
    );
    const generateCodeUseCase =
      new GenerateWarrantyActivationRequestCodeUseCase(repository as never);
    const useCase = new CreateWarrantyActivationRequestUseCase(
      repository as never,
      generateCodeUseCase,
      productsRepository as never,
      dealersRepository as never,
      generateWarrantyCodeUseCase as never,
      warrantyActivationRequestNotificationService as never,
    );

    await expect(
      useCase.execute({
        addressDetail: '1 Nguyen Trai',
        customerEmail: 'customer@example.com',
        customerName: 'Nguyen Van A',
        customerPhone: '0901234567',
        provinceCode: '79',
        provinceName: 'TP Ho Chi Minh',
        wardCode: '26734',
        wardName: 'Phuong Ben Thanh',
        warrantyCode: 'WM-2026-MISSING',
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('rejects activation requests for warranties that are not draft', async () => {
    productsRepository.findActivationRequestTargetByWarrantyCode.mockResolvedValue(
      {
        ...baseDraftProduct,
        warranty: {
          id: 'warranty-id',
          status: warranty_status.ACTIVE,
        },
      },
    );
    const generateCodeUseCase =
      new GenerateWarrantyActivationRequestCodeUseCase(repository as never);
    const useCase = new CreateWarrantyActivationRequestUseCase(
      repository as never,
      generateCodeUseCase,
      productsRepository as never,
      dealersRepository as never,
      generateWarrantyCodeUseCase as never,
      warrantyActivationRequestNotificationService as never,
    );

    await expect(
      useCase.execute({
        addressDetail: '1 Nguyen Trai',
        customerEmail: 'customer@example.com',
        customerName: 'Nguyen Van A',
        customerPhone: '0901234567',
        provinceCode: '79',
        provinceName: 'TP Ho Chi Minh',
        wardCode: '26734',
        wardName: 'Phuong Ben Thanh',
        warrantyCode: 'WM-2026-ABC123',
      }),
    ).rejects.toBeInstanceOf(BadRequestError);
  });

  it('rejects activation requests when customer information does not match the current owner', async () => {
    productsRepository.findActivationRequestTargetByWarrantyCode.mockResolvedValue(
      baseDraftProduct,
    );
    const generateCodeUseCase =
      new GenerateWarrantyActivationRequestCodeUseCase(repository as never);
    const useCase = new CreateWarrantyActivationRequestUseCase(
      repository as never,
      generateCodeUseCase,
      productsRepository as never,
      dealersRepository as never,
      generateWarrantyCodeUseCase as never,
      warrantyActivationRequestNotificationService as never,
    );

    await expect(
      useCase.execute({
        addressDetail: '1 Nguyen Trai',
        customerEmail: 'other@example.com',
        customerName: 'Tran Van B',
        customerPhone: '0999999999',
        provinceCode: '79',
        provinceName: 'TP Ho Chi Minh',
        wardCode: '26734',
        wardName: 'Phuong Ben Thanh',
        warrantyCode: 'WM-2026-ABC123',
      }),
    ).rejects.toBeInstanceOf(BadRequestError);
  });

  it('activates warranty and owner when approving a pending activation request', async () => {
    const activatedRequest = {
      ...baseRequest,
      activated_warranty: {
        certificates: [],
        duration_months: 36,
        end_date: new Date('2029-07-19T04:00:00.000Z'),
        id: 'warranty-id',
        start_date: new Date('2026-07-19T04:00:00.000Z'),
        status: warranty_status.ACTIVE,
        warranty_code: 'WM-2026-ABC123',
      },
      activated_warranty_id: 'warranty-id',
      items: [
        {
          ...createPersistedItem('windshield', 'product-1'),
          activated_at: new Date('2026-07-19T04:00:00.000Z'),
          status: warranty_activation_request_status.ACTIVATED,
          warranty: {
            certificates: [
              {
                certificate_number: 'CERT-PRODUCT-1',
                email_status: 'QUEUED',
                emailed_at: new Date('2026-07-19T04:05:00.000Z'),
                generated_at: new Date('2026-07-19T04:04:00.000Z'),
                id: 'certificate-product-1',
                last_error: null,
                recipient_email: 'customer@example.com',
                status: 'GENERATED',
                storage_key: 'private/product-1.pdf',
              },
            ],
            status: warranty_status.ACTIVE,
          },
        },
        {
          ...createPersistedItem('rearGlass', 'product-2'),
          activated_at: new Date('2026-07-19T04:00:00.000Z'),
          status: warranty_activation_request_status.ACTIVATED,
          warranty: {
            certificates: [],
            status: warranty_status.ACTIVE,
          },
        },
      ],
      reviewed_at: new Date('2026-07-19T04:00:00.000Z'),
      reviewed_by: {
        email: 'admin@example.com',
        full_name: 'Warranty Admin',
        id: 'admin-id',
        username: 'warranty.admin',
      },
      reviewed_by_id: 'admin-id',
      status: warranty_activation_request_status.ACTIVATED,
    };
    repository.findById
      .mockResolvedValueOnce(baseRequest)
      .mockResolvedValueOnce(activatedRequest);
    repository.activateApprovedRequest.mockResolvedValue(activatedRequest);
    issueWarrantyCertificatesForRequestUseCase.execute.mockResolvedValue({
      certificateIds: ['certificate-id'],
      failures: [],
    });
    const useCase = new ReviewWarrantyActivationRequestUseCase(
      repository as never,
      issueWarrantyCertificatesForRequestUseCase as never,
    );

    const result = await useCase.execute(
      'request-id',
      {
        adminNote: 'Thong tin hop le',
        status: warranty_activation_request_status.APPROVED,
      },
      { reviewedByUserId: 'admin-id' },
    );

    expect(repository.activateApprovedRequest).toHaveBeenCalledWith({
      adminNote: 'Thong tin hop le',
      id: 'request-id',
      reviewedById: 'admin-id',
    });
    expect(repository.review).not.toHaveBeenCalled();
    expect(
      issueWarrantyCertificatesForRequestUseCase.execute,
    ).toHaveBeenCalledWith({
      recipientEmail: 'customer@example.com',
      requestId: 'request-id',
      warrantyIds: ['warranty-product-1', 'warranty-product-2'],
    });
    expect(result.activatedWarrantyId).toBe('warranty-id');
    expect(result.activatedWarranty).toEqual({
      durationMonths: 36,
      endDate: '2029-07-19T04:00:00.000Z',
      id: 'warranty-id',
      startDate: '2026-07-19T04:00:00.000Z',
      status: warranty_status.ACTIVE,
      warrantyCode: 'WM-2026-ABC123',
    });
    expect(result.reviewedBy).toEqual({
      displayName: 'Warranty Admin',
      email: 'admin@example.com',
      id: 'admin-id',
      username: 'warranty.admin',
    });
    expect(result.status).toBe('ACTIVATED');
    expect(result.items?.[0]?.certificate).toEqual(
      expect.objectContaining({
        downloadUrl:
          '/warranty-activation-requests/request-id/items/windshield-item-id/certificate/download',
        viewUrl:
          '/warranty-activation-requests/request-id/items/windshield-item-id/certificate/view',
      }),
    );
  });

  it('requires a rejection reason when rejecting a pending request', async () => {
    repository.findById.mockResolvedValue(baseRequest);
    const useCase = new ReviewWarrantyActivationRequestUseCase(
      repository as never,
      issueWarrantyCertificatesForRequestUseCase as never,
    );

    await expect(
      useCase.execute('request-id', {
        status: warranty_activation_request_status.REJECTED,
      }),
    ).rejects.toBeInstanceOf(BadRequestError);
  });

  it('throws not found when reviewing an absent request', async () => {
    repository.findById.mockResolvedValue(null);
    const useCase = new ReviewWarrantyActivationRequestUseCase(
      repository as never,
      issueWarrantyCertificatesForRequestUseCase as never,
    );

    await expect(
      useCase.execute('missing-id', {
        status: warranty_activation_request_status.APPROVED,
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('resends the certificate belonging to a specific request item', async () => {
    const certificate = {
      certificate_number: 'CERT-ITEM-2',
      email_status: 'FAILED',
      emailed_at: null,
      generated_at: new Date('2026-07-19T04:00:00.000Z'),
      id: 'certificate-item-2',
      last_error: 'Email failed',
      recipient_email: 'customer@example.com',
      status: 'GENERATED',
      storage_key: 'private/item-2.pdf',
    };
    const request = {
      ...baseRequest,
      items: [
        createPersistedItem('windshield', 'product-1'),
        {
          ...createPersistedItem('rearGlass', 'product-2'),
          warranty: {
            certificates: [certificate],
            status: warranty_status.ACTIVE,
          },
        },
      ],
    };
    repository.findById.mockResolvedValue(request);
    const resendWarrantyCertificateEmailUseCase = {
      execute: jest.fn().mockResolvedValue(undefined),
    };
    const useCase = new ResendWarrantyActivationRequestCertificateEmailUseCase(
      repository as never,
      resendWarrantyCertificateEmailUseCase as never,
    );

    await useCase.execute('request-id', 'rearGlass-item-id');

    expect(resendWarrantyCertificateEmailUseCase.execute).toHaveBeenCalledWith(
      'certificate-item-2',
    );
  });
});

const baseRequest = {
  activated_warranty_id: null,
  address_detail: '1 Nguyen Trai',
  admin_note: null,
  brand: null,
  created_by_id: null,
  created_at: new Date('2026-07-19T03:00:00.000Z'),
  customer_id: null,
  customer_birthdate: null,
  customer_email: 'customer@example.com',
  customer_name: 'Nguyen Van A',
  customer_phone: '0901234567',
  full_address: '1 Nguyen Trai, Phuong Ben Thanh, TP Ho Chi Minh',
  id: 'request-id',
  manufacture_year: null,
  metadata: null,
  model: null,
  note: null,
  product_name: null,
  province_code: '79',
  province_name: 'TP Ho Chi Minh',
  rejection_reason: null,
  request_code: 'WAR-20260719-0001',
  reviewed_at: null,
  reviewed_by_id: null,
  serial_number: null,
  source: 'PUBLIC_WEB',
  status: warranty_activation_request_status.PENDING,
  updated_at: new Date('2026-07-19T03:00:00.000Z'),
  ward_code: '26734',
  ward_name: 'Phuong Ben Thanh',
  warranty_code: 'WM-2026-ABC123',
};

const baseDraftProduct = {
  category_id: 'category-id',
  id: 'product-id',
  display_name: null,
  product_code: 'CODE-product-id',
  template: {
    brand: 'Black Label',
    category_id: 'category-id',
    model: 'Premium',
    model_year: 2026,
    name: 'Black Label Films',
  },
  ownerships: [
    {
      customer: {
        email: 'customer@example.com',
        full_name: 'Nguyen Van A',
        phone: '0901234567',
      },
    },
  ],
  serial_number: 'SN-BLF-001',
  warranty: {
    duration_months: 24,
    id: 'warranty-id',
    status: warranty_status.DRAFT,
    warranty_code: 'WM-2026-ABC123',
  },
};

function createValidatedItem(positionKey: string, productId: string) {
  return {
    activationFieldId: `${positionKey}-field-id`,
    positionKey,
    positionLabel: positionKey,
    productId,
    productName: `Product ${productId}`,
    productCode: `CODE-${productId}`,
    serialNumber: `SERIAL-${productId}`,
    warrantyId: `warranty-${productId}`,
    warrantyCode: `WM-${productId}`,
    warrantyDurationMonths: 24,
    brand: 'Lexzenz',
    model: 'SP50',
    manufactureYear: 2026,
  };
}

function createPersistedItem(positionKey: string, productId: string) {
  return {
    id: `${positionKey}-item-id`,
    activation_field_id: `${positionKey}-field-id`,
    position_key: positionKey,
    position_label: positionKey,
    product_id: productId,
    product_name: `Product ${productId}`,
    product_code: `CODE-${productId}`,
    serial_number: `SERIAL-${productId}`,
    warranty_id: `warranty-${productId}`,
    warranty_code: `WM-${productId}`,
    status: warranty_activation_request_status.PENDING,
    activated_at: null,
    warranty: {
      status: warranty_status.DRAFT,
      certificates: [],
    },
  };
}
