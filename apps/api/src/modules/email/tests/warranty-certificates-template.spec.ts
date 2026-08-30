import Handlebars from 'handlebars';
import mjml2html from 'mjml';
import { readFileSync } from 'node:fs';
import path from 'node:path';

type MjmlRenderResult = { html: string };

// MJML v5 ships without a resolved callable type in this test environment.

const renderMjml = mjml2html as unknown as (
  source: string,
  options: { validationLevel: 'strict' },
) => Promise<MjmlRenderResult>;

describe('warranty-certificates email template', () => {
  it('renders the approved light digital certificate layout', async () => {
    const templatePath = path.resolve(
      process.cwd(),
      'src/modules/email/templates/warranty-certificates.mjml.hbs',
    );
    const template = Handlebars.compile(readFileSync(templatePath, 'utf8'));
    const mjml = template({
      brandLogoUrl: 'https://baohanh.lexzenz.com/logo_2.png',
      certificateCount: 2,
      certificateNumber: 'CERT-2026-ABC',
      certificates: [
        {
          positionLabel: 'Kính lái',
          productName: 'Phim cách nhiệt ô tô B',
          warrantyCode: 'WM-SP50',
        },
        {
          positionLabel: 'Kính sườn trước - trái',
          productName: 'Phim cách nhiệt ô tô C',
          warrantyCode: 'WM-B55',
        },
      ],
      customerName: 'Nguyễn Văn A',
      subject: 'Chứng nhận bảo hành điện tử CERT-2026-ABC',
      year: 2026,
    });
    const result = await renderMjml(mjml, { validationLevel: 'strict' });

    expect(result.html).toContain('FUJITEK');
    expect(result.html).toContain('LEXZENZ');
    expect(result.html).toContain('https://baohanh.lexzenz.com/logo_2.png');
    expect(result.html).toContain('href="https://baohanh.lexzenz.com"');
    expect(result.html).toContain('target="_blank"');
    expect(result.html).toContain('mobile-logo');
    expect(result.html).toContain(
      '.mobile-logo table { margin: 0 auto !important; }',
    );
    expect(result.html).toContain(
      '.certificate-meta div { text-align: center !important; }',
    );
    expect(result.html).toContain('Chứng nhận bảo hành điện tử');
    expect(result.html).toContain(
      "font-family:'Inter', Arial, Helvetica, sans-serif;font-size:26px;font-weight:700",
    );
    expect(result.html).not.toContain('Kích hoạt thành công');
    expect(result.html).not.toContain(
      'Sản phẩm chính hãng FUJITEK &amp; LEXZENZ',
    );
    expect(result.html).toContain('MÃ CHỨNG NHẬN');
    expect(result.html).toContain('HỆ THỐNG E-WARRANTY');
    expect(result.html).toContain('Tra cứu thời hạn bảo hành');
    expect(result.html).not.toContain('🔍');
    expect(result.html).toContain('baohanh.lexzenz.com/tra-cuu');
    expect(result.html).toContain('Chứng nhận PDF đã được đính kèm');
    expect(result.html).toContain('<svg');
    expect(result.html).toContain('M14 2v6h6');
    expect(result.html).not.toContain('📄');
    expect(result.html).toContain('Email được gửi tự động');
    expect(result.html).toContain('0989 017 999');
    expect(result.html).toContain('0886 33 77 33');
    expect(result.html).toContain('Số 62, Ngõ 20 Nghĩa Đô');
    expect(result.html).toContain('7C Nguyễn Ngọc Phương');
    expect(result.html).toContain('https://maps.google.com/?q=S%E1%BB%91%2062');
    expect(result.html).toContain(
      'https://maps.google.com/?q=7C%20Nguy%E1%BB%85n%20Ng%E1%BB%8Dc%20Ph%C6%B0%C6%A1ng',
    );
    expect(result.html).toContain('branch-address-text');
    expect(result.html).toContain('-webkit-text-fill-color:#4b5563 !important');
    expect(result.html).toContain('<font color="#4b5563">');
    expect(result.html).toContain('CHI NHÁNH HÀ NỘI');
    expect(result.html).toContain('CHI NHÁNH TP. HỒ CHÍ MINH');
    expect(result.html).toContain('branch-column-left');
    expect(result.html).toContain('branch-column-right');
    expect(result.html).toContain('footer-contact-card');
    expect(result.html).toContain('CERT-2026-ABC');
    expect(result.html).toContain('Kính lái');
    expect(result.html).toContain('Phim cách nhiệt ô tô B');
    expect(result.html).toContain('WM-B55');
    expect(result.html).toContain('PDF');
    expect(result.html).toContain('#dc2626');
    expect(result.html).toContain('#f3f4f6');
    expect(result.html).toContain('CHI TIẾT BẢO HÀNH');
    expect(result.html).not.toContain('Sản phẩm được bảo hành');
    expect(result.html).toContain('MÃ BẢO HÀNH');
    expect(result.html).toContain('border:1px solid #e5e7eb');
    expect(result.html).toContain('border-bottom:1px dashed #dbe4ef');
    expect(result.html).toContain('receipt-product-main');
    expect(result.html).toContain('receipt-product-code');
    expect(result.html).toContain('table-layout:fixed');
    expect(result.html).not.toContain(
      '.receipt-product-main, .receipt-product-code { display: block !important;',
    );
    expect(result.html).toContain('max-width:600px');
    expect(result.html).toContain(
      "font-family:'Inter', Arial, Helvetica, sans-serif",
    );
    expect(result.html).toContain('white-space:nowrap');
    expect(result.html).toContain('a[x-apple-data-detectors]');
    expect(result.html).not.toContain("font-family:'Courier New',monospace");
    expect(result.html).toContain(
      'https://fonts.googleapis.com/css?family=Inter:400,500,600,700',
    );
    expect(result.html).not.toContain('JetBrains Mono');
    expect(result.html).not.toContain(
      'background:#111827;background-color:#111827',
    );
  });
});
