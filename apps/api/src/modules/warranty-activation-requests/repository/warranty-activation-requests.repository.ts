import { normalizePagination, paginate } from '@/common/pagination/pagination';
import { PrismaService } from '@/database/prisma/prisma.service';
import { ListWarrantyActivationRequestsDto } from '@/modules/warranty-activation-requests/dto/list-warranty-activation-requests.dto';
import { OPEN_WARRANTY_ACTIVATION_REQUEST_STATUSES } from '@/modules/warranty-activation-requests/warranty-activation-requests.constants';
import { Injectable } from '@nestjs/common';
import { Prisma, warranty_activation_request_status } from '@prisma/client';

const activationRequestInclude = {
  created_by: {
    select: {
      id: true,
      email: true,
      full_name: true,
      username: true,
    },
  },
  customer: {
    select: {
      id: true,
      customer_code: true,
      email: true,
      full_name: true,
      phone: true,
    },
  },
  dealer: {
    select: {
      id: true,
      name: true,
      phone: true,
      address: true,
      province: true,
      district: true,
      sales_name: true,
    },
  },
  certificate: true,
  reviewed_by: {
    select: {
      id: true,
      email: true,
      full_name: true,
      username: true,
    },
  },
  activated_warranty: true,
  items: {
    orderBy: [{ created_at: 'asc' as const }, { id: 'asc' as const }],
    include: { warranty: true },
  },
} satisfies Prisma.WarrantyActivationRequestInclude;

function buildWarrantyActivationRequestListQuery(
  filters: ListWarrantyActivationRequestsDto,
) {
  const search = filters.search?.trim();
  const warrantyCode = filters.warrantyCode?.trim().toUpperCase();
  const createdAtFilter: Prisma.DateTimeFilter = {
    gte: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
    lte: filters.dateTo ? new Date(filters.dateTo) : undefined,
  };
  const hasCreatedAtFilter = Boolean(
    createdAtFilter.gte || createdAtFilter.lte,
  );
  const sortBy = getWarrantyActivationRequestSortColumn(filters.sortBy);
  const searchFilter: Prisma.WarrantyActivationRequestWhereInput | undefined =
    search
      ? {
          OR: [
            { request_code: { contains: search, mode: 'insensitive' } },
            { warranty_code: { contains: search, mode: 'insensitive' } },
            { customer_name: { contains: search, mode: 'insensitive' } },
            { customer_phone: { contains: search, mode: 'insensitive' } },
            { customer_email: { contains: search, mode: 'insensitive' } },
            { product_name: { contains: search, mode: 'insensitive' } },
            { serial_number: { contains: search, mode: 'insensitive' } },
            {
              items: {
                some: {
                  OR: [
                    { product_name: { contains: search, mode: 'insensitive' } },
                    { product_code: { contains: search, mode: 'insensitive' } },
                    {
                      serial_number: { contains: search, mode: 'insensitive' },
                    },
                    {
                      warranty_code: { contains: search, mode: 'insensitive' },
                    },
                  ],
                },
              },
            },
          ],
        }
      : undefined;
  const warrantyCodeFilter:
    | Prisma.WarrantyActivationRequestWhereInput
    | undefined = warrantyCode
    ? {
        OR: [
          { warranty_code: warrantyCode },
          { items: { some: { warranty_code: warrantyCode } } },
        ],
      }
    : undefined;
  const where: Prisma.WarrantyActivationRequestWhereInput = {
    status: filters.status,
    created_at: hasCreatedAtFilter ? createdAtFilter : undefined,
    AND: [searchFilter, warrantyCodeFilter].filter(
      (filter): filter is Prisma.WarrantyActivationRequestWhereInput =>
        Boolean(filter),
    ),
  };
  const orderBy: Prisma.WarrantyActivationRequestOrderByWithRelationInput[] =
    sortBy
      ? [{ [sortBy]: filters.sortOrder ?? 'desc' }]
      : [{ created_at: 'desc' }];

  return { orderBy, where };
}

function getWarrantyActivationRequestSortColumn(
  sortBy: string | undefined,
): keyof Prisma.WarrantyActivationRequestOrderByWithRelationInput | undefined {
  switch (sortBy) {
    case 'createdAt':
      return 'created_at';
    case 'customerName':
      return 'customer_name';
    case 'customerPhone':
      return 'customer_phone';
    case 'requestCode':
      return 'request_code';
    case 'reviewedAt':
      return 'reviewed_at';
    case 'status':
      return 'status';
    case 'updatedAt':
      return 'updated_at';
    case 'warrantyCode':
      return 'warranty_code';
    default:
      return undefined;
  }
}

type CreateWarrantyActivationRequestOptions = {
  customerProfile?: {
    id: string;
    birthdate?: Date;
  };
};

const activationReviewRequestInclude = {
  activated_warranty: true,
  items: {
    include: { product: { include: { warranty: true } } },
    orderBy: [{ created_at: 'asc' as const }, { id: 'asc' as const }],
  },
} satisfies Prisma.WarrantyActivationRequestInclude;

export class WarrantyActivationReviewTransactionRepository {
  constructor(private readonly tx: Prisma.TransactionClient) {}

  findRequest(id: string) {
    return this.tx.warrantyActivationRequest.findUnique({
      where: { id },
      include: activationReviewRequestInclude,
    });
  }

  findLegacyProduct(warrantyCode: string) {
    return this.tx.product.findFirst({
      where: { warranty: { warranty_code: warrantyCode } },
      include: { warranty: true },
    });
  }

  findCustomerByPhone(phone: string) {
    return this.tx.customer.findUnique({ where: { phone } });
  }

  findCustomerByEmail(email: string) {
    return this.tx.customer.findUnique({ where: { email } });
  }

  findLastCustomerCode(prefix: string) {
    return this.tx.customer.findFirst({
      where: { customer_code: { startsWith: prefix } },
      orderBy: { customer_code: 'desc' },
      select: { customer_code: true },
    });
  }

  updateCustomer(id: string, data: Prisma.CustomerUncheckedUpdateInput) {
    return this.tx.customer.update({ where: { id }, data });
  }

  createCustomer(data: Prisma.CustomerUncheckedCreateInput) {
    return this.tx.customer.create({ data });
  }

  closeCurrentOwnerships(productId: string, endedAt: Date) {
    return this.tx.productOwnership.updateMany({
      where: { product_id: productId, is_current_owner: true },
      data: { ended_at: endedAt, is_current_owner: false },
    });
  }

  createOwnership(input: {
    customerId: string;
    ownerUserId?: string | null;
    productId: string;
    purchaseDate: Date;
  }) {
    return this.tx.productOwnership.create({
      data: {
        activated_at: null,
        customer: { connect: { id: input.customerId } },
        is_current_owner: true,
        owner_user: input.ownerUserId
          ? { connect: { id: input.ownerUserId } }
          : undefined,
        product: { connect: { id: input.productId } },
        purchase_date: input.purchaseDate,
      },
    });
  }

  findWarrantyForActivation(warrantyId: string) {
    return this.tx.warranty.findUnique({
      where: { id: warrantyId },
      include: {
        product: {
          include: {
            ownerships: {
              where: { is_current_owner: true },
              take: 1,
            },
          },
        },
      },
    });
  }

  transitionWarranty(
    where: Prisma.WarrantyWhereInput,
    data: Prisma.WarrantyUncheckedUpdateManyInput,
  ) {
    return this.tx.warranty.updateMany({ where, data });
  }

  markOwnershipActivated(ownershipId: string, activatedAt: Date) {
    return this.tx.productOwnership.update({
      where: { id: ownershipId },
      data: { activated_at: activatedAt },
    });
  }

  findWarrantyByIdOrThrow(warrantyId: string) {
    return this.tx.warranty.findUniqueOrThrow({ where: { id: warrantyId } });
  }

  markItemsActivated(requestId: string, activatedAt: Date) {
    return this.tx.warrantyActivationRequestItem.updateMany({
      where: { request_id: requestId },
      data: {
        activated_at: activatedAt,
        status: warranty_activation_request_status.ACTIVATED,
      },
    });
  }

  completeActivation(input: {
    activatedWarrantyId: string;
    adminNote?: string;
    customerId: string;
    id: string;
    reviewedAt: Date;
    reviewedById?: string;
  }) {
    return this.tx.warrantyActivationRequest.update({
      where: { id: input.id },
      data: {
        activated_warranty: { connect: { id: input.activatedWarrantyId } },
        admin_note: input.adminNote,
        customer: { connect: { id: input.customerId } },
        reviewed_at: input.reviewedAt,
        reviewed_by: input.reviewedById
          ? { connect: { id: input.reviewedById } }
          : undefined,
        status: warranty_activation_request_status.ACTIVATED,
      },
      include: activationRequestInclude,
    });
  }
}

@Injectable()
export class WarrantyActivationRequestsRepository {
  constructor(private readonly prismaService: PrismaService) {}

  create(
    data: Prisma.WarrantyActivationRequestCreateInput,
    options: CreateWarrantyActivationRequestOptions = {},
  ) {
    const customerProfile = options.customerProfile;
    if (customerProfile) {
      return this.prismaService.$transaction(async (tx) => {
        if (customerProfile.birthdate !== undefined) {
          await tx.customer.update({
            where: { id: customerProfile.id },
            data: { birthdate: customerProfile.birthdate },
          });
        }

        return tx.warrantyActivationRequest.create({
          data: {
            ...data,
            customer: { connect: { id: customerProfile.id } },
          },
          include: activationRequestInclude,
        });
      });
    }

    return this.prismaService.warrantyActivationRequest.create({
      data,
      include: activationRequestInclude,
    });
  }

  findById(id: string) {
    return this.prismaService.warrantyActivationRequest.findUnique({
      where: { id },
      include: activationRequestInclude,
    });
  }

  findOpenByProductId(productId: string) {
    return this.prismaService.warrantyActivationRequest.findFirst({
      where: {
        status: {
          in: OPEN_WARRANTY_ACTIVATION_REQUEST_STATUSES,
        },
        OR: [
          { product_id: productId },
          {
            items: {
              some: {
                product_id: productId,
                status: { in: OPEN_WARRANTY_ACTIVATION_REQUEST_STATUSES },
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
  }

  findOpenByProductIds(productIds: string[]) {
    return this.prismaService.warrantyActivationRequest.findMany({
      where: {
        status: { in: OPEN_WARRANTY_ACTIVATION_REQUEST_STATUSES },
        OR: [
          { product_id: { in: productIds } },
          {
            items: {
              some: {
                product_id: { in: productIds },
                status: { in: OPEN_WARRANTY_ACTIVATION_REQUEST_STATUSES },
              },
            },
          },
        ],
      },
      select: {
        request_code: true,
        status: true,
        product_id: true,
        items: {
          where: { product_id: { in: productIds } },
          select: { product_id: true },
        },
      },
    });
  }

  findLastRequestCode(prefix: string) {
    return this.prismaService.warrantyActivationRequest.findFirst({
      where: {
        request_code: {
          startsWith: prefix,
        },
      },
      orderBy: { request_code: 'desc' },
      select: { request_code: true },
    });
  }

  list(filters: ListWarrantyActivationRequestsDto) {
    const { page, limit, skip, take } = normalizePagination(filters);
    const { orderBy, where } = buildWarrantyActivationRequestListQuery(filters);

    return this.prismaService.$transaction(async (tx) => {
      const [items, total] = await Promise.all([
        tx.warrantyActivationRequest.findMany({
          where,
          include: activationRequestInclude,
          orderBy,
          skip,
          take,
        }),
        tx.warrantyActivationRequest.count({ where }),
      ]);

      return paginate(items, { page, limit, total });
    });
  }

  listForExport(filters: ListWarrantyActivationRequestsDto) {
    const { orderBy, where } = buildWarrantyActivationRequestListQuery(filters);

    return this.prismaService.warrantyActivationRequest.findMany({
      where,
      include: activationRequestInclude,
      orderBy,
      take: 5000,
    });
  }

  review(input: {
    id: string;
    status:
      | typeof warranty_activation_request_status.APPROVED
      | typeof warranty_activation_request_status.REJECTED;
    adminNote?: string;
    rejectionReason?: string;
    reviewedById?: string;
  }) {
    return this.prismaService.$transaction(async (tx) => {
      await tx.warrantyActivationRequestItem.updateMany({
        where: { request_id: input.id },
        data: { status: input.status },
      });

      return tx.warrantyActivationRequest.update({
        where: { id: input.id },
        data: {
          admin_note: input.adminNote,
          rejection_reason: input.rejectionReason,
          reviewed_at: new Date(),
          reviewed_by: input.reviewedById
            ? { connect: { id: input.reviewedById } }
            : undefined,
          status: input.status,
        },
        include: activationRequestInclude,
      });
    });
  }

  withReviewTransaction<T>(
    work: (
      repository: WarrantyActivationReviewTransactionRepository,
    ) => Promise<T>,
  ) {
    return this.prismaService.$transaction((tx) =>
      work(new WarrantyActivationReviewTransactionRepository(tx)),
    );
  }
}
