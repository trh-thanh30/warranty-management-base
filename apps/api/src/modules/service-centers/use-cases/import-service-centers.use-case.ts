import {
  ExcelRowError,
  loadWorkbookFromBuffer,
  parseWorksheetRows,
} from '@/common/excel';
import { BadRequestError } from '@/common/response';
import { serviceCenterExcelColumns } from '@/modules/service-centers/excel/service-center-excel.schema';
import {
  PreparedServiceCenterImportRow,
  ServiceCenterExcelRow,
} from '@/modules/service-centers/excel/service-center-excel.types';
import { ServiceCentersRepository } from '@/modules/service-centers/repository/service-centers.repository';
import { Injectable } from '@nestjs/common';
import { ServiceCenter } from '@prisma/client';
import type { ServiceCenterImportResult } from '@repo/shared';

@Injectable()
export class ImportServiceCentersUseCase {
  constructor(
    private readonly serviceCentersRepository: ServiceCentersRepository,
  ) {}

  async execute(file: Express.Multer.File | undefined) {
    if (!file) throw new BadRequestError('Excel file is required');

    const workbook = await loadWorkbookFromBuffer(file.buffer);
    const worksheet =
      workbook.getWorksheet('Trạm bảo hành') ?? workbook.worksheets[0];
    if (!worksheet) {
      throw new BadRequestError(
        'Excel workbook must contain at least one sheet',
      );
    }

    const preview = parseWorksheetRows<ServiceCenterExcelRow>(
      worksheet,
      serviceCenterExcelColumns,
    );
    if (preview.errors.length > 0) return this.failure(preview.errors);

    const rows = preview.rows.map((row) => ({
      ...(row.data as ServiceCenterExcelRow),
      rowNumber: row.rowNumber,
    }));
    if (rows.length === 0) {
      return this.failure([
        {
          rowNumber: 2,
          field: 'file',
          message: 'File import không có dữ liệu',
        },
      ]);
    }

    const existingServiceCenters =
      await this.serviceCentersRepository.listAll();
    const { errors, preparedRows } = this.prepareRows(
      rows,
      existingServiceCenters,
    );
    if (errors.length > 0) return this.failure(errors);

    const result = await this.serviceCentersRepository.importRows(preparedRows);
    return { ...result, errors: [] } satisfies ServiceCenterImportResult;
  }

  private prepareRows(
    rows: Array<ServiceCenterExcelRow & { rowNumber: number }>,
    existingServiceCenters: ServiceCenter[],
  ) {
    const errors: ExcelRowError[] = [];
    const preparedRows: PreparedServiceCenterImportRow[] = [];
    const seenPhones = new Set<string>();
    const seenEmails = new Set<string>();
    const seenExistingIds = new Set<string>();
    const byPhone = new Map(
      existingServiceCenters
        .filter((item) => item.phone)
        .map((item) => [item.phone as string, item]),
    );
    const byEmail = new Map(
      existingServiceCenters
        .filter((item) => item.email)
        .map((item) => [item.email?.toLowerCase() as string, item]),
    );

    for (const row of rows) {
      const phone = row.phone?.trim() || null;
      const email = row.email?.trim().toLowerCase() || null;

      if (!phone && !email) {
        errors.push({
          rowNumber: row.rowNumber,
          field: 'contact',
          message: 'Phải nhập ít nhất số điện thoại hoặc email',
        });
      }
      this.validateDuplicate(
        seenPhones,
        phone,
        row.rowNumber,
        'phone',
        'Số điện thoại bị trùng trong file import',
        errors,
      );
      this.validateDuplicate(
        seenEmails,
        email,
        row.rowNumber,
        'email',
        'Email bị trùng trong file import',
        errors,
      );

      const byPhoneMatch = phone ? byPhone.get(phone) : undefined;
      const byEmailMatch = email ? byEmail.get(email) : undefined;
      if (byPhoneMatch && byEmailMatch && byPhoneMatch.id !== byEmailMatch.id) {
        errors.push({
          rowNumber: row.rowNumber,
          field: 'contact',
          message: 'Số điện thoại và email đang thuộc hai trạm khác nhau',
        });
      }

      const existing = byPhoneMatch ?? byEmailMatch ?? null;
      if (existing && seenExistingIds.has(existing.id)) {
        errors.push({
          rowNumber: row.rowNumber,
          field: 'contact',
          message: 'Nhiều dòng đang cùng cập nhật một trạm bảo hành',
        });
      } else if (existing) {
        seenExistingIds.add(existing.id);
      }
      preparedRows.push({
        ...row,
        phone,
        email,
        existingServiceCenterId: existing?.id ?? null,
      });
    }

    return { errors, preparedRows };
  }

  private validateDuplicate(
    seen: Set<string>,
    value: string | null,
    rowNumber: number,
    field: string,
    message: string,
    errors: ExcelRowError[],
  ) {
    if (!value) return;
    if (seen.has(value)) {
      errors.push({ rowNumber, field, message });
      return;
    }
    seen.add(value);
  }

  private failure(errors: ExcelRowError[]): ServiceCenterImportResult {
    return { created: 0, updated: 0, errors };
  }
}
