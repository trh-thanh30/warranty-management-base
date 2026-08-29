import { ListWarrantiesUseCase } from '@/modules/warranties/use-cases/list-warranties.use-case';

describe('ListWarrantiesUseCase', () => {
  it('returns paginated warranties with product and current owner summaries', async () => {
    const repository = {
      list: jest.fn().mockResolvedValue({
        items: [
          {
            id: 'warranty-id',
            product_id: 'product-id',
            warranty_code: 'WM-2026-ABCDEF',
            start_date: new Date('2026-07-13T00:00:00.000Z'),
            end_date: new Date('2027-07-13T00:00:00.000Z'),
            duration_months: 12,
            status: 'ACTIVE',
            terms: null,
            metadata: null,
            created_at: new Date('2026-07-13T00:00:00.000Z'),
            updated_at: new Date('2026-07-13T00:00:00.000Z'),
            product: {
              id: 'product-id',
              product_code: 'PRD-2026-ABCDEF',
              display_name: null,
              serial_number: 'SN-001',
              catalogue_name: 'Genuine Battery Pack',
              catalogue_sku: 'PRD-2026-ABCDEF',
              catalogue_slug: 'genuine-battery-pack',
              catalogue_brand: 'Toyota',
              catalogue_model: 'Battery Plus',
              ownerships: [
                {
                  customer_id: 'customer-id',
                  owner_user_id: null,
                  is_current_owner: true,
                  customer: {
                    customer_code: 'CUS-2026-000001',
                    full_name: 'Nguyen Van A',
                  },
                },
              ],
            },
          },
        ],
        meta: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      }),
    };
    const useCase = new ListWarrantiesUseCase(repository as never);

    const result = await useCase.execute({
      page: 1,
      search: 'battery',
      status: 'ACTIVE',
    });

    expect(repository.list).toHaveBeenCalledWith({
      page: 1,
      search: 'battery',
      status: 'ACTIVE',
    });
    expect(result.items).toEqual([
      expect.objectContaining({
        id: 'warranty-id',
        productId: 'product-id',
        warrantyCode: 'WM-2026-ABCDEF',
        status: 'ACTIVE',
        product: {
          id: 'product-id',
          name: 'Genuine Battery Pack',
          displayName: null,
          brand: 'Toyota',
          model: 'Battery Plus',
          productCode: 'PRD-2026-ABCDEF',
          serialNumber: 'SN-001',
        },
        owner: {
          customerId: 'customer-id',
          ownerUserId: null,
          customerCode: 'CUS-2026-000001',
          fullName: 'Nguyen Van A',
        },
      }),
    ]);
    expect(result.meta.total).toBe(1);
  });
});
