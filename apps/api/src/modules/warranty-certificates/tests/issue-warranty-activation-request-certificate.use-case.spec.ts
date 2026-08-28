import { IssueWarrantyActivationRequestCertificateUseCase } from '@/modules/warranty-certificates/use-cases/issue-warranty-activation-request-certificate.use-case';
import {
  warranty_activation_request_status,
  warranty_certificate_status,
} from '@prisma/client';

describe('IssueWarrantyActivationRequestCertificateUseCase', () => {
  const repository = {
    create: jest.fn(),
    findByRequestId: jest.fn(),
    findRequestForIssuance: jest.fn(),
    update: jest.fn(),
  };
  const uploadAssetService = { delete: jest.fn(), upload: jest.fn() };
  const pdfService = { createPdfFromViewModel: jest.fn() };
  const emailService = { queueEmail: jest.fn() };

  beforeEach(() => jest.resetAllMocks());

  it('returns an existing generated request certificate without rendering again', async () => {
    const generated = {
      id: 'request-certificate-1',
      status: warranty_certificate_status.GENERATED,
    };
    repository.findByRequestId.mockResolvedValue(generated);
    const useCase = createUseCase();

    await expect(useCase.execute({ requestId: 'request-1' })).resolves.toBe(
      generated,
    );
    expect(pdfService.createPdfFromViewModel).not.toHaveBeenCalled();
    expect(uploadAssetService.upload).not.toHaveBeenCalled();
  });

  it.each([
    ['one item', [buildItem('windshield', 'WM-A')]],
    [
      'multiple items',
      [buildItem('windshield', 'WM-A'), buildItem('rearGlass', 'WM-B')],
    ],
  ])('creates one request certificate for %s', async (_label, items) => {
    repository.findByRequestId.mockResolvedValue(null);
    repository.findRequestForIssuance.mockResolvedValue(buildRequest(items));
    pdfService.createPdfFromViewModel.mockResolvedValue(Buffer.from('pdf'));
    uploadAssetService.upload.mockResolvedValue({ path: 'private/cert.pdf' });
    repository.create.mockImplementation((data) =>
      Promise.resolve({ id: 'request-certificate-1', ...data }),
    );
    emailService.queueEmail.mockResolvedValue({
      id: 'request-certificate-1',
      status: warranty_certificate_status.GENERATED,
    });
    const useCase = createUseCase();

    await useCase.execute({
      recipientEmail: 'CUSTOMER@EXAMPLE.COM ',
      requestId: 'request-1',
    });

    expect(pdfService.createPdfFromViewModel).toHaveBeenCalledWith(
      expect.objectContaining({
        products: items.map((item) =>
          expect.objectContaining({ warrantyCode: item.warranty_code }),
        ),
      }),
    );
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        activation_request_id: 'request-1',
        metadata: {
          itemCount: items.length,
          requestId: 'request-1',
          warrantyCodes: items.map((item) => item.warranty_code),
        },
        recipient_email: 'customer@example.com',
        status: warranty_certificate_status.GENERATED,
        storage_key: 'private/cert.pdf',
      }),
    );
    expect(emailService.queueEmail).toHaveBeenCalledWith(
      'request-certificate-1',
    );
  });

  it.each([
    [
      'pending request',
      buildRequest([buildItem('windshield', 'WM-A')], {
        requestStatus: warranty_activation_request_status.PENDING,
      }),
    ],
    [
      'request without activated items',
      buildRequest([buildItem('windshield', 'WM-A', { activated: false })]),
    ],
    ['request with no items', buildRequest([])],
  ])(
    'rejects certificate issuance for an ineligible %s',
    async (_label, request) => {
      repository.findByRequestId.mockResolvedValue(null);
      repository.findRequestForIssuance.mockResolvedValue(request);
      const useCase = createUseCase();

      await expect(
        useCase.execute({ requestId: 'request-1' }),
      ).rejects.toMatchObject({
        code: 'WARRANTY_ACTIVATION_REQUEST_NOT_ELIGIBLE_FOR_CERTIFICATE',
        details: expect.objectContaining({ requestId: 'request-1' }),
      });
      expect(pdfService.createPdfFromViewModel).not.toHaveBeenCalled();
      expect(uploadAssetService.upload).not.toHaveBeenCalled();
    },
  );

  it('persists generation failure without hiding the original error', async () => {
    repository.findByRequestId.mockResolvedValue(null);
    repository.findRequestForIssuance.mockResolvedValue(
      buildRequest([buildItem('windshield', 'WM-A')]),
    );
    pdfService.createPdfFromViewModel.mockRejectedValue(
      new Error('PDF generation failed'),
    );
    repository.create.mockResolvedValue({ id: 'failed-certificate' });
    const useCase = createUseCase();

    await expect(useCase.execute({ requestId: 'request-1' })).rejects.toThrow(
      'PDF generation failed',
    );
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        activation_request_id: 'request-1',
        last_error: 'PDF generation failed',
        status: warranty_certificate_status.FAILED,
        storage_key: null,
      }),
    );
  });

  it('reuses a failed certificate record when generation is retried', async () => {
    repository.findByRequestId.mockResolvedValue({
      certificate_number: 'CERT-FAILED-1',
      id: 'failed-certificate',
      status: warranty_certificate_status.FAILED,
    });
    repository.findRequestForIssuance.mockResolvedValue(
      buildRequest([buildItem('windshield', 'WM-A')]),
    );
    pdfService.createPdfFromViewModel.mockResolvedValue(Buffer.from('pdf'));
    uploadAssetService.upload.mockResolvedValue({ path: 'private/cert.pdf' });
    repository.update.mockResolvedValue({
      id: 'failed-certificate',
      status: warranty_certificate_status.GENERATED,
    });
    const useCase = createUseCase();

    await useCase.execute({ requestId: 'request-1' });

    expect(repository.update).toHaveBeenCalledWith(
      'failed-certificate',
      expect.objectContaining({
        certificate_number: 'CERT-FAILED-1',
        status: warranty_certificate_status.GENERATED,
        storage_key: 'private/cert.pdf',
      }),
    );
    expect(repository.create).not.toHaveBeenCalled();
  });

  function createUseCase() {
    return new IssueWarrantyActivationRequestCertificateUseCase(
      repository as never,
      uploadAssetService as never,
      pdfService as never,
      emailService as never,
    );
  }
});

function buildRequest(
  items: ReturnType<typeof buildItem>[],
  options: { requestStatus?: warranty_activation_request_status } = {},
) {
  return {
    id: 'request-1',
    status:
      options.requestStatus ?? warranty_activation_request_status.ACTIVATED,
    customer_email: 'customer@example.com',
    customer_name: 'Nguyễn Văn A',
    customer_phone: '0900000000',
    dealer: { name: 'Đại lý A' },
    full_address: 'Hà Nội',
    installed_at: new Date('2026-08-17T00:00:00.000Z'),
    items,
    vehicle_model: 'Sedan',
    vehicle_plate: '30A-12345',
  };
}

function buildItem(
  positionKey: string,
  warrantyCode: string,
  options: { activated?: boolean } = {},
) {
  return {
    position_key: positionKey,
    position_label: positionKey === 'windshield' ? 'Kính lái' : 'Kính lưng',
    product_code: `PRD-${warrantyCode}`,
    product_name: `Product ${warrantyCode}`,
    serial_number: null,
    status:
      options.activated === false
        ? warranty_activation_request_status.PENDING
        : warranty_activation_request_status.ACTIVATED,
    activated_at:
      options.activated === false ? null : new Date('2026-08-17T00:00:00.000Z'),
    warranty_code: warrantyCode,
    warranty: {
      duration_months: 12,
      end_date: new Date('2027-08-17T00:00:00.000Z'),
    },
  };
}
