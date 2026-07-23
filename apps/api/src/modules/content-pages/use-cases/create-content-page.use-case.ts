import { ConflictError } from '@/common/response';
import { CreateContentPageDto } from '@/modules/content-pages/dto/create-content-page.dto';
import { ContentPagesRepository } from '@/modules/content-pages/repository/content-pages.repository';
import { toContentPageResponse } from '@/modules/content-pages/content-pages.types';
import { Injectable } from '@nestjs/common';
import { content_page_status } from '@prisma/client';

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
    const page = await this.contentPagesRepository.create({
      slug,
      title: dto.title.trim(),
      summary: dto.summary?.trim(),
      content: dto.content.trim(),
      kind: dto.kind,
      category: dto.categoryId
        ? { connect: { id: dto.categoryId } }
        : undefined,
      status,
      published_at: this.resolvePublishedAt(status, dto.publishedAt),
    });

    return toContentPageResponse(page);
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
