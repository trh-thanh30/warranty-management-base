import { ConfirmProductImportUseCase } from '@/modules/products/use-cases/confirm-product-import.use-case';
import { product_category, product_status } from '@prisma/client';

describe('ConfirmProductImportUseCase', () => {
  it('creates products from validated import rows', async () => {
    const tx = {
      product: {
        create: jest.fn().mockResolvedValue({ id: 'product-id' }),
        findUnique: jest.fn().mockResolvedValue(null),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
      warranty: {
        upsert: jest.fn(),
      },
    };
    const prismaService = {
      category: {
        findFirst: jest.fn().mockResolvedValue({ id: 'category-id' }),
      },
      product: {
        findUnique: jest.fn().mockResolvedValue(null),
      },
      $transaction: jest.fn((callback) => callback(tx)),
    };
    const generateProductCodeUseCase = {
      execute: jest.fn().mockResolvedValue('PRD-2026-ABCDEF'),
    };
    const useCase = new ConfirmProductImportUseCase(
      prismaService as never,
      generateProductCodeUseCase as never,
    );

    const result = await useCase.execute({
      mode: 'upsert',
      rows: [
        {
          brand: 'Toyota',
          category: product_category.SPARE_PART,
          categoryCode: 'BATTERY',
          description: null,
          imageUrl: 'https://example.com/product.jpg',
          installationPosition: 'Engine bay',
          manufactureYear: 2026,
          model: 'Battery',
          name: 'SUV Battery',
          productCode: null,
          serialNumber: 'SN-001',
          status: product_status.ACTIVE,
          warrantyDurationMonths: 36,
          warrantyTerms: null,
        },
      ],
    });

    expect(tx.product.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          category: product_category.SPARE_PART,
          category_ref: { connect: { id: 'category-id' } },
          metadata: {
            excelImageUrl: 'https://example.com/product.jpg',
            installationPosition: 'Engine bay',
          },
          name: 'SUV Battery',
          serial_number: 'SN-001',
          status: product_status.ACTIVE,
          warranty: {
            create: expect.objectContaining({
              duration_months: 36,
            }),
          },
        }),
      }),
    );
    expect(generateProductCodeUseCase.execute).toHaveBeenCalledWith(
      expect.any(Date),
      tx,
    );
    expect(result).toEqual({
      created: 1,
      deactivated: 0,
      errors: [],
      updated: 0,
    });
  });
});
