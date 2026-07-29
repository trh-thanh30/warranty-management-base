import { PublicListServiceCentersUseCase } from '@/modules/public/use-cases/public-list-service-centers.use-case';
import { PublicListNetworkLocationsUseCase } from '@/modules/public/use-cases/public-list-network-locations.use-case';
import { PublicListDealersUseCase } from '@/modules/public/use-cases/public-list-dealers.use-case';
import { PublicListDealerFilterOptionsUseCase } from '@/modules/public/use-cases/public-list-dealer-filter-options.use-case';
import { toPublicWarrantyClaimResponse } from '@/modules/public/use-cases/public-lookup-warranty-claim-by-code.use-case';

describe('Public use cases', () => {
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
      claim_code: 'CLM000001',
      warranty_code: 'WM-2026-ABCDEF',
      issue_title: 'May khong hoat dong',
      status: 'REVIEWING',
      priority: 'NORMAL',
      due_at: new Date('2026-07-06T00:00:00.000Z'),
      submitted_at: new Date('2026-07-03T00:00:00.000Z'),
      resolved_at: null,
      product: {
        display_name: null,
        template: {
          name: 'May bom',
          brand: 'UKG',
          model: 'A1',
        },
      },
      service_center: null,
    });

    expect(result).toMatchObject({
      claimCode: 'CLM000001',
      warrantyCode: 'WM-2026-ABCDEF',
      product: {
        name: 'May bom',
      },
    });
    expect(result).not.toHaveProperty('requesterName');
    expect(result).not.toHaveProperty('customer');
  });
});
