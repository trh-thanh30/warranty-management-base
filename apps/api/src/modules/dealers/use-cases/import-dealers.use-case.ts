import {
  ExcelRowError,
  loadWorkbookFromBuffer,
  parseWorksheetRows,
} from '@/common/excel';
import { BadRequestError } from '@/common/response';
import { dealerExcelColumns } from '@/modules/dealers/excel/dealer-excel.schema';
import {
  DealerExcelRow,
  PreparedDealerImportRow,
} from '@/modules/dealers/excel/dealer-excel.types';
import { DealersRepository } from '@/modules/dealers/repository/dealers.repository';
import { GenerateDealerCodeUseCase } from '@/modules/dealers/use-cases/generate-dealer-code.use-case';
import { Injectable } from '@nestjs/common';
import { Dealer } from '@prisma/client';
import type { DealerImportResult } from '@repo/shared';

@Injectable()
export class ImportDealersUseCase {
  constructor(
    private readonly dealersRepository: DealersRepository,
    private readonly generateDealerCodeUseCase: GenerateDealerCodeUseCase = new GenerateDealerCodeUseCase(),
  ) {}

  async execute(file: Express.Multer.File | undefined) {
    if (!file) throw new BadRequestError('Excel file is required');

    const workbook = await loadWorkbookFromBuffer(file.buffer);
    const worksheet = workbook.getWorksheet('Đại lý') ?? workbook.worksheets[0];
    if (!worksheet) {
      throw new BadRequestError(
        'Excel workbook must contain at least one sheet',
      );
    }

    const preview = parseWorksheetRows<DealerExcelRow>(
      worksheet,
      dealerExcelColumns,
    );
    if (preview.errors.length > 0) return this.failure(preview.errors);

    const rows = preview.rows.map((row) => ({
      ...(row.data as DealerExcelRow),
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

    const existingDealers = await this.dealersRepository.listAll();
    const { errors, preparedRows } = this.prepareRows(rows, existingDealers);
    if (errors.length > 0) return this.failure(errors);

    const result = await this.dealersRepository.importRows(preparedRows);
    return { ...result, errors: [] } satisfies DealerImportResult;
  }

  private prepareRows(
    rows: Array<DealerExcelRow & { rowNumber: number }>,
    existingDealers: Dealer[],
  ) {
    const errors: ExcelRowError[] = [];
    const preparedRows: PreparedDealerImportRow[] = [];
    const seenPhones = new Set<string>();
    const seenExistingIds = new Set<string>();
    const byPhone = new Map(
      existingDealers
        .filter((item) => item.phone)
        .map((item) => [item.phone as string, item]),
    );

    for (const row of rows) {
      const phone = row.phone?.trim() || null;

      this.validateDuplicate(
        seenPhones,
        phone,
        row.rowNumber,
        'phone',
        'Số điện thoại bị trùng trong file import',
        errors,
      );

      const existing = phone ? (byPhone.get(phone) ?? null) : null;
      if (existing && seenExistingIds.has(existing.id)) {
        errors.push({
          rowNumber: row.rowNumber,
          field: 'phone',
          message: 'Nhiều dòng đang cùng cập nhật một đại lý',
        });
      } else if (existing) {
        seenExistingIds.add(existing.id);
      }

      preparedRows.push({
        ...row,
        dealerCode: existing ? null : this.generateDealerCodeUseCase.execute(),
        phone,
        existingDealerId: existing?.id ?? null,
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

  private failure(errors: ExcelRowError[]): DealerImportResult {
    return { created: 0, updated: 0, errors };
  }
}
