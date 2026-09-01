import { addCalendarMonthsUtc } from '@/modules/activation-codes/utils/date.utils';
import { CreateActivationCodeBatchUseCase } from '@/modules/activation-codes/use-cases/create-activation-code-batch.use-case';
import { product_status, warranty_method } from '@prisma/client';

describe('CreateActivationCodeBatchUseCase', () => {
  const batchesRepository = { create: jest.fn() };
  const productsRepository = { findById: jest.fn() };
  const generator = { executeBatch: jest.fn() };
  const cryptoService = { encrypt: jest.fn(), hash: jest.fn() };
  const config = {
    minBatchQuantity: 50,
    maxBatchQuantity: 1000,
    createAttempts: 3,
  };
  const policyService = {
    get: jest.fn().mockResolvedValue({
      expiryMonths: 6,
      defaultBatchQuantity: 50,
    }),
  };
  const useCase = new CreateActivationCodeBatchUseCase(
    batchesRepository as never,
    productsRepository as never,
    generator as never,
    cryptoService as never,
    config as never,
    policyService as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers().setSystemTime(new Date('2026-08-31T10:30:00.000Z'));
  });

  afterEach(() => jest.useRealTimers());

  it('snapshots product and warranty data and returns plaintext codes', async () => {
    productsRepository.findById.mockResolvedValue({
      id: 'product-id',
      product_code: 'SKU-001',
      display_name: 'Camera hành trình',
      brand: 'Lexzenz',
      model: 'G2S',
      model_year: 2026,
      status: product_status.ACTIVE,
      deleted_at: null,
      warranty: {
        duration_months: 24,
        method: warranty_method.REPAIR_OR_REPLACEMENT,
        terms: 'Điều khoản bảo hành',
      },
    });
    const plaintextCodes = Array.from(
      { length: 50 },
      (_, index) => `SP-CODE${index + 1}`,
    );
    generator.executeBatch.mockReturnValue(plaintextCodes);
    cryptoService.hash.mockImplementation((code: string) => `hash:${code}`);
    cryptoService.encrypt.mockImplementation(
      (code: string) => `encrypted:${code}`,
    );
    batchesRepository.create.mockImplementation((input) =>
      Promise.resolve({
        id: 'batch-id',
        batch_code: input.batchCode,
        source_product_id: input.sourceProductId,
        product_sku: input.productSku,
        product_name: input.productName,
        brand: input.brand,
        model: input.model,
        model_year: input.modelYear,
        warranty_duration_months: input.warrantyDurationMonths,
        warranty_method: input.warrantyMethod,
        warranty_terms: input.warrantyTerms,
        quantity: input.quantity,
        expires_at: input.expiresAt,
        created_at: new Date(),
      }),
    );

    const result = await useCase.execute({
      sourceProductId: 'product-id',
      quantity: 50,
      createdById: 'admin-id',
    });

    expect(batchesRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        productSku: 'SKU-001',
        productName: 'Camera hành trình',
        warrantyDurationMonths: 24,
        warrantyMethod: warranty_method.REPAIR_OR_REPLACEMENT,
        expiresAt: new Date('2027-02-28T10:30:00.000Z'),
        quantity: 50,
        codes: plaintextCodes.map((code) => ({
          codeHash: `hash:${code}`,
          codeCiphertext: `encrypted:${code}`,
        })),
      }),
    );
    expect(result.codes).toEqual(plaintextCodes);
  });

  it('rejects an inactive product', async () => {
    productsRepository.findById.mockResolvedValue({
      id: 'product-id',
      status: product_status.INACTIVE,
      deleted_at: null,
      warranty: { duration_months: 24 },
    });

    await expect(
      useCase.execute({
        sourceProductId: 'product-id',
        quantity: 50,
        createdById: 'admin-id',
      }),
    ).rejects.toMatchObject({ code: 'ACTIVATION_CODE_PRODUCT_INACTIVE' });
  });

  it.each([49, 1001, 50.5])('rejects invalid quantity %s', async (quantity) => {
    await expect(
      useCase.execute({
        sourceProductId: 'product-id',
        quantity,
        createdById: 'admin-id',
      }),
    ).rejects.toMatchObject({
      code: 'ACTIVATION_CODE_BATCH_QUANTITY_INVALID',
    });
    expect(productsRepository.findById).not.toHaveBeenCalled();
  });
});

describe('addCalendarMonthsUtc', () => {
  it('clamps month-end dates', () => {
    expect(addCalendarMonthsUtc(new Date('2026-08-31T10:30:00Z'), 6)).toEqual(
      new Date('2027-02-28T10:30:00Z'),
    );
  });
});
