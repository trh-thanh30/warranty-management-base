import { normalizePagination, paginate } from '@/common/pagination/pagination';
import { BadRequestError } from '@/common/response';
import { PrismaService } from '@/database/prisma/prisma.service';
import { GenerateCustomerCodeUseCase } from '@/modules/customers/use-cases/generate-customer-code.use-case';
import { ListWarrantyActivationRequestsDto } from '@/modules/warranty-activation-requests/dto/list-warranty-activation-requests.dto';
import { OPEN_WARRANTY_ACTIVATION_REQUEST_STATUSES } from '@/modules/warranty-activation-requests/warranty-activation-requests.constants';
import { WarrantyLifecycleService } from '@/modules/warranties/services/warranty-lifecycle.service';
import { Injectable } from '@nestjs/common';
import {
  Prisma,
  warranty_activation_request_status,
  warranty_status,
} from '@prisma/client';

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
  reviewed_by: {
    select: {
      id: true,
      email: true,
      full_name: true,
      username: true,
    },
  },
  activated_warranty: {
    include: {
      certificates: {
        orderBy: { created_at: 'desc' as const },
        take: 1,
      },
    },
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
  const where: Prisma.WarrantyActivationRequestWhereInput = {
    status: filters.status,
    warranty_code: warrantyCode,
    created_at: hasCreatedAtFilter ? createdAtFilter : undefined,
    OR: search
      ? [
          { request_code: { contains: search, mode: 'insensitive' } },
          { warranty_code: { contains: search, mode: 'insensitive' } },
          { customer_name: { contains: search, mode: 'insensitive' } },
          { customer_phone: { contains: search, mode: 'insensitive' } },
          { customer_email: { contains: search, mode: 'insensitive' } },
          { product_name: { contains: search, mode: 'insensitive' } },
          { serial_number: { contains: search, mode: 'insensitive' } },
        ]
      : undefined,
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

@Injectable()
export class WarrantyActivationRequestsRepository {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly warrantyLifecycleService: WarrantyLifecycleService,
    private readonly generateCustomerCodeUseCase: GenerateCustomerCodeUseCase,
  ) {}

  create(data: Prisma.WarrantyActivationRequestCreateInput) {
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
        product_id: productId,
        status: {
          in: OPEN_WARRANTY_ACTIVATION_REQUEST_STATUSES,
        },
      },
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        request_code: true,
        status: true,
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
    return this.prismaService.warrantyActivationRequest.update({
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
  }

  activateApprovedRequest(input: {
    id: string;
    adminNote?: string;
    reviewedById?: string;
  }) {
    const reviewedAt = new Date();

    return this.prismaService.$transaction(async (tx) => {
      const request = await tx.warrantyActivationRequest.findUnique({
        where: { id: input.id },
        include: { activated_warranty: true },
      });

      if (!request) {
        return null;
      }

      if (request.activated_warranty_id) {
        throw new BadRequestError(
          'Warranty activation request already activated',
          'BAD_REQUEST',
          { code: 'ACTIVATION_REQUEST_ALREADY_ACTIVATED' },
        );
      }

      const product = await tx.product.findFirst({
        where: {
          warranty: { warranty_code: request.warranty_code },
        },
        include: { warranty: true },
      });

      if (!product?.warranty) {
        return null;
      }

      if (product.warranty.status !== warranty_status.DRAFT) {
        throw new BadRequestError(
          'Warranty code is not eligible for activation',
          'BAD_REQUEST',
          {
            code: 'WARRANTY_NOT_ELIGIBLE_FOR_ACTIVATION',
            currentStatus: product.warranty.status,
            expectedStatuses: [warranty_status.DRAFT],
            warrantyCode: request.warranty_code,
          },
        );
      }

      const customer = await this.resolveActivationCustomer(tx, {
        address: request.full_address,
        email: request.customer_email,
        fullName: request.customer_name,
        phone: request.customer_phone,
      });
      await tx.productOwnership.updateMany({
        where: {
          product_id: product.id,
          is_current_owner: true,
        },
        data: {
          ended_at: reviewedAt,
          is_current_owner: false,
        },
      });

      await tx.productOwnership.create({
        data: {
          activated_at: null,
          customer: { connect: { id: customer.id } },
          is_current_owner: true,
          owner_user: customer.user_id
            ? { connect: { id: customer.user_id } }
            : undefined,
          product: { connect: { id: product.id } },
          purchase_date: reviewedAt,
        },
      });

      const updatedWarranty =
        await this.warrantyLifecycleService.activateDraftWarranty(tx, {
          activatedByUserId: input.reviewedById,
          startDate: reviewedAt,
          warrantyId: product.warranty.id,
        });

      return tx.warrantyActivationRequest.update({
        where: { id: input.id },
        data: {
          activated_warranty: { connect: { id: updatedWarranty.id } },
          admin_note: input.adminNote,
          customer: { connect: { id: customer.id } },
          reviewed_at: reviewedAt,
          reviewed_by: input.reviewedById
            ? { connect: { id: input.reviewedById } }
            : undefined,
          status: warranty_activation_request_status.ACTIVATED,
        },
        include: activationRequestInclude,
      });
    });
  }

  private async resolveActivationCustomer(
    tx: Prisma.TransactionClient,
    input: {
      address: string;
      email: string | null;
      fullName: string;
      phone: string;
    },
  ) {
    const [phoneCustomer, emailCustomer] = await Promise.all([
      tx.customer.findUnique({ where: { phone: input.phone } }),
      input.email
        ? tx.customer.findUnique({ where: { email: input.email } })
        : Promise.resolve(null),
    ]);

    const existingCustomer = phoneCustomer ?? emailCustomer;
    if (
      phoneCustomer &&
      emailCustomer &&
      phoneCustomer.id !== emailCustomer.id
    ) {
      throw new BadRequestError(
        'Customer email and phone belong to different customer profiles',
        'BAD_REQUEST',
        { code: 'CUSTOMER_IDENTITY_CONFLICT' },
      );
    }

    if (existingCustomer) {
      return tx.customer.update({
        where: { id: existingCustomer.id },
        data: {
          address: input.address,
          email: input.email,
          full_name: input.fullName,
          phone: input.phone,
        },
      });
    }

    return tx.customer.create({
      data: {
        address: input.address,
        customer_code: await this.generateCustomerCodeUseCase.execute(tx),
        email: input.email,
        full_name: input.fullName,
        phone: input.phone,
      },
    });
  }
}
