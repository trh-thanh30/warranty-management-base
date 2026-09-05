import { WarrantyActivationRequestsRepository } from '@/modules/warranty-activation-requests/repository/warranty-activation-requests.repository';
import { WarrantyActivationRequestQueries } from '@/modules/warranty-activation-requests/repository/warranty-activation-requests.repository.queries';
import { ReviewWarrantyActivationRequestUseCase } from '@/modules/warranty-activation-requests/use-cases/review-warranty-activation-request.use-case';
import {
  product_status,
  warranty_activation_request_status,
  warranty_status,
} from '@prisma/client';

jest.mock(
  '@/modules/warranty-activation-requests/mappers/warranty-activation-request.mapper',
  () => ({
    toWarrantyActivationRequestResponse: (request: unknown) => request,
  }),
);

describe('Multi-item activation lifecycle', () => {
  const generateCustomerCode = {
    generateCustomerCode: jest.fn().mockResolvedValue('CUS000001'),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('orchestrates every item for one customer inside the review transaction', async () => {
    const transactionRepository = createTransactionRepository();
    const activatedRequest = {
      customer_email: 'customer@example.com',
      id: 'request-id',
      items: [{ warranty_id: 'warranty-a' }, { warranty_id: 'warranty-b' }],
      status: 'ACTIVATED',
    };
    transactionRepository.completeActivation.mockResolvedValue(
      activatedRequest,
    );
    const repository = createRepository(
      transactionRepository,
      activatedRequest,
    );
    const issueCertificates = { execute: jest.fn() };
    const useCase = new ReviewWarrantyActivationRequestUseCase(
      repository as never,
      issueCertificates as never,
      generateCustomerCode as never,
    );

    await useCase.execute('request-id', {
      status: warranty_activation_request_status.APPROVED,
    });

    expect(transactionRepository.createOwnership).toHaveBeenCalledTimes(2);
    expect(transactionRepository.transitionWarranty).toHaveBeenCalledTimes(2);
    expect(transactionRepository.markItemsActivated).toHaveBeenCalledWith(
      'request-id',
      expect.any(Date),
    );
    expect(transactionRepository.completeActivation).toHaveBeenCalledWith(
      expect.objectContaining({
        activatedWarrantyId: 'warranty-a',
        customerId: 'customer-id',
        id: 'request-id',
      }),
    );
    expect(issueCertificates.execute).toHaveBeenCalledWith({
      recipientEmail: 'customer@example.com',
      requestId: 'request-id',
    });
  });

  it('creates and links one warranty for every reserved activation item', async () => {
    const transactionRepository = createTransactionRepository();
    const request = createActivationRequest();
    request.items = request.items.map((item, index) => ({
      ...item,
      activation_code_id: `activation-code-${index + 1}`,
      warranty_id: null,
      warranty_code: `WM-2026-RESERVED${index + 1}`,
      product: {
        ...item.product,
        warranty: null,
        warranty_duration_months: 24,
      },
    }));
    transactionRepository.findRequest.mockResolvedValue(request);
    transactionRepository.createWarrantyForActivation.mockImplementation(
      (input: { activationCodeId: string; warrantyCode: string }) =>
        Promise.resolve({
          duration_months: 24,
          id: `warranty-${input.activationCodeId}`,
          product: {
            deleted_at: null,
            ownerships: [
              { id: `ownership-warranty-${input.activationCodeId}` },
            ],
            status: product_status.ACTIVE,
          },
          status: warranty_status.DRAFT,
          warranty_code: input.warrantyCode,
        }),
    );
    transactionRepository.findWarrantyByIdOrThrow.mockImplementation(
      (id: string) => Promise.resolve({ id }),
    );
    const useCase = new ReviewWarrantyActivationRequestUseCase(
      createRepository(transactionRepository) as never,
      { execute: jest.fn() } as never,
      generateCustomerCode as never,
    );

    await useCase.execute('request-id', {
      status: warranty_activation_request_status.APPROVED,
    });

    expect(
      transactionRepository.createWarrantyForActivation,
    ).toHaveBeenCalledTimes(2);
    expect(transactionRepository.linkItemWarranty).toHaveBeenNthCalledWith(1, {
      itemId: 'item-product-a',
      warrantyCode: 'WM-2026-RESERVED1',
      warrantyId: 'warranty-activation-code-1',
    });
    expect(transactionRepository.linkItemWarranty).toHaveBeenNthCalledWith(2, {
      itemId: 'item-product-b',
      warrantyCode: 'WM-2026-RESERVED2',
      warrantyId: 'warranty-activation-code-2',
    });
  });

  it('uses the linked Customer even when snapshot contact matches another profile', async () => {
    const transactionRepository = createTransactionRepository();
    const request = createActivationRequest();
    request.customer_id = 'selected-customer-id';
    transactionRepository.findRequest.mockResolvedValue(request);
    transactionRepository.findCustomerById.mockResolvedValue({
      id: 'selected-customer-id',
      user_id: 'selected-user-id',
    });
    transactionRepository.findCustomerByPhone.mockResolvedValue({
      id: 'contact-match-customer-id',
      user_id: null,
    });
    const useCase = new ReviewWarrantyActivationRequestUseCase(
      createRepository(transactionRepository) as never,
      { execute: jest.fn() } as never,
      generateCustomerCode as never,
    );

    await useCase.execute('request-id', {
      status: warranty_activation_request_status.APPROVED,
    });

    expect(transactionRepository.findCustomerById).toHaveBeenCalledWith(
      'selected-customer-id',
    );
    expect(transactionRepository.findCustomerByPhone).not.toHaveBeenCalled();
    expect(transactionRepository.findCustomerByEmail).not.toHaveBeenCalled();
    expect(transactionRepository.updateCustomer).not.toHaveBeenCalled();
    expect(transactionRepository.createOwnership).toHaveBeenCalledTimes(2);
    expect(transactionRepository.createOwnership).toHaveBeenCalledWith(
      expect.objectContaining({
        customerId: 'selected-customer-id',
        ownerUserId: 'selected-user-id',
      }),
    );
    expect(transactionRepository.completeActivation).toHaveBeenCalledWith(
      expect.objectContaining({ customerId: 'selected-customer-id' }),
    );
  });

  it('keeps contact-based Customer resolution for a public request', async () => {
    const transactionRepository = createTransactionRepository();
    const useCase = new ReviewWarrantyActivationRequestUseCase(
      createRepository(transactionRepository) as never,
      { execute: jest.fn() } as never,
      generateCustomerCode as never,
    );

    await useCase.execute('request-id', {
      status: warranty_activation_request_status.APPROVED,
    });

    expect(transactionRepository.findCustomerById).not.toHaveBeenCalled();
    expect(transactionRepository.findCustomerByPhone).toHaveBeenCalledWith(
      '0901234567',
    );
    expect(transactionRepository.updateCustomer).toHaveBeenCalledWith(
      'customer-id',
      expect.objectContaining({ phone: '0901234567' }),
    );
  });

  it('delegates transaction-bound customer code generation to the shared use case', async () => {
    const transactionRepository = createTransactionRepository();
    transactionRepository.findCustomerByPhone.mockResolvedValue(null);
    transactionRepository.createCustomer.mockResolvedValue({
      id: 'new-customer-id',
      user_id: null,
    });
    const useCase = new ReviewWarrantyActivationRequestUseCase(
      createRepository(transactionRepository) as never,
      { execute: jest.fn() } as never,
      generateCustomerCode as never,
    );

    await useCase.execute('request-id', {
      status: warranty_activation_request_status.APPROVED,
    });

    expect(generateCustomerCode.generateCustomerCode).toHaveBeenCalledWith(
      transactionRepository,
    );
    expect(transactionRepository.createCustomer).toHaveBeenCalledWith(
      expect.objectContaining({ customer_code: 'CUS000001' }),
    );
  });

  it('rejects approval when the linked Customer no longer exists', async () => {
    const transactionRepository = createTransactionRepository();
    const request = createActivationRequest();
    request.customer_id = 'missing-customer-id';
    transactionRepository.findRequest.mockResolvedValue(request);
    transactionRepository.findCustomerById.mockResolvedValue(null);
    const useCase = new ReviewWarrantyActivationRequestUseCase(
      createRepository(transactionRepository) as never,
      { execute: jest.fn() } as never,
      generateCustomerCode as never,
    );

    await expect(
      useCase.execute('request-id', {
        status: warranty_activation_request_status.APPROVED,
      }),
    ).rejects.toMatchObject({
      details: {
        code: 'CUSTOMER_NOT_FOUND',
        customerId: 'missing-customer-id',
      },
    });
    expect(transactionRepository.createOwnership).not.toHaveBeenCalled();
  });

  it('does not complete the request when any warranty transition fails', async () => {
    const transactionRepository = createTransactionRepository();
    transactionRepository.transitionWarranty
      .mockResolvedValueOnce({ count: 1 })
      .mockRejectedValueOnce(new Error('second warranty failed'));
    const repository = createRepository(transactionRepository);
    const useCase = new ReviewWarrantyActivationRequestUseCase(
      repository as never,
      { execute: jest.fn() } as never,
      generateCustomerCode as never,
    );

    await expect(
      useCase.execute('request-id', {
        status: warranty_activation_request_status.APPROVED,
      }),
    ).rejects.toThrow('second warranty failed');
    expect(transactionRepository.markItemsActivated).not.toHaveBeenCalled();
    expect(transactionRepository.completeActivation).not.toHaveBeenCalled();
  });

  it('returns a clear API message when an inactive product blocks approval', async () => {
    const transactionRepository = createTransactionRepository();
    const request = createActivationRequest();
    request.items[0].product.status = product_status.INACTIVE;
    transactionRepository.findRequest.mockResolvedValue(request);
    const useCase = new ReviewWarrantyActivationRequestUseCase(
      createRepository(transactionRepository) as never,
      { execute: jest.fn() } as never,
      generateCustomerCode as never,
    );

    await expect(
      useCase.execute('request-id', {
        status: warranty_activation_request_status.APPROVED,
        locale: 'vi',
      }),
    ).rejects.toMatchObject({
      message:
        'Không thể duyệt yêu cầu vì sản phẩm "Product product-a" tại vị trí "Position product-a" đang ngừng hoạt động. Hãy chuyển sản phẩm về trạng thái hoạt động rồi thử lại hoặc từ chối yêu cầu này.',
      details: {
        code: 'WARRANTY_NOT_ELIGIBLE_FOR_ACTIVATION',
        productId: 'product-a',
        reason: 'PRODUCT_INACTIVE',
        warrantyCode: 'WM-product-a',
      },
    });
    expect(transactionRepository.createOwnership).not.toHaveBeenCalled();
  });

  it('returns a clear English API message when a deleted product blocks approval', async () => {
    const transactionRepository = createTransactionRepository();
    const request = createActivationRequest();
    request.items[0].product.deleted_at = new Date();
    transactionRepository.findRequest.mockResolvedValue(request);
    const useCase = new ReviewWarrantyActivationRequestUseCase(
      createRepository(transactionRepository) as never,
      { execute: jest.fn() } as never,
      generateCustomerCode as never,
    );

    await expect(
      useCase.execute('request-id', {
        status: warranty_activation_request_status.APPROVED,
        locale: 'en',
      }),
    ).rejects.toMatchObject({
      message:
        'The request cannot be approved because product "Product product-a" at position "Position product-a" has been soft-deleted. Restore the product and try again, or reject this request.',
      details: {
        code: 'WARRANTY_NOT_ELIGIBLE_FOR_ACTIVATION',
        productId: 'product-a',
        reason: 'PRODUCT_DELETED',
        warrantyCode: 'WM-product-a',
      },
    });
    expect(transactionRepository.createOwnership).not.toHaveBeenCalled();
  });

  it('ignores a shared email when resolving customer identity', async () => {
    const transactionRepository = createTransactionRepository();
    transactionRepository.findCustomerByEmail.mockResolvedValue({
      id: 'different-customer-id',
      user_id: null,
    });
    const useCase = new ReviewWarrantyActivationRequestUseCase(
      createRepository(transactionRepository) as never,
      { execute: jest.fn() } as never,
      generateCustomerCode as never,
    );

    await useCase.execute('request-id', {
      status: warranty_activation_request_status.APPROVED,
    });

    expect(transactionRepository.findCustomerByEmail).not.toHaveBeenCalled();
    expect(transactionRepository.updateCustomer).toHaveBeenCalledWith(
      'customer-id',
      expect.any(Object),
    );
    expect(transactionRepository.createOwnership).toHaveBeenCalled();
  });

  it('rejects the parent and all items together', async () => {
    const tx = {
      warrantyActivationRequest: {
        update: jest.fn().mockResolvedValue({ id: 'request-id' }),
      },
      warrantyActivationRequestItem: {
        updateMany: jest.fn().mockResolvedValue({ count: 2 }),
      },
    };
    const repository = new WarrantyActivationRequestsRepository(
      {
        $transaction: jest.fn((callback: (client: typeof tx) => unknown) =>
          callback(tx),
        ),
      } as never,
      new WarrantyActivationRequestQueries(),
    );

    await repository.review({
      id: 'request-id',
      rejectionReason: 'Invalid data',
      status: warranty_activation_request_status.REJECTED,
    });

    expect(tx.warrantyActivationRequestItem.updateMany).toHaveBeenCalledWith({
      where: { request_id: 'request-id' },
      data: { status: warranty_activation_request_status.REJECTED },
    });
    expect(tx.warrantyActivationRequest.update).toHaveBeenCalled();
  });
});

function createRepository(
  transactionRepository: ReturnType<typeof createTransactionRepository>,
  refreshedRequest: unknown = null,
) {
  return {
    findById: jest
      .fn()
      .mockResolvedValueOnce({
        id: 'request-id',
        status: warranty_activation_request_status.PENDING,
      })
      .mockResolvedValueOnce(refreshedRequest),
    review: jest.fn(),
    withReviewTransaction: jest.fn(
      (work: (repository: typeof transactionRepository) => unknown) =>
        work(transactionRepository),
    ),
  };
}

function createTransactionRepository() {
  const request = createActivationRequest();

  return {
    closeCurrentOwnerships: jest.fn(),
    completeActivation: jest.fn().mockResolvedValue(request),
    createCustomer: jest.fn(),
    createOwnership: jest.fn(),
    createWarrantyForActivation: jest.fn(),
    findCustomerById: jest.fn(),
    findCustomerByEmail: jest.fn().mockResolvedValue(null),
    findCustomerByPhone: jest.fn().mockResolvedValue({
      id: 'customer-id',
      user_id: null,
    }),
    findLastCustomerCode: jest.fn(),
    findLegacyProduct: jest.fn(),
    findRequest: jest.fn().mockResolvedValue(request),
    findWarrantyByIdOrThrow: jest
      .fn()
      .mockImplementation((id: string) => Promise.resolve({ id })),
    findWarrantyForActivation: jest.fn().mockImplementation((id: string) =>
      Promise.resolve({
        duration_months: 24,
        id,
        product: { ownerships: [{ id: `ownership-${id}` }] },
        status: warranty_status.DRAFT,
        warranty_code: `WM-${id}`,
      }),
    ),
    linkItemWarranty: jest.fn(),
    markActivationCodesActivated: jest
      .fn()
      .mockImplementation((ids: string[]) =>
        Promise.resolve({ count: ids.length }),
      ),
    markItemsActivated: jest.fn(),
    markOwnershipActivated: jest.fn(),
    transitionWarranty: jest.fn().mockResolvedValue({ count: 1 }),
    updateCustomer: jest.fn().mockResolvedValue({
      id: 'customer-id',
      user_id: null,
    }),
  };
}

function createActivationRequest() {
  return {
    activated_warranty_id: null,
    customer_id: null as string | null,
    customer_email: 'customer@example.com',
    customer_name: 'Nguyen Van A',
    customer_phone: '0901234567',
    full_address: '1 Nguyen Trai',
    id: 'request-id',
    items: [
      createItem('product-a', 'warranty-a'),
      createItem('product-b', 'warranty-b'),
    ],
    warranty_code: 'WM-LEGACY',
  };
}

function createItem(
  productId: string,
  warrantyId: string,
  deletedAt: Date | null = null,
): {
  activation_code_id: string | null;
  id: string;
  position_label: string;
  product_id: string;
  product_name: string;
  warranty_code: string;
  warranty_id: string | null;
  product: {
    deleted_at: Date | null;
    id: string;
    status: product_status;
    warranty: { id: string; status: warranty_status } | null;
    warranty_duration_months?: number;
  };
} {
  return {
    activation_code_id: null,
    id: `item-${productId}`,
    position_label: `Position ${productId}`,
    product_id: productId,
    product_name: `Product ${productId}`,
    warranty_id: warrantyId,
    warranty_code: `WM-${productId}`,
    product: {
      id: productId,
      status: product_status.ACTIVE,
      deleted_at: deletedAt,
      warranty: {
        id: warrantyId,
        status: warranty_status.DRAFT,
      },
    },
  };
}
