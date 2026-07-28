import { normalizePagination, paginate } from '@/common/pagination/pagination';
import { PrismaService } from '@/database/prisma/prisma.service';
import { ListCategoriesDto } from '@/modules/categories/dto/list-categories.dto';
import { PreparedCategoryImportRow } from '@/modules/categories/excel/category-excel.types';
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

  listAll() {
    return this.prismaService.category.findMany();
  }

  listPublicProductCategories(filters: {
    page?: number;
    limit?: number;
    hasImage?: string;
  }) {
    const { page, limit, skip, take } = normalizePagination(filters);
    const hasImage =
      filters.hasImage === undefined ? undefined : filters.hasImage === 'true';
    const where: Prisma.CategoryWhereInput = {
      type: category_type.PRODUCT,
      is_active: true,
      image_url:
        hasImage === undefined ? undefined : hasImage ? { not: null } : null,
    };

    return this.prismaService.$transaction(async (tx) => {
      const [items, total] = await Promise.all([
        tx.category.findMany({
          where,
          orderBy: [{ order: 'asc' }, { name: 'asc' }],
          skip,
          take,
          include: {
            _count: {
              select: {
                product_templates: {
                  where: {
                    is_active: true,
                    is_published: true,
                  },
                },
              },
            },
          },
        }),
        tx.category.count({ where }),
      ]);

      return paginate(items, { page, limit, total });
    });
  }

  listForExport(filters: ListCategoriesDto) {
    const search = filters.search?.trim();
    const isActive =
      filters.isActive === undefined ? undefined : filters.isActive === 'true';
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

    return this.prismaService.category.findMany({
      where,
      orderBy,
      include: { parent: { select: { slug: true } } },
      take: 5000,
    });
  }

  importRows(rows: PreparedCategoryImportRow[], existingKeys: Set<string>) {
    return this.prismaService.$transaction(async (tx) => {
      const idsByKey = new Map<string, string>();

      for (const row of rows) {
        const category = await tx.category.upsert({
          where: { type_slug: { type: row.type, slug: row.slug } },
          create: {
            type: row.type,
            code: row.code,
            slug: row.slug,
            name: row.name,
            description: row.description,
            icon: row.icon,
            image_url: row.imageUrl,
            order: row.order,
            is_active: row.isActive,
            metadata: toJsonValue(row.metadata),
          },
          update: {
            code: row.code,
            name: row.name,
            description: row.description,
            icon: row.icon,
            image_url: row.imageUrl,
            order: row.order,
            is_active: row.isActive,
            metadata: toJsonValue(row.metadata),
          },
          select: { id: true },
        });
        idsByKey.set(toCategoryKey(row.type, row.slug), category.id);
      }

      for (const row of rows) {
        const id = idsByKey.get(toCategoryKey(row.type, row.slug));
        if (!id) continue;

        const parentId = row.parentSlug
          ? (idsByKey.get(toCategoryKey(row.type, row.parentSlug)) ??
            (
              await tx.category.findUnique({
                where: {
                  type_slug: { type: row.type, slug: row.parentSlug },
                },
                select: { id: true },
              })
            )?.id ??
            null)
          : null;

        await tx.category.update({
          where: { id },
          data: { parent_id: parentId },
        });
      }

      return {
        created: rows.filter(
          (row) => !existingKeys.has(toCategoryKey(row.type, row.slug)),
        ).length,
        updated: rows.filter((row) =>
          existingKeys.has(toCategoryKey(row.type, row.slug)),
        ).length,
      };
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

function toCategoryKey(type: category_type, slug: string) {
  return `${type}:${slug}`;
}

function toJsonValue(value: Record<string, unknown> | null) {
  return value === null ? Prisma.JsonNull : (value as Prisma.InputJsonObject);
}
