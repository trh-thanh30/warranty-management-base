import { ConfirmProductImportUseCase } from '@/modules/products/use-cases/confirm-product-import.use-case';
import { product_status } from '@prisma/client';

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
      productTemplate: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'template-id',
          is_active: true,
          default_warranty_duration_months: 36,
          default_warranty_terms: 'Template terms',
        }),
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
          templateSku: 'BATTERY-PLUS',
          displayName: 'SUV Battery',
          installationPosition: 'Engine bay',
          productCode: null,
          serialNumber: 'SN-001',
          status: product_status.ACTIVE,
        },
      ],
    });

    expect(tx.product.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          template: { connect: { id: 'template-id' } },
          display_name: 'SUV Battery',
          metadata: {
            installationPosition: 'Engine bay',
          },
          serial_number: 'SN-001',
          status: product_status.ACTIVE,
          warranty: {
            create: expect.objectContaining({
              duration_months: 36,
              terms: 'Template terms',
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
