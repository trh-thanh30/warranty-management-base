import { ActivationRequestItemsValidatorService } from '@/modules/warranty-activation-requests/service/activation-request-items-validator.service';
import { product_status, warranty_status } from '@prisma/client';

describe('ActivationRequestItemsValidatorService', () => {
  const categoriesRepository = { getActivationFields: jest.fn() };
  const productsRepository = {
    findActivationRequestTargetsByIds: jest.fn(),
    findActiveProductCategoryById: jest.fn(),
  };
  const requestsRepository = { findOpenByProductIds: jest.fn() };
  const service = new ActivationRequestItemsValidatorService(
    categoriesRepository as never,
    productsRepository as never,
    requestsRepository as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    categoriesRepository.getActivationFields.mockResolvedValue({
      categoryId: 'category-id',
      activationFormEnabled: true,
      activationFields: [
        {
          id: 'windshield-field-id',
          key: 'windshield',
          label: 'Kính lái',
          type: 'PRODUCT_SELECT',
          required: true,
          order: 0,
        },
        {
          id: 'rear-field-id',
          key: 'rearGlass',
          label: 'Kính lưng',
          type: 'PRODUCT_SELECT',
          required: false,
          order: 1,
        },
      ],
    });
    productsRepository.findActiveProductCategoryById.mockResolvedValue({
      id: 'category-id',
    });
    productsRepository.findActivationRequestTargetsByIds.mockResolvedValue([
      createProduct('product-a'),
      createProduct('product-b'),
    ]);
    requestsRepository.findOpenByProductIds.mockResolvedValue([]);
  });

  it('resolves valid items into immutable snapshots', async () => {
    await expect(
      service.validate('category-id', [
        {
          activationFieldId: 'windshield-field-id',
          positionKey: 'windshield',
          productId: 'product-a',
        },
        {
          activationFieldId: 'rear-field-id',
          positionKey: 'rearGlass',
          productId: 'product-b',
        },
      ]),
    ).resolves.toEqual([
      expect.objectContaining({
        activationFieldId: 'windshield-field-id',
        positionKey: 'windshield',
        positionLabel: 'Kính lái',
        productId: 'product-a',
        warrantyCode: 'WM-product-a',
      }),
      expect.objectContaining({ productId: 'product-b' }),
    ]);
  });

  it('rejects a missing required product position', async () => {
    await expect(
      service.validate('category-id', [
        { positionKey: 'rearGlass', productId: 'product-b' },
      ]),
    ).rejects.toMatchObject({ code: 'ACTIVATION_REQUIRED_POSITION_MISSING' });
  });

  it('rejects duplicate products across positions', async () => {
    await expect(
      service.validate('category-id', [
        { positionKey: 'windshield', productId: 'product-a' },
        { positionKey: 'rearGlass', productId: 'product-a' },
      ]),
    ).rejects.toMatchObject({ code: 'ACTIVATION_PRODUCT_DUPLICATE' });
  });

  it('rejects products from another category', async () => {
    productsRepository.findActivationRequestTargetsByIds.mockResolvedValue([
      { ...createProduct('product-a'), category_id: 'other-category' },
    ]);

    await expect(
      service.validate('category-id', [
        { positionKey: 'windshield', productId: 'product-a' },
      ]),
    ).rejects.toMatchObject({ code: 'PRODUCT_CATEGORY_MISMATCH' });
  });

  it('rejects activation requests for an inactive category', async () => {
    productsRepository.findActiveProductCategoryById.mockResolvedValue(null);

    await expect(
      service.validate('category-id', [
        { positionKey: 'windshield', productId: 'product-a' },
      ]),
    ).rejects.toMatchObject({
      code: 'NOT_FOUND',
      details: { code: 'PRODUCT_CATEGORY_NOT_FOUND' },
    });

    expect(
      productsRepository.findActivationRequestTargetsByIds,
    ).not.toHaveBeenCalled();
  });

  it('rejects a product reserved by another open request', async () => {
    requestsRepository.findOpenByProductIds.mockResolvedValue([
      {
        product_id: null,
        items: [{ product_id: 'product-a' }],
      },
    ]);

    await expect(
      service.validate('category-id', [
        { positionKey: 'windshield', productId: 'product-a' },
      ]),
    ).rejects.toMatchObject({
      code: 'ACTIVATION_REQUEST_ALREADY_OPEN',
      details: { productId: 'product-a' },
    });
  });
});

function createProduct(id: string) {
  return {
    id,
    category_id: 'category-id',
    display_name: null,
    product_code: `CODE-${id}`,
    serial_number: `SERIAL-${id}`,
    status: product_status.ACTIVE,
    template: { name: `Product ${id}` },
    warranty: {
      id: `warranty-${id}`,
      status: warranty_status.DRAFT,
      warranty_code: `WM-${id}`,
    },
  };
}
