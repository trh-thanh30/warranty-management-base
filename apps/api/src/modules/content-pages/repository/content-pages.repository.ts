import { PrismaService } from '@/database/prisma/prisma.service';
import { ListContentPagesDto } from '@/modules/content-pages/dto/list-content-pages.dto';
import { Injectable } from '@nestjs/common';
import { content_page_status, Prisma } from '@prisma/client';

@Injectable()
export class ContentPagesRepository {
  constructor(private readonly prismaService: PrismaService) {}

  findById(id: string) {
    return this.prismaService.contentPage.findUnique({ where: { id } });
  }

  findBySlug(slug: string) {
    return this.prismaService.contentPage.findUnique({ where: { slug } });
  }

  findPublishedBySlug(slug: string) {
    return this.prismaService.contentPage.findFirst({
      where: {
        slug,
        status: content_page_status.PUBLISHED,
      },
    });
  }

  list(filters: ListContentPagesDto) {
    const search = filters.search?.trim();

    return this.prismaService.contentPage.findMany({
      where: {
        kind: filters.kind,
        status: filters.status,
        OR: search
          ? [
              { slug: { contains: search, mode: 'insensitive' } },
              { title: { contains: search, mode: 'insensitive' } },
              { summary: { contains: search, mode: 'insensitive' } },
              { content: { contains: search, mode: 'insensitive' } },
            ]
          : undefined,
      },
      orderBy: [{ status: 'asc' }, { kind: 'asc' }, { updated_at: 'desc' }],
    });
  }

  listPublished(filters: Pick<ListContentPagesDto, 'kind' | 'search'>) {
    const search = filters.search?.trim();

    return this.prismaService.contentPage.findMany({
      where: {
        kind: filters.kind,
        status: content_page_status.PUBLISHED,
        OR: search
          ? [
              { slug: { contains: search, mode: 'insensitive' } },
              { title: { contains: search, mode: 'insensitive' } },
              { summary: { contains: search, mode: 'insensitive' } },
              { content: { contains: search, mode: 'insensitive' } },
            ]
          : undefined,
      },
      orderBy: [{ kind: 'asc' }, { published_at: 'desc' }, { title: 'asc' }],
    });
  }

  create(data: Prisma.ContentPageCreateInput) {
    return this.prismaService.contentPage.create({ data });
  }

  update(id: string, data: Prisma.ContentPageUpdateInput) {
    return this.prismaService.contentPage.update({
      where: { id },
      data,
    });
  }

  delete(id: string) {
    return this.prismaService.contentPage.delete({ where: { id } });
  }
}
