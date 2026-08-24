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
}
