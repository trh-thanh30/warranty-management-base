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
      templateId: 'template-id',
      displayName: 'Film xe Nguyen Van A',
      serialNumber: 'SN-BLF-001',
    },
    warranty: {
      activatedAt: '2026-07-19T00:00:00.000Z',
      durationMonths: 36,
      purchaseDate: '2026-07-18T00:00:00.000Z',
      warrantyCode: 'WM-2026-MANUAL1',
      terms: 'Valid at authorized service centers.',
    },
  };

  function createPrismaService(overrides?: {
    customerByEmail?: unknown;
    customerByPhone?: unknown;
    existingSerial?: unknown;
    existingWarranty?: unknown;
  }) {
    const createdCustomer = {
      id: 'customer-id',
      user_id: null,
      customer_code: 'CUS000001',
      full_name: dto.customer.fullName,
      phone: dto.customer.phone,
      email: dto.customer.email,
      address: dto.customer.address,
      metadata: null,
      created_at: new Date('2026-07-19T00:00:00.000Z'),
      updated_at: new Date('2026-07-19T00:00:00.000Z'),
    };
    const createdProduct = {
      id: 'product-id',
      template_id: 'template-id',
      product_code: 'PRD-2026-ABCDEF',
      serial_number: dto.product.serialNumber,
      display_name: dto.product.displayName,
      status: 'ACTIVE',
      metadata: { source: 'manual_warranty_activation' },
      created_at: new Date('2026-07-19T00:00:00.000Z'),
      updated_at: new Date('2026-07-19T00:00:00.000Z'),
      deleted_at: null,
      template: {
        id: 'template-id',
        category_id: 'category-id',
        name: 'Black Label Ceramic Film',
        brand: 'Black Label',
        model: 'Premium',
      },
      ownerships: [
        {
          id: 'ownership-id',
          product_id: 'product-id',
          customer_id: 'customer-id',
          owner_user_id: null,
          purchase_date: new Date(dto.warranty.purchaseDate),
          activated_at: new Date(dto.warranty.activatedAt),
          ended_at: null,
          is_current_owner: true,
          created_at: new Date('2026-07-19T00:00:00.000Z'),
          updated_at: new Date('2026-07-19T00:00:00.000Z'),
          customer: createdCustomer,
        },
      ],
      warranty: {
        id: 'warranty-id',
        product_id: 'product-id',
        warranty_code: dto.warranty.warrantyCode,
        start_date: new Date(dto.warranty.activatedAt),
        end_date: new Date('2029-07-19T00:00:00.000Z'),
        duration_months: dto.warranty.durationMonths,
        status: warranty_status.ACTIVE,
        terms: dto.warranty.terms,
        metadata: {
          source: 'manual_warranty_activation',
          certificateEmailStatus: 'PENDING_TEMPLATE',
        },
        created_at: new Date('2026-07-19T00:00:00.000Z'),
        updated_at: new Date('2026-07-19T00:00:00.000Z'),
      },
    };
    const tx = {
      customer: {
        create: jest.fn().mockResolvedValue(createdCustomer),
        findFirst: jest.fn().mockResolvedValue(null),
        findUnique: jest
          .fn()
          .mockResolvedValueOnce(overrides?.customerByEmail ?? null)
          .mockResolvedValueOnce(overrides?.customerByPhone ?? null),
        update: jest.fn().mockResolvedValue(createdCustomer),
      },
      product: {
        create: jest.fn().mockResolvedValue(createdProduct),
        findUnique: jest
          .fn()
          .mockResolvedValueOnce(overrides?.existingWarranty ?? null)
          .mockResolvedValueOnce(overrides?.existingSerial ?? null)
          .mockResolvedValue(null),
      },
      productTemplate: {
        findFirst: jest.fn().mockResolvedValue({
          category_id: 'category-id',
          id: 'template-id',
          is_active: true,
        }),
      },
      warranty: {
        findUnique: jest.fn().mockResolvedValue(null),
      },
    };

    return {
      codeGenerators: {
        customer: { execute: jest.fn().mockResolvedValue('CUS000001') },
        product: { execute: jest.fn().mockResolvedValue('PRD-2026-ABCDEF') },
        warranty: { execute: jest.fn().mockResolvedValue('WM-2026-ABCDEF') },
      },
      lifecycleService: {
        activateDraftWarranty: jest
          .fn()
          .mockResolvedValue(createdProduct.warranty),
      },
      certificateUseCase: {
        execute: jest.fn().mockResolvedValue({
          certificate_number: 'CERT-2026-ABC123',
          id: 'certificate-id',
        }),
      },
      tx,
      service: {
        product: {
          findUnique: jest.fn(),
        },
        $transaction: jest.fn((callback) => callback(tx)),
      },
    };
  }

  it('creates customer, product ownership, and active warranty manually', async () => {
    const {
      certificateUseCase,
      codeGenerators,
      lifecycleService,
      service,
      tx,
    } = createPrismaService();
    const useCase = new ManualWarrantyActivationUseCase(
      service as never,
      lifecycleService as never,
      codeGenerators.customer as never,
      codeGenerators.product as never,
      codeGenerators.warranty as never,
      certificateUseCase as never,
    );

    const result = await useCase.execute(dto);

    expect(tx.customer.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        customer_code: 'CUS000001',
        full_name: dto.customer.fullName,
        phone: dto.customer.phone,
        email: dto.customer.email,
      }),
    });
    expect(tx.product.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          category_ref: { connect: { id: 'category-id' } },
          template: { connect: { id: 'template-id' } },
          display_name: dto.product.displayName,
          ownerships: {
            create: expect.objectContaining({
              customer: { connect: { id: 'customer-id' } },
              activated_at: null,
            }),
          },
          warranty: {
            create: expect.objectContaining({
              status: warranty_status.DRAFT,
              duration_months: 36,
            }),
          },
        }),
      }),
    );
    expect(lifecycleService.activateDraftWarranty).toHaveBeenCalledWith(tx, {
      activatedByUserId: undefined,
      startDate: new Date(dto.warranty.activatedAt),
      warrantyId: 'warranty-id',
    });
    expect(codeGenerators.customer.execute).toHaveBeenCalledWith(tx);
    expect(codeGenerators.product.execute).toHaveBeenCalledWith(
      expect.any(Date),
      tx,
    );
    expect(codeGenerators.warranty.execute).not.toHaveBeenCalled();
    expect(certificateUseCase.execute).toHaveBeenCalledWith({
      recipientEmail: dto.customer.email,
      warrantyId: 'warranty-id',
    });
    expect(result.warranty.status).toBe(warranty_status.ACTIVE);
    expect(result.customer.customerCode).toBe('CUS000001');
  });

  it('updates and reuses an existing customer matched by email', async () => {
    const existingCustomer = {
      id: 'customer-id',
      user_id: null,
      customer_code: 'CUS000010',
    };
    const {
      certificateUseCase,
      codeGenerators,
      lifecycleService,
      service,
      tx,
    } = createPrismaService({
      customerByEmail: existingCustomer,
    });
    const useCase = new ManualWarrantyActivationUseCase(
      service as never,
      lifecycleService as never,
      codeGenerators.customer as never,
      codeGenerators.product as never,
      codeGenerators.warranty as never,
      certificateUseCase as never,
    );

    await useCase.execute(dto);

    expect(tx.customer.create).not.toHaveBeenCalled();
    expect(tx.customer.update).toHaveBeenCalledWith({
      where: { id: 'customer-id' },
      data: expect.objectContaining({
        full_name: dto.customer.fullName,
        phone: dto.customer.phone,
        email: dto.customer.email,
      }),
    });
  });

  it('rejects when email and phone belong to different customers', async () => {
    const { certificateUseCase, codeGenerators, lifecycleService, service } =
      createPrismaService({
        customerByEmail: { id: 'customer-a' },
        customerByPhone: { id: 'customer-b' },
      });
    const useCase = new ManualWarrantyActivationUseCase(
      service as never,
      lifecycleService as never,
      codeGenerators.customer as never,
      codeGenerators.product as never,
      codeGenerators.warranty as never,
      certificateUseCase as never,
    );

    await expect(useCase.execute(dto)).rejects.toBeInstanceOf(ConflictError);
  });
});
