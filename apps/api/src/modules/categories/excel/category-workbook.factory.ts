import {
  addDataWorksheet,
  addInstructionsWorksheet,
  createExcelWorkbook,
  workbookToBuffer,
} from '@/common/excel';
import { categoryExcelColumns } from '@/modules/categories/excel/category-excel.schema';
import { CategoryExcelRow } from '@/modules/categories/excel/category-excel.types';
import { category_type } from '@prisma/client';

export async function createCategoryImportTemplateWorkbook() {
  const workbook = createExcelWorkbook('Mẫu import danh mục');
  addDataWorksheet<CategoryExcelRow>(workbook, {
    name: 'Danh mục',
    columns: categoryExcelColumns,
    rows: [
      {
        type: category_type.PRODUCT,
        code: 'CAT-VEHICLE',
        slug: 'xe-o-to',
        name: 'Xe ô tô',
        description: 'Danh mục sản phẩm xe ô tô',
        parentSlug: null,
        icon: 'Car',
        imageUrl: 'https://example.com/xe-o-to.jpg',
        order: 10,
        isActive: true,
        metadata: null,
      },
      {
        type: category_type.PRODUCT,
        code: 'CAT-SUV',
        slug: 'xe-suv',
        name: 'Xe SUV',
        description: null,
        parentSlug: 'xe-o-to',
        icon: null,
        imageUrl: null,
        order: 20,
        isActive: true,
        metadata: { segment: 'vehicle' },
      },
    ],
  });
  addInstructionsWorksheet(workbook, categoryExcelColumns);
  return workbookToBuffer(workbook);
}

export async function createCategoryExportWorkbook(rows: CategoryExcelRow[]) {
  const workbook = createExcelWorkbook('Xuất danh mục');
  addDataWorksheet(workbook, {
    name: 'Danh mục',
    columns: categoryExcelColumns,
    rows,
  });
  return workbookToBuffer(workbook);
}
