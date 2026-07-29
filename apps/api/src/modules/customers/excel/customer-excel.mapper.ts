import { CustomerExcelRow } from '@/modules/customers/excel/customer-excel.types';
import { Customer } from '@prisma/client';

export function toCustomerExcelRow(customer: Customer): CustomerExcelRow {
  return {
    customerCode: customer.customer_code,
    fullName: customer.full_name,
    phone: customer.phone ?? '',
    email: customer.email ?? '',
    address: customer.address ?? '',
  };
}
