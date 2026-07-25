import { NotFoundError } from '@/common/response';
import { UpdateProductPublicationUseCase } from '@/modules/products/use-cases/update-product-publication.use-case';

describe('UpdateProductPublicationUseCase', () => {
  it('publishes a product and records the publication time', async () => {
    const product = {
      id: 'product-id',
      deleted_at: null,
    };
    const productsRepository = {
      findById: jest.fn().mockResolvedValue(product),
      update: jest.fn().mockResolvedValue({
        ...product,
        is_published: true,
        published_at: new Date('2026-07-25T00:00:00.000Z'),
      }),
    };
    const useCase = new UpdateProductPublicationUseCase(
      productsRepository as never,
    );

    await useCase.execute('product-id', { isPublished: true });

    expect(productsRepository.update).toHaveBeenCalledWith('product-id', {
      is_published: true,
      published_at: expect.any(Date),
    });
  });

  it('unpublishes a product and clears the publication time', async () => {
    const product = {
      id: 'product-id',
      deleted_at: null,
    };
    const productsRepository = {
      findById: jest.fn().mockResolvedValue(product),
      update: jest.fn().mockResolvedValue({
        ...product,
        is_published: false,
        published_at: null,
      }),
    };
    const useCase = new UpdateProductPublicationUseCase(
      productsRepository as never,
    );

    await useCase.execute('product-id', { isPublished: false });

    expect(productsRepository.update).toHaveBeenCalledWith('product-id', {
      is_published: false,
      published_at: null,
    });
  });

  it('rejects a missing or deleted product', async () => {
    const productsRepository = {
      findById: jest.fn().mockResolvedValue({ deleted_at: new Date() }),
      update: jest.fn(),
    };
    const useCase = new UpdateProductPublicationUseCase(
      productsRepository as never,
    );

    await expect(
      useCase.execute('product-id', { isPublished: true }),
    ).rejects.toBeInstanceOf(NotFoundError);
    expect(productsRepository.update).not.toHaveBeenCalled();
  });
});
