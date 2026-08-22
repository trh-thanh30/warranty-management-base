import { WarrantyCertificateHtmlTemplateService } from '@/modules/warranty-certificates/services/warranty-certificate-html-template.service';
import type { WarrantyCertificateViewModel } from '@/modules/warranty-certificates/warranty-certificate.types';

describe('WarrantyCertificateHtmlTemplateService', () => {
  const model: WarrantyCertificateViewModel = {
    certificate: {
      installedAt: '16/8/2026',
      issuedAt: '20/8/2026',
      number: 'CERT-2026-001',
    },
    customer: {
      address: '12 Nguyễn Trãi, Hà Nội',
      email: 'customer@example.com',
      fullName: '<script>alert(1)</script> Nguyễn Văn A',
      phone: '0901234567',
    },
    dealer: { name: 'Đại lý Lexzenz Hà Nội' },
    vehicle: { model: 'Toyota Camry', plate: '30A-12345' },
    products: [
      {
        durationLabel: '36 tháng',
        expiryDate: '16/8/2029',
        positionLabel: 'Kính lái',
        productCode: 'PRD-001',
        productName: 'Phim cách nhiệt ô tô B',
        serialNumber: 'SERIAL-001',
        warrantyCode: 'WM-2026-001',
      },
    ],
    activationFields: [{ label: 'Kính lái', value: 'SP50' }],
  };

  it('renders a self-contained escaped HTML certificate', () => {
    const html = new WarrantyCertificateHtmlTemplateService().render(model);

    expect(html).toContain('<!doctype html>');
    expect(html).toContain('CERT-2026-001');
    expect(html).toContain('Phim cách nhiệt ô tô B');
    expect(html).toContain('WM-2026-001');
    expect(html).toContain('Kính lái');
    expect(html).toContain('SP50');
    expect(html).toContain(
      '&lt;script&gt;alert(1)&lt;/script&gt; Nguyễn Văn A',
    );
    expect(html).not.toContain('<script>');
    expect(html).toContain('<style>');
    expect(html).toContain('@page');
    expect(html).toContain("font-family: 'Be Vietnam Pro'");
    expect(html.match(/data:font\/woff2;base64,/g)).toHaveLength(4);
    expect(html).toContain('font-weight: 800');
    expect(html).toContain('data:image/png;base64,');
    expect(html).toContain('class="hero__vehicle"');
    expect(html.match(/data:image\/png;base64,/g)).toHaveLength(3);
    expect(html).toContain('class="certificate-document"');
    expect(html).toContain('class="certificate-page-header"');
    expect(html).toContain('class="certificate-page-body"');
    expect(html).toContain('class="product-table"');
    expect(html).toContain('class="certificate-page-footer"');
    expect(html).toContain('class="certificate-footer__watermark"');
    expect(html).toContain('TRA CỨU BẢO HÀNH ĐIỆN TỬ');
    expect(html).toContain('Kiểm tra hiệu lực và thời hạn bảo hành tại');
    expect(html).toContain('baohanh.lexzenz.com/tra-cuu');
    expect(html).toMatch(/Ngày cấp:\s*<strong>20\/8\/2026<\/strong>/);
    expect(html).toContain('Mã chứng nhận:');
    expect(html).toContain('CERT-2026-001');
    expect(html).toContain('Chứng nhận bảo hành điện tử');
    expect(html).not.toContain(
      'Chứng nhận được phát hành tự động bởi hệ thống E-Warranty.',
    );
    expect(html).not.toContain('certificate--compact');
    expect(html).not.toContain('continuation-header');
    expect(html).not.toContain('section--continuation');
    expect(html).not.toMatch(/https?:\/\//);
  });

  it('uses the same natural A4 layout for two products', () => {
    const product = model.products[0];
    const html = new WarrantyCertificateHtmlTemplateService().render({
      ...model,
      products: [
        product,
        {
          ...product,
          positionLabel: 'Kính sườn trước - trái',
          productCode: 'PRD-002',
          warrantyCode: 'WM-2026-002',
        },
      ],
    });

    expect(html).toContain('class="certificate-document"');
    expect(html).toContain('class="certificate-page-header"');
    expect(html).toContain('class="certificate-page-footer"');
    expect(html).not.toContain('certificate--compact');
    expect(html).not.toContain('section--continuation');
  });

  it('keeps long dynamic content in the natural document flow', () => {
    const product = model.products[0];
    const html = new WarrantyCertificateHtmlTemplateService().render({
      ...model,
      activationFields: Array.from({ length: 6 }, (_, index) => ({
        label: `Vị trí ${index + 1}`,
        value: `Sản phẩm ${index + 1}`,
      })),
      products: Array.from({ length: 6 }, (_, index) => ({
        ...product,
        positionLabel: `Vị trí ${index + 1}`,
        productCode: `PRD-${index + 1}`,
        warrantyCode: `WM-${index + 1}`,
      })),
    });

    expect(html).toContain('PRD-1');
    expect(html).toContain('PRD-6');
    expect(html).toContain('WM-1');
    expect(html).toContain('WM-6');
    expect(html).not.toContain('continuation-header');
    expect(html).not.toContain('section--continuation');
    expect(html.match(/data:image\/png;base64,/g)).toHaveLength(3);
  });
});
