import { IssueWarrantyActivationRequestCertificateUseCase } from '@/modules/warranty-certificates/use-cases/issue-warranty-activation-request-certificate.use-case';
import type { WarrantyActivationRequestStatus } from '@repo/shared';

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
      status: 'GENERATED',
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
      status: 'GENERATED',
    });
    const useCase = createUseCase();

    await useCase.execute({
      recipientEmail: 'CUSTOMER@EXAMPLE.COM ',
      requestId: 'request-1',
    });

    expect(pdfService.createPdfFromViewModel).toHaveBeenCalledWith(
      expect.objectContaining({
        products: items.map((item) =>
          expect.objectContaining({ warrantyCode: item.warrantyCode }),
        ),
      }),
    );
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        activationRequestId: 'request-1',
        metadata: {
          itemCount: items.length,
          requestId: 'request-1',
          warrantyCodes: items.map((item) => item.warrantyCode),
        },
        recipientEmail: 'customer@example.com',
        status: 'GENERATED',
        storageKey: 'private/cert.pdf',
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
        requestStatus: 'PENDING',
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
        activationRequestId: 'request-1',
        lastError: 'PDF generation failed',
        status: 'FAILED',
        storageKey: null,
      }),
    );
  });

  it('queues confirmation without PDF while preserving generation failure', async () => {
    repository.findByRequestId.mockResolvedValue(null);
    repository.findRequestForIssuance.mockResolvedValue(
      buildRequest([buildItem('windshield', 'WM-A')]),
    );
    pdfService.createPdfFromViewModel.mockRejectedValue(
      new Error('PDF_RENDERER_UNAVAILABLE'),
    );
    repository.create.mockImplementation((data) =>
      Promise.resolve({ id: 'failed-certificate', ...data }),
    );
    await expect(
      createUseCase().execute({
        requestId: 'request-1',
        recipientEmail: 'customer@example.com',
      }),
    ).resolves.toMatchObject({ id: 'failed-certificate', status: 'FAILED' });
    expect(emailService.queueEmail).toHaveBeenCalledWith('failed-certificate');
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'FAILED',
        lastError: 'PDF_RENDERER_UNAVAILABLE',
        recipientEmail: 'customer@example.com',
      }),
    );
  });

  it('does not send another email when a PDF retry succeeds after confirmation was sent', async () => {
    repository.findByRequestId.mockResolvedValue({
      id: 'failed-certificate',
      status: 'FAILED',
      emailStatus: 'SENT',
      certificateNumber: 'CERT-FAILED-1',
    });
    repository.findRequestForIssuance.mockResolvedValue(
      buildRequest([buildItem('windshield', 'WM-A')]),
    );
    pdfService.createPdfFromViewModel.mockResolvedValue(Buffer.from('pdf'));
    uploadAssetService.upload.mockResolvedValue({ path: 'private/cert.pdf' });
    repository.update.mockImplementation((_id, data) =>
      Promise.resolve({ id: 'failed-certificate', ...data }),
    );
    await createUseCase().execute({
      requestId: 'request-1',
      recipientEmail: 'customer@example.com',
    });
    expect(emailService.queueEmail).not.toHaveBeenCalled();
    expect(repository.update).toHaveBeenCalledWith(
      'failed-certificate',
      expect.objectContaining({ emailStatus: 'SENT', status: 'GENERATED' }),
    );
  });

  it('reuses a failed certificate record when generation is retried', async () => {
    repository.findByRequestId.mockResolvedValue({
      certificateNumber: 'CERT-FAILED-1',
      id: 'failed-certificate',
      status: 'FAILED',
    });
    repository.findRequestForIssuance.mockResolvedValue(
      buildRequest([buildItem('windshield', 'WM-A')]),
    );
    pdfService.createPdfFromViewModel.mockResolvedValue(Buffer.from('pdf'));
    uploadAssetService.upload.mockResolvedValue({ path: 'private/cert.pdf' });
    repository.update.mockResolvedValue({
      id: 'failed-certificate',
      status: 'GENERATED',
    });
    const useCase = createUseCase();

    await useCase.execute({ requestId: 'request-1' });

    expect(repository.update).toHaveBeenCalledWith(
      'failed-certificate',
      expect.objectContaining({
        certificateNumber: 'CERT-FAILED-1',
        status: 'GENERATED',
        storageKey: 'private/cert.pdf',
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
  options: { requestStatus?: WarrantyActivationRequestStatus } = {},
) {
  return {
    id: 'request-1',
    status: options.requestStatus ?? 'ACTIVATED',
    customerEmail: 'customer@example.com',
    customerName: 'Nguyễn Văn A',
    customerPhone: '0900000000',
    dealerName: 'Đại lý A',
    fullAddress: 'Hà Nội',
    installedAt: new Date('2026-08-17T00:00:00.000Z'),
    items,
    vehicleModel: 'Sedan',
    vehiclePlate: '30A-12345',
  };
}

function buildItem(
  positionKey: string,
  warrantyCode: string,
  options: { activated?: boolean } = {},
) {
  return {
    positionKey,
    positionLabel: positionKey === 'windshield' ? 'Kính lái' : 'Kính lưng',
    productCode: `PRD-${warrantyCode}`,
    productName: `Product ${warrantyCode}`,
    serialNumber: null,
    status: options.activated === false ? 'PENDING' : 'ACTIVATED',
    activatedAt:
      options.activated === false ? null : new Date('2026-08-17T00:00:00.000Z'),
    warrantyCode,
    durationMonths: 12,
    endDate: new Date('2027-08-17T00:00:00.000Z'),
  };
}
