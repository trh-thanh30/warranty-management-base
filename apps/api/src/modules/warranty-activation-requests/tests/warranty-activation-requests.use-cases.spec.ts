import { BadRequestError, NotFoundError } from '@/common/response';
import { CreateWarrantyActivationRequestUseCase } from '@/modules/warranty-activation-requests/use-cases/create-warranty-activation-request.use-case';
import { GenerateWarrantyActivationRequestCodeUseCase } from '@/modules/warranty-activation-requests/use-cases/generate-warranty-activation-request-code.use-case';
import { ReviewWarrantyActivationRequestUseCase } from '@/modules/warranty-activation-requests/use-cases/review-warranty-activation-request.use-case';
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
    findPendingDuplicate: jest.fn(),
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
  const issueWarrantyCertificateUseCase = {
    execute: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
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
    repository.findPendingDuplicate.mockResolvedValue(null);
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
    expect(repository.findPendingDuplicate).toHaveBeenCalledWith({
      customerPhone: '0901234567',
      warrantyCode: 'WM-2026-ABC123',
    });
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        customer_email: 'customer@example.com',
        full_address: '1 Nguyen Trai, Phuong Ben Thanh, TP Ho Chi Minh',
        request_code: 'WAR-20260719-0001',
        warranty_code: 'WM-2026-ABC123',
      }),
    );
    expect(result.requestCode).toBe('WAR-20260719-0001');
  });

  it('publishes an admin notification when a public activation request is created', async () => {
    const notificationService = {
      requestCreated: jest.fn(),
    };
    repository.findPendingDuplicate.mockResolvedValue(null);
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
    repository.findPendingDuplicate.mockResolvedValue(null);
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

  it('rejects duplicate pending activation requests for the same warranty and phone', async () => {
    repository.findPendingDuplicate.mockResolvedValue(baseRequest);
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
    ).rejects.toBeInstanceOf(BadRequestError);
  });

  it('retries when generated request code collides', async () => {
    repository.findPendingDuplicate.mockResolvedValue(null);
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
    issueWarrantyCertificateUseCase.execute.mockResolvedValue({
      certificate_number: 'CERT-2026-ABC123',
      id: 'certificate-id',
    });
    const useCase = new ReviewWarrantyActivationRequestUseCase(
      repository as never,
      issueWarrantyCertificateUseCase as never,
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
    expect(issueWarrantyCertificateUseCase.execute).toHaveBeenCalledWith({
      recipientEmail: 'customer@example.com',
      requestId: 'request-id',
      warrantyId: 'warranty-id',
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
  });

  it('requires a rejection reason when rejecting a pending request', async () => {
    repository.findById.mockResolvedValue(baseRequest);
    const useCase = new ReviewWarrantyActivationRequestUseCase(
      repository as never,
      issueWarrantyCertificateUseCase as never,
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
      issueWarrantyCertificateUseCase as never,
    );

    await expect(
      useCase.execute('missing-id', {
        status: warranty_activation_request_status.APPROVED,
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
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
  brand: 'Black Label',
  category_id: 'category-id',
  id: 'product-id',
  manufacture_year: 2026,
  model: 'Premium',
  name: 'Black Label Films',
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
  warranty_code: 'WM-2026-ABC123',
  warranty: {
    id: 'warranty-id',
    status: warranty_status.DRAFT,
    warranty_code: 'WM-2026-ABC123',
  },
};
