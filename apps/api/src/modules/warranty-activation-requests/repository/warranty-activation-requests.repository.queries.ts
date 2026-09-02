import { ListWarrantyActivationRequestsDto } from '@/modules/warranty-activation-requests/dto/list-warranty-activation-requests.dto';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

function buildWarrantyActivationRequestOrderBy(
  sortBy?: keyof Prisma.WarrantyActivationRequestOrderByWithRelationInput,
  sortOrder: 'asc' | 'desc' = 'desc',
): Prisma.WarrantyActivationRequestOrderByWithRelationInput[] {
  if (!sortBy) return [{ created_at: 'desc' }, { id: 'desc' }];

  const orderBy = [
    { [sortBy]: sortOrder },
  ] as Prisma.WarrantyActivationRequestOrderByWithRelationInput[];

  if (sortBy !== 'created_at') orderBy.push({ created_at: 'desc' });

  orderBy.push({ id: 'desc' });
  return orderBy;
}

@Injectable()
export class WarrantyActivationRequestQueries {
  readonly include = {
    created_by: {
      select: {
        id: true,
        email: true,
        full_name: true,
        username: true,
      },
    },
    customer: {
      select: {
        id: true,
        customer_code: true,
        email: true,
        full_name: true,
        phone: true,
      },
    },
    dealer: {
      select: {
        id: true,
        name: true,
        phone: true,
        address: true,
        province: true,
        district: true,
        sales_name: true,
      },
    },
    certificate: true,
    activation_code: { select: { id: true, status: true } },
    reviewed_by: {
      select: {
        id: true,
        email: true,
        full_name: true,
        username: true,
      },
    },
    activated_warranty: {
      include: {
        certificates: {
          orderBy: { created_at: 'desc' as const },
          take: 1,
        },
      },
    },
    items: {
      orderBy: [{ created_at: 'asc' as const }, { id: 'asc' as const }],
      include: {
        warranty: {
          include: {
            certificates: {
              orderBy: { created_at: 'desc' as const },
              take: 1,
            },
          },
        },
      },
    },
  } satisfies Prisma.WarrantyActivationRequestInclude;

  buildListQuery(filters: ListWarrantyActivationRequestsDto) {
    const search = filters.search?.trim();
    const warrantyCode = filters.warrantyCode?.trim().toUpperCase();
    const createdAtFilter: Prisma.DateTimeFilter = {
      gte: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
      lte: filters.dateTo ? new Date(filters.dateTo) : undefined,
    };
    const hasCreatedAtFilter = Boolean(
      createdAtFilter.gte || createdAtFilter.lte,
    );
    const sortBy = this.getSortColumn(filters.sortBy);
    const searchFilter: Prisma.WarrantyActivationRequestWhereInput | undefined =
      search
        ? {
            OR: [
              { request_code: { contains: search, mode: 'insensitive' } },
              { warranty_code: { contains: search, mode: 'insensitive' } },
              { customer_name: { contains: search, mode: 'insensitive' } },
              { customer_phone: { contains: search, mode: 'insensitive' } },
              { customer_email: { contains: search, mode: 'insensitive' } },
              { product_name: { contains: search, mode: 'insensitive' } },
              { serial_number: { contains: search, mode: 'insensitive' } },
              {
                items: {
                  some: {
                    OR: [
                      {
                        product_name: {
                          contains: search,
                          mode: 'insensitive',
                        },
                      },
                      {
                        product_code: {
                          contains: search,
                          mode: 'insensitive',
                        },
                      },
                      {
                        serial_number: {
                          contains: search,
                          mode: 'insensitive',
                        },
                      },
                      {
                        warranty_code: {
                          contains: search,
                          mode: 'insensitive',
                        },
                      },
                    ],
                  },
                },
              },
            ],
          }
        : undefined;
    const warrantyCodeFilter:
      | Prisma.WarrantyActivationRequestWhereInput
      | undefined = warrantyCode
      ? {
          OR: [
            { warranty_code: warrantyCode },
            { items: { some: { warranty_code: warrantyCode } } },
          ],
        }
      : undefined;
    const where: Prisma.WarrantyActivationRequestWhereInput = {
      status: filters.status,
      created_at: hasCreatedAtFilter ? createdAtFilter : undefined,
      AND: [searchFilter, warrantyCodeFilter].filter(
        (filter): filter is Prisma.WarrantyActivationRequestWhereInput =>
          Boolean(filter),
      ),
    };
    const orderBy = buildWarrantyActivationRequestOrderBy(
      sortBy,
      filters.sortOrder,
    );

    return { orderBy, where };
  }

  private getSortColumn(
    sortBy: string | undefined,
  ):
    | keyof Prisma.WarrantyActivationRequestOrderByWithRelationInput
    | undefined {
    switch (sortBy) {
      case 'createdAt':
        return 'created_at';
      case 'customerName':
        return 'customer_name';
      case 'customerPhone':
        return 'customer_phone';
      case 'requestCode':
        return 'request_code';
      case 'reviewedAt':
        return 'reviewed_at';
      case 'status':
        return 'status';
      case 'updatedAt':
        return 'updated_at';
      case 'warrantyCode':
        return 'warranty_code';
      default:
        return undefined;
    }
  }
}
