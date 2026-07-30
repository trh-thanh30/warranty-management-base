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
          category_id: 'category-id',
          id: 'template-id',
          is_active: true,
          default_warranty_duration_months: 36,
          default_warranty_terms: 'Template terms',
        }),
      },
      product: {
        findUnique: jest.fn().mockResolvedValue(null),
      },
      warranty: {
        findUnique: jest.fn().mockResolvedValue(null),
      },
      $transaction: jest.fn((callback) => callback(tx)),
    };
    const generateProductCodeUseCase = {
      execute: jest.fn().mockResolvedValue('PRD-2026-ABCDEF'),
    };
    const generateWarrantyCodeUseCase = {
      execute: jest.fn().mockResolvedValue('WM-2026-IMPORT01'),
    };
    const useCase = new ConfirmProductImportUseCase(
      prismaService as never,
      generateProductCodeUseCase as never,
      generateWarrantyCodeUseCase as never,
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
          category_ref: { connect: { id: 'category-id' } },
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
              end_date: null,
              start_date: null,
              status: 'DRAFT',
              terms: 'Template terms',
              warranty_code: 'WM-2026-IMPORT01',
            }),
          },
        }),
      }),
    );
    expect(generateProductCodeUseCase.execute).toHaveBeenCalledWith(
      expect.any(Date),
      tx,
    );
    expect(generateWarrantyCodeUseCase.execute).toHaveBeenCalledWith(
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

  it('uses a manual warranty code from Excel instead of generating one', async () => {
    const tx = {
      product: {
        create: jest.fn().mockResolvedValue({ id: 'product-id' }),
        updateMany: jest.fn(),
      },
    };
    const prismaService = {
      productTemplate: {
        findUnique: jest.fn().mockResolvedValue({
          category_id: 'category-id',
          id: 'template-id',
          is_active: true,
          default_warranty_duration_months: 36,
          default_warranty_terms: null,
        }),
      },
      product: {
        findUnique: jest.fn().mockResolvedValue(null),
      },
      warranty: {
        findUnique: jest.fn().mockResolvedValue(null),
      },
      $transaction: jest.fn((callback) => callback(tx)),
    };
    const generateWarrantyCodeUseCase = { execute: jest.fn() };
    const useCase = new ConfirmProductImportUseCase(
      prismaService as never,
      { execute: jest.fn().mockResolvedValue('PRD-2026-ABCDEF') } as never,
      generateWarrantyCodeUseCase as never,
    );

    await useCase.execute({
      mode: 'upsert',
      rows: [
        {
          templateSku: 'BATTERY-PLUS',
          displayName: 'SUV Battery',
          installationPosition: 'Engine bay',
          productCode: null,
          serialNumber: 'SN-001',
          status: product_status.ACTIVE,
          warrantyCode: ' wm-2026-excel01 ',
        },
      ],
    });

    expect(generateWarrantyCodeUseCase.execute).not.toHaveBeenCalled();
    expect(tx.product.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          warranty: {
            create: expect.objectContaining({
              warranty_code: 'WM-2026-EXCEL01',
            }),
          },
        }),
      }),
    );
  });

  it('fills a missing warranty code when an existing product is imported', async () => {
    const tx = {
      product: {
        create: jest.fn(),
        update: jest.fn().mockResolvedValue({ id: 'product-id' }),
        updateMany: jest.fn(),
      },
      warranty: {
        create: jest.fn(),
        findUnique: jest.fn().mockResolvedValue({
          id: 'warranty-id',
          warranty_code: null,
        }),
        update: jest.fn(),
        upsert: jest.fn(),
      },
    };
    const prismaService = createPrismaServiceMockForExistingProduct(tx);
    const generateProductCodeUseCase = {
      execute: jest.fn(),
    };
    const generateWarrantyCodeUseCase = {
      execute: jest.fn().mockResolvedValue('WM-2026-IMPORT01'),
    };
    const useCase = new ConfirmProductImportUseCase(
      prismaService as never,
      generateProductCodeUseCase as never,
      generateWarrantyCodeUseCase as never,
    );

    const result = await useCase.execute({
      mode: 'upsert',
      rows: [existingProductImportRow],
    });

    expect(tx.warranty.findUnique).toHaveBeenCalledWith({
      where: { product_id: 'product-id' },
      select: { id: true, warranty_code: true },
    });
    expect(generateWarrantyCodeUseCase.execute).toHaveBeenCalledWith(
      expect.any(Date),
      tx,
    );
    expect(tx.warranty.update).toHaveBeenCalledWith({
      where: { id: 'warranty-id' },
      data: { warranty_code: 'WM-2026-IMPORT01' },
    });
    expect(result).toEqual({
      created: 0,
      deactivated: 0,
      errors: [],
      updated: 1,
    });
  });

  it('preserves an existing warranty code when a product is imported again', async () => {
    const tx = {
      product: {
        create: jest.fn(),
        update: jest.fn().mockResolvedValue({ id: 'product-id' }),
        updateMany: jest.fn(),
      },
      warranty: {
        create: jest.fn(),
        findUnique: jest.fn().mockResolvedValue({
          id: 'warranty-id',
          warranty_code: 'WM-2026-EXISTING',
        }),
        update: jest.fn(),
        upsert: jest.fn(),
      },
    };
    const prismaService = createPrismaServiceMockForExistingProduct(tx);
    const generateProductCodeUseCase = {
      execute: jest.fn(),
    };
    const generateWarrantyCodeUseCase = {
      execute: jest.fn(),
    };
    const useCase = new ConfirmProductImportUseCase(
      prismaService as never,
      generateProductCodeUseCase as never,
      generateWarrantyCodeUseCase as never,
    );

    await useCase.execute({
      mode: 'upsert',
      rows: [existingProductImportRow],
    });

    expect(tx.warranty.findUnique).toHaveBeenCalledWith({
      where: { product_id: 'product-id' },
      select: { id: true, warranty_code: true },
    });
    expect(generateWarrantyCodeUseCase.execute).not.toHaveBeenCalled();
    expect(tx.warranty.create).not.toHaveBeenCalled();
    expect(tx.warranty.update).not.toHaveBeenCalled();
    expect(tx.warranty.upsert).not.toHaveBeenCalled();
  });

  it('creates a coded draft warranty when an existing product has no warranty', async () => {
    const tx = {
      product: {
        create: jest.fn(),
        update: jest.fn().mockResolvedValue({ id: 'product-id' }),
        updateMany: jest.fn(),
      },
      warranty: {
        create: jest.fn(),
        findUnique: jest.fn().mockResolvedValue(null),
        update: jest.fn(),
        upsert: jest.fn(),
      },
    };
    const prismaService = createPrismaServiceMockForExistingProduct(tx);
    const generateProductCodeUseCase = {
      execute: jest.fn(),
    };
    const generateWarrantyCodeUseCase = {
      execute: jest.fn().mockResolvedValue('WM-2026-IMPORT01'),
    };
    const useCase = new ConfirmProductImportUseCase(
      prismaService as never,
      generateProductCodeUseCase as never,
      generateWarrantyCodeUseCase as never,
    );

    await useCase.execute({
      mode: 'upsert',
      rows: [existingProductImportRow],
    });

    expect(tx.warranty.create).toHaveBeenCalledWith({
      data: {
        product_id: 'product-id',
        warranty_code: 'WM-2026-IMPORT01',
        duration_months: 36,
        start_date: null,
        end_date: null,
        status: 'DRAFT',
        terms: 'Template terms',
      },
    });
    expect(tx.warranty.update).not.toHaveBeenCalled();
  });
});

const existingProductImportRow = {
  templateSku: 'BATTERY-PLUS',
  displayName: 'SUV Battery',
  installationPosition: 'Engine bay',
  productCode: 'PRD-2026-EXISTING',
  serialNumber: 'SN-EXISTING',
  status: product_status.ACTIVE,
};

function createPrismaServiceMockForExistingProduct(tx: object) {
  return {
    productTemplate: {
      findUnique: jest.fn().mockResolvedValue({
        category_id: 'category-id',
        id: 'template-id',
        is_active: true,
        default_warranty_duration_months: 36,
        default_warranty_terms: 'Template terms',
      }),
    },
    product: {
      findUnique: jest.fn().mockImplementation(({ where }) => {
        if (where.product_code) {
          return Promise.resolve({ id: 'product-id' });
        }
        if (where.serial_number) {
          return Promise.resolve({
            id: 'product-id',
            product_code: 'PRD-2026-EXISTING',
          });
        }
        return Promise.resolve(null);
      }),
    },
    $transaction: jest.fn((callback) => callback(tx)),
  };
}
