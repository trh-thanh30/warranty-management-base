import { AssignProductOwnerUseCase } from '@/modules/products/use-cases/assign-product-owner.use-case';

describe('AssignProductOwnerUseCase', () => {
  it('ends the current owner and creates a new current ownership', async () => {
    const tx = {
      productOwnership: {
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        create: jest.fn().mockResolvedValue({ id: 'ownership-id' }),
      },
      product: {
        findUniqueOrThrow: jest.fn().mockResolvedValue({
          id: 'product-id',
          product_code: 'PRD-2026-ABC',
          warranty_code: 'WM-2026-ABCDEF',
          serial_number: null,
          name: 'Toyota Camry',
          category: 'CAR',
          brand: 'Toyota',
          model: 'Camry',
          manufacture_year: 2026,
          description: null,
          status: 'ACTIVE',
          created_at: new Date(),
          updated_at: new Date(),
          deleted_at: null,
          ownerships: [],
          warranty: null,
        }),
      },
    };
    const prismaService = {
      product: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'product-id',
          deleted_at: null,
        }),
      },
      customer: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'customer-id',
          user_id: 'owner-user-id',
        }),
      },
      $transaction: jest.fn((callback) => callback(tx)),
    };
    const useCase = new AssignProductOwnerUseCase(prismaService as never);

    await useCase.execute('product-id', {
      customerId: 'customer-id',
      purchaseDate: '2026-06-14',
    });

    expect(tx.productOwnership.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          product_id: 'product-id',
          is_current_owner: true,
        },
      }),
    );
    expect(tx.productOwnership.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          product_id: 'product-id',
          customer_id: 'customer-id',
          owner_user_id: 'owner-user-id',
          is_current_owner: true,
        }),
      }),
    );
  });
});
