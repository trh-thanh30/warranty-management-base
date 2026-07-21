import { BcryptService } from '@/common/helpers/bcrypt.util';
import {
  ExcelRowError,
  loadWorkbookFromBuffer,
  parseWorksheetRows,
} from '@/common/excel';
import { BadRequestError } from '@/common/response';
import { PrismaService } from '@/database/prisma/prisma.service';
import { staffExcelColumns } from '@/modules/user/excel/staff-excel.schema';
import {
  StaffExcelRow,
  StaffTemporaryCredential,
} from '@/modules/user/excel/staff-excel.types';
import { generateTemporaryPassword } from '@/modules/user/temporary-password';
import { Injectable } from '@nestjs/common';
import { user_role, user_status } from '@prisma/client';
import type { StaffImportResult } from '@repo/shared';

type PreparedStaffRow = {
  email: string;
  existingUserId: string | null;
  fullName: string;
  hashedPassword: string | null;
  phone: string | null;
  rowNumber: number;
  status: user_status;
  temporaryPassword: string | null;
  username: string;
};

@Injectable()
export class ImportStaffUseCase {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly bcryptService: BcryptService,
  ) {}

  async execute(file: Express.Multer.File | undefined) {
    if (!file) throw new BadRequestError('Excel file is required');

    const workbook = await loadWorkbookFromBuffer(file.buffer);
    const worksheet =
      workbook.getWorksheet('Nhân viên') ?? workbook.worksheets[0];
    if (!worksheet) {
      throw new BadRequestError(
        'Excel workbook must contain at least one sheet',
      );
    }

    const parsed = parseWorksheetRows<StaffExcelRow>(
      worksheet,
      staffExcelColumns,
    );
    if (parsed.errors.length > 0) {
      return this.errorResult(parsed.errors);
    }

    const prepared = await this.prepareRows(
      parsed.rows.map((row) => ({
        ...(row.data as StaffExcelRow),
        rowNumber: row.rowNumber,
      })),
    );
    if (prepared.errors.length > 0) {
      return this.errorResult(prepared.errors);
    }

    return this.prismaService.$transaction(async (tx) => {
      let created = 0;
      let updated = 0;
      const temporaryCredentials: StaffTemporaryCredential[] = [];

      for (const row of prepared.rows) {
        if (row.existingUserId) {
          await tx.user.update({
            where: { id: row.existingUserId },
            data: {
              email: row.email,
              full_name: row.fullName,
              phone: row.phone,
              status: row.status,
              username: row.username,
            },
          });
          updated += 1;
          continue;
        }

        if (!row.hashedPassword || !row.temporaryPassword) {
          throw new BadRequestError('Temporary password is required');
        }

        await tx.user.create({
          data: {
            email: row.email,
            full_name: row.fullName,
            is_verified: true,
            password: row.hashedPassword,
            phone: row.phone,
            role: user_role.MODERATOR,
            status: row.status,
            username: row.username,
          },
        });
        temporaryCredentials.push({
          email: row.email,
          fullName: row.fullName,
          temporaryPassword: row.temporaryPassword,
          username: row.username,
        });
        created += 1;
      }

      return {
        created,
        updated,
        errors: [],
        temporaryCredentials,
      } satisfies StaffImportResult;
    });
  }

  private async prepareRows(
    rows: Array<StaffExcelRow & { rowNumber: number }>,
  ) {
    const errors: ExcelRowError[] = [];
    const preparedRows: PreparedStaffRow[] = [];
    const seenEmails = new Set<string>();
    const seenPhones = new Set<string>();
    const seenUsernames = new Set<string>();
    const seenExistingIds = new Set<string>();

    for (const row of rows) {
      const email = row.email.trim().toLowerCase();
      const fullName = row.fullName.trim();
      const phone = row.phone?.trim() || null;
      const username = row.username.trim();
      const status = row.status as user_status;

      this.validateDuplicate(errors, seenEmails, email, row.rowNumber, 'email');
      this.validateDuplicate(
        errors,
        seenUsernames,
        username.toLowerCase(),
        row.rowNumber,
        'username',
      );
      if (phone) {
        this.validateDuplicate(
          errors,
          seenPhones,
          phone,
          row.rowNumber,
          'phone',
        );
      }

      const [byEmail, byUsername, byPhone] = await Promise.all([
        this.prismaService.user.findFirst({
          where: { email: { equals: email, mode: 'insensitive' } },
          select: { id: true, role: true },
        }),
        this.prismaService.user.findFirst({
          where: { username: { equals: username, mode: 'insensitive' } },
          select: { id: true, role: true },
        }),
        phone
          ? this.prismaService.user.findUnique({
              where: { phone },
              select: { id: true, role: true },
            })
          : null,
      ]);
      const matches = [byEmail, byUsername, byPhone].filter(Boolean);
      const matchedIds = new Set(matches.map((match) => match?.id));

      if (matches.some((match) => match?.role !== user_role.MODERATOR)) {
        errors.push({
          field: 'account',
          message: 'Thông tin đang thuộc tài khoản không phải nhân viên',
          rowNumber: row.rowNumber,
        });
      } else if (matchedIds.size > 1) {
        errors.push({
          field: 'account',
          message:
            'Email, tên đăng nhập hoặc số điện thoại đang thuộc nhiều tài khoản khác nhau',
          rowNumber: row.rowNumber,
        });
      }

      const existingUserId = matches[0]?.id ?? null;
      if (existingUserId && seenExistingIds.has(existingUserId)) {
        errors.push({
          field: 'account',
          message: 'Tài khoản nhân viên bị lặp lại trong file import',
          rowNumber: row.rowNumber,
        });
      }
      if (existingUserId) seenExistingIds.add(existingUserId);

      preparedRows.push({
        email,
        existingUserId,
        fullName,
        hashedPassword: null,
        phone,
        rowNumber: row.rowNumber,
        status,
        temporaryPassword: null,
        username,
      });
    }

    if (errors.length === 0) {
      await Promise.all(
        preparedRows.map(async (row) => {
          if (row.existingUserId) return;
          row.temporaryPassword = generateTemporaryPassword();
          row.hashedPassword = await this.bcryptService.hashPassword(
            row.temporaryPassword,
          );
        }),
      );
    }

    return { errors, rows: preparedRows };
  }

  private validateDuplicate(
    errors: ExcelRowError[],
    seen: Set<string>,
    value: string,
    rowNumber: number,
    field: string,
  ) {
    if (seen.has(value)) {
      errors.push({
        field,
        message: `${field} bị trùng trong file import`,
        rowNumber,
      });
      return;
    }
    seen.add(value);
  }

  private errorResult(errors: ExcelRowError[]): StaffImportResult {
    return {
      created: 0,
      updated: 0,
      errors,
      temporaryCredentials: [],
    };
  }
}
