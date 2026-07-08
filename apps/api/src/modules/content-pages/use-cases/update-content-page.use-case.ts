import { ConflictError, NotFoundError } from '@/common/response';
import { UpdateContentPageDto } from '@/modules/content-pages/dto/update-content-page.dto';
import { ContentPagesRepository } from '@/modules/content-pages/repository/content-pages.repository';
import { toContentPageResponse } from '@/modules/content-pages/content-pages.types';
import { Injectable } from '@nestjs/common';
import { content_page_status, Prisma } from '@prisma/client';

@Injectable()
export class UpdateContentPageUseCase {
  constructor(
    private readonly contentPagesRepository: ContentPagesRepository,
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
    const data: Prisma.ContentPageUpdateInput = {
      slug,
      title: dto.title?.trim(),
      summary: dto.summary?.trim(),
      content: dto.content?.trim(),
      kind: dto.kind,
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
