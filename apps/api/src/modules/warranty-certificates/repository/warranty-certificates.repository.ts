import { PrismaService } from '@/database/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

const warrantyForCertificateInclude = {
  product: {
    include: {
      template: true,
      ownerships: {
        where: { is_current_owner: true },
        include: { customer: true },
        take: 1,
      },
    },
  },
} satisfies Prisma.WarrantyInclude;

const activationRequestForCertificateInclude = {
  dealer: true,
} satisfies Prisma.WarrantyActivationRequestInclude;

@Injectable()
export class WarrantyCertificatesRepository {
  constructor(private readonly prismaService: PrismaService) {}

  findWarrantyForCertificate(warrantyId: string) {
    return this.prismaService.warranty.findUnique({
      where: { id: warrantyId },
      include: warrantyForCertificateInclude,
    });
  }

  findActivationRequestForCertificate(requestId: string) {
    return this.prismaService.warrantyActivationRequest.findUnique({
      where: { id: requestId },
      include: activationRequestForCertificateInclude,
    });
  }

  findLatestByWarrantyId(warrantyId: string) {
    return this.prismaService.warrantyCertificate.findFirst({
      where: { warranty_id: warrantyId },
      orderBy: { created_at: 'desc' },
    });
  }

  create(data: Prisma.WarrantyCertificateCreateInput) {
    return this.prismaService.warrantyCertificate.create({ data });
  }

  update(id: string, data: Prisma.WarrantyCertificateUpdateInput) {
    return this.prismaService.warrantyCertificate.update({
      where: { id },
      data,
    });
  }

  findBatchEmailRequest(requestId: string) {
    return this.prismaService.warrantyActivationRequest.findUnique({
      where: { id: requestId },
      select: { customer_name: true },
    });
  }

  findBatchEmailCertificates(certificateIds: string[]) {
    return this.prismaService.warrantyCertificate.findMany({
      where: { id: { in: certificateIds } },
      include: {
        warranty: {
          include: { product: { include: { template: true } } },
        },
      },
    });
  }

  findForEmail(certificateId: string) {
    return this.prismaService.warrantyCertificate.findUnique({
      where: { id: certificateId },
      include: {
        warranty: {
          include: {
            product: {
              include: warrantyForCertificateInclude.product.include,
            },
          },
        },
      },
    });
  }

  updateMany(
    certificateIds: string[],
    data: Prisma.WarrantyCertificateUpdateManyMutationInput,
  ) {
    return this.prismaService.warrantyCertificate.updateMany({
      where: { id: { in: certificateIds } },
      data,
    });
  }

  findStoredPaths() {
    return this.prismaService.warrantyCertificate.findMany({
      where: { storage_key: { not: null } },
      select: { storage_key: true },
    });
  }

  findForDeletion(certificateId: string) {
    return this.prismaService.warrantyCertificate.findUnique({
      where: { id: certificateId },
      select: { id: true, storage_key: true },
    });
  }

  delete(certificateId: string) {
    return this.prismaService.warrantyCertificate.delete({
      where: { id: certificateId },
    });
  }

  async findLatestFileForActivationRequest(requestId: string, itemId?: string) {
    if (itemId) {
      const item =
        await this.prismaService.warrantyActivationRequestItem.findFirst({
          where: { id: itemId, request_id: requestId },
          select: {
            warranty: {
              select: {
                certificates: {
                  orderBy: { created_at: 'desc' },
                  select: {
                    certificate_number: true,
                    storage_key: true,
                  },
                  take: 1,
                },
              },
            },
          },
        });

      return item?.warranty.certificates[0] ?? null;
    }

    const request =
      await this.prismaService.warrantyActivationRequest.findUnique({
        where: { id: requestId },
        select: {
          activated_warranty: {
            select: {
              certificates: {
                orderBy: { created_at: 'desc' },
                select: {
                  certificate_number: true,
                  storage_key: true,
                },
                take: 1,
              },
            },
          },
        },
      });

    return request?.activated_warranty?.certificates[0] ?? null;
  }
}
