import { WarrantyActivationRequestsRepository } from '@/modules/warranty-activation-requests/repository/warranty-activation-requests.repository';
import {
  product_status,
  warranty_activation_request_status,
  warranty_status,
} from '@prisma/client';

describe('WarrantyActivationRequestsRepository multi-item lifecycle', () => {
  it('activates every item for one customer in a single transaction', async () => {
    const tx = createTransactionClient();
    const lifecycle = {
      activateDraftWarranty: jest
        .fn()
        .mockImplementation((_tx, input: { warrantyId: string }) =>
          Promise.resolve({ id: input.warrantyId }),
        ),
    };
    const repository = new WarrantyActivationRequestsRepository(
      {
        $transaction: jest.fn((callback: (client: typeof tx) => unknown) =>
          callback(tx),
        ),
      } as never,
      lifecycle as never,
      { execute: jest.fn() } as never,
    );

    await repository.activateApprovedRequest({
      id: 'request-id',
      reviewedById: 'admin-id',
    });

    expect(lifecycle.activateDraftWarranty).toHaveBeenCalledTimes(2);
    expect(tx.productOwnership.create).toHaveBeenCalledTimes(2);
    expect(tx.productOwnership.create).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        data: expect.objectContaining({
          customer: { connect: { id: 'customer-id' } },
          product: { connect: { id: 'product-a' } },
        }),
      }),
    );
    expect(tx.warrantyActivationRequestItem.updateMany).toHaveBeenCalledWith({
      where: { request_id: 'request-id' },
      data: {
        activated_at: expect.any(Date),
        status: warranty_activation_request_status.ACTIVATED,
      },
    });
    expect(tx.warrantyActivationRequest.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          activated_warranty: { connect: { id: 'warranty-a' } },
          status: warranty_activation_request_status.ACTIVATED,
        }),
      }),
    );
  });

  it('does not update parent or items when any warranty activation fails', async () => {
    const tx = createTransactionClient();
    const lifecycle = {
      activateDraftWarranty: jest
        .fn()
        .mockResolvedValueOnce({ id: 'warranty-a' })
        .mockRejectedValueOnce(new Error('second warranty failed')),
    };
    const repository = new WarrantyActivationRequestsRepository(
      {
        $transaction: jest.fn((callback: (client: typeof tx) => unknown) =>
          callback(tx),
        ),
      } as never,
      lifecycle as never,
      { execute: jest.fn() } as never,
    );

    await expect(
      repository.activateApprovedRequest({ id: 'request-id' }),
    ).rejects.toThrow('second warranty failed');
    expect(tx.warrantyActivationRequestItem.updateMany).not.toHaveBeenCalled();
    expect(tx.warrantyActivationRequest.update).not.toHaveBeenCalled();
  });

  it('rejects the parent and all items together', async () => {
    const tx = createTransactionClient();
    const repository = new WarrantyActivationRequestsRepository(
      {
        $transaction: jest.fn((callback: (client: typeof tx) => unknown) =>
          callback(tx),
        ),
      } as never,
      {} as never,
      {} as never,
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

function createTransactionClient() {
  const request = {
    id: 'request-id',
    activated_warranty_id: null,
    customer_email: 'customer@example.com',
    customer_name: 'Nguyen Van A',
    customer_phone: '0901234567',
    full_address: '1 Nguyen Trai',
    items: [
      createItem('product-a', 'warranty-a'),
      createItem('product-b', 'warranty-b'),
    ],
  };

  return {
    customer: {
      findUnique: jest
        .fn()
        .mockResolvedValueOnce({ id: 'customer-id', user_id: null })
        .mockResolvedValueOnce(null),
      update: jest.fn().mockResolvedValue({ id: 'customer-id', user_id: null }),
      create: jest.fn(),
    },
    productOwnership: {
      updateMany: jest.fn().mockResolvedValue({ count: 0 }),
      create: jest.fn().mockResolvedValue({}),
    },
    warrantyActivationRequest: {
      findUnique: jest.fn().mockResolvedValue(request),
      update: jest.fn().mockResolvedValue(request),
    },
    warrantyActivationRequestItem: {
      updateMany: jest.fn().mockResolvedValue({ count: 2 }),
    },
  };
}

function createItem(productId: string, warrantyId: string) {
  return {
    product_id: productId,
    warranty_id: warrantyId,
    warranty_code: `WM-${productId}`,
    product: {
      id: productId,
      status: product_status.ACTIVE,
      deleted_at: null,
      warranty: {
        id: warrantyId,
        status: warranty_status.DRAFT,
      },
    },
  };
}
