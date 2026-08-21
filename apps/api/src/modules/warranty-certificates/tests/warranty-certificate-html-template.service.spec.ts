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
    expect(html).not.toMatch(/https?:\/\//);
  });
});
