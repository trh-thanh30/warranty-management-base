import { BadRequestError, ConflictError } from '@/common/response';
import { CreateContentPageDto } from '@/modules/content-pages/dto/create-content-page.dto';
import { ContentPagesRepository } from '@/modules/content-pages/repository/content-pages.repository';
import { toContentPageResponse } from '@/modules/content-pages/content-pages.types';
import { Injectable } from '@nestjs/common';
import { content_page_kind, content_page_status } from '@prisma/client';

@Injectable()
export class CreateContentPageUseCase {
  constructor(
    private readonly contentPagesRepository: ContentPagesRepository,
  ) {}

  async execute(dto: CreateContentPageDto) {
    const slug = dto.slug.trim().toLowerCase();
    const existingPage = await this.contentPagesRepository.findBySlug(slug);

    if (existingPage) {
      throw new ConflictError('Content page slug already exists');
    }

    const status = dto.status ?? content_page_status.DRAFT;
    const kind = dto.kind ?? content_page_kind.GENERAL_POLICY;
    const content = dto.content?.trim() ?? '';

    this.validateContent(kind, status, content, dto.faqItems);

    const page = await this.contentPagesRepository.create({
      slug,
      title: dto.title.trim(),
      summary: dto.summary?.trim(),
      content,
      kind,
      faq_items:
        kind === content_page_kind.FAQ && dto.faqItems
          ? {
              create: dto.faqItems.map((item, index) => ({
                answer: item.answer.trim(),
                is_active: item.isActive ?? true,
                question: item.question.trim(),
                sort_order: index,
              })),
            }
          : undefined,
      category: dto.categoryId
        ? { connect: { id: dto.categoryId } }
        : undefined,
      status,
      published_at: this.resolvePublishedAt(status, dto.publishedAt),
    });

    return toContentPageResponse(page);
  }

  private validateContent(
    kind: content_page_kind,
    status: content_page_status,
    content: string,
    faqItems?: Array<{ answer: string; isActive?: boolean; question: string }>,
  ) {
    if (kind !== content_page_kind.FAQ && !content) {
      throw new BadRequestError('Content is required for policy pages');
    }

    if (
      kind === content_page_kind.FAQ &&
      status === content_page_status.PUBLISHED &&
      !faqItems?.some((item) => item.isActive !== false)
    ) {
      throw new BadRequestError(
        'At least one active FAQ item is required before publishing',
      );
    }
  }

  private resolvePublishedAt(
    status: content_page_status,
    publishedAt?: string,
  ) {
    if (publishedAt) {
      return new Date(publishedAt);
    }

    return status === content_page_status.PUBLISHED ? new Date() : null;
  }
}
