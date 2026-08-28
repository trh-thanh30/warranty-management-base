import { PrismaService } from '@/database/prisma/prisma.service';
import type {
  CreateWarrantyActivationRequestCertificateInput,
  WarrantyActivationRequestCertificateEmailData,
  WarrantyActivationRequestCertificateRecord,
  WarrantyActivationRequestCertificateWriteInput,
  WarrantyActivationRequestForCertificateIssuance,
} from '@/modules/warranty-certificates/types/warranty-activation-request-certificate.types';
import type { WarrantyCertificateFile } from '@/modules/warranty-certificates/types/warranty-certificates.types';
import { Injectable } from '@nestjs/common';
import {
  Prisma,
  type WarrantyActivationRequestCertificate,
  warranty_certificate_email_status,
} from '@prisma/client';

const requestCertificateEmailDataInclude = {
  activation_request: {
    select: {
      customer_name: true,
      items: {
        orderBy: [{ created_at: 'asc' as const }, { id: 'asc' as const }],
        select: {
          position_label: true,
          product_name: true,
          serial_number: true,
          warranty_code: true,
        },
      },
    },
  },
} satisfies Prisma.WarrantyActivationRequestCertificateInclude;

const requestForCertificateIssuanceSelect = {
  id: true,
  status: true,
  customer_email: true,
  customer_name: true,
  customer_phone: true,
  dealer: { select: { name: true } },
  full_address: true,
  installed_at: true,
  items: {
    orderBy: [{ created_at: 'asc' as const }, { id: 'asc' as const }],
    select: {
      status: true,
      activated_at: true,
      position_key: true,
      position_label: true,
      product_code: true,
      product_name: true,
      serial_number: true,
      warranty_code: true,
      warranty: {
        select: { duration_months: true, end_date: true },
      },
    },
  },
  vehicle_model: true,
  vehicle_plate: true,
} satisfies Prisma.WarrantyActivationRequestSelect;

type PersistedRequestCertificateEmailData =
  Prisma.WarrantyActivationRequestCertificateGetPayload<{
    include: typeof requestCertificateEmailDataInclude;
  }>;

type PersistedRequestForCertificateIssuance =
  Prisma.WarrantyActivationRequestGetPayload<{
    select: typeof requestForCertificateIssuanceSelect;
  }>;

@Injectable()
export class WarrantyActivationRequestCertificatesRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(
    input: CreateWarrantyActivationRequestCertificateInput,
  ): Promise<WarrantyActivationRequestCertificateRecord> {
    const certificate =
      await this.prismaService.warrantyActivationRequestCertificate.create({
        data: {
          ...this.toPersistenceWriteInput(input),
          activation_request_id: input.activationRequestId,
          certificate_number: input.certificateNumber,
        },
      });

    return this.toRequestCertificateRecord(certificate);
  }

  async findByRequestId(
    requestId: string,
  ): Promise<WarrantyActivationRequestCertificateRecord | null> {
    const certificate =
      await this.prismaService.warrantyActivationRequestCertificate.findUnique({
        where: { activation_request_id: requestId },
      });

    return certificate ? this.toRequestCertificateRecord(certificate) : null;
  }

  async findFileByRequestId(
    requestId: string,
  ): Promise<WarrantyCertificateFile | null> {
    const certificate =
      await this.prismaService.warrantyActivationRequestCertificate.findUnique({
        where: { activation_request_id: requestId },
        select: { certificate_number: true, storage_key: true },
      });

    return certificate
      ? {
          certificateNumber: certificate.certificate_number,
          storageKey: certificate.storage_key,
        }
      : null;
  }

  async findEmailDataById(
    id: string,
  ): Promise<WarrantyActivationRequestCertificateEmailData | null> {
    const certificate =
      await this.prismaService.warrantyActivationRequestCertificate.findUnique({
        where: { id },
        include: requestCertificateEmailDataInclude,
      });

    return certificate ? this.toRequestCertificateEmailData(certificate) : null;
  }

  async findRequestForIssuance(
    requestId: string,
  ): Promise<WarrantyActivationRequestForCertificateIssuance | null> {
    const request =
      await this.prismaService.warrantyActivationRequest.findUnique({
        where: { id: requestId },
        select: requestForCertificateIssuanceSelect,
      });

    return request ? this.toRequestForCertificateIssuance(request) : null;
  }

  async update(
    id: string,
    input: WarrantyActivationRequestCertificateWriteInput,
  ): Promise<WarrantyActivationRequestCertificateRecord> {
    const certificate =
      await this.prismaService.warrantyActivationRequestCertificate.update({
        where: { id },
        data: this.toPersistenceWriteInput(input),
      });

    return this.toRequestCertificateRecord(certificate);
  }

  async markEmailSent(certificateId: string, emailedAt: Date): Promise<void> {
    await this.prismaService.warrantyActivationRequestCertificate.updateMany({
      where: {
        id: certificateId,
        email_status: { not: warranty_certificate_email_status.SENT },
      },
      data: {
        email_status: warranty_certificate_email_status.SENT,
        emailed_at: emailedAt,
        last_error: null,
      },
    });
  }

  async markEmailFailed(certificateId: string, message: string): Promise<void> {
    await this.prismaService.warrantyActivationRequestCertificate.updateMany({
      where: {
        id: certificateId,
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

  private toPersistenceWriteInput(
    input: WarrantyActivationRequestCertificateWriteInput,
  ) {
    return {
      certificate_number: input.certificateNumber,
      email_status: input.emailStatus,
      emailed_at: input.emailedAt,
      generated_at: input.generatedAt,
      last_error: input.lastError,
      metadata: this.toJsonInput(input.metadata),
      recipient_email: input.recipientEmail,
      status: input.status,
      storage_key: input.storageKey,
    };
  }

  private toJsonInput(value: Record<string, unknown> | undefined) {
    return value === undefined ? undefined : (value as Prisma.InputJsonObject);
  }

  private toRequestCertificateRecord(
    certificate: WarrantyActivationRequestCertificate,
  ): WarrantyActivationRequestCertificateRecord {
    return {
      activationRequestId: certificate.activation_request_id,
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
    };
  }

  private toRequestCertificateEmailData(
    certificate: PersistedRequestCertificateEmailData,
  ): WarrantyActivationRequestCertificateEmailData {
    return {
      certificateNumber: certificate.certificate_number,
      id: certificate.id,
      recipientEmail: certificate.recipient_email,
      request: {
        customerName: certificate.activation_request.customer_name,
        items: certificate.activation_request.items.map((item) => ({
          positionLabel: item.position_label,
          productName: item.product_name,
          serialNumber: item.serial_number,
          warrantyCode: item.warranty_code,
        })),
      },
      storageKey: certificate.storage_key,
    };
  }

  private toRequestForCertificateIssuance(
    request: PersistedRequestForCertificateIssuance,
  ): WarrantyActivationRequestForCertificateIssuance {
    return {
      customerEmail: request.customer_email,
      customerName: request.customer_name,
      customerPhone: request.customer_phone,
      dealerName: request.dealer?.name ?? null,
      fullAddress: request.full_address,
      id: request.id,
      installedAt: request.installed_at,
      items: request.items.map((item) => ({
        activatedAt: item.activated_at,
        durationMonths: item.warranty.duration_months,
        endDate: item.warranty.end_date,
        positionKey: item.position_key,
        positionLabel: item.position_label,
        productCode: item.product_code,
        productName: item.product_name,
        serialNumber: item.serial_number,
        status: item.status,
        warrantyCode: item.warranty_code,
      })),
      status: request.status,
      vehicleModel: request.vehicle_model,
      vehiclePlate: request.vehicle_plate,
    };
  }
}
