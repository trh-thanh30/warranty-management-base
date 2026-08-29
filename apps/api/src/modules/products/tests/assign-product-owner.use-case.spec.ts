import { AssignProductOwnerUseCase } from '@/modules/products/use-cases/assign-product-owner.use-case';

jest.mock('@/modules/assets/assets.service', () => ({
  AssetsService: class AssetsService {},
}));

describe('AssignProductOwnerUseCase', () => {
  it('generates and stores a warranty code when assigning the first owner', async () => {
    const context = createContext();

    await context.useCase.execute('product-id', {
      autoGenerateWarrantyCode: true,
      customerId: 'customer-id',
    });

    expect(context.generateWarrantyCode.execute).toHaveBeenCalledTimes(1);
    expect(context.tx.product.update).not.toHaveBeenCalled();
    expect(context.tx.warranty.update).toHaveBeenCalledWith({
      where: { id: 'warranty-id' },
      data: { warranty_code: 'WM-2026-GENERATED' },
    });
    expect(context.tx.productOwnership.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          customer_id: 'customer-id',
          owner_user_id: null,
          is_current_owner: true,
        }),
      }),
    );
  });

  it('normalizes and stores a manually entered warranty code', async () => {
    const context = createContext();

    await context.useCase.execute('product-id', {
      autoGenerateWarrantyCode: false,
      customerId: 'customer-id',
      warrantyCode: ' wm-2026-manual1 ',
    });

    expect(context.generateWarrantyCode.execute).not.toHaveBeenCalled();
    expect(context.productsRepository.findByWarrantyCode).toHaveBeenCalledWith(
      'WM-2026-MANUAL1',
    );
    expect(context.tx.warranty.update).toHaveBeenCalledWith({
      where: { id: 'warranty-id' },
      data: { warranty_code: 'WM-2026-MANUAL1' },
    });
  });

  it('rejects a manually entered warranty code owned by another product', async () => {
    const context = createContext();
    context.productsRepository.findByWarrantyCode.mockResolvedValue({
      id: 'another-product-id',
    });

    await expect(
      context.useCase.execute('product-id', {
        autoGenerateWarrantyCode: false,
        customerId: 'customer-id',
        warrantyCode: 'WM-2026-DUPLICATE',
      }),
    ).rejects.toThrow('Warranty code already exists');

    expect(context.prismaService.$transaction).not.toHaveBeenCalled();
  });

  it('preserves the warranty code when transferring ownership', async () => {
    const context = createContext({
      ownerUserId: 'owner-user-id',
      warrantyCode: 'WM-2026-EXISTING',
    });

    await context.useCase.execute('product-id', {
      autoGenerateWarrantyCode: false,
      customerId: 'customer-id',
      purchaseDate: '2026-07-20',
      warrantyCode: 'WM-2026-IGNORED',
    });

    expect(context.generateWarrantyCode.execute).not.toHaveBeenCalled();
    expect(
      context.productsRepository.findByWarrantyCode,
    ).not.toHaveBeenCalled();
    expect(context.tx.product.update).not.toHaveBeenCalled();
    expect(context.tx.warranty.update).not.toHaveBeenCalled();
    expect(context.tx.productOwnership.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { product_id: 'product-id', is_current_owner: true },
      }),
    );
    expect(context.tx.productOwnership.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          owner_user_id: 'owner-user-id',
          purchase_date: new Date('2026-07-20'),
        }),
      }),
    );
  });
});

function createContext({
  ownerUserId = null,
  warrantyCode = null,
}: {
  ownerUserId?: string | null;
  warrantyCode?: string | null;
} = {}) {
  const resolvedWarrantyCode = warrantyCode ?? 'WM-2026-GENERATED';
  const productResponse = {
    id: 'product-id',
    product_code: 'PRD-2026-ABC',
    display_name: null,
    serial_number: null,
    template: {
      id: 'template-id',
      name: 'Toyota Camry',
      brand: 'Toyota',
      model: 'Camry',
    },
    status: 'ACTIVE',
    metadata: null,
    created_at: new Date('2026-07-21T00:00:00.000Z'),
    updated_at: new Date('2026-07-21T00:00:00.000Z'),
    deleted_at: null,
    assets: [],
    ownerships: [],
    warranty: {
      id: 'warranty-id',
      product_id: 'product-id',
      warranty_code: resolvedWarrantyCode,
      start_date: null,
      end_date: null,
      duration_months: 36,
      status: 'DRAFT',
      terms: null,
      metadata: null,
      created_at: new Date('2026-07-21T00:00:00.000Z'),
      updated_at: new Date('2026-07-21T00:00:00.000Z'),
    },
  };
  const tx = {
    product: {
      update: jest.fn().mockResolvedValue({ id: 'product-id' }),
      findUniqueOrThrow: jest.fn().mockResolvedValue(productResponse),
    },
    productOwnership: {
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      create: jest.fn().mockResolvedValue({ id: 'ownership-id' }),
    },
    warranty: {
      update: jest.fn().mockResolvedValue({ id: 'warranty-id' }),
    },
  };
  const prismaService = {
    product: {
      findUnique: jest.fn().mockResolvedValue({
        id: 'product-id',
        deleted_at: null,
        warranty: { id: 'warranty-id', warranty_code: warrantyCode },
      }),
    },
    customer: {
      findUnique: jest.fn().mockResolvedValue({
        id: 'customer-id',
        user_id: ownerUserId,
      }),
    },
    $transaction: jest.fn((callback) => callback(tx)),
  };
  const productsRepository = {
    findByWarrantyCode: jest.fn().mockResolvedValue(null),
  };
  const generateWarrantyCode = {
    execute: jest.fn().mockResolvedValue('WM-2026-GENERATED'),
  };

  return {
    generateWarrantyCode,
    prismaService,
    productsRepository,
    tx,
    useCase: new AssignProductOwnerUseCase(
      prismaService as never,
      productsRepository as never,
      generateWarrantyCode as never,
    ),
  };
}
