import { ListCustomersDto } from '@/modules/customers/dto/list-customers.dto';
import { toCustomerExcelRow } from '@/modules/customers/excel/customer-excel.mapper';
import { createCustomerExportWorkbook } from '@/modules/customers/excel/customer-workbook.factory';
import { CustomersRepository } from '@/modules/customers/repository/customers.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ExportCustomersUseCase {
  constructor(private readonly customersRepository: CustomersRepository) {}

  async execute(dto: ListCustomersDto) {
    const customers = await this.customersRepository.listForExport(dto);
    return createCustomerExportWorkbook(customers.map(toCustomerExcelRow));
  }
}
