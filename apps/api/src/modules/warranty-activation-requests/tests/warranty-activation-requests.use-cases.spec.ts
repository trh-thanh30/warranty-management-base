import { BadRequestError, NotFoundError } from '@/common/response';
import { toWarrantyActivationRequestResponse } from '@/modules/warranty-activation-requests/mappers/warranty-activation-request.mapper';
import { CreateWarrantyActivationRequestUseCase } from '@/modules/warranty-activation-requests/use-cases/create-warranty-activation-request.use-case';
import { GenerateWarrantyActivationRequestCodeUseCase } from '@/modules/warranty-activation-requests/use-cases/generate-warranty-activation-request-code.use-case';
import { ReviewWarrantyActivationRequestUseCase } from '@/modules/warranty-activation-requests/use-cases/review-warranty-activation-request.use-case';
import { ResendWarrantyActivationRequestCertificateEmailUseCase } from '@/modules/warranty-activation-requests/use-cases/resend-warranty-activation-request-certificate-email.use-case';
import {
  WarrantyActivationRequestCodeConflictError,
  WarrantyActivationRequestUniqueConflictError,
  WarrantyActivationRequestWarrantyCodeConflictError,
} from '@/modules/warranty-activation-requests/repository/warranty-activation-request-errors';
import {
  warranty_activation_request_source,
  warranty_activation_request_status,
  warranty_status,
} from '@prisma/client';

describe('WarrantyActivationRequestsUseCases', () => {
  const repository = {
    create: jest.fn(),
    findById: jest.fn(),
    findLastRequestCode: jest.fn(),
    findOpenByProductId: jest.fn(),
    review: jest.fn(),
    withReviewTransaction: jest.fn(),
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
  const issueWarrantyActivationRequestCertificateUseCase = {
    execute: jest.fn(),
  };
  const generateCustomerCodeUseCase = {
    generateCustomerCode: jest.fn().mockResolvedValue('CUS000001'),
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
        customerEmail: 'customer@example.com',
        fullAddress: '1 Nguyen Trai, Phuong Ben Thanh, TP Ho Chi Minh',
        requestCode: 'WAR-20260719-0001',
        warrantyCode: 'WM-2026-ABC123',
        items: [
          expect.objectContaining({
            positionKey: 'primaryProduct',
            productId: 'product-id',
            warrantyId: 'warranty-id',
          }),
        ],
      }),
    );
    expect(result.requestCode).toBe('WAR-20260719-0001');
  });

  it('creates an independent warranty request for a code-less catalogue product', async () => {
    repository.findOpenByProductId.mockResolvedValue({
      id: 'another-open-request',
    });
    repository.findLastRequestCode.mockResolvedValue(null);
    productsRepository.findActivationRequestTargetById.mockResolvedValue({
      ...baseDraftProduct,
      category_ref: { activation_code_enabled: false },
      warranty: {
        ...baseDraftProduct.warranty,
        status: warranty_status.ACTIVE,
        warranty_code: 'WM-PREVIOUS',
      },
      warranty_duration_months: 24,
    });
    repository.create.mockImplementation((command) =>
      Promise.resolve({
        ...baseRequest,
        product_id: command.productId,
        request_code: command.requestCode,
        warranty_code: command.warrantyCode,
        items: command.items.map((item, index) => ({
          ...createPersistedItem(item.positionKey, item.productId),
          id: `item-${index}`,
          serial_number: item.serialNumber,
          warranty_id: item.warrantyId,
          warranty_code: item.warrantyCode,
        })),
      }),
    );
    const useCase = new CreateWarrantyActivationRequestUseCase(
      repository as never,
      new GenerateWarrantyActivationRequestCodeUseCase(repository as never),
      productsRepository as never,
      dealersRepository as never,
      generateWarrantyCodeUseCase as never,
      warrantyActivationRequestNotificationService as never,
    );

    await useCase.execute({
      addressDetail: '1 Nguyen Trai',
      categoryId: 'category-id',
      customerName: 'Nguyen Van A',
      customerPhone: '0901234567',
      productId: 'product-id',
      provinceCode: '79',
      provinceName: 'TP Ho Chi Minh',
      wardCode: '26734',
      wardName: 'Phuong Ben Thanh',
    });

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        items: [
          expect.objectContaining({
            activationCodeId: null,
            productId: 'product-id',
            serialNumber: null,
            warrantyId: null,
            warrantyCode: 'WM-2026-GENERATED',
          }),
        ],
        warrantyCode: 'WM-2026-GENERATED',
      }),
    );
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
        request_code: data.requestCode,
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
        productId: 'product-a',
        productName: 'Product product-a',
        warrantyCode: 'WM-product-a',
        items: [
          expect.objectContaining({
            positionKey: 'windshield',
            productId: 'product-a',
          }),
          expect.objectContaining({
            positionKey: 'rearGlass',
            productId: 'product-b',
          }),
        ],
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

  it('reserves a warranty code for a validated item whose category does not use activation codes', async () => {
    repository.findLastRequestCode.mockResolvedValue(null);
    repository.findOpenByProductId.mockResolvedValue(null);
    productsRepository.findActivationRequestTargetById.mockResolvedValue({
      ...baseDraftProduct,
      id: 'product-a',
      product_code: 'CODE-product-a',
      warranty: null,
      warranty_duration_months: 24,
    });
    const itemValidator = {
      validate: jest.fn().mockResolvedValue([
        {
          ...createValidatedItem('windshield', 'product-a'),
          activationCodeId: null,
          warrantyCode: null,
          warrantyId: null,
        },
      ]),
    };
    repository.create.mockImplementation((data) =>
      Promise.resolve({
        ...baseRequest,
        request_code: data.requestCode,
        warranty_code: data.warrantyCode,
        product_id: 'product-a',
        category_id: 'category-id',
        product_name: 'Product product-a',
        serial_number: 'SERIAL-product-a',
        items: data.items,
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

    await useCase.execute({
      addressDetail: '1 Nguyen Trai',
      categoryId: 'category-id',
      customerName: 'Nguyen Van A',
      customerPhone: '0901234567',
      items: [{ positionKey: 'windshield', productId: 'product-a' }],
      provinceCode: '79',
      provinceName: 'TP Ho Chi Minh',
      wardCode: '26734',
      wardName: 'Phuong Ben Thanh',
    });

    expect(generateWarrantyCodeUseCase.execute).toHaveBeenCalled();
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        warrantyCode: 'WM-2026-GENERATED',
        items: [
          expect.objectContaining({
            activationCodeId: null,
            productId: 'product-a',
            warrantyCode: 'WM-2026-GENERATED',
            warrantyId: null,
          }),
        ],
      }),
    );
  });

  it('reserves a different warranty code for every generic activation item', async () => {
    repository.findLastRequestCode.mockResolvedValue(null);
    repository.findOpenByProductId.mockResolvedValue(null);
    productsRepository.findActivationRequestTargetById.mockResolvedValue({
      ...baseDraftProduct,
      id: 'product-a',
      product_code: 'CODE-product-a',
      warranty: {
        ...baseDraftProduct.warranty,
        status: warranty_status.ACTIVE,
      },
      warranty_duration_months: 24,
    });
    const genericItems = [
      {
        ...createValidatedItem('item-a', 'product-a'),
        activationCodeId: 'activation-code-a',
        warrantyCode: null,
        warrantyId: null,
      },
      {
        ...createValidatedItem('item-b', 'product-b'),
        activationCodeId: 'activation-code-b',
        warrantyCode: null,
        warrantyId: null,
      },
    ];
    const itemValidator = {
      validate: jest.fn().mockResolvedValue(genericItems),
    };
    generateWarrantyCodeUseCase.execute
      .mockResolvedValueOnce('WM-2026-CODEA1')
      .mockResolvedValueOnce('WM-2026-CODEB2');
    repository.create.mockImplementation((data) =>
      Promise.resolve({
        ...baseRequest,
        request_code: data.requestCode,
        warranty_code: data.warrantyCode,
        product_id: data.productId,
        items: data.items.map((item, index) => ({
          ...createPersistedItem(item.positionKey, item.productId),
          id: `item-${index}`,
          activation_code_id: item.activationCodeId,
          warranty_code: item.warrantyCode,
          warranty_id: null,
          warranty: null,
        })),
      }),
    );
    const useCase = new CreateWarrantyActivationRequestUseCase(
      repository as never,
      new GenerateWarrantyActivationRequestCodeUseCase(repository as never),
      productsRepository as never,
      dealersRepository as never,
      generateWarrantyCodeUseCase as never,
      warrantyActivationRequestNotificationService as never,
      itemValidator as never,
    );

    await useCase.execute({
      addressDetail: '1 Nguyen Trai',
      categoryId: 'category-id',
      customerName: 'Nguyen Van A',
      customerPhone: '0901234567',
      items: [
        {
          activationCodeId: 'activation-code-a',
          positionKey: 'item-a',
          productId: 'product-a',
        },
        {
          activationCodeId: 'activation-code-b',
          positionKey: 'item-b',
          productId: 'product-b',
        },
      ],
      provinceCode: '79',
      provinceName: 'TP Ho Chi Minh',
      wardCode: '26734',
      wardName: 'Phuong Ben Thanh',
    });

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        warrantyCode: 'WM-2026-CODEA1',
        items: [
          expect.objectContaining({ warrantyCode: 'WM-2026-CODEA1' }),
          expect.objectContaining({ warrantyCode: 'WM-2026-CODEB2' }),
        ],
      }),
    );
  });

  it('regenerates all reserved item codes when a concurrent reservation wins', async () => {
    repository.findLastRequestCode.mockResolvedValue(null);
    repository.findOpenByProductId.mockResolvedValue(null);
    productsRepository.findActivationRequestTargetById.mockResolvedValue({
      ...baseDraftProduct,
      id: 'product-a',
      product_code: 'CODE-product-a',
      warranty: null,
      warranty_duration_months: 24,
    });
    const itemValidator = {
      validate: jest.fn().mockResolvedValue([
        {
          ...createValidatedItem('item-a', 'product-a'),
          activationCodeId: 'activation-code-a',
          warrantyCode: null,
          warrantyId: null,
        },
        {
          ...createValidatedItem('item-b', 'product-b'),
          activationCodeId: 'activation-code-b',
          warrantyCode: null,
          warrantyId: null,
        },
      ]),
    };
    generateWarrantyCodeUseCase.execute
      .mockResolvedValueOnce('WM-2026-INITIAL1')
      .mockResolvedValueOnce('WM-2026-INITIAL2')
      .mockResolvedValueOnce('WM-2026-RETRY01')
      .mockResolvedValueOnce('WM-2026-RETRY02');
    repository.create
      .mockRejectedValueOnce(
        new WarrantyActivationRequestWarrantyCodeConflictError(),
      )
      .mockImplementation((data) =>
        Promise.resolve({
          ...baseRequest,
          request_code: data.requestCode,
          warranty_code: data.warrantyCode,
          product_id: data.productId,
          items: data.items,
        }),
      );
    const useCase = new CreateWarrantyActivationRequestUseCase(
      repository as never,
      new GenerateWarrantyActivationRequestCodeUseCase(repository as never),
      productsRepository as never,
      dealersRepository as never,
      generateWarrantyCodeUseCase as never,
      warrantyActivationRequestNotificationService as never,
      itemValidator as never,
    );

    await useCase.execute({
      addressDetail: '1 Nguyen Trai',
      categoryId: 'category-id',
      customerName: 'Nguyen Van A',
      customerPhone: '0901234567',
      items: [
        {
          activationCodeId: 'activation-code-a',
          positionKey: 'item-a',
          productId: 'product-a',
        },
        {
          activationCodeId: 'activation-code-b',
          positionKey: 'item-b',
          productId: 'product-b',
        },
      ],
      provinceCode: '79',
      provinceName: 'TP Ho Chi Minh',
      wardCode: '26734',
      wardName: 'Phuong Ben Thanh',
    });

    expect(repository.create).toHaveBeenCalledTimes(2);
    expect(repository.create).toHaveBeenLastCalledWith(
      expect.objectContaining({
        warrantyCode: 'WM-2026-RETRY01',
        items: [
          expect.objectContaining({ warrantyCode: 'WM-2026-RETRY01' }),
          expect.objectContaining({ warrantyCode: 'WM-2026-RETRY02' }),
        ],
      }),
    );
  });

  it('preserves singular fallback for a legacy request without items', () => {
    const result = toWarrantyActivationRequestResponse(
      {
        ...baseRequest,
        activation_code: {
          id: 'activation-code-id',
          code_ciphertext: 'encrypted-code',
          status: 'PENDING_APPROVAL',
        },
        category_id: null,
        activation_code_id: 'activation-code-id',
        dealer_id: null,
        installed_at: null,
        items: [],
        product_id: 'legacy-product-id',
        product_name: 'Legacy product',
        source: warranty_activation_request_source.PUBLIC_WEB,
        vehicle_model: null,
        vehicle_plate: null,
        warranty_duration_months: null,
      },
      () => 'SP-PENDING-001',
    );

    expect(result.itemCount).toBeUndefined();
    expect(result.productId).toBe('legacy-product-id');
    expect(result.productName).toBe('Legacy product');
    expect(result.activationCode).toEqual({
      id: 'activation-code-id',
      code: 'SP-PENDING-001',
      status: 'PENDING_APPROVAL',
    });
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
        dealerId: 'dealer-id',
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
      .mockRejectedValueOnce(new WarrantyActivationRequestCodeConflictError())
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
      new WarrantyActivationRequestUniqueConflictError([
        'warranty_activation_request_one_open_per_product',
      ]),
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
    const uniqueConflict = new WarrantyActivationRequestUniqueConflictError([
      'another_unique_index',
    ]);
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
    repository.withReviewTransaction.mockResolvedValue(activatedRequest);
    issueWarrantyActivationRequestCertificateUseCase.execute.mockResolvedValue({
      id: 'request-certificate-id',
    });
    const useCase = new ReviewWarrantyActivationRequestUseCase(
      repository as never,
      issueWarrantyActivationRequestCertificateUseCase as never,
      generateCustomerCodeUseCase as never,
    );

    const result = await useCase.execute(
      'request-id',
      {
        adminNote: 'Thong tin hop le',
        status: warranty_activation_request_status.APPROVED,
      },
      { reviewedByUserId: 'admin-id' },
    );

    expect(repository.withReviewTransaction).toHaveBeenCalledTimes(1);
    expect(repository.review).not.toHaveBeenCalled();
    expect(
      issueWarrantyActivationRequestCertificateUseCase.execute,
    ).toHaveBeenCalledWith({
      recipientEmail: 'customer@example.com',
      requestId: 'request-id',
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
    expect(result.items?.[0]).not.toHaveProperty('certificate');
  });

  it('keeps the activated response when request certificate issuance fails', async () => {
    const activatedRequest = {
      ...baseRequest,
      status: warranty_activation_request_status.ACTIVATED,
    };
    repository.findById
      .mockResolvedValueOnce(baseRequest)
      .mockResolvedValueOnce(activatedRequest);
    repository.withReviewTransaction.mockResolvedValue(activatedRequest);
    issueWarrantyActivationRequestCertificateUseCase.execute.mockRejectedValue(
      new Error('PDF generation failed'),
    );
    const useCase = new ReviewWarrantyActivationRequestUseCase(
      repository as never,
      issueWarrantyActivationRequestCertificateUseCase as never,
      generateCustomerCodeUseCase as never,
    );

    await expect(
      useCase.execute('request-id', {
        status: warranty_activation_request_status.APPROVED,
      }),
    ).resolves.toMatchObject({
      status: warranty_activation_request_status.ACTIVATED,
    });
    expect(repository.withReviewTransaction).toHaveBeenCalledTimes(1);
  });

  it('requires a rejection reason when rejecting a pending request', async () => {
    repository.findById.mockResolvedValue(baseRequest);
    const useCase = new ReviewWarrantyActivationRequestUseCase(
      repository as never,
      issueWarrantyActivationRequestCertificateUseCase as never,
      generateCustomerCodeUseCase as never,
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
      issueWarrantyActivationRequestCertificateUseCase as never,
      generateCustomerCodeUseCase as never,
    );

    await expect(
      useCase.execute('missing-id', {
        status: warranty_activation_request_status.APPROVED,
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('resends the request-owned certificate', async () => {
    repository.findById.mockResolvedValue(baseRequest);
    const resendWarrantyCertificateEmailUseCase = {
      execute: jest.fn().mockResolvedValue(undefined),
    };
    const useCase = new ResendWarrantyActivationRequestCertificateEmailUseCase(
      repository as never,
      resendWarrantyCertificateEmailUseCase as never,
    );

    await useCase.execute('request-id');

    expect(resendWarrantyCertificateEmailUseCase.execute).toHaveBeenCalledWith(
      'request-id',
    );
  });

  it('returns a structured not-found error when the request is absent', async () => {
    repository.findById.mockResolvedValue(null);
    const useCase = new ResendWarrantyActivationRequestCertificateEmailUseCase(
      repository as never,
      { execute: jest.fn() } as never,
    );

    await expect(useCase.execute('missing-request')).rejects.toMatchObject({
      code: 'WARRANTY_ACTIVATION_REQUEST_NOT_FOUND',
      details: { requestId: 'missing-request' },
      statusCode: 404,
    });
  });

  it('returns a structured not-found error when the request certificate is absent', async () => {
    repository.findById.mockResolvedValue(baseRequest);
    const resendCertificate = {
      execute: jest
        .fn()
        .mockRejectedValue(
          new NotFoundError(
            'Warranty activation certificate not found',
            'WARRANTY_ACTIVATION_CERTIFICATE_NOT_FOUND',
            { requestId: 'request-id' },
          ),
        ),
    };
    const useCase = new ResendWarrantyActivationRequestCertificateEmailUseCase(
      repository as never,
      resendCertificate as never,
    );

    await expect(useCase.execute('request-id')).rejects.toMatchObject({
      code: 'WARRANTY_ACTIVATION_CERTIFICATE_NOT_FOUND',
      details: { requestId: 'request-id' },
      statusCode: 404,
    });
    expect(resendCertificate.execute).toHaveBeenCalledWith('request-id');
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
    currentOwner: null,
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
