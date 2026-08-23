import { WarrantyActivationRequestsRepository } from '@/modules/warranty-activation-requests/repository/warranty-activation-requests.repository';
import { warranty_activation_request_status } from '@prisma/client';

describe('WarrantyActivationRequestsRepository', () => {
  it('updates Customer birthdate and creates the request in one transaction', async () => {
    const updateCustomer = jest.fn().mockResolvedValue({ id: 'customer-id' });
    const createRequest = jest.fn().mockResolvedValue({ id: 'request-id' });
    const transaction = jest.fn((callback: (tx: unknown) => unknown) =>
      callback({
        customer: { update: updateCustomer },
        warrantyActivationRequest: { create: createRequest },
      }),
    );
    const repository = new WarrantyActivationRequestsRepository({
      $transaction: transaction,
    } as never);
    const birthdate = new Date('2005-12-11T00:00:00.000Z');

    await repository.create({ request_code: 'WAR-20260820-0001' } as never, {
      customerProfile: { id: 'customer-id', birthdate },
    });

    expect(updateCustomer).toHaveBeenCalledWith({
      where: { id: 'customer-id' },
      data: { birthdate },
    });
    expect(createRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          customer: { connect: { id: 'customer-id' } },
        }),
      }),
    );
  });

  it('connects the Customer without overwriting birthdate when it is omitted', async () => {
    const updateCustomer = jest.fn();
    const createRequest = jest.fn().mockResolvedValue({ id: 'request-id' });
    const transaction = jest.fn((callback: (tx: unknown) => unknown) =>
      callback({
        customer: { update: updateCustomer },
        warrantyActivationRequest: { create: createRequest },
      }),
    );
    const repository = new WarrantyActivationRequestsRepository({
      $transaction: transaction,
    } as never);

    await repository.create({ request_code: 'WAR-20260820-0002' } as never, {
      customerProfile: {
        id: 'customer-id',
        birthdate: undefined,
      },
    });

    expect(updateCustomer).not.toHaveBeenCalled();
    expect(createRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          customer: { connect: { id: 'customer-id' } },
        }),
      }),
    );
  });

  it('finds the newest pending or approved request for a product', async () => {
    const findFirst = jest.fn().mockResolvedValue(null);
    const prismaService = {
      warrantyActivationRequest: { findFirst },
    };
    const repository = new WarrantyActivationRequestsRepository(
      prismaService as never,
    );

    await repository.findOpenByProductId('product-id');

    expect(findFirst).toHaveBeenCalledWith({
      where: {
        status: {
          in: [
            warranty_activation_request_status.PENDING,
            warranty_activation_request_status.APPROVED,
          ],
        },
        OR: [
          { product_id: 'product-id' },
          {
            items: {
              some: {
                product_id: 'product-id',
                status: {
                  in: [
                    warranty_activation_request_status.PENDING,
                    warranty_activation_request_status.APPROVED,
                  ],
                },
              },
            },
          },
        ],
      },
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        request_code: true,
        status: true,
      },
    });
  });

  it('finds open reservations for multiple legacy or item products', async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const repository = new WarrantyActivationRequestsRepository({
      warrantyActivationRequest: { findMany },
    } as never);

    await repository.findOpenByProductIds(['product-a', 'product-b']);

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: [
            { product_id: { in: ['product-a', 'product-b'] } },
            expect.objectContaining({ items: expect.any(Object) }),
          ],
        }),
      }),
    );
  });

  it('searches request and related item product identifiers', async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const count = jest.fn().mockResolvedValue(0);
    const repository = new WarrantyActivationRequestsRepository({
      $transaction: (callback: (tx: unknown) => unknown) =>
        callback({ warrantyActivationRequest: { count, findMany } }),
    } as never);

    await repository.list({ search: 'SP50' });

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          AND: expect.arrayContaining([
            expect.objectContaining({
              OR: expect.arrayContaining([
                expect.objectContaining({
                  items: {
                    some: {
                      OR: expect.arrayContaining([
                        {
                          product_name: {
                            contains: 'SP50',
                            mode: 'insensitive',
                          },
                        },
                        {
                          product_code: {
                            contains: 'SP50',
                            mode: 'insensitive',
                          },
                        },
                        {
                          serial_number: {
                            contains: 'SP50',
                            mode: 'insensitive',
                          },
                        },
                        {
                          warranty_code: {
                            contains: 'SP50',
                            mode: 'insensitive',
                          },
                        },
                      ]),
                    },
                  },
                }),
              ]),
            }),
          ]),
        }),
      }),
    );
  });

  it('filters warranty codes across legacy requests and related items', async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const count = jest.fn().mockResolvedValue(0);
    const repository = new WarrantyActivationRequestsRepository({
      $transaction: (callback: (tx: unknown) => unknown) =>
        callback({ warrantyActivationRequest: { count, findMany } }),
    } as never);

    await repository.list({ warrantyCode: 'wm-sp50' });

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          AND: expect.arrayContaining([
            {
              OR: [
                { warranty_code: 'WM-SP50' },
                { items: { some: { warranty_code: 'WM-SP50' } } },
              ],
            },
          ]),
        }),
      }),
    );
  });
});
