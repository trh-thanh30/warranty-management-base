import { ConflictError } from '@/common/response';
import { ManualWarrantyActivationUseCase } from '@/modules/warranties/use-cases/manual-warranty-activation.use-case';
import { warranty_status } from '@prisma/client';

describe('ManualWarrantyActivationUseCase', () => {
  const dto = {
    customer: {
      fullName: 'Nguyen Van A',
      phone: '0901234567',
      email: 'customer@example.com',
      address: '1 Nguyen Van Linh, Da Nang',
    },
    product: {
      categoryId: 'category-id',
      name: 'Black Label Ceramic Film',
      brand: 'Black Label',
      model: 'Premium',
      displayName: 'Film xe Nguyen Van A',
    },
    warranty: {
      activatedAt: '2026-07-19T00:00:00.000Z',
      durationMonths: 36,
      purchaseDate: '2026-07-18T00:00:00.000Z',
      warrantyCode: 'WM-2026-MANUAL1',
      terms: 'Valid at authorized service centers.',
    },
  };

  function createDependencies(overrides?: {
    customerByEmail?: unknown;
    customerByPhone?: unknown;
    existingProduct?: unknown;
    existingWarranty?: unknown;
  }) {
    const customer = {
      id: 'customer-id',
      userId: null,
      customerCode: 'CUS000001',
      fullName: dto.customer.fullName,
      phone: dto.customer.phone,
      email: dto.customer.email,
      address: dto.customer.address,
    };
    const warranty = {
      id: 'warranty-id',
      productId: 'product-id',
      warrantyCode: dto.warranty.warrantyCode,
      startDate: new Date(dto.warranty.activatedAt),
      endDate: new Date('2029-07-19T00:00:00.000Z'),
      durationMonths: dto.warranty.durationMonths,
      status: warranty_status.ACTIVE,
      terms: dto.warranty.terms,
      metadata: {
        source: 'manual_warranty_activation',
        certificateEmailStatus: 'PENDING_TEMPLATE',
      },
      activatedById: null,
      coverageLimitAmount: null,
      maxAmountPerClaim: null,
      maxClaimCount: null,
      voidedAt: null,
      voidedById: null,
      voidReason: null,
      createdAt: new Date('2026-07-19T00:00:00.000Z'),
      updatedAt: new Date('2026-07-19T00:00:00.000Z'),
    };
    const product = {
      id: 'product-id',
      productCode: 'PRD-2026-ABCDEF',
      serialNumber: null,
      displayName: dto.product.displayName,
      status: 'ACTIVE',
      metadata: { source: 'manual_warranty_activation' },
      deletedAt: null,
      catalogue: {
        name: 'Black Label Ceramic Film',
        brand: 'Black Label',
        model: 'Premium',
      },
      ownerships: [
        {
          isCurrentOwner: true,
          customer,
        },
      ],
      warranty,
    };
    const transactionRepository = {
      closeCurrentOwnerships: jest.fn(),
      createCustomer: jest.fn().mockResolvedValue(customer),
      createManualActivationProduct: jest.fn().mockResolvedValue(product),
      findCustomerByEmail: jest
        .fn()
        .mockResolvedValue(overrides?.customerByEmail ?? null),
      findCustomerById: jest.fn().mockResolvedValue(customer),
      findCustomersByPhone: jest
        .fn()
        .mockResolvedValue(
          overrides?.customerByPhone ? [overrides.customerByPhone] : [],
        ),
      findManualActivationProduct: jest
        .fn()
        .mockResolvedValue(overrides?.existingProduct ?? null),
      isActiveProductCategory: jest.fn().mockResolvedValue(true),
      findWarrantyByCode: jest
        .fn()
        .mockResolvedValue(overrides?.existingWarranty ?? null),
      updateCustomer: jest.fn().mockResolvedValue(customer),
      updateManualActivationProduct: jest.fn().mockResolvedValue(product),
    };
    const warrantiesRepository = {
      withTransaction: jest.fn(async (operation) =>
        operation(transactionRepository),
      ),
    };
    const codeGenerators = {
      customer: { execute: jest.fn().mockResolvedValue('CUS000001') },
      product: { execute: jest.fn().mockResolvedValue('PRD-2026-ABCDEF') },
      warranty: { execute: jest.fn().mockResolvedValue('WM-2026-ABCDEF') },
    };
    const lifecycleService = {
      activateDraftWarranty: jest.fn().mockResolvedValue(warranty),
    };
    const certificateUseCase = {
      execute: jest.fn().mockResolvedValue({ id: 'certificate-id' }),
    };
    const useCase = new ManualWarrantyActivationUseCase(
      warrantiesRepository as never,
      lifecycleService as never,
      codeGenerators.customer as never,
      codeGenerators.product as never,
      codeGenerators.warranty as never,
      certificateUseCase as never,
    );

    return {
      certificateUseCase,
      codeGenerators,
      lifecycleService,
      product,
      transactionRepository,
      useCase,
      warrantiesRepository,
    };
  }

  it('creates customer, warranty ownership, and active warranty manually', async () => {
    const dependencies = createDependencies();

    const result = await dependencies.useCase.execute(dto);

    expect(
      dependencies.transactionRepository.createCustomer,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        customerCode: 'CUS000001',
        email: dto.customer.email,
        fullName: dto.customer.fullName,
      }),
    );
    expect(
      dependencies.transactionRepository.createManualActivationProduct,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        categoryId: 'category-id',
        customerId: 'customer-id',
        productCode: 'PRD-2026-ABCDEF',
        name: 'Black Label Ceramic Film',
        warrantyCode: dto.warranty.warrantyCode,
      }),
    );
    expect(
      dependencies.lifecycleService.activateDraftWarranty,
    ).toHaveBeenCalledWith(dependencies.transactionRepository, {
      activatedByUserId: undefined,
      startDate: new Date(dto.warranty.activatedAt),
      warrantyId: 'warranty-id',
    });
    expect(dependencies.codeGenerators.customer.execute).toHaveBeenCalledWith();
    expect(dependencies.codeGenerators.product.execute).toHaveBeenCalledWith(
      expect.any(Date),
    );
    expect(dependencies.codeGenerators.warranty.execute).not.toHaveBeenCalled();
    expect(dependencies.certificateUseCase.execute).toHaveBeenCalledWith({
      recipientEmail: dto.customer.email,
      warrantyId: 'warranty-id',
    });
    expect(
      dependencies.warrantiesRepository.withTransaction.mock
        .invocationCallOrder[0],
    ).toBeLessThan(
      dependencies.certificateUseCase.execute.mock.invocationCallOrder[0],
    );
    expect(result.warranty.status).toBe(warranty_status.ACTIVE);
    expect(result.customer.customerCode).toBe('CUS000001');
  });

  it('does not use a shared email as customer identity', async () => {
    const dependencies = createDependencies({
      customerByEmail: {
        id: 'customer-id',
        userId: null,
        customerCode: 'CUS000010',
      },
    });

    await dependencies.useCase.execute(dto);

    expect(
      dependencies.transactionRepository.findCustomerByEmail,
    ).not.toHaveBeenCalled();
    expect(
      dependencies.transactionRepository.createCustomer,
    ).toHaveBeenCalled();
  });

  it('uses phone identity even when the email is shared by another customer', async () => {
    const dependencies = createDependencies({
      customerByEmail: { id: 'customer-a' },
      customerByPhone: { id: 'customer-b' },
    });

    await dependencies.useCase.execute(dto);

    expect(
      dependencies.transactionRepository.updateCustomer,
    ).toHaveBeenCalledWith('customer-b', expect.any(Object));
    expect(
      dependencies.transactionRepository.findCustomerByEmail,
    ).not.toHaveBeenCalled();
  });

  it('rejects a warranty code owned by another product', async () => {
    const dependencies = createDependencies({
      existingWarranty: { productId: 'another-product' },
    });

    await expect(dependencies.useCase.execute(dto)).rejects.toBeInstanceOf(
      ConflictError,
    );
    expect(
      dependencies.transactionRepository.createManualActivationProduct,
    ).not.toHaveBeenCalled();
  });

  it('rejects an inactive or non-product category for a new product', async () => {
    const dependencies = createDependencies();
    dependencies.transactionRepository.isActiveProductCategory.mockResolvedValue(
      false,
    );

    await expect(dependencies.useCase.execute(dto)).rejects.toMatchObject({
      details: { code: 'PRODUCT_CATEGORY_NOT_ELIGIBLE' },
    });
    expect(
      dependencies.transactionRepository.createManualActivationProduct,
    ).not.toHaveBeenCalled();
  });

  it('updates an eligible existing product inside the same transaction', async () => {
    const existingProduct = {
      ...createDependencies().product,
      warranty: {
        ...createDependencies().product.warranty,
        status: warranty_status.DRAFT,
      },
    };
    const dependencies = createDependencies({ existingProduct });
    const existingProductDto = {
      ...dto,
      product: { ...dto.product, id: 'product-id' },
    };

    await dependencies.useCase.execute(existingProductDto);

    expect(
      dependencies.transactionRepository.closeCurrentOwnerships,
    ).not.toHaveBeenCalled();
    expect(
      dependencies.transactionRepository.updateManualActivationProduct,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        productId: 'product-id',
        warrantyCode: dto.warranty.warrantyCode,
      }),
    );
    expect(dependencies.codeGenerators.product.execute).not.toHaveBeenCalled();
  });
});
