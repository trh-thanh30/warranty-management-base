import { ConfirmProductImportUseCase } from '@/modules/products/use-cases/confirm-product-import.use-case';

function importRow(overrides: Record<string, unknown> = {}) {
  return {
    productCode: 'PRD-IMPORT-001',
    displayName: 'SUV Battery',
    categoryCode: 'ACCESSORY',
    brand: 'Lexzenz',
    model: 'Battery Plus',
    modelYear: 2026,
    shortDescription: null,
    description: null,
    warrantyDurationMonths: 36,
    warrantyTerms: 'Product terms',
    installationPosition: 'Engine bay',
    serialNumber: 'SN-001',
    status: 'ACTIVE' as const,
    ...overrides,
  };
}

function setup() {
  const tx = {
    product: {
      create: jest.fn().mockResolvedValue({ id: 'product-id' }),
      update: jest.fn().mockResolvedValue({ id: 'product-id' }),
      updateMany: jest.fn().mockResolvedValue({ count: 2 }),
    },
  };
  const prisma = {
    category: {
      findFirst: jest.fn().mockResolvedValue({ id: 'category-id' }),
    },
    product: {
      findUnique: jest.fn().mockResolvedValue(null),
    },
    $transaction: jest.fn(
      async (callback: (client: typeof tx) => Promise<unknown>) => callback(tx),
    ),
  };
  const generateProductCode = {
    execute: jest.fn().mockResolvedValue('PRD-GENERATED'),
  };
  const useCase = new ConfirmProductImportUseCase(
    prisma as never,
    generateProductCode as never,
  );

  return { prisma, tx, useCase };
}

describe('ConfirmProductImportUseCase', () => {
  it('imports a product policy without pre-issuing a Warranty', async () => {
    const { tx, useCase } = setup();

    await useCase.execute({ mode: 'upsert', rows: [importRow()] });

    expect(tx.product.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        product_code: 'PRD-IMPORT-001',
        display_name: 'SUV Battery',
        category_ref: { connect: { id: 'category-id' } },
        warranty_duration_months: 36,
        warranty_method: 'REPAIR',
        warranty_terms: 'Product terms',
      }),
      select: { id: true },
    });
    const createData = tx.product.create.mock.calls[0]?.[0]?.data;
    expect(createData).not.toHaveProperty('warranty');
    expect(createData).not.toHaveProperty('warranties');
  });

  it('updates product policy without creating or updating a Warranty', async () => {
    const { prisma, tx, useCase } = setup();
    prisma.product.findUnique.mockResolvedValue({
      id: 'product-id',
      product_code: 'PRD-IMPORT-001',
    });

    await useCase.execute({ mode: 'upsert', rows: [importRow()] });

    expect(tx.product.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'product-id' },
        data: expect.objectContaining({ warranty_duration_months: 36 }),
      }),
    );
    expect(tx.product.update.mock.calls[0]?.[0]?.data).not.toHaveProperty(
      'warranty',
    );
  });

  it('deactivates products missing from replace imports', async () => {
    const { tx, useCase } = setup();

    const result = await useCase.execute({
      mode: 'replace',
      rows: [importRow()],
    });

    expect(tx.product.updateMany).toHaveBeenCalledWith({
      where: expect.objectContaining({ id: { notIn: ['product-id'] } }),
      data: { status: 'INACTIVE' },
    });
    expect(result.deactivated).toBe(2);
  });

  it('returns validation errors without opening a transaction', async () => {
    const { prisma, useCase } = setup();
    prisma.category.findFirst.mockResolvedValue(null);

    const result = await useCase.execute({
      mode: 'upsert',
      rows: [importRow()],
    });

    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'categoryCode' }),
      ]),
    );
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
});
