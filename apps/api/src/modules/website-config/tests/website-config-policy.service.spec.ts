import { WebsiteConfigPolicyService } from '@/modules/website-config/service/website-config-policy.service';
import { ValidationError } from '@/common/response/client-errors';
import { DEFAULT_WEBSITE_HOMEPAGE_CONTENT } from '@repo/shared/constants';

const validHomepage = {
  aboutImageAssetId: null,
  content: structuredClone(DEFAULT_WEBSITE_HOMEPAGE_CONTENT),
  sputterChamberImageAssetId: null,
  sputterStructureImageAssetId: null,
};

describe('WebsiteConfigPolicyService', () => {
  const policy = new WebsiteConfigPolicyService();

  it('rejects an active office without Vietnamese name and address', () => {
    expect(() =>
      policy.assertSitePublishable({
        contactEmail: 'contact@example.com',
        footerLogoAssetId: null,
        headerLogoAssetId: null,
        heroSlides: [],
        homepage: validHomepage,
        offices: [
          {
            id: 'c20b9c36-b839-4e47-9dd1-a75b43a34bca',
            isActive: true,
            isHeadquarters: false,
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

  it('rejects more than one headquarters office', () => {
    expect(() =>
      policy.assertSiteDraftValid({
        contactEmail: 'contact@example.com',
        footerLogoAssetId: null,
        headerLogoAssetId: null,
        heroSlides: [],
        homepage: validHomepage,
        offices: [
          {
            id: '10000000-0000-4000-8000-000000000001',
            isActive: true,
            isHeadquarters: true,
            phone: '0886 33 77 33',
            sortOrder: 0,
            translations: [],
          },
          {
            id: '10000000-0000-4000-8000-000000000002',
            isActive: true,
            isHeadquarters: true,
            phone: '0989 017 999',
            sortOrder: 1,
            translations: [],
          },
        ],
        socialLinks: [],
        ogImageAssetId: null,
        websiteUrl: 'https://example.com',
      }),
    ).toThrow(
      expect.objectContaining({
        code: 'WEBSITE_CONFIG_MULTIPLE_HEADQUARTERS',
      }) as ValidationError,
    );
  });

  it('rejects a non-HTTPS public website URL', () => {
    expect(() =>
      policy.assertSitePublishable({
        contactEmail: 'contact@example.com',
        footerLogoAssetId: null,
        headerLogoAssetId: null,
        heroSlides: [],
        homepage: validHomepage,
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
        heroSlides: [],
        homepage: validHomepage,
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

  it('rejects duplicate homepage hero slide keys', () => {
    expect(() =>
      policy.assertSitePublishable({
        contactEmail: 'contact@example.com',
        footerLogoAssetId: null,
        headerLogoAssetId: null,
        heroSlides: [
          {
            desktopAssetId: null,
            id: '10000000-0000-4000-8000-000000000001',
            isActive: true,
            key: 'primary',
            mobileAssetId: null,
            sortOrder: 0,
          },
          {
            desktopAssetId: null,
            id: '10000000-0000-4000-8000-000000000002',
            isActive: true,
            key: 'primary',
            mobileAssetId: null,
            sortOrder: 1,
          },
        ],
        homepage: validHomepage,
        offices: [],
        socialLinks: [],
        ogImageAssetId: null,
        websiteUrl: 'https://example.com',
      }),
    ).toThrow(
      expect.objectContaining({
        code: 'WEBSITE_CONFIG_PUBLISH_INVALID',
      }) as ValidationError,
    );
  });

  it('allows empty active custom slides so the public hero can use fallback', () => {
    expect(() =>
      policy.assertSitePublishable({
        contactEmail: 'contact@example.com',
        footerLogoAssetId: null,
        headerLogoAssetId: null,
        heroSlides: [
          {
            desktopAssetId: null,
            id: '20000000-0000-4000-8000-000000000001',
            isActive: true,
            key: 'custom-slide',
            mobileAssetId: null,
            sortOrder: 0,
          },
        ],
        homepage: validHomepage,
        offices: [],
        socialLinks: [],
        ogImageAssetId: null,
        websiteUrl: 'https://example.com',
      }),
    ).not.toThrow();
  });

  it('rejects blank required homepage copy before publishing', () => {
    const homepage = structuredClone(validHomepage);
    homepage.content.vi.about.title = '   ';

    expect(() =>
      policy.assertSitePublishable({
        contactEmail: 'contact@example.com',
        footerLogoAssetId: null,
        headerLogoAssetId: null,
        heroSlides: [],
        homepage,
        offices: [],
        socialLinks: [],
        ogImageAssetId: null,
        websiteUrl: 'https://example.com',
      }),
    ).toThrow(
      expect.objectContaining({
        code: 'WEBSITE_CONFIG_PUBLISH_INVALID',
        details: expect.objectContaining({
          field: 'homepage.content.vi.about.title',
        }),
      }) as ValidationError,
    );
  });

  it('rejects blank styled homepage text before publishing', () => {
    const homepage = structuredClone(validHomepage);
    homepage.content.vi.landing.hero.titlePrefix.content = '   ';

    expect(() =>
      policy.assertSitePublishable({
        contactEmail: 'contact@example.com',
        footerLogoAssetId: null,
        headerLogoAssetId: null,
        heroSlides: [],
        homepage,
        offices: [],
        socialLinks: [],
        ogImageAssetId: null,
        websiteUrl: 'https://example.com',
      }),
    ).toThrow(
      expect.objectContaining({
        code: 'WEBSITE_CONFIG_PUBLISH_INVALID',
        details: expect.objectContaining({
          field: 'homepage.content.vi.landing.hero.titlePrefix.content',
        }),
      }) as ValidationError,
    );
  });

  it('rejects styled homepage text with an unapproved token', () => {
    const homepage = structuredClone(
      validHomepage,
    ) as unknown as typeof validHomepage;
    const unsafeTitle = homepage.content.vi.landing.hero
      .titlePrefix as unknown as {
      color: string;
    };
    unsafeTitle.color = '#ff00ff';

    expect(() =>
      policy.assertSitePublishable({
        contactEmail: 'contact@example.com',
        footerLogoAssetId: null,
        headerLogoAssetId: null,
        heroSlides: [],
        homepage,
        offices: [],
        socialLinks: [],
        ogImageAssetId: null,
        websiteUrl: 'https://example.com',
      }),
    ).toThrow(
      expect.objectContaining({
        code: 'WEBSITE_CONFIG_PUBLISH_INVALID',
        details: expect.objectContaining({
          field: 'homepage.content.vi.landing.hero.titlePrefix',
        }),
      }) as ValidationError,
    );
  });
});
