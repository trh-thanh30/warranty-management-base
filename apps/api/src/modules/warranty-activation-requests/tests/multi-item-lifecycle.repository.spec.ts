import { WarrantyActivationRequestsRepository } from '@/modules/warranty-activation-requests/repository/warranty-activation-requests.repository';
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

  it('does not complete the request when any warranty transition fails', async () => {
    const transactionRepository = createTransactionRepository();
    transactionRepository.transitionWarranty
      .mockResolvedValueOnce({ count: 1 })
      .mockRejectedValueOnce(new Error('second warranty failed'));
    const repository = createRepository(transactionRepository);
    const useCase = new ReviewWarrantyActivationRequestUseCase(
      repository as never,
      { execute: jest.fn() } as never,
    );

    await expect(
      useCase.execute('request-id', {
        status: warranty_activation_request_status.APPROVED,
      }),
    ).rejects.toThrow('second warranty failed');
    expect(transactionRepository.markItemsActivated).not.toHaveBeenCalled();
    expect(transactionRepository.completeActivation).not.toHaveBeenCalled();
  });

  it('rejects an ineligible product before changing ownership', async () => {
    const transactionRepository = createTransactionRepository();
    const request = createActivationRequest();
    request.items[0].product.status = product_status.INACTIVE;
    transactionRepository.findRequest.mockResolvedValue(request);
    const useCase = new ReviewWarrantyActivationRequestUseCase(
      createRepository(transactionRepository) as never,
      { execute: jest.fn() } as never,
    );

    await expect(
      useCase.execute('request-id', {
        status: warranty_activation_request_status.APPROVED,
      }),
    ).rejects.toMatchObject({
      details: { code: 'WARRANTY_NOT_ELIGIBLE_FOR_ACTIVATION' },
    });
    expect(transactionRepository.createOwnership).not.toHaveBeenCalled();
  });

  it('rejects customer identity conflicts before changing ownership', async () => {
    const transactionRepository = createTransactionRepository();
    transactionRepository.findCustomerByEmail.mockResolvedValue({
      id: 'different-customer-id',
      user_id: null,
    });
    const useCase = new ReviewWarrantyActivationRequestUseCase(
      createRepository(transactionRepository) as never,
      { execute: jest.fn() } as never,
    );

    await expect(
      useCase.execute('request-id', {
        status: warranty_activation_request_status.APPROVED,
      }),
    ).rejects.toMatchObject({
      details: { code: 'CUSTOMER_IDENTITY_CONFLICT' },
    });
    expect(transactionRepository.createOwnership).not.toHaveBeenCalled();
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
    const repository = new WarrantyActivationRequestsRepository({
      $transaction: jest.fn((callback: (client: typeof tx) => unknown) =>
        callback(tx),
      ),
    } as never);

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

function createItem(productId: string, warrantyId: string) {
  return {
    product_id: productId,
    warranty_id: warrantyId,
    warranty_code: `WM-${productId}`,
    product: {
      id: productId,
      status: product_status.ACTIVE as product_status,
      deleted_at: null,
      warranty: {
        id: warrantyId,
        status: warranty_status.DRAFT,
      },
    },
  };
}
