import {
  addDataWorksheet,
  createExcelWorkbook,
  workbookToBuffer,
} from '@/common/excel';
import { ValidationError } from '@/common/response';
import { productExcelColumns } from '@/modules/products/excel/product-excel.schema';
import { toProductExcelRow } from '@/modules/products/excel/product-excel.mapper';
import { ProductExcelRow } from '@/modules/products/excel/product-excel.types';
import { PreviewProductImportUseCase } from '@/modules/products/use-cases/preview-product-import.use-case';
import { product_status } from '@prisma/client';
import { Readable } from 'stream';

describe('PreviewProductImportUseCase', () => {
  it('defines Vietnamese product Excel headers with an optional warranty code column', () => {
    expect(productExcelColumns.map((column) => column.header)).toEqual([
      'Mã sản phẩm',
      'Tên sản phẩm',
      'Mã danh mục',
      'Thương hiệu',
      'Model',
      'Năm model',
      'Mô tả ngắn',
      'Mô tả',
      'Thời hạn bảo hành (tháng)',
      'Điều khoản bảo hành',
      'Vị trí gắn',
      'Mã bảo hành',
      'Số serial',
      'Trạng thái sản phẩm',
    ]);
  });

  it('exports one product name from displayName with a catalogue fallback', () => {
    const baseProduct = {
      catalogue_brand: 'Lexzenz',
      catalogue_model: 'Battery Plus',
      catalogue_model_year: 2026,
      catalogue_name: 'Catalogue Battery',
      category_id: 'category-id',
      category_ref: { code: 'ACCESSORY' },
      display_name: 'Customer Battery',
      metadata: null,
      product_code: 'PRD-2026-ABCDEF',
      serial_number: 'SN-001',
      status: product_status.ACTIVE,
      warranty: null,
    };

    expect(toProductExcelRow(baseProduct as never)).toEqual(
      expect.objectContaining({
        displayName: 'Customer Battery',
      }),
    );
    expect(toProductExcelRow(baseProduct as never)).not.toHaveProperty(
      'productName',
    );
    expect(
      toProductExcelRow({
        ...baseProduct,
        display_name: null,
      } as never).displayName,
    ).toBe('Catalogue Battery');
  });

  it('parses and validates product import rows', async () => {
    const file = await createFileFromRows([
      {
        productCode: 'PRD-2026-ABCDEF',
        categoryCode: 'ACCESSORY',
        brand: 'Lexzenz',
        model: 'Battery Plus',
        modelYear: 2026,
        warrantyDurationMonths: 36,
        warrantyTerms: null,
        displayName: 'Genuine Battery Pack',
        installationPosition: 'Engine bay',
        warrantyCode: 'WM-2026-EXCEL01',
        serialNumber: 'SN-001',
        status: product_status.ACTIVE,
      },
    ]);
    const prismaService = createPrismaMock();
    prismaService.category.findFirst.mockResolvedValue({ id: 'category-id' });
    const useCase = new PreviewProductImportUseCase(prismaService as never);

    const result = await useCase.execute(file);

    expect(result.totalRows).toBe(1);
    expect(result.validRows).toBe(1);
    expect(result.invalidRows).toBe(0);
    expect(result.rows[0].data).toEqual(
      expect.objectContaining({
        categoryCode: 'ACCESSORY',
        displayName: 'Genuine Battery Pack',
        installationPosition: 'Engine bay',
        productCode: 'PRD-2026-ABCDEF',
        warrantyCode: 'WM-2026-EXCEL01',
        status: product_status.ACTIVE,
      }),
    );
    expect(result.rows[0].data).not.toHaveProperty('productName');
  });

  it('rejects workbooks that do not match the product template headers', async () => {
    const workbook = createExcelWorkbook('Invalid Template');
    const worksheet = workbook.addWorksheet('Products');
    worksheet.addRow(['Wrong Header']);
    const buffer = await workbookToBuffer(workbook);
    const useCase = new PreviewProductImportUseCase(
      createPrismaMock() as never,
    );

    await expect(
      useCase.execute(createMockFile(buffer)),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it('reports an unknown product category during preview', async () => {
    const file = await createFileFromRows([
      {
        productCode: null,
        categoryCode: 'UNKNOWN',
        brand: null,
        model: null,
        modelYear: null,
        warrantyDurationMonths: 36,
        warrantyTerms: null,
        displayName: 'Battery Pack',
        installationPosition: null,
        warrantyCode: null,
        serialNumber: 'SN-UNKNOWN-CATEGORY',
        status: product_status.ACTIVE,
      },
    ]);
    const prismaService = createPrismaMock();
    prismaService.category.findFirst.mockResolvedValue(null);
    const useCase = new PreviewProductImportUseCase(prismaService as never);

    const result = await useCase.execute(file);

    expect(result.invalidRows).toBe(1);
    expect(result.validRows).toBe(0);
    expect(result.rows[0]?.errors).toContainEqual({
      field: 'categoryCode',
      message: 'Không tìm thấy danh mục sản phẩm đang hoạt động',
      rowNumber: 2,
    });
  });

  it('requires a product category code during preview', async () => {
    const file = await createFileFromRows([
      {
        productCode: null,
        categoryCode: '',
        brand: null,
        model: null,
        modelYear: null,
        warrantyDurationMonths: 36,
        warrantyTerms: null,
        displayName: 'Battery Pack',
        installationPosition: null,
        warrantyCode: null,
        serialNumber: 'SN-MISSING-CATEGORY',
        status: product_status.ACTIVE,
      },
    ]);
    const prismaService = createPrismaMock();
    const useCase = new PreviewProductImportUseCase(prismaService as never);

    const result = await useCase.execute(file);

    expect(result.invalidRows).toBe(1);
    expect(result.validRows).toBe(0);
    expect(result.rows[0]?.errors).toContainEqual({
      field: 'categoryCode',
      message: 'Mã danh mục is required',
      rowNumber: 2,
    });
  });

  it('reports duplicate warranty codes in the same workbook', async () => {
    const file = await createFileFromRows([
      {
        productCode: null,
        categoryCode: 'ACCESSORY',
        brand: null,
        model: null,
        modelYear: null,
        warrantyDurationMonths: 36,
        warrantyTerms: null,
        displayName: 'Battery A',
        installationPosition: null,
        warrantyCode: 'WM-2026-DUPLICATE',
        serialNumber: 'SN-A',
        status: product_status.ACTIVE,
      },
      {
        productCode: null,
        categoryCode: 'ACCESSORY',
        brand: null,
        model: null,
        modelYear: null,
        warrantyDurationMonths: 36,
        warrantyTerms: null,
        displayName: 'Battery B',
        installationPosition: null,
        warrantyCode: 'WM-2026-DUPLICATE',
        serialNumber: 'SN-B',
        status: product_status.ACTIVE,
      },
    ]);
    const prismaService = createPrismaMock();
    prismaService.category.findFirst.mockResolvedValue({ id: 'category-id' });
    const useCase = new PreviewProductImportUseCase(prismaService as never);

    const result = await useCase.execute(file);

    expect(result.invalidRows).toBe(1);
    expect(result.rows[1]?.errors).toContainEqual({
      field: 'warrantyCode',
      message: 'Mã bảo hành bị trùng trong file import',
      rowNumber: 3,
    });
  });
});

function createPrismaMock() {
  return {
    category: {
      findFirst: jest.fn().mockResolvedValue(null),
    },
    product: {
      findUnique: jest.fn().mockResolvedValue(null),
    },
    warranty: {
      findUnique: jest.fn().mockResolvedValue(null),
    },
  };
}

async function createFileFromRows(rows: ProductExcelRow[]) {
  const workbook = createExcelWorkbook('Product Import');
  addDataWorksheet(workbook, {
    name: 'Products',
    columns: productExcelColumns,
    rows,
  });

  return createMockFile(await workbookToBuffer(workbook));
}

function createMockFile(buffer: Buffer): Express.Multer.File {
  return {
    buffer,
    destination: '',
    encoding: '7bit',
    fieldname: 'file',
    filename: 'products.xlsx',
    mimetype:
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    originalname: 'products.xlsx',
    path: '',
    size: buffer.length,
    stream: Readable.from([]),
  };
}
