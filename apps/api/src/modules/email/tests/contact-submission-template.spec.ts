import Handlebars from 'handlebars';
import mjml2html from 'mjml';
import { readFileSync } from 'node:fs';
import path from 'node:path';

type MjmlRenderResult = { html: string; errors: unknown[] };
const renderMjml = mjml2html as unknown as (
  source: string,
  options: { validationLevel: 'strict' },
) => Promise<MjmlRenderResult>;

describe('contact submission email template', () => {
  const template = Handlebars.compile(
    readFileSync(
      path.resolve(
        process.cwd(),
        'src/modules/email/templates/contact-submission.mjml.hbs',
      ),
      'utf8',
    ),
  );

  const context = {
    to: 'admin@lexzenz.vn',
    brandLogoUrl: 'https://baohanh.lexzenz.com/logo_2.png',
    subject: 'Lời nhắn liên hệ mới',
    fullName: 'Nguyễn Văn A',
    phone: '0886337733',
    consultationTopic: 'Tư vấn sản phẩm',
    provinceName: 'TP. Hồ Chí Minh',
    createdAt: '17/09/2026 23:30',
    content: 'Tôi muốn được tư vấn phim cách nhiệt.',
    detailUrl: 'https://admin.lexzenz.com/contact-submissions/contact-1',
    year: 2026,
  };

  it('renders the branded contact card and admin action', async () => {
    const result = await renderMjml(template(context), {
      validationLevel: 'strict',
    });

    expect(result.errors).toEqual([]);
    expect(result.html).toContain('FUJITEK');
    expect(result.html).toContain('LEXZENZ');
    expect(result.html).toContain('https://baohanh.lexzenz.com/logo_2.png');
    expect(result.html).toContain('Lời nhắn liên hệ mới');
    expect(result.html).toContain('Nguyễn Văn A');
    expect(result.html).toContain(
      'Xin chào quản trị viên, <strong>admin@lexzenz.vn</strong>',
    );
    expect(result.html).toContain('0886337733');
    expect(result.html).toContain('Tư vấn sản phẩm');
    expect(result.html).toContain('Tôi muốn được tư vấn phim cách nhiệt.');
    expect(result.html).toContain(
      'https://admin.lexzenz.com/contact-submissions/contact-1',
    );
  });

  it('escapes untrusted contact content and works without logo or admin URL', async () => {
    const result = await renderMjml(
      template({
        ...context,
        brandLogoUrl: undefined,
        detailUrl: undefined,
        fullName: '<script>alert(1)</script>',
        content: '<img src=x onerror=alert(1)>',
      }),
      { validationLevel: 'strict' },
    );

    expect(result.errors).toEqual([]);
    expect(result.html).not.toContain('<script>');
    expect(result.html).not.toContain('<img src=x onerror=alert(1)>');
    expect(result.html).not.toContain('Xem lời nhắn trong Admin');
    expect(result.html).toContain('FUJITEK');
  });
});
