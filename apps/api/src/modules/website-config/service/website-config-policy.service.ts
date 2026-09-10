import { ValidationError } from '@/common/response/client-errors';
import { Injectable } from '@nestjs/common';
import type {
  UpdateWebsiteSiteSettingBody,
  WebsiteHomepageCopy,
} from '@repo/shared';
import { isWebsiteEditableText } from '@repo/shared/utils';

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
    this.assertHomepagePublishable(site.homepage.content);

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

  private assertHomepagePublishable(content: SiteDraft['homepage']['content']) {
    for (const locale of ['vi', 'en'] as const) {
      const copy = content[locale];
      this.assertHomepageStrings(copy, `homepage.content.${locale}`);

      for (const [field, value] of [
        ['warrantyYears', copy.sputter.warrantyYears],
        ['uvPercent', copy.sputter.uvPercent],
        ['irPercent', copy.sputter.irPercent],
        ['landing.hero.uvPercent', copy.landing.hero.uvPercent],
        ['landing.hero.originPercent', copy.landing.hero.originPercent],
        ['landing.hero.warrantyYears', copy.landing.hero.warrantyYears],
      ] as const) {
        if (!Number.isFinite(value) || value < 0 || value > 100) {
          this.invalidHomepageField(
            field.startsWith('landing.')
              ? `homepage.content.${locale}.${field}`
              : `homepage.content.${locale}.sputter.${field}`,
          );
        }
      }

      if (
        copy.comparison.standardItems.length !== 3 ||
        copy.comparison.fujitekItems.length !== 3
      ) {
        this.invalidHomepageField(`homepage.content.${locale}.comparison`);
      }
    }
  }

  private assertHomepageStrings(value: unknown, path: string) {
    if (typeof value === 'string') {
      if (!value.trim()) this.invalidHomepageField(path);
      return;
    }
    if (Array.isArray(value)) {
      value.forEach((item, index) =>
        this.assertHomepageStrings(item, `${path}.${index}`),
      );
      return;
    }
    if (!value || typeof value !== 'object') return;

    if ('content' in value && 'font' in value && 'size' in value) {
      if (!isWebsiteEditableText(value)) this.invalidHomepageField(path);
      if (!value.content.trim()) this.invalidHomepageField(`${path}.content`);
      return;
    }

    for (const [key, child] of Object.entries(
      value as Record<keyof WebsiteHomepageCopy, unknown>,
    )) {
      this.assertHomepageStrings(child, `${path}.${key}`);
    }
  }

  private invalidHomepageField(field: string): never {
    throw new ValidationError(
      'Homepage content is invalid',
      'WEBSITE_CONFIG_PUBLISH_INVALID',
      { field },
    );
  }

  private isEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  }
}
