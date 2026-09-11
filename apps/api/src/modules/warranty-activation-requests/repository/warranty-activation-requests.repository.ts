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
  WarrantyActivationRequestUpdateConflictError,
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
    const activationCodeIds = this.getActivationCodeIds(command);
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

            if (customerProfile?.update) {
              await tx.customer.update({
                where: { id: customerProfile.id },
                data: {
                  address: customerProfile.update.address,
                  birthdate: customerProfile.update.birthdate,
                  email: customerProfile.update.email,
                  full_name: customerProfile.update.fullName,
                  phone: customerProfile.update.phone,
                },
              });
            }

            return tx.warrantyActivationRequest.create({
              data: {
                ...data,
                customer: customerProfile
                  ? { connect: { id: customerProfile.id } }
                  : data.customer,
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

  updatePending(
    id: string,
    command: CreateWarrantyActivationRequestCommand,
    options: CreateWarrantyActivationRequestOptions = {},
  ) {
    const nextActivationCodeIds = this.getActivationCodeIds(command);

    return this.prismaService
      .$transaction(async (tx) => {
        // This conditional write locks the request row. Reading its current
        // reservations afterwards serializes concurrent edits correctly.
        const guarded = await tx.warrantyActivationRequest.updateMany({
          where: {
            id,
            status: warranty_activation_request_status.PENDING,
          },
          data: { updated_at: new Date() },
        });
        if (guarded.count !== 1) {
          throw new WarrantyActivationRequestUpdateConflictError();
        }
        const current = await tx.warrantyActivationRequest.findUnique({
          where: { id },
          select: {
            activation_code_id: true,
            items: { select: { activation_code_id: true } },
          },
        });
        if (!current) throw new WarrantyActivationRequestUpdateConflictError();

        const currentActivationCodeIds = Array.from(
          new Set(
            [
              current.activation_code_id,
              ...current.items.map((item) => item.activation_code_id),
            ].filter((codeId): codeId is string => Boolean(codeId)),
          ),
        );
        const removedCodeIds = currentActivationCodeIds.filter(
          (codeId) => !nextActivationCodeIds.includes(codeId),
        );
        const addedCodeIds = nextActivationCodeIds.filter(
          (codeId) => !currentActivationCodeIds.includes(codeId),
        );

        if (removedCodeIds.length > 0) {
          await tx.activationCode.updateMany({
            where: {
              id: { in: removedCodeIds },
              status: activation_code_status.PENDING_APPROVAL,
            },
            data: { status: activation_code_status.AVAILABLE },
          });
        }
        if (addedCodeIds.length > 0) {
          const reserved = await tx.activationCode.updateMany({
            where: {
              expires_at: { gt: new Date() },
              id: { in: addedCodeIds },
              status: activation_code_status.AVAILABLE,
            },
            data: { status: activation_code_status.PENDING_APPROVAL },
          });
          if (reserved.count !== addedCodeIds.length) {
            throw new WarrantyActivationCodeReservationConflictError(
              addedCodeIds,
            );
          }
        }

        if (options.customerProfile?.update) {
          await tx.customer.update({
            where: { id: options.customerProfile.id },
            data: {
              address: options.customerProfile.update.address,
              birthdate: options.customerProfile.update.birthdate,
              email: options.customerProfile.update.email,
              full_name: options.customerProfile.update.fullName,
              phone: options.customerProfile.update.phone,
            },
          });
        }

        await tx.warrantyActivationRequestItem.deleteMany({
          where: { request_id: id },
        });
        await tx.warrantyActivationRequest.update({
          where: { id },
          data: this.toUpdateInput(command, options.customerProfile?.id),
        });
        if (command.items.length > 0) {
          await tx.warrantyActivationRequestItem.createMany({
            data: command.items.map((item) => ({
              activation_code_id: item.activationCodeId ?? null,
              activation_field_id: item.activationFieldId,
              position_key: item.positionKey,
              position_label: item.positionLabel,
              product_id: item.productId,
              product_name: item.productName,
              product_code: item.productCode,
              request_id: id,
              serial_number: item.serialNumber,
              warranty_code: item.warrantyCode,
              warranty_id: item.warrantyId,
            })),
          });
        }

        return tx.warrantyActivationRequest.findUniqueOrThrow({
          where: { id },
          include: this.queries.include,
        });
      })
      .catch((error: unknown) => {
        throw toApplicationConflictError(error);
      });
  }

  findById(id: string, dealerIds?: string[]) {
    return this.prismaService.warrantyActivationRequest.findFirst({
      where: { id, dealer_id: dealerIds ? { in: dealerIds } : undefined },
      include: this.queries.include,
    });
  }

  findPublicStatusByRequestCode(requestCode: string) {
    return this.prismaService.warrantyActivationRequest.findUnique({
      where: { request_code: requestCode },
      select: {
        request_code: true,
        status: true,
        created_at: true,
        reviewed_at: true,
        updated_at: true,
      },
    });
  }

  findOpenByProductId(productId: string, excludeRequestId?: string) {
    return this.prismaService.warrantyActivationRequest.findFirst({
      where: {
        id: excludeRequestId ? { not: excludeRequestId } : undefined,
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

  findOpenByProductIds(productIds: string[], excludeRequestId?: string) {
    return this.prismaService.warrantyActivationRequest.findMany({
      where: {
        id: excludeRequestId ? { not: excludeRequestId } : undefined,
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

  list(filters: ListWarrantyActivationRequestsDto, dealerIds?: string[]) {
    const { page, limit, skip, take } = normalizePagination(filters);
    const { orderBy, where } = this.queries.buildListQuery(filters, dealerIds);

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

  listForExport(
    filters: ListWarrantyActivationRequestsDto,
    dealerIds?: string[],
  ) {
    const { orderBy, where } = this.queries.buildListQuery(filters, dealerIds);

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
          activation_code:
            input.status === warranty_activation_request_status.REJECTED
              ? { disconnect: true }
              : undefined,
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

  private getActivationCodeIds(
    command: CreateWarrantyActivationRequestCommand,
  ) {
    return Array.from(
      new Set(
        [
          command.activationCodeId,
          ...command.items.map((item) => item.activationCodeId),
        ].filter((codeId): codeId is string => Boolean(codeId)),
      ),
    );
  }

  private toUpdateInput(
    command: CreateWarrantyActivationRequestCommand,
    customerId?: string,
  ): Prisma.WarrantyActivationRequestUncheckedUpdateInput {
    return {
      activation_code_id: command.activationCodeId ?? null,
      address_detail: command.addressDetail,
      brand: command.brand,
      category_id: command.categoryId ?? null,
      customer_birthdate: command.customerBirthdate,
      customer_email: command.customerEmail,
      customer_id: customerId ?? null,
      customer_name: command.customerName,
      customer_phone: command.customerPhone,
      dealer_id: command.dealerId ?? null,
      full_address: command.fullAddress,
      installed_at: command.installedAt,
      manufacture_year: command.manufactureYear,
      metadata: command.metadata as Prisma.InputJsonObject,
      model: command.model,
      note: command.note,
      product_id: command.productId,
      product_name: command.productName,
      province_code: command.provinceCode,
      province_name: command.provinceName,
      serial_number: command.serialNumber,
      vehicle_model: command.vehicleModel,
      vehicle_plate: command.vehiclePlate,
      ward_code: command.wardCode,
      ward_name: command.wardName,
      warranty_code: command.warrantyCode,
      warranty_duration_months: command.warrantyDurationMonths,
    };
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
