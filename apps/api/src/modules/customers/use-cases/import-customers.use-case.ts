import {
  ExcelRowError,
  loadWorkbookFromBuffer,
  parseWorksheetRows,
} from '@/common/excel';
import { BadRequestError } from '@/common/response';
import { PrismaService } from '@/database/prisma/prisma.service';
import { customerExcelColumns } from '@/modules/customers/excel/customer-excel.schema';
import {
  CustomerExcelRow,
  CustomerImportResult,
} from '@/modules/customers/excel/customer-excel.types';
import { GenerateCustomerCodeUseCase } from '@/modules/customers/use-cases/generate-customer-code.use-case';
import { Injectable } from '@nestjs/common';

type PreparedCustomerImportRow = CustomerExcelRow & {
  existingCustomerId: string | null;
  generatedCustomerCode: string | null;
  rowNumber: number;
};

@Injectable()
export class ImportCustomersUseCase {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly generateCustomerCodeUseCase: GenerateCustomerCodeUseCase,
  ) {}

  async execute(file: Express.Multer.File | undefined) {
    if (!file) {
      throw new BadRequestError('Excel file is required');
    }

    const workbook = await loadWorkbookFromBuffer(file.buffer);
    const worksheet =
      workbook.getWorksheet('Customers') ?? workbook.worksheets[0];

    if (!worksheet) {
      throw new BadRequestError(
        'Excel workbook must contain at least one sheet',
      );
    }

    const preview = parseWorksheetRows<CustomerExcelRow>(
      worksheet,
      customerExcelColumns,
    );

    if (preview.errors.length > 0) {
      return {
        created: 0,
        updated: 0,
        errors: preview.errors,
      } satisfies CustomerImportResult;
    }

    const { errors, rows } = await this.prepareRows(
      preview.rows.map((row) => ({
        ...(row.data as CustomerExcelRow),
        rowNumber: row.rowNumber,
      })),
    );

    if (errors.length > 0) {
      return {
        created: 0,
        updated: 0,
        errors,
      } satisfies CustomerImportResult;
    }

    return this.prismaService.$transaction(async (tx) => {
      let created = 0;
      let updated = 0;

      for (const row of rows) {
        if (row.existingCustomerId) {
          await tx.customer.update({
            where: { id: row.existingCustomerId },
            data: {
              address: row.address,
              email: row.email,
              full_name: row.fullName,
              phone: row.phone,
            },
          });
          updated += 1;
          continue;
        }

        const customerCode = row.customerCode ?? row.generatedCustomerCode;
        if (!customerCode) {
          throw new BadRequestError('Customer code is required');
        }

        await tx.customer.create({
          data: {
            address: row.address,
            customer_code: customerCode,
            email: row.email,
            full_name: row.fullName,
            phone: row.phone,
          },
        });
        created += 1;
      }

      return {
        created,
        updated,
        errors: [],
      } satisfies CustomerImportResult;
    });
  }

  private async prepareRows(
    rows: Array<CustomerExcelRow & { rowNumber: number }>,
  ) {
    const errors: ExcelRowError[] = [];
    const preparedRows: PreparedCustomerImportRow[] = [];
    const seenCustomerCodes = new Set<string>();
    const seenPhones = new Set<string>();
    const rowsNeedingGeneratedCode: Array<
      CustomerExcelRow & {
        rowNumber: number;
      }
    > = [];

    for (const row of rows) {
      const customerCode = row.customerCode?.trim() || null;
      const fullName = row.fullName.trim();
      const phone = row.phone.trim();
      const email = row.email.trim().toLowerCase();
      const address = row.address.trim();

      this.validateDuplicate({
        errors,
        field: 'customerCode',
        message: 'Mã khách hàng bị trùng trong file import',
        rowNumber: row.rowNumber,
        seen: seenCustomerCodes,
        value: customerCode,
      });
      this.validateDuplicate({
        errors,
        field: 'phone',
        message: 'Số điện thoại bị trùng trong file import',
        rowNumber: row.rowNumber,
        seen: seenPhones,
        value: phone,
      });
      const [customerByCode, customerByPhone] = await Promise.all([
        customerCode
          ? this.prismaService.customer.findUnique({
              where: { customer_code: customerCode },
              select: { id: true },
            })
          : null,
        this.prismaService.customer.findUnique({
          where: { phone },
          select: { id: true, customer_code: true },
        }),
      ]);

      const matchedIds = new Set(
        [customerByCode?.id, customerByPhone?.id].filter(Boolean),
      );

      if (matchedIds.size > 1) {
        errors.push({
          rowNumber: row.rowNumber,
          field: 'customer',
          message:
            'Mã khách hàng hoặc số điện thoại đang thuộc nhiều hồ sơ khác nhau',
        });
      }

      const existingCustomerId =
        customerByCode?.id ?? customerByPhone?.id ?? null;

      if (!customerCode && !existingCustomerId) {
        rowsNeedingGeneratedCode.push(row);
      }

      preparedRows.push({
        address,
        customerCode,
        email,
        existingCustomerId,
        fullName,
        generatedCustomerCode: null,
        phone,
        rowNumber: row.rowNumber,
      });
    }

    if (errors.length === 0 && rowsNeedingGeneratedCode.length > 0) {
      const generatedCodes =
        await this.generateCustomerCodeUseCase.generateCustomerCodeBatch(
          rowsNeedingGeneratedCode.length,
        );
      let generatedCodeIndex = 0;

      preparedRows.forEach((row) => {
        if (!row.customerCode && !row.existingCustomerId) {
          row.generatedCustomerCode = generatedCodes[generatedCodeIndex];
          generatedCodeIndex += 1;
        }
      });
    }

    return {
      errors,
      rows: preparedRows,
    };
  }

  private validateDuplicate({
    errors,
    field,
    message,
    rowNumber,
    seen,
    value,
  }: {
    errors: ExcelRowError[];
    field: string;
    message: string;
    rowNumber: number;
    seen: Set<string>;
    value: string | null;
  }) {
    if (!value) return;

    if (seen.has(value)) {
      errors.push({ rowNumber, field, message });
      return;
    }

    seen.add(value);
  }
}
