import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from '@/common/response';
import { AssetsService } from '@/modules/assets/assets.service';
import { UpdateContentPageDto } from '@/modules/content-pages/dto/update-content-page.dto';
import { ContentPagesRepository } from '@/modules/content-pages/repository/content-pages.repository';
import { toContentPageResponse } from '@/modules/content-pages/content-pages.types';
import { Injectable } from '@nestjs/common';
import {
  asset_type,
  content_page_kind,
  content_page_status,
  Prisma,
} from '@prisma/client';
import { getRemovedMediaUrls } from '@repo/shared/utils';

@Injectable()
export class UpdateContentPageUseCase {
  constructor(
    private readonly contentPagesRepository: ContentPagesRepository,
    private readonly assetsService?: AssetsService,
  ) {}

  async execute(id: string, dto: UpdateContentPageDto) {
    const existingPage = await this.contentPagesRepository.findById(id);

    if (!existingPage) {
      throw new NotFoundError('Content page not found');
    }

    const slug = dto.slug?.trim().toLowerCase();

    if (slug && slug !== existingPage.slug) {
      const pageWithSlug = await this.contentPagesRepository.findBySlug(slug);

      if (pageWithSlug) {
        throw new ConflictError('Content page slug already exists');
      }
    }

    const nextStatus = dto.status ?? existingPage.status;
    const nextContent = dto.content?.trim();
    const nextKind = dto.kind ?? existingPage.kind;
    const effectiveContent = nextContent ?? existingPage.content;
    const effectiveFaqItems = dto.faqItems ?? existingPage.faq_items;

    this.validateContent(
      nextKind,
      nextStatus,
      effectiveContent,
      effectiveFaqItems,
    );

    if (nextContent !== undefined || dto.faqItems !== undefined) {
      const previousRichText = [
        existingPage.content,
        ...existingPage.faq_items.map((item) => item.answer),
      ].join('');
      const nextRichText = [
        nextContent ?? existingPage.content,
        ...(dto.faqItems?.map((item) => item.answer) ??
          existingPage.faq_items.map((item) => item.answer)),
      ].join('');
      const removedMediaUrls = getRemovedMediaUrls(
        previousRichText,
        nextRichText,
      );
      for (const url of removedMediaUrls) {
        await this.assetsService?.deleteAssetByUrl(url, {
          folder: 'rich-text',
          types: [asset_type.IMAGE, asset_type.VIDEO],
        });
      }
    }

    const data: Prisma.ContentPageUpdateInput = {
      slug,
      title: dto.title?.trim(),
      summary: dto.summary?.trim(),
      content: nextContent,
      kind: dto.kind,
      faq_items:
        nextKind === content_page_kind.FAQ
          ? dto.faqItems
            ? {
                deleteMany: {},
                create: dto.faqItems.map((item, index) => ({
                  answer: item.answer.trim(),
                  is_active: item.isActive ?? true,
                  question: item.question.trim(),
                  sort_order: index,
                })),
              }
            : undefined
          : { deleteMany: {} },
      category:
        dto.categoryId === undefined
          ? undefined
          : dto.categoryId
            ? { connect: { id: dto.categoryId } }
            : { disconnect: true },
      status: dto.status,
      published_at: this.resolvePublishedAt(
        nextStatus,
        dto.publishedAt,
        existingPage.published_at,
      ),
    };
    const page = await this.contentPagesRepository.update(id, data);

    return toContentPageResponse(page);
  }

  private validateContent(
    kind: content_page_kind,
    status: content_page_status,
    content: string,
    faqItems: Array<{ isActive?: boolean; is_active?: boolean }>,
  ) {
    if (kind !== content_page_kind.FAQ && !content) {
      throw new BadRequestError('Content is required for policy pages');
    }

    if (
      kind === content_page_kind.FAQ &&
      status === content_page_status.PUBLISHED &&
      !faqItems.some(
        (item) => item.isActive !== false && item.is_active !== false,
      )
    ) {
      throw new BadRequestError(
        'At least one active FAQ item is required before publishing',
      );
    }
  }

  private resolvePublishedAt(
    status: content_page_status,
    publishedAt?: string,
    currentPublishedAt?: Date | null,
  ) {
    if (publishedAt) {
      return new Date(publishedAt);
    }

    if (status === content_page_status.PUBLISHED) {
      return currentPublishedAt ?? new Date();
    }

    return null;
  }
}
