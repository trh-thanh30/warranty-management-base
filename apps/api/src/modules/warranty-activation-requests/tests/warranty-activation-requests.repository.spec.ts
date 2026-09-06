import { WarrantyActivationRequestsRepository } from '@/modules/warranty-activation-requests/repository/warranty-activation-requests.repository';
import { WarrantyActivationRequestQueries } from '@/modules/warranty-activation-requests/repository/warranty-activation-requests.repository.queries';
import { CreateWarrantyActivationRequestCommand } from '@/modules/warranty-activation-requests/warranty-activation-requests.types';
import { Prisma, warranty_activation_request_status } from '@prisma/client';
import {
  WarrantyActivationRequestCodeConflictError,
  WarrantyActivationRequestUniqueConflictError,
  WarrantyActivationRequestWarrantyCodeConflictError,
} from '@/modules/warranty-activation-requests/repository/warranty-activation-request-errors';

describe('WarrantyActivationRequestsRepository', () => {
  const queries = new WarrantyActivationRequestQueries();

  it('updates Customer birthdate and creates the request in one transaction', async () => {
    const updateCustomer = jest.fn().mockResolvedValue({ id: 'customer-id' });
    const createRequest = jest.fn().mockResolvedValue({ id: 'request-id' });
    const transaction = jest.fn((callback: (tx: unknown) => unknown) =>
      callback({
        customer: { update: updateCustomer },
        warrantyActivationRequest: { create: createRequest },
      }),
    );
    const repository = new WarrantyActivationRequestsRepository(
      { $transaction: transaction } as never,
      queries,
    );
    const birthdate = new Date('2005-12-11T00:00:00.000Z');

    await repository.create(createCommand('WAR-20260820-0001'), {
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
    const repository = new WarrantyActivationRequestsRepository(
      { $transaction: transaction } as never,
      queries,
    );

    await repository.create(createCommand('WAR-20260820-0002'), {
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

  it('translates Prisma unique violations into application conflict errors', async () => {
    const conflict = new Prisma.PrismaClientKnownRequestError(
      'Unique constraint failed',
      {
        clientVersion: 'test',
        code: 'P2002',
        meta: { target: ['request_code'] },
      },
    );
    const repository = new WarrantyActivationRequestsRepository(
      {
        warrantyActivationRequest: {
          create: jest.fn().mockRejectedValue(conflict),
        },
      } as never,
      queries,
    );

    await expect(
      repository.create(createCommand('WAR-duplicate')),
    ).rejects.toBeInstanceOf(WarrantyActivationRequestCodeConflictError);

    const warrantyCodeConflict = new Prisma.PrismaClientKnownRequestError(
      'Unique constraint failed',
      {
        clientVersion: 'test',
        code: 'P2002',
        meta: { target: ['warranty_code'] },
      },
    );
    const warrantyCodeRepository = new WarrantyActivationRequestsRepository(
      {
        warrantyActivationRequest: {
          create: jest.fn().mockRejectedValue(warrantyCodeConflict),
        },
      } as never,
      queries,
    );

    await expect(
      warrantyCodeRepository.create(createCommand('WAR-warranty-code')),
    ).rejects.toBeInstanceOf(
      WarrantyActivationRequestWarrantyCodeConflictError,
    );

    const otherConflict = new Prisma.PrismaClientKnownRequestError(
      'Unique constraint failed',
      {
        clientVersion: 'test',
        code: 'P2002',
        meta: { target: ['another_index'] },
      },
    );
    const otherRepository = new WarrantyActivationRequestsRepository(
      {
        warrantyActivationRequest: {
          create: jest.fn().mockRejectedValue(otherConflict),
        },
      } as never,
      queries,
    );

    await expect(
      otherRepository.create(createCommand('WAR-other')),
    ).rejects.toBeInstanceOf(WarrantyActivationRequestUniqueConflictError);
  });

  it('finds the newest pending or approved request for a product', async () => {
    const findFirst = jest.fn().mockResolvedValue(null);
    const prismaService = {
      warrantyActivationRequest: { findFirst },
    };
    const repository = new WarrantyActivationRequestsRepository(
      prismaService as never,
      queries,
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
    const repository = new WarrantyActivationRequestsRepository(
      { warrantyActivationRequest: { findMany } } as never,
      queries,
    );

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
    const repository = new WarrantyActivationRequestsRepository(
      {
        $transaction: (callback: (tx: unknown) => unknown) =>
          callback({ warrantyActivationRequest: { count, findMany } }),
      } as never,
      queries,
    );

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
    const repository = new WarrantyActivationRequestsRepository(
      {
        $transaction: (callback: (tx: unknown) => unknown) =>
          callback({ warrantyActivationRequest: { count, findMany } }),
      } as never,
      queries,
    );

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

  it('sorts activation requests by newest creation date and id by default', async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const count = jest.fn().mockResolvedValue(0);
    const repository = new WarrantyActivationRequestsRepository(
      {
        $transaction: (callback: (tx: unknown) => unknown) =>
          callback({ warrantyActivationRequest: { count, findMany } }),
      } as never,
      queries,
    );

    await repository.list({});

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
      }),
    );
  });

  it('keeps a selected sort before creation date and id tie-breakers', async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const count = jest.fn().mockResolvedValue(0);
    const repository = new WarrantyActivationRequestsRepository(
      {
        $transaction: (callback: (tx: unknown) => unknown) =>
          callback({ warrantyActivationRequest: { count, findMany } }),
      } as never,
      queries,
    );

    await repository.list({ sortBy: 'status', sortOrder: 'asc' });

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: [{ status: 'asc' }, { created_at: 'desc' }, { id: 'desc' }],
      }),
    );
  });
});

function createCommand(
  requestCode: string,
): CreateWarrantyActivationRequestCommand {
  return {
    addressDetail: '',
    brand: null,
    customerEmail: null,
    customerName: 'Customer',
    customerPhone: '0900000000',
    fullAddress: 'Ward, Province',
    items: [],
    manufactureYear: null,
    metadata: {},
    model: null,
    productId: 'product-id',
    productName: 'Product',
    provinceCode: '01',
    provinceName: 'Province',
    requestCode,
    serialNumber: null,
    source: 'PUBLIC_WEB',
    wardCode: '001',
    wardName: 'Ward',
    warrantyCode: 'WM-001',
    warrantyDurationMonths: 12,
  };
}
