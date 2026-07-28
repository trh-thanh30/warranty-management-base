import { PublicListServiceCentersUseCase } from '@/modules/public/use-cases/public-list-service-centers.use-case';
import { PublicListNetworkLocationsUseCase } from '@/modules/public/use-cases/public-list-network-locations.use-case';
import { toPublicWarrantyClaimResponse } from '@/modules/public/use-cases/public-lookup-warranty-claim-by-code.use-case';

describe('Public use cases', () => {
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
