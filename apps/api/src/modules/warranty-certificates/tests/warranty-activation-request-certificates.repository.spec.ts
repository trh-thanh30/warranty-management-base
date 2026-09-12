import { WarrantyActivationRequestCertificatesRepository } from '@/modules/warranty-certificates/repository/warranty-activation-request-certificates.repository';

describe('WarrantyActivationRequestCertificatesRepository application contracts', () => {
  it('marks confirmation sent without clearing PDF failures', async () => {
    const updateMany = jest.fn().mockResolvedValue({ count: 1 });
    const repository = new WarrantyActivationRequestCertificatesRepository({
      warrantyActivationRequestCertificate: { updateMany },
    } as never);
    await repository.markEmailSent('failed-certificate', new Date());
    expect(updateMany).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        data: { email_status: 'SENT', emailed_at: expect.any(Date) },
      }),
    );
    expect(updateMany).toHaveBeenNthCalledWith(2, {
      where: {
        id: 'failed-certificate',
        status: 'GENERATED',
        email_status: 'SENT',
      },
      data: { last_error: null },
    });
  });
  it('maps certificate writes and persisted records at the repository seam', async () => {
    const persisted = buildPersistedCertificate();
    const prismaService = {
      warrantyActivationRequestCertificate: {
        create: jest.fn().mockResolvedValue(persisted),
      },
    };
    const repository = new WarrantyActivationRequestCertificatesRepository(
      prismaService as never,
    );

    const result = await repository.create({
      activationRequestId: 'request-1',
      certificateNumber: 'CERT-001',
      emailStatus: 'PENDING',
      metadata: { itemCount: 1 },
      recipientEmail: 'customer@example.com',
      status: 'GENERATED',
      storageKey: 'private/certificate.pdf',
    });

    expect(
      prismaService.warrantyActivationRequestCertificate.create,
    ).toHaveBeenCalledWith({
      data: expect.objectContaining({
        activation_request_id: 'request-1',
        certificate_number: 'CERT-001',
        email_status: 'PENDING',
        metadata: { itemCount: 1 },
        recipient_email: 'customer@example.com',
        status: 'GENERATED',
        storage_key: 'private/certificate.pdf',
      }),
    });
    expect(result).toEqual({
      activationRequestId: 'request-1',
      certificateNumber: 'CERT-001',
      createdAt: persisted.created_at,
      emailStatus: 'PENDING',
      emailedAt: null,
      generatedAt: persisted.generated_at,
      id: 'certificate-1',
      lastError: null,
      metadata: { itemCount: 1 },
      recipientEmail: 'customer@example.com',
      status: 'GENERATED',
      storageKey: 'private/certificate.pdf',
      updatedAt: persisted.updated_at,
      version: 1,
    });
  });

  it('maps the issuance snapshot without exposing Prisma relations', async () => {
    const request = {
      id: 'request-1',
      status: 'ACTIVATED',
      customer_email: 'customer@example.com',
      customer_name: 'Nguyễn Văn A',
      customer_phone: '0900000000',
      dealer: { name: 'Đại lý A' },
      full_address: 'Hà Nội',
      installed_at: new Date('2026-08-17T00:00:00.000Z'),
      items: [
        {
          activated_at: new Date('2026-08-17T00:00:00.000Z'),
          position_key: 'windshield',
          position_label: 'Kính lái',
          product_code: 'PRD-001',
          product_name: 'Film A',
          serial_number: 'SERIAL-001',
          status: 'ACTIVATED',
          warranty_code: 'WM-001',
          warranty: {
            duration_months: 12,
            end_date: new Date('2027-08-17T00:00:00.000Z'),
          },
        },
      ],
      vehicle_model: 'Sedan',
      vehicle_plate: '30A-12345',
    };
    const prismaService = {
      warrantyActivationRequest: {
        findUnique: jest.fn().mockResolvedValue(request),
      },
    };
    const repository = new WarrantyActivationRequestCertificatesRepository(
      prismaService as never,
    );

    await expect(
      repository.findRequestForIssuance('request-1'),
    ).resolves.toEqual({
      customerEmail: 'customer@example.com',
      customerName: 'Nguyễn Văn A',
      customerPhone: '0900000000',
      dealerName: 'Đại lý A',
      fullAddress: 'Hà Nội',
      id: 'request-1',
      installedAt: request.installed_at,
      items: [
        {
          activatedAt: request.items[0]?.activated_at,
          durationMonths: 12,
          endDate: request.items[0]?.warranty.end_date,
          positionKey: 'windshield',
          positionLabel: 'Kính lái',
          productCode: 'PRD-001',
          productName: 'Film A',
          serialNumber: 'SERIAL-001',
          status: 'ACTIVATED',
          warrantyCode: 'WM-001',
        },
      ],
      status: 'ACTIVATED',
      vehicleModel: 'Sedan',
      vehiclePlate: '30A-12345',
    });
  });

  it('maps request certificate email data to an application contract', async () => {
    const prismaService = {
      warrantyActivationRequestCertificate: {
        findUnique: jest.fn().mockResolvedValue({
          ...buildPersistedCertificate(),
          activation_request: {
            customer_name: 'Nguyễn Văn A',
            items: [
              {
                position_label: 'Kính lái',
                product_name: 'Film A',
                serial_number: 'SERIAL-001',
                warranty_code: 'WM-001',
              },
            ],
          },
        }),
      },
    };
    const repository = new WarrantyActivationRequestCertificatesRepository(
      prismaService as never,
    );

    await expect(
      repository.findEmailDataById('certificate-1'),
    ).resolves.toEqual({
      activationRequestId: 'request-1',
      emailStatus: 'PENDING',
      lastError: null,
      status: 'GENERATED',
      certificateNumber: 'CERT-001',
      id: 'certificate-1',
      recipientEmail: 'customer@example.com',
      request: {
        customerName: 'Nguyễn Văn A',
        items: [
          {
            positionLabel: 'Kính lái',
            productName: 'Film A',
            serialNumber: 'SERIAL-001',
            warrantyCode: 'WM-001',
          },
        ],
      },
      storageKey: 'private/certificate.pdf',
    });
  });
});

function buildPersistedCertificate() {
  return {
    activation_request_id: 'request-1',
    certificate_number: 'CERT-001',
    created_at: new Date('2026-08-17T00:00:00.000Z'),
    email_status: 'PENDING',
    emailed_at: null,
    generated_at: new Date('2026-08-17T00:00:00.000Z'),
    id: 'certificate-1',
    last_error: null,
    metadata: { itemCount: 1 },
    recipient_email: 'customer@example.com',
    status: 'GENERATED',
    storage_key: 'private/certificate.pdf',
    updated_at: new Date('2026-08-17T00:00:00.000Z'),
    version: 1,
  };
}
