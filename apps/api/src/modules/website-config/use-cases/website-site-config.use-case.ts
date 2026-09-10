import { NotFoundError } from '@/common/response/client-errors';
import { AssetsService } from '@/modules/assets/assets.service';
import {
  WebsiteConfigRepository,
  type WebsiteSiteRevisionRecord,
} from '@/modules/website-config/repository/website-config.repository';
import { WebsiteConfigPolicyService } from '@/modules/website-config/service/website-config-policy.service';
import { Injectable } from '@nestjs/common';
import type {
  PublicWebsiteSiteSetting,
  UpdateWebsiteSiteSettingBody,
  WebsiteConfigOverview,
  WebsiteConfigOverviewItem,
  WebsiteLocale,
  WebsiteRevisionMeta,
  WebsiteSiteSetting,
} from '@repo/shared';
import { resolveWebsiteHomepageContent } from '@repo/shared/utils';
import type { Asset, User } from '@prisma/client';

@Injectable()
export class WebsiteSiteConfigUseCase {
  constructor(
    private readonly repository: WebsiteConfigRepository,
    private readonly policy: WebsiteConfigPolicyService,
    private readonly assetsService: AssetsService,
  ) {}

  async get() {
    const [draft, published] = await Promise.all([
      this.repository.getOrCreateSiteDraft(),
      this.repository.findSitePublished(),
    ]);
    return this.mapSite(draft, published);
  }

  async save(input: UpdateWebsiteSiteSettingBody, actorId: string) {
    this.policy.assertSiteDraftValid(input);
    const draft = await this.repository.saveSiteDraft(input, actorId);
    const published = await this.repository.findSitePublished();
    return this.mapSite(draft, published);
  }

  async preview(locale: WebsiteLocale) {
    const draft = await this.repository.getOrCreateSiteDraft();
    return this.mapPublicSite(draft, locale);
  }

  async publish(expectedVersion: number, actorId: string) {
    const result = await this.repository.publishSite(
      expectedVersion,
      actorId,
      (draft) => this.assertSiteRevisionPublishable(draft),
    );
    return this.mapSite(result.draft, result.published);
  }

  async getPublic(locale: WebsiteLocale) {
    const published = await this.repository.findSitePublished();
    if (!published) {
      throw new NotFoundError('Published website site settings not found');
    }
    return this.mapPublicSite(published, locale);
  }

  async overview(): Promise<WebsiteConfigOverview> {
    const records = await this.repository.getOverviewRecords();
    return {
      items: [this.mapOverviewItem('site', records.site)],
    };
  }

  private assertSiteRevisionPublishable(draft: WebsiteSiteRevisionRecord) {
    const homepageContent = resolveWebsiteHomepageContent(
      draft.homepage_content,
    );
    this.policy.assertSitePublishable({
      contactEmail: draft.contact_email,
      footerLogoAssetId: draft.footer_logo_asset_id,
      headerLogoAssetId: draft.header_logo_asset_id,
      heroSlides: draft.hero_slides.map((slide) => ({
        desktopAssetId: slide.desktop_asset_id,
        id: slide.id,
        isActive: slide.is_active,
        key: slide.key,
        mobileAssetId: slide.mobile_asset_id,
        sortOrder: slide.sort_order,
      })),
      homepage: {
        aboutImageAssetId: draft.homepage_about_image_asset_id,
        content: homepageContent,
        sputterChamberImageAssetId: draft.homepage_sputter_chamber_asset_id,
        sputterStructureImageAssetId: draft.homepage_sputter_structure_asset_id,
      },
      offices: draft.offices.map((office) => ({
        id: office.id,
        isActive: office.is_active,
        isHeadquarters: office.is_headquarters,
        phone: office.phone,
        sortOrder: office.sort_order,
        translations: office.translations.map((translation) => ({
          address: translation.address,
          label: translation.label,
          locale: this.locale(translation.locale),
        })),
      })),
      socialLinks: draft.social_links.map((social) => ({
        id: social.id,
        isActive: social.is_active,
        label: social.label,
        platform: social.platform,
        sortOrder: social.sort_order,
        url: social.url,
      })),
      ogImageAssetId: draft.og_image_asset_id,
      websiteUrl: draft.website_url,
    });
  }

  private mapSite(
    draft: WebsiteSiteRevisionRecord,
    published: WebsiteSiteRevisionRecord | null,
  ): WebsiteSiteSetting {
    const homepageContent = resolveWebsiteHomepageContent(
      draft.homepage_content,
    );
    return {
      contactEmail: draft.contact_email,
      footerLogo: this.asset(draft.footer_logo),
      headerLogo: this.asset(draft.header_logo),
      heroSlides: draft.hero_slides.map((slide) => ({
        desktopImage: this.asset(slide.desktop_image),
        id: slide.id,
        isActive: slide.is_active,
        key: slide.key,
        mobileImage: this.asset(slide.mobile_image),
        sortOrder: slide.sort_order,
      })),
      homepage: {
        aboutImage: this.asset(draft.homepage_about_image),
        content: homepageContent,
        sputterChamberImage: this.asset(draft.homepage_sputter_chamber_image),
        sputterStructureImage: this.asset(
          draft.homepage_sputter_structure_image,
        ),
      },
      offices: draft.offices.map((office) => ({
        id: office.id,
        isActive: office.is_active,
        isHeadquarters: office.is_headquarters,
        phone: office.phone,
        sortOrder: office.sort_order,
        translations: office.translations.map((translation) => ({
          address: translation.address,
          label: translation.label,
          locale: this.locale(translation.locale),
        })),
      })),
      revision: this.revision(draft, published),
      siteKey: draft.site_key,
      socialLinks: draft.social_links.map((social) => ({
        id: social.id,
        isActive: social.is_active,
        label: social.label,
        platform: social.platform,
        sortOrder: social.sort_order,
        url: social.url,
      })),
      ogImage: this.asset(draft.og_image),
      websiteUrl: draft.website_url,
    };
  }

  private mapPublicSite(
    revision: WebsiteSiteRevisionRecord,
    locale: WebsiteLocale,
  ): PublicWebsiteSiteSetting {
    const homepageContent = resolveWebsiteHomepageContent(
      revision.homepage_content,
    );
    return {
      contactEmail: revision.contact_email,
      footerLogo: this.asset(revision.footer_logo),
      headerLogo: this.asset(revision.header_logo),
      heroSlides: revision.hero_slides
        .filter((slide) => slide.is_active)
        .map((slide) => ({
          desktopImage: this.asset(slide.desktop_image),
          id: slide.id,
          isActive: slide.is_active,
          key: slide.key,
          mobileImage: this.asset(slide.mobile_image),
          sortOrder: slide.sort_order,
        })),
      homepage: {
        aboutImage: this.asset(revision.homepage_about_image),
        copy: homepageContent[locale],
        sputterChamberImage: this.asset(
          revision.homepage_sputter_chamber_image,
        ),
        sputterStructureImage: this.asset(
          revision.homepage_sputter_structure_image,
        ),
      },
      locale,
      offices: revision.offices
        .filter((office) => office.is_active)
        .map((office) => {
          const translation =
            office.translations.find(
              (item) => this.locale(item.locale) === locale,
            ) ??
            office.translations.find(
              (item) => this.locale(item.locale) === 'vi',
            );
          return {
            address: translation?.address ?? '',
            id: office.id,
            isActive: office.is_active,
            isHeadquarters: office.is_headquarters,
            label: translation?.label ?? '',
            phone: office.phone,
            sortOrder: office.sort_order,
          };
        }),
      socialLinks: revision.social_links
        .filter((social) => social.is_active)
        .map((social) => ({
          id: social.id,
          isActive: social.is_active,
          label: social.label,
          platform: social.platform,
          sortOrder: social.sort_order,
          url: social.url,
        })),
      ogImage: this.asset(revision.og_image),
      updatedAt: revision.updated_at.toISOString(),
      version: revision.revision_number,
      websiteUrl: revision.website_url,
    };
  }

  private revision(
    draft: {
      lock_version: number;
      revision_number: number;
      updated_at: Date;
    },
    published: {
      published_at: Date | null;
      published_by: User | null;
      revision_number: number;
      updated_at: Date;
    } | null,
  ): WebsiteRevisionMeta {
    return {
      draftVersion: draft.lock_version,
      hasUnpublishedChanges:
        !published ||
        draft.lock_version > 1 ||
        draft.revision_number !== published.revision_number + 1,
      lastPublishedAt: published?.published_at?.toISOString() ?? null,
      lastPublishedBy: published?.published_by
        ? {
            id: published.published_by.id,
            name:
              published.published_by.full_name ??
              published.published_by.username,
          }
        : null,
      publishedVersion: published?.revision_number ?? null,
    };
  }

  private asset(asset: Asset | null) {
    if (!asset) return null;
    const enriched = this.assetsService.enrichAssetUrl(asset);
    return {
      id: enriched.id,
      mimeType: enriched.mime_type,
      url: enriched.url,
    };
  }

  private locale(locale: 'VI' | 'EN'): WebsiteLocale {
    return locale === 'EN' ? 'en' : 'vi';
  }

  private mapOverviewItem(
    key: WebsiteConfigOverviewItem['key'],
    record: {
      draft:
        | ({
            lock_version: number;
            revision_number: number;
            updated_at: Date;
          } & { published_by?: User | null })
        | null;
      published: {
        published_at: Date | null;
        published_by: User | null;
        revision_number: number;
        updated_at: Date;
      } | null;
    },
  ): WebsiteConfigOverviewItem {
    const revision = record.draft
      ? this.revision(record.draft, record.published)
      : {
          draftVersion: 0,
          hasUnpublishedChanges: false,
          lastPublishedAt:
            record.published?.published_at?.toISOString() ?? null,
          lastPublishedBy: record.published?.published_by
            ? {
                id: record.published.published_by.id,
                name:
                  record.published.published_by.full_name ??
                  record.published.published_by.username,
              }
            : null,
          publishedVersion: record.published?.revision_number ?? null,
        };
    return {
      ...revision,
      key,
      status:
        !record.draft && !record.published
          ? 'NOT_CONFIGURED'
          : revision.hasUnpublishedChanges
            ? record.published
              ? 'UNPUBLISHED_CHANGES'
              : 'DRAFT'
            : 'PUBLISHED',
      validationWarningCount: 0,
    };
  }
}
