import { WebsiteConfigPolicyService } from '@/modules/website-config/service/website-config-policy.service';
import { ValidationError } from '@/common/response/client-errors';

describe('WebsiteConfigPolicyService', () => {
  const policy = new WebsiteConfigPolicyService();

  it('rejects an active office without Vietnamese name and address', () => {
    expect(() =>
      policy.assertSitePublishable({
        contactEmail: 'contact@example.com',
        footerLogoAssetId: null,
        headerLogoAssetId: null,
        offices: [
          {
            id: 'c20b9c36-b839-4e47-9dd1-a75b43a34bca',
            isActive: true,
            phone: null,
            sortOrder: 0,
            translations: [
              { address: '', label: '', locale: 'vi' },
              { address: '', label: '', locale: 'en' },
            ],
          },
        ],
        socialLinks: [],
        ogImageAssetId: null,
        websiteUrl: 'https://example.com',
      }),
    ).toThrow(
      expect.objectContaining({
        code: 'WEBSITE_CONFIG_REQUIRED_LOCALE_MISSING',
      }) as ValidationError,
    );
  });

  it('rejects a non-HTTPS public website URL', () => {
    expect(() =>
      policy.assertSitePublishable({
        contactEmail: 'contact@example.com',
        footerLogoAssetId: null,
        headerLogoAssetId: null,
        offices: [],
        socialLinks: [],
        ogImageAssetId: null,
        websiteUrl: 'http://example.com',
      }),
    ).toThrow(
      expect.objectContaining({
        code: 'WEBSITE_CONFIG_URL_INVALID',
      }) as ValidationError,
    );
  });

  it('rejects unsafe social links', () => {
    expect(() =>
      policy.assertSitePublishable({
        contactEmail: 'contact@example.com',
        footerLogoAssetId: null,
        headerLogoAssetId: null,
        offices: [],
        socialLinks: [
          {
            id: 'c20b9c36-b839-4e47-9dd1-a75b43a34bca',
            isActive: true,
            label: 'Unsafe',
            platform: 'OTHER',
            sortOrder: 0,
            url: 'javascript:alert(1)',
          },
        ],
        ogImageAssetId: null,
        websiteUrl: 'https://example.com',
      }),
    ).toThrow(
      expect.objectContaining({
        code: 'WEBSITE_CONFIG_URL_INVALID',
      }) as ValidationError,
    );
  });
});
