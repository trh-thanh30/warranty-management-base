import { ActivationCodeBatchesRepository } from '@/modules/activation-codes/repository/activation-code-batches.repository';
import { ActivationCodeCryptoService } from '@/modules/activation-codes/services/activation-code-crypto.service';
import { CreatePrintableActivationLabelsUseCase } from '@/modules/activation-codes/use-cases/create-printable-activation-labels.use-case';
import { HtmlPdfRendererService } from '@/modules/warranty-certificates/services/html-pdf-renderer.service';

describe('CreatePrintableActivationLabelsUseCase', () => {
  it('decrypts selected available codes and renders a PDF', async () => {
    const repository = {
      findWithCodes: jest.fn().mockResolvedValue({
        batch_code: 'ACB-20260831-ABC',
        product_name: 'Camera hành trình',
        product_sku: 'SKU-001',
        expires_at: new Date('2027-02-28T00:00:00Z'),
        codes: [
          { code_ciphertext: 'cipher-1' },
          { code_ciphertext: 'cipher-2' },
        ],
      }),
    } as unknown as ActivationCodeBatchesRepository;
    const crypto = {
      decrypt: jest.fn((value: string) => value.replace('cipher-', 'SP-')),
    } as unknown as ActivationCodeCryptoService;
    const pdfRenderer = {
      createPdf: jest.fn().mockResolvedValue(Buffer.from('%PDF-test')),
    } as unknown as HtmlPdfRendererService;
    const onProgress = jest.fn().mockResolvedValue(undefined);

    const result = await new CreatePrintableActivationLabelsUseCase(
      repository,
      crypto,
      pdfRenderer,
    ).execute('batch-id', { from: 1, onProgress, to: 1 });

    expect(crypto.decrypt).toHaveBeenCalledWith('cipher-1');
    expect(crypto.decrypt).not.toHaveBeenCalledWith('cipher-2');
    expect(pdfRenderer.createPdf).toHaveBeenCalledWith(
      expect.stringContaining('SP-1'),
    );
    expect(result.filename).toBe('ACB-20260831-ABC-labels.pdf');
    expect(result.pdf.subarray(0, 5).toString()).toBe('%PDF-');
    expect(onProgress.mock.calls.map(([progress]) => progress)).toEqual([
      25, 40, 80,
    ]);
  });

  it('rejects an invalid range', async () => {
    const repository = {
      findWithCodes: jest.fn().mockResolvedValue({
        batch_code: 'ACB',
        product_name: 'Product',
        product_sku: 'SKU',
        expires_at: new Date(),
        codes: [{ code_ciphertext: 'cipher' }],
      }),
    } as unknown as ActivationCodeBatchesRepository;
    const useCase = new CreatePrintableActivationLabelsUseCase(
      repository,
      {} as ActivationCodeCryptoService,
      {} as HtmlPdfRendererService,
    );

    await expect(
      useCase.execute('batch-id', { from: 2, to: 1 }),
    ).rejects.toMatchObject({
      code: 'ACTIVATION_LABEL_RANGE_INVALID',
    });
  });

  it('renders using the requested label dimensions', async () => {
    const repository = {
      findWithCodes: jest.fn().mockResolvedValue({
        batch_code: 'ACB',
        product_name: 'Product',
        product_sku: 'SKU',
        expires_at: new Date(),
        codes: [{ code_ciphertext: 'cipher' }],
      }),
    } as unknown as ActivationCodeBatchesRepository;
    const pdfRenderer = {
      createPdf: jest.fn().mockResolvedValue(Buffer.from('%PDF-test')),
    } as unknown as HtmlPdfRendererService;

    await new CreatePrintableActivationLabelsUseCase(
      repository,
      { decrypt: jest.fn().mockReturnValue('SP-1') } as never,
      pdfRenderer,
    ).execute('batch-id', {
      labelHeightMm: 20,
      labelWidthMm: 40,
    });

    expect(pdfRenderer.createPdf).toHaveBeenCalledWith(
      expect.stringContaining(
        'grid-template-columns:repeat(4,40mm);grid-template-rows:repeat(13,20mm)',
      ),
    );
  });
});
