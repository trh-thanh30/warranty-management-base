import { normalizePagination, paginate } from '@/common/pagination/pagination';
import { PrismaService } from '@/database/prisma/prisma.service';
import { ListWarrantyActivationRequestsDto } from '@/modules/warranty-activation-requests/dto/list-warranty-activation-requests.dto';
import { WarrantyActivationReviewTransactionRepository } from '@/modules/warranty-activation-requests/repository/warranty-activation-review-transaction.repository';
import { WarrantyActivationRequestQueries } from '@/modules/warranty-activation-requests/repository/warranty-activation-requests.repository.queries';
import { OPEN_WARRANTY_ACTIVATION_REQUEST_STATUSES } from '@/modules/warranty-activation-requests/warranty-activation-requests.constants';
import {
  CreateWarrantyActivationRequestCommand,
  CreateWarrantyActivationRequestOptions,
} from '@/modules/warranty-activation-requests/warranty-activation-requests.types';
import {
  WarrantyActivationCodeReservationConflictError,
  WarrantyActivationRequestCodeConflictError,
  WarrantyActivationRequestUniqueConflictError,
  WarrantyActivationRequestWarrantyCodeConflictError,
} from '@/modules/warranty-activation-requests/repository/warranty-activation-request-errors';
import { Injectable } from '@nestjs/common';
import {
  activation_code_status,
  Prisma,
  warranty_activation_request_status,
} from '@prisma/client';

@Injectable()
export class WarrantyActivationRequestsRepository {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly queries: WarrantyActivationRequestQueries,
  ) {}

  create(
    command: CreateWarrantyActivationRequestCommand,
    options: CreateWarrantyActivationRequestOptions = {},
  ) {
    const data = this.toCreateInput(command);
    const customerProfile = options.customerProfile;
    const activationCodeIds = this.collectActivationCodeIds(command);
    const operation =
      customerProfile || activationCodeIds.length > 0
        ? this.prismaService.$transaction(async (tx) => {
            if (activationCodeIds.length > 0) {
              const reserved = await tx.activationCode.updateMany({
                where: {
                  id: { in: activationCodeIds },
                  status: activation_code_status.AVAILABLE,
                  expires_at: { gt: new Date() },
                },
                data: { status: activation_code_status.PENDING_APPROVAL },
              });
              if (reserved.count !== activationCodeIds.length) {
                throw new WarrantyActivationCodeReservationConflictError(
                  activationCodeIds,
                );
              }
            }

            if (customerProfile?.birthdate !== undefined) {
              await tx.customer.update({
                where: { id: customerProfile.id },
                data: { birthdate: customerProfile.birthdate },
              });
            }

            return tx.warrantyActivationRequest.create({
              data: {
                ...data,
                ...(customerProfile
                  ? { customer: { connect: { id: customerProfile.id } } }
                  : {}),
              },
              include: this.queries.include,
            });
          })
        : this.prismaService.warrantyActivationRequest.create({
            data,
            include: this.queries.include,
          });

    return operation.catch((error: unknown) => {
      throw toApplicationConflictError(error);
    });
  }

  findById(id: string) {
    return this.prismaService.warrantyActivationRequest.findUnique({
      where: { id },
      include: this.queries.include,
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
    const { orderBy, where } = this.queries.buildListQuery(filters);

    return this.prismaService.$transaction(async (tx) => {
      const [items, total] = await Promise.all([
        tx.warrantyActivationRequest.findMany({
          where,
          include: this.queries.include,
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
    const { orderBy, where } = this.queries.buildListQuery(filters);

    return this.prismaService.warrantyActivationRequest.findMany({
      where,
      include: this.queries.include,
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
      const reviewedAt = new Date();
      if (input.status === warranty_activation_request_status.REJECTED) {
        const request = await tx.warrantyActivationRequest.findUnique({
          where: { id: input.id },
          select: {
            activation_code_id: true,
            items: { select: { activation_code_id: true } },
          },
        });
        const activationCodeIds = [
          request?.activation_code_id,
          ...(request?.items.map((item) => item.activation_code_id) ?? []),
        ].filter((id): id is string => Boolean(id));
        const uniqueActivationCodeIds = [...new Set(activationCodeIds)];

        if (uniqueActivationCodeIds.length > 0) {
          const pendingCodes = {
            id: { in: uniqueActivationCodeIds },
            status: activation_code_status.PENDING_APPROVAL,
          };
          await tx.activationCode.updateMany({
            where: { ...pendingCodes, expires_at: { lte: reviewedAt } },
            data: { status: activation_code_status.EXPIRED },
          });
          await tx.activationCode.updateMany({
            where: { ...pendingCodes, expires_at: { gt: reviewedAt } },
            data: { status: activation_code_status.AVAILABLE },
          });
        }
      }

      await tx.warrantyActivationRequestItem.updateMany({
        where: { request_id: input.id },
        data: { status: input.status },
      });

      return tx.warrantyActivationRequest.update({
        where: { id: input.id },
        data: {
          admin_note: input.adminNote,
          rejection_reason: input.rejectionReason,
          reviewed_at: reviewedAt,
          reviewed_by: input.reviewedById
            ? { connect: { id: input.reviewedById } }
            : undefined,
          status: input.status,
        },
        include: this.queries.include,
      });
    });
  }

  withReviewTransaction<T>(
    work: (
      repository: WarrantyActivationReviewTransactionRepository,
    ) => Promise<T>,
  ) {
    return this.prismaService.$transaction((tx) =>
      work(new WarrantyActivationReviewTransactionRepository(tx, this.queries)),
    );
  }

  private toCreateInput(
    command: CreateWarrantyActivationRequestCommand,
  ): Prisma.WarrantyActivationRequestCreateInput {
    return {
      request_code: command.requestCode,
      source: command.source,
      warranty_code: command.warrantyCode,
      activation_code: command.activationCodeId
        ? { connect: { id: command.activationCodeId } }
        : undefined,
      created_by: command.createdByUserId
        ? { connect: { id: command.createdByUserId } }
        : undefined,
      customer_name: command.customerName,
      customer_phone: command.customerPhone,
      customer_email: command.customerEmail,
      customer_birthdate: command.customerBirthdate,
      category: command.categoryId
        ? { connect: { id: command.categoryId } }
        : undefined,
      product: { connect: { id: command.productId } },
      dealer: command.dealerId
        ? { connect: { id: command.dealerId } }
        : undefined,
      vehicle_plate: command.vehiclePlate,
      vehicle_model: command.vehicleModel,
      installed_at: command.installedAt,
      warranty_duration_months: command.warrantyDurationMonths,
      province_code: command.provinceCode,
      province_name: command.provinceName,
      ward_code: command.wardCode,
      ward_name: command.wardName,
      address_detail: command.addressDetail,
      full_address: command.fullAddress,
      product_name: command.productName,
      serial_number: command.serialNumber,
      brand: command.brand,
      model: command.model,
      manufacture_year: command.manufactureYear,
      note: command.note,
      metadata: command.metadata as Prisma.InputJsonObject,
      items: {
        create: command.items.map((item) => ({
          activation_field_id: item.activationFieldId,
          activation_code_id: item.activationCodeId ?? undefined,
          position_key: item.positionKey,
          position_label: item.positionLabel,
          product_id: item.productId,
          warranty_id: item.warrantyId ?? undefined,
          warranty_code: item.warrantyCode ?? undefined,
          product_name: item.productName,
          product_code: item.productCode,
          serial_number: item.serialNumber,
        })),
      },
    };
  }

  private collectActivationCodeIds(
    command: CreateWarrantyActivationRequestCommand,
  ) {
    return [
      command.activationCodeId,
      ...command.items.map((item) => item.activationCodeId),
    ].filter(
      (id, index, values): id is string =>
        Boolean(id) && values.indexOf(id) === index,
    );
  }
}

function toApplicationConflictError(error: unknown) {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  ) {
    const target = Array.isArray(error.meta?.target)
      ? error.meta.target.filter(
          (value): value is string => typeof value === 'string',
        )
      : undefined;
    if (target?.includes('request_code')) {
      return new WarrantyActivationRequestCodeConflictError();
    }
    if (target?.includes('warranty_code')) {
      return new WarrantyActivationRequestWarrantyCodeConflictError();
    }
    return new WarrantyActivationRequestUniqueConflictError(target);
  }

  return error;
}
