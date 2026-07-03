import { PrismaService } from '@/database/prisma/prisma.service';
import { ListWarrantyClaimsDto } from '@/modules/warranty-claims/dto/list-warranty-claims.dto';
import { Injectable } from '@nestjs/common';
import { Prisma, warranty_claim_status } from '@prisma/client';

const claimInclude = {
  product: true,
  warranty: true,
  customer: true,
  service_center: true,
  status_history: {
    include: {
      changed_by: true,
    },
    orderBy: { created_at: 'asc' },
  },
} satisfies Prisma.WarrantyClaimInclude;

@Injectable()
export class WarrantyClaimsRepository {
  constructor(private readonly prismaService: PrismaService) {}

  findWarrantyProductByCode(warrantyCode: string) {
    return this.prismaService.product.findFirst({
      where: {
        warranty_code: warrantyCode,
        deleted_at: null,
      },
      include: {
        warranty: true,
        ownerships: {
          where: { is_current_owner: true },
          include: { customer: true },
          orderBy: { created_at: 'desc' },
        },
      },
    });
  }

  findById(id: string) {
    return this.prismaService.warrantyClaim.findUnique({
      where: { id },
      include: claimInclude,
    });
  }

  findByClaimCode(claimCode: string) {
    return this.prismaService.warrantyClaim.findUnique({
      where: { claim_code: claimCode },
      include: claimInclude,
    });
  }

  findLastClaimCode(prefix: string) {
    return this.prismaService.warrantyClaim.findFirst({
      where: {
        claim_code: {
          startsWith: prefix,
        },
      },
      orderBy: { claim_code: 'desc' },
      select: { claim_code: true },
    });
  }

  findByWarrantyCode(warrantyCode: string) {
    return this.prismaService.warrantyClaim.findMany({
      where: { warranty_code: warrantyCode },
      include: claimInclude,
      orderBy: { created_at: 'desc' },
    });
  }

  list(filters: ListWarrantyClaimsDto) {
    const search = filters.search?.trim();
    const warrantyCode = filters.warrantyCode?.trim().toUpperCase();
    const claimCode = filters.claimCode?.trim().toUpperCase();

    return this.prismaService.warrantyClaim.findMany({
      where: {
        status: filters.status,
        warranty_code: warrantyCode,
        claim_code: claimCode,
        service_center_id: filters.serviceCenterId,
        OR: search
          ? [
              { claim_code: { contains: search, mode: 'insensitive' } },
              { warranty_code: { contains: search, mode: 'insensitive' } },
              { requester_name: { contains: search, mode: 'insensitive' } },
              { requester_phone: { contains: search, mode: 'insensitive' } },
              { issue_title: { contains: search, mode: 'insensitive' } },
              {
                product: {
                  name: { contains: search, mode: 'insensitive' },
                },
              },
            ]
          : undefined,
      },
      include: claimInclude,
      orderBy: { created_at: 'desc' },
    });
  }

  create(data: Prisma.WarrantyClaimCreateInput) {
    return this.prismaService.warrantyClaim.create({
      data,
      include: claimInclude,
    });
  }

  updateStatus(
    id: string,
    status: warranty_claim_status,
    resolvedAt?: Date | null,
  ) {
    return this.prismaService.warrantyClaim.update({
      where: { id },
      data: {
        status,
        resolved_at: resolvedAt,
      },
      include: claimInclude,
    });
  }

  updateStatusWithHistory(input: {
    id: string;
    fromStatus: warranty_claim_status;
    toStatus: warranty_claim_status;
    resolvedAt?: Date | null;
    note?: string;
    changedByUserId?: string;
  }) {
    return this.prismaService.$transaction(async (tx) => {
      await tx.warrantyClaim.update({
        where: { id: input.id },
        data: {
          status: input.toStatus,
          resolved_at: input.resolvedAt,
        },
      });
      await tx.warrantyClaimStatusHistory.create({
        data: {
          warranty_claim_id: input.id,
          from_status: input.fromStatus,
          to_status: input.toStatus,
          note: input.note,
          changed_by_user_id: input.changedByUserId,
        },
      });

      return tx.warrantyClaim.findUniqueOrThrow({
        where: { id: input.id },
        include: claimInclude,
      });
    });
  }

  findActiveServiceCenterById(id: string) {
    return this.prismaService.serviceCenter.findFirst({
      where: {
        id,
        is_active: true,
      },
    });
  }

  assignServiceCenter(input: {
    id: string;
    serviceCenterId: string;
    status: warranty_claim_status;
    note?: string;
    changedByUserId?: string;
  }) {
    return this.prismaService.$transaction(async (tx) => {
      await tx.warrantyClaim.update({
        where: { id: input.id },
        data: {
          service_center_id: input.serviceCenterId,
        },
      });
      await tx.warrantyClaimStatusHistory.create({
        data: {
          warranty_claim_id: input.id,
          from_status: input.status,
          to_status: input.status,
          note: input.note ?? 'Assigned service center',
          changed_by_user_id: input.changedByUserId,
        },
      });

      return tx.warrantyClaim.findUniqueOrThrow({
        where: { id: input.id },
        include: claimInclude,
      });
    });
  }
}
