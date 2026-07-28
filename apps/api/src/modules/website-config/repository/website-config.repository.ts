import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from '@/common/response/client-errors';
import { PrismaService } from '@/database/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import {
  asset_access_type,
  Prisma,
  website_config_audit_action,
  website_config_domain,
  website_locale,
  website_revision_state,
} from '@prisma/client';
import type { UpdateWebsiteSiteSettingBody } from '@repo/shared';

export const websiteSiteRevisionInclude = {
  footer_logo: true,
  header_logo: true,
  og_image: true,
  hero_slides: {
    include: { desktop_image: true, mobile_image: true },
    orderBy: { sort_order: 'asc' },
  },
  offices: {
    include: { translations: true },
    orderBy: { sort_order: 'asc' },
  },
  published_by: true,
  social_links: { orderBy: { sort_order: 'asc' } },
} satisfies Prisma.WebsiteSiteRevisionInclude;

export type WebsiteSiteRevisionRecord = Prisma.WebsiteSiteRevisionGetPayload<{
  include: typeof websiteSiteRevisionInclude;
}>;

const toLocale = (locale: string) =>
  locale === 'en' ? website_locale.EN : website_locale.VI;

@Injectable()
export class WebsiteConfigRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getOrCreateSiteDraft(siteKey = 'main') {
    const existing = await this.findSiteRevision(
      siteKey,
      website_revision_state.DRAFT,
    );
    if (existing) return existing;

    return this.prisma.websiteSiteRevision.create({
      data: {
        site_key: siteKey,
      },
      include: websiteSiteRevisionInclude,
    });
  }

  findSitePublished(siteKey = 'main') {
    return this.findSiteRevision(siteKey, website_revision_state.PUBLISHED);
  }

  async saveSiteDraft(
    input: UpdateWebsiteSiteSettingBody,
    actorId: string,
    siteKey = 'main',
  ) {
    await this.getOrCreateSiteDraft(siteKey);

    return this.prisma.$transaction(async (tx) => {
      const draft = await tx.websiteSiteRevision.findFirst({
        where: { site_key: siteKey, state: website_revision_state.DRAFT },
        orderBy: { updated_at: 'desc' },
        include: websiteSiteRevisionInclude,
      });
      if (!draft) throw new NotFoundError('Website site draft not found');

      await this.assertExpectedVersion(
        tx,
        'websiteSiteRevision',
        draft.id,
        input.expectedVersion,
        draft.lock_version,
      );
      await this.assertPublicImageAssets(tx, [
        input.headerLogoAssetId,
        input.footerLogoAssetId,
        input.ogImageAssetId,
      ]);

      await Promise.all([
        tx.websiteOffice.deleteMany({ where: { revision_id: draft.id } }),
        tx.websiteSocialLink.deleteMany({ where: { revision_id: draft.id } }),
        tx.websiteHeroSlide.deleteMany({ where: { revision_id: draft.id } }),
      ]);
      await this.assertPublicImageAssets(
        tx,
        input.heroSlides.flatMap((slide) => [
          slide.desktopAssetId,
          slide.mobileAssetId,
        ]),
      );

      const updated = await tx.websiteSiteRevision.update({
        where: { id: draft.id },
        data: {
          contact_email: input.contactEmail.trim(),
          footer_logo_asset_id: input.footerLogoAssetId,
          header_logo_asset_id: input.headerLogoAssetId,
          lock_version: { increment: 1 },
          og_image_asset_id: input.ogImageAssetId,
          website_url: input.websiteUrl.trim(),
          hero_slides: {
            create: input.heroSlides.map((slide) => ({
              id: slide.id,
              key: slide.key.trim(),
              desktop_asset_id: slide.desktopAssetId,
              mobile_asset_id: slide.mobileAssetId,
              is_active: slide.isActive,
              sort_order: slide.sortOrder,
            })),
          },
          offices: {
            create: input.offices.map((office) => ({
              id: office.id,
              is_active: office.isActive,
              phone: office.phone?.trim() || null,
              sort_order: office.sortOrder,
              translations: {
                create: office.translations.map((translation) => ({
                  address: translation.address.trim(),
                  label: translation.label.trim(),
                  locale: toLocale(translation.locale),
                })),
              },
            })),
          },
          social_links: {
            create: input.socialLinks.map((social) => ({
              id: social.id,
              is_active: social.isActive,
              label: social.label.trim(),
              platform: social.platform,
              sort_order: social.sortOrder,
              url: social.url.trim(),
            })),
          },
        },
        include: websiteSiteRevisionInclude,
      });

      await tx.websiteConfigAudit.create({
        data: {
          action: website_config_audit_action.SAVE_DRAFT,
          actor_id: actorId,
          after_version: updated.lock_version,
          before_version: draft.lock_version,
          domain: website_config_domain.SITE,
          entity_id: draft.id,
          site_key: siteKey,
        },
      });

      return updated;
    });
  }

  async publishSite(
    expectedVersion: number,
    actorId: string,
    validate: (draft: WebsiteSiteRevisionRecord) => void,
    siteKey = 'main',
  ) {
    return this.prisma.$transaction(async (tx) => {
      const draft = await tx.websiteSiteRevision.findFirst({
        where: { site_key: siteKey, state: website_revision_state.DRAFT },
        orderBy: { updated_at: 'desc' },
        include: websiteSiteRevisionInclude,
      });
      if (!draft) throw new NotFoundError('Website site draft not found');

      await this.assertExpectedVersion(
        tx,
        'websiteSiteRevision',
        draft.id,
        expectedVersion,
        draft.lock_version,
      );
      validate(draft);
      await this.assertPublicImageAssets(tx, [
        draft.header_logo_asset_id,
        draft.footer_logo_asset_id,
        draft.og_image_asset_id,
        ...draft.hero_slides.flatMap((slide) => [
          slide.desktop_asset_id,
          slide.mobile_asset_id,
        ]),
      ]);

      const previous = await tx.websiteSiteRevision.findFirst({
        where: { site_key: siteKey, state: website_revision_state.PUBLISHED },
        orderBy: { revision_number: 'desc' },
      });
      const publishedVersion = (previous?.revision_number ?? 0) + 1;

      if (previous) {
        await tx.websiteSiteRevision.update({
          where: { id: previous.id },
          data: { state: website_revision_state.ARCHIVED },
        });
      }

      const published = await tx.websiteSiteRevision.update({
        where: { id: draft.id },
        data: {
          lock_version: { increment: 1 },
          published_at: new Date(),
          published_by_id: actorId,
          revision_number: publishedVersion,
          state: website_revision_state.PUBLISHED,
        },
        include: websiteSiteRevisionInclude,
      });

      const nextDraft = await tx.websiteSiteRevision.create({
        data: this.cloneSiteRevisionData(published, publishedVersion + 1),
        include: websiteSiteRevisionInclude,
      });

      await tx.websiteConfigAudit.create({
        data: {
          action: website_config_audit_action.PUBLISH,
          actor_id: actorId,
          after_version: publishedVersion,
          before_version: previous?.revision_number,
          domain: website_config_domain.SITE,
          entity_id: published.id,
          site_key: siteKey,
        },
      });

      return { draft: nextDraft, published };
    });
  }

  async getOverviewRecords(siteKey = 'main') {
    const [siteDraft, sitePublished] = await Promise.all([
      this.prisma.websiteSiteRevision.findFirst({
        where: { site_key: siteKey, state: website_revision_state.DRAFT },
        orderBy: { updated_at: 'desc' },
        include: { published_by: true },
      }),
      this.prisma.websiteSiteRevision.findFirst({
        where: { site_key: siteKey, state: website_revision_state.PUBLISHED },
        orderBy: { revision_number: 'desc' },
        include: { published_by: true },
      }),
    ]);

    return {
      site: { draft: siteDraft, published: sitePublished },
    };
  }

  private findSiteRevision(siteKey: string, state: website_revision_state) {
    return this.prisma.websiteSiteRevision.findFirst({
      where: { site_key: siteKey, state },
      orderBy:
        state === website_revision_state.PUBLISHED
          ? { revision_number: 'desc' }
          : { updated_at: 'desc' },
      include: websiteSiteRevisionInclude,
    });
  }

  private cloneSiteRevisionData(
    source: WebsiteSiteRevisionRecord,
    revisionNumber: number,
  ): Prisma.WebsiteSiteRevisionCreateInput {
    return {
      contact_email: source.contact_email,
      footer_logo: source.footer_logo
        ? { connect: { id: source.footer_logo.id } }
        : undefined,
      header_logo: source.header_logo
        ? { connect: { id: source.header_logo.id } }
        : undefined,
      lock_version: 1,
      hero_slides: {
        create: source.hero_slides.map((slide) => ({
          key: slide.key,
          desktop_image: slide.desktop_image
            ? { connect: { id: slide.desktop_image.id } }
            : undefined,
          mobile_image: slide.mobile_image
            ? { connect: { id: slide.mobile_image.id } }
            : undefined,
          is_active: slide.is_active,
          sort_order: slide.sort_order,
        })),
      },
      offices: {
        create: source.offices.map((office) => ({
          is_active: office.is_active,
          phone: office.phone,
          sort_order: office.sort_order,
          translations: {
            create: office.translations.map((translation) => ({
              address: translation.address,
              label: translation.label,
              locale: translation.locale,
            })),
          },
        })),
      },
      og_image: source.og_image
        ? { connect: { id: source.og_image.id } }
        : undefined,
      revision_number: revisionNumber,
      site_key: source.site_key,
      social_links: {
        create: source.social_links.map((social) => ({
          is_active: social.is_active,
          label: social.label,
          platform: social.platform,
          sort_order: social.sort_order,
          url: social.url,
        })),
      },
      state: website_revision_state.DRAFT,
      website_url: source.website_url,
    };
  }

  private async assertPublicImageAssets(
    tx: Prisma.TransactionClient,
    ids: Array<string | null>,
  ) {
    const assetIds = [
      ...new Set(ids.filter((id): id is string => Boolean(id))),
    ];
    if (assetIds.length === 0) return;

    const count = await tx.asset.count({
      where: {
        access_type: asset_access_type.PUBLIC,
        id: { in: assetIds },
        is_deleted: false,
        mime_type: { startsWith: 'image/' },
      },
    });
    if (count !== assetIds.length) {
      throw new ValidationError(
        'One or more website assets are unavailable',
        'WEBSITE_CONFIG_ASSET_INVALID',
        { assetIds },
      );
    }
  }

  private async assertExpectedVersion(
    tx: Prisma.TransactionClient,
    model: 'websiteSiteRevision',
    id: string,
    expectedVersion: number,
    currentVersion: number,
  ) {
    const result = await tx[model].updateMany({
      where: { id, lock_version: expectedVersion },
      data: { lock_version: { increment: 0 } },
    });
    if (result.count === 0) {
      throw new ConflictError(
        'Website configuration has changed since it was loaded',
        'WEBSITE_CONFIG_VERSION_CONFLICT',
        { currentVersion, expectedVersion },
      );
    }
  }
}
