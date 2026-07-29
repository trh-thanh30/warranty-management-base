import { ValidationError } from '@/common/response/client-errors';
import { Injectable } from '@nestjs/common';
import type { UpdateWebsiteSiteSettingBody } from '@repo/shared';

type SiteDraft = Omit<UpdateWebsiteSiteSettingBody, 'expectedVersion'>;

@Injectable()
export class WebsiteConfigPolicyService {
  assertSiteDraftValid(site: SiteDraft) {
    const headquarters = site.offices.filter((office) => office.isHeadquarters);
    if (headquarters.length > 1) {
      throw new ValidationError(
        'Only one headquarters office can be configured',
        'WEBSITE_CONFIG_MULTIPLE_HEADQUARTERS',
        { officeIds: headquarters.map((office) => office.id) },
      );
    }
  }

  assertSitePublishable(site: SiteDraft) {
    this.assertSiteDraftValid(site);

    if (!this.isEmail(site.contactEmail)) {
      throw new ValidationError(
        'Contact email is invalid',
        'WEBSITE_CONFIG_PUBLISH_INVALID',
        { field: 'contactEmail' },
      );
    }

    this.assertHttpsUrl(site.websiteUrl);

    const heroKeys = site.heroSlides.map((slide) => slide.key.trim());
    if (
      heroKeys.some((key) => !key) ||
      new Set(heroKeys).size !== heroKeys.length
    ) {
      throw new ValidationError(
        'Homepage hero slide keys must be non-empty and unique',
        'WEBSITE_CONFIG_PUBLISH_INVALID',
        { field: 'heroSlides' },
      );
    }

    for (const office of site.offices.filter((item) => item.isActive)) {
      const vi = office.translations.find(
        (translation) => translation.locale === 'vi',
      );
      if (!vi?.label.trim() || !vi.address.trim()) {
        throw new ValidationError(
          'Vietnamese office name and address are required before publishing',
          'WEBSITE_CONFIG_REQUIRED_LOCALE_MISSING',
          { locale: 'vi', officeId: office.id },
        );
      }
    }

    for (const social of site.socialLinks) {
      this.assertHttpsUrl(social.url);
    }
  }

  private assertHttpsUrl(href: string) {
    const normalizedHref = href.trim();

    try {
      const url = new URL(normalizedHref);
      if (url.protocol === 'https:') return;
    } catch {
      // Fall through to the stable validation error.
    }

    throw new ValidationError(
      'Website link is not allowed',
      'WEBSITE_CONFIG_URL_INVALID',
      { href: normalizedHref },
    );
  }

  private isEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  }
}
