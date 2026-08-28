import { WarrantyCertificatesRepository } from '@/modules/warranty-certificates/repository/warranty-certificates.repository';

describe('WarrantyCertificatesRepository application contracts', () => {
  it('maps a persisted certificate record to a camelCase application record', async () => {
    const persisted = {
      certificate_number: 'CERT-001',
      created_at: new Date('2026-08-26T00:00:00.000Z'),
      email_status: 'PENDING',
      emailed_at: null,
      generated_at: new Date('2026-08-26T00:00:00.000Z'),
      id: 'certificate-1',
      last_error: null,
      metadata: { requestId: 'request-1' },
      recipient_email: 'customer@example.com',
      status: 'GENERATED',
      storage_key: 'private/certificate.pdf',
      updated_at: new Date('2026-08-26T00:00:00.000Z'),
      version: 1,
      warranty_id: 'warranty-1',
    };
    const prismaService = {
      warrantyCertificate: {
        findFirst: jest.fn().mockResolvedValue(persisted),
      },
    };
    const repository = new WarrantyCertificatesRepository(
      prismaService as never,
    );

    await expect(
      repository.findLatestByWarrantyId('warranty-1'),
    ).resolves.toEqual({
      certificateNumber: 'CERT-001',
      createdAt: persisted.created_at,
      emailStatus: 'PENDING',
      emailedAt: null,
      generatedAt: persisted.generated_at,
      id: 'certificate-1',
      lastError: null,
      metadata: { requestId: 'request-1' },
      recipientEmail: 'customer@example.com',
      status: 'GENERATED',
      storageKey: 'private/certificate.pdf',
      updatedAt: persisted.updated_at,
      version: 1,
      warrantyId: 'warranty-1',
    });
  });
});
