import {
  ExcelRowError,
  loadWorkbookFromBuffer,
  parseWorksheetRows,
} from '@/common/excel';
import { BadRequestError } from '@/common/response';
import { categoryExcelColumns } from '@/modules/categories/excel/category-excel.schema';
import {
  CategoryExcelRow,
  PreparedCategoryImportRow,
} from '@/modules/categories/excel/category-excel.types';
import { CategoriesRepository } from '@/modules/categories/repository/categories.repository';
import { Injectable } from '@nestjs/common';
import { Category, category_type } from '@prisma/client';
import type { CategoryImportResult } from '@repo/shared';

@Injectable()
export class ImportCategoriesUseCase {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  async execute(file: Express.Multer.File | undefined) {
    if (!file) throw new BadRequestError('Excel file is required');

    const workbook = await loadWorkbookFromBuffer(file.buffer);
    const worksheet =
      workbook.getWorksheet('Danh mục') ?? workbook.worksheets[0];
    if (!worksheet) {
      throw new BadRequestError(
        'Excel workbook must contain at least one sheet',
      );
    }

    const preview = parseWorksheetRows<CategoryExcelRow>(
      worksheet,
      categoryExcelColumns,
    );
    if (preview.errors.length > 0) return this.failure(preview.errors);

    const rows = preview.rows.map((row) => ({
      ...(row.data as CategoryExcelRow),
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

    const existingCategories = await this.categoriesRepository.listAll();
    const errors = this.validateHierarchy(rows, existingCategories);
    if (errors.length > 0) return this.failure(errors);

    const existingKeys = new Set(
      existingCategories.map((category) =>
        toCategoryKey(category.type, category.slug),
      ),
    );
    const result = await this.categoriesRepository.importRows(
      rows,
      existingKeys,
    );
    return { ...result, errors: [] } satisfies CategoryImportResult;
  }

  private validateHierarchy(
    rows: PreparedCategoryImportRow[],
    existingCategories: Category[],
  ) {
    const errors: ExcelRowError[] = [];
    const rowByKey = new Map<string, PreparedCategoryImportRow>();

    for (const row of rows) {
      const key = toCategoryKey(row.type, row.slug);
      if (rowByKey.has(key)) {
        errors.push({
          rowNumber: row.rowNumber,
          field: 'slug',
          message: 'Loại và slug danh mục bị trùng trong file import',
        });
      } else {
        rowByKey.set(key, row);
      }
    }

    const keyById = new Map(
      existingCategories.map((category) => [
        category.id,
        toCategoryKey(category.type, category.slug),
      ]),
    );
    const parentByKey = new Map<string, string | null>();
    existingCategories.forEach((category) => {
      parentByKey.set(
        toCategoryKey(category.type, category.slug),
        category.parent_id ? (keyById.get(category.parent_id) ?? null) : null,
      );
    });

    for (const row of rows) {
      const key = toCategoryKey(row.type, row.slug);
      const parentKey = row.parentSlug
        ? toCategoryKey(row.type, row.parentSlug)
        : null;

      if (parentKey === key) {
        errors.push({
          rowNumber: row.rowNumber,
          field: 'parentSlug',
          message: 'Danh mục không thể tự làm cha của chính nó',
        });
      } else if (
        parentKey &&
        !rowByKey.has(parentKey) &&
        !parentByKey.has(parentKey)
      ) {
        errors.push({
          rowNumber: row.rowNumber,
          field: 'parentSlug',
          message: 'Không tìm thấy danh mục cha cùng loại',
        });
      }
      parentByKey.set(key, parentKey);
    }

    const visiting = new Set<string>();
    const visited = new Set<string>();
    const visit = (key: string): boolean => {
      if (visiting.has(key)) return true;
      if (visited.has(key)) return false;
      visiting.add(key);
      const parentKey = parentByKey.get(key);
      const cyclic = Boolean(parentKey && visit(parentKey));
      visiting.delete(key);
      visited.add(key);
      return cyclic;
    };

    for (const row of rows) {
      if (visit(toCategoryKey(row.type, row.slug))) {
        errors.push({
          rowNumber: row.rowNumber,
          field: 'parentSlug',
          message: 'Quan hệ danh mục cha tạo thành vòng lặp',
        });
        break;
      }
    }

    return errors;
  }

  private failure(errors: ExcelRowError[]): CategoryImportResult {
    return { created: 0, updated: 0, errors };
  }
}

function toCategoryKey(type: category_type, slug: string) {
  return `${type}:${slug}`;
}
