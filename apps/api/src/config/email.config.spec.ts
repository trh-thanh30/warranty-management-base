import { resolveEmailBrandLogoUrl } from '@/config/email.config';

describe('resolveEmailBrandLogoUrl', () => {
  it('uses an explicit public logo URL when configured', () => {
    expect(
      resolveEmailBrandLogoUrl(
        'https://static.example.com/brand/logo.png',
        'http://localhost:4100/cdn',
      ),
    ).toBe('https://static.example.com/brand/logo.png');
  });

  it('uses the seeded website logo when the asset CDN is public', () => {
    expect(
      resolveEmailBrandLogoUrl(undefined, 'https://cdn.example.com/cdn/'),
    ).toBe('https://cdn.example.com/cdn/website-config/logo_2.png');
  });

  it('falls back to the text lockup when the asset CDN is local', () => {
    expect(
      resolveEmailBrandLogoUrl(undefined, 'http://localhost:4100/cdn'),
    ).toBeUndefined();
  });
});
