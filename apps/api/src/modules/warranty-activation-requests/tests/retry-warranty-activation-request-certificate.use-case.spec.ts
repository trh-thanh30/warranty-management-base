import { BadRequestError, NotFoundError } from '@/common/response';
import { RetryWarrantyActivationRequestCertificateUseCase } from '@/modules/warranty-activation-requests/use-cases/retry-warranty-activation-request-certificate.use-case';
import {
  warranty_activation_request_source,
  warranty_activation_request_status,
  warranty_status,
} from '@prisma/client';

describe('RetryWarrantyActivationRequestCertificateUseCase', () => {
  const repository = { findById: jest.fn() };
  const issueRequestCertificateUseCase = { execute: jest.fn() };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('reissues one aggregate certificate for the activated request', async () => {
    const request = buildRequest();
    repository.findById.mockResolvedValueOnce(request).mockResolvedValueOnce({
      ...request,
      certificate: {
        certificate_number: 'CERT-RETRIED',
        email_status: 'QUEUED',
        emailed_at: null,
        generated_at: new Date('2026-08-24T01:05:00.000Z'),
        id: 'certificate-id',
        last_error: null,
        recipient_email: 'customer@example.com',
        status: 'GENERATED',
        storage_key: 'private/certificate.pdf',
      },
    });
    issueRequestCertificateUseCase.execute.mockResolvedValue({
      id: 'certificate-id',
    });
    const useCase = new RetryWarrantyActivationRequestCertificateUseCase(
      repository as never,
      issueRequestCertificateUseCase as never,
    );

    const result = await useCase.execute('request-id');

    expect(issueRequestCertificateUseCase.execute).toHaveBeenCalledWith({
      recipientEmail: 'customer@example.com',
      requestId: 'request-id',
    });
    expect(result.certificate?.status).toBe('GENERATED');
  });

  it('rejects certificate issuance before the activation transaction completes', async () => {
    repository.findById.mockResolvedValue({
      ...buildRequest(),
      status: warranty_activation_request_status.PENDING,
    });
    const useCase = new RetryWarrantyActivationRequestCertificateUseCase(
      repository as never,
      issueRequestCertificateUseCase as never,
    );

    await expect(useCase.execute('request-id')).rejects.toBeInstanceOf(
      BadRequestError,
    );
    expect(issueRequestCertificateUseCase.execute).not.toHaveBeenCalled();
  });

  it('rejects a missing activation request', async () => {
    repository.findById.mockResolvedValue(null);
    const useCase = new RetryWarrantyActivationRequestCertificateUseCase(
      repository as never,
      issueRequestCertificateUseCase as never,
    );

    await expect(useCase.execute('request-id')).rejects.toBeInstanceOf(
      NotFoundError,
    );
    expect(issueRequestCertificateUseCase.execute).not.toHaveBeenCalled();
  });
});

function buildRequest() {
  const timestamp = new Date('2026-08-24T01:00:00.000Z');

  return {
    activated_warranty: null,
    activated_warranty_id: 'warranty-id',
    created_at: timestamp,
    customer_email: 'customer@example.com',
    id: 'request-id',
    items: [
      {
        activated_at: timestamp,
        activation_field_id: null,
        id: 'item-id',
        position_key: 'primaryProduct',
        position_label: 'San pham',
        product_code: 'PRODUCT-001',
        product_id: 'product-id',
        product_name: 'Lexzenz Film',
        serial_number: 'SERIAL-001',
        status: warranty_activation_request_status.ACTIVATED,
        warranty: {
          certificates: [],
          status: warranty_status.ACTIVE,
        },
        warranty_code: 'WM-2026-ABC123',
        warranty_id: 'warranty-id',
      },
    ],
    request_code: 'WAR-20260824-0001',
    source: warranty_activation_request_source.ADMIN_PORTAL,
    status: warranty_activation_request_status.ACTIVATED,
    updated_at: timestamp,
  };
}
