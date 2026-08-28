import { RestoreProductUseCase } from '@/modules/products/use-cases/restore-product.use-case';
import { product_status } from '@prisma/client';

describe('RestoreProductUseCase', () => {
  it('restores a soft-deleted product', async () => {
    const repository = {
      findById: jest.fn().mockResolvedValue({
        deleted_at: new Date(),
        id: 'product-1',
      }),
      update: jest.fn().mockResolvedValue({
        assets: [],
        category_id: 'category-1',
        created_at: new Date(),
        deleted_at: null,
        display_name: 'Product 1',
        id: 'product-1',
        metadata: null,
        ownerships: [],
        product_code: 'PRD-1',
        serial_number: null,
        status: 'DELETED',
        template: null,
        template_id: 'template-1',
        updated_at: new Date(),
        warranty: null,
        warranty_activation_requests: [],
      }),
    };
    const useCase = new RestoreProductUseCase(repository as never);

    await useCase.execute('product-1');

    expect(repository.update).toHaveBeenCalledWith('product-1', {
      deleted_at: null,
      status: product_status.ACTIVE,
    });
  });

  it('is idempotent for an active product', async () => {
    const product = { deleted_at: null, id: 'product-1' };
    const repository = {
      findById: jest.fn().mockResolvedValue(product),
      update: jest.fn(),
    };
    const useCase = new RestoreProductUseCase(repository as never);

    await useCase.execute('product-1');

    expect(repository.update).not.toHaveBeenCalled();
  });
});
