import { PrismaService } from '@/database/prisma/prisma.service';
import { normalizePagination, paginate } from '@/common/pagination/pagination';
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
    const { page, limit, skip, take } = normalizePagination(filters);
    const sortMap = {
      slug: 'slug',
      title: 'title',
      kind: 'kind',
      status: 'status',
      publishedAt: 'published_at',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    } satisfies Record<
      string,
      keyof Prisma.ContentPageOrderByWithRelationInput
    >;
    const sortBy = filters.sortBy ? sortMap[filters.sortBy] : undefined;
    const where: Prisma.ContentPageWhereInput = {
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
    };
    const orderBy: Prisma.ContentPageOrderByWithRelationInput[] = sortBy
      ? [{ [sortBy]: filters.sortOrder ?? 'desc' }]
      : [{ status: 'asc' }, { kind: 'asc' }, { updated_at: 'desc' }];

    return this.prismaService.$transaction(async (tx) => {
      const [items, total] = await Promise.all([
        tx.contentPage.findMany({
          where,
          orderBy,
          skip,
          take,
        }),
        tx.contentPage.count({ where }),
      ]);

      return paginate(items, { page, limit, total });
    });
  }

  listPublished(
    filters: Pick<
      ListContentPagesDto,
      'kind' | 'search' | 'page' | 'limit' | 'sortBy' | 'sortOrder'
    >,
  ) {
    const search = filters.search?.trim();
    const { page, limit, skip, take } = normalizePagination(filters);
    const sortMap = {
      title: 'title',
      kind: 'kind',
      publishedAt: 'published_at',
      updatedAt: 'updated_at',
    } satisfies Record<
      string,
      keyof Prisma.ContentPageOrderByWithRelationInput
    >;
    const sortBy = filters.sortBy ? sortMap[filters.sortBy] : undefined;
    const where: Prisma.ContentPageWhereInput = {
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
    };
    const orderBy: Prisma.ContentPageOrderByWithRelationInput[] = sortBy
      ? [{ [sortBy]: filters.sortOrder ?? 'desc' }]
      : [{ kind: 'asc' }, { published_at: 'desc' }, { title: 'asc' }];

    return this.prismaService.$transaction(async (tx) => {
      const [items, total] = await Promise.all([
        tx.contentPage.findMany({
          where,
          orderBy,
          skip,
          take,
        }),
        tx.contentPage.count({ where }),
      ]);

      return paginate(items, { page, limit, total });
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
