import {
  addDataWorksheet,
  createExcelWorkbook,
  workbookToBuffer,
} from '@/common/excel';
import { ValidationError } from '@/common/response';
import { warrantyExcelColumns } from '@/modules/warranties/excel/warranty-excel.schema';
import { WarrantyExcelRow } from '@/modules/warranties/excel/warranty-excel.types';
import { PreviewWarrantyImportUseCase } from '@/modules/warranties/use-cases/preview-warranty-import.use-case';
import { warranty_status } from '@prisma/client';
import { Readable } from 'stream';

describe('PreviewWarrantyImportUseCase', () => {
  it('uses Vietnamese headers for warranty workbooks', () => {
    expect(warrantyExcelColumns.map((column) => column.header)).toEqual([
      'Mã bảo hành',
      'Mã sản phẩm',
      'Tên sản phẩm',
      'Số serial',
      'Mã khách hàng chủ sở hữu',
      'Tên chủ sở hữu',
      'Ngày bắt đầu',
      'Ngày kết thúc',
      'Thời hạn bảo hành (tháng)',
      'Trạng thái',
      'Điều khoản bảo hành',
    ]);
  });

  it('parses and validates warranty import rows', async () => {
    const file = await createFileFromRows([
      {
        warrantyCode: 'WM-2026-ABCDEF',
        productCode: 'PRD-2026-ABCDEF',
        productName: 'Genuine Battery Pack',
        serialNumber: 'SN-001',
        ownerCustomerCode: 'CUS-2026-000001',
        ownerFullName: 'Nguyen Van A',
        startDate: new Date('2026-07-21T00:00:00.000Z'),
        endDate: new Date('2027-07-21T00:00:00.000Z'),
        durationMonths: 12,
        status: warranty_status.ACTIVE,
        terms: 'Standard warranty.',
      },
    ]);
    const useCase = new PreviewWarrantyImportUseCase();

    const result = await useCase.execute(file);

    expect(result.totalRows).toBe(1);
    expect(result.validRows).toBe(1);
    expect(result.invalidRows).toBe(0);
    expect(result.rows[0].data).toEqual(
      expect.objectContaining({
        warrantyCode: 'WM-2026-ABCDEF',
        productCode: 'PRD-2026-ABCDEF',
        durationMonths: 12,
        status: warranty_status.ACTIVE,
      }),
    );
  });

  it('rejects workbooks that do not match the warranty template headers', async () => {
    const workbook = createExcelWorkbook('Invalid Template');
    const worksheet = workbook.addWorksheet('Warranties');
    worksheet.addRow(['Wrong Header']);
    const buffer = await workbookToBuffer(workbook);
    const useCase = new PreviewWarrantyImportUseCase();

    await expect(
      useCase.execute(createMockFile(buffer)),
    ).rejects.toBeInstanceOf(ValidationError);
  });
});

async function createFileFromRows(rows: WarrantyExcelRow[]) {
  const workbook = createExcelWorkbook('Warranty Import');
  addDataWorksheet(workbook, {
    name: 'Warranties',
    columns: warrantyExcelColumns,
    rows,
  });

  return {
    ...createMockFile(await workbookToBuffer(workbook)),
  };
}

function createMockFile(buffer: Buffer): Express.Multer.File {
  return {
    buffer,
    destination: '',
    encoding: '7bit',
    fieldname: 'file',
    filename: 'warranties.xlsx',
    mimetype:
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    originalname: 'warranties.xlsx',
    path: '',
    size: buffer.length,
    stream: Readable.from([]),
  };
}
