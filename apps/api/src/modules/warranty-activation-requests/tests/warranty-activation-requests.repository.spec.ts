import { WarrantyActivationRequestsRepository } from '@/modules/warranty-activation-requests/repository/warranty-activation-requests.repository';
import { WarrantyActivationRequestQueries } from '@/modules/warranty-activation-requests/repository/warranty-activation-requests.repository.queries';
import { CreateWarrantyActivationRequestCommand } from '@/modules/warranty-activation-requests/warranty-activation-requests.types';
import {
  activation_code_status,
  Prisma,
  warranty_activation_request_status,
} from '@prisma/client';
import {
  WarrantyActivationCodeReservationConflictError,
  WarrantyActivationRequestCodeConflictError,
  WarrantyActivationRequestUniqueConflictError,
  WarrantyActivationRequestWarrantyCodeConflictError,
} from '@/modules/warranty-activation-requests/repository/warranty-activation-request-errors';

describe('WarrantyActivationRequestsRepository', () => {
  const queries = new WarrantyActivationRequestQueries();

  it('reserves activation codes and creates the request atomically', async () => {
    const reserveCodes = jest.fn().mockResolvedValue({ count: 1 });
    const createRequest = jest.fn().mockResolvedValue({ id: 'request-id' });
    const transaction = jest.fn((callback: (tx: unknown) => unknown) =>
      callback({
        activationCode: { updateMany: reserveCodes },
        warrantyActivationRequest: { create: createRequest },
      }),
    );
    const repository = new WarrantyActivationRequestsRepository(
      { $transaction: transaction } as never,
      queries,
    );
    const command = createCommand('WAR-20260820-RESERVE');
    command.activationCodeId = 'activation-code-id';
    command.items = [
      {
        activationCodeId: 'activation-code-id',
        activationFieldId: null,
        positionKey: 'primaryProduct',
        positionLabel: 'Sản phẩm chính',
        productCode: 'PRODUCT-001',
        productId: 'product-id',
        productName: 'Product',
        serialNumber: null,
        warrantyCode: 'WM-001',
        warrantyId: null,
      },
    ];

    await repository.create(command);

    expect(reserveCodes).toHaveBeenCalledWith({
      where: {
        expires_at: { gt: expect.any(Date) },
        id: { in: ['activation-code-id'] },
        status: activation_code_status.AVAILABLE,
      },
      data: { status: activation_code_status.PENDING_APPROVAL },
    });
    expect(createRequest).toHaveBeenCalledTimes(1);
  });

  it('does not create a request when an activation code cannot be reserved', async () => {
    const createRequest = jest.fn();
    const transaction = jest.fn((callback: (tx: unknown) => unknown) =>
      callback({
        activationCode: {
          updateMany: jest.fn().mockResolvedValue({ count: 0 }),
        },
        warrantyActivationRequest: { create: createRequest },
      }),
    );
    const repository = new WarrantyActivationRequestsRepository(
      { $transaction: transaction } as never,
      queries,
    );
    const command = createCommand('WAR-20260820-CONFLICT');
    command.activationCodeId = 'activation-code-id';

    await expect(repository.create(command)).rejects.toBeInstanceOf(
      WarrantyActivationCodeReservationConflictError,
    );
    expect(createRequest).not.toHaveBeenCalled();
  });

  it('rejects the whole request when only part of a multi-code reservation succeeds', async () => {
    const createRequest = jest.fn();
    const reserveCodes = jest.fn().mockResolvedValue({ count: 1 });
    const repository = new WarrantyActivationRequestsRepository(
      {
        $transaction: jest.fn((callback: (tx: unknown) => unknown) =>
          callback({
            activationCode: { updateMany: reserveCodes },
            warrantyActivationRequest: { create: createRequest },
          }),
        ),
      } as never,
      queries,
    );
    const command = createCommand('WAR-20260820-PARTIAL');
    command.items = ['activation-code-a', 'activation-code-b'].map(
      (activationCodeId, index) => ({
        activationCodeId,
        activationFieldId: null,
        positionKey: `position${index}`,
        positionLabel: `Position ${index}`,
        productCode: `PRODUCT-${index}`,
        productId: `product-${index}`,
        productName: `Product ${index}`,
        serialNumber: null,
        warrantyCode: `WM-${index}`,
        warrantyId: null,
      }),
    );

    await expect(repository.create(command)).rejects.toMatchObject({
      activationCodeIds: ['activation-code-a', 'activation-code-b'],
    });
    expect(createRequest).not.toHaveBeenCalled();
  });

  it('updates Customer profile and creates the request in one transaction', async () => {
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
    const update = {
      address: '1 Nguyen Trai, Phuong Ben Thanh, TP Ho Chi Minh',
      birthdate,
      email: 'customer@example.com',
      fullName: 'Nguyen Van A',
      phone: '0901234567',
    };

    await repository.create(createCommand('WAR-20260820-0001'), {
      customerProfile: { id: 'customer-id', update },
    });

    expect(updateCustomer).toHaveBeenCalledWith({
      where: { id: 'customer-id' },
      data: {
        address: update.address,
        birthdate,
        email: update.email,
        full_name: update.fullName,
        phone: update.phone,
      },
    });
    expect(createRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          customer: { connect: { id: 'customer-id' } },
        }),
      }),
    );
  });

  it('connects the Customer without updating its profile by default', async () => {
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
        update: undefined,
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

  it('atomically reserves every selected activation code before creating the request', async () => {
    const reserveCodes = jest.fn().mockResolvedValue({ count: 2 });
    const createRequest = jest.fn().mockResolvedValue({ id: 'request-id' });
    const transaction = jest.fn((callback: (tx: unknown) => unknown) =>
      callback({
        activationCode: { updateMany: reserveCodes },
        warrantyActivationRequest: { create: createRequest },
      }),
    );
    const repository = new WarrantyActivationRequestsRepository(
      { $transaction: transaction } as never,
      queries,
    );
    const command = createCommand('WAR-20260820-0003');
    command.activationCodeId = 'activation-code-a';
    command.items = [
      {
        activationCodeId: 'activation-code-b',
        activationFieldId: null,
        positionKey: 'primary',
        positionLabel: 'Sản phẩm',
        productId: 'product-id',
        warrantyId: null,
        warrantyCode: 'WM-002',
        productName: 'Product',
        productCode: 'PRODUCT-001',
        serialNumber: null,
      },
    ];

    await repository.create(command);

    expect(reserveCodes).toHaveBeenCalledWith({
      where: {
        id: { in: ['activation-code-a', 'activation-code-b'] },
        status: 'AVAILABLE',
        expires_at: { gt: expect.any(Date) },
      },
      data: { status: 'PENDING_APPROVAL' },
    });
    expect(createRequest).toHaveBeenCalledTimes(1);
  });

  it('does not create a request when an activation code loses the reservation race', async () => {
    const createRequest = jest.fn();
    const transaction = jest.fn((callback: (tx: unknown) => unknown) =>
      callback({
        activationCode: {
          updateMany: jest.fn().mockResolvedValue({ count: 0 }),
        },
        warrantyActivationRequest: { create: createRequest },
      }),
    );
    const repository = new WarrantyActivationRequestsRepository(
      { $transaction: transaction } as never,
      queries,
    );
    const command = createCommand('WAR-20260820-0004');
    command.activationCodeId = 'activation-code-a';

    await expect(repository.create(command)).rejects.toBeInstanceOf(
      WarrantyActivationCodeReservationConflictError,
    );
    expect(createRequest).not.toHaveBeenCalled();
  });

  it('atomically replaces a pending request and transfers activation-code reservations', async () => {
    const guardPendingRequest = jest.fn().mockResolvedValue({ count: 1 });
    const releaseCodes = jest.fn().mockResolvedValue({ count: 1 });
    const reserveCodes = jest.fn().mockResolvedValue({ count: 1 });
    const deleteItems = jest.fn().mockResolvedValue({ count: 1 });
    const createItems = jest.fn().mockResolvedValue({ count: 1 });
    const updateRequest = jest.fn().mockResolvedValue({ id: 'request-id' });
    const updateCustomer = jest.fn().mockResolvedValue({ id: 'customer-id' });
    const findRequest = jest
      .fn()
      .mockResolvedValueOnce({
        activation_code_id: null,
        items: [{ activation_code_id: 'old-code' }],
        status: 'PENDING',
      })
      .mockResolvedValueOnce({ id: 'request-id', status: 'PENDING' });
    const transaction = jest.fn((callback: (tx: unknown) => unknown) =>
      callback({
        activationCode: {
          updateMany: jest.fn((args) => {
            const status = args.data.status;
            return status === 'AVAILABLE'
              ? releaseCodes(args)
              : reserveCodes(args);
          }),
        },
        customer: { update: updateCustomer },
        warrantyActivationRequest: {
          findUnique: findRequest,
          findUniqueOrThrow: jest
            .fn()
            .mockResolvedValue({ id: 'request-id', status: 'PENDING' }),
          update: updateRequest,
          updateMany: guardPendingRequest,
        },
        warrantyActivationRequestItem: {
          createMany: createItems,
          deleteMany: deleteItems,
        },
      }),
    );
    const repository = new WarrantyActivationRequestsRepository(
      { $transaction: transaction } as never,
      queries,
    );
    const command = createCommand('WAR-20260820-0005');
    command.items = [
      {
        activationCodeId: 'new-code',
        activationFieldId: null,
        positionKey: 'primary',
        positionLabel: 'Product',
        productId: 'product-id',
        warrantyId: null,
        warrantyCode: 'WM-NEW',
        productName: 'Product',
        productCode: 'PRODUCT-001',
        serialNumber: null,
      },
    ];

    const customerUpdate = {
      address: '1 Nguyen Trai, Phuong Ben Thanh, TP Ho Chi Minh',
      birthdate: new Date('1990-01-01T00:00:00.000Z'),
      email: 'customer@example.com',
      fullName: 'Nguyen Van A',
      phone: '0901234567',
    };
    await repository.updatePending('request-id', command, {
      customerProfile: { id: 'customer-id', update: customerUpdate },
    });

    expect(guardPendingRequest).toHaveBeenCalledWith({
      where: { id: 'request-id', status: 'PENDING' },
      data: { updated_at: expect.any(Date) },
    });
    expect(guardPendingRequest.mock.invocationCallOrder[0]).toBeLessThan(
      findRequest.mock.invocationCallOrder[0]!,
    );
    expect(releaseCodes).toHaveBeenCalledWith({
      where: { id: { in: ['old-code'] }, status: 'PENDING_APPROVAL' },
      data: { status: 'AVAILABLE' },
    });
    expect(reserveCodes).toHaveBeenCalledWith({
      where: {
        expires_at: { gt: expect.any(Date) },
        id: { in: ['new-code'] },
        status: 'AVAILABLE',
      },
      data: { status: 'PENDING_APPROVAL' },
    });
    expect(deleteItems).toHaveBeenCalledWith({
      where: { request_id: 'request-id' },
    });
    expect(createItems).toHaveBeenCalledTimes(1);
    expect(updateRequest).toHaveBeenCalledTimes(1);
    expect(updateCustomer).toHaveBeenCalledWith({
      where: { id: 'customer-id' },
      data: {
        address: customerUpdate.address,
        birthdate: customerUpdate.birthdate,
        email: customerUpdate.email,
        full_name: customerUpdate.fullName,
        phone: customerUpdate.phone,
      },
    });
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
