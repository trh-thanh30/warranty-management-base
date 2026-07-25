import { AssetsService } from '@/modules/assets/assets.service';
import { ProductsRepository } from '@/modules/products/repository/products.repository';
import { UpdateProductUseCase } from '@/modules/products/use-cases/update-product.use-case';
import { Test } from '@nestjs/testing';

describe('UpdateProductUseCase', () => {
  it('can be resolved by the Nest dependency injection container', async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        UpdateProductUseCase,
        { provide: ProductsRepository, useValue: {} },
        { provide: AssetsService, useValue: {} },
      ],
    }).compile();

    expect(moduleRef.get(UpdateProductUseCase)).toBeInstanceOf(
      UpdateProductUseCase,
    );
  });

  it('updates only physical product fields including display name', async () => {
    const existing = {
      id: 'product-id',
      template_id: 'template-id',
      serial_number: 'SN-001',
      display_name: null,
      metadata: null,
      deleted_at: null,
    };
    const repository = {
      findById: jest.fn().mockResolvedValue(existing),
      findBySerialNumber: jest.fn(),
      update: jest.fn().mockResolvedValue({
        ...existing,
        display_name: 'Camera kho hàng',
        product_code: 'PRD-001',
        status: 'ACTIVE',
        created_at: new Date(),
        updated_at: new Date(),
        assets: [],
        ownerships: [],
        warranty: null,
        template: {
          id: 'template-id',
          sku: 'CAM-4K',
          slug: 'camera-ai-4k',
          name: 'Camera AI 4K',
          category_id: 'category-id',
          category_ref: null,
          brand: null,
          model: null,
          model_year: null,
          description: null,
          default_warranty_duration_months: 24,
          default_warranty_terms: null,
          metadata: null,
          is_active: true,
          is_published: false,
          published_at: null,
          created_at: new Date(),
          updated_at: new Date(),
          assets: [],
        },
      }),
    };
    const useCase = new UpdateProductUseCase(repository as never);

    const result = await useCase.execute('product-id', {
      displayName: ' Camera kho hàng ',
    });

    expect(repository.update).toHaveBeenCalledWith(
      'product-id',
      expect.objectContaining({ display_name: 'Camera kho hàng' }),
    );
    expect(result.displayName).toBe('Camera kho hàng');
  });
});
