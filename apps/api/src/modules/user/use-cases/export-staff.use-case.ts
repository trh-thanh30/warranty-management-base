import { PrismaService } from '@/database/prisma/prisma.service';
import { ListUsersDto } from '@/modules/user/dto/list-users.dto';
import { StaffExcelRow } from '@/modules/user/excel/staff-excel.types';
import { createStaffExportWorkbook } from '@/modules/user/excel/staff-workbook.factory';
import { Injectable } from '@nestjs/common';
import { Prisma, user_role, user_status } from '@prisma/client';

@Injectable()
export class ExportStaffUseCase {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(query: ListUsersDto) {
    const search = query.search?.trim();
    const sortMap = {
      email: 'email',
      username: 'username',
      fullName: 'full_name',
      phone: 'phone',
      status: 'status',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    } satisfies Record<string, keyof Prisma.UserOrderByWithRelationInput>;
    const sortBy = query.sortBy ? sortMap[query.sortBy] : undefined;
    const rows = await this.prismaService.user.findMany({
      where: {
        role: user_role.MODERATOR,
        status: query.status,
        OR: search
          ? [
              { email: { contains: search, mode: 'insensitive' } },
              { username: { contains: search, mode: 'insensitive' } },
              { full_name: { contains: search, mode: 'insensitive' } },
              { phone: { contains: search, mode: 'insensitive' } },
            ]
          : undefined,
      },
      orderBy: sortBy
        ? [{ [sortBy]: query.sortOrder ?? 'desc' }]
        : [{ created_at: 'desc' }],
      select: {
        email: true,
        full_name: true,
        phone: true,
        status: true,
        username: true,
      },
    });

    return createStaffExportWorkbook(
      rows.map(
        (row): StaffExcelRow => ({
          email: row.email,
          fullName: row.full_name ?? '',
          phone: row.phone,
          status:
            row.status === user_status.ACTIVE ? 'Đang hoạt động' : 'Đã khóa',
          username: row.username,
        }),
      ),
    );
  }
}
