import { PrismaService } from '@/database/prisma/prisma.service';
import {
  CreateWarrantyCertificateInput,
  WarrantyCertificateActivationRequest,
  WarrantyCertificateBatchEmailRequest,
  WarrantyCertificateDeletionTarget,
  WarrantyCertificateFile,
  WarrantyCertificateForBatchEmail,
  WarrantyCertificateForEmail,
  WarrantyCertificateRecord,
  WarrantyCertificateStorageReference,
  WarrantyCertificateWriteInput,
  WarrantyForCertificate,
} from '@/modules/warranty-certificates/types/warranty-certificates.types';
import { Injectable } from '@nestjs/common';
import { getProductCatalogue } from '@/modules/products/product-catalogue';
import {
  Prisma,
  WarrantyCertificate,
  warranty_certificate_email_status,
} from '@prisma/client';

const warrantyForCertificateInclude = {
  product: {
    include: {
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

type PersistedWarrantyCertificate = WarrantyCertificate;
type PersistedWarrantyForCertificate = Prisma.WarrantyGetPayload<{
  include: typeof warrantyForCertificateInclude;
}>;
type PersistedActivationRequestForCertificate =
  Prisma.WarrantyActivationRequestGetPayload<{
    include: typeof activationRequestForCertificateInclude;
  }>;
type PersistedWarrantyCertificateForEmail =
  Prisma.WarrantyCertificateGetPayload<{
    include: {
      warranty: {
        include: typeof warrantyForCertificateInclude;
      };
    };
  }>;
type PersistedWarrantyCertificateForBatchEmail =
  Prisma.WarrantyCertificateGetPayload<{
    include: {
      warranty: {
        include: { product: true };
      };
    };
  }>;

@Injectable()
export class WarrantyCertificatesRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findWarrantyForCertificate(
    warrantyId: string,
  ): Promise<WarrantyForCertificate | null> {
    const warranty = await this.prismaService.warranty.findUnique({
      where: { id: warrantyId },
      include: warrantyForCertificateInclude,
    });

    return warranty ? toWarrantyForCertificate(warranty) : null;
  }

  async findActivationRequestForCertificate(
    requestId: string,
  ): Promise<WarrantyCertificateActivationRequest | null> {
    const request =
      await this.prismaService.warrantyActivationRequest.findUnique({
        where: { id: requestId },
        include: activationRequestForCertificateInclude,
      });

    return request ? toActivationRequestForCertificate(request) : null;
  }

  async findLatestByWarrantyId(
    warrantyId: string,
  ): Promise<WarrantyCertificateRecord | null> {
    const certificate = await this.prismaService.warrantyCertificate.findFirst({
      where: { warranty_id: warrantyId },
      orderBy: { created_at: 'desc' },
    });

    return certificate ? toWarrantyCertificateRecord(certificate) : null;
  }

  async findById(
    certificateId: string,
  ): Promise<WarrantyCertificateRecord | null> {
    const certificate = await this.prismaService.warrantyCertificate.findUnique(
      {
        where: { id: certificateId },
      },
    );

    return certificate ? toWarrantyCertificateRecord(certificate) : null;
  }

  async create(
    input: CreateWarrantyCertificateInput,
  ): Promise<WarrantyCertificateRecord> {
    const certificate = await this.prismaService.warrantyCertificate.create({
      data: {
        certificate_number: input.certificateNumber,
        email_status: input.emailStatus,
        emailed_at: input.emailedAt,
        generated_at: input.generatedAt,
        last_error: input.lastError,
        metadata: toJsonInput(input.metadata),
        recipient_email: input.recipientEmail,
        status: input.status,
        storage_key: input.storageKey,
        warranty: { connect: { id: input.warrantyId } },
      },
    });

    return toWarrantyCertificateRecord(certificate);
  }

  async update(
    id: string,
    input: WarrantyCertificateWriteInput,
  ): Promise<WarrantyCertificateRecord> {
    const certificate = await this.prismaService.warrantyCertificate.update({
      where: { id },
      data: toWarrantyCertificatePersistenceData(input),
    });

    return toWarrantyCertificateRecord(certificate);
  }

  async findBatchEmailRequest(
    requestId: string,
  ): Promise<WarrantyCertificateBatchEmailRequest | null> {
    const request =
      await this.prismaService.warrantyActivationRequest.findUnique({
        where: { id: requestId },
        select: { customer_name: true },
      });

    return request ? { customerName: request.customer_name } : null;
  }

  async findBatchEmailCertificates(
    certificateIds: string[],
  ): Promise<WarrantyCertificateForBatchEmail[]> {
    const certificates = await this.prismaService.warrantyCertificate.findMany({
      where: { id: { in: certificateIds } },
      include: {
        warranty: {
          include: { product: true },
        },
      },
    });

    return certificates.map(toWarrantyCertificateForBatchEmail);
  }

  async findForEmail(
    certificateId: string,
  ): Promise<WarrantyCertificateForEmail | null> {
    const certificate = await this.prismaService.warrantyCertificate.findUnique(
      {
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
      },
    );

    return certificate ? toWarrantyCertificateForEmail(certificate) : null;
  }

  markEmailQueued(certificateIds: string[], emailedAt: Date) {
    return this.prismaService.warrantyCertificate.updateMany({
      where: {
        id: { in: certificateIds },
        email_status: { not: warranty_certificate_email_status.SENT },
      },
      data: {
        email_status: warranty_certificate_email_status.QUEUED,
        emailed_at: emailedAt,
        last_error: null,
      },
    });
  }

  markEmailQueueFailed(certificateIds: string[], message: string) {
    return this.prismaService.warrantyCertificate.updateMany({
      where: {
        id: { in: certificateIds },
        email_status: {
          notIn: [
            warranty_certificate_email_status.FAILED,
            warranty_certificate_email_status.SENT,
          ],
        },
      },
      data: {
        email_status: warranty_certificate_email_status.FAILED,
        last_error: message,
      },
    });
  }

  markEmailSent(certificateIds: string[], emailedAt: Date) {
    return this.prismaService.warrantyCertificate.updateMany({
      where: {
        id: { in: certificateIds },
        email_status: { not: warranty_certificate_email_status.SENT },
      },
      data: {
        email_status: warranty_certificate_email_status.SENT,
        emailed_at: emailedAt,
        last_error: null,
      },
    });
  }

  markEmailFailed(certificateIds: string[], message: string) {
    return this.prismaService.warrantyCertificate.updateMany({
      where: {
        id: { in: certificateIds },
        email_status: {
          notIn: [
            warranty_certificate_email_status.FAILED,
            warranty_certificate_email_status.SENT,
          ],
        },
      },
      data: {
        email_status: warranty_certificate_email_status.FAILED,
        last_error: message,
      },
    });
  }

  async findStoredPaths(): Promise<WarrantyCertificateStorageReference[]> {
    const certificates = await this.prismaService.warrantyCertificate.findMany({
      where: { storage_key: { not: null } },
      select: { storage_key: true },
    });

    return certificates.map(({ storage_key }) => ({ storageKey: storage_key }));
  }

  async findForDeletion(
    certificateId: string,
  ): Promise<WarrantyCertificateDeletionTarget | null> {
    const certificate = await this.prismaService.warrantyCertificate.findUnique(
      {
        where: { id: certificateId },
        select: { id: true, storage_key: true },
      },
    );

    return certificate
      ? { id: certificate.id, storageKey: certificate.storage_key }
      : null;
  }

  async delete(certificateId: string): Promise<{ id: string }> {
    const certificate = await this.prismaService.warrantyCertificate.delete({
      where: { id: certificateId },
    });

    return { id: certificate.id };
  }

  async findLatestFileForActivationRequest(
    requestId: string,
    itemId?: string,
  ): Promise<WarrantyCertificateFile | null> {
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

      const certificate = item?.warranty.certificates[0];
      return certificate
        ? {
            certificateNumber: certificate.certificate_number,
            storageKey: certificate.storage_key,
          }
        : null;
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

    const certificate = request?.activated_warranty?.certificates[0];
    return certificate
      ? {
          certificateNumber: certificate.certificate_number,
          storageKey: certificate.storage_key,
        }
      : null;
  }
}

function toWarrantyCertificatePersistenceData(
  input: WarrantyCertificateWriteInput,
): Prisma.WarrantyCertificateUpdateInput {
  return {
    email_status: input.emailStatus,
    emailed_at: input.emailedAt,
    generated_at: input.generatedAt,
    last_error: input.lastError,
    metadata: toJsonInput(input.metadata),
    recipient_email: input.recipientEmail,
    status: input.status,
    storage_key: input.storageKey,
  };
}

function toJsonInput(value: unknown) {
  return value === undefined ? undefined : (value as Prisma.InputJsonValue);
}

function toWarrantyCertificateRecord(
  certificate: PersistedWarrantyCertificate,
): WarrantyCertificateRecord {
  return {
    certificateNumber: certificate.certificate_number,
    createdAt: certificate.created_at,
    emailStatus: certificate.email_status,
    emailedAt: certificate.emailed_at,
    generatedAt: certificate.generated_at,
    id: certificate.id,
    lastError: certificate.last_error,
    metadata: certificate.metadata,
    recipientEmail: certificate.recipient_email,
    status: certificate.status,
    storageKey: certificate.storage_key,
    updatedAt: certificate.updated_at,
    version: certificate.version,
    warrantyId: certificate.warranty_id,
  };
}

function toWarrantyForCertificate(
  warranty: PersistedWarrantyForCertificate,
): WarrantyForCertificate {
  const catalogue = getProductCatalogue(warranty.product);
  return {
    durationMonths: warranty.duration_months,
    endDate: warranty.end_date,
    id: warranty.id,
    product: {
      displayName: warranty.product.display_name,
      ownerships: warranty.product.ownerships.map(({ customer }) => ({
        customer: {
          email: customer.email,
          fullName: customer.full_name,
          phone: customer.phone,
        },
      })),
      name: catalogue.name,
      serialNumber: warranty.product.serial_number,
    },
    startDate: warranty.start_date,
    warrantyCode: warranty.warranty_code,
  };
}

function toActivationRequestForCertificate(
  request: PersistedActivationRequestForCertificate,
): WarrantyCertificateActivationRequest {
  return {
    customerEmail: request.customer_email,
    customerName: request.customer_name,
    customerPhone: request.customer_phone,
    dealer: request.dealer ? { name: request.dealer.name } : null,
    fullAddress: request.full_address,
    installedAt: request.installed_at,
    metadata: request.metadata,
    vehicleModel: request.vehicle_model,
    vehiclePlate: request.vehicle_plate,
    warrantyDurationMonths: request.warranty_duration_months,
  };
}

function toWarrantyCertificateForEmail(
  certificate: PersistedWarrantyCertificateForEmail,
): WarrantyCertificateForEmail {
  return {
    ...toWarrantyCertificateRecord(certificate),
    warranty: toWarrantyForCertificate(certificate.warranty),
  };
}

function toWarrantyCertificateForBatchEmail(
  certificate: PersistedWarrantyCertificateForBatchEmail,
): WarrantyCertificateForBatchEmail {
  const catalogue = getProductCatalogue(certificate.warranty.product);
  return {
    ...toWarrantyCertificateRecord(certificate),
    warranty: {
      product: {
        displayName: certificate.warranty.product.display_name,
        name: catalogue.name,
        serialNumber: certificate.warranty.product.serial_number,
      },
      warrantyCode: certificate.warranty.warranty_code,
    },
  };
}
