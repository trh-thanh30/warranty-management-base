import { PrismaService } from '@/database/prisma/prisma.service';
import { normalizePagination, paginate } from '@/common/pagination/pagination';
import { ListContentPagesDto } from '@/modules/content-pages/dto/list-content-pages.dto';
import { Injectable } from '@nestjs/common';
import { content_page_status, Prisma } from '@prisma/client';

@Injectable()
export class ContentPagesRepository {
  constructor(private readonly prismaService: PrismaService) {}

  findById(id: string) {
    return this.prismaService.contentPage.findUnique({
      where: { id },
      include: {
        category: true,
        faq_items: { orderBy: { sort_order: 'asc' } },
      },
    });
  }

  findBySlug(slug: string) {
    return this.prismaService.contentPage.findUnique({
      where: { slug },
      include: {
        category: true,
        faq_items: { orderBy: { sort_order: 'asc' } },
      },
    });
  }

  findPublishedBySlug(slug: string) {
    return this.prismaService.contentPage.findFirst({
      where: {
        slug,
        status: content_page_status.PUBLISHED,
      },
      include: {
        category: true,
        faq_items: {
          where: { is_active: true },
          orderBy: { sort_order: 'asc' },
        },
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
            {
              faq_items: {
                some: {
                  OR: [
                    { question: { contains: search, mode: 'insensitive' } },
                    { answer: { contains: search, mode: 'insensitive' } },
                  ],
                },
              },
            },
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
          include: { category: true },
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
            {
              faq_items: {
                some: {
                  OR: [
                    { question: { contains: search, mode: 'insensitive' } },
                    { answer: { contains: search, mode: 'insensitive' } },
                  ],
                },
              },
            },
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
          include: { category: true },
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
    return this.prismaService.contentPage.create({
      data,
      include: {
        category: true,
        faq_items: { orderBy: { sort_order: 'asc' } },
      },
    });
  }

  update(id: string, data: Prisma.ContentPageUpdateInput) {
    return this.prismaService.contentPage.update({
      where: { id },
      data,
      include: {
        category: true,
        faq_items: { orderBy: { sort_order: 'asc' } },
      },
    });
  }

  async reorderFaqItems(contentPageId: string, itemIds: string[]) {
    await this.prismaService.$transaction(
      itemIds.map((id, sortOrder) =>
        this.prismaService.contentPageFaqItem.update({
          where: { id },
          data: { sort_order: sortOrder },
        }),
      ),
    );

    return this.prismaService.contentPage.findUniqueOrThrow({
      where: { id: contentPageId },
      include: {
        category: true,
        faq_items: { orderBy: { sort_order: 'asc' } },
      },
    });
  }

  findFaqItem(contentPageId: string, itemId: string) {
    return this.prismaService.contentPageFaqItem.findFirst({
      where: { content_page_id: contentPageId, id: itemId },
      include: { content_page: true },
    });
  }

  async createFaqItem(
    contentPageId: string,
    data: Pick<
      Prisma.ContentPageFaqItemCreateInput,
      'answer' | 'is_active' | 'question'
    >,
  ) {
    return this.prismaService.$transaction(async (tx) => {
      const lastItem = await tx.contentPageFaqItem.findFirst({
        where: { content_page_id: contentPageId },
        orderBy: { sort_order: 'desc' },
        select: { sort_order: true },
      });

      return tx.contentPageFaqItem.create({
        data: {
          ...data,
          content_page: { connect: { id: contentPageId } },
          sort_order: (lastItem?.sort_order ?? -1) + 1,
        },
      });
    });
  }

  updateFaqItem(itemId: string, data: Prisma.ContentPageFaqItemUpdateInput) {
    return this.prismaService.contentPageFaqItem.update({
      where: { id: itemId },
      data,
    });
  }

  async deleteFaqItem(contentPageId: string, itemId: string) {
    return this.prismaService.$transaction(async (tx) => {
      const deletedItem = await tx.contentPageFaqItem.delete({
        where: { id: itemId },
      });
      const remainingItems = await tx.contentPageFaqItem.findMany({
        where: { content_page_id: contentPageId },
        orderBy: { sort_order: 'asc' },
        select: { id: true },
      });
      await Promise.all(
        remainingItems.map((item, sortOrder) =>
          tx.contentPageFaqItem.update({
            where: { id: item.id },
            data: { sort_order: sortOrder },
          }),
        ),
      );
      return deletedItem;
    });
  }

  delete(id: string) {
    return this.prismaService.contentPage.delete({ where: { id } });
  }
}
