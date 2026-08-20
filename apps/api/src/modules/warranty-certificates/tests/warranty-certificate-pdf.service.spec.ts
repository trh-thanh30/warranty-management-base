import { HtmlPdfRendererService } from '@/modules/warranty-certificates/services/html-pdf-renderer.service';
import { WarrantyCertificateHtmlTemplateService } from '@/modules/warranty-certificates/services/warranty-certificate-html-template.service';
import { WarrantyCertificatePdfService } from '@/modules/warranty-certificates/services/warranty-certificate-pdf.service';
import type { WarrantyCertificateViewModel } from '@/modules/warranty-certificates/warranty-certificate.types';
import { PDFDocument } from 'pdf-lib';

describe('WarrantyCertificatePdfService', () => {
  it('normalizes legacy input, renders HTML and delegates PDF creation', async () => {
    const htmlTemplate = {
      render: jest.fn().mockReturnValue('<html>certificate</html>'),
    } as unknown as WarrantyCertificateHtmlTemplateService;
    const htmlPdfRenderer = {
      createPdf: jest.fn().mockResolvedValue(Buffer.from('%PDF-test')),
    } as unknown as HtmlPdfRendererService;
    const service = new WarrantyCertificatePdfService(
      htmlTemplate,
      htmlPdfRenderer,
    );

    const result = await service.createPdfBuffer({
      certificateNumber: 'LEX-2026-0001',
      customerAddress: 'Hà Nội',
      customerEmail: 'khach@example.com',
      customerName: 'Nguyễn Văn A',
      customerPhone: '0901234567',
      dealerName: 'Đại lý Lexzenz Hà Nội',
      endDate: new Date('2029-07-24T00:00:00.000Z'),
      filmItems: { windshield: 'LX-70' },
      installedAt: new Date('2026-07-24T00:00:00.000Z'),
      productName: 'Film cách nhiệt ô tô Lexzenz Reflex Korea Film',
      serialNumber: 'SN-001',
      startDate: new Date('2026-07-24T00:00:00.000Z'),
      vehicleModel: 'Toyota Camry 2026',
      vehiclePlate: '30A-12345',
      warrantyCode: 'WM-2026-ABC123',
      warrantyDurationMonths: 36,
    });

    expect(htmlTemplate.render).toHaveBeenCalledWith(
      expect.objectContaining({
        certificate: expect.objectContaining({ number: 'LEX-2026-0001' }),
        customer: expect.objectContaining({ fullName: 'Nguyễn Văn A' }),
        products: [
          expect.objectContaining({
            productName: 'Film cách nhiệt ô tô Lexzenz Reflex Korea Film',
            warrantyCode: 'WM-2026-ABC123',
          }),
        ],
      }),
    );
    expect(htmlPdfRenderer.createPdf).toHaveBeenCalledWith(
      '<html>certificate</html>',
    );
    expect(result.toString()).toBe('%PDF-test');
  });
});

const describeIntegration =
  process.env.RUN_PDF_RENDERER_INTEGRATION === 'true'
    ? describe
    : describe.skip;

describeIntegration(
  'WarrantyCertificatePdfService Chromium integration',
  () => {
    const htmlTemplate = new WarrantyCertificateHtmlTemplateService();
    const htmlPdfRenderer = new HtmlPdfRendererService({
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
      maxBodyBytes: 10_485_760,
      timeoutMs: 45_000,
      url: process.env.PDF_RENDERER_URL,
    });

    it('renders a short certificate as one real PDF page', async () => {
      const service = new WarrantyCertificatePdfService(
        htmlTemplate,
        htmlPdfRenderer,
      );
      const pdf = await service.createPdfBuffer({
        certificateNumber: 'LEX-2026-0001',
        customerAddress: 'Hà Nội',
        customerEmail: 'khach@example.com',
        customerName: 'Nguyễn Văn A',
        customerPhone: '0901234567',
        dealerName: 'Đại lý Lexzenz Hà Nội',
        endDate: new Date('2029-07-24T00:00:00.000Z'),
        filmItems: { windshield: 'LX-70' },
        installedAt: new Date('2026-07-24T00:00:00.000Z'),
        productName: 'Film cách nhiệt ô tô Lexzenz Reflex Korea Film',
        serialNumber: 'SN-001',
        startDate: new Date('2026-07-24T00:00:00.000Z'),
        vehicleModel: 'Toyota Camry 2026',
        vehiclePlate: '30A-12345',
        warrantyCode: 'WM-2026-ABC123',
        warrantyDurationMonths: 36,
      });

      expect(pdf.subarray(0, 5).toString()).toBe('%PDF-');
      expect((await PDFDocument.load(pdf)).getPageCount()).toBe(1);
    });

    it('keeps all long content and automatically creates multiple A4 pages', async () => {
      const products = Array.from({ length: 45 }, (_, index) => ({
        durationLabel: '36 tháng',
        expiryDate: '24/07/2029',
        positionLabel: `Vị trí ${index + 1}`,
        productCode: `PRD-${String(index + 1).padStart(3, '0')}`,
        productName: `Sản phẩm bảo hành ${index + 1}`,
        serialNumber: `SERIAL-${index + 1}`,
        warrantyCode: `WM-2026-${String(index + 1).padStart(3, '0')}`,
      }));
      const viewModel: WarrantyCertificateViewModel = {
        activationFields: Array.from({ length: 20 }, (_, index) => ({
          label: `Trường ${index + 1}`,
          value: `Giá trị ${index + 1}`,
        })),
        certificate: {
          installedAt: '24/07/2026',
          issuedAt: '20/08/2026',
          number: 'CERT-MULTI-PAGE',
        },
        customer: {
          address: 'Hà Nội',
          email: 'khach@example.com',
          fullName: 'Nguyễn Văn A',
          phone: '0901234567',
        },
        dealer: { name: 'Đại lý Lexzenz Hà Nội' },
        products,
        vehicle: { model: 'Toyota Camry', plate: '30A-12345' },
      };
      const html = htmlTemplate.render(viewModel);

      expect(html).toContain('Sản phẩm bảo hành 1');
      expect(html).toContain('Sản phẩm bảo hành 45');

      const pdf = await htmlPdfRenderer.createPdf(html);
      expect((await PDFDocument.load(pdf)).getPageCount()).toBeGreaterThan(1);
    });
  },
);
