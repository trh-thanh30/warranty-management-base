import { SoftDeleteProductUseCase } from '@/modules/products/use-cases/soft-delete-product.use-case';
import { product_status } from '@prisma/client';

describe('SoftDeleteProductUseCase', () => {
  it('soft deletes an existing product without deleting its related records', async () => {
    const existingProduct = {
      id: 'product-1',
      deleted_at: null,
    };
    const update = jest.fn().mockImplementation((_id, data) => ({
      ...existingProduct,
      ...data,
      assets: [],
      category_id: 'category-1',
      created_at: new Date('2026-08-01T00:00:00.000Z'),
      display_name: 'Product 1',
      metadata: null,
      ownerships: [],
      product_code: 'PRD-1',
      serial_number: null,
      updated_at: new Date('2026-08-01T00:00:00.000Z'),
      warranty: null,
      warranty_activation_requests: [],
    }));
    const repository = {
      findById: jest.fn().mockResolvedValue(existingProduct),
      update,
    };
    const useCase = new SoftDeleteProductUseCase(repository as never);

    const result = await useCase.execute(existingProduct.id);

    expect(update).toHaveBeenCalledWith(existingProduct.id, {
      deleted_at: expect.any(Date),
      status: product_status.DELETED,
    });
    expect(result.status).toBe(product_status.DELETED);
    expect(result.deletedAt).toBeInstanceOf(Date);
  });

  it('does not delete a product that was already soft deleted', async () => {
    const repository = {
      findById: jest.fn().mockResolvedValue({
        id: 'product-1',
        deleted_at: new Date(),
      }),
      update: jest.fn(),
    };
    const useCase = new SoftDeleteProductUseCase(repository as never);

    await expect(useCase.execute('product-1')).rejects.toMatchObject({
      statusCode: 404,
    });
    expect(repository.update).not.toHaveBeenCalled();
  });
});
