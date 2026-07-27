import { ListProductsDto } from '@/modules/products/dto/list-products.dto';
import { toProductExcelRow } from '@/modules/products/excel/product-excel.mapper';
import { createProductExportWorkbook } from '@/modules/products/excel/product-workbook.factory';
import { ProductsRepository } from '@/modules/products/repository/products.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ExportProductsUseCase {
  constructor(private readonly productsRepository: ProductsRepository) {}

  async execute(dto: ListProductsDto) {
    const products = await this.productsRepository.listForExport(dto);
    return createProductExportWorkbook(
      products.map((product) => toProductExcelRow(product)),
    );
  }
}
