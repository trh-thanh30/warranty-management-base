import { normalizePagination, paginate } from '@/common/pagination/pagination';
import { BadRequestError } from '@/common/response';
import { PrismaService } from '@/database/prisma/prisma.service';
import { ListWarrantyActivationRequestsDto } from '@/modules/warranty-activation-requests/dto/list-warranty-activation-requests.dto';
import { Injectable } from '@nestjs/common';
import {
  Prisma,
  warranty_activation_request_status,
  warranty_status,
} from '@prisma/client';

const activationRequestInclude = {
  reviewed_by: {
    select: {
      id: true,
      email: true,
      full_name: true,
      username: true,
    },
  },
  activated_warranty: true,
} satisfies Prisma.WarrantyActivationRequestInclude;

@Injectable()
export class WarrantyActivationRequestsRepository {
  constructor(private readonly prismaService: PrismaService) {}

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

  findPendingDuplicate(input: { warrantyCode: string; customerPhone: string }) {
    return this.prismaService.warrantyActivationRequest.findFirst({
      where: {
        warranty_code: input.warrantyCode,
        customer_phone: input.customerPhone,
        status: warranty_activation_request_status.PENDING,
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
    const search = filters.search?.trim();
    const warrantyCode = filters.warrantyCode?.trim().toUpperCase();
    const { page, limit, skip, take } = normalizePagination(filters);
    const createdAtFilter: Prisma.DateTimeFilter = {
      gte: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
      lte: filters.dateTo ? new Date(filters.dateTo) : undefined,
    };
    const hasCreatedAtFilter = Boolean(
      createdAtFilter.gte || createdAtFilter.lte,
    );
    const sortMap = {
      createdAt: 'created_at',
      customerName: 'customer_name',
      customerPhone: 'customer_phone',
      requestCode: 'request_code',
      reviewedAt: 'reviewed_at',
      status: 'status',
      updatedAt: 'updated_at',
      warrantyCode: 'warranty_code',
    } satisfies Record<
      string,
      keyof Prisma.WarrantyActivationRequestOrderByWithRelationInput
    >;
    const sortBy = filters.sortBy ? sortMap[filters.sortBy] : undefined;
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
      });

      if (!request) {
        return null;
      }

      const product = await tx.product.findUnique({
        where: { warranty_code: request.warranty_code },
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
      const activatedAt = reviewedAt;
      const durationMonths = product.warranty.duration_months;
      const updatedWarranty = await tx.warranty.update({
        where: { id: product.warranty.id },
        data: {
          end_date: this.addMonths(activatedAt, durationMonths),
          metadata: this.mergeWarrantyMetadata(product.warranty.metadata),
          start_date: activatedAt,
          status: warranty_status.ACTIVE,
        },
      });

      await tx.productOwnership.updateMany({
        where: {
          product_id: product.id,
          is_current_owner: true,
        },
        data: {
          ended_at: activatedAt,
          is_current_owner: false,
        },
      });

      await tx.productOwnership.create({
        data: {
          activated_at: activatedAt,
          customer: { connect: { id: customer.id } },
          is_current_owner: true,
          owner_user: customer.user_id
            ? { connect: { id: customer.user_id } }
            : undefined,
          product: { connect: { id: product.id } },
          purchase_date: activatedAt,
        },
      });

      return tx.warrantyActivationRequest.update({
        where: { id: input.id },
        data: {
          activated_warranty: { connect: { id: updatedWarranty.id } },
          admin_note: input.adminNote,
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
      email: string;
      fullName: string;
      phone: string;
    },
  ) {
    const [phoneCustomer, emailCustomer] = await Promise.all([
      tx.customer.findUnique({ where: { phone: input.phone } }),
      tx.customer.findUnique({ where: { email: input.email } }),
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
        customer_code: await this.generateCustomerCode(tx),
        email: input.email,
        full_name: input.fullName,
        phone: input.phone,
      },
    });
  }

  private async generateCustomerCode(tx: Prisma.TransactionClient) {
    const prefix = 'CUS';
    const lastCustomer = await tx.customer.findFirst({
      where: {
        customer_code: {
          startsWith: prefix,
        },
      },
      orderBy: { customer_code: 'desc' },
      select: { customer_code: true },
    });
    const currentNumber = Number(
      lastCustomer?.customer_code.replace(prefix, '') ?? '0',
    );

    return `${prefix}${(currentNumber + 1).toString().padStart(6, '0')}`;
  }

  private addMonths(date: Date, months: number) {
    const nextDate = new Date(date);
    nextDate.setMonth(nextDate.getMonth() + months);
    return nextDate;
  }

  private mergeWarrantyMetadata(value: Prisma.JsonValue) {
    const metadata =
      value && typeof value === 'object' && !Array.isArray(value) ? value : {};

    return {
      ...metadata,
      activationRequestSource: 'warranty_activation_request',
      certificateEmailStatus: 'PENDING_TEMPLATE',
    } satisfies Prisma.InputJsonObject;
  }
}
