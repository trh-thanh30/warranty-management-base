import { PrismaService } from '@/database/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';

@Injectable()
export class WarrantyActivationRequestCertificatesRepository {
  constructor(private readonly prismaService: PrismaService) {}

  create(
    data: Prisma.WarrantyActivationRequestCertificateUncheckedCreateInput,
  ) {
    return this.prismaService.warrantyActivationRequestCertificate.create({
      data,
    });
  }

  findByRequestId(requestId: string) {
    return this.prismaService.warrantyActivationRequestCertificate.findUnique({
      where: { activation_request_id: requestId },
    });
  }

  findEmailDataById(id: string) {
    return this.prismaService.warrantyActivationRequestCertificate.findUnique({
      where: { id },
      include: {
        activation_request: {
          select: {
            customer_name: true,
            items: {
              orderBy: [{ created_at: 'asc' }, { id: 'asc' }],
              select: {
                position_label: true,
                product_name: true,
                serial_number: true,
                warranty_code: true,
              },
            },
          },
        },
      },
    });
  }

  findRequestForIssuance(requestId: string) {
    return this.prismaService.warrantyActivationRequest.findUnique({
      where: { id: requestId },
      select: {
        id: true,
        customer_email: true,
        customer_name: true,
        customer_phone: true,
        dealer: { select: { name: true } },
        full_address: true,
        installed_at: true,
        items: {
          orderBy: [{ created_at: 'asc' }, { id: 'asc' }],
          select: {
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
      },
    });
  }

  update(
    id: string,
    data: Prisma.WarrantyActivationRequestCertificateUpdateInput,
  ) {
    return this.prismaService.warrantyActivationRequestCertificate.update({
      where: { id },
      data,
    });
  }
}
