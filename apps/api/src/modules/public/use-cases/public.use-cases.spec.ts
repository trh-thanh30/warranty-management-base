import { readFileSync } from 'node:fs';
import { PublicListServiceCentersUseCase } from '@/modules/public/use-cases/public-list-service-centers.use-case';
import { PublicListNetworkLocationsUseCase } from '@/modules/public/use-cases/public-list-network-locations.use-case';
import { PublicListNetworkDirectoryUseCase } from '@/modules/public/use-cases/public-list-network-directory.use-case';
import { PublicListNetworkDirectoryFilterOptionsUseCase } from '@/modules/public/use-cases/public-list-network-directory-filter-options.use-case';
import { PublicListDealersUseCase } from '@/modules/public/use-cases/public-list-dealers.use-case';
import { PublicListDealerFilterOptionsUseCase } from '@/modules/public/use-cases/public-list-dealer-filter-options.use-case';
import { toPublicWarrantyClaimResponse } from '@/modules/public/mappers/public-warranty-claim.mapper';
import { CreatePublicWarrantyClaimUseCase } from '@/modules/public/use-cases/create-public-warranty-claim.use-case';
import { PublicLookupWarrantyClaimByCodeUseCase } from '@/modules/public/use-cases/public-lookup-warranty-claim-by-code.use-case';
import { CreatePublicWarrantyActivationRequestDto } from '@/modules/warranty-activation-requests/dto/create-public-warranty-activation-request.dto';
import { CreatePublicWarrantyActivationRequestUseCase } from '@/modules/public/use-cases/create-public-warranty-activation-request.use-case';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

describe('Public use cases', () => {
  it('combines, filters, and paginates active dealers and service centers for the public directory', async () => {
    const dealersRepository = {
      listActiveForNetwork: jest.fn().mockResolvedValue([
        {
          id: 'dealer-id',
          name: 'Ha Noi Dealer',
          phone: '0901234567',
          address: '1 Nguyen Trai',
          province: 'Ha Noi',
          district: 'Thanh Xuan',
          latitude: 21.0285,
          longitude: 105.8542,
        },
      ]),
    };
    const serviceCentersRepository = {
      listActiveForNetwork: jest.fn().mockResolvedValue([
        {
          id: 'service-center-id',
          name: 'Ha Noi Warranty Center',
          phone: null,
          address: '2 Nguyen Trai',
          province: 'Ha Noi',
          district: 'Thanh Xuan',
          latitude: 21.03,
          longitude: 105.85,
        },
      ]),
    };
    const useCase = new PublicListNetworkDirectoryUseCase(
      dealersRepository as never,
      serviceCentersRepository as never,
    );

    const result = await useCase.execute({
      page: 1,
      limit: 10,
      province: 'Ha Noi',
      search: 'nguyen trai',
    });

    expect(result.items).toEqual([
      expect.objectContaining({ id: 'dealer-id', kind: 'DEALER' }),
      expect.objectContaining({
        id: 'service-center-id',
        kind: 'SERVICE_CENTER',
      }),
    ]);
    expect(result.meta).toEqual(
      expect.objectContaining({ page: 1, limit: 10, total: 2 }),
    );
  });

  it('returns filter options from both active dealers and service centers', async () => {
    const dealersRepository = {
      listActiveForNetwork: jest.fn().mockResolvedValue([
        {
          province: 'Ha Noi',
          district: 'Thanh Xuan',
        },
      ]),
    };
    const serviceCentersRepository = {
      listActiveForNetwork: jest.fn().mockResolvedValue([
        {
          province: 'Bac Ninh',
          district: 'Tien Du',
        },
        {
          province: 'Ha Noi',
          district: 'Cau Giay',
        },
      ]),
    };
    const useCase = new PublicListNetworkDirectoryFilterOptionsUseCase(
      dealersRepository as never,
      serviceCentersRepository as never,
    );

    await expect(useCase.execute()).resolves.toEqual({
      provinces: ['Bac Ninh', 'Ha Noi'],
      districts: [],
    });
    await expect(useCase.execute('Ha Noi')).resolves.toEqual({
      provinces: ['Bac Ninh', 'Ha Noi'],
      districts: ['Cau Giay', 'Thanh Xuan'],
    });
  });

  it('includes nearby service centers when filtering the public directory by distance', async () => {
    const dealersRepository = {
      listActiveForNetwork: jest.fn().mockResolvedValue([
        {
          id: 'far-dealer',
          name: 'Far Dealer',
          phone: null,
          address: 'Da Nang',
          province: 'Da Nang',
          district: null,
          latitude: 16.0544,
          longitude: 108.2022,
        },
      ]),
    };
    const serviceCentersRepository = {
      listActiveForNetwork: jest.fn().mockResolvedValue([
        {
          id: 'near-center',
          name: 'Nearby Warranty Center',
          phone: null,
          address: 'Ha Noi',
          province: 'Ha Noi',
          district: null,
          latitude: 21.0285,
          longitude: 105.8542,
        },
      ]),
    };
    const useCase = new PublicListNetworkDirectoryUseCase(
      dealersRepository as never,
      serviceCentersRepository as never,
    );

    const result = await useCase.execute({
      latitude: 21.0285,
      longitude: 105.8542,
      radiusKm: 20,
      page: 1,
      limit: 10,
    });

    expect(result.items).toEqual([
      expect.objectContaining({
        id: 'near-center',
        kind: 'SERVICE_CENTER',
      }),
    ]);
    expect(result.meta.total).toBe(1);
  });

  it('returns a paginated active-only public dealer projection', async () => {
    const dealersRepository = {
      listActivePublic: jest.fn().mockResolvedValue({
        items: [
          {
            id: 'dealer-id',
            name: 'Ha Noi Dealer',
            phone: '0901234567',
            address: '1 Nguyen Trai',
            province: 'Ha Noi',
            district: 'Thanh Xuan',
            latitude: 21.0285,
            longitude: 105.8542,
          },
        ],
        meta: {
          page: 1,
          limit: 10,
          total: 11,
          totalPages: 2,
          hasNextPage: true,
          hasPreviousPage: false,
        },
      }),
    };
    const useCase = new PublicListDealersUseCase(dealersRepository as never);

    const result = await useCase.execute({
      page: 1,
      limit: 10,
      search: 'Ha Noi',
    });

    expect(dealersRepository.listActivePublic).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
      search: 'Ha Noi',
    });
    expect(result).toEqual({
      items: [
        expect.objectContaining({
          id: 'dealer-id',
          kind: 'DEALER',
          googleMapsUrl:
            'https://www.google.com/maps/search/?api=1&query=21.0285%2C105.8542',
        }),
      ],
      meta: expect.objectContaining({
        page: 1,
        hasNextPage: true,
      }),
    });
  });

  it('filters and paginates nearby dealers by distance', async () => {
    const dealersRepository = {
      listActiveForNetwork: jest.fn().mockResolvedValue([
        {
          id: 'near',
          name: 'Nearby Dealer',
          phone: null,
          address: 'Near address',
          province: 'Ha Noi',
          district: null,
          latitude: 21.0285,
          longitude: 105.8542,
        },
        {
          id: 'far',
          name: 'Far Dealer',
          phone: null,
          address: 'Far address',
          province: 'Da Nang',
          district: null,
          latitude: 16.0544,
          longitude: 108.2022,
        },
      ]),
      listActivePublic: jest.fn(),
    };
    const useCase = new PublicListDealersUseCase(dealersRepository as never);

    const result = await useCase.execute({
      latitude: 21.0285,
      longitude: 105.8542,
      radiusKm: 20,
      page: 1,
      limit: 10,
    });

    expect(result.items.map((dealer) => dealer.id)).toEqual(['near']);
    expect(result.meta.total).toBe(1);
    expect(dealersRepository.listActivePublic).not.toHaveBeenCalled();
  });

  it('returns active dealer filter options for the selected province', async () => {
    const dealersRepository = {
      listActiveFilterOptions: jest.fn().mockResolvedValue({
        provinces: [{ province: 'Ha Noi' }, { province: 'Bac Ninh' }],
        districts: [{ district: 'Tien Du' }, { district: 'Gia Binh' }],
      }),
    };
    const useCase = new PublicListDealerFilterOptionsUseCase(
      dealersRepository as never,
    );

    const result = await useCase.execute('Bac Ninh');

    expect(dealersRepository.listActiveFilterOptions).toHaveBeenCalledWith(
      'Bac Ninh',
    );
    expect(result).toEqual({
      provinces: ['Bac Ninh', 'Ha Noi'],
      districts: ['Gia Binh', 'Tien Du'],
    });
  });

  it('combines active dealers and service centers into network locations', async () => {
    const dealersRepository = {
      listActiveForNetwork: jest.fn().mockResolvedValue([
        {
          id: 'dealer-id',
          name: 'Ha Noi Dealer',
          phone: '0901234567',
          address: '1 Nguyen Trai',
          province: 'Ha Noi',
          district: 'Thanh Xuan',
          latitude: 21.0285,
          longitude: 105.8542,
        },
      ]),
    };
    const serviceCentersRepository = {
      listActiveForNetwork: jest.fn().mockResolvedValue([
        {
          id: 'service-center-id',
          name: 'Da Nang Warranty Center',
          phone: null,
          address: '1 Nguyen Van Linh',
          province: 'Da Nang',
          district: 'Hai Chau',
          latitude: 16.0544,
          longitude: 108.2022,
        },
      ]),
    };
    const useCase = new PublicListNetworkLocationsUseCase(
      dealersRepository as never,
      serviceCentersRepository as never,
    );

    const result = await useCase.execute();

    expect(result).toEqual([
      expect.objectContaining({
        id: 'dealer-id',
        kind: 'DEALER',
        googleMapsUrl:
          'https://www.google.com/maps/search/?api=1&query=21.0285%2C105.8542',
      }),
      expect.objectContaining({
        id: 'service-center-id',
        kind: 'SERVICE_CENTER',
        googleMapsUrl:
          'https://www.google.com/maps/search/?api=1&query=16.0544%2C108.2022',
      }),
    ]);
  });

  it('forces service centers to active only', async () => {
    const serviceCentersRepository = {
      list: jest.fn().mockResolvedValue({
        items: [],
        meta: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      }),
    };
    const useCase = new PublicListServiceCentersUseCase(
      serviceCentersRepository as never,
    );

    await useCase.execute({ province: 'Ha Noi' });

    expect(serviceCentersRepository.list).toHaveBeenCalledWith({
      search: undefined,
      province: 'Ha Noi',
      isActive: 'true',
      page: undefined,
      limit: undefined,
      sortBy: undefined,
      sortOrder: undefined,
    });
  });

  it('maps warranty claims without requester or customer fields', () => {
    const result = toPublicWarrantyClaimResponse({
      claim_code: 'CLM-0123456789ABCDEFABCD',
      warranty_code: 'WM-2026-ABCDEF',
      issue_title: 'May khong hoat dong',
      status: 'REVIEWING',
      priority: 'NORMAL',
      due_at: new Date('2026-07-06T00:00:00.000Z'),
      submitted_at: new Date('2026-07-03T00:00:00.000Z'),
      resolved_at: null,
      status_history: [
        {
          id: 'status-history-id',
          from_status: 'SUBMITTED',
          to_status: 'REVIEWING',
          note: 'Internal eligibility note',
          changed_by_user_id: 'admin-id',
          changed_by: {
            id: 'admin-id',
            username: 'admin',
            full_name: 'Admin User',
            email: 'admin@example.com',
          },
          created_at: new Date('2026-07-03T08:00:00.000Z'),
        },
      ],
      service_center_history: [
        {
          id: 'service-center-history-id',
          from_service_center_id: null,
          from_service_center_name: null,
          to_service_center_id: 'service-center-id',
          to_service_center_name: 'Hanoi Warranty Center',
          note: 'Internal assignment reason',
          changed_by_user_id: 'admin-id',
          changed_by: {
            id: 'admin-id',
            username: 'admin',
            full_name: 'Admin User',
            email: 'admin@example.com',
          },
          created_at: new Date('2026-07-03T09:00:00.000Z'),
        },
      ],
      product: {
        display_name: 'May bom',
        product_code: 'MAY-BOM-A1',
        slug: 'may-bom-a1',
        brand: 'UKG',
        model: 'A1',
      },
      service_center: null,
    } as never);

    expect(result).toMatchObject({
      claimCode: 'CLM-0123456789ABCDEFABCD',
      warrantyCode: 'WM-2026-ABCDEF',
      product: {
        name: 'May bom',
      },
    });
    expect(result.timeline).toEqual([
      {
        type: 'STATUS_CHANGED',
        status: 'SUBMITTED',
        createdAt: '2026-07-03T00:00:00.000Z',
      },
      {
        type: 'STATUS_CHANGED',
        status: 'REVIEWING',
        createdAt: '2026-07-03T08:00:00.000Z',
      },
      {
        type: 'SERVICE_CENTER_ASSIGNED',
        serviceCenterName: 'Hanoi Warranty Center',
        createdAt: '2026-07-03T09:00:00.000Z',
      },
    ]);
    expect(JSON.stringify(result.timeline)).not.toContain('admin');
    expect(JSON.stringify(result.timeline)).not.toContain('Internal');
    expect(result).not.toHaveProperty('requesterName');
    expect(result).not.toHaveProperty('customer');
  });

  it('returns an initial public timeline when a warranty claim is created', async () => {
    const createWarrantyClaimUseCase = {
      execute: jest.fn().mockResolvedValue({
        claimCode: 'CLM-0123456789ABCDEFABCD',
        warrantyCode: 'WM-2026-ABCDEF',
        issueTitle: 'May khong hoat dong',
        status: 'SUBMITTED',
        priority: 'NORMAL',
        dueAt: new Date('2026-07-06T00:00:00.000Z'),
        submittedAt: new Date('2026-07-03T00:00:00.000Z'),
        resolvedAt: null,
        product: null,
        serviceCenter: null,
      }),
    };
    const useCase = new CreatePublicWarrantyClaimUseCase(
      createWarrantyClaimUseCase as never,
    );

    const result = await useCase.execute({} as never, [
      { mimetype: 'image/webp' } as Express.Multer.File,
    ]);

    expect(result.timeline).toEqual([
      {
        type: 'STATUS_CHANGED',
        status: 'SUBMITTED',
        createdAt: '2026-07-03T00:00:00.000Z',
      },
    ]);
  });
});

describe('Public warranty lookup endpoint', () => {
  it('applies the shared public warranty abuse cooldown to every endpoint', () => {
    const controllerSource = readFileSync(
      require.resolve('@/modules/public/public.controller'),
      'utf8',
    );

    expect(controllerSource).toMatch(
      /const PUBLIC_WARRANTY_THROTTLE = \{\s*default: \{\s*blockDuration: 5 \* 60_000,\s*limit: 5,\s*ttl: 60_000,\s*\},\s*\} as const;/,
    );
    expect(
      controllerSource.match(/@Throttle\(PUBLIC_WARRANTY_THROTTLE\)/g),
    ).toHaveLength(6);
    expect(controllerSource).toMatch(
      /@Throttle\(PUBLIC_WARRANTY_THROTTLE\)\s*@Get\('warranties\/lookup'\)/,
    );
    expect(controllerSource).toMatch(
      /@Throttle\(PUBLIC_WARRANTY_THROTTLE\)\s*@Post\('warranty-activation-requests'\)/,
    );
    expect(controllerSource).toMatch(
      /@Throttle\(PUBLIC_WARRANTY_THROTTLE\)\s*@Get\('warranty-activation-requests\/:requestCode'\)/,
    );
    expect(controllerSource).toMatch(
      /@Throttle\(PUBLIC_WARRANTY_THROTTLE\)\s*@Post\('warranty-claims'\)/,
    );
    expect(controllerSource).toMatch(
      /@Throttle\(PUBLIC_WARRANTY_THROTTLE\)\s*@Get\('warranty-claims\/by-code\/:claimCode'\)/,
    );
    expect(controllerSource).toMatch(
      /@Throttle\(PUBLIC_WARRANTY_THROTTLE\)\s*@Get\('warranty-claims\/by-warranty-code\/:warrantyCode'\)/,
    );
  });

  it('applies abuse protection after multipart parsing for warranty claims', () => {
    const controllerSource = readFileSync(
      require.resolve('@/modules/public/public.controller'),
      'utf8',
    );

    expect(controllerSource).toMatch(
      /@PublicSubmissionAction\('activation-request'\)\s*@UseInterceptors\(PublicSubmissionAbuseInterceptor\)\s*@Throttle\(PUBLIC_WARRANTY_THROTTLE\)\s*@Post\('warranty-activation-requests'\)/,
    );
    expect(controllerSource).toMatch(
      /@PublicSubmissionAction\('warranty-claim'\)\s*@UseInterceptors\(\s*FilesInterceptor\([\s\S]*?\),\s*PublicSubmissionAbuseInterceptor,?\s*\)\s*@Throttle\(PUBLIC_WARRANTY_THROTTLE\)\s*@Post\('warranty-claims'\)/,
    );
  });
});

describe('Public warranty claim tracking', () => {
  const warrantyClaimsRepository = {
    findByClaimCode: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('normalizes random claim codes before lookup', async () => {
    warrantyClaimsRepository.findByClaimCode.mockResolvedValue(null);
    const useCase = new PublicLookupWarrantyClaimByCodeUseCase(
      warrantyClaimsRepository as never,
    );

    await expect(
      useCase.execute(' clm-0123456789abcdefabcd '),
    ).rejects.toMatchObject({ statusCode: 404 });
    expect(warrantyClaimsRepository.findByClaimCode).toHaveBeenCalledWith(
      'CLM-0123456789ABCDEFABCD',
    );
  });

  it('rejects malformed claim codes before querying storage', async () => {
    const useCase = new PublicLookupWarrantyClaimByCodeUseCase(
      warrantyClaimsRepository as never,
    );

    await expect(useCase.execute('CLM-')).rejects.toMatchObject({
      code: 'WARRANTY_CLAIM_CODE_INVALID',
      statusCode: 400,
    });
    expect(warrantyClaimsRepository.findByClaimCode).not.toHaveBeenCalled();
  });
});

describe('Public warranty activation request endpoint', () => {
  it('returns only the public activation receipt', async () => {
    const createRequest = {
      execute: jest.fn().mockResolvedValue({
        id: 'private-request-id',
        requestCode: 'WAR-20260907-0001',
        status: 'PENDING',
        createdAt: '2026-09-07T01:00:00.000Z',
        customerEmail: 'private@example.com',
        activationCode: { id: 'private-code-id', status: 'PENDING_APPROVAL' },
      }),
    };
    const useCase = new CreatePublicWarrantyActivationRequestUseCase(
      createRequest as never,
    );

    await expect(
      useCase.execute({ activationCode: 'SP-ABCDEF123456' } as never),
    ).resolves.toEqual({
      requestCode: 'WAR-20260907-0001',
      status: 'PENDING',
      createdAt: '2026-09-07T01:00:00.000Z',
    });
    expect(createRequest.execute).toHaveBeenCalledWith(
      { activationCode: 'SP-ABCDEF123456' },
      { source: 'PUBLIC_WEB' },
    );
  });

  it('requires a customer email in the public activation contract', async () => {
    const dto = plainToInstance(CreatePublicWarrantyActivationRequestDto, {
      addressDetail: '7C Nguyen Ngoc Phuong',
      customerName: 'Nguyen Van An',
      customerPhone: '0886337733',
      provinceCode: '79',
      provinceName: 'Thanh pho Ho Chi Minh',
      wardCode: '26734',
      wardName: 'Phuong Thanh My Tay',
      activationCode: 'SP-ABCDEF123456',
    });

    const errors = await validate(dto);

    expect(errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          property: 'customerEmail',
        }),
      ]),
    );
  });
});
