import { PublicListServiceCentersUseCase } from '@/modules/public/use-cases/public-list-service-centers.use-case';
import { toPublicWarrantyClaimResponse } from '@/modules/public/use-cases/public-lookup-warranty-claim-by-code.use-case';

describe('Public use cases', () => {
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
