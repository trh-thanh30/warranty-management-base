import { normalizePagination, paginate } from '@/common/pagination/pagination';
import { PrismaService } from '@/database/prisma/prisma.service';
import { ListCategoriesDto } from '@/modules/categories/dto/list-categories.dto';
import { Injectable } from '@nestjs/common';
import { category_type, Prisma } from '@prisma/client';

@Injectable()
export class CategoriesRepository {
  constructor(private readonly prismaService: PrismaService) {}

  create(data: Prisma.CategoryCreateInput) {
    return this.prismaService.category.create({ data });
  }

  findById(id: string) {
    return this.prismaService.category.findUnique({ where: { id } });
  }

  findByIds(ids: string[]) {
    return this.prismaService.category.findMany({
      where: { id: { in: ids } },
    });
  }

  findByTypeAndSlug(type: category_type, slug: string) {
    return this.prismaService.category.findUnique({
      where: { type_slug: { type, slug } },
    });
  }

  list(filters: ListCategoriesDto) {
    const search = filters.search?.trim();
    const isActive =
      filters.isActive === undefined ? undefined : filters.isActive === 'true';
    const { page, limit, skip, take } = normalizePagination(filters);
    const sortMap = {
      name: 'name',
      slug: 'slug',
      order: 'order',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      isActive: 'is_active',
    } satisfies Record<string, keyof Prisma.CategoryOrderByWithRelationInput>;
    const sortBy = filters.sortBy ? sortMap[filters.sortBy] : undefined;
    const where: Prisma.CategoryWhereInput = {
      type: filters.type,
      parent_id: filters.parentId,
      is_active: isActive,
      OR: search
        ? [
            { name: { contains: search, mode: 'insensitive' } },
            { slug: { contains: search, mode: 'insensitive' } },
            { code: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ]
        : undefined,
    };
    const orderBy: Prisma.CategoryOrderByWithRelationInput[] = sortBy
      ? [{ [sortBy]: filters.sortOrder ?? 'asc' }]
      : [{ order: 'asc' }, { name: 'asc' }];

    return this.prismaService.$transaction(async (tx) => {
      const [items, total] = await Promise.all([
        tx.category.findMany({ where, orderBy, skip, take }),
        tx.category.count({ where }),
      ]);

      return paginate(items, { page, limit, total });
    });
  }

  update(id: string, data: Prisma.CategoryUpdateInput) {
    return this.prismaService.category.update({
      where: { id },
      data,
    });
  }

  reorder(input: {
    parentId: string | null;
    items: Array<{ id: string; order: number }>;
  }) {
    return this.prismaService.$transaction(
      input.items.map((item) =>
        this.prismaService.category.update({
          where: { id: item.id },
          data: {
            order: item.order,
            parent_id: input.parentId,
          },
        }),
      ),
    );
  }
}
